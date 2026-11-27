/*! 页脚旅人的猫 — 右下角睡觉小场景（内联 SVG） */
(function () {
  'use strict';

  var SVG = [
    '<svg viewBox="0 0 200 140" role="img" aria-label="旅人的猫，点一下会醒来伸懒腰">',
    '<ellipse class="cat-shadow" cx="98" cy="129" rx="66" ry="7"/>',
    '<g class="cat-lift">',
    '<g class="cat-tail">',
    '<path d="M136 111 C164 109 176 122 158 128 C138 134 112 132 96 128" fill="none" stroke="#F6BCC9" stroke-width="9" stroke-linecap="round"/>',
    '</g>',
    '<g class="cat-breathe">',
    '<ellipse cx="98" cy="103" rx="55" ry="28" fill="#FFF3F6" stroke="#F2C4CE" stroke-width="1.6"/>',
    '<ellipse cx="52" cy="119" rx="13" ry="6" fill="#FFF3F6" stroke="#F2C4CE" stroke-width="1.4"/>',
    '<ellipse cx="72" cy="122" rx="13" ry="6" fill="#FFF3F6" stroke="#F2C4CE" stroke-width="1.4"/>',
    '</g>',
    '<g class="cat-scarf">',
    '<path d="M38 108 Q58 118 80 106 L82 114 Q58 126 36 116 Z" fill="#FF9FB2"/>',
    '<path d="M78 111 l9 10 q2 2 -2 4 l-9 -10 Z" fill="#FF8FA5"/>',
    '</g>',
    '<g class="cat-head">',
    '<g class="cat-ear cat-ear-l">',
    '<path d="M38 76 L34 54 L56 66 Z" fill="#FFF3F6" stroke="#F2C4CE" stroke-width="1.6" stroke-linejoin="round"/>',
    '<path d="M41 71 L39 60 L50 67 Z" fill="#FFC9D4"/>',
    '</g>',
    '<g class="cat-ear cat-ear-r">',
    '<path d="M62 66 L80 52 L82 76 Z" fill="#FFF3F6" stroke="#F2C4CE" stroke-width="1.6" stroke-linejoin="round"/>',
    '<path d="M66 66 L76 57 L77 71 Z" fill="#FFC9D4"/>',
    '</g>',
    '<circle cx="58" cy="90" r="24" fill="#FFF3F6" stroke="#F2C4CE" stroke-width="1.6"/>',
    '<g class="cat-eyes-closed" stroke="#B96A7E" stroke-width="2" stroke-linecap="round" fill="none">',
    '<path d="M47 89 Q51 92.5 55 89"/>',
    '<path d="M63 89 Q67 92.5 71 89"/>',
    '</g>',
    '<g class="cat-eyes-open">',
    '<ellipse cx="51" cy="88" rx="3.6" ry="4.6" fill="#7A4A55"/>',
    '<ellipse cx="67" cy="88" rx="3.6" ry="4.6" fill="#7A4A55"/>',
    '<circle cx="52.2" cy="86.3" r="1.2" fill="#fff"/>',
    '<circle cx="68.2" cy="86.3" r="1.2" fill="#fff"/>',
    '</g>',
    '<path d="M56 96 L60 96 L58 99.5 Z" fill="#E8899A"/>',
    '<path d="M58 99.5 q-2 3 -5.5 2.4 M58 99.5 q2 3 5.5 2.4" stroke="#D98A9A" stroke-width="1.4" fill="none" stroke-linecap="round"/>',
    '<ellipse cx="45" cy="97" rx="5" ry="3" fill="rgba(255,133,162,.22)"/>',
    '<ellipse cx="71" cy="97" rx="5" ry="3" fill="rgba(255,133,162,.22)"/>',
    '<g stroke="#E7B8C2" stroke-width="1.2" stroke-linecap="round">',
    '<path d="M42 94 l-10 -3"/>',
    '<path d="M42 98 l-10 1"/>',
    '<path d="M74 94 l10 -3"/>',
    '<path d="M74 98 l10 1"/>',
    '</g>',
    '<g class="cat-zzz" fill="#E8899A">',
    '<text class="zzz z1" x="86" y="60" font-size="12" opacity="0">z</text>',
    '<text class="zzz z2" x="98" y="48" font-size="10" opacity="0">z</text>',
    '<text class="zzz z3" x="108" y="37" font-size="8" opacity="0">z</text>',
    '</g>',
    '</g>',
    '</g>',
    '</svg>'
  ].join('');

  var timer = null;

  function mount() {
    var footer = document.querySelector('#footer');
    if (!footer) return;
    if (document.getElementById('footer-cat')) return;

    var box = document.createElement('div');
    box.id = 'footer-cat';
    box.setAttribute('title', '旅人的猫 · 点一下叫醒它');
    box.innerHTML = SVG;
    footer.insertBefore(box, footer.firstChild);

    var svg = box.querySelector('svg');
    if (!svg) return;

    svg.addEventListener('click', function () {
      box.classList.add('is-awake');
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        box.classList.remove('is-awake');
        timer = null;
      }, 2400);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  document.addEventListener('pjax:complete', mount);
})();