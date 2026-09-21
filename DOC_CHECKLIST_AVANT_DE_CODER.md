> 🔗 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Debug](DOC_DEBUG_ET_NOUVELLES_RECETTES.md) | [Checklist](DOC_CHECKLIST_AVANT_DE_CODER.md)

---

# ✅ La Checklist : Les Questions à Se Poser AVANT de Coder

Avant d'écrire **une seule ligne de code**, répondez à ces 8 questions dans l'ordre.
Chaque réponse vous dit exactement quoi faire et quel guide ouvrir.

> **Le principe :** Un pilote d'avion ne décolle jamais sans vérifier sa checklist. Vous non plus.

---

## ❓ Question 1 : Est-ce une PAGE ou un COMPOSANT ?

| Je crée... | Réponse | Fichier à créer dans... |
|---|---|---|
| Un écran complet (Accueil, Profil, Panier...) | 📄 **Page** | `pages/[mon-ecran]/` |
| Un élément réutilisable (Bouton, Carte, Modal...) | 🧩 **Composant** | `components/[mon-element]/` |

**➡️ Guide à ouvrir :** [`DOC_UI_POUR_DEVELOPPEURS.md`](DOC_UI_POUR_DEVELOPPEURS.md) → Choisir Option A (Page) ou Option B (Composant)

---

## ❓ Question 2 : Quels sont les ÉTATS possibles de mon écran ?

Listez tous les états que l'utilisateur peut voir. **Minimum requis : 3 états.**

| État | Quand ? |
|---|---|
| `loading` | Pendant le chargement des données |
| `content` | Quand les données sont affichées |
| `empty` | Quand il n'y a aucune donnée à afficher |
| `error` | Quand le réseau ou le serveur a un problème |
| `success` | Après une action réussie (formulaire soumis, etc.) |

**➡️ Action :** Dans votre `.js`, définissez `uiState: 'loading'` et un `wx:if` / `wx:elif` par état dans votre `.wxml`.

---

## ❓ Question 3 : Y a-t-il des données qui viennent du SERVEUR ?

```
OUI → Je dois créer un Mappeur + une méthode API
NON → Je travaille uniquement avec des données Mock (fausses données locales)
```

**Si OUI :**
1. Est-ce que le fichier API de ce domaine existe déjà ? (`utils/apis/user.api.js`, `utils/apis/flight.api.js`...)
   - **OUI** → J'ajoute ma méthode dans ce fichier existant.
   - **NON** → Je crée un nouveau fichier `utils/apis/[mondomaine].api.js`.
2. Est-ce que le mappeur de ce domaine existe déjà ? (`utils/mappers/user.js`...)
   - **OUI** → J'ajoute mon nouveau schéma dans ce fichier existant.
   - **NON** → Je crée un nouveau fichier `utils/mappers/[mondomaine].js`.

**➡️ Guide à ouvrir :** [`DOC_API_POUR_DEVELOPPEURS.md`](DOC_API_POUR_DEVELOPPEURS.md)

---

## ❓ Question 4 : Est-ce que ma SITUATION ressemble à une Recette existante ?

Ouvrez le Sommaire des Recettes et cherchez votre cas :

| Si mon besoin ressemble à... | Recette à utiliser |
|---|---|
| Afficher une liste depuis le serveur | Recette 1 (Liste + Scroll Infini) |
| Soumettre un formulaire | Recette 2 (Formulaire + Validation) |
| Afficher le détail d'un élément | Recette 3 (Page de Détail) |
| Choisir et envoyer une photo | Recette 4 (Upload Photo) |
| Filtrer depuis une page séparée | Recette 5 (Filtres) |
| Un compteur visible partout | Recette 6 (Compteur Partagé) |
| Page de connexion | Recette 7 (Login) |
| Recharger en tirant vers le bas | Recette 8 (Pull-to-Refresh) |
| Barre de recherche intelligente | Recette 9 (Recherche Debounce) |
| Bouton Favori / Like | Recette 10 (Favori Toggle) |
| Bouton "Envoyer à un ami" | Recette 11 (Partage WeChat) |
| Menu à onglets | Recette 12 (Tabs) |
| Afficher sans réseau | Recette 13 (Cache Local) |
| ❌ Aucune recette ne correspond | → Codez, puis ajoutez votre recette ! |

**➡️ Guide à ouvrir :** [`DOC_RECETTES_COPIER_COLLER.md`](DOC_RECETTES_COPIER_COLLER.md)

---

## ❓ Question 5 : Est-ce que mon composant doit COMMUNIQUER avec quelqu'un ?

```
Mon composant parle à sa PAGE PARENT directement
    → Utiliser this.triggerEvent('action', data)
    → Guide : DOC_COMMUNICATION_EVENEMENTS.md → Outil 1

Deux PAGES DISTANTES doivent se parler (une action dans Page B rafraîchit Page A)
    → Utiliser Bus.emit() / Bus.on()
    → Guide : DOC_COMMUNICATION_EVENEMENTS.md → Outil 2

Une DONNÉE GLOBALE doit être visible partout (Panier, Profil, Thème)
    → Utiliser Bus.setState() / Bus.onState()
    → Guide : DOC_COMMUNICATION_EVENEMENTS.md → Outil 3
```

**➡️ Guide à ouvrir :** [`DOC_COMMUNICATION_EVENEMENTS.md`](DOC_COMMUNICATION_EVENEMENTS.md)

---

## ❓ Question 6 : Y a-t-il des données à FORMATER pour l'affichage ?

```
Prix, devises → WXS formatPrix()
Dates → WXS formatDate()
Statuts (0/1/2 → "En cours"/"Terminé") → WXS formatStatut()
Calculs mathématiques (TVA, réductions) → Helper JS dans utils/helpers/
```

**⚠️ Règle absolue :** On ne formate JAMAIS dans le `.js` avec `setData({ prixFormate: "15 000 FCFA" })`.
On formate toujours dans le `.wxml` avec `{{ f.formatPrix(item.prix) }}`.

**➡️ Guide à ouvrir :** [`DOC_DONNEES_MAPPERS_HELPERS.md`](DOC_DONNEES_MAPPERS_HELPERS.md)

---

## ❓ Question 7 : Est-ce que je dois ajouter une ANIMATION ?

```
Un écran qui apparaît → .animate-fade-in
Un tiroir qui monte du bas → .animate-slide-up + Overlay
Un écran de succès → .animate-bounce-in
Un chargement → .skeleton-box + @keyframes pulse
Un wizard (plusieurs étapes) → uiState + wx:elif par étape
```

**➡️ Guide à ouvrir :** [`DOC_FLUX_COMPLEXES_ANIMATIONS.md`](DOC_FLUX_COMPLEXES_ANIMATIONS.md)

---

## ❓ Question 8 : Ai-je vérifié les RÈGLES ANTI-CONFLIT ?

Avant de commencer à coder, cochez ces cases :

```
☐ Je vais travailler UNIQUEMENT dans le dossier de MA page / MON composant
☐ Je ne vais PAS modifier app.js, app.wxss sans que ce soit explicitement demandé
☐ Je ne vais PAS modifier les fichiers des autres développeurs
☐ Si j'ajoute un endpoint API, je crée/modifie UNIQUEMENT mon fichier .api.js
☐ Si j'ajoute un mappeur, je crée/modifie UNIQUEMENT mon fichier dans utils/mappers/
☐ Je n'oublie pas d'exporter ma classe API dans utils/apis/index.js
```

---

## 🚀 Le Résumé : Le Parcours Complet d'un Développeur

```
1. ANALYSER  → Répondre aux 8 questions ci-dessus (5 minutes)
2. TROUVER   → Chercher la recette qui correspond à ma situation
3. CRÉER     → Créer les 4 fichiers (.js, .wxml, .wxss, .json)
4. MOCKER    → Mettre de fausses données + définir tous les uiState
5. CONSTRUIRE → Coder le WXML avec wx:if par état + CSS + animations
6. CONNECTER → Quand le design est validé, brancher l'API (@API-CONNECT)
7. TESTER    → Utiliser dd() et la "Remontée de Chaîne" si bug
8. LIVRER    → git add / commit / push
```
