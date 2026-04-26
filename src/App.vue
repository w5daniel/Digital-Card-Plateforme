<template>
  <div
    id="app"
    :class="
      hideLayout
        ? 'h-screen overflow-hidden'
        : 'min-h-screen flex flex-col bg-base-100 text-base-content transition-colors duration-200'
    "
  >
    <NavBar v-if="!hideLayout" />
    <main :class="hideLayout ? 'h-full' : 'flex-grow'">
      <RouterView v-slot="{ Component, route: r }">
        <Transition :name="r.meta?.hideLayout ? '' : 'page-fade'" mode="out-in">
          <component :is="Component" :key="r.path" />
        </Transition>
      </RouterView>
    </main>
    <FooterBar v-if="!hideFooter" />
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
const hideFooter = computed(() => !!route.meta?.hideLayout || !!route.meta?.hideFooter)

onMounted(() => {
  themeStore.applyTheme()
})
</script>

<style>
/* ── Page fade transition ──────────────────────────────────── */
.page-fade-enter-active {
  transition:
    opacity 0.22s ease-out,
    transform 0.22s ease-out;
}
.page-fade-leave-active {
  transition:
    opacity 0.18s ease-in,
    transform 0.18s ease-in;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
