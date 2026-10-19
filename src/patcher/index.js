/**
 * index.js
 * パッチャー CLI のエントリーポイント
 * 実行: ELECTRON_RUN_AS_NODE=1 Antigravity.exe patcher.js [--restore] [--status] [--asar <path>]
 * または: node dist/patcher.js [--restore] [--status] [--asar <path>]
 */
'use strict';

let fs;
try {
  fs = require('original-fs');
} catch (_) {
  fs = require('fs');
}

const path = require('path');
const os = require('os');
const { isAsarIntegrityEnforced } = require('./fuse-check');
const { DATA_DIR, ensureBackup, restoreFromBackup } = require('./backup');
const {
  MARKER_BASE,
  readArchive,
  readEntry,
  stripMod,
  buildArchive,
  verifyArchive
} = require('./asar-patcher');

const VERSION = '2.0.0';
const MARKER = `${MARKER_BASE} v${VERSION}`;
const HERE = __dirname;
const IS_MAC = process.platform === 'darwin';

// 引数のパース
const args = process.argv.slice(2);
const isRestore = args.includes('--restore');
const isStatus = args.includes('--status');
const asarArgIdx = args.indexOf('--asar');

// 既定の app.asar パス解決
let defaultAsar;
if (IS_MAC) {
  defaultAsar = path.join(os.homedir(), 'Applications', 'Antigravity.app', 'Contents', 'Resources', 'app.asar');
} else {
  defaultAsar = path.join(
    process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'),
    'Programs',
    'antigravity',
    'resources',
    'app.asar'
  );
}

const asarPath = asarArgIdx >= 0 ? args[asarArgIdx + 1] : defaultAsar;

function log(msg) {
  const line = `[${new Date().toISOString()}] patcher: ${msg}`;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.appendFileSync(path.join(DATA_DIR, 'patch.log'), line + '\n', 'utf8');
  } catch (_) {}
  console.log(msg);
}

function run() {
  console.log(`=================================================`);
  console.log(` Google Antigravity Japanese Localization Patcher`);
  console.log(` Version: ${VERSION}`);
  console.log(` Target : ${asarPath}`);
  console.log(`=================================================`);

  if (!fs.existsSync(asarPath)) {
    console.error(`[ERROR] app.asar not found at: ${asarPath}`);
    process.exit(1);
  }

  const arc = readArchive(asarPath);
  const preload = readEntry(arc, 'dist/preload.js');
  const patchedNow = preload.includes(MARKER_BASE);

  // ステータス確認
  if (isStatus) {
    if (preload.includes(MARKER)) {
      console.log(`[STATUS] Patched with version: v${VERSION} (Active)`);
    } else if (patchedNow) {
      console.log(`[STATUS] Patched with another or older version.`);
    } else {
      console.log(`[STATUS] Not patched (Clean / Original).`);
    }
    return 0;
  }

  // 復元処理
  if (isRestore) {
    if (!patchedNow) {
      log('[RESTORE] Patch is not currently applied. Nothing to restore.');
      return 0;
    }
    log('[RESTORE] Restoring original app.asar...');
    try {
      restoreFromBackup(asarPath);
      log('[RESTORE] Restored successfully from backup.');
      return 0;
    } catch (e) {
      log(`[RESTORE] Backup restore failed: ${e.message}. Rebuilding clean asar...`);
    }
  }

  // 改ざん防止 Fuse チェック（パッチ適用時のみ）
  if (!isRestore) {
    const execPath = process.execPath;
    if (isAsarIntegrityEnforced(execPath)) {
      console.error('[ERROR] Electron Fuse (Asar Integrity) is enabled. Cannot patch safely.');
      process.exit(1);
    }
  }

  // 既に最新パッチが当たっている場合
  if (!isRestore && preload.includes(MARKER)) {
    log(`Already patched with v${VERSION}.`);
    return 0;
  }

  // 未パッチであればバックアップを確保
  if (!patchedNow) {
    ensureBackup(asarPath);
  }

  const origPreload = stripMod(preload);
  const origMain = stripMod(readEntry(arc, 'dist/main.js'));

  let newPreload = origPreload;
  let newMain = origMain;

  if (!isRestore) {
    const header = `\n// ${MARKER}\n`;
    const rendererModulePath = path.join(HERE, 'i18n_module.js');
    const mainHookPath = path.join(HERE, 'main_hook.js');

    if (!fs.existsSync(rendererModulePath) || !fs.existsSync(mainHookPath)) {
      console.error('[ERROR] Required patch payload modules (i18n_module.js / main_hook.js) missing.');
      process.exit(1);
    }

    newPreload += header + fs.readFileSync(rendererModulePath, 'utf8').replace(/^\uFEFF/, '');
    newMain += header + fs.readFileSync(mainHookPath, 'utf8').replace(/^\uFEFF/, '');
  }

  const replacements = {
    'dist/preload.js': newPreload,
    'dist/main.js': newMain
  };

  log('[BUILD] Building new asar archive...');
  const out = buildArchive(arc, replacements);

  log('[VERIFY] Verifying archive integrity...');
  if (!verifyArchive(arc, out, replacements)) {
    console.error('[ERROR] Verification failed. Target archive was not modified.');
    process.exit(1);
  }

  // 安全に置き換え
  const tmpPath = asarPath + '.ja-tmp';
  try {
    fs.writeFileSync(tmpPath, out);
    try {
      fs.renameSync(tmpPath, asarPath);
    } catch (_) {
      // Windows で renameSync が失敗した場合は copy & unlink
      fs.copyFileSync(tmpPath, asarPath);
      fs.unlinkSync(tmpPath);
    }
  } catch (err) {
    console.error(`[ERROR] Failed to write patched asar: ${err.message}`);
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    process.exit(1);
  }

  log(`[SUCCESS] Patch applied successfully! (v${VERSION})`);
  return 0;
}

try {
  run();
} catch (e) {
  console.error('[FATAL]', e);
  process.exit(1);
}
