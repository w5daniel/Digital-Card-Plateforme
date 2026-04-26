<template>
  <template v-if="sel">
    <button
      @click="showCropModal = true"
      class="flex items-center gap-1 px-2 py-1.5 rounded text-xs transition-colors"
      :class="btnCls"
      title="Recadrer l'image"
    >
      <Crop class="w-3.5 h-3.5" />
      Rogner
    </button>
    <div class="w-px h-5 shrink-0" :class="divCls" />
    <button
      @click="toggleImageShape"
      class="flex items-center gap-1 px-2 py-1.5 rounded text-xs transition-colors"
      :class="[btnCls, sel.shape === 'circle' ? (themeStore.darkMode ? 'text-flame-400' : 'text-flame-600') : '']"
      :title="sel.shape === 'circle' ? 'Rendre rectangulaire' : 'Rendre circulaire'"
    >
      <CircleDashed class="w-3.5 h-3.5" />
      {{ sel.shape === 'circle' ? 'Rect.' : 'Cercle' }}
    </button>
    <template v-if="sel.cropWidth">
      <div class="w-px h-5 shrink-0" :class="divCls" />
      <button
        @click="editorStore.updateElementCommit(sel.id, { cropX: undefined, cropY: undefined, cropWidth: undefined, cropHeight: undefined })"
        class="flex items-center gap-1 px-2 py-1.5 rounded text-xs transition-colors"
        :class="btnCls"
        title="Réinitialiser le recadrage"
      >
        <RotateCw class="w-3.5 h-3.5" />
        Réinitialiser
      </button>
    </template>

    <ImageCropModal
      v-if="showCropModal && sel.src"
      :src="sel.src"
      :initial-crop-x="sel.cropX"
      :initial-crop-y="sel.cropY"
      :initial-crop-width="sel.cropWidth"
      :initial-crop-height="sel.cropHeight"
      @confirm="onCropConfirm"
      @cancel="showCropModal = false"
    />
  </template>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Crop, CircleDashed, RotateCw } from 'lucide-vue-next'
import ImageCropModal from '../ImageCropModal.vue'
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

const showCropModal = ref(false)

function toggleImageShape() {
  if (!sel.value) return
  const isCircle = sel.value.shape === 'circle'
  editorStore.updateElementCommit(sel.value.id, {
    shape: isCircle ? undefined : 'circle',
    borderRadius: isCircle ? 0 : 50,
  })
}

function onCropConfirm({ cropX, cropY, cropWidth, cropHeight }) {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, { cropX, cropY, cropWidth, cropHeight })
  showCropModal.value = false
}
</script>
