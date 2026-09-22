<script setup>
import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'
import KanbanBoard from '../components/task/KanbanBoard.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
    <AppHeader />
    <main class="flex flex-1 flex-col p-4">
      <KanbanBoard />
    </main>
    <AppFooter />
  </div>
</template>
