<template>
  <footer class="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- About -->
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <CreditCard class="w-5 h-5 text-white" />
            </div>
            <h3 class="text-lg font-bold">ECODEV-CARD Pro</h3>
          </div>
          <p class="text-gray-400 text-sm">
            Créez, gérez et partagez vos cartes de visite numériques en quelques clics.
          </p>
        </div>

        <!-- Links -->
        <div>
          <h4 class="font-semibold mb-4">Liens rapides</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li><router-link to="/" class="hover:text-primary-400 transition-colors">Accueil</router-link></li>
            <li><router-link to="/gallery" class="hover:text-primary-400 transition-colors">Galerie</router-link></li>
            <li><router-link to="/editor" class="hover:text-primary-400 transition-colors">Créer une carte</router-link></li>
            <li><router-link to="/dashboard" class="hover:text-primary-400 transition-colors">Mon dashboard</router-link></li>
          </ul>
        </div>

        <!-- Resources -->
        <div>
          <h4 class="font-semibold mb-4">Ressources</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li><a href="#" class="hover:text-primary-400 transition-colors">Documentation API</a></li>
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
              <span>contact@cardgen.com</span>
            </li>
            <li class="flex items-center space-x-2">
              <Phone class="w-4 h-4" />
              <span>+226 70 12 34 56</span>
            </li>
            <li class="flex items-center space-x-2">
              <MapPin class="w-4 h-4" />
              <span>Ouagadougou, Burkina Faso</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
        <p>&copy; 2026 ECODEV-CARD Pro. Tous droits réservés.</p>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a href="#" class="hover:text-primary-400 transition-colors">Confidentialité</a>
          <a href="#" class="hover:text-primary-400 transition-colors">Conditions</a>
          <a href="#" class="hover:text-primary-400 transition-colors">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { CreditCard, Mail, Phone, MapPin } from 'lucide-vue-next'
</script>
