import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CARD_TEMPLATES } from '../data/mockData'

export const useCardsStore = defineStore('cards', () => {
  // Templates prédéfinis
  const templates = ref([...CARD_TEMPLATES])

  // Cartes de l'utilisateur
  const userCards = ref([])

  // Template actuellement sélectionné
  const currentTemplate = ref(null)

  // État de chargement partagé
  const isLoading = ref(false)
  const error = ref(null)

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
  async function addCard(card) {
    isLoading.value = true
    error.value = null

    try {
      // TODO: remplacer par `const res = await api.post('/cards', card)`
      const newCard = {
        id: Date.now(),
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
    } catch (err) {
      error.value = err.message || 'Erreur lors de la création'
      throw err
    } finally {
      isLoading.value = false
    }
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
  async function updateCard(cardId, updates) {
    isLoading.value = true
    error.value = null

    try {
      // TODO: remplacer par `const res = await api.put(`/cards/${cardId}`, updates)`
      const card = getCardById(cardId)
      if (card) {
        Object.assign(card, updates)
        return card
      }
      return null
    } catch (err) {
      error.value = err.message || 'Erreur lors de la mise à jour'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Supprime une carte
   */
  async function deleteCard(cardId) {
    isLoading.value = true
    error.value = null

    try {
      // TODO: remplacer par `await api.delete(`/cards/${cardId}`)`
      const index = userCards.value.findIndex((c) => c.id === cardId)
      if (index !== -1) {
        userCards.value.splice(index, 1)
        return true
      }
      return false
    } catch (err) {
      error.value = err.message || 'Erreur lors de la suppression'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Duplique une carte
   */
  async function duplicateCard(cardId) {
    isLoading.value = true
    error.value = null

    try {
      // TODO: remplacer par `const res = await api.post(`/cards/${cardId}/duplicate`)`
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
    } catch (err) {
      error.value = err.message || 'Erreur lors de la duplication'
      throw err
    } finally {
      isLoading.value = false
    }
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
    const topCard = userCards.value.reduce(
      (prev, current) => ((current.views || 0) > (prev.views || 0) ? current : prev),
      userCards.value[0],
    )

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
          (new Date() - new Date(card.createdAt)) / (1000 * 60 * 60 * 24),
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
    isLoading,
    error,

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
