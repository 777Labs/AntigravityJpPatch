/**
 * validate-dict.js
 * 辞書ファイルの構文チェック、重複キー、空の翻訳値、BOMなどの異常を検出するバリデーター
 */
const fs = require('fs');
const path = require('path');

const DICT_DIR = path.resolve(__dirname, '..', 'src', 'dictionaries');
const jsonFiles = ['ui.json', 'settings.json', 'dialogs.json'];

let totalErrors = 0;
let totalWarnings = 0;
const seenKeys = new Map();

console.log('=== Checking Dictionary Files ===');

jsonFiles.forEach((file) => {
  const filePath = path.join(DICT_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] File missing: ${file}`);
    totalErrors++;
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf8');

  // BOM チェック
  if (raw.charCodeAt(0) === 0xFEFF) {
    console.warn(`[WARN] ${file}: Contains UTF-8 BOM. Stripping is recommended.`);
    totalWarnings++;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`[ERROR] ${file}: Invalid JSON syntax - ${e.message}`);
    totalErrors++;
    return;
  }

  let count = 0;
  for (const [key, val] of Object.entries(data)) {
    count++;
    if (typeof val !== 'string') {
      console.error(`[ERROR] ${file}: Value for key "${key}" is not a string.`);
      totalErrors++;
    } else if (val.trim() === '') {
      console.warn(`[WARN] ${file}: Empty translation for key "${key}"`);
      totalWarnings++;
    }

    if (seenKeys.has(key)) {
      console.warn(`[WARN] Duplicate key across files: "${key}" in both ${seenKeys.get(key)} and ${file}`);
      totalWarnings++;
    } else {
      seenKeys.set(key, file);
    }
  }

  console.log(`- ${file}: Validated ${count} entries.`);
});

// patterns.js の構文確認
const patternsPath = path.join(DICT_DIR, 'patterns.js');
if (fs.existsSync(patternsPath)) {
  try {
    const rules = require(patternsPath);
    if (Array.isArray(rules)) {
      console.log(`- patterns.js: Validated ${rules.length} regex rules.`);
    } else {
      console.error('[ERROR] patterns.js does not export an array.');
      totalErrors++;
    }
  } catch (e) {
    console.error(`[ERROR] patterns.js syntax error: ${e.message}`);
    totalErrors++;
  }
} else {
  console.warn('[WARN] patterns.js not found.');
  totalWarnings++;
}

console.log('=================================');
console.log(`Result: ${totalErrors} errors, ${totalWarnings} warnings.`);

if (totalErrors > 0) {
  process.exit(1);
} else {
  console.log('All dictionaries passed validation successfully!');
}
