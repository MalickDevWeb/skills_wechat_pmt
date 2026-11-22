// #!/usr/bin/env node

/**
 * 🧪 UNIVERSAL TEST HARNESS — WECHAT MINI-PROGRAM (PMT / TCMPP)
 * Banc d'essai headless ultra-rapide en mémoire vive pour tester :
 * 1. Les Pages WeChat (cycles de vie, query params, scroll, uiState)
 * 2. Les Composants WeChat (properties, observers, lifetimes, triggerEvent)
 * 3. Les Bouts de Code & Snippets (mappers json-sculpt, calculs financiers, verrous atomiques)
 *
 * Usage CLI :
 *   node scripts/test-page-harness.js
 *
 * Usage Module (dans vos tests unitaires de projet) :
 *   const { createComponentHarness, createPageHarness, testSnippet } = require('./test-page-harness');
 */

const path = require('path');

// =============================================================================
// 1. ÉMULATEUR DE L'ENVIRONNEMENT GLOBAL WECHAT (MOCK ENGINE CENTRALISÉ)
// =============================================================================
const storageMock = {};
let wxHistory = [];
let lastToast = null;
let lastModal = null;
let lastActionSheet = null;

function resetWxMock() {
  for (const k of Object.keys(storageMock)) delete storageMock[k];
  wxHistory = [];
  lastToast = null;
  lastModal = null;
  lastActionSheet = null;
}

global.wx = {
  get history() { return wxHistory; },
  get lastToast() { return lastToast; },
  get lastModal() { return lastModal; },
  get lastActionSheet() { return lastActionSheet; },

  showToast: (opts) => {
    lastToast = opts;
    if (opts && typeof opts.success === 'function') opts.success();
  },
  hideToast: () => { lastToast = null; },

  showModal: (opts) => {
    lastModal = opts;
    if (opts && typeof opts.success === 'function') opts.success({ confirm: true, cancel: false });
  },

  showActionSheet: (opts) => {
    lastActionSheet = opts;
    if (opts && typeof opts.success === 'function') opts.success({ tapIndex: 0 });
  },

  showLoading: (opts) => {},
  hideLoading: () => {},

  navigateTo: (opts) => {
    wxHistory.push({ type: 'navigateTo', ...opts });
    if (opts && typeof opts.success === 'function') opts.success();
  },
  redirectTo: (opts) => {
    wxHistory.push({ type: 'redirectTo', ...opts });
    if (opts && typeof opts.success === 'function') opts.success();
  },
  switchTab: (opts) => {
    wxHistory.push({ type: 'switchTab', ...opts });
    if (opts && typeof opts.success === 'function') opts.success();
  },
  reLaunch: (opts) => {
    wxHistory.push({ type: 'reLaunch', ...opts });
    if (opts && typeof opts.success === 'function') opts.success();
  },
  navigateBack: (opts) => {
    wxHistory.push({ type: 'navigateBack', ...opts });
    if (opts && typeof opts.success === 'function') opts.success();
  },

  vibrateShort: (opts) => {},
  getStorageSync: (key) => storageMock[key] || '',
  setStorageSync: (key, val) => { storageMock[key] = val; },
  removeStorageSync: (key) => { delete storageMock[key]; },

  makePhoneCall: (opts) => {
    if (opts && typeof opts.success === 'function') opts.success();
  },
  setClipboardData: (opts) => {
    if (opts && typeof opts.success === 'function') opts.success();
  }
};

let pageStack = [];
global.getCurrentPages = () => pageStack;
global.getApp = () => ({
  globalData: {
    navHistory: []
  }
});

/**
 * Applique une fusion setData supportant les chemins avec points ('user.name')
 */
function applySetData(target, partial) {
  Object.keys(partial).forEach((key) => {
    if (key.includes('.')) {
      const parts = key.split('.');
      let curr = target;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!curr[parts[i]]) curr[parts[i]] = {};
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = partial[key];
    } else {
      target[key] = partial[key];
    }
  });
}

// =============================================================================
// 2. RUNNER DE PAGES WECHAT (createPageHarness)
// =============================================================================

/**
 * Crée un harnais de test pour une Page WeChat
 * @param {Object} pageDefinition - L'objet passé à Page({...})
 * @param {Object} [options]
 * @param {Object} [options.initialData] - Données initiales personnalisées
 * @param {string} [options.route] - Chemin de la route
 */
function createPageHarness(pageDefinition, { initialData = {}, route = 'pages/index/index' } = {}) {
  const mergedData = {
    ...(pageDefinition.data || {}),
    ...initialData
  };

  const instance = {
    route,
    options: {},
    ...pageDefinition,
    data: JSON.parse(JSON.stringify(mergedData)),

    setData(partial, callback) {
      applySetData(this.data, partial);
      if (typeof callback === 'function') callback();
    },

    async triggerLoad(options = {}) {
      this.options = options;
      pageStack.push(this);
      if (typeof this.onLoad === 'function') {
        await this.onLoad(options);
      }
    },

    async triggerShow() {
      if (typeof this.onShow === 'function') await this.onShow();
    },

    async triggerReady() {
      if (typeof this.onReady === 'function') await this.onReady();
    },

    async triggerPullDownRefresh() {
      if (typeof this.onPullDownRefresh === 'function') await this.onPullDownRefresh();
    },

    async triggerReachBottom() {
      if (typeof this.onReachBottom === 'function') await this.onReachBottom();
    },

    async triggerUnload() {
      if (typeof this.onUnload === 'function') await this.onUnload();
      const idx = pageStack.indexOf(this);
      if (idx !== -1) pageStack.splice(idx, 1);
    },

    async callMethod(methodName, ...args) {
      if (typeof this[methodName] !== 'function') {
        throw new Error(`[PageHarness] Méthode '${methodName}' introuvable sur la page.`);
      }
      return this[methodName].apply(this, args);
    }
  };

  return instance;
}

// =============================================================================
// 3. RUNNER DE COMPOSANTS WECHAT (createComponentHarness)
// =============================================================================

/**
 * Crée un harnais de test pour un Composant WeChat (Properties, Observers, Lifetimes, triggerEvent)
 * @param {Object} componentDefinition - L'objet passé à Component({...})
 * @param {Object} [options]
 * @param {Object} [options.properties] - Valeurs de propriétés injectées par le parent
 * @param {Object} [options.initialData] - Données d'état interne
 */
function createComponentHarness(componentDefinition, { properties: propOverrides = {}, initialData = {} } = {}) {
  const props = {};
  const propConfig = componentDefinition.properties || {};

  Object.keys(propConfig).forEach((key) => {
    const p = propConfig[key];
    if (p && typeof p === 'object' && p.value !== undefined) {
      props[key] = p.value;
    } else {
      props[key] = undefined;
    }
  });
  Object.assign(props, propOverrides);

  const mergedData = {
    ...props,
    ...(componentDefinition.data || {}),
    ...initialData
  };

  const listeners = {};
  const emittedEvents = [];

  const instance = {
    properties: props,
    data: JSON.parse(JSON.stringify(mergedData)),
    emittedEvents,
    methods: componentDefinition.methods || {},

    _evalObservers(changedKeys) {
      const observers = componentDefinition.observers || {};
      Object.keys(observers).forEach((pattern) => {
        const fields = pattern.split(',').map((s) => s.trim());
        const hasChange = fields.some((f) => changedKeys.includes(f) || changedKeys.some(k => k.startsWith(f + '.')));
        if (hasChange) {
          const values = fields.map((f) => instance.data[f]);
          try {
            observers[pattern].apply(instance, values);
          } catch (err) {
            console.error(`[ComponentHarness] Erreur observer '${pattern}' :`, err);
          }
        }
      });
    },

    setData(partial, callback) {
      const changedKeys = Object.keys(partial);
      applySetData(this.data, partial);

      // Met à jour properties si une clé de propriété a changé
      changedKeys.forEach((k) => {
        if (k in this.properties) {
          this.properties[k] = this.data[k];
        }
      });

      // Exécute les observateurs correspondants
      this._evalObservers(changedKeys);
      if (typeof callback === 'function') callback();
    },

    setProperty(key, value) {
      this.properties[key] = value;
      this.setData({ [key]: value });
    },

    triggerEvent(name, detail = {}, options = {}) {
      const evt = { name, detail, options };
      emittedEvents.push(evt);
      if (Array.isArray(listeners[name])) {
        listeners[name].forEach((fn) => fn(detail, options));
      }
    },

    onEvent(name, handler) {
      if (!listeners[name]) listeners[name] = [];
      listeners[name].push(handler);
      return () => {
        listeners[name] = listeners[name].filter((h) => h !== handler);
      };
    },

    async triggerAttached() {
      const attached = (componentDefinition.lifetimes && componentDefinition.lifetimes.attached) || componentDefinition.attached;
      if (typeof attached === 'function') await attached.call(this);
    },

    async triggerDetached() {
      const detached = (componentDefinition.lifetimes && componentDefinition.lifetimes.detached) || componentDefinition.detached;
      if (typeof detached === 'function') await detached.call(this);
    },

    async callMethod(methodName, ...args) {
      const fn = (this.methods && this.methods[methodName]) || this[methodName];
      if (typeof fn !== 'function') {
        throw new Error(`[ComponentHarness] Méthode '${methodName}' introuvable sur le composant.`);
      }
      return fn.apply(this, args);
    }
  };

  // Liaison directe des méthodes au composant
  if (componentDefinition.methods) {
    Object.keys(componentDefinition.methods).forEach((m) => {
      instance[m] = componentDefinition.methods[m].bind(instance);
    });
  }

  return instance;
}

// =============================================================================
// 4. RUNNER DE BOUTS DE CODE & SNIPPETS (testSnippet)
// =============================================================================

/**
 * Exécute un test unitaire sur une fonction pure, un mapper ou un bout de code isolé
 * @param {string} description
 * @param {Function} testFn
 */
async function testSnippet(description, testFn) {
  const start = Date.now();
  try {
    await testFn();
    const duration = Date.now() - start;
    return { ok: true, description, duration };
  } catch (err) {
    return { ok: false, description, error: err };
  }
}

// Exportation en tant que module pour réutilisation dans les projets
module.exports = {
  createPageHarness,
  createComponentHarness,
  testSnippet,
  resetWxMock,
  getWxMock: () => global.wx
};

// =============================================================================
// 5. SUITE D'AUTO-TESTS & VALIDATION DU HARNAIS (Exécution CLI)
// =============================================================================
if (require.main === module) {
  console.log('====================================================');
  console.log('🧪 TEST HARNESS UNIVERSEL — PAGES, COMPOSANTS & SNIPPETS');
  console.log('====================================================\n');

  let testsPassed = 0;

  // --- NIVEAU 1 : TESTS DE PAGES ---
  console.log('🔍 [Pages] Test 1 : Machine à états en cycle nominal (loading -> success)...');
  const nominalPageDef = {
    data: { uiState: 'loading', items: [] },
    async onLoad() {
      this.setData({ uiState: 'loading' });
      await new Promise((r) => setTimeout(r, 10));
      this.setData({
        uiState: 'success',
        items: [{ id: 1, name: 'Billet Dakar-Thiès' }]
      });
    }
  };
  const p1 = createPageHarness(nominalPageDef);
  p1.triggerLoad().then(() => {
    if (p1.data.uiState === 'success' && p1.data.items.length === 1) {
      console.log('  ✅ Test 1 validé : Transition nominale de page réussie.\n');
      testsPassed++;
      runPageTest2();
    } else {
      console.error('  ❌ Échec Test 1');
      process.exit(1);
    }
  });

  function runPageTest2() {
    console.log('🔍 [Pages] Test 2 : Pagination, Query Params et Nettoyage onUnload...');
    let timerCleared = false;
    const complexPageDef = {
      data: { page: 1, items: ['Item 1'], hasMore: true },
      timerId: 999,
      async onLoad(options) {
        this.setData({ category: options.category || 'all' });
      },
      async onReachBottom() {
        if (!this.data.hasMore) return;
        const nextPage = this.data.page + 1;
        this.setData({
          page: nextPage,
          items: [...this.data.items, `Item ${nextPage}`]
        });
      },
      onUnload() {
        if (this.timerId) {
          timerCleared = true;
          this.timerId = null;
        }
      }
    };

    const p2 = createPageHarness(complexPageDef);
    p2.triggerLoad({ category: 'appartements' }).then(async () => {
      await p2.triggerReachBottom();
      await p2.triggerUnload();

      if (p2.data.category === 'appartements' && p2.data.page === 2 && p2.data.items.length === 2 && timerCleared) {
        console.log('  ✅ Test 2 validé : Query params, scroll infini et onUnload conformes.\n');
        testsPassed++;
        runComponentTests();
      } else {
        console.error('  ❌ Échec Test 2');
        process.exit(1);
      }
    });
  }

  // --- NIVEAU 2 : TESTS DE COMPOSANTS ---
  function runComponentTests() {
    console.log('🔍 [Composants] Test 3 : Properties, Observers & Événements triggerEvent...');

    let observerFired = false;
    let observerNewVal = '';

    const badgeComponentDef = {
      properties: {
        amount: { type: Number, value: 0 },
        currency: { type: String, value: 'FCFA' }
      },
      data: {
        formattedText: ''
      },
      observers: {
        'amount, currency': function (amount, currency) {
          observerFired = true;
          observerNewVal = `${amount} ${currency}`;
          this.setData({ formattedText: observerNewVal });
        }
      },
      methods: {
        handleTap() {
          this.triggerEvent('select', { selectedAmount: this.properties.amount });
        }
      }
    };

    const comp = createComponentHarness(badgeComponentDef, {
      properties: { amount: 50000, currency: 'FCFA' }
    });

    let emittedDetail = null;
    comp.onEvent('select', (detail) => {
      emittedDetail = detail;
    });

    // 1. Initialisation propriété et déclenchement observer
    comp.setProperty('amount', 75000);

    // 2. Clic émettant un événement
    comp.methods.handleTap.call(comp);

    if (observerFired && comp.data.formattedText === '75000 FCFA' && emittedDetail && emittedDetail.selectedAmount === 75000) {
      console.log('  ✅ Test 3 validé : Properties, Observers et triggerEvent parfaitement émulés.\n');
      testsPassed++;
      runSnippetTests();
    } else {
      console.error('  ❌ Échec Test 3 Composant', { observerFired, formatted: comp.data.formattedText, emittedDetail });
      process.exit(1);
    }
  }

  // --- NIVEAU 3 : TESTS DE BOUTS DE CODE & HELPERS ---
  async function runSnippetTests() {
    console.log('🔍 [Snippets] Test 4 : Mapper json-sculpt, Calculs et Verrous Atomiques...');

    // Snippet 1 : Fonction de mapping de données (json-sculpt style)
    const mapperTest = await testSnippet('Transformation données brutes API vers Modèle WXML', () => {
      const rawApiLogement = {
        id: 'L-101',
        monthly_price: 180000,
        address: 'Almadies, Dakar',
        is_verified: 1
      };

      const sculpt = (raw) => ({
        id: String(raw.id),
        priceFormatted: `${Number(raw.monthly_price).toLocaleString('fr-FR')} FCFA`,
        location: raw.address,
        isVerified: Boolean(raw.is_verified)
      });

      const card = sculpt(rawApiLogement);
      if (card.priceFormatted.replace(/\s/g, ' ') !== '180 000 FCFA' || !card.isVerified) {
        throw new Error('Sculpt mapper invalide');
      }
    });

    // Snippet 2 : Verrou atomique anti-double paiement
    const lockTest = await testSnippet('Bouclier anti-double clic Orange Money (_isPaying)', async () => {
      let executionCount = 0;
      const paymentEngine = {
        _isPaying: false,
        async pay() {
          if (this._isPaying) return false;
          this._isPaying = true;
          executionCount++;
          await new Promise((r) => setTimeout(r, 15));
          this._isPaying = false;
          return true;
        }
      };

      // 5 clics simultanés
      const results = await Promise.all([
        paymentEngine.pay(),
        paymentEngine.pay(),
        paymentEngine.pay(),
        paymentEngine.pay(),
        paymentEngine.pay()
      ]);

      if (executionCount !== 1 || results.filter(Boolean).length !== 1) {
        throw new Error(`Concurrence échouée, exécutions : ${executionCount}`);
      }
    });

    if (mapperTest.ok && lockTest.ok) {
      console.log('  ✅ Test 4 validé : Mappers de données et verrou anti-double débit validés.\n');
      testsPassed++;
      runWhatsAppAndGuardianTests();
    } else {
      console.error('  ❌ Échec Test 4 Snippets', { mapperTest, lockTest });
      process.exit(1);
    }
  }

  // --- NIVEAU 4 : PONT WHATSAPP ET SÉCURITÉ GARDIEN ---
  async function runWhatsAppAndGuardianTests() {
    console.log('🔍 [Intégration] Test 5 : Pont WhatsApp & Helpers de Page Kalidou...');
    const { pathToFileURL } = require('url');
    const bridgePath = path.join(__dirname, '..', 'playground', 'utils', 'helpers', 'whatsappBridge.js');
    const bridge = await import(pathToFileURL(bridgePath).href);

    const url = bridge.buildWhatsAppUrl({ phone: '+221 77 000 00 00', message: 'Assistance' });
    if (url !== 'https://wa.me/221770000000?text=Assistance') {
      console.error('  ❌ Échec URL WhatsApp');
      process.exit(1);
    }
    console.log('  ✅ Test 5 validé : Pont Hybride WhatsApp opérationnel.\n');
    testsPassed++;

    console.log('🔍 [Sécurité] Test 6 : Mode Gardien & Vérification Cryptographique SHA-256...');
    const guardianDoctor = require(path.join(__dirname, 'guardian-doctor.js'));
    const testPin = '1732';
    if (!guardianDoctor.verifyMasterPin(testPin)) {
      console.error('  ❌ Échec Test 6 : Code maître non authentifié');
      process.exit(1);
    }

    const playgroundDir = path.join(__dirname, '..', 'playground');
    const audit = guardianDoctor.inspectProjectSanctuaries(playgroundDir);
    if (audit.violations.some((v) => v.sanctuary.includes('iPhone') && v.file.includes('whatsapp-modal'))) {
      console.error('  ❌ Échec Test 6 : Faux positif sanctuaires');
      process.exit(1);
    }
    console.log('  ✅ Test 6 validé : Mode Gardien, intégrité SHA-256 et sanctuaires confirmés.\n');
    testsPassed++;

    finishAllTests();
  }

  function finishAllTests() {
    console.log('====================================================');
    console.log(`✨ SUCCÈS : ${testsPassed}/6 SUITES DE TESTS (PAGES, COMPOSANTS, SNIPPETS & GARDIEN) VALIDÉES !`);
    console.log('====================================================\n');
    process.exit(0);
  }
}
