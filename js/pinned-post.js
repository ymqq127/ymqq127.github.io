(function () {
  'use strict';

  var PINNED_POSTS = [
    {
      url: '/posts/56950e97.html',
      title: 'AVG资源汇总指路站（文游+单机+工具）',
      desc: 'BLG·乙女向·Gal·综合单机·工具类一站式资源导航',
      cover: '/img/juugou/image44.webp',
      tag: '资源汇总'
    }
  ];

  function isHome() {
    var p = location.pathname;
    return p === '/' || p === '/index.html';
  }

  function buildCard(post) {
    var card = document.createElement('div');
    card.className = 'card-widget card-pinned';

    var inner = document.createElement('div');
    inner.className = 'pinned-inner';

    var badge = document.createElement('div');
    badge.className = 'pinned-badge';
    badge.innerHTML = '<i class="fas fa-thumbtack"></i> 置顶';

    var link = document.createElement('a');
    link.className = 'pinned-link';
    link.href = post.url;
    link.title = post.title;

    var cover = document.createElement('div');
    cover.className = 'pinned-cover';
    var img = document.createElement('img');
    img.src = post.cover;
    img.alt = post.title;
    img.loading = 'lazy';
    img.onerror = function () { cover.style.display = 'none'; };
    cover.appendChild(img);

    var info = document.createElement('div');
    info.className = 'pinned-info';

    var title = document.createElement('div');
    title.className = 'pinned-title';
    title.textContent = post.title;

    var desc = document.createElement('div');
    desc.className = 'pinned-desc';
    desc.textContent = post.desc;

    var meta = document.createElement('div');
    meta.className = 'pinned-meta';
    meta.innerHTML = '<span class="pinned-tag"><i class="fas fa-tag"></i> ' + post.tag + '</span><span class="pinned-go">前往阅读 <i class="fas fa-arrow-right"></i></span>';

    info.appendChild(title);
    info.appendChild(desc);
    info.appendChild(meta);
    link.appendChild(cover);
    link.appendChild(info);
    inner.appendChild(badge);
    inner.appendChild(link);
    card.appendChild(inner);

    return card;
  }

  function init() {
    if (!isHome()) return;
    var aside = document.getElementById('aside-content');
    if (!aside) return;
    if (aside.querySelector('.card-pinned')) return;

    var announcement = aside.querySelector('.card-announcement');
    if (!announcement) return;

    var frag = document.createDocumentFragment();
    PINNED_POSTS.forEach(function (post) {
      frag.appendChild(buildCard(post));
    });
    announcement.parentNode.insertBefore(frag, announcement.nextSibling);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('pjax:complete', init);
})();