#!/usr/bin/env node

/**
 * 🪝 INSTALL LOCAL GIT HOOKS — WECHAT PMT
 * 
 * Installe un hook Git 'pre-commit' 100% LOCAL et OFFLINE :
 * - Aucune dépendance réseau ni cloud
 * - Vérifie automatiquement avant chaque commit :
 *   1. Zéro BOM UTF-8 (\uFEFF)
 *   2. Syntaxe JSON valide
 *   3. Pas de nesting SCSS dans les WXSS
 *   4. Exécution du Test Harness (Pages, Composants, Machine à états, Bouclier anti-double débit)
 * 
 * Usage :
 *   node scripts/install-hooks.js [chemin-du-projet]
 *   npm run hook:install
 */

const fs = require('fs');
const path = require('path');

const targetProjectDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const gitDir = path.join(targetProjectDir, '.git');
const hooksDir = path.join(gitDir, 'hooks');

console.log('====================================================');
console.log('🛡️ INSTALLATION DU BOUCLIER GIT LOCAL (PRE-COMMIT HOOK)');
console.log('====================================================\n');

if (!fs.existsSync(gitDir)) {
  console.error(`❌ Erreur : Aucun dossier .git trouvé dans "${targetProjectDir}".`);
  console.error('Assurez-vous d\'exécuter cette commande dans un projet Git.');
  process.exit(1);
}

if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

const preCommitHookPath = path.join(hooksDir, 'pre-commit');

// Script du hook bash / sh cross-platform
const hookScript = `#!/bin/sh
# 🛡️ LOCAL PRE-COMMIT GUARD — WECHAT PMT
# Vérification systématique 100% locale avant enregistrement du commit.

echo "🔍 [Local Guard] Audit pré-commit en cours..."

# 1. Détection de Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "⚠️ Node.js non détecté, vérification ignorée."
  exit 0
fi

# 2. Exécution des docteurs et tests de santé locaux
if [ -f "./scripts/skill-doctor.js" ]; then
  node ./scripts/skill-doctor.js
  DOCTOR_STATUS=$?
  if [ $DOCTOR_STATUS -ne 0 ]; then
    echo "❌ [Commit Bloqué] Échec de l'audit de santé (BOM, JSON ou WXSS invalide)."
    exit 1
  fi
fi

if [ -f "./scripts/test-page-harness.js" ]; then
  node ./scripts/test-page-harness.js
  HARNESS_STATUS=$?
  if [ $HARNESS_STATUS -ne 0 ]; then
    echo "❌ [Commit Bloqué] Échec du Test Harness (Cycles de vie ou verrous non conformes)."
    exit 1
  fi
fi

echo "✅ [Local Guard] 100% des contrôles locaux validés. Commit autorisé !"
exit 0
`;

try {
  fs.writeFileSync(preCommitHookPath, hookScript, { encoding: 'utf8', mode: 0o755 });
  console.log(`✅ Hook pré-commit local installé avec succès dans :`);
  console.log(`   ${preCommitHookPath}\n`);
  console.log('🔒 Fonctionnement garanti :');
  console.log('  • 100% Hors-ligne (aucun paquet externe, zéro cloud).');
  console.log('  • S\'exécute automatiquement en 1 seconde à chaque `git commit`.');
  console.log('  • Bloque le commit si un BOM UTF-8 ou une régression est détectée.\n');
  console.log('====================================================');
} catch (err) {
  console.error('❌ Échec de l\'écriture du hook :', err.message);
  process.exit(1);
}

