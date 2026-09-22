<script setup>
import { ref } from 'vue'
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
