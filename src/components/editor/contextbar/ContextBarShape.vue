<template>
  <template v-if="sel">
    <!-- Size +/- for path shapes (motifs, decorations, graphiques) -->
    <template v-if="sel.shapeType === 'path'">
      <div class="flex items-center gap-0.5">
        <button @click="changeShapeSize(-8)" class="p-1 rounded" :class="btnCls" title="Réduire">
          <Minus class="w-3 h-3" />
        </button>
        <input
          type="number"
          :value="Math.round(sel.width || 60)"
          @change="changeShapeSizeTo(+$event.target.value)"
          class="w-12 text-center text-sm rounded px-1 py-1 outline-none border"
          :class="inputCls"
          min="8"
          max="800"
          title="Taille (px)"
        />
        <button @click="changeShapeSize(8)" class="p-1 rounded" :class="btnCls" title="Agrandir">
          <Plus class="w-3 h-3" />
        </button>
      </div>
      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />
    </template>

    <!-- Fill color (solid or gradient) -->
    <div class="flex items-center gap-1.5">
      <Palette class="w-4 h-4" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
      <button
        ref="triggerBtnRef"
        @click="onFillTriggerClick"
        class="relative w-6 h-6 rounded border overflow-hidden cursor-pointer hover:scale-110 transition-transform"
        :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-300'"
        title="Couleur de remplissage"
      >
        <div
          class="absolute inset-0"
          :style="sel?.fillGradient?.from ? { background: `linear-gradient(${sel.fillGradient.angle}deg, ${sel.fillGradient.from} 0%, ${sel.fillGradient.to ?? sel.fillGradient.from} 100%)` } : { background: sel?.fill || 'transparent' }"
        />
      </button>
      <span class="text-xs font-mono" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">Fond</span>
    </div>

    <!-- Border color -->
    <label class="flex items-center gap-1.5 cursor-pointer ml-2" title="Couleur de bordure">
      <div
        class="relative w-6 h-6 rounded border-2 overflow-hidden"
        :style="{ borderColor: sel.stroke || '#9CA3AF' }"
      >
        <div class="absolute inset-0 bg-transparent" />
        <input
          type="color"
          :value="sel.stroke || '#000000'"
          @input="update('stroke', $event.target.value)"
          @change="commit('stroke', $event.target.value)"
          class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <span
        class="text-xs font-mono"
        :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
        >Bordure</span
      >
    </label>

    <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

    <!-- Stroke width -->
    <div class="flex items-center gap-1.5">
      <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
        >Ep.</span
      >
      <input
        type="number"
        :value="sel.strokeWidth ?? 0"
        @change="commit('strokeWidth', +$event.target.value)"
        class="w-12 text-center text-sm rounded px-1 py-1 outline-none border"
        :class="inputCls"
        min="0"
        max="20"
      />
    </div>

    <!-- Corner radius (only for rect) -->
    <template v-if="sel.shapeType === 'rect'">
      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />
      <div class="flex items-center gap-1.5">
        <RectangleHorizontal class="w-4 h-4 opacity-50" />
        <input
          type="number"
          :value="sel.cornerRadius ?? 0"
          @change="commit('cornerRadius', +$event.target.value)"
          class="w-12 text-center text-sm rounded px-1 py-1 outline-none border"
          :class="inputCls"
          min="0"
          max="200"
        />
      </div>
    </template>
  </template>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Minus, Plus, Palette, RectangleHorizontal } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'

const editorStore = useEditorStore()
const themeStore = useThemeStore()

const emit = defineEmits(['open-fill'])

const sel = computed(() => editorStore.singleSelected)
const triggerBtnRef = ref(null)

const btnCls = computed(() =>
  themeStore.darkMode
    ? 'text-gray-400 hover:bg-gray-800 hover:text-white transition-colors'
    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors',
)
const inputCls = computed(() =>
  themeStore.darkMode
    ? 'bg-gray-800 border-gray-700 text-gray-200'
    : 'bg-white border-gray-200 text-gray-800',
)
const divCls = computed(() => (themeStore.darkMode ? 'bg-gray-700' : 'bg-gray-200'))

function update(key, value) {
  if (!sel.value) return
  editorStore.updateElement(sel.value.id, { [key]: value })
}

function commit(key, value) {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, { [key]: value })
}

function changeShapeSize(delta) {
  if (!sel.value) return
  const w = sel.value.width || 60
  const h = sel.value.height || 60
  const ratio = h / w
  const newW = Math.max(8, w + delta)
  editorStore.updateElementCommit(sel.value.id, { width: newW, height: Math.round(newW * ratio) })
}

function changeShapeSizeTo(size) {
  if (!sel.value) return
  const w = sel.value.width || 60
  const h = sel.value.height || 60
  const ratio = h / w
  const newW = Math.max(8, Math.min(800, size || 60))
  editorStore.updateElementCommit(sel.value.id, { width: newW, height: Math.round(newW * ratio) })
}

function onFillTriggerClick() {
  emit('open-fill', triggerBtnRef.value)
}
</script>
