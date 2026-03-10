<template>
  <!-- Perspective wrapper for 3D flip -->
  <div class="card-perspective">
    <div class="card-flip-inner" :class="isFlipped ? 'is-flipped' : ''">

      <!-- ─── FACE AVANT (recto) ──────────────────────────────── -->
      <div
        ref="cardEl"
        class="business-card card-face card-front rounded-2xl shadow-2xl overflow-hidden relative"
        :style="cardOuterStyle"
        @mousemove.prevent="onCardMouseMove"
        @mouseup="stopAction"
        @mouseleave="stopAction"
        @mousedown.self="editMode ? $emit('update:selectedElement', null) : undefined"
      >
        <!-- ── Mode absolu : éléments indépendants ── -->
        <template v-if="useAbsoluteLayout">

          <!-- Logo -->
          <div
            v-if="card.data.logo"
            class="absolute overflow-hidden"
            :class="elClass('logo')"
            :style="elemStyle('logo')"
            @mousedown.prevent="editMode ? startDrag('logo', $event) : undefined"
          >
            <img :src="card.data.logo" alt="Logo" class="w-full h-full object-contain pointer-events-none" />
            <template v-if="editMode">
              <div class="rh rh-nw" @mousedown.stop.prevent="startResize('logo','nw',$event)" />
              <div class="rh rh-ne" @mousedown.stop.prevent="startResize('logo','ne',$event)" />
              <div class="rh rh-sw" @mousedown.stop.prevent="startResize('logo','sw',$event)" />
              <div class="rh rh-se" @mousedown.stop.prevent="startResize('logo','se',$event)" />
            </template>
          </div>

          <!-- Nom complet -->
          <div
            class="absolute overflow-hidden"
            :class="elClass('fullName')"
            :style="elemStyle('fullName')"
            @mousedown.prevent="editMode ? startDrag('fullName', $event) : undefined"
          >
            <h2 class="leading-tight select-none pointer-events-none" :style="textStyle('fullName')">
              {{ card.data.fullName || 'Nom Complet' }}
            </h2>
            <template v-if="editMode">
              <div class="rh rh-nw" @mousedown.stop.prevent="startResize('fullName','nw',$event)" />
              <div class="rh rh-ne" @mousedown.stop.prevent="startResize('fullName','ne',$event)" />
              <div class="rh rh-sw" @mousedown.stop.prevent="startResize('fullName','sw',$event)" />
              <div class="rh rh-se" @mousedown.stop.prevent="startResize('fullName','se',$event)" />
            </template>
          </div>

          <!-- Titre professionnel -->
          <div
            class="absolute overflow-hidden"
            :class="elClass('title')"
            :style="elemStyle('title')"
            @mousedown.prevent="editMode ? startDrag('title', $event) : undefined"
          >
            <p class="opacity-80 select-none pointer-events-none" :style="textStyle('title')">
              {{ card.data.title || 'Titre professionnel' }}
            </p>
            <template v-if="editMode">
              <div class="rh rh-nw" @mousedown.stop.prevent="startResize('title','nw',$event)" />
              <div class="rh rh-ne" @mousedown.stop.prevent="startResize('title','ne',$event)" />
              <div class="rh rh-sw" @mousedown.stop.prevent="startResize('title','sw',$event)" />
              <div class="rh rh-se" @mousedown.stop.prevent="startResize('title','se',$event)" />
            </template>
          </div>

          <!-- Entreprise -->
          <div
            v-if="card.data.company || editMode"
            class="absolute overflow-hidden"
            :class="elClass('company')"
            :style="elemStyle('company')"
            @mousedown.prevent="editMode ? startDrag('company', $event) : undefined"
          >
            <p class="opacity-90 select-none pointer-events-none" :style="textStyle('company')">
              {{ card.data.company || 'Entreprise' }}
            </p>
            <template v-if="editMode">
              <div class="rh rh-nw" @mousedown.stop.prevent="startResize('company','nw',$event)" />
              <div class="rh rh-ne" @mousedown.stop.prevent="startResize('company','ne',$event)" />
              <div class="rh rh-sw" @mousedown.stop.prevent="startResize('company','sw',$event)" />
              <div class="rh rh-se" @mousedown.stop.prevent="startResize('company','se',$event)" />
            </template>
          </div>

          <!-- Email -->
          <div
            v-if="card.data.email"
            class="absolute overflow-hidden"
            :class="elClass('email')"
            :style="elemStyle('email')"
            @mousedown.prevent="editMode ? startDrag('email', $event) : undefined"
          >
            <div class="flex items-center space-x-1.5 h-full pointer-events-none select-none" :style="textStyle('email')">
              <Mail class="w-3 h-3 opacity-70 flex-shrink-0" />
              <span class="truncate">{{ card.data.email }}</span>
            </div>
            <template v-if="editMode">
              <div class="rh rh-nw" @mousedown.stop.prevent="startResize('email','nw',$event)" />
              <div class="rh rh-ne" @mousedown.stop.prevent="startResize('email','ne',$event)" />
              <div class="rh rh-sw" @mousedown.stop.prevent="startResize('email','sw',$event)" />
              <div class="rh rh-se" @mousedown.stop.prevent="startResize('email','se',$event)" />
            </template>
          </div>

          <!-- Téléphone -->
          <div
            v-if="card.data.phone"
            class="absolute overflow-hidden"
            :class="elClass('phone')"
            :style="elemStyle('phone')"
            @mousedown.prevent="editMode ? startDrag('phone', $event) : undefined"
          >
            <div class="flex items-center space-x-1.5 h-full pointer-events-none select-none" :style="textStyle('phone')">
              <Phone class="w-3 h-3 opacity-70 flex-shrink-0" />
              <span class="truncate">{{ card.data.phone }}</span>
            </div>
            <template v-if="editMode">
              <div class="rh rh-nw" @mousedown.stop.prevent="startResize('phone','nw',$event)" />
              <div class="rh rh-ne" @mousedown.stop.prevent="startResize('phone','ne',$event)" />
              <div class="rh rh-sw" @mousedown.stop.prevent="startResize('phone','sw',$event)" />
              <div class="rh rh-se" @mousedown.stop.prevent="startResize('phone','se',$event)" />
            </template>
          </div>

          <!-- Site web -->
          <div
            v-if="card.data.website"
            class="absolute overflow-hidden"
            :class="elClass('website')"
            :style="elemStyle('website')"
            @mousedown.prevent="editMode ? startDrag('website', $event) : undefined"
          >
            <div class="flex items-center space-x-1.5 h-full pointer-events-none select-none" :style="textStyle('website')">
              <Globe class="w-3 h-3 opacity-70 flex-shrink-0" />
              <span class="truncate">{{ card.data.website }}</span>
            </div>
            <template v-if="editMode">
              <div class="rh rh-nw" @mousedown.stop.prevent="startResize('website','nw',$event)" />
              <div class="rh rh-ne" @mousedown.stop.prevent="startResize('website','ne',$event)" />
              <div class="rh rh-sw" @mousedown.stop.prevent="startResize('website','sw',$event)" />
              <div class="rh rh-se" @mousedown.stop.prevent="startResize('website','se',$event)" />
            </template>
          </div>

          <!-- Adresse -->
          <div
            v-if="card.data.address"
            class="absolute overflow-hidden"
            :class="elClass('address')"
            :style="elemStyle('address')"
            @mousedown.prevent="editMode ? startDrag('address', $event) : undefined"
          >
            <div class="flex items-center space-x-1.5 h-full pointer-events-none select-none" :style="textStyle('address')">
              <MapPin class="w-3 h-3 opacity-70 flex-shrink-0" />
              <span class="truncate">{{ card.data.address }}</span>
            </div>
            <template v-if="editMode">
              <div class="rh rh-nw" @mousedown.stop.prevent="startResize('address','nw',$event)" />
              <div class="rh rh-ne" @mousedown.stop.prevent="startResize('address','ne',$event)" />
              <div class="rh rh-sw" @mousedown.stop.prevent="startResize('address','sw',$event)" />
              <div class="rh rh-se" @mousedown.stop.prevent="startResize('address','se',$event)" />
            </template>
          </div>

          <!-- Photo -->
          <div
            v-if="card.data.photo"
            class="absolute overflow-hidden"
            :class="elClass('photo')"
            :style="elemStyle('photo')"
            @mousedown.prevent="editMode ? startDrag('photo', $event) : undefined"
          >
            <div class="w-full h-full rounded-full overflow-hidden border-4 border-white/30 shadow-lg pointer-events-none">
              <img :src="card.data.photo" alt="Photo" class="w-full h-full object-cover" />
            </div>
            <template v-if="editMode">
              <div class="rh rh-nw" @mousedown.stop.prevent="startResize('photo','nw',$event)" />
              <div class="rh rh-ne" @mousedown.stop.prevent="startResize('photo','ne',$event)" />
              <div class="rh rh-sw" @mousedown.stop.prevent="startResize('photo','sw',$event)" />
              <div class="rh rh-se" @mousedown.stop.prevent="startResize('photo','se',$event)" />
            </template>
          </div>

          <!-- QR Code -->
          <div
            v-if="shouldShowQR"
            class="absolute overflow-hidden"
            :class="elClass('qr')"
            :style="elemStyle('qr')"
            @mousedown.prevent="editMode ? startDrag('qr', $event) : undefined"
          >
            <div class="pointer-events-none" style="line-height: 0; mix-blend-mode: multiply">
              <QrcodeVue :value="qrCodeValue" :size="qrSize" level="L" foreground="#1a1a2e" background="#ffffff" />
            </div>
            <template v-if="editMode">
              <div class="rh rh-nw" @mousedown.stop.prevent="startResize('qr','nw',$event)" />
              <div class="rh rh-ne" @mousedown.stop.prevent="startResize('qr','ne',$event)" />
              <div class="rh rh-sw" @mousedown.stop.prevent="startResize('qr','sw',$event)" />
              <div class="rh rh-se" @mousedown.stop.prevent="startResize('qr','se',$event)" />
            </template>
          </div>

          <!-- Contour pointillé en mode édition -->
          <div
            v-if="editMode"
            class="absolute inset-0 rounded-2xl pointer-events-none"
            style="border: 2px dashed rgba(232,56,0,0.35)"
          />
        </template>

        <!-- ── Mode flex : affichage normal (sans positions sauvegardées) ── -->
        <template v-else>
          <div class="relative p-5 h-full flex flex-col justify-between">
            <!-- Header -->
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div v-if="card.data.logo" class="mb-3 h-8 max-w-28">
                  <img :src="card.data.logo" alt="Logo" class="h-full object-contain" />
                </div>
                <h2 class="text-xl font-bold mb-0.5" :style="{ color: textColor }">
                  {{ card.data.fullName || 'Nom Complet' }}
                </h2>
                <p class="text-xs opacity-80 mb-1" :style="{ color: textColor }">
                  {{ card.data.title || 'Titre professionnel' }}
                </p>
                <p class="text-xs font-semibold opacity-90" :style="{ color: textColor }">
                  {{ card.data.company || 'Entreprise' }}
                </p>
              </div>
              <div v-if="card.data.photo" class="w-16 h-16 rounded-full overflow-hidden border-4 border-white/30 shadow-lg flex-shrink-0">
                <img :src="card.data.photo" alt="Photo" class="w-full h-full object-cover" />
              </div>
            </div>

            <!-- Coordonnées -->
            <div class="space-y-1.5 mt-2">
              <div v-if="card.data.email" class="flex items-center space-x-1.5" :style="{ color: textColor }">
                <Mail class="w-3 h-3 opacity-70 flex-shrink-0" /><span class="text-xs truncate">{{ card.data.email }}</span>
              </div>
              <div v-if="card.data.phone" class="flex items-center space-x-1.5" :style="{ color: textColor }">
                <Phone class="w-3 h-3 opacity-70 flex-shrink-0" /><span class="text-xs truncate">{{ card.data.phone }}</span>
              </div>
              <div v-if="card.data.website" class="flex items-center space-x-1.5" :style="{ color: textColor }">
                <Globe class="w-3 h-3 opacity-70 flex-shrink-0" /><span class="text-xs truncate">{{ card.data.website }}</span>
              </div>
              <div v-if="card.data.address" class="flex items-center space-x-1.5" :style="{ color: textColor }">
                <MapPin class="w-3 h-3 opacity-70 flex-shrink-0" /><span class="text-xs truncate">{{ card.data.address }}</span>
              </div>
            </div>

            <!-- QR code flanc droit -->
            <div
              v-if="shouldShowQR"
              class="absolute"
              :style="{
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                lineHeight: '0',
                mixBlendMode: 'multiply',
              }"
            >
              <QrcodeVue :value="qrCodeValue" :size="120" level="L" foreground="#1a1a2e" background="#ffffff" />
            </div>
          </div>
        </template>
      </div>

      <!-- ─── FACE ARRIÈRE (verso) ────────────────────────────── -->
      <div
        class="business-card card-face card-back rounded-2xl shadow-2xl overflow-hidden"
        :style="cardOuterStyle"
      >
        <div class="relative p-6 h-full flex flex-col justify-start overflow-hidden">
          <div
            v-if="card.backSide?.enabled && (card.backSide?.title || card.backSide?.content)"
            class="flex flex-col h-full"
          >
            <div v-if="card.backSide.title" class="mb-3 pb-2 border-b border-white/20">
              <h3 class="text-lg font-bold leading-tight" :style="{ color: textColor }">
                {{ card.backSide.title }}
              </h3>
            </div>
            <div class="flex-1 overflow-hidden">
              <div v-for="(line, i) in contentLines" :key="i" class="flex items-start space-x-2 mb-1">
                <span v-if="line.trim()" class="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-70 bg-white"></span>
                <span v-if="line.trim()" class="text-xs leading-snug" :style="{ color: textColor }">{{ line }}</span>
                <div v-else class="h-2"></div>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center h-full space-y-4">
            <div v-if="card.data.logo" class="h-12 max-w-40">
              <img :src="card.data.logo" alt="Logo" class="h-full object-contain filter brightness-0 invert opacity-90" />
            </div>
            <div class="text-center space-y-1">
              <p class="text-lg font-bold" :style="{ color: textColor }">{{ card.data.fullName || 'Nom Complet' }}</p>
              <p class="text-sm opacity-75" :style="{ color: textColor }">{{ card.data.title || '' }}</p>
              <p v-if="card.data.company" class="text-xs font-semibold opacity-60" :style="{ color: textColor }">{{ card.data.company }}</p>
            </div>
            <div class="w-16 h-0.5 rounded-full bg-white/40"></div>
            <p v-if="card.data.email" class="text-xs opacity-60" :style="{ color: textColor }">{{ card.data.email }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Mail, Phone, Globe, MapPin } from 'lucide-vue-next'
import QrcodeVue from 'qrcode-vue3'
import { useCardsStore } from '@/stores/cards'

const props = defineProps({
  card: { type: Object, required: true },
  showQR: { type: Boolean, default: false },
  isFlipped: { type: Boolean, default: false },
  cardSize: { type: String, default: 'normal' },
  editMode: { type: Boolean, default: false },
  selectedElement: { type: String, default: null },
})

const emit = defineEmits(['update:elementPositions', 'update:selectedElement', 'commit:elementPositions'])

const store = useCardsStore()
const cardEl = ref(null)

// ── Template courant ──────────────────────────────────────────
const template = computed(() =>
  store.getTemplateBySlug(props.card.template) || store.templates[0]
)

// ── Style global de la carte ──────────────────────────────────
const cardOuterStyle = computed(() => {
  const base = { minHeight: props.cardSize === 'small' ? '240px' : '280px' }
  const font = { fontFamily: props.card.data?.fontFamily || 'Poppins' }
  if (props.card.data?.backgroundImage) {
    return { ...base, ...font, backgroundImage: `url(${props.card.data.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  if (template.value?.slug === 'blank') {
    return { ...base, ...font, background: '#ffffff', border: '1px solid #e5e7eb' }
  }
  return {
    ...base, ...font,
    background: `linear-gradient(135deg, ${template.value.colors.primary} 0%, ${template.value.colors.secondary} 100%)`,
  }
})

const textColor = computed(() => template.value.colors.text)

// ── QR ────────────────────────────────────────────────────────
const shouldShowQR = computed(() => props.showQR || props.card.data?.showQR)
const qrSize = computed(() => props.cardSize === 'small' ? 80 : 110)

// ── Positions + styles par défaut (x, y, w, h — en % ; styles typographiques) ──
const getDefaultPositions = () => ({
  logo:     { x: 4,  y: 5,  w: 25, h: 12, zIndex: 10, visible: true },
  fullName: { x: 4,  y: 20, w: 62, h: 14, fontSize: 18, bold: true,  italic: false, color: null, zIndex: 20, visible: true },
  title:    { x: 4,  y: 35, w: 62, h: 10, fontSize: 11, bold: false, italic: false, color: null, zIndex: 20, visible: true },
  company:  { x: 4,  y: 46, w: 62, h: 9,  fontSize: 11, bold: true,  italic: false, color: null, zIndex: 20, visible: true },
  email:    { x: 4,  y: 60, w: 55, h: 8,  fontSize: 10, bold: false, italic: false, color: null, zIndex: 20, visible: true },
  phone:    { x: 4,  y: 70, w: 55, h: 8,  fontSize: 10, bold: false, italic: false, color: null, zIndex: 20, visible: true },
  website:  { x: 4,  y: 80, w: 55, h: 8,  fontSize: 10, bold: false, italic: false, color: null, zIndex: 20, visible: true },
  address:  { x: 4,  y: 88, w: 55, h: 8,  fontSize: 10, bold: false, italic: false, color: null, zIndex: 20, visible: true },
  photo:    { x: 72, y: 3,  w: 24, h: 44, zIndex: 5, visible: true },
  qr:       { x: 68, y: 52, w: 28, h: 44, zIndex: 5, visible: true },
})

// Positions effectives : defaults mergées avec positions sauvegardées
const elPos = computed(() => {
  const defaults = getDefaultPositions()
  const stored = props.card.data?.elementPositions || {}
  const merged = {}
  for (const key of Object.keys(defaults)) {
    merged[key] = { ...defaults[key], ...(stored[key] && typeof stored[key] === 'object' ? stored[key] : {}) }
  }
  return merged
})

// Utilise layout absolu si editMode OU si des positions ont été sauvegardées (nouveau format)
const hasPositions = computed(() => {
  const pos = props.card.data?.elementPositions
  if (!pos) return false
  return !!(pos.fullName || pos.title || pos.email || pos.phone || pos.qr)
})
const useAbsoluteLayout = computed(() => props.editMode || hasPositions.value)

// Classe CSS de l'élément (édition + sélection)
const elClass = (key) => {
  if (!props.editMode) return ''
  const selected = props.selectedElement === key
  return ['edit-el', selected ? 'is-selected' : ''].filter(Boolean).join(' ')
}

// Style de positionnement pour un élément
const elemStyle = (key) => {
  const pos = elPos.value[key]
  const style = {
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    width: `${pos.w}%`,
    height: `${pos.h}%`,
    zIndex: pos.zIndex ?? 1,
  }
  if (pos.visible === false) {
    style.opacity = props.editMode ? '0.2' : '0'
    style.pointerEvents = props.editMode ? 'auto' : 'none'
  }
  return style
}

// Style typographique d'un élément texte
const textStyle = (key) => {
  const pos = elPos.value[key]
  return {
    color: pos.color || textColor.value,
    fontSize: pos.fontSize ? `${pos.fontSize}px` : undefined,
    fontWeight: pos.bold ? 'bold' : 'normal',
    fontStyle: pos.italic ? 'italic' : 'normal',
  }
}

// ── Drag & resize indépendants ────────────────────────────────
const action = reactive({
  active: false,
  type: '',    // 'drag' | 'resize'
  key: '',
  handle: '',  // pour resize : 'nw' | 'ne' | 'sw' | 'se'
  startMX: 0, startMY: 0,
  startX: 0, startY: 0,
  startW: 0, startH: 0,
})

const startDrag = (key, e) => {
  emit('update:selectedElement', key)
  emit('update:elementPositions', JSON.parse(JSON.stringify(elPos.value)))
  const pos = elPos.value[key]
  action.active = true
  action.type = 'drag'
  action.key = key
  action.startMX = e.clientX
  action.startMY = e.clientY
  action.startX = pos.x
  action.startY = pos.y
}

const startResize = (key, handle, e) => {
  emit('update:selectedElement', key)
  emit('update:elementPositions', JSON.parse(JSON.stringify(elPos.value)))
  const pos = elPos.value[key]
  action.active = true
  action.type = 'resize'
  action.key = key
  action.handle = handle
  action.startMX = e.clientX
  action.startMY = e.clientY
  action.startX = pos.x
  action.startY = pos.y
  action.startW = pos.w
  action.startH = pos.h
}

const onCardMouseMove = (e) => {
  if (!action.active || !props.editMode || !cardEl.value) return
  const rect = cardEl.value.getBoundingClientRect()
  const dx = ((e.clientX - action.startMX) / rect.width) * 100
  const dy = ((e.clientY - action.startMY) / rect.height) * 100

  const curr = { ...elPos.value[action.key] }

  if (action.type === 'drag') {
    curr.x = Math.max(0, Math.min(90, action.startX + dx))
    curr.y = Math.max(0, Math.min(90, action.startY + dy))
  } else if (action.type === 'resize') {
    if (action.handle.includes('e')) curr.w = Math.max(8, action.startW + dx)
    if (action.handle.includes('s')) curr.h = Math.max(4, action.startH + dy)
    if (action.handle.includes('w')) {
      curr.w = Math.max(8, action.startW - dx)
      curr.x = action.startX + dx
    }
    if (action.handle.includes('n')) {
      curr.h = Math.max(4, action.startH - dy)
      curr.y = action.startY + dy
    }
  }

  emit('update:elementPositions', { ...elPos.value, [action.key]: curr })
}

const stopAction = () => {
  if (action.active) {
    emit('commit:elementPositions')
  }
  action.active = false
}

// ── Verso ─────────────────────────────────────────────────────
const contentLines = computed(() => (props.card.backSide?.content || '').split('\n'))

// ── vCard ─────────────────────────────────────────────────────
const qrCodeValue = computed(() => {
  const parts = ['BEGIN:VCARD', 'VERSION:3.0']
  if (props.card.data.fullName) {
    const words = props.card.data.fullName.trim().split(/\s+/)
    parts.push(`N:${words.slice(1).join(' ')};${words[0]};;;`)
    parts.push(`FN:${props.card.data.fullName}`)
  }
  if (props.card.data.title)   parts.push(`TITLE:${props.card.data.title}`)
  if (props.card.data.company) parts.push(`ORG:${props.card.data.company}`)
  if (props.card.data.phone)   parts.push(`TEL:${props.card.data.phone}`)
  if (props.card.data.email)   parts.push(`EMAIL:${props.card.data.email}`)
  if (props.card.data.website) parts.push(`URL:${props.card.data.website}`)
  if (props.card.data.address) parts.push(`ADR:;;${props.card.data.address};;;;`)
  parts.push('END:VCARD')
  return parts.join('\n')
})
</script>

<style scoped>
.card-perspective { perspective: 1200px; }

.card-flip-inner {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-flip-inner.is-flipped { transform: rotateY(180deg); }

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
  aspect-ratio: 16 / 9;
  max-width: 500px;
}

/* ── Éléments glissables en mode édition ── */
.edit-el {
  border: 1px dashed transparent;
  border-radius: 4px;
  padding: 2px;
  cursor: move;
  transition: border-color 0.15s, background 0.15s;
}
.edit-el:hover {
  border-color: rgba(232, 56, 0, 0.6);
  background: rgba(232, 56, 0, 0.06);
}

/* ── Élément sélectionné ── */
.edit-el.is-selected {
  border: 2px solid #3b82f6 !important;
  border-style: solid !important;
  background: rgba(59, 130, 246, 0.08) !important;
}
.edit-el.is-selected .rh { opacity: 1; }

/* ── Poignées de redimensionnement ── */
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
.edit-el:hover .rh { opacity: 1; }

.rh-nw { top: 1px;    left: 1px;  cursor: nw-resize; }
.rh-ne { top: 1px;    right: 1px; cursor: ne-resize; }
.rh-sw { bottom: 1px; left: 1px;  cursor: sw-resize; }
.rh-se { bottom: 1px; right: 1px; cursor: se-resize; }
</style>
