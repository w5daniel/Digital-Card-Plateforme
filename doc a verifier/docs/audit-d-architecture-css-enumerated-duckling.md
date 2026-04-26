# Migration Tailwind CSS → DaisyUI — Plan de Référence d'Implémentation

> **Fichier de référence pour l'implémentation de la migration de `digital-card-platform-v3`.**
> Ce document contient le contexte complet, la stratégie, les correspondances de classes, et le plan
> étape par étape. Il doit être la source de vérité pendant toute la durée de la migration.

---

## 1. Contexte et état de départ

### Ce que l'audit a révélé

L'application utilise **trois couches CSS distinctes** qui coexistent :

| Couche | Fichier source | Rôle actuel |
|--------|---------------|-------------|
| `@layer components` custom | `src/assets/main.css` | Définit `.btn-primary`, `.card`, `.input-field`, etc. — c'est le vrai design system |
| Tailwind utilitaires | Partout dans les `.vue` | Spacing, layout, responsive, couleurs custom |
| DaisyUI | `tailwind.config.js` (plugin) | **Installé mais non configuré** — génère du CSS mort |

**Palette de couleurs custom définie dans `tailwind.config.js` :**
- `flame` (50–950) — orange/rouge, couleur primaire de l'app
- `onyx` (50–950) — gris-vert foncé, fonds dark et textes
- `powder` (50–950) — beige/crème, fonds light
- `primary`, `secondary`, `accent` — peu utilisés

**Système de dark mode actuel :** Tailwind `darkMode: 'class'`
- `themeStore.toggleDarkMode()` ajoute/retire la classe `.dark` sur `<html>`
- Les composants utilisent soit `dark:` prefix Tailwind, soit des ternaires `themeStore.darkMode ? 'dark-class' : 'light-class'`

**Problème central :** DaisyUI utilise `data-theme="dark"` sur `<html>`, pas la classe `.dark`. Les deux systèmes ne sont pas connectés, ce qui empêche les composants DaisyUI de répondre au toggle de thème.

### Classes custom actuellement définies dans `main.css`

```
Boutons:    .btn-primary, .btn-secondary, .btn-icon, .btn-icon-light,
            .btn-icon-flame, .btn-icon-red, .btn-outline, .btn-outline-primary,
            .btn-ghost, .btn-ghost-primary, .btn-ghost-neutral, .btn-link

Structure:  .card, .card-hover, .input-field

Typo:       .gradient-text, .section-title

Utilitaires: .text-shadow, .glass
```

Ces classes sont utilisées dans **50+ fichiers Vue**. La migration ne peut pas les renommer sans tout casser.

---

## 2. Contrainte absolue

> **⚠️ AUCUNE MODIFICATION DE LOGIQUE APPLICATIVE**
>
> - Les `<script>` des composants Vue ne sont **pas touchés**
> - Les `v-if`, `v-for`, `v-model`, `@click`, computed, watchers → **inchangés**
> - Seuls les attributs `class` et `:class` des templates sont modifiés
> - Les ternaires `themeStore.darkMode ? X : Y` qui contrôlent des **classes CSS uniquement**
>   peuvent être simplifiés, mais leur logique sous-jacente reste intacte

---

## 3. Stratégie retenue : "Theme-First avec Alias"

### Principe

Au lieu de remplacer 50+ fichiers, on procède en deux temps :

1. **Phase fondation** : Configurer DaisyUI pour qu'il ressemble exactement au design actuel → les composants DaisyUI sortent du bon look automatiquement
2. **Phase alias** : Réécrire `main.css` pour que `.btn-primary`, `.card`, etc. deviennent des alias DaisyUI via `@apply` → tous les fichiers existants migrent automatiquement
3. **Phase harmonisation** : Corriger les fichiers qui ont des classes Tailwind hardcodées (Dashboard, Editor UI) pour utiliser les tokens sémantiques DaisyUI

### Pourquoi cette approche

- **Risque minimal** : Les 50+ fichiers qui utilisent `.btn-primary` n'ont pas besoin d'être touchés en phase 2
- **Rétrocompatibilité totale** : Les class names custom sont préservés comme wrappers DaisyUI
- **Dark mode automatique** : Une fois DaisyUI configuré avec les bons thèmes, le toggle thème devient trivial
- **Itérable** : Chaque phase est indépendante et testable

---

## 4. Phase 0 — Créer le fichier de référence dans le projet

**Avant de coder quoi que ce soit**, copier ce document dans le projet :

```
MIGRATION_DAISYUI.md  (à la racine du projet)
```

Ce fichier devient la référence permanente pour l'équipe.

---

## 5. Phase 1 — Configuration Foundation (3 fichiers)

### 5.1 — `tailwind.config.js` : Configurer les thèmes DaisyUI

**Objectif :** Mapper la palette `flame`/`onyx`/`powder` sur les tokens sémantiques DaisyUI
(`primary`, `base-100`, `base-content`, etc.) pour que les composants DaisyUI utilisent
automatiquement les bonnes couleurs.

> **Note DaisyUI 5 :** DaisyUI 5.x utilise l'espace couleur OKLCH en interne. Pour la config dans
> `tailwind.config.js`, utiliser les valeurs HEX actuelles — DaisyUI les convertit automatiquement.

```javascript
// tailwind.config.js — version cible
export default {
  darkMode: 'class',   // ← CONSERVER pour les dark: utilities Tailwind pendant la transition
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── CONSERVER TOUTE LA PALETTE CUSTOM ──────────────────────────────
        // Ces tokens sont toujours utilisés directement dans les composants Vue
        flame: { 50: '#fff3ed', 100: '#ffe4d0', 200: '#ffc49e', 300: '#ff9a68',
                 400: '#ff6530', 500: '#e83800', 600: '#e63200', 700: '#bf2400',
                 800: '#991d00', 900: '#7c1b00', 950: '#430c00' },
        onyx:  { 50: '#f0f4f1', 100: '#dde6df', 200: '#bccec1', 300: '#93aea0',
                 400: '#6d9080', 500: '#537569', 600: '#415d53', 700: '#354c43',
                 800: '#2b3d37', 900: '#1c2a24', 950: '#0a100d' },
        powder:{ 50: '#fdfcfb', 100: '#f9f6f5', 200: '#f2ece9', 300: '#dcccc6',
                 400: '#c9b4ab', 500: '#b49489', 600: '#9a7166', 700: '#7f574f',
                 800: '#6a4544', 900: '#593a39', 950: '#311f1e' },
        // primary, secondary, accent — conserver tels quels
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-in-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'bounce-slow':'bounce 3s infinite',
        'shake':      'shake 0.45s ease-in-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' },
                   '100%': { transform: 'translateY(0)', opacity: '1' } },
        shake:   { '0%, 100%': { transform: 'translateX(0)' },
                   '15%, 45%, 75%': { transform: 'translateX(-5px)' },
                   '30%, 60%, 90%': { transform: 'translateX(5px)' } },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        // ── THÈME CLAIR ────────────────────────────────────────────────────
        light: {
          "primary":          "#e83800",  // flame-500 — CTA principal
          "primary-content":  "#ffffff",  // texte sur primary
          "secondary":        "#0ba5e9",  // secondary-500
          "secondary-content":"#ffffff",
          "accent":           "#eab308",  // accent-500
          "accent-content":   "#ffffff",
          "neutral":          "#354c43",  // onyx-700
          "neutral-content":  "#f9f6f5",  // powder-100
          "base-100":         "#fdfcfb",  // powder-50  — fond principal
          "base-200":         "#f9f6f5",  // powder-100 — fond secondaire
          "base-300":         "#f2ece9",  // powder-200 — fond tertiaire/borders
          "base-content":     "#1c2a24",  // onyx-900   — texte principal
          "info":             "#0ba5e9",
          "info-content":     "#ffffff",
          "success":          "#10b981",
          "success-content":  "#ffffff",
          "warning":          "#f59e0b",
          "warning-content":  "#ffffff",
          "error":            "#ef4444",
          "error-content":    "#ffffff",
        },
      },
      {
        // ── THÈME SOMBRE ───────────────────────────────────────────────────
        dark: {
          "primary":          "#e83800",  // flame-500 — même couleur
          "primary-content":  "#ffffff",
          "secondary":        "#0369a1",  // secondary-700
          "secondary-content":"#ffffff",
          "accent":           "#ca8a04",  // accent-600
          "accent-content":   "#ffffff",
          "neutral":          "#1c2a24",  // onyx-900
          "neutral-content":  "#f9f6f5",  // powder-100
          "base-100":         "#0a100d",  // onyx-950  — fond principal dark
          "base-200":         "#1c2a24",  // onyx-900  — fond secondaire dark
          "base-300":         "#2b3d37",  // onyx-800  — fond tertiaire dark
          "base-content":     "#f9f6f5",  // powder-100 — texte principal dark
          "info":             "#36bffa",
          "info-content":     "#0c4a6e",
          "success":          "#10b981",
          "success-content":  "#ffffff",
          "warning":          "#f59e0b",
          "warning-content":  "#000000",
          "error":            "#f87171",
          "error-content":    "#ffffff",
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
}
```

---

### 5.2 — `src/stores/themeStore.js` : Connecter `data-theme`

**Objectif :** Chaque fois que le toggle dark mode est activé, mettre à jour **à la fois**
la classe `.dark` (pour Tailwind) ET l'attribut `data-theme` (pour DaisyUI).

**Localiser la fonction `toggleDarkMode` dans `themeStore.js` et y ajouter :**

```javascript
// Chercher la ligne qui fait classList.toggle('dark') ou classList.add/remove('dark')
// Ajouter juste après ou en même temps :

// Dans initTheme() ou équivalent :
document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light')

// Dans toggleDarkMode() :
document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light')
```

> **C'est la seule modification de store requise.** Elle ne change aucune logique métier —
> elle ajoute juste un effet de bord CSS sur le même toggle qui existe déjà.

---

### 5.3 — `src/assets/main.css` : Réécrire `@layer components` avec tokens DaisyUI

**Objectif :** Les classes custom (`.btn-primary`, `.card`, etc.) deviennent des wrappers qui
délèguent à DaisyUI via `@apply`. Tous les 50+ fichiers qui utilisent ces classes migrent
automatiquement **sans aucune modification de leur côté**.

> **Stratégie :** Remplacer les `@apply` utilisant `bg-flame-500 dark:bg-onyx-900` par des
> `@apply` utilisant les classes DaisyUI + ajustements éventuels.

```css
@layer components {

  /* ── BOUTONS ──────────────────────────────────────────────────────────── */

  .btn-primary {
    @apply btn btn-primary
           shadow-sm hover:shadow-md hover:scale-105
           active:scale-95 transition-all duration-200 ease-out
           font-semibold rounded-xl px-6 py-3;
  }

  .btn-secondary {
    @apply btn btn-ghost
           border border-base-300
           hover:border-base-300 hover:bg-base-200
           hover:shadow-md hover:scale-105 active:scale-95
           transition-all duration-200 ease-out
           font-semibold rounded-xl px-6 py-3;
  }

  .btn-icon {
    @apply btn btn-ghost btn-sm
           p-2 rounded-lg
           transition-all duration-200 ease-out
           hover:scale-110 active:scale-95;
  }

  .btn-icon-light {
    @apply btn-icon
           text-base-content/70 hover:bg-base-200 hover:text-base-content;
  }

  .btn-icon-flame {
    @apply btn-icon
           text-primary hover:bg-primary/10 hover:text-primary;
  }

  .btn-icon-red {
    @apply btn-icon
           text-error hover:bg-error/10 hover:text-error;
  }

  .btn-outline {
    @apply btn btn-outline btn-sm
           transition-all duration-200 ease-out
           hover:scale-105 active:scale-95
           rounded-lg text-sm font-medium;
  }

  .btn-outline-primary {
    @apply btn-outline btn-primary;
  }

  .btn-ghost {
    @apply btn btn-ghost btn-sm
           transition-all duration-200 ease-out
           hover:scale-105 active:scale-95
           rounded-lg text-sm font-medium;
  }

  .btn-ghost-primary {
    @apply btn-ghost text-primary hover:bg-primary/10;
  }

  .btn-ghost-neutral {
    @apply btn-ghost text-base-content/80 hover:bg-base-200;
  }

  .btn-link {
    @apply btn btn-link
           text-primary transition-colors duration-200;
  }

  /* ── CARTE ────────────────────────────────────────────────────────────── */

  .card {
    @apply bg-base-100 border border-base-300
           rounded-2xl shadow-sm hover:shadow-md
           transition-all duration-300 overflow-hidden;
  }

  .card-hover {
    @apply transform hover:-translate-y-1 transition-all duration-300;
  }

  /* ── FORMULAIRES ─────────────────────────────────────────────────────── */

  .input-field {
    @apply input input-bordered w-full
           rounded-xl
           bg-base-200 text-base-content
           placeholder:text-base-content/40
           focus:border-primary focus:ring-2 focus:ring-primary/20
           transition-all duration-200;
  }

  /* ── TYPO ────────────────────────────────────────────────────────────── */

  .gradient-text {
    @apply text-primary;
    background: linear-gradient(135deg, theme('colors.flame.500'), theme('colors.flame.300'));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .section-title {
    @apply text-4xl md:text-5xl font-bold mb-4 text-base-content;
  }

  /* ── UTILITAIRES ─────────────────────────────────────────────────────── */

  .text-shadow {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.08);
  }

  .glass {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}
```

**Ce que ces 3 fichiers modifiés accomplissent :**
- Tous les composants Vue qui utilisent `.btn-primary`, `.card`, `.input-field` etc. sont déjà migrés
- Le dark mode fonctionne via `data-theme` sans toucher un seul fichier Vue
- La palette `flame`/`onyx`/`powder` reste disponible pour les usages directs dans les composants

---

## 6. Phase 2 — Harmonisation des fichiers hardcodés

Ces fichiers contournent le design system et ont des classes Tailwind hardcodées à remplacer.

### 6.1 — `src/views/DashboardView.vue`

**Problème :** Les boutons du header sont stylisés manuellement au lieu d'utiliser `.btn-secondary`/`.btn-primary`.

**Règle de remplacement :**

| Classes actuelles (hardcodées) | Remplacer par |
|-------------------------------|---------------|
| `px-6 py-3 bg-powder-200 hover:bg-powder-300 dark:bg-onyx-700 dark:hover:bg-onyx-600 text-onyx-800 dark:text-white font-semibold rounded-xl shadow-sm transition-all duration-200 hover:scale-105 active:scale-95` | `btn-secondary` |
| `px-6 py-3 bg-flame-500 hover:bg-flame-600 text-white font-semibold rounded-xl shadow-sm transition-all duration-200 flex items-center space-x-2 hover:scale-105 active:scale-95` | `btn-primary` |
| `bg-powder-50 dark:bg-onyx-900 border border-powder-200 dark:border-onyx-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300` | `card p-6` |
| `text-xs font-semibold text-onyx-500 dark:text-onyx-400 bg-powder-100 dark:bg-onyx-700 px-2 py-1 rounded-full` | `badge badge-ghost text-xs` |

**Les ternaires `:class` qui disparaissent :**
```html
<!-- AVANT -->
:class="selectedCardIds.size > 0
  ? 'bg-powder-200 hover:bg-powder-300 dark:bg-onyx-700 dark:hover:bg-onyx-600 text-onyx-800 dark:text-white ...'
  : 'bg-powder-200 dark:bg-onyx-700 text-onyx-800 dark:text-white'"

<!-- APRÈS — la logique disabled:opacity-40 suffit -->
class="btn-secondary"
:disabled="selectedCardIds.size === 0"
```
> **Pas de changement de logique** — la condition `selectedCardIds.size === 0` reste sur `:disabled`,
> le style change seul.

---

### 6.2 — `src/views/GalleryView.vue`

**Patterns à remplacer :**

| Pattern actuel | Remplacer par |
|----------------|---------------|
| Search input classes Tailwind | `input input-bordered w-full` |
| Filter tabs container | `tabs tabs-boxed` |
| Filter tab items | `tab` + `tab-active` (conditionnel) |
| `bg-amber-500 text-white rounded-full text-xs` (badge Premium) | `badge badge-warning` |
| `bg-emerald-500 text-white rounded-full text-xs` (badge Gratuit) | `badge badge-success` |
| `bg-flame-500 ... rounded-xl hover:shadow-xl` (CTA boutons) | `btn btn-primary` |

---

### 6.3 — `src/views/LoginView.vue` et `RegisterView.vue`

Ces fichiers utilisaient déjà des classes DaisyUI réelles (`input input-bordered`, `form-control`,
`label`, `checkbox`, `divider`, `loading loading-spinner`, `alert alert-error`). Après la phase 1,
le thème DaisyUI sera configuré — ces composants fonctionneront correctement sans modification.

**Seul ajustement nécessaire :** Vérifier que `alert alert-error` utilise bien les couleurs du thème
configuré (error = `#ef4444`). Si la couleur hardcodée `bg-red-50 dark:bg-red-900/20` subsiste,
la remplacer par `alert alert-error` seul.

---

### 6.4 — Modales (`BatchCreateModal.vue`, `CreateCardFromTemplateModal.vue`, etc.)

**Structure modale actuelle → structure DaisyUI :**

```html
<!-- AVANT -->
<div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
  <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="emit('close')" />
  <div class="relative w-full max-w-lg bg-white dark:bg-onyx-900 rounded-2xl shadow-2xl ...">

<!-- APRÈS -->
<dialog class="modal modal-open" @click.self="emit('close')">
  <div class="modal-box w-full max-w-lg">
```

> **Note :** Utiliser `<dialog class="modal modal-open">` nécessite de vérifier que Teleport et les
> transitions Vue (`<Transition name="modal-fade">`) sont compatibles. Si problème de compatibilité,
> garder la structure `div` existante et appliquer seulement `modal-box` au contenu intérieur.

**Alternative sans risque (recommandée pour les modales) :**
```html
<!-- Garder le backdrop existant, migrer seulement l'intérieur -->
<div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
  <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="emit('close')" />
  <div class="modal-box relative w-full max-w-lg">   <!-- ← seul changement -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-lg">...</h3>
      <button class="btn btn-sm btn-circle btn-ghost" @click="emit('close')">✕</button>
    </div>
    <!-- body -->
    <div class="modal-action">
      <button class="btn" @click="emit('close')">Annuler</button>
      <button class="btn btn-primary" @click="handleConfirm">Confirmer</button>
    </div>
  </div>
</div>
```

**Header modale :**

| Actuel | DaisyUI |
|--------|---------|
| `px-6 py-4 border-b border-onyx-800 flex justify-between items-center` | `flex justify-between items-center mb-4` + `divider` après |
| `p-1 rounded-lg text-onyx-500 hover:bg-onyx-800` (bouton fermer) | `btn btn-sm btn-circle btn-ghost` |

**Footer modale :**

| Actuel | DaisyUI |
|--------|---------|
| `px-6 py-4 border-t border-onyx-800 flex justify-between gap-3` | `modal-action` |

---

### 6.5 — Admin views (`AdminDashboardView.vue`, `AdminUsersView.vue`, etc.)

**Tables :**

| Actuel | DaisyUI |
|--------|---------|
| `w-full text-sm` + `thead bg-onyx-800` + rows `hover:bg-onyx-800` | `table table-zebra` |
| `overflow-x-auto rounded-lg border` (wrapper) | `overflow-x-auto` |

**KPI Cards :**

| Actuel | DaisyUI |
|--------|---------|
| `rounded-xl p-4 border bg-onyx-800 border-onyx-700 hover:shadow-md` | `card card-compact bg-base-200 border border-base-300` |
| `text-2xl font-bold text-white` (valeur) | `text-2xl font-bold text-base-content` |

**Badges de statut :**

| Actuel | DaisyUI |
|--------|---------|
| `bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5` | `badge badge-warning badge-sm` |
| `bg-green-500 text-white text-xs rounded-full` | `badge badge-success badge-sm` |
| `bg-red-500 text-white text-xs rounded-full` | `badge badge-error badge-sm` |
| `bg-blue-500 text-white text-xs rounded-full` | `badge badge-info badge-sm` |

**Barres de progression :**

| Actuel | DaisyUI |
|--------|---------|
| `w-full h-1.5 rounded-full bg-onyx-700` + `bg-flame-500 h-1.5 rounded-full` | `progress progress-primary w-full` |

---

### 6.6 — `src/components/NavBar.vue`

La NavBar utilise déjà les classes custom (`.btn-primary`, `.btn-icon`, `.btn-icon-light`,
`.btn-ghost-primary`, `.btn-ghost-neutral`), donc la Phase 1 la migre automatiquement.

**Seule intervention nécessaire :** Le menu dropdown est construit manuellement. Après la Phase 1,
vérifier visuellement que les hover states utilisent bien les couleurs du thème. Si besoin, remplacer :

| Actuel (ternaire themeStore) | Après migration |
|-----------------------------|-----------------|
| `themeStore.darkMode ? 'bg-onyx-900 border-onyx-800' : 'bg-powder-50 border-powder-200'` | `bg-base-100 border border-base-300` |
| `themeStore.darkMode ? 'text-powder-200 hover:bg-onyx-800' : 'text-onyx-700 hover:bg-powder-50'` | `text-base-content hover:bg-base-200` |
| `themeStore.darkMode ? 'border-onyx-800 bg-onyx-950/40' : 'border-powder-100 bg-powder-50'` | `border-base-300 bg-base-200/40` |

**Gain :** Chaque ternaire `themeStore.darkMode ? X : Y` (purement stylistique) disparaît.
La logique métier du dropdown reste inchangée.

---

### 6.7 — `ToastNotification.vue` (si présent)

Remplacer la structure de toast custom par les classes DaisyUI :

| Actuel | DaisyUI |
|--------|---------|
| `bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100` | `alert alert-success` |
| `bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800` | `alert alert-error` |
| `bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800` | `alert alert-warning` |
| `bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800` | `alert alert-info` |

---

### 6.8 — Zone Éditeur (portée limitée)

L'éditeur utilise un design différent du reste de l'app (UI compacte, sombre, canvas). Priorité basse.

**Ce qu'on touche :**
- `EditorLeftSidebar.vue` : les ternaires `themeStore.darkMode ? X : Y` → tokens `bg-base-*`
- `EditorTopBar.vue` : boutons inline → utiliser `.btn-icon-light`

**Ce qu'on ne touche pas :**
- `EditorCanvas.vue` : Les couleurs hex hardcodées (`#030712`, `rgba(139,92,246,0.4)`, etc.)
  sont des **couleurs de l'interface de dessin** (canvas, guides, snap lines, transformer anchors).
  Elles ne dépendent pas du thème UI et doivent rester hardcodées.
- `EditorSidebarDesign.vue` : Les `#6366f1`, `#f97316` etc. sont des **presets de couleur de carte**
  (valeurs choisies par l'utilisateur). Ne pas toucher.

---

## 7. Tableau de correspondance global des classes

### Boutons

| Classe actuelle | Équivalent DaisyUI | Notes |
|-----------------|-------------------|-------|
| `.btn-primary` | `btn btn-primary` | Couleur = `flame-500` via theme |
| `.btn-secondary` | `btn btn-ghost` | Ou `btn btn-neutral` |
| `.btn-icon` | `btn btn-ghost btn-sm btn-square` | |
| `.btn-icon-light` | `btn btn-ghost btn-sm` | |
| `.btn-icon-flame` | `btn btn-ghost btn-sm text-primary` | |
| `.btn-icon-red` | `btn btn-ghost btn-sm text-error` | |
| `.btn-outline` | `btn btn-outline btn-sm` | |
| `.btn-outline-primary` | `btn btn-outline btn-primary btn-sm` | |
| `.btn-ghost` | `btn btn-ghost btn-sm` | |
| `.btn-ghost-primary` | `btn btn-ghost btn-sm text-primary` | |
| `.btn-ghost-neutral` | `btn btn-ghost btn-sm` | |
| `.btn-link` | `btn btn-link` | |

### Formulaires

| Classe actuelle | Équivalent DaisyUI |
|-----------------|-------------------|
| `.input-field` | `input input-bordered w-full` |
| `<select>` custom | `select select-bordered w-full` |
| `<input type="checkbox">` | `checkbox checkbox-primary` |
| `<input type="range">` | `range range-primary range-xs` |

### Structure

| Pattern actuel | Équivalent DaisyUI |
|----------------|-------------------|
| `.card` | `card bg-base-100 border border-base-300` |
| Modal backdrop + box | `modal modal-open` + `modal-box` |
| Header modale | `flex justify-between` + `btn btn-circle btn-ghost` |
| Footer modale | `modal-action` |
| Tabs/pills custom | `tabs tabs-boxed` + `tab tab-active` |
| Table custom | `table table-zebra` |
| Badge inline | `badge badge-primary/success/warning/error/info` |
| Alert inline | `alert alert-success/error/warning/info` |
| Divider `h-px bg-*` | `divider` |
| Spinner | `loading loading-spinner loading-sm` |
| Progress bar | `progress progress-primary` |

### Couleurs sémantiques (pour les ternaires themeStore à simplifier)

| Tailwind ternaire actuel | Token DaisyUI |
|--------------------------|---------------|
| `bg-white dark:bg-onyx-900` | `bg-base-100` |
| `bg-powder-100 dark:bg-onyx-800` | `bg-base-200` |
| `bg-powder-200 dark:bg-onyx-700` | `bg-base-300` |
| `border-powder-200 dark:border-onyx-800` | `border-base-300` |
| `text-onyx-900 dark:text-powder-100` | `text-base-content` |
| `text-onyx-600 dark:text-powder-400` | `text-base-content/70` |
| `text-onyx-400 dark:text-onyx-500` | `text-base-content/40` |
| `hover:bg-powder-100 dark:hover:bg-onyx-800` | `hover:bg-base-200` |
| `text-flame-600 dark:text-flame-400` | `text-primary` |
| `bg-flame-500` | `bg-primary` |
| `hover:bg-flame-50 dark:hover:bg-flame-950/30` | `hover:bg-primary/10` |

---

## 8. Ordre d'implémentation recommandé

```
Étape 1  tailwind.config.js      ✅ FAIT — Thèmes DaisyUI configurés
Étape 2  src/stores/themeStore.js ✅ FAIT — setAttribute('data-theme', ...) ajouté
Étape 3  src/assets/main.css      ✅ FAIT — @layer components réécrit
Étape 4  DashboardView.vue        ✅ FAIT — Boutons/cards/badges hardcodés remplacés
Étape 5  NavBar.vue               ✅ FAIT — Tous ternaires themeStore remplacés
Étape 6  GalleryView.vue          ✅ FAIT — Search input, tabs, badges, empty states
Étape 7  Modales                  ✅ FAIT — ConfirmModal, BatchCreateModal, CreateCardFromTemplateModal,
                                             PrivacyBlockModal, SaveAsModal — tous dark? remplacés
Étape 8  Admin views              ✅ FAIT — AdminDashboardView + 5 vues admin + AdminLayout migrés
Étape 9  Login/Register views     ✅ FAIT — dark:/onyx-/powder- remplacés par tokens sémantiques
Étape 10 Editor sidebars          ✅ FAIT — EditorLeftSidebar + EditorTopBar tous ternaires remplacés
```

---

## 9. Vérification et tests

### Checklist après l'Étape 3 (point de vérification critique)

- [ ] L'app charge sans erreur console CSS
- [ ] Les boutons `.btn-primary` sont `flame-500` en light ET dark mode
- [ ] Le toggle thème (NavBar) bascule correctement entre light et dark
- [ ] `document.documentElement.getAttribute('data-theme')` retourne `'light'` ou `'dark'`
- [ ] Les cards `.card` ont le bon fond et la bonne bordure dans les deux thèmes
- [ ] Les inputs `.input-field` sont stylisés correctement

### Checklist finale

- [ ] Toutes les vues publiques (Home, Login, Register, Gallery) s'affichent correctement
- [ ] Dashboard : boutons, stats cards, tabs fonctionnent
- [ ] Modales : ouverture/fermeture inchangées, style cohérent
- [ ] Admin : tables, badges, KPI cards
- [ ] Éditeur : fonctionnel (aucune régression de la logique canvas)
- [ ] Responsive : vérifier sur mobile (375px) et desktop (1440px)
- [ ] Accessibilité : les couleurs ont un contraste suffisant dans les deux thèmes

### Commandes utiles

```bash
npm run dev      # Démarrer le serveur de dev avec HMR
npm run build    # Build de production (détecte les erreurs CSS Tailwind)
npm run lint     # Vérifier la cohérence du code
```

---

## 10. Risques et points d'attention

| Risque | Impact | Mitigation |
|--------|--------|-----------|
| DaisyUI 5 a une API différente de v4 pour les thèmes | Moyen | Vérifier la doc DaisyUI 5 pour la syntaxe exacte du bloc `daisyui:{}` dans tailwind.config.js |
| `@apply btn` peut générer des styles qui écrasent les custom | Moyen | Tester visuellement `.btn-primary` après Phase 1 Étape 3 |
| `base.css` contient des variables CSS Vue legacy (`--vt-c-*`) | Faible | Ces variables ne sont plus utilisées, mais les laisser en place pour éviter tout risque |
| L'éditeur canvas utilise `themeStore.darkMode` pour des styles inline JS | Nul | Hors périmètre de migration — ne pas toucher |
| DaisyUI peut appliquer `reset` CSS qui casse des styles globaux | Moyen | Vérifier `base: true` dans la config DaisyUI — si problème, passer à `base: false` |

---

*Document créé lors de l'audit d'architecture CSS — Session du 2026-04-25*
*Projet : `digital-card-platform-v3` — Stack : Vue 3 + Pinia + Tailwind 3.4 + DaisyUI 5.5*
