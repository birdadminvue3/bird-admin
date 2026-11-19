<script setup lang="ts">
import { useRoute } from "vue-router";
import type { MenuRoute } from "@/api/rbac/types";
import { usePermissionStore } from "@/store/modules/permission";
import { useSettingStore } from "@/store/modules/settings";
import { LayoutMode } from "@/enums/index";
import { getMixSubMenus, getTopMenuByPath } from "@/router/utils";
import { resolveIcon } from "./icon";
import { useMenuTitle } from "@/locales/useMenuTitle";
import MenuItem from "./MenuItem.vue";

defineOptions({ name: "NavVertical" });

const { menuTitle } = useMenuTitle();

const route = useRoute();
const permissionStore = usePermissionStore();
const settingStore = useSettingStore();

/** 混合模式 */
const isMix = computed(() => settingStore.layout === LayoutMode.MIX);

/**
 * 混合模式下左侧只显示当前顶级菜单下的子级；其余模式显示完整树。
 * 叶子一级菜单（如 /dashboard，无 children）回退为展示该顶级菜单自身，
 * 避免左侧栏完全空白。
 */
const currentTopMenu = computed(() => getTopMenuByPath(route.path, permissionStore.menuRoutes));

/** 当前顶级是否有可展示的二级菜单（决定侧栏顶部显示 logo 还是模块标题） */
const hasMixChildren = computed(
  () => isMix.value && getMixSubMenus(route.path, permissionStore.menuRoutes).length > 0
);

const menuData = computed<MenuRoute[]>(() => {
  if (!isMix.value) return permissionStore.menuRoutes;
  const subs = getMixSubMenus(route.path, permissionStore.menuRoutes);
  if (subs.length) return subs;
  return currentTopMenu.value ? [currentTopMenu.value] : [];
});
const topIcon = computed(() => resolveIcon(currentTopMenu.value?.meta?.icon));

const activePath = computed(() => route.path);
</script>

<template>
  <aside class="lay-sidebar" :class="{ 'is-mix': isMix }">
    <!-- 常规 logo；混合模式且有二级菜单时，顶部换成当前一级标题区 -->
    <div v-if="!hasMixChildren" class="lay-sidebar-logo">
      <span class="lay-logo-mark">B</span>
      <span v-show="!settingStore.isCollapse" class="lay-logo-text">BirdAdmin</span>
    </div>

    <!-- 混合模式：一级菜单标题区，与顶部一级菜单呼应 -->
    <div v-else class="lay-sidebar-logo mix-title">
      <el-icon v-if="topIcon" class="mix-title-icon"><component :is="topIcon" /></el-icon>
      <span v-show="!settingStore.isCollapse" class="mix-title-text">
        {{ menuTitle(currentTopMenu?.meta?.title) || menuTitle("菜单") }}
      </span>
    </div>

    <el-scrollbar class="lay-sidebar-scroll">
      <el-menu
        :default-active="activePath"
        :collapse="settingStore.isCollapse"
        :collapse-transition="false"
        :unique-opened="true"
        router
        class="lay-sidebar-menu"
        :class="{ 'mix-menu': isMix }"
      >
        <MenuItem v-for="menu in menuData" :key="menu.path" :item="menu" />
      </el-menu>
    </el-scrollbar>
  </aside>
</template>

<style scoped lang="scss">
.lay-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  transition: width 0.25s ease;
  overflow: hidden;
}

.lay-sidebar-logo {
  height: var(--header-height);
  min-height: var(--header-height);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border-bottom: 1px solid var(--sidebar-border);
  overflow: hidden;
  white-space: nowrap;
}

.lay-logo-mark {
  flex: 0 0 30px;
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
  color: var(--sidebar-text);
  font-size: 17px;
  font-weight: 700;
}

.lay-sidebar-scroll {
  flex: 1;
  min-height: 0;
}

.lay-sidebar-menu {
  border-right: none;
  background: transparent;
}
</style>
