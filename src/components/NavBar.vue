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
          <router-link to="/editor" class="btn-primary flex items-center space-x-2">
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
        <router-link
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
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Home, Layout, Edit, User, Menu, X, Plus, Sun, Moon } from 'lucide-vue-next'
import { useThemeStore } from '../stores/themeStore'

const route = useRoute()
const themeStore = useThemeStore()
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
</script>
