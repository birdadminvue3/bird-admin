<script setup lang="ts">
/**
 * 系统管理通用资源页：菜单/角色/用户/部门/岗位/字典共用同一套列表与 CRUD，
 * 具体资源由当前路由决定。按钮通过 v-permission 按后端下发的权限标识控制。
 */
import { computed, nextTick, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import * as rbac from "@/api/rbac";
import type { BaseResponse } from "@/utils/request/types";
import type { PageQuery, PageResult } from "@/api/rbac/types";

type FieldType = "input" | "textarea" | "number" | "select";

interface Field {
  label: string;
  prop: string;
  type?: FieldType;
  options?: Array<{ label: string; value: any }>;
  required?: boolean;
}

interface Column {
  label: string;
  prop: string;
  width?: number;
}

interface SectionConfig {
  key: string;
  title: string;
  permission: string;
  fetch: (params: PageQuery) => Promise<BaseResponse<any>>;
  create: (data: any) => Promise<BaseResponse<any>>;
  update: (id: number, data: any) => Promise<BaseResponse<any>>;
  remove: (id: number) => Promise<BaseResponse<any>>;
  columns: Column[];
  fields: Field[];
  searchPlaceholder?: string;
  paginated?: boolean;
  tree?: boolean;
  extraActions?: Array<{ label: string; permission: string; handler: (row: any) => void }>;
}

interface SectionState {
  rows: any[];
  total: number;
  pageNum: number;
  pageSize: number;
  keyword: string;
  dialogVisible: boolean;
  editingId: number | null;
  form: Record<string, any>;
}

const route = useRoute();
const loading = ref(false);

// ---------- 角色授权 / 用户分配角色 ----------
const permDialogVisible = ref(false);
const permTreeRef = ref<any>(null);
const currentRole = ref<any>(null);
const menuTree = ref<any[]>([]);
const checkedMenuIds = ref<number[]>([]);

const roleDialogVisible = ref(false);
const currentUser = ref<any>(null);
const roleOptions = ref<any[]>([]);
const checkedRoleIds = ref<number[]>([]);

async function openPermissionDialog(row: any) {
  currentRole.value = row;
  checkedMenuIds.value = [...(row.menuIds || [])];
  permDialogVisible.value = true;
  try {
    const res = await rbac.getMenuTreeApi();
    menuTree.value = res.data || [];
    await nextTick();
    permTreeRef.value?.setCheckedKeys(checkedMenuIds.value, false);
  } catch {
    menuTree.value = [];
  }
}

async function submitPermission() {
  const checked = [
    ...(permTreeRef.value?.getCheckedKeys() || []),
    ...(permTreeRef.value?.getHalfCheckedKeys() || []),
  ];
  await rbac.assignRolePermissionsApi(currentRole.value.id, checked);
  ElMessage.success("授权成功");
  permDialogVisible.value = false;
  await loadData(sectionConfigs.value[0].key);
}

async function openRoleDialog(row: any) {
  currentUser.value = row;
  checkedRoleIds.value = [...(row.roleIds || [])];
  roleDialogVisible.value = true;
  try {
    const res = await rbac.getRoleOptionsApi();
    roleOptions.value = res.data || [];
  } catch {
    roleOptions.value = [];
  }
}

async function submitUserRoles() {
  await rbac.assignUserRolesApi(currentUser.value.id, checkedRoleIds.value);
  ElMessage.success("分配成功");
  roleDialogVisible.value = false;
  await loadData(sectionConfigs.value[0].key);
}

async function resetPassword(row: any) {
  try {
    const { value } = await ElMessageBox.prompt("请输入新密码（至少 6 位）", `重置 ${row.username} 的密码`, {
      inputPattern: /^.{6,}$/,
      inputErrorMessage: "密码长度不能少于 6 位",
    });
    await rbac.resetUserPasswordApi(row.id, value);
    ElMessage.success("密码重置成功");
  } catch {
    // 用户取消或接口失败，错误已由请求层统一提示
  }
}

// ---------- 资源配置 ----------
const statusOptions = [
  { label: "正常", value: 1 },
  { label: "停用", value: 0 },
];

const allSections: Record<string, SectionConfig[]> = {
  "/system/menu": [
    {
      key: "menu",
      title: "菜单列表",
      permission: "system:menu",
      fetch: rbac.getMenuListApi,
      create: rbac.createMenuApi,
      update: rbac.updateMenuApi,
      remove: rbac.deleteMenuApi,
      columns: [
        { label: "菜单名称", prop: "title", width: 220 },
        { label: "ID", prop: "id", width: 80 },
        { label: "路由路径", prop: "path" },
        { label: "类型", prop: "type", width: 100 },
        { label: "权限标识", prop: "permission" },
        { label: "排序", prop: "order", width: 80 },
      ],
      fields: [
        { label: "菜单名称", prop: "title", required: true },
        { label: "路由名称", prop: "name" },
        { label: "路由路径", prop: "path" },
        { label: "组件标识", prop: "component" },
        { label: "图标", prop: "icon" },
        { label: "类型(M/C/F)", prop: "type" },
        { label: "权限标识", prop: "permission" },
        { label: "上级 ID", prop: "parentId", type: "number" },
        { label: "排序", prop: "order", type: "number" },
        { label: "显示(1/0)", prop: "visible", type: "number" },
      ],
      searchPlaceholder: "搜索菜单名称或权限标识",
      tree: true,
    },
  ],
  "/system/role": [
    {
      key: "role",
      title: "角色列表",
      permission: "system:role",
      fetch: rbac.getRoleListApi,
      create: rbac.createRoleApi,
      update: rbac.updateRoleApi,
      remove: rbac.deleteRoleApi,
      columns: [
        { label: "ID", prop: "id", width: 80 },
        { label: "角色名称", prop: "name" },
        { label: "角色标识", prop: "code" },
        { label: "数据范围", prop: "dataScope", width: 100 },
        { label: "状态", prop: "status", width: 90 },
        { label: "创建时间", prop: "createTime" },
      ],
      fields: [
        { label: "角色名称", prop: "name", required: true },
        { label: "角色标识", prop: "code", required: true },
        { label: "数据范围(1-5)", prop: "dataScope", type: "number" },
        { label: "状态", prop: "status", type: "select", options: statusOptions },
        { label: "备注", prop: "remark", type: "textarea" },
      ],
      searchPlaceholder: "搜索角色名称或标识",
      paginated: true,
      extraActions: [
        {
          label: "分配权限",
          permission: "system:role:assign",
          handler: row => void openPermissionDialog(row),
        },
      ],
    },
  ],
  "/system/user": [
    {
      key: "user",
      title: "用户列表",
      permission: "system:user",
      fetch: rbac.getUserListApi,
      create: rbac.createUserApi,
      update: rbac.updateUserApi,
      remove: rbac.deleteUserApi,
      columns: [
        { label: "ID", prop: "id", width: 80 },
        { label: "账号", prop: "username" },
        { label: "昵称", prop: "nickname" },
        { label: "部门 ID", prop: "deptId", width: 100 },
        { label: "手机", prop: "phone" },
        { label: "状态", prop: "status", width: 90 },
        { label: "创建时间", prop: "createTime" },
      ],
      fields: [
        { label: "账号", prop: "username", required: true },
        { label: "昵称", prop: "nickname", required: true },
        { label: "初始密码", prop: "password" },
        { label: "部门 ID", prop: "deptId", type: "number" },
        { label: "手机", prop: "phone" },
        { label: "邮箱", prop: "email" },
        { label: "状态", prop: "status", type: "select", options: statusOptions },
      ],
      searchPlaceholder: "搜索账号、昵称或手机",
      paginated: true,
      extraActions: [
        {
          label: "分配角色",
          permission: "system:user:assignRole",
          handler: row => void openRoleDialog(row),
        },
        {
          label: "重置密码",
          permission: "system:user:resetPwd",
          handler: row => void resetPassword(row),
        },
      ],
    },
  ],
  "/system/dept": [
    {
      key: "dept",
      title: "部门列表",
      permission: "system:dept",
      fetch: rbac.getDeptTreeApi,
      create: rbac.createDeptApi,
      update: rbac.updateDeptApi,
      remove: rbac.deleteDeptApi,
      columns: [
        { label: "ID", prop: "id", width: 80 },
        { label: "部门名称", prop: "name" },
        { label: "负责人", prop: "leader" },
        { label: "电话", prop: "phone" },
        { label: "排序", prop: "order", width: 80 },
        { label: "状态", prop: "status", width: 90 },
      ],
      fields: [
        { label: "部门名称", prop: "name", required: true },
        { label: "上级 ID", prop: "parentId", type: "number" },
        { label: "负责人", prop: "leader" },
        { label: "电话", prop: "phone" },
        { label: "排序", prop: "order", type: "number" },
        { label: "状态", prop: "status", type: "select", options: statusOptions },
      ],
      searchPlaceholder: "搜索部门名称",
      tree: true,
    },
  ],
  "/system/post": [
    {
      key: "post",
      title: "岗位列表",
      permission: "system:post",
      fetch: rbac.getPostListApi,
      create: rbac.createPostApi,
      update: rbac.updatePostApi,
      remove: rbac.deletePostApi,
      columns: [
        { label: "ID", prop: "id", width: 80 },
        { label: "岗位名称", prop: "name" },
        { label: "岗位编码", prop: "code" },
        { label: "排序", prop: "order", width: 80 },
        { label: "状态", prop: "status", width: 90 },
        { label: "备注", prop: "remark" },
      ],
      fields: [
        { label: "岗位名称", prop: "name", required: true },
        { label: "岗位编码", prop: "code", required: true },
        { label: "排序", prop: "order", type: "number" },
        { label: "状态", prop: "status", type: "select", options: statusOptions },
        { label: "备注", prop: "remark", type: "textarea" },
      ],
      searchPlaceholder: "搜索岗位名称或编码",
      paginated: true,
    },
  ],
  "/system/dict": [
    {
      key: "dictType",
      title: "字典类型",
      permission: "system:dict",
      fetch: rbac.getDictTypeListApi,
      create: rbac.createDictTypeApi,
      update: rbac.updateDictTypeApi,
      remove: rbac.deleteDictTypeApi,
      columns: [
        { label: "ID", prop: "id", width: 80 },
        { label: "字典名称", prop: "name" },
        { label: "字典编码", prop: "code" },
        { label: "状态", prop: "status", width: 90 },
        { label: "备注", prop: "remark" },
      ],
      fields: [
        { label: "字典名称", prop: "name", required: true },
        { label: "字典编码", prop: "code", required: true },
        { label: "状态", prop: "status", type: "select", options: statusOptions },
        { label: "备注", prop: "remark", type: "textarea" },
      ],
      searchPlaceholder: "搜索字典名称或编码",
      paginated: true,
    },
    {
      key: "dictData",
      title: "字典数据",
      permission: "system:dict",
      fetch: rbac.getDictDataListApi,
      create: rbac.createDictDataApi,
      update: rbac.updateDictDataApi,
      remove: rbac.deleteDictDataApi,
      columns: [
        { label: "ID", prop: "id", width: 80 },
        { label: "字典编码", prop: "dictCode" },
        { label: "标签", prop: "label" },
        { label: "值", prop: "value", width: 90 },
        { label: "排序", prop: "order", width: 80 },
        { label: "状态", prop: "status", width: 90 },
      ],
      fields: [
        { label: "字典编码", prop: "dictCode", required: true },
        { label: "标签", prop: "label", required: true },
        { label: "值", prop: "value", required: true },
        { label: "排序", prop: "order", type: "number" },
        { label: "状态", prop: "status", type: "select", options: statusOptions },
        { label: "备注", prop: "remark", type: "textarea" },
      ],
      searchPlaceholder: "搜索字典标签或值",
      paginated: true,
    },
  ],
};

const sectionConfigs = computed<SectionConfig[]>(() => allSections[route.path] || []);

function initialState(): SectionState {
  return {
    rows: [],
    total: 0,
    pageNum: 1,
    pageSize: 10,
    keyword: "",
    dialogVisible: false,
    editingId: null,
    form: {},
  };
}

const states = reactive<Record<string, SectionState>>({});
function stateOf(key: string): SectionState {
  if (!states[key]) states[key] = initialState();
  return states[key];
}

async function loadData(key: string) {
  const section = sectionConfigs.value.find(item => item.key === key);
  if (!section) return;
  const state = stateOf(key);
  loading.value = true;
  try {
    const params: PageQuery = section.paginated
      ? { pageNum: state.pageNum, pageSize: state.pageSize, keyword: state.keyword }
      : { keyword: state.keyword };
    const res = await section.fetch(params);
    const data: any = res.data;
    if (Array.isArray(data)) {
      state.rows = data;
      state.total = data.length;
    } else {
      state.rows = (data as PageResult<any>).list || [];
      state.total = (data as PageResult<any>).total || 0;
    }
  } finally {
    loading.value = false;
  }
}

function resetSearch(key: string) {
  const state = stateOf(key);
  state.keyword = "";
  state.pageNum = 1;
  void loadData(key);
}

function openDialog(section: SectionConfig, row?: any) {
  const state = stateOf(section.key);
  state.editingId = row?.id ?? null;
  state.form = {};
  section.fields.forEach(field => {
    const defaultMap: Record<string, any> = {
      status: 1,
      visible: 1,
      order: 0,
      parentId: 0,
      deptId: 1,
      dataScope: 1,
    };
    state.form[field.prop] = row?.[field.prop] ?? defaultMap[field.prop] ?? "";
  });
  state.dialogVisible = true;
}

async function submitForm(section: SectionConfig) {
  const state = stateOf(section.key);
  const payload = { ...state.form };
  if (section.key === "user" && state.editingId) delete payload.password;
  if (state.editingId) {
    await section.update(state.editingId, payload);
  } else {
    await section.create(payload);
  }
  ElMessage.success(state.editingId ? "修改成功" : "新增成功");
  state.dialogVisible = false;
  await loadData(section.key);
}

async function removeRow(section: SectionConfig, row: any) {
  try {
    await ElMessageBox.confirm(`确认删除「${row.name || row.title || row.username || row.label || row.id}」吗？`, "提示", {
      type: "warning",
    });
    await section.remove(row.id);
    ElMessage.success("删除成功");
    await loadData(section.key);
  } catch {
    // 用户取消或接口报错，请求层已统一提示
  }
}

function renderCell(row: any, prop: string) {
  const value = row[prop];
  if (prop === "status" || prop === "visible") {
    return value === 1 || value === "1" ? "正常" : "停用";
  }
  // 菜单类型：目录 / 菜单 / 按钮
  if (prop === "type") {
    const typeMap: Record<string, string> = { M: "目录", C: "菜单", F: "按钮" };
    return typeMap[String(value)] ?? value ?? "-";
  }
  if (value === 0 || value === 1) return String(value);
  return value ?? "-";
}

sectionConfigs.value.forEach(section => void loadData(section.key));
</script>

<template>
  <div class="resource-page">
    <el-card v-for="section in sectionConfigs" :key="section.key" shadow="never">
      <template #header>
        <div class="section-header">
          <span>{{ section.title }}</span>
          <div class="section-tools">
            <el-input
              v-model="stateOf(section.key).keyword"
              :placeholder="section.searchPlaceholder"
              clearable
              style="width: 240px"
              @keyup.enter="stateOf(section.key).pageNum = 1; loadData(section.key)"
              @clear="resetSearch(section.key)"
            />
            <el-button v-permission="section.permission + ':add'" type="primary" @click="openDialog(section)">
              新增
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="stateOf(section.key).rows"
        border
        row-key="id"
        :tree-props="{ children: 'children' }"
        :default-expand-all="!!section.tree"
        :indent="16"
      >
        <el-table-column v-for="column in section.columns" :key="column.prop" :label="column.label" :prop="column.prop" :width="column.width">
          <template #default="{ row }">{{ renderCell(row, column.prop) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="section.permission + ':edit'" link type="primary" @click="openDialog(section, row)">
              编辑
            </el-button>
            <el-button
              v-for="action in section.extraActions || []"
              :key="action.label"
              v-permission="action.permission"
              link
              type="primary"
              @click="action.handler(row)"
            >
              {{ action.label }}
            </el-button>
            <el-button v-permission="section.permission + ':delete'" link type="danger" @click="removeRow(section, row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="section.paginated" class="pagination">
        <el-pagination
          v-model:current-page="stateOf(section.key).pageNum"
          v-model:page-size="stateOf(section.key).pageSize"
          :total="stateOf(section.key).total"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          @current-change="loadData(section.key)"
          @size-change="stateOf(section.key).pageNum = 1; loadData(section.key)"
        />
      </div>
    </el-card>

    <!-- 新增 / 编辑 -->
    <el-dialog
      v-for="section in sectionConfigs"
      :key="section.key + '-dialog'"
      v-model="stateOf(section.key).dialogVisible"
      :title="stateOf(section.key).editingId ? '编辑' + section.title : '新增' + section.title"
      width="520px"
    >
      <el-form label-width="110px">
        <el-form-item v-for="field in section.fields" :key="field.prop" :label="field.label">
          <el-select
            v-if="field.type === 'select'"
            v-model="stateOf(section.key).form[field.prop]"
            style="width: 100%"
          >
            <el-option v-for="option in field.options" :key="String(option.value)" :label="option.label" :value="option.value" />
          </el-select>
          <el-input
            v-else-if="field.type === 'textarea'"
            v-model="stateOf(section.key).form[field.prop]"
            type="textarea"
          />
          <el-input-number
            v-else-if="field.type === 'number'"
            v-model="stateOf(section.key).form[field.prop]"
            :min="0"
            style="width: 100%"
          />
          <el-input v-else v-model="stateOf(section.key).form[field.prop]" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stateOf(section.key).dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm(section)">确定</el-button>
      </template>
    </el-dialog>

    <!-- 角色授权 -->
    <el-dialog v-model="permDialogVisible" title="分配权限" width="520px">
      <el-tree
        ref="permTreeRef"
        :data="menuTree"
        show-checkbox
        node-key="id"
        :props="{ label: 'title', children: 'children' }"
        :default-checked-keys="checkedMenuIds"
      />
      <template #footer>
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPermission">确定</el-button>
      </template>
    </el-dialog>

    <!-- 用户分配角色 -->
    <el-dialog v-model="roleDialogVisible" title="分配角色" width="420px">
      <el-checkbox-group v-model="checkedRoleIds">
        <el-checkbox v-for="role in roleOptions" :key="role.id" :value="role.id">
          {{ role.name }}（{{ role.code }}）
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUserRoles">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.resource-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
