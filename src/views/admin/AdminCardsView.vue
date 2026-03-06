<template>
  <div class="space-y-4">
    <!-- Filtres -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-onyx-400" />
        <input
          v-model="search"
          type="text"
          placeholder="Titre, propriétaire..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-flame-500"
          :class="
            themeStore.darkMode
              ? 'bg-onyx-800 border-onyx-700 text-white placeholder-onyx-500'
              : 'bg-powder-100 border-onyx-200 text-onyx-900 placeholder-onyx-400'
          "
        />
      </div>
      <div class="flex items-center space-x-2">
        <button
          v-for="f in filterOptions"
          :key="f.value"
          @click="activeFilter = f.value"
          class="px-3 py-2 rounded-lg border text-xs font-medium transition-colors"
          :class="
            activeFilter === f.value
              ? 'bg-flame-500 border-flame-500 text-white'
              : themeStore.darkMode
                ? 'border-onyx-700 text-onyx-400 hover:bg-onyx-800'
                : 'border-onyx-200 text-onyx-600 hover:bg-powder-50'
          "
        >
          {{ f.label }}
          <span v-if="f.count > 0" class="ml-1 px-1 py-0.5 rounded bg-white/20 text-[10px]">{{
            f.count
          }}</span>
        </button>
      </div>
    </div>

    <!-- Compteur -->
    <p class="text-xs" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">
      {{ filteredCards.length }} carte(s) —
      {{ adminStore.stats.totalViews.toLocaleString('fr-FR') }} vues totales
    </p>

    <!-- Table -->
    <div
      class="rounded-xl border overflow-hidden"
      :class="themeStore.darkMode ? 'border-onyx-700' : 'border-onyx-200'"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr
              :class="
                themeStore.darkMode ? 'bg-onyx-800 text-onyx-400' : 'bg-powder-50 text-onyx-500'
              "
            >
              <th class="text-left px-4 py-3 font-medium">Carte</th>
              <th class="text-left px-4 py-3 font-medium hidden sm:table-cell">Propriétaire</th>
              <th class="text-left px-4 py-3 font-medium hidden md:table-cell">Modèle</th>
              <th class="text-left px-4 py-3 font-medium">Visibilité</th>
              <th class="text-left px-4 py-3 font-medium hidden lg:table-cell">Vues</th>
              <th class="text-left px-4 py-3 font-medium hidden lg:table-cell">Créée le</th>
              <th class="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody
            class="divide-y"
            :class="themeStore.darkMode ? 'divide-onyx-700' : 'divide-powder-100'"
          >
            <tr
              v-for="card in filteredCards"
              :key="card.id"
              :class="[
                themeStore.darkMode
                  ? 'bg-onyx-900 hover:bg-onyx-800'
                  : 'bg-white hover:bg-powder-50',
                card.flagged
                  ? themeStore.darkMode
                    ? 'border-l-2 border-red-500'
                    : 'border-l-2 border-red-400'
                  : '',
              ]"
            >
              <!-- Titre + status -->
              <td class="px-4 py-3">
                <div class="flex items-center space-x-2">
                  <div class="flex-shrink-0">
                    <Flag v-if="card.flagged" class="w-4 h-4 text-red-500" />
                    <CreditCard
                      v-else
                      class="w-4 h-4"
                      :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
                    />
                  </div>
                  <div>
                    <p
                      class="font-medium"
                      :class="themeStore.darkMode ? 'text-white' : 'text-onyx-900'"
                    >
                      {{ card.title }}
                    </p>
                    <span
                      class="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      :class="
                        card.status === 'approved'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                      "
                    >
                      {{ card.status === 'approved' ? 'Approuvée' : 'En attente' }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Propriétaire -->
              <td class="px-4 py-3 hidden sm:table-cell">
                <span
                  class="text-sm"
                  :class="themeStore.darkMode ? 'text-onyx-300' : 'text-onyx-700'"
                >
                  {{ card.ownerName }}
                </span>
              </td>

              <!-- Modèle -->
              <td class="px-4 py-3 hidden md:table-cell">
                <span
                  class="text-xs"
                  :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
                >
                  {{ card.template }}
                </span>
              </td>

              <!-- Visibilité -->
              <td class="px-4 py-3">
                <span
                  class="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  :class="
                    card.visibility === 'public'
                      ? 'bg-blue-500/10 text-blue-500'
                      : themeStore.darkMode
                        ? 'bg-onyx-700 text-onyx-400'
                        : 'bg-powder-100 text-onyx-500'
                  "
                >
                  {{ card.visibility === 'public' ? 'Publique' : 'Privée' }}
                </span>
              </td>

              <!-- Vues -->
              <td class="px-4 py-3 hidden lg:table-cell">
                <div class="flex items-center space-x-1">
                  <Eye
                    class="w-3.5 h-3.5"
                    :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
                  />
                  <span :class="themeStore.darkMode ? 'text-onyx-300' : 'text-onyx-700'">{{
                    card.views
                  }}</span>
                </div>
              </td>

              <!-- Date -->
              <td class="px-4 py-3 hidden lg:table-cell">
                <span
                  class="text-xs"
                  :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
                >
                  {{ formatDate(card.createdAt) }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end space-x-1">
                  <!-- Approve (si pending) -->
                  <button
                    v-if="card.status === 'pending'"
                    @click="adminStore.approveCard(card.id)"
                    class="p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 transition-colors"
                    title="Approuver"
                  >
                    <CheckCircle class="w-4 h-4" />
                  </button>
                  <!-- Flag/Unflag -->
                  <button
                    @click="adminStore.flagCard(card.id)"
                    class="p-1.5 rounded-lg transition-colors"
                    :class="
                      card.flagged
                        ? 'text-red-500 hover:bg-red-500/10'
                        : themeStore.darkMode
                          ? 'text-onyx-400 hover:bg-onyx-700'
                          : 'text-onyx-400 hover:bg-powder-100'
                    "
                    :title="card.flagged ? 'Retirer le signalement' : 'Signaler'"
                  >
                    <Flag class="w-4 h-4" />
                  </button>
                  <!-- Delete -->
                  <button
                    @click="confirmDelete(card)"
                    class="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredCards.length === 0">
              <td
                colspan="7"
                class="px-4 py-12 text-center text-sm"
                :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
              >
                Aucune carte trouvée
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal suppression -->
    <div
      v-if="cardToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="cardToDelete = null"
    >
      <div
        class="w-full max-w-sm rounded-xl p-6 shadow-xl border"
        :class="themeStore.darkMode ? 'bg-onyx-800 border-onyx-700' : 'bg-white border-onyx-200'"
      >
        <h3
          class="font-semibold mb-2"
          :class="themeStore.darkMode ? 'text-white' : 'text-onyx-900'"
        >
          Supprimer la carte
        </h3>
        <p class="text-sm mb-4" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-600'">
          Supprimer définitivement <strong>"{{ cardToDelete.title }}"</strong> de
          {{ cardToDelete.ownerName }} ?
        </p>
        <div class="flex space-x-3">
          <button
            @click="cardToDelete = null"
            class="flex-1 px-4 py-2 rounded-lg border text-sm transition-colors"
            :class="
              themeStore.darkMode
                ? 'border-onyx-600 text-onyx-300 hover:bg-onyx-700'
                : 'border-onyx-200 text-onyx-700 hover:bg-powder-50'
            "
          >
            Annuler
          </button>
          <button
            @click="doDelete"
            class="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, CreditCard, Eye, Flag, CheckCircle, Trash2 } from 'lucide-vue-next'
import { useThemeStore } from '../../stores/themeStore'
import { useAdminStore } from '../../stores/adminStore'

const themeStore = useThemeStore()
const adminStore = useAdminStore()

const search = ref('')
const activeFilter = ref('all')
const cardToDelete = ref(null)

const filterOptions = computed(() => [
  { value: 'all', label: 'Toutes', count: 0 },
  { value: 'flagged', label: 'Signalées', count: adminStore.stats.flaggedCards },
  { value: 'pending', label: 'En attente', count: adminStore.stats.pendingCards },
  { value: 'public', label: 'Publiques', count: adminStore.stats.publicCards },
])

const filteredCards = computed(() => {
  return adminStore.cards.filter((c) => {
    const matchSearch =
      !search.value ||
      c.title.toLowerCase().includes(search.value.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(search.value.toLowerCase())
    const matchFilter =
      activeFilter.value === 'all' ||
      (activeFilter.value === 'flagged' && c.flagged) ||
      (activeFilter.value === 'pending' && c.status === 'pending') ||
      (activeFilter.value === 'public' && c.visibility === 'public')
    return matchSearch && matchFilter
  })
})

const confirmDelete = (card) => {
  cardToDelete.value = card
}
const doDelete = () => {
  if (cardToDelete.value) {
    adminStore.deleteCard(cardToDelete.value.id)
    cardToDelete.value = null
  }
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
</script>
