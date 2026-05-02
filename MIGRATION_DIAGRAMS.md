# Diagrammes de Migration — localStorage → Laravel API

Documentation visuelle de la migration de l'architecture de persistance,
du stockage localStorage côté navigateur vers une API REST Laravel 11 + MySQL.

> Coller chaque bloc dans [plantuml.com](https://www.plantuml.com/plantuml/uml/) ou utiliser l'extension VS Code **PlantUML** (Alt+D).

---

## Diagramme 1 — Architecture Avant / Après (Composants)

```plantuml
@startuml DiagrammeArchitecture
!theme plain
skinparam backgroundColor #FAFAFA
skinparam componentStyle rectangle
skinparam packageStyle rectangle

package "AVANT — Architecture localStorage" #FFEEEE {
    package "Frontend Vue 3" {
        component "Vue Components\n(EditorCanvas, DashboardView...)" as COMP_A
        component "Pinia Stores\nauthStore · cards · templates\nbrandKit · adminStore" as STORES_A
    }
    database "localStorage\n(clé-valeur JSON, par email)" as LS
    COMP_A --> STORES_A
    STORES_A <--> LS : "get/setItem\nJSON.parse / stringify\nSYNCHRONE"
}

package "APRÈS — Architecture Laravel API" #EEFFEE {
    package "Frontend Vue 3 " {
        component "Vue Components\n(inchangés)" as COMP_B
        component "Pinia Stores\n(+ couche async/await)" as STORES_B
        component "src/api/\naxios.js · cards.js · templates.js\nbrandKit.js · admin.js" as API_LAYER
    }
    package "Backend Laravel 11" {
        component "Laravel Sanctum\n(CSRF Cookie + Session)" as SANCTUM
        component "Controllers\nAuth · Card · Template · BrandKit · Admin" as CTRL
        component "Eloquent Models\nUser · Card · Template · BrandKit" as MODELS
    }
    database "MySQL Database" as DB

    COMP_B --> STORES_B
    STORES_B --> API_LAYER
    API_LAYER <--> SANCTUM : "HTTP / JSON\nwithCredentials: true"
    SANCTUM --> CTRL
    CTRL --> MODELS
    MODELS <--> DB
}
@enduml
```

---

## Diagramme 2 — Correspondance localStorage → API + Tables

```plantuml
@startuml DiagrammeCorrespondance
!theme plain
skinparam backgroundColor #FAFAFA
left to right direction

package "AVANT — localStorage Keys" #FFEEEE {
    artifact "digitalcard_userCards_{email}" as K1
    artifact "digitalcard_userTemplates_{email}" as K2
    artifact "digitalcard_allUsers" as K3
    artifact "digitalcard_public_{cardId}" as K4
    artifact "userProfilePhoto_{email}" as K5
    artifact "digitalcard_adminTemplateOverrides" as K6
    artifact "digitalcard_adminRemovedTemplates" as K7
    artifact "(brand kit — volatile)" as K8
    artifact "ecodev_custom_fonts_{email}" as K9
    artifact "theme (dark/light)" as K10
}

package "APRÈS — API + Tables MySQL" #EEFFEE {
    component "cards\nCRUD  /api/cards" as T1 #90EE90
    component "templates\nCRUD  /api/templates" as T2 #90EE90
    component "users\n/api/admin/users" as T3 #90EE90
    component "cards.is_public + share_slug\n/api/share/{id}" as T4 #90EE90
    component "users.avatar_url\n/api/auth/avatar" as T5 #90EE90
    component "templates.is_gallery=true\n/api/admin/templates/{id}" as T6 #90EE90
    component "DELETE /api/admin/templates/{id}" as T7 #90EE90
    component "brand_kits\nGET · PUT  /api/brand-kit" as T8 #90EE90
    component "⚠️ Encore localStorage\n(polices custom)" as T9 #FFFFAA
    component "⚠️ Encore localStorage\n(préférence UX)" as T10 #FFFFAA
}

K1 --> T1 : "✅ Migré"
K2 --> T2 : "✅ Migré"
K3 --> T3 : "✅ Migré"
K4 --> T4 : "✅ Migré"
K5 --> T5 : "✅ Migré"
K6 --> T6 : "✅ Migré"
K7 --> T7 : "✅ Migré"
K8 --> T8 : "✅ Migré"
K9 --> T9 : "⚠️ Partiel"
K10 --> T10 : "⚠️ Partiel"
@enduml
```

---

## Diagramme 3 — Séquence : saveCard() Avant vs Après

```plantuml
@startuml DiagrammeSequence
!theme plain
skinparam backgroundColor #FAFAFA
skinparam sequenceMessageAlign center

participant "Vue Component" as UI
participant "Pinia Store\n(cards.js)" as Store
participant "localStorage" as LS #FFD0D0
participant "src/api/cards.js" as API #D0FFD0
participant "Laravel CardController" as Back #D0FFD0
database "MySQL" as DB #D0FFD0

== AVANT — saveCard() ==
UI -> Store : saveCard(cardData)
Store -> LS : JSON.stringify(cards)
Store -> LS : setItem('digitalcard_userCards_email')
LS --> Store : ✅ Synchrone
note right of LS : Isolé par email\nPas de multi-appareils

== APRÈS — saveCard() ==
UI -> Store : saveCard(cardData)
Store -> API : cardsApi.update(id, payload)
API -> Back : PUT /api/cards/{id}\n{ title, elements, backgrounds, meta }
Back -> DB : UPDATE cards SET ...
DB --> Back : ✅ Rows updated
Back --> API : 200 { card: { id, title, ... } }
API --> Store : _normalizeCard()\n(snake_case → camelCase)
Store --> UI : Pinia réactif mis à jour
note right of DB : Centralisé\nMulti-appareils\nPartage via share_slug
@enduml
```

---

## Diagramme 4 — Phases de Migration

```plantuml
@startuml DiagrammePhases
!theme plain
skinparam backgroundColor #FAFAFA
skinparam rectangleBorderColor #16a34a
skinparam rectangleBackgroundColor #90EE90

rectangle "Phase 4.1\n**Authentification**\nlogin · register · logout\nSanctum session cookie" as P1
rectangle "Phase 4.2\n**Cards CRUD**\n/api/cards\nnormalisation snake→camelCase" as P2
rectangle "Phase 4.3\n**Templates + Gallery**\n/api/templates\n/api/gallery" as P3
rectangle "Phase 4.4\n**Brand Kit**\n/api/brand-kit\nupload logo (multipart)" as P4
rectangle "Phase 4.5\n**Admin Dashboard**\n/api/admin/*\nusers · cards · settings" as P5
rectangle "Phase 4.6\n**Éditeur → API**\nsaveCard() async\nautosave supprimé" as P6

P1 -right-> P2
P2 -right-> P3
P3 -right-> P4
P4 -right-> P5
P5 -right-> P6
@enduml
```

---

## Diagramme 5 — Classes des Entités Migrées

```plantuml
@startuml DiagrammeClasses
!theme plain
skinparam backgroundColor #FAFAFA
skinparam classAttributeIconSize 0

class User {
    +int id
    +string email
    +string name
    +string role
    +bool is_banned
    +bool is_premium
    +date premium_expires_at
    +string avatar_url
}

class Card {
    +int id
    +int user_id
    +string title
    +json elements
    +json backgrounds
    +json meta
    +bool is_public
    +string share_slug
    +int views
    +int downloads
    +int qr_scans
}

class Template {
    +int id
    +int user_id
    +string name
    +bool is_gallery
    +string slug
    +json meta
    +json field_config
}

class BrandKit {
    +int id
    +int user_id
    +json colors
    +json fonts
    +string logo_url
}

class SystemSetting {
    +bool maintenanceMode
    +bool allowGallery
    +int maxCardsPerUser
    +int maxCardsPerPremium
    +int maxTemplatesPerUser
}

note bottom of SystemSetting
  Singleton — une seule ligne
  en base de données
end note

User "1" --> "0..*" Card     : owns
User "1" --> "0..*" Template : owns
User "1" --> "1"    BrandKit : has
SystemSetting ..> User       : controls access
SystemSetting ..> Card       : limits quantity
@enduml
```

---

## Tableau récapitulatif — Statut de migration par store

| Store | Fichier | Statut | Endpoint(s) |
|-------|---------|--------|-------------|
| `authStore` | `src/stores/authStore.js` | ✅ Migré | `/api/auth/*` |
| `cardsStore` | `src/stores/cards.js` | ✅ Migré | `/api/cards` |
| `userTemplatesStore` | `src/stores/userTemplatesStore.js` | ✅ Migré | `/api/templates` |
| `brandKit` | `src/stores/brandKit.js` | ✅ Migré | `/api/brand-kit` |
| `adminStore` | `src/stores/adminStore.js` | ✅ Migré | `/api/admin/*` |
| `notificationStore` | `src/stores/notificationStore.js` | ✅ Migré | `/api/notifications` |
| `themeStore` | `src/stores/themeStore.js` | ⚠️ localStorage | — (préférence UX) |
| `fontStore` | `src/stores/fontStore.js` | ⚠️ localStorage | — (fichiers base64) |
| `useEditorStore` | `src/stores/useEditorStore.js` | ⚙️ In-memory | Sauvegardé via `saveCard()` |
