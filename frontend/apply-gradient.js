const fs = require('fs')
let content = fs.readFileSync('src/components/editor/EditorLeftSidebar.vue', 'utf-8')

// ── 1. Add gradient state/functions before bgPresets ──────────────────────
const OLD_BGPRESETS = `const bgPresets = [`

const GRADIENT_BLOCK = `// ── Background gradient state ────────────────────────────────────────────
const bgMode = ref('solid') // 'solid' | 'gradient'
const bgGradAngle = ref(135)
const bgGradFrom = ref('#6366f1')
const bgGradTo = ref('#a855f7')

const BG_GRAD_PRESETS = [
  { label: 'Violet Passion', from: '#6366f1', to: '#a855f7', angle: 135 },
  { label: 'Sunset', from: '#f97316', to: '#ec4899', angle: 135 },
  { label: 'Ocean', from: '#0ea5e9', to: '#06b6d4', angle: 135 },
  { label: 'Forest', from: '#059669', to: '#10b981', angle: 135 },
  { label: 'Minuit', from: '#0f172a', to: '#334155', angle: 180 },
]

function buildGradientCss(angle, from, to) {
  return \`linear-gradient(\${angle}deg, \${from} 0%, \${to} 100%)\`
}

function applyBgGradient() {
  editorStore.setBackground(buildGradientCss(bgGradAngle.value, bgGradFrom.value, bgGradTo.value))
}

function applyBgGradPreset(preset) {
  bgGradAngle.value = preset.angle
  bgGradFrom.value = preset.from
  bgGradTo.value = preset.to
  editorStore.setBackground(buildGradientCss(preset.angle, preset.from, preset.to))
}

const bgPresets = [`

if (!content.includes(OLD_BGPRESETS)) {
  console.error('STEP1 NOT FOUND')
  process.exit(1)
}
content = content.replace(OLD_BGPRESETS, GRADIENT_BLOCK)
console.log('Step 1 done.')

// ── 2. Add watch after last watcher block ─────────────────────────────────
const LAST_WATCH_ANCHOR = `  { deep: true },
)

function syncInfoFromElements()`

const NEW_WATCH = `  { deep: true },
)

watch(
  () => editorStore.currentBackground,
  (bg) => {
    if (bg && bg.startsWith('linear-gradient(')) {
      bgMode.value = 'gradient'
      const m = bg.match(/linear-gradient((d+)deg,s*(#[0-9a-fA-F]{3,8})s*0%,s*(#[0-9a-fA-F]{3,8})s*100%)/)
      if (m) {
        bgGradAngle.value = parseInt(m[1])
        bgGradFrom.value = m[2]
        bgGradTo.value = m[3]
      }
    } else {
      bgMode.value = 'solid'
    }
  },
  { immediate: true },
)

function syncInfoFromElements()`

if (!content.includes(LAST_WATCH_ANCHOR)) {
  console.error('STEP2 NOT FOUND')
  process.exit(1)
}
content = content.replace(LAST_WATCH_ANCHOR, NEW_WATCH)
console.log('Step 2 done.')

// ── 3. Replace template background section ───────────────────────────────
const OLD_TEMPLATE = `            <!-- Background color -->
            <div class="px-3 pt-3">
              <p
                class="text-xs font-medium mb-2"
                :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
              >
                Couleur du fond
              </p>
              <div class="flex items-center gap-2 mb-2">
                <label
                  class="relative w-8 h-8 rounded-lg border-2 overflow-hidden cursor-pointer shrink-0"
                  :style="{
                    borderColor: themeStore.darkMode ? '#4B5563' : '#D1D5DB',
                    backgroundColor: editorStore.currentBackground,
                  }"
                >
                  <input
                    type="color"
                    :value="editorStore.currentBackground"
                    @input="editorStore.setBackground($event.target.value)"
                    class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </label>
                <input
                  type="text"
                  :value="editorStore.currentBackground"
                  @change="editorStore.setBackground($event.target.value)"
                  class="flex-1 text-xs px-2 py-1.5 rounded border font-mono outline-none"
                  :class="
                    themeStore.darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200'
                      : 'bg-white border-gray-200 text-gray-800'
                  "
                  placeholder="#FFFFFF"
                />
              </div>
              <!-- Solid color swatches -->
              <div class="grid grid-cols-8 gap-1 mb-3">
                <button
                  v-for="c in bgPresets"
                  :key="c"
                  @click="editorStore.setBackground(c)"
                  class="aspect-square rounded border-2 transition-all hover:scale-110"
                  :style="{ backgroundColor: c }"
                  :class="
                    editorStore.currentBackground === c
                      ? 'border-violet-500 scale-110'
                      : themeStore.darkMode
                        ? 'border-gray-700'
                        : 'border-gray-200'
                  "
                />
              </div>
            </div>`

const NEW_TEMPLATE = `            <!-- Background color picker -->
            <div class="px-3 mb-3">
              <p
                class="text-xs font-medium mb-2"
                :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
              >
                Couleur de fond
              </p>
              <!-- Tabs Uni / Dégradé -->
              <div
                class="relative flex rounded-lg p-0.5 mb-3 text-xs"
                :class="themeStore.darkMode ? 'bg-gray-800' : 'bg-gray-100'"
              >
                <div
                  class="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md shadow-sm transition-all duration-300 ease-out"
                  :class="themeStore.darkMode ? 'bg-gray-700' : 'bg-white'"
                  :style="{ left: bgMode === 'solid' ? '2px' : '50%' }"
                />
                <button
                  @click="bgMode = 'solid'"
                  class="relative z-10 flex-1 py-1 rounded-md font-medium transition-colors"
                  :class="bgMode === 'solid' ? (themeStore.darkMode ? 'text-gray-100' : 'text-gray-800') : (themeStore.darkMode ? 'text-gray-500' : 'text-gray-400')"
                >Uni</button>
                <button
                  @click="bgMode = 'gradient'"
                  class="relative z-10 flex-1 py-1 rounded-md font-medium transition-colors"
                  :class="bgMode === 'gradient' ? (themeStore.darkMode ? 'text-gray-100' : 'text-gray-800') : (themeStore.darkMode ? 'text-gray-500' : 'text-gray-400')"
                >Dégradé</button>
              </div>

              <!-- Mode Uni -->
              <template v-if="bgMode === 'solid'">
                <div class="flex items-center gap-2 mb-2">
                  <label
                    class="relative w-8 h-8 rounded-lg overflow-hidden border-2 cursor-pointer flex-shrink-0 transition-all hover:scale-105"
                    :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-200'"
                    :style="{ background: editorStore.currentBackground }"
                  >
                    <input
                      type="color"
                      :value="editorStore.currentBackground?.startsWith('linear-gradient') ? '#6366f1' : (editorStore.currentBackground || '#ffffff')"
                      @input="editorStore.setBackground($event.target.value)"
                      class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </label>
                  <input
                    type="text"
                    :value="editorStore.currentBackground?.startsWith('linear-gradient') ? '' : (editorStore.currentBackground || '')"
                    @change="editorStore.setBackground($event.target.value)"
                    class="flex-1 text-xs px-2 py-1.5 rounded border font-mono outline-none"
                    :class="themeStore.darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'"
                    placeholder="#FFFFFF"
                  />
                </div>
                <!-- Solid color swatches -->
                <div class="grid grid-cols-8 gap-1 mb-3">
                  <button
                    v-for="c in bgPresets"
                    :key="c"
                    @click="editorStore.setBackground(c)"
                    class="aspect-square rounded border-2 transition-all hover:scale-110"
                    :style="{ backgroundColor: c }"
                    :class="editorStore.currentBackground === c ? 'border-violet-500 scale-110' : themeStore.darkMode ? 'border-gray-700' : 'border-gray-200'"
                  />
                </div>
              </template>

              <!-- Mode Dégradé -->
              <template v-else>
                <!-- Direction picker -->
                <div class="mb-2">
                  <p class="text-[10px] mb-1.5" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">Direction</p>
                  <div class="grid grid-cols-4 gap-1">
                    <button
                      v-for="dir in [{ a: 0, icon: '↑' }, { a: 45, icon: '↗' }, { a: 90, icon: '→' }, { a: 135, icon: '↘' }, { a: 180, icon: '↓' }, { a: 225, icon: '↙' }, { a: 270, icon: '←' }, { a: 315, icon: '↖' }]"
                      :key="dir.a"
                      @click="bgGradAngle = dir.a; applyBgGradient()"
                      class="py-1 rounded text-sm font-bold transition-all"
                      :class="[bgGradAngle === dir.a ? 'bg-violet-500 text-white' : themeStore.darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
                    >{{ dir.icon }}</button>
                  </div>
                </div>
                <!-- From / To color pickers -->
                <div class="flex gap-2 mb-2">
                  <div class="flex-1">
                    <p class="text-[10px] mb-1" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">Début</p>
                    <label
                      class="relative w-full h-7 rounded border overflow-hidden cursor-pointer block"
                      :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-200'"
                      :style="{ background: bgGradFrom }"
                    >
                      <input type="color" :value="bgGradFrom" @input="bgGradFrom = $event.target.value; applyBgGradient()" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    </label>
                  </div>
                  <div class="flex-1">
                    <p class="text-[10px] mb-1" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">Fin</p>
                    <label
                      class="relative w-full h-7 rounded border overflow-hidden cursor-pointer block"
                      :class="themeStore.darkMode ? 'border-gray-600' : 'border-gray-200'"
                      :style="{ background: bgGradTo }"
                    >
                      <input type="color" :value="bgGradTo" @input="bgGradTo = $event.target.value; applyBgGradient()" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    </label>
                  </div>
                </div>
                <!-- Preview strip -->
                <div
                  class="w-full h-6 rounded mb-2 border"
                  :class="themeStore.darkMode ? 'border-gray-700' : 'border-gray-200'"
                  :style="{ background: buildGradientCss(bgGradAngle, bgGradFrom, bgGradTo) }"
                />
                <!-- Gradient presets -->
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="preset in BG_GRAD_PRESETS"
                    :key="preset.label"
                    @click="applyBgGradPreset(preset)"
                    class="w-7 h-7 rounded border-2 transition-all hover:scale-110 hover:shadow-sm"
                    :style="{ background: buildGradientCss(preset.angle, preset.from, preset.to) }"
                    :class="themeStore.darkMode ? 'border-gray-700 hover:border-violet-500' : 'border-gray-200 hover:border-violet-400'"
                    :title="preset.label"
                  />
                </div>
              </template>
            </div>`

if (!content.includes(OLD_TEMPLATE)) {
  console.error('STEP3 NOT FOUND')
  process.exit(1)
}
content = content.replace(OLD_TEMPLATE, NEW_TEMPLATE)
console.log('Step 3 done.')

fs.writeFileSync('src/components/editor/EditorLeftSidebar.vue', content, 'utf-8')
console.log('All done. File written.')
