<template>
  <div class="space-y-4">
    <!-- ── Header ── -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Nom, slug, catégorie..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-flame-500"
          :class="
            themeStore.darkMode
              ? 'bg-onyx-800 border-onyx-700 text-white placeholder-onyx-500'
              : 'bg-powder-100 border-onyx-200 text-onyx-900 placeholder-onyx-400'
          "
        />
      </div>
      <div class="flex items-center justify-between gap-3">
        <p class="text-xs whitespace-nowrap" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-500'">
          {{ filteredTemplates.length }} modèle(s)
          <span v-if="filteredTemplates.length !== cardsStore.getAllTemplates.length">
            sur {{ cardsStore.getAllTemplates.length }}
          </span>
        </p>

      <!--
        TODO backend : "Nouveau modèle" doit créer un template dans la table `templates`.
        Flux prévu :
          1. Admin crée/édite le design dans l'éditeur (route /editor)
          2. Sur "Enregistrer", si l'utilisateur est admin → proposer "Sauvegarder comme template"
          3. POST /api/admin/templates { name, slug, category, isPremium, editorData, elements }
          4. Le nouveau template apparaît dans la galerie publique immédiatement
        Pour l'instant : redirige simplement vers l'éditeur vierge.
      -->
      <button
        @click="router.push('/editor')"
        class="flex items-center space-x-2 px-4 py-2 rounded-lg bg-flame-500 hover:bg-flame-600 text-white text-sm font-medium transition-colors"
      >
        <Plus class="w-4 h-4" />
        <span>Nouveau modèle</span>
      </button>
      </div>
    </div>

    <!--
      TODO backend : charger la liste via GET /api/admin/templates
        → inclure les stats d'usage (usageCount = nb cartes créées depuis ce template)
        → inclure isPremium, createdAt, updatedAt
        → paginer si > 50 templates
    -->
    <div ref="gridRef" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(tmpl, idx) in filteredTemplates"
        :key="tmpl.slug"
        class="rounded-xl border overflow-hidden hover:shadow-md transition-shadow"
        :class="
          themeStore.darkMode ? 'bg-onyx-800 border-onyx-700' : 'bg-powder-50 border-powder-200'
        "
      >
        <!-- ── Live preview (même pattern que GalleryView) ── -->
        <!--
          TODO backend : remplacer par un thumbnail PNG pré-généré côté serveur
            (Puppeteer / headless Chrome → POST /api/admin/templates/:slug/thumbnail)
          Avantage : pas de rendu Vue côté admin, chargement instantané
        -->
        <div
          class="relative overflow-hidden cursor-pointer group bg-onyx-900"
          style="height: 160px"
          @click="router.push('/editor?template=' + tmpl.slug)"
        >
          <div
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '500px',
              transformOrigin: 'top left',
              transform: `scale(${previewScale})`,
              pointerEvents: 'none',
            }"
          >
            <BusinessCard :card="buildPreviewCard(tmpl, idx)" :isFlipped="false" />
          </div>

          <!-- Overlay hover : "Ouvrir dans l'éditeur" -->
          <div
            class="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
          >
            <span class="text-white text-xs font-semibold flex items-center gap-1.5">
              <Pencil class="w-3.5 h-3.5" />
              Ouvrir dans l'éditeur
            </span>
          </div>

          <!-- Badge premium (toujours visible) -->
          <span
            v-if="tmpl.isPremium"
            class="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500 text-white z-10"
            >PREMIUM</span
          >
        </div>

        <!-- ── Infos ── -->
        <div class="p-3">
          <div class="mb-1">
            <h3
              class="font-semibold text-sm"
              :class="themeStore.darkMode ? 'text-white' : 'text-onyx-900'"
            >
              {{ tmpl.name }}
            </h3>
            <p class="text-xs" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">
              {{ tmpl.slug }} · {{ tmpl.category }}
            </p>
          </div>

          <!--
            TODO backend : tmpl.usageCount vient de la requête :
              SELECT COUNT(*) FROM cards WHERE template_slug = :slug
            Pour l'instant la valeur est toujours 0 (non trackée côté front)
          -->
          <p class="text-xs mb-3" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">
            Utilisé {{ tmpl.usageCount ?? 0 }} fois
          </p>

          <!-- ── Actions ── -->
          <div class="flex items-center space-x-2">
            <!--
              Toggle Premium.
              TODO backend : PUT /api/admin/templates/:slug { isPremium }
                → mettre à jour is_premium dans la table `templates`
                → invalider le cache CDN de la gallery
            -->
            <button
              @click="cardsStore.toggleTemplatePremium(tmpl.slug)"
              class="flex-1 text-xs py-1.5 px-3 rounded-lg border transition-colors"
              :class="
                tmpl.isPremium
                  ? 'border-yellow-500/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10'
                  : themeStore.darkMode
                    ? 'border-onyx-600 text-onyx-400 hover:bg-onyx-700'
                    : 'border-onyx-200 text-onyx-500 hover:bg-powder-100'
              "
            >
              {{ tmpl.isPremium ? 'Retirer Premium' : 'Marquer Premium' }}
            </button>

            <!--
              Modifier : ouvre l'éditeur avec le template pré-chargé.
              TODO backend : l'éditeur doit détecter que l'utilisateur est admin + template existant,
                et proposer "Enregistrer le template" → PUT /api/admin/templates/:slug { editorData, elements }
                Au lieu de créer une nouvelle carte utilisateur.
            -->
            <button
              @click="router.push('/editor?template=' + tmpl.slug)"
              class="p-1.5 rounded-lg transition-colors"
              :class="
                themeStore.darkMode
                  ? 'text-onyx-400 hover:bg-onyx-700'
                  : 'text-onyx-400 hover:bg-powder-100'
              "
              title="Modifier dans l'éditeur"
            >
              <Pencil class="w-4 h-4" />
            </button>

            <!--
              Supprimer.
              TODO backend : DELETE /api/admin/templates/:slug
                → soft-delete (colonne deleted_at) pour conserver l'historique
                → les cartes existantes créées depuis ce template NE sont PAS supprimées
                → retirer immédiatement de la galerie publique
            -->
            <button
              @click="confirmDelete(tmpl)"
              class="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
              title="Supprimer ce modèle"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div
        v-if="filteredTemplates.length === 0"
        class="col-span-3 text-center py-12"
        :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'"
      >
        <p class="text-sm">
          {{ cardsStore.getAllTemplates.length === 0
            ? 'Aucun modèle disponible.'
            : 'Aucun modèle ne correspond à la recherche.' }}
        </p>
        <button
          v-if="searchQuery && cardsStore.getAllTemplates.length > 0"
          @click="searchQuery = ''"
          class="mt-2 text-flame-500 hover:underline text-xs"
        >
          Effacer la recherche
        </button>
      </div>
    </div>

    <!-- ── Modal confirmation suppression ── -->
    <div
      v-if="templateToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="templateToDelete = null"
      @keydown.escape="templateToDelete = null"
      tabindex="0"
    >
      <div
        class="w-full max-w-sm rounded-xl p-6 shadow-xl border"
        :class="
          themeStore.darkMode ? 'bg-onyx-800 border-onyx-700' : 'bg-powder-50 border-powder-200'
        "
      >
        <h3
          class="font-semibold mb-2"
          :class="themeStore.darkMode ? 'text-white' : 'text-onyx-900'"
        >
          Supprimer le modèle
        </h3>
        <p class="text-sm mb-1" :class="themeStore.darkMode ? 'text-onyx-400' : 'text-onyx-600'">
          Supprimer <strong>{{ templateToDelete.name }}</strong> ?
        </p>
        <p class="text-xs mb-4" :class="themeStore.darkMode ? 'text-onyx-500' : 'text-onyx-400'">
          Le modèle sera retiré de la galerie. Les cartes déjà créées depuis ce modèle ne seront pas
          affectées.
        </p>
        <div class="flex space-x-3">
          <button
            @click="templateToDelete = null"
            class="flex-1 px-4 py-2 rounded-lg border text-sm transition-colors"
            :class="
              themeStore.darkMode
                ? 'border-onyx-600 text-onyx-300 hover:bg-onyx-700'
                : 'border-onyx-200 text-onyx-700 hover:bg-powder-100'
            "
          >
            Annuler
          </button>
          <button
            @click="doDelete"
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Pencil, Trash2, Search } from 'lucide-vue-next'
import { useThemeStore } from '../../stores/themeStore'
import { useCardsStore } from '../../stores/cards'
import BusinessCard from '../../components/BusinessCard.vue'
import { LAYOUT_MAP, buildElements } from '../../utils/templateLayouts'

const router = useRouter()
const themeStore = useThemeStore()
const cardsStore = useCardsStore()

// ── Recherche / filtre modèles ──────────────────────────────────────────
// TODO backend : filtrage côté serveur via GET /api/admin/templates?search=
const searchQuery = ref('')
const filteredTemplates = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return cardsStore.getAllTemplates
  return cardsStore.getAllTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q) ||
      (t.category || '').toLowerCase().includes(q),
  )
})

// ── Live preview scale (ResizeObserver sur la grille) ──────────────────
// TODO backend : remplacer les previews live par des thumbnails PNG pré-générés
const gridRef = ref(null)
const previewScale = ref(0.52)

let ro = null
onMounted(() => {
  if (!gridRef.value) return
  ro = new ResizeObserver((entries) => {
    const w = entries[0]?.contentRect.width
    if (!w) return
    // Détecter le nombre réel de colonnes CSS via le premier enfant
    // (évite le décalage breakpoint viewport vs container width)
    const firstChild = gridRef.value?.children?.[0]
    let cols = 1
    if (firstChild) {
      const childW = firstChild.getBoundingClientRect().width
      cols = Math.max(1, Math.round(w / childW))
    }
    const gap = 16 // gap-4 = 16px
    const colW = (w - (cols - 1) * gap) / cols
    previewScale.value = Math.min(1, colW / 500)
  })
  ro.observe(gridRef.value)
})
onBeforeUnmount(() => ro?.disconnect())

// ── Personnes exemples pour les previews ──────────────────────────────
const samplePersons = [
  {
    fullName: 'Sophie Martin',
    title: 'Directrice Marketing',
    company: 'InnovateLab',
    email: 'sophie@innovatelab.fr',
    phone: '+33 6 12 34 56 78',
    website: 'innovatelab.fr',
  },
  {
    fullName: 'Marc Dubois',
    title: 'CEO & Fondateur',
    company: 'TechVision',
    email: 'marc@techvision.io',
    phone: '+33 7 98 76 54 32',
    website: 'techvision.io',
  },
  {
    fullName: 'Léa Rousseau',
    title: 'Designer UX/UI',
    company: 'Creative Studio',
    email: 'lea@creativestudio.fr',
    phone: '+33 6 45 67 89 01',
    website: 'creativestudio.fr',
  },
  {
    fullName: 'Nicolas Petit',
    title: 'Architecte Solutions',
    company: 'DataBridge',
    email: 'nicolas@databridge.fr',
    phone: '+33 7 23 45 67 89',
    website: 'databridge.fr',
  },
  {
    fullName: 'Emma Bernard',
    title: 'Consultant Senior',
    company: 'Stratégie & Co',
    email: 'emma@strategie-co.fr',
    phone: '+33 6 87 65 43 21',
    website: 'strategie.co.fr',
  },
]

function buildPreviewCard(tmpl, idx) {
  const person = samplePersons[idx % samplePersons.length]
  const layout = LAYOUT_MAP[tmpl.slug] || 'center'
  return {
    id: `admin-preview-${tmpl.slug}`,
    template: tmpl.slug,
    // cardWidth/cardHeight obligatoires : BusinessCard.vue calcule fontScale = actualWidth / cardWidth
    // Sans ces valeurs → division par undefined → NaN / Infinity
    data: { elements: buildElements(layout, person, tmpl.colors), showQR: false, cardWidth: 500, cardHeight: 300 },
  }
}

// ── Suppression ────────────────────────────────────────────────────────
const templateToDelete = ref(null)

function confirmDelete(tmpl) {
  templateToDelete.value = tmpl
}

function doDelete() {
  if (!templateToDelete.value) return
  cardsStore.removeTemplate(templateToDelete.value.slug)
  templateToDelete.value = null
}
</script>
