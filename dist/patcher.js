// Antigravity UI Japanese Localization Patcher CLI (v2.0.0)
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

/**
 * fuse-check.js
 * Electron の Fuse（改ざん検知機能）の状態を確認する
 */





const FUSE_WIRE = 'dL7pKGdnNz796PbbjQWNKmHXBZaB9tsX';

/**
 * asar 改ざん防止 Fuse が有効化されているかを判定
 * @param {string} execPath 実行バイナリパス（通常は Antigravity.exe）
 * @returns {boolean} true の場合は改ざん検知が有効（書き換え不可）
 */
function isAsarIntegrityEnforced(execPath) {
  const isMac = process.platform === 'darwin';
  const targetBin = isMac
    ? path.join(path.dirname(execPath), '..', 'Frameworks', 'Electron Framework.framework', 'Electron Framework')
    : execPath;

  if (!fs.existsSync(targetBin)) {
    // 判定できない場合は安全側に倒す
    return isMac;
  }

  try {
    const buf = fs.readFileSync(targetBin);
    const idx = buf.indexOf(FUSE_WIRE);
    if (idx < 0) return false;

    const fuseWireLength = buf[idx + 33];
    // 5番目の fuse が EnableEmbeddedAsarIntegrityValidation
    // 0x31 = '1' (有効), 0x30 = '0' (無効)
    if (fuseWireLength > 4) {
      return buf[idx + 34 + 4] === 0x31;
    }
  } catch (e) {
    console.error('[fuse-check] Error inspecting executable:', e.message);
  }

  return false;
}



/**
 * backup.js
 * app.asar の安全なバックアップ、復元、およびパッチ状態診断
 */






const DATA_DIR = process.platform === 'darwin'
  ? path.join(os.homedir(), 'Library', 'Application Support', 'antigravity-ja')
  : path.join(process.env.LOCALAPPDATA || os.homedir(), 'antigravity-ja');

const BACKUP_DIR = path.join(DATA_DIR, 'backup');
const BACKUP_ASAR = path.join(BACKUP_DIR, 'app.asar');

/**
 * 未パッチの原本 asar をバックアップ
 * @param {string} sourceAsar
 */
function ensureBackup(sourceAsar) {
  if (!fs.existsSync(BACKUP_ASAR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    fs.copyFileSync(sourceAsar, BACKUP_ASAR);
    console.log(`[backup] Original app.asar backed up to: ${BACKUP_ASAR}`);
  }
}

/**
 * バックアップから app.asar を復元
 * @param {string} targetAsar
 */
function restoreFromBackup(targetAsar) {
  if (!fs.existsSync(BACKUP_ASAR)) {
    throw new Error(`Backup file not found at: ${BACKUP_ASAR}`);
  }
  fs.copyFileSync(BACKUP_ASAR, targetAsar);
  console.log(`[backup] Restored original app.asar from backup.`);
}



/**
 * asar-patcher.js
 * Chromium Pickle 形式の asar ヘッダー解析、ファイル抽出、再構築およびパッチ適用
 */







const BLOCK_SIZE = 4 * 1024 * 1024; // 4MB
const MARKER_BASE = 'Antigravity UI Japanese Localization Mod';

/**
 * asar アーカイブを読み込み、ヘッダーとデータ部を分離
 * @param {string} filePath
 */
function readArchive(filePath) {
  const buf = fs.readFileSync(filePath);
  const headerSize = buf.readUInt32LE(4);
  const strLen = buf.readUInt32LE(12);
  const header = JSON.parse(buf.toString('utf8', 16, 16 + strLen));
  const base = 8 + headerSize;
  return { buf, header, data: buf.subarray(base) };
}

/**
 * ヘッダーからエントリノードを探索
 */
function findEntry(header, targetPath) {
  let node = header;
  for (const part of targetPath.split('/')) {
    node = node.files && node.files[part];
    if (!node) throw new Error(`asar does not contain: ${targetPath}`);
  }
  return node;
}

/**
 * asar 内ファイルの生バッファを取得
 */
function readRaw(archive, targetPath) {
  const e = findEntry(archive.header, targetPath);
  if (e.unpacked) throw new Error(`${targetPath} is unpacked`);
  const off = Number(e.offset);
  return archive.data.subarray(off, off + e.size);
}

/**
 * asar 内ファイルを UTF-8 文字列として取得
 */
function readEntry(archive, targetPath) {
  return readRaw(archive, targetPath).toString('utf8');
}

/**
 * ヘッダー内の全ファイル数をカウント
 */
function countFiles(node) {
  let count = 0;
  for (const k of Object.keys(node.files || {})) {
    count += 1 + countFiles(node.files[k]);
  }
  return count;
}

/**
 * SHA256 integrity 情報を計算
 */
function calculateIntegrity(buf) {
  const blocks = [];
  for (let i = 0; i < buf.length; i += BLOCK_SIZE) {
    blocks.push(crypto.createHash('sha256').update(buf.subarray(i, i + BLOCK_SIZE)).digest('hex'));
  }
  return {
    algorithm: 'SHA256',
    hash: crypto.createHash('sha256').update(buf).digest('hex'),
    blockSize: BLOCK_SIZE,
    blocks
  };
}

/**
 * 以前のパッチ（MARKER_BASE）を除去して元に戻す
 */
function stripMod(text) {
  const idx = text.indexOf('\n// ' + MARKER_BASE);
  return idx >= 0 ? text.slice(0, idx) : text;
}

/**
 * 指定ファイルを置き換えた新しい asar バイナリを再構築
 * @param {Object} archive
 * @param {Record<string, string>} replacements パス -> 新しい中身文字列
 * @returns {Buffer}
 */
function buildArchive(archive, replacements) {
  const header = JSON.parse(JSON.stringify(archive.header));
  const chunks = [];
  let offset = 0;

  function walk(node, prefix) {
    for (const name of Object.keys(node.files || {})) {
      const e = node.files[name];
      const p = prefix ? `${prefix}/${name}` : name;
      if (e.files) {
        walk(e, p);
        continue;
      }
      if (e.unpacked || e.link) continue;

      let body;
      if (p in replacements) {
        body = Buffer.from(replacements[p], 'utf8');
        e.size = body.length;
        e.integrity = calculateIntegrity(body);
      } else {
        const off = Number(e.offset);
        body = archive.data.subarray(off, off + e.size);
      }

      e.offset = String(offset);
      chunks.push(body);
      offset += body.length;
    }
  }

  walk(header, '');

  const headerStr = Buffer.from(JSON.stringify(header), 'utf8');
  const pad = (4 - (headerStr.length % 4)) % 4;
  const headerPickle = Buffer.alloc(8 + headerStr.length + pad);
  headerPickle.writeUInt32LE(4 + headerStr.length + pad, 0);
  headerPickle.writeUInt32LE(headerStr.length, 4);
  headerStr.copy(headerPickle, 8);

  const sizePickle = Buffer.alloc(8);
  sizePickle.writeUInt32LE(4, 0);
  sizePickle.writeUInt32LE(headerPickle.length, 4);

  return Buffer.concat([sizePickle, headerPickle, ...chunks]);
}

/**
 * 生成された asar の妥当性を検証
 */
function verifyArchive(originalArchive, newArchiveBuffer, replacements) {
  // 一時ファイルから読み直す
  const check = (function parseFromBuffer(buf) {
    const headerSize = buf.readUInt32LE(4);
    const strLen = buf.readUInt32LE(12);
    const header = JSON.parse(buf.toString('utf8', 16, 16 + strLen));
    const base = 8 + headerSize;
    return { header, data: buf.subarray(base) };
  })(newArchiveBuffer);

  if (countFiles(check.header) !== countFiles(originalArchive.header)) {
    return false;
  }

  let ok = true;
  function walk(node, prefix) {
    for (const name of Object.keys(node.files || {})) {
      const e = node.files[name];
      const p = prefix ? `${prefix}/${name}` : name;
      if (e.files) {
        walk(e, p);
        continue;
      }
      if (e.unpacked || e.link) continue;

      const want = p in replacements ? Buffer.from(replacements[p], 'utf8') : readRaw(originalArchive, p);
      const eCheck = findEntry(check.header, p);
      const got = check.data.subarray(Number(eCheck.offset), Number(eCheck.offset) + eCheck.size);
      if (!got.equals(want)) {
        ok = false;
        break;
      }
    }
  }

  walk(originalArchive.header, '');
  return ok;
}



/**
 * index.js
 * パッチャー CLI のエントリーポイント
 * 実行: ELECTRON_RUN_AS_NODE=1 Antigravity.exe patcher.js [--restore] [--status] [--asar <path>]
 * または: node dist/patcher.js [--restore] [--status] [--asar <path>]
 */










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

