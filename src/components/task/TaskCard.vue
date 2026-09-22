<script setup>
import { computed } from 'vue'
import { TASK_PRIORITY, TASK_PRIORITY_LABELS } from '../../utils/validators'

const props = defineProps({
  task: { type: Object, required: true },
})

const emit = defineEmits(['edit', 'delete', 'dragstart'])

// 徽章文案与颜色必须用 computed：updateTask 以 Object.assign 原地修改任务对象，
// 若在 setup 顶层一次性计算，编辑优先级后徽章不会响应式刷新。
const priorityLabel = computed(() => TASK_PRIORITY_LABELS[props.task.priority] || '')

const badgeClass = computed(() => {
  const classes = {
    [TASK_PRIORITY.HIGH]: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
    [TASK_PRIORITY.MEDIUM]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
    [TASK_PRIORITY.LOW]: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
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
