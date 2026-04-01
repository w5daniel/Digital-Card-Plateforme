<template>
  <div
    class="editor-shell flex flex-col h-full overflow-hidden select-none"
    :class="themeStore.darkMode ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'"
    @keydown="onKeyDown"
    tabindex="0"
    ref="shellRef"
  >
    <!-- Top Bar -->
    <EditorTopBar />

    <!-- Body: sidebar + context toolbar + canvas -->
    <div class="flex flex-1 overflow-hidden min-h-0">
      <!-- Left Sidebar -->
      <EditorLeftSidebar />

      <!-- Main column: context bar + canvas -->
      <div class="flex flex-col flex-1 overflow-hidden min-w-0">
        <EditorContextBar />
        <EditorCanvas class="flex-1 min-h-0" />
      </div>
    </div>

    <!-- Bottom Bar -->
    <EditorBottomBar />

    <!-- Leave guard confirm -->
    <ConfirmModal
      v-if="showLeaveConfirm"
      title="Quitter sans sauvegarder ?"
      message="Des modifications non sauvegardées seront perdues."
      confirm-label="Quitter"
      cancel-label="Rester"
      variant="warning"
      @confirm="onLeaveConfirmed"
      @cancel="onLeaveCancelled"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useEditorStore, CARD_W, CARD_H } from '@/stores/useEditorStore'
import { useCardsStore } from '@/stores/cards'
import { useUserTemplatesStore } from '@/stores/userTemplatesStore'
import { useThemeStore } from '@/stores/themeStore'
import { useFontStore } from '@/stores/fontStore'
import EditorTopBar from '@/components/editor/EditorTopBar.vue'
import EditorLeftSidebar from '@/components/editor/EditorLeftSidebar.vue'
import EditorContextBar from '@/components/editor/EditorContextBar.vue'
import EditorCanvas from '@/components/editor/EditorCanvas.vue'
import EditorBottomBar from '@/components/editor/EditorBottomBar.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import {
  buildEditorElements,
  rebuildEditorElements,
  LAYOUT_MAP,
  DEFAULT_EDITOR_PERSON,
} from '@/utils/templateLayouts'

const route = useRoute()
const router = useRouter()
const editorStore = useEditorStore()
const cardsStore = useCardsStore()
const themeStore = useThemeStore()
const fontStore = useFontStore()
const shellRef = ref(null)

// ── Init ──────────────────────────────────────────────────────────────────
onMounted(() => {
  const rawId = route.params.id
  const qMode = route.query.mode // 'edit-template', 'edit-card', 'new'
  const fromTemplate = route.query['from-template']

  if (rawId && qMode === 'edit-template') {
    // ── Editing an existing User Template ──────────────────────────────────
    const tplId = isNaN(rawId) ? rawId : Number(rawId)
    // Needs userTemplatesStore to be imported and used
    const userTemplatesStore = useUserTemplatesStore()
    const tpl = userTemplatesStore.getTemplateById(tplId)

    if (tpl) {
      editorStore.initEditor(tpl.editorData || {})
      editorStore.cardName = tpl.name || 'Mon modèle'
      editorStore.editingTemplateId = tpl.id
      editorStore.editMode = 'edit-template'
      // Restore specific fieldConfig
      if (tpl.fieldConfig) {
        editorStore.fieldConfig = JSON.parse(JSON.stringify(tpl.fieldConfig))
      }
    } else {
      router.push('/dashboard')
      return
    }
  } else if (rawId) {
    // ── Editing an existing Card (or default backward compatibility) ───────
    const cardId = isNaN(rawId) ? rawId : Number(rawId)
    const card = cardsStore.userCards.find((c) => c.id === cardId)
    if (card) {
      if (card.data?.editorData) {
        editorStore.initEditor(card.data.editorData)
      } else if (card.data?.elements?.length) {
        const savedW = card.data.cardWidth || CARD_W
        const savedH = card.data.cardHeight || CARD_H
        const rebuilt = rebuildEditorElements(
          card.data.elements,
          card.data.versoElements,
          savedW,
          savedH,
        )
        editorStore.initEditor({
          elements: rebuilt,
          backgrounds: card.data.backgrounds || {
            recto: card.data.background || '#FFFFFF',
            verso: '#1E293B',
          },
          cardWidth: savedW,
          cardHeight: savedH,
          orientation: card.data.orientation || (savedH > savedW ? 'portrait' : 'landscape'),
        })
      } else {
        editorStore.initEditor()
      }
      editorStore.cardName = card.name || 'Ma carte de visite'
      editorStore.editingCardId = card.id
      editorStore.editMode = 'edit-card'
      editorStore.templateSlug = card.template || null
      // Restore fieldConfig if present
      if (card.data?.fieldConfig) {
        editorStore.fieldConfig = JSON.parse(JSON.stringify(card.data.fieldConfig))
      } else if (Array.isArray(card.data?.contactExtra)) {
        // backward comp
        editorStore.contactExtra = card.data.contactExtra
      }
      editorStore.isPublic = card.isPublic ?? false

      if (!card.data?.backgrounds && !card.data?.background && card.template) {
        const t = cardsStore.getTemplateBySlug(card.template)
        if (t) {
          editorStore.backgrounds.recto = t.colors.primary
          editorStore.backgrounds.verso = t.colors.secondary
        }
      }
    } else {
      router.push('/dashboard')
      return
    }
  } else if (fromTemplate) {
    // ── New card created from an existing User Template ────────────────────
    const tplId = isNaN(fromTemplate) ? fromTemplate : Number(fromTemplate)
    const userTemplatesStore = useUserTemplatesStore()
    const tpl = userTemplatesStore.getTemplateById(tplId)

    if (tpl) {
      editorStore.initEditor(tpl.editorData || {})
      editorStore.cardName = `Copie de ${tpl.name || 'modèle'}`
      editorStore.editMode = 'new'
      if (tpl.fieldConfig) {
        editorStore.fieldConfig = JSON.parse(JSON.stringify(tpl.fieldConfig))
      }
    } else {
      editorStore.initEditor()
      editorStore.editMode = 'new'
    }
  } else {
    // ── New card — may come from gallery with ?template=slug or ?community=id ──
    editorStore.editMode = 'new'
    const slug = route.query.template || cardsStore.currentTemplate || null
    const communityId = route.query.community || null
    const t = slug ? cardsStore.getTemplateBySlug(slug) : null

    if (t) {
      const layout = LAYOUT_MAP[slug] || 'center'
      const editorEls = buildEditorElements(layout, DEFAULT_EDITOR_PERSON, t.colors)
      editorStore.initEditor({
        elements: { recto: editorEls, verso: [] },
        backgrounds: { recto: t.colors.primary, verso: t.colors.secondary },
      })
      editorStore.cardName = `Carte ${t.name}`
      editorStore.templateSlug = slug
      editorStore.templatePrimaryColor = t.colors.secondary || t.colors.primary || '#6366F1'
    } else if (communityId) {
      // ── Community template — load design, replace contact text with defaults ──
      const ROLE_DEFAULTS = {
        firstName: 'Prénom',
        lastName: 'Nom',
        title: 'Votre titre professionnel',
        company: 'MON ENTREPRISE',
        email: 'email@monentreprise.fr',
        phone: '+33 6 00 00 00 00',
        website: 'www.monentreprise.fr',
        address: '123 Rue Exemple, Paris',
      }
      // Resolve source: public card (numeric ID) or public template ("tpl_" prefix)
      let sourceCard = null
      if (communityId.startsWith('tpl_')) {
        const tplId = communityId.replace('tpl_', '')
        try {
          const raw = localStorage.getItem(`digitalcard_publicTemplate_${tplId}`)
          if (raw) {
            const tpl = JSON.parse(raw)
            sourceCard = { name: tpl.name, data: { editorData: tpl.editorData } }
          }
        } catch {
          /* ignore corrupt entry */
        }
      } else {
        sourceCard = cardsStore.getPublicCard(Number(communityId))
      }
      if (sourceCard?.data?.editorData) {
        const edData = JSON.parse(JSON.stringify(sourceCard.data.editorData))
        const replaceDefaults = (els) =>
          (els || []).map((el) => {
            if (el.type === 'text' && el.role && ROLE_DEFAULTS[el.role]) {
              return { ...el, text: ROLE_DEFAULTS[el.role] }
            }
            return el
          })
        if (edData.elements?.recto) edData.elements.recto = replaceDefaults(edData.elements.recto)
        if (edData.elements?.verso) edData.elements.verso = replaceDefaults(edData.elements.verso)
        editorStore.initEditor(edData)
        editorStore.cardName = `Carte basée sur ${sourceCard.name || 'communauté'}`
        editorStore.isPublic = false // New card from community template → private by default
      } else if (sourceCard?.data?.elements) {
        // Fallback: rebuild from BusinessCard format
        const savedW = sourceCard.data.cardWidth || CARD_W
        const savedH = sourceCard.data.cardHeight || CARD_H
        const rebuilt = rebuildEditorElements(
          sourceCard.data.elements,
          sourceCard.data.versoElements,
          savedW,
          savedH,
        )
        editorStore.initEditor({
          elements: rebuilt,
          backgrounds: sourceCard.data.backgrounds || { recto: '#FFFFFF', verso: '#1E293B' },
          cardWidth: savedW,
          cardHeight: savedH,
          orientation: sourceCard.data.orientation || (savedH > savedW ? 'portrait' : 'landscape'),
        })
        editorStore.cardName = `Carte basée sur ${sourceCard.name || 'communauté'}`
      } else {
        editorStore.initEditor()
      }
    } else {
      editorStore.initEditor()
    }
    cardsStore.currentTemplate = null
  }

  // Load all Google Fonts used by the editor elements
  const allEls = [...(editorStore.currentElements || []), ...(editorStore.elements?.verso || [])]
  const usedFonts = [...new Set(allEls.map((e) => e.fontFamily).filter(Boolean))]
  if (usedFonts.length) fontStore.loadFonts(usedFonts)

  shellRef.value?.focus()
})

// ── Keyboard shortcuts ────────────────────────────────────────────────────
function onKeyDown(e) {
  const tag = e.target.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea') return

  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    editorStore.undo()
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault()
    editorStore.redo()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault()
    editorStore.duplicateSelected()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
    e.preventDefault()
    editorStore.copySelected()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
    e.preventDefault()
    editorStore.cutSelected()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
    e.preventDefault()
    editorStore.pasteClipboard()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
    e.preventDefault()
    editorStore.selectAll()
  } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'g') {
    e.preventDefault()
    editorStore.groupSelected()
  } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G') {
    e.preventDefault()
    editorStore.ungroupSelected()
  } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === ']') {
    e.preventDefault()
    if (editorStore.singleSelected) editorStore.bringToFront(editorStore.singleSelected.id)
  } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '[') {
    e.preventDefault()
    if (editorStore.singleSelected) editorStore.sendToBack(editorStore.singleSelected.id)
  } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === ']') {
    e.preventDefault()
    if (editorStore.singleSelected) editorStore.bringForward(editorStore.singleSelected.id)
  } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === '[') {
    e.preventDefault()
    if (editorStore.singleSelected) editorStore.sendBackward(editorStore.singleSelected.id)
  } else if (e.altKey && (e.key === 'l' || e.key === 'L')) {
    e.preventDefault()
    if (editorStore.singleSelected) editorStore.toggleLock(editorStore.singleSelected.id)
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    editorStore.deleteSelected()
  } else if (e.key === 'Escape') {
    editorStore.clearSelection()
  } else if (e.key.startsWith('Arrow') && editorStore.selectedIds.length) {
    e.preventDefault()
    const step = e.shiftKey ? 10 : 1
    const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
    const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
    editorStore.nudgeSelected(dx, dy)
  }
}

onBeforeUnmount(() => {
  editorStore.clearSelection()
})

// ── Leave guard ───────────────────────────────────────────────────────────
const showLeaveConfirm = ref(false)
let _leaveNext = null

onBeforeRouteLeave((to, from, next) => {
  if (editorStore.isDirty) {
    showLeaveConfirm.value = true
    _leaveNext = next
  } else {
    next()
  }
})

function onLeaveConfirmed() {
  showLeaveConfirm.value = false
  _leaveNext?.()
  _leaveNext = null
}

function onLeaveCancelled() {
  showLeaveConfirm.value = false
  _leaveNext?.(false)
  _leaveNext = null
}
</script>
