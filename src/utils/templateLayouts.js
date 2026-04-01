/**
 * Template layout definitions shared between GalleryView (CSS preview)
 * and EditorView (Konva canvas initialization).
 *
 * buildElements()      → % coords for BusinessCard.vue CSS rendering
 * buildEditorElements() → px coords for Konva canvas in useEditorStore
 */

// ── Konva canvas card dimensions (must match useEditorStore.js) ───────────
import { DEFAULT_QR_FIELDS } from '@/utils/qrCodeHelper'

const CARD_W = 680
const CARD_H = 429

// BusinessCard.vue native render width (templates designed at this size)
const NATIVE_W = 500

// ── Layout map: template slug → layout variant ────────────────────────────
export const LAYOUT_MAP = {
  modern: 'diag',
  minimal: 'center',
  creative: 'creative',
  professional: 'split',
  elegant: 'split',
  tech: 'tech',
  cyberpunk: 'tech',
  forest: 'split',
  ocean: 'diag',
  sunset: 'creative',
  luxury: 'center',
  slate: 'split',
  coral: 'creative',
  midnight: 'center',
}

// ── Default person for editor initial state ───────────────────────────────
export const DEFAULT_EDITOR_PERSON = {
  fullName: 'Prénom Nom',
  title: 'Votre titre professionnel',
  company: 'MON ENTREPRISE',
  email: 'email@monentreprise.fr',
  phone: '+33 6 00 00 00 00',
  website: 'www.monentreprise.fr',
}

// ── Element builders — positions are % of card width / height ─────────────
// Used by GalleryView for CSS-based BusinessCard previews.
export function buildElements(layout, person, colors = {}) {
  const tc = colors.text || '#ffffff'
  const ac = colors.secondary || tc
  const pc = colors.primary || '#1a1a2e'
  const [firstName, ...rest] = person.fullName.split(' ')
  const lastName = rest.join(' ')

  // Detect light-background templates (e.g. blank = white)
  const rgb = parseInt((pc.replace('#', '') + '000000').slice(0, 6), 16)
  const r = (rgb >> 16) & 0xff,
    g = (rgb >> 8) & 0xff,
    b = rgb & 0xff
  const isLight = (r * 299 + g * 587 + b * 114) / 1000 > 160

  // ── SPLIT: dark left panel (template bg) + white right panel ──────────
  if (layout === 'split') {
    return [
      { id: 'b0', type: 'block', x: 37, y: 0, w: 63, h: 100, bgColor: '#f8fafc', zIndex: 1 },
      { id: 'b1', type: 'block', x: 37, y: 0, w: 1.5, h: 100, bgColor: ac, zIndex: 2 },
      {
        id: 'b2',
        type: 'block',
        x: 8,
        y: 20,
        w: 21,
        h: 38,
        bgColor: 'rgba(255,255,255,0.12)',
        borderRadius: 50,
        zIndex: 2,
      },
      {
        id: 't0',
        type: 'text',
        role: 'company',
        text: person.company.slice(0, 2).toUpperCase(),
        x: 9,
        y: 26,
        w: 19,
        h: 24,
        fontSize: 17,
        bold: true,
        textAlign: 'center',
        color: tc,
        zIndex: 3,
      },
      {
        id: 't1',
        type: 'text',
        role: 'company',
        text: person.company,
        x: 2,
        y: 75,
        w: 33,
        h: 10,
        fontSize: 7.5,
        textAlign: 'center',
        letterSpacing: 1,
        color: 'rgba(255,255,255,0.45)',
        zIndex: 2,
      },
      {
        id: 'fn',
        type: 'text',
        role: 'firstName',
        text: firstName,
        x: 41,
        y: 7,
        w: 57,
        h: 18,
        fontSize: 22,
        bold: true,
        color: '#1a1a2e',
        zIndex: 3,
      },
      {
        id: 'ln',
        type: 'text',
        role: 'lastName',
        text: lastName,
        x: 41,
        y: 24,
        w: 57,
        h: 14,
        fontSize: 17,
        bold: true,
        color: '#1a1a2e',
        zIndex: 3,
      },
      {
        id: 'ti',
        type: 'text',
        role: 'title',
        text: person.title,
        x: 41,
        y: 41,
        w: 57,
        h: 10,
        fontSize: 11,
        italic: true,
        color: ac,
        zIndex: 3,
      },
      { id: 'b3', type: 'block', x: 41, y: 54, w: 54, h: 0.8, bgColor: '#d1d5db', zIndex: 3 },
      {
        id: 'em',
        type: 'contact',
        role: 'email',
        text: person.email,
        x: 41,
        y: 58,
        w: 57,
        h: 10,
        fontSize: 8.5,
        color: '#374151',
        zIndex: 3,
      },
      {
        id: 'ph',
        type: 'contact',
        role: 'phone',
        text: person.phone,
        x: 41,
        y: 70,
        w: 54,
        h: 10,
        fontSize: 8.5,
        color: '#374151',
        zIndex: 3,
      },
      {
        id: 'wb',
        type: 'contact',
        role: 'website',
        text: person.website,
        x: 41,
        y: 82,
        w: 57,
        h: 9,
        fontSize: 8.5,
        color: ac,
        zIndex: 3,
      },
    ]
  }

  // ── DIAG: white diagonal trapezoid (left) + template bg (right) ────────
  if (layout === 'diag') {
    return [
      {
        id: 'b0',
        type: 'block',
        x: 0,
        y: 0,
        w: 100,
        h: 100,
        bgColor: '#f8fafc',
        clipPath: 'polygon(0 0, 61% 0, 45% 100%, 0 100%)',
        zIndex: 1,
      },
      {
        id: 'b1',
        type: 'block',
        x: 0,
        y: 0,
        w: 100,
        h: 100,
        bgColor: ac,
        clipPath: 'polygon(61% 0, 63.5% 0, 47.5% 100%, 45% 100%)',
        zIndex: 2,
      },
      {
        id: 'fn',
        type: 'text',
        role: 'firstName',
        text: firstName,
        x: 4,
        y: 7,
        w: 55,
        h: 20,
        fontSize: 23,
        bold: true,
        color: '#1a1a2e',
        zIndex: 3,
      },
      {
        id: 'ln',
        type: 'text',
        role: 'lastName',
        text: lastName,
        x: 4,
        y: 26,
        w: 55,
        h: 14,
        fontSize: 17,
        bold: true,
        color: '#1a1a2e',
        zIndex: 3,
      },
      {
        id: 'ti',
        type: 'text',
        role: 'title',
        text: person.title,
        x: 4,
        y: 43,
        w: 55,
        h: 9,
        fontSize: 11,
        italic: true,
        color: ac,
        zIndex: 3,
      },
      { id: 'b2', type: 'block', x: 4, y: 55, w: 38, h: 0.8, bgColor: '#9ca3af', zIndex: 3 },
      {
        id: 'em',
        type: 'contact',
        role: 'email',
        text: person.email,
        x: 4,
        y: 59,
        w: 52,
        h: 9,
        fontSize: 8.5,
        color: '#374151',
        zIndex: 3,
      },
      {
        id: 'ph',
        type: 'contact',
        role: 'phone',
        text: person.phone,
        x: 4,
        y: 70,
        w: 52,
        h: 9,
        fontSize: 8.5,
        color: '#374151',
        zIndex: 3,
      },
      {
        id: 'wb',
        type: 'contact',
        role: 'website',
        text: person.website,
        x: 4,
        y: 81,
        w: 52,
        h: 8,
        fontSize: 8.5,
        color: '#374151',
        zIndex: 3,
      },
      {
        id: 'co',
        type: 'text',
        role: 'company',
        text: person.company.toUpperCase(),
        x: 66,
        y: 8,
        w: 32,
        h: 10,
        fontSize: 9,
        bold: true,
        textAlign: 'right',
        letterSpacing: 1.5,
        color: tc,
        zIndex: 3,
      },
      {
        id: 'b3',
        type: 'block',
        x: 79,
        y: 72,
        w: 18,
        h: 30,
        bgColor: 'rgba(255,255,255,0.07)',
        borderRadius: 50,
        zIndex: 2,
      },
    ]
  }

  // ── TECH: top band + two-column layout ────────────────────────────────
  if (layout === 'tech') {
    return [
      {
        id: 'b0',
        type: 'block',
        x: 0,
        y: 0,
        w: 100,
        h: 22,
        bgColor: 'rgba(0,0,0,0.35)',
        zIndex: 1,
      },
      { id: 'b1', type: 'block', x: 0, y: 21.2, w: 100, h: 1.5, bgColor: ac, zIndex: 2 },
      {
        id: 'co',
        type: 'text',
        role: 'company',
        text: person.company.toUpperCase(),
        x: 5,
        y: 5,
        w: 90,
        h: 12,
        fontSize: 12,
        bold: true,
        letterSpacing: 3,
        color: 'rgba(255,255,255,0.88)',
        zIndex: 3,
      },
      {
        id: 'fn',
        type: 'text',
        role: 'firstName',
        text: firstName,
        x: 5,
        y: 27,
        w: 56,
        h: 19,
        fontSize: 23,
        bold: true,
        color: tc,
        zIndex: 3,
      },
      {
        id: 'ln',
        type: 'text',
        role: 'lastName',
        text: lastName,
        x: 5,
        y: 46,
        w: 56,
        h: 14,
        fontSize: 17,
        color: tc,
        zIndex: 3,
      },
      {
        id: 'ti',
        type: 'text',
        role: 'title',
        text: person.title,
        x: 5,
        y: 63,
        w: 56,
        h: 10,
        fontSize: 11,
        italic: true,
        color: ac,
        zIndex: 3,
      },
      {
        id: 'em',
        type: 'contact',
        role: 'email',
        text: person.email,
        x: 62,
        y: 27,
        w: 36,
        h: 10,
        fontSize: 8.5,
        color: tc,
        zIndex: 3,
      },
      {
        id: 'ph',
        type: 'contact',
        role: 'phone',
        text: person.phone,
        x: 62,
        y: 42,
        w: 36,
        h: 10,
        fontSize: 8.5,
        color: tc,
        zIndex: 3,
      },
      {
        id: 'wb',
        type: 'contact',
        role: 'website',
        text: person.website,
        x: 62,
        y: 57,
        w: 36,
        h: 9,
        fontSize: 8.5,
        color: ac,
        zIndex: 3,
      },
      {
        id: 'b2',
        type: 'block',
        x: 0,
        y: 87,
        w: 100,
        h: 13,
        bgColor: 'rgba(0,0,0,0.3)',
        zIndex: 1,
      },
    ]
  }

  // ── CREATIVE: diagonal strip (template bg) + white panel ──────────────
  if (layout === 'creative') {
    return [
      {
        id: 'b0',
        type: 'block',
        x: 0,
        y: 0,
        w: 100,
        h: 100,
        bgColor: 'rgba(255,255,255,0.96)',
        clipPath: 'polygon(13% 0, 100% 0, 100% 100%, 4% 100%)',
        zIndex: 1,
      },
      {
        id: 'b1',
        type: 'block',
        x: 76,
        y: -18,
        w: 26,
        h: 46,
        bgColor: ac,
        borderRadius: 50,
        zIndex: 2,
      },
      {
        id: 'b2',
        type: 'block',
        x: 82,
        y: -8,
        w: 18,
        h: 32,
        bgColor: '#ffffff',
        borderRadius: 50,
        zIndex: 3,
      },
      {
        id: 'fn',
        type: 'text',
        role: 'firstName',
        text: firstName,
        x: 17,
        y: 7,
        w: 60,
        h: 20,
        fontSize: 23,
        bold: true,
        color: '#1a1a2e',
        zIndex: 4,
      },
      {
        id: 'ln',
        type: 'text',
        role: 'lastName',
        text: lastName,
        x: 17,
        y: 26,
        w: 60,
        h: 14,
        fontSize: 17,
        bold: true,
        color: '#1a1a2e',
        zIndex: 4,
      },
      {
        id: 'ti',
        type: 'text',
        role: 'title',
        text: person.title,
        x: 17,
        y: 43,
        w: 64,
        h: 9,
        fontSize: 11,
        italic: true,
        color: pc,
        zIndex: 4,
      },
      {
        id: 'co',
        type: 'text',
        role: 'company',
        text: person.company,
        x: 17,
        y: 53,
        w: 64,
        h: 9,
        fontSize: 10,
        bold: true,
        color: ac,
        zIndex: 4,
      },
      { id: 'b3', type: 'block', x: 17, y: 64, w: 71, h: 0.8, bgColor: '#e5e7eb', zIndex: 4 },
      {
        id: 'em',
        type: 'contact',
        role: 'email',
        text: person.email,
        x: 17,
        y: 68,
        w: 74,
        h: 9,
        fontSize: 8.5,
        color: '#374151',
        zIndex: 4,
      },
      {
        id: 'ph',
        type: 'contact',
        role: 'phone',
        text: person.phone,
        x: 17,
        y: 79,
        w: 74,
        h: 9,
        fontSize: 8.5,
        color: '#374151',
        zIndex: 4,
      },
      {
        id: 'wb',
        type: 'contact',
        role: 'website',
        text: person.website,
        x: 17,
        y: 90,
        w: 74,
        h: 8,
        fontSize: 8.5,
        color: pc,
        zIndex: 4,
      },
    ]
  }

  // ── CENTER: centered elegant (default / minimal / luxury / midnight) ──
  const sepColor = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.25)'
  const botBg = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.3)'
  const ctcText = isLight ? '#374151' : 'rgba(255,255,255,0.7)'
  const acColor = isLight ? pc : ac
  return [
    {
      id: 'co',
      type: 'text',
      role: 'company',
      text: person.company.toUpperCase(),
      x: 5,
      y: 6,
      w: 90,
      h: 11,
      fontSize: 9.5,
      textAlign: 'center',
      letterSpacing: 3,
      color: acColor,
      zIndex: 2,
    },
    { id: 'b0', type: 'block', x: 35, y: 19, w: 30, h: 0.7, bgColor: sepColor, zIndex: 2 },
    {
      id: 'fn',
      type: 'text',
      role: 'firstName',
      text: firstName,
      x: 5,
      y: 24,
      w: 90,
      h: 18,
      fontSize: 24,
      bold: true,
      textAlign: 'center',
      color: tc,
      zIndex: 2,
    },
    {
      id: 'ln',
      type: 'text',
      role: 'lastName',
      text: lastName,
      x: 5,
      y: 42,
      w: 90,
      h: 13,
      fontSize: 18,
      bold: true,
      textAlign: 'center',
      color: tc,
      zIndex: 2,
    },
    {
      id: 'ti',
      type: 'text',
      role: 'title',
      text: person.title,
      x: 15,
      y: 57,
      w: 70,
      h: 9,
      fontSize: 11,
      italic: true,
      textAlign: 'center',
      color: ctcText,
      zIndex: 2,
    },
    { id: 'b1', type: 'block', x: 25, y: 68, w: 50, h: 0.7, bgColor: sepColor, zIndex: 2 },
    { id: 'b2', type: 'block', x: 0, y: 84, w: 100, h: 16, bgColor: botBg, zIndex: 1 },
    {
      id: 'em',
      type: 'contact',
      role: 'email',
      text: person.email,
      x: 4,
      y: 72,
      w: 44,
      h: 9,
      fontSize: 8.5,
      textAlign: 'left',
      color: ctcText,
      zIndex: 3,
    },
    {
      id: 'ph',
      type: 'contact',
      role: 'phone',
      text: person.phone,
      x: 50,
      y: 72,
      w: 46,
      h: 9,
      fontSize: 8.5,
      textAlign: 'left',
      color: ctcText,
      zIndex: 3,
    },
    {
      id: 'wb',
      type: 'contact',
      role: 'website',
      text: person.website,
      x: 15,
      y: 87,
      w: 70,
      h: 9,
      fontSize: 8.5,
      textAlign: 'center',
      color: acColor,
      zIndex: 3,
    },
  ]
}

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Parses a CSS clip-path polygon string into normalized [0..1] point pairs.
 * e.g. "polygon(0 0, 61% 0, 45% 100%, 0 100%)" → [[0,0],[0.61,0],[0.45,1],[0,1]]
 */
function parseClipPolygon(clipPath) {
  const m = clipPath.match(/polygon\((.+)\)/)
  if (!m) return null
  return m[1].split(',').map((pt) => {
    const parts = pt.trim().split(/\s+/)
    return parts.map((v) => parseFloat(v) / (v.includes('%') ? 100 : 1))
  })
}

/**
 * Converts gallery % elements → Konva px elements for the editor canvas.
 * The result can be passed directly to useEditorStore.initEditor().
 */
export function buildEditorElements(layout, person, colors = {}) {
  const galleryEls = buildElements(layout, person, colors)
  const fontScale = CARD_W / NATIVE_W // ≈ 1.36

  return galleryEls
    .map((el) => {
      const x = (el.x / 100) * CARD_W
      const y = (el.y / 100) * CARD_H
      const w = (el.w / 100) * CARD_W
      const h = (el.h / 100) * CARD_H
      const id = `tmpl_${el.id}`

      // ── Block elements → Konva shapes ──────────────────────────────────
      if (el.type === 'block') {
        const polyPts = el.clipPath ? parseClipPolygon(el.clipPath) : null
        const isCircle = (el.borderRadius || 0) >= 50

        // Diagonal / trapezoid via custom polygon
        if (polyPts) {
          return {
            id,
            type: 'shape',
            shapeType: 'custom-poly',
            x,
            y,
            width: w,
            height: h,
            polygonPoints: polyPts,
            fill: el.bgColor || '#ffffff',
            stroke: '',
            strokeWidth: 0,
            opacity: 1,
            zIndex: el.zIndex ?? 1,
            visible: true,
            draggable: true,
          }
        }

        // Extract opacity from rgba() color
        let fill = el.bgColor || '#ffffff'
        let opacity = 1
        const rgba = fill.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
        if (rgba) {
          opacity = parseFloat(rgba[4])
          fill = `rgb(${rgba[1]},${rgba[2]},${rgba[3]})`
        }

        // Circular elements (borderRadius ≥ 50)
        if (isCircle) {
          return {
            id,
            type: 'shape',
            shapeType: 'circle',
            x,
            y,
            width: w,
            height: h, // stored as top-left; buildEllipseConfig handles center
            fill,
            opacity,
            stroke: '',
            strokeWidth: 0,
            zIndex: el.zIndex ?? 1,
            visible: true,
            draggable: true,
          }
        }

        // Plain rectangle
        return {
          id,
          type: 'shape',
          shapeType: 'rect',
          x,
          y,
          width: w,
          height: h,
          fill,
          opacity,
          cornerRadius: 0,
          stroke: '',
          strokeWidth: 0,
          zIndex: el.zIndex ?? 1,
          visible: true,
          draggable: true,
        }
      }

      // ── Text / contact elements → Konva text ───────────────────────────
      if (el.type === 'text' || el.type === 'contact') {
        const fStyle =
          el.bold && el.italic ? 'bold italic' : el.bold ? 'bold' : el.italic ? 'italic' : 'normal'
        return {
          id,
          type: 'text',
          role: el.role || null,
          showContactIcon: el.type === 'contact',
          x,
          y,
          width: w,
          height: h,
          text: el.text || '',
          fontSize: Math.round((el.fontSize || 14) * fontScale),
          fontFamily: 'Inter',
          fill: el.color || '#ffffff',
          fontStyle: fStyle,
          align: el.textAlign || 'left',
          letterSpacing: el.letterSpacing ? el.letterSpacing * fontScale : 0,
          zIndex: el.zIndex ?? 2,
          visible: true,
          draggable: true,
        }
      }

      return null
    })
    .filter(Boolean)
}

/**
 * Reconstructs Konva editor elements from a saved BusinessCard % format.
 * Used when a card has card.data.elements but no card.data.editorData.
 */
export function rebuildEditorElements(elements = [], versoElements = [], targetW = CARD_W, targetH = CARD_H) {
  return {
    recto: _toEditorEls(elements, targetW, targetH),
    verso: _toEditorEls(versoElements, targetW, targetH),
  }
}

function _toEditorEls(els, targetW = CARD_W, targetH = CARD_H) {
  return (els || [])
    .map((el, i) => {
      const x = ((el.x || 0) / 100) * targetW
      const y = ((el.y || 0) / 100) * targetH
      const w = ((el.w || 10) / 100) * targetW
      const h = ((el.h || 10) / 100) * targetH
      const id = el.id || `restored_${i}`

      if (el.type === 'block') {
        const polyPts = el.clipPath ? parseClipPolygon(el.clipPath) : null
        const isCircle = (el.borderRadius || 0) >= 50
        const rgba = (el.bgColor || '').match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
        const fill = rgba ? `rgb(${rgba[1]},${rgba[2]},${rgba[3]})` : el.bgColor || '#000000'
        const opacity = rgba ? parseFloat(rgba[4]) : (el.opacity ?? 1)

        if (el.pathData) {
          return {
            id,
            type: 'shape',
            shapeType: 'path',
            x,
            y,
            width: w,
            height: h,
            pathData: el.pathData,
            pathViewBox: el.pathViewBox || [24, 24],
            fill: el.strokePath ? 'transparent' : fill,
            opacity,
            rotation: el.rotation || 0,
            stroke: el.strokePath || el.stroke || '',
            strokeWidth: el.strokeWidthPath || el.strokeWidth || 0,
            dash: el.dashPath || [],
            zIndex: el.zIndex ?? (i + 1),
            visible: el.visible !== false,
            draggable: true,
          }
        }
        if (polyPts) {
          return {
            id,
            type: 'shape',
            shapeType: 'custom-poly',
            x,
            y,
            width: w,
            height: h,
            polygonPoints: polyPts,
            fill,
            opacity,
            rotation: el.rotation || 0,
            stroke: el.stroke || '',
            strokeWidth: el.strokeWidth || 0,
            zIndex: el.zIndex ?? (i + 1),
            visible: el.visible !== false,
            draggable: true,
          }
        }
        if (isCircle) {
          return {
            id,
            type: 'shape',
            shapeType: 'circle',
            x,
            y,
            width: w,
            height: h,
            fill,
            opacity,
            rotation: el.rotation || 0,
            stroke: el.stroke || '',
            strokeWidth: el.strokeWidth || 0,
            zIndex: el.zIndex ?? (i + 1),
            visible: el.visible !== false,
            draggable: true,
          }
        }
        return {
          id,
          type: 'shape',
          shapeType: 'rect',
          x,
          y,
          width: w,
          height: h,
          fill,
          opacity,
          rotation: el.rotation || 0,
          cornerRadius: el.borderRadius ? Math.round((el.borderRadius / 100) * Math.min(w, h)) : 0,
          stroke: el.stroke || '',
          strokeWidth: el.strokeWidth || 0,
          zIndex: el.zIndex ?? (i + 1),
          visible: el.visible !== false,
          draggable: true,
        }
      }

      if (el.type === 'text' || el.type === 'contact') {
        const fontStyle =
          el.bold && el.italic ? 'bold italic' : el.bold ? 'bold' : el.italic ? 'italic' : 'normal'
        return {
          id,
          type: 'text',
          role: el.role || null,
          showContactIcon: el.type === 'contact',
          x,
          y,
          width: w,
          height: h,
          text: el.text || '',
          fontSize: el.fontSize || 14,
          fontFamily: el.fontFamily || 'Inter',
          fill: el.color || '#000000',
          fontStyle,
          align: el.textAlign || 'left',
          letterSpacing: el.letterSpacing || 0,
          textDecoration: el.textDecoration || '',
          lineHeight: el.lineHeight || 1.25,
          opacity: el.opacity ?? 1,
          rotation: el.rotation || 0,
          zIndex: el.zIndex ?? (i + 1),
          visible: el.visible !== false,
          draggable: true,
        }
      }

      if (el.type === 'image') {
        return {
          id,
          type: 'image',
          role: el.role || null,
          src: el.src || '',
          x,
          y,
          width: w,
          height: h,
          borderRadius: el.borderRadius || 0,
          opacity: el.opacity ?? 1,
          rotation: el.rotation || 0,
          zIndex: el.zIndex ?? (i + 1),
          visible: el.visible !== false,
          draggable: true,
        }
      }

      if (el.type === 'icon') {
        return {
          id,
          type: 'icon',
          iconId: el.iconId,
          fill: el.fill || el.color || '#1a1a1a',
          colorful: el.colorful || false,
          x,
          y,
          width: w,
          height: h,
          opacity: el.opacity ?? 1,
          rotation: el.rotation || 0,
          zIndex: el.zIndex ?? (i + 1),
          visible: el.visible !== false,
          draggable: true,
        }
      }

      if (el.type === 'qr') {
        return {
          id,
          type: 'qr',
          x,
          y,
          width: w,
          height: h,
          opacity: el.opacity ?? 1,
          rotation: el.rotation || 0,
          zIndex: el.zIndex ?? (i + 1),
          visible: el.visible !== false,
          draggable: true,
          qrFields: el.qrFields ? { ...el.qrFields } : { ...DEFAULT_QR_FIELDS },
          qrMode: el.qrMode || 'standard',
          qrForeground: el.qrForeground || '#000000',
          qrBackground: el.qrBackground || '#ffffff',
          qrDotStyle: el.qrDotStyle || 'square',
          qrCornerSquareStyle: el.qrCornerSquareStyle || 'square',
          qrCornerDotStyle: el.qrCornerDotStyle || 'square',
          qrErrorCorrection: el.qrErrorCorrection || 'M',
          qrLogoSrc: el.qrLogoSrc || '',
          qrMargin: el.qrMargin ?? 10,
        }
      }

      return null
    })
    .filter(Boolean)
}
