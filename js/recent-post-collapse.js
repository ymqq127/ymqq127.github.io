/*! 侧边栏卡片折叠 — 最新文章 / 最新评论，默认收起，点击标题展开，记忆偏好 */
(function () {
  'use strict';

  // 需要折叠的卡片选择器 → localStorage 键名
  var CARDS = [
    { selector: '.card-recent-post', key: 'collapse-recent-post' },
    { selector: '#card-newest-comments', key: 'collapse-newest-comments' }
  ];

  function getPref(key) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? '1' : v;
    } catch (e) { return '1'; }
  }

  function setPref(key, v) {
    try { localStorage.setItem(key, v); } catch (e) {}
  }

  function initCard(cfg) {
    var card = document.querySelector(cfg.selector);
    if (!card) return;
    if (card.querySelector('.collapse-toggle')) return;

    var headline = card.querySelector('.item-headline');
    if (!headline) return;

    var toggle = document.createElement('i');
    toggle.className = 'fas fa-chevron-down collapse-toggle';
    headline.appendChild(toggle);

    if (getPref(cfg.key) === '1') card.classList.add('is-collapsed');

    headline.addEventListener('click', function () {
      var collapsed = card.classList.toggle('is-collapsed');
      setPref(cfg.key, collapsed ? '1' : '0');
    });
  }

  function init() {
    CARDS.forEach(initCard);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('pjax:complete', init);
})();