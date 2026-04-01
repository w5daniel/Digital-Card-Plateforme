<template>
  <div
    class="min-h-screen bg-gradient-to-br from-powder-100 to-powder-100 dark:from-onyx-900 dark:to-onyx-800 py-12"
  >
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Card Found -->
      <div v-if="card" class="space-y-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold mb-2">{{ card.name }}</h1>
          <p class="text-onyx-500 dark:text-onyx-400">Carte partagée par {{ getFullName(card) }}</p>
        </div>

        <!-- Main Card Display -->
        <div class="card p-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Card Preview (larger) -->
            <div
              class="lg:col-span-1 lg:row-span-2 flex flex-col items-center justify-center gap-3"
            >
              <div class="w-full flex justify-center">
                <BusinessCard :card="card" class="w-full" />
              </div>
              <!-- Scan QR button (shown only if card has QR elements) -->
              <button
                v-if="qrElements.length > 0"
                @click="qrModalOpen = true"
                class="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-powder-100 dark:bg-onyx-800 hover:bg-powder-200 dark:hover:bg-onyx-700 text-onyx-700 dark:text-onyx-300 transition-colors border border-powder-300 dark:border-onyx-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" rx="1" stroke-width="2" />
                  <rect x="14" y="3" width="7" height="7" rx="1" stroke-width="2" />
                  <rect x="3" y="14" width="7" height="7" rx="1" stroke-width="2" />
                  <path
                    d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18h3v3M21 14v3"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                Agrandir le QR code
              </button>
            </div>

            <!-- Card Info -->
            <div class="lg:col-span-2 space-y-6">
              <div>
                <h2 class="text-3xl font-bold mb-1">{{ getFullName(card) }}</h2>
                <p class="text-lg text-flame-600 dark:text-flame-400 font-semibold">
                  {{ getElemText(card, 'title') }}
                </p>
                <p v-if="getElemText(card, 'company')" class="text-onyx-500 dark:text-onyx-400">
                  {{ getElemText(card, 'company') }}
                </p>
              </div>

              <!-- Contact Details -->
              <div class="space-y-3 bg-powder-100 dark:bg-onyx-800 p-4 rounded-lg">
                <div v-if="getElemText(card, 'email')" class="flex items-center space-x-3">
                  <Mail class="w-5 h-5 text-flame-600 dark:text-flame-400" />
                  <a
                    :href="`mailto:${getElemText(card, 'email')}`"
                    class="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {{ getElemText(card, 'email') }}
                  </a>
                </div>
                <div v-if="getElemText(card, 'phone')" class="flex items-center space-x-3">
                  <Phone class="w-5 h-5 text-flame-600 dark:text-flame-400" />
                  <a
                    :href="`tel:${getElemText(card, 'phone')}`"
                    class="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {{ getElemText(card, 'phone') }}
                  </a>
                </div>
                <div v-if="getElemText(card, 'website')" class="flex items-center space-x-3">
                  <Globe class="w-5 h-5 text-flame-600 dark:text-flame-400" />
                  <a
                    :href="ensureProtocol(getElemText(card, 'website'))"
                    target="_blank"
                    class="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {{ getElemText(card, 'website') }}
                  </a>
                </div>
                <div v-if="getElemText(card, 'address')" class="flex items-start space-x-3">
                  <MapPin class="w-5 h-5 text-flame-600 dark:text-flame-400 mt-1" />
                  <p>{{ getElemText(card, 'address') }}</p>
                </div>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-2 gap-4">
                <div class="stat-box">
                  <Eye class="w-5 h-5 text-onyx-600 dark:text-onyx-400 mb-2" />
                  <p class="text-2xl font-bold">{{ card.views }}</p>
                  <p class="text-sm text-onyx-500 dark:text-onyx-400">Vues</p>
                </div>
                <div class="stat-box">
                  <Download class="w-5 h-5 text-accent-600 dark:text-accent-400 mb-2" />
                  <p class="text-2xl font-bold">{{ card.downloads }}</p>
                  <p class="text-sm text-onyx-500 dark:text-onyx-400">vCards téléchargées</p>
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
            class="px-6 py-3 bg-powder-200 hover:bg-powder-300 dark:bg-onyx-700 dark:hover:bg-onyx-600 text-onyx-800 dark:text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
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
          class="w-24 h-24 mx-auto mb-6 bg-powder-100 dark:bg-onyx-800 rounded-full flex items-center justify-center"
        >
          <AlertCircle class="w-12 h-12 text-onyx-400 dark:text-onyx-500" />
        </div>
        <h2 class="text-2xl font-bold text-onyx-700 dark:text-powder-300 mb-2">
          Carte non trouvée
        </h2>
        <p class="text-onyx-500 dark:text-onyx-400 mb-6">
          Cette carte n'existe pas ou a été supprimée
        </p>
        <router-link to="/" class="btn-primary inline-flex items-center">
          <Home class="w-5 h-5 mr-2" />
          Retour à l'accueil
        </router-link>
      </div>
    </div>
  </div>

  <!-- QR Zoom Modal -->
  <Teleport to="body">
    <div
      v-if="qrModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      @click.self="qrModalOpen = false"
    >
      <div
        class="relative bg-white dark:bg-onyx-900 rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4 max-w-xs w-full mx-4"
      >
        <button
          @click="qrModalOpen = false"
          class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-powder-100 dark:bg-onyx-700 hover:bg-powder-200 dark:hover:bg-onyx-600 transition-colors"
        >
          <svg
            class="w-4 h-4 text-onyx-600 dark:text-onyx-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h3 class="text-base font-semibold text-onyx-800 dark:text-white">Scanner le QR code</h3>
        <div :ref="(c) => mountModalQR(c)" class="w-64 h-64" style="line-height: 0" />
        <p class="text-xs text-center text-onyx-400 dark:text-onyx-500">
          Scannez ce code pour ajouter le contact à votre téléphone
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCardsStore } from '@/stores/cards'
import BusinessCard from '@/components/BusinessCard.vue'
import { getFullName, getElemText } from '@/utils/cardElements'
import { Mail, Phone, Globe, MapPin, Eye, Download, Home, AlertCircle } from 'lucide-vue-next'
import QRCodeStyling from 'qr-code-styling'
import {
  buildVCardFromFields, buildQRStylingOptions,
  DEFAULT_QR_FIELDS, getContactFromCard, applyQRCanvasStyle,
} from '@/utils/qrCodeHelper'

const route = useRoute()
const store = useCardsStore()

const ensureProtocol = (url) => {
  if (!url) return '#'
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

const card = ref(null)
const qrModalOpen = ref(false)

const qrElements = computed(() => {
  if (!card.value) return []
  const recto = card.value.data?.elements || []
  const verso = card.value.data?.versoElements || []
  return [...recto, ...verso].filter((e) => e.type === 'qr' && e.visible !== false)
})

let modalMounted = false

function mountModalQR(containerEl) {
  if (!containerEl || !card.value || modalMounted) return
  containerEl.innerHTML = ''
  const el = qrElements.value[0]
  if (!el) return
  modalMounted = true
  const contact = getContactFromCard(card.value.data)
  const fields = el.qrFields || DEFAULT_QR_FIELDS
  const vcard = buildVCardFromFields(contact, fields, card.value.data.contactExtra || [])
  const qr = new QRCodeStyling(buildQRStylingOptions(vcard, el, 256))
  qr.append(containerEl)
  nextTick(() => applyQRCanvasStyle(containerEl))
}

watch(qrModalOpen, (v) => { if (!v) modalMounted = false })

onMounted(() => {
  const cardId = Number(route.params.cardId)
  // getPublicCard lit d'abord les cartes de l'utilisateur courant,
  // puis le snapshot public (accessible cross-user).
  // TODO backend : remplacer par await api.get(`/cards/public/${cardId}`)
  const foundCard = store.getPublicCard(cardId)

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
FN:${getFullName(card.value)}
TITLE:${getElemText(card.value, 'title')}
ORG:${getElemText(card.value, 'company')}
EMAIL:${getElemText(card.value, 'email')}
TEL:${getElemText(card.value, 'phone')}
URL:${getElemText(card.value, 'website')}
ADR:;;${getElemText(card.value, 'address')};;;;
END:VCARD`

  const blob = new Blob([vCardContent], { type: 'text/vcard' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${getFullName(card.value) || 'contact'}.vcf`
  link.click()
  window.URL.revokeObjectURL(url)

  // Incrémenter les téléchargements
  store.incrementCardDownloads(card.value?.id)
}
</script>

<style scoped>
.stat-box {
  @apply bg-powder-100 dark:bg-onyx-700 p-4 rounded-lg text-center;
}
</style>
