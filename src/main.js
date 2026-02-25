import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/themeStore'

const app = createApp(App)

app.use(createPinia())

// Initialiser le thème après avoir créé Pinia
const themeStore = useThemeStore()
themeStore.initTheme()

app.use(router)

app.mount('#app')
