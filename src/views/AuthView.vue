<template>
  <div class="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
    <!-- Animated dark gradient background -->
    <div class="absolute inset-0 auth-animated-bg"></div>

    <!-- Floating blur blobs -->
    <div
      class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"
    ></div>
    <div
      class="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"
    ></div>

    <!-- Main card -->
    <div
      class="relative z-10 w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
    >
      <!-- ══════════════════ LEFT — Brand Panel ══════════════════ -->
      <div
        class="hidden lg:flex flex-col justify-between w-2/5 p-10 auth-brand-panel relative overflow-hidden"
      >
        <!-- Decorative orbs -->
        <div
          class="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 pointer-events-none"
        ></div>
        <div
          class="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-black/15 pointer-events-none"
        ></div>

        <!-- Logo -->
        <router-link to="/" class="relative flex items-center space-x-3 group w-fit">
          <img
            src="/logo-ECODEV.png"
            alt="ECODEV"
            class="h-9 w-auto filter brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <div class="border-l border-white/30 pl-3">
            <p class="text-xs font-semibold text-white/80 uppercase tracking-widest">Card Pro</p>
          </div>
        </router-link>

        <!-- Center — switches on mode change -->
        <div class="relative flex-1 flex flex-col justify-center py-10">
          <Transition name="panel-fade" mode="out-in">
            <div v-if="!isRegister" key="login-panel" class="space-y-4">
              <h2 class="text-4xl font-extrabold text-white leading-tight">
                Bon retour<br />parmi nous !
              </h2>
              <p class="text-white/65 text-sm leading-relaxed">
                Accédez à vos cartes de visite digitales et gérez votre présence professionnelle en
                un instant.
              </p>
            </div>
            <div v-else key="register-panel" class="space-y-4">
              <h2 class="text-4xl font-extrabold text-white leading-tight">
                Créez votre<br />identité digitale
              </h2>
              <p class="text-white/65 text-sm leading-relaxed">
                Rejoignez des milliers de professionnels qui partagent leur contact avec style grâce
                à ECODEV.
              </p>
            </div>
          </Transition>

          <!-- Feature bullets -->
          <div class="mt-8 space-y-3">
            <div v-for="feat in features" :key="feat" class="flex items-center space-x-3">
              <div
                class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"
              >
                <Check class="w-3.5 h-3.5 text-white" />
              </div>
              <span class="text-white/75 text-sm">{{ feat }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <p class="relative text-white/30 text-xs">© 2026 ECODEV CARD PRO</p>
      </div>

      <!-- ══════════════════ RIGHT — Form Panel ══════════════════ -->
      <div class="flex-1 bg-white dark:bg-slate-900 flex flex-col min-h-[640px]">
        <!-- Mobile logo -->
        <div class="flex justify-center pt-8 pb-2 lg:hidden">
          <router-link to="/" class="flex flex-col items-center">
            <img src="/logo-ECODEV.png" alt="ECODEV" class="h-10 w-auto" />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Cartes digitales</p>
          </router-link>
        </div>

        <!-- Tab switcher -->
        <div class="px-8 pt-10 pb-6">
          <div class="relative flex bg-gray-100 dark:bg-slate-800 rounded-2xl p-1.5">
            <!-- Sliding pill -->
            <div
              class="absolute top-1.5 bottom-1.5 bg-white dark:bg-slate-700 rounded-xl shadow-sm transition-all duration-300 ease-out"
              :style="pillStyle"
            ></div>
            <button
              ref="tab0"
              @click="switchTo('login')"
              class="relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200"
              :class="
                !isRegister ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
              "
            >
              Connexion
            </button>
            <button
              ref="tab1"
              @click="switchTo('register')"
              class="relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200"
              :class="
                isRegister ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
              "
            >
              Inscription
            </button>
          </div>
        </div>

        <!-- Form area -->
        <div class="flex-1 overflow-hidden px-8 pb-10">
          <Transition :name="slideDir" mode="out-in">
            <!-- ── Login Form ── -->
            <div v-if="!isRegister" key="login-form">
              <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Connectez-vous à votre compte ECODEV CARD PRO
              </p>
              <form @submit.prevent="handleLogin" class="space-y-5">
                <!-- Email -->
                <div>
                  <label
                    class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Email
                  </label>
                  <div class="relative">
                    <Mail
                      class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    />
                    <input
                      v-model="loginEmail"
                      type="email"
                      placeholder="votre@email.com"
                      class="auth-input pl-10 pr-3.5"
                      required
                    />
                  </div>
                </div>

                <!-- Password -->
                <div>
                  <label
                    class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Mot de passe
                  </label>
                  <div class="relative">
                    <Lock
                      class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    />
                    <input
                      v-model="loginPassword"
                      :type="showLoginPassword ? 'text' : 'password'"
                      placeholder="••••••••"
                      class="auth-input pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      @click="showLoginPassword = !showLoginPassword"
                      class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      <Eye v-if="!showLoginPassword" class="w-4 h-4" />
                      <EyeOff v-else class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- Remember + Forgot -->
                <div class="flex items-center justify-between text-sm">
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="rememberMe"
                      class="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-700"
                    />
                    <span class="text-gray-600 dark:text-gray-400">Se souvenir</span>
                  </label>
                  <button
                    type="button"
                    class="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <!-- Error -->
                <div
                  v-if="authStore.error"
                  class="flex items-center space-x-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                >
                  <AlertCircle class="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span class="text-sm text-red-600 dark:text-red-400">{{ authStore.error }}</span>
                </div>

                <!-- Submit -->
                <button type="submit" :disabled="authStore.isLoading" class="auth-submit-btn">
                  <span v-if="authStore.isLoading" class="auth-spinner"></span>
                  <LogIn v-else class="w-4 h-4" />
                  <span>{{ authStore.isLoading ? 'Connexion…' : 'Se connecter' }}</span>
                </button>
              </form>

              <!-- Demo hint -->
              <div
                class="mt-6 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/40"
              >
                <p class="text-xs text-blue-600 dark:text-blue-400">
                  <strong>Mode démo :</strong> n'importe quel email + mot de passe ≥ 6 caractères
                </p>
              </div>
            </div>

            <!-- ── Register Form ── -->
            <div v-else key="register-form">
              <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Créez votre compte ECODEV CARD PRO gratuitement
              </p>
              <form @submit.prevent="handleRegister" class="space-y-4">
                <!-- Full name -->
                <div>
                  <label
                    class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Nom complet
                  </label>
                  <div class="relative">
                    <User
                      class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    />
                    <input
                      v-model="regFullName"
                      type="text"
                      placeholder="Jean Dupont"
                      class="auth-input pl-10 pr-3.5"
                      required
                    />
                  </div>
                </div>

                <!-- Email -->
                <div>
                  <label
                    class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Email
                  </label>
                  <div class="relative">
                    <Mail
                      class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    />
                    <input
                      v-model="regEmail"
                      type="email"
                      placeholder="votre@email.com"
                      class="auth-input pl-10 pr-3.5"
                      required
                    />
                  </div>
                </div>

                <!-- Password -->
                <div>
                  <label
                    class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Mot de passe
                    <span class="ml-1 text-xs text-gray-400 font-normal"
                      >(6 caractères minimum)</span
                    >
                  </label>
                  <div class="relative">
                    <Lock
                      class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    />
                    <input
                      v-model="regPassword"
                      :type="showRegPassword ? 'text' : 'password'"
                      placeholder="••••••••"
                      class="auth-input pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      @click="showRegPassword = !showRegPassword"
                      class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      <Eye v-if="!showRegPassword" class="w-4 h-4" />
                      <EyeOff v-else class="w-4 h-4" />
                    </button>
                  </div>
                  <!-- Strength bar -->
                  <div v-if="regPassword" class="mt-1.5 flex space-x-1">
                    <div
                      v-for="i in 4"
                      :key="i"
                      class="h-1 flex-1 rounded-full transition-colors duration-300"
                      :class="
                        i <= passwordStrength ? strengthColor : 'bg-gray-200 dark:bg-slate-700'
                      "
                    ></div>
                  </div>
                </div>

                <!-- Confirm Password -->
                <div>
                  <label
                    class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Confirmer le mot de passe
                  </label>
                  <div class="relative">
                    <Lock
                      class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    />
                    <input
                      v-model="regConfirm"
                      :type="showRegPassword ? 'text' : 'password'"
                      placeholder="••••••••"
                      class="auth-input pl-10 pr-10"
                      :class="
                        regConfirm && regConfirm !== regPassword
                          ? 'border-red-400 dark:border-red-500'
                          : ''
                      "
                      required
                    />
                    <div v-if="regConfirm" class="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <CheckCircle
                        v-if="regConfirm === regPassword"
                        class="w-4 h-4 text-green-500"
                      />
                      <XCircle v-else class="w-4 h-4 text-red-400" />
                    </div>
                  </div>
                </div>

                <!-- Error -->
                <div
                  v-if="authStore.error"
                  class="flex items-center space-x-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                >
                  <AlertCircle class="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span class="text-sm text-red-600 dark:text-red-400">{{ authStore.error }}</span>
                </div>

                <!-- Submit -->
                <button type="submit" :disabled="authStore.isLoading" class="auth-submit-btn mt-2">
                  <span v-if="authStore.isLoading" class="auth-spinner"></span>
                  <UserPlus v-else class="w-4 h-4" />
                  <span>{{ authStore.isLoading ? 'Création…' : 'Créer mon compte' }}</span>
                </button>

                <!-- Terms -->
                <p class="text-xs text-center text-gray-400 dark:text-gray-500">
                  En créant un compte, vous acceptez nos
                  <button type="button" class="text-primary-500 hover:underline">
                    conditions d'utilisation
                  </button>
                </p>
              </form>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Check,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// ── Mode ──────────────────────────────────────────────────────────────
const isRegister = computed(() => route.name === 'register')
const slideDir = ref('slide-left')

const switchTo = (mode) => {
  authStore.error = null
  if (mode === 'login' && isRegister.value) {
    slideDir.value = 'slide-right'
    router.push('/login')
  } else if (mode === 'register' && !isRegister.value) {
    slideDir.value = 'slide-left'
    router.push('/register')
  }
}

// ── Tab sliding pill ───────────────────────────────────────────────────
const pillStyle = computed(() => ({
  left: isRegister.value ? '50%' : '6px',
  right: isRegister.value ? '6px' : '50%',
}))

// ── Brand panel features ───────────────────────────────────────────────
const features = [
  'Cartes professionnelles en quelques minutes',
  'QR Code intégré pour partager vos contacts',
  'Verso personnalisable avec vos infos clés',
]

// ── Login form ────────────────────────────────────────────────────────
const loginEmail = ref('')
const loginPassword = ref('')
const showLoginPassword = ref(false)
const rememberMe = ref(false)

const handleLogin = async () => {
  try {
    await authStore.login(loginEmail.value, loginPassword.value)
    router.push('/dashboard')
  } catch {
    // error set in store
  }
}

// ── Register form ─────────────────────────────────────────────────────
const regFullName = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regConfirm = ref('')
const showRegPassword = ref(false)

const passwordStrength = computed(() => {
  const p = regPassword.value
  if (!p) return 0
  let score = 0
  if (p.length >= 6) score++
  if (p.length >= 10) score++
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthColor = computed(() => {
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
  return colors[passwordStrength.value - 1] || 'bg-red-400'
})

const handleRegister = async () => {
  try {
    await authStore.register(regEmail.value, regPassword.value, regConfirm.value, regFullName.value)
    router.push('/dashboard')
  } catch {
    // error set in store
  }
}

// Clear errors when switching
watch(isRegister, () => {
  authStore.error = null
})
</script>

<style scoped>
/* ── Animated background ──────────────────────────────────────────── */
@keyframes authBg {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.auth-animated-bg {
  background: linear-gradient(
    270deg,
    #0f172a,
    #1e1b4b,
    #0c1a35,
    #0f3460,
    #1a1745,
    #1e293b,
    #0d2137,
    #0f172a
  );
  background-size: 600% 600%;
  animation: authBg 20s ease infinite;
}

/* ── Brand panel ──────────────────────────────────────────────────── */
.auth-brand-panel {
  background: linear-gradient(145deg, #4f46e5 0%, #7c3aed 55%, #2563eb 100%);
}

/* ── Input ────────────────────────────────────────────────────────── */
.auth-input {
  @apply w-full rounded-xl border border-gray-200 dark:border-slate-700
         bg-gray-50 dark:bg-slate-800
         text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
         py-2.5 text-sm
         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
         transition-all duration-200;
}

/* ── Submit button ────────────────────────────────────────────────── */
.auth-submit-btn {
  @apply w-full flex items-center justify-center space-x-2
         bg-gradient-to-r from-primary-600 to-primary-500
         hover:from-primary-700 hover:to-primary-600
         disabled:opacity-60 disabled:cursor-not-allowed
         text-white font-semibold rounded-xl
         py-3 px-6 text-sm
         shadow-lg shadow-primary-500/30
         transition-all duration-200
         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

/* ── Spinner ──────────────────────────────────────────────────────── */
.auth-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Form slide transitions ───────────────────────────────────────── */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  transform: translateX(40px);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-40px);
  opacity: 0;
}
.slide-right-enter-from {
  transform: translateX(-40px);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(40px);
  opacity: 0;
}

/* ── Brand panel content transition ──────────────────────────────── */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: all 0.4s ease;
}
.panel-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
