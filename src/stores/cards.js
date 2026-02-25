import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCardsStore = defineStore('cards', () => {
  // Templates prédéfinis
  const templates = ref([
    {
      id: 1,
      name: 'Modern',
      slug: 'modern',
      category: 'Professionnel',
      isPremium: false,
      thumbnail: 'https://via.placeholder.com/400x300?text=Modern+Template',
      colors: {
        primary: '#e63950',
        secondary: '#0ba5e9',
        text: '#ffffff',
      },
    },
    {
      id: 2,
      name: 'Minimal',
      slug: 'minimal',
      category: 'Minimaliste',
      isPremium: false,
      thumbnail: 'https://via.placeholder.com/400x300?text=Minimal+Template',
      colors: {
        primary: '#1f2937',
        secondary: '#9ca3af',
        text: '#ffffff',
      },
    },
    {
      id: 3,
      name: 'Creative',
      slug: 'creative',
      category: 'Créatif',
      isPremium: true,
      thumbnail: 'https://via.placeholder.com/400x300?text=Creative+Template',
      colors: {
        primary: '#7c3aed',
        secondary: '#ec4899',
        text: '#ffffff',
      },
    },
    {
      id: 4,
      name: 'Professional',
      slug: 'professional',
      category: 'Professionnel',
      isPremium: false,
      thumbnail: 'https://via.placeholder.com/400x300?text=Professional+Template',
      colors: {
        primary: '#0369a1',
        secondary: '#0ba5e9',
        text: '#ffffff',
      },
    },
    {
      id: 5,
      name: 'Elegant',
      slug: 'elegant',
      category: 'Élégant',
      isPremium: true,
      thumbnail: 'https://via.placeholder.com/400x300?text=Elegant+Template',
      colors: {
        primary: '#d97706',
        secondary: '#f59e0b',
        text: '#ffffff',
      },
    },
    {
      id: 6,
      name: 'Tech',
      slug: 'tech',
      category: 'Technologie',
      isPremium: false,
      thumbnail: 'https://via.placeholder.com/400x300?text=Tech+Template',
      colors: {
        primary: '#06b6d4',
        secondary: '#14b8a6',
        text: '#ffffff',
      },
    },
  ])

  // Cartes de l'utilisateur
  const userCards = ref([])

  // Template actuellement sélectionné
  const currentTemplate = ref(null)

  // ===== GETTERS =====

  const getAllTemplates = computed(() => templates.value)

  const getFreeTemplates = computed(() => templates.value.filter((t) => !t.isPremium))

  const getPremiumTemplates = computed(() => templates.value.filter((t) => t.isPremium))

  const getUserCardsCount = computed(() => userCards.value.length)

  // ===== METHODS =====

  /**
   * Récupère un template par son slug
   */
  function getTemplateBySlug(slug) {
    return templates.value.find((t) => t.slug === slug)
  }

  /**
   * Ajoute une nouvelle carte
   */
  function addCard(card) {
    const newCard = {
      id: Date.now(), // ID temporaire basé sur le timestamp
      ...card,
      createdAt: new Date().toISOString(),
      views: 0,
      downloads: 0,
      isPublic: false,
    }
    userCards.value.push(newCard)
    return newCard
  }

  /**
   * Récupère une carte par son ID
   */
  function getCardById(cardId) {
    return userCards.value.find((c) => c.id === cardId)
  }

  /**
   * Met à jour une carte existante
   */
  function updateCard(cardId, updates) {
    const card = getCardById(cardId)
    if (card) {
      Object.assign(card, updates)
      return card
    }
    return null
  }

  /**
   * Supprime une carte
   */
  function deleteCard(cardId) {
    const index = userCards.value.findIndex((c) => c.id === cardId)
    if (index !== -1) {
      userCards.value.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Duplique une carte
   */
  function duplicateCard(cardId) {
    const original = getCardById(cardId)
    if (original) {
      const duplicate = {
        ...original,
        id: Date.now(),
        name: `${original.name} (Copie)`,
        createdAt: new Date().toISOString(),
      }
      userCards.value.push(duplicate)
      return duplicate
    }
    return null
  }

  /**
   * Change la visibilité d'une carte (publique/privée)
   */
  function toggleCardVisibility(cardId) {
    const card = getCardById(cardId)
    if (card) {
      card.isPublic = !card.isPublic
      return card
    }
    return null
  }

  /**
   * Génère un lien de partage pour une carte
   */
  function generateShareLink(cardId) {
    const card = getCardById(cardId)
    if (card) {
      // En production, ce serait un token généré par le backend
      return `${window.location.origin}/share/${card.id}`
    }
    return null
  }

  /**
   * Incrémente les vues d'une carte
   */
  function incrementCardViews(cardId) {
    const card = getCardById(cardId)
    if (card) {
      card.views++
      return card
    }
    return null
  }

  /**
   * Incrémente les téléchargements d'une carte
   */
  function incrementCardDownloads(cardId) {
    const card = getCardById(cardId)
    if (card) {
      card.downloads++
      return card
    }
    return null
  }

  return {
    // State
    templates,
    userCards,
    currentTemplate,

    // Getters
    getAllTemplates,
    getFreeTemplates,
    getPremiumTemplates,
    getUserCardsCount,

    // Methods
    getTemplateBySlug,
    addCard,
    getCardById,
    updateCard,
    deleteCard,
    duplicateCard,
    toggleCardVisibility,
    generateShareLink,
    incrementCardViews,
    incrementCardDownloads,
  }
})
