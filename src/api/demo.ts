import { request } from '@/utils/request';

/**
 * 1.普通请求
 */
// 获取用户列表
const getUserList = async () => {
  try {
    const res = await request.get('/api/users', { page: 1, limit: 10 });
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return [];
  }
};

// 创建用户（不显示loading）
const createUser = async (userData: any) => {
  try {
    const res = await request.post('/api/users', userData, {
      requestOptions: {
        showLoading: false
      }
    });
    return res.data;
  } catch (error) {
    return null;
  }
};

// 上传文件（自定义loading文本）
const uploadAvatar = async (file: File) => {
  try {
    const res = await request.upload('/api/upload/avatar', file, {
      requestOptions: {
        loadingText: '正在上传头像...'
      }
    });
    return res.data.url;
  } catch (error) {
    return '';
  }
};

// 下载文件（自定义文件名）
const downloadReport = async () => {
  try {
    await request.download('/api/reports/export', { id: 123 }, {
      requestOptions: {
        fileName: '报表.xlsx',
        loadingText: '正在生成报表...'
      }
    });
  } catch (error) {
    console.error('下载报表失败:', error);
  }
};

/**
 * 2.自定义配置
 * */

import { Request } from '@/utils/request';

// 创建具有不同配置的请求实例
const customRequest = new Request({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  requestOptions: {
    showLoading: false,      // 默认不显示loading
    showErrorMessage: true,  // 显示错误提示
    retryCount: 3,           // 失败自动重试3次
    retryDelay: 1000,        // 重试间隔1秒
    queueWhenOffline: true   // 离线时加入队列
  }
});

// 使用自定义实例
const fetchData = async () => {
  const res = await customRequest.get('/data');
  return res.data;
};


/**
 * 3.高级功能使用
 * */
// import { request, loadingManager, toastManager, tokenManager } from '@/utils/request';
import { loadingManager, toastManager, tokenManager } from '@/utils/request';

// 手动控制loading
const complexOperation = async () => {
  loadingManager.show();
  try {
    // 执行多个请求
    const [result1, result2] = await Promise.all([
      request.get('/api/data1', {}, { requestOptions: { showLoading: false } }),
      request.get('/api/data2', {}, { requestOptions: { showLoading: false } })
    ]);
    
    // 处理成功情况
    toastManager.success('操作成功完成');
    return { result1, result2 };
  } catch (error) {
    toastManager.error('操作失败，请重试');
    return null;
  } finally {
    loadingManager.hide();
  }
};

// 自行处理token刷新
const refreshMyToken = async () => {
  try {
    await tokenManager.refreshToken(async (refreshToken) => {
      const response = await request.post(
        '/api/auth/refresh-token',
        { refreshToken },
        { requestOptions: { autoRefreshToken: false } } // 避免循环
      );
      return response;
    });
    toastManager.success('Token已更新');
    return true;
  } catch (error) {
    return false;
  }
};

// 批量上传文件并显示进度
const uploadFiles = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`files[${index}]`, file);
  });
  
  try {
    const result = await request.request({
      method: 'POST',
      url: '/api/upload/batch',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 100)
        );
        console.log(`上传进度: ${percentCompleted}%`);
        // 这里可以更新UI进度条
      },
      requestOptions: {
        showLoading: false // 使用自定义进度条，不显示loading
      }
    });
    
    toastManager.success(`成功上传 ${files.length} 个文件`);
    return result.data;
  } catch (error) {
    toastManager.error('文件上传失败');
    return null;
  }
};
