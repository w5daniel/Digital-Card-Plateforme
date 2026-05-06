import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useNotificationStore } from './notificationStore'
import api from '../api/axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

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
      useNotificationStore().loadFromApi()
      return user.value
    } catch (err) {
      const resData = err.response?.data
      if (resData?.emailNotVerified) {
        return { emailNotVerified: true, email: resData.email }
      }
      error.value = resData?.message || 'Identifiants incorrects'
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
      if (data.emailPendingVerification) {
        return { emailPendingVerification: true, email: data.email }
      }
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

  async function resendVerificationEmail(email) {
    try {
      await api.post('/api/email/resend', { email })
      useNotificationStore().success('Email renvoyé ! Vérifiez votre boîte mail.')
    } catch {
      useNotificationStore().error("Impossible d'envoyer l'email. Réessayez dans quelques instants.")
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
      useNotificationStore().loadFromApi()
    } catch {
      user.value = null
      // 403 banned → géré par l'intercepteur axios global (logout + redirect)
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

  // ── Premium ───────────────────────────────────────────────────────────────
  async function upgradeToPremium() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.post('/api/auth/upgrade-premium')
      user.value = _normalize(data.user)
      return user.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à niveau Premium'
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
    resendVerificationEmail,
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
  }
})
