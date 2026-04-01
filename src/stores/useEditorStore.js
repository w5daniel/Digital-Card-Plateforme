import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

// Business card dimensions: 85.6mm × 54mm (ratio 1.585)
export const CARD_W = 680
export const CARD_H = 429

const MAX_HISTORY = 50

export const useEditorStore = defineStore('editor', () => {
  // ── Core state ──────────────────────────────────────────────────────────
  const cardName = ref('Ma carte de visite')
  const isDirty = ref(false)
  const isSaving = ref(false)
  const activePage = ref('recto') // 'recto' | 'verso'

  // ── Models / Cards architecture ─────────────────────────────────────────
  // 'new' = fresh design, 'edit-template' = editing a user template, 'edit-card' = editing a card
  const editMode = ref('new')
  // ID of the user template being edited (null if new or editing a card)
  const editingTemplateId = ref(null)

  // Default standard fields
  const ALL_STANDARD_FIELDS = [
    { role: 'firstName', label: 'Prénom' },
    { role: 'lastName', label: 'Nom' },
    { role: 'title', label: 'Titre' },
    { role: 'company', label: 'Entreprise' },
    { role: 'email', label: 'Email' },
    { role: 'phone', label: 'Téléphone' },
    { role: 'website', label: 'Site web' },
    { role: 'address', label: 'Adresse' },
  ]

  // Active fields configuration (which fields are enabled + their custom labels)
  const fieldConfig = ref({
    activeStandardFields: JSON.parse(JSON.stringify(ALL_STANDARD_FIELDS)),
    customFields: [], // same shape as contactExtra: { id, label, value }
  })
  const zoom = ref(0.9)

  // Elements per page: { recto: Element[], verso: Element[] }
  const elements = ref({ recto: [], verso: [] })
  const backgrounds = ref({ recto: '#FFFFFF', verso: '#1E293B' })

  // Selection
  const selectedIds = ref([])

  // Undo/redo
  const history = ref([])
  const historyIndex = ref(-1)

  // Text editing state (used by canvas to show textarea overlay)
  const editingTextId = ref(null)

  // Display helpers (canvas overlay)
  const showGrid = ref(false)
  const snapEnabled = ref(false)
  const snapToEdges = ref(false)
  const gridSize = ref(20) // display grid step in px (10/20/40)
  const showCenterGuides = ref(false) // H/V center crosshair
  const showSafeZone = ref(false) // 3mm safe zone margin
  // Persistence: which userCard is being edited (null = new card)
  const editingCardId = ref(null)
  // Template slug applied to this session (used for save)
  const templateSlug = ref(null)
  // Primary accent color from the active template (used as default fill for new shapes)
  const templatePrimaryColor = ref('#6366F1')
  // Extra contact fields added by the user (beyond standard roles)
  // Each item: { id: string, label: string, value: string }
  const contactExtra = ref([])
  // Public/private toggle: public cards appear in Gallery "Communauté" section
  const isPublic = ref(false)
  // Validation state (used by EditorTopBar → EditorLeftSidebar)
  const validationErrors = ref([]) // array of role keys with missing required data
  const openInfoTab = ref(false) // flag: sidebar should switch to 'info' tab
  // Reactive card canvas dimensions (default = standard business card)
  const cardWidth = ref(CARD_W)
  const cardHeight = ref(CARD_H)
  // Orientation: 'landscape' | 'portrait'
  const orientation = ref('landscape')
  // Card corner radius in px (0 = square, default 8)
  const cardBorderRadius = ref(8)

  // ── Computed ─────────────────────────────────────────────────────────────
  const currentElements = computed(() => elements.value[activePage.value])
  const currentBackground = computed(() => backgrounds.value[activePage.value])
  const selectedElements = computed(() =>
    currentElements.value.filter((el) => selectedIds.value.includes(el.id)),
  )
  const singleSelected = computed(() =>
    selectedIds.value.length === 1
      ? (currentElements.value.find((el) => el.id === selectedIds.value[0]) ?? null)
      : null,
  )
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  // ── History ───────────────────────────────────────────────────────────────
  function _snapshot() {
    return JSON.parse(JSON.stringify({ elements: elements.value, backgrounds: backgrounds.value }))
  }

  function saveHistory() {
    // Trim future
    if (historyIndex.value < history.value.length - 1) {
      history.value.splice(historyIndex.value + 1)
    }
    history.value.push(_snapshot())
    if (history.value.length > MAX_HISTORY) history.value.shift()
    else historyIndex.value++
    isDirty.value = true
  }

  function undo() {
    if (!canUndo.value) return
    historyIndex.value--
    const snap = history.value[historyIndex.value]
    elements.value = JSON.parse(JSON.stringify(snap.elements))
    backgrounds.value = JSON.parse(JSON.stringify(snap.backgrounds))
    selectedIds.value = []
  }

  function redo() {
    if (!canRedo.value) return
    historyIndex.value++
    const snap = history.value[historyIndex.value]
    elements.value = JSON.parse(JSON.stringify(snap.elements))
    backgrounds.value = JSON.parse(JSON.stringify(snap.backgrounds))
    selectedIds.value = []
  }

  // ── Element CRUD ──────────────────────────────────────────────────────────
  function addElement(partial) {
    const el = {
      id: uuidv4(),
      x: cardWidth.value / 2 - 100,
      y: cardHeight.value / 2 - 25,
      width: 200,
      height: 50,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      ...partial,
    }
    elements.value[activePage.value].push(el)
    selectedIds.value = [el.id]
    saveHistory()
    return el
  }

  function updateElement(id, props) {
    const page = elements.value[activePage.value]
    const idx = page.findIndex((el) => el.id === id)
    if (idx === -1) return
    page[idx] = { ...page[idx], ...props }
    isDirty.value = true
  }

  function updateElementCommit(id, props) {
    updateElement(id, props)
    saveHistory()
  }

  function deleteSelected() {
    if (!selectedIds.value.length) return
    elements.value[activePage.value] = elements.value[activePage.value].filter(
      (el) => !selectedIds.value.includes(el.id),
    )
    selectedIds.value = []
    saveHistory()
  }

  function duplicateSelected() {
    if (!selectedIds.value.length) return
    const newIds = []
    selectedIds.value.forEach((id) => {
      const el = elements.value[activePage.value].find((e) => e.id === id)
      if (!el) return
      const copy = { ...JSON.parse(JSON.stringify(el)), id: uuidv4(), x: el.x + 16, y: el.y + 16 }
      elements.value[activePage.value].push(copy)
      newIds.push(copy.id)
    })
    selectedIds.value = newIds
    saveHistory()
  }

  // ── Clipboard (copy / paste) ──────────────────────────────────────────────
  const clipboardEl = ref(null)

  function copySelected() {
    const el = singleSelected.value
    if (!el) return
    clipboardEl.value = JSON.parse(JSON.stringify(el))
  }

  function cutSelected() {
    copySelected()
    if (clipboardEl.value) deleteSelected()
  }

  function pasteClipboard() {
    if (!clipboardEl.value) return
    const pasted = {
      ...JSON.parse(JSON.stringify(clipboardEl.value)),
      id: uuidv4(),
      x: (clipboardEl.value.x || 0) + 16,
      y: (clipboardEl.value.y || 0) + 16,
    }
    elements.value[activePage.value].push(pasted)
    selectedIds.value = [pasted.id]
    saveHistory()
  }

  // ── Lock / unlock ─────────────────────────────────────────────────────────
  function toggleLock(id) {
    const page = elements.value[activePage.value]
    const idx = page.findIndex((el) => el.id === id)
    if (idx === -1) return
    const locked = !page[idx].locked
    page[idx] = { ...page[idx], locked }
    if (locked) selectedIds.value = selectedIds.value.filter((sid) => sid !== id)
    saveHistory()
  }

  // ── Align to card ─────────────────────────────────────────────────────────
  function alignElement(id, type) {
    const page = elements.value[activePage.value]
    const idx = page.findIndex((el) => el.id === id)
    if (idx === -1) return
    const el = page[idx]
    const cw = cardWidth.value
    const ch = cardHeight.value
    const w = el.width || 120
    const h = el.height || 40
    let { x, y } = el
    if (type === 'left') x = 0
    if (type === 'centerH') x = (cw - w) / 2
    if (type === 'right') x = cw - w
    if (type === 'top') y = 0
    if (type === 'centerV') y = (ch - h) / 2
    if (type === 'bottom') y = ch - h
    page[idx] = { ...page[idx], x, y }
    saveHistory()
  }

  function alignElements(ids, type) {
    if (!ids.length) return
    const page = elements.value[activePage.value]
    const cw = cardWidth.value
    const ch = cardHeight.value
    ids.forEach((id) => {
      const idx = page.findIndex((el) => el.id === id)
      if (idx === -1) return
      const el = page[idx]
      const w = el.width || 120
      const h = el.height || 40
      let { x, y } = el
      if (type === 'left') x = 0
      if (type === 'centerH') x = (cw - w) / 2
      if (type === 'right') x = cw - w
      if (type === 'top') y = 0
      if (type === 'centerV') y = (ch - h) / 2
      if (type === 'bottom') y = ch - h
      page[idx] = { ...page[idx], x, y }
    })
    saveHistory()
  }

  function nudgeSelected(dx, dy) {
    if (!selectedIds.value.length) return
    const page = elements.value[activePage.value]
    selectedIds.value.forEach((id) => {
      const idx = page.findIndex((el) => el.id === id)
      if (idx !== -1 && !page[idx].locked) {
        page[idx] = { ...page[idx], x: page[idx].x + dx, y: page[idx].y + dy }
      }
    })
    saveHistory()
  }

  // ── Select all ───────────────────────────────────────────────────────────
  function selectAll() {
    selectedIds.value = elements.value[activePage.value]
      .filter((el) => !el.locked)
      .map((el) => el.id)
  }

  // ── Distribute evenly ──────────────────────────────────────────────────
  function distributeElements(ids, axis) {
    if (ids.length < 3) return
    const page = elements.value[activePage.value]
    const items = ids
      .map((id) => {
        const idx = page.findIndex((el) => el.id === id)
        return idx !== -1 ? { idx, el: page[idx] } : null
      })
      .filter(Boolean)
    if (items.length < 3) return

    if (axis === 'horizontal') {
      items.sort((a, b) => a.el.x - b.el.x)
      const first = items[0].el.x
      const last = items[items.length - 1].el.x
      const step = (last - first) / (items.length - 1)
      items.forEach((item, i) => {
        page[item.idx] = { ...page[item.idx], x: first + step * i }
      })
    } else {
      items.sort((a, b) => a.el.y - b.el.y)
      const first = items[0].el.y
      const last = items[items.length - 1].el.y
      const step = (last - first) / (items.length - 1)
      items.forEach((item, i) => {
        page[item.idx] = { ...page[item.idx], y: first + step * i }
      })
    }
    saveHistory()
  }

  // ── Match size ──────────────────────────────────────────────────────────
  function matchSizeElements(ids, prop) {
    if (ids.length < 2) return
    const page = elements.value[activePage.value]
    const items = ids
      .map((id) => {
        const idx = page.findIndex((el) => el.id === id)
        return idx !== -1 ? { idx, el: page[idx] } : null
      })
      .filter(Boolean)
    if (items.length < 2) return
    // Use the first selected element as reference
    const refEl = items[0].el
    items.forEach((item) => {
      const update = {}
      if (prop === 'width' || prop === 'both') update.width = refEl.width || 120
      if (prop === 'height' || prop === 'both') update.height = refEl.height || 40
      page[item.idx] = { ...page[item.idx], ...update }
    })
    saveHistory()
  }

  // ── Lock / unlock all ──────────────────────────────────────────────────
  function lockAll() {
    const page = elements.value[activePage.value]
    page.forEach((el, idx) => {
      page[idx] = { ...el, locked: true }
    })
    selectedIds.value = []
    saveHistory()
  }

  function unlockAll() {
    const page = elements.value[activePage.value]
    page.forEach((el, idx) => {
      page[idx] = { ...el, locked: false }
    })
    saveHistory()
  }

  // ── Group / Ungroup ───────────────────────────────────────────────────────
  function groupSelected() {
    if (selectedIds.value.length < 2) return
    const gid = uuidv4()
    const page = elements.value[activePage.value]
    selectedIds.value.forEach((id) => {
      const idx = page.findIndex((el) => el.id === id)
      if (idx !== -1) page[idx] = { ...page[idx], groupId: gid }
    })
    saveHistory()
  }

  function ungroupSelected() {
    if (!selectedIds.value.length) return
    const page = elements.value[activePage.value]
    const first = page.find((el) => el.id === selectedIds.value[0])
    const gid = first?.groupId
    if (!gid) return
    page.forEach((el, idx) => {
      if (el.groupId === gid) page[idx] = { ...page[idx], groupId: undefined }
    })
    saveHistory()
  }

  const canGroup = computed(() => selectedIds.value.length >= 2)
  const canUngroup = computed(() => {
    if (!selectedIds.value.length) return false
    const page = elements.value[activePage.value]
    const first = page.find((el) => el.id === selectedIds.value[0])
    return !!first?.groupId
  })

  // ── Layer order ───────────────────────────────────────────────────────────
  function bringForward(id) {
    const page = elements.value[activePage.value]
    const i = page.findIndex((el) => el.id === id)
    if (i < page.length - 1) {
      ;[page[i], page[i + 1]] = [page[i + 1], page[i]]
    }
    saveHistory()
  }

  function sendBackward(id) {
    const page = elements.value[activePage.value]
    const i = page.findIndex((el) => el.id === id)
    if (i > 0) {
      ;[page[i], page[i - 1]] = [page[i - 1], page[i]]
    }
    saveHistory()
  }

  function bringToFront(id) {
    const page = elements.value[activePage.value]
    const i = page.findIndex((el) => el.id === id)
    if (i !== -1) page.push(page.splice(i, 1)[0])
    saveHistory()
  }

  function sendToBack(id) {
    const page = elements.value[activePage.value]
    const i = page.findIndex((el) => el.id === id)
    if (i !== -1) page.unshift(page.splice(i, 1)[0])
    saveHistory()
  }

  // Move element to an absolute index in the page array (for layers panel drag-reorder)
  function reorderElement(id, newIndex) {
    const page = elements.value[activePage.value]
    const oldIndex = page.findIndex((el) => el.id === id)
    if (oldIndex === -1) return
    const [item] = page.splice(oldIndex, 1)
    page.splice(Math.max(0, Math.min(newIndex, page.length)), 0, item)
    saveHistory()
  }

  // ── Selection ─────────────────────────────────────────────────────────────
  function selectElement(id, multi = false) {
    if (!id) {
      selectedIds.value = []
      return
    }
    const page = elements.value[activePage.value]
    const el = page.find((e) => e.id === id)
    const gid = el?.groupId

    // All ids to select for this element (group members if grouped, else just this id)
    const groupIds = gid
      ? page.filter((e) => e.groupId === gid && !e.locked).map((e) => e.id)
      : [id]

    if (multi) {
      if (selectedIds.value.includes(id)) {
        selectedIds.value = selectedIds.value.filter((i) => !groupIds.includes(i))
      } else {
        selectedIds.value = [...new Set([...selectedIds.value, ...groupIds])]
      }
    } else {
      selectedIds.value = groupIds
    }
  }

  function clearSelection() {
    selectedIds.value = []
  }

  // ── Card size ─────────────────────────────────────────────────────────────
  function _resizeCanvasElements(oldW, oldH, newW, newH) {
    if (oldW === newW && oldH === newH) return
    const sx = newW / oldW
    const sy = newH / oldH

    ;['recto', 'verso'].forEach((page) => {
      elements.value[page] = elements.value[page].map((el) => {
        const u = { ...el }

        if (el.type === 'image' && el.role === 'background') {
          u.x = 0; u.y = 0; u.width = newW; u.height = newH
          return u
        }

        u.x = el.x * sx
        u.y = el.y * sy

        const st = el.shapeType || ''
        const isLineType = ['line', 'arrow', 'arrow-double', 'line-bar'].includes(st)

        if (el.type === 'text') {
          u.width = el.width * sx
          u.height = Math.max(Math.round(el.height * sy), el.fontSize || 20)
        } else if (isLineType) {
          u.width = el.width * sx
        } else if (st === 'polygon' || st === 'star') {
          const s = Math.min(sx, sy)
          u.width = Math.round(el.width * s)
          u.height = u.width
        } else {
          u.width = el.width * sx
          u.height = el.height != null ? el.height * sy : el.height
        }

        const ew = u.width || 0
        if (ew > newW) {
          const ratio = newW / ew
          u.width = newW
          if (u.height != null) u.height = Math.round(u.height * ratio)
          if (u.fontSize) u.fontSize = Math.max(6, Math.round(u.fontSize * ratio))
        }
        if (u.height != null && u.height > newH) {
          const ratio = newH / u.height
          u.height = newH
          if (u.width != null) u.width = Math.round(u.width * ratio)
          if (u.fontSize) u.fontSize = Math.max(6, Math.round(u.fontSize * ratio))
        }

        const fw = u.width || 0
        const fh = u.height || 0
        if (u.x + fw > newW) u.x = Math.max(0, newW - fw)
        if (fh > 0 && u.y + fh > newH) u.y = Math.max(0, newH - fh)

        u.x = Math.max(0, Math.round(u.x))
        u.y = Math.max(0, Math.round(u.y))
        if (u.width != null) u.width = Math.max(1, Math.round(u.width))
        if (u.height != null) u.height = Math.max(1, Math.round(u.height))

        return u
      })
    })
  }

  function setCardSize(w, h) {
    const oldW = cardWidth.value
    const oldH = cardHeight.value
    const newW = Math.max(200, Math.round(w))
    const newH = Math.max(100, Math.round(h))
    _resizeCanvasElements(oldW, oldH, newW, newH)
    cardWidth.value = newW
    cardHeight.value = newH
    orientation.value = newH > newW ? 'portrait' : 'landscape'
    saveHistory()
    isDirty.value = true
  }

  function resetCardSize() {
    cardWidth.value = CARD_W
    cardHeight.value = CARD_H
    orientation.value = 'landscape'
    isDirty.value = true
  }

  function toggleOrientation() {
    const oldW = cardWidth.value
    const oldH = cardHeight.value
    const newW = oldH
    const newH = oldW
    _resizeCanvasElements(oldW, oldH, newW, newH)
    cardWidth.value = newW
    cardHeight.value = newH
    orientation.value = orientation.value === 'portrait' ? 'landscape' : 'portrait'
    saveHistory()
    isDirty.value = true
  }

  // ── Page (with flip animation support) ───────────────────────────────────
  const isFlipping = ref(false)
  const _pendingFlipPage = ref(null)

  function flipPage() {
    setPage(activePage.value === 'recto' ? 'verso' : 'recto')
  }

  function setPage(page) {
    if (page === activePage.value || isFlipping.value) return
    isFlipping.value = true
    _pendingFlipPage.value = page
  }

  // Called by EditorCanvas at animation midpoint — swaps content
  function commitFlipSwap() {
    if (_pendingFlipPage.value) {
      activePage.value = _pendingFlipPage.value
      selectedIds.value = []
      _pendingFlipPage.value = null
    }
  }

  // Called by EditorCanvas at animation end
  function commitFlipEnd() {
    isFlipping.value = false
  }

  // ── Background ────────────────────────────────────────────────────────────
  function setBackground(color) {
    backgrounds.value[activePage.value] = color
    saveHistory()
  }

  // ── Zoom ──────────────────────────────────────────────────────────────────
  function setZoom(z) {
    zoom.value = Math.max(0.1, Math.min(4, z))
  }

  function zoomIn() {
    setZoom(zoom.value + 0.1)
  }

  function zoomOut() {
    setZoom(zoom.value - 0.1)
  }

  function zoomFit() {
    setZoom(0.9)
  }

  // ── Preset add helpers ────────────────────────────────────────────────────
  function addTextElement(preset = {}) {
    return addElement({
      type: 'text',
      text: 'Votre texte',
      fontSize: 24,
      fontFamily: 'Inter',
      fontStyle: 'normal',
      fontVariant: 'normal',
      textDecoration: '',
      fill: '#000000',
      align: 'left',
      width: 220,
      height: 36,
      letterSpacing: 0,
      lineHeight: 1.25,
      ...preset,
    })
  }

  function addShapeElement(shapeType = 'rect', preset = {}) {
    const defaults =
      shapeType === 'circle'
        ? { width: 100, height: 100 }
        : shapeType === 'line'
          ? { width: 200, height: 4 }
          : shapeType === 'line-bar'
            ? { width: 200, height: 16, strokeWidth: 2 }
            : shapeType === 'polygon'
              ? { width: 110, height: 110, sides: 5 }
              : shapeType === 'star'
                ? { width: 120, height: 120, numPoints: 5 }
                : shapeType === 'arrow' || shapeType === 'arrow-double'
                  ? { width: 200, height: 24 }
                  : shapeType === 'path'
                    ? { width: 60, height: 60 }
                    : /* rect default */ { width: 140, height: 80 }
    // Lines and arrows default to dark — blue makes no sense for separators/connectors
    const isLineType = ['line', 'line-bar', 'arrow', 'arrow-double'].includes(shapeType)
    return addElement({
      type: 'shape',
      shapeType,
      fill: isLineType ? '#1a1a1a' : templatePrimaryColor.value,
      stroke: '',
      strokeWidth: 0,
      cornerRadius: 0,
      ...defaults,
      ...preset,
    })
  }

  function addPathElement(pathData, pathViewBox = [24, 24], preset = {}) {
    return addShapeElement('path', { pathData, pathViewBox, ...preset })
  }

  function addIconElement(icon, preset = {}) {
    // icon: { id: 'mdi:account', label: '...' }
    return addElement({
      type: 'icon',
      iconId: icon.id,
      fill: '#1a1a1a',
      width: 64,
      height: 64,
      ...preset,
    })
  }

  function addQRElement(preset = {}) {
    return addElement({
      type: 'qr',
      width: 100,
      height: 100,
      qrFields: {
        firstName: true,
        lastName: true,
        title: true,
        company: true,
        phone: true,
        email: true,
        website: false,
        address: false,
      },
      qrMode: 'standard',
      qrForeground: '#000000',
      qrBackground: '#ffffff',
      qrDotStyle: 'square',
      qrCornerSquareStyle: 'square',
      qrCornerDotStyle: 'square',
      qrErrorCorrection: 'M',
      qrLogoSrc: '',
      qrMargin: 10,
      ...preset,
    })
  }

  // ── Contact data (extracted from text elements by role) ─────────────────
  // Returns a stable object — only changes when actual text values change
  let _prevContactKey = ''
  let _prevContactData = {}
  const contactData = computed(() => {
    const data = {}
    const allEls = [...(elements.value.recto || []), ...(elements.value.verso || [])]
    for (const el of allEls) {
      if (el.type === 'text' && el.role) {
        data[el.role] = el.text || ''
      }
    }
    const key = JSON.stringify(data)
    if (key === _prevContactKey) return _prevContactData
    _prevContactKey = key
    _prevContactData = data
    return data
  })

  // ── Init / persistence ────────────────────────────────────────────────────
  function initEditor(cardData = null, initialBackgrounds = null) {
    if (cardData && cardData.elements) {
      cardName.value = cardData.name || 'Ma carte de visite'
      elements.value = JSON.parse(JSON.stringify(cardData.elements))
      backgrounds.value = JSON.parse(
        JSON.stringify(cardData.backgrounds || { recto: '#FFFFFF', verso: '#1E293B' }),
      )
    } else {
      cardName.value = 'Ma carte de visite'
      elements.value = { recto: [], verso: [] }
      backgrounds.value = initialBackgrounds || { recto: '#FFFFFF', verso: '#1E293B' }
    }
    selectedIds.value = []
    isDirty.value = false
    activePage.value = 'recto'
    zoom.value = 0.9
    editingCardId.value = null
    editingTemplateId.value = null
    editMode.value = 'new'
    templateSlug.value = null
    templatePrimaryColor.value = cardData?.templatePrimaryColor || '#6366F1'
    contactExtra.value = Array.isArray(cardData?.contactExtra)
      ? JSON.parse(JSON.stringify(cardData.contactExtra))
      : []
    isPublic.value = cardData?.isPublic ?? false
    cardWidth.value = cardData?.cardWidth || CARD_W
    cardHeight.value = cardData?.cardHeight || CARD_H
    orientation.value =
      cardData?.orientation ||
      (cardData?.cardHeight > cardData?.cardWidth ? 'portrait' : 'landscape')
    cardBorderRadius.value = cardData?.cardBorderRadius ?? 8
    // Restore field configuration if present, otherwise default to all standard fields
    if (cardData?.fieldConfig) {
      fieldConfig.value = JSON.parse(JSON.stringify(cardData.fieldConfig))
    } else {
      fieldConfig.value = {
        activeStandardFields: JSON.parse(JSON.stringify(ALL_STANDARD_FIELDS)),
        customFields: [],
      }
    }
    history.value = [_snapshot()]
    historyIndex.value = 0
  }

  function getCardData() {
    return {
      name: cardName.value,
      elements: JSON.parse(JSON.stringify(elements.value)),
      backgrounds: JSON.parse(JSON.stringify(backgrounds.value)),
      cardWidth: cardWidth.value,
      cardHeight: cardHeight.value,
      orientation: orientation.value,
      cardBorderRadius: cardBorderRadius.value,
      templatePrimaryColor: templatePrimaryColor.value,
      contactExtra: JSON.parse(JSON.stringify(contactExtra.value || [])),
      isPublic: isPublic.value,
      fieldConfig: JSON.parse(JSON.stringify(fieldConfig.value)),
    }
  }

  // Apply a new template to the recto only — preserves verso, contact, card ID, name
  function applyRectoTemplate(rectoEls, rectoBg) {
    elements.value = { ...elements.value, recto: rectoEls }
    backgrounds.value = { ...backgrounds.value, recto: rectoBg }
    selectedIds.value = []
    activePage.value = 'recto'
    isDirty.value = true
    history.value = [_snapshot()]
    historyIndex.value = 0
  }

  return {
    // constants
    CARD_W,
    CARD_H,
    ALL_STANDARD_FIELDS,
    // state
    cardName,
    isDirty,
    isSaving,
    activePage,
    zoom,
    elements,
    backgrounds,
    selectedIds,
    editingTextId,
    editingCardId,
    editingTemplateId,
    editMode,
    fieldConfig,
    templateSlug,
    templatePrimaryColor,
    contactExtra,
    isPublic,
    validationErrors,
    openInfoTab,
    cardWidth,
    cardHeight,
    orientation,
    cardBorderRadius,
    showGrid,
    snapEnabled,
    snapToEdges,
    gridSize,
    showCenterGuides,
    showSafeZone,
    // computed
    currentElements,
    currentBackground,
    selectedElements,
    singleSelected,
    canUndo,
    canRedo,
    // history
    saveHistory,
    undo,
    redo,
    // elements
    addElement,
    addPathElement,
    addIconElement,
    updateElement,
    updateElementCommit,
    deleteSelected,
    duplicateSelected,
    copySelected,
    cutSelected,
    pasteClipboard,
    toggleLock,
    alignElement,
    alignElements,
    nudgeSelected,
    selectAll,
    distributeElements,
    matchSizeElements,
    lockAll,
    unlockAll,
    // group
    groupSelected,
    ungroupSelected,
    canGroup,
    canUngroup,
    clipboardEl,
    // layers
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    reorderElement,
    // selection
    selectElement,
    clearSelection,
    // page
    flipPage,
    setPage,
    isFlipping,
    commitFlipSwap,
    commitFlipEnd,
    // background
    setBackground,
    // zoom
    setZoom,
    zoomIn,
    zoomOut,
    zoomFit,
    // card size
    setCardSize,
    resetCardSize,
    toggleOrientation,
    // helpers
    addTextElement,
    addShapeElement,
    addQRElement,
    contactData,
    // init
    initEditor,
    applyRectoTemplate,
    getCardData,
  }
})
