<template>
  <footer
    class="flex items-center justify-between px-4 h-10 shrink-0 border-t z-10"
    :class="themeStore.darkMode ? 'bg-onyx-900 border-onyx-800' : 'bg-powder-50 border-powder-200'"
  >
    <!-- Left: element count -->
    <div class="flex items-center gap-2 text-xs">
      <span :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">
        {{ editorStore.currentElements.length }} élément{{
          editorStore.currentElements.length !== 1 ? 's' : ''
        }}
      </span>
    </div>

    <!-- Card dimensions + format presets -->
    <div class="relative flex items-center gap-2">
      <!-- Dimensions display -->
      <span
        class="text-xs font-mono"
        :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
        :title="`${cardMm.w} × ${cardMm.h} mm`"
      >
        {{ editorStore.cardWidth }} × {{ editorStore.cardHeight }} px
      </span>

      <!-- Orientation toggle -->
      <button
        @click="editorStore.toggleOrientation()"
        class="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border transition-colors"
        :class="
          themeStore.darkMode
            ? 'border-onyx-700 text-onyx-400 hover:bg-onyx-800 hover:text-powder-200'
            : 'border-powder-200 text-onyx-500 hover:bg-powder-50 hover:text-onyx-700'
        "
        :title="editorStore.orientation === 'portrait' ? 'Passer en paysage' : 'Passer en portrait'"
      >
        <!-- Mini card icon that changes shape based on orientation -->
        <span
          class="inline-block border-[1.5px] border-current rounded-[2px] transition-all"
          :class="editorStore.orientation === 'portrait' ? 'w-2.5 h-3.5' : 'w-3.5 h-2.5'"
        />
        {{ editorStore.orientation === 'portrait' ? 'Portrait' : 'Paysage' }}
      </button>

      <!-- Corner radius control -->
      <div class="relative" data-radius-menu>
        <button
          @click="radiusOpen = !radiusOpen"
          class="flex items-center gap-1 text-xs px-2 py-0.5 rounded border transition-colors"
          :class="
            themeStore.darkMode
              ? 'border-onyx-700 text-onyx-400 hover:bg-onyx-800 hover:text-powder-200'
              : 'border-powder-200 text-onyx-500 hover:bg-powder-50 hover:text-onyx-700'
          "
          title="Arrondi des coins"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M2,10 L2,4 Q2,2 4,2 L10,2" />
          </svg>
          {{ editorStore.cardBorderRadius }}px
        </button>

        <!-- Radius popover -->
        <div
          v-if="radiusOpen"
          class="absolute bottom-full mb-1 right-0 w-48 rounded-xl border shadow-xl p-3 z-50"
          :class="themeStore.darkMode ? 'bg-onyx-800 border-onyx-700' : 'bg-powder-50 border-powder-200'"
        >
          <p
            class="text-[10px] font-semibold uppercase tracking-wider mb-2"
            :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
          >
            Arrondi des coins
          </p>
          <div class="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              v-model.number="editorStore.cardBorderRadius"
              class="flex-1 h-1 rounded-full accent-flame-500 cursor-pointer"
            />
            <span
              class="text-xs font-mono w-10 text-right"
              :class="themeStore.darkMode ? 'text-powder-300' : 'text-onyx-600'"
            >{{ editorStore.cardBorderRadius }}px</span>
          </div>
          <!-- Presets -->
          <div class="flex gap-1.5 mt-2.5">
            <button
              v-for="preset in [0, 4, 8, 16, 24, 50]"
              :key="preset"
              @click="editorStore.cardBorderRadius = preset"
              class="flex-1 text-[10px] py-0.5 rounded border transition-colors"
              :class="[
                editorStore.cardBorderRadius === preset
                  ? themeStore.darkMode
                    ? 'bg-flame-900/50 border-flame-500 text-flame-300'
                    : 'bg-flame-50 border-flame-400 text-flame-700'
                  : themeStore.darkMode
                    ? 'border-onyx-700 text-onyx-400 hover:bg-onyx-700'
                    : 'border-powder-200 text-onyx-500 hover:bg-powder-50',
              ]"
            >{{ preset }}</button>
          </div>
        </div>
      </div>

      <!-- Format dropdown trigger -->
      <div class="relative" data-format-menu>
        <button
          @click="formatOpen = !formatOpen"
          class="flex items-center gap-1 text-xs px-2 py-0.5 rounded border transition-colors"
          :class="
            themeStore.darkMode
              ? 'border-onyx-700 text-onyx-400 hover:bg-onyx-800 hover:text-powder-200'
              : 'border-powder-200 text-onyx-500 hover:bg-powder-50 hover:text-onyx-700'
          "
          title="Choisir un format"
        >
          <LayoutGrid class="w-3 h-3" />
          Format
          <ChevronUp v-if="formatOpen" class="w-3 h-3" />
          <ChevronDown v-else class="w-3 h-3" />
        </button>

        <!-- Dropdown -->
        <div
          v-if="formatOpen"
          class="absolute bottom-full mb-1 right-0 w-52 rounded-xl border shadow-xl overflow-hidden z-50"
          :class="themeStore.darkMode ? 'bg-onyx-800 border-onyx-700' : 'bg-powder-50 border-powder-200'"
        >
          <div
            class="px-3 py-2 border-b"
            :class="themeStore.darkMode ? 'border-onyx-700' : 'border-powder-100'"
          >
            <p
              class="text-[10px] font-semibold uppercase tracking-wider"
              :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
            >
              Formats carte de visite
            </p>
          </div>
          <div class="py-1">
            <button
              v-for="fmt in CARD_FORMATS"
              :key="fmt.label"
              @click="applyFormat(fmt)"
              class="w-full flex items-center justify-between px-3 py-2 text-xs transition-colors"
              :class="[
                isCurrentFormat(fmt)
                  ? themeStore.darkMode
                    ? 'bg-flame-900/40 text-flame-300'
                    : 'bg-flame-50 text-flame-700'
                  : themeStore.darkMode
                    ? 'text-powder-300 hover:bg-onyx-700'
                    : 'text-onyx-700 hover:bg-powder-50',
              ]"
            >
              <div class="flex items-center gap-2">
                <div v-if="isCurrentFormat(fmt)" class="w-1.5 h-1.5 rounded-full bg-flame-500" />
                <div
                  v-else
                  class="w-1.5 h-1.5 rounded-full"
                  :class="themeStore.darkMode ? 'bg-onyx-600' : 'bg-powder-300'"
                />
                <span class="font-medium">{{ fmt.label }}</span>
              </div>
              <span :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">
                {{ fmt.mm }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: zoom controls -->
    <div class="flex items-center gap-1">
      <button
        @click="editorStore.zoomOut()"
        class="p-1 rounded transition-colors"
        :class="
          themeStore.darkMode
            ? 'text-onyx-400 hover:bg-onyx-800 hover:text-powder-50'
            : 'text-onyx-500 hover:bg-powder-100'
        "
        title="Zoom arrière (Ctrl+-)"
      >
        <Minus class="w-3.5 h-3.5" />
      </button>

      <!-- Zoom % with presets dropdown -->
      <div class="relative" data-zoom-menu>
        <button
          @click="zoomOpen = !zoomOpen"
          class="text-xs font-medium w-14 text-center rounded py-0.5 transition-colors"
          :class="
            themeStore.darkMode
              ? 'text-powder-300 hover:bg-onyx-800'
              : 'text-onyx-600 hover:bg-powder-100'
          "
          title="Présets de zoom"
        >
          {{ Math.round(editorStore.zoom * 100) }}%
        </button>
        <!-- Zoom dropdown -->
        <div
          v-if="zoomOpen"
          class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-36 rounded-xl border shadow-xl overflow-hidden z-50"
          :class="themeStore.darkMode ? 'bg-onyx-800 border-onyx-700' : 'bg-powder-50 border-powder-200'"
        >
          <button
            v-for="pct in ZOOM_PRESETS"
            :key="pct"
            @click="applyZoom(pct)"
            class="w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors"
            :class="[
              Math.round(editorStore.zoom * 100) === pct
                ? themeStore.darkMode
                  ? 'bg-flame-900/40 text-flame-300'
                  : 'bg-flame-50 text-flame-700'
                : themeStore.darkMode
                  ? 'text-powder-300 hover:bg-onyx-700'
                  : 'text-onyx-700 hover:bg-powder-50',
            ]"
          >
            <span>{{ pct }}%</span>
            <span
              v-if="Math.round(editorStore.zoom * 100) === pct"
              class="w-1.5 h-1.5 rounded-full bg-flame-500"
            />
          </button>
          <div
            class="border-t"
            :class="themeStore.darkMode ? 'border-onyx-700' : 'border-powder-100'"
          />
          <button
            @click="editorStore.zoomFit(); zoomOpen = false"
            class="w-full text-left px-3 py-1.5 text-xs transition-colors"
            :class="
              themeStore.darkMode
                ? 'text-powder-300 hover:bg-onyx-700'
                : 'text-onyx-700 hover:bg-powder-50'
            "
          >
            Ajuster à l'écran
          </button>
        </div>
      </div>

      <button
        @click="editorStore.zoomIn()"
        class="p-1 rounded transition-colors"
        :class="
          themeStore.darkMode
            ? 'text-onyx-400 hover:bg-onyx-800 hover:text-powder-50'
            : 'text-onyx-500 hover:bg-powder-100'
        "
        title="Zoom avant (Ctrl++)"
      >
        <Plus class="w-3.5 h-3.5" />
      </button>

      <div class="w-px h-4 mx-1" :class="themeStore.darkMode ? 'bg-onyx-700' : 'bg-powder-200'" />
      <button
        @click="editorStore.zoomFit()"
        class="p-1 rounded transition-colors"
        :class="
          themeStore.darkMode
            ? 'text-onyx-400 hover:bg-onyx-800 hover:text-powder-50'
            : 'text-onyx-500 hover:bg-powder-100'
        "
        title="Ajuster à l'écran"
      >
        <Maximize2 class="w-3.5 h-3.5" />
      </button>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Minus, Plus, Maximize2, LayoutGrid, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { useEditorStore, CARD_W } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'

const editorStore = useEditorStore()
const themeStore = useThemeStore()

const formatOpen = ref(false)
const zoomOpen = ref(false)
const radiusOpen = ref(false)

const ZOOM_PRESETS = [25, 50, 75, 100, 125, 150, 200, 400]

function applyZoom(pct) {
  editorStore.setZoom(pct / 100)
  zoomOpen.value = false
}

// Scale factor: px per mm (based on standard 680px = 85.6mm)
const PX_PER_MM = CARD_W / 85.6

const CARD_FORMATS = [
  { label: 'Standard', mm: '85.6 × 54 mm', w: 680, h: 429 },
  { label: 'US', mm: '88.9 × 50.8 mm', w: 706, h: 404 },
  { label: 'Carré', mm: '60 × 60 mm', w: 477, h: 477 },
  { label: 'Mini', mm: '74 × 52 mm', w: 588, h: 413 },
]

const cardMm = computed(() => ({
  w: (editorStore.cardWidth / PX_PER_MM).toFixed(1),
  h: (editorStore.cardHeight / PX_PER_MM).toFixed(1),
}))

function isCurrentFormat(fmt) {
  // Match regardless of portrait/landscape — format identity is the pair of dimensions
  const cw = editorStore.cardWidth
  const ch = editorStore.cardHeight
  return (cw === fmt.w && ch === fmt.h) || (cw === fmt.h && ch === fmt.w)
}

function applyFormat(fmt) {
  // Preserve current orientation when switching format
  const isPortrait = editorStore.orientation === 'portrait'
  editorStore.setCardSize(isPortrait ? fmt.h : fmt.w, isPortrait ? fmt.w : fmt.h)
  formatOpen.value = false
}

// Close dropdown on outside click
function onDocClick(e) {
  if (!e.target.closest('[data-format-menu]')) formatOpen.value = false
  if (!e.target.closest('[data-zoom-menu]')) zoomOpen.value = false
  if (!e.target.closest('[data-radius-menu]')) radiusOpen.value = false
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>
