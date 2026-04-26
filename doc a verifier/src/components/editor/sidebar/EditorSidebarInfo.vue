<template>
  <div class="pb-4">
    <!-- Standard contact fields -->
    <div class="px-3 pt-3 flex flex-col gap-3">
      <div
        v-for="field in editorStore.fieldConfig.activeStandardFields"
        :key="field.role"
        class="group/field relative"
      >
        <!-- Label / Edit state -->
        <div class="flex items-center justify-between mb-1">
          <div class="flex-1 min-w-0 pr-2">
            <input
              v-if="editingStandardLabel === field.role"
              v-model="field.label"
              @blur="editingStandardLabel = null; editorStore.isDirty = true"
              @keyup.enter="editingStandardLabel = null; $event.target.blur()"
              class="text-[11px] font-medium px-1 rounded outline-none border transition-colors w-full"
              :class="
                themeStore.darkMode
                  ? 'bg-onyx-800 border-onyx-600 text-powder-200'
                  : 'bg-white border-powder-300 text-onyx-800'
              "
              autofocus
            />
            <label
              v-else
              @dblclick="editingStandardLabel = field.role"
              class="text-[11px] font-medium flex items-center cursor-pointer group-hover/field:text-flame-500 transition-colors"
              :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
              title="Double-cliquez pour renommer"
            >
              {{ field.label }}
              <Edit2Icon
                class="w-3 h-3 ml-1.5 opacity-0 group-hover/field:opacity-50 inline"
              />
            </label>
          </div>
          <button
            @click="removeStandardField(field.role)"
            class="p-0.5 rounded opacity-0 group-hover/field:opacity-100 transition-all text-onyx-400 hover:text-red-500"
            title="Supprimer ce champ"
          >
            <Trash2 class="w-3 h-3" />
          </button>
        </div>

        <input
          type="text"
          :value="infoValues[field.role] || ''"
          @input="handleInfoInput(field.role, $event.target.value)"
          @blur="handleInfoBlur(field.role, $event.target.value)"
          class="w-full text-xs px-2.5 py-1.5 rounded-lg border outline-none transition-colors"
          :class="[
            fieldErrors[field.role]
              ? 'border-red-400 dark:border-red-500'
              : themeStore.darkMode
                ? 'border-onyx-700 focus:border-flame-500'
                : 'border-powder-200 focus:border-flame-400',
            themeStore.darkMode
              ? 'bg-onyx-800 text-powder-200 placeholder-onyx-500'
              : 'bg-white text-onyx-800 placeholder-onyx-400',
          ]"
        />
        <p
          v-if="fieldErrors[field.role]"
          class="text-[10px] text-red-500 mt-0.5"
        >{{ fieldErrors[field.role] }}</p>
      </div>
    </div>

    <!-- Divider -->
    <div
      class="mx-3 h-px my-4"
      :class="themeStore.darkMode ? 'bg-onyx-800' : 'bg-powder-100'"
    />

    <!-- Custom fields header -->
    <div class="px-3">
      <div class="flex items-center justify-between mb-2">
        <p
          class="text-xs font-medium"
          :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
        >
          Champs supplémentaires
        </p>
        <button
          v-if="authStore.isPremium || authStore.isAdmin"
          @click="showAddCustom = !showAddCustom"
          class="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
          :class="
            showAddCustom
              ? 'bg-violet-100 text-violet-700'
              : themeStore.darkMode
                ? 'text-flame-400 hover:bg-onyx-800'
                : 'text-flame-600 hover:bg-flame-50'
          "
        >
          <PlusIcon class="w-3 h-3" />
          Ajouter
        </button>
        <span
          v-else
          class="flex items-center gap-1 text-[10px] opacity-60 cursor-default"
          title="Réservé au plan Premium"
        >
          <PlusIcon class="w-3 h-3" />
          Ajouter
          <span class="text-[8px] font-bold text-amber-500">PRO</span>
        </span>
      </div>

      <!-- Existing custom fields -->
      <div
        v-for="cf in editorStore.fieldConfig.customFields"
        :key="cf.id"
        class="mb-2 group/custom relative"
      >
        <div class="flex items-center justify-between mb-0.5">
          <div class="flex-1 min-w-0 pr-2">
            <input
              v-if="editingCustomLabel === cf.id"
              v-model="cf.label"
              @blur="editingCustomLabel = null; syncCustomLabelToExtra(cf.id, cf.label)"
              @keyup.enter="editingCustomLabel = null; $event.target.blur()"
              class="text-[10px] font-medium px-1 rounded outline-none border transition-colors w-full"
              :class="
                themeStore.darkMode
                  ? 'bg-onyx-800 border-onyx-600 text-powder-200'
                  : 'bg-white border-powder-300 text-onyx-800'
              "
              autofocus
            />
            <span
              v-else
              @dblclick="editingCustomLabel = cf.id"
              class="text-[10px] font-medium cursor-pointer group-hover/custom:text-flame-500 transition-colors"
              :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
              title="Double-cliquez pour renommer"
              >{{ cf.label }}</span
            >
          </div>
          <button
            @click="removeCustomField(cf.id)"
            class="p-0.5 rounded opacity-0 group-hover/custom:opacity-100 transition-colors"
            :class="
              themeStore.darkMode
                ? 'text-onyx-600 hover:text-red-400'
                : 'text-onyx-400 hover:text-red-500'
            "
            title="Supprimer ce champ"
          >
            <Trash2 class="w-3 h-3" />
          </button>
        </div>
        <input
          type="text"
          :value="cf.value"
          @input="updateCustomField(cf.id, $event.target.value)"
          :placeholder="`Valeur de « ${cf.label} »`"
          class="w-full text-xs px-2.5 py-1.5 rounded-lg border outline-none transition-colors"
          :class="
            themeStore.darkMode
              ? 'bg-onyx-800 border-onyx-700 text-powder-200 placeholder-onyx-500 focus:border-flame-500'
              : 'bg-white border-powder-200 text-onyx-800 placeholder-onyx-400 focus:border-flame-400'
          "
        />
      </div>

      <!-- Add custom field form (inline) -->
      <div
        v-if="showAddCustom"
        class="rounded-lg border p-3 mt-1"
        :class="
          themeStore.darkMode ? 'bg-onyx-800 border-onyx-700' : 'bg-powder-50 border-powder-200'
        "
      >
        <div class="mb-2">
          <label
            class="text-[10px] font-medium mb-1 block"
            :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
            >Libellé du champ</label
          >
          <input
            v-model="newCustomLabel"
            type="text"
            placeholder="Ex : LinkedIn, Fax, Adresse…"
            class="w-full text-xs px-2.5 py-1.5 rounded border outline-none transition-colors"
            :class="
              themeStore.darkMode
                ? 'bg-onyx-700 border-onyx-600 text-powder-200 placeholder-onyx-400 focus:border-flame-500'
                : 'bg-white border-powder-200 text-onyx-800 placeholder-onyx-400 focus:border-flame-400'
            "
            @keydown.enter.prevent="confirmAddCustom"
          />
        </div>
        <div class="mb-3">
          <label
            class="text-[10px] font-medium mb-1 block"
            :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
            >Valeur</label
          >
          <input
            v-model="newCustomValue"
            type="text"
            placeholder="Entrez la valeur…"
            class="w-full text-xs px-2.5 py-1.5 rounded border outline-none transition-colors"
            :class="
              themeStore.darkMode
                ? 'bg-onyx-700 border-onyx-600 text-powder-200 placeholder-onyx-400 focus:border-flame-500'
                : 'bg-white border-powder-200 text-onyx-800 placeholder-onyx-400 focus:border-flame-400'
            "
            @keydown.enter.prevent="confirmAddCustom"
          />
        </div>
        <div class="flex gap-2">
          <button
            @click="confirmAddCustom"
            class="flex-1 py-1.5 rounded-lg text-xs font-medium bg-flame-600 text-white hover:bg-violet-700 transition-colors"
          >
            Confirmer
          </button>
          <button
            @click="showAddCustom = false; newCustomLabel = ''; newCustomValue = ''"
            class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :class="
              themeStore.darkMode
                ? 'bg-onyx-700 text-powder-300 hover:bg-onyx-600'
                : 'bg-white border border-powder-200 text-onyx-600 hover:bg-powder-100'
            "
          >
            Annuler
          </button>
        </div>
      </div>

      <!-- Available standard fields to restore -->
      <div
        v-if="availableStandardFields.length > 0 && !showAddCustom"
        class="mt-4 border-t pt-3"
        :class="themeStore.darkMode ? 'border-onyx-800' : 'border-powder-100'"
      >
        <p
          class="text-[10px] uppercase font-semibold mb-2"
          :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
        >
          Réajouter un champ standard
        </p>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="sf in availableStandardFields"
            :key="sf.role"
            @click="addStandardField(sf)"
            class="text-[10px] px-2 py-1 border rounded-lg transition-colors hover:text-flame-500 hover:border-flame-500"
            :class="
              themeStore.darkMode
                ? 'border-onyx-700 text-onyx-400'
                : 'border-powder-200 text-onyx-500'
            "
          >
            + {{ sf.label }}
          </button>
        </div>
      </div>

      <!-- Help hint -->
      <p
        v-if="!editorStore.contactExtra.length && !showAddCustom"
        class="text-[10px] mt-2 leading-relaxed"
        :class="themeStore.darkMode ? 'text-onyx-600' : 'text-onyx-400'"
      >
        Ajoutez des champs supplémentaires (LinkedIn, Skype, etc.) qui seront inclus dans
        l'export JSON et le QR code.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Trash2, Plus as PlusIcon, Edit2 as Edit2Icon } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { validateField, roleToValidationType } from '@/utils/validators'

const editorStore = useEditorStore()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const infoValues = ref({})
// TODO backend : valider les champs de contact côté serveur (POST/PUT /api/cards)
const fieldErrors = reactive({})
const showAddCustom = ref(false)
const newCustomLabel = ref('')
const newCustomValue = ref('')
const editingStandardLabel = ref(null)
const editingCustomLabel = ref(null)

const availableStandardFields = computed(() => {
  if (!editorStore.fieldConfig?.activeStandardFields) return []
  return editorStore.ALL_STANDARD_FIELDS.filter(
    (sf) => !editorStore.fieldConfig.activeStandardFields.some((af) => af.role === sf.role),
  )
})

function addStandardField(field) {
  if (!editorStore.fieldConfig?.activeStandardFields) return
  editorStore.fieldConfig.activeStandardFields.push(JSON.parse(JSON.stringify(field)))
  infoValues.value[field.role] = ''
  editorStore.isDirty = true
}

function removeStandardField(role) {
  if (!editorStore.fieldConfig?.activeStandardFields) return
  editorStore.fieldConfig.activeStandardFields =
    editorStore.fieldConfig.activeStandardFields.filter((f) => f.role !== role)
  editorStore.elements.recto = editorStore.elements.recto.filter((e) => e.role !== role)
  editorStore.elements.verso = editorStore.elements.verso.filter((e) => e.role !== role)
  const allEls = [...editorStore.elements.recto, ...editorStore.elements.verso]
  allEls.forEach((el) => {
    if (el.type === 'qr' && el.qrFields) el.qrFields[role] = false
  })
  delete infoValues.value[role]
  editorStore.isDirty = true
}

function syncCustomLabelToExtra(id, newLabel) {
  const cf = editorStore.contactExtra.find((c) => c.id === id)
  if (cf) cf.label = newLabel
  editorStore.isDirty = true
}

function syncInfoFromElements() {
  const allEls = [...editorStore.elements.recto, ...editorStore.elements.verso]
  const values = {}
  if (editorStore.fieldConfig?.activeStandardFields) {
    editorStore.fieldConfig.activeStandardFields.forEach(({ role }) => {
      const el = allEls.find((e) => e.role === role)
      if (el) values[role] = el.text || ''
    })
  }
  infoValues.value = values
}

function handleInfoInput(role, value) {
  fieldErrors[role] = validateField(roleToValidationType(role), value)
  updateInfoField(role, value)
}

function handleInfoBlur(role, value) {
  fieldErrors[role] = validateField(roleToValidationType(role), value)
}

function updateInfoField(role, value) {
  infoValues.value[role] = value

  const activeEl = editorStore.currentElements.find((e) => e.role === role)
  if (activeEl) {
    editorStore.updateElement(activeEl.id, { text: value })
  } else if (value.trim()) {
    editorStore.addTextElement({
      text: value,
      role,
      fontSize: 14,
      fill: editorStore.activePage === 'verso' ? '#FFFFFF' : '#111827',
    })
  }

  const otherPage = editorStore.activePage === 'recto' ? 'verso' : 'recto'
  const otherIdx = editorStore.elements[otherPage].findIndex((e) => e.role === role)
  if (otherIdx !== -1) {
    editorStore.elements[otherPage][otherIdx] = {
      ...editorStore.elements[otherPage][otherIdx],
      text: value,
    }
    editorStore.isDirty = true
  }
}

function updateCustomField(id, value) {
  const cfExtra = editorStore.contactExtra.find((c) => c.id === id)
  if (cfExtra) cfExtra.value = value
  // Also update fieldConfig.customFields since the input :value binds to it
  const cfConfig = editorStore.fieldConfig?.customFields?.find((c) => c.id === id)
  if (cfConfig) cfConfig.value = value

  if (cfExtra || cfConfig) {
    const role = `custom_${id}`
    const activeEl = editorStore.currentElements.find((e) => e.role === role)
    if (activeEl) {
      editorStore.updateElement(activeEl.id, { text: value })
    } else if (value.trim()) {
      editorStore.addTextElement({
        text: value,
        role,
        fontSize: 13,
        fill: editorStore.activePage === 'verso' ? '#FFFFFF' : '#111827',
      })
    }
    editorStore.isDirty = true
  }
}

function removeCustomField(id) {
  if (editorStore.fieldConfig?.customFields) {
    editorStore.fieldConfig.customFields = editorStore.fieldConfig.customFields.filter(
      (c) => c.id !== id,
    )
  }
  if (editorStore.contactExtra) {
    editorStore.contactExtra = editorStore.contactExtra.filter((c) => c.id !== id)
  }
  const role = `custom_${id}`
  editorStore.elements.recto = editorStore.elements.recto.filter((e) => e.role !== role)
  editorStore.elements.verso = editorStore.elements.verso.filter((e) => e.role !== role)

  const allEls = [...editorStore.elements.recto, ...editorStore.elements.verso]
  allEls.forEach((el) => {
    if (el.type === 'qr' && el.qrFields) el.qrFields[id] = false
  })

  editorStore.isDirty = true
}

function confirmAddCustom() {
  const label = newCustomLabel.value.trim()
  if (!label) return
  const id = Date.now().toString()
  const value = newCustomValue.value.trim()

  const newField = { id, label, value }

  if (editorStore.fieldConfig?.customFields) {
    editorStore.fieldConfig.customFields.push(newField)
  }
  if (editorStore.contactExtra) {
    editorStore.contactExtra.push(newField)
  }
  if (value) {
    editorStore.addTextElement({
      text: value,
      role: `custom_${id}`,
      fontSize: 13,
      fill: editorStore.activePage === 'verso' ? '#FFFFFF' : '#111827',
    })
  }
  editorStore.isDirty = true
  newCustomLabel.value = ''
  newCustomValue.value = ''
  showAddCustom.value = false
}

// Sync when this tab becomes active (called by parent via activeTab watcher)
// and when elements change
syncInfoFromElements()

watch(
  () => editorStore.elements,
  () => {
    syncInfoFromElements()
  },
  { deep: true },
)
</script>
