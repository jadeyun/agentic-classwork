# 任务管理应用 · 完整功能设计文档

- 日期：2026-09-22
- 阶段：clarify（需求澄清 / 设计）
- 范围：在既有项目骨架上实现任务管理的完整功能

## 1. 背景与目标

在已就绪的 Vue 3 + Vite + Tailwind CSS v3 + Pinia + vue-router 骨架上，实现一个完整的任务管理应用：

- 任务 CRUD：标题必填、描述选填。
- 三种状态：待办（todo）/ 进行中（doing）/ 完成（done）。
- 三档优先级：高（红）/ 中（黄）/ 低（绿）。
- 看板视图：三列卡片，拖拽即改状态。
- 深色模式：一键切换，记住选择。
- 数据持久化：localStorage，刷新不丢失。

已确认的交互决策（2026-09-22 澄清）：

- 功能范围：完整功能（含看板拖拽、深色模式、持久化）。
- 展示形态：看板三列。
- 新建任务默认值：状态 = 待办，优先级 = 中（黄）；创建后状态与优先级均可修改。
- 落地路径：方案 A —— 原生 HTML5 拖拽，零新增依赖。

## 2. 技术选型（复用既有骨架）

| 项 | 选择 |
| --- | --- |
| 前端框架 | Vue 3（Composition API，`<script setup>`） |
| 构建工具 | Vite 5 |
| 样式方案 | Tailwind CSS v3（`tailwind.config.js` + PostCSS），`darkMode: 'class'` |
| 状态管理 | Pinia（`src/stores/task.js`、`src/stores/ui.js`） |
| 路由 | vue-router（单路由 `/` → `HomeView`） |
| 数据存储 | localStorage（`src/utils/storage.js` 封装） |
| 拖拽 | 原生 HTML5 拖拽事件（draggable / dragstart / dragover / drop），不新增依赖 |
| ID 生成 | `crypto.randomUUID()`，不支持时降级为时间戳 + 随机数 |

## 3. 数据模型

任务对象 `Task`：

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 唯一 | uuid |
| `title` | string | 必填 | trim 后非空 |
| `description` | string | 选填 | 空串等价于无描述 |
| `status` | string | 枚举 | `todo` / `doing` / `done` |
| `priority` | string | 枚举 | `high` / `medium` / `low` |
| `createdAt` | number | — | 时间戳 |
| `updatedAt` | number | — | 时间戳 |

状态与优先级映射：

| status | 显示文案 | priority | 显示文案 | 徽章颜色 |
| --- | --- | --- | --- | --- |
| `todo` | 待办 | `high` | 高 | 红 |
| `doing` | 进行中 | `medium` | 中 | 黄 |
| `done` | 完成 | `low` | 低 | 绿 |

默认值约定：新建任务 `status = 'todo'`、`priority = 'medium'`、`description = ''`。

## 4. 架构与数据流

单页应用，`HomeView` 组合 `AppHeader` + 看板区 + `AppFooter`：

1. `App.vue` → `<RouterView />`（现有，不改）。
2. `main.js` 挂载 Pinia + router，并在应用启动时初始化深色模式类、加载持久化状态。
3. `Pinia store` 作为唯一数据源，所有 CRUD / 拖拽流转都通过 store action 进行。
4. store 的写入 action 内同步调用 `saveState` 持久化（任务列表、深色模式分开 key 或同一 key 下的两个字段）。

数据流：`TaskFormModal` 收集表单 → 校验 → `store.addTask/updateTask` → 持久化 → 组件响应式重渲染；拖拽 → `store.moveTask(taskId, targetStatus)` → 持久化。

## 5. 模块设计

### 5.1 store：`src/stores/task.js`

- `state.tasks: Task[]`。
- actions：
  - `load()`：从 localStorage 载入任务列表（容错，非法数据回退为空数组）。
  - `addTask({ title, description, status?, priority? })`：校验标题非空；未提供时套用默认值；生成 `id/createdAt/updatedAt`；写入后持久化。
  - `updateTask(id, patch)`：按 `id` 合并补丁，刷新 `updatedAt`，持久化。
  - `removeTask(id)`：删除，持久化。
  - `moveTask(id, status)`：仅改 `status`，刷新 `updatedAt`，持久化（看板拖拽与编辑弹窗均可复用）。
- getters（可选用）：按状态分组的便捷访问由 `KanbanBoard` 用 `computed` 过滤实现，store 不强制分组。

### 5.2 store：`src/stores/ui.js`

- `state.darkMode: boolean`。
- actions：
  - `initDarkMode()`：读取持久化偏好，无记录时回退系统 `prefers-color-scheme`（可选）；应用根 `<html>` 的 `dark` 类。
  - `toggleDarkMode()`：翻转并持久化、同步根节点类。

### 5.3 工具：`src/utils/storage.js`

- `STORAGE_KEY = 'task-manager'`：任务列表。
- `UI_STORAGE_KEY = 'task-manager-ui'`：UI 偏好（深色模式）。
- `loadState(key)`：`try/catch` 读取 JSON，失败返回 `null`。
- `saveState(key, value)`：序列化写入，写入失败静默捕获（不阻断交互）。

### 5.4 工具：`src/utils/validators.js`

- `validateTaskTitle(title)`：`trim` 后非空返回 `true`（现有实现已满足，保留即可）。
- 扩展导出 `TASK_STATUS`、`TASK_PRIORITY` 等枚举常量与显示映射，供组件与 store 共用（避免魔法字符串）。

### 5.5 组件：`src/components/task/`

- `KanbanBoard.vue`：三列容器；引入三个 `KanbanColumn`；提供新增任务入口。
- `KanbanColumn.vue`：接收 `status` 与任务列表；实现 `dragover`（允许放置）、`drop`（调用 `moveTask`）；渲染列标题与数量、`TaskCard` 列表。
- `TaskCard.vue`：`draggable` + `dragstart`（携带 `taskId`）；展示标题、描述（截断）、优先级徽章；提供「编辑」「删除」按钮。
- `TaskFormModal.vue`：新增/编辑共用弹窗表单；字段：标题（必填校验）、描述（选填）、状态（三态，编辑时可选）、优先级（三档，可选）；确定前校验，非法提示不关闭。

### 5.6 布局组件

- `AppHeader.vue`：保留标题，新增深色模式切换按钮（调用 `ui.toggleDarkMode`）。
- `AppFooter.vue`：文案更新为版本说明（可选，保持简洁）。
- `HomeView.vue`：组合 `AppHeader` + `KanbanBoard` + `AppFooter`，替换现有「项目骨架已就绪」占位。

### 5.7 深色模式

- `tailwind.config.js` 增加 `darkMode: 'class'`。
- 组件使用 `dark:` 前缀工具类适配深色配色；根节点 `<html>` 挂 `dark` 类驱动切换。
- 首次进入同步持久化偏好。

## 6. 权限边界 / 错误处理

- 标题为空：表单层阻止提交并提示「请输入任务标题」。
- localStorage 不可用或 JSON 损坏：读回退为空态，写入静默降级为内存态，不崩溃。
- 删除前可选二次确认（`confirm`），避免误删。
- 拖拽仅允许修改状态，不允许改变同列排序（本轮 YAGNI，不做列内排序）。

## 7. 本轮边界（YAGNI）

- 明确不实现：任务截止时间、标签、搜索/过滤、列内拖拽排序、多用户/后端同步、无障碍完整规范、单元测试脚手架（项目当前无测试设施）。
- 拖拽不引入 sortablejs 等第三方依赖。

## 8. 验证方式

1. `npm install` 后 `npm run build`：退出码 0，无编译/PostCSS 报错。
2. `npm run dev` 启动开发服务器。
3. 浏览器人工验证（执行节点）：
   - 新增任务：标题必填校验生效，描述可空；默认状态=待办、默认优先级=中（黄）。
   - 编辑任务：标题/描述/状态/优先级均可改且保存生效。
   - 删除任务：确认后移除。
   - 三列看板正确分组展示；状态文案与优先级颜色（高红/中黄/低绿）正确。
   - 拖拽卡片到目标列后状态切换正确。
   - 深色模式一键切换并记忆；刷新页面后任务数据与深色偏好均不丢失。
4. 确认无误后 commit（Git 写操作延后到执行节点开放）。

## 9. Git 提交

- 本轮 clarify 阶段 Git 只读，不执行 commit。
- 待执行节点验证通过后提交：提交信息如 `feat: task manager CRUD + kanban + dark mode`。

## 10. 文件变更清单

新增：

- `src/components/task/KanbanBoard.vue`
- `src/components/task/KanbanColumn.vue`
- `src/components/task/TaskCard.vue`
- `src/components/task/TaskFormModal.vue`

修改：

- `src/stores/task.js`（CRUD + 持久化）
- `src/stores/ui.js`（深色模式 + 持久化）
- `src/utils/storage.js`（localStorage 读写）
- `src/utils/validators.js`（枚举常量）
- `src/components/layout/AppHeader.vue`（深色切换按钮）
- `src/views/HomeView.vue`（组装看板）
- `tailwind.config.js`（`darkMode: 'class'`）