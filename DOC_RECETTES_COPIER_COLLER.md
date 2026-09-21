> 🔗 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md)

---

# 📚 Le Livre de Recettes : Solutions Complètes Prêtes à l'Emploi

Chaque recette est une **solution complète et autonome**. Vous trouvez votre situation, vous copiez le bloc entier (Mappeur + API + JS + HTML + CSS), vous changez uniquement les `[CROCHETS]`, et votre fonctionnalité est opérationnelle.

## 📑 Sommaire — Trouvez votre situation
| Numéro | Je dois coder... | Complexité |
|---|---|---|
| 🔵 [Recette 1](#-recette-1--page-de-liste-avec-api--skeleton--scroll-infini) | Une page de liste qui charge depuis le serveur, avec chargement fantôme et défilement infini | Moyenne |
| 🔵 [Recette 2](#-recette-2--formulaire-complet-avec-validation-et-envoi-api) | Un formulaire avec validation en direct et envoi au serveur | Moyenne |
| 🔵 [Recette 3](#-recette-3--page-de-détail-avec-api) | Une page de détail (produit, vol, profil) qui affiche les données du serveur | Facile |
| 🔵 [Recette 4](#-recette-4--upload-photo--envoi-au-serveur) | Un bouton pour choisir une photo et l'envoyer au serveur | Moyenne |
| 🔵 [Recette 5](#-recette-5--filtres-sur-une-page-séparée-qui-rafraîchit-la-liste) | Un système de filtres sur une page dédiée qui recharge la liste principale | Avancée |
| 🔵 [Recette 6](#-recette-6--compteur-de-panier-partagé-entre-toutes-les-pages) | Un compteur (panier, notifications) visible sur toutes les pages en même temps | Avancée |

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
