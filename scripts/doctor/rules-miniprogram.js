/**
 * Règles spécifiques MINI-PROGRAMME (WeChat / TCMPP Sonatel Max It).
 *  - auditMpJs      : un fichier JS (mutation de this.data, setData en boucle, fuites…)
 *  - auditWxml      : un fichier WXML (wx:for sans wx:key)
 *  - auditProject   : contrôles croisés entre fichiers (handlers, composants, assets, routes)
 */
const path = require('path');
const {
  maskCode, findClosing, prevNonWs, makeLineIndex, extractFunctions
} = require('./parse');

const NATIVE_TAGS = new Set(`view scroll-view swiper swiper-item movable-area movable-view cover-view cover-image
  icon text rich-text progress button checkbox checkbox-group editor form input keyboard-accessory label picker
  picker-view picker-view-column radio radio-group slider switch textarea functional-page-navigator navigator
  audio camera image live-player live-pusher video voip-room map canvas web-view ad ad-custom official-account
  open-data native-component aria-component navigation-bar page-meta root-portal match-media page-container
  share-element grid-view list-view sticky-header sticky-section channel-live channel-video store-product
  block template import include wxs slot`.split(/\s+/).filter(Boolean));

const IMG_EXT = /\.(png|jpe?g|gif|svg|webp|bmp)$/i;

// ------------------------------------------------------------
// JS d'une page / d'un composant
// ------------------------------------------------------------
function auditMpJs(relPath, content) {
  const issues = [];
  const masked = maskCode(content);
  const lineOf = makeLineIndex(content);
  const add = (o) => issues.push({ file: relPath, category: 'mini-programme', ...o });
  const isApp = /(^|\/)app\.js$/.test(relPath);

  // 1. Mutation directe de this.data (aucun rendu, état incohérent)
  for (const m of masked.matchAll(/this\.data\.[\w$.[\]]+\s*(?:=(?!=)|\+=|-=|\+\+|--)/g)) {
    add({ line: lineOf(m.index), type: 'MP_DATA_DIRECT_MUTATION', severity: 'HAUTE',
      message: 'Affectation directe sur `this.data` : la vue ne sera pas mise à jour.',
      detail: 'Utilisez `this.setData({ ... })`.' });
  }
  for (const m of masked.matchAll(/this\.data\.[\w$.]+\.(push|pop|splice|shift|unshift|sort|reverse)\s*\(/g)) {
    add({ line: lineOf(m.index), type: 'MP_DATA_DIRECT_MUTATION', severity: 'HAUTE',
      message: `\`this.data.….${m[1]}()\` modifie l'état sans setData.`,
      detail: 'Copiez le tableau puis appelez `this.setData({ liste: nouvelleListe })`.' });
  }

  // 2. setData dans une boucle (un rendu par itération)
  {
    const loops = [];
    for (const m of masked.matchAll(/\b(for|while)\s*\(/g)) {
      const pOpen = m.index + m[0].length - 1;
      const pClose = findClosing(masked, pOpen, '(', ')');
      if (pClose < 0) continue;
      const b = masked.indexOf('{', pClose);
      if (b < 0 || masked.slice(pClose + 1, b).trim() !== '') continue;
      loops.push({ idx: m.index, start: b, end: findClosing(masked, b, '{', '}'), bodyStart: b });
    }
    for (const m of masked.matchAll(/\.(forEach|map)\s*\(/g)) {
      const pOpen = m.index + m[0].length - 1;
      const end = findClosing(masked, pOpen, '(', ')');
      const cb = masked.indexOf('{', pOpen); // corps du callback de la boucle
      loops.push({ idx: m.index, start: pOpen, end, bodyStart: cb > 0 && cb < end ? cb : pOpen });
    }
    // fonctions imbriquées : un setData dans un callback enregistré dans la boucle ne s'exécute pas dans la boucle
    const fnBlocks = [];
    for (const m of masked.matchAll(/=>\s*\{|\bfunction\b\s*[\w$]*\s*\([^)]*\)\s*\{/g)) {
      const s = m.index + m[0].length - 1;
      fnBlocks.push({ start: s, end: findClosing(masked, s, '{', '}') });
    }
    for (const l of loops) {
      if (l.end < 0) continue;
      const calls = [...masked.slice(l.start, l.end).matchAll(/\.setData\s*\(/g)].map(c => l.start + c.index);
      const direct = calls.filter(ci => !fnBlocks.some(fb => fb.start > l.bodyStart && fb.start < ci && fb.end > ci));
      if (direct.length) {
        add({ line: lineOf(l.idx), type: 'MP_SETDATA_IN_LOOP', severity: 'MOYENNE',
          message: '`setData` appelé dans une boucle.',
          detail: 'Chaque appel traverse le pont JS ↔ rendu. Construisez l\'objet dans la boucle puis faites un seul `setData` après.' });
      }
    }
  }

  // 3. setInterval jamais nettoyé
  if (/\bsetInterval\s*\(/.test(masked) && !/\bclearInterval\s*\(/.test(masked)) {
    const idx = masked.search(/\bsetInterval\s*\(/);
    add({ line: lineOf(idx), type: 'MP_INTERVAL_NOT_CLEARED', severity: 'HAUTE',
      message: '`setInterval` sans `clearInterval` dans le fichier.',
      detail: 'Stockez l\'id (`this._timer = setInterval(...)`) et appelez `clearInterval` dans `onUnload` / `detached`.' });
  }

  // 4. Écouteurs jamais retirés
  if (!isApp) {
    for (const m of masked.matchAll(/\bwx\.on([A-Z][\w]*)\s*\(/g)) {
      if (new RegExp(`\\bwx\\.off${m[1]}\\s*\\(`).test(masked)) continue;
      add({ line: lineOf(m.index), type: 'MP_LISTENER_LEAK', severity: 'HAUTE',
        message: `\`wx.on${m[1]}\` sans \`wx.off${m[1]}\`.`,
        detail: 'L\'écouteur survit à la page : il s\'accumule à chaque ouverture. Retirez-le dans onUnload / detached.' });
    }
  }
  for (const m of masked.matchAll(/\b(Bus|bus|eventBus|EventBus|emitter)\.on\s*\(/g)) {
    const prev = prevNonWs(masked, m.index).ch;
    if (!['', ';', '{', '}', ')'].includes(prev)) continue; // valeur de retour conservée
    add({ line: lineOf(m.index), type: 'MP_LISTENER_LEAK', severity: 'HAUTE',
      message: `\`${m[1]}.on(...)\` dont la fonction de désabonnement n'est pas conservée.`,
      detail: 'Stockez le retour (`this.unsub = Bus.on(...)`) et appelez-le dans onUnload / detached.' });
  }

  // 5. Effets de bord dans `observers` (déclenchés à chaque changement de propriété)
  for (const m of masked.matchAll(/\bobservers\s*:\s*\{/g)) {
    const start = m.index + m[0].length - 1;
    const end = findClosing(masked, start, '{', '}');
    if (end < 0) continue;
    const body = masked.slice(start, end);
    const se = /\b(wx\.(?:setStorage|setStorageSync|removeStorage|removeStorageSync|request|uploadFile|downloadFile|navigateTo|redirectTo|switchTab)|storage\.(?:set|remove|clear)|save[A-Z]\w*|Bus\.emit|eventBus\.emit)\s*\(/.exec(body);
    if (se) {
      add({ line: lineOf(start + se.index), type: 'MP_OBSERVER_SIDE_EFFECT', severity: 'MOYENNE',
        message: `Effet de bord \`${se[1]}()\` dans un \`observer\`.`,
        detail: 'Un observer se déclenche à chaque mise à jour de propriété (y compris au montage) : écriture en double, données de démo persistées… Déplacez l\'action dans le handler de l\'événement qui la justifie.' });
    }
  }

  // 6. wx.request sans fail
  for (const m of masked.matchAll(/\bwx\.request\s*\(/g)) {
    const open = m.index + m[0].length - 1;
    const close = findClosing(masked, open, '(', ')');
    if (close < 0) continue;
    if (/\bfail\b|\bcomplete\b/.test(masked.slice(open, close))) continue;
    add({ line: lineOf(m.index), type: 'MP_REQUEST_NO_FAIL', severity: 'MOYENNE',
      message: '`wx.request` sans callback `fail`.',
      detail: 'Sur coupure 4G, rien n\'informe l\'utilisateur. Ajoutez `fail` (ou passez par le client HTTP du projet).' });
  }

  return issues;
}

// ------------------------------------------------------------
// WXML seul
// ------------------------------------------------------------
function cleanWxml(content) {
  // commentaires, contenu <wxs> et expressions {{ }} remplacés par des espaces (même longueur)
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  return content
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/(<wxs\b[^>]*>)([\s\S]*?)(<\/wxs>)/g, (all, a, b, c) => a + blank(b) + c)
    .replace(/\{\{[\s\S]*?\}\}/g, (s) => '{{' + blank(s.slice(2, -2)) + '}}');
}

function parseTags(content) {
  const clean = cleanWxml(content);
  const tags = [];
  for (const m of clean.matchAll(/<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g)) {
    const attrs = {};
    const rawAttrs = content.slice(m.index + 1 + m[1].length, m.index + m[0].length - 1);
    for (const a of rawAttrs.matchAll(/([:\w-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
      attrs[a[1]] = a[3] !== undefined ? a[3] : a[4];
    }
    tags.push({ name: m[1], attrs, index: m.index });
  }
  return tags;
}

function auditWxml(relPath, content) {
  const issues = [];
  const lineOf = makeLineIndex(content);
  const add = (o) => issues.push({ file: relPath, category: 'mini-programme', ...o });

  // code WXML commenté
  for (const m of content.matchAll(/<!--([\s\S]*?)-->/g)) {
    if (/<[a-zA-Z][\w-]*[\s>/]/.test(m[1])) {
      add({ line: lineOf(m.index), type: 'COMMENTED_OUT_CODE', severity: 'INFO', category: 'qualité',
        message: 'Bloc WXML commenté laissé dans le template.',
        detail: 'Supprimez-le (l\'historique Git le conserve) ou réactivez-le avec une condition `wx:if`.' });
    }
  }

  // valeurs de démonstration affichées quand la donnée manque : {{ receipt.ref || 'SAMU-MS60Y4601' }}
  for (const m of content.matchAll(/\{\{\s*([\w$.[\]]+)\s*\|\|\s*(['"])([^'"]{3,})\2\s*\}\}/g)) {
    const literal = m[3].trim();
    if (/^(-|—|n\/a|\.\.\.|…)$/i.test(literal)) continue;
    if (!/\d/.test(literal) && !/^[A-Z0-9-]{5,}$/.test(literal)) continue;
    add({ line: lineOf(m.index), type: 'MP_WXML_DEMO_FALLBACK', severity: 'INFO', category: 'métier',
      message: `\`${m[1]}\` affiche la valeur en dur \`${literal}\` quand la donnée manque.`,
      detail: 'Un reçu/ticket incomplet montrerait une fausse donnée crédible. Affichez un neutre (\'-\') ou masquez le champ.' });
  }

  for (const t of parseTags(content)) {
    if ('wx:for' in t.attrs && !('wx:key' in t.attrs)) {
      add({ line: lineOf(t.index), type: 'MP_FOR_NO_KEY', severity: 'MOYENNE',
        message: `\`<${t.name} wx:for>\` sans \`wx:key\`.`,
        detail: 'Sans clé, la liste est re-rendue entièrement et l\'état des éléments (inputs, animations) peut se mélanger. Ajoutez `wx:key="id"`.' });
    }
  }
  return issues;
}

// ------------------------------------------------------------
// WXSS + design tokens
// ------------------------------------------------------------
function normColor(v) {
  let s = String(v).trim().toLowerCase().replace(/\s+/g, '');
  if (/^#[0-9a-f]{3}$/.test(s)) s = '#' + s.slice(1).split('').map(c => c + c).join('');
  return s;
}

/** Collecte des tokens `--nom: valeur` (WXSS + attributs style des WXML). */
function collectTokens(project) {
  const tokens = new Map(); // nom -> Set(valeurs normalisées)
  for (const f of project.files) {
    if (!/\.(wxss|wxml)$/.test(f)) continue;
    const text = project.read(f);
    if (!text) continue;
    for (const m of text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[\w-]+)\s*:\s*([^;}{"]+)/g)) {
      if (!tokens.has(m[1])) tokens.set(m[1], new Set());
      tokens.get(m[1]).add(normColor(m[2]));
    }
  }
  return tokens;
}

function auditWxss(relPath, content, tokens) {
  const issues = [];
  const add = (o) => issues.push({ file: relPath, category: 'design-system', ...o });
  const css = content.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  const lineOf = makeLineIndex(css);

  // valeur -> token (uniquement si une seule définition, sinon ambigu)
  const valueToToken = new Map();
  for (const [name, values] of tokens) {
    if (values.size !== 1) continue;
    const v = [...values][0];
    if (/^#[0-9a-f]{6,8}$|^rgba?\(/.test(v)) valueToToken.set(v, valueToToken.has(v) ? null : name);
  }

  // 1. var(--token, fallback) dont le fallback diverge de la définition
  for (const m of css.matchAll(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]+(?:\([^()]*\))?[^()]*))?\)/g)) {
    const def = tokens.get(m[1]);
    if (!def) {
      if (!m[2]) {
        add({ line: lineOf(m.index), type: 'WXSS_TOKEN_UNDEFINED', severity: 'HAUTE',
          message: `\`var(${m[1]})\` : token défini nulle part et sans valeur de repli.`,
          detail: 'La propriété sera ignorée à l\'affichage. Corrigez le nom du token ou ajoutez une valeur de repli.' });
      }
      continue;
    }
    if (m[2] && def.size === 1) {
      const expected = [...def][0];
      if (normColor(m[2]) !== expected && !expected.startsWith('var(')) {
        add({ line: lineOf(m.index), type: 'WXSS_TOKEN_FALLBACK_MISMATCH', severity: 'MOYENNE',
          message: `\`var(${m[1]}, ${m[2].trim()})\` : la valeur de repli diffère du token (\`${expected}\`).`,
          detail: 'Le rendu changera selon que le token est chargé ou non. Alignez la valeur de repli sur la définition du token.' });
      }
    }
  }

  // 2. couleurs en dur : valeur d'un token existant, ou fichier qui utilise déjà les tokens
  const usesTokens = (css.match(/var\(\s*--/g) || []).length >= 3;
  for (const m of css.matchAll(/(^|[;{\s])([a-z-]+)\s*:\s*([^;{}]+)/g)) {
    if (m[2].startsWith('--')) continue; // définition de token
    const value = m[3].replace(/var\([^)]*\)/g, ''); // les fallbacks de var() sont légitimes
    for (const c of value.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g)) {
      const token = valueToToken.get(normColor(c[0]));
      const line = lineOf(m.index + m[1].length);
      if (token) {
        add({ line, type: 'WXSS_HARDCODED_TOKEN_VALUE', severity: 'INFO',
          message: `\`${c[0]}\` est la valeur du token \`${token}\`.`,
          detail: `Utilisez \`var(${token}, ${c[0]})\` : un changement de charte ne sera fait qu'à un seul endroit.` });
      } else if (usesTokens && /^#/.test(c[0])) {
        add({ line, type: 'WXSS_HARDCODED_COLOR', severity: 'INFO',
          message: `Couleur en dur \`${c[0]}\` (\`${m[2]}\`) dans un fichier qui utilise les design tokens.`,
          detail: 'Utilisez le token correspondant (ex : `var(--samu-border, …)`) pour rester cohérent avec la charte.' });
      }
    }
  }
  return issues;
}

// ------------------------------------------------------------
// Assets (images)
// ------------------------------------------------------------
function auditAsset(relPath, content, size) {
  const issues = [];
  const add = (o) => issues.push({ file: relPath, category: 'assets', fileLevel: true, line: 1, ...o });
  const ext = posix.extname(relPath).toLowerCase();
  const head = (content || '').slice(0, 256 * 1024);

  if (ext === '.svg' && /<image\b/i.test(head) && /data:image\/(png|jpe?g|webp)/i.test(head)) {
    add({ type: 'ASSET_SVG_WRAPS_RASTER', severity: 'MOYENNE',
      message: 'Ce SVG ne fait qu\'encapsuler une image bitmap en base64.',
      detail: 'Il est plus lourd que l\'image d\'origine (+33 % base64) et n\'est pas vectoriel. Utilisez directement le PNG/JPG, ou un vrai SVG.' });
  }
  if (/\.(png|jpe?g|webp)$/.test(ext) && /xmpmeta|Photoshop|Adobe ImageReady|<rdf:RDF/.test(head)) {
    add({ type: 'ASSET_METADATA_BLOAT', severity: 'INFO',
      message: 'Métadonnées d\'édition (XMP / Photoshop) embarquées dans l\'image.',
      detail: 'Elles alourdissent le paquet sans rien afficher. Exportez « pour le web » ou passez l\'image dans un optimiseur (tinypng, squoosh).' });
  }
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(ext) && size > 200 * 1024) {
    add({ type: 'ASSET_TOO_LARGE', severity: 'MOYENNE',
      message: `Image de ${Math.round(size / 1024)} Ko.`,
      detail: 'Le paquet principal TCMPP/WeChat est limité à 2 Mo. Compressez-la ou chargez-la depuis un CDN.' });
  }
  return issues;
}

// ------------------------------------------------------------
// Contrôles croisés sur tout le projet
// ------------------------------------------------------------
const posix = path.posix;

function resolveRef(fromFile, ref) {
  if (!ref) return null;
  if (/^(https?:|data:|wxfile:|cloud:|plugin:|\/\/)/i.test(ref)) return null;
  if (ref.startsWith('/')) return posix.normalize(ref.slice(1));
  if (ref.startsWith('./') || ref.startsWith('../')) return posix.normalize(posix.join(posix.dirname(fromFile), ref));
  return null; // paquet npm ou chemin relatif implicite : non vérifié
}

function safeJson(text) {
  try { return JSON.parse(text.replace(/^﻿/, '')); } catch { return null; }
}

function lineOfText(content, needle) {
  const idx = content.indexOf(needle);
  return idx < 0 ? 1 : makeLineIndex(content)(idx);
}

/** Noms définis dans un JS : fonctions, méthodes, clés d'objet, this.x = … */
function definedNames(js) {
  const masked = maskCode(js);
  const names = new Set(extractFunctions(masked, () => 0).map(f => f.name));
  for (const m of masked.matchAll(/([A-Za-z_$][\w$]*)\s*:/g)) names.add(m[1]);
  for (const m of masked.matchAll(/this\.([A-Za-z_$][\w$]*)\s*=/g)) names.add(m[1]);
  return { names, hasSpread: /^\s*\.\.\.[A-Za-z_$]/m.test(masked) };
}

/**
 * @param project { files:Set<string>, read(path):string|null, exists(path):boolean }
 */
function auditProject(project) {
  const issues = [];
  const add = (o) => issues.push({ category: 'cohérence', ...o });
  const all = [...project.files];
  const appJsonText = project.read('app.json');
  const appJson = appJsonText ? safeJson(appJsonText) : null;

  // --- Pages déclarées ---
  const pages = new Set();
  const tabPages = new Set();
  if (appJson) {
    if (appJson.lazyCodeLoading !== 'requiredComponents') {
      add({ file: 'app.json', line: appJson.lazyCodeLoading ? lineOfText(appJsonText, '"lazyCodeLoading"') : 1,
        type: 'MP_LAZY_CODE_LOADING_MISSING', severity: 'HAUTE',
        message: '`"lazyCodeLoading": "requiredComponents"` absent de app.json.',
        detail: 'Sans lui, tous les composants déclarés sont chargés au démarrage (démarrage lent, refus possible à l\'homologation TCMPP).' });
    }
    (appJson.pages || []).forEach(p => pages.add(p));
    for (const sp of (appJson.subPackages || appJson.subpackages || [])) {
      (sp.pages || []).forEach(p => pages.add(posix.join(sp.root, p)));
    }
    ((appJson.tabBar && appJson.tabBar.list) || []).forEach(t => tabPages.add(t.pagePath));

    for (const p of pages) {
      const missing = ['.js', '.wxml'].filter(ext => !project.exists(p + ext) && !(ext === '.js' && project.exists(p + '.ts')));
      if (missing.length) {
        add({ file: 'app.json', line: lineOfText(appJsonText, `"${p}"`), type: 'MP_PAGE_FILES_MISSING', severity: 'CRITIQUE',
          related: [p + '.js', p + '.wxml'],
          message: `La page \`${p}\` est déclarée mais \`${missing.join(', ')}\` est introuvable.`,
          detail: 'Le mini-programme ne compilera pas. Restaurez les fichiers ou retirez la page de app.json.' });
      }
    }
    for (const t of tabPages) {
      if (!pages.has(t)) {
        add({ file: 'app.json', line: lineOfText(appJsonText, `"pagePath": "${t}"`), type: 'MP_TABBAR_PAGE_UNDECLARED', severity: 'CRITIQUE',
          message: `\`${t}\` est dans tabBar.list mais pas dans "pages".`, detail: 'Ajoutez la page dans "pages".' });
      }
    }
  }
  const globalComponents = (appJson && appJson.usingComponents) || {};

  // --- Composants (usingComponents) : chemins valides ---
  const componentExists = (resolved) => ['.js', '.ts', '.json'].some(ext => project.exists(resolved + ext));
  const checkUsing = (jsonPath, jsonText, map) => {
    for (const [tag, ref] of Object.entries(map || {})) {
      const resolved = resolveRef(jsonPath, ref);
      if (resolved && !componentExists(resolved)) {
        add({ file: jsonPath, line: lineOfText(jsonText, `"${tag}"`), type: 'MP_COMPONENT_PATH_MISSING', severity: 'CRITIQUE',
          related: [resolved + '.js', resolved + '.json'],
          message: `Composant \`${tag}\` → \`${ref}\` introuvable.`,
          detail: 'Erreur de compilation garantie. Corrigez le chemin ou restaurez le composant.' });
      }
    }
  };
  if (appJson) checkUsing('app.json', appJsonText, globalComponents);

  // --- Unités (page/composant = .wxml + .json) ---
  for (const wxmlPath of all.filter(f => f.endsWith('.wxml'))) {
    const base = wxmlPath.slice(0, -5);
    const jsonText = project.read(base + '.json');
    if (jsonText === null) continue; // simple template importé
    const json = safeJson(jsonText) || {};
    const wxml = project.read(wxmlPath) || '';
    const wxmlLine = makeLineIndex(wxml);
    checkUsing(base + '.json', jsonText, json.usingComponents);

    const local = json.usingComponents || {};
    const known = new Set([...Object.keys(local), ...Object.keys(globalComponents), ...Object.keys(json.componentGenerics || {})]);
    const tags = parseTags(wxml);
    const templateNames = new Set(tags.filter(t => t.name === 'template' && t.attrs.name).map(t => t.attrs.name));

    // composants non déclarés
    const used = new Set();
    for (const t of tags) {
      used.add(t.name);
      if (NATIVE_TAGS.has(t.name) || known.has(t.name) || templateNames.has(t.name)) continue;
      add({ file: wxmlPath, line: wxmlLine(t.index), type: 'MP_COMPONENT_NOT_DECLARED', severity: 'CRITIQUE',
        related: [base + '.json'],
        message: `\`<${t.name}>\` n'est ni natif ni déclaré dans usingComponents.`,
        detail: `Ajoutez-le dans \`${base}.json\` (ou app.json) ; sinon la balise est ignorée/erreur en compilation.` });
    }
    // composants déclarés mais inutilisés (hors include/import qui peuvent les utiliser)
    if (!/<(include|import)\b/.test(wxml)) {
      for (const tag of Object.keys(local)) {
        if (used.has(tag)) continue;
        add({ file: base + '.json', line: lineOfText(jsonText, `"${tag}"`), type: 'MP_COMPONENT_UNUSED', severity: 'INFO',
          related: [wxmlPath],
          message: `Composant \`${tag}\` déclaré mais jamais utilisé dans le WXML.`,
          detail: 'Retirez la déclaration (config morte, et chargement inutile sans lazyCodeLoading).' });
      }
    }

    // handlers d'événements inexistants
    const jsPath = project.exists(base + '.js') ? base + '.js' : (project.exists(base + '.ts') ? base + '.ts' : null);
    if (jsPath) {
      const js = project.read(jsPath) || '';
      const { names, hasSpread } = definedNames(js);
      // méthodes apportées par des modules locaux (behaviors, mixins)
      for (const r of js.matchAll(/(?:require\s*\(\s*|from\s+)['"](\.{1,2}\/[^'"]+)['"]/g)) {
        let dep = resolveRef(jsPath, r[1]);
        if (!dep) continue;
        dep = project.exists(dep) ? dep : (project.exists(dep + '.js') ? dep + '.js' : (project.exists(dep + '/index.js') ? dep + '/index.js' : null));
        const depText = dep && project.read(dep);
        if (depText) definedNames(depText).names.forEach(n => names.add(n));
      }
      if (!hasSpread) {
        for (const t of tags) {
          for (const [attr, value] of Object.entries(t.attrs)) {
            if (!/^(bind|catch|capture-bind|capture-catch|mut-bind)/.test(attr)) continue;
            const handler = (value || '').trim();
            if (!handler || handler.includes('{{') || /^(true|false)$/.test(handler)) continue;
            if (names.has(handler)) continue;
            add({ file: wxmlPath, line: wxmlLine(t.index), type: 'MP_HANDLER_MISSING', severity: 'CRITIQUE',
              related: [jsPath],
              message: `\`${attr}="${handler}"\` : la méthode \`${handler}\` n'existe pas dans \`${jsPath}\`.`,
              detail: 'Au tap, WeChat affiche "does not have a method" et rien ne se passe. Créez la méthode ou corrigez le nom.' });
          }
        }
      }
    }
  }

  // --- import / require vers un module introuvable ---
  for (const f of all.filter(p => /\.(js|ts|wxs)$/.test(p))) {
    const text = project.read(f);
    if (!text) continue;
    const masked = maskCode(text);
    const lineOf = makeLineIndex(text);
    const re = /\b(?:require\s*\(\s*|import\s+(?:[\w$*{}\s,]+\s+from\s+)?|export\s+[\w$*{}\s,]+\s+from\s+)(['"])((?:\.{1,2}\/|\/)[^'"]+)\1/g;
    for (const m of text.matchAll(re)) {
      if (masked[m.index] === ' ') continue; // dans un commentaire
      const base = resolveRef(f, m[2]);
      if (!base) continue;
      const candidates = [base, `${base}.js`, `${base}.ts`, `${base}.json`, `${base}.wxs`, `${base}/index.js`, `${base}/index.ts`];
      if (candidates.some(c => project.exists(c))) continue;
      // fichier de config local volontairement hors Git (ex : utils/config.js + utils/config.example.js)
      const stem = base.replace(/\.(js|ts|json)$/, '');
      if (['.example.js', '.example.ts', '.example.json', '.sample.js'].some(ext => project.exists(stem + ext))) continue;
      add({ file: f, line: lineOf(m.index), type: 'MP_IMPORT_MISSING', severity: 'CRITIQUE',
        related: candidates,
        message: `Module \`${m[2]}\` introuvable.`,
        detail: 'La page/le composant plantera au chargement ("module is not defined"). Corrigez le chemin (fichier renommé ou supprimé ?).' });
    }
  }

  // --- Assets référencés introuvables ---
  const refChecks = [];
  for (const f of all) {
    const ext = posix.extname(f);
    if (!['.wxml', '.wxss', '.js', '.json', '.ts'].includes(ext)) continue;
    const text = project.read(f);
    if (!text) continue;
    const lineOf = makeLineIndex(text);
    if (ext === '.wxml') {
      const clean = cleanWxml(text);
      for (const m of clean.matchAll(/=\s*"([^"{}]+)"/g)) refChecks.push({ f, line: lineOf(m.index), ref: m[1].trim() });
    } else if (ext === '.wxss') {
      for (const m of text.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) refChecks.push({ f, line: lineOf(m.index), ref: m[1].trim() });
    } else {
      const masked = ext === '.json' ? null : maskCode(text);
      for (const m of text.matchAll(/(['"`])((?:\/|\.\.?\/)[^'"`{}$\s]+)\1/g)) {
        if (masked && masked[m.index + 1] === ' ') continue; // dans un commentaire
        refChecks.push({ f, line: lineOf(m.index), ref: m[2] });
      }
    }
  }
  for (const c of refChecks) {
    if (!IMG_EXT.test(c.ref)) continue;
    const resolved = resolveRef(c.f, c.ref);
    if (!resolved || project.exists(resolved)) continue;
    add({ file: c.f, line: c.line, type: 'MP_ASSET_MISSING', severity: 'CRITIQUE',
      related: [resolved],
      message: `Image \`${c.ref}\` introuvable.`,
      detail: 'L\'image sera cassée à l\'écran (et erreur 404 dans la console). Restaurez le fichier ou corrigez le chemin.' });
  }

  // --- Routes ---
  if (appJson) {
    const checkRoute = (f, line, api, url) => {
      const page = url.replace(/^\//, '').split('?')[0];
      if (!page || page.includes('{') || page.includes('$')) return;
      if (!pages.has(page)) {
        add({ file: f, line, type: 'MP_ROUTE_MISSING', severity: 'CRITIQUE',
          related: ['app.json'],
          message: `\`${api}\` vers \`${url}\` : page non déclarée dans app.json.`,
          detail: 'La navigation échouera ("page not found").' });
      } else if (api === 'switchTab' && !tabPages.has(page)) {
        add({ file: f, line, type: 'MP_ROUTE_WRONG_API', severity: 'CRITIQUE',
          message: `\`switchTab\` vers \`${page}\` qui n'est pas une page de la tabBar.`,
          detail: 'Utilisez navigateTo / redirectTo.' });
      } else if ((api === 'navigateTo' || api === 'redirectTo') && tabPages.has(page)) {
        add({ file: f, line, type: 'MP_ROUTE_WRONG_API', severity: 'CRITIQUE',
          message: `\`${api}\` vers la page tabBar \`${page}\`.`,
          detail: 'Interdit par WeChat : utilisez `wx.switchTab`.' });
      }
    };
    for (const f of all) {
      const ext = posix.extname(f);
      const text = (ext === '.js' || ext === '.ts' || ext === '.wxml') ? project.read(f) : null;
      if (!text) continue;
      const lineOf = makeLineIndex(text);
      if (ext === '.wxml') {
        for (const t of parseTags(text)) {
          if (t.name !== 'navigator' || !t.attrs.url) continue;
          const type = t.attrs['open-type'] || 'navigate';
          const api = { navigate: 'navigateTo', redirect: 'redirectTo', switchTab: 'switchTab', reLaunch: 'reLaunch' }[type];
          if (api) checkRoute(f, lineOf(t.index), api, t.attrs.url);
        }
        continue;
      }
      const masked = maskCode(text);
      for (const m of masked.matchAll(/\bwx\.(navigateTo|redirectTo|switchTab|reLaunch)\s*\(/g)) {
        const open = m.index + m[0].length - 1;
        const close = findClosing(masked, open, '(', ')');
        if (close < 0) continue;
        const um = /\burl\s*:\s*(['"`])([^'"`]+)\1/.exec(text.slice(open, close));
        if (um) checkRoute(f, lineOf(m.index), m[1], um[2]);
      }
    }
  }

  return issues;
}

module.exports = { auditMpJs, auditWxml, auditWxss, auditAsset, auditProject, collectTokens, parseTags, NATIVE_TAGS };
