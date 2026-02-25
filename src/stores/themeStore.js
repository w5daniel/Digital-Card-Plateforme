import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // État
  const darkMode = ref(false)

  // Initialiser depuis localStorage
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      darkMode.value = savedTheme === 'dark'
    } else {
      // Utiliser la préférence système par défaut
      darkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  // Appliquer le thème au DOM
  const applyTheme = () => {
    if (darkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Toggle du mode sombre
  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
  }

  // Watcher pour sauvegarder dans localStorage et appliquer les changements
  watch(darkMode, (newValue) => {
    localStorage.setItem('theme', newValue ? 'dark' : 'light')
    applyTheme()
  })

  return {
    darkMode,
    initTheme,
    toggleDarkMode,
    applyTheme,
  }
})
