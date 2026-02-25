<template>
  <nav
    class="glass border-b border-white/20 dark:border-slate-700 sticky top-0 z-50 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors duration-200"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20">
        <!-- Logo -->
        <router-link to="/" class="flex flex-col items-center space-y-1 group">
          <img
            :src="logoPath"
            alt="ECODEV Logo"
            class="h-10 w-auto transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400">Cartes digitales</p>
        </router-link>

        <!-- Navigation Desktop -->
        <div class="hidden md:flex items-center space-x-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            :class="
              isActive(item.path)
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            "
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </router-link>
        </div>

        <!-- CTA Button -->
        <div class="hidden md:flex items-center space-x-4">
          <button
            @click="themeStore.toggleDarkMode()"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            :title="themeStore.darkMode ? 'Mode clair' : 'Mode sombre'"
          >
            <Sun v-if="themeStore.darkMode" class="w-5 h-5 text-yellow-500" />
            <Moon v-else class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <!-- User Menu (when authenticated) -->
          <div v-if="authStore.isAuthenticated" class="dropdown dropdown-end">
            <button
              tabindex="0"
              class="btn btn-ghost btn-circle avatar placeholder"
            >
              <div class="bg-primary-500 text-white rounded-full w-10">
                <span class="text-sm font-bold">{{ userInitial }}</span>
              </div>
            </button>
            <ul
              tabindex="0"
              class="dropdown-content z-[1] menu p-2 shadow bg-base-100 dark:bg-slate-800 rounded-box w-52"
            >
              <li class="menu-title">
                <span>{{ authStore.user?.name }}</span>
              </li>
              <li>
                <router-link to="/dashboard">Tableau de bord</router-link>
              </li>
              <li>
                <a href="#">Paramètres</a>
              </li>
              <li>
                <a @click="handleLogout">Déconnexion</a>
              </li>
            </ul>
          </div>

          <!-- Auth Links (when not authenticated) -->
          <template v-else>
            <router-link to="/login" class="btn btn-ghost">Se connecter</router-link>
            <router-link to="/register" class="btn-primary flex items-center space-x-2">
              <Plus class="w-5 h-5" />
              <span>S'inscrire</span>
            </router-link>
          </template>

          <!-- Create Card Button (when authenticated) -->
          <router-link v-if="authStore.isAuthenticated" to="/editor" class="btn-primary flex items-center space-x-2">
            <Plus class="w-5 h-5" />
            <span>Créer une carte</span>
          </router-link>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu v-if="!mobileMenuOpen" class="w-6 h-6 dark:text-white" />
          <X v-else class="w-6 h-6 dark:text-white" />
        </button>
      </div>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden py-4 space-y-2 animate-fade-in">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          @click="mobileMenuOpen = false"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200"
          :class="
            isActive(item.path)
              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
          "
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </router-link>
        <button
          @click="themeStore.toggleDarkMode()"
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <Sun v-if="themeStore.darkMode" class="w-5 h-5 text-yellow-500" />
          <Moon v-else class="w-5 h-5" />
          <span>{{ themeStore.darkMode ? 'Mode clair' : 'Mode sombre' }}</span>
        </button>

        <!-- Mobile Auth Section -->
        <div v-if="authStore.isAuthenticated" class="space-y-2 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div class="px-4 py-2">
            <p class="text-sm text-gray-600 dark:text-gray-400">Utilisateur</p>
            <p class="font-semibold">{{ authStore.user?.name }}</p>
          </div>
          <router-link
            to="/dashboard"
            @click="mobileMenuOpen = false"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <User class="w-5 h-5" />
            <span>Tableau de bord</span>
          </router-link>
          <button
            @click="handleLogout"
            class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <span>Déconnexion</span>
          </button>
        </div>

        <!-- Mobile Auth Links -->
        <template v-else>
          <router-link
            to="/login"
            @click="mobileMenuOpen = false"
            class="btn btn-ghost w-full justify-start"
          >
            Se connecter
          </router-link>
          <router-link
            to="/register"
            @click="mobileMenuOpen = false"
            class="btn-primary w-full flex items-center justify-center space-x-2 mt-2"
          >
            <Plus class="w-5 h-5" />
            <span>S'inscrire</span>
          </router-link>
        </template>

        <router-link
          v-if="authStore.isAuthenticated"
          to="/editor"
          @click="mobileMenuOpen = false"
          class="btn-primary w-full flex items-center justify-center space-x-2 mt-4"
        >
          <Plus class="w-5 h-5" />
          <span>Créer une carte</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, Layout, Edit, User, Menu, X, Plus, Sun, Moon } from 'lucide-vue-next'
import { useThemeStore } from '../stores/themeStore'
import { useAuthStore } from '../stores/authStore'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)
const logoPath = '/logo-ECODEV.png'

const navItems = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/gallery', label: 'Galerie', icon: Layout },
  { path: '/editor', label: 'Éditeur', icon: Edit },
  { path: '/dashboard', label: 'Tableau de bord', icon: User },
]

const isActive = (path) => {
  return route.path === path
}

const userInitial = computed(() => {
  if (authStore.user?.name) {
    return authStore.user.name.charAt(0).toUpperCase()
  }
  return 'U'
})

const handleLogout = async () => {
  authStore.logout()
  router.push('/')
}
</script>
