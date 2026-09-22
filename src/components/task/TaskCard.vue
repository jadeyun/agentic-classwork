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