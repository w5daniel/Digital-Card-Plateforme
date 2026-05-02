- 🔴 Réalisé par Wottor Daniel — Feuille de route destinée à fournir aux futur développeurs une vision claire de l’état réel de la partie Pricing du projet, afin de faciliter la compréhension des enjeux, d’identifier les priorités et de définir efficacement les points de départ.

# Facturation & Historique d'abonnement — À implémenter

## Contexte

L'onglet **Facturation** du profil utilisateur (`/profile` → tab "Facturation") est prévu pour afficher :
- Un résumé de l'abonnement actif (plan, montant, date de souscription, date de renouvellement)
- Un tableau des factures passées téléchargeables

L'interface est **entièrement codée côté frontend**, mais elle reste vide pour tous les utilisateurs car le backend ne crée aucun historique de paiement au moment du passage en Premium.

---

## Problème détaillé

### 1. Le flow actuel est une simulation

**Fichier :** `frontend/src/views/PricingView.vue` (~ligne 608)

Le formulaire de paiement (Mobile Money / carte) collecte les informations de l'utilisateur mais ne les envoie jamais au backend. Un commentaire dans le code indique explicitement : *"Simulation d'appel API"*. L'appel se résume à :

```js
await authStore.upgradeToPremium()
// → POST /api/auth/upgrade-premium  (sans corps, sans données de paiement)
```

### 2. Le backend ne crée aucun enregistrement de paiement

**Fichier :** `backend/app/Http/Controllers/AuthController.php` (méthode `upgradePremium`, ~ligne 138)

```php
public function upgradePremium(Request $request): JsonResponse
{
    $user = $request->user();
    $user->update([
        'is_premium'         => true,
        'premium_expires_at' => now()->addYear(),
    ]);

    return response()->json(['user' => $user->fresh()]);
}
```

Il fait uniquement :
- `is_premium = true`
- `premium_expires_at = now() + 1 an`

Aucune facture, aucun historique, aucune référence de paiement n'est créé.

### 3. Pas de table de paiements en base de données

Il n'existe pas de table ni de colonne pour stocker l'historique des souscriptions.

Les seuls champs premium sur le modèle `User` sont :
- `is_premium` (boolean)
- `premium_expires_at` (datetime)

Migration de référence : `backend/database/migrations/2026_04_28_120048_add_fields_to_users_table.php`

### 4. Le frontend attend une structure qui n'existe jamais

**Fichier :** `frontend/src/views/UserProfileView.vue`

Le résumé d'abonnement s'affiche uniquement si `authStore.user?.subscriptionHistory?.length` est truthy (ligne ~774). Le tableau de factures est généré depuis cette même propriété (ligne ~1270).

Structure attendue par le frontend :
```js
authStore.user.subscriptionHistory = [
  {
    reference: 'INV-2026-001',   // identifiant unique de la facture
    plan: 'Premium',             // nom du plan
    total: 5888,                 // montant en FCFA (entier)
    date: '2026-05-02T10:00:00', // date ISO de la transaction
  },
  // ...entrées supplémentaires si renouvellements
]
```

---

## Ce qu'il faut implémenter

### Backend

1. **Nouvelle migration** — créer une table `subscription_histories` (ou ajouter une colonne JSON `subscription_history` sur `users`) :
   - `id`, `user_id`, `plan` (string), `amount` (integer, en FCFA), `payment_method` (string), `reference` (string unique), `created_at`

2. **Mettre à jour `upgradePremium()`** dans `AuthController.php` :
   - Recevoir les détails du paiement depuis le frontend (méthode, numéro, montant)
   - Créer un enregistrement dans `subscription_histories`
   - Générer une référence de facture unique (ex. `INV-{YEAR}-{ID}`)
   - Retourner l'historique complet dans la réponse avec le user

3. **Nouveau endpoint (optionnel)** `GET /api/auth/subscription-history` pour récupérer l'historique à la demande

4. **Intégration paiement réel (optionnel selon roadmap)** — connecter à un provider (Orange Money, Wave, Stripe, etc.) avant de confirmer le premium

### Frontend

1. **`PricingView.vue`** — envoyer les données de paiement au backend dans le body de `upgradeToPremium()` (méthode choisie, numéro, nom)

2. **`authStore.upgradeToPremium()`** dans `authStore.js` — passer les paramètres de paiement au `POST /api/auth/upgrade-premium`

3. **`UserProfileView.vue`** — aucun changement nécessaire, l'interface est prête et fonctionnera dès que `authStore.user.subscriptionHistory` sera peuplé

---

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `frontend/src/views/PricingView.vue` | Page de souscription — formulaire de paiement (simulation) |
| `frontend/src/stores/authStore.js` | Action `upgradeToPremium()` (~ligne 175) |
| `frontend/src/views/UserProfileView.vue` | Onglet Facturation (~ligne 715) + computed `invoices` (~ligne 1270) |
| `backend/app/Http/Controllers/AuthController.php` | Endpoint `upgradePremium()` (~ligne 138) |
| `backend/routes/api.php` | Route `POST /api/auth/upgrade-premium` (ligne 44) |
| `backend/app/Models/User.php` | Modèle User — champs premium existants |

