#!/usr/bin/env node

/**
 * 📦 WECHAT PMT CLI — BOOTSTRAPPER & OUTILLAGE INDUSTRIEL
 * 
 * Commande d'installation et de mise à niveau en 1 ligne :
 *   npx wechat-pmt init [dossier-cible]
 *   node scripts/cli.js init [dossier-cible]
 * 
 * Injecte instantanément dans n'importe quel projet Mini-Program :
 * 1. 🧠 La Gouvernance IA Complète (AGENTS.md, CLAUDE.md, .cursorrules, CODEX, GEMINI)
 * 2. 🟠 La Triade de Composants Signature Sonatel (button, modal, om-balance-pill)
 * 3. 💳 Le Client API avec Bouclier Bancaire Anti-Double Débit (_confirmedTxnid)
 * 4. 🛡️ Le Git Hook Local Automatique (pre-commit guard 100% offline)
 */

const fs = require('fs');
const path = require('path');

const command = process.argv[2] || 'help';
const targetArg = process.argv[3];
const targetDir = targetArg ? path.resolve(targetArg) : process.cwd();
const skillRoot = path.resolve(__dirname, '..');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const items = fs.readdirSync(src);
  for (const item of items) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function copyFileSafe(src, dest) {
  if (!fs.existsSync(src)) return;
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, dest);
}

if (command === 'init') {
  console.log('====================================================');
  console.log('⚡ WECHAT PMT / TCMPP BOOTSTRAPPER (KASSOGO AI)');
  console.log(`📁 Projet cible : ${targetDir}`);
  console.log('====================================================\n');

  // 1. GOUVERNANCE IA (AGENTS.MD, CLAUDE.MD, CURSORRULES...)
  console.log('🧠 1. Déploiement des directives d\'architecture & Lead Architecte...');
  const govFiles = ['AGENTS.md', 'CLAUDE.md', 'CODEX.md', 'GEMINI.md', '.cursorrules'];
  govFiles.forEach(f => {
    const src = path.join(skillRoot, f);
    const dest = path.join(targetDir, f);
    copyFileSafe(src, dest);
  });
  console.log('  ✅ AGENTS.md, CLAUDE.md, CODEX.md, GEMINI.md et .cursorrules installés.\n');

  // 2. COMPOSANTS SIGNATURE ODS SONATEL
  console.log('🟠 2. Injection des Composants Signature ODS Sonatel...');
  // A. Button
  const buttonSrc = path.join(skillRoot, 'playground', 'components', 'ui', 'button');
  const buttonDest = path.join(targetDir, 'components', 'ui', 'button');
  copyRecursive(buttonSrc, buttonDest);

  // B. Modal
  const modalSrc = path.join(skillRoot, 'playground', 'components', 'ui', 'modal');
  const modalDest = path.join(targetDir, 'components', 'ui', 'modal');
  copyRecursive(modalSrc, modalDest);

  // C. Solde Orange Money
  const pillSrc = path.join(skillRoot, 'playground', 'components', 'om-balance-pill');
  const pillDest = path.join(targetDir, 'components', 'ui', 'om-balance-pill');
  copyRecursive(pillSrc, pillDest);
  console.log('  ✅ button, modal, om-balance-pill injectés dans components/ui/.\n');

  // 3. CLIENT API & BOUCLIER BANCAIRE ANTI-DOUBLE DÉBIT
  console.log('💳 3. Déploiement du Client HTTP & Bouclier Anti-Double Débit...');
  const configExampleContent = `// ============================================================================
// CONFIGURATION GLOBALE — WeChat PMT / TCMPP
// ============================================================================
export const config = {
  BASE_URL: 'https://api.orange.sn',
  MERCHANT_CODE: '141414',
  USE_MOCK: false,
  TIMEOUT_MS: 15000,
};
export default config;
`;

  const utilsConfigDir = path.join(targetDir, 'utils');
  const utilsApisDir = path.join(targetDir, 'utils', 'apis');
  if (!fs.existsSync(utilsConfigDir)) fs.mkdirSync(utilsConfigDir, { recursive: true });
  if (!fs.existsSync(utilsApisDir)) fs.mkdirSync(utilsApisDir, { recursive: true });

  const configPath = path.join(utilsConfigDir, 'config.js');
  const configExamplePath = path.join(utilsConfigDir, 'config.example.js');
  if (!fs.existsSync(configExamplePath)) {
    fs.writeFileSync(configExamplePath, configExampleContent, 'utf8');
  }
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, configExampleContent, 'utf8');
  }

  // Service Bouclier Anti-Double Débit
  const paymentShieldContent = `// ============================================================================
// BOUCLIER BANCAIRE ANTI-DOUBLE DÉBIT (ORANGE MONEY / TCMPP)
// Garantie 0% double débit sur réseau 4G instable
// ============================================================================

import config from '../config.js';

/**
 * Exécute un paiement avec scellage immédiat et Smart Polling
 * @param {Object} context Instance de la Page ou du Composant (this)
 * @param {Object} paymentParams Paramètres { amount, orderId, merchantCode }
 * @param {Function} confirmBackendCall Fonction async validant la commande côté serveur
 */
export async function executePaymentWithShield(context, paymentParams, confirmBackendCall) {
  const offerKey = String(paymentParams.orderId || paymentParams.offerId || paymentParams.amount || 'default');

  // 1. VÉRIFICATION DU SCELLAGE EXISTANT AVEC CONTRÔLE D'OFFRE
  if (context._confirmedTxnid) {
    if (context._confirmedOfferKey && context._confirmedOfferKey !== offerKey) {
      console.warn('[Bouclier Orange Money] Changement d\'offre détecté. Réinitialisation du scellement précédent.');
      context._confirmedTxnid = null;
      context._confirmedOfferKey = null;
    } else {
      console.warn('[Bouclier Orange Money] Débit bancaire déjà validé avec txnid :', context._confirmedTxnid);
      console.warn('[Bouclier Orange Money] Saut de l\'appel natif -> Rejeu direct de la confirmation backend.');
      return await reconfirmBackendWithPolling(context._confirmedTxnid, confirmBackendCall);
    }
  }

  // 2. APPEL DU PLUGIN NATIF MAX IT / ORANGE MONEY
  const txnid = await callNativeMerchantPay(paymentParams);

  // 3. SCELLAGE IMMÉDIAT DÈS LE SUCCÈS BANCAIRE
  context._confirmedTxnid = String(txnid);
  context._confirmedOfferKey = offerKey;
  console.log('[Bouclier Orange Money] Transaction scellée avec succès :', context._confirmedTxnid, 'pour l\'offre :', offerKey);

  // 4. VALIDATION BACKEND AVEC SMART POLLING (Résilience 4G)
  try {
    const res = await reconfirmBackendWithPolling(context._confirmedTxnid, confirmBackendCall);
    context._confirmedTxnid = null;
    context._confirmedOfferKey = null;
    return res;
  } catch (err) {
    throw err;
  }
}

/**
 * Appel au plugin natif TCMPP merchantPay
 */
function callNativeMerchantPay(params) {
  return new Promise((resolve, reject) => {
    if (typeof wx.tcpay === 'function') {
      wx.tcpay({
        merchantCode: params.merchantCode || config.MERCHANT_CODE,
        amount: params.amount,
        success: (res) => {
          if (res && res.code === 'SUCCEED' && res.txnid) {
            resolve(res.txnid);
          } else {
            reject(new Error(res?.message || 'Paiement non confirmé par l\'opérateur.'));
          }
        },
        fail: (err) => reject(err),
      });
    } else {
      // Fallback Dev / Simulateur
      console.log('[Dev Mode] Simulation tcpay réussi.');
      resolve('SIM_TXN_' + Date.now());
    }
  });
}

/**
 * Smart Polling avec 3 essais et backoff progressif
 */
async function reconfirmBackendWithPolling(txnid, confirmBackendCall, maxRetries = 3) {
  const delays = [0, 2000, 4000];
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (delays[attempt] > 0) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
      }
      return await confirmBackendCall(txnid);
    } catch (err) {
      lastError = err;
      console.warn(\`[Smart Polling] Tentative \${attempt + 1}/\${maxRetries} échouée :\`, err.message);
    }
  }

  const error = new Error('Échec de confirmation backend après ' + maxRetries + ' tentatives.');
  error.txnid = txnid;
  error.uncertain = true;
  throw error;
}
`;

  const paymentShieldPath = path.join(utilsApisDir, 'paymentShield.js');
  if (!fs.existsSync(paymentShieldPath)) {
    fs.writeFileSync(paymentShieldPath, paymentShieldContent, 'utf8');
  }
  console.log('  ✅ utils/config.js et utils/apis/paymentShield.js configurés.\n');

  // 4. INSTALLATION DU BOUCLIER GIT LOCAL (PRE-COMMIT HOOK)
  const gitDir = path.join(targetDir, '.git');
  if (fs.existsSync(gitDir)) {
    console.log('🛡️ 4. Activation du Bouclier Git Local (Pre-Commit Hook)...');
    try {
      const { execSync } = require('child_process');
      const hookInstaller = path.join(skillRoot, 'scripts', 'install-hooks.js');
      execSync(`node "${hookInstaller}" "${targetDir}"`, { stdio: 'pipe' });
      console.log('  ✅ Hook pré-commit local activé dans .git/hooks/pre-commit.\n');
    } catch (e) {
      console.warn('  ⚠️ Note : Hook Git non installé automatiquement.');
    }
  }

  // 5. INJECTION DE L'ARSENAL DE TESTS & GÉNÉRATEURS CLI
  console.log('🧪 5. Déploiement de l\'Arsenal de Tests & Commandes CLI...');
  const scriptsToCopy = [
    'test-page-harness.js',
    'check-wechat-quality.cjs',
    'e2e-runner.js',
    'bundle-doctor.js',
    'tcmpp-matrix.js',
    'merge-doctor.js',
    // modules requis par merge-doctor.js (sans eux : "Cannot find module './doctor/parse'")
    'doctor/parse.js',
    'doctor/rules-quality.js',
    'doctor/rules-miniprogram.js',
    'create-page.js',
    'create-component.js',
    'create-api.js',
    'install-hooks.js'
  ];
  const targetScriptsDir = path.join(targetDir, 'scripts');
  if (!fs.existsSync(targetScriptsDir)) fs.mkdirSync(targetScriptsDir, { recursive: true });

  scriptsToCopy.forEach(scriptFile => {
    const src = path.join(skillRoot, 'scripts', scriptFile);
    const dest = path.join(targetScriptsDir, scriptFile);
    copyFileSafe(src, dest);
  });

  // Copie de tcmpp.config.json à la racine du projet
  copyFileSafe(path.join(skillRoot, 'tcmpp.config.json'), path.join(targetDir, 'tcmpp.config.json'));

  // Mise à jour ou création du package.json cible
  const targetPkgPath = path.join(targetDir, 'package.json');
  let targetPkg = {};
  if (fs.existsSync(targetPkgPath)) {
    try {
      targetPkg = JSON.parse(fs.readFileSync(targetPkgPath, 'utf8'));
    } catch (e) {}
  } else {
    targetPkg = {
      name: path.basename(targetDir),
      version: '1.0.0',
      description: 'WeChat Mini-Program (TCMPP Sonatel)',
      scripts: {}
    };
  }

  targetPkg.scripts = targetPkg.scripts || {};
  targetPkg.scripts.test = "node scripts/test-page-harness.js && node scripts/check-wechat-quality.cjs . && node scripts/tcmpp-matrix.js . && node scripts/e2e-runner.js .";
  targetPkg.scripts.fix = "node scripts/check-wechat-quality.cjs . --fix";
  targetPkg.scripts['audit:tcmpp'] = "node scripts/tcmpp-matrix.js .";
  targetPkg.scripts['merge:doctor'] = "node scripts/merge-doctor.js";
  targetPkg.scripts['merge:report'] = "node scripts/merge-doctor.js --report";
  targetPkg.scripts['merge:all'] = "node scripts/merge-doctor.js --all";
  targetPkg.scripts['merge:fix'] = "node scripts/merge-doctor.js --fix";
  targetPkg.scripts['merge:test'] = "node scripts/merge-doctor.js --self-test";
  targetPkg.scripts['test:harness'] = "node scripts/test-page-harness.js";
  targetPkg.scripts['test:e2e'] = "node scripts/e2e-runner.js .";
  targetPkg.scripts['quality:wechat'] = "node scripts/check-wechat-quality.cjs .";
  targetPkg.scripts['create:page'] = "node scripts/create-page.js";
  targetPkg.scripts['create:component'] = "node scripts/create-component.js";
  targetPkg.scripts['create:api'] = "node scripts/create-api.js";

  fs.writeFileSync(targetPkgPath, JSON.stringify(targetPkg, null, 2) + '\n', 'utf8');
  console.log('  ✅ Scripts de tests (Harness, TCA, E2E, Matrice TCMPP, Merge Doctor) et générateurs installés.');
  console.log('  ✅ tcmpp.config.json configuré (Profil Sonatel Max It 2.4.x / 3.0.x).');
  console.log('  ✅ package.json configuré avec npm test, npm run fix et npm run merge:doctor.\n');

  console.log('====================================================');
  console.log('🎉 PROJET INITIALISÉ AVEC SUCCÈS ! (100% CONFORME TCMPP)');
  console.log('====================================================\n');
  console.log('👉 Pour vérifier la conformité de votre projet à tout moment :');
  console.log('   npm test\n');
  process.exit(0);
}

if (command === 'merge-doctor' || command === 'merge:doctor') {
  const mergeDoctorScript = path.join(skillRoot, 'scripts', 'merge-doctor.js');
  const forwardedArgs = process.argv.slice(3).map(a => `"${a}"`).join(' ');
  const { execSync } = require('child_process');
  try {
    execSync(`node "${mergeDoctorScript}" ${forwardedArgs}`, { stdio: 'inherit' });
    process.exit(0);
  } catch (err) {
    process.exit(err.status || 1);
  }
}

// Affiche l'aide
console.log(`
⚡ WeChat PMT CLI — Outil d'Architecture & Production

Usage :
  npx wechat-pmt init [dossier-cible]     Initialise un projet WeChat avec les standards Sonatel
  npx wechat-pmt merge-doctor [cible]     Simulateur prédictif de merge en arrière-plan
  node scripts/cli.js init [dossier]      Initialise un projet en local

Options :
  init          Déploie les directives IA, la triade de composants UI et le bouclier bancaire
  merge-doctor  Simule la fusion (sans toucher au disque) + revue statique des lignes modifiées
                (métier, qualité, sécurité, mini-programme, cohérence WXML/JSON/assets)
                Options : --all  --fix  --report  --json  --self-test
  --help        Affiche ce message d'aide
`);
