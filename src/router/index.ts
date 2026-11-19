import staticRoutes from "./modules/staticRoutes";
import NProgress from "../utils/progress/index";
import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import NotFound from "@/views/error/404.vue";
import tokenManager from "@/utils/request/token-manager";
import { getUserInfoApi } from "@/api/rbac/auth";
import { useUserStoreHook } from "@/store/modules/user";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { setPageTitle } from "@/utils/pageTitle";

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
    // 兜底路由必须渲染组件，不能 redirect 到 /dashboard：
    // 动态路由注入前 /dashboard 也会命中兜底，redirect 到自身会导致 pushWithRedirect 无限递归。
    { path: "/:pathMatch(.*)*", component: NotFound },
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
      // 只传原始 location 字段，不要传整个 to 对象（其 redirectedFrom/matched 等内部字段
      // 会被 Vue Router 当成新导航反复 resolve，同样会触发栈溢出）
      next({ path: to.path, query: to.query, hash: to.hash, replace: true });
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

router.afterEach(to => {
  // 动态设置页面标题：页面标题（i18n）- 系统名称
  setPageTitle(to);
  NProgress.done();
});
router.onError(() => NProgress.done());

export default router;
