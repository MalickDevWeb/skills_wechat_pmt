# 🚀 Le Guide Ultra-Simple : Ajouter une API (Même pour les non-codeurs)

Si vous lisez ceci, vous avez pour mission d'ajouter une nouvelle connexion au serveur (un "Endpoint"). Pas de panique. Considérez cela comme un jeu de Lego. Il y a 3 pièces à assembler, toujours dans le même ordre.

**La Règle d'or :** 
- 🔒 **Ce qui est écrit normalement** = NE TOUCHEZ PAS (C'est le moteur de l'application).
- ✏️ **Ce qui est entre `[CROCHETS]`** = REMPLACEZ-LE par vos mots.

---

## 🧩 PIÈCE 1 : Le Filtre (Le Mappeur)
**Où aller ?** Ouvrez le dossier `utils/mappers/` et choisissez votre fichier (ex: `vols.js`, `utilisateurs.js`).

**Pourquoi ?** Le serveur nous envoie beaucoup de données inutiles. Le "Mappeur" est un filtre. Il attrape la donnée du serveur (`@link.xyz`) et lui donne un nom propre pour notre application.

**Le code à copier-coller :**
```javascript
// ✏️ Remplacez [NOM_DU_SCHEMA] (ex: ProfilUtilisateurSchema)
export const [NOM_DU_SCHEMA] = {
  
  // ✏️ À GAUCHE : Le nom que vous voulez utiliser dans votre page
  // ✏️ À DROITE : Le chemin exact de la donnée envoyée par le serveur
  [MON_CHAMP_1]: "@link.[CHEMIN_DU_SERVEUR_1]",
  [MON_CHAMP_2]: "@link.[CHEMIN_DU_SERVEUR_2]",
  
  // Exemple concret :
  // prenom: "@link.first_name",
  // prix: "@link.amount::number",   <-- Ajoutez ::number si c'est un prix
  // actif: "@link.is_active::boolean" <-- Ajoutez ::boolean si c'est vrai/faux
};
```
⚠️ *Attention : N'oubliez pas les virgules `,` à la fin de chaque ligne !*

---

## 🧩 PIÈCE 2 : Le Livreur (L'API)
**Où aller ?** Ouvrez le dossier `utils/apis/` et choisissez votre fichier (ex: `user.api.js`).

**Pourquoi ?** C'est le livreur qui va chercher les données sur le serveur (avec la bonne URL) et qui les passe à notre Filtre (Pièce 1) avant de nous les donner.

**Le code à copier-coller :**
```javascript
// 1. Dites où est le serveur (URL)
const ENDPOINTS = {
  // ✏️ Remplacez [NOM_URL] et [LE_CHEMIN_DU_SERVEUR] (ex: GET_PROFIL: '/api/v1/profil')
  [NOM_URL]: '[LE_CHEMIN_DU_SERVEUR]' 
};

class MonApi {
  
  // ✏️ Remplacez [NOM_DE_LA_FONCTION] (ex: chargerProfil)
  async [NOM_DE_LA_FONCTION](parametres) {
    
    // 🔒 NE TOUCHEZ PAS : Ça gère la sécurité tout seul
    await authenticate(); 
    
    // 🔒 NE TOUCHEZ PAS : Le livreur va chercher les données
    // ✏️ Remplacez [NOM_URL] par celui défini juste au-dessus
    const res = await httpClient.get(ENDPOINTS.[NOM_URL], { query: parametres });
    
    // 🔒 NE TOUCHEZ PAS : Gestion des pannes du serveur
    if (!res.success) throw new Error(res.error?.message || "Erreur réseau");
    
    // 🔒 NE TOUCHEZ PAS au sculpt.data
    // ✏️ REMPLACEZ [NOM_DU_SCHEMA] par celui de la PIÈCE 1
    return sculpt.data({ data: res.data, to: [NOM_DU_SCHEMA] });
  }
}
```

---

## 🧩 PIÈCE 3 : L'Écran (La Page ou le Composant)
**Où aller ?** Ouvrez le dossier de votre page (ex: `pages/mon-profil/index.js`).

**Pourquoi ?** C'est ce que voit l'utilisateur. On affiche un chargement ("Veuillez patienter..."), on appelle le livreur (Pièce 2), et on affiche le résultat.

**Le code à copier-coller (dans votre objet Page) :**
```javascript
Page({
  data: {
    // 🔒 C'est ici qu'on stocke les données pour l'écran HTML
    isLoading: false, 
    [MA_VARIABLE_POUR_L_ECRAN]: null 
  },

  // ✏️ Remplacez [NOM_DE_L_ACTION] (ex: auClicSurLeBouton, ou onReady)
  async [NOM_DE_L_ACTION]() {
    
    // 1. 🔒 On affiche le sablier de chargement
    this.setData({ isLoading: true }); 
    
    try {
      // 2. ✏️ On appelle notre Livreur (PIÈCE 2)
      const resultat = await monAPI.[NOM_DE_LA_FONCTION]();
      
      // 3. ✏️ On sauvegarde le résultat pour l'afficher à l'écran
      this.setData({ [MA_VARIABLE_POUR_L_ECRAN]: resultat });
      
    } catch (erreur) {
      // 4. 🔒 Si le serveur est cassé, on affiche une petite bulle rouge à l'utilisateur
      wx.showToast({ title: erreur.message, icon: 'none' });
      
    } finally {
      // 5. 🔒 Quoi qu'il arrive, on cache le sablier de chargement
      this.setData({ isLoading: false }); 
    }
  }
});
```

---

## 💡 Résumé des 3 questions à se poser (Anti-Bug) :
1. **Mon URL est-elle bonne ?** (Vérifiez dans la *PIÈCE 2*)
2. **Le nom de mes champs correspond-il à ce qu'envoie le serveur ?** (Vérifiez `@link.mon_champ` dans la *PIÈCE 1*)
3. **Ai-je bien caché le chargement à la fin ?** (Vérifiez le `finally` dans la *PIÈCE 3*)

Si les 3 cases sont cochées, votre code fonctionne ! 🎉
