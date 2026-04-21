<template>
  <div
    ref="wrapperRef"
    class="relative flex-1 overflow-hidden flex items-center justify-center"
    :class="[isDragOver && 'ring-2 ring-inset ring-violet-400']"
    :style="themeStore.darkMode
      ? 'background-color:#0a0a0f; background-image:radial-gradient(circle,#1e2030 1px,transparent 1px); background-size:20px 20px'
      : 'background-color:#e5e7eb; background-image:radial-gradient(circle,#c4c9d4 1px,transparent 1px); background-size:20px 20px'"
    @click.self="editorStore.clearSelection(); closeCtxMenu()"
    @wheel.prevent="onWheel"
    @mouseup.self="onStageMouseUp"
    @contextmenu.prevent
    @dragover.prevent="isDragOver = true"
    @dragenter.prevent="isDragOver = true"
    @dragleave.self="isDragOver = false"
    @drop.prevent="onCardDrop"
  >
    <!-- Konva Stage -->
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @mousedown="onStageMouseDown"
      @mousemove="onStageMouseMove"
      @mouseup="onStageMouseUp"
      @touchstart="onStageMouseDown"
      @contextmenu="onContextMenu"
      @click="onStageClick"
    >
      <!-- Layer 1: Background (checkerboard + card shadow + card bg) -->
      <v-layer :config="{ listening: false }">
        <!-- Outer canvas background -->
        <v-rect :config="outerBgConfig" />
        <!-- Card drop shadow -->
        <v-rect :config="cardShadowConfig" />
        <!-- Card background -->
        <v-rect :config="cardBgConfig" @click="editorStore.clearSelection()" />
      </v-layer>

      <!-- Layer 2: Elements + Transformer -->
      <v-layer ref="elementsLayerRef" @dragstart="onLayerDragStart" @dragmove="onLayerDragMove">
        <!-- All elements, clipped to card rect -->
        <v-group :config="cardGroupConfig">
          <!-- Group bounding box indicators (dashed outline, hidden when group fully selected) -->
          <v-rect
            v-for="(bounds, gid) in groupBoundingBoxes"
            :key="'group-bb-' + gid"
            :config="{
              x: bounds.x,
              y: bounds.y,
              width: bounds.width,
              height: bounds.height,
              fill: 'transparent',
              stroke: '#9e8ff5',
              strokeWidth: 1,
              dash: [5, 3],
              listening: true,
              draggable: true,
              name: 'group-indicator',
            }"
            @click="onGroupIndicatorClick(gid)"
            @dragstart="onGroupIndicatorDragStart($event, gid)"
            @dragmove="onGroupIndicatorDragMove($event, gid)"
            @dragend="onGroupIndicatorDragEnd($event, gid)"
          />

          <template v-for="el in editorStore.currentElements" :key="el.id">
            <!-- TEXT -->
            <template v-if="el.type === 'text' && el.visible">
              <v-text
                :config="buildTextConfig(el)"
                @click="onElementClick($event, el)"
                @tap="onElementClick($event, el)"
                @dblclick="startTextEdit(el, $event)"
                @dbltap="startTextEdit(el, $event)"
                @dragend="onDragEnd($event, el)"
                @transform="onTextTransform($event, el)"
                @transformend="onTransformEnd($event, el)"
              />
              <!-- Style-runs overlay: one v-text per segment when el.runs is set -->
              <v-text
                v-for="(segCfg, segIdx) in buildTextSegmentConfigs(el)"
                :key="el.id + '-seg-' + segIdx"
                :config="segCfg"
              />
              <!-- Custom underline color overlay — per text line when no runs, per segment when runs -->
              <v-line
                v-for="(ulCfg, ulIdx) in (hasRuns(el)
                  ? buildTextSegmentUnderlineConfigs(el)
                  : (el.underlineColor && el.textDecoration?.includes('underline')
                    ? buildTextUnderlineConfigs(el) : []))"
                :key="el.id + '-ul-' + ulIdx"
                :config="ulCfg"
              />
              <!-- Contact icon badge — shows that this element will display a contact icon in the preview -->
              <v-circle
                v-if="el.showContactIcon"
                :config="{ x: el.x + 2, y: el.y + 2, radius: 4, fill: '#3b82f6', opacity: 0.85, listening: false }"
              />
            </template>

            <!-- RECT shape -->
            <v-rect
              v-else-if="el.type === 'shape' && el.shapeType === 'rect' && el.visible"
              :config="buildRectConfig(el)"
              @click="onElementClick($event, el)"
              @tap="onElementClick($event, el)"
              @dragend="onDragEnd($event, el)"
              @transformend="onTransformEnd($event, el)"
            />

            <!-- CIRCLE/ELLIPSE shape -->
            <v-ellipse
              v-else-if="el.type === 'shape' && el.shapeType === 'circle' && el.visible"
              :config="buildEllipseConfig(el)"
              @click="onElementClick($event, el)"
              @tap="onElementClick($event, el)"
              @dragend="onDragEnd($event, el)"
              @transformend="onTransformEnd($event, el)"
            />

            <!-- LINE shape — uses v-line for proper dash/lineCap support -->
            <v-line
              v-else-if="el.type === 'shape' && el.shapeType === 'line' && el.visible"
              :config="buildLineConfig(el)"
              @click="onElementClick($event, el)"
              @tap="onElementClick($event, el)"
              @dragend="onDragEnd($event, el)"
              @transformend="onTransformEnd($event, el)"
            />

            <!-- ARROW shape -->
            <v-arrow
              v-else-if="el.type === 'shape' && el.shapeType === 'arrow' && el.visible"
              :config="buildArrowConfig(el)"
              @click="onElementClick($event, el)"
              @tap="onElementClick($event, el)"
              @dragend="onDragEnd($event, el)"
              @transformend="onTransformEnd($event, el)"
            />

            <!-- ARROW-DOUBLE shape (←→) -->
            <v-arrow
              v-else-if="el.type === 'shape' && el.shapeType === 'arrow-double' && el.visible"
              :config="buildArrowDoubleConfig(el)"
              @click="onElementClick($event, el)"
              @tap="onElementClick($event, el)"
              @dragend="onDragEnd($event, el)"
              @transformend="onTransformEnd($event, el)"
            />

            <!-- LINE-BAR shape (|—|) -->
            <v-shape
              v-else-if="el.type === 'shape' && el.shapeType === 'line-bar' && el.visible"
              :config="buildLineBarConfig(el)"
              @click="onElementClick($event, el)"
              @tap="onElementClick($event, el)"
              @dragend="onDragEnd($event, el)"
              @transformend="onTransformEnd($event, el)"
            />

            <!-- POLYGON shape -->
            <v-regular-polygon
              v-else-if="el.type === 'shape' && el.shapeType === 'polygon' && el.visible"
              :config="buildPolygonConfig(el)"
              @click="onElementClick($event, el)"
              @tap="onElementClick($event, el)"
              @dragend="onDragEndCenter($event, el)"
              @transformend="onTransformEndCenter($event, el)"
            />

            <!-- STAR shape -->
            <v-star
              v-else-if="el.type === 'shape' && el.shapeType === 'star' && el.visible"
              :config="buildStarConfig(el)"
              @click="onElementClick($event, el)"
              @tap="onElementClick($event, el)"
              @dragend="onDragEndCenter($event, el)"
              @transformend="onTransformEndCenter($event, el)"
            />

            <!-- CUSTOM POLYGON shape (diagonal cuts, trapezoids) -->
            <v-shape
              v-else-if="el.type === 'shape' && el.shapeType === 'custom-poly' && el.visible"
              :config="buildCustomPolyConfig(el)"
              @click="onElementClick($event, el)"
              @tap="onElementClick($event, el)"
              @dragend="onDragEnd($event, el)"
              @transformend="onTransformEnd($event, el)"
            />

            <!-- PATH shape (SVG path data) -->
            <v-path
              v-else-if="el.type === 'shape' && el.shapeType === 'path' && el.visible"
              :config="buildPathConfig(el)"
              @click="onElementClick($event, el)"
              @tap="onElementClick($event, el)"
              @dragend="onDragEnd($event, el)"
              @transformend="onTransformEnd($event, el)"
            />

            <!-- IMAGE element — v-group wrapper pour que clipFunc (cercle) soit
                 appliqué sur un Container Konva (clipFunc ignoré sur Shape) -->
            <v-group
              v-else-if="el.type === 'image' && el.visible && imageCache[el.id]"
              :config="buildImageConfig(el)"
              @click="onElementClick($event, el)"
              @tap="onElementClick($event, el)"
              @dragend="onDragEnd($event, el)"
              @transformend="onTransformEnd($event, el)"
            >
              <v-image :config="buildImageNodeConfig(el)" />
            </v-group>

            <!-- ICON element (SVG loaded from Iconify) -->
            <template v-else-if="el.type === 'icon' && el.visible">
              <v-image
                v-if="imageCache[el.id]"
                :config="buildIconConfig(el)"
                @click="onElementClick($event, el)"
                @tap="onElementClick($event, el)"
                @dragend="onDragEnd($event, el)"
                @transformend="onTransformEnd($event, el)"
              />
              <v-rect
                v-if="el.strokeWidth > 0"
                :config="buildIconBorderConfig(el)"
              />
            </template>

            <!-- QR code element (real QR image when loaded, grey placeholder while generating) -->
            <v-image
              v-else-if="el.type === 'qr' && el.visible && imageCache[el.id]"
              :config="buildQRConfig(el)"
              @click="onElementClick($event, el)"
              @tap="onElementClick($event, el)"
              @dragend="onDragEnd($event, el)"
              @transformend="onTransformEnd($event, el)"
            />
            <v-rect
              v-else-if="el.type === 'qr' && el.visible && !imageCache[el.id]"
              :config="buildQRPlaceholder(el)"
              @click="onElementClick($event, el)"
              @tap="onElementClick($event, el)"
              @dragend="onDragEnd($event, el)"
              @transformend="onTransformEnd($event, el)"
            />
          </template>

          <!-- Transformer (resize + rotate handles) -->
          <v-transformer ref="transformerRef" :config="transformerConfig" />
        </v-group>

        <!-- Endpoint handles — outside the clip group so they're visible at card edges -->
        <v-group :config="handleGroupConfig">
          <template v-if="selectedLineEl">
            <!-- Left endpoint (hollow — rotates around right endpoint) -->
            <v-circle
              :config="lineLeftHandleConfig"
              @dragmove="onLeftHandleDrag"
              @dragend="onLeftHandleDragEnd"
            />
            <!-- Right endpoint (filled — rotates around left endpoint) -->
            <v-circle
              :config="lineRightHandleConfig"
              @dragmove="onRightHandleDrag"
              @dragend="onRightHandleDragEnd"
            />
          </template>

          <!-- Text bottom handles: move + rotate -->
          <template v-if="selectedTextEl && !editingEl">
            <!-- Move handle (left): circle + icon -->
            <v-circle
              :config="textMoveHandleConfig"
              @mousedown="startTextMove"
              @touchstart="startTextMove"
            />
            <v-path :config="textMoveIconPathConfig" />
            <!-- Rotate handle (right): circle + icon -->
            <v-circle
              :config="textRotateHandleConfig"
              @mousedown="startTextRotate"
              @touchstart="startTextRotate"
            />
            <v-path :config="textRotateIconPathConfig" />
          </template>
        </v-group>
      </v-layer>

      <!-- Layer 3: Drag-selection rectangle (layer always present; rect toggled) -->
      <v-layer :config="{ listening: false }">
        <v-rect v-if="isDraggingSelection" :config="selectionRectConfig" />
      </v-layer>
    </v-stage>

    <!-- ── Grid overlay ──────────────────────────────────────────────── -->
    <div
      v-if="editorStore.showGrid"
      class="absolute inset-0 pointer-events-none z-10"
      :style="gridStyle"
    />

    <!-- ── Center guides overlay ───────────────────────────────────── -->
    <template v-if="editorStore.showCenterGuides">
      <!-- Horizontal center line -->
      <div
        class="absolute pointer-events-none z-10"
        :style="{
          left: cardOffset.x + 'px',
          top: cardOffset.y + (editorStore.cardHeight * editorStore.zoom) / 2 + 'px',
          width: editorStore.cardWidth * editorStore.zoom + 'px',
          height: '1px',
          background: themeStore.darkMode ? 'rgba(139,92,246,0.4)' : 'rgba(124,58,237,0.35)',
          borderTop:
            '1px dashed ' + (themeStore.darkMode ? 'rgba(139,92,246,0.6)' : 'rgba(124,58,237,0.5)'),
        }"
      />
      <!-- Vertical center line -->
      <div
        class="absolute pointer-events-none z-10"
        :style="{
          left: cardOffset.x + (editorStore.cardWidth * editorStore.zoom) / 2 + 'px',
          top: cardOffset.y + 'px',
          width: '1px',
          height: editorStore.cardHeight * editorStore.zoom + 'px',
          background: themeStore.darkMode ? 'rgba(139,92,246,0.4)' : 'rgba(124,58,237,0.35)',
          borderLeft:
            '1px dashed ' + (themeStore.darkMode ? 'rgba(139,92,246,0.6)' : 'rgba(124,58,237,0.5)'),
        }"
      />
    </template>

    <!-- ── Safe zone overlay (3mm bleed margin) ────────────────────── -->
    <div
      v-if="editorStore.showSafeZone"
      class="absolute pointer-events-none z-10 rounded"
      :style="safeZoneStyle"
    />

    <!-- ── Snap guide lines (live during drag) ───────────────────────── -->
    <template v-if="snapGuides.length">
      <div
        v-for="(guide, i) in snapGuides"
        :key="i"
        class="absolute pointer-events-none z-20"
        :style="guide.type === 'V'
          ? {
              left: cardOffset.x + guide.pos * editorStore.zoom + 'px',
              top: cardOffset.y + 'px',
              width: '1px',
              height: editorStore.cardHeight * editorStore.zoom + 'px',
              background: '#f43f5e',
            }
          : {
              left: cardOffset.x + 'px',
              top: cardOffset.y + guide.pos * editorStore.zoom + 'px',
              width: editorStore.cardWidth * editorStore.zoom + 'px',
              height: '1px',
              background: '#f43f5e',
            }"
      />
    </template>

    <!-- ── Textarea overlay for inline text editing ─────────────────── -->
    <textarea
      v-if="editingEl"
      ref="textareaRef"
      v-model="editingText"
      :style="textareaStyle"
      :class="[
        'absolute resize-none outline-none border-2 border-violet-500 rounded bg-transparent z-50 overflow-hidden p-0 leading-none',
        editingEl && hasRuns(editingEl) ? 'rich-text-editing' : '',
      ]"
      @blur="finishTextEdit"
      @keydown.esc="finishTextEdit"
      @keydown="onTextareaKeydown"
      @select="onTextareaSelectionChange"
      @keyup="onTextareaSelectionChange"
      @mouseup="onTextareaSelectionChange"
      @input="onTextareaSelectionChange"
    />

    <!-- ── Lock indicator overlays ───────────────────────────────────── -->
    <div
      v-for="ov in lockedOverlays"
      :key="'lk-' + ov.id"
      class="absolute pointer-events-none flex items-center justify-center rounded"
      :class="themeStore.darkMode ? 'bg-gray-900/80 text-amber-400' : 'bg-white/80 text-amber-500'"
      :style="{
        left: ov.x + 'px',
        top: ov.y + 'px',
        width: '16px',
        height: '16px',
        zIndex: 35,
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }"
    >
      <Lock style="width: 10px; height: 10px" />
    </div>

    <!-- ── Zoom hint ──────────────────────────────────────────────────── -->
    <div
      class="absolute bottom-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs pointer-events-none opacity-50"
      :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
    >
      Molette pour zoomer · Double-clic sur texte pour éditer
    </div>

    <!-- ── Card resize handles ───────────────────────────────────────────── -->
    <!-- Right edge -->
    <div
      :style="handleRight"
      class="absolute rounded-full bg-violet-400/30 hover:bg-violet-500/70 transition-colors"
      @mousedown.stop="startResize('right', $event)"
    />
    <!-- Bottom edge -->
    <div
      :style="handleBottom"
      class="absolute rounded-full bg-violet-400/30 hover:bg-violet-500/70 transition-colors"
      @mousedown.stop="startResize('bottom', $event)"
    />
    <!-- Bottom-right corner -->
    <div
      :style="handleCorner"
      class="absolute rounded-sm bg-violet-500 border-2 border-white hover:scale-125 transition-transform shadow-sm"
      @mousedown.stop="startResize('corner', $event)"
    />

    <!-- ── Context menu ─────────────────────────────────────────────────── -->
    <EditorContextMenu
      :visible="ctxVisible"
      :x="ctxX"
      :y="ctxY"
      :has-selection="editorStore.selectedIds.length > 0"
      :selection-count="editorStore.selectedIds.length"
      :has-clipboard="editorStore.clipboardEl.length > 0"
      :is-locked="!!(editorStore.singleSelected?.locked ?? editorStore.currentElements.find(e => e.id === editorStore.selectedIds[0])?.locked)"
      :is-grouped="editorStore.canUngroup"
      :dark="themeStore.darkMode"
      @copy="editorStore.copySelected(); closeCtxMenu()"
      @paste="editorStore.pasteClipboard(); closeCtxMenu()"
      @duplicate="editorStore.duplicateSelected(); closeCtxMenu()"
      @delete="editorStore.deleteSelected(); closeCtxMenu()"
      @toggle-lock="editorStore.toggleLock(editorStore.selectedIds); closeCtxMenu()"
      @align="(type) => { editorStore.alignElements(editorStore.selectedIds, type); closeCtxMenu() }"
      @group="editorStore.groupSelected(); closeCtxMenu()"
      @ungroup="editorStore.ungroupSelected(); closeCtxMenu()"
      @bring-to-front="editorStore.bringToFront(editorStore.singleSelected?.id); closeCtxMenu()"
      @bring-forward="editorStore.bringForward(editorStore.singleSelected?.id); closeCtxMenu()"
      @send-backward="editorStore.sendBackward(editorStore.singleSelected?.id); closeCtxMenu()"
      @send-to-back="editorStore.sendToBack(editorStore.singleSelected?.id); closeCtxMenu()"
      @select-all="editorStore.selectAll(); closeCtxMenu()"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useEditorStore, CARD_W } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { useCardsStore } from '@/stores/cards'
import { useFontStore } from '@/stores/fontStore'
import { buildEditorElements, LAYOUT_MAP, DEFAULT_EDITOR_PERSON } from '@/utils/templateLayouts'
import { loadIcon } from '@iconify/vue'
import { Lock } from 'lucide-vue-next'
import EditorContextMenu from '@/components/editor/EditorContextMenu.vue'
import { generateQRDataURL, buildVCardFromFields, DEFAULT_QR_FIELDS } from '@/utils/qrCodeHelper'

const editorStore = useEditorStore()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const cardsStore = useCardsStore()
const fontStore = useFontStore()

// ── Refs ──────────────────────────────────────────────────────────────────
const wrapperRef = ref(null)
const stageRef = ref(null)
const elementsLayerRef = ref(null)
const transformerRef = ref(null)
const textareaRef = ref(null)

// Redraw Konva layer when new fonts finish loading
watch(
  () => fontStore.loadedCount,
  () => {
    nextTick(() => {
      const layer = elementsLayerRef.value?.getNode()
      if (!layer) return
      // Clear Konva's text cache and force full redraw for all text nodes
      layer.find('Text').forEach((node) => node.clearCache())
      layer.batchDraw()
    })
  },
)

// ── Stage dimensions ──────────────────────────────────────────────────────
const stageWidth = ref(800)
const stageHeight = ref(600)

// ── Text editing state ────────────────────────────────────────────────────
// editingElId tracks by ID so updateElement (which replaces the object in the
// array) never makes editingEl stale — editingEl always resolves to the live
// object from the store.
const editingElId = ref(null)
const editingEl = computed(() =>
  editingElId.value
    ? editorStore.currentElements.find((el) => el.id === editingElId.value) ?? null
    : null,
)
const editingText = ref('')

// Sync text + runs to the store on every keystroke so Konva segments reflect
// the current text in real time (enables transparent-textarea approach).
watch(editingText, (newText) => {
  const el = editingEl.value
  if (!el) return
  const oldText = el.text || ''
  if (oldText === newText) return
  const { at, delta } = diffSingleEdit(oldText, newText)
  const patch = { text: newText }
  if (hasRuns(el)) {
    patch.runs =
      delta === 0
        ? normalizeRuns(el.runs, newText.length)
        : shiftRuns(el.runs, at, delta, newText.length)
  }
  editorStore.updateElement(el.id, patch)
})

function onTextareaSelectionChange() {
  const ta = textareaRef.value
  if (!ta || !editingEl.value) return
  editorStore.textEditState.elId = editingEl.value.id
  editorStore.textEditState.start = ta.selectionStart ?? 0
  editorStore.textEditState.end = ta.selectionEnd ?? 0
  if (_clearTextEditStateTimer) {
    clearTimeout(_clearTextEditStateTimer)
    _clearTextEditStateTimer = null
  }
}

let _clearTextEditStateTimer = null
function scheduleTextEditStateClear() {
  if (_clearTextEditStateTimer) clearTimeout(_clearTextEditStateTimer)
  _clearTextEditStateTimer = setTimeout(() => {
    editorStore.textEditState.elId = null
    editorStore.textEditState.start = 0
    editorStore.textEditState.end = 0
    _clearTextEditStateTimer = null
  }, 500)
}

// ── Drag & drop from sidebar ─────────────────────────────────────────────
const isDragOver = ref(false)

function onCardDrop(event) {
  isDragOver.value = false
  const raw = event.dataTransfer.getData('application/editor-element')
  if (!raw) return

  let data
  try {
    data = JSON.parse(raw)
  } catch {
    return
  }

  // Convert screen coords → card coords
  const rect = wrapperRef.value?.getBoundingClientRect()
  if (!rect) return

  const z = editorStore.zoom
  const ox = cardOffset.value.x
  const oy = cardOffset.value.y

  const w = data.dropWidth || data.preset?.width || 60
  const h = data.dropHeight || data.preset?.height || 40
  const cardX = Math.max(
    0,
    Math.min((event.clientX - rect.left - ox) / z - w / 2, editorStore.cardWidth - w),
  )
  const cardY = Math.max(
    0,
    Math.min((event.clientY - rect.top - oy) / z - h / 2, editorStore.cardHeight - h),
  )

  const pos = { x: cardX, y: cardY }

  if (data.action === 'addPath') {
    editorStore.addPathElement(data.pathData, data.pathViewBox || [24, 24], {
      ...data.preset,
      ...pos,
    })
  } else if (data.action === 'addIcon') {
    editorStore.addIconElement(data.icon, { ...data.preset, ...pos })
  } else if (data.action === 'addText') {
    const newTextEl = editorStore.addTextElement({ ...data.preset, ...pos })
    nextTick(() => syncTextRenderedDims(newTextEl.id))
  } else if (data.action === 'addShape') {
    editorStore.addShapeElement(data.shapeType, { ...data.preset, ...pos })
  } else if (data.action === 'addImage') {
    editorStore.addElement({ type: 'image', ...data.preset, ...pos })
  } else if (data.action === 'addImageBg') {
    // Background image: full card, z-index bottom — ignore drop position
    const page = editorStore.activePage
    editorStore.elements[page] = editorStore.elements[page].filter((e) => e.role !== 'background')
    editorStore.addElement({
      type: 'image',
      src: data.preset.src,
      role: 'background',
      x: 0,
      y: 0,
      width: editorStore.cardWidth,
      height: editorStore.cardHeight,
    })
    const arr = editorStore.elements[page]
    const newBg = arr[arr.length - 1]
    editorStore.elements[page] = [newBg, ...arr.slice(0, arr.length - 1)]
  } else if (data.action === 'applyTemplate') {
    const tpl = cardsStore.getTemplateBySlug(data.slug)
    if (tpl) {
      if (tpl.isPremium && !authStore.isPremium && !authStore.isAdmin) return
      if (tpl.editorData) {
        const ed = JSON.parse(JSON.stringify(tpl.editorData))
        editorStore.applyRectoTemplate(ed.elements?.recto || [], ed.backgrounds?.recto || tpl.colors?.primary || '#FFFFFF')
      } else {
        const layout = LAYOUT_MAP[tpl.slug] || 'center'
        const rectoEls = buildEditorElements(layout, DEFAULT_EDITOR_PERSON, tpl.colors)
        editorStore.applyRectoTemplate(rectoEls, tpl.colors.primary)
      }
      editorStore.templateSlug = tpl.slug
      editorStore.templatePrimaryColor = tpl.colors?.secondary || tpl.colors?.primary || '#6366F1'
    }
  }
}

// ── Context menu state ────────────────────────────────────────────────────
const ctxVisible = ref(false)
const ctxX = ref(0)
const ctxY = ref(0)

function openCtxMenu(clientX, clientY, elementId) {
  if (elementId && !editorStore.selectedIds.includes(elementId)) {
    editorStore.selectElement(elementId, false)
  }
  ctxX.value = clientX
  ctxY.value = clientY
  ctxVisible.value = true
}

function closeCtxMenu() {
  ctxVisible.value = false
}

function onContextMenu(e) {
  e.evt?.preventDefault()
  const target = e.target
  // If the click landed on the stage background, clear selection
  const stageNode = stageRef.value?.getNode()
  const elementId = target !== stageNode ? target?.id?.() : null
  if (!elementId) editorStore.clearSelection()
  openCtxMenu(e.evt.clientX, e.evt.clientY, elementId || null)
}

function onStageClick(e) {
  // A click fires right after mouseup — skip it if a drag-select just completed
  if (justFinishedDragSelect.value) {
    justFinishedDragSelect.value = false
    return
  }
  const target = e.target
  const stageNode = stageRef.value?.getNode()
  // Click on stage background (area outside elements) → deselect all
  if (target === stageNode || target === stageNode?.findOne('.background')) {
    editorStore.clearSelection()
  }
}

// ── Live drag/transform position tracking ────────────────────────────────
// Alias for editorStore.livePosState — reactive map { [elId]: { x, y, width? } }.
// Updated in onLayerDragMove / onTextTransform; cleared at dragend/transformend.
// Shared with EditorContextBar for live field updates.
const liveDragPos = editorStore.livePosState

// ── Snap guides (computed during drag, cleared on dragend) ────────────────
// Each guide: { type: 'H'|'V', pos: number } in canvas-space coordinates.
const snapGuides = ref([])

// ── Drag selection state ──────────────────────────────────────────────────
const isDraggingSelection = ref(false)
const justFinishedDragSelect = ref(false)
const selectionAdditive = ref(false)
const selectionStartPos = ref({ x: 0, y: 0 })
const selectionCurrentPos = ref({ x: 0, y: 0 })

const selectionRectConfig = computed(() => {
  const x = Math.min(selectionStartPos.value.x, selectionCurrentPos.value.x)
  const y = Math.min(selectionStartPos.value.y, selectionCurrentPos.value.y)
  const w = Math.abs(selectionCurrentPos.value.x - selectionStartPos.value.x)
  const h = Math.abs(selectionCurrentPos.value.y - selectionStartPos.value.y)
  return {
    x,
    y,
    width: w,
    height: h,
    fill: 'rgba(124, 58, 237, 0.08)',
    stroke: '#7C3AED',
    strokeWidth: 1,
    dash: [4, 4],
    listening: false,
  }
})

// ── Group bounding box indicators ────────────────────────────────────────
// One dashed-outline rect per group whose members are NOT all selected.
// Shown when group is deselected so users can see the group boundary and
// click empty space inside it to reselect the whole group.
const groupBoundingBoxes = computed(() => {
  // Reading liveDragPos (reactive) causes this computed to recompute on every drag frame.
  const livePos = liveDragPos
  const groups = {}
  for (const el of editorStore.currentElements) {
    if (!el.groupId || el.visible === false) continue
    const memberIds = editorStore.currentElements
      .filter((m) => m.groupId === el.groupId)
      .map((m) => m.id)
    const allSelected = memberIds.every((id) => editorStore.selectedIds.includes(id))
    if (allSelected) continue
    if (!groups[el.groupId]) {
      groups[el.groupId] = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    }
    const g = groups[el.groupId]
    const live = livePos[el.id]
    const px = live?.x ?? el.x
    const py = live?.y ?? el.y
    const isText = el.type === 'text' || el.type === 'contact'
    const cw = editorStore.cardWidth || 350
    const w = el.width ?? (isText
      ? Math.min(cw * 0.85, Math.max(150, (el.text || '').length * (el.fontSize || 16) * 0.65))
      : 100)
    const h = el.height || (isText ? (el.fontSize || 16) * 1.4 : 50)
    // Account for rotation: expand bounding box using rotated corners
    const rot = ((el.rotation || 0) * Math.PI) / 180
    if (rot === 0) {
      g.minX = Math.min(g.minX, px)
      g.minY = Math.min(g.minY, py)
      g.maxX = Math.max(g.maxX, px + w)
      g.maxY = Math.max(g.maxY, py + h)
    } else {
      const corners = [[0, 0], [w, 0], [w, h], [0, h]]
      const cos = Math.cos(rot), sin = Math.sin(rot)
      for (const [cx, cy] of corners) {
        const rx = px + cx * cos - cy * sin
        const ry = py + cx * sin + cy * cos
        g.minX = Math.min(g.minX, rx)
        g.minY = Math.min(g.minY, ry)
        g.maxX = Math.max(g.maxX, rx)
        g.maxY = Math.max(g.maxY, ry)
      }
    }
  }
  return Object.fromEntries(
    Object.entries(groups).map(([gid, b]) => [
      gid,
      { x: b.minX - 6, y: b.minY - 6, width: b.maxX - b.minX + 12, height: b.maxY - b.minY + 12 },
    ]),
  )
})

// Refresh Transformer when groupId assignments change (e.g. after Ctrl+G)
watch(
  () => editorStore.currentElements.map((el) => el.groupId).join(','),
  () => nextTick(updateTransformer),
)

// ── Image loading cache ───────────────────────────────────────────────────
const imageCache = ref({})
const imageSrcCache = ref({}) // tracks which src was used per element ID

function ensureImageLoaded(el) {
  if (el.type !== 'image' || !el.src) return
  // Skip if already cached with the exact same src
  if (imageCache.value[el.id] && imageSrcCache.value[el.id] === el.src) return
  const img = new window.Image()
  img.onload = () => {
    imageCache.value = { ...imageCache.value, [el.id]: img }
    imageSrcCache.value = { ...imageSrcCache.value, [el.id]: el.src }
  }
  img.src = el.src
}

// ── Icon loading (Iconify → SVG data URL → HTMLImage) ─────────────────────
const iconKeyCache = ref({}) // el.id → `${iconId}|${fill}` to detect color changes

async function ensureIconLoaded(el) {
  if (el.type !== 'icon' || !el.iconId) return
  const fill = el.fill || '#000000'
  const key = el.colorful ? el.iconId : `${el.iconId}|${fill}`
  if (imageCache.value[el.id] && iconKeyCache.value[el.id] === key) return
  try {
    const data = await loadIcon(el.iconId)
    if (!data) return
    const body = el.colorful ? data.body : data.body.replace(/currentColor/g, fill)
    const w = data.width || 24
    const h = data.height || 24
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
    await new Promise((resolve) => {
      const img = new window.Image()
      img.onload = () => {
        imageCache.value = { ...imageCache.value, [el.id]: img }
        iconKeyCache.value = { ...iconKeyCache.value, [el.id]: key }
        resolve()
      }
      img.onerror = resolve
      img.src = url
    })
  } catch (e) {
    console.warn('Icon load failed:', el.iconId, e)
  }
}

// ── QR code loading (qr-code-styling → blob URL → HTMLImage) ─────────────
const qrKeyCache = ref({}) // el.id → config key to detect changes
const qrGenCounter = ref({}) // el.id → generation counter to prevent stale overwrites

function qrCacheKey(el) {
  const contact = editorStore.contactData
  const fields = el.qrFields || DEFAULT_QR_FIELDS
  const fieldValues = Object.keys(fields)
    .filter((k) => fields[k])
    .map((k) => `${k}:${contact[k] || ''}`)
    .join('|')
  // Include active custom fields in cache key (undefined = included by default)
  const extras = editorStore.contactExtra || []
  const customValues = extras
    .filter((item) => fields[item.id] !== false)
    .map((item) => `${item.id}:${item.value || ''}`)
    .join('|')
  return [
    fieldValues,
    customValues,
    el.qrMode,
    el.qrForeground,
    el.qrBackground,
    el.qrDotStyle,
    el.qrCornerSquareStyle,
    el.qrCornerDotStyle,
    el.qrErrorCorrection,
    el.qrLogoSrc || '',
    el.qrMargin ?? 10,
  ].join('|')
}

async function ensureQRLoaded(el) {
  if (el.type !== 'qr') return
  const key = qrCacheKey(el)
  if (imageCache.value[el.id] && qrKeyCache.value[el.id] === key) return
  // Bump generation counter to detect stale completions
  const gen = (qrGenCounter.value[el.id] || 0) + 1
  qrGenCounter.value = { ...qrGenCounter.value, [el.id]: gen }
  try {
    const contact = editorStore.contactData
    const fields = el.qrFields || DEFAULT_QR_FIELDS
    const vcard = buildVCardFromFields(contact, fields, editorStore.contactExtra || [])
    const size = Math.max(el.width || 100, el.height || 100) * 2
    const url = await generateQRDataURL(vcard, el, size)
    // Skip if a newer generation was started while we were awaiting
    if (qrGenCounter.value[el.id] !== gen) {
      URL.revokeObjectURL(url)
      return
    }
    // Revoke previous blob URL to avoid memory leak
    const prevImg = imageCache.value[el.id]
    if (prevImg?.src?.startsWith('blob:')) URL.revokeObjectURL(prevImg.src)
    const img = new window.Image()
    img.onload = () => {
      if (qrGenCounter.value[el.id] !== gen) {
        URL.revokeObjectURL(url) // stale — revoke to avoid leak
        return
      }
      imageCache.value = { ...imageCache.value, [el.id]: img }
      qrKeyCache.value = { ...qrKeyCache.value, [el.id]: key }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
    }
    img.src = url
  } catch (e) {
    console.warn('QR generation failed:', el.id, e)
  }
}

// ── Context menu close on outside click ──────────────────────────────────
watch(ctxVisible, (val) => {
  if (val) document.addEventListener('mousedown', closeCtxMenu, { once: true })
})

// Watch elements + contact data (roles) + custom fields to trigger QR re-render
watch(
  [
    () => editorStore.currentElements,
    () => editorStore.contactData,
    () => editorStore.contactExtra,
  ],
  ([els]) =>
    els.forEach((el) => {
      ensureImageLoaded(el)
      ensureIconLoaded(el)
      ensureQRLoaded(el)
    }),
  { deep: true, immediate: true },
)

// ── Card offset (center card in stage) ───────────────────────────────────
const cardOffset = computed(() => ({
  x: (stageWidth.value - editorStore.cardWidth * editorStore.zoom) / 2,
  y: (stageHeight.value - editorStore.cardHeight * editorStore.zoom) / 2,
}))

// ── Lock indicator overlays ────────────────────────────────────────────────
const lockedOverlays = computed(() => {
  const z = editorStore.zoom
  const ox = cardOffset.value.x
  const oy = cardOffset.value.y
  return editorStore.currentElements
    .filter((el) => el.locked && el.visible !== false)
    .map((el) => ({
      id: el.id,
      // Top-right corner of the element
      x: ox + (el.x + (el.width || 80)) * z - 18,
      y: oy + el.y * z + 2,
    }))
})

// ── Stage config ──────────────────────────────────────────────────────────
const stageConfig = computed(() => ({
  width: stageWidth.value,
  height: stageHeight.value,
}))

// ── Layer configs ─────────────────────────────────────────────────────────
const outerBgConfig = computed(() => ({
  x: 0,
  y: 0,
  width: stageWidth.value,
  height: stageHeight.value,
  fill: themeStore.darkMode ? '#030712' : '#E5E7EB',
  listening: false,
}))

const cardShadowConfig = computed(() => ({
  x: cardOffset.value.x + 6 * editorStore.zoom,
  y: cardOffset.value.y + 6 * editorStore.zoom,
  width: editorStore.cardWidth * editorStore.zoom,
  height: editorStore.cardHeight * editorStore.zoom,
  fill: 'rgba(0,0,0,0.25)',
  cornerRadius: editorStore.cardBorderRadius * editorStore.zoom,
  listening: false,
}))

const cardBgConfig = computed(() => {
  const W = editorStore.cardWidth * editorStore.zoom
  const H = editorStore.cardHeight * editorStore.zoom
  const bg = editorStore.currentBackground
  const grad = parseCSSGradient(bg)
  const gradPropsObj = grad ? buildKonvaGradient(grad.angle, W, H, grad.from, grad.to) : {}
  return {
    x: cardOffset.value.x,
    y: cardOffset.value.y,
    width: W,
    height: H,
    fill: grad ? undefined : bg || '#ffffff',
    cornerRadius: editorStore.cardBorderRadius * editorStore.zoom,
    listening: true,
    ...gradPropsObj,
  }
})

// Group that contains elements — applies zoom + card offset as transform
const cardGroupConfig = computed(() => {
  const r = editorStore.cardBorderRadius
  const w = editorStore.cardWidth
  const h = editorStore.cardHeight
  return {
    x: cardOffset.value.x,
    y: cardOffset.value.y,
    scaleX: editorStore.zoom,
    scaleY: editorStore.zoom,
    clipFunc: (ctx) => {
      ctx.beginPath()
      ctx.moveTo(r, 0)
      ctx.lineTo(w - r, 0)
      ctx.quadraticCurveTo(w, 0, w, r)
      ctx.lineTo(w, h - r)
      ctx.quadraticCurveTo(w, h, w - r, h)
      ctx.lineTo(r, h)
      ctx.quadraticCurveTo(0, h, 0, h - r)
      ctx.lineTo(0, r)
      ctx.quadraticCurveTo(0, 0, r, 0)
      ctx.closePath()
    },
  }
})

// Group for endpoint handles — same transform as card group but NO clip,
// so handles remain visible even when dragged to card edges.
const handleGroupConfig = computed(() => ({
  x: cardOffset.value.x,
  y: cardOffset.value.y,
  scaleX: editorStore.zoom,
  scaleY: editorStore.zoom,
}))

// ── Transformer config ────────────────────────────────────────────────────
const ALL_ANCHORS = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'middle-left',
  'middle-right',
  'top-center',
  'bottom-center',
]
// Text: 4 corners (scale font) + 2 sides (change width). No top/bottom-center.
const TEXT_ANCHORS = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'middle-left',
  'middle-right',
]

const transformerConfig = computed(() => {
  const sel = editorStore.singleSelected
  const isText = sel?.type === 'text'
  const isLocked = !!sel?.locked
  return {
    borderStroke: '#7C3AED',
    borderStrokeWidth: 1.5,
    anchorFill: '#FFFFFF',
    anchorStroke: '#7C3AED',
    anchorSize: 10,
    anchorCornerRadius: 3,
    resizeEnabled: !isLocked,
    rotateEnabled: !isText && !isLocked, // custom rotation handle for text; none for locked
    enabledAnchors: isLocked ? [] : isText ? TEXT_ANCHORS : ALL_ANCHORS,
    keepRatio: false,
    anchorStyleFunc: (anchor) => {
      const name = anchor.name?.() || ''
      const isSide = name.includes('middle-left') || name.includes('middle-right')
      if (isSide) {
        // Pill shape: narrow vertical bar
        anchor.width(4)
        anchor.height(16)
        anchor.offsetX(2)
        anchor.offsetY(8)
        anchor.cornerRadius(8)
        anchor.fill('#7C3AED')
        anchor.stroke('transparent')
        anchor.strokeWidth(0)
        anchor.shadowEnabled(false)
      } else {
        // Rounded square with subtle shadow
        anchor.width(10)
        anchor.height(10)
        anchor.offsetX(5)
        anchor.offsetY(5)
        anchor.cornerRadius(3)
        anchor.fill('#ffffff')
        anchor.stroke('#7C3AED')
        anchor.strokeWidth(1.5)
        anchor.shadowEnabled(true)
        anchor.shadowColor('rgba(0,0,0,0.18)')
        anchor.shadowBlur(4)
        anchor.shadowOffsetX(0)
        anchor.shadowOffsetY(1)
      }
    },
    boundBoxFunc: (oldBox, newBox) => {
      if (newBox.width < 10 || newBox.height < 10) return oldBox
      return newBox
    },
  }
})

// ── Gradient helpers ──────────────────────────────────────────────────────
import {
  buildKonvaGradient,
  buildKonvaGradientCentered,
  parseCSSGradient,
  gradientProps,
  gradientPropsCentered,
} from '@/utils/gradientHelpers'

import {
  segmentize as segmentizeRuns,
  shiftRuns,
  diffSingleEdit,
  normalizeRuns,
} from '@/utils/textRuns'

// Canvas 2D text-width measurement (shared offscreen context)
const _measureCanvas =
  typeof document !== 'undefined' ? document.createElement('canvas') : null
const _measureCtx = _measureCanvas?.getContext('2d')
function measureSegmentWidth(text, fontSize, fontFamily, fontStyle, letterSpacing = 0) {
  if (!text) return 0
  if (!_measureCtx) return text.length * fontSize * 0.5
  _measureCtx.font = `${fontStyle || 'normal'} ${fontSize}px ${fontFamily || 'Inter'}`
  const w = _measureCtx.measureText(text).width
  return w + Math.max(0, text.length - 1) * (letterSpacing || 0)
}

function hasRuns(el) {
  return Array.isArray(el?.runs) && el.runs.length > 0
}

// ── Shadow helper ─────────────────────────────────────────────────────────
function shadowProps(el) {
  if (!el.shadowEnabled) return {}
  return {
    shadowEnabled: true,
    shadowColor: el.shadowColor || '#000000',
    shadowBlur: el.shadowBlur ?? 8,
    shadowOffsetX: el.shadowOffsetX ?? 3,
    shadowOffsetY: el.shadowOffsetY ?? 3,
    shadowOpacity: el.shadowOpacity ?? 0.35,
  }
}

// ── Element config builders ───────────────────────────────────────────────
function buildTextConfig(el) {
  // When a custom underline color is set, disable Konva's native underline (which always uses fill)
  // and let the v-line overlay handle it instead.
  const hasCustomUnderline = el.underlineColor && el.textDecoration?.includes('underline')
  const runsActive = hasRuns(el)
  const cfg = {
    id: el.id,
    x: el.x,
    y: el.y,
    width: el.width != null ? el.width : undefined,
    height: el.height != null ? el.height : undefined,
    text: el.text || '',
    fontSize: el.fontSize || 16,
    fontFamily: el.fontFamily || 'Inter',
    fontStyle: el.fontStyle || 'normal',
    textDecoration: runsActive || hasCustomUnderline ? '' : el.textDecoration || '',
    fill: runsActive
      ? 'rgba(0,0,0,0)'
      : el.fillGradient
        ? ''
        : el.fill || '#000000',
    ...(runsActive ? {} : gradientProps(el, el.width || 200, el.height || 40)),
    align: el.align || 'left',
    verticalAlign: el.verticalAlign || 'middle',
    opacity: editingEl.value?.id === el.id ? 0 : (el.opacity ?? 1),
    rotation: el.rotation || 0,
    letterSpacing: el.letterSpacing || 0,
    lineHeight: el.lineHeight || 1.25,
    draggable: !el.locked,
    wrap: el.wrap || 'word',
    listening: true,
    ...(runsActive ? {} : shadowProps(el)),
  }
  return cfg
}

// Build per-word v-text configs for a text element with runs, with word-level line breaking.
// Each word (token) is a separate Konva node positioned at its line's y offset so the text wraps
// naturally when containerW changes (side resize or window fit).
function buildTextSegmentConfigs(el) {
  if (!hasRuns(el)) return []
  const live = liveDragPos[el.id]
  const baseX = live?.x ?? el.x
  const baseY = live?.y ?? el.y
  const liveRot = live?.rotation ?? el.rotation ?? 0
  const fs = el.fontSize || 16
  const ff = el.fontFamily || 'Inter'
  const ls = el.letterSpacing || 0
  const lh = el.lineHeight || 1.25
  const lineH = fs * lh

  const globalStyle = {
    bold: (el.fontStyle || '').includes('bold'),
    italic: (el.fontStyle || '').includes('italic'),
    underline: (el.textDecoration || '').includes('underline'),
    color: el.fill || '#000000',
    underlineColor: el.underlineColor || '',
  }
  const segments = segmentizeRuns(el.text || '', el.runs, globalStyle)
  if (segments.length === 0) return []

  // Flatten segments into word-level tokens, preserving each token's style.
  const wordItems = []
  const containerW = live?.width ?? el.width ?? 200

  for (const seg of segments) {
    const parts = []
    if (seg.style.bold) parts.push('bold')
    if (seg.style.italic) parts.push('italic')
    const fontStyle = parts.join(' ') || 'normal'
    const tokens = seg.text.split(/(\s+)/).filter((t) => t !== '')
    for (const token of tokens) {
      if (/^\s+$/.test(token)) {
        wordItems.push({ text: token, style: seg.style, fontStyle, width: measureSegmentWidth(token, fs, ff, fontStyle, ls), isSpace: true })
        continue
      }
      const tokenW = measureSegmentWidth(token, fs, ff, fontStyle, ls)
      if (tokenW <= containerW) {
        wordItems.push({ text: token, style: seg.style, fontStyle, width: tokenW, isSpace: false })
      } else {
        // Word wider than container: break character by character like Konva native wrap
        let chunk = ''
        let chunkW = 0
        for (const char of token) {
          const charW = measureSegmentWidth(char, fs, ff, fontStyle, ls)
          if (chunkW + charW > containerW && chunk.length > 0) {
            wordItems.push({ text: chunk, style: seg.style, fontStyle, width: chunkW, isSpace: false })
            chunk = char
            chunkW = charW
          } else {
            chunk += char
            chunkW += charW
          }
        }
        if (chunk.length > 0) wordItems.push({ text: chunk, style: seg.style, fontStyle, width: chunkW, isSpace: false })
      }
    }
  }
  if (wordItems.length === 0) return []

  // Greedy line packing: break before a non-space token that doesn't fit.
  const lines = []
  let curLine = []
  let curLineW = 0
  for (const item of wordItems) {
    if (curLine.length > 0 && !item.isSpace && curLineW + item.width > containerW) {
      while (curLine.length > 0 && curLine[curLine.length - 1].isSpace) curLine.pop()
      if (curLine.length > 0) lines.push(curLine)
      curLine = [item]
      curLineW = item.width
    } else {
      curLine.push(item)
      curLineW += item.width
    }
  }
  while (curLine.length > 0 && curLine[curLine.length - 1].isSpace) curLine.pop()
  if (curLine.length > 0) lines.push(curLine)

  // Vertical alignment within a fixed height (corner drag locks el.height).
  const totalTextH = lines.length * lineH
  let vOffset = 0
  if (el.height != null) {
    const va = el.verticalAlign || 'middle'
    if (va === 'middle') vOffset = Math.max(0, (el.height - totalTextH) / 2)
    else if (va === 'bottom') vOffset = Math.max(0, el.height - totalTextH)
  }

  const opacity = el.opacity ?? 1
  const configs = []

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li]
    const lineW = line.reduce((a, item) => a + item.width, 0)
    const lineY = vOffset + li * lineH
    let wordX = 0
    if (el.align === 'center') wordX = Math.max(0, (containerW - lineW) / 2)
    else if (el.align === 'right') wordX = Math.max(0, containerW - lineW)

    for (const item of line) {
      const hasSegUnderline = item.style.underline
      const segUnderlineColor = item.style.underlineColor
      const useNativeUnderline = hasSegUnderline && !segUnderlineColor
      configs.push({
        x: baseX,
        y: baseY,
        offsetX: -wordX,
        offsetY: -lineY,
        width: item.width || undefined,
        height: undefined,
        text: item.text,
        fontSize: fs,
        fontFamily: ff,
        fontStyle: item.fontStyle,
        fill: item.style.color || '#000000',
        textDecoration: useNativeUnderline ? 'underline' : '',
        align: 'left',
        verticalAlign: 'top',
        letterSpacing: ls,
        lineHeight: lh,
        opacity,
        rotation: liveRot,
        listening: false,
        ...shadowProps(el),
        __customUnderline: hasSegUnderline && segUnderlineColor ? segUnderlineColor : null,
        __segWidth: item.width,
        __segOffset: wordX,
        __lineY: lineY,
      })
      wordX += item.width
    }
  }
  return configs
}

// Build per-segment custom-underline v-line configs when a segment has an
// underline with a dedicated color (Konva's native underline always uses fill).
function buildTextSegmentUnderlineConfigs(el) {
  const segs = buildTextSegmentConfigs(el)
  if (!segs.length) return []
  const live = liveDragPos[el.id]
  const baseX = live?.x ?? el.x
  const baseY = live?.y ?? el.y
  const fs = el.fontSize || 16
  const lh = el.lineHeight || 1.25
  const strokeW = Math.max(1, Math.round(fs * 0.07))
  const rot = live?.rotation ?? el.rotation ?? 0
  const underlineY = fs * lh * 0.92
  const out = []
  for (const s of segs) {
    if (!s.__customUnderline) continue
    out.push({
      x: baseX,
      y: baseY,
      offsetX: -s.__segOffset,
      // __lineY : décalage vertical de la ligne (multi-line layout). L'underline doit
      // être au bas du token, donc on descend de underlineY depuis le haut de sa ligne.
      offsetY: -(underlineY + (s.__lineY ?? 0)),
      points: [0, 0, s.__segWidth || 0, 0],
      stroke: s.__customUnderline,
      strokeWidth: strokeW,
      rotation: rot,
      opacity: el.opacity ?? 1,
      listening: false,
    })
  }
  return out
}

function buildTextUnderlineConfigs(el) {
  const live = liveDragPos[el.id]
  const lx = live?.x ?? el.x
  const ly = live?.y ?? el.y
  const fs = el.fontSize || 16
  const lh = el.lineHeight || 1.25
  const strokeW = Math.max(1, Math.round(fs * 0.07))
  const rot = el.rotation || 0

  // Use per-line metrics from liveDragPos (updated during resize), or read from Konva node
  const lines = live?.underlineLines || getTextUnderlineLines(el)
  if (!lines || lines.length === 0) {
    // Fallback: single line using actual text width (not container width)
    const textW = getTextNodeTextWidth(el)
    const underlineY = fs * lh * 0.92
    return [
      {
        x: lx,
        y: ly,
        offsetY: -underlineY,
        points: [0, 0, textW, 0],
        stroke: el.underlineColor,
        strokeWidth: strokeW,
        rotation: rot,
        opacity: el.opacity ?? 1,
        listening: false,
      },
    ]
  }

  return lines.map((line) => ({
    x: lx,
    y: ly,
    offsetX: -line.xOffset,
    offsetY: -line.y,
    points: [0, 0, line.width, 0],
    stroke: el.underlineColor,
    strokeWidth: strokeW,
    rotation: rot,
    opacity: el.opacity ?? 1,
    listening: false,
  }))
}

function buildRectConfig(el) {
  const W = el.width || 100
  const H = el.height || 100
  const gp = gradientProps(el, W, H)
  return {
    id: el.id,
    x: el.x,
    y: el.y,
    width: W,
    height: H,
    fill: el.fillGradient ? '' : el.fill || '#3B82F6',
    stroke: el.stroke || '',
    strokeWidth: el.strokeWidth || 0,
    cornerRadius: el.cornerRadius || 0,
    opacity: el.opacity ?? 1,
    rotation: el.rotation || 0,
    draggable: !el.locked,
    listening: true,
    ...gp,
    ...shadowProps(el),
  }
}

function buildEllipseConfig(el) {
  const W = el.width || 100
  const H = el.height || 100
  const gp = gradientPropsCentered(el, W, H)
  return {
    id: el.id,
    x: el.x + W / 2,
    y: el.y + H / 2,
    radiusX: W / 2,
    radiusY: H / 2,
    fill: el.fillGradient ? '' : el.fill || '#3B82F6',
    stroke: el.stroke || '',
    strokeWidth: el.strokeWidth || 0,
    opacity: el.opacity ?? 1,
    rotation: el.rotation || 0,
    draggable: !el.locked,
    listening: true,
    ...gp,
    ...shadowProps(el),
  }
}

function buildLineConfig(el) {
  const sw = el.strokeWidth || el.height || 4 // backward-compat with old el.height
  const w = el.width || 200
  return {
    id: el.id,
    x: el.x,
    y: el.y,
    // horizontal line from (0,0) → (w,0); rotation handles direction
    points: [0, 0, w, 0],
    stroke: el.fill || '#000000',
    strokeWidth: Math.max(1, sw),
    dash: el.dash && el.dash.length ? el.dash : undefined,
    lineCap: el.lineCap || 'round',
    lineJoin: el.lineJoin || 'round',
    // wide hit area so it's easy to click
    hitStrokeWidth: Math.max(14, sw),
    opacity: el.opacity ?? 1,
    rotation: el.rotation || 0,
    draggable: !el.locked,
    listening: true,
  }
}

function buildArrowConfig(el) {
  const h = el.height || 24
  const w = el.width || 200
  // shaft stroke width = explicit el.strokeWidth or proportional to height
  const sw = el.strokeWidth || Math.max(1, Math.round(h / 6))
  const headSize = Math.max(8, h * 0.75)
  return {
    id: el.id,
    x: el.x,
    y: el.y,
    // horizontal arrow; rotation from preset handles direction
    points: [0, h / 2, w - headSize * 0.4, h / 2],
    fill: el.fill || '#000000',
    stroke: el.fill || '#000000',
    strokeWidth: sw,
    pointerLength: el.pointerLength || headSize,
    pointerWidth: el.pointerWidth || headSize,
    hitStrokeWidth: Math.max(14, h),
    opacity: el.opacity ?? 1,
    rotation: el.rotation || 0,
    draggable: !el.locked,
    listening: true,
  }
}

function buildArrowDoubleConfig(el) {
  // Same as arrow but with arrowhead at both ends
  const cfg = buildArrowConfig(el)
  return { ...cfg, pointerAtBeginning: true }
}

function buildLineBarConfig(el) {
  // |—| : horizontal line with perpendicular bars at each end
  const sw = el.strokeWidth || el.height || 2
  const w = el.width || 200
  const barH = Math.max(sw * 5, 16) // bar height is 5× stroke width, min 16px
  const dash = el.dash || []
  return {
    id: el.id,
    x: el.x,
    y: el.y,
    width: w,
    height: barH,
    fill: 'transparent',
    stroke: el.fill || '#000000',
    strokeWidth: sw,
    dash,
    opacity: el.opacity ?? 1,
    rotation: el.rotation || 0,
    draggable: !el.locked,
    listening: true,
    hitStrokeWidth: Math.max(14, barH),
    sceneFunc(ctx, shape) {
      const W = shape.width()
      const H = shape.height()
      const mid = H / 2
      const native = ctx._context
      native.save()
      native.strokeStyle = shape.stroke()
      native.lineWidth = shape.strokeWidth()

      // Horizontal line — with dash pattern
      native.setLineDash(dash)
      native.beginPath()
      native.moveTo(0, mid)
      native.lineTo(W, mid)
      native.stroke()

      // Vertical bars — always solid
      native.setLineDash([])
      native.beginPath()
      native.moveTo(0, 0)
      native.lineTo(0, H)
      native.moveTo(W, 0)
      native.lineTo(W, H)
      native.stroke()

      native.restore()
    },
    hitFunc(ctx, shape) {
      // Redraw the same paths via Konva ctx so hit detection works
      const W = shape.width()
      const H = shape.height()
      const mid = H / 2
      ctx.beginPath()
      ctx.moveTo(0, mid)
      ctx.lineTo(W, mid)
      ctx.moveTo(0, 0)
      ctx.lineTo(0, H)
      ctx.moveTo(W, 0)
      ctx.lineTo(W, H)
      ctx.fillStrokeShape(shape)
    },
  }
}

function buildCustomPolyConfig(el) {
  const pts = el.polygonPoints || []
  return {
    id: el.id,
    x: el.x,
    y: el.y,
    width: el.width || 100,
    height: el.height || 100,
    fill: el.fillGradient ? '' : el.fill || '#ffffff',
    ...gradientProps(el, el.width || 100, el.height || 100),
    stroke: el.stroke || '',
    strokeWidth: el.strokeWidth || 0,
    opacity: el.opacity ?? 1,
    rotation: el.rotation || 0,
    draggable: !el.locked,
    listening: true,
    sceneFunc(ctx, shape) {
      const W = shape.width()
      const H = shape.height()
      ctx.beginPath()
      pts.forEach(([px, py], i) => {
        if (i === 0) ctx.moveTo(px * W, py * H)
        else ctx.lineTo(px * W, py * H)
      })
      ctx.closePath()
      ctx.fillStrokeShape(shape)
    },
  }
}

function buildPathConfig(el) {
  const vb = el.pathViewBox || [24, 24]
  return {
    id: el.id,
    x: el.x,
    y: el.y,
    data: el.pathData || '',
    fill: el.fillGradient ? '' : el.fill || '#3B82F6',
    ...gradientProps(el, el.width || 60, el.height || 60),
    stroke: el.stroke || '',
    strokeWidth: el.strokeWidth || 0,
    scaleX: (el.width || 60) / vb[0],
    scaleY: (el.height || 60) / vb[1],
    opacity: el.opacity ?? 1,
    rotation: el.rotation || 0,
    draggable: !el.locked,
    listening: true,
    hitStrokeWidth: 10,
    ...shadowProps(el),
  }
}

function buildPolygonConfig(el) {
  const r = Math.min(el.width || 110, el.height || 110) / 2
  return {
    id: el.id,
    x: el.x + (el.width || 110) / 2,
    y: el.y + (el.height || 110) / 2,
    sides: el.sides || 5,
    radius: r,
    fill: el.fillGradient ? '' : el.fill || '#3B82F6',
    ...gradientPropsCentered(el, el.width || 110, el.height || 110),
    stroke: el.stroke || '',
    strokeWidth: el.strokeWidth || 0,
    opacity: el.opacity ?? 1,
    rotation: el.rotation || 0,
    draggable: !el.locked,
    listening: true,
    ...shadowProps(el),
  }
}

function buildStarConfig(el) {
  const ro = Math.min(el.width || 120, el.height || 120) / 2
  const ri = ro * 0.45
  return {
    id: el.id,
    x: el.x + (el.width || 120) / 2,
    y: el.y + (el.height || 120) / 2,
    numPoints: el.numPoints || 5,
    outerRadius: ro,
    innerRadius: el.innerRadius || ri,
    fill: el.fillGradient ? '' : el.fill || '#3B82F6',
    ...gradientPropsCentered(el, el.width || 120, el.height || 120),
    stroke: el.stroke || '',
    strokeWidth: el.strokeWidth || 0,
    opacity: el.opacity ?? 1,
    rotation: el.rotation || 0,
    draggable: !el.locked,
    listening: true,
    ...shadowProps(el),
  }
}

// Config du groupe wrapper — porte l'ID, la position, la rotation, l'opacité,
// le draggable et le clipFunc (cercle). clipFunc doit être sur un Container
// (Group/Layer/Stage) : sur un nœud Shape/Image il est silencieusement ignoré.
function buildImageConfig(el) {
  const w = el.width || 200
  const h = el.height || 120
  const cfg = {
    id: el.id,
    x: el.x,
    y: el.y,
    width: w,   // requis pour node.width() dans onTransformEnd
    height: h,
    opacity: el.opacity ?? 1,
    rotation: el.rotation || 0,
    draggable: !el.locked,
    listening: true,
    ...shadowProps(el),
  }
  // clipFunc sur le GROUP (Container) — fonctionne ; sur v-image (Shape) il était ignoré
  cfg.clipFunc = el.shape === 'circle'
    ? (ctx) => { ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2) }
    : null
  return cfg
}

// Config du nœud v-image interne (positionné à 0/0 dans le groupe wrapper)
function buildImageNodeConfig(el) {
  const cfg = {
    x: 0,
    y: 0,
    width: el.width || 200,
    height: el.height || 120,
    image: imageCache.value[el.id] || null,
    listening: true,  // requis pour hit-detection — events bubblent au groupe parent
  }
  if (el.cropWidth && el.cropHeight) {
    cfg.cropX = el.cropX ?? 0
    cfg.cropY = el.cropY ?? 0
    cfg.cropWidth = el.cropWidth
    cfg.cropHeight = el.cropHeight
  }
  return cfg
}

function buildIconConfig(el) {
  return {
    id: el.id,
    x: el.x,
    y: el.y,
    width: el.width || 64,
    height: el.height || 64,
    image: imageCache.value[el.id] || null,
    opacity: el.opacity ?? 1,
    rotation: el.rotation || 0,
    draggable: !el.locked,
    listening: true,
    ...shadowProps(el),
  }
}

function buildIconBorderConfig(el) {
  const w = el.width || 64
  const h = el.height || 64
  const sw = el.strokeWidth || 0
  // Inset the rect by sw/2 so the stroke (centered on the rect edge) aligns exactly
  // with the icon boundary — instead of extending half a strokeWidth outside the icon.
  const inset = sw / 2
  return {
    x: el.x + inset,
    y: el.y + inset,
    width: Math.max(0, w - sw),
    height: Math.max(0, h - sw),
    fill: '',
    stroke: el.stroke || '#000000',
    strokeWidth: sw,
    opacity: el.opacity ?? 1,
    rotation: el.rotation || 0,
    listening: false,
  }
}

function buildQRConfig(el) {
  return {
    id: el.id,
    x: el.x,
    y: el.y,
    width: el.width || 100,
    height: el.height || 100,
    image: imageCache.value[el.id],
    opacity: el.opacity ?? 1,
    rotation: el.rotation || 0,
    draggable: !el.locked,
    listening: true,
  }
}

function buildQRPlaceholder(el) {
  return {
    id: el.id,
    x: el.x,
    y: el.y,
    width: el.width || 100,
    height: el.height || 100,
    fill: '#e5e7eb',
    opacity: el.opacity ?? 1,
    rotation: el.rotation || 0,
    draggable: !el.locked,
    listening: true,
    cornerRadius: 4,
  }
}

// ── Update transformer when selection changes ────────────────────────────
watch(
  () => [...editorStore.selectedIds],
  () =>
    nextTick(() => {
      updateTransformer()
      // Sync rendered dimensions so the context bar shows real width/height for text
      for (const id of editorStore.selectedIds) {
        const el = editorStore.currentElements.find((e) => e.id === id)
        if (el?.type === 'text') syncTextRenderedDims(id)
      }
    }),
  { deep: true },
)

// Invalide le cache underline quand le layout d'un texte change (fontSize, lineHeight, align,
// width, contenu). Sans ce watcher, liveDragPos.underlineLines reste stale après un changement
// de taille via +/-, et le souligné ne suit pas dynamiquement.
watch(
  () =>
    editorStore.currentElements
      .filter((el) => el.type === 'text')
      .map((el) => `${el.id}|${el.fontSize}|${el.lineHeight}|${el.align}|${el.width}|${el.text}`),
  (newKeys, oldKeys) => {
    if (!oldKeys) return
    const oldSet = new Set(oldKeys)
    for (const key of newKeys) {
      if (!oldSet.has(key)) {
        const id = key.split('|')[0]
        // Invalider immédiatement pour éviter d'afficher des positions stalles
        if (liveDragPos[id]) liveDragPos[id] = { ...liveDragPos[id], underlineLines: null }
        // Attendre Vue render + Konva draw (rAF) : textArr recompté seulement après le draw.
        // updateTransformer() ensuite pour que le cadre violet suive la nouvelle hauteur.
        nextTick(() => requestAnimationFrame(() => { syncTextRenderedDims(id); updateTransformer() }))
      }
    }
  },
)

function updateTransformer() {
  const tr = transformerRef.value?.getNode?.()
  const stage = stageRef.value?.getNode?.()
  if (!tr || !stage) return

  // Hide transformer handles while inline text editing is active
  if (editingEl.value) {
    tr.nodes([])
    tr.getLayer()?.batchDraw()
    return
  }

  // line/arrow/arrow-double use endpoint handles when selected solo.
  // In multi-selection they must be included in the Transformer so the group
  // bounding box is visible. line-bar always keeps the Transformer.
  const soloSelection = editorStore.selectedIds.length === 1
  const HANDLE_EXCLUDED = new Set(['line', 'arrow', 'arrow-double'])

  const nodes = editorStore.selectedIds
    .map((id) => {
      const el = editorStore.currentElements.find((e) => e.id === id)
      if (el?.locked) return null
      if (soloSelection && el && HANDLE_EXCLUDED.has(el.shapeType)) return null
      return stage.findOne('#' + id)
    })
    .filter(Boolean)
  tr.nodes(nodes)
  tr.getLayer()?.batchDraw()
}

// ── Line endpoint handles ─────────────────────────────────────────────────
// line, arrow, arrow-double → draggable endpoint circles replace the Transformer.
// line-bar stays with the Transformer (its y-offset makes endpoint math complex).

const LINE_HANDLE_TYPES = new Set(['line', 'arrow', 'arrow-double'])

const selectedLineEl = computed(() => {
  if (editorStore.selectedIds.length !== 1) return null
  const el = editorStore.currentElements.find((e) => e.id === editorStore.selectedIds[0])
  return el && !el.locked && LINE_HANDLE_TYPES.has(el.shapeType) ? el : null
})

// Returns stage coords of both visual endpoints plus the local offsets needed
// to recompute the node origin after dragging.
// line:          local left = (0, 0),   right = (w, 0)
// arrow/double:  local left = (0, h/2), right = (w, h/2)
function getLineEndpoints(el) {
  const live = liveDragPos[el.id]
  const px = live?.x ?? el.x
  const py = live?.y ?? el.y
  const r = ((el.rotation || 0) * Math.PI) / 180
  const w = el.width || 200
  const loy =
    el.shapeType === 'arrow' || el.shapeType === 'arrow-double' ? (el.height || 24) / 2 : 0
  const lox = 0,
    rox = w,
    roy = loy
  const c = Math.cos(r),
    s = Math.sin(r)
  return {
    lx: px + lox * c - loy * s,
    ly: py + lox * s + loy * c,
    rx: px + rox * c - roy * s,
    ry: py + rox * s + roy * c,
    lox,
    loy,
  }
}

// Compute the Konva node origin (el.x, el.y) given a new left-endpoint position
// and a new rotation angle in radians.
function nodeOriginFromLeft(lx, ly, lox, loy, rad) {
  return {
    ox: lx - lox * Math.cos(rad) + loy * Math.sin(rad),
    oy: ly - lox * Math.sin(rad) - loy * Math.cos(rad),
  }
}

const HANDLE_R = 5
const lineLeftHandleConfig = computed(() => {
  const el = selectedLineEl.value
  if (!el) return {}
  const { lx, ly } = getLineEndpoints(el)
  return {
    x: lx,
    y: ly,
    radius: HANDLE_R,
    fill: '#ffffff',
    stroke: '#7c3aed',
    strokeWidth: 2,
    draggable: true,
    hitStrokeWidth: 16,
  }
})

const lineRightHandleConfig = computed(() => {
  const el = selectedLineEl.value
  if (!el) return {}
  const { rx, ry } = getLineEndpoints(el)
  return {
    x: rx,
    y: ry,
    radius: HANDLE_R,
    fill: '#7c3aed',
    stroke: '#7c3aed',
    strokeWidth: 2,
    draggable: true,
    hitStrokeWidth: 16,
  }
})

// Right handle dragged → left endpoint stays fixed
function onRightHandleDrag(e) {
  const el = selectedLineEl.value
  if (!el) return
  const { lx, ly, lox, loy } = getLineEndpoints(el)
  const nx = e.target.x(),
    ny = e.target.y()
  const dx = nx - lx,
    dy = ny - ly
  const rad = Math.atan2(dy, dx)
  const { ox, oy } = nodeOriginFromLeft(lx, ly, lox, loy, rad)
  editorStore.updateElement(el.id, {
    x: ox,
    y: oy,
    width: Math.max(10, Math.sqrt(dx * dx + dy * dy)),
    rotation: (rad * 180) / Math.PI,
  })
}
function onRightHandleDragEnd(e) {
  const el = selectedLineEl.value
  if (!el) return
  const { lx, ly, lox, loy } = getLineEndpoints(el)
  const nx = e.target.x(),
    ny = e.target.y()
  const dx = nx - lx,
    dy = ny - ly
  const rad = Math.atan2(dy, dx)
  const { ox, oy } = nodeOriginFromLeft(lx, ly, lox, loy, rad)
  editorStore.updateElementCommit(el.id, {
    x: ox,
    y: oy,
    width: Math.max(10, Math.sqrt(dx * dx + dy * dy)),
    rotation: (rad * 180) / Math.PI,
  })
}

// Left handle dragged → right endpoint stays fixed
function onLeftHandleDrag(e) {
  const el = selectedLineEl.value
  if (!el) return
  const { rx, ry, lox, loy } = getLineEndpoints(el)
  const lx = e.target.x(),
    ly = e.target.y()
  const dx = rx - lx,
    dy = ry - ly
  const rad = Math.atan2(dy, dx)
  const { ox, oy } = nodeOriginFromLeft(lx, ly, lox, loy, rad)
  editorStore.updateElement(el.id, {
    x: ox,
    y: oy,
    width: Math.max(10, Math.sqrt(dx * dx + dy * dy)),
    rotation: (rad * 180) / Math.PI,
  })
}
function onLeftHandleDragEnd(e) {
  const el = selectedLineEl.value
  if (!el) return
  const { rx, ry, lox, loy } = getLineEndpoints(el)
  const lx = e.target.x(),
    ly = e.target.y()
  const dx = rx - lx,
    dy = ry - ly
  const rad = Math.atan2(dy, dx)
  const { ox, oy } = nodeOriginFromLeft(lx, ly, lox, loy, rad)
  editorStore.updateElementCommit(el.id, {
    x: ox,
    y: oy,
    width: Math.max(10, Math.sqrt(dx * dx + dy * dy)),
    rotation: (rad * 180) / Math.PI,
  })
}

// ── Text bottom handles (move + rotate) ───────────────────────────────────

const selectedTextEl = computed(() => {
  if (editorStore.selectedIds.length !== 1) return null
  const el = editorStore.currentElements.find((e) => e.id === editorStore.selectedIds[0])
  return el?.type === 'text' && !el.locked ? el : null
})

const TEXT_BOTTOM_HANDLE_R = 9
const TEXT_BOTTOM_HANDLE_GAP = 24 // px below bottom of text in card space
const TEXT_BOTTOM_HANDLE_SPACING = 16 // horizontal offset from bottom-center

// Get the Konva text node's rendered height (card-space px, unscaled)
function getTextHeight(el) {
  const stage = stageRef.value?.getNode()
  const node = stage?.findOne('#' + el.id)
  return node ? node.height() : el.fontSize || 20
}

// Get the Konva text node's rendered width (card-space px, unscaled)
function getTextWidth(el) {
  const stage = stageRef.value?.getNode()
  const node = stage?.findOne('#' + el.id)
  return node ? node.width() : el.fontSize * (el.text?.length || 5) * 0.6
}

// Get the actual rendered text width (not container width) from the Konva node
function getTextNodeTextWidth(el) {
  const stage = stageRef.value?.getNode()
  const node = stage?.findOne('#' + el.id)
  return node?.getTextWidth?.() ?? el.fontSize * (el.text?.length || 5) * 0.6
}

// Get per-line underline metrics from the Konva text node
function getTextUnderlineLines(el) {
  const stage = stageRef.value?.getNode()
  const node = stage?.findOne('#' + el.id)
  if (!node || !node.textArr || node.textArr.length === 0) return null
  const fs = node.fontSize()
  const lh = node.lineHeight()
  const lineHeightPx = fs * lh
  const containerW = node.width()
  const align = el.align || 'left'

  return node.textArr.map((line, i) => {
    let xOffset = 0
    if (align === 'center') xOffset = (containerW - line.width) / 2
    else if (align === 'right') xOffset = containerW - line.width
    return {
      xOffset,
      y: lineHeightPx * i + lineHeightPx * 0.92,
      width: line.width,
    }
  })
}

// Read actual Konva-rendered dimensions for a text node and cache them in liveDragPos
// so the context bar (which reads livePosState) always shows real values.
function syncTextRenderedDims(elId) {
  const stage = stageRef.value?.getNode()
  const node = stage?.findOne('#' + elId)
  if (!node) return
  const el = editorStore.currentElements.find((e) => e.id === elId)
  liveDragPos[elId] = {
    ...(liveDragPos[elId] || {}),
    width: node.width(),
    height: node.height(),
    underlineLines: el ? getTextUnderlineLines(el) : null,
  }
}

// Compute handle position accounting for element rotation.
// Returns {x, y} in card space usable inside handleGroupConfig.
function textHandlePos(el, offsetX, offsetY) {
  const live = liveDragPos[el.id]
  const px = live?.x ?? el.x
  const py = live?.y ?? el.y
  const h = getTextHeight(el)
  const r = ((el.rotation || 0) * Math.PI) / 180
  // Use live visual width (updated during resize) so handles track the resize in real time.
  const w = live?.width ?? el.width ?? getTextWidth(el)
  const lx = w / 2 + offsetX
  const ly = h + offsetY
  return {
    x: px + lx * Math.cos(r) - ly * Math.sin(r),
    y: py + lx * Math.sin(r) + ly * Math.cos(r),
  }
}

const textMoveHandleConfig = computed(() => {
  const el = selectedTextEl.value
  if (!el) return {}
  const { x, y } = textHandlePos(el, -TEXT_BOTTOM_HANDLE_SPACING, TEXT_BOTTOM_HANDLE_GAP)
  return {
    x,
    y,
    radius: TEXT_BOTTOM_HANDLE_R,
    fill: '#7C3AED',
    stroke: 'transparent',
    strokeWidth: 0,
    shadowEnabled: true,
    shadowColor: 'rgba(124,58,237,0.4)',
    shadowBlur: 8,
    shadowOffsetY: 2,
    cursor: 'move',
    hitStrokeWidth: 16,
  }
})

const textRotateHandleConfig = computed(() => {
  const el = selectedTextEl.value
  if (!el) return {}
  const { x, y } = textHandlePos(el, TEXT_BOTTOM_HANDLE_SPACING, TEXT_BOTTOM_HANDLE_GAP)
  return {
    x,
    y,
    radius: TEXT_BOTTOM_HANDLE_R,
    fill: '#7C3AED',
    stroke: 'transparent',
    strokeWidth: 0,
    shadowEnabled: true,
    shadowColor: 'rgba(124,58,237,0.4)',
    shadowBlur: 8,
    shadowOffsetY: 2,
    cursor: 'crosshair',
    hitStrokeWidth: 16,
  }
})

// SVG path icons rendered inside each handle circle (white vector icons)
const textMoveIconPathConfig = computed(() => {
  const el = selectedTextEl.value
  if (!el) return {}
  const { x, y } = textHandlePos(el, -TEXT_BOTTOM_HANDLE_SPACING, TEXT_BOTTOM_HANDLE_GAP)
  return {
    x,
    y,
    // 4-directional arrow cross, centered at (0,0)
    data: 'M0,-4.5 L0,4.5 M-4.5,0 L4.5,0 M-1.3,-2.8 L0,-4.5 L1.3,-2.8 M-1.3,2.8 L0,4.5 L1.3,2.8 M-2.8,-1.3 L-4.5,0 L-2.8,1.3 M2.8,-1.3 L4.5,0 L2.8,1.3',
    stroke: '#ffffff',
    strokeWidth: 1.3,
    fill: 'transparent',
    lineCap: 'round',
    lineJoin: 'round',
    listening: false,
  }
})

const textRotateIconPathConfig = computed(() => {
  const el = selectedTextEl.value
  if (!el) return {}
  const { x, y } = textHandlePos(el, TEXT_BOTTOM_HANDLE_SPACING, TEXT_BOTTOM_HANDLE_GAP)
  return {
    x,
    y,
    // 270° CW arc (top → left) + upward-pointing arrowhead at arc end
    data: 'M0,-3.3 A3.3,3.3,0,1,1,-3.3,0 M-4.6,1.2 L-3.3,0 L-2,1.2',
    stroke: '#ffffff',
    strokeWidth: 1.3,
    fill: 'transparent',
    lineCap: 'round',
    lineJoin: 'round',
    listening: false,
  }
})

// ── Text move via bottom handle ────────────────────────────────────────────
let textMoveState = null

function startTextMove(e) {
  e.cancelBubble = true
  const el = selectedTextEl.value
  if (!el) return
  textMoveState = {
    elId: el.id,
    startX: el.x,
    startY: el.y,
    startClientX: e.evt?.clientX ?? e.clientX,
    startClientY: e.evt?.clientY ?? e.clientY,
  }
  window.addEventListener('mousemove', onTextMoveMove)
  window.addEventListener('mouseup', onTextMoveUp)
}

function onTextMoveMove(e) {
  if (!textMoveState) return
  const zoom = editorStore.zoom
  const dx = (e.clientX - textMoveState.startClientX) / zoom
  const dy = (e.clientY - textMoveState.startClientY) / zoom
  const rawX = textMoveState.startX + dx
  const rawY = textMoveState.startY + dy

  let finalX = rawX
  let finalY = rawY

  if (editorStore.snapEnabled || editorStore.snapToEdges) {
    const el = editorStore.currentElements.find((el) => el.id === textMoveState.elId)
    const w = el?.width ?? getTextWidth(el)
    const h = el ? getTextHeight(el) : 0
    const snapped = computeSnapWithGuides(rawX, rawY, w, h, textMoveState.elId)
    finalX = snapped.x
    finalY = snapped.y
  } else {
    snapGuides.value = []
  }

  liveDragPos[textMoveState.elId] = { x: finalX, y: finalY }
  editorStore.updateElement(textMoveState.elId, { x: finalX, y: finalY })
}

function onTextMoveUp() {
  snapGuides.value = []
  window.removeEventListener('mousemove', onTextMoveMove)
  window.removeEventListener('mouseup', onTextMoveUp)
  if (textMoveState) {
    nextTick(() => syncTextRenderedDims(textMoveState.elId))
    editorStore.saveHistory()
  }
  textMoveState = null
}

// ── Text rotation via bottom handle ───────────────────────────────────────
let textRotateState = null

// Lignes de souligné originales capturées au début d'un resize drag (avant tout scaling).
// Permet de toujours scaler depuis les valeurs initiales et d'éviter l'accumulation d'échelle.
let resizeDragBaseLines = {}
const MIN_TEXT_SIDE_WIDTH = 20
// Baseline { fontSize, width, height, y } capturée au premier frame d'un corner drag.
let resizeDragBaseEl = {}
function startTextRotate(e) {
  e.cancelBubble = true
  const el = selectedTextEl.value
  if (!el) return

  const h = getTextHeight(el)
  const w = el.width ?? getTextWidth(el)
  const zoom = editorStore.zoom
  const r0 = ((el.rotation || 0) * Math.PI) / 180

  // Card-space center (kept fixed during rotation so it pivots from center)
  const cardCx = el.x + (w / 2) * Math.cos(r0) - (h / 2) * Math.sin(r0)
  const cardCy = el.y + (w / 2) * Math.sin(r0) + (h / 2) * Math.cos(r0)

  // Stage-space center (for angle calculation with mouse position)
  const stageCx = cardCx * zoom + cardOffset.value.x
  const stageCy = cardCy * zoom + cardOffset.value.y

  const stage = stageRef.value?.getNode()
  const container = stage?.container()
  const rect = container?.getBoundingClientRect()
  const clientX = e.evt?.clientX ?? e.clientX
  const clientY = e.evt?.clientY ?? e.clientY

  textRotateState = {
    elId: el.id,
    cardCx,
    cardCy,
    stageCx,
    stageCy,
    w,
    h,
    containerLeft: rect?.left ?? 0,
    containerTop: rect?.top ?? 0,
    startAngle: Math.atan2(
      clientY - (rect?.top ?? 0) - stageCy,
      clientX - (rect?.left ?? 0) - stageCx,
    ),
    startRotation: el.rotation || 0,
  }
  window.addEventListener('mousemove', onTextRotateMove)
  window.addEventListener('mouseup', onTextRotateUp)
}

function onTextRotateMove(e) {
  if (!textRotateState) return
  const mx = e.clientX - textRotateState.containerLeft
  const my = e.clientY - textRotateState.containerTop
  const angle = Math.atan2(my - textRotateState.stageCy, mx - textRotateState.stageCx)
  const delta = (angle - textRotateState.startAngle) * (180 / Math.PI)
  const newRotation = textRotateState.startRotation + delta
  const r = (newRotation * Math.PI) / 180
  const { cardCx, cardCy, w, h } = textRotateState
  // Recompute top-left so the visual center stays fixed
  const newX = cardCx - (w / 2) * Math.cos(r) + (h / 2) * Math.sin(r)
  const newY = cardCy - (w / 2) * Math.sin(r) - (h / 2) * Math.cos(r)
  editorStore.updateElement(textRotateState.elId, { x: newX, y: newY, rotation: newRotation })
  // Garder liveDragPos en sync : builders de segments et underlines préfèrent live sur el.
  liveDragPos[textRotateState.elId] = {
    ...liveDragPos[textRotateState.elId],
    x: newX,
    y: newY,
    rotation: newRotation,
  }
}

function onTextRotateUp() {
  window.removeEventListener('mousemove', onTextRotateMove)
  window.removeEventListener('mouseup', onTextRotateUp)
  if (textRotateState) {
    // Purger le cache underline après rotation : Konva dessine en rAF, on attend qu'il l'ait fait.
    const elId = textRotateState.elId
    nextTick(() => requestAnimationFrame(() => syncTextRenderedDims(elId)))
    editorStore.saveHistory()
  }
  textRotateState = null
}

// ── Text @transform: enforce corner=uniform / side=horizontal ─────────────
function onTextTransform(e, el) {
  const tr = transformerRef.value?.getNode()
  if (!tr || el.type !== 'text') return
  const node = e.target
  const anchor = tr.getActiveAnchor()

  if (anchor === 'middle-left' || anchor === 'middle-right') {
    // Side: horizontal only — reset scale immediately and apply width directly.
    node.scaleY(1)
    const rawWidth = node.width() * node.scaleX()
    const liveSx = Math.abs(node.scaleX())
    node.scaleX(1)
    // minWidth dynamique : jamais moins large qu'un caractère à la fontSize courante.
    const fontMin = (el.fontSize || 16) * 1.1
    const newWidth = Math.max(MIN_TEXT_SIDE_WIDTH, fontMin, rawWidth)
    // Pour middle-left : le bord DROIT est l'ancre fixe.
    // Si on clamp newWidth > rawWidth, corriger x pour que le bord droit ne saute pas.
    if (anchor === 'middle-left' && newWidth > rawWidth) {
      node.x(node.x() + rawWidth - newWidth)
    }
    node.width(newWidth)
    editorStore.updateElement(el.id, { width: newWidth })
    if (!resizeDragBaseLines[el.id]) {
      resizeDragBaseLines[el.id] = getTextUnderlineLines(el) || liveDragPos[el.id]?.underlineLines || null
    }
    const scaledLines = resizeDragBaseLines[el.id]?.map((line) => ({
      xOffset: line.xOffset * liveSx,
      y: line.y,
      width: line.width * liveSx,
    }))
    liveDragPos[el.id] = { x: node.x(), y: node.y(), width: newWidth, underlineLines: scaledLines }

    // Pour les runs : recalculer la hauteur réelle depuis le layout de segments
    // et forcer le Transformer à suivre immédiatement.
    if (hasRuns(el)) {
      const segConfigs = buildTextSegmentConfigs(el)
      if (segConfigs.length > 0) {
        const lineH = (el.fontSize || 16) * (el.lineHeight || 1.25)
        const maxLineY = Math.max(...segConfigs.map((s) => s.__lineY ?? 0))
        const newHeight = maxLineY + lineH
        liveDragPos[el.id] = { ...liveDragPos[el.id], height: newHeight }
        node.height(newHeight)
        updateTransformer()
      }
    }
    return
  }

  // Corner: proportional scale — reset scale immédiatement comme pour les side handles.
  // Cela évite le stretch Konva, garde le Transformer bounding box aligné avec le contenu,
  // et permet de mettre à jour fontSize + width directement dans le store (segments suivent via el).
  if (!resizeDragBaseEl[el.id]) {
    resizeDragBaseEl[el.id] = {
      fontSize: el.fontSize || 16,
      width: el.width || node.width(),
      height: node.height(),   // hauteur auto-calculée par Konva avant tout lock
      y: node.y(),
    }
  }
  const baseEl = resizeDragBaseEl[el.id]

  // Scale cumulatif depuis la baseline (toujours depuis les originaux, pas d'accumulation).
  const rawWidth = node.width() * Math.abs(node.scaleX())
  const scale = rawWidth / baseEl.width
  const newWidth = Math.max(MIN_TEXT_SIDE_WIDTH, rawWidth)
  const newFontSize = Math.max(6, Math.round(baseEl.fontSize * scale))
  const newHeight = Math.max(6, baseEl.height * scale)

  // Reset Konva scale → no stretch, Transformer bounding box = contenu réel.
  node.scaleX(1)
  node.scaleY(1)
  node.width(newWidth)
  node.height(newHeight)   // verrouille la hauteur pendant le drag (pas de reflow)

  // Pour les poignées TOP : garder le bord bas fixe.
  if (anchor === 'top-left' || anchor === 'top-right') {
    node.y(baseEl.y + baseEl.height - newHeight)
  }

  // Mise à jour store live (pas d'historique) — segments re-renderent via el.fontSize / el.width.
  editorStore.updateElement(el.id, { width: newWidth, fontSize: newFontSize, height: newHeight })

  // Scale underline metrics depuis la baseline (évite l'accumulation).
  if (!resizeDragBaseLines[el.id]) {
    resizeDragBaseLines[el.id] = getTextUnderlineLines(el) || liveDragPos[el.id]?.underlineLines || null
  }
  const scaledLines = resizeDragBaseLines[el.id]?.map((line) => ({
    xOffset: line.xOffset * scale,
    y: line.y * scale,
    width: line.width * scale,
  }))

  liveDragPos[el.id] = { x: node.x(), y: node.y(), width: newWidth, underlineLines: scaledLines }
}

// ── Event handlers ────────────────────────────────────────────────────────

// Convert a native MouseEvent to stage-space coordinates (same as Konva getPointerPosition)
function getStagePos(evt) {
  const container = stageRef.value?.getNode()?.container()
  if (!container) return null
  const rect = container.getBoundingClientRect()
  return { x: evt.clientX - rect.left, y: evt.clientY - rect.top }
}

function onStageMouseDown(e) {
  const target = e.target
  const stage = e.target.getStage()
  // Also treat background-role elements (full-card background images/rects) as background
  const targetStoreEl = target.id ? editorStore.currentElements.find((el) => el.id === target.id()) : null
  const isBackground =
    target === stage || target.hasName('background') || targetStoreEl?.role === 'background'
  if (!isBackground) return

  selectionAdditive.value = !!e.evt?.shiftKey
  if (!selectionAdditive.value) editorStore.clearSelection()

  const pos = e.target.getStage().getPointerPosition()
  selectionStartPos.value = { x: pos.x, y: pos.y }
  selectionCurrentPos.value = { x: pos.x, y: pos.y }
  isDraggingSelection.value = true

  // Use document-level listeners so drag stays tracked even outside the canvas
  document.addEventListener('mousemove', onSelDragMove)
  document.addEventListener('mouseup', onSelDragEnd)
}

function onSelDragMove(evt) {
  if (!isDraggingSelection.value) return
  const pos = getStagePos(evt)
  if (pos) selectionCurrentPos.value = pos
}

function onSelDragEnd() {
  document.removeEventListener('mousemove', onSelDragMove)
  document.removeEventListener('mouseup', onSelDragEnd)
  if (!isDraggingSelection.value) return
  isDraggingSelection.value = false

  const w = Math.abs(selectionCurrentPos.value.x - selectionStartPos.value.x)
  const h = Math.abs(selectionCurrentPos.value.y - selectionStartPos.value.y)
  if (Math.hypot(w, h) < 5) return

  // Convert selection rect from stage coords to card coords
  const z = editorStore.zoom
  const ox = cardOffset.value.x
  const oy = cardOffset.value.y
  const rx1 = (Math.min(selectionStartPos.value.x, selectionCurrentPos.value.x) - ox) / z
  const ry1 = (Math.min(selectionStartPos.value.y, selectionCurrentPos.value.y) - oy) / z
  const rx2 = (Math.max(selectionStartPos.value.x, selectionCurrentPos.value.x) - ox) / z
  const ry2 = (Math.max(selectionStartPos.value.y, selectionCurrentPos.value.y) - oy) / z

  const stage = stageRef.value?.getNode()

  const ids = editorStore.currentElements
    .filter((el) => {
      if (!el.visible || el.locked) return false

      // Lines and arrows are rotated around their start point with zero height in the store.
      // Use the rotation-aware bounding box of both endpoints + stroke padding.
      if (
        el.shapeType === 'line' ||
        el.shapeType === 'line-bar' ||
        el.shapeType === 'arrow' ||
        el.shapeType === 'arrow-double'
      ) {
        const r = ((el.rotation || 0) * Math.PI) / 180
        const w = el.width || 200
        const loy =
          el.shapeType === 'arrow' || el.shapeType === 'arrow-double' ? (el.height || 24) / 2 : 0
        const pad = Math.max((el.strokeWidth || el.height || 4) / 2, 8)
        const c = Math.cos(r),
          s = Math.sin(r)
        const lx = el.x - loy * s
        const ly = el.y + loy * c
        const rx = el.x + w * c - loy * s
        const ry = el.y + w * s + loy * c
        return (
          rx1 < Math.max(lx, rx) + pad &&
          rx2 > Math.min(lx, rx) - pad &&
          ry1 < Math.max(ly, ry) + pad &&
          ry2 > Math.min(ly, ry) - pad
        )
      }

      const ex1 = el.x
      const ey1 = el.y
      let elW = el.width || 0
      let elH = el.height || 0
      // Texts have width/height: null in the store — fall back to the Konva node's rendered dimensions.
      if ((!elW || !elH) && stage) {
        const node = stage.findOne('#' + el.id)
        if (node) {
          if (!elW) elW = node.width()
          if (!elH) elH = node.height()
        }
      }
      const ex2 = ex1 + elW
      const ey2 = ey1 + elH
      return rx1 < ex2 && rx2 > ex1 && ry1 < ey2 && ry2 > ey1
    })
    .map((el) => el.id)

  if (ids.length) {
    const finalIds = selectionAdditive.value
      ? [...new Set([...editorStore.selectedIds, ...ids])]
      : ids
    editorStore.selectedIds = finalIds
    // Prevent the click event (that fires right after mouseup) from clearing this selection
    justFinishedDragSelect.value = true
    nextTick(updateTransformer)
  }
}

// Konva-level handlers kept as thin pass-throughs (doc handlers are authoritative)
function onStageMouseMove() {}

function onStageMouseUp() {
  if (isDraggingSelection.value) onSelDragEnd()
}


function onElementClick(e, el) {
  e.cancelBubble = true
  const multi = e.evt?.shiftKey
  editorStore.selectElement(el.id, multi)
  nextTick(updateTransformer)
}

// ── Snap helper (grid + edges) ────────────────────────────────────────────
function applySnap(x, y, w, h) {
  let nx = x
  let ny = y
  if (editorStore.snapEnabled) {
    const G = editorStore.gridSize / 2 // snap at half-grid intervals for precision
    nx = Math.round(nx / G) * G
    ny = Math.round(ny / G) * G
  }
  if (editorStore.snapToEdges) {
    const T = 15
    const cw = editorStore.cardWidth
    const ch = editorStore.cardHeight
    if (Math.abs(nx) < T) nx = 0
    else if (Math.abs(nx + w - cw) < T) nx = cw - w
    if (Math.abs(ny) < T) ny = 0
    else if (Math.abs(ny + h - ch) < T) ny = ch - h
  }
  return { x: nx, y: ny }
}

// ── Smart snap: inter-element + card guides ───────────────────────────────
// Returns { x, y } snapped position AND populates snapGuides for visual overlay.
// Threshold is 8px in canvas space.
function computeSnapWithGuides(rawX, rawY, w, h, draggedId) {
  const THRESHOLD = 8
  const cw = editorStore.cardWidth
  const ch = editorStore.cardHeight

  // Candidate snap lines in canvas space
  // V (vertical lines at given x): snap dragged left/centerX/right to them
  // H (horizontal lines at given y): snap dragged top/centerY/bottom to them
  const vCandidates = [] // x positions
  const hCandidates = [] // y positions

  // Card edges and center
  vCandidates.push(0, cw / 2, cw)
  hCandidates.push(0, ch / 2, ch)

  // Other elements
  if (editorStore.snapToEdges) {
    for (const el of editorStore.currentElements) {
      if (el.id === draggedId || el.locked || !el.visible) continue
      const ew = el.width || 0
      const eh = el.height || 0
      vCandidates.push(el.x, el.x + ew / 2, el.x + ew)
      hCandidates.push(el.y, el.y + eh / 2, el.y + eh)
    }
  }

  // Dragged element snap points
  const dLeft = rawX
  const dCenterX = rawX + w / 2
  const dRight = rawX + w
  const dTop = rawY
  const dCenterY = rawY + h / 2
  const dBottom = rawY + h

  let nx = rawX
  let ny = rawY
  const guides = []

  // Find closest V snap
  let bestDX = THRESHOLD + 1
  let snapVPos = null
  let snapVOffset = 0
  for (const vx of vCandidates) {
    for (const [dp, off] of [[dLeft, 0], [dCenterX, w / 2], [dRight, w]]) {
      const d = Math.abs(dp - vx)
      if (d < bestDX) { bestDX = d; snapVPos = vx; snapVOffset = off }
    }
  }
  if (snapVPos !== null) {
    nx = snapVPos - snapVOffset
    guides.push({ type: 'V', pos: snapVPos })
  }

  // Find closest H snap
  let bestDY = THRESHOLD + 1
  let snapHPos = null
  let snapHOffset = 0
  for (const hy of hCandidates) {
    for (const [dp, off] of [[dTop, 0], [dCenterY, h / 2], [dBottom, h]]) {
      const d = Math.abs(dp - hy)
      if (d < bestDY) { bestDY = d; snapHPos = hy; snapHOffset = off }
    }
  }
  if (snapHPos !== null) {
    ny = snapHPos - snapHOffset
    guides.push({ type: 'H', pos: snapHPos })
  }

  // Also apply grid snap on top (if enabled)
  if (editorStore.snapEnabled) {
    const G = editorStore.gridSize / 2
    if (snapVPos === null) nx = Math.round(nx / G) * G
    if (snapHPos === null) ny = Math.round(ny / G) * G
  }

  snapGuides.value = guides
  return { x: nx, y: ny }
}

// ── Group drag coordination ───────────────────────────────────────────────
// Konva node start positions recorded at dragstart, keyed by element id.
const groupDragStartNodePos = {}

// Returns the Konva node's resting position (may differ from store x/y for
// center-based shapes like circle, polygon, star).
function konvaStartPosForEl(el) {
  const hw = (el.width || 100) / 2
  const hh = (el.height || 100) / 2
  if (el.shapeType === 'circle' || el.shapeType === 'polygon' || el.shapeType === 'star') {
    return { x: el.x + hw, y: el.y + hh }
  }
  return { x: el.x, y: el.y }
}

function onLayerDragStart(e) {
  const targetId = e.target.id?.()
  if (!targetId) return
  const el = editorStore.currentElements.find((m) => m.id === targetId)
  if (!el?.groupId) return
  // Record the Konva position of every group member at drag start
  const stage = stageRef.value?.getNode()
  editorStore.currentElements
    .filter((m) => m.groupId === el.groupId)
    .forEach((m) => {
      const node = m.id === targetId ? e.target : stage?.findOne('#' + m.id)
      if (node) groupDragStartNodePos[m.id] = { x: node.x(), y: node.y() }
      else groupDragStartNodePos[m.id] = konvaStartPosForEl(m)
    })
}

function onLayerDragMove(e) {
  const targetId = e.target.id?.()
  if (!targetId) return
  const el = editorStore.currentElements.find((m) => m.id === targetId)

  // ── Live position tracking (feeds handle/indicator computeds) ─────────────
  if (el) {
    const isCenterBased =
      el.shapeType === 'circle' || el.shapeType === 'polygon' || el.shapeType === 'star'
    const rawX = e.target.x()
    const rawY = e.target.y()
    const liveX = isCenterBased ? rawX - (el.width || 100) / 2 : rawX
    const liveY = isCenterBased ? rawY - (el.height || 100) / 2 : rawY

    // ── Live smart snap (grid + card edges + inter-element) ──────────────────
    if (editorStore.snapEnabled || editorStore.snapToEdges) {
      const { x: sx, y: sy } = computeSnapWithGuides(liveX, liveY, el.width || 0, el.height || 0, targetId)
      const dx = sx - liveX
      const dy = sy - liveY
      if (dx !== 0 || dy !== 0) {
        e.target.x(isCenterBased ? sx + (el.width || 100) / 2 : sx)
        e.target.y(isCenterBased ? sy + (el.height || 100) / 2 : sy)
        liveDragPos[targetId] = { x: sx, y: sy }
      } else {
        liveDragPos[targetId] = { x: liveX, y: liveY }
      }
    } else {
      snapGuides.value = []
      liveDragPos[targetId] = { x: liveX, y: liveY }
    }

    if (el.groupId) {
      const groupMembers = editorStore.currentElements.filter((m) => m.groupId === el.groupId)
      const allSelected = groupMembers.every((m) => editorStore.selectedIds.includes(m.id))
      if (allSelected) {
        // Transformer moves all nodes — propagate delta to every member's live position
        const deltaX = liveX - el.x
        const deltaY = liveY - el.y
        groupMembers.forEach((m) => {
          if (m.id !== targetId) liveDragPos[m.id] = { x: m.x + deltaX, y: m.y + deltaY }
        })
        return // Transformer handles visual movement; nothing else to do
      }
    }
  }

  if (!el?.groupId) return // non-grouped element or indicator rect — done

  // ── Partial group: manually sync other members' Konva nodes ──────────────
  const startPos = groupDragStartNodePos[targetId]
  if (!startPos) return
  const deltaX = e.target.x() - startPos.x
  const deltaY = e.target.y() - startPos.y
  const stage = stageRef.value?.getNode()
  if (!stage) return

  editorStore.currentElements
    .filter((m) => m.groupId === el.groupId && m.id !== targetId && !m.locked)
    .forEach((m) => {
      const memberNode = stage.findOne('#' + m.id)
      if (!memberNode) return
      const mStart = groupDragStartNodePos[m.id] || konvaStartPosForEl(m)
      memberNode.x(mStart.x + deltaX)
      memberNode.y(mStart.y + deltaY)
      // Also keep live positions current for this member
      const mCenter =
        m.shapeType === 'circle' || m.shapeType === 'polygon' || m.shapeType === 'star'
      const mHW = (m.width || 100) / 2
      const mHH = (m.height || 100) / 2
      liveDragPos[m.id] = {
        x: mCenter ? mStart.x + deltaX - mHW : mStart.x + deltaX,
        y: mCenter ? mStart.y + deltaY - mHH : mStart.y + deltaY,
      }
    })
}

// Moves all group members by the same store-space delta and commits to store.
function onGroupIndicatorClick(gid) {
  const memberIds = editorStore.currentElements
    .filter((el) => el.groupId === gid)
    .map((el) => el.id)
  editorStore.selectedIds = memberIds
  nextTick(updateTransformer)
}

// Drag the group indicator rect → move all group members together
const indicatorDragStart = {} // gid → { ix, iy, members snapshot }

function onGroupIndicatorDragStart(e, gid) {
  // Do NOT select members here — selecting would make allSelected=true,
  // causing groupBoundingBoxes to hide this indicator and cancelling the drag.
  const members = editorStore.currentElements.filter((el) => el.groupId === gid && !el.locked)
  indicatorDragStart[gid] = {
    ix: e.target.x(),
    iy: e.target.y(),
    members: members.map((m) => ({
      id: m.id,
      x: m.x,
      y: m.y,
      shapeType: m.shapeType,
      width: m.width,
      height: m.height,
    })),
  }
}

function onGroupIndicatorDragMove(e, gid) {
  const start = indicatorDragStart[gid]
  if (!start) return
  const deltaX = e.target.x() - start.ix
  const deltaY = e.target.y() - start.iy
  const stage = stageRef.value?.getNode()
  if (!stage) return
  start.members.forEach((m) => {
    const node = stage.findOne('#' + m.id)
    if (!node) return
    const isCenterBased =
      m.shapeType === 'circle' || m.shapeType === 'polygon' || m.shapeType === 'star'
    const hw = (m.width || 100) / 2
    const hh = (m.height || 100) / 2
    node.x(isCenterBased ? m.x + hw + deltaX : m.x + deltaX)
    node.y(isCenterBased ? m.y + hh + deltaY : m.y + deltaY)
    // Update liveDragPos so groupBoundingBoxes re-positions the indicator in sync
    liveDragPos[m.id] = { x: m.x + deltaX, y: m.y + deltaY }
  })
}

function onGroupIndicatorDragEnd(e, gid) {
  const start = indicatorDragStart[gid]
  if (!start) return
  const deltaX = e.target.x() - start.ix
  const deltaY = e.target.y() - start.iy
  // Commit store positions
  start.members.forEach((m) => {
    editorStore.updateElement(m.id, { x: m.x + deltaX, y: m.y + deltaY })
    delete liveDragPos[m.id]
  })
  delete indicatorDragStart[gid]
  editorStore.saveHistory()
  // Now select the group so the Transformer appears
  editorStore.selectedIds = start.members.map((m) => m.id)
  nextTick(updateTransformer)
}

function applyGroupDelta(el, deltaX, deltaY) {
  if (!el.groupId || (deltaX === 0 && deltaY === 0)) return
  const stage = stageRef.value?.getNode()
  editorStore.currentElements
    .filter((m) => m.groupId === el.groupId && m.id !== el.id && !m.locked)
    .forEach((m) => {
      const newX = m.x + deltaX
      const newY = m.y + deltaY
      // Reposition the Konva node to the new store position
      if (stage) {
        const node = stage.findOne('#' + m.id)
        if (node) {
          const hw = (m.width || 100) / 2
          const hh = (m.height || 100) / 2
          const isCenterBased =
            m.shapeType === 'circle' || m.shapeType === 'polygon' || m.shapeType === 'star'
          node.x(isCenterBased ? newX + hw : newX)
          node.y(isCenterBased ? newY + hh : newY)
        }
      }
      editorStore.updateElement(m.id, { x: newX, y: newY })
    })
}

function onDragEnd(e, el) {
  // Clear snap guides
  snapGuides.value = []

  // Clear live position(s) — covers both single elements and full-group Transformer drags.
  // For text elements, sync rendered dims instead of clearing so the context bar keeps real values.
  if (el.groupId) {
    editorStore.currentElements
      .filter((m) => m.groupId === el.groupId)
      .forEach((m) => {
        if (m.type === 'text') {
          nextTick(() => syncTextRenderedDims(m.id))
        } else {
          delete liveDragPos[m.id]
        }
      })
  } else if (el.type === 'text') {
    nextTick(() => syncTextRenderedDims(el.id))
  } else {
    delete liveDragPos[el.id]
  }

  let rawX = e.target.x()
  let rawY = e.target.y()
  const isCircle = el.shapeType === 'circle'
  if (isCircle) {
    rawX -= (el.width || 100) / 2
    rawY -= (el.height || 100) / 2
  }
  const { x, y } = applySnap(rawX, rawY, el.width || 0, el.height || 0)
  if (isCircle) {
    e.target.x(x + (el.width || 100) / 2)
    e.target.y(y + (el.height || 100) / 2)
  } else {
    e.target.x(x)
    e.target.y(y)
  }
  // Skip group propagation when all members are selected: Transformer already moved every
  // node, and each fires its own onDragEnd — applyGroupDelta here would double-apply.
  if (el.groupId) {
    const allGroupSelected = editorStore.currentElements
      .filter((m) => m.groupId === el.groupId)
      .every((m) => editorStore.selectedIds.includes(m.id))
    if (!allGroupSelected) applyGroupDelta(el, x - el.x, y - el.y)
  } else {
    applyGroupDelta(el, x - el.x, y - el.y)
  }
  editorStore.updateElement(el.id, { x, y })
  editorStore.saveHistory()
}

function onTransformEnd(e, el) {
  const node = e.target

  if (el.shapeType === 'path') {
    const vb = el.pathViewBox || [24, 24]
    editorStore.updateElement(el.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(10, vb[0] * node.scaleX()),
      height: Math.max(10, vb[1] * node.scaleY()),
      rotation: node.rotation(),
    })
    node.scaleX(1)
    node.scaleY(1)
  } else if (el.shapeType === 'circle') {
    editorStore.updateElement(el.id, {
      x: node.x() - node.radiusX() * node.scaleX(),
      y: node.y() - node.radiusY() * node.scaleY(),
      width: node.radiusX() * 2 * node.scaleX(),
      height: node.radiusY() * 2 * node.scaleY(),
      rotation: node.rotation(),
    })
  } else if (el.shapeType === 'line-bar') {
    // scaleX → length, scaleY → thickness
    const sw = el.strokeWidth || 2
    editorStore.updateElement(el.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(10, (el.width || 200) * node.scaleX()),
      strokeWidth: Math.max(1, sw * node.scaleY()),
      rotation: node.rotation(),
    })
  } else if (el.shapeType === 'line') {
    // v-line: node.height() returns 0 (points have no vertical extent),
    // so we must use stored el.width × scale; height/strokeWidth unchanged
    editorStore.updateElement(el.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(10, (el.width || 200) * node.scaleX()),
      rotation: node.rotation(),
    })
  } else if (el.shapeType === 'arrow' || el.shapeType === 'arrow-double') {
    // v-arrow: node.height() returns 0 (all points at same y),
    // use stored dimensions × scale
    editorStore.updateElement(el.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(10, (el.width || 200) * node.scaleX()),
      height: Math.max(10, (el.height || 24) * node.scaleY()),
      rotation: node.rotation(),
    })
  } else if (el.type === 'text') {
    if (resizeDragBaseEl[el.id]) {
      // Corner drag : fontSize + width déjà appliqués live, height à déverrouiller.
      // node.scaleX = 1 (reset dans onTextTransform), donc node.width() = valeur finale réelle.
      editorStore.updateElement(el.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(MIN_TEXT_SIDE_WIDTH, node.width()),
        height: null,
        fontSize: el.fontSize,   // déjà correct depuis les updateElement du drag
        rotation: node.rotation(),
      })
    } else {
      // Side drag : fontSize inchangé, width déjà appliqué live.
      editorStore.updateElement(el.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(MIN_TEXT_SIDE_WIDTH, node.width()),
        height: null,
        rotation: node.rotation(),
      })
    }
  } else {
    editorStore.updateElement(el.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(10, node.width() * node.scaleX()),
      height: Math.max(10, node.height() * node.scaleY()),
      rotation: node.rotation(),
    })
  }
  node.scaleX(1)
  node.scaleY(1)
  if (el.type === 'text') {
    delete resizeDragBaseLines[el.id]
    delete resizeDragBaseEl[el.id]
    // Attendre Vue render + Konva draw (rAF) avant de re-syncer les métriques du souligné,
    // car textArr de Konva n'est recompté qu'après le prochain draw cycle.
    nextTick(() => requestAnimationFrame(() => syncTextRenderedDims(el.id)))
  } else {
    delete liveDragPos[el.id]
  }
  editorStore.saveHistory()
}

// Center-based drag (polygon / star) — node x/y is the center
function onDragEndCenter(e, el) {
  snapGuides.value = []

  if (el.groupId) {
    editorStore.currentElements
      .filter((m) => m.groupId === el.groupId)
      .forEach((m) => delete liveDragPos[m.id])
  } else {
    delete liveDragPos[el.id]
  }

  const node = e.target
  const half = (el.width || 100) / 2
  const rawX = node.x() - half
  const rawY = node.y() - half
  const { x, y } = applySnap(rawX, rawY, el.width || 0, el.height || 0)
  node.x(x + half)
  node.y(y + half)
  if (el.groupId) {
    const allGroupSelected = editorStore.currentElements
      .filter((m) => m.groupId === el.groupId)
      .every((m) => editorStore.selectedIds.includes(m.id))
    if (!allGroupSelected) applyGroupDelta(el, x - el.x, y - el.y)
  } else {
    applyGroupDelta(el, x - el.x, y - el.y)
  }
  editorStore.updateElement(el.id, { x, y })
  editorStore.saveHistory()
}

function onTransformEndCenter(e, el) {
  const node = e.target
  const newR = ((el.width || 100) / 2) * node.scaleX()
  editorStore.updateElement(el.id, {
    x: node.x() - newR,
    y: node.y() - newR,
    width: newR * 2,
    height: newR * 2,
    rotation: node.rotation(),
  })
  node.scaleX(1)
  node.scaleY(1)
  editorStore.saveHistory()
}

// ── Inline text editing ───────────────────────────────────────────────────

function isLocked(el) {
  return el?.locked === true
}

function findWordBounds(text, index) {
  if (!text.length) return { start: 0, end: 0 }
  const isWordChar = (ch) => /\w/.test(ch)
  if (!isWordChar(text[index] ?? '')) return { start: index, end: index }
  let start = index
  while (start > 0 && isWordChar(text[start - 1])) start--
  let end = index
  while (end < text.length && isWordChar(text[end])) end++
  return { start, end }
}

function positionCaretAtPoint(x, y, selectWord = false) {
  const ta = textareaRef.value
  if (!ta) return

  let pos = null

  // Chrome/Edge
  const range = document.caretRangeFromPoint?.(x, y)
  if (range?.startContainer?.nodeType === Node.TEXT_NODE) {
    pos = range.startOffset
  }

  // Firefox
  if (pos === null) {
    const caret = document.caretPositionFromPoint?.(x, y)
    if (caret) pos = caret.offset
  }

  // Fallback : curseur à la fin du texte
  if (pos === null) pos = ta.value.length

  if (selectWord) {
    const { start, end } = findWordBounds(ta.value, pos)
    ta.setSelectionRange(start, end)
  } else {
    ta.setSelectionRange(pos, pos)
  }
}

function startTextEdit(el, e = null) {
  if (isLocked(el)) return
  editingElId.value = el.id
  editingText.value = el.text || ''
  editorStore.textEditState.elId = el.id
  editorStore.textEditState.start = 0
  editorStore.textEditState.end = 0
  const nativeEvt = e?.evt ?? e
  const clickPos =
    nativeEvt?.clientX != null
      ? { x: nativeEvt.clientX, y: nativeEvt.clientY }
      : nativeEvt?.changedTouches?.[0]
        ? { x: nativeEvt.changedTouches[0].clientX, y: nativeEvt.changedTouches[0].clientY }
        : null
  nextTick(() => {
    updateTransformer()
    textareaRef.value?.focus()
    if (clickPos) {
      requestAnimationFrame(() => {
        positionCaretAtPoint(clickPos.x, clickPos.y, true)
        onTextareaSelectionChange()
      })
    } else {
      const len = editingText.value.length
      textareaRef.value?.setSelectionRange(len, len)
      onTextareaSelectionChange()
    }
  })
}

// ── Bullet helpers ────────────────────────────────────────────────────────
function renumberIfNeeded(text) {
  const lines = text.split('\n')
  const nonEmpty = lines.filter((l) => l.trim())
  if (!nonEmpty.length) return text
  // Vérifie si la majorité des lignes non-vides ont un préfixe numéroté
  const numbered = nonEmpty.filter((l) => /^\d+\. /.test(l))
  if (numbered.length <= nonEmpty.length / 2) return text
  let n = 0
  return lines
    .map((l) => {
      if (!l.trim()) return l
      const content = l.replace(/^\d+\. /, '')
      n++
      return `${n}. ${content}`
    })
    .join('\n')
}

// ── Bullet-aware keydown handler ─────────────────────────────────────────
const BULLET_PREFIXES = ['• ', '- ']
const NUMBERED_RE = /^(\d+)\. /

function getLineBulletPrefix(line) {
  for (const p of BULLET_PREFIXES) {
    if (line.startsWith(p)) return p
  }
  const m = line.match(NUMBERED_RE)
  if (m) return m[0] // e.g. "3. "
  return null
}

function onTextareaKeydown(e) {
  const ta = e.target
  const text = ta.value
  const pos = ta.selectionStart
  const selEnd = ta.selectionEnd

  // ── Enter : auto-prefix ──────────────────────────────────────────────
  if (e.key === 'Enter' && !e.shiftKey) {
    // Find start of current line
    const lineStart = text.lastIndexOf('\n', pos - 1) + 1
    const lineEnd = text.indexOf('\n', pos)
    const currentLine = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd)
    const prefix = getLineBulletPrefix(currentLine)

    if (!prefix) return // pas de liste active → comportement natif

    e.preventDefault()

    // Si la ligne est vide (juste le préfixe), Entrée sort de la liste
    const content = currentLine.slice(prefix.length)
    if (!content.trim()) {
      // Supprimer le préfixe de la ligne vide et ne pas en ajouter un nouveau
      const before = text.slice(0, lineStart)
      const after = text.slice(lineStart + prefix.length)
      const newText = before + after
      const newPos = lineStart
      editingText.value = newText
      nextTick(() => {
        ta.setSelectionRange(newPos, newPos)
      })
      return
    }

    // Calculer le prochain préfixe (numéroté : incrémenter)
    let nextPrefix
    const numMatch = prefix.match(/^(\d+)\. $/)
    if (numMatch) {
      nextPrefix = `${parseInt(numMatch[1]) + 1}. `
    } else {
      nextPrefix = prefix
    }

    const before = text.slice(0, pos)
    const after = text.slice(selEnd)
    const newText = before + '\n' + nextPrefix + after
    const newPos = pos + 1 + nextPrefix.length
    editingText.value = newText
    nextTick(() => {
      ta.setSelectionRange(newPos, newPos)
    })
    return
  }

  // ── Backspace : retirer le préfixe si curseur juste après ────────────
  if (e.key === 'Backspace' && pos === selEnd) {
    const lineStart = text.lastIndexOf('\n', pos - 1) + 1
    const currentLine = text.slice(lineStart, pos)
    const prefix = getLineBulletPrefix(currentLine)
    // Si le curseur est exactement à la fin du préfixe (contenu vide sur la ligne)
    if (prefix && currentLine === prefix) {
      e.preventDefault()
      const before = text.slice(0, lineStart)
      const after = text.slice(lineStart + prefix.length)
      const newText = before + after
      const newPos = lineStart
      editingText.value = newText
      nextTick(() => {
        ta.setSelectionRange(newPos, newPos)
      })
    }
  }
}

function finishTextEdit() {
  if (!editingEl.value) return
  const trimmed = editingText.value.trim()
  if (!trimmed) {
    const page = editorStore.activePage
    editorStore.elements[page] = editorStore.elements[page].filter(
      (e) => e.id !== editingEl.value.id,
    )
    editorStore.saveHistory()
    editingElId.value = null
    editingText.value = ''
    editorStore.textEditState.elId = null
    editorStore.textEditState.start = 0
    editorStore.textEditState.end = 0
    return
  }
  // editingEl.value is now always live (computed by ID), so .runs/.text are current.
  const el = editingEl.value
  const elId = el.id
  const finalText = renumberIfNeeded(editingText.value)
  const commitPayload = { text: finalText, height: null }
  if (hasRuns(el)) {
    const { at, delta } = diffSingleEdit(el.text || '', finalText)
    commitPayload.runs =
      delta === 0
        ? normalizeRuns(el.runs, finalText.length)
        : shiftRuns(el.runs, at, delta, finalText.length)
  }
  editorStore.updateElementCommit(elId, commitPayload)
  const role = el.role || ''
  if (role.startsWith('custom_')) {
    const cfId = role.replace('custom_', '')
    const cf = editorStore.contactExtra.find((c) => c.id === cfId)
    if (cf) cf.value = editingText.value
  }
  editingElId.value = null
  editingText.value = ''
  // Preserve textEditState briefly so native color pickers (which blur the
  // textarea before committing the value) can still target the user's range.
  scheduleTextEditStateClear()
  nextTick(() => {
    updateTransformer()
    syncTextRenderedDims(elId)
  })
}

// Finish any ongoing text edit when the user switches page
watch(
  () => editorStore.activePage,
  (_newPage, oldPage) => {
    // Capture the ID before the computed re-evaluates against the new page.
    const elId = editingElId.value
    if (!elId) return
    const pageEls = editorStore.elements[oldPage]
    const idx = pageEls?.findIndex((e) => e.id === elId) ?? -1
    if (idx !== -1) {
      if (!editingText.value.trim()) {
        pageEls.splice(idx, 1)
      } else {
        const prevEl = pageEls[idx]
        const newText = renumberIfNeeded(editingText.value)
        const patch = { ...prevEl, text: newText }
        if (Array.isArray(prevEl.runs) && prevEl.runs.length) {
          const { at, delta } = diffSingleEdit(prevEl.text || '', newText)
          patch.runs =
            delta === 0
              ? normalizeRuns(prevEl.runs, newText.length)
              : shiftRuns(prevEl.runs, at, delta, newText.length)
        }
        pageEls[idx] = patch
      }
      editorStore.saveHistory()
    }
    editingElId.value = null
    editingText.value = ''
  },
)

// ── Flip animation (two-phase rotateY) ────────────────────────────────────
watch(
  () => editorStore.isFlipping,
  (flipping) => {
    if (!flipping) return
    const container = stageRef.value?.getNode()?.container()
    if (!container) {
      // Fallback: no animation, just swap immediately
      editorStore.commitFlipSwap()
      editorStore.commitFlipEnd()
      return
    }

    // Phase 1: rotate old content out (0 → 90°)
    container.style.transition = 'transform 0.2s ease-in'
    container.style.transform = 'perspective(1200px) rotateY(90deg)'

    setTimeout(() => {
      // Midpoint: swap content to the new page
      editorStore.commitFlipSwap()

      // Phase 2: rotate new content in (-90° → 0)
      container.style.transition = 'none'
      container.style.transform = 'perspective(1200px) rotateY(-90deg)'

      // Force reflow so the browser picks up the new start position
      container.offsetHeight

      container.style.transition = 'transform 0.25s ease-out'
      container.style.transform = 'perspective(1200px) rotateY(0deg)'

      setTimeout(() => {
        editorStore.commitFlipEnd()
        container.style.transition = ''
        container.style.transform = ''
      }, 260)
    }, 210)
  },
)

const textareaStyle = computed(() => {
  if (!editingEl.value) return {}
  const el = editingEl.value
  const z = editorStore.zoom
  const ox = cardOffset.value.x
  const oy = cardOffset.value.y

  // Canvas wrapper offset relative to viewport
  const rect = wrapperRef.value?.getBoundingClientRect() || { left: 0, top: 0 }

  // When the element has active runs, make the textarea text invisible so the
  // Konva segments (which stay visible during editing) provide the styled view.
  // The caret remains visible via caretColor.
  const activeRuns = hasRuns(el)

  return {
    left: ox + el.x * z + 'px',
    top: oy + el.y * z + 'px',
    width: (el.width || 200) * z + 'px',
    minHeight: (el.fontSize || 16) * 1.5 * z + 'px',
    fontSize: (el.fontSize || 16) * z + 'px',
    fontFamily: el.fontFamily || 'Inter',
    fontStyle: el.fontStyle?.includes('italic') ? 'italic' : 'normal',
    fontWeight: el.fontStyle?.includes('bold') ? 'bold' : 'normal',
    color: activeRuns ? 'transparent' : (el.fill || '#000000'),
    caretColor: el.fill || '#000000',
    textAlign: el.align || 'left',
    lineHeight: el.lineHeight || 1.25,
    letterSpacing: (el.letterSpacing || 0) * z + 'px',
    textDecoration: activeRuns ? 'none' : (el.textDecoration || 'none'),
  }
})

function onWheel(e) {
  const delta = e.deltaY > 0 ? -0.05 : 0.05
  editorStore.setZoom(editorStore.zoom + delta)
}

// ── Grid overlay style ────────────────────────────────────────────────────
const gridStyle = computed(() => {
  const step = editorStore.gridSize * editorStore.zoom
  const color = themeStore.darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'
  return {
    backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
    backgroundSize: `${step}px ${step}px`,
  }
})

// ── Safe zone overlay style (3mm margin = ~24px at standard card size) ───
const SAFE_ZONE_PX = 24 // ~3mm at 85.6mm/680px card width
const safeZoneStyle = computed(() => {
  const z = editorStore.zoom
  const margin = SAFE_ZONE_PX * z
  const borderColor = themeStore.darkMode ? 'rgba(239,68,68,0.55)' : 'rgba(220,38,38,0.5)'
  return {
    left: cardOffset.value.x + margin + 'px',
    top: cardOffset.value.y + margin + 'px',
    width: editorStore.cardWidth * z - margin * 2 + 'px',
    height: editorStore.cardHeight * z - margin * 2 + 'px',
    border: `1px dashed ${borderColor}`,
  }
})

// ── Card resize handles ───────────────────────────────────────────────────
const handleRight = computed(() => {
  const z = editorStore.zoom
  const margin = 12
  return {
    position: 'absolute',
    left: cardOffset.value.x + editorStore.cardWidth * z - 3 + 'px',
    top: cardOffset.value.y + margin + 'px',
    width: '6px',
    height: editorStore.cardHeight * z - margin * 2 + 'px',
    cursor: 'ew-resize',
    zIndex: 40,
  }
})

const handleBottom = computed(() => {
  const z = editorStore.zoom
  const margin = 12
  return {
    position: 'absolute',
    left: cardOffset.value.x + margin + 'px',
    top: cardOffset.value.y + editorStore.cardHeight * z - 3 + 'px',
    width: editorStore.cardWidth * z - margin * 2 + 'px',
    height: '6px',
    cursor: 'ns-resize',
    zIndex: 40,
  }
})

const handleCorner = computed(() => {
  const z = editorStore.zoom
  return {
    position: 'absolute',
    left: cardOffset.value.x + editorStore.cardWidth * z - 5 + 'px',
    top: cardOffset.value.y + editorStore.cardHeight * z - 5 + 'px',
    width: '10px',
    height: '10px',
    cursor: 'nwse-resize',
    zIndex: 41,
  }
})

const isResizing = ref(null) // 'right' | 'bottom' | 'corner'
const resizeStart = ref({ x: 0, y: 0, w: 0, h: 0 })

function startResize(type, e) {
  isResizing.value = type
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY,
    w: editorStore.cardWidth,
    h: editorStore.cardHeight,
  }
  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', onResizeEnd)
}

function onResizeMove(e) {
  const dx = (e.clientX - resizeStart.value.x) / editorStore.zoom
  const dy = (e.clientY - resizeStart.value.y) / editorStore.zoom
  const type = isResizing.value
  if (type === 'right' || type === 'corner') {
    editorStore.cardWidth = Math.max(200, Math.round(resizeStart.value.w + dx))
  }
  if (type === 'bottom' || type === 'corner') {
    editorStore.cardHeight = Math.max(100, Math.round(resizeStart.value.h + dy))
  }
}

function onResizeEnd() {
  isResizing.value = null
  editorStore.isDirty = true
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeEnd)
}

// ── Resize observer ───────────────────────────────────────────────────────
let resizeObserver = null

onMounted(() => {
  resizeObserver = new ResizeObserver(([entry]) => {
    stageWidth.value = entry.contentRect.width
    stageHeight.value = entry.contentRect.height
    nextTick(updateTransformer)
  })
  if (wrapperRef.value) {
    resizeObserver.observe(wrapperRef.value)
    stageWidth.value = wrapperRef.value.clientWidth
    stageHeight.value = wrapperRef.value.clientHeight
  }

  // Export handler
  window.addEventListener('editor:export', onExportEvent)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('editor:export', onExportEvent)
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeEnd)
  // Text handle cleanup
  window.removeEventListener('mousemove', onTextMoveMove)
  window.removeEventListener('mouseup', onTextMoveUp)
  window.removeEventListener('mousemove', onTextRotateMove)
  // Drag-selection cleanup
  document.removeEventListener('mousemove', onSelDragMove)
  document.removeEventListener('mouseup', onSelDragEnd)
  window.removeEventListener('mouseup', onTextRotateUp)
})

// ── Export ────────────────────────────────────────────────────────────────
function onExportEvent(e) {
  const type = e.detail?.type || 'png'
  exportCanvas(type)
}

// Pre-loads images, icons and QR for a specific page into the cache before switching to it
async function ensurePageImagesLoaded(page) {
  const els = editorStore.elements[page] || []
  // Images
  const pendingImages = els.filter(
    (el) => el.type === 'image' && el.src && imageSrcCache.value[el.id] !== el.src,
  )
  // QR codes
  const pendingQR = els.filter(
    (el) =>
      el.type === 'qr' && (!imageCache.value[el.id] || qrKeyCache.value[el.id] !== qrCacheKey(el)),
  )
  // Icons (also check for stale color/iconId changes via iconKeyCache)
  const pendingIcons = els.filter((el) => {
    if (el.type !== 'icon' || !el.iconId) return false
    if (!imageCache.value[el.id]) return true
    const fill = el.fill || '#000000'
    const key = el.colorful ? el.iconId : `${el.iconId}|${fill}`
    return iconKeyCache.value[el.id] !== key
  })
  const promises = []
  pendingImages.forEach((el) => {
    promises.push(
      new Promise((resolve) => {
        const img = new window.Image()
        img.onload = () => {
          imageCache.value = { ...imageCache.value, [el.id]: img }
          imageSrcCache.value = { ...imageSrcCache.value, [el.id]: el.src }
          resolve()
        }
        img.onerror = resolve
        img.src = el.src
      }),
    )
  })
  pendingQR.forEach((el) => {
    promises.push(
      ensureQRLoaded(el).then(() => {
        // Wait for image to actually load into cache (3 s timeout to avoid hanging export)
        return new Promise((resolve) => {
          const deadline = Date.now() + 3000
          const check = () => {
            if (imageCache.value[el.id] || Date.now() >= deadline) resolve()
            else setTimeout(check, 50)
          }
          check()
        })
      }),
    )
  })
  pendingIcons.forEach((el) => {
    promises.push(ensureIconLoaded(el))
  })
  if (promises.length) await Promise.all(promises)
}

function triggerDownload(filename, dataUrl) {
  const a = document.createElement('a')
  a.download = filename
  a.href = dataUrl
  a.click()
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function downloadExport(type, pages, cw, ch) {
  const baseName = (editorStore.cardName || 'carte').replace(/\s+/g, '-').toLowerCase()
  // Unified px→mm scale: 680px = 85.6mm (standard business card resolution)
  const PX_PER_MM = CARD_W / 85.6
  const PDF_SCALE = 3 // même ratio que le rendu PNG → page visible comparable
  const mmW = (cw / PX_PER_MM) * PDF_SCALE
  const mmH = (ch / PX_PER_MM) * PDF_SCALE
  const isTwoFace = !!(pages.recto && pages.verso)

  if (type === 'pdf') {
    const { jsPDF } = await import('jspdf')
    const orientation = mmW >= mmH ? 'landscape' : 'portrait'
    const doc = new jsPDF({ orientation, unit: 'mm', format: [mmW, mmH] })
    const firstUrl = pages.recto || pages[Object.keys(pages)[0]]
    doc.addImage(firstUrl, 'PNG', 0, 0, mmW, mmH)
    if (isTwoFace) {
      doc.addPage([mmW, mmH], orientation)
      doc.addImage(pages.verso, 'PNG', 0, 0, mmW, mmH)
    }
    doc.save(`${baseName}.pdf`)
  } else {
    if (isTwoFace) {
      // Merge recto + verso side-by-side with a small gap
      const [imgRecto, imgVerso] = await Promise.all([
        loadImage(pages.recto),
        loadImage(pages.verso),
      ])
      const pw = imgRecto.naturalWidth
      const ph = imgRecto.naturalHeight
      const gap = Math.round(pw * 0.03) // ~3% of card width
      const combined = document.createElement('canvas')
      combined.width = pw * 2 + gap
      combined.height = ph
      const ctx = combined.getContext('2d')
      if (type === 'jpg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, combined.width, combined.height)
      }
      ctx.drawImage(imgRecto, 0, 0)
      ctx.drawImage(imgVerso, pw + gap, 0)
      const mime = type === 'jpg' ? 'image/jpeg' : 'image/png'
      triggerDownload(`${baseName}.${type}`, combined.toDataURL(mime, 1))
    } else {
      // captureDataUrl always returns PNG — re-encode as JPEG with white background for single-page
      let url = pages.recto || pages[Object.keys(pages)[0]]
      if (type === 'jpg') {
        const img = await loadImage(url)
        const cvs = document.createElement('canvas')
        cvs.width = img.naturalWidth
        cvs.height = img.naturalHeight
        const ctx = cvs.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, cvs.width, cvs.height)
        ctx.drawImage(img, 0, 0)
        url = cvs.toDataURL('image/jpeg', 1)
      }
      triggerDownload(`${baseName}.${type}`, url)
    }
  }
}

async function exportCanvas(type) {
  const stage = stageRef.value?.getNode()
  if (!stage) return

  // Hide transformer temporarily
  const tr = transformerRef.value?.getNode()
  const prevNodes = tr ? [...tr.nodes()] : []
  if (tr) tr.nodes([])

  const currentPage = editorStore.activePage
  const otherPage = currentPage === 'recto' ? 'verso' : 'recto'
  const otherHasContent = (editorStore.elements[otherPage]?.length || 0) > 0

  const z = editorStore.zoom
  const cw = editorStore.cardWidth
  const ch = editorStore.cardHeight

  function captureDataUrl() {
    return stage.toDataURL({
      mimeType: 'image/png', // always PNG internally — final JPEG encode done in downloadExport
      quality: 1,
      pixelRatio: 3 / z,
      x: cardOffset.value.x,
      y: cardOffset.value.y,
      width: cw * z,
      height: ch * z,
    })
  }

  // Capture the currently visible page
  const dataUrlCurrent = captureDataUrl()

  if (!otherHasContent) {
    // Single-face card: export as one file
    if (tr) tr.nodes(prevNodes)
    await downloadExport(type, { [currentPage]: dataUrlCurrent }, cw, ch)
    return
  }

  // Two-face card: pre-load other page images, switch canvas, capture, restore
  await ensurePageImagesLoaded(otherPage)
  editorStore.activePage = otherPage // direct mutation keeps selectedIds intact
  await nextTick()
  // Force Konva to synchronously redraw all layers with the new page's elements
  // (nextTick only guarantees Vue's vdom patch — Konva may not have drawn yet)
  stage.getLayers().forEach((l) => l.draw())
  // Second tick: v-image nodes that depend on imageCache may need another render pass
  await nextTick()
  stage.getLayers().forEach((l) => l.draw())
  const dataUrlOther = captureDataUrl()
  editorStore.activePage = currentPage // restore
  await nextTick()
  stage.getLayers().forEach((l) => l.draw())
  if (tr) tr.nodes(prevNodes)

  const rectoUrl = currentPage === 'recto' ? dataUrlCurrent : dataUrlOther
  const versoUrl = currentPage === 'recto' ? dataUrlOther : dataUrlCurrent
  await downloadExport(type, { recto: rectoUrl, verso: versoUrl }, cw, ch)
}
</script>

<style>
/*
 * When the textarea is in rich-text mode (transparent text + Konva segments
 * visible underneath), the browser's default ::selection overrides color to
 * white/black, causing a "double text" ghost. Force the selected text to stay
 * transparent so only the Konva segments (and the selection background) show.
 */
.rich-text-editing::selection {
  color: transparent;
  background-color: rgba(99, 102, 241, 0.35);
}
</style>

