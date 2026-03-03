import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken') || null)
  const isLoading = ref(false)
  const error = ref(null)

  // ── Photo de profil — source unique de vérité (NavBar + ProfileView) ──
  const profilePhoto = ref(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)

  function _loadProfilePhoto() {
    if (user.value?.email) {
      profilePhoto.value = localStorage.getItem(`userProfilePhoto_${user.value.email}`) || null
    }
  }

  function setProfilePhoto(dataUrl) {
    profilePhoto.value = dataUrl
    if (user.value?.email) {
      localStorage.setItem(`userProfilePhoto_${user.value.email}`, dataUrl)
    }
  }

  function removeProfilePhoto() {
    profilePhoto.value = null
    if (user.value?.email) {
      localStorage.removeItem(`userProfilePhoto_${user.value.email}`)
    }
  }

  /**
   * Connexion utilisateur
   */
  function login(email, password) {
    isLoading.value = true
    error.value = null

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password || password.length < 6) {
          error.value = 'Email ou mot de passe invalide'
          isLoading.value = false
          reject(new Error(error.value))
          return
        }

        const mockUser = {
          id: 1,
          email: email,
          name: email.split('@')[0],
          createdAt: new Date().toISOString(),
          isPremium: false,
        }
        const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        user.value = mockUser
        token.value = mockToken
        localStorage.setItem('authToken', mockToken)
        localStorage.setItem('user', JSON.stringify(mockUser))
        _loadProfilePhoto()

        isLoading.value = false
        resolve(mockUser)
      }, 500)
    })
  }

  /**
   * Inscription utilisateur
   */
  function register(email, password, confirmPassword, fullName) {
    isLoading.value = true
    error.value = null

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password || !fullName) {
          error.value = 'Tous les champs sont requis'
          isLoading.value = false
          reject(new Error(error.value))
          return
        }

        if (password !== confirmPassword) {
          error.value = 'Les mots de passe ne correspondent pas'
          isLoading.value = false
          reject(new Error(error.value))
          return
        }

        if (password.length < 6) {
          error.value = 'Le mot de passe doit contenir au moins 6 caractères'
          isLoading.value = false
          reject(new Error(error.value))
          return
        }

        const mockUser = {
          id: Date.now(),
          email: email,
          name: fullName,
          createdAt: new Date().toISOString(),
          isPremium: false,
        }
        const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        user.value = mockUser
        token.value = mockToken
        localStorage.setItem('authToken', mockToken)
        localStorage.setItem('user', JSON.stringify(mockUser))
        _loadProfilePhoto()

        isLoading.value = false
        resolve(mockUser)
      }, 500)
    })
  }

  /**
   * Déconnexion utilisateur
   */
  function logout() {
    user.value = null
    token.value = null
    profilePhoto.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  /**
   * Restaurer session depuis localStorage
   */
  function restoreSession() {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
      _loadProfilePhoto()
    }
  }

  /**
   * Upgrader au plan premium
   */
  function upgradeToPremium() {
    isLoading.value = true

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!user.value) {
          error.value = 'Vous devez être connecté'
          isLoading.value = false
          reject(new Error(error.value))
          return
        }

        if (user.value) {
          user.value.isPremium = true
          user.value.premiumUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          localStorage.setItem('user', JSON.stringify(user.value))
        }

        isLoading.value = false
        resolve(user.value)
      }, 1000)
    })
  }

  /**
   * Vérifier si l'utilisateur a un plan actif
   */
  function hasPremium() {
    if (!user.value?.isPremium) return false
    if (user.value.premiumUntil) {
      return new Date() < new Date(user.value.premiumUntil)
    }
    return true
  }

  return {
    user,
    token,
    isLoading,
    error,
    profilePhoto,
    isAuthenticated,
    login,
    register,
    logout,
    restoreSession,
    upgradeToPremium,
    hasPremium,
    setProfilePhoto,
    removeProfilePhoto,
  }
})
