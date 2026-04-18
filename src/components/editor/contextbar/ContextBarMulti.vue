<template>
  <template v-if="editorStore.selectedIds.length >= 2">
    <span class="text-xs mr-1" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">
      {{ editorStore.selectedIds.length }} éléments
    </span>
    <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

    <!-- Group / Ungroup -->
    <button
      v-if="!editorStore.canUngroup"
      @click="editorStore.groupSelected()"
      class="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
      :class="btnCls"
      title="Grouper (Ctrl+G)"
    >
      <Group class="w-3.5 h-3.5" />
      Grouper
    </button>
    <button
      v-else
      @click="editorStore.ungroupSelected()"
      class="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
      :class="btnCls"
      title="Dégrouper (Ctrl+Shift+G)"
    >
      <Ungroup class="w-3.5 h-3.5" />
      Dégrouper
    </button>

    <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

    <!-- Quick align -->
    <button
      @click="editorStore.alignElements(editorStore.selectedIds, 'left')"
      class="p-1.5 rounded"
      :class="btnCls"
      title="Aligner à gauche"
    >
      <AlignLeft class="w-3.5 h-3.5" />
    </button>
    <button
      @click="editorStore.alignElements(editorStore.selectedIds, 'centerH')"
      class="p-1.5 rounded"
      :class="btnCls"
      title="Centrer horizontalement"
    >
      <AlignCenter class="w-3.5 h-3.5" />
    </button>
    <button
      @click="editorStore.alignElements(editorStore.selectedIds, 'right')"
      class="p-1.5 rounded"
      :class="btnCls"
      title="Aligner à droite"
    >
      <AlignRight class="w-3.5 h-3.5" />
    </button>
    <button
      @click="editorStore.alignElements(editorStore.selectedIds, 'top')"
      class="p-1.5 rounded"
      :class="btnCls"
      title="Aligner en haut"
    >
      <ArrowUpToLine class="w-3.5 h-3.5" />
    </button>
    <button
      @click="editorStore.alignElements(editorStore.selectedIds, 'centerV')"
      class="p-1.5 rounded"
      :class="btnCls"
      title="Centrer verticalement"
    >
      <AlignCenter class="w-3.5 h-3.5" style="transform: rotate(90deg)" />
    </button>
    <button
      @click="editorStore.alignElements(editorStore.selectedIds, 'bottom')"
      class="p-1.5 rounded"
      :class="btnCls"
      title="Aligner en bas"
    >
      <ArrowDownToLine class="w-3.5 h-3.5" />
    </button>

    <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

    <!-- Delete multi -->
    <button
      @click="editorStore.deleteSelected()"
      class="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"
      :class="themeStore.darkMode && 'dark:hover:bg-red-900/20'"
      title="Supprimer la sélection"
    >
      <Trash2 class="w-3.5 h-3.5" />
    </button>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import {
  Group,
  Ungroup,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUpToLine,
  ArrowDownToLine,
  Trash2,
} from 'lucide-vue-next'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'

const editorStore = useEditorStore()
const themeStore = useThemeStore()

const btnCls = computed(() =>
  themeStore.darkMode
    ? 'text-gray-400 hover:bg-gray-800 hover:text-white transition-colors'
    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors',
)
const divCls = computed(() => (themeStore.darkMode ? 'bg-gray-700' : 'bg-gray-200'))
</script>
