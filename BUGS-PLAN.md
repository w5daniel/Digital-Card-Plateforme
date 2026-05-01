# Plan — Correction des bugs post-migration (par sessions)

## Contexte

Toutes les phases de migration localStorage → API Laravel sont terminées et vérifiées. Ce plan corrige les bugs découverts lors des tests + les problèmes de sécurité détectés lors de l'analyse globale. Chaque session est indépendante et livrable.

---

## ✅ Session 1 — Corrections rapides (Bug 4 + rate limiting) — COMPLET

**Durée estimée : ~20 min | Fichiers : 2**

### Bug 4 — Retirer les étoiles des cartes de la galerie

> Le bloc "4.9/5 · +2 400 professionnels" du hero est intentionnel (décoratif) → on le conserve.
> On supprime uniquement les étoiles sur les cartes de template (rating inexistant en DB).

**`frontend/src/views/GalleryView.vue`** — 3 suppressions :

1. **Overlay hover (lignes 253-260)** : supprimer le `<div>` contenant `<Star class="w-3 h-3...">` + `{{ template.rating || '5.0' }}`

2. **Chip bas-gauche (lignes 282-290)** : supprimer `<div class="absolute bottom-3 left-3 z-10 ...">` avec `Star` + rating

3. **Option de tri (ligne 133)** : supprimer `<option value="rating">Mieux notés</option>`

4. **Logique de tri (ligne ~700)** : supprimer le bloc `else if (sortBy.value === 'rating') { ... }` dans le computed `filteredTemplates`

### Supplément 2 — Rate limiting sur les routes d'auth

**`backend/routes/api.php`** : ajouter le middleware `throttle` sur les 3 routes sensibles :
```php
Route::post('/login',           [...])→middleware('throttle:10,1');  // 10 req/min
Route::post('/register',        [...])→middleware('throttle:5,1');   // 5 req/min
Route::post('/forgot-password', [...])→middleware('throttle:3,1');   // 3 req/min
```

---

## ✅ Session 2 — Sécurité & Maintenance mode (Bug 5 + Supplément 1) — COMPLET

**Durée estimée : ~45 min | Fichiers : 5**

### Bug 5 — Mode maintenance contournable via URL directe

**Cause :** La condition `if (!authStore.user && !from.name)` ne recharge la config que si l'user n'est pas encore en store. Si `loadPublicConfig()` échoue silencieusement (backend lent), `maintenanceMode` reste `false`. La protection est 100% client-side.

**Solution frontend — `frontend/src/router/index.js`** :
- Changer la condition en `if (!from.name)` (toujours recharger la config au 1er chargement, quelle que soit l'état d'auth)

**Solution backend — nouveau middleware `CheckMaintenanceMode`** :
- Fichier : `backend/app/Http/Middleware/CheckMaintenanceMode.php`
- Logique : si `SystemSetting::get('maintenanceMode', false)` ET `$user?->role !== 'admin'` → retourner 503
- **Appliquer sur** : groupe `auth:sanctum` (cartes, templates, brand-kit)
- **Exclure** : `/api/config`, `/api/auth/*`, `/api/share/*`, `/api/gallery/*`
- Enregistrer dans `bootstrap/app.php`

### Supplément 1 — Ban check cassé dans le router

**Cause :** `authStore.getAllUsersWithStats` (authStore.js:182) lit encore depuis localStorage (maintenant vide depuis la migration). Les utilisateurs bannis ne sont jamais détectés côté frontend.

**Solution backend — `backend/app/Http/Controllers/AuthController.php`** :
- Dans `me()` : ajouter la vérification `is_banned` avant de retourner l'user :
  ```php
  if ($request->user()->is_banned) {
      Auth::guard('web')->logout();
      return response()->json(['message' => 'Compte suspendu.'], 403);
  }
  ```

**Solution frontend :**
- **`frontend/src/stores/authStore.js`** : dans `restoreSession()`, intercepter les réponses 403 sur `/api/auth/me` → appeler `logout()` localement
- **`frontend/src/router/index.js`** : supprimer le bloc `getAllUsersWithStats` (lignes 172-180) — désormais géré côté serveur

---

## ✅ Session 3 — Notifications admin (Bug 3) — COMPLET

**Fichiers : 10 backend + 3 frontend + 1 migration**

### Bug 3 — L'utilisateur reçoit une notification quand l'admin supprime sa carte/modèle

**Implémenté :**

**Backend :**
1. ✅ Table `notifications` créée + migrée (`php artisan notifications:table && migrate`)
2. ✅ `CardDeletedByAdmin.php` — canal `database`, message "L'administrateur a supprimé votre carte X."
3. ✅ `TemplateDeletedByAdmin.php` — canal `database`, message "L'administrateur a supprimé votre modèle X."
4. ✅ `TemplateRemovedFromGalleryByAdmin.php` — déclenché quand `is_public` passe true→false via `update()`
5. ✅ `Admin/CardController::destroy()` — charge `user`, notifie avant suppression
6. ✅ `Admin/TemplateController::destroy()` — même pattern
7. ✅ `Admin/TemplateController::update()` — détecte `is_public: true→false`, notifie l'owner
8. ✅ `NotificationController` — `index()` / `markAllAsRead()` / `destroy()`
9. ✅ Routes `GET/PATCH/DELETE /api/notifications` dans `api.php` (sous `auth:sanctum`)

**Frontend :**
10. ✅ `frontend/src/api/notifications.js` — `getNotifications`, `markAllRead`, `deleteNotification`
11. ✅ `notificationStore.js` — `loadFromApi()` : injecte dans inbox + affiche toast via `_showToast()` (sans doublon inbox), `markAllAsReadAndSync()`, `removeFromInbox()`
12. ✅ `authStore.js` — `restoreSession()` ET `login()` appellent `loadFromApi()` ; doublon protégé par check `_apiId`

---

## Session 4 — Email verification + SMTP Gmail (Bugs 1 + 2)

**Durée estimée : ~2h | Fichiers : 8 + config .env**

> **Prérequis avant de coder :**
> 1. Activer la **double authentification** sur le compte Gmail utilisé
> 2. Aller sur **myaccount.google.com/apppasswords**
> 3. Créer un App Password "Digital Card Platform" → copier les 16 caractères
> 4. Avoir ces infos prêtes pour configurer le `.env`

### Bug 2 — Mot de passe oublié (résolu par la config SMTP seule)

La logique backend est **100% correcte**. Aucun code à changer. Seule la configuration SMTP manque.

### Bug 1 — Vérification email à l'inscription

**`backend/.env`** :
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=<adresse-gmail>
MAIL_PASSWORD=<app-password-16-chars>
MAIL_FROM_ADDRESS=<adresse-gmail>
MAIL_FROM_NAME="Digital Card Platform"
```

**Backend :**

1. **`backend/app/Models/User.php:5`** : décommenter `MustVerifyEmail` et l'ajouter dans `implements`

2. **`backend/app/Notifications/VerifyEmailNotification.php`** (nouveau) :
   - Surcharge `Illuminate\Auth\Notifications\VerifyEmail`
   - Personnalise le lien pour pointer vers le **frontend SPA** : `http://localhost:5173/verify-email?id={id}&hash={hash}&expires={expires}&signature={signature}`
   - Message en français : "Bienvenue sur Digital Card Platform ! Confirmez votre adresse email pour activer votre compte."

3. **`backend/app/Http/Controllers/VerifyEmailController.php`** (nouveau) :
   - `verify(Request $request, $id, $hash)` : valide `expires` + `signature` + `hash` → marque `email_verified_at` → 200
   - `resend(Request $request)` : renvoie l'email si `!$request->user()->hasVerifiedEmail()`

4. **`backend/routes/api.php`** : ajouter routes de vérification :
   ```php
   Route::get('/email/verify/{id}/{hash}', [VerifyEmailController::class, 'verify'])->name('verification.verify');
   Route::post('/email/resend', [VerifyEmailController::class, 'resend'])->middleware('auth:sanctum');
   ```

5. **`backend/app/Http/Controllers/AuthController.php`** — `register()` :
   - Ne plus connecter l'user immédiatement (`Auth::login()` retiré)
   - Retourner `['emailPendingVerification' => true, 'email' => $user->email]`

**Frontend :**

6. **`frontend/src/views/VerifyEmailView.vue`** (nouvelle vue) :
   - En `onMounted` : lire `id`, `hash`, `expires`, `signature` de `route.query` → POST `/api/email/verify/{id}/{hash}?expires=...&signature=...`
   - Succès → toast "Email confirmé ✅" + redirect `/login`
   - Erreur → message "Lien invalide ou expiré" + bouton "Renvoyer un lien"

7. **`frontend/src/router/index.js`** :
   - Ajouter route `/verify-email` → `VerifyEmailView` (meta: `hideLayout: true, guestOnly: false`)

8. **`frontend/src/views/AuthView.vue`** :
   - Après inscription réussie (si `emailPendingVerification: true`), afficher écran :
     "📧 Vérifiez votre email — Un lien de confirmation a été envoyé à **{email}**. Cliquez dessus pour activer votre compte."
     + bouton "Renvoyer l'email" + lien "Changer d'adresse"

9. **`frontend/src/stores/authStore.js`** :
   - Ajouter `resendVerificationEmail()` → `POST /api/email/resend`
   - Adapter `register()` pour gérer le flag `emailPendingVerification`

---

## Récapitulatif des fichiers par session

| Session | Fichiers modifiés | Nouveaux fichiers |
|---------|------------------|-------------------|
| S1 | `GalleryView.vue`, `api.php` | — |
| S2 | `AuthController.php`, `router/index.js`, `authStore.js`, `api.php` | `CheckMaintenanceMode.php` |
| S3 | `Admin/CardController.php`, `Admin/TemplateController.php`, `authStore.js`, `notificationStore.js`, `api.php` | `CardDeletedByAdmin.php`, `TemplateDeletedByAdmin.php`, `NotificationController.php`, `notifications.js` |
| S4 | `User.php`, `AuthController.php`, `authStore.js`, `AuthView.vue`, `router/index.js`, `.env`, `api.php` | `VerifyEmailNotification.php`, `VerifyEmailController.php`, `VerifyEmailView.vue` |

## Vérification par session

- **S1** : Galerie → aucune étoile sur les cartes. Login × 11 → 429 Too Many Requests.
- **S2** : Activer maintenance → taper `/dashboard` dans nouvelle tab → `/maintenance`. Appeler `/api/cards` sans être admin → 503. Admin banne user → user déconnecté au prochain `me`.
- **S3** : Admin supprime carte → user reload dashboard → notification dans inbox.
- **S4** : S'inscrire → email reçu dans Gmail → cliquer lien → `VerifyEmailView` → login. "Mot de passe oublié" → email reçu → reset → OK.
