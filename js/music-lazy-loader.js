/*! Pink Music Lazy Loader - 点击才加载APlayer，首次访问零音频开销 */
(function () {
  'use strict';

  // 创建浮动音乐按钮
  var btn = document.createElement('div');
  btn.id = 'pink-music-btn';
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';
  btn.title = '点击播放音乐';
  var style = document.createElement('style');
  style.textContent = '#pink-music-btn{position:fixed;left:20px;bottom:80px;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#FF85A2,#FFB6C1);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:999;box-shadow:0 2px 12px rgba(255,133,162,.4);transition:transform .2s,box-shadow .2s;animation:pink-pulse 2s infinite}#pink-music-btn:hover{transform:scale(1.1);box-shadow:0 4px 20px rgba(255,133,162,.6)}@keyframes pink-pulse{0%,100%{box-shadow:0 2px 12px rgba(255,133,162,.4)}50%{box-shadow:0 2px 20px rgba(255,133,162,.7)}}#pink-music-btn.loading{opacity:.6;pointer-events:none;animation:none}';
  document.head.appendChild(style);
  document.body.appendChild(btn);

  var loaded = false;
  var loading = false;

  function loadScript(src, cb) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = cb;
    s.onerror = function () { console.warn('[MusicLoader] Failed: ' + src); btn.classList.remove('loading'); };
    document.body.appendChild(s);
  }

  function loadCSS(href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }

  btn.addEventListener('click', function () {
    if (loaded || loading) return;
    loading = true;
    btn.classList.add('loading');

    // 加载APlayer CSS
    loadCSS('/css/APlayer.min.css');

    // 加载APlayer JS，完成后加载music-player.js
    loadScript('/js/APlayer.min.js', function () {
      loadScript('/js/music-player.js', function () {
        loaded = true;
        btn.style.display = 'none';
      });
    });
  });
})();