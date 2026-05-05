import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { CARD_TEMPLATES } from '../data/mockData'
import { useAuthStore } from './authStore'
import { useAdminStore } from './adminStore'
import cardsApi from '@/api/cards'
import * as adminApi from '@/api/admin'

// ⚠️ PHASE 4.5 — ces constantes restent pour les fonctions admin (cross-utilisateurs)
// getAllCardsAdmin et adminDeleteCard lisent encore localStorage jusqu'à la Phase 4.5
const LS_PREFIX = 'digitalcard_userCards_'

// Surcharges admin — TODO Phase 4.5 : migrer vers API
const ADMIN_OVERRIDES_LS_KEY = 'digitalcard_adminTemplateOverrides'
const ADMIN_REMOVED_LS_KEY = 'digitalcard_adminRemovedTemplates'
const ADMIN_CUSTOM_TEMPLATES_KEY = 'digitalcard_adminCustomTemplates'

export const MAX_FREE_CARDS = 3

export const useCardsStore = defineStore('cards', () => {
  const authStore = useAuthStore()

  // Templates prédéfinis
  // TODO backend Phase 4.3 : GET /api/admin/templates
  const templates = ref([...CARD_TEMPLATES])

  ;(function _applyTemplateOverrides() {
    try {
      const removedRaw = localStorage.getItem(ADMIN_REMOVED_LS_KEY)
      const removedSlugs = removedRaw ? JSON.parse(removedRaw) : []
      if (removedSlugs.length > 0) {
        templates.value = templates.value.filter((t) => !removedSlugs.includes(t.slug))
      }
    } catch { /* ignore */ }
    try {
      const overridesRaw = localStorage.getItem(ADMIN_OVERRIDES_LS_KEY)
      const overrides = overridesRaw ? JSON.parse(overridesRaw) : {}
      templates.value = templates.value.map((t) =>
        overrides[t.slug] ? { ...t, ...overrides[t.slug] } : t,
      )
    } catch { /* ignore */ }
  })()

  ;(function _loadAdminCustomTemplates() {
    try {
      const raw = localStorage.getItem(ADMIN_CUSTOM_TEMPLATES_KEY)
      if (raw) {
        const customs = JSON.parse(raw)
        for (const t of customs) {
          const existingIdx = templates.value.findIndex((x) => x.slug === t.slug)
          if (existingIdx === -1) {
            templates.value.push(t)
          } else {
            templates.value[existingIdx] = t
          }
        }
      }
    } catch { /* ignore */ }
  })()

  const userCards = ref([])
  const currentTemplate = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // ===== NORMALISATION API → FRONTEND =====

  function _normalizeCard(apiCard) {
    return {
      id:              apiCard.id,
      name:            apiCard.title,
      templateModelId: apiCard.meta?.templateModelId || null,
      ownerId:         apiCard.user_id,
      createdAt:       apiCard.created_at,
      updatedAt:       apiCard.updated_at,
      isPublic:        !!apiCard.is_public,
      shareSlug:       apiCard.share_slug,
      views:           apiCard.views     || 0,
      downloads:       apiCard.downloads || 0,
      qrScans:         apiCard.qr_scans  || 0,
      shares:          apiCard.shares    || 0,
      data:            apiCard.meta      || {},
    }
  }

  // ===== AUTH WATCHER =====

  watch(
    () => authStore.user?.email,
    (email) => {
      if (email) loadUserCards()
      else clearCards()
    },
    { immediate: true },
  )

  // ===== GETTERS =====

  const getAllTemplates = computed(() => templates.value)
  const getFreeTemplates = computed(() => templates.value.filter((t) => !t.isPremium))
  const getPremiumTemplates = computed(() => templates.value.filter((t) => t.isPremium))
  const getUserCardsCount = computed(() => userCards.value.length)

  const canCreateCard = computed(() => {
    if (authStore.isAdmin) return true
    const adminStore = useAdminStore()
    const limit = authStore.isPremium
      ? (adminStore.settings?.maxCardsPerPremium ?? 50)
      : (adminStore.settings?.maxCardsPerUser ?? MAX_FREE_CARDS)
    return userCards.value.length < limit
  })

  function getCardsByTemplateModel(templateModelId) {
    return userCards.value.filter((c) => c.templateModelId === templateModelId)
  }

  // ===== METHODS =====

  async function loadUserCards() {
    if (!authStore.user) {
      userCards.value = []
      return
    }
    isLoading.value = true
    error.value = null
    try {
      const { data } = await cardsApi.list()
      userCards.value = data.cards.map(_normalizeCard)
    } catch (err) {
      error.value = err.message
      const { useNotificationStore } = await import('./notificationStore')
      useNotificationStore().error('Impossible de charger vos cartes. Veuillez rafraîchir la page.')
    } finally {
      isLoading.value = false
    }
  }

  function clearCards() {
    userCards.value = []
  }

  function getTemplateBySlug(slug) {
    return templates.value.find((t) => t.slug === slug)
  }

  async function addCard(card) {
    isLoading.value = true
    error.value = null
    try {
      if (!canCreateCard.value) {
        const adminS = useAdminStore()
        const limit = authStore.isPremium
          ? (adminS.settings?.maxCardsPerPremium ?? 50)
          : (adminS.settings?.maxCardsPerUser ?? MAX_FREE_CARDS)
        throw new Error(
          `Limite atteinte (${limit} cartes). ${authStore.isPremium ? '' : 'Passez au plan Premium pour créer plus de cartes.'}`,
        )
      }
      const { data } = await cardsApi.create({
        name:        card.name,
        elements:    card.data?.editorData?.elements    ?? { recto: [], verso: [] },
        backgrounds: card.data?.editorData?.backgrounds ?? { recto: '#FFFFFF', verso: '#1E293B' },
        meta:        { ...card.data, templateModelId: card.templateModelId ?? null },
      })
      const newCard = _normalizeCard(data.card)
      userCards.value.push(newCard)
      return newCard
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Erreur lors de la création'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function getCardById(cardId) {
    return userCards.value.find((c) => c.id === cardId)
  }

  async function updateCard(cardId, updates) {
    isLoading.value = true
    error.value = null
    try {
      const payload = {}
      if (updates.name        !== undefined) payload.name        = updates.name
      if (updates.data        !== undefined) {
        payload.elements    = updates.data?.editorData?.elements    ?? undefined
        payload.backgrounds = updates.data?.editorData?.backgrounds ?? undefined
        payload.meta        = { ...updates.data, templateModelId: updates.templateModelId ?? null }
      }

      const { data } = await cardsApi.update(cardId, payload)
      const updatedCard = _normalizeCard(data.card)
      const idx = userCards.value.findIndex((c) => c.id === cardId)
      if (idx !== -1) userCards.value[idx] = updatedCard
      return updatedCard
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteCard(cardId) {
    isLoading.value = true
    error.value = null
    try {
      await cardsApi.remove(cardId)
      const index = userCards.value.findIndex((c) => c.id === cardId)
      if (index !== -1) userCards.value.splice(index, 1)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Erreur lors de la suppression'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function duplicateCard(cardId) {
    const original = getCardById(cardId)
    if (!original) return null
    const dup = JSON.parse(JSON.stringify(original))
    delete dup.id
    delete dup.createdAt
    delete dup.updatedAt
    dup.name = `${original.name} (Copie)`
    dup.isPublic = false
    return await addCard(dup)
  }

  // Les cartes ne peuvent pas être rendues publiques — no-op conservé pour compatibilité
  function toggleCardVisibility() {
    return null
  }

  function generateShareLink(cardId) {
    const card = getCardById(cardId)
    if (card) return `${window.location.origin}/share/${card.id}`
    return null
  }

  // Vues incrémentées server-side dans publicShow — mise à jour locale optimiste seulement
  function incrementCardViews(cardId) {
    const card = getCardById(cardId)
    if (card) { card.views++; return card }
    return null
  }

  async function incrementCardDownloads(cardId) {
    const card = getCardById(cardId)
    if (card) card.downloads++
    try { await cardsApi.incrementStat(cardId, 'downloads') } catch { /* non-bloquant */ }
    return card || null
  }

  async function incrementCardQRScans(cardId) {
    const card = getCardById(cardId)
    if (card) card.qrScans = (card.qrScans || 0) + 1
    try { await cardsApi.incrementStat(cardId, 'qr_scans') } catch { /* non-bloquant */ }
    return card || null
  }

  async function incrementCardShares(cardId) {
    const card = getCardById(cardId)
    if (card) card.shares = (card.shares || 0) + 1
    try { await cardsApi.incrementStat(cardId, 'shares') } catch { /* non-bloquant */ }
    return card || null
  }

  async function getPublicCard(cardId) {
    const owned = getCardById(cardId)
    if (owned) return owned
    try {
      const { data } = await cardsApi.getPublic(cardId)
      return _normalizeCard(data.card)
    } catch {
      return null
    }
  }

  // TODO Phase 4.3 : GET /api/gallery (cartes publiques de la communauté)
  function getAllCommunityCards() {
    return []
  }

  function getGlobalStats() {
    const totalCards = userCards.value.length
    const totalViews = userCards.value.reduce((sum, c) => sum + (c.views || 0), 0)
    const totalDownloads = userCards.value.reduce((sum, c) => sum + (c.downloads || 0), 0)
    const totalQRScans = userCards.value.reduce((sum, c) => sum + (c.qrScans || 0), 0)
    const totalShares = userCards.value.reduce((sum, c) => sum + (c.shares || 0), 0)
    const topCard = userCards.value.reduce(
      (prev, cur) => ((cur.views || 0) > (prev.views || 0) ? cur : prev),
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

  function getCardStats(cardId) {
    const card = getCardById(cardId)
    if (!card) return null
    return {
      views: card.views || 0,
      downloads: card.downloads || 0,
      createdAt: card.createdAt,
      daysSinceCreation: Math.floor(
        (new Date() - new Date(card.createdAt)) / (1000 * 60 * 60 * 24),
      ),
    }
  }

  function exportCardsAsJSON(cards) {
    return JSON.stringify(
      { version: '1.0', exportedAt: new Date().toISOString(), cards: cards || userCards.value },
      null, 2,
    )
  }

  async function importCardsFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString)
      if (!data.cards || !Array.isArray(data.cards)) throw new Error('Format JSON invalide')
      const importTimestamp = new Date().toISOString()
      let successCount = 0
      for (const card of data.cards) {
        try {
          await addCard({ ...card, importedAt: importTimestamp })
          successCount++
        } catch { /* skip cards qui dépassent la limite */ }
      }
      return { success: true, count: successCount }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FONCTIONS ADMIN — ⚠️ EN ATTENTE PHASE 4.5 (restent en localStorage)
  // ═══════════════════════════════════════════════════════════════════════════

  const adminCardsVersion = ref(0)

  function getAllCardsAdmin() {
    adminCardsVersion.value
    const users = authStore.getAllUsersWithStats
    const allCards = []
    for (const user of users) {
      try {
        const raw = localStorage.getItem(LS_PREFIX + user.email)
        const cards = raw ? JSON.parse(raw) : []
        for (const card of cards) {
          allCards.push({ ...card, ownerName: user.name, ownerEmail: user.email })
        }
      } catch { /* skip entrée corrompue */ }
    }
    return allCards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  function adminDeleteCard(cardId, ownerEmail) {
    if (!authStore.isAdmin) return
    try {
      const raw = localStorage.getItem(LS_PREFIX + ownerEmail)
      if (!raw) return
      const cards = JSON.parse(raw).filter((c) => c.id !== cardId)
      localStorage.setItem(LS_PREFIX + ownerEmail, JSON.stringify(cards))
    } catch { /* données corrompues */ }
    if (ownerEmail === authStore.user?.email) {
      const idx = userCards.value.findIndex((c) => c.id === cardId)
      if (idx !== -1) userCards.value.splice(idx, 1)
    }
    adminCardsVersion.value++
  }

  // ── Admin : templates officiels ────────────────────────────────────────────

  function _saveCustomTemplates() {
    try {
      const customs = templates.value.filter((t) => t._isCustom)
      localStorage.setItem(ADMIN_CUSTOM_TEMPLATES_KEY, JSON.stringify(customs))
    } catch { /* quota */ }
  }

  function toggleTemplatePremium(slug) {
    const tmpl = templates.value.find((t) => t.slug === slug)
    if (!tmpl) return
    tmpl.isPremium = !tmpl.isPremium
    try {
      const raw = localStorage.getItem(ADMIN_OVERRIDES_LS_KEY)
      const overrides = raw ? JSON.parse(raw) : {}
      overrides[slug] = { ...overrides[slug], isPremium: tmpl.isPremium }
      localStorage.setItem(ADMIN_OVERRIDES_LS_KEY, JSON.stringify(overrides))
    } catch { /* quota */ }
  }

  function syncTemplatePremium(id, isPremium) {
    const tmpl = templates.value.find((t) => t.id === id)
    if (!tmpl) return
    tmpl.isPremium = isPremium
    if (tmpl._isCustom) {
      _saveCustomTemplates()
    } else {
      try {
        const raw = localStorage.getItem(ADMIN_OVERRIDES_LS_KEY)
        const overrides = raw ? JSON.parse(raw) : {}
        overrides[tmpl.slug] = { ...overrides[tmpl.slug], isPremium }
        localStorage.setItem(ADMIN_OVERRIDES_LS_KEY, JSON.stringify(overrides))
      } catch { /* quota */ }
    }
  }

  function removeTemplate(slug) {
    const index = templates.value.findIndex((t) => t.slug === slug)
    if (index === -1) return
    templates.value.splice(index, 1)
    try {
      const raw = localStorage.getItem(ADMIN_REMOVED_LS_KEY)
      const removed = raw ? JSON.parse(raw) : []
      if (!removed.includes(slug)) {
        removed.push(slug)
        localStorage.setItem(ADMIN_REMOVED_LS_KEY, JSON.stringify(removed))
      }
    } catch { /* quota */ }
  }

  async function addOfficialTemplate(data) {
    if (!authStore.isAdmin) return null
    const suggestedSlug = data.slug
      || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      || 'modele'
    const { data: resp } = await adminApi.createTemplate({
      name:       data.name,
      slug:       suggestedSlug,
      category:   data.category || 'Personnalisé',
      is_premium: data.isPremium || false,
      meta: {
        description:             data.description || '',
        colors:                  data.colors,
        editorData:              data.editorData,
        previewElements:         data.previewElements,
        previewVersoElements:    data.previewVersoElements,
        previewBackgrounds:      data.previewBackgrounds,
        previewCardWidth:        data.previewCardWidth,
        previewCardHeight:       data.previewCardHeight,
        previewCardBorderRadius: data.previewCardBorderRadius,
        previewOrientation:      data.previewOrientation,
        previewFontFamily:       data.previewFontFamily,
      },
    })
    const db = resp.template
    const newTmpl = {
      id:                      db.id,
      slug:                    db.slug,
      name:                    db.name,
      category:                db.category,
      isPremium:               !!db.is_premium,
      description:             db.meta?.description            || '',
      rating: 0, thumbnail: '',
      colors:                  db.meta?.colors                 || { primary: '#6366F1', secondary: '#1E293B', text: '#ffffff' },
      editorData:              db.meta?.editorData             || null,
      previewElements:         db.meta?.previewElements        || null,
      previewVersoElements:    db.meta?.previewVersoElements   || null,
      previewBackgrounds:      db.meta?.previewBackgrounds     || null,
      previewCardWidth:        db.meta?.previewCardWidth       || null,
      previewCardHeight:       db.meta?.previewCardHeight      || null,
      previewCardBorderRadius: db.meta?.previewCardBorderRadius ?? null,
      previewOrientation:      db.meta?.previewOrientation     || null,
      previewFontFamily:       db.meta?.previewFontFamily      || null,
      _isCustom: true,
    }
    templates.value.push(newTmpl)
    _saveCustomTemplates()
    return newTmpl
  }

  async function updateOfficialTemplate(slug, updates) {
    if (!authStore.isAdmin) return null
    const tmpl = templates.value.find((t) => t.slug === slug)
    if (!tmpl) return null
    await adminApi.updateTemplate(tmpl.id, {
      name:       updates.name,
      category:   updates.category,
      is_premium: updates.isPremium,
      meta: {
        description:             updates.description,
        colors:                  updates.colors,
        editorData:              updates.editorData,
        previewElements:         updates.previewElements,
        previewVersoElements:    updates.previewVersoElements,
        previewBackgrounds:      updates.previewBackgrounds,
        previewCardWidth:        updates.previewCardWidth,
        previewCardHeight:       updates.previewCardHeight,
        previewCardBorderRadius: updates.previewCardBorderRadius,
        previewOrientation:      updates.previewOrientation,
        previewFontFamily:       updates.previewFontFamily,
      },
    })
    if (updates.name)                      tmpl.name = updates.name
    if (updates.category)                  tmpl.category = updates.category
    if (updates.description !== undefined) tmpl.description = updates.description
    if (updates.colors)                    tmpl.colors = updates.colors
    if (updates.editorData)                tmpl.editorData = updates.editorData
    if (updates.isPremium !== undefined)   tmpl.isPremium = updates.isPremium
    if (updates.previewElements)           tmpl.previewElements = updates.previewElements
    if (updates.previewVersoElements)      tmpl.previewVersoElements = updates.previewVersoElements
    if (updates.previewBackgrounds)        tmpl.previewBackgrounds = updates.previewBackgrounds
    if (updates.previewCardWidth)          tmpl.previewCardWidth = updates.previewCardWidth
    if (updates.previewCardHeight)         tmpl.previewCardHeight = updates.previewCardHeight
    if (updates.previewCardBorderRadius != null) tmpl.previewCardBorderRadius = updates.previewCardBorderRadius
    if (updates.previewOrientation)        tmpl.previewOrientation = updates.previewOrientation
    if (updates.previewFontFamily)         tmpl.previewFontFamily = updates.previewFontFamily
    tmpl._isCustom = true
    _saveCustomTemplates()
    return tmpl
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
    canCreateCard,
    getCardsByTemplateModel,

    // Methods
    loadUserCards,
    clearCards,
    getTemplateBySlug,
    addCard,
    getCardById,
    getPublicCard,
    getAllCommunityCards,
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

    // Admin — ⚠️ Phase 4.5
    getAllCardsAdmin,
    adminDeleteCard,
    toggleTemplatePremium,
    syncTemplatePremium,
    removeTemplate,
    addOfficialTemplate,
    updateOfficialTemplate,
  }
})
