import QRCodeStyling from 'qr-code-styling'

// ── Default QR field toggles ──────────────────────────────────────────────
export const DEFAULT_QR_FIELDS = {
  firstName: true,
  lastName: true,
  title: true,
  company: true,
  phone: true,
  email: true,
  website: false,
  address: false,
}

// ── Build a vCard 3.0 string filtered by field toggles ────────────────────
// customFields: array of { id, label, value } from editorStore.contactExtra
// Custom fields are encoded as proper vCard properties for maximum phone visibility:
//   - URL-like  → URL;type=LABEL:value  (shown as clickable link on iOS/Android)
//   - Phone-like → TEL;type=LABEL:value  (shown as callable number)
//   - Email-like → EMAIL;type=LABEL:value (shown as emailable address)
//   - Other      → NOTE:label: value      (shown in Notes section)
// TODO backend: when a proper contacts DB exists, map custom fields to X-CUSTOM-* vCard props
export function buildVCardFromFields(contact, fields, customFields = []) {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0']
  const fn = fields.firstName ? contact.firstName || '' : ''
  const ln = fields.lastName ? contact.lastName || '' : ''
  const name = [fn, ln].filter(Boolean).join(' ')
  if (name) {
    lines.push(`N:${ln};${fn};;;`)
    lines.push(`FN:${name}`)
  }
  if (fields.title && contact.title) lines.push(`TITLE:${contact.title}`)
  if (fields.company && contact.company) lines.push(`ORG:${contact.company}`)
  if (fields.phone && contact.phone) lines.push(`TEL:${contact.phone}`)
  if (fields.email && contact.email) lines.push(`EMAIL:${contact.email}`)
  if (fields.website && contact.website) lines.push(`URL:${contact.website}`)
  if (fields.address && contact.address) lines.push(`ADR:;;${contact.address};;;;`)
  // Custom (user-defined) fields — included by default unless explicitly toggled off
  // fields[item.id] === undefined means the QR was created before this field existed → include it
  // Encoding strategy: use URL/TEL/EMAIL for matching values, URL fallback for text
  // (NOTE: is hidden by most QR scanner previews, so we avoid it for visibility)
  const activeCustom = customFields.filter((item) => fields[item.id] !== false && item.value)
  for (const f of activeCustom) {
    const val = f.value.trim()
    if (!val) continue
    const safeLabel = f.label.replace(/[;:,]/g, ' ')
    if (/^https?:\/\//i.test(val)) {
      // URL → clickable link on phones
      lines.push(`URL;type=${safeLabel}:${val}`)
    } else if (/^[\d\s+()./-]+$/.test(val) && val.replace(/\D/g, '').length >= 6) {
      // Phone number → callable
      lines.push(`TEL;type=${safeLabel}:${val}`)
    } else if (/.+@.+\..+/.test(val)) {
      // Email → emailable
      lines.push(`EMAIL;type=${safeLabel}:${val}`)
    } else {
      // Anything else → URL property with label, always visible on phones
      // Shown in the URL/website section of the contact, labeled with safeLabel
      lines.push(`URL;type=${safeLabel}:${val}`)
    }
  }
  lines.push('END:VCARD')
  return lines.join('\n')
}

// ── Build QRCodeStyling options object ────────────────────────────────────
export function buildQRStylingOptions(data, el, size = 300) {
  const isStyled = el.qrMode === 'styled'
  const fg = el.qrForeground || '#000000'

  const opts = {
    width: size,
    height: size,
    margin: el.qrMargin ?? 10,
    data: data || 'BEGIN:VCARD\nVERSION:3.0\nEND:VCARD',
    qrOptions: {
      errorCorrectionLevel: el.qrErrorCorrection || 'M',
    },
    backgroundOptions: {
      color: el.qrBackground || '#ffffff',
    },
    dotsOptions: {
      type: isStyled ? el.qrDotStyle || 'square' : 'square',
      color: fg,
    },
  }

  if (isStyled) {
    if (el.qrCornerSquareStyle) {
      opts.cornersSquareOptions = { type: el.qrCornerSquareStyle, color: fg }
    }
    if (el.qrCornerDotStyle) {
      opts.cornersDotOptions = { type: el.qrCornerDotStyle, color: fg }
    }
    if (el.qrLogoSrc) {
      opts.image = el.qrLogoSrc
      opts.imageOptions = { hideBackgroundDots: true, imageSize: 0.4, margin: 5 }
      // Auto-raise error correction when logo is present
      if (!el.qrErrorCorrection || el.qrErrorCorrection === 'L') {
        opts.qrOptions.errorCorrectionLevel = 'Q'
      }
    }
  }

  return opts
}

// ── Generate a QR image as a blob URL (async) ────────────────────────────
export async function generateQRDataURL(data, el, size = 300) {
  const opts = buildQRStylingOptions(data, el, size)
  const qr = new QRCodeStyling(opts)
  const blob = await qr.getRawData('png')
  return URL.createObjectURL(blob)
}

// ── Extract contact fields from a card.data object (elements fallback) ───
export function getContactFromCard(cardData) {
  const c = cardData?.contact || {}
  const els = [...(cardData?.elements || []), ...(cardData?.versoElements || [])]
  const get = (role) => c[role] || els.find((e) => e.role === role)?.text || ''
  return {
    firstName: get('firstName'), lastName: get('lastName'),
    title: get('title'), company: get('company'),
    phone: get('phone'), email: get('email'),
    website: get('website'), address: get('address'),
  }
}

// ── Style the canvas appended by qr-code-styling to fill its container ───
export function applyQRCanvasStyle(containerEl) {
  const canvas = containerEl?.querySelector('canvas')
  if (canvas) canvas.style.cssText = 'width: 100%; height: 100%; display: block;'
}
