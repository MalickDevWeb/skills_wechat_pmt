> 🔗 **Navigation :** [Guide UI](DOC_UI_POUR_DEVELOPPEURS.md) | [Guide API](DOC_API_POUR_DEVELOPPEURS.md) | [Guide Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Guide Com.](DOC_COMMUNICATION_EVENEMENTS.md) | [Guide Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes Situations](DOC_RECETTES_COPIER_COLLER.md)

---

# 📚 Le Livre de Recettes (Copier-Coller par Situation)

Vous avez un problème précis à résoudre ? Cherchez votre situation dans la liste ci-dessous, copiez le code, et adaptez les `[CROCHETS]`.

## 📑 Sommaire des Situations
1. [Je veux faire une Liste avec Pagination (Scroll Infini)](#situation-1--liste-avec-pagination-scroll-infini)
2. [Je veux uploader une Image / Photo](#situation-2--uploader-une-image--photo)
3. [Je veux faire des Onglets (Tabs) pour changer de vue](#situation-3--onglets-tabs-pour-changer-de-vue)
4. [Je veux faire un Formulaire avec Validation](#situation-4--formulaire-avec-validation)
5. [Je veux faire un bouton "Partager à un ami"](#situation-5--bouton-partager-à-un-ami)

---

## Situation 1 : Liste avec Pagination (Scroll Infini)
*Le problème : Vous voulez afficher des produits, et quand l'utilisateur descend tout en bas de l'écran, ça charge la suite automatiquement.*

**Dans le `.js` :**
```javascript
Page({
  data: {
    uiState: 'loading',
    liste: [],
    pageActuelle: 1,
    estFini: false // Vrai s'il n'y a plus rien à charger
  },

  onLoad() { this.chargerDonnees(); },

  // 🔒 Magie WeChat : Se déclenche tout seul quand on touche le bas de l'écran
  onReachBottom() {
    if (!this.data.estFini) {
      this.chargerDonnees();
    }
  },

  async chargerDonnees() {
    try {
      // ✏️ Appel à l'API en demandant la bonne page
      const nouvellesDonnees = await monAPI.getListe({ page: this.data.pageActuelle });
      
      this.setData({
        // 🔒 On colle les nouvelles données à la suite des anciennes
        liste: [...this.data.liste, ...nouvellesDonnees],
        pageActuelle: this.data.pageActuelle + 1,
        estFini: nouvellesDonnees.length === 0, // S'il n'y a plus rien, on arrête
        uiState: 'content'
      });
    } catch (e) {
      this.setData({ uiState: 'error' });
    }
  }
});
```

---

## Situation 2 : Uploader une Image / Photo
*Le problème : L'utilisateur doit choisir une photo dans son téléphone et vous devez l'afficher avant de l'envoyer au serveur.*

**Dans le `.wxml` :**
```xml
<view class="upload-box" bindtap="choisirImage">
  <!-- 🔒 Si j'ai une image, je l'affiche, sinon j'affiche un bouton '+' -->
  <image wx:if="{{imageChoisie}}" src="{{imageChoisie}}" mode="aspectFill" />
  <text wx:else>+</text>
</view>
```

**Dans le `.js` :**
```javascript
Page({
  data: { imageChoisie: null },

  choisirImage() {
    // 🔒 Ouvre la galerie photo du téléphone
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 1. On affiche l'image à l'écran
        const cheminTemporaire = res.tempFiles[0].tempFilePath;
        this.setData({ imageChoisie: cheminTemporaire });

        // 2. ✏️ On appelle notre API pour envoyer le fichier au serveur
        // monAPI.uploaderFichier(cheminTemporaire);
      }
    });
  }
});
```

---

## Situation 3 : Onglets (Tabs) pour changer de vue
*Le problème : Vous voulez un menu avec "En cours", "Terminé", "Annulé" et changer le contenu en dessous.*

**Dans le `.wxml` :**
```xml
<!-- Les 3 boutons de l'onglet -->
<view class="tabs">
  <view 
    class="tab {{ongletActif === 'en_cours' ? 'actif' : ''}}" 
    bindtap="changerOnglet" data-onglet="en_cours">En Cours</view>
    
  <view 
    class="tab {{ongletActif === 'termine' ? 'actif' : ''}}" 
    bindtap="changerOnglet" data-onglet="termine">Terminé</view>
</view>

<!-- Le contenu qui change -->
<view wx:if="{{ongletActif === 'en_cours'}}"> <text>Contenu 1</text> </view>
<view wx:if="{{ongletActif === 'termine'}}"> <text>Contenu 2</text> </view>
```

**Dans le `.js` :**
```javascript
Page({
  data: { ongletActif: 'en_cours' },

  changerOnglet(e) {
    // 🔒 On récupère le nom de l'onglet cliqué dans le dataset
    const nouvelOnglet = e.currentTarget.dataset.onglet;
    this.setData({ ongletActif: nouvelOnglet });
    
    // ✏️ Ici, vous pouvez refaire un appel API si nécessaire
  }
});
```

---

## Situation 4 : Formulaire avec Validation
*Le problème : Vous voulez empêcher l'utilisateur de cliquer sur "Valider" si son mot de passe est trop court.*

**Dans le `.wxml` :**
```xml
<!-- 🔒 bindinput met à jour le texte en temps réel -->
<input placeholder="Mot de passe" bindinput="auChangementTexte" />

<!-- 🔒 Le bouton se désactive tout seul si la variable formulaireValide est fausse -->
<button disabled="{{!formulaireValide}}" bindtap="envoyer">Valider</button>
```

**Dans le `.js` :**
```javascript
Page({
  data: { 
    motDePasse: '',
    formulaireValide: false
  },

  auChangementTexte(e) {
    const texte = e.detail.value;
    // 🔒 On met à jour le texte ET on vérifie si la longueur est > 5
    this.setData({ 
      motDePasse: texte,
      formulaireValide: texte.length > 5 
    });
  },

  envoyer() {
    if (!this.data.formulaireValide) return; // Sécurité
    // ✏️ Appel API ici
  }
});
```

---

## Situation 5 : Bouton "Partager à un ami"
*Le problème : L'utilisateur veut envoyer la page (ex: Un Produit) à un ami sur WeChat.*

**Dans le `.wxml` :**
```xml
<!-- 🔒 OBLIGATOIRE : open-type="share" ouvre le menu de partage WeChat -->
<button open-type="share">Envoyer à un ami</button>
```

**Dans le `.js` :**
```javascript
Page({
  // 🔒 Fonction native WeChat : Se déclenche quand on clique sur le bouton Share
  onShareAppMessage() {
    return {
      // ✏️ Ce que l'ami va voir dans sa conversation WeChat
      title: 'Regarde ce produit incroyable !',
      path: '/pages/detail-produit/index?id=123', // Là où l'ami va atterrir
      imageUrl: 'https://mon-site.com/image-produit.png' // Image de la bulle
    };
  }
});
```
