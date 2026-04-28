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

async function bootstrap() {
  const themeStore = useThemeStore()
  themeStore.initTheme()

  // Await session restore so the router guard has user state before first navigation
  const authStore = useAuthStore()
  await authStore.restoreSession()

  const fontStore = useFontStore()
  fontStore.init()

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
}

bootstrap()
