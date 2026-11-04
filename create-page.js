#!/usr/bin/env node

/**
 * ⚡ CREATE-PAGE — WeChat PMT
 * Générateur de page conforme aux standards de production (Règle des 4 fichiers).
 * 
 * Usage :
 *   node create-page.js <chemin-page> [--with-api]
 * 
 * Exemple :
 *   node create-page.js pages/mon-profil
 *   node create-page.js pages/paiement-facture --with-api
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const pageTarget = args.find(a => !a.startsWith('--'));
const withApi = args.includes('--with-api');

if (!pageTarget) {
  console.log('Usage: node create-page.js <dossier-cible> [--with-api]');
  console.log('Exemple: node create-page.js pages/historique-commandes');
  process.exit(1);
}

const targetDir = path.resolve(process.cwd(), pageTarget);
const pageName = path.basename(targetDir);

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// -----------------------------------------------------------------------------
// 1. INDEX.JSON
// -----------------------------------------------------------------------------
const jsonContent = {
  navigationBarTitleText: pageName,
  navigationStyle: "custom",
  usingComponents: {
    "app-nav-bar": "/components/ui/nav-bar/index",
    "app-layout": "/components/custom/ui/layout/index",
    "app-button": "/components/ui/button/index",
    "app-typography": "/components/ui/typography/index"
  }
};

// -----------------------------------------------------------------------------
// 2. INDEX.JS
// -----------------------------------------------------------------------------
const jsContent = `// ============================================================================
// ${pageName.toUpperCase()} — Contrôleur de Page WeChat PMT
// Standard : State Machine (uiState), Safe Area, Safe Nav
// ============================================================================

import { navigateWithLock } from '../../utils/helpers/navigation.js';
${withApi ? "import { backendAPI } from '../../utils/apis/index.js';\n" : ""}
Page({
  data: {
    uiState: 'loading', // 'loading' | 'content' | 'empty' | 'error'
    errorMessage: '',
    items: [],
  },

  async onLoad(options = {}) {
    // 1. Guard de paramètre (si ID requis)
    // if (!options.id) {
    //   wx.showToast({ title: 'Paramètre manquant', icon: 'none' });
    //   return wx.navigateBack();
    // }

    await this.loadData();
  },

  async loadData() {
    this.setData({ uiState: 'loading', errorMessage: '' });
    try {
      ${withApi ? `// Appel API sécurisé
      // const res = await backendAPI.getItems();
      // this.setData({ items: res, uiState: res.length ? 'content' : 'empty' });` : `// Simulation de chargement (Mode UI-MOCK)
      setTimeout(() => {
        this.setData({
          items: [{ id: 1, title: 'Élément modèle' }],
          uiState: 'content',
        });
      }, 600);`}
    } catch (error) {
      this.setData({
        uiState: 'error',
        errorMessage: error.message || 'Impossible de charger la page.',
      });
    }
  },

  handleAction() {
    navigateWithLock(this, () => {
      console.log('Action déclenchée avec verrouillage anti-double tap');
    }, '_actionLocked');
  },

  retry() {
    this.loadData();
  },
});
`;

// -----------------------------------------------------------------------------
// 3. INDEX.WXML
// -----------------------------------------------------------------------------
const wxmlContent = `<wxs src="../../utils/wxs/filters.wxs" module="f" />

<app-layout
  title="${pageName}"
  showBack="{{ true }}"
  transparent="{{ true }}"
  showNavBorder="{{ false }}"
>
  <scroll-view
    class="page-scroll"
    scroll-y="{{ true }}"
    enhanced="{{ true }}"
    show-scrollbar="{{ false }}"
  >
    <view class="page-container page-enter">
      <!-- État 1 : Chargement (Skeleton Shimmer) -->
      <view wx:if="{{ uiState === 'loading' }}" class="skeleton-container">
        <view class="skeleton-block shimmer"></view>
        <view class="skeleton-card shimmer"></view>
      </view>

      <!-- État 2 : Contenu principal -->
      <view wx:elif="{{ uiState === 'content' }}" class="content-container">
        <app-typography size="20" weight="bold" color="#111827">
          Bienvenue sur ${pageName}
        </app-typography>

        <view
          class="interactive-card"
          hover-class="btn--pressed"
          hover-start-time="20"
          hover-stay-time="100"
          bindtap="handleAction"
        >
          <text>Carte avec retour tactile Apple Press</text>
        </view>
      </view>

      <!-- État 3 : Liste vide -->
      <view wx:elif="{{ uiState === 'empty' }}" class="state-view">
        <app-typography size="16" color="#6B7280">Aucune donnée trouvée.</app-typography>
      </view>

      <!-- État 4 : Erreur avec bouton Réessayer -->
      <view wx:elif="{{ uiState === 'error' }}" class="state-view">
        <app-typography size="16" color="#DC2626">{{ errorMessage }}</app-typography>
        <app-button type="primary" buttonClass="mt-3" bind:onPress="retry">
          Réessayer
        </app-button>
      </view>
    </view>
  </scroll-view>
</app-layout>
`;

// -----------------------------------------------------------------------------
// 4. INDEX.WXSS
// -----------------------------------------------------------------------------
const wxssContent = `/* ==========================================================================
   ${pageName.toUpperCase()} — Styles Scoped
   Règles : BEM, Safe Areas, Feedback Tactile, Zéro 100vh rigide
   ========================================================================== */

.page-scroll {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
}

.page-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 32rpx;
  /* Safe Area basse obligatoire pour iPhone avec Home Indicator */
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom, 40rpx));
  box-sizing: border-box;
}

/* Feedback tactile Apple Press */
.btn--pressed {
  transform: scale(0.96);
  opacity: 0.85;
  transition: transform 100ms ease, opacity 100ms ease;
}

/* Carte interactive */
.interactive-card {
  margin-top: 32rpx;
  padding: 32rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #E5E7EB;
}

/* Skeletons shimmer */
.skeleton-block {
  width: 60%;
  height: 48rpx;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
}

.skeleton-card {
  width: 100%;
  height: 200rpx;
  border-radius: 24rpx;
}

.shimmer {
  background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
  background-size: 200% 100%;
  animation: shimmerWave 1.6s infinite ease-in-out;
}

@keyframes shimmerWave {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* État d'erreur / vide */
.state-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 32rpx;
  text-align: center;
}
`;

// Écriture stricte en UTF-8 sans BOM
const utf8NoBom = [jsonContent, jsContent, wxmlContent, wxssContent];
const fileNames = ['index.json', 'index.js', 'index.wxml', 'index.wxss'];

fileNames.forEach((name, i) => {
  const filePath = path.join(targetDir, name);
  const data = typeof utf8NoBom[i] === 'object' ? JSON.stringify(utf8NoBom[i], null, 2) : utf8NoBom[i];
  fs.writeFileSync(filePath, data, { encoding: 'utf8' });
  console.log(`  ✅ Créé : ${path.relative(process.cwd(), filePath)}`);
});

console.log(`\n🎉 Page [${pageName}] créée avec succès selon les standards PMT !`);
console.log(`👉 N'oubliez pas d'ajouter "${pageTarget}/index" dans app.json > pages.`);

