/**
 * fuse-check.js
 * Electron の Fuse（改ざん検知機能）の状態を確認する
 */
'use strict';

const fs = require('fs');
const path = require('path');

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

module.exports = { isAsarIntegrityEnforced };
