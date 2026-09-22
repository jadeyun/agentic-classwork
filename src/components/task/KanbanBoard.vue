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