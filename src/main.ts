import { createApp } from 'vue'
import { router } from "@/router";


import App from './App.vue'

import '@/utils/console.ts'                 // 控制台输出内容
const app = createApp(App)

app.use(router)
app.mount('#app')