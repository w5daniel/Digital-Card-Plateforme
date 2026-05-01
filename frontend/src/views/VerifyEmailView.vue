<template>
  <div
    class="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-onyx-950"
  >
    <!-- Background -->
    <div class="absolute inset-0 auth-animated-bg"></div>
    <div
      class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-onyx-800/20 blur-3xl pointer-events-none"
    ></div>
    <div
      class="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-onyx-800/20 blur-3xl pointer-events-none"
    ></div>

    <!-- Card -->
    <div
      class="relative z-10 w-full max-w-md bg-powder-50 dark:bg-onyx-900 rounded-3xl shadow-2xl ring-1 ring-white/10 p-10"
    >
      <!-- Logo -->
      <div class="flex justify-center mb-8">
        <router-link to="/" class="flex flex-col items-center">
          <img src="/logo-ECODEV.png" alt="ECODEV" class="h-10 w-auto" />
          <p class="text-xs text-onyx-500 dark:text-powder-500 mt-1">Cartes digitales</p>
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="status === 'loading'" class="flex flex-col items-center text-center space-y-4">
        <div class="w-14 h-14 rounded-full bg-flame-100 dark:bg-flame-900/30 flex items-center justify-center">
          <span class="verify-spinner"></span>
        </div>
        <p class="text-onyx-600 dark:text-powder-400 text-sm">Vérification en cours…</p>
      </div>

      <!-- Success -->
      <div v-else-if="status === 'success'" class="flex flex-col items-center text-center space-y-5">
        <div
          class="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"
        >
          <CheckCircle class="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div class="space-y-2">
          <h2 class="text-xl font-bold text-onyx-900 dark:text-white">Email confirmé !</h2>
          <p class="text-sm text-onyx-500 dark:text-powder-400">
            Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter.
          </p>
        </div>
        <button type="button" @click="router.push('/login')" class="auth-submit-btn">
          <LogIn class="w-4 h-4" />
          <span>Se connecter</span>
        </button>
      </div>

      <!-- Already verified -->
      <div v-else-if="status === 'already'" class="flex flex-col items-center text-center space-y-5">
        <div
          class="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
        >
          <CheckCircle class="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div class="space-y-2">
          <h2 class="text-xl font-bold text-onyx-900 dark:text-white">Déjà vérifié</h2>
          <p class="text-sm text-onyx-500 dark:text-powder-400">
            Cet email est déjà confirmé. Connectez-vous directement.
          </p>
        </div>
        <button type="button" @click="router.push('/login')" class="auth-submit-btn">
          <LogIn class="w-4 h-4" />
          <span>Se connecter</span>
        </button>
      </div>

      <!-- Expired -->
      <div v-else-if="status === 'expired'" class="flex flex-col items-center text-center space-y-5">
        <div
          class="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"
        >
          <AlertCircle class="w-8 h-8 text-amber-500 dark:text-amber-400" />
        </div>
        <div class="space-y-2">
          <h2 class="text-xl font-bold text-onyx-900 dark:text-white">Lien expiré</h2>
          <p class="text-sm text-onyx-500 dark:text-powder-400">
            Ce lien de vérification a expiré. Demandez-en un nouveau ci-dessous.
          </p>
        </div>
        <ResendBlock :email="emailForResend" />
      </div>

      <!-- Error -->
      <div v-else class="flex flex-col items-center text-center space-y-5">
        <div
          class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
        >
          <XCircle class="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <div class="space-y-2">
          <h2 class="text-xl font-bold text-onyx-900 dark:text-white">Lien invalide</h2>
          <p class="text-sm text-onyx-500 dark:text-powder-400">
            Ce lien de vérification est invalide. Vous pouvez en demander un nouveau.
          </p>
        </div>
        <ResendBlock :email="emailForResend" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineComponent, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { CheckCircle, XCircle, AlertCircle, LogIn, Mail } from 'lucide-vue-next'
import api from '@/api/axios'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const status = ref('loading') // 'loading' | 'success' | 'already' | 'expired' | 'error'
const emailForResend = ref(route.query.email ?? '')

// Inline resend block component
const ResendBlock = defineComponent({
  props: { email: String },
  setup(props) {
    const email = ref(props.email ?? '')
    const loading = ref(false)
    const sent = ref(false)

    const send = async () => {
      if (!email.value.trim()) return
      loading.value = true
      await authStore.resendVerificationEmail(email.value.trim())
      loading.value = false
      sent.value = true
    }

    return () =>
      h('div', { class: 'w-full space-y-3' }, [
        sent.value
          ? h('p', { class: 'text-sm text-emerald-600 dark:text-emerald-400 text-center' },
              'Email envoyé ! Vérifiez votre boîte mail.')
          : h('div', { class: 'flex gap-2' }, [
              h('input', {
                value: email.value,
                onInput: (e) => { email.value = e.target.value },
                type: 'email',
                placeholder: 'votre@email.com',
                class: 'flex-1 px-3 py-2.5 rounded-xl border border-powder-200 dark:border-onyx-700 bg-white dark:bg-onyx-800 text-sm text-onyx-900 dark:text-powder-100 focus:outline-none focus:ring-2 focus:ring-flame-500',
              }),
              h('button', {
                type: 'button',
                disabled: loading.value,
                onClick: send,
                class: 'px-4 py-2.5 rounded-xl bg-flame-500 hover:bg-flame-600 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center gap-1.5',
              }, [
                loading.value
                  ? h('span', { class: 'verify-spinner-sm' })
                  : h(Mail, { class: 'w-4 h-4' }),
                'Renvoyer',
              ]),
            ]),
        h('button', {
          type: 'button',
          onClick: () => router.push('/login'),
          class: 'w-full text-sm text-onyx-500 dark:text-powder-500 hover:text-flame-600 dark:hover:text-flame-400 transition-colors',
        }, 'Retour à la connexion'),
      ])
  },
})

onMounted(async () => {
  const { id, hash, expires, signature } = route.query
  if (!id || !hash || !expires || !signature) {
    status.value = 'error'
    return
  }
  try {
    const { data } = await api.get(`/api/email/verify/${id}/${hash}`, {
      params: { expires, signature },
    })
    if (data.message?.includes('déjà vérifié')) {
      status.value = 'already'
    } else {
      status.value = 'success'
    }
  } catch (err) {
    const code = err.response?.status
    if (code === 410) {
      status.value = 'expired'
    } else {
      status.value = 'error'
    }
  }
})
</script>

<style scoped>
.auth-animated-bg {
  background: linear-gradient(270deg, #397256, #1c2a24, #18363d, #0f1a16, #397256);
  background-size: 400% 400%;
  animation: authBg 20s ease infinite;
}
@keyframes authBg {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.auth-submit-btn {
  @apply w-full flex items-center justify-center space-x-2
         bg-flame-500 hover:bg-flame-600
         disabled:opacity-60 disabled:cursor-not-allowed
         text-white font-semibold rounded-xl
         py-3 px-6 text-sm shadow-sm
         transition-all duration-200
         focus:outline-none focus:ring-2 focus:ring-flame-500 focus:ring-offset-2;
}

.verify-spinner {
  display: inline-block;
  width: 28px;
  height: 28px;
  border: 3px solid rgba(239, 68, 68, 0.2);
  border-top-color: #ef4444;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.verify-spinner-sm {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
