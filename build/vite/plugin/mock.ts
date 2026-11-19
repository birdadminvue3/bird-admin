/** 本地 mock 仅用于开发；生产构建不注入，避免把假登录接口带上线 */
import { vitePluginFakeServer } from 'vite-plugin-fake-server';
import type { PluginOption } from 'vite';

export function configMockPlugin(isBuild: boolean): PluginOption {
  if (isBuild) return null;
  return vitePluginFakeServer({
    logger: false,
    include: 'mock',
    infixName: false,
    enableProd: false,
  });
}
