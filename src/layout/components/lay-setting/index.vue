<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
import { useSettingStore } from "@/store/modules/settings";
import { useTagsViewStore } from "@/store/modules/tags-view";
import { LayoutMode, ThemeMode, SidebarColor, ComponentSize, TagsStyle } from "@/enums/index";
import { switchThemeMode } from "@/utils/theme";

defineOptions({ name: "LaySetting" });

const visible = defineModel<boolean>({ default: false });

const { t } = useI18n();
const settingStore = useSettingStore();
const tagsStore = useTagsViewStore();

const tagsStyleOptions = computed(() => [
  { label: t("settings.tagsStyleSmart"), value: TagsStyle.SMART },
  { label: t("settings.tagsStyleCard"), value: TagsStyle.CARD },
  { label: t("settings.tagsStyleChrome"), value: TagsStyle.CHROME },
]);

const themeOptions = computed(() => [
  { label: t("login.light"), value: ThemeMode.LIGHT, icon: "Sunny" },
  { label: t("login.dark"), value: ThemeMode.DARK, icon: "Moon" },
  { label: t("settings.followSystem"), value: ThemeMode.AUTO, icon: "Monitor" },
]);

const layoutOptions = computed(() => [
  { label: t("settings.leftLayout"), value: LayoutMode.LEFT },
  { label: t("settings.topLayout"), value: LayoutMode.TOP },
  { label: t("settings.mixLayout"), value: LayoutMode.MIX },
]);

const colorOptions = [
  "#409EFF",
  "#67C23A",
  "#E6A23C",
  "#F56C6C",
  "#909399",
  "#8E71C7",
  "#009688",
  "#D25F00",
];

const sidebarOptions = computed(() => [
  { label: t("settings.classicBlue"), value: SidebarColor.CLASSIC_BLUE },
  { label: t("settings.minimalWhite"), value: SidebarColor.MINIMAL_WHITE },
]);

const sizeOptions = computed(() => [
  { label: t("sizeSelect.default"), value: ComponentSize.DEFAULT },
  { label: t("sizeSelect.large"), value: ComponentSize.LARGE },
  { label: t("sizeSelect.small"), value: ComponentSize.SMALL },
]);

/** 主题模式切换：以点击的按钮为圆心播放圆形扩散特效 */
function handleThemeChange(theme: ThemeMode, event: MouseEvent) {
  if (theme === settingStore.theme) return;
  switchThemeMode(theme, event.currentTarget as HTMLElement, () =>
    settingStore.updateTheme(theme)
  );
}

async function handleCopyConfig() {
  const config = {
    layout: settingStore.layout,
    theme: settingStore.theme,
    themeColor: settingStore.themeColor,
    sidebarColorScheme: settingStore.sidebarColorScheme,
    fixedHeader: settingStore.fixedHeader,
    showLogo: settingStore.showLogo,
    showBreadcrumb: settingStore.showBreadcrumb,
    showTagsView: settingStore.showTagsView,
    tagsStyle: settingStore.tagsStyle,
    tagsViewCache: tagsStore.tagsViewCache,
    showWatermark: settingStore.showWatermark,
    size: settingStore.size,
  };
  try {
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    ElMessage.success(t("settings.copySuccess"));
  } catch {
    ElMessage.warning(t("settings.copyFailed"));
  }
}

async function handleReset() {
  try {
    await ElMessageBox.confirm(t("settings.confirmReset"), t("settings.resetConfig"), {
      type: "warning",
    });
    settingStore.resetSettings();
    ElMessage.success(t("settings.resetSuccess"));
  } catch {
    /* 用户取消 */
  }
}
</script>

<template>
  <el-drawer v-model="visible" :title="t('settings.project')" size="320px" append-to-body>
    <div class="setting-body">
      <!-- 主题设置 -->
      <div class="setting-section">
        <div class="setting-title">{{ t("settings.theme") }}</div>
        <div class="setting-row">
          <span class="setting-label">{{ t("settings.darkMode") }}</span>
          <div class="theme-buttons">
            <button
              v-for="option in themeOptions"
              :key="option.value"
              class="theme-btn"
              :class="{ active: settingStore.theme === option.value }"
              type="button"
              :title="option.label"
              @click="handleThemeChange(option.value, $event)"
            >
              <el-icon><component :is="option.icon" /></el-icon>
              <span>{{ option.label }}</span>
            </button>
          </div>
        </div>
        <div class="setting-row">
          <span class="setting-label">{{ t("settings.themeColor") }}</span>
          <div class="color-buttons">
            <button
              v-for="color in colorOptions"
              :key="color"
              class="color-btn"
              :class="{ active: settingStore.themeColor === color }"
              type="button"
              :style="{ backgroundColor: color }"
              @click="settingStore.updateThemeColor(color)"
            />
          </div>
        </div>
      </div>

      <!-- 导航设置 -->
      <div class="setting-section">
        <div class="setting-title">{{ t("settings.navigation") }}</div>
        <div class="setting-label mb-8">{{ t("settings.layoutSetting") }}</div>
        <div class="layout-options">
          <button
            v-for="option in layoutOptions"
            :key="option.value"
            class="layout-option"
            :class="{ active: settingStore.layout === option.value }"
            type="button"
            @click="settingStore.setLayout(option.value)"
          >
            <span class="layout-preview" :class="`preview-${option.value}`">
              <i class="preview-header" />
              <i class="preview-side" />
              <i class="preview-content" />
            </span>
            <span class="layout-name">{{ option.label }}</span>
          </button>
        </div>
        <div class="setting-row">
          <span class="setting-label">{{ t("settings.sidebarColorScheme") }}</span>
          <el-select
            :model-value="settingStore.sidebarColorScheme"
            size="small"
            class="setting-select"
            @update:model-value="settingStore.setSidebarColorScheme($event)"
          >
            <el-option
              v-for="option in sidebarOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
      </div>

      <!-- 界面设置 -->
      <div class="setting-section">
        <div class="setting-title">{{ t("settings.interface") }}</div>
        <div class="setting-switch-row">
          <span class="setting-label">{{ t("settings.fixedHeader") }}</span>
          <el-switch
            :model-value="settingStore.fixedHeader"
            @update:model-value="settingStore.setFixedHeader($event)"
          />
        </div>
        <div class="setting-switch-row">
          <span class="setting-label">{{ t("settings.showAppLogo") }}</span>
          <el-switch
            :model-value="settingStore.showLogo"
            @update:model-value="settingStore.setShowLogo($event)"
          />
        </div>
        <div class="setting-switch-row">
          <span class="setting-label">{{ t("settings.showBreadcrumb") }}</span>
          <el-switch
            :model-value="settingStore.showBreadcrumb"
            @update:model-value="settingStore.setShowBreadcrumb($event)"
          />
        </div>
        <div class="setting-switch-row">
          <span class="setting-label">{{ t("settings.showTagsView") }}</span>
          <el-switch
            :model-value="settingStore.showTagsView"
            @update:model-value="settingStore.setShowTagsView($event)"
          />
        </div>
        <div class="setting-row">
          <span class="setting-label">{{ t("settings.tagsStyle") }}</span>
          <el-select
            :model-value="settingStore.tagsStyle"
            size="small"
            class="setting-select"
            @update:model-value="settingStore.setTagsStyle($event)"
          >
            <el-option
              v-for="option in tagsStyleOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
        <div class="setting-switch-row">
          <span class="setting-label">{{ t("settings.tagsViewCache") }}</span>
          <el-switch
            :model-value="tagsStore.tagsViewCache"
            @update:model-value="tagsStore.setTagsViewCache($event)"
          />
        </div>
        <div class="setting-switch-row">
          <span class="setting-label">{{ t("settings.showWatermark") }}</span>
          <el-switch
            :model-value="settingStore.showWatermark"
            @update:model-value="settingStore.updateShowWatermark($event)"
          />
        </div>
        <div class="setting-row">
          <span class="setting-label">{{ t("settings.componentSize") }}</span>
          <el-select
            :model-value="settingStore.size"
            size="small"
            class="setting-select"
            @update:model-value="settingStore.setSize($event)"
          >
            <el-option
              v-for="option in sizeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
      </div>

      <!-- 配置管理 -->
      <div class="setting-section">
        <div class="setting-title">{{ t("settings.configManagement") }}</div>
        <div class="config-buttons">
          <el-button size="small" @click="handleCopyConfig">{{ t("settings.copyConfig") }}</el-button>
          <el-button size="small" type="danger" plain @click="handleReset">
            {{ t("settings.resetConfig") }}
          </el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.setting-body {
  padding: 0 4px 20px;
}

.setting-section {
  padding: 14px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }
}

.setting-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 14px;
  color: var(--el-text-color-primary);
}

.setting-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.setting-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.mb-8 {
  margin-bottom: 8px;
}

.setting-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.setting-select {
  width: 100%;
}

.theme-buttons {
  display: flex;
  gap: 8px;
}

.theme-btn {
  flex: 1;
  height: 58px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);
  font-size: 12px;
  cursor: pointer;

  .el-icon {
    font-size: 18px;
  }

  &.active {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}

.color-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-btn {
  width: 22px;
  height: 22px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;

  &.active {
    border-color: var(--el-text-color-primary);
    box-shadow: 0 0 0 2px var(--el-bg-color) inset;
  }
}

.layout-options {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.layout-option {
  flex: 1;
  padding: 6px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-bg-color);
  cursor: pointer;

  &.active {
    border-color: var(--el-color-primary);
  }
}

.layout-preview {
  display: block;
  height: 46px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  position: relative;
  overflow: hidden;

  i {
    position: absolute;
    display: block;
    background: var(--el-color-primary-light-5);
  }

  .preview-header {
    top: 0;
    left: 0;
    right: 0;
    height: 8px;
    background: var(--el-color-primary-light-3);
  }

  .preview-side {
    top: 8px;
    bottom: 0;
    left: 0;
    width: 12px;
    background: var(--el-color-primary-light-4, var(--el-color-primary-light-5));
  }

  .preview-content {
    top: 12px;
    bottom: 4px;
    left: 18px;
    right: 4px;
    background: var(--el-fill-color);
  }

  &.preview-top .preview-side {
    display: none;
  }

  &.preview-top .preview-content {
    top: 12px;
    left: 4px;
  }

  &.preview-mix .preview-content {
    left: 4px;
  }
}

.layout-name {
  display: block;
  font-size: 12px;
  margin-top: 6px;
  color: var(--el-text-color-regular);
}

.config-buttons {
  display: flex;
  gap: 10px;
}
</style>
