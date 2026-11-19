/** 角色管理：列表、CRUD、菜单授权、状态切换 */
import { defineFakeRoute } from "vite-plugin-fake-server/client";
import {
  db,
  ok,
  errors,
  guard,
  isGuardError,
  paginate,
  includes,
  first,
  nextId,
  numericId,
  now,
} from "./helper";
import type { SysRole } from "./data";

function findRole(id: number) {
  return db.roles.find(item => item.id === id);
}

function readBody(body: Record<string, any>) {
  return {
    name: String(body.name ?? "").trim(),
    code: String(body.code ?? "").trim(),
    dataScope: ([1, 2, 3, 4, 5].includes(Number(body.dataScope)) ? Number(body.dataScope) : 1) as SysRole["dataScope"],
    status: (Number(body.status) === 0 ? 0 : 1) as 0 | 1,
    remark: String(body.remark ?? "").trim(),
    menuIds: Array.isArray(body.menuIds) ? body.menuIds.map(numericId) : undefined,
    deptIds: Array.isArray(body.deptIds) ? body.deptIds.map(numericId) : undefined,
  };
}

export default defineFakeRoute([
  {
    url: "/api/role/list",
    method: "get",
    response: ({ headers, query }) => {
      const result = guard(headers, "system:role:list");
      if (isGuardError(result)) return result.error;
      const keyword = first(query.name ?? query.keyword) || "";
      const status = first(query.status);
      return ok(
        paginate(db.roles, query, role =>
          (!keyword || includes(role.name, keyword) || includes(role.code, keyword)) &&
          (!status || String(role.status) === status)
        )
      );
    },
  },
  {
    /** 用户管理页分配角色用的精简列表 */
    url: "/api/role/options",
    method: "get",
    response: ({ headers }) => {
      const result = guard(headers);
      if (isGuardError(result)) return result.error;
      return ok(
        db.roles
          .filter(role => role.status === 1)
          .map(({ id, name, code }) => ({ id, name, code }))
      );
    },
  },
  {
    url: "/api/role/:id",
    method: "get",
    response: ({ headers, params }) => {
      const result = guard(headers, "system:role:list");
      if (isGuardError(result)) return result.error;
      const role = findRole(numericId(params.id));
      if (!role) return errors.notFound("角色");
      return ok({ ...role, menuIds: [...role.menuIds], deptIds: [...role.deptIds] });
    },
  },
  {
    url: "/api/role",
    method: "post",
    response: ({ headers, body }) => {
      const result = guard(headers, "system:role:add");
      if (isGuardError(result)) return result.error;
      const payload = readBody(body || {});
      if (!payload.name || !payload.code) return errors.badParams("角色名称和标识不能为空");
      if (db.roles.some(role => role.code === payload.code)) return errors.conflict("角色标识已存在");
      const role: SysRole = {
        id: nextId(db.roles),
        name: payload.name!,
        code: payload.code!,
        dataScope: payload.dataScope || 1,
        status: payload.status ?? 1,
        remark: payload.remark || "",
        menuIds: payload.menuIds || [],
        deptIds: payload.deptIds || [],
        createTime: now(),
      };
      db.roles.push(role);
      return ok(role, "新增成功");
    },
  },
  {
    url: "/api/role/:id",
    method: "put",
    response: ({ headers, params, body }) => {
      const result = guard(headers, "system:role:edit");
      if (isGuardError(result)) return result.error;
      const role = findRole(numericId(params.id));
      if (!role) return errors.notFound("角色");
      const payload = readBody(body || {});
      if (payload.code && payload.code !== role.code && db.roles.some(item => item.code === payload.code)) {
        return errors.conflict("角色标识已存在");
      }
      Object.assign(role, payload);
      return ok(role, "修改成功");
    },
  },
  {
    url: "/api/role/:id",
    method: "delete",
    response: ({ headers, params }) => {
      const result = guard(headers, "system:role:delete");
      if (isGuardError(result)) return result.error;
      const role = findRole(numericId(params.id));
      if (!role) return errors.notFound("角色");
      if (role.code === "super_admin") return errors.conflict("超级管理员角色不可删除");
      if (db.users.some(user => user.roleIds.includes(role.id))) {
        return errors.conflict("该角色已分配给用户，无法删除");
      }
      db.roles.splice(db.roles.indexOf(role), 1);
      return ok(null, "删除成功");
    },
  },
  {
    /** 角色授权：body.menuIds 为勾选的菜单/按钮 id 全集 */
    url: "/api/role/:id/permissions",
    method: "put",
    response: ({ headers, params, body }) => {
      const result = guard(headers, "system:role:assign");
      if (isGuardError(result)) return result.error;
      const role = findRole(numericId(params.id));
      if (!role) return errors.notFound("角色");
      if (!Array.isArray(body?.menuIds)) return errors.badParams("menuIds 必须是数组");
      const menuIds = body.menuIds.map(numericId).filter(id => db.menus.some(menu => menu.id === id));
      role.menuIds = Array.from(new Set(menuIds));
      return ok({ roleId: role.id, menuIds: role.menuIds }, "授权成功");
    },
  },
  {
    url: "/api/role/:id/status",
    method: "put",
    response: ({ headers, params, body }) => {
      const result = guard(headers, "system:role:edit");
      if (isGuardError(result)) return result.error;
      const role = findRole(numericId(params.id));
      if (!role) return errors.notFound("角色");
      if (role.code === "super_admin") return errors.conflict("超级管理员角色不可停用");
      role.status = Number(body?.status) === 0 ? 0 : 1;
      return ok(role, "状态更新成功");
    },
  },
]);
