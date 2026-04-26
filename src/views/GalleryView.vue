<template>
  <div class="min-h-screen bg-powder-50 dark:bg-onyx-900">
    <!-- ══════════════════════════ HERO ══════════════════════════ -->
    <section class="relative">
      <!-- Animated bg -->
      <div class="absolute inset-0 gallery-hero-bg"></div>
      <!-- Glow orbs -->
      <div
        class="absolute top-0 left-1/3 w-96 h-96 bg-onyx-800/20 blur-3xl rounded-full pointer-events-none"
      ></div>
      <div
        class="absolute bottom-0 right-1/4 w-80 h-80 bg-onyx-700/15 blur-3xl rounded-full pointer-events-none"
      ></div>

      <div
        class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col lg:flex-row items-center justify-between gap-12"
      >
        <!-- Left — Text -->
        <div class="flex-1 text-center lg:text-left">
          <span
            class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-flame-400/30 bg-flame-500/10 text-flame-300 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Sparkles class="w-3.5 h-3.5" />
            {{ allTemplates.length }} modèles prêts à l'emploi
          </span>

          <h1 class="text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
            Trouvez votre<br />
            <span class="gradient-text"> style professionnel </span>
          </h1>

          <p class="text-white/60 text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
            Des cartes de visite digitales conçues pour impressionner. Chaque modèle est entièrement
            personnalisable en quelques clics.
          </p>

          <div class="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button
              @click="scrollToGrid"
              class="flex items-center gap-2 bg-flame-500 hover:bg-flame-600 text-white font-bold px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 w-full sm:w-auto justify-center"
            >
              <span>Parcourir les modèles</span>
              <ArrowDown class="w-4 h-4" />
            </button>
            <div class="flex items-center gap-2 text-white/50 text-sm">
              <div class="flex -space-x-0.5">
                <Star v-for="i in 5" :key="i" class="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              </div>
              <span>4.9/5 · +2 400 professionnels</span>
            </div>
          </div>
        </div>

        <!-- Right — Floating cards fan -->
        <div class="hidden lg:block flex-shrink-0 relative" style="width: 620px; height: 360px">
          <div
            v-for="(hCard, i) in heroCards"
            :key="hCard.id"
            class="absolute pointer-events-none"
            :class="`hero-card hero-card-${i}`"
          >
            <div style="width: 500px">
              <BusinessCard :card="hCard" :isFlipped="false" />
            </div>
          </div>
        </div>
      </div>

      <!-- Wave break -->
      <div class="relative z-10" style="height: 60px; margin-top: -1px">
        <svg
          viewBox="0 0 1440 60"
          class="absolute bottom-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z"
            class="fill-powder-50 dark:fill-onyx-900"
          />
        </svg>
      </div>
    </section>

    <!-- ══════════════════════════ TOOLBAR ══════════════════════════ -->
    <div id="gallery-grid" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
      <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
        <!-- Search -->
        <div class="relative flex-1 min-w-0 w-full md:w-auto">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-onyx-400 dark:text-onyx-500" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un modèle..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-powder-200 dark:border-onyx-700 bg-white dark:bg-onyx-800 text-onyx-900 dark:text-powder-100 placeholder:text-onyx-400 dark:placeholder:text-onyx-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
          />
        </div>

        <!-- Category pills -->
        <div
          ref="tabGroupRef"
          class="relative flex bg-powder-100 dark:bg-onyx-800 rounded-xl p-1 gap-1 flex-shrink-0"
        >
          <!-- Sliding pill indicator -->
          <div
            class="absolute top-1 bottom-1 bg-white dark:bg-onyx-700 rounded-lg shadow-sm transition-all duration-300 ease-out pointer-events-none"
            :style="filterPillStyle"
          ></div>
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            @click="activeFilter = tab.value"
            class="relative z-10 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
            :class="
              activeFilter === tab.value
                ? 'text-onyx-900 dark:text-powder-100 filter-tab-active'
                : 'text-onyx-400 dark:text-onyx-500 hover:text-onyx-700 dark:hover:text-powder-300'
            "
          >
            {{ tab.label }}
            <span class="ml-1 text-xs opacity-60">({{ tab.count }})</span>
          </button>
        </div>

        <!-- Sort -->
        <select
          v-model="sortBy"
          class="px-4 py-2.5 rounded-xl border border-powder-200 dark:border-onyx-700 bg-white dark:bg-onyx-800 text-onyx-900 dark:text-powder-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary flex-shrink-0 transition-all"
        >
          <option value="popular">Populaires</option>
          <option value="newest">Plus récents</option>
          <option value="oldest">Plus anciens</option>
          <option value="name">Nom A–Z</option>
          <option value="rating">Mieux notés</option>
        </select>
      </div>

      <!-- Results info -->
      <p class="mt-5 text-sm text-onyx-500 dark:text-powder-400">
        <span class="font-semibold text-onyx-900 dark:text-powder-100">{{
          activeFilter === 'community' ? communityCards.length : filteredTemplates.length
        }}</span>
        {{ activeFilter === 'community' ? 'création' : 'modèle'
        }}{{
          (activeFilter === 'community' ? communityCards.length : filteredTemplates.length) > 1
            ? 's'
            : ''
        }}
        <template v-if="searchQuery">
          pour « <span class="text-flame-500 font-medium">{{ searchQuery }}</span> »
        </template>
        <template v-if="activeFilter === 'community'"> de la communauté </template>
      </p>
    </div>

    <!-- ══════════════════════════ GRID ══════════════════════════ -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <!-- ── Templates grid (Tous / Gratuits / Premium) ── -->
      <div
        v-if="activeFilter !== 'community'"
        ref="cardsGridRef"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <!-- Édition libre — always first -->
        <div
          class="group relative rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col items-center justify-center"
          style="
            aspect-ratio: 16/9;
            border-color: #a78bfa;
            background: linear-gradient(135deg, #f5f3ff, #ede9fe);
          "
          @click="store.canCreateCard ? router.push('/editor') : router.push('/pricing')"
        >
          <div class="flex flex-col items-center gap-3 p-6 text-center">
            <div
              class="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center shadow-sm group-hover:bg-violet-200 transition-colors"
            >
              <PenLine class="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <p class="font-extrabold text-violet-800 text-base leading-tight">Édition libre</p>
              <p class="text-violet-500 text-xs mt-1">Partir d'une toile vierge</p>
            </div>
            <span
              class="flex items-center gap-1.5 bg-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow group-hover:bg-violet-700 transition-colors"
            >
              <ArrowRight class="w-3.5 h-3.5" />
              Commencer
            </span>
          </div>
        </div>

        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="group relative rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          @mouseenter="hoveredId = template.id"
          @mouseleave="hoveredId = null"
          @click="selectTemplate(template)"
        >
          <!-- Live card preview — adaptive aspect ratio, centred with padding, dot-grid backdrop -->
          <div :style="previewContainerStyle(template)">
            <div :style="previewInnerStyle(template)">
              <BusinessCard
                :card="buildPreviewCard(template)"
                :isFlipped="hoveredId === template.id"
              />
            </div>
          </div>

          <!-- Hover overlay — gradient from bottom, shows info + CTA -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5"
          >
            <div
              class="translate-y-3 group-hover:translate-y-0 transition-transform duration-300 delay-50"
            >
              <!-- Color swatches + category -->
              <div class="flex items-center gap-2 mb-2">
                <div
                  v-for="c in [template.colors.primary, template.colors.secondary]"
                  :key="c"
                  class="w-3.5 h-3.5 rounded-full border-2 border-white/30 shadow-sm"
                  :style="{ background: c }"
                ></div>
                <span class="text-white/50 text-xs font-medium ml-1">{{ template.category }}</span>
              </div>

              <h3 class="text-white font-extrabold text-xl mb-1">{{ template.name }}</h3>
              <p class="text-white/60 text-xs mb-4 line-clamp-2 leading-relaxed">
                {{ template.description || 'Modèle professionnel élégant' }}
              </p>

              <div class="flex items-center gap-2">
                <button
                  @click.stop="selectTemplate(template)"
                  class="flex items-center gap-2 bg-flame-500 hover:bg-flame-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors duration-200 shadow-lg"
                >
                  Utiliser ce modèle
                  <ArrowRight class="w-3.5 h-3.5" />
                </button>
                <div
                  class="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg px-2.5 py-2"
                >
                  <Star class="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span class="text-white text-xs font-semibold">{{
                    template.rating || '5.0'
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Badges (always visible) -->
          <div class="absolute top-3 right-3 z-10">
            <span
              v-if="template.isPremium"
              class="flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg"
            >
              <Crown class="w-3 h-3" />
              Premium
            </span>
            <span
              v-else
              class="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg"
            >
              Gratuit
            </span>
          </div>

          <!-- Rating chip (visible when not hovered) -->
          <div
            class="absolute bottom-3 left-3 z-10 group-hover:opacity-0 transition-opacity duration-200"
          >
            <div class="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
              <Star class="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span class="text-white text-xs font-semibold">{{ template.rating || '5.0' }}</span>
            </div>
          </div>

          <!-- Category chip (bottom-right, visible when not hovered) -->
          <div
            class="absolute bottom-3 right-3 z-10 group-hover:opacity-0 transition-opacity duration-200"
          >
            <span
              class="px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white text-xs font-medium rounded-lg"
            >
              {{ template.category }}
            </span>
          </div>
        </div>
      </div>

      <!-- ── Community grid (Communauté) ── -->
      <div
        v-if="activeFilter === 'community'"
        ref="cardsGridRef"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
      >
        <div
          v-for="card in communityCards"
          :key="card.id"
          class="group relative rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.015] hover:ring-2 hover:ring-emerald-400/50"
          @mouseenter="hoveredId = card.id"
          @mouseleave="hoveredId = null"
          @click="selectCommunityTemplate(card)"
        >
          <!-- Preview container — fixed 4/3, card fit-inside centered -->
          <div
            class="relative bg-powder-100 dark:bg-onyx-800"
            style="aspect-ratio: 4/3; overflow: hidden"
          >
            <div :style="commInnerStyle(card)">
              <BusinessCard
                :card="card"
                :isFlipped="hoveredId === card.id && (card.data?.versoElements?.length ?? 0) > 0"
              />
            </div>

            <!-- Permanent bottom gradient overlay -->
            <div
              class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-10 pb-3.5 px-4 pointer-events-none"
            >
              <p class="text-white/55 text-[10px] font-medium mb-0.5 truncate">
                {{
                  card._isOwn
                    ? '✦ Votre création'
                    : `par ${card.ownerId?.split('@')[0] || 'Anonyme'}`
                }}
              </p>
              <p class="text-white font-bold text-sm leading-tight truncate">{{ card.name }}</p>
            </div>

            <!-- Hover CTA (slides up from bottom) -->
            <div
              class="absolute inset-x-0 bottom-0 flex items-end justify-center pb-4 translate-y-full group-hover:translate-y-0 transition-transform duration-250 ease-out pointer-events-none group-hover:pointer-events-auto"
            >
              <button
                @click.stop="selectCommunityTemplate(card)"
                class="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition-colors duration-150"
              >
                Utiliser ce modèle
                <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Top badge -->
            <div class="absolute top-2.5 left-2.5 z-10">
              <span
                v-if="card._isOwn"
                class="flex items-center gap-1 px-2 py-0.5 bg-violet-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full shadow"
              >
                Votre création
              </span>
              <span
                v-else
                class="flex items-center gap-1 px-2 py-0.5 bg-black/40 backdrop-blur-sm text-white/80 text-[10px] font-semibold rounded-full shadow"
              >
                <Users class="w-2.5 h-2.5" />
                Communauté
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state (community) -->
      <div
        v-if="activeFilter === 'community' && communityCards.length === 0"
        class="text-center py-24"
      >
        <div
          class="w-20 h-20 mx-auto mb-6 bg-powder-100 dark:bg-onyx-800 rounded-full flex items-center justify-center"
        >
          <Users class="w-10 h-10 text-onyx-400 dark:text-onyx-500" />
        </div>
        <h3 class="text-xl font-bold text-onyx-900 dark:text-powder-100 mb-2">
          Aucune création communautaire
        </h3>
        <p class="text-onyx-500 dark:text-powder-400 text-sm mb-6">
          Soyez le premier à partager vos créations ! Activez l'option « Public » lors de la
          sauvegarde dans l'éditeur.
        </p>
      </div>

      <!-- Empty state (templates) -->
      <div
        v-if="activeFilter !== 'community' && filteredTemplates.length === 0"
        class="text-center py-24"
      >
        <div
          class="w-20 h-20 mx-auto mb-6 bg-powder-100 dark:bg-onyx-800 rounded-full flex items-center justify-center"
        >
          <Layout class="w-10 h-10 text-onyx-400 dark:text-onyx-500" />
        </div>
        <h3 class="text-xl font-bold text-onyx-900 dark:text-powder-100 mb-2">
          Aucun modèle trouvé
        </h3>
        <p class="text-onyx-500 dark:text-powder-400 text-sm mb-6">
          Essayez un autre terme ou réinitialisez les filtres
        </p>
        <button
          @click="searchQuery = ''; activeFilter = 'all'"
          class="px-5 py-2.5 bg-flame-500 text-white rounded-xl text-sm font-semibold hover:bg-flame-600 transition-colors"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCardsStore } from '@/stores/cards'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useUserTemplatesStore } from '@/stores/userTemplatesStore'
import { konvaToCardEl } from '@/utils/cardElements'
import BusinessCard from '@/components/BusinessCard.vue'
import {
  Search,
  Crown,
  Star,
  Layout,
  ArrowDown,
  ArrowRight,
  Sparkles,
  PenLine,
  Users,
} from 'lucide-vue-next'
import { LAYOUT_MAP, buildElements } from '@/utils/templateLayouts'

const router = useRouter()
const route = useRoute()
const store = useCardsStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const templatesStore = useUserTemplatesStore()

// ── UI state ──────────────────────────────────────────────────────────
const VALID_TABS = ['all', 'free', 'premium', 'community']
const activeFilter = ref(VALID_TABS.includes(route.query.tab) ? route.query.tab : 'all')
const tabGroupRef = ref(null)
const filterPillStyle = ref({ left: '0px', width: '0px', opacity: 0 })

function updateFilterPill() {
  if (!tabGroupRef.value) return
  const active = tabGroupRef.value.querySelector('.filter-tab-active')
  if (!active) { filterPillStyle.value = { ...filterPillStyle.value, opacity: 0 }; return }
  const cRect = tabGroupRef.value.getBoundingClientRect()
  const aRect = active.getBoundingClientRect()
  filterPillStyle.value = { left: `${aRect.left - cRect.left}px`, width: `${aRect.width}px`, opacity: 1 }
}

watch(activeFilter, () => nextTick(updateFilterPill))
const searchQuery = ref('')
const sortBy = ref('popular')
const hoveredId = ref(null)
const cardsGridRef = ref(null)
const cardScale = ref(0.72) // kept for potential future use — not directly referenced in template
const communityRefreshKey = ref(0) // incremented on mount to force communityCards recompute

// ── Sample persons for live previews ──────────────────────────────────
const samplePersons = [
  {
    fullName: 'Sophie Martin',
    title: 'Directrice Marketing',
    company: 'InnovateLab',
    email: 'sophie@innovatelab.fr',
    phone: '+33 6 12 34 56 78',
    website: 'innovatelab.fr',
  },
  {
    fullName: 'Marc Dubois',
    title: 'CEO & Fondateur',
    company: 'TechVision',
    email: 'marc@techvision.io',
    phone: '+33 7 98 76 54 32',
    website: 'techvision.io',
  },
  {
    fullName: 'Léa Rousseau',
    title: 'Designer UX/UI',
    company: 'Creative Studio',
    email: 'lea@creativestudio.fr',
    phone: '+33 6 45 67 89 01',
    website: 'creativestudio.fr',
  },
  {
    fullName: 'Nicolas Petit',
    title: 'Architecte Solutions',
    company: 'DataBridge',
    email: 'nicolas@databridge.fr',
    phone: '+33 7 23 45 67 89',
    website: 'databridge.fr',
  },
  {
    fullName: 'Emma Bernard',
    title: 'Consultant Senior',
    company: 'Stratégie & Co',
    email: 'emma@strategie-co.fr',
    phone: '+33 6 87 65 43 21',
    website: 'strategie.co.fr',
  },
  {
    fullName: 'Lucas Moreau',
    title: 'Ingénieur DevOps',
    company: 'CloudPro',
    email: 'lucas@cloudpro.fr',
    phone: '+33 7 11 22 33 44',
    website: 'cloudpro.fr',
  },
]

const buildPreviewCard = (template, idx = null) => {
  // Admin custom templates with saved preview elements → use them directly
  if (template.previewElements) {
    return {
      id: `preview-${template.slug}`,
      template: template.slug,
      data: {
        elements: template.previewElements,
        versoElements: template.previewVersoElements || [],
        backgrounds: template.previewBackgrounds || { recto: template.colors?.primary, verso: template.colors?.secondary },
        cardWidth: template.previewCardWidth || 680,
        cardHeight: template.previewCardHeight || 429,
        cardBorderRadius: template.previewCardBorderRadius ?? 8,
        orientation: template.previewOrientation || 'landscape',
        fontFamily: template.previewFontFamily || undefined,
        showQR: false,
      },
    }
  }
  // Layout-based templates → generate from layout + colors
  const i = idx !== null ? idx : store.getAllTemplates.findIndex((t) => t.id === template.id)
  const person = samplePersons[i % samplePersons.length]
  const layout = LAYOUT_MAP[template.slug] || 'center'
  return {
    id: `preview-${template.slug}`,
    template: template.slug,
    data: { elements: buildElements(layout, person, template.colors), showQR: false },
  }
}

// ── Template preview styles — adaptive container + centred card ──────
const PREVIEW_PAD = 0.08 // 8% padding on all 4 sides

// Container: ratio fixe 16/9 pour uniformité de la grille (portrait et paysage alignés)
const previewContainerStyle = (_template) => {
  const dark = themeStore.darkMode
  return {
    aspectRatio: '16 / 9',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: dark ? '#0d1520' : '#f0f4f8',
    backgroundImage: dark
      ? 'radial-gradient(circle, #1a2640 1.5px, transparent 1.5px)'
      : 'radial-gradient(circle, #c6cfd9 1px, transparent 1px)',
    backgroundSize: '18px 18px',
  }
}

// Inner wrapper: fit-inside 16/9 container, centré — gère portrait et paysage
const previewInnerStyle = (template) => {
  const cw = template.previewCardWidth || 680
  const ch = template.previewCardHeight || 429
  const isPortrait = ch > cw
  const naturalW = isPortrait ? 300 : 500 // BusinessCard maxWidth
  const naturalH = naturalW * (ch / cw)

  const col = cardColW.value
  const containerH = col * (9 / 16)

  const P = PREVIEW_PAD
  const scale = Math.min((col * (1 - 2 * P)) / naturalW, (containerH * (1 - 2 * P)) / naturalH)

  const renderedW = naturalW * scale
  const renderedH = naturalH * scale
  const offsetX = (col - renderedW) / 2
  const offsetY = (containerH - renderedH) / 2

  return {
    position: 'absolute',
    top: `${offsetY}px`,
    left: `${offsetX}px`,
    width: `${naturalW}px`,
    transformOrigin: 'top left',
    transform: `scale(${scale})`,
    pointerEvents: 'none',
  }
}

// ── Hero cards (first 3 templates) ────────────────────────────────────
const heroCards = computed(() =>
  store.getAllTemplates.slice(0, 3).map((t, i) => buildPreviewCard(t, i)),
)

// ── Computed filters ───────────────────────────────────────────────────
const allTemplates = computed(() => store.getAllTemplates)

const filterTabs = computed(() => [
  { label: 'Tous', value: 'all', count: store.getAllTemplates.length },
  { label: 'Gratuits', value: 'free', count: store.getFreeTemplates.length },
  { label: 'Premium', value: 'premium', count: store.getPremiumTemplates.length },
  { label: 'Communauté', value: 'community', count: communityCards.value.length },
])

// ── Community cards (public cards from other users) ──────────────────

const communityCards = computed(() => {
  void communityRefreshKey.value // dépendance réactive — force recalcul au montage
  // Modèles publiés en public par les utilisateurs (les cartes sont toujours privées)
  const communityTemplates = templatesStore.getAllCommunityTemplates()
  let cards = communityTemplates.map((tpl) => {
    const cw = tpl.editorData?.cardWidth || 680
    const ch = tpl.editorData?.cardHeight || 429
    return {
      id: `tpl_${tpl.id}`,
      name: tpl.name,
      ownerName: tpl.ownerName || 'Anonyme',
      ownerId: tpl.ownerEmail || '',
      _isOwn: tpl.ownerEmail === authStore.user?.email,
      createdAt: tpl.createdAt || null,
      isTemplate: true,
      data: {
        cardWidth: cw,
        cardHeight: ch,
        orientation: ch > cw ? 'portrait' : 'landscape',
        cardBorderRadius: tpl.editorData?.cardBorderRadius ?? 8,
        backgrounds: tpl.editorData?.backgrounds,
        elements: (tpl.editorData?.elements?.recto || [])
          .map((el, i) => konvaToCardEl(el, cw, ch, i))
          .filter(Boolean),
        versoElements: (tpl.editorData?.elements?.verso || [])
          .map((el, i) => konvaToCardEl(el, cw, ch, i))
          .filter(Boolean),
        editorData: tpl.editorData,
      },
    }
  })

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    cards = cards.filter((c) => c.name?.toLowerCase().includes(q))
  }

  if (sortBy.value === 'newest') {
    cards = [...cards].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  } else if (sortBy.value === 'oldest') {
    cards = [...cards].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
  } else if (sortBy.value === 'name') {
    cards = [...cards].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }

  return cards
})


const selectCommunityTemplate = (card) => {
  router.push({ path: '/editor', query: { community: String(card.id) } })
}

const filteredTemplates = computed(() => {
  let list =
    activeFilter.value === 'free'
      ? store.getFreeTemplates
      : activeFilter.value === 'premium'
        ? store.getPremiumTemplates
        : store.getAllTemplates

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)),
    )
  }

  const sorted = [...list]
  if (sortBy.value === 'newest') {
    sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    if (!sorted.some((t) => t.createdAt)) sorted.reverse()
  } else if (sortBy.value === 'oldest') {
    sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
  } else if (sortBy.value === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy.value === 'rating') {
    sorted.sort((a, b) => (b.rating || 5) - (a.rating || 5))
  }
  return sorted
})

// ── Responsive card scale via ResizeObserver ───────────────────────────
let ro = null

const cardColW = ref(325) // actual column width in px (for fit-inside calc)

const computeScale = () => {
  if (!cardsGridRef.value) return
  const gridW = cardsGridRef.value.clientWidth
  const cols = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1
  const colW = (gridW - (cols - 1) * 24) / cols // gap-6 = 24px
  cardColW.value = colW
  cardScale.value = Math.min(1, colW / 500)
}

// Community card inner style — fit-inside 4/3 container, centered
const commInnerStyle = (card) => {
  const cw = card.data?.cardWidth || 680
  const ch = card.data?.cardHeight || 429
  const isPortrait = ch > cw
  const innerW = isPortrait ? 300 : 500 // BusinessCard maxWidth
  const innerH = innerW * (ch / cw) // BusinessCard natural height

  const containerW = cardColW.value
  const containerH = containerW * (3 / 4) // 4/3 container

  // Scale to fit inside container with 8% padding (looks more polished)
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

onMounted(() => {
  communityRefreshKey.value++
  computeScale()
  ro = new ResizeObserver(computeScale)
  if (cardsGridRef.value) ro.observe(cardsGridRef.value)
  nextTick(updateFilterPill)
})

onBeforeUnmount(() => ro?.disconnect())

// Re-observe cardsGridRef when DOM element changes (template ↔ community tab switch)
watch(cardsGridRef, (newEl, oldEl) => {
  if (oldEl) ro?.unobserve(oldEl)
  if (newEl) {
    ro?.observe(newEl)
    computeScale()
  }
})

// ── Actions ────────────────────────────────────────────────────────────
const selectTemplate = (template) => {
  if (template.isPremium && !authStore.isPremium && !authStore.isAdmin) {
    router.push('/pricing')
    return
  }
  router.push({ path: '/editor', query: { template: template.slug } })
}

const scrollToGrid = () => {
  document.getElementById('gallery-grid')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
/* ── Hero animated background ─────────────────────────────────────── */
@keyframes heroBg {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
.gallery-hero-bg {
  background: linear-gradient(270deg, #397256, #1c2a24, #18363d, #0f1a16, #397256);
  background-size: 400% 400%;
  animation: heroBg 20s ease infinite;
}

/* ── Hero floating card animations ────────────────────────────────── */
@keyframes hFloat0 {
  0%,
  100% {
    transform: rotate(-12deg) scale(0.44) translateY(0px);
  }
  50% {
    transform: rotate(-12deg) scale(0.44) translateY(-10px);
  }
}
@keyframes hFloat1 {
  0%,
  100% {
    transform: scale(0.52) translateY(-10px);
  }
  50% {
    transform: scale(0.52) translateY(-22px);
  }
}
@keyframes hFloat2 {
  0%,
  100% {
    transform: rotate(12deg) scale(0.44) translateY(4px);
  }
  50% {
    transform: rotate(12deg) scale(0.44) translateY(-6px);
  }
}

.hero-card {
  position: absolute;
}

.hero-card-0 {
  top: 80px;
  left: 10px;
  z-index: 1;
  opacity: 0.7;
  animation: hFloat0 5.5s ease-in-out infinite;
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.55));
}
.hero-card-1 {
  top: 20px;
  left: 145px;
  z-index: 3;
  animation: hFloat1 4.5s ease-in-out infinite 0.6s;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.65));
}
.hero-card-2 {
  top: 80px;
  left: 285px;
  z-index: 1;
  opacity: 0.7;
  animation: hFloat2 6s ease-in-out infinite 1.2s;
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.55));
}
</style>
