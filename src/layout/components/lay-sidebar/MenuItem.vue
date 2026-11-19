<script setup lang="ts">
import type { MenuRoute } from "@/api/rbac/types";
import { resolveIcon } from "./icon";
import { useMenuTitle } from "@/locales/useMenuTitle";

defineOptions({ name: "MenuItem" });

const { menuTitle } = useMenuTitle();

const props = withDefaults(
  defineProps<{
    item: MenuRoute;
    isNest?: boolean;
  }>(),
  { isNest: false }
);

const visibleChildren = computed(() =>
  (props.item.children || []).filter(child => child.meta?.showLink !== false)
);

/** 单个可见子项或叶子节点拍平成一个可点击菜单项 */
const hasOneShowingChild = computed(() => visibleChildren.value.length <= 1);
const onlyOneChild = computed(() => visibleChildren.value[0] || null);

const current = computed(() => (hasOneShowingChild.value && onlyOneChild.value ? onlyOneChild.value : props.item));
const iconComponent = computed(() => resolveIcon(current.value?.meta?.icon));
</script>

<template>
  <!-- 叶子/单子项：直接渲染可点击项 -->
  <el-menu-item v-if="hasOneShowingChild" :index="current.path">
    <el-icon v-if="iconComponent"><component :is="iconComponent" /></el-icon>
    <template #title>
      <span>{{ menuTitle(current.meta?.title) }}</span>
    </template>
  </el-menu-item>

  <!-- 多子项：分组 + 递归 -->
  <el-sub-menu v-else :index="item.path">
    <template #title>
      <el-icon v-if="iconComponent"><component :is="iconComponent" /></el-icon>
      <span>{{ menuTitle(item.meta?.title) }}</span>
    </template>
    <MenuItem
      v-for="child in visibleChildren"
      :key="child.path"
      :item="child"
      is-nest
    />
  </el-sub-menu>
</template>

<style scoped>
:deep(.el-menu-item) {
  height: 46px;
  line-height: 46px;
}
:deep(.el-sub-menu__title) {
  height: 46px;
  line-height: 46px;
}
</style>
