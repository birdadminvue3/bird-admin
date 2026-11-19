<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import type { MenuRoute } from "@/api/rbac/types";
import { usePermissionStore } from "@/store/modules/permission";
import { useSettingStore } from "@/store/modules/settings";
import { LayoutMode } from "@/enums/index";
import { resolveIcon } from "./icon";
import { resolveMenuPath, getTopMenuByPath } from "@/router/utils";
import { useMenuTitle } from "@/locales/useMenuTitle";
import MenuItem from "./MenuItem.vue";

defineOptions({ name: "NavHorizontal" });

const { menuTitle } = useMenuTitle();

const route = useRoute();
const router = useRouter();
const permissionStore = usePermissionStore();
const settingStore = useSettingStore();

const isMix = computed(() => settingStore.layout === LayoutMode.MIX);
const isTop = computed(() => settingStore.layout === LayoutMode.TOP);
const menus = computed(() => permissionStore.menuRoutes);
const activePath = computed(() => route.path);

/** 当前所处的一级菜单（顶栏高亮用它，与侧栏共用同一推导逻辑） */
const currentTopMenu = computed<MenuRoute | null>(() =>
  getTopMenuByPath(route.path, menus.value)
);

function currentIcon(menu: MenuRoute) {
  return resolveIcon(menu.meta?.icon);
}

function handleTopClick(menu: MenuRoute) {
  const target = resolveMenuPath(menu);
  if (target && target !== route.path) router.push(target);
}
</script>

<template>
  <nav class="lay-horizontal" :class="{ 'is-inline': isMix || isTop }">
    <!-- 顶部菜单模式显示 logo；混合模式 logo 在侧栏，避免重复 -->
    <div class="lay-horizontal-logo" v-if="settingStore.showLogo && !isMix">
      <span class="lay-logo-mark">B</span>
      <span class="lay-logo-text">BirdAdmin</span>
    </div>

    <!-- 顶部菜单模式：完整菜单树（含下拉） -->
    <el-menu
      v-if="!isMix"
      :default-active="activePath"
      mode="horizontal"
      router
      :ellipsis="false"
      class="lay-horizontal-menu"
    >
      <MenuItem v-for="menu in menus" :key="menu.path" :item="menu" />
    </el-menu>

    <!-- 混合模式：顶部只显示一级菜单，点击跳到其下首个页面 -->
    <el-menu
      v-else
      :default-active="currentTopMenu?.path || ''"
      mode="horizontal"
      :ellipsis="false"
      class="lay-horizontal-menu"
    >
      <el-menu-item
        v-for="menu in menus"
        :key="menu.path"
        :index="menu.path"
        @click="handleTopClick(menu)"
      >
        <el-icon v-if="currentIcon(menu)"><component :is="currentIcon(menu)" /></el-icon>
        <template #title>{{ menuTitle(menu.meta?.title) }}</template>
      </el-menu-item>
    </el-menu>
  </nav>
</template>

<style scoped lang="scss">
.lay-horizontal {
  height: 100%;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--header-bg);
  padding: 0 12px;

  /* 内联模式（top / mix）：与右侧工具栏拼成单层，自身不需要分隔线 */
  &.is-inline {
    flex: 1;
    min-width: 0;
    border-bottom: none;
    padding-right: 0;
  }
}

.lay-horizontal-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 20px;
  margin-right: 8px;
  border-right: 1px solid var(--el-border-color);
  white-space: nowrap;
}

.lay-logo-mark {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--el-color-primary);
  color: #fff;
  font-weight: 700;
  font-size: 18px;
}

.lay-logo-text {
  font-size: 17px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.lay-horizontal-menu {
  flex: 1;
  min-width: 0;
  border-bottom: none;
  background: transparent;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 100%;
    line-height: var(--header-height);
  }
}
</style>
