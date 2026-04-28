<template>
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
          themeStore.darkMode ? 'bg-onyx-900 border-onyx-700' : 'bg-white border-powder-200'
        "
        :style="dropdownStyle"
      >
        <!-- Search input -->
        <div
          class="p-2 border-b shrink-0"
          :class="themeStore.darkMode ? 'border-onyx-700' : 'border-powder-200'"
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
          :class="themeStore.darkMode ? 'border-onyx-700' : 'border-powder-200'"
        >
          <span
            v-if="!authStore.isPremium && !authStore.isAdmin"
            class="text-[10px]"
            :class="themeStore.darkMode ? 'text-amber-400' : 'text-amber-600'"
          >
            Limité à 50 polices — passez au Premium pour 300+
          </span>
          <span v-else class="text-[10px] opacity-40" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">
            300+ polices disponibles
          </span>
          <button
            v-if="authStore.isPremium || authStore.isAdmin"
            @click.stop="triggerFontUploadCtx"
            class="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border transition-colors"
            :class="themeStore.darkMode ? 'border-onyx-700 text-onyx-400 hover:border-flame-500 hover:text-flame-400' : 'border-powder-300 text-onyx-500 hover:border-flame-400 hover:text-flame-600'"
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
                :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
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
                        ? 'hover:bg-onyx-800'
                        : 'hover:bg-powder-100'
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
                          ? 'text-onyx-500 hover:text-yellow-400'
                          : 'text-onyx-400 hover:text-yellow-400')
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
                  themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500',
                  importedFonts.length
                    ? 'border-t ' +
                      (themeStore.darkMode ? 'border-onyx-700' : 'border-powder-100')
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
                        ? 'hover:bg-onyx-800'
                        : 'hover:bg-powder-100'
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
                themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500',
                importedFonts.length || favFonts.length
                  ? 'border-t ' + (themeStore.darkMode ? 'border-onyx-700' : 'border-powder-100')
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
                      ? 'hover:bg-onyx-800'
                      : 'hover:bg-powder-100'
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
                        ? 'text-onyx-500 hover:text-yellow-400'
                        : 'text-onyx-400 hover:text-yellow-400')
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
                  ? 'border-onyx-700 text-onyx-400'
                  : 'border-powder-100 text-onyx-500'
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
                      ? 'hover:bg-onyx-800'
                      : 'hover:bg-powder-100'
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
                        ? 'text-onyx-500 hover:text-yellow-400'
                        : 'text-onyx-400 hover:text-yellow-400')
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
                      ? 'hover:bg-onyx-800'
                      : 'hover:bg-powder-100'
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
                        ? 'text-onyx-500 hover:text-yellow-400'
                        : 'text-onyx-400 hover:text-yellow-400')
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
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown, Star, Upload } from 'lucide-vue-next'
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

const inputCls = computed(() =>
  themeStore.darkMode
    ? 'bg-onyx-800 border-onyx-700 text-powder-200'
    : 'bg-white border-powder-200 text-onyx-800',
)
const activeBtnCls = computed(() =>
  themeStore.darkMode ? 'bg-violet-700 text-white' : 'bg-violet-100 text-violet-700',
)

function commit(key, value) {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, { [key]: value })
}

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
</script>
