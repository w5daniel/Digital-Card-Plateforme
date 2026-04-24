# Roadmap — Stabilisation du moteur Rich-Text (Texte Partiel Inline)

> Généré après analyse complète de l'architecture texte. Aucune modification de code dans ce document.

---

## 1. Vue d'ensemble

L'implémentation de `textRuns.js` (style partiel inline) a introduit plusieurs régressions. Ce document identifie les causes racines, propose des corrections précises par session, et définit une checklist de validation progressive.

### Deux problèmes systémiques

**Problème A — Blur textarea → perte de la sélection partielle**

Quand l'utilisateur clique un bouton de la ContextBar, l'événement `mousedown` déclenche le `blur` de la textarea d'édition **avant** que le `click` du bouton ne s'exécute. La séquence est :

```
mousedown (bouton ContextBar)
  → textarea blur
  → @blur="finishTextEdit" → ferme la textarea, efface textEditState
click (bouton ContextBar)
  → activeRunSelection() → textEditState.elId = null → retourne null
  → toggleBold() tombe en mode global (pas partiel)
```

Les runs ne sont donc **jamais réellement appliqués** depuis la ContextBar. Ce que l'utilisateur voit après déselection est le résultat du toggle global sur `fontStyle`, pas un run partiel.

**Problème B — Segments Konva sont des siblings, pas des enfants**

Les nœuds de segment (`v-text` par span) sont des siblings du nœud texte principal dans la v-layer Konva. Ils ne font pas partie d'un `v-group` commun. Résultat : les transformations Konva (drag, resize, rotation) qui s'appliquent au nœud principal ne se propagent pas aux segments.

De plus, `buildTextSegmentConfigs` calcule les positions depuis `el.x`/`el.y` (valeurs store, immuables pendant l'interaction) au lieu de lire `liveDragPos[el.id]` comme le fait déjà `buildTextUnderlineConfigs` pour les textes sans runs.

---

## 2. Analyse des causes racines par bug

### Bug 1 — Boutons Bold/Italic/Underline inactifs sur sélection partielle

**Fichier :** [`src/components/editor/contextbar/ContextBarText.vue:293`](../src/components/editor/contextbar/ContextBarText.vue#L293)

```js
// Actuel — lit uniquement les props globales de l'élément
const isBold = computed(() => sel.value?.fontStyle?.includes('bold'))
const isItalic = computed(() => sel.value?.fontStyle?.includes('italic'))
const isUnderline = computed(() => sel.value?.textDecoration?.includes('underline'))
```

Quand un run partiel est bold, `el.fontStyle` ne change pas → les boutons restent éteints.

**Cause :** Computed ne consulte pas `textEditState` ni les runs de l'élément.

---

### Bug 2 — Modifications visibles seulement après déselection

**Cause 1 (principale) :** Problème systémique A décrit ci-dessus — les runs ne sont jamais appliqués via la ContextBar (le toggle global est appliqué à la place).

**Cause 2 (rendu) :** Pendant l'édition inline, les segments sont invisibles :

```js
// EditorCanvas.vue buildTextSegmentConfigs
opacity: editingEl.value?.id === el.id ? 0 : (el.opacity ?? 1)
```

Même si les runs étaient mis à jour, ils resteraient invisibles jusqu'à la fin de l'édition.

---

### Bug 3 — Déplacement non dynamique des textes partiellement stylés

**Fichier :** [`src/components/editor/EditorCanvas.vue:1187`](../src/components/editor/EditorCanvas.vue#L1187)

```js
// buildTextSegmentConfigs — utilise el.x/el.y (valeurs store statiques)
x: el.x + cursorX,
y: el.y,
```

Pendant le drag, Konva déplace le nœud principal invisible. `liveDragPos[el.id]` est mis à jour, mais `buildTextSegmentConfigs` ne le lit pas.

**Comparaison avec le code correct** pour les textes sans runs ([ligne 1246](../src/components/editor/EditorCanvas.vue#L1246)) :
```js
// buildTextUnderlineConfigs — lit liveDragPos correctement
const live = liveDragPos[el.id]
const lx = live?.x ?? el.x   // ← correct
const ly = live?.y ?? el.y
```

---

### Bug 4 — Resize non fluide des textes partiellement stylés

Même cause que Bug 3. Pendant `onTextTransform`, `liveDragPos[el.id]` est mis à jour (ligne 2224) avec x, y, width, mais `buildTextSegmentConfigs` n'en tient pas compte. De plus `el.fontSize` n'est pas mis à jour live (seulement à `transformend`).

---

### Bug 5 — Rotation incorrecte des textes partiellement stylés

Pendant la rotation, le nœud principal tourne (Konva Transformer). Les segments ont `rotation: el.rotation || 0` (valeur store) et ne suivent pas.

`liveDragPos` stocke x/y pendant rotation ([ligne 2167](../src/components/editor/EditorCanvas.vue#L2167)) mais pas l'angle de rotation lui-même.

---

### Bug 6 — Couleur du souligné invisible sur sélection partielle

**Fichier :** [`src/components/editor/contextbar/ContextBarText.vue:295`](../src/components/editor/contextbar/ContextBarText.vue#L295)

```js
const isUnderline = computed(() => sel.value?.textDecoration?.includes('underline'))
```

Quand le souligné est dans un run (pas global), `el.textDecoration` est vide → `isUnderline = false` → le color picker du souligné est masqué.

---

### Bug 7 — Rendu Dashboard incorrect pour les textes partiellement stylés

**Fichier :** [`src/components/BusinessCard.vue:665`](../src/components/BusinessCard.vue#L665)

```js
// Actuel — pas de globalStyle passé
return segmentize(el.text || '', el.runs)

// Signature : segmentize(text, runs, globalStyle = {}, textLength)
```

Sans `globalStyle`, les portions non couvertes par un run héritent de `{}` : aucun bold, italic, ni couleur hérités du global.

De plus dans `segmentStyle` ([ligne ~670](../src/components/BusinessCard.vue#L670)) :

```js
fontWeight: seg.style.bold ?? el.bold ? 'bold' : 'normal',
//                           ^^^^^^^^ el.bold n'existe pas !
```

`el.bold` est `undefined`. L'expression évalue toujours `'normal'` pour les segments sans run bold explicit.

---

### Bug 8 — Color picker difficile sur sélection partielle

Cliquer le color picker → textarea blur → `scheduleTextEditStateClear()` → 500ms → `textEditState` effacé → `applyRunColor()` reçoit `activeRunSelection() = null` et ne s'applique pas partiellement.

**Cause :** Même problème systémique A.

---

### Bug 9 — Impossible de re-sélectionner une autre partie après modification

**Cause directe du Bug 2 :** Chaque clic ContextBar ferme la textarea. L'utilisateur doit double-cliquer à nouveau pour rentrer en mode édition. Résolu avec le fix du problème systémique A.

---

### Bug indépendant A — Souligné coupe les lettres à jambage (j, g, p, q, y)

**Fichier :** [`src/components/editor/EditorCanvas.vue:1225`](../src/components/editor/EditorCanvas.vue#L1225)

```js
const underlineY = fs * lh * 0.92  // 92% de la ligne
```

Les jambages descendent à ~110–120% du fontSize depuis le haut de la ligne. La position à 92% de `lineHeight` traverse ces jambages.

Le rendu Dashboard (CSS `text-decoration: underline`) positionne l'underline sous la ligne de base, après les descendants — conforme aux standards typographiques. Voilà pourquoi le dashboard est correct mais pas le canvas.

---

### Bug indépendant B — Étirement horizontal pendant resize latéral

Konva applique `scaleX` au nœud texte pendant le drag de la poignée latérale. Le texte est visuellement étiré jusqu'au `transformend`, où le scale est remis à 1 et `width`/`fontSize` sont mis à jour dans le store.

Pour les textes avec runs, les segments (siblings) ne suivent pas le scale Konva → écart visuel plus important.

---

## 3. Architecture cible

### Solution court-terme (Sessions 1–4) : patcher les builders

Sans refonte structurelle, on peut patcher les problèmes en :
1. Empêchant le blur de la textarea lors des clics ContextBar (`@mousedown.prevent`)
2. Faisant lire `liveDragPos` aux builders de segments

### Solution long-terme (Session 5, optionnelle) : v-group par élément texte

La solution architecturale propre est d'encapsuler chaque élément texte dans un `v-group`. Le Transformer s'attache au groupe → drag/scale/rotate se propagent automatiquement à tous les nœuds enfants.

```
v-group (draggable, events → el)
  ├── v-text (main, x=0, y=0, invisible si runs)
  ├── v-text × N (segments, x=cursorX, y=0)
  └── v-line × M (underlines, coordonnées relatives)
```

**Risque :** Le Transformer Konva sélectionne actuellement les nœuds par leur `id` (le nœud principal). Ce mécanisme doit être adapté pour cibler les groupes. C'est un chantier significatif.

---

## 4. Roadmap multi-sessions

---

### Session 1 — Fix critique : ContextBar + textarea blur

**Bugs résolus :** 1, 2, 6, 8, 9  
**Durée estimée :** 1h  
**Risque :** Faible  
**Fichiers :** [`src/components/editor/contextbar/ContextBarText.vue`](../src/components/editor/contextbar/ContextBarText.vue)

#### 1.1 — `@mousedown.prevent` sur les boutons de formatage

Ajouter sur **tous** les boutons susceptibles d'être cliqués pendant une édition inline :
- Bold, Italic, Underline
- Alignement (left / center / right)
- Taille (+/-)
- Déclencheur du color picker

```html
<!-- Avant -->
<button @click="toggleBold">B</button>

<!-- Après -->
<button @mousedown.prevent @click="toggleBold">B</button>
```

`@mousedown.prevent` empêche le `blur` de la textarea → `textEditState` reste intact → `activeRunSelection()` retourne la plage correcte quand `click` s'exécute.

#### 1.2 — Refactoriser `isBold`, `isItalic`, `isUnderline`

Ajouter un helper (dans `textRuns.js` ou inline) :

```js
// Retourne true si TOUS les caractères [start, end) ont le flag dans leurs runs
function isRunFlagOnRange(runs, start, end, flag) {
  if (!runs?.length || start >= end) return false
  for (let i = start; i < end; i++) {
    if (!runs.some(r => r.start <= i && r.end > i && r[flag])) return false
  }
  return true
}
```

Puis mettre à jour les computed :

```js
const isBold = computed(() => {
  const runSel = activeRunSelection()
  if (runSel && sel.value?.runs?.length) {
    return isRunFlagOnRange(sel.value.runs, runSel.start, runSel.end, 'bold')
  }
  return sel.value?.fontStyle?.includes('bold') ?? false
})

const isItalic = computed(() => {
  const runSel = activeRunSelection()
  if (runSel && sel.value?.runs?.length) {
    return isRunFlagOnRange(sel.value.runs, runSel.start, runSel.end, 'italic')
  }
  return sel.value?.fontStyle?.includes('italic') ?? false
})

const isUnderline = computed(() => {
  const runSel = activeRunSelection()
  if (runSel && sel.value?.runs?.length) {
    return isRunFlagOnRange(sel.value.runs, runSel.start, runSel.end, 'underline')
  }
  return sel.value?.textDecoration?.includes('underline') ?? false
})
```

#### Vérification Session 1
- Sélectionner "an" dans "manger" → cliquer **B** → bouton s'active, texte change immédiatement dans l'éditeur
- Recliquer **B** avec même sélection → toggle off, texte revient normal
- Sélectionner "er" sans fermer la textarea → **I** s'applique sans reset de la sélection
- Appliquer underline partiel → color picker du souligné apparaît dans la ContextBar
- Modifier la couleur du souligné → s'applique sur la portion sélectionnée

---

### Session 2 — Fix dynamisme canvas : drag, resize, rotation

**Bugs résolus :** 3, 4, 5  
**Durée estimée :** 1.5h  
**Risque :** Moyen (EditorCanvas.vue est un fichier de ~3400 lignes)  
**Fichiers :** [`src/components/editor/EditorCanvas.vue`](../src/components/editor/EditorCanvas.vue)

#### 2.1 — `buildTextSegmentConfigs` : lire `liveDragPos`

```js
function buildTextSegmentConfigs(el) {
  if (!hasRuns(el)) return []
  const live = liveDragPos[el.id]                          // ← nouveau
  const baseX = live?.x ?? el.x                            // ← nouveau
  const baseY = live?.y ?? el.y                            // ← nouveau
  const liveRot = live?.rotation ?? el.rotation ?? 0       // ← nouveau

  // ... (calculs segments inchangés) ...

  configs.push({
    x: baseX + cursorX,   // ← était el.x + cursorX
    y: baseY,              // ← était el.y
    rotation: liveRot,     // ← nouveau (était el.rotation || 0)
    // ... reste inchangé
  })
}
```

#### 2.2 — `buildTextSegmentUnderlineConfigs` : lire `liveDragPos`

```js
function buildTextSegmentUnderlineConfigs(el) {
  const segs = buildTextSegmentConfigs(el)   // hérite déjà de live via 2.1
  if (!segs.length) return []
  const live = liveDragPos[el.id]            // ← nouveau
  const baseX = live?.x ?? el.x             // ← nouveau
  const baseY = live?.y ?? el.y             // ← nouveau
  // ...
  out.push({
    x: baseX,              // ← était el.x
    y: baseY,              // ← était el.y
    // ...
  })
}
```

#### 2.3 — Stocker `rotation` dans `liveDragPos` pendant la rotation

Localiser le handler de rotation live (chercher `textRotateState` ou `onTextRotateMove`) et ajouter :

```js
// Dans le handler de rotation live
liveDragPos[el.id] = {
  ...(liveDragPos[el.id] || {}),
  x: node.x(),
  y: node.y(),
  rotation: node.rotation(),   // ← nouveau
}
```

#### Vérification Session 2
- Texte partiellement stylé → drag → segments et underlines suivent en temps réel
- Resize poignée latérale → segments se repositionnent live (pas de saut à la fin)
- Rotation via handle → segments tournent en synchronisation avec la rotation

---

### Session 3 — Fix Dashboard

**Bugs résolus :** 7  
**Durée estimée :** 30 min  
**Risque :** Faible  
**Fichiers :** [`src/components/BusinessCard.vue`](../src/components/BusinessCard.vue)

#### 3.1 — Passer `globalStyle` à `segmentize`

```js
// Avant (ligne ~665)
const textSegments = (el) => {
  if (!el.runs?.length) return null
  return segmentize(el.text || '', el.runs)
}

// Après
const textSegments = (el) => {
  if (!el.runs?.length) return null
  const globalStyle = {
    bold: (el.fontStyle || '').includes('bold'),
    italic: (el.fontStyle || '').includes('italic'),
    underline: (el.textDecoration || '').includes('underline'),
    color: el.fill || '#000000',
    underlineColor: el.underlineColor || '',
  }
  return segmentize(el.text || '', el.runs, globalStyle)
}
```

#### 3.2 — Corriger `segmentStyle`

```js
// Avant
fontWeight: seg.style.bold ?? el.bold ? 'bold' : 'normal',
fontStyle: seg.style.italic ?? el.italic ? 'italic' : 'normal',

// Après
// (globalStyle dans segmentize garantit que seg.style hérite du global pour les segments non couverts)
fontWeight: seg.style.bold ? 'bold' : 'normal',
fontStyle: seg.style.italic ? 'italic' : 'normal',
```

#### Vérification Session 3
- Texte global bold + run couleur sur une partie → dashboard affiche tout le texte en bold, avec couleur partielle
- Texte global italic + run underline → dashboard cohérent
- Export PNG exporté via `cardExporter.js` → identique au canvas éditeur (déjà correct côté export, vérification de régression uniquement)

---

### Session 4 — Fix bugs indépendants

**Bugs résolus :** A (souligné/jambages), B (étirement resize)  
**Durée estimée :** 1h  
**Risque :** Faible pour A, Moyen pour B  
**Fichiers :** [`src/components/editor/EditorCanvas.vue`](../src/components/editor/EditorCanvas.vue)

#### 4.1 — Bug A : Underline Y offset pour les jambages

Localiser toutes les occurrences de `underlineY` (3 endroits : `buildTextSegmentUnderlineConfigs`, `buildTextUnderlineConfigs` fallback, `buildTextUnderlineConfigs` normal) :

```js
// Avant
const underlineY = fs * lh * 0.92

// Après — positionnement sous la ligne de base, pas dans les jambages
const underlineY = fs + Math.max(1, Math.round(fs * 0.1))
// ≈ fontSize × 1.1 depuis le haut → sous la ligne de base standard
```

> **Note :** La valeur exacte doit être testée visuellement avec les lettres 'j', 'g', 'p', 'q', 'y' à 14px, 24px, 48px. Ajuster si nécessaire. La correspondance avec le dashboard HTML (`text-decoration: underline`) est la référence.

#### 4.2 — Bug B : Étirement resize latéral

Dans `onTextTransform`, pour les poignées latérales (middle-left / middle-right), mettre à jour le width en temps réel plutôt que de laisser Konva étirer le nœud :

```js
// Dans onTextTransform, branche side handles (scaleY ≈ 1)
const newWidth = Math.max(10, node.width() * node.scaleX())
node.scaleX(1)         // reset scale → plus d'étirement visuel
node.width(newWidth)   // appliquer la nouvelle largeur directement
// Mettre à jour le store sans commit (pas d'undo ici)
editorStore.updateElement(el.id, { width: newWidth })
// Mettre à jour liveDragPos pour que les builders utilisent la bonne largeur
liveDragPos[el.id] = { ...(liveDragPos[el.id] || {}), x: node.x(), width: newWidth }
```

`onTransformEnd` continue de committer la valeur finale avec `saveHistory()`.

> **Attention :** Tester aussi le resize via les boutons +/- de la ContextBar pour s'assurer qu'il n'y a pas de régression sur ces interactions.

#### Vérification Session 4
- "Ajouter un titre" entièrement souligné → le 'j' visible sans coupure par la ligne
- Même test à 14px, 24px, 48px et avec 3 polices différentes
- Dashboard et canvas cohérents pour le positionnement du souligné
- Resize poignée droite → texte reflue dans la nouvelle largeur sans étirement

---

### Session 5 — Architecture v-group (optionnelle)

**Durée estimée :** 3h+  
**Risque :** Élevé  
**Prérequis :** Sessions 1–4 validées et stables en production

Si les corrections des sessions 1–4 révèlent des cas limites persistants (multi-ligne avec runs, rotation + scale combinés, etc.), envisager la refonte `v-group`.

Chaque élément texte devient :
```html
<v-group
  :config="{ id: el.id + '-group', x: el.x, y: el.y, rotation: el.rotation, draggable: !el.locked }"
  @click="onElementClick($event, el)"
  @dragend="onDragEnd($event, el)"
  @transformend="onTransformEnd($event, el)"
>
  <!-- main text à x=0, y=0 (coordonnées relatives au groupe) -->
  <v-text :config="buildTextConfig(el, { x: 0, y: 0 })" />
  <!-- segments à x=cursorX, y=0 -->
  <v-text v-for="seg in buildTextSegmentConfigs(el, { baseX: 0, baseY: 0 })" />
  <!-- underlines à coordonnées relatives -->
  <v-line ... />
</v-group>
```

**Points d'attention :**
- Le Transformer Konva doit cibler le groupe, pas le nœud texte principal
- Le système de sélection multi-éléments (`selectedIds` + Transformer) doit être adapté
- `syncTextRenderedDims` lit les dimensions du nœud Konva via son `id` — doit utiliser le groupe ou le nœud texte interne

**Ce chantier nécessite un plan dédié avant exécution.**

---

## 5. Zones à risque

| Zone | Risque | Mitigation |
|------|--------|-----------|
| `@mousedown.prevent` sur tous les boutons ContextBar | Moyen — risque de casser le focus d'autres contrôles (inputs, sliders) | Tester chaque champ interactif de la ContextBar après la modification |
| `liveDragPos` dans les builders de segments | Moyen — réactivité frame-par-frame avec Pinia reactive | Vérifier que `buildTextSegmentConfigs` re-calcule à chaque frame de drag |
| `updateElement` sans commit dans resize live | Faible — peut générer des entrées undo vides si mal placé | S'assurer que seul `updateElementCommit` est appelé dans `onTransformEnd` |
| Underline Y offset | Faible — impact visuel uniquement | Tester sur 5+ polices et 3+ tailles avant de valider |
| `BusinessCard.vue` segmentize globalStyle | Faible — `cardExporter.js` est déjà correct, régression peu probable | Re-tester export après Session 3 |
| Session 5 (v-group) | Élevé — refonte profonde d'EditorCanvas.vue | Obligatoire : plan mode complet avant exécution |

---

## 6. Checklist progressive

### Session 1 + 1.5 — ContextBar + overlay textarea ✅ implémentées
- [x] `@mousedown.prevent` sur bouton **Bold**
- [x] `@mousedown.prevent` sur bouton **Italic**
- [x] `@mousedown.prevent` sur bouton **Underline**
- [x] `@mousedown.prevent` sur boutons **Alignement** (left/center/right)
- [x] `@mousedown.prevent` sur boutons **Taille** (+/-)
- [x] `@mousedown.prevent` sur labels **color picker** fill et underline
- [x] `isBold` lit les runs sur la plage active
- [x] `isItalic` lit les runs sur la plage active
- [x] `isUnderline` lit les runs sur la plage active
- [x] Color picker du souligné visible quand un run underline est actif
- [x] `editingEl` calculé par ID (jamais stale après `updateElement`)
- [x] Watcher `editingText` → sync temps réel texte+runs dans le store
- [x] Textarea transparente quand runs actifs (`color: transparent`, `caretColor`)
- [x] Segments Konva visibles pendant l'édition (opacity non masquée)
- [x] `finishTextEdit` utilise l'élément live (runs toujours à jour)
- [x] Styles visibles pendant édition + toggle ON/OFF — **validé session 1**
- [x] Color picker souligné reste ouvert — **validé session 1**

### Session 2 — Dynamisme canvas
- [x] `buildTextSegmentConfigs` lit `liveDragPos` pour x/y
- [x] `buildTextSegmentConfigs` lit `liveDragPos` pour rotation
- [x] `buildTextSegmentUnderlineConfigs` lit `liveDragPos` pour x/y
- [x] `liveDragPos` stocke `rotation` pendant la rotation live
- [x] Drag d'un texte avec runs → segments suivent en temps réel — **validé**
- [x] Rotation → segments tournent en synchronisation — **validé**
- [x] Resize side (poignée latérale) → text wrap, minWidth 20px, fontSize fixe
- [x] Resize corner (poignée diagonale) → scale proportionnel fontSize + width, segments en sync, reset scaleX immédiat, top-anchor y-compensation
- [x] Resize corner runs → segments scalent en synchronisation — **validé session 2.5**
- [x] Resize side simple → pas d'effondrement sous 20px — **validé session 2.5**
- [x] Resize side runs → bounding box hauteur suit le reflow en temps réel — **validé session 2.5**
- [x] Resize side runs → word-wrap + char-wrap si mot > containerW (parité texte non stylé) — **validé session 2.5**

### Session 3 — Dashboard (textSegments globalStyle)
- [x] `textSegments()` passe `globalStyle` à `segmentize`
- [x] `segmentStyle()` utilise `seg.style.bold` (plus `el.bold`)
- [x] `segmentStyle()` utilise `seg.style.italic` (plus `el.italic`)
- [x] Texte global bold + run couleur → dashboard cohérent avec le canvas
- [x] Export PNG cohérent avec canvas (vérification de régression)

### Sessions 3.1–3.3 — Corrections & Privacy Guard ✅ implémentées

**Session 3.1 — Bug : couleur globale bloquée par run colors**
- [x] `updSolidFill` et `commitSolidFill` dans `EditorContextBar.vue` nettoient les `color` dans les runs avant d'appliquer la couleur globale (`_withRunColorsCleaned`)

**Session 3.2 — Bug : asymétrie recto/verso rich text (Dashboard)**
- [x] Verso `BusinessCard.vue` : bloc contact → `textSegments(el)` + `segmentStyle(el, seg)` (parité recto)
- [x] Verso `BusinessCard.vue` : bloc text (`<component>`) → idem

**Session 3.2.1 — Privacy Guard (logique)**
- [x] `EditorTopBar.vue` : garde dans `saveAsTemplate` — toast si champ Info stylé + isPublic
- [x] `userTemplatesStore.js` : garde dans `toggleTemplateVisibility` — throw si champ Info stylé

**Session 3.3 — Privacy Guard (UI/UX enrichi)**
- [x] `src/utils/cardElements.js` : export `CONTACT_ROLES` + `hasStyledInfoFields(elements)`
- [x] `tailwind.config.js` : keyframe `shake` + `animate-shake`
- [x] `SaveAsModal.vue` : prop `privacyConflict`, erreur inline orange avec `animate-shake`, bouton Enregistrer disabled
- [x] `EditorTopBar.vue` : computed `savePrivacyConflict` → prop `:privacy-conflict`, suppression du toast inline
- [x] `userTemplatesStore.js` : import `CONTACT_ROLES` + `hasStyledInfoFields` depuis utils (cleanup)
- [x] `PrivacyBlockModal.vue` : nouveau composant modal 🛡️ avec bouton "Modifier le modèle"
- [x] `DashboardView.vue` : intercept avant store, ouvre `PrivacyBlockModal` si conflit détecté

### Session 4 — Bugs indépendants
- [x] Underline Y : 'j' non coupé à 14px
- [x] Underline Y : 'j' non coupé à 24px
- [x] Underline Y : 'j' non coupé à 48px
- [x] Underline Y : testé sur Inter, Poppins, et une police serif
- [x] Dashboard et canvas : underline au même niveau
- [x] Resize latéral : pas d'étirement du texte pendant le drag
- [x] Poignée gauche : comportement correct (texte centré par défaut)

---

## 7. Configuration Claude Code par session

### Sessions 1–3 (corrections ciblées, risque faible/moyen)

```
Instruction d'ouverture :
"Session [N] stabilisation rich-text.
Lire docs/rich-text-stabilization-roadmap.md section Session [N].
Appliquer UNIQUEMENT les changements listés dans cette section.
Ne pas refactoriser, ne pas réorganiser le code voisin.
Tester visuellement avant de valider."

Fichiers à charger :
- src/utils/textRuns.js
- src/components/editor/contextbar/ContextBarText.vue  (Session 1)
- src/components/editor/EditorCanvas.vue               (Sessions 2, 4)
- src/components/BusinessCard.vue                      (Session 3)
```

### Session 4 (bugs indépendants)

```
Instruction :
"Session 4 — Corriger le souligné/jambages ET le stretch resize.
Corriger Bug A en premier, tester visuellement, puis Bug B.
Ajuster la constante underlineY empiriquement.
Ne pas modifier onTransformEnd."
```

### Session 5 (architecture v-group, optionnelle)

```
MODE : Plan mode obligatoire avant toute modification de code.

Instruction :
"Session 5 — Refonte v-group pour EditorCanvas.vue.
Analyser d'abord l'impact sur :
  1. Le Transformer Konva (sélection par id)
  2. Le système multi-sélection (selectedIds)
  3. syncTextRenderedDims (lecture des dimensions Konva)
  4. Les event listeners drag/transform
Proposer un plan complet avant de modifier quoi que ce soit."
```

---

## 8. Résumé des fichiers critiques

| Fichier | Rôle | Sessions |
|---------|------|---------|
| [`src/components/editor/contextbar/ContextBarText.vue`](../src/components/editor/contextbar/ContextBarText.vue) | Boutons formatage, state actif, color picker | **1** |
| [`src/components/editor/EditorCanvas.vue`](../src/components/editor/EditorCanvas.vue) | Builders segments, drag/resize/rotation, textarea overlay | **2, 4** |
| [`src/components/BusinessCard.vue`](../src/components/BusinessCard.vue) | Rendu dashboard des textes avec runs | **3** |
| [`src/utils/textRuns.js`](../src/utils/textRuns.js) | Helpers runs (ajout `isRunFlagOnRange`) | **1** (helper) |
| [`src/utils/cardExporter.js`](../src/utils/cardExporter.js) | Export PNG/PDF — déjà correct | Vérification |
| [`src/stores/useEditorStore.js`](../src/stores/useEditorStore.js) | `livePosState`, `textEditState` | Référence |
