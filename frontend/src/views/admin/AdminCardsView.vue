<template>
  <div class="space-y-4">
    <!-- ── Filtres ── -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
        <input
          v-model="search"
          type="text"
          placeholder="Nom de carte, propriétaire..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-flame-500 bg-base-100 border-base-300 text-base-content placeholder:text-base-content/40"
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
              : 'border-base-300 text-base-content/50 hover:bg-base-200'
          "
        >
          {{ f.label }}
          <span v-if="f.count > 0" class="ml-1 px-1 py-0.5 rounded bg-white/20 text-[10px]">
            {{ f.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- Compteur + vues totales -->
    <p class="text-xs text-base-content/40">
      {{ filteredCards.length }} carte(s)
      <span v-if="filteredCards.length !== adminStore.cards.length">
        sur {{ adminStore.cards.length }} au total
      </span>
      — {{ totalViews.toLocaleString('fr-FR') }} vues cumulées
    </p>

    <!-- ── Table ── -->
    <div class="rounded-xl border overflow-hidden border-base-300">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-base-200 text-base-content/50">
              <th class="text-left px-4 py-3 font-medium">Carte</th>
              <th class="text-left px-4 py-3 font-medium hidden sm:table-cell">Propriétaire</th>
              <th class="text-left px-4 py-3 font-medium">Visibilité</th>
              <th class="text-left px-4 py-3 font-medium hidden lg:table-cell">Vues</th>
              <th class="text-left px-4 py-3 font-medium hidden lg:table-cell">Créée le</th>
              <th class="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-base-300">
            <tr
              v-for="card in filteredCards"
              :key="card.id"
              class="bg-base-100 hover:bg-base-200"
            >
              <!-- Nom + icône -->
              <td class="px-4 py-3">
                <div class="flex items-center space-x-2">
                  <CreditCard class="w-4 h-4 flex-shrink-0 text-base-content/40" />
                  <p class="font-medium truncate max-w-[140px] text-base-content">
                    {{ card.name || 'Sans titre' }}
                  </p>
                </div>
              </td>

              <!-- Propriétaire -->
              <td class="px-4 py-3 hidden sm:table-cell">
                <div class="min-w-0">
                  <p class="text-sm truncate text-base-content/80">{{ card.ownerName }}</p>
                  <p class="text-xs truncate text-base-content/40">{{ card.ownerEmail }}</p>
                </div>
              </td>

              <!-- Visibilité -->
              <td class="px-4 py-3">
                <span
                  class="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  :class="card.isPublic ? 'bg-blue-500/10 text-blue-500' : 'bg-base-200 text-base-content/50'"
                >
                  {{ card.isPublic ? 'Publique' : 'Privée' }}
                </span>
              </td>

              <!-- Vues -->
              <td class="px-4 py-3 hidden lg:table-cell">
                <div class="flex items-center space-x-1">
                  <Eye class="w-3.5 h-3.5 text-base-content/40" />
                  <span class="text-base-content/80">{{ card.views || 0 }}</span>
                </div>
              </td>

              <!-- Date -->
              <td class="px-4 py-3 hidden lg:table-cell">
                <span class="text-xs text-base-content/40">{{ formatDate(card.createdAt) }}</span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end space-x-1">
                  <button
                    @click="confirmDelete(card)"
                    class="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Supprimer la carte"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredCards.length === 0">
              <td colspan="6" class="px-4 py-12 text-center text-sm text-base-content/40">
                <p>
                  {{
                    adminStore.cards.length === 0
                      ? 'Aucune carte créée par les utilisateurs.'
                      : 'Aucune carte ne correspond aux filtres.'
                  }}
                </p>
                <button
                  v-if="adminStore.cards.length > 0 && (search || activeFilter !== 'all')"
                  @click="activeFilter = 'all'; search = ''"
                  class="mt-2 text-flame-500 hover:underline text-xs"
                >
                  Effacer les filtres
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Modal confirmation suppression ── -->
    <div
      v-if="cardToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="cardToDelete = null"
      @keydown.escape="cardToDelete = null"
      tabindex="-1"
      ref="deleteModalRef"
    >
      <div class="w-full max-w-sm rounded-xl p-6 shadow-xl border bg-base-100 border-base-300">
        <h3 class="font-semibold mb-2 text-base-content">Supprimer la carte</h3>
        <p class="text-sm mb-1 text-base-content/50">
          Supprimer définitivement
          <strong>"{{ cardToDelete.name || 'Sans titre' }}"</strong>
          de {{ cardToDelete.ownerName }} ?
        </p>
        <p class="text-xs mb-4 text-base-content/40">
          Cette action est irréversible. Le lien de partage sera désactivé.
        </p>
        <div class="flex space-x-3">
          <button
            @click="cardToDelete = null"
            class="flex-1 px-4 py-2 rounded-lg border text-sm transition-colors border-base-300 text-base-content/80 hover:bg-base-200"
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

    <!-- Toast notification -->
    <Transition name="toast">
      <div
        v-if="toast"
        class="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium bg-green-500 text-white"
      >
        <CheckCircle class="w-4 h-4 flex-shrink-0" />
        <span>{{ toast }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { Search, CreditCard, Eye, Trash2, CheckCircle } from 'lucide-vue-next'
import { useAdminStore } from '../../stores/adminStore'

const adminStore = useAdminStore()

onMounted(() => adminStore.loadCards())

const search = ref('')
const activeFilter = ref('all')
const cardToDelete = ref(null)
const deleteModalRef = ref(null)
const toast = ref(null)
let toastTimer = null

function showToast(msg) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = msg
  toastTimer = setTimeout(() => { toast.value = null }, 2500)
}

watch(cardToDelete, (v) => { if (v) nextTick(() => deleteModalRef.value?.focus()) })

const totalViews = computed(() => adminStore.cards.reduce((s, c) => s + (c.views || 0), 0))

const filterOptions = computed(() => [
  { value: 'all',     label: 'Toutes',    count: adminStore.cards.length },
  { value: 'public',  label: 'Publiques', count: adminStore.cards.filter(c => c.isPublic).length },
  { value: 'private', label: 'Privées',   count: adminStore.cards.filter(c => !c.isPublic).length },
])

const filteredCards = computed(() =>
  adminStore.cards.filter((c) => {
    const q = search.value.toLowerCase()
    const matchSearch =
      !q ||
      (c.name || '').toLowerCase().includes(q) ||
      (c.ownerName || '').toLowerCase().includes(q) ||
      (c.ownerEmail || '').toLowerCase().includes(q)
    const matchFilter =
      activeFilter.value === 'all' ||
      (activeFilter.value === 'public' && c.isPublic) ||
      (activeFilter.value === 'private' && !c.isPublic)
    return matchSearch && matchFilter
  }),
)

function confirmDelete(card) { cardToDelete.value = card }

async function doDelete() {
  if (!cardToDelete.value) return
  const name = cardToDelete.value.name || 'Sans titre'
  await adminStore.deleteCard(cardToDelete.value.id)
  cardToDelete.value = null
  showToast(`"${name}" supprimée`)
}

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
</script>
