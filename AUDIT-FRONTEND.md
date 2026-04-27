# AUDIT FRONTEND COMPLET — Digital Card Platform v3

> Audit chirurgical pré-backend réalisé le 2026-04-26.
> Aucun correctif appliqué — ce document sert de référence pour les corrections à venir.

---

## 🔴 CRITIQUES (Production-breaking) — 9 problèmes

**C1. `src/stores/userTemplatesStore.js` ~ligne 420**
`adminRemoveCommunityTemplate()` définie APRÈS le `return { ... }` du store → jamais accessible via l'instance du store. Bug silencieux.

**C2. `src/stores/cards.js` ~lignes 758-765**
`watch(userCards, ...)` non nettoyé après logout → continue d'écrire en localStorage sans user actif. Fuite mémoire et écriture orpheline.

**C3. `src/stores/useEditorStore.js` ~lignes 128-131**
`historyIndex` non incrémenté quand MAX_HISTORY est dépassé (path `.shift()`) → index désynchronisé avec `history.length` → undo/redo cassé après 50 actions.

**C4. Duplication vues Auth**
`src/views/LoginView.vue` + `src/views/RegisterView.vue` + `src/views/AuthView.vue` → 3 implémentations du même formulaire avec des styles différents (DaisyUI vs classes custom). Supprimer LoginView et RegisterView, ne garder qu'AuthView.

**C5. `src/router/index.js` ~ligne 23**
Redirect `/register → { name: 'login', query: { mode: 'register' } }` inutilisée car AuthView ne lit pas ce query param au chargement.

**C6. `src/stores/notificationStore.js` ~lignes 20-22**
`setTimeout()` créé pour chaque toast, jamais annulé si l'user logout avant expiration → timeouts persistent en mémoire après logout.

**C7. `src/stores/cards.js` ~lignes 305-317**
`getAllCommunityCards()` itère sur TOUTES les clés localStorage à chaque appel (O(n)) → performance catastrophique au-delà de quelques centaines de clés.

**C8. `src/stores/adminStore.js` ~ligne 27-29**
`localStorage.setItem()` dans `saveToLS()` sans try/catch → `QuotaExceededError` non capturé = crash silencieux (mode privé ou quota dépassé).

**C9. `src/components/ToastNotification.vue`**
Pas de `role="status"`, `aria-live="polite"`, `aria-atomic="true"` → utilisateurs avec lecteurs d'écran jamais notifiés des toasts.

---

## 🟠 AMÉLIORATIONS IMPORTANTES — 12 problèmes

**A1. localStorage sans try/catch dans tous les stores**
Fichiers : `authStore.js:45`, `themeStore.js:10,38`, `brandKit.js:54,61,67,75`, `cards.js:98`.
Mode privé/incognito → `localStorage.getItem()` / `.setItem()` peuvent throw silencieusement.
Solution : créer `src/utils/storage.js` avec `safeGet(key, fallback)` et `safeSet(key, value)`.

**A2. Aucun composant n'utilise `defineProps()` avec types**
Zéro validation de props sur BusinessCard, ConfirmModal, ToastNotification, etc. → props manquantes silencieuses.

**A3. `src/router/index.js` ~ligne 151 — Maintenance mode bloque `/share`**
Route publique `/share/:cardId` est redirigée en mode maintenance → les visiteurs ne peuvent plus voir les cartes partagées.
Fix : ajouter `to.name !== 'share'` à la condition du guard.

**A4. Focus traps manquants dans toutes les modales**
Fichiers : `ConfirmModal.vue`, `BatchCreateModal.vue`, `SaveAsModal.vue`, `GradientFillPopover.vue`.
La tabulation clavier sort des modales. Ajouter `@keydown.escape` + piégeage du focus.

**A5. 20+ inputs sans labels associés (accessibilité)**
Fichiers : `ContextBarCommon.vue` (X, Y, L, H, rotation), `EditorSidebarInfo.vue`, `EditorSidebarDesign.vue`.
Inputs avec `title=` uniquement → inaccessibles aux lecteurs d'écran. Ajouter `aria-label` ou `<label :for="">`.

**A6. Boutons toggle sans `aria-pressed`**
Fichiers : `ContextBarText.vue` (Bold, Italic, Underline), `ContextBarCommon.vue` (lock ratio), `EditorContextBar.vue`.
État communiqué uniquement par couleur/icône → inaccessible.

**A7. Hiérarchie des titres incohérente**
- `src/views/ShareView.vue:10,47` — Double H1 (card.name + getFullName)
- `src/views/GalleryView.vue:27,228` — Saute H2 (H1 → H3 directement)
- `src/views/DashboardView.vue:839` — H3 sans H2 parent ("Statistiques partage")

**A8. Empty states et loading states manquants**
- `GalleryView.vue` → pas de spinner/skeleton au premier `onMounted`
- `ShareView.vue` → carte blanche si `card.data.elements` est vide
- `DashboardView.vue` → stats affichent "0" avant le chargement réel (flickering)

**A9. `src/stores/useEditorStore.js` ~lignes 803-818 — contactData mute des closures**
Variables `_prevContactKey` et `_prevContactData` mutées en dehors du scope `computed` → viole la réactivité Vue. Risque de bugs subtils en cas de deux instances store.

**A10. `src/stores/fontStore.js` ~lignes 261-271 — Polling 100ms inefficace**
10 vérifications/seconde pendant max 5s pour attendre le chargement d'une police.
Fix : utiliser `document.fonts.ready` ou un `Promise` event-driven.

**A11. Watchers Pinia non nettoyés après logout**
Fichiers : `cards.js:116-126`, `userTemplatesStore.js:62-76`.
`watch(() => authStore.user?.email, ...)` persiste indéfiniment en mémoire après déconnexion.

**A12. `src/stores/adminStore.js` ~lignes 266-271 — withLoading() sans error handling**
Si `fn()` lance une exception, `isLoading.value` reste `true` indéfiniment → UI bloquée.
Fix : wraper dans `try/finally`.

---

## 🟡 OPTIMISATIONS ET POLISH — 10 problèmes

**O1. Tailwind — Classes dark mode répétées 40+ fois**
Fichiers : `EditorSidebarDesign.vue`, `EditorSidebarInfo.vue`, `NavBar.vue`.
Le même ternaire `themeStore.darkMode ? 'bg-onyx-800 ...' : 'bg-white ...'` est dupliqué massivement.
Fix : extraire en classes `@apply` dans `src/style.css` :
```css
.card-surface { @apply bg-white dark:bg-onyx-800 border-powder-200 dark:border-onyx-700; }
.text-secondary { @apply text-onyx-500 dark:text-onyx-400; }
```

**O2. Transitions manquantes sur dropdowns/popovers**
Fichiers : `EditorBottomBar.vue` (radius, format, zoom), `EditorContextBar.vue` (fill popover), `NavBar.vue` (notifications).
Apparition/disparition brutale. Ajouter `<Transition name="dropdown-fade">` avec 100-150ms.

**O3. Liens morts `href="#"`**
Fichiers : `AuthView.vue:207`, `LoginView.vue:77`.
"Mot de passe oublié" fait scroller vers le haut. Implémenter un modal ou masquer le lien.

**O4. `console.error` exposés en production**
Fichiers : `DashboardView.vue:1525,1560,1601`, `LoginView.vue:121,153`.
Conditionner sur `import.meta.env.DEV` ou utiliser un service de logging.

**O5. `EditorCanvas.vue` — imageCache Konva sans limite**
Cache d'images jamais purgé → croît indéfiniment en session longue.
Fix : implémenter LRU avec limite de 50 entrées.

**O6. `ConfirmModal.vue` — Pas de `prefers-reduced-motion`**
Les animations de modales ignorent le paramètre système de réduction de mouvement.
Fix : ajouter `@media (prefers-reduced-motion: reduce) { .modal-animation { transition: none; } }`.

**O7. `src/stores/notificationStore.js` — Collision d'IDs possible**
`id: Date.now() + Math.random()` peut créer des collisions si deux notifications sont ajoutées dans la même milliseconde.
Fix : utiliser `crypto.randomUUID()`.

**O8. `EditorTopBar.vue` ~lignes 137-155 — Export dropdown sans ARIA**
Menu items sans `role="menuitem"`, dropdown sans animation d'entrée.

**O9. `src/stores/adminStore.js` — Actions `async` sans `await`**
Plusieurs fonctions marquées `async` sans aucune opération asynchrone → overhead inutile, confusion.

**O10. `src/components/BusinessCard.vue` ~ligne 303 — Image sans alt**
Attribut `alt` manquant sur une image rendue → avertissement accessibilité.

---

## 📋 Résumé chiffré

| Catégorie | Count |
|-----------|-------|
| 🔴 Critiques (production-breaking) | 9 |
| 🟠 Améliorations importantes | 12 |
| 🟡 Optimisations / polish | 10 |
| **Total** | **31** |

---

## 📁 Fichiers les plus impactés

| Fichier | Problèmes | Priorité |
|---------|-----------|----------|
| `src/stores/cards.js` | Watch leak, O(n) scan, orphelins | CRITIQUE |
| `src/stores/userTemplatesStore.js` | Fonction morte post-return, watch leak | CRITIQUE |
| `src/stores/useEditorStore.js` | historyIndex bug, contactData computed | CRITIQUE |
| `src/components/ToastNotification.vue` | aria-live manquant | CRITIQUE |
| `src/router/index.js` | Route /share bloquée, redirect morte | HAUTE |
| `src/views/LoginView.vue` + `RegisterView.vue` | À supprimer (duplication AuthView) | HAUTE |
| `src/stores/notificationStore.js` | setTimeout leak, collision IDs | HAUTE |
| `src/stores/adminStore.js` | saveToLS sans try/catch, withLoading bug | HAUTE |
| `src/components/editor/sidebar/EditorSidebarDesign.vue` | 40+ répétitions Tailwind | MOYENNE |
| `src/components/editor/contextbar/ContextBarCommon.vue` | 5 inputs sans labels | MOYENNE |

---

## 🔧 Ordre d'exécution recommandé (pour quand on s'y attaquera)

1. Créer `src/utils/storage.js` — wrapper sécurisé localStorage (déblocant pour les autres)
2. Corriger les 3 bugs stores critiques (C1, C2, C3)
3. Supprimer `LoginView.vue` + `RegisterView.vue`, nettoyer le router (C4, C5)
4. Corriger `ToastNotification.vue` — ajouter aria-live (C9)
5. Corriger `notificationStore.js` + `adminStore.js` — leaks et try/catch (C6, C8)
6. Router guard — exclure /share du mode maintenance (A3)
7. Corriger les headings, empty states, loading states (A7, A8)
8. Focus traps + aria-pressed + labels inputs (A4, A5, A6)
9. Tailwind @apply — extraire les classes répétées (O1)
10. Transitions dropdowns/popovers (O2)
