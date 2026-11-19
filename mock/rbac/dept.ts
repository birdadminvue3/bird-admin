/** 部门管理：树形结构 + CRUD */
import { defineFakeRoute } from "vite-plugin-fake-server/client";
import {
  db,
  ok,
  errors,
  guard,
  isGuardError,
  first,
  nextId,
  numericId,
} from "./helper";
import type { SysDept } from "./data";

function findDept(id: number) {
  return db.depts.find(item => item.id === id);
}

function deptTree(): Array<SysDept & { children?: SysDept[] }> {
  const toNode = (dept: SysDept): SysDept & { children?: SysDept[] } => {
    const children = db.depts
      .filter(item => item.parentId === dept.id)
      .sort((a, b) => a.order - b.order)
      .map(toNode);
    return { ...dept, ...(children.length ? { children } : {}) };
  };
  return db.depts
    .filter(item => item.parentId === 0)
    .sort((a, b) => a.order - b.order)
    .map(toNode);
}

function readBody(body: Record<string, any>) {
  return {
    parentId: numericId(body.parentId),
    name: String(body.name ?? "").trim(),
    order: Number(body.order) || 0,
    leader: String(body.leader ?? "").trim(),
    phone: String(body.phone ?? "").trim(),
    status: (Number(body.status) === 0 ? 0 : 1) as 0 | 1,
  };
}

export default defineFakeRoute([
  {
    url: "/api/dept/tree",
    method: "get",
    response: ({ headers }) => {
      const result = guard(headers, "system:dept:list");
      if (isGuardError(result)) return result.error;
      return ok(deptTree());
    },
  },
  {
    url: "/api/dept/list",
    method: "get",
    response: ({ headers, query }) => {
      const result = guard(headers, "system:dept:list");
      if (isGuardError(result)) return result.error;
      const keyword = first(query.name ?? query.keyword) || "";
      return ok(db.depts.filter(dept => !keyword || dept.name.includes(keyword)));
    },
  },
  {
    url: "/api/dept/:id",
    method: "get",
    response: ({ headers, params }) => {
      const result = guard(headers, "system:dept:list");
      if (isGuardError(result)) return result.error;
      const dept = findDept(numericId(params.id));
      return dept ? ok(dept) : errors.notFound("部门");
    },
  },
  {
    url: "/api/dept",
    method: "post",
    response: ({ headers, body }) => {
      const result = guard(headers, "system:dept:add");
      if (isGuardError(result)) return result.error;
      const payload = readBody(body || {});
      if (!payload.name) return errors.badParams("部门名称不能为空");
      if (payload.parentId && !findDept(payload.parentId)) return errors.badParams("上级部门不存在");
      const dept: SysDept = { id: nextId(db.depts), ...payload };
      db.depts.push(dept);
      return ok(dept, "新增成功");
    },
  },
  {
    url: "/api/dept/:id",
    method: "put",
    response: ({ headers, params, body }) => {
      const result = guard(headers, "system:dept:edit");
      if (isGuardError(result)) return result.error;
      const dept = findDept(numericId(params.id));
      if (!dept) return errors.notFound("部门");
      const payload = readBody(body || {});
      if (payload.parentId === dept.id) return errors.badParams("上级部门不能是自己");
      Object.assign(dept, payload);
      return ok(dept, "修改成功");
    },
  },
  {
    url: "/api/dept/:id",
    method: "delete",
    response: ({ headers, params }) => {
      const result = guard(headers, "system:dept:delete");
      if (isGuardError(result)) return result.error;
      const id = numericId(params.id);
      const dept = findDept(id);
      if (!dept) return errors.notFound("部门");
      if (db.depts.some(item => item.parentId === id)) return errors.conflict("存在子部门，无法删除");
      if (db.users.some(user => user.deptId === id)) return errors.conflict("部门下存在用户，无法删除");
      db.depts.splice(db.depts.indexOf(dept), 1);
      return ok(null, "删除成功");
    },
  },
]);
