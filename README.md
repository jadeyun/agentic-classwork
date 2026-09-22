# Task Manager

一个基于 Vue 3 + Pinia + Vite 构建的任务看板（Kanban）应用，支持任务的增删改查、看板拖拽分类、仪表盘统计以及明暗主题切换。

## 相关文档

- 需求 Prompt 汇总：[docs/task-manager-prompts.md](docs/task-manager-prompts.md)
- 功能展示截图：[screenshot/](screenshot/)

## 功能特性

- **任务管理**：创建、编辑、删除任务，支持标题、描述、状态（待办 / 进行中 / 完成）和优先级（高 / 中 / 低）
- **看板视图**：按状态分列展示任务，响应式布局（桌面端三列，移动端单列）
- **仪表盘统计**：实时展示任务总数、各状态数量、各优先级数量
- **本地持久化**：任务数据保存在浏览器 LocalStorage 中，刷新页面不丢失
- **明暗主题**：支持浅色 / 深色主题切换

## 技术栈

- [Vue 3](https://vuejs.org/)（组合式 API）
- [Pinia](https://pinia.vuejs.org/)：状态管理
- [Vue Router](https://router.vuejs.org/)：路由
- [Vite](https://vitejs.dev/)：构建工具
- [Tailwind CSS](https://tailwindcss.com/)：样式方案

## 快速开始

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

默认访问地址：`http://localhost:5173/`

构建生产版本：

```bash
npm run build
```

本地预览构建产物：

```bash
npm run preview
```

## 项目结构

```
src/
├── assets/styles/    # 全局样式
├── components/
│   ├── layout/        # 页头、页脚等布局组件
│   └── task/           # 任务相关组件（看板、卡片、表单、统计等）
├── router/             # 路由配置
├── stores/             # Pinia 状态store（任务、界面状态）
├── utils/              # 工具函数（本地存储、校验）
└── views/              # 页面视图
```

