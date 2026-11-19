// token 管理：存取、过期判断与并发刷新
import type { BaseResponse } from './types';
import toastManager from './toast';

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  /** 有效期，单位秒 */
  expiresIn: number;
  tokenType?: string;
}

interface RefreshSubscriber {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

class TokenManager {
  private TOKEN_KEY = 'AUTH_TOKEN';
  private REFRESH_TOKEN_KEY = 'REFRESH_TOKEN';
  private TOKEN_EXPIRES_KEY = 'TOKEN_EXPIRES_AT';

  private isRefreshing = false;
  private subscribers: RefreshSubscriber[] = [];

  public setToken(tokenInfo: TokenInfo): void {
    localStorage.setItem(this.TOKEN_KEY, tokenInfo.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenInfo.refreshToken);
    const expiresAt = Date.now() + tokenInfo.expiresIn * 1000;
    localStorage.setItem(this.TOKEN_EXPIRES_KEY, String(expiresAt));
  }

  public getAccessToken(): string {
    return localStorage.getItem(this.TOKEN_KEY) || '';
  }

  public getRefreshToken(): string {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || '';
  }

  public clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
  }

  /** 是否已过期 */
  public isExpired(): boolean {
    const expiresAt = Number(localStorage.getItem(this.TOKEN_EXPIRES_KEY) || 0);
    return expiresAt ? Date.now() >= expiresAt : false;
  }

  /** 是否将在 5 分钟内过期 */
  public isTokenExpiringSoon(): boolean {
    const expiresAt = Number(localStorage.getItem(this.TOKEN_EXPIRES_KEY) || 0);
    return expiresAt ? Date.now() > expiresAt - 5 * 60 * 1000 : false;
  }

  /**
   * 刷新 token。并发请求会挂到订阅队列上；
   * 无论成功还是失败都会通知全部订阅者，避免请求永久挂起。
   */
  public async refreshToken(
    refreshRequest: (token: string) => Promise<BaseResponse<TokenInfo>>
  ): Promise<string> {
    if (this.isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        this.subscribers.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await refreshRequest(refreshToken);
      const code = Number(response?.code);
      if ((code === 200 || code === 0) && response.data?.accessToken) {
        this.setToken(response.data);
        this.onRefreshed(response.data.accessToken);
        return response.data.accessToken;
      }
      throw new Error(response?.message || 'Token refresh failed');
    } catch (error) {
      this.clearToken();
      this.onRefreshFailed(error);
      toastManager.error('登录已过期，请重新登录');
      // 项目使用 hash 路由，必须跳 /#/login 而不是 /login
      setTimeout(() => this.redirectToLogin(), 1500);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  private onRefreshed(token: string): void {
    const pending = this.subscribers.splice(0);
    pending.forEach(item => item.resolve(token));
  }

  private onRefreshFailed(error: unknown): void {
    const pending = this.subscribers.splice(0);
    pending.forEach(item => item.reject(error));
  }

  private redirectToLogin(): void {
    if (typeof window === 'undefined' || window.location.hash.startsWith('#/login')) return;
    window.location.replace(`${window.location.pathname}${window.location.search}#/login`);
  }
}

export default new TokenManager();
