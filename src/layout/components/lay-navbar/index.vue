<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { useSettingStore } from "@/store/modules/settings";
import { usePermissionStore } from "@/store/modules/permission";
import { logoutApi } from "@/api/rbac/auth";
import { LayoutMode } from "@/enums/index";
import { getBreadcrumbs } from "@/router/utils";
import { useMenuTitle } from "@/locales/useMenuTitle";

defineOptions({ name: "LayNavbar" });

defineEmits<{ (e: "open-setting"): void }>();

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const settingStore = useSettingStore();
const permissionStore = usePermissionStore();
const { t } = useI18n();
const { menuTitle } = useMenuTitle();

/** 混合/顶部模式：面包屑与横向菜单层级重复，仅在 left 模式显示 */
const isInline = computed(() => settingStore.layout === LayoutMode.MIX || settingStore.layout === LayoutMode.TOP);
/** 仅 left 模式顶栏显示折叠按钮；mix 的折叠按钮由布局层置于头部最左，避免重复 */
const showCollapse = computed(() => settingStore.layout === LayoutMode.LEFT);
const showBreadcrumb = computed(() => settingStore.showBreadcrumb && !isInline.value);
const breadcrumbs = computed(() => getBreadcrumbs(route.path, permissionStore.menuRoutes));

async function handleLogout() {
  await logoutApi().catch(() => undefined);
  userStore.logout();
  permissionStore.resetRoutes();
  router.replace("/login");
}
</script>

<template>
  <header class="lay-navbar" :class="{ 'is-inline': isInline }">
    <div class="lay-navbar-left">
      <button
        v-if="showCollapse"
        class="lay-icon-btn"
        type="button"
        :title="settingStore.isCollapse ? t('navbar.expandMenu') : t('navbar.collapseMenu')"
        @click="settingStore.toggleSidebar()"
      >
        <el-icon><component :is="settingStore.isCollapse ? 'Expand' : 'Fold'" /></el-icon>
      </button>

      <el-breadcrumb v-if="showBreadcrumb" separator="/" class="lay-breadcrumb">
        <el-breadcrumb-item v-for="crumb in breadcrumbs" :key="crumb.path">
          {{ menuTitle(crumb.meta?.title) }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="lay-navbar-right">
      <div class="lay-icon-btn" :title="t('login.languageToggle')">
        <LangSelect />
      </div>
      <DarkModeSwitch />
      <button class="lay-icon-btn" type="button" :title="t('navbar.projectSetting')" @click="$emit('open-setting')">
        <el-icon><Setting /></el-icon>
      </button>
      <el-dropdown trigger="click" @command="handleLogout">
        <div class="lay-user">
          <span class="lay-avatar">{{ (userStore.userInfo?.nickname || "U").slice(0, 1) }}</span>
          <span class="lay-user-name">{{ userStore.userInfo?.nickname || t("navbar.notLoggedIn") }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">
              <el-icon><SwitchButton /></el-icon>
              {{ t("navbar.logout") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped lang="scss">
.lay-navbar {
  height: var(--header-height);
  min-height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  background: var(--header-bg);
  border-bottom: 1px solid var(--el-border-color);

  /* 内联模式（mix / top）：与左侧菜单拼成单层，分隔线由外层容器统一绘制 */
  &.is-inline {
    flex: 0 0 auto;
    border-bottom: none;
  }
}

.lay-navbar-left,
.lay-navbar-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.lay-icon-btn {
  width: 34px;
  height: 34px;
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

.lay-breadcrumb {
  font-size: 13px;
}

.lay-user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  outline: none;
}

.lay-avatar {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.lay-user-name {
  font-size: 13px;
  color: var(--el-text-color-primary);
}
</style>
