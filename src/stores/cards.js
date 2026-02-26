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
      qrScans: 0,
      shares: 0,
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

  /**
   * Incrémente les scans du QR d'une carte
   */
  function incrementCardQRScans(cardId) {
    const card = getCardById(cardId)
    if (card) {
      card.qrScans = (card.qrScans || 0) + 1
      return card
    }
    return null
  }

  /**
   * Incrémente les partages d'une carte
   */
  function incrementCardShares(cardId) {
    const card = getCardById(cardId)
    if (card) {
      card.shares = (card.shares || 0) + 1
      return card
    }
    return null
  }

  /**
   * Récupère des statistiques globales
   */
  function getGlobalStats() {
    const totalCards = userCards.value.length
    const totalViews = userCards.value.reduce((sum, card) => sum + (card.views || 0), 0)
    const totalDownloads = userCards.value.reduce((sum, card) => sum + (card.downloads || 0), 0)
    const totalQRScans = userCards.value.reduce((sum, card) => sum + (card.qrScans || 0), 0)
    const totalShares = userCards.value.reduce((sum, card) => sum + (card.shares || 0), 0)
    const topCard = userCards.value.reduce((prev, current) =>
      ((current.views || 0) > (prev.views || 0)) ? current : prev, userCards.value[0])

    return {
      totalCards,
      totalViews,
      totalDownloads,
      totalQRScans,
      totalShares,
      averageViewsPerCard: totalCards > 0 ? Math.round(totalViews / totalCards) : 0,
      topCard: topCard || null,
    }
  }

  /**
   * Récupère l'historique d'une carte
   */
  function getCardStats(cardId) {
    const card = getCardById(cardId)
    if (card) {
      return {
        views: card.views || 0,
        downloads: card.downloads || 0,
        createdAt: card.createdAt,
        daysSinceCreation: Math.floor(
          (new Date() - new Date(card.createdAt)) / (1000 * 60 * 60 * 24)
        ),
      }
    }
    return null
  }

  /**
   * Exporte toutes les cartes en JSON
   */
  function exportCardsAsJSON() {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      cards: userCards.value,
      templates: templates.value,
    }
    return JSON.stringify(data, null, 2)
  }

  /**
   * Importe des cartes depuis un fichier JSON
   */
  function importCardsFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString)

      if (!data.cards || !Array.isArray(data.cards)) {
        throw new Error('Format JSON invalide')
      }

      // Importer les cartes
      data.cards.forEach((card) => {
        // Assurer que chaque carte a un nouvel ID
        const importedCard = {
          ...card,
          id: Date.now() + Math.random(),
          createdAt: card.createdAt || new Date().toISOString(),
        }
        userCards.value.push(importedCard)
      })

      return {
        success: true,
        count: data.cards.length,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
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
    incrementCardQRScans,
    incrementCardShares,
    getGlobalStats,
    getCardStats,
    exportCardsAsJSON,
    importCardsFromJSON,
  }
})
