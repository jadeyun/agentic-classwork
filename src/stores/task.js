import { defineStore } from 'pinia'
import { loadState, saveState, STORAGE_KEY } from '../utils/storage'
import {
  validateTaskTitle,
  generateId,
  DEFAULT_TASK_STATUS,
  DEFAULT_TASK_PRIORITY,
} from '../utils/validators'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
  }),
  actions: {
    load() {
      const data = loadState(STORAGE_KEY)
      this.tasks = Array.isArray(data) ? data : []
    },
    persist() {
      saveState(STORAGE_KEY, this.tasks)
    },
    addTask({ title, description = '', status = DEFAULT_TASK_STATUS, priority = DEFAULT_TASK_PRIORITY }) {
      const trimmed = (title ?? '').trim()
      if (!validateTaskTitle(trimmed)) {
        throw new Error('标题不能为空')
      }
      const now = Date.now()
      this.tasks.unshift({
        id: generateId(),
        title: trimmed,
        description: (description ?? '').trim(),
        status,
        priority,
        createdAt: now,
        updatedAt: now,
      })
      this.persist()
    },
    updateTask(id, patch) {
      const task = this.tasks.find((t) => t.id === id)
      if (!task) return
      if (patch.title !== undefined) {
        const trimmed = (patch.title ?? '').trim()
        if (!validateTaskTitle(trimmed)) {
          throw new Error('标题不能为空')
        }
        patch.title = trimmed
      }
      Object.assign(task, patch, { updatedAt: Date.now() })
      this.persist()
    },
    removeTask(id) {
      this.tasks = this.tasks.filter((t) => t.id !== id)
      this.persist()
    },
    moveTask(id, status) {
      const task = this.tasks.find((t) => t.id === id)
      if (!task) return
      task.status = status
      task.updatedAt = Date.now()
      this.persist()
    },
  },
})
