/**
 * build.js
 * ソースコード（renderer, main, patcher, dictionaries）をビルドし、
 * 単一実行可能な配布用成果物（dist/）を生成するゼロ依存バンドラー
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DICT_DIR = path.join(SRC_DIR, 'dictionaries');

console.log('=== Building Antigravity-JA v2.0.0 ===');

fs.mkdirSync(DIST_DIR, { recursive: true });

// 1. 辞書データの読み込みとマージ
console.log('[1/4] Merging dictionaries...');
const uiDict = JSON.parse(fs.readFileSync(path.join(DICT_DIR, 'ui.json'), 'utf8'));
const settingsDict = JSON.parse(fs.readFileSync(path.join(DICT_DIR, 'settings.json'), 'utf8'));
const dialogsDict = JSON.parse(fs.readFileSync(path.join(DICT_DIR, 'dialogs.json'), 'utf8'));

// dialogs, settings, ui の順でマージ（キー重複時は dialogs/settings を優先）
const mergedDict = Object.assign({}, uiDict, settingsDict, dialogsDict);
console.log(`      Total dictionary entries: ${Object.keys(mergedDict).length}`);

// patterns.js のソース文字列を取得
const patternsSource = fs.readFileSync(path.join(DICT_DIR, 'patterns.js'), 'utf8');
const patternsArrayStr = patternsSource.replace(/^[\s\S]*module\.exports\s*=\s*/, '').trim();

// 2. レンダラーモジュール（dist/i18n_module.js）の生成
console.log('[2/4] Bundling renderer module (dist/i18n_module.js)...');
const filterSrc = fs.readFileSync(path.join(SRC_DIR, 'renderer', 'filter.js'), 'utf8')
  .replace(/'use strict';/g, '')
  .replace(/module\.exports\s*=\s*[\s\S]*$/, '');

const matcherSrc = fs.readFileSync(path.join(SRC_DIR, 'renderer', 'matcher.js'), 'utf8')
  .replace(/'use strict';/g, '')
  .replace(/module\.exports\s*=\s*[\s\S]*$/, '');

const collectorSrc = fs.readFileSync(path.join(SRC_DIR, 'renderer', 'collector.js'), 'utf8')
  .replace(/'use strict';/g, '')
  .replace(/const\s*\{\s*isValidText\s*\}\s*=\s*require\('\.\/filter'\);/g, '')
  .replace(/module\.exports\s*=\s*[\s\S]*$/, '');

const observerSrc = fs.readFileSync(path.join(SRC_DIR, 'renderer', 'observer.js'), 'utf8')
  .replace(/'use strict';/g, '')
  .replace(/const\s*\{\s*isExcluded,\s*isValidText\s*\}\s*=\s*require\('\.\/filter'\);/g, '')
  .replace(/module\.exports\s*=\s*[\s\S]*$/, '');

const rendererBundle = `// Antigravity UI Japanese Localization Mod - Renderer Module (v2.0.0)
(function () {
'use strict';

const STATIC_DICT = ${JSON.stringify(mergedDict)};
const REGEX_RULES = ${patternsArrayStr};

${filterSrc}
${matcherSrc}
${collectorSrc}
${observerSrc}

function initRenderer() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const matcher = new Matcher(STATIC_DICT, REGEX_RULES);
  const collector = new Collector();
  const observer = new DomObserver(matcher, collector);

  window.__AGY_JA__ = {
    matcher,
    collector,
    observer,
    exportUntranslated: () => collector.export(),
    retranslate: () => observer.retranslateAll()
  };

  observer.start();

  try {
    const { ipcRenderer } = require('electron');
    const applyDict = (dict, action) => {
      if (dict && typeof dict === 'object') {
        matcher.setCustomDict(dict);
        observer.retranslateAll();
        console.log('[Antigravity-i18n] Custom dict ' + action + ': ' + Object.keys(dict).length + ' entries');
      }
    };
    ipcRenderer.invoke('i18n:get-dict')
      .then(dict => applyDict(dict, 'loaded'))
      .catch(err => console.error('[Antigravity-i18n] Failed to load custom dictionary:', err));
    ipcRenderer.on('i18n:dict-updated', (_event, dict) => applyDict(dict, 'updated'));
  } catch (err) {
    console.warn('[Antigravity-i18n] ipcRenderer unavailable:', err);
  }

  console.log('[Antigravity-i18n] Module initialized.');
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initRenderer();
}
})();
`;

fs.writeFileSync(path.join(DIST_DIR, 'i18n_module.js'), rendererBundle, 'utf8');

// 3. メインモジュール（dist/main_hook.js）の生成
console.log('[3/4] Bundling main module (dist/main_hook.js)...');
const dictWatcherSrc = fs.readFileSync(path.join(SRC_DIR, 'main', 'dict-watcher.js'), 'utf8')
  .replace(/'use strict';/g, '')
  .replace(/module\.exports\s*=\s*[\s\S]*$/, '');

const mainBundle = `// Antigravity UI Japanese Localization Mod - Main Process Hook (v2.0.0)
(function () {
'use strict';

${dictWatcherSrc}

try {
  const { ipcMain, BrowserWindow } = require('electron');
  if (ipcMain && BrowserWindow) {
    const watcher = new DictWatcher(ipcMain, BrowserWindow);
    watcher.setup();
  }
} catch (err) {
  console.error('[Antigravity-i18n Main] Hook setup failed:', err);
}
})();
`;

fs.writeFileSync(path.join(DIST_DIR, 'main_hook.js'), mainBundle, 'utf8');

// 4. パッチャー（dist/patcher.js）の生成
console.log('[4/4] Bundling patcher CLI (dist/patcher.js)...');

function cleanModule(src) {
  return src
    .replace(/'use strict';/g, '')
    .replace(/^const\s+fs\s*=\s*require\(['"](?:original-)?fs['"]\);?/gm, '')
    .replace(/^let\s+fs;[\s\S]*?fs\s*=\s*require\('fs'\);?\s*}/gm, '')
    .replace(/^const\s+path\s*=\s*require\(['"]path['"]\);?/gm, '')
    .replace(/^const\s+os\s*=\s*require\(['"]os['"]\);?/gm, '')
    .replace(/^const\s+crypto\s*=\s*require\(['"]crypto['"]\);?/gm, '')
    .replace(/module\.exports\s*=\s*\{[\s\S]*?\};?/g, '');
}

const fuseCheckSrc = cleanModule(fs.readFileSync(path.join(SRC_DIR, 'patcher', 'fuse-check.js'), 'utf8'));
const backupSrc = cleanModule(fs.readFileSync(path.join(SRC_DIR, 'patcher', 'backup.js'), 'utf8'));
const asarPatcherSrc = cleanModule(fs.readFileSync(path.join(SRC_DIR, 'patcher', 'asar-patcher.js'), 'utf8'));

let patcherIndexSrc = cleanModule(fs.readFileSync(path.join(SRC_DIR, 'patcher', 'index.js'), 'utf8'))
  .replace(/const\s*\{\s*isAsarIntegrityEnforced\s*\}\s*=\s*require\('\.\/fuse-check'\);?/g, '')
  .replace(/const\s*\{\s*DATA_DIR,\s*ensureBackup,\s*restoreFromBackup\s*\}\s*=\s*require\('\.\/backup'\);?/g, '')
  .replace(/const\s*\{[\s\S]*?\}\s*=\s*require\('\.\/asar-patcher'\);?/g, '');

const patcherBundle = `// Antigravity UI Japanese Localization Patcher CLI (v2.0.0)
'use strict';

let fs;
try {
  fs = require('original-fs');
} catch (_) {
  fs = require('fs');
}

const path = require('path');
const os = require('os');
const crypto = require('crypto');

${fuseCheckSrc}
${backupSrc}
${asarPatcherSrc}
${patcherIndexSrc}
`;

fs.writeFileSync(path.join(DIST_DIR, 'patcher.js'), patcherBundle, 'utf8');

console.log('Build completed successfully!');
console.log('Artifacts in dist/:');
console.log(' - dist/i18n_module.js  (' + (fs.statSync(path.join(DIST_DIR, 'i18n_module.js')).size / 1024).toFixed(1) + ' KB)');
console.log(' - dist/main_hook.js    (' + (fs.statSync(path.join(DIST_DIR, 'main_hook.js')).size / 1024).toFixed(1) + ' KB)');
console.log(' - dist/patcher.js      (' + (fs.statSync(path.join(DIST_DIR, 'patcher.js')).size / 1024).toFixed(1) + ' KB)');
