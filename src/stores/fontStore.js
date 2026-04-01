/**
 * Google Fonts store — manages font loading via WebFontLoader.
 * Uses an embedded font list (no API key required).
 * Fonts are loaded on-demand via Google Fonts CSS when selected or previewed.
 * Also supports custom font upload (TTF/OTF/WOFF/WOFF2) stored in localStorage.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import WebFont from 'webfontloader'
import { GOOGLE_FONTS, FONT_FAMILIES } from '@/data/googleFonts'
import { useAuthStore } from './authStore'

const LS_PREFIX = 'ecodev_custom_fonts_'
const LS_FAV_PREFIX = 'ecodev_favorite_fonts_'
const MAX_CUSTOM_FONTS = 20
const MAX_LS_BYTES = 4.5 * 1024 * 1024 // 4.5 MB safety guard

// The 25 most popular fonts — pre-loaded at startup for instant preview
const POPULAR_FONTS = [
  'Inter',
  'Poppins',
  'Montserrat',
  'Roboto',
  'Open Sans',
  'Lato',
  'Raleway',
  'Oswald',
  'Playfair Display',
  'Merriweather',
  'Nunito',
  'Dancing Script',
  'Fira Code',
  'Bebas Neue',
  'Pacifico',
  'Caveat',
  'Quicksand',
  'Rubik',
  'Work Sans',
  'Josefin Sans',
  'Archivo',
  'DM Sans',
  'Outfit',
  'Space Grotesk',
  'Plus Jakarta Sans',
]

/** Get user-specific localStorage key for custom fonts */
function _lsKey() {
  const email = useAuthStore().user?.email
  return email ? LS_PREFIX + email : null
}

/** Get user-specific localStorage key for favorite fonts */
function _lsFavKey() {
  const email = useAuthStore().user?.email
  return email ? LS_FAV_PREFIX + email : null
}

/** Read raw custom fonts from localStorage → array of { name, base64 } */
function _readLS() {
  try {
    const key = _lsKey()
    if (!key) return []
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

/** Persist custom fonts array to localStorage. Returns false if over size limit. */
function _writeLS(arr) {
  try {
    const key = _lsKey()
    if (!key) return false
    const str = JSON.stringify(arr)
    if (str.length > MAX_LS_BYTES) return false
    localStorage.setItem(key, str)
    return true
  } catch {
    return false
  }
}

function _readFavoritesLS() {
  try {
    const key = _lsFavKey()
    if (!key) return []
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch { return [] }
}

function _writeFavoritesLS(arr) {
  try {
    const key = _lsFavKey()
    if (!key) return false
    localStorage.setItem(key, JSON.stringify(arr)); return true
  } catch { return false }
}

/** Inject a font into the browser via FontFace API. Returns resolved promise when active. */
async function _injectFont(name, base64) {
  try {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const face = new FontFace(name, bytes.buffer)
    const loaded = await face.load()
    document.fonts.add(loaded)
    return true
  } catch (e) {
    console.warn('[fontStore] Failed to inject custom font:', name, e)
    return false
  }
}

export const useFontStore = defineStore('fonts', () => {
  // All fonts available (from embedded list) — ready immediately
  const allFonts = ref(GOOGLE_FONTS)
  const loadedFonts = ref(new Set(POPULAR_FONTS))
  const loadingFonts = ref(new Set())
  // Simple counter that increments each time any font finishes loading — easy to watch in Konva
  const loadedCount = ref(POPULAR_FONTS.length)
  // Always "fetched" since we use embedded list
  const fetched = ref(true)

  // Custom uploaded fonts: array of { name }  (base64 only in localStorage)
  const customFonts = ref([])

  // Favorite fonts: persisted Set of font family names
  const favoriteFonts = ref(new Set())

  const popularFonts = computed(() => POPULAR_FONTS)

  const favoriteFontsList = computed(() => [...favoriteFonts.value].sort((a, b) => a.localeCompare(b)))

  // All font family names sorted: custom first, then popular, then the rest alphabetically
  const allFontFamilies = computed(() => {
    const customNames = customFonts.value.map((f) => f.name)
    const popularSet = new Set(POPULAR_FONTS)
    const others = FONT_FAMILIES.filter((f) => !popularSet.has(f)).sort((a, b) =>
      a.localeCompare(b),
    )
    return [...customNames, ...POPULAR_FONTS, ...others]
  })

  const fontsByCategory = computed(() => {
    const map = {}
    allFonts.value.forEach((f) => {
      const cat = f.category || 'sans-serif'
      if (!map[cat]) map[cat] = []
      map[cat].push(f.family)
    })
    return map
  })

  // Search fonts by name — searches through the full embedded list + custom fonts
  function searchFonts(query) {
    const customNames = customFonts.value.map((f) => f.name)
    if (!query) return [...customNames, ...allFontFamilies.value.filter((f) => !customNames.includes(f))]
    const q = query.toLowerCase()
    const matchCustom = customNames.filter((f) => f.toLowerCase().includes(q))
    const matchGoogle = FONT_FAMILIES.filter((f) => f.toLowerCase().includes(q))
    return [...matchCustom, ...matchGoogle]
  }

  /**
   * Upload a custom font file (.ttf/.otf/.woff/.woff2).
   * Injects into browser, persists base64 to localStorage.
   * Returns { success, error }.
   */
  async function addCustomFont(file) {
    if (!file) return { success: false, error: 'Aucun fichier' }

    // Also accept by extension
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['ttf', 'otf', 'woff', 'woff2'].includes(ext)) {
      return { success: false, error: 'Format non supporté. Utilisez TTF, OTF, WOFF ou WOFF2.' }
    }

    if (customFonts.value.length >= MAX_CUSTOM_FONTS) {
      return { success: false, error: `Maximum ${MAX_CUSTOM_FONTS} polices personnalisées.` }
    }

    // Derive font name from filename (strip extension, clean dashes/underscores)
    const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    const name = rawName.charAt(0).toUpperCase() + rawName.slice(1)

    if (customFonts.value.some((f) => f.name === name)) {
      return { success: false, error: `La police "${name}" est déjà chargée.` }
    }

    // Read file as base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const b64 = btoa(new Uint8Array(e.target.result).reduce((d, b) => d + String.fromCharCode(b), ''))
        resolve(b64)
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })

    const ok = await _injectFont(name, base64)
    if (!ok) return { success: false, error: 'Impossible de charger cette police.' }

    // Save to localStorage
    const stored = _readLS()
    stored.push({ name, base64 })
    const saved = _writeLS(stored)

    customFonts.value = [...customFonts.value, { name }]
    loadedFonts.value = new Set([...loadedFonts.value, name])
    loadedCount.value++

    if (!saved) {
      return { success: true, warning: 'Police chargée mais non sauvegardée (stockage plein). Elle sera perdue au rechargement.' }
    }
    return { success: true }
  }

  /** Remove a custom font by name. */
  function removeCustomFont(name) {
    customFonts.value = customFonts.value.filter((f) => f.name !== name)
    const stored = _readLS().filter((f) => f.name !== name)
    _writeLS(stored)
    // Also remove from favorites if present
    if (favoriteFonts.value.has(name)) {
      const next = new Set(favoriteFonts.value)
      next.delete(name)
      favoriteFonts.value = next
      _writeFavoritesLS([...next])
    }
  }

  function isFavorite(name) {
    return favoriteFonts.value.has(name)
  }

  function toggleFavorite(name) {
    const next = new Set(favoriteFonts.value)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    favoriteFonts.value = next
    _writeFavoritesLS([...next])
  }

  /**
   * Load a font by name via WebFontLoader. Returns a promise that resolves when active.
   * If already loaded, resolves immediately.
   */
  function loadFont(family) {
    if (!family) return Promise.resolve()
    if (loadedFonts.value.has(family)) return Promise.resolve()
    // Custom fonts are already injected — just mark as loaded
    if (customFonts.value.some((f) => f.name === family)) {
      loadedFonts.value = new Set([...loadedFonts.value, family])
      return Promise.resolve()
    }
    if (loadingFonts.value.has(family)) {
      // Already in flight — poll until done
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (loadedFonts.value.has(family)) {
            clearInterval(check)
            resolve()
          }
        }, 100)
        setTimeout(() => {
          clearInterval(check)
          resolve()
        }, 5000)
      })
    }

    loadingFonts.value = new Set([...loadingFonts.value, family])

    return new Promise((resolve) => {
      WebFont.load({
        google: { families: [`${family}:400,700,400italic,700italic`] },
        fontactive: (loadedFamily) => {
          loadedFonts.value = new Set([...loadedFonts.value, loadedFamily])
          loadedCount.value++
          const next = new Set(loadingFonts.value)
          next.delete(loadedFamily)
          loadingFonts.value = next
          resolve()
        },
        fontinactive: (failedFamily) => {
          console.warn(`[fontStore] Failed to load: ${failedFamily}`)
          const next = new Set(loadingFonts.value)
          next.delete(failedFamily)
          loadingFonts.value = next
          resolve()
        },
        timeout: 5000,
      })
    })
  }

  /** Load multiple fonts (e.g. all used on a card). */
  function loadFonts(families) {
    const toLoad = [...new Set(families)].filter((f) => f && !loadedFonts.value.has(f))
    if (!toLoad.length) return Promise.resolve()
    return Promise.all(toLoad.map((f) => loadFont(f)))
  }

  /** Extract and load all Google Fonts used by a card's elements. */
  function loadCardFonts(card) {
    const fonts = new Set()
    if (card?.data?.fontFamily) fonts.add(card.data.fontFamily)
    const els = [...(card?.data?.elements || []), ...(card?.data?.versoElements || [])]
    els.forEach((el) => {
      if (el.fontFamily) fonts.add(el.fontFamily)
    })
    return loadFonts([...fonts])
  }

  /** Pre-load popular fonts at app startup for instant previews. Also restores custom fonts. */
  async function init() {
    // Load user-specific custom fonts and favorites
    await reloadUserFonts()

    // Pre-load popular Google Fonts
    WebFont.load({
      google: { families: POPULAR_FONTS.map((f) => `${f}:400,700`) },
      fontactive: (family) => {
        loadedFonts.value = new Set([...loadedFonts.value, family])
        loadedCount.value++
      },
    })
  }

  /** Reload custom fonts and favorites for the current user (call on login/logout). */
  async function reloadUserFonts() {
    // Clear previous user's custom fonts from state (not from browser — they stay injected)
    customFonts.value = []
    favoriteFonts.value = new Set()

    // Restore favorite fonts from user-specific localStorage
    const storedFavs = _readFavoritesLS()
    if (storedFavs.length) favoriteFonts.value = new Set(storedFavs)

    // Restore custom fonts from user-specific localStorage
    const stored = _readLS()
    for (const { name, base64 } of stored) {
      const ok = await _injectFont(name, base64)
      if (ok) {
        customFonts.value = [...customFonts.value, { name }]
        loadedFonts.value = new Set([...loadedFonts.value, name])
        loadedCount.value++
      }
    }
  }

  return {
    allFonts,
    allFontFamilies,
    loadedFonts,
    loadingFonts,
    loadedCount,
    fetched,
    popularFonts,
    fontsByCategory,
    customFonts,
    favoriteFonts,
    favoriteFontsList,
    isFavorite,
    toggleFavorite,
    searchFonts,
    loadFont,
    loadFonts,
    loadCardFonts,
    addCustomFont,
    removeCustomFont,
    init,
    reloadUserFonts,
  }
})
