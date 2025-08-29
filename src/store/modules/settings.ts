import { defineStore } from "pinia";
import { defaultSettings } from "@/config/index";
import { store } from "@/store";

type settingType = {
  title: string;
  theme: string;
  showWatermark: string;
}
export const useSettingStore = defineStore("bird-setting",{
  state: (): settingType => ({
    title: defaultSettings.Title,
    theme: defaultSettings.theme,
    showWatermark: defaultSettings.showWatermark
  }),
  getters: {
    getTitle(state) {
      return state.title;
    },
  },
  actions: {
  }
});


export function useSettingStoreHook() {
  return useSettingStore(store);
}