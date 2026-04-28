# Roadmap : Refactor Système d'Édition Texte

> **Source officielle** du refactor du système texte de l'éditeur Konva.
> Mise à jour après chaque session d'implémentation.

---

## Table des matières

1. [Analyse du système texte actuel](#1-analyse-du-système-texte-actuel)
2. [Structure du projet liée au texte](#2-structure-du-projet-liée-au-texte)
3. [Causes exactes du bug d'édition partielle](#3-causes-exactes-du-bug-dédition-partielle)
4. [Architecture cible recommandée](#4-architecture-cible-recommandée)
5. [Plan d'implémentation multi-sessions](#5-plan-dimplèmentation-multi-sessions)
6. [Zones à risque](#6-zones-à-risque)
7. [Contraintes serializer / export / dashboard renderer](#7-contraintes-serializer--export--dashboard-renderer)
8. [Configuration Claude Code par session](#8-configuration-claude-code-par-session)
9. [Checklist progressive](#9-checklist-progressive)
10. [Progression du refactor](#10-progression-du-refactor)

---

## 1. Analyse du système texte actuel

### 1.1 Rendu canvas (Konva)

**Fichier principal** : `src/components/editor/EditorCanvas.vue`

- **Composant Konva** : `v-text` (lignes 69-78), config générée par `buildTextConfig(el)` (lignes 1049-1078)
- **Props Konva texte** : `text`, `fontSize`, `fontFamily`, `fontStyle`, `fill` (ou gradient), `align`, `verticalAlign`, `letterSpacing`, `lineHeight`, `textDecoration`, `wrap`, `rotation`, `opacity`, `shadowEnabled/Color/Blur/OffsetX/OffsetY/Opacity`
- **Modèle monolithique** : tout le texte d'un élément partage les mêmes styles (aucun style par caractère ou segment)
- **Masquage pendant édition** : `opacity: editingEl.value?.id === el.id ? 0 : (el.opacity ?? 1)` — le nœud Konva est rendu invisible pendant que le textarea overlay est actif
- **Soulignement custom** : overlay `v-line` séparé par ligne de texte (lignes 79-85, 1080-1122). Konva `textDecoration: 'underline'` est désactivé si `underlineColor` est défini, car Konva underline utilise toujours la couleur de `fill`.

### 1.2 Édition du texte (textarea overlay)

**Fichier** : `src/components/editor/EditorCanvas.vue`

- **Textarea HTML** : positionné absolument, `z-50`, `bg-transparent` (lignes 356-366)
- **Déclenchement** : `@dblclick="startTextEdit(el)"` et `@dbltap="startTextEdit(el)"` sur le nœud `v-text` (lignes 73-74)
- **État réactif** : `editingEl = ref(null)` et `editingText = ref('')` (lignes 486-488)
- **Synchronisation** : `v-model="editingText"` — tout changement dans le textarea met `editingText` à jour instantanément
- **Fin d'édition** : `@blur` ou `@keydown.esc` → `finishTextEdit()` (lignes 2815-2844)
- **Suppression automatique** : si le texte final est vide, l'élément est supprimé du canvas
- **Listes intelligentes** : `onTextareaKeydown` (lignes 2742-2813) gère auto-préfixe `• / - / 1.` sur `Enter` et suppression de préfixe sur `Backspace`

**Fonction `startTextEdit()` actuelle (lignes 2699-2708)** :
```javascript
function startTextEdit(el) {
  if (isLocked(el)) return
  editingEl.value = el
  editingText.value = el.text || ''
  nextTick(() => {
    updateTransformer()
    textareaRef.value?.focus()
    textareaRef.value?.select()  // ← PROBLÈME CRITIQUE : sélectionne tout le texte
  })
}
```

### 1.3 Positionnement du textarea

`textareaStyle` (computed, lignes 2906-2931) convertit les coordonnées card-space en screen-space :

```javascript
left:       cardOffset.x + el.x * zoom + 'px'
top:        cardOffset.y + el.y * zoom + 'px'
width:      (el.width || 200) * zoom + 'px'
fontSize:   (el.fontSize || 16) * zoom + 'px'
letterSpacing: (el.letterSpacing || 0) * zoom + 'px'
// Pas de scaling pour : fontFamily, fontStyle/Weight, color, textAlign, lineHeight, textDecoration
```

Le textarea possède exactement les mêmes styles typographiques que le nœud Konva, permettant une superposition visuelle fidèle.

### 1.4 Synchronisation des dimensions

`syncTextRenderedDims(elId)` (lignes 1773-1783) : lit la largeur/hauteur réelles du nœud Konva rendu et les cache dans `liveDragPos[elId]`. Utilisé par la context bar et les overlays de soulignement. Appelé après : fin d'édition, fin de drag, fin de transformation, changement de sélection.

### 1.5 Gestion de la sélection

Il n'existe pas de fichier `SelectionManager.vue` séparé. La sélection est entièrement gérée dans `EditorCanvas.vue` :
- Sélection simple : `onElementClick()` → `editorStore.selectElement(id)`
- Sélection multiple : `Ctrl+clic`
- Désélection : clic sur le fond du stage

### 1.6 Styles texte via EditorContextBar

**Fichiers** : `src/components/editor/EditorContextBar.vue` + `src/components/editor/contextbar/ContextBarText.vue`

Contrôles exposés :

| Contrôle | Prop store modifiée |
|----------|-------------------|
| Couleur (solid) | `fill` |
| Couleur (gradient) | `fillGradient: { angle, from, to }` |
| Police | `fontFamily` |
| Taille police | `fontSize` |
| Gras | `fontStyle` (toggle 'bold') |
| Italique | `fontStyle` (toggle 'italic') |
| Souligné | `textDecoration` + `underlineColor` |
| Listes | `text` (modifie les préfixes) |
| Alignement | `align` |
| Espacement lettres | `letterSpacing` |
| Icône contact | `showContactIcon` |

Communication : `updateElement(id, props)` (live, sans undo) ou `updateElementCommit(id, props)` (+ snapshot undo). Tous les styles s'appliquent à **l'élément entier** — aucun mécanisme de style partiel.

### 1.7 Stores (`useEditorStore.js`)

Structure d'un élément texte (lignes 675-699) :
```javascript
{
  id, type: 'text',
  text: 'Votre texte',
  x, y, width, height, rotation, opacity, visible, zIndex,
  fontSize, fontFamily, fontStyle, fontVariant,
  textDecoration, underlineColor,
  fill, fillGradient: { angle, from, to },
  align, verticalAlign,
  letterSpacing, lineHeight, wrap,
  shadowEnabled, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, shadowOpacity,
  role,           // 'firstName' | 'lastName' | 'email' | ... | 'custom_{id}'
  showContactIcon,
  groupId, locked,
}
```

Mutations clés :
- `updateElement(id, props)` : shallow-merge, pas d'undo
- `updateElementCommit(id, props)` : shallow-merge + `saveHistory()` (snapshot JSON complet, max 50)

**Aucune propriété de style par caractère, segment, ou "style run".**

### 1.8 Serializer (`cardElements.js`)

`konvaToCardEl(el, cw, ch, index)` : convertit un élément éditeur vers le format BusinessCard (stocké en localStorage).

Transformations pour texte (lignes 241-268) :
- `fontStyle` ('normal'|'bold'|'italic'|'bold italic') → `bold: bool` + `italic: bool`
- `align` → `textAlign` (nommage CSS standard)
- `fill` → `color`
- `el.x, el.y` (px) → `x%, y%` (pourcentages relatifs aux dimensions carte)
- `fillGradient: { angle, from, to }` → préservé identique
- Pas de support pour style runs ou per-character formatting.

### 1.9 Renderer Dashboard (`BusinessCard.vue`)

- **Rendu** : HTML + CSS dynamique avec `fontScale` responsive
- **fontScale** : `clientWidth / (card.data?.cardWidth || 680)` — recalculé via `ResizeObserver`
- **Gradient texte** : `background-clip: text` + `-webkit-text-fill-color: transparent`
- **Ombre** : `filter: drop-shadow(offsetX offsetY blur rgba(r,g,b,opacity))`
- **Rotation** : `transform: rotate(deg)` avec `transformOrigin: '0 0'`
- **Soulignement custom** : `text-decoration-color: el.underlineColor` (CSS standard)
- **Scaling** : `fontSize * fontScale`, `letterSpacing * fontScale`

### 1.10 Renderer Export (`cardExporter.js`)

- **Approche** : Stage Konva off-screen (positionné à `-9999px`)
- **Résolution** : `pixelRatio: 3` par défaut → export 3× la résolution canvas
- **Gradient texte** : `gradientProps()` de `gradientHelpers.js` → `fillLinearGradient*` Konva
- **Underlines custom** : `Konva.Line` par ligne de texte (même logique que l'éditeur)
- **Ombre** : `shadowEnabled/Color/Blur/OffsetX/OffsetY/Opacity` Konva natif
- **Format sortie** : `toDataURL('image/png', 1)` → puis canvas HTML5 pour conversion JPG (quality 0.92)
- **Icône contact** : pré-rasterisée via `loadIconImage()` avant rendu, opacité 70%

---

## 2. Structure du projet liée au texte

```
src/
├── components/
│   ├── editor/
│   │   ├── EditorCanvas.vue         ← Rendu Konva + édition textarea (FICHIER CLÉ)
│   │   ├── EditorContextBar.vue     ← Barre contextuelle (détecte type sélectionné)
│   │   └── contextbar/
│   │       ├── ContextBarText.vue   ← Contrôles texte (B, I, U, couleur, taille…)
│   │       └── FontPickerDropdown.vue
│   └── BusinessCard.vue             ← Dashboard renderer (HTML/CSS)
├── stores/
│   └── useEditorStore.js            ← État, mutations, historique
└── utils/
    ├── cardElements.js              ← Serializer Konva → BusinessCard format
    ├── cardExporter.js              ← Export Konva off-screen → PNG/JPG/PDF
    └── gradientHelpers.js           ← Conversion angle CSS ↔ points Konva gradient
```

**Fichiers non concernés** par la correction d'édition partielle :
- `src/stores/cards.js` — CRUD cartes
- `src/stores/userTemplatesStore.js` — templates
- `src/utils/templateLayouts.js` — layouts prédéfinis
- Tous les composants sidebar (`EditorSidebar*.vue`)

---

## 3. Causes exactes du bug d'édition partielle

### Cause 1 — `textareaRef.value?.select()` (CRITIQUE)

Dans `startTextEdit()` (ligne ~2706), l'appel `.select()` sélectionne **systématiquement la totalité du texte**, écrasant toute position naturelle du curseur. L'utilisateur ne peut jamais positionner son curseur à l'intérieur du texte — il est toujours contraint de travailler sur l'intégralité.

### Cause 2 — `$event` non transmis (CRITIQUE)

```vue
<!-- Actuel : $event non passé -->
@dblclick="startTextEdit(el)"
@dbltap="startTextEdit(el)"
```

Les coordonnées du double-clic (clientX/Y en pixels écran) ne sont jamais transmises à `startTextEdit()`. Sans ces coordonnées, il est impossible de calculer à quelle position dans le texte l'utilisateur a cliqué.

### Cause 3 — Double-clic sur canvas ≠ double-clic sur textarea (MAJEUR)

Le double-clic déclenche sur le **nœud Konva** (dans le canvas). Le textarea HTML n'existe pas encore à ce moment. Même sans `.select()`, lorsque le textarea apparaît et reçoit le focus, aucune position naturelle de curseur n'est établie (le navigateur la place à 0 ou à la fin selon les implémentations).

### Tableau récapitulatif

| # | Cause | Fichier | Localisation | Gravité |
|---|-------|---------|-------------|---------|
| 1 | `.select()` sélectionne tout le texte | EditorCanvas.vue | `startTextEdit()` ~L2706 | Critique |
| 2 | `$event` non passé à `startTextEdit` | EditorCanvas.vue | Template L73-74 | Critique |
| 3 | Clic canvas → textarea : pas de conversion coords → index | EditorCanvas.vue | `startTextEdit()` | Majeur |

---

## 4. Architecture cible recommandée

### Principe

Conserver l'architecture actuelle (textarea overlay sur Konva) — elle est solide et performante. La correction est **chirurgicale** et limitée à `startTextEdit()` et ses bindings template.

### Étape A — Fix minimal (Session 1, risque faible)

Supprimer `.select()`, passer `$event`, positionner le curseur via `caretRangeFromPoint` :

```javascript
// Template :
@dblclick="startTextEdit(el, $event)"
@dbltap="startTextEdit(el, $event)"

// Fonction :
function startTextEdit(el, e = null) {
  if (isLocked(el)) return
  editingEl.value = el
  editingText.value = el.text || ''

  // Coordonnées écran du double-clic (avant que le textarea soit rendu)
  const clickPos = e?.evt
    ? { x: e.evt.clientX, y: e.evt.clientY }
    : null

  nextTick(() => {
    updateTransformer()
    textareaRef.value?.focus()

    if (clickPos) {
      // Après rendu du textarea, positionner le curseur à la coordonnée cliquée
      requestAnimationFrame(() => positionCaretAtPoint(clickPos.x, clickPos.y))
    } else {
      // Fallback : curseur à la fin du texte (pas .select())
      const len = editingText.value.length
      textareaRef.value?.setSelectionRange(len, len)
    }
  })
}

function positionCaretAtPoint(x, y) {
  if (!textareaRef.value) return

  // Chrome/Edge : document.caretRangeFromPoint
  const range = document.caretRangeFromPoint?.(x, y)
  if (range?.startContainer?.nodeType === Node.TEXT_NODE) {
    textareaRef.value.setSelectionRange(range.startOffset, range.startOffset)
    return
  }

  // Firefox : document.caretPositionFromPoint
  const caret = document.caretPositionFromPoint?.(x, y)
  if (caret) {
    textareaRef.value.setSelectionRange(caret.offset, caret.offset)
    return
  }

  // Fallback universel : curseur à la fin
  const len = textareaRef.value.value.length
  textareaRef.value.setSelectionRange(len, len)
}
```

### Étape B — Comportement dblclick standard (Session 2, optionnel)

En HTML natif, un double-clic sur un mot le sélectionne. Reproduire ce comportement après l'étape A en trouvant les limites du mot autour de l'index obtenu par `caretRangeFromPoint`.

### Étape C — Style runs / per-character formatting (Session 3+, complexe)

Appliquer bold/italic/couleur uniquement sur la sélection textarea est une évolution **majeure** qui nécessite un modèle de style runs (comme Rich Text). L'architecture actuelle est monolithique. Cette étape est **optionnelle** et devra faire l'objet d'une refonte du store, du serializer, du renderer dashboard et de l'export.

---

## 5. Plan d'implémentation multi-sessions

### Session 1 — Fix principal (30-45 min)

**Fichier unique** : `src/components/editor/EditorCanvas.vue`

**Changements** :
1. Lignes 73-74 du template : ajouter `$event`
   ```vue
   @dblclick="startTextEdit(el, $event)"
   @dbltap="startTextEdit(el, $event)"
   ```
2. `startTextEdit()` (lignes 2699-2708) :
   - Nouvelle signature : `function startTextEdit(el, e = null)`
   - Supprimer `textareaRef.value?.select()`
   - Capturer `clickPos` depuis `e?.evt`
   - Appeler `positionCaretAtPoint` via `requestAnimationFrame`
3. Ajouter `positionCaretAtPoint(x, y)` (fonction locale, ~20 lignes)

**Périmètre de tests** :
- [ ] Double-clic au milieu de "manger" → curseur positionné dans le mot
- [ ] Double-clic en début/fin de texte → curseur en début/fin
- [ ] Blur / Esc → ferme l'édition correctement
- [ ] Undo/Redo toujours fonctionnel
- [ ] Listes à puces (Enter/Backspace) inchangées
- [ ] Export PNG/PDF : non affecté (textarea = éditeur uniquement)
- [ ] Dashboard BusinessCard.vue : non affecté
- [ ] Texte multi-lignes : édition partielle sur chaque ligne
- [ ] Zoom ≠ 100% : position curseur toujours correcte

### Session 2 — Stabilisation cross-browser + dblclick mot (20-30 min)

1. Vérifier et solidifier la compatibilité `caretRangeFromPoint` vs `caretPositionFromPoint`
2. Ajouter helper `findWordBounds(text, index)` pour sélection du mot double-cliqué
3. Tester sur touch mobile (dbltap) — `e.evt.touches?.[0].clientX/Y`
4. Couvrir le cas des textes avec `rotation ≠ 0` (textarea non rotaté → hors scope, documenter)

### Session 3 — Style runs / per-character formatting (optionnel, complexe)

> ⚠️ Cette session nécessite une refonte architecturale complète. Ne pas démarrer sans une analyse approfondie du coût/bénéfice.

Prérequis :
- Définir un modèle de style runs : `{ text: string, styles: StyleRun[] }` où `StyleRun = { start, end, bold?, italic?, color?, fontSize? }`
- Adapter `useEditorStore.js` (structure d'élément, mutations partielles)
- Adapter `cardElements.js` (serializer)
- Adapter `BusinessCard.vue` (rendu HTML `<span>` par segment)
- Adapter `cardExporter.js` (rendu Konva multi-nodes ou canvas 2D custom)
- Adapter `ContextBarText.vue` (détecter sélection dans le textarea et l'appliquer)

---

## 6. Zones à risque

| Zone | Risque | Impact | Mitigation |
|------|--------|--------|-----------|
| `requestAnimationFrame` timing | Textarea pas encore rendu quand `rAF` s'exécute | Curseur non positionné | Tester double `nextTick` + `rAF` si nécessaire |
| `caretRangeFromPoint` cross-browser | API différente Firefox (caretPositionFromPoint) vs Chrome | Curseur mal positionné sur Firefox | Dual-API fallback obligatoire |
| Textarea scaled par zoom | Le textarea est mis à l'échelle CSS → coords clientX/Y peuvent pointer en dehors | Position curseur incorrecte au zoom ≠ 100% | Vérifier empiriquement ; les APIs `caretRangeFromPoint` opèrent en coordonnées viewport, pas en coordonnées CSS logiques |
| Touch/mobile (dbltap) | `e.evt` = TouchEvent, pas MouseEvent | `clientX/Y` absent | Utiliser `e.evt.changedTouches?.[0]` |
| Textes avec rotation | Le textarea overlay n'a pas de `transform: rotate()` → décalage visuel si texte rotaté | UX dégradée pour textes rotatés | Problème préexistant, hors scope Sessions 1-2 |
| Listes à puces | L'index de caractère post-dblclick peut tomber dans un préfixe `• ` | UX confuse | Ne pas modifier `onTextareaKeydown`, comportement inchangé |

---

## 7. Contraintes serializer / export / dashboard renderer

**Sessions 1 et 2 : aucune contrainte.**

La correction est entièrement dans `EditorCanvas.vue`. Aucun de ces fichiers n'est modifié :

| Fichier | Statut Session 1-2 |
|---------|-------------------|
| `src/utils/cardElements.js` | Non touché |
| `src/utils/cardExporter.js` | Non touché |
| `src/components/BusinessCard.vue` | Non touché |
| `src/stores/useEditorStore.js` | Non touché |
| `src/components/editor/contextbar/ContextBarText.vue` | Non touché |

**Session 3 (style runs) : contraintes majeures** — voir section 5, Session 3.

---

## 8. Configuration Claude Code par session

| Session | Modèle recommandé | Effort | Plan Mode | Durée estimée |
|---------|------------------|--------|-----------|--------------|
| Session 1 — Fix textarea | `claude-sonnet-4-6` | medium | Oui | 30-45 min |
| Session 2 — Stabilisation | `claude-sonnet-4-6` | medium | Non | 20-30 min |
| Session 3 — Style runs | `claude-opus-4-7` | high | Oui | 2-4h |

---

## 9. Checklist progressive

### Analyse (terminée)

- [x] Analyse TextOverlay → textarea overlay dans EditorCanvas.vue L356-366
- [x] Analyse Konva Text bindings → `v-text` + `buildTextConfig()` L1049-1078
- [x] Analyse SelectionManager → intégré dans EditorCanvas.vue, pas de fichier séparé
- [x] Analyse serializer texte → `konvaToCardEl()` dans cardElements.js L241-268
- [x] Analyse renderer dashboard texte → BusinessCard.vue `textStyle()` + `fontScale`
- [x] Analyse export texte → cardExporter.js `addElementToLayer()` L93-189

### Implémentation

- [x] Correction sélection partielle texte (Session 1)
- [x] Correction sync textarea ↔ Konva — `caretRangeFromPoint` (Session 1)
- [x] Stabilisation styles inline texte (Session 2)
- [x] Tests compatibilité export / dashboard (Session 2 — aucun changement attendu)

### Optionnel

- [x] Comportement dblclick → sélection mot (Session 2)
- [ ] Style runs / per-character formatting (Session 3)

---

## 10. Progression du refactor

| Date | Session | Statut | Notes |
|------|---------|--------|-------|
| 2026-04-20 | Analyse complète + création roadmap | ✅ Terminé | Ce fichier créé |
| 2026-04-20 | Session 1 : Fix textarea (supprimer `.select()`, passer `$event`, `caretRangeFromPoint`) | ✅ Terminé | EditorCanvas.vue — validé en prod |
| 2026-04-20 | Session 2 : Stabilisation cross-browser + dblclick mot | ✅ Terminé | `findWordBounds` + `positionCaretAtPoint` refactorisé |
| — | Session 3 : Style runs (optionnel) | ⏳ Optionnel | Architecture complète à revoir |

---

*Document généré le 2026-04-20. Mettre à jour la section "Progression" après chaque session.*
