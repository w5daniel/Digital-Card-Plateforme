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

## ✅ Session 4 — Email verification + SMTP Gmail (Bugs 1 + 2) — COMPLET

**Fichiers modifiés : 5 | Nouveaux fichiers : 3 | Config : `.env`**

### Bug 2 — Mot de passe oublié ✅

La logique backend était correcte. Seule la config SMTP manquait.

**`backend/.env`** — remplacement du bloc MAIL_* :
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=<adresse-gmail>
MAIL_PASSWORD=<app-password-16-chars>   ← App Password Google (pas le mdp Gmail)
MAIL_FROM_ADDRESS=<adresse-gmail>
MAIL_FROM_NAME="Digital Card Platform"
```
> App Password : myaccount.google.com/apppasswords (nécessite 2FA activé sur le compte Gmail)

---

### Bug 1 — Vérification email à l'inscription ✅

**Stratégie de signature du lien :** HMAC personnalisé (pas `URL::temporarySignedRoute` qui lierait la signature au domaine backend) :
```
signature = hmac_sha256("{id}|{hash}|{expires}", APP_KEY)
hash       = sha1($user->email)
expires    = Unix timestamp + 60 minutes
```
Le lien pointe vers le **frontend** : `{FRONTEND_URL}/verify-email?id=...&hash=...&expires=...&signature=...`

**Backend :**

1. ✅ **`backend/app/Models/User.php`** :
   - Décommenté `use Illuminate\Contracts\Auth\MustVerifyEmail;` + ajouté dans `implements`
   - Override `sendEmailVerificationNotification()` → dispatche `VerifyEmailNotification`

2. ✅ **`backend/app/Notifications/VerifyEmailNotification.php`** (nouveau) :
   - Canal `mail` uniquement
   - Construit l'URL signée HMAC pointant vers `{FRONTEND_URL}/verify-email`
   - Email en français : "Bienvenue sur Digital Card Platform ! Confirmez votre adresse email."
   - Lien expire dans 60 minutes

3. ✅ **`backend/app/Http/Controllers/VerifyEmailController.php`** (nouveau) :
   - `verify($id, $hash)` : vérifie `expires` (410 si expiré), `hash` (sha1 email), `signature` HMAC → `markEmailAsVerified()` → 200
   - `resend($email)` : endpoint **sans auth** (rate limit `throttle:3,1`), envoie la notification si compte non-vérifié. Réponse vague pour éviter l'énumération d'emails.

4. ✅ **`backend/routes/api.php`** — nouvelles routes publiques :
   ```php
   Route::get('/email/verify/{id}/{hash}', [VerifyEmailController::class, 'verify']);
   Route::post('/email/resend', [VerifyEmailController::class, 'resend'])->middleware('throttle:3,1');
   ```

5. ✅ **`backend/app/Http/Controllers/AuthController.php`** :
   - `register()` : retiré `Auth::login()`, ajouté `sendEmailVerificationNotification()`, retourne `['emailPendingVerification' => true, 'email' => ...]`
   - `login()` : ajouté check `hasVerifiedEmail()` — si non-vérifié, logout + retourne 403 avec `emailNotVerified: true` et l'email

**Frontend :**

6. ✅ **`frontend/src/views/VerifyEmailView.vue`** (nouveau) :
   - 5 états : `loading` / `success` / `already` / `expired` / `error`
   - `onMounted` appelle `GET /api/email/verify/{id}/{hash}?expires=...&signature=...`
   - HTTP 410 → état `expired` ; autres erreurs → `error` ; message "déjà vérifié" → `already`
   - Composant inline `ResendBlock` (defineComponent + render function) : input email + bouton renvoyer
   - Styled identique à `AuthView.vue` (fond animé, couleurs flame)

7. ✅ **`frontend/src/router/index.js`** — route ajoutée :
   ```js
   { path: '/verify-email', name: 'verify-email', component: () => import('../views/VerifyEmailView.vue'), meta: { hideLayout: true } }
   ```

8. ✅ **`frontend/src/views/AuthView.vue`** :
   - Après inscription : si `result.emailPendingVerification` → affiche écran "Vérifiez votre email" (`showVerifyPending = true`)
   - Après tentative de login sur compte non-vérifié : si `result.emailNotVerified` → même écran
   - Refs ajoutées : `showVerifyPending`, `pendingEmail`, `resendLoading`, `handleResendVerification()`
   - Reset de `showVerifyPending` lors du switch d'onglet login ↔ register

9. ✅ **`frontend/src/stores/authStore.js`** :
   - `register()` : retourne `{ emailPendingVerification: true, email }` sans setter `user.value`
   - `login()` : si 403 + `emailNotVerified`, retourne `{ emailNotVerified: true, email }` sans throw
   - `resendVerificationEmail(email)` : POST `/api/email/resend`, toast succès ou erreur

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
