// 核心请求类：拦截器、loading、取消、错误、离线队列与 token 刷新
import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type {
  CustomAxiosRequestConfig,
  CustomInternalAxiosRequestConfig,
  BaseResponse,
  RequestOptions,
} from './types';
import type { TokenInfo } from './token-manager';
import axiosCanceler from './cancel';
import loadingManager from './loading';
import errorHandler from './error-handler';
import tokenManager from './token-manager';
import toastManager from './toast';
import networkManager from './network';

const DEFAULT_REQUEST_OPTIONS: RequestOptions = {
  showLoading: true,
  loadingText: '加载中...',
  cancelRepeatRequest: true,
  autoRefreshToken: true,
  handleErrorStatus: true,
  showErrorMessage: true,
  queueWhenOffline: true,
  retryCount: 0,
  retryDelay: 1000,
  cacheBust: false,
  skipBusinessCheck: false,
};

class Request {
  private axiosInstance: AxiosInstance;
  private defaultConfig: Omit<CustomAxiosRequestConfig, 'requestOptions'>;
  private defaultRequestOptions: RequestOptions;

  constructor(config: CustomAxiosRequestConfig = {}) {
    this.defaultConfig = {
      // 与 .env 中的 VITE_API_BASE_URL 保持一致；url 不要再带 /api 前缀
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 15000,
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
    };

    // 自定义选项单独管理，不塞进 axios.create（axios 不认识该字段）
    this.defaultRequestOptions = { ...DEFAULT_REQUEST_OPTIONS, ...config.requestOptions };
    const { requestOptions: _instanceOptions, ...axiosConfig } = config;
    this.axiosInstance = axios.create({ ...this.defaultConfig, ...axiosConfig });

    this.setupInterceptors();
    this.setupNetworkListener();
  }

  private setupNetworkListener(): void {
    networkManager.addStatusChangeListener(status => {
      if (status === 'offline') loadingManager.forceHide();
    });
  }

  /** 把实例默认值与单次请求值合并，保证每个请求拿到完整选项 */
  private resolveOptions(config?: { requestOptions?: RequestOptions }): RequestOptions {
    return { ...this.defaultRequestOptions, ...config?.requestOptions };
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      rawConfig => {
        const config = rawConfig as CustomInternalAxiosRequestConfig;
        config.requestOptions = this.resolveOptions(config);
        const opt = config.requestOptions;

        if (opt.showLoading) loadingManager.show(opt);
        if (opt.cancelRepeatRequest) axiosCanceler.addPending(config);
        if (opt.timeout) config.timeout = opt.timeout;

        const token = tokenManager.getAccessToken();
        if (token) config.headers.set('Authorization', `Bearer ${token}`);

        if (config.method?.toUpperCase() === 'GET' && opt.cacheBust) {
          config.params = { ...config.params, _t: Date.now() };
        }

        // 仅当已有 token、且不是刷新后的重放请求时后台续期
        if (token && opt.autoRefreshToken && !config.retryAfterRefresh && tokenManager.isTokenExpiringSoon()) {
          void this.refreshTokenInBackground();
        }

        return config;
      },
      (error: AxiosError) => {
        loadingManager.forceHide();
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const config = response.config as CustomInternalAxiosRequestConfig;
        const opt = this.resolveOptions(config);

        if (opt.cancelRepeatRequest) axiosCanceler.removePending(config);
        if (opt.showLoading) loadingManager.hide();

        // 二进制响应返回完整 AxiosResponse，供 download() 读取 headers；
        // 不再依赖 content-type 白名单判断，zip/csv/自定义类型同样可用。
        if (config.responseType === 'blob' || config.responseType === 'arraybuffer') {
          return response;
        }

        const data = response.data;
        const hasBusinessCode =
          data !== null &&
          typeof data === 'object' &&
          !Array.isArray(data) &&
          'code' in data;

        if (opt.handleErrorStatus && !opt.skipBusinessCheck && hasBusinessCode) {
          const { code, message } = data as BaseResponse;
          if (Number(code) !== 200 && Number(code) !== 0) {
            errorHandler.handleBusinessError(Number(code), message, opt.showErrorMessage);
            const err = new Error(message || '业务请求失败') as Error & {
              code?: number;
              data?: unknown;
            };
            err.code = Number(code);
            err.data = (data as BaseResponse).data;
            return Promise.reject(err);
          }
        }

        return data;
      },
      async (error: AxiosError) => {
        const config = error.config as CustomInternalAxiosRequestConfig | undefined;
        if (!config) {
          loadingManager.forceHide();
          return Promise.reject(error);
        }

        const opt = this.resolveOptions(config);
        if (opt.cancelRepeatRequest) axiosCanceler.removePending(config);
        if (opt.showLoading) loadingManager.hide();

        if (opt.errorHandler) {
          opt.errorHandler(error);
          return Promise.reject(error);
        }

        // 自动重试：仅网络错误或 5xx，401 交给刷新流程
        const retryCount = config.retryCount || 0;
        const maxRetries = opt.retryCount || 0;
        const canRetry = !error.response || error.response.status >= 500;
        if (maxRetries > 0 && retryCount < maxRetries && canRetry) {
          const retryConfig = {
            ...config,
            retryCount: retryCount + 1,
          } as CustomInternalAxiosRequestConfig;
          if (opt.retryDelay) await new Promise(resolve => setTimeout(resolve, opt.retryDelay));
          return this.axiosInstance.request(retryConfig);
        }

        if (error.response?.status === 401) {
          const canRefresh =
            opt.autoRefreshToken && !config.retryAfterRefresh && tokenManager.getRefreshToken();
          if (canRefresh) {
            try {
              const newToken = await this.refreshToken();
              if (newToken) {
                config.retryAfterRefresh = true;
                config.headers.set('Authorization', `Bearer ${newToken}`);
                return this.axiosInstance.request(config);
              }
            } catch (refreshError) {
              return Promise.reject(refreshError);
            }
          }
          tokenManager.clearToken();
          this.redirectToLogin();
        }

        if (error.response && opt.handleErrorStatus) {
          errorHandler.handleStatusError(
            error.response.status,
            (error.response.data as any)?.message || error.message,
            opt.showErrorMessage
          );
        } else if (error.request) {
          errorHandler.handleNetworkError(error, opt.showErrorMessage);
        } else if (opt.showErrorMessage) {
          toastManager.error(error.message || '发生未知错误');
        }

        return Promise.reject(error);
      }
    );
  }

  private redirectToLogin(): void {
    if (typeof window === 'undefined' || window.location.hash.startsWith('#/login')) return;
    window.location.replace(`${window.location.pathname}${window.location.search}#/login`);
  }

  private async refreshTokenInBackground(): Promise<void> {
    try {
      await this.refreshToken();
    } catch {
      // 后台续期失败不打断当前请求，真正失效时由 401 流程统一处理
    }
  }

  private async refreshToken(): Promise<string> {
    return tokenManager.refreshToken(async refreshToken => {
      // 用原生 axios 避免再次进入实例拦截器造成循环；url 相对 baseURL，不带 /api 前缀
      const response = await axios.post<BaseResponse<TokenInfo>>(
        '/auth/refresh-token',
        { refreshToken },
        {
          baseURL: this.defaultConfig.baseURL,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return response.data;
    });
  }

  /** 统一请求入口：在这里处理离线队列，拦截器不再返回伪造的 config */
  public request<T = any>(config: CustomAxiosRequestConfig): Promise<T> {
    const opt = this.resolveOptions(config);
    if (networkManager.getStatus() === 'offline' && opt.queueWhenOffline) {
      return new Promise<T>((resolve, reject) => {
        networkManager.addToOfflineQueue({
          config,
          resolve,
          reject,
          replay: c => this.axiosInstance.request(c),
        });
      });
    }
    return this.axiosInstance.request<any, T>(config);
  }

  public get<T = any>(url: string, params?: any, config?: CustomAxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url, params: params ?? config?.params });
  }

  public post<T = any>(url: string, data?: any, config?: CustomAxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  public put<T = any>(url: string, data?: any, config?: CustomAxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  public delete<T = any>(url: string, data?: any, config?: CustomAxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url, data });
  }

  public upload<T = any>(
    url: string,
    file: File | FormData,
    config?: CustomAxiosRequestConfig
  ): Promise<T> {
    let formData: FormData;
    if (file instanceof FormData) {
      formData = file;
    } else {
      formData = new FormData();
      formData.append('file', file);
    }
    // 不显式设置 Content-Type：由浏览器自动生成带 boundary 的 multipart 头
    return this.request<T>({ ...config, method: 'POST', url, data: formData });
  }

  public uploadMultiple<T = any>(
    url: string,
    files: File[],
    fileField = 'files',
    config?: CustomAxiosRequestConfig
  ): Promise<T> {
    const formData = new FormData();
    files.forEach((file, index) => formData.append(`${fileField}[${index}]`, file));
    return this.upload<T>(url, formData, config);
  }

  public async download(
    url: string,
    params?: any,
    config?: CustomAxiosRequestConfig
  ): Promise<Blob> {
    const response = await this.request<AxiosResponse<Blob>>({
      ...config,
      method: 'GET',
      url,
      params,
      responseType: 'blob',
    });

    // 直接使用服务端返回的 Blob，保留原始 MIME 类型
    const raw = response.data;
    const blob = raw instanceof Blob ? raw : new Blob([raw]);
    const fileName =
      config?.requestOptions?.fileName || this.parseFileName(response.headers) || 'download';

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 100);

    return blob;
  }

  private parseFileName(headers: AxiosResponse['headers']): string {
    const disposition = headers?.['content-disposition'] as string | undefined;
    if (!disposition) return '';

    // RFC 5987: filename*=UTF-8''%E6%8A%A5%E8%A1%A8.xlsx
    const utf8Match = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(disposition);
    if (utf8Match?.[1]) {
      try {
        return decodeURIComponent(utf8Match[1].replace(/['"]/g, '').trim());
      } catch {
        // 解码失败时回退到普通 filename
      }
    }

    const plainMatch = /filename[^;=\n]*=\s*(?:(['"])(.*?)\1|([^;\n]*))/i.exec(disposition);
    const value = (plainMatch?.[2] ?? plainMatch?.[3] ?? '').trim();
    try {
      return decodeURIComponent(value.replace(/['"]/g, ''));
    } catch {
      return value.replace(/['"]/g, '');
    }
  }

  public exportExcel(url: string, params?: any, fileName = 'export.xlsx'): Promise<Blob> {
    return this.download(url, params, {
      requestOptions: {
        fileName,
        showLoading: true,
        loadingText: '正在导出数据，请稍候...',
      },
    });
  }

  public cancelAllRequests(message = 'Request canceled'): void {
    axiosCanceler.clearPending(message);
  }

  public clearOfflineQueue(): void {
    networkManager.clearOfflineQueue();
  }
}

export default Request;
