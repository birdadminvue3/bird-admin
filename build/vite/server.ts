import type { ServerOptions } from 'vite';

/**
 * @param VITE_PORT 开发服务器端口
 * @param proxyTarget 代理目标；留空时不配置 proxy，请求由本地 mock 拦截
 */
export function createViteServer(
  VITE_PORT: number | undefined,
  proxyTarget?: string
): ServerOptions {
  const proxy: Record<string, any> = {};
  if (proxyTarget) {
    proxy['/api'] = {
      target: proxyTarget,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
    };
  }

  return {
    host: true,
    port: Number(VITE_PORT) || 9094,
    strictPort: false,
    proxy,
  };
}
