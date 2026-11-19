import staticRoutes from "./modules/staticRoutes";
import NProgress from "../utils/progress/index";
import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import tokenManager from "@/utils/request/token-manager";
import { getUserInfoApi } from "@/api/rbac/auth";
import { useUserStoreHook } from "@/store/modules/user";
import { usePermissionStoreHook } from "@/store/modules/permission";

/** 自动收集 src/router/modules 下的路由模块（排除 staticRoutes.ts） */
const modules: Record<string, any> = import.meta.glob(
  ["./modules/**/*.ts", "!./modules/**/staticRoutes.ts"],
  { eager: true }
);

const routes: RouteRecordRaw[] = [];
Object.values(modules).forEach(mod => {
  if (mod?.default) routes.push(mod.default);
});

export const constantRoutes: RouteRecordRaw[] = routes;
export const staticPaths = (staticRoutes as Array<{ path: string }>).map(route => route.path);

export const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes.concat(...(staticRoutes as any), [
    // 未匹配的路径统一回到首页；动态路由的 score 更高，不会被它抢先匹配
    { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
  ]),
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

/** 无需登录即可访问的路径 */
const whiteList = ["/login"];

router.beforeEach(async (to, _from, next) => {
  NProgress.start();

  const hasToken = Boolean(tokenManager.getAccessToken());
  if (!hasToken) {
    const permissionStore = usePermissionStoreHook();
    if (permissionStore.loaded) permissionStore.resetRoutes();
    if (whiteList.includes(to.path)) {
      next();
    } else {
      next({
        path: "/login",
        query: to.fullPath !== "/" && to.fullPath !== "/login" ? { redirect: to.fullPath } : undefined,
      });
    }
    return;
  }

  // 已登录时不再停留在登录页
  if (to.path === "/login") {
    next({ path: "/" });
    return;
  }

  try {
    const permissionStore = usePermissionStoreHook();
    if (!permissionStore.loaded) {
      // 刷新页面后 Pinia 状态丢失，先恢复用户资料再按权限生成路由
      const userStore = useUserStoreHook();
      if (!userStore.userInfo) {
        const res = await getUserInfoApi();
        userStore.setProfile(res.data);
      }
      const dynamicRoutes = await permissionStore.generateRoutes();
      dynamicRoutes.forEach(route => router.addRoute(route));
      // 重新进入一次，确保 addRoute 后能匹配到目标
      next({ ...to, replace: true });
      return;
    }
    next();
  } catch {
    // 拉取用户信息/路由失败按登录失效处理
    useUserStoreHook().logout();
    usePermissionStoreHook().resetRoutes();
    next({
      path: "/login",
      query: to.fullPath !== "/" ? { redirect: to.fullPath } : undefined,
    });
  }
});

router.afterEach(() => NProgress.done());
router.onError(() => NProgress.done());

export default router;
