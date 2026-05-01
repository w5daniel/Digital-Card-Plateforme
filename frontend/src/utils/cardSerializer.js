// Serialization utilities — convert Konva editor elements to BusinessCard.vue % format

export const CONTACT_ROLES = [
  'firstName',
  'lastName',
  'title',
  'company',
  'email',
  'phone',
  'website',
  'address',
]

export function serializeShadow(el) {
  if (!el.shadowEnabled) return {}
  return {
    shadowEnabled: true,
    shadowColor: el.shadowColor || '#000000',
    shadowBlur: el.shadowBlur ?? 8,
    shadowOffsetX: el.shadowOffsetX ?? 3,
    shadowOffsetY: el.shadowOffsetY ?? 3,
    shadowOpacity: el.shadowOpacity ?? 0.35,
  }
}

// Convert a Konva editor element to BusinessCard.vue's % format.
// cardWidth / cardHeight are the canvas pixel dimensions (from the editor store).
export function editorToCardEl(el, index, iconUrls = {}, cardWidth, cardHeight) {
  const cw = cardWidth
  const ch = cardHeight

  // ── Shapes → BusinessCard 'block' elements ──────────────────────────
  if (el.type === 'shape') {
    const block = {
      id: el.id,
      type: 'block',
      visible: el.visible !== false,
      x: (el.x / cw) * 100,
      y: (el.y / ch) * 100,
      w: (el.width / cw) * 100,
      h: (el.height / ch) * 100,
      zIndex: el.zIndex ?? index + 1,
      bgColor: el.fillGradient ? undefined : el.fill || '#000000',
      ...serializeShadow(el),
    }
    if (el.fillGradient?.from) block.fillGradient = el.fillGradient
    if ((el.opacity ?? 1) < 1) block.opacity = el.opacity
    if (el.rotation) block.rotation = el.rotation
    if (el.shapeType === 'rect' && el.cornerRadius > 0) {
      block.cornerRadiusPx = el.cornerRadius
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
      // For stroke-only path shapes (patterns, grids, separators)
      if (el.stroke && el.strokeWidth > 0) {
        block.strokePath = el.stroke
        block.strokeWidthPath = el.strokeWidth
      }
    }
    // ── Polygon → SVG path ──────────────────────────────────────────
    if (el.shapeType === 'polygon') {
      const sides = el.sides || 5
      const r = Math.min(el.width || 110, el.height || 110) / 2
      const cx = r
      const cy = r
      const pts = []
      for (let i = 0; i < sides; i++) {
        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
        pts.push(
          `${i === 0 ? 'M' : 'L'}${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`,
        )
      }
      block.pathData = pts.join(' ') + ' Z'
      block.pathViewBox = [r * 2, r * 2]
    }
    // ── Star → SVG path ─────────────────────────────────────────────
    if (el.shapeType === 'star') {
      const numPts = el.numPoints || 5
      const ro = Math.min(el.width || 120, el.height || 120) / 2
      const ri = el.innerRadius || ro * 0.45
      const cx = ro
      const cy = ro
      const pts = []
      for (let i = 0; i < numPts * 2; i++) {
        const angle = (Math.PI * i) / numPts - Math.PI / 2
        const radius = i % 2 === 0 ? ro : ri
        pts.push(
          `${i === 0 ? 'M' : 'L'}${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`,
        )
      }
      block.pathData = pts.join(' ') + ' Z'
      block.pathViewBox = [ro * 2, ro * 2]
    }
    // ── Line → SVG path ─────────────────────────────────────────────
    if (el.shapeType === 'line') {
      const sw = el.strokeWidth || el.height || 4
      const w = el.width || 200
      // Konva draws the stroke centered at el.y (points [0,0,w,0]).
      // The SVG path M0,{sw/2} L{w},{sw/2} is centered within its viewBox [w,sw],
      // so the div top must be el.y − sw/2 for the visual center to match.
      block.y = ((el.y - sw / 2) / ch) * 100
      block.h = (sw / ch) * 100 // override: height = actual stroke width
      block.pathData = `M0,${sw / 2} L${w},${sw / 2}`
      block.pathViewBox = [w, sw]
      block.strokePath = el.fill || '#000000'
      block.strokeWidthPath = sw
      block.bgColor = undefined
      if (el.dash && el.dash.length) block.dashPath = el.dash
    }
    // ── Arrow → SVG path (open chevron style) ───────────────────────
    if (el.shapeType === 'arrow') {
      const w = el.width || 200
      const h = el.height || 24
      const sw = el.strokeWidth || Math.max(1, Math.round(h / 6))
      const mid = h / 2
      const cs = h * 0.9 // chevron size
      block.pathData = `M0,${mid} L${w - cs / 2},${mid} M${w - cs},${mid - cs / 2} L${w},${mid} L${w - cs},${mid + cs / 2}`
      block.pathViewBox = [w, h]
      block.strokePath = el.fill || '#000000'
      block.strokeWidthPath = sw
      block.bgColor = undefined
      if (el.dash && el.dash.length) block.dashPath = el.dash
    }
    // ── Arrow-double → SVG path (↔ open chevron both sides) ─────────
    if (el.shapeType === 'arrow-double') {
      const w = el.width || 200
      const h = el.height || 24
      const sw = el.strokeWidth || Math.max(1, Math.round(h / 6))
      const mid = h / 2
      const cs = h * 0.9 // chevron size
      block.pathData = `M${cs},${mid - cs / 2} L0,${mid} L${cs},${mid + cs / 2} M0,${mid} L${w},${mid} M${w - cs},${mid - cs / 2} L${w},${mid} L${w - cs},${mid + cs / 2}`
      block.pathViewBox = [w, h]
      block.strokePath = el.fill || '#000000'
      block.strokeWidthPath = sw
      block.bgColor = undefined
      if (el.dash && el.dash.length) block.dashPath = el.dash
    }
    // ── Line-bar → SVG path (|—|) ────────────────────────────────────
    if (el.shapeType === 'line-bar') {
      const sw = el.strokeWidth || 2
      const w = el.width || 200
      const barH = Math.max(sw * 5, 16)
      const mid = barH / 2
      block.h = (barH / ch) * 100 // override: height = actual bar height
      block.pathData = `M0,0 L0,${barH} M0,${mid} L${w},${mid} M${w},0 L${w},${barH}`
      block.pathViewBox = [w, barH]
      block.strokePath = el.fill || '#000000'
      block.strokeWidthPath = sw
      block.bgColor = undefined
      if (el.dash && el.dash.length) block.dashPath = el.dash
    }
    // CSS stroke/border — only for shapes WITHOUT SVG pathData (rect, circle, etc.)
    // Shapes with pathData use SVG stroke attributes (strokePath/strokeWidthPath) instead.
    if (!block.pathData && el.stroke && el.strokeWidth > 0) {
      block.stroke = el.stroke
      block.strokeWidth = el.strokeWidth
    }
    return block
  }

  // ── Text → BusinessCard element ───────────────────────────────────────
  if (el.type === 'text' || el.type === 'contact') {
    const role = el.role || el.id
    // Konva auto-sizes text when width is null — estimate for CSS preview
    const effectiveW =
      el.width ??
      Math.min(cw * 0.85, Math.max(150, (el.text || '').length * (el.fontSize || 16) * 1.0))
    const out = {
      id: el.id,
      type: el.showContactIcon ? 'contact' : 'text',
      role,
      text: el.text || '',
      x: (el.x / cw) * 100,
      y: (el.y / ch) * 100,
      w: (effectiveW / cw) * 100,
      h: el.height ? (el.height / ch) * 100 : undefined,
      zIndex: el.zIndex ?? index + 1,
      color: el.fillGradient ? undefined : el.fill || undefined,
      fontSize: el.fontSize || undefined,
      fontFamily: el.fontFamily || undefined,
      letterSpacing: el.letterSpacing != null ? el.letterSpacing : undefined,
      textDecoration: el.textDecoration || undefined,
      underlineColor: el.underlineColor || undefined,
      bold: el.fontStyle?.includes('bold') || false,
      italic: el.fontStyle?.includes('italic') || false,
      textAlign: el.align || 'left',
      lineHeight: el.lineHeight != null ? el.lineHeight : undefined,
      visible: el.visible !== false,
      opacity: (el.opacity ?? 1) < 1 ? el.opacity : undefined,
      rotation: el.rotation || undefined,
      ...serializeShadow(el),
    }
    if (el.fillGradient?.from) out.fillGradient = el.fillGradient
    if (Array.isArray(el.runs) && el.runs.length) out.runs = el.runs
    return out
  }

  // ── Icon (icons, illustrations, stickers) ──────────────────────────
  if (el.type === 'icon') {
    const out = {
      id: el.id,
      type: 'icon',
      iconId: el.iconId,
      fill: el.fill || '#1a1a1a',
      colorful: el.colorful || false,
      x: (el.x / cw) * 100,
      y: (el.y / ch) * 100,
      w: (el.width / cw) * 100,
      h: (el.height / ch) * 100,
      zIndex: el.zIndex ?? index + 1,
      visible: el.visible !== false,
      opacity: (el.opacity ?? 1) < 1 ? el.opacity : undefined,
      rotation: el.rotation || undefined,
      ...serializeShadow(el),
    }
    if (iconUrls[el.id]) out.iconSvgUrl = iconUrls[el.id]
    if (el.stroke && el.strokeWidth > 0) {
      out.stroke = el.stroke
      out.strokeWidth = el.strokeWidth
    }
    return out
  }

  // ── Image elements ──────────────────────────────────────────────────
  if (el.type === 'image') {
    const imgOut = {
      id: el.id,
      type: 'image',
      role: el.role || 'logo',
      src: el.src || undefined,
      x: (el.x / cw) * 100,
      y: (el.y / ch) * 100,
      w: (el.width / cw) * 100,
      h: (el.height / ch) * 100,
      zIndex: el.zIndex ?? index + 1,
      visible: el.visible !== false,
      borderRadius: el.borderRadius || undefined,
      shape: el.shape || ((el.borderRadius || 0) >= 50 ? 'circle' : undefined),
      cover: el.role === 'background' || el.cover || undefined,
      opacity: el.opacity !== undefined ? el.opacity : undefined,
      rotation: el.rotation || undefined,
      ...serializeShadow(el),
    }
    if (el.stroke && el.strokeWidth > 0) {
      imgOut.stroke = el.stroke
      imgOut.strokeWidth = el.strokeWidth
    }
    return imgOut
  }

  if (el.type === 'qr') {
    return {
      id: el.id,
      type: 'qr',
      x: (el.x / cw) * 100,
      y: (el.y / ch) * 100,
      w: (el.width / cw) * 100,
      h: (el.height / ch) * 100,
      zIndex: el.zIndex ?? index + 1,
      visible: el.visible !== false,
      opacity: (el.opacity ?? 1) < 1 ? el.opacity : undefined,
      rotation: el.rotation || undefined,
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
      ...serializeShadow(el),
    }
  }

  return null
}

export function extractContact(els, extras = []) {
  const contact = {}
  CONTACT_ROLES.forEach((role) => {
    const el = els.find((e) => e.role === role && e.text)
    if (el) contact[role] = el.text
  })
  if (contact.firstName || contact.lastName) {
    contact.fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ')
  }
  // Merge custom labeled fields
  extras.forEach(({ label, value }) => {
    if (label && value) contact[label] = value
  })
  return contact
}
