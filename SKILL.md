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

## 🎯 DÉCLENCHEURS IA (MOTS-CLÉS D'ACTIVATION)

| Mot-Clé | Domaine d'Application |
|---|---|
| **`@UI-MOCK`** | Crée l'UI en mode Mock-First avec state machine (`uiState`) sans appel réseau. |
| **`@SKELETON-UX`** | Conçoit les skeletons shimmer wave (`components/ux/`), empty-states et error-boundaries. |
| **`@PAGE-ANIM`** | Ajoute le feedback tactile (`hover-class` Apple Press) et les transitions de page 60 FPS. |
| **`@RESPONSIVE-UI`** | Dimensionnement iPhone réel (Safe Area, suppression de `100vh` rigide, capsule WeChat). |
| **`@CUSTOM-TABBAR`** | Implémente ou synchronise le custom tab bar officiel WeChat sans aucun clignotement. |
| **`@SAFE-NAV`** | Sécurise la navigation (pile de 10 pages, anti-double tap lock `withLock`, retour intelligent). |
| **`@BEHAVIOR-MIXIN`** | Factorise l'état et le chargement asynchrone avec les Behaviors natifs (`loadingBehavior`). |
| **`@API-CONNECT`** | Connecte un écran existant au backend via le workflow strict en 4 étapes (Endpoint, Schema, Service, UI). |
| **`@FULL-FEATURE`** | Construit la vue UI et la connecte directement à l'API en une seule passe. |
| **`@MAXIT-SDK`** | Utilise la façade officielle `@sonatel-os/maxit-mini-sdk` (identité, login, contacts, scan, protect). |
| **`@NATIVE-PAY`** | Déploie le flux de paiement marchand Orange Money avec bouclier bancaire `_confirmedTxnid` (0% double débit). |
| **`@COMPILER-SAFE`** | Élimine les pièges de compilation TCMPP (BOM UTF-8, @font-face 404, guards `onLoad`). |

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
- Synchroniser l'index du Custom TabBar dans `onShow()` via `this.getTabBar().setData({ selected: INDEX })`.

---

## 🧠 PÔLE 2 : LOGIQUE MÉTIER, NAVIGATION & BEHAVIORS

### 2.1 Navigation Sécurisée (Limite des 10 Pages)
- Ne jamais appeler `wx.navigateTo` à l'aveugle. Utiliser `navigateToSafe()` qui bascule automatiquement sur `wx.redirectTo` quand `getCurrentPages().length >= 10`.
- Retour Intelligent : Si `getCurrentPages().length === 1` (accès direct via deep link ou SMS), basculer sur `wx.switchTab({ url: '/pages/home/home' })` au lieu de bloquer.
- Anti-double tap : Verrouiller toute navigation ou action sensible avec `withLock(fn, 500)`.

### 2.2 WeChat Behaviors (Mixins Officiels)
- Factoriser `isLoading`, `hasError`, `errorMessage` et la méthode `withLoading(asyncFn)` via `loadingBehavior` au lieu de dupliquer du code sur 20 pages.

### 2.3 Logique Métier & Favoris
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
