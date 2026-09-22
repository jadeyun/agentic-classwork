import { defineStore } from 'pinia'
import { loadState, saveState, UI_STORAGE_KEY } from '../utils/storage'

export const useUiStore = defineStore('ui', {
  state: () => ({
    darkMode: false,
  }),
  actions: {
    initDarkMode() {
      const pref = loadState(UI_STORAGE_KEY)
      const saved = pref && typeof pref.darkMode === 'boolean' ? pref.darkMode : null
      this.darkMode = saved !== null ? saved : this.systemPrefersDark()
      this.apply()
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      this.apply()
      saveState(UI_STORAGE_KEY, { darkMode: this.darkMode })
    },
    apply() {
      document.documentElement.classList.toggle('dark', this.darkMode)
    },
    systemPrefersDark() {
      return (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      )
    },
  },
})
