/*! Mobile TOC — 移动端默认折叠子目录 + 点击外部关闭面板 */
(function () {
  'use strict';
  var toc = document.getElementById('card-toc');
  if (!toc) return;

  function handleMobile() {
    var content = toc.querySelector('.toc-content');
    if (!content) return;
    if (window.innerWidth <= 900) {
      content.classList.remove('is-expand');
    } else {
      // 桌面端恢复展开
      if (!content.classList.contains('is-expand')) {
        content.classList.add('is-expand');
      }
    }
  }

  // 初始化 + 窶换尺寸
  handleMobile();
  window.addEventListener('resize', handleMobile);

  // 面板打开时确保移除is-expand
  var observer = new MutationObserver(function () {
    if (toc.classList.contains('open') && window.innerWidth <= 900) {
      var content = toc.querySelector('.toc-content');
      if (content) content.classList.remove('is-expand');
    }
  });
  observer.observe(toc, { attributes: true, attributeFilter: ['class'] });

  // 点击外部关闭面板
  document.addEventListener('click', function (e) {
    if (window.innerWidth > 900) return;
    if (!toc.classList.contains('open')) return;
    if (toc.contains(e.target)) return;
    if (e.target.closest('#mobile-toc-button')) return;
    toc.classList.remove('open');
  });
})();