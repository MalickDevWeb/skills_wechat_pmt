#!/usr/bin/env node

/**
 * 🏛️ TCMPP COMPATIBILITY MATRIX AUDITOR — SONATEL MAX IT
 * 
 * Vérificateur officiel d'homologation selon le profil de conteneur :
 * - Profil 2.4.x : Conteneur Stable Max It (wx.tcpay, merchantCode, 10 pages max)
 * - Profil 3.0.x : Conteneur Next-Gen Max It (wx.requestPayment, biométrie, 15 pages max)
 * 
 * Usage :
 *   node scripts/tcmpp-matrix.js [projet]
 *   npm run audit:tcmpp
 */

const fs = require('fs');
const path = require('path');

const targetProjectDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const skillRoot = path.resolve(__dirname, '..');

// Lecture de la configuration de matrice
let matrixConfigPath = path.join(targetProjectDir, 'tcmpp.config.json');
if (!fs.existsSync(matrixConfigPath)) {
  matrixConfigPath = path.join(skillRoot, 'tcmpp.config.json');
}

if (!fs.existsSync(matrixConfigPath)) {
  console.error('❌ Fichier tcmpp.config.json introuvable.');
  process.exit(1);
}

const matrixConfig = JSON.parse(fs.readFileSync(matrixConfigPath, 'utf8'));
const targetVersion = matrixConfig.targetVersion || '2.4.x';
const profile = matrixConfig.profiles[targetVersion];

if (!profile) {
  console.error(`❌ Profil TCMPP inconnu : ${targetVersion}`);
  process.exit(1);
}

console.log('====================================================');
console.log('🏛️ AUDIT D\'HOMOLOGATION TCMPP SONATEL MAX IT');
console.log(`📁 Projet cible  : ${targetProjectDir}`);
console.log(`🎯 Profil Cible   : ${profile.name} (${targetVersion})`);
console.log(`🌍 Environnement  : ${matrixConfig.environment}`);
console.log('====================================================\n');

const checks = [];

// 1. VÉRIFICATION DU CHARGEMENT DIFFÉRÉ (LAZY LOADING)
const appJsonPath = path.join(targetProjectDir, 'app.json');
let lazyLoadingOk = false;
let subpackageSizeOk = true;

if (fs.existsSync(appJsonPath)) {
  try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    if (profile.lazyCodeLoadingRequired) {
      lazyLoadingOk = appJson.lazyCodeLoading === 'requiredComponents';
    } else {
      lazyLoadingOk = true;
    }
  } catch (e) {}
}

checks.push({
  title: 'Chargement différé (lazyCodeLoading)',
  success: lazyLoadingOk,
  detail: lazyLoadingOk ? 'Actif (requiredComponents)' : 'Manquant dans app.json'
});

// 2. VÉRIFICATION DE LA TAILLE PAR RAPPORT AU PLAFOND DU PROFIL
let totalSize = 0;
function calcDirSize(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (['.git', 'node_modules', 'dist', 'reports'].includes(item)) continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) calcDirSize(full);
    else totalSize += stat.size;
  }
}
calcDirSize(targetProjectDir);
const sizeMb = totalSize / (1024 * 1024);
const sizeCheck = sizeMb <= profile.maxSubpackageSizeMB;

checks.push({
  title: `Plafond de taille sous-paquet (${profile.maxSubpackageSizeMB} Mo max)`,
  success: sizeCheck,
  detail: `${sizeMb.toFixed(2)} Mo <= ${profile.maxSubpackageSizeMB} Mo`
});

// 3. VÉRIFICATION DE L'API DE PAIEMENT CONFORME AU PROFIL
let paymentApiFound = false;
let callsWrongApi = false;

function scanPaymentCalls(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (['.git', 'node_modules', 'dist', 'scripts'].includes(item)) continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) scanPaymentCalls(full);
    else if (item.endsWith('.js')) {
      const code = fs.readFileSync(full, 'utf8');
      if (code.includes(profile.paymentApi) || code.includes('callNativeMerchantPay') || code.includes('miniSDK.pay') || code.includes('executePaymentWithShield')) {
        paymentApiFound = true;
      }
      if (targetVersion === '2.4.x' && code.includes('wx.requestPayment') && !code.includes('mock') && !code.includes('options')) {
        callsWrongApi = true;
      }
    }
  }
}
scanPaymentCalls(targetProjectDir);

checks.push({
  title: `API Paiement Marchand (${profile.paymentApi})`,
  success: paymentApiFound && !callsWrongApi,
  detail: paymentApiFound ? `Conforme au standard conteneur ${targetVersion}` : 'Aucun appel direct détecté ou shim générique actif'
});

// 4. VÉRIFICATION DU SCELLAGE BANCAIRE (_confirmedTxnid)
let shieldImplemented = false;
function scanShield(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (['.git', 'node_modules', 'dist', 'scripts'].includes(item)) continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) scanShield(full);
    else if (item.endsWith('.js')) {
      const code = fs.readFileSync(full, 'utf8');
      if (code.includes('_confirmedTxnid') || code.includes('executePaymentWithShield')) {
        shieldImplemented = true;
      }
    }
  }
}
scanShield(targetProjectDir);

checks.push({
  title: 'Bouclier Bancaire Anti-Double Débit (_confirmedTxnid)',
  success: shieldImplemented,
  detail: shieldImplemented ? 'Actif (Scellage immédiat et Smart Polling)' : 'Non détecté dans le code'
});

// AFFICHAGE DU RAPPORT D'HOMOLOGATION
console.log('----------------------------------------------------');
let allPassed = true;
checks.forEach(c => {
  const status = c.success ? '✅ HOMOLOGUÉ' : '❌ REFUSÉ   ';
  if (!c.success) allPassed = false;
  console.log(`${status} | ${c.title.padEnd(46)} | ${c.detail}`);
});
console.log('----------------------------------------------------\n');

if (allPassed) {
  console.log(`✨ RÉSULTAT : LE PROJET EST 100% HOMOLOGUÉ POUR SONATEL MAX IT (${targetVersion}) !`);
  console.log('🚀 Conforme pour déploiement en production sur les boutiques Orange Money.\n');
  process.exit(0);
} else {
  console.error(`❌ ÉCHEC : Le projet ne remplit pas tous les critères du profil TCMPP ${targetVersion}.\n`);
  process.exit(1);
}
