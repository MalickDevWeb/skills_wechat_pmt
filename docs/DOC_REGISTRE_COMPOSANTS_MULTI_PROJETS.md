# 🏛️ Registre & Matrice des Composants Multi-Projets (Afritrips, SAMU, ATS)

> Ce document constitue le **Répertoire d'Inspiration et la Cartographie Officielle des Composants** issus des 3 projets de l'écosystème Orange Sonatel / Max It.
> Il est régi par les **4 Règles d'Or d'Architecture** validées.

---

## ⚖️ Les 4 Règles d'Or Anti-Duplication & Indépendance des Projets

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. « Il vaut mieux une petite duplication propre qu'une mauvaise dépendance partagée. »          │
│    On mutualise les briques graphiques pures (Boutons, Modales, Typo), mais on garde les       │
│    composants métiers séparés (Vol vs Ambulance).                                                │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. Indépendance physique des projets :                                                           │
│    Chaque projet garde son propre repository et son arborescence. Le skill sert de modèle et     │
│    catalogue d'inspiration, mais n'impose aucun fichier partagé qui bloquerait Git.              │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. Conseiller Bienveillant (Warning non-bloquant) :                                              │
│    Le détecteur suggère poliment : « Au fait, un helper similaire existe dans utils/helpers/... »│
│    mais ne bloque jamais le build ni la CI.                                                      │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. Seuil strict de découpage à 35-40 lignes :                                                   │
│    Ne découper que lorsque la fonction dépasse 35-40 lignes ou orchestre des phases critiques    │
│    (Pattern Kalidou en 6 sous-méthodes).                                                         │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Cartographie des Briques par Famille

### Famille 1 : Briques Graphiques Pures (`components/ui/`) — MUTUALISABLES SANS RISQUE
Ces composants sont 100% agnostiques du métier. Ils utilisent des `slots` et des `properties` ODS (Orange Design System).

| Composant | Rôle & Usage | Présent dans | Propriétés Clés |
| :--- | :--- | :---: | :--- |
| **`osn-button` / `app-button`** | Bouton CTA avec Apple Press tactile | Les 3 projets | `type="primary\|secondary"`, `block`, `loading` |
| **`osn-modal` / `app-modal`** | Fenêtre modale centrée ou bottom-sheet avec backdrop blur | Les 3 projets | `visible`, `placement="center\|bottom"`, `size="lg"` |
| **`osn-typography`** | Gestion responsive de texte et hiérarchie de police | Les 3 projets | `fontSize="28rpx"`, `weight="700"`, `color` |
| **`osn-nav-bar`** | En-tête adaptatif calculé sous la capsule WeChat | Les 3 projets | `title`, `back="{{ true }}"`, `transparent` |
| **`stepper`** | Indicateur d'étapes horizontal pour tunnels multi-écrans | SAMU, Afritrips | `currentStep`, `steps`, `direction="horizontal"` |
| **`chip-group`** | Groupe de pilules de filtres ou de sélection rapide | SAMU, Afritrips | `items`, `selected`, `bind:change` |
| **`input-spinner`** | Sélecteur numérique incrémental (+ / -) avec bornes | SAMU, Afritrips | `min`, `max`, `value`, `step` |

---

### Famille 2 : Composants Métier d'Afritrips (`mp-afritrips`) — INSPIRATION BILLETTERIE & FUNNELS
Composants spécialisés dans le transport, les flux multi-passagers et les vouchers.

| Composant | Rôle & Usage Métier | Fichiers Clés | Quand s'en inspirer ? |
| :--- | :--- | :--- | :--- |
| **`trip-ticket`** | Carte de billet d'avion avec badge escale et QR code | `components/ui/trip-ticket/` | Tout projet ayant des billets, cartes d'accès ou titres |
| **`passenger-card`** | Sélection et validation IATA de passagers adultes/enfants/bébés | `components/ui/passenger-card/` | Formulaires multi-bénéficiaires ou listes d'inscrits |
| **`baggage-allowance`** | Accordéon à nœud virtuel (`virtualHost: true`) des franchises bagages | `components/baggage-allowance/` | Tout détail de conditions tarifaires ou clauses |
| **`whatsapp-modal`** | Modale QR Code officielle avec scan appui long natif WeChat | `components/whatsapp-modal/` | Tout canal de support client WhatsApp / Téléphone |
| **`flight-loader`** | Animation de ciel défilant et avion 60 FPS sans dépendance | `components/ui/flight-loader/` | Écrans d'attente de recherche ou traitement long |

---

### Famille 3 : Composants Métier de SAMU (`mp-samu`) — INSPIRATION GÉOLOCALISATION & PAIEMENT MODULAIRE
Composants spécialisés dans l'urgence, la géolocalisation et les tunnels de paiement découpés.

| Composant | Rôle & Usage Métier | Fichiers Clés | Quand s'en inspirer ? |
| :--- | :--- | :--- | :--- |
| **`city-picker-sheet`** | Bottom-sheet de sélection de villes avec filtre recherche | `components/custom/ui/city-picker-sheet/` | Tout sélecteur de localité, agence, point relais |
| **`location-select`** | Carte de sélection d'adresse / géolocalisation d'urgence | `components/custom/ui/location-select/` | Prise d'adresse, livraison, prise en charge |
| **`maxit-pay-sheet`** | Tiroir de paiement Max It Sonatel / OM autonome | `components/custom/ui/maxit-pay-sheet/` | Tout paiement marchand avec choix de mode |
| **`receipt-ticket`** | Reçu de transaction certifié avec protection anti-capture | `components/custom/ui/receipt-ticket/` | Factures, justificatifs de paiement et quittances |
| **`transfer-sheet`** | Formulaire d'évacuation ou transfert inter-zones | `components/custom/ui/transfer-sheet/` | Réservations de course ou transport point à point |

---

### Famille 4 : Composants UX & Skeletons Shimmer Wave — ATTENTE & RÉSILIENCE

| Composant UX | Rôle | Emplacement Recommandé |
| :--- | :--- | :--- |
| **`offer-card-skeleton`** | Carte fantôme avec vague shimmer pour listes d'offres | `components/custom/ux/offer-card-skeleton/` |
| **`receipt-card-skeleton`** | Squelette de chargement pour historiques de transactions | `components/custom/ux/receipt-card-skeleton/` |
| **`empty-state`** | Illustration, message bienveillant et bouton d'action si liste vide | `components/custom/ux/empty-state/` |
| **`payment-loader`** | Loader sécurisé pendant la validation bancaire Orange Money | `components/custom/ux/payment-loader/` |

---

## 🤖 Algorithme de Résolution IA pour l'Agent

Lorsque l'utilisateur soumet un prompt pour une nouvelle fonctionnalité, l'agent IA suit cet algorithme :

```text
1. ANALYSE DU BESOIN :
   - Est-ce une brique graphique pure ? (Bouton, Modal, Input, Typo)
     ➔ OUI : Réutiliser directement components/ui/ existant avec slots.
   - Est-ce un composant métier ? (Billet, Trajet, Paiement, Ville, Support)
     ➔ Consulter le tableau ci-dessus :
       * Si similaire à SAMU (ex: sélection ville, paiement) : s'inspirer de mp-samu.
       * Si similaire à Afritrips (ex: billet, passagers, whatsapp) : s'inspirer de mp-afritrips.
       * Si inédit (ex: météo, capteurs) : créer un nouveau composant 4 fichiers ODS.
2. VÉRIFICATION DES HELPERS :
   - Ne jamais recoder de date, prix, regex ou retry : importer depuis utils/helpers/.
3. SEUIL DE DÉCOUPAGE :
   - Si la fonction du contrôleur dépasse 35-40 lignes : appliquer la Recette 74 (Pattern Kalidou en 6 sous-méthodes).
```
