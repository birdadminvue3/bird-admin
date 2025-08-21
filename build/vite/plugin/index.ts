import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import type { ConfigEnv, PluginOption } from 'vite';

import { configInfoPlugin } from './info';                // 自定义插件 问候语，打包检测用时、大小
import { configAutoImportPlugin } from './autoImport';    // 'vue', 'vue-router', '@vueuse/core', 'pinia'
import { configMockPlugin } from './mock';                // mock支持仅用于本地开发，生产环境请务必删除 mock
import svgLoader from "vite-svg-loader";                  // svg组件化支持

export function createVitePlugins(_isBuild = false, configEnv: ConfigEnv) {

  const vitePlugins: PluginOption[] = [];

  vitePlugins.push(
    vue(),
    vueJsx(), // 如果需要
  );
  vitePlugins.push(configInfoPlugin());          // 自定义插件 问候语，打包检测用时、大小
  vitePlugins.push(configAutoImportPlugin());    // 'vue', 'vue-router', '@vueuse/core', 'pinia'
  vitePlugins.push(configMockPlugin());          // mock支持仅用于本地开发，生产环境请务必删除 mock
  vitePlugins.push(svgLoader());                 // svg组件化支持

  return vitePlugins;
}