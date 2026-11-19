/** 用户管理接口 */
import { request } from "@/utils/request";
import type { BaseResponse } from "@/utils/request/types";
import type { PageQuery, PageResult, SysUser } from "./types";

export function getUserListApi(params?: PageQuery): Promise<BaseResponse<PageResult<SysUser>>> {
  return request.get<BaseResponse<PageResult<SysUser>>>("/user/list", params);
}

export function getUserApi(id: number): Promise<BaseResponse<SysUser>> {
  return request.get<BaseResponse<SysUser>>(`/user/${id}`);
}

export function createUserApi(data: Partial<SysUser> & { password?: string }): Promise<BaseResponse<SysUser>> {
  return request.post<BaseResponse<SysUser>>("/user", data);
}

export function updateUserApi(id: number, data: Partial<SysUser>): Promise<BaseResponse<SysUser>> {
  return request.put<BaseResponse<SysUser>>(`/user/${id}`, data);
}

export function deleteUserApi(id: number): Promise<BaseResponse<null>> {
  return request.delete<BaseResponse<null>>(`/user/${id}`);
}

export function assignUserRolesApi(
  id: number,
  roleIds: number[]
): Promise<BaseResponse<{ userId: number; roleIds: number[] }>> {
  return request.put<BaseResponse<{ userId: number; roleIds: number[] }>>(`/user/${id}/roles`, { roleIds });
}

export function resetUserPasswordApi(id: number, password: string): Promise<BaseResponse<null>> {
  return request.put<BaseResponse<null>>(`/user/${id}/password`, { password });
}

export function updateUserStatusApi(id: number, status: 0 | 1): Promise<BaseResponse<null>> {
  return request.put<BaseResponse<null>>(`/user/${id}/status`, { status });
}
