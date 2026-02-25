<template>
  <div class="editor-view py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2">Créer une carte de visite</h1>
        <p class="text-gray-600 dark:text-gray-400">
          Personnalisez votre carte de visite professionnelle
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left Panel - Form -->
        <div class="space-y-6">
          <!-- Card Name -->
          <div class="card p-6">
            <h2 class="text-xl font-bold mb-4 flex items-center">
              <FileText class="w-5 h-5 mr-2 text-primary-600" />
              Nom de la carte
            </h2>
            <input
              v-model="cardData.name"
              type="text"
              placeholder="Ex: Ma carte professionnelle"
              class="input-field"
            />
          </div>

          <!-- Personal Information -->
          <div class="card p-6">
            <h2 class="text-xl font-bold mb-4 flex items-center">
              <User class="w-5 h-5 mr-2 text-primary-600" />
              Informations personnelles
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >Nom complet *</label
                >
                <input
                  v-model="cardData.data.fullName"
                  type="text"
                  placeholder="Ex: Jean Dupont"
                  class="input-field"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Titre professionnel *</label
                >
                <input
                  v-model="cardData.data.title"
                  type="text"
                  placeholder="Ex: Développeur Full Stack"
                  class="input-field"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                <input
                  v-model="cardData.data.company"
                  type="text"
                  placeholder="Ex: TechCorp Inc."
                  class="input-field"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >URL Photo (optionnel)</label
                >
                <input
                  v-model="cardData.data.photo"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  class="input-field"
                />
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="card p-6">
            <h2 class="text-xl font-bold mb-4 flex items-center">
              <Phone class="w-5 h-5 mr-2 text-primary-600" />
              Coordonnées
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  v-model="cardData.data.email"
                  type="email"
                  placeholder="email@example.com"
                  class="input-field"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  v-model="cardData.data.phone"
                  type="tel"
                  placeholder="+226 70 12 34 56"
                  class="input-field"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                <input
                  v-model="cardData.data.website"
                  type="url"
                  placeholder="www.example.com"
                  class="input-field"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  v-model="cardData.data.address"
                  type="text"
                  placeholder="Ville, Pays"
                  class="input-field"
                />
              </div>
            </div>
          </div>

          <!-- Template Selection -->
          <div class="card p-6">
            <h2 class="text-xl font-bold mb-4 flex items-center">
              <Palette class="w-5 h-5 mr-2 text-primary-600" />
              Choisir un modèle
            </h2>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="template in store.templates.slice(0, 4)"
                :key="template.id"
                @click="cardData.template = template.slug"
                class="p-3 rounded-xl border-2 transition-all duration-200 text-left"
                :class="
                  cardData.template === template.slug
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                "
              >
                <div class="flex items-center space-x-2 mb-2">
                  <div
                    class="w-6 h-6 rounded-full"
                    :style="{ backgroundColor: template.colors.primary }"
                  ></div>
                  <div
                    class="w-6 h-6 rounded-full"
                    :style="{ backgroundColor: template.colors.secondary }"
                  ></div>
                </div>
                <p class="text-sm font-semibold">{{ template.name }}</p>
              </button>
            </div>
            <router-link
              to="/gallery"
              class="block mt-4 text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Voir tous les modèles →
            </router-link>
          </div>
        </div>

        <!-- Right Panel - Preview -->
        <div class="lg:sticky lg:top-24 h-fit">
          <div class="card p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold flex items-center">
                <Eye class="w-5 h-5 mr-2 text-primary-600" />
                Aperçu en direct
              </h2>
              <div class="flex space-x-2">
                <button
                  @click="showQRCode = !showQRCode"
                  class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  :class="
                    showQRCode
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-400'
                  "
                  title="Afficher/Masquer QR Code"
                >
                  <QrCode class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Card Preview -->
            <div class="mb-6">
              <BusinessCard :card="cardData" :showQR="showQRCode" />
            </div>

            <!-- Info Box -->
            <div
              class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6"
            >
              <div class="flex items-start space-x-3">
                <Info class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div class="text-sm text-blue-800 dark:text-blue-300">
                  <p class="font-semibold mb-1">Aperçu en temps réel</p>
                  <p>Les modifications sont affichées instantanément dans l'aperçu ci-dessus.</p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <button
                @click="saveCard"
                class="w-full btn-primary flex items-center justify-center"
                :disabled="!isFormValid"
                :class="!isFormValid ? 'opacity-50 cursor-not-allowed' : ''"
              >
                <Save class="w-5 h-5 mr-2" />
                Enregistrer la carte
              </button>

              <button
                @click="downloadVCard"
                class="w-full btn-secondary flex items-center justify-center"
              >
                <Download class="w-5 h-5 mr-2" />
                Télécharger vCard
              </button>

              <button
                @click="shareCard"
                class="w-full px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center justify-center"
              >
                <Share2 class="w-5 h-5 mr-2" />
                Partager
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCardsStore } from '@/stores/cards'
import { useAuthStore } from '@/stores/authStore'
import BusinessCard from '@/components/BusinessCard.vue'
import {
  User,
  Phone,
  Palette,
  Eye,
  Save,
  Download,
  Share2,
  FileText,
  QrCode,
  Info,
  Copy,
  Check,
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const store = useCardsStore()
const authStore = useAuthStore()

const showQRCode = ref(false)
const isEditing = ref(false)
const shareLinkCopied = ref(false)

const cardData = ref({
  name: 'Ma nouvelle carte',
  template: 'modern',
  data: {
    fullName: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    photo: '',
  },
})

onMounted(() => {
  // Si on a une ID dans l'URL, on charge la carte
  if (route.params.id) {
    const cardId = Number(route.params.id)
    const existingCard = store.getCardById(cardId)
    if (existingCard) {
      cardData.value = JSON.parse(JSON.stringify(existingCard))
      isEditing.value = true
    }
  }

  // Si on a un template sélectionné depuis la galerie
  if (store.currentTemplate) {
    cardData.value.template = store.currentTemplate
    store.currentTemplate = null
  }
})

const isFormValid = computed(() => {
  return cardData.value.data.fullName && cardData.value.data.title && cardData.value.data.email
})

const saveCard = () => {
  if (isFormValid.value) {
    if (isEditing.value) {
      // Mise à jour d'une carte existante
      store.updateCard(cardData.value.id, cardData.value)
      alert('✅ Carte mise à jour avec succès !')
    } else {
      // Création d'une nouvelle carte
      store.addCard(cardData.value)
      alert('✅ Carte enregistrée avec succès !')
    }
    router.push('/dashboard')
  }
}

const downloadVCard = () => {
  const vCardContent = `BEGIN:VCARD
VERSION:3.0
FN:${cardData.value.data.fullName}
TITLE:${cardData.value.data.title}
ORG:${cardData.value.data.company}
EMAIL:${cardData.value.data.email}
TEL:${cardData.value.data.phone}
URL:${cardData.value.data.website}
ADR:;;${cardData.value.data.address};;;;
PHOTO;VALUE=URI:${cardData.value.data.photo}
END:VCARD`

  const blob = new Blob([vCardContent], { type: 'text/vcard' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${cardData.value.data.fullName || 'carte'}.vcf`
  link.click()
  window.URL.revokeObjectURL(url)
  alert('📥 Fichier vCard téléchargé !')
}

const shareCard = () => {
  if (isEditing.value) {
    const shareLink = store.generateShareLink(cardData.value.id)
    if (shareLink) {
      // Copier dans le presse-papiers
      navigator.clipboard.writeText(shareLink).then(() => {
        shareLinkCopied.value = true
        setTimeout(() => {
          shareLinkCopied.value = false
        }, 2000)
      })
    }
  } else {
    alert('💾 Enregistrez d\'abord la carte pour la partager !')
  }
}
</script>
