/** 角色管理接口 */
import { request } from "@/utils/request";
import type { BaseResponse } from "@/utils/request/types";
import type { PageQuery, PageResult, SysRole } from "./types";

export function getRoleListApi(params?: PageQuery): Promise<BaseResponse<PageResult<SysRole>>> {
  return request.get<BaseResponse<PageResult<SysRole>>>("/role/list", params);
}

export function getRoleOptionsApi(): Promise<BaseResponse<Array<Pick<SysRole, "id" | "name" | "code">>>> {
  return request.get<BaseResponse<Array<Pick<SysRole, "id" | "name" | "code">>>>("/role/options");
}

export function getRoleApi(id: number): Promise<BaseResponse<SysRole>> {
  return request.get<BaseResponse<SysRole>>(`/role/${id}`);
}

export function createRoleApi(data: Partial<SysRole>): Promise<BaseResponse<SysRole>> {
  return request.post<BaseResponse<SysRole>>("/role", data);
}

export function updateRoleApi(id: number, data: Partial<SysRole>): Promise<BaseResponse<SysRole>> {
  return request.put<BaseResponse<SysRole>>(`/role/${id}`, data);
}

export function deleteRoleApi(id: number): Promise<BaseResponse<null>> {
  return request.delete<BaseResponse<null>>(`/role/${id}`);
}

/** 角色授权：menuIds 为菜单与按钮的 id 全集 */
export function assignRolePermissionsApi(
  id: number,
  menuIds: number[]
): Promise<BaseResponse<{ roleId: number; menuIds: number[] }>> {
  return request.put<BaseResponse<{ roleId: number; menuIds: number[] }>>(
    `/role/${id}/permissions`,
    { menuIds }
  );
}

export function updateRoleStatusApi(id: number, status: 0 | 1): Promise<BaseResponse<SysRole>> {
  return request.put<BaseResponse<SysRole>>(`/role/${id}/status`, { status });
}
