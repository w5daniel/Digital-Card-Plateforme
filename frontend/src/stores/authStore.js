import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useNotificationStore } from './notificationStore'
import api from '../api/axios'

// ── Admin registry — localStorage, migré en Phase 4.5 via GET /api/admin/users ──
const ALL_USERS_LS_KEY = 'digitalcard_allUsers'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Admin registry — reste en localStorage jusqu'à Phase 4.5
  const allUsers = ref([])
  ;(function _loadRegistry() {
    try {
      const raw = localStorage.getItem(ALL_USERS_LS_KEY)
      allUsers.value = raw ? JSON.parse(raw) : []
    } catch {
      allUsers.value = []
    }
  })()

  function _saveRegistry() {
    try {
      localStorage.setItem(ALL_USERS_LS_KEY, JSON.stringify(allUsers.value))
    } catch { /* quota localStorage */ }
  }

  // avatar_url est maintenant une URL complète retournée par le backend (Storage::url)
  const profilePhoto = computed(() => user.value?.avatar_url ?? null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isPremium = computed(() => {
    if (!user.value?.is_premium) return false
    if (user.value.premium_expires_at) return new Date() < new Date(user.value.premium_expires_at)
    return true
  })

  // Normalise les champs snake_case du backend vers camelCase pour la rétro-compatibilité
  // avec les composants qui utilisent user.isPremium, user.premiumUntil, user.createdAt
  function _normalize(apiUser) {
    return {
      ...apiUser,
      isPremium: apiUser.is_premium,
      premiumUntil: apiUser.premium_expires_at,
      createdAt: apiUser.created_at,
      isBanned: apiUser.is_banned,
    }
  }

  async function login(email, password, rememberMe = false) {
    isLoading.value = true
    error.value = null
    try {
      await api.get('/sanctum/csrf-cookie')
      const { data } = await api.post('/api/auth/login', { email, password, remember: rememberMe })
      user.value = _normalize(data.user)
      return user.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Identifiants incorrects'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(email, password, confirmPassword, fullName) {
    isLoading.value = true
    error.value = null
    try {
      await api.get('/sanctum/csrf-cookie')
      const { data } = await api.post('/api/auth/register', {
        name: fullName,
        email,
        password,
        password_confirmation: confirmPassword,
      })
      user.value = _normalize(data.user)
      return user.value
    } catch (err) {
      const errors = err.response?.data?.errors
      const firstError = errors ? Object.values(errors)[0]?.[0] : null
      error.value = firstError || err.response?.data?.message || "Erreur d'inscription"
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await api.post('/api/auth/logout')
    } catch { /* session déjà expirée — continuer quand même */ }
    user.value = null
    const notificationStore = useNotificationStore()
    notificationStore.clearAllToasts()
    notificationStore.clearInbox()
  }

  async function restoreSession() {
    try {
      const { data } = await api.get('/api/auth/me')
      user.value = _normalize(data.user)
    } catch {
      user.value = null
    }
  }

  async function setProfilePhoto(file) {
    const fd = new FormData()
    fd.append('avatar', file)
    const { data } = await api.post('/api/auth/avatar', fd)
    user.value = _normalize(data.user)
  }

  async function removeProfilePhoto() {
    const { data } = await api.delete('/api/auth/avatar')
    user.value = _normalize(data.user)
  }

  // Mise à jour du profil (nom, email, titre, bio)
  async function updateProfile(form) {
    const { data } = await api.put('/api/auth/profile', form)
    user.value = _normalize(data.user)
    return user.value
  }

  // Changement de mot de passe
  async function changePassword(currentPassword, newPassword, confirmation) {
    await api.put('/api/auth/password', {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmation,
    })
  }

  // Mot de passe oublié — envoie l'email de reset
  async function forgotPassword(email) {
    await api.post('/api/auth/forgot-password', { email })
  }

  // Réinitialisation du mot de passe via token reçu par email
  async function resetPassword(token, email, password, passwordConfirmation) {
    await api.post('/api/auth/reset-password', {
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
    })
  }

  // ── Premium — mock localStorage jusqu'au système de paiement (Phase 4.5+) ──
  async function upgradeToPremium() {
    isLoading.value = true
    try {
      await new Promise((r) => setTimeout(r, 1000))
      if (!user.value) throw new Error('Vous devez être connecté')

      const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      user.value.is_premium = true
      user.value.premium_expires_at = expiry
      user.value.isPremium = true
      user.value.premiumUntil = expiry

      if (!Array.isArray(user.value.subscriptionHistory)) user.value.subscriptionHistory = []
      user.value.subscriptionHistory.push({
        reference: 'SUB-' + Date.now(),
        date: new Date().toISOString(),
        amount: 4990,
        tax: 18,
        total: 5888,
        plan: 'Premium',
      })
      return user.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function hasPremium() {
    if (!user.value?.is_premium) return false
    if (user.value.premium_expires_at) return new Date() < new Date(user.value.premium_expires_at)
    return true
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FONCTIONS ADMIN — localStorage jusqu'à Phase 4.5 (GET /api/admin/users)
  // Les utilisateurs inscrits via l'API n'apparaissent pas ici avant Phase 4.5.
  // ═══════════════════════════════════════════════════════════════════════════

  const getAllUsersWithStats = computed(() => {
    return allUsers.value.map((u) => {
      let cardCount = 0
      try {
        const raw = localStorage.getItem(`digitalcard_userCards_${u.email}`)
        cardCount = raw ? JSON.parse(raw).length : 0
      } catch { /* ignore */ }
      return { ...u, cardCount }
    })
  })

  function adminBanUser(id) {
    if (!isAdmin.value) return
    const u = allUsers.value.find((u) => u.id === id)
    if (!u || u.role === 'admin') return
    u.status = 'blocked'
    _saveRegistry()
  }

  function adminUnbanUser(id) {
    if (!isAdmin.value) return
    const u = allUsers.value.find((u) => u.id === id)
    if (!u) return
    u.status = 'active'
    _saveRegistry()
  }

  function adminTogglePremium(id) {
    if (!isAdmin.value) return
    const u = allUsers.value.find((u) => u.id === id)
    if (!u) return
    u.isPremium = !u.isPremium
    u.premiumUntil = u.isPremium
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : null
    _saveRegistry()
  }

  function adminDeleteUser(id) {
    if (!isAdmin.value) return
    const u = allUsers.value.find((u) => u.id === id)
    if (!u || u.role === 'admin') return
    allUsers.value = allUsers.value.filter((u) => u.id !== id)
    _saveRegistry()
    try {
      const cardsRaw = localStorage.getItem(`digitalcard_userCards_${u.email}`)
      if (cardsRaw) {
        const cards = JSON.parse(cardsRaw)
        for (const card of cards) localStorage.removeItem(`digitalcard_public_${card.id}`)
      }
      localStorage.removeItem(`digitalcard_userCards_${u.email}`)
      localStorage.removeItem(`userProfilePhoto_${u.email}`)
    } catch { /* ignore */ }
  }

  return {
    user,
    isLoading,
    error,
    profilePhoto,
    isAuthenticated,
    isAdmin,
    isPremium,
    login,
    register,
    logout,
    restoreSession,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    upgradeToPremium,
    hasPremium,
    setProfilePhoto,
    removeProfilePhoto,
    // Admin — gestion des utilisateurs
    getAllUsersWithStats,
    adminBanUser,
    adminUnbanUser,
    adminTogglePremium,
    adminDeleteUser,
  }
})
