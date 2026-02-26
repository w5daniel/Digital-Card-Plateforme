<template>
  <div class="gallery-view py-12 bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Galerie de modèles</h1>
        <p class="text-xl text-gray-600 dark:text-gray-400">
          Choisissez parmi notre collection de {{ allTemplates.length }} modèles professionnels
        </p>
      </div>

      <!-- Search and Controls Bar -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-10">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <!-- Search Input -->
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">Rechercher</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher un modèle..."
                class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all"
              />
              <svg class="w-5 h-5 absolute right-3 top-3.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <!-- Sort Dropdown -->
          <div>
            <label class="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">Trier par</label>
            <select
              v-model="sortBy"
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all font-medium"
            >
              <option value="popular" class="text-gray-900 dark:text-white">Populaires</option>
              <option value="newest" class="text-gray-900 dark:text-white">Plus récents</option>
              <option value="name" class="text-gray-900 dark:text-white">Nom (A-Z)</option>
              <option value="rating" class="text-gray-900 dark:text-white">Mieux notés</option>
            </select>
          </div>

          <!-- View Mode Toggle -->
          <div>
            <label class="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">Affichage</label>
            <div class="flex gap-2">
              <button
                @click="viewMode = 'grid'"
                class="flex-1 px-3 py-3 rounded-lg border-2 transition-all font-medium"
                :class="viewMode === 'grid' ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-slate-800'"
                title="Grille"
              >
                <svg class="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg>
              </button>
              <button
                @click="viewMode = 'list'"
                class="flex-1 px-3 py-3 rounded-lg border-2 transition-all font-medium"
                :class="viewMode === 'list' ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-slate-800'"
                title="Liste"
              >
                <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex justify-center mb-8 overflow-x-auto pb-2">
        <div class="inline-flex bg-white dark:bg-slate-800 rounded-xl shadow-md p-1 gap-1">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            @click="activeFilter = tab.value"
            class="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 text-sm"
            :class="
              activeFilter === tab.value
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:text-primary-600'
            "
          >
            {{ tab.label }}
            <span class="ml-2 text-xs opacity-75">({{ tab.count }})</span>
          </button>
        </div>
      </div>

      <!-- Results Count -->
      <div class="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Affichage de <span class="font-semibold">{{ displayedTemplates.length }}</span> sur <span class="font-semibold">{{ filteredTemplates.length }}</span> modèles
      </div>

      <!-- Templates Grid / List -->
      <div
        :class="{
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8': viewMode === 'grid',
          'space-y-4': viewMode === 'list'
        }"
      >
        <div
          v-for="template in displayedTemplates"
          :key="template.id"
          class="card card-hover cursor-pointer group transition-all duration-300"
          :class="{
            'h-full': viewMode === 'grid',
            'flex items-center p-6 bg-white dark:bg-slate-800': viewMode === 'list'
          }"
          @click="selectTemplate(template)"
        >
          <!-- Template Preview (Grid) -->
          <div v-if="viewMode === 'grid'" class="relative h-48 overflow-hidden rounded-t-lg">
            <img
              :src="template.thumbnail"
              :alt="template.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            <!-- Premium Badge -->
            <div v-if="template.isPremium" class="absolute top-4 right-4">
              <span class="px-3 py-1 bg-accent-400 text-white text-xs font-bold rounded-full flex items-center space-x-1">
                <Crown class="w-3 h-3" />
                <span>Premium</span>
              </span>
            </div>

            <!-- Category Badge -->
            <div class="absolute bottom-4 left-4">
              <span class="px-3 py-1 glass text-white text-xs font-semibold rounded-full">
                {{ template.category }}
              </span>
            </div>

            <!-- Rating -->
            <div class="absolute top-4 left-4">
              <div class="flex items-center space-x-1 bg-white/95 rounded-lg px-2 py-1">
                <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span class="text-xs font-bold">{{ template.rating || '5.0' }}</span>
              </div>
            </div>
          </div>

          <!-- Template Info -->
          <div class="p-6" :class="{ 'flex-1 ml-6': viewMode === 'list' }">
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-xl font-bold">{{ template.name }}</h3>
              <svg v-if="viewMode === 'list'" class="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L12.17 12l-3.58 3.59z"/></svg>
            </div>

            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ template.description || 'Modèle professionnel de haute qualité' }}</p>

            <!-- Color Swatches -->
            <div class="flex items-center space-x-3 mb-4">
              <div
                v-for="color in [template.colors.primary, template.colors.secondary]"
                :key="color"
                class="w-6 h-6 rounded-full border-2 border-white shadow-md"
                :style="{ backgroundColor: color }"
              ></div>
            </div>

            <!-- Stats (Hidden in list view for cleaner look) -->
            <div v-if="viewMode === 'grid'" class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
              <span>👁️ {{ template.views || 0 }} vues</span>
              <span>⭐ {{ template.rating || '5.0' }}/5</span>
            </div>

            <!-- Action Button -->
            <button class="w-full btn-primary text-sm">
              <Eye class="w-4 h-4 inline mr-2" />
              Utiliser ce modèle
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredTemplates.length === 0" class="text-center py-20">
        <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <Layout class="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 class="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
          Aucun modèle trouvé
        </h3>
        <p class="text-gray-500 dark:text-gray-400">Essayez un autre filtre ou recherche</p>
      </div>

      <!-- Load More / Pagination -->
      <div v-if="displayedTemplates.length < filteredTemplates.length" class="flex justify-center mt-12">
        <button
          @click="loadMore"
          class="px-8 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:shadow-lg transition-all duration-200"
        >
          Charger plus de modèles
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCardsStore } from '@/stores/cards'
import { Crown, Eye, Layout } from 'lucide-vue-next'

const router = useRouter()
const store = useCardsStore()

const activeFilter = ref('all')
const searchQuery = ref('')
const sortBy = ref('popular')
const viewMode = ref('grid')
const itemsPerPage = ref(9)
const displayCount = ref(9)

const filterTabs = computed(() => [
  { label: 'Tous les modèles', value: 'all', count: store.getAllTemplates.length },
  { label: 'Gratuits', value: 'free', count: store.getFreeTemplates.length },
  { label: 'Premium', value: 'premium', count: store.getPremiumTemplates.length },
])

const allTemplates = computed(() => store.getAllTemplates)

const filteredTemplates = computed(() => {
  let templates = []

  // Apply filter by free/premium
  if (activeFilter.value === 'free') {
    templates = store.getFreeTemplates
  } else if (activeFilter.value === 'premium') {
    templates = store.getPremiumTemplates
  } else {
    templates = store.getAllTemplates
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    templates = templates.filter(t =>
      t.name.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query))
    )
  }

  // Apply sort
  const sorted = [...templates]
  if (sortBy.value === 'newest') {
    sorted.reverse()
  } else if (sortBy.value === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy.value === 'rating') {
    sorted.sort((a, b) => (b.rating || 5) - (a.rating || 5))
  }
  // 'popular' is default order (as defined in store)

  return sorted
})

const displayedTemplates = computed(() => {
  return filteredTemplates.value.slice(0, displayCount.value)
})

const selectTemplate = (template) => {
  store.currentTemplate = template.slug
  router.push('/editor')
}

const loadMore = () => {
  displayCount.value += itemsPerPage.value
}
</script>

<style scoped>
.card {
  @apply bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-2xl transition-shadow duration-300;
}

.card-hover {
  @apply transform hover:-translate-y-2 transition-transform duration-300;
}

.btn-primary {
  @apply bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 font-semibold;
}

.glass {
  @apply bg-white/20 backdrop-blur-md border border-white/30;
}
</style>
