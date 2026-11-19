<script setup lang="ts">
import { useSettingStore } from "@/store/modules/settings";
import { useTagsViewStore } from "@/store/modules/tags-view";
import { useUserStore } from "@/store/modules/user";
import { usePermissionStore } from "@/store/modules/permission";
import { LayoutMode } from "@/enums/index";
import NavVertical from "./components/lay-sidebar/NavVertical.vue";
import NavHorizontal from "./components/lay-sidebar/NavHorizontal.vue";
import LayNavbar from "./components/lay-navbar/index.vue";
import LayTag from "./components/lay-tag/index.vue";
import LaySetting from "./components/lay-setting/index.vue";

defineOptions({ name: "Layout" });

const settingStore = useSettingStore();
const tagsStore = useTagsViewStore();
const userStore = useUserStore();
const permissionStore = usePermissionStore();
const settingVisible = ref(false);
const { t } = useI18n();

/** 是否需要左侧栏：顶部模式不显示 */
const showSidebar = computed(() => settingStore.layout !== LayoutMode.TOP);
/** 顶部模式 */
const isTop = computed(() => settingStore.layout === LayoutMode.TOP);
/** 混合模式 */
const isMix = computed(() => settingStore.layout === LayoutMode.MIX);

/** 退出登录时清空页签（userInfo 从有值变为 null 才处理） */
watch(
  () => userStore.userInfo,
  (info, oldInfo) => {
    if (!info && oldInfo) {
      tagsStore.resetViews();
      permissionStore.resetRoutes();
    }
  }
);
</script>

<template>
  <div
    class="app-layout"
    :class="{
      'layout-top': isTop,
      'layout-mix': isMix,
      'sidebar-collapsed': settingStore.isCollapse,
    }"
  >
    <div class="app-main-row">
      <NavVertical v-if="showSidebar" />

      <section class="app-body">
        <!-- top / mix：菜单 + 工具栏拼成单层通栏头部 -->
        <div
          v-if="isTop || isMix"
          class="app-header-wrap app-header-inline"
          :class="{ 'is-fixed': settingStore.fixedHeader }"
        >
          <!-- 混合模式：折叠按钮置于头部最左，位置与左侧模式一致 -->
          <button
            v-if="isMix"
            class="app-collapse-btn"
            type="button"
            :title="settingStore.isCollapse ? t('navbar.expandMenu') : t('navbar.collapseMenu')"
            @click="settingStore.toggleSidebar()"
          >
            <el-icon><component :is="settingStore.isCollapse ? 'Expand' : 'Fold'" /></el-icon>
          </button>
          <NavHorizontal />
          <LayNavbar @open-setting="settingVisible = true" />
        </div>
        <!-- left：仅工具栏（含面包屑） -->
        <div
          v-else
          class="app-header-wrap"
          :class="{ 'is-fixed': settingStore.fixedHeader }"
        >
          <LayNavbar @open-setting="settingVisible = true" />
        </div>

        <LayTag v-if="settingStore.showTagsView" />

        <main class="app-content">
          <router-view />
        </main>
      </section>
    </div>

    <LaySetting v-model="settingVisible" />
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--el-bg-color-page);
}

.app-main-row {
  flex: 1;
  display: flex;
  min-height: 0;
}

.app-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.app-header-wrap {
  z-index: 9;
  background: var(--header-bg);

  /* 固定头部：吸顶于内容滚动之上 */
  &.is-fixed {
    position: sticky;
    top: 0;
  }

  /* top / mix：菜单与工具栏横向拼成单层通栏 */
  &.app-header-inline {
    display: flex;
    align-items: stretch;
    border-bottom: 1px solid var(--el-border-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
}

/* 混合模式：折叠按钮置于头部最左，与左侧模式位置一致 */
.app-collapse-btn {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  align-self: center;
  margin-left: 12px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--el-text-color-regular);
  font-size: 18px;
  cursor: pointer;

  &:hover {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
  }
}

.app-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px;
}
</style>
