<template>
  <div class="dashboard-view min-h-screen bg-powder-100 dark:bg-onyx-950 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <div class="mb-12">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold mb-3 text-onyx-950 dark:text-powder-50">
              Mon tableau de bord
            </h1>
            <p class="text-lg text-onyx-600 dark:text-powder-400">
              Gérez toutes vos cartes de visite en un seul endroit
            </p>
          </div>
          <div class="mt-6 md:mt-0 flex flex-wrap gap-3">
            <button
              @click="exportCards"
              :disabled="selectedCardIds.size === 0"
              :title="
                selectedCardIds.size === 0
                  ? 'Sélectionnez au moins une carte'
                  : `Exporter ${selectedCardIds.size} carte(s)`
              "
              class="px-6 py-3 font-semibold rounded-xl shadow-sm transition-all duration-200 flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              :class="
                selectedCardIds.size > 0
                  ? 'bg-powder-200 hover:bg-powder-300 dark:bg-onyx-700 dark:hover:bg-onyx-600 text-onyx-800 dark:text-white'
                  : 'bg-powder-200 dark:bg-onyx-700 text-onyx-800 dark:text-white'
              "
            >
              <Download class="w-5 h-5" />
              <span
                >Exporter{{ selectedCardIds.size > 0 ? ` (${selectedCardIds.size})` : '' }}</span
              >
            </button>
            <label
              v-if="authStore.isPremium || authStore.isAdmin"
              class="px-6 py-3 bg-powder-200 hover:bg-powder-300 dark:bg-onyx-700 dark:hover:bg-onyx-600 text-onyx-800 dark:text-white font-semibold rounded-xl shadow-sm transition-all duration-200 flex items-center space-x-2 cursor-pointer"
            >
              <Plus class="w-5 h-5" />
              <span>Importer</span>
              <input type="file" accept=".json" @change="importCards" class="hidden" />
            </label>
            <button
              v-else
              @click="router.push('/pricing')"
              class="px-6 py-3 bg-powder-200/60 dark:bg-onyx-700/60 text-onyx-500 dark:text-onyx-400 font-semibold rounded-xl shadow-sm transition-all duration-200 flex items-center space-x-2 cursor-pointer"
              title="L'import est réservé au plan Premium"
            >
              <Plus class="w-5 h-5" />
              <span>Importer</span>
              <span class="text-[10px] font-bold text-amber-500 ml-1">PRO</span>
            </button>
            <router-link
              v-if="store.canCreateCard"
              to="/editor"
              class="px-6 py-3 bg-flame-500 hover:bg-flame-600 text-white font-semibold rounded-xl shadow-sm transition-all duration-200 flex items-center space-x-2"
            >
              <Plus class="w-5 h-5" />
              <span>Créer une carte</span>
            </router-link>
            <button
              v-else
              @click="router.push('/pricing')"
              class="px-6 py-3 bg-flame-500/60 text-white font-semibold rounded-xl shadow-sm transition-all duration-200 flex items-center space-x-2 cursor-pointer"
              :title="`Limite de ${MAX_FREE_CARDS} cartes atteinte — passez au Premium`"
            >
              <Plus class="w-5 h-5" />
              <span>Créer une carte</span>
              <span class="text-[10px] font-bold text-amber-300 ml-1">PRO</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <div
          class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-flame-50 dark:bg-flame-900/20 rounded-xl flex items-center justify-center"
            >
              <CreditCard class="w-6 h-6 text-flame-500" />
            </div>
            <span
              class="text-xs font-semibold text-onyx-500 dark:text-onyx-400 bg-powder-100 dark:bg-onyx-700 px-2 py-1 rounded-full"
              >Total</span
            >
          </div>
          <div class="text-3xl font-bold text-onyx-900 dark:text-white">{{ stats.totalCards }}</div>
          <p class="text-xs text-onyx-600 dark:text-onyx-400 mt-2">Cartes créées</p>
        </div>

        <div
          class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-onyx-100 dark:bg-onyx-800/50 rounded-xl flex items-center justify-center"
            >
              <Eye class="w-6 h-6 text-onyx-500" />
            </div>
            <span
              class="text-xs font-semibold text-onyx-500 dark:text-onyx-400 bg-powder-100 dark:bg-onyx-700 px-2 py-1 rounded-full"
              >Total</span
            >
          </div>
          <div class="text-3xl font-bold text-onyx-900 dark:text-white">{{ stats.totalViews }}</div>
          <p class="text-xs text-onyx-600 dark:text-onyx-400 mt-2">Vues totales</p>
        </div>

        <div
          class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-powder-200 dark:bg-onyx-700/50 rounded-xl flex items-center justify-center"
            >
              <Download class="w-6 h-6 text-onyx-500" />
            </div>
            <span
              class="text-xs font-semibold text-onyx-500 dark:text-onyx-400 bg-powder-100 dark:bg-onyx-700 px-2 py-1 rounded-full"
              >Total</span
            >
          </div>
          <div class="text-3xl font-bold text-onyx-900 dark:text-white">
            {{ stats.totalDownloads }}
          </div>
          <p class="text-xs text-onyx-600 dark:text-onyx-400 mt-2">Téléchargements</p>
        </div>

        <div
          class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/50 dark:to-amber-800/30 rounded-xl flex items-center justify-center"
            >
              <QrCode class="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <span
              class="text-xs font-semibold text-onyx-500 dark:text-onyx-400 bg-powder-100 dark:bg-onyx-700 px-2 py-1 rounded-full"
              >Total</span
            >
          </div>
          <div class="text-3xl font-bold text-onyx-900 dark:text-white">
            {{ stats.totalQRScans }}
          </div>
          <p class="text-xs text-onyx-600 dark:text-onyx-400 mt-2">Scans QR</p>
        </div>

        <div
          class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/50 dark:to-rose-800/30 rounded-xl flex items-center justify-center"
            >
              <Share2 class="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <span
              class="text-xs font-semibold text-onyx-500 dark:text-onyx-400 bg-powder-100 dark:bg-onyx-700 px-2 py-1 rounded-full"
              >Total</span
            >
          </div>
          <div class="text-3xl font-bold text-onyx-900 dark:text-white">
            {{ stats.totalShares }}
          </div>
          <p class="text-xs text-onyx-600 dark:text-onyx-400 mt-2">Partages</p>
        </div>
      </div>

      <!-- Glassmorphism 3D Carousel -->
      <div v-if="store.userCards.length > 0" class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-onyx-950 dark:text-powder-50 mb-6">
          Aperçu de vos cartes
        </h2>
        <div class="relative rounded-3xl overflow-hidden py-10 px-4 carousel-animated-bg">
          <!-- Decorative glow blobs -->
          <div
            class="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"
          ></div>
          <div
            class="absolute bottom-0 right-1/4 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 pointer-events-none"
          ></div>

          <!-- 3D Scene -->
          <div
            class="relative flex items-center justify-center"
            style="height: 270px; perspective: 1200px; perspective-origin: 50% 50%"
          >
            <div
              v-for="(card, idx) in store.userCards"
              :key="card.id"
              class="absolute cursor-pointer"
              :style="getCarouselCardStyle(idx)"
              @click="carouselIndex = idx"
              @mouseenter="hoveredCarouselIdx = idx"
              @mouseleave="hoveredCarouselIdx = null"
            >
              <div class="select-none" :style="{ width: cardPreviewWidth(card, 180) + 'px' }">
                <BusinessCard
                  :card="card"
                  cardSize="small"
                  :isFlipped="hoveredCarouselIdx === idx"
                />
              </div>
            </div>
          </div>

          <!-- Navigation Controls -->
          <div class="flex justify-center items-center space-x-6 mt-6 relative z-10">
            <!-- Prev Button -->
            <button
              @click="prevCarousel"
              :disabled="store.userCards.length <= 1"
              class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style="
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.3);
              "
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <!-- Dot Indicators -->
            <div class="flex items-center space-x-2">
              <button
                v-for="(card, idx) in store.userCards"
                :key="idx"
                @click="carouselIndex = idx"
                class="rounded-full transition-all duration-300"
                :style="
                  carouselIndex === idx
                    ? 'width: 24px; height: 8px; background: rgba(255,255,255,0.95);'
                    : 'width: 8px; height: 8px; background: rgba(255,255,255,0.45);'
                "
              ></button>
            </div>

            <!-- Next Button -->
            <button
              @click="nextCarousel"
              :disabled="store.userCards.length <= 1"
              class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style="
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.3);
              "
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <!-- Active card label -->
          <div v-if="store.userCards[carouselIndex]" class="text-center mt-3 relative z-10">
            <p class="text-white/50 text-[10px] uppercase tracking-widest mb-0.5">
              {{ store.userCards[carouselIndex].name }}
            </p>
            <p class="text-white font-semibold text-sm drop-shadow">
              {{ getFullName(store.userCards[carouselIndex]) }}
            </p>
            <p class="text-white/70 text-xs">
              {{ cardSubtitle(store.userCards[carouselIndex]) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Tab Switch: Modèles / Cartes -->
      <div class="flex bg-powder-200 dark:bg-onyx-800 rounded-xl p-1 mb-8 max-w-md">
        <button
          @click="dashboardTab = 'templates'"
          class="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
          :class="dashboardTab === 'templates' ? 'bg-white dark:bg-onyx-700 shadow-sm text-onyx-900 dark:text-powder-50' : 'text-onyx-500 dark:text-onyx-400 hover:text-onyx-700 dark:hover:text-onyx-200'"
        >
          Modèles ({{ displayedTemplates.length }})
        </button>
        <button
          @click="dashboardTab = 'cards'"
          class="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
          :class="dashboardTab === 'cards' ? 'bg-white dark:bg-onyx-700 shadow-sm text-onyx-900 dark:text-powder-50' : 'text-onyx-500 dark:text-onyx-400 hover:text-onyx-700 dark:hover:text-onyx-200'"
        >
          Cartes ({{ store.userCards.length }})
        </button>
      </div>

      <!-- My Templates Section -->
      <Transition name="tab-fade" mode="out-in">
      <div v-if="dashboardTab === 'templates'" class="mb-12" key="templates">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-2xl md:text-3xl font-bold text-onyx-950 dark:text-powder-50">
            Mes Modèles
          </h2>
          <div class="flex items-center space-x-3">
            <button
              @click="toggleTemplateSort"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-powder-300 dark:border-onyx-600 hover:bg-powder-100 dark:hover:bg-onyx-700 transition-colors text-xs font-medium text-onyx-600 dark:text-onyx-400"
              :title="templateSortOrder === 'newest' ? 'Plus récent d\'abord' : 'Plus ancien d\'abord'"
            >
              <ArrowUpDown class="w-3.5 h-3.5" />
              <span>{{ templateSortOrder === 'newest' ? 'Plus récent' : 'Plus ancien' }}</span>
            </button>
            <label
              class="flex items-center space-x-2 text-sm text-onyx-600 dark:text-onyx-400 cursor-pointer"
            >
              <input
                type="checkbox"
                v-model="showAutoTemplates"
                class="rounded border-gray-300 text-flame-500 shadow-sm focus:border-flame-300 focus:ring focus:ring-flame-200 focus:ring-opacity-50"
              />
              <span>Afficher l'historique auto.</span>
            </label>
            <button
              v-if="sortedTemplates.length > 0"
              @click="toggleSelectAllTemplates"
              class="px-4 py-2 rounded-lg border border-powder-300 dark:border-onyx-600 hover:bg-powder-100 dark:hover:bg-onyx-700 transition-colors flex items-center space-x-2 text-sm font-medium"
              :class="selectedTemplateIds.size > 0 ? 'bg-flame-50 dark:bg-flame-900/20 border-flame-300 dark:border-flame-700' : ''"
            >
              <Check class="w-4 h-4" :class="selectedTemplateIds.size > 0 ? 'text-flame-600' : 'text-onyx-400'" />
              <span>{{ selectedTemplateIds.size > 0 ? `${selectedTemplateIds.size} sélectionné(s)` : 'Sélectionner tout' }}</span>
            </button>
            <button
              v-if="selectedTemplateIds.size > 0"
              @click="deleteSelectedTemplates"
              class="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center space-x-2 text-sm font-medium"
            >
              <Trash2 class="w-4 h-4" />
              <span>Supprimer ({{ selectedTemplateIds.size }})</span>
            </button>
            <router-link
              v-if="templatesStore.canCreateTemplate"
              to="/editor"
              class="px-4 py-2 bg-powder-200 hover:bg-powder-300 dark:bg-onyx-700 dark:hover:bg-onyx-600 text-onyx-800 dark:text-white font-semibold rounded-lg shadow-sm transition-all duration-200 flex items-center space-x-2 text-sm"
            >
              <Plus class="w-4 h-4" />
              <span>Nouveau modèle</span>
            </router-link>
            <button
              v-else
              @click="router.push('/pricing')"
              class="px-4 py-2 bg-powder-200/60 dark:bg-onyx-700/60 text-onyx-500 dark:text-onyx-400 font-semibold rounded-lg shadow-sm transition-all duration-200 flex items-center space-x-2 text-sm"
              :title="`Limite de ${MAX_FREE_TEMPLATES} modèles atteinte`"
            >
              <Plus class="w-4 h-4" />
              <span>Nouveau modèle</span>
              <span class="text-[10px] font-bold text-amber-500 ml-1">PRO</span>
            </button>
          </div>
        </div>

        <div
          v-if="sortedTemplates.length > 0"
          class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <div
            v-for="tpl in sortedTemplates"
            :key="tpl.id"
            class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow hover:shadow-lg transition-all overflow-hidden flex flex-col group"
            :class="selectedTemplateIds.has(tpl.id) ? 'ring-2 ring-flame-400' : ''"
          >
            <!-- Preview using BusinessCard (pass the editorData transformed to a fake card) -->
            <div
              class="relative overflow-hidden bg-powder-100 dark:bg-onyx-800 h-44 flex items-center justify-center p-2"
            >
              <!-- Checkbox -->
              <button
                @click.stop="toggleTemplateSelection(tpl.id)"
                class="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                :class="selectedTemplateIds.has(tpl.id)
                  ? 'bg-flame-500 border-flame-500 text-white opacity-100'
                  : 'border-powder-300 dark:border-onyx-600 bg-white/70 dark:bg-onyx-800/70 text-transparent opacity-0 group-hover:opacity-100'"
              >
                <Check class="w-3 h-3" />
              </button>
              <div
                class="pointer-events-none"
                :style="{ width: cardPreviewWidth(templateToFakeCard(tpl), 160) + 'px' }"
              >
                <BusinessCard :card="templateToFakeCard(tpl)" :isFlipped="flippedTemplates.has(tpl.id)" />
              </div>
              <!-- AUTO badge -->
              <div
                v-if="tpl.isAuto"
                class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                AUTO
              </div>
              <!-- Public/Privé badge -->
              <div
                v-else
                class="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold"
                :class="tpl.isPublic
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'"
              >
                {{ tpl.isPublic ? '✓ Public' : '○ Privé' }}
              </div>
              <!-- Flip verso button -->
              <button
                v-if="templateHasVerso(tpl)"
                @click.stop="toggleTemplateFlip(tpl.id)"
                class="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-semibold rounded bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
              >
                {{ flippedTemplates.has(tpl.id) ? 'Recto ↩' : 'Verso →' }}
              </button>
            </div>

            <div class="p-4 flex flex-col flex-1">
              <h3 class="font-bold text-base text-onyx-900 dark:text-white mb-1 truncate">
                {{ tpl.name }}
              </h3>
              <p class="text-[10px] text-onyx-500 dark:text-onyx-400 mb-3">
                Modifié le {{ formatDate(tpl.updatedAt) }}
              </p>

              <div class="mb-4">
                <span
                  class="text-xs bg-powder-200 dark:bg-onyx-700 px-2 py-1 rounded text-onyx-700 dark:text-onyx-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis block"
                >
                  {{ templatesStore.getCardsCountForTemplate(tpl.id) }} carte(s) liée(s)
                </span>
              </div>

              <div class="mt-auto grid grid-cols-2 gap-2">
                <router-link
                  :to="`/editor/${tpl.id}?mode=edit-template`"
                  class="flex items-center justify-center gap-1.5 px-3 py-1 bg-powder-200 hover:bg-powder-300 dark:bg-onyx-700 dark:hover:bg-onyx-600 rounded-lg text-[11px] font-semibold text-onyx-800 dark:text-onyx-200 transition-colors"
                >
                  <Edit class="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </router-link>
                <button
                  @click="openCreateCardModal(tpl)"
                  class="flex items-center justify-center gap-1.5 px-3 py-1 bg-flame-50 dark:bg-flame-900/20 hover:bg-flame-100 dark:hover:bg-flame-900/40 text-flame-600 dark:text-flame-400 border border-flame-200 dark:border-flame-800 rounded-lg text-[11px] font-semibold transition-colors"
                >
                  <Plus class="w-3.5 h-3.5 shrink-0" />
                  <span class="truncate">Créer carte</span>
                </button>
                <button
                  @click="openBatchModal(tpl)"
                  class="col-span-2 flex items-center justify-center gap-1.5 px-3 py-1.5 text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg text-[11px] font-semibold transition-colors mt-1"
                >
                  <Users class="w-3.5 h-3.5 shrink-0" />
                  <span>Génération en lot (Excel)</span>
                  <span
                    v-if="!authStore.isPremium && !authStore.isAdmin"
                    class="text-[9px] font-bold text-amber-500 ml-auto"
                    >PRO</span
                  >
                </button>
                <button
                  @click="deleteTemplate(tpl.id)"
                  class="col-span-2 flex items-center justify-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg text-[11px] font-semibold transition-colors mt-1"
                >
                  <Trash2 class="w-3.5 h-3.5 shrink-0" />
                  <span>Supprimer le modèle</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="py-12 bg-powder-50/50 dark:bg-onyx-900/50 rounded-2xl border border-dashed border-powder-300 dark:border-onyx-700 flex flex-col items-center justify-center text-center px-4"
        >
          <div
            class="w-16 h-16 bg-powder-200 dark:bg-onyx-800 rounded-full flex items-center justify-center mb-4"
          >
            <Copy class="w-8 h-8 text-onyx-400" />
          </div>
          <p class="text-onyx-600 dark:text-onyx-400 font-medium max-w-sm">
            Aucun modèle créé. Les modèles vous permettent de centraliser le design de plusieurs
            cartes.
          </p>
        </div>
      </div>
      </Transition>

      <!-- My Cards Section -->
      <Transition name="tab-fade" mode="out-in">
      <div v-if="dashboardTab === 'cards'" key="cards">
      <div class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h2 class="text-2xl md:text-3xl font-bold text-onyx-950 dark:text-powder-50">
            Mes cartes de visite
          </h2>
          <button
            @click="toggleCardSort"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-powder-300 dark:border-onyx-600 hover:bg-powder-100 dark:hover:bg-onyx-700 transition-colors text-xs font-medium text-onyx-600 dark:text-onyx-400"
            :title="cardSortOrder === 'newest' ? 'Plus récent d\'abord' : 'Plus ancien d\'abord'"
          >
            <ArrowUpDown class="w-3.5 h-3.5" />
            <span>{{ cardSortOrder === 'newest' ? 'Plus récent' : 'Plus ancien' }}</span>
          </button>
        </div>
        <div v-if="store.userCards.length > 0" class="flex items-center space-x-3">
          <button
            @click="toggleSelectAll"
            class="px-4 py-2 rounded-lg border border-powder-300 dark:border-onyx-600 hover:bg-powder-100 dark:hover:bg-onyx-700 transition-colors flex items-center space-x-2 text-sm font-medium"
            :class="
              selectedCardIds.size > 0
                ? 'bg-flame-50 dark:bg-flame-900/20 border-flame-300 dark:border-flame-700'
                : ''
            "
          >
            <Check
              class="w-4 h-4"
              :class="selectedCardIds.size > 0 ? 'text-flame-600' : 'text-onyx-400'"
            />
            <span>{{
              selectedCardIds.size > 0
                ? `${selectedCardIds.size} sélectionnée(s)`
                : 'Sélectionner tout'
            }}</span>
          </button>
          <button
            v-if="selectedCardIds.size > 0"
            @click="deleteSelectedCards"
            class="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center space-x-2 text-sm font-medium"
          >
            <Trash2 class="w-4 h-4" />
            <span>Supprimer ({{ selectedCardIds.size }})</span>
          </button>
        </div>
      </div>

      <!-- Recent Cards Carousel - SUPPRIMÉ -->

      <!-- Cards Grid -->
      <div v-if="store.userCards.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div
          v-for="card in sortedCards"
          :key="card.id"
          class="bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group relative"
        >
          <!-- Checkbox de sélection (top-left, discret) -->
          <div class="absolute top-3 left-3 z-20">
            <button
              @click="toggleCardSelection(card.id)"
              class="w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shadow-sm"
              :class="
                selectedCardIds.has(card.id)
                  ? 'bg-flame-600 border-flame-600 text-white'
                  : 'bg-white/90 dark:bg-onyx-700/90 border-powder-300 dark:border-onyx-500 text-transparent hover:border-flame-400'
              "
              :title="selectedCardIds.has(card.id) ? 'Désélectionner' : 'Sélectionner'"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>

          <!-- Card Preview Section -->
          <div
            class="relative overflow-hidden bg-powder-100 dark:bg-onyx-800 h-64 flex items-center justify-center"
          >
            <div :style="{ width: cardPreviewWidth(card, 220) + 'px' }">
              <BusinessCard :card="card" :isFlipped="flippedCards.has(card.id)" />
            </div>
            <!-- Status Badge -->
            <div class="absolute top-3 right-3">
              <span
                class="px-3 py-1 text-xs font-bold rounded-full border"
                :class="
                  card.isPublic
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : 'bg-gray-100 dark:bg-onyx-700 text-gray-500 dark:text-onyx-400 border-gray-200 dark:border-onyx-600'
                "
              >
                {{ card.isPublic ? '✓ Publique' : '○ Privée' }}
              </span>
            </div>
            <!-- Flip button overlay (bottom-right of card preview) -->
            <button
              v-if="card.data?.versoElements?.length"
              @click.stop="toggleCardFlip(card.id)"
              class="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm backdrop-blur-sm"
              :class="
                flippedCards.has(card.id)
                  ? 'bg-onyx-800/90 text-white'
                  : 'bg-white/90 dark:bg-onyx-900/90 text-onyx-700 dark:text-onyx-200'
              "
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {{ flippedCards.has(card.id) ? 'Recto' : 'Verso' }}
            </button>
          </div>

          <!-- Card Details -->
          <div class="p-8">
            <div class="mb-6">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <!-- Card label (name given by user) -->
                  <p
                    class="text-[10px] font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-1"
                  >
                    {{ card.name }}
                  </p>
                  <h3 class="text-xl md:text-2xl font-bold text-onyx-900 dark:text-white">
                    {{ getFullName(card) }}
                  </h3>
                  <p class="text-sm text-onyx-500 dark:text-onyx-400 mt-1">
                    {{ cardSubtitle(card) }}
                  </p>
                </div>
              </div>
              <p class="text-xs text-onyx-500 dark:text-onyx-400">
                Créée le {{ formatDate(card.createdAt) }}
              </p>
            </div>

            <!-- Contact Info Grid -->
            <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-powder-50 dark:bg-onyx-800 rounded-xl">
              <div>
                <p class="text-xs text-onyx-500 dark:text-onyx-400 uppercase tracking-wide mb-1">
                  Email
                </p>
                <p class="text-sm font-semibold text-onyx-900 dark:text-white truncate">
                  {{ getElemText(card, 'email') || '-' }}
                </p>
              </div>
              <div>
                <p class="text-xs text-onyx-500 dark:text-onyx-400 uppercase tracking-wide mb-1">
                  Téléphone
                </p>
                <p class="text-sm font-semibold text-onyx-900 dark:text-white truncate">
                  {{ getElemText(card, 'phone') || '-' }}
                </p>
              </div>
              <div v-if="getElemText(card, 'website')" class="col-span-2">
                <p class="text-xs text-onyx-500 dark:text-onyx-400 uppercase tracking-wide mb-1">
                  Site web
                </p>
                <p class="text-sm font-semibold text-onyx-900 dark:text-white truncate">
                  {{ getElemText(card, 'website') }}
                </p>
              </div>
              <div class="col-span-2">
                <p class="text-xs text-onyx-500 dark:text-onyx-400 uppercase tracking-wide mb-1">
                  Adresse
                </p>
                <p class="text-sm font-semibold text-onyx-900 dark:text-white truncate">
                  {{ getElemText(card, 'address') || '-' }}
                </p>
              </div>
              <!-- Custom fields (contactExtra) -->
              <template v-if="card.data?.contactExtra?.length">
                <div
                  v-for="cf in card.data.contactExtra"
                  :key="cf.id"
                  :class="cf.value && cf.value.length > 30 ? 'col-span-2' : ''"
                >
                  <p class="text-xs text-onyx-500 dark:text-onyx-400 uppercase tracking-wide mb-1">
                    {{ cf.label }}
                  </p>
                  <p class="text-sm font-semibold text-onyx-900 dark:text-white truncate">
                    {{ cf.value || '-' }}
                  </p>
                </div>
              </template>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-2">
              <router-link
                :to="`/editor/${card.id}`"
                class="flex-1 min-w-fit px-4 py-2 bg-flame-50 dark:bg-flame-900/30 text-flame-700 dark:text-flame-300 hover:bg-flame-100 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center space-x-1 text-sm"
              >
                <Edit class="w-4 h-4" />
                <span>Modifier</span>
              </router-link>
              <button
                @click="openShareModal(card)"
                class="flex-1 min-w-fit px-4 py-2 bg-onyx-100 dark:bg-onyx-800/40 text-onyx-700 dark:text-onyx-300 hover:bg-onyx-200 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center space-x-1 text-sm"
              >
                <Share2 class="w-4 h-4" />
                <span>Partager</span>
              </button>

              <!-- Download dropdown -->
              <div class="relative flex-1 min-w-fit">
                <button
                  @click="activeDownloadCardId = activeDownloadCardId === card.id ? null : card.id"
                  class="w-full px-4 py-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-all duration-200 font-semibold flex items-center justify-center gap-1.5 text-sm"
                >
                  <Download class="w-4 h-4 shrink-0" />
                  <span>Télécharger</span>
                  <ChevronDown
                    class="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
                    :class="activeDownloadCardId === card.id ? 'rotate-180' : ''"
                  />
                </button>

                <!-- Backdrop -->
                <div
                  v-if="activeDownloadCardId === card.id"
                  class="fixed inset-0 z-10"
                  @click="activeDownloadCardId = null"
                />

                <!-- Dropdown panel -->
                <div
                  v-if="activeDownloadCardId === card.id"
                  class="absolute bottom-full mb-2 left-0 right-0 bg-powder-50 dark:bg-onyx-800 rounded-xl shadow-xl border border-powder-100 dark:border-onyx-700 overflow-hidden z-20 min-w-[160px]"
                >
                  <button
                    @click="downloadVCard(card); activeDownloadCardId = null"
                    class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-powder-50 dark:hover:bg-onyx-700 transition-colors"
                  >
                    <div
                      class="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0"
                    >
                      <UserIcon class="w-3.5 h-3.5 text-sky-500" />
                    </div>
                    <div class="text-left">
                      <div class="font-semibold text-onyx-800 dark:text-onyx-200 text-xs">
                        vCard (.vcf)
                      </div>
                    </div>
                  </button>
                  <button
                    @click="downloadPDF(card); activeDownloadCardId = null"
                    :disabled="exportLoading === card.id + '-pdf'"
                    class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-powder-50 dark:hover:bg-onyx-700 transition-colors border-t border-powder-100 dark:border-onyx-700 disabled:opacity-50"
                    :class="!authStore.isPremium && !authStore.isAdmin ? 'opacity-60' : ''"
                  >
                    <div
                      class="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0"
                    >
                      <Loader2
                        v-if="exportLoading === card.id + '-pdf'"
                        class="w-3.5 h-3.5 text-red-500 animate-spin"
                      />
                      <FileText v-else class="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <div class="text-left">
                      <div class="font-semibold text-onyx-800 dark:text-onyx-200 text-xs">PDF</div>
                    </div>
                    <span
                      v-if="!authStore.isPremium && !authStore.isAdmin"
                      class="ml-auto text-[10px] font-bold text-amber-500"
                      >PRO</span
                    >
                  </button>
                  <button
                    @click="downloadPNG(card); activeDownloadCardId = null"
                    :disabled="exportLoading === card.id + '-png'"
                    class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-powder-50 dark:hover:bg-onyx-700 transition-colors border-t border-powder-100 dark:border-onyx-700 disabled:opacity-50"
                    :class="!authStore.isPremium && !authStore.isAdmin ? 'opacity-60' : ''"
                  >
                    <div
                      class="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0"
                    >
                      <Loader2
                        v-if="exportLoading === card.id + '-png'"
                        class="w-3.5 h-3.5 text-violet-500 animate-spin"
                      />
                      <ImageIcon v-else class="w-3.5 h-3.5 text-violet-500" />
                    </div>
                    <div class="text-left">
                      <div class="font-semibold text-onyx-800 dark:text-onyx-200 text-xs">
                        Image PNG
                      </div>
                    </div>
                    <span
                      v-if="!authStore.isPremium && !authStore.isAdmin"
                      class="ml-auto text-[10px] font-bold text-amber-500"
                      >PRO</span
                    >
                  </button>
                  <button
                    @click="downloadJPG(card); activeDownloadCardId = null"
                    :disabled="exportLoading === card.id + '-jpg'"
                    class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-powder-50 dark:hover:bg-onyx-700 transition-colors border-t border-powder-100 dark:border-onyx-700 disabled:opacity-50"
                  >
                    <div
                      class="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0"
                    >
                      <Loader2
                        v-if="exportLoading === card.id + '-jpg'"
                        class="w-3.5 h-3.5 text-amber-500 animate-spin"
                      />
                      <ImageIcon v-else class="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div class="text-left">
                      <div class="font-semibold text-onyx-800 dark:text-onyx-200 text-xs">
                        Image JPG
                      </div>
                    </div>
                  </button>
                  <button
                    @click="downloadJSON(card); activeDownloadCardId = null"
                    class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-powder-50 dark:hover:bg-onyx-700 transition-colors border-t border-powder-100 dark:border-onyx-700"
                    :class="!authStore.isPremium && !authStore.isAdmin ? 'opacity-60' : ''"
                  >
                    <div
                      class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0"
                    >
                      <Braces class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div class="text-left">
                      <div class="font-semibold text-onyx-800 dark:text-onyx-200 text-xs">JSON</div>
                    </div>
                    <span
                      v-if="!authStore.isPremium && !authStore.isAdmin"
                      class="ml-auto text-[10px] font-bold text-amber-500"
                      >PRO</span
                    >
                  </button>
                </div>
              </div>
              <button
                @click="deleteCard(card.id)"
                class="flex-1 min-w-fit px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/60 transition-all duration-200 font-semibold flex items-center justify-center space-x-1 text-sm"
              >
                <Trash2 class="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-24">
        <div
          class="w-32 h-32 mx-auto mb-8 bg-powder-100 dark:bg-onyx-800 rounded-3xl flex items-center justify-center"
        >
          <CreditCard class="w-16 h-16 text-onyx-400 dark:text-onyx-500" />
        </div>
        <h3 class="text-3xl font-bold text-onyx-900 dark:text-white mb-3">Aucune carte créée</h3>
        <p class="text-onyx-600 dark:text-onyx-400 mb-8 text-lg max-w-md mx-auto">
          Commencez par créer votre première carte de visite professionnelle
        </p>
        <router-link
          to="/editor"
          class="inline-flex items-center space-x-2 px-8 py-4 bg-flame-500 hover:bg-flame-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus class="w-6 h-6" />
          <span>Créer ma première carte</span>
        </router-link>
      </div>
      </div>
      </Transition>

    </div>

    <!-- Share Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showShareModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            @click="showShareModal = false"
          />
          <div
            class="relative w-full max-w-sm bg-powder-50 dark:bg-onyx-800 rounded-2xl shadow-2xl p-6"
          >
            <!-- Header -->
            <div class="flex items-center justify-between mb-5">
              <div>
                <h3 class="font-bold text-onyx-900 dark:text-white text-lg">Partager la carte</h3>
                <p class="text-xs text-onyx-400 mt-0.5">
                  {{ getFullName(activeShareCard) || activeShareCard?.name }}
                </p>
              </div>
              <button
                @click="showShareModal = false"
                class="w-8 h-8 flex items-center justify-center rounded-lg text-onyx-400 hover:bg-powder-100 dark:hover:bg-onyx-700 transition-colors"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Share link -->
            <div class="mb-5">
              <label class="block text-xs font-medium text-onyx-500 dark:text-onyx-400 mb-2"
                >Lien de partage</label
              >
              <div class="flex gap-2">
                <input
                  :value="currentShareLink"
                  readonly
                  class="flex-1 px-3 py-2.5 text-xs rounded-lg bg-powder-50 dark:bg-onyx-700 border border-powder-200 dark:border-onyx-600 text-onyx-600 dark:text-onyx-300 min-w-0"
                />
                <button
                  @click="copyShareLink"
                  class="px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 shrink-0 flex items-center justify-center w-10"
                  :class="
                    linkCopied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-flame-500 hover:bg-flame-600 text-white'
                  "
                >
                  <Check v-if="linkCopied" class="w-4 h-4" />
                  <Copy v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Social options -->
            <p
              class="text-xs font-medium text-onyx-400 dark:text-onyx-500 uppercase tracking-wider mb-3"
            >
              Via
            </p>
            <div class="grid grid-cols-3 gap-3">
              <button
                @click="shareViaWhatsApp"
                class="flex flex-col items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                <div class="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                    />
                  </svg>
                </div>
                <span class="text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
                  >WhatsApp</span
                >
              </button>
              <button
                @click="shareViaEmail"
                class="flex flex-col items-center gap-2 p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
              >
                <div class="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center">
                  <Mail class="w-5 h-5 text-white" />
                </div>
                <span class="text-[11px] font-medium text-sky-700 dark:text-sky-400">Email</span>
              </button>
              <button
                @click="shareNative"
                class="flex flex-col items-center gap-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"
              >
                <div class="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center">
                  <Share2 class="w-5 h-5 text-white" />
                </div>
                <span class="text-[11px] font-medium text-violet-700 dark:text-violet-400"
                  >Plus</span
                >
              </button>
            </div>

            <!-- Link to ShareView -->
            <button
              @click="showShareModal = false; router.push(`/share/${activeShareCard.id}`)"
              class="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-powder-200 dark:border-onyx-600 text-onyx-600 dark:text-onyx-300 hover:bg-powder-100 dark:hover:bg-onyx-700 transition-colors text-sm font-medium"
            >
              <ExternalLink class="w-4 h-4" />
              <span>Voir la page de partage</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Ring burst canvas -->
    <canvas
      ref="confettiCanvas"
      class="fixed inset-0 z-[60] pointer-events-none"
      style="width: 100%; height: 100%"
    />

    <!-- Delete single card confirm -->
    <ConfirmModal
      v-if="showDeleteCardConfirm"
      title="Supprimer cette carte ?"
      message="Cette action est irréversible. La carte sera définitivement supprimée."
      confirm-label="Supprimer"
      variant="danger"
      @confirm="onDeleteCardConfirmed"
      @cancel="showDeleteCardConfirm = false"
    />

    <!-- Batch Create Modal -->
    <BatchCreateModal
      v-if="showBatchModal && activeTemplateForBatch"
      :visible="showBatchModal"
      :dark="themeStore.darkMode"
      :template-model="activeTemplateForBatch"
      @close="showBatchModal = false; activeTemplateForBatch = null"
      @generated="onBatchGenerated"
    />

    <!-- Delete selected cards confirm -->
    <ConfirmModal
      v-if="showDeleteSelectedConfirm"
      :title="`Supprimer ${selectedCardIds.size} carte(s) ?`"
      message="Cette action est irréversible. Toutes les cartes sélectionnées seront supprimées."
      confirm-label="Tout supprimer"
      variant="danger"
      @confirm="onDeleteSelectedConfirmed"
      @cancel="showDeleteSelectedConfirm = false"
    />

    <!-- Delete single template confirm (D4) -->
    <ConfirmModal
      v-if="showDeleteTemplateConfirm"
      title="Supprimer ce modèle ?"
      message="Les cartes créées à partir de celui-ci ne seront pas affectées."
      confirm-label="Supprimer"
      variant="danger"
      @confirm="onDeleteTemplateConfirmed"
      @cancel="showDeleteTemplateConfirm = false"
    />

    <!-- Delete selected templates confirm (D3) -->
    <ConfirmModal
      v-if="showDeleteSelectedTemplatesConfirm"
      :title="`Supprimer ${selectedTemplateIds.size} modèle(s) ?`"
      message="Les cartes créées à partir de ces modèles ne seront pas affectées."
      confirm-label="Tout supprimer"
      variant="danger"
      @confirm="onDeleteSelectedTemplatesConfirmed"
      @cancel="showDeleteSelectedTemplatesConfirm = false"
    />

    <!-- Create card from template modal (D1) -->
    <CreateCardFromTemplateModal
      v-if="showCreateCardModal && selectedTemplateForCard"
      :visible="showCreateCardModal"
      :dark="themeStore.darkMode"
      :template-model="selectedTemplateForCard"
      @close="showCreateCardModal = false; selectedTemplateForCard = null"
      @generated="onCardFromTemplateCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCardsStore, MAX_FREE_CARDS } from '@/stores/cards'
import { useUserTemplatesStore, MAX_FREE_TEMPLATES } from '@/stores/userTemplatesStore'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import ConfirmModal from '@/components/ConfirmModal.vue'
import BusinessCard from '@/components/BusinessCard.vue'
import BatchCreateModal from '@/components/BatchCreateModal.vue'
import CreateCardFromTemplateModal from '@/components/CreateCardFromTemplateModal.vue'
import { useThemeStore } from '@/stores/themeStore'
import { getFullName, getElemText, konvaToCardEl } from '@/utils/cardElements'

// Compute the wrapper width so the card fills a given max height exactly,
// works for any format (landscape, portrait, square, custom).
function cardPreviewWidth(card, maxH) {
  const cw = card.data?.cardWidth || 680
  const ch = card.data?.cardHeight || 429
  return Math.round(maxH * (cw / ch))
}
import { exportCardPages } from '@/utils/cardExporter'
import jsPDF from 'jspdf'
import {
  CreditCard,
  Eye,
  Download,
  Plus,
  Edit,
  Share2,
  Trash2,
  QrCode,
  Check,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  User as UserIcon,
  Mail,
  Loader2,
  X,
  Copy,
  ExternalLink,
  Braces,
  Users,
  ArrowUpDown,
} from 'lucide-vue-next'

const router = useRouter()
const store = useCardsStore()
const templatesStore = useUserTemplatesStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const themeStore = useThemeStore()

// ── Dashboard tab switch ──────────────────────────────────────
const dashboardTab = ref(localStorage.getItem('ecodev_dashboard_tab') || 'templates')
watch(dashboardTab, (v) => localStorage.setItem('ecodev_dashboard_tab', v))

// ── Sort ──────────────────────────────────────────────────────
const templateSortOrder = ref(localStorage.getItem('ecodev_tplSort') || 'newest')
const cardSortOrder = ref(localStorage.getItem('ecodev_cardSort') || 'newest')
watch(templateSortOrder, (v) => localStorage.setItem('ecodev_tplSort', v))
watch(cardSortOrder, (v) => localStorage.setItem('ecodev_cardSort', v))

const toggleTemplateSort = () => {
  templateSortOrder.value = templateSortOrder.value === 'newest' ? 'oldest' : 'newest'
}
const toggleCardSort = () => {
  cardSortOrder.value = cardSortOrder.value === 'newest' ? 'oldest' : 'newest'
}

// ── Modèles ───────────────────────────────────────────────────
const showAutoTemplates = ref(false)

const displayedTemplates = computed(() => {
  if (showAutoTemplates.value) return templatesStore.allTemplates
  return templatesStore.visibleTemplates
})

const sortedTemplates = computed(() => {
  const list = [...displayedTemplates.value]
  if (templateSortOrder.value === 'newest') {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else {
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }
  return list
})

const sortedCards = computed(() => {
  const list = [...store.userCards]
  if (cardSortOrder.value === 'newest') {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else {
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }
  return list
})

const templateToFakeCard = (tpl) => {
  const cw = tpl.editorData?.cardWidth || 680
  const ch = tpl.editorData?.cardHeight || 429
  return {
    id: tpl.id,
    name: tpl.name,
    data: {
      cardWidth: cw,
      cardHeight: ch,
      cardBorderRadius: tpl.editorData?.cardBorderRadius ?? 8,
      orientation: ch > cw ? 'portrait' : 'landscape',
      backgrounds: tpl.editorData?.backgrounds,
      elements: (tpl.editorData?.elements?.recto || [])
        .map((el, i) => konvaToCardEl(el, cw, ch, i))
        .filter(Boolean),
      versoElements: (tpl.editorData?.elements?.verso || [])
        .map((el, i) => konvaToCardEl(el, cw, ch, i))
        .filter(Boolean),
    },
  }
}

// ── Delete template confirm ─────────────────────────────────
const showDeleteTemplateConfirm = ref(false)
const pendingDeleteTemplateId = ref(null)
const showDeleteSelectedTemplatesConfirm = ref(false)

const deleteTemplate = (id) => {
  pendingDeleteTemplateId.value = id
  showDeleteTemplateConfirm.value = true
}

const onDeleteTemplateConfirmed = async () => {
  showDeleteTemplateConfirm.value = false
  const id = pendingDeleteTemplateId.value
  if (!id) return
  try {
    await templatesStore.deleteTemplate(id)
    selectedTemplateIds.value = new Set([...selectedTemplateIds.value].filter((tid) => tid !== id))
    notificationStore.success('Modèle supprimé')
  } catch {
    notificationStore.error('Erreur lors de la suppression')
  }
  pendingDeleteTemplateId.value = null
}

// ── Template multi-select ────────────────────────────────────
const selectedTemplateIds = ref(new Set())

const toggleTemplateSelection = (id) => {
  const next = new Set(selectedTemplateIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selectedTemplateIds.value = next
}

const toggleSelectAllTemplates = () => {
  if (selectedTemplateIds.value.size === displayedTemplates.value.length) {
    selectedTemplateIds.value = new Set()
  } else {
    selectedTemplateIds.value = new Set(displayedTemplates.value.map((t) => t.id))
  }
}

const deleteSelectedTemplates = () => {
  if (selectedTemplateIds.value.size === 0) return
  showDeleteSelectedTemplatesConfirm.value = true
}

const onDeleteSelectedTemplatesConfirmed = async () => {
  showDeleteSelectedTemplatesConfirm.value = false
  const count = selectedTemplateIds.value.size
  const ids = [...selectedTemplateIds.value]
  for (const id of ids) {
    try {
      await templatesStore.deleteTemplate(id)
    } catch {}
  }
  selectedTemplateIds.value = new Set()
  notificationStore.success(`${count} modèle(s) supprimé(s)`)
}

// ── Create card from template modal ──────────────────────────
const showCreateCardModal = ref(false)
const selectedTemplateForCard = ref(null)

const openCreateCardModal = (tpl) => {
  selectedTemplateForCard.value = tpl
  showCreateCardModal.value = true
}

const onCardFromTemplateCreated = () => {
  showCreateCardModal.value = false
  selectedTemplateForCard.value = null
  store.loadUserCards()
}

const showBatchModal = ref(false)
const activeTemplateForBatch = ref(null)

const openBatchModal = (tpl) => {
  if (!authStore.isPremium && !authStore.isAdmin) {
    notificationStore.warning('La génération en lot est réservée au plan Premium.')
    router.push('/pricing')
    return
  }
  activeTemplateForBatch.value = tpl
  showBatchModal.value = true
}

const onBatchGenerated = () => {
  store.loadUserCards()
}

// ── Existing state ────────────────────────────────────────────
const selectedCardIds = ref(new Set())
const flippedCards = ref(new Set())
const flippedTemplates = ref(new Set())
const carouselIndex = ref(0)
const hoveredCarouselIdx = ref(null)

// ── New state ─────────────────────────────────────────────────
const activeDownloadCardId = ref(null)
const showShareModal = ref(false)
const activeShareCard = ref(null)
const linkCopied = ref(false)
const exportLoading = ref('')
const confettiCanvas = ref(null)
let confettiFrame = null

const stats = computed(() => store.getGlobalStats())

const currentShareLink = computed(() => {
  if (activeShareCard.value?.id) {
    return store.generateShareLink(activeShareCard.value.id) || ''
  }
  return ''
})

// ── Carousel ──────────────────────────────────────────────────
const prevCarousel = () => {
  carouselIndex.value =
    carouselIndex.value > 0 ? carouselIndex.value - 1 : store.userCards.length - 1
}

const nextCarousel = () => {
  carouselIndex.value =
    carouselIndex.value < store.userCards.length - 1 ? carouselIndex.value + 1 : 0
}

const getCarouselCardStyle = (idx) => {
  const offset = idx - carouselIndex.value
  const absOffset = Math.abs(offset)
  if (absOffset > 2) return { display: 'none' }
  const translateXPx = offset * 265
  const rotateYDeg = offset * -32
  const translateZPx = absOffset === 0 ? 0 : absOffset === 1 ? -60 : -130
  const scale = 1 - absOffset * 0.18
  const blurPx = absOffset * 1.5
  const opacity = 1 - absOffset * 0.2
  const zIndex = 10 - absOffset
  const transform = [
    'translate(-50%, -50%)',
    `translateX(${translateXPx}px)`,
    `rotateY(${rotateYDeg}deg)`,
    `translateZ(${translateZPx}px)`,
    `scale(${scale})`,
  ].join(' ')
  return {
    top: '50%',
    left: '50%',
    transform,
    filter: blurPx > 0 ? `blur(${blurPx}px)` : 'none',
    opacity,
    zIndex,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    transformStyle: 'preserve-3d',
  }
}

// ── Card actions ──────────────────────────────────────────────
const toggleCardFlip = (cardId) => {
  const next = new Set(flippedCards.value)
  if (next.has(cardId)) {
    next.delete(cardId)
  } else {
    next.add(cardId)
  }
  flippedCards.value = next
}

const toggleTemplateFlip = (id) => {
  const next = new Set(flippedTemplates.value)
  next.has(id) ? next.delete(id) : next.add(id)
  flippedTemplates.value = next
}

const templateHasVerso = (tpl) => (tpl.editorData?.elements?.verso || []).length > 0

// Builds "Title @ Company", "Title", "Company", or "" — avoids orphan "@"
function cardSubtitle(card) {
  const t = getElemText(card, 'title')
  const c = getElemText(card, 'company')
  if (t && c) return `${t} @ ${c}`
  return t || c || ''
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ── Delete card confirm ────────────────────────────────────────
const showDeleteCardConfirm = ref(false)
const pendingDeleteCardId = ref(null)

const deleteCard = (cardId) => {
  pendingDeleteCardId.value = cardId
  showDeleteCardConfirm.value = true
}

const onDeleteCardConfirmed = () => {
  showDeleteCardConfirm.value = false
  const cardId = pendingDeleteCardId.value
  if (!cardId) return
  store.deleteCard(cardId)
  carouselIndex.value = Math.min(carouselIndex.value, Math.max(0, store.userCards.length - 1))
  selectedCardIds.value = new Set([...selectedCardIds.value].filter((id) => id !== cardId))
  notificationStore.success('Carte supprimée avec succès')
  pendingDeleteCardId.value = null
}

// ── Delete selected cards confirm ─────────────────────────────
const showDeleteSelectedConfirm = ref(false)

const deleteSelectedCards = () => {
  if (selectedCardIds.value.size === 0) return
  showDeleteSelectedConfirm.value = true
}

const onDeleteSelectedConfirmed = () => {
  showDeleteSelectedConfirm.value = false
  const count = selectedCardIds.value.size
  const idsToDelete = [...selectedCardIds.value]
  idsToDelete.forEach((id) => store.deleteCard(id))
  selectedCardIds.value = new Set()
  carouselIndex.value = Math.min(carouselIndex.value, Math.max(0, store.userCards.length - 1))
  notificationStore.success(`${count} carte(s) supprimée(s)`)
}

const toggleCardSelection = (cardId) => {
  const next = new Set(selectedCardIds.value)
  if (next.has(cardId)) {
    next.delete(cardId)
  } else {
    next.add(cardId)
  }
  selectedCardIds.value = next
}

const toggleSelectAll = () => {
  if (selectedCardIds.value.size === store.userCards.length) {
    selectedCardIds.value = new Set()
  } else {
    selectedCardIds.value = new Set(store.userCards.map((card) => card.id))
  }
}

// ── Share ─────────────────────────────────────────────────────
const openShareModal = (card) => {
  activeShareCard.value = card
  store.incrementCardShares?.(card.id)
  launchRingBurst()
  showShareModal.value = true
}

const copyShareLink = async () => {
  await navigator.clipboard.writeText(currentShareLink.value)
  linkCopied.value = true
  notificationStore.success('Lien copié !')
  setTimeout(() => {
    linkCopied.value = false
  }, 2000)
}

const shareViaWhatsApp = () => {
  const text = `Découvrez ma carte de visite digitale : ${currentShareLink.value}`
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}

const shareViaEmail = () => {
  const name = getFullName(activeShareCard.value) || 'Ma carte'
  const subject = encodeURIComponent(`Carte de visite — ${name}`)
  const body = encodeURIComponent(
    `Bonjour,\n\nDécouvrez ma carte de visite digitale :\n${currentShareLink.value}`,
  )
  window.location.href = `mailto:?subject=${subject}&body=${body}`
}

const shareNative = async () => {
  if (navigator.share) {
    await navigator
      .share({
        title: getFullName(activeShareCard.value) || 'Ma carte de visite',
        url: currentShareLink.value,
      })
      .catch(() => {})
  } else {
    copyShareLink()
  }
}

// ── Download ──────────────────────────────────────────────────
const downloadVCard = (card) => {
  const vCardContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${getFullName(card)}\nTITLE:${getElemText(card, 'title')}\nORG:${getElemText(card, 'company')}\nEMAIL:${getElemText(card, 'email')}\nTEL:${getElemText(card, 'phone')}\nURL:${getElemText(card, 'website')}\nADR:;;${getElemText(card, 'address')};;;;\nEND:VCARD`
  const blob = new Blob([vCardContent], { type: 'text/vcard' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${getFullName(card) || 'carte'}.vcf`
  link.click()
  window.URL.revokeObjectURL(url)
  notificationStore.success('vCard téléchargée avec succès')
}

// ── Download helpers (Konva-based, identical to editor export) ────────────

function triggerDownload(filename, dataUrl) {
  const a = document.createElement('a')
  a.download = filename
  a.href = dataUrl
  a.click()
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

const downloadPDF = async (card) => {
  if (!authStore.isPremium && !authStore.isAdmin) {
    notificationStore.warning("L'export en PDF est réservé au plan Premium.")
    router.push('/pricing')
    return
  }
  const key = card.id + '-pdf'
  exportLoading.value = key
  try {
    const pages = await exportCardPages(card, 'png')
    const cw = card.data?.cardWidth || 680
    const ch = card.data?.cardHeight || 429
    const PX_PER_MM = 680 / 85.6
    const mmW = cw / PX_PER_MM
    const mmH = ch / PX_PER_MM
    const orientation = mmW >= mmH ? 'landscape' : 'portrait'
    const pdf = new jsPDF({ orientation, unit: 'mm', format: [mmW, mmH] })
    const firstUrl = pages.recto || pages[Object.keys(pages)[0]]
    pdf.addImage(firstUrl, 'PNG', 0, 0, mmW, mmH)
    if (pages.verso) {
      pdf.addPage([mmW, mmH], orientation)
      pdf.addImage(pages.verso, 'PNG', 0, 0, mmW, mmH)
    }
    pdf.save(`${getFullName(card) || 'carte'}.pdf`)
    notificationStore.success('PDF téléchargé !')
    store.incrementCardDownloads?.(card.id)
  } catch (err) {
    console.error('PDF export failed:', err)
    notificationStore.error('Erreur lors de la génération du PDF')
  } finally {
    exportLoading.value = ''
  }
}

const downloadPNG = async (card) => {
  if (!authStore.isPremium && !authStore.isAdmin) {
    notificationStore.warning("L'export en PNG est réservé au plan Premium.")
    router.push('/pricing')
    return
  }
  const key = card.id + '-png'
  exportLoading.value = key
  try {
    const pages = await exportCardPages(card, 'png')
    if (pages.verso) {
      const [imgR, imgV] = await Promise.all([loadImage(pages.recto), loadImage(pages.verso)])
      const pw = imgR.naturalWidth
      const ph = imgR.naturalHeight
      const gap = Math.round(pw * 0.03)
      const canvas = document.createElement('canvas')
      canvas.width = pw * 2 + gap
      canvas.height = ph
      const ctx = canvas.getContext('2d')
      ctx.drawImage(imgR, 0, 0)
      ctx.drawImage(imgV, pw + gap, 0)
      triggerDownload(`${getFullName(card) || 'carte'}.png`, canvas.toDataURL('image/png'))
    } else {
      triggerDownload(`${getFullName(card) || 'carte'}.png`, pages.recto)
    }
    notificationStore.success('Image PNG téléchargée !')
    store.incrementCardDownloads?.(card.id)
  } catch (err) {
    console.error('PNG export failed:', err)
    notificationStore.error("Erreur lors de l'export de l'image")
  } finally {
    exportLoading.value = ''
  }
}

const downloadJPG = async (card) => {
  const key = card.id + '-jpg'
  exportLoading.value = key
  try {
    const pages = await exportCardPages(card, 'jpg')
    if (pages.verso) {
      const [imgR, imgV] = await Promise.all([loadImage(pages.recto), loadImage(pages.verso)])
      const pw = imgR.naturalWidth
      const ph = imgR.naturalHeight
      const gap = Math.round(pw * 0.03)
      const canvas = document.createElement('canvas')
      canvas.width = pw * 2 + gap
      canvas.height = ph
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(imgR, 0, 0)
      ctx.drawImage(imgV, pw + gap, 0)
      triggerDownload(`${getFullName(card) || 'carte'}.jpg`, canvas.toDataURL('image/jpeg', 0.92))
    } else {
      // Pages are PNG internally — re-encode as JPEG with white background
      const img = await loadImage(pages.recto)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      triggerDownload(`${getFullName(card) || 'carte'}.jpg`, canvas.toDataURL('image/jpeg', 0.92))
    }
    notificationStore.success('Image JPG téléchargée !')
    store.incrementCardDownloads?.(card.id)
  } catch (err) {
    console.error('JPG export failed:', err)
    notificationStore.error("Erreur lors de l'export de l'image")
  } finally {
    exportLoading.value = ''
  }
}

// ── Export JSON ───────────────────────────────────────────────
const downloadJSON = (card) => {
  if (!authStore.isPremium && !authStore.isAdmin) {
    notificationStore.warning("L'export en JSON est réservé au plan Premium.")
    router.push('/pricing')
    return
  }
  const json = store.exportCardsAsJSON([card])
  const blob = new Blob([json], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${getFullName(card) || card.name || 'carte'}.json`
  link.click()
  window.URL.revokeObjectURL(url)
  notificationStore.success('JSON téléchargé !')
  store.incrementCardDownloads?.(card.id)
}

const exportCards = () => {
  if (selectedCardIds.value.size === 0) return
  const cardsToExport = store.userCards.filter((card) => selectedCardIds.value.has(card.id))
  if (cardsToExport.length === 0) {
    notificationStore.error("Aucune carte à exporter. Créez d'abord une carte.")
    return
  }
  const json = store.exportCardsAsJSON(cardsToExport)
  const blob = new Blob([json], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cartes-digitales-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  window.URL.revokeObjectURL(url)
  notificationStore.success(`${cardsToExport.length} carte(s) exportée(s) avec succès`)
}

const importCards = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  event.target.value = ''
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const jsonString = e.target?.result
      if (typeof jsonString !== 'string') return
      const result = store.importCardsFromJSON(jsonString)
      if (result.success) {
        notificationStore.success(`${result.count} carte(s) importée(s) avec succès`)
      } else {
        notificationStore.error(`Erreur: ${result.error}`)
      }
    } catch {
      notificationStore.error('Erreur lors de la lecture du fichier')
    }
  }
  reader.readAsText(file)
}

// ── Ring burst ────────────────────────────────────────────────
const launchRingBurst = () => {
  const canvas = confettiCanvas.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const ctx = canvas.getContext('2d')
  const cx = canvas.width / 2
  const cy = canvas.height / 2
  const DURATION = 850
  const rings = [0, 130, 270].map((delay) => ({ delay, maxR: 80 + Math.random() * 60 }))
  if (confettiFrame) cancelAnimationFrame(confettiFrame)
  const t0 = performance.now()
  const tick = (now) => {
    const elapsed = now - t0
    const t = Math.min(elapsed / DURATION, 1)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const ring of rings) {
      const rt = Math.max(0, Math.min((elapsed - ring.delay) / (DURATION - ring.delay), 1))
      if (rt <= 0) continue
      const eased = 1 - Math.pow(1 - rt, 2)
      const radius = ring.maxR * eased
      const alpha = rt < 0.4 ? rt / 0.4 : 1 - (rt - 0.4) / 0.6
      ctx.save()
      ctx.globalAlpha = alpha * 0.3
      ctx.strokeStyle = '#e63950'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
    if (t < 1) {
      confettiFrame = requestAnimationFrame(tick)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      confettiFrame = null
    }
  }
  confettiFrame = requestAnimationFrame(tick)
}

onUnmounted(() => {
  if (confettiFrame) cancelAnimationFrame(confettiFrame)
})
</script>

<style scoped>
/* Modal fade transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .relative {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
.modal-fade-enter-active .relative {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

@keyframes carouselFlow {
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

.carousel-animated-bg {
  background: linear-gradient(270deg, #0a100d, #1c2a24, #141f1b, #0f1a16, #0a100d);
  background-size: 400% 400%;
  animation: carouselFlow 30s ease infinite;
}

/* Tab section fade + slide */
.tab-fade-enter-active {
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.tab-fade-leave-active {
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
