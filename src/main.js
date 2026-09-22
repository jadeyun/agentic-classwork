import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/styles/index.css'

import { useTaskStore } from './stores/task'
import { useUiStore } from './stores/ui'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const taskStore = useTaskStore(pinia)
const uiStore = useUiStore(pinia)
taskStore.load()
uiStore.initDarkMode()

app.mount('#app')
