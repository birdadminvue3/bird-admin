import { defineStore } from "pinia";
import type { RouteRecordRaw } from "vue-router";
const Layout = () => import("@/layout/index.vue");
import { store } from "@/store";
import { getUserRoutesApi } from "@/api/rbac/auth";
import type { MenuRoute } from "@/api/rbac/types";

/**
 * 后端下发 component 标识 -> 本地组件。
 * 新增页面时只需在这里登记一次，菜单由后端控制显隐。
 */
const componentMap: Record<string, () => Promise<any>> = {
  "dashboard/index": () => import("@/views/dashboard/index.vue"),
  "system/resource": () => import("@/views/system/resource/index.vue"),
};

interface PermissionState {
  /** 后端原始菜单树，供侧边栏渲染 */
  menuRoutes: MenuRoute[];
  /** 转换后的可注入路由 */
  routes: RouteRecordRaw[];
  loaded: boolean;
}

/** 把菜单树扁平化为 Layout 的子路由 */
function collectPages(menus: MenuRoute[]): RouteRecordRaw[] {
  const pages: RouteRecordRaw[] = [];
  const walk = (list: MenuRoute[]) => {
    list.forEach(menu => {
      const loader = menu.component ? componentMap[menu.component] : undefined;
      if (loader) {
        pages.push({
          path: menu.path,
          name: menu.name || undefined,
          component: loader,
          meta: { ...menu.meta },
        });
      }
      if (menu.children?.length) walk(menu.children);
    });
  };
  walk(menus);
  return pages;
}

function buildRoutes(menus: MenuRoute[]): RouteRecordRaw[] {
  const pages = collectPages(menus);
  return [
    {
      path: "/",
      name: "DynamicLayout",
      component: Layout,
      redirect: pages[0]?.path || "/dashboard",
      children: pages,
    },
  ];
}

export const usePermissionStore = defineStore("bird-permission", {
  state: (): PermissionState => ({
    menuRoutes: [],
    routes: [],
    loaded: false,
  }),
  actions: {
    /** 拉取当前用户可访问菜单并生成动态路由 */
    async generateRoutes(): Promise<RouteRecordRaw[]> {
      const res = await getUserRoutesApi();
      this.menuRoutes = res.data || [];
      this.routes = buildRoutes(this.menuRoutes);
      this.loaded = true;
      return this.routes;
    },
    resetRoutes() {
      this.menuRoutes = [];
      this.routes = [];
      this.loaded = false;
    },
  },
});

/** 组件外（路由守卫）使用 */
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
