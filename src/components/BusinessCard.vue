<template>
  <!-- Perspective wrapper for 3D flip -->
  <div class="card-perspective">
    <div
      class="card-flip-inner"
      :class="isFlipped ? 'is-flipped' : ''"
    >
      <!-- FACE AVANT -->
      <div
        class="business-card card-face card-front rounded-2xl shadow-2xl overflow-hidden"
        :style="{ ...cardStyle, fontFamily: card.data.fontFamily || 'Poppins' }"
      >
        <!-- Decorative Elements -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>

        <div class="relative p-8 h-full flex flex-col justify-between">
          <!-- Header with Photo and Logo -->
          <div class="flex items-start justify-between">
            <!-- Left Side: Info -->
            <div class="flex-1">
              <div v-if="card.data.logo" class="mb-4 h-10 max-w-32">
                <img :src="card.data.logo" alt="Logo" class="h-full object-contain" />
              </div>
              <h2 class="text-2xl font-bold mb-1" :style="{ color: textColor }">
                {{ card.data.fullName || 'Nom Complet' }}
              </h2>
              <p class="text-sm opacity-80 mb-2" :style="{ color: textColor }">
                {{ card.data.title || 'Titre professionnel' }}
              </p>
              <p class="text-sm font-semibold opacity-90" :style="{ color: textColor }">
                {{ card.data.company || 'Entreprise' }}
              </p>
            </div>
            <!-- Right Side: Photo -->
            <div
              v-if="card.data.photo"
              class="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 shadow-lg flex-shrink-0"
            >
              <img :src="card.data.photo" alt="Photo" class="w-full h-full object-cover" />
            </div>
          </div>

          <!-- Contact Info -->
          <div class="space-y-2 mt-4">
            <div v-if="card.data.email" class="flex items-center space-x-2" :style="{ color: textColor }">
              <Mail class="w-4 h-4 opacity-70 flex-shrink-0" />
              <span class="text-sm truncate">{{ card.data.email }}</span>
            </div>
            <div v-if="card.data.phone" class="flex items-center space-x-2" :style="{ color: textColor }">
              <Phone class="w-4 h-4 opacity-70 flex-shrink-0" />
              <span class="text-sm truncate">{{ card.data.phone }}</span>
            </div>
            <div v-if="card.data.website" class="flex items-center space-x-2" :style="{ color: textColor }">
              <Globe class="w-4 h-4 opacity-70 flex-shrink-0" />
              <span class="text-sm truncate">{{ card.data.website }}</span>
            </div>
            <div v-if="card.data.address" class="flex items-center space-x-2" :style="{ color: textColor }">
              <MapPin class="w-4 h-4 opacity-70 flex-shrink-0" />
              <span class="text-sm truncate">{{ card.data.address }}</span>
            </div>
          </div>

          <!-- QR Code (petit, en bas à droite) -->
          <div v-if="showQR" class="absolute bottom-3 right-3 bg-white p-1 rounded shadow border border-gray-100">
            <QrcodeVue :value="qrCodeValue" :size="56" level="H" foreground="#000000" background="#ffffff" />
          </div>
        </div>
      </div>

      <!-- FACE ARRIÈRE -->
      <div
        class="business-card card-face card-back rounded-2xl shadow-2xl overflow-hidden"
        :style="{ ...cardStyle, fontFamily: card.data.fontFamily || 'Poppins' }"
      >
        <!-- Decorative Elements -->
        <div class="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32"></div>
        <div class="absolute bottom-0 right-0 w-48 h-48 bg-black/10 rounded-full -mr-24 -mb-24"></div>

        <div class="relative p-8 h-full flex flex-col justify-center items-center text-center space-y-4">
          <div v-if="card.backSide?.enabled && card.backSide?.title">
            <h3 class="text-2xl font-bold mb-3" :style="{ color: textColor }">
              {{ card.backSide.title }}
            </h3>
            <p class="text-sm opacity-90 leading-relaxed max-w-xs" :style="{ color: textColor }">
              {{ card.backSide.content || '' }}
            </p>
          </div>
          <div v-else class="flex flex-col items-center space-y-4">
            <!-- QR Code centré au verso par défaut -->
            <div class="bg-white p-3 rounded-xl shadow-lg border border-white/20">
              <QrcodeVue :value="qrCodeValue" :size="100" level="H" foreground="#000000" background="#ffffff" />
            </div>
            <p class="text-xs font-medium opacity-80" :style="{ color: textColor }">
              Scannez pour enregistrer le contact
            </p>
          </div>
        </div>
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
  isFlipped: {
    type: Boolean,
    default: false,
  },
  cardSize: {
    type: String,
    default: 'normal', // 'normal' or 'small'
  },
})

const store = useCardsStore()

const template = computed(() => {
  return store.getTemplateBySlug(props.card.template) || store.templates[0]
})

const cardStyle = computed(() => {
  return {
    background: `linear-gradient(135deg, ${template.value.colors.primary} 0%, ${template.value.colors.secondary} 100%)`,
    minHeight: props.cardSize === 'small' ? '240px' : '280px',
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
.card-perspective {
  perspective: 1200px;
}

.card-flip-inner {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-flip-inner.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-back {
  position: absolute;
  inset: 0;
  transform: rotateY(180deg);
}

.business-card {
  aspect-ratio: 16 / 9;
  max-width: 500px;
}
</style>
