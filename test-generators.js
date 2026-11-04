#!/usr/bin/env node

/**
 * 🧪 TEST-GENERATORS — WeChat PMT
 * Teste automatiquement les générateurs create-page.js, create-component.js et create-api.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SKILL_DIR = __dirname;
const TEMP_DIR = path.join(SKILL_DIR, '.tmp-test-scaffold');

console.log('====================================================');
console.log('🧪 TEST DES GÉNÉRATEURS CLI — WECHAT PMT');
console.log('====================================================\n');

try {
  // Nettoyage préalable
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }

  // 1. Test create-page.js
  console.log('🔍 Test 1 : Génération de page (create-page.js)...');
  const pageTarget = path.join(TEMP_DIR, 'pages', 'test-order');
  execSync(`node "${path.join(SKILL_DIR, 'create-page.js')}" "${pageTarget}" --with-api`, {
    stdio: 'pipe',
  });

  ['index.js', 'index.wxml', 'index.wxss', 'index.json'].forEach((file) => {
    const filePath = path.join(pageTarget, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier de page manquant : ${file}`);
    }
    const stat = fs.statSync(filePath);
    if (stat.size === 0) {
      throw new Error(`Fichier de page vide : ${file}`);
    }
  });

  // Valider index.json
  const pageJson = JSON.parse(fs.readFileSync(path.join(pageTarget, 'index.json'), 'utf8'));
  if (!pageJson.usingComponents) {
    throw new Error('index.json de la page ne contient pas usingComponents');
  }
  console.log('  ✅ create-page.js fonctionne avec succès (4 fichiers valides).\n');

  // 2. Test create-component.js (Mode UI)
  console.log('🔍 Test 2 : Génération de composant UI (create-component.js)...');
  const compTarget = path.join(TEMP_DIR, 'components', 'ui', 'user-card');
  execSync(`node "${path.join(SKILL_DIR, 'create-component.js')}" "${compTarget}"`, {
    stdio: 'pipe',
  });

  ['index.js', 'index.wxml', 'index.wxss', 'index.json'].forEach((file) => {
    const filePath = path.join(compTarget, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier composant UI manquant : ${file}`);
    }
  });

  const compJson = JSON.parse(fs.readFileSync(path.join(compTarget, 'index.json'), 'utf8'));
  if (compJson.component !== true) {
    throw new Error('index.json du composant ne contient pas "component": true');
  }
  console.log('  ✅ create-component.js (UI) fonctionne avec succès (4 fichiers valides).\n');

  // 3. Test create-component.js (Mode UX)
  console.log('🔍 Test 3 : Génération de composant UX (create-component.js --ux)...');
  const uxTarget = path.join(TEMP_DIR, 'components', 'ux', 'card-skeleton');
  execSync(`node "${path.join(SKILL_DIR, 'create-component.js')}" "${uxTarget}" --ux`, {
    stdio: 'pipe',
  });

  ['index.js', 'index.wxml', 'index.wxss', 'index.json'].forEach((file) => {
    const filePath = path.join(uxTarget, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier composant UX manquant : ${file}`);
    }
  });
  console.log('  ✅ create-component.js (--ux) fonctionne avec succès (4 fichiers valides).\n');

  // 4. Test create-api.js
  console.log('🔍 Test 4 : Génération de module API & Mapper (create-api.js)...');
  execSync(`node "${path.join(SKILL_DIR, 'create-api.js')}" testorder --base-dir "${TEMP_DIR}"`, {
    stdio: 'pipe',
  });

  const apiFile = path.join(TEMP_DIR, 'utils', 'apis', 'testorder.api.js');
  const mapperFile = path.join(TEMP_DIR, 'utils', 'mappers', 'testorder.js');

  if (!fs.existsSync(apiFile)) {
    throw new Error('Fichier API manquant : utils/apis/testorder.api.js');
  }
  if (!fs.existsSync(mapperFile)) {
    throw new Error('Fichier Mapper manquant : utils/mappers/testorder.js');
  }
  console.log('  ✅ create-api.js fonctionne avec succès (API service + json-sculpt mapper).\n');

  console.log('====================================================');
  console.log('✨ TOUS LES 3 GÉNÉRATEURS SONT OPÉRATIONNELS ET VALIDES !');
  console.log('====================================================\n');
} catch (err) {
  console.error(`\n❌ Échec du test des générateurs : ${err.message}`);
  process.exit(1);
} finally {
  // Nettoyage
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
}
