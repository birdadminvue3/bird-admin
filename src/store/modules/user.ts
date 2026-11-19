import { defineStore } from "pinia";
import { store } from "@/store";
import { loginApi, type LoginParams, type UserProfile } from "@/api/auth";
import tokenManager from "@/utils/request/token-manager";

interface UserState {
  userInfo: UserProfile | null;
  roles: string[];
  permissions: string[];
}

export const useUserStore = defineStore("bird-user", {
  state: (): UserState => ({
    userInfo: null,
    roles: [],
    permissions: [],
  }),
  getters: {
    isLogin: () => Boolean(tokenManager.getAccessToken()),
  },
  actions: {
    /** 登录并持久化 token 与用户资料 */
    async login(params: LoginParams) {
      const res = await loginApi(params);
      const { accessToken, refreshToken, expiresIn, ...profile } = res.data;
      tokenManager.setToken({ accessToken, refreshToken, expiresIn });
      this.userInfo = profile;
      this.roles = profile.roles || [];
      this.permissions = profile.permissions || [];
      return res;
    },
    /** 由路由守卫调用：恢复刷新前的用户资料与权限 */
    setProfile(profile: UserProfile) {
      this.userInfo = profile;
      this.roles = profile.roles || [];
      this.permissions = profile.permissions || [];
    },
    logout() {
      tokenManager.clearToken();
      this.$reset();
    },
  },
});

/** 组件外（路由守卫等）使用 */
export function useUserStoreHook() {
  return useUserStore(store);
}
