<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed z-[9999] min-w-[204px] rounded-xl shadow-2xl border overflow-visible py-1 select-none"
      :class="dark ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'"
      :style="{ left: safeX + 'px', top: safeY + 'px' }"
      @mousedown.stop
      @contextmenu.prevent
    >
      <!-- ── ELEMENT SELECTED ──────────────────────────────────────────── -->
      <template v-if="hasSelection">

        <!-- Copier (single only) -->
        <button v-if="selectionCount === 1" :class="btnCls" @click="emit('copy')">
          <Copy :class="icoCls" /><span class="flex-1">Copier</span><kbd :class="kbdCls">Ctrl+C</kbd>
        </button>
        <!-- Coller -->
        <button :class="[btnCls, !hasClipboard && 'opacity-40 cursor-not-allowed']" :disabled="!hasClipboard" @click="emit('paste')">
          <Clipboard :class="icoCls" /><span class="flex-1">Coller</span><kbd :class="kbdCls">Ctrl+V</kbd>
        </button>
        <!-- Dupliquer -->
        <button :class="btnCls" @click="emit('duplicate')">
          <Files :class="icoCls" /><span class="flex-1">Dupliquer</span><kbd :class="kbdCls">Ctrl+D</kbd>
        </button>

        <div :class="divCls" />

        <!-- Supprimer -->
        <button
          class="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors text-red-500 hover:bg-red-50"
          :class="dark && 'hover:bg-red-900/20'"
          @click="emit('delete')"
        >
          <Trash2 :class="icoCls" /><span class="flex-1">Supprimer</span><kbd :class="kbdCls">Suppr</kbd>
        </button>

        <!-- Multi-selection count badge -->
        <p v-if="selectionCount > 1" :class="lblCls">{{ selectionCount }} éléments sélectionnés</p>

        <div :class="divCls" />

        <!-- Verrouiller (single only) -->
        <template v-if="selectionCount === 1">
          <button :class="btnCls" @click="emit('toggle-lock')">
            <LockOpen v-if="isLocked" :class="icoCls" />
            <Lock v-else :class="icoCls" />
            <span class="flex-1">{{ isLocked ? 'Déverrouiller' : 'Verrouiller' }}</span>
            <kbd :class="kbdCls">Alt+L</kbd>
          </button>
          <div :class="divCls" />
        </template>

        <!-- Group / Ungroup (multi-selection) -->
        <template v-if="selectionCount >= 2">
          <div :class="divCls" />
          <button v-if="!isGrouped" :class="btnCls" @click="emit('group')">
            <Group :class="icoCls" /><span class="flex-1">Grouper</span><kbd :class="kbdCls">Ctrl+G</kbd>
          </button>
          <button v-else :class="btnCls" @click="emit('ungroup')">
            <Ungroup :class="icoCls" /><span class="flex-1">Dégrouper</span><kbd :class="kbdCls">Ctrl+Shift+G</kbd>
          </button>
          <div :class="divCls" />
        </template>

        <!-- Aligner sur la page (hover → submenu) -->
        <div class="relative group/align">
          <button :class="btnCls">
            <AlignCenter :class="icoCls" />
            <span class="flex-1 text-left">Aligner sur la page</span>
            <ChevronRight class="w-3 h-3 opacity-40 shrink-0" />
          </button>

          <!-- Submenu flottant -->
          <div
            class="absolute left-full top-0 min-w-[186px] rounded-xl shadow-2xl border py-1
                   invisible pointer-events-none
                   group-hover/align:visible group-hover/align:pointer-events-auto"
            :class="dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
            style="margin-left:3px"
          >
            <p :class="lblCls">Horizontal</p>
            <button :class="btnCls" @click="emit('align','left')"><AlignLeft :class="icoCls" /><span>Bord gauche</span></button>
            <button :class="btnCls" @click="emit('align','centerH')"><AlignCenter :class="icoCls" /><span>Centrer</span></button>
            <button :class="btnCls" @click="emit('align','right')"><AlignRight :class="icoCls" /><span>Bord droit</span></button>
            <div :class="divCls" />
            <p :class="lblCls">Vertical</p>
            <button :class="btnCls" @click="emit('align','top')"><ArrowUpToLine :class="icoCls" /><span>Bord haut</span></button>
            <button :class="btnCls" @click="emit('align','centerV')"><AlignCenter :class="icoCls" /><span>Centrer</span></button>
            <button :class="btnCls" @click="emit('align','bottom')"><ArrowDownToLine :class="icoCls" /><span>Bord bas</span></button>
          </div>
        </div>

        <!-- Calque (single only) -->
        <template v-if="selectionCount === 1">
          <div :class="divCls" />
          <p :class="lblCls">Calque</p>
          <button :class="btnCls" @click="emit('bring-to-front')"><ChevronsUp   :class="icoCls" /><span>Premier plan</span></button>
          <button :class="btnCls" @click="emit('bring-forward')"> <ChevronUp    :class="icoCls" /><span>Avancer</span></button>
          <button :class="btnCls" @click="emit('send-backward')"> <ChevronDown  :class="icoCls" /><span>Reculer</span></button>
          <button :class="btnCls" @click="emit('send-to-back')">  <ChevronsDown :class="icoCls" /><span>Arrière-plan</span></button>
        </template>

      </template>

      <!-- ── CANVAS VIDE ────────────────────────────────────────────────── -->
      <template v-else>
        <button :class="[btnCls, !hasClipboard && 'opacity-40 cursor-not-allowed']" :disabled="!hasClipboard" @click="emit('paste')">
          <Clipboard :class="icoCls" /><span class="flex-1">Coller</span><kbd :class="kbdCls">Ctrl+V</kbd>
        </button>
        <button :class="btnCls" @click="emit('select-all')">
          <MousePointer :class="icoCls" /><span class="flex-1">Tout sélectionner</span><kbd :class="kbdCls">Ctrl+A</kbd>
        </button>
      </template>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import {
  Copy, Clipboard, Files, Trash2, Lock, LockOpen,
  AlignLeft, AlignCenter, AlignRight,
  ArrowUpToLine, ArrowDownToLine,
  ChevronsUp, ChevronUp, ChevronDown, ChevronsDown,
  ChevronRight, MousePointer, Group, Ungroup,
} from 'lucide-vue-next'

const props = defineProps({
  visible:        { type: Boolean, default: false },
  x:              { type: Number,  default: 0 },
  y:              { type: Number,  default: 0 },
  hasSelection:   { type: Boolean, default: false },
  selectionCount: { type: Number,  default: 0 },
  hasClipboard:   { type: Boolean, default: false },
  isLocked:       { type: Boolean, default: false },
  isGrouped:      { type: Boolean, default: false },
  dark:           { type: Boolean, default: false },
})

const emit = defineEmits([
  'copy', 'paste', 'duplicate', 'delete',
  'toggle-lock', 'align',
  'bring-to-front', 'bring-forward', 'send-backward', 'send-to-back',
  'select-all', 'group', 'ungroup',
])

const MENU_W = 208
const MENU_H = 400

const safeX = computed(() => Math.min(props.x, (window?.innerWidth  ?? 800) - MENU_W - 8))
const safeY = computed(() => Math.min(props.y, (window?.innerHeight ?? 600) - MENU_H - 8))

// Shared class helpers (non-reactive — depend only on dark prop which triggers recompute via parent)
const btnCls  = computed(() => [
  'w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors',
  props.dark ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-50 text-gray-700',
])
const icoCls  = 'w-3.5 h-3.5 shrink-0 opacity-70'
const divCls  = computed(() => ['my-1 mx-2 h-px', props.dark ? 'bg-gray-700' : 'bg-gray-100'])
const kbdCls  = computed(() => ['text-[10px] font-mono ml-auto shrink-0 pl-3', props.dark ? 'text-gray-500' : 'text-gray-400'])
const lblCls  = computed(() => ['px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider', props.dark ? 'text-gray-500' : 'text-gray-400'])
</script>
