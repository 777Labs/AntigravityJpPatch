/**
 * dict-watcher.js
 * メインプロセス側でユーザー辞書（i18n_dict.json）を監視し、レンダラーへ配信するウォッチャー
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

class DictWatcher {
  /**
   * @param {import('electron').IpcMain} ipcMain
   * @param {typeof import('electron').BrowserWindow} BrowserWindow
   */
  constructor(ipcMain, BrowserWindow) {
    this.ipcMain = ipcMain;
    this.BrowserWindow = BrowserWindow;
    this.dictDir = path.join(os.homedir(), '.gemini', 'antigravity');
    this.dictFile = path.join(this.dictDir, 'i18n_dict.json');
    this.debounceTimer = null;
  }

  /**
   * 辞書ファイルを安全に読み取る（BOM除去・構文エラー防御）
   * @returns {Object|null}
   */
  readDict() {
    try {
      if (!fs.existsSync(this.dictFile)) {
        return {};
      }
      const raw = fs.readFileSync(this.dictFile, 'utf8').replace(/^\uFEFF/, '');
      return JSON.parse(raw);
    } catch (e) {
      console.error('[Antigravity-i18n Main] Failed to read custom dictionary:', e.message);
      return null;
    }
  }

  /**
   * 開いている全ウィンドウへ更新された辞書を配信
   */
  broadcast() {
    const dict = this.readDict();
    if (!dict) return; // 壊れた JSON の場合は配信しない

    const windows = this.BrowserWindow.getAllWindows();
    for (let i = 0; i < windows.length; i++) {
      const win = windows[i];
      if (!win.isDestroyed() && win.webContents) {
        win.webContents.send('i18n:dict-updated', dict);
      }
    }
  }

  /**
   * 監視と IPC ハンドラのセットアップ
   */
  setup() {
    // 1. IPC ハンドラ登録
    this.ipcMain.handle('i18n:get-dict', () => {
      return this.readDict() || {};
    });

    // 2. ディレクトリの存在を保証
    try {
      fs.mkdirSync(this.dictDir, { recursive: true });
    } catch (_) {}

    // 3. ファイル監視
    try {
      fs.watch(this.dictDir, (event, filename) => {
        if (filename && filename !== 'i18n_dict.json') return;
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.broadcast();
        }, 300);
      });
      console.log(`[Antigravity-i18n Main] Watching dictionary at: ${this.dictFile}`);
    } catch (err) {
      console.error('[Antigravity-i18n Main] fs.watch failed:', err.message);
    }
  }
}

module.exports = { DictWatcher };
