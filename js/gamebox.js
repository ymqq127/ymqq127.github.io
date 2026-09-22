/*! 花璃匣 — 游戏展示（竖向自动滚动 + 启匣随机抽取） */
(function () {
  'use strict';

  /* ====== 游戏数据配置 ====== */
  var games = [
    {
      name: '塞尔达传说：王国之泪',
      cover: 'https://img.moegirl.org.cn/common/thumb/e/e5/TotK_Box_Art.png/250px-TotK_Box_Art.png',
      brief: '开放世界动作冒险',
      tags: ['开放世界', '动作', 'Switch'],
      desc: '<p>《塞尔达传说：王国之泪》是任天堂开发的开放世界动作冒险游戏，是《旷野之息》的续作。</p><p>全新的"究极手"等能力带来无限创意玩法，海拉鲁大陆的天空与地底等待探索。</p>'
    },
    {
      name: '星穹铁道',
      cover: 'https://img.moegirl.org.cn/common/thumb/c/c2/Star_Rail_logo.png/250px-Star_Rail_logo.png',
      brief: '银河冒险回合制RPG',
      tags: ['回合制', 'RPG', '二次元'],
      desc: '<p>《崩坏：星穹铁道》是米哈游出品的银河冒险回合制RPG。</p><p>乘坐星穹列车，在星海间旅行，与各种伙伴结交，探索银河的真相。</p>'
    },
    {
      name: '空洞骑士',
      cover: 'https://img.moegirl.org.cn/common/thumb/5/5a/Hollow_Knight_Cover_Art.jpg/250px-Hollow_Knight_Cover_Art.jpg',
      brief: '硬核2D动作冒险',
      tags: ['Metroidvania', '动作', '独立游戏'],
      desc: '<p>《空洞骑士》是一款2D动作冒险游戏，探索广阔而错综复杂的地下昆虫王国。</p><p>极具挑战的战斗、精美的手绘画风、深邃的世界观，是Metroidvania类游戏的巅峰之作。</p>'
    },
    {
      name: '动物森友会',
      cover: 'https://img.moegirl.org.cn/common/thumb/4/4a/ACNH_Box_Art.png/250px-ACNH_Box_Art.png',
      brief: '悠闲生活模拟',
      tags: ['模拟', '休闲', 'Switch'],
      desc: '<p>《集合啦！动物森友会》是任天堂推出的生活模拟游戏。</p><p>在无人岛上建造自己的家园，与可爱的动物邻居们一起生活，钓鱼、捉虫、装饰，享受慢节奏的岛屿生活。</p>'
    }
  ];

  /* ====== 以下无需修改 ====== */
  if (!games || games.length === 0) return;

  // 随机打乱顺序
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  var list = shuffle(games);

  var ITEM_H = 72; // 每条高度，与CSS一致
  var INTERVAL = 3500; // 滚动间隔ms

  function build() {
    var aside = document.getElementById('aside-content');
    if (!aside) { setTimeout(build, 300); return; }

    var announcement = aside.querySelector('.card-announcement');

    // 构建HTML：首项 + 随机列表 + 首项（无缝循环）
    var html = list.map(function (g, i) {
      return '<div class="gamebox-item" data-index="' + i + '">' +
        '<img class="gamebox-thumb" src="' + g.cover + '" alt="' + g.name + '" loading="lazy" onerror="this.src=\'/img/friend_404.gif\'">' +
        '<div class="gamebox-text"><div class="gamebox-name">' + g.name + '</div><div class="gamebox-brief">' + g.brief + '</div></div>' +
        '</div>';
    }).join('');

    var card = document.createElement('div');
    card.className = 'card-widget card-gamebox';
    card.innerHTML =
      '<div class="gamebox-header">' +
        '<div class="item-headline"><i class="fas fa-gamepad"></i><span>花璃匣</span></div>' +
        '<button class="gamebox-lucky-btn" title="随机抽取">启匣</button>' +
      '</div>' +
      '<div class="gamebox-viewport"><div class="gamebox-track">' + html + '</div></div>';

    // 插入到公告下方
    if (announcement && announcement.nextSibling) {
      aside.insertBefore(card, announcement.nextSibling);
    } else {
      aside.appendChild(card);
    }

    // 自动滚动
    var track = card.querySelector('.gamebox-track');
    var idx = 0;
    var total = list.length;
    var paused = false;

    // hover暂停
    card.addEventListener('mouseenter', function () { paused = true; });
    card.addEventListener('mouseleave', function () { paused = false; });

    setInterval(function () {
      if (paused) return;
      idx++;
      track.style.transform = 'translateY(-' + (idx * ITEM_H) + 'px)';

      // 无缝循环：滚到克隆项后瞬间跳回
      if (idx >= total) {
        setTimeout(function () {
          track.style.transition = 'none';
          idx = 0;
          track.style.transform = 'translateY(0)';
          // 强制重绘后恢复过渡
          void track.offsetHeight;
          track.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
        }, 520);
      }
    }, INTERVAL);

    // 弹窗
    var mask = document.createElement('div');
    mask.className = 'gamebox-modal-mask';
    mask.innerHTML = '<div class="gamebox-modal"><button class="gamebox-modal-close">&times;</button><div id="gamebox-modal-content"></div></div>';
    document.body.appendChild(mask);

    // 打开弹窗
    function openModal(g) {
      var tags = (g.tags || []).map(function (t) { return '<span class="gamebox-modal-tag">' + t + '</span>'; }).join('');
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      var topText = isDark ? '去往下一场璃落' : '去往下一场花开';
      document.getElementById('gamebox-modal-content').innerHTML =
        '<div class="gamebox-modal-top">' + topText + '</div>' +
        '<img class="gamebox-modal-cover" src="' + g.cover + '" alt="' + g.name + '" onerror="this.src=\'/img/friend_404.gif\'">' +
        '<div class="gamebox-modal-body">' +
        '<div class="gamebox-modal-name">' + g.name + '</div>' +
        (tags ? '<div class="gamebox-modal-tags">' + tags + '</div>' : '') +
        '<div class="gamebox-modal-desc">' + g.desc + '</div></div>';
      mask.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    // 点击卡片打开弹窗
    card.addEventListener('click', function (e) {
      var btn = e.target.closest('.gamebox-lucky-btn');
      if (btn) return; // 启匣按钮单独处理
      var item = e.target.closest('.gamebox-item');
      if (!item) return;
      var i = parseInt(item.getAttribute('data-index'));
      var g = list[i];
      if (!g) return;
      openModal(g);
    });

    // 启匣按钮：随机抽取
    card.querySelector('.gamebox-lucky-btn').addEventListener('click', function (e) {
      e.stopPropagation();
      var ri = Math.floor(Math.random() * list.length);
      openModal(list[ri]);
    });

    function closeModal() {
      mask.classList.remove('active');
      document.body.style.overflow = '';
    }
    mask.querySelector('.gamebox-modal-close').addEventListener('click', closeModal);
    mask.addEventListener('click', function (e) { if (e.target === mask) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();