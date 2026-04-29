import { defineStore } from 'pinia'
import {
  getBrandKit,
  updateBrandKit,
  uploadLogo as apiUploadLogo,
  deleteLogo as apiDeleteLogo,
} from '@/api/brandKit'

const DEFAULT_COLORS = ['#e83800', '#22bcf5', '#1a1a2e', '#ffffff', '#000000', '#f5a623']

function _normalize(data) {
  return {
    colors: Array.isArray(data.colors) ? data.colors : [...DEFAULT_COLORS],
    font: typeof data.fonts === 'string' ? data.fonts : 'Poppins',
    logo: data.logo_url ?? null,
  }
}

export const useBrandKitStore = defineStore('brandKit', {
  state: () => ({
    colors: [...DEFAULT_COLORS],
    font: 'Poppins',
    logo: null,
  }),

  actions: {
    async loadForUser() {
      try {
        const { data } = await getBrandKit()
        const normalized = _normalize(data)
        this.colors = normalized.colors
        this.font = normalized.font
        this.logo = normalized.logo
      } catch {
        // Non connecté ou erreur réseau — garder les valeurs par défaut
      }
    },

    clearForUser() {
      this.colors = [...DEFAULT_COLORS]
      this.font = 'Poppins'
      this.logo = null
    },

    addColor(hex) {
      const normalized = hex.toLowerCase()
      if (!this.colors.includes(normalized) && this.colors.length < 10) {
        this.colors.push(normalized)
        updateBrandKit({ colors: this.colors, fonts: this.font }).catch(() => {})
      }
    },

    removeColor(hex) {
      this.colors = this.colors.filter((c) => c !== hex)
      updateBrandKit({ colors: this.colors, fonts: this.font }).catch(() => {})
    },

    setFont(font) {
      this.font = font
      updateBrandKit({ colors: this.colors, fonts: font }).catch(() => {})
    },

    reset() {
      this.colors = [...DEFAULT_COLORS]
      this.font = 'Poppins'
      updateBrandKit({ colors: this.colors, fonts: this.font }).catch(() => {})
    },

    async uploadLogo(file) {
      const { data } = await apiUploadLogo(file)
      this.logo = data.logo_url ?? null
    },

    async deleteLogo() {
      await apiDeleteLogo()
      this.logo = null
    },
  },
})
