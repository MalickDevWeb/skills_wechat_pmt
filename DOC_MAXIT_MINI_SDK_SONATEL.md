> 🧭 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [SDK Max It Sonatel](DOC_MAXIT_MINI_SDK_SONATEL.md) | [Paiement & Résilience](DOC_PAIEMENT_NATIVE_MAXIT_ET_RESILIENCE.md) | [Responsive & TabBar](DOC_RESPONSIVE_IPHONE_ET_CUSTOM_TABBAR.md) | [Navigation & Behaviors](DOC_NAVIGATION_BEHAVIORS_ET_METIER.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# 📱 Guide Officiel : SDK Max It Mini-Program (`@sonatel-os/maxit-mini-sdk`)

> **Source Officielle Sonatel Shared Foundations :** Package officiel `npm: @sonatel-os/maxit-mini-sdk`.  
> Ce SDK unifie l'ensemble des interactions avec l'hôte Max It / Orange Money, encapsule `wx.invokeNativePlugin`, élimine tous les bugs historiques de l'hôte et fournit une simulation complète pour WeChat DevTools.

---

## 💡 Pourquoi ce SDK est Indispensable : Les 6 Pièges Mortels de l'Hôte Max It

Le canal brut `wx.invokeNativePlugin` présente des pièges critiques connus de toutes les équipes Sonatel/Orange :

1. **Le faux succès `{ result: 'fail' }` :** L'hôte répond parfois à un échec dans le callback `success` au lieu de `fail`.
2. **Le blocage de 15 minutes sur transaction identique :** Un second paiement avec le même montant et référence est refusé pendant 15 minutes. Pour forcer la poursuite, l'hôte exige `caction: '1'` (obligatoirement une chaîne de caractères, un nombre `1` échouant à la vérification de type).
3. **Le crash de `contactList` :** Fournir un champ `data` à `contactList` fait renvoyer une liste vide par l'hôte. Il ne faut strictement rien lui passer.
4. **Le formatage sauvage du MSISDN :** Le numéro utilisateur arrive pollué (`+221 77...`, `00221 78...`, avec des espaces ou des points).
5. **Le `block_screen` persistant :** La protection d'écran anti-capture (`block_screen`) est globale à l'application hôte. Si vous ne la désactivez pas en quittant votre page, **tout le reste de Max It reste masqué** !
6. **Les Deep Links répétés sur `onShow` :** `onShow` reçoit les mêmes arguments à chaque retour de premier plan, provoquant des navigations en boucle si elles ne sont pas dédoublonnées.

---

## 📦 Installation & Mise à Jour

Le SDK n'ajoute **aucune dépendance lourde dans `package.json`** et ne nécessite **aucun bundler**. Il s'installe sous forme d'un bundle unique auto-suffisant vérifié par empreinte SHA-256 :

```bash
# Installation ou mise à jour automatique
npx @sonatel-os/maxit-mini-sdk update

# Spécifier un dossier cible si différent de ./sdk
npx @sonatel-os/maxit-mini-sdk update --dir utils/sdk

# Vérifier la présence d'une nouvelle version
npx @sonatel-os/maxit-mini-sdk check
```

---

## ⚙️ Configuration Initiale (`app.js`)

À appeler une seule fois au démarrage de l'application :

```javascript
import { miniSDK } from './sdk/index.js';

App({
  onLaunch(options) {
    // Détection de l'environnement de dev / DevTools
    const isDev = typeof __wxConfig !== 'undefined' && __wxConfig.envVersion === 'develop';

    miniSDK.configure({
      simulate: isDev, // Active les fixtures dans DevTools sans téléphone physique !
      log: (level, api, message, ctx) => {
        if (isDev) console.log(`[SDK:${api}] ${message}`, ctx || '');
      },
      timeoutMs: 30000
    });
  }
});
```

---

## 📡 Répertoire des Méthodes Principales

### 1. 👤 `miniSDK.user()` — Identité Utilisateur Sans Login Screen
Dans Max It, l'utilisateur est **déjà authentifié** par l'application hôte. Vous n'avez pas à coder d'écran de connexion par mot de passe.

```javascript
const { msisdn, fullName, firstName, lastName } = await miniSDK.user();
// msisdn est toujours nettoyé au format 9 chiffres : "770000001"
```

---

### 2. 🔑 `miniSDK.login()` — Code Unique pour Votre Backend
Obtient un code à usage unique à envoyer à votre passerelle d'authentification (`POST /auth/session { code, appId }`). Zéro secret client ne voyage dans le mini-programme.

```javascript
const code = await miniSDK.login();
const session = await httpClient.post('/auth/session', { code, appId: 'VOTRE_APP_ID' });
```

---

### 3. 💳 `miniSDK.pay(order, handlers)` — Paiement Marchand Orange Money

Gère automatiquement l'enveloppe hôte, le scellage du `txnid`, et la demande de confirmation en cas de doublon.

```javascript
try {
  const { txnid, confirmedIdentical } = await miniSDK.pay({
    amount: 15000,              // Montant entier en XOF
    receiver: 467652,           // Code Marchand officiel (numérique)
    receiverName: 'ATS Voyages', // Nom affiché sur le volet
    orderId: 'ORD-2026-9901',   // Référence de votre commande
    description: 'Billet Dakar - Saint-Louis'
  }, {
    onIdentical: async (message) => {
      // Affiché si un paiement similaire a été initié récemment
      const res = await wx.showModal({
        title: 'Transaction existante',
        content: message || 'Un paiement similaire a été initié. Continuer ?',
        confirmText: 'Payer quand même'
      });
      return res.confirm; // true relance avec caction: '1', false déclenche DECLINED
    }
  });

  // ✅ Paiement réussi
  console.log('Succès, txnid :', txnid);

} catch (err) {
  if (err.uncertain) {
    // ⚠️ CRITIQUE : L'argent a pu quitter le compte (Timeout ou erreur réseau)
    // NE JAMAIS redemander de payer immédiatement ! Vérifier d'abord auprès du backend.
    await verifierStatutBackend('ORD-2026-9901');
  } else if (err.code === miniSDK.ERROR_CODES.CANCELLED) {
    wx.showToast({ title: 'Paiement annulé', icon: 'none' });
  } else {
    wx.showToast({ title: err.message, icon: 'none' });
  }
}
```

#### Table des Codes d'Erreur `HostError`

| Code | Signification | `err.uncertain` | Action requise |
|---|---|---|---|
| `UNAVAILABLE` | Aucun conteneur hôte présent | `false` | Afficher l'écran "À ouvrir dans Max It" |
| `CANCELLED` | L'utilisateur a fermé le volet | `false` | Ne rien faire ou proposer un autre moyen |
| `REFUSED` | Solde insuffisant, code secret faux | `false` | Afficher `err.message` (français clair) |
| `DECLINED` | Refus de payer le doublon | `false` | Transaction abandonnée |
| `TIMEOUT` | Pas de réponse de l'hôte dans le délai | **`true`** | **Vérifier le statut (ne pas refaire payer)** |
| `HOST_ERROR` | Erreur indéterminée de l'hôte | **`true`** | **Vérifier le statut (ne pas refaire payer)** |

---

### 4. 🛡️ `miniSDK.screen.protect(true / false)` — Protection Anti-Capture
Pour sécuriser un billet de bus, un pass QR code ou un code temporaire contre les captures d'écran et enregistrements vidéo :

```javascript
Page({
  async onShow() {
    // 🔒 Verrouille les screenshots quand la vue apparaît
    await miniSDK.screen.protect(true);
  },

  async onHide() {
    // ⚠️ OBLIGATOIRE : Déverrouiller en quittant la vue !
    // Sinon tout le reste de l'application Max It reste masqué
    await miniSDK.screen.protect(false);
  },

  async onUnload() {
    await miniSDK.screen.protect(false);
  }
});
```

---

### 5. 📷 `miniSDK.scan({ cameraOnly: true })` — Scanner QR Code Sécurisé
Ouvre la caméra en interdisant le choix d'une photo depuis l'album (pour empêcher l'injection de captures d'écran frauduleuses de faux billets) :

```javascript
const { code, albumAllowed } = await miniSDK.scan({ cameraOnly: true });
console.log('QR Code scanné :', code);
```

---

### 6. 🔗 `miniSDK.deeplink({ launch: options })` — Deep Linking Sans Boucle
Décode les paramètres complexes (`extendData`, `referrerInfo.extraData`, `??param=value`) et empêche la ré-exécution intempestive à chaque `onShow` :

```javascript
Page({
  async onShow() {
    const params = await miniSDK.deeplink({ launch: wx.getEnterOptionsSync() });
    if (params?.bookingRef) {
      this.afficherBillet(params.bookingRef);
    }
  }
});
```

---

### 7. 📇 `miniSDK.contacts()` — Carnet de Contacts Normalisé
Récupère les contacts du répertoire téléphonique dans une structure unique et propre, avec numéros nettoyés :

```javascript
const contacts = await miniSDK.contacts();
// Résultat : [{ name: 'Mamadou Diallo', msisdn: ['771234567'] }, ...]
```

---

## 🧪 Simulation Complète dans WeChat DevTools

Dans WeChat DevTools, `wx.invokeNativePlugin` n'existe pas. Le mode `simulate: true` permet de tout tester sans téléphone :

```javascript
// Activer un test de doublon de transaction dans DevTools :
miniSDK.configure({
  simulate: true,
  fixtures: {
    identicalOnce: true // La prochaine tentative de paiement lèvera le prompt doublon
  }
});
```

---

## 🧩 Helpers Pratiques (`miniSDK.helpers`)

* `miniSDK.helpers.normaliseMsisdn(raw)` : Transforme `"+221 77 123.45.67"` en `"771234567"`.
* `miniSDK.helpers.isSenegalMobile(digits)` : Valide un numéro mobile sénégalais à 9 chiffres.
* `miniSDK.helpers.maskParams(params)` : Masque les numéros de téléphone pour les logs sécurisés.

