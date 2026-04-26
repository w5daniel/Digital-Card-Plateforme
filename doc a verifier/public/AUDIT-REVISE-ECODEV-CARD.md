# 🔍 AUDIT RÉVISÉ - ECODEV-CARD (digital-card-platform)
## Rapport Corrigé & Complet — Intégrant le Concept Central du Projet

**Date:** 3 Avril 2026
**Version:** 2.0 (révision de l'audit initial)
**Projet:** digital-card-platform v0.0.0
**Statut:** MVP fonctionnel — LocalStorage uniquement (aucun backend)

---

## ⚠️ ERRATUM — CE QUE L'AUDIT V1 A MANQUÉ

L'audit initial (v1) a décrit ECODEV-CARD comme un « éditeur de cartes de visite en ligne, SaaS style Canva ». Cette description est **incomplète et trompeuse**. Elle passe à côté du **concept central** qui fonde toute la valeur métier du produit.

**Ce qui a été manqué :**

ECODEV-CARD repose sur une **distinction fondamentale entre deux objets** :

| | Modèle (Template) | Carte de visite |
|---|---|---|
| **Nature** | Un design réutilisable — le « moule » | Un document final avec les vraies infos d'une personne |
| **Contient** | Mise en page, couleurs, polices, formes, logo, positions des champs | Les mêmes éléments visuels + les données personnelles réelles |
| **Créé depuis** | L'éditeur → bouton « Enregistrer comme modèle » | Un modèle existant → on remplit les infos personnelles |
| **Stocké dans** | Dashboard → section « Mes Modèles » | Dashboard → section « Mes Cartes de Visite » |
| **Réutilisable ?** | ✅ Oui — génère autant de cartes que souhaité | ❌ Non — c'est un produit fini, propre à une personne |

**Le flux utilisateur central :**

```
1. Éditeur → L'utilisateur crée un design
                    ↓
2. Bouton "Enregistrer" → Popup : "Enregistrer comme..."
    ├── 📐 "Modèle"  → Sauvegardé dans Dashboard > "Mes Modèles"
    └── 💳 "Carte"   → Sauvegardé dans Dashboard > "Mes Cartes de Visite"
                    ↓
3. Dashboard > "Mes Modèles" → Cliquer sur un modèle → "Créer une carte"
    ├── Manuellement   → Remplir les infos d'UNE personne  → 1 carte créée
    └── Import Excel   → Uploader un fichier avec N personnes → N cartes créées
```

**Le cas d'usage fondateur (le « boss use case ») :**

Le patron d'ECODEV veut équiper ses 50 employés de cartes de visite :
1. Il crée **1 seul modèle** dans l'éditeur (logo, couleurs, mise en page)
2. Il l'enregistre comme **« Modèle »**
3. Dans « Mes Modèles », il clique sur ce modèle
4. Il importe un **fichier Excel** contenant Nom, Prénom, Poste, Email, Téléphone de chaque employé
5. Le système **génère automatiquement 50 cartes**, toutes avec le même design mais des infos différentes
6. Les 50 cartes apparaissent dans **« Mes Cartes de Visite »**

**Pourquoi c'est critique pour l'audit :**

Cette distinction Modèle/Carte impacte TOUTE l'architecture :
- Le **modèle de données** (deux entités distinctes avec une relation parent-enfant)
- Le **Dashboard** (deux sections séparées, pas une seule)
- Le **système de champs** (les champs du modèle sont des placeholders, ceux de la carte sont des valeurs réelles)
- Le **flux de sauvegarde** de l'éditeur (choix explicite modèle vs carte)
- Le **batch import** (génération en masse depuis un modèle)
- La **base de données** (tables distinctes, relations FK)
- Les **limites de plan** (limites sur les modèles ET sur les cartes)
- L'**export** (on exporte des cartes, pas des modèles)

---

## 📊 STATISTIQUES DU PROJET

```
Total fichiers source : 54 fichiers Vue/JS
Taille code source    : 1.3 MB
Total lignes de code  : 33,184 lignes

Top 10 fichiers les plus volumineux :
 1. EditorLeftSidebar.vue  : 3,836 lignes  ⚠️ TRÈS GROS
 2. EditorCanvas.vue       : 2,312 lignes  ⚠️ CRITIQUE
 3. iconLibrary.js         : 2,039 lignes
 4. DashboardView.vue      : 1,834 lignes
 5. EditorContextBar.vue   : 1,440 lignes
 6. elementLibrary.js      : 1,411 lignes
 7. googleFonts.js         : 1,312 lignes
 8. UserProfileView.vue    : 1,224 lignes
 9. EditorTopBar.vue       : 1,073 lignes
10. templateLayouts.js     : 1,058 lignes
```

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack Technologique

```json
{
  "frontend": {
    "framework": "Vue 3.5.27 (Composition API)",
    "routing": "Vue Router 5.0.1",
    "state": "Pinia 3.0.4",
    "canvas": "Konva 10.2.1 + vue-konva 3.4.0",
    "styling": "Tailwind CSS 3.4.19 + DaisyUI 5.5.19",
    "icons": "@iconify/vue 5.0.0 + lucide-vue-next 0.563.0",
    "build": "Vite 7.3.1"
  },
  "features": {
    "qr": "qr-code-styling 1.9.2",
    "fonts": "webfontloader 1.6.28",
    "export": "jspdf 4.2.0 ⚠️ + html-to-image 1.11.13",
    "excel": "xlsx 0.18.5",
    "uuid": "uuid 13.0.0"
  },
  "backend": "❌ AUCUN — 100% localStorage",
  "database": "❌ AUCUNE — localStorage only"
}
```

---

## 🧠 CONCEPT CENTRAL : MODÈLE vs CARTE

### Schéma du Dashboard cible

```
Dashboard actuel :               Dashboard futur (correct) :
┌───────────────────────┐        ┌───────────────────────┐
│  Statistiques         │        │  Statistiques         │
├───────────────────────┤        ├───────────────────────┤
│  Mes Cartes           │        │  Mes Modèles    [NEW] │
│  - carte 1            │        │  - modèle A           │
│  - carte 2            │        │  - modèle B           │
│  - carte 3            │        ├───────────────────────┤
│                       │        │  Mes Cartes           │
│                       │        │  - carte 1 (modèle A) │
│                       │        │  - carte 2 (modèle A) │
│                       │        │  - carte 3 (modèle B) │
└───────────────────────┘        └───────────────────────┘
```

### Modèle de données conceptuel

```
┌──────────────────────┐         ┌──────────────────────┐
│      MODÈLE          │         │   CARTE DE VISITE    │
│  (le moule)          │ 1 → N   │   (produit fini)     │
├──────────────────────┤────────→├──────────────────────┤
│ id                   │         │ id                   │
│ ownerId              │         │ ownerId              │
│ name                 │         │ name                 │
│ editorData           │         │ templateModelId (FK) │
│  ├─ elements         │         │ editorData (hérité)  │
│  ├─ backgrounds      │         │ personalData         │
│  ├─ fieldConfig      │         │  ├─ firstName        │
│  │   ├─ standard[]   │         │  ├─ lastName         │
│  │   └─ custom[]     │         │  ├─ title            │
│  ├─ cardWidth/Height │         │  ├─ email            │
│  └─ orientation      │         │  ├─ phone            │
│ isPublic             │         │  ├─ website          │
│ createdAt            │         │  └─ customFields[]   │
│                      │         │ isPublic             │
│ ACTIONS :            │         │ views / downloads    │
│ → Créer carte (×1)   │         │ qrScans / shares     │
│ → Import Excel (×N)  │         │ createdAt            │
│ → Modifier design    │         │                      │
│ → Partager           │         │ ACTIONS :            │
└──────────────────────┘         │ → Exporter PNG/PDF   │
                                 │ → Partager (lien)    │
                                 │ → Modifier infos     │
                                 │ → Voir QR code       │
                                 └──────────────────────┘
```

### Flux de génération de cartes depuis un modèle

```
                    ┌─────────────────────┐
                    │   Modèle existant   │
                    │   (editorData +     │
                    │    fieldConfig)      │
                    └──────┬──────────────┘
                           │
              ┌────────────┼────────────┐
              ▼                         ▼
    ┌──────────────────┐     ┌──────────────────────┐
    │ Création manuelle│     │  Import Excel (batch) │
    │ Formulaire avec  │     │  Fichier .xlsx avec   │
    │ les champs du    │     │  colonnes mappées aux │
    │ fieldConfig      │     │  champs du fieldConfig│
    └──────┬───────────┘     └──────────┬───────────┘
           │                            │
           ▼                            ▼
    ┌──────────────┐          ┌──────────────────┐
    │  1 carte     │          │  N cartes        │
    │  générée     │          │  générées        │
    └──────────────┘          └──────────────────┘
           │                            │
           └──────────┬─────────────────┘
                      ▼
            ┌──────────────────┐
            │ "Mes Cartes de   │
            │  Visite" dans    │
            │  le Dashboard    │
            └──────────────────┘
```

### Rôle du fieldConfig dans le modèle

Le `fieldConfig` est la clé de voûte du système Modèle → Carte. Il définit quels champs de données personnelles le modèle attend :

```javascript
fieldConfig: {
  activeStandardFields: [
    // Champs standards activés pour CE modèle
    { role: 'firstName', label: 'Prénom' },
    { role: 'lastName',  label: 'Nom' },
    { role: 'title',     label: 'Poste' },
    { role: 'email',     label: 'Email' },
    { role: 'phone',     label: 'Téléphone' },
    { role: 'company',   label: 'Entreprise' },
    { role: 'website',   label: 'Site web' },
    { role: 'address',   label: 'Adresse' }
  ],
  customFields: [
    // Champs personnalisés ajoutés par le créateur
    { id: 'cf1', label: 'Matricule', value: '' },
    { id: 'cf2', label: 'Département', value: '' }
  ]
}
```

Quand une carte est générée depuis ce modèle :
- Chaque élément texte ayant un `role` (ex: `role: 'firstName'`) est remplacé par la valeur réelle de la personne
- Les éléments visuels sans rôle (formes, images, logo) restent identiques
- Le QR code est régénéré avec les vraies données de contact

### Mapping Excel → Champs

Lors de l'import Excel pour la génération batch :

```
Colonnes Excel          →    fieldConfig.activeStandardFields
─────────────────────        ───────────────────────────────
Prénom                  →    role: 'firstName'
Nom                     →    role: 'lastName'
Poste                   →    role: 'title'
Email                   →    role: 'email'
Téléphone               →    role: 'phone'
(colonnes custom)       →    fieldConfig.customFields[].label
```

---

## 📁 STRUCTURE DU PROJET

```
src/
├── main.js                      # Point d'entrée
├── App.vue                      # Root component
│
├── router/
│   └── index.js                 # 15 routes + guards admin/auth
│
├── stores/                      # Pinia (8 stores)
│   ├── authStore.js             # Auth + users + admin (534 lignes)
│   ├── cards.js                 # Cards CRUD + templates (806 lignes)
│   ├── useEditorStore.js        # Editor state + elements + history (917 lignes)
│   ├── userTemplatesStore.js    # ⭐ User custom templates/modèles (357 lignes)
│   ├── fontStore.js             # Google Fonts loader (378 lignes)
│   ├── brandKit.js              # Brand colors/logos
│   ├── themeStore.js            # Dark mode toggle
│   ├── adminStore.js            # Admin settings
│   └── notificationStore.js     # Toast notifications
│
├── views/                       # Pages (11 views)
│   ├── HomeView.vue             # Landing page
│   ├── AuthView.vue             # Login/Register
│   ├── GalleryView.vue          # Templates publics (852 lignes)
│   ├── DashboardView.vue        # ⭐ Mes Modèles + Mes Cartes (1,834 lignes)
│   ├── EditorView.vue           # Editor orchestrator (392 lignes)
│   ├── ShareView.vue            # Public card sharing
│   ├── PricingView.vue          # Premium plans
│   ├── UserProfileView.vue      # User settings (1,224 lignes)
│   └── admin/                   # 5 admin views
│
├── components/
│   ├── NavBar.vue               # Top navigation (712 lignes)
│   ├── FooterBar.vue            # Footer
│   ├── BusinessCard.vue         # Card preview component (750 lignes)
│   ├── ToastNotification.vue    # Toast system
│   ├── BatchCreateModal.vue     # ⭐ Batch card creation via Excel (626 lignes)
│   ├── ConfirmModal.vue         # Confirmation dialogs
│   ├── CreateCardFromTemplateModal.vue  # ⭐ Création carte depuis modèle
│   │
│   └── editor/                  # 7 editor components (9,786 lignes)
│       ├── EditorCanvas.vue     # Konva stage (2,312 lignes)
│       ├── EditorLeftSidebar.vue# Tools panel (3,836 lignes)
│       ├── EditorTopBar.vue     # Top bar (1,073 lignes)
│       ├── EditorContextBar.vue # Element properties (1,440 lignes)
│       ├── EditorBottomBar.vue  # Zoom + layers
│       ├── EditorContextMenu.vue# Right-click menu
│       └── SaveAsModal.vue      # ⭐ Choix "Modèle" ou "Carte"
│
├── utils/
│   ├── cardElements.js          # Element factory functions
│   ├── cardExporter.js          # Export PNG/PDF/JPG (433 lignes)
│   ├── templateLayouts.js       # Template builder (1,058 lignes)
│   ├── gradientHelpers.js       # CSS gradient → Konva
│   └── qrCodeHelper.js          # QR code generation
│
├── data/                        # Static data (7,387 lignes)
│   ├── mockData.js              # Templates + admin config
│   ├── iconLibrary.js           # Icon collections
│   ├── illustrationLibrary.js   # Undraw illustrations
│   ├── stickerLibrary.js        # Stickers
│   ├── elementLibrary.js        # Preset elements
│   └── googleFonts.js           # Google Fonts list
│
└── layouts/
    └── AdminLayout.vue          # Admin panel layout
```

**Composants-clés pour le concept Modèle/Carte :**
- `SaveAsModal.vue` — choix entre sauvegarder comme Modèle ou comme Carte
- `userTemplatesStore.js` — gestion des modèles utilisateur (CRUD)
- `BatchCreateModal.vue` — import Excel + génération en masse
- `CreateCardFromTemplateModal.vue` — création d'une carte depuis un modèle (manuelle)
- `DashboardView.vue` — affichage des deux sections (Modèles + Cartes)

---

## 🔄 FLUX DE DONNÉES

### 1. AUTHENTIFICATION (authStore.js)

```
localStorage keys :
├── 'authToken'                    → Mock JWT token
├── 'user'                         → User object JSON
├── 'digitalcard_allUsers'         → Global user registry
└── 'userProfilePhoto_{email}'     → Profile photos

⚠️ Aucune sécurité réelle — tout est côté client
```

### 2. MODÈLES UTILISATEUR (userTemplatesStore.js) — ⭐ NOUVEAU

```
localStorage keys :
├── 'digitalcard_userTemplates_{email}'  → Array des modèles utilisateur

Modèle Object :
{
  id: Number,
  name: String,
  ownerId: String (email),
  editorData: {
    elements: { recto: [], verso: [] },
    backgrounds: { recto: String, verso: String },
    fieldConfig: {
      activeStandardFields: [...],
      customFields: [...]
    },
    cardWidth: Number,
    cardHeight: Number,
    orientation: String
  },
  isPublic: Boolean,
  createdAt: String (ISO)
}

Flux :
1. Éditeur → SaveAsModal → "Enregistrer comme Modèle"
2. userTemplatesStore.addTemplate(templateData)
3. Sauvegardé dans localStorage
4. Apparaît dans Dashboard > "Mes Modèles"
5. Clic sur modèle → Choix création manuelle ou batch Excel
```

### 3. CARTES DE VISITE (cards.js)

```
localStorage keys :
├── 'digitalcard_userCards_{email}'       → User's cards array
├── 'digitalcard_public_{cardId}'         → Public card snapshots
└── ... (admin overrides)

Card Object :
{
  id: Number (Date.now()),                ⚠️ COLLISION RISK
  name: String,
  template: String (slug),
  templateModelId: Number | null,          // ⭐ Lien vers le modèle parent
  ownerId: String (email),
  createdAt: String (ISO),
  views: Number,
  downloads: Number,
  qrScans: Number,
  shares: Number,
  isPublic: Boolean,
  data: {
    editorData: Object,                    // Design hérité du modèle
    elements: Array,                       // (legacy)
    versoElements: Array,                  // (legacy)
    backgrounds: { recto, verso },
    cardWidth: Number,
    cardHeight: Number,
    orientation: String,
    fieldConfig: Object,                   // ⭐ Config champs héritée du modèle
    contactExtra: Array                    // (legacy)
  }
}

⭐ Relation Modèle → Carte :
- templateModelId pointe vers le modèle parent
- editorData est une COPIE du modèle avec les valeurs réelles injectées
- fieldConfig est conservé pour savoir quels champs sont utilisés
```

### 4. GÉNÉRATION BATCH (BatchCreateModal.vue) — ⭐ FLUX CENTRAL

```
Étapes :
1. User sélectionne un modèle dans "Mes Modèles"
2. Clic "Créer des cartes" → BatchCreateModal s'ouvre
3. User uploade un fichier Excel (.xlsx)
4. Parsing via xlsx library :
   - Lecture des colonnes (Prénom, Nom, Poste, Email, etc.)
   - Mapping automatique ou manuel vers fieldConfig
5. Pour chaque ligne du Excel :
   a. Clone l'editorData du modèle
   b. Remplace chaque élément texte ayant un role par la valeur réelle
   c. Régénère le QR code avec les nouvelles données
   d. Crée une nouvelle carte avec templateModelId = modèle.id
   e. Sauvegarde dans cardsStore
6. Toutes les cartes apparaissent dans "Mes Cartes de Visite"

⚠️ Points critiques batch :
- Performance : Génération de 50+ cartes en série (pas de Web Workers)
- Mémoire : Clonage de l'editorData pour chaque carte (images en base64)
- Validation : Vérification des champs requis par ligne Excel
- Erreurs : Gestion des lignes invalides (email manquant, etc.)
```

### 5. ÉDITEUR (useEditorStore.js + EditorCanvas.vue)

```
Core State :
├── editMode: 'new' | 'edit-template' | 'edit-card' | 'edit-gallery-template'
│              ⭐ Modes distincts selon qu'on édite un modèle ou une carte
├── elements: { recto: [], verso: [] }
├── backgrounds: { recto: String, verso: String }
├── fieldConfig: { activeStandardFields: [], customFields: [] }
├── selectedIds: String[]
├── history: Snapshot[] (max 50)
└── ... (zoom, grid, snap, etc.)

⭐ Comportement selon editMode :
- 'new'                  → Design libre, choix modèle/carte à la sauvegarde
- 'edit-template'        → Édition d'un modèle existant de l'utilisateur
- 'edit-card'            → Édition d'une carte existante
- 'edit-gallery-template'→ Édition d'un template de la galerie publique
```

### 6. SAUVEGARDE (SaveAsModal.vue) — ⭐ POINT DE BIFURCATION

```
Flux SaveAsModal :
1. User clique "Enregistrer"
2. Popup avec 2 options :
   ├── 📐 "Enregistrer comme Modèle"
   │    → userTemplatesStore.addTemplate()
   │    → Sauvé dans "Mes Modèles"
   │    → Les éléments texte avec role restent comme placeholders
   │
   └── 💳 "Enregistrer comme Carte"
        → cardsStore.addCard()
        → Sauvé dans "Mes Cartes de Visite"
        → Les textes contiennent les valeurs réelles

⚠️ Ce point de bifurcation est CRITIQUE :
- Il détermine dans quelle collection l'objet est sauvegardé
- Il définit la nature de l'objet (réutilisable vs final)
- Il impacte les actions disponibles ensuite
```

---

## 🐛 BUGS & PROBLÈMES IDENTIFIÉS

### 🔴 CRITIQUE — BUG #1 : Sérialisation incomplète des éléments

**Impact :** Perte de propriétés visuelles après save/reload (cornerRadius, dash, lineHeight, etc.)

Propriétés à risque :
- TEXT : lineHeight, letterSpacing, textDecoration, shadow*, padding, wrap
- SHAPE (rect) : cornerRadius ⚠️ CONFIRMÉ, dash, dashEnabled, shadow*, lineCap
- SHAPE (star) : numPoints, innerRadius, outerRadius
- SHAPE (line/arrow) : points, lineCap, lineJoin, tension, pointerLength/Width
- IMAGE : filters, crop*, flipX/Y

**Solution requise :** Audit exhaustif de toutes les fonctions `buildXXXConfig()` dans EditorCanvas.vue et vérification que chaque propriété est sauvegardée.

### 🔴 CRITIQUE — BUG #2 : Collision d'IDs avec Date.now()

**Impact :** Si 2 cartes sont créées rapidement (batch ou double-clic), elles reçoivent le même ID.

**Solution :** Remplacer `Date.now()` par `uuid v4` (déjà importé dans le projet) ou `crypto.randomUUID()`.

### 🔴 CRITIQUE — BUG #3 : Performance du batch import

**Impact :** La génération de 50+ cartes depuis un Excel risque de bloquer l'UI.

**Problèmes :**
- Pas de Web Workers pour le traitement parallèle
- Clonage de l'editorData (avec images base64) pour chaque carte = explosion mémoire
- Pas de barre de progression fiable
- Pas de gestion d'erreurs par ligne

**Solution :** Implémenter un worker de génération avec progress feedback, et idéalement stocker les images comme URLs (pas base64).

### 🟡 MOYEN — BUG #4 : Intégrité Modèle → Carte

**Impact :** Si un modèle est modifié après génération de cartes, les cartes existantes ne sont pas mises à jour.

**Questions à résoudre :**
- Doit-on propager les modifications du modèle aux cartes existantes ?
- Si oui, quelles propriétés ? (design seulement, pas les données perso)
- Si non, les cartes sont-elles totalement indépendantes après génération ?

### 🟡 MOYEN — BUG #5 : Version jsPDF

La version `4.2.0` indiquée n'existe probablement pas (la dernière est 2.5.x). À vérifier et mettre à jour.

### 🟡 MOYEN — BUG #6 : Dépendance circulaire authStore ↔ cardsStore

L'authStore lit directement le localStorage au lieu d'utiliser cardsStore pour éviter une dépendance circulaire. Couplage fragile.

### 🟢 BAS — Absence de error boundaries, tests, et validation backend

(Identique à l'audit v1)

---

## ✅ POINTS POSITIFS

1. **Architecture conceptuelle solide** — La distinction Modèle/Carte est bien pensée et implémentée (userTemplatesStore séparé de cards, templateModelId comme FK, fieldConfig, etc.)

2. **Batch import déjà présent** — BatchCreateModal.vue (626 lignes) avec parsing xlsx, c'est une feature avancée rare dans un MVP.

3. **fieldConfig bien structuré** — Le système de champs standards + champs custom est flexible et extensible.

4. **Code bien commenté** — TODOs backend partout, facilitant la migration future.

5. **Fonctionnalités riches** — Éditeur Konva complet, 9 types d'éléments, QR codes stylés, export multi-format, admin panel.

6. **SaveAsModal avec choix explicite** — Le point de bifurcation Modèle/Carte est clair pour l'utilisateur.

---

## 📊 ÉVALUATION RÉVISÉE DU PROJET

### Ce que l'audit v1 disait (incomplet) :

> « Éditeur de cartes de visite en ligne, SaaS style Canva »

### Ce que le projet est réellement :

> **Plateforme de gestion de cartes de visite numériques pour entreprises**, avec un système de **modèles réutilisables** permettant la **génération en masse** de cartes personnalisées via import Excel. La valeur métier principale n'est pas l'édition graphique (qui est un moyen), mais la capacité à produire rapidement N cartes cohérentes pour une organisation entière à partir d'un seul design.

### Positionnement marché corrigé :

| Aspect | Audit v1 (incorrect) | Audit v2 (correct) |
|---|---|---|
| Type de produit | Éditeur graphique (Canva-like) | Plateforme de gestion de cartes d'entreprise |
| Utilisateur cible | Individuel (freelance, particulier) | Chef d'entreprise / RH / Communication |
| Valeur principale | Créer un beau design | Déployer un design cohérent à l'échelle d'une entreprise |
| Feature clé | Éditeur Konva | Génération batch depuis modèle + Excel |
| Modèle économique | Freemium par carte | Freemium par nombre de modèles ET de cartes |

---

## 🔧 RECOMMANDATIONS RÉVISÉES

### PRIORITÉ 1 — Bugs critiques (1-2 jours)

- Fix sérialisation éléments (cornerRadius, etc.)
- Remplacer Date.now() par UUID pour les IDs de cartes ET de modèles
- Optimiser le batch import (progress bar, gestion erreurs par ligne)
- Ajouter error boundaries

### PRIORITÉ 2 — Renforcer le concept Modèle/Carte (1 semaine)

- Clarifier dans le Dashboard les deux sections (Mes Modèles / Mes Cartes)
- Améliorer le mapping Excel → champs (UI de mapping interactif)
- Ajouter un aperçu avant génération batch (preview d'une carte avec les données)
- Ajouter la notion de « lot » (batch) pour regrouper les cartes générées ensemble
- Gérer les colonnes Excel non reconnues (mapping flexible)

### PRIORITÉ 3 — Refactoring (1 semaine)

- Décomposer EditorLeftSidebar (3,836 lignes → 5-6 composants)
- Extraire les fonctions buildXXXConfig() dans un fichier utils
- Créer un composable useElementSerializer()
- Implémenter auto-save avec debounce

### PRIORITÉ 4 — Tests (2 semaines)

- Tests unitaires des stores (Pinia + vitest), en particulier userTemplatesStore et le flux batch
- Tests intégration du workflow Modèle → Carte
- Tests E2E (Playwright) pour le parcours batch complet

### PRIORITÉ 5 — Backend (4-6 semaines)

Schéma PostgreSQL révisé pour intégrer la distinction :

```sql
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'user',
  is_premium    BOOLEAN      NOT NULL DEFAULT false,
  premium_until TIMESTAMPTZ,
  status        VARCHAR(20)  NOT NULL DEFAULT 'active',
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ⭐ TABLE DISTINCTE pour les modèles
CREATE TABLE user_templates (
  id           BIGSERIAL PRIMARY KEY,
  owner_id     BIGINT REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  editor_data  JSONB NOT NULL,       -- Design complet (elements, backgrounds, etc.)
  field_config JSONB NOT NULL,       -- ⭐ Champs attendus par le modèle
  is_public    BOOLEAN NOT NULL DEFAULT false,
  thumbnail    TEXT,
  usage_count  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ⭐ TABLE DISTINCTE pour les cartes, avec FK vers le modèle
CREATE TABLE cards (
  id                BIGSERIAL PRIMARY KEY,
  owner_id          BIGINT REFERENCES users(id) ON DELETE CASCADE,
  template_model_id BIGINT REFERENCES user_templates(id) ON DELETE SET NULL,
  name              VARCHAR(255) NOT NULL,
  editor_data       JSONB NOT NULL,    -- Design avec données réelles injectées
  personal_data     JSONB,             -- ⭐ Données personnelles structurées
  is_public         BOOLEAN NOT NULL DEFAULT false,
  views             INTEGER NOT NULL DEFAULT 0,
  downloads         INTEGER NOT NULL DEFAULT 0,
  qr_scans          INTEGER NOT NULL DEFAULT 0,
  shares            INTEGER NOT NULL DEFAULT 0,
  batch_id          UUID,              -- ⭐ Regroupe les cartes d'un même import Excel
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ⭐ Table pour tracer les imports batch
CREATE TABLE batch_imports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          BIGINT REFERENCES users(id) ON DELETE CASCADE,
  template_model_id BIGINT REFERENCES user_templates(id),
  source_filename   VARCHAR(255),
  total_rows        INTEGER NOT NULL,
  success_count     INTEGER NOT NULL DEFAULT 0,
  error_count       INTEGER NOT NULL DEFAULT 0,
  errors_detail     JSONB,             -- Détail des erreurs par ligne
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Templates système (galerie publique, gérés par l'admin)
CREATE TABLE system_templates (
  id          BIGSERIAL PRIMARY KEY,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  category    VARCHAR(50),
  is_premium  BOOLEAN NOT NULL DEFAULT false,
  featured    BOOLEAN NOT NULL DEFAULT false,
  layout      VARCHAR(100),
  colors      JSONB,
  thumbnail   TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_cards_owner ON cards(owner_id);
CREATE INDEX idx_cards_template ON cards(template_model_id);
CREATE INDEX idx_cards_batch ON cards(batch_id);
CREATE INDEX idx_user_templates_owner ON user_templates(owner_id);
```

### API Endpoints révisés

```
-- Modèles utilisateur --
GET    /api/templates              → Mes modèles (paginé)
POST   /api/templates              → Créer un modèle
GET    /api/templates/:id          → Détail d'un modèle
PUT    /api/templates/:id          → Modifier un modèle
DELETE /api/templates/:id          → Supprimer un modèle
GET    /api/templates/:id/cards    → ⭐ Cartes générées depuis ce modèle

-- Cartes de visite --
GET    /api/cards                  → Mes cartes (paginé)
POST   /api/cards                  → Créer une carte (manuelle)
POST   /api/cards/batch            → ⭐ Création batch depuis Excel + modèle
GET    /api/cards/:id              → Détail d'une carte
PUT    /api/cards/:id              → Modifier une carte
DELETE /api/cards/:id              → Supprimer une carte
POST   /api/cards/:id/export/:fmt → Export PNG/PDF/JPG

-- Batch --
GET    /api/batches                → ⭐ Historique des imports batch
GET    /api/batches/:id            → ⭐ Détail d'un batch (succès/erreurs)

-- Public / Galerie --
GET    /api/public/cards/:id       → Carte publique (sans auth)
GET    /api/gallery                → Galerie communauté
```

---

## 🚀 ROADMAP RÉVISÉE

### Q2 2026 — Foundation + Consolidation concept Modèle/Carte

- Fix bugs critiques (sérialisation, IDs, batch)
- UI Dashboard avec 2 sections distinctes claires
- Amélioration du batch import (preview, mapping UI, gestion erreurs)
- Refactoring composants
- Tests unitaires stores

### Q3 2026 — Backend

- Setup Node.js + PostgreSQL avec schéma révisé (user_templates + cards + batch_imports)
- JWT authentication
- API REST complète (modèles + cartes + batch)
- Storage S3/Cloudinary (remplacement des images base64)
- Migration localStorage → DB

### Q4 2026 — Features avancées

- Régénération de cartes quand le modèle change (propagation optionnelle)
- Version history des modèles
- Export batch (ZIP de toutes les cartes d'un lot)
- Team workspaces (un modèle d'entreprise partagé entre plusieurs utilisateurs)

### Q1 2027 — Scale

- Génération batch côté serveur (performance)
- API publique pour intégration RH (import automatique depuis SIRH)
- Mobile apps
- Marketplace de modèles

---

## 🎓 CONTEXTE POUR CLAUDE CODE (Résumé Exécutif Révisé)

ECODEV-CARD est une **plateforme de gestion de cartes de visite numériques** construite avec **Vue 3 + Konva + Pinia**, actuellement en **MVP fonctionnel** sur **100% localStorage**.

**Concept central :** Le projet distingue deux objets fondamentaux :
- **Modèle** = design réutilisable (le « moule »), créé dans l'éditeur
- **Carte de visite** = produit fini pour une personne, généré depuis un modèle

**Valeur métier principale :** Un chef d'entreprise crée 1 modèle, puis génère automatiquement N cartes pour ses employés via un import Excel. C'est la feature killer qui distingue ECODEV-CARD d'un simple éditeur graphique.

**Architecture :**
- Frontend : Vue 3.5 + Composition API
- Canvas : Konva 10.2 pour manipulation graphique
- State : Pinia 3.0 (8 stores, dont userTemplatesStore pour les modèles)
- Routing : Vue Router 5.0 (15 routes)
- Storage : localStorage (quota ~5-10 MB)

**Stores clés :**
- `userTemplatesStore.js` — CRUD des modèles utilisateur
- `cards.js` — CRUD des cartes de visite (avec templateModelId vers le modèle parent)
- `useEditorStore.js` — État de l'éditeur (editMode distingue modèle vs carte)
- `authStore.js` — Auth mock + admin

**Composants clés :**
- `SaveAsModal.vue` — Point de bifurcation Modèle / Carte
- `BatchCreateModal.vue` — Import Excel + génération en masse
- `CreateCardFromTemplateModal.vue` — Création manuelle depuis modèle
- `DashboardView.vue` — Deux sections : Mes Modèles + Mes Cartes

**Bugs majeurs :**
1. 🔴 Sérialisation incomplète (cornerRadius, etc.)
2. 🔴 Date.now() IDs (collision risk)
3. 🔴 Performance batch (50+ cartes sans Web Workers)
4. 🟡 Intégrité Modèle → Carte (pas de propagation des modifications)

**Priorités :**
1. Fix bugs critiques (sérialisation, IDs)
2. Renforcer le flux Modèle → Carte (UI, batch, preview)
3. Refactoring (EditorLeftSidebar trop gros)
4. Tests (unit + integration + E2E)
5. Backend (Node.js + PostgreSQL avec schéma Modèle/Carte distinct)

---

**Rapport généré le :** 3 Avril 2026
**Version :** 2.0 — Intégrant le concept central Modèle/Carte
**Analyste :** Claude (Anthropic)
