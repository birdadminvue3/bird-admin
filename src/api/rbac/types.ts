/** RBAC 接口类型：与 mock/rbac 返回结构一一对应 */

export type MenuType = "M" | "C" | "F";
export type DataScope = 1 | 2 | 3 | 4 | 5;

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
  children?: SysMenu[];
}

export interface SysRole {
  id: number;
  name: string;
  code: string;
  dataScope: DataScope;
  status: 0 | 1;
  remark: string;
  menuIds: number[];
  deptIds: number[];
  createTime: string;
}

export interface SysUser {
  id: number;
  username: string;
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
  children?: SysDept[];
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

export interface PageQuery {
  pageNum?: number;
  pageSize?: number;
  [key: string]: any;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

/** 后端下发的可访问路由（前端转换为 RouteRecordRaw） */
export interface MenuRoute {
  id: number;
  name: string;
  path: string;
  component: string;
  redirect?: string;
  meta: {
    title: string;
    icon: string;
    showLink: boolean;
    keepAlive: boolean;
    permission: string;
  };
  children?: MenuRoute[];
}
