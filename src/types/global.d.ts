/**
 * 全局类型声明，无需引入即可在 .vue / .ts / .tsx 中使用
 * 注意：必须带 export {} 让本文件成为模块，declare global 才会真正生效。
 */
export {};

declare global {
  type Recordable<T = any> = Record<string, T>;

  /** 由 vite.config.ts 的 define 注入 */
  const __APP_INFO__: {
    pkg: {
      name: string;
      version: string;
      engines: { node: string; pnpm?: string };
      dependencies: Recordable<string>;
      devDependencies: Recordable<string>;
    };
    buildTimestamp: number;
  };

  /** 系统设置。规划中但尚未实现的项保持可选 */
  interface AppSettings {
    title: string;
    version: string;
    theme: import('@/enums/settings/theme').ThemeMode;
    themeColor?: string;
    size: string;
    language: string;
    showWatermark: boolean;
    watermarkContent: string;
    showSettings?: boolean;
    showTagsView?: boolean;
    showAppLogo?: boolean;
    layout?: import('@/enums/settings/layout').LayoutMode;
    sidebarColorScheme?: import('@/enums/settings/theme').SidebarColor;
  }
}
