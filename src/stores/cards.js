import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { CARD_TEMPLATES } from '../data/mockData'
import { useAuthStore } from './authStore'
import { useAdminStore } from './adminStore'

const LS_PREFIX = 'digitalcard_userCards_'

export const MAX_FREE_CARDS = 3
// Snapshot public accessible à tous (pas de préfixe email).
// TODO backend : remplacer par GET /api/cards/public/:id
const PUBLIC_LS_PREFIX = 'digitalcard_public_'
// Surcharges admin : { [slug]: { isPremium: bool } }
// TODO backend : persister dans la table `templates` via PUT /api/admin/templates/:slug
const ADMIN_OVERRIDES_LS_KEY = 'digitalcard_adminTemplateOverrides'
// Slugs des templates supprimés par l'admin
// TODO backend : soft-delete dans la table `templates` via DELETE /api/admin/templates/:slug
const ADMIN_REMOVED_LS_KEY = 'digitalcard_adminRemovedTemplates'
// Modèles officiels créés/modifiés par l'admin (editorData stocké séparément)
const ADMIN_CUSTOM_TEMPLATES_KEY = 'digitalcard_adminCustomTemplates'

export const useCardsStore = defineStore('cards', () => {
  const authStore = useAuthStore()

  // Templates prédéfinis
  // TODO backend : GET /api/admin/templates renvoie la liste complète (avec isPremium, usageCount…)
  const templates = ref([...CARD_TEMPLATES])

  // Appliquer les surcharges admin conservées en localStorage (prémium + suppressions)
  // TODO backend : les surcharges proviendront directement du serveur dans la liste ci-dessus
  ;(function _applyTemplateOverrides() {
    try {
      const removedRaw = localStorage.getItem(ADMIN_REMOVED_LS_KEY)
      const removedSlugs = removedRaw ? JSON.parse(removedRaw) : []
      if (removedSlugs.length > 0) {
        templates.value = templates.value.filter((t) => !removedSlugs.includes(t.slug))
      }
    } catch {
      /* ignore */
    }
    try {
      const overridesRaw = localStorage.getItem(ADMIN_OVERRIDES_LS_KEY)
      const overrides = overridesRaw ? JSON.parse(overridesRaw) : {}
      templates.value = templates.value.map((t) =>
        overrides[t.slug] ? { ...t, ...overrides[t.slug] } : t,
      )
    } catch {
      /* ignore */
    }
  })()

  // Charger les modèles officiels créés par l'admin (pas dans CARD_TEMPLATES)
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
            // Template officiel modifié par l'admin — remplacer par la version custom
            templates.value[existingIdx] = t
          }
        }
      }
    } catch { /* ignore */ }
  })()

  // Cartes de l'utilisateur courant
  const userCards = ref([])

  // Template actuellement sélectionné
  const currentTemplate = ref(null)

  // État de chargement partagé
  const isLoading = ref(false)
  const error = ref(null)

  // ===== ISOLATION PAR UTILISATEUR =====

  /** Clé localStorage pour l'utilisateur courant (basée sur l'email, stable) */
  function _lsKey() {
    const email = authStore.user?.email
    return email ? LS_PREFIX + email : null
  }

  /** Charge les cartes de l'utilisateur courant depuis localStorage */
  function loadUserCards() {
    const key = _lsKey()
    if (!key) {
      userCards.value = []
      return
    }
    try {
      const saved = localStorage.getItem(key)
      userCards.value = saved ? JSON.parse(saved) : []
      // Publier un snapshot pour les cartes existantes qui n'en ont pas encore
      userCards.value.forEach((card) => {
        if (!localStorage.getItem(PUBLIC_LS_PREFIX + card.id)) {
          _publishSnapshot(card)
        }
      })
    } catch {
      userCards.value = []
    }
  }

  /** Vide les cartes en mémoire (appelé au logout) */
  function clearCards() {
    userCards.value = []
  }

  // Réagir aux changements d'utilisateur (login / logout / restoreSession)
  watch(
    () => authStore.user?.email,
    (email) => {
      if (email) {
        loadUserCards()
      } else {
        clearCards()
      }
    },
    { immediate: true },
  )

  // ===== GETTERS =====

  const getAllTemplates = computed(() => templates.value)

  const getFreeTemplates = computed(() => templates.value.filter((t) => !t.isPremium))

  const getPremiumTemplates = computed(() => templates.value.filter((t) => t.isPremium))

  const getUserCardsCount = computed(() => userCards.value.length)

  /** Vérifie si l'utilisateur peut créer une nouvelle carte (limite configurable via admin) */
  const canCreateCard = computed(() => {
    if (authStore.isAdmin) return true
    const adminStore = useAdminStore()
    const limit = authStore.isPremium
      ? (adminStore.settings?.maxCardsPerPremium ?? 50)
      : (adminStore.settings?.maxCardsPerUser ?? MAX_FREE_CARDS)
    return userCards.value.length < limit
  })

  /**
   * Filter cards linked to a given user template model.
   */
  function getCardsByTemplateModel(templateModelId) {
    return userCards.value.filter((c) => c.templateModelId === templateModelId)
  }

  // ===== METHODS =====

  /**
   * Récupère un template par son slug
   */
  function getTemplateBySlug(slug) {
    return templates.value.find((t) => t.slug === slug)
  }

  /**
   * Bascule le statut Premium d'un template (admin).
   * Persiste la surcharge dans localStorage pour survivre au rechargement.
   * TODO backend : PUT /api/admin/templates/:slug { isPremium }
   *   → mettre à jour la colonne `is_premium` de la table `templates`
   *   → invalider le cache public de la gallery (CDN / Redis)
   */
  function toggleTemplatePremium(slug) {
    const tmpl = templates.value.find((t) => t.slug === slug)
    if (!tmpl) return
    tmpl.isPremium = !tmpl.isPremium
    try {
      const raw = localStorage.getItem(ADMIN_OVERRIDES_LS_KEY)
      const overrides = raw ? JSON.parse(raw) : {}
      overrides[slug] = { ...overrides[slug], isPremium: tmpl.isPremium }
      localStorage.setItem(ADMIN_OVERRIDES_LS_KEY, JSON.stringify(overrides))
    } catch {
      /* quota dépassé — non bloquant */
    }
  }

  /**
   * Supprime un template de la liste active (admin).
   * Persiste le slug supprimé pour survivre au rechargement.
   * TODO backend : DELETE /api/admin/templates/:slug
   *   → soft-delete : colonne `deleted_at` dans `templates`
   *   → retirer le template de la gallery publique côté API
   *   → les cartes existantes basées sur ce template restent intactes
   */
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
    } catch {
      /* quota dépassé — non bloquant */
    }
  }

  /**
   * Ajoute une nouvelle carte
   * TODO backend : valider card.name (min 2 chars), card.data.contact (email, phone, name formats) côt�� serveur
   */
  async function addCard(card) {
    isLoading.value = true
    error.value = null

    try {
      // Vérifier la limite de cartes pour les comptes gratuits
      if (!canCreateCard.value) {
        const adminS = useAdminStore()
        const limit = authStore.isPremium ? (adminS.settings?.maxCardsPerPremium ?? 50) : (adminS.settings?.maxCardsPerUser ?? MAX_FREE_CARDS)
        throw new Error(
          `Limite atteinte (${limit} cartes). ${authStore.isPremium ? '' : 'Passez au plan Premium pour créer plus de cartes.'}`,
        )
      }
      const newCard = {
        id: crypto.randomUUID(),
        ...card,
        templateModelId: card.templateModelId || null,
        ownerId: authStore.user?.email || 'anonymous',
        createdAt: new Date().toISOString(),
        views: 0,
        downloads: 0,
        qrScans: 0,
        shares: 0,
        isPublic: card.isPublic ?? false,
      }
      userCards.value.push(newCard)
      _publishSnapshot(newCard)
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

  // ===== PARTAGE PUBLIC =====

  /**
   * Écrit un snapshot public de la carte (sans préfixe email).
   * Accessible à tout visiteur via getPublicCard().
   * TODO backend : POST/PUT /api/cards/:id/publish
   */
  function _publishSnapshot(card) {
    try {
      localStorage.setItem(PUBLIC_LS_PREFIX + card.id, JSON.stringify(card))
    } catch {
      // quota dépassé — non bloquant
    }
  }

  /**
   * Supprime le snapshot public d'une carte (appelé à la suppression).
   * TODO backend : DELETE /api/cards/:id/publish
   */
  function _unpublishSnapshot(cardId) {
    localStorage.removeItem(PUBLIC_LS_PREFIX + cardId)
  }

  /**
   * Lit une carte par son ID desde le snapshot public (cross-user).
   * Fallback si l'utilisateur courant est le propriétaire.
   * TODO backend : remplacer par await api.get(`/cards/public/${cardId}`)
   */
  function getPublicCard(cardId) {
    // L'utilisateur courant est propriétaire → retourner directement
    const owned = getCardById(cardId)
    if (owned) return owned
    // Sinon lire le snapshot public (partagé via localStorage)
    try {
      const raw = localStorage.getItem(PUBLIC_LS_PREFIX + cardId)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  /**
   * Renvoie toutes les cartes publiques (Communauté) depuis les snapshots localStorage.
   * Inclut les cartes du propriétaire courant (avec flag isOwn pour le badge UI).
   * TODO backend : remplacer par await api.get('/cards/community')
   */
  function getAllCommunityCards() {
    const cards = []
    const currentEmail = authStore.user?.email
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key.startsWith(PUBLIC_LS_PREFIX)) continue
      try {
        const card = JSON.parse(localStorage.getItem(key))
        if (card && card.isPublic) {
          cards.push({ ...card, _isOwn: card.ownerId === currentEmail })
        }
      } catch {
        // skip corrupt entries
      }
    }
    return cards
  }

  /**
   * Met à jour une carte existante
   * TODO backend : valider updates.name, updates.data.contact côté serveur (PUT /api/cards/:id)
   */
  async function updateCard(cardId, updates) {
    isLoading.value = true
    error.value = null

    try {
      const card = getCardById(cardId)
      if (card) {
        Object.assign(card, updates)
        _publishSnapshot(card)
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
      const index = userCards.value.findIndex((c) => c.id === cardId)
      if (index !== -1) {
        userCards.value.splice(index, 1)
        _unpublishSnapshot(cardId)
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
      // Vérifier la limite de cartes pour les comptes gratuits
      if (!canCreateCard.value) {
        const adminS = useAdminStore()
        const limit = authStore.isPremium ? (adminS.settings?.maxCardsPerPremium ?? 50) : (adminS.settings?.maxCardsPerUser ?? MAX_FREE_CARDS)
        throw new Error(
          `Limite atteinte (${limit} cartes). ${authStore.isPremium ? '' : 'Passez au plan Premium pour créer plus de cartes.'}`,
        )
      }

      const original = getCardById(cardId)
      if (original) {
        const duplicate = JSON.parse(JSON.stringify(original))
        duplicate.id = crypto.randomUUID()
        duplicate.name = `${original.name} (Copie)`
        duplicate.createdAt = new Date().toISOString()
        duplicate.ownerId = authStore.user?.email || 'anonymous'
        userCards.value.push(duplicate)
        _publishSnapshot(duplicate)
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
      _publishSnapshot(card)
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
   * Exporte les cartes fournies (ou toutes) en JSON
   */
  function exportCardsAsJSON(cards) {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      cards: cards || userCards.value,
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

      data.cards.forEach((card) => {
        const importedCard = {
          ...card,
          id: crypto.randomUUID(),
          ownerId: authStore.user?.email || 'anonymous',
          createdAt: card.createdAt || new Date().toISOString(),
        }
        userCards.value.push(importedCard)
        _publishSnapshot(importedCard)
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

  // ═══════════════════════════════════════════════════════════════════════════
  // FONCTIONS ADMIN — Gestion de toutes les cartes (cross-utilisateurs)
  // ═══════════════════════════════════════════════════════════════════════════

  // Compteur réactif : incrémenté à chaque mutation admin sur les cartes d'un autre utilisateur.
  // Permet aux computed() des vues admin de se re-évaluer automatiquement.
  // TODO backend : inutile — le serveur renvoie les données à jour à chaque GET
  const adminCardsVersion = ref(0)

  /**
   * Retourne toutes les cartes de tous les utilisateurs (admin uniquement).
   * Scanne les clés localStorage `digitalcard_userCards_{email}` de chaque utilisateur inscrit.
   * Enrichit chaque carte avec `ownerName` et `ownerEmail`.
   *
   * TODO backend : GET /api/admin/cards?page=1&limit=50&search=&visibility=&sort=createdAt
   *   → réponse paginée : { data: Card[], total: number, page: number, pages: number }
   *   → SQL :
   *       SELECT c.*, u.name AS owner_name, u.email AS owner_email
   *       FROM cards c
   *       JOIN users u ON u.id = c.owner_id
   *       WHERE c.deleted_at IS NULL
   *       ORDER BY c.created_at DESC
   *       LIMIT :limit OFFSET :offset
   *   → filtres serveur : visibility (is_public), search (full-text sur name + owner email/name)
   *   → ne pas charger toutes les cartes en mémoire : pagination côté SQL obligatoire
   */
  function getAllCardsAdmin() {
    // Dépendance réactive : re-évalue quand adminCardsVersion change (après mutations admin)

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
      } catch {
        /* skip entrée corrompue */
      }
    }
    // Tri par date de création décroissante
    return allCards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  /**
   * Supprime une carte appartenant à n'importe quel utilisateur (admin uniquement).
   *
   * TODO backend : DELETE /api/admin/cards/:id
   *   → middleware `requireAdmin` obligatoire
   *   → soft-delete : UPDATE cards SET deleted_at=NOW() WHERE id=:id
   *   → retirer le snapshot public de la CDN / cache Redis
   *   → logguer dans admin_audit_log (admin_id, 'card_deleted', card_id)
   *   → NE PAS supprimer définitivement sans confirmation (RGPD — historique)
   */
  function adminDeleteCard(cardId, ownerEmail) {
    if (!authStore.isAdmin) return
    try {
      const raw = localStorage.getItem(LS_PREFIX + ownerEmail)
      if (!raw) return
      const cards = JSON.parse(raw).filter((c) => c.id !== cardId)
      localStorage.setItem(LS_PREFIX + ownerEmail, JSON.stringify(cards))
    } catch {
      /* données corrompues — continuer le nettoyage */
    }
    _unpublishSnapshot(cardId)
    // Si c'est la carte de l'utilisateur courant, mettre à jour userCards aussi
    if (ownerEmail === authStore.user?.email) {
      const idx = userCards.value.findIndex((c) => c.id === cardId)
      if (idx !== -1) userCards.value.splice(idx, 1)
    }
    adminCardsVersion.value++
  }

  /**
   * Bascule la visibilité (public/privé) d'une carte appartenant à n'importe quel utilisateur (admin).
   *
   * TODO backend : PATCH /api/admin/cards/:id { isPublic }
   *   → middleware `requireAdmin` obligatoire
   *   → UPDATE cards SET is_public=?, updated_at=NOW() WHERE id=:id
   *   → si passage à privé : retirer le snapshot public de la CDN / cache
   *   → si passage à public : mettre à jour la CDN / galerie communauté
   *   → logguer dans admin_audit_log
   */
  function adminToggleCardVisibility(cardId, ownerEmail) {
    if (!authStore.isAdmin) return
    try {
      const raw = localStorage.getItem(LS_PREFIX + ownerEmail)
      if (!raw) return
      const cards = JSON.parse(raw)
      const card = cards.find((c) => c.id === cardId)
      if (!card) return
      card.isPublic = !card.isPublic
      localStorage.setItem(LS_PREFIX + ownerEmail, JSON.stringify(cards))
      _publishSnapshot(card)
      // Sync si c'est la carte de l'utilisateur courant
      if (ownerEmail === authStore.user?.email) {
        const own = getCardById(cardId)
        if (own) own.isPublic = card.isPublic
      }
    } catch {
      /* données corrompues — non bloquant */
    }
    adminCardsVersion.value++
  }

  // ── Admin : templates officiels (CRUD) ────────────────────────────────────

  function _saveCustomTemplates() {
    try {
      const customs = templates.value.filter((t) => t._isCustom)
      localStorage.setItem(ADMIN_CUSTOM_TEMPLATES_KEY, JSON.stringify(customs))
    } catch { /* quota */ }
  }

  /**
   * Crée un nouveau modèle officiel dans la galerie (admin uniquement).
   * Génère un slug unique — jamais de collision silencieuse.
   */
  function addOfficialTemplate(data) {
    if (!authStore.isAdmin) return null
    // Generate unique slug — add numeric suffix if collision
    const base = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'modele'
    let slug = base
    let i = 2
    while (templates.value.find((t) => t.slug === slug)) {
      slug = `${base}-${i}`
      i++
    }
    const newTmpl = {
      id: crypto.randomUUID(),
      slug,
      name: data.name,
      category: data.category || 'Personnalisé',
      isPremium: data.isPremium || false,
      description: data.description || '',
      rating: 0,
      thumbnail: '',
      colors: data.colors || { primary: '#6366F1', secondary: '#1E293B', text: '#ffffff' },
      editorData: data.editorData || null,
      previewElements: data.previewElements || null,
      previewVersoElements: data.previewVersoElements || null,
      previewBackgrounds: data.previewBackgrounds || null,
      previewCardWidth: data.previewCardWidth || null,
      previewCardHeight: data.previewCardHeight || null,
      previewCardBorderRadius: data.previewCardBorderRadius ?? null,
      previewOrientation: data.previewOrientation || null,
      previewFontFamily: data.previewFontFamily || null,
      _isCustom: true,
    }
    templates.value.push(newTmpl)
    _saveCustomTemplates()
    return newTmpl
  }

  /**
   * Met à jour un modèle officiel existant (admin uniquement).
   */
  function updateOfficialTemplate(slug, updates) {
    if (!authStore.isAdmin) return null
    const tmpl = templates.value.find((t) => t.slug === slug)
    if (!tmpl) return null
    if (updates.name) tmpl.name = updates.name
    if (updates.category) tmpl.category = updates.category
    if (updates.description !== undefined) tmpl.description = updates.description
    if (updates.colors) tmpl.colors = updates.colors
    if (updates.editorData) tmpl.editorData = updates.editorData
    if (updates.isPremium !== undefined) tmpl.isPremium = updates.isPremium
    // Preview data for gallery rendering
    if (updates.previewElements) tmpl.previewElements = updates.previewElements
    if (updates.previewVersoElements) tmpl.previewVersoElements = updates.previewVersoElements
    if (updates.previewBackgrounds) tmpl.previewBackgrounds = updates.previewBackgrounds
    if (updates.previewCardWidth) tmpl.previewCardWidth = updates.previewCardWidth
    if (updates.previewCardHeight) tmpl.previewCardHeight = updates.previewCardHeight
    if (updates.previewCardBorderRadius != null) tmpl.previewCardBorderRadius = updates.previewCardBorderRadius
    if (updates.previewOrientation) tmpl.previewOrientation = updates.previewOrientation
    if (updates.previewFontFamily) tmpl.previewFontFamily = updates.previewFontFamily
    tmpl._isCustom = true
    _saveCustomTemplates()
    try {
      const raw = localStorage.getItem(ADMIN_OVERRIDES_LS_KEY)
      const overrides = raw ? JSON.parse(raw) : {}
      overrides[slug] = { ...overrides[slug], name: tmpl.name, category: tmpl.category, description: tmpl.description, isPremium: tmpl.isPremium }
      localStorage.setItem(ADMIN_OVERRIDES_LS_KEY, JSON.stringify(overrides))
    } catch { /* quota */ }
    return tmpl
  }

  // Auto-persist vers la clé localStorage de l'utilisateur courant
  watch(
    userCards,
    (val) => {
      const key = _lsKey()
      if (key) localStorage.setItem(key, JSON.stringify(val))
    },
    { deep: true },
  )

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
    getTemplateBySlug,
    toggleTemplatePremium,
    removeTemplate,
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
    loadUserCards,
    clearCards,
    // Admin — gestion cross-utilisateurs
    getAllCardsAdmin,
    adminDeleteCard,
    adminToggleCardVisibility,
    // Admin — gestion templates officiels
    addOfficialTemplate,
    updateOfficialTemplate,
  }
})
