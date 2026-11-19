<template>
  <el-dropdown trigger="click" @command="handleDarkChange">
    <span ref="triggerRef" class="dark-mode-trigger">
      <el-icon :size="20">
        <component :is="settingsStore.theme === ThemeMode.DARK ? Moon : Sunny" />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in theneList"
          :key="item.value"
          :command="item.value"
          :disabled="settingsStore.theme === item.value"
        >
          <el-icon>
            <component :is="item.component" />
          </el-icon>
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
<script setup lang="ts">
import { useSettingStore } from "@/store";
import { ThemeMode } from "@/enums";
import { Moon, Sunny } from "@element-plus/icons-vue";
import { switchThemeMode } from "@/utils/theme";

const { t } = useI18n();
const settingsStore = useSettingStore();
/** 触发按钮，作为圆形扩散动画的圆心 */
const triggerRef = ref<HTMLElement | null>(null);

const theneList = computed(() => [
  { label: t("login.light"), value: ThemeMode.LIGHT, component: Sunny },
  { label: t("login.dark"), value: ThemeMode.DARK, component: Moon },
]);

const handleDarkChange = (theme: ThemeMode) => {
  if (theme === settingsStore.theme) return;
  switchThemeMode(theme, triggerRef.value, () => settingsStore.updateTheme(theme));
};
</script>
