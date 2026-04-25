<template>
  <div class="p-3 flex flex-col gap-4 overflow-y-auto">
    <!-- Mode indicator: édition vs création -->
    <div
      class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
      :class="selectedQRElement ? themeStore.darkMode ? 'bg-violet-900/40 text-violet-300' : 'bg-flame-50 text-flame-600' : themeStore.darkMode ? 'bg-onyx-800 text-onyx-400' : 'bg-powder-50 text-onyx-500'"
    >
      <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="selectedQRElement ? 'bg-violet-400 animate-pulse' : 'bg-onyx-400'" />
      {{ selectedQRElement ? 'Édition du QR sélectionné' : "Création d'un nouveau QR" }}
    </div>

    <!-- Section: Champs inclus -->
    <div>
      <p class="text-[10px] font-semibold uppercase tracking-wider mb-2" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">Champs inclus dans le QR</p>
      <div class="flex flex-col gap-1">
        <label
          v-for="key in QR_FIELD_KEYS"
          :key="key"
          class="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors"
          :class="themeStore.darkMode ? 'hover:bg-onyx-800' : 'hover:bg-powder-50'"
          @click.prevent="qrConfig.qrFields[key] = !qrConfig.qrFields[key]"
        >
          <button
            type="button"
            :class="['relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200', qrConfig.qrFields[key] ? 'bg-flame-500' : themeStore.darkMode ? 'bg-onyx-700' : 'bg-powder-300']"
          >
            <span :class="['pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200', qrConfig.qrFields[key] ? 'translate-x-[18px]' : 'translate-x-0.5']" />
          </button>
          <span class="text-xs font-medium w-20 shrink-0" :class="themeStore.darkMode ? 'text-powder-300' : 'text-onyx-700'">{{ ROLE_LABELS[key] }}</span>
          <span
            class="text-[10px] truncate flex-1"
            :class="editorStore.contactData[key] ? themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500' : themeStore.darkMode ? 'text-onyx-600' : 'text-powder-300'"
          >{{ editorStore.contactData[key] || '—' }}</span>
        </label>
      </div>

      <!-- Champs personnalisés -->
      <template v-if="editorStore.contactExtra && editorStore.contactExtra.length">
        <div class="mt-1 pt-2 border-t" :class="themeStore.darkMode ? 'border-onyx-800' : 'border-powder-100'">
          <p class="text-[9px] font-semibold uppercase tracking-wider mb-1 px-2" :class="themeStore.darkMode ? 'text-onyx-600' : 'text-onyx-400'">Champs personnalisés</p>
          <label
            v-for="item in editorStore.contactExtra"
            :key="item.id"
            class="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors"
            :class="themeStore.darkMode ? 'hover:bg-onyx-800' : 'hover:bg-powder-50'"
            @click.prevent="qrConfig.qrFields[item.id] = !qrConfig.qrFields[item.id]"
          >
            <button
              type="button"
              :class="['relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200', qrConfig.qrFields[item.id] ? 'bg-flame-500' : themeStore.darkMode ? 'bg-onyx-700' : 'bg-powder-300']"
            >
              <span :class="['pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200', qrConfig.qrFields[item.id] ? 'translate-x-[18px]' : 'translate-x-0.5']" />
            </button>
            <span class="text-xs font-medium w-20 shrink-0 truncate" :class="themeStore.darkMode ? 'text-powder-300' : 'text-onyx-700'">{{ item.label }}</span>
            <span
              class="text-[10px] truncate flex-1"
              :class="item.value ? themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500' : themeStore.darkMode ? 'text-onyx-600' : 'text-powder-300'"
            >{{ item.value || '—' }}</span>
          </label>
        </div>
      </template>
    </div>

    <!-- Section: Mode -->
    <div>
      <p class="text-[10px] font-semibold uppercase tracking-wider mb-2" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">Apparence</p>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="mode in [{ value: 'standard', label: 'Standard', desc: 'Classique' }, { value: 'styled', label: 'Stylé', desc: 'Personnalisé' }]"
          :key="mode.value"
          @click="mode.value === 'styled' && !authStore.isPremium && !authStore.isAdmin ? null : (qrConfig.qrMode = mode.value)"
          class="flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center relative"
          :class="[qrConfig.qrMode === mode.value ? 'border-flame-500 bg-flame-500/10 text-flame-500' : themeStore.darkMode ? 'border-onyx-700 text-onyx-400 hover:border-onyx-600' : 'border-powder-200 text-onyx-500 hover:border-powder-300', mode.value === 'styled' && !authStore.isPremium && !authStore.isAdmin ? 'opacity-60 cursor-not-allowed' : '']"
        >
          <QrCode class="w-5 h-5" />
          <span class="text-xs font-semibold">{{ mode.label }}</span>
          <span class="text-[9px] opacity-70">{{ mode.desc }}</span>
          <span v-if="mode.value === 'styled' && !authStore.isPremium && !authStore.isAdmin" class="absolute -top-1.5 -right-1.5 text-[8px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">PRO</span>
        </button>
      </div>
    </div>

    <!-- Section: Couleurs -->
    <div>
      <p class="text-[10px] font-semibold uppercase tracking-wider mb-2" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">Couleurs</p>
      <div class="flex flex-col gap-2">
        <label class="flex items-center justify-between gap-2">
          <span class="text-xs" :class="themeStore.darkMode ? 'text-powder-300' : 'text-onyx-600'">Avant-plan</span>
          <div class="flex items-center gap-2">
            <input type="color" v-model="qrConfig.qrForeground" class="w-8 h-7 rounded cursor-pointer border-0 bg-transparent" />
            <span class="text-[10px] font-mono" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">{{ qrConfig.qrForeground }}</span>
          </div>
        </label>
        <label class="flex items-center justify-between gap-2">
          <span class="text-xs" :class="themeStore.darkMode ? 'text-powder-300' : 'text-onyx-600'">Arrière-plan</span>
          <div class="flex items-center gap-2">
            <input type="color" v-model="qrConfig.qrBackground" class="w-8 h-7 rounded cursor-pointer border-0 bg-transparent" />
            <span class="text-[10px] font-mono" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">{{ qrConfig.qrBackground }}</span>
          </div>
        </label>
      </div>
    </div>

    <!-- Section: Style des points (styled only) -->
    <template v-if="qrConfig.qrMode === 'styled'">
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-wider mb-2" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">Style des points</p>
        <div class="grid grid-cols-3 gap-1">
          <button
            v-for="s in QR_DOT_STYLES"
            :key="s.value"
            @click="qrConfig.qrDotStyle = s.value"
            class="text-[10px] px-1 py-1.5 rounded-lg border transition-colors text-center"
            :class="qrConfig.qrDotStyle === s.value ? 'border-flame-500 bg-flame-500/10 text-flame-500 font-semibold' : themeStore.darkMode ? 'border-onyx-700 text-onyx-400 hover:border-onyx-500' : 'border-powder-200 text-onyx-500 hover:border-powder-300'"
          >{{ s.label }}</button>
        </div>
      </div>

      <div>
        <p class="text-[10px] font-semibold uppercase tracking-wider mb-2" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">Coin externe</p>
        <div class="grid grid-cols-3 gap-1">
          <button
            v-for="s in QR_CORNER_SQ_STYLES"
            :key="s.value"
            @click="qrConfig.qrCornerSquareStyle = s.value"
            class="text-[10px] px-1 py-1.5 rounded-lg border transition-colors text-center"
            :class="qrConfig.qrCornerSquareStyle === s.value ? 'border-flame-500 bg-flame-500/10 text-flame-500 font-semibold' : themeStore.darkMode ? 'border-onyx-700 text-onyx-400 hover:border-onyx-500' : 'border-powder-200 text-onyx-500 hover:border-powder-300'"
          >{{ s.label }}</button>
        </div>
      </div>

      <div>
        <p class="text-[10px] font-semibold uppercase tracking-wider mb-2" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">Coin interne</p>
        <div class="grid grid-cols-3 gap-1">
          <button
            v-for="s in QR_CORNER_DOT_STYLES"
            :key="s.value"
            @click="qrConfig.qrCornerDotStyle = s.value"
            class="text-[10px] px-1 py-1.5 rounded-lg border transition-colors text-center"
            :class="qrConfig.qrCornerDotStyle === s.value ? 'border-flame-500 bg-flame-500/10 text-flame-500 font-semibold' : themeStore.darkMode ? 'border-onyx-700 text-onyx-400 hover:border-onyx-500' : 'border-powder-200 text-onyx-500 hover:border-powder-300'"
          >{{ s.label }}</button>
        </div>
      </div>

      <!-- Logo -->
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-wider mb-2" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">Logo (optionnel)</p>
        <input type="file" ref="qrLogoInputRef" class="hidden" accept="image/*" @change="handleQRLogoUpload" />
        <div v-if="qrConfig.qrLogoSrc" class="flex items-center gap-2 mb-2">
          <img :src="qrConfig.qrLogoSrc" class="w-10 h-10 object-contain rounded border" :class="themeStore.darkMode ? 'border-onyx-600' : 'border-powder-200'" />
          <button @click="qrConfig.qrLogoSrc = ''" class="text-[10px] text-red-400 hover:text-red-300 underline">Retirer</button>
        </div>
        <button
          @click="qrLogoInputRef?.click()"
          class="w-full text-xs py-2 rounded-lg border border-dashed transition-colors"
          :class="themeStore.darkMode ? 'border-onyx-600 text-onyx-400 hover:border-flame-500 hover:text-flame-400' : 'border-powder-300 text-onyx-500 hover:border-flame-400 hover:text-flame-500'"
        >{{ qrConfig.qrLogoSrc ? 'Changer le logo' : '+ Ajouter un logo' }}</button>
      </div>

    </template>

    <!-- Section: Marge (tous modes) -->
    <div>
      <div class="flex items-center justify-between mb-1">
        <p class="text-[10px] font-semibold uppercase tracking-wider" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">Marge</p>
        <span class="text-[10px]" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">{{ qrConfig.qrMargin }}px</span>
      </div>
      <input type="range" min="0" max="50" step="1" v-model.number="qrConfig.qrMargin" class="range range-xs range-primary w-full" />
    </div>

    <!-- Section: Correction d'erreur -->
    <div>
      <p class="text-[10px] font-semibold uppercase tracking-wider mb-2" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">Correction d'erreur</p>
      <div class="grid grid-cols-4 gap-1">
        <button
          v-for="lvl in QR_ERROR_LEVELS"
          :key="lvl.value"
          @click="lvl.value !== 'L' && !authStore.isPremium && !authStore.isAdmin ? null : (qrConfig.qrErrorCorrection = lvl.value)"
          class="flex flex-col items-center py-1.5 rounded-lg border transition-colors relative"
          :class="[qrConfig.qrErrorCorrection === lvl.value ? 'border-flame-500 bg-flame-500/10 text-flame-500' : themeStore.darkMode ? 'border-onyx-700 text-onyx-400 hover:border-onyx-500' : 'border-powder-200 text-onyx-500 hover:border-powder-300', lvl.value !== 'L' && !authStore.isPremium && !authStore.isAdmin ? 'opacity-50 cursor-not-allowed' : '']"
        >
          <span class="text-xs font-bold">{{ lvl.label }}</span>
          <span class="text-[9px] opacity-70">{{ lvl.desc }}</span>
          <span v-if="lvl.value !== 'L' && !authStore.isPremium && !authStore.isAdmin" class="absolute -top-1 -right-1 text-[7px] font-bold bg-amber-500 text-white px-1 rounded-full">PRO</span>
        </button>
      </div>
      <p class="text-[9px] mt-1" :class="themeStore.darkMode ? 'text-onyx-600' : 'text-onyx-400'">Niveau H recommandé si vous ajoutez un logo.</p>
    </div>

    <!-- Bouton insertion (création) ou badge édition -->
    <div
      v-if="selectedQRElement"
      class="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-medium border"
      :class="themeStore.darkMode ? 'border-violet-700 bg-violet-900/30 text-violet-300' : 'border-violet-200 bg-flame-50 text-flame-600'"
    >
      <QrCode class="w-4 h-4 animate-pulse" />
      Modification en cours
    </div>
    <button
      v-else
      @click="insertQR"
      class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all bg-flame-600 hover:bg-flame-500 text-white shadow"
    >
      <QrCode class="w-4 h-4" />
      Insérer le QR code
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { QrCode } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { ROLE_LABELS } from '@/utils/cardElements'

const props = defineProps({
  qrConfig: { type: Object, required: true },
})

const emit = defineEmits(['insert-qr'])

const editorStore = useEditorStore()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const qrLogoInputRef = ref(null)

const selectedQRElement = computed(() => {
  if (editorStore.selectedIds.length !== 1) return null
  const id = editorStore.selectedIds[0]
  return editorStore.currentElements.find((el) => el.id === id && el.type === 'qr') || null
})

const QR_FIELD_KEYS = ['firstName', 'lastName', 'title', 'company', 'phone', 'email', 'website', 'address']

const QR_DOT_STYLES = [
  { value: 'square', label: 'Carré' },
  { value: 'dots', label: 'Rond' },
  { value: 'rounded', label: 'Arrondi' },
  { value: 'classy', label: 'Élégant' },
  { value: 'classy-rounded', label: 'Élégant arrondi' },
  { value: 'extra-rounded', label: 'Extra arrondi' },
]

const QR_CORNER_SQ_STYLES = [
  { value: 'square', label: 'Carré' },
  { value: 'dot', label: 'Rond' },
  { value: 'extra-rounded', label: 'Arrondi' },
]

const QR_CORNER_DOT_STYLES = [
  { value: 'square', label: 'Carré' },
  { value: 'dot', label: 'Rond' },
]

const QR_ERROR_LEVELS = [
  { value: 'L', label: 'L', desc: '7%' },
  { value: 'M', label: 'M', desc: '15%' },
  { value: 'Q', label: 'Q', desc: '25%' },
  { value: 'H', label: 'H', desc: '30%' },
]

function handleQRLogoUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { props.qrConfig.qrLogoSrc = ev.target.result }
  reader.readAsDataURL(file)
  e.target.value = ''
}

function insertQR() {
  emit('insert-qr')
}
</script>
