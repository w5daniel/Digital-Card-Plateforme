<template>
  <div class="max-w-2xl space-y-6">
    <!-- Limites & Quotas -->
    <section
      class="rounded-xl border"
      class="bg-base-100 border-base-300"
    >
      <div class="px-5 py-4 border-b border-base-300">
        <h2 class="font-semibold text-sm flex items-center space-x-2 text-base-content">
          <Sliders class="w-4 h-4 text-flame-500" />
          <span>Limites & Quotas</span>
        </h2>
        <p class="text-xs mt-0.5 text-base-content/40">
          Nombre maximum de cartes par utilisateur
        </p>
      </div>
      <div class="p-5 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium mb-1.5 text-base-content/80">
              Cartes max — Plan gratuit
            </label>
            <input
              v-model.number="draft.maxCardsPerUser"
              type="number"
              min="1"
              max="100"
              step="1"
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-flame-500 bg-base-200 border-base-300 text-base-content"
            />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1.5 text-base-content/80">
              Cartes max — Plan Premium
            </label>
            <input
              v-model.number="draft.maxCardsPerPremium"
              type="number"
              min="1"
              max="500"
              step="1"
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-flame-500 bg-base-200 border-base-300 text-base-content"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Informations générales -->
    <section
      class="rounded-xl border"
      class="bg-base-100 border-base-300"
    >
      <div class="px-5 py-4 border-b border-base-300">
        <h2 class="font-semibold text-sm flex items-center space-x-2 text-base-content">
          <Info class="w-4 h-4 text-blue-500" />
          <span>Informations générales</span>
        </h2>
      </div>
      <div class="p-5 space-y-4">
        <div>
          <label class="block text-xs font-medium mb-1.5 text-base-content/80">Nom de l'application</label>
          <input
            v-model="draft.appName"
            type="text"
            class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-flame-500 bg-base-200 border-base-300 text-base-content"
          />
        </div>
        <div>
          <label class="block text-xs font-medium mb-1.5 text-base-content/80">Email de support</label>
          <input
            v-model="draft.supportEmail"
            type="email"
            class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-flame-500 bg-base-200 border-base-300 text-base-content"
          />
        </div>
      </div>
    </section>

    <!-- Toggles système -->
    <section
      class="rounded-xl border"
      class="bg-base-100 border-base-300"
    >
      <div class="px-5 py-4 border-b border-base-300">
        <h2 class="font-semibold text-sm flex items-center space-x-2 text-base-content">
          <ToggleRight class="w-4 h-4 text-green-500" />
          <span>Options du système</span>
        </h2>
      </div>
      <div class="divide-y divide-base-300">
        <div
          v-for="toggle in toggleOptions"
          :key="toggle.key"
          class="flex items-center justify-between px-5 py-4"
        >
          <div>
            <p
              class="text-sm font-medium text-base-content"
            >
              {{ toggle.label }}
            </p>
            <p class="text-xs mt-0.5 text-base-content/40"
            >
              {{ toggle.desc }}
            </p>
          </div>
          <button
            @click="draft[toggle.key] = !draft[toggle.key]"
            role="switch"
            :aria-checked="draft[toggle.key]"
            class="relative inline-flex flex-shrink-0 h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer"
            :class="
              draft[toggle.key] ? 'bg-flame-500' : 'bg-base-content/30'
            "
          >
            <span
              class="inline-block w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5"
              :class="draft[toggle.key] ? 'translate-x-5' : 'translate-x-0.5'"
            />
          </button>
        </div>
      </div>
    </section>

    <!-- Mode maintenance — zone de danger -->
    <section
      class="rounded-xl border"
      :class="
        draft.maintenanceMode
          ? 'border-red-500/50 bg-red-500/5'
          : 'bg-base-100 border-base-300'
      "
    >
      <div
        class="px-5 py-4 border-b"
        :class="draft.maintenanceMode ? 'border-red-500/30' : 'border-base-300'"
      >
        <h2 class="font-semibold text-sm flex items-center space-x-2 text-red-500">
          <AlertTriangle class="w-4 h-4" />
          <span>Zone de danger</span>
        </h2>
      </div>
      <div class="p-5 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-base-content">
              Mode maintenance
            </p>
            <p class="text-xs mt-0.5 text-red-500">
              L'application sera inaccessible aux utilisateurs
            </p>
          </div>
          <button
            @click="draft.maintenanceMode = !draft.maintenanceMode"
            role="switch"
            :aria-checked="draft.maintenanceMode"
            class="relative inline-flex flex-shrink-0 h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer"
            :class="
              draft.maintenanceMode ? 'bg-red-500' : 'bg-base-content/30'
            "
          >
            <span
              class="inline-block w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5"
              :class="draft.maintenanceMode ? 'translate-x-5' : 'translate-x-0.5'"
            />
          </button>
        </div>
        <p
          v-if="draft.maintenanceMode"
          class="text-xs text-red-500 bg-red-500/10 px-3 py-2 rounded-lg"
        >
          Le mode maintenance est actif. Pensez à le désactiver une fois les opérations terminées.
        </p>
      </div>
    </section>

    <!-- Boutons de sauvegarde -->
    <div class="flex items-center justify-between">
      <button
        @click="resetToDefaults"
        @blur="confirmingReset = false"
        class="px-4 py-2 rounded-lg border text-sm transition-colors"
        :class="
          confirmingReset
            ? 'border-red-500 text-red-500 bg-red-500/10 hover:bg-red-500/20'
            : 'border-base-300 text-base-content/50 hover:bg-base-200'
        "
      >
        {{ confirmingReset ? 'Confirmer la réinitialisation ?' : 'Réinitialiser par défaut' }}
      </button>
      <div class="flex items-center space-x-3">
        <span v-if="saved" class="text-xs text-green-500 flex items-center space-x-1">
          <CheckCircle class="w-3.5 h-3.5" />
          <span>Enregistré</span>
        </span>
        <button
          @click="saveSettings"
          :disabled="!isDirty"
          class="px-5 py-2 rounded-lg bg-flame-500 hover:bg-flame-600 disabled:opacity-40 text-white text-sm font-medium transition-colors"
        >
          Enregistrer les modifications
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Sliders, Info, ToggleRight, AlertTriangle, CheckCircle } from 'lucide-vue-next'
import { useThemeStore } from '../../stores/themeStore'
import { useAdminStore } from '../../stores/adminStore'

const themeStore = useThemeStore()
const adminStore = useAdminStore()

// Copie locale jusqu'à sauvegarde explicite
const draft = ref({ ...adminStore.settings })
const saved = ref(false)
const confirmingReset = ref(false)
let savedTimer = null

const isDirty = computed(() => {
  return JSON.stringify(draft.value) !== JSON.stringify(adminStore.settings)
})

const toggleOptions = [
  { key: 'allowRegistration', label: 'Inscription ouverte', desc: 'Nouveaux comptes autorisés' },
  { key: 'allowGallery', label: 'Galerie publique', desc: 'La galerie est visible par tous' },
]

// TODO backend : valider appName, supportEmail, limites côté serveur (PUT /api/admin/settings)
function validate() {
  const d = draft.value
  if (!d.appName || d.appName.trim().length === 0) return "Le nom de l'application est requis"
  if (!d.maxCardsPerUser || d.maxCardsPerUser < 1)
    return 'Le nombre de cartes (gratuit) doit être ≥ 1'
  if (!d.maxCardsPerPremium || d.maxCardsPerPremium < 1)
    return 'Le nombre de cartes (premium) doit être ≥ 1'
  return null
}

const saveSettings = () => {
  const err = validate()
  if (err) {
    alert(err)
    return
  }
  adminStore.updateSettings({ ...draft.value })
  saved.value = true
  if (savedTimer) clearTimeout(savedTimer)
  savedTimer = setTimeout(() => (saved.value = false), 2500)
}

const resetToDefaults = () => {
  if (!confirmingReset.value) {
    confirmingReset.value = true
    return
  }
  adminStore.resetSettings()
  draft.value = { ...adminStore.settings }
  confirmingReset.value = false
}

// Sync si le store change depuis l'extérieur
watch(
  () => adminStore.settings,
  (val) => {
    if (!isDirty.value) draft.value = { ...val }
  },
  { deep: true },
)
</script>
