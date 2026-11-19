/// <reference types="vite/client" />

// Vite 环境变量统一声明；__APP_INFO__ 已在 global.d.ts 中声明，此处不再重复
interface ImportMetaEnv {
  /** 打包基础路径 */
  readonly VITE_BASE_PATH: string;
  /** 开发服务器端口 */
  readonly VITE_PORT: string;
  /** 接口基础地址，例如 /api 或完整域名 */
  readonly VITE_API_BASE_URL: string;
  /** 开发代理目标，留空表示不启用代理（走本地 mock） */
  readonly VITE_API_PROXY_TARGET: string;
  /** 生产构建是否移除 console */
  readonly VITE_DROP_CONSOLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
