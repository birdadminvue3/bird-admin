/**
 * 全局类型声明，无需引入直接在 `.vue` 、`.ts` 、`.tsx` 文件使用即可获得类型提示
 */

declare global {
  /**
   * 平台的名称、版本、运行所需的`node`和`pnpm`版本、依赖、最后构建时间的类型提示
   */
  const __APP_INFO__: {
    pkg: {
      name: string;
      version: string;
      engines: {
        node: string;
        pnpm: string;
      };
      dependencies: Recordable<string>;
      devDependencies: Recordable<string>;
    };
    lastBuildTime: string;
  };
  /**
   * 系统设置
   */
  interface AppSettings {
    /** 系统标题 */
    title: string;
    /** 系统版本 */
    version: string;
    /** 是否显示设置 */
    showSettings: boolean;
    /** 是否显示多标签导航 */
    showTagsView: boolean;
    /** 是否显示应用Logo */
    showAppLogo: boolean;
    /** 导航栏布局(left|top|mix) */
    layout: "left" | "top" | "mix";
    /** 主题颜色 */
    themeColor: string;
    /** 主题模式(dark|light) */
    theme: import("@/enums/settings/theme.enum").ThemeMode;
    /** 布局大小(default |large |small) */
    size: string;
    /** 语言( zh-cn| en) */
    language: string;
    /** 是否显示水印 */
    showWatermark: boolean;
    /** 水印内容 */
    watermarkContent: string;
    /** 侧边栏配色方案 */
    sidebarColorScheme: "classic-blue" | "minimal-white";
  }
}