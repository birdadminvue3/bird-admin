import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import type { ConfigEnv, PluginOption } from 'vite';

import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { configInfoPlugin } from './info';                // 自定义插件 问候语，打包检测用时、大小
import { configAutoImportPlugin } from './autoImport';    // 'vue', 'vue-router', '@vueuse/core', 'pinia'
import { configMockPlugin } from './mock';                // mock支持仅用于本地开发，生产环境请务必删除 mock

import svgLoader from "vite-svg-loader";                  // svg组件化支持
import UnoCSS from 'unocss/vite'                          // UnoCSS 即时按需原子化 CSS 引擎

export function createVitePlugins(_isBuild = false, _configEnv: ConfigEnv) {
  const vitePlugins: PluginOption[] = [];

  vitePlugins.push(
    vue(),
    vueJsx(), // 如果需要
    UnoCSS(),
    // 组件自动导入
    Components({
      resolvers: [
        // 导入 Element Plus 组件
        ElementPlusResolver({ importStyle: "sass" }),
      ],
      // 指定自定义组件位置(默认:src/components)
      dirs: ["src/components", "src/**/components"],
      // 导入组件类型声明文件路径 (false:关闭自动生成)
      dts: false,
      // dts: "src/types/components.d.ts",
    }),
  );
  vitePlugins.push(configInfoPlugin());          // 自定义插件 问候语，打包检测用时、大小
  vitePlugins.push(configAutoImportPlugin());    // 'vue', 'vue-router', '@vueuse/core', 'pinia'
  vitePlugins.push(configMockPlugin(_isBuild)); // mock 仅在 dev 生效
  vitePlugins.push(svgLoader());                 // svg组件化支持

  return vitePlugins;
}