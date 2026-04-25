<template>
  <div class="pb-4">
    <!-- Background color picker -->
    <div class="px-3 mb-3">
      <p class="text-xs font-medium mb-2" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">
        Couleur de fond
      </p>
      <!-- Tabs Uni / Dégradé -->
      <div class="relative flex rounded-lg p-0.5 mb-3 text-xs" :class="themeStore.darkMode ? 'bg-onyx-800' : 'bg-powder-100'">
        <div
          class="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md shadow-sm transition-all duration-300 ease-out"
          :class="themeStore.darkMode ? 'bg-onyx-700' : 'bg-white'"
          :style="{ left: bgMode === 'solid' ? '2px' : '50%' }"
        />
        <button @click="bgMode = 'solid'" class="relative z-10 flex-1 py-1 rounded-md font-medium transition-colors" :class="bgMode === 'solid' ? (themeStore.darkMode ? 'text-powder-100' : 'text-onyx-800') : (themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400')">Uni</button>
        <button @click="bgMode = 'gradient'" class="relative z-10 flex-1 py-1 rounded-md font-medium transition-colors" :class="bgMode === 'gradient' ? (themeStore.darkMode ? 'text-powder-100' : 'text-onyx-800') : (themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400')">Dégradé</button>
      </div>

      <!-- Mode Uni -->
      <template v-if="bgMode === 'solid'">
        <div class="flex items-center gap-2 mb-2">
          <label class="relative w-8 h-8 rounded-lg overflow-hidden border-2 cursor-pointer flex-shrink-0 transition-all hover:scale-105" :class="themeStore.darkMode ? 'border-onyx-600' : 'border-powder-200'" :style="{ background: editorStore.currentBackground }">
            <input type="color" :value="editorStore.currentBackground?.startsWith('linear-gradient') ? '#6366f1' : (editorStore.currentBackground || '#ffffff')" @input="editorStore.setBackground($event.target.value)" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
          </label>
          <input type="text" :value="editorStore.currentBackground?.startsWith('linear-gradient') ? '' : (editorStore.currentBackground || '')" @change="editorStore.setBackground($event.target.value)" class="flex-1 text-xs px-2 py-1.5 rounded border font-mono outline-none" :class="themeStore.darkMode ? 'bg-onyx-800 border-onyx-700 text-powder-200' : 'bg-white border-powder-200 text-onyx-800'" placeholder="#FFFFFF" />
        </div>
        <div class="grid grid-cols-8 gap-1 mb-3">
          <button v-for="c in bgPresets" :key="c" @click="editorStore.setBackground(c)" class="aspect-square rounded border-2 transition-all hover:scale-110" :style="{ backgroundColor: c }" :class="editorStore.currentBackground === c ? 'border-flame-500 scale-110' : themeStore.darkMode ? 'border-onyx-700' : 'border-powder-200'" />
        </div>
      </template>

      <!-- Mode Dégradé -->
      <template v-else>
        <div class="mb-2">
          <p class="text-[10px] mb-1.5" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">Direction</p>
          <div class="grid grid-cols-4 gap-1">
            <button v-for="dir in [{ a: 0, icon: '↑' }, { a: 45, icon: '↗' }, { a: 90, icon: '→' }, { a: 135, icon: '↘' }, { a: 180, icon: '↓' }, { a: 225, icon: '↙' }, { a: 270, icon: '←' }, { a: 315, icon: '↖' }]" :key="dir.a" @click="bgGradAngle = dir.a; applyBgGradient()" class="py-1 rounded text-sm font-bold transition-all" :class="[bgGradAngle === dir.a ? 'bg-flame-500 text-white' : themeStore.darkMode ? 'bg-onyx-700 text-powder-300 hover:bg-onyx-600' : 'bg-powder-100 text-onyx-600 hover:bg-powder-200']">{{ dir.icon }}</button>
          </div>
        </div>
        <div class="flex gap-2 mb-2">
          <div class="flex-1">
            <p class="text-[10px] mb-1" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">Début</p>
            <label class="relative w-full h-7 rounded border overflow-hidden cursor-pointer block" :class="themeStore.darkMode ? 'border-onyx-600' : 'border-powder-200'" :style="{ background: bgGradFrom }">
              <input type="color" :value="bgGradFrom" @input="bgGradFrom = $event.target.value; applyBgGradient()" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
            </label>
          </div>
          <div class="flex-1">
            <p class="text-[10px] mb-1" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">Fin</p>
            <label class="relative w-full h-7 rounded border overflow-hidden cursor-pointer block" :class="themeStore.darkMode ? 'border-onyx-600' : 'border-powder-200'" :style="{ background: bgGradTo }">
              <input type="color" :value="bgGradTo" @input="bgGradTo = $event.target.value; applyBgGradient()" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
            </label>
          </div>
        </div>
        <div class="w-full h-6 rounded mb-2 border" :class="themeStore.darkMode ? 'border-onyx-700' : 'border-powder-200'" :style="{ background: buildGradientCss(bgGradAngle, bgGradFrom, bgGradTo) }" />
        <div class="flex flex-wrap gap-1.5">
          <button v-for="preset in BG_GRAD_PRESETS" :key="preset.label" @click="applyBgGradPreset(preset)" class="w-7 h-7 rounded border-2 transition-all hover:scale-110 hover:shadow-sm" :style="{ background: buildGradientCss(preset.angle, preset.from, preset.to) }" :class="themeStore.darkMode ? 'border-onyx-700 hover:border-flame-500' : 'border-powder-200 hover:border-flame-400'" :title="preset.label" />
        </div>
      </template>
    </div>

    <!-- Canvas color palette -->
    <div class="px-3 mt-1 mb-3">
      <p class="text-xs font-medium mb-2" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">Couleurs du document</p>
      <div class="flex flex-wrap gap-1 items-center">
        <button v-for="color in allDocColors" :key="color" @click="applyDocumentColor(color)" class="w-6 h-6 rounded border-2 transition-all duration-150 hover:scale-110 hover:shadow-sm" :style="{ background: color }" :class="[themeStore.darkMode ? 'border-onyx-700 hover:border-onyx-500' : 'border-powder-200 hover:border-powder-400', editorStore.selectedIds.length === 0 ? 'opacity-50 cursor-default' : 'cursor-pointer']" :title="editorStore.selectedIds.length > 0 ? `Appliquer aux éléments sélectionnés : ${color}` : color" />
        <label class="w-6 h-6 rounded border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-150 hover:scale-110" :class="themeStore.darkMode ? 'border-onyx-600 text-onyx-500 hover:border-flame-500 hover:text-flame-400' : 'border-powder-300 text-onyx-400 hover:border-flame-400 hover:text-flame-500'" title="Ajouter une couleur">
          <Plus class="w-3 h-3" />
          <input type="color" class="hidden" @change="addDocColor($event.target.value)" />
        </label>
        <button @click="showDocGradientPicker = !showDocGradientPicker" class="w-6 h-6 rounded border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-150 hover:scale-110 text-[9px] font-bold" :class="showDocGradientPicker ? 'border-flame-500 text-flame-500' : themeStore.darkMode ? 'border-onyx-600 text-onyx-500 hover:border-flame-500 hover:text-flame-400' : 'border-powder-300 text-onyx-400 hover:border-flame-400 hover:text-flame-500'" title="Ajouter un dégradé">▲▼</button>
      </div>
      <div v-if="showDocGradientPicker" class="mt-2 p-2 rounded-lg border" :class="themeStore.darkMode ? 'bg-onyx-800 border-onyx-700' : 'bg-powder-50 border-powder-200'">
        <div class="flex gap-1.5 mb-2">
          <label class="flex-1 block">
            <span class="text-[9px]" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">Du</span>
            <div class="relative h-6 rounded border overflow-hidden mt-0.5" :class="themeStore.darkMode ? 'border-onyx-600' : 'border-powder-200'" :style="{ background: docGradFrom }">
              <input type="color" :value="docGradFrom" @input="docGradFrom = $event.target.value" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
            </div>
          </label>
          <label class="flex-1 block">
            <span class="text-[9px]" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">Au</span>
            <div class="relative h-6 rounded border overflow-hidden mt-0.5" :class="themeStore.darkMode ? 'border-onyx-600' : 'border-powder-200'" :style="{ background: docGradTo }">
              <input type="color" :value="docGradTo" @input="docGradTo = $event.target.value" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
            </div>
          </label>
        </div>
        <div class="w-full h-4 rounded mb-2" :style="{ background: `linear-gradient(135deg, ${docGradFrom} 0%, ${docGradTo} 100%)` }" />
        <button @click="addDocColor(`linear-gradient(135deg, ${docGradFrom} 0%, ${docGradTo} 100%)`); showDocGradientPicker = false" class="w-full text-[10px] py-1 rounded font-medium bg-flame-500 text-white hover:bg-flame-600 transition-colors">Ajouter à la palette</button>
      </div>
      <p v-if="editorStore.selectedIds.length === 0 && allDocColors.length > 0" class="text-[10px] mt-1.5" :class="themeStore.darkMode ? 'text-onyx-600' : 'text-onyx-400'">Sélectionnez un élément pour appliquer</p>
    </div>

    <div class="mx-3 h-px mb-3" :class="themeStore.darkMode ? 'bg-onyx-800' : 'bg-powder-100'" />

    <!-- Templates -->
    <div class="px-3">
      <p class="text-xs font-medium mb-2" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">Modèles</p>
      <div class="relative mb-2">
        <Search class="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'" />
        <input v-model="designQuery" type="text" placeholder="Rechercher un modèle…" class="w-full text-xs pl-7 pr-7 py-1.5 rounded-lg border outline-none transition-colors" :class="themeStore.darkMode ? 'bg-onyx-800 border-onyx-700 text-powder-200 placeholder-onyx-500 focus:border-flame-500' : 'bg-white border-powder-200 text-onyx-800 placeholder-onyx-400 focus:border-flame-400'" />
        <button v-if="designQuery" @click="designQuery = ''" class="absolute right-2 top-1/2 -translate-y-1/2" :class="themeStore.darkMode ? 'text-onyx-500 hover:text-powder-300' : 'text-onyx-400 hover:text-onyx-600'">
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
      <div class="flex gap-1 mb-2">
        <button v-for="f in designFilters" :key="f.value" @click="designFilter = f.value" class="text-[10px] px-2 py-0.5 rounded-full border transition-colors" :class="[designFilter === f.value ? themeStore.darkMode ? 'bg-violet-900/50 border-flame-500 text-violet-300' : 'bg-flame-50 border-flame-400 text-violet-700' : themeStore.darkMode ? 'border-onyx-700 text-onyx-400 hover:bg-onyx-800' : 'border-powder-200 text-onyx-500 hover:bg-powder-50']">
          {{ f.label }} ({{ f.count }})
        </button>
      </div>
      <button @click="startBlankCanvas()" class="w-full flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg border-2 border-dashed transition-all hover:scale-[1.01]" :class="themeStore.darkMode ? 'border-onyx-700 hover:border-flame-500 hover:bg-onyx-800' : 'border-powder-300 hover:border-flame-400 hover:bg-flame-50/50'">
        <div class="w-10 h-7 rounded flex items-center justify-center border" :class="themeStore.darkMode ? 'border-onyx-600 bg-onyx-800' : 'border-powder-200 bg-white'">
          <PlusIcon class="w-4 h-4" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'" />
        </div>
        <div class="text-left">
          <p class="text-xs font-medium" :class="themeStore.darkMode ? 'text-powder-200' : 'text-onyx-700'">Carte vierge</p>
          <p class="text-[10px]" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">Commencer de zéro</p>
        </div>
      </button>
      <p v-if="filteredDesignTemplates.length === 0 && designQuery" class="text-xs text-center py-4" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">
        Aucun modèle trouvé pour « {{ designQuery }} »
      </p>
      <div class="grid grid-cols-2 gap-2">
        <button v-for="tpl in filteredDesignTemplates" :key="tpl.slug" @click="applyDesignTemplate(tpl)" draggable="true" @dragstart="onTemplateDragStart($event, tpl)" class="relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-md group" :class="[themeStore.darkMode ? 'border-onyx-700 hover:border-flame-500' : 'border-powder-200 hover:border-flame-400', tpl.isPremium && !authStore.isPremium && !authStore.isAdmin ? 'opacity-60' : '']" :title="tpl.name" style="aspect-ratio: 85.6/54">
          <div style="position: absolute; top: 0; left: 0; width: 500px; transform-origin: top left; transform: scale(0.256); pointer-events: none;">
            <BusinessCard :card="buildPreviewCard(tpl)" :isFlipped="false" />
          </div>
          <div class="absolute inset-x-0 bottom-0 py-1 bg-black/40 text-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="text-[8px] text-white font-medium">{{ tpl.name }}</span>
          </div>
          <div v-if="tpl.isPremium" class="absolute top-1 right-1 bg-amber-400 rounded-full w-3 h-3 flex items-center justify-center">
            <span class="text-[6px] text-amber-900 font-bold">★</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Apply template confirm -->
    <ConfirmModal
      v-if="showApplyTemplateConfirm"
      title="Appliquer ce modèle ?"
      message="Tous les éléments du recto seront remplacés par ce modèle. Le verso sera conservé."
      confirm-label="Appliquer"
      variant="warning"
      @confirm="onApplyTemplateConfirmed"
      @cancel="showApplyTemplateConfirm = false"
    />

    <!-- Blank canvas confirm -->
    <ConfirmModal
      v-if="showBlankConfirm"
      title="Repartir de zéro ?"
      :message="(editorStore.elements.recto.length > 0 && editorStore.elements.verso.length > 0) ? 'Tous les éléments du recto et du verso seront effacés.' : editorStore.elements.verso.length > 0 ? 'Tous les éléments du verso seront effacés.' : 'Tous les éléments du recto seront effacés.'"
      confirm-label="Effacer"
      variant="warning"
      @confirm="onBlankConfirmed"
      @cancel="showBlankConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search, X, Plus as PlusIcon } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'
import { useCardsStore } from '@/stores/cards'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { buildEditorElements, buildElements, LAYOUT_MAP, DEFAULT_EDITOR_PERSON } from '@/utils/templateLayouts'
import BusinessCard from '@/components/BusinessCard.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const editorStore = useEditorStore()
const themeStore = useThemeStore()
const cardsStore = useCardsStore()
const authStore = useAuthStore()
const notif = useNotificationStore()

// Background
const bgMode = ref('solid')
const bgGradAngle = ref(135)
const bgGradFrom = ref('#6366f1')
const bgGradTo = ref('#a855f7')

const BG_GRAD_PRESETS = [
  { label: 'Violet Passion', from: '#6366f1', to: '#a855f7', angle: 135 },
  { label: 'Sunset', from: '#f97316', to: '#ec4899', angle: 135 },
  { label: 'Ocean', from: '#0ea5e9', to: '#06b6d4', angle: 135 },
  { label: 'Forest', from: '#059669', to: '#10b981', angle: 135 },
  { label: 'Minuit', from: '#0f172a', to: '#334155', angle: 180 },
]

const bgPresets = [
  '#FFFFFF','#F1F5F9','#E2E8F0','#CBD5E1','#0F172A','#1E293B','#334155','#475569',
  '#1D4ED8','#7C3AED','#DB2777','#EA580C','#059669','#DC2626','#F59E0B','#06B6D4',
]

function buildGradientCss(angle, from, to) {
  return `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`
}

function applyBgGradient() {
  editorStore.setBackground(buildGradientCss(bgGradAngle.value, bgGradFrom.value, bgGradTo.value))
}

function applyBgGradPreset(preset) {
  bgGradAngle.value = preset.angle
  bgGradFrom.value = preset.from
  bgGradTo.value = preset.to
  editorStore.setBackground(buildGradientCss(preset.angle, preset.from, preset.to))
}

watch(
  () => editorStore.currentBackground,
  (bg) => {
    if (bg && bg.startsWith('linear-gradient(')) {
      bgMode.value = 'gradient'
      const m = bg.match(/linear-gradient\((\d+)deg,\s*(#[0-9a-fA-F]{3,8})\s*0%,\s*(#[0-9a-fA-F]{3,8})\s*100%\)/)
      if (m) {
        bgGradAngle.value = parseInt(m[1])
        bgGradFrom.value = m[2]
        bgGradTo.value = m[3]
      }
    } else {
      bgMode.value = 'solid'
    }
  },
  { immediate: true },
)

// Document colors palette
const customDocColors = ref([])
const showDocGradientPicker = ref(false)
const docGradFrom = ref('#6366f1')
const docGradTo = ref('#a855f7')

const canvasColors = computed(() => {
  const allEls = [...(editorStore.elements.recto || []), ...(editorStore.elements.verso || [])]
  const seen = new Map()
  const add = (c) => {
    if (c && typeof c === 'string' && c !== 'transparent' && c !== 'none' && !c.startsWith('rgba(0,0,0,0)')) {
      seen.set(c.toLowerCase(), c)
    }
  }
  for (const el of allEls) {
    add(el.fill); add(el.stroke); add(el.qrForeground); add(el.qrBackground)
    if (el.fillGradient?.from) {
      const gradCss = `linear-gradient(${el.fillGradient.angle ?? 180}deg, ${el.fillGradient.from} 0%, ${el.fillGradient.to ?? el.fillGradient.from} 100%)`
      add(gradCss)
    }
  }
  return [...seen.values()].slice(0, 24)
})

const allDocColors = computed(() => {
  const seen = new Set(canvasColors.value.map((c) => c.toLowerCase()))
  const result = [...canvasColors.value]
  for (const c of customDocColors.value) {
    if (!seen.has(c.toLowerCase())) { seen.add(c.toLowerCase()); result.push(c) }
  }
  return result
})

function addDocColor(color) {
  if (!color) return
  const lo = color.toLowerCase()
  if (!allDocColors.value.some((c) => c.toLowerCase() === lo)) {
    customDocColors.value = [...customDocColors.value, color]
  }
}

function applyDocumentColor(color) {
  for (const id of editorStore.selectedIds) {
    if (color.startsWith('linear-gradient(')) {
      const m = color.match(/linear-gradient\((\d+)deg,\s*(#[0-9a-fA-F]{3,8})\s*0%,\s*(#[0-9a-fA-F]{3,8})\s*100%\)/)
      if (m) editorStore.updateElementCommit(id, { fill: '', fillGradient: { angle: parseInt(m[1]), from: m[2], to: m[3] } })
    } else {
      editorStore.updateElementCommit(id, { fill: color, fillGradient: undefined })
    }
  }
}

// Templates
const PREVIEW_PERSON = {
  fullName: 'Sophie Martin', title: 'Directrice Marketing', company: 'InnovateLab',
  email: 'sophie@innovatelab.fr', phone: '+33 6 12 34 56 78', website: 'innovatelab.fr',
}

const designQuery = ref('')
const designFilter = ref('all')

const designFilters = computed(() => [
  { label: 'Tous', value: 'all', count: cardsStore.getAllTemplates.length },
  { label: 'Gratuits', value: 'free', count: cardsStore.getFreeTemplates.length },
  { label: 'Premium', value: 'premium', count: cardsStore.getPremiumTemplates.length },
])

const filteredDesignTemplates = computed(() => {
  let list = designFilter.value === 'free' ? cardsStore.getFreeTemplates
    : designFilter.value === 'premium' ? cardsStore.getPremiumTemplates
    : cardsStore.getAllTemplates
  const q = designQuery.value.toLowerCase().trim()
  if (q) {
    list = list.filter((t) => t.name.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)) || (t.category && t.category.toLowerCase().includes(q)))
  }
  return list
})

function buildPreviewCard(tpl) {
  if (tpl.previewElements) {
    return {
      id: `preview-${tpl.slug}`,
      template: tpl.slug,
      data: {
        elements: tpl.previewElements,
        versoElements: tpl.previewVersoElements || [],
        backgrounds: tpl.previewBackgrounds || { recto: tpl.colors?.primary, verso: tpl.colors?.secondary },
        cardWidth: tpl.previewCardWidth || 680,
        cardHeight: tpl.previewCardHeight || 429,
        cardBorderRadius: tpl.previewCardBorderRadius ?? 8,
        orientation: tpl.previewOrientation || 'landscape',
        fontFamily: tpl.previewFontFamily || undefined,
        showQR: false,
      },
    }
  }
  const layout = LAYOUT_MAP[tpl.slug] || 'center'
  return { id: `preview-${tpl.slug}`, template: tpl.slug, data: { elements: buildElements(layout, PREVIEW_PERSON, tpl.colors), showQR: false } }
}

const showApplyTemplateConfirm = ref(false)
const showBlankConfirm = ref(false)
let _pendingApplyTemplate = null

function applyDesignTemplate(tpl) {
  if (tpl.isPremium && !authStore.isPremium && !authStore.isAdmin) {
    notif.warning('Ce modèle est réservé au plan Premium.')
    return
  }
  const hasElements = editorStore.elements.recto.length > 0
  if (hasElements) {
    _pendingApplyTemplate = tpl
    showApplyTemplateConfirm.value = true
    return
  }
  _doApplyTemplate(tpl)
}

function onApplyTemplateConfirmed() {
  showApplyTemplateConfirm.value = false
  if (_pendingApplyTemplate) _doApplyTemplate(_pendingApplyTemplate)
  _pendingApplyTemplate = null
}

function _doApplyTemplate(tpl) {
  if (tpl.editorData) {
    const ed = JSON.parse(JSON.stringify(tpl.editorData))
    editorStore.applyRectoTemplate(ed.elements?.recto || [], ed.backgrounds?.recto || tpl.colors?.primary || '#FFFFFF')
  } else {
    const layout = LAYOUT_MAP[tpl.slug] || 'center'
    const rectoEls = buildEditorElements(layout, DEFAULT_EDITOR_PERSON, tpl.colors)
    editorStore.applyRectoTemplate(rectoEls, tpl.colors.primary)
  }
  editorStore.templateSlug = tpl.slug
  editorStore.templatePrimaryColor = tpl.colors?.secondary || tpl.colors?.primary || '#6366F1'
}

function startBlankCanvas() {
  const hasElements = editorStore.elements.recto.length > 0 || editorStore.elements.verso.length > 0
  if (hasElements) { showBlankConfirm.value = true; return }
  _doBlankCanvas()
}

function onBlankConfirmed() {
  showBlankConfirm.value = false
  _doBlankCanvas()
}

function _doBlankCanvas() {
  editorStore.initEditor()
  editorStore.templateSlug = null
}

function onTemplateDragStart(event, tpl) {
  if (tpl.isPremium && !authStore.isPremium && !authStore.isAdmin) {
    event.preventDefault()
    return
  }
  const data = { action: 'applyTemplate', slug: tpl.slug }
  event.dataTransfer.setData('application/editor-element', JSON.stringify(data))
  event.dataTransfer.effectAllowed = 'copy'
}
</script>
