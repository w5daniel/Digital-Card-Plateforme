<template>
  <div
    class="dashboard-view min-h-screen bg-powder-50 dark:bg-onyx-950 py-12"
  >
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
              class="px-6 py-3 bg-powder-200 hover:bg-powder-300 dark:bg-onyx-700 dark:hover:bg-onyx-600 text-onyx-800 dark:text-white font-semibold rounded-xl shadow-sm transition-all duration-200 flex items-center space-x-2"
            >
              <Download class="w-5 h-5" />
              <span>Exporter</span>
            </button>
            <label
              class="px-6 py-3 bg-powder-200 hover:bg-powder-300 dark:bg-onyx-700 dark:hover:bg-onyx-600 text-onyx-800 dark:text-white font-semibold rounded-xl shadow-sm transition-all duration-200 flex items-center space-x-2 cursor-pointer"
            >
              <Plus class="w-5 h-5" />
              <span>Importer</span>
              <input type="file" accept=".json" @change="importCards" class="hidden" />
            </label>
            <router-link
              to="/editor"
              class="px-6 py-3 bg-flame-500 hover:bg-flame-600 text-white font-semibold rounded-xl shadow-sm transition-all duration-200 flex items-center space-x-2"
            >
              <Plus class="w-5 h-5" />
              <span>Créer une carte</span>
            </router-link>
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
        <div
          class="relative rounded-3xl overflow-hidden py-10 px-4 carousel-animated-bg"
        >
          <!-- Decorative glow blobs -->
          <div class="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
          <div class="absolute bottom-0 right-1/4 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 pointer-events-none"></div>

          <!-- 3D Scene -->
          <div
            class="relative flex items-center justify-center"
            style="height: 270px; perspective: 1200px; perspective-origin: 50% 50%;"
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
              <div class="w-72 select-none">
                <BusinessCard
                  :card="card"
                  :showQR="false"
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
              style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3);"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <!-- Dot Indicators -->
            <div class="flex items-center space-x-2">
              <button
                v-for="(card, idx) in store.userCards"
                :key="idx"
                @click="carouselIndex = idx"
                class="rounded-full transition-all duration-300"
                :style="carouselIndex === idx
                  ? 'width: 24px; height: 8px; background: rgba(255,255,255,0.95);'
                  : 'width: 8px; height: 8px; background: rgba(255,255,255,0.45);'"
              ></button>
            </div>

            <!-- Next Button -->
            <button
              @click="nextCarousel"
              :disabled="store.userCards.length <= 1"
              class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3);"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Active card label -->
          <div v-if="store.userCards[carouselIndex]" class="text-center mt-3 relative z-10">
            <p class="text-white font-semibold text-sm drop-shadow">
              {{ store.userCards[carouselIndex].data?.fullName || store.userCards[carouselIndex].name }}
            </p>
            <p class="text-white/70 text-xs">
              {{ store.userCards[carouselIndex].data?.title }}
              <span v-if="store.userCards[carouselIndex].data?.company">
                @ {{ store.userCards[carouselIndex].data?.company }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- My Cards Section -->
      <div class="mb-8 flex items-center justify-between">
        <h2 class="text-2xl md:text-3xl font-bold text-onyx-950 dark:text-powder-50">
          Mes cartes de visite
        </h2>
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
        </div>
      </div>

      <!-- Recent Cards Carousel - SUPPRIMÉ -->

      <!-- Cards Grid -->
      <div v-if="store.userCards.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div
          v-for="card in store.userCards"
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
            <div class="scale-75 origin-center w-full px-4">
              <BusinessCard :card="card" :showQR="false" :isFlipped="flippedCards.has(card.id)" />
            </div>
            <!-- Status Badge -->
            <div class="absolute top-3 right-3">
              <span
                class="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800"
              >
                ✓ Active
              </span>
            </div>
          </div>

          <!-- Card Details -->
          <div class="p-8">
            <div class="mb-6">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="text-xl md:text-2xl font-bold text-onyx-900 dark:text-white">
                    {{ card.data.fullName || card.name }}
                  </h3>
                  <p class="text-sm text-onyx-500 dark:text-onyx-400 mt-1">
                    {{ card.data.title }} @ {{ card.data.company }}
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
                  {{ card.data.email || '-' }}
                </p>
              </div>
              <div>
                <p class="text-xs text-onyx-500 dark:text-onyx-400 uppercase tracking-wide mb-1">
                  Téléphone
                </p>
                <p class="text-sm font-semibold text-onyx-900 dark:text-white truncate">
                  {{ card.data.phone || '-' }}
                </p>
              </div>
              <div class="col-span-2">
                <p class="text-xs text-onyx-500 dark:text-onyx-400 uppercase tracking-wide mb-1">
                  Adresse
                </p>
                <p class="text-sm font-semibold text-onyx-900 dark:text-white truncate">
                  {{ card.data.address || '-' }}
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-2">
              <button
                @click="toggleCardFlip(card.id)"
                class="flex-1 min-w-fit px-4 py-2 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center space-x-1 text-sm"
                :class="
                  flippedCards.has(card.id)
                    ? 'bg-onyx-800 text-white'
                    : 'bg-onyx-100 dark:bg-onyx-800/40 text-onyx-700 dark:text-onyx-300'
                "
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{{ flippedCards.has(card.id) ? 'Voir recto' : 'Voir verso' }}</span>
              </button>
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
                  <ChevronDown class="w-3.5 h-3.5 shrink-0 transition-transform duration-200" :class="activeDownloadCardId === card.id ? 'rotate-180' : ''" />
                </button>

                <!-- Backdrop -->
                <div v-if="activeDownloadCardId === card.id" class="fixed inset-0 z-10" @click="activeDownloadCardId = null" />

                <!-- Dropdown panel -->
                <div v-if="activeDownloadCardId === card.id" class="absolute bottom-full mb-2 left-0 right-0 bg-powder-50 dark:bg-onyx-800 rounded-xl shadow-xl border border-powder-100 dark:border-onyx-700 overflow-hidden z-20 min-w-[160px]">
                  <button
                    @click="downloadVCard(card); activeDownloadCardId = null"
                    class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-powder-50 dark:hover:bg-onyx-700 transition-colors"
                  >
                    <div class="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                      <UserIcon class="w-3.5 h-3.5 text-sky-500" />
                    </div>
                    <div class="text-left">
                      <div class="font-semibold text-onyx-800 dark:text-onyx-200 text-xs">vCard (.vcf)</div>
                    </div>
                  </button>
                  <button
                    @click="downloadPDF(card); activeDownloadCardId = null"
                    :disabled="exportLoading === card.id + '-pdf'"
                    class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-powder-50 dark:hover:bg-onyx-700 transition-colors border-t border-powder-100 dark:border-onyx-700 disabled:opacity-50"
                  >
                    <div class="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                      <Loader2 v-if="exportLoading === card.id + '-pdf'" class="w-3.5 h-3.5 text-red-500 animate-spin" />
                      <FileText v-else class="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <div class="text-left">
                      <div class="font-semibold text-onyx-800 dark:text-onyx-200 text-xs">PDF</div>
                    </div>
                  </button>
                  <button
                    @click="downloadPNG(card); activeDownloadCardId = null"
                    :disabled="exportLoading === card.id + '-png'"
                    class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-powder-50 dark:hover:bg-onyx-700 transition-colors border-t border-powder-100 dark:border-onyx-700 disabled:opacity-50"
                  >
                    <div class="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                      <Loader2 v-if="exportLoading === card.id + '-png'" class="w-3.5 h-3.5 text-violet-500 animate-spin" />
                      <ImageIcon v-else class="w-3.5 h-3.5 text-violet-500" />
                    </div>
                    <div class="text-left">
                      <div class="font-semibold text-onyx-800 dark:text-onyx-200 text-xs">Image PNG</div>
                    </div>
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
  </div>

  <!-- Hidden full-size card for PDF/PNG export -->
  <div class="fixed pointer-events-none" style="left:-9999px;top:-9999px;z-index:-1;">
    <div v-if="exportCard" ref="exportPreviewRef" style="width:500px;">
      <BusinessCard :card="exportCard" :showQR="false" />
    </div>
  </div>

  <!-- Share Modal -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showShareModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showShareModal = false" />
        <div class="relative w-full max-w-sm bg-powder-50 dark:bg-onyx-800 rounded-2xl shadow-2xl p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-5">
            <div>
              <h3 class="font-bold text-onyx-900 dark:text-white text-lg">Partager la carte</h3>
              <p class="text-xs text-onyx-400 mt-0.5">{{ activeShareCard?.data?.fullName || activeShareCard?.name }}</p>
            </div>
            <button @click="showShareModal = false" class="w-8 h-8 flex items-center justify-center rounded-lg text-onyx-400 hover:bg-powder-100 dark:hover:bg-onyx-700 transition-colors">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Share link -->
          <div class="mb-5">
            <label class="block text-xs font-medium text-onyx-500 dark:text-onyx-400 mb-2">Lien de partage</label>
            <div class="flex gap-2">
              <input :value="currentShareLink" readonly class="flex-1 px-3 py-2.5 text-xs rounded-lg bg-powder-50 dark:bg-onyx-700 border border-powder-200 dark:border-onyx-600 text-onyx-600 dark:text-onyx-300 min-w-0" />
              <button @click="copyShareLink" class="px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 shrink-0 flex items-center justify-center w-10" :class="linkCopied ? 'bg-emerald-500 text-white' : 'bg-flame-500 hover:bg-flame-600 text-white'">
                <Check v-if="linkCopied" class="w-4 h-4" />
                <Copy v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Social options -->
          <p class="text-xs font-medium text-onyx-400 dark:text-onyx-500 uppercase tracking-wider mb-3">Via</p>
          <div class="grid grid-cols-3 gap-3">
            <button @click="shareViaWhatsApp" class="flex flex-col items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
              <div class="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <span class="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">WhatsApp</span>
            </button>
            <button @click="shareViaEmail" class="flex flex-col items-center gap-2 p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors">
              <div class="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center">
                <Mail class="w-5 h-5 text-white" />
              </div>
              <span class="text-[11px] font-medium text-sky-700 dark:text-sky-400">Email</span>
            </button>
            <button @click="shareNative" class="flex flex-col items-center gap-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors">
              <div class="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center">
                <Share2 class="w-5 h-5 text-white" />
              </div>
              <span class="text-[11px] font-medium text-violet-700 dark:text-violet-400">Plus</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Ring burst canvas -->
  <canvas ref="confettiCanvas" class="fixed inset-0 z-[60] pointer-events-none" style="width:100%;height:100%;" />
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted } from 'vue'
import { useCardsStore } from '@/stores/cards'
import { useNotificationStore } from '@/stores/notificationStore'
import BusinessCard from '@/components/BusinessCard.vue'
import html2canvas from 'html2canvas'
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
} from 'lucide-vue-next'

const store = useCardsStore()
const notificationStore = useNotificationStore()

// ── Existing state ────────────────────────────────────────────
const selectedCardIds    = ref(new Set())
const flippedCards       = ref(new Set())
const carouselIndex      = ref(0)
const hoveredCarouselIdx = ref(null)

// ── New state ─────────────────────────────────────────────────
const activeDownloadCardId = ref(null)
const showShareModal       = ref(false)
const activeShareCard      = ref(null)
const linkCopied           = ref(false)
const exportLoading        = ref('')
const exportCard           = ref(null)
const exportPreviewRef     = ref(null)
const confettiCanvas       = ref(null)
let   confettiFrame        = null

const stats = computed(() => store.getGlobalStats())

const currentShareLink = computed(() => {
  if (activeShareCard.value?.id) {
    return store.generateShareLink(activeShareCard.value.id) || ''
  }
  return ''
})

// ── Carousel ──────────────────────────────────────────────────
const prevCarousel = () => {
  carouselIndex.value = carouselIndex.value > 0
    ? carouselIndex.value - 1
    : store.userCards.length - 1
}

const nextCarousel = () => {
  carouselIndex.value = carouselIndex.value < store.userCards.length - 1
    ? carouselIndex.value + 1
    : 0
}

const getCarouselCardStyle = (idx) => {
  const offset = idx - carouselIndex.value
  const absOffset = Math.abs(offset)
  if (absOffset > 2) return { display: 'none' }
  const translateXPx = offset * 265
  const rotateYDeg   = offset * -32
  const translateZPx = absOffset === 0 ? 0 : absOffset === 1 ? -60 : -130
  const scale        = 1 - absOffset * 0.18
  const blurPx       = absOffset * 1.5
  const opacity      = 1 - absOffset * 0.2
  const zIndex       = 10 - absOffset
  const transform = [
    'translate(-50%, -50%)',
    `translateX(${translateXPx}px)`,
    `rotateY(${rotateYDeg}deg)`,
    `translateZ(${translateZPx}px)`,
    `scale(${scale})`,
  ].join(' ')
  return {
    top: '50%', left: '50%', transform,
    filter: blurPx > 0 ? `blur(${blurPx}px)` : 'none',
    opacity, zIndex,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    transformStyle: 'preserve-3d',
  }
}

// ── Card actions ──────────────────────────────────────────────
const toggleCardFlip = (cardId) => {
  const next = new Set(flippedCards.value)
  next.has(cardId) ? next.delete(cardId) : next.add(cardId)
  flippedCards.value = next
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
}

const deleteCard = (cardId) => {
  if (confirm('⚠️ Êtes-vous sûr de vouloir supprimer cette carte ? Cette action est irréversible.')) {
    store.deleteCard(cardId)
    selectedCardIds.value.delete(cardId)
    notificationStore.success('Carte supprimée avec succès')
  }
}

const toggleCardSelection = (cardId) => {
  if (selectedCardIds.value.has(cardId)) {
    selectedCardIds.value.delete(cardId)
  } else {
    selectedCardIds.value.add(cardId)
  }
}

const toggleSelectAll = () => {
  if (selectedCardIds.value.size === store.userCards.length) {
    selectedCardIds.value.clear()
  } else {
    store.userCards.forEach((card) => selectedCardIds.value.add(card.id))
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
  setTimeout(() => { linkCopied.value = false }, 2000)
}

const shareViaWhatsApp = () => {
  const text = `Découvrez ma carte de visite digitale : ${currentShareLink.value}`
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}

const shareViaEmail = () => {
  const name    = activeShareCard.value?.data?.fullName || 'Ma carte'
  const subject = encodeURIComponent(`Carte de visite — ${name}`)
  const body    = encodeURIComponent(`Bonjour,\n\nDécouvrez ma carte de visite digitale :\n${currentShareLink.value}`)
  window.location.href = `mailto:?subject=${subject}&body=${body}`
}

const shareNative = async () => {
  if (navigator.share) {
    await navigator.share({
      title: activeShareCard.value?.data?.fullName || 'Ma carte de visite',
      url: currentShareLink.value,
    }).catch(() => {})
  } else {
    copyShareLink()
  }
}

// ── Download ──────────────────────────────────────────────────
const downloadVCard = (card) => {
  const vCardContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${card.data.fullName}\nTITLE:${card.data.title}\nORG:${card.data.company}\nEMAIL:${card.data.email}\nTEL:${card.data.phone}\nURL:${card.data.website}\nADR:;;${card.data.address};;;;\nPHOTO;VALUE=URI:${card.data.photo}\nEND:VCARD`
  const blob = new Blob([vCardContent], { type: 'text/vcard' })
  const url  = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${card.data.fullName || 'carte'}.vcf`
  link.click()
  window.URL.revokeObjectURL(url)
  notificationStore.success('vCard téléchargée avec succès')
}

const captureExportCard = async (card, key) => {
  exportCard.value   = card
  exportLoading.value = key
  await nextTick()
  const canvas = await html2canvas(exportPreviewRef.value, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
  })
  exportCard.value = null
  return canvas
}

const downloadPDF = async (card) => {
  const key = card.id + '-pdf'
  try {
    const canvas = await captureExportCard(card, key)
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] })
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save(`${card.data.fullName || 'carte'}.pdf`)
    notificationStore.success('PDF téléchargé !')
    store.incrementCardDownloads?.(card.id)
  } catch {
    notificationStore.error('Erreur lors de la génération du PDF')
  } finally {
    exportLoading.value = ''
  }
}

const downloadPNG = async (card) => {
  const key = card.id + '-png'
  try {
    const canvas = await captureExportCard(card, key)
    const link   = document.createElement('a')
    link.download = `${card.data.fullName || 'carte'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    notificationStore.success('Image PNG téléchargée !')
    store.incrementCardDownloads?.(card.id)
  } catch {
    notificationStore.error("Erreur lors de l'export de l'image")
  } finally {
    exportLoading.value = ''
  }
}

// ── Export JSON ───────────────────────────────────────────────
const exportCards = () => {
  const cardsToExport = selectedCardIds.value.size > 0
    ? store.userCards.filter((card) => selectedCardIds.value.has(card.id))
    : store.userCards
  if (cardsToExport.length === 0) {
    notificationStore.error("Aucune carte à exporter. Créez d'abord une carte.")
    return
  }
  const json = JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString(), cards: cardsToExport, templates: store.templates }, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url  = window.URL.createObjectURL(blob)
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
  canvas.width  = window.innerWidth
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
      const eased  = 1 - Math.pow(1 - rt, 2)
      const radius = ring.maxR * eased
      const alpha  = rt < 0.4 ? rt / 0.4 : 1 - (rt - 0.4) / 0.6
      ctx.save()
      ctx.globalAlpha = alpha * 0.3
      ctx.strokeStyle = '#e63950'
      ctx.lineWidth   = 1.5
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

onUnmounted(() => { if (confettiFrame) cancelAnimationFrame(confettiFrame) })
</script>

<style scoped>
/* Modal fade transition */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .relative { transform: scale(0.95) translateY(8px); opacity: 0; }
.modal-fade-enter-active .relative { transition: transform 0.2s ease, opacity 0.2s ease; }

@keyframes carouselFlow {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.carousel-animated-bg {
  background: linear-gradient(270deg, #0a100d, #1c2a24, #141f1b, #0f1a16, #0a100d);
  background-size: 400% 400%;
  animation: carouselFlow 30s ease infinite;
}
</style>
