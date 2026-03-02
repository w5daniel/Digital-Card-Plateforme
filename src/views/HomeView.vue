<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="relative py-20 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Texte du hero avec des animations pour rendre la page d'accueil plus dynamique et engageante -->
          <div class="space-y-8 animate-slide-up">
            <div
              class="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold"
            >
              ✨ Nouvelle génération de cartes de visite
            </div>

            <h1 class="text-5xl md:text-6xl font-bold leading-tight">
              Créez des cartes de visite
              <span class="gradient-text">numériques</span>
              qui impressionnent
            </h1>

            <p class="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Générez, personnalisez et partagez vos cartes de visite professionnelles en quelques
              clics. Format vCard, QR codes, et bien plus encore.
            </p>

            <div class="flex flex-col sm:flex-row gap-4">
              <router-link to="/editor" class="btn-primary text-center">
                Commencer gratuitement
                <ArrowRight class="w-5 h-5 inline ml-2" />
              </router-link>
              <router-link to="/gallery" class="btn-secondary text-center">
                Voir les modèles
              </router-link>
            </div>

            <!-- Stats clés pour renforcer la crédibilité et montrer l'ampleur de la plateforme -->
            <div class="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-slate-700">
              <div>
                <div class="text-3xl font-bold gradient-text">500+</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Modèles</div>
              </div>
              <div>
                <div class="text-3xl font-bold gradient-text">10K+</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Utilisateurs</div>
              </div>
              <div>
                <div class="text-3xl font-bold gradient-text">50K+</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Cartes créées</div>
              </div>
            </div>
          </div>

          <!-- Section avec des cartes animées pour rendre le hero plus dynamique et visuellement attrayant -->
          <div class="relative h-[600px] hidden lg:block">
            <div class="absolute top-0 right-0 w-full animate-bounce-slow">
              <div
                class="rounded-2xl shadow-2xl overflow-hidden transform rotate-6 hover:rotate-0 transition-transform duration-300"
                style="
                  background: linear-gradient(
                    135deg,
                    #ff6b6b 0%,
                    #ff8e72 25%,
                    #a78bfa 50%,
                    #60a5fa 75%,
                    #4ade80 100%
                  );
                  width: 480px;
                  aspect-ratio: 16/9;
                  transform: perspective(1200px) rotateX(8px) rotateY(-8px) rotateZ(6deg);
                "
              >
                <div class="relative p-8 h-full flex flex-col justify-between">
                  <div class="w-10 h-10 bg-white/20 rounded-2xl"></div>
                  <div class="space-y-3">
                    <div class="space-y-2">
                      <div class="h-3 bg-white/30 rounded-full w-40"></div>
                      <div class="h-2 bg-white/25 rounded-full w-28"></div>
                    </div>
                    <div class="flex items-center justify-between pt-3">
                      <div class="space-y-1.5">
                        <div class="h-2 bg-white/25 rounded-full w-24"></div>
                        <div class="h-2 bg-white/25 rounded-full w-24"></div>
                      </div>
                      <div class="w-10 h-10 bg-white/20 rounded-xl"></div>
                    </div>
                  </div>
                  <div class="flex justify-end">
                    <div class="w-8 h-8 bg-white/20 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="absolute top-20 left-0 w-full animate-fade-in"
              style="animation-delay: 0.2s"
            >
              <div
                class="rounded-2xl shadow-2xl overflow-hidden transform -rotate-6 hover:rotate-0 transition-transform duration-300"
                style="
                  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #3b82f6 100%);
                  width: 480px;
                  aspect-ratio: 16/9;
                  transform: perspective(1200px) rotateX(-6px) rotateY(8px) rotateZ(-6deg);
                "
              >
                <div class="relative p-8 h-full flex flex-col justify-between">
                  <div class="w-10 h-10 bg-white/20 rounded-2xl"></div>
                  <div class="space-y-3">
                    <div class="space-y-2">
                      <div class="h-3 bg-white/30 rounded-full w-40"></div>
                      <div class="h-2 bg-white/25 rounded-full w-28"></div>
                    </div>
                    <div class="flex items-center justify-between pt-3">
                      <div class="space-y-1.5">
                        <div class="h-2 bg-white/25 rounded-full w-24"></div>
                        <div class="h-2 bg-white/25 rounded-full w-24"></div>
                      </div>
                      <div class="w-10 h-10 bg-white/20 rounded-xl"></div>
                    </div>
                  </div>
                  <div class="flex justify-end">
                    <div class="w-8 h-8 bg-white/20 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="absolute top-40 right-10 w-full animate-fade-in"
              style="animation-delay: 0.4s"
            >
              <div
                class="rounded-2xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-300"
                style="
                  background: linear-gradient(135deg, #f97316 0%, #f43f5e 50%, #06b6d4 100%);
                  width: 480px;
                  aspect-ratio: 16/9;
                  transform: perspective(1200px) rotateX(5px) rotateY(-5px) rotateZ(3deg);
                "
              >
                <div class="relative p-8 h-full flex flex-col justify-between">
                  <div class="w-10 h-10 bg-white/20 rounded-2xl"></div>
                  <div class="space-y-3">
                    <div class="space-y-2">
                      <div class="h-3 bg-white/30 rounded-full w-40"></div>
                      <div class="h-2 bg-white/25 rounded-full w-28"></div>
                    </div>
                    <div class="flex items-center justify-between pt-3">
                      <div class="space-y-1.5">
                        <div class="h-2 bg-white/25 rounded-full w-24"></div>
                        <div class="h-2 bg-white/25 rounded-full w-24"></div>
                      </div>
                      <div class="w-10 h-10 bg-white/20 rounded-xl"></div>
                    </div>
                  </div>
                  <div class="flex justify-end">
                    <div class="w-8 h-8 bg-white/20 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-white dark:bg-slate-900 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="section-title">Fonctionnalités puissantes</h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 mt-4">
            Tout ce dont vous avez besoin pour créer des cartes professionnelles
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="card p-8 card-hover text-center"
          >
            <div
              class="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <component :is="feature.icon" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold mb-3">{{ feature.title }}</h3>
            <p class="text-gray-600 dark:text-gray-400">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h2 class="text-4xl md:text-5xl font-bold mb-6">Prêt à créer votre carte de visite ?</h2>
        <p class="text-xl mb-8 opacity-90">
          Rejoignez des milliers de professionnels qui font confiance à ECODEV CARD PRO
        </p>
        <router-link
          to="/editor"
          class="inline-block px-8 py-4 bg-white text-primary-600 font-bold rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
        >
          Créer ma première carte
          <Zap class="w-5 h-5 inline ml-2" />
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  ArrowRight,
  Zap,
  Palette,
  Download,
  Share2,
  QrCode,
  Smartphone,
  Lock,
} from 'lucide-vue-next'

const features = [
  {
    icon: Palette,
    title: 'Personnalisation complète',
    description:
      'Choisissez parmi des centaines de modèles et personnalisez chaque détail selon vos besoins.',
  },
  {
    icon: QrCode,
    title: 'QR Code intégré',
    description: 'Générez automatiquement un QR code pour partager votre carte instantanément.',
  },
  {
    icon: Download,
    title: 'Export vCard',
    description: 'Téléchargez vos cartes au format vCard compatible avec tous les appareils.',
  },
  {
    icon: Share2,
    title: 'Partage facile',
    description: 'Partagez vos cartes par email, SMS, réseaux sociaux ou lien direct.',
  },
  {
    icon: Smartphone,
    title: 'Responsive Design',
    description: "Vos cartes s'affichent parfaitement sur tous les appareils et écrans.",
  },
  {
    icon: Lock,
    title: 'Sécurisé',
    description: 'Vos données sont protégées avec un chiffrement de bout en bout.',
  },
]
</script>
