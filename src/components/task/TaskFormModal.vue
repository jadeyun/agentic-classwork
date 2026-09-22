<script setup>
import { reactive, watch } from 'vue'
import {
  TASK_STATUS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY,
  TASK_PRIORITY_LABELS,
  DEFAULT_TASK_STATUS,
  DEFAULT_TASK_PRIORITY,
  validateTaskTitle,
} from '../../utils/validators'

const props = defineProps({
  open: { type: Boolean, default: false },
  task: { type: Object, default: null },
})

const emit = defineEmits(['close', 'submit'])

const form = reactive({
  title: '',
  description: '',
  status: DEFAULT_TASK_STATUS,
  priority: DEFAULT_TASK_PRIORITY,
})
const error = reactive({ title: '' })

const statusOptions = Object.values(TASK_STATUS)
const priorityOptions = Object.values(TASK_PRIORITY)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    const t = props.task
    if (t) {
      form.title = t.title
      form.description = t.description || ''
      form.status = t.status
      form.priority = t.priority
    } else {
      form.title = ''
      form.description = ''
      form.status = DEFAULT_TASK_STATUS
      form.priority = DEFAULT_TASK_PRIORITY
    }
    error.title = ''
  }
)

function onSubmit() {
  if (!validateTaskTitle(form.title)) {
    error.title = '请输入任务标题'
    return
  }
  emit('submit', {
    title: form.title.trim(),
    description: form.description.trim(),
    status: form.status,
    priority: form.priority,
  })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-gray-800">
      <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">{{ task ? '编辑任务' : '新建任务' }}</h2>
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="mb-1 block text-sm text-gray-600 dark:text-gray-300">标题 <span class="text-red-500">*</span></label>
          <input
            v-model="form.title"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="请输入任务标题"
          />
          <p v-if="error.title" class="mt-1 text-xs text-red-500">{{ error.title }}</p>
        </div>
        <div>
          <label class="mb-1 block text-sm text-gray-600 dark:text-gray-300">描述</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="选填"
          ></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-sm text-gray-600 dark:text-gray-300">状态</label>
            <select v-model="form.status" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
              <option v-for="s in statusOptions" :key="s" :value="s">{{ TASK_STATUS_LABELS[s] }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm text-gray-600 dark:text-gray-300">优先级</label>
            <select v-model="form.priority" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
              <option v-for="p in priorityOptions" :key="p" :value="p">{{ TASK_PRIORITY_LABELS[p] }}</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" @click="emit('close')">取消</button>
          <button type="submit" class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">保存</button>
        </div>
      </form>
    </div>
  </div>
</template>
