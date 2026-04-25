<template>
  <template v-if="editorStore.selectedIds.length === 1 && sel && !sel.locked">
    <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

    <!-- Position X / Y -->
    <div class="flex items-center gap-1">
      <span
        class="text-[10px] font-semibold w-3 shrink-0"
        :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
        >X</span
      >
      <input
        type="number"
        :value="Math.round(liveState?.x ?? sel.x)"
        @change="commit('x', +$event.target.value)"
        class="w-[52px] text-center text-xs rounded px-1 py-0.5 outline-none border"
        :class="inputCls"
        title="Position X (px)"
      />
    </div>
    <div class="flex items-center gap-1 ml-1">
      <span
        class="text-[10px] font-semibold w-3 shrink-0"
        :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
        >Y</span
      >
      <input
        type="number"
        :value="Math.round(liveState?.y ?? sel.y)"
        @change="commit('y', +$event.target.value)"
        class="w-[52px] text-center text-xs rounded px-1 py-0.5 outline-none border"
        :class="inputCls"
        title="Position Y (px)"
      />
    </div>

    <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

    <!-- Size W / H with ratio lock -->
    <div class="flex items-center gap-1">
      <span
        class="text-[10px] font-semibold w-3 shrink-0"
        :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
        >L</span
      >
      <input
        type="number"
        :value="Math.round(liveState?.width ?? sel.width ?? 0)"
        @change="commitWidth(+$event.target.value)"
        class="w-[52px] text-center text-xs rounded px-1 py-0.5 outline-none border"
        :class="inputCls"
        min="1"
        title="Largeur (px)"
      />
    </div>
    <button
      @click="lockRatio = !lockRatio"
      class="p-0.5 rounded mx-0.5 transition-colors"
      :class="
        lockRatio
          ? themeStore.darkMode
            ? 'text-flame-400 bg-violet-900/40'
            : 'text-flame-600 bg-flame-50'
          : btnCls
      "
      title="Verrouiller les proportions"
    >
      <Link2 class="w-3 h-3" />
    </button>
    <div class="flex items-center gap-1">
      <span
        class="text-[10px] font-semibold w-3 shrink-0"
        :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
        >H</span
      >
      <input
        type="number"
        :value="Math.round(liveState?.height ?? sel.height ?? 0)"
        @change="commitHeight(+$event.target.value)"
        class="w-[52px] text-center text-xs rounded px-1 py-0.5 outline-none border"
        :class="inputCls"
        min="1"
        title="Hauteur (px)"
      />
    </div>

    <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

    <!-- Rotation -->
    <div class="flex items-center gap-1">
      <RotateCw
        class="w-3 h-3 shrink-0"
        :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
        title="Rotation"
      />
      <input
        type="number"
        :value="Math.round(sel.rotation ?? 0)"
        @change="commit('rotation', +$event.target.value)"
        class="w-[52px] text-center text-xs rounded px-1 py-0.5 outline-none border"
        :class="inputCls"
        min="-180"
        max="180"
        title="Rotation (°)"
      />
      <span
        class="text-[10px] shrink-0"
        :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
        >°</span
      >
    </div>

    <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

    <!-- Opacity -->
    <div class="flex items-center gap-1.5">
      <Layers
        class="w-3.5 h-3.5"
        :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
      />
      <input
        type="range"
        :value="Math.round((sel?.opacity ?? 1) * 100)"
        @input="update('opacity', +$event.target.value / 100)"
        @change="commit('opacity', +$event.target.value / 100)"
        min="0"
        max="100"
        class="w-20 accent-flame-500"
      />
      <span
        class="text-xs w-7 shrink-0 text-right"
        :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
      >
        {{ Math.round((sel?.opacity ?? 1) * 100) }}%
      </span>
    </div>

    <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

    <!-- Layer order -->
    <button
      @click="editorStore.sendBackward(sel.id)"
      class="p-1.5 rounded"
      :class="btnCls"
      title="Reculer"
    >
      <ArrowDown class="w-3.5 h-3.5" />
    </button>
    <button
      @click="editorStore.bringForward(sel.id)"
      class="p-1.5 rounded"
      :class="btnCls"
      title="Avancer"
    >
      <ArrowUp class="w-3.5 h-3.5" />
    </button>

    <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

    <!-- Duplicate -->
    <button
      @click="editorStore.duplicateSelected()"
      class="p-1.5 rounded"
      :class="btnCls"
      title="Dupliquer (Ctrl+D)"
    >
      <Copy class="w-3.5 h-3.5" />
    </button>

    <!-- Delete -->
    <button
      @click="editorStore.deleteSelected()"
      class="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      title="Supprimer (Suppr)"
    >
      <Trash2 class="w-3.5 h-3.5" />
    </button>
  </template>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RotateCw, Link2, Layers, ArrowUp, ArrowDown, Copy, Trash2 } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'

const editorStore = useEditorStore()
const themeStore = useThemeStore()

const sel = computed(() => editorStore.singleSelected)
const liveState = computed(() => {
  const id = sel.value?.id
  return id ? editorStore.livePosState[id] : null
})

const lockRatio = ref(false)

const btnCls = computed(() =>
  themeStore.darkMode
    ? 'text-onyx-400 hover:bg-onyx-800 hover:text-white transition-colors'
    : 'text-onyx-500 hover:bg-powder-100 hover:text-onyx-900 transition-colors',
)
const divCls = computed(() => (themeStore.darkMode ? 'bg-onyx-700' : 'bg-powder-200'))
const inputCls = computed(() =>
  themeStore.darkMode
    ? 'bg-onyx-800 border-onyx-700 text-powder-200'
    : 'bg-white border-powder-200 text-onyx-800',
)

function update(key, value) {
  if (!sel.value) return
  editorStore.updateElement(sel.value.id, { [key]: value })
}

function commit(key, value) {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, { [key]: value })
}

function commitWidth(newW) {
  if (!sel.value) return
  const w = Math.max(1, newW)
  if (lockRatio.value && sel.value.width && sel.value.height) {
    const ratio = sel.value.height / sel.value.width
    editorStore.updateElementCommit(sel.value.id, { width: w, height: Math.round(w * ratio) })
  } else {
    editorStore.updateElementCommit(sel.value.id, { width: w })
  }
}

function commitHeight(newH) {
  if (!sel.value) return
  const h = Math.max(1, newH)
  if (lockRatio.value && sel.value.width && sel.value.height) {
    const ratio = sel.value.width / sel.value.height
    editorStore.updateElementCommit(sel.value.id, { height: h, width: Math.round(h * ratio) })
  } else {
    editorStore.updateElementCommit(sel.value.id, { height: h })
  }
}
</script>
