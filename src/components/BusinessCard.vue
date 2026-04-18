<template>
  <div class="card-perspective">
    <div class="card-flip-inner" :class="isFlipped ? 'is-flipped' : ''">
      <!-- ─── FACE AVANT (recto) ────────────────────────────── -->
      <div
        ref="cardEl"
        class="business-card card-face card-front shadow-2xl overflow-hidden relative"
        :style="[cardAspectStyle, cardOuterStyle, cardShapeStyle]"
        @mousemove.prevent="onCardMouseMove"
        @mouseup="stopAction"
        @mouseleave="stopAction"
        @mousedown.self="editMode ? $emit('update:selectedElement', null) : undefined"
      >
        <!-- Éléments (absolus) -->
        <template v-for="el in sortedElements" :key="el.id">
          <!-- ── Texte / Contact ── -->
          <div
            v-if="el.type === 'text' || el.type === 'contact'"
            v-show="el.visible !== false || editMode"
            class="absolute overflow-hidden"
            :class="[elClass(el.id), editMode && editingEl?.id === el.id ? 'cursor-text' : '']"
            :style="elemStyle(el)"
            @mousedown.prevent="editMode && !editingEl ? startDrag(el, $event) : undefined"
            @dblclick.stop.prevent="editMode ? startInlineEdit(el) : undefined"
          >
            <!-- ── Édition inline : textarea transparent calé sur l'élément ── -->
            <textarea
              v-if="editMode && editingEl?.id === el.id"
              ref="inlineInputEl"
              v-model="editingValue"
              @blur="commitInlineEdit"
              @keydown.enter.prevent="commitInlineEdit"
              @keydown.escape.prevent="cancelInlineEdit"
              @mousedown.stop
              class="w-full h-full bg-transparent outline-none resize-none border-0 p-0 m-0 block"
              :style="{ ...textStyle(el), caretColor: el.color || 'white' }"
              autocomplete="off"
              spellcheck="false"
            />
            <!-- ── Affichage normal ── -->
            <template v-else>
              <!-- contact -->
              <div
                v-if="el.type === 'contact' || el.showContactIcon"
                class="flex items-center space-x-1.5 h-full pointer-events-none select-none"
              >
                <component
                  :is="ICON_COMPONENTS[el.role]"
                  v-if="ICON_COMPONENTS[el.role]"
                  class="opacity-70 flex-shrink-0"
                  :style="contactIconStyle(el)"
                />
                <span class="whitespace-nowrap" :style="textStyle(el)">{{ el.text || '' }}</span>
              </div>
              <!-- text (firstName/lastName → h2, autres → p) -->
              <component
                :is="el.role === 'firstName' || el.role === 'lastName' ? 'h2' : 'p'"
                v-else
                class="leading-tight select-none pointer-events-none"
                :style="textStyle(el)"
                >{{
                  el.text || (editMode ? ROLE_LABELS[el.role] || el.label || 'Texte…' : '')
                }}</component
              >
            </template>
            <!-- Poignées (masquées pendant l'édition) -->
            <template v-if="editMode && editingEl?.id !== el.id">
              <div class="rh rh-nw" @mousedown.stop.prevent="startResize(el, 'nw', $event)" />
              <div class="rh rh-ne" @mousedown.stop.prevent="startResize(el, 'ne', $event)" />
              <div class="rh rh-sw" @mousedown.stop.prevent="startResize(el, 'sw', $event)" />
              <div class="rh rh-se" @mousedown.stop.prevent="startResize(el, 'se', $event)" />
            </template>
          </div>

          <!-- ── Image (photo / logo) ── -->
          <div
            v-else-if="el.type === 'image' && (el.src || editMode)"
            v-show="el.visible !== false || editMode"
            class="absolute overflow-hidden"
            :class="elClass(el.id)"
            :style="elemStyle(el)"
            @mousedown.prevent="editMode && !editingEl ? startDrag(el, $event) : undefined"
          >
            <template v-if="el.src">
              <div
                :class="
                  el.shape === 'circle'
                    ? 'w-full h-full rounded-full overflow-hidden border-4 border-white/30 shadow-lg pointer-events-none'
                    : 'w-full h-full pointer-events-none'
                "
              >
                <img
                  :src="el.src"
                  :alt="el.role"
                  :class="
                    el.cover || el.shape === 'circle'
                      ? 'w-full h-full object-cover'
                      : 'w-full h-full object-fill'
                  "
                />
              </div>
            </template>
            <!-- Placeholder éditeur quand pas d'image -->
            <div
              v-else-if="editMode"
              class="w-full h-full border-2 border-dashed border-white/30 rounded flex items-center justify-center pointer-events-none"
            >
              <span class="text-white/40 text-xs">{{ ROLE_LABELS[el.role] }}</span>
            </div>
            <template v-if="editMode">
              <div class="rh rh-nw" @mousedown.stop.prevent="startResize(el, 'nw', $event)" />
              <div class="rh rh-ne" @mousedown.stop.prevent="startResize(el, 'ne', $event)" />
              <div class="rh rh-sw" @mousedown.stop.prevent="startResize(el, 'sw', $event)" />
              <div class="rh rh-se" @mousedown.stop.prevent="startResize(el, 'se', $event)" />
            </template>
          </div>

          <!-- ── QR Code ── -->
          <div
            v-else-if="el.type === 'qr'"
            v-show="el.visible !== false || editMode"
            class="absolute overflow-hidden"
            :class="elClass(el.id)"
            :style="elemStyle(el)"
            @mousedown.prevent="editMode && !editingEl ? startDrag(el, $event) : undefined"
          >
            <div
              :key="qrKey(el)"
              :ref="(c) => mountQR(el, c)"
              class="w-full h-full pointer-events-none"
              style="line-height: 0"
            />
            <template v-if="editMode">
              <div class="rh rh-nw" @mousedown.stop.prevent="startResize(el, 'nw', $event)" />
              <div class="rh rh-ne" @mousedown.stop.prevent="startResize(el, 'ne', $event)" />
              <div class="rh rh-sw" @mousedown.stop.prevent="startResize(el, 'sw', $event)" />
              <div class="rh rh-se" @mousedown.stop.prevent="startResize(el, 'se', $event)" />
            </template>
          </div>

          <!-- ── Icon (Iconify — icons, illustrations, stickers) ── -->
          <div
            v-else-if="el.type === 'icon' && el.iconId"
            v-show="el.visible !== false || editMode"
            class="absolute overflow-hidden"
            :class="elClass(el.id)"
            :style="elemStyle(el)"
            @mousedown.prevent="editMode && !editingEl ? startDrag(el, $event) : undefined"
          >
            <!-- Pre-rasterized SVG data URL (pixel-identical to editor/export) -->
            <img
              v-if="el.iconSvgUrl"
              :src="el.iconSvgUrl"
              class="w-full h-full pointer-events-none"
            />
            <!-- Fallback: Iconify component for cards saved before icon pre-rasterization -->
            <IconifyIcon
              v-else
              :icon="el.iconId"
              class="w-full h-full pointer-events-none"
              :style="el.colorful ? {} : { color: el.color || el.fill || '#1a1a1a' }"
            />
            <template v-if="editMode">
              <div class="rh rh-nw" @mousedown.stop.prevent="startResize(el, 'nw', $event)" />
              <div class="rh rh-ne" @mousedown.stop.prevent="startResize(el, 'ne', $event)" />
              <div class="rh rh-sw" @mousedown.stop.prevent="startResize(el, 'sw', $event)" />
              <div class="rh rh-se" @mousedown.stop.prevent="startResize(el, 'se', $event)" />
            </template>
          </div>

          <!-- ── Block with SVG path (decoration shapes) ── -->
          <div
            v-else-if="el.type === 'block' && el.pathData"
            v-show="el.visible !== false"
            class="absolute pointer-events-none select-none"
            :style="elemStyle(el)"
          >
            <svg
              :viewBox="`0 0 ${el.pathViewBox?.[0] || 24} ${el.pathViewBox?.[1] || 24}`"
              class="w-full h-full"
              preserveAspectRatio="none"
            >
              <path
                :d="el.pathData"
                :fill="el.bgColor || (el.strokePath ? 'none' : '#000')"
                :stroke="el.strokePath || 'none'"
                :stroke-width="el.strokeWidthPath || 0"
                :stroke-dasharray="el.dashPath ? el.dashPath.join(' ') : undefined"
                stroke-linecap="round"
              />
              <!-- Barres d'extrémité solides (line-bar) — séparées pour éviter que le dash s'y applique -->
              <path
                v-if="el.pathDataSolid"
                :d="el.pathDataSolid"
                fill="none"
                :stroke="el.strokePath || 'none'"
                :stroke-width="el.strokeWidthPath || 0"
                stroke-linecap="round"
              />
            </svg>
          </div>

          <!-- ── Block (background / decoration shape) ── -->
          <div
            v-else-if="el.type === 'block'"
            v-show="el.visible !== false"
            class="absolute pointer-events-none select-none"
            :style="elemStyle(el)"
          />
        </template>

        <!-- Contour pointillé éditeur -->
        <div
          v-if="editMode"
          class="absolute inset-0 pointer-events-none"
          :style="{
            borderRadius: `${props.card.data?.cardBorderRadius ?? 8}px`,
            border: '2px dashed rgba(232, 56, 0, 0.35)',
          }"
        />
      </div>

      <!-- ─── FACE ARRIÈRE (verso) ─────────────────────────── -->
      <div
        class="business-card card-face card-back shadow-2xl overflow-hidden relative"
        :style="[cardBackStyle, cardShapeStyle]"
      >
        <template v-for="el in versoElements" :key="el.id">
          <!-- TEXT / CONTACT -->
          <div
            v-if="el.type === 'text' || el.type === 'contact'"
            v-show="el.visible !== false"
            class="absolute overflow-hidden"
            :style="elemStyle(el)"
          >
            <!-- contact: icon + text -->
            <div
              v-if="el.type === 'contact' || el.showContactIcon"
              class="flex items-center space-x-1.5 h-full pointer-events-none select-none"
            >
              <component
                :is="ICON_COMPONENTS[el.role]"
                v-if="ICON_COMPONENTS[el.role]"
                class="opacity-70 flex-shrink-0"
                :style="contactIconStyle(el)"
              />
              <span class="whitespace-nowrap" :style="textStyle(el)">{{ el.text || '' }}</span>
            </div>
            <!-- text -->
            <component
              v-else
              :is="el.role === 'firstName' || el.role === 'lastName' ? 'h2' : 'p'"
              class="leading-tight select-none pointer-events-none"
              :style="textStyle(el)"
              >{{ el.text || '' }}</component
            >
          </div>
          <!-- IMAGE -->
          <div
            v-else-if="el.type === 'image' && el.src"
            v-show="el.visible !== false"
            class="absolute overflow-hidden"
            :style="elemStyle(el)"
          >
            <img :src="el.src" :class="el.cover || el.shape === 'circle' ? 'w-full h-full object-cover' : 'w-full h-full object-fill'" />
          </div>
          <!-- ICON -->
          <div
            v-else-if="el.type === 'icon' && el.iconId"
            v-show="el.visible !== false"
            class="absolute overflow-hidden"
            :style="elemStyle(el)"
          >
            <img
              v-if="el.iconSvgUrl"
              :src="el.iconSvgUrl"
              class="w-full h-full pointer-events-none"
            />
            <IconifyIcon
              v-else
              :icon="el.iconId"
              class="w-full h-full pointer-events-none"
              :style="el.colorful ? {} : { color: el.color || el.fill || '#1a1a1a' }"
            />
          </div>
          <!-- BLOCK with SVG path -->
          <div
            v-else-if="el.type === 'block' && el.pathData"
            v-show="el.visible !== false"
            class="absolute pointer-events-none select-none"
            :style="elemStyle(el)"
          >
            <svg
              :viewBox="`0 0 ${el.pathViewBox?.[0] || 24} ${el.pathViewBox?.[1] || 24}`"
              class="w-full h-full"
              preserveAspectRatio="none"
            >
              <path
                :d="el.pathData"
                :fill="el.bgColor || (el.strokePath ? 'none' : '#000')"
                :stroke="el.strokePath || 'none'"
                :stroke-width="el.strokeWidthPath || 0"
                :stroke-dasharray="el.dashPath ? el.dashPath.join(' ') : undefined"
                stroke-linecap="round"
              />
              <!-- Barres d'extrémité solides (line-bar) — séparées pour éviter que le dash s'y applique -->
              <path
                v-if="el.pathDataSolid"
                :d="el.pathDataSolid"
                fill="none"
                :stroke="el.strokePath || 'none'"
                :stroke-width="el.strokeWidthPath || 0"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <!-- BLOCK -->
          <div
            v-else-if="el.type === 'block'"
            v-show="el.visible !== false"
            class="absolute pointer-events-none select-none"
            :style="elemStyle(el)"
          />
          <!-- QR Code (verso) -->
          <div
            v-else-if="el.type === 'qr'"
            v-show="el.visible !== false"
            class="absolute overflow-hidden"
            :style="elemStyle(el)"
          >
            <div
              :key="qrKey(el)"
              :ref="(c) => mountQR(el, c)"
              class="w-full h-full pointer-events-none"
              style="line-height: 0"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { Mail, Phone, Globe, MapPin } from 'lucide-vue-next'
import { Icon as IconifyIcon } from '@iconify/vue'
import QRCodeStyling from 'qr-code-styling'
import {
  buildVCardFromFields,
  buildQRStylingOptions,
  DEFAULT_QR_FIELDS,
  getContactFromCard,
  applyQRCanvasStyle,
} from '@/utils/qrCodeHelper'
import { useCardsStore } from '@/stores/cards'
import { useFontStore } from '@/stores/fontStore'
import { ROLE_LABELS } from '@/utils/cardElements'

const ICON_COMPONENTS = { email: Mail, phone: Phone, website: Globe, address: MapPin }

const props = defineProps({
  card: { type: Object, required: true },
  isFlipped: { type: Boolean, default: false },
  cardSize: { type: String, default: 'normal' },
  editMode: { type: Boolean, default: false },
  selectedElement: { type: String, default: null },
})

const emit = defineEmits(['update:element', 'commit:element', 'update:selectedElement'])

const store = useCardsStore()
const fontStore = useFontStore()
const cardEl = ref(null)

// Load Google Fonts used by this card
watch(
  () => props.card,
  (card) => {
    if (card) fontStore.loadCardFonts(card)
  },
  { immediate: true },
)

// ── Responsive font scale: ratio of actual rendered width to Konva canvas width
const fontScale = ref(1)
let resizeObs = null

onMounted(() => {
  if (cardEl.value) {
    const update = () => {
      const cw = props.card.data?.cardWidth || 680
      const actual = cardEl.value?.clientWidth || cw
      fontScale.value = actual / cw
    }
    resizeObs = new ResizeObserver(update)
    resizeObs.observe(cardEl.value)
    update()
  }
})
onBeforeUnmount(() => {
  resizeObs?.disconnect()
})

// ── Accès aux éléments ────────────────────────────────────────
const elements = computed(() => props.card.data?.elements || [])

const sortedElements = computed(() =>
  [...elements.value].sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1)),
)

// Verso elements (saved by editor)
const versoElements = computed(() => {
  const els = props.card.data?.versoElements || []
  return [...els].sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1))
})

const getEl = (role) => elements.value.find((e) => e.role === role)?.text || ''
const getSrc = (role) => elements.value.find((e) => e.role === role)?.src || ''

const fullName = computed(() => {
  const fn = getEl('firstName')
  const ln = getEl('lastName')
  return [fn, ln].filter(Boolean).join(' ')
})
const logoSrc = computed(() => getSrc('logo'))

// ── Inline editing ────────────────────────────────────────────
const editingEl = ref(null)
const editingValue = ref('')
const inlineInputEl = ref(null)

const startInlineEdit = (el) => {
  editingEl.value = el
  editingValue.value = el.text || ''
  nextTick(() => {
    inlineInputEl.value?.focus()
    inlineInputEl.value?.select()
  })
}

const commitInlineEdit = () => {
  if (!editingEl.value) return
  emit('update:element', { id: editingEl.value.id, patch: { text: editingValue.value } })
  editingEl.value = null
}

const cancelInlineEdit = () => {
  editingEl.value = null
}

// ── Template / styles globaux ─────────────────────────────────
const template = computed(() => store.getTemplateBySlug(props.card.template) || store.templates[0])

// Aspect-ratio driven by saved card dimensions (handles portrait/landscape)
const cardAspectStyle = computed(() => {
  const cw = props.card.data?.cardWidth || 680
  const ch = props.card.data?.cardHeight || 429
  return {
    aspectRatio: `${cw} / ${ch}`,
    maxWidth: ch > cw ? '300px' : '500px',
  }
})

const cardShapeStyle = computed(() => ({
  borderRadius: `${props.card.data?.cardBorderRadius ?? 8}px`,
}))

const cardOuterStyle = computed(() => {
  const font = { fontFamily: props.card.data?.fontFamily || 'Poppins' }
  if (props.card.data?.backgroundImage) {
    return {
      ...font,
      backgroundImage: `url(${props.card.data.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  // Prefer explicit backgrounds saved by the editor
  if (props.card.data?.backgrounds?.recto) {
    return { ...font, background: props.card.data.backgrounds.recto }
  }
  if (template.value?.slug === 'blank') {
    return { ...font, background: '#ffffff', border: '1px solid #e5e7eb' }
  }
  return {
    ...font,
    background: `linear-gradient(135deg, ${template.value.colors.primary} 0%, ${template.value.colors.secondary} 100%)`,
  }
})

// Verso face background
const cardBackStyle = computed(() => {
  const font = { fontFamily: props.card.data?.fontFamily || 'Poppins' }
  if (props.card.data?.backgrounds?.verso) {
    return { ...font, background: props.card.data.backgrounds.verso }
  }
  // Fall back to recto style
  return cardOuterStyle.value
})

const textColor = computed(() => template.value.colors.text)

// ── QR ────────────────────────────────────────────────────────
function qrKey(el) {
  const c = getContactFromCard(props.card.data)
  const fields = el.qrFields || DEFAULT_QR_FIELDS
  const fieldStr = Object.keys(fields)
    .map((k) => `${k}:${fields[k] ? c[k] || '' : '0'}`)
    .join(',')
  // Include custom fields in key so QR remounts when their values change
  const extras = (props.card.data.contactExtra || [])
    .filter((item) => fields[item.id] !== false)
    .map((item) => `${item.id}:${item.value || ''}`)
    .join(',')
  return [
    el.qrMode,
    el.qrForeground,
    el.qrBackground,
    el.qrDotStyle,
    el.qrCornerSquareStyle,
    el.qrCornerDotStyle,
    el.qrErrorCorrection,
    el.qrLogoSrc || '',
    el.qrMargin ?? 10,
    fieldStr,
    extras,
  ].join('|')
}

const lastMountedQRKeys = new Map()

function mountQR(el, containerEl) {
  if (!containerEl) {
    lastMountedQRKeys.delete(el.id)
    return
  }
  const key = qrKey(el)
  if (lastMountedQRKeys.get(el.id) === key) return
  lastMountedQRKeys.set(el.id, key)
  containerEl.innerHTML = ''
  const contact = getContactFromCard(props.card.data)
  const fields = el.qrFields || DEFAULT_QR_FIELDS
  const vcard = buildVCardFromFields(contact, fields, props.card.data.contactExtra || [])
  const qr = new QRCodeStyling(buildQRStylingOptions(vcard, el, 200))
  qr.append(containerEl)
  nextTick(() => applyQRCanvasStyle(containerEl))
}

// ── Styles par élément ────────────────────────────────────────
const elClass = (id) => {
  if (!props.editMode) return ''
  return ['edit-el', props.selectedElement === id ? 'is-selected' : ''].filter(Boolean).join(' ')
}

const elemStyle = (el) => {
  // Contact elements: auto-size to content in view mode so full text is always visible.
  // In editMode keep the stored percentage width so drag/resize handles work correctly.
  const useAutoWidth = (el.type === 'contact' || el.showContactIcon) && !props.editMode
  const style = {
    left: `${el.x}%`,
    top: `${el.y}%`,
    width: useAutoWidth ? 'max-content' : `${el.w}%`,
    maxWidth: useAutoWidth ? '88%' : undefined,
    height: el.h ? `${el.h}%` : el.type === 'text' || el.type === 'contact' ? 'auto' : `${el.h}%`,
    zIndex: el.zIndex ?? 1,
  }
  if (el.visible === false) {
    style.opacity = props.editMode ? '0.2' : '0'
    style.pointerEvents = props.editMode ? 'auto' : 'none'
  } else if (el.opacity !== undefined) {
    style.opacity = el.opacity
  }
  // Don't apply backgroundColor when block has pathData — the SVG <path> fill handles it.
  // Otherwise the div background covers the entire rectangle, hiding the shape.
  if (el.bgColor && !el.pathData) style.backgroundColor = el.bgColor
  if (el.gradient) style.background = el.gradient
  // fillGradient on blocks/shapes → div background; on text → handled by textStyle instead
  if (el.fillGradient?.from && el.type !== 'text' && el.type !== 'contact')
    style.background = `linear-gradient(${el.fillGradient.angle ?? 180}deg, ${el.fillGradient.from} 0%, ${el.fillGradient.to ?? el.fillGradient.from} 100%)`
  if (el.clipPath) style.clipPath = el.clipPath
  if (el.cornerRadiusPx !== undefined) {
    style.borderRadius = `${el.cornerRadiusPx * fontScale.value}px`
    if (!props.editMode) style.overflow = 'hidden'
  } else if (el.borderRadius && (el.type !== 'image' || el.shape === 'circle')) {
    style.borderRadius = `${el.borderRadius}%`
    if (!props.editMode) style.overflow = 'hidden'
  }
  if (el.rotate || el.rotation) {
    style.transform = `rotate(${el.rotate || el.rotation}deg)`
    style.transformOrigin = '0 0' // match Konva rotation around (x, y) top-left
  }
  if (el.stroke && el.strokeWidth) {
    style.border = `${el.strokeWidth * fontScale.value}px solid ${el.stroke}`
    style.boxSizing = 'border-box'
  }
  if (el.shadowEnabled) {
    const s = fontScale.value
    const ox = (el.shadowOffsetX ?? 3) * s
    const oy = (el.shadowOffsetY ?? 3) * s
    const blur = (el.shadowBlur ?? 8) * s
    const color = el.shadowColor || '#000000'
    const opacity = el.shadowOpacity ?? 0.35
    const r = parseInt(color.slice(1, 3), 16) || 0
    const g = parseInt(color.slice(3, 5), 16) || 0
    const b = parseInt(color.slice(5, 7), 16) || 0
    style.filter = `drop-shadow(${ox}px ${oy}px ${blur}px rgba(${r},${g},${b},${opacity}))`
  }
  return style
}

const textStyle = (el) => {
  const s = fontScale.value
  const style = {
    color: el.color || textColor.value,
    fontSize: el.fontSize ? `${Math.round(el.fontSize * s * 100) / 100}px` : undefined,
    fontFamily: el.fontFamily || undefined,
    fontWeight: el.bold ? 'bold' : 'normal',
    fontStyle: el.italic ? 'italic' : 'normal',
    textDecoration: el.textDecoration || undefined,
    textDecorationColor:
      el.underlineColor && el.textDecoration?.includes('underline')
        ? el.underlineColor
        : undefined,
    textAlign: el.textAlign || 'left',
    letterSpacing: el.letterSpacing
      ? `${Math.round(el.letterSpacing * s * 100) / 100}px`
      : undefined,
    lineHeight: el.lineHeight ? String(el.lineHeight) : undefined,
    whiteSpace: 'pre-wrap',
  }
  // Gradient text: use background-clip technique
  if (el.fillGradient?.from) {
    style.background = `linear-gradient(${el.fillGradient.angle ?? 180}deg, ${el.fillGradient.from} 0%, ${el.fillGradient.to ?? el.fillGradient.from} 100%)`
    style.WebkitBackgroundClip = 'text'
    style.backgroundClip = 'text'
    style.WebkitTextFillColor = 'transparent'
    style.color = 'transparent'
  }
  return style
}

const contactIconStyle = (el) => {
  const s = fontScale.value
  const size = `${Math.round((el.fontSize || 14) * s * 1.1)}px`
  const color = el.fillGradient ? el.fillGradient.from : (el.fill || el.color || 'inherit')
  return { width: size, height: size, color, WebkitTextFillColor: 'initial' }
}

// ── Drag & resize ─────────────────────────────────────────────
const action = reactive({
  active: false,
  type: '',
  id: '',
  handle: '',
  startMX: 0,
  startMY: 0,
  startX: 0,
  startY: 0,
  startW: 0,
  startH: 0,
})

const startDrag = (el, e) => {
  if (editingEl.value) commitInlineEdit()
  emit('update:selectedElement', el.id)
  action.active = true
  action.type = 'drag'
  action.id = el.id
  action.startMX = e.clientX
  action.startMY = e.clientY
  action.startX = el.x
  action.startY = el.y
}

const startResize = (el, handle, e) => {
  emit('update:selectedElement', el.id)
  action.active = true
  action.type = 'resize'
  action.id = el.id
  action.handle = handle
  action.startMX = e.clientX
  action.startMY = e.clientY
  action.startX = el.x
  action.startY = el.y
  action.startW = el.w
  action.startH = el.h
}

const onCardMouseMove = (e) => {
  if (!action.active || !props.editMode || !cardEl.value) return
  const rect = cardEl.value.getBoundingClientRect()
  const dx = ((e.clientX - action.startMX) / rect.width) * 100
  const dy = ((e.clientY - action.startMY) / rect.height) * 100

  const patch = {}
  if (action.type === 'drag') {
    patch.x = Math.max(0, Math.min(90, action.startX + dx))
    patch.y = Math.max(0, Math.min(90, action.startY + dy))
  } else {
    if (action.handle.includes('e')) patch.w = Math.max(8, action.startW + dx)
    if (action.handle.includes('s')) patch.h = Math.max(4, action.startH + dy)
    if (action.handle.includes('w')) {
      patch.w = Math.max(8, action.startW - dx)
      patch.x = action.startX + dx
    }
    if (action.handle.includes('n')) {
      patch.h = Math.max(4, action.startH - dy)
      patch.y = action.startY + dy
    }
  }
  emit('update:element', { id: action.id, patch })
}

const stopAction = () => {
  if (action.active) emit('commit:element')
  action.active = false
}

// ── Verso ─────────────────────────────────────────────────────
</script>

<style scoped>
.card-perspective {
  perspective: 1200px;
  width: 100%;
}

.card-flip-inner {
  position: relative;
  width: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-flip-inner.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.card-back {
  position: absolute;
  inset: 0;
  transform: rotateY(180deg);
}

.business-card {
  /* aspect-ratio and max-width set dynamically via cardAspectStyle based on saved card dimensions */
  min-height: 60px;
}

.edit-el {
  border: 1px dashed transparent;
  border-radius: 4px;
  padding: 2px;
  cursor: move;
  transition:
    border-color 0.15s,
    background 0.15s;
}
.edit-el:hover {
  border-color: rgba(232, 56, 0, 0.6);
  background: rgba(232, 56, 0, 0.06);
}
.edit-el.is-selected {
  border: 2px solid #3b82f6 !important;
  background: rgba(59, 130, 246, 0.08) !important;
}
.edit-el.is-selected .rh {
  opacity: 1;
}

.rh {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #e83800;
  border: 1.5px solid #fff;
  border-radius: 50%;
  z-index: 50;
  pointer-events: auto;
  opacity: 0;
  transition: opacity 0.15s;
}
.edit-el:hover .rh {
  opacity: 1;
}

.rh-nw {
  top: 1px;
  left: 1px;
  cursor: nw-resize;
}
.rh-ne {
  top: 1px;
  right: 1px;
  cursor: ne-resize;
}
.rh-sw {
  bottom: 1px;
  left: 1px;
  cursor: sw-resize;
}
.rh-se {
  bottom: 1px;
  right: 1px;
  cursor: se-resize;
}
</style>
