<template>
  <nav
    class="sticky top-0 z-50 border-b transition-colors duration-200 backdrop-blur-md bg-base-100/80 border-base-300 shadow-sm"
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
          <p class="text-xs text-base-content/60">Cartes digitales</p>
        </router-link>

        <!-- Navigation Desktop -->
        <div ref="navContainerRef" class="hidden md:flex items-center space-x-1 relative">
          <!-- Sliding active pill -->
          <div
            class="absolute inset-y-0 rounded-lg bg-primary/10 transition-all duration-300 ease-out pointer-events-none"
            :style="navPillStyle"
          ></div>
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="relative px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            :class="[
              isActive(item.path)
                ? 'text-primary nav-link-active'
                : 'text-base-content/60 hover:text-base-content',
            ]"
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
            class="btn-icon-light"
            :title="themeStore.darkMode ? 'Mode clair' : 'Mode sombre'"
          >
            <Sun v-if="themeStore.darkMode" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>

          <!-- Notification Bell (authenticated) -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <button
              @click.stop="toggleNotifPanel"
              class="btn-icon-light"
              title="Notifications"
            >
              <Bell class="w-5 h-5" />
              <span
                v-if="notifStore.unreadCount > 0"
                class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-flame-500 text-white text-[10px] font-bold leading-none"
              >
                {{ notifStore.unreadCount > 99 ? '99+' : notifStore.unreadCount }}
              </span>
            </button>

            <!-- Notification Panel -->
            <div
              v-if="notifPanelOpen"
              class="absolute right-0 top-14 w-80 rounded-xl shadow-xl border overflow-hidden z-50 bg-base-100 border-base-300 dark:bg-onyx-900"
            >
              <!-- Panel Header -->
              <div
                class="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-200/40"
              >
                <div class="flex items-center space-x-2">
                  <Bell class="w-4 h-4 text-base-content/60" />
                  <span class="font-semibold text-sm text-base-content">
                    Notifications
                  </span>
                  <span
                    v-if="notifStore.unreadCount > 0"
                    class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-flame-500 text-white"
                  >
                    {{ notifStore.unreadCount }}
                  </span>
                </div>
                <div class="flex items-center space-x-1">
                  <button
                    v-if="notifStore.unreadCount > 0"
                    @click="notifStore.markAllAsRead()"
                    class="text-xs px-2 py-1 rounded btn-ghost-primary"
                    title="Tout marquer comme lu"
                  >
                    Tout lire
                  </button>
                  <button
                    v-if="notifStore.inbox.length > 0"
                    @click="notifStore.clearInbox()"
                    class="text-xs px-2 py-1 rounded btn-ghost-neutral"
                    title="Effacer tout"
                  >
                    Effacer
                  </button>
                </div>
              </div>

              <!-- Notification List -->
              <div class="max-h-80 overflow-y-auto">
                <!-- Empty State -->
                <div
                  v-if="notifStore.inbox.length === 0"
                  class="flex flex-col items-center justify-center py-10 px-4 text-center"
                >
                  <Bell class="w-8 h-8 mb-2 opacity-30 text-base-content/50" />
                  <p class="text-sm text-base-content/50">Aucune notification</p>
                </div>

                <!-- Notification Items -->
                <button
                  v-for="notif in notifStore.inbox"
                  :key="notif.id"
                  @click="notifStore.markAsRead(notif.id)"
                  class="w-full flex items-start space-x-3 px-4 py-3 text-left transition-colors border-b last:border-b-0 border-base-300/60 hover:bg-base-200/50"
                  :class="[!notif.read ? 'bg-primary/5' : '']"
                >
                  <!-- Type Icon -->
                  <span class="mt-0.5 flex-shrink-0">
                    <CheckCircle2 v-if="notif.type === 'success'" class="w-4 h-4 text-green-500" />
                    <XCircle v-else-if="notif.type === 'error'" class="w-4 h-4 text-red-500" />
                    <AlertTriangle
                      v-else-if="notif.type === 'warning'"
                      class="w-4 h-4 text-yellow-500"
                    />
                    <Info v-else class="w-4 h-4 text-blue-500" />
                  </span>
                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-sm leading-snug text-base-content/90"
                      :class="[!notif.read ? 'font-medium' : '']"
                    >
                      {{ notif.message }}
                    </p>
                    <p class="text-xs mt-0.5 text-base-content/40">
                      {{ formatNotifTime(notif.timestamp) }}
                    </p>
                  </div>
                  <!-- Unread dot -->
                  <span
                    v-if="!notif.read"
                    class="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-flame-500"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- User Menu (authenticated) -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <!-- Avatar Button -->
            <button
              @click="dropdownOpen = !dropdownOpen; notifPanelOpen = false"
              class="flex items-center rounded-full ring-2 transition-all duration-200 hover:scale-105 active:scale-95"
              :class="dropdownOpen ? 'ring-flame-500' : 'ring-transparent hover:ring-flame-400'"
            >
              <div v-if="authStore.profilePhoto" class="w-10 h-10 rounded-full overflow-hidden">
                <img
                  :src="authStore.profilePhoto"
                  :alt="authStore.user?.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="bg-flame-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm"
              >
                {{ userInitial }}
              </div>
            </button>

            <!-- Dropdown Panel -->
            <div
              v-if="dropdownOpen"
              class="absolute right-0 top-14 w-56 rounded-xl shadow-xl border overflow-hidden z-50 bg-base-100 border-base-300 dark:bg-onyx-900"
            >
              <!-- User Info Header -->
              <div class="px-4 py-3 border-b border-base-300 bg-base-200/40">
                <p class="font-semibold text-sm text-base-content">
                  {{ authStore.user?.name }}
                </p>
                <p class="text-xs mt-0.5 text-base-content/50">
                  {{ authStore.user?.email }}
                </p>
                <span
                  v-if="authStore.hasPremium && authStore.hasPremium()"
                  class="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                >
                  Premium
                </span>
              </div>

              <!-- Menu Items -->
              <div class="py-1">
                <label
                  class="flex items-center space-x-3 px-4 py-2.5 cursor-pointer transition-colors text-sm text-base-content/80 hover:bg-base-200"
                >
                  <UserIcon class="w-4 h-4 opacity-60" />
                  <span>Changer la photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleProfilePhotoUpload"
                    class="hidden"
                  />
                </label>

                <button
                  v-if="authStore.profilePhoto"
                  @click="handleRemoveProfilePhoto"
                  class="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <X class="w-4 h-4" />
                  <span>Supprimer la photo</span>
                </button>

                <div class="my-1 border-t border-base-300"></div>

                <router-link
                  to="/dashboard"
                  @click="dropdownOpen = false"
                  class="flex items-center space-x-3 px-4 py-2.5 transition-colors text-sm text-base-content/80 hover:bg-base-200"
                >
                  <LayoutDashboard class="w-4 h-4 opacity-60" />
                  <span>Tableau de bord</span>
                </router-link>

                <!-- Lien admin — visible uniquement pour les admins -->
                <router-link
                  v-if="authStore.isAdmin"
                  to="/admin"
                  @click="dropdownOpen = false"
                  class="flex items-center space-x-3 px-4 py-2.5 transition-colors text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Shield class="w-4 h-4" />
                  <span>Administration</span>
                </router-link>

                <router-link
                  to="/profile"
                  @click="dropdownOpen = false"
                  class="flex items-center space-x-3 px-4 py-2.5 transition-colors text-sm text-base-content/80 hover:bg-base-200"
                >
                  <UserIcon class="w-4 h-4 opacity-60" />
                  <span>Mon Profil</span>
                </router-link>

                <div class="my-1 border-t border-base-300"></div>

                <button
                  @click="handleLogout"
                  class="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-105 active:scale-95"
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
              class="px-4 py-2 rounded-lg font-medium transition-colors text-sm text-base-content/70 hover:bg-base-200"
            >
              Se connecter
            </router-link>
            <router-link to="/register" class="btn-primary flex items-center space-x-2 text-sm">
              <Plus class="w-4 h-4" />
              <span>S'inscrire</span>
            </router-link>
          </template>

          <!-- Créer une carte (authentifié, hors dashboard et hors éditeur) -->
          <router-link
            v-if="authStore.isAuthenticated && !isOnEditorOrDashboard"
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
          class="md:hidden btn-icon-light"
        >
          <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>

      <!-- Mobile Menu -->
      <div
        v-if="mobileMenuOpen"
        class="md:hidden py-4 space-y-1 border-t animate-fade-in border-base-300"
      >
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          @click="mobileMenuOpen = false"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200"
          :class="
            isActive(item.path)
              ? 'bg-primary/10 text-primary'
              : 'text-base-content/60 hover:bg-base-200'
          "
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </router-link>

        <!-- Theme toggle mobile -->
        <button
          @click="themeStore.toggleDarkMode()"
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium btn-ghost-neutral"
        >
          <Sun v-if="themeStore.darkMode" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
          <span>{{ themeStore.darkMode ? 'Mode clair' : 'Mode sombre' }}</span>
        </button>

        <!-- Mobile Auth Section (authenticated) -->
        <div
          v-if="authStore.isAuthenticated"
          class="space-y-1 pt-3 border-t mt-2 border-base-300"
        >
          <div class="px-4 py-2 rounded-lg bg-base-200">
            <p class="text-sm text-base-content/50">Connecté en tant que</p>
            <p class="font-semibold text-base-content">{{ authStore.user?.name }}</p>
          </div>
          <router-link
            to="/dashboard"
            @click="mobileMenuOpen = false"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-base-content/70 hover:bg-base-200"
          >
            <LayoutDashboard class="w-5 h-5" />
            <span>Tableau de bord</span>
          </router-link>
          <router-link
            to="/profile"
            @click="mobileMenuOpen = false"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-base-content/70 hover:bg-base-200"
          >
            <UserIcon class="w-5 h-5" />
            <span>Mon Profil</span>
          </router-link>
          <!-- Créer une carte mobile -->
          <router-link
            to="/editor"
            @click="mobileMenuOpen = false"
            class="btn-primary w-full flex items-center justify-center space-x-2 mt-1"
          >
            <Plus class="w-5 h-5" />
            <span>Créer une carte</span>
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
              class="block px-4 py-3 rounded-lg font-medium text-center transition-colors text-base-content/70 hover:bg-base-200"
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
      </div>
    </div>
  </nav>

  <ConfirmModal
    v-if="showRemovePhotoConfirm"
    title="Supprimer la photo de profil ?"
    message="Votre photo sera définitivement supprimée."
    confirm-label="Supprimer"
    variant="danger"
    @confirm="onRemovePhotoConfirmed"
    @cancel="showRemovePhotoConfirm = false"
  />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Home,
  Layout,
  Edit,
  User as UserIcon,
  Menu,
  X,
  Plus,
  Sun,
  Moon,
  LayoutDashboard,
  LogOut,
  Bell,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Shield,
} from 'lucide-vue-next'
import { useThemeStore } from '../stores/themeStore'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'
import ConfirmModal from './ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const notifStore = useNotificationStore()
const mobileMenuOpen = ref(false)
const dropdownOpen = ref(false)
const notifPanelOpen = ref(false)
const logoPath = '/logo-ECODEV.png'

const allNavItems = [
  { path: '/', label: 'Accueil', icon: Home, auth: false },
  { path: '/gallery', label: 'Galerie', icon: Layout, auth: false },
  { path: '/editor', label: 'Éditeur', icon: Edit, auth: true },
  { path: '/dashboard', label: 'Tableau de bord', icon: UserIcon, auth: true },
]

const navItems = computed(() =>
  allNavItems.filter((item) => !item.auth || authStore.isAuthenticated),
)

// ── Sliding pill for active nav link ──────────────────────────
const navContainerRef = ref(null)
const navPillStyle = ref({ left: '0px', width: '0px', opacity: 0 })

function updateNavPill() {
  if (!navContainerRef.value) return
  const container = navContainerRef.value
  const active = container.querySelector('.nav-link-active')
  if (!active) {
    navPillStyle.value = { ...navPillStyle.value, opacity: 0 }
    return
  }
  const cRect = container.getBoundingClientRect()
  const aRect = active.getBoundingClientRect()
  navPillStyle.value = {
    left: `${aRect.left - cRect.left}px`,
    width: `${aRect.width}px`,
    opacity: 1,
  }
}

watch(() => route.path, () => nextTick(updateNavPill))
watch(navItems, () => nextTick(updateNavPill))

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  nextTick(updateNavPill)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})

const handleOutsideClick = (e) => {
  if (!e.target.closest('.relative')) {
    dropdownOpen.value = false
    notifPanelOpen.value = false
  }
}

const toggleNotifPanel = () => {
  notifPanelOpen.value = !notifPanelOpen.value
  dropdownOpen.value = false
}

const formatNotifTime = (timestamp) => {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins}min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `il y a ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `il y a ${days}j`
}

const isActive = (path) => route.path === path

// Close all dropdowns on route change
watch(
  () => route.path,
  () => {
    dropdownOpen.value = false
    notifPanelOpen.value = false
    mobileMenuOpen.value = false
  },
)

const isOnEditorOrDashboard = computed(
  () => route.path === '/dashboard' || route.path.startsWith('/editor'),
)

const userInitial = computed(() => {
  return authStore.user?.name?.charAt(0).toUpperCase() || 'U'
})

// Photo de profil synchronisée via authStore (source unique de vérité)
const handleProfilePhotoUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    notifStore.error('Fichier trop volumineux (max 2 Mo)')
    return
  }
  if (!file.type.startsWith('image/')) {
    notifStore.error('Veuillez sélectionner une image valide')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => authStore.setProfilePhoto(e.target?.result)
  reader.readAsDataURL(file)
}

const showRemovePhotoConfirm = ref(false)

const handleRemoveProfilePhoto = () => {
  showRemovePhotoConfirm.value = true
}

const onRemovePhotoConfirmed = () => {
  showRemovePhotoConfirm.value = false
  authStore.removeProfilePhoto()
  notifStore.success('Photo de profil supprimée')
}

const handleLogout = async () => {
  dropdownOpen.value = false
  authStore.logout()
  router.push('/')
}
</script>
