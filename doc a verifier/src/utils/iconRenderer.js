/**
 * Shared icon-to-SVG-data-URL utility.
 * Extracts the duplicated logic from EditorCanvas.vue and cardExporter.js
 * into a single reusable function.
 */
import { loadIcon } from '@iconify/vue'

/**
 * Load an Iconify icon and return it as an SVG data URL string.
 * For non-colorful icons, replaces `currentColor` with the given fill.
 *
 * @param {string} iconId — Iconify icon ID (e.g. 'mdi:account')
 * @param {string} fill — Hex color to inject (default '#000000')
 * @param {boolean} colorful — If true, preserve original SVG colors
 * @returns {Promise<string|null>} — SVG data URL or null on failure
 */
export async function iconToDataUrl(iconId, fill = '#000000', colorful = false) {
  try {
    const data = await loadIcon(iconId)
    if (!data) return null
    const body = colorful ? data.body : data.body.replace(/currentColor/g, fill)
    const w = data.width || 24
    const h = data.height || 24
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  } catch {
    return null
  }
}
