<script setup lang="ts">
import { useAppStoreHook, useSettingStoreHook } from "@/store";
import { defaultSettings } from "@/config/index";
import { ThemeMode } from "@/enums/settings/theme";
import { ComponentSize } from "@/enums/settings/layout";
const appStore = useAppStoreHook();
const settingStore = useSettingStoreHook();

const locale = computed(() => appStore.locale);
const size = computed(() => appStore.size as ComponentSize);
const showWatermark = computed(() => settingStore.showWatermark);
console.log('showWatermark',showWatermark.value);

// 明亮/暗黑主题水印字体颜色适配
const fontColor = computed(() => {
  return settingStore.theme === ThemeMode.DARK ? "rgba(255, 255, 255, .15)" : "rgba(0, 0, 0, .15)";
});
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
.app{
  width: 100vw;
  height: 100vh;
}
</style>
