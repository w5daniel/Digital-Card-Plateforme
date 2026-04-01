import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './authStore'
import { useCardsStore } from './cards'

const LS_PREFIX = 'digitalcard_userTemplates_'
const LS_PUBLIC_PREFIX = 'digitalcard_publicTemplate_'

export const MAX_FREE_TEMPLATES = 2

export const useUserTemplatesStore = defineStore('userTemplates', () => {
  const authStore = useAuthStore()

  // ── State ─────────────────────────────────────────────────────────────────
  const userTemplates = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // ── localStorage key for current user ─────────────────────────────────────
  function _lsKey() {
    const email = authStore.user?.email
    return email ? LS_PREFIX + email : null
  }

  function _save() {
    const key = _lsKey()
    if (key) {
      try {
        localStorage.setItem(key, JSON.stringify(userTemplates.value))
      } catch {
        /* quota — non-blocking */
      }
    }
  }

  // ── Load / clear ──────────────────────────────────────────────────────────
  function loadUserTemplates() {
    const key = _lsKey()
    if (!key) {
      userTemplates.value = []
      return
    }
    try {
      const raw = localStorage.getItem(key)
      userTemplates.value = raw ? JSON.parse(raw) : []
    } catch {
      userTemplates.value = []
    }
  }

  function clearTemplates() {
    userTemplates.value = []
  }

  // React to user changes (login / logout)
  watch(
    () => authStore.user?.email,
    (email) => {
      if (email) loadUserTemplates()
      else clearTemplates()
    },
    { immediate: true },
  )

  // Auto-persist
  watch(userTemplates, () => _save(), { deep: true })

  // ── Getters ───────────────────────────────────────────────────────────────

  /** All templates (including auto-generated) */
  const allTemplates = computed(() => userTemplates.value)

  /** Only manually created templates (visible by default in dashboard) */
  const visibleTemplates = computed(() => userTemplates.value.filter((t) => !t.isAuto))

  /** Only auto-generated templates (hidden by default) */
  const autoTemplates = computed(() => userTemplates.value.filter((t) => t.isAuto))

  /** Total count (excluding auto) for limit checks */
  const manualCount = computed(() => visibleTemplates.value.length)

  /** Can the user create a new template? */
  const canCreateTemplate = computed(() => {
    if (authStore.isPremium || authStore.isAdmin) return true
    // Auto-generated templates don't count toward the Free limit
    return manualCount.value < MAX_FREE_TEMPLATES
  })

  // ── CRUD ──────────────────────────────────────────────────────────────────

  /**
   * Create a new user template (model).
   * @param {Object} data - Template data
   * @param {string} data.name - Template name
   * @param {Object} data.editorData - Full editor state snapshot
   * @param {Object} data.fieldConfig - Active fields configuration
   * @param {string} [data.templateSlug] - Base gallery template slug
   * @param {boolean} [data.isAuto=false] - Auto-generated (hidden by default)
   * @returns {Object} The created template
   */
  async function addTemplate(data) {
    isLoading.value = true
    error.value = null

    try {
      // Check limit for manual templates
      if (!data.isAuto && !canCreateTemplate.value) {
        throw new Error(
          `Limite atteinte (${MAX_FREE_TEMPLATES} modèles). Passez au plan Premium pour créer plus de modèles.`,
        )
      }

      const template = {
        id: Date.now(),
        name: data.name || 'Mon modèle',
        isAuto: data.isAuto || false,
        isPublic: data.isPublic || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        editorData: JSON.parse(JSON.stringify(data.editorData)),
        fieldConfig: JSON.parse(
          JSON.stringify(data.fieldConfig || { activeStandardFields: [], customFields: [] }),
        ),
        templateSlug: data.templateSlug || null,
      }

      userTemplates.value.push(template)
      _syncPublicSnapshot(template)
      return template
    } catch (err) {
      error.value = err.message || 'Erreur lors de la création du modèle'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing template.
   */
  async function updateTemplate(templateId, updates) {
    isLoading.value = true
    error.value = null

    try {
      const idx = userTemplates.value.findIndex((t) => t.id === templateId)
      if (idx === -1) throw new Error('Modèle introuvable')

      userTemplates.value[idx] = {
        ...userTemplates.value[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      // Deep-clone editorData/fieldConfig if present
      if (updates.editorData) {
        userTemplates.value[idx].editorData = JSON.parse(JSON.stringify(updates.editorData))
      }
      if (updates.fieldConfig) {
        userTemplates.value[idx].fieldConfig = JSON.parse(JSON.stringify(updates.fieldConfig))
      }
      _syncPublicSnapshot(userTemplates.value[idx])
      return userTemplates.value[idx]
    } catch (err) {
      error.value = err.message || 'Erreur lors de la mise à jour du modèle'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a template.
   */
  async function deleteTemplate(templateId) {
    isLoading.value = true
    error.value = null

    try {
      const idx = userTemplates.value.findIndex((t) => t.id === templateId)
      if (idx === -1) throw new Error('Modèle introuvable')
      _unpublishSnapshot(templateId)
      userTemplates.value.splice(idx, 1)
      return true
    } catch (err) {
      error.value = err.message || 'Erreur lors de la suppression du modèle'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get a template by its ID.
   */
  function getTemplateById(templateId) {
    return userTemplates.value.find((t) => t.id === templateId) || null
  }

  /**
   * Count cards created from a template.
   * Reads from the current user's cards in localStorage.
   */
  function getCardsCountForTemplate(templateId) {
    const cardsStore = useCardsStore()
    return cardsStore.getCardsByTemplateModel(templateId).length
  }

  /**
   * Batch-create cards from a template using a list of contacts.
   * @param {number} templateId - ID of the source template
   * @param {Array<Object>} contactsList - Array of { firstName, lastName, ... } objects
   * @returns {{ created: number, errors: string[] }}
   */
  async function createCardsFromTemplate(templateId, contactsList) {
    const template = getTemplateById(templateId)
    if (!template) throw new Error('Modèle introuvable')

    const cardsStore = useCardsStore()
    const editorDataBase = template.editorData
    const created = []
    const errors = []

    for (const contact of contactsList) {
      try {
        const editorData = JSON.parse(JSON.stringify(editorDataBase))

        // Inject contact values into text elements matching roles
        const fillElements = (elements) => {
          if (!elements) return
          for (const el of elements) {
            if (el.type !== 'text') continue
            if (el.role && contact[el.role] !== undefined) {
              el.text = String(contact[el.role])
            }
            // Custom fields: role = 'custom_{id}'
            if (el.role?.startsWith('custom_')) {
              const cfId = el.role.replace('custom_', '')
              const cf = template.fieldConfig?.customFields?.find((c) => c.id === cfId)
              if (cf && contact[cf.label] !== undefined) {
                el.text = String(contact[cf.label])
              }
            }
          }
        }

        fillElements(editorData.elements?.recto)
        fillElements(editorData.elements?.verso)

        const nameStr =
          contact.firstName && contact.lastName
            ? `${contact.firstName} ${contact.lastName}`
            : contact.email || `Carte ${Date.now().toString().slice(-4)}`

        const rectoEls = editorData.elements?.recto || []
        const versoEls = editorData.elements?.verso || []

        const contactExtra =
          template.fieldConfig?.customFields?.map((c) => ({
            id: c.id,
            label: c.label,
            value: contact[c.label] ?? '',
          })) || []

        const card = await cardsStore.addCard({
          name: `Lot - ${nameStr}`,
          template: template.templateSlug || 'blank',
          isPublic: false,
          templateModelId: template.id,
          data: {
            elements: rectoEls,
            versoElements: versoEls,
            backgrounds: editorData.backgrounds,
            contactExtra,
            editorData,
            showQR: [...rectoEls, ...versoEls].some((e) => e.type === 'qr'),
            orientation:
              editorData.orientation ||
              (editorData.cardHeight > editorData.cardWidth ? 'portrait' : 'landscape'),
            cardWidth: editorData.cardWidth || 680,
            cardHeight: editorData.cardHeight || 429,
          },
        })
        created.push(card)
      } catch (err) {
        errors.push(`${contact.firstName || ''} ${contact.lastName || ''}: ${err.message}`)
      }
    }

    return { created: created.length, errors }
  }

  // ── Public snapshots (community) ────────────────────────────────────────

  function _syncPublicSnapshot(tpl) {
    const key = LS_PUBLIC_PREFIX + tpl.id
    if (tpl.isPublic) {
      try {
        const snapshot = {
          ...JSON.parse(JSON.stringify(tpl)),
          ownerEmail: authStore.user?.email || 'unknown',
          ownerName: authStore.user?.name || authStore.user?.email || 'Anonyme',
        }
        localStorage.setItem(key, JSON.stringify(snapshot))
      } catch { /* quota */ }
    } else {
      localStorage.removeItem(key)
    }
  }

  function _unpublishSnapshot(templateId) {
    localStorage.removeItem(LS_PUBLIC_PREFIX + templateId)
  }

  /**
   * Scan localStorage for public templates from OTHER users.
   */
  function getAllCommunityTemplates() {
    const currentEmail = authStore.user?.email
    const result = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key.startsWith(LS_PUBLIC_PREFIX)) continue
      try {
        const tpl = JSON.parse(localStorage.getItem(key))
        if (tpl && tpl.isPublic) {
          result.push(tpl)
        }
      } catch { /* skip corrupt entries */ }
    }
    return result
  }

  return {
    // State
    userTemplates,
    isLoading,
    error,

    // Getters
    allTemplates,
    visibleTemplates,
    autoTemplates,
    manualCount,
    canCreateTemplate,

    // Methods
    loadUserTemplates,
    clearTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    getCardsCountForTemplate,
    createCardsFromTemplate,
    getAllCommunityTemplates,
  }
})
