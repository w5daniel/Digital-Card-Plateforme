<template>
  <div
    class="dashboard-view min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 py-12"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <div class="mb-12">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1
              class="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent"
            >
              Mon tableau de bord
            </h1>
            <p class="text-lg text-gray-600 dark:text-gray-400">
              Gérez toutes vos cartes de visite en un seul endroit
            </p>
          </div>
          <div class="mt-6 md:mt-0 flex flex-wrap gap-3">
            <button
              @click="exportCards"
              class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <Download class="w-5 h-5" />
              <span>Exporter</span>
            </button>
            <label
              class="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 dark:from-purple-600 dark:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 cursor-pointer"
            >
              <Plus class="w-5 h-5" />
              <span>Importer</span>
              <input type="file" accept=".json" @change="importCards" class="hidden" />
            </label>
            <router-link
              to="/editor"
              class="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <Plus class="w-5 h-5" />
              <span>Créer une carte</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/50 dark:to-primary-800/30 rounded-xl flex items-center justify-center"
            >
              <CreditCard class="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <span
              class="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full"
              >Total</span
            >
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.totalCards }}</div>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">Cartes créées</p>
        </div>

        <div
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-secondary-100 to-secondary-50 dark:from-secondary-900/50 dark:to-secondary-800/30 rounded-xl flex items-center justify-center"
            >
              <Eye class="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
            </div>
            <span
              class="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full"
              >Total</span
            >
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.totalViews }}</div>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">Vues totales</p>
        </div>

        <div
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900/50 dark:to-accent-800/30 rounded-xl flex items-center justify-center"
            >
              <Download class="w-6 h-6 text-accent-600 dark:text-accent-400" />
            </div>
            <span
              class="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full"
              >Total</span
            >
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ stats.totalDownloads }}
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">Téléchargements</p>
        </div>

        <div
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/50 dark:to-amber-800/30 rounded-xl flex items-center justify-center"
            >
              <QrCode class="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <span
              class="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full"
              >Total</span
            >
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ stats.totalQRScans }}
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">Scans QR</p>
        </div>

        <div
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/50 dark:to-rose-800/30 rounded-xl flex items-center justify-center"
            >
              <Share2 class="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <span
              class="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full"
              >Total</span
            >
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ stats.totalShares }}
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">Partages</p>
        </div>
      </div>

      <!-- My Cards Section -->
      <div class="mb-8 flex items-center justify-between">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Mes cartes de visite
        </h2>
        <div v-if="store.userCards.length > 0" class="flex items-center space-x-3">
          <button
            @click="toggleSelectAll"
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center space-x-2 text-sm font-medium"
            :class="
              selectedCardIds.size > 0
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
                : ''
            "
          >
            <Check
              class="w-4 h-4"
              :class="selectedCardIds.size > 0 ? 'text-primary-600' : 'text-gray-400'"
            />
            <span>{{
              selectedCardIds.size > 0
                ? `${selectedCardIds.size} sélectionnée(s)`
                : 'Sélectionner tout'
            }}</span>
          </button>
        </div>
      </div>

      <!-- Recent Cards Carousel - SUPPRIMÉ -->

      <!-- Cards Grid -->
      <div v-if="store.userCards.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div
          v-for="card in store.userCards"
          :key="card.id"
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group relative"
        >
          <!-- Checkbox de sélection (top-left, discret) -->
          <div class="absolute top-3 left-3 z-20">
            <button
              @click="toggleCardSelection(card.id)"
              class="w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shadow-sm"
              :class="
                selectedCardIds.has(card.id)
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white/90 dark:bg-slate-700/90 border-gray-300 dark:border-slate-500 text-transparent hover:border-primary-400'
              "
              :title="selectedCardIds.has(card.id) ? 'Désélectionner' : 'Sélectionner'"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>

          <!-- Card Preview Section -->
          <div
            class="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-700 dark:to-slate-600 h-64 flex items-center justify-center"
          >
            <div class="scale-75 origin-center w-full px-4">
              <BusinessCard :card="card" :showQR="false" :isFlipped="flippedCards.has(card.id)" />
            </div>
            <!-- Status Badge -->
            <div class="absolute top-3 right-3">
              <span
                class="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800"
              >
                ✓ Active
              </span>
            </div>
          </div>

          <!-- Card Details -->
          <div class="p-8">
            <div class="mb-6">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {{ card.data.fullName || card.name }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {{ card.data.title }} @ {{ card.data.company }}
                  </p>
                </div>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Créée le {{ formatDate(card.createdAt) }}
              </p>
            </div>

            <!-- Contact Info Grid -->
            <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Email
                </p>
                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {{ card.data.email || '-' }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Téléphone
                </p>
                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {{ card.data.phone || '-' }}
                </p>
              </div>
              <div class="col-span-2">
                <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Adresse
                </p>
                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {{ card.data.address || '-' }}
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-2">
              <button
                @click="toggleCardFlip(card.id)"
                class="flex-1 min-w-fit px-4 py-2 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center space-x-1 text-sm"
                :class="
                  flippedCards.has(card.id)
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60'
                "
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{{ flippedCards.has(card.id) ? 'Voir recto' : 'Voir verso' }}</span>
              </button>
              <router-link
                :to="`/editor/${card.id}`"
                class="flex-1 min-w-fit px-4 py-2 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-xl hover:bg-primary-200 dark:hover:bg-primary-900/60 transition-all duration-200 font-semibold flex items-center justify-center space-x-1 text-sm"
              >
                <Edit class="w-4 h-4" />
                <span>Modifier</span>
              </router-link>
              <button
                @click="shareCard(card.id)"
                class="flex-1 min-w-fit px-4 py-2 bg-secondary-100 dark:bg-secondary-900/40 text-secondary-700 dark:text-secondary-300 rounded-xl hover:bg-secondary-200 dark:hover:bg-secondary-900/60 transition-all duration-200 font-semibold flex items-center justify-center space-x-1 text-sm"
              >
                <Share2 class="w-4 h-4" />
                <span>{{ copiedCardId === card.id ? '✓ Copié' : 'Partager' }}</span>
              </button>
              <button
                @click="downloadVCard(card)"
                class="flex-1 min-w-fit px-4 py-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-all duration-200 font-semibold flex items-center justify-center space-x-1 text-sm"
              >
                <Download class="w-4 h-4" />
                <span>vCard</span>
              </button>
              <button
                @click="deleteCard(card.id)"
                class="flex-1 min-w-fit px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/60 transition-all duration-200 font-semibold flex items-center justify-center space-x-1 text-sm"
              >
                <Trash2 class="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-24">
        <div
          class="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl flex items-center justify-center"
        >
          <CreditCard class="w-16 h-16 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">Aucune carte créée</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-8 text-lg max-w-md mx-auto">
          Commencez par créer votre première carte de visite professionnelle
        </p>
        <router-link
          to="/editor"
          class="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus class="w-6 h-6" />
          <span>Créer ma première carte</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCardsStore } from '@/stores/cards'
import { useNotificationStore } from '@/stores/notificationStore'
import BusinessCard from '@/components/BusinessCard.vue'
import {
  CreditCard,
  Eye,
  Download,
  Plus,
  Edit,
  Share2,
  Trash2,
  QrCode,
  Check,
} from 'lucide-vue-next'

const store = useCardsStore()
const notificationStore = useNotificationStore()
const copiedCardId = ref(null)
const selectedCardIds = ref(new Set())
const flippedCards = ref(new Set())

const stats = computed(() => store.getGlobalStats())

const toggleCardFlip = (cardId) => {
  const next = new Set(flippedCards.value)
  if (next.has(cardId)) {
    next.delete(cardId)
  } else {
    next.add(cardId)
  }
  flippedCards.value = next
}

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('fr-FR', options)
}

const shareCard = (cardId) => {
  const card = store.getCardById(cardId)
  if (card) {
    const shareLink = store.generateShareLink(cardId)
    if (shareLink) {
      store.incrementCardShares(cardId)
      navigator.clipboard.writeText(shareLink).then(() => {
        copiedCardId.value = cardId
        notificationStore.success('Lien copié dans le presse-papiers')
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
  notificationStore.success('vCard téléchargée avec succès')
}

const deleteCard = (cardId) => {
  if (
    confirm('⚠️ Êtes-vous sûr de vouloir supprimer cette carte ? Cette action est irréversible.')
  ) {
    store.deleteCard(cardId)
    selectedCardIds.value.delete(cardId)
    notificationStore.success('Carte supprimée avec succès')
  }
}

const toggleCardSelection = (cardId) => {
  if (selectedCardIds.value.has(cardId)) {
    selectedCardIds.value.delete(cardId)
  } else {
    selectedCardIds.value.add(cardId)
  }
}

const toggleSelectAll = () => {
  if (selectedCardIds.value.size === store.userCards.length) {
    selectedCardIds.value.clear()
  } else {
    store.userCards.forEach((card) => selectedCardIds.value.add(card.id))
  }
}

const exportCards = () => {
  // Déterminer les cartes à exporter
  const cardsToExport =
    selectedCardIds.value.size > 0
      ? store.userCards.filter((card) => selectedCardIds.value.has(card.id))
      : store.userCards

  if (cardsToExport.length === 0) {
    notificationStore.error("Aucune carte à exporter. Créez d'abord une carte.")
    return
  }

  const json = JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      cards: cardsToExport,
      templates: store.templates,
    },
    null,
    2,
  )

  const blob = new Blob([json], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cartes-digitales-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  window.URL.revokeObjectURL(url)
  notificationStore.success(`${cardsToExport.length} carte(s) exportée(s) avec succès`)
}

const importCards = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const jsonString = e.target?.result
      if (typeof jsonString !== 'string') return

      const result = store.importCardsFromJSON(jsonString)
      if (result.success) {
        notificationStore.success(`${result.count} carte(s) importée(s) avec succès`)
      } else {
        notificationStore.error(`Erreur: ${result.error}`)
      }
    } catch (error) {
      notificationStore.error('Erreur lors de la lecture du fichier')
    }
  }
  reader.readAsText(file)
}
</script>
