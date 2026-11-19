import { createApp } from "vue";
import { router } from "@/router";
import App from "./App.vue";
import setupPlugins from "@/plugins/index";
import { setupStore } from "@/store";
import "virtual:uno.css"; // UnoCSS 即时按需原子化 CSS 引擎
import "@styles/reset.scss"; // 引入重置样式
import "@styles/layout.scss"; // 布局与主题样式（三种菜单模式 / 暗黑 / 侧边栏配色）
import "@styles/theme-transition.scss"; // 主题切换的 View Transition 特效
import "element-plus/theme-chalk/dark/css-vars.css"; // Element Plus 暗黑主题变量
import "@/utils/console.ts"; // 控制台输出内容

const app = createApp(App);

// Pinia 必须先注册，组件内才能直接使用 useXxxStore()
setupStore(app);
app.use(setupPlugins);
app.use(router);
app.mount("#app");
