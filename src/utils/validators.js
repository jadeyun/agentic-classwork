// 表单校验工具骨架；校验规则在后续执行阶段与 CRUD 一并实现。
export function validateTaskTitle(title) {
  return Boolean(title && title.trim())
}
