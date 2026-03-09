<template>
  <div class="min-h-screen bg-powder-50 dark:bg-onyx-950">

    <!-- ══════════════════════════ HERO ══════════════════════════ -->
    <section class="relative">
      <!-- Animated bg -->
      <div class="absolute inset-0 gallery-hero-bg"></div>
      <!-- Glow orbs -->
      <div class="absolute top-0 left-1/3 w-96 h-96 bg-onyx-800/20 blur-3xl rounded-full pointer-events-none"></div>
      <div class="absolute bottom-0 right-1/4 w-80 h-80 bg-onyx-700/15 blur-3xl rounded-full pointer-events-none"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col lg:flex-row items-center justify-between gap-12">

        <!-- Left — Text -->
        <div class="flex-1 text-center lg:text-left">
          <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-flame-400/30 bg-flame-500/10 text-flame-300 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles class="w-3.5 h-3.5" />
            {{ allTemplates.length }} modèles prêts à l'emploi
          </span>

          <h1 class="text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
            Trouvez votre<br />
            <span class="gradient-text">
              style professionnel
            </span>
          </h1>

          <p class="text-white/60 text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
            Des cartes de visite digitales conçues pour impressionner. Chaque modèle est entièrement personnalisable en quelques clics.
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
        <div class="hidden lg:block flex-shrink-0 relative" style="width: 520px; height: 260px;">
          <div
            v-for="(hCard, i) in heroCards"
            :key="hCard.id"
            class="absolute pointer-events-none"
            :class="`hero-card hero-card-${i}`"
          >
            <div style="width: 500px;">
              <BusinessCard :card="hCard" :isFlipped="false" :showQR="false" />
            </div>
          </div>
        </div>
      </div>

      <!-- Wave break -->
      <div class="relative z-10" style="height: 60px; margin-top: -1px;">
        <svg viewBox="0 0 1440 60" class="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path
            d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z"
            class="fill-powder-50 dark:fill-onyx-950"
          />
        </svg>
      </div>
    </section>

    <!-- ══════════════════════════ TOOLBAR ══════════════════════════ -->
    <div id="gallery-grid" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
      <div class="flex flex-col md:flex-row items-start md:items-center gap-4">

        <!-- Search -->
        <div class="relative flex-1 min-w-0 w-full md:w-auto">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-onyx-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un modèle..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-powder-200 dark:border-onyx-700 bg-powder-50 dark:bg-onyx-900 text-onyx-900 dark:text-white placeholder-onyx-400 dark:placeholder-onyx-500 focus:outline-none focus:ring-2 focus:ring-flame-500 text-sm transition-all"
          />
        </div>

        <!-- Category pills -->
        <div class="flex bg-powder-100 dark:bg-onyx-800 rounded-xl p-1 gap-1 flex-shrink-0">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            @click="activeFilter = tab.value"
            class="px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap"
            :class="
              activeFilter === tab.value
                ? 'bg-white dark:bg-onyx-700 text-onyx-900 dark:text-white shadow-sm'
                : 'text-onyx-500 dark:text-powder-400 hover:text-onyx-700 dark:hover:text-powder-200'
            "
          >
            {{ tab.label }}
            <span class="ml-1 text-xs opacity-60">({{ tab.count }})</span>
          </button>
        </div>

        <!-- Sort -->
        <select
          v-model="sortBy"
          class="px-4 py-2.5 rounded-xl border border-powder-200 dark:border-onyx-700 bg-powder-50 dark:bg-onyx-900 text-onyx-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-flame-500 flex-shrink-0 transition-all"
        >
          <option value="popular">Populaires</option>
          <option value="newest">Plus récents</option>
          <option value="name">Nom A–Z</option>
          <option value="rating">Mieux notés</option>
        </select>
      </div>

      <!-- Results info -->
      <p class="mt-5 text-sm text-onyx-500 dark:text-onyx-400">
        <span class="font-semibold text-onyx-900 dark:text-white">{{ filteredTemplates.length }}</span>
        modèle{{ filteredTemplates.length > 1 ? 's' : '' }}
        <template v-if="searchQuery">
          pour « <span class="text-flame-500 font-medium">{{ searchQuery }}</span> »
        </template>
      </p>
    </div>

    <!-- ══════════════════════════ GRID ══════════════════════════ -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

      <div
        ref="cardsGridRef"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="group relative rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          @mouseenter="hoveredId = template.id"
          @mouseleave="hoveredId = null"
          @click="selectTemplate(template)"
        >
          <!-- Live card preview (scaled) -->
          <div class="relative bg-powder-100 dark:bg-onyx-800" style="aspect-ratio: 16/9; overflow: hidden;">
            <div
              :style="{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '500px',
                transformOrigin: 'top left',
                transform: `scale(${cardScale})`,
                pointerEvents: 'none',
              }"
            >
              <BusinessCard
                :card="buildPreviewCard(template)"
                :isFlipped="hoveredId === template.id"
                :showQR="false"
              />
            </div>
          </div>

          <!-- Hover overlay — gradient from bottom, shows info + CTA -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5"
          >
            <div class="translate-y-3 group-hover:translate-y-0 transition-transform duration-300 delay-50">
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
              <p class="text-white/60 text-xs mb-4 line-clamp-2 leading-relaxed">{{ template.description || 'Modèle professionnel élégant' }}</p>

              <div class="flex items-center gap-2">
                <button
                  @click.stop="selectTemplate(template)"
                  class="flex items-center gap-2 bg-flame-500 hover:bg-flame-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors duration-200 shadow-lg"
                >
                  Utiliser ce modèle
                  <ArrowRight class="w-3.5 h-3.5" />
                </button>
                <div class="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg px-2.5 py-2">
                  <Star class="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span class="text-white text-xs font-semibold">{{ template.rating || '5.0' }}</span>
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
          <div class="absolute bottom-3 left-3 z-10 group-hover:opacity-0 transition-opacity duration-200">
            <div class="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
              <Star class="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span class="text-white text-xs font-semibold">{{ template.rating || '5.0' }}</span>
            </div>
          </div>

          <!-- Category chip (bottom-right, visible when not hovered) -->
          <div class="absolute bottom-3 right-3 z-10 group-hover:opacity-0 transition-opacity duration-200">
            <span class="px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white text-xs font-medium rounded-lg">
              {{ template.category }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredTemplates.length === 0" class="text-center py-24">
        <div class="w-20 h-20 mx-auto mb-6 bg-powder-100 dark:bg-onyx-800 rounded-full flex items-center justify-center">
          <Layout class="w-10 h-10 text-onyx-400" />
        </div>
        <h3 class="text-xl font-bold text-onyx-700 dark:text-powder-300 mb-2">Aucun modèle trouvé</h3>
        <p class="text-onyx-500 dark:text-onyx-400 text-sm mb-6">Essayez un autre terme ou réinitialisez les filtres</p>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCardsStore } from '@/stores/cards'
import BusinessCard from '@/components/BusinessCard.vue'
import { Search, Crown, Star, Layout, ArrowDown, ArrowRight, Sparkles } from 'lucide-vue-next'

const router = useRouter()
const store  = useCardsStore()

// ── UI state ──────────────────────────────────────────────────────────
const activeFilter  = ref('all')
const searchQuery   = ref('')
const sortBy        = ref('popular')
const hoveredId     = ref(null)
const cardsGridRef  = ref(null)
const cardScale     = ref(0.72) // fallback until ResizeObserver kicks in

// ── Sample persons for live previews ──────────────────────────────────
const samplePersons = [
  { fullName: 'Sophie Martin',  title: 'Directrice Marketing', company: 'InnovateLab',    email: 'sophie@innovatelab.fr',  phone: '+33 6 12 34 56 78', website: 'innovatelab.fr'  },
  { fullName: 'Marc Dubois',    title: 'CEO & Fondateur',       company: 'TechVision',     email: 'marc@techvision.io',     phone: '+33 7 98 76 54 32', website: 'techvision.io'   },
  { fullName: 'Léa Rousseau',   title: 'Designer UX/UI',        company: 'Creative Studio',email: 'lea@creativestudio.fr', phone: '+33 6 45 67 89 01', website: 'creativestudio.fr'},
  { fullName: 'Nicolas Petit',  title: 'Architecte Solutions',  company: 'DataBridge',     email: 'nicolas@databridge.fr', phone: '+33 7 23 45 67 89', website: 'databridge.fr'   },
  { fullName: 'Emma Bernard',   title: 'Consultant Senior',     company: 'Stratégie & Co', email: 'emma@strategie-co.fr',  phone: '+33 6 87 65 43 21', website: 'strategie.co.fr' },
  { fullName: 'Lucas Moreau',   title: 'Ingénieur DevOps',      company: 'CloudPro',       email: 'lucas@cloudpro.fr',     phone: '+33 7 11 22 33 44', website: 'cloudpro.fr'     },
]

const buildPreviewCard = (template, idx = null) => {
  const i = idx !== null ? idx : store.getAllTemplates.findIndex(t => t.id === template.id)
  const person = samplePersons[i % samplePersons.length]
  return {
    id:       `preview-${template.slug}`,
    template:  template.slug,
    data:     { ...person, showQR: false },
    backSide: { enabled: false },
  }
}

// ── Hero cards (first 3 templates) ────────────────────────────────────
const heroCards = computed(() =>
  store.getAllTemplates.slice(0, 3).map((t, i) => buildPreviewCard(t, i))
)

// ── Computed filters ───────────────────────────────────────────────────
const allTemplates = computed(() => store.getAllTemplates)

const filterTabs = computed(() => [
  { label: 'Tous',     value: 'all',     count: store.getAllTemplates.length    },
  { label: 'Gratuits', value: 'free',    count: store.getFreeTemplates.length   },
  { label: 'Premium',  value: 'premium', count: store.getPremiumTemplates.length },
])

const filteredTemplates = computed(() => {
  let list =
    activeFilter.value === 'free'    ? store.getFreeTemplates    :
    activeFilter.value === 'premium' ? store.getPremiumTemplates :
                                       store.getAllTemplates

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(t =>
      t.name.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    )
  }

  const sorted = [...list]
  if      (sortBy.value === 'newest') sorted.reverse()
  else if (sortBy.value === 'name')   sorted.sort((a, b) => a.name.localeCompare(b.name))
  else if (sortBy.value === 'rating') sorted.sort((a, b) => (b.rating || 5) - (a.rating || 5))
  return sorted
})

// ── Responsive card scale via ResizeObserver ───────────────────────────
let ro = null

const computeScale = () => {
  if (!cardsGridRef.value) return
  const gridW = cardsGridRef.value.clientWidth
  const cols  = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1
  const colW  = (gridW - (cols - 1) * 24) / cols      // gap-6 = 24px
  cardScale.value = Math.min(1, colW / 500)
}

onMounted(() => {
  computeScale()
  ro = new ResizeObserver(computeScale)
  if (cardsGridRef.value) ro.observe(cardsGridRef.value)
})

onBeforeUnmount(() => ro?.disconnect())

// ── Actions ────────────────────────────────────────────────────────────
const selectTemplate = (template) => {
  store.currentTemplate = template.slug
  router.push('/editor')
}

const scrollToGrid = () => {
  document.getElementById('gallery-grid')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
/* ── Hero animated background ─────────────────────────────────────── */
@keyframes heroBg {
  0%, 100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}
.gallery-hero-bg {
  background: linear-gradient(
    270deg, #0a100d, #1c2a24, #141f1b, #0f1a16, #0a100d
  );
  background-size: 400% 400%;
  animation: heroBg 20s ease infinite;
}

/* ── Hero floating card animations ────────────────────────────────── */
@keyframes hFloat0 {
  0%, 100% { transform: rotate(-12deg) scale(0.44) translateY(0px);   }
  50%       { transform: rotate(-12deg) scale(0.44) translateY(-10px); }
}
@keyframes hFloat1 {
  0%, 100% { transform: scale(0.52) translateY(-10px); }
  50%       { transform: scale(0.52) translateY(-22px); }
}
@keyframes hFloat2 {
  0%, 100% { transform: rotate(12deg) scale(0.44) translateY(4px);   }
  50%       { transform: rotate(12deg) scale(0.44) translateY(-6px);  }
}

.hero-card { position: absolute; }

.hero-card-0 {
  top: 80px; left: 10px;
  z-index: 1; opacity: 0.70;
  animation: hFloat0 5.5s ease-in-out infinite;
  filter: drop-shadow(0 12px 24px rgba(0,0,0,0.55));
}
.hero-card-1 {
  top: 20px; left: 145px;
  z-index: 3;
  animation: hFloat1 4.5s ease-in-out infinite 0.6s;
  filter: drop-shadow(0 20px 40px rgba(0,0,0,0.65));
}
.hero-card-2 {
  top: 80px; left: 285px;
  z-index: 1; opacity: 0.70;
  animation: hFloat2 6s ease-in-out infinite 1.2s;
  filter: drop-shadow(0 12px 24px rgba(0,0,0,0.55));
}
</style>
