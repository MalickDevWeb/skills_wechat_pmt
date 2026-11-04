---
name: wechat-pmt
description: >-
  Expertise complète pour WeChat Mini-Program (PMT / TCMPP) : architecture modulaire anti-conflits,
  intégration API avec json-sculpt mappers, client HTTP BackendAPI, EventBus (Bus), gestion d'erreurs typées,
  bonnes pratiques UI WeChat (WXS ES5, setData optimisé, safe areas env(safe-area-inset-bottom), lifetimes composants),
  skeletons shimmer UX, SDK officiel Sonatel Max It, bouclier anti-double débit Orange Money et animations 60 FPS.
---

# ⚡ WeChat PMT : Référentiel d'Architecture & Standards de Production

Ce skill impose les règles strictes d'ingénierie logicielle pour concevoir, structurer et déployer des mini-programmes WeChat et TCMPP (Max It / Orange Money) à l'échelle industrielle.

---

## 🎯 DÉCLENCHEURS IA (LES 10 COMMANDES MAÎTRESSES)

| Commande IA | Domaine | Comportement Strict Imposé à l'IA |
|---|---|---|
| **`@UI-MOCK`** | UI & Prototypage | Crée l'UI en mode Mock-First avec state machine (`uiState`), feedback tactile Apple Press (`hover-class="btn--pressed"`) et animations 60 FPS. Zéro appel API. |
| **`@SKELETON-UX`** | États d'Attente UX | Conçoit les skeletons shimmer wave (`components/ux/`), cartes fantômes, empty-states et error-boundaries. Isolation totale de `components/ui/`. |
| **`@RESPONSIVE-UI`** | Layout iPhone Réel | Dimensionnement iPhone physique : Safe Areas `env(safe-area-inset-bottom)`, suppression de `100vh` rigide, nav bar dynamique calculée sous l'encoche et custom tab bar officiel synchronisé. |
| **`@INTERACTIVE-UI`** | Modales & Dates | Bottom-sheets avec backdrop blur et fermeture sécurisée (`catchtap="noop"`), et calendrier horizontal sans décalage de fuseau UTC avec gestion du délai `minDays`. |
| **`@IMAGE-MEDIA`** | Médias Résilients | Composant image tout-terrain : auto-retry à 3 essais pour réseau 4G instable, cache local de timestamps, fallback d'erreur et zoom plein écran natif WeChat (`wx.previewImage`). |
| **`@STATE-ENGINE`** | État & Cache | Gestion d'état industrielle : liaison déclarative sans fuite mémoire (`createPageHelpers`), Mixin `loadingBehavior` et cache Stale-While-Revalidate à 0 ms avec garde anti-race. |
| **`@SAFE-STORAGE`** | Persistance Locale | Accès stockage sécurisé : contournement du piège natif de la chaîne vide WeChat, protection contre le dépassement du quota de 10 Mo et méthode atomique `getOrSet`. |
| **`@SAFE-NAV`** | Routage WeChat | Sécurise la navigation contre le crash silencieux de la pile à 10 pages (`navigateToSafe`), anti-double clic (`withLock`) et retour intelligent vers Home si historique vide. |
| **`@API-CONNECT`** | Consommation Backend | Connecte l'écran au backend via le workflow strict en 4 étapes (Endpoint, Schema json-sculpt, Méthode BackendAPI, UI), auth OAuth2 avec buffer de sécurité de 60s et erreurs typées. |
| **`@NATIVE-PAY`** | Paiement Orange Money | Déploie le paiement marchand natif avec bouclier bancaire `_confirmedTxnid` (garantie 0% double débit), Smart Polling 4G et gestion des statuts incertains (`err.uncertain`). |
| **`@MAXIT-SDK`** | Façade Sonatel Max It | Intègre le SDK officiel `@sonatel-os/maxit-mini-sdk` : profil sans écran de login (`user()`), contacts, scan caméra seule anti-fraude et protection anti-capture d'écran (`screen.protect`). |
| **`@ANALYTICS-TRACK`** | Télémétrie & Taggage | Suivi d'audience et de conversion conforme Sonatel/Orange : traçage des écrans (`page_view`), clics CTA, tunnel de réservation et paiements avec file d'attente hors-ligne. |
| **`@DARK-MODE`** | Thème & Accessibilité | Support du mode sombre natif WeChat (`theme.json`), variables CSS sémantiques adaptatives et respect des normes de contraste WCAG AA. |
| **`@COMPILER-SAFE`** | Compilateur TCMPP | Élimine les pièges de compilation fatals : zéro BOM UTF-8 (`\uFEFF`), zéro `@font-face` local, clauses de garde obligatoires dans `onLoad` avec retour automatique. |

---

## 🏛️ PÔLE 1 : UI, SKELETONS SHIMMER, ANIMATIONS & RESPONSIVE

### 1.1 Règle des 4 Fichiers & Isolation
Chaque page ou composant vit strictement dans son propre dossier avec 4 fichiers :
```
pages/ma-page/
  ├── index.js      ← Logique & Machine à États (uiState)
  ├── index.wxml    ← Structure & Filtres WXS
  ├── index.wxss    ← Styles scopés BEM & Safe Area
  └── index.json    ← Configuration WeChat
```

### 1.2 Skeletons Shimmer & Séparation UI vs UX
- **`components/ui/`** : Composants de présentation purs. Ne portent AUCUN état asynchrone ni skeleton.
- **`components/ux/`** : Composants d'état et d'attente (Skeletons, Empty-states, Error-boundaries).
- **Animation Shimmer Universelle** : Utiliser la classe `.shimmer` avec dégradé fluide à 60 FPS sans bloquer le thread principal.

### 1.3 Feedback Tactile au Clic (`hover-class`)
- Bannir le CSS `:active` web. Toujours utiliser `hover-class="btn--pressed"` avec `hover-start-time="20"` et `hover-stay-time="100"` (`transform: scale(0.96); opacity: 0.85;`).

### 1.4 Responsive iPhone Réel & Safe Areas
- Tout élément fixé en bas (`position: fixed; bottom: 0;`) DOIT inclure : `padding-bottom: calc(XXrpx + env(safe-area-inset-bottom));`.
- Bannir `height: 100vh; overflow: hidden;`. Utiliser `min-height: 100vh;` pour laisser scroller les écrans à encoche et Dynamic Island.
- Remplacer les dimensions fractionnaires issues de Figma (`31.98rpx` → `32rpx`) pour éviter les gaps de sous-pixels sur écrans Retina.
- Bannir le nesting CSS non supporté en WXSS natif.
- Synchroniser l'index du Custom TabBar dans `onShow()` via `this.getTabBar().setData({ selected: INDEX })`.

### 1.5 Composant Image Industriel (`@IMAGE-MEDIA`)
- Utiliser `osn-image` avec `virtualHost: true`, `lazy-load` natif et auto-retry à 3 tentatives (délai exponentiel).
- Gérer l'état de chargement et le fallback d'erreur sans casser la grille de layout.
- Supporter le mode `previewable` avec `wx.previewImage` pour affichage plein écran natif WeChat.
- Mettre en cache local les timestamps de chargement pour éliminer les requêtes redondantes.

### 1.6 Bottom Sheets & Modales Responsives (`@MODAL-SHEET`)
- Utiliser `app-modal` avec slots multiples (`header`, `content`, `footer`) et `styleIsolation: 'apply-shared'`.
- Placements supportés : `'bottom'` (bottom sheet) et `'center'`.
- Pour les bottom-sheets : toujours inclure `max-height: 85vh; padding: 12rpx 32rpx env(safe-area-inset-bottom, 40rpx);`.
- Conversion automatique hex to RGBA dynamique avec backdrop blur et fermeture sur tap de l'overlay (`catchtap="noop"` sur le conteneur interne pour bloquer la propagation).

### 1.7 Sélecteurs Temporels & Calendrier Horizontal (`@DATE-PICKER`)
- Implémenter le sélecteur horizontal de dates avec calcul dynamique à partir de `minDays` (délai de prévenance).
- Détecter et signaler les dates bloquées via trigger d'événement `blocked`.
- Support des dates additionnelles choisies via picker natif avec flag `isAdditional: true`.
- Comparaisons de dates strictes au format ISO `YYYY-MM-DD` à minuit local (`T00:00:00`).

---

## 🧠 PÔLE 2 : LOGIQUE MÉTIER, NAVIGATION, STOCKAGE & BEHAVIORS

### 2.1 Navigation Sécurisée (Limite des 10 Pages)
- Ne jamais appeler `wx.navigateTo` à l'aveugle. Utiliser `navigateToSafe()` qui bascule automatiquement sur `wx.redirectTo` quand `getCurrentPages().length >= 10`.
- Retour Intelligent : Si `getCurrentPages().length === 1` (accès direct via deep link ou SMS), basculer sur `wx.switchTab({ url: '/pages/home/home' })` au lieu de bloquer.
- Anti-double tap : Verrouiller toute navigation ou action sensible avec `withLock(fn, 500)`.

### 2.2 Barre de Navigation Custom & Offset Écran (`@CUSTOM-NAVBAR`)
- Calculer dynamiquement le décalage sous la nav bar : `navContentOffset = statusBarHeight + 44 + Math.ceil(34 * windowWidth / 750)`.
- Mode logo centré vs mode titre avec flèche retour via observer de props (`showLogo, logoSrc`).
- Historique de navigation avec fallback vers `app.globalData.navHistory` et redirection vers les pages tabbar via `wx.switchTab`.

### 2.3 WeChat Behaviors (Mixins Officiels)
- Factoriser `isLoading`, `hasError`, `errorMessage` et la méthode `withLoading(asyncFn)` via `loadingBehavior` au lieu de dupliquer du code sur 20 pages.

### 2.4 Liaison Déclarative Page <-> EventBus (`@PAGE-BINDINGS`)
- Utiliser `createPageHelpers(this, stateBindings)` pour mapper automatiquement les clés d'état du Bus vers le `data` de la page.
- Exécuter `subscribe()` et `loadInitial()` dans `onLoad()`, et `unsubscribe()` impérativement dans `onUnload()` pour garantir zéro fuite mémoire.
- Encapsuler les appels critiques avec `retryAsync(fn, { maxRetries, delayMs, page })` pour refléter la progression du retry directement dans l'UI.

### 2.5 Cache Stale-While-Revalidate & Garde Anti-Race (`@STALE-REVALIDATE`)
- Stratégie SWR : afficher immédiatement les données du cache local (TTL 3 à 15 min), puis lancer la synchronisation API en arrière-plan sans bloquer l'interface.
- Bouclier anti-race condition : incrémenter un `_refreshRequestId` à chaque rafraîchissement et rejeter les réponses dont l'ID ne correspond plus à la dernière requête émise.

### 2.6 Persistance Locale Résiliente (`@SAFE-STORAGE`)
- Ne jamais appeler `wx.getStorageSync` directement sans wrapper : WeChat renvoie une chaîne vide `''` pour les clés absentes.
- Protéger les opérations contre le dépassement du quota local de 10 MB.
- Utiliser `storage.getOrSet(key, factory)` pour calculer et mettre en cache paresseusement les données lourdes.

### 2.7 Logique Métier & Favoris
- Traiter les dates sans décalage UTC (`new Date(`${dateStr}T00:00:00`)`).
- Favoris réactifs : Double cache (mémoire synchrone à 0 ms de latence + persistance locale asynchrone).

---

## 🔌 PÔLE 3 : CONSOMMATION API & GESTION DES DONNÉES

### 3.1 Workflow Strict d'Intégration API (SOP)
Exécuter impérativement dans cet ordre :
1. **Routing** : Ajouter l'endpoint dans `ENDPOINTS` de `utils/apis/`.
2. **Schema** : Définir la structure stricte dans `utils/mappers/` avec `json-sculpt`.
3. **Service** : Créer la méthode dans `BackendAPI` (`await authenticate()`, appel `this.#client`, sculpteur de données).
4. **UI** : Consommer dans la page à l'intérieur d'un bloc `try/catch/finally`.

### 3.2 Authentification OAuth2 avec Marge de Sécurité (Buffer 60s)
- Le token n'est considéré valide que si `Date.now() < (expiry - 60000)`. Cela élimine 100 % des erreurs 401 en cours de transit mobile.

### 3.3 Gestion des Erreurs Typées
- Utiliser `handleAppError(error)` pour mapper `NetworkError`, `AuthorizationError`, `ValidationError` vers des messages utilisateur bienveillants.

---

## ⚙️ PÔLE 4 : INTÉGRATION HÔTE MAX IT, PAIEMENT & SÉCURITÉ

### 4.1 Façade Officielle `@sonatel-os/maxit-mini-sdk`
- Privilégier `miniSDK` pour l'identité (`miniSDK.user()`), le login (`miniSDK.login()`), le paiement et les contacts.
- Activer `simulate: true` sous WeChat DevTools pour tester les fixtures sans terminal physique.

### 4.2 Bouclier Anti-Double Débit Orange Money
- Dès que le plugin natif confirme le débit, sceller immédiatement `this._confirmedTxnid = txnid`.
- En cas de coupure réseau 4G pendant la confirmation backend, le bouton "Réessayer" court-circuite complètement le débit bancaire (0 franc prélevé en plus).
- Utiliser le Smart Polling à 3 essais avec backoff progressif (0s, 2s, 4s).
- Si `err.uncertain === true`, NE JAMAIS redemander de payer immédiatement.

### 4.3 Sécurité des Écrans Sensibles
- Verrouiller la capture d'écran sur les billets QR via `miniSDK.screen.protect(true)`.
- **Règle vitale** : Toujours appeler `miniSDK.screen.protect(false)` dans `onHide()` et `onUnload()`.

---

## 🛠️ PÔLE 5 : COMPILATEUR TCMPP & QUALITÉ D'ÉQUIPE

### 5.1 Pièges Fatals de Compilation
- **Zéro BOM UTF-8** : Tout fichier doit être sauvegardé en UTF-8 sans BOM (`\uFEFF`) sous peine de crash syntaxique.
- **Zéro @font-face local** : Ne jamais charger de `.ttf` locaux dans les WXSS (erreur 404 avec `-do-not-use-local-path-`).
- **Guards dans onLoad** : Valider tout paramètre requis dès l'entrée avec toast d'alerte et retour automatique.

### 5.2 Collaboration Multi-Développeurs (Zéro Conflit Git)
- Chaque développeur est propriétaire d'un sous-dossier exclusif.
- Les fichiers partagés (`app.js`, `app.wxss`, `utils/`) ne sont modifiés qu'avec l'accord explicite du Tech Lead.

### 5.3 Outillage & Automatisation CLI
- **`node scripts/skill-doctor.js`** : Valide l'intégrité globale du skill (détection de BOM UTF-8 `\uFEFF`, validation JSON, vérification de l'absence de nesting SCSS en WXSS, exhaustivité des déclencheurs IA).
- **`node scripts/create-page.js <dossier> [--with-api]`** : Échafaude immédiatement les 4 fichiers d'une nouvelle page (`.js`, `.wxml`, `.wxss`, `.json`) avec machine à états `uiState`, Safe Area iPhone, classes `hover-class` Apple Press et câblage optionnel `backendAPI`.
- **`node scripts/create-component.js <dossier> [--ux]`** : Échafaude les 4 fichiers d'un composant (`Component()`, lifetimes strictes, `triggerEvent`, BEM, Safe Areas) en mode présentation ou UX skeleton shimmer.
- **`node scripts/create-api.js <domaine>`** : Échafaude le service API (`utils/apis/<domaine>.api.js`) et son mappeur `json-sculpt` (`utils/mappers/<domaine>.js`) avec endpoints, méthodes CRUD et gestion d'erreurs typées.
- **`npm test` / `npm run doctor`** : Automatise l'audit de conformité (zéro BOM UTF-8, syntaxe JSON, WXSS, déclencheurs IA) exécuté par la CI GitHub Actions.
