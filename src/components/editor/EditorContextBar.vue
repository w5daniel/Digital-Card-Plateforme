<template>
  <!-- Only render when something is selected -->
  <div
    v-if="editorStore.selectedIds.length > 0"
    class="flex items-center gap-1 px-3 h-11 shrink-0 border-b overflow-x-auto"
    :class="
      themeStore.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
    "
  >
    <!-- ── LOCK / UNLOCK BUTTON ──────────────────────────────────────── -->
    <template v-if="isSelectionLocked !== null">
      <button
        @click="editorStore.toggleLock(editorStore.selectedIds)"
        class="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors shrink-0"
        :class="isSelectionLocked
          ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
          : (themeStore.darkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900')"
        :title="isSelectionLocked ? 'Déverrouiller (Alt+L)' : 'Verrouiller (Alt+L)'"
      >
        <Lock v-if="isSelectionLocked" class="w-3.5 h-3.5 shrink-0" />
        <LockOpen v-else class="w-3.5 h-3.5 shrink-0" />
        <span>{{ isSelectionLocked ? 'Déverrouillé' : 'Verrouiller' }}</span>
      </button>
      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />
    </template>

    <!-- ── UNLOCK ALL BUTTON ─────────────────────────────────────────── -->
    <template v-if="hasAnyLocked">
      <button
        @click="editorStore.unlockAll()"
        class="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors shrink-0 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
        title="Tout déverrouiller"
      >
        <LockOpen class="w-3.5 h-3.5 shrink-0" />
        <span>Tout déverrouiller</span>
      </button>
      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />
    </template>

    <!-- ── TEXT CONTROLS ──────────────────────────────────────────────── -->
    <template v-if="!sel?.locked && selType === 'text'">
      <!-- Text color (solid or gradient) -->
      <div class="flex items-center gap-1">
        <Type class="w-4 h-4 shrink-0" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />

        <!-- Solid mode: direct color picker -->
        <label
          v-if="shapeFillMode !== 'gradient'"
          class="relative w-6 h-6 rounded border overflow-hidden cursor-pointer"
          :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-300'"
          title="Couleur du texte"
        >
          <div class="absolute inset-0" :style="{ background: sel.fill || '#000' }" />
          <input
            type="color"
            :value="sel.fill || '#000000'"
            @input="update('fill', $event.target.value)"
            @change="commit('fill', $event.target.value)"
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </label>

        <!-- Gradient mode: preview swatch that opens fill popover -->
        <button
          v-else
          ref="fillTriggerRef"
          @click="openFillPopover($event)"
          class="w-6 h-6 rounded border overflow-hidden shrink-0"
          :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-300'"
          title="Dégradé texte"
          :style="{ background: `linear-gradient(${shapeGradAngle}deg, ${shapeGradFrom}, ${shapeGradTo})` }"
        />

        <!-- Gradient toggle button -->
        <button
          @click="toggleTextGradient"
          class="w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0"
          :class="shapeFillMode === 'gradient'
            ? (themeStore.darkMode ? 'bg-violet-900/50 text-violet-400' : 'bg-violet-50 text-violet-600')
            : btnCls"
          title="Basculer en dégradé"
        >
          <span class="text-[9px] font-bold leading-none"
            :style="shapeFillMode === 'gradient'
              ? { background: `linear-gradient(90deg,${shapeGradFrom},${shapeGradTo})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }
              : {}"
          >GR</span>
        </button>
      </div>

      <!-- Gradient controls (inline when active) -->
      <template v-if="shapeFillMode === 'gradient' && selType === 'text'">
        <div class="flex items-center gap-1">
          <label class="relative w-5 h-5 rounded border overflow-hidden cursor-pointer shrink-0" :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-300'" title="Couleur début">
            <div class="absolute inset-0" :style="{ background: shapeGradFrom }" />
            <input type="color" :value="shapeGradFrom" @input="shapeGradFrom = $event.target.value; updateGradientFill()" @change="commitGradientFill()" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
          </label>
          <label class="relative w-5 h-5 rounded border overflow-hidden cursor-pointer shrink-0" :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-300'" title="Couleur fin">
            <div class="absolute inset-0" :style="{ background: shapeGradTo }" />
            <input type="color" :value="shapeGradTo" @input="shapeGradTo = $event.target.value; updateGradientFill()" @change="commitGradientFill()" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
          </label>
          <!-- Angle presets -->
          <div class="flex gap-0.5">
            <button v-for="dir in [{a:0,icon:'↑'},{a:90,icon:'→'},{a:135,icon:'↘'},{a:180,icon:'↓'}]" :key="dir.a"
              @click="shapeGradAngle = dir.a; commitGradientFill()"
              class="w-5 h-5 rounded text-xs flex items-center justify-center transition-colors"
              :class="shapeGradAngle === dir.a ? 'bg-violet-500 text-white' : btnCls"
            >{{ dir.icon }}</button>
          </div>
        </div>
      </template>

      <div class="w-px h-5 shrink-0" :class="divCls" />

      <!-- Font family (searchable dropdown) -->
      <div class="relative shrink-0" ref="fontDropdownRef">
        <button
          @click="toggleFontDropdown"
          class="flex items-center gap-1 text-sm rounded px-2 py-1 outline-none border transition-colors w-40 text-left"
          :class="inputCls"
          :style="{ fontFamily: sel.fontFamily }"
        >
          <span class="truncate flex-1">{{ sel.fontFamily || 'Police' }}</span>
          <ChevronDown class="w-3 h-3 shrink-0 opacity-60" />
        </button>

        <!-- Dropdown teleported to body to avoid overflow clipping -->
        <Teleport to="body">
          <div
            v-if="fontDropdownOpen"
            data-font-dropdown
            class="fixed w-64 rounded-lg border shadow-2xl z-[9999] flex flex-col"
            :class="
              themeStore.darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            "
            :style="dropdownStyle"
          >
            <!-- Search input -->
            <div
              class="p-2 border-b shrink-0"
              :class="themeStore.darkMode ? 'border-gray-700' : 'border-gray-200'"
            >
              <input
                ref="fontSearchRef"
                v-model="fontQuery"
                type="text"
                :placeholder="authStore.isPremium || authStore.isAdmin ? 'Rechercher parmi 300+ polices...' : 'Rechercher parmi 50 polices...'"
                class="w-full text-sm rounded px-2 py-1.5 outline-none border"
                :class="inputCls"
                @keydown.escape="fontDropdownOpen = false"
              />
            </div>

            <!-- Import button (premium only) + upgrade banner (free) -->
            <div
              class="px-3 py-1.5 flex items-center justify-between border-b shrink-0"
              :class="themeStore.darkMode ? 'border-gray-700' : 'border-gray-200'"
            >
              <span
                v-if="!authStore.isPremium && !authStore.isAdmin"
                class="text-[10px]"
                :class="themeStore.darkMode ? 'text-amber-400' : 'text-amber-600'"
              >
                Limité à 50 polices — passez au Premium pour 300+
              </span>
              <span v-else class="text-[10px] opacity-40" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">
                300+ polices disponibles
              </span>
              <button
                v-if="authStore.isPremium || authStore.isAdmin"
                @click.stop="triggerFontUploadCtx"
                class="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border transition-colors"
                :class="themeStore.darkMode ? 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400' : 'border-gray-300 text-gray-500 hover:border-violet-400 hover:text-violet-600'"
                title="Importer une police personnalisée (.ttf, .otf, .woff, .woff2)"
              >
                <Upload class="w-2.5 h-2.5" />
                Importer
              </button>
            </div>
            <input
              ref="fontFileInputCtxRef"
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              class="hidden"
              @change="onFontFileSelectedCtx"
            />

            <!-- Font list — 2 sections when no search, flat list when searching -->
            <div class="overflow-y-auto overscroll-contain" style="max-height: 320px">
              <!-- No search: 4 sections -->
              <template v-if="!fontQuery">
                <!-- Section: Polices importées (premium only) -->
                <template v-if="(authStore.isPremium || authStore.isAdmin) && importedFonts.length">
                  <div
                    class="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider opacity-40"
                    :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
                  >
                    Polices importées
                  </div>
                  <div v-for="f in importedFonts" :key="'imp-' + f" class="flex items-center group">
                    <button
                      @mouseenter="previewFont(f)"
                      @click.stop="selectFont(f)"
                      class="flex-1 text-left px-3 py-1.5 text-sm transition-colors"
                      :class="
                        sel.fontFamily === f
                          ? activeBtnCls
                          : themeStore.darkMode
                            ? 'hover:bg-gray-800'
                            : 'hover:bg-gray-100'
                      "
                      :style="{ fontFamily: fontStore.loadedFonts.has(f) ? f : 'inherit' }"
                    >
                      {{ f }}
                    </button>
                    <button
                      @click.stop="fontStore.toggleFavorite(f)"
                      class="p-1 mr-1 rounded shrink-0 transition-opacity"
                      :class="
                        fontStore.isFavorite(f)
                          ? 'text-yellow-400 opacity-100'
                          : 'opacity-0 group-hover:opacity-60 ' +
                            (themeStore.darkMode
                              ? 'text-gray-500 hover:text-yellow-400'
                              : 'text-gray-400 hover:text-yellow-400')
                      "
                      :title="
                        fontStore.isFavorite(f) ? 'Retirer des favoris' : 'Ajouter aux favoris'
                      "
                    >
                      <Star
                        class="w-3.5 h-3.5"
                        :fill="fontStore.isFavorite(f) ? 'currentColor' : 'none'"
                      />
                    </button>
                  </div>
                </template>

                <!-- Section: Favoris -->
                <template v-if="favFonts.length">
                  <div
                    class="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider opacity-40"
                    :class="[
                      themeStore.darkMode ? 'text-gray-400' : 'text-gray-500',
                      importedFonts.length
                        ? 'border-t ' +
                          (themeStore.darkMode ? 'border-gray-700' : 'border-gray-100')
                        : '',
                    ]"
                  >
                    Favoris
                  </div>
                  <div v-for="f in favFonts" :key="'fav-' + f" class="flex items-center group">
                    <button
                      @mouseenter="previewFont(f)"
                      @click.stop="selectFont(f)"
                      class="flex-1 text-left px-3 py-1.5 text-sm transition-colors"
                      :class="
                        sel.fontFamily === f
                          ? activeBtnCls
                          : themeStore.darkMode
                            ? 'hover:bg-gray-800'
                            : 'hover:bg-gray-100'
                      "
                      :style="{ fontFamily: fontStore.loadedFonts.has(f) ? f : 'inherit' }"
                    >
                      {{ f }}
                    </button>
                    <button
                      @click.stop="fontStore.toggleFavorite(f)"
                      class="p-1 mr-1 rounded shrink-0 text-yellow-400"
                      title="Retirer des favoris"
                    >
                      <Star class="w-3.5 h-3.5" fill="currentColor" />
                    </button>
                  </div>
                </template>

                <!-- Section: Populaires -->
                <div
                  class="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider opacity-40"
                  :class="[
                    themeStore.darkMode ? 'text-gray-400' : 'text-gray-500',
                    importedFonts.length || favFonts.length
                      ? 'border-t ' + (themeStore.darkMode ? 'border-gray-700' : 'border-gray-100')
                      : '',
                  ]"
                >
                  Populaires
                </div>
                <div
                  v-for="f in filteredPopularFonts"
                  :key="'pop-' + f"
                  class="flex items-center group"
                >
                  <button
                    @mouseenter="previewFont(f)"
                    @click.stop="selectFont(f)"
                    class="flex-1 text-left px-3 py-1.5 text-sm transition-colors"
                    :class="
                      sel.fontFamily === f
                        ? activeBtnCls
                        : themeStore.darkMode
                          ? 'hover:bg-gray-800'
                          : 'hover:bg-gray-100'
                    "
                    :style="{ fontFamily: fontStore.loadedFonts.has(f) ? f : 'inherit' }"
                  >
                    {{ f }}
                  </button>
                  <button
                    @click.stop="fontStore.toggleFavorite(f)"
                    class="p-1 mr-1 rounded shrink-0 transition-opacity"
                    :class="
                      fontStore.isFavorite(f)
                        ? 'text-yellow-400 opacity-100'
                        : 'opacity-0 group-hover:opacity-60 ' +
                          (themeStore.darkMode
                            ? 'text-gray-500 hover:text-yellow-400'
                            : 'text-gray-400 hover:text-yellow-400')
                    "
                    :title="fontStore.isFavorite(f) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                  >
                    <Star
                      class="w-3.5 h-3.5"
                      :fill="fontStore.isFavorite(f) ? 'currentColor' : 'none'"
                    />
                  </button>
                </div>

                <!-- Section: Toutes les polices -->
                <div
                  class="px-3 pt-3 pb-1 border-t text-xs font-semibold uppercase tracking-wider opacity-40"
                  :class="
                    themeStore.darkMode
                      ? 'border-gray-700 text-gray-400'
                      : 'border-gray-100 text-gray-500'
                  "
                >
                  Toutes les polices
                </div>
                <div v-for="f in otherFonts" :key="'all-' + f" class="flex items-center group">
                  <button
                    @mouseenter="previewFont(f)"
                    @click.stop="selectFont(f)"
                    class="flex-1 text-left px-3 py-1.5 text-sm transition-colors"
                    :class="
                      sel.fontFamily === f
                        ? activeBtnCls
                        : themeStore.darkMode
                          ? 'hover:bg-gray-800'
                          : 'hover:bg-gray-100'
                    "
                    :style="{ fontFamily: fontStore.loadedFonts.has(f) ? f : 'inherit' }"
                  >
                    {{ f }}
                  </button>
                  <button
                    @click.stop="fontStore.toggleFavorite(f)"
                    class="p-1 mr-1 rounded shrink-0 transition-opacity"
                    :class="
                      fontStore.isFavorite(f)
                        ? 'text-yellow-400 opacity-100'
                        : 'opacity-0 group-hover:opacity-60 ' +
                          (themeStore.darkMode
                            ? 'text-gray-500 hover:text-yellow-400'
                            : 'text-gray-400 hover:text-yellow-400')
                    "
                    :title="fontStore.isFavorite(f) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                  >
                    <Star
                      class="w-3.5 h-3.5"
                      :fill="fontStore.isFavorite(f) ? 'currentColor' : 'none'"
                    />
                  </button>
                </div>
              </template>

              <!-- With search: flat filtered results -->
              <template v-else>
                <div v-for="f in filteredFonts" :key="f" class="flex items-center group">
                  <button
                    @mouseenter="previewFont(f)"
                    @click.stop="selectFont(f)"
                    class="flex-1 text-left px-3 py-1.5 text-sm transition-colors"
                    :class="
                      sel.fontFamily === f
                        ? activeBtnCls
                        : themeStore.darkMode
                          ? 'hover:bg-gray-800'
                          : 'hover:bg-gray-100'
                    "
                    :style="{ fontFamily: fontStore.loadedFonts.has(f) ? f : 'inherit' }"
                  >
                    {{ f }}
                  </button>
                  <button
                    @click.stop="fontStore.toggleFavorite(f)"
                    class="p-1 mr-1 rounded shrink-0 transition-opacity"
                    :class="
                      fontStore.isFavorite(f)
                        ? 'text-yellow-400 opacity-100'
                        : 'opacity-0 group-hover:opacity-60 ' +
                          (themeStore.darkMode
                            ? 'text-gray-500 hover:text-yellow-400'
                            : 'text-gray-400 hover:text-yellow-400')
                    "
                    :title="fontStore.isFavorite(f) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                  >
                    <Star
                      class="w-3.5 h-3.5"
                      :fill="fontStore.isFavorite(f) ? 'currentColor' : 'none'"
                    />
                  </button>
                </div>
                <div
                  v-if="filteredFonts.length === 0"
                  class="px-3 py-4 text-center text-xs opacity-50"
                >
                  Aucune police trouvée
                </div>
              </template>
            </div>
          </div>
        </Teleport>
      </div>

      <div class="w-px h-5 shrink-0" :class="divCls" />

      <!-- Font size -->
      <div class="flex items-center gap-0.5">
        <button @click="changeFontSize(-1)" class="p-1 rounded" :class="btnCls">
          <Minus class="w-3 h-3" />
        </button>
        <input
          type="number"
          :value="sel.fontSize"
          @change="commit('fontSize', +$event.target.value)"
          class="w-12 text-center text-sm rounded px-1 py-1 outline-none border"
          :class="inputCls"
          min="6"
          max="200"
        />
        <button @click="changeFontSize(1)" class="p-1 rounded" :class="btnCls">
          <Plus class="w-3 h-3" />
        </button>
      </div>

      <div class="w-px h-5 shrink-0" :class="divCls" />

      <!-- Bold -->
      <button
        @click="toggleBold"
        class="p-1.5 rounded font-bold text-sm w-7 h-7 flex items-center justify-center transition-colors"
        :class="isBold ? activeBtnCls : btnCls"
        title="Gras"
      >
        B
      </button>

      <!-- Italic -->
      <button
        @click="toggleItalic"
        class="p-1.5 rounded italic text-sm w-7 h-7 flex items-center justify-center transition-colors"
        :class="isItalic ? activeBtnCls : btnCls"
        title="Italique"
      >
        I
      </button>

      <!-- Underline -->
      <button
        @click="toggleUnderline"
        class="p-1.5 rounded underline text-sm w-7 h-7 flex items-center justify-center transition-colors"
        :class="isUnderline ? activeBtnCls : btnCls"
        title="Souligné"
      >
        U
      </button>

      <!-- Underline color (only visible when underline is active) -->
      <label
        v-if="isUnderline"
        class="relative w-5 h-5 rounded cursor-pointer border overflow-hidden shrink-0"
        :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-300'"
        title="Couleur du soulignement"
      >
        <div
          class="absolute inset-0"
          :style="{ background: sel.underlineColor || sel.fill || '#000000' }"
        />
        <input
          type="color"
          :value="sel.underlineColor || sel.fill || '#000000'"
          @input="update('underlineColor', $event.target.value)"
          @change="commit('underlineColor', $event.target.value)"
          class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </label>

      <!-- Bullet list styles -->
      <div class="flex items-center gap-0.5">
        <button
          v-for="bullet in bulletStyles"
          :key="bullet.prefix"
          @click="toggleBullets(bullet.prefix)"
          class="px-1.5 py-1 rounded text-xs font-mono transition-colors"
          :class="activeBullet === bullet.prefix ? activeBtnCls : btnCls"
          :title="bullet.label"
        >{{ bullet.symbol }}</button>
      </div>

      <div class="w-px h-5 shrink-0" :class="divCls" />

      <!-- Alignment -->
      <div class="flex items-center gap-0.5">
        <button
          v-for="a in alignments"
          :key="a.value"
          @click="commit('align', a.value)"
          class="p-1.5 rounded transition-colors"
          :class="sel.align === a.value ? activeBtnCls : btnCls"
          :title="a.label"
        >
          <component :is="a.icon" class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Letter spacing -->
      <div class="flex items-center gap-1.5">
        <MoveHorizontal
          class="w-3.5 h-3.5"
          :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
        />
        <input
          type="range"
          :value="sel.letterSpacing ?? 0"
          @input="update('letterSpacing', +$event.target.value)"
          @change="commit('letterSpacing', +$event.target.value)"
          min="-5"
          max="20"
          step="0.5"
          class="w-20 accent-violet-500"
        />
        <span
          class="text-xs w-5 shrink-0"
          :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
        >
          {{ sel.letterSpacing ?? 0 }}
        </span>
      </div>

      <!-- Contact icon toggle (only for email/phone/website/address roles) -->
      <template v-if="isContactRole">
        <div class="w-px h-5 shrink-0" :class="divCls" />
        <button
          @click="commit('showContactIcon', !sel.showContactIcon)"
          class="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
          :class="sel.showContactIcon ? activeBtnCls : btnCls"
          title="Afficher l'icône correspondante au rôle (email, téléphone, site web, adresse)"
        >
          <Contact2 class="w-3.5 h-3.5" />
          <span>Icône</span>
        </button>
      </template>
    </template>

    <!-- ── LINE / ARROW CONTROLS ─────────────────────────────────────── -->
    <ContextBarLine
      v-else-if="
        !sel?.locked && selType === 'shape' &&
        (sel.shapeType === 'line' || sel.shapeType === 'line-bar' ||
         sel.shapeType === 'arrow' || sel.shapeType === 'arrow-double')
      "
    />

    <!-- ── SHAPE CONTROLS ─────────────────────────────────────────────── -->
    <ContextBarShape
      v-else-if="!sel?.locked && selType === 'shape'"
      @open-fill="onShapeOpenFill"
    />

    <!-- ── ICON CONTROLS ──────────────────────────────────────────────── -->
    <ContextBarIcon v-else-if="!sel?.locked && selType === 'icon'" />

    <!-- ── QR CODE CONTROLS ────────────────────────────────────────────── -->
    <ContextBarQR v-else-if="!sel?.locked && selType === 'qr'" />

    <!-- ── IMAGE CONTROLS ───────────────────────────────────────────────── -->
    <ContextBarImage v-else-if="!sel?.locked && selType === 'image'" />

    <!-- ── MULTI-SELECTION TOOLBAR ────────────────────────────────────── -->
    <ContextBarMulti />

    <!-- ── COMMON CONTROLS (all element types) ────────────────────────── -->
    <ContextBarCommon />

    <!-- ── GRADIENT FILL POPOVER (shared by Shape + Text) ─────────────── -->
    <GradientFillPopover
      v-model:open="fillPopoverOpen"
      :popover-style="fillPopoverStyle"
      v-model:fill-mode="shapeFillMode"
      v-model:grad-angle="shapeGradAngle"
      v-model:grad-from="shapeGradFrom"
      v-model:grad-to="shapeGradTo"
      :current-fill="sel?.fill"
      :trigger-ref="fillTriggerRef"
      @solid-input="updSolidFill"
      @solid-change="commitSolidFill"
      @grad-input="updateGradientFill"
      @grad-change="commitGradientFill"
    />
  </div>

  <!-- Placeholder bar when nothing selected -->
  <div
    v-else
    class="flex items-center gap-2 px-4 h-11 shrink-0 border-b"
    :class="themeStore.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
  >
    <RectangleHorizontal class="w-3.5 h-3.5 opacity-30" />
    <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-600' : 'text-gray-400'">
      Cliquez sur un élément pour le modifier
    </span>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import {
  Minus,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  MoveHorizontal,
  RectangleHorizontal,
  Contact2,
  ChevronDown,
  Star,
  Upload,
  Lock,
  LockOpen,
} from 'lucide-vue-next'
import ContextBarImage from './contextbar/ContextBarImage.vue'
import ContextBarQR from './contextbar/ContextBarQR.vue'
import ContextBarIcon from './contextbar/ContextBarIcon.vue'
import ContextBarLine from './contextbar/ContextBarLine.vue'
import ContextBarMulti from './contextbar/ContextBarMulti.vue'
import ContextBarCommon from './contextbar/ContextBarCommon.vue'
import ContextBarShape from './contextbar/ContextBarShape.vue'
import GradientFillPopover from './contextbar/GradientFillPopover.vue'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'
import { useFontStore } from '@/stores/fontStore'
import { useAuthStore } from '@/stores/authStore'

const editorStore = useEditorStore()
const themeStore = useThemeStore()
const fontStore = useFontStore()
const authStore = useAuthStore()

const MAX_FREE_FONTS = 50

const sel = computed(() => editorStore.singleSelected)
const selType = computed(() => sel.value?.type ?? null)

// Returns true/false for lock button (single element or group), null when no selection
const isSelectionLocked = computed(() => {
  if (!editorStore.selectedIds.length) return null
  const firstId = editorStore.selectedIds[0]
  const el = editorStore.currentElements.find((e) => e.id === firstId)
  if (!el) return null
  return !!el.locked
})

const hasAnyLocked = computed(() => editorStore.currentElements.some((el) => el.locked))

// ── Style helpers ─────────────────────────────────────────────────────────
const inputCls = computed(() =>
  themeStore.darkMode
    ? 'bg-gray-800 border-gray-700 text-gray-200'
    : 'bg-white border-gray-200 text-gray-800',
)
const btnCls = computed(() =>
  themeStore.darkMode
    ? 'text-gray-400 hover:bg-gray-800 hover:text-white transition-colors'
    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors',
)
const activeBtnCls = computed(() =>
  themeStore.darkMode ? 'bg-violet-700 text-white' : 'bg-violet-100 text-violet-700',
)
const divCls = computed(() => (themeStore.darkMode ? 'bg-gray-700' : 'bg-gray-200'))

// ── Font dropdown ─────────────────────────────────────────────────────────
const fontDropdownOpen = ref(false)
const fontDropdownRef = ref(null)
const fontSearchRef = ref(null)
const fontQuery = ref('')
const dropdownPos = ref({ top: 0, left: 0 })
const fontFileInputCtxRef = ref(null)

function triggerFontUploadCtx() {
  fontFileInputCtxRef.value?.click()
}

async function onFontFileSelectedCtx(e) {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = ''
  await fontStore.addCustomFont(file)
}

const dropdownStyle = computed(() => ({
  top: dropdownPos.value.top + 'px',
  left: dropdownPos.value.left + 'px',
}))

// Search results filtered by query — capped for free users
const filteredFonts = computed(() => {
  const all = fontStore.searchFonts(fontQuery.value)
  if (authStore.isPremium || authStore.isAdmin) return all
  return all.slice(0, MAX_FREE_FONTS)
})

// "Toutes les polices" section = full list minus popular, imported, and favorites
const importedFonts = computed(() => fontStore.customFonts.map((f) => f.name))
const favFonts = computed(() => fontStore.favoriteFontsList)
// Popular fonts minus those already shown in imported or favorites
const filteredPopularFonts = computed(() => {
  const customSet = new Set(importedFonts.value)
  const favSet = fontStore.favoriteFonts
  return fontStore.popularFonts.filter((f) => !customSet.has(f) && !favSet.has(f))
})
const otherFonts = computed(() => {
  const popularSet = new Set(fontStore.popularFonts)
  const customSet = new Set(importedFonts.value)
  const favSet = fontStore.favoriteFonts
  const all = (fontStore.allFontFamilies || []).filter(
    (f) => !popularSet.has(f) && !customSet.has(f) && !favSet.has(f),
  )
  if (authStore.isPremium || authStore.isAdmin) return all
  const budget = MAX_FREE_FONTS - favFonts.value.length - filteredPopularFonts.value.length
  return budget > 0 ? all.slice(0, budget) : []
})

function toggleFontDropdown() {
  if (fontDropdownOpen.value) {
    fontDropdownOpen.value = false
    return
  }
  // Calculate dropdown position from button rect
  const btn = fontDropdownRef.value?.querySelector('button')
  if (btn) {
    const rect = btn.getBoundingClientRect()
    dropdownPos.value = {
      top: rect.bottom + 4,
      left: Math.min(rect.left, window.innerWidth - 268),
    }
  }
  fontDropdownOpen.value = true
  fontQuery.value = ''
  nextTick(() => {
    fontSearchRef.value?.focus()
    // Scroll to the currently selected font if it's in the list
    if (sel.value?.fontFamily) {
      const list = fontSearchRef.value
        ?.closest('[data-font-dropdown]')
        ?.querySelector('.overflow-y-auto')
      if (list) {
        const active = list.querySelector('[class*="bg-violet"]')
        active?.scrollIntoView({ block: 'nearest' })
      }
    }
  })
}

function previewFont(family) {
  fontStore.loadFont(family)
}

function selectFont(family) {
  fontDropdownOpen.value = false
  // Apply immediately with current fallback, then re-apply once loaded (no commit — avoids double undo)
  commit('fontFamily', family)
  fontStore.loadFont(family).then(() => {
    if (sel.value?.fontFamily === family) {
      editorStore.updateElement(sel.value.id, { fontFamily: family })
    }
  })
}

// Close dropdown on outside click — check both the trigger button and the teleported dropdown
function onDocClick(e) {
  if (fontDropdownOpen.value) {
    const btn = fontDropdownRef.value
    const inDropdown = e.target.closest('[data-font-dropdown]')
    if (!btn?.contains(e.target) && !inDropdown) fontDropdownOpen.value = false
  }

}

onMounted(() => document.addEventListener('mousedown', onDocClick, true))
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocClick, true)
})

const alignments = [
  { value: 'left', label: 'Aligner à gauche', icon: AlignLeft },
  { value: 'center', label: 'Centrer', icon: AlignCenter },
  { value: 'right', label: 'Aligner à droite', icon: AlignRight },
]

const bulletStyles = [
  { prefix: '• ', symbol: '•', label: 'Puces rondes' },
  { prefix: '- ', symbol: '—', label: 'Tirets' },
  { prefix: '1. ', symbol: '1.', label: 'Liste numérotée' },
]

const isBold = computed(() => sel.value?.fontStyle?.includes('bold'))
const isItalic = computed(() => sel.value?.fontStyle?.includes('italic'))
const isUnderline = computed(() => sel.value?.textDecoration?.includes('underline'))

const activeBullet = computed(() => {
  const text = sel.value?.text
  if (!text) return null
  const lines = text.split('\n').filter((l) => l.trim())
  if (!lines.length) return null
  for (const { prefix } of bulletStyles) {
    const isNumbered = prefix === '1. '
    const count = lines.filter((l) => (isNumbered ? /^\d+\. /.test(l) : l.startsWith(prefix))).length
    if (count > lines.length / 2) return prefix
  }
  return null
})

const CONTACT_ICON_ROLES = ['email', 'phone', 'website', 'address']
const isContactRole = computed(() => CONTACT_ICON_ROLES.includes(sel.value?.role))

function update(key, value) {
  if (!sel.value) return
  editorStore.updateElement(sel.value.id, { [key]: value })
}

// Saves to undo history — use for discrete actions (clicks, @change on release)
function commit(key, value) {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, { [key]: value })
}

// ── Shape fill mode (solid / gradient) ────────────────────────────────────
const shapeFillMode = ref('solid')
const shapeGradAngle = ref(135)
const shapeGradFrom = ref('#3B82F6')
const shapeGradTo = ref('#8B5CF6')
const fillPopoverOpen = ref(false)
const fillTriggerRef = ref(null)
const fillPopoverStyle = ref({})

watch(sel, (el) => {
  if (!el) return
  if (el.fillGradient?.from) {
    shapeFillMode.value = 'gradient'
    shapeGradAngle.value = el.fillGradient.angle ?? 135
    shapeGradFrom.value = el.fillGradient.from
    shapeGradTo.value = el.fillGradient.to ?? el.fillGradient.from
  } else {
    shapeFillMode.value = 'solid'
    shapeGradFrom.value = el.fill || '#3B82F6'
  }
}, { immediate: true })

function openFillPopover(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  fillPopoverStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 6}px`,
    left: `${Math.min(rect.left, window.innerWidth - 220)}px`,
    zIndex: 9999,
  }
  fillPopoverOpen.value = !fillPopoverOpen.value
}


function updSolidFill(color) {
  if (!sel.value) return
  editorStore.updateElement(sel.value.id, { fill: color, fillGradient: undefined })
}

function commitSolidFill(color) {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, { fill: color, fillGradient: undefined })
}

function updateGradientFill() {
  if (!sel.value) return
  editorStore.updateElement(sel.value.id, {
    fill: '',
    fillGradient: { angle: shapeGradAngle.value, from: shapeGradFrom.value, to: shapeGradTo.value },
  })
}

function commitGradientFill() {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, {
    fill: '',
    fillGradient: { angle: shapeGradAngle.value, from: shapeGradFrom.value, to: shapeGradTo.value },
  })
}

function toggleTextGradient() {
  if (shapeFillMode.value === 'gradient') {
    commitSolidFill(shapeGradFrom.value)
  } else {
    shapeFillMode.value = 'gradient'
    commitGradientFill()
  }
}



function changeFontSize(delta) {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, {
    fontSize: Math.max(6, (sel.value.fontSize || 16) + delta),
  })
}


function onShapeOpenFill(triggerEl) {
  fillTriggerRef.value = triggerEl
  const rect = triggerEl.getBoundingClientRect()
  fillPopoverStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 6}px`,
    left: `${Math.min(rect.left, window.innerWidth - 220)}px`,
    zIndex: 9999,
  }
  fillPopoverOpen.value = !fillPopoverOpen.value
}

function toggleBold() {
  if (!sel.value) return
  const cur = sel.value.fontStyle || 'normal'
  const bold = cur.includes('bold')
  const italic = cur.includes('italic')
  const next = [bold ? '' : 'bold', italic ? 'italic' : ''].filter(Boolean).join(' ') || 'normal'
  editorStore.updateElementCommit(sel.value.id, { fontStyle: next })
}

function toggleItalic() {
  if (!sel.value) return
  const cur = sel.value.fontStyle || 'normal'
  const bold = cur.includes('bold')
  const italic = cur.includes('italic')
  const next = [bold ? 'bold' : '', italic ? '' : 'italic'].filter(Boolean).join(' ') || 'normal'
  editorStore.updateElementCommit(sel.value.id, { fontStyle: next })
}

function toggleUnderline() {
  if (!sel.value) return
  const cur = sel.value.textDecoration || ''
  const turningOn = !cur.includes('underline')
  const patch = { textDecoration: turningOn ? 'underline' : '' }
  // Initialize underlineColor to the current fill the first time underline is activated,
  // so the color stays stable when the user later changes the text fill color.
  if (turningOn && !sel.value.underlineColor) {
    patch.underlineColor = sel.value.fill || '#000000'
  }
  editorStore.updateElementCommit(sel.value.id, patch)
}

function stripBulletPrefix(line) {
  for (const { prefix: p } of bulletStyles) {
    // For numbered lists match any "N. " pattern, not just "1. "
    if (p === '1. ') {
      if (/^\d+\. /.test(line)) return line.replace(/^\d+\. /, '')
    } else if (line.startsWith(p)) {
      return line.slice(p.length)
    }
  }
  return line
}

function applyNumberedPrefix(lines) {
  let n = 0
  return lines.map((l) => {
    if (!l.trim()) return l
    n++
    return `${n}. ${l}`
  })
}

function toggleBullets(prefix) {
  if (!sel.value) return
  let rawText = sel.value.text || ''

  // Texte vide : initialiser avec une ligne vide préfixée
  if (!rawText.trim()) {
    const starter = prefix === '1. ' ? '1. ' : prefix
    editorStore.updateElementCommit(sel.value.id, { text: starter })
    return
  }

  const lines = rawText.split('\n')
  const nonEmptyLines = lines.filter((l) => l.trim())
  const isNumbered = prefix === '1. '

  // Détecte si la majorité des lignes non-vides ont déjà ce préfixe
  const withPrefix = nonEmptyLines.filter((l) =>
    isNumbered ? /^\d+\. /.test(l) : l.startsWith(prefix),
  )
  const majority = withPrefix.length > nonEmptyLines.length / 2

  let newLines
  if (majority) {
    // Retirer le préfixe de toutes les lignes non-vides
    newLines = lines.map((l) => (l.trim() ? stripBulletPrefix(l) : l))
  } else {
    // Retirer tout préfixe existant, puis appliquer le nouveau
    const stripped = lines.map((l) => (l.trim() ? stripBulletPrefix(l) : l))
    if (isNumbered) {
      newLines = applyNumberedPrefix(stripped)
    } else {
      newLines = stripped.map((l) => (l.trim() ? prefix + l : l))
    }
  }
  editorStore.updateElementCommit(sel.value.id, { text: newLines.join('\n') })
}

</script>
