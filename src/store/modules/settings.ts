import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { defaultSettings } from "@/config/index";
import { store } from "@/store";
import { ThemeMode, LayoutMode, SidebarColor, SidebarStatus, ComponentSize, TagsStyle } from "@/enums/index";

export type SettingState = {
  title: string;
  theme: ThemeMode;
  /** 主题色（element-plus 主色） */
  themeColor: string;
  /** 菜单布局：left / top / mix */
  layout: LayoutMode;
  /** 侧边栏配色：classic-blue / minimal-white */
  sidebarColorScheme: SidebarColor;
  /** 侧边栏展开状态 */
  sidebarStatus: SidebarStatus;
  /** 固定头部 */
  fixedHeader: boolean;
  /** 显示 Logo */
  showLogo: boolean;
  /** 显示面包屑 */
  showBreadcrumb: boolean;
  /** 显示页签 */
  showTagsView: boolean;
  /** 页签风格：smart / card / chrome */
  tagsStyle: TagsStyle;
  /** 显示水印 */
  showWatermark: boolean;
  /** 组件尺寸 */
  size: ComponentSize;
};

const STORAGE_PREFIX = "bird-setting";

/** 模块级持久化 ref：与 app store 保持一致，刷新后不丢失 */
const layout = useStorage<LayoutMode>(`${STORAGE_PREFIX}-layout`, defaultSettings.layout || LayoutMode.LEFT);
const theme = useStorage<ThemeMode>(`${STORAGE_PREFIX}-theme`, defaultSettings.theme);
const themeColor = useStorage<string>(`${STORAGE_PREFIX}-theme-color`, defaultSettings.themeColor || "#409EFF");
const sidebarColorScheme = useStorage<SidebarColor>(
  `${STORAGE_PREFIX}-sidebar-color`,
  defaultSettings.sidebarColorScheme || SidebarColor.CLASSIC_BLUE
);
const sidebarStatus = useStorage<SidebarStatus>(`${STORAGE_PREFIX}-sidebar-status`, SidebarStatus.OPENED);
const fixedHeader = useStorage<boolean>(`${STORAGE_PREFIX}-fixed-header`, true);
const showLogo = useStorage<boolean>(`${STORAGE_PREFIX}-show-logo`, true);
const showBreadcrumb = useStorage<boolean>(`${STORAGE_PREFIX}-show-breadcrumb`, true);
const showTagsView = useStorage<boolean>(`${STORAGE_PREFIX}-show-tags-view`, true);
const tagsStyle = useStorage<TagsStyle>(`${STORAGE_PREFIX}-tags-style`, TagsStyle.SMART);
const showWatermark = useStorage<boolean>(`${STORAGE_PREFIX}-show-watermark`, defaultSettings.showWatermark);
const size = useStorage<ComponentSize>(`${STORAGE_PREFIX}-size`, defaultSettings.size as ComponentSize);

export const useSettingStore = defineStore("bird-setting", {
  state: (): SettingState => ({
    title: defaultSettings.title,
    theme: theme.value,
    themeColor: themeColor.value,
    layout: layout.value,
    sidebarColorScheme: sidebarColorScheme.value,
    sidebarStatus: sidebarStatus.value,
    fixedHeader: fixedHeader.value,
    showLogo: showLogo.value,
    showBreadcrumb: showBreadcrumb.value,
    showTagsView: showTagsView.value,
    tagsStyle: tagsStyle.value,
    showWatermark: showWatermark.value,
    size: size.value,
  }),
  getters: {
    getTitle(state) {
      return state.title;
    },
    /** 侧边栏是否折叠 */
    isCollapse(state) {
      return state.sidebarStatus === SidebarStatus.CLOSED;
    },
  },
  actions: {
    updateTheme(newTheme: ThemeMode) {
      this.theme = newTheme;
      theme.value = newTheme;
    },
    updateThemeColor(color: string) {
      this.themeColor = color;
      themeColor.value = color;
    },
    setLayout(mode: LayoutMode) {
      this.layout = mode;
      layout.value = mode;
    },
    setSidebarColorScheme(scheme: SidebarColor) {
      this.sidebarColorScheme = scheme;
      sidebarColorScheme.value = scheme;
    },
    toggleSidebar() {
      const next = this.sidebarStatus === SidebarStatus.OPENED ? SidebarStatus.CLOSED : SidebarStatus.OPENED;
      this.sidebarStatus = next;
      sidebarStatus.value = next;
    },
    setSidebarStatus(status: SidebarStatus) {
      this.sidebarStatus = status;
      sidebarStatus.value = status;
    },
    setFixedHeader(value: boolean) {
      this.fixedHeader = value;
      fixedHeader.value = value;
    },
    setShowLogo(value: boolean) {
      this.showLogo = value;
      showLogo.value = value;
    },
    setShowBreadcrumb(value: boolean) {
      this.showBreadcrumb = value;
      showBreadcrumb.value = value;
    },
    setShowTagsView(value: boolean) {
      this.showTagsView = value;
      showTagsView.value = value;
    },
    setTagsStyle(value: TagsStyle) {
      this.tagsStyle = value;
      tagsStyle.value = value;
    },
    updateShowWatermark(value: boolean) {
      this.showWatermark = value;
      showWatermark.value = value;
    },
    setSize(value: ComponentSize) {
      this.size = value;
      size.value = value;
    },
    /** 恢复默认设置（不修改系统标题/版本） */
    resetSettings() {
      this.updateTheme(defaultSettings.theme);
      this.updateThemeColor(defaultSettings.themeColor || "#409EFF");
      this.setLayout(defaultSettings.layout || LayoutMode.LEFT);
      this.setSidebarColorScheme(defaultSettings.sidebarColorScheme || SidebarColor.CLASSIC_BLUE);
      this.setSidebarStatus(SidebarStatus.OPENED);
      this.setFixedHeader(true);
      this.setShowLogo(true);
      this.setShowBreadcrumb(true);
      this.setShowTagsView(true);
      this.setTagsStyle(TagsStyle.SMART);
      this.updateShowWatermark(defaultSettings.showWatermark);
      this.setSize(defaultSettings.size as ComponentSize);
    },
  },
});

export function useSettingStoreHook() {
  return useSettingStore(store);
}
