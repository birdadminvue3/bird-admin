/** 部门与岗位接口 */
import { request } from "@/utils/request";
import type { BaseResponse } from "@/utils/request/types";
import type { PageQuery, PageResult, SysDept, SysPost } from "./types";

// ---------- 部门 ----------
export function getDeptTreeApi(): Promise<BaseResponse<SysDept[]>> {
  return request.get<BaseResponse<SysDept[]>>("/dept/tree");
}

export function getDeptListApi(params?: { keyword?: string }): Promise<BaseResponse<SysDept[]>> {
  return request.get<BaseResponse<SysDept[]>>("/dept/list", params);
}

export function getDeptApi(id: number): Promise<BaseResponse<SysDept>> {
  return request.get<BaseResponse<SysDept>>(`/dept/${id}`);
}

export function createDeptApi(data: Partial<SysDept>): Promise<BaseResponse<SysDept>> {
  return request.post<BaseResponse<SysDept>>("/dept", data);
}

export function updateDeptApi(id: number, data: Partial<SysDept>): Promise<BaseResponse<SysDept>> {
  return request.put<BaseResponse<SysDept>>(`/dept/${id}`, data);
}

export function deleteDeptApi(id: number): Promise<BaseResponse<null>> {
  return request.delete<BaseResponse<null>>(`/dept/${id}`);
}

// ---------- 岗位 ----------
export function getPostListApi(params?: PageQuery): Promise<BaseResponse<PageResult<SysPost>>> {
  return request.get<BaseResponse<PageResult<SysPost>>>("/post/list", params);
}

export function getPostOptionsApi(): Promise<BaseResponse<Array<Pick<SysPost, "id" | "code" | "name">>>> {
  return request.get<BaseResponse<Array<Pick<SysPost, "id" | "code" | "name">>>>("/post/options");
}

export function getPostApi(id: number): Promise<BaseResponse<SysPost>> {
  return request.get<BaseResponse<SysPost>>(`/post/${id}`);
}

export function createPostApi(data: Partial<SysPost>): Promise<BaseResponse<SysPost>> {
  return request.post<BaseResponse<SysPost>>("/post", data);
}

export function updatePostApi(id: number, data: Partial<SysPost>): Promise<BaseResponse<SysPost>> {
  return request.put<BaseResponse<SysPost>>(`/post/${id}`, data);
}

export function deletePostApi(id: number): Promise<BaseResponse<null>> {
  return request.delete<BaseResponse<null>>(`/post/${id}`);
}
