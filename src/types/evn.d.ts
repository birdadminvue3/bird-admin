// https://cn.vitejs.dev/guide/env-and-mode

// TypeScript 类型提示都为 string： https://github.com/vitejs/vite/issues/6930
interface ImportMetaEnv {
  /** 开发环境读取配置文件路径 */
  VITE_BASE_PATH: number;
  /** 端口号 */
  VITE_PORT: number;
  /** 端口号 */
  VITE_API_URL: string;
  /** API 地址前缀 */
  VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * 平台的名称、版本、运行所需的`node`版本、依赖、构建时间的类型提示
 */
declare const __APP_INFO__: {
  pkg: {
    name: string;
    version: string;
    engines: {
      node: string;
    };
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  buildTimestamp: number;
};