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
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-primary-400 transition-colors"
              title="Facebook"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-primary-400 transition-colors"
              title="Instagram"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.117.6c-.59.263-1.09.646-1.516 1.072-.423.426-.809.929-1.072 1.516-.266.788-.468 1.658-.527 2.936C.008 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.527 2.936.264.588.649 1.091 1.072 1.516.427.423.926.809 1.516 1.072.788.266 1.658.468 2.936.527C8.333 23.992 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.261 2.936-.527.588-.264 1.091-.649 1.516-1.072.423-.427.809-.926 1.072-1.516.266-.788.468-1.658.527-2.936.057-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.261-2.148-.527-2.936-.264-.588-.649-1.091-1.072-1.516-.427-.423-.926-.809-1.516-1.072-.788-.266-1.658-.468-2.936-.527C15.667.008 15.26 0 12 0zm0 2.16c3.203 0 3.585.009 4.849.070 1.171.054 1.805.244 2.227.408.561.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.354 1.057.408 2.227.061 1.264.07 1.645.07 4.849 0 3.203-.009 3.585-.07 4.849-.054 1.171-.244 1.806-.408 2.228-.217.561-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.057.354-2.227.408-1.264.061-1.645.07-4.849.07-3.203 0-3.585-.009-4.849-.07-1.171-.054-1.806-.244-2.228-.408-.561-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.354-1.057-.408-2.227-.061-1.264-.07-1.645-.07-4.849 0-3.203.009-3.585.07-4.849.054-1.171.244-1.806.408-2.228.217-.561.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057-.354 2.227-.408 1.264-.061 1.645-.07 4.849-.07zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"
                />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-primary-400 transition-colors"
              title="LinkedIn"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"
                />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-primary-400 transition-colors"
              title="Twitter"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M23.953 4.57a10 10 0 002.846-3.656 4.993 4.993 0 01-1.41 1.684 2.495 2.495 0 002.286-1.238 4.994 4.994 0 01-1.579.85 2.496 2.496 0 00-4.488 2.273c-2.148-.126-4.066-1.139-5.347-2.71a2.496 2.496 0 00-.868 3.33 2.488 2.488 0 001.141-.589 2.494 2.494 0 00-2.239 3.1 2.494 2.494 0 002.253 1.553 5.001 5.001 0 01-3.08 1.064 5.022 5.022 0 006.94 4.768c3.682 2.865 9.306 1.71 12.17-2.012 1.054-1.355 1.836-2.926 2.331-4.595.09-.238.176-.473.259-.707a3.996 3.996 0 001.113-2.798z"
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
