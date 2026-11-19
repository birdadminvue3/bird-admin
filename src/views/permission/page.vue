<script setup lang="ts">
/**
 * 页面权限（参考 vue-pure-admin 的 permission/page）
 * 切换不同演示账号重新登录，观察左侧菜单随角色权限变化。
 * 重新登录后整页刷新，让路由守卫按新角色重建动态路由（避免 addRoute 边界问题）。
 */
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/modules/user";
import { getPermissions } from "@/utils/permission";

defineOptions({ name: "PermissionPage" });

const { t } = useI18n();
const userStore = useUserStore();
const switching = ref(false);

/** 演示账号：密码统一 123456，仅用于本地演示不同角色的菜单/按钮权限差异 */
const demoAccounts = [
  { value: "admin", label: "permission.roleAdmin" },
  { value: "system", label: "permission.roleSystem" },
  { value: "auditor", label: "permission.roleAuditor" },
  { value: "guest", label: "permission.roleGuest" },
];

const currentUser = computed(() => userStore.userInfo?.username || "");
const currentRoleName = computed(() => userStore.userInfo?.nickname || "");
const permissions = computed(() => getPermissions());

async function onChange(username: string) {
  switching.value = true;
  try {
    await userStore.login({ username, password: "123456" });
    ElMessage.success(t("permission.switchSuccess"));
    // 整页刷新：守卫会用新 token 重新 getUserInfo + 生成路由，菜单/按钮权限随之变化
    window.location.reload();
  } catch (error) {
    ElMessage.error((error as Error)?.message || t("permission.switchFailed"));
    switching.value = false;
  }
}
</script>

<template>
  <div class="permission-page">
    <p class="permission-desc">{{ t("permission.pageDesc") }}</p>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ t("permission.currentRole") }}：{{ currentRoleName }}（{{ currentUser }}）</span>
        </div>
      </template>

      <div class="role-switch">
        <span class="role-switch-label">{{ t("permission.selectRole") }}：</span>
        <el-select
          :model-value="currentUser"
          :loading="switching"
          :disabled="switching"
          style="width: 260px"
          @update:model-value="onChange"
        >
          <el-option
            v-for="item in demoAccounts"
            :key="item.value"
            :label="t(item.label)"
            :value="item.value"
            :disabled="item.value === currentUser"
          />
        </el-select>
      </div>

      <div class="role-perms">
        <span class="role-perms-label">{{ t("permission.codeTip") }}：</span>
        <el-tag v-for="code in permissions" :key="code" class="perm-tag" type="info" size="small">
          {{ code }}
        </el-tag>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.permission-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-desc {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
  line-height: 1.7;
}

.card-header {
  font-weight: 600;
}

.role-switch,
.role-perms {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.role-perms {
  margin-top: 18px;
}

.role-switch-label,
.role-perms-label {
  color: var(--el-text-color-regular);
  font-size: 13px;
}

.perm-tag {
  font-family: monospace;
}
</style>
