<template>
  <div
    class="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800"
  >
    <!-- Hero Section -->
    <div class="relative overflow-hidden pt-20 pb-32 sm:pt-32 sm:pb-40">
      <div class="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10"></div>
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          À propos de nous
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Créez des cartes de visite numériques professionnelles avec style et élégance. Notre
          plateforme offre les meilleurs outils pour présenter votre identité professionnelle.
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <!-- Mission Section -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 md:p-12 mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Notre Mission
        </h2>
        <p class="text-lg text-gray-700 dark:text-gray-300 mb-8">
          Nous croyons qu'une carte de visite professionnelle est bien plus qu'un simple bout de
          papier. C'est une extension de votre identité, un reflet de votre professionnalisme et de
          votre créativité. Digital Card Platform a été créé pour démocratiser l'accès à des outils
          professionnels de création de cartes de visite numériques.
        </p>

        <div class="grid md:grid-cols-2 gap-8">
          <div class="flex gap-4">
            <div class="flex-shrink-0">
              <div
                class="flex items-center justify-center h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900"
              >
                <svg
                  class="h-6 w-6 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Rapide & Simple
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                Créez une carte professionnelle en quelques minutes sans compétences techniques.
              </p>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="flex-shrink-0">
              <div
                class="flex items-center justify-center h-12 w-12 rounded-xl bg-secondary-100 dark:bg-secondary-900"
              >
                <svg
                  class="h-6 w-6 text-secondary-600 dark:text-secondary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Design Professionnel
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                Choisissez parmi nos modèles élégants et modernes conçus par des professionnels.
              </p>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="flex-shrink-0">
              <div
                class="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900"
              >
                <svg
                  class="h-6 w-6 text-amber-600 dark:text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Recto & Verso
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                Personnalisez le recto et le verso de votre carte avec des informations uniques.
              </p>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="flex-shrink-0">
              <div
                class="flex items-center justify-center h-12 w-12 rounded-xl bg-rose-100 dark:bg-rose-900"
              >
                <svg
                  class="h-6 w-6 text-rose-600 dark:text-rose-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6V4m6 2a2 2 0 100 4 2 2 0 000-4zM4 10a2 2 0 100 4 2 2 0 000-4zm6 12a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 100-4 2 2 0 000 4z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Code QR Intégré
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                Partagez votre contact instantanément via QR code scannable sur chaque carte.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          Nos Fonctionnalités
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <div
              class="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-6"
            >
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Design Personnalisable
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              Adaptez les couleurs, polices et dispositions pour refléter votre marque personnelle
              et vos préférences.
            </p>
          </div>

          <!-- Feature 2 -->
          <div
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <div
              class="w-16 h-16 bg-gradient-to-br from-secondary-500 to-amber-500 rounded-xl flex items-center justify-center mb-6"
            >
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Recto et Verso</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Maximisez l'impact de votre carte avec un verso personnalisé. Présentez vos services
              ou vos produits.
            </p>
          </div>

          <!-- Feature 3 -->
          <div
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <div
              class="w-16 h-16 bg-gradient-to-br from-amber-500 to-rose-500 rounded-xl flex items-center justify-center mb-6"
            >
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Statistiques & Analyse
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              Suivez les vues, scans QR et partages de vos cartes pour mesurer votre impact.
            </p>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div
        class="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl shadow-2xl p-12 md:p-16 text-center"
      >
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
          Prêt à créer votre carte professionnelle ?
        </h2>
        <p class="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          Rejoignez des milliers de professionnels qui font confiance à Digital Card Platform pour
          présenter leur identité professionnelle.
        </p>
        <router-link
          to="/editor"
          class="inline-block px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-colors duration-200 shadow-lg"
        >
          Créer Ma Carte Maintenant
        </router-link>
      </div>
    </div>

    <!-- Footer Info -->
    <div
      class="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-20 py-12"
    >
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-gray-600 dark:text-gray-400 mb-2">
          Développé par
          <span class="font-semibold text-gray-900 dark:text-white">ECODEV INTERNATIONAL</span>
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-500">
          © 2024 Digital Card Platform. Tous droits réservés.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
/* Component-specific styles */
</style>
