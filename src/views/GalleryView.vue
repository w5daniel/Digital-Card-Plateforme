<template>
  <div class="gallery-view py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="section-title">Galerie de modèles</h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 mt-4">
          Choisissez parmi notre collection de modèles professionnels
        </p>
      </div>

      <!-- Filter Tabs -->
      <div class="flex justify-center mb-12">
        <div class="inline-flex bg-white dark:bg-slate-800 rounded-xl shadow-md p-1">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            @click="activeFilter = tab.value"
            class="px-6 py-3 rounded-lg font-medium transition-all duration-200"
            :class="
              activeFilter === tab.value
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:text-primary-600'
            "
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Templates Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="card card-hover cursor-pointer group"
          @click="selectTemplate(template)"
        >
          <!-- Template Preview -->
          <div class="relative h-48 overflow-hidden">
            <img
              :src="template.thumbnail"
              :alt="template.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            <!-- Premium Badge -->
            <div v-if="template.isPremium" class="absolute top-4 right-4">
              <span
                class="px-3 py-1 bg-accent-400 text-white text-xs font-bold rounded-full flex items-center space-x-1"
              >
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
          </div>

          <!-- Template Info -->
          <div class="p-6">
            <h3 class="text-xl font-bold mb-2">{{ template.name }}</h3>
            <div class="flex items-center space-x-2 mb-4">
              <div
                v-for="color in [template.colors.primary, template.colors.secondary]"
                :key="color"
                class="w-6 h-6 rounded-full border-2 border-white shadow-md"
                :style="{ backgroundColor: color }"
              ></div>
            </div>

            <button class="w-full btn-primary text-sm">
              <Eye class="w-4 h-4 inline mr-2" />
              Utiliser ce modèle
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredTemplates.length === 0" class="text-center py-20">
        <div
          class="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center"
        >
          <Layout class="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 class="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
          Aucun modèle trouvé
        </h3>
        <p class="text-gray-500 dark:text-gray-400">Essayez un autre filtre</p>
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

const filterTabs = [
  { label: 'Tous les modèles', value: 'all' },
  { label: 'Gratuits', value: 'free' },
  { label: 'Premium', value: 'premium' },
]

const filteredTemplates = computed(() => {
  if (activeFilter.value === 'free') {
    return store.getFreeTemplates
  } else if (activeFilter.value === 'premium') {
    return store.getPremiumTemplates
  }
  return store.getAllTemplates
})

const selectTemplate = (template) => {
  // Stocke le template sélectionné dans le store
  store.currentTemplate = template.slug
  // Redirige vers l'éditeur
  router.push('/editor')
}
</script>
