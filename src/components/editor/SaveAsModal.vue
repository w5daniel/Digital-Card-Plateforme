<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('cancel')" />

        <!-- Modal -->
        <div
          class="relative w-full max-w-md rounded-2xl shadow-2xl p-6 transform transition-all bg-base-100 border border-base-300"
        >
          <!-- Close -->
          <button
            @click="$emit('cancel')"
            class="absolute top-4 right-4 p-1.5 rounded-lg transition-colors text-base-content/40 hover:bg-base-200 hover:text-base-content"
          >
            <X class="w-4 h-4" />
          </button>

          <!-- Title -->
          <h2 class="text-lg font-bold mb-1 text-base-content">
            Enregistrer comme…
          </h2>
          <p class="text-xs mb-6 text-base-content/40">
            Choisissez le type d'enregistrement
          </p>

          <!-- Options -->
          <div class="grid grid-cols-2 gap-3 mb-6">
            <!-- Template option -->
            <button
              @click="saveType = 'template'"
              class="relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 group"
              :class="[
                saveType === 'template'
                  ? 'border-violet-500 bg-violet-500/10 shadow-md shadow-violet-500/10'
                  : 'border-base-300 hover:border-violet-400/60 hover:bg-violet-50/30',
              ]"
            >
              <!-- Check indicator -->
              <div
                v-if="saveType === 'template'"
                class="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center"
              >
                <Check class="w-3 h-3 text-white" />
              </div>
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                :class="
                  saveType === 'template'
                    ? 'bg-violet-500/20 text-violet-500'
                    : 'bg-base-200 text-base-content/40 group-hover:text-violet-500'
                "
              >
                <LayoutTemplate class="w-6 h-6" />
              </div>
              <div class="text-center">
                <p
                  class="text-sm font-semibold mb-1"
                  :class="
                    saveType === 'template'
                      ? 'text-violet-500'
                      : 'text-base-content/80'
                  "
                >
                  Modèle
                </p>
                <p
                  class="text-[10px] leading-relaxed text-base-content/40"
                >
                  Design réutilisable pour créer plusieurs cartes
                </p>
              </div>
            </button>

            <!-- Card option -->
            <button
              @click="saveType = 'card'"
              class="relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 group"
              :class="[
                saveType === 'card'
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-md shadow-emerald-500/10'
                  : 'border-base-300 hover:border-emerald-400/60 hover:bg-emerald-50/30',
              ]"
            >
              <!-- Check indicator -->
              <div
                v-if="saveType === 'card'"
                class="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
              >
                <Check class="w-3 h-3 text-white" />
              </div>
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                :class="
                  saveType === 'card'
                    ? 'bg-emerald-500/20 text-emerald-500'
                    : 'bg-base-200 text-base-content/40 group-hover:text-emerald-500'
                "
              >
                <CreditCard class="w-6 h-6" />
              </div>
              <div class="text-center">
                <p
                  class="text-sm font-semibold mb-1"
                  :class="
                    saveType === 'card'
                      ? 'text-emerald-500'
                      : 'text-base-content/80'
                  "
                >
                  Carte
                </p>
                <p
                  class="text-[10px] leading-relaxed text-base-content/40"
                >
                  Carte personnelle prête à partager et télécharger
                </p>
              </div>
            </button>
          </div>

          <!-- Name input -->
          <div class="mb-5">
            <label
              class="block text-xs font-medium mb-1.5 text-base-content/40"
            >
              {{ saveType === 'template' ? 'Nom du modèle' : 'Nom de la carte' }}
            </label>
            <input
              ref="nameInput"
              v-model="name"
              type="text"
              :placeholder="saveType === 'template' ? 'Mon modèle corporate' : 'Ma carte de visite'"
              class="w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-colors bg-base-100 border-base-300 text-base-content placeholder:text-base-content/40 focus:border-primary"
              @keydown.enter="onConfirm"
            />
          </div>

          <!-- Public/Privé toggle (modèle only) -->
          <div v-if="saveType === 'template'" class="mb-5 space-y-2">
            <button
              @click="toggleIsPublic"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200"
              :class="
                isPublic
                  ? 'border-success bg-success/10 text-success'
                  : 'border-base-300 hover:border-base-content/30 text-base-content/70'
              "
            >
              <Globe v-if="isPublic" class="w-4 h-4 shrink-0 text-emerald-500" />
              <Lock
                v-else
                class="w-4 h-4 shrink-0 text-base-content/40"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold leading-tight">
                  {{ isPublic ? 'Public' : 'Privé' }}
                </p>
                <p
                  class="text-xs mt-0.5 leading-snug text-base-content/40"
                >
                  <span v-if="isPublic"
                    >Visible dans la galerie Communauté — utilisez des informations fictives</span
                  >
                  <span v-else>Visible uniquement dans votre Dashboard</span>
                </p>
              </div>
            </button>
            <p
              v-if="!canPublish"
              class="text-[11px] px-1 text-warning"
            >
              La publication dans la Communauté est réservée au plan Premium.
            </p>
          </div>

          <!-- Limit warning -->
          <div
            v-if="saveType === 'template' && !canCreateTemplate"
            class="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-4 text-xs bg-warning/10 text-warning"
          >
            <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Limite atteinte ({{ maxFreeTemplates }} modèles). Passez au
              <button
                @click="$emit('cancel'); $router.push('/pricing')"
                class="font-bold underline"
              >
                plan Premium
              </button>
              pour créer plus de modèles.
            </span>
          </div>

          <!-- Privacy conflict inline error -->
          <Transition name="modal-fade">
            <div
              v-if="saveType === 'template' && isPublic && privacyConflict"
              :class="[
                'mb-4 px-4 py-3 rounded-xl border text-xs leading-snug',
                'border-orange-300/60 bg-orange-50/80',
                'text-orange-700',
                { 'animate-shake': shaking },
              ]"
            >
              <p class="font-semibold mb-0.5">🛡️ Publication bloquée</p>
              <p>Les champs Infos (nom, email…) contiennent du texte stylé. Retirez le style ou passez en mode <strong>Privé</strong>.</p>
            </div>
          </Transition>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              @click="$emit('cancel')"
              class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors bg-base-200 text-base-content/70 hover:bg-base-300"
            >
              Annuler
            </button>
            <button
              @click="onConfirm"
              :disabled="!name.trim() || (saveType === 'template' && !canCreateTemplate) || (saveType === 'template' && isPublic && privacyConflict)"
              class="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              :class="
                saveType === 'template'
                  ? 'bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20'
              "
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { X, Check, LayoutTemplate, CreditCard, AlertTriangle, Globe, Lock } from 'lucide-vue-next'

const props = defineProps({
  visible: { type: Boolean, default: false },
  dark: { type: Boolean, default: false },
  initialName: { type: String, default: 'Ma carte de visite' },
  canCreateTemplate: { type: Boolean, default: true },
  maxFreeTemplates: { type: Number, default: 2 },
  canPublish: { type: Boolean, default: false },
  privacyConflict: { type: Boolean, default: false },
})

const emit = defineEmits(['cancel', 'save'])

const saveType = ref('template') // 'template' | 'card'
const name = ref(props.initialName)
const nameInput = ref(null)
const isPublic = ref(false)
const shaking = ref(false)

function triggerShake() {
  shaking.value = false
  nextTick(() => {
    shaking.value = true
  })
  setTimeout(() => {
    shaking.value = false
  }, 500)
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      name.value = props.initialName
      saveType.value = 'template'
      isPublic.value = false
      nextTick(() => nameInput.value?.focus())
    }
  },
)

watch(
  () => props.initialName,
  (val) => {
    name.value = val
  },
)

function toggleIsPublic() {
  if (!isPublic.value && !props.canPublish) return // guard — publication requires premium
  isPublic.value = !isPublic.value
}

function onConfirm() {
  if (!name.value.trim()) return
  if (saveType.value === 'template' && !props.canCreateTemplate) return
  if (saveType.value === 'template' && isPublic.value && props.privacyConflict) {
    triggerShake()
    return
  }
  emit('save', {
    type: saveType.value,
    name: name.value.trim(),
    isPublic: isPublic.value && saveType.value === 'template',
  })
}
</script>

<style scoped>
.modal-fade-enter-active {
  transition: all 0.2s ease-out;
}
.modal-fade-leave-active {
  transition: all 0.15s ease-in;
}
.modal-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
