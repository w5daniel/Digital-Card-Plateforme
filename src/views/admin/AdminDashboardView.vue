<template>
  <div class="space-y-6">
    <!-- KPI Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="kpi in kpis"
        :key="kpi.label"
        class="rounded-xl p-4 border transition-all hover:shadow-md"
        :class="themeStore.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-onyx-200'"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs font-medium mb-1"
              :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
            >
              {{ kpi.label }}
            </p>
            <p
              class="text-2xl font-bold"
              :class="themeStore.darkMode ? 'text-white' : 'text-onyx-900'"
            >
              {{ kpi.value }}
            </p>
            <p class="text-xs mt-1" :class="kpi.subColor">{{ kpi.sub }}</p>
          </div>
          <div class="p-2 rounded-lg" :class="kpi.iconBg">
            <component :is="kpi.icon" class="w-5 h-5" :class="kpi.iconColor" />
          </div>
        </div>
      </div>
    </div>

    <!-- Ligne du bas : activité récente + top stats -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Activité récente -->
      <div
        class="lg:col-span-2 rounded-xl border"
        :class="themeStore.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-onyx-200'"
      >
        <div
          class="flex items-center justify-between px-5 py-4 border-b"
          :class="themeStore.darkMode ? 'border-slate-700' : 'border-onyx-200'"
        >
          <h2
            class="font-semibold text-sm"
            :class="themeStore.darkMode ? 'text-white' : 'text-onyx-900'"
          >
            Activité récente
          </h2>
          <span class="text-xs" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">
            Derniers événements
          </span>
        </div>
        <ul class="divide-y" :class="themeStore.darkMode ? 'divide-slate-700' : 'divide-gray-100'">
          <li
            v-for="(item, i) in adminStore.recentActivity"
            :key="i"
            class="flex items-start space-x-3 px-5 py-3"
          >
            <div class="mt-0.5 flex-shrink-0">
              <Users v-if="item.type === 'user'" class="w-4 h-4 text-blue-500" />
              <Flag v-else-if="item.type === 'flag'" class="w-4 h-4 text-red-500" />
              <CreditCard v-else class="w-4 h-4 text-green-500" />
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-sm truncate"
                :class="themeStore.darkMode ? 'text-onyx-300' : 'text-onyx-700'"
              >
                {{ item.label }}
              </p>
              <p class="text-xs" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">
                {{ formatDate(item.time) }}
              </p>
            </div>
          </li>
          <li
            v-if="adminStore.recentActivity.length === 0"
            class="px-5 py-8 text-center text-sm"
            :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
          >
            Aucune activité récente
          </li>
        </ul>
      </div>

      <!-- Stats rapides -->
      <div class="space-y-4">
        <!-- Users par plan -->
        <div
          class="rounded-xl border p-4"
          :class="
            themeStore.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-onyx-200'
          "
        >
          <h3
            class="text-sm font-semibold mb-3"
            :class="themeStore.darkMode ? 'text-white' : 'text-onyx-900'"
          >
            Répartition utilisateurs
          </h3>
          <div class="space-y-2">
            <div class="flex justify-between items-center text-sm">
              <span :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-600'"
                >Plan gratuit</span
              >
              <span
                class="font-medium"
                :class="themeStore.darkMode ? 'text-white' : 'text-onyx-900'"
              >
                {{ adminStore.stats.totalUsers - adminStore.stats.premiumUsers }}
              </span>
            </div>
            <div
              class="w-full h-1.5 rounded-full"
              :class="themeStore.darkMode ? 'bg-slate-700' : 'bg-gray-100'"
            >
              <div
                class="h-1.5 rounded-full bg-gray-400"
                :style="{
                  width: `${((adminStore.stats.totalUsers - adminStore.stats.premiumUsers) / adminStore.stats.totalUsers) * 100}%`,
                }"
              />
            </div>
            <div class="flex justify-between items-center text-sm">
              <span :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-600'"
                >Plan premium</span
              >
              <span class="font-medium text-primary-500">{{ adminStore.stats.premiumUsers }}</span>
            </div>
            <div
              class="w-full h-1.5 rounded-full"
              :class="themeStore.darkMode ? 'bg-slate-700' : 'bg-gray-100'"
            >
              <div
                class="h-1.5 rounded-full bg-primary-500"
                :style="{
                  width: `${(adminStore.stats.premiumUsers / adminStore.stats.totalUsers) * 100}%`,
                }"
              />
            </div>
          </div>
        </div>

        <!-- Alertes -->
        <div
          class="rounded-xl border p-4"
          :class="
            themeStore.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-onyx-200'
          "
        >
          <h3
            class="text-sm font-semibold mb-3"
            :class="themeStore.darkMode ? 'text-white' : 'text-onyx-900'"
          >
            Alertes
          </h3>
          <div class="space-y-2">
            <router-link
              v-if="adminStore.stats.flaggedCards > 0"
              to="/admin/cards"
              class="flex items-center space-x-2 text-xs p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <AlertTriangle class="w-3.5 h-3.5 flex-shrink-0" />
              <span>{{ adminStore.stats.flaggedCards }} carte(s) signalée(s)</span>
            </router-link>
            <router-link
              v-if="adminStore.stats.blockedUsers > 0"
              to="/admin/users"
              class="flex items-center space-x-2 text-xs p-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors"
            >
              <UserX class="w-3.5 h-3.5 flex-shrink-0" />
              <span>{{ adminStore.stats.blockedUsers }} compte(s) bloqué(s)</span>
            </router-link>
            <p
              v-if="adminStore.stats.flaggedCards === 0 && adminStore.stats.blockedUsers === 0"
              class="text-xs"
              :class="themeStore.darkMode ? 'text-green-400' : 'text-green-600'"
            >
              Aucune alerte active
            </p>
          </div>
        </div>

        <!-- Accès rapides -->
        <div
          class="rounded-xl border p-4"
          :class="
            themeStore.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-onyx-200'
          "
        >
          <h3
            class="text-sm font-semibold mb-3"
            :class="themeStore.darkMode ? 'text-white' : 'text-onyx-900'"
          >
            Accès rapides
          </h3>
          <div class="space-y-1">
            <router-link
              v-for="link in quickLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center space-x-2 text-xs py-1.5 px-2 rounded-lg transition-colors"
              :class="
                themeStore.darkMode
                  ? 'text-onyx-400 hover:bg-slate-700 hover:text-white'
                  : 'text-onyx-600 hover:bg-gray-100'
              "
            >
              <component :is="link.icon" class="w-3.5 h-3.5" />
              <span>{{ link.label }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Users,
  CreditCard,
  Layers,
  Eye,
  Flag,
  AlertTriangle,
  UserX,
  Settings,
  Plus,
} from 'lucide-vue-next'
import { useThemeStore } from '../../stores/themeStore'
import { useAdminStore } from '../../stores/adminStore'

const themeStore = useThemeStore()
const adminStore = useAdminStore()

const kpis = computed(() => [
  {
    label: 'Utilisateurs',
    value: adminStore.stats.totalUsers,
    sub: `${adminStore.stats.activeUsers} actifs`,
    subColor: 'text-green-500',
    icon: Users,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    label: 'Cartes créées',
    value: adminStore.stats.totalCards,
    sub: `${adminStore.stats.publicCards} publiques`,
    subColor: themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500',
    icon: CreditCard,
    iconBg: 'bg-primary-500/10',
    iconColor: 'text-primary-500',
  },
  {
    label: 'Modèles',
    value: adminStore.stats.totalTemplates,
    sub: `${adminStore.stats.premiumTemplates} premium`,
    subColor: 'text-yellow-500',
    icon: Layers,
    iconBg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-500',
  },
  {
    label: 'Vues totales',
    value: adminStore.stats.totalViews.toLocaleString('fr-FR'),
    sub: `sur toutes les cartes`,
    subColor: themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500',
    icon: Eye,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
])

const quickLinks = [
  { to: '/admin/users', label: 'Gérer les utilisateurs', icon: Users },
  { to: '/admin/cards', label: 'Modérer les cartes', icon: CreditCard },
  { to: '/admin/templates', label: 'Ajouter un modèle', icon: Plus },
  { to: '/admin/settings', label: 'Paramètres système', icon: Settings },
]

const formatDate = (iso) => {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>
