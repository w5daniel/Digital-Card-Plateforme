<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('cancel')" />

      <!-- Panel -->
      <div
        class="relative flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        :class="themeStore.darkMode ? 'bg-onyx-900 text-white' : 'bg-white text-onyx-900'"
        style="max-width: 720px; width: 100%"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-5 py-3 border-b"
          :class="themeStore.darkMode ? 'border-onyx-700' : 'border-powder-200'"
        >
          <h3 class="font-semibold text-sm">Recadrer l'image</h3>
          <div class="flex items-center gap-3">
            <!-- Lock ratio toggle -->
            <label class="flex items-center gap-1.5 text-xs cursor-pointer select-none">
              <input type="checkbox" v-model="lockRatio" class="accent-violet-500" />
              <span :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">Ratio verrouillé</span>
            </label>
            <button
              @click="$emit('cancel')"
              class="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
              :class="themeStore.darkMode ? 'hover:bg-onyx-700 text-onyx-400' : 'hover:bg-powder-100 text-onyx-500'"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Crop area -->
        <div
          class="relative flex items-center justify-center overflow-hidden"
          style="background: repeating-conic-gradient(#80808020 0% 25%, transparent 0% 50%) 0 0 / 16px 16px; min-height: 300px; max-height: 480px"
          ref="containerRef"
          @mousemove.prevent="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
          @touchmove.prevent="onTouchMove"
          @touchend="onMouseUp"
        >
          <!-- Image -->
          <img
            v-if="src"
            :src="src"
            ref="imgRef"
            @load="onImageLoad"
            class="block select-none pointer-events-none"
            :style="{ width: displayW + 'px', height: displayH + 'px', maxWidth: '100%' }"
            draggable="false"
          />

          <!-- Dark overlay outside crop -->
          <template v-if="imageLoaded">
            <div
              class="absolute pointer-events-none"
              :style="{
                left: imgLeft + 'px',
                top: imgTop + 'px',
                width: displayW + 'px',
                height: cropY + 'px',
                background: 'rgba(0,0,0,0.5)',
              }"
            />
            <div
              class="absolute pointer-events-none"
              :style="{
                left: imgLeft + 'px',
                top: imgTop + cropY + cropH + 'px',
                width: displayW + 'px',
                height: displayH - cropY - cropH + 'px',
                background: 'rgba(0,0,0,0.5)',
              }"
            />
            <div
              class="absolute pointer-events-none"
              :style="{
                left: imgLeft + 'px',
                top: imgTop + cropY + 'px',
                width: cropX + 'px',
                height: cropH + 'px',
                background: 'rgba(0,0,0,0.5)',
              }"
            />
            <div
              class="absolute pointer-events-none"
              :style="{
                left: imgLeft + cropX + cropW + 'px',
                top: imgTop + cropY + 'px',
                width: displayW - cropX - cropW + 'px',
                height: cropH + 'px',
                background: 'rgba(0,0,0,0.5)',
              }"
            />

            <!-- Crop rectangle -->
            <div
              class="absolute border-2 border-white cursor-move select-none"
              :style="{
                left: imgLeft + cropX + 'px',
                top: imgTop + cropY + 'px',
                width: cropW + 'px',
                height: cropH + 'px',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
              }"
              @mousedown.prevent="startDrag('move', $event)"
              @touchstart.prevent="startDragTouch('move', $event)"
            >
              <!-- Rule-of-thirds grid -->
              <div class="absolute inset-0 pointer-events-none" style="display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr">
                <div v-for="n in 9" :key="n" class="border border-white/20" />
              </div>

              <!-- 8 resize handles -->
              <div
                v-for="h in handles"
                :key="h.type"
                class="absolute w-3 h-3 bg-white border border-powder-400 rounded-sm shadow-sm"
                :style="h.style"
                :class="h.cursor"
                @mousedown.prevent.stop="startDrag(h.type, $event)"
                @touchstart.prevent.stop="startDragTouch(h.type, $event)"
              />
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between px-5 py-3 border-t text-xs"
          :class="themeStore.darkMode ? 'border-onyx-700' : 'border-powder-200'"
        >
          <span :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">
            {{ Math.round(cropW / scale) }} × {{ Math.round(cropH / scale) }} px
          </span>
          <div class="flex gap-2">
            <button
              @click="resetCrop"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              :class="themeStore.darkMode ? 'bg-onyx-700 hover:bg-onyx-600 text-powder-300' : 'bg-powder-100 hover:bg-powder-200 text-onyx-600'"
            >Réinitialiser</button>
            <button
              @click="$emit('cancel')"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              :class="themeStore.darkMode ? 'bg-onyx-700 hover:bg-onyx-600 text-powder-300' : 'bg-powder-100 hover:bg-powder-200 text-onyx-600'"
            >Annuler</button>
            <button
              @click="confirmCrop"
              class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-violet-500 hover:bg-violet-600 text-white transition-colors"
            >Appliquer</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { X } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/themeStore'

const props = defineProps({
  src: { type: String, required: true },
  // Existing crop values in natural image pixels (undefined = no crop)
  initialCropX: { type: Number, default: undefined },
  initialCropY: { type: Number, default: undefined },
  initialCropWidth: { type: Number, default: undefined },
  initialCropHeight: { type: Number, default: undefined },
})

const emit = defineEmits(['confirm', 'cancel'])
const themeStore = useThemeStore()

const containerRef = ref(null)
const imgRef = ref(null)
const imageLoaded = ref(false)
const lockRatio = ref(false)

// Display dimensions (in px, constrained to container)
const displayW = ref(0)
const displayH = ref(0)
// Image position inside container (centered)
const imgLeft = ref(0)
const imgTop = ref(0)
// Scale factor: displayW / naturalWidth
const scale = ref(1)

// Crop rect in display space
const cropX = ref(0)
const cropY = ref(0)
const cropW = ref(100)
const cropH = ref(100)

const MIN_CROP = 20

async function onImageLoad() {
  const img = imgRef.value
  if (!img) return
  const container = containerRef.value
  const maxW = container ? container.clientWidth - 32 : 640
  const maxH = 440
  const nw = img.naturalWidth
  const nh = img.naturalHeight
  const s = Math.min(1, maxW / nw, maxH / nh)
  scale.value = s
  displayW.value = Math.round(nw * s)
  displayH.value = Math.round(nh * s)

  // Initialize crop rect
  if (props.initialCropWidth && props.initialCropHeight) {
    cropX.value = Math.round((props.initialCropX ?? 0) * s)
    cropY.value = Math.round((props.initialCropY ?? 0) * s)
    cropW.value = Math.round(props.initialCropWidth * s)
    cropH.value = Math.round(props.initialCropHeight * s)
  } else {
    // Full image crop by default
    cropX.value = 0
    cropY.value = 0
    cropW.value = displayW.value
    cropH.value = displayH.value
  }

  // Wait for Vue to re-render with the new displayW/displayH before reading
  // the image's actual position in the container. Without nextTick,
  // container.clientHeight still reflects the pre-render min-height (300px),
  // causing imgTop to go negative for tall images and shifting all overlays
  // and the crop rectangle above the visible area.
  await nextTick()
  if (imgRef.value) {
    imgLeft.value = imgRef.value.offsetLeft
    imgTop.value = imgRef.value.offsetTop
  }
  imageLoaded.value = true
}

// ── Drag logic ──────────────────────────────────────────────────────────────
const dragType = ref(null)
const dragStart = ref({ mouseX: 0, mouseY: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 })
const initialRatio = ref(1)

function startDrag(type, e) {
  dragType.value = type
  const clientX = e.clientX
  const clientY = e.clientY
  dragStart.value = { mouseX: clientX, mouseY: clientY, cropX: cropX.value, cropY: cropY.value, cropW: cropW.value, cropH: cropH.value }
  initialRatio.value = cropW.value / cropH.value
}

function startDragTouch(type, e) {
  const t = e.touches[0]
  startDrag(type, { clientX: t.clientX, clientY: t.clientY })
}

function onMouseMove(e) {
  if (!dragType.value) return
  applyDrag(e.clientX, e.clientY)
}

function onTouchMove(e) {
  if (!dragType.value) return
  const t = e.touches[0]
  applyDrag(t.clientX, t.clientY)
}

function onMouseUp() {
  dragType.value = null
}

function applyDrag(mx, my) {
  const dx = mx - dragStart.value.mouseX
  const dy = my - dragStart.value.mouseY
  const { cropX: sx, cropY: sy, cropW: sw, cropH: sh } = dragStart.value
  const maxX = displayW.value
  const maxY = displayH.value

  if (dragType.value === 'move') {
    cropX.value = Math.max(0, Math.min(maxX - cropW.value, sx + dx))
    cropY.value = Math.max(0, Math.min(maxY - cropH.value, sy + dy))
    return
  }

  let nx = sx, ny = sy, nw = sw, nh = sh

  if (dragType.value.includes('e')) { nw = Math.max(MIN_CROP, sw + dx) }
  if (dragType.value.includes('w')) { nx = sx + dx; nw = Math.max(MIN_CROP, sw - dx); if (nw === MIN_CROP) nx = sx + sw - MIN_CROP }
  if (dragType.value.includes('s')) { nh = Math.max(MIN_CROP, sh + dy) }
  if (dragType.value.includes('n')) { ny = sy + dy; nh = Math.max(MIN_CROP, sh - dy); if (nh === MIN_CROP) ny = sy + sh - MIN_CROP }

  if (lockRatio.value) {
    const ratio = initialRatio.value
    if (dragType.value.includes('e') || dragType.value.includes('w')) {
      nh = Math.round(nw / ratio)
    } else {
      nw = Math.round(nh * ratio)
    }
  }

  // Clamp to image bounds
  nx = Math.max(0, Math.min(maxX - MIN_CROP, nx))
  ny = Math.max(0, Math.min(maxY - MIN_CROP, ny))
  nw = Math.min(nw, maxX - nx)
  nh = Math.min(nh, maxY - ny)

  cropX.value = nx
  cropY.value = ny
  cropW.value = nw
  cropH.value = nh
}

function resetCrop() {
  cropX.value = 0
  cropY.value = 0
  cropW.value = displayW.value
  cropH.value = displayH.value
}

function confirmCrop() {
  const fullImage = cropX.value === 0 && cropY.value === 0 && cropW.value === displayW.value && cropH.value === displayH.value
  if (fullImage) {
    emit('confirm', { cropX: undefined, cropY: undefined, cropWidth: undefined, cropHeight: undefined })
  } else {
    // Use the actual natural/display ratio instead of the stored scale float,
    // to avoid cumulative rounding errors from Math.round(nw * s).
    const nw = imgRef.value?.naturalWidth || displayW.value
    const nh = imgRef.value?.naturalHeight || displayH.value
    const scaleX = nw / displayW.value
    const scaleY = nh / displayH.value
    emit('confirm', {
      cropX: Math.round(cropX.value * scaleX),
      cropY: Math.round(cropY.value * scaleY),
      cropWidth: Math.round(cropW.value * scaleX),
      cropHeight: Math.round(cropH.value * scaleY),
    })
  }
}

// ── Handle definitions ──────────────────────────────────────────────────────
const handles = computed(() => [
  { type: 'nw', style: { top: '-6px', left: '-6px' }, cursor: 'cursor-nw-resize' },
  { type: 'n',  style: { top: '-6px', left: 'calc(50% - 6px)' }, cursor: 'cursor-n-resize' },
  { type: 'ne', style: { top: '-6px', right: '-6px' }, cursor: 'cursor-ne-resize' },
  { type: 'e',  style: { top: 'calc(50% - 6px)', right: '-6px' }, cursor: 'cursor-e-resize' },
  { type: 'se', style: { bottom: '-6px', right: '-6px' }, cursor: 'cursor-se-resize' },
  { type: 's',  style: { bottom: '-6px', left: 'calc(50% - 6px)' }, cursor: 'cursor-s-resize' },
  { type: 'sw', style: { bottom: '-6px', left: '-6px' }, cursor: 'cursor-sw-resize' },
  { type: 'w',  style: { top: 'calc(50% - 6px)', left: '-6px' }, cursor: 'cursor-w-resize' },
])
</script>
