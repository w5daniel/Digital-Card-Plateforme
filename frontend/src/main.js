import './assets/main.css'

import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import VueKonva from 'vue-konva'

import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/themeStore'
import { useAuthStore } from './stores/authStore'
import { useFontStore } from './stores/fontStore'
import { useBrandKitStore } from './stores/brandKit'

const app = createApp(App)

app.use(createPinia())

// Initialiser le thème et restaurer la session avant le montage
const themeStore = useThemeStore()
themeStore.initTheme()

const authStore = useAuthStore()
authStore.restoreSession()

// Pre-load popular Google Fonts + user-specific custom fonts
const fontStore = useFontStore()
fontStore.init()

// Reload user-specific stores when user changes (login / logout / switch account)
const brandKitStore = useBrandKitStore()
brandKitStore.loadForUser()

watch(
  () => authStore.user?.email,
  () => {
    fontStore.reloadUserFonts()
    brandKitStore.loadForUser()
  },
)

app.use(router)
app.use(VueKonva)

app.mount('#app')
