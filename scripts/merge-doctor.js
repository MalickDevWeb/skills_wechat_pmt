#!/usr/bin/env node

/**
 * 🩺 WECHAT PMT PRE-FLIGHT MERGE DOCTOR PRO (KASSOGO)
 *
 * Simulateur de fusion Git + revue de code statique (SANS LLM) inspirée des catégories
 * que GitLab Duo commente le plus en MR :
 *
 *   🛡️ Métier SAMU    : bouclier anti-double débit, clé scellée, Safe Area, BOM
 *   🧹 Qualité JS     : promesses flottantes / await manquant, verrous non libérés,
 *                       loader bloqué, catch vide, JSON.parse non protégé, code mort,
 *                       duplication, variables/imports inutilisés, fonctions trop longues
 *   🔐 Sécurité       : secrets en dur, HTTP non sécurisé, données perso dans les logs
 *   📱 Mini-programme : mutation de this.data, setData en boucle, fuites d'écouteurs,
 *                       setInterval non nettoyé, wx:for sans wx:key, wx.request sans fail
 *   🔗 Cohérence      : handler WXML inexistant, composant non déclaré / chemin cassé,
 *                       image introuvable, route inexistante ou mauvaise API de navigation
 *
 * Comme Duo, seules les LIGNES MODIFIÉES par la branche sont commentées
 * (les problèmes existants sont résumés à part ; --all pour tout voir).
 * Ignorer un cas volontaire : `// doctor-ignore RULE_ID` sur la ligne ou la ligne précédente.
 *
 * Usage :
 *   node scripts/merge-doctor.js [target_branch] [source_branch]
 *   node scripts/merge-doctor.js --all        # inclut les problèmes existants
 *   node scripts/merge-doctor.js --fix        # auto-corrections éligibles
 *   node scripts/merge-doctor.js --report     # MERGE_PREFLIGHT_REPORT.md
 *   node scripts/merge-doctor.js --json
 *   node scripts/merge-doctor.js --self-test
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  maskCode, makeLineIndex, scanIfChains, extractFunctions
} = require('./doctor/parse');
const { auditJsQuality } = require('./doctor/rules-quality');
const {
  auditMpJs, auditWxml, auditWxss, auditAsset, auditProject, collectTokens
} = require('./doctor/rules-miniprogram');

const targetProjectDir = process.cwd();

const EXCLUDED_DIRS = /^(sdk|node_modules|miniprogram_npm|scripts|\.git|\.vscode)\//;
const SEVERITY_ORDER = { CRITIQUE: 0, HAUTE: 1, MOYENNE: 2, INFO: 3 };
const SEVERITY_ICON = { CRITIQUE: '🚨', HAUTE: '⚠️', MOYENNE: '🔸', INFO: 'ℹ️' };

// ============================================================
// 0. HELPERS GIT
// ============================================================
function git(argsArr, { trim = true } = {}) {
  const res = spawnSync('git', ['-c', 'core.quotepath=false', ...argsArr], {
    cwd: targetProjectDir,
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024
  });
  if (res.error) return { ok: false, status: -1, stdout: '', stderr: String(res.error) };
  const out = res.stdout || '';
  return {
    ok: res.status === 0,
    status: res.status,
    stdout: trim ? out.trim() : out, // trim=false indispensable pour conserver un BOM éventuel
    stderr: (res.stderr || '').trim()
  };
}

function runGit(argsArr) {
  const r = git(argsArr);
  return r.ok ? r.stdout : null;
}

// ============================================================
// 1. RÈGLES MÉTIER SAMU (bouclier Orange Money)
// ============================================================
const RESET_TXNID_RE = /_confirmedTxnid\s*=\s*null/;
const LABEL_CHECK_RE = /\.label\b[^;\n]*?\.toLowerCase\(\)\s*\.includes\(\s*['"]interurbain['"]\s*\)/;
const LABEL_AUTOFIX_RE = /\s*\|\|\s*\(\s*offer\.label\s*&&\s*offer\.label\.toLowerCase\(\)\.includes\(['"]interurbain['"]\)\s*\)/g;

function auditJsContent(relPath, content) {
  const issues = [];
  const masked = maskCode(content);
  const lineOf = makeLineIndex(content);
  const chains = scanIfChains(content, masked, lineOf);
  const fns = extractFunctions(masked, lineOf);
  const shield = (o) => issues.push({ file: relPath, category: 'métier', fileLevel: true, fixable: false, ...o });

  // A. Branches mortes : condition identique, ou entièrement couverte par les `||` précédents
  for (const branches of chains) {
    const seenFull = new Set();
    const seenTerms = new Set();
    branches.forEach((b, idx) => {
      if (idx > 0) {
        const exact = seenFull.has(b.cond);
        const covered = !exact && b.terms.length > 0 && b.terms.every(t => seenTerms.has(t));
        if (exact || covered) {
          issues.push({
            file: relPath, category: 'qualité', line: b.line, type: 'DEAD_CODE_DUPLICATE_BRANCH', severity: 'CRITIQUE', fixable: false,
            message: exact
              ? `Branche dupliquée dans la même chaîne : \`else if (${b.cond})\` ne sera jamais exécutée.`
              : `\`else if (${b.cond})\` est déjà couverte par une branche précédente (\`||\`) : code mort.`,
            detail: 'Fusionnez les branches concernées en une seule.'
          });
        }
      }
      seenFull.add(b.cond);
      b.terms.forEach(t => seenTerms.add(t));
    });
  }

  // B. _confirmedTxnid utilisé sans lier l'offre
  if (content.includes('_confirmedTxnid') && !content.includes('_confirmedOfferId') && !content.includes('_confirmedOfferKey')) {
    shield({
      line: lineOf(content.indexOf('_confirmedTxnid')), type: 'SHIELD_REPLAY_NO_BINDING', severity: 'CRITIQUE',
      message: 'Le bouclier utilise `_confirmedTxnid` sans lier l\'offre (`_confirmedOfferId` ou `_confirmedOfferKey`).',
      detail: 'Si le client change d\'offre après un échec réseau, le paiement précédent pourrait être faussement réattribué.'
    });
  }

  // C. Clé scellée interurbaine sans destination
  const keyFn = fns.find(f => f.name === 'buildOfferSealedKey');
  if (keyFn && content.includes('interurbain') && !/dest/i.test(keyFn.bodyMasked)) {
    shield({
      line: keyFn.line, type: 'SHIELD_ROUTE_COLLISION', severity: 'HAUTE',
      message: '`buildOfferSealedKey` ne prend pas la destination en compte.',
      detail: 'Deux trajets de même origine (ex : Dakar → Thiès vs Dakar → Saint-Louis) partageraient la même clé.'
    });
  }

  // D. Heuristique fragile basée sur le libellé
  const labelMatch = LABEL_CHECK_RE.exec(content);
  if (labelMatch) {
    LABEL_AUTOFIX_RE.lastIndex = 0;
    shield({
      line: lineOf(labelMatch.index), type: 'SHIELD_LABEL_BASED_CHECK_RISK', severity: 'HAUTE',
      fixable: LABEL_AUTOFIX_RE.test(content),
      message: 'Vérification basée sur le libellé texte (`label.toLowerCase().includes(\'interurbain\')`).',
      detail: 'Alignez la détection strictement sur l\'identifiant immuable (`offer.id === \'interurbain\'`).'
    });
  }

  // E. Fuite de variable mutable dans la clé scellée
  if (content.includes('transferDestinationCity') && content.includes('buildOfferSealedKey')) {
    const leakPattern = /dest(?:ination)?\s*=\s*(?:destination\s*\|\|\s*)?(?:offer\.destination\s*\|\|\s*)?this\.data\.transferDestinationCity/i;
    const leak = leakPattern.exec(content);
    if (leak && !content.includes('isInterurban')) {
      shield({
        line: lineOf(leak.index), type: 'SHIELD_KEY_DRIFT_GLOBAL_MUTABLE', severity: 'CRITIQUE',
        message: '`this.data.transferDestinationCity` est injectée comme destination sans restreindre aux offres interurbaines.',
        detail: 'Une ville interurbaine sélectionnée auparavant corromprait la clé d\'une offre standard et provoquerait un faux mismatch.'
      });
    }
  }

  // B2. Scellement lié à l'id de l'offre seulement (la route antenne/destination/prix n'est pas liée)
  const idGuard = /_confirmedOfferId\s*!==?|!==?\s*this\._confirmedOfferId/.exec(content);
  if (idGuard && !content.includes('_confirmedOfferKey')) {
    shield({
      line: lineOf(idGuard.index), type: 'SHIELD_BINDING_ID_ONLY', severity: 'HAUTE',
      message: 'Le débit scellé est comparé uniquement sur `_confirmedOfferId`.',
      detail: 'Même offre mais autre antenne/destination/prix = même id : le txnid serait rejoué sur la mauvaise route. Utilisez une clé composite (`buildOfferSealedKey`) stockée dans `_confirmedOfferKey`.'
    });
  }

  // F. Mismatch de scellement : le verrou doit être nettoyé DANS la branche du mismatch
  if (/_confirmedOffer(Key|Id)/.test(content)) {
    const resetFns = new Set(fns.filter(f => RESET_TXNID_RE.test(f.bodyMasked)).map(f => f.name));
    for (const branches of chains) {
      for (const b of branches) {
        if (!/_confirmedOffer(Key|Id)/.test(b.cond) || !/!==?/.test(b.cond)) continue;
        const resetsInline = RESET_TXNID_RE.test(b.bodyMasked);
        const resetsViaHelper = [...b.bodyMasked.matchAll(/this\.([\w$]+)\s*\(/g)].some(x => resetFns.has(x[1]));
        if (!resetsInline && !resetsViaHelper) {
          shield({
            line: b.line, type: 'SHIELD_MISMATCH_STALE_SEAL_CLEANUP', severity: 'HAUTE',
            message: 'En cas de mismatch de scellement, la branche ne réinitialise pas `_confirmedTxnid`.',
            detail: 'L\'utilisateur reste bloqué tant qu\'il ne quitte pas l\'écran. Ajoutez `this._confirmedTxnid = null;` dans ce bloc (ou appelez un helper qui le fait).'
          });
        }
      }
    }
  }

  // G. Montant en dur utilisé comme valeur de repli (affiché/payé si l'offre est incomplète)
  for (const m of content.matchAll(/(\|\||\?\?|:)\s*(['"`])\s*\d[\d\s.,  ]*\s?(F|FCFA|F CFA|XOF|CFA)\s*\2/g)) {
    if (masked[m.index] === ' ' && content[m.index] !== ' ') continue; // commentaire
    if (m[1] === ':') {
      const lineStart = content.lastIndexOf('\n', m.index) + 1;
      if (!masked.slice(lineStart, m.index).includes('?')) continue; // clé d'objet, pas un ternaire
    }
    issues.push({
      file: relPath, category: 'métier', line: lineOf(m.index), type: 'HARDCODED_AMOUNT_FALLBACK', severity: 'HAUTE', fixable: false,
      message: `Montant en dur \`${m[0].replace(/^(\|\||\?\?|:)\s*/, '')}\` utilisé comme valeur de repli.`,
      detail: 'Si l\'offre est incomplète, un faux montant serait affiché sur le reçu (voire payé). Bloquez le parcours (`if (!offer || !offer.price) return;`) au lieu d\'inventer un prix.'
    });
  }

  return issues;
}

// ============================================================
// 2. WXSS / FICHIERS DIVERS
// ============================================================
function auditOtherFiles(relPath, content) {
  const issues = [];
  const ext = path.extname(relPath).toLowerCase();

  if (ext === '.wxss' || ext === '.css') {
    // Seule une BARRE collée en bas (fixed + bottom:0 sans top) est concernée, vérifiée BLOC PAR BLOC
    // (un autre bloc du fichier qui utilise safe-area ne protège pas celui-ci).
    const css = content.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
    const lineOf = makeLineIndex(css);
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const body = m[2];
      const isFixed = /(?:^|[;\s])position\s*:\s*fixed\b/.test(body);
      const atBottom = /(?:^|[;\s])bottom\s*:\s*0(?:rpx|px)?\s*(?:!important\s*)?(?:;|$)/.test(body);
      const hasTop = /(?:^|[;\s])top\s*:/.test(body) || /(?:^|[;\s])inset\s*:/.test(body);
      if (isFixed && atBottom && !hasTop && !/safe-area-inset-bottom/.test(body)) {
        issues.push({
          file: relPath, category: 'métier', line: lineOf(m.index + m[1].search(/\S/)), type: 'WXSS_SAFE_AREA_MISSING', severity: 'HAUTE', fixable: false,
          message: `\`${m[1].trim()}\` est fixé en bas d'écran (\`position: fixed; bottom: 0\`) sans Safe Area iPhone.`,
          detail: 'Ajoutez `padding-bottom: calc(XXrpx + env(safe-area-inset-bottom));`.'
        });
      }
    }
  }

  if (['.js', '.ts', '.wxml', '.wxss', '.json', '.wxs'].includes(ext) && content.length > 0 && !content.endsWith('\n')) {
    issues.push({
      file: relPath, category: 'qualité', line: content.split('\n').length, type: 'MISSING_FINAL_NEWLINE', severity: 'INFO', fixable: true,
      message: 'Pas de saut de ligne en fin de fichier.',
      detail: 'Génère des diffs bruités (« No newline at end of file »). Auto-fix disponible.'
    });
  }

  if (content.charCodeAt(0) === 0xFEFF) {
    issues.push({
      file: relPath, category: 'métier', fileLevel: true, line: 1, type: 'BOM_UTF8_DETECTED', severity: 'CRITIQUE', fixable: true,
      message: 'BOM UTF-8 (`\\uFEFF`) détecté au début du fichier.',
      detail: 'Provoque des erreurs de compilation silencieuses dans TCMPP. Doit être supprimé.'
    });
  }

  return issues;
}

// ============================================================
// 3. AUTO-CORRECTION (--fix)
// ============================================================
function applyAutoFixes(issues) {
  let fixedCount = 0;
  const filesToFix = new Map();
  for (const issue of issues) {
    if (!issue.fixable) continue;
    if (!filesToFix.has(issue.file)) filesToFix.set(issue.file, []);
    filesToFix.get(issue.file).push(issue);
  }

  for (const [relPath, fileIssues] of filesToFix.entries()) {
    const fullPath = path.join(targetProjectDir, relPath);
    if (!fs.existsSync(fullPath)) continue;
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    for (const issue of fileIssues) {
      if (issue.type === 'MISSING_FINAL_NEWLINE' && content.length && !content.endsWith('\n')) {
        content += content.includes('\r\n') ? '\r\n' : '\n';
        modified = true;
        fixedCount++;
        console.log(`  🔧 [Auto-Fix] Saut de ligne final ajouté dans ${relPath}`);
      } else if (issue.type === 'BOM_UTF8_DETECTED' && content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
        modified = true;
        fixedCount++;
        console.log(`  🔧 [Auto-Fix] BOM UTF-8 supprimé dans ${relPath}`);
      } else if (issue.type === 'SHIELD_LABEL_BASED_CHECK_RISK') {
        LABEL_AUTOFIX_RE.lastIndex = 0;
        if (LABEL_AUTOFIX_RE.test(content)) {
          LABEL_AUTOFIX_RE.lastIndex = 0;
          content = content.replace(LABEL_AUTOFIX_RE, '');
          modified = true;
          fixedCount++;
          console.log(`  🔧 [Auto-Fix] Heuristique textuelle supprimée dans ${relPath} (alignement strict sur offer.id)`);
        }
      }
    }

    if (modified) fs.writeFileSync(fullPath, content, 'utf8');
  }
  return fixedCount;
}

// ============================================================
// 4. SIMULATION DE FUSION
// ============================================================
function parseConflictMarkers(text, file) {
  const blocks = [];
  let state = null;
  let cur = null;
  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    if (/^<{7}(\s|$)/.test(line)) { state = 'our'; cur = { our: [], their: [] }; continue; }
    if (!cur) continue;
    if (/^\|{7}(\s|$)/.test(line)) { state = 'base'; continue; }
    if (/^={7}$/.test(line)) { state = 'their'; continue; }
    if (/^>{7}(\s|$)/.test(line)) {
      blocks.push({ ourContent: cur.our.join('\n'), theirContent: cur.their.join('\n'), file });
      cur = null; state = null;
      continue;
    }
    if (state === 'our') cur.our.push(line);
    else if (state === 'their') cur.their.push(line);
  }
  return blocks;
}

/** Parser de l'ANCIENNE sortie `git merge-tree <base> <a> <b>` (repli Git < 2.38). */
function parseMergeTreeOutput(rawOutput) {
  const conflicts = [];
  const autoMerged = [];
  const addedFiles = [];
  const lines = rawOutput.split('\n');
  let currentFile = null;
  let inConflict = false;
  let conflictBlocks = [];
  let currentBlock = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('merged')) {
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const m = lines[j].match(/result\s+\d+\s+[0-9a-f]+\s+(.+)/);
        if (m) { autoMerged.push(m[1].trim()); break; }
      }
    } else if (line.startsWith('added in')) {
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const m = lines[j].match(/(?:our|their)\s+\d+\s+[0-9a-f]+\s+(.+)/);
        if (m) { addedFiles.push(m[1].trim()); break; }
      }
    } else if (line.startsWith('changed in both')) {
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const m = lines[j].match(/(?:our|their|base)\s+\d+\s+[0-9a-f]+\s+(.+)/);
        if (m) { currentFile = m[1].trim(); conflictBlocks = []; break; }
      }
    } else if (/^\+?\s*<{7}/.test(line)) {
      inConflict = true;
      currentBlock = { our: [], their: [], file: currentFile };
    } else if (/^\+?\s*={7}/.test(line) && inConflict && currentBlock) {
      currentBlock.inTheir = true;
    } else if (/^\+?\s*>{7}/.test(line) && inConflict && currentBlock) {
      inConflict = false;
      conflictBlocks.push({ ourContent: currentBlock.our.join('\n'), theirContent: currentBlock.their.join('\n'), file: currentFile });
      if (currentFile && !conflicts.find(c => c.file === currentFile)) {
        conflicts.push({ file: currentFile, kind: 'content', blocks: conflictBlocks });
      }
      currentBlock = null;
    } else if (inConflict && currentBlock) {
      const cleanLine = line.replace(/^\+/, '');
      if (currentBlock.inTheir) currentBlock.their.push(cleanLine);
      else currentBlock.our.push(cleanLine);
    }
  }
  return { conflicts, autoMerged, addedFiles };
}

function simulateMerge(targetBranch, sourceBranch, mergeBase) {
  const r = git(['merge-tree', '--write-tree', '--name-only', '--messages', targetBranch, sourceBranch]);
  const unsupported = r.status === 129 || /unknown option|usage: git merge-tree/i.test(r.stderr);
  if (unsupported) {
    const legacy = git(['merge-tree', mergeBase, targetBranch, sourceBranch]);
    if (!legacy.ok) return null;
    return { ...parseMergeTreeOutput(legacy.stdout), engine: 'legacy' };
  }
  if (r.status !== 0 && r.status !== 1) return null;

  const lines = r.stdout.split('\n').map(l => l.replace(/\r$/, ''));
  const treeOid = (lines[0] || '').trim();
  let i = 1;
  const conflictedPaths = [];
  while (i < lines.length && lines[i].trim() !== '') {
    if (r.status === 1) conflictedPaths.push(lines[i].trim());
    i++;
  }
  const messages = lines.slice(i + 1);
  const autoMerged = [];
  const conflictKinds = new Map();
  for (const msg of messages) {
    const am = msg.match(/^Auto-merging (.+)$/);
    if (am) autoMerged.push(am[1].trim());
    const cm = msg.match(/^CONFLICT \(([^)]+)\):.*?(?:in |: )(\S+)/);
    if (cm) conflictKinds.set(cm[2].trim(), cm[1]);
  }
  const conflicts = [...new Set(conflictedPaths)].map(file => {
    const blob = git(['show', `${treeOid}:${file}`], { trim: false });
    return { file, kind: conflictKinds.get(file) || 'content', blocks: blob.ok ? parseConflictMarkers(blob.stdout, file) : [] };
  });
  const added = (runGit(['diff', '--name-status', '--diff-filter=A', mergeBase, sourceBranch]) || '')
    .split('\n').filter(Boolean).map(l => l.split('\t').pop());

  return { conflicts, autoMerged: autoMerged.filter(f => !conflictedPaths.includes(f)), addedFiles: added, engine: 'write-tree' };
}

// ============================================================
// 5. INDEX DU PROJET (côté branche source)
// ============================================================
function buildProject(ctx) {
  let files;
  if (ctx.readFromDisk) {
    const tracked = (runGit(['ls-files']) || '').split('\n');
    const untracked = (runGit(['ls-files', '--others', '--exclude-standard']) || '').split('\n');
    files = new Set([...tracked, ...untracked].filter(f => f && fs.existsSync(path.join(targetProjectDir, f))));
  } else {
    files = new Set((runGit(['ls-tree', '-r', '--name-only', ctx.sourceBranch]) || '').split('\n').filter(Boolean));
  }
  const cache = new Map();
  const read = (rel) => {
    if (cache.has(rel)) return cache.get(rel);
    let content = null;
    if (files.has(rel)) {
      if (ctx.readFromDisk) content = fs.readFileSync(path.join(targetProjectDir, rel), 'utf8');
      else {
        const r = git(['show', `${ctx.sourceBranch}:${rel}`], { trim: false });
        content = r.ok ? r.stdout : null;
      }
    }
    cache.set(rel, content);
    return content;
  };
  const size = (rel) => {
    if (!files.has(rel)) return 0;
    if (ctx.readFromDisk) return fs.statSync(path.join(targetProjectDir, rel)).size;
    return parseInt(runGit(['cat-file', '-s', `${ctx.sourceBranch}:${rel}`]) || '0', 10);
  };
  return { files, read, exists: (rel) => files.has(rel), size };
}

/** Fichiers analysables (hors vendor, minifiés, scripts). */
function isAuditable(rel, content) {
  if (EXCLUDED_DIRS.test(rel) || /\.min\.js$/.test(rel)) return false;
  if (content && /\.js$/.test(rel) && content.split('\n').some(l => l.length > 2000)) return false; // minifié / obfusqué
  return true;
}

/** Fichiers modifiés + lignes modifiées (nouvelle numérotation) depuis le merge-base. */
function collectChanges(ctx, mergeBase) {
  const range = ctx.readFromDisk ? [mergeBase] : [mergeBase, ctx.sourceBranch];
  const changed = new Map(); // file -> Set<line> | 'ALL'
  const deleted = [];

  for (const line of (runGit(['diff', '--name-status', '-M', ...range]) || '').split('\n').filter(Boolean)) {
    const parts = line.split('\t');
    if (parts[0][0] === 'D') { deleted.push(parts[1]); continue; }
    if (parts[0][0] === 'R') deleted.push(parts[1]); // ancien chemin d'un renommage
    changed.set(parts[parts.length - 1], new Set());
  }

  const diff = git(['diff', '-U0', '--no-color', '-M', ...range], { trim: false }).stdout || '';
  let current = null;
  for (const l of diff.split('\n')) {
    if (l.startsWith('+++ ')) {
      const p = l.slice(4).trim();
      current = p === '/dev/null' ? null : p.replace(/^b\//, '');
      if (current && !changed.has(current)) changed.set(current, new Set());
      continue;
    }
    const h = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(l);
    if (h && current) {
      const start = parseInt(h[1], 10);
      const count = h[2] === undefined ? 1 : parseInt(h[2], 10);
      const set = changed.get(current);
      for (let k = 0; k < count; k++) set.add(start + k);
    }
  }

  if (ctx.readFromDisk) {
    for (const f of (runGit(['ls-files', '--others', '--exclude-standard']) || '').split('\n').filter(Boolean)) {
      changed.set(f, 'ALL');
    }
  }
  return { changed, deleted: [...new Set(deleted)].filter(f => !changed.has(f)) };
}

// ============================================================
// 6. REVUE
// ============================================================
function isIgnored(f, project) {
  if (!f.line) return false;
  const text = project.read(f.file);
  if (!text) return false;
  const lines = text.split('\n');
  for (const l of [lines[f.line - 1], lines[f.line - 2]]) {
    const m = l && /doctor-ignore\b([\w\s,-]*)/.exec(l);
    if (!m) continue;
    const ids = m[1].split(/[\s,]+/).filter(s => /^[A-Z][A-Z0-9_]+$/.test(s));
    if (ids.length === 0 || ids.includes(f.type)) return true;
  }
  return false;
}

/**
 * Regroupe les règles « de style » répétitives pour ne pas noyer les vrais problèmes :
 *  - couleurs en dur : une seule entrée par fichier (avec la liste des lignes)
 *  - saut de ligne final manquant : une seule entrée pour tous les fichiers
 */
const GROUP_PER_FILE = new Set(['WXSS_HARDCODED_COLOR', 'WXSS_HARDCODED_TOKEN_VALUE']);
const GROUP_GLOBAL = new Set(['MISSING_FINAL_NEWLINE']);

function groupFindings(findings) {
  const out = [];
  const groups = new Map();
  for (const f of findings) {
    const perFile = GROUP_PER_FILE.has(f.type);
    const global = GROUP_GLOBAL.has(f.type);
    if (!perFile && !global) { out.push(f); continue; }
    const key = `${f.type}|${f.preexisting}|${perFile ? f.file : '*'}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  }
  for (const list of groups.values()) {
    if (list.length === 1) { out.push(list[0]); continue; }
    const first = list[0];
    if (GROUP_GLOBAL.has(first.type)) {
      out.push({ ...first, file: `(${list.length} fichiers)`, line: undefined, members: list,
        message: `${list.length} fichiers sans saut de ligne final : ${list.slice(0, 6).map(f => f.file).join(', ')}${list.length > 6 ? ', …' : ''}.` });
    } else {
      const lines = list.map(f => f.line);
      const examples = [...new Set(list.map(f => (f.message.match(/`([^`]+)`/) || [])[1]).filter(Boolean))].slice(0, 5);
      out.push({ ...first, line: lines[0], members: list,
        message: `${list.length} couleurs en dur (lignes ${lines.slice(0, 10).join(', ')}${lines.length > 10 ? ', …' : ''}) : ${examples.join(', ')}.` });
    }
  }
  return out;
}

function runFullReview(ctx, mergeBase, conflicts) {
  const rec = { fixHereOnSource: [], watchThereOnMerge: [], criticalShieldAlerts: [], findings: [], deletedFiles: [] };

  for (const conflict of conflicts) {
    const ext = path.extname(conflict.file).toLowerCase();
    if (conflict.kind !== 'content') {
      rec.watchThereOnMerge.push({ file: conflict.file, type: 'NON_CONTENT_CONFLICT',
        advice: `Conflit de type « ${conflict.kind} » : décidez explicitement si le fichier doit être conservé, supprimé ou renommé.` });
    }
    for (const block of conflict.blocks) {
      const our = block.ourContent;
      const their = block.theirContent;
      if (ext === '.json' && (our.includes('usingComponents') || their.includes('usingComponents'))) {
        rec.watchThereOnMerge.push({ file: conflict.file, type: 'JSON_USING_COMPONENTS',
          advice: 'Fusionnez les dictionnaires "usingComponents" : conservez les composants ajoutés par les deux branches.' });
      }
      if ((ext === '.js' || ext === '.ts') && (our.includes('_confirmedTxnid') || their.includes('_confirmedTxnid'))) {
        rec.criticalShieldAlerts.push({ file: conflict.file, type: 'SHIELD_DOUBLE_DEBIT',
          advice: '🛡️ BOUCLIER BANCAIRE : ne JAMAIS écraser `this._confirmedTxnid = txnid` lors de la réconciliation !' });
      }
    }
  }

  const project = buildProject(ctx);
  const { changed, deleted } = collectChanges(ctx, mergeBase);
  rec.deletedFiles = deleted;
  const touched = new Set([...changed.keys(), ...deleted]);

  // a. règles par fichier, sur les fichiers modifiés
  const raw = [];
  let tokens = null;
  for (const relPath of changed.keys()) {
    const content = project.read(relPath);
    if (content === null || !isAuditable(relPath, content)) continue;
    const ext = path.extname(relPath).toLowerCase();
    if (/\.(png|jpe?g|gif|webp|svg)$/.test(ext)) {
      raw.push(...auditAsset(relPath, content, project.size(relPath)));
      if (ext !== '.svg') continue;
    }
    if (ext === '.js' || ext === '.ts') {
      raw.push(...auditJsContent(relPath, content), ...auditJsQuality(relPath, content), ...auditMpJs(relPath, content));
    } else if (ext === '.wxml') {
      raw.push(...auditWxml(relPath, content));
    } else if (ext === '.wxss') {
      tokens = tokens || collectTokens(project);
      raw.push(...auditWxss(relPath, content, tokens));
    }
    if (ext !== '.svg') raw.push(...auditOtherFiles(relPath, content));
  }

  // b. contrôles croisés sur tout le projet
  const auditableProject = {
    files: new Set([...project.files].filter(f => isAuditable(f, null))),
    read: project.read,
    exists: project.exists
  };
  raw.push(...auditProject(auditableProject));

  // c. dédoublonnage, doctor-ignore, nouveau vs existant
  const seen = new Set();
  const isChangedLine = (file, from, to) => {
    const set = changed.get(file);
    if (!set) return false;
    if (set === 'ALL' || !from) return true;
    for (let l = from; l <= (to || from); l++) if (set.has(l)) return true;
    return false;
  };
  for (const f of raw) {
    const key = `${f.type}|${f.file}|${f.line}|${f.message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (isIgnored(f, project)) continue;
    f.fixable = Boolean(f.fixable);
    f.preexisting = !f.fileLevel
      && !isChangedLine(f.file, f.line, f.lineEnd)
      && !(f.related || []).some(r => touched.has(r));
    rec.findings.push(f);
  }
  rec.findings = groupFindings(rec.findings);
  rec.findings.sort((a, b) =>
    (a.preexisting - b.preexisting) || (SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    || a.file.localeCompare(b.file) || ((a.line || 0) - (b.line || 0)));

  const divergenceCount = runGit(['rev-list', '--count', `${ctx.sourceBranch}..${ctx.targetBranch}`]);
  if (divergenceCount && parseInt(divergenceCount, 10) > 0) {
    rec.fixHereOnSource.push({ type: 'BRANCH_OUT_OF_DATE', count: parseInt(divergenceCount, 10),
      advice: `Votre branche a ${divergenceCount} commit(s) de retard sur ${ctx.targetBranch}. Exécutez : \`git merge ${ctx.targetBranch}\` avant de pousser.` });
  }
  return rec;
}

// ============================================================
// 7. DÉTECTION DES BRANCHES
// ============================================================
function detectBranches(args) {
  const currentBranch = runGit(['branch', '--show-current']) || 'HEAD';
  let targetBranch = args[0];
  const sourceBranch = args[1] || currentBranch;
  if (!targetBranch) {
    const remotes = runGit(['branch', '-r']) || '';
    const locals = runGit(['branch']) || '';
    if (/\borigin\/develop\b/.test(remotes)) targetBranch = 'origin/develop';
    else if (/\borigin\/main\b/.test(remotes)) targetBranch = 'origin/main';
    else if (/(^|\s)develop$/m.test(locals)) targetBranch = 'develop';
    else targetBranch = 'main';
  }
  const readFromDisk = sourceBranch === currentBranch || sourceBranch === 'HEAD';
  return { sourceBranch, targetBranch, currentBranch, readFromDisk };
}

// ============================================================
// 8. AFFICHAGE
// ============================================================
const loc = (f) => (f.line ? `${f.file}:${f.line}` : f.file);

function countBySeverity(list) {
  const c = { CRITIQUE: 0, HAUTE: 0, MOYENNE: 0, INFO: 0 };
  list.forEach(f => { c[f.severity] = (c[f.severity] || 0) + 1; });
  return Object.entries(c).filter(([, n]) => n > 0).map(([s, n]) => `${SEVERITY_ICON[s]} ${n} ${s.toLowerCase()}`).join('  ');
}

function printFinding(f) {
  console.log(`  ${SEVERITY_ICON[f.severity]} [${f.severity}] ${f.type} — ${loc(f)}`);
  console.log(`     👉 ${f.message}`);
  console.log(`     💡 ${f.detail}`);
  if (f.fixable) console.log('     ✨ Auto-fix disponible : `node scripts/merge-doctor.js --fix`');
  console.log('');
}

function printReport(ctx, sim, rec, showAll) {
  const fresh = rec.findings.filter(f => !f.preexisting);
  const old = rec.findings.filter(f => f.preexisting);

  if (sim.conflicts.length > 0) {
    console.log(`🔴 ${sim.conflicts.length} CONFLIT(S) GIT PRÉDIT(S)`);
    console.log('----------------------------------------------------');
    sim.conflicts.forEach(c => console.log(`  ⚠️ ${c.file} [${c.kind}] (${c.blocks.length} bloc(s) de chevauchement)`));
    console.log('');
  } else {
    console.log(`🟢 Aucun conflit Git prédit avec ${ctx.targetBranch}.\n`);
  }
  for (const a of rec.criticalShieldAlerts) console.log(`  🛡️ ${a.file} : ${a.advice}`);
  for (const w of rec.watchThereOnMerge) console.log(`  🎯 ${w.file} : ${w.advice}`);
  if (rec.criticalShieldAlerts.length || rec.watchThereOnMerge.length) console.log('');

  if (fresh.length === 0) {
    console.log('🟢 REVUE : aucun problème détecté sur les lignes modifiées par la branche.');
    console.log('   (Analyse à règles : complète une revue humaine, ne la remplace pas.)\n');
  } else {
    console.log(`🧠 REVUE DES LIGNES MODIFIÉES — ${fresh.length} point(s) : ${countBySeverity(fresh)}`);
    console.log('----------------------------------------------------');
    fresh.forEach(printFinding);
  }

  if (old.length > 0) {
    const oldCrit = old.filter(f => f.severity === 'CRITIQUE');
    console.log(`📦 PROBLÈMES EXISTANTS (hors de vos modifications) — ${old.length} : ${countBySeverity(old)}`);
    if (showAll) {
      console.log('----------------------------------------------------');
      old.forEach(printFinding);
    } else {
      oldCrit.slice(0, 15).forEach(f => console.log(`  🚨 ${f.type} — ${loc(f)} : ${f.message}`));
      if (oldCrit.length > 15) console.log(`  … ${oldCrit.length - 15} autre(s) critique(s)`);
      console.log('  👉 Détail complet : `node scripts/merge-doctor.js --all`\n');
    }
  }

  if (rec.deletedFiles.length > 0) {
    console.log(`🗑️ FICHIERS SUPPRIMÉS : ${rec.deletedFiles.length} (références cassées vérifiées ci-dessus : images, composants, pages)\n`);
  }
  if (rec.fixHereOnSource.length > 0) {
    console.log('📍 ACTIONS RECOMMANDÉES SUR VOTRE BRANCHE :');
    rec.fixHereOnSource.forEach(r => console.log(`  👉 ${r.advice}`));
    console.log('');
  }
}

function writeMarkdownReport(ctx, sim, rec) {
  const reportPath = path.join(targetProjectDir, 'MERGE_PREFLIGHT_REPORT.md');
  const fresh = rec.findings.filter(f => !f.preexisting);
  const old = rec.findings.filter(f => f.preexisting);
  let md = '# 🩺 RAPPORT PRE-FLIGHT MERGE DOCTOR (KASSOGO)\n\n';
  md += `- **Branche source :** \`${ctx.sourceBranch}\`${ctx.readFromDisk ? ' (working tree)' : ''}\n`;
  md += `- **Branche cible :** \`${ctx.targetBranch}\`\n`;
  md += `- **Conflits Git :** ${sim.conflicts.length === 0 ? '🟢 AUCUN' : `🔴 ${sim.conflicts.length} conflit(s)`}\n`;
  md += `- **Revue des lignes modifiées :** ${fresh.length === 0 ? '🟢 RAS' : `${fresh.length} point(s) — ${countBySeverity(fresh)}`}\n`;
  md += `- **Problèmes existants :** ${old.length}\n\n`;
  md += '> Analyse statique à règles (sans LLM) : complète une revue humaine.\n\n';

  const section = (title, list) => {
    if (!list.length) return;
    md += `## ${title}\n\n`;
    list.forEach(f => {
      md += `### ${SEVERITY_ICON[f.severity]} [${f.severity}] ${f.type} — \`${loc(f)}\`\n`;
      md += `- **Problème :** ${f.message}\n- **Solution :** ${f.detail}\n\n`;
    });
  };
  if (sim.conflicts.length > 0) {
    md += '## 🔴 Conflits prédits\n\n';
    sim.conflicts.forEach(c => { md += `- \`${c.file}\` — ${c.kind} (${c.blocks.length} bloc(s))\n`; });
    md += '\n';
  }
  section('🧠 Lignes modifiées par la branche', fresh);
  section('📦 Problèmes existants', old);
  if (rec.fixHereOnSource.length > 0) {
    md += '## 📍 À faire sur votre branche\n\n';
    rec.fixHereOnSource.forEach(r => { md += `- ${r.advice}\n`; });
  }
  fs.writeFileSync(reportPath, md, 'utf8');
  console.log(`📄 Rapport Markdown enregistré dans : ${reportPath}\n`);
}

// ============================================================
// 9. SELF-TEST
// ============================================================
function selfTest() {
  console.log('🩺 Tests unitaires de merge-doctor.js...');
  const results = [];
  const check = (name, cond) => results.push({ name, ok: Boolean(cond) });
  const types = (issues) => issues.map(i => i.type);
  const js = (code) => types([...auditJsContent('t.js', code), ...auditJsQuality('t.js', code), ...auditMpJs('pages/t/t.js', code)]);
  const has = (code, type) => js(code).includes(type);

  // --- Fusion ---
  const legacy = parseMergeTreeOutput(`changed in both
  base   100644 1111111 pages/index/index.js
  our    100644 2222222 pages/index/index.js
  their  100644 3333333 pages/index/index.js
@@ -10,6 +10,12 @@
+<<<<<<< .our
    a
+=======
    b
+>>>>>>> .their
`);
  check('fusion: parser legacy', legacy.conflicts.length === 1 && legacy.conflicts[0].file === 'pages/index/index.js');
  const markers = parseConflictMarkers('a\n<<<<<<< ours\nX\n||||||| base\nB\n=======\nY\n>>>>>>> theirs\nz\n', 'f.js');
  check('fusion: marqueurs diff3', markers.length === 1 && markers[0].ourContent === 'X' && markers[0].theirContent === 'Y');

  // --- Métier ---
  check('A: doublon exact', has(`if (a === 'f') { x(); } else if (a === 'f') { y(); }`, 'DEAD_CODE_DUPLICATE_BRANCH'));
  check('A: couvert par ||', has(`if (a === 'c' || a === 'f') { x(); } else if (a === 'f') { y(); }`, 'DEAD_CODE_DUPLICATE_BRANCH'));
  check('A: parenthèses imbriquées', has(`if (ok(a) && b) { x(); } else if (ok(a) && b) { y(); }`, 'DEAD_CODE_DUPLICATE_BRANCH'));
  check('A: if imbriqué', has(`if (x === 1) { if (y) { z(); } } else if (x === 1) { w(); }`, 'DEAD_CODE_DUPLICATE_BRANCH'));
  check('A: pas de faux positif', !has(`if (a) { x(); }\nif (a) { y(); }\nconst s = "if (a) {} else if (a) {}";\nif (k === 'a)') { p(); } else if (k === 'b') { q(); }`, 'DEAD_CODE_DUPLICATE_BRANCH'));
  check('D: libellé', has("const i = offer.id === 'interurbain' || (offer.label && offer.label.toLowerCase().includes('interurbain'));", 'SHIELD_LABEL_BASED_CHECK_RISK'));
  check('C: clé sans destination', has(`// interurbain\nfunction buildOfferSealedKey(offer = {}, antenne = '') { return offer.id + antenne; }`, 'SHIELD_ROUTE_COLLISION'));
  check('C: clé avec destination', !has(`// interurbain\nfunction buildOfferSealedKey(offer = {}, a = '', destination = '') { return a + destination; }`, 'SHIELD_ROUTE_COLLISION'));
  check('F: reset absent du bloc', has(`onUnload() { this._confirmedTxnid = null; },\npay() { if (this._confirmedOfferKey !== key) { warn(); } }`, 'SHIELD_MISMATCH_STALE_SEAL_CLEANUP'));
  check('F: reset via helper', !has(`resetShield() { this._confirmedTxnid = null; },\npay() { if (this._confirmedOfferKey !== key) { this.resetShield(); } }`, 'SHIELD_MISMATCH_STALE_SEAL_CLEANUP'));
  check('F: commentaire ignoré', has(`pay() { if (this._confirmedOfferKey !== key) { /* this._confirmedTxnid = null; */ } }`, 'SHIELD_MISMATCH_STALE_SEAL_CLEANUP'));
  const sa = (css) => types(auditOtherFiles('x.wxss', css)).includes('WXSS_SAFE_AREA_MISSING');
  check('SafeArea: barre basse', sa('.bar { position: fixed; left: 0; bottom: 0; }'));
  check('SafeArea: autre bloc protégé ne masque pas celui-ci', sa('.ok { position: fixed; bottom: 0; padding-bottom: env(safe-area-inset-bottom); }\n.ko { position: fixed; left: 0; bottom: 0; }'));
  check('SafeArea: overlay ignoré', !sa('.mask { position: fixed; top: 0; bottom: 0; }'));
  check('SafeArea: padding-bottom: 0 ignoré', !sa('.pb-0 { padding-bottom: 0; } .x { position: fixed; top: 1px; }'));
  check('BOM', types(auditOtherFiles('x.js', '﻿const a = 1;')).includes('BOM_UTF8_DETECTED'));

  // --- Qualité ---
  check('catch vide', has('try { a(); } catch (e) {}', 'EMPTY_CATCH'));
  check('catch non vide OK', !has('try { a(); } catch (e) { log(e); }', 'EMPTY_CATCH'));
  check('égalité non stricte', has('if (a == 1) {}', 'LOOSE_EQUALITY'));
  check('== null toléré', !has('if (a == null) {}', 'LOOSE_EQUALITY'));
  check('debugger', has('function f() { debugger; }', 'DEBUGGER_LEFT'));
  check('PII dans log', has('console.log("user", msisdn);', 'PII_IN_LOGS'));
  check('PII: mot dans une chaîne ignoré', !has('console.log("saisir le msisdn");', 'PII_IN_LOGS'));
  check('secret en dur', has("const config = { apiKey: 'AbCdEf123456789xyz' };", 'HARDCODED_SECRET'));
  check('http non sécurisé', has("const u = 'http://api.samu.sn/v1';", 'INSECURE_HTTP'));
  check('http localhost toléré', !has("const u = 'http://localhost:3000';", 'INSECURE_HTTP'));
  check('JSON.parse non protégé', has('const d = JSON.parse(raw);', 'JSON_PARSE_UNGUARDED'));
  check('JSON.parse protégé OK', !has('try { const d = JSON.parse(raw); use(d); } catch (e) { log(e); }', 'JSON_PARSE_UNGUARDED'));
  check('loader non masqué', has('async load() { wx.showLoading({}); const r = await api(); wx.hideLoading(); use(r); }', 'LOADING_NOT_HIDDEN_ON_ERROR'));
  check('loader finally OK', !has('async load() { wx.showLoading({}); try { await api(); } finally { wx.hideLoading(); } }', 'LOADING_NOT_HIDDEN_ON_ERROR'));
  check('verrou hors finally', has('async pay() { this._isPaying = true; await api(); this._isPaying = false; }', 'LOCK_NOT_RELEASED_IN_FINALLY'));
  check('verrou en finally OK', !has('async pay() { this._isPaying = true; try { await api(); } finally { this._isPaying = false; } }', 'LOCK_NOT_RELEASED_IN_FINALLY'));
  check('verrou passé en relais OK', !has('async pay() { this._isPaying = true; await api(); }', 'LOCK_NOT_RELEASED_IN_FINALLY'));
  check('promesse flottante', has('async load() { await x(); },\nonShow() { this.load(); }', 'FLOATING_PROMISE'));
  check('promesse avec await OK', !has('async load() { await x(); },\nasync onShow() { await this.load(); }', 'FLOATING_PROMISE'));
  check('promesse auto-protégée (try/catch interne) OK', !has('async load() { set(); try { await x(); } catch (e) { log(e); } },\nonShow() { this.load(); }', 'FLOATING_PROMISE'));
  check('promesse avec .catch OK', !has('async load() { await x(); },\nonShow() { this.load().catch(log); }', 'FLOATING_PROMISE'));
  check('await manquant', has('async getUser() { return api(); },\nasync f() { const u = this.getUser(); show(u.name); }', 'MISSING_AWAIT'));
  check('Promise.all OK', !has('async getUser() { return api(); },\nasync f() { const p = this.getUser(); const [u] = await Promise.all([p]); show(u.name); }', 'MISSING_AWAIT'));
  check('variable inutilisée', has('function f() { const unused = 1; return 2; }', 'UNUSED_VARIABLE'));
  check('variable utilisée dans template OK', !has('function f() { const n = 1; return `x${n}`; }', 'UNUSED_VARIABLE'));
  check('spread compte comme usage', !has('function f() { const list = get(); return [a, ...list]; }', 'UNUSED_VARIABLE'));
  check('export const non signalé', !has('export const X = 1;', 'UNUSED_VARIABLE'));
  check('secret factice ignoré', !has("const c = { clientSecret: 'VOTRE_CLIENT_SECRET_ICI' };", 'HARDCODED_SECRET'));
  check('clé de storage ignorée', !has("const K = { ACCESS_TOKEN: 'app_access_token' };", 'HARDCODED_SECRET'));
  check('PII masquée OK', !has('console.log("id", maskSensitiveData(msisdn));', 'PII_IN_LOGS'));
  check('setData dans callback enregistré OK', !has('f() { keys.forEach((k) => { bus.onState(k, (v) => { this.setData({ [k]: v }); }); }); }', 'MP_SETDATA_IN_LOOP'));
  check('import inutilisé', has("const { a, b } = require('./x');\nmodule.exports = a;", 'UNUSED_IMPORT'));
  check('bloc dupliqué', has(Array(2).fill('const alpha = 1;\nconst beta = 2;\nconst gamma = 3;\nconst delta = 4;\nconst epsil = 5;\nconst zetaa = 6;\n').join('\nfoo();\n'), 'DUPLICATE_BLOCK'));

  // --- Mini-programme ---
  check('mutation this.data', has('onTap() { this.data.count = 2; }', 'MP_DATA_DIRECT_MUTATION'));
  check('push sur this.data', has('onTap() { this.data.list.push(1); }', 'MP_DATA_DIRECT_MUTATION'));
  check('comparaison this.data OK', !has('onTap() { if (this.data.count === 2) {} }', 'MP_DATA_DIRECT_MUTATION'));
  check('setData en boucle', has('f() { list.forEach(i => { this.setData({ a: i }); }); }', 'MP_SETDATA_IN_LOOP'));
  check('setInterval non nettoyé', has('onLoad() { this.t = setInterval(f, 1000); }', 'MP_INTERVAL_NOT_CLEARED'));
  check('wx.on sans off', has('onLoad() { wx.onNetworkStatusChange(f); }', 'MP_LISTENER_LEAK'));
  check('Bus.on non conservé', has("onLoad() { Bus.on('x', f); }", 'MP_LISTENER_LEAK'));
  check('Bus.on conservé OK', !has("onLoad() { this.u = [Bus.on('x', f)]; }", 'MP_LISTENER_LEAK'));
  check('wx.request sans fail', has("f() { wx.request({ url: 'https://a', success() {} }); }", 'MP_REQUEST_NO_FAIL'));
  check('wx:for sans key', types(auditWxml('p.wxml', '<view wx:for="{{list}}">{{item}}</view>')).includes('MP_FOR_NO_KEY'));
  check('wx:for avec key OK', !types(auditWxml('p.wxml', '<view wx:for="{{list}}" wx:key="id">{{item}}</view>')).length);

  // --- Règles issues des commentaires GitLab Duo de l'historique ---
  check('Duo: effet de bord dans observer', has("Component({ observers: { 'visible': function (v) { if (v) saveReceipt(this.data.r); } } });", 'MP_OBSERVER_SIDE_EFFECT'));
  check('Duo: observer pur OK', !has("Component({ observers: { 'v': function (v) { this.setData({ open: v }); } } });", 'MP_OBSERVER_SIDE_EFFECT'));
  check('Duo: code JS commenté', has("f() {\n  // wx.reLaunch({ url: '/pages/x/index' });\n  a();\n}", 'COMMENTED_OUT_CODE'));
  check('Duo: commentaire de prose OK', !has('f() {\n  // On recharge la liste après paiement\n  a();\n}', 'COMMENTED_OUT_CODE'));
  const wx = (t) => types(auditWxml('p.wxml', t));
  check('Duo: code WXML commenté', wx('<view>\n<!-- <view bind:tap="goBack">x</view> -->\n</view>').includes('COMMENTED_OUT_CODE'));
  check('Duo: commentaire WXML de prose OK', !wx('<!-- Bannière transport -->\n<view/>').includes('COMMENTED_OUT_CODE'));
  check('Duo: fausse donnée de démo', wx("<text>{{ receipt.reference || 'SAMU-MS60Y4601' }}</text>").includes('MP_WXML_DEMO_FALLBACK'));
  check('Duo: repli neutre OK', !wx("<text>{{ receipt.reference || '-' }}</text>").includes('MP_WXML_DEMO_FALLBACK'));
  const tok = new Map([['--samu-border', new Set(['#dfe3ee'])], ['--samu-primary', new Set(['#2a428c'])]]);
  const wxss = (css) => types(auditWxss('c.wxss', css, tok));
  check('Duo: repli de token divergent', wxss('.a { border: 2rpx solid var(--samu-border, #1E293B); }').includes('WXSS_TOKEN_FALLBACK_MISMATCH'));
  check('Duo: repli de token aligné OK', !wxss('.a { border: 2rpx solid var(--samu-border, #DFE3EE); }').length);
  check('Duo: couleur en dur dans fichier à tokens', wxss('.a { color: var(--samu-primary); background: var(--x, #fff); margin: var(--m, 0); border: 2rpx solid #1E293B; }').includes('WXSS_HARDCODED_COLOR'));
  check('couleur en dur sans tokens dans le fichier OK', !wxss('.a { border: 2rpx solid #1E293B; }').includes('WXSS_HARDCODED_COLOR'));
  check('Duo: scellement sur id seul', has('pay() { if (this._confirmedOfferId && this._confirmedOfferId !== offer.id) { this._confirmedTxnid = null; } }', 'SHIELD_BINDING_ID_ONLY'));
  check('Duo: mismatch id sans reset (impasse)', has('pay() { if (this._confirmedOfferId !== offer.id) { wx.showModal({}); return; } }', 'SHIELD_MISMATCH_STALE_SEAL_CLEANUP'));
  check('Duo: montant de repli en dur', has("const r = { montant: offer ? offer.price : '10 000 F' };", 'HARDCODED_AMOUNT_FALLBACK'));
  check('montant dans données d\'offre OK', !has("const OFFERS = [{ id: 'a', price: '5 000 F' }];", 'HARDCODED_AMOUNT_FALLBACK'));
  check('Duo: couleur en dur = token', wxss('.a { color: #2A428C; }').includes('WXSS_HARDCODED_TOKEN_VALUE'));
  check('token indéfini sans repli', wxss('.a { color: var(--samu-nope); }').includes('WXSS_TOKEN_UNDEFINED'));
  check('Duo: saut de ligne final manquant', types(auditOtherFiles('a.json', '{}')).includes('MISSING_FINAL_NEWLINE'));
  check('Duo: SVG encapsulant un PNG', types(auditAsset('a.svg', '<svg><image href="data:image/png;base64,AAAA"/></svg>', 100)).includes('ASSET_SVG_WRAPS_RASTER'));
  check('Duo: métadonnées Photoshop', types(auditAsset('a.png', '\x89PNG....<x:xmpmeta xmlns:x="adobe:ns:meta/">', 100)).includes('ASSET_METADATA_BLOAT'));
  check('image trop lourde', types(auditAsset('a.png', '\x89PNG', 500 * 1024)).includes('ASSET_TOO_LARGE'));

  // --- Cohérence projet ---
  const mem = {
    'app.json': JSON.stringify({ pages: ['pages/home/index', 'pages/list/index', 'pages/ghost/index'], tabBar: { list: [{ pagePath: 'pages/home/index' }] } }, null, 2),
    'pages/home/index.json': JSON.stringify({ usingComponents: { 'app-card': '/components/card/index', 'app-old': '/components/old/index', 'app-unused': '/components/card/index' } }, null, 2),
    'pages/home/index.wxml': '<view bindtap="onTap"><app-card/><app-old/><app-x/>\n<image src="/assets/missing.png"/><image src="/assets/ok.png"/>\n<view bind:tap="ghostHandler"/></view>',
    'pages/home/index.js': "const b = require('./mixin');\nPage({ onTap() { wx.switchTab({ url: '/pages/list/index' }); wx.navigateTo({ url: '/pages/home/index' }); wx.navigateTo({ url: '/pages/nope/index' }); } });",
    'pages/home/mixin.js': 'module.exports = { fromMixin() {} };',
    'pages/list/index.js': 'Page({});',
    'pages/list/index.wxml': '<view/>',
    'components/card/index.js': 'Component({});',
    'components/card/index.json': '{"component": true}',
    'assets/ok.png': 'x'
  };
  const proj = { files: new Set(Object.keys(mem)), read: (p) => (p in mem ? mem[p] : null), exists: (p) => p in mem };
  const pt = types(auditProject(proj));
  check('projet: lazyCodeLoading absent', pt.includes('MP_LAZY_CODE_LOADING_MISSING'));
  const memOk = { ...mem, 'app.json': JSON.stringify({ pages: [], lazyCodeLoading: 'requiredComponents' }) };
  check('projet: lazyCodeLoading présent OK', !types(auditProject({ files: new Set(Object.keys(memOk)), read: (p) => (p in memOk ? memOk[p] : null), exists: (p) => p in memOk })).includes('MP_LAZY_CODE_LOADING_MISSING'));
  check('projet: page sans fichiers', pt.includes('MP_PAGE_FILES_MISSING'));
  check('projet: chemin composant cassé', pt.includes('MP_COMPONENT_PATH_MISSING'));
  check('projet: composant non déclaré', pt.includes('MP_COMPONENT_NOT_DECLARED'));
  check('projet: composant inutilisé', pt.includes('MP_COMPONENT_UNUSED'));
  check('projet: handler manquant', pt.filter(t => t === 'MP_HANDLER_MISSING').length === 1);
  check('projet: image manquante', pt.filter(t => t === 'MP_ASSET_MISSING').length === 1);
  check('projet: route inexistante', pt.includes('MP_ROUTE_MISSING'));
  check('projet: mauvaise API de navigation', pt.filter(t => t === 'MP_ROUTE_WRONG_API').length === 2);

  for (const r of results) console.log(`  ${r.ok ? '✅' : '❌'} ${r.name}`);
  const failed = results.filter(r => !r.ok).length;
  console.log(failed ? `\n❌ ${failed}/${results.length} test(s) en échec.` : `\n✅ ${results.length} tests réussis.`);
  process.exit(failed ? 1 : 0);
}

// ============================================================
// 10. POINT D'ENTRÉE
// ============================================================
function main() {
  if (process.argv.includes('--self-test')) return selfTest();

  const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const isJsonOutput = process.argv.includes('--json');
  const isSaveReport = process.argv.includes('--report');
  const isAutoFix = process.argv.includes('--fix');
  const showAll = process.argv.includes('--all');

  const ctx = detectBranches(args);

  if (!isJsonOutput) {
    console.log('====================================================');
    console.log('🩺 PRE-FLIGHT MERGE DOCTOR PRO (KASSOGO)');
    console.log('🔍 Simulation de fusion + revue statique (métier, qualité, sécurité, mini-programme)');
    console.log(`🌿 Branche source : ${ctx.sourceBranch}${ctx.readFromDisk ? ' (working tree)' : ''}`);
    console.log(`🎯 Branche cible  : ${ctx.targetBranch}`);
    console.log('====================================================\n');
  }

  const mergeBase = runGit(['merge-base', ctx.targetBranch, ctx.sourceBranch]);
  if (!mergeBase) {
    console.error(`❌ Impossible de calculer le merge-base entre ${ctx.targetBranch} et ${ctx.sourceBranch}. Les branches existent-elles (git fetch) ?`);
    process.exit(2);
  }
  const sim = simulateMerge(ctx.targetBranch, ctx.sourceBranch, mergeBase);
  if (!sim) {
    console.error('❌ Échec de la simulation git merge-tree.');
    process.exit(2);
  }

  const rec = runFullReview(ctx, mergeBase, sim.conflicts);

  if (isAutoFix && rec.findings.some(f => f.fixable)) {
    if (!ctx.readFromDisk) {
      console.log(`⚠️ --fix ignoré : la source (${ctx.sourceBranch}) n'est pas la branche courante (${ctx.currentBranch}).\n`);
    } else {
      console.log('🛠️ APPLICATION DES AUTO-CORRECTIONS...');
      const applied = applyAutoFixes(rec.findings.flatMap(f => f.members || [f]));
      console.log(`✨ ${applied} correction(s) appliquée(s). Relancez l'outil pour vérifier.\n`);
    }
  }

  const newCritical = rec.findings.filter(f => !f.preexisting && f.severity === 'CRITIQUE');
  const exitCode = (sim.conflicts.length > 0 || newCritical.length > 0) ? 1 : 0;

  if (isJsonOutput) {
    console.log(JSON.stringify({ ...ctx, engine: sim.engine, ...sim, ...rec, exitCode }, null, 2));
    process.exit(exitCode);
  }
  printReport(ctx, sim, rec, showAll);
  if (isSaveReport) writeMarkdownReport(ctx, sim, rec);
  process.exit(exitCode);
}

main();
