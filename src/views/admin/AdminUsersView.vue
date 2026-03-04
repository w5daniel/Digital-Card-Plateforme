<template>
  <div class="space-y-4">
    <!-- Header + Search -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="relative w-full sm:w-72">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-400'"
        />
        <input
          v-model="search"
          type="text"
          placeholder="Rechercher un utilisateur..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          :class="
            themeStore.darkMode
              ? 'bg-slate-800 border-slate-700 text-white placeholder-gray-500'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
          "
        />
      </div>
      <div class="flex items-center space-x-2">
        <select
          v-model="filterStatus"
          class="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          :class="
            themeStore.darkMode
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-gray-200 text-gray-900'
          "
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="blocked">Bloqués</option>
        </select>
        <select
          v-model="filterPlan"
          class="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          :class="
            themeStore.darkMode
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-gray-200 text-gray-900'
          "
        >
          <option value="">Tous les plans</option>
          <option value="premium">Premium</option>
          <option value="free">Gratuit</option>
        </select>
      </div>
    </div>

    <!-- Compteur -->
    <p class="text-xs" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">
      {{ filteredUsers.length }} utilisateur(s) trouvé(s)
    </p>

    <!-- Table -->
    <div
      class="rounded-xl border overflow-hidden"
      :class="themeStore.darkMode ? 'border-slate-700' : 'border-gray-200'"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr
              :class="
                themeStore.darkMode ? 'bg-slate-800 text-gray-400' : 'bg-gray-50 text-gray-500'
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
            :class="themeStore.darkMode ? 'divide-slate-700' : 'divide-gray-100'"
          >
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              :class="
                themeStore.darkMode
                  ? 'bg-slate-900 hover:bg-slate-800'
                  : 'bg-white hover:bg-gray-50'
              "
            >
              <!-- Avatar + nom + email -->
              <td class="px-4 py-3">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    :class="
                      user.status === 'blocked'
                        ? 'bg-gray-400'
                        : 'bg-gradient-to-br from-primary-500 to-secondary-500'
                    "
                  >
                    {{ user.name.charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <p
                      class="font-medium truncate"
                      :class="themeStore.darkMode ? 'text-white' : 'text-gray-900'"
                    >
                      {{ user.name }}
                    </p>
                    <p
                      class="text-xs truncate"
                      :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
                    >
                      {{ user.email }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Rôle -->
              <td class="px-4 py-3 hidden sm:table-cell">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                  :class="
                    user.role === 'admin'
                      ? 'bg-red-500/10 text-red-500'
                      : themeStore.darkMode
                        ? 'bg-slate-700 text-gray-300'
                        : 'bg-gray-100 text-gray-600'
                  "
                >
                  {{ user.role === 'admin' ? 'Admin' : 'User' }}
                </span>
              </td>

              <!-- Plan -->
              <td class="px-4 py-3 hidden md:table-cell">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  :class="
                    user.isPremium
                      ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                      : themeStore.darkMode
                        ? 'bg-slate-700 text-gray-400'
                        : 'bg-gray-100 text-gray-500'
                  "
                >
                  {{ user.isPremium ? 'Premium' : 'Gratuit' }}
                </span>
              </td>

              <!-- Statut -->
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  :class="
                    user.status === 'active'
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-red-500/10 text-red-500'
                  "
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="user.status === 'active' ? 'bg-green-500' : 'bg-red-500'"
                  />
                  <span>{{ user.status === 'active' ? 'Actif' : 'Bloqué' }}</span>
                </span>
              </td>

              <!-- Cartes -->
              <td class="px-4 py-3 hidden lg:table-cell">
                <span :class="themeStore.darkMode ? 'text-gray-300' : 'text-gray-700'">{{
                  user.cardCount
                }}</span>
              </td>

              <!-- Date -->
              <td class="px-4 py-3 hidden lg:table-cell">
                <span
                  class="text-xs"
                  :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
                >
                  {{ formatDate(user.createdAt) }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end space-x-1">
                  <!-- Toggle premium -->
                  <button
                    @click="adminStore.toggleUserPremium(user.id)"
                    class="p-1.5 rounded-lg transition-colors"
                    :class="
                      user.isPremium
                        ? 'text-yellow-500 hover:bg-yellow-500/10'
                        : themeStore.darkMode
                          ? 'text-gray-400 hover:bg-slate-700'
                          : 'text-gray-400 hover:bg-gray-100'
                    "
                    :title="user.isPremium ? 'Retirer Premium' : 'Attribuer Premium'"
                  >
                    <Star class="w-4 h-4" />
                  </button>

                  <!-- Block/Unblock -->
                  <button
                    @click="
                      user.status === 'active'
                        ? adminStore.blockUser(user.id)
                        : adminStore.unblockUser(user.id)
                    "
                    class="p-1.5 rounded-lg transition-colors"
                    :class="
                      user.status === 'blocked'
                        ? 'text-green-500 hover:bg-green-500/10'
                        : 'text-orange-500 hover:bg-orange-500/10'
                    "
                    :title="user.status === 'active' ? 'Bloquer' : 'Débloquer'"
                  >
                    <UserX v-if="user.status === 'active'" class="w-4 h-4" />
                    <UserCheck v-else class="w-4 h-4" />
                  </button>

                  <!-- Delete -->
                  <button
                    @click="confirmDelete(user)"
                    class="p-1.5 rounded-lg transition-colors text-red-500 hover:bg-red-500/10"
                    title="Supprimer"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-if="filteredUsers.length === 0">
              <td
                colspan="7"
                class="px-4 py-12 text-center text-sm"
                :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
              >
                Aucun utilisateur trouvé
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de confirmation suppression -->
    <div
      v-if="userToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="userToDelete = null"
    >
      <div
        class="w-full max-w-sm rounded-xl p-6 shadow-xl border"
        :class="themeStore.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'"
      >
        <h3
          class="font-semibold mb-2"
          :class="themeStore.darkMode ? 'text-white' : 'text-gray-900'"
        >
          Supprimer l'utilisateur
        </h3>
        <p class="text-sm mb-4" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-600'">
          Supprimer définitivement <strong>{{ userToDelete.name }}</strong> ? Cette action est
          irréversible.
        </p>
        <div class="flex space-x-3">
          <button
            @click="userToDelete = null"
            class="flex-1 px-4 py-2 rounded-lg border text-sm transition-colors"
            :class="
              themeStore.darkMode
                ? 'border-slate-600 text-gray-300 hover:bg-slate-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
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
import { Search, Star, UserX, UserCheck, Trash2 } from 'lucide-vue-next'
import { useThemeStore } from '../../stores/themeStore'
import { useAdminStore } from '../../stores/adminStore'

const themeStore = useThemeStore()
const adminStore = useAdminStore()

const search = ref('')
const filterStatus = ref('')
const filterPlan = ref('')
const userToDelete = ref(null)

const filteredUsers = computed(() => {
  return adminStore.users.filter((u) => {
    const matchSearch =
      !search.value ||
      u.name.toLowerCase().includes(search.value.toLowerCase()) ||
      u.email.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !filterStatus.value || u.status === filterStatus.value
    const matchPlan =
      !filterPlan.value || (filterPlan.value === 'premium' ? u.isPremium : !u.isPremium)
    return matchSearch && matchStatus && matchPlan
  })
})

const confirmDelete = (user) => {
  userToDelete.value = user
}

const doDelete = () => {
  if (userToDelete.value) {
    adminStore.deleteUser(userToDelete.value.id)
    userToDelete.value = null
  }
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
</script>
