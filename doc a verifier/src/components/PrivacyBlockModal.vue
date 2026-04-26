<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')" />
        <div
          class="relative w-full max-w-md rounded-2xl shadow-2xl p-6"
          class="bg-base-100 border border-orange-200/50"
        >
          <!-- Icon + Title -->
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xl shrink-0"
            >
              🛡️
            </div>
            <h2 class="text-base font-bold" class="text-base-content">
              Protection des données
            </h2>
          </div>

          <!-- Body -->
          <p class="text-sm mb-2" class="text-base-content/60">
            Ce modèle contient du <strong>texte stylé</strong> (gras, couleur…) dans des champs
            personnels (nom, email, téléphone…).
          </p>
          <p class="text-sm mb-5" class="text-base-content/50">
            Pour protéger la confidentialité des données, ces champs ne peuvent pas être publiés
            avec du style. Retirez la mise en forme de ces champs ou conservez le modèle en mode
            privé.
          </p>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              @click="$emit('close')"
              class="flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              class="bg-base-200 hover:bg-base-300 text-base-content/80"
            >
              Fermer
            </button>
            <router-link
              v-if="templateId"
              :to="`/editor/${templateId}?mode=edit-template`"
              @click="$emit('close')"
              class="flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-center transition-colors bg-orange-500 hover:bg-orange-600 text-white"
            >
              Modifier le modèle
            </router-link>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  dark: { type: Boolean, default: false },
  templateId: { type: String, default: null },
})
defineEmits(['close'])
</script>

<style scoped>
.modal-fade-enter-active {
  transition: all 0.2s ease-out;
}
.modal-fade-leave-active {
  transition: all 0.15s ease-in;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
