<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { usePermissionStore } from "@/store/modules/permission";
import { logoutApi } from "@/api/rbac/auth";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const permissionStore = usePermissionStore();

const menus = computed(() => permissionStore.menuRoutes);
const activePath = computed(() => route.path);

async function handleLogout() {
  await logoutApi().catch(() => undefined);
  userStore.logout();
  permissionStore.resetRoutes();
  router.replace("/login");
}
</script>

<template>
  <div class="app-wrapper">
    <aside class="app-sidebar">
      <div class="app-brand">BirdAdmin</div>
      <el-menu :default-active="activePath" router class="app-menu">
        <template v-for="menu in menus" :key="menu.id">
          <el-sub-menu v-if="menu.children?.length" :index="menu.path">
            <template #title>{{ menu.meta.title }}</template>
            <el-menu-item v-for="child in menu.children" :key="child.id" :index="child.path">
              {{ child.meta.title }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="menu.path">
            {{ menu.meta.title }}
          </el-menu-item>
        </template>
      </el-menu>
    </aside>

    <section class="app-body">
      <header class="app-header">
        <span>{{ userStore.userInfo?.nickname || "未登录" }}</span>
        <span class="app-roles">{{ userStore.roles.join(", ") }}</span>
        <el-button link type="primary" @click="handleLogout">退出登录</el-button>
      </header>
      <main class="app-content">
        <router-view />
      </main>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  min-height: 100vh;
}

.app-sidebar {
  width: 220px;
  flex: 0 0 220px;
  border-right: 1px solid var(--el-border-color);
}

.app-brand {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 18px;
  font-weight: 700;
  border-bottom: 1px solid var(--el-border-color);
}

.app-menu {
  border-right: none;
}

.app-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
  padding: 0 24px;
  border-bottom: 1px solid var(--el-border-color);
}

.app-roles {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.app-content {
  flex: 1;
  padding: 20px;
}
</style>
