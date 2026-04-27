import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './authStore'
import { useCardsStore } from './cards'
import { useNotificationStore } from './notificationStore'
import { ADMIN_EMAIL } from '../data/mockData'
import { konvaToCardEl, CONTACT_ROLES, hasStyledInfoFields } from '@/utils/cardElements'

const LS_PREFIX = 'digitalcard_userTemplates_'
const LS_PUBLIC_PREFIX = 'digitalcard_publicTemplate_'
const LS_PENDING_NOTIF_PREFIX = 'digitalcard_pendingNotifications_'

export const MAX_FREE_TEMPLATES = 2

export const useUserTemplatesStore = defineStore('userTemplates', () => {
  const authStore = useAuthStore()

  // ── State ─────────────────────────────────────────────────────────────────
  const userTemplates = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  // Compteur réactif incrémenté à chaque modification des snapshots communauté
  const communityVersion = ref(0)

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
      if (email) {
        loadUserTemplates()
        _deliverPendingNotifications(email)
      } else {
        clearTemplates()
      }
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
        id: crypto.randomUUID(),
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
   * Toggle a template's public/private visibility.
   * If made public, writes the community snapshot.
   * If made private, removes the community snapshot.
   */
  async function toggleTemplateVisibility(templateId) {
    const tpl = userTemplates.value.find((t) => t.id === templateId)
    if (!tpl) throw new Error('Modèle introuvable')
    const goingPublic = !tpl.isPublic
    if (goingPublic) {
      if (!authStore.isPremium && !authStore.isAdmin) {
        throw new Error('La publication de modèles dans la communauté est réservée aux membres Premium.')
      }
      const allEls = [
        ...(tpl.editorData?.elements?.recto ?? []),
        ...(tpl.editorData?.elements?.verso ?? []),
      ]
      if (hasStyledInfoFields(allEls)) {
        throw new Error(
          'Confidentialité : Les modèles comportant des textes stylés dans les champs d\'informations (nom, email, etc.) ne peuvent pas être publiés. Veuillez retirer le style de ces champs ou enregistrer le modèle en mode privé.'
        )
      }
    }
    return updateTemplate(templateId, { isPublic: !tpl.isPublic })
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
   * TODO backend : valider chaque contact de contactsList (email, phone, name formats) côté serveur
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

        const rawRectoEls = editorData.elements?.recto || []
        const rawVersoEls = editorData.elements?.verso || []

        // Convert Konva px → BusinessCard % format (like CreateCardFromTemplateModal)
        const cw = editorData.cardWidth || 680
        const ch = editorData.cardHeight || 429
        const rectoEls = rawRectoEls.map((el, i) => konvaToCardEl(el, cw, ch, i)).filter(Boolean)
        const versoEls = rawVersoEls.map((el, i) => konvaToCardEl(el, cw, ch, i)).filter(Boolean)

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
            showQR: [...rawRectoEls, ...rawVersoEls].some((e) => e.type === 'qr'),
            orientation:
              editorData.orientation ||
              (ch > cw ? 'portrait' : 'landscape'),
            cardWidth: cw,
            cardHeight: ch,
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
    // Les modèles admin ne vont jamais dans la communauté (ils sont officiels)
    if (tpl.isPublic && (authStore.isPremium || authStore.isAdmin)) {
      try {
        const snapshot = {
          ...JSON.parse(JSON.stringify(tpl)),
          ownerEmail: authStore.user?.email || 'unknown',
          ownerName: authStore.user?.name || authStore.user?.email || 'Anonyme',
          ownerRole: authStore.user?.role || 'user',
        }
        localStorage.setItem(key, JSON.stringify(snapshot))
        communityVersion.value++
      } catch {
        const notifStore = useNotificationStore()
        notifStore.error('Espace de stockage insuffisant — le modèle ne peut pas être publié dans la communauté.')
      }
    } else {
      localStorage.removeItem(key)
      communityVersion.value++
    }
  }

  function _unpublishSnapshot(templateId) {
    localStorage.removeItem(LS_PUBLIC_PREFIX + templateId)
    communityVersion.value++
  }

  /**
   * Scan localStorage for public templates from OTHER users.
   */
  function getAllCommunityTemplates() {
    void communityVersion.value // dépendance réactive — force recalcul après suppression
    const result = []
    const keysToScan = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(LS_PUBLIC_PREFIX)) keysToScan.push(key)
    }
    for (const key of keysToScan) {
      try {
        const tpl = JSON.parse(localStorage.getItem(key))
        if (!tpl || !tpl.isPublic) continue
        // Exclure les modèles créés par un admin (ils sont officiels, pas communauté)
        const isAdminSnapshot = tpl.ownerRole === 'admin' || tpl.ownerEmail === ADMIN_EMAIL
        if (isAdminSnapshot) {
          localStorage.removeItem(key)
          continue
        }
        result.push(tpl)
      } catch { /* skip corrupt entries */ }
    }
    return result
  }

  function adminRemoveCommunityTemplate(templateId) {
    let ownerEmail = null
    let templateName = null
    try {
      const raw = localStorage.getItem(LS_PUBLIC_PREFIX + templateId)
      if (raw) {
        const tpl = JSON.parse(raw)
        ownerEmail = tpl.ownerEmail || null
        templateName = tpl.name || null
      }
    } catch { /* ignore */ }

    localStorage.removeItem(LS_PUBLIC_PREFIX + templateId)

    if (ownerEmail) {
      _writePendingNotification(ownerEmail, templateName)
    }

    communityVersion.value++
  }

  return {
    // State
    userTemplates,
    isLoading,
    error,
    communityVersion,

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
    toggleTemplateVisibility,
    getTemplateById,
    getCardsCountForTemplate,
    createCardsFromTemplate,
    getAllCommunityTemplates,
    adminRemoveCommunityTemplate,
  }

  function _writePendingNotification(ownerEmail, templateName) {
    const key = LS_PENDING_NOTIF_PREFIX + ownerEmail
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      existing.push({
        id: Date.now(),
        type: 'warning',
        message: templateName
          ? `Votre modèle "${templateName}" a été retiré de la galerie communauté par un administrateur.`
          : `Un de vos modèles a été retiré de la galerie communauté par un administrateur.`,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem(key, JSON.stringify(existing))
    } catch { /* quota */ }
  }

  function _deliverPendingNotifications(email) {
    const key = LS_PENDING_NOTIF_PREFIX + email
    try {
      const pending = JSON.parse(localStorage.getItem(key) || '[]')
      if (!pending.length) return
      const notifStore = useNotificationStore()
      for (const n of pending) {
        notifStore.warning(n.message, 6000)
      }
      localStorage.removeItem(key)
    } catch { /* ignore */ }
  }
})
