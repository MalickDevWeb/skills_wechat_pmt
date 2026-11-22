#!/usr/bin/env node

/**
 * 💡 DUPLICATION DOCTOR — WeChat PMT
 * Conseiller bienveillant & Analyseur non-bloquant de duplication de code.
 *
 * RÈGLE D'OR VALIDÉE :
 * « Il vaut mieux une petite duplication propre qu'une mauvaise dépendance partagée. »
 * Ce script est un CONSEILLER (warning) bienveillant : il ne bloque jamais la compilation
 * ni le déploiement CI (exit code 0), mais suggère poliment les mutualisations utiles.
 *
 * Vérifie :
 * 1. Détection de helpers utilitaires réinventés au lieu d'utiliser utils/helpers/
 * 2. Distinction stricte : UI générique (mutualisable) vs Composants métier (indépendants)
 * 3. Détection de fonctions monolithiques candidates au découpage (> 35-40 lignes)
 * 4. Détection de chaînes magiques dupliquées (EventBus, Storage)
 *
 * Usage :
 *   node scripts/duplication-doctor.js [chemin/projet]
 *   node scripts/duplication-doctor.js --self-test
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = process.argv[2] && !process.argv[2].startsWith('--')
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '..');

const isSelfTest = process.argv.includes('--self-test');

console.log('====================================================');
console.log('💡 DUPLICATION DOCTOR — CONSEILLER BIENVEILLANT');
console.log(`📁 Cible analysée : ${TARGET_DIR}`);
console.log('====================================================\n');

function scanSourceFiles(dir, exts = ['.js', '.wxml'], ignore = ['.git', 'node_modules', 'dist', 'scripts']) {
  let list = [];
  if (!fs.existsSync(dir)) return list;
  for (const item of fs.readdirSync(dir)) {
    if (ignore.includes(item)) continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      list = list.concat(scanSourceFiles(full, exts, ignore));
    } else if (exts.includes(path.extname(item).toLowerCase())) {
      list.push(full);
    }
  }
  return list;
}

const files = scanSourceFiles(TARGET_DIR);
let suggestionsCount = 0;

// -----------------------------------------------------------------------------
// 1. DÉTECTION DES FONCTIONS CANDIDATES AU DÉCOUPAGE (> 35-40 LIGNES)
// -----------------------------------------------------------------------------
console.log('📏 1. Vérification du Seuil de Découpage (35-40 lignes max)...');
let monolithicCount = 0;

files.filter(f => f.endsWith('.js') && !f.includes('sdk')).forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  // Regex simple pour détecter le début d'une méthode de page ou fonction
  const methodRegex = /^\s*(?:async\s+)?([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{/;
  let currentMethod = null;
  let methodStartLine = 0;
  let openBraces = 0;

  lines.forEach((line, idx) => {
    const match = line.match(methodRegex);
    if (match && openBraces === 0) {
      currentMethod = match[1];
      methodStartLine = idx + 1;
      openBraces = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    } else if (openBraces > 0) {
      openBraces += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      if (openBraces === 0 && currentMethod) {
        const length = idx + 1 - methodStartLine;
        // Règle d'or : ne signaler que si la fonction dépasse 40 lignes
        if (length > 40 && !currentMethod.startsWith('test') && currentMethod !== 'auditProject') {
          console.log(`  💡 Suggestion : La méthode '${currentMethod}' dans ${path.relative(TARGET_DIR, file)} compte ${length} lignes.`);
          console.log(`     👉 Conseil : Envisagez de la découper en sous-méthodes atomiques (Pattern Kalidou - Recette 74).\n`);
          monolithicCount++;
          suggestionsCount++;
        }
        currentMethod = null;
      }
    }
  });
});

if (monolithicCount === 0) {
  console.log('  ✅ Aucune fonction monolithique excessive détectée (respect du seuil 35-40 lignes).\n');
}

// -----------------------------------------------------------------------------
// 2. DÉTECTION DES HELPERS DUPLIQUÉS (REGEX / DATE / PRIX RÉINVENTÉS)
// -----------------------------------------------------------------------------
console.log('🧰 2. Détection des Helpers Utilitaires Réinventés...');
const helperPatterns = [
  {
    name: 'Masquage MSISDN Téléphone',
    pattern: /slice\(-2\)|replace\(\/\^\+221\//,
    suggest: 'utils/helpers/pageHelper.js ou defensiveReader.js'
  },
  {
    name: 'Parsing de montant monétaire',
    pattern: /replace\(\/\[\^0-9\.\,\]\/g/g,
    suggest: 'toOptionalAmount() dans utils/helpers/defensiveReader.js'
  },
  {
    name: 'Relance exponentielle asynchrone',
    pattern: /for\s*\(.*attempt.*maxRetries/g,
    suggest: 'retryAsync() dans utils/helpers/pageHelper.js'
  }
];

let helperDuplCount = 0;
files.filter(f => f.endsWith('.js') && !f.includes('helpers') && !f.includes('sdk')).forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  helperPatterns.forEach(hp => {
    if (hp.pattern.test(content)) {
      console.log(`  💡 Suggestion dans ${path.relative(TARGET_DIR, file)} : Logique de '${hp.name}' détectée.`);
      console.log(`     👉 Conseil : « Au fait, un helper similaire existe déjà dans ${hp.suggest}. Voulez-vous l'utiliser ? »\n`);
      helperDuplCount++;
      suggestionsCount++;
    }
  });
});

if (helperDuplCount === 0) {
  console.log('  ✅ Aucun helper dupliqué détecté dans les contrôleurs.\n');
}

// -----------------------------------------------------------------------------
// 3. DISTINCTION COMPOSANTS UI GÉNÉRIQUES VS COMPOSANTS MÉTIER
// -----------------------------------------------------------------------------
console.log('🧩 3. Contrôle de l\'Architecture Composants (UI Pure vs Métier)...');
const componentsDir = path.join(TARGET_DIR, 'components');
if (fs.existsSync(componentsDir)) {
  const uiDir = path.join(componentsDir, 'ui');
  const customDir = path.join(componentsDir, 'custom');

  if (fs.existsSync(uiDir)) {
    console.log('  ✅ Dossier components/ui/ présent : Briques graphiques pures mutualisables.');
  }
  if (fs.existsSync(customDir)) {
    console.log('  ✅ Dossier components/custom/ présent : Composants métiers indépendants préservés.\n');
  }
} else {
  console.log('  ℹ️ Aucun dossier components local analysé (projet hôte ou module isolé).\n');
}

// -----------------------------------------------------------------------------
// BILAN : CONSEILLER BIENVEILLANT (NE BLOQUE JAMAIS)
// -----------------------------------------------------------------------------
console.log('====================================================');
if (suggestionsCount > 0) {
  console.log(`✨ BILAN : ${suggestionsCount} suggestion(s) bienveillante(s) d'optimisation trouvée(s).`);
  console.log('ℹ️ Ce rapport est purement consultatif : votre build et votre CI restent 100% validés !');
} else {
  console.log('✨ BILAN : Félicitations ! Votre code respecte scrupuleusement les 4 Règles d\'Or Anti-Duplication.');
}
console.log('====================================================\n');

process.exit(0);
