/**
 * 按钮级权限指令：v-permission="'system:user:add'"
 * 也支持数组（满足其一即可）：v-permission="['system:user:edit', 'system:user:add']"
 *
 * 判断逻辑复用 @/utils/permission 的 hasPermission，与组件/函数方式保持一致。
 */
import type { App, Directive } from "vue";
import { hasPermission, type PermissionValue } from "@/utils/permission";

const permission: Directive<HTMLElement, PermissionValue> = {
  mounted(el, binding) {
    el.hidden = !hasPermission(binding.value);
  },
  updated(el, binding) {
    el.hidden = !hasPermission(binding.value);
  },
};

export function setupPermissionDirective(app: App<Element>) {
  app.directive("permission", permission);
}

export default permission;
