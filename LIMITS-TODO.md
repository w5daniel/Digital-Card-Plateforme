- 🔴 Réalisé par Wottor Daniel — Document destiné aux futurs développeurs pour comprendre le comportement des limites cartes/modèles selon le plan, identifier les incohérences actuelles et appliquer les corrections nécessaires.

# Limites Cartes & Modèles — Comportement & Bugs à corriger

---

## 1. Limites actuelles par plan

| Ressource | Plan Gratuit | Plan Premium |
|-----------|-------------|--------------|
| Cartes | 3 | 50 |
| Modèles manuels | 2 | Illimité |

Ces valeurs sont définies à deux endroits :

**Frontend (constantes de fallback) :**
- `frontend/src/stores/cards.js` ligne 18 → `export const MAX_FREE_CARDS = 3`
- `frontend/src/stores/userTemplatesStore.js` ligne 10 → `export const MAX_FREE_TEMPLATES = 2`

**Backend (defaults du panel admin) :**
- `backend/app/Models/SystemSetting.php` lignes 13–21 → `'maxCardsPerUser' => 3`, `'maxCardsPerPremium' => 50`

---

## 2. Comment le panel admin est censé fonctionner

L'interface admin (`/admin/settings`) permet de modifier les limites de cartes dynamiquement :
- **Cartes max — Plan gratuit** → `maxCardsPerUser`
- **Cartes max — Plan Premium** → `maxCardsPerPremium`

### Chaîne prévue côté frontend

1. Admin sauvegarde → `PUT /api/admin/settings` → backend persiste en DB via `SystemSetting`
2. `GET /api/config` retourne les limites publiquement (route accessible sans auth)
3. `loadPublicConfig()` dans `adminStore.js` est appelé au démarrage du router pour **tous les utilisateurs**
4. `canCreateCard` dans `cards.js` lit `adminStore.settings?.maxCardsPerUser ?? MAX_FREE_CARDS`

**Ce qui fonctionne :**
- La sauvegarde admin → DB fonctionne correctement
- `GET /api/config` retourne bien les valeurs mises à jour
- `loadPublicConfig()` peuple bien `adminStore.settings` au chargement de la page
- Le bouton "Créer une carte" dans le dashboard se désactive correctement selon la limite admin

---

## 3. Le bug principal — Limite backend hardcodée

### Symptôme

L'admin change la limite gratuite à 5 dans le panel. Un utilisateur free tente de créer une 4e carte → bloqué malgré le changement.

### Cause

Le `CardController.php` backend **ignore totalement `SystemSetting`** et utilise une limite hardcodée :

**Fichier :** `backend/app/Http/Controllers/CardController.php` (~ligne 113)

```php
private function cardLimit(User $user): ?int
{
    if ($user->role === 'admin') return null;

    return $user->is_premium ? 50 : 3;  // ← hardcodé, ne lit pas SystemSetting
}
```

Résultat : deux limites indépendantes qui ne se parlent pas.

| Couche | Source de la limite | Valeur lue |
|--------|---------------------|------------|
| Frontend (`canCreateCard`) | `adminStore.settings?.maxCardsPerUser` | ✅ dynamique (lit le setting admin) |
| Backend (`CardController`) | Hardcodé `3` / `50` | ❌ statique (ignore le setting admin) |

Concrètement : le frontend peut laisser passer la création (bouton actif), mais le backend renvoie un **403** avec le message *"Limite atteinte (3 cartes)..."* dès la 4e carte, annulant l'effet du changement admin.

### Correction suggérée

Dans `backend/app/Http/Controllers/CardController.php`, remplacer la méthode `cardLimit()` pour qu'elle lise `SystemSetting` :

```php
private function cardLimit(User $user): ?int
{
    if ($user->role === 'admin') return null;

    $settings = \App\Models\SystemSetting::instance()->mergedData();

    return $user->is_premium
        ? ($settings['maxCardsPerPremium'] ?? 50)
        : ($settings['maxCardsPerUser']    ?? 3);
}
```

Avec cette correction, toute modification faite dans le panel admin est immédiatement respectée côté backend.

---

## 4. Comportement des modèles (templates)

### Distinction modèle manuel vs modèle auto

Lorsqu'un utilisateur sauvegarde un design comme **carte** depuis l'éditeur, le backend crée automatiquement un modèle avec `is_auto = true` en coulisse (historique de conception).

- **Modèle manuel** (`is_auto = false`) : créé explicitement par l'utilisateur via "Nouveau modèle"
- **Modèle auto** (`is_auto = true`) : créé implicitement à chaque sauvegarde de carte

### Limite des modèles côté frontend

`canCreateTemplate` dans `userTemplatesStore.js` ne compte que les modèles **manuels** :

```js
const manualCount = computed(() => visibleTemplates.value.length)  // is_auto = false uniquement

const canCreateTemplate = computed(() => {
  if (authStore.isPremium || authStore.isAdmin) return true
  return manualCount.value < MAX_FREE_TEMPLATES  // MAX_FREE_TEMPLATES = 2
})
```

### Le problème de cohérence frontend / backend

Le backend compte **tous** les modèles (auto + manuels) dans la limite de 2. Le frontend ne compte que les manuels.

**Scénario de confusion :**
1. Utilisateur sauvegarde 1 carte → 1 modèle auto créé → backend total = 1
2. Utilisateur crée 1 modèle manuel → backend total = 2 → limite atteinte côté backend
3. Le frontend dit "vous pouvez encore créer 1 modèle" (manualCount = 1 < 2)
4. L'utilisateur tente de créer un 2e modèle manuel → backend renvoie **403**
5. L'utilisateur voit : *"request failed with status code 403"* — incompréhensible

**Note :** Le message d'erreur 403 dans `userTemplatesStore.js` a été amélioré pour afficher un message lisible en français. Mais le problème de fond (incohérence de comptage) reste à résoudre.

### Correction suggérée

Deux options possibles :

**Option A — Côté backend** (recommandée) : ne pas compter les modèles `is_auto = true` dans la limite.

Dans le contrôleur de création de templates, remplacer le comptage global par :
```php
$manualCount = $user->templates()->where('is_auto', false)->count();
if ($manualCount >= $limit) {
    // bloquer
}
```

**Option B — Côté frontend** : aligner `canCreateTemplate` pour compter aussi les modèles auto, afin que le bouton se désactive avant d'atteindre le backend. Attention : un utilisateur avec 3 cartes (= 3 modèles auto) ne pourrait alors créer aucun modèle manuel.

**Option A est préférable** car elle préserve l'intention : les modèles auto ne doivent pas empiéter sur le quota de modèles manuels de l'utilisateur.

---

## 5. Résumé des fichiers clés

| Fichier | Rôle |
|---------|------|
| `backend/app/Http/Controllers/CardController.php` | Enforcement limite cartes côté backend — **bug : hardcodé** |
| `backend/app/Models/SystemSetting.php` | Modèle de config système — source de vérité des limites dynamiques |
| `backend/routes/api.php` | Route `GET /api/config` — expose les limites publiquement |
| `backend/app/Http/Controllers/Admin/SettingsController.php` | Sauvegarde les settings admin en DB |
| `frontend/src/stores/adminStore.js` | `loadPublicConfig()` — charge les limites au démarrage |
| `frontend/src/stores/cards.js` | `canCreateCard` — vérification frontend avant création carte |
| `frontend/src/stores/userTemplatesStore.js` | `canCreateTemplate` — vérification frontend avant création modèle |
