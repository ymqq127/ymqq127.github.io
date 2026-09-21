/*! 花璃匣 — 游戏展示组件 */
(function () {
  'use strict';

  /* ====== 游戏数据配置 ====== */
  /* cover: 封面图URL（建议 130x170 比例） */
  /* name: 游戏名 */
  /* brief: 简介一句话 */
  /* tags: 标签数组 */
  /* desc: 详细介绍（支持HTML） */
  var games = [
    {
      name: '原神',
      cover: 'https://img.moegirl.org.cn/common/thumb/b/b9/%E5%8E%9F%E7%A5%9E%E5%9B%BD%E9%99%85%E6%9C%8D%E7%89%88Logo.png/250px-%E5%8E%9F%E7%A5%9E%E5%9B%BD%E9%99%85%E6%9C%8D%E7%89%88Logo.png',
      brief: '开放世界冒险RPG',
      tags: ['开放世界', 'RPG', '二次元'],
      desc: '<p>《原神》是米哈游自研的一款开放世界冒险RPG，玩家将在游戏中探索名为"提瓦特"的幻想世界。</p><p>游戏拥有精美的画面、丰富的剧情和自由的探索玩法，支持多平台联机。</p>'
    },
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

  function build() {
    var aside = document.getElementById('aside-content');
    if (!aside) { setTimeout(build, 300); return; }

    var announcement = aside.querySelector('.card-announcement');

    // 创建卡片
    var card = document.createElement('div');
    card.className = 'card-widget card-gamebox';
    card.innerHTML =
      '<div class="item-headline"><i class="fas fa-gamepad"></i><span>花璃匣</span></div>' +
      '<div class="gamebox-scroll">' + games.map(function (g, i) {
        return '<div class="gamebox-card" data-index="' + i + '">' +
          '<div class="gamebox-cover-wrap"><img class="gamebox-cover" src="' + g.cover + '" alt="' + g.name + '" loading="lazy" onerror="this.src=\'/img/friend_404.gif\'"></div>' +
          '<div class="gamebox-info"><div class="gamebox-name">' + g.name + '</div><div class="gamebox-brief">' + g.brief + '</div></div>' +
          '</div>';
      }).join('') + '</div>';

    // 插入到公告下方
    if (announcement && announcement.nextSibling) {
      aside.insertBefore(card, announcement.nextSibling);
    } else {
      aside.appendChild(card);
    }

    // 创建弹窗
    var mask = document.createElement('div');
    mask.className = 'gamebox-modal-mask';
    mask.innerHTML = '<div class="gamebox-modal"><button class="gamebox-modal-close">&times;</button><div id="gamebox-modal-content"></div></div>';
    document.body.appendChild(mask);

    // 点击卡片打开弹窗
    card.addEventListener('click', function (e) {
      var c = e.target.closest('.gamebox-card');
      if (!c) return;
      var idx = parseInt(c.getAttribute('data-index'));
      var g = games[idx];
      if (!g) return;

      var tags = (g.tags || []).map(function (t) { return '<span class="gamebox-modal-tag">' + t + '</span>'; }).join('');
      document.getElementById('gamebox-modal-content').innerHTML =
        '<img class="gamebox-modal-cover" src="' + g.cover + '" alt="' + g.name + '" onerror="this.src=\'/img/friend_404.gif\'">' +
        '<div class="gamebox-modal-body">' +
        '<div class="gamebox-modal-name">' + g.name + '</div>' +
        (tags ? '<div class="gamebox-modal-tags">' + tags + '</div>' : '') +
        '<div class="gamebox-modal-desc">' + g.desc + '</div>' +
        '</div>';

      mask.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    // 关闭弹窗
    function closeModal() {
      mask.classList.remove('active');
      document.body.style.overflow = '';
    }
    mask.querySelector('.gamebox-modal-close').addEventListener('click', closeModal);
    mask.addEventListener('click', function (e) {
      if (e.target === mask) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();