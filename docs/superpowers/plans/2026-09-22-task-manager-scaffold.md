# 任务管理应用 · 项目骨架 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **执行方式（用户已确认）：** Subagent-Driven — 每个任务派发独立子代理，任务间逐步评审。

**Goal:** 用 Vue 3 + Vite + Tailwind CSS v3 初始化一个任务管理应用的可用骨架（目录结构、组件/状态管理/工具函数占位、基础布局页），可 `npm run dev` 在浏览器看到基础布局。

**Architecture:** 单页应用骨架。Vite 负责构建与开发服务器，Vue 3 Composition API 组织组件，vue-router 提供路由，Pinia 提供状态管理，Tailwind CSS v3 提供原子化样式。本轮仅搭建结构与占位，不实现业务功能。

**Tech Stack:** Vue 3、Vite 5、Tailwind CSS v3、Pinia、vue-router、PostCSS + autoprefixer。

## Global Constraints

- 框架：Vue 3（Composition API，`<script setup>`）。
- 构建：Vite 5，插件 `@vitejs/plugin-vue`。
- 样式：Tailwind CSS v3（`tailwind.config.js` + PostCSS，非 v4 `@tailwindcss/vite` 插件式）。
- 状态管理：Pinia，store 位于 `src/stores`。
- 路由：vue-router，路由配置位于 `src/router/index.js`。
- 数据持久化：localStorage（封装为 `src/utils/storage.js`，本轮仅占位签名）。
- 本轮边界：只搭骨架，不实现任务 CRUD、三状态、优先级、看板拖拽、深色模式、持久化逻辑。
- Git：本 clarify 阶段只读；`git commit`（提交信息 `init project scaffold`）延后到执行节点执行。
- 命名与文案：应用标题为「任务管理应用」；页面语言为简体中文。

---

## File Structure

本轮将创建以下文件（均为新建）：

```
package.json
vite.config.js
tailwind.config.js
postcss.config.js
index.html
.gitignore
src/main.js
src/App.vue
src/router/index.js
src/assets/styles/index.css
src/stores/task.js
src/stores/ui.js
src/utils/storage.js
src/utils/validators.js
src/components/layout/AppHeader.vue
src/components/layout/AppFooter.vue
src/components/task/.gitkeep
src/views/HomeView.vue
```

各文件职责与边界：
- `main.js`：创建应用，注册 Pinia + router，挂载 App。
- `App.vue`：根组件，仅承载 `<RouterView />`。
- `router/index.js`：定义单条路由 `/` → `HomeView`。
- `stores/task.js` / `stores/ui.js`：任务与 UI（深色模式）状态骨架。
- `components/layout/*`：AppHeader / AppFooter 基础布局组件。
- `components/task/`：预留目录（空，用 `.gitkeep` 占位）。
- `views/HomeView.vue`：组合布局的基础空页面，验证 dev 可运行。
- `utils/storage.js` / `utils/validators.js`：函数签名占位。
- `assets/styles/index.css`：`@tailwind` 指令入口。

---

### Task 1: 工程与构建配置

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `.gitignore`

**Interfaces:**
- Consumes: 无。
- Produces: `package.json` 的依赖与脚本（后续所有任务依赖）；`vite.config.js` 使 `.vue` 文件可被编译；`index.html` 以 `/src/main.js` 为入口。

- [ ] **Step 1: 创建 `package.json`**

```json
{
  "name": "agentic-classwork",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "pinia": "^2.1.7",
    "vue": "^3.4.21",
    "vue-router": "^4.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.4",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "vite": "^5.2.8"
  }
}
```

- [ ] **Step 2: 创建 `vite.config.js`**

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
```

- [ ] **Step 3: 创建 `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 4: 创建 `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: 创建 `index.html`**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>任务管理应用</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 6: 创建 `.gitignore`**

```
node_modules
dist
.DS_Store
*.local
```

- [ ] **Step 7: 验证（依赖安装）**

Run: `npm install`
Expected: 退出码 0，生成 `node_modules/` 与 `package-lock.json`。

---

### Task 2: 全局样式入口

**Files:**
- Create: `src/assets/styles/index.css`

**Interfaces:**
- Consumes: Tailwind v3 PostCSS 管线（Task 1）。
- Produces: `src/main.js` 引入的全局样式入口。

- [ ] **Step 1: 创建 `src/assets/styles/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 2: 验证**

Run: `npm run build`
Expected: 退出码 0，生成 `dist/`，控制台无 PostCSS 报错。

---

### Task 3: 应用入口与路由

**Files:**
- Create: `src/main.js`
- Create: `src/App.vue`
- Create: `src/router/index.js`
- Create: `src/views/HomeView.vue`（视图本体在 Task 6 补齐布局；此处先以最小占位保证可运行）

**Interfaces:**
- Consumes: `src/assets/styles/index.css`（Task 2）；`HomeView` 默认导出。
- Produces:
  - `main.js` 导出应用挂载流程。
  - `router/index.js` 默认导出 `router` 实例。
  - `App.vue` 默认导出根组件，渲染路由出口。
  - `HomeView.vue` 默认导出视图组件。

- [ ] **Step 1: 创建 `src/router/index.js`**

```js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
  ],
})

export default router
```

- [ ] **Step 2: 创建 `src/main.js`**

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/styles/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

- [ ] **Step 3: 创建 `src/App.vue`**

```vue
<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>
```

- [ ] **Step 4: 创建 `src/views/HomeView.vue` 最小占位**

```vue
<template>
  <div>Home</div>
</template>
```

- [ ] **Step 5: 验证**

Run: `npm run build`
Expected: 退出码 0，无模块解析错误。

---

### Task 4: Pinia 状态管理骨架

**Files:**
- Create: `src/stores/task.js`
- Create: `src/stores/ui.js`

**Interfaces:**
- Consumes: `pinia`（Task 1 依赖）。
- Produces:
  - `task.js` 导出 `useTaskStore`（`defineStore('task', ...)`），state 含 `tasks: []`。
  - `ui.js` 导出 `useUiStore`（`defineStore('ui', ...)`），state 含 `darkMode: false`。
  - 后续执行节点将扩展 getters/actions（CRUD、状态流转、拖拽、深色模式切换）。

- [ ] **Step 1: 创建 `src/stores/task.js`**

```js
import { defineStore } from 'pinia'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
  }),
  getters: {},
  actions: {},
})
```

- [ ] **Step 2: 创建 `src/stores/ui.js`**

```js
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    darkMode: false,
  }),
  getters: {},
  actions: {},
})
```

- [ ] **Step 3: 验证**

Run: `npm run build`
Expected: 退出码 0（store 文件当前未被引用也不报错；验证其为合法 ES 模块即可）。

---

### Task 5: 工具函数骨架

**Files:**
- Create: `src/utils/storage.js`
- Create: `src/utils/validators.js`

**Interfaces:**
- Consumes: 无内部依赖。
- Produces:
  - `storage.js` 导出 `loadState()`、`saveState()`、常量 `STORAGE_KEY`（localStorage 封装签名，本轮不实现逻辑）。
  - `validators.js` 导出 `validateTaskTitle(title)`（表单校验签名，本轮为最简占位）。

- [ ] **Step 1: 创建 `src/utils/storage.js`**

```js
// localStorage 持久化封装骨架；读写逻辑在后续执行阶段实现。
export const STORAGE_KEY = 'task-manager'

export function loadState() {
  return null
}

export function saveState() {
  // 后续执行阶段：将状态序列化写入 localStorage。
}
```

- [ ] **Step 2: 创建 `src/utils/validators.js`**

```js
// 表单校验工具骨架；校验规则在后续执行阶段与 CRUD 一并实现。
export function validateTaskTitle(title) {
  return Boolean(title && title.trim())
}
```

- [ ] **Step 3: 验证**

Run: `npm run build`
Expected: 退出码 0。

---

### Task 6: 布局组件与视图

**Files:**
- Create: `src/components/layout/AppHeader.vue`
- Create: `src/components/layout/AppFooter.vue`
- Create: `src/components/task/.gitkeep`
- Modify: `src/views/HomeView.vue`（用完整布局替换 Task 3 的最小占位）

**Interfaces:**
- Consumes: `AppHeader`、`AppFooter` 默认导出（本任务内部）；Tailwind 工具类。
- Produces:
  - `AppHeader.vue` 默认导出：顶部标题栏。
  - `AppFooter.vue` 默认导出：底部说明栏。
  - `HomeView.vue` 默认导出：组合 Header + 主区域 + Footer 的页面。

- [ ] **Step 1: 创建 `src/components/layout/AppHeader.vue`**

```vue
<script setup>
</script>

<template>
  <header class="border-b border-gray-200 bg-white px-4 py-3">
    <h1 class="text-lg font-semibold text-gray-900">任务管理应用</h1>
  </header>
</template>
```

- [ ] **Step 2: 创建 `src/components/layout/AppFooter.vue`**

```vue
<script setup>
</script>

<template>
  <footer class="border-t border-gray-200 bg-white px-4 py-3 text-center text-sm text-gray-500">
    任务管理应用 · 骨架阶段
  </footer>
</template>
```

- [ ] **Step 3: 创建 `src/components/task/.gitkeep`**

内容为空文件（用于将预留目录纳入版本控制）。

- [ ] **Step 4: 改写 `src/views/HomeView.vue` 为完整布局**

```vue
<script setup>
import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <AppHeader />
    <main class="flex flex-1 items-center justify-center">
      <p class="text-gray-400">项目骨架已就绪</p>
    </main>
    <AppFooter />
  </div>
</template>
```

- [ ] **Step 5: 验证（构建）**

Run: `npm run build`
Expected: 退出码 0，生成的 `dist/` 中包含 HTML 与静态资源。

---

### Task 7: 浏览器运行验证

**Files:**
- 无新增文件。

**Interfaces:**
- Consumes: 全部前置任务产物。
- Produces: 可运行的开发服务器验证结果。

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`
Expected: 控制台输出本地地址（默认 `http://localhost:5173/`），无编译报错。

- [ ] **Step 2: 校验页面响应**

Run（另开终端）：`curl -s http://localhost:5173/ | head -20`
Expected: 返回包含 `<div id="app"></div>` 与入口脚本的 HTML。

- [ ] **Step 3: 浏览器人工确认**

在浏览器打开开发服务器地址，确认出现带「任务管理应用」标题栏、居中「项目骨架已就绪」文本、底部说明栏的基础布局空页面。

- [ ] **Step 4: 停止开发服务器**

停止 Task 7 Step 1 启动的 dev 进程。

---

### Task 8: 提交本轮结果

> 注意：本步骤在**执行节点**执行（该节点已开放 Git 写操作）。当前 clarify 阶段 Git 只读，严禁在任何更早的任务中提交。

- [ ] **Step 1: 查看变更**

Run: `git status`
Expected: 列出全部新增文件与 `package.json`、`package-lock.json`。

- [ ] **Step 2: 提交**

```bash
git add .
git commit -m "init project scaffold"
```

- [ ] **Step 3: 确认提交**

Run: `git log --oneline -1`
Expected: 最新一条为 `init project scaffold`。

---

## Self-Review

- **Spec coverage**：spec 第 4 节目录结构与 File Structure 一一对应；第 2 节技术选型在 Task 1 配置中落实；第 6 节 YAGNI 边界通过占位签名（不实现逻辑）满足；第 7 节验证方式由 Task 7 覆盖；第 8 节 commit 延后由 Task 8 + Global Constraints 覆盖。
- **Placeholder scan**：无 TBD/TODO；每个代码步骤均含完整文件内容；占位函数均有明确签名与注释（属本轮 YAGNI 设计，非未填写）。
- **Type consistency**：`useTaskStore`/`useUiStore`、`STORAGE_KEY`/`loadState`/`saveState`、`validateTaskTitle`、`AppHeader`/`AppFooter` 在定义与引用处命名一致；`HomeView` 默认导出在 Task 3 / Task 6 一致。