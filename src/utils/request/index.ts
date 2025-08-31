// 导出请求实例
import Request from './request';
import type { CustomAxiosRequestConfig, RequestOptions } from './types';
import loadingManager from './loading';
import toastManager from './toast';
import networkManager from './network';
import tokenManager from './token-manager';

// 创建默认实例
const request = new Request();

// 导出请求实例、类、工具类和类型
export { 
  request,
  Request,
  loadingManager,
  toastManager,
  networkManager,
  tokenManager,
  type CustomAxiosRequestConfig,
  type RequestOptions 
};

export default request;
