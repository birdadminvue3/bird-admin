<br />
<div align="center">
    <img src="./src/assets/readme/logo.png" alt="" />
    <h1 style="font-size: 36px;color: #2c3e50;font-weight: 600;margin: 0 0 6px 0;">BirdAdmin</h1>
    <p style="font-size: 17px;color: #6a8bad;margin-bottom: 10px;">使用流行技术栈快速创建商业级后台管理系统</p>
    <a href="https://gitee.com/web_akai/bird-admin" target="_blank">Gitee仓库</a>
</div>
<br />
<p align="center">
    <a href="https://nodejs.org/zh-cn/download" target="_blank">
        <img src="https://img.shields.io/badge/Node.js-%3E20.19.4-brightgreen?color=91aac3&labelColor=439EFD" alt="vue">
    </a>
    <a href="https://pnpm.io/zh/installation" target="_blank">
        <img src="https://img.shields.io/badge/pnpm-%3E10.13.1-brightgreen?color=91aac3&labelColor=439EFD" alt="vue">
    </a>
    <a href="https://v3.vuejs.org/" target="_blank">
        <img src="https://img.shields.io/badge/Vue-%3E3.5-brightgreen?color=91aac3&labelColor=439EFD" alt="vue">
    </a>
    <a href="https://element-plus.org/zh-CN/guide/changelog.html" target="_blank">
        <img src="https://img.shields.io/badge/Element--Plus-%3E2.9-brightgreen?color=91aac3&labelColor=439EFD" alt="element plus">
    </a>
    <a href="https://www.tslang.cn/" target="_blank">
        <img src="https://img.shields.io/badge/TypeScript-%3E5.7-blue?color=91aac3&labelColor=439EFD" alt="typescript">
    </a>
    <a href="https://vitejs.dev/" target="_blank">
        <img src="https://img.shields.io/badge/Vite-%3E6.0-blue?color=91aac3&labelColor=439EFD" alt="vite">
    </a>
    <a href="https://pinia.vuejs.org/" target="_blank">
        <img src="https://img.shields.io/badge/Pinia-%3E2.3-blue?color=91aac3&labelColor=439EFD" alt="vite">
    </a>
    <a href="https://gitee.com/wonderful-code/buildadmin/blob/master/LICENSE" target="_blank">
        <img src="https://img.shields.io/badge/Apache2.0-license-blue?color=91aac3&labelColor=439EFD" alt="license">
    </a>
</p>

<br>
<div align="center">
img
</div>
<br>

### 介绍
🌈 基于 Vue3.x + ThinkPHP8 + TypeScript + Vite + Pinia + Element Plus 等流行技术栈的后台管理系统，支持自动注册路由、无限子级权限管理等，无需授权即可免费商用，希望能帮助大家实现快速开发。

### 主要特性

**👍 流行且稳定的技术栈：**
除了基于 `Node.js` 前后端分离架构外，我们的 `Vue3` 使用了 `setup、useTemplateRef` 等，状态管理使用 `Pinia`，并使用了 `TypeScript、Vite` 等可以为你的知识面添砖加瓦的技术栈。使用流行技术栈自然代表本框架兼容相关（Vue3+Nodejs+Koa2）生态，生态系统内数不清的库、包、组件，能够使您的开发事半功倍。

**🔀 前后端分离：**
项目的 `web` 文件夹内包含： `干净`（不含后端代码）、`完整`（所有前端代码文件均在此内）的前端代码文件，代码和部署均可前后分离，对前端开发者友好，作为纯前端开发者，您可以将 BirdAdmin 当做学习与资源的社群，本系统可为您准备好案例和模板等所需要的环境，而您只需专注于学习或工作，不需要会任何后端代码！（邀您：[和我们一起](https://qm.qq.com/cgi-bin/qm/qr?k=mtO25dYqAb6TvQabT3a32GpM-ymBgzyQ&jump_from=webapi&authKey=IdNeGCdGWY3agi7eUniBkHG7ME98B3hD2dBUFoLcBLtYrKEl1RfComEn+0sdrM+I) ）


**✨ 高颜值：**
提供三种布局模式，其中默认布局使用无边框设计风格，它并没有强行填满屏幕的每一个缝然后使用边框线进行分隔，所有的功能版块，都像是悬浮在屏幕上的，同时又将屏幕空间及其合理的利用了。

**🔐 权限验证：**
可视化的管理权限，然后根据权限动态的注册路由、菜单、页面、按钮（权限节点）、支持无限父子级权限分组、前后端搭配鉴权，自由分派页面和按钮权限。

**📝 未来可期：**
我们正在持续维护系统，并着手开发更多基础设施模块，按需一键安装，甚至提供开箱即用的各行业完整应用。

**💖 其他杂项：**
系统配置/控制台/个人资料管理等等、更多特性等你探索...

### 安装使用

> Vite 不再支持 Node 12 / 13 / 15，因为上述版本已经进入了 EOL 阶段。现在你必须使用 Node 16+ / 18+ 版本。

```bash
# 克隆项目
git clone https://gitee.com/web_akai/bird-admin.git

# 进入项目
cd bird-admin

# 安装`pnpm`依赖
npm i -g pnpm

# 安装依赖
pnpm install

# 运行项目
pnpm run dev

# 打包发布
pnpm run build
```

#### 💯 学习交流加 QQ 群

> 请加以下群号，感谢老哥们支持！

群号：[829514092](https://qm.qq.com/cgi-bin/qm/qr?k=mtO25dYqAb6TvQabT3a32GpM-ymBgzyQ&jump_from=webapi&authKey=IdNeGCdGWY3agi7eUniBkHG7ME98B3hD2dBUFoLcBLtYrKEl1RfComEn+0sdrM+I)

<a target="_blank" href="https://qm.qq.com/cgi-bin/qm/qr?k=mtO25dYqAb6TvQabT3a32GpM-ymBgzyQ&jump_from=webapi&authKey=IdNeGCdGWY3agi7eUniBkHG7ME98B3hD2dBUFoLcBLtYrKEl1RfComEn+0sdrM+I"><img border="0" src="//pub.idqqimg.com/wpa/images/group.png" alt="BirdAdmin前端技术交流群" title="BirdAdmin前端技术交流群"></a>

### 联系我们
- [演示站](https://gitee.com/web_akai/bird-admin) 账户：`admin`，密码：`123456`（演示站数据无法修改，请下载源码安装体验全部功能）
- [Gitee仓库](hhttps://gitee.com/web_akai/bird-admin)
- [官方邮箱 web_bird@qq.com](mailto:web_bird@qq.com)

### 项目预览

### 特别鸣谢
💕 感谢巨人提供肩膀，排名不分先后
- [Koa2](https://www.koajs.net/)
- [Vue](https://github.com/vuejs/core)
- [Element Plus](https://github.com/element-plus/element-plus)
- [TypeScript](https://github.com/microsoft/TypeScript)
- [vue-router](https://github.com/vuejs/vue-router-next)
- [vite](https://github.com/vitejs/vite)
- [Pinia](https://github.com/vuejs/pinia)
- [Axios](https://github.com/axios/axios)
- [nprogress](https://github.com/rstacruz/nprogress)
- [screenfull](https://github.com/sindresorhus/screenfull.js)
- [mitt](https://github.com/developit/mitt)
- [sass](https://github.com/sass/sass)
- [echarts](https://github.com/apache/echarts)
- [vueuse](https://github.com/vueuse/vueuse)
- [lodash](https://github.com/lodash/lodash)
- [eslint](https://github.com/eslint/eslint)
- [prettier](https://github.com/prettier/prettier)
- [phinx](https://github.com/cakephp/phinx)
- [jetbrains](https://www.jetbrains.com/)

### 版权信息
🔐 BirdAdmin 遵循 `Apache2.0` 开源协议发布，提供无需授权的免费使用。\
本项目包含的第三方源码和二进制文件之版权信息另行标注。

### 支持项目
💕 无需捐赠，如果觉得项目不错，或者已经在使用了，希望你可以去 [Gitee](https://gitee.com/web_akai/bird-admin.git) 帮我点个 ⭐ Star，这将是对我极大的鼓励与支持。

### 当前实现状态（2026-11-19）

> 本仓库目前是**前端脚手架**。上文的「ThinkPHP8 后端、三种布局、可视化权限管理、无限子级权限分组」属于规划能力，尚未实现。

已可用：

- Vue3 + Vite + TypeScript + Pinia + Element Plus 工程与生产构建
- 登录页与本地 mock 登录（`admin` / `123456`，**仅 dev 生效**，生产构建不注入 mock）
- 基于 token 的路由守卫；`src/utils/request` 请求封装（loading、取消重复请求、401 刷新、离线队列、文件下载）
- RBAC 权限管理与本地 mock 接口（仅 dev 生效）：菜单/角色/用户/部门/岗位/字典、按钮级权限、按用户权限下发动态路由
  - 菜单：`控制台 /dashboard`、`系统管理 /system`，子菜单 `菜单管理 /system/menu`、`角色管理 /system/role`、`用户管理 /system/user`、`部门管理 /system/dept`、`岗位管理 /system/post`、`字典管理 /system/dict`
  - 演示账号：`admin/123456`（超管，全部菜单）、`system/123456`（系统管理员，无岗位/字典）、`auditor/123456`（只读用户列表）、`guest/123456`（仅控制台）
  - 接口前缀 `/api`，统一返回 `{ code, data, message }`；除登录/刷新外均需 `Authorization: Bearer <token>`
  - 路由树：`GET /auth/routes`；各资源列表：`GET /menu/tree`、`/role/list`、`/user/list`、`/dept/tree`、`/post/list`、`/dict/type/list`、`/dict/data/list`
  - 授权接口：`PUT /role/:id/permissions`、`PUT /user/:id/roles`；权限标识形如 `system:user:add`，超管为 `*:*:*`
  - mock 数据存放在 `globalThis`，开发期 CRUD 在同一进程内共享；重启 dev 后恢复种子数据

接入真实后端：

- 在 `.env.production` 配置 `VITE_API_BASE_URL`（接口 url 相对该地址，不要自带 `/api` 前缀）
- 实现 `/login`、`/auth/refresh-token` 等接口，统一返回 `{ code, data, message }`，成功码为 `200` 或 `0`
- 需要本地代理时配置 `VITE_API_PROXY_TARGET`，留空则走 `mock/`

常用命令：`pnpm dev` / `pnpm build` / `pnpm typecheck` / `pnpm lint`
