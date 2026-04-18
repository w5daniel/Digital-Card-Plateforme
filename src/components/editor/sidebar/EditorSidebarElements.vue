<template>
  <div class="pb-4">
    <!-- Search (masquée dans la vue illustrations qui a sa propre barre) -->
    <div v-if="!activeCategory?.isIllustration" class="px-3 pt-3 pb-2">
      <div class="relative">
        <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'" />
        <input
          :value="elementsQuery"
          @input="$emit('update:elementsQuery', $event.target.value)"
          type="text"
          :placeholder="activeCategory ? `Rechercher dans ${activeCategory.name}…` : 'Rechercher des éléments...'"
          class="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border outline-none"
          :class="themeStore.darkMode ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'"
        />
      </div>
    </div>

    <!-- Search results -->
    <template v-if="filteredElements">
      <p class="text-xs font-medium px-3 py-1.5" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
        {{ filteredElements.length }} résultat{{ filteredElements.length !== 1 ? 's' : '' }}
      </p>
      <div class="grid grid-cols-4 gap-1.5 px-3">
        <button
          v-for="el in filteredElements"
          :key="el.id"
          @click="addLibraryElement(el)"
          draggable="true"
          @dragstart="onLibraryDragStart($event, el)"
          :title="el.label"
          class="aspect-square flex items-center justify-center rounded-lg border transition-all hover:scale-105"
          :class="themeStore.darkMode ? 'border-gray-700 hover:border-violet-500 hover:bg-gray-800 bg-gray-850' : 'border-gray-200 hover:border-violet-400 hover:bg-violet-50 bg-white'"
        >
          <template v-if="el.type === 'icon'">
            <IconifyIcon :icon="el.iconId" class="w-7 h-7" />
          </template>
          <template v-else>
            <svg :viewBox="el.shapeType === 'path' ? '0 0 24 24' : '0 0 32 20'" width="28" height="18" class="overflow-visible" fill="none">
              <g :fill="themeStore.darkMode ? '#A78BFA' : '#7C3AED'" :stroke="themeStore.darkMode ? '#A78BFA' : '#7C3AED'">
                <component :is="el.svgEl" v-bind="el.svgProps" />
              </g>
            </svg>
          </template>
        </button>
      </div>
    </template>

    <!-- Browse view (categories grid) -->
    <template v-else-if="elementsView === 'browse'">
      <p class="text-xs font-medium px-3 py-1" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">Parcourir les catégories</p>
      <div class="grid grid-cols-3 gap-2 px-3 pt-1">
        <button
          v-for="cat in ELEMENT_CATEGORIES"
          :key="cat.id"
          @click="$emit('update:elementsView', 'category:' + cat.id); $emit('update:elementsQuery', '')"
          class="flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all hover:scale-[1.03]"
          :class="themeStore.darkMode ? 'border-gray-700 hover:border-violet-500 bg-gray-800/50' : 'border-gray-100 hover:border-violet-300 bg-white'"
        >
          <div class="w-12 h-12 rounded-lg flex items-center justify-center" :class="cat.colorClass">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="(p, pi) in cat.thumbPaths" :key="pi" :d="p" />
            </svg>
          </div>
          <span class="text-[10px] font-medium leading-tight text-center" :class="themeStore.darkMode ? 'text-gray-300' : 'text-gray-600'">{{ cat.name }}</span>
        </button>
      </div>
    </template>

    <!-- Category detail: Illustrations -->
    <template v-else-if="activeCategory && activeCategory.isIllustration">
      <div class="px-3 pt-2 pb-2 shrink-0">
        <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border" :class="themeStore.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
          <Search class="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <input v-model="illustrationQuery" type="text" placeholder="Rechercher une illustration…" class="flex-1 bg-transparent text-xs outline-none" :class="themeStore.darkMode ? 'text-gray-200 placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'" />
          <button v-if="illustrationQuery" @click="illustrationQuery = ''" class="text-gray-400 hover:text-gray-600"><X class="w-3 h-3" /></button>
        </div>
      </div>
      <div v-if="!illustrationQuery" class="px-3 pb-2 shrink-0">
        <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button v-for="cat in ILLUSTRATION_CATEGORIES" :key="cat.id" @click="activeIllustrationCategoryId = cat.id" class="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors whitespace-nowrap" :class="activeIllustrationCategoryId === cat.id ? 'bg-rose-500 text-white' : themeStore.darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'">{{ cat.name }}</button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto px-3">
        <div class="grid grid-cols-5 gap-1.5">
          <button v-for="item in filteredIllustrations" :key="item.id" draggable="true" @dragstart="onIllustrationDragStart($event, item)" @click="addIllustration(item)" class="aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border transition-all cursor-pointer group overflow-hidden" :class="themeStore.darkMode ? 'border-gray-700 hover:border-rose-500 hover:bg-gray-800' : 'border-gray-200 hover:border-rose-400 hover:bg-rose-50'" :title="item.label">
            <template v-if="item.src">
              <img :src="item.src" :alt="item.label" class="w-9 h-9 object-contain shrink-0" loading="lazy" />
            </template>
            <template v-else>
              <IconifyIcon :icon="item.id" width="22" height="22" class="shrink-0" :style="item.color ? { color: item.color } : undefined" />
            </template>
            <span class="text-[7px] leading-none truncate w-full text-center px-0.5" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">{{ item.label }}</span>
          </button>
        </div>
        <p v-if="filteredIllustrations.length === 0" class="text-xs text-center py-8" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">Aucune illustration trouvée</p>
      </div>
    </template>

    <!-- Category detail: Standard -->
    <template v-else-if="activeCategory">
      <div v-for="sub in activeCategoryFiltered" :key="sub.name" class="mb-1">
        <p class="text-xs font-medium px-3 py-1.5" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">{{ sub.name }}</p>
        <div class="grid grid-cols-4 gap-1.5 px-3">
          <button
            v-for="element in sub.elements"
            :key="element.id"
            @click="addLibraryElement(element)"
            draggable="true"
            @dragstart="onLibraryDragStart($event, element)"
            :title="element.label"
            class="aspect-square flex items-center justify-center rounded-lg border transition-all hover:scale-105"
            :class="themeStore.darkMode ? 'border-gray-700 hover:border-violet-500 hover:bg-gray-800 bg-gray-850' : 'border-gray-200 hover:border-violet-400 hover:bg-violet-50 bg-white'"
          >
            <template v-if="element.type === 'icon'">
              <IconifyIcon :icon="element.iconId" class="w-7 h-7" />
            </template>
            <template v-else>
              <svg :viewBox="element.shapeType === 'path' ? '0 0 24 24' : '0 0 32 20'" width="28" height="18" class="overflow-visible" fill="none">
                <g :fill="themeStore.darkMode ? '#A78BFA' : '#7C3AED'" :stroke="themeStore.darkMode ? '#A78BFA' : '#7C3AED'">
                  <component :is="element.svgEl" v-bind="element.svgProps" />
                </g>
              </svg>
            </template>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { Icon as IconifyIcon } from '@iconify/vue'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'
import { ELEMENT_CATEGORIES } from '@/data/elementLibrary'
import { ILLUSTRATION_CATEGORIES, ALL_ILLUSTRATIONS } from '@/data/illustrationLibrary'

const props = defineProps({
  elementsView: { type: String, required: true },
  elementsQuery: { type: String, required: true },
})
const emit = defineEmits(['update:elementsView', 'update:elementsQuery'])

const editorStore = useEditorStore()
const themeStore = useThemeStore()

const illustrationQuery = ref('')
const activeIllustrationCategoryId = ref('social')

const activeCategory = computed(() => {
  if (!props.elementsView.startsWith('category:')) return null
  const catId = props.elementsView.replace('category:', '')
  return ELEMENT_CATEGORIES.find((c) => c.id === catId) || null
})

const filteredElements = computed(() => {
  const q = props.elementsQuery.toLowerCase().trim()
  if (!q) return null
  // Si une catégorie illustrations est active, la recherche est gérée par illustrationQuery
  if (activeCategory.value?.isIllustration) return null
  const results = []
  const categoriesToSearch = activeCategory.value ? [activeCategory.value] : ELEMENT_CATEGORIES
  categoriesToSearch.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      sub.elements.forEach((el) => {
        const haystack = [el.label, ...(el.tags || [])].join(' ').toLowerCase()
        if (haystack.includes(q)) results.push(el)
      })
    })
  })
  // Inclure illustrations seulement si on est dans la vue globale (pas de catégorie active)
  if (!activeCategory.value) {
    ALL_ILLUSTRATIONS.forEach((item) => {
      const haystack = [item.label, item.id, item.categoryName || ''].join(' ').toLowerCase()
      if (haystack.includes(q)) results.push({ ...item, type: 'icon', iconId: item.id, colorful: true })
    })
  }
  return results
})

const activeCategoryFiltered = computed(() => {
  if (!activeCategory.value) return []
  const q = props.elementsQuery.toLowerCase().trim()
  if (!q) return activeCategory.value.subcategories
  return activeCategory.value.subcategories
    .map((sub) => ({ ...sub, elements: sub.elements.filter((el) => { const haystack = [el.label, ...(el.tags || [])].join(' ').toLowerCase(); return haystack.includes(q) }) }))
    .filter((sub) => sub.elements.length)
})

const filteredIllustrations = computed(() => {
  const q = illustrationQuery.value.trim().toLowerCase()
  if (q) return ALL_ILLUSTRATIONS.filter((ic) => ic.label.toLowerCase().includes(q) || ic.id.toLowerCase().includes(q))
  const cat = ILLUSTRATION_CATEGORIES.find((c) => c.id === activeIllustrationCategoryId.value)
  return cat ? cat.icons : ALL_ILLUSTRATIONS
})

function addLibraryElement(el) {
  if (el.type === 'icon') {
    editorStore.addIconElement({ id: el.iconId }, { width: el.defaultWidth || 64, height: el.defaultHeight || 64, colorful: el.colorful ?? false, ...el.preset })
  } else if (el.shapeType === 'path') {
    const pathPreset = { width: el.defaultWidth || 60, height: el.defaultHeight || 60, ...el.preset }
    if (el.defaultFill) pathPreset.fill = el.defaultFill
    editorStore.addPathElement(el.pathData, el.pathViewBox || [24, 24], pathPreset)
  } else {
    editorStore.addShapeElement(el.shapeType, el.preset || {})
  }
}

function addIllustration(item) {
  if (item.src) {
    editorStore.addElement({ type: 'image', src: item.src, width: 140, height: 140 })
  } else if (item.color) {
    editorStore.addIconElement({ id: item.id }, { colorful: false, fill: item.color })
  } else {
    editorStore.addIconElement({ id: item.id }, { colorful: true })
  }
}

function onLibraryDragStart(event, el) {
  if (el.type === 'icon') {
    const data = { action: 'addIcon', icon: { id: el.iconId }, preset: { width: el.defaultWidth || 64, height: el.defaultHeight || 64, colorful: el.colorful ?? false, ...el.preset }, dropWidth: el.defaultWidth || 64, dropHeight: el.defaultHeight || 64 }
    event.dataTransfer.setData('application/editor-element', JSON.stringify(data))
    event.dataTransfer.effectAllowed = 'copy'
    return
  }
  const preset = { ...el.preset }
  if (el.defaultWidth !== undefined) preset.width = el.defaultWidth
  if (el.defaultHeight !== undefined) preset.height = el.defaultHeight
  if (el.defaultFill !== undefined) preset.fill = el.defaultFill
  const data = { action: el.shapeType === 'path' ? 'addPath' : 'addShape', shapeType: el.shapeType, pathData: el.pathData, pathViewBox: el.pathViewBox || [24, 24], preset, dropWidth: preset.width || el.defaultWidth || 60, dropHeight: preset.height || el.defaultHeight || 40 }
  event.dataTransfer.setData('application/editor-element', JSON.stringify(data))
  event.dataTransfer.effectAllowed = 'copy'
}

function onIllustrationDragStart(event, item) {
  if (item.src) {
    const data = { action: 'addImage', preset: { src: item.src, width: 140, height: 140 }, dropWidth: 140, dropHeight: 140 }
    event.dataTransfer.setData('application/editor-element', JSON.stringify(data))
  } else {
    const preset = item.color ? { colorful: false, fill: item.color, width: 64, height: 64 } : { colorful: true, width: 64, height: 64 }
    const data = { action: 'addIcon', icon: { id: item.id }, preset, dropWidth: 64, dropHeight: 64 }
    event.dataTransfer.setData('application/editor-element', JSON.stringify(data))
  }
  event.dataTransfer.effectAllowed = 'copy'
}
</script>
