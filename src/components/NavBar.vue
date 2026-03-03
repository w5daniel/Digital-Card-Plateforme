<template>
  <nav
    class="sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-200"
    :class="themeStore.darkMode
      ? 'bg-slate-900/80 border-slate-700/60'
      : 'bg-white/60 border-gray-200/60 shadow-md'"
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

        <!-- Right Side Actions -->
        <div class="hidden md:flex items-center space-x-3">
          <!-- Theme toggle -->
          <button
            @click="themeStore.toggleDarkMode()"
            class="p-2 rounded-lg transition-colors"
            :class="themeStore.darkMode
              ? 'text-yellow-400 hover:bg-slate-800'
              : 'text-gray-500 hover:bg-gray-100'"
            :title="themeStore.darkMode ? 'Mode clair' : 'Mode sombre'"
          >
            <Sun v-if="themeStore.darkMode" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>

          <!-- User Menu (authenticated) -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <!-- Avatar Button -->
            <button
              @click="dropdownOpen = !dropdownOpen"
              class="flex items-center rounded-full ring-2 transition-all duration-200"
              :class="dropdownOpen
                ? 'ring-primary-500'
                : 'ring-transparent hover:ring-primary-400'"
            >
              <div v-if="authStore.profilePhoto" class="w-10 h-10 rounded-full overflow-hidden">
                <img :src="authStore.profilePhoto" :alt="authStore.user?.name" class="w-full h-full object-cover" />
              </div>
              <div
                v-else
                class="bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm"
              >
                {{ userInitial }}
              </div>
            </button>

            <!-- Dropdown Panel -->
            <div
              v-if="dropdownOpen"
              v-click-outside="() => dropdownOpen = false"
              class="absolute right-0 top-14 w-56 rounded-xl shadow-xl border overflow-hidden z-50"
              :class="themeStore.darkMode
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-gray-200'"
            >
              <!-- User Info Header -->
              <div class="px-4 py-3 border-b" :class="themeStore.darkMode ? 'border-slate-700 bg-slate-900/40' : 'border-gray-100 bg-gray-50'">
                <p class="font-semibold text-sm" :class="themeStore.darkMode ? 'text-white' : 'text-gray-900'">
                  {{ authStore.user?.name }}
                </p>
                <p class="text-xs mt-0.5" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">
                  {{ authStore.user?.email }}
                </p>
                <span v-if="authStore.hasPremium && authStore.hasPremium()" class="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                  Premium
                </span>
              </div>

              <!-- Menu Items -->
              <div class="py-1">
                <label class="flex items-center space-x-3 px-4 py-2.5 cursor-pointer transition-colors text-sm"
                  :class="themeStore.darkMode ? 'text-gray-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-50'">
                  <UserIcon class="w-4 h-4 opacity-60" />
                  <span>Changer la photo</span>
                  <input type="file" accept="image/*" @change="handleProfilePhotoUpload" class="hidden" />
                </label>

                <button
                  v-if="authStore.profilePhoto"
                  @click="handleRemoveProfilePhoto"
                  class="w-full flex items-center space-x-3 px-4 py-2.5 transition-colors text-sm text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  <X class="w-4 h-4" />
                  <span>Supprimer la photo</span>
                </button>

                <div class="my-1 border-t" :class="themeStore.darkMode ? 'border-slate-700' : 'border-gray-100'"></div>

                <router-link
                  to="/dashboard"
                  @click="dropdownOpen = false"
                  class="flex items-center space-x-3 px-4 py-2.5 transition-colors text-sm"
                  :class="themeStore.darkMode ? 'text-gray-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-50'"
                >
                  <LayoutDashboard class="w-4 h-4 opacity-60" />
                  <span>Tableau de bord</span>
                </router-link>

                <router-link
                  to="/profile"
                  @click="dropdownOpen = false"
                  class="flex items-center space-x-3 px-4 py-2.5 transition-colors text-sm"
                  :class="themeStore.darkMode ? 'text-gray-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-50'"
                >
                  <UserIcon class="w-4 h-4 opacity-60" />
                  <span>Mon Profil</span>
                </router-link>

                <div class="my-1 border-t" :class="themeStore.darkMode ? 'border-slate-700' : 'border-gray-100'"></div>

                <button
                  @click="handleLogout"
                  class="w-full flex items-center space-x-3 px-4 py-2.5 transition-colors text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut class="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Auth Links (not authenticated) -->
          <template v-else>
            <router-link
              to="/login"
              class="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              :class="themeStore.darkMode ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'"
            >
              Se connecter
            </router-link>
            <router-link to="/register" class="btn-primary flex items-center space-x-2 text-sm">
              <Plus class="w-4 h-4" />
              <span>S'inscrire</span>
            </router-link>
          </template>

          <!-- Créer une carte — masqué sur /dashboard -->
          <router-link
            v-if="authStore.isAuthenticated && !isOnDashboard"
            to="/editor"
            class="btn-primary flex items-center space-x-2 text-sm"
          >
            <Plus class="w-4 h-4" />
            <span>Créer une carte</span>
          </router-link>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-lg transition-colors"
          :class="themeStore.darkMode ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'"
        >
          <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>

      <!-- Mobile Menu -->
      <div
        v-if="mobileMenuOpen"
        class="md:hidden py-4 space-y-1 border-t animate-fade-in"
        :class="themeStore.darkMode ? 'border-slate-700' : 'border-gray-100'"
      >
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

        <!-- Theme toggle mobile -->
        <button
          @click="themeStore.toggleDarkMode()"
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200"
          :class="themeStore.darkMode ? 'text-yellow-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'"
        >
          <Sun v-if="themeStore.darkMode" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
          <span>{{ themeStore.darkMode ? 'Mode clair' : 'Mode sombre' }}</span>
        </button>

        <!-- Mobile Auth Section (authenticated) -->
        <div
          v-if="authStore.isAuthenticated"
          class="space-y-1 pt-3 border-t mt-2"
          :class="themeStore.darkMode ? 'border-slate-700' : 'border-gray-200'"
        >
          <div class="px-4 py-2 rounded-lg" :class="themeStore.darkMode ? 'bg-slate-800' : 'bg-gray-50'">
            <p class="text-sm" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">Connecté en tant que</p>
            <p class="font-semibold" :class="themeStore.darkMode ? 'text-white' : 'text-gray-900'">{{ authStore.user?.name }}</p>
          </div>
          <router-link
            to="/dashboard"
            @click="mobileMenuOpen = false"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200"
            :class="themeStore.darkMode ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'"
          >
            <LayoutDashboard class="w-5 h-5" />
            <span>Tableau de bord</span>
          </router-link>
          <router-link
            to="/profile"
            @click="mobileMenuOpen = false"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200"
            :class="themeStore.darkMode ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'"
          >
            <UserIcon class="w-5 h-5" />
            <span>Mon Profil</span>
          </router-link>
          <button
            @click="handleLogout"
            class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut class="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>

        <!-- Mobile Auth Links (not authenticated) -->
        <template v-else>
          <div class="pt-2 space-y-2">
            <router-link
              to="/login"
              @click="mobileMenuOpen = false"
              class="block px-4 py-3 rounded-lg font-medium text-center transition-colors"
              :class="themeStore.darkMode ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'"
            >
              Se connecter
            </router-link>
            <router-link
              to="/register"
              @click="mobileMenuOpen = false"
              class="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Plus class="w-5 h-5" />
              <span>S'inscrire</span>
            </router-link>
          </div>
        </template>

        <!-- Mobile Créer une carte — masqué sur /dashboard -->
        <router-link
          v-if="authStore.isAuthenticated && !isOnDashboard"
          to="/editor"
          @click="mobileMenuOpen = false"
          class="btn-primary w-full flex items-center justify-center space-x-2 mt-3"
        >
          <Plus class="w-5 h-5" />
          <span>Créer une carte</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, Layout, Edit, User as UserIcon, Menu, X, Plus, Sun, Moon, LayoutDashboard, LogOut } from 'lucide-vue-next'
import { useThemeStore } from '../stores/themeStore'
import { useAuthStore } from '../stores/authStore'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)
const dropdownOpen = ref(false)
const logoPath = '/logo-ECODEV.png'

const navItems = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/gallery', label: 'Galerie', icon: Layout },
  { path: '/editor', label: 'Éditeur', icon: Edit },
  { path: '/dashboard', label: 'Tableau de bord', icon: UserIcon },
]

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})

const handleOutsideClick = (e) => {
  if (!e.target.closest('.relative')) dropdownOpen.value = false
}

const isActive = (path) => route.path === path

const isOnDashboard = computed(() => route.path === '/dashboard')

const userInitial = computed(() => {
  return authStore.user?.name?.charAt(0).toUpperCase() || 'U'
})

// Photo de profil synchronisée via authStore (source unique de vérité)
const handleProfilePhotoUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) { alert('Fichier trop volumineux (max 2MB)'); return }
  if (!file.type.startsWith('image/')) { alert('Veuillez sélectionner une image'); return }
  const reader = new FileReader()
  reader.onload = (e) => authStore.setProfilePhoto(e.target?.result)
  reader.readAsDataURL(file)
}

const handleRemoveProfilePhoto = () => {
  if (confirm('Supprimer votre photo de profil ?')) {
    authStore.removeProfilePhoto()
  }
}

const handleLogout = async () => {
  dropdownOpen.value = false
  authStore.logout()
  router.push('/')
}
</script>
