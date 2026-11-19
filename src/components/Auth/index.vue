<script setup lang="ts">
/**
 * 组件方式判断权限：<Auth value="permission:btn:add">...</Auth>
 * value 支持字符串或数组（满足其一即可），与 hasPermission / v-permission 语义一致。
 * 基于 computed 建立对 userStore.permissions 的响应式依赖，切换账号后即时更新。
 */
import { hasPermission, type PermissionValue } from "@/utils/permission";

defineOptions({ name: "Auth" });

const props = defineProps<{ value: PermissionValue }>();
const allowed = computed(() => hasPermission(props.value));
</script>

<template>
  <slot v-if="allowed" />
</template>
