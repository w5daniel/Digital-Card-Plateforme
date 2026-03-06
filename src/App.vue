<template>
  <div
    id="app"
    class="min-h-screen flex flex-col bg-powder-50 dark:bg-onyx-950 text-onyx-900 dark:text-powder-100 transition-colors duration-200"
  >
    <NavBar v-if="!hideLayout" />
    <main class="flex-grow">
      <RouterView />
    </main>
    <FooterBar v-if="!hideLayout" />
    <ToastNotification />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import FooterBar from './components/FooterBar.vue'
import ToastNotification from './components/ToastNotification.vue'
import { useThemeStore } from './stores/themeStore'

const themeStore = useThemeStore()
const route = useRoute()

const hideLayout = computed(() => !!route.meta?.hideLayout)

onMounted(() => {
  // S'assurer que le thème est appliqué au montage
  themeStore.applyTheme()
})
</script>

<style>
/* Styles globaux déjà définis dans main.css */
</style>
