<template>
  <header
    class="flex items-center justify-between px-3 h-14 shrink-0 border-b z-20 bg-base-100 border-base-300 shadow-sm"
  >
    <!-- Left: back + file name -->
    <div class="flex items-center gap-2 min-w-0">
      <!-- Back to dashboard -->
      <button
        @click="goBack"
        class="btn-icon-light flex-shrink-0"
        title="Retour au tableau de bord"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>

      <!-- Logo -->
      <img src="/logo-ECODEV.png" alt="ECODEV" class="h-7 w-auto flex-shrink-0" />

      <div
        class="w-px h-5 flex-shrink-0 bg-base-300"
      />

      <!-- Editable file name -->
      <div class="relative flex-shrink min-w-0">
        <input
          v-model="localName"
          @blur="commitName"
          @keydown.enter="$event.target.blur()"
          @input="
            editorStore.validationErrors = editorStore.validationErrors.filter(
              (r) => r !== 'cardName',
            )
          "
          class="bg-transparent font-medium text-sm outline-none rounded px-1.5 py-0.5 truncate max-w-48 transition-colors"
          :class="[
            editorStore.validationErrors.includes('cardName')
              ? 'ring-1 ring-red-500 bg-red-50 text-red-600'
              : 'text-base-content hover:bg-base-200 focus:bg-base-200',
          ]"
          :style="{ width: nameWidth }"
          :placeholder="editorStore.validationErrors.includes('cardName') ? 'Nom requis…' : ''"
        />
        <!-- dirty dot -->
        <span
          v-if="editorStore.isDirty"
          class="absolute right-0 top-0 w-1.5 h-1.5 rounded-full bg-amber-400"
          title="Modifications non sauvegardées"
        />
      </div>

      <!-- Undo / Redo -->
      <div class="flex items-center gap-0.5 flex-shrink-0">
        <button
          @click="editorStore.undo()"
          :disabled="!editorStore.canUndo"
          class="btn-icon-light disabled:opacity-30 disabled:cursor-not-allowed"
          title="Annuler (Ctrl+Z)"
        >
          <Undo2 class="w-4 h-4" />
        </button>
        <button
          @click="editorStore.redo()"
          :disabled="!editorStore.canRedo"
          class="btn-icon-light disabled:opacity-30 disabled:cursor-not-allowed"
          title="Rétablir (Ctrl+Y)"
        >
          <Redo2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Center: Recto / Verso toggle -->
    <div
      class="flex items-center rounded-lg p-0.5 text-xs font-medium gap-0.5 bg-base-200"
    >
      <button
        @click="editorStore.setPage('recto')"
        class="px-3 py-1.5 rounded-md transition-all"
        :class="
          editorStore.activePage === 'recto'
            ? 'bg-base-100 text-base-content shadow-sm'
            : 'text-base-content/40 hover:text-base-content'
        "
      >
        Recto
      </button>
      <button
        @click="editorStore.setPage('verso')"
        class="px-3 py-1.5 rounded-md transition-all"
        :class="
          editorStore.activePage === 'verso'
            ? 'bg-base-100 text-base-content shadow-sm'
            : 'text-base-content/40 hover:text-base-content'
        "
      >
        Verso
      </button>
    </div>

    <!-- Right: Theme toggle + Share + Export + Save -->
    <div class="flex items-center gap-1.5 flex-shrink-0">
      <!-- Dark/Light toggle -->
      <button
        @click="themeStore.toggleDarkMode()"
        class="btn-icon-light"
        :title="themeStore.darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'"
      >
        <Sun v-if="themeStore.darkMode" class="w-4 h-4" />
        <Moon v-else class="w-4 h-4" />
      </button>

      <div class="w-px h-5 mx-1 bg-base-300" />

      <!-- Share -->
      <button
        @click="shareCard"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium btn-ghost-neutral"
        title="Partager la carte"
      >
        <Share2 class="w-4 h-4" />
        <span class="hidden sm:inline">Partager</span>
      </button>

      <!-- Export dropdown -->
      <div class="relative" ref="exportRef">
        <button
          @click="exportOpen = !exportOpen"
          :disabled="isCardBlank"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium btn-outline disabled:opacity-40 disabled:cursor-not-allowed"
          :title="isCardBlank ? 'Ajoutez des éléments avant d\'exporter' : 'Télécharger'"
        >
          <Download class="w-4 h-4" />
          <span class="hidden sm:inline">Exporter</span>
          <ChevronDown class="w-3 h-3 opacity-60" />
        </button>

        <div
          v-if="exportOpen"
          class="absolute right-0 top-full mt-1 w-44 rounded-xl shadow-xl border overflow-hidden z-50 bg-base-100 border-base-300"
        >
          <button
            v-for="fmt in exportFormats"
            :key="fmt.label"
            @click="exportCard(fmt.type)"
            class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm btn-ghost-neutral text-base-content/80"
          >
            <component :is="fmt.icon" class="w-4 h-4 opacity-60" />
            {{ fmt.label }}
            <span
              v-if="fmt.type !== 'jpg' && !authStore.isPremium && !authStore.isAdmin"
              class="ml-auto text-[10px] font-bold text-amber-500"
              >PRO</span
            >
          </button>
        </div>
      </div>

      <!-- Save -->
      <div class="relative">
        <button
          @click="handleSave"
          :disabled="(!editorStore.isDirty && !savedRecently) || editorStore.isSaving"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed"
          :class="
            savedRecently
              ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
              : editorStore.isDirty
                ? 'bg-flame-600 hover:bg-flame-700 text-white shadow-md shadow-flame-500/30'
                : 'bg-base-200 text-base-content/40 opacity-40'
          "
        >
          <Check v-if="savedRecently" class="w-4 h-4" />
          <Loader2 v-else-if="editorStore.isSaving" class="w-4 h-4 animate-spin" />
          <Save v-else class="w-4 h-4" />
          <span>{{
            savedRecently ? 'Enregistré !' : editorStore.isSaving ? 'Sauvegarde…' : 'Enregistrer'
          }}</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Save As Modal (only for new designs) -->
  <SaveAsModal
    :visible="showSaveModal"
    :dark="themeStore.darkMode"
    :initial-name="editorStore.cardName"
    :can-create-template="templatesStore.canCreateTemplate"
    :max-free-templates="MAX_FREE_TEMPLATES"
    :can-publish="authStore.isPremium || authStore.isAdmin"
    :privacy-conflict="savePrivacyConflict"
    @cancel="showSaveModal = false"
    @save="onSaveAs"
  />

  <!-- Gallery Template Metadata Modal (admin — category, description, premium) -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showGalleryMetaModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.55); backdrop-filter: blur(4px)"
        @click.self="showGalleryMetaModal = false"
      >
        <div
          class="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-base-100 border border-base-300"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-base-300"
          >
            <div>
              <h2
                class="font-bold text-base text-base-content"
              >Informations du modèle</h2>
              <p class="text-xs mt-0.5 text-base-content/40">
                Ces infos apparaissent dans la galerie
              </p>
            </div>
            <button
              @click="showGalleryMetaModal = false"
              class="p-1.5 rounded-lg transition-colors text-base-content/40 hover:bg-base-200"
            ><X class="w-4 h-4" /></button>
          </div>

          <!-- Body -->
          <div class="px-5 py-4 space-y-4">
            <!-- Nom (éditable) -->
            <div>
              <label class="block text-xs font-medium mb-1 text-base-content/70">
                Nom du modèle
              </label>
              <input
                v-model="galleryMetaName"
                type="text"
                placeholder="Nom du modèle…"
                class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-base-200 border-base-300 text-base-content placeholder:text-base-content/40"
              />
            </div>

            <!-- Catégorie (combobox libre) -->
            <div>
              <label class="block text-xs font-medium mb-1 text-base-content/70">
                Catégorie
              </label>
              <input
                v-model="galleryMetaCategory"
                list="gallery-categories"
                type="text"
                placeholder="Choisir ou saisir une catégorie…"
                class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-base-200 border-base-300 text-base-content placeholder:text-base-content/40"
              />
              <datalist id="gallery-categories">
                <option v-for="cat in TEMPLATE_CATEGORIES" :key="cat" :value="cat" />
              </datalist>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-medium mb-1 text-base-content/70">
                Description
                <span class="font-normal opacity-60">(optionnelle)</span>
              </label>
              <textarea
                v-model="galleryMetaDescription"
                rows="3"
                placeholder="Décrivez ce modèle en quelques mots…"
                class="w-full px-3 py-2 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-base-200 border-base-300 text-base-content placeholder:text-base-content/40"
              />
            </div>

            <!-- Premium toggle -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-base-content">Modèle Premium</p>
                <p class="text-xs text-base-content/50">Réservé aux abonnés premium</p>
              </div>
              <button
                @click="galleryMetaIsPremium = !galleryMetaIsPremium"
                class="relative inline-flex h-6 w-11 rounded-full transition-colors duration-200"
                :class="galleryMetaIsPremium ? 'bg-yellow-500' : 'bg-base-300'"
              >
                <span
                  class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
                  :style="{ transform: galleryMetaIsPremium ? 'translateX(20px)' : 'translateX(0)' }"
                />
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex gap-2 px-5 pb-5"
          >
            <button
              @click="showGalleryMetaModal = false"
              class="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors border-base-300 text-base-content/70 hover:bg-base-200"
            >Annuler</button>
            <button
              @click="confirmGalleryMeta"
              class="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors bg-flame-600 hover:bg-flame-700"
            >Enregistrer le modèle</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  ChevronLeft,
  ChevronDown,
  Undo2,
  Redo2,
  Save,
  Check,
  Download,
  Loader2,
  FileImage,
  FileText,
  Code2,
  Sun,
  Moon,
  Share2,
  X,
} from 'lucide-vue-next'
import { useEditorStore } from '@/stores/useEditorStore'
import { useCardsStore } from '@/stores/cards'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useUserTemplatesStore, MAX_FREE_TEMPLATES } from '@/stores/userTemplatesStore'
import { iconToDataUrl } from '@/utils/iconRenderer'
import { hasStyledInfoFields } from '@/utils/cardElements'
import SaveAsModal from '@/components/editor/SaveAsModal.vue'

const router = useRouter()
const editorStore = useEditorStore()
const cardsStore = useCardsStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const notif = useNotificationStore()
const templatesStore = useUserTemplatesStore()

const localName = ref(editorStore.cardName)
const exportOpen = ref(false)
const exportRef = ref(null)
const savedRecently = ref(false)
const showSaveModal = ref(false)

// ── Gallery Template Metadata Modal (admin only) ────────────────────────
const TEMPLATE_CATEGORIES = [
  'Professionnel', 'Créatif', 'Minimaliste', 'Tech', 'Luxe', 'Moderne', 'Sans catégorie',
]
const showGalleryMetaModal = ref(false)
const galleryMetaName = ref('')
const galleryMetaCategory = ref('Professionnel')
const galleryMetaDescription = ref('')
const galleryMetaIsPremium = ref(false)
let saveSuccessTimer = null

const isCardBlank = computed(() => (editorStore.elements?.recto ?? []).length === 0)

watch(
  () => editorStore.cardName,
  (v) => (localName.value = v),
)

const nameWidth = computed(() => {
  const len = localName.value.length
  return Math.max(80, Math.min(192, len * 8)) + 'px'
})

function commitName() {
  const trimmed = localName.value.trim() || 'Ma carte de visite'
  localName.value = trimmed
  editorStore.cardName = trimmed
  editorStore.isDirty = true
}

// Serialize shadow properties (shared across all element types)
function serializeShadow(el) {
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

// Convert a Konva editor element to BusinessCard.vue's % format
function editorToCardEl(el, index, iconUrls = {}) {
  const cw = editorStore.cardWidth
  const ch = editorStore.cardHeight

  // ── Shapes → BusinessCard 'block' elements ──────────────────────────
  if (el.type === 'shape') {
    const block = {
      id: el.id,
      type: 'block',
      visible: el.visible !== false,
      x: (el.x / cw) * 100,
      y: (el.y / ch) * 100,
      w: (el.width / cw) * 100,
      h: (el.height / ch) * 100,
      zIndex: el.zIndex ?? index + 1,
      bgColor: el.fillGradient ? undefined : el.fill || '#000000',
      ...serializeShadow(el),
    }
    if (el.fillGradient?.from) block.fillGradient = el.fillGradient
    if ((el.opacity ?? 1) < 1) block.opacity = el.opacity
    if (el.rotation) block.rotation = el.rotation
    if (el.shapeType === 'rect' && el.cornerRadius > 0) {
      block.cornerRadiusPx = el.cornerRadius
    }
    if (el.shapeType === 'circle') block.borderRadius = 50
    if (el.shapeType === 'custom-poly' && el.polygonPoints) {
      block.clipPath = `polygon(${el.polygonPoints
        .map(
          ([px, py]) =>
            `${parseFloat((px * 100).toFixed(2))}% ${parseFloat((py * 100).toFixed(2))}%`,
        )
        .join(', ')})`
    }
    if (el.shapeType === 'path') {
      block.pathData = el.pathData
      block.pathViewBox = el.pathViewBox
      // For stroke-only path shapes (patterns, grids, separators)
      if (el.stroke && el.strokeWidth > 0) {
        block.strokePath = el.stroke
        block.strokeWidthPath = el.strokeWidth
      }
    }
    // ── Polygon → SVG path ──────────────────────────────────────────
    if (el.shapeType === 'polygon') {
      const sides = el.sides || 5
      const r = Math.min(el.width || 110, el.height || 110) / 2
      const cx = r
      const cy = r
      const pts = []
      for (let i = 0; i < sides; i++) {
        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
        pts.push(
          `${i === 0 ? 'M' : 'L'}${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`,
        )
      }
      block.pathData = pts.join(' ') + ' Z'
      block.pathViewBox = [r * 2, r * 2]
    }
    // ── Star → SVG path ─────────────────────────────────────────────
    if (el.shapeType === 'star') {
      const numPts = el.numPoints || 5
      const ro = Math.min(el.width || 120, el.height || 120) / 2
      const ri = el.innerRadius || ro * 0.45
      const cx = ro
      const cy = ro
      const pts = []
      for (let i = 0; i < numPts * 2; i++) {
        const angle = (Math.PI * i) / numPts - Math.PI / 2
        const radius = i % 2 === 0 ? ro : ri
        pts.push(
          `${i === 0 ? 'M' : 'L'}${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`,
        )
      }
      block.pathData = pts.join(' ') + ' Z'
      block.pathViewBox = [ro * 2, ro * 2]
    }
    // ── Line → SVG path ─────────────────────────────────────────────
    if (el.shapeType === 'line') {
      const sw = el.strokeWidth || el.height || 4
      const w = el.width || 200
      // Konva draws the stroke centered at el.y (points [0,0,w,0]).
      // The SVG path M0,{sw/2} L{w},{sw/2} is centered within its viewBox [w,sw],
      // so the div top must be el.y − sw/2 for the visual center to match.
      block.y = ((el.y - sw / 2) / ch) * 100
      block.h = (sw / ch) * 100 // override: height = actual stroke width
      block.pathData = `M0,${sw / 2} L${w},${sw / 2}`
      block.pathViewBox = [w, sw]
      block.strokePath = el.fill || '#000000'
      block.strokeWidthPath = sw
      block.bgColor = undefined
      if (el.dash && el.dash.length) block.dashPath = el.dash
    }
    // ── Arrow → SVG path (open chevron style) ───────────────────────
    if (el.shapeType === 'arrow') {
      const w = el.width || 200
      const h = el.height || 24
      const sw = el.strokeWidth || Math.max(1, Math.round(h / 6))
      const mid = h / 2
      const cs = h * 0.9 // chevron size
      block.pathData = `M0,${mid} L${w - cs / 2},${mid} M${w - cs},${mid - cs / 2} L${w},${mid} L${w - cs},${mid + cs / 2}`
      block.pathViewBox = [w, h]
      block.strokePath = el.fill || '#000000'
      block.strokeWidthPath = sw
      block.bgColor = undefined
      if (el.dash && el.dash.length) block.dashPath = el.dash
    }
    // ── Arrow-double → SVG path (↔ open chevron both sides) ─────────
    if (el.shapeType === 'arrow-double') {
      const w = el.width || 200
      const h = el.height || 24
      const sw = el.strokeWidth || Math.max(1, Math.round(h / 6))
      const mid = h / 2
      const cs = h * 0.9 // chevron size
      block.pathData = `M${cs},${mid - cs / 2} L0,${mid} L${cs},${mid + cs / 2} M0,${mid} L${w},${mid} M${w - cs},${mid - cs / 2} L${w},${mid} L${w - cs},${mid + cs / 2}`
      block.pathViewBox = [w, h]
      block.strokePath = el.fill || '#000000'
      block.strokeWidthPath = sw
      block.bgColor = undefined
      if (el.dash && el.dash.length) block.dashPath = el.dash
    }
    // ── Line-bar → SVG path (|—|) ────────────────────────────────────
    if (el.shapeType === 'line-bar') {
      const sw = el.strokeWidth || 2
      const w = el.width || 200
      const barH = Math.max(sw * 5, 16)
      const mid = barH / 2
      block.h = (barH / ch) * 100 // override: height = actual bar height
      block.pathData = `M0,0 L0,${barH} M0,${mid} L${w},${mid} M${w},0 L${w},${barH}`
      block.pathViewBox = [w, barH]
      block.strokePath = el.fill || '#000000'
      block.strokeWidthPath = sw
      block.bgColor = undefined
      if (el.dash && el.dash.length) block.dashPath = el.dash
    }
    // CSS stroke/border — only for shapes WITHOUT SVG pathData (rect, circle, etc.)
    // Shapes with pathData use SVG stroke attributes (strokePath/strokeWidthPath) instead.
    if (!block.pathData && el.stroke && el.strokeWidth > 0) {
      block.stroke = el.stroke
      block.strokeWidth = el.strokeWidth
    }
    return block
  }

  // ── Text → BusinessCard element ───────────────────────────────────────
  if (el.type === 'text' || el.type === 'contact') {
    const role = el.role || el.id
    // Konva auto-sizes text when width is null — estimate for CSS preview
    const effectiveW = el.width ?? Math.min(cw * 0.85, Math.max(150, (el.text || '').length * (el.fontSize || 16) * 1.0))
    const out = {
      id: el.id,
      type: el.showContactIcon ? 'contact' : 'text',
      role,
      text: el.text || '',
      x: (el.x / cw) * 100,
      y: (el.y / ch) * 100,
      w: (effectiveW / cw) * 100,
      h: el.height ? (el.height / ch) * 100 : undefined,
      zIndex: el.zIndex ?? index + 1,
      color: el.fillGradient ? undefined : (el.fill || undefined),
      fontSize: el.fontSize || undefined,
      fontFamily: el.fontFamily || undefined,
      letterSpacing: el.letterSpacing != null ? el.letterSpacing : undefined,
      textDecoration: el.textDecoration || undefined,
      underlineColor: el.underlineColor || undefined,
      bold: el.fontStyle?.includes('bold') || false,
      italic: el.fontStyle?.includes('italic') || false,
      textAlign: el.align || 'left',
      lineHeight: el.lineHeight != null ? el.lineHeight : undefined,
      visible: el.visible !== false,
      opacity: (el.opacity ?? 1) < 1 ? el.opacity : undefined,
      rotation: el.rotation || undefined,
      ...serializeShadow(el),
    }
    if (el.fillGradient?.from) out.fillGradient = el.fillGradient
    if (Array.isArray(el.runs) && el.runs.length) out.runs = el.runs
    return out
  }

  // ── Icon (icons, illustrations, stickers) ──────────────────────────
  if (el.type === 'icon') {
    const out = {
      id: el.id,
      type: 'icon',
      iconId: el.iconId,
      fill: el.fill || '#1a1a1a',
      colorful: el.colorful || false,
      x: (el.x / cw) * 100,
      y: (el.y / ch) * 100,
      w: (el.width / cw) * 100,
      h: (el.height / ch) * 100,
      zIndex: el.zIndex ?? index + 1,
      visible: el.visible !== false,
      opacity: (el.opacity ?? 1) < 1 ? el.opacity : undefined,
      rotation: el.rotation || undefined,
      ...serializeShadow(el),
    }
    if (iconUrls[el.id]) out.iconSvgUrl = iconUrls[el.id]
    if (el.stroke && el.strokeWidth > 0) {
      out.stroke = el.stroke
      out.strokeWidth = el.strokeWidth
    }
    return out
  }

  // ── Image elements ──────────────────────────────────────────────────
  if (el.type === 'image') {
    const imgOut = {
      id: el.id,
      type: 'image',
      role: el.role || 'logo',
      src: el.src || undefined,
      x: (el.x / cw) * 100,
      y: (el.y / ch) * 100,
      w: (el.width / cw) * 100,
      h: (el.height / ch) * 100,
      zIndex: el.zIndex ?? index + 1,
      visible: el.visible !== false,
      borderRadius: el.borderRadius || undefined,
      shape: el.shape || ((el.borderRadius || 0) >= 50 ? 'circle' : undefined),
      cover: el.role === 'background' || el.cover || undefined,
      opacity: el.opacity !== undefined ? el.opacity : undefined,
      rotation: el.rotation || undefined,
      ...serializeShadow(el),
    }
    if (el.stroke && el.strokeWidth > 0) {
      imgOut.stroke = el.stroke
      imgOut.strokeWidth = el.strokeWidth
    }
    return imgOut
  }

  if (el.type === 'qr') {
    return {
      id: el.id,
      type: 'qr',
      x: (el.x / cw) * 100,
      y: (el.y / ch) * 100,
      w: (el.width / cw) * 100,
      h: (el.height / ch) * 100,
      zIndex: el.zIndex ?? index + 1,
      visible: el.visible !== false,
      opacity: (el.opacity ?? 1) < 1 ? el.opacity : undefined,
      rotation: el.rotation || undefined,
      qrFields: el.qrFields ? { ...el.qrFields } : undefined,
      qrMode: el.qrMode || 'standard',
      qrForeground: el.qrForeground || '#000000',
      qrBackground: el.qrBackground || '#ffffff',
      qrDotStyle: el.qrDotStyle || 'square',
      qrCornerSquareStyle: el.qrCornerSquareStyle || 'square',
      qrCornerDotStyle: el.qrCornerDotStyle || 'square',
      qrErrorCorrection: el.qrErrorCorrection || 'M',
      qrLogoSrc: el.qrLogoSrc || '',
      qrMargin: el.qrMargin ?? 10,
      ...serializeShadow(el),
    }
  }

  return null
}

// Contact field roles used for structured JSON storage + QR code
const CONTACT_ROLES = [
  'firstName',
  'lastName',
  'title',
  'company',
  'email',
  'phone',
  'website',
  'address',
]

function extractContact(els, extras = []) {
  const contact = {}
  CONTACT_ROLES.forEach((role) => {
    const el = els.find((e) => e.role === role && e.text)
    if (el) contact[role] = el.text
  })
  if (contact.firstName || contact.lastName) {
    contact.fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ')
  }
  // Merge custom labeled fields
  extras.forEach(({ label, value }) => {
    if (label && value) contact[label] = value
  })
  return contact
}

// ── Save logic ──────────────────────────────────────────────────────────────

// Reactively detects if any Info-role element has styled runs (Privacy Guard)
const savePrivacyConflict = computed(() => {
  const allEls = [
    ...(editorStore.elements?.recto ?? []),
    ...(editorStore.elements?.verso ?? []),
  ]
  return hasStyledInfoFields(allEls)
})

/**
 * Decide what to do when user clicks "Enregistrer":
 * - If editing an existing template → update template directly
 * - If editing an existing card → update card directly
 * - If new design → show SaveAsModal to choose template or card
 */
function handleSave() {
  if (editorStore.editMode === 'edit-gallery-template') {
    // Pre-fill modal from existing template if editing, else use defaults
    const existing = editorStore.editingGallerySlug
      ? cardsStore.getTemplateBySlug(editorStore.editingGallerySlug)
      : null
    galleryMetaName.value = editorStore.cardName
    galleryMetaCategory.value = existing?.category || 'Professionnel'
    galleryMetaDescription.value = existing?.description || ''
    galleryMetaIsPremium.value = existing?.isPremium || false
    showGalleryMetaModal.value = true
  } else if (editorStore.editMode === 'edit-template' && authStore.isAdmin) {
    // Admin editing a template → toujours sauvegarder comme modèle officiel
    const existing = editorStore.editingGallerySlug
      ? cardsStore.getTemplateBySlug(editorStore.editingGallerySlug)
      : null
    galleryMetaName.value = editorStore.cardName
    galleryMetaCategory.value = existing?.category || 'Professionnel'
    galleryMetaDescription.value = existing?.description || ''
    galleryMetaIsPremium.value = existing?.isPremium || false
    showGalleryMetaModal.value = true
  } else if (editorStore.editMode === 'edit-template') {
    saveAsTemplate(editorStore.cardName)
  } else if (editorStore.editMode === 'edit-card') {
    saveAsCard(editorStore.cardName)
  } else if (authStore.isAdmin) {
    // Nouveau design admin → directement modal modèle officiel
    galleryMetaName.value = editorStore.cardName
    galleryMetaCategory.value = 'Professionnel'
    galleryMetaDescription.value = ''
    galleryMetaIsPremium.value = false
    showGalleryMetaModal.value = true
  } else {
    // New design utilisateur → show modal to choose
    showSaveModal.value = true
  }
}

/**
 * Called when admin confirms the gallery template metadata modal.
 */
function confirmGalleryMeta() {
  saveAsGalleryTemplate(galleryMetaName.value || editorStore.cardName, {
    category: galleryMetaCategory.value,
    description: galleryMetaDescription.value,
    isPremium: galleryMetaIsPremium.value,
  })
}

/**
 * Called by SaveAsModal when user confirms their choice.
 * @param {{ type: 'template' | 'card', name: string }} choice
 */
async function onSaveAs(choice) {
  showSaveModal.value = false
  editorStore.cardName = choice.name
  localName.value = choice.name
  editorStore.isPublic = choice.isPublic ?? false

  if (choice.type === 'template') {
    await saveAsTemplate(choice.name)
  } else {
    await saveAsCard(choice.name)
  }
}

/**
 * Save the current design as a user template (model).
 */
async function saveAsTemplate(name) {
  editorStore.isSaving = true
  try {
    const cardData = editorStore.getCardData()
    const payload = {
      name,
      editorData: cardData,
      fieldConfig: JSON.parse(JSON.stringify(editorStore.fieldConfig)),
      templateSlug: editorStore.templateSlug || null,
      isAuto: false,
      isPublic: editorStore.isPublic,
    }

    if (editorStore.editingTemplateId) {
      // Update existing template
      await templatesStore.updateTemplate(editorStore.editingTemplateId, payload)
    } else {
      // Create new template
      const newTemplate = await templatesStore.addTemplate(payload)
      editorStore.editingTemplateId = newTemplate.id
      editorStore.editMode = 'edit-template'
    }

    editorStore.isDirty = false
    showSaveSuccess()
  } catch (err) {
    console.error('[saveAsTemplate]', err)
    notif.error(err.message || 'Erreur lors de la sauvegarde du modèle.')
  } finally {
    editorStore.isSaving = false
  }
}

/**
 * Save the current design as an official gallery template (admin only).
 * Stores both editorData (for re-editing) and previewElements (for gallery rendering).
 */
async function saveAsGalleryTemplate(name, meta = {}) {
  editorStore.isSaving = true
  showGalleryMetaModal.value = false
  // Sync name back to editor top-bar (user may have changed it in the modal)
  if (name && name !== editorStore.cardName) editorStore.cardName = name
  try {
    const cardData = editorStore.getCardData()
    // Extract dominant colors from backgrounds for the template colors
    const bgRecto = cardData.backgrounds?.recto || '#6366F1'
    const bgVerso = cardData.backgrounds?.verso || '#1E293B'
    const primaryColor = typeof bgRecto === 'string' && bgRecto.startsWith('#') ? bgRecto : '#6366F1'
    const secondaryColor = typeof bgVerso === 'string' && bgVerso.startsWith('#') ? bgVerso : '#1E293B'

    // Pre-compute icon SVG data URLs for pixel-identical rendering in BusinessCard.vue
    const allEls = [...(cardData.elements?.recto || []), ...(cardData.elements?.verso || [])]
    const iconUrls = {}
    await Promise.all(
      allEls.filter((e) => e.type === 'icon' && e.iconId).map(async (el) => {
        iconUrls[el.id] = await iconToDataUrl(el.iconId, el.fill || '#1a1a1a', el.colorful)
      }),
    )

    // Convert Konva px elements → BusinessCard % elements for gallery preview
    const rectoEls = (cardData.elements?.recto || []).map((el, i) => editorToCardEl(el, i, iconUrls)).filter(Boolean)
    const versoEls = (cardData.elements?.verso || []).map((el, i) => editorToCardEl(el, i, iconUrls)).filter(Boolean)

    // Extract dominant fontFamily (same approach as saveAsCard)
    const fontCounts = {}
    rectoEls.filter((e) => (e.type === 'text' || e.type === 'contact') && e.fontFamily).forEach((e) => {
      fontCounts[e.fontFamily] = (fontCounts[e.fontFamily] || 0) + 1
    })
    const dominantFont = Object.entries(fontCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || undefined

    const data = {
      name,
      category: meta.category || 'Personnalisé',
      description: meta.description || '',
      isPremium: meta.isPremium || false,
      colors: { primary: primaryColor, secondary: secondaryColor, text: '#ffffff' },
      editorData: JSON.parse(JSON.stringify(cardData)),
      previewElements: rectoEls,
      previewVersoElements: versoEls,
      previewBackgrounds: cardData.backgrounds || { recto: primaryColor, verso: secondaryColor },
      previewCardWidth: editorStore.cardWidth,
      previewCardHeight: editorStore.cardHeight,
      previewCardBorderRadius: editorStore.cardBorderRadius,
      previewOrientation: editorStore.orientation,
      previewFontFamily: dominantFont,
    }

    const slug = editorStore.editingGallerySlug
    if (slug) {
      cardsStore.updateOfficialTemplate(slug, data)
      editorStore.editMode = 'edit-gallery-template'
    } else {
      const newTmpl = cardsStore.addOfficialTemplate(data)
      if (newTmpl) {
        editorStore.editingGallerySlug = newTmpl.slug
        editorStore.editingTemplateId = null
        editorStore.editMode = 'edit-gallery-template'
      }
    }

    editorStore.isDirty = false
    showSaveSuccess()
  } catch (err) {
    console.error('[saveAsGalleryTemplate]', err)
    notif.error(err.message || 'Erreur lors de la sauvegarde du modèle officiel.')
  } finally {
    editorStore.isSaving = false
  }
}

/**
 * Save the current design as a card.
 * Creates an auto-generated template (isAuto: true, hidden) behind the scenes.
 */
async function saveAsCard(name) {
  editorStore.isSaving = true
  try {
    const cardData = editorStore.getCardData()

    // Pre-compute icon SVG data URLs for pixel-identical rendering in BusinessCard.vue
    const allEls = [...(cardData.elements?.recto || []), ...(cardData.elements?.verso || [])]
    const iconUrls = {}
    await Promise.all(
      allEls.filter((e) => e.type === 'icon' && e.iconId).map(async (el) => {
        iconUrls[el.id] = await iconToDataUrl(el.iconId, el.fill || '#1a1a1a', el.colorful)
      }),
    )

    const rectoEls = (cardData.elements?.recto || [])
      .map((el, i) => editorToCardEl(el, i, iconUrls))
      .filter(Boolean)

    const versoEls = (cardData.elements?.verso || [])
      .map((el, i) => editorToCardEl(el, i, iconUrls))
      .filter(Boolean)

    const contact = extractContact([...rectoEls, ...versoEls], editorStore.contactExtra)

    // Extract dominant fontFamily from recto text elements
    const fontCounts = {}
    rectoEls
      .filter((e) => (e.type === 'text' || e.type === 'contact') && e.fontFamily)
      .forEach((e) => {
        fontCounts[e.fontFamily] = (fontCounts[e.fontFamily] || 0) + 1
      })
    const dominantFont = Object.entries(fontCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || undefined

    // Create or find the auto-template behind the scenes
    let templateModelId = editorStore.editingTemplateId || null
    if (!templateModelId) {
      // Create auto-generated hidden template
      const autoTemplate = await templatesStore.addTemplate({
        name: `Auto — ${name}`,
        editorData: cardData,
        fieldConfig: JSON.parse(JSON.stringify(editorStore.fieldConfig)),
        templateSlug: editorStore.templateSlug || null,
        isAuto: true,
      })
      templateModelId = autoTemplate.id
      editorStore.editingTemplateId = templateModelId
    }

    const payload = {
      name,
      template: editorStore.templateSlug || 'blank',
      isPublic: false, // cards are always private — only templates can be public
      templateModelId,
      data: {
        elements: rectoEls,
        versoElements: versoEls,
        backgrounds: cardData.backgrounds,
        contact,
        contactExtra: JSON.parse(JSON.stringify(editorStore.contactExtra)),
        fieldConfig: JSON.parse(JSON.stringify(editorStore.fieldConfig)),
        editorData: cardData,
        showQR: [...rectoEls, ...versoEls].some((e) => e.type === 'qr'),
        fontFamily: dominantFont,
        orientation: editorStore.orientation,
        cardWidth: editorStore.cardWidth,
        cardHeight: editorStore.cardHeight,
        cardBorderRadius: editorStore.cardBorderRadius,
      },
    }

    if (editorStore.editingCardId) {
      const updated = await cardsStore.updateCard(editorStore.editingCardId, payload)
      if (!updated) throw new Error('Carte introuvable — impossible de sauvegarder')
    } else {
      const newCard = await cardsStore.addCard(payload)
      editorStore.editingCardId = newCard.id
      editorStore.editMode = 'edit-card'
    }

    editorStore.isDirty = false
    showSaveSuccess()
  } catch (err) {
    console.error('[saveAsCard]', err)
    notif.error(err.message || 'Erreur lors de la sauvegarde. Veuillez réessayer.')
  } finally {
    editorStore.isSaving = false
  }
}

function showSaveSuccess() {
  savedRecently.value = true
  clearTimeout(saveSuccessTimer)
  const redirectTo = editorStore.editMode === 'edit-gallery-template' ? '/admin/templates' : '/dashboard'
  saveSuccessTimer = setTimeout(() => {
    savedRecently.value = false
    router.push(redirectTo)
  }, 800)
}

function goBack() {
  router.push(editorStore.editMode === 'edit-gallery-template' ? '/admin/templates' : '/dashboard')
}

const exportFormats = [
  { label: 'PNG', type: 'png', icon: FileImage },
  { label: 'JPG', type: 'jpg', icon: FileImage },
  { label: 'PDF', type: 'pdf', icon: FileText },
  { label: 'JSON', type: 'json', icon: Code2 },
]

function shareCard() {
  exportOpen.value = false
  if (editorStore.isDirty) {
    notif.warning('Sauvegardez votre carte avant de la partager.')
    return
  }
  if (!editorStore.editingCardId) {
    notif.warning('Sauvegardez votre carte avant de la partager.')
    return
  }
  router.push(`/share/${editorStore.editingCardId}`)
}

function exportCard(type) {
  exportOpen.value = false
  if (isCardBlank.value) return
  // Gratuit : JPG uniquement
  if (type !== 'jpg' && !authStore.isPremium && !authStore.isAdmin) {
    notif.warning(`L'export en ${type.toUpperCase()} est réservé au plan Premium.`)
    router.push('/pricing')
    return
  }
  if (type === 'json') {
    downloadJSON()
    return
  }
  // Other exports delegated to canvas via a custom event
  window.dispatchEvent(new CustomEvent('editor:export', { detail: { type } }))
}

function buildVCard(contact) {
  const fn = contact.firstName || ''
  const ln = contact.lastName || ''
  const lines = ['BEGIN:VCARD', 'VERSION:3.0']
  if (fn || ln) {
    lines.push(`N:${ln};${fn};;;`)
    lines.push(`FN:${[fn, ln].filter(Boolean).join(' ')}`)
  }
  if (contact.title) lines.push(`TITLE:${contact.title}`)
  if (contact.company) lines.push(`ORG:${contact.company}`)
  if (contact.phone) lines.push(`TEL:${contact.phone}`)
  if (contact.email) lines.push(`EMAIL:${contact.email}`)
  if (contact.website) lines.push(`URL:${contact.website}`)
  if (contact.address) lines.push(`ADR:;;${contact.address};;;;`)
  lines.push('END:VCARD')
  return lines.join('\n')
}

function downloadJSON() {
  const cardData = editorStore.getCardData()
  const rectoEls = (cardData.elements?.recto || [])
    .map((el, i) => editorToCardEl(el, i))
    .filter(Boolean)
  const versoEls = (cardData.elements?.verso || [])
    .map((el, i) => editorToCardEl(el, i))
    .filter(Boolean)

  const contact = extractContact(rectoEls, editorStore.contactExtra)
  const vcard = buildVCard(contact)

  const exportData = {
    name: cardData.name,
    template: editorStore.templateSlug || 'blank',
    exportedAt: new Date().toISOString(),
    contact,
    contactExtra: JSON.parse(JSON.stringify(editorStore.contactExtra)),
    vcard,
    recto: rectoEls.filter((e) => e.type === 'text').map((e) => ({ role: e.role, text: e.text })),
    verso: versoEls.filter((e) => e.type === 'text').map((e) => ({ role: e.role, text: e.text })),
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(cardData.name || 'carte').replace(/\s+/g, '-').toLowerCase()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function onClickOutside(e) {
  if (exportRef.value && !exportRef.value.contains(e.target)) {
    exportOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
  clearTimeout(saveSuccessTimer)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
