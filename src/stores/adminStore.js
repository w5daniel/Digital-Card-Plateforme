import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  SEED_USERS,
  SEED_CARDS,
  SEED_TEMPLATES,
  SEED_SETTINGS,
} from '../data/mockData'

// ── Helpers localStorage ────────────────────────────────────────────────────
const LS_KEYS = {
  users: 'admin_users',
  cards: 'admin_cards',
  templates: 'admin_templates',
  settings: 'admin_settings',
}

function loadFromLS(key, seed) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(seed))
  } catch {
    return JSON.parse(JSON.stringify(seed))
  }
}

function saveToLS(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('[adminStore] localStorage quota dépassé — données non sauvegardées pour', key)
    } else {
      console.warn('[adminStore] Erreur localStorage :', e)
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
export const useAdminStore = defineStore('admin', () => {
  // ── State ─────────────────────────────────────────────────────────────────
  const users = ref(loadFromLS(LS_KEYS.users, SEED_USERS))
  const cards = ref(loadFromLS(LS_KEYS.cards, SEED_CARDS))
  const templates = ref(loadFromLS(LS_KEYS.templates, SEED_TEMPLATES))
  const settings = ref(loadFromLS(LS_KEYS.settings, SEED_SETTINGS))
  const isLoading = ref(false)
  const error = ref(null)

  // ── Stats globales (computed) ─────────────────────────────────────────────
  const stats = computed(() => ({
    totalUsers: users.value.length,
    activeUsers: users.value.filter((u) => u.status === 'active').length,
    blockedUsers: users.value.filter((u) => u.status === 'blocked').length,
    premiumUsers: users.value.filter((u) => u.isPremium).length,
    totalCards: cards.value.length,
    publicCards: cards.value.filter((c) => c.visibility === 'public').length,
    flaggedCards: cards.value.filter((c) => c.flagged).length,
    pendingCards: cards.value.filter((c) => c.status === 'pending').length,
    totalTemplates: templates.value.length,
    premiumTemplates: templates.value.filter((t) => t.isPremium).length,
    totalViews: cards.value.reduce((sum, c) => sum + (c.views || 0), 0),
  }))

  // ── Activité récente ───────────────────────────────────────────────────────
  const recentActivity = computed(() => {
    const items = [
      ...users.value.slice(-3).map((u) => ({
        type: 'user',
        label: `Nouvel utilisateur : ${u.name}`,
        time: u.createdAt,
        color: 'text-blue-500',
      })),
      ...cards.value
        .filter((c) => c.flagged)
        .map((c) => ({
          type: 'flag',
          label: `Carte signalée : "${c.title}" (${c.ownerName})`,
          time: c.createdAt,
          color: 'text-red-500',
        })),
      ...cards.value.slice(-4).map((c) => ({
        type: 'card',
        label: `Nouvelle carte : "${c.title}" par ${c.ownerName}`,
        time: c.createdAt,
        color: 'text-green-500',
      })),
    ]
    return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8)
  })

  // ── Gestion Utilisateurs ───────────────────────────────────────────────────
  // TODO: remplacer par `await api.patch(`/admin/users/${id}`, { status: 'blocked' })`
  const blockUser = (id) => {
    error.value = null
    try {
      const u = users.value.find((u) => u.id === id)
      if (u) {
        u.status = 'blocked'
        saveToLS(LS_KEYS.users, users.value)
      }
    } catch (err) {
      error.value = err.message || "Erreur lors du blocage de l'utilisateur"
    }
  }

  const unblockUser = (id) => {
    error.value = null
    try {
      const u = users.value.find((u) => u.id === id)
      if (u) {
        u.status = 'active'
        saveToLS(LS_KEYS.users, users.value)
      }
    } catch (err) {
      error.value = err.message || "Erreur lors du déblocage de l'utilisateur"
    }
  }

  const toggleUserRole = (id) => {
    error.value = null
    try {
      const u = users.value.find((u) => u.id === id)
      if (u) {
        u.role = u.role === 'admin' ? 'user' : 'admin'
        saveToLS(LS_KEYS.users, users.value)
      }
    } catch (err) {
      error.value = err.message || 'Erreur lors du changement de rôle'
    }
  }

  const toggleUserPremium = (id) => {
    error.value = null
    try {
      const u = users.value.find((u) => u.id === id)
      if (u) {
        u.isPremium = !u.isPremium
        saveToLS(LS_KEYS.users, users.value)
      }
    } catch (err) {
      error.value = err.message || 'Erreur lors du changement premium'
    }
  }

  const deleteUser = (id) => {
    error.value = null
    try {
      // TODO: remplacer par `await api.delete(`/admin/users/${id}`)`
      users.value = users.value.filter((u) => u.id !== id)
      saveToLS(LS_KEYS.users, users.value)
    } catch (err) {
      error.value = err.message || "Erreur lors de la suppression de l'utilisateur"
    }
  }

  // ── Gestion Cartes ─────────────────────────────────────────────────────────
  const approveCard = (id) => {
    error.value = null
    try {
      const c = cards.value.find((c) => c.id === id)
      if (c) {
        c.status = 'approved'
        c.flagged = false
        saveToLS(LS_KEYS.cards, cards.value)
      }
    } catch (err) {
      error.value = err.message || "Erreur lors de l'approbation"
    }
  }

  const flagCard = (id) => {
    error.value = null
    try {
      const c = cards.value.find((c) => c.id === id)
      if (c) {
        c.flagged = !c.flagged
        saveToLS(LS_KEYS.cards, cards.value)
      }
    } catch (err) {
      error.value = err.message || 'Erreur lors du signalement'
    }
  }

  const deleteCard = (id) => {
    error.value = null
    try {
      // TODO: remplacer par `await api.delete(`/admin/cards/${id}`)`
      cards.value = cards.value.filter((c) => c.id !== id)
      saveToLS(LS_KEYS.cards, cards.value)
    } catch (err) {
      error.value = err.message || 'Erreur lors de la suppression de la carte'
    }
  }

  // ── Gestion Templates ──────────────────────────────────────────────────────
  const addTemplate = (template) => {
    error.value = null
    try {
      // TODO: remplacer par `const res = await api.post('/admin/templates', template)`
      const newT = {
        id: `t${Date.now()}`,
        usageCount: 0,
        active: true,
        createdAt: new Date().toISOString(),
        ...template,
      }
      templates.value.unshift(newT)
      saveToLS(LS_KEYS.templates, templates.value)
      return newT
    } catch (err) {
      error.value = err.message || "Erreur lors de l'ajout du template"
    }
  }

  const updateTemplate = (id, patch) => {
    error.value = null
    try {
      const t = templates.value.find((t) => t.id === id)
      if (t) {
        Object.assign(t, patch)
        saveToLS(LS_KEYS.templates, templates.value)
      }
    } catch (err) {
      error.value = err.message || 'Erreur lors de la mise à jour du template'
    }
  }

  const deleteTemplate = (id) => {
    error.value = null
    try {
      templates.value = templates.value.filter((t) => t.id !== id)
      saveToLS(LS_KEYS.templates, templates.value)
    } catch (err) {
      error.value = err.message || 'Erreur lors de la suppression du template'
    }
  }

  const toggleTemplatePremium = (id) => {
    error.value = null
    try {
      const t = templates.value.find((t) => t.id === id)
      if (t) {
        t.isPremium = !t.isPremium
        saveToLS(LS_KEYS.templates, templates.value)
      }
    } catch (err) {
      error.value = err.message || 'Erreur lors du changement premium'
    }
  }

  // ── Paramètres système ─────────────────────────────────────────────────────
  const updateSettings = (patch) => {
    error.value = null
    try {
      // TODO: remplacer par `await api.put('/admin/settings', patch)`
      Object.assign(settings.value, patch)
      saveToLS(LS_KEYS.settings, settings.value)
    } catch (err) {
      error.value = err.message || 'Erreur lors de la mise à jour des paramètres'
    }
  }

  const resetSettings = () => {
    error.value = null
    try {
      settings.value = { ...SEED_SETTINGS }
      saveToLS(LS_KEYS.settings, settings.value)
    } catch (err) {
      error.value = err.message || 'Erreur lors de la réinitialisation'
    }
  }

  // ── Simulation loading (UX) ────────────────────────────────────────────────
  const withLoading = async (fn) => {
    isLoading.value = true
    await new Promise((r) => setTimeout(r, 300))
    try {
      await fn()
    } finally {
      isLoading.value = false
    }
  }

  return {
    users,
    cards,
    templates,
    settings,
    stats,
    recentActivity,
    isLoading,
    error,
    blockUser,
    unblockUser,
    toggleUserRole,
    toggleUserPremium,
    deleteUser,
    approveCard,
    flagCard,
    deleteCard,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplatePremium,
    updateSettings,
    resetSettings,
    withLoading,
  }
})
