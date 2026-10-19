/**
 * index.js
 * レンダラープロセス側のエントリーポイント（preload.js へ注入されるバンドルの核）
 */
'use strict';

const { Matcher } = require('./matcher');
const { Collector } = require('./collector');
const { DomObserver } = require('./observer');

function initRenderer(staticDict, regexRules) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const matcher = new Matcher(staticDict, regexRules);
  const collector = new Collector();
  const observer = new DomObserver(matcher, collector);

  // 開発者用グローバル公開
  window.__AGY_JA__ = {
    matcher,
    collector,
    observer,
    exportUntranslated: () => collector.export(),
    retranslate: () => observer.retranslateAll()
  };

  // 監視開始
  observer.start();

  // IPC 連携（カスタム辞書の取得と動的更新）
  try {
    const { ipcRenderer } = require('electron');

    const applyDict = (dict, action) => {
      if (dict && typeof dict === 'object') {
        matcher.setCustomDict(dict);
        observer.retranslateAll();
        console.log(`[Antigravity-i18n] Custom dict ${action}: ${Object.keys(dict).length} entries`);
      }
    };

    // 初期辞書読み込み
    ipcRenderer.invoke('i18n:get-dict')
      .then(dict => applyDict(dict, 'loaded'))
      .catch(err => console.error('[Antigravity-i18n] Failed to load custom dictionary:', err));

    // 辞書更新イベント受信
    ipcRenderer.on('i18n:dict-updated', (_event, dict) => {
      applyDict(dict, 'updated');
    });
  } catch (err) {
    console.warn('[Antigravity-i18n] ipcRenderer is not accessible in this context:', err);
  }

  console.log('[Antigravity-i18n] Japanese localization module loaded.');
}

module.exports = { initRenderer };
