# POST-BACKEND TODO — ECODEV-CARD Pro

> Tâches à effectuer **après** l'implémentation et la connexion du backend Laravel.
> Ces points ont été délibérément mis de côté avant le backend pour éviter des refactorisations inutiles.

---

## 1. Migration CSS hybride → DaisyUI complet

**Contexte :** Le dark mode est actuellement géré manuellement via `themeStore.darkMode ? 'bg-slate-800' : 'bg-white'` dans chaque composant. DaisyUI est installé mais utilisé partiellement.

**Ce qui reste à faire :**

- Remplacer tous les ternaires `themeStore.darkMode ? ... : ...` par les classes DaisyUI sémantiques (`bg-base-100`, `bg-base-200`, `text-base-content`, etc.)
- Activer le dark mode DaisyUI via `data-theme` au lieu du store manuel
- Simplifier `themeStore.js` (plus besoin de gérer les classes manuellement)

**Fichiers concernés :** Pratiquement tous les composants et vues (~30-40 fichiers)

**Risque si fait avant backend :** Régressions visuelles massives, blocant pour le reste du travail.

---

## 2. Remplacer les mock data par les vrais appels API

**Contexte :** Tous les stores utilisent des données locales (localStorage + seeds).

**Stores à migrer :**

- `src/stores/authStore.js` — `login()`, `register()`, `logout()`, `restoreSession()`
- `src/stores/cards.js` — toutes les opérations CRUD cartes + templates
- `src/stores/adminStore.js` — users, cards, templates, settings (tous les endpoints admin)
- `src/stores/notificationStore.js` — optionnel, selon si le backend gère les notifs

**Pattern à appliquer :**

```js
// Remplacer le mock par :
const response = await apiService.post('/auth/login', { email, password })
// + gestion des erreurs réseau
```

---

## 3. Créer le service API centralisé

**Fichier à créer :** `src/services/api.js`

**Contenu minimal :**

```js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const request = async (method, endpoint, data = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export const authAPI = { ... }
export const cardsAPI = { ... }
export const adminAPI = { ... }
```

**Variable d'environnement à créer :** `VITE_API_URL` dans `.env`

---

## 4. Gestion d'erreurs réseau dans les stores

**Contexte :** Les fonctions async actuelles n'ont pas de try/catch adapté aux erreurs réseau (401, 403, 422, 500).

**À implémenter :**

- Intercepteur global pour les 401 (token expiré → redirect login)
- Messages d'erreur via `notificationStore` (toast error)
- Gestion du 422 (validation Laravel) → afficher les erreurs de champ dans les formulaires
- Gestion du 403 (accès refusé) → redirect ou message

---

## 5. Supprimer les seeds localStorage

**Contexte :** `adminStore.js` utilise un système de seeding localStorage (`SEED_USERS`, `SEED_CARDS`, `SEED_TEMPLATES`, `SEED_SETTINGS`). Une fois le backend connecté, ce système devient obsolète.

**Ce qui reste à faire :**

- Supprimer les constantes `SEED_*`, les fonctions `loadFromLS()`, `saveToLS()`
- Retirer les clés `admin_users`, `admin_cards`, `admin_templates`, `admin_settings` du localStorage

---

## 6. Authentification : token storage

**Contexte :** Le token est stocké dans `localStorage` (vulnérable XSS en production).

**Options à évaluer avec le backend :**

- Basculer vers cookies `httpOnly` si Laravel Sanctum est configuré en mode SPA (cookie-based)
- Ou conserver localStorage si API stateless tokens (mobile-friendly)
- Ajouter refresh token si nécessaire

---

## 7. Variables d'environnement

**Fichiers à créer/compléter :**

```
.env                    → VITE_API_URL=http://localhost:8000/api
.env.production         → VITE_API_URL=https://api.ecodev.dev/api
```

**Ne pas oublier :** Ajouter `.env.production` dans `.gitignore` si credentials sensibles.

---

## 8. Images placeholder

**Contexte :** Certains templates/cards utilisent encore `via.placeholder.com`.

**À remplacer par :**

- Images réelles dans `/public/templates/`
- Ou URLs CDN définitives
- Ou images générées côté backend

---

## 9. Tests

**Contexte :** Aucun test (1/5 dans le rapport). Normal pour MVP, critique avant production avec paiements.

**Priorités à couvrir :**

- Tests du flow d'authentification (login, register, guard routes)
- Tests du flow de paiement Mobile Money (critique)
- Tests des guards admin (accès non-autorisé)
- Tests des exports PDF/PNG/vCard

---

## 10. Documentation endpoints API

**À créer :** `docs/API-ENDPOINTS.md`

Documenter tous les endpoints attendus avec :

- Méthode + URL
- Corps de la requête (JSON)
- Réponse attendue
- Codes d'erreur possibles

---

## Récapitulatif priorités post-backend

| Priorité | Tâche                                       |
| -------- | ------------------------------------------- |
| 1        | Créer `src/services/api.js`                 |
| 1        | Migrer `authStore.js` → vrais appels API    |
| 1        | Migrer `cards.js` → vrais appels API        |
| 1        | Migrer `adminStore.js` → vrais appels API   |
| 2        | Gestion erreurs réseau (401, 403, 422, 500) |
| 2        | Supprimer seeds localStorage                |
| 2        | Variables d'environnement `.env`            |
| 3        | Migration CSS DaisyUI complet               |
| 3        | Token storage (httpOnly cookies ?)          |
| 3        | Remplacer images placeholder                |
| 4        | Tests (auth, paiements, guards)             |
| 4        | Documentation API                           |
