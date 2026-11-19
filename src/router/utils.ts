import type { MenuRoute } from "@/api/rbac/types";

/**
 * 通过指定 key 找到目标节点的所有父级路径（DFS 回溯）。
 * 例：getParentPaths("/system/user", menus) -> ["/system"]
 */
export function getParentPaths(
  value: string,
  routes: MenuRoute[],
  key: keyof MenuRoute = "path"
): string[] {
  function dfs(list: MenuRoute[], parents: string[]): string[] {
    for (const item of list) {
      if ((item[key] as string) === value) return parents;
      if (!item.children?.length) continue;
      parents.push(item.path);
      const result = dfs(item.children, parents);
      if (result.length) return result;
      parents.pop();
    }
    return [];
  }
  return dfs(routes, []);
}

/** 在菜单树中递归查找指定 path 的节点 */
export function findRouteByPath(path: string, routes: MenuRoute[]): MenuRoute | null {
  for (const item of routes) {
    if (item.path === path) return item;
    if (item.children?.length) {
      const found = findRouteByPath(path, item.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 根据当前路由推导其所属的「一级（顶级）菜单」。
 *
 * 优先用完整父子链回溯（不依赖 path 前缀约定），命中不到时再退回首段匹配，
 * 兼顾叶子一级菜单与后端下发非标准子路径的情况。顶栏高亮与侧栏子菜单共用，
 * 避免两套推导逻辑不一致导致选中态错位。
 */
export function getTopMenuByPath(path: string, menus: MenuRoute[]): MenuRoute | null {
  const parents = getParentPaths(path, menus);
  if (parents.length) {
    return findRouteByPath(parents[0], menus);
  }
  const firstSegment = path.split("/").filter(Boolean)[0] || "";
  return findRouteByPath(path, menus) || findRouteByPath(`/${firstSegment}`, menus);
}

/** 根据当前路径取混合模式左侧应显示的二级菜单数据 */
export function getMixSubMenus(path: string, menus: MenuRoute[]): MenuRoute[] {
  return getTopMenuByPath(path, menus)?.children || [];
}

/** 计算当前路径对应的面包屑（父 -> 子） */
export function getBreadcrumbs(path: string, menus: MenuRoute[]): MenuRoute[] {
  const result: MenuRoute[] = [];
  function dfs(list: MenuRoute[], chain: MenuRoute[]): boolean {
    for (const item of list) {
      const next = [...chain, item];
      if (item.path === path) {
        result.push(...next);
        return true;
      }
      if (item.children?.length && dfs(item.children, next)) return true;
    }
    return false;
  }
  dfs(menus, []);
  return result;
}

/**
 * 取目录/页面对应的实际跳转地址：目录跳到第一个可见子菜单，页面直接返回自身。
 * 用于顶部菜单和混合模式的顶级菜单点击。
 */
export function resolveMenuPath(menu: MenuRoute): string {
  // 优先遵循后端配置的 redirect（目录节点通常指向首个页面）
  if (menu.redirect) return menu.redirect;
  if (menu.children?.length) {
    const first = menu.children.find(item => item.meta?.showLink !== false) || menu.children[0];
    return first.path;
  }
  return menu.path;
}
