<template>
  <div class="pb-4 flex flex-col h-full">
    <!-- Search -->
    <div class="px-3 pt-3 pb-2 shrink-0">
      <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border" :class="themeStore.darkMode ? 'bg-onyx-800 border-onyx-700' : 'bg-powder-50 border-powder-200'">
        <Search class="w-3.5 h-3.5 shrink-0 text-onyx-400" />
        <input v-model="iconQuery" type="text" placeholder="Rechercher une icône…" class="flex-1 bg-transparent text-xs outline-none" :class="themeStore.darkMode ? 'text-powder-200 placeholder-onyx-400' : 'text-onyx-700 placeholder-onyx-400'" />
        <button v-if="iconQuery" @click="iconQuery = ''" class="text-onyx-400 hover:text-onyx-600">
          <X class="w-3 h-3" />
        </button>
      </div>
    </div>

    <!-- Category pills -->
    <div v-if="!iconQuery" class="px-3 pb-2 shrink-0">
      <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          v-for="cat in ICON_CATEGORIES"
          :key="cat.id"
          @click="activeIconCategoryId = cat.id"
          class="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors whitespace-nowrap"
          :class="activeIconCategoryId === cat.id ? 'bg-flame-600 text-white' : themeStore.darkMode ? 'bg-onyx-800 text-onyx-400 hover:bg-onyx-700' : 'bg-powder-100 text-onyx-500 hover:bg-powder-200'"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- Icon grid -->
    <div class="flex-1 overflow-y-auto px-3">
      <div class="grid grid-cols-5 gap-1.5">
        <button
          v-for="icon in filteredIcons"
          :key="icon.id"
          draggable="true"
          @dragstart="onIconDragStart($event, icon, icon.id.startsWith('mdi:') ? {} : { colorful: true })"
          @click="editorStore.addIconElement(icon, icon.id.startsWith('mdi:') ? {} : { colorful: true })"
          class="aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border transition-all cursor-pointer group overflow-hidden"
          :class="themeStore.darkMode ? 'border-onyx-700 hover:border-flame-500 hover:bg-onyx-800' : 'border-powder-200 hover:border-flame-400 hover:bg-flame-50'"
          :title="icon.label"
        >
          <IconifyIcon
            :icon="icon.id"
            width="20"
            height="20"
            class="shrink-0 transition-colors"
            :class="icon.id.startsWith('mdi:') ? themeStore.darkMode ? 'text-onyx-400 group-hover:text-flame-400' : 'text-onyx-600 group-hover:text-flame-600' : ''"
          />
          <span class="text-[8px] leading-none truncate w-full text-center px-0.5" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">{{ icon.label }}</span>
        </button>
      </div>
      <p v-if="filteredIcons.length === 0" class="text-xs text-center py-8" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">Aucune icône trouvée</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { Icon as IconifyIcon } from '@iconify/vue'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'
import { ICON_CATEGORIES, ALL_ICONS } from '@/data/iconLibrary'

const editorStore = useEditorStore()
const themeStore = useThemeStore()

const iconQuery = ref('')
const activeIconCategoryId = ref('contact')

const filteredIcons = computed(() => {
  const q = iconQuery.value.trim().toLowerCase()
  if (q) return ALL_ICONS.filter((ic) => ic.label.toLowerCase().includes(q) || ic.id.toLowerCase().includes(q))
  const cat = ICON_CATEGORIES.find((c) => c.id === activeIconCategoryId.value)
  return cat ? cat.icons : ALL_ICONS
})

function onIconDragStart(event, icon, preset = {}) {
  const data = { action: 'addIcon', icon, preset, dropWidth: 64, dropHeight: 64 }
  event.dataTransfer.setData('application/editor-element', JSON.stringify(data))
  event.dataTransfer.effectAllowed = 'copy'
}
</script>
