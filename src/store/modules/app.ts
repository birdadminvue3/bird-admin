import { defaultSettings } from "@/config/index";
// 导入 Element Plus 中英文语言包
import zhCn from "element-plus/es/locale/lang/zh-cn";
import en from "element-plus/es/locale/lang/en";
import { store } from "@/store";

export type appType = {
  language: string;
  size: string;
};
export const useAppStore = defineStore("bird-app", {
  state: (): appType => ({
    // 语言
    language: useStorage("language", defaultSettings.language).value,
    // 布局大小
    size: useStorage("size", defaultSettings.size).value,
  }),
  getters: {
    /**
     * 根据语言标识读取对应的语言包
     */
    locale(state){
      if (state.language == "en") {
        return en;
      } else {
        return zhCn;
      }
    }
    // getSidebarStatus() {
    //   return state.sidebar.opened;
    // },
    // getDevice(state) {
    //   return state.device;
    // },
    // getViewportWidth(state) {
    //   return state.viewportSize.width;
    // },
    // getViewportHeight(state) {
    //   return state.viewportSize.height;
    // }
  },
  actions: {
    changeLanguage(val: string){
      this.language = val
    },
    // TOGGLE_SIDEBAR(opened?: boolean, resize?: string) {
    //   const layout = storageLocal().getItem<StorageConfigs>(
    //     `${responsiveStorageNameSpace()}layout`
    //   );
    //   if (opened && resize) {
    //     this.sidebar.withoutAnimation = true;
    //     this.sidebar.opened = true;
    //     layout.sidebarStatus = true;
    //   } else if (!opened && resize) {
    //     this.sidebar.withoutAnimation = true;
    //     this.sidebar.opened = false;
    //     layout.sidebarStatus = false;
    //   } else if (!opened && !resize) {
    //     this.sidebar.withoutAnimation = false;
    //     this.sidebar.opened = !this.sidebar.opened;
    //     this.sidebar.isClickCollapse = !this.sidebar.opened;
    //     layout.sidebarStatus = this.sidebar.opened;
    //   }
    //   storageLocal().setItem(`${responsiveStorageNameSpace()}layout`, layout);
    // },
    // async toggleSideBar(opened?: boolean, resize?: string) {
    //   await this.TOGGLE_SIDEBAR(opened, resize);
    // },
    // toggleDevice(device: string) {
    //   this.device = device;
    // },
    // setLayout(layout) {
    //   this.layout = layout;
    // },
  }
});
/**
 * 用于在组件外部（如在Pinia Store 中）使用 Pinia 提供的 store 实例。
 * 官方文档解释了如何在组件外部使用 Pinia Store：
 * https://pinia.vuejs.org/core-concepts/outside-component-usage.html#using-a-store-outside-of-a-component
 */
export function useAppStoreHook() {
  return useAppStore(store);
}