/** 菜单管理：完整菜单树 + 菜单 CRUD（含按钮级权限节点） */
import { defineFakeRoute } from "vite-plugin-fake-server/client";
import {
  db,
  ok,
  errors,
  guard,
  isGuardError,
  buildMenuTree,
  buildMenuTreeForList,
  first,
  nextId,
  numericId,
} from "./helper";
import type { SysMenu } from "./data";

function findMenu(id: number) {
  return db.menus.find(item => item.id === id);
}

function readBody(body: Record<string, any>): Partial<SysMenu> {
  return {
    parentId: numericId(body.parentId),
    name: String(body.name ?? "").trim(),
    title: String(body.title ?? "").trim(),
    path: String(body.path ?? "").trim(),
    component: String(body.component ?? "").trim(),
    icon: String(body.icon ?? "").trim(),
    type: (["M", "C", "F"].includes(body.type) ? body.type : "C") as SysMenu["type"],
    permission: String(body.permission ?? "").trim(),
    order: Number(body.order) || 0,
    visible: body.visible === 0 || body.visible === "0" ? 0 : 1,
    keepAlive: body.keepAlive === 1 || body.keepAlive === "1" ? 1 : 0,
    redirect: body.redirect ? String(body.redirect) : undefined,
  };
}

export default defineFakeRoute([
  {
    url: "/api/menu/tree",
    method: "get",
    response: ({ headers }) => {
      const result = guard(headers, "system:menu:list");
      if (isGuardError(result)) return result.error;
      return ok(buildMenuTree());
    },
  },
  {
    url: "/api/menu/list",
    method: "get",
    response: ({ headers, query }) => {
      const result = guard(headers, "system:menu:list");
      if (isGuardError(result)) return result.error;
      const keyword = first(query.keyword) || "";
      // 返回树形结构：命中关键字时保留祖先链，供 el-table 的 tree-props 渲染层级
      return ok(buildMenuTreeForList(keyword));
    },
  },
  {
    url: "/api/menu/:id",
    method: "get",
    response: ({ headers, params }) => {
      const result = guard(headers, "system:menu:list");
      if (isGuardError(result)) return result.error;
      const menu = findMenu(numericId(params.id));
      return menu ? ok(menu) : errors.notFound("菜单");
    },
  },
  {
    url: "/api/menu",
    method: "post",
    response: ({ headers, body }) => {
      const result = guard(headers, "system:menu:add");
      if (isGuardError(result)) return result.error;
      const payload = readBody(body || {});
      if (!payload.title) return errors.badParams("菜单名称不能为空");
      if (payload.parentId && !findMenu(payload.parentId)) return errors.badParams("上级菜单不存在");
      const menu: SysMenu = {
        id: nextId(db.menus),
        parentId: payload.parentId || 0,
        name: payload.name || `Menu${nextId(db.menus)}`,
        title: payload.title!,
        path: payload.path || "",
        component: payload.component || "",
        icon: payload.icon || "",
        type: payload.type || "C",
        permission: payload.permission || "",
        order: payload.order || 0,
        visible: payload.visible ?? 1,
        keepAlive: payload.keepAlive ?? 0,
        redirect: payload.redirect,
      };
      db.menus.push(menu);
      return ok(menu, "新增成功");
    },
  },
  {
    url: "/api/menu/:id",
    method: "put",
    response: ({ headers, params, body }) => {
      const result = guard(headers, "system:menu:edit");
      if (isGuardError(result)) return result.error;
      const menu = findMenu(numericId(params.id));
      if (!menu) return errors.notFound("菜单");
      const payload = readBody(body || {});
      if (payload.parentId === menu.id) return errors.badParams("上级菜单不能是自己");
      Object.assign(menu, payload);
      return ok(menu, "修改成功");
    },
  },
  {
    url: "/api/menu/:id",
    method: "delete",
    response: ({ headers, params }) => {
      const result = guard(headers, "system:menu:delete");
      if (isGuardError(result)) return result.error;
      const id = numericId(params.id);
      const menu = findMenu(id);
      if (!menu) return errors.notFound("菜单");
      if (db.menus.some(item => item.parentId === id)) return errors.conflict("存在子菜单，无法删除");
      db.menus.splice(db.menus.indexOf(menu), 1);
      db.roles.forEach(role => {
        role.menuIds = role.menuIds.filter(item => item !== id);
      });
      return ok(null, "删除成功");
    },
  },
]);
