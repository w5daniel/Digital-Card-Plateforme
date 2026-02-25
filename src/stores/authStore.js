import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken') || null)
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)

  /**
   * Connexion utilisateur
   */
  function login(email, password) {
    isLoading.value = true
    error.value = null

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validation
        if (!email || !password || password.length < 6) {
          error.value = 'Email ou mot de passe invalide'
          isLoading.value = false
          reject(new Error(error.value))
          return
        }

        // Simulation d'appel API: POST /api/auth/login
        // En production: fetch('https://api.example.com/auth/login', {...})

        const mockUser = {
          id: 1,
          email: email,
          name: email.split('@')[0],
          createdAt: new Date().toISOString(),
          isPremium: false, // Backend détermine le statut premium
        }
        const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        user.value = mockUser
        token.value = mockToken
        localStorage.setItem('authToken', mockToken)
        localStorage.setItem('user', JSON.stringify(mockUser))

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
        // Validation
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

        // Vérification email unique (en production, côté backend)
        // if (email existe déjà) { error.value = 'Email déjà utilisé' }

        // Simulation d'appel API: POST /api/auth/register
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

        // Simulation d'appel API: POST /api/premium/upgrade avec paiement Stripe
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
    // State
    user,
    token,
    isLoading,
    error,

    // Getters
    isAuthenticated,

    // Methods
    login,
    register,
    logout,
    restoreSession,
    upgradeToPremium,
    hasPremium,
  }
})
