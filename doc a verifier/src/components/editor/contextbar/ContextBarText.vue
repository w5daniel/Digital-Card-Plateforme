<template>
  <!-- Text color (solid or gradient) -->
  <div class="flex items-center gap-1">
    <Type class="w-4 h-4 shrink-0" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'" />

    <!-- Solid mode: direct color picker -->
    <label
      v-if="props.fillMode !== 'gradient'"
      @mousedown.prevent
      class="relative w-6 h-6 rounded border overflow-hidden cursor-pointer"
      :class="themeStore.darkMode ? 'border-onyx-600' : 'border-powder-300'"
      title="Couleur du texte"
    >
      <div class="absolute inset-0" :style="{ background: sel.fill || '#000' }" />
      <input
        type="color"
        :value="sel.fill || '#000000'"
        @input="onSolidColorInput($event.target.value)"
        @change="onSolidColorChange($event.target.value)"
        class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      />
    </label>

    <!-- Gradient mode: preview swatch that opens fill popover -->
    <button
      v-else
      ref="localFillBtnRef"
      @click="emit('open-fill', localFillBtnRef.value)"
      class="w-6 h-6 rounded border overflow-hidden shrink-0"
      :class="themeStore.darkMode ? 'border-onyx-600' : 'border-powder-300'"
      title="Dégradé texte"
      :style="{ background: `linear-gradient(${props.gradAngle}deg, ${props.gradFrom}, ${props.gradTo})` }"
    />

    <!-- Gradient toggle button -->
    <button
      @click="emit('toggle-gradient')"
      class="w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0"
      :class="props.fillMode === 'gradient'
        ? (themeStore.darkMode ? 'bg-violet-900/50 text-flame-400' : 'bg-flame-50 text-flame-600')
        : btnCls"
      title="Basculer en dégradé"
    >
      <span class="text-[9px] font-bold leading-none"
        :style="props.fillMode === 'gradient'
          ? { background: `linear-gradient(90deg,${props.gradFrom},${props.gradTo})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }
          : {}"
      >GR</span>
    </button>
  </div>

  <!-- Gradient controls (inline when active) -->
  <template v-if="props.fillMode === 'gradient'">
    <div class="flex items-center gap-1">
      <label class="relative w-5 h-5 rounded border overflow-hidden cursor-pointer shrink-0" :class="themeStore.darkMode ? 'border-onyx-600' : 'border-powder-300'" title="Couleur début">
        <div class="absolute inset-0" :style="{ background: props.gradFrom }" />
        <input type="color" :value="props.gradFrom" @input="emit('update:gradFrom', $event.target.value); emit('update-gradient')" @change="emit('commit-gradient')" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
      </label>
      <label class="relative w-5 h-5 rounded border overflow-hidden cursor-pointer shrink-0" :class="themeStore.darkMode ? 'border-onyx-600' : 'border-powder-300'" title="Couleur fin">
        <div class="absolute inset-0" :style="{ background: props.gradTo }" />
        <input type="color" :value="props.gradTo" @input="emit('update:gradTo', $event.target.value); emit('update-gradient')" @change="emit('commit-gradient')" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
      </label>
      <!-- Angle presets -->
      <div class="flex gap-0.5">
        <button v-for="dir in [{a:0,icon:'↑'},{a:90,icon:'→'},{a:135,icon:'↘'},{a:180,icon:'↓'}]" :key="dir.a"
          @click="emit('update:gradAngle', dir.a); emit('commit-gradient')"
          class="w-5 h-5 rounded text-xs flex items-center justify-center transition-colors"
          :class="props.gradAngle === dir.a ? 'bg-flame-500 text-white' : btnCls"
        >{{ dir.icon }}</button>
      </div>
    </div>
  </template>

  <div class="w-px h-5 shrink-0" :class="divCls" />

  <!-- Font family (searchable dropdown) -->
  <FontPickerDropdown />

  <div class="w-px h-5 shrink-0" :class="divCls" />

  <!-- Font size -->
  <div class="flex items-center gap-0.5">
    <button @mousedown.prevent @click="changeFontSize(-1)" class="p-1 rounded" :class="btnCls">
      <Minus class="w-3 h-3" />
    </button>
    <input
      type="number"
      :value="sel.fontSize"
      @change="commit('fontSize', +$event.target.value)"
      class="w-12 text-center text-sm rounded px-1 py-1 outline-none border"
      :class="inputCls"
      min="6"
      max="200"
    />
    <button @mousedown.prevent @click="changeFontSize(1)" class="p-1 rounded" :class="btnCls">
      <Plus class="w-3 h-3" />
    </button>
  </div>

  <div class="w-px h-5 shrink-0" :class="divCls" />

  <!-- Bold -->
  <button
    @mousedown.prevent
    @click="toggleBold"
    class="p-1.5 rounded font-bold text-sm w-7 h-7 flex items-center justify-center transition-colors"
    :class="isBold ? activeBtnCls : btnCls"
    title="Gras"
  >
    B
  </button>

  <!-- Italic -->
  <button
    @mousedown.prevent
    @click="toggleItalic"
    class="p-1.5 rounded italic text-sm w-7 h-7 flex items-center justify-center transition-colors"
    :class="isItalic ? activeBtnCls : btnCls"
    title="Italique"
  >
    I
  </button>

  <!-- Underline -->
  <button
    @mousedown.prevent
    @click="toggleUnderline"
    class="p-1.5 rounded underline text-sm w-7 h-7 flex items-center justify-center transition-colors"
    :class="isUnderline ? activeBtnCls : btnCls"
    title="Souligné"
  >
    U
  </button>

  <!-- Underline color (only visible when underline is active) -->
  <label
    v-if="isUnderline"
    @mousedown.prevent
    class="relative w-5 h-5 rounded cursor-pointer border overflow-hidden shrink-0"
    :class="themeStore.darkMode ? 'border-onyx-600' : 'border-powder-300'"
    title="Couleur du soulignement"
  >
    <div
      class="absolute inset-0"
      :style="{ background: sel.underlineColor || sel.fill || '#000000' }"
    />
    <input
      type="color"
      :value="sel.underlineColor || sel.fill || '#000000'"
      @input="update('underlineColor', $event.target.value)"
      @change="commit('underlineColor', $event.target.value)"
      class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
    />
  </label>

  <!-- Bullet list styles -->
  <div class="flex items-center gap-0.5">
    <button
      v-for="bullet in bulletStyles"
      :key="bullet.prefix"
      @click="toggleBullets(bullet.prefix)"
      class="px-1.5 py-1 rounded text-xs font-mono transition-colors"
      :class="activeBullet === bullet.prefix ? activeBtnCls : btnCls"
      :title="bullet.label"
    >{{ bullet.symbol }}</button>
  </div>

  <div class="w-px h-5 shrink-0" :class="divCls" />

  <!-- Alignment -->
  <div class="flex items-center gap-0.5">
    <button
      v-for="a in alignments"
      :key="a.value"
      @mousedown.prevent
      @click="commit('align', a.value)"
      class="p-1.5 rounded transition-colors"
      :class="sel.align === a.value ? activeBtnCls : btnCls"
      :title="a.label"
    >
      <component :is="a.icon" class="w-3.5 h-3.5" />
    </button>
  </div>

  <!-- Letter spacing (disabled for styled text with mixed runs) -->
  <div
    class="flex items-center gap-1.5"
    :class="isStyledText ? 'opacity-40 cursor-not-allowed' : ''"
    :title="isStyledText ? 'Espacement indisponible pour le texte avec styles mixtes' : ''"
  >
    <MoveHorizontal
      class="w-3.5 h-3.5"
      :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
    />
    <input
      type="range"
      :value="sel.letterSpacing ?? 0"
      @input="!isStyledText && update('letterSpacing', +$event.target.value)"
      @change="!isStyledText && commit('letterSpacing', +$event.target.value)"
      min="-5"
      max="20"
      step="0.5"
      class="w-20 accent-flame-500"
      :disabled="isStyledText"
    />
    <span
      class="text-xs w-5 shrink-0"
      :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'"
    >
      {{ sel.letterSpacing ?? 0 }}
    </span>
  </div>

  <!-- Contact icon toggle (only for email/phone/website/address roles) -->
  <template v-if="isContactRole">
    <div class="w-px h-5 shrink-0" :class="divCls" />
    <button
      @click="commit('showContactIcon', !sel.showContactIcon)"
      class="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
      :class="sel.showContactIcon ? activeBtnCls : btnCls"
      title="Afficher l'icône correspondante au rôle (email, téléphone, site web, adresse)"
    >
      <Contact2 class="w-3.5 h-3.5" />
      <span>Icône</span>
    </button>
  </template>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Minus, Plus, AlignLeft, AlignCenter, AlignRight, Type, MoveHorizontal, Contact2 } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/useEditorStore'
import { useThemeStore } from '@/stores/themeStore'
import FontPickerDropdown from './FontPickerDropdown.vue'
import { applyRunStyle, toggleRunFlag } from '@/utils/textRuns'

const props = defineProps({
  fillMode: { type: String, default: 'solid' },
  gradFrom: { type: String, default: '#3B82F6' },
  gradTo: { type: String, default: '#8B5CF6' },
  gradAngle: { type: Number, default: 135 },
})
const emit = defineEmits([
  'update:fillMode',
  'update:gradFrom',
  'update:gradTo',
  'update:gradAngle',
  'open-fill',
  'toggle-gradient',
  'update-gradient',
  'commit-gradient',
  'solid-input',
  'solid-change',
])

const editorStore = useEditorStore()
const themeStore = useThemeStore()

const sel = computed(() => editorStore.singleSelected)
const isStyledText = computed(() => Array.isArray(sel.value?.runs) && sel.value.runs.length > 0)
const localFillBtnRef = ref(null)

const inputCls = computed(() =>
  themeStore.darkMode
    ? 'bg-onyx-800 border-onyx-700 text-powder-200'
    : 'bg-white border-powder-200 text-onyx-800',
)
const btnCls = computed(() =>
  themeStore.darkMode
    ? 'text-onyx-400 hover:bg-onyx-800 hover:text-white transition-colors'
    : 'text-onyx-500 hover:bg-powder-100 hover:text-onyx-900 transition-colors',
)
const activeBtnCls = computed(() =>
  themeStore.darkMode ? 'bg-violet-700 text-white' : 'bg-violet-100 text-violet-700',
)
const divCls = computed(() => (themeStore.darkMode ? 'bg-onyx-700' : 'bg-powder-200'))

function update(key, value) {
  if (!sel.value) return
  editorStore.updateElement(sel.value.id, { [key]: value })
}

function commit(key, value) {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, { [key]: value })
}

const alignments = [
  { value: 'left', label: 'Aligner à gauche', icon: AlignLeft },
  { value: 'center', label: 'Centrer', icon: AlignCenter },
  { value: 'right', label: 'Aligner à droite', icon: AlignRight },
]

const bulletStyles = [
  { prefix: '• ', symbol: '•', label: 'Puces rondes' },
  { prefix: '- ', symbol: '—', label: 'Tirets' },
  { prefix: '1. ', symbol: '1.', label: 'Liste numérotée' },
]

const CONTACT_ICON_ROLES = ['email', 'phone', 'website', 'address']

function isRunFlagOnRange(runs, start, end, flag) {
  if (!runs?.length || start >= end) return false
  for (let i = start; i < end; i++) {
    if (!runs.some((r) => r.start <= i && r.end > i && r[flag])) return false
  }
  return true
}

const isBold = computed(() => {
  const runSel = activeRunSelection()
  if (runSel && sel.value?.runs?.length) {
    return isRunFlagOnRange(sel.value.runs, runSel.start, runSel.end, 'bold')
  }
  return sel.value?.fontStyle?.includes('bold') ?? false
})

const isItalic = computed(() => {
  const runSel = activeRunSelection()
  if (runSel && sel.value?.runs?.length) {
    return isRunFlagOnRange(sel.value.runs, runSel.start, runSel.end, 'italic')
  }
  return sel.value?.fontStyle?.includes('italic') ?? false
})

const isUnderline = computed(() => {
  const runSel = activeRunSelection()
  if (runSel && sel.value?.runs?.length) {
    return isRunFlagOnRange(sel.value.runs, runSel.start, runSel.end, 'underline')
  }
  return sel.value?.textDecoration?.includes('underline') ?? false
})

const activeBullet = computed(() => {
  const text = sel.value?.text
  if (!text) return null
  const lines = text.split('\n').filter((l) => l.trim())
  if (!lines.length) return null
  for (const { prefix } of bulletStyles) {
    const isNumbered = prefix === '1. '
    const count = lines.filter((l) => (isNumbered ? /^\d+\. /.test(l) : l.startsWith(prefix))).length
    if (count > lines.length / 2) return prefix
  }
  return null
})

const isContactRole = computed(() => CONTACT_ICON_ROLES.includes(sel.value?.role))

function changeFontSize(delta) {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, {
    fontSize: Math.max(6, (sel.value.fontSize || 16) + delta),
  })
}

// Returns { start, end } if there is a non-empty selection in the inline text
// editor for the currently selected element — else null.
function activeRunSelection() {
  if (!sel.value) return null
  const st = editorStore.textEditState
  if (!st || st.elId !== sel.value.id) return null
  if (st.end <= st.start) return null
  return { start: st.start, end: st.end }
}

function toggleBold() {
  if (!sel.value) return
  const runSel = activeRunSelection()
  if (runSel) {
    const runs = toggleRunFlag(
      sel.value.runs || [],
      runSel.start,
      runSel.end,
      'bold',
      (sel.value.text || '').length,
    )
    const patch = { runs }
    if (!sel.value.runs?.length && sel.value.letterSpacing) patch.letterSpacing = 0
    editorStore.updateElementCommit(sel.value.id, patch)
    return
  }
  const cur = sel.value.fontStyle || 'normal'
  const bold = cur.includes('bold')
  const italic = cur.includes('italic')
  const next = [bold ? '' : 'bold', italic ? 'italic' : ''].filter(Boolean).join(' ') || 'normal'
  editorStore.updateElementCommit(sel.value.id, { fontStyle: next })
}

function toggleItalic() {
  if (!sel.value) return
  const runSel = activeRunSelection()
  if (runSel) {
    const runs = toggleRunFlag(
      sel.value.runs || [],
      runSel.start,
      runSel.end,
      'italic',
      (sel.value.text || '').length,
    )
    const patch = { runs }
    if (!sel.value.runs?.length && sel.value.letterSpacing) patch.letterSpacing = 0
    editorStore.updateElementCommit(sel.value.id, patch)
    return
  }
  const cur = sel.value.fontStyle || 'normal'
  const bold = cur.includes('bold')
  const italic = cur.includes('italic')
  const next = [bold ? 'bold' : '', italic ? '' : 'italic'].filter(Boolean).join(' ') || 'normal'
  editorStore.updateElementCommit(sel.value.id, { fontStyle: next })
}

function toggleUnderline() {
  if (!sel.value) return
  const runSel = activeRunSelection()
  if (runSel) {
    const runs = toggleRunFlag(
      sel.value.runs || [],
      runSel.start,
      runSel.end,
      'underline',
      (sel.value.text || '').length,
    )
    const patch = { runs }
    if (!sel.value.runs?.length && sel.value.letterSpacing) patch.letterSpacing = 0
    editorStore.updateElementCommit(sel.value.id, patch)
    return
  }
  const cur = sel.value.textDecoration || ''
  const turningOn = !cur.includes('underline')
  const patch = { textDecoration: turningOn ? 'underline' : '' }
  if (turningOn && !sel.value.underlineColor) {
    patch.underlineColor = sel.value.fill || '#000000'
  }
  editorStore.updateElementCommit(sel.value.id, patch)
}

// Apply a color on the active selection (if any) via runs, else return false
// so the caller propagates the emit to the parent (updating fill globally).
function applyRunColor(color, commit) {
  const runSel = activeRunSelection()
  if (!runSel || !sel.value) return false
  const runs = applyRunStyle(
    sel.value.runs || [],
    runSel.start,
    runSel.end,
    { color },
    (sel.value.text || '').length,
  )
  const patch = { runs }
  if (!sel.value.runs?.length && sel.value.letterSpacing) patch.letterSpacing = 0
  if (commit) editorStore.updateElementCommit(sel.value.id, patch)
  else editorStore.updateElement(sel.value.id, patch)
  return true
}

function onSolidColorInput(color) {
  if (applyRunColor(color, false)) return
  emit('solid-input', color)
}

function onSolidColorChange(color) {
  if (applyRunColor(color, true)) return
  emit('solid-change', color)
}

function stripBulletPrefix(line) {
  for (const { prefix: p } of bulletStyles) {
    if (p === '1. ') {
      if (/^\d+\. /.test(line)) return line.replace(/^\d+\. /, '')
    } else if (line.startsWith(p)) {
      return line.slice(p.length)
    }
  }
  return line
}

function applyNumberedPrefix(lines) {
  let n = 0
  return lines.map((l) => {
    if (!l.trim()) return l
    n++
    return `${n}. ${l}`
  })
}

function toggleBullets(prefix) {
  if (!sel.value) return
  let rawText = sel.value.text || ''

  if (!rawText.trim()) {
    const starter = prefix === '1. ' ? '1. ' : prefix
    editorStore.updateElementCommit(sel.value.id, { text: starter })
    return
  }

  const lines = rawText.split('\n')
  const nonEmptyLines = lines.filter((l) => l.trim())
  const isNumbered = prefix === '1. '

  const withPrefix = nonEmptyLines.filter((l) =>
    isNumbered ? /^\d+\. /.test(l) : l.startsWith(prefix),
  )
  const majority = withPrefix.length > nonEmptyLines.length / 2

  let newLines
  if (majority) {
    newLines = lines.map((l) => (l.trim() ? stripBulletPrefix(l) : l))
  } else {
    const stripped = lines.map((l) => (l.trim() ? stripBulletPrefix(l) : l))
    if (isNumbered) {
      newLines = applyNumberedPrefix(stripped)
    } else {
      newLines = stripped.map((l) => (l.trim() ? prefix + l : l))
    }
  }
  editorStore.updateElementCommit(sel.value.id, { text: newLines.join('\n') })
}
</script>
