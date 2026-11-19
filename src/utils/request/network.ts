// 网络状态监测与离线请求队列
import type { NetworkStatus, PendingRequest } from './types';
import toastManager from './toast';

class NetworkManager {
  private status: NetworkStatus =
    typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline';
  private offlineQueue: PendingRequest[] = [];
  private listeners = new Set<(status: NetworkStatus) => void>();
  private initialized = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    this.initialized = true;
  }

  private handleOnline = (): void => {
    if (this.status === 'online') return;
    this.status = 'online';
    this.notifyStatusChange();

    if (this.offlineQueue.length > 0) {
      toastManager.info(`网络已恢复，正在处理 ${this.offlineQueue.length} 个待处理请求...`);
      void this.processOfflineQueue();
    } else {
      toastManager.success('网络已恢复连接');
    }
  };

  private handleOffline = (): void => {
    if (this.status === 'offline') return;
    this.status = 'offline';
    this.notifyStatusChange();
    toastManager.error('网络已断开，请检查您的网络连接', { duration: 0 });
  };

  private notifyStatusChange(): void {
    this.listeners.forEach(listener => listener(this.status));
  }

  /**
   * 网络恢复后重放队列。
   * 通过 replay 回调交回原 axios 实例，保留 baseURL、token、序列化与全部拦截器；
   * 不再使用裸 fetch 拼凑请求。
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.status !== 'online' || this.offlineQueue.length === 0) return;

    const queue = this.offlineQueue.splice(0);
    for (const item of queue) {
      try {
        item.resolve(await item.replay(item.config));
      } catch (error) {
        item.reject(error);
      }
    }
  }

  public addStatusChangeListener(listener: (status: NetworkStatus) => void): void {
    this.listeners.add(listener);
  }

  public removeStatusChangeListener(listener: (status: NetworkStatus) => void): void {
    this.listeners.delete(listener);
  }

  public getStatus(): NetworkStatus {
    return this.status;
  }

  public addToOfflineQueue(request: PendingRequest): void {
    this.offlineQueue.push(request);
    toastManager.warning(
      `网络离线中，请求已加入队列，恢复网络后将自动发送 (${this.offlineQueue.length})`
    );
  }

  public clearOfflineQueue(): void {
    this.offlineQueue.forEach(item => item.reject(new Error('Offline request queue cleared')));
    this.offlineQueue = [];
  }

  public getOfflineQueueLength(): number {
    return this.offlineQueue.length;
  }
}

export default new NetworkManager();
