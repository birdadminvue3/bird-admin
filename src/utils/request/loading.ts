// loading 管理：引用计数，避免并发请求闪烁
import { ElLoading } from 'element-plus';
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading';
import type { RequestOptions } from './types';

class LoadingManager {
  private loadingInstance: LoadingInstance | null = null;
  private count = 0;
  private defaultOptions = {
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)',
    fullscreen: true,
    lock: true,
  };

  public show(options?: RequestOptions): void {
    if (this.count === 0) {
      this.loadingInstance = ElLoading.service({
        text: options?.loadingText || this.defaultOptions.text,
        background: options?.loadingOptions?.background || this.defaultOptions.background,
        fullscreen:
          options?.loadingOptions?.fullscreen !== undefined
            ? options.loadingOptions.fullscreen
            : this.defaultOptions.fullscreen,
        lock:
          options?.loadingOptions?.lock !== undefined
            ? options.loadingOptions.lock
            : this.defaultOptions.lock,
      });
    }
    this.count++;
  }

  public hide(): void {
    if (this.count <= 0) return;
    this.count--;
    if (this.count === 0) {
      setTimeout(() => {
        if (this.count === 0 && this.loadingInstance) {
          this.loadingInstance.close();
          this.loadingInstance = null;
        }
      }, 300);
    }
  }

  public forceHide(): void {
    // 无论是否有实例都要把计数归零，否则后续计数会持续偏移
    this.count = 0;
    if (this.loadingInstance) {
      this.loadingInstance.close();
      this.loadingInstance = null;
    }
  }

  public isLoading(): boolean {
    return this.count > 0;
  }
}

export default new LoadingManager();
