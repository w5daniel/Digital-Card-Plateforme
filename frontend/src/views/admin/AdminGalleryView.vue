<template>
  <div class="space-y-4">

    <!-- ── Barre de recherche ── -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
      <input
        v-model="search"
        type="text"
        placeholder="Nom du modèle, propriétaire..."
        class="w-full pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-flame-500 bg-base-100 border-base-300 text-base-content placeholder:text-base-content/40"
      />
    </div>

    <!-- Compteur -->
    <p class="text-xs text-base-content/40">
      {{ filteredCommunity.length }} modèle(s) partagé(s) par les utilisateurs
      <span v-if="filteredCommunity.length !== communityTemplates.length">
        sur {{ communityTemplates.length }}
      </span>
    </p>

    <!-- ── Grille modèles communauté ── -->
    <div v-if="filteredCommunity.length > 0" ref="gridRef" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="tpl in filteredCommunity"
        :key="tpl.id"
        class="rounded-xl border overflow-hidden flex flex-col bg-base-100 border-base-300"
      >
        <!-- Aperçu BusinessCard -->
        <div
          class="relative overflow-hidden bg-base-200"
          style="aspect-ratio: 4/3"
        >
          <div :style="previewInnerStyle(tpl)">
            <BusinessCard :card="buildPreviewCard(tpl)" :isFlipped="false" />
          </div>
          <!-- Badge propriétaire -->
          <span class="absolute top-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-black/50 text-white truncate max-w-[120px]">
            {{ tpl.ownerName || tpl.ownerEmail || '?' }}
          </span>
        </div>

        <!-- Infos + actions -->
        <div class="p-3 flex-1 flex flex-col gap-2">
          <p class="font-medium text-sm truncate text-base-content">
            {{ tpl.name || 'Sans titre' }}
          </p>
          <p class="text-xs truncate text-base-content/40">
            {{ tpl.ownerEmail || tpl.ownerId || '—' }}
          </p>
          <p class="text-xs text-base-content/40">
            {{ formatDate(tpl.updatedAt || tpl.createdAt) }}
          </p>
          <div class="flex items-center gap-2 mt-auto pt-1">
            <router-link
              to="/gallery?tab=community"
              class="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors flex-1 justify-center border border-base-300 text-base-content/80 hover:bg-base-200"
            >
              <ExternalLink class="w-3 h-3" />
              <span>Voir</span>
            </router-link>
            <button
              @click="confirmDeleteTemplate(tpl)"
              class="flex items-center gap-1 px-2 py-1 rounded-lg text-xs flex-1 justify-center border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 class="w-3 h-3" />
              <span>Retirer</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div
      v-else
      class="rounded-xl border p-12 text-center bg-base-100 border-base-300"
    >
      <Globe class="w-10 h-10 mx-auto mb-3 opacity-30 text-base-content/40" />
      <p class="text-sm font-medium mb-1 text-base-content/80">
        Aucun modèle dans la galerie communauté
      </p>
      <p class="text-xs text-base-content/40">
        {{ search ? 'Aucun modèle ne correspond à la recherche.' : 'Les modèles apparaissent ici quand les utilisateurs activent "Public" depuis leur dashboard.' }}
      </p>
      <button v-if="search" @click="search = ''" class="mt-2 text-flame-500 hover:underline text-xs">
        Effacer la recherche
      </button>
    </div>

    <!-- ── Modal confirmation suppression ── -->
    <div
      v-if="templateToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="templateToDelete = null"
      @keydown.escape="templateToDelete = null"
      tabindex="-1"
    >
      <div
        class="w-full max-w-sm rounded-xl p-6 shadow-xl border bg-base-100 border-base-300"
      >
        <h3 class="font-semibold mb-2 text-base-content">
          Retirer de la galerie communauté
        </h3>
        <p class="text-sm mb-1 text-base-content/50">
          Retirer définitivement <strong>"{{ templateToDelete.name || 'Sans titre' }}"</strong> de {{ templateToDelete.ownerName || templateToDelete.ownerEmail || templateToDelete.ownerId }} ?
        </p>
        <p class="text-xs mb-4 text-base-content/40">
          Le modèle restera dans le dashboard de l'utilisateur mais ne sera plus visible publiquement.
        </p>
        <div class="flex space-x-3">
          <button
            @click="templateToDelete = null"
            class="flex-1 px-4 py-2 rounded-lg border text-sm transition-colors border-base-300 text-base-content/80 hover:bg-base-200"
          >
            Annuler
          </button>
          <button @click="doDeleteTemplate" class="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
            Retirer
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div
        v-if="toast"
        class="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium bg-green-500 text-white"
      >
        <CheckCircle class="w-4 h-4 flex-shrink-0" />
        <span>{{ toast }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Search, Globe, Trash2, CheckCircle, ExternalLink } from 'lucide-vue-next'
import { useThemeStore } from '../../stores/themeStore'
import { useUserTemplatesStore } from '../../stores/userTemplatesStore'
import { konvaToCardEl } from '../../utils/cardElements'
import BusinessCard from '../../components/BusinessCard.vue'

const themeStore = useThemeStore()
const templatesStore = useUserTemplatesStore()

// Mesure dynamique de la largeur de colonne
const gridRef = ref(null)
const colW = ref(280)
let ro = null

function computeColW() {
  if (!gridRef.value) return
  const firstChild = gridRef.value.firstElementChild
  colW.value = firstChild ? firstChild.offsetWidth : gridRef.value.offsetWidth / 4
}

onMounted(() => {
  computeColW()
  ro = new ResizeObserver(computeColW)
  if (gridRef.value) ro.observe(gridRef.value)
})

onBeforeUnmount(() => ro?.disconnect())

const search = ref('')
const templateToDelete = ref(null)
const toast = ref(null)
let toastTimer = null

function showToast(msg) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = msg
  toastTimer = setTimeout(() => { toast.value = null }, 2500)
}

// ── Données ──────────────────────────────────────────────────────────────
const communityTemplates = computed(() => {
  void templatesStore.communityVersion // dépendance réactive — force recalcul après suppression
  return templatesStore.getAllCommunityTemplates()
})

// ── Filtre ───────────────────────────────────────────────────────────────
const filteredCommunity = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return communityTemplates.value
  return communityTemplates.value.filter(
    (t) =>
      (t.name || '').toLowerCase().includes(q) ||
      (t.ownerName || '').toLowerCase().includes(q) ||
      (t.ownerEmail || '').toLowerCase().includes(q) ||
      (t.ownerId || '').toLowerCase().includes(q),
  )
})

// ── Aperçu BusinessCard (même logique que GalleryView) ───────────────────
function buildPreviewCard(tpl) {
  const cw = tpl.editorData?.cardWidth || 680
  const ch = tpl.editorData?.cardHeight || 429
  return {
    id: tpl.id,
    name: tpl.name,
    data: {
      cardWidth: cw,
      cardHeight: ch,
      orientation: ch > cw ? 'portrait' : 'landscape',
      cardBorderRadius: tpl.editorData?.cardBorderRadius ?? 8,
      backgrounds: tpl.editorData?.backgrounds,
      elements: (tpl.editorData?.elements?.recto || [])
        .map((el, i) => konvaToCardEl(el, cw, ch, i))
        .filter(Boolean),
      versoElements: [],
    },
  }
}

// Fit-inside 4/3 container, centré (même logique que GalleryView commInnerStyle)
function previewInnerStyle(tpl) {
  const cw = tpl.editorData?.cardWidth || 680
  const ch = tpl.editorData?.cardHeight || 429
  const isPortrait = ch > cw
  const innerW = isPortrait ? 300 : 500
  const innerH = innerW * (ch / cw)
  // Largeur de colonne estimée à 280px (xl:grid-cols-4 dans un layout ~1200px)
  const containerW = colW.value
  const containerH = containerW * (3 / 4)
  const scale = Math.min(containerW / innerW, containerH / innerH) * 0.92
  const renderedW = innerW * scale
  const renderedH = innerH * scale
  const offsetX = (containerW - renderedW) / 2
  const offsetY = (containerH - renderedH) / 2
  return {
    position: 'absolute',
    top: `${offsetY}px`,
    left: `${offsetX}px`,
    width: `${innerW}px`,
    transformOrigin: 'top left',
    transform: `scale(${scale})`,
    pointerEvents: 'none',
  }
}

// ── Actions ───────────────────────────────────────────────────────────────
function confirmDeleteTemplate(tpl) {
  templateToDelete.value = tpl
}

function doDeleteTemplate() {
  if (!templateToDelete.value) return
  const name = templateToDelete.value.name || 'Sans titre'
  templatesStore.adminRemoveCommunityTemplate(templateToDelete.value.id)
  templateToDelete.value = null
  showToast(`"${name}" retiré de la galerie`)
}

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
</script>
