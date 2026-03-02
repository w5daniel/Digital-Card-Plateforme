<template>
  <nav
    class="glass border-b-4 sticky top-0 z-50 bg-slate-50/95 dark:bg-slate-900/95 dark:border-slate-700 backdrop-blur-md transition-colors duration-200"
    :class="!themeStore.darkMode ? 'border-b-primary-500/80' : ''"
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
              class="btn btn-ghost btn-circle avatar placeholder hover:ring-2 hover:ring-primary-400 transition-all"
            >
              <!-- User Profile Photo or Initial -->
              <div v-if="userProfilePhoto" class="w-10 h-10 rounded-full overflow-hidden">
                <img
                  :src="userProfilePhoto"
                  :alt="authStore.user?.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold"
              >
                {{ userInitial }}
              </div>
            </button>
            <ul
              tabindex="0"
              class="dropdown-content z-[1] menu p-2 shadow bg-white dark:bg-slate-800 rounded-box w-56 space-y-1"
            >
              <li class="menu-title">
                <div class="flex items-center space-x-2">
                  <span>{{ authStore.user?.name }}</span>
                  <span v-if="authStore.hasPremium()" class="badge badge-primary text-xs"
                    >Premium</span
                  >
                </div>
              </li>
              <li>
                <label class="cursor-pointer">
                  <span>Changer la photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleProfilePhotoUpload"
                    class="hidden"
                  />
                </label>
              </li>
              <li v-if="userProfilePhoto">
                <a @click="handleRemoveProfilePhoto" class="text-orange-500">Supprimer la photo</a>
              </li>
              <li>
                <router-link to="/dashboard">Tableau de bord</router-link>
              </li>
              <li>
                <router-link to="/profile">Mon Profil</router-link>
              </li>
              <li>
                <a href="#">Paramètres</a>
              </li>
              <li>
                <a @click="handleLogout" class="text-red-500">Déconnexion</a>
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
          <router-link
            v-if="authStore.isAuthenticated"
            to="/editor"
            class="btn-primary flex items-center space-x-2"
          >
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
        <div
          v-if="authStore.isAuthenticated"
          class="space-y-2 pt-4 border-t border-gray-200 dark:border-slate-700"
        >
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
          <router-link
            to="/profile"
            @click="mobileMenuOpen = false"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <User class="w-5 h-5" />
            <span>Mon Profil</span>
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
import { ref, computed, onMounted } from 'vue'
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
const userProfilePhoto = ref(null)

const navItems = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/gallery', label: 'Galerie', icon: Layout },
  { path: '/editor', label: 'Éditeur', icon: Edit },
  { path: '/dashboard', label: 'Tableau de bord', icon: User },
]

onMounted(() => {
  // Load user profile photo from localStorage
  const savedPhoto = localStorage.getItem(`userProfilePhoto_${authStore.user?.email}`)
  if (savedPhoto) {
    userProfilePhoto.value = savedPhoto
  }
})

const isActive = (path) => {
  return route.path === path
}

const userInitial = computed(() => {
  if (authStore.user?.name) {
    return authStore.user.name.charAt(0).toUpperCase()
  }
  return 'U'
})

const handleProfilePhotoUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('❌ Fichier trop volumineux (max 2MB)')
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('❌ Veuillez sélectionner une image')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const photoDataUrl = e.target?.result
    userProfilePhoto.value = photoDataUrl
    // Persist to localStorage
    localStorage.setItem(`userProfilePhoto_${authStore.user?.email}`, photoDataUrl)
  }
  reader.readAsDataURL(file)
}

const handleRemoveProfilePhoto = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
    userProfilePhoto.value = null
    localStorage.removeItem(`userProfilePhoto_${authStore.user?.email}`)
  }
}

const handleLogout = async () => {
  authStore.logout()
  router.push('/')
}
</script>
