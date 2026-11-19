/** 当前用户与动态路由接口 */
import { request } from "@/utils/request";
import type { BaseResponse } from "@/utils/request/types";
import type { MenuRoute } from "./types";
import type { UserProfile } from "@/api/auth";

/** 获取当前登录用户资料（权限、角色） */
export function getUserInfoApi(): Promise<BaseResponse<UserProfile>> {
  return request.get<BaseResponse<UserProfile>>("/auth/getUserInfo");
}

/** 获取当前用户可访问的路由树 */
export function getUserRoutesApi(): Promise<BaseResponse<MenuRoute[]>> {
  return request.get<BaseResponse<MenuRoute[]>>("/auth/routes");
}

/** 退出登录 */
export function logoutApi(): Promise<BaseResponse<null>> {
  return request.post<BaseResponse<null>>("/auth/logout");
}
