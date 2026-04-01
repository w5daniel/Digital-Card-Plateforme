<template>
  <div class="min-h-screen bg-powder-100 dark:bg-onyx-950 py-12">
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
        <div
          class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl p-8"
        >
          <div class="mb-6">
            <h2 class="text-2xl font-bold mb-2 text-onyx-950 dark:text-powder-50">Plan Gratuit</h2>
            <p class="text-onyx-600 dark:text-powder-400">Parfait pour débuter</p>
          </div>

          <div class="mb-6">
            <span class="text-5xl font-bold text-onyx-950 dark:text-powder-50">0 FCFA</span>
            <span class="text-onyx-600 dark:text-powder-400">/mois</span>
            <p class="text-sm text-onyx-400 mt-1">(0,00 € / $0.00)</p>
          </div>

          <ul class="space-y-3 mb-8">
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">3 cartes maximum</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">8 templates gratuits</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">Export PNG</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">QR Code standard (niveau L)</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">50 polices</span>
            </li>
            <li class="flex items-center space-x-3">
              <X class="w-5 h-5 text-red-500" />
              <span class="text-onyx-400">Export PDF / JPG / JSON</span>
            </li>
            <li class="flex items-center space-x-3">
              <X class="w-5 h-5 text-red-500" />
              <span class="text-onyx-400">QR Code personnalisé</span>
            </li>
            <li class="flex items-center space-x-3">
              <X class="w-5 h-5 text-red-500" />
              <span class="text-onyx-400">Outils avancés (magnétisme, guides…)</span>
            </li>
            <li class="flex items-center space-x-3">
              <X class="w-5 h-5 text-red-500" />
              <span class="text-onyx-400">Import / Combinaisons de polices</span>
            </li>
            <li class="flex items-center space-x-3">
              <X class="w-5 h-5 text-red-500" />
              <span class="text-onyx-400">Publication communauté</span>
            </li>
          </ul>

          <button
            v-if="!authStore.hasPremium()"
            class="w-full py-3 px-6 rounded-xl bg-powder-200 text-onyx-500 font-semibold cursor-not-allowed opacity-70"
            disabled
          >
            Plan Actuel
          </button>
          <button v-else class="btn btn-outline w-full" disabled>Vous êtes Premium</button>
        </div>

        <!-- Premium Plan -->
        <div
          class="bg-powder-50 dark:bg-onyx-900 border-2 border-flame-500 rounded-2xl p-8 relative shadow-md"
        >
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span class="bg-flame-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              POPULAIRE
            </span>
          </div>

          <div class="mb-6">
            <h2 class="text-2xl font-bold mb-2 text-onyx-950 dark:text-powder-50">Plan Premium</h2>
            <p class="text-onyx-600 dark:text-powder-400">Pour les professionnels</p>
          </div>

          <div class="mb-6">
            <span class="text-5xl font-bold text-onyx-950 dark:text-powder-50"
              >{{ PREMIUM_PRICE_FCFA.toLocaleString('fr-FR') }} FCFA</span
            >
            <span class="text-onyx-600 dark:text-powder-400">/mois</span>
            <p class="text-sm text-onyx-400 mt-1">({{ premiumEur }} / {{ premiumUsd }})</p>
          </div>

          <ul class="space-y-3 mb-8">
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">Cartes illimitées</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">Tous les templates (14+)</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">Export PNG, JPG, PDF, JSON</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white"
                >QR Code personnalisé (couleurs, logo, niveaux M/Q/H)</span
              >
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white"
                >300+ polices, import et combinaisons</span
              >
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white"
                >Outils avancés (magnétisme, guides, zone sécurité)</span
              >
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">Champs personnalisés illimités</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">Publication communauté</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">Import de cartes (JSON)</span>
            </li>
            <li class="flex items-center space-x-3">
              <Check class="w-5 h-5 text-green-500" />
              <span class="text-onyx-900 dark:text-white">Support prioritaire</span>
            </li>
          </ul>

          <button
            v-if="authStore.hasPremium()"
            class="w-full py-3 px-6 rounded-xl bg-flame-500 text-white font-semibold cursor-not-allowed opacity-70"
            disabled
          >
            Plan Actif
          </button>
          <button
            v-else
            @click="showPaymentModal = true"
            class="bg-flame-500 hover:bg-flame-600 text-white w-full font-semibold rounded-xl py-3 px-6 transition-colors"
          >
            Acheter Premium
          </button>
        </div>
      </div>

      <!-- Features Comparison -->
      <div
        class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl p-8"
      >
        <h3 class="text-2xl font-bold mb-6 text-onyx-950 dark:text-powder-50">
          Comparaison détaillée
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-powder-200 dark:border-onyx-800">
                <th class="text-left py-3 font-semibold text-onyx-950 dark:text-powder-50">
                  Fonctionnalité
                </th>
                <th class="text-center py-3 font-semibold text-onyx-950 dark:text-powder-50">
                  Gratuit
                </th>
                <th class="text-center py-3 font-semibold text-onyx-950 dark:text-powder-50">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-powder-200 dark:divide-onyx-800">
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Nombre de cartes</td>
                <td class="text-center text-onyx-900 dark:text-powder-100">3</td>
                <td class="text-center text-onyx-900 dark:text-powder-100">Illimité</td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Templates</td>
                <td class="text-center text-onyx-900 dark:text-powder-100">8</td>
                <td class="text-center text-onyx-900 dark:text-powder-100">14+</td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Export</td>
                <td class="text-center text-onyx-900 dark:text-powder-100">PNG</td>
                <td class="text-center text-onyx-900 dark:text-powder-100">PNG, JPG, PDF, JSON</td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">QR Code</td>
                <td class="text-center text-onyx-900 dark:text-powder-100">Standard (L)</td>
                <td class="text-center text-onyx-900 dark:text-powder-100">
                  Personnalisé (L/M/Q/H)
                </td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Polices</td>
                <td class="text-center text-onyx-900 dark:text-powder-100">50</td>
                <td class="text-center text-onyx-900 dark:text-powder-100">300+ / Import</td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Combinaisons de polices</td>
                <td class="text-center">
                  <X class="w-5 h-5 text-red-500 inline" />
                </td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Champs personnalisés</td>
                <td class="text-center">
                  <X class="w-5 h-5 text-red-500 inline" />
                </td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Outils avancés</td>
                <td class="text-center">
                  <X class="w-5 h-5 text-red-500 inline" />
                </td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Import de cartes</td>
                <td class="text-center">
                  <X class="w-5 h-5 text-red-500 inline" />
                </td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Partage lien</td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Publication communauté</td>
                <td class="text-center">
                  <X class="w-5 h-5 text-red-500 inline" />
                </td>
                <td class="text-center">
                  <Check class="w-5 h-5 text-green-500 inline" />
                </td>
              </tr>
              <tr>
                <td class="py-3 text-onyx-900 dark:text-powder-100">Support prioritaire</td>
                <td class="text-center">
                  <X class="w-5 h-5 text-red-500 inline" />
                </td>
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
      <div
        class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl max-w-md w-full p-8"
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-onyx-950 dark:text-powder-50">Paiement Sécurisé</h3>
          <button @click="showPaymentModal = false" class="btn btn-ghost btn-sm btn-circle">
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Payment method tabs — sliding pill -->
        <div class="relative flex bg-powder-100 dark:bg-onyx-800 rounded-2xl p-1.5 mb-5">
          <!-- Sliding pill -->
          <div
            class="absolute top-1.5 bottom-1.5 bg-white dark:bg-onyx-700 rounded-xl shadow-sm transition-all duration-300 ease-out"
            :style="{
              left: paymentMethod === 'mobile' ? '6px' : '50%',
              right: paymentMethod === 'mobile' ? '50%' : '6px',
            }"
          ></div>
          <button
            type="button"
            @click="switchPayment('mobile')"
            class="relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200"
            :class="
              paymentMethod === 'mobile'
                ? 'text-onyx-900 dark:text-powder-50'
                : 'text-onyx-400 dark:text-powder-500'
            "
          >
            <Smartphone class="w-4 h-4" />
            Mobile Money
          </button>
          <button
            type="button"
            @click="switchPayment('card')"
            class="relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200"
            :class="
              paymentMethod === 'card'
                ? 'text-onyx-900 dark:text-powder-50'
                : 'text-onyx-400 dark:text-powder-500'
            "
          >
            <CreditCardIcon class="w-4 h-4" />
            Carte bancaire
          </button>
        </div>

        <form @submit.prevent="processPayment" class="space-y-4">
          <Transition :name="paySlideDir" mode="out-in">
            <!-- Mobile Money fields -->
            <div v-if="paymentMethod === 'mobile'" key="mobile" class="space-y-4">
              <div>
                <label class="label">
                  <span class="label-text font-semibold">Opérateur</span>
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="op in mobileOperators"
                    :key="op.id"
                    type="button"
                    @click="mobileOperator = op.id"
                    class="border-2 rounded-xl py-3 px-3 flex flex-col items-center gap-1.5 text-xs font-bold transition-all duration-200"
                    :class="
                      mobileOperator === op.id
                        ? 'border-flame-500 bg-flame-50 dark:bg-flame-900/20 text-flame-600 dark:text-flame-400 scale-[1.02] shadow-sm'
                        : 'border-powder-200 dark:border-onyx-700 text-onyx-600 dark:text-powder-400 hover:border-onyx-300 dark:hover:border-onyx-600'
                    "
                  >
                    <!-- Orange Money logo -->
                    <img
                      v-if="op.id === 'orange'"
                      src="/Orange-Money_Logo.webp"
                      alt="Orange Money"
                      class="w-10 h-10 object-contain"
                    />
                    <!-- Wave logo -->
                    <img
                      v-else-if="op.id === 'wave'"
                      src="/wave.webp"
                      alt="Wave"
                      class="w-10 h-10 object-contain"
                    />
                    {{ op.label }}
                  </button>
                </div>
              </div>
              <div>
                <label class="label">
                  <span class="label-text font-semibold">Numéro de téléphone</span>
                </label>
                <input
                  v-model="mobilePhone"
                  type="tel"
                  placeholder="+226 70 00 00 00"
                  class="border border-powder-200 dark:border-onyx-700 bg-powder-50 dark:bg-onyx-800 rounded-xl px-3 py-2.5 text-sm w-full"
                />
              </div>
              <div
                class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3"
              >
                <p class="text-sm text-amber-800 dark:text-amber-300">
                  Un code de confirmation sera envoyé sur votre téléphone pour valider le paiement.
                </p>
              </div>
            </div>

            <!-- Card fields -->
            <div v-else-if="paymentMethod === 'card'" key="card" class="space-y-4">
              <div>
                <label class="label">
                  <span class="label-text font-semibold">Numéro de carte</span>
                </label>
                <input
                  v-model="cardNumber"
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  class="border border-powder-200 dark:border-onyx-700 bg-powder-50 dark:bg-onyx-800 rounded-xl px-3 py-2.5 text-sm w-full"
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
                    class="border border-powder-200 dark:border-onyx-700 bg-powder-50 dark:bg-onyx-800 rounded-xl px-3 py-2.5 text-sm w-full"
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
                    class="border border-powder-200 dark:border-onyx-700 bg-powder-50 dark:bg-onyx-800 rounded-xl px-3 py-2.5 text-sm w-full"
                    maxlength="3"
                  />
                </div>
              </div>
              <div
                class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
              >
                <p class="text-sm text-blue-800 dark:text-blue-300">
                  Test: 4242 4242 4242 4242 / 12/25 / 123
                </p>
              </div>
            </div>
          </Transition>

          <!-- Total -->
          <div class="bg-powder-100 dark:bg-onyx-800 p-4 rounded-lg">
            <div class="flex justify-between mb-2">
              <span class="text-onyx-700 dark:text-powder-300">Plan Premium mensuel</span>
              <span class="text-onyx-700 dark:text-powder-300"
                >{{ PREMIUM_PRICE_FCFA.toLocaleString('fr-FR') }} FCFA</span
              >
            </div>
            <div class="flex justify-between mb-2">
              <span class="text-onyx-700 dark:text-powder-300">TVA (18%)</span>
              <span class="text-onyx-700 dark:text-powder-300"
                >{{ taxFcfa.toLocaleString('fr-FR') }} FCFA</span
              >
            </div>
            <div
              class="border-t border-powder-200 dark:border-onyx-700 pt-2 flex justify-between font-bold"
            >
              <span class="text-onyx-900 dark:text-white">Total</span>
              <span class="text-onyx-900 dark:text-white"
                >{{ totalFcfa.toLocaleString('fr-FR') }} FCFA</span
              >
            </div>
            <p class="text-[11px] text-onyx-400 mt-1 text-right">
              ≈ {{ totalEur }} / {{ totalUsd }}
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex gap-2">
            <button
              type="button"
              @click="showPaymentModal = false"
              class="bg-powder-50 dark:bg-onyx-900 border border-onyx-200 dark:border-onyx-700 text-onyx-800 dark:text-powder-200 rounded-xl py-3 px-6 flex-1 hover:bg-powder-100 dark:hover:bg-onyx-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="isProcessing"
              class="bg-flame-500 hover:bg-flame-600 text-white font-semibold rounded-xl py-3 px-6 flex-1 transition-colors disabled:opacity-50"
            >
              <span v-if="isProcessing" class="loading loading-spinner loading-sm"></span>
              {{
                isProcessing ? 'Traitement...' : `Payer ${totalFcfa.toLocaleString('fr-FR')} FCFA`
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { Check, X, CreditCard as CreditCardIcon, Smartphone } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const notif = useNotificationStore()

// ── Prix en FCFA ──────────────────────────────────────────────
const PREMIUM_PRICE_FCFA = 4990
const TAX_RATE = 0.18 // TVA 18% (zone UEMOA)
const taxFcfa = computed(() => Math.round(PREMIUM_PRICE_FCFA * TAX_RATE))
const totalFcfa = computed(() => PREMIUM_PRICE_FCFA + taxFcfa.value)

// ── Taux de change ────────────────────────────────────────────
// XOF (FCFA BCEAO) est indexé sur l'EUR : 1 EUR = 655,957 XOF (taux fixe)
const XOF_PER_EUR = 655.957
const usdPerEur = ref(1.08) // fallback, mis à jour au montage

function formatEur(fcfa) {
  return (fcfa / XOF_PER_EUR).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  })
}
function formatUsd(fcfa) {
  return ((fcfa / XOF_PER_EUR) * usdPerEur.value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  })
}

const premiumEur = computed(() => formatEur(PREMIUM_PRICE_FCFA))
const premiumUsd = computed(() => formatUsd(PREMIUM_PRICE_FCFA))
const totalEur = computed(() => formatEur(totalFcfa.value))
const totalUsd = computed(() => formatUsd(totalFcfa.value))

// Récupérer le taux USD/EUR à jour depuis une API gratuite
async function fetchExchangeRate() {
  try {
    const res = await fetch('https://api.exchangerate.host/latest?base=EUR&symbols=USD')
    const data = await res.json()
    if (data?.rates?.USD) {
      usdPerEur.value = data.rates.USD
    }
  } catch {
    // fallback 1.08 déjà défini
    try {
      const res2 = await fetch('https://open.er-api.com/v6/latest/EUR')
      const data2 = await res2.json()
      if (data2?.rates?.USD) {
        usdPerEur.value = data2.rates.USD
      }
    } catch {
      // silently keep fallback
    }
  }
}

onMounted(fetchExchangeRate)

// ── Modal paiement ────────────────────────────────────────────
const showPaymentModal = ref(false)
const isProcessing = ref(false)
const paymentMethod = ref('mobile') // 'mobile' | 'card'
const paySlideDir = ref('pay-slide-left')

function switchPayment(method) {
  if (method === paymentMethod.value) return
  paySlideDir.value = method === 'card' ? 'pay-slide-left' : 'pay-slide-right'
  paymentMethod.value = method
}

// Mobile Money
const mobileOperator = ref('orange')
const mobilePhone = ref('')
const mobileOperators = [
  { id: 'orange', label: 'Orange Money' },
  { id: 'wave', label: 'Wave' },
]

// Carte bancaire
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvc = ref('')

const processPayment = async () => {
  isProcessing.value = true

  try {
    if (paymentMethod.value === 'mobile') {
      if (!mobilePhone.value) {
        notif.error('Veuillez entrer votre numéro de téléphone')
        isProcessing.value = false
        return
      }
    } else {
      if (!cardNumber.value || !cardExpiry.value || !cardCvc.value) {
        notif.error('Veuillez remplir tous les champs de la carte')
        isProcessing.value = false
        return
      }
    }

    // Simulation d'appel API
    await authStore.upgradeToPremium()

    const method =
      paymentMethod.value === 'mobile'
        ? mobileOperators.find((o) => o.id === mobileOperator.value)?.label || 'Mobile Money'
        : 'Carte bancaire'
    notif.success(`Paiement via ${method} réussi ! Vous êtes maintenant Premium`)
    showPaymentModal.value = false

    cardNumber.value = ''
    cardExpiry.value = ''
    cardCvc.value = ''
    mobilePhone.value = ''

    router.push('/dashboard')
  } catch (error) {
    notif.error('Erreur lors du paiement. Veuillez réessayer.')
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
/* ── Payment tab slide transitions ──────────────────────────── */
.pay-slide-left-enter-active,
.pay-slide-left-leave-active,
.pay-slide-right-enter-active,
.pay-slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.pay-slide-left-enter-from {
  transform: translateX(30px);
  opacity: 0;
}
.pay-slide-left-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}
.pay-slide-right-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}
.pay-slide-right-leave-to {
  transform: translateX(30px);
  opacity: 0;
}
</style>
