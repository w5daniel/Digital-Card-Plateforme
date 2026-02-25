<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 py-12"
  >
    <div class="w-full max-w-md">
      <!-- Logo Section -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex flex-col items-center space-y-2 group mb-6">
          <img
            src="/logo-ECODEV.png"
            alt="ECODEV Logo"
            class="h-12 w-auto transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
          />
          <p class="text-sm text-gray-600 dark:text-gray-400">Cartes digitales</p>
        </router-link>
        <h1 class="text-3xl font-bold mb-2">Inscription</h1>
        <p class="text-gray-600 dark:text-gray-400">
          Créez votre compte ECODEV-CARD puis commencez
        </p>
      </div>

      <!-- Form Card -->
      <div class="card bg-white dark:bg-slate-800 shadow-xl p-8">
        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Full Name Input -->
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text font-semibold">Nom complet</span>
            </label>
            <input
              v-model="fullName"
              type="text"
              placeholder="Jean Dupont"
              class="input input-bordered w-full bg-gray-50 dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <!-- Email Input -->
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text font-semibold">Email</span>
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="votre@email.com"
              class="input input-bordered w-full bg-gray-50 dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <!-- Password Input -->
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text font-semibold">Mot de passe</span>
            </label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="input input-bordered w-full bg-gray-50 dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <label class="label">
              <span class="label-text-alt text-gray-500 dark:text-gray-400"
                >Minimum 6 caractères</span
              >
            </label>
          </div>

          <!-- Confirm Password Input -->
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text font-semibold">Confirmer le mot de passe</span>
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              class="input input-bordered w-full bg-gray-50 dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <!-- Error Message -->
          <div
            v-if="authStore.error"
            class="alert alert-error bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <span class="text-red-700 dark:text-red-400">{{ authStore.error }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="btn btn-primary w-full text-white font-semibold mt-6"
          >
            <span v-if="authStore.isLoading" class="loading loading-spinner loading-sm"></span>
            {{ authStore.isLoading ? 'Inscription en cours...' : "S'inscrire" }}
          </button>
        </form>

        <!-- Divider -->
        <div class="divider my-6">ou</div>

        <!-- Login Link -->
        <div class="text-center">
          <p class="text-gray-600 dark:text-gray-400">
            Vous avez déjà un compte?
            <router-link
              to="/login"
              class="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Se connecter
            </router-link>
          </p>
        </div>
      </div>

      <!-- Terms & Conditions -->
      <div class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          En créant un compte, vous acceptez nos
          <router-link to="#" class="link link-primary">conditions d'utilisation</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const handleRegister = async () => {
  try {
    await authStore.register(email.value, password.value, confirmPassword.value, fullName.value)
    // Redirect to dashboard after successful registration
    router.push('/dashboard')
  } catch (error) {
    // Error is set in the store
    console.error('Registration failed:', error)
  }
}
</script>
