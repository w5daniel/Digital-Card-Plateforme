<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12"
  >
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Card Found -->
      <div v-if="card" class="space-y-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold mb-2">{{ card.name }}</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Carte partagée par {{ card.data.fullName }}
          </p>
        </div>

        <!-- Main Card Display -->
        <div class="card p-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Card Preview (larger) -->
            <div class="lg:col-span-1 lg:row-span-2 flex items-center justify-center">
              <BusinessCard :card="card" :showQR="true" />
            </div>

            <!-- Card Info -->
            <div class="lg:col-span-2 space-y-6">
              <div>
                <h2 class="text-3xl font-bold mb-1">{{ card.data.fullName }}</h2>
                <p class="text-lg text-primary-600 dark:text-primary-400 font-semibold">
                  {{ card.data.title }}
                </p>
                <p v-if="card.data.company" class="text-gray-600 dark:text-gray-400">
                  {{ card.data.company }}
                </p>
              </div>

              <!-- Contact Details -->
              <div class="space-y-3 bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                <div v-if="card.data.email" class="flex items-center space-x-3">
                  <Mail class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <a
                    :href="`mailto:${card.data.email}`"
                    class="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {{ card.data.email }}
                  </a>
                </div>
                <div v-if="card.data.phone" class="flex items-center space-x-3">
                  <Phone class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <a
                    :href="`tel:${card.data.phone}`"
                    class="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {{ card.data.phone }}
                  </a>
                </div>
                <div v-if="card.data.website" class="flex items-center space-x-3">
                  <Globe class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <a
                    :href="card.data.website"
                    target="_blank"
                    class="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {{ card.data.website }}
                  </a>
                </div>
                <div v-if="card.data.address" class="flex items-start space-x-3">
                  <MapPin class="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1" />
                  <p>{{ card.data.address }}</p>
                </div>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-2 gap-4">
                <div class="stat-box">
                  <Eye class="w-5 h-5 text-secondary-600 dark:text-secondary-400 mb-2" />
                  <p class="text-2xl font-bold">{{ card.views }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Vues</p>
                </div>
                <div class="stat-box">
                  <Download class="w-5 h-5 text-accent-600 dark:text-accent-400 mb-2" />
                  <p class="text-2xl font-bold">{{ card.downloads }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">vCards téléchargées</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-4 justify-center">
          <button
            @click="downloadVCard"
            class="px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download class="w-5 h-5" />
            <span>Ajouter à mes contacts</span>
          </button>
          <router-link
            to="/"
            class="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
          >
            <Home class="w-5 h-5" />
            <span>Retour à l'accueil</span>
          </router-link>
        </div>

        <!-- Share Info -->
        <div
          class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center"
        >
          <p class="text-sm text-blue-800 dark:text-blue-300">
            💡 Vous pouvez scanner le code QR ci-dessus pour ajouter rapidement ce contact à votre
            téléphone
          </p>
        </div>
      </div>

      <!-- Card Not Found -->
      <div v-else class="text-center py-20">
        <div
          class="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center"
        >
          <AlertCircle class="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </div>
        <h2 class="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Carte non trouvée</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          Cette carte n'existe pas ou a été supprimée
        </p>
        <router-link to="/" class="btn-primary inline-flex items-center">
          <Home class="w-5 h-5 mr-2" />
          Retour à l'accueil
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCardsStore } from '@/stores/cards'
import BusinessCard from '@/components/BusinessCard.vue'
import { Mail, Phone, Globe, MapPin, Eye, Download, Home, AlertCircle } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useCardsStore()

const card = ref(null)

onMounted(() => {
  const cardId = Number(route.params.cardId)
  const foundCard = store.getCardById(cardId)

  if (foundCard) {
    card.value = foundCard
    // Incrémenter les vues
    store.incrementCardViews(cardId)
  }
})

const downloadVCard = () => {
  if (!card.value) return

  const vCardContent = `BEGIN:VCARD
VERSION:3.0
FN:${card.value.data.fullName}
TITLE:${card.value.data.title}
ORG:${card.value.data.company}
EMAIL:${card.value.data.email}
TEL:${card.value.data.phone}
URL:${card.value.data.website}
ADR:;;${card.value.data.address};;;;
PHOTO;VALUE=URI:${card.value.data.photo}
END:VCARD`

  const blob = new Blob([vCardContent], { type: 'text/vcard' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${card.value.data.fullName || 'contact'}.vcf`
  link.click()
  window.URL.revokeObjectURL(url)

  // Incrémenter les téléchargements
  store.incrementCardDownloads(route.params.cardId)
}
</script>

<style scoped>
.stat-box {
  @apply bg-gray-50 dark:bg-slate-700 p-4 rounded-lg text-center;
}
</style>
