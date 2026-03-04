import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ADMIN_EMAIL } from '../data/mockData'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken') || null)
  const isLoading = ref(false)
  const error = ref(null)

  // ── Photo de profil — source unique de vérité (NavBar + ProfileView) ──
  const profilePhoto = ref(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

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
   * Mock : admin@ecodev.dev → role 'admin', tout autre email → role 'user'
   */
  async function login(email, password) {
    isLoading.value = true
    error.value = null

    try {
      // TODO: remplacer par `const res = await api.post('/auth/login', { email, password })`
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (!email || !password || password.length < 6) {
        throw new Error('Email ou mot de passe invalide')
      }

      const role = email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user'

      const mockUser = {
        id: role === 'admin' ? 0 : Date.now(),
        email: email,
        name: role === 'admin' ? 'Administrateur' : email.split('@')[0],
        role,
        createdAt: new Date().toISOString(),
        isPremium: role === 'admin',
      }
      const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      user.value = mockUser
      token.value = mockToken
      localStorage.setItem('authToken', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      _loadProfilePhoto()

      return mockUser
    } catch (err) {
      error.value = err.message || 'Erreur de connexion'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Inscription utilisateur — rôle 'user' toujours (jamais admin par inscription)
   */
  async function register(email, password, confirmPassword, fullName) {
    isLoading.value = true
    error.value = null

    try {
      // TODO: remplacer par `const res = await api.post('/auth/register', { email, password, fullName })`
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (!email || !password || !fullName) {
        throw new Error('Tous les champs sont requis')
      }

      if (password !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas')
      }

      if (password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères')
      }

      const mockUser = {
        id: Date.now(),
        email: email,
        name: fullName,
        role: 'user',
        createdAt: new Date().toISOString(),
        isPremium: false,
      }
      const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      user.value = mockUser
      token.value = mockToken
      localStorage.setItem('authToken', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      _loadProfilePhoto()

      return mockUser
    } catch (err) {
      error.value = err.message || "Erreur d'inscription"
      throw err
    } finally {
      isLoading.value = false
    }
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
      // Rétrocompatibilité : sessions créées avant l'ajout du champ role
      if (!user.value.role) user.value.role = 'user'
      _loadProfilePhoto()
    }
  }

  /**
   * Upgrader au plan premium
   */
  async function upgradeToPremium() {
    isLoading.value = true

    try {
      // TODO: remplacer par `const res = await api.post('/billing/upgrade')`
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (!user.value) {
        throw new Error('Vous devez être connecté')
      }

      user.value.isPremium = true
      user.value.premiumUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      localStorage.setItem('user', JSON.stringify(user.value))

      return user.value
    } catch (err) {
      error.value = err.message || 'Erreur lors de la mise à niveau'
      throw err
    } finally {
      isLoading.value = false
    }
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
    isAdmin,
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
