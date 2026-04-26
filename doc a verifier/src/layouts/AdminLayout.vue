<template>
  <div
    class="flex h-screen overflow-hidden"
    class="bg-base-100 text-base-content"
  >
    <!-- Overlay mobile -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-20 bg-black/50 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- ── Sidebar ──────────────────────────────────────────────────────── -->
    <aside
      class="fixed inset-y-0 left-0 z-30 flex flex-col w-64 transition-transform duration-300 border-r"
      :class="[
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'bg-base-100 border-base-300',
      ]"
    >
      <!-- Logo + badge admin -->
      <div
        class="flex items-center justify-between px-3 py-3 border-b border-base-300"
      >
        <div class="flex items-center space-x-2 min-w-0">
          <img src="/logo-ECODEV.png" alt="ECODEV" class="h-7 w-auto flex-shrink-0" />
          <div class="min-w-0">
            <p
              class="text-xs font-medium leading-tight truncate text-base-content/40"
            >
              Administration
            </p>
            <span
              class="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20"
            >
              <Shield class="w-2.5 h-2.5 flex-shrink-0" />
              <span>ADMIN</span>
            </span>
          </div>
        </div>
        <button class="lg:hidden p-1 rounded flex-shrink-0" @click="sidebarOpen = false">
          <X class="w-4 h-4 text-base-content/40" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          @click="sidebarOpen = false"
          class="flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150"
          :class="
            isActive(item.to)
              ? 'bg-flame-500/10 text-flame-600 dark:text-flame-400 border border-flame-500/20'
              : 'text-base-content/50 hover:bg-base-200 hover:text-base-content'
          "
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span>{{ item.label }}</span>
          <!-- Badge pour les éléments avec compteur -->
          <span
            v-if="item.badge && item.badge > 0"
            class="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white"
          >
            {{ item.badge }}
          </span>
        </router-link>

        <!-- Séparateur -->
        <div
          class="pt-3 mt-3 border-t border-base-300"
        >
          <p
            class="px-3 text-[10px] font-semibold uppercase tracking-wider mb-2 text-base-content/40"
          >
            Navigation
          </p>
          <router-link
            to="/"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
            :class="
              'text-base-content/50 hover:bg-base-200 hover:text-base-content'
            "
          >
            <ExternalLink class="w-4 h-4" />
            <span>Retour au site</span>
          </router-link>
          <router-link
            to="/dashboard"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
            :class="
              'text-base-content/50 hover:bg-base-200 hover:text-base-content'
            "
          >
            <LayoutDashboard class="w-4 h-4" />
            <span>Mon Dashboard</span>
          </router-link>
        </div>
      </nav>

      <!-- Pied de sidebar : user info + déco/dark -->
      <div
        class="px-3 py-3 border-t border-base-300 space-y-1"
      >
        <!-- Theme toggle -->
        <button
          @click="themeStore.toggleDarkMode()"
          class="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors"
          :class="
            themeStore.darkMode
              ? 'text-yellow-400 hover:bg-base-200'
              : 'text-base-content/40 hover:bg-base-200'
          "
        >
          <Sun v-if="themeStore.darkMode" class="w-4 h-4" />
          <Moon v-else class="w-4 h-4" />
          <span>{{ themeStore.darkMode ? 'Mode clair' : 'Mode sombre' }}</span>
        </button>
        <!-- User + logout -->
        <div
          class="flex items-center justify-between px-3 py-2 rounded-lg bg-base-200"
        >
          <div class="flex items-center space-x-2 min-w-0">
            <div
              class="w-7 h-7 rounded-full bg-gradient-to-br from-flame-500 to-onyx-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            >
              {{ adminInitial }}
            </div>
            <div class="min-w-0">
              <p
                class="text-xs font-medium truncate text-base-content"
              >
                {{ authStore.user?.name }}
              </p>
              <p
                class="text-[10px] truncate text-base-content/40"
              >
                {{ authStore.user?.email }}
              </p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="p-1.5 rounded transition-colors flex-shrink-0"
            :class="
              'text-base-content/40 hover:text-red-500 hover:bg-red-50'
            "
            title="Déconnexion"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>

    <!-- ── Contenu principal ────────────────────────────────────────────── -->
    <div class="flex flex-col flex-1 min-w-0 lg:ml-64">
      <!-- Header top bar -->
      <header
        class="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 h-14 border-b backdrop-blur-md flex-shrink-0"
        :class="
          'bg-base-100/80 border-base-300'
        "
      >
        <!-- Gauche : hamburger mobile + fil d'ariane -->
        <div class="flex items-center space-x-3">
          <button
            class="lg:hidden p-2 rounded-lg transition-colors"
            :class="
              'text-base-content/80 hover:bg-base-200'
            "
            @click="sidebarOpen = true"
          >
            <Menu class="w-5 h-5" />
          </button>
          <div>
            <p
              class="font-semibold text-sm text-base-content"
            >
              {{ currentPageTitle }}
            </p>
            <p class="text-[11px] text-base-content/40">
              Administration ECODEV
            </p>
          </div>
        </div>

        <!-- Droite : badge + status -->
        <div class="flex items-center space-x-3">
          <span
            v-if="blockedUsersCount > 0"
            class="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20"
          >
            <AlertTriangle class="w-3.5 h-3.5" />
            <span>{{ blockedUsersCount }} compte(s) bloqué(s)</span>
          </span>
          <span
            v-if="!maintenanceMode"
            class="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            :class="
              'bg-green-500/10 text-green-500 border border-green-500/20'
            "
          >
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Système actif</span>
          </span>
          <span
            v-else
            class="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20"
          >
            <AlertTriangle class="w-3.5 h-3.5" />
            <span>Maintenance</span>
          </span>
        </div>
      </header>

      <!-- Router view -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  Users,
  Layers,
  CreditCard,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ExternalLink,
  AlertTriangle,
  Globe,
} from 'lucide-vue-next'
import { useThemeStore } from '../stores/themeStore'
import { useAuthStore } from '../stores/authStore'
import { useAdminStore } from '../stores/adminStore'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const adminStore = useAdminStore()
const sidebarOpen = ref(false)

const maintenanceMode = computed(() => adminStore.settings?.maintenanceMode ?? false)

// Nombre de comptes bloqués (données réelles depuis authStore)
// TODO backend : vient du champ `blockedUsers` de GET /api/admin/overview
const blockedUsersCount = computed(
  () => authStore.getAllUsersWithStats.filter((u) => u.status === 'blocked').length,
)

const navItems = computed(() => [
  { to: '/admin', label: "Vue d'ensemble", icon: LayoutDashboard, badge: 0 },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users, badge: blockedUsersCount.value },
  { to: '/admin/templates', label: 'Modèles', icon: Layers, badge: 0 },
  { to: '/admin/cards', label: 'Cartes', icon: CreditCard, badge: 0 },
  { to: '/admin/gallery', label: 'Galerie communauté', icon: Globe, badge: 0 },
  { to: '/admin/settings', label: 'Paramètres', icon: Settings, badge: 0 },
])

const PAGE_TITLES = {
  'admin-dashboard': "Vue d'ensemble",
  'admin-users': 'Gestion des utilisateurs',
  'admin-templates': 'Gestion des modèles',
  'admin-cards': 'Gestion des cartes',
  'admin-gallery': 'Galerie communauté',
  'admin-settings': 'Paramètres système',
}

const currentPageTitle = computed(() => PAGE_TITLES[route.name] ?? 'Administration')

const adminInitial = computed(() => authStore.user?.name?.charAt(0).toUpperCase() || 'A')

const isActive = (path) => {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>
