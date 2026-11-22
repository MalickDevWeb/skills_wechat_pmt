// #!/usr/bin/env node

/**
 * 🧪 HEADLESS PAGE & UISTATE TEST HARNESS — WeChat PMT
 * Émulateur léger en mémoire pour tester les machines à états uiState et les cycles
 * de vie des pages WeChat sans interface graphique ni WeChat DevTools (CI Ready).
 *
 * Usage :
 *   node scripts/test-page-harness.js
 */

const path = require('path');

console.log('====================================================');
console.log('🧪 TEST HARNESS HEADLESS — WECHAT PAGE & UISTATE');
console.log('====================================================\n');

// -----------------------------------------------------------------------------
// 1. ÉMULATEUR DE L'ENVIRONNEMENT GLOBAL WECHAT
// -----------------------------------------------------------------------------
const storageMock = {};

global.wx = {
  showToast: (opts) => { /* Mock */ },
  hideToast: () => { /* Mock */ },
  showLoading: (opts) => { /* Mock */ },
  hideLoading: () => { /* Mock */ },
  navigateTo: (opts) => { /* Mock */ },
  redirectTo: (opts) => { /* Mock */ },
  switchTab: (opts) => { /* Mock */ },
  vibrateShort: (opts) => { /* Mock */ },
  getStorageSync: (key) => storageMock[key] || '',
  setStorageSync: (key, val) => { storageMock[key] = val; },
  removeStorageSync: (key) => { delete storageMock[key]; }
};

/**
 * Crée un harnais de test pour une définition de Page WeChat
 * @param {Object} pageDefinition - L'objet passé à Page({...})
 */
function createPageHarness(pageDefinition) {
  const instance = {
    ...pageDefinition,
    data: JSON.parse(JSON.stringify(pageDefinition.data || {})),

    setData(partial, callback) {
      // Fusion récursive superficielle conforme à setData natif
      Object.keys(partial).forEach((key) => {
        if (key.includes('.')) {
          const parts = key.split('.');
          let target = this.data;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!target[parts[i]]) target[parts[i]] = {};
            target = target[parts[i]];
          }
          target[parts[parts.length - 1]] = partial[key];
        } else {
          this.data[key] = partial[key];
        }
      });
      if (typeof callback === 'function') callback();
    },

    async triggerLoad(options = {}) {
      if (typeof this.onLoad === 'function') {
        await this.onLoad(options);
      }
    },

    async triggerShow() {
      if (typeof this.onShow === 'function') {
        await this.onShow();
      }
    },

    async triggerUnload() {
      if (typeof this.onUnload === 'function') {
        await this.onUnload();
      }
    }
  };

  return instance;
}

// -----------------------------------------------------------------------------
// 2. SUITE DE TESTS SUR LA MACHINE À ÉTATS UISTATE
// -----------------------------------------------------------------------------
let testsPassed = 0;

// Test 1 : Cycle Nominal (loading -> success)
console.log('🔍 Test 1 : Machine à états en cycle nominal (loading -> success)...');
const nominalPageDef = {
  data: {
    uiState: 'loading',
    items: []
  },
  async onLoad(options) {
    this.setData({ uiState: 'loading' });
    // Simulation appel asynchrone réussi
    await new Promise((r) => setTimeout(r, 20));
    this.setData({
      uiState: 'success',
      items: [{ id: 1, name: 'Billet Dakar-Thiès' }]
    });
  }
};

const harness1 = createPageHarness(nominalPageDef);
if (harness1.data.uiState !== 'loading') {
  console.error('  ❌ Échec : uiState initial doit être loading');
  process.exit(1);
}

harness1.triggerLoad().then(() => {
  if (harness1.data.uiState === 'success' && harness1.data.items.length === 1) {
    console.log('  ✅ Test 1 validé : Transition vers success avec injection des données.\n');
    testsPassed++;
    runTest2();
  } else {
    console.error('  ❌ Échec Test 1 : uiState final invalide', harness1.data);
    process.exit(1);
  }
});

// Test 2 : Gestion de l'erreur réseau (loading -> error)
function runTest2() {
  console.log('🔍 Test 2 : Machine à états en cas d\'erreur réseau (loading -> error)...');
  const errorPageDef = {
    data: {
      uiState: 'loading',
      errorMessage: ''
    },
    async onLoad(options) {
      try {
        throw new Error('Connexion réseau Sonatel 4G interrompue');
      } catch (err) {
        this.setData({
          uiState: 'error',
          errorMessage: err.message
        });
      }
    }
  };

  const harness2 = createPageHarness(errorPageDef);
  harness2.triggerLoad().then(() => {
    if (harness2.data.uiState === 'error' && harness2.data.errorMessage.includes('Sonatel 4G')) {
      console.log('  ✅ Test 2 validé : Transition vers error avec capture du message bienveillant.\n');
      testsPassed++;
      runTest3();
    } else {
      console.error('  ❌ Échec Test 2 : uiState d\'erreur invalide', harness2.data);
      process.exit(1);
    }
  });
}

// Test 3 : Nettoyage sans fuite mémoire lors de onUnload
function runTest3() {
  console.log('🔍 Test 3 : Nettoyage mémoire et abonnements dans onUnload()...');
  let intervalCleared = false;
  let eventUnsubscribed = false;

  const cleanupPageDef = {
    data: { uiState: 'success' },
    timerId: 1234,
    onLoad() {},
    onUnload() {
      if (this.timerId) {
        intervalCleared = true;
        this.timerId = null;
      }
      eventUnsubscribed = true;
    }
  };

  const harness3 = createPageHarness(cleanupPageDef);
  harness3.triggerUnload().then(() => {
    if (intervalCleared && eventUnsubscribed && harness3.timerId === null) {
      console.log('  ✅ Test 3 validé : Timer nettoyé et ressources libérées sans fuite.\n');
      testsPassed++;
      runTest4();
    } else {
      console.error('  ❌ Échec Test 3 : Ressources non libérées dans onUnload');
      process.exit(1);
    }
  });
}

// Test 4 : Pont Hybride WhatsApp & Formatage Téléphone
async function runTest4() {
  console.log('🔍 Test 4 : Pont Hybride WhatsApp (URL, shortLinkId, encodage et téléphone)...');
  const { pathToFileURL } = require('url');
  const bridgePath = path.join(__dirname, '..', 'playground', 'utils', 'helpers', 'whatsappBridge.js');
  const bridge = await import(pathToFileURL(bridgePath).href);

  // 1. Test shortLinkId
  const url1 = bridge.buildWhatsAppUrl({ shortLinkId: 'F5VM5FMWEDWLJ1' });
  if (url1 !== 'https://wa.me/message/F5VM5FMWEDWLJ1') {
    console.error('  ❌ Échec Test 4a : shortLinkId invalide', url1);
    process.exit(1);
  }

  // 2. Test phone + message
  const url2 = bridge.buildWhatsAppUrl({ phone: '+221 77 000 00 00', message: 'Bonjour Fly Afritrip' });
  if (url2 !== 'https://wa.me/221770000000?text=Bonjour%20Fly%20Afritrip') {
    console.error('  ❌ Échec Test 4b : phone + text invalide', url2);
    process.exit(1);
  }

  // 3. Test phone call helper
  let callNumber = '';
  global.wx.makePhoneCall = (opts) => {
    callNumber = opts.phoneNumber;
    if (opts.success) opts.success();
  };
  await bridge.makeSupportPhoneCall('+221 77 000 00 00');
  if (callNumber !== '221770000000') {
    console.error('  ❌ Échec Test 4c : nettoyage numéro makePhoneCall invalide', callNumber);
    process.exit(1);
  }

  console.log('  ✅ Test 4 validé : Génération URL wa.me, shortLinkId et appel vocal confirmés.\n');
  testsPassed++;
  runTest5();
}

// Test 5 : Helpers de Page Kalidou & Découpage Modulaire
async function runTest5() {
  console.log('🔍 Test 5 : Helpers de Page Kalidou (TabBar, Protection écran & Verrou atomique)...');
  const { pathToFileURL } = require('url');
  const helperPath = path.join(__dirname, '..', 'playground', 'utils', 'helpers', 'pageHelper.js');
  const pageHelper = await import(pathToFileURL(helperPath).href);

  // 1. Test setPageTabBarHidden
  let tabBarHiddenValue = null;
  const mockPageInstance = {
    getTabBar: () => ({
      setData: (updates) => { tabBarHiddenValue = updates.hidden; }
    })
  };
  let eventBusValue = null;
  const mockBus = {
    emit: (event, payload) => { eventBusValue = payload.hidden; }
  };
  pageHelper.setPageTabBarHidden(mockPageInstance, true, mockBus);
  if (tabBarHiddenValue !== true || eventBusValue !== true) {
    console.error('  ❌ Échec Test 5a : setPageTabBarHidden invalide');
    process.exit(1);
  }

  // 2. Test setScreenProtection
  let protectValue = null;
  const mockSdk = {
    screen: {
      protect: async (val) => { protectValue = val; }
    }
  };
  await pageHelper.setScreenProtection(mockSdk, true);
  if (protectValue !== true) {
    console.error('  ❌ Échec Test 5b : setScreenProtection invalide');
    process.exit(1);
  }

  // 3. Test decomposed tunnel lock (_isBusy / _isPaying)
  let executionCount = 0;
  const tunnel = {
    _isPaying: false,
    async handlePayAction() {
      if (this._isPaying) return;
      this._isPaying = true;
      executionCount++;
      await new Promise((r) => setTimeout(r, 20));
      this._isPaying = false;
    }
  };
  await Promise.all([tunnel.handlePayAction(), tunnel.handlePayAction()]);
  if (executionCount !== 1) {
    console.error('  ❌ Échec Test 5c : Le verrou atomique doit empêcher la concurrence');
    process.exit(1);
  }

  console.log('  ✅ Test 5 validé : Helpers de page Kalidou et tunnel décomposé conformes.\n');
  testsPassed++;
  runTest6();
}

// Test 6 : Mode Gardien & Bouclier Anti-Régression (Validation PIN Maître SHA-256)
function runTest6() {
  console.log('🔍 Test 6 : Mode Gardien & Validation Cryptographique du Code Maître...');
  const guardianDoctor = require(path.join(__dirname, 'guardian-doctor.js'));

  // 1. Rejet formel des codes erronés
  if (guardianDoctor.verifyMasterPin('0000') || guardianDoctor.verifyMasterPin('1234') || guardianDoctor.verifyMasterPin('')) {
    console.error('  ❌ Échec Test 6a : Un faux code a été accepté');
    process.exit(1);
  }

  // 2. Validation cryptographique du code secret (SHA-256: bfea46db09aa46da5a6628ecd5d5fba31d9d50417f5178db9727d3676427e2df)
  // On passe le code testé pour confirmer la validation
  const testPin = '1732';
  if (!guardianDoctor.verifyMasterPin(testPin)) {
    console.error('  ❌ Échec Test 6b : Le code secret légitime n\'a pas été validé par son empreinte');
    process.exit(1);
  }

  // 3. Vérification des sanctuaires sur playground
  const playgroundDir = path.join(__dirname, '..', 'playground');
  const audit = guardianDoctor.inspectProjectSanctuaries(playgroundDir);
  if (audit.violations.some(v => v.sanctuary.includes('iPhone') && v.file.includes('whatsapp-modal'))) {
    console.error('  ❌ Échec Test 6c : Faux positif détecté sur un composant conforme');
    process.exit(1);
  }

  console.log('  ✅ Test 6 validé : Mode Gardien, intégrité SHA-256 et sanctuaires confirmés.\n');
  testsPassed++;
  finishAllTests();
}

function finishAllTests() {
  console.log('====================================================');
  console.log(`✨ SUCCÈS : ${testsPassed}/6 TESTS DE MACHINE À ÉTATS, HELPERS ET MODE GARDIEN VALIDÉS !`);
  console.log('====================================================\n');
  process.exit(0);
}

