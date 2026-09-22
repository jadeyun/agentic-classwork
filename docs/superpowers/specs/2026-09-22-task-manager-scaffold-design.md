# 任务管理应用 · 项目骨架设计文档

- 日期：2026-09-22
- 阶段：clarify（需求澄清 / 骨架设计）
- 范围：仅初始化项目骨架与目录结构，不实现具体业务功能

## 1. 背景与目标

用 Vue 3 + Vite + Tailwind CSS 初始化一个任务管理应用项目，规划好目录结构（组件、状态管理、工具函数），暂不实现具体功能，先搭好骨架。验证 `npm run dev` 能在浏览器看到基础布局/空白页面，确认无误后 Git 提交本轮结果。

## 2. 技术选型（已确认）

| 项 | 选择 |
| --- | --- |
| 前端框架 | Vue 3（Composition API） |
| 构建工具 | Vite（`@vitejs/plugin-vue`） |
| 样式方案 | Tailwind CSS v3（`tailwind.config.js` + PostCSS 经典方式） |
| 状态管理 | Pinia（`src/stores`） |
| 路由 | vue-router（已引入） |
| 数据存储 | localStorage（封装为工具函数，本轮仅占位） |

## 3. 依赖清单

- dependencies：`vue`、`vue-router`、`pinia`
- devDependencies：`vite`、`@vitejs/plugin-vue`、`tailwindcss@^3`、`postcss`、`autoprefixer`

## 4. 目录结构

```
agentic-classwork/
├── index.html
├── vite.config.js
├── tailwind.config.js          # v3 经典配置
├── postcss.config.js
├── package.json
├── .gitignore
└── src/
    ├── main.js                 # 挂载 Pinia + router + App
    ├── App.vue                 # 根组件，承载 RouterView
    ├── router/
    │   └── index.js
    ├── stores/
    │   ├── task.js             # 任务状态（占位，不实现逻辑）
    │   └── ui.js               # 深色模式等 UI 状态（占位）
    ├── components/
    │   ├── layout/             # AppHeader / AppFooter 基础布局
    │   └── task/               # 预留：TaskCard / KanbanBoard 等（空目录）
    ├── views/
    │   └── HomeView.vue        # 基础布局空页面，验证 dev 可运行
    ├── utils/
    │   ├── storage.js          # localStorage 读写封装占位
    │   └── validators.js       # 表单校验工具占位
    └── assets/styles/
        └── index.css           # @tailwind 指令
```

## 5. 模块职责与边界

- **main.js**：创建 Vue 应用，注册 Pinia 与 router，挂载 App。
- **App.vue**：根组件，仅承载 `<RouterView />`。
- **router/index.js**：配置单条路由 `/` → `HomeView`。
- **stores/task.js、stores/ui.js**：定义 Pinia store 骨架（状态与方法名占位），本轮不实现任务 CRUD 与深色模式切换逻辑。
- **components/layout**：AppHeader / AppFooter 基础布局组件，供 HomeView 组合使用。
- **components/task**：预留目录，后续放 TaskCard、KanbanBoard 等。
- **utils/storage.js、validators.js**：定义函数签名占位，不实现内部逻辑。
- **HomeView.vue**：组合 AppHeader + 主区域 + AppFooter，渲染基础布局空页面，用于验证 dev 可运行。

每个单元职责单一、边界清晰：后续可独立理解与测试，修改内部实现不影响调用方。

## 6. 本轮边界（YAGNI）

- 只搭骨架：目录 + 配置文件 + 基础布局页 + 空占位模块。
- 明确不实现（留待后续执行节点）：
  - 任务 CRUD（标题必填 / 描述选填）
  - 三状态（待办 / 进行中 / 完成）
  - 三优先级（高红 / 中黄 / 低绿）
  - 看板三列拖拽
  - 深色模式一键切换与记忆
  - localStorage 持久化逻辑

## 7. 验证方式

后续执行节点安装 Node/npm 后：
1. `npm install` 安装依赖。
2. `npm run dev` 启动开发服务器。
3. 浏览器访问默认端口，出现带 AppHeader/AppFooter 的基础布局空页面即算通过。

## 8. Git 提交

- 本轮 clarify 阶段保持 Git 只读，不执行 commit。
- 需求中「验证后 `git commit`（提交信息如 `init project scaffold`）」延后到执行节点开放 commit 时执行。

## 9. 遗留决策与环境

- Node/npm 当前环境未安装，后续执行节点需先安装 Node.js（用户已授权允许安装）。
- commit 时机：后续执行节点开放（用户已确认）。