// Style runs helpers — per-character formatting for text elements.
// A run = { start, end, bold?, italic?, underline?, color?, underlineColor? }
// Runs override the element's global styles on their [start, end) range.
// When no run covers a range, the element's global styles apply.

const RUN_FLAGS = ['bold', 'italic', 'underline']
const RUN_COLORS = ['color', 'underlineColor']
const RUN_KEYS = [...RUN_FLAGS, ...RUN_COLORS]

function sanitizeRun(run) {
  if (!run || typeof run !== 'object') return null
  const start = Math.max(0, Math.floor(run.start ?? 0))
  const end = Math.max(start, Math.floor(run.end ?? start))
  if (end === start) return null
  const clean = { start, end }
  for (const k of RUN_KEYS) {
    if (run[k] !== undefined && run[k] !== null && run[k] !== false && run[k] !== '') {
      clean[k] = run[k]
    }
  }
  // Drop runs that have no meaningful style
  if (!RUN_KEYS.some((k) => k in clean)) return null
  return clean
}

function styleKey(run) {
  return RUN_KEYS.map((k) => `${k}:${run[k] ?? ''}`).join('|')
}

export function normalizeRuns(runs, textLength = Infinity) {
  if (!Array.isArray(runs) || runs.length === 0) return []
  const clean = runs
    .map((r) => sanitizeRun(r))
    .filter(Boolean)
    .map((r) => ({ ...r, end: Math.min(r.end, textLength) }))
    .filter((r) => r.end > r.start)
    .sort((a, b) => a.start - b.start || a.end - b.end)

  if (clean.length === 0) return []

  // Flatten overlaps into non-overlapping segments, merging styles.
  const points = new Set()
  for (const r of clean) {
    points.add(r.start)
    points.add(r.end)
  }
  const sorted = [...points].sort((a, b) => a - b)
  const segments = []
  for (let i = 0; i < sorted.length - 1; i++) {
    const s = sorted[i]
    const e = sorted[i + 1]
    const merged = { start: s, end: e }
    for (const r of clean) {
      if (r.start <= s && r.end >= e) {
        for (const k of RUN_KEYS) {
          if (r[k] !== undefined && merged[k] === undefined) merged[k] = r[k]
        }
      }
    }
    if (RUN_KEYS.some((k) => k in merged)) segments.push(merged)
  }

  // Merge adjacent segments with identical styles
  const out = []
  for (const seg of segments) {
    const last = out[out.length - 1]
    if (last && last.end === seg.start && styleKey(last) === styleKey(seg)) {
      last.end = seg.end
    } else {
      out.push({ ...seg })
    }
  }
  return out
}

// Apply a style object on [start, end). `style` can contain: bold, italic,
// underline, color, underlineColor. Values set to null explicitly clear that
// attribute on the range (so "unbold the selection" works even if a run covered it).
export function applyRunStyle(runs, start, end, style, textLength = Infinity) {
  if (end <= start) return normalizeRuns(runs, textLength)
  const base = Array.isArray(runs) ? [...runs] : []

  // Split existing runs that overlap the range, keeping outside portions intact.
  const kept = []
  for (const r of base) {
    if (r.end <= start || r.start >= end) {
      kept.push({ ...r })
      continue
    }
    if (r.start < start) kept.push({ ...r, end: start })
    if (r.end > end) kept.push({ ...r, start: end })
  }

  // Collect merged styles for the [start, end) range from runs that overlap it.
  const mergedStyle = {}
  for (const r of base) {
    if (r.end <= start || r.start >= end) continue
    for (const k of RUN_KEYS) {
      if (r[k] !== undefined && mergedStyle[k] === undefined) mergedStyle[k] = r[k]
    }
  }
  // Overlay the new style (null values clear attributes)
  for (const k of RUN_KEYS) {
    if (k in style) {
      if (style[k] === null || style[k] === undefined || style[k] === false || style[k] === '') {
        delete mergedStyle[k]
      } else {
        mergedStyle[k] = style[k]
      }
    }
  }

  if (RUN_KEYS.some((k) => k in mergedStyle)) {
    kept.push({ start, end, ...mergedStyle })
  }
  return normalizeRuns(kept, textLength)
}

// Toggle a boolean flag (bold/italic/underline) on [start, end).
// If every character in range already has the flag set → unset on range.
// Otherwise → set on range.
export function toggleRunFlag(runs, start, end, flag, textLength = Infinity) {
  if (end <= start) return normalizeRuns(runs, textLength)
  if (!RUN_FLAGS.includes(flag)) return normalizeRuns(runs, textLength)

  const segments = segmentize('', runs, {}, end)
  // Check if flag is active across the whole range
  let allSet = true
  let cursor = start
  for (const seg of segments) {
    if (seg.end <= start || seg.start >= end) continue
    const overlapStart = Math.max(seg.start, start)
    const overlapEnd = Math.min(seg.end, end)
    if (overlapStart > cursor) {
      allSet = false
      break
    }
    if (!seg.style[flag]) {
      allSet = false
      break
    }
    cursor = overlapEnd
  }
  if (cursor < end) allSet = false

  return applyRunStyle(runs, start, end, { [flag]: allSet ? null : true }, textLength)
}

// Split text into contiguous segments annotated with their effective style.
// `globalStyle` provides fallback values for segments not covered by runs.
// If text is empty string, we still return runs annotated with style for use by
// toggleRunFlag (which only needs style info, not text).
export function segmentize(text, runs, globalStyle = {}, textLength = null) {
  const normalized = normalizeRuns(runs, textLength ?? (text?.length ?? Infinity))
  const len = textLength ?? (text?.length ?? 0)
  if (len === 0) {
    return normalized.map((r) => ({
      text: '',
      start: r.start,
      end: r.end,
      style: mergeStyle(globalStyle, r),
    }))
  }

  const segments = []
  let cursor = 0
  for (const r of normalized) {
    if (r.start > cursor) {
      segments.push({
        text: text.slice(cursor, r.start),
        start: cursor,
        end: r.start,
        style: { ...globalStyle },
      })
    }
    segments.push({
      text: text.slice(r.start, r.end),
      start: r.start,
      end: r.end,
      style: mergeStyle(globalStyle, r),
    })
    cursor = r.end
  }
  if (cursor < len) {
    segments.push({
      text: text.slice(cursor),
      start: cursor,
      end: len,
      style: { ...globalStyle },
    })
  }
  return segments
}

function mergeStyle(globalStyle, run) {
  const merged = { ...globalStyle }
  for (const k of RUN_KEYS) {
    if (run[k] !== undefined) merged[k] = run[k]
  }
  return merged
}

// Shift run boundaries after a text edit. `delta` is the net change (+ add, − remove)
// that happened at position `at`. Runs fully before `at` are unchanged; runs fully
// after shift by delta; runs crossing `at` expand or shrink accordingly.
export function shiftRuns(runs, at, delta, newTextLength = Infinity) {
  if (!Array.isArray(runs) || runs.length === 0 || delta === 0) {
    return normalizeRuns(runs, newTextLength)
  }
  const shifted = []
  for (const r of runs) {
    let { start, end } = r
    if (end <= at) {
      // fully before edit point — unchanged
    } else if (start >= at) {
      start = Math.max(at, start + delta)
      end = Math.max(start, end + delta)
    } else {
      // crosses edit point
      end = Math.max(start, end + delta)
    }
    if (end > start) shifted.push({ ...r, start, end })
  }
  return normalizeRuns(shifted, newTextLength)
}

// Compute a minimal edit (position + delta) between two strings. Returns null if
// the diff is not a single contiguous insertion/deletion at one position.
export function diffSingleEdit(oldText, newText) {
  if (oldText === newText) return { at: 0, delta: 0 }
  const oldLen = oldText.length
  const newLen = newText.length
  let prefix = 0
  while (prefix < oldLen && prefix < newLen && oldText[prefix] === newText[prefix]) prefix++
  let suffix = 0
  while (
    suffix < oldLen - prefix &&
    suffix < newLen - prefix &&
    oldText[oldLen - 1 - suffix] === newText[newLen - 1 - suffix]
  ) {
    suffix++
  }
  const delta = newLen - oldLen
  return { at: prefix, delta }
}

export function migrateElement(el) {
  if (!el || el.type !== 'text') return el
  if (!Array.isArray(el.runs)) el.runs = []
  return el
}

export const __RUN_KEYS = RUN_KEYS
