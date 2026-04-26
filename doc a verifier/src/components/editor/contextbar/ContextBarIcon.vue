<template>
  <template v-if="sel">
    <!-- Fill color (non-colorful icons only) -->
    <template v-if="!sel.colorful">
      <label class="flex items-center gap-1.5 cursor-pointer" title="Couleur de l'icône">
        <Palette class="w-4 h-4" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'" />
        <div
          class="relative w-6 h-6 rounded border overflow-hidden"
          :class="themeStore.darkMode ? 'border-onyx-600' : 'border-powder-300'"
        >
          <div class="absolute inset-0" :style="{ background: sel.fill || '#1a1a1a' }" />
          <input
            type="color"
            :value="sel.fill || '#1a1a1a'"
            @input="update('fill', $event.target.value)"
            @change="commit('fill', $event.target.value)"
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <span class="text-xs" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">Couleur</span>
      </label>

      <div class="w-px h-5 shrink-0" :class="divCls" />
    </template>

    <!-- Border color + width -->
    <label class="flex items-center gap-1.5 cursor-pointer" title="Couleur de bordure">
      <div
        class="relative w-6 h-6 rounded border overflow-hidden"
        :class="themeStore.darkMode ? 'border-onyx-600' : 'border-powder-300'"
        :style="{ background: sel.stroke || '#000000' }"
      >
        <input
          type="color"
          :value="sel.stroke || '#000000'"
          @input="update('stroke', $event.target.value)"
          @change="commit('stroke', $event.target.value)"
          class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <span class="text-xs" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">Bordure</span>
    </label>
    <input
      type="number"
      :value="sel.strokeWidth ?? 0"
      @change="commit('strokeWidth', Math.max(0, +$event.target.value))"
      class="w-10 text-center text-sm rounded px-1 py-1 outline-none border"
      :class="inputCls"
      min="0"
      max="20"
      title="Épaisseur de bordure"
    />

    <div class="w-px h-5 shrink-0" :class="divCls" />

    <!-- Icon size +/- -->
    <div class="flex items-center gap-0.5">
      <button @click="changeIconSize(-8)" class="p-1 rounded" :class="btnCls" title="Réduire">
        <Minus class="w-3 h-3" />
      </button>
      <input
        type="number"
        :value="Math.round(sel.width || 64)"
        @change="changeIconSizeTo(+$event.target.value)"
        class="w-12 text-center text-sm rounded px-1 py-1 outline-none border"
        :class="inputCls"
        min="8"
        max="800"
        title="Taille (px)"
      />
      <button @click="changeIconSize(8)" class="p-1 rounded" :class="btnCls" title="Agrandir">
        <Plus class="w-3 h-3" />
      </button>
    </div>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { Palette, Minus, Plus } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'

const editorStore = useEditorStore()
const themeStore = useThemeStore()

const sel = computed(() => editorStore.singleSelected)

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

function changeIconSize(delta) {
  if (!sel.value) return
  const size = Math.max(8, (sel.value.width || 64) + delta)
  editorStore.updateElementCommit(sel.value.id, { width: size, height: size })
}

function changeIconSizeTo(size) {
  if (!sel.value) return
  const clamped = Math.max(8, Math.min(800, size || 64))
  editorStore.updateElementCommit(sel.value.id, { width: clamped, height: clamped })
}
</script>
