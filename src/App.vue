<script setup lang="ts">
import { useAppStoreHook, useSettingStoreHook } from "@/store";
import { defaultSettings } from "@/config/index";
import { ThemeMode } from "@/enums/settings/theme";
import { ComponentSize } from "@/enums/settings/layout";
import { setPageTitle } from "@/utils/pageTitle";
import { useRouter } from "vue-router";
import {
  applyAllSettings,
  applyThemeMode,
  applyThemeColor,
  applyLayoutMode,
  applySidebarColor,
  watchSystemTheme,
} from "@/utils/theme";

const appStore = useAppStoreHook();
const settingStore = useSettingStoreHook();
const router = useRouter();

const locale = computed(() => appStore.locale);
const size = computed(() => settingStore.size as ComponentSize);
const showWatermark = computed(() => settingStore.showWatermark);

// 语言切换不会触发路由导航，需手动按当前路由刷新页面标题（标题非响应式文本）
watch(
  () => appStore.language,
  () => setPageTitle(router.currentRoute.value)
);

// 明亮/暗黑主题水印字体颜色适配（跟随系统时按实际生效主题判断）
const fontColor = computed(() => {
  const isDark =
    settingStore.theme === ThemeMode.DARK ||
    (settingStore.theme === ThemeMode.AUTO && window.matchMedia("(prefers-color-scheme: dark)").matches);
  return isDark ? "rgba(255, 255, 255, .15)" : "rgba(0, 0, 0, .15)";
});

// 初始化时一次性应用全部外观设置
applyAllSettings({
  theme: settingStore.theme,
  themeColor: settingStore.themeColor,
  layout: settingStore.layout,
  sidebarColorScheme: settingStore.sidebarColorScheme,
});

// 响应式同步各项设置到 document
watch(
  () => settingStore.theme,
  value => applyThemeMode(value)
);
watch(
  () => settingStore.themeColor,
  value => applyThemeColor(value)
);
watch(
  () => settingStore.layout,
  value => applyLayoutMode(value)
);
watch(
  () => settingStore.sidebarColorScheme,
  value => applySidebarColor(value)
);

// 跟随系统主题：系统切换时若当前为 AUTO，则重新应用
let stopWatchSystem: (() => void) | null = null;
watch(
  () => settingStore.theme,
  value => {
    stopWatchSystem?.();
    if (value === ThemeMode.AUTO) {
      stopWatchSystem = watchSystemTheme(() => applyThemeMode(ThemeMode.AUTO));
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => stopWatchSystem?.());
</script>

<template>
  <el-config-provider :locale="locale" :size="size">
    <!-- 开启水印 -->
    <el-watermark
      :font="{ color: fontColor }"
      :content="showWatermark ? defaultSettings.watermarkContent : ''"
      :z-index="9999"
      class="app"
    >
      <router-view />
    </el-watermark>
  </el-config-provider>
</template>

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
}
</style>
