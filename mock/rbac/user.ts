/** 用户管理：列表、CRUD、分配角色、重置密码、状态切换 */
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
import type { SysUser } from "./data";

function findUser(id: number) {
  return db.users.find(item => item.id === id);
}

/** 绝不把密码返回给前端 */
function publicUser(user: SysUser) {
  const { password: _password, ...rest } = user;
  return { ...rest, roleIds: [...user.roleIds], postIds: [...user.postIds] };
}

function readBody(body: Record<string, any>) {
  return {
    username: String(body.username ?? "").trim(),
    nickname: String(body.nickname ?? "").trim(),
    deptId: numericId(body.deptId),
    postIds: Array.isArray(body.postIds) ? body.postIds.map(numericId) : [],
    roleIds: Array.isArray(body.roleIds) ? body.roleIds.map(numericId) : [],
    phone: String(body.phone ?? "").trim(),
    email: String(body.email ?? "").trim(),
    status: (Number(body.status) === 0 ? 0 : 1) as 0 | 1,
  };
}

export default defineFakeRoute([
  {
    url: "/api/user/list",
    method: "get",
    response: ({ headers, query }) => {
      const result = guard(headers, "system:user:list");
      if (isGuardError(result)) return result.error;
      const keyword = first(query.username ?? query.keyword) || "";
      const deptId = first(query.deptId);
      const status = first(query.status);
      const page = paginate(db.users, query, user =>
        (!keyword ||
          includes(user.username, keyword) ||
          includes(user.nickname, keyword) ||
          includes(user.phone, keyword)) &&
        (!deptId || user.deptId === Number(deptId)) &&
        (!status || String(user.status) === status)
      );
      return ok({ ...page, list: page.list.map(publicUser) });
    },
  },
  {
    url: "/api/user/:id",
    method: "get",
    response: ({ headers, params }) => {
      const result = guard(headers, "system:user:list");
      if (isGuardError(result)) return result.error;
      const user = findUser(numericId(params.id));
      return user ? ok(publicUser(user)) : errors.notFound("用户");
    },
  },
  {
    url: "/api/user",
    method: "post",
    response: ({ headers, body }) => {
      const result = guard(headers, "system:user:add");
      if (isGuardError(result)) return result.error;
      const payload = readBody(body || {});
      if (!payload.username || !payload.nickname) return errors.badParams("账号和昵称不能为空");
      if (db.users.some(user => user.username === payload.username)) return errors.conflict("账号已存在");
      const user: SysUser = {
        id: nextId(db.users),
        username: payload.username,
        password: String(body?.password || "123456"),
        nickname: payload.nickname,
        avatar: "https://avatars.githubusercontent.com/u/44761321",
        deptId: payload.deptId,
        postIds: payload.postIds,
        roleIds: payload.roleIds,
        phone: payload.phone,
        email: payload.email,
        status: payload.status,
        createTime: now(),
      };
      db.users.push(user);
      return ok(publicUser(user), "新增成功");
    },
  },
  {
    url: "/api/user/:id",
    method: "put",
    response: ({ headers, params, body }) => {
      const result = guard(headers, "system:user:edit");
      if (isGuardError(result)) return result.error;
      const user = findUser(numericId(params.id));
      if (!user) return errors.notFound("用户");
      const payload = readBody(body || {});
      if (payload.username !== user.username && db.users.some(item => item.username === payload.username)) {
        return errors.conflict("账号已存在");
      }
      Object.assign(user, payload);
      return ok(publicUser(user), "修改成功");
    },
  },
  {
    url: "/api/user/:id",
    method: "delete",
    response: ({ headers, params }) => {
      const result = guard(headers, "system:user:delete");
      if (isGuardError(result)) return result.error;
      const user = findUser(numericId(params.id));
      if (!user) return errors.notFound("用户");
      if (user.username === "admin") return errors.conflict("超级管理员账号不可删除");
      db.users.splice(db.users.indexOf(user), 1);
      return ok(null, "删除成功");
    },
  },
  {
    /** 分配角色：body.roleIds 为角色 id 数组 */
    url: "/api/user/:id/roles",
    method: "put",
    response: ({ headers, params, body }) => {
      const result = guard(headers, "system:user:assignRole");
      if (isGuardError(result)) return result.error;
      const user = findUser(numericId(params.id));
      if (!user) return errors.notFound("用户");
      if (!Array.isArray(body?.roleIds)) return errors.badParams("roleIds 必须是数组");
      const roleIds = body.roleIds
        .map(numericId)
        .filter(id => db.roles.some(role => role.id === id && role.status === 1));
      user.roleIds = Array.from(new Set(roleIds));
      return ok({ userId: user.id, roleIds: user.roleIds }, "分配成功");
    },
  },
  {
    url: "/api/user/:id/password",
    method: "put",
    response: ({ headers, params, body }) => {
      const result = guard(headers, "system:user:resetPwd");
      if (isGuardError(result)) return result.error;
      const user = findUser(numericId(params.id));
      if (!user) return errors.notFound("用户");
      const password = String(body?.password || "");
      if (password.length < 6) return errors.badParams("密码长度不能少于 6 位");
      user.password = password;
      return ok(null, "密码重置成功");
    },
  },
  {
    url: "/api/user/:id/status",
    method: "put",
    response: ({ headers, params, body }) => {
      const result = guard(headers, "system:user:edit");
      if (isGuardError(result)) return result.error;
      const user = findUser(numericId(params.id));
      if (!user) return errors.notFound("用户");
      if (user.username === "admin") return errors.conflict("超级管理员账号不可停用");
      user.status = Number(body?.status) === 0 ? 0 : 1;
      return ok(null, "状态更新成功");
    },
  },
]);
