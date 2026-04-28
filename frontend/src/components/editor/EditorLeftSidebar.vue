<template>
  <aside class="flex shrink-0 h-full">
    <!-- Icon rail (56px) -->
    <div
      class="flex flex-col items-center py-2 gap-0.5 w-14 shrink-0 border-r h-full bg-base-100 border-base-300 dark:bg-onyx-900"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="toggleTab(tab.id)"
        class="relative flex flex-col items-center gap-0.5 p-2 rounded-lg w-11 transition-all"
        :class="activeTab === tab.id
          ? 'bg-flame-500/15 text-flame-400 ring-1 ring-flame-500/60'
          : 'text-base-content/40 hover:bg-base-200 hover:text-base-content'"
        :title="tab.label"
      >
        <!-- Active left-border indicator -->
        <span
          v-if="activeTab === tab.id"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-flame-500"
        />
        <component :is="tab.icon" :class="activeTab === tab.id ? 'w-5 h-5' : 'w-[18px] h-[18px]'" />
        <span :class="activeTab === tab.id ? 'text-[8px] font-semibold leading-none' : 'text-[8px] font-medium leading-none'">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Slide panel (288px) -->
    <transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 -translate-x-2"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 -translate-x-2"
    >
      <div
        v-if="activeTab"
        class="w-72 shrink-0 flex flex-col border-r overflow-hidden bg-base-100 border-base-300"
      >
        <!-- Panel header -->
        <div
          class="flex items-center justify-between px-4 py-2.5 border-b shrink-0 border-base-300 dark:bg-onyx-900"
        >
          <!-- Elements: category detail → show back button -->
          <div v-if="activeTab === 'elements' && activeCategory" class="flex items-center gap-1.5">
            <button
              @click="elementsView = 'browse'; elementsQuery = ''"
              class="p-1 rounded text-base-content/40 hover:bg-base-200"
            >
              <ArrowLeft class="w-4 h-4" />
            </button>
            <h3 class="font-semibold text-sm text-base-content">
              {{ activeCategory.name }}
            </h3>
          </div>
          <!-- Default header -->
          <h3 v-else class="font-semibold text-sm text-base-content">
            {{ currentTab?.label }}
          </h3>
          <button
            @click="activeTab = null"
            class="p-1 rounded text-base-content/40 hover:bg-base-200"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Panel content -->
        <transition
          enter-active-class="transition-all duration-150 ease-out"
          enter-from-class="opacity-0 translate-x-2"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition-all duration-100 ease-in"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-2"
          mode="out-in"
        >
          <div :key="activeTab" class="flex-1 overflow-y-auto dark:bg-onyx-900" data-sidebar-panel>
            <EditorSidebarInfo v-if="activeTab === 'info'" />
            <EditorSidebarDesign v-else-if="activeTab === 'design'" />
            <EditorSidebarElements
              v-else-if="activeTab === 'elements'"
              v-model:elementsView="elementsView"
              v-model:elementsQuery="elementsQuery"
            />
            <EditorSidebarIcons v-else-if="activeTab === 'icons'" />
            <EditorSidebarText v-else-if="activeTab === 'text'" />
            <EditorSidebarLayers v-else-if="activeTab === 'layers'" />
            <EditorSidebarImport v-else-if="activeTab === 'import'" />
            <EditorSidebarQR
              v-else-if="activeTab === 'qr'"
              :qrConfig="qrConfig"
              @insert-qr="insertQR"
            />
            <EditorSidebarTools
              v-else-if="activeTab === 'tools'"
              @insert-qr="insertQR"
            />
          </div>
        </transition>
      </div>
    </transition>
  </aside>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import {
  LayoutTemplate,
  Type,
  Shapes,
  Upload,
  Wrench,
  X,
  ArrowLeft,
  QrCode,
  UserCircle,
  Layers,
  Sparkles,
} from 'lucide-vue-next'
import { useEditorStore } from '@/stores/useEditorStore'
import { ELEMENT_CATEGORIES } from '@/data/elementLibrary'

import EditorSidebarInfo from './sidebar/EditorSidebarInfo.vue'
import EditorSidebarDesign from './sidebar/EditorSidebarDesign.vue'
import EditorSidebarElements from './sidebar/EditorSidebarElements.vue'
import EditorSidebarIcons from './sidebar/EditorSidebarIcons.vue'
import EditorSidebarText from './sidebar/EditorSidebarText.vue'
import EditorSidebarLayers from './sidebar/EditorSidebarLayers.vue'
import EditorSidebarImport from './sidebar/EditorSidebarImport.vue'
import EditorSidebarQR from './sidebar/EditorSidebarQR.vue'
import EditorSidebarTools from './sidebar/EditorSidebarTools.vue'

const editorStore = useEditorStore()

// ── Tab state ────────────────────────────────────────────────────────────────
const activeTab = ref(null)

const tabs = [
  { id: 'info', label: 'Infos', icon: UserCircle },
  { id: 'design', label: 'Design', icon: LayoutTemplate },
  { id: 'elements', label: 'Éléments', icon: Shapes },
  { id: 'icons', label: 'Icônes', icon: Sparkles },
  { id: 'text', label: 'Texte', icon: Type },
  { id: 'layers', label: 'Calques', icon: Layers },
  { id: 'import', label: 'Importer', icon: Upload },
  { id: 'qr', label: 'QR Code', icon: QrCode },
  { id: 'tools', label: 'Outils', icon: Wrench },
]

const currentTab = computed(() => tabs.find((t) => t.id === activeTab.value))

function toggleTab(id) {
  activeTab.value = activeTab.value === id ? null : id
}

// ── Elements panel: cross-header state ──────────────────────────────────────
// elementsView and elementsQuery live here because the panel *header* back-button
// (rendered in this parent) needs to read/write them alongside the sub-component.
const elementsView = ref('browse')
const elementsQuery = ref('')

const activeCategory = computed(() => {
  if (!elementsView.value.startsWith('category:')) return null
  const catId = elementsView.value.replace('category:', '')
  return ELEMENT_CATEGORIES.find((c) => c.id === catId) || null
})

// ── QR Code configuration ────────────────────────────────────────────────────
// qrConfig lives here and is passed as a prop to both EditorSidebarQR and
// EditorSidebarTools so that insertQR() (in this parent) has access to it.
const qrConfig = reactive({
  qrFields: {
    firstName: true,
    lastName: true,
    title: true,
    company: true,
    phone: true,
    email: true,
    website: false,
    address: false,
  },
  qrMode: 'standard',
  qrForeground: '#000000',
  qrBackground: '#ffffff',
  qrDotStyle: 'square',
  qrCornerSquareStyle: 'square',
  qrCornerDotStyle: 'square',
  qrErrorCorrection: 'M',
  qrLogoSrc: '',
  qrMargin: 10,
})

// Tracks the QR element currently being edited to prevent reload loops
let _editingQRId = null
let _qrSyncTimer = null

const selectedQRElement = computed(() => {
  if (editorStore.selectedIds.length !== 1) return null
  const id = editorStore.selectedIds[0]
  return editorStore.currentElements.find((el) => el.id === id && el.type === 'qr') || null
})

// When a QR element is selected: load its props into qrConfig + auto-open QR tab
watch(selectedQRElement, (el) => {
  if (!el) {
    _editingQRId = null
    return
  }
  if (el.id === _editingQRId) return
  _editingQRId = el.id
  qrConfig.qrFields = { ...el.qrFields }
  qrConfig.qrMode = el.qrMode || 'standard'
  qrConfig.qrForeground = el.qrForeground || '#000000'
  qrConfig.qrBackground = el.qrBackground || '#ffffff'
  qrConfig.qrDotStyle = el.qrDotStyle || 'square'
  qrConfig.qrCornerSquareStyle = el.qrCornerSquareStyle || 'square'
  qrConfig.qrCornerDotStyle = el.qrCornerDotStyle || 'square'
  qrConfig.qrErrorCorrection = el.qrErrorCorrection || 'M'
  qrConfig.qrLogoSrc = el.qrLogoSrc || ''
  qrConfig.qrMargin = el.qrMargin ?? 10
  for (const item of editorStore.contactExtra || []) {
    if (qrConfig.qrFields[item.id] === undefined) qrConfig.qrFields[item.id] = true
  }
  if (activeTab.value !== 'qr') activeTab.value = 'qr'
})

// When qrConfig changes + QR selected → debounced apply to element
watch(
  qrConfig,
  () => {
    if (!selectedQRElement.value) return
    clearTimeout(_qrSyncTimer)
    _qrSyncTimer = setTimeout(() => {
      if (!selectedQRElement.value) return
      editorStore.updateElement(selectedQRElement.value.id, {
        qrFields: { ...qrConfig.qrFields },
        qrMode: qrConfig.qrMode,
        qrForeground: qrConfig.qrForeground,
        qrBackground: qrConfig.qrBackground,
        qrDotStyle: qrConfig.qrDotStyle,
        qrCornerSquareStyle: qrConfig.qrCornerSquareStyle,
        qrCornerDotStyle: qrConfig.qrCornerDotStyle,
        qrErrorCorrection: qrConfig.qrErrorCorrection,
        qrLogoSrc: qrConfig.qrLogoSrc,
        qrMargin: qrConfig.qrMargin,
      })
    }, 150)
  },
  { deep: true },
)

// Auto-initialize qrFields for newly added custom fields
watch(
  () => editorStore.contactExtra,
  (extras) => {
    if (!Array.isArray(extras)) return
    for (const item of extras) {
      if (qrConfig.qrFields[item.id] === undefined) qrConfig.qrFields[item.id] = true
    }
  },
  { immediate: true, deep: true },
)

function insertQR() {
  editorStore.addQRElement({ ...qrConfig, qrFields: { ...qrConfig.qrFields } })
}
</script>
