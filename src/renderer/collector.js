/**
 * collector.js
 * 画面上の未翻訳英語テキストを自動収集し、辞書作成を支援する開発者支援ツール
 */
'use strict';

const { isValidText } = require('./filter');

class Collector {
  constructor() {
    this.enabled = false;
    this.untranslatedSet = new Set();
    this.checkEnabled();
  }

  checkEnabled() {
    try {
      if (typeof window !== 'undefined') {
        this.enabled = !!(
          window.__AGY_JA_DEBUG__ ||
          (window.localStorage && window.localStorage.getItem('agy_ja_collect') === 'true')
        );
      }
    } catch (_) {
      this.enabled = false;
    }
  }

  /**
   * 未翻訳候補を記録
   * @param {string} text
   */
  record(text) {
    if (!this.enabled || !text) return;
    const trimmed = text.trim();
    if (!isValidText(trimmed)) return;

    // アルファベットが含まれ、日本語（ひらがな・カタカナ・漢字）が含まれていない場合に対象
    const hasLatin = /[a-zA-Z]/.test(trimmed);
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(trimmed);

    if (hasLatin && !hasJapanese) {
      this.untranslatedSet.add(trimmed);
    }
  }

  /**
   * 収集した未翻訳テキストをエクスポート
   */
  export() {
    const list = Array.from(this.untranslatedSet).sort();
    const result = {};
    list.forEach(k => { result[k] = ""; });
    const jsonStr = JSON.stringify(result, null, 2);
    console.log(`[Antigravity-i18n Collector] Exported ${list.length} untranslated strings:`);
    console.log(jsonStr);
    return result;
  }
}

module.exports = { Collector };
