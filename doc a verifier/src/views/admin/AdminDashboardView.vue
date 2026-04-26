<template>
  <div class="space-y-6">
    <!--
      TODO backend : toutes les métriques de cette vue viennent d'un seul endpoint agrégé :
        GET /api/admin/overview
        → réponse :
          {
            users:     { total, active, blocked, premium },
            cards:     { total, public, totalViews },
            templates: { total, premium },
            recentUsers: User[],      -- 5 derniers inscrits
            recentCards: Card[],      -- 5 dernières cartes créées
          }
        → calculé avec des requêtes SQL agrégées (COUNT, SUM) — très rapide
        → mettre en cache Redis 60 secondes (éviter recalcul à chaque page load admin)
    -->

    <!-- ── KPI Grid ── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="kpi in kpis"
        :key="kpi.label"
        class="rounded-xl p-4 border transition-all hover:shadow-md"
        class="bg-base-100 border-base-300"
      >
        <div class="flex items-start justify-between">
          <div>
            <p
              class="text-xs font-medium mb-1"
              class="text-base-content/40"
            >
              {{ kpi.label }}
            </p>
            <p
              class="text-2xl font-bold"
              class="text-base-content"
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

    <!-- ── Ligne du bas : activité récente + stats ── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Activité récente -->
      <!--
        TODO backend : GET /api/admin/overview → champs recentUsers + recentCards
          Fusionner côté front en triant par created_at DESC.
          Alternative : endpoint dédié GET /api/admin/activity?limit=8
      -->
      <div
        class="lg:col-span-2 rounded-xl border"
        class="bg-base-100 border-base-300"
      >
        <div
          class="flex items-center justify-between px-5 py-4 border-b"
          class="border-base-300"
        >
          <h2
            class="font-semibold text-sm"
            class="text-base-content"
          >
            Activité récente
          </h2>
          <span class="text-xs" class="text-base-content/40">
            Derniers événements
          </span>
        </div>
        <ul class="divide-y divide-base-300">
          <li
            v-for="(item, i) in recentActivity"
            :key="i"
            class="flex items-start space-x-3 px-5 py-3"
          >
            <div class="mt-0.5 flex-shrink-0">
              <Users v-if="item.type === 'user'" class="w-4 h-4 text-blue-500" />
              <CreditCard v-else class="w-4 h-4 text-green-500" />
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-sm truncate"
                class="text-base-content/80"
              >
                {{ item.label }}
              </p>
              <p class="text-xs" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">
                {{ formatDate(item.time) }}
              </p>
            </div>
          </li>
          <li
            v-if="recentActivity.length === 0"
            class="px-5 py-8 text-center text-sm"
            :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
          >
            Aucune activité — aucun utilisateur inscrit pour le moment.
          </li>
        </ul>
      </div>

      <!-- Colonne droite -->
      <div class="space-y-4">
        <!-- Répartition utilisateurs -->
        <!--
          TODO backend : les compteurs totalUsers et premiumUsers viennent du GET /api/admin/overview
            SELECT
              COUNT(*) AS total,
              SUM(CASE WHEN is_premium THEN 1 ELSE 0 END) AS premium,
              SUM(CASE WHEN status='blocked' THEN 1 ELSE 0 END) AS blocked
            FROM users WHERE deleted_at IS NULL
        -->
        <div
          class="rounded-xl border p-4"
          :class="
            themeStore.darkMode ? 'bg-onyx-800 border-onyx-700' : 'bg-powder-50 border-powder-200'
          "
        >
          <h3
            class="text-sm font-semibold mb-3"
            class="text-base-content"
          >
            Répartition utilisateurs
          </h3>
          <div class="space-y-2">
            <div class="flex justify-between items-center text-sm">
              <span class="text-base-content/50"
                >Plan gratuit</span
              >
              <span
                class="font-medium"
                class="text-base-content"
              >
                {{ stats.freeUsers }}
              </span>
            </div>
            <div
              class="w-full h-1.5 rounded-full"
              class="bg-base-300"
            >
              <div
                class="h-1.5 rounded-full bg-onyx-400"
                :style="{
                  width: stats.totalUsers ? `${(stats.freeUsers / stats.totalUsers) * 100}%` : '0%',
                }"
              />
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-base-content/50"
                >Plan premium</span
              >
              <span class="font-medium text-flame-500">{{ stats.premiumUsers }}</span>
            </div>
            <div
              class="w-full h-1.5 rounded-full"
              class="bg-base-300"
            >
              <div
                class="h-1.5 rounded-full bg-flame-500"
                :style="{
                  width: stats.totalUsers
                    ? `${(stats.premiumUsers / stats.totalUsers) * 100}%`
                    : '0%',
                }"
              />
            </div>
          </div>
        </div>

        <!-- Alertes -->
        <!--
          TODO backend : les alertes viennent du GET /api/admin/overview
            → blockedUsers : COUNT users WHERE status='blocked'
            → ajouter d'autres alertes : cartes signalées, paiements échoués Stripe,
              erreurs serveur récentes, quota localStorage dépassé (si quota monitoring)
        -->
        <div
          class="rounded-xl border p-4"
          :class="
            themeStore.darkMode ? 'bg-onyx-800 border-onyx-700' : 'bg-powder-50 border-powder-200'
          "
        >
          <h3
            class="text-sm font-semibold mb-3"
            class="text-base-content"
          >
            Alertes
          </h3>
          <div class="space-y-2">
            <router-link
              v-if="stats.blockedUsers > 0"
              to="/admin/users"
              class="flex items-center space-x-2 text-xs p-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors"
            >
              <UserX class="w-3.5 h-3.5 flex-shrink-0" />
              <span>{{ stats.blockedUsers }} compte(s) bloqué(s)</span>
            </router-link>
            <div
              v-if="maintenanceMode"
              class="flex items-center space-x-2 text-xs p-2 rounded-lg bg-red-500/10 text-red-500"
            >
              <AlertTriangle class="w-3.5 h-3.5 flex-shrink-0" />
              <span>Mode maintenance activé</span>
            </div>
            <div
              v-if="stats.publicCards > 0"
              class="flex items-center space-x-2 text-xs p-2 rounded-lg"
              class="bg-base-200 text-base-content/50"
            >
              <Globe class="w-3.5 h-3.5 flex-shrink-0" />
              <span>{{ stats.publicCards }} carte(s) publique(s) dans la galerie</span>
            </div>
            <p
              v-if="stats.blockedUsers === 0 && !maintenanceMode && stats.publicCards === 0"
              class="text-xs"
              class="text-success"
            >
              Aucune alerte active
            </p>
          </div>
        </div>

        <!-- Accès rapides -->
        <div
          class="rounded-xl border p-4"
          :class="
            themeStore.darkMode ? 'bg-onyx-800 border-onyx-700' : 'bg-powder-50 border-powder-200'
          "
        >
          <h3
            class="text-sm font-semibold mb-3"
            class="text-base-content"
          >
            Accès rapides
          </h3>
          <div class="space-y-1">
            <router-link
              v-for="link in quickLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center space-x-2 text-xs py-1.5 px-2 rounded-lg transition-colors"
              class="text-base-content/50 hover:bg-base-200 hover:text-base-content"
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
import { Users, CreditCard, Layers, Eye, Globe, UserX, Settings, Plus, AlertTriangle } from 'lucide-vue-next'
import { useThemeStore } from '../../stores/themeStore'
import { useAuthStore } from '../../stores/authStore'
import { useCardsStore } from '../../stores/cards'
import { useAdminStore } from '../../stores/adminStore'

const themeStore = useThemeStore()

/*
 * Sources de données réelles :
 *   - Utilisateurs : authStore.getAllUsersWithStats (computed sur digitalcard_allUsers)
 *   - Cartes       : cardsStore.getAllCardsAdmin()  (scan digitalcard_userCards_{email})
 *   - Templates    : cardsStore.getAllTemplates     (computed sur templates[])
 *
 * TODO backend : remplacer par GET /api/admin/overview (un seul appel, données agrégées SQL)
 */
const authStore = useAuthStore()
const cardsStore = useCardsStore()
const adminStore = useAdminStore()

const maintenanceMode = computed(() => adminStore.settings?.maintenanceMode ?? false)

// ── Données admin (cache unique) ────────────────────────────────────────
// getAllCardsAdmin() scanne TOUS les localStorage → on le met dans un computed séparé
// pour éviter un double scan (stats + recentActivity lisaient chacun le résultat).
// TODO backend : un seul appel GET /api/admin/overview remplace tout cela
const adminCards = computed(() => cardsStore.getAllCardsAdmin())

// ── Métriques agrégées ────────────────────────────────────────────────────
// TODO backend : ces valeurs viennent directement des champs de la réponse /api/admin/overview
const stats = computed(() => {
  const users = authStore.getAllUsersWithStats
  const cards = adminCards.value
  const templates = cardsStore.getAllTemplates

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === 'active').length
  const blockedUsers = users.filter((u) => u.status === 'blocked').length
  const premiumUsers = users.filter((u) => u.isPremium).length
  const freeUsers = totalUsers - premiumUsers

  const totalCards = cards.length
  const publicCards = cards.filter((c) => c.isPublic).length
  const totalViews = cards.reduce((s, c) => s + (c.views || 0), 0)

  const totalTemplates = templates.length
  const premiumTemplates = templates.filter((t) => t.isPremium).length

  return {
    totalUsers,
    activeUsers,
    blockedUsers,
    premiumUsers,
    freeUsers,
    totalCards,
    publicCards,
    totalViews,
    totalTemplates,
    premiumTemplates,
  }
})

// ── KPI tiles ─────────────────────────────────────────────────────────────
const kpis = computed(() => [
  {
    label: 'Utilisateurs',
    value: stats.value.totalUsers,
    sub: `${stats.value.activeUsers} actifs`,
    subColor: 'text-green-500',
    icon: Users,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    label: 'Cartes créées',
    value: stats.value.totalCards,
    sub: `${stats.value.publicCards} publiques`,
    subColor: themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500',
    icon: CreditCard,
    iconBg: 'bg-flame-500/10',
    iconColor: 'text-flame-500',
  },
  {
    label: 'Modèles',
    value: stats.value.totalTemplates,
    sub: `${stats.value.premiumTemplates} premium`,
    subColor: 'text-yellow-500',
    icon: Layers,
    iconBg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-500',
  },
  {
    label: 'Vues totales',
    // TODO backend : SUM(views) sur la table cards (ou table card_views si event-based)
    value: stats.value.totalViews.toLocaleString('fr-FR'),
    sub: 'sur toutes les cartes',
    subColor: themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500',
    icon: Eye,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
])

// ── Activité récente ─────────────────────────────────────────────────────
// Fusionne les 5 derniers utilisateurs inscrits + les 5 dernières cartes créées,
// trie par date décroissante, affiche les 8 premiers.
// TODO backend : GET /api/admin/overview → recentUsers + recentCards (déjà triés et limités)
const recentActivity = computed(() => {
  const users = authStore.getAllUsersWithStats
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((u) => ({
      type: 'user',
      label: `Nouvel utilisateur : ${u.name} (${u.email})`,
      time: u.createdAt,
    }))

  const cards = adminCards.value
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((c) => ({
      type: 'card',
      label: `Nouvelle carte "${c.name || 'Sans titre'}" par ${c.ownerName}`,
      time: c.createdAt,
    }))

  return [...users, ...cards].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8)
})

// ── Liens rapides ─────────────────────────────────────────────────────────
const quickLinks = [
  { to: '/admin/users', label: 'Gérer les utilisateurs', icon: Users },
  { to: '/admin/cards', label: 'Modérer les cartes', icon: CreditCard },
  { to: '/admin/templates', label: 'Ajouter un modèle', icon: Plus },
  { to: '/admin/settings', label: 'Paramètres système', icon: Settings },
]

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
</script>
