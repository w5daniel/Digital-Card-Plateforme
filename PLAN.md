# Plan — Migration Full-Stack (Vue 3 + Laravel + MySQL)
## État au 2026-04-28

---

## ✅ Phases terminées

### Phase 1 — Monorepo
Structure `frontend/` + `backend/` en place, `.gitignore` mis à jour.

### Phase 2 — Scaffold Laravel
- Laravel + Sanctum + spatie/laravel-sluggable installés dans `backend/`
- `backend/.env` configuré (DB, CORS, Sanctum, mail)
- `php artisan storage:link` exécuté

### Phase 3 — Base de données MySQL
Migrations exécutées :
- `users` — colonnes ajoutées : `role`, `is_banned`, `is_premium`, `premium_expires_at`, `avatar_url`, `title`, `bio`
- `cards` — uuid, `user_id`, `title`, `elements` (json), `backgrounds` (json), `is_public`, `share_slug`
- `templates` — uuid, `user_id`, `name`, `elements`, `backgrounds`, `is_gallery`, `is_public`, `category`, `slug`
- `brand_kits` — `user_id` (unique), `colors`, `fonts`, `logo_url`
- `custom_fonts` — `user_id`, `name`, `url`

### Phase 4.1 — Auth ✅ COMPLET
**Backend**
- `AuthController` — register, login, logout, me, updateProfile, updateAvatar, deleteAvatar, changePassword, forgotPassword, resetPassword
- Form Requests : `RegisterRequest`, `LoginRequest`, `UpdateProfileRequest`, `ChangePasswordRequest`
- `User` model — `$fillable`, `$hidden`, `$casts` à jour
- Routes `/api/auth/*` dans `backend/routes/api.php`

**Frontend**
- `frontend/src/api/axios.js` — `withCredentials: true`, `withXSRFToken: true`
- `frontend/src/stores/authStore.js` — 100% migré localStorage → API Sanctum
- `frontend/src/views/AuthView.vue` — formulaire reset-password + redirection post-login selon rôle
- `frontend/src/router/index.js` — guard `async` + `await restoreSession()` au boot

**Bugs corrigés**
- CORS port mismatch → pattern regex `#^http://localhost(:\d+)?$#` dans `backend/config/cors.php`
- CSRF 419 → `withXSRFToken: true` dans axios + `SESSION_DOMAIN=localhost` dans `.env`
- Admin redirigé vers `/dashboard` → guard `async` + redirection corrigée dans `AuthView.vue`

**Config `.env` actuelle**
```
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:5174
SESSION_DOMAIN=localhost
MAIL_MAILER=log
```

**Accès admin** : `UPDATE users SET role='admin' WHERE email='...'` via phpMyAdmin ou tinker.

---

### Phase 4.2 — Cards ✅ COMPLET
**Backend**
- Migration : colonnes `is_public`, `views`, `downloads`, `qr_scans`, `shares`, `meta` ajoutées à `cards`
- `Card.php` model — `HasUuids`, casts json/boolean/integer, relation `belongsTo(User)`
- `User.php` — relation `hasMany(Card)` ajoutée
- `CardController.php` — index, store, show, update, destroy, publicShow, incrementStat
- `StoreCardRequest`, `UpdateCardRequest` — validation FR, pas de `is_public`
- Routes : `apiResource('cards')` + `/cards/{card}/stats` + `/share/{id}` (public)

**Frontend**
- `frontend/src/api/cards.js` — module axios dédié
- `frontend/src/stores/cards.js` — 100% migré localStorage → API Sanctum
  - `_normalizeCard()` : mapping `title→name`, `meta→data`, `qr_scans→qrScans`
  - `getPublicCard()` devient async
  - Stats counters : mise à jour optimiste + fire-and-forget API
  - `toggleCardVisibility` → no-op (cartes toujours privées)
  - Fonctions admin restent en localStorage (⚠️ Phase 4.5)
- `ShareView.vue` — `onMounted` async + `await getPublicCard()`
- `DashboardView.vue` — `reader.onload` async pour `importCardsFromJSON`

## 🔲 Phases suivantes

**Shape carte attendu par le frontend :**
```json
{
  "id": "uuid",
  "user_id": 1,
  "title": "Ma carte",
  "elements": { "recto": [...], "verso": [...] },
  "backgrounds": { "recto": {...}, "verso": {...} },
  "is_public": false,
  "share_slug": null,
  "created_at": "...",
  "updated_at": "..."
}
```

### Phase 4.3 — Templates + Galerie
- `TemplateController` CRUD + `GalleryController` (routes publiques `/api/gallery`)
- Migrer `frontend/src/stores/userTemplatesStore.js`

### Phase 4.4 — Brand Kit
- `BrandKitController` (get/update + upload logo)
- Migrer `frontend/src/stores/brandKit.js`

### Phase 4.5 — Admin
- `Admin/UserController`, `Admin/CardController`, `Admin/TemplateController`
- Middleware `EnsureAdmin`
- Migrer `frontend/src/stores/adminStore.js`

### Phase 4.6 — Éditeur
- Brancher `saveCard()` dans `frontend/src/stores/useEditorStore.js` sur l'API cards

---

## Commandes de démarrage
```bash
cd backend && php artisan serve    # http://localhost:8000
cd frontend && npm run dev         # http://localhost:5173
```

## Routes API complètes (référence)
```
Auth
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/forgot-password
  POST   /api/auth/reset-password
  POST   /api/auth/logout           (auth:sanctum)
  GET    /api/auth/me               (auth:sanctum)
  PUT    /api/auth/profile          (auth:sanctum)
  POST   /api/auth/avatar           (auth:sanctum)
  DELETE /api/auth/avatar           (auth:sanctum)
  PUT    /api/auth/password         (auth:sanctum)

Cards
  GET/POST       /api/cards         (auth:sanctum)
  GET/PUT/DELETE /api/cards/{id}    (auth:sanctum)

Templates
  GET/POST       /api/templates     (auth:sanctum)
  PUT/DELETE     /api/templates/{id}(auth:sanctum)

Galerie publique
  GET  /api/gallery
  GET  /api/gallery/{slug}

Carte partagée
  GET  /api/share/{slug}

Brand Kit
  GET/PUT        /api/brand-kit     (auth:sanctum)
  POST/DELETE    /api/brand-kit/logo(auth:sanctum)

Admin
  GET/PUT/DELETE /api/admin/users/{id}    (auth:sanctum + admin)
  GET/DELETE     /api/admin/cards/{id}    (auth:sanctum + admin)
  GET/DELETE     /api/admin/templates/{id}(auth:sanctum + admin)
```

## Fichiers critiques
| Fichier | Rôle |
|---------|------|
| `backend/routes/api.php` | Toutes les routes API |
| `backend/app/Http/Controllers/AuthController.php` | Auth complet |
| `backend/config/cors.php` | CORS (pattern localhost) |
| `backend/.env` | Config DB + Sanctum + Mail |
| `frontend/src/api/axios.js` | Instance axios Sanctum |
| `frontend/src/stores/authStore.js` | Auth store (API) |
| `frontend/src/router/index.js` | Guard async |
