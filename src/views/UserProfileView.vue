<template>
  <div class="min-h-screen bg-powder-100 dark:bg-onyx-950 py-8 transition-colors duration-300">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col lg:flex-row gap-6 items-start">
        <!-- ─── SIDEBAR ──────────────────────────────────────────── -->
        <aside class="w-full lg:w-64 shrink-0 space-y-5">
          <!-- User card -->
          <div
            class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow-sm p-6"
          >
            <div class="flex flex-col items-center text-center">
              <!-- Circular avatar with ring -->
              <div class="relative mb-4 group">
                <div class="absolute -inset-[3px] rounded-full bg-flame-500 opacity-80"></div>
                <label class="relative block cursor-pointer">
                  <img
                    v-if="authStore.profilePhoto"
                    :src="authStore.profilePhoto"
                    alt="avatar"
                    class="relative w-24 h-24 rounded-full object-cover border-[3px] border-white dark:border-onyx-900"
                  />
                  <div
                    v-else
                    class="relative w-24 h-24 rounded-full bg-onyx-900 flex items-center justify-center text-white text-3xl font-bold border-[3px] border-white dark:border-onyx-900"
                  >
                    {{ userInitial }}
                  </div>
                  <div
                    class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                  >
                    <Camera class="w-5 h-5 text-white" />
                  </div>
                  <input type="file" accept="image/*" @change="handlePhotoUpload" class="hidden" />
                </label>
              </div>

              <h2
                class="text-sm font-bold text-onyx-900 dark:text-powder-100 uppercase tracking-wide"
              >
                {{ authStore.user?.name || 'Utilisateur' }}
              </h2>
              <p class="text-xs text-onyx-500 dark:text-powder-500 mt-0.5">
                {{ authStore.user?.email }}
              </p>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="space-y-1">
            <button
              v-for="item in navItems"
              :key="item.id"
              @click="activeTab = item.id"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-sm"
              :class="
                activeTab === item.id
                  ? 'bg-flame-500 text-white font-semibold shadow-sm shadow-flame-500/20'
                  : 'text-onyx-600 dark:text-powder-400 hover:bg-powder-50 dark:hover:bg-onyx-800 hover:shadow-sm font-medium'
              "
            >
              <component
                :is="item.icon"
                class="w-[18px] h-[18px] shrink-0"
                :class="activeTab === item.id ? 'text-white' : 'text-onyx-500 dark:text-powder-500'"
              />
              {{ item.label }}
            </button>
          </nav>

          <!-- Mini stats card -->
          <div
            class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow-sm p-5"
          >
            <p
              class="text-xs font-semibold text-onyx-500 dark:text-powder-500 uppercase tracking-wider mb-3"
            >
              Statistiques
            </p>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="stat in statItems" :key="stat.label" class="text-center">
                <div class="text-xl font-bold" :class="stat.color">{{ stat.value }}</div>
                <div
                  class="text-[10px] text-onyx-500 dark:text-powder-500 mt-0.5 uppercase tracking-wider"
                >
                  {{ stat.label }}
                </div>
              </div>
            </div>
          </div>

          <!-- Logout -->
          <button
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-onyx-500 dark:text-powder-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-powder-50 dark:hover:bg-onyx-800 transition-all duration-200"
          >
            <LogOut class="w-[18px] h-[18px]" />
            Se déconnecter
          </button>
        </aside>

        <!-- ─── CONTENT ───────────────────────────────────────────── -->
        <main class="flex-1 min-w-0 space-y-5">
          <!-- ═══ TAB : PROFIL ══════════════════════════════════════ -->
          <template v-if="activeTab === 'profile'">
            <!-- Personal info card -->
            <div
              class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow-sm p-6"
            >
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h2 class="text-base font-bold text-onyx-900 dark:text-powder-100">
                    Informations personnelles
                  </h2>
                  <p class="text-xs text-onyx-500 dark:text-powder-500 mt-0.5">
                    Mettez à jour vos informations de profil
                  </p>
                </div>
                <div
                  class="w-9 h-9 bg-flame-50 dark:bg-flame-900/30 rounded-lg flex items-center justify-center"
                >
                  <User class="w-4 h-4 text-flame-500" />
                </div>
              </div>

              <!-- Photo section -->
              <div
                class="flex items-center gap-4 mb-6 pb-6 border-b border-powder-100 dark:border-onyx-800"
              >
                <div class="relative group shrink-0">
                  <div class="absolute -inset-[2px] rounded-full bg-flame-500 opacity-70"></div>
                  <label class="relative block cursor-pointer">
                    <img
                      v-if="authStore.profilePhoto"
                      :src="authStore.profilePhoto"
                      alt="avatar"
                      class="relative w-14 h-14 rounded-full object-cover border-2 border-white dark:border-onyx-900"
                    />
                    <div
                      v-else
                      class="relative w-14 h-14 rounded-full bg-onyx-900 flex items-center justify-center text-white text-lg font-bold border-2 border-white dark:border-onyx-900"
                    >
                      {{ userInitial }}
                    </div>
                    <div
                      class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer flex items-center justify-center"
                    >
                      <Camera class="w-3.5 h-3.5 text-white" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      @change="handlePhotoUpload"
                      class="hidden"
                    />
                  </label>
                </div>
                <div>
                  <p class="text-sm font-semibold text-onyx-900 dark:text-powder-100">
                    Photo de profil
                  </p>
                  <p class="text-xs text-onyx-500 dark:text-powder-500 mb-2">
                    JPG, PNG ou WebP · Max 5 Mo
                  </p>
                  <div class="flex gap-2">
                    <label
                      class="cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-lg bg-flame-500 hover:bg-flame-600 text-white transition-colors"
                    >
                      Changer
                      <input
                        type="file"
                        accept="image/*"
                        @change="handlePhotoUpload"
                        class="hidden"
                      />
                    </label>
                    <button
                      v-if="authStore.profilePhoto"
                      @click="removePhoto"
                      class="px-3 py-1.5 text-xs font-medium rounded-lg text-onyx-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>

              <!-- Profile form -->
              <form @submit.prevent="saveProfile" class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      class="block text-xs font-medium text-onyx-500 dark:text-powder-500 mb-1.5"
                      >Nom complet</label
                    >
                    <input
                      v-model="profileForm.name"
                      type="text"
                      placeholder="Votre nom complet"
                      class="w-full px-3.5 py-2.5 rounded-lg text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-flame-500/30 focus:border-flame-500 bg-powder-50 dark:bg-onyx-700/50 border-powder-200 dark:border-onyx-600 text-onyx-900 dark:text-powder-100 placeholder-onyx-400 dark:placeholder-powder-600"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-xs font-medium text-onyx-500 dark:text-powder-500 mb-1.5"
                      >Adresse email</label
                    >
                    <input
                      v-model="profileForm.email"
                      type="email"
                      placeholder="votre@email.com"
                      class="w-full px-3.5 py-2.5 rounded-lg text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-flame-500/30 focus:border-flame-500 bg-powder-50 dark:bg-onyx-700/50 border-powder-200 dark:border-onyx-600 text-onyx-900 dark:text-powder-100 placeholder-onyx-400 dark:placeholder-powder-600"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-onyx-500 dark:text-powder-500 mb-1.5"
                    >Titre professionnel</label
                  >
                  <input
                    v-model="profileForm.title"
                    type="text"
                    placeholder="Ex : Développeur Web · Chef de projet"
                    class="w-full px-3.5 py-2.5 rounded-lg text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-flame-500/30 focus:border-flame-500 bg-powder-50 dark:bg-onyx-700/50 border-powder-200 dark:border-onyx-600 text-onyx-900 dark:text-powder-100 placeholder-onyx-400 dark:placeholder-powder-600"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-onyx-500 dark:text-powder-500 mb-1.5"
                    >Biographie</label
                  >
                  <textarea
                    v-model="profileForm.bio"
                    rows="3"
                    placeholder="Parlez de vous en quelques mots..."
                    maxlength="200"
                    class="w-full px-3.5 py-2.5 rounded-lg text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-flame-500/30 focus:border-flame-500 resize-none bg-powder-50 dark:bg-onyx-700/50 border-powder-200 dark:border-onyx-600 text-onyx-900 dark:text-powder-100 placeholder-onyx-400 dark:placeholder-powder-600"
                  />
                  <p class="text-[10px] text-onyx-500 dark:text-powder-500 mt-1 text-right">
                    {{ profileForm.bio.length }} / 200
                  </p>
                </div>
                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="profileLoading"
                    class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-flame-500 hover:bg-flame-600 disabled:opacity-50 text-white transition-colors shadow-sm"
                  >
                    <Loader2 v-if="profileLoading" class="w-4 h-4 animate-spin" />
                    <Save v-else class="w-4 h-4" />
                    {{ profileLoading ? 'Enregistrement...' : 'Enregistrer' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Danger zone -->
            <div
              class="bg-powder-50 dark:bg-onyx-900 rounded-2xl shadow-sm p-6 border border-red-100 dark:border-red-900/20"
            >
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="text-base font-bold text-onyx-900 dark:text-powder-100">
                    Zone dangereuse
                  </h2>
                  <p class="text-xs text-onyx-500 dark:text-powder-500 mt-0.5">
                    Actions irréversibles
                  </p>
                </div>
                <div
                  class="w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center"
                >
                  <AlertTriangle class="w-4 h-4 text-red-500" />
                </div>
              </div>
              <div
                class="flex items-center justify-between p-4 rounded-xl bg-red-50/50 dark:bg-red-900/10"
              >
                <div>
                  <p class="text-sm font-medium text-onyx-900 dark:text-powder-100">
                    Supprimer le compte
                  </p>
                  <p class="text-xs text-onyx-500 dark:text-powder-500 mt-0.5">
                    Toutes vos données seront supprimées
                  </p>
                </div>
                <button
                  @click="confirmDeleteAccount"
                  class="px-4 py-2 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </template>

          <!-- ═══ TAB : SECURITE ════════════════════════════════════ -->
          <template v-if="activeTab === 'security'">
            <div
              class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow-sm p-6"
            >
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h2 class="text-base font-bold text-onyx-900 dark:text-powder-100">
                    Changer le mot de passe
                  </h2>
                  <p class="text-xs text-onyx-500 dark:text-powder-500 mt-0.5">
                    Utilisez un mot de passe fort et unique
                  </p>
                </div>
                <div
                  class="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center"
                >
                  <Lock class="w-4 h-4 text-emerald-500" />
                </div>
              </div>

              <form @submit.prevent="changePassword" class="space-y-4">
                <div v-for="field in passwordFields" :key="field.key">
                  <label
                    class="block text-xs font-medium text-onyx-500 dark:text-powder-500 mb-1.5"
                    >{{ field.label }}</label
                  >
                  <div class="relative">
                    <input
                      v-model="passwordForm[field.key]"
                      :type="showPasswords[field.key] ? 'text' : 'password'"
                      placeholder="••••••••"
                      class="w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm border transition-all duration-200 focus:outline-none focus:ring-2"
                      :class="
                        field.key === 'confirm' &&
                        passwordForm.confirm &&
                        passwordForm.new !== passwordForm.confirm
                          ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700 text-onyx-900 dark:text-powder-100 focus:ring-red-400/30'
                          : 'bg-powder-50 dark:bg-onyx-700/50 border-powder-200 dark:border-onyx-600 text-onyx-900 dark:text-powder-100 focus:ring-flame-500/30 focus:border-flame-500'
                      "
                    />
                    <button
                      type="button"
                      @click="showPasswords[field.key] = !showPasswords[field.key]"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-onyx-500 hover:text-onyx-700 dark:text-powder-500 dark:hover:text-powder-300 transition-colors"
                    >
                      <Eye v-if="!showPasswords[field.key]" class="w-4 h-4" />
                      <EyeOff v-else class="w-4 h-4" />
                    </button>
                  </div>
                  <!-- Strength bar -->
                  <div v-if="field.key === 'new' && passwordForm.new" class="mt-2 space-y-1">
                    <div class="flex gap-1">
                      <div
                        v-for="n in 4"
                        :key="n"
                        class="h-1 flex-1 rounded-full transition-all duration-300"
                        :class="
                          passwordStrength.score >= n
                            ? passwordStrength.color
                            : 'bg-powder-200 dark:bg-onyx-600'
                        "
                      />
                    </div>
                    <p class="text-[10px] font-medium" :class="passwordStrength.textColor">
                      {{ passwordStrength.label }}
                    </p>
                  </div>
                  <p
                    v-if="
                      field.key === 'confirm' &&
                      passwordForm.confirm &&
                      passwordForm.new !== passwordForm.confirm
                    "
                    class="text-[10px] text-red-500 mt-1"
                  >
                    Les mots de passe ne correspondent pas
                  </p>
                </div>

                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="passwordLoading || !canChangePassword"
                    class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shadow-sm"
                  >
                    <Loader2 v-if="passwordLoading" class="w-4 h-4 animate-spin" />
                    <Shield v-else class="w-4 h-4" />
                    {{ passwordLoading ? 'Mise à jour...' : 'Mettre à jour' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Active session -->
            <div
              class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow-sm p-6"
            >
              <div class="flex items-center justify-between mb-5">
                <div>
                  <h2 class="text-base font-bold text-onyx-900 dark:text-powder-100">
                    Session active
                  </h2>
                  <p class="text-xs text-onyx-500 dark:text-powder-500 mt-0.5">
                    Appareils connectés
                  </p>
                </div>
                <div
                  class="w-9 h-9 bg-onyx-50 dark:bg-onyx-900/30 rounded-lg flex items-center justify-center"
                >
                  <Monitor class="w-4 h-4 text-onyx-500" />
                </div>
              </div>
              <div
                class="flex items-center justify-between p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-900/15 border border-emerald-100 dark:border-emerald-800/30"
              >
                <div class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <div>
                    <p class="text-sm font-medium text-onyx-900 dark:text-powder-100">
                      Session actuelle
                    </p>
                    <p class="text-xs text-onyx-500 dark:text-powder-500">
                      Navigateur Web · {{ formattedLoginDate }}
                    </p>
                  </div>
                </div>
                <span
                  class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full uppercase tracking-wider"
                >
                  Actif
                </span>
              </div>
            </div>
          </template>

          <!-- ═══ TAB : PREFERENCES ═══════════════════════════════════ -->
          <template v-if="activeTab === 'preferences'">
            <div
              class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow-sm p-6"
            >
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h2 class="text-base font-bold text-onyx-900 dark:text-powder-100">
                    Préférences
                  </h2>
                  <p class="text-xs text-onyx-500 dark:text-powder-500 mt-0.5">
                    Personnalisez votre expérience
                  </p>
                </div>
                <div
                  class="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center"
                >
                  <Sliders class="w-4 h-4 text-indigo-500" />
                </div>
              </div>

              <div class="divide-y divide-powder-100 dark:divide-onyx-800">
                <div
                  v-for="pref in prefItems"
                  :key="pref.key"
                  class="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-9 h-9 rounded-lg flex items-center justify-center"
                      :class="pref.bgClass"
                    >
                      <component :is="pref.icon" class="w-4 h-4" :class="pref.iconClass" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-onyx-900 dark:text-powder-100">
                        {{ pref.label }}
                      </p>
                      <p class="text-xs text-onyx-500 dark:text-powder-500">{{ pref.desc }}</p>
                    </div>
                  </div>
                  <!-- Toggle -->
                  <button
                    @click="togglePref(pref)"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shrink-0"
                    :class="
                      getPrefValue(pref.key) ? 'bg-flame-500' : 'bg-powder-200 dark:bg-onyx-700'
                    "
                    role="switch"
                    :aria-checked="getPrefValue(pref.key)"
                  >
                    <span
                      class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                      :class="getPrefValue(pref.key) ? 'translate-x-6' : 'translate-x-1'"
                    />
                  </button>
                </div>
              </div>

              <div class="flex justify-end pt-5 mt-1">
                <button
                  @click="savePreferences"
                  class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-flame-500 hover:bg-flame-600 text-white transition-colors shadow-sm"
                >
                  <Save class="w-4 h-4" />
                  Sauvegarder
                </button>
              </div>
            </div>

            <!-- Export data -->
            <div
              class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow-sm p-6"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 bg-onyx-100 dark:bg-onyx-800 rounded-lg flex items-center justify-center"
                  >
                    <Download class="w-4 h-4 text-onyx-500 dark:text-powder-500" />
                  </div>
                  <div>
                    <h2 class="text-sm font-bold text-onyx-900 dark:text-powder-100">
                      Exporter vos données
                    </h2>
                    <p class="text-xs text-onyx-500 dark:text-powder-500">
                      {{ stats.totalCards }} carte(s) · format JSON
                    </p>
                  </div>
                </div>
                <button
                  @click="downloadData"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors bg-onyx-100 dark:bg-onyx-800 text-onyx-600 dark:text-powder-400 hover:bg-onyx-200 dark:hover:bg-onyx-700"
                >
                  <Download class="w-3.5 h-3.5" />
                  Télécharger
                </button>
              </div>
            </div>
          </template>

          <!-- ═══ TAB : ABONNEMENT ══════════════════════════════════ -->
          <template v-if="activeTab === 'subscription'">
            <div
              class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow-sm p-6"
            >
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h2 class="text-base font-bold text-onyx-900 dark:text-powder-100">
                    Mon abonnement
                  </h2>
                  <p class="text-xs text-onyx-500 dark:text-powder-500 mt-0.5">Gérez votre plan</p>
                </div>
                <div
                  class="w-9 h-9 bg-accent-50 dark:bg-accent-900/30 rounded-lg flex items-center justify-center"
                >
                  <Star class="w-4 h-4 text-accent-500" />
                </div>
              </div>

              <!-- Plan summary -->
              <div
                class="rounded-xl p-4 mb-6 border"
                :class="
                  authStore.hasPremium()
                    ? 'bg-accent-50/50 dark:bg-accent-900/15 border-accent-200 dark:border-accent-800/30'
                    : 'bg-powder-50 dark:bg-onyx-800/30 border-powder-100 dark:border-onyx-800'
                "
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="flex items-center gap-2 mb-0.5">
                      <span
                        class="text-sm font-bold"
                        :class="
                          authStore.hasPremium()
                            ? 'text-accent-600 dark:text-accent-400'
                            : 'text-onyx-900 dark:text-powder-100'
                        "
                      >
                        Plan {{ authStore.hasPremium() ? 'Premium' : 'Gratuit' }}
                      </span>
                      <span
                        v-if="authStore.hasPremium()"
                        class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded-full uppercase"
                        >Actif</span
                      >
                    </div>
                    <p
                      v-if="authStore.hasPremium() && authStore.user?.premiumUntil"
                      class="text-xs text-onyx-500 dark:text-powder-500"
                    >
                      Renouvellement le {{ formatDate(authStore.user.premiumUntil) }}
                    </p>
                    <p
                      v-else-if="!authStore.hasPremium()"
                      class="text-xs text-onyx-500 dark:text-powder-500"
                    >
                      {{ stats.totalCards }} / 3 cartes utilisées
                    </p>
                  </div>
                  <div v-if="!authStore.hasPremium()" class="flex flex-col items-end gap-1">
                    <div
                      class="h-1.5 w-20 rounded-full overflow-hidden bg-powder-200 dark:bg-onyx-700"
                    >
                      <div
                        class="h-full rounded-full transition-all duration-500"
                        :class="stats.totalCards >= 2 ? 'bg-red-500' : 'bg-flame-500'"
                        :style="{ width: `${Math.min((stats.totalCards / 2) * 100, 100)}%` }"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Plan comparison -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <!-- Free -->
                <div
                  class="rounded-xl border p-5 transition-all"
                  :class="
                    !authStore.hasPremium()
                      ? 'border-flame-300 dark:border-flame-700 bg-flame-50/30 dark:bg-flame-900/10'
                      : 'border-powder-100 dark:border-onyx-800'
                  "
                >
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-bold text-sm text-onyx-900 dark:text-powder-100">Gratuit</h3>
                    <span
                      v-if="!authStore.hasPremium()"
                      class="text-[10px] font-bold text-flame-500 bg-flame-50 dark:bg-flame-900/30 px-2 py-0.5 rounded-full"
                      >Actuel</span
                    >
                  </div>
                  <div class="text-xl font-bold text-onyx-900 dark:text-powder-100 mb-3">
                    0 FCFA<span class="text-xs font-normal text-onyx-500 dark:text-powder-500"
                      >/mois</span
                    >
                  </div>
                  <ul class="space-y-2">
                    <li
                      v-for="f in freeFeatures"
                      :key="f"
                      class="flex items-start gap-2 text-xs text-onyx-500 dark:text-powder-500"
                    >
                      <CheckCircle class="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      {{ f }}
                    </li>
                  </ul>
                </div>

                <!-- Premium -->
                <div
                  class="rounded-xl border p-5 relative overflow-hidden transition-all"
                  :class="
                    authStore.hasPremium()
                      ? 'border-accent-300 dark:border-accent-700 bg-accent-50/30 dark:bg-accent-900/10'
                      : 'border-powder-100 dark:border-onyx-800 hover:border-accent-200 dark:hover:border-accent-800'
                  "
                >
                  <div
                    class="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-500 text-white"
                  >
                    Populaire
                  </div>
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-bold text-sm text-onyx-900 dark:text-powder-100">Premium</h3>
                    <span
                      v-if="authStore.hasPremium()"
                      class="text-[10px] font-bold text-accent-600 bg-accent-50 dark:bg-accent-900/30 px-2 py-0.5 rounded-full"
                      >Actuel</span
                    >
                  </div>
                  <div class="text-xl font-bold text-onyx-900 dark:text-powder-100 mb-3">
                    4 990 FCFA<span class="text-xs font-normal text-onyx-500 dark:text-powder-500"
                      >/mois</span
                    >
                  </div>
                  <ul class="space-y-2">
                    <li
                      v-for="f in premiumFeatures"
                      :key="f"
                      class="flex items-start gap-2 text-xs text-onyx-500 dark:text-powder-500"
                    >
                      <CheckCircle class="w-3.5 h-3.5 text-accent-500 shrink-0 mt-0.5" />
                      {{ f }}
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Upgrade CTA -->
              <div v-if="!authStore.hasPremium()">
                <button
                  @click="handleUpgrade"
                  :disabled="upgradeLoading"
                  class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-accent-500/20 transition-all duration-200"
                >
                  <Loader2 v-if="upgradeLoading" class="w-4 h-4 animate-spin" />
                  <Star v-else class="w-4 h-4" />
                  {{ upgradeLoading ? 'Traitement...' : 'Passer au Premium' }}
                </button>
                <p class="text-[10px] text-center text-onyx-500 dark:text-powder-500 mt-2">
                  Sans engagement · Annulation à tout moment
                </p>
              </div>
              <div v-else class="flex justify-end">
                <button
                  @click="confirmCancelSubscription"
                  class="text-xs text-onyx-500 dark:text-powder-500 hover:text-red-500 transition-colors underline"
                >
                  Annuler l'abonnement
                </button>
              </div>
            </div>
          </template>

          <!-- ═══ TAB : FACTURATION ══════════════════════════════════ -->
          <template v-if="activeTab === 'billing'">
            <div
              class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow-sm p-6"
            >
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h2 class="text-base font-bold text-onyx-900 dark:text-powder-100">
                    Facturation
                  </h2>
                  <p class="text-xs text-onyx-500 dark:text-powder-500 mt-0.5">
                    Historique de vos paiements
                  </p>
                </div>
                <div
                  class="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center"
                >
                  <CreditCard class="w-4 h-4 text-indigo-500" />
                </div>
              </div>

              <!-- Invoice table -->
              <div v-if="mockInvoices.length > 0" class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr
                      class="text-left text-[10px] uppercase tracking-wider text-onyx-500 dark:text-powder-500 border-b border-powder-100 dark:border-onyx-800"
                    >
                      <th class="pb-3 font-semibold">Facture</th>
                      <th class="pb-3 font-semibold">Date</th>
                      <th class="pb-3 font-semibold">Montant</th>
                      <th class="pb-3 font-semibold">Statut</th>
                      <th class="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-powder-50 dark:divide-onyx-800/50">
                    <tr v-for="inv in mockInvoices" :key="inv.id" class="group">
                      <td class="py-3.5">
                        <div class="text-sm font-medium text-onyx-900 dark:text-powder-100">
                          {{ inv.description }}
                        </div>
                        <div
                          class="text-[10px] text-onyx-500 dark:text-powder-500 font-mono mt-0.5"
                        >
                          #{{ inv.id }}
                        </div>
                      </td>
                      <td class="py-3.5 text-xs text-onyx-500 dark:text-powder-500">
                        {{ inv.date }}
                      </td>
                      <td class="py-3.5 font-semibold text-sm text-onyx-900 dark:text-powder-100">
                        {{ inv.amount }}
                      </td>
                      <td class="py-3.5">
                        <span
                          class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                          :class="
                            inv.status === 'Payé'
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                              : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                          "
                        >
                          <span
                            class="w-1.5 h-1.5 rounded-full"
                            :class="inv.status === 'Payé' ? 'bg-emerald-500' : 'bg-red-500'"
                          />
                          {{ inv.status }}
                        </span>
                      </td>
                      <td class="py-3.5 text-right">
                        <button
                          @click="downloadInvoice(inv)"
                          class="text-xs font-medium text-onyx-500 dark:text-powder-500 hover:text-onyx-800 dark:hover:text-powder-200 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Télécharger
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Empty state -->
              <div v-else class="text-center py-14">
                <div
                  class="w-14 h-14 rounded-2xl bg-powder-100 dark:bg-onyx-800 flex items-center justify-center mx-auto mb-3"
                >
                  <Receipt class="w-7 h-7 text-onyx-300 dark:text-onyx-600" />
                </div>
                <p class="font-semibold text-sm text-onyx-900 dark:text-powder-100 mb-1">
                  Aucune facture
                </p>
                <p class="text-xs text-onyx-500 dark:text-powder-500 mb-5">
                  Vos factures apparaîtront après votre premier paiement
                </p>
                <button
                  @click="activeTab = 'subscription'"
                  class="px-4 py-2 rounded-lg bg-flame-500 hover:bg-flame-600 text-white text-xs font-semibold transition-colors"
                >
                  Voir les plans
                </button>
              </div>
            </div>
          </template>
        </main>
      </div>
    </div>

    <!-- Delete account confirm -->
    <ConfirmModal
      v-if="showDeleteAccountConfirm"
      title="Supprimer votre compte ?"
      message="Cette action est irréversible. Votre compte et toutes vos cartes seront définitivement supprimés."
      confirm-label="Supprimer mon compte"
      variant="danger"
      @confirm="onDeleteAccountConfirmed"
      @cancel="showDeleteAccountConfirm = false"
    />

    <!-- Cancel subscription confirm -->
    <ConfirmModal
      v-if="showCancelSubConfirm"
      title="Annuler votre abonnement Premium ?"
      message="Vous conserverez vos avantages Premium jusqu'à la fin de la période en cours."
      confirm-label="Annuler l'abonnement"
      variant="warning"
      @confirm="onCancelSubConfirmed"
      @cancel="showCancelSubConfirm = false"
    />

    <!-- Logout confirm -->
    <ConfirmModal
      v-if="showLogoutConfirm"
      title="Se déconnecter ?"
      message="Vous serez redirigé vers la page d'accueil."
      confirm-label="Se déconnecter"
      variant="logout"
      @confirm="onLogoutConfirmed"
      @cancel="showLogoutConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCardsStore } from '@/stores/cards'
import { useThemeStore } from '@/stores/themeStore'
import { useNotificationStore } from '@/stores/notificationStore'
import {
  User,
  Lock,
  Sliders,
  Star,
  CreditCard,
  Camera,
  Bell,
  Moon,
  Mail,
  QrCode,
  Eye,
  EyeOff,
  Save,
  Download,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Shield,
  Monitor,
  Loader2,
  Receipt,
} from 'lucide-vue-next'
import ConfirmModal from '@/components/ConfirmModal.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cardsStore = useCardsStore()
const themeStore = useThemeStore()
const notify = useNotificationStore()

// ── Active tab ─────────────────────────────────────────────────
const activeTab = ref(route.path === '/settings' ? 'preferences' : 'profile')

const navItems = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'security', label: 'Sécurité', icon: Lock },
  { id: 'preferences', label: 'Préférences', icon: Sliders },
  { id: 'subscription', label: 'Abonnement', icon: Star },
  { id: 'billing', label: 'Facturation', icon: CreditCard },
]

// ── Stats items for sidebar ─────────────────────────────────────
const stats = computed(() => cardsStore.getGlobalStats())

const statItems = computed(() => [
  { label: 'Cartes', value: stats.value.totalCards, color: 'text-flame-500' },
  { label: 'Vues', value: stats.value.totalViews, color: 'text-onyx-500' },
  { label: 'Scans QR', value: stats.value.totalQRScans, color: 'text-emerald-500' },
  { label: 'Partages', value: stats.value.totalShares, color: 'text-accent-500' },
])

// ── Photo ───────────────────────────────────────────────────────
onMounted(() => {
  loadPreferences()
})

const handlePhotoUpload = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    notify.error('Veuillez sélectionner une image valide')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    notify.error('La photo dépasse la limite de 5 Mo')
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    authStore.setProfilePhoto(ev.target.result)
    notify.success('Photo de profil mise à jour')
  }
  reader.readAsDataURL(file)
}

const removePhoto = () => {
  authStore.removeProfilePhoto()
  notify.success('Photo supprimée')
}

// ── Profile form ────────────────────────────────────────────────
const profileLoading = ref(false)
const profileForm = reactive({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  title: authStore.user?.title || '',
  bio: authStore.user?.bio || '',
})

const saveProfile = async () => {
  if (!profileForm.name.trim()) {
    notify.error('Le nom ne peut pas être vide')
    return
  }
  profileLoading.value = true
  await new Promise((r) => setTimeout(r, 700))
  if (authStore.user) {
    authStore.user.name = profileForm.name.trim()
    authStore.user.email = profileForm.email.trim()
    authStore.user.title = profileForm.title.trim()
    authStore.user.bio = profileForm.bio.trim()
    localStorage.setItem('user', JSON.stringify(authStore.user))
  }
  profileLoading.value = false
  notify.success('Profil mis à jour avec succès')
}

const showDeleteAccountConfirm = ref(false)

const confirmDeleteAccount = () => {
  showDeleteAccountConfirm.value = true
}

const onDeleteAccountConfirmed = () => {
  showDeleteAccountConfirm.value = false
  authStore.logout()
  router.push('/')
}

// ── Password form ───────────────────────────────────────────────
const passwordLoading = ref(false)
const passwordForm = reactive({ current: '', new: '', confirm: '' })
const showPasswords = reactive({ current: false, new: false, confirm: false })

const passwordFields = [
  { key: 'current', label: 'Mot de passe actuel' },
  { key: 'new', label: 'Nouveau mot de passe' },
  { key: 'confirm', label: 'Confirmer le nouveau mot de passe' },
]

const passwordStrength = computed(() => {
  const p = passwordForm.new
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  const levels = [
    { label: 'Très faible', color: 'bg-red-500', textColor: 'text-red-500' },
    { label: 'Faible', color: 'bg-orange-400', textColor: 'text-orange-500' },
    { label: 'Moyen', color: 'bg-yellow-400', textColor: 'text-yellow-500' },
    { label: 'Fort', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
    { label: 'Très fort', color: 'bg-emerald-600', textColor: 'text-emerald-600' },
  ]
  return { score, ...(levels[score] || levels[0]) }
})

const canChangePassword = computed(
  () =>
    passwordForm.current.length >= 6 &&
    passwordForm.new.length >= 6 &&
    passwordForm.new === passwordForm.confirm,
)

const changePassword = async () => {
  if (!canChangePassword.value) return
  passwordLoading.value = true
  await new Promise((r) => setTimeout(r, 900))
  passwordForm.current = ''
  passwordForm.new = ''
  passwordForm.confirm = ''
  passwordLoading.value = false
  notify.success('Mot de passe mis à jour avec succès')
}

// ── Preferences ─────────────────────────────────────────────────
const prefs = reactive({ emailNotif: true, qrNotif: false, newsletter: true })

const prefItems = [
  {
    key: 'darkMode',
    label: 'Mode sombre',
    desc: 'Réduire la fatigue oculaire',
    icon: Moon,
    bgClass: 'bg-onyx-100 dark:bg-onyx-800',
    iconClass: 'text-onyx-500 dark:text-powder-500',
    isTheme: true,
  },
  {
    key: 'emailNotif',
    label: 'Notifications email',
    desc: 'Recevoir un email quand une carte est consultée',
    icon: Mail,
    bgClass: 'bg-onyx-50 dark:bg-onyx-900/30',
    iconClass: 'text-onyx-500',
  },
  {
    key: 'qrNotif',
    label: 'Alertes scans QR',
    desc: "Être notifié quand quelqu'un scanne votre QR code",
    icon: QrCode,
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconClass: 'text-emerald-500',
  },
  {
    key: 'newsletter',
    label: 'Newsletter',
    desc: 'Nouveaux modèles et mises à jour de la plateforme',
    icon: Bell,
    bgClass: 'bg-accent-50 dark:bg-accent-900/30',
    iconClass: 'text-accent-500',
  },
]

const getPrefValue = (key) => {
  if (key === 'darkMode') return themeStore.darkMode
  return prefs[key]
}

const togglePref = (pref) => {
  if (pref.isTheme) {
    themeStore.toggleDarkMode()
  } else {
    prefs[pref.key] = !prefs[pref.key]
  }
}

const loadPreferences = () => {
  const saved = localStorage.getItem(`prefs_${authStore.user?.email}`)
  if (saved) {
    try {
      Object.assign(prefs, JSON.parse(saved))
    } catch {
      // ignore invalid JSON
    }
  }
}

const savePreferences = () => {
  localStorage.setItem(`prefs_${authStore.user?.email}`, JSON.stringify({ ...prefs }))
  notify.success('Préférences sauvegardées')
}

// ── Subscription ────────────────────────────────────────────────
const upgradeLoading = ref(false)

const freeFeatures = [
  '3 cartes de visite',
  '8 modèles gratuits',
  'Export PNG',
  'QR code standard (niveau L)',
  '50 polices',
  'Partage par lien',
]

const premiumFeatures = [
  'Cartes illimitées',
  'Tous les modèles (14+)',
  'Export PNG, JPG, PDF, JSON',
  'QR code personnalisé (couleurs, logo, niveaux M/Q/H)',
  '300+ polices, import et combinaisons',
  'Outils avancés (magnétisme, guides, zone sécurité)',
  'Champs personnalisés illimités',
  'Import de cartes (JSON)',
  'Publication communauté',
  'Support prioritaire',
]

const handleUpgrade = async () => {
  upgradeLoading.value = true
  try {
    await authStore.upgradeToPremium()
    notify.success('Bienvenue dans le plan Premium !')
    mockInvoices.value.unshift({
      id: `INV-${Date.now()}`,
      description: 'Plan Premium · 1 mois',
      date: new Date().toLocaleDateString('fr-FR'),
      amount: '4 990 FCFA',
      status: 'Payé',
    })
  } catch {
    notify.error('Erreur lors de la mise à niveau')
  } finally {
    upgradeLoading.value = false
  }
}

const showCancelSubConfirm = ref(false)

const confirmCancelSubscription = () => {
  showCancelSubConfirm.value = true
}

const onCancelSubConfirmed = () => {
  showCancelSubConfirm.value = false
  if (authStore.user) {
    authStore.user.isPremium = false
    localStorage.setItem('user', JSON.stringify(authStore.user))
  }
  notify.info("Abonnement annulé. Votre accès Premium reste actif jusqu'à la fin de période.")
}

// ── Billing ─────────────────────────────────────────────────────
const mockInvoices = ref(
  authStore.hasPremium()
    ? [
        {
          id: 'INV-001',
          description: 'Plan Premium · 1 mois',
          date: new Date().toLocaleDateString('fr-FR'),
          amount: '4 990 FCFA',
          status: 'Payé',
        },
      ]
    : [],
)

const downloadInvoice = (inv) => {
  const content = [
    `FACTURE ${inv.id}`,
    '\u2500'.repeat(40),
    `Description : ${inv.description}`,
    `Date        : ${inv.date}`,
    `Montant     : ${inv.amount}`,
    `Statut      : ${inv.status}`,
    '',
    'Merci pour votre confiance.',
  ].join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `facture-${inv.id}.txt`
  a.click()
  URL.revokeObjectURL(url)
  notify.success('Facture téléchargée')
}

// ── Data export ──────────────────────────────────────────────────
const downloadData = () => {
  const data = cardsStore.exportCardsAsJSON()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mes-cartes-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  notify.success('Données exportées avec succès')
}

// ── Logout ───────────────────────────────────────────────────────
const showLogoutConfirm = ref(false)

const handleLogout = () => {
  showLogoutConfirm.value = true
}

const onLogoutConfirmed = () => {
  showLogoutConfirm.value = false
  authStore.logout()
  router.push('/')
}

// ── Helpers ──────────────────────────────────────────────────────
const userInitial = computed(() => authStore.user?.name?.[0]?.toUpperCase() || 'U')
const formattedLoginDate = new Date().toLocaleDateString('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
</script>
