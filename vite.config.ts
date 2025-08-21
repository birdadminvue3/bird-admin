import { defineConfig,loadEnv } from 'vite'
import type { ConfigEnv, UserConfig } from 'vite';

import { createViteResolve } from './build/vite/resolve';
import { createVitePlugins } from './build/vite/plugin';
import { createViteServer } from './build/vite/server';
import { createViteBuild } from './build/vite/build';

// https://vite.dev/config/
export default (configEnv: ConfigEnv):UserConfig => {
const { mode, command } = configEnv;
const root = process.cwd()
  const env = loadEnv(mode, root)
  const { VITE_VERSION, VITE_PORT, VITE_BASE_URL } = env
  const isBuild = command === 'build';
  return defineConfig({
    define: {
      __APP_VERSION__: JSON.stringify(VITE_VERSION)
    },
    base: VITE_BASE_URL,
    // 设为 false 可以避免 Vite 清屏而错过在终端中打印某些关键信息。命令行模式下请通过 --clearScreen false 设置。
    clearScreen: true,
    // 解析配置
    resolve: createViteResolve(mode, __dirname),
    // 插件配置
    plugins: createVitePlugins(isBuild, configEnv),
    // 服务配置
    server: createViteServer(Number(VITE_PORT)),
    // 打包配置
    build: createViteBuild(),
  })
}