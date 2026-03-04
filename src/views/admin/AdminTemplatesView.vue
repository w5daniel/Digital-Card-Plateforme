<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <p class="text-xs" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">
        {{ adminStore.templates.length }} modèle(s) actif(s)
      </p>
      <button
        @click="openModal()"
        class="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
      >
        <Plus class="w-4 h-4" />
        <span>Nouveau modèle</span>
      </button>
    </div>

    <!-- Grid de templates -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="tmpl in adminStore.templates"
        :key="tmpl.id"
        class="rounded-xl border overflow-hidden hover:shadow-md transition-shadow"
        :class="themeStore.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'"
      >
        <!-- Preview couleur -->
        <div
          class="h-24 flex items-center justify-center relative"
          :style="{ backgroundColor: tmpl.preview + '20' }"
        >
          <div
            class="w-14 h-20 rounded-lg border-2 flex flex-col items-center justify-center space-y-1.5 shadow-sm"
            :style="{ borderColor: tmpl.preview, backgroundColor: tmpl.preview + '15' }"
          >
            <div class="w-8 h-2 rounded-full" :style="{ backgroundColor: tmpl.preview }" />
            <div
              class="w-6 h-1.5 rounded-full opacity-50"
              :style="{ backgroundColor: tmpl.preview }"
            />
            <div
              class="w-6 h-1.5 rounded-full opacity-30"
              :style="{ backgroundColor: tmpl.preview }"
            />
          </div>
          <!-- Badge premium -->
          <span
            v-if="tmpl.isPremium"
            class="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500 text-white"
            >PREMIUM</span
          >
        </div>

        <!-- Infos -->
        <div class="p-4">
          <div class="flex items-start justify-between mb-1">
            <div>
              <h3
                class="font-semibold text-sm"
                :class="themeStore.darkMode ? 'text-white' : 'text-gray-900'"
              >
                {{ tmpl.name }}
              </h3>
              <p class="text-xs" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'">
                {{ tmpl.category }}
              </p>
            </div>
          </div>
          <p class="text-xs mb-3" :class="themeStore.darkMode ? 'text-gray-500' : 'text-gray-400'">
            Utilisé {{ tmpl.usageCount }} fois
          </p>

          <!-- Actions -->
          <div class="flex items-center space-x-2">
            <button
              @click="adminStore.toggleTemplatePremium(tmpl.id)"
              class="flex-1 text-xs py-1.5 px-3 rounded-lg border transition-colors"
              :class="
                tmpl.isPremium
                  ? 'border-yellow-500/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10'
                  : themeStore.darkMode
                    ? 'border-slate-600 text-gray-400 hover:bg-slate-700'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              "
            >
              {{ tmpl.isPremium ? 'Retirer Premium' : 'Marquer Premium' }}
            </button>
            <button
              @click="openModal(tmpl)"
              class="p-1.5 rounded-lg transition-colors"
              :class="
                themeStore.darkMode
                  ? 'text-gray-400 hover:bg-slate-700'
                  : 'text-gray-400 hover:bg-gray-100'
              "
              title="Modifier"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              @click="confirmDeleteTemplate(tmpl)"
              class="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
              title="Supprimer"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Créer / Modifier -->
    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="modalOpen = false"
    >
      <div
        class="w-full max-w-md rounded-xl p-6 shadow-xl border"
        :class="themeStore.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'"
      >
        <h3
          class="font-semibold mb-4"
          :class="themeStore.darkMode ? 'text-white' : 'text-gray-900'"
        >
          {{ editingTemplate ? 'Modifier le modèle' : 'Nouveau modèle' }}
        </h3>

        <div class="space-y-3">
          <div>
            <label
              class="block text-xs font-medium mb-1"
              :class="themeStore.darkMode ? 'text-gray-300' : 'text-gray-700'"
              >Nom</label
            >
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="
                themeStore.darkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              "
            />
          </div>
          <div>
            <label
              class="block text-xs font-medium mb-1"
              :class="themeStore.darkMode ? 'text-gray-300' : 'text-gray-700'"
              >Catégorie</label
            >
            <input
              v-model="form.category"
              type="text"
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="
                themeStore.darkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              "
            />
          </div>
          <div>
            <label
              class="block text-xs font-medium mb-1"
              :class="themeStore.darkMode ? 'text-gray-300' : 'text-gray-700'"
              >Couleur de prévisualisation</label
            >
            <div class="flex items-center space-x-3">
              <input
                v-model="form.preview"
                type="color"
                class="w-10 h-8 rounded cursor-pointer border-0 bg-transparent"
              />
              <span
                class="text-sm"
                :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-500'"
                >{{ form.preview }}</span
              >
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <input
              v-model="form.isPremium"
              type="checkbox"
              id="tmpl-premium"
              class="w-4 h-4 rounded accent-primary-500"
            />
            <label
              for="tmpl-premium"
              class="text-sm"
              :class="themeStore.darkMode ? 'text-gray-300' : 'text-gray-700'"
              >Modèle Premium</label
            >
          </div>
        </div>

        <div class="flex space-x-3 mt-5">
          <button
            @click="modalOpen = false"
            class="flex-1 px-4 py-2 rounded-lg border text-sm transition-colors"
            :class="
              themeStore.darkMode
                ? 'border-slate-600 text-gray-300 hover:bg-slate-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            "
          >
            Annuler
          </button>
          <button
            @click="saveTemplate"
            :disabled="!form.name"
            class="flex-1 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {{ editingTemplate ? 'Enregistrer' : 'Créer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal suppression -->
    <div
      v-if="templateToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="templateToDelete = null"
    >
      <div
        class="w-full max-w-sm rounded-xl p-6 shadow-xl border"
        :class="themeStore.darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'"
      >
        <h3
          class="font-semibold mb-2"
          :class="themeStore.darkMode ? 'text-white' : 'text-gray-900'"
        >
          Supprimer le modèle
        </h3>
        <p class="text-sm mb-4" :class="themeStore.darkMode ? 'text-gray-400' : 'text-gray-600'">
          Supprimer <strong>{{ templateToDelete.name }}</strong> utilisé
          {{ templateToDelete.usageCount }} fois ?
        </p>
        <div class="flex space-x-3">
          <button
            @click="templateToDelete = null"
            class="flex-1 px-4 py-2 rounded-lg border text-sm transition-colors"
            :class="
              themeStore.darkMode
                ? 'border-slate-600 text-gray-300 hover:bg-slate-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            "
          >
            Annuler
          </button>
          <button
            @click="doDeleteTemplate"
            class="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useThemeStore } from '../../stores/themeStore'
import { useAdminStore } from '../../stores/adminStore'

const themeStore = useThemeStore()
const adminStore = useAdminStore()

const modalOpen = ref(false)
const editingTemplate = ref(null)
const templateToDelete = ref(null)
const form = ref({ name: '', category: '', preview: '#6366f1', isPremium: false })

const openModal = (tmpl = null) => {
  editingTemplate.value = tmpl
  form.value = tmpl
    ? { name: tmpl.name, category: tmpl.category, preview: tmpl.preview, isPremium: tmpl.isPremium }
    : { name: '', category: '', preview: '#6366f1', isPremium: false }
  modalOpen.value = true
}

const saveTemplate = () => {
  if (!form.value.name) return
  if (editingTemplate.value) {
    adminStore.updateTemplate(editingTemplate.value.id, { ...form.value })
  } else {
    adminStore.addTemplate({ ...form.value })
  }
  modalOpen.value = false
}

const confirmDeleteTemplate = (tmpl) => {
  templateToDelete.value = tmpl
}
const doDeleteTemplate = () => {
  if (templateToDelete.value) {
    adminStore.deleteTemplate(templateToDelete.value.id)
    templateToDelete.value = null
  }
}
</script>
