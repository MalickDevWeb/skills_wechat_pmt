<div align="center">
  <img src="https://img.shields.io/badge/Architecture-Modular-blue?style=for-the-badge" alt="Modular" />
  <img src="https://img.shields.io/badge/AI_Ready-.cursorrules-success?style=for-the-badge" alt="AI Ready" />
  <img src="https://img.shields.io/badge/WeChat-MiniProgram-07C160?style=for-the-badge&logo=wechat" alt="WeChat" />
  
  <h1>🚀 SKILLS WECHAT PMT</h1>
  <p><strong>L'Architecture Frontend Ultime : Pilotable par IA & Zéro Conflit</strong></p>
</div>

<br />

> **Ce kit n'est pas un simple template.** C'est un **cerveau architectural** conçu pour les équipes ambitieuses. Il combine une isolation stricte des API, des modèles UI haute-performance, et un fichier magique (`.cursorrules`) qui force les Intelligences Artificielles (Copilot, Cursor) à coder avec la rigueur d'un Tech Lead Senior.

---

## 🌊 Le Workflow "Mock-First" (Comment on code ici)

Voici le flux de travail visuel imposé par cette architecture. On ne connecte jamais l'API avant d'avoir validé le design.

```mermaid
graph TD
    %% Couleurs et Styles
    classDef ai fill:#2ea44f,stroke:#fff,stroke-width:2px,color:#fff;
    classDef ui fill:#0366d6,stroke:#fff,stroke-width:2px,color:#fff;
    classDef api fill:#d73a49,stroke:#fff,stroke-width:2px,color:#fff;

    A["🎨 1. Prompt: @UI-MOCK"]:::ai -->|"Génère 4 fichiers isolés"| B("📱 Construction de l'UI<br>(Fausses Données)"):::ui
    B --> C{"Validation<br>Design"}
    
    C -->|"Design Approuvé"| D["🔌 2. Prompt: @API-CONNECT"]:::ai
    C -->|"À retravailler"| B
    
    D -->|"Création du Mappeur"| E["⚙️ json-sculpt<br>(Filtre anti-corruption)"]:::api
    E <-->|"Requête Sécurisée"| F[("🌐 Serveur Backend")]
    
    E -->|"Donnée Propre"| G["✅ Feature en Production"]:::ui
```

---

## 🏛️ L'Architecture Globale (Data Flow)

Comment les données circulent-elles sans créer de "Code Spaghetti" ?

```mermaid
sequenceDiagram
    autonumber
    participant UI as 📱 Composant UI
    participant Event as 🚌 EventBus (Global)
    participant Net as 🌐 BackendAPI
    
    Note over UI,Net: 1. Mode Connecté (@API-CONNECT)
    UI->>Net: await userAPI.getProfile()
    Net-->>UI: sculpt.data (Donnée nettoyée)
    
    Note over UI,Event: 2. Mode Partagé (Singletons)
    UI->>Event: Bus.setState('user', data)
    Event-->>UI: Toutes les NavBars se mettent à jour
```

---

## 🔑 Piloter l'IA (Les Mots de Pouvoir)

Glissez le fichier `.cursorrules` à la racine de votre projet. Ensuite, utilisez ces commandes dans votre chat IA :

| Commande Magique | Action de l'Intelligence Artificielle | Résultat |
| :--- | :--- | :--- |
| <kbd>@UI-MOCK</kbd> | Ignore le réseau. Construit une interface pixel-perfect avec WXS et des fausses données. | 🎨 Prototype visuel immédiat |
| <kbd>@API-CONNECT</kbd> | Se connecte au Backend. Construit le Mappeur `json-sculpt` et gère le Token OAuth2. | 🔌 Intégration Robuste |
| <kbd>@FULL-FEATURE</kbd> | Saute l'étape Mock. Construit la vue ET le réseau en simultané. | 🚀 Déploiement Rapide |

---

## 📦 Bibliothèque Humaine (Guides de Survie)

L'IA a son `.cursorrules`, mais vos développeurs humains ont aussi leurs guides :

- 📖 **`DOC_API_POUR_DEVELOPPEURS.md`** : L'antisèche ultime pour intégrer n'importe quel endpoint (GET, POST, PUT) les yeux fermés.
- 🎨 **`DOC_UI_POUR_DEVELOPPEURS.md`** : Comment créer des composants isolés, gérer les `lifetimes` WeChat, et formater via WXS.
- 🎬 **`DOC_FLUX_COMPLEXES_ANIMATIONS.md`** : Code copiable pour des parcours stressants (Wizards, Skeletons, Bottom Sheets).

---
<div align="center">
  <i>Propulsé par des standards d'ingénierie modernes. Écrit pour scale.</i>
</div>
