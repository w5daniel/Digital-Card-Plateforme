<template>
  <template v-if="sel">
    <!-- ── LINE (line / line-bar) ──────────────────────────────────────── -->
    <template v-if="sel.shapeType === 'line' || sel.shapeType === 'line-bar'">
      <!-- Line color -->
      <label class="flex items-center gap-1.5 cursor-pointer" title="Couleur de la ligne">
        <Palette class="w-4 h-4" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
        <div
          class="relative w-6 h-6 rounded border overflow-hidden"
          :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-300'"
        >
          <div class="absolute inset-0" :style="{ background: sel.fill || '#000000' }" />
          <input
            type="color"
            :value="sel.fill || '#000000'"
            @input="update('fill', $event.target.value)"
            @change="commit('fill', $event.target.value)"
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
          >Couleur</span
        >
      </label>

      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

      <!-- Stroke width -->
      <div class="flex items-center gap-1.5">
        <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
          >Épaisseur</span
        >
        <input
          type="number"
          :value="sel.strokeWidth || 2"
          @change="commit('strokeWidth', Math.max(1, +$event.target.value))"
          class="w-14 text-center text-sm rounded px-1 py-1 outline-none border"
          :class="inputCls"
          min="1"
          max="30"
        />
      </div>

      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

      <!-- Line style: solid / dashed / dotted -->
      <div class="flex items-center gap-1">
        <button
          @click="setLineDash([])"
          class="px-2 py-1 rounded text-xs flex items-center gap-1.5 transition-colors"
          :class="lineStyle === 'solid' ? activeBtnCls : btnCls"
          title="Plein"
        >
          <svg width="20" height="4" class="shrink-0">
            <line x1="0" y1="2" x2="20" y2="2" stroke="currentColor" stroke-width="2" />
          </svg>
          <span>Plein</span>
        </button>
        <button
          @click="setLineDash([10, 6])"
          class="px-2 py-1 rounded text-xs flex items-center gap-1.5 transition-colors"
          :class="lineStyle === 'dashed' ? activeBtnCls : btnCls"
          title="Tirets"
        >
          <svg width="20" height="4" class="shrink-0">
            <line
              x1="0"
              y1="2"
              x2="20"
              y2="2"
              stroke="currentColor"
              stroke-width="2"
              stroke-dasharray="6,4"
            />
          </svg>
          <span>Tirets</span>
        </button>
        <button
          @click="setLineDash([2, 8])"
          class="px-2 py-1 rounded text-xs flex items-center gap-1.5 transition-colors"
          :class="lineStyle === 'dotted' ? activeBtnCls : btnCls"
          title="Points"
        >
          <svg width="20" height="4" class="shrink-0">
            <line
              x1="0"
              y1="2"
              x2="20"
              y2="2"
              stroke="currentColor"
              stroke-width="2"
              stroke-dasharray="2,6"
              stroke-linecap="round"
            />
          </svg>
          <span>Points</span>
        </button>
      </div>
    </template>

    <!-- ── ARROW (arrow / arrow-double) ───────────────────────────────── -->
    <template v-else-if="sel.shapeType === 'arrow' || sel.shapeType === 'arrow-double'">
      <!-- Arrow color -->
      <label class="flex items-center gap-1.5 cursor-pointer" title="Couleur de la flèche">
        <Palette class="w-4 h-4" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
        <div
          class="relative w-6 h-6 rounded border overflow-hidden"
          :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-300'"
        >
          <div class="absolute inset-0" :style="{ background: sel.fill || '#000000' }" />
          <input
            type="color"
            :value="sel.fill || '#000000'"
            @input="update('fill', $event.target.value)"
            @change="commit('fill', $event.target.value)"
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
          >Couleur</span
        >
      </label>

      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

      <!-- Arrow size -->
      <div class="flex items-center gap-1.5">
        <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
          >Taille</span
        >
        <input
          type="number"
          :value="sel.height || 24"
          @change="commit('height', Math.max(8, Math.min(80, +$event.target.value)))"
          class="w-14 text-center text-sm rounded px-1 py-1 outline-none border"
          :class="inputCls"
          min="8"
          max="80"
        />
      </div>
    </template>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { Palette } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'

const editorStore = useEditorStore()
const themeStore = useThemeStore()

const sel = computed(() => editorStore.singleSelected)

const btnCls = computed(() =>
  themeStore.darkMode
    ? 'text-gray-400 hover:bg-gray-800 hover:text-white transition-colors'
    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors',
)
const activeBtnCls = computed(() =>
  themeStore.darkMode ? 'bg-violet-700 text-white' : 'bg-violet-100 text-violet-700',
)
const divCls = computed(() => (themeStore.darkMode ? 'bg-gray-700' : 'bg-gray-200'))
const inputCls = computed(() =>
  themeStore.darkMode
    ? 'bg-gray-800 border-gray-700 text-gray-200'
    : 'bg-white border-gray-200 text-gray-800',
)

const lineStyle = computed(() => {
  const d = sel.value?.dash
  if (!d || !d.length) return 'solid'
  if (d[0] <= 2) return 'dotted'
  return 'dashed'
})

function update(key, value) {
  if (!sel.value) return
  editorStore.updateElement(sel.value.id, { [key]: value })
}

function commit(key, value) {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, { [key]: value })
}

function setLineDash(dashArray) {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, { dash: dashArray })
}
</script>
