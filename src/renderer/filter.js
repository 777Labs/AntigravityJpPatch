/**
 * filter.js
 * レンダラー内での翻訳対象外要素（コード、プロンプト、会話本文、エディタなど）のフィルタリング
 */
'use strict';

const EXCLUDED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'CODE',
  'PRE',
  'TEXTAREA',
  'INPUT',
  'SVG',
  'CANVAS'
]);

const EXCLUDED_CLASSES = [
  'prose',
  'code-block',
  'markdown',
  'artifact-content'
];

/**
 * ノードが翻訳対象外の親要素に含まれているかを判定
 * @param {Node} node
 * @returns {boolean}
 */
function isExcluded(node) {
  let curr = node.parentElement;
  while (curr) {
    if (EXCLUDED_TAGS.has(curr.tagName)) return true;
    if (curr.isContentEditable) return true;
    if (curr.classList) {
      for (let i = 0; i < EXCLUDED_CLASSES.length; i++) {
        if (curr.classList.contains(EXCLUDED_CLASSES[i])) return true;
      }
    }
    curr = curr.parentElement;
  }
  return false;
}

/**
 * テキストが翻訳対象として意味のある文字列かどうかを判定
 * @param {string} text
 * @returns {boolean}
 */
function isValidText(text) {
  if (!text) return false;
  return text.trim().length > 0;
}

module.exports = {
  EXCLUDED_TAGS,
  EXCLUDED_CLASSES,
  isExcluded,
  isValidText
};
