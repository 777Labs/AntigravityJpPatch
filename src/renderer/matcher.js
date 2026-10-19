/**
 * matcher.js
 * 辞書データおよび動的正規表現ルールに基づくテキスト翻訳マッチャー
 */
'use strict';

class Matcher {
  /**
   * @param {Object} staticDict 基本辞書（ui + settings + dialogs）
   * @param {Array} regexRules 正規表現ルール配列
   */
  constructor(staticDict = {}, regexRules = []) {
    this.staticDict = Object.assign({}, staticDict);
    this.customDict = {};
    this.regexRules = regexRules;
    this.cache = new Map();
    this.MAX_CACHE_SIZE = 5000;
  }

  /**
   * カスタム辞書（ユーザー辞書）を更新
   * @param {Object} dict
   */
  setCustomDict(dict) {
    if (!dict || typeof dict !== 'object') return;
    this.customDict = Object.assign({}, dict);
    delete this.customDict._comment;
    this.cache.clear(); // 辞書更新時はキャッシュをクリア
  }

  /**
   * 指定テキストの翻訳を試みる
   * @param {string} text 元のテキスト
   * @returns {string|null} 翻訳後のテキスト、または一致しない場合は null
   */
  translate(text) {
    if (!text) return null;
    const trimmed = text.trim();
    if (!trimmed) return null;

    // キャッシュチェック
    if (this.cache.has(trimmed)) {
      const cached = this.cache.get(trimmed);
      return cached ? text.replace(trimmed, cached) : null;
    }

    let result = null;

    // 1. ユーザーカスタム辞書（最優先）
    if (Object.prototype.hasOwnProperty.call(this.customDict, trimmed)) {
      result = this.customDict[trimmed];
    }
    // 2. 静的辞書（完全一致）
    else if (Object.prototype.hasOwnProperty.call(this.staticDict, trimmed)) {
      result = this.staticDict[trimmed];
    }
    // 3. 正規表現ルール
    else {
      for (let i = 0; i < this.regexRules.length; i++) {
        const rule = this.regexRules[i];
        if (rule.pattern.test(trimmed)) {
          result = trimmed.replace(rule.pattern, rule.replace);
          break;
        }
      }
    }

    // キャッシュへの保存（上限チェック付き）
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cache.clear();
    }
    this.cache.set(trimmed, result);

    return result ? text.replace(trimmed, result) : null;
  }
}

module.exports = { Matcher };
