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
