> 🔗 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [SDK Max It Sonatel](DOC_MAXIT_MINI_SDK_SONATEL.md) | [Paiement & Résilience](DOC_PAIEMENT_NATIVE_MAXIT_ET_RESILIENCE.md) | [Responsive & TabBar](DOC_RESPONSIVE_IPHONE_ET_CUSTOM_TABBAR.md) | [Navigation & Behaviors](DOC_NAVIGATION_BEHAVIORS_ET_METIER.md) | [Pièges Compilateur & Prod](DOC_PIEGES_COMPILATEUR_ET_PATTERNS_PROD.md) | [Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Debug](DOC_DEBUG_ET_NOUVELLES_RECETTES.md) | [Checklist](DOC_CHECKLIST_AVANT_DE_CODER.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# 📚 Le Livre de Recettes : Solutions Complètes Prêtes à l'Emploi

Chaque recette est une **solution complète et autonome**. Vous trouvez votre situation, vous copiez le bloc entier (Mappeur + API + JS + HTML + CSS), vous changez uniquement les `[CROCHETS]`, et votre fonctionnalité est opérationnelle.

## 📑 Sommaire — Trouvez votre situation
| Numéro | Je dois coder... | Complexité |
|---|---|---|
| 🔵 [Recette 1](#-recette-1--page-de-liste-avec-api--skeleton--scroll-infini) | Une page de liste qui charge depuis le serveur, avec skeleton et scroll infini | Moyenne |
| 🔵 [Recette 2](#-recette-2--formulaire-complet-avec-validation-et-envoi-api) | Un formulaire avec validation en direct et envoi au serveur | Moyenne |
| 🔵 [Recette 3](#-recette-3--page-de-détail-avec-api) | Une page de détail (produit, vol, profil) qui affiche les données du serveur | Facile |
| 🔵 [Recette 4](#-recette-4--upload-photo--envoi-au-serveur) | Un bouton pour choisir une photo et l'envoyer au serveur | Moyenne |
| 🔵 [Recette 5](#-recette-5--filtres-sur-une-page-séparée-qui-rafraîchit-la-liste) | Un système de filtres sur une page dédiée qui recharge la liste principale | Avancée |
| 🔵 [Recette 6](#-recette-6--compteur-de-panier-partagé-entre-toutes-les-pages) | Un compteur (panier, notifications) visible sur toutes les pages | Avancée |
| 🟢 [Recette 7](#-recette-7--connexion--login-et-protection-de-pages) | Une page de connexion avec sauvegarde du token et redirection | Facile |
| 🟢 [Recette 8](#-recette-8--pull-to-refresh-tirer-pour-recharger) | Tirer vers le bas pour recharger la liste (comme Facebook, Instagram) | Facile |
| 🟢 [Recette 9](#-recette-9--recherche-en-temps-réel-debounce) | Une barre de recherche qui interroge le serveur après que l'utilisateur a fini de taper | Moyenne |
| 🟢 [Recette 10](#-recette-10--bouton-favoritlike-toggle) | Un bouton "Cœur" ou "Étoile" qui s'allume et s'éteint (avec sauvegarde serveur) | Facile |
| 🟢 [Recette 11](#-recette-11--partage-wechat-envoyer-à-un-ami) | Envoyer une page ou un contenu à un ami via WeChat | Facile |
| 🟢 [Recette 12](#-recette-12--onglets-tabs-avec-changement-de-données) | Un menu à onglets qui change le contenu et recharge les données | Moyenne |
| 🟢 [Recette 13](#-recette-13--cache-local-garder-des-données-hors-ligne) | Sauvegarder des données localement pour que l'app fonctionne sans réseau | Moyenne |
| 🔴 [Recette 14](#-recette-14--paiement-marchand-natif-avec-bouclier-anti-double-débit) | Paiement Marchand TCMPP / Max It avec protection 0% double débit | Critique |
| 🔴 [Recette 15](#-recette-15--smart-polling-asynchrone-avec-backoff-progressif) | Validation asynchrone résiliente aux micro-coupures 4G (3 essais) | Avancée |
| 📱 [Recette 16](#-recette-16--barre-de-navigation-custom--capsule-wechat) | En-tête sur mesure aligné au pixel près sur la capsule WeChat | Moyenne |
| 📱 [Recette 17](#-recette-17--custom-tabbar-wechat-sans-scintillement) | Barre d'onglets personnalisée officielle WeChat avec badges | Avancée |
| ⚡ [Recette 18](#-recette-18--store-réactif-léger-avec-cache-stale-while-revalidate) | Partage d'état global sans bibliothèque externe avec cache TTL | Avancée |
| 🚦 [Recette 19](#-recette-19--navigation-sécurisée-anti-crash-pile-10-pages) | Protection contre le blocage des 10 pages WeChat + Anti-Double Tap | Facile |
| 🧩 [Recette 20](#-recette-20--wechat-behavior-partagé-loadingbehavior) | Mixin officiel WeChat pour gérer isLoading et erreurs sans duplication | Moyenne |
| ❤️ [Recette 21](#-recette-21--favoris-instantanés-double-cache-mémoire--disque) | Gestion optimiste des favoris à 0ms de latence avec persistance | Moyenne |
| 📊 [Recette 22](#-recette-22--calculateur-de-délais--barèmes-dannulation) | Calcul des jours restants et pourcentages de remboursement sans bug UTC | Moyenne |
| 📱 [Recette 23](#-recette-23--initialisation-du-sdk-officiel-max-it-dans-appjs) | Configuration du SDK officiel Max It avec simulation DevTools | Facile |
| 👤 [Recette 24](#-recette-24--identité-utilisateur-sans-login-screen) | Récupération du profil et du code auth via miniSDK.user() & login() | Facile |
| 💳 [Recette 25](#-recette-25--paiement-orange-money-officiel-avec-minisdkpay) | Paiement avec gestion automatique du doublon caction:'1' et uncertain | Critique |
| 🛡️ [Recette 26](#-recette-26--protection-anti-screenshot-de-billet-qr) | Verrouillage capture d'écran sur billet avec déverrouillage obligatoire | Moyenne |
| 📷 [Recette 27](#-recette-27--scanner-qr-caméra-seule-anti-fraude) | Lecture de QR code via caméra uniquement (sans accès galerie photo) | Facile |
| 🔗 [Recette 28](#-recette-28--deep-linking-sans-boucle-onshow) | Traitement propre des liens d'ouverture sans redéclenchement au retour | Moyenne |
| 🛡️ [Recette 29](#-recette-29--clause-de-garde-darguments-onload) | Sécurisation des pages contre les paramètres manquants avec retour auto | Facile |
| 🔄 [Recette 30](#-recette-30--bouton-retour-intelligent-anti-blocage) | Fallback automatique vers l'accueil quand la page est ouverte sans historique | Facile |
| ⚡ [Recette 31](#-recette-31--anti-flash-de-chargement-0-élément) | Suppression du clignotement à zéro et gestion pluriel propre | Facile |
| 🔒 [Recette 32](#-recette-32--anti-clic-universel-withlock) | Verrouillage anti-rebond d'action réutilisable sur n'importe quelle méthode | Facile |
| 🚨 [Recette 33](#-recette-33--gestionnaire-centralisé-derreurs-typées) | Toast d'erreur contextualisé selon le type (Réseau, Session, Validation) | Moyenne |
| 🤝 [Recette 34](#-recette-34--matrice-disolation-multi-développeurs) | Organisation à 7 développeurs en simultané avec zéro conflit Git | Avancée |
| 👆 [Recette 35](#-recette-35--feedback-tactile-au-clic-hover-class) | Effet de pression "Apple Press" au clic sur boutons et cartes | Facile |
| 🎬 [Recette 36](#-recette-36--animation-dentrée-de-page-fluide) | Transition d'entrée de page douce à 60 FPS avec cascade | Facile |
| 🏆 [Recette 37](#-recette-37--animation-séquentielle-intro-success) | Séquence animée JS avec wx.createAnimation (zoom, rebond, docking) | Avancée |
| 🖼️ [Recette 38](#-recette-38--image-résiliente-avec-retry-3x-et-zoom-plein-écran) | Composant image tout-terrain avec auto-retry 4G et preview natif | Facile |
| 🪟 [Recette 39](#-recette-39--bottom-sheet-avec-safe-area-et-backdrop-blur) | Panneau bas responsive iPhone avec padding Home Indicator | Moyenne |
| 📅 [Recette 40](#-recette-40--calendrier-horizontal-sans-décalage-utc) | Sélecteur de dates avec minDays, blocage et dates additionnelles | Moyenne |
| 🧭 [Recette 41](#-recette-41--nav-bar-sur-mesure-avec-calcul-dynamique-dencoche) | Header custom aligné au pixel près sous la capsule WeChat | Moyenne |
| 🔄 [Recette 42](#-recette-42--liaison-page-eventbus-sans-fuite-mémoire) | Gestionnaire createPageHelpers avec désinscription automatique | Facile |
| ⚡ [Recette 43](#-recette-43--cache-stale-while-revalidate-avec-garde-anti-race) | Affichage instantané 0ms et synchronisation silencieuse | Avancée |
| 💾 [Recette 44](#-recette-44--stockage-local-résilient-anti-quota-10mo) | Wrapper storage avec getOrSet et protection contre chaîne vide | Facile |
| 🌙 [Recette 45](#-recette-45--thème-sombre-dark-mode-avec-variables-css) | Support du mode sombre avec variables adaptatives et écoute à chaud | Moyenne |
| 🌍 [Recette 46](#-recette-46--data-saver-compression-dimage-avant-upload--moniteur-3g) | Compression JPEG 75% client (gain 95% data) et détection 2G/3G | Moyenne |
| 🛡️ [Recette 47](#-recette-47--conformité-cdp-masquage-msisdn-et-purge-sécurisée) | Masquage légal numéro de téléphone et purge de session | Facile |

---

## 🔵 Recette 1 : Page de Liste avec API + Skeleton + Scroll Infini

**Quand l'utiliser ?** Vous affichez une liste de produits, de vols, de commandes, etc. La liste se charge depuis le serveur et s'allonge automatiquement quand on descend.

### Étape 1/4 — Le Mappeur (`utils/mappers/[MON_DOMAINE].js`)
```javascript
// ✏️ Définit la "forme" de chaque élément de la liste
export const [MonItemSchema] = {
  id:    "@link.[id_serveur]",
  titre: "@link.[nom_serveur]",
  prix:  "@link.[prix_serveur]::number"
};
```

### Étape 2/4 — L'API (`utils/apis/[mondomaine].api.js`)
```javascript
async getListe(page = 1) {
  await authenticate();
  const res = await httpClient.get('[/api/ma-route]', { query: { page, limit: 10 } });
  if (!res.success) throw new Error(res.error?.message);
  return sculpt.list({ data: res.data.items, to: [MonItemSchema] });
}
```

### Étape 3/4 — La Page (`pages/[ma-page]/index.js`)
```javascript
import { [monAPI] } from '../../utils/apis/index.js';

Page({
  data: {
    uiState: 'loading', // loading | content | empty | error
    liste: [],
    pageActuelle: 1,
    estFini: false
  },

  onLoad() { this.charger(); },

  // 🔒 Se déclenche automatiquement quand on touche le bas
  onReachBottom() {
    if (!this.data.estFini) this.charger();
  },

  async charger() {
    try {
      const nouvelles = await [monAPI].getListe(this.data.pageActuelle);
      const listeMaj = [...this.data.liste, ...nouvelles];
      this.setData({
        liste: listeMaj,
        pageActuelle: this.data.pageActuelle + 1,
        estFini: nouvelles.length === 0,
        uiState: listeMaj.length === 0 ? 'empty' : 'content'
      });
    } catch (e) {
      this.setData({ uiState: 'error' });
      wx.showToast({ title: e.message, icon: 'none' });
    }
  }
});
```

### Étape 4/4 — La Vue (`index.wxml` + `index.wxss`)
```xml
<wxs src="../../utils/wxs/filters.wxs" module="f" />

<!-- ÉTAT : Chargement initial (Skeleton) -->
<view wx:if="{{uiState === 'loading'}}" class="container">
  <view wx:for="{{[1,2,3,4]}}" class="skeleton-card animate-pulse" />
</view>

<!-- ÉTAT : Liste affichée -->
<view wx:elif="{{uiState === 'content'}}" class="container animate-fade-in">
  <view wx:for="{{liste}}" wx:key="id" class="card">
    <text class="card__titre">{{item.titre}}</text>
    <text class="card__prix">{{ f.formatPrix(item.prix) }}</text>
  </view>
  <!-- Message quand tout est chargé -->
  <text wx:if="{{estFini}}" class="fin-liste">Tout est affiché ✓</text>
</view>

<!-- ÉTAT : Vide -->
<view wx:elif="{{uiState === 'empty'}}">
  <text>Aucun élément trouvé.</text>
</view>
```

```css
.skeleton-card {
  height: 80px; background: #e8e8e8; border-radius: 12px;
  margin-bottom: 12px; animation: pulse 1.5s infinite ease-in-out;
}
@keyframes pulse { 50% { opacity: 0.4; } }
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fin-liste { text-align: center; color: #aaa; padding: 16px; font-size: 12px; }
```

---

## 🔵 Recette 2 : Formulaire Complet avec Validation et Envoi API

**Quand l'utiliser ?** Un formulaire d'inscription, de contact, de modification de profil. Le bouton "Envoyer" reste bloqué tant que les champs sont invalides.

### Étape 1/3 — L'API (`utils/apis/[mondomaine].api.js`)
```javascript
async creer(payload) {
  await authenticate();
  const res = await httpClient.post('[/api/ma-route]', payload);
  if (!res.success) throw new Error(res.error?.message);
  return res.data;
}
```

### Étape 2/3 — La Page (`index.js`)
```javascript
Page({
  data: {
    uiState: 'idle', // idle | loading | success | error
    // ✏️ Un champ par input du formulaire
    champs: { email: '', motDePasse: '' },
    formulaireValide: false
  },

  // 🔒 Appelé à chaque frappe clavier (bindinput)
  auChangement(e) {
    const champ = e.currentTarget.dataset.champ;
    const valeur = e.detail.value;
    const champsMaj = { ...this.data.champs, [champ]: valeur };
    
    this.setData({
      champs: champsMaj,
      // ✏️ Vos règles de validation ici
      formulaireValide: champsMaj.email.includes('@') && champsMaj.motDePasse.length >= 6
    });
  },

  async envoyer() {
    if (!this.data.formulaireValide) return;
    this.setData({ uiState: 'loading' });
    try {
      await [monAPI].creer(this.data.champs);
      this.setData({ uiState: 'success' });
      setTimeout(() => wx.navigateBack(), 1500); // Retour après succès
    } catch (e) {
      this.setData({ uiState: 'error' });
      wx.showToast({ title: e.message, icon: 'none' });
    }
  }
});
```

### Étape 3/3 — La Vue (`index.wxml`)
```xml
<!-- ✏️ data-champ doit correspondre à votre clé dans 'champs' -->
<input placeholder="Email" data-champ="email" bindinput="auChangement" />
<input placeholder="Mot de passe" password data-champ="motDePasse" bindinput="auChangement" />

<!-- Le bouton est grisé automatiquement si formulaireValide est faux -->
<button
  disabled="{{!formulaireValide || uiState === 'loading'}}"
  bindtap="envoyer"
  loading="{{uiState === 'loading'}}">
  Envoyer
</button>

<!-- Message de succès -->
<view wx:if="{{uiState === 'success'}}" class="animate-bounce-in">
  <icon type="success" size="48" />
  <text>Enregistré !</text>
</view>
```

---

## 🔵 Recette 3 : Page de Détail avec API

**Quand l'utiliser ?** Une page qui reçoit un `id` en paramètre (produit, vol, commande) et charge ses infos depuis le serveur.

### Étape 1/3 — Le Mappeur + API
```javascript
// utils/mappers/[mondomaine].js
export const [MonDetailSchema] = {
  id:          "@link.[id_serveur]",
  titre:       "@link.[titre_serveur]",
  description: "@link.[desc_serveur]",
  prix:        "@link.[prix_serveur]::number"
};

// utils/apis/[mondomaine].api.js
async getDetail(id) {
  await authenticate();
  const res = await httpClient.get(`[/api/ma-route/${id}]`);
  if (!res.success) throw new Error(res.error?.message);
  return sculpt.data({ data: res.data, to: [MonDetailSchema] });
}
```

### Étape 2/3 — La Page (`index.js`)
```javascript
Page({
  data: { uiState: 'loading', detail: null },

  async onLoad(options) {
    // 🔒 L'ID vient automatiquement de l'URL (ex: ?id=42)
    const id = options.id;
    try {
      const detail = await [monAPI].getDetail(id);
      this.setData({ detail, uiState: 'content' });
    } catch (e) {
      this.setData({ uiState: 'error' });
    }
  }
});
```

### Étape 3/3 — La Vue (`index.wxml`)
```xml
<wxs src="../../utils/wxs/filters.wxs" module="f" />

<view wx:if="{{uiState === 'loading'}}" class="skeleton-detail animate-pulse" />

<view wx:elif="{{uiState === 'content'}}" class="detail animate-fade-in">
  <text class="titre">{{detail.titre}}</text>
  <text class="description">{{detail.description}}</text>
  <text class="prix">{{ f.formatPrix(detail.prix) }}</text>
</view>

<view wx:elif="{{uiState === 'error'}}">
  <text>Impossible de charger. Réessayez.</text>
</view>
```

---

## 🔵 Recette 4 : Upload Photo + Envoi au Serveur

**Quand l'utiliser ?** Photo de profil, pièce jointe, preuve de paiement. L'utilisateur choisit la photo, on l'affiche à l'écran, puis on l'envoie.

### Étape 1/2 — La Page (`index.js`)
```javascript
Page({
  data: { imagePreview: null, uiState: 'idle' },

  choisirEtEnvoyer() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const cheminLocal = res.tempFiles[0].tempFilePath;
        // 1. Afficher l'image immédiatement
        this.setData({ imagePreview: cheminLocal, uiState: 'loading' });
        try {
          // 2. Envoyer au serveur
          await [monAPI].uploaderFichier(cheminLocal);
          this.setData({ uiState: 'success' });
          wx.showToast({ title: 'Photo enregistrée !', icon: 'success' });
        } catch (e) {
          this.setData({ uiState: 'error' });
          wx.showToast({ title: e.message, icon: 'none' });
        }
      }
    });
  }
});
```

### Étape 2/2 — La Vue (`index.wxml`)
```xml
<view class="upload-zone" bindtap="choisirEtEnvoyer">
  <!-- Aperçu de l'image choisie -->
  <image wx:if="{{imagePreview}}" src="{{imagePreview}}" mode="aspectFill" class="apercu" />
  <!-- Zone vide avant la sélection -->
  <view wx:else class="placeholder">
    <text class="icone">+</text>
    <text>Choisir une photo</text>
  </view>
  <!-- Indicateur de chargement par-dessus l'image -->
  <view wx:if="{{uiState === 'loading'}}" class="overlay-loading">
    <text>Envoi...</text>
  </view>
</view>
```

---

## 🔵 Recette 5 : Filtres sur une Page Séparée qui Rafraîchit la Liste

**Quand l'utiliser ?** Un bouton "Filtres" qui ouvre une nouvelle page. L'utilisateur choisit ses filtres, valide, et la page principale se recharge avec les filtres appliqués.

### Page A — La Liste Principale (`pages/liste/index.js`)
```javascript
import { Bus } from '../../utils/event/index.js';

Page({
  data: { liste: [], filtresActifs: {} },

  onLoad() {
    // 🔒 Allumer le talkie-walkie
    Bus.on('APPLIQUER_FILTRES', this.rechargerAvecFiltres, this);
    this.rechargerAvecFiltres({});
  },
  onUnload() {
    // 🔒 VITAL : Éteindre le talkie-walkie
    Bus.off('APPLIQUER_FILTRES', this.rechargerAvecFiltres, this);
  },

  ouvrirFiltres() {
    wx.navigateTo({ url: '/pages/filtres/index' });
  },

  async rechargerAvecFiltres(filtres) {
    this.setData({ filtresActifs: filtres });
    // ✏️ Votre appel API avec les filtres
    const liste = await monAPI.getListe(filtres);
    this.setData({ liste });
  }
});
```

### Page B — La Page de Filtres (`pages/filtres/index.js`)
```javascript
import { Bus } from '../../utils/event/index.js';

Page({
  data: { prixMax: 100000 },

  changerPrix(e) { this.setData({ prixMax: e.detail.value }); },

  valider() {
    // 🔒 Crier dans le talkie-walkie et retourner
    Bus.emit('APPLIQUER_FILTRES', { prixMax: this.data.prixMax });
    wx.navigateBack();
  }
});
```

---

## 🔵 Recette 6 : Compteur de Panier Partagé entre toutes les Pages

**Quand l'utiliser ?** Une pastille rouge sur la NavBar qui montre le nombre d'articles dans le panier, et qui se met à jour immédiatement n'importe où dans l'app.

### La NavBar Partagée (`components/navbar/index.js`)
```javascript
import { Bus } from '../../utils/event/index.js';

Component({
  data: { compteur: 0 },
  lifetimes: {
    attached() {
      // 🔒 Regarder le "tableau central" en permanence
      Bus.onState('panier.compteur', (val) => {
        this.setData({ compteur: val });
      }, this);
    },
    detached() { Bus.offState('panier.compteur', this); }
  }
});
```

### La NavBar Partagée (`components/navbar/index.wxml`)
```xml
<view class="navbar">
  <view class="panier-icon">
    🛒
    <!-- La pastille rouge n'apparaît que s'il y a des items -->
    <view wx:if="{{compteur > 0}}" class="pastille">
      <text>{{compteur}}</text>
    </view>
  </view>
</view>
```

### N'importe quelle page qui ajoute au panier (`pages/produit/index.js`)
```javascript
import { Bus } from '../../utils/event/index.js';

Page({
  ajouterAuPanier() {
    // Votre logique métier...
    const nouveauCompteur = wx.getStorageSync('panier_count') + 1;
    wx.setStorageSync('panier_count', nouveauCompteur);
    
    // 🔒 Mettre à jour le tableau central. La NavBar se met à jour instantanément.
    Bus.setState('panier.compteur', nouveauCompteur);
    wx.showToast({ title: 'Ajouté !', icon: 'success' });
  }
});
```

---

## 🟢 Recette 7 : Connexion / Login et Protection de Pages

**Quand l'utiliser ?** Toute application avec des comptes utilisateurs. La page de login envoie les identifiants, reçoit un token, et redirige vers l'accueil. Les autres pages vérifient que l'utilisateur est connecté avant de s'afficher.

### La Page de Login (`pages/login/index.js`)
```javascript
Page({
  data: {
    uiState: 'idle',
    champs: { email: '', motDePasse: '' },
    formulaireValide: false
  },

  auChangement(e) {
    const champ = e.currentTarget.dataset.champ;
    const champsMaj = { ...this.data.champs, [champ]: e.detail.value };
    this.setData({
      champs: champsMaj,
      formulaireValide: champsMaj.email.length > 3 && champsMaj.motDePasse.length >= 6
    });
  },

  async seConnecter() {
    if (!this.data.formulaireValide) return;
    this.setData({ uiState: 'loading' });
    try {
      const res = await authAPI.login(this.data.champs);
      // 🔒 Sauvegarde du token pour toutes les futures requêtes
      wx.setStorageSync('auth_token', res.token);
      wx.setStorageSync('user_id', res.userId);
      // 🔒 Redirection sans possibilité de revenir en arrière
      wx.reLaunch({ url: '/pages/accueil/index' });
    } catch (e) {
      this.setData({ uiState: 'idle' });
      wx.showToast({ title: e.message, icon: 'none' });
    }
  }
});
```

### Protection d'une Page Privée (à mettre dans `onLoad`)
```javascript
onLoad() {
  // 🔒 GARDIEN : Si pas de token, on renvoie au login
  const token = wx.getStorageSync('auth_token');
  if (!token) {
    wx.reLaunch({ url: '/pages/login/index' });
    return; // Arrêter l'exécution
  }
  // Suite du code de la page...
}
```

---

## 🟢 Recette 8 : Pull-to-Refresh (Tirer pour Recharger)

**Quand l'utiliser ?** L'utilisateur tire vers le bas pour recharger manuellement la liste (comme sur Facebook, Instagram, Twitter).

### Dans le `index.json` de la page (OBLIGATOIRE)
```json
{
  "enablePullDownRefresh": true,
  "backgroundTextStyle": "dark"
}
```

### Dans le `index.js`
```javascript
Page({
  data: { liste: [], uiState: 'loading' },

  onLoad() { this.charger(); },

  // 🔒 Se déclenche automatiquement quand on tire vers le bas
  async onPullDownRefresh() {
    this.setData({ liste: [], pageActuelle: 1 });
    await this.charger();
    // 🔒 OBLIGATOIRE : Arrête l'animation de rechargement
    wx.stopPullDownRefresh();
  },

  async charger() {
    try {
      const liste = await monAPI.getListe();
      this.setData({ liste, uiState: 'content' });
    } catch (e) {
      this.setData({ uiState: 'error' });
    }
  }
});
```

---

## 🟢 Recette 9 : Recherche en Temps Réel (Debounce)

**Quand l'utiliser ?** Une barre de recherche qui ne lance pas une requête à chaque lettre tapée (trop lent), mais attend que l'utilisateur ait fini de taper (après 400ms de silence).

### Dans le `index.js`
```javascript
Page({
  data: { resultats: [], uiState: 'idle' },
  // 🔒 Variable interne pour le timer (PAS dans data)
  _debounceTimer: null,

  auChangementRecherche(e) {
    const texte = e.detail.value;

    // 🔒 On annule le timer précédent à chaque nouvelle frappe
    if (this._debounceTimer) clearTimeout(this._debounceTimer);

    if (texte.length < 2) {
      this.setData({ resultats: [], uiState: 'idle' });
      return;
    }

    // 🔒 On lance la recherche seulement 400ms après la dernière frappe
    this._debounceTimer = setTimeout(async () => {
      this.setData({ uiState: 'loading' });
      try {
        // ✏️ Votre appel API ici
        const resultats = await monAPI.rechercher({ q: texte });
        this.setData({ resultats, uiState: resultats.length ? 'content' : 'empty' });
      } catch (e) {
        this.setData({ uiState: 'error' });
      }
    }, 400);
  }
});
```

### Dans le `index.wxml`
```xml
<input placeholder="Rechercher..." bindinput="auChangementRecherche" />

<view wx:if="{{uiState === 'loading'}}"><text>Recherche en cours...</text></view>
<view wx:elif="{{uiState === 'empty'}}"><text>Aucun résultat.</text></view>
<view wx:elif="{{uiState === 'content'}}">
  <view wx:for="{{resultats}}" wx:key="id" class="resultat-item animate-fade-in">
    <text>{{item.titre}}</text>
  </view>
</view>
```

---

## 🟢 Recette 10 : Bouton Favoris/Like (Toggle)

**Quand l'utiliser ?** Un bouton cœur ou étoile qui s'allume/s'éteint quand on clique, et qui sauvegarde l'état sur le serveur.

### Dans le `index.js`
```javascript
Page({
  data: { estFavori: false, idItem: null },

  onLoad(options) {
    this.setData({ idItem: options.id });
    // ✏️ Charger l'état favori depuis le serveur ou le cache
    const cache = wx.getStorageSync(`favori_${options.id}`);
    this.setData({ estFavori: !!cache });
  },

  async toggleFavori() {
    const nouvelEtat = !this.data.estFavori;
    // 🔒 Mise à jour immédiate de l'UI (pas d'attente serveur)
    this.setData({ estFavori: nouvelEtat });

    try {
      if (nouvelEtat) {
        await monAPI.ajouterFavori(this.data.idItem);
        wx.setStorageSync(`favori_${this.data.idItem}`, true);
      } else {
        await monAPI.supprimerFavori(this.data.idItem);
        wx.removeStorageSync(`favori_${this.data.idItem}`);
      }
    } catch (e) {
      // 🔒 Si le serveur échoue, on annule le changement visuel
      this.setData({ estFavori: !nouvelEtat });
      wx.showToast({ title: 'Erreur, réessayez.', icon: 'none' });
    }
  }
});
```

### Dans le `index.wxml`
```xml
<!-- Le cœur change de couleur instantanément -->
<view class="btn-favori {{estFavori ? 'actif' : ''}}" bindtap="toggleFavori">
  <text>{{ estFavori ? '❤️' : '🤍' }}</text>
</view>
```

---

## 🟢 Recette 11 : Partage WeChat (Envoyer à un Ami)

**Quand l'utiliser ?** L'utilisateur veut partager un produit, un article, ou une page de l'app à un ami dans une conversation WeChat.

### Dans le `index.js`
```javascript
Page({
  data: { detail: { titre: '', id: '' } },

  // 🔒 Fonction native WeChat : S'active quand on clique sur le bouton Share
  onShareAppMessage() {
    return {
      // ✏️ Le titre de la bulle dans la conversation
      title: this.data.detail.titre,
      // ✏️ La page où l'ami va atterrir quand il clique (avec l'ID en paramètre)
      path: `/pages/detail/index?id=${this.data.detail.id}`,
      // ✏️ L'image qui s'affiche dans la bulle
      imageUrl: this.data.detail.imageUrl
    };
  }
});
```

### Dans le `index.wxml`
```xml
<!-- 🔒 open-type="share" est OBLIGATOIRE pour déclencher le partage WeChat -->
<button open-type="share" class="btn-partager">
  Envoyer à un ami 📤
</button>
```

---

## 🟢 Recette 12 : Onglets (Tabs) avec Changement de Données

**Quand l'utiliser ?** Un menu à onglets ("En cours" / "Terminé" / "Annulé") où chaque onglet affiche des données différentes chargées depuis le serveur.

### Dans le `index.js`
```javascript
Page({
  data: {
    ongletActif: 'en_cours', // ✏️ Valeur par défaut
    onglets: [
      { id: 'en_cours', label: 'En Cours' },
      { id: 'termine', label: 'Terminé' },
      { id: 'annule', label: 'Annulé' }
    ],
    liste: [],
    uiState: 'loading'
  },

  onLoad() { this.charger('en_cours'); },

  changerOnglet(e) {
    const nouvelOnglet = e.currentTarget.dataset.id;
    if (nouvelOnglet === this.data.ongletActif) return; // Pas de double chargement
    this.setData({ ongletActif: nouvelOnglet, uiState: 'loading', liste: [] });
    this.charger(nouvelOnglet);
  },

  async charger(statut) {
    try {
      // ✏️ Votre appel API avec le filtre statut
      const liste = await monAPI.getListe({ statut });
      this.setData({ liste, uiState: liste.length ? 'content' : 'empty' });
    } catch (e) {
      this.setData({ uiState: 'error' });
    }
  }
});
```

### Dans le `index.wxml`
```xml
<!-- Les boutons des onglets -->
<view class="tabs-bar">
  <view
    wx:for="{{onglets}}" wx:key="id"
    class="tab {{ongletActif === item.id ? 'tab--actif' : ''}}"
    bindtap="changerOnglet"
    data-id="{{item.id}}">
    {{item.label}}
  </view>
</view>

<!-- Le contenu -->
<view wx:if="{{uiState === 'loading'}}" class="skeleton animate-pulse" />
<view wx:elif="{{uiState === 'content'}}" class="animate-fade-in">
  <view wx:for="{{liste}}" wx:key="id">
    <text>{{item.titre}}</text>
  </view>
</view>
<view wx:elif="{{uiState === 'empty'}}"><text>Aucun élément.</text></view>
```

---

## 🟢 Recette 13 : Cache Local (Données Hors Ligne)

**Quand l'utiliser ?** Vous voulez que l'application affiche des données même sans réseau. On affiche d'abord le cache, puis on met à jour depuis le serveur en arrière-plan.

### Dans le `index.js`
```javascript
const CLE_CACHE = 'cache_ma_liste'; // ✏️ Changez ce nom

Page({
  data: { liste: [], uiState: 'loading' },

  async onLoad() {
    // 🔒 ÉTAPE 1 : Afficher le cache immédiatement (zéro attente)
    const cache = wx.getStorageSync(CLE_CACHE);
    if (cache) {
      this.setData({ liste: cache, uiState: 'content' });
    }

    // 🔒 ÉTAPE 2 : Mettre à jour depuis le serveur en arrière-plan
    try {
      const fraîches = await monAPI.getListe();
      // Mettre à jour seulement si les données ont changé
      if (JSON.stringify(fraîches) !== JSON.stringify(this.data.liste)) {
        this.setData({ liste: fraîches });
        // 🔒 Sauvegarder le nouveau cache pour la prochaine visite
        wx.setStorageSync(CLE_CACHE, fraîches);
      }
    } catch (e) {
      // Pas grave si le réseau échoue : le cache est déjà affiché
      if (!cache) this.setData({ uiState: 'error' });
    }
  }
});
```


---

## 🔴 Recette 14 : Paiement Marchand Natif avec Bouclier Anti-Double Débit

**Quand l'utiliser ?** Vous devez déclencher un paiement mobile via le plugin natif TCMPP / Max It (`merchantPay`) en garantissant qu'aucun client ne peut être débité deux fois même s'il clique plusieurs fois ou si la connexion saute.

### Étape 1/2 — Le Service Natif (`utils/apis/native.js`)
```javascript
export function invokeMerchantPay({ merchantId, amount, orderId }) {
  return new Promise((resolve, reject) => {
    if (typeof wx.invokeNativePlugin !== 'function') {
      return reject(new Error('Plugin natif non disponible'));
    }
    wx.invokeNativePlugin({
      plugin: 'merchantPay',
      param: {
        merchantId,
        amount: Math.round(Number(amount)),
        orderId,
        serviceType: 'MERCHANT_PAY'
      },
      success(res) {
        const code = String(res?.code || res?.resultCode || '').toUpperCase();
        if (code === 'SUCCEED' || code === 'SUCCESS' || code === '00') {
          resolve({ txnid: String(res.txnid || res.transactionId || '') });
        } else if (code === 'CANCEL') {
          reject(new Error('Paiement annulé par l'utilisateur'));
        } else {
          reject(new Error(res?.message || 'Échec du paiement'));
        }
      },
      fail(err) {
        reject(new Error(err?.errMsg || 'Service de paiement indisponible'));
      }
    });
  });
}
```

### Étape 2/2 — Le Contrôleur de Page (`pages/[ma-page]/[ma-page].js`)
```javascript
import { invokeMerchantPay } from '../../utils/apis/native.js';
import { BackendAPI } from '../../utils/apis/index.js';

Page({
  data: { isSubmitting: false, montant: 15000, commandeId: 'CMD-123' },
  _confirmedTxnid: null, // 🛡️ Bouclier d'idempotence

  async handlePayer() {
    if (this.data.isSubmitting) return;
    this.setData({ isSubmitting: true });

    try {
      let txnid = this._confirmedTxnid;

      // 1. Débit bancaire UNIQUEMENT si pas encore débité
      if (!txnid) {
        wx.showLoading({ title: 'Paiement...', mask: true });
        const res = await invokeMerchantPay({
          merchantId: 'MARCHAND_ID',
          amount: this.data.montant,
          orderId: this.data.commandeId
        });
        txnid = res.txnid;
        this._confirmedTxnid = txnid; // 🔒 Scellé !
      }

      // 2. Enregistrement backend (rejouable sans repayer)
      wx.showLoading({ title: 'Confirmation...', mask: true });
      await BackendAPI.confirmerCommande({ commandeId: this.data.commandeId, txnid });

      this._confirmedTxnid = null;
      wx.hideLoading();
      wx.redirectTo({ url: '/pages/confirmation/confirmation' });

    } catch (err) {
      wx.hideLoading();
      this.setData({ isSubmitting: false });

      if (this._confirmedTxnid) {
        // Débité mais confirmation réseau échouée : on rassure le client
        wx.showModal({
          title: 'Paiement effectué',
          content: 'Votre compte a été débité. Cliquez sur Réessayer pour valider votre commande sans repayer.',
          confirmText: 'Réessayer',
          showCancel: false,
          success: (res) => { if (res.confirm) this.handlePayer(); }
        });
      } else {
        wx.showToast({ title: err.message, icon: 'none' });
      }
    }
  }
});
```

---

## 🔴 Recette 15 : Smart Polling Asynchrone avec Backoff Progressif

**Quand l'utiliser ?** Vous avez une opération sensible (validation de paiement, réservation) et vous voulez encaisser 95 % des micro-coupures 4G de manière 100 % transparente sans déranger l'utilisateur.

### Dans vos Helpers ou dans la Page
```javascript
/**
 * Exécute une promesse avec 3 tentatives silencieuses (immédiat, +2s, +4s)
 * @param {Function} asyncFn - Fonction asynchrone à exécuter
 * @param {number[]} [delays=[0, 2000, 4000]] - Délais entre les essais
 */
export async function executeSmartPolling(asyncFn, delays = [0, 2000, 4000]) {
  let lastError;
  for (let i = 0; i < delays.length; i++) {
    if (delays[i] > 0) {
      await new Promise((r) => setTimeout(r, delays[i]));
    }
    try {
      return await asyncFn(i + 1); // Succès immédiat !
    } catch (err) {
      lastError = err;
      // Arrêter si erreur 4xx définitive (ex: 400 mauvaise requête)
      if (err.status && err.status >= 400 && err.status < 500) {
        throw err;
      }
    }
  }
  throw lastError; // Propage l'erreur si tous les essais ont échoué
}
```

---

## 📱 Recette 16 : Barre de Navigation Custom & Capsule WeChat

**Quand l'utiliser ?** Vous voulez un en-tête d'application sur mesure (titre personnalisé, bouton retour, logo) qui ne rentre JAMAIS en collision avec la capsule native de WeChat sur iPhone comme sur Android.

### Étape 1/3 — Le Helper de Calcul (`utils/helpers/system-info.js`)
```javascript
export function getNavBarGeometry() {
  const sys = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
  const menu = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
  const statusBarHeight = sys.statusBarHeight || 20;

  if (menu && menu.top > 0) {
    const navBarHeight = (menu.top - statusBarHeight) * 2 + menu.height;
    return {
      statusBarHeight,
      navBarHeight,
      totalHeight: statusBarHeight + navBarHeight,
      capsuleWidth: menu.width
    };
  }
  return { statusBarHeight, navBarHeight: 44, totalHeight: statusBarHeight + 44, capsuleWidth: 87 };
}
```

### Étape 2/3 — Le WXML du Composant (`components/custom-nav-bar/index.wxml`)
```xml
<view class="nav-bar-fixed" style="height: {{ geometry.totalHeight }}px; padding-top: {{ geometry.statusBarHeight }}px;">
  <view class="nav-bar-inner" style="height: {{ geometry.navBarHeight }}px;">
    <view class="nav-back" bindtap="goBack">‹</view>
    <view class="nav-title">{{ title }}</view>
  </view>
</view>
<view style="height: {{ geometry.totalHeight }}px;"></view>
```

### Étape 3/3 — Le JS du Composant (`components/custom-nav-bar/index.js`)
```javascript
import { getNavBarGeometry } from '../../utils/helpers/system-info.js';

Component({
  properties: { title: { type: String, value: '' } },
  data: { geometry: {} },
  attached() {
    this.setData({ geometry: getNavBarGeometry() });
  },
  methods: {
    goBack() {
      if (getCurrentPages().length > 1) wx.navigateBack();
      else wx.switchTab({ url: '/pages/home/home' });
    }
  }
});
```

---

## 📱 Recette 17 : Custom TabBar WeChat Sans Scintillement

**Quand l'utiliser ?** Vous utilisez le mode officiel `"custom": true` dans `app.json` et vous voulez que l'onglet actif s'affiche immédiatement sans clignoter et sans désynchronisation.

### Dans chaque page d'onglet (`pages/home/home.js`, `pages/favoris/favoris.js`, etc.)
```javascript
Page({
  onShow() {
    // 🔒 Indique le bon index au custom tab bar (ex: 0 pour Home, 1 pour Explore, etc.)
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  }
});
```

### Le WXSS du Custom TabBar (`custom-tab-bar/index.wxss`)
```wxss
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 98rpx;
  background: #FFFFFF;
  display: flex;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  /* 🛡️ Protection Safe Area obligatoire sur iPhone */
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 999;
}
.tab-item { flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.tab-icon { width: 48rpx; height: 48rpx; }
.tab-text { font-size: 20rpx; color: #999999; margin-top: 4rpx; }
.tab-item.active .tab-text { color: #FF7900; font-weight: bold; }
```

---

## ⚡ Recette 18 : Store Réactif Léger avec Cache Stale-While-Revalidate

**Quand l'utiliser ?** Partager des données entre plusieurs pages (ex: liste de produits, favoris, panier) sans installer Redux/MobX, avec lecture immédiate depuis le stockage local et mise à jour en tâche de fond.

### Le Store (`utils/stores/mon-store.js`)
```javascript
const CACHE_KEY = 'mon_app_store_cache';
const TTL_MS = 15 * 60 * 1000; // 15 minutes

let state = {
  items: wx.getStorageSync(CACHE_KEY)?.items || [],
  lastUpdated: wx.getStorageSync(CACHE_KEY)?.timestamp || 0
};

export const MonStore = {
  getItems() {
    return state.items;
  },
  isFresh() {
    return (Date.now() - state.lastUpdated) < TTL_MS && state.items.length > 0;
  },
  setItems(newItems) {
    state.items = Array.isArray(newItems) ? newItems : [];
    state.lastUpdated = Date.now();
    wx.setStorage({
      key: CACHE_KEY,
      data: { items: state.items, timestamp: state.lastUpdated }
    });
  }
};
```

### Utilisation dans une Page (`pages/catalogue/catalogue.js`)
```javascript
import { MonStore } from '../../utils/stores/mon-store.js';
import { BackendAPI } from '../../utils/apis/index.js';

Page({
  data: { items: [] },

  async onLoad() {
    // 1. Rendu instantané depuis le store / cache
    this.setData({ items: MonStore.getItems() });

    // 2. Si le cache a expiré, mise à jour silencieuse
    if (!MonStore.isFresh()) {
      try {
        const freshItems = await BackendAPI.getItems();
        MonStore.setItems(freshItems);
        this.setData({ items: freshItems });
      } catch (e) {
        console.warn('Impossible de rafraîchir en arrière-plan', e);
      }
    }
  }
});
```


---

## 🚦 Recette 19 : Navigation Sécurisée Anti-Crash (Pile 10 Pages)

**Quand l'utiliser ?** Dès que vous naviguez entre plusieurs pages pour éviter que l'application ne freeze silencieusement quand l'utilisateur a ouvert 10 pages d'affilée, ou clique trop vite deux fois.

### Le Helper (`utils/helpers/navigation.js`)
```javascript
export function navigateToSafe(url) {
  return new Promise((resolve, reject) => {
    if (getCurrentPages().length >= 10) {
      wx.redirectTo({ url, success: resolve, fail: reject });
    } else {
      wx.navigateTo({
        url,
        success: resolve,
        fail: () => wx.redirectTo({ url, success: resolve, fail: reject })
      });
    }
  });
}

export function withNavLock(pageInstance, action) {
  if (pageInstance._navLocked) return;
  pageInstance._navLocked = true;
  try {
    action();
  } finally {
    setTimeout(() => { pageInstance._navLocked = false; }, 500);
  }
}
```

---

## 🧩 Recette 20 : WeChat Behavior Partagé (`loadingBehavior`)

**Quand l'utiliser ?** Vous avez 10 pages ou composants qui font des appels API et vous en avez assez de réécrire `isLoading: true`, `try/catch`, `wx.showLoading` et `this.setData({ isLoading: false })`.

### Le Mixin (`utils/behaviors/loading.js`)
```javascript
export const loadingBehavior = Behavior({
  data: { isLoading: false, hasError: false, errorMessage: '' },
  methods: {
    async withLoading(asyncFn, loadingTitle = 'Chargement...') {
      this.setData({ isLoading: true, hasError: false, errorMessage: '' });
      if (loadingTitle) wx.showLoading({ title: loadingTitle, mask: true });
      try {
        return await asyncFn();
      } catch (err) {
        this.setData({ hasError: true, errorMessage: err.message || 'Erreur' });
        throw err;
      } finally {
        if (loadingTitle) wx.hideLoading();
        this.setData({ isLoading: false });
      }
    }
  }
});
```

### Utilisation dans votre Page
```javascript
import { loadingBehavior } from '../../utils/behaviors/loading.js';

Page({
  behaviors: [loadingBehavior],
  async onLoad() {
    await this.withLoading(async () => {
      const data = await monAPI.getProduits();
      this.setData({ produits: data });
    });
  }
});
```

---

## ❤️ Recette 21 : Favoris Instantanés (Double Cache Mémoire + Disque)

**Quand l'utiliser ?** L'utilisateur clique sur le cœur d'une carte dans une liste. Le cœur doit changer de couleur immédiatement (0ms) et rester synchronisé partout.

### Le Service (`utils/helpers/favorites.js`)
```javascript
const STORAGE_KEY = 'mes_favoris_ids';
let cache = null;

function loadIds() {
  if (cache === null) {
    try { cache = wx.getStorageSync(STORAGE_KEY) || []; } catch { cache = []; }
  }
  return cache;
}

export const Favorites = {
  isFav(id) { return loadIds().includes(String(id)); },
  toggle(id) {
    const ids = loadIds();
    const str = String(id);
    cache = ids.includes(str) ? ids.filter(i => i !== str) : [...ids, str];
    wx.setStorage({ key: STORAGE_KEY, data: cache });
    return cache.includes(str);
  }
};
```

---

## 📊 Recette 22 : Calculateur de Délais & Barèmes d'Annulation

**Quand l'utiliser ?** Calculer les pénalités et les montants remboursables en fonction de la date du voyage sans subir les bugs de décalage horaire UTC/local.

### Le Helper (`utils/helpers/cancellation.js`)
```javascript
export function calculateRefund(dateStr, montantTotal) {
  if (!dateStr || !montantTotal) return null;
  const departure = new Date(`${dateStr}T00:00:00`);
  const days = Math.floor((departure.getTime() - Date.now()) / (24 * 3600 * 1000));

  let refundPercent = 0;
  if (days >= 30) refundPercent = 100;
  else if (days >= 10) refundPercent = 90;
  else if (days >= 7) refundPercent = 70;
  else if (days >= 3) refundPercent = 50;
  else refundPercent = 0;

  const feeAmount = Math.round(montantTotal * ((100 - refundPercent) / 100));
  const refundAmount = montantTotal - feeAmount;

  return { days, refundPercent, feeAmount, refundAmount };
}
```


---

## 📱 Recette 23 : Initialisation du SDK Officiel Max It dans `app.js`

**Quand l'utiliser ?** Dans chaque mini-programme Max It pour configurer l'accès à l'hôte et activer les simulations automatiques sous WeChat DevTools.

### Dans `app.js`
```javascript
import { miniSDK } from './sdk/index.js';

App({
  onLaunch() {
    // Mode simulation activé sous DevTools, vrai hôte sur mobile réel
    const isDevTools = typeof __wxConfig !== 'undefined' && __wxConfig.envVersion === 'develop';

    miniSDK.configure({
      simulate: isDevTools,
      log: (level, api, message, ctx) => {
        if (isDevTools) console.log(`[SDK:${api}] ${message}`, ctx || '');
      },
      timeoutMs: 30000
    });
  }
});
```

---

## 👤 Recette 24 : Identité Utilisateur Sans Login Screen

**Quand l'utiliser ?** Identifier l'utilisateur sans lui demander de mot de passe, et obtenir un jeton de session auprès de votre serveur.

### Dans votre Page ou Service
```javascript
import { miniSDK } from '../../sdk/index.js';
import { httpClient } from '../../utils/apis/index.js';

Page({
  data: { user: null },

  async onLoad() {
    try {
      // 1. Récupérer l'identité déjà vérifiée par Max It (MSISDN 9 chiffres)
      const user = await miniSDK.user();
      this.setData({ user });

      // 2. Obtenir un code à usage unique pour votre backend
      const authCode = await miniSDK.login();
      const session = await httpClient.post('/auth/session', { code: authCode });
      console.log('Session établie :', session);

    } catch (err) {
      if (err.code === miniSDK.ERROR_CODES.UNAVAILABLE) {
        wx.showModal({ title: 'Attention', content: 'Veuillez ouvrir cette app dans Max It.' });
      }
    }
  }
});
```

---

## 💳 Recette 25 : Paiement Orange Money Officiel avec `miniSDK.pay()`

**Quand l'utiliser ?** Déclencher un paiement marchand avec gestion native des doublons de 15 minutes (`caction: '1'`) et prise en compte de l'incertitude (`uncertain: true`).

### Dans votre Page de Réservation
```javascript
import { miniSDK } from '../../sdk/index.js';

Page({
  data: { isPaying: false },

  async handlePaiement() {
    if (this.data.isPaying) return;
    this.setData({ isPaying: true });

    try {
      const { txnid, confirmedIdentical } = await miniSDK.pay({
        amount: 25000,
        receiver: 467652, // Code Marchand officiel
        receiverName: 'ATS Voyages',
        orderId: 'CMD-88741',
        description: 'Billet Dakar - Touba'
      }, {
        onIdentical: async (msg) => {
          const res = await wx.showModal({
            title: 'Paiement similaire',
            content: msg || 'Une transaction identique existe. Poursuivre ?',
            confirmText: 'Payer'
          });
          return res.confirm;
        }
      });

      wx.redirectTo({ url: `/pages/confirmation/confirmation?txnid=${txnid}` });

    } catch (err) {
      if (err.uncertain) {
        // ⚠️ CRITIQUE : Timeout ou erreur indéterminée -> Le compte a pu être débité !
        // NE PAS REFAIRE PAYER. Valider avec le backend.
        wx.showModal({
          title: 'Vérification en cours',
          content: 'Votre paiement est en cours de validation. Ne tentez pas de repayer.',
          showCancel: false
        });
      } else if (err.code === miniSDK.ERROR_CODES.CANCELLED) {
        wx.showToast({ title: 'Paiement annulé', icon: 'none' });
      } else {
        wx.showToast({ title: err.message, icon: 'none' });
      }
    } finally {
      this.setData({ isPaying: false });
    }
  }
});
```

---

## 🛡️ Recette 26 : Protection Anti-Screenshot de Billet QR

**Quand l'utiliser ?** Empêcher qu'un passager capture l'écran d'un QR code pour le dupliquer ou le revendre frauduleusement.

### Dans votre Page de Billet (`pages/billet-detail/billet-detail.js`)
```javascript
import { miniSDK } from '../../sdk/index.js';

Page({
  async onShow() {
    // 🔒 Masque l'écran contre les captures (Android FLAG_SECURE / iOS block_screen)
    await miniSDK.screen.protect(true);
  },

  async onHide() {
    // ⚠️ CRITIQUE : Toujours désactiver en quittant !
    await miniSDK.screen.protect(false);
  },

  async onUnload() {
    await miniSDK.screen.protect(false);
  }
});
```

---

## 📷 Recette 27 : Scanner QR Caméra Seule (Anti-Fraude)

**Quand l'utiliser ?** Dans une application de contrôle de billets pour obliger le contrôleur à viser un billet physique sans pouvoir choisir une photo trafiquée dans sa galerie.

### Dans votre Page de Contrôle
```javascript
import { miniSDK } from '../../sdk/index.js';

Page({
  async handleScan() {
    try {
      const { code, albumAllowed } = await miniSDK.scan({ cameraOnly: true });
      if (albumAllowed) {
        console.warn('Attention : la caméra seule n'était pas disponible sur cet appareil.');
      }
      this.verifierBillet(code);
    } catch (err) {
      if (err.code !== miniSDK.ERROR_CODES.CANCELLED) {
        wx.showToast({ title: err.message, icon: 'none' });
      }
    }
  }
});
```

---

## 🔗 Recette 28 : Deep Linking Sans Boucle (`onShow`)

**Quand l'utiliser ?** Ouvrir directement une page spécifique depuis une campagne SMS ou notification sans que l'application ne relance la navigation à chaque fois qu'elle revient au premier plan.

### Dans `app.js` ou votre Page Principale
```javascript
import { miniSDK } from './sdk/index.js';

App({
  async onShow(options) {
    // deeplink() avec { once: true } déduplique automatiquement les retours de veille
    const params = await miniSDK.deeplink({ launch: options, once: true });

    if (params && params.voyageid) {
      wx.navigateTo({ url: `/pages/destination-detail/destination-detail?id=${params.voyageid}` });
    }
  }
});
```


---

## 🛡️ Recette 29 : Clause de Garde d'Arguments (`onLoad`)

**Quand l'utiliser ?** Dès qu'une page a besoin d'un `id` pour s'afficher. Si l'utilisateur y arrive par erreur avec un lien incomplet, on évite la page blanche et on le renvoie proprement en arrière.

### Dans votre Page (`pages/[ma-page]/[ma-page].js`)
```javascript
Page({
  onLoad(options = {}) {
    const id = options.id ? Number(options.id) : null;

    if (!id || Number.isNaN(id)) {
      wx.showToast({
        title: 'Élément introuvable',
        icon: 'none',
        duration: 2000
      });
      // Retour en arrière automatique après 1.5s
      setTimeout(() => wx.navigateBack({ delta: 1 }), 1500);
      return;
    }

    this.chargerDonnees(id);
  }
});
```

---

## 🔄 Recette 30 : Bouton "Retour" Intelligent (Anti-Blocage)

**Quand l'utiliser ?** Dans tous vos en-têtes personnalisés avec bouton "‹" ou "Retour", pour ne jamais bloquer l'utilisateur s'il est arrivé directement via une notification ou un SMS.

### Dans votre Page ou Composant Navbar
```javascript
handleBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    // Cas standard : il y a un historique
    wx.navigateBack({ delta: 1 });
  } else {
    // Cas lien direct / deep link : retour vers l'accueil de l'app
    wx.switchTab({
      url: '/pages/home/home'
    });
  }
}
```

---

## ⚡ Recette 31 : Anti-Flash de Chargement ("0 Élément")

**Quand l'utiliser ?** Sur toute page de liste avec skeletons pour ne pas faire clignoter un message alarmant "0 réservation" pendant les 300 premières millisecondes de chargement.

### Dans le Contrôleur de Page (`index.js`)
```javascript
Page({
  data: {
    items: [],
    loading: true,
    resultsLabel: '' // 🔒 TOUJOURS initialiser vide !
  },

  async chargerDonnees() {
    this.setData({ loading: true });
    const items = await monAPI.getListe();
    const count = items.length;

    this.setData({
      items,
      loading: false,
      resultsLabel: count > 0 ? `${count} élément${count > 1 ? 's' : ''}` : ''
    });
  }
});
```

### Dans le WXML (`index.wxml`)
```xml
<!-- Le header n'apparaît QUE lorsque le chargement est terminé ET qu'il y a des éléments -->
<view class="list-header" wx:if="{{ !loading && items.length > 0 }}">
  <text>{{ resultsLabel }}</text>
</view>
```

---

## 🔒 Recette 32 : Anti-Clic Universel (`withLock`)

**Quand l'utiliser ?** Empêcher qu'un utilisateur clique 3 fois de suite sur un bouton de validation sans polluer le code de votre page avec des variables de locks manuelles.

### Le Helper (`utils/helpers/interaction.js`)
```javascript
export function withLock(fn, delay = 500) {
  let isLocked = false;
  return function (...args) {
    if (isLocked) return;
    isLocked = true;
    setTimeout(() => { isLocked = false; }, delay);
    return fn.apply(this, args);
  };
}
```

### Utilisation dans une Page
```javascript
import { withLock } from '../../utils/helpers/interaction.js';

Page({
  // Envelopper la fonction avec withLock
  handleValider: withLock(function () {
    this.envoyerFormulaire();
  }, 600)
});
```

---

## 🚨 Recette 33 : Gestionnaire Centralisé d'Erreurs Typées (`handleAppError`)

**Quand l'utiliser ?** Convertir automatiquement les erreurs techniques de votre application en messages compréhensibles pour l'utilisateur sur mobile.

### Le Helper (`utils/helpers/error-handler.js`)
```javascript
import { NetworkError, ValidationError, AuthorizationError } from '../errors/index.js';

export function handleAppError(error, defaultMessage = 'Une erreur est survenue') {
  console.error('[Erreur Applicative]', error);

  let message = defaultMessage;
  if (error instanceof NetworkError) {
    message = 'Réseau instable. Veuillez vérifier votre connexion.';
  } else if (error instanceof AuthorizationError) {
    message = 'Votre session a expiré. Reconnexion en cours...';
  } else if (error instanceof ValidationError) {
    message = error.message || 'Données saisies incorrectes.';
  } else if (error?.message) {
    message = error.message;
  }

  wx.showToast({
    title: message,
    icon: 'none',
    duration: 3000
  });
}
```

---

## 🤝 Recette 34 : Matrice d'Isolation Multi-Développeurs

**Quand l'utiliser ?** Faire collaborer 5 à 10 développeurs sur le même mini-programme sans aucun conflit Git lors des fusions.

### La Matrice d'Attribution Stricte des Fichiers
```
DÉV 1 (UX & Skeletons)       ➔ components/ux/**
DÉV 2 (Composants UI purs)   ➔ components/ui/**
DÉV 3 (Tunnel Réservation)   ➔ pages/booking/**
DÉV 4 (Détail & Actions)     ➔ pages/reservation-detail/**
DÉV 5 (Listing & Filtres)    ➔ pages/voyage/**
DÉV 6 (Favoris & Routage)    ➔ pages/favoris/**
DÉV 7 (Core & Mappers)       ➔ utils/mappers/**, utils/helpers/**
```

### Les 3 Règles d'Or :
1. **Un dossier = Un seul propriétaire à la fois.**
2. **On ne touche jamais au fichier d'un collègue.**
3. **Les modifications du Core (DÉV 7) sont mergées en premier, puis tout le monde rebase.**


---

## 👆 Recette 35 : Feedback Tactile au Clic (`hover-class`)

**Quand l'utiliser ?** Sur n'importe quel bouton, cellule ou carte cliquable pour que l'utilisateur ressente physiquement la réaction au toucher (effet "Apple Press") sans perturber le défilement.

### Dans votre WXML
```xml
<view 
  class="bouton-action" 
  hover-class="bouton-action--pressed" 
  hover-start-time="20" 
  hover-stay-time="100" 
  bindtap="validerAction"
>
  Confirmer
</view>
```

### Dans votre WXSS
```css
.bouton-action {
  transition: transform 0.12s cubic-bezier(0.2, 0, 0, 1), opacity 0.12s ease;
  will-change: transform, opacity;
}

.bouton-action--pressed {
  transform: scale(0.96);
  opacity: 0.85;
}
```

---

## 🎬 Recette 36 : Animation d'Entrée de Page Fluide

**Quand l'utiliser ?** Dès qu'une nouvelle page s'ouvre pour supprimer le saut visuel brutal et offrir une sensation premium de transition fluide.

### Dans le conteneur principal de votre page (`.wxml`)
```xml
<view class="page-container page-enter">
  <!-- Tout le contenu de la page -->
</view>
```

### Dans le WXSS (`.wxss`)
```css
.page-enter {
  animation: pageFadeIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  will-change: transform, opacity;
}

@keyframes pageFadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 🏆 Recette 37 : Animation Séquentielle "Intro Success"

**Quand l'utiliser ?** Sur une page de confirmation de paiement, de réservation ou de commande validée pour célébrer le succès avec un badge qui grossit puis glisse en haut de l'écran.

### Le Contrôleur (`.js`)
```javascript
Page({
  data: {
    introScaleAnim: null,
    isDocked: false,
    showContent: false
  },

  onShow() {
    // 1. Pop & Rebond de l'icône de succès
    const anim = wx.createAnimation({ duration: 400, timingFunction: 'ease-out' });
    anim.scale(1.2).opacity(1).step();
    this.setData({ introScaleAnim: anim.export() });

    // 2. Amorti à taille 1
    setTimeout(() => {
      anim.scale(1).step({ duration: 250, timingFunction: 'ease-in-out' });
      this.setData({ introScaleAnim: anim.export() });
    }, 450);

    // 3. Montée vers le header ("Docking")
    setTimeout(() => {
      this.setData({ isDocked: true });
    }, 800);

    // 4. Révélation du reçu
    setTimeout(() => {
      this.setData({ showContent: true });
    }, 1250);
  }
});
```

### Dans le WXML & WXSS
```xml
<view class="badge-success {{ isDocked ? 'badge-success--docked' : '' }}" animation="{{ introScaleAnim }}">
  <icon type="success" size="64" />
</view>
<view class="recu {{ showContent ? 'page-enter' : 'masque' }}">
  <!-- Reçu de paiement -->
</view>
```

```css
.badge-success {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: top 500ms cubic-bezier(0.22, 1, 0.36, 1), transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 50;
}
.badge-success--docked {
  top: 130rpx;
  transform: translate(-50%, 0) scale(0.7);
}
.masque { display: none; }
```

---

## 🖼️ Recette 38 : Image Résiliente avec Retry 3x et Zoom Plein Écran

**Quand l'utiliser ?** Vous affichez des images distantes provenant d'une API sur un réseau 3G/4G instable. Vous voulez éviter les rectangles blancs et offrir la prévisualisation plein écran WeChat.

### Dans votre WXML
```xml
<app-image
  src="{{ item.imageUrl }}"
  fallbackSrc="/assets/images/default-card.png"
  mode="aspectFill"
  width="100%"
  height="320rpx"
  previewable="{{ true }}"
  retryCount="{{ 3 }}"
  retryDelay="{{ 1000 }}"
  containerClass="card-cover-image"
/>
```

---

## 🪟 Recette 39 : Bottom-Sheet avec Safe Area et Backdrop Blur

**Quand l'utiliser ?** Vous devez afficher un panneau d'action, des CGU ou un détail qui glisse depuis le bas sans être masqué par la barre blanche de l'iPhone.

### Dans votre WXML
```xml
<app-modal
  visible="{{ isBottomSheetOpen }}"
  placement="bottom"
  size="full"
  hasHeader="{{ false }}"
  hasContent="{{ true }}"
  bind:close="closeBottomSheet"
>
  <view slot="content" class="bottom-sheet-container">
    <view class="bottom-sheet-handle"></view>
    <scroll-view scroll-y class="bottom-sheet-scroll">
      <!-- Votre contenu ici -->
    </scroll-view>
  </view>
</app-modal>
```

### Dans votre WXSS
```css
.bottom-sheet-container {
  max-height: 85vh;
  padding: 16rpx 32rpx calc(24rpx + env(safe-area-inset-bottom, 40rpx));
  background: #ffffff;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
}
.bottom-sheet-handle {
  width: 80rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: #E5E7EB;
  margin: 0 auto 20rpx;
}
```

---

## 📅 Recette 40 : Calendrier Horizontal sans Décalage UTC

**Quand l'utiliser ?** L'utilisateur doit choisir une date dans le futur en respectant un délai de prévenance (`minDays`).

### Dans votre JS
```javascript
function generateBookingDates(minDays = 2, total = 14) {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() + minDays);

  return Array.from({ length: total }, (_, i) => {
    const cur = new Date(base);
    cur.setDate(cur.getDate() + i);
    const isoDate = [
      cur.getFullYear(),
      String(cur.getMonth() + 1).padStart(2, '0'),
      String(cur.getDate()).padStart(2, '0'),
    ].join('-');
    return {
      day: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][cur.getDay()],
      date: String(cur.getDate()),
      month: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'][cur.getMonth()],
      isoDate,
    };
  });
}
```

---

## 🧭 Recette 41 : Nav Bar sur Mesure avec Calcul Dynamique d'Encoche

**Quand l'utiliser ?** Vous utilisez `navigationStyle: "custom"` et devez décaler votre contenu pour qu'il ne passe pas sous la Dynamic Island ou l'encoche iPhone.

### Dans votre Composant / Page JS
```javascript
lifetimes: {
  attached() {
    const sys = wx.getSystemInfoSync();
    const statusBarHeight = sys.statusBarHeight || 20;
    const windowWidth = sys.windowWidth || 375;
    const navPaddingBottomPx = Math.ceil(34 * windowWidth / 750);

    this.setData({
      navContentOffset: statusBarHeight + 44 + navPaddingBottomPx,
    });
  }
}
```

---

## 🔄 Recette 42 : Liaison Page <-> EventBus sans Fuite Mémoire

**Quand l'utiliser ?** Votre page doit afficher le profil utilisateur ou un compteur partagé sans accumuler d'écouteurs à chaque navigation.

### Dans votre Page JS
```javascript
import { createPageHelpers } from '../../utils/helpers/page';

Page({
  data: { user: null },

  onLoad() {
    this._helpers = createPageHelpers(this, {
      user: 'user.data',
    });
    this._helpers.subscribe();
    this._helpers.loadInitial();
  },

  onUnload() {
    if (this._helpers) {
      this._helpers.unsubscribe();
    }
  },
});
```

---

## ⚡ Recette 43 : Cache Stale-While-Revalidate avec Garde Anti-Race

**Quand l'utiliser ?** Vous voulez afficher immédiatement une liste en 0 ms sans écran de chargement, puis la mettre à jour silencieusement depuis l'API.

### Dans votre Page JS
```javascript
Page({
  data: { items: [], loading: false },

  async refreshList() {
    const requestId = (this._reqId || 0) + 1;
    this._reqId = requestId;

    // 1. Rendu instantané depuis le cache local (0 ms)
    const cached = wx.getStorageSync('cached_items');
    if (cached && !this.data.items.length) {
      this.setData({ items: cached, loading: false });
    }

    // 2. Requête API silencieuse en arrière-plan
    try {
      const fresh = await backendAPI.getItems();
      if (requestId !== this._reqId) return; // Requête concurrente obsolète

      wx.setStorageSync('cached_items', fresh);
      this.setData({ items: fresh, loading: false });
    } catch (err) {
      if (requestId !== this._reqId) return;
      if (!this.data.items.length) this.setData({ loading: false });
    }
  }
});
```

---

## 💾 Recette 44 : Stockage Local Résilient Anti-Quota (10 Mo)

**Quand l'utiliser ?** Éviter les exceptions `QuotaExceededError` et traiter correctement les clés inexistantes WeChat (qui retournent `""`).

### Dans votre Module Utilitaire
```javascript
export const safeStorage = {
  get(key, fallback = null) {
    try {
      const val = wx.getStorageSync(key);
      return val !== '' && val !== undefined ? val : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      wx.setStorageSync(key, value);
      return true;
    } catch (e) {
      console.warn('[Storage] Échec écriture quota dépassé:', e.message);
      return false;
    }
  },
  getOrSet(key, factory) {
    const existing = this.get(key);
    if (existing !== null) return existing;
    const computed = factory();
    this.set(key, computed);
    return computed;
  }
};
```

---

## 🌙 Recette 45 : Thème Sombre (Dark Mode) avec Variables CSS

**Quand l'utiliser ?** Votre application doit s'adapter automatiquement au mode sombre du système de l'utilisateur (iOS / Android) sans texte blanc sur fond blanc et en préservant l'identité Orange.

### 1. Dans `app.wxss` (Variables CSS globales)
```css
page {
  --bg-page: #F8F9FA;
  --bg-card: #FFFFFF;
  --text-main: #111827;
  --text-secondary: #4B5563;
  --border-color: #E5E7EB;
  --color-primary: #F16E00;
}

@media (prefers-color-scheme: dark) {
  page {
    --bg-page: #121212;
    --bg-card: #1E1E1E;
    --text-main: #F9FAFB;
    --text-secondary: #D1D5DB;
    --border-color: #374151;
    --color-primary: #FF7900;
  }
}
```

### 2. Dans votre Page WXSS
```css
.card {
  background-color: var(--bg-card);
  border: 1rpx solid var(--border-color);
  color: var(--text-main);
  border-radius: 20rpx;
  padding: 24rpx;
}
.card__title {
  color: var(--text-main);
}
.card__subtitle {
  color: var(--text-secondary);
}
```

### 3. Dans votre Page JS (si détection dynamique requise)
```javascript
Page({
  data: { isDark: false },

  onLoad() {
    const sys = wx.getSystemInfoSync();
    this.setData({ isDark: sys.theme === 'dark' });

    // Écoute du basculement à chaud sans recharger l'app
    wx.onThemeChange((res) => {
      this.setData({ isDark: res.theme === 'dark' });
    });
  }
});
```

---

## 🌍 Recette 46 : Data-Saver (Compression d'Image avant Upload & Moniteur 3G)

**Quand l'utiliser ?** Dès qu'un utilisateur choisit une photo (pièce d'identité, ticket, profil) pour l'envoyer au serveur, afin d'économiser son forfait internet et éviter les timeouts 3G.

### 1. Le Helper de Compression (`utils/helpers/image.js`)
```javascript
/**
 * Compresse une image avant envoi pour réduire son poids de 80% à 95%
 */
export async function compressImageSafe(tempFilePath, quality = 75) {
  return new Promise((resolve) => {
    wx.compressImage({
      src: tempFilePath,
      quality,
      success: (res) => resolve(res.tempFilePath),
      fail: () => resolve(tempFilePath), // Repli sans bloquer
    });
  });
}
```

### 2. Le Contrôleur de Page (`pages/upload-justificatif/index.js`)
```javascript
import { compressImageSafe } from '../../utils/helpers/image.js';

Page({
  data: {
    photoUrl: '',
    uploadProgress: 0,
    isUploading: false,
    isLowNetwork: false,
  },

  onLoad() {
    wx.getNetworkType({
      success: (res) => {
        this.setData({ isLowNetwork: ['2g', '3g'].includes(res.networkType) });
      },
    });
  },

  async handleChoosePhoto() {
    try {
      const media = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
      });

      const rawPath = media.tempFiles[0].tempFilePath;

      // 1. Compression côté client (passage de 8 Mo à ~300 Ko)
      wx.showLoading({ title: 'Optimisation...' });
      const optimizedPath = await compressImageSafe(rawPath, 75);
      wx.hideLoading();

      // 2. Upload avec barre de progression
      this.uploadPhoto(optimizedPath);
    } catch (err) {
      console.warn('Sélection annulée ou échouée', err);
    }
  },

  uploadPhoto(filePath) {
    this.setData({ isUploading: true, uploadProgress: 0 });

    const uploadTask = wx.uploadFile({
      url: 'https://api.sonatel.sn/v1/documents/upload',
      filePath,
      name: 'document',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token'),
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        this.setData({ photoUrl: data.url, isUploading: false });
        wx.showToast({ title: 'Document envoyé !', icon: 'success' });
      },
      fail: (err) => {
        this.setData({ isUploading: false });
        wx.showToast({ title: 'Échec de l\'envoi', icon: 'none' });
      },
    });

    uploadTask.onProgressUpdate((res) => {
      this.setData({ uploadProgress: res.progress });
    });
  },
});
```

---

## 🛡️ Recette 47 : Conformité CDP (Masquage MSISDN et Purge Sécurisée)

**Quand l'utiliser ?** Sur tout écran affichant un numéro de téléphone client ou lors de la déconnexion, afin de respecter les audits de sécurité et la réglementation sur les données personnelles.

### 1. Le Helper de Masquage & Sécurité (`utils/helpers/security.js`)
```javascript
/**
 * Masque un numéro de téléphone selon les normes CDP (ex: 77 *** ** 67)
 */
export function maskMsisdn(msisdn) {
  if (!msisdn || typeof msisdn !== 'string') return '';
  const cleaned = msisdn.replace(/\s+/g, '').replace(/^\+221/, '');
  if (cleaned.length < 9) return '***';

  const prefix = cleaned.slice(0, 2);
  const suffix = cleaned.slice(-2);
  return `${prefix} *** ** ${suffix}`;
}

/**
 * Purge immédiatement tous les identifiants de session et tokens sensibles
 */
export function clearSessionSafe() {
  const SENSITIVE_KEYS = ['auth_token', 'token_expiry', 'user_msisdn', 'refresh_token'];
  SENSITIVE_KEYS.forEach((key) => {
    try {
      wx.removeStorageSync(key);
    } catch (e) {
      console.warn('[Security] Erreur purge :', key, e);
    }
  });
}
```

### 2. Le Filtre WXS pour l'Affichage WXML (`utils/wxs/filters.wxs`)
```javascript
// À ajouter dans votre fichier WXS
function maskPhone(val) {
  if (!val) return '';
  var str = '' + val;
  if (str.length < 9) return '***';
  var prefix = str.substring(0, 2);
  var suffix = str.substring(str.length - 2);
  return prefix + ' *** ** ' + suffix;
}

module.exports = {
  maskPhone: maskPhone
};
```

### 3. Utilisation dans la Page (`pages/profil/index.wxml`)
```xml
<wxs src="../../utils/wxs/filters.wxs" module="f" />

<view class="profile-card">
  <text class="label">Numéro de téléphone :</text>
  <!-- Le numéro est masqué directement à l'affichage -->
  <text class="value">{{ f.maskPhone(user.phone) }}</text>
</view>
```

---

## 🟠 Recette 48 : Composant Signature Solde Orange Money (ODS Sonatel avec Masquage & Tokens Pulse)

**Quand l'utiliser ?** Dans l'en-tête de votre page d'accueil ou de votre tunnel de paiement pour afficher le solde Orange Money du client en respectant scrupuleusement la charte Sonatel Max It, avec protection de la vie privée (masquage en 1 clic) et micro-animation de rafraîchissement.

### 1. Configuration (`components/ui/om-balance-pill/index.json`)
```json
{
  "component": true
}
```

### 2. Logique du Composant (`components/ui/om-balance-pill/index.js`)
```javascript
Component({
  properties: {
    balance: {
      type: Number,
      value: 0
    },
    currency: {
      type: String,
      value: 'FCFA'
    },
    initialMasked: {
      type: Boolean,
      value: false
    }
  },

  data: {
    isMasked: false,
    isRefreshing: false
  },

  lifetimes: {
    attached() {
      this.setData({
        isMasked: this.data.initialMasked
      });
    }
  },

  methods: {
    toggleMask() {
      try {
        wx.vibrateShort({ type: 'light' });
      } catch (e) {}
      this.setData({
        isMasked: !this.data.isMasked
      });
    },

    onRefresh() {
      if (this.data.isRefreshing) return;
      try {
        wx.vibrateShort({ type: 'light' });
      } catch (e) {}

      this.setData({ isRefreshing: true });
      this.triggerEvent('refresh', {}, {});

      // Arrêt automatique de l'animation après 1.2s
      setTimeout(() => {
        this.setData({ isRefreshing: false });
      }, 1200);
    },

    onTopup() {
      try {
        wx.vibrateShort({ type: 'medium' });
      } catch (e) {}
      this.triggerEvent('topup', {}, {});
    }
  }
});
```

### 3. Structure WXML (`components/ui/om-balance-pill/index.wxml`)
```xml
<view class="om-pill">
  <!-- Marqueur Brand Sonatel -->
  <view class="om-pill__brand">
    <view class="om-pill__dot"></view>
    <text class="om-pill__title">Orange Money</text>
  </view>

  <!-- Bloc Solde & Action Masquage -->
  <view class="om-pill__body">
    <view class="om-pill__amount-wrapper" bindtap="toggleMask">
      <block wx:if="{{ isMasked }}">
        <text class="om-pill__amount om-pill__amount--masked">•••••• {{ currency }}</text>
      </block>
      <block wx:else>
        <text class="om-pill__amount">{{ balance }} {{ currency }}</text>
      </block>
      <!-- Bouton Oeil WXML -->
      <view class="om-pill__eye-btn">
        <text class="om-pill__eye-icon">{{ isMasked ? '👁️' : '🔒' }}</text>
      </view>
    </view>

    <!-- Bouton Rafraîchir -->
    <view
      class="om-pill__refresh-btn {{ isRefreshing ? 'om-pill__refresh-btn--spinning' : '' }}"
      bindtap="onRefresh"
    >
      <text class="om-pill__refresh-icon">🔄</text>
    </view>
  </view>

  <!-- Bouton Rapide Recharger -->
  <view class="om-pill__footer">
    <button
      class="om-pill__action-btn"
      hover-class="om-pill__action-btn--pressed"
      bindtap="onTopup"
    >
      Recharger
    </button>
  </view>
</view>
```

### 4. Styles WXSS purs sans Nesting (`components/ui/om-balance-pill/index.wxss`)
```css
.om-pill {
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 24rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #EEEEEE;
  box-sizing: border-box;
}

.om-pill__brand {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.om-pill__dot {
  width: 14rpx;
  height: 14rpx;
  background-color: #F16E00;
  border-radius: 9999rpx;
  margin-right: 12rpx;
}

.om-pill__title {
  font-size: 22rpx;
  font-weight: 600;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 1rpx;
}

.om-pill__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.om-pill__amount-wrapper {
  display: flex;
  align-items: center;
}

.om-pill__amount {
  font-size: 38rpx;
  font-weight: 700;
  color: #1A1A1A;
  margin-right: 14rpx;
}

.om-pill__amount--masked {
  letter-spacing: 2rpx;
  color: #666666;
}

.om-pill__eye-btn {
  padding: 4rpx 8rpx;
  font-size: 24rpx;
}

.om-pill__refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  border-radius: 9999rpx;
  background-color: #F6F6F6;
  transition: transform 0.3s ease;
}

.om-pill__refresh-btn--spinning {
  animation: omSpin 0.8s linear infinite;
}

@keyframes omSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.om-pill__refresh-icon {
  font-size: 24rpx;
}

.om-pill__footer {
  display: flex;
  justify-content: flex-end;
}

.om-pill__action-btn {
  margin: 0;
  padding: 0 28rpx;
  height: 52rpx;
  line-height: 52rpx;
  font-size: 24rpx;
  font-weight: 600;
  background-color: #FFF3E8;
  color: #F16E00;
  border-radius: 9999rpx;
  border: none;
}

.om-pill__action-btn--pressed {
  opacity: 0.8;
  transform: scale(0.96);
}
```

---

## ⚡ Recette 49 : Throttler & Debouncer Haute Performance pour Scroll et setData (60 FPS)

**Quand l'utiliser ?** Dans `onPageScroll`, lors de la frappe dans un champ de recherche en direct (`bindinput`), ou sur tout événement à haute fréquence pour éliminer les chutes de FPS et les blocages du thread de rendu WeChat.

### 1. Le Module d'Optimisation Temporelle (`utils/helpers/timing.js`)
```javascript
/**
 * Limite l'exécution d'une fonction à un appel toutes les `wait` millisecondes (60 FPS)
 * @param {Function} fn - Fonction à exécuter
 * @param {number} wait - Intervalle minimal en ms (ex: 80ms pour scroll)
 * @returns {Function}
 */
export function throttle(fn, wait = 80) {
  let lastTime = 0;
  let timer = null;

  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - lastTime);

    if (remaining <= 0 || remaining > wait) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * Reporte l'exécution d'une fonction après un délai d'inactivité (ex: recherche en direct)
 * @param {Function} fn - Fonction à exécuter
 * @param {number} delay - Délai en ms (ex: 300ms pour saisie clavier)
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer = null;

  const debounced = function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };

  debounced.cancel = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}
```

### 2. Utilisation dans une Page WeChat (`pages/catalogue/index.js`)
```javascript
import { throttle, debounce } from '../../utils/helpers/timing';

Page({
  data: {
    isScrolled: false,
    searchQuery: '',
    results: []
  },

  onLoad() {
    // Création de la recherche debouncée
    this.handleSearch = debounce((query) => {
      this.executeApiSearch(query);
    }, 350);
  },

  // 1. Throttling du Scroll à 60 FPS (évite 60 setData par seconde)
  onPageScroll: throttle(function (e) {
    const isScrolled = e.scrollTop > 100;
    if (this.data.isScrolled !== isScrolled) {
      this.setData({ isScrolled });
    }
  }, 80),

  // 2. Recherche en direct debouncée
  onSearchInput(e) {
    const query = e.detail.value.trim();
    this.setData({ searchQuery: query });
    this.handleSearch(query);
  },

  executeApiSearch(query) {
    console.log('[Search] Lancement de la requête API pour :', query);
    // Appel API BackendAPI...
  },

  onUnload() {
    // Nettoyage impératif
    if (this.handleSearch && this.handleSearch.cancel) {
      this.handleSearch.cancel();
    }
  }
});
```

---

## 🇸🇳 Recette 50 : Moteur i18n Haute Performance Wolof / Français / Anglais (WXS 0 ms)

**Quand l'utiliser ?** Dans tout mini-programme ciblant le Sénégal ou la sous-région pour offrir une bascule instantanée entre le Français, le Wolof et l'Anglais sans latence de rendu, sans flash de contenu (FOUC) et sans saturer le thread JS de `setData`.

### 1. Le Moteur WXS Direct (`utils/i18n/i18n.wxs`)
```javascript
var locales = {
  fr: {
    'btn.confirm': 'Confirmer',
    'btn.cancel': 'Annuler',
    'btn.pay': 'Payer',
    'btn.topup': 'Recharger',
    'label.balance': 'Solde disponible',
    'label.welcome': 'Bienvenue, {name}',
    'status.loading': 'Chargement...'
  },
  wo: {
    'btn.confirm': 'Dëggal',
    'btn.cancel': 'Neenal',
    'btn.pay': 'Feye',
    'btn.topup': 'Doolil',
    'label.balance': 'Khaloiss bi am',
    'label.welcome': 'Dalal ak jamm, {name}',
    'status.loading': 'Xaaral tuti...'
  },
  en: {
    'btn.confirm': 'Confirm',
    'btn.cancel': 'Cancel',
    'btn.pay': 'Pay',
    'btn.topup': 'Top up',
    'label.balance': 'Available balance',
    'label.welcome': 'Welcome, {name}',
    'status.loading': 'Loading...'
  }
};

function t(key, lang, params) {
  var activeLang = lang || 'fr';
  var dict = locales[activeLang] || locales['fr'];
  var text = dict[key] || locales['fr'][key] || key;

  if (params) {
    for (var k in params) {
      if (params.hasOwnProperty(k)) {
        text = text.split('{' + k + '}').join(params[k]);
      }
    }
  }

  return text;
}

module.exports = {
  t: t
};
```

### 2. Le Gestionnaire Réactif de Langue (`utils/i18n/manager.js`)
```javascript
import { Bus } from '../bus/index';

const STORAGE_KEY = 'user_pref_lang';
const DEFAULT_LANG = 'fr';
const SUPPORTED_LANGS = ['fr', 'wo', 'en'];

/**
 * Récupère la langue active (depuis le stockage local ou système)
 */
export function getLang() {
  try {
    const saved = wx.getStorageSync(STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      return saved;
    }
  } catch (e) {}
  return DEFAULT_LANG;
}

/**
 * Définit la nouvelle langue et notifie toute l'application
 */
export function setLang(newLang) {
  if (!SUPPORTED_LANGS.includes(newLang)) return;
  try {
    wx.setStorageSync(STORAGE_KEY, newLang);
  } catch (e) {}

  // Notification globale via EventBus
  Bus.emit('LANG_CHANGED', newLang);
}

/**
 * Abonnement réactif au changement de langue
 */
export function onLangChange(callback) {
  return Bus.on('LANG_CHANGED', callback);
}
```

### 3. Utilisation dans un Template WXML (`pages/home/index.wxml`)
```xml
<wxs src="../../utils/i18n/i18n.wxs" module="i18n" />

<view class="home-container">
  <!-- Salutation avec paramètre dynamique -->
  <text class="greeting">{{ i18n.t('label.welcome', lang, { name: userName }) }}</text>

  <!-- Solde & Bouton Paiement instantanément traduits -->
  <view class="balance-card">
    <text class="balance-title">{{ i18n.t('label.balance', lang) }}</text>
    <button class="ods-btn ods-btn--primary">
      {{ i18n.t('btn.pay', lang) }}
    </button>
  </view>

  <!-- Sélecteur rapide de langue en 1 clic -->
  <view class="lang-switch">
    <view class="lang-btn {{ lang === 'fr' ? 'active' : '' }}" bindtap="changeLang" data-lang="fr">FR</view>
    <view class="lang-btn {{ lang === 'wo' ? 'active' : '' }}" bindtap="changeLang" data-lang="wo">Wolof</view>
    <view class="lang-btn {{ lang === 'en' ? 'active' : '' }}" bindtap="changeLang" data-lang="en">EN</view>
  </view>
</view>
```

### 4. Contrôleur de Page (`pages/home/index.js`)
```javascript
import { getLang, setLang, onLangChange } from '../../utils/i18n/manager';

Page({
  data: {
    lang: 'fr',
    userName: 'Amadou'
  },

  onLoad() {
    this.setData({ lang: getLang() });

    // Réception du changement de langue sans recharger la page
    this._unsubLang = onLangChange((newLang) => {
      this.setData({ lang: newLang });
    });
  },

  changeLang(e) {
    const lang = e.currentTarget.dataset.lang;
    setLang(lang);
  },

  onUnload() {
    if (this._unsubLang) {
      this._unsubLang();
    }
  }
});
```



