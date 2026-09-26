/*! Pink Music Player - 全局吸底播放器（自定义音频） */
(function () {
  'use strict';

  /* ====== 音乐列表配置 ====== */
  /* url: 音频路径（source/music/ 目录，引用 /music/xxx.mp3） */
  /* name: 歌曲名 | artist: 歌手 | cover: 封面（可选）| theme: 主题色 */
  var playlist = [
    {
      name: '至上之空BGM01',
      artist: 'Unknown',
      url: '/music/%E5%BE%A1%E6%89%8B%E6%B4%97%E4%BA%AE%E5%A4%AA.mp3',
      cover: '/img/music-cover.svg',
      theme: '#FF85A2'
    },
    {
      name: '至上之空BGM02',
      artist: 'Unknown',
      url: '/music/bgm006.ogg',
      cover: '/img/music-cover.svg',
      theme: '#FFB6C1'
    }
  ];

  /* ====== 以下无需修改 ====== */
  if (!playlist || playlist.length === 0) return;

  var retries = 0;
  var maxRetries = 30;

  function initPlayer() {
    if (typeof window.APlayer === 'undefined') {
      if (retries < maxRetries) {
        retries++;
        setTimeout(initPlayer, 500);
      } else {
        console.warn('[PinkPlayer] APlayer not loaded after ' + (maxRetries * 500) + 'ms');
      }
      return;
    }

    var container = document.createElement('div');
    container.id = 'pink-aplayer';
    document.body.appendChild(container);

    try {
      new APlayer({
        container: container,
        fixed: true,
        autoplay: false,
        theme: '#FF85A2',
        loop: 'all',
        order: 'list',
        preload: 'none',
        volume: 0.7,
        mutex: true,
        listFolded: true,
        listMaxHeight: '250px',
        audio: playlist
      });
      console.log('[PinkPlayer] APlayer initialized successfully');
    } catch (e) {
      console.warn('[PinkPlayer] Init error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayer);
  } else {
    initPlayer();
  }
})();