<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')" />

        <!-- Modal -->
        <div
          class="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          :class="dark ? 'bg-gray-900 border border-gray-700' : 'bg-white'"
          @click.stop
        >
          <!-- Header -->
          <div
            class="px-6 py-4 flex items-center justify-between border-b"
            :class="dark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center"
                :class="dark ? 'bg-flame-900/30 text-flame-400' : 'bg-flame-100 text-flame-600'"
              >
                <Plus class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-lg font-bold" :class="dark ? 'text-white' : 'text-gray-900'">
                  Créer une carte
                </h2>
                <p class="text-xs" :class="dark ? 'text-gray-400' : 'text-gray-500'">
                  Depuis le modèle <span class="font-semibold">{{ templateModel.name }}</span>
                </p>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="p-2 rounded-lg transition-colors"
              :class="
                dark
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-500 hover:bg-gray-200'
              "
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto custom-scrollbar">
            <!-- Nom de la carte -->
            <div class="mb-5">
              <label
                class="block text-sm font-medium mb-1.5"
                :class="dark ? 'text-gray-300' : 'text-gray-700'"
                >Nom de la carte</label
              >
              <input
                v-model="cardName"
                type="text"
                class="w-full px-3 py-2.5 rounded-xl border text-sm transition-colors"
                :class="
                  dark
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-flame-500 outline-none'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-flame-500 outline-none'
                "
                placeholder="Ex. Carte de Jean"
              />
            </div>

            <!-- Diviseur -->
            <div class="border-t my-6" :class="dark ? 'border-gray-800' : 'border-gray-100'"></div>

            <!-- Champs configurés -->
            <h3 class="text-sm font-bold mb-4" :class="dark ? 'text-gray-200' : 'text-gray-800'">
              Informations de contact
            </h3>

            <div class="space-y-4">
              <div v-for="f in fieldsFromTemplate" :key="f.role">
                <label
                  class="block text-sm font-medium mb-1.5"
                  :class="dark ? 'text-gray-300' : 'text-gray-700'"
                >
                  {{ f.label }} <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="formData[f.role]"
                  type="text"
                  required
                  class="w-full px-3 py-2.5 rounded-xl border text-sm transition-colors"
                  :class="
                    dark
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-flame-500 outline-none'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-flame-500 outline-none'
                  "
                />
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="px-6 py-4 flex gap-3 border-t"
            :class="dark ? 'border-gray-800 bg-gray-900/80' : 'border-gray-100 bg-gray-50/80'"
          >
            <button
              @click="$emit('close')"
              class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              :class="
                dark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              "
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
import { ref, computed, onMounted } from 'vue'
import { Plus, X, Loader2, Check } from 'lucide-vue-next'
import { useCardsStore } from '@/stores/cards'
import { useNotificationStore } from '@/stores/notificationStore'
import { konvaToCardEl, ROLE_LABELS } from '@/utils/cardElements'

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

// Scan editorData elements for text/contact elements with roles, merge with custom fields
const fieldsFromTemplate = computed(() => {
  const editorData = props.templateModel.editorData
  const allEls = [
    ...(editorData?.elements?.recto || []),
    ...(editorData?.elements?.verso || []),
  ]
  const seen = new Set()
  const result = []
  for (const el of allEls) {
    if ((el.type === 'text' || el.type === 'contact') && el.role && !seen.has(el.role)) {
      seen.add(el.role)
      result.push({ role: el.role, label: ROLE_LABELS[el.role] || el.role })
    }
  }
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
  isGenerating.value = true

  try {
    const editorData = props.templateModel.editorData
    if (!editorData) throw new Error("Le modèle n'a pas de données valides.")

    const cw = editorData.cardWidth || 680
    const ch = editorData.cardHeight || 429

    // Flatten form data (all fields unified)
    const rowData = { ...formData.value }

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
