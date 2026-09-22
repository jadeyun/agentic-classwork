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
