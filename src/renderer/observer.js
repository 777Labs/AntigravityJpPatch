/**
 * observer.js
 * 最適化された DOM MutationObserver およびテキスト/属性の動的置換エンジン
 */
'use strict';

const { isExcluded, isValidText } = require('./filter');

class DomObserver {
  /**
   * @param {import('./matcher').Matcher} matcher
   * @param {import('./collector').Collector} collector
   */
  constructor(matcher, collector) {
    this.matcher = matcher;
    this.collector = collector;
    this.processedNodes = new WeakSet();
    this.pendingNodes = [];
    this.batchTimer = null;
    this.TARGET_ATTRS = ['title', 'placeholder', 'aria-label'];
  }

  /**
   * 単一テキストノードの置換
   * @param {Text} node
   * @param {string} origText
   */
  translateTextNode(node, origText) {
    const trans = this.matcher.translate(origText);
    if (trans && trans !== origText) {
      node.__agyOrig = origText;
      if (node.nodeValue !== trans) {
        node.nodeValue = trans;
      }
    } else {
      this.collector.record(origText);
    }
  }

  /**
   * 単一要素の属性置換
   * @param {Element} el
   * @param {string} attr
   * @param {string} origVal
   */
  translateAttribute(el, attr, origVal) {
    const trans = this.matcher.translate(origVal);
    if (trans && trans !== origVal) {
      el.__agyOrigAttr = el.__agyOrigAttr || {};
      el.__agyOrigAttr[attr] = origVal;
      if (el.getAttribute(attr) !== trans) {
        el.setAttribute(attr, trans);
      }
    } else {
      this.collector.record(origVal);
    }
  }

  /**
   * ノードおよび子孫ノードを再帰走査して翻訳
   * @param {Node} node
   */
  processNode(node) {
    if (!node) return;

    // テキストノードの場合
    if (node.nodeType === Node.TEXT_NODE) {
      if (isExcluded(node)) return;
      if (!isValidText(node.nodeValue)) return;
      this.translateTextNode(node, node.__agyOrig || node.nodeValue);
      return;
    }

    // 要素ノードの場合
    if (node.nodeType === Node.ELEMENT_NODE) {
      const isField = node.tagName === 'INPUT' || node.tagName === 'TEXTAREA';

      // 属性の翻訳
      for (let i = 0; i < this.TARGET_ATTRS.length; i++) {
        const attr = this.TARGET_ATTRS[i];
        const val = node.getAttribute(attr);
        if (val) {
          const orig = (node.__agyOrigAttr && node.__agyOrigAttr[attr]) || val;
          this.translateAttribute(node, attr, orig);
        }
      }

      // 入力フィールドまたは除外タグの場合は子ノードの走査をスキップ
      if (isField || isExcluded(node)) return;

      for (let child = node.firstChild; child; child = child.nextSibling) {
        this.processNode(child);
      }
    }
  }

  /**
   * キューに溜まったノードをバッチ処理
   */
  flushPending() {
    this.batchTimer = null;
    const nodes = this.pendingNodes;
    this.pendingNodes = [];
    for (let i = 0; i < nodes.length; i++) {
      this.processNode(nodes[i]);
    }
  }

  /**
   * ノードの処理をデバウンスしてキューイング
   * @param {Node} node
   */
  queueNode(node) {
    this.pendingNodes.push(node);
    if (!this.batchTimer) {
      this.batchTimer = requestAnimationFrame(() => this.flushPending());
    }
  }

  /**
   * 全DOMの再翻訳（カスタム辞書が更新された際に実行）
   */
  retranslateAll() {
    if (!document.body) return;

    // 1. テキストノードの再翻訳
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.__agyOrig) {
        const trans = this.matcher.translate(node.__agyOrig) || node.__agyOrig;
        if (node.nodeValue !== trans) {
          node.nodeValue = trans;
        }
      }
    }

    // 2. 属性の再翻訳
    const selector = this.TARGET_ATTRS.map(a => `[${a}]`).join(',');
    document.querySelectorAll(selector).forEach((el) => {
      if (!el.__agyOrigAttr) return;
      for (const attr in el.__agyOrigAttr) {
        const orig = el.__agyOrigAttr[attr];
        const trans = this.matcher.translate(orig) || orig;
        if (el.getAttribute(attr) !== trans) {
          el.setAttribute(attr, trans);
        }
      }
    });

    // 3. 新しく追加された未翻訳部分も含めて一度全体走査
    this.processNode(document.body);
  }

  /**
   * 監視開始
   */
  start() {
    const scanAll = () => {
      if (document.body) {
        this.processNode(document.body);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', scanAll);
    } else {
      scanAll();
    }

    const observer = new MutationObserver((mutations) => {
      for (let i = 0; i < mutations.length; i++) {
        const m = mutations[i];
        if (m.type === 'childList') {
          for (let j = 0; j < m.addedNodes.length; j++) {
            this.queueNode(m.addedNodes[j]);
          }
        } else if (m.type === 'characterData') {
          if (!isExcluded(m.target)) {
            const orig = m.target.__agyOrig || m.target.nodeValue;
            this.translateTextNode(m.target, orig);
          }
        } else if (m.type === 'attributes') {
          const attr = m.attributeName;
          const val = m.target.getAttribute(attr);
          if (val) {
            const orig = (m.target.__agyOrigAttr && m.target.__agyOrigAttr[attr]) || val;
            this.translateAttribute(m.target, attr, orig);
          }
        }
      }
    });

    const root = document.documentElement || document;
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: this.TARGET_ATTRS
    });

    console.log('[Antigravity-i18n] DOM Observer started.');
  }
}

module.exports = { DomObserver };
