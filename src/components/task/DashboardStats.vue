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