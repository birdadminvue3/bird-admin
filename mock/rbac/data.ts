/**
 * RBAC 种子数据（仅本地 mock 使用，生产构建不会注入）
 *
 * 权限模型：用户 -> 角色 -> 菜单/按钮
 * - 菜单 type：M=目录、C=页面、F=按钮
 * - permission 为权限标识，支持 `*:*:*` 超集
 * - 数据中所有数组都是可变副本，便于开发期 CRUD 联调；刷新页面后重置
 */

export type MenuType = "M" | "C" | "F";
export type DataScope = 1 | 2 | 3 | 4 | 5; // 全部/自定义/本部门/本部门及以下/仅本人

export interface SysMenu {
  id: number;
  parentId: number;
  name: string;
  title: string;
  path: string;
  component: string;
  icon: string;
  type: MenuType;
  permission: string;
  order: number;
  visible: 0 | 1;
  keepAlive: 0 | 1;
  redirect?: string;
}

export interface SysRole {
  id: number;
  name: string;
  code: string;
  dataScope: DataScope;
  status: 0 | 1; // 1 正常 0 停用
  remark: string;
  menuIds: number[];
  deptIds: number[];
  createTime: string;
}

export interface SysUser {
  id: number;
  username: string;
  password: string;
  nickname: string;
  avatar: string;
  deptId: number;
  postIds: number[];
  roleIds: number[];
  phone: string;
  email: string;
  status: 0 | 1;
  createTime: string;
}

export interface SysDept {
  id: number;
  parentId: number;
  name: string;
  order: number;
  leader: string;
  phone: string;
  status: 0 | 1;
}

export interface SysPost {
  id: number;
  code: string;
  name: string;
  order: number;
  status: 0 | 1;
  remark: string;
}

export interface SysDictType {
  id: number;
  name: string;
  code: string;
  status: 0 | 1;
  remark: string;
}

export interface SysDictData {
  id: number;
  dictCode: string;
  label: string;
  value: string;
  order: number;
  status: 0 | 1;
  remark: string;
}

/** 菜单种子：id 1/2/9/13 为父级，3~8 系统管理，10~12 异常页面，14~15 权限管理，3xx/15xx 为按钮权限 */
export const menuSeed: SysMenu[] = [
  // ---------- 父级菜单 ----------
  {
    id: 1,
    parentId: 0,
    name: "Dashboard",
    title: "控制台",
    path: "/dashboard",
    component: "dashboard/index",
    icon: "ep:home-filled",
    type: "C",
    permission: "dashboard:view",
    order: 1,
    visible: 1,
    keepAlive: 1,
  },
  {
    id: 2,
    parentId: 0,
    name: "SystemManage",
    title: "系统管理",
    path: "/system",
    component: "",
    icon: "ep:setting",
    type: "M",
    permission: "system:manage",
    order: 2,
    visible: 1,
    keepAlive: 0,
    redirect: "/system/menu",
  },

  // ---------- 系统管理子菜单 ----------
  {
    id: 3,
    parentId: 2,
    name: "SystemMenu",
    title: "菜单管理",
    path: "/system/menu",
    component: "system/resource",
    icon: "ep:menu",
    type: "C",
    permission: "system:menu:list",
    order: 1,
    visible: 1,
    keepAlive: 1,
  },
  {
    id: 4,
    parentId: 2,
    name: "SystemRole",
    title: "角色管理",
    path: "/system/role",
    component: "system/resource",
    icon: "ep:user-filled",
    type: "C",
    permission: "system:role:list",
    order: 2,
    visible: 1,
    keepAlive: 1,
  },
  {
    id: 5,
    parentId: 2,
    name: "SystemUser",
    title: "用户管理",
    path: "/system/user",
    component: "system/resource",
    icon: "ep:avatar",
    type: "C",
    permission: "system:user:list",
    order: 3,
    visible: 1,
    keepAlive: 1,
  },
  {
    id: 6,
    parentId: 2,
    name: "SystemDept",
    title: "部门管理",
    path: "/system/dept",
    component: "system/resource",
    icon: "ep:office-building",
    type: "C",
    permission: "system:dept:list",
    order: 4,
    visible: 1,
    keepAlive: 1,
  },
  {
    id: 7,
    parentId: 2,
    name: "SystemPost",
    title: "岗位管理",
    path: "/system/post",
    component: "system/resource",
    icon: "ep:postcard",
    type: "C",
    permission: "system:post:list",
    order: 5,
    visible: 1,
    keepAlive: 1,
  },
  {
    id: 8,
    parentId: 2,
    name: "SystemDict",
    title: "字典管理",
    path: "/system/dict",
    component: "system/resource",
    icon: "ep:notebook",
    type: "C",
    permission: "system:dict:list",
    order: 6,
    visible: 1,
    keepAlive: 1,
  },

  // ---------- 异常页面 ----------
  {
    id: 9,
    parentId: 0,
    name: "ErrorPage",
    title: "异常页面",
    path: "/error",
    component: "",
    icon: "ep:warning-filled",
    type: "M",
    permission: "error:page",
    order: 3,
    visible: 1,
    keepAlive: 0,
    redirect: "/error/403",
  },
  {
    id: 10,
    parentId: 9,
    name: "Error403",
    title: "403",
    path: "/error/403",
    component: "error/403",
    icon: "ep:circle-close",
    type: "C",
    permission: "error:403",
    order: 1,
    visible: 1,
    keepAlive: 0,
  },
  {
    id: 11,
    parentId: 9,
    name: "Error404",
    title: "404",
    path: "/error/404",
    component: "error/404",
    icon: "ep:document",
    type: "C",
    permission: "error:404",
    order: 2,
    visible: 1,
    keepAlive: 0,
  },
  {
    id: 12,
    parentId: 9,
    name: "Error500",
    title: "500",
    path: "/error/500",
    component: "error/500",
    icon: "ep:warning",
    type: "C",
    permission: "error:500",
    order: 3,
    visible: 1,
    keepAlive: 0,
  },

  // ---------- 权限管理（演示模块）----------
  {
    id: 13,
    parentId: 0,
    name: "PermissionManage",
    title: "权限管理",
    path: "/permission",
    component: "",
    icon: "ep:lock",
    type: "M",
    permission: "permission:manage",
    order: 4,
    visible: 1,
    keepAlive: 0,
    redirect: "/permission/page",
  },
  {
    id: 14,
    parentId: 13,
    name: "PermissionPage",
    title: "页面权限",
    path: "/permission/page",
    component: "permission/page",
    icon: "ep:key",
    type: "C",
    permission: "permission:page:view",
    order: 1,
    visible: 1,
    keepAlive: 0,
  },
  {
    id: 15,
    parentId: 13,
    name: "PermissionButton",
    title: "按钮权限",
    path: "/permission/button",
    component: "permission/button",
    icon: "ep:pointer",
    type: "C",
    permission: "permission:button:view",
    order: 2,
    visible: 1,
    keepAlive: 0,
  },
  // 演示用按钮级权限码：不同角色授权不同，用于演示按钮显隐
  {
    id: 1501, parentId: 15, name: "", title: "新增按钮", path: "", component: "", icon: "",
    type: "F", permission: "permission:btn:add", order: 1, visible: 0, keepAlive: 0,
  },
  {
    id: 1502, parentId: 15, name: "", title: "编辑按钮", path: "", component: "", icon: "",
    type: "F", permission: "permission:btn:edit", order: 2, visible: 0, keepAlive: 0,
  },
  {
    id: 1503, parentId: 15, name: "", title: "删除按钮", path: "", component: "", icon: "",
    type: "F", permission: "permission:btn:delete", order: 3, visible: 0, keepAlive: 0,
  },

  // ---------- 按钮级权限 ----------
  ...buttonMenus(3, "菜单", "menu"),
  ...buttonMenus(4, "角色", "role", ["assign"]),
  ...buttonMenus(5, "用户", "user", ["resetPwd", "assignRole"]),
  ...buttonMenus(6, "部门", "dept"),
  ...buttonMenus(7, "岗位", "post"),
  ...buttonMenus(8, "字典", "dict"),
];

/** 为每个页面生成 增/改/删 按钮，extra 可追加特殊操作 */
function buttonMenus(
  parentId: number,
  label: string,
  key: string,
  extra: string[] = []
): SysMenu[] {
  const actions: Array<[string, string]> = [
    ["add", "新增"],
    ["edit", "修改"],
    ["delete", "删除"],
  ];
  extra.forEach(action => {
    const names: Record<string, string> = {
      assign: "分配权限",
      resetPwd: "重置密码",
      assignRole: "分配角色",
    };
    actions.push([action, names[action] || action]);
  });
  return actions.map(([action, title], index) => ({
    id: parentId * 100 + index + 1,
    parentId,
    name: "",
    title: `${title}${label}`,
    path: "",
    component: "",
    icon: "",
    type: "F" as const,
    permission: `system:${key}:${action}`,
    order: index + 1,
    visible: 0,
    keepAlive: 0,
  }));
}

const ALL_MENU_IDS = menuSeed.map(item => item.id);

/** 异常页面：所有角色均可访问（403 本就是给无权限用户展示的） */
const ERROR_MENU_IDS = [9, 10, 11, 12];

/**
 * 权限管理演示模块：父级 + 两个页面（13/14/15）所有角色可访问；
 * 按钮权限码（1501/1502/1503）按角色递减，用于演示「切换角色后按钮显隐变化」：
 * - 超级管理员：`*:*:*` 全量（见 ALL_MENU_IDS）
 * - 系统管理员：add + edit
 * - 审计员：仅 add
 * - 访客：无按钮权限
 */
const PERMISSION_PAGE_IDS = [13, 14, 15];
const PERMISSION_BTN_IDS = [1501, 1502, 1503];

/** 系统管理常用菜单 + 按钮（不含岗位、字典，用于演示角色差异） */
const SYSTEM_PARTIAL_IDS = [
  2, 3, 4, 5, 6,
  301, 302, 303, // 菜单管理按钮
  401, 402, 403, 404, // 角色管理按钮（含分配权限）
  501, 502, 503, 504, 505, // 用户管理按钮
  601, 602, 603, // 部门管理按钮
];

export const roleSeed: SysRole[] = [
  {
    id: 1,
    name: "超级管理员",
    code: "super_admin",
    dataScope: 1,
    status: 1,
    remark: "拥有系统全部菜单与按钮权限",
    menuIds: ALL_MENU_IDS,
    deptIds: [],
    createTime: "2026-01-01 09:00:00",
  },
  {
    id: 2,
    name: "系统管理员",
    code: "system_admin",
    dataScope: 2,
    status: 1,
    remark: "可管理菜单/角色/用户/部门，不能管理岗位与字典",
    menuIds: [...SYSTEM_PARTIAL_IDS, ...ERROR_MENU_IDS, ...PERMISSION_PAGE_IDS, ...PERMISSION_BTN_IDS.slice(0, 2)],
    deptIds: [1, 2, 3, 4, 5, 6],
    createTime: "2026-01-02 10:20:00",
  },
  {
    id: 3,
    name: "审计员",
    code: "auditor",
    dataScope: 4,
    status: 1,
    remark: "只读：控制台 + 用户列表，无新增/修改/删除按钮",
    menuIds: [1, 2, 5, ...ERROR_MENU_IDS, ...PERMISSION_PAGE_IDS, ...PERMISSION_BTN_IDS.slice(0, 1)],
    deptIds: [1],
    createTime: "2026-02-11 14:35:00",
  },
  {
    id: 4,
    name: "访客",
    code: "visitor",
    dataScope: 5,
    status: 1,
    remark: "仅可访问控制台与异常页面",
    menuIds: [1, ...ERROR_MENU_IDS, ...PERMISSION_PAGE_IDS],
    deptIds: [],
    createTime: "2026-03-08 11:00:00",
  },
];

export const userSeed: SysUser[] = [
  {
    id: 1,
    username: "admin",
    password: "123456",
    nickname: "超级管理员",
    avatar: "https://avatars.githubusercontent.com/u/44761321",
    deptId: 2,
    postIds: [1],
    roleIds: [1],
    phone: "13800000001",
    email: "admin@bird.admin",
    status: 1,
    createTime: "2026-01-01 09:00:00",
  },
  {
    id: 2,
    username: "system",
    password: "123456",
    nickname: "系统管理员",
    avatar: "https://avatars.githubusercontent.com/u/44761321",
    deptId: 4,
    postIds: [2],
    roleIds: [2],
    phone: "13800000002",
    email: "system@bird.admin",
    status: 1,
    createTime: "2026-01-02 10:20:00",
  },
  {
    id: 3,
    username: "auditor",
    password: "123456",
    nickname: "审计员",
    avatar: "https://avatars.githubusercontent.com/u/44761321",
    deptId: 3,
    postIds: [3],
    roleIds: [3],
    phone: "13800000003",
    email: "auditor@bird.admin",
    status: 1,
    createTime: "2026-02-11 14:35:00",
  },
  {
    id: 4,
    username: "guest",
    password: "123456",
    nickname: "访客用户",
    avatar: "https://avatars.githubusercontent.com/u/44761321",
    deptId: 6,
    postIds: [4],
    roleIds: [4],
    phone: "13800000004",
    email: "guest@bird.admin",
    status: 1,
    createTime: "2026-03-08 11:00:00",
  },
];

export const deptSeed: SysDept[] = [
  { id: 1, parentId: 0, name: "Bird 科技", order: 1, leader: "陈总", phone: "13800000000", status: 1 },
  { id: 2, parentId: 1, name: "研发中心", order: 1, leader: "张经理", phone: "13800000010", status: 1 },
  { id: 3, parentId: 1, name: "产品部", order: 2, leader: "李经理", phone: "13800000020", status: 1 },
  { id: 4, parentId: 2, name: "后端组", order: 1, leader: "王组长", phone: "13800000011", status: 1 },
  { id: 5, parentId: 2, name: "前端组", order: 2, leader: "赵组长", phone: "13800000012", status: 1 },
  { id: 6, parentId: 1, name: "运营部", order: 3, leader: "刘经理", phone: "13800000030", status: 1 },
];

export const postSeed: SysPost[] = [
  { id: 1, code: "FE_ENGINEER", name: "前端工程师", order: 1, status: 1, remark: "Vue / TypeScript" },
  { id: 2, code: "BE_ENGINEER", name: "后端工程师", order: 2, status: 1, remark: "Java / Go" },
  { id: 3, code: "PRODUCT_MANAGER", name: "产品经理", order: 3, status: 1, remark: "需求与产品设计" },
  { id: 4, code: "OPERATION", name: "运营专员", order: 4, status: 1, remark: "内容与活动" },
  { id: 5, code: "DEPT_MANAGER", name: "部门经理", order: 5, status: 0, remark: "部门负责人（停用）" },
];

export const dictTypeSeed: SysDictType[] = [
  { id: 1, name: "系统正常/停用", code: "sys_normal_disable", status: 1, remark: "通用状态字典" },
  { id: 2, name: "用户性别", code: "sys_user_sex", status: 1, remark: "性别字典" },
  { id: 3, name: "通知类型", code: "sys_notice_type", status: 1, remark: "通知公告类型" },
];

export const dictDataSeed: SysDictData[] = [
  { id: 1, dictCode: "sys_normal_disable", label: "正常", value: "0", order: 1, status: 1, remark: "" },
  { id: 2, dictCode: "sys_normal_disable", label: "停用", value: "1", order: 2, status: 1, remark: "" },
  { id: 3, dictCode: "sys_user_sex", label: "男", value: "0", order: 1, status: 1, remark: "" },
  { id: 4, dictCode: "sys_user_sex", label: "女", value: "1", order: 2, status: 1, remark: "" },
  { id: 5, dictCode: "sys_user_sex", label: "未知", value: "2", order: 3, status: 1, remark: "" },
  { id: 6, dictCode: "sys_notice_type", label: "通知", value: "1", order: 1, status: 1, remark: "" },
  { id: 7, dictCode: "sys_notice_type", label: "公告", value: "2", order: 2, status: 1, remark: "" },
];
