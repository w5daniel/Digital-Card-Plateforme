<template>
  <div
    class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center px-4 py-12"
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
          <p class="text-sm text-base-content/50">Cartes digitales</p>
        </router-link>
        <h1 class="text-3xl font-bold mb-2">Connexion</h1>
        <p class="text-base-content/50">
          Connectez-vous à votre compte ECODEV CARD PRO
        </p>
      </div>

      <!-- Form Card -->
      <div class="card bg-base-100 shadow-xl p-8">
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
              class="input input-bordered w-full bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary"
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
              class="input input-bordered w-full bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <!-- Error Message -->
          <div
            v-if="authStore.error"
            class="alert alert-error"
          >
            <span>{{ authStore.error }}</span>
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
          <p class="text-base-content/50">
            Pas encore de compte?
            <router-link
              to="/register"
              class="font-semibold text-primary hover:underline"
            >
              S'inscrire
            </router-link>
          </p>
        </div>
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
