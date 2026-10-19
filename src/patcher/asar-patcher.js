/**
 * asar-patcher.js
 * Chromium Pickle 形式の asar ヘッダー解析、ファイル抽出、再構築およびパッチ適用
 */
'use strict';

let fs;
try {
  fs = require('original-fs');
} catch (_) {
  fs = require('fs');
}

const path = require('path');
const crypto = require('crypto');

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

module.exports = {
  MARKER_BASE,
  readArchive,
  readEntry,
  stripMod,
  buildArchive,
  verifyArchive
};
