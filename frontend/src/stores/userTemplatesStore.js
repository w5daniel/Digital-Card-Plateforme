import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './authStore'
import { useCardsStore } from './cards'
import { hasStyledInfoFields } from '@/utils/cardElements'
import { konvaToCardEl } from '@/utils/cardElements'
import templatesApi from '@/api/templates'
import { updateTemplate as adminUpdateTemplate } from '@/api/admin'

export const MAX_FREE_TEMPLATES = 2

export const useUserTemplatesStore = defineStore('userTemplates', () => {
  const authStore = useAuthStore()

  // ── State ─────────────────────────────────────────────────────────────────
  const userTemplates = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const communityVersion = ref(0) // kept for backwards compat with GalleryView

  // ── Normalization ─────────────────────────────────────────────────────────

  function _normalizeTemplate(apiTpl) {
    return {
      id:           apiTpl.id,
      name:         apiTpl.name,
      isAuto:       apiTpl.is_auto    ?? false,
      isPublic:     apiTpl.is_public  ?? false,
      isGallery:    apiTpl.is_gallery ?? false,
      isPremium:    apiTpl.is_premium ?? false,
      category:     apiTpl.category   ?? null,
      slug:         apiTpl.slug       ?? null,
      createdAt:    apiTpl.created_at,
      updatedAt:    apiTpl.updated_at,
      ownerId:      apiTpl.user_id,
      ownerName:    apiTpl.user?.name  ?? null,
      ownerEmail:   apiTpl.user?.email ?? null,
      editorData:   apiTpl.meta        ?? {},
      fieldConfig:  apiTpl.field_config ?? { activeStandardFields: [], customFields: [] },
      templateSlug: apiTpl.meta?.templateSlug ?? null,
    }
  }

  // ── Load / clear ──────────────────────────────────────────────────────────

  async function loadUserTemplates() {
    if (!authStore.user) return
    isLoading.value = true
    error.value = null
    try {
      const { data } = await templatesApi.list()
      userTemplates.value = data.templates.map(_normalizeTemplate)
    } catch (err) {
      error.value = err.message || 'Erreur lors du chargement des modèles'
    } finally {
      isLoading.value = false
    }
  }

  function clearTemplates() {
    userTemplates.value = []
  }

  watch(
    () => authStore.user?.email,
    (email) => {
      if (email) loadUserTemplates()
      else clearTemplates()
    },
    { immediate: true },
  )

  // ── Getters ───────────────────────────────────────────────────────────────

  const allTemplates = computed(() => userTemplates.value)

  const visibleTemplates = computed(() => userTemplates.value.filter((t) => !t.isAuto))

  const autoTemplates = computed(() => userTemplates.value.filter((t) => t.isAuto))

  const manualCount = computed(() => visibleTemplates.value.length)

  const canCreateTemplate = computed(() => {
    if (authStore.isPremium || authStore.isAdmin) return true
    return manualCount.value < MAX_FREE_TEMPLATES
  })

  // ── CRUD ──────────────────────────────────────────────────────────────────

  /**
   * Create a new user template.
   * @param {Object} data
   * @param {string} data.name
   * @param {Object} data.editorData
   * @param {Object} data.fieldConfig
   * @param {string} [data.templateSlug]
   * @param {boolean} [data.isAuto=false]
   * @returns {Object} The created template
   */
  async function addTemplate(data) {
    isLoading.value = true
    error.value = null

    try {
      if (!data.isAuto && !canCreateTemplate.value) {
        throw new Error(
          `Limite atteinte (${MAX_FREE_TEMPLATES} modèles). Passez au plan Premium pour créer plus de modèles.`,
        )
      }

      const meta = data.editorData
        ? { ...JSON.parse(JSON.stringify(data.editorData)), templateSlug: data.templateSlug || null }
        : { templateSlug: data.templateSlug || null }

      const { data: res } = await templatesApi.create({
        name:         data.name || 'Mon modèle',
        meta,
        field_config: data.fieldConfig || { activeStandardFields: [], customFields: [] },
        is_public:    data.isPublic  || false,
        is_auto:      data.isAuto    || false,
      })

      const template = _normalizeTemplate(res.template)
      userTemplates.value.push(template)
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

      const payload = {}
      if (updates.name !== undefined) payload.name = updates.name
      if (updates.isPublic !== undefined) payload.is_public = updates.isPublic
      if (updates.isAuto !== undefined)   payload.is_auto   = updates.isAuto
      if (updates.editorData !== undefined) {
        const existing = userTemplates.value[idx]
        payload.meta = {
          ...JSON.parse(JSON.stringify(updates.editorData)),
          templateSlug: existing.templateSlug ?? null,
        }
      }
      if (updates.fieldConfig !== undefined) {
        payload.field_config = JSON.parse(JSON.stringify(updates.fieldConfig))
      }

      const { data: res } = await templatesApi.update(templateId, payload)
      const updated = _normalizeTemplate(res.template)
      userTemplates.value[idx] = updated
      return updated
    } catch (err) {
      error.value = err.message || 'Erreur lors de la mise à jour du modèle'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Toggle a template's public/private visibility.
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
          "Confidentialité : Les modèles comportant des textes stylés dans les champs d'informations (nom, email, etc.) ne peuvent pas être publiés. Veuillez retirer le style de ces champs ou enregistrer le modèle en mode privé.",
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
      await templatesApi.remove(templateId)
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
   * Get a template by ID. Checks local store first, then fetches from API.
   * Supports both own templates and public/community templates.
   */
  async function getTemplateById(templateId) {
    const local = userTemplates.value.find((t) => t.id === templateId)
    if (local) return local
    try {
      const { data } = await templatesApi.get(templateId)
      return _normalizeTemplate(data.template)
    } catch {
      return null
    }
  }

  /**
   * Count cards created from a template.
   */
  function getCardsCountForTemplate(templateId) {
    const cardsStore = useCardsStore()
    return cardsStore.getCardsByTemplateModel(templateId).length
  }

  /**
   * Batch-create cards from a template using a list of contacts.
   */
  async function createCardsFromTemplate(templateId, contactsList) {
    const template = await getTemplateById(templateId)
    if (!template) throw new Error('Modèle introuvable')

    const cardsStore = useCardsStore()
    const editorDataBase = template.editorData
    const created = []
    const errors = []

    for (const contact of contactsList) {
      try {
        const editorData = JSON.parse(JSON.stringify(editorDataBase))

        const fillElements = (elements) => {
          if (!elements) return
          for (const el of elements) {
            if (el.type !== 'text') continue
            if (el.role && contact[el.role] !== undefined) {
              el.text = String(contact[el.role])
            }
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
            orientation: editorData.orientation || (ch > cw ? 'portrait' : 'landscape'),
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

  // ── Community templates ───────────────────────────────────────────────────

  /**
   * Fetch all community templates (is_public=true, is_gallery=false) from the API.
   */
  async function getAllCommunityTemplates() {
    try {
      const { data } = await templatesApi.community()
      return data.templates.map(_normalizeTemplate)
    } catch {
      return []
    }
  }

  /**
   * Admin : retire un template de la galerie communauté (is_public → false).
   * Résout le stub Phase 4.3. Appelle PATCH /api/admin/templates/{id}.
   */
  async function adminRemoveCommunityTemplate(templateId) {
    await adminUpdateTemplate(templateId, { is_public: false })
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
})
