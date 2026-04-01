<template>
  <aside class="flex shrink-0 h-full">
    <!-- Icon rail (56px) -->
    <div
      class="flex flex-col items-center py-3 gap-1 w-14 shrink-0 border-r h-full"
      :class="themeStore.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="toggleTab(tab.id)"
        class="flex flex-col items-center gap-0.5 p-2 rounded-lg w-11 transition-all"
        :class="
          activeTab === tab.id
            ? 'bg-violet-100 text-violet-600'
            : themeStore.darkMode
              ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
        "
        :title="tab.label"
      >
        <component :is="tab.icon" class="w-5 h-5" />
        <span class="text-[9px] font-medium leading-none">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Slide panel (288px) -->
    <transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 -translate-x-2"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 -translate-x-2"
    >
      <div
        v-if="activeTab"
        class="w-72 shrink-0 flex flex-col border-r overflow-hidden"
        :class="themeStore.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
      >
        <!-- Panel header -->
        <div
          class="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
          :class="themeStore.darkMode ? 'border-gray-800' : 'border-gray-100'"
        >
          <!-- Elements: category detail → show back button -->
          <div v-if="activeTab === 'elements' && activeCategory" class="flex items-center gap-1.5">
            <button
              @click="elementsView = 'browse'; elementsQuery = ''"
              class="p-1 rounded"
              :class="
                themeStore.darkMode
                  ? 'text-gray-400 hover:bg-gray-800'
                  : 'text-gray-400 hover:bg-gray-100'
              "
            >
              <ArrowLeft class="w-4 h-4" />
            </button>
            <h3
              class="font-semibold text-sm"
              :class="themeStore.darkMode ? 'text-gray-100' : 'text-gray-800'"
            >
              {{ activeCategory.name }}
            </h3>
          </div>
          <!-- Default header -->
          <h3
            v-else
            class="font-semibold text-sm"
            :class="themeStore.darkMode ? 'text-gray-100' : 'text-gray-800'"
          >
            {{ currentTab?.label }}
          </h3>
          <button
            @click="activeTab = null"
            class="p-1 rounded"
            :class="
              themeStore.darkMode
                ? 'text-gray-400 hover:bg-gray-800'
                : 'text-gray-400 hover:bg-gray-100'
            "
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Panel content -->
        <div class="flex-1 overflow-y-auto" data-sidebar-panel>
          <!-- ══ INFORMATIONS ══════════════════════════════════════════════════ -->
          <div v-if="activeTab === 'info'" class="pb-4">
            <!-- Standard contact fields -->
            <div class="px-3 pt-3 flex flex-col gap-3">
              <div v-for="field in editorStore.fieldConfig.activeStandardFields" :key="field.role" class="group/field relative">
                <!-- Label / Edit state -->
                <div class="flex items-center justify-between mb-1">
                  <div class="flex-1 min-w-0 pr-2">
                    <input
                      v-if="editingStandardLabel === field.role"
                      v-model="field.label"
                      @blur="editingStandardLabel = null; editorStore.isDirty = true"
                      @keyup.enter="editingStandardLabel = null; $event.target.blur()"
                      class="text-[11px] font-medium px-1 rounded outline-none border transition-colors w-full"
                      :class="themeStore.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800'"
                      autofocus
                    />
                    <label
                      v-else
                      @dblclick="editingStandardLabel = field.role"
                      class="text-[11px] font-medium flex items-center cursor-pointer group-hover/field:text-violet-500 transition-colors"
                      :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
                      title="Double-cliquez pour renommer"
                    >
                      {{ field.label }}
                      <Edit2Icon class="w-3 h-3 ml-1.5 opacity-0 group-hover/field:opacity-50 inline" />
                    </label>
                  </div>
                  <button
                    @click="removeStandardField(field.role)"
                    class="p-0.5 rounded opacity-0 group-hover/field:opacity-100 transition-all text-gray-400 hover:text-red-500"
                    title="Supprimer ce champ"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>

                <input
                  type="text"
                  :value="infoValues[field.role] || ''"
                  @input="handleInfoInput(field.role, $event.target.value)"
                  class="w-full text-xs px-2.5 py-1.5 rounded-lg border outline-none transition-colors"
                  :class="themeStore.darkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600 focus:border-violet-500'
                    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-violet-400'
                  "
                />
              </div>
            </div>

            <!-- Divider -->
            <div
              class="mx-3 h-px my-4"
              :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-gray-100'"
            />

            <!-- Custom fields header -->
            <div class="px-3">
              <div class="flex items-center justify-between mb-2">
                <p
                  class="text-xs font-medium"
                  :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
                >
                  Champs supplémentaires
                </p>
                <button
                  v-if="authStore.isPremium || authStore.isAdmin"
                  @click="showAddCustom = !showAddCustom"
                  class="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                  :class="
                    showAddCustom
                      ? 'bg-violet-100 text-violet-700'
                      : themeStore.darkMode
                        ? 'text-violet-400 hover:bg-gray-800'
                        : 'text-violet-600 hover:bg-violet-50'
                  "
                >
                  <PlusIcon class="w-3 h-3" />
                  Ajouter
                </button>
                <span v-else class="flex items-center gap-1 text-[10px] opacity-60 cursor-default" title="Réservé au plan Premium">
                  <PlusIcon class="w-3 h-3" />
                  Ajouter
                  <span class="text-[8px] font-bold text-amber-500">PRO</span>
                </span>
              </div>

              <!-- Existing custom fields -->
              <div v-for="cf in editorStore.fieldConfig.customFields" :key="cf.id" class="mb-2 group/custom relative">
                <div class="flex items-center justify-between mb-0.5">
                  <div class="flex-1 min-w-0 pr-2">
                    <input
                      v-if="editingCustomLabel === cf.id"
                      v-model="cf.label"
                      @blur="editingCustomLabel = null; syncCustomLabelToExtra(cf.id, cf.label)"
                      @keyup.enter="editingCustomLabel = null; $event.target.blur()"
                      class="text-[10px] font-medium px-1 rounded outline-none border transition-colors w-full"
                      :class="themeStore.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800'"
                      autofocus
                    />
                    <span
                      v-else
                      @dblclick="editingCustomLabel = cf.id"
                      class="text-[10px] font-medium cursor-pointer group-hover/custom:text-violet-500 transition-colors"
                      :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
                      title="Double-cliquez pour renommer"
                      >{{ cf.label }}</span
                    >
                  </div>
                  <button
                    @click="removeCustomField(cf.id)"
                    class="p-0.5 rounded opacity-0 group-hover/custom:opacity-100 transition-colors"
                    :class="
                      themeStore.darkMode
                        ? 'text-gray-600 hover:text-red-400'
                        : 'text-gray-400 hover:text-red-500'
                    "
                    title="Supprimer ce champ"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  :value="cf.value"
                  @input="updateCustomField(cf.id, $event.target.value)"
                  :placeholder="`Valeur de « ${cf.label} »`"
                  class="w-full text-xs px-2.5 py-1.5 rounded-lg border outline-none transition-colors"
                  :class="
                    themeStore.darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600 focus:border-violet-500'
                      : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-violet-400'
                  "
                />
              </div>

              <!-- Add custom field form (inline) -->
              <div
                v-if="showAddCustom"
                class="rounded-lg border p-3 mt-1"
                :class="
                  themeStore.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                "
              >
                <div class="mb-2">
                  <label
                    class="text-[10px] font-medium mb-1 block"
                    :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
                    >Libellé du champ</label
                  >
                  <input
                    v-model="newCustomLabel"
                    type="text"
                    placeholder="Ex : LinkedIn, Fax, Adresse…"
                    class="w-full text-xs px-2.5 py-1.5 rounded border outline-none transition-colors"
                    :class="
                      themeStore.darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-violet-500'
                        : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-violet-400'
                    "
                    @keydown.enter.prevent="confirmAddCustom"
                  />
                </div>
                <div class="mb-3">
                  <label
                    class="text-[10px] font-medium mb-1 block"
                    :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
                    >Valeur</label
                  >
                  <input
                    v-model="newCustomValue"
                    type="text"
                    placeholder="Entrez la valeur…"
                    class="w-full text-xs px-2.5 py-1.5 rounded border outline-none transition-colors"
                    :class="
                      themeStore.darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-violet-500'
                        : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-violet-400'
                    "
                    @keydown.enter.prevent="confirmAddCustom"
                  />
                </div>
                <div class="flex gap-2">
                  <button
                    @click="confirmAddCustom"
                    class="flex-1 py-1.5 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                  >
                    Confirmer
                  </button>
                  <button
                    @click="showAddCustom = false; newCustomLabel = ''; newCustomValue = ''"
                    class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    :class="
                      themeStore.darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    "
                  >
                    Annuler
                  </button>
                </div>
              </div>

              <!-- Available standard fields to restore -->
              <div v-if="availableStandardFields.length > 0 && !showAddCustom" class="mt-4 border-t pt-3" :class="themeStore.darkMode ? 'border-gray-800' : 'border-gray-100'">
                <p class="text-[10px] uppercase font-semibold mb-2" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                  Réajouter un champ standard
                </p>
                <div class="flex flex-wrap gap-1">
                  <button 
                    v-for="sf in availableStandardFields" :key="sf.role"
                    @click="addStandardField(sf)"
                    class="text-[10px] px-2 py-1 border rounded-lg transition-colors hover:text-violet-500 hover:border-violet-500"
                    :class="themeStore.darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'"
                  >
                    + {{ sf.label }}
                  </button>
                </div>
              </div>

              <!-- Help hint -->
              <p
                v-if="!editorStore.contactExtra.length && !showAddCustom"
                class="text-[10px] mt-2 leading-relaxed"
                :class="themeStore.darkMode ? 'text-gray-600' : 'text-gray-400'"
              >
                Ajoutez des champs supplémentaires (LinkedIn, Skype, etc.) qui seront inclus dans
                l'export JSON et le QR code.
              </p>
            </div>
          </div>

          <!-- ══ DESIGN ═══════════════════════════════════════════════════════ -->
          <div v-else-if="activeTab === 'design'" class="pb-4">
            <!-- Background color -->
            <div class="px-3 pt-3">
              <p
                class="text-xs font-medium mb-2"
                :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
              >
                Couleur du fond
              </p>
              <div class="flex items-center gap-2 mb-2">
                <label
                  class="relative w-8 h-8 rounded-lg border-2 overflow-hidden cursor-pointer shrink-0"
                  :style="{
                    borderColor: themeStore.darkMode ? '#4B5563' : '#D1D5DB',
                    backgroundColor: editorStore.currentBackground,
                  }"
                >
                  <input
                    type="color"
                    :value="editorStore.currentBackground"
                    @input="editorStore.setBackground($event.target.value)"
                    class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </label>
                <input
                  type="text"
                  :value="editorStore.currentBackground"
                  @change="editorStore.setBackground($event.target.value)"
                  class="flex-1 text-xs px-2 py-1.5 rounded border font-mono outline-none"
                  :class="
                    themeStore.darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200'
                      : 'bg-white border-gray-200 text-gray-800'
                  "
                  placeholder="#FFFFFF"
                />
              </div>
              <!-- Solid color swatches -->
              <div class="grid grid-cols-8 gap-1 mb-3">
                <button
                  v-for="c in bgPresets"
                  :key="c"
                  @click="editorStore.setBackground(c)"
                  class="aspect-square rounded border-2 transition-all hover:scale-110"
                  :style="{ backgroundColor: c }"
                  :class="
                    editorStore.currentBackground === c
                      ? 'border-violet-500 scale-110'
                      : themeStore.darkMode
                        ? 'border-gray-700'
                        : 'border-gray-200'
                  "
                />
              </div>
            </div>

            <!-- Divider -->
            <div
              class="mx-3 h-px mb-3"
              :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-gray-100'"
            />

            <!-- Templates -->
            <div class="px-3">
              <p
                class="text-xs font-medium mb-2"
                :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
              >
                Modèles
              </p>

              <!-- Search templates -->
              <div class="relative mb-2">
                <Search
                  class="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                  :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
                />
                <input
                  v-model="designQuery"
                  type="text"
                  placeholder="Rechercher un modèle…"
                  class="w-full text-xs pl-7 pr-7 py-1.5 rounded-lg border outline-none transition-colors"
                  :class="
                    themeStore.darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600 focus:border-violet-500'
                      : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-violet-400'
                  "
                />
                <button
                  v-if="designQuery"
                  @click="designQuery = ''"
                  class="absolute right-2 top-1/2 -translate-y-1/2"
                  :class="themeStore.darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Filter pills -->
              <div class="flex gap-1 mb-2">
                <button
                  v-for="f in designFilters"
                  :key="f.value"
                  @click="designFilter = f.value"
                  class="text-[10px] px-2 py-0.5 rounded-full border transition-colors"
                  :class="[
                    designFilter === f.value
                      ? themeStore.darkMode
                        ? 'bg-violet-900/50 border-violet-500 text-violet-300'
                        : 'bg-violet-50 border-violet-400 text-violet-700'
                      : themeStore.darkMode
                        ? 'border-gray-700 text-gray-400 hover:bg-gray-800'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50',
                  ]"
                >{{ f.label }} ({{ f.count }})</button>
              </div>

              <!-- Blank canvas button -->
              <button
                @click="startBlankCanvas()"
                class="w-full flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg border-2 border-dashed transition-all hover:scale-[1.01]"
                :class="
                  themeStore.darkMode
                    ? 'border-gray-700 hover:border-violet-500 hover:bg-gray-800'
                    : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50/50'
                "
              >
                <div
                  class="w-10 h-7 rounded flex items-center justify-center border"
                  :class="
                    themeStore.darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
                  "
                >
                  <PlusIcon
                    class="w-4 h-4"
                    :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
                  />
                </div>
                <div class="text-left">
                  <p
                    class="text-xs font-medium"
                    :class="themeStore.darkMode ? 'text-gray-200' : 'text-gray-700'"
                  >
                    Carte vierge
                  </p>
                  <p
                    class="text-[10px]"
                    :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
                  >
                    Commencer de zéro
                  </p>
                </div>
              </button>

              <!-- No results -->
              <p
                v-if="filteredDesignTemplates.length === 0 && designQuery"
                class="text-xs text-center py-4"
                :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
              >
                Aucun modèle trouvé pour « {{ designQuery }} »
              </p>

              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="tpl in filteredDesignTemplates"
                  :key="tpl.slug"
                  @click="applyDesignTemplate(tpl)"
                  draggable="true"
                  @dragstart="onTemplateDragStart($event, tpl)"
                  class="relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-md group"
                  :class="[
                    themeStore.darkMode
                      ? 'border-gray-700 hover:border-violet-500'
                      : 'border-gray-200 hover:border-violet-400',
                    tpl.isPremium && !authStore.isPremium && !authStore.isAdmin ? 'opacity-60' : ''
                  ]"
                  :title="tpl.name"
                  style="aspect-ratio: 85.6/54"
                >
                  <!-- Live card preview scaled to fit thumbnail -->
                  <div
                    style="
                      position: absolute;
                      top: 0;
                      left: 0;
                      width: 500px;
                      transform-origin: top left;
                      transform: scale(0.256);
                      pointer-events: none;
                    "
                  >
                    <BusinessCard
                      :card="buildPreviewCard(tpl)"
                      :isFlipped="false"
                    />
                  </div>
                  <!-- Hover overlay with name -->
                  <div
                    class="absolute inset-x-0 bottom-0 py-1 bg-black/40 text-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span class="text-[8px] text-white font-medium">{{ tpl.name }}</span>
                  </div>
                  <!-- Premium badge -->
                  <div
                    v-if="tpl.isPremium"
                    class="absolute top-1 right-1 bg-amber-400 rounded-full w-3 h-3 flex items-center justify-center"
                  >
                    <span class="text-[6px] text-amber-900 font-bold">★</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- ══ ÉLÉMENTS ══════════════════════════════════════════════════════ -->
          <div v-else-if="activeTab === 'elements'" class="pb-4">
            <!-- Search -->
            <div class="px-3 pt-3 pb-2">
              <div class="relative">
                <Search
                  class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                  :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
                />
                <input
                  v-model="elementsQuery"
                  type="text"
                  placeholder="Rechercher des éléments..."
                  class="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border outline-none"
                  :class="
                    themeStore.darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600'
                      : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                  "
                />
              </div>
            </div>

            <!-- ── Search results (flat list) ─────────────────────────────── -->
            <template v-if="filteredElements">
              <p
                class="text-xs font-medium px-3 py-1.5"
                :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
              >
                {{ filteredElements.length }} résultat{{ filteredElements.length !== 1 ? 's' : '' }}
              </p>
              <div class="grid grid-cols-4 gap-1.5 px-3">
                <button
                  v-for="el in filteredElements"
                  :key="el.id"
                  @click="addLibraryElement(el)"
                  draggable="true"
                  @dragstart="onLibraryDragStart($event, el)"
                  :title="el.label"
                  class="aspect-square flex items-center justify-center rounded-lg border transition-all hover:scale-105"
                  :class="
                    themeStore.darkMode
                      ? 'border-gray-700 hover:border-violet-500 hover:bg-gray-800 bg-gray-850'
                      : 'border-gray-200 hover:border-violet-400 hover:bg-violet-50 bg-white'
                  "
                >
                  <template v-if="el.type === 'icon'">
                    <IconifyIcon :icon="el.iconId" class="w-7 h-7" />
                  </template>
                  <template v-else>
                    <svg
                      :viewBox="el.shapeType === 'path' ? '0 0 24 24' : '0 0 32 20'"
                      width="28"
                      height="18"
                      class="overflow-visible"
                      fill="none"
                    >
                      <g
                        :fill="themeStore.darkMode ? '#A78BFA' : '#7C3AED'"
                        :stroke="themeStore.darkMode ? '#A78BFA' : '#7C3AED'"
                      >
                        <component :is="el.svgEl" v-bind="el.svgProps" />
                      </g>
                    </svg>
                  </template>
                </button>
              </div>
            </template>

            <!-- ── Browse view (categories grid) ──────────────────────────── -->
            <template v-else-if="elementsView === 'browse'">
              <!-- Categories grid -->

              <p
                class="text-xs font-medium px-3 py-1"
                :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
              >
                Parcourir les catégories
              </p>

              <div class="grid grid-cols-3 gap-2 px-3 pt-1">
                <button
                  v-for="cat in ELEMENT_CATEGORIES"
                  :key="cat.id"
                  @click="elementsView = 'category:' + cat.id"
                  class="flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all hover:scale-[1.03]"
                  :class="
                    themeStore.darkMode
                      ? 'border-gray-700 hover:border-violet-500 bg-gray-800/50'
                      : 'border-gray-100 hover:border-violet-300 bg-white'
                  "
                >
                  <!-- Category thumbnail -->
                  <div
                    class="w-12 h-12 rounded-lg flex items-center justify-center"
                    :class="cat.colorClass"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path v-for="(p, pi) in cat.thumbPaths" :key="pi" :d="p" />
                    </svg>
                  </div>
                  <span
                    class="text-[10px] font-medium leading-tight text-center"
                    :class="themeStore.darkMode ? 'text-gray-300' : 'text-gray-600'"
                  >
                    {{ cat.name }}
                  </span>
                </button>
              </div>
            </template>

            <!-- ── Category detail view ───────────────────────────────────── -->
            <!-- Illustrations: dedicated panel with Iconify icons -->
            <template v-else-if="activeCategory && activeCategory.isIllustration">
              <!-- Search illustrations -->
              <div class="px-3 pt-2 pb-2 shrink-0">
                <div
                  class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border"
                  :class="
                    themeStore.darkMode
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  "
                >
                  <Search class="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  <input
                    v-model="illustrationQuery"
                    type="text"
                    placeholder="Rechercher une illustration…"
                    class="flex-1 bg-transparent text-xs outline-none"
                    :class="themeStore.darkMode ? 'text-gray-200 placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'"
                  />
                  <button v-if="illustrationQuery" @click="illustrationQuery = ''" class="text-gray-400 hover:text-gray-600">
                    <X class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <!-- Category pills -->
              <div v-if="!illustrationQuery" class="px-3 pb-2 shrink-0">
                <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    v-for="cat in ILLUSTRATION_CATEGORIES"
                    :key="cat.id"
                    @click="activeIllustrationCategoryId = cat.id"
                    class="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors whitespace-nowrap"
                    :class="
                      activeIllustrationCategoryId === cat.id
                        ? 'bg-rose-500 text-white'
                        : themeStore.darkMode
                          ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    "
                  >
                    {{ cat.name }}
                  </button>
                </div>
              </div>

              <!-- Illustration grid -->
              <div class="flex-1 overflow-y-auto px-3">
                <div class="grid grid-cols-5 gap-1.5">
                  <button
                    v-for="item in filteredIllustrations"
                    :key="item.id"
                    draggable="true"
                    @dragstart="onIllustrationDragStart($event, item)"
                    @click="addIllustration(item)"
                    class="aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border transition-all cursor-pointer group overflow-hidden"
                    :class="
                      themeStore.darkMode
                        ? 'border-gray-700 hover:border-rose-500 hover:bg-gray-800'
                        : 'border-gray-200 hover:border-rose-400 hover:bg-rose-50'
                    "
                    :title="item.label"
                  >
                    <!-- SVG scene illustration (fichier local) -->
                    <template v-if="item.src">
                      <img
                        :src="item.src"
                        :alt="item.label"
                        class="w-9 h-9 object-contain shrink-0"
                        loading="lazy"
                      />
                    </template>
                    <!-- Iconify icon (CDN on-demand, logo ou sticker) -->
                    <template v-else>
                      <IconifyIcon :icon="item.id" width="22" height="22" class="shrink-0" :style="item.color ? { color: item.color } : undefined" />
                    </template>
                    <span
                      class="text-[7px] leading-none truncate w-full text-center px-0.5"
                      :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
                    >
                      {{ item.label }}
                    </span>
                  </button>
                </div>
                <p
                  v-if="filteredIllustrations.length === 0"
                  class="text-xs text-center py-8"
                  :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
                >
                  Aucune illustration trouvée
                </p>
              </div>
            </template>

            <!-- Standard category (formes, décorations, etc.) -->
            <template v-else-if="activeCategory">
              <div v-for="sub in activeCategoryFiltered" :key="sub.name" class="mb-1">
                <p
                  class="text-xs font-medium px-3 py-1.5"
                  :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
                >
                  {{ sub.name }}
                </p>
                <div class="grid grid-cols-4 gap-1.5 px-3">
                  <button
                    v-for="element in sub.elements"
                    :key="element.id"
                    @click="addLibraryElement(element)"
                    draggable="true"
                    @dragstart="onLibraryDragStart($event, element)"
                    :title="element.label"
                    class="aspect-square flex items-center justify-center rounded-lg border transition-all hover:scale-105"
                    :class="
                      themeStore.darkMode
                        ? 'border-gray-700 hover:border-violet-500 hover:bg-gray-800 bg-gray-850'
                        : 'border-gray-200 hover:border-violet-400 hover:bg-violet-50 bg-white'
                    "
                  >
                    <template v-if="element.type === 'icon'">
                      <IconifyIcon :icon="element.iconId" class="w-7 h-7" />
                    </template>
                    <template v-else>
                    <svg
                      :viewBox="element.shapeType === 'path' ? '0 0 24 24' : '0 0 32 20'"
                      width="28"
                      height="18"
                      class="overflow-visible"
                      fill="none"
                    >
                      <g
                        :fill="themeStore.darkMode ? '#A78BFA' : '#7C3AED'"
                        :stroke="themeStore.darkMode ? '#A78BFA' : '#7C3AED'"
                      >
                        <component :is="element.svgEl" v-bind="element.svgProps" />
                      </g>
                    </svg>
                    </template>
                  </button>
                </div>
              </div>
            </template>
          </div>

          <!-- ══ ICÔNES ════════════════════════════════════════════════════════ -->
          <div v-else-if="activeTab === 'icons'" class="pb-4 flex flex-col h-full">
            <!-- Search -->
            <div class="px-3 pt-3 pb-2 shrink-0">
              <div
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border"
                :class="
                  themeStore.darkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gray-50 border-gray-200'
                "
              >
                <Search class="w-3.5 h-3.5 shrink-0 text-gray-400" />
                <input
                  v-model="iconQuery"
                  type="text"
                  placeholder="Rechercher une icône…"
                  class="flex-1 bg-transparent text-xs outline-none"
                  :class="themeStore.darkMode ? 'text-gray-200 placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'"
                />
                <button v-if="iconQuery" @click="iconQuery = ''" class="text-gray-400 hover:text-gray-600">
                  <X class="w-3 h-3" />
                </button>
              </div>
            </div>

            <!-- Category pills (hidden during search) -->
            <div v-if="!iconQuery" class="px-3 pb-2 shrink-0">
              <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  v-for="cat in ICON_CATEGORIES"
                  :key="cat.id"
                  @click="activeIconCategoryId = cat.id"
                  class="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors whitespace-nowrap"
                  :class="
                    activeIconCategoryId === cat.id
                      ? 'bg-violet-600 text-white'
                      : themeStore.darkMode
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  "
                >
                  {{ cat.name }}
                </button>
              </div>
            </div>

            <!-- Icon grid -->
            <div class="flex-1 overflow-y-auto px-3">
              <div class="grid grid-cols-5 gap-1.5">
                <button
                  v-for="icon in filteredIcons"
                  :key="icon.id"
                  draggable="true"
                  @dragstart="onIconDragStart($event, icon, icon.id.startsWith('mdi:') ? {} : { colorful: true })"
                  @click="editorStore.addIconElement(icon, icon.id.startsWith('mdi:') ? {} : { colorful: true })"
                  class="aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border transition-all cursor-pointer group overflow-hidden"
                  :class="
                    themeStore.darkMode
                      ? 'border-gray-700 hover:border-violet-500 hover:bg-gray-800'
                      : 'border-gray-200 hover:border-violet-400 hover:bg-violet-50'
                  "
                  :title="icon.label"
                >
                  <IconifyIcon
                    :icon="icon.id"
                    width="20"
                    height="20"
                    class="shrink-0 transition-colors"
                    :class="
                      icon.id.startsWith('mdi:')
                        ? themeStore.darkMode
                          ? 'text-gray-400 group-hover:text-violet-400'
                          : 'text-gray-600 group-hover:text-violet-600'
                        : ''
                    "
                  />
                  <span
                    class="text-[8px] leading-none truncate w-full text-center px-0.5"
                    :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
                  >
                    {{ icon.label }}
                  </span>
                </button>
              </div>
              <p
                v-if="filteredIcons.length === 0"
                class="text-xs text-center py-8"
                :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
              >
                Aucune icône trouvée
              </p>
            </div>
          </div>

          <!-- ══ TEXTE ═════════════════════════════════════════════════════════ -->
          <div v-else-if="activeTab === 'text'" class="pb-4">
            <!-- Main presets -->
            <div class="px-3 pt-3 flex flex-col gap-1.5 mb-3">
              <button
                v-for="preset in mainTextPresets"
                :key="preset.label"
                @click="addText(preset)"
                draggable="true"
                @dragstart="onTextDragStart($event, preset)"
                class="w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all hover:scale-[1.01]"
                :class="
                  themeStore.darkMode
                    ? 'border-gray-700 hover:border-violet-500 hover:bg-gray-800'
                    : 'border-gray-200 hover:border-violet-400 hover:bg-violet-50/50'
                "
                :style="{
                  fontFamily: preset.fontFamily,
                  fontSize: preset.previewSize + 'px',
                  fontWeight: preset.weight,
                }"
              >
                <span :class="themeStore.darkMode ? 'text-gray-100' : 'text-gray-800'">{{
                  preset.label
                }}</span>
              </button>
            </div>

            <div
              class="mx-3 h-px mb-3"
              :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-gray-100'"
            />

            <!-- Font search -->
            <div class="px-3 mb-3">
              <!-- Banner: selected text element mode -->
              <div
                v-if="selectedTextEl || selectedTextEls.length > 1"
                class="mb-2 px-2 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                :class="themeStore.darkMode
                  ? 'bg-violet-900/30 text-violet-300 border border-violet-700/50'
                  : 'bg-violet-50 text-violet-700 border border-violet-200'"
              >
                <Type class="w-3 h-3 shrink-0" />
                <span>Cliquez sur une police pour modifier {{ selectedTextEls.length > 1 ? 'les éléments sélectionnés' : 'l\'élément sélectionné' }}</span>
              </div>
              <div class="flex items-center justify-between mb-2">
                <p
                  class="text-xs font-medium"
                  :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
                >
                  Polices
                </p>
                <!-- Upload custom font button -->
                <button
                  v-if="authStore.isPremium || authStore.isAdmin"
                  @click="triggerFontUpload"
                  class="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border transition-colors"
                  :class="
                    themeStore.darkMode
                      ? 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400'
                      : 'border-gray-300 text-gray-500 hover:border-violet-400 hover:text-violet-600'
                  "
                  title="Importer une police personnalisée (.ttf, .otf, .woff, .woff2)"
                >
                  <Upload class="w-2.5 h-2.5" />
                  Importer
                </button>
                <span v-else class="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border opacity-50 cursor-default"
                  :class="themeStore.darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400'"
                  title="Réservé au plan Premium"
                >
                  <Upload class="w-2.5 h-2.5" />
                  Importer
                  <span class="text-[8px] font-bold text-amber-500">PRO</span>
                </span>
                <input
                  ref="fontFileInputRef"
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  class="hidden"
                  @change="onFontFileSelected"
                />
              </div>

              <!-- Custom fonts section -->
              <div v-if="fontStore.customFonts.length" class="mb-2">
                <p
                  class="text-[9px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1"
                  :class="themeStore.darkMode ? 'text-violet-400' : 'text-violet-500'"
                >
                  <span>Mes polices</span>
                  <span class="opacity-60">({{ fontStore.customFonts.length }})</span>
                </p>
                <div class="flex flex-col gap-0.5">
                  <div
                    v-for="cf in fontStore.customFonts"
                    :key="'custom-' + cf.name"
                    class="flex items-center gap-1 group"
                  >
                    <button
                      @click="handleFontClick(cf.name)"
                      class="flex-1 text-left px-2 py-1.5 rounded text-sm transition-colors"
                      :class="
                        themeStore.darkMode
                          ? 'hover:bg-gray-800 text-gray-300'
                          : 'hover:bg-violet-50 text-gray-700'
                      "
                      :style="{ fontFamily: cf.name }"
                    >
                      {{ cf.name }}
                    </button>
                    <button
                      @click="fontStore.removeCustomFont(cf.name)"
                      class="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:text-red-500 transition-opacity shrink-0"
                      title="Supprimer cette police"
                    >
                      <Trash2 class="w-3 h-3" />
                    </button>
                    <button
                      @click.stop="fontStore.toggleFavorite(cf.name)"
                      class="p-1 rounded shrink-0 transition-opacity"
                      :class="fontStore.isFavorite(cf.name) ? 'text-yellow-400 opacity-100' : 'opacity-0 group-hover:opacity-60 ' + (themeStore.darkMode ? 'text-gray-500 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-400')"
                      :title="fontStore.isFavorite(cf.name) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                    >
                      <Star class="w-3 h-3" :fill="fontStore.isFavorite(cf.name) ? 'currentColor' : 'none'" />
                    </button>
                  </div>
                </div>
                <div class="h-px my-2" :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-gray-100'" />
              </div>

              <!-- Upload error/warning message -->
              <p v-if="fontUploadMsg" class="text-[10px] mb-2 px-1 py-1 rounded" :class="fontUploadMsg.type === 'error' ? (themeStore.darkMode ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50') : (themeStore.darkMode ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-700 bg-yellow-50')">
                {{ fontUploadMsg.text }}
              </p>
              <div class="relative mb-2">
                <Search
                  class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                  :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
                />
                <input
                  v-model="fontQuery"
                  type="text"
                  placeholder="Rechercher une police..."
                  class="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border outline-none"
                  :class="
                    themeStore.darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600'
                      : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                  "
                />
              </div>
              <div class="flex flex-col gap-1 max-h-64 overflow-y-auto">
                <div
                  v-for="font in filteredFonts"
                  :key="font"
                  class="flex items-center group"
                >
                  <button
                    @mouseenter="fontStore.loadFont(font)"
                    @click="handleFontClick(font)"
                    class="flex-1 text-left px-2 py-1.5 rounded text-sm transition-colors"
                    :class="
                      themeStore.darkMode
                        ? 'border-transparent hover:bg-gray-800 text-gray-300'
                        : 'border-transparent hover:bg-gray-50 text-gray-700'
                    "
                    :style="{ fontFamily: fontStore.loadedFonts.has(font) ? font : 'inherit' }"
                  >
                    {{ font }}
                  </button>
                  <button
                    @click.stop="fontStore.toggleFavorite(font)"
                    class="p-1 rounded shrink-0 transition-opacity"
                    :class="fontStore.isFavorite(font) ? 'text-yellow-400 opacity-100' : 'opacity-0 group-hover:opacity-60 ' + (themeStore.darkMode ? 'text-gray-500 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-400')"
                    :title="fontStore.isFavorite(font) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                  >
                    <Star class="w-3 h-3" :fill="fontStore.isFavorite(font) ? 'currentColor' : 'none'" />
                  </button>
                </div>
              </div>
              <p v-if="!authStore.isPremium && !authStore.isAdmin" class="text-[9px] mt-1 px-1 text-amber-500">
                Limité à {{ MAX_FREE_FONTS }} polices — passez au Premium pour 300+
              </p>
            </div>

            <div
              class="mx-3 h-px mb-3"
              :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-gray-100'"
            />

            <!-- Font combinations -->
            <div class="px-3 mb-3">
              <p
                class="text-xs font-medium mb-2 flex items-center gap-1"
                :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
              >
                Combinaisons de polices
                <span class="font-normal opacity-60 ml-1">(appliqué à tout le texte)</span>
                <span v-if="!authStore.isPremium && !authStore.isAdmin" class="text-[8px] font-bold text-amber-500 ml-auto">PRO</span>
              </p>
              <div class="flex flex-col gap-1.5" :class="!authStore.isPremium && !authStore.isAdmin ? 'opacity-50 pointer-events-none' : ''">
                <button
                  v-for="combo in fontCombos"
                  :key="combo.name"
                  @mouseenter="preloadCombo(combo)"
                  @click="applyFontCombo(combo)"
                  class="w-full text-left px-3 py-2 rounded-lg border transition-all hover:scale-[1.01]"
                  :class="
                    themeStore.darkMode
                      ? 'border-gray-700 hover:border-violet-500 hover:bg-gray-800'
                      : 'border-gray-200 hover:border-violet-400 hover:bg-violet-50/50'
                  "
                >
                  <!-- Preview row: heading sample + body sample -->
                  <div class="flex items-baseline gap-2 mb-0.5">
                    <span
                      :style="{
                        fontFamily: fontStore.loadedFonts.has(combo.heading) ? combo.heading : 'inherit',
                        fontWeight: combo.hw,
                        fontSize: '15px',
                      }"
                      :class="themeStore.darkMode ? 'text-gray-100' : 'text-gray-800'"
                    >Aa</span>
                    <span
                      :style="{
                        fontFamily: fontStore.loadedFonts.has(combo.body) ? combo.body : 'inherit',
                        fontWeight: combo.bw,
                        fontSize: '12px',
                      }"
                      :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
                    >Aa</span>
                    <span
                      class="ml-auto text-xs font-medium"
                      :class="themeStore.darkMode ? 'text-gray-200' : 'text-gray-700'"
                    >{{ combo.name }}</span>
                  </div>
                  <!-- Font names row -->
                  <div
                    class="text-[9px] tracking-wide"
                    :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
                  >
                    {{ combo.heading }} &amp; {{ combo.body }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Recently used -->
            <div v-if="recentFonts.length" class="px-3">
              <p
                class="text-xs font-medium mb-2"
                :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
              >
                Récemment utilisées
              </p>
              <div class="flex flex-col gap-1">
                <div
                  v-for="font in recentFonts"
                  :key="'recent-' + font"
                  class="flex items-center group"
                >
                  <button
                    @click="handleFontClick(font)"
                    class="flex-1 text-left px-2 py-1.5 rounded text-sm transition-colors"
                    :class="
                      themeStore.darkMode
                        ? 'hover:bg-gray-800 text-gray-300'
                        : 'hover:bg-gray-50 text-gray-700'
                    "
                    :style="{ fontFamily: font }"
                  >
                    {{ font }}
                  </button>
                  <button
                    @click.stop="fontStore.toggleFavorite(font)"
                    class="p-1 rounded shrink-0 transition-opacity"
                    :class="fontStore.isFavorite(font) ? 'text-yellow-400 opacity-100' : 'opacity-0 group-hover:opacity-60 ' + (themeStore.darkMode ? 'text-gray-500 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-400')"
                    :title="fontStore.isFavorite(font) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                  >
                    <Star class="w-3 h-3" :fill="fontStore.isFavorite(font) ? 'currentColor' : 'none'" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ══ IMPORTER ══════════════════════════════════════════════════════ -->
          <div v-else-if="activeTab === 'import'" class="p-3 flex flex-col gap-3">
            <!-- Drop zone -->
            <div
              class="relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 transition-colors cursor-pointer"
              :class="
                isDragOver
                  ? 'border-violet-500 bg-violet-50'
                  : themeStore.darkMode
                    ? 'border-gray-700 hover:border-gray-600 bg-gray-800'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              "
              @dragover.prevent="isDragOver = true"
              @dragleave="isDragOver = false"
              @drop.prevent="onFileDrop"
              @click="fileInputRef?.click()"
            >
              <div
                class="p-3 rounded-full"
                :class="themeStore.darkMode ? 'bg-gray-700' : 'bg-white shadow-sm'"
              >
                <Upload
                  class="w-6 h-6"
                  :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-400'"
                />
              </div>
              <div class="text-center">
                <p
                  class="text-sm font-medium"
                  :class="themeStore.darkMode ? 'text-gray-200' : 'text-gray-700'"
                >
                  Glissez vos fichiers ici
                </p>
                <p
                  class="text-xs mt-0.5"
                  :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'"
                >
                  ou cliquez pour sélectionner
                </p>
              </div>
              <p
                class="text-[10px]"
                :class="themeStore.darkMode ? 'text-gray-600' : 'text-gray-400'"
              >
                PNG, JPG, SVG, WebP — max 5 Mo
              </p>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="onFileInput"
              />
            </div>

            <!-- Imported files -->
            <div v-if="importedImages.length">
              <p
                class="text-xs font-medium mb-2"
                :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
              >
                Médias importés
              </p>
              <div class="grid grid-cols-2 gap-2">
                <div
                  v-for="(img, i) in importedImages"
                  :key="i"
                  class="relative group flex flex-col gap-1"
                >
                  <!-- Thumbnail -->
                  <div
                    @click="insertImage(img)"
                    draggable="true"
                    @dragstart="onImageDragStart($event, img)"
                    class="aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-105 hover:border-violet-400 cursor-pointer relative"
                    :class="themeStore.darkMode ? 'border-gray-700' : 'border-gray-200'"
                    title="Cliquer pour insérer"
                  >
                    <img :src="img.dataUrl" :alt="img.name" class="w-full h-full object-cover" />
                    <div
                      class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Plus class="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <!-- Delete button -->
                  <button
                    @click.stop="removeImportedImage(i)"
                    class="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Supprimer"
                  >
                    <X class="w-3 h-3" />
                  </button>
                  <!-- Label select -->
                  <select
                    v-model="img.label"
                    class="w-full text-[10px] rounded border px-1 py-0.5 outline-none"
                    :class="
                      themeStore.darkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-300'
                        : 'bg-white border-gray-200 text-gray-700'
                    "
                  >
                    <option value="logo">Logo</option>
                    <option value="avatar">Photo</option>
                    <option value="background">Arrière-plan</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Tips -->
            <div class="rounded-lg p-3" :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-blue-50'">
              <p
                class="text-xs font-medium mb-1"
                :class="themeStore.darkMode ? 'text-blue-300' : 'text-blue-700'"
              >
                Conseils
              </p>
              <ul
                class="text-xs space-y-1 list-disc list-inside"
                :class="themeStore.darkMode ? 'text-gray-400' : 'text-blue-600'"
              >
                <li>Utilisez des PNG transparents pour les logos</li>
                <li>Préférez les images haute résolution</li>
                <li>Format recommandé : 300 DPI minimum</li>
              </ul>
            </div>
          </div>

          <!-- ══ QR CODE ═══════════════════════════════════════════════════════ -->
          <div v-else-if="activeTab === 'qr'" class="p-3 flex flex-col gap-4 overflow-y-auto">

            <!-- Mode indicator: édition vs création -->
            <div
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
              :class="selectedQRElement
                ? (themeStore.darkMode ? 'bg-violet-900/40 text-violet-300' : 'bg-violet-50 text-violet-600')
                : (themeStore.darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500')"
            >
              <span
                class="w-1.5 h-1.5 rounded-full shrink-0"
                :class="selectedQRElement ? 'bg-violet-400 animate-pulse' : 'bg-gray-400'"
              />
              {{ selectedQRElement ? 'Édition du QR sélectionné' : 'Création d\'un nouveau QR' }}
            </div>

            <!-- Section: Champs inclus -->
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wider mb-2"
                :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                Champs inclus dans le QR
              </p>
              <div class="flex flex-col gap-1">
                <label
                  v-for="key in QR_FIELD_KEYS"
                  :key="key"
                  class="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors"
                  :class="themeStore.darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'"
                  @click.prevent="qrConfig.qrFields[key] = !qrConfig.qrFields[key]"
                >
                  <!-- Modern pill toggle -->
                  <button
                    type="button"
                    :class="[
                      'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200',
                      qrConfig.qrFields[key] ? 'bg-violet-500' : (themeStore.darkMode ? 'bg-gray-700' : 'bg-gray-300'),
                    ]"
                  >
                    <span
                      :class="[
                        'pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200',
                        qrConfig.qrFields[key] ? 'translate-x-[18px]' : 'translate-x-0.5',
                      ]"
                    />
                  </button>
                  <span class="text-xs font-medium w-20 shrink-0"
                    :class="themeStore.darkMode ? 'text-gray-300' : 'text-gray-700'"
                  >{{ ROLE_LABELS[key] }}</span>
                  <span class="text-[10px] truncate flex-1"
                    :class="editorStore.contactData[key]
                      ? (themeStore.darkMode ? 'text-gray-400' : 'text-gray-500')
                      : (themeStore.darkMode ? 'text-gray-600' : 'text-gray-300')"
                  >{{ editorStore.contactData[key] || '—' }}</span>
                </label>
              </div>

              <!-- Champs personnalisés ajoutés par l'utilisateur -->
              <template v-if="editorStore.contactExtra && editorStore.contactExtra.length">
                <div
                  class="mt-1 pt-2 border-t"
                  :class="themeStore.darkMode ? 'border-gray-800' : 'border-gray-100'"
                >
                  <p
                    class="text-[9px] font-semibold uppercase tracking-wider mb-1 px-2"
                    :class="themeStore.darkMode ? 'text-gray-600' : 'text-gray-400'"
                  >
                    Champs personnalisés
                  </p>
                  <label
                    v-for="item in editorStore.contactExtra"
                    :key="item.id"
                    class="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors"
                    :class="themeStore.darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'"
                    @click.prevent="qrConfig.qrFields[item.id] = !qrConfig.qrFields[item.id]"
                  >
                    <button
                      type="button"
                      :class="[
                        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200',
                        qrConfig.qrFields[item.id] ? 'bg-violet-500' : (themeStore.darkMode ? 'bg-gray-700' : 'bg-gray-300'),
                      ]"
                    >
                      <span
                        :class="[
                          'pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200',
                          qrConfig.qrFields[item.id] ? 'translate-x-[18px]' : 'translate-x-0.5',
                        ]"
                      />
                    </button>
                    <span
                      class="text-xs font-medium w-20 shrink-0 truncate"
                      :class="themeStore.darkMode ? 'text-gray-300' : 'text-gray-700'"
                    >{{ item.label }}</span>
                    <span
                      class="text-[10px] truncate flex-1"
                      :class="item.value
                        ? (themeStore.darkMode ? 'text-gray-400' : 'text-gray-500')
                        : (themeStore.darkMode ? 'text-gray-600' : 'text-gray-300')"
                    >{{ item.value || '—' }}</span>
                  </label>
                </div>
              </template>
            </div>

            <!-- Section: Mode -->
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wider mb-2"
                :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                Apparence
              </p>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="mode in [{ value: 'standard', label: 'Standard', desc: 'Classique' }, { value: 'styled', label: 'Stylé', desc: 'Personnalisé' }]"
                  :key="mode.value"
                  @click="mode.value === 'styled' && !authStore.isPremium && !authStore.isAdmin ? null : (qrConfig.qrMode = mode.value)"
                  class="flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center relative"
                  :class="[
                    qrConfig.qrMode === mode.value
                      ? 'border-violet-500 bg-violet-500/10 text-violet-500'
                      : themeStore.darkMode
                        ? 'border-gray-700 text-gray-400 hover:border-gray-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300',
                    mode.value === 'styled' && !authStore.isPremium && !authStore.isAdmin ? 'opacity-60 cursor-not-allowed' : ''
                  ]"
                >
                  <QrCode class="w-5 h-5" />
                  <span class="text-xs font-semibold">{{ mode.label }}</span>
                  <span class="text-[9px] opacity-70">{{ mode.desc }}</span>
                  <span v-if="mode.value === 'styled' && !authStore.isPremium && !authStore.isAdmin" class="absolute -top-1.5 -right-1.5 text-[8px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">PRO</span>
                </button>
              </div>
            </div>

            <!-- Section: Couleurs -->
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wider mb-2"
                :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                Couleurs
              </p>
              <div class="flex flex-col gap-2">
                <label class="flex items-center justify-between gap-2">
                  <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-300' : 'text-gray-600'">Avant-plan</span>
                  <div class="flex items-center gap-2">
                    <input type="color" v-model="qrConfig.qrForeground"
                      class="w-8 h-7 rounded cursor-pointer border-0 bg-transparent" />
                    <span class="text-[10px] font-mono" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">{{ qrConfig.qrForeground }}</span>
                  </div>
                </label>
                <label class="flex items-center justify-between gap-2">
                  <span class="text-xs" :class="themeStore.darkMode ? 'text-gray-300' : 'text-gray-600'">Arrière-plan</span>
                  <div class="flex items-center gap-2">
                    <input type="color" v-model="qrConfig.qrBackground"
                      class="w-8 h-7 rounded cursor-pointer border-0 bg-transparent" />
                    <span class="text-[10px] font-mono" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">{{ qrConfig.qrBackground }}</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Section: Style des points (styled only) -->
            <template v-if="qrConfig.qrMode === 'styled'">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-wider mb-2"
                  :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                  Style des points
                </p>
                <div class="grid grid-cols-3 gap-1">
                  <button
                    v-for="s in QR_DOT_STYLES" :key="s.value"
                    @click="qrConfig.qrDotStyle = s.value"
                    class="text-[10px] px-1 py-1.5 rounded-lg border transition-colors text-center"
                    :class="qrConfig.qrDotStyle === s.value
                      ? 'border-violet-500 bg-violet-500/10 text-violet-500 font-semibold'
                      : themeStore.darkMode
                        ? 'border-gray-700 text-gray-400 hover:border-gray-500'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'"
                  >{{ s.label }}</button>
                </div>
              </div>

              <div>
                <p class="text-[10px] font-semibold uppercase tracking-wider mb-2"
                  :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                  Coin externe
                </p>
                <div class="grid grid-cols-3 gap-1">
                  <button
                    v-for="s in QR_CORNER_SQ_STYLES" :key="s.value"
                    @click="qrConfig.qrCornerSquareStyle = s.value"
                    class="text-[10px] px-1 py-1.5 rounded-lg border transition-colors text-center"
                    :class="qrConfig.qrCornerSquareStyle === s.value
                      ? 'border-violet-500 bg-violet-500/10 text-violet-500 font-semibold'
                      : themeStore.darkMode
                        ? 'border-gray-700 text-gray-400 hover:border-gray-500'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'"
                  >{{ s.label }}</button>
                </div>
              </div>

              <div>
                <p class="text-[10px] font-semibold uppercase tracking-wider mb-2"
                  :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                  Coin interne
                </p>
                <div class="grid grid-cols-3 gap-1">
                  <button
                    v-for="s in QR_CORNER_DOT_STYLES" :key="s.value"
                    @click="qrConfig.qrCornerDotStyle = s.value"
                    class="text-[10px] px-1 py-1.5 rounded-lg border transition-colors text-center"
                    :class="qrConfig.qrCornerDotStyle === s.value
                      ? 'border-violet-500 bg-violet-500/10 text-violet-500 font-semibold'
                      : themeStore.darkMode
                        ? 'border-gray-700 text-gray-400 hover:border-gray-500'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'"
                  >{{ s.label }}</button>
                </div>
              </div>

              <!-- Logo -->
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-wider mb-2"
                  :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                  Logo (optionnel)
                </p>
                <input type="file" ref="qrLogoInputRef" class="hidden" accept="image/*" @change="handleQRLogoUpload" />
                <div v-if="qrConfig.qrLogoSrc" class="flex items-center gap-2 mb-2">
                  <img :src="qrConfig.qrLogoSrc" class="w-10 h-10 object-contain rounded border"
                    :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-200'" />
                  <button @click="qrConfig.qrLogoSrc = ''"
                    class="text-[10px] text-red-400 hover:text-red-300 underline">Retirer</button>
                </div>
                <button
                  @click="qrLogoInputRef?.click()"
                  class="w-full text-xs py-2 rounded-lg border border-dashed transition-colors"
                  :class="themeStore.darkMode
                    ? 'border-gray-600 text-gray-400 hover:border-violet-500 hover:text-violet-400'
                    : 'border-gray-300 text-gray-500 hover:border-violet-400 hover:text-violet-500'"
                >
                  {{ qrConfig.qrLogoSrc ? 'Changer le logo' : '+ Ajouter un logo' }}
                </button>
              </div>

              <!-- Margin -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <p class="text-[10px] font-semibold uppercase tracking-wider"
                    :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                    Marge
                  </p>
                  <span class="text-[10px]" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">
                    {{ qrConfig.qrMargin }}px
                  </span>
                </div>
                <input type="range" min="0" max="30" step="1"
                  v-model.number="qrConfig.qrMargin"
                  class="range range-xs range-primary w-full" />
              </div>
            </template>

            <!-- Section: Correction d'erreur -->
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wider mb-2"
                :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                Correction d'erreur
              </p>
              <div class="grid grid-cols-4 gap-1">
                <button
                  v-for="lvl in QR_ERROR_LEVELS" :key="lvl.value"
                  @click="(lvl.value !== 'L' && !authStore.isPremium && !authStore.isAdmin) ? null : (qrConfig.qrErrorCorrection = lvl.value)"
                  class="flex flex-col items-center py-1.5 rounded-lg border transition-colors relative"
                  :class="[
                    qrConfig.qrErrorCorrection === lvl.value
                      ? 'border-violet-500 bg-violet-500/10 text-violet-500'
                      : themeStore.darkMode
                        ? 'border-gray-700 text-gray-400 hover:border-gray-500'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300',
                    lvl.value !== 'L' && !authStore.isPremium && !authStore.isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                  ]"
                >
                  <span class="text-xs font-bold">{{ lvl.label }}</span>
                  <span class="text-[9px] opacity-70">{{ lvl.desc }}</span>
                  <span v-if="lvl.value !== 'L' && !authStore.isPremium && !authStore.isAdmin" class="absolute -top-1 -right-1 text-[7px] font-bold bg-amber-500 text-white px-1 rounded-full">PRO</span>
                </button>
              </div>
              <p class="text-[9px] mt-1" :class="themeStore.darkMode ? 'text-gray-600' : 'text-gray-400'">
                Niveau H recommandé si vous ajoutez un logo.
              </p>
            </div>

            <!-- Bouton insertion (création) ou badge édition -->
            <div v-if="selectedQRElement"
              class="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-medium border"
              :class="themeStore.darkMode
                ? 'border-violet-700 bg-violet-900/30 text-violet-300'
                : 'border-violet-200 bg-violet-50 text-violet-600'"
            >
              <QrCode class="w-4 h-4 animate-pulse" />
              Modification en cours
            </div>
            <button
              v-else
              @click="insertQR()"
              class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all bg-violet-600 hover:bg-violet-500 text-white shadow"
            >
              <QrCode class="w-4 h-4" />
              Insérer le QR code
            </button>
          </div>

          <!-- ══ OUTILS ════════════════════════════════════════════════════════ -->
          <div v-else-if="activeTab === 'tools'" class="p-3 flex flex-col gap-4 overflow-y-auto">

            <!-- ── Section: Affichage ────────────────────────────────────── -->
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wider mb-2"
                :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                Affichage
              </p>
              <div class="flex flex-col gap-0.5">
                <label
                  v-for="opt in displayOptions"
                  :key="opt.key"
                  class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors"
                  :class="[
                    themeStore.darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50',
                    PRO_TOOL_KEYS.has(opt.key) && !authStore.isPremium && !authStore.isAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  ]"
                >
                  <input
                    type="checkbox"
                    :checked="editorStore[opt.key]"
                    @change="PRO_TOOL_KEYS.has(opt.key) && !authStore.isPremium && !authStore.isAdmin ? $event.target.checked = editorStore[opt.key] : (editorStore[opt.key] = $event.target.checked)"
                    class="rounded accent-violet-600 w-3.5 h-3.5"
                    :disabled="PRO_TOOL_KEYS.has(opt.key) && !authStore.isPremium && !authStore.isAdmin"
                  />
                  <component
                    :is="opt.icon"
                    class="w-3.5 h-3.5 shrink-0"
                    :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
                  />
                  <span class="text-xs"
                    :class="themeStore.darkMode ? 'text-gray-300' : 'text-gray-700'"
                  >{{ opt.label }}</span>
                  <span v-if="PRO_TOOL_KEYS.has(opt.key) && !authStore.isPremium && !authStore.isAdmin" class="ml-auto text-[8px] font-bold text-amber-500">PRO</span>
                </label>
              </div>

              <!-- Grid size selector (visible when grid is on) -->
              <div v-if="editorStore.showGrid" class="mt-2 px-2">
                <p class="text-[10px] mb-1.5"
                  :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                  Taille de la grille
                </p>
                <div class="flex gap-1">
                  <button
                    v-for="size in [10, 20, 40]"
                    :key="size"
                    @click="editorStore.gridSize = size"
                    class="flex-1 text-xs py-1 rounded-md border transition-colors"
                    :class="editorStore.gridSize === size
                      ? (themeStore.darkMode ? 'bg-violet-600 border-violet-500 text-white' : 'bg-violet-500 border-violet-400 text-white')
                      : (themeStore.darkMode ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-200 text-gray-600 hover:border-gray-300')"
                  >
                    {{ size }}px
                  </button>
                </div>
              </div>
            </div>

            <div class="h-px" :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-gray-100'" />

            <!-- ── Section: Alignement & Distribution ────────────────────── -->
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wider mb-2"
                :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                Alignement
                <span v-if="editorStore.selectedIds.length < 1" class="font-normal normal-case ml-1 opacity-60">(sélectionnez un élément)</span>
              </p>
              <!-- 6 alignment buttons in 2 rows -->
              <div class="grid grid-cols-6 gap-1 mb-2">
                <button
                  v-for="al in alignButtons"
                  :key="al.type"
                  @click="onAlignClick(al.type)"
                  :disabled="editorStore.selectedIds.length < 1"
                  class="flex items-center justify-center p-1.5 rounded-md border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  :class="themeStore.darkMode
                    ? 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400 hover:bg-gray-800'
                    : 'border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50'"
                  :title="al.title"
                >
                  <component :is="al.icon" class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Distribution (3+ required) -->
              <p class="text-[10px] font-semibold uppercase tracking-wider mb-1.5 mt-3"
                :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                Distribution
                <span v-if="editorStore.selectedIds.length < 3" class="font-normal normal-case ml-1 opacity-60">(3+ éléments)</span>
              </p>
              <div class="grid grid-cols-2 gap-1">
                <button
                  @click="editorStore.distributeElements(editorStore.selectedIds, 'horizontal')"
                  :disabled="editorStore.selectedIds.length < 3"
                  class="flex items-center gap-2 px-2 py-1.5 rounded-md border text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  :class="themeStore.darkMode
                    ? 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400'
                    : 'border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600'"
                  title="Distribuer horizontalement"
                >
                  <AlignHorizontalDistributeCenter class="w-3.5 h-3.5 shrink-0" />
                  Horizontal
                </button>
                <button
                  @click="editorStore.distributeElements(editorStore.selectedIds, 'vertical')"
                  :disabled="editorStore.selectedIds.length < 3"
                  class="flex items-center gap-2 px-2 py-1.5 rounded-md border text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  :class="themeStore.darkMode
                    ? 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400'
                    : 'border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600'"
                  title="Distribuer verticalement"
                >
                  <AlignVerticalDistributeCenter class="w-3.5 h-3.5 shrink-0" />
                  Vertical
                </button>
              </div>
            </div>

            <div class="h-px" :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-gray-100'" />

            <!-- ── Section: Taille & Position ────────────────────────────── -->
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wider mb-2"
                :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                Taille & Position
                <span v-if="!editorStore.singleSelected && editorStore.selectedIds.length < 2" class="font-normal normal-case ml-1 opacity-60">(sélectionnez un élément)</span>
              </p>

              <!-- Position X/Y (single element only) -->
              <div v-if="editorStore.singleSelected" class="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label class="text-[10px] mb-0.5 block" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">X</label>
                  <input
                    type="number"
                    :value="Math.round(editorStore.singleSelected.x || 0)"
                    @change="editorStore.updateElementCommit(editorStore.singleSelected.id, { x: +$event.target.value })"
                    class="w-full text-xs px-2 py-1 rounded border outline-none"
                    :class="themeStore.darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200'
                      : 'bg-gray-50 border-gray-200 text-gray-800'"
                  />
                </div>
                <div>
                  <label class="text-[10px] mb-0.5 block" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">Y</label>
                  <input
                    type="number"
                    :value="Math.round(editorStore.singleSelected.y || 0)"
                    @change="editorStore.updateElementCommit(editorStore.singleSelected.id, { y: +$event.target.value })"
                    class="w-full text-xs px-2 py-1 rounded border outline-none"
                    :class="themeStore.darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200'
                      : 'bg-gray-50 border-gray-200 text-gray-800'"
                  />
                </div>
              </div>

              <!-- Width/Height (single element only) -->
              <div v-if="editorStore.singleSelected" class="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label class="text-[10px] mb-0.5 block" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">L</label>
                  <input
                    type="number"
                    :value="Math.round(editorStore.singleSelected.width || 0)"
                    @change="editorStore.updateElementCommit(editorStore.singleSelected.id, { width: Math.max(1, +$event.target.value) })"
                    class="w-full text-xs px-2 py-1 rounded border outline-none"
                    :class="themeStore.darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200'
                      : 'bg-gray-50 border-gray-200 text-gray-800'"
                    min="1"
                  />
                </div>
                <div>
                  <label class="text-[10px] mb-0.5 block" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">H</label>
                  <input
                    type="number"
                    :value="Math.round(editorStore.singleSelected.height || 0)"
                    @change="editorStore.updateElementCommit(editorStore.singleSelected.id, { height: Math.max(1, +$event.target.value) })"
                    class="w-full text-xs px-2 py-1 rounded border outline-none"
                    :class="themeStore.darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200'
                      : 'bg-gray-50 border-gray-200 text-gray-800'"
                    min="1"
                  />
                </div>
              </div>

              <!-- Match size (2+ elements) -->
              <div v-if="editorStore.selectedIds.length >= 2" class="flex flex-col gap-1">
                <p class="text-[10px] mb-1" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                  Uniformiser (basé sur le 1er sélectionné)
                </p>
                <div class="grid grid-cols-3 gap-1">
                  <button
                    @click="editorStore.matchSizeElements(editorStore.selectedIds, 'width')"
                    class="text-[10px] py-1.5 rounded-md border transition-colors"
                    :class="themeStore.darkMode
                      ? 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400'
                      : 'border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600'"
                    title="Même largeur"
                  >
                    Largeur
                  </button>
                  <button
                    @click="editorStore.matchSizeElements(editorStore.selectedIds, 'height')"
                    class="text-[10px] py-1.5 rounded-md border transition-colors"
                    :class="themeStore.darkMode
                      ? 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400'
                      : 'border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600'"
                    title="Même hauteur"
                  >
                    Hauteur
                  </button>
                  <button
                    @click="editorStore.matchSizeElements(editorStore.selectedIds, 'both')"
                    class="text-[10px] py-1.5 rounded-md border transition-colors"
                    :class="themeStore.darkMode
                      ? 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400'
                      : 'border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600'"
                    title="Même taille"
                  >
                    Les deux
                  </button>
                </div>
              </div>
            </div>

            <div class="h-px" :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-gray-100'" />

            <!-- ── Section: Actions rapides ───────────────────────────────── -->
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wider mb-2"
                :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
                Actions rapides
              </p>
              <div class="flex flex-col gap-1">
                <button
                  @click="editorStore.selectAll()"
                  class="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-xs transition-colors"
                  :class="themeStore.darkMode
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-50'"
                >
                  <MousePointer2 class="w-3.5 h-3.5 shrink-0" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
                  Tout sélectionner
                </button>
                <button
                  @click="editorStore.lockAll()"
                  class="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-xs transition-colors"
                  :class="themeStore.darkMode
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-50'"
                >
                  <Lock class="w-3.5 h-3.5 shrink-0" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
                  Tout verrouiller
                </button>
                <button
                  @click="editorStore.unlockAll()"
                  class="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-xs transition-colors"
                  :class="themeStore.darkMode
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-50'"
                >
                  <Unlock class="w-3.5 h-3.5 shrink-0" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
                  Tout déverrouiller
                </button>
                <button
                  @click="editorStore.zoomFit()"
                  class="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-xs transition-colors"
                  :class="themeStore.darkMode
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-50'"
                >
                  <ZoomIn class="w-3.5 h-3.5 shrink-0" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'" />
                  Réinitialiser le zoom
                </button>
              </div>
            </div>
          </div>

          <!-- ══ CALQUES ═══════════════════════════════════════════════════════ -->
          <div v-else-if="activeTab === 'layers'" class="flex flex-col h-full">
            <!-- Header bar -->
            <div
              class="px-3 py-2 flex items-center justify-between border-b shrink-0"
              :class="themeStore.darkMode ? 'border-gray-800' : 'border-gray-100'"
            >
              <span
                class="text-xs font-semibold"
                :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
              >
                Page : {{ editorStore.activePage === 'recto' ? 'Recto' : 'Verso' }}
              </span>
              <span
                class="text-[10px]"
                :class="themeStore.darkMode ? 'text-gray-600' : 'text-gray-400'"
              >
                {{ editorStore.currentElements.length }} élément{{
                  editorStore.currentElements.length !== 1 ? 's' : ''
                }}
              </span>
            </div>

            <!-- Layer list -->
            <div class="flex-1 overflow-y-auto py-1 px-1">
              <!-- Empty state -->
              <div
                v-if="editorStore.currentElements.length === 0"
                class="flex flex-col items-center justify-center h-32 gap-2"
              >
                <Layers class="w-8 h-8 opacity-20" />
                <p
                  class="text-xs text-center"
                  :class="themeStore.darkMode ? 'text-gray-600' : 'text-gray-400'"
                >
                  Aucun élément sur cette page
                </p>
              </div>

              <!-- Layer rows (reversed: top = first) -->
              <div
                v-for="(el, rIdx) in computedLayers"
                :key="el.id"
                draggable="true"
                @dragstart="layerDragIdx = rIdx"
                @dragover.prevent="layerDragOver = rIdx"
                @drop.prevent="onLayerDrop(rIdx)"
                @dragend="layerDragIdx = null; layerDragOver = null"
                @click="editorStore.selectElement(el.id)"
                class="flex items-center gap-1.5 px-1.5 py-1 rounded-lg cursor-pointer transition-all"
                :class="[
                  editorStore.selectedIds.includes(el.id)
                    ? themeStore.darkMode
                      ? 'bg-violet-900/40 ring-1 ring-violet-700'
                      : 'bg-violet-50 ring-1 ring-violet-200'
                    : themeStore.darkMode
                      ? 'hover:bg-gray-800'
                      : 'hover:bg-gray-50',
                  layerDragOver === rIdx && layerDragIdx !== rIdx && 'ring-1 ring-violet-400',
                  !el.visible && 'opacity-40',
                ]"
              >
                <!-- Visibility toggle -->
                <button
                  @click.stop="
                    editorStore.updateElementCommit(el.id, {
                      visible: el.visible === false ? true : false,
                    })
                  "
                  class="p-0.5 rounded shrink-0 transition-colors"
                  :class="themeStore.darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'"
                  :title="el.visible !== false ? 'Masquer' : 'Afficher'"
                >
                  <Eye
                    v-if="el.visible !== false"
                    class="w-3.5 h-3.5"
                    :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
                  />
                  <EyeOff
                    v-else
                    class="w-3.5 h-3.5"
                    :class="themeStore.darkMode ? 'text-gray-600' : 'text-gray-400'"
                  />
                </button>

                <!-- Lock toggle -->
                <button
                  @click.stop="editorStore.toggleLock(el.id)"
                  class="p-0.5 rounded shrink-0 transition-colors"
                  :class="themeStore.darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'"
                  :title="el.locked ? 'Déverrouiller' : 'Verrouiller'"
                >
                  <Lock v-if="el.locked" class="w-3.5 h-3.5 text-amber-500" />
                  <LockOpen
                    v-else
                    class="w-3.5 h-3.5"
                    :class="themeStore.darkMode ? 'text-gray-600' : 'text-gray-400'"
                  />
                </button>

                <!-- Color swatch / thumbnail -->
                <div
                  class="w-5 h-5 rounded shrink-0 flex items-center justify-center text-[9px] font-bold overflow-hidden"
                  :style="layerThumbnailStyle(el)"
                >
                  <span v-if="el.type === 'text'" class="text-gray-600">T</span>
                  <span v-else-if="el.type === 'image'" class="text-gray-400 text-[8px]">IMG</span>
                  <span v-else-if="el.type === 'qr'" class="text-white text-[8px]">QR</span>
                </div>

                <!-- Label -->
                <span
                  class="text-xs flex-1 truncate"
                  :class="themeStore.darkMode ? 'text-gray-300' : 'text-gray-700'"
                >
                  {{ layerLabel(el) }}
                </span>

                <!-- Group badge -->
                <span
                  v-if="el.groupId"
                  class="text-[9px] px-1 py-0.5 rounded font-medium shrink-0"
                  :class="
                    themeStore.darkMode
                      ? 'bg-violet-900/40 text-violet-400'
                      : 'bg-violet-50 text-violet-500'
                  "
                  title="Dans un groupe"
                  >G</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Apply template confirm -->
    <ConfirmModal
      v-if="showApplyTemplateConfirm"
      title="Appliquer ce modèle ?"
      message="Tous les éléments du recto seront remplacés par ce modèle."
      confirm-label="Appliquer"
      variant="warning"
      @confirm="onApplyTemplateConfirmed"
      @cancel="showApplyTemplateConfirm = false"
    />

    <!-- Blank canvas confirm -->
    <ConfirmModal
      v-if="showBlankConfirm"
      title="Repartir de zéro ?"
      message="Tous les éléments du recto seront effacés."
      confirm-label="Effacer"
      variant="warning"
      @confirm="onBlankConfirmed"
      @cancel="showBlankConfirm = false"
    />
  </aside>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import {
  LayoutTemplate,
  Type,
  Shapes,
  Upload,
  Wrench,
  X,
  Search,
  Plus as PlusIcon,
  ArrowLeft,
  QrCode,
  Grid3x3,
  Magnet,
  MousePointer2,
  UserCircle,
  Trash2,
  Layers,
  Eye,
  EyeOff,
  LockOpen,
  Lock,
  Sparkles,
  Star,
  Crosshair,
  Shield,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  RectangleHorizontal,
  Unlock,
  ZoomIn,
} from 'lucide-vue-next'
import { useEditorStore, CARD_W, CARD_H } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'
import { useCardsStore } from '@/stores/cards'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useFontStore } from '@/stores/fontStore'
import {
  buildEditorElements,
  buildElements,
  LAYOUT_MAP,
  DEFAULT_EDITOR_PERSON,
} from '@/utils/templateLayouts'
import BusinessCard from '@/components/BusinessCard.vue'
import { ELEMENT_CATEGORIES } from '@/data/elementLibrary'
import { ICON_CATEGORIES, ALL_ICONS } from '@/data/iconLibrary'
import { ILLUSTRATION_CATEGORIES, ALL_ILLUSTRATIONS } from '@/data/illustrationLibrary'
import { Icon as IconifyIcon } from '@iconify/vue'
import { ROLE_LABELS } from '@/utils/cardElements'
import ConfirmModal from '@/components/ConfirmModal.vue'

const editorStore = useEditorStore()
const themeStore = useThemeStore()
const cardsStore = useCardsStore()
const authStore = useAuthStore()
const notif = useNotificationStore()
const fontStore = useFontStore()

const activeTab = ref(null)
const fileInputRef = ref(null)
const isDragOver = ref(false)
const importedImages = ref([])
const elementsView = ref('browse') // 'browse' | 'category:<id>'
const elementsQuery = ref('')
const fontQuery = ref('')
const recentFonts = ref([])
// When text elements are selected, font clicks UPDATE them instead of adding new text
const selectedTextEl = computed(() => {
  const sel = editorStore.singleSelected
  return sel && sel.type === 'text' ? sel : null
})
const selectedTextEls = computed(() => {
  if (!editorStore.selectedIds.length) return []
  return editorStore.currentElements.filter(
    (el) => editorStore.selectedIds.includes(el.id) && el.type === 'text',
  )
})
const fontFileInputRef = ref(null)
const fontUploadMsg = ref(null)
const iconQuery = ref('')
const activeIconCategoryId = ref('contact')

const filteredIcons = computed(() => {
  const q = iconQuery.value.trim().toLowerCase()
  if (q) return ALL_ICONS.filter((ic) => ic.label.toLowerCase().includes(q) || ic.id.toLowerCase().includes(q))
  const cat = ICON_CATEGORIES.find((c) => c.id === activeIconCategoryId.value)
  return cat ? cat.icons : ALL_ICONS
})

// ── Illustrations panel ──────────────────────────────────────────────────
const illustrationQuery = ref('')
const activeIllustrationCategoryId = ref('social')

const filteredIllustrations = computed(() => {
  const q = illustrationQuery.value.trim().toLowerCase()
  if (q) return ALL_ILLUSTRATIONS.filter((ic) => ic.label.toLowerCase().includes(q) || ic.id.toLowerCase().includes(q))
  const cat = ILLUSTRATION_CATEGORIES.find((c) => c.id === activeIllustrationCategoryId.value)
  return cat ? cat.icons : ALL_ILLUSTRATIONS
})

function addIllustration(item) {
  // SVG scene illustration → add as image element
  if (item.src) {
    editorStore.addElement({
      type: 'image',
      src: item.src,
      width: 140,
      height: 140,
    })
  } else if (item.color) {
    // Monochrome icon with brand color → add with fill
    editorStore.addIconElement({ id: item.id }, { colorful: false, fill: item.color })
  } else {
    // Iconify icon → add as colorful icon element
    editorStore.addIconElement({ id: item.id }, { colorful: true })
  }
}

function onIllustrationDragStart(event, item) {
  if (item.src) {
    // SVG scene → drag as image
    const data = {
      action: 'addImage',
      preset: { src: item.src, width: 140, height: 140 },
      dropWidth: 140,
      dropHeight: 140,
    }
    event.dataTransfer.setData('application/editor-element', JSON.stringify(data))
  } else {
    // Iconify icon → drag as icon
    const preset = item.color
      ? { colorful: false, fill: item.color, width: 64, height: 64 }
      : { colorful: true, width: 64, height: 64 }
    const data = {
      action: 'addIcon',
      icon: { id: item.id },
      preset,
      dropWidth: 64,
      dropHeight: 64,
    }
    event.dataTransfer.setData('application/editor-element', JSON.stringify(data))
  }
  event.dataTransfer.effectAllowed = 'copy'
}

// ── QR Code configuration ────────────────────────────────────────────────
const qrConfig = reactive({
  qrFields: {
    firstName: true, lastName: true, title: true, company: true,
    phone: true, email: true, website: false, address: false,
  },
  qrMode: 'standard',
  qrForeground: '#000000',
  qrBackground: '#ffffff',
  qrDotStyle: 'square',
  qrCornerSquareStyle: 'square',
  qrCornerDotStyle: 'square',
  qrErrorCorrection: 'M',
  qrLogoSrc: '',
  qrMargin: 10,
})

const QR_FIELD_KEYS = ['firstName', 'lastName', 'title', 'company', 'phone', 'email', 'website', 'address']

// ── QR element sélectionné (édition dynamique) ──────────────────────────
// Quand un seul élément QR est sélectionné → panneau passe en mode édition.
// Modifications appliquées en temps réel via editorStore.updateElement().
const selectedQRElement = computed(() => {
  if (editorStore.selectedIds.length !== 1) return null
  const id = editorStore.selectedIds[0]
  return editorStore.currentElements.find((el) => el.id === id && el.type === 'qr') || null
})

// ID de l'élément QR en cours d'édition — évite de recharger qrConfig
// quand c'est la mise à jour de l'élément par qrConfig qui a déclenché le re-render
let _editingQRId = null

// Quand un QR est sélectionné : charger ses props dans qrConfig + ouvrir le tab QR
// NB : on ne recharge QUE si l'ID a changé (sélection d'un nouveau QR),
//      PAS si c'est le même élément qui a été mis à jour via qrConfig (évite la boucle).
watch(selectedQRElement, (el) => {
  if (!el) { _editingQRId = null; return }
  if (el.id === _editingQRId) return   // même élément mis à jour → ne pas recharger
  _editingQRId = el.id
  // Charger les props de l'élément dans le panneau
  qrConfig.qrFields = { ...el.qrFields }
  qrConfig.qrMode = el.qrMode || 'standard'
  qrConfig.qrForeground = el.qrForeground || '#000000'
  qrConfig.qrBackground = el.qrBackground || '#ffffff'
  qrConfig.qrDotStyle = el.qrDotStyle || 'square'
  qrConfig.qrCornerSquareStyle = el.qrCornerSquareStyle || 'square'
  qrConfig.qrCornerDotStyle = el.qrCornerDotStyle || 'square'
  qrConfig.qrErrorCorrection = el.qrErrorCorrection || 'M'
  qrConfig.qrLogoSrc = el.qrLogoSrc || ''
  qrConfig.qrMargin = el.qrMargin ?? 10
  // Init des custom fields non encore présents dans qrFields de l'élément
  for (const item of (editorStore.contactExtra || [])) {
    if (qrConfig.qrFields[item.id] === undefined) qrConfig.qrFields[item.id] = true
  }
  // Auto-ouvrir le panneau QR
  if (activeTab.value !== 'qr') activeTab.value = 'qr'
})

// Quand qrConfig change + QR sélectionné → appliquer sur l'élément (debounced)
// Le debounce évite de regénérer le QR à chaque pixel pendant le drag du color picker
let _qrSyncTimer = null
watch(
  qrConfig,
  () => {
    if (!selectedQRElement.value) return
    clearTimeout(_qrSyncTimer)
    _qrSyncTimer = setTimeout(() => {
      if (!selectedQRElement.value) return
      editorStore.updateElement(selectedQRElement.value.id, {
        qrFields: { ...qrConfig.qrFields },
        qrMode: qrConfig.qrMode,
        qrForeground: qrConfig.qrForeground,
        qrBackground: qrConfig.qrBackground,
        qrDotStyle: qrConfig.qrDotStyle,
        qrCornerSquareStyle: qrConfig.qrCornerSquareStyle,
        qrCornerDotStyle: qrConfig.qrCornerDotStyle,
        qrErrorCorrection: qrConfig.qrErrorCorrection,
        qrLogoSrc: qrConfig.qrLogoSrc,
        qrMargin: qrConfig.qrMargin,
      })
    }, 150)
  },
  { deep: true },
)

// Auto-initialize qrFields pour les champs custom nouveaux (mode création)
watch(
  () => editorStore.contactExtra,
  (extras) => {
    if (!Array.isArray(extras)) return
    for (const item of extras) {
      if (qrConfig.qrFields[item.id] === undefined) qrConfig.qrFields[item.id] = true
    }
  },
  { immediate: true, deep: true },
)

const QR_DOT_STYLES = [
  { value: 'square', label: 'Carré' },
  { value: 'dots', label: 'Rond' },
  { value: 'rounded', label: 'Arrondi' },
  { value: 'classy', label: 'Élégant' },
  { value: 'classy-rounded', label: 'Élégant arrondi' },
  { value: 'extra-rounded', label: 'Extra arrondi' },
]

const QR_CORNER_SQ_STYLES = [
  { value: 'square', label: 'Carré' },
  { value: 'dot', label: 'Rond' },
  { value: 'extra-rounded', label: 'Arrondi' },
]

const QR_CORNER_DOT_STYLES = [
  { value: 'square', label: 'Carré' },
  { value: 'dot', label: 'Rond' },
]

const QR_ERROR_LEVELS = [
  { value: 'L', label: 'L', desc: '7%' },
  { value: 'M', label: 'M', desc: '15%' },
  { value: 'Q', label: 'Q', desc: '25%' },
  { value: 'H', label: 'H', desc: '30%' },
]

const qrLogoInputRef = ref(null)

function handleQRLogoUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { qrConfig.qrLogoSrc = ev.target.result }
  reader.readAsDataURL(file)
  e.target.value = ''
}

const tabs = [
  { id: 'info', label: 'Infos', icon: UserCircle },
  { id: 'design', label: 'Design', icon: LayoutTemplate },
  { id: 'elements', label: 'Éléments', icon: Shapes },
  { id: 'icons', label: 'Icônes', icon: Sparkles },
  { id: 'text', label: 'Texte', icon: Type },
  { id: 'layers', label: 'Calques', icon: Layers },
  { id: 'import', label: 'Importer', icon: Upload },
  { id: 'qr', label: 'QR Code', icon: QrCode },
  { id: 'tools', label: 'Outils', icon: Wrench },
]

const currentTab = computed(() => tabs.find((t) => t.id === activeTab.value))

function toggleTab(id) {
  activeTab.value = activeTab.value === id ? null : id
}

// ── Layers panel ────────────────────────────────────────────────────────────
const layerDragIdx = ref(null)
const layerDragOver = ref(null)

// Reverse order: top layer first in list
const computedLayers = computed(() => [...editorStore.currentElements].reverse())

function layerLabel(el) {
  if (el.type === 'text') return el.text?.slice(0, 22) || 'Texte'
  if (el.type === 'image') return 'Image'
  if (el.type === 'qr') return 'QR Code'
  if (el.type === 'icon') return el.iconId?.split(':')[1] || 'Icône'
  const shapes = {
    rect: 'Rectangle',
    circle: 'Cercle',
    line: 'Ligne',
    'line-bar': 'Ligne barrée',
    arrow: 'Flèche',
    'arrow-double': 'Double flèche',
    polygon: 'Polygone',
    star: 'Étoile',
    path: 'Forme custom',
  }
  return shapes[el.shapeType] || 'Élément'
}

function onLayerDrop(toReversedIdx) {
  if (layerDragIdx.value === null || layerDragIdx.value === toReversedIdx) {
    layerDragIdx.value = null
    layerDragOver.value = null
    return
  }
  const len = editorStore.currentElements.length
  const fromOriginal = len - 1 - layerDragIdx.value
  const toOriginal = len - 1 - toReversedIdx
  const el = editorStore.currentElements[fromOriginal]
  if (el) editorStore.reorderElement(el.id, toOriginal)
  layerDragIdx.value = null
  layerDragOver.value = null
}

function layerThumbnailStyle(el) {
  if (el.type === 'text') return { background: '#e2e8f0' }
  if (el.type === 'image') return { background: '#f0f0f0' }
  if (el.type === 'qr') return { background: '#111' }
  if (el.type === 'icon') return { background: el.colorful ? '#f8f8f8' : (el.fill || '#888') }
  return { background: el.fill || '#888', border: el.stroke ? `1.5px solid ${el.stroke}` : 'none' }
}

// ── Informations tab ────────────────────────────────────────────────────────
const infoValues = ref({})
const showAddCustom = ref(false)
const newCustomLabel = ref('')
const newCustomValue = ref('')

const editingStandardLabel = ref(null)
const editingCustomLabel = ref(null)

const availableStandardFields = computed(() => {
  if (!editorStore.fieldConfig?.activeStandardFields) return []
  return editorStore.ALL_STANDARD_FIELDS.filter(sf => 
    !editorStore.fieldConfig.activeStandardFields.some(af => af.role === sf.role)
  )
})

function addStandardField(field) {
  if (!editorStore.fieldConfig?.activeStandardFields) return
  editorStore.fieldConfig.activeStandardFields.push(JSON.parse(JSON.stringify(field)))
  infoValues.value[field.role] = ''
  editorStore.isDirty = true
}

function removeStandardField(role) {
  if (!editorStore.fieldConfig?.activeStandardFields) return
  editorStore.fieldConfig.activeStandardFields = editorStore.fieldConfig.activeStandardFields.filter(f => f.role !== role)
  // Remove canvas elements
  editorStore.elements.recto = editorStore.elements.recto.filter(e => e.role !== role)
  editorStore.elements.verso = editorStore.elements.verso.filter(e => e.role !== role)
  // Turn off in QR config if active
  const allEls = [...editorStore.elements.recto, ...editorStore.elements.verso]
  allEls.forEach(el => {
    if (el.type === 'qr' && el.qrFields) el.qrFields[role] = false
  })
  delete infoValues.value[role]
  editorStore.isDirty = true
}

function syncCustomLabelToExtra(id, newLabel) {
  const cf = editorStore.contactExtra.find(c => c.id === id)
  if (cf) cf.label = newLabel
  editorStore.isDirty = true
}

watch(activeTab, (val) => {
  if (val === 'info') syncInfoFromElements()
})

watch(
  () => editorStore.elements,
  () => {
    if (activeTab.value === 'info') syncInfoFromElements()
  },
  { deep: true },
)

function syncInfoFromElements() {
  const allEls = [...editorStore.elements.recto, ...editorStore.elements.verso]
  const values = {}
  if (editorStore.fieldConfig?.activeStandardFields) {
    editorStore.fieldConfig.activeStandardFields.forEach(({ role }) => {
      const el = allEls.find((e) => e.role === role)
      if (el) values[role] = el.text || ''
    })
  }
  infoValues.value = values
}

function handleInfoInput(role, value) {
  updateInfoField(role, value)
}

function updateInfoField(role, value) {
  infoValues.value[role] = value

  const activeEl = editorStore.currentElements.find((e) => e.role === role)
  if (activeEl) {
    editorStore.updateElement(activeEl.id, { text: value })
  } else if (value.trim()) {
    // Élément absent du template → on le crée sur le canvas
    editorStore.addTextElement({
      text: value,
      role,
      fontSize: 14,
      fill: editorStore.activePage === 'verso' ? '#FFFFFF' : '#111827',
    })
  }

  // Patch the non-active page so it's consistent on page flip
  const otherPage = editorStore.activePage === 'recto' ? 'verso' : 'recto'
  const otherIdx = editorStore.elements[otherPage].findIndex((e) => e.role === role)
  if (otherIdx !== -1) {
    editorStore.elements[otherPage][otherIdx] = {
      ...editorStore.elements[otherPage][otherIdx],
      text: value,
    }
    editorStore.isDirty = true
  }
}

function updateCustomField(id, value) {
  const cf = editorStore.contactExtra.find((c) => c.id === id)
  if (cf) {
    cf.value = value
    // Sync value to canvas element
    const role = `custom_${id}`
    const activeEl = editorStore.currentElements.find((e) => e.role === role)
    if (activeEl) {
      editorStore.updateElement(activeEl.id, { text: value })
    } else if (value.trim()) {
      editorStore.addTextElement({
        text: value,
        role,
        fontSize: 13,
        fill: editorStore.activePage === 'verso' ? '#FFFFFF' : '#111827',
      })
    }
    editorStore.isDirty = true
  }
}

function removeCustomField(id) {
  if (editorStore.fieldConfig?.customFields) {
    editorStore.fieldConfig.customFields = editorStore.fieldConfig.customFields.filter(c => c.id !== id)
  }
  if (editorStore.contactExtra) {
    editorStore.contactExtra = editorStore.contactExtra.filter((c) => c.id !== id)
  }
  // Remove canvas element from BOTH pages
  const role = `custom_${id}`
  editorStore.elements.recto = editorStore.elements.recto.filter((e) => e.role !== role)
  editorStore.elements.verso = editorStore.elements.verso.filter((e) => e.role !== role)

  // Update QR fields
  const allEls = [...editorStore.elements.recto, ...editorStore.elements.verso]
  allEls.forEach(el => {
    if (el.type === 'qr' && el.qrFields) el.qrFields[id] = false
  })

  editorStore.isDirty = true
}

function confirmAddCustom() {
  const label = newCustomLabel.value.trim()
  if (!label) return
  const id = Date.now().toString()
  const value = newCustomValue.value.trim()

  const newField = { id, label, value }

  if (editorStore.fieldConfig?.customFields) {
    editorStore.fieldConfig.customFields.push(newField)
  }
  if (editorStore.contactExtra) {
    editorStore.contactExtra.push(newField)
  }
  // Value appears on canvas; label stays JSON-only
  if (value) {
    editorStore.addTextElement({
      text: value,
      role: `custom_${id}`,
      fontSize: 13,
      fill: editorStore.activePage === 'verso' ? '#FFFFFF' : '#111827',
    })
  }
  editorStore.isDirty = true
  newCustomLabel.value = ''
  newCustomValue.value = ''
  showAddCustom.value = false
}

// ── Elements tab (categories browser) ─────────────────────────────────────
const activeCategory = computed(() => {
  if (!elementsView.value.startsWith('category:')) return null
  const catId = elementsView.value.replace('category:', '')
  return ELEMENT_CATEGORIES.find((c) => c.id === catId) || null
})

const filteredElements = computed(() => {
  const q = elementsQuery.value.toLowerCase().trim()
  if (!q) return null
  const results = []
  // Search standard element categories
  ELEMENT_CATEGORIES.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      sub.elements.forEach((el) => {
        const haystack = [el.label, ...(el.tags || [])].join(' ').toLowerCase()
        if (haystack.includes(q)) results.push(el)
      })
    })
  })
  // Search illustrations (Iconify logos + OpenMoji)
  ALL_ILLUSTRATIONS.forEach((item) => {
    const haystack = [item.label, item.id, item.categoryName || ''].join(' ').toLowerCase()
    if (haystack.includes(q)) {
      results.push({ ...item, type: 'icon', iconId: item.id, colorful: true })
    }
  })
  return results
})

const activeCategoryFiltered = computed(() => {
  if (!activeCategory.value) return []
  const q = elementsQuery.value.toLowerCase().trim()
  if (!q) return activeCategory.value.subcategories
  return activeCategory.value.subcategories
    .map((sub) => ({
      ...sub,
      elements: sub.elements.filter((el) => {
        const haystack = [el.label, ...(el.tags || [])].join(' ').toLowerCase()
        return haystack.includes(q)
      }),
    }))
    .filter((sub) => sub.elements.length)
})

function addLibraryElement(el) {
  if (el.type === 'icon') {
    editorStore.addIconElement({ id: el.iconId }, {
      width: el.defaultWidth || 64,
      height: el.defaultHeight || 64,
      colorful: el.colorful ?? false,
      ...el.preset,
    })
  } else if (el.shapeType === 'path') {
    const pathPreset = {
      width: el.defaultWidth || 60,
      height: el.defaultHeight || 60,
      ...el.preset,
    }
    // Only set fill if the element defines a specific defaultFill (e.g. red ribbon, amber banner)
    // Otherwise let the store use templatePrimaryColor as the default
    if (el.defaultFill) pathPreset.fill = el.defaultFill
    editorStore.addPathElement(el.pathData, el.pathViewBox || [24, 24], pathPreset)
  } else {
    editorStore.addShapeElement(el.shapeType, el.preset || {})
  }
}

// ── Drag & drop to canvas ─────────────────────────────────────────────────
function onLibraryDragStart(event, el) {
  // Icon-type elements in element library
  if (el.type === 'icon') {
    const data = {
      action: 'addIcon',
      icon: { id: el.iconId },
      preset: {
        width: el.defaultWidth || 64,
        height: el.defaultHeight || 64,
        colorful: el.colorful ?? false,
        ...el.preset,
      },
      dropWidth: el.defaultWidth || 64,
      dropHeight: el.defaultHeight || 64,
    }
    event.dataTransfer.setData('application/editor-element', JSON.stringify(data))
    event.dataTransfer.effectAllowed = 'copy'
    return
  }

  // Shape elements
  // Build preset from element-specific properties only
  // Lines/arrows use addShapeElement defaults — don't override with generic 60x60
  const preset = { ...el.preset }
  if (el.defaultWidth !== undefined) preset.width = el.defaultWidth
  if (el.defaultHeight !== undefined) preset.height = el.defaultHeight
  if (el.defaultFill !== undefined) preset.fill = el.defaultFill

  const data = {
    action: el.shapeType === 'path' ? 'addPath' : 'addShape',
    shapeType: el.shapeType,
    pathData: el.pathData,
    pathViewBox: el.pathViewBox || [24, 24],
    preset,
    // Centering hints for drop position calculation
    dropWidth: preset.width || el.defaultWidth || 60,
    dropHeight: preset.height || el.defaultHeight || 40,
  }
  event.dataTransfer.setData('application/editor-element', JSON.stringify(data))
  event.dataTransfer.effectAllowed = 'copy'
}

function onTextDragStart(event, preset) {
  const data = {
    action: 'addText',
    preset: {
      text: preset.label || 'Votre texte',
      fontFamily: preset.fontFamily,
      fontSize: preset.fontSize,
      fontStyle: preset.fontStyle,
      fill: editorStore.activePage === 'verso' ? '#FFFFFF' : '#000000',
      width: 220,
      height: Math.max(30, preset.fontSize * 1.5),
    },
    dropWidth: 220,
    dropHeight: Math.max(30, preset.fontSize * 1.5),
  }
  event.dataTransfer.setData('application/editor-element', JSON.stringify(data))
  event.dataTransfer.effectAllowed = 'copy'
}

function onImageDragStart(event, img) {
  const isLogo = img.label === 'logo'
  const isAvatar = img.label === 'avatar'
  const data = {
    action: img.label === 'background' ? 'addImageBg' : 'addImage',
    preset: {
      src: img.dataUrl,
      role: img.label || 'logo',
      width: isLogo ? 120 : 90,
      height: isLogo ? 60 : 90,
      borderRadius: isAvatar ? 50 : 0,
    },
  }
  event.dataTransfer.setData('application/editor-element', JSON.stringify(data))
  event.dataTransfer.effectAllowed = 'copy'
}

function onTemplateDragStart(event, tpl) {
  if (tpl.isPremium && !authStore.isPremium && !authStore.isAdmin) {
    event.preventDefault()
    return
  }
  const data = { action: 'applyTemplate', slug: tpl.slug }
  event.dataTransfer.setData('application/editor-element', JSON.stringify(data))
  event.dataTransfer.effectAllowed = 'copy'
}

function onIconDragStart(event, icon, preset = {}) {
  const data = { action: 'addIcon', icon, preset, dropWidth: 64, dropHeight: 64 }
  event.dataTransfer.setData('application/editor-element', JSON.stringify(data))
  event.dataTransfer.effectAllowed = 'copy'
}

// ── Design tab ─────────────────────────────────────────────────────────────
const PREVIEW_PERSON = {
  fullName: 'Sophie Martin',
  title: 'Directrice Marketing',
  company: 'InnovateLab',
  email: 'sophie@innovatelab.fr',
  phone: '+33 6 12 34 56 78',
  website: 'innovatelab.fr',
}

// ── Design tab: template search & filter ───────────────────────────────────
const designQuery = ref('')
const designFilter = ref('all')

const designFilters = computed(() => [
  { label: 'Tous', value: 'all', count: cardsStore.getAllTemplates.length },
  { label: 'Gratuits', value: 'free', count: cardsStore.getFreeTemplates.length },
  { label: 'Premium', value: 'premium', count: cardsStore.getPremiumTemplates.length },
])

const filteredDesignTemplates = computed(() => {
  let list =
    designFilter.value === 'free'
      ? cardsStore.getFreeTemplates
      : designFilter.value === 'premium'
        ? cardsStore.getPremiumTemplates
        : cardsStore.getAllTemplates

  const q = designQuery.value.toLowerCase().trim()
  if (q) {
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)),
    )
  }
  return list
})

function buildPreviewCard(tpl) {
  const layout = LAYOUT_MAP[tpl.slug] || 'center'
  return {
    id: `preview-${tpl.slug}`,
    template: tpl.slug,
    data: { elements: buildElements(layout, PREVIEW_PERSON, tpl.colors), showQR: false },
  }
}

const bgPresets = [
  '#FFFFFF',
  '#F1F5F9',
  '#E2E8F0',
  '#CBD5E1',
  '#0F172A',
  '#1E293B',
  '#334155',
  '#475569',
  '#1D4ED8',
  '#7C3AED',
  '#DB2777',
  '#EA580C',
  '#059669',
  '#DC2626',
  '#F59E0B',
  '#06B6D4',
]

// ── Design templates ───────────────────────────────────────────────────────
const showApplyTemplateConfirm = ref(false)
const showBlankConfirm = ref(false)
let _pendingApplyTemplate = null

function applyDesignTemplate(tpl) {
  if (tpl.isPremium && !authStore.isPremium && !authStore.isAdmin) {
    notif.warning('Ce modèle est réservé au plan Premium.')
    return
  }
  const hasElements = editorStore.elements.recto.length > 0
  if (hasElements) {
    _pendingApplyTemplate = tpl
    showApplyTemplateConfirm.value = true
    return
  }
  _doApplyTemplate(tpl)
}

function onApplyTemplateConfirmed() {
  showApplyTemplateConfirm.value = false
  if (_pendingApplyTemplate) _doApplyTemplate(_pendingApplyTemplate)
  _pendingApplyTemplate = null
}

function _doApplyTemplate(tpl) {
  const layout = LAYOUT_MAP[tpl.slug] || 'center'
  const rectoEls = buildEditorElements(layout, DEFAULT_EDITOR_PERSON, tpl.colors)
  editorStore.applyRectoTemplate(rectoEls, tpl.colors.primary)
  editorStore.templateSlug = tpl.slug
  editorStore.templatePrimaryColor = tpl.colors.secondary || tpl.colors.primary || '#6366F1'
}

function startBlankCanvas() {
  const hasElements = editorStore.elements.recto.length > 0
  if (hasElements) {
    showBlankConfirm.value = true
    return
  }
  _doBlankCanvas()
}

function onBlankConfirmed() {
  showBlankConfirm.value = false
  _doBlankCanvas()
}

function _doBlankCanvas() {
  editorStore.initEditor()
  editorStore.templateSlug = null
}

// ── Text tab ───────────────────────────────────────────────────────────────
const mainTextPresets = [
  {
    label: 'Ajouter un titre',
    fontFamily: 'Poppins',
    fontSize: 32,
    fontStyle: 'bold',
    previewSize: 19,
    weight: 700,
  },
  {
    label: 'Ajouter un sous-titre',
    fontFamily: 'Inter',
    fontSize: 22,
    fontStyle: 'normal',
    previewSize: 15,
    weight: 500,
  },
  {
    label: 'Ajouter du texte',
    fontFamily: 'Inter',
    fontSize: 14,
    fontStyle: 'normal',
    previewSize: 12,
    weight: 400,
  },
]

const MAX_FREE_FONTS = 50

const filteredFonts = computed(() => {
  const all = fontStore.searchFonts(fontQuery.value)
  if (authStore.isPremium || authStore.isAdmin) return all
  return all.slice(0, MAX_FREE_FONTS)
})

const HEADING_ROLES = ['firstName', 'lastName', 'title', 'company', 'logo']

const fontCombos = [
  // Professionnel
  { name: 'Moderne',   heading: 'Poppins',           body: 'Inter',              hw: 700, bw: 400 },
  { name: 'Corporate', heading: 'Montserrat',         body: 'Open Sans',          hw: 800, bw: 400 },
  { name: 'Minimal',   heading: 'Inter',              body: 'DM Sans',            hw: 600, bw: 400 },
  { name: 'Clean',     heading: 'Plus Jakarta Sans',  body: 'Nunito',             hw: 700, bw: 400 },
  // Élégant
  { name: 'Élégant',   heading: 'Playfair Display',   body: 'Lato',               hw: 700, bw: 400 },
  { name: 'Luxe',      heading: 'Cormorant Garamond', body: 'Raleway',            hw: 600, bw: 400 },
  { name: 'Éditorial', heading: 'DM Serif Display',   body: 'Source Serif 4',     hw: 400, bw: 400 },
  { name: 'Classique', heading: 'EB Garamond',        body: 'Libre Baskerville',  hw: 700, bw: 400 },
  // Tech / Grotesk
  { name: 'Tech',      heading: 'Space Grotesk',      body: 'Fira Code',          hw: 700, bw: 400 },
  { name: 'Grotesk',   heading: 'Syne',               body: 'Barlow',             hw: 700, bw: 400 },
  { name: 'Future',    heading: 'Orbitron',           body: 'Exo 2',              hw: 700, bw: 400 },
  { name: 'Créatif',   heading: 'Abril Fatface',      body: 'Outfit',             hw: 400, bw: 400 },
]

function preloadCombo(combo) {
  fontStore.loadFont(combo.heading)
  fontStore.loadFont(combo.body)
}

// ── Custom font upload ──────────────────────────────────────────────────────
function triggerFontUpload() {
  fontUploadMsg.value = null
  fontFileInputRef.value?.click()
}

async function onFontFileSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = '' // reset so same file can be re-uploaded

  const result = await fontStore.addCustomFont(file)
  if (!result.success) {
    fontUploadMsg.value = { type: 'error', text: result.error }
  } else if (result.warning) {
    fontUploadMsg.value = { type: 'warning', text: result.warning }
  } else {
    fontUploadMsg.value = null
  }
  // Auto-clear message after 5 seconds
  if (fontUploadMsg.value) {
    setTimeout(() => { fontUploadMsg.value = null }, 5000)
  }
}

function addText(preset) {
  const font = preset.fontFamily || 'Inter'
  if (font && !recentFonts.value.includes(font)) {
    recentFonts.value = [font, ...recentFonts.value].slice(0, 5)
  }
  fontStore.loadFont(font)
  editorStore.addTextElement({
    text: preset.label,
    fontFamily: font,
    fontSize: preset.fontSize,
    fontStyle: preset.fontStyle,
    fill: editorStore.activePage === 'verso' ? '#FFFFFF' : '#000000',
  })
}

function updateSelectedFont(family) {
  if (!selectedTextEl.value) return
  editorStore.updateElementCommit(selectedTextEl.value.id, { fontFamily: family })
  if (!recentFonts.value.includes(family)) {
    recentFonts.value = [family, ...recentFonts.value].slice(0, 5)
  }
  // Re-apply once font is loaded for correct Konva rendering (no commit — avoids double undo)
  fontStore.loadFont(family).then(() => {
    if (selectedTextEl.value?.fontFamily === family) {
      editorStore.updateElement(selectedTextEl.value.id, { fontFamily: family })
    }
  })
}

function handleFontClick(family) {
  if (selectedTextEl.value) {
    updateSelectedFont(family)
  } else if (selectedTextEls.value.length > 1) {
    // Multi-selection: update all selected text elements
    fontStore.loadFont(family)
    selectedTextEls.value.forEach((el) => {
      editorStore.updateElement(el.id, { fontFamily: family })
    })
    editorStore.saveHistory()
    if (!recentFonts.value.includes(family)) {
      recentFonts.value = [family, ...recentFonts.value].slice(0, 5)
    }
    fontStore.loadFont(family).then(() => {
      selectedTextEls.value.forEach((el) => {
        if (el.fontFamily === family) editorStore.updateElement(el.id, { fontFamily: family })
      })
    })
  } else {
    addText({ label: 'Votre texte', fontFamily: family, fontSize: 22, fontStyle: 'normal' })
  }
}

function applyFontCombo(combo) {
  preloadCombo(combo)

  // Apply heading/body font to ALL text elements on both pages
  // NOTE: use direct elements[page] access instead of updateElement (which only searches activePage)
  const pages = ['recto', 'verso']
  let updated = 0
  pages.forEach((page) => {
    const els = editorStore.elements?.[page] ?? []
    els.forEach((el, idx) => {
      if (el.type !== 'text' && el.type !== 'contact') return
      const isHeading = HEADING_ROLES.includes(el.role) || (el.fontSize ?? 20) >= 22
      els[idx] = { ...el, fontFamily: isHeading ? combo.heading : combo.body }
      updated++
    })
  })

  if (updated > 0) {
    editorStore.isDirty = true
    editorStore.saveHistory()
  }
}

// ── Import tab ─────────────────────────────────────────────────────────────
function processFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  if (file.size > 5 * 1024 * 1024) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    importedImages.value.push({ name: file.name, dataUrl: ev.target.result, label: 'logo' })
  }
  reader.readAsDataURL(file)
}

function onFileInput(e) {
  Array.from(e.target.files).forEach(processFile)
  e.target.value = ''
}

function onFileDrop(e) {
  isDragOver.value = false
  Array.from(e.dataTransfer.files).forEach(processFile)
}

function removeImportedImage(index) {
  importedImages.value.splice(index, 1)
}

function insertImage(img) {
  if (img.label === 'background') {
    const page = editorStore.activePage
    // Remove any existing background element on this page
    editorStore.elements[page] = editorStore.elements[page].filter((e) => e.role !== 'background')
    // Add new background image
    editorStore.addElement({
      type: 'image',
      src: img.dataUrl,
      role: 'background',
      x: 0,
      y: 0,
      width: editorStore.cardWidth,
      height: editorStore.cardHeight,
    })
    // Move it to the front of the array so it renders behind everything else
    const arr = editorStore.elements[page]
    const newBg = arr[arr.length - 1]
    editorStore.elements[page] = [newBg, ...arr.slice(0, arr.length - 1)]
    editorStore.isDirty = true
  } else {
    editorStore.addElement({
      type: 'image',
      src: img.dataUrl,
      role: img.label || 'logo',
      width: img.label === 'logo' ? 120 : 90,
      height: img.label === 'logo' ? 60 : 90,
      borderRadius: img.label === 'avatar' ? 50 : 0,
    })
  }
}

// ── Tools tab ──────────────────────────────────────────────────────────────
const PRO_TOOL_KEYS = new Set(['snapEnabled', 'snapToEdges', 'showCenterGuides', 'showSafeZone'])

const displayOptions = [
  { key: 'showGrid', label: 'Afficher la grille', icon: Grid3x3 },
  { key: 'snapEnabled', label: 'Magnétisme (snap grille)', icon: Magnet },
  { key: 'snapToEdges', label: 'Aligner sur les bords', icon: MousePointer2 },
  { key: 'showCenterGuides', label: 'Guides centraux', icon: Crosshair },
  { key: 'showSafeZone', label: 'Zone de sécurité (3mm)', icon: Shield },
]

const alignButtons = [
  { type: 'left', title: 'Aligner à gauche', icon: AlignLeft },
  { type: 'centerH', title: 'Centrer horizontalement', icon: AlignCenter },
  { type: 'right', title: 'Aligner à droite', icon: AlignRight },
  { type: 'top', title: 'Aligner en haut', icon: AlignStartVertical },
  { type: 'centerV', title: 'Centrer verticalement', icon: AlignCenterVertical },
  { type: 'bottom', title: 'Aligner en bas', icon: AlignEndVertical },
]

function onAlignClick(type) {
  if (editorStore.selectedIds.length === 1) {
    editorStore.alignElement(editorStore.selectedIds[0], type)
  } else if (editorStore.selectedIds.length >= 2) {
    editorStore.alignElements(editorStore.selectedIds, type)
  }
}

function insertQR() {
  editorStore.addQRElement({ ...qrConfig, qrFields: { ...qrConfig.qrFields } })
}
</script>
