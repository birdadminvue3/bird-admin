import { createApp } from 'vue'
import { router } from "@/router";

import App from './App.vue'
import setupPlugins from "@/plugins/index";

import "@styles/reset.scss";                // 引入重置样式
import '@/utils/console.ts'                 // 控制台输出内容
const app = createApp(App)

// 注册插件
app.use(setupPlugins);
app.use(router)
app.mount('#app')