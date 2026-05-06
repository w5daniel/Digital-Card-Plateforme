# Phase 4.5 — Nettoyage dead code + templates sur API

## Décisions prises

- Tous les templates actuels (14-15 mockData + 10 localStorage) sont des **tests** → tout est supprimé
- **Ardoise vide** : la galerie part à zéro, les vrais templates seront recréés via le panel admin
- **Ne pas toucher** : "Édition libre / Partir d'une toile vierge / Commencer" dans `GalleryView.vue` — éléments UI hardcodés, pas des templates de données
- Le backend `GET /api/gallery` existe déjà (public, sans auth) → rien à créer côté backend

---

## État des lieux

### Ce qui fonctionne via l'API ✅

Toutes les vues admin importent **uniquement `useAdminStore`** :

| Action | Endpoint |
|---|---|
| Users : lister, ban, premium, supprimer | `GET/PATCH/DELETE /api/admin/users` |
| Cartes : lister, supprimer | `GET/DELETE /api/admin/cards` |
| Templates : lister, créer, modifier, toggle premium, supprimer | `GET/POST/PATCH/DELETE /api/admin/templates` |
| Settings | `GET/PUT /api/admin/settings` |

### Code mort supprimé ❌ → ✅

#### `frontend/src/stores/authStore.js`
- `ALL_USERS_LS_KEY`, `allUsers` ref, `_loadRegistry()`, `_saveRegistry()`
- `getAllUsersWithStats`, `adminBanUser`, `adminUnbanUser`, `adminTogglePremium`, `adminDeleteUser`

#### `frontend/src/stores/cards.js`
- Constantes : `LS_PREFIX`, `ADMIN_OVERRIDES_LS_KEY`, `ADMIN_REMOVED_LS_KEY`, `ADMIN_CUSTOM_TEMPLATES_KEY`
- IIFEs : `_applyTemplateOverrides()`, `_loadAdminCustomTemplates()`
- Fonctions : `getAllCardsAdmin`, `adminDeleteCard`, `toggleTemplatePremium` (slug/LS), `syncTemplatePremium`, `removeTemplate`, `_saveCustomTemplates`
- Import `CARD_TEMPLATES` mockData → remplacé par chargement API

#### `frontend/src/views/UserProfileView.vue`
- 2 × `localStorage.setItem('user', ...)` dans `onCancelSubConfirmed` et `clearBillingData`

### Clés localStorage qui disparaissent

| Clé | Sort |
|---|---|
| `digitalcard_adminCustomTemplates` | Plus lue → 10 templates test ignorés |
| `digitalcard_adminTemplateOverrides` | Plus lue ni écrite |
| `digitalcard_adminRemovedTemplates` | Plus lue ni écrite |
| `digitalcard_allUsers` | Plus lue ni écrite |
| `digitalcard_userCards_{email}` | N'était déjà plus écrite, plus lue non plus |

---

## Session 1 — Nettoyage dead code ✅

Suppression de tout le code orphelin. Aucune fonctionnalité active touchée.

---

## Session 2 — Brancher la galerie templates sur l'API ✅

Les templates créés/gérés par l'admin dans le panel sont désormais visibles dans :
- La galerie `/gallery`
- L'éditeur (Design → Modèles)

Les deux utilisent `cardsStore.templates` → un seul branchement suffit.

**Nouveau flux :**
- `frontend/src/api/gallery.js` → `GET /api/gallery`
- `cardsStore.loadGalleryTemplates()` → appelé au démarrage et à chaque login
- `GalleryController::index()` → `Template::where('is_gallery', true)->latest()->get()`

---

## Phase future (hors scope)

- Supprimer `mockData.js` entièrement si `CARD_TEMPLATES` était le seul export utilisé
- Seeder les templates officiels en DB pour les avoir en version contrôlée
