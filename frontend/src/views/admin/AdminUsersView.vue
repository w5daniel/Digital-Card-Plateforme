<template>
  <div class="space-y-4">
    <!-- ── Header + Recherche + Filtres ── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="relative w-full sm:w-72">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
        <input
          v-model="search"
          type="text"
          placeholder="Rechercher un utilisateur..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-flame-500 bg-base-100 border-base-300 text-base-content placeholder:text-base-content/40"
        />
      </div>
      <div class="flex items-center space-x-2">
        <select
          v-model="filterStatus"
          class="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-flame-500 bg-base-100 border-base-300 text-base-content"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="blocked">Bloqués</option>
        </select>
        <select
          v-model="filterPlan"
          class="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-flame-500 bg-base-100 border-base-300 text-base-content"
        >
          <option value="">Tous les plans</option>
          <option value="premium">Premium</option>
          <option value="free">Gratuit</option>
        </select>
      </div>
    </div>

    <!-- Compteur -->
    <p class="text-xs text-base-content/40">
      {{ filteredUsers.length }} utilisateur(s) trouvé(s)
      <span v-if="filteredUsers.length !== adminStore.users.length">
        sur {{ adminStore.users.length }} au total
      </span>
    </p>

    <!-- ── Table des utilisateurs ── -->
    <div class="rounded-xl border overflow-hidden border-base-300">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-base-200 text-base-content/50">
              <th class="text-left px-4 py-3 font-medium">Utilisateur</th>
              <th class="text-left px-4 py-3 font-medium hidden sm:table-cell">Rôle</th>
              <th class="text-left px-4 py-3 font-medium hidden md:table-cell">Plan</th>
              <th class="text-left px-4 py-3 font-medium">Statut</th>
              <th class="text-left px-4 py-3 font-medium hidden lg:table-cell">Cartes</th>
              <th class="text-left px-4 py-3 font-medium hidden lg:table-cell">Inscrit le</th>
              <th class="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-base-300">
            <tr
              v-for="u in filteredUsers"
              :key="u.id"
              class="bg-base-100 hover:bg-base-200"
            >
              <!-- Avatar + nom + email -->
              <td class="px-4 py-3">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    :class="u.status === 'blocked' ? 'bg-base-content/40' : 'bg-primary'"
                  >
                    {{ u.name?.charAt(0)?.toUpperCase() || '?' }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium truncate text-base-content">{{ u.name }}</p>
                    <p class="text-xs truncate text-base-content/40">{{ u.email }}</p>
                  </div>
                </div>
              </td>

              <!-- Rôle -->
              <td class="px-4 py-3 hidden sm:table-cell">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                  :class="u.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-base-200 text-base-content/70'"
                >
                  {{ u.role === 'admin' ? 'Admin' : 'User' }}
                </span>
              </td>

              <!-- Plan -->
              <td class="px-4 py-3 hidden md:table-cell">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  :class="u.isPremium ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'bg-base-200 text-base-content/50'"
                >
                  {{ u.isPremium ? 'Premium' : 'Gratuit' }}
                </span>
              </td>

              <!-- Statut -->
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  :class="u.status === 'active' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-500'"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="u.status === 'active' ? 'bg-green-500' : 'bg-red-500'"
                  />
                  <span>{{ u.status === 'active' ? 'Actif' : 'Bloqué' }}</span>
                </span>
              </td>

              <!-- Nb cartes -->
              <td class="px-4 py-3 hidden lg:table-cell">
                <span class="text-base-content/80">{{ u.cardCount }}</span>
              </td>

              <!-- Date inscription -->
              <td class="px-4 py-3 hidden lg:table-cell">
                <span class="text-xs text-base-content/40">{{ formatDate(u.createdAt) }}</span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end space-x-1">
                  <!-- Toggle Premium -->
                  <button
                    @click="pendingAction = { type: u.isPremium ? 'remove-premium' : 'add-premium', user: u }"
                    :disabled="u.role === 'admin'"
                    class="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    :class="u.isPremium ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-base-content/40 hover:bg-base-200'"
                    :title="u.isPremium ? 'Retirer Premium' : 'Attribuer Premium'"
                  >
                    <Star class="w-4 h-4" />
                  </button>

                  <!-- Bloquer / Débloquer -->
                  <button
                    @click="pendingAction = { type: u.status === 'active' ? 'ban' : 'unban', user: u }"
                    :disabled="u.role === 'admin'"
                    class="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    :class="u.status === 'blocked' ? 'text-green-500 hover:bg-green-500/10' : 'text-orange-500 hover:bg-orange-500/10'"
                    :title="u.status === 'active' ? 'Bloquer' : 'Débloquer'"
                  >
                    <UserX v-if="u.status === 'active'" class="w-4 h-4" />
                    <UserCheck v-else class="w-4 h-4" />
                  </button>

                  <!-- Supprimer -->
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
              <td colspan="7" class="px-4 py-12 text-center text-sm text-base-content/40">
                {{
                  adminStore.users.length === 0
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
      <div class="w-full max-w-sm rounded-xl p-6 shadow-xl border bg-base-100 border-base-300">
        <h3 class="font-semibold mb-2 text-base-content">Supprimer l'utilisateur</h3>
        <p class="text-sm mb-1 text-base-content/50">
          Supprimer définitivement <strong>{{ userToDelete.name }}</strong> ?
        </p>
        <p class="text-xs mb-4 text-base-content/40">
          Ses {{ userToDelete.cardCount }} carte(s) seront également supprimées. Cette action est irréversible.
        </p>
        <div class="flex space-x-3">
          <button
            @click="userToDelete = null"
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

    <!-- ── Modal confirmation action (ban/unban/premium) ── -->
    <div
      v-if="pendingAction"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="pendingAction = null"
      @keydown.escape="pendingAction = null"
      tabindex="-1"
      ref="actionModalRef"
    >
      <div class="w-full max-w-sm rounded-xl p-6 shadow-xl border bg-base-100 border-base-300">
        <h3 class="font-semibold mb-2 text-base-content">{{ actionLabels[pendingAction.type].title }}</h3>
        <p class="text-sm mb-4 text-base-content/50">
          {{ actionLabels[pendingAction.type].message }}
          <strong>{{ pendingAction.user.name }}</strong> ?
        </p>
        <div class="flex space-x-3">
          <button
            @click="pendingAction = null"
            class="flex-1 px-4 py-2 rounded-lg border text-sm transition-colors border-base-300 text-base-content/80 hover:bg-base-200"
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
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { Search, Star, UserX, UserCheck, Trash2, CheckCircle } from 'lucide-vue-next'
import { useAdminStore } from '../../stores/adminStore'

const adminStore = useAdminStore()

onMounted(() => adminStore.loadUsers())

// ── Filtres locaux ────────────────────────────────────────────────────────
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
  toastTimer = setTimeout(() => { toast.value = null }, 2500)
}

watch(userToDelete, (v) => { if (v) nextTick(() => deleteModalRef.value?.focus()) })
watch(pendingAction, (v) => { if (v) nextTick(() => actionModalRef.value?.focus()) })

const actionLabels = {
  ban:            { title: "Bloquer l'utilisateur",  message: 'Bloquer le compte de',         btn: 'Bloquer',    btnClass: 'bg-orange-500 hover:bg-orange-600' },
  unban:          { title: "Débloquer l'utilisateur", message: 'Réactiver le compte de',        btn: 'Débloquer',  btnClass: 'bg-green-500 hover:bg-green-600' },
  'add-premium':  { title: 'Attribuer Premium',       message: 'Passer au plan Premium pour',  btn: 'Confirmer',  btnClass: 'bg-yellow-500 hover:bg-yellow-600' },
  'remove-premium': { title: 'Retirer Premium',       message: 'Retirer le plan Premium de',   btn: 'Retirer',    btnClass: 'bg-yellow-500 hover:bg-yellow-600' },
}

const filteredUsers = computed(() =>
  adminStore.users.filter((u) => {
    const q = search.value.toLowerCase()
    const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    const matchStatus = !filterStatus.value || u.status === filterStatus.value
    const matchPlan   = !filterPlan.value   || (filterPlan.value === 'premium' ? u.isPremium : !u.isPremium)
    return matchSearch && matchStatus && matchPlan
  }),
)

function confirmDelete(u) { userToDelete.value = u }

async function doDelete() {
  if (!userToDelete.value) return
  const name = userToDelete.value.name
  await adminStore.deleteUser(userToDelete.value.id)
  userToDelete.value = null
  showToast(`${name} a été supprimé`)
}

async function executeAction() {
  if (!pendingAction.value) return
  const { type, user } = pendingAction.value
  const toastMessages = {
    ban:              `${user.name} a été bloqué`,
    unban:            `${user.name} a été débloqué`,
    'add-premium':    `${user.name} est maintenant Premium`,
    'remove-premium': `Premium retiré pour ${user.name}`,
  }
  if (type === 'ban')                                     await adminStore.blockUser(user.id)
  else if (type === 'unban')                              await adminStore.unblockUser(user.id)
  else if (type === 'add-premium' || type === 'remove-premium') await adminStore.toggleUserPremium(user.id)
  pendingAction.value = null
  showToast(toastMessages[type])
}

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
</script>
