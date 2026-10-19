/**
 * backup.js
 * app.asar の安全なバックアップ、復元、およびパッチ状態診断
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

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

module.exports = {
  DATA_DIR,
  BACKUP_DIR,
  BACKUP_ASAR,
  ensureBackup,
  restoreFromBackup
};
