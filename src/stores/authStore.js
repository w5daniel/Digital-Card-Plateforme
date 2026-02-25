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
        // Simulation d'une vérification
        if (email && password && password.length >= 6) {
          const mockUser = {
            id: 1,
            email: email,
            name: email.split('@')[0],
            createdAt: new Date().toISOString(),
          }
          const mockToken = `token_${Date.now()}`

          user.value = mockUser
          token.value = mockToken
          localStorage.setItem('authToken', mockToken)
          localStorage.setItem('user', JSON.stringify(mockUser))

          isLoading.value = false
          resolve(mockUser)
        } else {
          error.value = 'Email ou mot de passe invalide'
          isLoading.value = false
          reject(new Error(error.value))
        }
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

        // Simulated registration success
        const mockUser = {
          id: Date.now(),
          email: email,
          name: fullName,
          createdAt: new Date().toISOString(),
        }
        const mockToken = `token_${Date.now()}`

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
  }
})
