import type { App } from "vue";

import { setupI18n } from "@/locales";
import { setupElementPlusIcons } from "./elementPlusIcons";


export default {
  install(app: App<Element>) {
    // 国际化
    setupI18n(app);
    // Element-plus图标
    setupElementPlusIcons(app);
  }
}