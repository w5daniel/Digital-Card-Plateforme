/**
 * Shared gradient helpers — used by EditorCanvas, cardExporter, and BusinessCard.
 */

/**
 * Converts a CSS angle + two hex colors to Konva linear gradient props.
 * angle: CSS convention (0=up, 90=right, 180=down, clockwise)
 * Coords are relative to shape's local top-left origin (0,0) to (W,H).
 */
export function buildKonvaGradient(angle, W, H, from, to) {
  const rad = (angle * Math.PI) / 180
  const dx = Math.sin(rad)
  const dy = -Math.cos(rad)
  const cx = W / 2,
    cy = H / 2
  let tMax
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    tMax = 0
  } else if (Math.abs(dx) < 0.001) {
    tMax = cy / Math.abs(dy)
  } else if (Math.abs(dy) < 0.001) {
    tMax = cx / Math.abs(dx)
  } else {
    tMax = Math.min(cx / Math.abs(dx), cy / Math.abs(dy))
  }
  return {
    fillLinearGradientStartPoint: { x: cx - dx * tMax, y: cy - dy * tMax },
    fillLinearGradientEndPoint: { x: cx + dx * tMax, y: cy + dy * tMax },
    fillLinearGradientColorStops: [0, from, 1, to],
  }
}

/** Same but for centered shapes (ellipse, polygon, star) where (0,0) = center */
export function buildKonvaGradientCentered(angle, W, H, from, to) {
  const g = buildKonvaGradient(angle, W, H, from, to)
  return {
    fillLinearGradientStartPoint: {
      x: g.fillLinearGradientStartPoint.x - W / 2,
      y: g.fillLinearGradientStartPoint.y - H / 2,
    },
    fillLinearGradientEndPoint: {
      x: g.fillLinearGradientEndPoint.x - W / 2,
      y: g.fillLinearGradientEndPoint.y - H / 2,
    },
    fillLinearGradientColorStops: g.fillLinearGradientColorStops,
  }
}

/** Parse a CSS linear-gradient string into { angle, from, to } or null */
export function parseCSSGradient(css) {
  if (!css || !css.startsWith('linear-gradient(')) return null
  const m = css.match(
    /linear-gradient\((\d+)deg,\s*(#[0-9a-fA-F]{3,8})\s*0%,\s*(#[0-9a-fA-F]{3,8})\s*100%\)/,
  )
  return m ? { angle: parseInt(m[1]), from: m[2], to: m[3] } : null
}

/** Returns Konva gradient props if el.fillGradient is set, otherwise {} */
export function gradientProps(el, W, H) {
  if (!el.fillGradient?.from) return {}
  return buildKonvaGradient(
    el.fillGradient.angle ?? 180,
    W,
    H,
    el.fillGradient.from,
    el.fillGradient.to ?? el.fillGradient.from,
  )
}

/** Returns Konva gradient props for centered shapes if el.fillGradient is set */
export function gradientPropsCentered(el, W, H) {
  if (!el.fillGradient?.from) return {}
  return buildKonvaGradientCentered(
    el.fillGradient.angle ?? 180,
    W,
    H,
    el.fillGradient.from,
    el.fillGradient.to ?? el.fillGradient.from,
  )
}

/** Build CSS linear-gradient string from a fillGradient object */
export function toCSSGradient(fg) {
  if (!fg?.from) return ''
  return `linear-gradient(${fg.angle ?? 180}deg, ${fg.from} 0%, ${fg.to ?? fg.from} 100%)`
}
