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
        <h1 class="text-3xl font-bold mb-2">Connexion</h1>
        <p class="text-gray-600 dark:text-gray-400">
          Connectez-vous à votre compte ECODEV CARD PRO
        </p>
      </div>

      <!-- Form Card -->
      <div class="card bg-white dark:bg-slate-800 shadow-xl p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
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
            class="btn btn-primary w-full text-white font-semibold"
          >
            <span v-if="authStore.isLoading" class="loading loading-spinner loading-sm"></span>
            {{ authStore.isLoading ? 'Connexion en cours...' : 'Se connecter' }}
          </button>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between text-sm">
            <label class="label cursor-pointer flex items-center gap-2">
              <input type="checkbox" class="checkbox checkbox-sm" />
              <span class="label-text">Se souvenir de moi</span>
            </label>
            <router-link to="#" class="link link-primary">Mot de passe oublié?</router-link>
          </div>
        </form>

        <!-- Divider -->
        <div class="divider my-6">ou</div>

        <!-- Register Link -->
        <div class="text-center">
          <p class="text-gray-600 dark:text-gray-400">
            Pas encore de compte?
            <router-link
              to="/register"
              class="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              S'inscrire
            </router-link>
          </p>
        </div>
      </div>

      <!-- Demo Info -->
      <div
        class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
      >
        <p class="text-sm text-blue-700 dark:text-blue-400">
          <strong>Mode démo:</strong> Utilisez n'importe quel email et un mot de passe d'au moins 6
          caractères
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

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value)
    // Redirect to dashboard after successful login
    router.push('/dashboard')
  } catch (error) {
    // Error is set in the store
    console.error('Login failed:', error)
  }
}
</script>
