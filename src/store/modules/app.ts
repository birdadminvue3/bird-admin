import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { defaultSettings } from "@/config/index";
// 导入 Element Plus 中英文语言包
import zhCn from "element-plus/es/locale/lang/zh-cn";
import en from "element-plus/es/locale/lang/en";
import { store } from "@/store";

export type appType = {
  language: string;
  size: string;
};

// 保留 useStorage 返回的 ref，切换语言时同步写回 localStorage，刷新后不丢失
const language = useStorage("language", defaultSettings.language);
const size = useStorage("size", defaultSettings.size);

export const useAppStore = defineStore("bird-app", {
  state: (): appType => ({
    language: language.value,
    size: size.value,
  }),
  getters: {
    /** 根据语言标识读取对应的语言包 */
    locale(state) {
      return state.language === "en" ? en : zhCn;
    },
  },
  actions: {
    changeLanguage(val: string) {
      this.language = val;
      language.value = val;
    },
  },
});

/** 组件外使用 */
export function useAppStoreHook() {
  return useAppStore(store);
}
