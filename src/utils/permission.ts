/**
 * 按钮级权限判断（函数方式）
 *
 * 权限码来源：登录接口下发的 `userStore.permissions`。
 * - 超级管理员为 `*:*:*`，拥有全部权限
 * - 传入数组时满足其一即可（与 v-permission 指令语义一致）
 *
 * 组件方式（Auth）与指令方式（v-permission）都复用这里的判断，
 * 保证三种方式对同一权限码结果一致。
 */
import { useUserStoreHook } from "@/store/modules/user";

export type PermissionValue = string | string[];

/** 当前登录用户拥有的权限码列表 */
export function getPermissions(): string[] {
  return useUserStoreHook().permissions || [];
}

/** 是否拥有指定权限（数组满足其一即可） */
export function hasPermission(value: PermissionValue): boolean {
  if (!value) return false;
  const permissions = getPermissions();
  if (permissions.includes("*:*:*")) return true;
  const required = Array.isArray(value) ? value : [value];
  return required.some(item => permissions.includes(item));
}
