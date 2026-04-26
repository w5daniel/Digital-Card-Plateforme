<template>
  <div class="space-y-4">
    <!--
      TODO backend : cette vue lira ses données via GET /api/admin/cards
        → pagination côté serveur (ne pas charger toutes les cartes en mémoire)
        → filtres en query params : ?search=&visibility=&sort=createdAt&page=1&limit=50
        → réponse : { data: Card[], total: number, page: number, pages: number }
      Pour l'instant : scan de tous les localStorage digitalcard_userCards_{email}
        via cardsStore.getAllCardsAdmin() — synchrone, sans pagination.
    -->

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
    <!--
      TODO backend : le total et les vues globales viennent du serveur :
        SELECT COUNT(*) AS total, SUM(views) AS total_views FROM cards WHERE deleted_at IS NULL
    -->
    <p class="text-xs text-base-content/40">
      {{ filteredCards.length }} carte(s)
      <span v-if="filteredCards.length !== allCards.length">
        sur {{ allCards.length }} au total
      </span>
      — {{ totalViews.toLocaleString('fr-FR') }} vues cumulées
    </p>

    <!-- ── Table ── -->
    <div
      class="rounded-xl border overflow-hidden border-base-300"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr
              class="bg-base-200 text-base-content/50"
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
            class="divide-y divide-base-300"
          >
            <tr
              v-for="card in filteredCards"
              :key="card.id"
              class="bg-base-100 hover:bg-base-200"
            >
              <!-- Nom + icône -->
              <td class="px-4 py-3">
                <div class="flex items-center space-x-2">
                  <CreditCard
                    class="w-4 h-4 flex-shrink-0 text-base-content/40"
                  />
                  <p
                    class="font-medium truncate max-w-[140px] text-base-content"
                  >
                    {{ card.name || 'Sans titre' }}
                  </p>
                </div>
              </td>

              <!-- Propriétaire -->
              <!--
                TODO backend : ownerName + ownerEmail viennent du JOIN users côté SQL
              -->
              <td class="px-4 py-3 hidden sm:table-cell">
                <div class="min-w-0">
                  <p
                    class="text-sm truncate text-base-content/80"
                  >
                    {{ card.ownerName }}
                  </p>
                  <p
                    class="text-xs truncate text-base-content/40"
                  >
                    {{ card.ownerEmail }}
                  </p>
                </div>
              </td>

              <!-- Modèle -->
              <td class="px-4 py-3 hidden md:table-cell">
                <span
                  class="text-xs text-base-content/40"
                >
                  {{ card.template || '—' }}
                </span>
              </td>

              <!-- Visibilité -->
              <!--
                TODO backend : is_public vient directement du champ `cards.is_public`
              -->
              <td class="px-4 py-3">
                <span
                  class="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  :class="
                    card.isPublic
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-base-200 text-base-content/50'
                  "
                >
                  {{ card.isPublic ? 'Publique' : 'Privée' }}
                </span>
              </td>

              <!-- Vues -->
              <!--
                TODO backend : views vient de la table `card_views` (COUNT ou colonne dénormalisée)
              -->
              <td class="px-4 py-3 hidden lg:table-cell">
                <div class="flex items-center space-x-1">
                  <Eye
                    class="w-3.5 h-3.5 text-base-content/40"
                  />
                  <span class="text-base-content/80">
                    {{ card.views || 0 }}
                  </span>
                </div>
              </td>

              <!-- Date -->
              <td class="px-4 py-3 hidden lg:table-cell">
                <span
                  class="text-xs text-base-content/40"
                >
                  {{ formatDate(card.createdAt) }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end space-x-1">
                  <!--
                    Toggle visibilité Public / Privé.
                    TODO backend : PATCH /api/admin/cards/:id { isPublic }
                      → UPDATE cards SET is_public=?, updated_at=NOW() WHERE id=:id
                      → si passage à privé : retirer de la CDN / galerie communauté
                      → logguer dans admin_audit_log
                  -->
                  <button
                    @click="cardToToggle = card"
                    class="p-1.5 rounded-lg transition-colors"
                    :class="
                      card.isPublic
                        ? 'text-blue-500 hover:bg-blue-500/10'
                        : 'text-base-content/40 hover:bg-base-200'
                    "
                    :title="card.isPublic ? 'Rendre privée' : 'Rendre publique'"
                  >
                    <Globe v-if="card.isPublic" class="w-4 h-4" />
                    <Lock v-else class="w-4 h-4" />
                  </button>

                  <!--
                    Supprimer.
                    TODO backend : DELETE /api/admin/cards/:id
                      → soft-delete : UPDATE cards SET deleted_at=NOW()
                      → retirer snapshot public (CDN / cache)
                      → logguer dans admin_audit_log
                      → notifier le propriétaire par email (optionnel)
                  -->
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
              <td
                colspan="7"
                class="px-4 py-12 text-center text-sm"
                class="text-base-content/40"
              >
                <p>
                  {{
                    allCards.length === 0
                      ? 'Aucune carte créée par les utilisateurs.'
                      : 'Aucune carte ne correspond aux filtres.'
                  }}
                </p>
                <button
                  v-if="allCards.length > 0 && (search || activeFilter !== 'all')"
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
      <div
        class="w-full max-w-sm rounded-xl p-6 shadow-xl border"
        class="bg-base-100 border-base-300"
      >
        <h3 class="font-semibold mb-2 text-base-content">
          Supprimer la carte
        </h3>
        <p class="text-sm mb-1 text-base-content/50">
          Supprimer définitivement
          <strong>"{{ cardToDelete.name || 'Sans titre' }}"</strong>
          de {{ cardToDelete.ownerName }} ?
        </p>
        <p class="text-xs mb-4 text-base-content/40">
          Cette action est irréversible. Le lien de partage sera désactivé.
          <!--
            TODO backend : ajouter un avertissement si la carte est liée à un QR code imprimé
            (flag `has_been_shared` ou compteur qrScans > 0)
          -->
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
    <!-- ── Modal confirmation visibilité ── -->
    <div
      v-if="cardToToggle"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="cardToToggle = null"
      @keydown.escape="cardToToggle = null"
      tabindex="-1"
      ref="toggleModalRef"
    >
      <div
        class="w-full max-w-sm rounded-xl p-6 shadow-xl border"
        class="bg-base-100 border-base-300"
      >
        <h3 class="font-semibold mb-2 text-base-content">
          {{ cardToToggle.isPublic ? 'Rendre privée' : 'Rendre publique' }}
        </h3>
        <p class="text-sm mb-4 text-base-content/50">
          {{
            cardToToggle.isPublic
              ? 'Retirer de la galerie communauté'
              : 'Publier dans la galerie communauté'
          }}
          la carte <strong>"{{ cardToToggle.name || 'Sans titre' }}"</strong> de
          {{ cardToToggle.ownerName }} ?
        </p>
        <div class="flex space-x-3">
          <button
            @click="cardToToggle = null"
            class="flex-1 px-4 py-2 rounded-lg border text-sm transition-colors border-base-300 text-base-content/80 hover:bg-base-200"
          >
            Annuler
          </button>
          <button
            @click="doToggle"
            class="flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
            :class="
              cardToToggle.isPublic
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-blue-500 hover:bg-blue-600'
            "
          >
            {{ cardToToggle.isPublic ? 'Rendre privée' : 'Rendre publique' }}
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
import { ref, computed, watch, nextTick } from 'vue'
import { Search, CreditCard, Eye, Globe, Lock, Trash2, CheckCircle } from 'lucide-vue-next'
import { useThemeStore } from '../../stores/themeStore'
import { useCardsStore } from '../../stores/cards'

const themeStore = useThemeStore()

/*
 * Source de données : cardsStore.getAllCardsAdmin()
 *
 * Avant backend :
 *   - Scanne tous les localStorage digitalcard_userCards_{email} des utilisateurs inscrits
 *   - Enrichit avec ownerName + ownerEmail depuis authStore.getAllUsersWithStats
 *   - Réactif via adminCardsVersion (compteur incrémenté après chaque mutation admin)
 *
 * Après backend :
 *   - Remplacer par GET /api/admin/cards (paginé, filtré côté serveur)
 *   - Ajouter state page + totalPages pour la pagination
 */
const cardsStore = useCardsStore()

const search = ref('')
const activeFilter = ref('all')
const cardToDelete = ref(null)
const cardToToggle = ref(null)
const deleteModalRef = ref(null)
const toggleModalRef = ref(null)
const toast = ref(null)
let toastTimer = null

function showToast(msg) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = msg
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 2500)
}

watch(cardToDelete, (v) => {
  if (v) nextTick(() => deleteModalRef.value?.focus())
})
watch(cardToToggle, (v) => {
  if (v) nextTick(() => toggleModalRef.value?.focus())
})

// Liste complète — dépend de adminCardsVersion + authStore.allUsers (réactif automatiquement)
// TODO backend : remplacé par un ref alimenté par l'API (GET /api/admin/cards)
const allCards = computed(() => cardsStore.getAllCardsAdmin())

const publicCount = computed(() => allCards.value.filter((c) => c.isPublic).length)
const privateCount = computed(() => allCards.value.filter((c) => !c.isPublic).length)
const totalViews = computed(() => allCards.value.reduce((s, c) => s + (c.views || 0), 0))

const filterOptions = computed(() => [
  { value: 'all', label: 'Toutes', count: allCards.value.length },
  { value: 'public', label: 'Publiques', count: publicCount.value },
  { value: 'private', label: 'Privées', count: privateCount.value },
])

// TODO backend : filtrage côté serveur via query params
const filteredCards = computed(() => {
  return allCards.value.filter((c) => {
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
  })
})

function confirmDelete(card) {
  cardToDelete.value = card
}

function doDelete() {
  if (!cardToDelete.value) return
  const name = cardToDelete.value.name || 'Sans titre'
  cardsStore.adminDeleteCard(cardToDelete.value.id, cardToDelete.value.ownerEmail)
  cardToDelete.value = null
  showToast(`"${name}" supprimée`)
}

function doToggle() {
  if (!cardToToggle.value) return
  const wasPublic = cardToToggle.value.isPublic
  const name = cardToToggle.value.name || 'Sans titre'
  cardsStore.adminToggleCardVisibility(cardToToggle.value.id, cardToToggle.value.ownerEmail)
  cardToToggle.value = null
  showToast(wasPublic ? `"${name}" est maintenant privée` : `"${name}" est maintenant publique`)
}

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
</script>
