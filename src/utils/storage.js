// localStorage 持久化封装：读写均容错；读失败回退 null，写失败静默降级为内存态。
export const STORAGE_KEY = 'task-manager'
export const UI_STORAGE_KEY = 'task-manager-ui'

export function loadState(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    // 存储不可用时静默忽略，不阻断交互。
  }
}
