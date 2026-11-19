<script setup lang="ts">
/**
 * 按钮权限（参考 vue-pure-admin 的 permission/button）
 * 用三种方式判断同一组权限码，直观对比：
 * 1. 组件方式 <Auth>
 * 2. 函数方式 hasPermission()
 * 3. 指令方式 v-permission
 * 三者复用同一判断逻辑（@/utils/permission），结果一致。
 */
import { getPermissions, hasPermission } from "@/utils/permission";

defineOptions({ name: "PermissionButton" });

const { t } = useI18n();
const permissions = computed(() => getPermissions());
const isSuper = computed(() => permissions.value.includes("*:*:*"));
</script>

<template>
  <div class="permission-button">
    <p class="permission-desc">{{ t("permission.codeTip") }}：{{ permissions }}</p>
    <p v-show="isSuper" class="permission-desc permission-tip">
      {{ t("permission.superTip") }}
    </p>

    <!-- 组件方式 -->
    <el-card shadow="never" class="perm-card">
      <template #header>
        <div class="card-header">{{ t("permission.componentWay") }}</div>
      </template>
      <el-space wrap>
        <Auth value="permission:btn:add">
          <el-button plain type="warning">{{ t("permission.btnAdd") }}</el-button>
        </Auth>
        <Auth :value="['permission:btn:edit']">
          <el-button plain type="primary">{{ t("permission.btnEdit") }}</el-button>
        </Auth>
        <Auth :value="['permission:btn:add', 'permission:btn:edit', 'permission:btn:delete']">
          <el-button plain type="danger">{{ t("permission.btnAny") }}</el-button>
        </Auth>
      </el-space>
    </el-card>

    <!-- 函数方式 -->
    <el-card shadow="never" class="perm-card">
      <template #header>
        <div class="card-header">{{ t("permission.functionWay") }}</div>
      </template>
      <el-space wrap>
        <el-button v-if="hasPermission('permission:btn:add')" plain type="warning">
          {{ t("permission.btnAdd") }}
        </el-button>
        <el-button v-if="hasPermission(['permission:btn:edit'])" plain type="primary">
          {{ t("permission.btnEdit") }}
        </el-button>
        <el-button
          v-if="hasPermission(['permission:btn:add', 'permission:btn:edit', 'permission:btn:delete'])"
          plain
          type="danger"
        >
          {{ t("permission.btnAny") }}
        </el-button>
      </el-space>
    </el-card>

    <!-- 指令方式 -->
    <el-card shadow="never" class="perm-card">
      <template #header>
        <div class="card-header">{{ t("permission.directiveWay") }}</div>
      </template>
      <el-space wrap>
        <el-button v-permission="'permission:btn:add'" plain type="warning">
          {{ t("permission.btnAdd") }}
        </el-button>
        <el-button v-permission="['permission:btn:edit']" plain type="primary">
          {{ t("permission.btnEdit") }}
        </el-button>
        <el-button
          v-permission="['permission:btn:add', 'permission:btn:edit', 'permission:btn:delete']"
          plain
          type="danger"
        >
          {{ t("permission.btnAny") }}
        </el-button>
      </el-space>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.permission-button {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-desc {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
  line-height: 1.7;
  word-break: break-all;
}

.permission-tip {
  color: var(--el-color-warning);
  font-weight: 600;
}

.card-header {
  font-weight: 600;
}
</style>
