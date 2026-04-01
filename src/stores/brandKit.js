import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'

const LS_PREFIX_COLORS = 'brandKit_colors_'
const LS_PREFIX_FONT = 'brandKit_font_'

const DEFAULT_COLORS = ['#e83800', '#22bcf5', '#1a1a2e', '#ffffff', '#000000', '#f5a623']

export const useBrandKitStore = defineStore('brandKit', {
  state: () => ({
    colors: [...DEFAULT_COLORS],
    font: 'Poppins',
  }),

  actions: {
    _lsKeyColors() {
      const email = useAuthStore().user?.email
      return email ? LS_PREFIX_COLORS + email : null
    },

    _lsKeyFont() {
      const email = useAuthStore().user?.email
      return email ? LS_PREFIX_FONT + email : null
    },

    /** Load brand kit from user-specific localStorage */
    loadForUser() {
      const ck = this._lsKeyColors()
      const fk = this._lsKeyFont()
      if (ck) {
        try {
          const v = localStorage.getItem(ck)
          this.colors = v ? JSON.parse(v) : [...DEFAULT_COLORS]
        } catch {
          this.colors = [...DEFAULT_COLORS]
        }
      } else {
        this.colors = [...DEFAULT_COLORS]
      }
      this.font = (fk && localStorage.getItem(fk)) || 'Poppins'
    },

    /** Clear brand kit (on logout) */
    clearForUser() {
      this.colors = [...DEFAULT_COLORS]
      this.font = 'Poppins'
    },

    addColor(hex) {
      const normalized = hex.toLowerCase()
      if (!this.colors.includes(normalized) && this.colors.length < 10) {
        this.colors.push(normalized)
        const key = this._lsKeyColors()
        if (key) localStorage.setItem(key, JSON.stringify(this.colors))
      }
    },

    removeColor(hex) {
      this.colors = this.colors.filter((c) => c !== hex)
      const key = this._lsKeyColors()
      if (key) localStorage.setItem(key, JSON.stringify(this.colors))
    },

    setFont(font) {
      this.font = font
      const key = this._lsKeyFont()
      if (key) localStorage.setItem(key, font)
    },

    reset() {
      this.colors = [...DEFAULT_COLORS]
      this.font = 'Poppins'
      const ck = this._lsKeyColors()
      const fk = this._lsKeyFont()
      if (ck) localStorage.setItem(ck, JSON.stringify(this.colors))
      if (fk) localStorage.setItem(fk, this.font)
    },
  },
})
