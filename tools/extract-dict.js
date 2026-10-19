/**
 * extract-dict.js
 * 既存の i18n_module.js から辞書データを抽出し、カテゴリ別 JSON 辞書に分離・整理するツール
 */
const fs = require('fs');
const path = require('path');

const SOURCE_PATH = path.join(process.env.LOCALAPPDATA || '', 'antigravity-ja', 'i18n_module.js');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'src', 'dictionaries');

if (!fs.existsSync(SOURCE_PATH)) {
  console.error(`Source file not found: ${SOURCE_PATH}`);
  process.exit(1);
}

const content = fs.readFileSync(SOURCE_PATH, 'utf8');

// 1. GENERATED_MAP の抽出
const mapStart = content.indexOf('const GENERATED_MAP = /*GENERATED*/{');
const mapEnd = content.indexOf('};\n\nconst REGEX_RULES = [', mapStart);

if (mapStart === -1 || mapEnd === -1) {
  console.error('Failed to locate GENERATED_MAP in source file');
  process.exit(1);
}

const mapRaw = content.slice(mapStart + 'const GENERATED_MAP = /*GENERATED*/'.length, mapEnd + 1);

let generatedMap;
try {
  // 安全に評価するため Function を使用
  generatedMap = new Function(`return ${mapRaw}`)();
} catch (e) {
  console.error('Failed to parse GENERATED_MAP:', e);
  process.exit(1);
}

const keys = Object.keys(generatedMap);
console.log(`Extracted ${keys.length} entries from GENERATED_MAP.`);

// 2. カテゴリ分類の定義
const uiEntries = {};
const settingsEntries = {};
const dialogsEntries = {};

const dialogKeywords = [
  '?', 'Are you sure', 'Do you want', 'Warning', 'Danger', 'Confirm',
  'Cancel', 'Allow', 'Deny', 'Proceed', 'Discard', 'Action Required',
  'Permission', 'An error occurred', 'Failed to'
];

const settingsKeywords = [
  'settings', 'preference', 'configuration', 'option', 'defaults',
  'enable', 'disable', 'toggle', 'api key', 'token', 'shortcut',
  'keybinding', 'theme', 'font', 'environment', 'variable', 'path to'
];

for (const [key, val] of Object.entries(generatedMap)) {
  const lowerKey = key.toLowerCase();
  
  // ダイアログ・通知・パーミッション系
  if (dialogKeywords.some(kw => lowerKey.includes(kw.toLowerCase()))) {
    dialogsEntries[key] = val;
  }
  // 設定・環境・詳細オプション系
  else if (settingsKeywords.some(kw => lowerKey.includes(kw.toLowerCase()))) {
    settingsEntries[key] = val;
  }
  // 一般 UI（ボタン、ラベル、メニュー、タブ等）
  else {
    uiEntries[key] = val;
  }
}

// 辞書オブジェクトをキー名アルファベット順（大文字小文字区別なし）でソート
function sortDict(obj) {
  const sorted = {};
  for (const k of Object.keys(obj).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))) {
    sorted[k] = obj[k];
  }
  return sorted;
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

fs.writeFileSync(path.join(OUTPUT_DIR, 'ui.json'), JSON.stringify(sortDict(uiEntries), null, 2), 'utf8');
fs.writeFileSync(path.join(OUTPUT_DIR, 'settings.json'), JSON.stringify(sortDict(settingsEntries), null, 2), 'utf8');
fs.writeFileSync(path.join(OUTPUT_DIR, 'dialogs.json'), JSON.stringify(sortDict(dialogsEntries), null, 2), 'utf8');

console.log(`- ui.json: ${Object.keys(uiEntries).length} entries`);
console.log(`- settings.json: ${Object.keys(settingsEntries).length} entries`);
console.log(`- dialogs.json: ${Object.keys(dialogsEntries).length} entries`);

// 3. REGEX_RULES の抽出
// REGEX_RULES は JavaScript の関数を含んでいるため、patterns.js またはルール定義 JSON として抽出
const rulesStart = content.indexOf('const REGEX_RULES = [');
const rulesEnd = content.indexOf('function initI18n() {', rulesStart);

if (rulesStart !== -1 && rulesEnd !== -1) {
  const rulesCode = content.slice(rulesStart, rulesEnd).trim();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'patterns.js'), `// 動的正規表現マッチング・置換ルール群\nmodule.exports = ${rulesCode.replace('const REGEX_RULES = ', '')}\n`, 'utf8');
  console.log(`- patterns.js: Extracted regex rules successfully.`);
}

console.log('Extraction completed successfully!');
