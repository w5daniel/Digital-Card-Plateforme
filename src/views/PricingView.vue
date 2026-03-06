<template>
  <div
    class="min-h-screen bg-powder-50 dark:bg-onyx-950 py-12"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4 text-onyx-950 dark:text-powder-50">Plans Tarifaires</h1>
        <p class="text-xl text-onyx-600 dark:text-powder-400">
          Choisissez le plan qui vous convient et créez des cartes illimitées
        </p>
      </div>

      <!-- Pricing Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <!-- Free Plan -->
        <div class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl p-8">
          <div class="mb-6">
            <h2 class="text-2xl font-bold mb-2 text-onyx-950 dark:text-powder-50">Plan Gratuit</h2>
            <p class="text-onyx-600 dark:text-powder-400">Parfait pour débuter</p>
          </div>

          <div class="mb-6">
            <span class="text-5xl font-bold text-onyx-950 dark:text-powder-50">0€</span>
            <span class="text-onyx-600 dark:text-powder-400">/mois</span>
          </div>

          <ul class="space-y-3 mb-8">
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">3 Cartes maximum</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">Templates gratuits</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">Export vCard</span>
            </li>
            <li class="flex items-center space-x-3">
              <X class="w-5 h-5 text-red-500" />
              <span class="text-onyx-400">Cartes illimitées</span>
            </li>
            <li class="flex items-center space-x-3">
              <X class="w-5 h-5 text-red-500" />
              <span class="text-onyx-400">Templates premium</span>
            </li>
            <li class="flex items-center space-x-3">
              <X class="w-5 h-5 text-red-500" />
              <span class="text-onyx-400">Analytics avancé</span>
            </li>
          </ul>

          <button v-if="!authStore.hasPremium()" class="w-full py-3 px-6 rounded-xl bg-powder-200 text-onyx-500 font-semibold cursor-not-allowed opacity-70" disabled>
            Plan Actuel
          </button>
          <button v-else class="btn btn-outline w-full" disabled>Vous êtes Premium</button>
        </div>

        <!-- Premium Plan -->
        <div class="bg-powder-50 dark:bg-onyx-900 border-2 border-flame-500 rounded-2xl p-8 relative shadow-md">
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span class="bg-flame-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              ⭐ POPULAIRE
            </span>
          </div>

          <div class="mb-6">
            <h2 class="text-2xl font-bold mb-2 text-onyx-950 dark:text-powder-50">Plan Premium</h2>
            <p class="text-onyx-600 dark:text-powder-400">Pour les professionnels</p>
          </div>

          <div class="mb-6">
            <span class="text-5xl font-bold text-onyx-950 dark:text-powder-50">9,99€</span>
            <span class="text-onyx-600 dark:text-powder-400">/mois</span>
          </div>

          <ul class="space-y-3 mb-8">
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">Cartes illimitées</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">Tous les templates</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">Export vCard + QR Code</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">Import/Export JSON</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">Analytics avancé</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">Support prioritaire</span>
            </li>
          </ul>

          <button v-if="authStore.hasPremium()" class="w-full py-3 px-6 rounded-xl bg-flame-500 text-white font-semibold cursor-not-allowed opacity-70" disabled>
            ✓ Plan Actif
          </button>
          <button v-else @click="showPaymentModal = true" class="bg-flame-500 hover:bg-flame-600 text-white w-full font-semibold rounded-xl py-3 px-6 transition-colors">
            Acheter Premium
          </button>
        </div>
      </div>

      <!-- Features Comparison -->
      <div class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl p-8">
        <h3 class="text-2xl font-bold mb-6 text-onyx-950 dark:text-powder-50">Comparaison des Features</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-powder-200 dark:border-onyx-800">
                <th class="text-left py-3 font-semibold text-onyx-950 dark:text-powder-50">Feature</th>
                <th class="text-center py-3 font-semibold text-onyx-950 dark:text-powder-50">Gratuit</th>
                <th class="text-center py-3 font-semibold text-onyx-950 dark:text-powder-50">Premium</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-powder-200 dark:divide-onyx-800">
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Nombre de cartes</td>
                <td class="text-center text-onyx-900 dark:text-powder-100">3</td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Templates</td>
                <td class="text-center text-onyx-900 dark:text-powder-100">6</td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">QR Code</td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Export vCard</td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Partage publique</td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Import/Export JSON</td>
                <td class="text-center" />
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Analytics</td>
                <td class="text-center" />
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div
      v-if="showPaymentModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl max-w-md w-full p-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-onyx-950 dark:text-powder-50">Paiement Sécurisé</h3>
          <button @click="showPaymentModal = false" class="btn btn-ghost btn-sm btn-circle">
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="processPayment" class="space-y-4">
          <!-- Card Info -->
          <div>
            <label class="label">
              <span class="label-text font-semibold">Numéro de carte</span>
            </label>
            <input
              v-model="cardNumber"
              type="text"
              placeholder="4242 4242 4242 4242"
              class="border-powder-200 dark:border-onyx-700 bg-powder-50 dark:bg-onyx-800 rounded-xl px-3 py-2.5 text-sm w-full"
              maxlength="19"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text font-semibold">Expiration</span>
              </label>
              <input
                v-model="cardExpiry"
                type="text"
                placeholder="MM/YY"
                class="border-powder-200 dark:border-onyx-700 bg-powder-50 dark:bg-onyx-800 rounded-xl px-3 py-2.5 text-sm w-full"
                maxlength="5"
              />
            </div>
            <div>
              <label class="label">
                <span class="label-text font-semibold">CVC</span>
              </label>
              <input
                v-model="cardCvc"
                type="text"
                placeholder="123"
                class="border-powder-200 dark:border-onyx-700 bg-powder-50 dark:bg-onyx-800 rounded-xl px-3 py-2.5 text-sm w-full"
                maxlength="3"
              />
            </div>
          </div>

          <div
            class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
          >
            <p class="text-sm text-blue-800 dark:text-blue-300">
              💡 Test: 4242 4242 4242 4242 / 12/25 / 123
            </p>
          </div>

          <!-- Total -->
          <div class="bg-powder-50 dark:bg-onyx-800 p-4 rounded-lg">
            <div class="flex justify-between mb-2">
              <span class="text-onyx-700 dark:text-powder-300">Plan Premium mensuel</span>
              <span class="text-onyx-700 dark:text-powder-300">9,99€</span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="text-onyx-700 dark:text-powder-300">Tax (20%)</span>
              <span class="text-onyx-700 dark:text-powder-300">2,00€</span>
            </div>
            <div
              class="border-t border-powder-200 dark:border-onyx-800 pt-2 flex justify-between font-bold"
            >
              <span class="text-onyx-900 dark:text-white">Total</span>
              <span class="text-onyx-900 dark:text-white">11,99€</span>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex gap-2">
            <button type="button" @click="showPaymentModal = false" class="bg-powder-50 dark:bg-onyx-900 border border-onyx-200 dark:border-onyx-700 text-onyx-800 dark:text-powder-200 rounded-xl py-3 px-6 flex-1 hover:bg-powder-50 transition-colors">
              Annuler
            </button>
            <button type="submit" :disabled="isProcessing" class="bg-flame-500 hover:bg-flame-600 text-white font-semibold rounded-xl py-3 px-6 flex-1 transition-colors disabled:opacity-50">
              <span v-if="isProcessing" class="loading loading-spinner loading-sm"></span>
              {{ isProcessing ? 'Traitement...' : 'Payer 11,99€' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { Check, X } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const showPaymentModal = ref(false)
const isProcessing = ref(false)

const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvc = ref('')

const processPayment = async () => {
  isProcessing.value = true

  // Simulation du paiement Stripe
  try {
    // Validations simples
    if (!cardNumber.value || !cardExpiry.value || !cardCvc.value) {
      alert('❌ Veuillez remplir tous les champs')
      isProcessing.value = false
      return
    }

    // Simulation d'appel API: POST /api/payments/charge
    // En production: appel à Stripe API

    await authStore.upgradeToPremium()

    alert('✅ Paiement réussi ! Vous êtes maintenant Premium 🎉')
    showPaymentModal.value = false

    // Réinitialiser le formulaire
    cardNumber.value = ''
    cardExpiry.value = ''
    cardCvc.value = ''

    // Rediriger vers le dashboard
    router.push('/dashboard')
  } catch (error) {
    alert('❌ Erreur lors du paiement')
  } finally {
    isProcessing.value = false
  }
}
</script>
