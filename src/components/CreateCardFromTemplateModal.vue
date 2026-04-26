<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')" />

        <!-- Modal -->
        <div
          class="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-base-100 border border-base-300"
          @click.stop
        >
          <!-- Header -->
          <div
            class="px-6 py-4 flex items-center justify-between border-b border-base-300 bg-base-200/40"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary"
              >
                <Plus class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-base-content">
                  Créer une carte
                </h2>
                <p class="text-xs text-base-content/40">
                  Depuis le modèle <span class="font-semibold">{{ templateModel.name }}</span>
                </p>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="p-2 rounded-lg transition-colors text-base-content/40 hover:bg-base-200 hover:text-base-content"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto custom-scrollbar">
            <!-- Nom de la carte -->
            <div class="mb-5">
              <label
                class="block text-sm font-medium mb-1.5 text-base-content/70"
                >Nom de la carte</label
              >
              <input
                v-model="cardName"
                type="text"
                class="w-full px-3 py-2.5 rounded-xl border text-sm transition-colors outline-none"
                :class="[
                  formErrors._cardName
                    ? 'border-error'
                    : 'border-base-300 focus:border-primary',
                  'bg-base-100 text-base-content placeholder:text-base-content/40',
                ]"
                placeholder="Ex. Carte de Jean"
                @blur="formErrors._cardName = validateField('cardName', cardName)"
              />
              <p v-if="formErrors._cardName" class="text-[11px] text-red-500 mt-1">{{ formErrors._cardName }}</p>
            </div>

            <!-- Diviseur -->
            <div class="border-t my-6 border-base-300"></div>

            <!-- Champs configurés -->
            <h3 class="text-sm font-bold mb-4 text-base-content/90">
              Informations de contact
            </h3>

            <div class="space-y-4">
              <div v-for="f in fieldsFromTemplate" :key="f.role">
                <label
                  class="block text-sm font-medium mb-1.5 text-base-content/70"
                >
                  {{ f.label }} <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="formData[f.role]"
                  type="text"
                  required
                  class="w-full px-3 py-2.5 rounded-xl border text-sm transition-colors outline-none"
                  :class="[
                    formErrors[f.role]
                      ? 'border-error'
                      : 'border-base-300 focus:border-primary',
                    'bg-base-100 text-base-content',
                  ]"
                  @blur="validateFormField(f.role, formData[f.role])"
                />
                <p v-if="formErrors[f.role]" class="text-[11px] text-red-500 mt-1">{{ formErrors[f.role] }}</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="px-6 py-4 flex gap-3 border-t border-base-300 bg-base-200/50"
          >
            <button
              @click="$emit('close')"
              class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors bg-base-200 text-base-content/70 hover:bg-base-300"
            >
              Annuler
            </button>
            <button
              @click="handleGenerate"
              :disabled="isGenerating || !cardName || !allFieldsFilled"
              class="flex-1 flex gap-2 items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              :class="[
                isGenerating
                  ? 'bg-flame-400'
                  : 'bg-flame-500 hover:bg-flame-600 shadow-md hover:shadow-lg shadow-flame-500/20',
              ]"
            >
              <Loader2 v-if="isGenerating" class="w-4 h-4 animate-spin" />
              <Check v-else class="w-4 h-4" />
              <span>Générer la carte</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, X, Loader2, Check } from 'lucide-vue-next'
import { useCardsStore } from '@/stores/cards'
import { useNotificationStore } from '@/stores/notificationStore'
import { konvaToCardEl, ROLE_LABELS } from '@/utils/cardElements'
import { validateField, roleToValidationType } from '@/utils/validators'

const props = defineProps({
  visible: { type: Boolean, default: false },
  dark: { type: Boolean, default: false },
  templateModel: { type: Object, required: true },
})

const emit = defineEmits(['close', 'generated'])

const cardsStore = useCardsStore()
const notificationStore = useNotificationStore()

const isGenerating = ref(false)
const cardName = ref('Nouvelle carte')
const formData = ref({})
// TODO backend : valider les champs de contact côté serveur (POST /api/cards)
const formErrors = reactive({})

// Scan editorData elements for text/contact elements with roles, merge with custom fields
const fieldsFromTemplate = computed(() => {
  const editorData = props.templateModel.editorData
  const allEls = [
    ...(editorData?.elements?.recto || []),
    ...(editorData?.elements?.verso || []),
  ]
  // seen tracks raw ids (without "custom_" prefix) for custom fields, roles for standard fields
  const seen = new Set()
  const result = []

  for (const el of allEls) {
    if (!((el.type === 'text' || el.type === 'contact') && el.role)) continue

    if (el.role.startsWith('custom_')) {
      // Custom field element — use raw id as form key, look up label from fieldConfig.customFields
      const cfId = el.role.replace('custom_', '')
      if (seen.has(cfId)) continue
      seen.add(cfId)
      const cf = props.templateModel.fieldConfig?.customFields?.find((c) => c.id === cfId)
      if (cf) result.push({ role: cfId, label: cf.label })
    } else {
      if (seen.has(el.role)) continue
      seen.add(el.role)
      const customLabel = props.templateModel.fieldConfig?.activeStandardFields?.find(
        (sf) => sf.role === el.role,
      )?.label
      result.push({ role: el.role, label: customLabel || ROLE_LABELS[el.role] || el.role })
    }
  }

  // Add custom fields from fieldConfig that have no canvas element (e.g. value was empty at save)
  for (const cf of props.templateModel.fieldConfig?.customFields || []) {
    if (!seen.has(cf.id)) {
      seen.add(cf.id)
      result.push({ role: cf.id, label: cf.label })
    }
  }

  return result
})

const allFieldsFilled = computed(() =>
  fieldsFromTemplate.value.every((f) => (formData.value[f.role] || '').trim() !== ''),
)

onMounted(() => {
  fieldsFromTemplate.value.forEach((f) => (formData.value[f.role] = ''))
})

function validateFormField(role, value) {
  formErrors[role] = validateField(roleToValidationType(role), value)
}

function validateAllFields() {
  let valid = true
  const nameErr = validateField('cardName', cardName.value)
  formErrors._cardName = nameErr
  if (nameErr || !cardName.value.trim()) valid = false
  for (const f of fieldsFromTemplate.value) {
    const err = validateField(roleToValidationType(f.role), formData.value[f.role])
    formErrors[f.role] = err
    if (err) valid = false
  }
  return valid
}

function replaceTextVariables(elements, rowData) {
  return (elements || []).map((el) => {
    if ((el.type !== 'text' && el.type !== 'contact') || !el.role) return el
    const role = el.role
    let newText = el.text
    if (rowData[role] !== undefined && rowData[role] !== '') {
      newText = String(rowData[role])
    }
    return { ...el, text: newText }
  })
}

async function handleGenerate() {
  if (!validateAllFields()) {
    notificationStore.error('Veuillez corriger les erreurs dans le formulaire')
    return
  }
  isGenerating.value = true

  try {
    const editorData = props.templateModel.editorData
    if (!editorData) throw new Error("Le modèle n'a pas de données valides.")

    const cw = editorData.cardWidth || 680
    const ch = editorData.cardHeight || 429

    // Flatten form data (all fields unified)
    const rowData = { ...formData.value }
    // Canvas elements store custom field roles as "custom_{id}" but formData keys are raw ids.
    // Add prefixed versions so replaceTextVariables can match them.
    for (const cf of props.templateModel.fieldConfig?.customFields || []) {
      if (rowData[cf.id] !== undefined) rowData[`custom_${cf.id}`] = rowData[cf.id]
    }

    // Replace text variables in Konva elements
    const newRecto = replaceTextVariables(editorData.elements?.recto, rowData)
    const newVerso = replaceTextVariables(editorData.elements?.verso, rowData)

    // Convert Konva px → BusinessCard % format
    const pctRecto = newRecto.map((el, i) => konvaToCardEl(el, cw, ch, i)).filter(Boolean)
    const pctVerso = newVerso.map((el, i) => konvaToCardEl(el, cw, ch, i)).filter(Boolean)

    // Extract contact info from converted elements
    const contact = {}
    const ROLE_KEYS = [
      'firstName',
      'lastName',
      'title',
      'company',
      'email',
      'phone',
      'website',
      'address',
    ]
    ROLE_KEYS.forEach((role) => {
      const el = [...pctRecto, ...pctVerso].find((e) => e.role === role)
      if (el && el.text) contact[role] = el.text
    })

    if (contact.firstName || contact.lastName) {
      contact.fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ')
    }

    const payload = {
      name: cardName.value,
      template: props.templateModel.templateSlug || 'blank',
      isPublic: false,
      templateModelId: props.templateModel.id,
      data: {
        elements: pctRecto,
        versoElements: pctVerso,
        backgrounds: editorData.backgrounds,
        contact,
        contactExtra:
          props.templateModel.fieldConfig?.customFields?.map((cf) => ({
            id: cf.id,
            label: cf.label,
            value: rowData[cf.id] || '',
          })) || [],
        fieldConfig: props.templateModel.fieldConfig
          ? JSON.parse(JSON.stringify(props.templateModel.fieldConfig))
          : undefined,
        editorData: {
          ...JSON.parse(JSON.stringify(editorData)),
          elements: { recto: newRecto, verso: newVerso },
        },
        orientation: editorData.orientation || (ch > cw ? 'portrait' : 'landscape'),
        cardWidth: cw,
        cardHeight: ch,
        cardBorderRadius: editorData.cardBorderRadius ?? 8,
      },
    }

    await cardsStore.addCard(payload)

    notificationStore.success('Carte générée avec succès !')
    emit('generated')
    emit('close')
  } catch (error) {
    console.error(error)
    notificationStore.error(`Erreur: ${error.message}`)
  } finally {
    isGenerating.value = false
  }
}
</script>

<style scoped>
.modal-fade-enter-active {
  transition: all 0.2s ease-out;
}
.modal-fade-leave-active {
  transition: all 0.15s ease-in;
}
.modal-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
</style>
