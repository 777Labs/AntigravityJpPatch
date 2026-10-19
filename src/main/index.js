/**
 * index.js
 * メインプロセス側のエントリーポイント（main.js へ注入されるバンドルの核）
 */
'use strict';

const { DictWatcher } = require('./dict-watcher');

function initMain() {
  try {
    const { ipcMain, BrowserWindow } = require('electron');
    if (!ipcMain || !BrowserWindow) {
      return;
    }
    const watcher = new DictWatcher(ipcMain, BrowserWindow);
    watcher.setup();
  } catch (err) {
    console.error('[Antigravity-i18n Main] Initialization failed:', err.message);
  }
}

module.exports = { initMain };
