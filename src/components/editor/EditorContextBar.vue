<template>
  <!-- Only render when something is selected -->
  <div
    v-if="editorStore.selectedIds.length > 0"
    class="flex items-center gap-1 px-3 h-11 shrink-0 border-b overflow-x-auto"
    :class="
      themeStore.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
    "
  >
    <!-- ── LOCK / UNLOCK BUTTON ──────────────────────────────────────── -->
    <template v-if="isSelectionLocked !== null">
      <button
        @click="editorStore.toggleLock(editorStore.selectedIds)"
        class="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors shrink-0"
        :class="isSelectionLocked
          ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
          : (themeStore.darkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900')"
        :title="isSelectionLocked ? 'Déverrouiller (Alt+L)' : 'Verrouiller (Alt+L)'"
      >
        <Lock v-if="isSelectionLocked" class="w-3.5 h-3.5 shrink-0" />
        <LockOpen v-else class="w-3.5 h-3.5 shrink-0" />
        <span>{{ isSelectionLocked ? 'Déverrouillé' : 'Verrouiller' }}</span>
      </button>
      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />
    </template>

    <!-- ── UNLOCK ALL BUTTON ─────────────────────────────────────────── -->
    <template v-if="hasAnyLocked">
      <button
        @click="editorStore.unlockAll()"
        class="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors shrink-0 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
        title="Tout déverrouiller"
      >
        <LockOpen class="w-3.5 h-3.5 shrink-0" />
        <span>Tout déverrouiller</span>
      </button>
      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />
    </template>

    <!-- ── TEXT CONTROLS ──────────────────────────────────────────────── -->
    <ContextBarText
      v-if="!sel?.locked && selType === 'text'"
      v-model:fill-mode="shapeFillMode"
      v-model:grad-from="shapeGradFrom"
      v-model:grad-to="shapeGradTo"
      v-model:grad-angle="shapeGradAngle"
      @open-fill="onTextOpenFill"
      @toggle-gradient="toggleTextGradient"
      @update-gradient="updateGradientFill"
      @commit-gradient="commitGradientFill"
      @solid-input="updSolidFill"
      @solid-change="commitSolidFill"
    />

    <!-- ── LINE / ARROW CONTROLS ─────────────────────────────────────── -->
    <ContextBarLine
      v-else-if="
        !sel?.locked && selType === 'shape' &&
        (sel.shapeType === 'line' || sel.shapeType === 'line-bar' ||
         sel.shapeType === 'arrow' || sel.shapeType === 'arrow-double')
      "
    />

    <!-- ── SHAPE CONTROLS ─────────────────────────────────────────────── -->
    <ContextBarShape
      v-else-if="!sel?.locked && selType === 'shape'"
      @open-fill="onShapeOpenFill"
    />

    <!-- ── ICON CONTROLS ──────────────────────────────────────────────── -->
    <ContextBarIcon v-else-if="!sel?.locked && selType === 'icon'" />

    <!-- ── QR CODE CONTROLS ────────────────────────────────────────────── -->
    <ContextBarQR v-else-if="!sel?.locked && selType === 'qr'" />

    <!-- ── IMAGE CONTROLS ───────────────────────────────────────────────── -->
    <ContextBarImage v-else-if="!sel?.locked && selType === 'image'" />

    <!-- ── MULTI-SELECTION TOOLBAR ────────────────────────────────────── -->
    <ContextBarMulti />

    <!-- ── COMMON CONTROLS (all element types) ────────────────────────── -->
    <ContextBarCommon />

    <!-- ── GRADIENT FILL POPOVER (shared by Shape + Text) ─────────────── -->
    <GradientFillPopover
      v-model:open="fillPopoverOpen"
      :popover-style="fillPopoverStyle"
      v-model:fill-mode="shapeFillMode"
      v-model:grad-angle="shapeGradAngle"
      v-model:grad-from="shapeGradFrom"
      v-model:grad-to="shapeGradTo"
      :current-fill="sel?.fill"
      :trigger-ref="fillTriggerRef"
      @solid-input="updSolidFill"
      @solid-change="commitSolidFill"
      @grad-input="updateGradientFill"
      @grad-change="commitGradientFill"
    />
  </div>

  <!-- Placeholder bar when nothing selected -->
  <div
    v-else
    class="flex items-center gap-2 px-4 h-11 shrink-0 border-b"
    :class="themeStore.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
  >
    <RectangleHorizontal class="w-3.5 h-3.5 opacity-30" />
    <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-600' : 'text-gray-400'">
      Cliquez sur un élément pour le modifier
    </span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { RectangleHorizontal, Lock, LockOpen } from 'lucide-vue-next'
import ContextBarImage from './contextbar/ContextBarImage.vue'
import ContextBarQR from './contextbar/ContextBarQR.vue'
import ContextBarIcon from './contextbar/ContextBarIcon.vue'
import ContextBarLine from './contextbar/ContextBarLine.vue'
import ContextBarMulti from './contextbar/ContextBarMulti.vue'
import ContextBarCommon from './contextbar/ContextBarCommon.vue'
import ContextBarShape from './contextbar/ContextBarShape.vue'
import ContextBarText from './contextbar/ContextBarText.vue'
import GradientFillPopover from './contextbar/GradientFillPopover.vue'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'
import { normalizeRuns } from '@/utils/textRuns'

const editorStore = useEditorStore()
const themeStore = useThemeStore()

const sel = computed(() => editorStore.singleSelected)
const selType = computed(() => sel.value?.type ?? null)

// Returns true/false for lock button (single element or group), null when no selection
const isSelectionLocked = computed(() => {
  if (!editorStore.selectedIds.length) return null
  const firstId = editorStore.selectedIds[0]
  const el = editorStore.currentElements.find((e) => e.id === firstId)
  if (!el) return null
  return !!el.locked
})

const hasAnyLocked = computed(() => editorStore.currentElements.some((el) => el.locked))

const divCls = computed(() => (themeStore.darkMode ? 'bg-gray-700' : 'bg-gray-200'))

// ── Shape fill mode (solid / gradient) ────────────────────────────────────
const shapeFillMode = ref('solid')
const shapeGradAngle = ref(135)
const shapeGradFrom = ref('#3B82F6')
const shapeGradTo = ref('#8B5CF6')
const fillPopoverOpen = ref(false)
const fillTriggerRef = ref(null)
const fillPopoverStyle = ref({})

watch(sel, (el, prevEl) => {
  if (el?.id !== prevEl?.id) fillPopoverOpen.value = false
  if (!el) return
  if (el.fillGradient?.from) {
    shapeFillMode.value = 'gradient'
    shapeGradAngle.value = el.fillGradient.angle ?? 135
    shapeGradFrom.value = el.fillGradient.from
    shapeGradTo.value = el.fillGradient.to ?? el.fillGradient.from
  } else {
    shapeFillMode.value = 'solid'
    shapeGradFrom.value = el.fill || '#3B82F6'
  }
}, { immediate: true })

function _withRunColorsCleaned(patch) {
  const el = sel.value
  if ((el.type === 'text' || el.type === 'contact') && el.runs?.some((r) => 'color' in r)) {
    patch.runs = normalizeRuns(el.runs.map(({ color: _c, ...rest }) => rest))
  }
  return patch
}

function updSolidFill(color) {
  if (!sel.value) return
  editorStore.updateElement(sel.value.id, _withRunColorsCleaned({ fill: color, fillGradient: undefined }))
}

function commitSolidFill(color) {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, _withRunColorsCleaned({ fill: color, fillGradient: undefined }))
}

function updateGradientFill() {
  if (!sel.value) return
  editorStore.updateElement(sel.value.id, {
    fill: '',
    fillGradient: { angle: shapeGradAngle.value, from: shapeGradFrom.value, to: shapeGradTo.value },
  })
}

function commitGradientFill() {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, {
    fill: '',
    fillGradient: { angle: shapeGradAngle.value, from: shapeGradFrom.value, to: shapeGradTo.value },
  })
}

function toggleTextGradient() {
  if (shapeFillMode.value === 'gradient') {
    commitSolidFill(shapeGradFrom.value)
  } else {
    shapeFillMode.value = 'gradient'
    commitGradientFill()
  }
}

function onTextOpenFill(triggerEl) {
  fillTriggerRef.value = triggerEl
  const rect = triggerEl.getBoundingClientRect()
  fillPopoverStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 6}px`,
    left: `${Math.min(rect.left, window.innerWidth - 220)}px`,
    zIndex: 9999,
  }
  fillPopoverOpen.value = !fillPopoverOpen.value
}

function onShapeOpenFill(triggerEl) {
  fillTriggerRef.value = triggerEl
  const rect = triggerEl.getBoundingClientRect()
  fillPopoverStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 6}px`,
    left: `${Math.min(rect.left, window.innerWidth - 220)}px`,
    zIndex: 9999,
  }
  fillPopoverOpen.value = !fillPopoverOpen.value
}
</script>
