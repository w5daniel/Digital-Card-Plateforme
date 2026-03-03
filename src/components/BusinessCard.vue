<template>
  <!-- Perspective wrapper for 3D flip -->
  <div class="card-perspective">
    <div
      class="card-flip-inner"
      :class="isFlipped ? 'is-flipped' : ''"
    >
      <!-- FACE AVANT (recto) -->
      <div
        class="business-card card-face card-front rounded-2xl shadow-2xl overflow-hidden"
        :style="{ ...cardStyle, fontFamily: card.data.fontFamily || 'Poppins' }"
      >
        <!-- Decorative Elements -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 pointer-events-none"></div>

        <div class="relative p-5 h-full flex flex-col justify-between">
          <!-- Header: nom + titre + photo -->
          <div class="flex items-start justify-between">
            <!-- Info gauche — rétrécit si QR centré-droit -->
            <div :class="shouldShowQR && !card.data.photo ? 'flex-1 pr-40' : 'flex-1'">
              <div v-if="card.data.logo" class="mb-3 h-8 max-w-28">
                <img :src="card.data.logo" alt="Logo" class="h-full object-contain" />
              </div>
              <h2 class="text-xl font-bold mb-0.5" :style="{ color: textColor }">
                {{ card.data.fullName || 'Nom Complet' }}
              </h2>
              <p class="text-xs opacity-80 mb-1" :style="{ color: textColor }">
                {{ card.data.title || 'Titre professionnel' }}
              </p>
              <p class="text-xs font-semibold opacity-90" :style="{ color: textColor }">
                {{ card.data.company || 'Entreprise' }}
              </p>
            </div>
            <!-- Photo (avec photo) -->
            <div
              v-if="card.data.photo"
              class="w-16 h-16 rounded-full overflow-hidden border-4 border-white/30 shadow-lg flex-shrink-0"
            >
              <img :src="card.data.photo" alt="Photo" class="w-full h-full object-cover" />
            </div>
            <!-- QR centré à droite (sans photo) -->
            <div
              v-if="shouldShowQR && !card.data.photo"
              class="absolute right-3 top-1/2 -translate-y-1/2"
              style="width: 152px; flex-shrink: 0; line-height: 0; mix-blend-mode: multiply;"
            >
              <QrcodeVue :value="qrCodeValue" :size="152" level="L" foreground="#1a1a2e" background="#ffffff" />
            </div>
          </div>

          <!-- Coordonnées -->
          <div
            class="space-y-1.5 mt-2"
            :style="shouldShowQR && card.data.photo ? { paddingRight: '132px' } : {}"
          >
            <div v-if="card.data.email" class="flex items-center space-x-1.5" :style="{ color: textColor }">
              <Mail class="w-3 h-3 opacity-70 flex-shrink-0" />
              <span class="text-xs truncate">{{ card.data.email }}</span>
            </div>
            <div v-if="card.data.phone" class="flex items-center space-x-1.5" :style="{ color: textColor }">
              <Phone class="w-3 h-3 opacity-70 flex-shrink-0" />
              <span class="text-xs truncate">{{ card.data.phone }}</span>
            </div>
            <div v-if="card.data.website" class="flex items-center space-x-1.5" :style="{ color: textColor }">
              <Globe class="w-3 h-3 opacity-70 flex-shrink-0" />
              <span class="text-xs truncate">{{ card.data.website }}</span>
            </div>
            <div v-if="card.data.address" class="flex items-center space-x-1.5" :style="{ color: textColor }">
              <MapPin class="w-3 h-3 opacity-70 flex-shrink-0" />
              <span class="text-xs truncate">{{ card.data.address }}</span>
            </div>
          </div>

          <!-- QR bas à droite (avec photo) -->
          <div
            v-if="shouldShowQR && card.data.photo"
            class="absolute bottom-3 right-3"
            style="width: 120px; line-height: 0; mix-blend-mode: multiply;"
          >
            <QrcodeVue :value="qrCodeValue" :size="120" level="L" foreground="#1a1a2e" background="#ffffff" />
          </div>
        </div>
      </div>

      <!-- FACE ARRIÈRE (verso) — jamais de QR code ici -->
      <div
        class="business-card card-face card-back rounded-2xl shadow-2xl overflow-hidden"
        :style="{ ...cardStyle, fontFamily: card.data.fontFamily || 'Poppins' }"
      >
        <!-- Decorative Elements -->
        <div class="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32 pointer-events-none"></div>
        <div class="absolute bottom-0 right-0 w-48 h-48 bg-black/10 rounded-full -mr-24 -mb-24 pointer-events-none"></div>

        <div class="relative p-6 h-full flex flex-col justify-start overflow-hidden">
          <!-- Contenu verso personnalisé -->
          <div v-if="card.backSide?.enabled && (card.backSide?.title || card.backSide?.content)" class="flex flex-col h-full">
            <!-- Titre -->
            <div v-if="card.backSide.title" class="mb-3 pb-2 border-b border-white/20">
              <h3 class="text-lg font-bold leading-tight" :style="{ color: textColor }">
                {{ card.backSide.title }}
              </h3>
            </div>
            <!-- Contenu : chaque ligne devient une entrée de colonne -->
            <div class="flex-1 overflow-hidden">
              <div
                v-for="(line, i) in contentLines"
                :key="i"
                class="flex items-start space-x-2 mb-1"
              >
                <span
                  v-if="line.trim()"
                  class="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-70 bg-white"
                ></span>
                <span
                  v-if="line.trim()"
                  class="text-xs leading-snug"
                  :style="{ color: textColor }"
                >{{ line }}</span>
                <!-- Ligne vide = espace vertical -->
                <div v-else class="h-2"></div>
              </div>
            </div>
          </div>

          <!-- Verso par défaut : nom + titre (pas de QR sur le verso) -->
          <div v-else class="flex flex-col items-center justify-center h-full space-y-4">
            <!-- Logo si disponible -->
            <div v-if="card.data.logo" class="h-12 max-w-40">
              <img :src="card.data.logo" alt="Logo" class="h-full object-contain filter brightness-0 invert opacity-90" />
            </div>
            <!-- Nom et titre centrés -->
            <div class="text-center space-y-1">
              <p class="text-lg font-bold" :style="{ color: textColor }">
                {{ card.data.fullName || 'Nom Complet' }}
              </p>
              <p class="text-sm opacity-75" :style="{ color: textColor }">
                {{ card.data.title || '' }}
              </p>
              <p v-if="card.data.company" class="text-xs font-semibold opacity-60" :style="{ color: textColor }">
                {{ card.data.company }}
              </p>
            </div>
            <!-- Ligne décorative -->
            <div class="w-16 h-0.5 rounded-full bg-white/40"></div>
            <!-- Email en bas -->
            <p v-if="card.data.email" class="text-xs opacity-60" :style="{ color: textColor }">
              {{ card.data.email }}
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

// Afficher le QR si activé via prop showQR OU via card.data.showQR (recto seulement)
const shouldShowQR = computed(() => {
  return props.showQR || props.card.data?.showQR
})

// Découpe le contenu du verso en lignes pour un affichage en colonne
const contentLines = computed(() => {
  const raw = props.card.backSide?.content || ''
  return raw.split('\n')
})

const qrCodeValue = computed(() => {
  const parts = ['BEGIN:VCARD', 'VERSION:3.0']
  if (props.card.data.fullName) {
    const words = props.card.data.fullName.trim().split(/\s+/)
    const first = words[0] || ''
    const last = words.slice(1).join(' ') || ''
    parts.push(`N:${last};${first};;;`)
    parts.push(`FN:${props.card.data.fullName}`)
  }
  if (props.card.data.title)    parts.push(`TITLE:${props.card.data.title}`)
  if (props.card.data.company)  parts.push(`ORG:${props.card.data.company}`)
  if (props.card.data.phone)    parts.push(`TEL:${props.card.data.phone}`)
  if (props.card.data.email)    parts.push(`EMAIL:${props.card.data.email}`)
  if (props.card.data.website)  parts.push(`URL:${props.card.data.website}`)
  if (props.card.data.address)  parts.push(`ADR:;;${props.card.data.address};;;;`)
  parts.push('END:VCARD')
  return parts.join('\n')
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
