/**
 * Standalone Konva-based card exporter.
 * Produces pixel-identical output to the editor export.
 *
 * Usage:
 *   import { exportCardPages } from '@/utils/cardExporter'
 *   const { recto, verso } = await exportCardPages(card)  // data URLs
 */
import Konva from 'konva'
import { loadIcon } from '@iconify/vue'
import {
  DEFAULT_QR_FIELDS,
  buildVCardFromFields,
  generateQRDataURL,
  getContactFromCard,
} from './qrCodeHelper'

// ── Image loaders ──────────────────────────────────────────────────────────

function loadImagePromise(src) {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

async function loadIconImage(el) {
  try {
    const data = await loadIcon(el.iconId)
    if (!data) return null
    const fill = el.fill || '#000000'
    const body = el.colorful ? data.body : data.body.replace(/currentColor/g, fill)
    const w = data.width || 24
    const h = data.height || 24
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
    return loadImagePromise(url)
  } catch {
    return null
  }
}

async function loadQRImage(el, contact, contactExtra) {
  try {
    const fields = el.qrFields || DEFAULT_QR_FIELDS
    const vcard = buildVCardFromFields(contact, fields, contactExtra || [])
    const size = Math.max(el.width || 100, el.height || 100) * 2
    const blobUrl = await generateQRDataURL(vcard, el, size)
    const img = await loadImagePromise(blobUrl)
    // Revoke after load to free memory
    URL.revokeObjectURL(blobUrl)
    return img
  } catch {
    return null
  }
}

// ── Build Konva nodes from element data ────────────────────────────────────

function addElementToLayer(layer, el, imageMap) {
  if (el.visible === false) return

  if (el.type === 'text') {
    layer.add(
      new Konva.Text({
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height || undefined,
        text: el.text || '',
        fontSize: el.fontSize || 16,
        fontFamily: el.fontFamily || 'Inter',
        fontStyle: el.fontStyle || 'normal',
        textDecoration: el.textDecoration || '',
        fill: el.fill || '#000000',
        align: el.align || 'left',
        opacity: el.opacity ?? 1,
        rotation: el.rotation || 0,
        letterSpacing: el.letterSpacing || 0,
        lineHeight: el.lineHeight || 1.25,
        wrap: 'word',
      }),
    )
    return
  }

  if (el.type === 'image' || el.type === 'icon' || el.type === 'qr') {
    const img = imageMap[el.id]
    if (!img) return
    layer.add(
      new Konva.Image({
        x: el.x,
        y: el.y,
        width: el.width || (el.type === 'icon' ? 64 : el.type === 'qr' ? 100 : 200),
        height: el.height || (el.type === 'icon' ? 64 : el.type === 'qr' ? 100 : 120),
        image: img,
        opacity: el.opacity ?? 1,
        rotation: el.rotation || 0,
      }),
    )
    return
  }

  if (el.type === 'shape') {
    addShapeToLayer(layer, el)
  }
}

function addShapeToLayer(layer, el) {
  const st = el.shapeType || 'rect'

  if (st === 'rect') {
    layer.add(
      new Konva.Rect({
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        fill: el.fill || '#3B82F6',
        stroke: el.stroke || '',
        strokeWidth: el.strokeWidth || 0,
        cornerRadius: el.cornerRadius || 0,
        opacity: el.opacity ?? 1,
        rotation: el.rotation || 0,
      }),
    )
  } else if (st === 'circle') {
    layer.add(
      new Konva.Ellipse({
        x: el.x + (el.width || 100) / 2,
        y: el.y + (el.height || 100) / 2,
        radiusX: (el.width || 100) / 2,
        radiusY: (el.height || 100) / 2,
        fill: el.fill || '#3B82F6',
        stroke: el.stroke || '',
        strokeWidth: el.strokeWidth || 0,
        opacity: el.opacity ?? 1,
        rotation: el.rotation || 0,
      }),
    )
  } else if (st === 'line') {
    const sw = el.strokeWidth || el.height || 4
    layer.add(
      new Konva.Line({
        x: el.x,
        y: el.y,
        points: [0, 0, el.width || 200, 0],
        stroke: el.fill || '#000000',
        strokeWidth: Math.max(1, sw),
        dash: el.dash?.length ? el.dash : undefined,
        lineCap: 'round',
        lineJoin: 'round',
        opacity: el.opacity ?? 1,
        rotation: el.rotation || 0,
      }),
    )
  } else if (st === 'arrow') {
    const h = el.height || 24
    const w = el.width || 200
    const sw = el.strokeWidth || Math.max(1, Math.round(h / 6))
    const headSize = Math.max(8, h * 0.75)
    layer.add(
      new Konva.Arrow({
        x: el.x,
        y: el.y,
        points: [0, h / 2, w - headSize * 0.4, h / 2],
        fill: el.fill || '#000000',
        stroke: el.fill || '#000000',
        strokeWidth: sw,
        pointerLength: headSize,
        pointerWidth: headSize,
        opacity: el.opacity ?? 1,
        rotation: el.rotation || 0,
      }),
    )
  } else if (st === 'arrow-double') {
    const h = el.height || 24
    const w = el.width || 200
    const sw = el.strokeWidth || Math.max(1, Math.round(h / 6))
    const headSize = Math.max(8, h * 0.75)
    layer.add(
      new Konva.Arrow({
        x: el.x,
        y: el.y,
        points: [0, h / 2, w - headSize * 0.4, h / 2],
        fill: el.fill || '#000000',
        stroke: el.fill || '#000000',
        strokeWidth: sw,
        pointerLength: headSize,
        pointerWidth: headSize,
        pointerAtBeginning: true,
        opacity: el.opacity ?? 1,
        rotation: el.rotation || 0,
      }),
    )
  } else if (st === 'line-bar') {
    const sw = el.strokeWidth || el.height || 2
    const w = el.width || 200
    const barH = Math.max(sw * 5, 16)
    layer.add(
      new Konva.Shape({
        x: el.x,
        y: el.y,
        width: w,
        height: barH,
        fill: 'transparent',
        stroke: el.fill || '#000000',
        strokeWidth: sw,
        opacity: el.opacity ?? 1,
        rotation: el.rotation || 0,
        sceneFunc(ctx, shape) {
          const W = shape.width()
          const H = shape.height()
          const mid = H / 2
          ctx.beginPath()
          ctx.moveTo(0, mid)
          ctx.lineTo(W, mid)
          ctx.moveTo(0, 0)
          ctx.lineTo(0, H)
          ctx.moveTo(W, 0)
          ctx.lineTo(W, H)
          ctx.fillStrokeShape(shape)
        },
      }),
    )
  } else if (st === 'polygon') {
    const r = Math.min(el.width || 110, el.height || 110) / 2
    layer.add(
      new Konva.RegularPolygon({
        x: el.x + (el.width || 110) / 2,
        y: el.y + (el.height || 110) / 2,
        sides: el.sides || 5,
        radius: r,
        fill: el.fill || '#3B82F6',
        stroke: el.stroke || '',
        strokeWidth: el.strokeWidth || 0,
        opacity: el.opacity ?? 1,
        rotation: el.rotation || 0,
      }),
    )
  } else if (st === 'star') {
    const ro = Math.min(el.width || 120, el.height || 120) / 2
    layer.add(
      new Konva.Star({
        x: el.x + (el.width || 120) / 2,
        y: el.y + (el.height || 120) / 2,
        numPoints: el.numPoints || 5,
        outerRadius: ro,
        innerRadius: el.innerRadius || ro * 0.45,
        fill: el.fill || '#3B82F6',
        stroke: el.stroke || '',
        strokeWidth: el.strokeWidth || 0,
        opacity: el.opacity ?? 1,
        rotation: el.rotation || 0,
      }),
    )
  } else if (st === 'path') {
    const vb = el.pathViewBox || [24, 24]
    layer.add(
      new Konva.Path({
        x: el.x,
        y: el.y,
        data: el.pathData || '',
        fill: el.fill || '#3B82F6',
        stroke: el.stroke || '',
        strokeWidth: el.strokeWidth || 0,
        scaleX: (el.width || 60) / vb[0],
        scaleY: (el.height || 60) / vb[1],
        opacity: el.opacity ?? 1,
        rotation: el.rotation || 0,
      }),
    )
  } else if (st === 'custom-poly') {
    const pts = el.polygonPoints || []
    layer.add(
      new Konva.Shape({
        x: el.x,
        y: el.y,
        width: el.width || 100,
        height: el.height || 100,
        fill: el.fill || '#ffffff',
        stroke: el.stroke || '',
        strokeWidth: el.strokeWidth || 0,
        opacity: el.opacity ?? 1,
        rotation: el.rotation || 0,
        sceneFunc(ctx, shape) {
          const W = shape.width()
          const H = shape.height()
          ctx.beginPath()
          pts.forEach(([px, py], i) => {
            if (i === 0) ctx.moveTo(px * W, py * H)
            else ctx.lineTo(px * W, py * H)
          })
          ctx.closePath()
          ctx.fillStrokeShape(shape)
        },
      }),
    )
  }
}

// ── Render one page into a Konva stage and return a data URL ───────────────

async function renderPage(elements, background, cw, ch, contact, contactExtra, type, pixelRatio) {
  // Pre-load all assets in parallel
  const imageMap = {}
  await Promise.all(
    elements.map(async (el) => {
      if (el.type === 'image' && el.src) {
        imageMap[el.id] = await loadImagePromise(el.src)
      } else if (el.type === 'icon' && el.iconId) {
        imageMap[el.id] = await loadIconImage(el)
      } else if (el.type === 'qr') {
        imageMap[el.id] = await loadQRImage(el, contact, contactExtra)
      }
    }),
  )

  // Create off-screen Konva stage
  const container = document.createElement('div')
  container.style.cssText =
    'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;'
  document.body.appendChild(container)

  const stage = new Konva.Stage({ container, width: cw, height: ch })
  const layer = new Konva.Layer()
  stage.add(layer)

  // Background
  layer.add(new Konva.Rect({ x: 0, y: 0, width: cw, height: ch, fill: background || '#ffffff' }))

  // Sort by zIndex and render
  const sorted = [...elements].sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1))
  for (const el of sorted) {
    addElementToLayer(layer, el, imageMap)
  }

  layer.draw()

  // Always render as PNG internally — callers handle final JPEG encoding.
  // This avoids double JPEG compression artifacts at the gap boundary.
  const dataUrl = stage.toDataURL({
    mimeType: 'image/png',
    quality: 1,
    pixelRatio,
  })

  stage.destroy()
  document.body.removeChild(container)

  return dataUrl
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Export a card's recto (and verso if it exists) to data URLs using Konva.
 * Produces pixel-identical output to the editor's export.
 *
 * @param {Object} card — a card object with card.data.editorData
 * @param {string} type — 'png' | 'jpg' | 'pdf'
 * @param {number} pixelRatio — export resolution multiplier (default 3)
 * @returns {{ recto: string, verso?: string }} — data URLs
 */
export async function exportCardPages(card, type = 'png', pixelRatio = 3) {
  const ed = card.data?.editorData
  if (!ed) throw new Error('Card has no editorData — it must be saved from the editor first.')

  const cw = ed.cardWidth || card.data?.cardWidth || 680
  const ch = ed.cardHeight || card.data?.cardHeight || 429
  const contact = getContactFromCard(card.data)
  const contactExtra = ed.contactExtra || card.data?.contactExtra || []

  const rectoEls = ed.elements?.recto || []
  const versoEls = ed.elements?.verso || []

  const pages = {}

  if (rectoEls.length > 0 || !versoEls.length) {
    pages.recto = await renderPage(
      rectoEls,
      ed.backgrounds?.recto,
      cw,
      ch,
      contact,
      contactExtra,
      type,
      pixelRatio,
    )
  }

  if (versoEls.length > 0) {
    pages.verso = await renderPage(
      versoEls,
      ed.backgrounds?.verso,
      cw,
      ch,
      contact,
      contactExtra,
      type,
      pixelRatio,
    )
  }

  return pages
}
