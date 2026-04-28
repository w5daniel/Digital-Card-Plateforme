# Architecture Backend — Digital Card Platform

> Document de référence pour la migration frontend-only → full-stack.
> Stack : Vue 3 (frontend) + Laravel (backend) + MySQL (base de données)

---

## Structure Monorepo

```
digital-card-platform-v3/
├── frontend/          ← code Vue 3 actuel (déplacé ici)
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/           ← Laravel (PHP)
│   ├── app/
│   ├── routes/api.php
│   ├── database/migrations/
│   └── .env
├── .gitignore
├── README.md
└── CLAUDE.md
```

---

## Stack

| Couche | Techno | Notes |
|--------|--------|-------|
| Frontend | Vue 3 + Pinia + Vite | inchangé |
| Backend | Laravel 11 (PHP 8.2+) | API REST |
| Auth | Laravel Sanctum | cookie-based, SPA-ready |
| Base de données | MySQL 8+ | colonnes JSON pour les éléments canvas |
| Fichiers | Laravel Storage | `php artisan storage:link` |
| HTTP client | Axios (déjà installé) | `withCredentials: true` |

---

## Configuration Backend (.env)

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=digital_card_platform
DB_USERNAME=root
DB_PASSWORD=your_password

# CORS Sanctum — obligatoire, à ne pas oublier
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

`config/cors.php` :
- `allowed_origins` → `[env('FRONTEND_URL')]`
- `supports_credentials` → `true`

---

## Schéma de base de données

### Table `users` (extension de la table Laravel par défaut)

| Colonne | Type | Notes |
|---------|------|-------|
| id | bigint PK | auto-incrémenté |
| name | string | |
| email | string unique | |
| password | string | bcrypt |
| role | string | `'user'` \| `'admin'` |
| is_banned | boolean | default false |
| is_premium | boolean | default false |
| premium_expires_at | timestamp nullable | null = pas d'expiry |
| avatar_url | string nullable | chemin `storage/avatars/` |
| email_verified_at | timestamp nullable | |
| remember_token | string nullable | |
| timestamps | | created_at, updated_at |

### Table `cards`

| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid PK | sécurité : pas devinable |
| user_id | bigint FK | → users |
| title | string | |
| elements | json | `{ recto: [...], verso: [...] }` |
| backgrounds | json | `{ recto: {...}, verso: {...} }` |
| is_public | boolean | default false |
| share_slug | string unique nullable | pour URL de partage |
| timestamps | | |

### Table `templates`

| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid PK | |
| user_id | bigint FK nullable | null = template officiel galerie |
| name | string | |
| elements | json | |
| backgrounds | json | |
| is_gallery | boolean | default false — template officiel |
| is_public | boolean | default false |
| category | string nullable | |
| slug | string unique nullable | |
| timestamps | | |

### Table `brand_kits`

| Colonne | Type | Notes |
|---------|------|-------|
| id | bigint PK | |
| user_id | bigint FK unique | 1 brand kit par user |
| colors | json nullable | tableau de couleurs hex |
| fonts | json nullable | polices sélectionnées |
| logo_url | string nullable | chemin `storage/logos/` |
| timestamps | | |

### Table `custom_fonts`

| Colonne | Type | Notes |
|---------|------|-------|
| id | bigint PK | |
| user_id | bigint FK | → users |
| name | string | nom de la police |
| url | string | chemin `storage/fonts/` |
| timestamps | | |

---

## Stockage des fichiers

**Règle absolue : ne jamais stocker de fichiers (images, polices) en base de données.**

Initialisation :
```bash
php artisan storage:link
# crée : public/storage → storage/app/public
```

Structure de stockage :
```
storage/app/public/
├── avatars/       ← photos de profil utilisateurs
├── logos/         ← logos brand kit
└── fonts/         ← polices custom uploadées
```

Les colonnes `*_url` en base stockent des chemins relatifs (`storage/avatars/abc.png`), pas des Data URLs.

---

## Routes API

```
Auth
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/logout        [auth:sanctum]
  GET    /api/auth/me            [auth:sanctum]

Cards
  GET    /api/cards              [auth:sanctum]
  POST   /api/cards              [auth:sanctum]
  GET    /api/cards/{id}         [auth:sanctum]
  PUT    /api/cards/{id}         [auth:sanctum]
  DELETE /api/cards/{id}         [auth:sanctum]

Templates utilisateur
  GET    /api/templates          [auth:sanctum]
  POST   /api/templates          [auth:sanctum]
  PUT    /api/templates/{id}     [auth:sanctum]
  DELETE /api/templates/{id}     [auth:sanctum]

Galerie publique
  GET    /api/gallery            [public]
  GET    /api/gallery/{slug}     [public]

Partage public
  GET    /api/share/{slug}       [public]

Brand Kit
  GET    /api/brand-kit          [auth:sanctum]
  PUT    /api/brand-kit          [auth:sanctum]

Upload fichiers
  POST   /api/upload/avatar      [auth:sanctum]
  POST   /api/upload/logo        [auth:sanctum]
  POST   /api/upload/font        [auth:sanctum]

Admin
  GET    /api/admin/users        [auth:sanctum + admin]
  PUT    /api/admin/users/{id}   [auth:sanctum + admin]
  DELETE /api/admin/users/{id}   [auth:sanctum + admin]
  GET    /api/admin/cards        [auth:sanctum + admin]
  DELETE /api/admin/cards/{id}   [auth:sanctum + admin]
  GET    /api/admin/templates    [auth:sanctum + admin]
  POST   /api/admin/templates    [auth:sanctum + admin]
  PUT    /api/admin/templates/{id} [auth:sanctum + admin]
  DELETE /api/admin/templates/{id} [auth:sanctum + admin]
```

---

## Ordre de migration des stores Pinia

> Chaque étape est un prérequis de la suivante.

| Ordre | Store | Endpoints ciblés | Prérequis |
|-------|-------|-----------------|-----------|
| 1 | `authStore.js` | `/api/auth/*` | — (commencer ici) |
| 2 | `cards.js` | `/api/cards` | auth |
| 3 | `userTemplatesStore.js` | `/api/templates` | auth |
| 4 | `brandKit.js` | `/api/brand-kit`, `/api/upload/*` | auth |
| 5 | `adminStore.js` | `/api/admin/*` | auth + role admin |
| 6 | `useEditorStore.js` | branche `saveCard()` sur l'API | cards |

---

## Configuration Axios (frontend)

Fichier à créer : `frontend/src/api/axios.js`

```js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  withCredentials: true,   // obligatoire pour Sanctum
  headers: { Accept: 'application/json' },
})

export default api
```

Variable d'env dans `frontend/.env.local` :
```env
VITE_API_URL=http://localhost:8000
```

---

## Commandes de démarrage

```bash
# Frontend
cd frontend && npm run dev       # http://localhost:5173

# Backend
cd backend && php artisan serve  # http://localhost:8000

# Base de données
php artisan migrate              # créer toutes les tables
php artisan db:seed              # données initiales (admin, templates galerie)
```

---

## Checklist de validation

- [ ] `cd frontend && npm run dev` → app Vue accessible et fonctionnelle
- [ ] `cd backend && php artisan serve` → API répond sur localhost:8000
- [ ] `php artisan migrate` → toutes les tables créées sans erreur
- [ ] POST `/api/auth/register` → utilisateur créé en base
- [ ] POST `/api/auth/login` + GET `/api/auth/me` → cookie Sanctum + données user retournées
- [ ] Requête depuis Vue (localhost:5173) vers Laravel (localhost:8000) → pas d'erreur CORS
- [ ] Upload d'un avatar → fichier dans `storage/app/public/avatars/`, URL retournée correcte
