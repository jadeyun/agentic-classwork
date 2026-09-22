# 任务管理应用 UI 全面改进 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**执行方式（2026-09-22 确认）：子代理驱动（subagent-driven-development）。**

**Goal:** 将现有 Vue 3 任务管理应用重构为 Vintage Americana 复古配色，新增 Dashboard 统计区，并实现三列看板响应式布局与体验细节优化。

**Architecture:** 纯 UI 展示层改造，不动数据模型/store/持久化/拖拽流转。用 CSS 变量（`:root` 浅色、`.dark` 深色）注入 Tailwind `extend.colors` 语义色，组件统一使用语义工具类，深浅色随现有 `useUiStore` 的 class 切换自动生效。

**Tech Stack:** Vue 3 + Vite 5 + Tailwind CSS v3（`darkMode: 'class'`）+ Pinia。零新增依赖。

## Global Constraints

- 只允许修改 UI 展示层（组件模板/样式/`tailwind.config.js`/`index.css`），禁止改动 `src/stores/*`、`src/utils/storage.js`、`src/utils/validators.js`、`src/main.js`、`src/router/index.js`、`src/App.vue`。
- 优先级标签保留「高/中/低」三字文字（`TASK_PRIORITY_LABELS` 已提供），不加彩色圆点等图形点缀。
- 移除看板顶部「共 N 个任务」文案。
- 深浅两套色相一致、仅调明度；优先级保持红/黄/绿语义，不用刺眼纯色。
- 本项目无测试框架，验证命令统一为 `npm run build`（退出码 0、无编译/PostCSS 报错）+ 浏览器人工核验。
- 语义色工具类**禁用 opacity 修饰符**（如 `text-primary/70`），因为主题色是 hex 变量，透明度修饰会生成非法 CSS；hover 淡化统一用 `hover:opacity-*`。

---

### Task 1: 主题基础（CSS 变量 + Tailwind 语义色）

**Files:**
- Modify: `src/assets/styles/index.css`
- Modify: `tailwind.config.js`

**Interfaces:**
- Produces: Tailwind 语义色 `page / surface / card / primary / secondary / accent / accent-secondary / accent-contrast / border / priority-high / priority-mid / priority-low / priority-high-soft / priority-mid-soft / priority-low-soft`，供后续所有组件任务使用。

- [ ] **Step 1: 写入 CSS 变量**

将 `src/assets/styles/index.css` 重写为：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-page: #F7F4EC;
  --bg-surface: #EEE9D9;
  --card-bg: #FCFAF4;
  --text-primary: #313869;
  --text-secondary: #5B5F82;
  --accent-primary: #313869;
  --accent-secondary: #3D7187;
  --accent-contrast: #FFFFFF;
  --border: #D8D3C2;
  --priority-high: #A72E21;
  --priority-mid: #C98A2B;
  --priority-low: #5C7A4E;
  --priority-high-soft: #F1DDD9;
  --priority-mid-soft: #F5E8CF;
  --priority-low-soft: #E4E9DD;
}

.dark {
  --bg-page: #1B1E33;
  --bg-surface: #262A45;
  --card-bg: #2E3353;
  --text-primary: #EEE9D9;
  --text-secondary: #B9B6A8;
  --accent-primary: #6B72A8;
  --accent-secondary: #5FA3B8;
  --accent-contrast: #1B1E33;
  --border: #3A3F5C;
  --priority-high: #D9695C;
  --priority-mid: #E0AA52;
  --priority-low: #7FA06B;
  --priority-high-soft: #3D2728;
  --priority-mid-soft: #3B3223;
  --priority-low-soft: #2A3329;
}
```

- [ ] **Step 2: 映射 Tailwind 语义色**

将 `tailwind.config.js` 重写为：

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
        surface: 'var(--bg-surface)',
        card: 'var(--card-bg)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        accent: 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
        'accent-contrast': 'var(--accent-contrast)',
        border: 'var(--border)',
        'priority-high': 'var(--priority-high)',
        'priority-mid': 'var(--priority-mid)',
        'priority-low': 'var(--priority-low)',
        'priority-high-soft': 'var(--priority-high-soft)',
        'priority-mid-soft': 'var(--priority-mid-soft)',
        'priority-low-soft': 'var(--priority-low-soft)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: 验证编译**

Run: `npm run build`
Expected: 退出码 0，无 PostCSS 报错（此时组件仍在用旧的 gray/blue 类，与新配置兼容，不影响编译通过）。

---

### Task 2: Dashboard 统计组件

**Files:**
- Create: `src/components/task/DashboardStats.vue`

**Interfaces:**
- Consumes: `useTaskStore().tasks`；`STATUS_ORDER` / `TASK_STATUS_LABELS` / `PRIORITY_ORDER` / `TASK_PRIORITY_LABELS`（来自 `src/utils/validators.js`，已存在）。
- Produces: 独立无 props 组件 `DashboardStats`，供 `KanbanBoard` 直接引入。

- [ ] **Step 1: 创建组件**

新建 `src/components/task/DashboardStats.vue`：

```vue
<script setup>
import { computed } from 'vue'
import { useTaskStore } from '../../stores/task'
import {
  STATUS_ORDER,
  TASK_STATUS_LABELS,
  PRIORITY_ORDER,
  TASK_PRIORITY_LABELS,
} from '../../utils/validators'

const taskStore = useTaskStore()

const total = computed(() => taskStore.tasks.length)

const statusGroups = computed(() =>
  STATUS_ORDER.map((status) => ({
    key: status,
    label: TASK_STATUS_LABELS[status],
    count: taskStore.tasks.filter((t) => t.status === status).length,
  }))
)

const priorityGroups = computed(() =>
  PRIORITY_ORDER.map((priority) => ({
    key: priority,
    label: TASK_PRIORITY_LABELS[priority],
    count: taskStore.tasks.filter((t) => t.priority === priority).length,
  }))
)

const priorityTone = {
  high: 'text-priority-high',
  medium: 'text-priority-mid',
  low: 'text-priority-low',
}
</script>

<template>
  <section class="grid gap-4 md:grid-cols-[1fr_2fr]">
    <div class="rounded-xl bg-accent p-5 text-accent-contrast shadow-sm">
      <p class="text-sm opacity-80">任务总数</p>
      <p class="mt-2 text-4xl font-bold">{{ total }}</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-xl bg-surface p-4 shadow-sm">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-secondary">状态</h3>
        <ul class="mt-2 space-y-2">
          <li
            v-for="g in statusGroups"
            :key="g.key"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-secondary">{{ g.label }}</span>
            <span class="font-semibold text-primary">{{ g.count }}</span>
          </li>
        </ul>
      </div>

      <div class="rounded-xl bg-surface p-4 shadow-sm">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-secondary">优先级</h3>
        <ul class="mt-2 space-y-2">
          <li
            v-for="g in priorityGroups"
            :key="g.key"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-secondary">{{ g.label }}</span>
            <span class="font-semibold" :class="priorityTone[g.key]">{{ g.count }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 2: 验证编译**

Run: `npm run build`
Expected: 退出码 0。组件尚未被引用，仅供编译校验语法。

---

### Task 3: KanbanBoard（统计区 + 响应式三列 + 移除总数文案）

**Files:**
- Modify: `src/components/task/KanbanBoard.vue`

**Interfaces:**
- Consumes: `DashboardStats`（Task 2）、`useTaskStore`、`STATUS_ORDER` / `TASK_STATUS_LABELS`。
- Produces: 向 `KanbanColumn` 传入 `status` / `label` / `tasks`，并监听 `drop` / `edit` / `delete` 事件（接口签名不变）。

- [ ] **Step 1: 重写组件**

将 `src/components/task/KanbanBoard.vue` 重写为：

```vue
<script setup>
import { ref } from 'vue'
import DashboardStats from './DashboardStats.vue'
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
  <div class="mx-auto w-full max-w-6xl">
    <DashboardStats />

    <div class="mt-4 flex items-center justify-end">
      <button
        class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition hover:opacity-90"
        @click="openCreate"
      >
        新建任务
      </button>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
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

- [ ] **Step 2: 验证编译**

Run: `npm run build`
Expected: 退出码 0。

---

### Task 4: KanbanColumn（自适应宽度 + 空状态图标 + 配色）

**Files:**
- Modify: `src/components/task/KanbanColumn.vue`

**Interfaces:**
- Consumes: props `status` / `label` / `tasks`（不变）；`TaskCard`。
- Produces: 事件 `drop(taskId, status)` / `edit(task)` / `delete(task)`（不变，透传 `TaskCard`）。

- [ ] **Step 1: 重写组件**

将 `src/components/task/KanbanColumn.vue` 重写为：

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
  <section class="flex flex-col rounded-xl bg-surface p-3">
    <header class="mb-3 flex items-center justify-between px-1">
      <h2 class="text-sm font-semibold text-primary">{{ label }}</h2>
      <span class="rounded-full border border-border px-2 py-0.5 text-xs text-secondary">{{ tasks.length }}</span>
    </header>
    <div class="flex min-h-24 flex-1 flex-col gap-2" @dragover="onDragOver" @drop="onDrop">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
      <div
        v-if="tasks.length === 0"
        class="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border p-4 text-xs text-secondary"
      >
        <svg
          class="h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 5v14" />
          <path d="m5 12 7 7 7-7" />
        </svg>
        暂无任务，把卡片拖到这里
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 2: 验证编译**

Run: `npm run build`
Expected: 退出码 0。

---

### Task 5: TaskCard（hover + 优先级徽章 + 配色）

**Files:**
- Modify: `src/components/task/TaskCard.vue`

**Interfaces:**
- Consumes: props `task`（`Task` 对象）；`TASK_PRIORITY` / `TASK_PRIORITY_LABELS`。
- Produces: 事件 `edit(task)` / `delete(task)` / `dragstart(taskId)`（不变）。

- [ ] **Step 1: 重写组件**

将 `src/components/task/TaskCard.vue` 重写为：

```vue
<script setup>
import { computed } from 'vue'
import { TASK_PRIORITY, TASK_PRIORITY_LABELS } from '../../utils/validators'

const props = defineProps({
  task: { type: Object, required: true },
})

const emit = defineEmits(['edit', 'delete', 'dragstart'])

// 必须用 computed：updateTask 以 Object.assign 原地修改任务对象，
// 顶层一次性计算会在编辑优先级后失去响应式。
const priorityLabel = computed(() => TASK_PRIORITY_LABELS[props.task.priority] || '')

const badgeClass = computed(() => {
  const classes = {
    [TASK_PRIORITY.HIGH]: 'bg-priority-high-soft text-priority-high',
    [TASK_PRIORITY.MEDIUM]: 'bg-priority-mid-soft text-priority-mid',
    [TASK_PRIORITY.LOW]: 'bg-priority-low-soft text-priority-low',
  }
  return classes[props.task.priority] || ''
})

function onDragStart(e) {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', props.task.id)
  emit('dragstart', props.task.id)
}
</script>

<template>
  <div
    draggable="true"
    class="cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition hover:border-accent-secondary hover:shadow-md"
    @dragstart="onDragStart"
  >
    <div class="flex items-start justify-between gap-2">
      <p class="text-sm font-medium text-primary">{{ task.title }}</p>
      <span class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold" :class="badgeClass">{{ priorityLabel }}</span>
    </div>
    <p v-if="task.description" class="mt-1 line-clamp-2 text-xs text-secondary">{{ task.description }}</p>
    <div class="mt-2 flex justify-end gap-1">
      <button class="rounded px-2 py-1 text-xs text-accent-secondary transition hover:opacity-80" @click="emit('edit', task)">编辑</button>
      <button class="rounded px-2 py-1 text-xs text-priority-high transition hover:opacity-80" @click="emit('delete', task)">删除</button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: 验证编译**

Run: `npm run build`
Expected: 退出码 0。

---

### Task 6: TaskFormModal（弹窗全组件配色）

**Files:**
- Modify: `src/components/task/TaskFormModal.vue`

**Interfaces:**
- Consumes: props `open` / `task`；`TASK_STATUS` / `TASK_STATUS_LABELS` / `TASK_PRIORITY` / `TASK_PRIORITY_LABELS` / `DEFAULT_TASK_STATUS` / `DEFAULT_TASK_PRIORITY` / `validateTaskTitle`。
- Produces: 事件 `close` / `submit({ title, description, status, priority })`（签名不变）。

- [ ] **Step 1: 重写组件**

将 `src/components/task/TaskFormModal.vue` 重写为：

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
    <div class="w-full max-w-md rounded-xl bg-surface p-5 shadow-xl">
      <h2 class="mb-4 text-base font-semibold text-primary">{{ task ? '编辑任务' : '新建任务' }}</h2>
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="mb-1 block text-sm text-secondary">标题 <span class="text-priority-high">*</span></label>
          <input
            v-model="form.title"
            type="text"
            class="w-full rounded-lg border border-border bg-page px-3 py-2 text-sm text-primary placeholder:text-secondary"
            placeholder="请输入任务标题"
          />
          <p v-if="error.title" class="mt-1 text-xs text-priority-high">{{ error.title }}</p>
        </div>
        <div>
          <label class="mb-1 block text-sm text-secondary">描述</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full rounded-lg border border-border bg-page px-3 py-2 text-sm text-primary placeholder:text-secondary"
            placeholder="选填"
          ></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-sm text-secondary">状态</label>
            <select v-model="form.status" class="w-full rounded-lg border border-border bg-page px-3 py-2 text-sm text-primary">
              <option v-for="s in statusOptions" :key="s" :value="s">{{ TASK_STATUS_LABELS[s] }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm text-secondary">优先级</label>
            <select v-model="form.priority" class="w-full rounded-lg border border-border bg-page px-3 py-2 text-sm text-primary">
              <option v-for="p in priorityOptions" :key="p" :value="p">{{ TASK_PRIORITY_LABELS[p] }}</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="rounded-lg border border-border px-4 py-2 text-sm text-secondary transition hover:opacity-80" @click="emit('close')">取消</button>
          <button type="submit" class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition hover:opacity-90">保存</button>
        </div>
      </form>
    </div>
  </div>
</template>
```

- [ ] **Step 2: 验证编译**

Run: `npm run build`
Expected: 退出码 0。

---

### Task 7: 布局组件配色（Header / Footer / HomeView）

**Files:**
- Modify: `src/components/layout/AppHeader.vue`
- Modify: `src/components/layout/AppFooter.vue`
- Modify: `src/views/HomeView.vue`

**Interfaces:**
- `AppHeader` 继续调用 `useUiStore().toggleDarkMode()`（不变）。
- `HomeView` 继续组装 `AppHeader` + `KanbanBoard` + `AppFooter`。

- [ ] **Step 1: 重写 AppHeader.vue**

```vue
<script setup>
import { useUiStore } from '../../stores/ui'

const ui = useUiStore()
</script>

<template>
  <header class="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
    <h1 class="text-lg font-semibold text-primary">任务管理应用</h1>
    <button
      class="rounded-lg border border-border px-3 py-1.5 text-sm text-secondary transition hover:opacity-80"
      @click="ui.toggleDarkMode()"
    >
      {{ ui.darkMode ? '浅色模式' : '深色模式' }}
    </button>
  </header>
</template>
```

- [ ] **Step 2: 重写 AppFooter.vue**

```vue
<script setup>
</script>

<template>
  <footer class="border-t border-border bg-surface px-4 py-3 text-center text-sm text-secondary">
    任务管理应用 · 完整功能
  </footer>
</template>
```

- [ ] **Step 3: 重写 HomeView.vue**

```vue
<script setup>
import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'
import KanbanBoard from '../components/task/KanbanBoard.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-page text-primary">
    <AppHeader />
    <main class="flex flex-1 flex-col p-4">
      <KanbanBoard />
    </main>
    <AppFooter />
  </div>
</template>
```

- [ ] **Step 4: 验证编译**

Run: `npm run build`
Expected: 退出码 0。

---

### Task 8: 全量构建 + 浏览器人工验证

**Files:**
- 无（验证阶段）

- [ ] **Step 1: 全量构建**

Run: `npm run build`
Expected: 退出码 0，无编译/PostCSS 报错。

- [ ] **Step 2: 启动开发服务器**

Run: `npm run dev`
Expected: Vite 启动成功，输出本地访问地址（默认 `http://localhost:5173`）。

- [ ] **Step 3: 浏览器人工验证（对照需求逐项核验）**

1. Dashboard 统计数字准确：总数 = 实际任务数；状态（待办/进行中/完成）、优先级（高/中/低）各分组求和正确，新增/拖拽后实时刷新。
2. 浅色/深色模式下配色正确：页面底色、卡片、按钮、弹窗、header/footer 均应用 Vintage Americana 配色，两套色相一致仅明度不同。
3. 响应式：大屏（≥1024px）三列等分居中无两侧大空白；中屏（768–1023px）三列收窄；小屏（<768px）堆叠单列。
4. 优先级标签颜色 + 文字「高/中/低」清晰可辨（红/黄/绿语义正确，不纯靠颜色区分）。
5. 回归确认：拖拽改状态、新增/编辑/删除、深色切换与持久化均正常。

- [ ] **Step 4: 提交**

验证通过后 commit（Git 写操作延后到执行节点开放）：

```bash
git add src/assets/styles/index.css tailwind.config.js src/components/task/DashboardStats.vue src/components/task/KanbanBoard.vue src/components/task/KanbanColumn.vue src/components/task/TaskCard.vue src/components/task/TaskFormModal.vue src/components/layout/AppHeader.vue src/components/layout/AppFooter.vue src/views/HomeView.vue
git commit -m "feat: vintage americana UI redesign + dashboard stats"
```