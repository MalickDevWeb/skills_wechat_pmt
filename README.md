<div align="center">
  <h1>🚀 Skills WeChat PMT</h1>
  <p><strong>The Ultimate AI-Driven Frontend Architecture for WeChat Mini Programs</strong></p>
  
  <img src="https://img.shields.io/badge/Architecture-Modular-blue?style=flat-square" alt="Modular" />
  <img src="https://img.shields.io/badge/AI_Ready-.cursorrules-success?style=flat-square" alt="AI Ready" />
  <img src="https://img.shields.io/badge/WeChat-MiniProgram-07C160?style=flat-square&logo=wechat" alt="WeChat" />
  <img src="https://img.shields.io/badge/Status-Enterprise_Grade-orange?style=flat-square" alt="Enterprise" />
</div>

<br />

Ce dépôt définit le standard d'architecture ultime pour le développement d'applications Frontend (spécialisé WeChat Mini Program). Conçu pour le travail en équipe et l'automatisation par l'Intelligence Artificielle, il garantit un code propre, sans conflit et ultra-performant.

## ✨ Pourquoi ce Kit ?

Développer des interfaces complexes avec plusieurs développeurs (ou avec des IAs génératives) finit souvent en "code spaghetti". Ce kit résout ce problème en imposant **4 piliers fondamentaux** :

1. 🤖 **Pilotage de l'IA (AI Handcuffing)** : Un fichier `.cursorrules` unique qui force n'importe quelle IA (Cursor, Copilot, Gemini) à respecter notre architecture au lieu de générer du code générique.
2. 🛡️ **Couche Anti-Corruption (API)** : Isolation totale du réseau. Le backend peut changer, l'UI ne cassera jamais grâce au mapping `json-sculpt`.
3. 🎭 **Développement Mock-First** : Création d'interfaces pixel-perfect déconnectées du réseau grâce aux "State Machines".
4. ⚡ **Performance Native** : Utilisation stricte de `WXS` (WeChat Scripts) pour soulager le thread logique (JS) et animations CSS fluides (Cubic-Bezier).

---

## 📁 Contenu du Kit

```text
📦 skills_wechat_pmt
 ┣ 📜 .cursorrules                     # Le Cerveau de l'IA (Règles API & UI combinées)
 ┣ 📜 DOC_API_POUR_DEVELOPPEURS.md     # Cheat Sheet Humain : Intégration API de A à Z
 ┣ 📜 DOC_UI_POUR_DEVELOPPEURS.md      # Cheat Sheet Humain : Création de Pages/Composants
 ┣ 📜 DOC_FLUX_COMPLEXES_ANIMATIONS.md # Modèles : Wizards, Bottom Sheets, Skeletons
 ┗ 📜 README.md
```

---

## 🚀 Comment l'installer sur un projet ?

### 1. Configuration de l'Intelligence Artificielle (Cursor / Copilot)
Prenez le fichier **`.cursorrules`** et glissez-le à la racine de votre projet d'application. 
À partir de cet instant, l'IA est configurée comme un "Tech Lead Senior". 

Utilisez ces **Mots-Clés Magiques** dans vos prompts pour la piloter :
- 🎨 `@UI-MOCK` : Force l'IA à prototyper un design avec de fausses données (Mock-first).
- 🔌 `@API-CONNECT` : Force l'IA à implémenter l'architecture réseau (`json-sculpt`, `EventBus`) sur une page existante.
- ⚡ `@FULL-FEATURE` : Force l'IA à créer le design ET le connecter à l'API en une seule étape.

### 2. Configuration pour l'Équipe (Humains)
Glissez les fichiers `DOC_*.md` dans le dossier `/docs` de votre projet.
Ce sont des "Textes à Trous" (Cheat Sheets) ultra-pédagogiques. N'importe quel développeur junior peut copier-coller ces modèles pour créer des flux complexes (Tiroirs, Animations de chargement, Appels API) sans risquer de créer des conflits Git avec ses collègues.

---

## 🛑 Les 5 Lois Immuables de l'Architecture
- **Loi de l'Isolation** : Un composant UI reste dans son dossier. On n'impacte jamais le global sans l'`EventBus`.
- **Loi de la Vue** : Pas de `formatDate()` en Javascript. On utilise `WXS` pour les calculs de vue.
- **Loi du Réseau** : On n'utilise jamais `wx.request` directement. Tout passe par le `HttpClient` sécurisé.
- **Loi des Mocks** : Toute UI doit pouvoir s'afficher avec une variable locale avant d'interroger le serveur.
- **Loi du i18n** : 0 texte en dur dans le code HTML.

---
<div align="center">
  <i>Développé et architecturé avec exigence pour des applications scalables.</i>
</div>
