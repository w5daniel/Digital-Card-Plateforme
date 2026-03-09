<template>
  <div class="editor-view py-12 min-h-screen bg-powder-50 dark:bg-onyx-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2 text-onyx-950 dark:text-powder-50">
          Créer une carte de visite
        </h1>
        <p class="text-onyx-600 dark:text-powder-400">
          Personnalisez votre carte de visite professionnelle
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left Panel - Form -->
        <div class="space-y-6">
          <!-- Card Name -->
          <div class="card p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h2 class="text-xl font-bold flex items-center text-onyx-900 dark:text-white">
                  <FileText class="w-5 h-5 mr-2 text-flame-500" />
                  Nom de la carte
                </h2>
                <p class="text-xs text-onyx-400 dark:text-onyx-500 mt-1 ml-7">
                  Identifiant visible dans votre tableau de bord (pas sur la carte)
                </p>
              </div>
              <span
                class="text-[10px] font-semibold bg-flame-50 dark:bg-flame-900/30 text-flame-500 px-2 py-0.5 rounded-full shrink-0 mt-1"
                >Requis</span
              >
            </div>
            <input
              v-model="cardData.name"
              type="text"
              placeholder="Ex: Ma carte professionnelle"
              class="input-field"
            />
          </div>

          <!-- Personal Information -->
          <div class="card p-6">
            <h2 class="text-xl font-bold mb-4 flex items-center text-onyx-900 dark:text-white">
              <User class="w-5 h-5 mr-2 text-flame-500" />
              Informations personnelles
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-onyx-700 dark:text-onyx-300 mb-2"
                  >Nom complet *</label
                >
                <input
                  v-model="cardData.data.fullName"
                  type="text"
                  placeholder="Ex: Jean Dupont"
                  class="input-field"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-onyx-700 dark:text-onyx-300 mb-2"
                  >Titre professionnel *</label
                >
                <input
                  v-model="cardData.data.title"
                  type="text"
                  placeholder="Ex: Développeur Full Stack"
                  class="input-field"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-onyx-700 dark:text-onyx-300 mb-2"
                  >Entreprise</label
                >
                <input
                  v-model="cardData.data.company"
                  type="text"
                  placeholder="Ex: TechCorp Inc."
                  class="input-field"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-onyx-700 dark:text-onyx-300 mb-2"
                  >Photo de profil</label
                >
                <div class="space-y-3">
                  <!-- Photo Preview -->
                  <div v-if="cardData.data.photo" class="relative w-32 h-32 mx-auto">
                    <img
                      :src="cardData.data.photo"
                      alt="Photo preview"
                      class="w-full h-full rounded-lg object-cover border-2 border-powder-300"
                    />
                    <button
                      type="button"
                      @click="removePhoto"
                      class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>

                  <!-- Upload Input -->
                  <div class="flex gap-2">
                    <label
                      class="flex-1 px-4 py-2 bg-flame-50 dark:bg-flame-900/20 text-flame-700 dark:text-flame-300 rounded-lg hover:bg-flame-100 transition-colors font-medium cursor-pointer text-center flex items-center justify-center"
                    >
                      <Upload class="w-4 h-4 mr-2" />
                      Charger photo
                      <input
                        type="file"
                        accept="image/*"
                        @change="handlePhotoUpload"
                        class="hidden"
                      />
                    </label>
                  </div>

                  <!-- URL Alternative -->
                  <input
                    v-model="photoUrl"
                    type="url"
                    placeholder="Ou coller une URL..."
                    class="input-field text-sm"
                    @keyup.enter="setPhotoFromUrl"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="card p-6">
            <h2 class="text-xl font-bold mb-4 flex items-center text-onyx-900 dark:text-white">
              <Phone class="w-5 h-5 mr-2 text-flame-500" />
              Coordonnées
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-onyx-700 dark:text-onyx-300 mb-2"
                  >Email *</label
                >
                <input
                  v-model="cardData.data.email"
                  type="email"
                  placeholder="email@example.com"
                  class="input-field"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-onyx-700 dark:text-onyx-300 mb-2"
                  >Téléphone</label
                >
                <input
                  v-model="cardData.data.phone"
                  type="tel"
                  placeholder="+226 70 12 34 56"
                  class="input-field"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-onyx-700 dark:text-onyx-300 mb-2"
                  >Site web</label
                >
                <input
                  v-model="cardData.data.website"
                  type="url"
                  placeholder="www.example.com"
                  class="input-field"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-onyx-700 dark:text-onyx-300 mb-2"
                  >Adresse</label
                >
                <input
                  v-model="cardData.data.address"
                  type="text"
                  placeholder="Ville, Pays"
                  class="input-field"
                />
              </div>
            </div>
          </div>

          <!-- Template Selection -->
          <div class="card p-6">
            <h2 class="text-xl font-bold mb-4 flex items-center text-onyx-900 dark:text-white">
              <Palette class="w-5 h-5 mr-2 text-flame-500" />
              Choisir un modèle
            </h2>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="template in store.templates.slice(0, 4)"
                :key="template.id"
                @click="cardData.template = template.slug"
                class="p-3 rounded-xl border-2 transition-all duration-200 text-left"
                :class="
                  cardData.template === template.slug
                    ? 'border-flame-500 bg-flame-50 dark:bg-flame-900/20'
                    : 'border-powder-200 dark:border-onyx-700 hover:border-flame-300 dark:hover:border-flame-500'
                "
              >
                <div class="flex items-center space-x-2 mb-2">
                  <div
                    class="w-6 h-6 rounded-full"
                    :style="{ backgroundColor: template.colors.primary }"
                  ></div>
                  <div
                    class="w-6 h-6 rounded-full"
                    :style="{ backgroundColor: template.colors.secondary }"
                  ></div>
                </div>
                <p class="text-sm font-semibold text-onyx-900 dark:text-white">
                  {{ template.name }}
                </p>
              </button>
            </div>
            <!-- Carte vierge -->
            <button
              @click="cardData.template = 'blank'; isCardFlipped = false"
              class="w-full mt-3 p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3"
              :class="
                cardData.template === 'blank'
                  ? 'border-flame-500 bg-flame-50 dark:bg-flame-900/20'
                  : 'border-dashed border-powder-300 dark:border-onyx-600 hover:border-flame-300'"
            >
              <div class="w-6 h-6 rounded-full border-2 border-onyx-300 dark:border-onyx-500 bg-white flex-shrink-0"></div>
              <span class="text-sm font-semibold text-onyx-700 dark:text-powder-300">Carte vierge (édition libre)</span>
            </button>
            <router-link
              to="/gallery"
              class="block mt-3 text-center text-sm text-flame-600 hover:text-flame-700 font-medium"
            >
              Voir tous les modèles →
            </router-link>
          </div>

          <!-- Logo Upload -->
          <div class="card p-6">
            <h2 class="text-xl font-bold mb-4 flex items-center text-onyx-900 dark:text-white">
              <FileText class="w-5 h-5 mr-2 text-flame-500" />
              Logo de l'entreprise
            </h2>
            <div class="space-y-3">
              <!-- Logo Preview -->
              <div v-if="cardData.data.logo" class="relative w-32 h-32 mx-auto">
                <img
                  :src="cardData.data.logo"
                  alt="Logo preview"
                  class="w-full h-full rounded-lg object-contain border-2 border-powder-300 bg-powder-50 dark:bg-onyx-900 p-2"
                />
                <button
                  type="button"
                  @click="removeLogo"
                  class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>

              <!-- Upload Input -->
              <label
                class="block px-4 py-3 bg-flame-50 dark:bg-flame-900/20 text-flame-700 dark:text-flame-300 rounded-lg hover:bg-flame-100 transition-colors font-medium cursor-pointer text-center"
              >
                <Upload class="w-4 h-4 mr-2 inline" />
                Charger le logo
                <input type="file" accept="image/*" @change="handleLogoUpload" class="hidden" />
              </label>
            </div>
          </div>

          <!-- Background Image -->
          <div class="card p-6">
            <h2 class="text-xl font-bold mb-4 flex items-center text-onyx-900 dark:text-white">
              <ImageIcon class="w-5 h-5 mr-2 text-flame-500" />
              Image de fond
            </h2>
            <div class="space-y-3">
              <p class="text-xs text-onyx-500 dark:text-onyx-400">Utilisez une image comme arrière-plan de votre carte.</p>
              <!-- Preview -->
              <div v-if="cardData.data.backgroundImage" class="relative w-full h-24 rounded-xl overflow-hidden">
                <img
                  :src="cardData.data.backgroundImage"
                  alt="Fond de carte"
                  class="w-full h-full object-cover"
                />
                <button
                  type="button"
                  @click="removeBgImage"
                  class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>
              <!-- Upload -->
              <label
                class="block px-4 py-3 bg-flame-50 dark:bg-flame-900/20 text-flame-700 dark:text-flame-300 rounded-lg hover:bg-flame-100 transition-colors font-medium cursor-pointer text-center"
              >
                <Upload class="w-4 h-4 mr-2 inline" />
                Choisir une image de fond
                <input type="file" accept="image/*" @change="handleBgImageUpload" class="hidden" />
              </label>
            </div>
          </div>

          <!-- Font Selection -->
          <div class="card p-6">
            <h2 class="text-xl font-bold mb-4 flex items-center text-onyx-900 dark:text-white">
              <FileText class="w-5 h-5 mr-2 text-flame-500" />
              Police d'écriture
            </h2>
            <select v-model="cardData.data.fontFamily" class="input-field">
              <optgroup label="— Sans-Serif Modernes —">
                <option value="Poppins">Poppins</option>
                <option value="Inter">Inter</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Raleway">Raleway</option>
                <option value="Nunito">Nunito</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Rubik">Rubik</option>
                <option value="DM Sans">DM Sans</option>
                <option value="Outfit">Outfit</option>
                <option value="Figtree">Figtree</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                <option value="Lexend">Lexend</option>
                <option value="Urbanist">Urbanist</option>
                <option value="Space Grotesk">Space Grotesk</option>
                <option value="Barlow">Barlow</option>
                <option value="Mulish">Mulish</option>
                <option value="Karla">Karla</option>
                <option value="Questrial">Questrial</option>
                <option value="Josefin Sans">Josefin Sans</option>
              </optgroup>
              <optgroup label="— Serif / Élégant —">
                <option value="Playfair Display">Playfair Display</option>
                <option value="Merriweather">Merriweather</option>
                <option value="Lora">Lora</option>
                <option value="Cormorant Garamond">Cormorant Garamond</option>
                <option value="EB Garamond">EB Garamond</option>
                <option value="Libre Baskerville">Libre Baskerville</option>
                <option value="Crimson Text">Crimson Text</option>
                <option value="PT Serif">PT Serif</option>
                <option value="Philosopher">Philosopher</option>
                <option value="Cinzel">Cinzel</option>
              </optgroup>
              <optgroup label="— Slab Serif —">
                <option value="Roboto Slab">Roboto Slab</option>
                <option value="Arvo">Arvo</option>
                <option value="Zilla Slab">Zilla Slab</option>
              </optgroup>
              <optgroup label="— Display / Décoration —">
                <option value="Oswald">Oswald</option>
                <option value="Bebas Neue">Bebas Neue</option>
                <option value="Abril Fatface">Abril Fatface</option>
                <option value="Righteous">Righteous</option>
                <option value="Exo 2">Exo 2</option>
                <option value="Orbitron">Orbitron</option>
                <option value="Lobster">Lobster</option>
              </optgroup>
              <optgroup label="— Monospace / Tech —">
                <option value="Roboto Mono">Roboto Mono</option>
                <option value="Source Code Pro">Source Code Pro</option>
                <option value="Space Mono">Space Mono</option>
                <option value="Courier Prime">Courier Prime</option>
              </optgroup>
              <optgroup label="— Script / Manuscrit —">
                <option value="Dancing Script">Dancing Script</option>
                <option value="Pacifico">Pacifico</option>
                <option value="Sacramento">Sacramento</option>
                <option value="Great Vibes">Great Vibes</option>
                <option value="Satisfy">Satisfy</option>
                <option value="Kalam">Kalam</option>
              </optgroup>
            </select>
          </div>

          <!-- Back Side Card -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold flex items-center text-onyx-900 dark:text-white">
                <FileText class="w-5 h-5 mr-2 text-flame-500" />
                Verso de la carte
              </h2>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="cardData.backSide.enabled"
                  class="w-4 h-4 rounded border-powder-300 text-flame-600 focus:ring-2 focus:ring-flame-500"
                />
                <span class="text-sm font-medium text-onyx-900 dark:text-white"
                  >Activer le verso</span
                >
              </label>
            </div>

            <div v-if="cardData.backSide.enabled" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-onyx-700 dark:text-onyx-300 mb-2"
                  >Titre du verso</label
                >
                <input
                  v-model="cardData.backSide.title"
                  type="text"
                  placeholder="Ex: Nos services, Nos produits..."
                  class="input-field"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-onyx-700 dark:text-onyx-300 mb-2"
                  >Contenu du verso</label
                >
                <textarea
                  v-model="cardData.backSide.content"
                  placeholder="Décrivez vos services, produits, ou informations additionnelles..."
                  class="input-field h-24 resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- QR Code Section -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold flex items-center text-onyx-900 dark:text-white">
                <QrCode class="w-5 h-5 mr-2 text-flame-500" />
                QR Code sur la carte
              </h2>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="cardData.data.showQR"
                  class="w-4 h-4 rounded border-powder-300 text-flame-600 focus:ring-2 focus:ring-flame-500"
                />
                <span class="text-sm font-medium text-onyx-900 dark:text-white"
                  >Activer le QR code</span
                >
              </label>
            </div>

            <div v-if="cardData.data.showQR" class="space-y-3">
              <div
                class="p-4 bg-flame-50 dark:bg-flame-900/20 rounded-xl border border-flame-200 dark:border-flame-800"
              >
                <p class="text-sm text-flame-700 dark:text-flame-300 font-medium mb-1">
                  QR code généré automatiquement
                </p>
                <p class="text-xs text-flame-700 dark:text-flame-300">
                  Le QR code encode vos coordonnées au format vCard et sera placé automatiquement :
                  <br />• <strong>Sans photo</strong> : centré à droite de la carte <br />•
                  <strong>Avec photo</strong> : en bas à droite de la carte
                </p>
              </div>
            </div>

            <div v-else class="p-4 bg-powder-50 dark:bg-onyx-700 rounded-xl">
              <p class="text-sm text-onyx-500 dark:text-onyx-400">
                Activez le QR code pour permettre à vos contacts de scanner et enregistrer vos
                coordonnées instantanément.
              </p>
            </div>
          </div>

          <!-- Visibility Section -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold flex items-center text-onyx-900 dark:text-white">
                <Globe class="w-5 h-5 mr-2 text-flame-500" />
                Visibilité de la carte
              </h2>
            </div>

            <!-- Toggle pill selector -->
            <div
              class="flex rounded-xl overflow-hidden border border-powder-200 dark:border-onyx-600 mb-4"
            >
              <button
                type="button"
                @click="cardData.isPublic = false"
                class="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200"
                :class="
                  !cardData.isPublic
                    ? 'bg-onyx-700 dark:bg-onyx-600 text-white'
                    : 'bg-white dark:bg-onyx-800 text-onyx-500 dark:text-onyx-400 hover:bg-powder-50 dark:hover:bg-onyx-700'
                "
              >
                <Lock class="w-4 h-4" />
                Privée
              </button>
              <button
                type="button"
                @click="cardData.isPublic = true"
                class="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200"
                :class="
                  cardData.isPublic
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white dark:bg-onyx-800 text-onyx-500 dark:text-onyx-400 hover:bg-powder-50 dark:hover:bg-onyx-700'
                "
              >
                <Globe class="w-4 h-4" />
                Publique
              </button>
            </div>

            <!-- Description -->
            <div
              class="p-4 rounded-xl border transition-all duration-200"
              :class="
                cardData.isPublic
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                  : 'bg-powder-50 dark:bg-onyx-700 border-powder-200 dark:border-onyx-600'
              "
            >
              <div class="flex items-start gap-3">
                <component
                  :is="cardData.isPublic ? Globe : Lock"
                  class="w-5 h-5 shrink-0 mt-0.5"
                  :class="
                    cardData.isPublic ? 'text-emerald-500' : 'text-onyx-400 dark:text-onyx-500'
                  "
                />
                <div>
                  <p
                    class="text-sm font-semibold"
                    :class="
                      cardData.isPublic
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-onyx-700 dark:text-onyx-300'
                    "
                  >
                    {{ cardData.isPublic ? 'Carte publique' : 'Carte privée' }}
                  </p>
                  <p
                    class="text-xs mt-0.5"
                    :class="
                      cardData.isPublic
                        ? 'text-emerald-600 dark:text-emerald-500'
                        : 'text-onyx-500 dark:text-onyx-400'
                    "
                  >
                    {{
                      cardData.isPublic
                        ? 'Accessible à tous via le lien de partage — idéale pour le réseautage.'
                        : "Visible uniquement par vous — personne d'autre ne peut y accéder."
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel - Preview -->
        <div class="lg:sticky lg:top-24 h-fit">
          <div class="card p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold flex items-center text-onyx-900 dark:text-white">
                <Eye class="w-5 h-5 mr-2 text-flame-500" />
                Aperçu en direct
              </h2>
              <button
                v-if="cardData.backSide.enabled"
                @click="isCardFlipped = !isCardFlipped"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                :class="
                  isCardFlipped
                    ? 'bg-flame-500 text-white'
                    : 'bg-powder-100 dark:bg-onyx-800 text-onyx-700 dark:text-powder-300 hover:bg-powder-200 dark:hover:bg-onyx-700'
                "
              >
                <RotateCcw class="w-4 h-4" />
                {{ isCardFlipped ? 'Recto' : 'Verso' }}
              </button>
            </div>

            <!-- Card Preview -->
            <div ref="cardPreviewRef" class="mb-6">
              <BusinessCard
                :card="cardData"
                :showQR="cardData.data.showQR"
                :isFlipped="isCardFlipped"
              />
            </div>

            <!-- Info Box -->
            <div
              class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6"
            >
              <div class="flex items-start space-x-3">
                <Info class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div class="text-sm text-blue-800 dark:text-blue-300">
                  <p class="font-semibold mb-1">Aperçu en temps réel</p>
                  <p>Les modifications sont affichées instantanément dans l'aperçu ci-dessus.</p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <!-- Save -->
              <button
                @click="saveCard"
                class="w-full btn-primary flex items-center justify-center"
                :disabled="!isFormValid"
                :class="!isFormValid ? 'opacity-50 cursor-not-allowed' : ''"
              >
                <Save class="w-5 h-5 mr-2" />
                Enregistrer la carte
              </button>

              <!-- Download dropdown -->
              <div class="relative">
                <button
                  @click="showDownloadMenu = !showDownloadMenu"
                  class="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <Download class="w-5 h-5" />
                  Télécharger
                  <ChevronDown
                    class="w-4 h-4 ml-auto transition-transform duration-200"
                    :class="showDownloadMenu ? 'rotate-180' : ''"
                  />
                </button>

                <!-- Backdrop -->
                <div
                  v-if="showDownloadMenu"
                  class="fixed inset-0 z-10"
                  @click="showDownloadMenu = false"
                />

                <!-- Dropdown panel -->
                <div
                  v-if="showDownloadMenu"
                  class="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-onyx-800 rounded-xl shadow-xl border border-powder-100 dark:border-onyx-700 overflow-hidden z-20"
                >
                  <button
                    @click="downloadPDF(); showDownloadMenu = false"
                    :disabled="exportLoading"
                    class="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-powder-50 dark:hover:bg-onyx-700 transition-colors disabled:opacity-50"
                  >
                    <div
                      class="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0"
                    >
                      <Loader2
                        v-if="exportLoading === 'pdf'"
                        class="w-4 h-4 text-red-500 animate-spin"
                      />
                      <FileText v-else class="w-4 h-4 text-red-500" />
                    </div>
                    <div class="text-left">
                      <div class="font-semibold text-onyx-800 dark:text-onyx-200">PDF</div>
                      <div class="text-xs text-onyx-400">Document haute qualité</div>
                    </div>
                  </button>
                  <button
                    @click="downloadPNG(); showDownloadMenu = false"
                    :disabled="exportLoading"
                    class="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-powder-50 dark:hover:bg-onyx-700 transition-colors border-t border-powder-100 dark:border-onyx-700 disabled:opacity-50"
                  >
                    <div
                      class="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0"
                    >
                      <Loader2
                        v-if="exportLoading === 'png'"
                        class="w-4 h-4 text-violet-500 animate-spin"
                      />
                      <ImageIcon v-else class="w-4 h-4 text-violet-500" />
                    </div>
                    <div class="text-left">
                      <div class="font-semibold text-onyx-800 dark:text-onyx-200">Image PNG</div>
                      <div class="text-xs text-onyx-400">Pour partager en image</div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Share -->
              <button
                @click="openShareModal"
                class="w-full px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 class="w-5 h-5" />
                Partager
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Share Modal ──────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showShareModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="showShareModal = false"
        />

        <!-- Panel -->
        <div
          class="relative w-full max-w-sm bg-white dark:bg-onyx-800 rounded-2xl shadow-2xl p-6 animate-modal-in"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-5">
            <div>
              <h3 class="font-bold text-onyx-900 dark:text-white text-lg">Partager la carte</h3>
              <p class="text-xs text-onyx-400 mt-0.5">
                {{ cardData.data.fullName || 'Votre carte' }}
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

          <!-- Social share options -->
          <p
            class="text-xs font-medium text-onyx-400 dark:text-onyx-500 uppercase tracking-wider mb-3"
          >
            Via
          </p>
          <div class="grid grid-cols-3 gap-3">
            <!-- WhatsApp -->
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

            <!-- Email -->
            <button
              @click="shareViaEmail"
              class="flex flex-col items-center gap-2 p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
            >
              <div class="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center">
                <Mail class="w-5 h-5 text-white" />
              </div>
              <span class="text-[11px] font-medium text-sky-700 dark:text-sky-400">Email</span>
            </button>

            <!-- Native share / more -->
            <button
              @click="shareNative"
              class="flex flex-col items-center gap-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"
            >
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

  <!-- Confetti canvas -->
  <canvas
    ref="confettiCanvas"
    class="fixed inset-0 z-[60] pointer-events-none"
    style="width: 100%; height: 100%"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCardsStore } from '@/stores/cards'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import BusinessCard from '@/components/BusinessCard.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {
  User,
  Phone,
  Palette,
  Eye,
  Save,
  Download,
  Share2,
  FileText,
  QrCode,
  Info,
  Copy,
  Check,
  Upload,
  X,
  Globe,
  Lock,
  ChevronDown,
  Image as ImageIcon,
  Mail,
  Loader2,
  RotateCcw,
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const store = useCardsStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const isEditing = ref(false)
const photoUrl = ref('')
const isCardFlipped = ref(false)

// ── New UI state ──────────────────────────────────────────────
const showDownloadMenu = ref(false)
const showShareModal = ref(false)
const exportLoading = ref('') // 'pdf' | 'png' | ''
const linkCopied = ref(false)
const cardPreviewRef = ref(null)
const confettiCanvas = ref(null)
let confettiFrame = null

const cardData = ref({
  name: 'Ma nouvelle carte',
  template: 'modern',
  data: {
    fullName: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    photo: '',
    logo: '',
    fontFamily: 'Poppins',
    showQR: false,
    backgroundImage: '',
  },
  backSide: {
    enabled: false,
    title: '',
    content: '',
  },
  isPublic: false,
})

const handlePhotoUpload = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      notificationStore.error('Fichier trop volumineux (max 2MB)')
      return
    }

    // Lire le fichier en data:url
    const reader = new FileReader()
    reader.onload = (e) => {
      cardData.value.data.photo = e.target?.result || ''
      notificationStore.success('Photo chargée avec succès')
    }
    reader.readAsDataURL(file)
  }
}

const handleLogoUpload = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    // Vérifier la taille (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      notificationStore.error('Logo trop volumineux (max 1MB)')
      return
    }

    // Lire le fichier en data:url
    const reader = new FileReader()
    reader.onload = (e) => {
      cardData.value.data.logo = e.target?.result || ''
      notificationStore.success('Logo chargé avec succès')
    }
    reader.readAsDataURL(file)
  }
}

const removePhoto = () => {
  cardData.value.data.photo = ''
  photoUrl.value = ''
}

const removeLogo = () => {
  cardData.value.data.logo = ''
}

const handleBgImageUpload = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      notificationStore.error('Image trop volumineuse (max 5MB)')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      cardData.value.data.backgroundImage = e.target?.result || ''
      notificationStore.success('Image de fond chargée')
    }
    reader.readAsDataURL(file)
  }
}

const removeBgImage = () => {
  cardData.value.data.backgroundImage = ''
}

const setPhotoFromUrl = () => {
  if (photoUrl.value) {
    cardData.value.data.photo = photoUrl.value
    photoUrl.value = ''
  }
}

onMounted(() => {
  // Si on a une ID dans l'URL, on charge la carte
  if (route.params.id) {
    const cardId = Number(route.params.id)
    const existingCard = store.getCardById(cardId)
    if (existingCard) {
      cardData.value = JSON.parse(JSON.stringify(existingCard))
      isEditing.value = true
    }
  }

  // Si on a un template sélectionné depuis la galerie
  if (store.currentTemplate) {
    cardData.value.template = store.currentTemplate
    store.currentTemplate = null
  }
})

const isFormValid = computed(() => {
  return (
    cardData.value.name?.trim() &&
    cardData.value.data.fullName &&
    cardData.value.data.title &&
    cardData.value.data.email
  )
})

const saveCard = () => {
  if (isFormValid.value) {
    if (isEditing.value) {
      // Mise à jour d'une carte existante
      store.updateCard(cardData.value.id, cardData.value)
      notificationStore.success('Carte mise à jour avec succès !')
    } else {
      // Création d'une nouvelle carte
      store.addCard(cardData.value)
      notificationStore.success('Carte enregistrée avec succès !')
    }
    router.push('/dashboard')
  }
}

const downloadVCard = () => {
  const vCardContent = `BEGIN:VCARD
VERSION:3.0
FN:${cardData.value.data.fullName}
TITLE:${cardData.value.data.title}
ORG:${cardData.value.data.company}
EMAIL:${cardData.value.data.email}
TEL:${cardData.value.data.phone}
URL:${cardData.value.data.website}
ADR:;;${cardData.value.data.address};;;;
PHOTO;VALUE=URI:${cardData.value.data.photo}
END:VCARD`

  const blob = new Blob([vCardContent], { type: 'text/vcard' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${cardData.value.data.fullName || 'carte'}.vcf`
  link.click()
  window.URL.revokeObjectURL(url)
  notificationStore.success('Fichier vCard téléchargé avec succès !')
}

const shareCard = () => {
  if (isEditing.value) {
    const shareLink = store.generateShareLink(cardData.value.id)
    store.incrementCardShares(cardData.value.id)
    if (shareLink) {
      // Copier dans le presse-papiers
      navigator.clipboard.writeText(shareLink).then(() => {
        notificationStore.success('Lien de partage copié !')
      })
    }
  } else {
    notificationStore.warning("Enregistrez d'abord la carte pour la partager")
  }
}

// ── Export helpers ────────────────────────────────────────────
const captureCard = async () => {
  const el = cardPreviewRef.value
  if (!el) throw new Error('Preview not found')
  return html2canvas(el, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
  })
}

const downloadPDF = async () => {
  exportLoading.value = 'pdf'
  try {
    const canvas = await captureCard()
    const imgW = canvas.width
    const imgH = canvas.height
    // Business card proportion in landscape A4
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [imgW, imgH] })
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, imgH)
    pdf.save(`${cardData.value.data.fullName || 'carte'}.pdf`)
    notificationStore.success('PDF téléchargé !')
    store.incrementCardDownloads?.(cardData.value.id)
  } catch {
    notificationStore.error('Erreur lors de la génération du PDF')
  } finally {
    exportLoading.value = ''
  }
}

const downloadPNG = async () => {
  exportLoading.value = 'png'
  try {
    const canvas = await captureCard()
    const link = document.createElement('a')
    link.download = `${cardData.value.data.fullName || 'carte'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    notificationStore.success('Image PNG téléchargée !')
    store.incrementCardDownloads?.(cardData.value.id)
  } catch {
    notificationStore.error("Erreur lors de l'export de l'image")
  } finally {
    exportLoading.value = ''
  }
}

// ── Share modal + confetti ────────────────────────────────────
const currentShareLink = computed(() => {
  if (isEditing.value && cardData.value.id) {
    return store.generateShareLink(cardData.value.id) || ''
  }
  return `${window.location.origin}/share/preview`
})

const openShareModal = () => {
  if (!isEditing.value) {
    notificationStore.warning("Enregistrez d'abord la carte pour la partager")
    return
  }
  store.incrementCardShares?.(cardData.value.id)
  launchConfetti()
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
  const name = cardData.value.data.fullName || 'Ma carte'
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
        title: cardData.value.data.fullName || 'Ma carte de visite',
        url: currentShareLink.value,
      })
      .catch(() => {})
  } else {
    copyShareLink()
  }
}

// ── Ring burst animation ──────────────────────────────────────
const launchConfetti = () => {
  const canvas = confettiCanvas.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const ctx = canvas.getContext('2d')

  const cx = canvas.width / 2
  const cy = canvas.height / 2
  const DURATION = 850

  // Staggered expanding rings
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
.modal-fade-enter-active .relative,
.modal-fade-leave-active .relative {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .relative {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}

/* Loader spin */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
