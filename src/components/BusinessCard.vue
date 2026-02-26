<template>
  <div
    class="business-card relative rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105"
    :style="cardStyle"
  >
    <!-- Decorative Elements -->
    <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
    <div class="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>

    <div class="relative p-8 h-full flex flex-col justify-between">
      <!-- Header with Photo -->
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h2 class="text-2xl font-bold mb-1" :style="{ color: textColor }">
            {{ card.data.fullName || 'Nom Complet' }}
          </h2>
          <p class="text-sm opacity-80 mb-4" :style="{ color: textColor }">
            {{ card.data.title || 'Titre professionnel' }}
          </p>
          <p class="text-sm font-semibold opacity-90" :style="{ color: textColor }">
            {{ card.data.company || 'Entreprise' }}
          </p>
        </div>

        <div
          v-if="card.data.photo"
          class="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 shadow-lg flex-shrink-0"
        >
          <img :src="card.data.photo" alt="Photo" class="w-full h-full object-cover" />
        </div>
      </div>

      <!-- Contact Info -->
      <div class="space-y-2 mt-6">
        <div
          v-if="card.data.email"
          class="flex items-center space-x-2"
          :style="{ color: textColor }"
        >
          <Mail class="w-4 h-4 opacity-70" />
          <span class="text-sm">{{ card.data.email }}</span>
        </div>
        <div
          v-if="card.data.phone"
          class="flex items-center space-x-2"
          :style="{ color: textColor }"
        >
          <Phone class="w-4 h-4 opacity-70" />
          <span class="text-sm">{{ card.data.phone }}</span>
        </div>
        <div
          v-if="card.data.website"
          class="flex items-center space-x-2"
          :style="{ color: textColor }"
        >
          <Globe class="w-4 h-4 opacity-70" />
          <span class="text-sm">{{ card.data.website }}</span>
        </div>
        <div
          v-if="card.data.address"
          class="flex items-center space-x-2"
          :style="{ color: textColor }"
        >
          <MapPin class="w-4 h-4 opacity-70" />
          <span class="text-sm">{{ card.data.address }}</span>
        </div>
      </div>

      <!-- QR Code Badge (optional) -->
      <div v-if="showQR" class="absolute bottom-6 right-6 bg-white p-3 rounded-lg shadow-lg border-2 border-gray-100">
        <QrcodeVue
          :value="qrCodeValue"
          :size="120"
          level="H"
          foreground="#000000"
          background="#ffffff"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Mail, Phone, Globe, MapPin } from 'lucide-vue-next'
import QrcodeVue from 'qrcode-vue3'
import { useCardsStore } from '@/stores/cards'

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
  showQR: {
    type: Boolean,
    default: false,
  },
})

const store = useCardsStore()

const template = computed(() => {
  return store.getTemplateBySlug(props.card.template) || store.templates[0]
})

const cardStyle = computed(() => {
  return {
    background: `linear-gradient(135deg, ${template.value.colors.primary} 0%, ${template.value.colors.secondary} 100%)`,
    minHeight: '280px',
  }
})

const textColor = computed(() => {
  return template.value.colors.text
})

const qrCodeValue = computed(() => {
  // Génère un vCard format pour le QR code
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${props.card.data.fullName || 'Contact'}
TITLE:${props.card.data.title || ''}
ORG:${props.card.data.company || ''}
TEL:${props.card.data.phone || ''}
EMAIL:${props.card.data.email || ''}
URL:${props.card.data.website || ''}
ADR:;;${props.card.data.address || ''};;;;
END:VCARD`
  return vcard
})
</script>

<style scoped>
.business-card {
  aspect-ratio: 16 / 9;
  max-width: 500px;
}
</style>
