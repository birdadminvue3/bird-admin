// loading 管理
import { ElLoading } from 'element-plus';
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading';
import type { RequestOptions } from './types';

/**
 * Loading管理类
 * 支持配置化和计数功能，防止多个请求导致的闪烁问题
 */
class LoadingManager {
  private loadingInstance: LoadingInstance | null = null;
  private count = 0;
  private defaultOptions = {
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)',
    fullscreen: true,
    lock: true
  };

  /**
   * 显示loading
   * @param options 自定义配置选项
   */
  public show(options?: RequestOptions): void {
    if (this.count === 0) {
      const loadingOptions = {
        text: options?.loadingText || this.defaultOptions.text,
        background: options?.loadingOptions?.background || this.defaultOptions.background,
        fullscreen: options?.loadingOptions?.fullscreen !== undefined 
          ? options.loadingOptions.fullscreen 
          : this.defaultOptions.fullscreen,
        lock: options?.loadingOptions?.lock !== undefined 
          ? options.loadingOptions.lock 
          : this.defaultOptions.lock
      };
      
      this.loadingInstance = ElLoading.service(loadingOptions);
    }
    this.count++;
  }

  /**
   * 隐藏loading
   */
  public hide(): void {
    if (this.count <= 0) return;
    
    this.count--;
    if (this.count === 0) {
      setTimeout(() => {
        // 延迟关闭，防止闪烁
        if (this.count === 0 && this.loadingInstance) {
          this.loadingInstance.close();
          this.loadingInstance = null;
        }
      }, 300);
    }
  }

  /**
   * 强制隐藏所有loading
   */
  public forceHide(): void {
    if (this.loadingInstance) {
      this.count = 0;
      this.loadingInstance.close();
      this.loadingInstance = null;
    }
  }
  
  /**
   * 获取当前loading状态
   */
  public isLoading(): boolean {
    return this.count > 0;
  }
}

export default new LoadingManager();
