<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="popoverDivRef"
      :style="popoverStyle"
      class="w-52 rounded-xl border shadow-2xl p-3"
      :class="themeStore.darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
    >
      <!-- Tabs Uni / Dégradé -->
      <div
        class="relative flex rounded-lg p-0.5 mb-3 text-xs"
        :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-gray-100'"
      >
        <div
          class="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md shadow-sm transition-all duration-300 ease-out"
          :class="themeStore.darkMode ? 'bg-gray-700' : 'bg-white'"
          :style="{ left: fillMode === 'solid' ? '2px' : '50%' }"
        />
        <button
          @click="emit('update:fillMode', 'solid')"
          class="relative z-10 flex-1 py-1 rounded-md font-medium transition-colors"
          :class="fillMode === 'solid' ? (themeStore.darkMode ? 'text-gray-100' : 'text-gray-800') : (themeStore.darkMode ? 'text-gray-500' : 'text-gray-400')"
        >Uni</button>
        <button
          @click="emit('update:fillMode', 'gradient')"
          class="relative z-10 flex-1 py-1 rounded-md font-medium transition-colors"
          :class="fillMode === 'gradient' ? (themeStore.darkMode ? 'text-gray-100' : 'text-gray-800') : (themeStore.darkMode ? 'text-gray-500' : 'text-gray-400')"
        >Dégradé</button>
      </div>

      <!-- Solid mode -->
      <template v-if="fillMode === 'solid'">
        <div class="flex items-center gap-2 overflow-hidden">
          <label
            class="relative w-8 h-8 rounded-lg border overflow-hidden cursor-pointer flex-shrink-0"
            :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-200'"
            :style="{ background: currentFill || '#3B82F6' }"
          >
            <input type="color" :value="currentFill || '#3B82F6'" @input="emit('solidInput', $event.target.value)" @change="emit('solidChange', $event.target.value)" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
          </label>
          <input
            type="text"
            :value="currentFill || ''"
            @change="emit('solidChange', $event.target.value)"
            class="flex-1 min-w-0 text-xs px-2 py-1.5 rounded border font-mono outline-none"
            :class="themeStore.darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'"
            placeholder="#3B82F6"
          />
        </div>
      </template>

      <!-- Gradient mode -->
      <template v-else>
        <p class="text-[10px] mb-1.5" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">Direction</p>
        <div class="grid grid-cols-4 gap-1 mb-2">
          <button
            v-for="dir in [{ a: 0, icon: '↑' }, { a: 45, icon: '↗' }, { a: 90, icon: '→' }, { a: 135, icon: '↘' }, { a: 180, icon: '↓' }, { a: 225, icon: '↙' }, { a: 270, icon: '←' }, { a: 315, icon: '↖' }]"
            :key="dir.a"
            @click="emit('update:gradAngle', dir.a); emit('gradChange')"
            class="py-0.5 rounded text-sm font-bold transition-all"
            :class="gradAngle === dir.a ? 'bg-violet-500 text-white' : themeStore.darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >{{ dir.icon }}</button>
        </div>
        <div class="flex gap-2 mb-2">
          <div class="flex-1">
            <p class="text-[9px] mb-0.5" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">Début</p>
            <label
              class="relative h-7 w-full rounded border overflow-hidden cursor-pointer block"
              :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-200'"
              :style="{ background: gradFrom }"
            >
              <input type="color" :value="gradFrom" @input="emit('update:gradFrom', $event.target.value); emit('gradInput')" @change="emit('gradChange')" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
            </label>
          </div>
          <div class="flex-1">
            <p class="text-[9px] mb-0.5" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">Fin</p>
            <label
              class="relative h-7 w-full rounded border overflow-hidden cursor-pointer block"
              :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-200'"
              :style="{ background: gradTo }"
            >
              <input type="color" :value="gradTo" @input="emit('update:gradTo', $event.target.value); emit('gradInput')" @change="emit('gradChange')" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
            </label>
          </div>
        </div>
        <div
          class="w-full h-5 rounded"
          :style="{ background: `linear-gradient(${gradAngle}deg, ${gradFrom} 0%, ${gradTo} 100%)` }"
        />
      </template>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useThemeStore } from '@/stores/themeStore'

const props = defineProps({
  open: Boolean,
  popoverStyle: Object,
  fillMode: String,
  gradAngle: Number,
  gradFrom: String,
  gradTo: String,
  currentFill: String,
  triggerRef: Object,
})

const emit = defineEmits([
  'update:open',
  'update:fillMode',
  'update:gradAngle',
  'update:gradFrom',
  'update:gradTo',
  'solidInput',
  'solidChange',
  'gradInput',
  'gradChange',
])

const themeStore = useThemeStore()
const popoverDivRef = ref(null)

function onOutsideClick(e) {
  if (
    popoverDivRef.value && !popoverDivRef.value.contains(e.target) &&
    props.triggerRef?.value && !props.triggerRef.value.contains(e.target)
  ) {
    emit('update:open', false)
  }
}

watch(() => props.open, (open) => {
  if (open) nextTick(() => document.addEventListener('mousedown', onOutsideClick))
  else document.removeEventListener('mousedown', onOutsideClick)
})

onBeforeUnmount(() => document.removeEventListener('mousedown', onOutsideClick))
</script>
