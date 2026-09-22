# 任务管理应用 · UI 全面改进设计文档

- 日期：2026-09-22
- 阶段：clarify（需求澄清 / 设计）
- 范围：在既有任务管理应用（CRUD + 看板 + 深色模式 + 持久化已就绪）基础上做 UI 全面改进

## 1. 背景与目标

在已实现完整功能的 Vue 3 + Vite + Tailwind CSS v3 + Pinia 任务管理应用上，重构视觉与布局，目标：

- 新增 Dashboard 统计区域（任务总数、状态分布、优先级分布）。
- 全面替换为 Vintage Americana 复古配色，覆盖浅色/深色两种模式，色相一致、仅调明度。
- 看板三列响应式：大屏等分居中、中屏收窄、小屏单列堆叠。
- 优化空状态、卡片 hover、优先级标签等体验细节。

已确认的交互决策（2026-09-22 澄清）：

1. Dashboard 布局：**总数大卡片 + 两个分组**（状态 3 项、优先级 3 项，小卡片）。
2. 移除看板顶部「共 N 个任务」文字，任务总数统一由 Dashboard 承担（避免重复）。
3. 优先级标签仅用**配色 + 文字「高/中/低」**区分，**不加**彩色圆点等图形点缀。

## 2. 技术选型（复用既有骨架）

| 项 | 选择 |
| --- | --- |
| 前端框架 | Vue 3（Composition API，`<script setup>`） |
| 样式方案 | Tailwind CSS v3（`darkMode: 'class'`），通过 CSS 变量注入主题色 |
| 状态管理 | Pinia（`useTaskStore` 提供统计数据源） |
| 深色模式 | 沿用 `useUiStore` 的 class 切换（`<html>` 挂 `dark` 类） |
| 主题实现 | CSS 变量：浅色值在 `:root`、深色值在 `.dark`，再用 `tailwind.config.js` 的 `extend.colors` 映射为语义色 |

## 3. 配色方案（Vintage Americana）

浅色模式（`:root`）：

```
--bg-page: #F7F4EC;
--bg-surface: #EEE9D9;
--text-primary: #313869;
--text-secondary: #5B5F82;
--accent-primary: #313869;
--accent-secondary: #3D7187;
--border: #D8D3C2;
--priority-high: #A72E21;   /* 红 */
--priority-mid: #C98A2B;    /* 黄 */
--priority-low: #5C7A4E;    /* 绿 */
```

深色模式（`.dark`）：

```
--bg-page: #1B1E33;
--bg-surface: #262A45;
--text-primary: #EEE9D9;
--text-secondary: #B9B6A8;
--accent-primary: #6B72A8;
--accent-secondary: #5FA3B8;
--border: #3A3F5C;
--priority-high: #D9695C;   /* 红 */
--priority-mid: #E0AA52;    /* 黄 */
--priority-low: #7FA06B;    /* 绿 */
```

约束：

- 深浅两套色相一致（都是 Vintage Americana 系），只调明度。
- 优先级保持红/黄/绿语义不变，色调向复古系靠拢，不用刺眼纯色。
- 优先级徽章：浅色用「低透明度同色底 + 深字色」，深色用「低透明度同色底 + 浅字色」，保证文字可辨。

## 4. 主题落地方式

1. 在 `src/assets/styles/index.css` 定义 CSS 变量（`:root` 浅色、`.dark` 深色）。
2. 在 `tailwind.config.js` 的 `extend.colors` 中映射语义色：

```
page / surface / primary / secondary / accentPrimary / accentSecondary / borderColor / priorityHigh / priorityMid / priorityLow
```

3. 组件统一使用语义工具类（如 `bg-page`、`bg-surface`、`text-primary`、`text-secondary`、`border-borderColor`、`text-priorityHigh` 等），配合必要的 `text-white` 等强调色实现按钮/强调元素。
4. 深色切换由现有 `useUiStore.toggleDarkMode()`（已挂 `dark` 类）驱动，无需额外状态。

备选方案（不采用）：逐组件用 `dark:` 前缀硬编码两套色值。缺点：主题色散落各文件、后续改色需全局搜索替换，维护成本高。

## 5. 模块设计

### 5.1 新增组件：`src/components/task/DashboardStats.vue`

- Props：无；内部直接使用 `useTaskStore().tasks`。
- computed 统计：
  - `total`：`tasks.length`
  - `byStatus`：`{ todo, doing, done }` 各自数量
  - `byPriority`：`{ high, medium, low }` 各自数量
- 布局：
  - 顶部一个「任务总数」大卡片（使用 `accent-primary`，突出显示 total）。
  - 下方右侧第一个分组：状态（待办/进行中/完成）3 个小卡片。
  - 下方第二个分组：优先级（高/中/低）3 个小卡片，仅用各优先级对应复古色（红/黄/绿）与文字「高/中/低」区分，不加彩色圆点等图形点缀。
- 语义标签来自 `src/utils/validators.js` 的 `TASK_STATUS_LABELS`、`TASK_PRIORITY_LABELS`、`STATUS_ORDER`、`PRIORITY_ORDER`。

### 5.2 修改组件：`src/components/task/KanbanBoard.vue`

- 顶部插入 `<DashboardStats />`，位于「新建任务」按钮与三列看板之上。
- 移除「共 {{ taskStore.tasks.length }} 个任务」文案。
- 三列容器改为 grid + 外层 `max-w`（如 `max-w-6xl`）居中容器：
  - 大屏 `lg:grid-cols-3`，三列等分拉伸。
  - 中屏保持三列但按容器收窄（grid 占比随容器宽自适应，无需额外断点）。
  - 小屏 `grid-cols-1`，三列堆叠单列。
- 移除 `overflow-x-auto` 横向滚动（改为堆叠），`KanbanColumn` 移除固定 `w-72 shrink-0`，改为 `w-full`。

### 5.3 修改组件：`src/components/task/KanbanColumn.vue`

- 列容器 `w-72 shrink-0` 改为 `w-full` 自适应。
- 空状态占位：加一个小图标（内联 SVG，如 inbox/arrow-down 图标），文案改为更友好的提示（如「暂无任务，把卡片拖到这里」）。
- 整体配色替换为 Vintage Americana 语义色。

### 5.4 修改组件：`src/components/task/TaskCard.vue`

- 卡片 hover 增加轻微阴影或边框高亮（`hover:shadow-md` + `hover:border-*` 高亮）。
- 优先级徽章：保留文字「高/中/低」，配色改为复古红/黄/绿，深浅模式分别应用浅字/深字。
  - 徽章为 computed，继续用 `computed` 实现（原注释已说明需随 `Object.assign` 原地修改响应式刷新）。
- 卡片底色/文字/边框统一替换为语义色。

### 5.5 修改组件：`src/components/task/TaskFormModal.vue`

- 弹窗容器、表单控件、按钮统一替换为 Vintage Americana 语义色（含标签、输入框、select、保存/取消按钮）。
- 主按钮（保存）用 `accent-primary`，取消/次级用 `border` + `text-secondary`。

### 5.6 修改布局组件：`AppHeader.vue` / `AppFooter.vue` / `HomeView.vue`

- `HomeView.vue`：外层从 `bg-gray-50 dark:bg-gray-900` 改为 `bg-page text-primary`。
- `AppHeader.vue`：header 背景 `bg-surface`、边框 `border-borderColor`、标题 `text-primary`、切换按钮用语义色。
- `AppFooter.vue`：footer 同步 `bg-surface` / `border-borderColor` / `text-secondary`。

### 5.7 修改样式与配置文件

- `src/assets/styles/index.css`：新增 CSS 变量定义（`:root` / `.dark`）。
- `tailwind.config.js`：`extend.colors` 映射语义色（`darkMode: 'class'` 已存在，保持不变，无需引入 `prefers-color-scheme` 联动，保持手动切换优先）。

## 6. 响应式布局细则

| 断点 | 布局 |
| --- | --- |
| 大屏（≥1024px） | 三列等分、外层 `max-w` 居中，避免两侧大空白 |
| 中屏（768–1023px） | 保持三列、随容器收窄（grid `lg` 断点以下但非单列） |
| 小屏（<768px） | 三列堆叠为单列 |

## 7. 错误处理 / 边界（YAGNI）

- 不改动数据模型、store 逻辑、持久化、拖拽状态流转机制，仅改 UI 展示层。
- 不新增依赖（不引入图标库，内联 SVG）。
- 不引入 `prefers-color-scheme` 自动切换（沿用现有手动切换 + 持久化）。
- 不实现列内拖拽排序、搜索/过滤等非本轮功能。

## 8. 验证方式

1. `npm run build`：退出码 0，无编译/PostCSS 报错。
2. 浏览器人工验证（执行节点）：
   - Dashboard 统计数字：总数 = 实际任务数；状态三项、优先级三项各自求和正确。
   - 浅色/深色模式下，`--bg-page`、`--bg-surface`、`--text-primary`、`--accent-*`、`--priority-*` 等变量均按对应主题正确应用。
   - 三档窗口宽度（桌面 / 平板 / 手机）：大屏三列等分居中、中屏收窄、小屏单列堆叠。
   - 优先级标签颜色 + 文字「高/中/低」清晰可辨（红/黄/绿语义正确，文字不靠颜色单独区分）。

## 9. Git 提交

- clarify 阶段 Git 只读，不执行 commit。
- 待执行节点验证通过后提交，消息如 `feat: vintage americana UI redesign + dashboard stats`。

## 10. 文件变更清单

新增：

- `src/components/task/DashboardStats.vue`

修改：

- `src/assets/styles/index.css`（CSS 变量）
- `tailwind.config.js`（`extend.colors`）
- `src/components/task/KanbanBoard.vue`（统计区 + 响应式三列 + 移除总数文案）
- `src/components/task/KanbanColumn.vue`（宽度 + 空状态图标/文案 + 配色）
- `src/components/task/TaskCard.vue`（hover + 优先级徽章配色 + 配色）
- `src/components/task/TaskFormModal.vue`（弹窗全组件配色）
- `src/components/layout/AppHeader.vue`（配色）
- `src/components/layout/AppFooter.vue`（配色）
- `src/views/HomeView.vue`（页面底色）