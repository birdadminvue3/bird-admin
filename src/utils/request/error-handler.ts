// 统一错误处理：HTTP 状态码、业务码、网络错误
import { isAxiosError } from 'axios';
import type { AxiosError } from 'axios';
import toastManager from './toast';
import networkManager from './network';

class ErrorHandler {
  private statusMap: Record<number, string> = {
    400: '请求参数错误',
    401: '未授权，请重新登录',
    403: '拒绝访问',
    404: '请求地址不存在',
    405: '请求方法不允许',
    408: '请求超时',
    409: '资源冲突',
    410: '资源已删除',
    413: '请求实体过大',
    429: '请求过于频繁',
    500: '服务器内部错误',
    501: '服务未实现',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时',
  };

  private businessErrorMap: Record<number, string> = {
    10001: '用户不存在',
    10002: '密码错误',
    10003: '账号已被禁用',
    10004: '权限不足',
    20001: '数据不存在',
    20002: '操作失败',
    30001: '系统繁忙，请稍后再试',
  };

  public handleStatusError(status: number, message: string, showErrorMessage = true): void {
    // 优先展示服务端返回的具体原因，默认文案仅作兜底
    const errorMessage = message || this.statusMap[status] || `Unknown error (${status})`;
    if (showErrorMessage) toastManager.error(errorMessage);
    console.error(`[HTTP Error ${status}]: ${errorMessage}`);
  }

  public handleBusinessError(code: number, message: string, showErrorMessage = true): void {
    const errorMessage = message || this.businessErrorMap[code] || `未知业务错误 (${code})`;
    if (showErrorMessage) toastManager.error(errorMessage);
    console.error(`[Business Error ${code}]: ${errorMessage}`);
  }

  public handleNetworkError(error: AxiosError, showErrorMessage = true): void {
    if (networkManager.getStatus() === 'offline') return;

    const reason = error.message || '';
    if (reason.includes('canceled') || reason.includes('aborted')) return;

    let message = '网络连接异常，请检查您的网络';
    if (reason.includes('timeout')) message = '网络请求超时，请稍后重试';

    if (showErrorMessage) toastManager.error(message);
    console.error('[Network Error]:', error);
  }

  /** 供业务代码手动调用的通用错误入口 */
  public handleError(error: unknown, showErrorMessage = true): void {
    if (isAxiosError(error)) {
      if (error.response) {
        this.handleStatusError(
          error.response.status,
          (error.response.data as any)?.message || error.message,
          showErrorMessage
        );
      } else {
        this.handleNetworkError(error, showErrorMessage);
      }
    } else {
      const message = (error as Error)?.message || '发生未知错误';
      if (showErrorMessage) toastManager.error(message);
      console.error('[Error]:', error);
    }
  }
}

export default new ErrorHandler();
