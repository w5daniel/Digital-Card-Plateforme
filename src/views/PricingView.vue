<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">Plans Tarifaires</h1>
        <p class="text-xl text-gray-600 dark:text-gray-400">
          Choisissez le plan qui vous convient et créez des cartes illimitées
        </p>
      </div>

      <!-- Pricing Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <!-- Free Plan -->
        <div class="card p-8 relative">
          <div class="mb-6">
            <h2 class="text-2xl font-bold mb-2">Plan Gratuit</h2>
            <p class="text-gray-600 dark:text-gray-400">Parfait pour débuter</p>
          </div>

          <div class="mb-6">
            <span class="text-5xl font-bold">0€</span>
            <span class="text-gray-600 dark:text-gray-400">/mois</span>
          </div>

          <ul class="space-y-3 mb-8">
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span>3 Cartes maximum</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span>Templates gratuits</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span>Export vCard</span>
            </li>
            <li class="flex items-center space-x-3">
              <X class="w-5 h-5 text-red-500" />
              <span class="text-gray-400">Cartes illimitées</span>
            </li>
            <li class="flex items-center space-x-3">
              <X class="w-5 h-5 text-red-500" />
              <span class="text-gray-400">Templates premium</span>
            </li>
            <li class="flex items-center space-x-3">
              <X class="w-5 h-5 text-red-500" />
              <span class="text-gray-400">Analytics avancé</span>
            </li>
          </ul>

          <button v-if="!authStore.hasPremium()" class="btn btn-outline w-full" disabled>
            Plan Actuel
          </button>
          <button v-else class="btn btn-outline w-full" disabled>Vous êtes Premium</button>
        </div>

        <!-- Premium Plan -->
        <div class="card p-8 relative border-2 border-primary-500 shadow-lg">
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span class="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              ⭐ POPULAIRE
            </span>
          </div>

          <div class="mb-6">
            <h2 class="text-2xl font-bold mb-2">Plan Premium</h2>
            <p class="text-gray-600 dark:text-gray-400">Pour les professionnels</p>
          </div>

          <div class="mb-6">
            <span class="text-5xl font-bold">9,99€</span>
            <span class="text-gray-600 dark:text-gray-400">/mois</span>
          </div>

          <ul class="space-y-3 mb-8">
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span>Cartes illimitées</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span>Tous les templates</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span>Export vCard + QR Code</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span>Import/Export JSON</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span>Analytics avancé</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span>Support prioritaire</span>
            </li>
          </ul>

          <button v-if="authStore.hasPremium()" class="btn btn-primary w-full" disabled>
            ✓ Plan Actif
          </button>
          <button v-else @click="showPaymentModal = true" class="btn btn-primary w-full">
            Acheter Premium
          </button>
        </div>
      </div>

      <!-- Features Comparison -->
      <div class="card p-8">
        <h3 class="text-2xl font-bold mb-6">Comparaison des Features</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 dark:border-slate-700">
                <th class="text-left py-3 font-semibold">Feature</th>
                <th class="text-center py-3 font-semibold">Gratuit</th>
                <th class="text-center py-3 font-semibold">Premium</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-slate-700">
              <tr>
                <td class="py-3">Nombre de cartes</td>
                <td class="text-center">3</td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3">Templates</td>
                <td class="text-center">6</td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3">QR Code</td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3">Export vCard</td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3">Partage publique</td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3">Import/Export JSON</td>
                <td class="text-center" />
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3">Analytics</td>
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
      <div class="card max-w-md w-full p-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold">Paiement Sécurisé</h3>
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
              class="input input-bordered w-full"
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
                class="input input-bordered w-full"
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
                class="input input-bordered w-full"
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
          <div class="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
            <div class="flex justify-between mb-2">
              <span>Plan Premium mensuel</span>
              <span>9,99€</span>
            </div>
            <div class="flex justify-between mb-2">
              <span>Tax (20%)</span>
              <span>2,00€</span>
            </div>
            <div
              class="border-t border-gray-200 dark:border-slate-600 pt-2 flex justify-between font-bold"
            >
              <span>Total</span>
              <span>11,99€</span>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex gap-2">
            <button type="button" @click="showPaymentModal = false" class="btn btn-outline flex-1">
              Annuler
            </button>
            <button type="submit" :disabled="isProcessing" class="btn btn-primary flex-1">
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
