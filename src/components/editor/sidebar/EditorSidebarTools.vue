<template>
  <div class="p-3 flex flex-col gap-4 overflow-y-auto">
    <!-- Section: Affichage -->
    <div>
      <p class="text-[10px] font-semibold uppercase tracking-wider mb-2" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">Affichage</p>
      <div class="flex flex-col gap-0.5">
        <label
          v-for="opt in displayOptions"
          :key="opt.key"
          class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors"
          :class="[themeStore.darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50', PRO_TOOL_KEYS.has(opt.key) && !authStore.isPremium && !authStore.isAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer']"
        >
          <input
            type="checkbox"
            :checked="editorStore[opt.key]"
            @change="PRO_TOOL_KEYS.has(opt.key) && !authStore.isPremium && !authStore.isAdmin ? ($event.target.checked = editorStore[opt.key]) : (editorStore[opt.key] = $event.target.checked)"
            class="rounded accent-violet-600 w-3.5 h-3.5"
            :disabled="PRO_TOOL_KEYS.has(opt.key) && !authStore.isPremium && !authStore.isAdmin"
          />
          <component :is="opt.icon" class="w-3.5 h-3.5 shrink-0" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
          <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-300' : 'text-gray-700'">{{ opt.label }}</span>
          <span v-if="PRO_TOOL_KEYS.has(opt.key) && !authStore.isPremium && !authStore.isAdmin" class="ml-auto text-[8px] font-bold text-amber-500">PRO</span>
        </label>
      </div>

      <!-- Grid size selector -->
      <div v-if="editorStore.showGrid" class="mt-2 px-2">
        <p class="text-[10px] mb-1.5" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">Taille de la grille</p>
        <div class="flex gap-1">
          <button
            v-for="size in [10, 20, 40]"
            :key="size"
            @click="editorStore.gridSize = size"
            class="flex-1 text-xs py-1 rounded-md border transition-colors"
            :class="editorStore.gridSize === size ? themeStore.darkMode ? 'bg-violet-600 border-violet-500 text-white' : 'bg-violet-500 border-violet-400 text-white' : themeStore.darkMode ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'"
          >{{ size }}px</button>
        </div>
      </div>
    </div>

    <div class="h-px" :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-gray-100'" />

    <!-- Section: Alignement & Distribution -->
    <div>
      <p class="text-[10px] font-semibold uppercase tracking-wider mb-2" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
        Alignement
        <span v-if="editorStore.selectedIds.length < 1" class="font-normal normal-case ml-1 opacity-60">(sélectionnez un élément)</span>
      </p>
      <div class="grid grid-cols-6 gap-1 mb-2">
        <button
          v-for="al in alignButtons"
          :key="al.type"
          @click="onAlignClick(al.type)"
          :disabled="editorStore.selectedIds.length < 1"
          class="flex items-center justify-center p-1.5 rounded-md border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          :class="themeStore.darkMode ? 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400 hover:bg-gray-800' : 'border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50'"
          :title="al.title"
        >
          <component :is="al.icon" class="w-3.5 h-3.5" />
        </button>
      </div>

      <p class="text-[10px] font-semibold uppercase tracking-wider mb-1.5 mt-3" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
        Distribution
        <span v-if="editorStore.selectedIds.length < 3" class="font-normal normal-case ml-1 opacity-60">(3+ éléments)</span>
      </p>
      <div class="grid grid-cols-2 gap-1">
        <button
          @click="editorStore.distributeElements(editorStore.selectedIds, 'horizontal')"
          :disabled="editorStore.selectedIds.length < 3"
          class="flex items-center gap-2 px-2 py-1.5 rounded-md border text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          :class="themeStore.darkMode ? 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400' : 'border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600'"
          title="Distribuer horizontalement"
        >
          <AlignHorizontalDistributeCenter class="w-3.5 h-3.5 shrink-0" />
          Horizontal
        </button>
        <button
          @click="editorStore.distributeElements(editorStore.selectedIds, 'vertical')"
          :disabled="editorStore.selectedIds.length < 3"
          class="flex items-center gap-2 px-2 py-1.5 rounded-md border text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          :class="themeStore.darkMode ? 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400' : 'border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600'"
          title="Distribuer verticalement"
        >
          <AlignVerticalDistributeCenter class="w-3.5 h-3.5 shrink-0" />
          Vertical
        </button>
      </div>
    </div>

    <div class="h-px" :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-gray-100'" />

    <!-- Section: Taille & Position -->
    <div>
      <p class="text-[10px] font-semibold uppercase tracking-wider mb-2" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
        Taille & Position
        <span v-if="!editorStore.singleSelected && editorStore.selectedIds.length < 2" class="font-normal normal-case ml-1 opacity-60">(sélectionnez un élément)</span>
      </p>

      <!-- Position X/Y -->
      <div v-if="editorStore.singleSelected" class="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label class="text-[10px] mb-0.5 block" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">X</label>
          <input
            type="number"
            :value="Math.round(editorStore.singleSelected.x || 0)"
            @change="editorStore.updateElementCommit(editorStore.singleSelected.id, { x: +$event.target.value })"
            class="w-full text-xs px-2 py-1 rounded border outline-none"
            :class="themeStore.darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'"
          />
        </div>
        <div>
          <label class="text-[10px] mb-0.5 block" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">Y</label>
          <input
            type="number"
            :value="Math.round(editorStore.singleSelected.y || 0)"
            @change="editorStore.updateElementCommit(editorStore.singleSelected.id, { y: +$event.target.value })"
            class="w-full text-xs px-2 py-1 rounded border outline-none"
            :class="themeStore.darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'"
          />
        </div>
      </div>

      <!-- Width/Height -->
      <div v-if="editorStore.singleSelected" class="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label class="text-[10px] mb-0.5 block" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">L</label>
          <input
            type="number"
            :value="Math.round(editorStore.singleSelected.width || 0)"
            @change="editorStore.updateElementCommit(editorStore.singleSelected.id, { width: Math.max(1, +$event.target.value) })"
            class="w-full text-xs px-2 py-1 rounded border outline-none"
            :class="themeStore.darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'"
            min="1"
          />
        </div>
        <div>
          <label class="text-[10px] mb-0.5 block" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">H</label>
          <input
            type="number"
            :value="Math.round(editorStore.singleSelected.height || 0)"
            @change="editorStore.updateElementCommit(editorStore.singleSelected.id, { height: Math.max(1, +$event.target.value) })"
            class="w-full text-xs px-2 py-1 rounded border outline-none"
            :class="themeStore.darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'"
            min="1"
          />
        </div>
      </div>

      <!-- Match size (2+ elements) -->
      <div v-if="editorStore.selectedIds.length >= 2" class="flex flex-col gap-1">
        <p class="text-[10px] mb-1" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">Uniformiser (basé sur le 1er sélectionné)</p>
        <div class="grid grid-cols-3 gap-1">
          <button
            @click="editorStore.matchSizeElements(editorStore.selectedIds, 'width')"
            class="text-[10px] py-1.5 rounded-md border transition-colors"
            :class="themeStore.darkMode ? 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400' : 'border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600'"
            title="Même largeur"
          >Largeur</button>
          <button
            @click="editorStore.matchSizeElements(editorStore.selectedIds, 'height')"
            class="text-[10px] py-1.5 rounded-md border transition-colors"
            :class="themeStore.darkMode ? 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400' : 'border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600'"
            title="Même hauteur"
          >Hauteur</button>
          <button
            @click="editorStore.matchSizeElements(editorStore.selectedIds, 'both')"
            class="text-[10px] py-1.5 rounded-md border transition-colors"
            :class="themeStore.darkMode ? 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400' : 'border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600'"
            title="Même taille"
          >Les deux</button>
        </div>
      </div>
    </div>

    <div class="h-px" :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-gray-100'" />

    <!-- Section: Actions rapides -->
    <div>
      <p class="text-[10px] font-semibold uppercase tracking-wider mb-2" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">Actions rapides</p>
      <div class="flex flex-col gap-1">
        <button @click="editorStore.selectAll()" class="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-xs transition-colors" :class="themeStore.darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'">
          <MousePointer2 class="w-3.5 h-3.5 shrink-0" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
          Tout sélectionner
        </button>
        <button @click="editorStore.lockAll()" class="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-xs transition-colors" :class="themeStore.darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'">
          <Lock class="w-3.5 h-3.5 shrink-0" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
          Tout verrouiller
        </button>
        <button @click="editorStore.unlockAll()" class="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-xs transition-colors" :class="themeStore.darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'">
          <Unlock class="w-3.5 h-3.5 shrink-0" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
          Tout déverrouiller
        </button>
        <button @click="editorStore.zoomFit()" class="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-xs transition-colors" :class="themeStore.darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'">
          <ZoomIn class="w-3.5 h-3.5 shrink-0" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
          Réinitialiser le zoom
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Grid3x3, Magnet, MousePointer2, Crosshair, Shield,
  AlignHorizontalDistributeCenter, AlignVerticalDistributeCenter,
  AlignLeft, AlignCenter, AlignRight,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  Lock, Unlock, ZoomIn,
} from 'lucide-vue-next'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'



const editorStore = useEditorStore()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const PRO_TOOL_KEYS = new Set(['snapEnabled', 'snapToEdges', 'showCenterGuides', 'showSafeZone'])

const displayOptions = [
  { key: 'showGrid', label: 'Afficher la grille', icon: Grid3x3 },
  { key: 'snapEnabled', label: 'Magnétisme (snap grille)', icon: Magnet },
  { key: 'snapToEdges', label: 'Aligner sur les bords', icon: MousePointer2 },
  { key: 'showCenterGuides', label: 'Guides centraux', icon: Crosshair },
  { key: 'showSafeZone', label: 'Zone de sécurité (3mm)', icon: Shield },
]

const alignButtons = [
  { type: 'left', title: 'Aligner à gauche', icon: AlignLeft },
  { type: 'centerH', title: 'Centrer horizontalement', icon: AlignCenter },
  { type: 'right', title: 'Aligner à droite', icon: AlignRight },
  { type: 'top', title: 'Aligner en haut', icon: AlignStartVertical },
  { type: 'centerV', title: 'Centrer verticalement', icon: AlignCenterVertical },
  { type: 'bottom', title: 'Aligner en bas', icon: AlignEndVertical },
]

function onAlignClick(type) {
  if (editorStore.selectedIds.length === 1) {
    editorStore.alignElement(editorStore.selectedIds[0], type)
  } else if (editorStore.selectedIds.length >= 2) {
    editorStore.alignElements(editorStore.selectedIds, type)
  }
}

</script>
