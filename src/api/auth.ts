// 认证相关接口
import { request } from "@/utils/request";
import type { BaseResponse } from "@/utils/request/types";
import type { TokenInfo } from "@/utils/request/token-manager";

export interface LoginParams {
  username: string;
  password: string;
}

export interface UserProfile {
  userId: number;
  avatar: string;
  username: string;
  nickname: string;
  deptId: number;
  deptName: string;
  roleIds: number[];
  roles: string[];
  permissions: string[];
}

export type LoginResult = TokenInfo & UserProfile;

/** 登录：url 相对 VITE_API_BASE_URL，无需再写 /api 前缀 */
export function loginApi(data: LoginParams): Promise<BaseResponse<LoginResult>> {
  return request.post<BaseResponse<LoginResult>>("/login", data, {
    requestOptions: {
      showLoading: false, // 登录按钮自带 loading 状态
      showErrorMessage: false, // 错误提示由登录页统一处理
      cancelRepeatRequest: false,
      autoRefreshToken: false, // 登录接口本身不需要 token
    },
  });
}
