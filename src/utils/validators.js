export const TASK_STATUS = {
  TODO: 'todo',
  DOING: 'doing',
  DONE: 'done',
}

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: '待办',
  [TASK_STATUS.DOING]: '进行中',
  [TASK_STATUS.DONE]: '完成',
}

export const TASK_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.HIGH]: '高',
  [TASK_PRIORITY.MEDIUM]: '中',
  [TASK_PRIORITY.LOW]: '低',
}

export const STATUS_ORDER = [TASK_STATUS.TODO, TASK_STATUS.DOING, TASK_STATUS.DONE]
export const PRIORITY_ORDER = [TASK_PRIORITY.HIGH, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.LOW]

export const DEFAULT_TASK_STATUS = TASK_STATUS.TODO
export const DEFAULT_TASK_PRIORITY = TASK_PRIORITY.MEDIUM

export function validateTaskTitle(title) {
  return Boolean(title && title.trim())
}

export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
