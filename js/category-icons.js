/*! 花璃匣 — 分类页图标美化 */
(function () {
  'use strict';

  // 分类名 → 图标映射
  var iconMap = {
    '默认': 'fas fa-folder',
    '技术': 'fas fa-code',
    '编程': 'fas fa-laptop-code',
    '生活': 'fas fa-heart',
    '随笔': 'fas fa-pen-fancy',
    '教程': 'fas fa-book-open',
    '项目': 'fas fa-rocket',
    '资源': 'fas fa-gem',
    '笔记': 'fas fa-sticky-note',
    '前端': 'fas fa-palette',
    '后端': 'fas fa-server',
    '工具': 'fas fa-wrench',
    '设计': 'fas fa-paint-brush',
    '游戏': 'fas fa-gamepad',
    '音乐': 'fas fa-music',
    '摄影': 'fas fa-camera',
    '旅行': 'fas fa-plane',
    '美食': 'fas fa-utensils',
    '读书': 'fas fa-book',
    '影视': 'fas fa-film',
    '日常': 'fas fa-coffee',
    '分享': 'fas fa-share-alt',
    '折腾': 'fas fa-flask',
    '建站': 'fas fa-globe',
    'Hexo': 'fas fa-blog',
    'CSS': 'fab fa-css3-alt',
    'JavaScript': 'fab fa-js',
    'Python': 'fab fa-python',
    'Java': 'fab fa-java',
    'Linux': 'fab fa-linux',
    'Docker': 'fab fa-docker',
    'Git': 'fab fa-git-alt',
    'GitHub': 'fab fa-github'
  };

  var defaultIcon = 'fas fa-folder-open';

  function addIcons() {
    // 分类页面列表
    var categoryLinks = document.querySelectorAll('.category-list a');
    categoryLinks.forEach(function (link) {
      if (link.querySelector('.cat-icon')) return;
      var name = link.textContent.replace(/\d+/g, '').trim();
      var icon = iconMap[name] || defaultIcon;
      var iconEl = document.createElement('i');
      iconEl.className = icon + ' cat-icon';
      iconEl.style.cssText = 'margin-right:6px;font-size:.85em;color:#FF85A2;';
      link.insertBefore(iconEl, link.firstChild);
    });

    // 侧边栏分类卡片
    var cardLinks = document.querySelectorAll('.card-category-list-item a');
    cardLinks.forEach(function (link) {
      if (link.querySelector('.cat-icon')) return;
      var name = link.textContent.replace(/\d+/g, '').trim();
      var icon = iconMap[name] || defaultIcon;
      var iconEl = document.createElement('i');
      iconEl.className = icon + ' cat-icon';
      iconEl.style.cssText = 'margin-right:5px;font-size:.8em;color:#FF85A2;';
      link.insertBefore(iconEl, link.firstChild);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addIcons);
  } else {
    addIcons();
  }

  document.addEventListener('pjax:complete', addIcons);
})();