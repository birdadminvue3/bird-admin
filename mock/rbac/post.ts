/** 岗位管理：分页列表 + CRUD */
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
} from "./helper";
import type { SysPost } from "./data";

function findPost(id: number) {
  return db.posts.find(item => item.id === id);
}

function readBody(body: Record<string, any>) {
  return {
    code: String(body.code ?? "").trim(),
    name: String(body.name ?? "").trim(),
    order: Number(body.order) || 0,
    status: (Number(body.status) === 0 ? 0 : 1) as 0 | 1,
    remark: String(body.remark ?? "").trim(),
  };
}

export default defineFakeRoute([
  {
    url: "/api/post/list",
    method: "get",
    response: ({ headers, query }) => {
      const result = guard(headers, "system:post:list");
      if (isGuardError(result)) return result.error;
      const keyword = first(query.name ?? query.keyword) || "";
      const status = first(query.status);
      return ok(
        paginate(db.posts, query, post =>
          (!keyword || includes(post.name, keyword) || includes(post.code, keyword)) &&
          (!status || String(post.status) === status)
        )
      );
    },
  },
  {
    url: "/api/post/options",
    method: "get",
    response: ({ headers }) => {
      const result = guard(headers);
      if (isGuardError(result)) return result.error;
      return ok(db.posts.filter(post => post.status === 1).map(({ id, code, name }) => ({ id, code, name })));
    },
  },
  {
    url: "/api/post/:id",
    method: "get",
    response: ({ headers, params }) => {
      const result = guard(headers, "system:post:list");
      if (isGuardError(result)) return result.error;
      const post = findPost(numericId(params.id));
      return post ? ok(post) : errors.notFound("岗位");
    },
  },
  {
    url: "/api/post",
    method: "post",
    response: ({ headers, body }) => {
      const result = guard(headers, "system:post:add");
      if (isGuardError(result)) return result.error;
      const payload = readBody(body || {});
      if (!payload.name || !payload.code) return errors.badParams("岗位名称和编码不能为空");
      if (db.posts.some(post => post.code === payload.code)) return errors.conflict("岗位编码已存在");
      const post: SysPost = { id: nextId(db.posts), ...payload };
      db.posts.push(post);
      return ok(post, "新增成功");
    },
  },
  {
    url: "/api/post/:id",
    method: "put",
    response: ({ headers, params, body }) => {
      const result = guard(headers, "system:post:edit");
      if (isGuardError(result)) return result.error;
      const post = findPost(numericId(params.id));
      if (!post) return errors.notFound("岗位");
      const payload = readBody(body || {});
      if (payload.code !== post.code && db.posts.some(item => item.code === payload.code)) {
        return errors.conflict("岗位编码已存在");
      }
      Object.assign(post, payload);
      return ok(post, "修改成功");
    },
  },
  {
    url: "/api/post/:id",
    method: "delete",
    response: ({ headers, params }) => {
      const result = guard(headers, "system:post:delete");
      if (isGuardError(result)) return result.error;
      const post = findPost(numericId(params.id));
      if (!post) return errors.notFound("岗位");
      if (db.users.some(user => user.postIds.includes(post.id))) {
        return errors.conflict("该岗位已分配给用户，无法删除");
      }
      db.posts.splice(db.posts.indexOf(post), 1);
      return ok(null, "删除成功");
    },
  },
]);
