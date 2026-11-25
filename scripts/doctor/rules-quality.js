/**
 * Règles de QUALITÉ JavaScript génériques — les catégories que GitLab Duo commente
 * le plus souvent en revue de MR : promesses, gestion d'erreurs, verrous, sécurité,
 * code mort, duplication.
 */
const {
  maskCode, findClosing, skipWs, prevNonWs, prevWord, makeLineIndex,
  extractFunctions, findBlocks, isInside, enclosingFn, escapeRe, countIdent
} = require('./parse');

const PII_WORDS = /\b(msisdn|phone|phoneNumber|telephone|tel|password|passwd|pwd|token|accessToken|refreshToken|otp|pin|cvv|iban)\b/i;

function auditJsQuality(relPath, content) {
  const issues = [];
  const masked = maskCode(content);
  const lineOf = makeLineIndex(content);
  const fns = extractFunctions(masked, lineOf);
  const tries = findBlocks(masked, 'try');
  const catches = findBlocks(masked, 'catch');
  const finals = findBlocks(masked, 'finally');
  const add = (o) => issues.push({ file: relPath, category: 'qualité', ...o });
  const inComment = (idx) => masked[idx] === ' ' && content[idx] !== ' ';
  const inString = (idx) => masked[idx] === '_' && content[idx] !== '_';

  // 1. catch vide : l'erreur est avalée
  for (const b of catches) {
    if (masked.slice(b.start + 1, b.end).trim() === '') {
      add({
        line: lineOf(b.kwIndex), type: 'EMPTY_CATCH', severity: 'MOYENNE',
        message: 'Bloc `catch` vide : l\'erreur est avalée silencieusement.',
        detail: 'Journalisez l\'erreur, informez l\'utilisateur (wx.showToast) ou relancez-la. Si c\'est voulu, ajoutez un commentaire `// doctor-ignore EMPTY_CATCH`.'
      });
    }
  }

  // 2. Égalité non stricte
  {
    const re = /[^=!<>]([=!]=)(?!=)/g;
    let m;
    while ((m = re.exec(masked)) !== null) {
      const idx = m.index + 1;
      const around = masked.slice(Math.max(0, idx - 6), idx + 8);
      if (/null|undefined/.test(around)) continue; // `x == null` est un idiome accepté
      add({
        line: lineOf(idx), type: 'LOOSE_EQUALITY', severity: 'INFO',
        message: `Comparaison non stricte \`${m[1]}\`.`,
        detail: `Utilisez \`${m[1]}=\` pour éviter les conversions implicites (ex : '0' == 0).`
      });
    }
  }

  // 3. debugger / console.log oubliés
  for (const m of masked.matchAll(/\bdebugger\b/g)) {
    add({ line: lineOf(m.index), type: 'DEBUGGER_LEFT', severity: 'HAUTE',
      message: 'Instruction `debugger` oubliée.', detail: 'À supprimer avant la fusion.' });
  }
  for (const m of masked.matchAll(/\bconsole\.log\s*\(/g)) {
    add({ line: lineOf(m.index), type: 'CONSOLE_LOG_LEFT', severity: 'INFO',
      message: '`console.log` laissé dans le code.', detail: 'Supprimez-le ou utilisez le logger du projet (console.warn/error pour les vrais cas).' });
  }

  // 4. Données personnelles dans les logs
  for (const m of masked.matchAll(/\bconsole\.(log|info|warn|error|debug)\s*\(/g)) {
    const open = m.index + m[0].length - 1;
    const close = findClosing(masked, open, '(', ')');
    if (close < 0) continue;
    const args = masked.slice(open + 1, close); // chaînes masquées : seuls les identifiants comptent
    const hit = args.match(PII_WORDS);
    if (hit && !/\b\w*(mask|redact|hash|anonymi[sz]e|obfuscate)\w*\s*\(/i.test(args)) {
      add({ line: lineOf(m.index), type: 'PII_IN_LOGS', severity: 'HAUTE', category: 'sécurité',
        message: `Donnée sensible (\`${hit[1]}\`) potentiellement écrite dans les logs.`,
        detail: 'Masquez la valeur (ex : 77****12) ou retirez-la du log : les logs TCMPP sont remontés côté plateforme.' });
    }
  }

  // 5. Secrets en dur
  {
    const re = /\b(api[_-]?key|apikey|secret|client[_-]?secret|access[_-]?token|auth[_-]?token|password|passwd|private[_-]?key|app[_-]?secret)\b['"]?\s*[:=]\s*(['"`])([^'"`\s]{8,})\2/gi;
    let m;
    while ((m = re.exec(content)) !== null) {
      if (inComment(m.index)) continue;
      if (/\.example\.|\.sample\.|\.template\./i.test(relPath)) continue;
      const value = m[3];
      // valeurs factices
      if (/^(x{3,}|<|\$\{|process\.env)/i.test(value)
        || /(^|[_-])(your|votre|ici|here|example|exemple|placeholder|changeme|dummy|fake|todo)([_-]|$)/i.test(value)) continue;
      // noms de clés (ex : 'app_access_token' = clé de storage, pas un secret)
      if (/^[a-z][a-z_.:-]*$/.test(value) || /^[A-Z][A-Z_.:-]*$/.test(value)) continue;
      add({ line: lineOf(m.index), type: 'HARDCODED_SECRET', severity: 'CRITIQUE', category: 'sécurité',
        message: `Secret en dur probable (\`${m[1]}\`).`,
        detail: 'Ne commitez jamais de secret : passez par la configuration serveur / le backend. Révoquez la valeur si elle a déjà été poussée.' });
    }
    for (const mm of content.matchAll(/-----BEGIN [A-Z ]*PRIVATE KEY-----|Bearer\s+[A-Za-z0-9\-_.]{24,}/g)) {
      if (inComment(mm.index)) continue;
      add({ line: lineOf(mm.index), type: 'HARDCODED_SECRET', severity: 'CRITIQUE', category: 'sécurité',
        message: 'Clé privée ou jeton Bearer en dur.', detail: 'À retirer et révoquer immédiatement.' });
    }
  }

  // 6. URL non HTTPS
  for (const m of content.matchAll(/http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0|10\.|192\.168\.)[^\s'"`]+/g)) {
    if (!inString(m.index)) continue;
    add({ line: lineOf(m.index), type: 'INSECURE_HTTP', severity: 'HAUTE', category: 'sécurité',
      message: `URL non sécurisée \`${m[0]}\`.`,
      detail: 'WeChat/TCMPP n\'autorise que des domaines HTTPS déclarés : la requête échouera en production.' });
  }

  // 7. JSON.parse hors try
  for (const m of masked.matchAll(/\bJSON\.parse\s*\(/g)) {
    if (isInside(m.index, tries)) continue;
    add({ line: lineOf(m.index), type: 'JSON_PARSE_UNGUARDED', severity: 'MOYENNE',
      message: '`JSON.parse` sans `try/catch`.', detail: 'Une donnée corrompue (storage, réponse serveur) fera planter la page. Entourez d\'un try/catch avec une valeur par défaut.' });
  }

  // 8. Loading jamais masqué en cas d'erreur
  {
    const hideHelpers = new Set(fns.filter(f => /hideLoading/.test(f.bodyMasked)).map(f => f.name));
    const blocksHide = (b) => {
      const t = masked.slice(b.start, b.end + 1);
      return /hideLoading/.test(t) || [...t.matchAll(/this\.([\w$]+)\s*\(/g)].some(x => hideHelpers.has(x[1]));
    };
    for (const m of masked.matchAll(/\bwx\.showLoading\s*\(/g)) {
      const fn = enclosingFn(fns, m.index);
      if (!fn) continue;
      const after = masked.slice(m.index, fn.end);
      if (!/\bawait\b/.test(after)) continue;
      const guards = [...catches, ...finals].filter(b => b.start > fn.start && b.end < fn.end);
      if (guards.some(blocksHide)) continue;
      add({ line: lineOf(m.index), type: 'LOADING_NOT_HIDDEN_ON_ERROR', severity: 'HAUTE',
        message: '`wx.showLoading` suivi d\'un `await` sans `wx.hideLoading` dans un catch/finally.',
        detail: 'Si la promesse échoue, le loader (mask: true) reste affiché et bloque l\'écran. Appelez `wx.hideLoading()` dans un `finally`.' });
    }
  }

  // 9. Verrou (flag) non libéré dans un finally
  for (const fn of fns) {
    for (const m of fn.bodyMasked.matchAll(/this\.([\w$]+)\s*=\s*true\b/g)) {
      const abs = fn.start + m.index;
      if (enclosingFn(fns, abs) !== fn) continue;
      if (!/\bawait\b/.test(fn.bodyMasked.slice(m.index))) continue;
      const resetRe = new RegExp(`this\\.${escapeRe(m[1])}\\s*=\\s*false\\b`, 'g');
      const resets = [...fn.bodyMasked.matchAll(resetRe)].map(r => fn.start + r.index);
      if (resets.length === 0) continue; // libéré ailleurs : passage de relais volontaire
      const fin = finals.filter(b => b.start > fn.start && b.end < fn.end);
      if (resets.some(r => isInside(r, fin))) continue;
      add({ line: lineOf(abs), type: 'LOCK_NOT_RELEASED_IN_FINALLY', severity: 'HAUTE',
        message: `Le verrou \`this.${m[1]}\` est remis à false hors d'un \`finally\`.`,
        detail: `Si un \`await\` lève une exception, \`${m[1]}\` reste à true et l'action est bloquée jusqu'au rechargement. Déplacez \`this.${m[1]} = false\` dans un \`finally\`.` });
    }
  }

  // 10. Promesses flottantes et await manquant (méthodes async du même fichier)
  {
    const asyncNames = new Set(fns.filter(f => f.isAsync).map(f => f.name));
    // méthode async « auto-protégée » : chaque await est dans un try qui a un catch → appel sans await sans risque
    const selfGuarded = new Set(fns.filter(f => {
      if (!f.isAsync) return false;
      const fTries = tries.filter(b => b.start > f.start && b.end < f.end)
        .filter(b => /^\s*catch\b/.test(masked.slice(b.end + 1, b.end + 40)));
      const awaits = [...f.bodyMasked.matchAll(/\bawait\b/g)].map(a => f.start + a.index);
      return awaits.length > 0 && awaits.every(a => isInside(a, fTries));
    }).map(f => f.name));
    for (const m of masked.matchAll(/this\.([\w$]+)\s*\(/g)) {
      if (!asyncNames.has(m[1])) continue;
      const open = m.index + m[0].length - 1;
      const close = findClosing(masked, open, '(', ')');
      if (close < 0) continue;
      const next = masked.slice(skipWs(masked, close + 1), skipWs(masked, close + 1) + 9);
      if (/^\.(then|catch|finally)\b/.test(next)) continue;

      const prev = prevNonWs(masked, m.index);
      const word = prevWord(masked, m.index);
      const statementStart = ['', ';', '{', '}', ')'].includes(prev.ch) || word === 'else';
      if (statementStart) {
        if (selfGuarded.has(m[1])) continue;
        add({ line: lineOf(m.index), type: 'FLOATING_PROMISE', severity: 'MOYENNE',
          message: `Appel de la méthode async \`this.${m[1]}()\` sans \`await\` ni \`.catch()\`.`,
          detail: 'Une erreur deviendra une "unhandled rejection" invisible et l\'ordre d\'exécution n\'est pas garanti. Ajoutez `await` (dans un try) ou `.catch(...)`.' });
        continue;
      }
      // const x = this.asyncFn(...)  puis  x.prop  => await manquant
      const decl = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*$/.exec(masked.slice(Math.max(0, m.index - 80), m.index));
      if (decl) {
        const name = decl[1];
        const fn = enclosingFn(fns, m.index);
        const rest = masked.slice(close, fn ? fn.end : masked.length);
        const propUse = new RegExp(`(?<![\\w$.])${escapeRe(name)}\\.(?!then\\b|catch\\b|finally\\b)[\\w$]`).test(rest);
        const awaited = new RegExp(`\\bawait\\s+${escapeRe(name)}\\b|Promise\\.(all|allSettled|race|any)\\s*\\(`).test(rest);
        if (propUse && !awaited) {
          add({ line: lineOf(m.index), type: 'MISSING_AWAIT', severity: 'HAUTE',
            message: `\`${name}\` reçoit une Promise (\`this.${m[1]}()\` est async) mais est utilisé comme une valeur.`,
            detail: `Ajoutez \`await\` : \`const ${name} = await this.${m[1]}(...)\`. Sinon \`${name}.xxx\` vaut undefined.` });
        }
      }
    }
  }

  // 11. Variables et imports inutilisés
  {
    const reported = new Set();
    const checkNames = (names, scopeText, line, kind) => {
      for (const name of names) {
        if (!name || name.startsWith('_') || reported.has(`${line}:${name}`)) continue;
        if (countIdent(scopeText, name) <= 1) {
          reported.add(`${line}:${name}`);
          add({ line, type: kind === 'import' ? 'UNUSED_IMPORT' : 'UNUSED_VARIABLE', severity: 'INFO',
            message: `${kind === 'import' ? 'Import' : 'Variable'} \`${name}\` déclaré(e) mais jamais utilisé(e).`,
            detail: 'Supprimez-le pour alléger le code (et le paquet du mini-programme).' });
        }
      }
    };
    const patternNames = (pat) => pat.split(',')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('...'))
      .map(s => s.split('=')[0].trim())
      .map(s => (s.includes(':') ? s.split(':')[1].trim() : s))
      .filter(s => /^[A-Za-z_$][\w$]*$/.test(s));

    const declRe = /\b(?:const|let|var)\s+(?:([A-Za-z_$][\w$]*)|\{([^{}]*)\}|\[([^[\]]*)\])\s*=\s*(require\s*\()?/g;
    let m;
    while ((m = declRe.exec(masked)) !== null) {
      if (/\bexport\s+$/.test(masked.slice(Math.max(0, m.index - 20), m.index))) continue; // exporté = utilisé ailleurs
      const names = m[1] ? [m[1]] : patternNames(m[2] || m[3] || '');
      const fn = enclosingFn(fns, m.index);
      const isImport = Boolean(m[4]) && !fn;
      checkNames(names, fn ? fn.bodyMasked : masked, lineOf(m.index), isImport ? 'import' : 'var');
    }
    const importRe = /\bimport\s+(?:([A-Za-z_$][\w$]*)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s/g;
    while ((m = importRe.exec(masked)) !== null) {
      const names = [m[1], ...patternNames((m[2] || '').replace(/\bas\b/g, ':'))].filter(Boolean);
      checkNames(names, masked, lineOf(m.index), 'import');
    }
  }

  // 12. TODO / FIXME
  for (const m of content.matchAll(/\b(TODO|FIXME|HACK|XXX)\b/g)) {
    if (!inComment(m.index)) continue;
    add({ line: lineOf(m.index), type: 'TODO_LEFT', severity: 'INFO',
      message: `Marqueur \`${m[1]}\` dans le code.`, detail: 'Créez un ticket ou traitez-le avant la fusion.' });
  }

  // 13. Fonction trop longue
  for (const fn of fns) {
    const len = fn.endLine - fn.line;
    // on ne signale que la fonction la plus externe si plusieurs imbriquées dépassent le seuil
    const outerAlsoLong = fns.some(o => o !== fn && o.start < fn.start && o.end > fn.end && o.endLine - o.line > 100);
    if (len > 100 && !outerAlsoLong) {
      add({ line: fn.line, lineEnd: fn.endLine, type: 'FUNCTION_TOO_LONG', severity: 'INFO',
        message: `\`${fn.name}\` fait ${len} lignes.`,
        detail: 'Découpez-la en fonctions plus petites (préparation / appel / affichage) pour la rendre testable et relisible.' });
    }
  }

  // 14. Blocs dupliqués (6 lignes significatives identiques)
  {
    const W = 6;
    const lines = content.split('\n');
    const mlines = masked.split('\n');
    const sig = [];
    lines.forEach((l, i) => {
      if (!mlines[i] || mlines[i].trim() === '') return; // ligne vide ou commentaire
      const norm = l.replace(/\s+/g, '');
      if (norm.length < 8 || /^[\]\)\}\{;,]+$/.test(norm)) return;
      sig.push({ norm, line: i + 1 });
    });
    const seen = new Map();
    for (let i = 0; i + W <= sig.length; i++) {
      const key = sig.slice(i, i + W).map(s => s.norm).join('\n');
      const j = seen.get(key);
      if (j !== undefined && sig[j + W - 1].line < sig[i].line) {
        add({ line: sig[i].line, lineEnd: sig[i + W - 1].line, type: 'DUPLICATE_BLOCK', severity: 'INFO',
          message: `Lignes ${sig[i].line}–${sig[i + W - 1].line} identiques aux lignes ${sig[j].line}–${sig[j + W - 1].line}.`,
          detail: 'Extrayez une fonction partagée : une correction future ne devra être faite qu\'une fois.' });
        i += W - 1;
        continue;
      }
      if (j === undefined) seen.set(key, i);
    }
  }

  // 15. Code commenté (bloc de lignes `// code;`)
  {
    const lines = content.split('\n');
    const codeLike = (t) => {
      t = t.trim();
      if (!t || /^(TODO|FIXME|NOTE|HACK|XXX|eslint|@|=|-|#|\*)/i.test(t)) return false;
      return /^(const|let|var)\s+[\w${[]+\s*=|^(if|for|while|switch)\s*\(|^return\b.*;$|^(this|wx|console|await)\b[\w$.]*\s*[.(=]|^(import|export)\s|^\}\s*(else|catch|\)|;|$)/.test(t)
        || /^[\w$.]+\s*\(.*\)\s*;$/.test(t);
    };
    let blockStart = null;
    lines.forEach((l, i) => {
      const m = /^\s*\/\/\s?(.*)$/.exec(l);
      const isCode = m && codeLike(m[1]);
      if (isCode && blockStart === null) blockStart = i + 1;
      if (!isCode && blockStart !== null) {
        add({ line: blockStart, lineEnd: i, type: 'COMMENTED_OUT_CODE', severity: 'INFO',
          message: `Code commenté (ligne${i + 1 - blockStart > 1 ? 's' : ''} ${blockStart}${i > blockStart ? '–' + i : ''}).`,
          detail: 'Supprimez-le : l\'historique Git le conserve. S\'il doit revenir, protégez-le par un flag de config.' });
        blockStart = null;
      }
    });
  }

  // 16. var
  for (const m of masked.matchAll(/(?<![\w$.])var\s+[A-Za-z_$]/g)) {
    add({ line: lineOf(m.index), type: 'VAR_DECLARATION', severity: 'INFO',
      message: 'Déclaration `var`.', detail: 'Préférez `const` / `let` (portée de bloc).' });
  }

  return issues;
}

module.exports = { auditJsQuality };
