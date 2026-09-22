<script setup>
import { useUiStore } from '../../stores/ui'

const ui = useUiStore()
</script>

<template>
  <header class="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
    <h1 class="text-lg font-semibold text-primary">Task Manager</h1>
    <button
      class="rounded-lg border border-border px-3 py-1.5 text-sm text-secondary transition hover:opacity-80"
      @click="ui.toggleDarkMode()"
    >
      {{ ui.darkMode ? '浅色模式' : '深色模式' }}
    </button>
  </header>
</template> 