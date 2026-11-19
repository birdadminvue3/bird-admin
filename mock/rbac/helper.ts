/**
 * RBAC mock 公共能力：内存数据库、鉴权、权限计算、响应包装与分页。
 * 注意：生产构建不会加载 mock 目录，这里的数据仅用于本地开发联调。
 */
import {
  menuSeed,
  roleSeed,
  userSeed,
  deptSeed,
  postSeed,
  dictTypeSeed,
  dictDataSeed,
  type SysMenu,
  type SysUser,
} from "./data";

/**
 * 开发期可变数据。
 * 重要：vite-plugin-fake-server 会为每个 mock 文件单独 bundle，
 * 普通模块级变量会被复制成多份，导致跨接口 CRUD 不共享。
 * 因此把数据库挂到 globalThis 上，作为同一进程内的单例。
 */
const DB_KEY = "__BIRD_ADMIN_RBAC_DB_V1__";
/** 种子签名：种子内容一变（新增/修改菜单等）即触发 DB 重建，避免 dev server 不重启时用到旧数据 */
const DB_SIGNATURE_KEY = "__BIRD_ADMIN_RBAC_DB_SIGNATURE_V1__";

function createDb() {
  return {
    menus: menuSeed.map(item => ({ ...item })),
    roles: roleSeed.map(item => ({ ...item, menuIds: [...item.menuIds], deptIds: [...item.deptIds] })),
    users: userSeed.map(item => ({ ...item, postIds: [...item.postIds], roleIds: [...item.roleIds] })),
    depts: deptSeed.map(item => ({ ...item })),
    posts: postSeed.map(item => ({ ...item })),
    dictTypes: dictTypeSeed.map(item => ({ ...item })),
    dictData: dictDataSeed.map(item => ({ ...item })),
  };
}

/**
 * 基于所有种子数据计算签名（FNV-1a 32 位，无额外依赖）。
 * 只要任一 seed 变动，签名即变化；模块重新执行时会据此判定需要重建 DB。
 */
function seedSignature(): string {
  const raw = JSON.stringify([
    menuSeed,
    roleSeed,
    userSeed,
    deptSeed,
    postSeed,
    dictTypeSeed,
    dictDataSeed,
  ]);
  let hash = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `${raw.length}-${(hash >>> 0).toString(16)}`;
}

const globalRef = globalThis as typeof globalThis & Record<string, any>;
const signature = seedSignature();

// 首次加载或种子发生变化时重建内存 DB；签名一致则保留运行时 CRUD 的数据。
// 注意：vite-plugin-fake-server 为每个 mock 文件单独 bundle，helper 顶层会执行多次，
// 这里通过 globalThis 上的签名保证只有种子真正变化时才重建，避免互相覆盖。
if (globalRef[DB_SIGNATURE_KEY] !== signature || !globalRef[DB_KEY]) {
  globalRef[DB_KEY] = createDb();
  globalRef[DB_SIGNATURE_KEY] = signature;
}

export const db: ReturnType<typeof createDb> = globalRef[DB_KEY];

export const TOKEN_PREFIX = "eyJhbGciOiJIUzUxMiJ9.";
export const REFRESH_SUFFIX = "Refresh";
export const SUCCESS_CODES = [200, 0];

type QueryValue = string | string[] | undefined;
export type MockQuery = Record<string, QueryValue>;

/** 统一成功响应 */
export function ok<T>(data: T, message = "操作成功") {
  return { code: 200, data, message };
}

/** 统一失败响应（业务码，HTTP 状态保持 200） */
export function fail(code: number, message: string, data: unknown = null) {
  return { code, data, message };
}

/** 常用业务错误 */
export const errors = {
  unauthorized: () => fail(401, "登录状态已失效，请重新登录"),
  forbidden: () => fail(403, "没有操作权限，请联系管理员"),
  notFound: (name = "数据") => fail(404, `${name}不存在`),
  badParams: (message = "请求参数不正确") => fail(10005, message),
  conflict: (message: string) => fail(10006, message),
};

/** 从请求头解析当前用户 */
export function resolveUser(headers: Record<string, any>): SysUser | null {
  const raw = headers?.authorization ?? headers?.Authorization;
  const headerValue = Array.isArray(raw) ? raw[0] : raw;
  if (!headerValue) return null;
  const token = String(headerValue).replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  // accessToken 与 refreshToken 都映射到同一用户，便于刷新后继续调用
  const username = token.startsWith(TOKEN_PREFIX)
    ? token.slice(TOKEN_PREFIX.length).replace(new RegExp(`${REFRESH_SUFFIX}$`), "")
    : token;
  return db.users.find(item => item.username === username && item.status === 1) || null;
}

/** 用户拥有的权限标识；超级管理员返回通配符 */
export function getUserPermissions(user: SysUser): string[] {
  const roles = db.roles.filter(role => user.roleIds.includes(role.id) && role.status === 1);
  if (roles.some(role => role.code === "super_admin")) return ["*:*:*"];
  const menuIds = new Set(roles.flatMap(role => role.menuIds));
  return db.menus
    .filter(menu => menu.permission && menuIds.has(menu.id))
    .map(menu => menu.permission);
}

export function hasPermission(user: SysUser | null, permission?: string): boolean {
  if (!user) return false;
  if (!permission) return true;
  const permissions = getUserPermissions(user);
  return permissions.includes("*:*:*") || permissions.includes(permission);
}

/** 用户可访问的菜单 id（父目录在子菜单可访问时自动保留） */
export function getAccessibleMenuIds(user: SysUser): Set<number> {
  const roles = db.roles.filter(role => user.roleIds.includes(role.id) && role.status === 1);
  if (roles.some(role => role.code === "super_admin")) {
    return new Set(db.menus.map(menu => menu.id));
  }
  const granted = new Set(roles.flatMap(role => role.menuIds));
  const ids = new Set<number>();
  db.menus.forEach(menu => {
    if (menu.type === "F" || !granted.has(menu.id) || menu.visible !== 1) return;
    ids.add(menu.id);
    // 补齐祖先目录，保证父级菜单能显示
    let parentId = menu.parentId;
    while (parentId) {
      const parent = db.menus.find(item => item.id === parentId);
      if (!parent) break;
      ids.add(parent.id);
      parentId = parent.parentId;
    }
  });
  return ids;
}

/** 登录/用户信息接口返回的用户资料 */
export function buildProfile(user: SysUser) {
  const dept = db.depts.find(item => item.id === user.deptId);
  return {
    userId: user.id,
    avatar: user.avatar,
    username: user.username,
    nickname: user.nickname,
    deptId: user.deptId,
    deptName: dept?.name || "",
    roles: db.roles
      .filter(role => user.roleIds.includes(role.id) && role.status === 1)
      .map(role => role.code),
    roleIds: user.roleIds,
    permissions: getUserPermissions(user),
  };
}

/** 构造前端动态路由所需的菜单树（仅页面/目录，不含按钮） */
export function buildRouteTree(user: SysUser): Array<Record<string, any>> {
  const accessible = getAccessibleMenuIds(user);
  const menus = db.menus
    .filter(menu => menu.type !== "F" && menu.visible === 1 && accessible.has(menu.id))
    .sort((a, b) => a.order - b.order);

  const toNode = (menu: SysMenu): Record<string, any> => {
    const children = menus
      .filter(item => item.parentId === menu.id)
      .map(toNode);
    return {
      id: menu.id,
      name: menu.name,
      path: menu.path,
      component: menu.component,
      redirect: menu.redirect,
      meta: {
        title: menu.title,
        icon: menu.icon,
        showLink: menu.visible === 1,
        keepAlive: menu.keepAlive === 1,
        permission: menu.permission,
      },
      ...(children.length ? { children } : {}),
    };
  };

  return menus.filter(menu => menu.parentId === 0).map(toNode);
}

/** 完整菜单树（含按钮），用于角色授权页 */
export function buildMenuTree(): Array<SysMenu & { children?: SysMenu[] }> {
  return buildMenuTreeFrom(db.menus);
}

/**
 * 菜单管理列表专用：返回带 children 的树形结构。
 * 关键字命中时保留其祖先链，避免子节点因父级被过滤而丢失、层级断裂。
 */
export function buildMenuTreeForList(keyword?: string): Array<SysMenu & { children?: SysMenu[] }> {
  const kw = (keyword || "").trim();
  if (!kw) return buildMenuTreeFrom(db.menus);

  const lower = kw.toLowerCase();
  const matched = db.menus.filter(menu =>
    menu.title.toLowerCase().includes(lower) ||
    menu.permission.toLowerCase().includes(lower) ||
    menu.path.toLowerCase().includes(lower)
  );

  // 命中项 + 所有祖先一并保留
  const keep = new Set<number>();
  matched.forEach(menu => {
    keep.add(menu.id);
    let parentId = menu.parentId;
    while (parentId) {
      keep.add(parentId);
      parentId = db.menus.find(item => item.id === parentId)?.parentId || 0;
    }
  });
  return buildMenuTreeFrom(db.menus.filter(menu => keep.has(menu.id)));
}

/** 从给定菜单集合构建树（内部复用） */
function buildMenuTreeFrom(list: SysMenu[]): Array<SysMenu & { children?: SysMenu[] }> {
  const toNode = (menu: SysMenu): SysMenu & { children?: SysMenu[] } => {
    const children = list
      .filter(item => item.parentId === menu.id)
      .sort((a, b) => a.order - b.order)
      .map(toNode);
    return { ...menu, ...(children.length ? { children } : {}) };
  };
  return list
    .filter(menu => menu.parentId === 0)
    .sort((a, b) => a.order - b.order)
    .map(toNode);
}

/** 分页 + 关键字过滤 */
export function paginate<T>(
  list: T[],
  query: MockQuery,
  predicate: (item: T) => boolean = () => true
) {
  const pageNum = Math.max(1, Number(first(query.pageNum ?? query.page) ?? 1) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(first(query.pageSize) ?? 10) || 10));
  const filtered = list.filter(predicate);
  const start = (pageNum - 1) * pageSize;
  return {
    list: filtered.slice(start, start + pageSize),
    total: filtered.length,
    pageNum,
    pageSize,
  };
}

export function includes(value: QueryValue, keyword: string): boolean {
  return String(value ?? "").toLowerCase().includes(keyword.toLowerCase());
}

export function first(value: QueryValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function nextId(list: Array<{ id: number }>): number {
  return list.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export function numericId(value: unknown): number {
  return Number(value) || 0;
}

export function now(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** 需要登录 + 指定权限时才继续；否则返回错误响应 */
export function guard(
  headers: Record<string, any>,
  permission?: string
): { user: SysUser } | { error: ReturnType<typeof fail> } {
  const user = resolveUser(headers);
  if (!user) return { error: errors.unauthorized() };
  if (permission && !hasPermission(user, permission)) return { error: errors.forbidden() };
  return { user };
}

export function isGuardError(result: { user: SysUser } | { error: unknown }): result is { error: ReturnType<typeof fail> } {
  return "error" in result;
}
