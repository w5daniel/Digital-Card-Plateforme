<template>
  <div class="dashboard-view py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-bold mb-2">Mon Dashboard</h1>
        <p class="text-gray-600 dark:text-gray-400">
          Gérez toutes vos cartes de visite en un seul endroit
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center"
            >
              <CreditCard class="w-6 h-6 text-primary-600 dark:text-primary-300" />
            </div>
            <span class="text-sm text-gray-500 dark:text-gray-400">Total</span>
          </div>
          <div class="text-3xl font-bold gradient-text">{{ store.getUserCardsCount }}</div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Cartes créées</p>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-xl flex items-center justify-center"
            >
              <Eye class="w-6 h-6 text-secondary-600 dark:text-secondary-300" />
            </div>
            <span class="text-sm text-gray-500 dark:text-gray-400">Ce mois</span>
          </div>
          <div class="text-3xl font-bold text-secondary-600 dark:text-secondary-400">248</div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Vues totales</p>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-xl flex items-center justify-center"
            >
              <Download class="w-6 h-6 text-accent-600 dark:text-accent-300" />
            </div>
            <span class="text-sm text-gray-500 dark:text-gray-400">Ce mois</span>
          </div>
          <div class="text-3xl font-bold text-accent-600 dark:text-accent-400">42</div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Téléchargements</p>
        </div>
      </div>

      <!-- Actions Bar -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 class="text-2xl font-bold">Mes cartes de visite</h2>
        <router-link to="/editor" class="btn-primary">
          <Plus class="w-5 h-5 inline mr-2" />
          Créer une nouvelle carte
        </router-link>
      </div>

      <!-- Cards List -->
      <div v-if="store.userCards.length > 0" class="space-y-6">
        <div
          v-for="card in store.userCards"
          :key="card.id"
          class="card p-6 hover:shadow-2xl transition-all duration-300"
        >
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Card Preview -->
            <div class="lg:col-span-1">
              <BusinessCard :card="card" :showQR="false" />
            </div>

            <!-- Card Info -->
            <div class="lg:col-span-2 flex flex-col justify-between">
              <div>
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3 class="text-2xl font-bold mb-1">{{ card.name }}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Créée le {{ formatDate(card.createdAt) }}
                    </p>
                  </div>
                  <span
                    class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full"
                  >
                    Active
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Nom complet</p>
                    <p class="font-semibold">{{ card.data.fullName }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Entreprise</p>
                    <p class="font-semibold">{{ card.data.company }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                    <p class="font-semibold">{{ card.data.email }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Téléphone</p>
                    <p class="font-semibold">{{ card.data.phone }}</p>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-wrap gap-3">
                <router-link
                  :to="`/editor/${card.id}`"
                  class="px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors font-medium flex items-center space-x-2"
                >
                  <Edit class="w-4 h-4" />
                  <span>Modifier</span>
                </router-link>
                <button
                  @click="shareCard(card.id)"
                  class="px-4 py-2 bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-800 transition-colors font-medium flex items-center space-x-2"
                >
                  <Share2 class="w-4 h-4" />
                  <span>{{ copiedCardId === card.id ? 'Copié !' : 'Partager' }}</span>
                </button>
                <button
                  @click="downloadVCard(card)"
                  class="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors font-medium flex items-center space-x-2"
                >
                  <Download class="w-4 h-4" />
                  <span>Télécharger vCard</span>
                </button>
                <button
                  @click="deleteCard(card.id)"
                  class="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium flex items-center space-x-2"
                >
                  <Trash2 class="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <div
          class="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center"
        >
          <CreditCard class="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 class="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Aucune carte créée</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          Commencez par créer votre première carte de visite
        </p>
        <router-link to="/editor" class="btn-primary inline-flex items-center">
          <Plus class="w-5 h-5 mr-2" />
          Créer ma première carte
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCardsStore } from '@/stores/cards'
import BusinessCard from '@/components/BusinessCard.vue'
import { CreditCard, Eye, Download, Plus, Edit, Share2, Trash2 } from 'lucide-vue-next'

const store = useCardsStore()
const copiedCardId = ref(null)

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('fr-FR', options)
}

const shareCard = (cardId) => {
  const card = store.getCardById(cardId)
  if (card) {
    const shareLink = store.generateShareLink(cardId)
    if (shareLink) {
      navigator.clipboard.writeText(shareLink).then(() => {
        copiedCardId.value = cardId
        setTimeout(() => {
          copiedCardId.value = null
        }, 2000)
      })
    }
  }
}

const downloadVCard = (card) => {
  const vCardContent = `BEGIN:VCARD
VERSION:3.0
FN:${card.data.fullName}
TITLE:${card.data.title}
ORG:${card.data.company}
EMAIL:${card.data.email}
TEL:${card.data.phone}
URL:${card.data.website}
ADR:;;${card.data.address};;;;
PHOTO;VALUE=URI:${card.data.photo}
END:VCARD`

  const blob = new Blob([vCardContent], { type: 'text/vcard' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${card.data.fullName || 'carte'}.vcf`
  link.click()
  window.URL.revokeObjectURL(url)
}

const deleteCard = (cardId) => {
  if (confirm('⚠️ Êtes-vous sûr de vouloir supprimer cette carte ? Cette action est irréversible.')) {
    store.deleteCard(cardId)
    alert('✅ Carte supprimée !')
  }
}
</script>
