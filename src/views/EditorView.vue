<template>
  <!-- ═══════════════════════════════════════════════════════════════
       ÉDITEUR FULL-SCREEN — 3 panneaux (gauche · canvas · droite)
  ════════════════════════════════════════════════════════════════════ -->
  <div class="ed-root">

    <!-- ══ TOP BAR ════════════════════════════════════════════════ -->
    <header class="topbar">

      <!-- Logo / retour -->
      <div class="topbar-brand">
        <router-link to="/dashboard" class="back-btn" title="Retour au tableau de bord">
          <ArrowLeft class="w-3.5 h-3.5" />
        </router-link>
        <div class="brand-logo">
          <CreditCard class="w-3 h-3" style="stroke:rgba(0,0,0,.6)" />
        </div>
        <span class="brand-name truncate">{{ cardData.name || 'Nouvelle carte' }}</span>
        <span class="brand-badge">PRO</span>
      </div>

      <!-- Outils centraux -->
      <div class="topbar-center">
        <!-- Undo / Redo -->
        <button class="tool-btn" @click="undo" :disabled="historyIndex <= 0" title="Annuler Ctrl+Z">
          <Undo2 class="w-3.5 h-3.5" />
        </button>
        <button class="tool-btn" @click="redo" :disabled="historyIndex >= history.length - 1" title="Rétablir Ctrl+Y">
          <Redo2 class="w-3.5 h-3.5" />
        </button>

        <div class="vdiv" />

        <!-- Zoom -->
        <div class="zoom-ctrl">
          <button class="zbtn" @click="zoomIdx = Math.max(0, zoomIdx - 1)">−</button>
          <span class="zoom-val">{{ Math.round(ZOOMS[zoomIdx] * 100) }}%</span>
          <button class="zbtn" @click="zoomIdx = Math.min(ZOOMS.length - 1, zoomIdx + 1)">+</button>
        </div>

        <div class="vdiv" />

        <!-- Fond du canvas -->
        <button v-for="[k,l] in [['dark','Sombre'],['light','Clair'],['grid','Grille']]" :key="k"
          class="bg-btn" :class="bgMode === k && 'active'" @click="bgMode = k">{{ l }}</button>

        <div class="vdiv" />

        <!-- Indicateur sélection -->
        <Transition name="sel-fade" mode="out-in">
          <div v-if="selectedElement" key="sel" class="sel-indicator">
            <div class="sel-dot" />
            <span>{{ ELEMENT_LABELS[selectedElement] }}</span>
            <span class="sel-coords">{{ selCoords }}</span>
            <button @click="selectedElement = null" class="sel-close">×</button>
          </div>
          <span v-else key="no-sel" class="no-sel-hint">Cliquez un élément pour le sélectionner</span>
        </Transition>
      </div>

      <!-- Actions droite -->
      <div class="topbar-actions">
        <!-- Export dropdown -->
        <div class="relative">
          <button class="act-outline" @click="showDownloadMenu = !showDownloadMenu">
            <Download class="w-3.5 h-3.5" />
            <span>Exporter</span>
            <ChevronDown class="w-3 h-3" />
          </button>
          <div v-if="showDownloadMenu" class="fixed inset-0 z-10" @click="showDownloadMenu = false" />
          <div v-if="showDownloadMenu" class="export-menu">
            <button @click="downloadPDF(); showDownloadMenu = false" class="export-item" :disabled="exportLoading === 'pdf'">
              <div class="exp-tag">PDF</div>
              <div>
                <div class="exp-title">PDF</div>
                <div class="exp-sub">Document haute qualité</div>
              </div>
              <Loader2 v-if="exportLoading === 'pdf'" class="w-3 h-3 animate-spin ml-auto" style="color:var(--accent)" />
            </button>
            <button @click="downloadPNG(); showDownloadMenu = false" class="export-item" :disabled="exportLoading === 'png'">
              <div class="exp-tag">PNG</div>
              <div>
                <div class="exp-title">Image PNG</div>
                <div class="exp-sub">Pour partager en ligne</div>
              </div>
              <Loader2 v-if="exportLoading === 'png'" class="w-3 h-3 animate-spin ml-auto" style="color:var(--accent)" />
            </button>
          </div>
        </div>

        <!-- Save -->
        <button class="save-btn" :class="justSaved && 'saved'" @click="saveCard" :disabled="!isFormValid">
          <Check v-if="justSaved" class="w-3.5 h-3.5" />
          <Save v-else class="w-3.5 h-3.5" />
          <span>{{ justSaved ? 'Sauvegardé !' : (isEditing ? 'Mettre à jour' : 'Sauvegarder') }}</span>
        </button>
      </div>
    </header>

    <!-- ══ CORPS ════════════════════════════════════════════════════ -->
    <div class="ed-body">

      <!-- ── PANNEAU GAUCHE ──────────────────────────────────────── -->
      <aside class="left-panel">

        <!-- Onglets de navigation -->
        <div class="left-tabs">
          <button v-for="tab in LEFT_TABS" :key="tab.id"
            class="ltab" :class="leftTab === tab.id && 'active'" @click="leftTab = tab.id"
            :title="tab.label">
            <component :is="tab.icon" class="w-3.5 h-3.5" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- Contenu des onglets -->
        <div class="left-scroll">

          <!-- ── CONTENU ── -->
          <template v-if="leftTab === 'contenu'">
            <!-- Identité -->
            <div class="acc">
              <button class="acc-head" @click="openSections.identity = !openSections.identity">
                <span :class="openSections.identity && 'active-label'">Identité</span>
                <ChevronDown class="acc-arrow" :class="openSections.identity && 'open'" />
              </button>
              <div v-if="openSections.identity" class="acc-body">
                <LabelField label="Nom complet *" v-model="cardData.data.fullName" placeholder="Amara Diallo" />
                <LabelField label="Poste *" v-model="cardData.data.title" placeholder="Directrice Créative" />
              </div>
            </div>
            <!-- Entreprise -->
            <div class="acc">
              <button class="acc-head" @click="openSections.company = !openSections.company">
                <span :class="openSections.company && 'active-label'">Entreprise</span>
                <ChevronDown class="acc-arrow" :class="openSections.company && 'open'" />
              </button>
              <div v-if="openSections.company" class="acc-body">
                <LabelField label="Entreprise" v-model="cardData.data.company" placeholder="Studio Numérik" />
              </div>
            </div>
            <!-- Coordonnées -->
            <div class="acc">
              <button class="acc-head" @click="openSections.coords = !openSections.coords">
                <span :class="openSections.coords && 'active-label'">Coordonnées</span>
                <ChevronDown class="acc-arrow" :class="openSections.coords && 'open'" />
              </button>
              <div v-if="openSections.coords" class="acc-body">
                <LabelField label="Email *" v-model="cardData.data.email" placeholder="vous@exemple.com" />
                <LabelField label="Téléphone" v-model="cardData.data.phone" placeholder="+33 6 00 00 00 00" />
                <LabelField label="Site web" v-model="cardData.data.website" placeholder="monsite.com" />
                <LabelField label="Adresse" v-model="cardData.data.address" placeholder="Paris, France" />
              </div>
            </div>
            <!-- Médias -->
            <div class="acc">
              <button class="acc-head" @click="openSections.media = !openSections.media">
                <span :class="openSections.media && 'active-label'">Médias</span>
                <ChevronDown class="acc-arrow" :class="openSections.media && 'open'" />
              </button>
              <div v-if="openSections.media" class="acc-body">
                <!-- Photo -->
                <div>
                  <div class="field-label">Photo de profil</div>
                  <label class="upload-zone">
                    <img v-if="cardData.data.photo" :src="cardData.data.photo" class="upload-thumb" />
                    <span v-else class="upload-placeholder">
                      <Upload class="w-4 h-4" />
                      Choisir
                    </span>
                    <input type="file" accept="image/*" class="hidden" @change="handlePhotoUpload" />
                  </label>
                  <button v-if="cardData.data.photo" @click="removePhoto" class="remove-btn">Retirer la photo</button>
                </div>
                <!-- Logo -->
                <div>
                  <div class="field-label">Logo</div>
                  <label class="upload-zone">
                    <img v-if="cardData.data.logo" :src="cardData.data.logo" class="upload-thumb" />
                    <span v-else class="upload-placeholder">
                      <Upload class="w-4 h-4" />
                      Choisir
                    </span>
                    <input type="file" accept="image/*" class="hidden" @change="handleLogoUpload" />
                  </label>
                  <button v-if="cardData.data.logo" @click="removeLogo" class="remove-btn">Retirer le logo</button>
                </div>
              </div>
            </div>
          </template>

          <!-- ── DESIGN ── -->
          <template v-if="leftTab === 'design'">
            <div class="acc">
              <button class="acc-head" @click="openSections.typo = !openSections.typo">
                <span :class="openSections.typo && 'active-label'">Typographie</span>
                <ChevronDown class="acc-arrow" :class="openSections.typo && 'open'" />
              </button>
              <div v-if="openSections.typo" class="acc-body">
                <div class="field-label">Police des titres</div>
                <div class="font-list">
                  <div v-for="font in FONTS" :key="font"
                    class="font-row" :class="cardData.data.fontFamily === font && 'active'"
                    @click="cardData.data.fontFamily = font"
                    :style="`font-family:'${font}',sans-serif`">
                    <div>
                      <div class="font-name">{{ font }}</div>
                      <div class="font-preview">Aa Bb 123</div>
                    </div>
                    <Check v-if="cardData.data.fontFamily === font" class="w-3 h-3 shrink-0" style="color:var(--accent)" />
                  </div>
                </div>
              </div>
            </div>
            <div class="acc">
              <button class="acc-head" @click="openSections.background = !openSections.background">
                <span :class="openSections.background && 'active-label'">Image de fond</span>
                <ChevronDown class="acc-arrow" :class="openSections.background && 'open'" />
              </button>
              <div v-if="openSections.background" class="acc-body">
                <label class="upload-zone">
                  <img v-if="cardData.data.backgroundImage" :src="cardData.data.backgroundImage" class="upload-thumb" />
                  <span v-else class="upload-placeholder">
                    <Upload class="w-4 h-4" />
                    Ajouter
                  </span>
                  <input type="file" accept="image/*" class="hidden" @change="handleBgImageUpload" />
                </label>
                <button v-if="cardData.data.backgroundImage" @click="removeBgImage" class="remove-btn">Retirer le fond</button>
              </div>
            </div>
          </template>

          <!-- ── TEMPLATES ── -->
          <template v-if="leftTab === 'templates'">
            <div class="p-3">
              <div class="section-label mb-2">Mise en page</div>
              <div class="flex flex-col gap-2">
                <div v-for="tpl in store.getAllTemplates" :key="tpl.slug"
                  class="tpl-card" :class="cardData.template === tpl.slug && 'active'"
                  @click="cardData.template = tpl.slug">
                  <!-- Mini preview -->
                  <div class="tpl-preview-bg" :style="`background:linear-gradient(135deg,${tpl.colors?.primary || '#1a1a2e'},${tpl.colors?.secondary || '#2d2d4e'})`">
                    <div class="tpl-line-1" :style="`background:${tpl.colors?.text || '#fff'}; opacity:.7`" />
                    <div class="tpl-line-2" :style="`background:${tpl.colors?.accent || '#e83800'}`" />
                  </div>
                  <div class="tpl-meta">
                    <div class="tpl-name" :class="cardData.template === tpl.slug ? 'text-flame-400' : ''">{{ tpl.name }}</div>
                    <div class="tpl-cat">{{ tpl.category }}<span v-if="tpl.isPremium" class="tpl-badge">PRO</span></div>
                  </div>
                  <div v-if="cardData.template === tpl.slug" class="tpl-check">
                    <Check class="w-3 h-3" style="stroke:#0a100d" />
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ── ÉLÉMENTS ── -->
          <template v-if="leftTab === 'elements'">
            <div class="acc">
              <button class="acc-head" @click="openSections.elOptions = !openSections.elOptions">
                <span :class="openSections.elOptions && 'active-label'">Options</span>
                <ChevronDown class="acc-arrow" :class="openSections.elOptions && 'open'" />
              </button>
              <div v-if="openSections.elOptions" class="acc-body">
                <div class="toggle-row">
                  <span>QR Code au verso</span>
                  <EditorToggle v-model="cardData.data.showQR" />
                </div>
              </div>
            </div>
            <div class="p-3">
              <button @click="resetElementPositions" class="reset-btn">
                <RotateCcw class="w-3.5 h-3.5" />
                Réinitialiser la mise en page
              </button>
            </div>
          </template>

          <!-- ── CALQUES ── -->
          <template v-if="leftTab === 'calques'">
            <div class="py-2">
              <div class="section-label px-3 mb-1">Calques ({{ LAYERS.length }})</div>
              <div v-for="layer in LAYERS" :key="layer.key"
                class="layer-row" :class="selectedElement === layer.key && 'active'"
                @click="onSelectElement(layer.key); showHint = false">
                <div class="layer-icon" :class="selectedElement === layer.key && 'sel'">{{ layer.icon }}</div>
                <span class="layer-label" :class="!layerVisible(layer.key) && 'hidden-layer'">{{ layer.label }}</span>
                <button class="eye-btn" @click.stop="toggleLayerVisible(layer.key)"
                  :style="!layerVisible(layer.key) ? 'opacity:.35' : ''">
                  <Eye v-if="layerVisible(layer.key)" class="w-3 h-3" />
                  <EyeOff v-else class="w-3 h-3" />
                </button>
              </div>
            </div>
          </template>

        </div><!-- /left-scroll -->

        <!-- Barre de complétude -->
        <div class="completeness">
          <div class="comp-header">
            <span class="section-label">Complétude</span>
            <span style="font-size:9.5px; font-weight:700; color:var(--accent)">{{ completeness }}%</span>
          </div>
          <div class="comp-track">
            <div class="comp-fill" :style="`width:${completeness}%`" />
          </div>
        </div>
      </aside>

      <!-- ── ZONE CANVAS ────────────────────────────────────────── -->
      <div class="canvas-wrap">

        <!-- Canvas avec fond configurable -->
        <div class="canvas-bg" :class="`bg-${bgMode}`" @click="selectedElement = null">

          <!-- Indice d'utilisation -->
          <div v-if="showHint" class="hint-pill">
            🖱 Cliquez sur un élément · Glissez pour déplacer · Poignées pour redimensionner
          </div>

          <!-- Carte avec zoom CSS -->
          <div @click.stop
               :style="`transform:scale(${ZOOMS[zoomIdx]});transition:transform .25s ease;transform-origin:center`">
            <BusinessCard
              ref="cardPreviewRef"
              :card="cardData"
              :editMode="true"
              :selectedElement="selectedElement"
              @update:selectedElement="onSelectElement"
              @update:elementPositions="onElementPositionsUpdate"
              @commit:elementPositions="onCommitPositions"
            />
          </div>
        </div>

        <!-- Barre de statut -->
        <div class="status-bar">
          <div class="flex items-center gap-4">
            <span>900 × 506 px · Recto</span>
            <span>{{ visibleLayerCount }}/{{ LAYERS.length }} éléments visibles</span>
            <span v-if="selectedElement" style="color:var(--sel)">✦ {{ ELEMENT_LABELS[selectedElement] }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span>Auto-sauvegardé</span>
            <div class="status-dot" />
          </div>
        </div>
      </div>

      <!-- ── PANNEAU DROIT ───────────────────────────────────────── -->
      <aside class="right-panel">

        <!-- ÉLÉMENT SÉLECTIONNÉ -->
        <template v-if="selectedElement">
          <div class="rpanel-head">
            <div class="flex items-center gap-2">
              <div class="sel-dot" />
              <span style="font-size:11px; font-weight:700; color:var(--sel)">{{ ELEMENT_LABELS[selectedElement] }}</span>
            </div>
            <button @click="selectedElement = null" class="close-x">×</button>
          </div>

          <div class="rpanel-scroll">

            <!-- Position & Taille -->
            <section class="rprop-section">
              <div class="section-label mb-2">Position & Taille</div>
              <div class="grid grid-cols-2 gap-1.5">
                <div v-for="[lbl, key] in [['X','x'],['Y','y'],['L','w'],['H','h']]" :key="key">
                  <div class="num-label">{{ lbl }}</div>
                  <input type="number" class="num-input"
                    :value="Math.round(selPos[key] ?? 0)"
                    @input="updateElemProp(selectedElement, key, Number($event.target.value))" />
                </div>
              </div>
            </section>

            <!-- Texte (pour les éléments textuels) -->
            <section v-if="isTextEl(selectedElement)" class="rprop-section">
              <div class="section-label mb-2">Texte</div>

              <!-- Taille de police -->
              <div class="mb-3">
                <div class="num-label mb-1">Taille</div>
                <div class="flex items-center gap-2">
                  <input type="range" min="6" max="36" :value="selFontSize"
                    @input="updateElemProp(selectedElement, 'fontSize', Number($event.target.value), true)"
                    class="flex-1" style="accent-color:var(--accent)" />
                  <span style="font-size:10px; color:var(--text-sub); min-width:20px; text-align:right">{{ selFontSize }}</span>
                </div>
              </div>

              <!-- Graisse -->
              <div class="mb-3">
                <div class="num-label mb-1">Graisse</div>
                <div class="flex gap-1">
                  <button v-for="[val, lbl] in [[false,'Normal'],[true,'Gras']]" :key="lbl"
                    class="prop-chip" :class="selBold === val && 'active-chip'"
                    @click="updateElemProp(selectedElement, 'bold', val)">{{ lbl }}</button>
                </div>
              </div>

              <!-- Couleur -->
              <div class="mb-3">
                <div class="num-label mb-1">Couleur du texte</div>
                <div class="flex items-center gap-2">
                  <input type="color" :value="selColor"
                    @input="updateElemProp(selectedElement, 'color', $event.target.value, true)"
                    class="color-pick" />
                  <span style="font-size:10px; color:var(--text-sub)">{{ selColor }}</span>
                </div>
              </div>

              <!-- Alignement -->
              <div class="mb-3">
                <div class="num-label mb-1">Alignement</div>
                <div class="flex gap-1">
                  <button v-for="[val, ic] in [['left',AlignLeft],['center',AlignCenter],['right',AlignRight]]" :key="val"
                    class="prop-chip icon-chip" :class="selTextAlign === val && 'active-chip'"
                    @click="updateElemProp(selectedElement, 'textAlign', val)">
                    <component :is="ic" class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <!-- Italic -->
              <div class="flex gap-1">
                <button class="prop-chip flex-1" :class="selItalic && 'active-chip'"
                  @click="toggleItalic" style="font-style:italic">I — Italique</button>
              </div>
            </section>

            <!-- Options -->
            <section class="rprop-section">
              <div class="section-label mb-2">Options</div>
              <div class="toggle-row mb-2">
                <span>Visible</span>
                <EditorToggle :modelValue="selVisible" @update:modelValue="toggleVisible" />
              </div>
              <div class="flex gap-1.5 mb-1.5">
                <button class="act-chip danger flex-1" @click="toggleVisible">
                  <EyeOff class="w-3 h-3" />
                  Masquer
                </button>
                <button class="act-chip flex-1" @click="bringForward">
                  <ChevronUp class="w-3 h-3" />
                  Devant
                </button>
              </div>
              <button class="act-chip w-full mb-3" @click="sendBackward">
                <ChevronDown class="w-3 h-3" />
                Derrière
              </button>

              <!-- Alignement sur carte -->
              <div class="section-label mb-1.5">Aligner sur la carte</div>
              <div class="grid grid-cols-3 gap-1">
                <button v-for="[dir, Icon] in alignActions" :key="dir"
                  class="align-btn" :title="dir" @click="alignElement(dir)">
                  <component :is="Icon" class="w-3.5 h-3.5" />
                </button>
              </div>
            </section>

          </div>
        </template>

        <!-- AUCUN ÉLÉMENT → Propriétés de la carte -->
        <template v-else>
          <div class="rpanel-head">
            <span style="font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:var(--muted)">
              Propriétés
            </span>
          </div>
          <div class="rpanel-scroll">

            <!-- Nom de la carte -->
            <section class="rprop-section">
              <div class="section-label mb-1.5">Nom de la carte</div>
              <input v-model="cardData.name" class="form-input" placeholder="Ma carte professionnelle" />
            </section>

            <!-- Export -->
            <section class="rprop-section">
              <div class="section-label mb-1.5">Exporter</div>
              <button class="exp-row" @click="downloadPDF" :disabled="exportLoading === 'pdf'">
                <div class="exp-tag-sm">PDF</div>
                <span>Document haute qualité</span>
                <Loader2 v-if="exportLoading === 'pdf'" class="w-3 h-3 animate-spin ml-auto" style="color:var(--accent)" />
              </button>
              <button class="exp-row mt-1" @click="downloadPNG" :disabled="exportLoading === 'png'">
                <div class="exp-tag-sm">PNG</div>
                <span>Image pour partager</span>
                <Loader2 v-if="exportLoading === 'png'" class="w-3 h-3 animate-spin ml-auto" style="color:var(--accent)" />
              </button>
              <button class="exp-row mt-1" @click="downloadVCard">
                <div class="exp-tag-sm">VCF</div>
                <span>Contact vCard</span>
              </button>
            </section>

            <!-- Partage -->
            <section class="rprop-section">
              <button @click="openShareModal" class="share-btn">
                <Share2 class="w-4 h-4" />
                Partager le lien
              </button>
            </section>

            <!-- Conseil -->
            <div class="hint-box">
              <p style="font-size:10.5px; font-weight:600; margin-bottom:3px; color:var(--accent)">Édition libre</p>
              <p style="font-size:10px; color:var(--muted); line-height:1.6">
                Cliquez sur un élément de la carte pour le sélectionner.
                Glissez pour déplacer, utilisez les poignées bleues pour redimensionner.
              </p>
            </div>

          </div>
        </template>

      </aside>
    </div><!-- /ed-body -->

    <!-- ═══ MODALE PARTAGE ═════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showShareModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showShareModal = false" />
          <div class="modal-panel">
            <div class="flex items-center justify-between mb-5">
              <div>
                <h3 style="font-weight:700; font-size:17px">Partager la carte</h3>
                <p style="font-size:11px; margin-top:2px; color:var(--muted)">{{ cardData.data.fullName || 'Votre carte' }}</p>
              </div>
              <button @click="showShareModal = false" class="close-x">✕</button>
            </div>
            <div class="mb-4">
              <div class="field-label mb-1.5">Lien de partage</div>
              <div class="flex gap-2">
                <input :value="currentShareLink" readonly class="form-input flex-1 text-xs" />
                <button @click="copyShareLink" class="copy-btn" :class="linkCopied && 'copied'">
                  <Check v-if="linkCopied" class="w-4 h-4" />
                  <Copy v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
            <p style="font-size:10px; font-weight:700; letter-spacing:.8px; text-transform:uppercase; color:var(--muted); margin-bottom:12px">Via</p>
            <div class="grid grid-cols-3 gap-3">
              <button @click="shareViaWhatsApp" class="social-btn">
                <div class="social-ico" style="background:#25d366">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <span>WhatsApp</span>
              </button>
              <button @click="shareViaEmail" class="social-btn">
                <div class="social-ico" style="background:#0ea5e9">
                  <Mail class="w-5 h-5 text-white" />
                </div>
                <span>Email</span>
              </button>
              <button @click="shareNative" class="social-btn">
                <div class="social-ico" style="background:#8b5cf6">
                  <Share2 class="w-5 h-5 text-white" />
                </div>
                <span>Plus</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confetti canvas -->
    <canvas ref="confettiCanvas" class="fixed inset-0 z-[60] pointer-events-none" style="width:100%;height:100%" />

  </div><!-- /ed-root -->
</template>

<!-- ════════════════════════════════════════════════════════════════
     SCRIPT PRINCIPAL
════════════════════════════════════════════════════════════════════ -->
<script setup>
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCardsStore } from '@/stores/cards'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import BusinessCard from '@/components/BusinessCard.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {
  ArrowLeft,
  CreditCard,
  Undo2, Redo2,
  ChevronDown, ChevronUp,
  Download, Save, Check, Copy,
  Share2, Mail, Upload,
  Eye, EyeOff,
  FileText, RotateCcw,
  AlignLeft, AlignCenter, AlignRight,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  Loader2, X,
  Layers, PenLine, LayoutTemplate, SlidersHorizontal, Palette,
} from 'lucide-vue-next'

// ── Composants locaux (render functions — pas de template compiler requis) ──
const LabelField = {
  props: ['label', 'modelValue', 'placeholder'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('div', [
      props.label && h('div', { class: 'field-label' }, props.label),
      h('input', {
        class: 'form-input',
        value: props.modelValue,
        placeholder: props.placeholder,
        onInput: (e) => emit('update:modelValue', e.target.value),
        onFocus: (e) => { e.target.style.borderColor = '#e83800' },
        onBlur:  (e) => { e.target.style.borderColor = 'var(--input-bd)' },
      })
    ])
  }
}

const EditorToggle = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('div', {
      class: 'ed-toggle',
      style: `background:${props.modelValue ? '#e83800' : 'var(--border)'}`,
      onClick: () => emit('update:modelValue', !props.modelValue),
    }, [
      h('div', { class: 'ed-toggle-thumb', style: `left:${props.modelValue ? '14px' : '2px'}` })
    ])
  }
}

// ── Stores ───────────────────────────────────────────────────
const router   = useRouter()
const route    = useRoute()
const store    = useCardsStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// ── Constantes UI ────────────────────────────────────────────
const ZOOMS = [0.4, 0.6, 0.8, 1, 1.2, 1.5]

const FONTS = [
  'Inter', 'Poppins', 'Raleway', 'Playfair Display',
  'Cormorant Garamond', 'Josefin Sans', 'Montserrat',
  'DM Sans', 'Lora', 'Space Grotesk',
]

const LEFT_TABS = [
  { id: 'contenu',   label: 'Contenu',   icon: PenLine },
  { id: 'design',    label: 'Design',    icon: Palette },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'elements',  label: 'Éléments',  icon: SlidersHorizontal },
  { id: 'calques',   label: 'Calques',   icon: Layers },
]

const ELEMENT_LABELS = {
  logo: 'Logo', fullName: 'Nom complet', title: 'Poste',
  company: 'Entreprise', email: 'Email', phone: 'Téléphone',
  website: 'Site web', address: 'Adresse', photo: 'Photo', qr: 'QR Code',
}

const LAYERS = [
  { key: 'fullName', label: 'Nom complet',  icon: 'T' },
  { key: 'title',    label: 'Poste',         icon: 'T' },
  { key: 'company',  label: 'Entreprise',    icon: 'T' },
  { key: 'email',    label: 'Email',         icon: '@' },
  { key: 'phone',    label: 'Téléphone',     icon: '@' },
  { key: 'website',  label: 'Site web',      icon: '@' },
  { key: 'address',  label: 'Adresse',       icon: '@' },
  { key: 'photo',    label: 'Photo',         icon: '◉' },
  { key: 'logo',     label: 'Logo',          icon: '◉' },
  { key: 'qr',       label: 'QR Code',       icon: '▦' },
]

const ELEM_DEFAULTS = {
  fullName: { fontSize: 18, bold: true,  italic: false },
  title:    { fontSize: 11, bold: false, italic: false },
  company:  { fontSize: 11, bold: true,  italic: false },
  email:    { fontSize: 10, bold: false, italic: false },
  phone:    { fontSize: 10, bold: false, italic: false },
  website:  { fontSize: 10, bold: false, italic: false },
  address:  { fontSize: 10, bold: false, italic: false },
}

const alignActions = [
  ['left',   AlignStartVertical],
  ['cH',     AlignCenterVertical],
  ['right',  AlignEndVertical],
  ['top',    AlignLeft],
  ['cV',     AlignCenter],
  ['bottom', AlignRight],
]

// ── État local ────────────────────────────────────────────────
const isEditing     = ref(false)
const justSaved     = ref(false)
const showHint      = ref(true)
const zoomIdx       = ref(3)          // 1.0×
const bgMode        = ref('dark')
const leftTab       = ref('contenu')
const selectedElement = ref(null)

const showDownloadMenu = ref(false)
const showShareModal   = ref(false)
const exportLoading    = ref('')
const linkCopied       = ref(false)

const cardPreviewRef = ref(null)
const confettiCanvas = ref(null)
let confettiFrame = null

const openSections = ref({
  identity: true, company: true, coords: true, media: false,
  typo: true, background: false,
  elOptions: true,
})

// ── Undo / Redo ───────────────────────────────────────────────
const history      = ref([])
const historyIndex = ref(-1)

const pushHistory = (positions) => {
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(JSON.parse(JSON.stringify(positions || null)))
  if (history.value.length > 50) { history.value.shift() }
  else { historyIndex.value++ }
}
const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    cardData.value.data.elementPositions = history.value[historyIndex.value]
      ? JSON.parse(JSON.stringify(history.value[historyIndex.value])) : null
  }
}
const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    cardData.value.data.elementPositions = history.value[historyIndex.value]
      ? JSON.parse(JSON.stringify(history.value[historyIndex.value])) : null
  }
}

// ── Données de la carte ───────────────────────────────────────
const cardData = ref({
  name: 'Ma nouvelle carte',
  template: 'modern',
  data: {
    fullName: '', title: '', company: '',
    email: '', phone: '', website: '', address: '',
    photo: '', logo: '',
    fontFamily: 'Poppins',
    showQR: false,
    backgroundImage: '',
    elementPositions: null,
  },
  backSide: { enabled: false, title: '', content: '' },
  isPublic: false,
})

// ── Computed sélection ────────────────────────────────────────
const selPos = computed(() => {
  if (!selectedElement.value) return {}
  return cardData.value.data.elementPositions?.[selectedElement.value] || {}
})

const selCoords = computed(() => {
  const p = selPos.value
  if (!p.x && !p.y) return ''
  return `x:${Math.round(p.x ?? 0)} y:${Math.round(p.y ?? 0)}`
})

const isTextEl = (key) => !['logo', 'photo', 'qr'].includes(key)

const selFontSize = computed(() => {
  const d = ELEM_DEFAULTS[selectedElement.value] || {}
  return selPos.value?.fontSize ?? d.fontSize ?? 11
})
const selColor   = computed(() => selPos.value?.color  || '#ffffff')
const selBold    = computed(() => { const d = ELEM_DEFAULTS[selectedElement.value] || {}; return selPos.value?.bold   ?? d.bold   ?? false })
const selItalic  = computed(() => { const d = ELEM_DEFAULTS[selectedElement.value] || {}; return selPos.value?.italic ?? d.italic ?? false })
const selVisible = computed(() => selPos.value?.visible !== false)
const selTextAlign = computed(() => selPos.value?.textAlign || 'left')

// ── Calques / visibilité ──────────────────────────────────────
const layerVisible = (key) => {
  const pos = cardData.value.data.elementPositions?.[key]
  return pos ? pos.visible !== false : true
}
const toggleLayerVisible = (key) => {
  updateElemProp(key, 'visible', !layerVisible(key))
}
const visibleLayerCount = computed(() => LAYERS.filter(l => layerVisible(l.key)).length)

// ── Complétude ────────────────────────────────────────────────
const completeness = computed(() => {
  const d = cardData.value.data
  return Math.round(
    [d.fullName, d.title, d.company, d.email, d.phone, d.website, d.address, d.photo].filter(Boolean).length / 8 * 100
  )
})

// ── Formulaire valide ─────────────────────────────────────────
const isFormValid = computed(() =>
  cardData.value.name?.trim() && cardData.value.data.fullName &&
  cardData.value.data.title   && cardData.value.data.email
)

// ── Manipulation éléments ─────────────────────────────────────
let styleTimer = null

const updateElemProp = (key, prop, value, debounce = false) => {
  if (!key) return
  const positions = {
    ...(cardData.value.data.elementPositions || {}),
    [key]: { ...(cardData.value.data.elementPositions?.[key] || {}), [prop]: value },
  }
  cardData.value.data.elementPositions = positions
  if (debounce) {
    clearTimeout(styleTimer)
    styleTimer = setTimeout(() => pushHistory(positions), 400)
  } else {
    pushHistory(positions)
  }
}

const toggleBold    = () => updateElemProp(selectedElement.value, 'bold',    !selBold.value)
const toggleItalic  = () => updateElemProp(selectedElement.value, 'italic',  !selItalic.value)
const toggleVisible = () => updateElemProp(selectedElement.value, 'visible', !selVisible.value)

const nudgeElement = (dx, dy) => {
  const key = selectedElement.value
  if (!key) return
  const pos = cardData.value.data.elementPositions?.[key]
  if (!pos) return
  const updated = { ...pos, x: Math.max(0, Math.min(90, (pos.x ?? 0) + dx)), y: Math.max(0, Math.min(90, (pos.y ?? 0) + dy)) }
  const newPos = { ...cardData.value.data.elementPositions, [key]: updated }
  cardData.value.data.elementPositions = newPos
  pushHistory(newPos)
}

const bringForward = () => {
  const key = selectedElement.value; if (!key) return
  const pos = cardData.value.data.elementPositions?.[key]; if (!pos) return
  updateElemProp(key, 'zIndex', (pos.zIndex ?? 10) + 1)
}
const sendBackward = () => {
  const key = selectedElement.value; if (!key) return
  const pos = cardData.value.data.elementPositions?.[key]; if (!pos) return
  updateElemProp(key, 'zIndex', Math.max(1, (pos.zIndex ?? 10) - 1))
}

const alignElement = (dir) => {
  const key = selectedElement.value; if (!key) return
  const pos = cardData.value.data.elementPositions?.[key]; if (!pos) return
  let update = {}
  if      (dir === 'left')   update = { x: 0 }
  else if (dir === 'cH')     update = { x: Math.round((100 - pos.w) / 2) }
  else if (dir === 'right')  update = { x: Math.max(0, Math.round(100 - pos.w)) }
  else if (dir === 'top')    update = { y: 0 }
  else if (dir === 'cV')     update = { y: Math.round((100 - pos.h) / 2) }
  else if (dir === 'bottom') update = { y: Math.max(0, Math.round(100 - pos.h)) }
  const newPos = { ...cardData.value.data.elementPositions, [key]: { ...pos, ...update } }
  cardData.value.data.elementPositions = newPos
  pushHistory(newPos)
}

const resetElementPositions = () => {
  cardData.value.data.elementPositions = null
  selectedElement.value = null
  pushHistory(null)
}

// ── Événements BusinessCard ───────────────────────────────────
const onSelectElement = (key) => {
  selectedElement.value = key
  if (key) showHint.value = false
}
const onElementPositionsUpdate = (positions) => {
  cardData.value.data.elementPositions = positions
}
const onCommitPositions = () => {
  pushHistory(cardData.value.data.elementPositions)
}

// ── Uploads ───────────────────────────────────────────────────
const handlePhotoUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) { notificationStore.error('Fichier trop volumineux (max 2MB)'); return }
  const reader = new FileReader()
  reader.onload = (e) => { cardData.value.data.photo = e.target?.result || '' }
  reader.readAsDataURL(file)
}
const removePhoto = () => { cardData.value.data.photo = '' }

const handleLogoUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (file.size > 1 * 1024 * 1024) { notificationStore.error('Logo trop volumineux (max 1MB)'); return }
  const reader = new FileReader()
  reader.onload = (e) => { cardData.value.data.logo = e.target?.result || '' }
  reader.readAsDataURL(file)
}
const removeLogo = () => { cardData.value.data.logo = '' }

const handleBgImageUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { notificationStore.error('Image trop volumineuse (max 5MB)'); return }
  const reader = new FileReader()
  reader.onload = (e) => { cardData.value.data.backgroundImage = e.target?.result || '' }
  reader.readAsDataURL(file)
}
const removeBgImage = () => { cardData.value.data.backgroundImage = '' }

// ── Sauvegarde ────────────────────────────────────────────────
const saveCard = () => {
  if (!isFormValid.value) return
  if (isEditing.value) {
    store.updateCard(cardData.value.id, cardData.value)
    notificationStore.success('Carte mise à jour !')
  } else {
    store.addCard(cardData.value)
    notificationStore.success('Carte enregistrée !')
  }
  justSaved.value = true
  setTimeout(() => { justSaved.value = false }, 2500)
  router.push('/dashboard')
}

// ── Export ────────────────────────────────────────────────────
const captureCard = async () => {
  const el = cardPreviewRef.value
  if (!el) throw new Error('Preview not found')
  return html2canvas(el, { scale: 3, useCORS: true, allowTaint: true, backgroundColor: null, logging: false })
}

const downloadPDF = async () => {
  exportLoading.value = 'pdf'
  try {
    const canvas = await captureCard()
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] })
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save(`${cardData.value.data.fullName || 'carte'}.pdf`)
    notificationStore.success('PDF téléchargé !')
  } catch { notificationStore.error('Erreur PDF') }
  finally { exportLoading.value = '' }
}

const downloadPNG = async () => {
  exportLoading.value = 'png'
  try {
    const canvas = await captureCard()
    const link = document.createElement('a')
    link.download = `${cardData.value.data.fullName || 'carte'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    notificationStore.success('PNG téléchargé !')
  } catch { notificationStore.error('Erreur PNG') }
  finally { exportLoading.value = '' }
}

const downloadVCard = () => {
  const d = cardData.value.data
  const vCard = `BEGIN:VCARD\nVERSION:3.0\nFN:${d.fullName}\nTITLE:${d.title}\nORG:${d.company}\nEMAIL:${d.email}\nTEL:${d.phone}\nURL:${d.website}\nADR:;;${d.address};;;;\nEND:VCARD`
  const blob = new Blob([vCard], { type: 'text/vcard' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${d.fullName || 'carte'}.vcf`
  link.click()
  URL.revokeObjectURL(url)
}

// ── Partage ───────────────────────────────────────────────────
const currentShareLink = computed(() => {
  if (isEditing.value && cardData.value.id) return store.generateShareLink(cardData.value.id) || ''
  return `${window.location.origin}/share/preview`
})

const openShareModal = () => {
  if (!isEditing.value) { notificationStore.warning("Enregistrez d'abord la carte"); return }
  store.incrementCardShares?.(cardData.value.id)
  launchConfetti()
  showShareModal.value = true
}

const copyShareLink = async () => {
  await navigator.clipboard.writeText(currentShareLink.value)
  linkCopied.value = true
  notificationStore.success('Lien copié !')
  setTimeout(() => { linkCopied.value = false }, 2000)
}

const shareViaWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent('Découvrez ma carte : ' + currentShareLink.value)}`, '_blank')
const shareViaEmail = () => {
  const name = cardData.value.data.fullName || 'Ma carte'
  window.location.href = `mailto:?subject=${encodeURIComponent('Carte — ' + name)}&body=${encodeURIComponent('Bonjour,\n\n' + currentShareLink.value)}`
}
const shareNative = async () => {
  if (navigator.share) await navigator.share({ title: cardData.value.data.fullName || 'Carte', url: currentShareLink.value }).catch(() => {})
  else copyShareLink()
}

// ── Confetti ──────────────────────────────────────────────────
const launchConfetti = () => {
  const canvas = confettiCanvas.value; if (!canvas) return
  canvas.width = window.innerWidth; canvas.height = window.innerHeight
  const ctx = canvas.getContext('2d')
  const cx = canvas.width / 2, cy = canvas.height / 2
  const rings = [0, 130, 270].map(delay => ({ delay, maxR: 80 + Math.random() * 60 }))
  if (confettiFrame) cancelAnimationFrame(confettiFrame)
  const t0 = performance.now()
  const tick = (now) => {
    const elapsed = now - t0, t = Math.min(elapsed / 850, 1)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const ring of rings) {
      const rt = Math.max(0, Math.min((elapsed - ring.delay) / (850 - ring.delay), 1))
      if (rt <= 0) continue
      const r = ring.maxR * (1 - Math.pow(1 - rt, 2))
      const a = rt < 0.4 ? rt / 0.4 : 1 - (rt - 0.4) / 0.6
      ctx.save(); ctx.globalAlpha = a * 0.35; ctx.strokeStyle = '#e83800'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); ctx.restore()
    }
    if (t < 1) confettiFrame = requestAnimationFrame(tick)
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); confettiFrame = null }
  }
  confettiFrame = requestAnimationFrame(tick)
}

// ── Clavier ───────────────────────────────────────────────────
const handleKeydown = (e) => {
  if (e.ctrlKey && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
  if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo() }
  if (e.key === 'Escape') selectedElement.value = null
  if (selectedElement.value && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) {
    e.preventDefault()
    const step = e.shiftKey ? 5 : 1
    const dMap = { ArrowLeft:[-step,0], ArrowRight:[step,0], ArrowUp:[0,-step], ArrowDown:[0,step] }
    nudgeElement(...dMap[e.key])
  }
}

// ── Lifecycle ─────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  if (route.params.id) {
    const cardId = Number(route.params.id)
    const existing = store.getCardById(cardId)
    if (existing) {
      const loaded = JSON.parse(JSON.stringify(existing))
      loaded.data = loaded.data || {}
      loaded.data.backgroundImage = loaded.data.backgroundImage || ''
      loaded.data.elementPositions = loaded.data.elementPositions || null
      cardData.value = loaded
      isEditing.value = true
    }
  }
  if (store.currentTemplate) {
    cardData.value.template = store.currentTemplate
    store.currentTemplate = null
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (confettiFrame) cancelAnimationFrame(confettiFrame)
})
</script>

<!-- ════════════════════════════════════════════════════════════════
     STYLES
════════════════════════════════════════════════════════════════════ -->
<style scoped>
/* ── Variables ────────────────────────────────────────────── */
.ed-root {
  --bg:        #0a100d;
  --panel:     #111b14;
  --border:    #1e2e22;
  --input-bg:  #0c1710;
  --input-bd:  #1e2e22;
  --accent:    #e83800;
  --accent-lt: #ff6530;
  --sel:       #22bcf5;
  --text:      #d4e4d4;
  --text-sub:  #6b8e6b;
  --muted:     #374837;

  display: flex; flex-direction: column; height: 100vh; overflow: hidden;
  background: var(--bg); color: var(--text);
  font-family: 'Inter', system-ui, sans-serif;
}

/* ── Scrollbar fine ───────────────────────────────────────── */
::-webkit-scrollbar         { width: 3px; }
::-webkit-scrollbar-track   { background: transparent; }
::-webkit-scrollbar-thumb   { background: var(--border); border-radius: 2px; }

/* ══ TOP BAR ══════════════════════════════════════════════════ */
.topbar {
  height: 48px; display: flex; align-items: center; flex-shrink: 0;
  background: var(--panel); border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 100;
}

/* Brand */
.topbar-brand {
  width: 220px; height: 100%; border-right: 1px solid var(--border);
  display: flex; align-items: center; gap: 8px; padding: 0 12px;
  flex-shrink: 0;
}
.back-btn {
  flex-shrink: 0; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
  border-radius: 7px; border: 1px solid var(--border); color: var(--text-sub);
  background: none; cursor: pointer; transition: all .15s; text-decoration: none;
}
.back-btn:hover { border-color: var(--accent); color: var(--accent); }

.brand-logo {
  width: 24px; height: 24px; border-radius: 6px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent), var(--accent-lt));
  display: flex; align-items: center; justify-content: center;
}
.brand-name { font-size: 13px; font-weight: 700; color: var(--text); }
.brand-badge {
  font-size: 8px; font-weight: 800; padding: 2px 5px; border-radius: 20px; flex-shrink: 0;
  color: var(--accent); background: rgba(232,56,0,.12); border: 1px solid rgba(232,56,0,.25);
  letter-spacing: .5px;
}

/* Center */
.topbar-center {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 3px; padding: 0 12px;
}
.vdiv { width: 1px; height: 18px; background: var(--border); margin: 0 4px; }

.tool-btn {
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  border-radius: 6px; border: none; background: none; cursor: pointer;
  color: var(--text-sub); transition: all .15s;
}
.tool-btn:hover { background: rgba(255,255,255,.05); color: var(--text); }
.tool-btn:disabled { opacity: .25; cursor: default; }

.zoom-ctrl {
  display: flex; align-items: center; gap: 1px;
  background: var(--input-bg); border: 1px solid var(--border); border-radius: 7px; padding: 2px 3px;
}
.zbtn {
  width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
  background: none; border: none; cursor: pointer; color: var(--text-sub); font-size: 15px; transition: all .15s;
  border-radius: 4px;
}
.zbtn:hover { background: rgba(255,255,255,.06); color: var(--text); }
.zoom-val { font-size: 11px; color: var(--text-sub); min-width: 36px; text-align: center; font-weight: 500; }

.bg-btn {
  height: 26px; padding: 0 9px; border-radius: 6px; font-size: 11px;
  border: 1px solid transparent; background: transparent; cursor: pointer; color: var(--muted); transition: all .15s;
}
.bg-btn.active {
  background: rgba(232,56,0,.08); border-color: rgba(232,56,0,.25); color: var(--accent);
}
.bg-btn:hover:not(.active) { color: var(--text-sub); border-color: var(--border); }

/* Selection indicator */
.sel-indicator {
  display: flex; align-items: center; gap: 8px; background: rgba(34,188,245,.08);
  border: 1px solid rgba(34,188,245,.2); border-radius: 7px; padding: 4px 10px;
}
.sel-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--sel); flex-shrink: 0; }
.sel-indicator span { font-size: 11px; font-weight: 600; color: #93d4f5; }
.sel-coords { font-size: 10px; color: var(--muted) !important; font-weight: 400 !important; }
.sel-close { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 14px; line-height: 1; display: flex; align-items: center; }
.no-sel-hint { font-size: 11px; color: var(--muted); font-style: italic; }

.sel-fade-enter-active, .sel-fade-leave-active { transition: opacity .15s, transform .15s; }
.sel-fade-enter-from, .sel-fade-leave-to { opacity: 0; transform: translateY(-3px); }

/* Actions */
.topbar-actions {
  display: flex; align-items: center; gap: 6px; padding: 0 12px; height: 100%;
  border-left: 1px solid var(--border);
}
.act-outline {
  height: 32px; padding: 0 12px; display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.04); border: 1px solid var(--border); border-radius: 8px;
  color: var(--text-sub); font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s;
}
.act-outline:hover { border-color: var(--accent); color: var(--text); }

.export-menu {
  position: absolute; top: calc(100% + 6px); right: 0; min-width: 200px;
  background: var(--panel); border: 1px solid var(--border); border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0,0,0,.6); overflow: hidden; z-index: 20;
}
.export-item {
  width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  background: none; border: none; cursor: pointer; transition: background .15s; text-align: left;
}
.export-item:hover { background: rgba(255,255,255,.04); }
.export-item + .export-item { border-top: 1px solid var(--border); }
.exp-tag {
  width: 32px; height: 32px; border-radius: 7px; flex-shrink: 0;
  background: rgba(232,56,0,.1); border: 1px solid rgba(232,56,0,.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 800; color: var(--accent);
}
.exp-title { font-size: 12px; font-weight: 600; color: var(--text); }
.exp-sub   { font-size: 10px; color: var(--muted); }

.save-btn {
  height: 32px; padding: 0 14px; display: flex; align-items: center; gap: 6px;
  background: linear-gradient(135deg, var(--accent), var(--accent-lt));
  border: none; border-radius: 8px; color: #fff; font-size: 12px; font-weight: 700;
  cursor: pointer; transition: all .25s;
}
.save-btn:disabled { opacity: .4; cursor: default; }
.save-btn.saved { background: #10b981; }
.save-btn:not(:disabled):hover { filter: brightness(1.1); }

/* ══ CORPS ════════════════════════════════════════════════════ */
.ed-body { flex: 1; display: flex; overflow: hidden; min-height: 0; }

/* ══ PANNEAU GAUCHE ══════════════════════════════════════════ */
.left-panel {
  width: 220px; display: flex; flex-direction: column; overflow: hidden; flex-shrink: 0;
  background: var(--panel); border-right: 1px solid var(--border);
}

/* Onglets */
.left-tabs {
  display: grid; grid-template-columns: repeat(5,1fr); border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.ltab {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 9px 2px 7px; gap: 4px; background: none; border: none; cursor: pointer;
  border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all .15s;
  color: var(--muted);
}
.ltab:hover { color: var(--text-sub); }
.ltab.active { border-bottom-color: var(--accent); color: var(--accent); }
.ltab span { font-size: 7.5px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase; }

/* Scroll gauche */
.left-scroll { flex: 1; overflow-y: auto; }

/* Accordéons */
.acc { border-bottom: 1px solid var(--border); }
.acc-head {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; background: none; border: none; cursor: pointer;
}
.acc-head span { font-size: 11px; font-weight: 600; color: var(--text-sub); }
.acc-head .active-label { color: var(--accent); }
.acc-arrow { width: 10px; height: 10px; color: var(--muted); transition: transform .2s; }
.acc-arrow.open { transform: rotate(0deg) !important; }
.acc-arrow:not(.open) { transform: rotate(-90deg); }
.acc-body { padding: 2px 14px 12px; display: flex; flex-direction: column; gap: 9px; }

/* Étiquettes & champs */
.field-label { font-size: 9.5px; font-weight: 700; color: var(--muted); letter-spacing: .6px; text-transform: uppercase; margin-bottom: 5px; }
.form-input {
  width: 100%; background: var(--input-bg); border: 1px solid var(--input-bd); border-radius: 8px;
  padding: 7px 9px; font-size: 12px; color: var(--text); outline: none; transition: border-color .15s;
}
.form-input:focus { border-color: var(--accent); }

/* Upload */
.upload-zone {
  display: flex; align-items: center; justify-content: center; width: 100%; height: 54px;
  border: 1px dashed var(--border); border-radius: 8px; cursor: pointer; overflow: hidden;
  transition: border-color .15s; background: var(--input-bg);
}
.upload-zone:hover { border-color: var(--accent); }
.upload-thumb { width: 100%; height: 100%; object-fit: cover; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--muted); font-size: 11px; }
.remove-btn {
  width: 100%; margin-top: 5px; padding: 5px; border-radius: 6px; font-size: 10px;
  background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.2); color: #f87171;
  cursor: pointer; transition: all .15s;
}
.remove-btn:hover { background: rgba(239,68,68,.15); }

/* Fonts */
.font-list { display: flex; flex-direction: column; gap: 5px; }
.font-row {
  display: flex; align-items: center; justify-content: space-between; padding: 7px 9px;
  border-radius: 8px; background: rgba(255,255,255,.02); border: 1px solid var(--border);
  cursor: pointer; transition: all .15s;
}
.font-row:hover { border-color: rgba(232,56,0,.3); }
.font-row.active { background: rgba(232,56,0,.06); border-color: rgba(232,56,0,.3); }
.font-name  { font-size: 13px; color: var(--text); }
.font-preview { font-size: 9px; color: var(--muted); margin-top: 1px; font-family: inherit !important; }

/* Toggle row */
.toggle-row { display: flex; align-items: center; justify-content: space-between; }
.toggle-row span { font-size: 12px; color: var(--text-sub); }

/* Reset btn */
.reset-btn {
  width: 100%; padding: 9px; border-radius: 8px; font-size: 11px;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  background: rgba(255,255,255,.02); border: 1px solid var(--border);
  color: var(--text-sub); cursor: pointer; transition: all .15s;
}
.reset-btn:hover { border-color: var(--accent); color: var(--accent); }

/* Templates */
.tpl-card {
  display: flex; align-items: center; gap: 8px;
  border: 1.5px solid rgba(255,255,255,.05); border-radius: 10px; overflow: hidden;
  cursor: pointer; transition: all .15s; background: rgba(255,255,255,.02); padding: 0;
}
.tpl-card:hover { border-color: rgba(232,56,0,.3); }
.tpl-card.active { border-color: rgba(232,56,0,.6); background: rgba(232,56,0,.04); }
.tpl-preview-bg {
  width: 50px; height: 40px; flex-shrink: 0; position: relative; overflow: hidden;
}
.tpl-line-1 { position: absolute; left: 4px; top: 10px; width: 28px; height: 3px; border-radius: 1px; }
.tpl-line-2 { position: absolute; left: 4px; top: 17px; width: 16px; height: 2px; border-radius: 1px; }
.tpl-meta { flex: 1; padding: 6px 4px; min-width: 0; }
.tpl-name { font-size: 11px; font-weight: 700; color: var(--text-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tpl-cat  { font-size: 9px; color: var(--muted); margin-top: 1px; display: flex; align-items: center; gap: 4px; }
.tpl-badge {
  font-size: 7.5px; font-weight: 800; padding: 1px 5px; border-radius: 10px;
  background: rgba(232,56,0,.12); color: var(--accent); border: 1px solid rgba(232,56,0,.25);
}
.tpl-check {
  width: 18px; height: 18px; border-radius: 50%; background: var(--accent); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; margin-right: 8px;
}

/* Calques */
.layer-row {
  display: flex; align-items: center; gap: 8px; padding: 7px 14px; cursor: pointer;
  border-left: 2px solid transparent; transition: all .15s;
}
.layer-row:hover  { background: rgba(255,255,255,.03); }
.layer-row.active { background: rgba(34,188,245,.08); border-left-color: var(--sel); }
.layer-icon {
  width: 20px; height: 20px; border-radius: 5px; flex-shrink: 0;
  background: rgba(255,255,255,.04); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 700; color: var(--muted);
}
.layer-icon.sel { background: rgba(34,188,245,.12); border-color: rgba(34,188,245,.3); color: #93d4f5; }
.layer-label { flex: 1; font-size: 11.5px; color: var(--text-sub); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.layer-label.hidden-layer { color: var(--muted); text-decoration: line-through; }
.eye-btn { background: none; border: none; cursor: pointer; color: var(--muted); padding: 2px; display: flex; align-items: center; }
.eye-btn:hover { color: var(--text-sub); }

/* Sections utilitaires */
.section-label { font-size: 9.5px; font-weight: 700; color: var(--muted); letter-spacing: .8px; text-transform: uppercase; }
.p-3 { padding: 12px 14px; }

/* Complétude */
.completeness { padding: 10px 14px; border-top: 1px solid var(--border); background: var(--bg); flex-shrink: 0; }
.comp-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
.comp-track { height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; }
.comp-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-lt)); border-radius: 2px; transition: width .4s ease; }

/* ══ ZONE CANVAS ══════════════════════════════════════════════ */
.canvas-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.canvas-bg {
  flex: 1; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;
}
.canvas-bg.bg-dark {
  background: var(--bg);
  background-image: repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.018) 40px),
                    repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.018) 40px);
}
.canvas-bg.bg-light {
  background: #dde8dd;
  background-image: repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(0,0,0,.04) 40px),
                    repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(0,0,0,.04) 40px);
}
.canvas-bg.bg-grid {
  background: var(--bg);
  background-image: repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(255,255,255,.04) 20px),
                    repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(255,255,255,.04) 20px);
}

.hint-pill {
  position: absolute; bottom: 42px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,.7); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,.1); border-radius: 20px;
  padding: 6px 14px; font-size: 11px; color: #9ca3af; white-space: nowrap; pointer-events: none; z-index: 5;
}

/* Status bar */
.status-bar {
  height: 28px; background: var(--bg); border-top: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; padding: 0 14px;
  font-size: 10px; color: var(--muted); flex-shrink: 0;
}
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; }

/* ══ PANNEAU DROIT ════════════════════════════════════════════ */
.right-panel {
  width: 210px; display: flex; flex-direction: column; overflow: hidden; flex-shrink: 0;
  background: var(--panel); border-left: 1px solid var(--border);
}

.rpanel-head {
  padding: 11px 14px 9px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.rpanel-scroll { flex: 1; overflow-y: auto; }
.rprop-section { padding: 12px 14px; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 0; }

.close-x { background: none; border: none; cursor: pointer; color: var(--muted); font-size: 17px; line-height: 1; padding: 2px; display: flex; align-items: center; }
.close-x:hover { color: var(--text); }

/* Champs numériques position */
.num-label { font-size: 9px; color: var(--muted); font-weight: 600; margin-bottom: 3px; }
.num-input {
  width: 100%; background: var(--input-bg); border: 1px solid var(--input-bd); border-radius: 6px;
  padding: 5px 7px; font-size: 11px; color: var(--text); outline: none; font-family: monospace; transition: border-color .15s;
}
.num-input:focus { border-color: var(--sel); }

/* Chips propriétés texte */
.prop-chip {
  flex: 1; padding: 5px 4px; font-size: 9.5px; font-weight: 600;
  background: var(--input-bg); border: 1px solid var(--border); border-radius: 6px;
  color: var(--muted); cursor: pointer; transition: all .15s; white-space: nowrap;
}
.prop-chip:hover  { border-color: rgba(34,188,245,.3); color: var(--text-sub); }
.active-chip      { background: rgba(34,188,245,.1) !important; border-color: rgba(34,188,245,.3) !important; color: #93d4f5 !important; }
.icon-chip        { display: flex; align-items: center; justify-content: center; }

/* Color picker */
.color-pick { width: 32px; height: 32px; border: none; padding: 0; background: none; cursor: pointer; border-radius: 6px; }

/* Action chips */
.act-chip {
  display: flex; align-items: center; justify-content: center; gap: 5px;
  padding: 7px 6px; font-size: 10px; font-weight: 600;
  background: rgba(255,255,255,.02); border: 1px solid var(--border); border-radius: 7px;
  color: var(--text-sub); cursor: pointer; transition: all .15s;
}
.act-chip:hover { border-color: rgba(255,255,255,.15); color: var(--text); }
.act-chip.danger:hover { background: rgba(239,68,68,.1); border-color: rgba(239,68,68,.3); color: #f87171; }

/* Boutons alignement */
.align-btn {
  display: flex; align-items: center; justify-content: center; padding: 7px;
  background: rgba(255,255,255,.02); border: 1px solid var(--border); border-radius: 6px;
  color: var(--muted); cursor: pointer; transition: all .15s;
}
.align-btn:hover { border-color: rgba(34,188,245,.3); color: #93d4f5; background: rgba(34,188,245,.06); }

/* Export rows (panneau droit) */
.exp-row {
  width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px 10px;
  background: rgba(255,255,255,.02); border: 1px solid var(--border); border-radius: 7px;
  color: var(--text-sub); font-size: 11px; cursor: pointer; transition: all .15s; text-align: left;
}
.exp-row:hover { border-color: rgba(232,56,0,.3); color: var(--text); }
.exp-row:disabled { opacity: .5; cursor: default; }
.exp-tag-sm {
  width: 26px; height: 26px; border-radius: 5px; flex-shrink: 0;
  background: rgba(232,56,0,.08); border: 1px solid rgba(232,56,0,.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 800; color: var(--accent);
}

/* Share */
.share-btn {
  width: 100%; padding: 10px; border-radius: 9px; font-size: 11.5px; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  background: rgba(232,56,0,.07); border: 1px solid rgba(232,56,0,.2); color: var(--accent);
  cursor: pointer; transition: all .15s;
}
.share-btn:hover { background: rgba(232,56,0,.13); }

/* Hint box */
.hint-box {
  margin: 12px 14px; padding: 10px; border-radius: 9px;
  background: rgba(34,188,245,.06); border: 1px solid rgba(34,188,245,.15);
}

/* ══ MODALE PARTAGE ══════════════════════════════════════════ */
.modal-panel {
  position: relative; width: 100%; max-width: 340px; border-radius: 20px;
  background: var(--panel); border: 1px solid var(--border);
  box-shadow: 0 24px 80px rgba(0,0,0,.8); padding: 24px; color: var(--text);
}

.copy-btn {
  width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  background: var(--accent); border: none; color: #fff; cursor: pointer; transition: all .2s;
}
.copy-btn.copied { background: #10b981; }

.social-btn {
  display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 10px 6px;
  border-radius: 12px; background: rgba(255,255,255,.03); border: 1px solid var(--border);
  cursor: pointer; transition: all .15s; color: var(--text-sub); font-size: 11px;
}
.social-btn:hover { border-color: rgba(255,255,255,.12); }
.social-ico { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

/* ══ TRANSITIONS ════════════════════════════════════════════ */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-panel { transition: transform .2s ease, opacity .2s ease; }
.modal-fade-enter-from .modal-panel { transform: scale(.95) translateY(8px); opacity: 0; }

@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }

/* Toggle */
.ed-toggle { width:30px; height:16px; border-radius:8px; cursor:pointer; position:relative; transition:background .2s; flex-shrink:0; }
.ed-toggle-thumb { position:absolute; top:2px; width:12px; height:12px; background:#fff; border-radius:50%; transition:left .2s; box-shadow:0 1px 3px rgba(0,0,0,.4); }

/* Misc */
.w-full { width: 100%; }
.mb-3 { margin-bottom: 12px; }
.mb-2 { margin-bottom: 8px; }
.mb-1 { margin-bottom: 4px; }
.mb-1\.5 { margin-bottom: 6px; }
.mt-1 { margin-top: 4px; }
.mt-1\.5 { margin-top: 6px; }
.mt-3 { margin-top: 12px; }
.flex-1 { flex: 1; }
.flex { display: flex; }
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2,1fr); }
.grid-cols-3 { grid-template-columns: repeat(3,1fr); }
.gap-1 { gap: 4px; }
.gap-1\.5 { gap: 6px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.hidden { display: none !important; }
.relative { position: relative; }
.shrink-0 { flex-shrink: 0; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text-xs { font-size: 12px; }
</style>
