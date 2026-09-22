# 任务管理应用（完整功能）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **执行方式（用户已确认）：** Subagent-Driven — 每个任务派发独立子代理，任务间逐步评审。

**Goal:** 在既有的 Vue 3 + Vite + Tailwind CSS v3 骨架上，实现完整任务管理功能：任务 CRUD（标题必填、描述选填）、三状态（待办/进行中/完成）、三优先级（高红/中黄/低绿）、看板三列原生拖拽、深色模式切换记忆、localStorage 刷新持久化。

**Architecture:** 单页应用。Pinia store（`task`/`ui`）作为唯一数据源，全部改变经 store action 触发并即时持久化到 localStorage。`HomeView` 组合 `AppHeader` + `KanbanBoard` + `AppFooter`；看板由 KanbanColumn（三列）与 TaskCard（卡片）构成，原生 HTML5 拖拽改变状态；TaskFormModal 统一新增/编辑表单。深色模式通过根节点 `dark` 类切换（Tailwind `darkMode: 'class'`）。

**Tech Stack:** Vue 3（Composition API，`<script setup>`）、Vite 5、Tailwind CSS v3、Pinia、vue-router、原生 HTML5 拖拽（零新增依赖）、`crypto.randomUUID()`。

## Global Constraints

- 框架：Vue 3（Composition API，`<script setup>`）。
- 构建：Vite 5，插件 `@vitejs/plugin-vue`。
- 样式：Tailwind CSS v3（`tailwind.config.js` + PostCSS，非 v4 `@tailwindcss/vite` 插件式）；`tailwind.config.js` 增加 `darkMode: 'class'`。
- 状态管理：Pinia，store 位于 `src/stores`（`task.js`、`ui.js`）。
- 数据持久化：localStorage，封装为 `src/utils/storage.js`；任务列表 key=`task-manager`，UI 偏好 key=`task-manager-ui`；读写均 `try/catch` 容错（读失败回退空态，写失败静默降级，绝不崩溃）。
- 拖拽：仅原生 HTML5 拖拽事件（`draggable`/`dragstart`/`dragover`/`drop`）；**禁止**引入 sortablejs / vuedraggable 等依赖。
- 枚举与文案：所有状态/优先级取值只来自 `src/utils/validators.js` 导出的常量与映射（禁止散落魔法字符串）。
  - 状态：`todo`=待办、`doing`=进行中、`done`=完成。
  - 优先级：`high`=高（红）、`medium`=中（黄）、`low`=低（绿）。
  - 默认值：新建任务 `status='todo'`、`priority='medium'`、`description=''`；创建后状态与优先级均可改。
- 标题校验：trim 后非空才合法，否则表单阻止提交并提示「请输入任务标题」。
- 深色模式：首屏同步持久化偏好（无记录时按系统 `prefers-color-scheme`），切换后持久化。
- 页面语言：简体中文；应用标题「任务管理应用」。
- Git：clarify / plan 阶段只读；**所有 `git commit` 步骤一律延后到执行节点执行**，本计划中的提交步骤在非执行节点仅作记录。
- 测试设施：项目当前无单元测试框架（不新增）；每个任务的验证用 `npm run build`（退出码 0）与开发服务器/浏览器人工检查。
- 环境前置：执行节点需先确认 `node -v`/`npm -v` 可用，否则按此前授权安装 Node.js LTS 20.x。

---

## File Structure

新增：

```
src/components/task/TaskCard.vue
src/components/task/KanbanColumn.vue
src/components/task/TaskFormModal.vue
src/components/task/KanbanBoard.vue
```

修改：

```
src/utils/storage.js
src/utils/validators.js
src/stores/task.js
src/stores/ui.js
tailwind.config.js
src/main.js
src/components/layout/AppHeader.vue
src/components/layout/AppFooter.vue
src/views/HomeView.vue
```

各文件职责：

- `src/utils/storage.js`：localStorage 读写封装（容错）。
- `src/utils/validators.js`：枚举常量、显示映射、标题校验、ID 生成。
- `src/stores/task.js`：任务列表数据源 + CRUD/移动 + 持久化。
- `src/stores/ui.js`：深色模式状态 + 切换/初始化 + 持久化。
- `src/components/task/TaskCard.vue`：单张任务卡片（可拖拽，标题/描述/优先级徽章/编辑/删除）。
- `src/components/task/KanbanColumn.vue`：单列容器（拖放目标）。
- `src/components/task/TaskFormModal.vue`：新增/编辑共用表单弹窗。
- `src/components/task/KanbanBoard.vue`：三列看板编排 + 新增入口 + 模态框开关。
- `src/components/layout/AppHeader.vue`：标题栏 + 深色切换按钮。
- `src/views/HomeView.vue`：组装 Header + 看板 + Footer。
- `src/main.js`：启动时加载任务、初始化深色模式。

---

### Task 1: 工具层（存储 + 校验常量）

**Files:**
- Modify: `src/utils/storage.js`
- Modify: `src/utils/validators.js`

**Interfaces:**
- Consumes: 无。
- Produces（后续任务依赖的这些确切名称/signature）：
  - `storage.js`：`STORAGE_KEY`（=`'task-manager'`）、`UI_STORAGE_KEY`（=`'task-manager-ui'`）、`loadState(key): any|null`、`saveState(key, value): void`。
  - `validators.js`：`TASK_STATUS`、`TASK_STATUS_LABELS`、`TASK_PRIORITY`、`TASK_PRIORITY_LABELS`、`STATUS_ORDER`、`PRIORITY_ORDER`、`DEFAULT_TASK_STATUS`（=`'todo'`）、`DEFAULT_TASK_PRIORITY`（=`'medium'`）、`validateTaskTitle(title): boolean`、`generateId(): string`。

- [ ] **Step 1: 改写 `src/utils/storage.js`**

```js
// localStorage 持久化封装：读写均容错；读失败回退 null，写失败静默降级为内存态。
export const STORAGE_KEY = 'task-manager'
export const UI_STORAGE_KEY = 'task-manager-ui'

export function loadState(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    // 存储不可用时静默忽略，不阻断交互。
  }
}
```

- [ ] **Step 2: 改写 `src/utils/validators.js`**

```js
export const TASK_STATUS = {
  TODO: 'todo',
  DOING: 'doing',
  DONE: 'done',
}

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: '待办',
  [TASK_STATUS.DOING]: '进行中',
  [TASK_STATUS.DONE]: '完成',
}

export const TASK_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.HIGH]: '高',
  [TASK_PRIORITY.MEDIUM]: '中',
  [TASK_PRIORITY.LOW]: '低',
}

export const STATUS_ORDER = [TASK_STATUS.TODO, TASK_STATUS.DOING, TASK_STATUS.DONE]
export const PRIORITY_ORDER = [TASK_PRIORITY.HIGH, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.LOW]

export const DEFAULT_TASK_STATUS = TASK_STATUS.TODO
export const DEFAULT_TASK_PRIORITY = TASK_PRIORITY.MEDIUM

export function validateTaskTitle(title) {
  return Boolean(title && title.trim())
}

export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
```

- [ ] **Step 3: 验证（构建）**

Run: `npm run build`
Expected: 退出码 0；本节导出均为合法 ES 模块（当前尚未被引用，仅确认语法与打包无误）。

---

### Task 2: Pinia 状态层（任务 + UI）

**Files:**
- Modify: `src/stores/task.js`
- Modify: `src/stores/ui.js`

**Interfaces:**
- Consumes: Task 1 的 `loadState`/`saveState`/`STORAGE_KEY`/`UI_STORAGE_KEY`/`validateTaskTitle`/`generateId`/`DEFAULT_TASK_STATUS`/`DEFAULT_TASK_PRIORITY`。
- Produces（后续任务依赖）：
  - `useTaskStore`：`state.tasks: Task[]`；actions `load()`、`persist()`、`addTask({title, description?, status?, priority?})`、`updateTask(id, patch)`、`removeTask(id)`、`moveTask(id, status)`。
  - `useUiStore`：`state.darkMode: boolean`；actions `initDarkMode()`、`toggleDarkMode()`、`apply()`、`systemPrefersDark()`。

- [ ] **Step 1: 改写 `src/stores/task.js`**

```js
import { defineStore } from 'pinia'
import { loadState, saveState, STORAGE_KEY } from '../utils/storage'
import {
  validateTaskTitle,
  generateId,
  DEFAULT_TASK_STATUS,
  DEFAULT_TASK_PRIORITY,
} from '../utils/validators'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
  }),
  actions: {
    load() {
      const data = loadState(STORAGE_KEY)
      this.tasks = Array.isArray(data) ? data : []
    },
    persist() {
      saveState(STORAGE_KEY, this.tasks)
    },
    addTask({ title, description = '', status = DEFAULT_TASK_STATUS, priority = DEFAULT_TASK_PRIORITY }) {
      const trimmed = (title ?? '').trim()
      if (!validateTaskTitle(trimmed)) {
        throw new Error('标题不能为空')
      }
      const now = Date.now()
      this.tasks.unshift({
        id: generateId(),
        title: trimmed,
        description: (description ?? '').trim(),
        status,
        priority,
        createdAt: now,
        updatedAt: now,
      })
      this.persist()
    },
    updateTask(id, patch) {
      const task = this.tasks.find((t) => t.id === id)
      if (!task) return
      if (patch.title !== undefined) {
        const trimmed = (patch.title ?? '').trim()
        if (!validateTaskTitle(trimmed)) {
          throw new Error('标题不能为空')
        }
        patch.title = trimmed
      }
      Object.assign(task, patch, { updatedAt: Date.now() })
      this.persist()
    },
    removeTask(id) {
      this.tasks = this.tasks.filter((t) => t.id !== id)
      this.persist()
    },
    moveTask(id, status) {
      const task = this.tasks.find((t) => t.id === id)
      if (!task) return
      task.status = status
      task.updatedAt = Date.now()
      this.persist()
    },
  },
})
```

- [ ] **Step 2: 改写 `src/stores/ui.js`**

```js
import { defineStore } from 'pinia'
import { loadState, saveState, UI_STORAGE_KEY } from '../utils/storage'

export const useUiStore = defineStore('ui', {
  state: () => ({
    darkMode: false,
  }),
  actions: {
    initDarkMode() {
      const pref = loadState(UI_STORAGE_KEY)
      const saved = pref && typeof pref.darkMode === 'boolean' ? pref.darkMode : null
      this.darkMode = saved !== null ? saved : this.systemPrefersDark()
      this.apply()
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      this.apply()
      saveState(UI_STORAGE_KEY, { darkMode: this.darkMode })
    },
    apply() {
      document.documentElement.classList.toggle('dark', this.darkMode)
    },
    systemPrefersDark() {
      return (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      )
    },
  },
})
```

- [ ] **Step 3: 验证（构建）**

Run: `npm run build`
Expected: 退出码 0（store 文件当前未被引用也不报错，确认为合法 ES 模块即可）。

---

### Task 3: 深色模式配置 + 应用启动初始化

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/main.js`

**Interfaces:**
- Consumes: Task 2 的 `useTaskStore`（`load`）、`useUiStore`（`initDarkMode`）及其在 `pinia` 实例上用法的先决条件。
- Produces: `tailwind.config.js` 支持 `class` 深色策略；`src/main.js` 应用启动即加载任务并初始化深色模式类。

- [ ] **Step 1: 改写 `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 2: 改写 `src/main.js`**

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/styles/index.css'

import { useTaskStore } from './stores/task'
import { useUiStore } from './stores/ui'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const taskStore = useTaskStore(pinia)
const uiStore = useUiStore(pinia)
taskStore.load()
uiStore.initDarkMode()

app.mount('#app')
```

- [ ] **Step 3: 验证（构建）**

Run: `npm run build`
Expected: 退出码 0，无模块解析错误。

---

### Task 4: 任务卡片组件 TaskCard

**Files:**
- Create: `src/components/task/TaskCard.vue`

**Interfaces:**
- Consumes: Task 1 的 `TASK_PRIORITY`、`TASK_PRIORITY_LABELS`。
- Produces:
  - props：`task: Object`（必填，含 `id/title/description/status/priority`）。
  - emits：`edit(task)`、`delete(task)`、`dragstart(taskId)`。
  - 卡片自身 `draggable`，`dragstart` 时向 `dataTransfer` 写入 `task.id`。

- [ ] **Step 1: 创建 `src/components/task/TaskCard.vue`**

```vue
<script setup>
import { TASK_PRIORITY, TASK_PRIORITY_LABELS } from '../../utils/validators'

const props = defineProps({
  task: { type: Object, required: true },
})

const emit = defineEmits(['edit', 'delete', 'dragstart'])

const priorityLabel = TASK_PRIORITY_LABELS[props.task.priority] || ''

const badgeClass = {
  [TASK_PRIORITY.HIGH]: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
  [TASK_PRIORITY.MEDIUM]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
  [TASK_PRIORITY.LOW]: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
}[props.task.priority] || ''

function onDragStart(e) {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', props.task.id)
  emit('dragstart', props.task.id)
}
</script>

<template>
  <div
    draggable="true"
    class="cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    @dragstart="onDragStart"
  >
    <div class="flex items-start justify-between gap-2">
      <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ task.title }}</p>
      <span class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium" :class="badgeClass">{{ priorityLabel }}</span>
    </div>
    <p v-if="task.description" class="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{{ task.description }}</p>
    <div class="mt-2 flex justify-end gap-1">
      <button class="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30" @click="emit('edit', task)">编辑</button>
      <button class="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30" @click="emit('delete', task)">删除</button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: 验证（构建）**

Run: `npm run build`
Expected: 退出码 0。

---

### Task 5: 看板列组件 KanbanColumn

**Files:**
- Create: `src/components/task/KanbanColumn.vue`

**Interfaces:**
- Consumes: Task 4 的 `TaskCard`（默认导出，props `task`，emits `edit`/`delete`）。
- Produces:
  - props：`status: String`（必填）、`label: String`（必填）、`tasks: Array`（必填）。
  - emits：`drop(taskId, status)`、`edit(task)`、`delete(task)`。
  - 列为拖放目标：`@dragover` 阻止默认、`@drop` 读取 `taskId` 后向上 `emit('drop', taskId, status)`。

- [ ] **Step 1: 创建 `src/components/task/KanbanColumn.vue`**

```vue
<script setup>
import TaskCard from './TaskCard.vue'

const props = defineProps({
  status: { type: String, required: true },
  label: { type: String, required: true },
  tasks: { type: Array, required: true },
})

const emit = defineEmits(['drop', 'edit', 'delete'])

function onDragOver(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

function onDrop(e) {
  e.preventDefault()
  const taskId = e.dataTransfer.getData('text/plain')
  if (taskId) emit('drop', taskId, props.status)
}
</script>

<template>
  <section class="flex w-72 shrink-0 flex-col rounded-xl bg-gray-100 p-3 dark:bg-gray-800/60">
    <header class="mb-3 flex items-center justify-between px-1">
      <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ label }}</h2>
      <span class="rounded-full bg-white px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-300">{{ tasks.length }}</span>
    </header>
    <div class="flex min-h-24 flex-1 flex-col gap-2" @dragover="onDragOver" @drop="onDrop">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
      <p
        v-if="tasks.length === 0"
        class="rounded-lg border border-dashed border-gray-300 p-4 text-center text-xs text-gray-400 dark:border-gray-600 dark:text-gray-500"
      >
        拖拽卡片到此
      </p>
    </div>
  </section>
</template>
```

- [ ] **Step 2: 验证（构建）**

Run: `npm run build`
Expected: 退出码 0。

---

### Task 6: 表单弹窗 TaskFormModal

**Files:**
- Create: `src/components/task/TaskFormModal.vue`

**Interfaces:**
- Consumes: Task 1 的 `TASK_STATUS`、`TASK_STATUS_LABELS`、`TASK_PRIORITY`、`TASK_PRIORITY_LABELS`、`DEFAULT_TASK_STATUS`、`DEFAULT_TASK_PRIORITY`、`validateTaskTitle`。
- Produces:
  - props：`open: Boolean`（默认 false）、`task: Object|null`（null=新增，否则编辑）。
  - emits：`close()`、`submit(payload)`；`payload = { title, description, status, priority }`（均为字符串）。

- [ ] **Step 1: 创建 `src/components/task/TaskFormModal.vue`**

```vue
<script setup>
import { reactive, watch } from 'vue'
import {
  TASK_STATUS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY,
  TASK_PRIORITY_LABELS,
  DEFAULT_TASK_STATUS,
  DEFAULT_TASK_PRIORITY,
  validateTaskTitle,
} from '../../utils/validators'

const props = defineProps({
  open: { type: Boolean, default: false },
  task: { type: Object, default: null },
})

const emit = defineEmits(['close', 'submit'])

const form = reactive({
  title: '',
  description: '',
  status: DEFAULT_TASK_STATUS,
  priority: DEFAULT_TASK_PRIORITY,
})
const error = reactive({ title: '' })

const statusOptions = Object.values(TASK_STATUS)
const priorityOptions = Object.values(TASK_PRIORITY)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    const t = props.task
    if (t) {
      form.title = t.title
      form.description = t.description || ''
      form.status = t.status
      form.priority = t.priority
    } else {
      form.title = ''
      form.description = ''
      form.status = DEFAULT_TASK_STATUS
      form.priority = DEFAULT_TASK_PRIORITY
    }
    error.title = ''
  }
)

function onSubmit() {
  if (!validateTaskTitle(form.title)) {
    error.title = '请输入任务标题'
    return
  }
  emit('submit', {
    title: form.title.trim(),
    description: form.description.trim(),
    status: form.status,
    priority: form.priority,
  })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-gray-800">
      <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">{{ task ? '编辑任务' : '新建任务' }}</h2>
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="mb-1 block text-sm text-gray-600 dark:text-gray-300">标题 <span class="text-red-500">*</span></label>
          <input
            v-model="form.title"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="请输入任务标题"
          />
          <p v-if="error.title" class="mt-1 text-xs text-red-500">{{ error.title }}</p>
        </div>
        <div>
          <label class="mb-1 block text-sm text-gray-600 dark:text-gray-300">描述</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="选填"
          ></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-sm text-gray-600 dark:text-gray-300">状态</label>
            <select v-model="form.status" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
              <option v-for="s in statusOptions" :key="s" :value="s">{{ TASK_STATUS_LABELS[s] }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm text-gray-600 dark:text-gray-300">优先级</label>
            <select v-model="form.priority" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
              <option v-for="p in priorityOptions" :key="p" :value="p">{{ TASK_PRIORITY_LABELS[p] }}</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" @click="emit('close')">取消</button>
          <button type="submit" class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">保存</button>
        </div>
      </form>
    </div>
  </div>
</template>
```

- [ ] **Step 2: 验证（构建）**

Run: `npm run build`
Expected: 退出码 0。

---

### Task 7: 看板编排 KanbanBoard

**Files:**
- Create: `src/components/task/KanbanBoard.vue`

**Interfaces:**
- Consumes: Task 2 的 `useTaskStore`（`tasks`、`addTask`、`updateTask`、`removeTask`、`moveTask`）；Task 1 的 `STATUS_ORDER`、`TASK_STATUS_LABELS`；Task 5 `KanbanColumn`；Task 6 `TaskFormModal`。
- Produces: 默认导出看板组件（含「新建任务」入口、三列分组、新增/编辑/删除/拖拽改状态的编排）。

- [ ] **Step 1: 创建 `src/components/task/KanbanBoard.vue`**

```vue
<script setup>
import { computed, ref } from 'vue'
import KanbanColumn from './KanbanColumn.vue'
import TaskFormModal from './TaskFormModal.vue'
import { useTaskStore } from '../../stores/task'
import { STATUS_ORDER, TASK_STATUS_LABELS } from '../../utils/validators'

const taskStore = useTaskStore()

const modalOpen = ref(false)
const editingTask = ref(null)

const columns = STATUS_ORDER.map((s) => ({ status: s, label: TASK_STATUS_LABELS[s] }))

const tasksByStatus = (status) => taskStore.tasks.filter((t) => t.status === status)

function openCreate() {
  editingTask.value = null
  modalOpen.value = true
}

function openEdit(task) {
  editingTask.value = task
  modalOpen.value = true
}

function onDelete(task) {
  if (confirm(`确定删除任务「${task.title}」吗？`)) {
    taskStore.removeTask(task.id)
  }
}

function onDrop(taskId, status) {
  taskStore.moveTask(taskId, status)
}

function onSubmit(payload) {
  if (editingTask.value) {
    taskStore.updateTask(editingTask.value.id, payload)
  } else {
    taskStore.addTask(payload)
  }
  modalOpen.value = false
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-500 dark:text-gray-400">共 {{ taskStore.tasks.length }} 个任务</p>
      <button class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700" @click="openCreate">新建任务</button>
    </div>
    <div class="flex gap-4 overflow-x-auto pb-2">
      <KanbanColumn
        v-for="col in columns"
        :key="col.status"
        :status="col.status"
        :label="col.label"
        :tasks="tasksByStatus(col.status)"
        @drop="onDrop"
        @edit="openEdit"
        @delete="onDelete"
      />
    </div>
    <TaskFormModal :open="modalOpen" :task="editingTask" @close="modalOpen = false" @submit="onSubmit" />
  </div>
</template>
```

- [ ] **Step 2: 验证（构建）**

Run: `npm run build`
Expected: 退出码 0。

---

### Task 8: 布局装配（Header / Footer / HomeView）

**Files:**
- Modify: `src/components/layout/AppHeader.vue`
- Modify: `src/components/layout/AppFooter.vue`
- Modify: `src/views/HomeView.vue`

**Interfaces:**
- Consumes: Task 2 的 `useUiStore`（`darkMode`、`toggleDarkMode`）；Task 7 的 `KanbanBoard`。
- Produces: 完整页面 —— Header 含深色切换按钮、Footer 版本文案、HomeView 组合 Header + KanbanBoard + Footer。

- [ ] **Step 1: 改写 `src/components/layout/AppHeader.vue`**

```vue
<script setup>
import { useUiStore } from '../../stores/ui'

const ui = useUiStore()
</script>

<template>
  <header class="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
    <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">任务管理应用</h1>
    <button
      class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      @click="ui.toggleDarkMode()"
    >
      {{ ui.darkMode ? '浅色模式' : '深色模式' }}
    </button>
  </header>
</template>
```

- [ ] **Step 2: 改写 `src/components/layout/AppFooter.vue`**

```vue
<script setup>
</script>

<template>
  <footer class="border-t border-gray-200 bg-white px-4 py-3 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
    任务管理应用 · 完整功能
  </footer>
</template>
```

- [ ] **Step 3: 改写 `src/views/HomeView.vue`**

```vue
<script setup>
import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'
import KanbanBoard from '../components/task/KanbanBoard.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
    <AppHeader />
    <main class="flex flex-1 flex-col p-4">
      <KanbanBoard />
    </main>
    <AppFooter />
  </div>
</template>
```

- [ ] **Step 4: 验证（构建）**

Run: `npm run build`
Expected: 退出码 0，生成 `dist/`，无编译/PostCSS 报错。

---

### Task 9: 浏览器运行验证

**Files:** 无新增文件。

**Interfaces:**
- Consumes: 全部前置任务产物。
- Produces: 开发服务器运行验证结果。

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`
Expected: 控制台输出本地地址（默认 `http://localhost:5173/`），无编译报错。

- [ ] **Step 2: 校验页面响应**

Run（另开终端）：`curl -s http://localhost:5173/ | head -20`
Expected: 返回包含 `<div id="app"></div>` 与入口脚本的 HTML。

- [ ] **Step 3: 浏览器人工验证（执行节点）**

逐项确认：
1. 新增任务：标题留空被拦截并提示「请输入任务标题」；描述可空；新增后默认状态=待办、默认优先级=中（黄）。
2. 编辑任务：标题/描述/状态/优先级均可改，保存生效。
3. 删除任务：确认后卡片消失。
4. 三列看板按状态正确分组；状态文案与优先级徽章颜色正确（高=红、中=黄、低=绿）。
5. 拖拽卡片到目标列，状态切换正确。
6. 深色模式一键切换并记忆；刷新页面后任务数据与深色偏好均不丢失。

- [ ] **Step 4: 停止开发服务器**

停止 Task 9 Step 1 启动的 dev 进程。

---

### Task 10: 提交本轮结果（仅执行节点）

> 注意：本步骤在**执行节点**执行（该节点已开放 Git 写操作）。当前 clarify / plan 阶段 Git 只读，严禁在任何更早的任务中提交。

- [ ] **Step 1: 查看变更**

Run: `git status`
Expected: 列出全部新增/修改文件。

- [ ] **Step 2: 提交**

```bash
git add .
git commit -m "feat: task manager CRUD + kanban + dark mode"
```

- [ ] **Step 3: 确认提交**

Run: `git log --oneline -1`
Expected: 最新一条为 `feat: task manager CRUD + kanban + dark mode`。

---

## Self-Review

- **Spec coverage**：CRUD（Task 2 store + Task 6 表单 + Task 7 编排）；标题必填/描述选填（Task 1 校验 + Task 6 表单）；三状态三优先级（Task 1 枚举 + Task 4 徽章 + Task 6 下拉）；看板三列拖拽（Task 5/Task 7 + Task 4 draggable）；深色模式切换记忆（Task 2 ui store + Task 3 配置 + Task 8 按钮）；持久化刷新不丢失（Task 1 storage + Task 2 store persist + Task 3 main.js 启动加载）。默认待办+中可改（Task 1 `DEFAULT_*` + Task 6 表单默认值 + store action 默认参数）。
- **Placeholder scan**：无 TBD/TODO；每个代码步骤均含完整文件内容；无「适当错误处理/添加校验」类空话（校验与 try/catch 均已给出具体代码）。
- **Type consistency**：`addTask/updateTask/removeTask/moveTask`、`load/persist`、`initDarkMode/toggleDarkMode/apply/systemPrefersDark`、`STATUS_ORDER/TASK_STATUS_LABELS/validateTaskTitle/generateId`、`TaskCard/KanbanColumn/TaskFormModal/KanbanBoard` 在定义与引用处命名一致；`submit` payload 字段与 store `addTask/updateTask` 参数对齐。