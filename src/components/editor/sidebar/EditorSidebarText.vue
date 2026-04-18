<template>
  <div class="pb-4">
    <!-- Main presets -->
    <div class="px-3 pt-3 flex flex-col gap-1.5 mb-3">
      <button
        v-for="preset in mainTextPresets"
        :key="preset.label"
        @click="addText(preset)"
        draggable="true"
        @dragstart="onTextDragStart($event, preset)"
        class="w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all hover:scale-[1.01]"
        :class="themeStore.darkMode ? 'border-gray-700 hover:border-violet-500 hover:bg-gray-800' : 'border-gray-200 hover:border-violet-400 hover:bg-violet-50/50'"
        :style="{ fontFamily: preset.fontFamily, fontSize: preset.previewSize + 'px', fontWeight: preset.weight }"
      >
        <span :class="themeStore.darkMode ? 'text-gray-100' : 'text-gray-800'">{{ preset.label }}</span>
      </button>
    </div>

    <div class="mx-3 h-px mb-3" :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-gray-100'" />

    <!-- Font search -->
    <div class="px-3 mb-3">
      <!-- Banner: selected text element mode -->
      <div
        v-if="selectedTextEl || selectedTextEls.length > 1"
        class="mb-2 px-2 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
        :class="themeStore.darkMode ? 'bg-violet-900/30 text-violet-300 border border-violet-700/50' : 'bg-violet-50 text-violet-700 border border-violet-200'"
      >
        <Type class="w-3 h-3 shrink-0" />
        <span>Cliquez sur une police pour modifier {{ selectedTextEls.length > 1 ? 'les éléments sélectionnés' : "l'élément sélectionné" }}</span>
      </div>
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs font-medium" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">Polices</p>
        <!-- Upload custom font button -->
        <button
          v-if="authStore.isPremium || authStore.isAdmin"
          @click="triggerFontUpload"
          class="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border transition-colors"
          :class="themeStore.darkMode ? 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400' : 'border-gray-300 text-gray-500 hover:border-violet-400 hover:text-violet-600'"
          title="Importer une police personnalisée (.ttf, .otf, .woff, .woff2)"
        >
          <Upload class="w-2.5 h-2.5" />
          Importer
        </button>
        <span
          v-else
          class="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border opacity-50 cursor-default"
          :class="themeStore.darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400'"
          title="Réservé au plan Premium"
        >
          <Upload class="w-2.5 h-2.5" />
          Importer
          <span class="text-[8px] font-bold text-amber-500">PRO</span>
        </span>
        <input ref="fontFileInputRef" type="file" accept=".ttf,.otf,.woff,.woff2" class="hidden" @change="onFontFileSelected" />
      </div>

      <!-- Custom fonts section -->
      <div v-if="fontStore.customFonts.length" class="mb-2">
        <p class="text-[9px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1" :class="themeStore.darkMode ? 'text-violet-400' : 'text-violet-500'">
          <span>Mes polices</span>
          <span class="opacity-60">({{ fontStore.customFonts.length }})</span>
        </p>
        <div class="flex flex-col gap-0.5">
          <div v-for="cf in fontStore.customFonts" :key="'custom-' + cf.name" class="flex items-center gap-1 group">
            <button
              @click="handleFontClick(cf.name)"
              class="flex-1 text-left px-2 py-1.5 rounded text-sm transition-colors"
              :class="themeStore.darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-violet-50 text-gray-700'"
              :style="{ fontFamily: cf.name }"
            >{{ cf.name }}</button>
            <button @click="fontStore.removeCustomFont(cf.name)" class="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:text-red-500 transition-opacity shrink-0" title="Supprimer cette police">
              <Trash2 class="w-3 h-3" />
            </button>
            <button
              @click.stop="fontStore.toggleFavorite(cf.name)"
              class="p-1 rounded shrink-0 transition-opacity"
              :class="fontStore.isFavorite(cf.name) ? 'text-yellow-400 opacity-100' : 'opacity-0 group-hover:opacity-60 ' + (themeStore.darkMode ? 'text-gray-500 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-400')"
              :title="fontStore.isFavorite(cf.name) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
            >
              <Star class="w-3 h-3" :fill="fontStore.isFavorite(cf.name) ? 'currentColor' : 'none'" />
            </button>
          </div>
        </div>
        <div class="h-px my-2" :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-gray-100'" />
      </div>

      <!-- Upload error/warning message -->
      <p
        v-if="fontUploadMsg"
        class="text-[10px] mb-2 px-1 py-1 rounded"
        :class="fontUploadMsg.type === 'error' ? themeStore.darkMode ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50' : themeStore.darkMode ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-700 bg-yellow-50'"
      >{{ fontUploadMsg.text }}</p>

      <div class="relative mb-2">
        <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'" />
        <input
          v-model="fontQuery"
          type="text"
          placeholder="Rechercher une police..."
          class="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border outline-none"
          :class="themeStore.darkMode ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'"
        />
      </div>
      <div class="flex flex-col gap-1 max-h-64 overflow-y-auto">
        <div v-for="font in filteredFonts" :key="font" class="flex items-center group">
          <button
            @mouseenter="fontStore.loadFont(font)"
            @click="handleFontClick(font)"
            class="flex-1 text-left px-2 py-1.5 rounded text-sm transition-colors"
            :class="themeStore.darkMode ? 'border-transparent hover:bg-gray-800 text-gray-300' : 'border-transparent hover:bg-gray-50 text-gray-700'"
            :style="{ fontFamily: fontStore.loadedFonts.has(font) ? font : 'inherit' }"
          >{{ font }}</button>
          <button
            @click.stop="fontStore.toggleFavorite(font)"
            class="p-1 rounded shrink-0 transition-opacity"
            :class="fontStore.isFavorite(font) ? 'text-yellow-400 opacity-100' : 'opacity-0 group-hover:opacity-60 ' + (themeStore.darkMode ? 'text-gray-500 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-400')"
            :title="fontStore.isFavorite(font) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
          >
            <Star class="w-3 h-3" :fill="fontStore.isFavorite(font) ? 'currentColor' : 'none'" />
          </button>
        </div>
      </div>
      <p v-if="!authStore.isPremium && !authStore.isAdmin" class="text-[9px] mt-1 px-1 text-amber-500">
        Limité à {{ MAX_FREE_FONTS }} polices — passez au Premium pour 300+
      </p>
    </div>

    <div class="mx-3 h-px mb-3" :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-gray-100'" />

    <!-- Font combinations -->
    <div class="px-3 mb-3">
      <p class="text-xs font-medium mb-2 flex items-center gap-1" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">
        Combinaisons de polices
        <span class="font-normal opacity-60 ml-1">(appliqué à tout le texte)</span>
        <span v-if="!authStore.isPremium && !authStore.isAdmin" class="text-[8px] font-bold text-amber-500 ml-auto">PRO</span>
      </p>
      <div class="flex flex-col gap-1.5" :class="!authStore.isPremium && !authStore.isAdmin ? 'opacity-50 pointer-events-none' : ''">
        <button
          v-for="combo in fontCombos"
          :key="combo.name"
          @mouseenter="preloadCombo(combo)"
          @click="applyFontCombo(combo)"
          class="w-full text-left px-3 py-2 rounded-lg border transition-all hover:scale-[1.01]"
          :class="themeStore.darkMode ? 'border-gray-700 hover:border-violet-500 hover:bg-gray-800' : 'border-gray-200 hover:border-violet-400 hover:bg-violet-50/50'"
        >
          <div class="flex items-baseline gap-2 mb-0.5">
            <span :style="{ fontFamily: fontStore.loadedFonts.has(combo.heading) ? combo.heading : 'inherit', fontWeight: combo.hw, fontSize: '15px' }" :class="themeStore.darkMode ? 'text-gray-100' : 'text-gray-800'">Aa</span>
            <span :style="{ fontFamily: fontStore.loadedFonts.has(combo.body) ? combo.body : 'inherit', fontWeight: combo.bw, fontSize: '12px' }" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">Aa</span>
            <span class="ml-auto text-xs font-medium" :class="themeStore.darkMode ? 'text-gray-200' : 'text-gray-700'">{{ combo.name }}</span>
          </div>
          <div class="text-[9px] tracking-wide" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">{{ combo.heading }} &amp; {{ combo.body }}</div>
        </button>
      </div>
    </div>

    <!-- Recently used -->
    <div v-if="recentFonts.length" class="px-3">
      <p class="text-xs font-medium mb-2" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">Récemment utilisées</p>
      <div class="flex flex-col gap-1">
        <div v-for="font in recentFonts" :key="'recent-' + font" class="flex items-center group">
          <button
            @click="handleFontClick(font)"
            class="flex-1 text-left px-2 py-1.5 rounded text-sm transition-colors"
            :class="themeStore.darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-700'"
            :style="{ fontFamily: font }"
          >{{ font }}</button>
          <button
            @click.stop="fontStore.toggleFavorite(font)"
            class="p-1 rounded shrink-0 transition-opacity"
            :class="fontStore.isFavorite(font) ? 'text-yellow-400 opacity-100' : 'opacity-0 group-hover:opacity-60 ' + (themeStore.darkMode ? 'text-gray-500 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-400')"
            :title="fontStore.isFavorite(font) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
          >
            <Star class="w-3 h-3" :fill="fontStore.isFavorite(font) ? 'currentColor' : 'none'" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Type, Upload, Search, Trash2, Star } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { useFontStore } from '@/stores/fontStore'

const editorStore = useEditorStore()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const fontStore = useFontStore()

const fontQuery = ref('')
const recentFonts = ref([])
const fontFileInputRef = ref(null)
const fontUploadMsg = ref(null)

const MAX_FREE_FONTS = 50

const selectedTextEl = computed(() => {
  const sel = editorStore.singleSelected
  return sel && sel.type === 'text' ? sel : null
})

const selectedTextEls = computed(() => {
  if (!editorStore.selectedIds.length) return []
  return editorStore.currentElements.filter(
    (el) => editorStore.selectedIds.includes(el.id) && el.type === 'text',
  )
})

const filteredFonts = computed(() => {
  const all = fontStore.searchFonts(fontQuery.value)
  if (authStore.isPremium || authStore.isAdmin) return all
  return all.slice(0, MAX_FREE_FONTS)
})

const HEADING_ROLES = ['firstName', 'lastName', 'title', 'company', 'logo']

const mainTextPresets = [
  { label: 'Ajouter un titre', fontFamily: 'Poppins', fontSize: 32, fontStyle: 'bold', previewSize: 19, weight: 700 },
  { label: 'Ajouter un sous-titre', fontFamily: 'Inter', fontSize: 22, fontStyle: 'normal', previewSize: 15, weight: 500 },
  { label: 'Ajouter du texte', fontFamily: 'Inter', fontSize: 14, fontStyle: 'normal', previewSize: 12, weight: 400 },
]

const fontCombos = [
  { name: 'Moderne', heading: 'Poppins', body: 'Inter', hw: 700, bw: 400 },
  { name: 'Corporate', heading: 'Montserrat', body: 'Open Sans', hw: 800, bw: 400 },
  { name: 'Minimal', heading: 'Inter', body: 'DM Sans', hw: 600, bw: 400 },
  { name: 'Clean', heading: 'Plus Jakarta Sans', body: 'Nunito', hw: 700, bw: 400 },
  { name: 'Élégant', heading: 'Playfair Display', body: 'Lato', hw: 700, bw: 400 },
  { name: 'Luxe', heading: 'Cormorant Garamond', body: 'Raleway', hw: 600, bw: 400 },
  { name: 'Éditorial', heading: 'DM Serif Display', body: 'Source Serif 4', hw: 400, bw: 400 },
  { name: 'Classique', heading: 'EB Garamond', body: 'Libre Baskerville', hw: 700, bw: 400 },
  { name: 'Tech', heading: 'Space Grotesk', body: 'Fira Code', hw: 700, bw: 400 },
  { name: 'Grotesk', heading: 'Syne', body: 'Barlow', hw: 700, bw: 400 },
  { name: 'Future', heading: 'Orbitron', body: 'Exo 2', hw: 700, bw: 400 },
  { name: 'Créatif', heading: 'Abril Fatface', body: 'Outfit', hw: 400, bw: 400 },
]

function preloadCombo(combo) {
  fontStore.loadFont(combo.heading)
  fontStore.loadFont(combo.body)
}

function triggerFontUpload() {
  fontUploadMsg.value = null
  fontFileInputRef.value?.click()
}

async function onFontFileSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = ''
  const result = await fontStore.addCustomFont(file)
  if (!result.success) {
    fontUploadMsg.value = { type: 'error', text: result.error }
  } else if (result.warning) {
    fontUploadMsg.value = { type: 'warning', text: result.warning }
  } else {
    fontUploadMsg.value = null
  }
  if (fontUploadMsg.value) {
    setTimeout(() => { fontUploadMsg.value = null }, 5000)
  }
}

function addText(preset) {
  const font = preset.fontFamily || 'Inter'
  if (font && !recentFonts.value.includes(font)) {
    recentFonts.value = [font, ...recentFonts.value].slice(0, 5)
  }
  fontStore.loadFont(font)
  editorStore.addTextElement({
    text: preset.label,
    fontFamily: font,
    fontSize: preset.fontSize,
    fontStyle: preset.fontStyle,
    fill: editorStore.activePage === 'verso' ? '#FFFFFF' : '#000000',
  })
}

function updateSelectedFont(family) {
  if (!selectedTextEl.value) return
  editorStore.updateElementCommit(selectedTextEl.value.id, { fontFamily: family })
  if (!recentFonts.value.includes(family)) {
    recentFonts.value = [family, ...recentFonts.value].slice(0, 5)
  }
  fontStore.loadFont(family).then(() => {
    if (selectedTextEl.value?.fontFamily === family) {
      editorStore.updateElement(selectedTextEl.value.id, { fontFamily: family })
    }
  })
}

function handleFontClick(family) {
  if (selectedTextEl.value) {
    updateSelectedFont(family)
  } else if (selectedTextEls.value.length > 1) {
    fontStore.loadFont(family)
    selectedTextEls.value.forEach((el) => {
      editorStore.updateElement(el.id, { fontFamily: family })
    })
    editorStore.saveHistory()
    if (!recentFonts.value.includes(family)) {
      recentFonts.value = [family, ...recentFonts.value].slice(0, 5)
    }
    fontStore.loadFont(family).then(() => {
      selectedTextEls.value.forEach((el) => {
        if (el.fontFamily === family) editorStore.updateElement(el.id, { fontFamily: family })
      })
    })
  } else {
    addText({ label: 'Votre texte', fontFamily: family, fontSize: 22, fontStyle: 'normal' })
  }
}

function applyFontCombo(combo) {
  preloadCombo(combo)
  const pages = ['recto', 'verso']
  let updated = 0
  pages.forEach((page) => {
    const els = editorStore.elements?.[page] ?? []
    els.forEach((el, idx) => {
      if (el.type !== 'text' && el.type !== 'contact') return
      const isHeading = HEADING_ROLES.includes(el.role) || (el.fontSize ?? 20) >= 22
      els[idx] = { ...el, fontFamily: isHeading ? combo.heading : combo.body }
      updated++
    })
  })
  if (updated > 0) {
    editorStore.isDirty = true
    editorStore.saveHistory()
  }
}

function onTextDragStart(event, preset) {
  const data = {
    action: 'addText',
    preset: {
      text: preset.label || 'Votre texte',
      fontFamily: preset.fontFamily,
      fontSize: preset.fontSize,
      fontStyle: preset.fontStyle,
      fill: editorStore.activePage === 'verso' ? '#FFFFFF' : '#000000',
    },
    dropWidth: 220,
    dropHeight: Math.max(30, preset.fontSize * 1.5),
  }
  event.dataTransfer.setData('application/editor-element', JSON.stringify(data))
  event.dataTransfer.effectAllowed = 'copy'
}
</script>
