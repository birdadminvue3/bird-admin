/** 菜单管理接口 */
import { request } from "@/utils/request";
import type { BaseResponse } from "@/utils/request/types";
import type { SysMenu } from "./types";

export function getMenuTreeApi(): Promise<BaseResponse<SysMenu[]>> {
  return request.get<BaseResponse<SysMenu[]>>("/menu/tree");
}

export function getMenuListApi(params?: { keyword?: string }): Promise<BaseResponse<SysMenu[]>> {
  return request.get<BaseResponse<SysMenu[]>>("/menu/list", params);
}

export function getMenuApi(id: number): Promise<BaseResponse<SysMenu>> {
  return request.get<BaseResponse<SysMenu>>(`/menu/${id}`);
}

export function createMenuApi(data: Partial<SysMenu>): Promise<BaseResponse<SysMenu>> {
  return request.post<BaseResponse<SysMenu>>("/menu", data);
}

export function updateMenuApi(id: number, data: Partial<SysMenu>): Promise<BaseResponse<SysMenu>> {
  return request.put<BaseResponse<SysMenu>>(`/menu/${id}`, data);
}

export function deleteMenuApi(id: number): Promise<BaseResponse<null>> {
  return request.delete<BaseResponse<null>>(`/menu/${id}`);
}
