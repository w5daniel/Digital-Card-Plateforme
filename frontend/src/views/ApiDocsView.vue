<template>
  <div class="min-h-screen bg-powder-200 dark:bg-onyx-950">
    <!-- Hero Section -->
    <div class="relative overflow-hidden pt-20 pb-32 sm:pt-32 sm:pb-40">
      <div class="absolute inset-0 bg-flame-500/5"></div>
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-flame-100 dark:bg-flame-900/40 text-flame-600 dark:text-flame-400 mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-4 h-4"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="12" x2="12" y2="7" class="clock-minute-hand" />
            <line x1="12" y1="12" x2="15" y2="13.5" class="clock-hour-hand" />
          </svg>
          Bientôt disponible
        </span>
        <h1 class="text-5xl sm:text-6xl font-bold text-onyx-950 dark:text-powder-50 mb-6">
          Documentation API
        </h1>
        <p class="text-xl text-onyx-600 dark:text-powder-400 max-w-2xl mx-auto">
          Une API REST publique est en cours de développement. Elle permettra aux développeurs et
          aux entreprises d'intégrer ECODEV Card Pro dans leurs workflows existants.
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <!-- Features à venir -->
      <div class="mb-16">
        <h2
          class="text-3xl md:text-4xl font-bold text-onyx-950 dark:text-powder-50 mb-4 text-center"
        >
          Fonctionnalités prévues
        </h2>
        <p class="text-center text-onyx-500 dark:text-powder-500 mb-12">
          Ce que vous pourrez faire avec l'API ECODEV Card Pro
        </p>

        <div class="grid md:grid-cols-2 gap-6">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl p-6 flex gap-4"
          >
            <div
              class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              :class="feature.iconBg"
            >
              <component :is="feature.icon" class="w-6 h-6" :class="feature.iconColor" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-onyx-900 dark:text-powder-100 mb-1">
                {{ feature.title }}
              </h3>
              <p class="text-sm text-onyx-600 dark:text-powder-400">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA notification -->
      <div
        class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-3xl p-12 text-center"
      >
        <div
          class="w-16 h-16 bg-flame-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
        >
          <Bell class="w-8 h-8 text-white" />
        </div>
        <h2 class="text-2xl md:text-3xl font-bold text-onyx-950 dark:text-powder-50 mb-4">
          Être notifié au lancement
        </h2>
        <p class="text-onyx-600 dark:text-powder-400 mb-8 max-w-lg mx-auto">
          Vous êtes développeur ou vous gérez une équipe ? Contactez-nous pour être parmi les
          premiers à accéder à l'API en bêta.
        </p>
        <a
          href="mailto:contact@ecodev.dev?subject=Intérêt API ECODEV Card Pro"
          class="inline-flex items-center gap-2 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-xl px-8 py-4 transition-colors shadow-sm"
        >
          <Mail class="w-5 h-5" />
          Nous contacter
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Bell, Mail, Code2, Users, Webhook, Key, FileJson } from 'lucide-vue-next'

const features = [
  {
    title: 'Endpoints REST',
    description: 'CRUD complet sur les cartes et modèles via des endpoints JSON standardisés.',
    icon: FileJson,
    iconBg: 'bg-flame-100 dark:bg-flame-900/30',
    iconColor: 'text-flame-600 dark:text-flame-400',
  },
  {
    title: 'Authentification OAuth / Token',
    description: 'Clés API par utilisateur avec contrôle des permissions par scope.',
    icon: Key,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    title: 'Création en masse',
    description: 'Générez des centaines de cartes depuis un fichier CSV ou JSON en un seul appel.',
    icon: Users,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Webhooks',
    description: 'Recevez des notifications en temps réel quand une carte est créée ou partagée.',
    icon: Webhook,
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    title: 'SDK & Exemples',
    description: 'Bibliothèques JavaScript et Python + exemples d\'intégration prêts à l\'emploi.',
    icon: Code2,
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    title: 'Intégrations CRM',
    description: 'Connectez votre CRM (HubSpot, Salesforce...) pour synchroniser vos contacts.',
    icon: Bell,
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
]

</script>

<style scoped>
.clock-minute-hand {
  transform-origin: 12px 12px;
  animation: rotate-minute 4s linear infinite;
}

.clock-hour-hand {
  transform-origin: 12px 12px;
  animation: rotate-hour 48s linear infinite;
}

@keyframes rotate-minute {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes rotate-hour {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
