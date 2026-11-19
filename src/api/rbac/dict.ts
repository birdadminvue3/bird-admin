/** 字典管理接口 */
import { request } from "@/utils/request";
import type { BaseResponse } from "@/utils/request/types";
import type { PageQuery, PageResult, SysDictData, SysDictType } from "./types";

// ---------- 字典类型 ----------
export function getDictTypeListApi(params?: PageQuery): Promise<BaseResponse<PageResult<SysDictType>>> {
  return request.get<BaseResponse<PageResult<SysDictType>>>("/dict/type/list", params);
}

export function getDictTypeApi(id: number): Promise<BaseResponse<SysDictType>> {
  return request.get<BaseResponse<SysDictType>>(`/dict/type/${id}`);
}

export function createDictTypeApi(data: Partial<SysDictType>): Promise<BaseResponse<SysDictType>> {
  return request.post<BaseResponse<SysDictType>>("/dict/type", data);
}

export function updateDictTypeApi(id: number, data: Partial<SysDictType>): Promise<BaseResponse<SysDictType>> {
  return request.put<BaseResponse<SysDictType>>(`/dict/type/${id}`, data);
}

export function deleteDictTypeApi(id: number): Promise<BaseResponse<null>> {
  return request.delete<BaseResponse<null>>(`/dict/type/${id}`);
}

// ---------- 字典数据 ----------
export function getDictDataListApi(params?: PageQuery): Promise<BaseResponse<PageResult<SysDictData>>> {
  return request.get<BaseResponse<PageResult<SysDictData>>>("/dict/data/list", params);
}

export function getDictDataOptionsApi(dictCode: string): Promise<BaseResponse<SysDictData[]>> {
  return request.get<BaseResponse<SysDictData[]>>("/dict/data/options", { dictCode });
}

export function getDictDataApi(id: number): Promise<BaseResponse<SysDictData>> {
  return request.get<BaseResponse<SysDictData>>(`/dict/data/${id}`);
}

export function createDictDataApi(data: Partial<SysDictData>): Promise<BaseResponse<SysDictData>> {
  return request.post<BaseResponse<SysDictData>>("/dict/data", data);
}

export function updateDictDataApi(id: number, data: Partial<SysDictData>): Promise<BaseResponse<SysDictData>> {
  return request.put<BaseResponse<SysDictData>>(`/dict/data/${id}`, data);
}

export function deleteDictDataApi(id: number): Promise<BaseResponse<null>> {
  return request.delete<BaseResponse<null>>(`/dict/data/${id}`);
}
