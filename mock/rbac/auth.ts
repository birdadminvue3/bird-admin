/** 认证与当前用户路由：登录、刷新、用户信息、动态路由、登出 */
import { defineFakeRoute } from "vite-plugin-fake-server/client";
import {
  db,
  ok,
  fail,
  guard,
  isGuardError,
  buildProfile,
  buildRouteTree,
  TOKEN_PREFIX,
  REFRESH_SUFFIX,
} from "./helper";

const EXPIRES_IN = 7200;

function issueTokens(username: string) {
  return {
    accessToken: `${TOKEN_PREFIX}${username}`,
    refreshToken: `${TOKEN_PREFIX}${username}${REFRESH_SUFFIX}`,
    expiresIn: EXPIRES_IN,
    tokenType: "Bearer",
  };
}

export default defineFakeRoute([
  {
    url: "/api/login",
    method: "post",
    response: ({ body }) => {
      const { username, password } = body || {};
      if (!username || !password) return fail(10005, "请输入账号和密码");
      const user = db.users.find(item => item.username === username);
      if (!user || user.password !== password) return fail(10002, "账号或密码错误");
      if (user.status !== 1) return fail(10003, "账号已被停用，请联系管理员");
      return ok({ ...buildProfile(user), ...issueTokens(user.username) }, "登录成功");
    },
  },
  {
    url: "/api/auth/refresh-token",
    method: "post",
    response: ({ body }) => {
      const refreshToken = String(body?.refreshToken || "");
      if (!refreshToken.startsWith(TOKEN_PREFIX) || !refreshToken.endsWith(REFRESH_SUFFIX)) {
        return fail(401, "refreshToken 无效");
      }
      const username = refreshToken
        .slice(TOKEN_PREFIX.length)
        .slice(0, -REFRESH_SUFFIX.length);
      const user = db.users.find(item => item.username === username && item.status === 1);
      if (!user) return fail(401, "用户不存在或已停用");
      return ok(issueTokens(user.username), "刷新成功");
    },
  },
  {
    url: "/api/auth/getUserInfo",
    method: "get",
    response: ({ headers }) => {
      const result = guard(headers);
      if (isGuardError(result)) return result.error;
      return ok(buildProfile(result.user));
    },
  },
  {
    /** 根据当前用户权限返回可访问的路由树，前端用它动态 addRoute */
    url: "/api/auth/routes",
    method: "get",
    response: ({ headers }) => {
      const result = guard(headers);
      if (isGuardError(result)) return result.error;
      return ok(buildRouteTree(result.user));
    },
  },
  {
    url: "/api/auth/logout",
    method: "post",
    response: () => ok(null, "退出成功"),
  },
]);
