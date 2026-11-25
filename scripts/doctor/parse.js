/**
 * Helpers d'analyse de code sans dépendance (pas d'AST complet, mais structure fiable :
 * parenthèses / accolades équilibrées, chaînes et commentaires ignorés).
 */

/**
 * Copie de même longueur : commentaires → espaces, contenu des chaînes → '_'.
 * Les expressions `${...}` des template literals sont CONSERVÉES (ce sont du code).
 * Limite connue : les littéraux regex (/.../) ne sont pas masqués.
 */
function maskCode(src) {
  const out = src.split('');
  const n = src.length;
  let i = 0;
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === '/' && d === '/') {
      while (i < n && src[i] !== '\n') { out[i] = ' '; i++; }
      continue;
    }
    if (c === '/' && d === '*') {
      out[i] = ' '; out[i + 1] = ' '; i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] !== '\n') out[i] = ' ';
        i++;
      }
      if (i < n) { out[i] = ' '; out[i + 1] = ' '; i += 2; }
      continue;
    }
    if (c === '`') {
      i++;
      while (i < n && src[i] !== '`') {
        if (src[i] === '\\') {
          out[i] = '_';
          if (i + 1 < n && src[i + 1] !== '\n') out[i + 1] = '_';
          i += 2;
          continue;
        }
        if (src[i] === '$' && src[i + 1] === '{') {
          // expression conservée telle quelle
          let depth = 0;
          i++;
          while (i < n) {
            if (src[i] === '{') depth++;
            else if (src[i] === '}') { depth--; if (depth === 0) { i++; break; } }
            i++;
          }
          continue;
        }
        if (src[i] !== '\n') out[i] = '_';
        i++;
      }
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      const q = c;
      i++;
      while (i < n && src[i] !== q) {
        if (src[i] === '\\') {
          out[i] = '_';
          if (i + 1 < n && src[i + 1] !== '\n') out[i + 1] = '_';
          i += 2;
          continue;
        }
        if (src[i] === '\n') break; // chaîne non terminée
        out[i] = '_';
        i++;
      }
      i++;
      continue;
    }
    i++;
  }
  return out.join('');
}

/** Index du caractère fermant correspondant à `masked[openIdx]`, ou -1. */
function findClosing(masked, openIdx, open, close) {
  let depth = 0;
  for (let i = openIdx; i < masked.length; i++) {
    if (masked[i] === open) depth++;
    else if (masked[i] === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function skipWs(masked, i) {
  while (i < masked.length && /\s/.test(masked[i])) i++;
  return i;
}

/** Dernier caractère non blanc avant `i` (et son index). */
function prevNonWs(masked, i) {
  let j = i - 1;
  while (j >= 0 && /\s/.test(masked[j])) j--;
  return { ch: j >= 0 ? masked[j] : '', idx: j };
}

/** Mot (identifiant) qui se termine juste avant `i`, en ignorant les blancs. */
function prevWord(masked, i) {
  const { idx } = prevNonWs(masked, i);
  let j = idx;
  while (j >= 0 && /[\w$]/.test(masked[j])) j--;
  return masked.slice(j + 1, idx + 1);
}

/** Fin d'une instruction sans accolades (ex : `if (x) foo();`). */
function findStatementEnd(masked, i) {
  let depth = 0;
  for (; i < masked.length; i++) {
    const c = masked[i];
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') {
      if (depth === 0) return i - 1;
      depth--;
    } else if (c === ';' && depth === 0) return i;
  }
  return masked.length - 1;
}

function makeLineIndex(src) {
  const starts = [0];
  for (let i = 0; i < src.length; i++) if (src[i] === '\n') starts.push(i + 1);
  return (idx) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= idx) lo = mid; else hi = mid - 1;
    }
    return lo + 1;
  };
}

function stripOuterParens(s) {
  while (s.startsWith('(') && s.endsWith(')')) {
    let depth = 0;
    let closesAtEnd = true;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '(') depth++;
      else if (s[i] === ')') {
        depth--;
        if (depth === 0 && i < s.length - 1) { closesAtEnd = false; break; }
      }
    }
    if (!closesAtEnd) break;
    s = s.slice(1, -1);
  }
  return s;
}

function normalizeCond(raw) {
  return stripOuterParens(raw.replace(/\s+/g, '').replace(/"/g, "'"));
}

/** Découpe une condition sur les `||` de premier niveau. */
function splitTopLevelOr(cond, condMasked) {
  const terms = [];
  let depth = 0;
  let last = 0;
  for (let i = 0; i < condMasked.length; i++) {
    const c = condMasked[i];
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') depth--;
    else if (c === '|' && condMasked[i + 1] === '|' && depth === 0) {
      terms.push(cond.slice(last, i));
      last = i + 2;
      i++;
    }
  }
  terms.push(cond.slice(last));
  return terms.map(normalizeCond).filter(Boolean);
}

/** Chaînes `if / else if / ...` avec conditions et corps équilibrés. */
function scanIfChains(src, masked, lineOf) {
  const chains = [];
  const consumed = new Set();
  const re = /\bif\s*\(/g;
  let m;
  while ((m = re.exec(masked)) !== null) {
    if (consumed.has(m.index)) continue;
    if (m.index > 0 && /[\w$.]/.test(masked[m.index - 1])) continue;
    const branches = [];
    let ifIdx = m.index;
    for (;;) {
      consumed.add(ifIdx);
      const pOpen = masked.indexOf('(', ifIdx);
      const pClose = findClosing(masked, pOpen, '(', ')');
      if (pClose < 0) break;
      const rawCond = src.slice(pOpen + 1, pClose);
      const condMasked = masked.slice(pOpen + 1, pClose);
      const bodyStart = skipWs(masked, pClose + 1);
      let bodyEnd = masked[bodyStart] === '{'
        ? findClosing(masked, bodyStart, '{', '}')
        : findStatementEnd(masked, bodyStart);
      if (bodyEnd < 0) bodyEnd = masked.length - 1;
      branches.push({
        cond: normalizeCond(rawCond),
        terms: splitTopLevelOr(rawCond, condMasked),
        line: lineOf(ifIdx),
        bodyMasked: masked.slice(bodyStart, bodyEnd + 1)
      });
      const k = skipWs(masked, bodyEnd + 1);
      const em = /^else\s+if\s*\(/.exec(masked.slice(k, k + 64));
      if (!em) break;
      ifIdx = k + em[0].lastIndexOf('if');
    }
    if (branches.length) chains.push(branches);
  }
  return chains;
}

const NOT_FUNCTION_NAMES = new Set(['if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'with', 'else', 'do', 'try', 'finally']);

/**
 * Définitions de fonctions / méthodes :
 *   name(...) {   async name(...) {   function name(...) {
 *   name: function(...) {   name = (...) => {   name: async x => {
 */
function extractFunctions(masked, lineOf) {
  const fns = [];
  const seen = new Set();
  const patterns = [
    { re: /(?:^|[\s,;{}(])(async\s+)?(?:function\s*\*?\s*)?([A-Za-z_$][\w$]*)\s*\((?:[^()]|\([^()]*\))*\)\s*\{/g, name: 2, async: 1 },
    { re: /([A-Za-z_$][\w$]*)\s*[:=]\s*(async\s+)?(?:function\b\s*\*?\s*[\w$]*\s*)?\((?:[^()]|\([^()]*\))*\)\s*(?:=>\s*)?\{/g, name: 1, async: 2 },
    { re: /([A-Za-z_$][\w$]*)\s*[:=]\s*(async\s+)?[A-Za-z_$][\w$]*\s*=>\s*\{/g, name: 1, async: 2 }
  ];
  for (const p of patterns) {
    let m;
    while ((m = p.re.exec(masked)) !== null) {
      const name = m[p.name];
      if (NOT_FUNCTION_NAMES.has(name)) continue;
      const braceIdx = m.index + m[0].length - 1;
      if (seen.has(braceIdx)) continue;
      seen.add(braceIdx);
      const end = findClosing(masked, braceIdx, '{', '}');
      if (end < 0) continue;
      fns.push({
        name,
        isAsync: Boolean(m[p.async]),
        line: lineOf(m.index + m[0].indexOf(name)),
        endLine: lineOf(end),
        start: braceIdx,
        end,
        bodyMasked: masked.slice(braceIdx, end + 1)
      });
    }
  }
  return fns;
}

/** Blocs `try {}`, `catch (e) {}`, `finally {}` (pas les méthodes .catch() / .finally() des promesses). */
function findBlocks(masked, keyword) {
  const re = keyword === 'catch'
    ? /\bcatch\b\s*(?:\([^)]*\))?\s*\{/g
    : new RegExp(`\\b${keyword}\\s*\\{`, 'g');
  const blocks = [];
  let m;
  while ((m = re.exec(masked)) !== null) {
    if (m.index > 0 && masked[m.index - 1] === '.') continue;
    const start = m.index + m[0].length - 1;
    const end = findClosing(masked, start, '{', '}');
    if (end > 0) blocks.push({ start, end, kwIndex: m.index });
  }
  return blocks;
}

const isInside = (idx, blocks) => blocks.some(b => idx > b.start && idx < b.end);

/** Plus petite fonction englobant l'index (ou null). */
function enclosingFn(fns, idx) {
  let best = null;
  for (const f of fns) {
    if (idx > f.start && idx < f.end && (!best || f.end - f.start < best.end - best.start)) best = f;
  }
  return best;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Compte les occurrences d'un identifiant (frontières compatibles avec `$`).
 * `obj.name` (accès propriété) n'est pas compté, mais `...name` (spread) l'est.
 */
function countIdent(text, name) {
  const re = new RegExp(`(?<![\\w$])(?<!(?:^|[^.])\\.)${escapeRe(name)}(?![\\w$])`, 'g');
  return (text.match(re) || []).length;
}

module.exports = {
  maskCode,
  findClosing,
  skipWs,
  prevNonWs,
  prevWord,
  findStatementEnd,
  makeLineIndex,
  stripOuterParens,
  normalizeCond,
  splitTopLevelOr,
  scanIfChains,
  extractFunctions,
  findBlocks,
  isInside,
  enclosingFn,
  escapeRe,
  countIdent
};
