# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # Run oxlint + ESLint with auto-fix (both linters)
npm run format     # Format with Prettier
```

No test suite exists yet.

## Stack

- **Framework:** Vue 3 (Composition API) + Pinia + Vue Router 5 + Vite 7
- **Canvas editor:** vue-konva (Konva.js wrapper) — used in `src/components/editor/EditorCanvas.vue`
- **Styling:** Tailwind CSS 3 + DaisyUI 5; custom color tokens defined in `tailwind.config.js` (`primary`, `secondary`, `accent`, `flame`, `onyx`, `powder`)
- **Icons:** Lucide Vue Next + Iconify
- **Exports:** jsPDF, html-to-image, QR Code Styling
- **Path alias:** `@` → `./src`
- **Code style:** No semicolons, single quotes, 100-char line width (`.prettierrc.json`); ESLint flat config + Oxlint

## Architecture

### Storage (no backend)

The entire app uses **localStorage only** — there is no backend. All data is persisted client-side. The planned backend migration is tracked in TODO comments throughout the stores.

Data isolation pattern: each user's data is keyed by email:
- `digitalcard_userCards_{email}` — user's cards
- `digitalcard_userTemplates_{email}` — user's custom templates
- `digitalcard_public_{cardId}` — public snapshot (cross-user readable, written on save if `isPublic=true`)
- `digitalcard_publicTemplate_{id}` — public template snapshot
- `digitalcard_adminTemplateOverrides` / `digitalcard_adminRemovedTemplates` — admin gallery overrides

### Stores

| Store | File | Responsibility |
|-------|------|----------------|
| `authStore` | `src/stores/authStore.js` | Auth, session, user registry, ban/premium management |
| `cardsStore` | `src/stores/cards.js` | CRUD for user cards + gallery templates; admin card moderation |
| `useEditorStore` | `src/stores/useEditorStore.js` | All canvas editor state (elements, history, selection, modes) |
| `userTemplatesStore` | `src/stores/userTemplatesStore.js` | User-created reusable templates; batch card creation |
| `adminStore` | `src/stores/adminStore.js` | Admin dashboard state, system settings |
| `brandKit` | `src/stores/brandKit.js` | Per-user brand colors, fonts, logo |
| `fontStore` | `src/stores/fontStore.js` | Google Fonts loading and management |
| `themeStore` | `src/stores/themeStore.js` | Dark/light mode |
| `notificationStore` | `src/stores/notificationStore.js` | Toast notifications |

### Editor (useEditorStore)

The editor is the most complex part of the codebase. Key concepts:

- **Sides:** Cards have `recto` and `verso` pages. `activePage` switches between them. `elements` is `{ recto: [], verso: [] }`.
- **Edit modes:** `editMode` is one of `'new' | 'edit-card' | 'edit-template' | 'edit-gallery-template'`. This controls save behavior.
- **History:** 50-item undo/redo stack using full JSON deep-clones of `{ elements, backgrounds }`. Call `saveHistory()` before committing mutations.
- **Selection:** `selectedIds` array; multi-select and group-aware. `singleSelected` computed returns the element or null.
- **Contact roles:** Text elements have a `role` property (`firstName`, `lastName`, `email`, `phone`, etc. or `custom_{fieldId}`). `contactData` computed aggregates these into a contact object.
- **Template application:** `applyRectoTemplate()` replaces only recto elements while preserving verso + contact fields.

### Router & Auth Guards

`src/router/index.js` uses a single `beforeEach` guard that:
1. Restores session from localStorage on first load
2. Enforces maintenance mode (admin-only access)
3. Checks gallery access control
4. Cross-checks user status against admin registry (detect bans)
5. Enforces `requiresAuth`, `requiresAdmin`, `guestOnly` route meta flags

Route meta flags: `requiresAuth`, `requiresAdmin`, `guestOnly`, `hideLayout`, `hideFooter`.

Admin routes are nested under `/admin` and checked via `route.matched.some(r => r.meta.requiresAdmin)`.

### Key Utilities

- `src/utils/cardExporter.js` — export cards to PDF/PNG/SVG
- `src/utils/templateLayouts.js` — preset layout builders (center, two-column, top-bar, etc.)
- `src/utils/cardElements.js` — element type definitions and rendering helpers
- `src/utils/gradientHelpers.js` — gradient string parsing/generation
- `src/data/` — static libraries for elements, Google Fonts list, icons, illustrations, stickers

### Layout System

`App.vue` conditionally renders `NavBar` and `FooterBar` based on `route.meta.hideLayout` / `route.meta.hideFooter`. The `/admin` subtree uses `AdminLayout.vue` (sidebar navigation). Routes use lazy imports (`() => import(...)`) except `HomeView` (eager).

### Modèle vs Carte — distinction fondamentale

This is the core business concept. The two types must never be confused:

| | Modèle (Template) | Carte (Card) |
|---|---|---|
| **What** | Reusable visual mold | Final personalized document |
| **Storage** | `userTemplatesStore` / gallery | `cardsStore` |
| **Has contact data** | No — placeholder roles only | Yes — real person data |
| **editMode** | `'edit-template'` / `'edit-gallery-template'` | `'new'` / `'edit-card'` |
| **Key component** | `SaveAsModal.vue` (save as template) | `CreateCardFromTemplateModal.vue` |

**Batch card creation flow:** A template is used in `BatchCreateModal.vue` to generate multiple cards at once. Contact data (from Excel/CSV or manual input) is injected into text elements by matching `el.role` via `userTemplatesStore.createCardsFromTemplate()`.

**Text element roles:** `firstName`, `lastName`, `title`, `company`, `phone`, `email`, `website`, `address`, or `custom_{fieldId}` for custom fields. These roles are what connect the Info panel, batch import, and QR vCard generation.

### Editor sidebar architecture

`EditorLeftSidebar.vue` routes between 9 sub-components in `src/components/editor/sidebar/`:

| File | Tab | Notes |
|------|-----|-------|
| `EditorSidebarInfo.vue` | Infos | Contact field editing; syncs to canvas elements |
| `EditorSidebarDesign.vue` | Design | Background, templates, color palette; contains ConfirmModals |
| `EditorSidebarElements.vue` | Éléments | Shape/icon/illustration library; receives `elementsView`/`elementsQuery` as v-model props |
| `EditorSidebarIcons.vue` | Icônes | Iconify icon browser |
| `EditorSidebarText.vue` | Texte | Font picker, combos, custom font upload |
| `EditorSidebarLayers.vue` | Calques | Layer list with drag-reorder, visibility, lock |
| `EditorSidebarImport.vue` | Importer | Image file drop zone |
| `EditorSidebarQR.vue` | QR Code | QR config UI; receives `qrConfig` reactive object as prop |
| `EditorSidebarTools.vue` | Outils | Display options, alignment, size/position |

The parent keeps `qrConfig` (reactive), its 3 watchers, `elementsView`/`elementsQuery`, and `insertQR()`. Sub-components access Pinia stores directly.

### Business Logic Notes

- **Free tier limits:** `MAX_FREE_CARDS = 3`, `MAX_FREE_TEMPLATES = 2` (enforced in stores, not route guards)
- **Premium check:** `isPremium` in authStore checks expiry date if set
- **Community gallery:** `cardsStore.getAllCommunityCards()` scans all `digitalcard_public_*` localStorage keys; includes `_isOwn` flag on each result
- **Batch card creation:** `userTemplatesStore.createCardsFromTemplate()` injects contact data into text elements by matching `el.role`
- **Admin gallery edits:** Navigate to `/editor?admin-edit={slug}` to edit an official gallery template
