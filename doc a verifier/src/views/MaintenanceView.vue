<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center px-4"
    :class="themeStore.darkMode ? 'bg-onyx-950 text-white' : 'bg-powder-50 text-onyx-900'"
  >
    <!-- Icône animée -->
    <div class="mb-8 relative">
      <div class="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center">
        <Wrench class="w-12 h-12 text-orange-500 animate-bounce" />
      </div>
      <span
        class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center"
      >
        <AlertTriangle class="w-3.5 h-3.5 text-white" />
      </span>
    </div>

    <!-- Texte principal -->
    <h1 class="text-3xl font-extrabold mb-3 text-center">Maintenance en cours</h1>
    <p
      class="text-center max-w-md mb-8 leading-relaxed"
      :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
    >
      L'application est temporairement indisponible pour des opérations de maintenance.
      Elle sera de nouveau accessible très prochainement.
    </p>

    <!-- Admin connecté → accès direct à l'admin -->
    <router-link
      v-if="isAdmin"
      to="/admin"
      class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-flame-500 hover:bg-flame-600 text-white text-sm font-medium transition-colors mb-4"
    >
      <Shield class="w-4 h-4" />
      <span>Accéder à l'administration</span>
    </router-link>

    <!-- Utilisateur non-admin connecté → se déconnecter pour changer de compte -->
    <template v-else-if="isAuthenticated">
      <p class="text-sm mb-3" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">
        Vous êtes connecté mais n'avez pas accès pendant la maintenance.
      </p>
      <button
        @click="switchAccount"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors"
        :class="themeStore.darkMode ? 'border-onyx-600 text-onyx-300 hover:bg-onyx-800' : 'border-onyx-200 text-onyx-700 hover:bg-powder-100'"
      >
        <LogOut class="w-4 h-4" />
        <span>Changer de compte</span>
      </button>
    </template>

    <!-- Non connecté → lien de connexion -->
    <router-link
      v-else
      to="/login"
      class="text-sm text-flame-500 hover:underline"
    >
      Connexion administrateur
    </router-link>

    <!-- Nom de l'app -->
    <p
      class="mt-12 text-xs"
      :class="themeStore.darkMode ? 'text-onyx-600' : 'text-onyx-300'"
    >
      {{ appName }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Wrench, AlertTriangle, Shield, LogOut } from 'lucide-vue-next'
import { useThemeStore } from '../stores/themeStore'
import { useAuthStore } from '../stores/authStore'
import { useAdminStore } from '../stores/adminStore'

const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const adminStore = useAdminStore()

const isAdmin = computed(() => authStore.isAdmin)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const appName = computed(() => adminStore.settings?.appName || 'Digital Card Platform')

function switchAccount() {
  authStore.logout()
  router.push('/login')
}
</script>
