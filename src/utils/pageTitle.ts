/**
 * 动态页面标题
 *
 * 由路由后置守卫（router.afterEach）调用，按当前路由的 meta.title 设置 document.title。
 * 后端菜单下发的 title 是中文原文，这里复用 `menus.*` 语言包做翻译（与侧边栏/面包屑一致），
 * 语言切换时由 App.vue 的 watch 重新调用 setPageTitle 同步刷新（标题不是响应式文本）。
 */
import i18n from "@/locales";
import { defaultSettings } from "@/config/index";

type TitleRoute = { path: string; meta?: Record<string, unknown> };

/** 翻译页面标题：中文原文作为 menus.* 的 key，未命中回退原文 */
function translateTitle(title?: unknown): string {
  if (title === undefined || title === null || title === "") return "";
  const text = String(title);
  const key = `menus.${text}`;
  return i18n.global.te(key) ? String(i18n.global.t(key)) : text;
}

/** 生成完整标题：页面标题 - 系统名称 */
export function buildPageTitle(to: TitleRoute): string {
  const appName = defaultSettings.title || "BirdAdmin";
  const page = translateTitle(to.meta?.title);
  return page ? `${page} - ${appName}` : appName;
}

/**
 * 设置 document.title。
 * /redirect 是刷新标签页用的中转路由，跳过以免标题短暂闪烁成 Redirect。
 */
export function setPageTitle(to: TitleRoute): void {
  if (to.path.startsWith("/redirect")) return;
  document.title = buildPageTitle(to);
}
