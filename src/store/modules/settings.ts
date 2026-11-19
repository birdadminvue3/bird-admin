import { defineStore } from "pinia";
import { defaultSettings } from "@/config/index";
import { store } from "@/store";
import { ThemeMode } from "@/enums/settings/theme";

type SettingState = {
  title: string;
  theme: ThemeMode;
  showWatermark: boolean;
};

export const useSettingStore = defineStore("bird-setting", {
  state: (): SettingState => ({
    title: defaultSettings.title,
    theme: defaultSettings.theme,
    showWatermark: defaultSettings.showWatermark,
  }),
  getters: {
    getTitle(state) {
      return state.title;
    },
  },
  actions: {
    updateTheme(newTheme: ThemeMode) {
      this.theme = newTheme;
    },
  },
});

export function useSettingStoreHook() {
  return useSettingStore(store);
}
