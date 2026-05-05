# Rapport de Stage — Fichier de référence

> **NE PAS MODIFIER LA STRUCTURE DE CE FICHIER SANS CONCERTATION**
> Ce fichier est le document maître de rédaction du rapport de stage.
> Il contient l'état d'avancement, le contenu rédigé, et la matière technique du projet.

---

## Métadonnées

| Champ | Valeur |
|---|---|
| **Étudiant** | WOTTOR DANIEL |
| **Établissement** | Université de Technologie et de Management (UTM) |
| **Diplôme visé** | Licence en Ingénieur des travaux |
| **Option** | Génie Logiciel |
| **Année académique** | 2025 – 2026 |
| **Entreprise d'accueil** | ECODEV INTERNATIONAL |
| **Période de stage** | 09 Février au … 2026 (3 mois) |
| **Thème** | Conception et implémentation d'une plateforme de génération, gestion et partage de cartes de visite numériques |
| **Directeur de rapport** | M. N'DO Landry (Responsable filière Génie Logiciel) |
| **Maître de stage** | M. OUEDRAOGO Ismaël (DG d'ECODEV) |
| **Professeur de suivi** | M. DEMBELE Séverin |

---

## Règles de rédaction

- Voix : **"nous"** (première personne du pluriel — convention académique UTM)
- Langue : **Français** (sauf Abstract)
- Le projet est présenté comme un **MVP fonctionnel développé avec la méthode Agile**
- Architecture complète : frontend Vue 3 + backend Laravel + base de données MySQL
- Chaque chapitre se termine par un **paragraphe de transition** vers le chapitre suivant

---

## Sommaire validé

```
AVANT-PROPOS
DÉDICACE
REMERCIEMENTS
RÉSUMÉ
ABSTRACT
LISTE DES SIGLES ET ABRÉVIATIONS
LISTE DES FIGURES
LISTE DES TABLEAUX

INTRODUCTION GÉNÉRALE

CHAPITRE I  : PRÉSENTATION DES STRUCTURES
  I.   Présentation de l'UTM
  II.  Présentation d'ECODEV INTERNATIONAL
  III. Présentation du projet
       III.1 Problématique
       III.2 Objectifs de l'étude
       III.3 Résultats attendus
       III.4 Gestion du projet (phases agiles, acteurs, planning)

CHAPITRE II : ASPECTS THÉORIQUES DU THÈME
  1. Exigences fonctionnelles et techniques
  2. Analyse de l'existant
  3. Concepts clés
     3.1 La carte de visite numérique
     3.2 Le QR Code et le standard vCard
     3.3 L'éditeur canvas (approche visuelle)
     3.4 La Single Page Application (SPA)
     3.5 La méthode Agile
  4. Technologies envisagées et choix retenus (tableaux comparatifs)
     4.1 Framework JavaScript frontend
     4.2 Librairie canvas
     4.3 Génération de PDF
     4.4 Framework backend
     4.5 SGBD
     4.6 Framework CSS et composants UI
  5. Environnement et outils de développement

CHAPITRE III : CONCEPTION DE LA SOLUTION
  1. Diagramme de cas d'utilisation
  2. Architecture du système
  3. Diagramme de classes
  4. Diagrammes de séquences

CHAPITRE IV : RÉALISATION ET BILAN
  1. Développement Frontend
     1.1 Composants et vues (Vue 3 / Pinia)
     1.2 Éditeur canvas interactif (Konva.js)
  2. Développement Backend
     2.1 Routes API, contrôleurs et modèles Laravel
     2.2 Authentification et sécurité (Sanctum)
  3. Fonctionnalités transverses
     3.1 Export PNG / PDF et génération QR vCard
     3.2 Création en lot (batch import Excel/CSV)
  4. Enchaînement des écrans (captures)
  5. Difficultés rencontrées et solutions apportées
  6. Compétences acquises
  7. Apports, limites du stage et perspectives d'amélioration

CONCLUSION GÉNÉRALE
BIBLIOGRAPHIE / WEBOGRAPHIE
ANNEXES
TABLE DES MATIÈRES
```

---

## État d'avancement

| Section | Statut | Note |
|---|---|---|
| Page de garde (x2) | ✅ Fait | OK |
| Avant-propos | ✅ Fait | Bien rédigé |
| Dédicace | ✅ Fait | OK |
| Remerciements | ✅ Fait | OK |
| Résumé | 🔴 À réécrire | Copié-collé du rapport AREEJ (colis/Essitech) — contenu erroné |
| Abstract | 🔴 À réécrire | Même problème |
| Sommaire | ⚠️ Incomplet | S'arrête à Abstract — à compléter après rédaction |
| Liste des sigles | ⬜ Vide | À remplir |
| Liste des figures | ⬜ Vide | Renommer "graphiques" → "figures" |
| Liste des tableaux | ⬜ Vide | À remplir |
| Introduction générale | ✅ Fait | Très bien |
| Chapitre I | ✅ Fait | Complet (UTM + ECODEV + Projet) |
| Chapitre II | 🔴 Vide | Juste le titre |
| Chapitre III | 🔴 Absent | À rédiger |
| Chapitre IV | 🔴 Absent | À rédiger |
| Conclusion | 🔴 Absente | À rédiger |
| Bibliographie / Webographie | 🔴 Absente | À rédiger |
| Annexes | 🔴 Absentes | À rédiger |

---

## Contenu rédigé (sections validées)

### AVANT-PROPOS

Le présent rapport s'inscrit dans le cadre du stage de fin de cycle en Génie Logiciel à l'Université de
Technologie et de Management (UTM), réalisé au sein de l'entreprise ECODEV. Il retrace l'ensemble
du processus de conception et de développement d'une application web dédiée à la génération, à la
gestion et au partage de cartes de visite numériques, en partant de l'analyse des besoins jusqu'à la mise
en œuvre d'une solution fonctionnelle et exploitable.
Cette expérience en milieu professionnel a constitué une étape clé de la formation, en permettant de
mettre en pratique les connaissances théoriques acquises tout au long du cursus. Elle a contribué au
renforcement des compétences techniques, à l'amélioration des méthodes de travail, ainsi qu'à une
meilleure compréhension des exigences liées à la conception et au déploiement de systèmes
informatiques.
Au-delà des aspects techniques, ce stage a été particulièrement enrichissant sur le plan humain et
professionnel. Il a permis de développer des compétences pratiques essentielles et constitue une
préparation significative à une future insertion dans le monde du travail.

---

### DÉDICACE

Nous dédions ce rapport de stage à nos parents ainsi qu'à l'ensemble de notre famille, en témoignage
de notre profonde gratitude pour leur soutien indéfectible, leurs encouragements et leur présence tout
au long de notre parcours.

---

### REMERCIEMENTS

Au terme de ce travail, nous tenons à exprimer notre profonde gratitude à toutes les personnes et
institutions ayant participé à sa concrétisation.

Nous adressons nos sincères remerciements à M. OUEDRAOGO Ismaël, maître de stage, pour la
qualité de son encadrement, sa disponibilité et la pertinence de ses conseils. Nous témoignons
également notre reconnaissance à M. DEMBELE Séverin, professeur de suivi, pour son
accompagnement académique et ses orientations éclairées.

Nos remerciements s'étendent par ailleurs à M. N'DO Landry, responsable de la filière Génie Logiciel
à l'UTM, pour son appui et ses encouragements.

Enfin, nous exprimons notre gratitude à toute personne ayant contribué, de près ou de loin, à la
réalisation de ce travail.

---

### INTRODUCTION GÉNÉRALE

À l'ère du numérique, la communication professionnelle évolue vers des solutions de plus en
plus dématérialisées, rapides et accessibles. Toutefois, au Burkina Faso, la gestion et le partage
des informations de contact restent encore souvent peu structurés et limités en termes
d'accessibilité et d'interopérabilité. Les moyens existants ne permettent pas toujours une mise
à jour dynamique des informations ni une diffusion efficace auprès d'un large public.
Face à cette réalité, une problématique se pose :
comment concevoir une plateforme permettant de générer, gérer et partager efficacement des
cartes de visite numériques, tout en offrant des fonctionnalités de personnalisation,
d'exportation et d'intégration dans des systèmes tiers ?
C'est dans ce contexte que s'inscrit notre stage effectué au sein de l'entreprise ECODEV, une
structure spécialisée dans l'innovation numérique. L'objectif principal de ce travail est de
concevoir et d'implémenter une plateforme dédiée à la création de cartes de visite numériques
personnalisées, permettant leur exportation sous des formats standards tels que la vCard, ainsi
que leur partage via des technologies modernes comme les QR codes.
La réalisation de cette plateforme soulève plusieurs défis techniques, notamment la conception
d'une interface utilisateur interactive et intuitive, la gestion de modèles personnalisables,
l'implémentation de mécanismes d'exportation fiables, ainsi que l'intégration d'une API
facilitant l'interopérabilité avec d'autres applications. Il s'agit également de garantir une
expérience utilisateur fluide et conforme aux standards actuels du web.
La méthodologie adoptée repose sur une démarche structurée combinant l'analyse des besoins,
la conception de l'architecture du système, le développement de l'interface utilisateur et
l'implémentation des fonctionnalités essentielles. Ce rapport présente l'ensemble des travaux
réalisés. Il débute par une présentation du cadre du stage et de l'entreprise d'accueil, expose
ensuite les fondements théoriques liés aux cartes de visite numériques et aux technologies
utilisées, décrit les solutions mises en œuvre, puis se conclut par une évaluation du système
développé ainsi que des perspectives d'amélioration.

---

### CHAPITRE I : PRÉSENTATION DES STRUCTURES ✅ COMPLET

*(Le contenu complet de ce chapitre est dans le fichier Word/draft original — UTM + ECODEV + Projet)*

Points couverts :
- I. Présentation de l'UTM (I.1 Historique → I.6 Organigramme)
- II. Présentation d'ECODEV INTERNATIONAL (domaines, organigramme)
- III. Présentation du projet
  - Problématique : comment concevoir une plateforme web pour générer, gérer et partager des cartes de visite numériques personnalisables, avec fonctionnalités d'export et API ?
  - Objectifs spécifiques : formats PNG/JPG/PDF, QR code automatique, export vCard, bibliothèque de modèles, création de modèles sur mesure, API robuste, interface interactive
  - Résultats attendus : plateforme fonctionnelle, générateur de cartes, vCard, QR codes, modèles, API, interface intuitive
  - Gestion du projet : 3 mois (février–mai), démarche agile itérative, phases : analyse → conception → développement → export/QR → tests
- Conclusion du chapitre I ✅

---

## Matière technique du projet (pour rédaction des chapitres II, III, IV)

### Stack technique utilisé

#### Frontend
| Composant | Technologie | Version | Rôle |
|---|---|---|---|
| Framework JS | Vue 3 (Composition API) | 3.5.27 | Framework frontend principal |
| Build tool | Vite | 7.3.1 | Bundler + serveur dev avec HMR |
| State management | Pinia | 3.0.4 | Gestion d'état centralisée |
| Routage | Vue Router | 5.0.1 | Navigation SPA avec guards |
| Canvas / Éditeur | Konva.js + vue-konva | 10.2.1 / 3.4.0 | Éditeur canvas 2D interactif |
| CSS Framework | Tailwind CSS | 3.4.19 | Styles utilitaires |
| UI Components | DaisyUI | 5.5.19 | Composants Tailwind |
| Export PDF | jsPDF | 4.2.0 | Génération PDF |
| Export image | html-to-image | 1.11.13 | Export PNG/JPG haute résolution |
| QR Code | QR Code Styling | 1.9.2 | QR codes stylisés |
| Icônes | Iconify Vue | 5.0.0 | Bibliothèque 150k+ icônes |
| Icônes | Lucide Vue Next | 0.563.0 | Icônes UI |
| Polices | Webfontloader | 1.6.28 | Chargement Google Fonts |
| Excel/CSV | XLSX | 0.18.5 | Import contacts pour batch |
| HTTP | Axios | 1.13.6 | Communication avec l'API backend |
| IDs uniques | uuid | 13.0.0 | Génération d'identifiants |

#### Backend
| Composant | Technologie | Rôle |
|---|---|---|
| Framework PHP | Laravel | API REST, logique métier, authentification |
| Base de données | MySQL | Persistance des données |
| Authentification | Laravel Sanctum | Authentification SPA par cookie de session |
| Email | SMTP Gmail | Vérification email, notifications admin |
| Environnement local | Laragon | Serveur Apache + MySQL + PHP (développement) |

### Architecture de l'application

**Type :** Architecture client-serveur — SPA Vue 3 (frontend) + API REST Laravel (backend) + MySQL (base de données)

**Flux de données :**
```
Navigateur (Vue 3 SPA)
        ↕ HTTP / Axios
API REST Laravel (localhost:8000)
        ↕ Eloquent ORM
Base de données MySQL (digital_card_platform)
```

**Base de données MySQL — tables principales :**

| Table | Contenu |
|---|---|
| `users` | Utilisateurs (id, name, email, role, is_premium, is_banned, avatar, title, bio…) |
| `cards` | Cartes de visite (id, user_id, title, elements JSON, backgrounds JSON, share_slug, stats…) |
| `templates` | Templates (id, user_id, name, elements JSON, is_gallery, is_public, is_premium, category, slug…) |
| `brand_kits` | Kit de marque par utilisateur (couleurs, police, logo) |
| `custom_fonts` | Polices personnalisées uploadées |
| `system_settings` | Paramètres système (limites, mode maintenance, accès galerie…) |
| `notifications` | Notifications persistantes par utilisateur |
| `personal_access_tokens` | Tokens Sanctum pour l'authentification |
| `sessions` | Sessions utilisateur |

**Stores Pinia (9 stores) :**
| Store | Responsabilité |
|---|---|
| `authStore` | Authentification, session, gestion des utilisateurs |
| `cardsStore` | CRUD cartes + galerie de templates |
| `useEditorStore` | État complet de l'éditeur canvas |
| `userTemplatesStore` | Templates utilisateur + création en lot |
| `adminStore` | Tableau de bord et modération admin |
| `brandKit` | Couleurs, polices et logo de marque par utilisateur |
| `fontStore` | Chargement et gestion Google Fonts |
| `themeStore` | Mode sombre/clair |
| `notificationStore` | Toasts + notifications persistantes |

**Pages principales (18 vues) :**
- HomeView — Page d'accueil
- AuthView — Connexion / Inscription / Reset password
- DashboardView — Tableau de bord utilisateur avec statistiques
- EditorView — Éditeur de carte principal
- GalleryView — Galerie de templates
- ShareView — Partage public d'une carte (/share/{id})
- UserProfileView — Profil et paramètres
- PricingView — Offres premium
- AdminDashboardView + 4 vues admin — Panel administrateur

### Fonctionnalités développées

**Création et édition de cartes :**
- Éditeur canvas interactif (Konva.js) — recto + verso
- Éléments : texte, formes, icônes, images, QR codes
- Formatage riche : gras, italique, souligné, couleur, police, taille, interlignage, espacement
- Runs de style : formatage partiel au sein d'un même élément texte
- Dégradés (linéaire et radial) sur textes et formes
- Ombres portées configurables
- Rotation, opacité, verrouillage par élément
- Redimensionnement et recadrage d'images (cercle/carré)
- Alignement, distribution, correspondance de taille entre éléments
- Historique undo/redo (50 états)
- Multi-sélection, groupement, calques avec réordonnancement

**Templates et galerie :**
- Bibliothèque de 14+ templates officiels (catégories : Modern, Minimal, Creative, Tech, etc.)
- Création de templates personnalisés par l'utilisateur
- Galerie communautaire (publication par utilisateurs Premium)
- Application d'un template recto sans écraser le verso

**Export et partage :**
- Export PNG haute résolution (3× pixel ratio)
- Export PDF multi-pages recto+verso (jsPDF)
- QR codes stylisés (points, coins, logo, correction d'erreur) — standard vCard 3.0
- Lien de partage public unique (/share/{cardId})
- Statistiques : vues, téléchargements, scans QR, partages

**Création en lot (batch) :**
- Import Excel/CSV avec liste de contacts
- Correspondance automatique colonnes → rôles (firstName, lastName, company, etc.)
- Génération simultanée de N cartes depuis un template + données contacts

**Gestion utilisateurs :**
- Inscription / Connexion / Déconnexion
- Vérification email
- Réinitialisation mot de passe
- Profil : photo, nom, titre, bio
- Rôles : Free / Premium / Admin

**Limites par niveau :**
| Fonctionnalité | Free | Premium | Admin |
|---|---|---|---|
| Cartes max | 3 | 50+ | Illimité |
| Templates personnalisés | 2 | Illimité | Illimité |
| Import batch | ❌ | ✅ | ✅ |
| Publication communauté | ❌ | ✅ | ✅ |

**Panel admin :**
- Gestion utilisateurs (ban, premium, suppression)
- Modération des cartes
- Gestion des templates officiels
- Paramètres système (mode maintenance, accès galerie, limites)
- Tableau de bord KPIs + activité récente

### Modèle de données (entités principales)

**Carte (Card) :** id, name, user_id, is_public, share_slug, views, downloads, qr_scans, shares, meta (editorData complet)

**Template :** id, name, user_id, is_auto, is_public, is_gallery, meta (editorData), field_config

**Utilisateur (User) :** id, email, name, role (user/admin), is_banned, is_premium, premium_expires_at, avatar_url

**Élément canvas (Element) :** id, type (text/shape/image/icon/qr), x, y, width, height, rotation, opacity, visible, locked, groupId, + propriétés spécifiques au type

### Concepts clés pour le Chapitre II

**Carte de visite numérique :** document numérique interactif remplaçant la carte papier traditionnelle. Permet la mise à jour en temps réel, le partage instantané, l'export multi-format.

**vCard (Virtual Card) :** standard ouvert (RFC 6350 / vCard 3.0) pour l'échange d'informations de contact. Champs : FN, N, ORG, TITLE, TEL, EMAIL, URL, ADR.

**QR Code :** matrice 2D encodant une URL ou un vCard. Niveaux de correction d'erreur : L, M, Q, H. Styles personnalisables (points, coins).

**Éditeur canvas :** interface de dessin vectoriel dans le navigateur via l'API Canvas HTML5. Konva.js ajoute gestion des events, transformations, calques et export.

**SPA (Single Page Application) :** architecture web reposant sur un unique fichier HTML (`index.html`) servi par le navigateur. La navigation entre les différentes vues (tableau de bord, éditeur, galerie, profil, etc.) est entièrement gérée côté client par Vue Router via l'History API, sans rechargement complet de la page. L'utilisateur perçoit plusieurs pages, mais c'est JavaScript qui les rend dynamiquement à l'intérieur du même shell applicatif.

**Méthode Agile :** développement itératif par sprints. Chaque sprint livre un incrément fonctionnel. Adapté aux projets dont les besoins évoluent.

### Technologies comparées (pour tableau Chapitre II)

**Frameworks JavaScript :**
| Critère | Vue 3 | React | Angular |
|---|---|---|---|
| Courbe d'apprentissage | Faible | Moyenne | Élevée |
| Gestion d'état | Pinia (intégré) | Redux (externe) | NgRx (intégré) |
| Performances | Très bonnes | Très bonnes | Bonnes |
| Taille bundle | Légère | Légère | Lourde |
| **Choix retenu** | ✅ | — | — |

**Librairies canvas :**
| Critère | Konva.js | Fabric.js | PixiJS |
|---|---|---|---|
| Manipulation d'objets | Excellente | Excellente | Limitée |
| Intégration Vue | vue-konva | Manuel | Manuel |
| Export image | Natif | Natif | Via plugin |
| **Choix retenu** | ✅ | — | — |

**Export PDF :**
| Critère | jsPDF | pdfmake | Puppeteer |
|---|---|---|---|
| Côté client | ✅ | ✅ | ❌ (serveur) |
| Facilité d'usage | Bonne | Moyenne | Élevée |
| **Choix retenu** | ✅ | — | — |

### Sprints agiles (pour Chapitre IV / planning)

| Sprint | Période | Travaux réalisés |
|---|---|---|
| Sprint 1 | Semaines 1–2 | Analyse des besoins, cadrage, choix technologiques, mise en place de l'environnement |
| Sprint 2 | Semaines 3–4 | Architecture des stores Pinia, routing, authentification, tableau de bord |
| Sprint 3 | Semaines 5–6 | Éditeur canvas (éléments de base : texte, formes, images) |
| Sprint 4 | Semaines 7–8 | Fonctionnalités avancées : icônes, QR codes, dégradés, ombres, historique |
| Sprint 5 | Semaines 9–10 | Export PNG/PDF, partage public, galerie de templates |
| Sprint 6 | Semaines 11–12 | Création en lot (batch), panel admin, tests et validation |

### Sigles à inclure (Liste des sigles)

| Sigle | Signification |
|---|---|
| API | Application Programming Interface (Interface de programmation applicative) |
| CEGEP | Collège d'Enseignement Général et Professionnel |
| CSS | Cascading Style Sheets (Feuilles de style en cascade) |
| DG | Directeur Général |
| GIT | Global Information Tracker |
| HTML | HyperText Markup Language |
| HTTP | HyperText Transfer Protocol |
| IDE | Integrated Development Environment (Environnement de développement intégré) |
| IUP | Institut Universitaire de Technologie |
| JS | JavaScript |
| JSON | JavaScript Object Notation |
| LMD | Licence-Master-Doctorat |
| MESRI | Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation |
| PDF | Portable Document Format |
| PNG | Portable Network Graphics |
| QR | Quick Response |
| REST | Representational State Transfer |
| SGBD | Système de Gestion de Base de Données |
| SGBDR | Système de Gestion de Base de Données Relationnelle |
| SPA | Single Page Application |
| SQL | Structured Query Language |
| TIC | Technologies de l'Information et de la Communication |
| UFR-SEG | Unité de Formation et de Recherche - Sciences Économiques et de Gestion |
| UI | User Interface (Interface utilisateur) |
| UML | Unified Modeling Language (Langage de modélisation unifié) |
| URL | Uniform Resource Locator |
| UTM | Université de Technologie et de Management |
| UX | User Experience (Expérience utilisateur) |
| vCard | Virtual Card — standard d'échange de contacts (RFC 6350) |
| VCS | Version Control System (Système de contrôle de version) |

---

## RÉSUMÉ ✅

Notre stage au sein d'ECODEV INTERNATIONAL, entreprise spécialisée dans l'innovation numérique, nous a conduits à concevoir et implémenter une plateforme web de génération, gestion et partage de cartes de visite numériques. Face à la persistance de pratiques de partage de contacts peu structurées et non interopérables dans le contexte professionnel burkinabè, ce projet apporte une réponse concrète et moderne.

La solution développée est une application web monopage (SPA) reposant sur une architecture client-serveur : un frontend Vue 3 (Vite, Pinia, Konva.js) communique avec une API REST Laravel, elle-même connectée à une base de données MySQL. Elle offre un éditeur canvas interactif permettant de composer des cartes recto-verso, d'y intégrer textes, formes, images et icônes, puis de les exporter aux formats PNG et PDF. Chaque carte peut être augmentée d'un QR code conforme au standard vCard 3.0, rendant le contact directement importable dans tout carnet d'adresses. La plateforme propose également une bibliothèque de templates, une galerie communautaire, un module de création en lot depuis Excel/CSV, et un panneau d'administration complet.

Développé selon la méthode Agile en six sprints, ce projet constitue un produit minimum viable (MVP) fonctionnel livré à l'issue du stage.

**Mots-clés :** carte de visite numérique, SPA, Vue 3, Laravel, Konva.js, QR code, vCard, Agile, ECODEV

---

## ABSTRACT ✅

Our internship at ECODEV INTERNATIONAL, a company specializing in digital innovation, led us to design and implement a web platform for generating, managing, and sharing digital business cards. In response to the lack of structured and interoperable contact-sharing practices in the Burkinabè professional environment, this project delivers a modern and practical solution.

The developed solution is a single-page application (SPA) built on a client-server architecture: a Vue 3 frontend (Vite, Pinia, Konva.js) communicates with a Laravel REST API connected to a MySQL database. It features an interactive canvas editor allowing users to compose double-sided business cards with text, shapes, images, and icons, then export them as PNG or PDF files. Each card can be enhanced with a QR code compliant with the vCard 3.0 standard, making the contact directly importable into any address book. The platform also includes a template library, a community gallery, a batch card creation module from Excel/CSV files, and a full administration panel.

Developed using the Agile methodology over six sprints, this project constitutes a functional minimum viable product (MVP) delivered at the end of the internship.

**Keywords:** digital business card, SPA, Vue 3, Laravel, Konva.js, QR code, vCard, Agile, ECODEV

---

## LISTE DES SIGLES ET ABRÉVIATIONS ✅

| Sigle | Signification |
|---|---|
| API | Application Programming Interface (Interface de programmation applicative) |
| CEGEP | Collège d'Enseignement Général et Professionnel |
| CSS | Cascading Style Sheets (Feuilles de style en cascade) |
| DG | Directeur Général |
| GIT | Global Information Tracker |
| HMR | Hot Module Replacement (Remplacement de module à chaud) |
| HTML | HyperText Markup Language |
| HTTP | HyperText Transfer Protocol |
| IDE | Integrated Development Environment (Environnement de développement intégré) |
| IUP | Institut Universitaire de Technologie |
| JS | JavaScript |
| JSON | JavaScript Object Notation |
| LMD | Licence-Master-Doctorat |
| MESRI | Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation |
| MVC | Modèle-Vue-Contrôleur (patron d'architecture logicielle) |
| ORM | Object-Relational Mapping (Mapping objet-relationnel) |
| PDF | Portable Document Format |
| PHP | PHP : Hypertext Preprocessor |
| PNG | Portable Network Graphics |
| QR | Quick Response |
| REST | Representational State Transfer |
| SGBD | Système de Gestion de Base de Données |
| SGBDR | Système de Gestion de Base de Données Relationnelle |
| SMTP | Simple Mail Transfer Protocol (Protocole de transfert de courrier simple) |
| SPA | Single Page Application (Application monopage) |
| SQL | Structured Query Language |
| TIC | Technologies de l'Information et de la Communication |
| UFR-SEG | Unité de Formation et de Recherche - Sciences Économiques et de Gestion |
| UI | User Interface (Interface utilisateur) |
| UML | Unified Modeling Language (Langage de modélisation unifié) |
| URL | Uniform Resource Locator |
| UTM | Université de Technologie et de Management |
| UX | User Experience (Expérience utilisateur) |
| vCard | Virtual Card — standard d'échange de contacts (RFC 6350) |
| VCS | Version Control System (Système de contrôle de version) |

---

## CHAPITRE II : ASPECTS THÉORIQUES DU THÈME

### Introduction du Chapitre II

Avant d'engager la phase de conception et de développement de la plateforme, il est indispensable de poser les bases théoriques et analytiques qui ont guidé nos choix. Ce chapitre présente dans un premier temps les exigences fonctionnelles et techniques qui encadrent le projet, puis analyse les solutions existantes sur le marché. Il définit ensuite les concepts clés sur lesquels repose l'application, avant d'exposer et de justifier les choix technologiques retenus à travers des tableaux comparatifs.

---

### 1. Exigences fonctionnelles et techniques

La phase d'analyse des besoins, menée en concertation avec le maître de stage lors du Sprint 1, a permis d'identifier deux catégories d'exigences : les exigences fonctionnelles, qui décrivent les services attendus du système, et les exigences techniques, qui définissent les contraintes et standards que le système doit respecter.

#### 1.1 Exigences fonctionnelles

| N° | Exigence | Acteur concerné | Priorité |
|---|---|---|---|
| EF-01 | Créer un compte utilisateur et s'authentifier de manière sécurisée | Tout utilisateur | Haute |
| EF-02 | Vérifier l'adresse email lors de l'inscription | Tout utilisateur | Haute |
| EF-03 | Créer et éditer des cartes de visite numériques recto-verso via un éditeur canvas interactif | Utilisateur Free / Premium | Haute |
| EF-04 | Ajouter sur la carte des éléments : texte, formes géométriques, images, icônes, QR codes | Utilisateur Free / Premium | Haute |
| EF-05 | Exporter une carte au format PNG haute résolution et PDF multi-pages | Utilisateur Free / Premium | Haute |
| EF-06 | Générer automatiquement un QR code encodant les coordonnées du contact selon le standard vCard 3.0 | Utilisateur Free / Premium | Haute |
| EF-07 | Partager une carte via un lien public unique (URL de partage) | Utilisateur Free / Premium | Haute |
| EF-08 | Parcourir et appliquer un template depuis une bibliothèque de modèles | Utilisateur Free / Premium | Moyenne |
| EF-09 | Sauvegarder ses propres templates réutilisables | Utilisateur Free / Premium | Moyenne |
| EF-10 | Créer plusieurs cartes simultanément depuis un template et un fichier Excel/CSV (création en lot) | Utilisateur Premium | Moyenne |
| EF-11 | Publier une carte dans la galerie communautaire | Utilisateur Premium | Basse |
| EF-12 | Gérer les utilisateurs (ban, promotion Premium, suppression) | Administrateur | Haute |
| EF-13 | Modérer les contenus de la galerie communautaire | Administrateur | Haute |
| EF-14 | Configurer les paramètres système (mode maintenance, limites, accès galerie) | Administrateur | Haute |

**Tableau 1 — Exigences fonctionnelles**

#### 1.2 Exigences techniques

| N° | Exigence | Description |
|---|---|---|
| ET-01 | Architecture client-serveur | L'application doit reposer sur un frontend SPA découplé d'un backend API REST |
| ET-02 | Compatibilité navigateur | Compatible avec les dernières versions de Chrome, Firefox, Edge et Safari |
| ET-03 | Responsive design | L'interface doit s'adapter aux résolutions de bureau (prioritaire) et tablette |
| ET-04 | Persistance des données | Toutes les données (cartes, templates, utilisateurs) sont stockées en base de données MySQL |
| ET-05 | Sécurité des accès | Authentification par cookie de session (Laravel Sanctum) ; routes protégées par guards frontend et middleware backend |
| ET-06 | Qualité d'export | Les exports PNG doivent être produits à 3× la résolution d'affichage (pixel ratio ×3) |
| ET-07 | Interopérabilité vCard | Le QR code exporté doit être lisible par les applications de contacts mobiles (Android, iOS) |
| ET-08 | Gestion des rôles | Le système doit distinguer trois rôles : Free, Premium, Administrateur, chacun avec ses permissions |
| ET-09 | Scalabilité | L'architecture doit permettre l'ajout de fonctionnalités sans refonte majeure |

**Tableau 2 — Exigences techniques**

---

### 2. Analyse de l'existant

Avant de concevoir la solution, nous avons procédé à une analyse des outils existants permettant la création de cartes de visite numériques. Cette étude comparative nous a permis d'identifier les lacunes du marché et de positionner notre plateforme.

| Outil | Type | Forces | Limites |
|---|---|---|---|
| **Canva (carte de visite)** | SaaS en ligne | Interface intuitive, nombreux templates | Pas de QR code intégré, export vCard absent, pas d'API, fonctionnalités avancées payantes |
| **Adobe Express** | SaaS en ligne | Intégration Creative Cloud, grande qualité graphique | Coût élevé, pas de partage via lien public, pas de gestion de contacts |
| **HiHello** | Application mobile | QR code intégré, partage NFC | Interface limitée, pas d'éditeur canvas, pas d'export PDF haute résolution |
| **Blinq** | Application mobile | Profil web, analytics | Personnalisation graphique réduite, création en lot absente |
| **Notre solution** | Plateforme web | Éditeur canvas complet, export PNG/PDF, QR vCard, batch, galerie, API REST | Application locale (non encore déployée en production) |

**Tableau 3 — Analyse comparative des solutions existantes**

Cette analyse révèle que les solutions existantes sont soit des outils de design généraliste (Canva, Adobe Express) sans gestion de contacts structurée, soit des applications mobiles (HiHello, Blinq) sans éditeur graphique avancé. Notre plateforme comble cet écart en combinant un éditeur canvas professionnel, la gestion des contacts via vCard, les exports haute résolution, et la création en lot — le tout dans une application web accessible sans installation.

---

### 3. Concepts clés

#### 3.1 La carte de visite numérique

La carte de visite numérique est la version dématérialisée de la carte de visite papier traditionnelle. Elle se présente sous la forme d'un fichier (PNG, PDF, vCard) ou d'une page web contenant les informations de contact d'une personne ou d'une entreprise : nom, prénom, fonction, organisation, numéro de téléphone, adresse email, site web et adresse postale.

Par rapport à son homologue physique, la carte de visite numérique présente plusieurs avantages significatifs :

- **Mise à jour en temps réel :** les informations peuvent être modifiées sans imprimer un nouveau lot.
- **Partage instantané :** via un lien URL, un QR code ou un fichier joint.
- **Export multi-format :** PNG pour l'affichage, PDF pour l'impression, vCard pour l'import dans un carnet d'adresses.
- **Traçabilité :** les statistiques de vues, téléchargements et scans QR peuvent être collectées.
- **Coût réduit :** aucun coût d'impression ni de réimpression en cas de modification.

Dans notre plateforme, chaque carte est composée d'un recto et d'un verso. Chaque face est un canevas numérique sur lequel l'utilisateur dispose librement des éléments graphiques de son choix.

#### 3.2 Le QR Code et le standard vCard

**Le QR Code (Quick Response Code)** est un code-barres matriciel en deux dimensions, inventé par la société Denso Wave en 1994. Il encode des données textuelles dans une matrice de points noirs et blancs lisible par tout appareil photo numérique. Contrairement aux codes-barres linéaires, le QR code peut contenir jusqu'à plusieurs milliers de caractères et intègre un mécanisme de correction d'erreur disponible en quatre niveaux (L, M, Q, H) permettant la lecture même lorsqu'une partie du code est endommagée.

Dans le contexte des cartes de visite numériques, le QR code est utilisé pour encoder les informations de contact selon le standard **vCard**.

**Le standard vCard (Virtual Card)**, défini par la RFC 6350 (vCard 4.0) et sa version antérieure vCard 3.0, est un format de fichier standardisé pour l'échange électronique de données de contact. Un fichier vCard (.vcf) contient des champs structurés comme suit :

```
BEGIN:VCARD
VERSION:3.0
FN:Daniel WOTTOR
N:WOTTOR;Daniel;;;
ORG:ECODEV INTERNATIONAL
TITLE:Développeur Web
TEL;TYPE=CELL:+226 XX XX XX XX
EMAIL:daniel@ecodev.com
URL:https://ecodev.com
END:VCARD
```

Dans notre application, le QR code généré encode ce format vCard 3.0 directement, permettant à tout utilisateur qui scanne la carte avec son smartphone d'importer immédiatement le contact dans son carnet d'adresses, sans saisie manuelle. La bibliothèque **QR Code Styling** permet en outre de personnaliser l'apparence du QR code (forme des points, couleur, logo central, coins arrondis) pour l'harmoniser avec le design de la carte.

#### 3.3 L'éditeur canvas

Un éditeur canvas est une interface graphique permettant à un utilisateur de composer visuellement une mise en page en déplaçant, redimensionnant et personnalisant des éléments sur une surface de dessin (le « canvas »). Cette approche, dite WYSIWYG (What You See Is What You Get), contraste avec les éditeurs basés sur des formulaires où l'utilisateur paramètre des champs sans visualisation directe du résultat.

L'éditeur canvas de notre plateforme repose sur l'**API Canvas HTML5**, une fonctionnalité native des navigateurs modernes permettant de dessiner des graphiques 2D via JavaScript, et sur la bibliothèque **Konva.js** qui ajoute une couche d'abstraction orientée objets au-dessus de cette API. Concrètement, Konva.js représente chaque élément (texte, forme, image, QR code) sous forme d'objet JavaScript doté de propriétés (position, dimensions, couleur, opacité, rotation) et gérant automatiquement les interactions utilisateur (glisser-déposer, redimensionnement, sélection, multi-sélection).

Les fonctionnalités avancées de notre éditeur incluent notamment :
- Un historique d'annulation/rétablissement sur 50 états ;
- Un système de calques avec réordonnancement par glisser-déposer ;
- La gestion des dégradés linéaires et radiaux sur textes et formes ;
- Le formatage partiel de texte (différentes polices, couleurs ou styles au sein d'un même bloc) ;
- L'alignement et la distribution automatique des éléments.

**Bibliothèque d'éléments de l'éditeur**

L'éditeur propose à l'utilisateur plusieurs catégories d'éléments graphiques, dont les sources sont les suivantes :

| Catégorie | Source | Description |
|---|---|---|
| **Icônes** | Iconify (`@iconify/vue`) | Plus de 150 000 icônes issues de sets open-source reconnus : Material Design Icons, Font Awesome, Phosphor, Heroicons, Tabler Icons, etc. L'utilisateur les recherche par mot-clé et les insère directement sur le canvas. |
| **Formes géométriques** | Konva.js (natif) | Rectangles, cercles, triangles, étoiles, lignes et polygones dessinés par les primitives graphiques de Konva.js ; entièrement configurables (couleur de remplissage, bordure, dégradé, opacité). |
| **Illustrations et stickers** | Collection statique (`src/data/`) | Ensemble d'illustrations et de stickers vectoriels sélectionnés manuellement, stockés sous forme de fichiers SVG/JSON embarqués dans l'application et accessibles depuis la bibliothèque de l'éditeur. |
| **Images personnalisées** | Import utilisateur | L'utilisateur peut importer ses propres images (PNG, JPG, SVG) depuis son appareil ; elles sont redimensionnables et recadrables (format carré ou cercle) directement dans l'éditeur. |
| **Polices de caractères** | Google Fonts (Webfontloader) | Plus de 1 000 polices Google Fonts disponibles dans le sélecteur de polices ; elles sont chargées dynamiquement à la demande via la bibliothèque Webfontloader, sans alourdir le bundle initial. L'utilisateur peut également uploader ses propres polices personnalisées. |
| **QR codes** | QR Code Styling | Élément spécial généré automatiquement depuis les données de contact de la carte (standard vCard 3.0) ; personnalisable en couleur, forme des points et logo central. |

**Tableau 11 — Sources des éléments de l'éditeur canvas**

#### 3.4 La Single Page Application (SPA)

Une **Single Page Application (SPA)** est une architecture web dans laquelle le serveur ne sert qu'un seul fichier HTML (`index.html`). L'ensemble de la logique d'interface — rendu des vues, navigation entre pages, gestion des états — est pris en charge par JavaScript côté client. Lorsque l'utilisateur navigue vers une nouvelle section (tableau de bord, éditeur, galerie, profil…), Vue Router intercepte la demande et remplace dynamiquement le contenu affiché sans rechargement complet de la page, en exploitant l'History API du navigateur.

Ce modèle offre plusieurs avantages pour notre plateforme :
- **Fluidité de navigation :** transitions instantanées entre les vues sans rechargement perceptible.
- **Séparation des responsabilités :** le frontend est entièrement découplé du backend ; ils communiquent uniquement via des appels HTTP à l'API REST.
- **Réactivité :** les mises à jour de l'interface ne dépendent pas de la latence réseau pour le rendu, mais seulement pour la synchronisation des données.

L'inconvénient principal des SPA — le chargement initial plus lent — est atténué dans notre application par Vite, qui optimise le bundling et active le **HMR** (Hot Module Replacement) en développement.

#### 3.5 La méthode Agile

La méthode Agile est un cadre de gestion de projet apparu en 2001 avec la publication du **Manifeste Agile**. Elle repose sur quatre valeurs fondamentales : privilégier les individus et les interactions sur les processus et les outils, un logiciel fonctionnel sur une documentation exhaustive, la collaboration avec le client sur la négociation contractuelle, et la réponse au changement sur le suivi d'un plan.

Concrètement, le développement Agile s'organise en **sprints** : des itérations courtes (1 à 4 semaines) à l'issue de chacune desquelles un incrément fonctionnel est livré et validé. Cette approche itérative permet d'ajuster les priorités en cours de projet en fonction des retours obtenus.

Pour notre projet, la méthode Agile s'est traduite par 6 sprints de deux semaines couvrant la période de février à mai 2026. Chaque sprint a fait l'objet d'une réunion de lancement (définition des tâches) et d'une réunion de clôture (démo et validation par le maître de stage).

---

### 4. Technologies envisagées et choix retenus

Le choix des technologies constitue une décision structurante qui conditionne les performances, la maintenabilité et l'évolutivité de l'application. Pour chaque composant clé de la stack, nous avons évalué plusieurs alternatives avant de retenir la solution la plus adaptée à nos contraintes.

#### 4.1 Framework JavaScript frontend

| Critère | Vue 3 | React 18 | Angular 17 |
|---|---|---|---|
| Courbe d'apprentissage | Faible | Moyenne | Élevée |
| Gestion d'état intégrée | Pinia (officiel) | Aucune (Redux externe) | NgRx (intégré) |
| Taille du bundle | Légère (~30 Ko) | Légère (~45 Ko) | Lourde (~130 Ko) |
| Performances | Très bonnes | Très bonnes | Bonnes |
| Système de composants | Options API + Composition API | JSX | TypeScript strict |
| Popularité (npm/semaine) | ~4 M | ~24 M | ~3 M |
| **Choix retenu** | ✅ **Oui** | Non | Non |

**Tableau 4 — Comparaison des frameworks JavaScript frontend**

**Justification :** Vue 3 avec la Composition API offre une excellente lisibilité du code, une intégration native avec Pinia pour la gestion d'état, et une courbe d'apprentissage bien adaptée à la durée du stage. La bibliothèque vue-konva fournit par ailleurs un wrapper Vue officiel pour Konva.js, ce qui simplifie l'intégration de l'éditeur canvas.

#### 4.2 Librairie de dessin canvas

| Critère | Konva.js | Fabric.js | PixiJS |
|---|---|---|---|
| Manipulation d'objets 2D | Excellente | Excellente | Limitée (orientée WebGL) |
| Wrapper Vue officiel | ✅ vue-konva | ❌ Manuel | ❌ Manuel |
| Gestion des événements | Complète | Complète | Partielle |
| Export PNG natif | ✅ | ✅ | Via plugin |
| Cas d'usage principal | Éditeurs interactifs | Éditeurs graphiques | Jeux / animations |
| **Choix retenu** | ✅ **Oui** | Non | Non |

**Tableau 5 — Comparaison des librairies canvas**

**Justification :** Konva.js est conçu spécifiquement pour les éditeurs interactifs nécessitant sélection, transformation et calques d'objets — exactement notre cas d'usage. Le wrapper vue-konva permet d'intégrer le canvas dans le système de composants Vue sans rupture de paradigme.

#### 4.3 Génération de PDF

| Critère | jsPDF | pdfmake | Puppeteer |
|---|---|---|---|
| Exécution côté client | ✅ | ✅ | ❌ (Node.js serveur) |
| Rendu fidèle au canvas | Via html-to-image | Via JSON de description | Via capture navigateur |
| Complexité d'intégration | Faible | Moyenne | Élevée |
| Poids de la librairie | ~250 Ko | ~400 Ko | Non applicable (CLI) |
| **Choix retenu** | ✅ **Oui** | Non | Non |

**Tableau 6 — Comparaison des solutions d'export PDF**

**Justification :** jsPDF, couplé à html-to-image pour la capture du canvas, permet de générer un PDF multi-pages (recto + verso) entièrement côté client, sans dépendance à un serveur de rendu. Cette approche est plus simple à déployer et évite la latence d'un aller-retour réseau pour chaque export.

#### 4.4 Framework backend

| Critère | Laravel (PHP) | Django (Python) | Express.js (Node) |
|---|---|---|---|
| Langage | PHP | Python | JavaScript / TypeScript |
| Architecture | MVC + ORM Eloquent | MVT + ORM Django | Minimaliste (sans convention) |
| Authentification SPA | Sanctum (officiel) | django-allauth | Passport.js |
| Courbe d'apprentissage | Moyenne | Moyenne | Faible |
| Écosystème | Très riche (Forge, Horizon, Sail) | Riche | Très vaste (npm) |
| **Choix retenu** | ✅ **Oui** | Non | Non |

**Tableau 7 — Comparaison des frameworks backend**

**Justification :** Laravel est un framework PHP mature disposant d'une documentation exhaustive et d'une solution d'authentification SPA officielle (Sanctum) nativement compatible avec les cookies de session — le mécanisme le plus sécurisé pour une SPA. Sa convention MVC et son ORM Eloquent permettent un développement rapide et structuré, adapté à la durée du stage.

#### 4.5 Système de gestion de base de données

| Critère | MySQL | PostgreSQL | MongoDB |
|---|---|---|---|
| Type | SGBDR | SGBDR | NoSQL (documents) |
| Intégration Laravel | Native | Native | Via package externe |
| Transactions ACID | ✅ | ✅ | Partielle |
| Données JSON natives | ✅ (JSON type) | ✅ (JSONB) | ✅ (natif) |
| Disponibilité dans Laragon | ✅ | ❌ | ❌ |
| **Choix retenu** | ✅ **Oui** | Non | Non |

**Tableau 8 — Comparaison des SGBD**

**Justification :** MySQL est intégré nativement dans Laragon, l'environnement de développement local utilisé pendant le stage. Sa compatibilité totale avec Laravel et son support du type de données JSON (utilisé pour stocker les éléments canvas de chaque carte) en font le choix naturel pour ce projet.

#### 4.6 Framework CSS et composants UI

| Critère | Tailwind CSS + DaisyUI | Bootstrap 5 | Bulma |
|---|---|---|---|
| Approche | Utilitaire (classes atomiques) | Composants prédéfinis | Composants CSS purs |
| Personnalisation | Totale (tokens dans config) | Limitée (variables SCSS) | Moyenne |
| Taille bundle final | Très légère (purge CSS) | Lourde (~150 Ko) | Moyenne (~200 Ko) |
| Thèmes sombre/clair | ✅ DaisyUI (30+ thèmes) | ✅ (2 thèmes de base) | ❌ Manuel |
| Composants métier | DaisyUI (cards, modals, alerts…) | Complets | Basiques |
| **Choix retenu** | ✅ **Oui** | Non | Non |

**Tableau 9 — Comparaison des frameworks CSS**

**Justification :** Tailwind CSS permet de concevoir des interfaces sur mesure sans écrire de CSS personnalisé, en composant des classes utilitaires directement dans les templates Vue. DaisyUI y ajoute une couche de composants sémantiques (boutons, modales, badges, alertes) stylisés avec les tokens de couleur du projet. La combinaison des deux offre une vélocité de développement supérieure à Bootstrap tout en produisant un bundle CSS allégé grâce à la purge automatique des classes inutilisées par Vite.

---

### 5. Environnement et outils de développement

Au-delà des frameworks et bibliothèques, le développement de la plateforme a nécessité un ensemble d'outils couvrant l'édition de code, la gestion des versions, l'environnement local et la modélisation.

| Outil | Catégorie | Rôle dans le projet |
|---|---|---|
| **Visual Studio Code** | IDE | Éditeur de code principal ; extensions utilisées : Volar (Vue 3), ESLint, Prettier, GitLens, Tailwind CSS IntelliSense |
| **Git / GitHub** | VCS | Gestion des versions du code source ; suivi de l'historique des modifications ; sauvegarde distante du dépôt |
| **Laragon** | Environnement local | Serveur Apache + MySQL + PHP intégré pour Windows ; démarre le backend Laravel sans configuration manuelle |
| **StarUML** | Modélisation UML | Création des diagrammes de cas d'utilisation, de classes et de séquences |
| **draw.io** | Modélisation / schémas | Réalisation des schémas d'architecture et des flux de données |
| **Postman** | Test API | Test et débogage des endpoints de l'API REST Laravel avant intégration frontend |

**Tableau 10 — Environnement et outils de développement**

---

### Conclusion du Chapitre II

Ce chapitre nous a permis d'établir les fondements théoriques et analytiques du projet. L'étude des exigences a défini le périmètre fonctionnel et les contraintes techniques de la plateforme. L'analyse de l'existant a mis en évidence l'absence d'un outil combinant éditeur canvas, gestion vCard et création en lot au sein d'une même application web. La définition des concepts clés — carte de visite numérique, QR code et vCard, éditeur canvas, SPA et méthode Agile — pose le vocabulaire commun sur lequel repose l'ensemble du développement. Enfin, les tableaux comparatifs ont justifié les choix technologiques retenus : Vue 3, Konva.js, jsPDF, Laravel et MySQL.

Fort de ces éléments théoriques et techniques, nous pouvons à présent aborder la phase de conception de la solution, objet du chapitre suivant.

---

---

## CHAPITRE III : CONCEPTION DE LA SOLUTION

### Introduction du Chapitre III

La phase de conception constitue le pont entre l'analyse théorique et la réalisation technique. Elle traduit les exigences identifiées au chapitre précédent en représentations formelles compréhensibles par toute l'équipe de développement. Les diagrammes présentés dans ce chapitre ont été réalisés à l'aide des outils **StarUML** (diagrammes UML) et **draw.io** (schémas d'architecture). Ce chapitre présente successivement les diagrammes de cas d'utilisation qui modélisent les interactions entre les acteurs et le système, l'architecture globale de l'application, le diagramme de classes qui structure les données, et les diagrammes de séquences illustrant les principaux flux fonctionnels.

---

### 1. Diagrammes de cas d'utilisation

Les diagrammes de cas d'utilisation (Use Case) décrivent, du point de vue de l'utilisateur, les fonctionnalités offertes par le système. Nous avons identifié trois acteurs principaux interagissant avec la plateforme.

#### 1.1 Acteurs du système

| Acteur | Description |
|---|---|
| **Utilisateur Free** | Compte standard — accès à la création de cartes (3 max), aux templates de la galerie, à l'export et au partage |
| **Utilisateur Premium** | Accès étendu — cartes illimitées, templates personnalisés illimités, création en lot, publication communautaire |
| **Administrateur** | Accès complet — toutes les fonctionnalités Premium + gestion des utilisateurs, modération, paramètres système |

**Tableau 9 — Acteurs du système**

#### 1.2 Cas d'utilisation — Module Authentification

```
┌─────────────────────────────────────────────────────────────────┐
│                     Système : Authentification                   │
│                                                                  │
│   ┌──────────────┐                                               │
│   │   Visiteur   │──── S'inscrire                                │
│   └──────────────┘──── Se connecter                             │
│                   ──── Réinitialiser mot de passe                │
│                                                                  │
│   ┌──────────────┐                                               │
│   │  Utilisateur │──── Modifier son profil                       │
│   │ authentifié  │──── Se déconnecter                            │
│   └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

**Figure 1 — Diagramme de cas d'utilisation : Authentification**

#### 1.3 Cas d'utilisation — Module Cartes

```
┌─────────────────────────────────────────────────────────────────┐
│                     Système : Gestion des cartes                 │
│                                                                  │
│   ┌───────────┐                                                  │
│   │   Free /  │──── Créer une carte (éditeur canvas)            │
│   │  Premium  │──── Modifier une carte existante                 │
│   └───────────┘──── Supprimer une carte                         │
│                ──── Exporter en PNG / PDF                        │
│                ──── Générer un lien de partage public            │
│                ──── Appliquer un template de la galerie          │
│                                                                  │
│   ┌───────────┐                                                  │
│   │  Premium  │──── Créer en lot depuis Excel/CSV               │
│   │ seulement │──── Publier dans la galerie communautaire        │
│   └───────────┘                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Figure 2 — Diagramme de cas d'utilisation : Gestion des cartes**

#### 1.4 Cas d'utilisation — Module Administration

```
┌─────────────────────────────────────────────────────────────────┐
│                     Système : Administration                     │
│                                                                  │
│   ┌───────────┐                                                  │
│   │   Admin   │──── Gérer les utilisateurs (ban/premium/suppr.) │
│   └───────────┘──── Modérer la galerie communautaire            │
│                ──── Gérer les templates officiels                │
│                ──── Configurer les paramètres système            │
│                ──── Consulter le tableau de bord KPI             │
└─────────────────────────────────────────────────────────────────┘
```

**Figure 3 — Diagramme de cas d'utilisation : Administration**

---

### 2. Architecture du système

#### 2.1 Architecture globale

La plateforme repose sur une architecture **client-serveur en trois couches** :

```
┌──────────────────────────────────────────────────────────────┐
│                    COUCHE PRÉSENTATION                        │
│              Vue 3 SPA  (port 5173 — Vite)                   │
│   ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐   │
│   │Dashboard │  │  Éditeur │  │  Galerie  │  │  Admin   │   │
│   └──────────┘  └──────────┘  └───────────┘  └──────────┘   │
│        Pinia (9 stores)  ·  Vue Router (18 vues)             │
└─────────────────────┬────────────────────────────────────────┘
                      │  HTTP / Axios (JSON)
                      │  Cookie de session (Sanctum)
┌─────────────────────▼────────────────────────────────────────┐
│                     COUCHE MÉTIER                             │
│              API REST Laravel  (port 8000)                    │
│   ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐   │
│   │   Auth   │  │  Cards   │  │ Templates │  │  Admin   │   │
│   │Controller│  │Controller│  │Controller │  │Controller│   │
│   └──────────┘  └──────────┘  └───────────┘  └──────────┘   │
│              Eloquent ORM  ·  Laravel Sanctum                 │
└─────────────────────┬────────────────────────────────────────┘
                      │  SQL / Eloquent
┌─────────────────────▼────────────────────────────────────────┐
│                   COUCHE DONNÉES                              │
│              MySQL — digital_card_platform                    │
│   users · cards · templates · brand_kits · notifications     │
│   custom_fonts · system_settings · sessions                  │
└──────────────────────────────────────────────────────────────┘
```

**Figure 4 — Architecture trois couches de la plateforme**

#### 2.2 Communication frontend ↔ backend

La communication entre le frontend Vue 3 et le backend Laravel repose sur deux mécanismes complémentaires :

- **Axios** : bibliothèque HTTP utilisée côté frontend pour émettre les requêtes vers l'API REST. Chaque requête transporte les données en format JSON et inclut automatiquement le cookie de session Sanctum grâce à la configuration `withCredentials: true`.
- **Laravel Sanctum** : système d'authentification SPA basé sur les cookies de session. Lors de la connexion, Laravel émet un cookie `laravel_session` sécurisé (HttpOnly, SameSite) qui est automatiquement joint à chaque requête ultérieure, sans nécessiter de token d'autorisation dans les en-têtes.

Les domaines autorisés sont définis dans la variable `SANCTUM_STATEFUL_DOMAINS` du fichier `.env` backend (`localhost:5173`), et les règles CORS sont configurées pour n'accepter que les requêtes provenant de `http://localhost:5173`.

---

### 3. Diagramme de classes

Le diagramme de classes modélise les entités principales du système et leurs relations. Il correspond directement au schéma de la base de données MySQL, les classes étant représentées par les modèles Eloquent de Laravel.

```
┌───────────────────────┐         ┌───────────────────────────┐
│         User          │         │          Card             │
├───────────────────────┤         ├───────────────────────────┤
│ + id : bigint (PK)    │         │ + id : uuid (PK)          │
│ + name : string       │         │ + user_id : bigint (FK)   │
│ + email : string      │1      * │ + title : string          │
│ + role : enum         ├─────────┤ + elements : json         │
│ + is_premium : bool   │         │ + backgrounds : json      │
│ + is_banned : bool    │         │ + share_slug : string     │
│ + email_verified_at   │         │ + created_at : timestamp  │
│ + password : string   │         │ + updated_at : timestamp  │
└───────┬───────────────┘         └───────────────────────────┘
        │ 1
        │                         ┌───────────────────────────┐
        │ *                       │        Template           │
┌───────▼───────────────┐         ├───────────────────────────┤
│       BrandKit        │         │ + id : uuid (PK)          │
├───────────────────────┤         │ + user_id : bigint (FK)   │
│ + id : bigint (PK)    │       * │ + name : string           │
│ + user_id : bigint FK │ 1       │ + elements : json         │
│ + colors : json       ├─────────┤ + backgrounds : json      │
│ + font_family : string│ User    │ + is_gallery : bool       │
│ + logo_url : string   │         │ + is_public : bool        │
└───────────────────────┘         │ + is_premium : bool       │
                                  │ + category : string       │
┌───────────────────────┐         │ + slug : string           │
│     Notification      │         └───────────────────────────┘
├───────────────────────┤
│ + id : bigint (PK)    │         ┌───────────────────────────┐
│ + user_id : bigint FK │         │      CustomFont           │
│ + type : string       │         ├───────────────────────────┤
│ + data : json         │         │ + id : bigint (PK)        │
│ + read_at : timestamp │         │ + user_id : bigint (FK)   │
└───────────────────────┘         │ + family : string         │
                                  │ + url : string            │
                                  └───────────────────────────┘
```

**Figure 5 — Diagramme de classes simplifié**

**Note sur la structure JSON des éléments canvas :**

Les champs `elements` et `backgrounds` des tables `cards` et `templates` stockent les données de l'éditeur en JSON. Cette approche permet de sauvegarder la totalité de l'état du canvas (recto et verso) dans un seul champ structuré, sans nécessiter une table relationnelle pour chaque élément graphique.

Exemple de structure d'un élément texte dans le champ `elements` :

```json
{
  "recto": [
    {
      "id": "el-001",
      "type": "text",
      "x": 40, "y": 80,
      "width": 250, "height": 40,
      "rotation": 0, "opacity": 1,
      "role": "firstName",
      "text": "Daniel",
      "fontSize": 24,
      "fontFamily": "Inter",
      "fill": "#1a1a2e"
    }
  ],
  "verso": []
}
```

---

### 4. Diagrammes de séquences

Les diagrammes de séquences illustrent les échanges chronologiques entre les composants du système lors des principaux flux fonctionnels.

#### 4.1 Séquence : Inscription et vérification email

```
Utilisateur    Vue (AuthView)    Pinia (authStore)    Laravel API       Gmail SMTP
    │                │                  │                  │                │
    │──Remplit form──▶                  │                  │                │
    │                │──POST /register──▶                  │                │
    │                │                  │──POST /register──▶               │
    │                │                  │                  │──Envoie email──▶
    │                │                  │                  │◀──Confirmé─────│
    │                │                  │◀──201 Created─────│               │
    │                │◀─Redirige /dash──│                  │                │
    │◀─Email reçu────────────────────────────────────────────────────────────│
    │──Clique lien vérif.──────────────────▶GET /verify-email               │
    │                │                  │◀─200 OK (vérifié)─│               │
```

**Figure 6 — Diagramme de séquence : Inscription**

#### 4.2 Séquence : Sauvegarde d'une carte

```
Utilisateur    Éditeur (Vue)    useEditorStore    cardsStore    Laravel API    MySQL
    │               │                 │               │              │            │
    │──Clique Enreg.─▶               │               │              │            │
    │               │──saveCard()────▶               │              │            │
    │               │                 │──saveCard()──▶              │            │
    │               │                 │               │──PUT /cards/{id}──▶      │
    │               │                 │               │              │──UPDATE───▶│
    │               │                 │               │              │◀──OK───────│
    │               │                 │               │◀──200 OK─────│            │
    │               │                 │◀──carte màj───│              │            │
    │◀──Toast succès─────────────────────────────────────────────────────────────│
```

**Figure 7 — Diagramme de séquence : Sauvegarde d'une carte**

#### 4.3 Séquence : Export PNG d'une carte

```
Utilisateur    Éditeur (Vue)    cardExporter.js    html-to-image    Navigateur
    │               │                  │                  │              │
    │──Clique Export─▶                 │                  │              │
    │               │──exportPNG()────▶                   │              │
    │               │                  │──toBlob(canvas)──▶             │
    │               │                  │◀──Blob PNG────────│             │
    │               │                  │──createObjectURL()──────────────▶
    │               │                  │◀──URL temporaire────────────────│
    │               │                  │──déclenche téléchargement────────▶
    │◀──Fichier PNG téléchargé──────────────────────────────────────────│
```

**Figure 8 — Diagramme de séquence : Export PNG**

#### 4.4 Séquence : Création en lot depuis Excel/CSV

```
Utilisateur    BatchModal (Vue)    userTemplatesStore    XLSX lib    cardsStore    API
    │               │                     │                │             │           │
    │──Import fichier▶                    │                │             │           │
    │               │──parseFile()────────▶               │             │           │
    │               │                     │──parse()───────▶            │           │
    │               │                     │◀──contacts[]───│            │           │
    │               │◀──aperçu contacts───│                │             │           │
    │──Confirme────▶│                     │                │             │           │
    │               │──createCards()──────▶                │             │           │
    │               │                     │  (pour chaque contact)       │           │
    │               │                     │──injectData(template+contact)│           │
    │               │                     │──saveCard()──────────────────▶           │
    │               │                     │                │             │──POST /cards▶
    │               │                     │                │             │◀──201 OK───│
    │◀──N cartes créées──────────────────────────────────────────────────────────────│
```

**Figure 9 — Diagramme de séquence : Création en lot**

---

### Conclusion du Chapitre III

La phase de conception a permis de formaliser l'ensemble des interactions, structures et flux de notre plateforme. Les diagrammes de cas d'utilisation ont délimité précisément le périmètre fonctionnel pour chacun des trois acteurs du système. L'architecture trois couches — Vue 3 SPA, API REST Laravel, base de données MySQL — garantit une séparation claire des responsabilités et facilite l'évolution indépendante de chaque couche. Le diagramme de classes a modélisé les six entités principales et leurs relations, reflétant fidèlement le schéma de la base de données. Enfin, les diagrammes de séquences ont illustré les quatre flux fonctionnels les plus représentatifs : inscription, sauvegarde, export et création en lot.

Cette modélisation rigoureuse a constitué le socle sur lequel s'est appuyé le développement. Le chapitre suivant détaille la réalisation concrète de ces spécifications, module par module, en suivant la progression des six sprints agiles.

---

## Ordre de rédaction (plan de travail)

1. 🔴 **Résumé** (à réécrire — priorité immédiate)
2. 🔴 **Abstract** (à réécrire — priorité immédiate)
3. ⬜ **Liste des sigles** (à remplir depuis tableau ci-dessus)
4. ⬜ **Chapitre II** — Aspects théoriques
5. ⬜ **Chapitre III** — Conception
6. ⬜ **Chapitre IV** — Réalisation et bilan
7. ⬜ **Conclusion générale**
8. ⬜ **Bibliographie / Webographie**
9. ⬜ **Sommaire complet** (à finaliser en dernier)
10. ⬜ **Liste des figures et tableaux** (à remplir au fur et à mesure)
