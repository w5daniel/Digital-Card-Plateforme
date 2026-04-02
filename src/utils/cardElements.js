// src/utils/cardElements.js

// Labels de rôles des éléments de carte de visite
export const ROLE_LABELS = {
  firstName: 'Prénom',
  lastName: 'Nom',
  title: 'Titre',
  company: 'Entreprise',
  email: 'Email',
  phone: 'Téléphone',
  website: 'Site web',
  address: 'Adresse',
  logo: 'Logo',
}

// Helper: find text by role in an elements array
function findByRole(elements, role) {
  if (!Array.isArray(elements) || !role) return ''
  const found = elements.find((e) => e.role === role)
  return found?.text || ''
}

// Retourne le nom complet à partir d'un objet carte (card)
// Searches: card.data.contact → card.data.elements[] → card.data.versoElements[] → top-level card props
export function getFullName(card = {}) {
  if (!card) return ''

  // 1. card.data.contact.fullName (computed at save time)
  const contact = card.data?.contact
  if (contact?.fullName) return contact.fullName

  // 2. card.data.contact firstName + lastName
  if (contact?.firstName || contact?.lastName) {
    return [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim()
  }

  // 3. Search card.data.elements[] by role
  const els = card.data?.elements
  const versoEls = card.data?.versoElements
  const first = findByRole(els, 'firstName') || findByRole(versoEls, 'firstName')
  const last = findByRole(els, 'lastName') || findByRole(versoEls, 'lastName')
  if (first || last) return [first, last].filter(Boolean).join(' ').trim()

  // 4. Fallback: card.name (the card's title/label, not the person's name)
  if (card.name && typeof card.name === 'string' && card.name.trim().length) {
    return card.name.trim()
  }

  // 5. Legacy: top-level card props
  const legacyFirst = (card.firstName || card.prenom || '').toString().trim()
  const legacyLast = (card.lastName || card.nom || '').toString().trim()
  return [legacyFirst, legacyLast].filter(Boolean).join(' ').trim()
}

// Retourne le texte d'un champ spécifique d'une carte
// Searches: card.data.elements[] → card.data.versoElements[] → card.data.contact → top-level card props
export function getElemText(card = {}, fieldKey = '') {
  if (!card || !fieldKey) return ''

  // 1. Search in card.data.elements (recto — BusinessCard format)
  const recto = findByRole(card.data?.elements, fieldKey)
  if (recto) return recto

  // 2. Search in card.data.versoElements
  const verso = findByRole(card.data?.versoElements, fieldKey)
  if (verso) return verso

  // 3. Search in card.data.contact object
  const contactVal = card.data?.contact?.[fieldKey]
  if (contactVal != null && contactVal !== '') return String(contactVal)

  // 4. Fallback: direct property on card (legacy)
  if (card[fieldKey] != null && card[fieldKey] !== '') {
    return String(card[fieldKey])
  }

  return ''
}

/**
 * Convert a Konva-format element (px) to BusinessCard-format element (%).
 * Handles all types: shape, text, contact, icon, image, qr.
 * @param {Object} el - Konva element
 * @param {number} cw - Canvas width in px
 * @param {number} ch - Canvas height in px
 * @param {number} index - Element index (fallback zIndex)
 * @returns {Object|null} BusinessCard element or null if unknown type
 */
export function konvaToCardEl(el, cw, ch, index) {
  const pctX = (el.x / cw) * 100
  const pctY = (el.y / ch) * 100
  const pctW = (el.width / cw) * 100
  const pctH = (el.height / ch) * 100
  const zIdx = el.zIndex ?? index + 1

  if (el.type === 'shape') {
    const block = {
      type: 'block',
      visible: el.visible !== false,
      x: pctX,
      y: pctY,
      w: pctW,
      h: pctH,
      zIndex: zIdx,
      bgColor: el.fill || '#000000',
    }
    if ((el.opacity ?? 1) < 1) block.opacity = el.opacity
    if (el.rotation) block.rotation = el.rotation
    if (el.shapeType === 'rect' && el.cornerRadius > 0) {
      const minDim = Math.min(el.width || 1, el.height || 1)
      block.borderRadius = Math.round((el.cornerRadius / minDim) * 100)
    }
    if (el.shapeType === 'circle') block.borderRadius = 50
    if (el.shapeType === 'custom-poly' && el.polygonPoints) {
      block.clipPath = `polygon(${el.polygonPoints
        .map(
          ([px, py]) =>
            `${parseFloat((px * 100).toFixed(2))}% ${parseFloat((py * 100).toFixed(2))}%`,
        )
        .join(', ')})`
    }
    if (el.shapeType === 'path') {
      block.pathData = el.pathData
      block.pathViewBox = el.pathViewBox
      if (el.stroke && el.strokeWidth > 0) {
        block.strokePath = el.stroke
        block.strokeWidthPath = el.strokeWidth
      }
    }
    if (el.shapeType === 'polygon') {
      const sides = el.sides || 5,
        r = Math.min(el.width || 110, el.height || 110) / 2,
        cx = r,
        cy = r
      const pts = []
      for (let i = 0; i < sides; i++) {
        const a = (Math.PI * 2 * i) / sides - Math.PI / 2
        pts.push(
          `${i === 0 ? 'M' : 'L'}${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`,
        )
      }
      block.pathData = pts.join(' ') + ' Z'
      block.pathViewBox = [r * 2, r * 2]
    }
    if (el.shapeType === 'star') {
      const np = el.numPoints || 5,
        ro = Math.min(el.width || 120, el.height || 120) / 2,
        ri = el.innerRadius || ro * 0.45,
        cx = ro,
        cy = ro
      const pts = []
      for (let i = 0; i < np * 2; i++) {
        const a = (Math.PI * i) / np - Math.PI / 2
        const rad = i % 2 === 0 ? ro : ri
        pts.push(
          `${i === 0 ? 'M' : 'L'}${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`,
        )
      }
      block.pathData = pts.join(' ') + ' Z'
      block.pathViewBox = [ro * 2, ro * 2]
    }
    if (el.shapeType === 'line') {
      const sw = el.strokeWidth || el.height || 4,
        w = el.width || 200
      block.y = ((el.y - sw / 2) / ch) * 100
      block.h = (sw / ch) * 100
      block.pathData = `M0,${sw / 2} L${w},${sw / 2}`
      block.pathViewBox = [w, sw]
      block.strokePath = el.fill || '#000000'
      block.strokeWidthPath = sw
      if (el.dash?.length) block.dashPath = el.dash
    }
    if (el.shapeType === 'arrow') {
      const w = el.width || 200,
        h = el.height || 24,
        sw = el.strokeWidth || Math.max(1, Math.round(h / 6)),
        mid = h / 2,
        cs = h * 0.9
      block.pathData = `M0,${mid} L${w - cs / 2},${mid} M${w - cs},${mid - cs / 2} L${w},${mid} L${w - cs},${mid + cs / 2}`
      block.pathViewBox = [w, h]
      block.strokePath = el.fill || '#000000'
      block.strokeWidthPath = sw
      if (el.dash?.length) block.dashPath = el.dash
    }
    if (el.shapeType === 'arrow-double') {
      const w = el.width || 200,
        h = el.height || 24,
        sw = el.strokeWidth || Math.max(1, Math.round(h / 6)),
        mid = h / 2,
        cs = h * 0.9
      block.pathData = `M${cs},${mid - cs / 2} L0,${mid} L${cs},${mid + cs / 2} M0,${mid} L${w},${mid} M${w - cs},${mid - cs / 2} L${w},${mid} L${w - cs},${mid + cs / 2}`
      block.pathViewBox = [w, h]
      block.strokePath = el.fill || '#000000'
      block.strokeWidthPath = sw
      if (el.dash?.length) block.dashPath = el.dash
    }
    if (el.shapeType === 'line-bar') {
      const sw = el.strokeWidth || 2,
        w = el.width || 200,
        barH = Math.max(sw * 5, 16),
        mid = barH / 2
      block.h = (barH / ch) * 100
      block.pathData = `M0,0 L0,${barH} M0,${mid} L${w},${mid} M${w},0 L${w},${barH}`
      block.pathViewBox = [w, barH]
      block.strokePath = el.fill || '#000000'
      block.strokeWidthPath = sw
      if (el.dash?.length) block.dashPath = el.dash
    }
    if (!block.pathData && el.stroke && el.strokeWidth > 0) {
      block.stroke = el.stroke
      block.strokeWidth = el.strokeWidth
    }
    return block
  }

  if (el.type === 'text' || el.type === 'contact') {
    return {
      type: el.showContactIcon ? 'contact' : 'text',
      role: el.role || el.id,
      text: el.text || '',
      x: pctX,
      y: pctY,
      w: pctW,
      h: el.height ? pctH : undefined,
      zIndex: zIdx,
      color: el.fill,
      fontSize: el.fontSize,
      fontFamily: el.fontFamily,
      letterSpacing: el.letterSpacing,
      textDecoration: el.textDecoration,
      bold: el.fontStyle?.includes('bold') || false,
      italic: el.fontStyle?.includes('italic') || false,
      textAlign: el.align || 'left',
      lineHeight: el.lineHeight,
      visible: el.visible !== false,
      opacity: (el.opacity ?? 1) < 1 ? el.opacity : undefined,
      rotation: el.rotation || undefined,
    }
  }

  if (el.type === 'icon') {
    return {
      type: 'icon',
      iconId: el.iconId,
      fill: el.fill || '#1a1a1a',
      colorful: el.colorful || false,
      x: pctX,
      y: pctY,
      w: pctW,
      h: pctH,
      zIndex: zIdx,
      visible: el.visible !== false,
      opacity: (el.opacity ?? 1) < 1 ? el.opacity : undefined,
      rotation: el.rotation || undefined,
    }
  }

  if (el.type === 'image') {
    return {
      type: 'image',
      role: el.role || 'logo',
      src: el.src,
      x: pctX,
      y: pctY,
      w: pctW,
      h: pctH,
      zIndex: zIdx,
      visible: el.visible !== false,
      borderRadius: el.borderRadius,
      opacity: el.opacity,
      rotation: el.rotation || undefined,
    }
  }

  if (el.type === 'qr') {
    return {
      type: 'qr',
      x: pctX,
      y: pctY,
      w: pctW,
      h: pctH,
      zIndex: zIdx,
      visible: el.visible !== false,
      qrFields: el.qrFields ? { ...el.qrFields } : undefined,
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
}
