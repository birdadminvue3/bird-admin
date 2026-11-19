/** 字典管理：字典类型 + 字典数据两组 CRUD */
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

function findType(id: number) {
  return db.dictTypes.find(item => item.id === id);
}
function findData(id: number) {
  return db.dictData.find(item => item.id === id);
}

export default defineFakeRoute([
  // ---------- 字典类型 ----------
  {
    url: "/api/dict/type/list",
    method: "get",
    response: ({ headers, query }) => {
      const result = guard(headers, "system:dict:list");
      if (isGuardError(result)) return result.error;
      const keyword = first(query.name ?? query.keyword) || "";
      const status = first(query.status);
      return ok(
        paginate(db.dictTypes, query, item =>
          (!keyword || includes(item.name, keyword) || includes(item.code, keyword)) &&
          (!status || String(item.status) === status)
        )
      );
    },
  },
  {
    url: "/api/dict/type/:id",
    method: "get",
    response: ({ headers, params }) => {
      const result = guard(headers, "system:dict:list");
      if (isGuardError(result)) return result.error;
      const item = findType(numericId(params.id));
      return item ? ok(item) : errors.notFound("字典类型");
    },
  },
  {
    url: "/api/dict/type",
    method: "post",
    response: ({ headers, body }) => {
      const result = guard(headers, "system:dict:add");
      if (isGuardError(result)) return result.error;
      const name = String(body?.name ?? "").trim();
      const code = String(body?.code ?? "").trim();
      if (!name || !code) return errors.badParams("字典名称和编码不能为空");
      if (db.dictTypes.some(item => item.code === code)) return errors.conflict("字典编码已存在");
      const item = {
        id: nextId(db.dictTypes),
        name,
        code,
        status: (Number(body?.status) === 0 ? 0 : 1) as 0 | 1,
        remark: String(body?.remark ?? "").trim(),
      };
      db.dictTypes.push(item);
      return ok(item, "新增成功");
    },
  },
  {
    url: "/api/dict/type/:id",
    method: "put",
    response: ({ headers, params, body }) => {
      const result = guard(headers, "system:dict:edit");
      if (isGuardError(result)) return result.error;
      const item = findType(numericId(params.id));
      if (!item) return errors.notFound("字典类型");
      const code = String(body?.code ?? item.code).trim();
      if (code !== item.code && db.dictTypes.some(i => i.code === code)) return errors.conflict("字典编码已存在");
      Object.assign(item, {
        name: String(body?.name ?? item.name).trim(),
        code,
        status: Number(body?.status) === 0 ? 0 : 1,
        remark: String(body?.remark ?? item.remark).trim(),
      });
      return ok(item, "修改成功");
    },
  },
  {
    url: "/api/dict/type/:id",
    method: "delete",
    response: ({ headers, params }) => {
      const result = guard(headers, "system:dict:delete");
      if (isGuardError(result)) return result.error;
      const item = findType(numericId(params.id));
      if (!item) return errors.notFound("字典类型");
      if (db.dictData.some(data => data.dictCode === item.code)) {
        return errors.conflict("该字典下存在数据，无法删除");
      }
      db.dictTypes.splice(db.dictTypes.indexOf(item), 1);
      return ok(null, "删除成功");
    },
  },

  // ---------- 字典数据 ----------
  {
    url: "/api/dict/data/list",
    method: "get",
    response: ({ headers, query }) => {
      const result = guard(headers, "system:dict:list");
      if (isGuardError(result)) return result.error;
      const dictCode = first(query.dictCode) || "";
      const keyword = first(query.label ?? query.keyword) || "";
      const status = first(query.status);
      return ok(
        paginate(db.dictData, query, item =>
          (!dictCode || item.dictCode === dictCode) &&
          (!keyword || includes(item.label, keyword) || includes(item.value, keyword)) &&
          (!status || String(item.status) === status)
        )
      );
    },
  },
  {
    url: "/api/dict/data/options",
    method: "get",
    response: ({ headers, query }) => {
      const result = guard(headers);
      if (isGuardError(result)) return result.error;
      const dictCode = first(query.dictCode) || "";
      return ok(
        db.dictData
          .filter(item => item.status === 1 && (!dictCode || item.dictCode === dictCode))
          .map(({ id, dictCode: code, label, value }) => ({ id, dictCode: code, label, value }))
      );
    },
  },
  {
    url: "/api/dict/data/:id",
    method: "get",
    response: ({ headers, params }) => {
      const result = guard(headers, "system:dict:list");
      if (isGuardError(result)) return result.error;
      const item = findData(numericId(params.id));
      return item ? ok(item) : errors.notFound("字典数据");
    },
  },
  {
    url: "/api/dict/data",
    method: "post",
    response: ({ headers, body }) => {
      const result = guard(headers, "system:dict:add");
      if (isGuardError(result)) return result.error;
      const dictCode = String(body?.dictCode ?? "").trim();
      const label = String(body?.label ?? "").trim();
      const value = String(body?.value ?? "").trim();
      if (!dictCode || !label || !value) return errors.badParams("字典类型、标签和值不能为空");
      const item = {
        id: nextId(db.dictData),
        dictCode,
        label,
        value,
        order: Number(body?.order) || 0,
        status: (Number(body?.status) === 0 ? 0 : 1) as 0 | 1,
        remark: String(body?.remark ?? "").trim(),
      };
      db.dictData.push(item);
      return ok(item, "新增成功");
    },
  },
  {
    url: "/api/dict/data/:id",
    method: "put",
    response: ({ headers, params, body }) => {
      const result = guard(headers, "system:dict:edit");
      if (isGuardError(result)) return result.error;
      const item = findData(numericId(params.id));
      if (!item) return errors.notFound("字典数据");
      Object.assign(item, {
        dictCode: String(body?.dictCode ?? item.dictCode).trim(),
        label: String(body?.label ?? item.label).trim(),
        value: String(body?.value ?? item.value).trim(),
        order: Number(body?.order ?? item.order) || 0,
        status: Number(body?.status) === 0 ? 0 : 1,
        remark: String(body?.remark ?? item.remark).trim(),
      });
      return ok(item, "修改成功");
    },
  },
  {
    url: "/api/dict/data/:id",
    method: "delete",
    response: ({ headers, params }) => {
      const result = guard(headers, "system:dict:delete");
      if (isGuardError(result)) return result.error;
      const item = findData(numericId(params.id));
      if (!item) return errors.notFound("字典数据");
      db.dictData.splice(db.dictData.indexOf(item), 1);
      return ok(null, "删除成功");
    },
  },
]);
