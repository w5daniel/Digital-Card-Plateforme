<template>
  <div
    class="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 py-12"
  >
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Profile Header -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-8 mb-8">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-8">
          <!-- Profile Photo -->
          <div class="relative">
            <img
              v-if="userProfilePhoto"
              :src="userProfilePhoto"
              :alt="authStore.user?.name"
              class="w-32 h-32 rounded-2xl object-cover border-4 border-primary-200 dark:border-primary-800 shadow-lg"
            />
            <div
              v-else
              class="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-primary-200 dark:border-primary-800 shadow-lg"
            >
              {{ userInitial }}
            </div>
            <label
              class="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 shadow-lg cursor-pointer transition-all hover:scale-110"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
              </svg>
              <input
                type="file"
                accept="image/*"
                @change="handleProfilePhotoUpload"
                class="hidden"
              />
            </label>
          </div>

          <!-- Profile Info -->
          <div class="flex-1">
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {{ authStore.user?.name || 'Utilisateur' }}
            </h1>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-4">
              {{ authStore.user?.email }}
            </p>
            <div
              v-if="authStore.hasPremium()"
              class="inline-block px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-full text-sm"
            >
              🌟 Compte Premium
            </div>
            <div
              v-else
              class="inline-block px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-full text-sm"
            >
              Compte Gratuit
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 text-center">
          <div class="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            {{ stats.totalCards }}
          </div>
          <p class="text-gray-600 dark:text-gray-400 text-sm">Cartes créées</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 text-center">
          <div class="text-3xl font-bold text-secondary-600 dark:text-secondary-400 mb-2">
            {{ stats.totalViews }}
          </div>
          <p class="text-gray-600 dark:text-gray-400 text-sm">Vues totales</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 text-center">
          <div class="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">
            {{ stats.totalQRScans }}
          </div>
          <p class="text-gray-600 dark:text-gray-400 text-sm">Scans QR</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 text-center">
          <div class="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-2">
            {{ stats.totalShares }}
          </div>
          <p class="text-gray-600 dark:text-gray-400 text-sm">Partages</p>
        </div>
      </div>

      <!-- Settings Section -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Paramètres du compte</h2>

        <div class="space-y-6">
          <!-- Theme Toggle -->
          <div
            class="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700"
          >
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Thème</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Choisir entre le mode clair et sombre
              </p>
            </div>
            <button
              @click="toggleTheme"
              class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors"
              :class="isDarkMode ? 'bg-primary-600' : 'bg-gray-300'"
            >
              <span
                class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"
                :class="isDarkMode ? 'translate-x-7' : 'translate-x-1'"
              />
            </button>
          </div>

          <!-- Download Data -->
          <div
            class="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700"
          >
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Télécharger vos données
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Exportez toutes vos cartes en JSON
              </p>
            </div>
            <button
              @click="downloadUserData"
              class="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
            >
              Télécharger
            </button>
          </div>

          <!-- Logout -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Déconnexion</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Quitter votre compte</p>
            </div>
            <button
              @click="handleLogout"
              class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCardsStore } from '@/stores/cards'
import { useThemeStore } from '@/stores/themeStore'

const router = useRouter()
const authStore = useAuthStore()
const cardsStore = useCardsStore()
const themeStore = useThemeStore()

const userProfilePhoto = ref(null)
const isDarkMode = ref(false)

const stats = computed(() => cardsStore.getGlobalStats())

const userInitial = computed(() => {
  return authStore.user?.name?.[0]?.toUpperCase() || 'U'
})

onMounted(() => {
  // Load profile photo from localStorage
  if (authStore.user?.email) {
    const saved = localStorage.getItem(`userProfilePhoto_${authStore.user.email}`)
    if (saved) {
      userProfilePhoto.value = saved
    }
  }
  isDarkMode.value = themeStore.isDark
})

const handleProfilePhotoUpload = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      userProfilePhoto.value = e.target?.result
      if (authStore.user?.email) {
        localStorage.setItem(`userProfilePhoto_${authStore.user.email}`, userProfilePhoto.value)
      }
    }
    reader.readAsDataURL(file)
  }
}

const toggleTheme = () => {
  themeStore.toggleTheme()
  isDarkMode.value = themeStore.isDark
}

const downloadUserData = () => {
  const data = cardsStore.exportCardsAsJSON()
  const blob = new Blob([data], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `profil-${authStore.user?.name || 'utilisateur'}-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  window.URL.revokeObjectURL(url)
}

const handleLogout = () => {
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    authStore.logout()
    router.push('/')
  }
}
</script>
