// 消息提示管理
import { ElMessage, ElMessageBox } from 'element-plus';
import type { MessageProps } from 'element-plus';

/**
 * Toast消息管理类
 * 统一管理消息提示，防止重复提示，支持配置化
 */
class ToastManager {
  private messageInstance: { close: () => void } | null = null;
  
  /**
   * 显示消息
   * @param message 消息内容
   * @param type 消息类型 
   * @param options 配置选项
   */
  public show(
    message: string, 
    type: 'success' | 'warning' | 'info' | 'error' = 'info',
    options: Partial<MessageProps> = {}
  ): void {
    // 关闭已存在的消息，避免堆叠
    this.clear();
    
    const defaultOptions: Partial<MessageProps> = {
      duration: type === 'error' ? 5000 : 3000,
      showClose: true,
      grouping: true
    };
    
    this.messageInstance = ElMessage({
      message,
      type,
      ...defaultOptions,
      ...options
    });
  }
  
  /**
   * 显示成功消息
   */
  public success(message: string, options?: Partial<MessageProps>): void {
    this.show(message, 'success', options);
  }
  
  /**
   * 显示错误消息
   */
  public error(message: string, options?: Partial<MessageProps>): void {
    this.show(message, 'error', options);
  }
  
  /**
   * 显示警告消息
   */
  public warning(message: string, options?: Partial<MessageProps>): void {
    this.show(message, 'warning', options);
  }
  
  /**
   * 显示信息消息
   */
  public info(message: string, options?: Partial<MessageProps>): void {
    this.show(message, 'info', options);
  }
  
  /**
   * 显示确认对话框
   */
  public async confirm(
    message: string, 
    title: string = '提示', 
    options: any = {}
  ): Promise<boolean> {
    try {
      await ElMessageBox.confirm(message, title, {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        ...options
      });
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * 清除当前显示的消息
   */
  public clear(): void {
    if (this.messageInstance) {
      this.messageInstance.close();
      this.messageInstance = null;
    }
  }
}

export default new ToastManager();
