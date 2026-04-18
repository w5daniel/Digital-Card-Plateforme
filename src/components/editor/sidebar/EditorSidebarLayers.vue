<template>
  <div class="flex flex-col h-full">
    <!-- Header bar -->
    <div class="px-3 py-2 flex items-center justify-between border-b shrink-0" :class="themeStore.darkMode ? 'border-gray-800' : 'border-gray-100'">
      <span class="text-xs font-semibold" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">
        Page : {{ editorStore.activePage === 'recto' ? 'Recto' : 'Verso' }}
      </span>
      <div class="flex items-center gap-2">
        <button
          v-if="lockedCount > 0"
          @click="editorStore.unlockAll()"
          class="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition-colors text-amber-500 hover:bg-amber-500/10"
          :title="`Déverrouiller tous les éléments (${lockedCount} verrouillé${lockedCount > 1 ? 's' : ''})`"
        >
          <LockOpen class="w-3 h-3" />
          Tout déverrouiller
        </button>
        <span class="text-[10px]" :class="themeStore.darkMode ? 'text-gray-600' : 'text-gray-400'">
          {{ editorStore.currentElements.length }} élément{{ editorStore.currentElements.length !== 1 ? 's' : '' }}
        </span>
      </div>
    </div>

    <!-- Layer list -->
    <div ref="listRef" class="flex-1 overflow-y-auto py-1 px-1">
      <div v-if="editorStore.currentElements.length === 0" class="flex flex-col items-center justify-center h-32 gap-2">
        <Layers class="w-8 h-8 opacity-20" />
        <p class="text-xs text-center" :class="themeStore.darkMode ? 'text-gray-600' : 'text-gray-400'">Aucun élément sur cette page</p>
      </div>

      <div
        v-for="(el, rIdx) in computedLayers"
        :key="el.id"
        :data-layer-id="el.id"
        draggable="true"
        @dragstart="layerDragIdx = rIdx"
        @dragover.prevent="layerDragOver = rIdx"
        @drop.prevent="onLayerDrop(rIdx)"
        @dragend="layerDragIdx = null; layerDragOver = null"
        @click="editorStore.selectElement(el.id)"
        class="group flex items-center gap-1.5 px-1.5 py-1 rounded-lg cursor-pointer transition-all"
        :class="[
          editorStore.selectedIds.includes(el.id)
            ? themeStore.darkMode ? 'bg-violet-900/40 ring-1 ring-violet-700' : 'bg-violet-50 ring-1 ring-violet-200'
            : themeStore.darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50',
          layerDragOver === rIdx && layerDragIdx !== rIdx && 'ring-1 ring-violet-400',
          !el.visible && 'opacity-40',
        ]"
      >
        <!-- Visibility toggle -->
        <button
          @click.stop="editorStore.updateElementCommit(el.id, { visible: el.visible === false ? true : false })"
          class="p-0.5 rounded shrink-0 transition-colors"
          :class="themeStore.darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'"
          :title="el.visible !== false ? 'Masquer' : 'Afficher'"
        >
          <Eye v-if="el.visible !== false" class="w-3.5 h-3.5" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
          <EyeOff v-else class="w-3.5 h-3.5" :class="themeStore.darkMode ? 'text-gray-600' : 'text-gray-400'" />
        </button>

        <!-- Lock toggle -->
        <button
          @click.stop="editorStore.toggleLock(el.id)"
          class="p-0.5 rounded shrink-0 transition-colors"
          :class="themeStore.darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'"
          :title="el.locked ? 'Déverrouiller' : 'Verrouiller'"
        >
          <Lock v-if="el.locked" class="w-3.5 h-3.5 text-amber-500" />
          <LockOpen v-else class="w-3.5 h-3.5" :class="themeStore.darkMode ? 'text-gray-600' : 'text-gray-400'" />
        </button>

        <!-- Color swatch / thumbnail -->
        <div class="w-5 h-5 rounded shrink-0 flex items-center justify-center text-[9px] font-bold overflow-hidden" :style="layerThumbnailStyle(el)">
          <span v-if="el.type === 'text'" class="text-gray-600">T</span>
          <span v-else-if="el.type === 'image'" class="text-gray-400 text-[8px]">IMG</span>
          <span v-else-if="el.type === 'qr'" class="text-white text-[8px]">QR</span>
        </div>

        <!-- Label + info -->
        <div class="flex-1 min-w-0">
          <span class="block text-xs truncate" :class="themeStore.darkMode ? 'text-gray-300' : 'text-gray-700'">{{ layerLabel(el) }}</span>
          <span
            v-if="editorStore.selectedIds.includes(el.id)"
            class="block text-[10px] truncate"
            :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
          >{{ Math.round(el.width) }}×{{ Math.round(el.height) }} px · {{ Math.round(el.x) }},{{ Math.round(el.y) }}</span>
        </div>

        <!-- Delete -->
        <button
          @click.stop="editorStore.selectedIds = [el.id]; editorStore.deleteSelected()"
          class="p-0.5 rounded shrink-0 opacity-0 group-hover:opacity-100 transition-colors text-gray-400 hover:text-red-500"
          title="Supprimer"
        >
          <Trash2 class="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Layers, Eye, EyeOff, Lock, LockOpen, Trash2 } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'

const editorStore = useEditorStore()
const themeStore = useThemeStore()

const layerDragIdx = ref(null)
const layerDragOver = ref(null)
const listRef = ref(null)

watch(
  () => editorStore.selectedIds,
  async (ids) => {
    if (!ids.length || !listRef.value) return
    await nextTick()
    const row = listRef.value.querySelector(`[data-layer-id="${ids[0]}"]`)
    row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  },
)

const computedLayers = computed(() => [...editorStore.currentElements].reverse())
const lockedCount = computed(() => editorStore.currentElements.filter((el) => el.locked).length)

function layerLabel(el) {
  if (el.type === 'text') return el.text?.slice(0, 22) || 'Texte'
  if (el.type === 'image') return 'Image'
  if (el.type === 'qr') return 'QR Code'
  if (el.type === 'icon') return el.iconId?.split(':')[1] || 'Icône'
  const shapes = { rect: 'Rectangle', circle: 'Cercle', line: 'Ligne', 'line-bar': 'Ligne barrée', arrow: 'Flèche', 'arrow-double': 'Double flèche', polygon: 'Polygone', star: 'Étoile', path: 'Forme custom' }
  return shapes[el.shapeType] || 'Élément'
}

function onLayerDrop(toReversedIdx) {
  if (layerDragIdx.value === null || layerDragIdx.value === toReversedIdx) {
    layerDragIdx.value = null
    layerDragOver.value = null
    return
  }
  const len = editorStore.currentElements.length
  const fromOriginal = len - 1 - layerDragIdx.value
  const toOriginal = len - 1 - toReversedIdx
  const el = editorStore.currentElements[fromOriginal]
  if (el) editorStore.reorderElement(el.id, toOriginal)
  layerDragIdx.value = null
  layerDragOver.value = null
}

function layerThumbnailStyle(el) {
  if (el.type === 'text') return { background: '#e2e8f0' }
  if (el.type === 'image') return { background: '#f0f0f0' }
  if (el.type === 'qr') return { background: '#111' }
  if (el.type === 'icon') return { background: el.colorful ? '#f8f8f8' : el.fill || '#888' }
  return { background: el.fill || '#888', border: el.stroke ? `1.5px solid ${el.stroke}` : 'none' }
}
</script>
