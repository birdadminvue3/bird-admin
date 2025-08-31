import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export function configAutoImportPlugin() {
  return AutoImport({
    imports: ['vue', 'vue-router', '@vueuse/core', 'pinia', "vue-i18n"],
    resolvers: [ElementPlusResolver()],
    dts: 'src/types/auto-imports.d.ts',
    eslintrc: {
      // 这里先设置成true然后pnpm dev 运行之后会生成 .auto-import.json 文件之后，在改为false
      enabled: true,
      filepath: './.auto-import.json',
      globalsPropValue: true
    }
  })
}
