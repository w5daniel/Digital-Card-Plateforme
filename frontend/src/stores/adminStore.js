import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SEED_SETTINGS } from '../data/mockData'
import * as adminApi from '../api/admin'
import { useCardsStore } from './cards'

// ────────────────────────────────────────────────────────────────────────────
export const useAdminStore = defineStore('admin', () => {
  // ── State ─────────────────────────────────────────────────────────────────
  const users     = ref([])
  const cards     = ref([])
  const templates = ref([])
  // Settings initialisé avec les defaults — peuplé par loadPublicConfig() au boot
  // et loadSettings() dans l'espace admin
  const settings  = ref({ ...SEED_SETTINGS })
  const isLoading = ref(false)
  const error     = ref(null)

  // ── Normalisations ────────────────────────────────────────────────────────
  function _normalizeUser(u) {
    return {
      id:               u.id,
      name:             u.name,
      email:            u.email,
      role:             u.role,
      status:           u.is_banned ? 'blocked' : 'active',
      isPremium:        !!u.is_premium,
      premiumExpiresAt: u.premium_expires_at,
      cardCount:        u.cards_count ?? 0,
      createdAt:        u.created_at,
    }
  }

  function _normalizeCard(c) {
    return {
      id:         c.id,
      name:       c.title,
      isPublic:   !!c.is_public,
      views:      c.views ?? 0,
      ownerName:  c.user?.name  ?? '—',
      ownerEmail: c.user?.email ?? '—',
      createdAt:  c.created_at,
    }
  }

  // ── Stats globales ────────────────────────────────────────────────────────
  const stats = computed(() => ({
    totalUsers:      users.value.length,
    activeUsers:     users.value.filter(u => u.status === 'active').length,
    blockedUsers:    users.value.filter(u => u.status === 'blocked').length,
    premiumUsers:    users.value.filter(u => u.isPremium).length,
    freeUsers:       users.value.filter(u => !u.isPremium).length,
    totalCards:      cards.value.length,
    publicCards:     cards.value.filter(c => c.isPublic).length,
    totalViews:      cards.value.reduce((s, c) => s + (c.views || 0), 0),
    totalTemplates:  templates.value.length,
    premiumTemplates: templates.value.filter(t => t.is_premium).length,
  }))

  // ── Activité récente ──────────────────────────────────────────────────────
  const recentActivity = computed(() => {
    const recentUsers = [...users.value]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(u => ({
        type:  'user',
        label: `Nouvel utilisateur : ${u.name} (${u.email})`,
        time:  u.createdAt,
        color: 'text-blue-500',
      }))

    const recentCards = [...cards.value]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(c => ({
        type:  'card',
        label: `Nouvelle carte "${c.name || 'Sans titre'}" par ${c.ownerName}`,
        time:  c.createdAt,
        color: 'text-green-500',
      }))

    return [...recentUsers, ...recentCards]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8)
  })

  // ── Chargement ───────────────────────────────────────────────────────────

  // Chargé au boot du router pour tous les visiteurs (maintenanceMode, allowGallery…)
  const loadPublicConfig = async () => {
    try {
      const { data } = await adminApi.getPublicConfig()
      Object.assign(settings.value, data)
    } catch {
      // silencieux — on conserve les defaults si l'API est indisponible
    }
  }

  // Chargé dans l'espace admin (settings complets)
  const loadSettings = async () => {
    try {
      const { data } = await adminApi.getSettings()
      settings.value = data
    } catch (err) {
      error.value = err.message || 'Erreur chargement settings'
    }
  }

  const loadUsers = async () => {
    try {
      const { data } = await adminApi.getUsers()
      users.value = data.map(_normalizeUser)
    } catch (err) {
      error.value = err.message || 'Erreur chargement utilisateurs'
    }
  }

  const loadCards = async () => {
    try {
      const { data } = await adminApi.getCards()
      cards.value = data.map(_normalizeCard)
    } catch (err) {
      error.value = err.message || 'Erreur chargement cartes'
    }
  }

  function _normalizeTemplate(t) {
    return {
      id:                      t.id,
      slug:                    t.slug,
      name:                    t.name,
      category:                t.category,
      isPremium:               !!t.is_premium,
      is_premium:              t.is_premium,
      description:             t.meta?.description            || '',
      colors:                  t.meta?.colors                 || { primary: '#6366F1', secondary: '#1E293B', text: '#fff' },
      editorData:              t.meta?.editorData             || null,
      previewElements:         t.meta?.previewElements        || null,
      previewVersoElements:    t.meta?.previewVersoElements   || null,
      previewBackgrounds:      t.meta?.previewBackgrounds     || null,
      previewCardWidth:        t.meta?.previewCardWidth       || null,
      previewCardHeight:       t.meta?.previewCardHeight      || null,
      previewCardBorderRadius: t.meta?.previewCardBorderRadius ?? null,
      previewOrientation:      t.meta?.previewOrientation     || null,
      previewFontFamily:       t.meta?.previewFontFamily      || null,
      is_gallery:              t.is_gallery,
      is_public:               t.is_public,
      created_at:              t.created_at,
    }
  }

  const loadTemplates = async () => {
    try {
      const { data } = await adminApi.getTemplates()
      templates.value = data.map(_normalizeTemplate)
    } catch (err) {
      error.value = err.message || 'Erreur chargement templates'
    }
  }

  // ── Mutations Users ───────────────────────────────────────────────────────
  const blockUser = async (id) => {
    error.value = null
    await adminApi.updateUser(id, { is_banned: true })
    await loadUsers()
  }

  const unblockUser = async (id) => {
    error.value = null
    await adminApi.updateUser(id, { is_banned: false })
    await loadUsers()
  }

  const toggleUserRole = async (id) => {
    error.value = null
    const u = users.value.find(u => u.id === id)
    if (!u) return
    await adminApi.updateUser(id, { role: u.role === 'admin' ? 'user' : 'admin' })
    await loadUsers()
  }

  const toggleUserPremium = async (id) => {
    error.value = null
    const u = users.value.find(u => u.id === id)
    if (!u) return
    await adminApi.updateUser(id, { is_premium: !u.isPremium })
    await loadUsers()
  }

  const deleteUser = async (id) => {
    error.value = null
    await adminApi.deleteUser(id)
    users.value = users.value.filter(u => u.id !== id)
  }

  // ── Mutations Cards ───────────────────────────────────────────────────────
  const deleteCard = async (id) => {
    error.value = null
    await adminApi.deleteCard(id)
    cards.value = cards.value.filter(c => c.id !== id)
  }

  // ── Mutations Templates ───────────────────────────────────────────────────
  const toggleTemplatePremium = async (id) => {
    error.value = null
    const t = templates.value.find(t => t.id === id)
    if (!t) return
    const newIsPremium = !t.is_premium
    await adminApi.updateTemplate(id, { is_premium: newIsPremium })
    await loadTemplates()
    useCardsStore().syncTemplatePremium(id, newIsPremium)
  }

  const deleteTemplate = async (id) => {
    error.value = null
    await adminApi.deleteTemplate(id)
    templates.value = templates.value.filter(t => t.id !== id)
  }

  // ── Mutations Settings ────────────────────────────────────────────────────
  const updateSettings = async (patch) => {
    error.value = null
    const { data } = await adminApi.updateSettings(patch)
    settings.value = data
  }

  const resetSettings = async () => {
    error.value = null
    const { data } = await adminApi.updateSettings(SEED_SETTINGS)
    settings.value = data
  }

  // ── UX loading helper ─────────────────────────────────────────────────────
  const withLoading = async (fn) => {
    isLoading.value = true
    try {
      await fn()
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    users,
    cards,
    templates,
    settings,
    isLoading,
    error,
    // Computed
    stats,
    recentActivity,
    // Loaders
    loadPublicConfig,
    loadSettings,
    loadUsers,
    loadCards,
    loadTemplates,
    // Users
    blockUser,
    unblockUser,
    toggleUserRole,
    toggleUserPremium,
    deleteUser,
    // Cards
    deleteCard,
    // Templates
    toggleTemplatePremium,
    deleteTemplate,
    // Settings
    updateSettings,
    resetSettings,
    withLoading,
  }
})
