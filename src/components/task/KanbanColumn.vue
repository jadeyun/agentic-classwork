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