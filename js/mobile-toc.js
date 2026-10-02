/*! Mobile TOC — 手机端目录默认隐藏，按钮切换开合 */
(function () {
  'use strict';

  function init() {
    var toc = document.getElementById('card-toc');
    if (!toc) return;

    // 确保手机端初始状态：面板关闭 + 子目录折叠
    if (window.innerWidth <= 900) {
      toc.classList.remove('open');
      toc.setAttribute('aria-expanded', 'false');
      var content = toc.querySelector('.toc-content');
      if (content) content.classList.remove('is-expand');
    } else {
      toc.setAttribute('aria-expanded', 'true');
    }

    // 监听面板开关，同步 aria-expanded + 子目录折叠
    var observer = new MutationObserver(function () {
      var isOpen = toc.classList.contains('open');
      toc.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen && window.innerWidth <= 900) {
        var content = toc.querySelector('.toc-content');
        if (content) content.classList.remove('is-expand');
      }
    });
    observer.observe(toc, { attributes: true, attributeFilter: ['class'] });

    // 点击面板外部关闭
    document.addEventListener('click', function (e) {
      if (window.innerWidth > 900) return;
      if (!toc.classList.contains('open')) return;
      if (toc.contains(e.target)) return;
      if (e.target.closest('#mobile-toc-button')) return;
      toc.classList.remove('open');
    });
  }

  // 初始化 + PJAX 兼容
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('pjax:complete', init);
})();