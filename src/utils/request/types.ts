// 请求层类型定义
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

/**
 * 单个请求的可选行为配置。
 * 每个请求都会与实例默认配置合并，调用方只需传需要覆盖的字段。
 */
export interface RequestOptions {
  /** 是否显示全屏 loading，默认 true */
  showLoading?: boolean;
  /** loading 文案 */
  loadingText?: string;
  /** loading 的额外配置 */
  loadingOptions?: {
    lock?: boolean;
    background?: string;
    fullscreen?: boolean;
  };
  /** 是否自动取消重复请求，默认 true */
  cancelRepeatRequest?: boolean;
  /** 401 时是否自动刷新 token，默认 true */
  autoRefreshToken?: boolean;
  /** 是否统一处理 HTTP / 业务错误码，默认 true */
  handleErrorStatus?: boolean;
  /** 是否弹出错误提示，默认 true */
  showErrorMessage?: boolean;
  /** 自定义错误处理；设置后跳过内置提示 */
  errorHandler?: (error: unknown) => void;
  /** 覆盖本次请求的超时时间(ms) */
  timeout?: number;
  /** 断网时是否进入离线队列，默认 true */
  queueWhenOffline?: boolean;
  /** 失败自动重试次数，默认 0 */
  retryCount?: number;
  /** 重试间隔(ms)，默认 1000 */
  retryDelay?: number;
  /** GET 请求是否追加时间戳禁用缓存，默认 false */
  cacheBust?: boolean;
  /** 跳过业务码判定（返回体不是 BaseResponse 时使用） */
  skipBusinessCheck?: boolean;
  /** 下载时的文件名 */
  fileName?: string;
}

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  requestOptions?: RequestOptions;
}

export interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  requestOptions?: RequestOptions;
  /** 取消重复请求时生成的 key */
  requestId?: string;
  /** 当前已重试次数 */
  retryCount?: number;
  /** 已因 token 刷新重放过，避免 401 死循环 */
  retryAfterRefresh?: boolean;
}

/** 后端统一响应结构 */
export interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

export type NetworkStatus = 'online' | 'offline' | 'unknown';

/** 离线队列中的请求：replay 用原 axios 实例重放，保证走完整拦截器链 */
export interface PendingRequest {
  config: CustomAxiosRequestConfig;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  replay: (config: CustomAxiosRequestConfig) => Promise<any>;
}
