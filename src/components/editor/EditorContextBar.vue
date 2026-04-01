<template>
  <!-- Only render when something is selected -->
  <div
    v-if="editorStore.selectedIds.length > 0"
    class="flex items-center gap-1 px-3 h-11 shrink-0 border-b overflow-x-auto"
    :class="
      themeStore.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'
    "
  >
    <!-- ── TEXT CONTROLS ──────────────────────────────────────────────── -->
    <template v-if="selType === 'text'">
      <!-- Text color -->
      <label class="flex items-center gap-1.5 cursor-pointer" title="Couleur du texte">
        <Type class="w-4 h-4" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
        <div
          class="relative w-6 h-6 rounded border overflow-hidden"
          :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-300'"
        >
          <div class="absolute inset-0" :style="{ background: sel.fill }" />
          <input
            type="color"
            :value="sel.fill"
            @input="update('fill', $event.target.value)"
            @change="commit('fill', $event.target.value)"
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
      </label>

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
                placeholder="Rechercher parmi 300+ polices..."
                class="w-full text-sm rounded px-2 py-1.5 outline-none border"
                :class="inputCls"
                @keydown.escape="fontDropdownOpen = false"
              />
            </div>

            <!-- Font list — 2 sections when no search, flat list when searching -->
            <div class="overflow-y-auto overscroll-contain" style="max-height: 320px">
              <!-- No search: 4 sections -->
              <template v-if="!fontQuery">
                <!-- Section: Polices importées -->
                <template v-if="importedFonts.length">
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
          title="Afficher l'icône contact"
        >
          <Contact2 class="w-3.5 h-3.5" />
          <span>Icône</span>
        </button>
      </template>
    </template>

    <!-- ── LINE CONTROLS ─────────────────────────────────────────────── -->
    <template
      v-else-if="selType === 'shape' && (sel.shapeType === 'line' || sel.shapeType === 'line-bar')"
    >
      <!-- Line color -->
      <label class="flex items-center gap-1.5 cursor-pointer" title="Couleur de la ligne">
        <Palette class="w-4 h-4" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
        <div
          class="relative w-6 h-6 rounded border overflow-hidden"
          :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-300'"
        >
          <div class="absolute inset-0" :style="{ background: sel.fill || '#000000' }" />
          <input
            type="color"
            :value="sel.fill || '#000000'"
            @input="update('fill', $event.target.value)"
            @change="commit('fill', $event.target.value)"
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
          >Couleur</span
        >
      </label>

      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

      <!-- Stroke width -->
      <div class="flex items-center gap-1.5">
        <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
          >Épaisseur</span
        >
        <input
          type="number"
          :value="sel.strokeWidth || 2"
          @change="commit('strokeWidth', Math.max(1, +$event.target.value))"
          class="w-14 text-center text-sm rounded px-1 py-1 outline-none border"
          :class="inputCls"
          min="1"
          max="30"
        />
      </div>

      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

      <!-- Line style: solid / dashed / dotted -->
      <div class="flex items-center gap-1">
        <button
          @click="setLineDash([])"
          class="px-2 py-1 rounded text-xs flex items-center gap-1.5 transition-colors"
          :class="lineStyle === 'solid' ? activeBtnCls : btnCls"
          title="Plein"
        >
          <svg width="20" height="4" class="shrink-0">
            <line x1="0" y1="2" x2="20" y2="2" stroke="currentColor" stroke-width="2" />
          </svg>
          <span>Plein</span>
        </button>
        <button
          @click="setLineDash([10, 6])"
          class="px-2 py-1 rounded text-xs flex items-center gap-1.5 transition-colors"
          :class="lineStyle === 'dashed' ? activeBtnCls : btnCls"
          title="Tirets"
        >
          <svg width="20" height="4" class="shrink-0">
            <line
              x1="0"
              y1="2"
              x2="20"
              y2="2"
              stroke="currentColor"
              stroke-width="2"
              stroke-dasharray="6,4"
            />
          </svg>
          <span>Tirets</span>
        </button>
        <button
          @click="setLineDash([2, 8])"
          class="px-2 py-1 rounded text-xs flex items-center gap-1.5 transition-colors"
          :class="lineStyle === 'dotted' ? activeBtnCls : btnCls"
          title="Points"
        >
          <svg width="20" height="4" class="shrink-0">
            <line
              x1="0"
              y1="2"
              x2="20"
              y2="2"
              stroke="currentColor"
              stroke-width="2"
              stroke-dasharray="2,6"
              stroke-linecap="round"
            />
          </svg>
          <span>Points</span>
        </button>
      </div>
    </template>

    <!-- ── ARROW CONTROLS ─────────────────────────────────────────────── -->
    <template
      v-else-if="
        selType === 'shape' && (sel.shapeType === 'arrow' || sel.shapeType === 'arrow-double')
      "
    >
      <!-- Arrow color -->
      <label class="flex items-center gap-1.5 cursor-pointer" title="Couleur de la flèche">
        <Palette class="w-4 h-4" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
        <div
          class="relative w-6 h-6 rounded border overflow-hidden"
          :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-300'"
        >
          <div class="absolute inset-0" :style="{ background: sel.fill || '#000000' }" />
          <input
            type="color"
            :value="sel.fill || '#000000'"
            @input="update('fill', $event.target.value)"
            @change="commit('fill', $event.target.value)"
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
          >Couleur</span
        >
      </label>

      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

      <!-- Arrow size (height = overall height controls tip size) -->
      <div class="flex items-center gap-1.5">
        <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
          >Taille</span
        >
        <input
          type="number"
          :value="sel.height || 24"
          @change="commit('height', Math.max(8, Math.min(80, +$event.target.value)))"
          class="w-14 text-center text-sm rounded px-1 py-1 outline-none border"
          :class="inputCls"
          min="8"
          max="80"
        />
      </div>
    </template>

    <!-- ── SHAPE CONTROLS ─────────────────────────────────────────────── -->
    <template v-else-if="selType === 'shape'">
      <!-- Fill color -->
      <label class="flex items-center gap-1.5 cursor-pointer" title="Couleur de remplissage">
        <Palette class="w-4 h-4" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
        <div
          class="relative w-6 h-6 rounded border overflow-hidden"
          :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-300'"
        >
          <div class="absolute inset-0" :style="{ background: sel.fill }" />
          <input
            type="color"
            :value="sel.fill"
            @input="update('fill', $event.target.value)"
            @change="commit('fill', $event.target.value)"
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <span
          class="text-xs font-mono"
          :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
          >Fond</span
        >
      </label>

      <!-- Border color -->
      <label class="flex items-center gap-1.5 cursor-pointer ml-2" title="Couleur de bordure">
        <div
          class="relative w-6 h-6 rounded border-2 overflow-hidden"
          :style="{ borderColor: sel.stroke || '#9CA3AF' }"
        >
          <div class="absolute inset-0 bg-transparent" />
          <input
            type="color"
            :value="sel.stroke || '#000000'"
            @input="update('stroke', $event.target.value)"
            @change="commit('stroke', $event.target.value)"
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <span
          class="text-xs font-mono"
          :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
          >Bordure</span
        >
      </label>

      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

      <!-- Stroke width -->
      <div class="flex items-center gap-1.5">
        <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
          >Ep.</span
        >
        <input
          type="number"
          :value="sel.strokeWidth ?? 0"
          @change="commit('strokeWidth', +$event.target.value)"
          class="w-12 text-center text-sm rounded px-1 py-1 outline-none border"
          :class="inputCls"
          min="0"
          max="20"
        />
      </div>

      <!-- Corner radius (only for rect) -->
      <template v-if="sel.shapeType === 'rect'">
        <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />
        <div class="flex items-center gap-1.5">
          <RectangleHorizontal class="w-4 h-4 opacity-50" />
          <input
            type="number"
            :value="sel.cornerRadius ?? 0"
            @change="commit('cornerRadius', +$event.target.value)"
            class="w-12 text-center text-sm rounded px-1 py-1 outline-none border"
            :class="inputCls"
            min="0"
            max="200"
          />
        </div>
      </template>
    </template>

    <!-- ── ICON CONTROLS ──────────────────────────────────────────────── -->
    <template v-else-if="selType === 'icon' && !sel.colorful">
      <!-- Fill color -->
      <label class="flex items-center gap-1.5 cursor-pointer" title="Couleur de l'icône">
        <Palette class="w-4 h-4" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
        <div
          class="relative w-6 h-6 rounded border overflow-hidden"
          :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-300'"
        >
          <div class="absolute inset-0" :style="{ background: sel.fill || '#1a1a1a' }" />
          <input
            type="color"
            :value="sel.fill || '#1a1a1a'"
            @input="update('fill', $event.target.value)"
            @change="commit('fill', $event.target.value)"
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <span
          class="text-xs font-mono"
          :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
          >Couleur</span
        >
      </label>
    </template>

    <!-- ── QR CODE CONTROLS ────────────────────────────────────────────── -->
    <template v-else-if="selType === 'qr'">
      <!-- Foreground color -->
      <label class="flex items-center gap-1.5 cursor-pointer" title="Couleur avant-plan QR">
        <Palette class="w-4 h-4" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
        <div
          class="relative w-6 h-6 rounded border overflow-hidden"
          :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-300'"
        >
          <div class="absolute inset-0" :style="{ background: sel.qrForeground || '#000000' }" />
          <input
            type="color"
            :value="sel.qrForeground || '#000000'"
            @input="update('qrForeground', $event.target.value)"
            @change="commit('qrForeground', $event.target.value)"
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
          >QR</span
        >
      </label>

      <div class="w-px h-5 shrink-0" :class="divCls" />

      <!-- Background color -->
      <label class="flex items-center gap-1.5 cursor-pointer" title="Couleur arrière-plan QR">
        <div
          class="relative w-6 h-6 rounded border overflow-hidden"
          :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-300'"
        >
          <div class="absolute inset-0" :style="{ background: sel.qrBackground || '#ffffff' }" />
          <input
            type="color"
            :value="sel.qrBackground || '#ffffff'"
            @input="update('qrBackground', $event.target.value)"
            @change="commit('qrBackground', $event.target.value)"
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
          >Fond</span
        >
      </label>

      <div class="w-px h-5 shrink-0" :class="divCls" />

      <!-- Mode toggle -->
      <div class="flex items-center gap-1">
        <button
          v-for="m in [
            { v: 'standard', l: 'Standard' },
            { v: 'styled', l: 'Stylé' },
          ]"
          :key="m.v"
          @click="commit('qrMode', m.v)"
          class="text-[10px] px-2 py-0.5 rounded border transition-colors"
          :class="
            (sel.qrMode || 'standard') === m.v
              ? 'border-violet-500 bg-violet-500/20 text-violet-400 font-semibold'
              : themeStore.darkMode
                ? 'border-gray-600 text-gray-400 hover:border-gray-500'
                : 'border-gray-300 text-gray-500 hover:border-gray-400'
          "
        >
          {{ m.l }}
        </button>
      </div>
    </template>

    <!-- ── MULTI-SELECTION TOOLBAR ────────────────────────────────────── -->
    <template v-if="editorStore.selectedIds.length >= 2">
      <span class="text-xs mr-1" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">
        {{ editorStore.selectedIds.length }} éléments
      </span>
      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

      <!-- Group / Ungroup -->
      <button
        v-if="!editorStore.canUngroup"
        @click="editorStore.groupSelected()"
        class="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
        :class="btnCls"
        title="Grouper (Ctrl+G)"
      >
        <Group class="w-3.5 h-3.5" />
        Grouper
      </button>
      <button
        v-else
        @click="editorStore.ungroupSelected()"
        class="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
        :class="btnCls"
        title="Dégrouper (Ctrl+Shift+G)"
      >
        <Ungroup class="w-3.5 h-3.5" />
        Dégrouper
      </button>

      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

      <!-- Quick align -->
      <button
        @click="editorStore.alignElements(editorStore.selectedIds, 'left')"
        class="p-1.5 rounded"
        :class="btnCls"
        title="Aligner à gauche"
      >
        <AlignLeft class="w-3.5 h-3.5" />
      </button>
      <button
        @click="editorStore.alignElements(editorStore.selectedIds, 'centerH')"
        class="p-1.5 rounded"
        :class="btnCls"
        title="Centrer horizontalement"
      >
        <AlignCenter class="w-3.5 h-3.5" />
      </button>
      <button
        @click="editorStore.alignElements(editorStore.selectedIds, 'right')"
        class="p-1.5 rounded"
        :class="btnCls"
        title="Aligner à droite"
      >
        <AlignRight class="w-3.5 h-3.5" />
      </button>
      <button
        @click="editorStore.alignElements(editorStore.selectedIds, 'top')"
        class="p-1.5 rounded"
        :class="btnCls"
        title="Aligner en haut"
      >
        <ArrowUpToLine class="w-3.5 h-3.5" />
      </button>
      <button
        @click="editorStore.alignElements(editorStore.selectedIds, 'centerV')"
        class="p-1.5 rounded"
        :class="btnCls"
        title="Centrer verticalement"
      >
        <AlignCenter class="w-3.5 h-3.5" style="transform: rotate(90deg)" />
      </button>
      <button
        @click="editorStore.alignElements(editorStore.selectedIds, 'bottom')"
        class="p-1.5 rounded"
        :class="btnCls"
        title="Aligner en bas"
      >
        <ArrowDownToLine class="w-3.5 h-3.5" />
      </button>

      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

      <!-- Delete multi -->
      <button
        @click="editorStore.deleteSelected()"
        class="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"
        :class="themeStore.darkMode && 'dark:hover:bg-red-900/20'"
        title="Supprimer la sélection"
      >
        <Trash2 class="w-3.5 h-3.5" />
      </button>
    </template>

    <!-- ── COMMON CONTROLS (all element types) ────────────────────────── -->
    <template v-if="editorStore.selectedIds.length === 1">
      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

      <!-- Position X / Y -->
      <div class="flex items-center gap-1">
        <span
          class="text-[10px] font-semibold w-3 shrink-0"
          :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
          >X</span
        >
        <input
          type="number"
          :value="Math.round(sel.x)"
          @change="commit('x', +$event.target.value)"
          class="w-[52px] text-center text-xs rounded px-1 py-0.5 outline-none border"
          :class="inputCls"
          title="Position X (px)"
        />
      </div>
      <div class="flex items-center gap-1 ml-1">
        <span
          class="text-[10px] font-semibold w-3 shrink-0"
          :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
          >Y</span
        >
        <input
          type="number"
          :value="Math.round(sel.y)"
          @change="commit('y', +$event.target.value)"
          class="w-[52px] text-center text-xs rounded px-1 py-0.5 outline-none border"
          :class="inputCls"
          title="Position Y (px)"
        />
      </div>

      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

      <!-- Size W / H with ratio lock -->
      <div class="flex items-center gap-1">
        <span
          class="text-[10px] font-semibold w-3 shrink-0"
          :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
          >L</span
        >
        <input
          type="number"
          :value="Math.round(sel.width || 0)"
          @change="commitWidth(+$event.target.value)"
          class="w-[52px] text-center text-xs rounded px-1 py-0.5 outline-none border"
          :class="inputCls"
          min="1"
          title="Largeur (px)"
        />
      </div>
      <button
        @click="lockRatio = !lockRatio"
        class="p-0.5 rounded mx-0.5 transition-colors"
        :class="
          lockRatio
            ? themeStore.darkMode
              ? 'text-violet-400 bg-violet-900/40'
              : 'text-violet-600 bg-violet-50'
            : btnCls
        "
        title="Verrouiller les proportions"
      >
        <Link2 class="w-3 h-3" />
      </button>
      <div class="flex items-center gap-1">
        <span
          class="text-[10px] font-semibold w-3 shrink-0"
          :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
          >H</span
        >
        <input
          type="number"
          :value="Math.round(sel.height || 0)"
          @change="commitHeight(+$event.target.value)"
          class="w-[52px] text-center text-xs rounded px-1 py-0.5 outline-none border"
          :class="inputCls"
          min="1"
          title="Hauteur (px)"
        />
      </div>

      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

      <!-- Rotation -->
      <div class="flex items-center gap-1">
        <RotateCw
          class="w-3 h-3 shrink-0"
          :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
          title="Rotation"
        />
        <input
          type="number"
          :value="Math.round(sel.rotation ?? 0)"
          @change="commit('rotation', +$event.target.value)"
          class="w-[52px] text-center text-xs rounded px-1 py-0.5 outline-none border"
          :class="inputCls"
          min="-180"
          max="180"
          title="Rotation (°)"
        />
        <span
          class="text-[10px] shrink-0"
          :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
          >°</span
        >
      </div>

      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

      <!-- Opacity -->
      <div class="flex items-center gap-1.5">
        <Layers
          class="w-3.5 h-3.5"
          :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
        />
        <input
          type="range"
          :value="Math.round((sel?.opacity ?? 1) * 100)"
          @input="update('opacity', +$event.target.value / 100)"
          @change="commit('opacity', +$event.target.value / 100)"
          min="0"
          max="100"
          class="w-20 accent-violet-500"
        />
        <span
          class="text-xs w-7 shrink-0 text-right"
          :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
        >
          {{ Math.round((sel?.opacity ?? 1) * 100) }}%
        </span>
      </div>

      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

      <!-- Layer order -->
      <button
        @click="editorStore.sendBackward(sel.id)"
        class="p-1.5 rounded"
        :class="btnCls"
        title="Reculer"
      >
        <ArrowDown class="w-3.5 h-3.5" />
      </button>
      <button
        @click="editorStore.bringForward(sel.id)"
        class="p-1.5 rounded"
        :class="btnCls"
        title="Avancer"
      >
        <ArrowUp class="w-3.5 h-3.5" />
      </button>

      <div class="w-px h-5 shrink-0 mx-1" :class="divCls" />

      <!-- Duplicate -->
      <button
        @click="editorStore.duplicateSelected()"
        class="p-1.5 rounded"
        :class="btnCls"
        title="Dupliquer (Ctrl+D)"
      >
        <Copy class="w-3.5 h-3.5" />
      </button>

      <!-- Delete -->
      <button
        @click="editorStore.deleteSelected()"
        class="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        title="Supprimer (Suppr)"
      >
        <Trash2 class="w-3.5 h-3.5" />
      </button>
    </template>
  </div>

  <!-- Placeholder bar when nothing selected -->
  <div
    v-else
    class="flex items-center px-4 h-11 shrink-0 border-b"
    :class="themeStore.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
  >
    <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-600' : 'text-gray-400'">
      Sélectionnez un élément pour modifier ses propriétés
    </span>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import {
  Minus,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  MoveHorizontal,
  Palette,
  Layers,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  RectangleHorizontal,
  RotateCw,
  Link2,
  Group,
  Ungroup,
  ArrowUpToLine,
  ArrowDownToLine,
  Contact2,
  ChevronDown,
  Star,
} from 'lucide-vue-next'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'
import { useFontStore } from '@/stores/fontStore'

const editorStore = useEditorStore()
const themeStore = useThemeStore()
const fontStore = useFontStore()

const sel = computed(() => editorStore.singleSelected)
const selType = computed(() => sel.value?.type ?? null)

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

const dropdownStyle = computed(() => ({
  top: dropdownPos.value.top + 'px',
  left: dropdownPos.value.left + 'px',
}))

// Search results filtered by query
const filteredFonts = computed(() => fontStore.searchFonts(fontQuery.value))

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
  return (fontStore.allFontFamilies || []).filter(
    (f) => !popularSet.has(f) && !customSet.has(f) && !favSet.has(f),
  )
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
  if (!fontDropdownOpen.value) return
  const btn = fontDropdownRef.value
  // The teleported dropdown has no DOM ancestor relationship, so check by data attribute
  const inDropdown = e.target.closest('[data-font-dropdown]')
  if (!btn?.contains(e.target) && !inDropdown) {
    fontDropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onDocClick, true))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick, true))

const alignments = [
  { value: 'left', label: 'Aligner à gauche', icon: AlignLeft },
  { value: 'center', label: 'Centrer', icon: AlignCenter },
  { value: 'right', label: 'Aligner à droite', icon: AlignRight },
]

const isBold = computed(() => sel.value?.fontStyle?.includes('bold'))
const isItalic = computed(() => sel.value?.fontStyle?.includes('italic'))
const isUnderline = computed(() => sel.value?.textDecoration?.includes('underline'))

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

// Ratio lock for W/H inputs
const lockRatio = ref(false)

function commitWidth(newW) {
  if (!sel.value) return
  const w = Math.max(1, newW)
  if (lockRatio.value && sel.value.width && sel.value.height) {
    const ratio = sel.value.height / sel.value.width
    editorStore.updateElementCommit(sel.value.id, { width: w, height: Math.round(w * ratio) })
  } else {
    editorStore.updateElementCommit(sel.value.id, { width: w })
  }
}

function commitHeight(newH) {
  if (!sel.value) return
  const h = Math.max(1, newH)
  if (lockRatio.value && sel.value.width && sel.value.height) {
    const ratio = sel.value.width / sel.value.height
    editorStore.updateElementCommit(sel.value.id, { height: h, width: Math.round(h * ratio) })
  } else {
    editorStore.updateElementCommit(sel.value.id, { height: h })
  }
}

function changeFontSize(delta) {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, {
    fontSize: Math.max(6, (sel.value.fontSize || 16) + delta),
  })
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
  editorStore.updateElementCommit(sel.value.id, {
    textDecoration: cur.includes('underline') ? '' : 'underline',
  })
}

// ── Line / Arrow helpers ───────────────────────────────────────────────────
const lineStyle = computed(() => {
  const d = sel.value?.dash
  if (!d || !d.length) return 'solid'
  if (d[0] <= 2) return 'dotted'
  return 'dashed'
})

function setLineDash(dashArray) {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, { dash: dashArray })
}
</script>
