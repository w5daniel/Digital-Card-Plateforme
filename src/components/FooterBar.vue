<template>
  <footer class="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- About -->
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <img src="/logo-ECODEV.png" alt="ECODEV" class="h-8 w-auto" />
          </div>
          <p class="text-gray-400 text-sm">
            Créez, gérez et partagez vos cartes de visite numériques en quelques clics.
          </p>
        </div>

        <!-- Links -->
        <div>
          <h4 class="font-semibold mb-4">Liens rapides</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li>
              <router-link to="/" class="hover:text-primary-400 transition-colors"
                >Accueil</router-link
              >
            </li>
            <li>
              <router-link to="/gallery" class="hover:text-primary-400 transition-colors"
                >Galerie</router-link
              >
            </li>
            <li>
              <router-link to="/editor" class="hover:text-primary-400 transition-colors"
                >Créer une carte</router-link
              >
            </li>
            <li>
              <router-link to="/dashboard" class="hover:text-primary-400 transition-colors"
                >Mon dashboard</router-link
              >
            </li>
            <li>
              <router-link to="/about" class="hover:text-primary-400 transition-colors"
                >À propos</router-link
              >
            </li>
          </ul>
        </div>

        <!-- Resources -->
        <div>
          <h4 class="font-semibold mb-4">Ressources</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li>
              <a href="#" class="hover:text-primary-400 transition-colors">Documentation API</a>
            </li>
            <li><a href="#" class="hover:text-primary-400 transition-colors">Tutoriels</a></li>
            <li><a href="#" class="hover:text-primary-400 transition-colors">Support</a></li>
            <li><a href="#" class="hover:text-primary-400 transition-colors">FAQ</a></li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="font-semibold mb-4">Contact</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li class="flex items-center space-x-2">
              <Mail class="w-4 h-4" />
              <span>internship@ecodev.dev</span>
            </li>
            <li class="flex items-center space-x-2">
              <Phone class="w-4 h-4" />
              <div class="flex flex-col space-y-1">
                <span>+226 56 34 34 12</span>
                <span>+226 51 08 80 80</span>
              </div>
            </li>
            <li class="flex items-center space-x-2">
              <MapPin class="w-4 h-4" />
              <span>Ouagadougou, Burkina Faso</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-700 mt-8 pt-8">
        <div
          class="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 space-y-6 md:space-y-0"
        >
          <p>&copy; 2026 ECODEV INTERNATIONAL. Tous droits réservés.</p>

          <!-- Social Media Links (centered) -->
          <div class="flex items-center space-x-4">
            <!-- Facebook -->
            <a
              href="https://web.facebook.com/ecodevINT?_rdc=1&_rdr#"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-blue-500 transition-colors"
              title="Facebook"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
            </a>
            <!-- Instagram -->
            <a
              href="https://www.instagram.com/ecodev.dev/"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-pink-500 transition-colors"
              title="Instagram"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="5"
                  ry="5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <circle cx="17" cy="7" r="1" fill="currentColor" />
              </svg>
            </a>
            <!-- LinkedIn -->
            <a
              href="https://www.linkedin.com/company/ecodev-international"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-blue-600 transition-colors"
              title="LinkedIn"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"
                />
              </svg>
            </a>
            <!-- X (Twitter) -->
            <a
              href="https://x.com/ECODEV_INT?t=BDNVS8Zr5bNkLnHD2GKFrQ&s=09"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-gray-400 transition-colors"
              title="X (Twitter)"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.694l-5.259-6.877-6.027 6.877h-3.328l7.727-8.835L.742 2.25h6.892l4.807 6.355 5.537-6.355zM17.15 18.75h1.828L5.997 4.1H4.05l13.1 14.65z"
                />
              </svg>
            </a>
          </div>

          <div class="flex space-x-6">
            <a href="#" class="hover:text-primary-400 transition-colors">Confidentialité</a>
            <a href="#" class="hover:text-primary-400 transition-colors">Conditions</a>
            <a href="#" class="hover:text-primary-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Mail, Phone, MapPin } from 'lucide-vue-next'
</script>
