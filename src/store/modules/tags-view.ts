import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import type { MenuRoute } from "@/api/rbac/types";
import { store } from "@/store";
import { findRouteByPath } from "@/router/utils";

export interface TagView {
  /** 完整路径（作为唯一标识） */
  path: string;
  /** 菜单标题 */
  title: string;
  /** 图标标识 */
  icon?: string;
  /** 是否固定（不可关闭） */
  affix: boolean;
}

interface TagsViewState {
  /** 已访问的页签 */
  visitedViews: TagView[];
  /** 是否持久化页签（参考 vue-pure-admin 的 multiTagsCache） */
  tagsViewCache: boolean;
}

/** 模块级持久化 ref：页签数据与缓存开关独立存储 */
const visitedViewsStorage = useStorage<TagView[]>("bird-tags-views", []);
const tagsViewCacheStorage = useStorage<boolean>("bird-tags-cache", false);

export const useTagsViewStore = defineStore("bird-tags-view", {
  state: (): TagsViewState => ({
    // 关闭持久化时不恢复历史页签，避免意外残留
    visitedViews: tagsViewCacheStorage.value ? [...visitedViewsStorage.value] : [],
    tagsViewCache: tagsViewCacheStorage.value,
  }),
  getters: {
    /** 第一个固定页签路径（通常是控制台） */
    affixPath(state): string | null {
      return state.visitedViews.find(view => view.affix)?.path || null;
    },
  },
  actions: {
    /** 同步页签数据到 localStorage（仅在开启持久化时写入） */
    persistViews() {
      visitedViewsStorage.value = this.tagsViewCache ? [...this.visitedViews] : [];
    },
    /** 设置是否持久化页签 */
    setTagsViewCache(value: boolean) {
      this.tagsViewCache = value;
      tagsViewCacheStorage.value = value;
      this.persistViews();
    },
    /** 根据路由加入页签；支持 hiddenTag / fixedTag meta 精细控制 */
    addView(route: RouteLocationNormalizedLoaded, menus: MenuRoute[]) {
      const path = route.path;
      const meta = route.meta as Record<string, unknown>;
      // hiddenTag / showLink:false 的路由不生成页签
      if (meta.hiddenTag === true || meta.showLink === false) return;
      if (this.visitedViews.some(view => view.path === path)) return;
      const menu = findRouteByPath(path, menus);
      const menuMeta = menu?.meta as unknown as Record<string, unknown> | undefined;
      this.visitedViews.push({
        path,
        title: (menu?.meta?.title as string) || (meta.title as string) || path,
        icon: (menu?.meta?.icon as string) || (meta.icon as string) || undefined,
        // 优先读取 meta.fixedTag；未声明时首个页签作为固定页签
        affix: meta.fixedTag === true || menuMeta?.fixedTag === true || this.visitedViews.length === 0,
      });
      this.persistViews();
    },
    /** 按路径关闭页签，固定页签不可关闭 */
    closeView(path: string): TagView[] {
      const index = this.visitedViews.findIndex(view => view.path === path);
      if (index === -1) return [];
      if (this.visitedViews[index].affix) return [];
      const removed = this.visitedViews.splice(index, 1);
      this.persistViews();
      return removed;
    },
    /** 关闭其他页签（保留固定页签与目标） */
    closeOthers(path: string) {
      this.visitedViews = this.visitedViews.filter(view => view.affix || view.path === path);
      this.persistViews();
    },
    /** 关闭全部页签（保留固定页签） */
    closeAll() {
      this.visitedViews = this.visitedViews.filter(view => view.affix);
      this.persistViews();
    },
    /** 关闭左侧页签（保留固定页签） */
    closeLeft(path: string) {
      const index = this.visitedViews.findIndex(view => view.path === path);
      if (index <= 0) return;
      this.visitedViews = this.visitedViews.filter((view, i) => i >= index || view.affix);
      this.persistViews();
    },
    /** 关闭右侧页签 */
    closeRight(path: string) {
      const index = this.visitedViews.findIndex(view => view.path === path);
      if (index === -1) return;
      this.visitedViews = this.visitedViews.filter((view, i) => i <= index || view.affix);
      this.persistViews();
    },
    /** 拖拽重排：把页签 fromIndex 移动到 toIndex */
    moveView(fromIndex: number, toIndex: number) {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= this.visitedViews.length ||
        toIndex >= this.visitedViews.length ||
        fromIndex === toIndex
      ) {
        return;
      }
      const [moved] = this.visitedViews.splice(fromIndex, 1);
      this.visitedViews.splice(toIndex, 0, moved);
      this.persistViews();
    },
    /** 退出登录时清空 */
    resetViews() {
      this.visitedViews = [];
      this.persistViews();
    },
  },
});

export function useTagsViewStoreHook() {
  return useTagsViewStore(store);
}
