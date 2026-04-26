<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>
        <div
          class="relative w-full max-w-2xl bg-base-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <!-- Header -->
          <div
            class="px-6 py-4 border-b flex justify-between items-center"
            class="border-base-300"
          >
            <h3
              class="text-xl font-bold flex items-center gap-2"
              class="text-base-content"
            >
              <Users class="w-5 h-5 text-flame-500" />
              Génération en lot
            </h3>
            <button
              @click="$emit('close')"
              class="p-1 rounded-lg transition-colors"
              class="text-base-content/40 hover:bg-base-200"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Steps indicator -->
          <div class="px-6 pt-4 flex items-center gap-2 text-xs font-medium">
            <template v-for="(label, i) in stepLabels" :key="i">
              <span v-if="i > 0" class="text-base-content/40">/</span>
              <span
                :class="[
                  i === step
                    ? 'text-primary font-bold'
                    : i < step
                      ? 'text-base-content/60'
                      : 'text-base-content/40',
                ]"
                >{{ i + 1 }}. {{ label }}</span
              >
            </template>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto flex-1">
            <!-- ═══ STEP 0 — Upload ═══ -->
            <template v-if="step === 0">
              <p
                class="text-sm mb-6 leading-relaxed"
                class="text-base-content/60"
              >
                Importez un fichier Excel ou CSV contenant les données de vos contacts.
              </p>

              <div class="mb-4">
                <button
                  @click="downloadTemplate"
                  class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all"
                  class="bg-base-200 border-base-300 text-base-content hover:bg-base-300"
                >
                  <Download class="w-4 h-4" />
                  Télécharger le modèle (.xlsx)
                </button>
              </div>

              <label
                class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all"
                :class="
                  'bg-base-200/50 border-base-300 hover:border-primary hover:bg-base-200'
                "
              >
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload class="w-8 h-8 mb-2 text-gray-400" />
                  <p class="text-sm mb-1" class="text-base-content/60">
                    <span class="font-semibold text-flame-500">Cliquez pour ajouter</span> ou
                    glissez-déposez
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">fichiers xlsx, xls ou csv</p>
                </div>
                <input
                  type="file"
                  ref="fileInput"
                  class="hidden"
                  accept=".xlsx,.xls,.csv"
                  @change="handleFileUpload"
                />
              </label>

              <div
                v-if="parsedData.length > 0"
                class="mt-4 p-4 rounded-xl border"
                class="bg-base-200 border-base-300"
              >
                <div class="flex items-center gap-3">
                  <CheckCircle2 class="w-6 h-6 text-emerald-500" />
                  <div>
                    <h4 class="text-sm font-bold" class="text-base-content">
                      Fichier prêt !
                    </h4>
                    <p class="text-xs" class="text-base-content/40">
                      {{ parsedData.length }} contact(s) — {{ excelHeaders.length }} colonne(s)
                      détectée(s).
                    </p>
                  </div>
                </div>
              </div>
            </template>

            <!-- ═══ STEP 1 — Mapping ═══ -->
            <template v-if="step === 1">
              <p
                class="text-sm mb-4 leading-relaxed"
                class="text-base-content/60"
              >
                Associez chaque colonne de votre fichier à un champ du modèle. La détection
                automatique est appliquée — ajustez si nécessaire.
              </p>

              <div class="space-y-3">
                <div v-for="header in excelHeaders" :key="header" class="flex items-center gap-3">
                  <span
                    class="w-36 truncate text-sm font-medium shrink-0"
                    class="text-base-content/80"
                    :title="header"
                    >{{ header }}</span
                  >
                  <ArrowRight class="w-4 h-4 shrink-0 text-gray-400" />
                  <select
                    v-model="columnMapping[header]"
                    class="flex-1 text-sm rounded-lg px-3 py-2 border bg-base-100 border-base-300 text-base-content"
                  >
                    <option value="">— Ignorer —</option>
                    <option v-for="f in templateFields" :key="f.role" :value="f.role">
                      {{ f.label }}
                    </option>
                  </select>
                </div>
              </div>

              <p v-if="mappedCount === 0" class="mt-4 text-xs text-amber-500">
                Aucune colonne associée. Au moins un champ doit être mappé.
              </p>
            </template>

            <!-- ═══ STEP 2 — Preview ═══ -->
            <template v-if="step === 2">
              <p
                class="text-sm mb-4 leading-relaxed"
                class="text-base-content/60"
              >
                Aperçu des {{ previewRows.length }} première(s) carte(s) sur
                {{ parsedData.length }} :
              </p>

              <div
                class="overflow-x-auto rounded-lg border"
                class="border-base-300"
              >
                <table class="w-full text-xs">
                  <thead>
                    <tr class="bg-base-200">
                      <th
                        class="px-3 py-2 text-left font-semibold"
                        class="text-base-content/60"
                      >
                        #
                      </th>
                      <th
                        v-for="f in mappedFields"
                        :key="f.role"
                        class="px-3 py-2 text-left font-semibold"
                        class="text-base-content/60"
                      >
                        {{ f.label }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, idx) in previewRows"
                      :key="idx"
                      class="border-t"
                      class="border-base-300"
                    >
                      <td class="px-3 py-2" class="text-base-content/40">
                        {{ idx + 1 }}
                      </td>
                      <td
                        v-for="f in mappedFields"
                        :key="f.role"
                        class="px-3 py-2"
                        class="text-base-content/80"
                      >
                        {{ getRowValue(row, f.role) || '—' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p
                v-if="parsedData.length > 5"
                class="text-xs mt-2"
                class="text-base-content/40"
              >
                ...et {{ parsedData.length - 5 }} autres contacts.
              </p>
            </template>

            <!-- ═══ STEP 3 — Result ═══ -->
            <template v-if="step === 3">
              <div v-if="isProcessing" class="flex flex-col items-center justify-center py-8">
                <Loader2 class="w-10 h-10 text-flame-500 animate-spin mb-3" />
                <span class="text-sm" class="text-base-content/40">
                  Génération en cours... ({{ processedCount }} / {{ parsedData.length }})
                </span>
              </div>

              <div v-else-if="generationResult" class="flex flex-col items-center py-8 gap-3">
                <CheckCircle2 class="w-12 h-12 text-emerald-500" />
                <h4 class="text-lg font-bold" class="text-base-content">
                  {{ generationResult.created }} carte(s) créée(s)
                </h4>
                <p
                  v-if="generationResult.errors.length > 0"
                  class="text-xs text-amber-500 text-center"
                >
                  {{ generationResult.errors.length }} erreur(s) :
                  <span v-for="(e, i) in generationResult.errors" :key="i" class="block">{{
                    e
                  }}</span>
                </p>
              </div>
            </template>
          </div>

          <!-- Actions -->
          <div
            class="px-6 py-4 border-t flex justify-between gap-3"
            class="border-base-300 bg-base-200/50"
          >
            <button
              v-if="step > 0 && step < 3"
              @click="step--"
              class="px-4 py-2 font-medium rounded-lg text-sm transition-colors"
              class="text-base-content/60 hover:bg-base-200"
            >
              Retour
            </button>
            <div v-else></div>

            <div class="flex gap-3">
              <button
                @click="$emit('close')"
                :disabled="isProcessing"
                class="px-4 py-2 font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
                :class="
                  text-base-content/60 hover:bg-base-200
                "
              >
                {{ step === 3 && !isProcessing ? 'Fermer' : 'Annuler' }}
              </button>

              <!-- Step 0: Next -->
              <button
                v-if="step === 0"
                @click="goToMapping"
                :disabled="parsedData.length === 0"
                class="px-4 py-2 font-medium rounded-lg text-sm bg-flame-500 text-white hover:bg-flame-600 transition-colors shadow flex gap-2 items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <ArrowRight class="w-4 h-4" />
              </button>

              <!-- Step 1: Next -->
              <button
                v-if="step === 1"
                @click="step = 2"
                :disabled="mappedCount === 0"
                class="px-4 py-2 font-medium rounded-lg text-sm bg-flame-500 text-white hover:bg-flame-600 transition-colors shadow flex gap-2 items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <ArrowRight class="w-4 h-4" />
              </button>

              <!-- Step 2: Generate -->
              <button
                v-if="step === 2"
                @click="generateCards"
                class="px-4 py-2 font-medium rounded-lg text-sm bg-flame-500 text-white hover:bg-flame-600 transition-colors shadow flex gap-2 items-center"
              >
                <Zap class="w-4 h-4" />
                Générer {{ parsedData.length }} carte(s)
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { read, utils, writeFile } from 'xlsx'
import { Users, Upload, Download, Loader2, Zap, X, CheckCircle2, ArrowRight } from 'lucide-vue-next'
import { useCardsStore } from '@/stores/cards'
import { useNotificationStore } from '@/stores/notificationStore'
import { konvaToCardEl } from '@/utils/cardElements'

const props = defineProps({
  visible: { type: Boolean, default: false },
  dark: { type: Boolean, default: false },
  templateModel: { type: Object, required: true },
})
const emit = defineEmits(['close', 'generated'])

const cardsStore = useCardsStore()
const notificationStore = useNotificationStore()

const stepLabels = ['Import', 'Mapping', 'Aperçu', 'Résultat']

// ── State ─────────────────────────────────────────────────────────────────
const step = ref(0)
const fileInput = ref(null)
const parsedData = ref([])
const excelHeaders = ref([])
const columnMapping = ref({})
const isProcessing = ref(false)
const processedCount = ref(0)
const generationResult = ref(null)

// Reset on modal open/close
watch(
  () => props.visible,
  (v) => {
    if (v) {
      step.value = 0
      parsedData.value = []
      excelHeaders.value = []
      columnMapping.value = {}
      isProcessing.value = false
      processedCount.value = 0
      generationResult.value = null
    }
  },
)

// ── Template fields (from fieldConfig) ────────────────────────────────────
const STD_LABEL_MAP = {
  firstName: 'Prénom',
  lastName: 'Nom',
  title: 'Titre',
  company: 'Entreprise',
  phone: 'Téléphone',
  email: 'Email',
  website: 'Site web',
  address: 'Adresse',
}

const templateFields = computed(() => {
  const fields = []
  const fc = props.templateModel?.fieldConfig
  if (fc?.activeStandardFields) {
    for (const sf of fc.activeStandardFields) {
      fields.push({ role: sf.role, label: sf.label || STD_LABEL_MAP[sf.role] || sf.role })
    }
  }
  if (fc?.customFields) {
    for (const cf of fc.customFields) {
      fields.push({ role: `custom_${cf.id}`, label: cf.label })
    }
  }
  return fields
})

const mappedFields = computed(() =>
  templateFields.value.filter((f) => Object.values(columnMapping.value).includes(f.role)),
)

const mappedCount = computed(() => mappedFields.value.length)

// ── Auto-resolve mapping ─────────────────────────────────────────────────
const resolveRole = (colName) => {
  const val = String(colName).toLowerCase().trim()
  if (val.includes('prénom') || val === 'prenom' || val === 'firstname') return 'firstName'
  if (val === 'nom' || val === 'lastname') return 'lastName'
  if (val === 'titre' || val === 'title') return 'title'
  if (val === 'entreprise' || val === 'company') return 'company'
  if (val === 'email' || val === 'e-mail') return 'email'
  if (val.includes('tél') || val === 'phone' || val === 'telephone') return 'phone'
  if (val === 'site web' || val === 'website') return 'website'
  if (val === 'adresse' || val === 'address') return 'address'
  // Check custom fields by label
  const fc = props.templateModel?.fieldConfig
  if (fc?.customFields) {
    const cf = fc.customFields.find((c) => c.label.toLowerCase() === val)
    if (cf) return `custom_${cf.id}`
  }
  return ''
}

// ── Download template ────────────────────────────────────────────────────
const downloadTemplate = () => {
  const displayHeaders = templateFields.value.map((f) => f.label)
  const wb = utils.book_new()
  const ws = utils.aoa_to_sheet([displayHeaders])
  utils.book_append_sheet(wb, ws, 'Contacts')
  writeFile(wb, 'Format_Import_Cartes.xlsx')
}

// ── File upload ──────────────────────────────────────────────────────────
const handleFileUpload = (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (evt) => {
    try {
      const data = new Uint8Array(evt.target.result)
      const workbook = read(data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const json = utils.sheet_to_json(worksheet)
      parsedData.value = json
      excelHeaders.value = json.length > 0 ? Object.keys(json[0]) : []
    } catch (err) {
      console.error(err)
      notificationStore.error('Problème lors de la lecture du fichier.')
    }
  }
  reader.readAsArrayBuffer(file)
}

// ── Go to mapping (auto-map) ────────────────────────────────────────────
const goToMapping = () => {
  const validRoles = new Set(templateFields.value.map((f) => f.role))
  const mapping = {}
  for (const header of excelHeaders.value) {
    const resolved = resolveRole(header)
    mapping[header] = validRoles.has(resolved) ? resolved : ''
  }
  columnMapping.value = mapping
  step.value = 1
}

// ── Preview ──────────────────────────────────────────────────────────────
const previewRows = computed(() => parsedData.value.slice(0, 5))

const getRowValue = (row, role) => {
  // Find which excel header maps to this role
  for (const [header, mappedRole] of Object.entries(columnMapping.value)) {
    if (mappedRole === role) return row[header] ?? ''
  }
  return ''
}

// ── Generate cards ───────────────────────────────────────────────────────
const generateSingleCard = (row) => {
  const editorData = JSON.parse(JSON.stringify(props.templateModel.editorData))

  // Build a resolved contact object from the mapping
  for (const [header, role] of Object.entries(columnMapping.value)) {
    if (!role) continue
    const value = row[header]
    if (value === undefined || value === null || value === '') continue

    const updateElements = (elements) => {
      if (!elements) return
      for (const el of elements) {
        if (el.type !== 'text') continue
        if (el.role === role) {
          el.text = String(value)
        }
      }
    }

    updateElements(editorData.elements?.recto)
    updateElements(editorData.elements?.verso)
  }

  // Build card name from mapped firstName/lastName
  let nameStr = ''
  const fnHeader = Object.keys(columnMapping.value).find(
    (h) => columnMapping.value[h] === 'firstName',
  )
  const lnHeader = Object.keys(columnMapping.value).find(
    (h) => columnMapping.value[h] === 'lastName',
  )
  const emHeader = Object.keys(columnMapping.value).find((h) => columnMapping.value[h] === 'email')
  if (fnHeader && lnHeader && row[fnHeader] && row[lnHeader]) {
    nameStr = `${row[fnHeader]} ${row[lnHeader]}`
  } else if (emHeader && row[emHeader]) {
    nameStr = row[emHeader]
  } else {
    nameStr = `Carte ${Date.now().toString().slice(-4)}`
  }

  const cw = editorData.cardWidth || 680
  const ch = editorData.cardHeight || 429

  // Convert Konva px elements → BusinessCard % format
  const pctRecto = (editorData.elements?.recto || [])
    .map((el, i) => konvaToCardEl(el, cw, ch, i))
    .filter(Boolean)
  const pctVerso = (editorData.elements?.verso || [])
    .map((el, i) => konvaToCardEl(el, cw, ch, i))
    .filter(Boolean)

  // Extract contact object from column mapping
  const ROLE_KEYS = ['firstName', 'lastName', 'title', 'company', 'email', 'phone', 'website', 'address']
  const contact = {}
  for (const [header, role] of Object.entries(columnMapping.value)) {
    if (ROLE_KEYS.includes(role) && row[header]) contact[role] = String(row[header])
  }
  if (contact.firstName || contact.lastName) {
    contact.fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ')
  }

  const contactExtra =
    props.templateModel.fieldConfig?.customFields?.map((c) => {
      const cfRole = `custom_${c.id}`
      const cfHeader = Object.keys(columnMapping.value).find(
        (h) => columnMapping.value[h] === cfRole,
      )
      return { id: c.id, label: c.label, value: cfHeader ? (row[cfHeader] ?? '') : '' }
    }) || []

  return {
    name: `Lot - ${nameStr}`,
    template: props.templateModel.templateSlug || 'blank',
    isPublic: false,
    templateModelId: props.templateModel.id,
    data: {
      elements: pctRecto,
      versoElements: pctVerso,
      backgrounds: editorData.backgrounds,
      contact,
      contactExtra,
      cardBorderRadius: editorData.cardBorderRadius ?? 8,
      editorData,
      showQR: [...pctRecto, ...pctVerso].some((e) => e.type === 'qr'),
      orientation:
        editorData.orientation ||
        (ch > cw ? 'portrait' : 'landscape'),
      cardWidth: cw,
      cardHeight: ch,
    },
  }
}

const generateCards = async () => {
  if (parsedData.value.length === 0) return
  step.value = 3
  isProcessing.value = true
  processedCount.value = 0

  const errors = []
  let created = 0

  try {
    for (const row of parsedData.value) {
      try {
        const cardObj = generateSingleCard(row)
        await cardsStore.addCard(cardObj)
        created++
      } catch (err) {
        errors.push(err.message)
      }
      processedCount.value = created + errors.length
    }
    generationResult.value = { created, errors }
    if (created > 0) {
      notificationStore.success(`${created} carte(s) générée(s) avec succès !`)
      emit('generated', created)
    }
    if (errors.length > 0 && created === 0) {
      notificationStore.error('Aucune carte créée. ' + errors[0])
    }
  } catch (err) {
    console.error(err)
    notificationStore.error(err.message || 'Erreur lors de la génération.')
    generationResult.value = { created, errors: [...errors, err.message] }
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .relative {
  transform: translateY(15px) scale(0.98);
  opacity: 0;
}
.modal-fade-enter-active .relative,
.modal-fade-leave-active .relative {
  transition:
    transform 0.25s ease-out,
    opacity 0.25s ease-out;
}
</style>
