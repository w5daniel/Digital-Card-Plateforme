# EditorContextBar — Roadmap de Refactor Multi-Sessions

> **Source officielle du refactor.**  
> Lire et mettre à jour ce fichier avant et après chaque extraction.

---

## 1. ANALYSE DU COMPOSANT ACTUEL

**Fichier :** `src/components/editor/EditorContextBar.vue`  
**Taille :** ~1 894 lignes  
**Dépendances Konva directes :** Aucune  
**Props / Emits :** Aucun — composant entièrement autonome via stores Pinia

### Responsabilités actuelles

| Bloc | Condition d'activation | Lignes estimées |
|------|------------------------|-----------------|
| Lock/Unlock | sélection active | ~30 |
| TextToolbar | `selType === 'text'` | ~500 (dont font dropdown ~310) |
| LineToolbar | shape + line / line-bar | ~100 |
| ArrowToolbar | shape + arrow / arrow-double | ~45 |
| ShapeToolbar | shape classique | ~200 |
| IconToolbar | `selType === 'icon'` | ~75 |
| QRToolbar | `selType === 'qr'` | ~70 |
| ImageToolbar | `selType === 'image'` | ~35 |
| MultiSelectionToolbar | `selectedIds.length >= 2` | ~95 |
| CommonToolbar | sélection unique, non verrouillé | ~180 |

### Stores utilisés

| Store | Fonctions / Propriétés clés |
|-------|-----------------------------|
| `useEditorStore` | `selectedIds`, `singleSelected`, `currentElements`, `updateElement()`, `updateElementCommit()`, `deleteSelected()`, `groupSelected()`, `ungroupSelected()`, `canUngroup`, `alignElements()`, `toggleLock()`, `duplicateSelected()`, `bringForward()`, `sendBackward()`, `livePosState` |
| `useFontStore` | `searchFonts()`, `customFonts`, `favoriteFontsList`, `popularFonts`, `allFontFamilies`, `loadFont()`, `toggleFavorite()`, `isFavorite()`, `loadedFonts` |
| `useAuthStore` | `isPremium`, `isAdmin` (cap premium font dropdown) |
| `useThemeStore` | `darkMode` (classes CSS uniquement) |

### Points de couplage critiques

#### A. GradientFill partagé (TEXT ↔ SHAPE)
`shapeFillMode`, `shapeGradFrom`, `shapeGradTo`, `shapeGradAngle` et le fill popover (~120 lignes avec Teleport) sont utilisés par TEXT et SHAPE. **Ne pas dupliquer.** Le popover doit devenir `GradientFillPopover.vue` et être instancié dans le parent.

#### B. `watch(sel, ...)` de réinitialisation gradient
Ce watcher (lignes ~1627–1647) surveille `singleSelected` et réinitialise le gradient mode à chaque changement de sélection. Il doit rester dans le parent ou migrer avec `GradientFillPopover`.

#### C. Fonction `commit()` (lignes ~1620–1624)
```js
function commit(key, value) {
  if (!sel.value) return
  editorStore.updateElementCommit(sel.value.id, { [key]: value })
}
```
Appelée dans tous les blocs. À réimporter dans chaque sous-composant (stores globaux accessibles).

#### D. Event listeners globaux
`onDocClick` (font dropdown) et `onFillPopoverOutside` (gradient popover) sont enregistrés sur `document`. Le cleanup est dans `onBeforeUnmount`. Chaque listener doit migrer avec son composant.

#### E. Font dropdown — 5 computeds enchaînés
`filteredFonts`, `importedFonts`, `favFonts`, `filteredPopularFonts`, `otherFonts` + cap premium. Entièrement auto-contenus dans le scope TEXT. Extractibles ensemble dans `FontPickerDropdown.vue`.

---

## 2. STRUCTURE CIBLE

```
src/components/editor/contextbar/
├── ContextBarText.vue           # Police, taille, gras, italique, soulignement, alignement, puces, espacement
│   └── FontPickerDropdown.vue   # Dropdown font (~310 lignes) — composant interne de Text
├── ContextBarShape.vue          # Remplissage (solid/gradient), bordure, coin arrondi
├── ContextBarLine.vue           # Ligne (line/line-bar) + Flèche (arrow/arrow-double)
├── ContextBarIcon.vue           # Couleur, bordure, taille
├── ContextBarQR.vue             # Couleur avant/arrière-plan, mode standard/stylé
├── ContextBarImage.vue          # Recadrage, forme circulaire, reset crop
├── ContextBarMulti.vue          # Group/Ungroup, alignement multi-sélection, suppression
├── ContextBarCommon.vue         # Position X/Y, taille L/H, ratio lock, rotation, opacité, couches, duplication
└── GradientFillPopover.vue      # Popover partagé (Teleport) — utilisé par Text + Shape
```

**Le parent `EditorContextBar.vue` conserve :**
- Le routing `v-if` entre les 9 composants
- Les refs gradient (`shapeFillMode`, `shapeGradFrom`, `shapeGradTo`, `shapeGradAngle`) + le watcher de réinitialisation
- L'instanciation de `GradientFillPopover.vue`

---

## 3. ORDRE D'EXTRACTION RECOMMANDÉ

Du plus simple (zéro couplage) au plus complexe :

1. `ContextBarImage.vue` — proof of concept (35 lignes, zéro couplage)
2. `ContextBarQR.vue` — 70 lignes, auto-contenu
3. `ContextBarIcon.vue` — 75 lignes, auto-contenu
4. `ContextBarLine.vue` — line + arrow fusionnés (~145 lignes)
5. `ContextBarMulti.vue` — groupage / alignement (~95 lignes)
6. `ContextBarCommon.vue` — position / taille / rotation (~180 lignes)
7. `GradientFillPopover.vue` — **à faire avant Shape et Text** (~120 lignes, Teleport + v-model)
8. `ContextBarShape.vue` — nécessite GradientFillPopover prêt (~200 lignes)
9. `FontPickerDropdown.vue` — bloc interne de Text (~310 lignes)
10. `ContextBarText.vue` — en dernier (~500 lignes total avec FontPicker)

---

## 4. CHECKLIST DE PROGRESSION

- [x] `ContextBarImage.vue`
- [x] `ContextBarQR.vue`
- [x] `ContextBarIcon.vue`
- [x] `ContextBarLine.vue`
- [x] `ContextBarMulti.vue`
- [x] `ContextBarCommon.vue`
- [x] `GradientFillPopover.vue`
- [x] `ContextBarShape.vue`
- [x] `FontPickerDropdown.vue`
- [x] `ContextBarText.vue`

---

## 5. CONFIGURATION CLAUDE PAR ÉTAPE

| Étape | Composant | Modèle | Plan Mode | Thinking | Effort |
|-------|-----------|--------|-----------|----------|--------|
| 1 | `ContextBarImage.vue` | Sonnet 4.6 | ON | OFF | LOW |
| 2 | `ContextBarQR.vue` | Sonnet 4.6 | ON | OFF | LOW |
| 3 | `ContextBarIcon.vue` | Sonnet 4.6 | ON | OFF | LOW |
| 4 | `ContextBarLine.vue` | Sonnet 4.6 | ON | OFF | LOW |
| 5 | `ContextBarMulti.vue` | Sonnet 4.6 | ON | OFF | MEDIUM |
| 6 | `ContextBarCommon.vue` | Sonnet 4.6 | ON | OFF | MEDIUM |
| 7 | `GradientFillPopover.vue` | Sonnet 4.6 | ON | ON | HIGH |
| 8 | `ContextBarShape.vue` | Sonnet 4.6 | ON | ON | HIGH |
| 9 | `FontPickerDropdown.vue` | Sonnet 4.6 | ON | ON | HIGH |
| 10 | `ContextBarText.vue` | Sonnet 4.6 | ON | ON | HIGH |

**Règle générale :** Une session = un composant. Tester visuellement dans le navigateur après chaque extraction avant de passer à la suivante.

---

## 6. PROGRESSION DU REFACTOR

### Terminé
- `ContextBarImage.vue`
- `ContextBarQR.vue`
- `ContextBarIcon.vue`
- `ContextBarLine.vue`
- `ContextBarMulti.vue`
- `ContextBarCommon.vue`
- `GradientFillPopover.vue`
- `ContextBarShape.vue`
- `FontPickerDropdown.vue`
- `ContextBarText.vue`

### En cours
_(aucun pour l'instant)_

### Reste à faire
_(aucun — refactor terminé ✅)_

---

## 7. RÈGLES DE SÉCURITÉ DU REFACTOR

Ces règles s'appliquent à **chaque** extraction sans exception.

### Ne pas casser le serializer
Les éléments canvas sont sérialisés/désérialisés via `useEditorStore`. Les props des éléments (`el.fill`, `el.fontSize`, `el.fontFamily`, etc.) doivent rester inchangées. Ne modifier aucune clé d'objet élément.

### Ne pas casser le renderer dashboard/export
`src/utils/cardExporter.js` et les vues de preview (`BusinessCard.vue`, etc.) consomment les éléments du store. Le refactor ne touche que la couche UI — aucun changement dans la structure des données.

### Ne pas casser l'export PDF/JPG/PNG
`cardExporter.js` utilise `html-to-image` et `jsPDF`. Ces exports dépendent du DOM Konva, pas de EditorContextBar. Le refactor est sans impact direct, mais ne pas modifier `cardExporter.js`.

### Ne pas casser le gradient shared state
`shapeFillMode`, `shapeGradFrom`, `shapeGradTo`, `shapeGradAngle` et le watcher de réinitialisation doivent rester synchronisés entre TEXT et SHAPE. Toujours passer ces valeurs via **v-model ou props explicites** depuis le parent.

### Ne pas casser `commit()`
La fonction `commit(key, value)` wrappant `updateElementCommit()` doit être disponible dans chaque sous-composant. Soit la réimporter localement (stores globaux), soit la passer en prop — mais ne pas la supprimer sans remplacement.

### Ne pas casser les watchers existants
Le watcher `watch(sel, ...)` de réinitialisation gradient et le watcher `watch(fillPopoverOpen, ...)` pour les event listeners doivent être préservés. Migrer chaque watcher avec le composant qui le consomme.

### Principe général
> **Déplacer le code, ne pas le réécrire.** Copier-coller les blocs template et script tels quels. Ne modifier ni la logique, ni le nommage des variables, ni les classes CSS.

---

## 8. CONSIGNES POUR LES SESSIONS FUTURES

À lire en début de chaque session de refactor :

1. **Lire ce fichier en premier** (`docs/editor-contextbar-refactor-roadmap.md`) pour connaître l'état actuel.
2. **Lire `src/components/editor/EditorContextBar.vue`** pour vérifier les lignes exactes du bloc à extraire (les numéros peuvent décaler après chaque extraction précédente).
3. **Identifier le prochain composant** dans la checklist (section 4) — prendre le premier non coché.
4. **Activer Plan Mode** avant toute modification de code.
5. **Appliquer la configuration** du tableau section 5 (modèle, thinking, effort) correspondant à l'étape.
6. **Après extraction :**
   - Cocher la case dans la checklist (section 4)
   - Déplacer le composant dans "Terminé" (section 6)
   - Mettre à jour "Reste à faire" (section 6)
7. **Tester visuellement** dans le navigateur (npm run dev) avant de marquer comme terminé.
8. **Ne jamais extraire deux composants dans la même session** sauf si le premier est validé et testé.

### Contexte projet rappel
- Éditeur basé sur **Konva.js** via `vue-konva`
- Pas de backend — **localStorage uniquement**
- Stack : Vue 3 Composition API + Pinia + Vite + Tailwind CSS 3 + DaisyUI 5
- Éditeur = `src/components/editor/` — store principal = `src/stores/useEditorStore.js`
