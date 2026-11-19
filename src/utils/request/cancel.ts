// 取消请求控制器
import type { CustomInternalAxiosRequestConfig } from './types';

/**
 * 管理重复请求与手动取消。
 * 关键修复：removePending 只清理「自己」的 controller，不再无条件 abort，
 * 否则同 key 的后发请求会被先发请求的响应误杀。
 */
class AxiosCanceler {
  private pendingMap = new Map<string, AbortController>();

  private generateRequestKey(config: CustomInternalAxiosRequestConfig): string {
    const { method, url, params, data } = config;
    let dataKey = '';

    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      // 二进制体无法稳定序列化，不参与重复判定，避免上传互相取消
      dataKey = `[FormData]:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    } else if (data !== undefined) {
      try {
        dataKey = JSON.stringify(data);
      } catch {
        dataKey = String(data);
      }
    }

    let paramsKey: string;
    try {
      paramsKey = JSON.stringify(params ?? null);
    } catch {
      paramsKey = String(params);
    }

    return [method, url, paramsKey, dataKey].join('&');
  }

  /** 注册请求，并取消同 key 的旧请求 */
  public addPending(config: CustomInternalAxiosRequestConfig): void {
    const requestKey = this.generateRequestKey(config);
    const previous = this.pendingMap.get(requestKey);
    if (previous) {
      previous.abort('Request canceled due to duplicate request');
      this.pendingMap.delete(requestKey);
    }

    const controller = new AbortController();
    config.signal = controller.signal;
    config.requestId = requestKey;
    this.pendingMap.set(requestKey, controller);
  }

  /** 请求结束时移除登记，不触发 abort */
  public removePending(config: CustomInternalAxiosRequestConfig): void {
    const requestKey = config.requestId || this.generateRequestKey(config);
    const controller = this.pendingMap.get(requestKey);
    if (controller && controller.signal === config.signal) {
      this.pendingMap.delete(requestKey);
    }
  }

  /** 主动取消全部进行中的请求 */
  public clearPending(message = 'Request canceled'): void {
    this.pendingMap.forEach(controller => controller.abort(message));
    this.pendingMap.clear();
  }

  public getPendingCount(): number {
    return this.pendingMap.size;
  }
}

export default new AxiosCanceler();
