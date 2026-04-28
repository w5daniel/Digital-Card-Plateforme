<template>
  <div class="p-3 flex flex-col gap-3">
    <!-- Drop zone -->
    <div
      class="relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 transition-colors cursor-pointer"
      :class="isDragOver ? 'border-flame-500 bg-flame-50' : themeStore.darkMode ? 'border-onyx-700 hover:border-onyx-600 bg-onyx-800' : 'border-powder-300 hover:border-powder-400 bg-powder-50'"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
      @drop.prevent="onFileDrop"
      @click="fileInputRef?.click()"
    >
      <div class="p-3 rounded-full" :class="themeStore.darkMode ? 'bg-onyx-700' : 'bg-white shadow-sm'">
        <Upload class="w-6 h-6" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-400'" />
      </div>
      <div class="text-center">
        <p class="text-sm font-medium" :class="themeStore.darkMode ? 'text-powder-200' : 'text-onyx-700'">Glissez vos fichiers ici</p>
        <p class="text-xs mt-0.5" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">ou cliquez pour sélectionner</p>
      </div>
      <p class="text-[10px]" :class="themeStore.darkMode ? 'text-onyx-600' : 'text-onyx-400'">PNG, JPG, SVG, WebP — max 5 Mo</p>
      <input ref="fileInputRef" type="file" accept="image/*" multiple class="hidden" @change="onFileInput" />
    </div>

    <!-- Imported files -->
    <div v-if="importedImages.length">
      <p class="text-xs font-medium mb-2" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">Médias importés</p>
      <div class="grid grid-cols-2 gap-2">
        <div v-for="(img, i) in importedImages" :key="i" class="relative group flex flex-col gap-1">
          <div
            @click="insertImage(img)"
            draggable="true"
            @dragstart="onImageDragStart($event, img)"
            class="aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-105 hover:border-flame-400 cursor-pointer relative"
            :class="themeStore.darkMode ? 'border-onyx-700' : 'border-powder-200'"
            title="Cliquer pour insérer"
          >
            <img :src="img.dataUrl" :alt="img.name" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Plus class="w-4 h-4 text-white" />
            </div>
          </div>
          <button @click.stop="removeImportedImage(i)" class="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10" title="Supprimer">
            <X class="w-3 h-3" />
          </button>
          <select v-model="img.label" class="w-full text-[10px] rounded border px-1 py-0.5 outline-none" :class="themeStore.darkMode ? 'bg-onyx-800 border-onyx-700 text-powder-300' : 'bg-white border-powder-200 text-onyx-700'">
            <option value="logo">Logo</option>
            <option value="avatar">Photo</option>
            <option value="background">Arrière-plan</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tips -->
    <div class="rounded-lg p-3" :class="themeStore.darkMode ? 'bg-onyx-800' : 'bg-blue-50'">
      <p class="text-xs font-medium mb-1" :class="themeStore.darkMode ? 'text-blue-300' : 'text-blue-700'">Conseils</p>
      <ul class="text-xs space-y-1 list-disc list-inside" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-blue-600'">
        <li>Utilisez des PNG transparents pour les logos</li>
        <li>Préférez les images haute résolution</li>
        <li>Format recommandé : 300 DPI minimum</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Upload, X, Plus } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'

const editorStore = useEditorStore()
const themeStore = useThemeStore()
const { importedImages } = storeToRefs(editorStore)

const fileInputRef = ref(null)
const isDragOver = ref(false)

function processFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  if (file.size > 5 * 1024 * 1024) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    importedImages.value.push({ name: file.name, dataUrl: ev.target.result, label: 'logo' })
  }
  reader.readAsDataURL(file)
}

function onFileInput(e) {
  Array.from(e.target.files).forEach(processFile)
  e.target.value = ''
}

function onFileDrop(e) {
  isDragOver.value = false
  Array.from(e.dataTransfer.files).forEach(processFile)
}

function removeImportedImage(index) {
  importedImages.value.splice(index, 1)
}

function insertImage(img) {
  if (img.label === 'background') {
    const page = editorStore.activePage
    editorStore.elements[page] = editorStore.elements[page].filter((e) => e.role !== 'background')
    editorStore.addElement({ type: 'image', src: img.dataUrl, role: 'background', x: 0, y: 0, width: editorStore.cardWidth, height: editorStore.cardHeight })
    const arr = editorStore.elements[page]
    const newBg = arr[arr.length - 1]
    editorStore.elements[page] = [newBg, ...arr.slice(0, arr.length - 1)]
    editorStore.isDirty = true
  } else {
    editorStore.addElement({ type: 'image', src: img.dataUrl, role: img.label || 'logo', width: img.label === 'logo' ? 120 : 90, height: img.label === 'logo' ? 60 : 90, borderRadius: img.label === 'avatar' ? 50 : 0, shape: img.label === 'avatar' ? 'circle' : undefined })
  }
}

function onImageDragStart(event, img) {
  const isLogo = img.label === 'logo'
  const isAvatar = img.label === 'avatar'
  const data = {
    action: img.label === 'background' ? 'addImageBg' : 'addImage',
    preset: { src: img.dataUrl, role: img.label || 'logo', width: isLogo ? 120 : 90, height: isLogo ? 60 : 90, borderRadius: isAvatar ? 50 : 0, shape: isAvatar ? 'circle' : undefined },
  }
  event.dataTransfer.setData('application/editor-element', JSON.stringify(data))
  event.dataTransfer.effectAllowed = 'copy'
}
</script>
