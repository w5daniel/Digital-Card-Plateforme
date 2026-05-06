/**
 * Google Fonts store — manages font loading via WebFontLoader.
 * Uses an embedded font list (no API key required).
 * Fonts are loaded on-demand via Google Fonts CSS when selected or previewed.
 * Also supports custom font upload (TTF/OTF/WOFF/WOFF2) stored in IndexedDB.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import WebFont from 'webfontloader'
import { GOOGLE_FONTS, FONT_FAMILIES } from '@/data/googleFonts'
import { useAuthStore } from './authStore'

// Legacy localStorage prefix — used only for one-time migration
const LS_PREFIX = 'ecodev_custom_fonts_'
const LS_FAV_PREFIX = 'ecodev_favorite_fonts_'
const MAX_CUSTOM_FONTS = 20

const IDB_NAME = 'ecodev_fonts'
const IDB_STORE = 'fonts'
const IDB_VERSION = 1

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

// ── IndexedDB helpers ──────────────────────────────────────────────────────────

function _openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        const store = db.createObjectStore(IDB_STORE, { keyPath: 'key' })
        store.createIndex('email', 'email', { unique: false })
      }
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

function _idbKey(email, name) {
  return `${email}__${name}`
}

async function _idbReadAll(email) {
  try {
    const db = await _openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const index = tx.objectStore(IDB_STORE).index('email')
      const req = index.getAll(email)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return []
  }
}

async function _idbWrite(email, name, buffer) {
  try {
    const db = await _openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      const store = tx.objectStore(IDB_STORE)
      const req = store.put({ key: _idbKey(email, name), email, name, buffer })
      req.onsuccess = () => resolve(true)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return false
  }
}

async function _idbDelete(email, name) {
  try {
    const db = await _openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      const store = tx.objectStore(IDB_STORE)
      const req = store.delete(_idbKey(email, name))
      req.onsuccess = () => resolve(true)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return false
  }
}

// ── Legacy localStorage helpers (migration only) ───────────────────────────────

function _lsKey(email) {
  return email ? LS_PREFIX + email : null
}

function _readLegacyLS(email) {
  try {
    const key = _lsKey(email)
    if (!key) return []
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

// ── Favorites (localStorage, tiny data) ───────────────────────────────────────

function _lsFavKey() {
  const email = useAuthStore().user?.email
  return email ? LS_FAV_PREFIX + email : null
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

// ── Font injection ─────────────────────────────────────────────────────────────

/** Inject a font into the browser via FontFace API using an ArrayBuffer. */
async function _injectFont(name, buffer) {
  try {
    const face = new FontFace(name, buffer)
    const loaded = await face.load()
    document.fonts.add(loaded)
    return true
  } catch (e) {
    console.warn('[fontStore] Failed to inject custom font:', name, e)
    return false
  }
}

// ── Store ──────────────────────────────────────────────────────────────────────

export const useFontStore = defineStore('fonts', () => {
  const allFonts = ref(GOOGLE_FONTS)
  const loadedFonts = ref(new Set(POPULAR_FONTS))
  const loadingFonts = ref(new Set())
  // Simple counter that increments each time any font finishes loading — easy to watch in Konva
  const loadedCount = ref(POPULAR_FONTS.length)
  const fetched = ref(true)

  // Custom uploaded fonts: array of { name }  (binary only in IndexedDB)
  const customFonts = ref([])

  const favoriteFonts = ref(new Set())

  const popularFonts = computed(() => POPULAR_FONTS)

  const favoriteFontsList = computed(() => [...favoriteFonts.value].sort((a, b) => a.localeCompare(b)))

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
   * Injects into browser, persists ArrayBuffer to IndexedDB.
   * Returns { success, error?, warning? }.
   */
  async function addCustomFont(file) {
    if (!file) return { success: false, error: 'Aucun fichier' }

    const ext = file.name.split('.').pop().toLowerCase()
    if (!['ttf', 'otf', 'woff', 'woff2'].includes(ext)) {
      return { success: false, error: 'Format non supporté. Utilisez TTF, OTF, WOFF ou WOFF2.' }
    }

    if (customFonts.value.length >= MAX_CUSTOM_FONTS) {
      return { success: false, error: `Maximum ${MAX_CUSTOM_FONTS} polices personnalisées.` }
    }

    const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    const name = rawName.charAt(0).toUpperCase() + rawName.slice(1)

    if (customFonts.value.some((f) => f.name === name)) {
      return { success: false, error: `La police "${name}" est déjà chargée.` }
    }

    const buffer = await file.arrayBuffer()

    const ok = await _injectFont(name, buffer)
    if (!ok) return { success: false, error: 'Impossible de charger cette police.' }

    customFonts.value = [...customFonts.value, { name }]
    loadedFonts.value = new Set([...loadedFonts.value, name])
    loadedCount.value++

    const email = useAuthStore().user?.email
    if (email) {
      const saved = await _idbWrite(email, name, buffer)
      if (!saved) {
        return { success: true, warning: 'Police chargée mais non sauvegardée. Elle sera perdue au rechargement.' }
      }
    }

    return { success: true }
  }

  /** Remove a custom font by name. */
  async function removeCustomFont(name) {
    customFonts.value = customFonts.value.filter((f) => f.name !== name)
    const email = useAuthStore().user?.email
    if (email) await _idbDelete(email, name)
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
    if (customFonts.value.some((f) => f.name === family)) {
      loadedFonts.value = new Set([...loadedFonts.value, family])
      return Promise.resolve()
    }
    if (loadingFonts.value.has(family)) {
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

  function loadFonts(families) {
    const toLoad = [...new Set(families)].filter((f) => f && !loadedFonts.value.has(f))
    if (!toLoad.length) return Promise.resolve()
    return Promise.all(toLoad.map((f) => loadFont(f)))
  }

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
    await reloadUserFonts()

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
    customFonts.value = []
    favoriteFonts.value = new Set()

    const storedFavs = _readFavoritesLS()
    if (storedFavs.length) favoriteFonts.value = new Set(storedFavs)

    const email = useAuthStore().user?.email
    if (!email) return

    // One-time migration: move legacy base64 data from localStorage → IndexedDB
    const legacy = _readLegacyLS(email)
    if (legacy.length > 0) {
      for (const { name, base64 } of legacy) {
        try {
          const binary = atob(base64)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
          await _idbWrite(email, name, bytes.buffer)
        } catch { /* police corrompue — ignorer */ }
      }
      localStorage.removeItem(LS_PREFIX + email)
    }

    const stored = await _idbReadAll(email)
    for (const { name, buffer } of stored) {
      const ok = await _injectFont(name, buffer)
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
