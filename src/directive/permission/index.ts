/**
 * 按钮级权限指令：v-permission="'system:user:add'"
 * 也支持数组（满足其一即可）：v-permission="['system:user:edit', 'system:user:add']"
 */
import type { App, Directive } from "vue";
import { useUserStoreHook } from "@/store/modules/user";

function allowed(value: string | string[]): boolean {
  const permissions = useUserStoreHook().permissions || [];
  if (permissions.includes("*:*:*")) return true;
  const required = Array.isArray(value) ? value : [value];
  return required.some(item => permissions.includes(item));
}

const permission: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    el.hidden = !allowed(binding.value);
  },
  updated(el, binding) {
    el.hidden = !allowed(binding.value);
  },
};

export function setupPermissionDirective(app: App<Element>) {
  app.directive("permission", permission);
}

export default permission;
