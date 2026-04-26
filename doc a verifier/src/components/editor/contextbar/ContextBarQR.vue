<template>
  <template v-if="sel">
    <!-- Foreground color -->
    <label class="flex items-center gap-1.5 cursor-pointer" title="Couleur avant-plan QR">
      <Palette class="w-4 h-4" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'" />
      <div
        class="relative w-6 h-6 rounded border overflow-hidden"
        :class="themeStore.darkMode ? 'border-onyx-600' : 'border-powder-300'"
      >
        <div class="absolute inset-0" :style="{ background: sel.qrForeground || '#000000' }" />
        <input
          type="color"
          :value="sel.qrForeground || '#000000'"
          @input="update('qrForeground', $event.target.value)"
          @change="commit('qrForeground', $event.target.value)"
          class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <span class="text-xs" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
        >QR</span
      >
    </label>

    <div class="w-px h-5 shrink-0" :class="divCls" />

    <!-- Background color -->
    <label class="flex items-center gap-1.5 cursor-pointer" title="Couleur arrière-plan QR">
      <div
        class="relative w-6 h-6 rounded border overflow-hidden"
        :class="themeStore.darkMode ? 'border-onyx-600' : 'border-powder-300'"
      >
        <div class="absolute inset-0" :style="{ background: sel.qrBackground || '#ffffff' }" />
        <input
          type="color"
          :value="sel.qrBackground || '#ffffff'"
          @input="update('qrBackground', $event.target.value)"
          @change="commit('qrBackground', $event.target.value)"
          class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <span class="text-xs" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
        >Fond</span
      >
    </label>

    <div class="w-px h-5 shrink-0" :class="divCls" />

    <!-- Mode toggle -->
    <div class="flex items-center gap-1">
      <button
        v-for="m in [
          { v: 'standard', l: 'Standard' },
          { v: 'styled', l: 'Stylé' },
        ]"
        :key="m.v"
        @click="commit('qrMode', m.v)"
        class="text-[10px] px-2 py-0.5 rounded border transition-colors"
        :class="
          (sel.qrMode || 'standard') === m.v
            ? 'border-flame-500 bg-flame-500/20 text-flame-400 font-semibold'
            : themeStore.darkMode
              ? 'border-onyx-600 text-onyx-400 hover:border-onyx-500'
              : 'border-powder-300 text-onyx-500 hover:border-powder-400'
        "
      >
        {{ m.l }}
      </button>
    </div>
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

const divCls = computed(() => (themeStore.darkMode ? 'bg-onyx-700' : 'bg-powder-200'))

function update(key, value) {
  if (!sel.value) return
  editorStore.updateElement(sel.value.id, { [key]: value })
}

function commit(key, value) {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, { [key]: value })
}
</script>
