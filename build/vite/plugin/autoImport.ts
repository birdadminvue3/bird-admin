import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export function configAutoImportPlugin() {
  return AutoImport({
    imports: ['vue', 'vue-router', '@vueuse/core', 'pinia', "vue-i18n"],
    resolvers: [ElementPlusResolver()],
    dts: 'src/types/auto-imports.d.ts',
    eslintrc: {
      // .auto-import.json 已生成并提交，常驻开启会导致每次启动都产生无意义 diff
      enabled: false,
      filepath: './.auto-import.json',
      globalsPropValue: true
    }
  })
}


