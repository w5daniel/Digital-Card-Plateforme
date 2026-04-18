<template>
  <div class="space-y-4">
    <!--
      TODO backend : cette vue lira ses données via GET /api/admin/users
        → pagination côté serveur (éviter de charger 100 000 utilisateurs d'un coup)
        → filtres envoyés en query params : ?search=&status=&plan=&page=1&limit=50
        → tri configurable : ?sort=createdAt&order=desc
        → réponse : { data: User[], total: number, page: number, pages: number }
      Pour l'instant : toutes les opérations sont synchrones et locales (localStorage).
    -->

    <!-- ── Header + Recherche + Filtres ── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="relative w-full sm:w-72">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
        />
        <input
          v-model="search"
          type="text"
          placeholder="Rechercher un utilisateur..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-flame-500"
          :class="
            themeStore.darkMode
              ? 'bg-onyx-800 border-onyx-700 text-white placeholder-onyx-500'
              : 'bg-powder-50 border-powder-200 text-onyx-900 placeholder-onyx-400'
          "
        />
      </div>
      <div class="flex items-center space-x-2">
        <!--
          TODO backend : ces filtres seront envoyés au serveur en query params
            plutôt que filtrés côté client sur la liste complète
        -->
        <select
          v-model="filterStatus"
          class="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-flame-500"
          :class="
            themeStore.darkMode
              ? 'bg-onyx-800 border-onyx-700 text-white'
              : 'bg-powder-50 border-powder-200 text-onyx-900'
          "
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="blocked">Bloqués</option>
        </select>
        <select
          v-model="filterPlan"
          class="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-flame-500"
          :class="
            themeStore.darkMode
              ? 'bg-onyx-800 border-onyx-700 text-white'
              : 'bg-powder-50 border-powder-200 text-onyx-900'
          "
        >
          <option value="">Tous les plans</option>
          <option value="premium">Premium</option>
          <option value="free">Gratuit</option>
        </select>
      </div>
    </div>

    <!-- Compteur -->
    <p class="text-xs" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">
      {{ filteredUsers.length }} utilisateur(s) trouvé(s)
      <span v-if="filteredUsers.length !== authStore.getAllUsersWithStats.length">
        sur {{ authStore.getAllUsersWithStats.length }} au total
      </span>
      <!--
        TODO backend : afficher ici la pagination :
          "Page X / Y — N utilisateurs au total"
          + boutons Précédent / Suivant
      -->
    </p>

    <!-- ── Table des utilisateurs ── -->
    <!--
      Source de données : authStore.getAllUsersWithStats (computed réactif sur allUsers[])
      TODO backend : remplacer par les données paginées du serveur
        → GET /api/admin/users avec les query params de filtrage
        → cardCount vient du COUNT() SQL (pas besoin de lire localStorage)
    -->
    <div
      class="rounded-xl border overflow-hidden"
      :class="themeStore.darkMode ? 'border-onyx-700' : 'border-powder-200'"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr
              :class="
                themeStore.darkMode ? 'bg-onyx-800 text-onyx-400' : 'bg-powder-50 text-onyx-500'
              "
            >
              <th class="text-left px-4 py-3 font-medium">Utilisateur</th>
              <th class="text-left px-4 py-3 font-medium hidden sm:table-cell">Rôle</th>
              <th class="text-left px-4 py-3 font-medium hidden md:table-cell">Plan</th>
              <th class="text-left px-4 py-3 font-medium">Statut</th>
              <th class="text-left px-4 py-3 font-medium hidden lg:table-cell">Cartes</th>
              <th class="text-left px-4 py-3 font-medium hidden lg:table-cell">Inscrit le</th>
              <th class="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody
            class="divide-y"
            :class="themeStore.darkMode ? 'divide-onyx-700' : 'divide-powder-100'"
          >
            <tr
              v-for="u in filteredUsers"
              :key="u.id"
              :class="
                themeStore.darkMode
                  ? 'bg-onyx-950 hover:bg-onyx-800'
                  : 'bg-powder-50 hover:bg-powder-100'
              "
            >
              <!-- Avatar + nom + email -->
              <td class="px-4 py-3">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    :class="u.status === 'blocked' ? 'bg-onyx-400' : 'bg-flame-500'"
                  >
                    {{ u.name?.charAt(0)?.toUpperCase() || '?' }}
                  </div>
                  <div class="min-w-0">
                    <p
                      class="font-medium truncate"
                      :class="themeStore.darkMode ? 'text-white' : 'text-onyx-900'"
                    >
                      {{ u.name }}
                    </p>
                    <p
                      class="text-xs truncate"
                      :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
                    >
                      {{ u.email }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Rôle -->
              <td class="px-4 py-3 hidden sm:table-cell">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                  :class="
                    u.role === 'admin'
                      ? 'bg-red-500/10 text-red-500'
                      : themeStore.darkMode
                        ? 'bg-onyx-700 text-onyx-300'
                        : 'bg-powder-100 text-onyx-600'
                  "
                >
                  {{ u.role === 'admin' ? 'Admin' : 'User' }}
                </span>
              </td>

              <!-- Plan -->
              <td class="px-4 py-3 hidden md:table-cell">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  :class="
                    u.isPremium
                      ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                      : themeStore.darkMode
                        ? 'bg-onyx-700 text-onyx-400'
                        : 'bg-powder-100 text-onyx-500'
                  "
                >
                  {{ u.isPremium ? 'Premium' : 'Gratuit' }}
                </span>
              </td>

              <!-- Statut -->
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  :class="
                    u.status === 'active'
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-red-500/10 text-red-500'
                  "
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="u.status === 'active' ? 'bg-green-500' : 'bg-red-500'"
                  />
                  <span>{{ u.status === 'active' ? 'Actif' : 'Bloqué' }}</span>
                </span>
              </td>

              <!-- Nb cartes -->
              <!--
                TODO backend : cardCount vient du COUNT() SQL dans la réponse serveur.
                Pour l'instant : lu depuis localStorage digitalcard_userCards_{email}
                dans authStore.getAllUsersWithStats (computed).
              -->
              <td class="px-4 py-3 hidden lg:table-cell">
                <span :class="themeStore.darkMode ? 'text-onyx-300' : 'text-onyx-700'">
                  {{ u.cardCount }}
                </span>
              </td>

              <!-- Date inscription -->
              <td class="px-4 py-3 hidden lg:table-cell">
                <span
                  class="text-xs"
                  :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
                >
                  {{ formatDate(u.createdAt) }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end space-x-1">
                  <!--
                    Toggle Premium.
                    TODO backend : PATCH /api/admin/users/:id/premium
                      → mettre à jour is_premium + premium_until en DB
                      → si vrai Stripe actif : gérer abonnement
                      → logguer dans admin_audit_log
                  -->
                  <button
                    @click="
                      pendingAction = {
                        type: u.isPremium ? 'remove-premium' : 'add-premium',
                        user: u,
                      }
                    "
                    :disabled="u.role === 'admin'"
                    class="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    :class="
                      u.isPremium
                        ? 'text-yellow-500 hover:bg-yellow-500/10'
                        : themeStore.darkMode
                          ? 'text-onyx-400 hover:bg-onyx-700'
                          : 'text-onyx-400 hover:bg-powder-100'
                    "
                    :title="u.isPremium ? 'Retirer Premium' : 'Attribuer Premium'"
                  >
                    <Star class="w-4 h-4" />
                  </button>

                  <!--
                    Bloquer / Débloquer.
                    TODO backend : PATCH /api/admin/users/:id { status }
                      → invalider tous les tokens actifs de cet utilisateur
                      → l'utilisateur est déconnecté à sa prochaine requête
                      → logguer dans admin_audit_log
                  -->
                  <button
                    @click="
                      pendingAction = {
                        type: u.status === 'active' ? 'ban' : 'unban',
                        user: u,
                      }
                    "
                    :disabled="u.role === 'admin'"
                    class="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    :class="
                      u.status === 'blocked'
                        ? 'text-green-500 hover:bg-green-500/10'
                        : 'text-orange-500 hover:bg-orange-500/10'
                    "
                    :title="u.status === 'active' ? 'Bloquer' : 'Débloquer'"
                  >
                    <UserX v-if="u.status === 'active'" class="w-4 h-4" />
                    <UserCheck v-else class="w-4 h-4" />
                  </button>

                  <!--
                    Supprimer.
                    TODO backend : DELETE /api/admin/users/:id
                      → soft-delete + anonymisation RGPD
                      → CASCADE sur cards, sessions, abonnements
                      → email de confirmation à l'utilisateur
                  -->
                  <button
                    @click="confirmDelete(u)"
                    :disabled="u.role === 'admin'"
                    class="p-1.5 rounded-lg transition-colors text-red-500 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Supprimer l'utilisateur"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- État vide -->
            <tr v-if="filteredUsers.length === 0">
              <td
                colspan="7"
                class="px-4 py-12 text-center text-sm"
                :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
              >
                {{
                  authStore.getAllUsersWithStats.length === 0
                    ? 'Aucun utilisateur inscrit pour le moment.'
                    : 'Aucun utilisateur ne correspond aux filtres.'
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Modal confirmation suppression ── -->
    <div
      v-if="userToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="userToDelete = null"
      @keydown.escape="userToDelete = null"
      tabindex="-1"
      ref="deleteModalRef"
    >
      <div
        class="w-full max-w-sm rounded-xl p-6 shadow-xl border"
        :class="
          themeStore.darkMode ? 'bg-onyx-800 border-onyx-700' : 'bg-powder-50 border-powder-200'
        "
      >
        <h3
          class="font-semibold mb-2"
          :class="themeStore.darkMode ? 'text-white' : 'text-onyx-900'"
        >
          Supprimer l'utilisateur
        </h3>
        <p class="text-sm mb-1" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-600'">
          Supprimer définitivement <strong>{{ userToDelete.name }}</strong> ?
        </p>
        <p class="text-xs mb-4" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">
          Ses {{ userToDelete.cardCount }} carte(s) seront également supprimées. Cette action est
          irréversible.
          <!--
            TODO backend : ajouter un avertissement si l'abonnement Stripe est actif
            (récupéré depuis GET /api/admin/users/:id/subscription)
          -->
        </p>
        <div class="flex space-x-3">
          <button
            @click="userToDelete = null"
            class="flex-1 px-4 py-2 rounded-lg border text-sm transition-colors"
            :class="
              themeStore.darkMode
                ? 'border-onyx-600 text-onyx-300 hover:bg-onyx-700'
                : 'border-powder-200 text-onyx-700 hover:bg-powder-100'
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
    <!-- ── Modal confirmation action (ban/unban/premium) ── -->
    <div
      v-if="pendingAction"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="pendingAction = null"
      @keydown.escape="pendingAction = null"
      tabindex="-1"
      ref="actionModalRef"
    >
      <div
        class="w-full max-w-sm rounded-xl p-6 shadow-xl border"
        :class="
          themeStore.darkMode ? 'bg-onyx-800 border-onyx-700' : 'bg-powder-50 border-powder-200'
        "
      >
        <h3
          class="font-semibold mb-2"
          :class="themeStore.darkMode ? 'text-white' : 'text-onyx-900'"
        >
          {{ actionLabels[pendingAction.type].title }}
        </h3>
        <p class="text-sm mb-4" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-600'">
          {{ actionLabels[pendingAction.type].message }}
          <strong>{{ pendingAction.user.name }}</strong> ?
        </p>
        <div class="flex space-x-3">
          <button
            @click="pendingAction = null"
            class="flex-1 px-4 py-2 rounded-lg border text-sm transition-colors"
            :class="
              themeStore.darkMode
                ? 'border-onyx-600 text-onyx-300 hover:bg-onyx-700'
                : 'border-powder-200 text-onyx-700 hover:bg-powder-100'
            "
          >
            Annuler
          </button>
          <button
            @click="executeAction"
            class="flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
            :class="actionLabels[pendingAction.type].btnClass"
          >
            {{ actionLabels[pendingAction.type].btn }}
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
import { Search, Star, UserX, UserCheck, Trash2, CheckCircle } from 'lucide-vue-next'
import { useThemeStore } from '../../stores/themeStore'
import { useAuthStore } from '../../stores/authStore'

const themeStore = useThemeStore()

/*
 * Source de données : authStore.getAllUsersWithStats
 *
 * Avant backend :
 *   - alimenté par digitalcard_allUsers (localStorage)
 *   - écrit à chaque login / register / upgradeToPremium
 *   - cardCount lu depuis digitalcard_userCards_{email}
 *
 * Après backend :
 *   - remplacer getAllUsersWithStats par un appel API paginé
 *   - ajouter un state `page`, `totalPages`, `isLoading` pour la pagination
 *   - les filtres search/status/plan passent en query params serveur
 */
const authStore = useAuthStore()

// ── Filtres locaux ────────────────────────────────────────────────────────
// TODO backend : envoyer ces valeurs en query params au serveur (filtrage côté SQL)
const search = ref('')
const filterStatus = ref('')
const filterPlan = ref('')
const userToDelete = ref(null)
const pendingAction = ref(null)
const deleteModalRef = ref(null)
const actionModalRef = ref(null)
const toast = ref(null)
let toastTimer = null

function showToast(msg) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = msg
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 2500)
}

// Auto-focus modals for Escape key
watch(userToDelete, (v) => {
  if (v) nextTick(() => deleteModalRef.value?.focus())
})
watch(pendingAction, (v) => {
  if (v) nextTick(() => actionModalRef.value?.focus())
})

const actionLabels = {
  ban: {
    title: "Bloquer l'utilisateur",
    message: 'Bloquer le compte de',
    btn: 'Bloquer',
    btnClass: 'bg-orange-500 hover:bg-orange-600',
  },
  unban: {
    title: "Débloquer l'utilisateur",
    message: 'Réactiver le compte de',
    btn: 'Débloquer',
    btnClass: 'bg-green-500 hover:bg-green-600',
  },
  'add-premium': {
    title: 'Attribuer Premium',
    message: 'Passer au plan Premium pour',
    btn: 'Confirmer',
    btnClass: 'bg-yellow-500 hover:bg-yellow-600',
  },
  'remove-premium': {
    title: 'Retirer Premium',
    message: 'Retirer le plan Premium de',
    btn: 'Retirer',
    btnClass: 'bg-yellow-500 hover:bg-yellow-600',
  },
}

// ── Liste filtrée ─────────────────────────────────────────────────────────
// TODO backend : la liste entière vient du serveur déjà filtrée/paginée.
//   Ce computed local disparaît au profit d'un simple `authStore.users` (ref réactive).
const filteredUsers = computed(() => {
  return authStore.getAllUsersWithStats.filter((u) => {
    const q = search.value.toLowerCase()
    const matchSearch =
      !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    const matchStatus = !filterStatus.value || u.status === filterStatus.value
    const matchPlan =
      !filterPlan.value || (filterPlan.value === 'premium' ? u.isPremium : !u.isPremium)
    return matchSearch && matchStatus && matchPlan
  })
})

// ── Actions ───────────────────────────────────────────────────────────────
function confirmDelete(u) {
  userToDelete.value = u
}

function doDelete() {
  if (!userToDelete.value) return
  const name = userToDelete.value.name
  authStore.adminDeleteUser(userToDelete.value.id)
  userToDelete.value = null
  showToast(`${name} a été supprimé`)
}

function executeAction() {
  if (!pendingAction.value) return
  const { type, user } = pendingAction.value
  const toastMessages = { ban: `${user.name} a été bloqué`, unban: `${user.name} a été débloqué`, 'add-premium': `${user.name} est maintenant Premium`, 'remove-premium': `Premium retiré pour ${user.name}` }
  if (type === 'ban') authStore.adminBanUser(user.id)
  else if (type === 'unban') authStore.adminUnbanUser(user.id)
  else if (type === 'add-premium' || type === 'remove-premium')
    authStore.adminTogglePremium(user.id)
  pendingAction.value = null
  showToast(toastMessages[type])
}

// ── Formatage date ────────────────────────────────────────────────────────
const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
</script>
