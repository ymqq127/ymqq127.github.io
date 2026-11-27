/*! 页脚玻璃水族罐 — 小鱼 + 投食养成（canvas 2D，无外部图片） */
(function () {
  'use strict';

  var STORAGE_KEY = 'footer-aquarium-v1';
  var MAX_DPR = 2;
  var current = null;

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function loadState() {
    var def = { feeds: 0 };
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return def;
      var o = JSON.parse(raw);
      return { feeds: Math.max(0, parseInt(o.feeds, 10) || 0) };
    } catch (e) { return def; }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  var state = loadState();

  // 每投喂 5 次多一条鱼（2 → 4 条），鱼身随投喂次数缓慢长大
  function fishTarget(feeds) { return 2 + Math.min(2, Math.floor(feeds / 5)); }
  function growth(feeds) { return 1 + Math.min(0.3, feeds * 0.006); }

  function palette(dark) {
    return dark ? {
      waterTop: 'rgba(126,84,102,0.40)',
      waterBottom: 'rgba(70,52,84,0.55)',
      glassEdge: 'rgba(255,225,235,0.42)',
      shine: 'rgba(255,255,255,0.08)',
      plants: ['#5F7D66', '#6E8A70', '#54705C'],
      fish: ['#F27C93', '#E8A87C', '#D98BB8', '#8FC7D8'],
      petals: ['#F5A3B7', '#F7BFCF', '#EFA9C6'],
      food: '#E0B878'
    } : {
      waterTop: 'rgba(255,233,240,0.78)',
      waterBottom: 'rgba(214,237,250,0.66)',
      glassEdge: 'rgba(255,180,198,0.75)',
      shine: 'rgba(255,255,255,0.24)',
      plants: ['#7FA889', '#8FB894', '#6F9A7C'],
      fish: ['#FF9FB2', '#FFC4A3', '#F5A9C8', '#9FD8E8'],
      petals: ['#FFB6C1', '#FFC9D4', '#F7A8C4'],
      food: '#C99A5B'
    };
  }

  function createEngine(host) {
    var canvas = document.createElement('canvas');
    canvas.id = 'aquarium-canvas';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', '页脚鱼缸小场景，点击水面可以投喂小鱼');
    host.appendChild(canvas);

    var caption = document.createElement('p');
    caption.className = 'aquarium-caption';
    host.appendChild(caption);

    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1;
    var jar = { x: 0, y: 0, w: 0, h: 0, r: 26 };
    var waterY = 0;

    var fishList = [];
    var petals = [];
    var bubbles = [];
    var pellets = [];
    var ripples = [];

    var pointer = { x: -999, y: -999, active: false };
    var time = 0, lastT = 0, rafId = 0, running = false;
    var destroyed = false;

    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    var pal = palette(dark);

    var petalTimer = 3;
    var bubbleTimer = 0.8;

    var io = null, ro = null, mo = null;

    var PLANTS = [
      { fx: 0.13, fh: 0.42, ph: 0.4 },
      { fx: 0.20, fh: 0.60, ph: 1.5 },
      { fx: 0.46, fh: 0.34, ph: 2.4 },
      { fx: 0.80, fh: 0.55, ph: 0.9 },
      { fx: 0.88, fh: 0.40, ph: 3.1 }
    ];

    /* ---------------- 几何 ---------------- */

    function jarPath(inset) {
      var x = jar.x + inset, y = jar.y + inset;
      var w = jar.w - inset * 2, h = jar.h - inset * 2;
      var r = Math.min(jar.r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function waterPath() {
      var x = jar.x + 3, w = jar.w - 6;
      var bottom = jar.y + jar.h - 4;
      var r = Math.max(0, jar.r - 3);
      ctx.beginPath();
      ctx.moveTo(x, waterY);
      ctx.lineTo(x + w, waterY);
      ctx.lineTo(x + w, bottom - r);
      ctx.quadraticCurveTo(x + w, bottom, x + w - r, bottom);
      ctx.lineTo(x + r, bottom);
      ctx.quadraticCurveTo(x, bottom, x, bottom - r);
      ctx.closePath();
    }

    /* ---------------- 鱼 ---------------- */

    function pickTarget(f) {
      f.tx = jar.x + 16 + Math.random() * (jar.w - 32);
      f.ty = waterY + 16 + Math.random() * Math.max(20, jar.y + jar.h - waterY - 32);
      f.timer = 1.4 + Math.random() * 2.6;
    }

    function addFish(count) {
      for (var i = 0; i < count; i++) {
        var base = jar.w * (0.068 + Math.random() * 0.03);
        var f = {
          baseLen: base,
          len: base * growth(state.feeds),
          x: jar.x + jar.w * (0.3 + Math.random() * 0.4),
          y: waterY + 16 + Math.random() * Math.max(20, jar.y + jar.h - waterY - 32),
          vx: Math.random() < 0.5 ? -20 : 20,
          vy: 0,
          angle: 0,
          tx: jar.x + jar.w / 2,
          ty: waterY + 40,
          timer: Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
          color: pal.fish[(fishList.length + i) % pal.fish.length]
        };
        fishList.push(f);
        pickTarget(f);
      }
    }

    function nearestPellet(f) {
      var best = null, bestD = 140 * 140;
      for (var i = 0; i < pellets.length; i++) {
        var dx = pellets[i].x - f.x, dy = pellets[i].y - f.y;
        var d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = pellets[i]; }
      }
      return best;
    }

    function updateFish(dt) {
      for (var n = 0; n < fishList.length; n++) {
        var f = fishList[n];
        var speed = 24, tx = f.tx, ty = f.ty;

        // 鼠标靠近：受惊游开
        if (pointer.active) {
          var dxp = f.x - pointer.x, dyp = f.y - pointer.y;
          var dp2 = dxp * dxp + dyp * dyp;
          if (dp2 < 4900) {
            var dp = Math.sqrt(dp2) || 1;
            tx = f.x + dxp / dp * 100;
            ty = f.y + dyp / dp * 80;
            speed = 120;
          }
        }

        // 有鱼食就先吃
        var food = nearestPellet(f);
        if (food) { tx = food.x; ty = food.y; speed = 62; }

        var ddx = tx - f.x, ddy = ty - f.y;
        var dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;

        f.timer -= dt;
        if (!food && (dist < 8 || f.timer <= 0)) pickTarget(f);

        var k = Math.min(1, dt * 3.2);
        f.vx += (ddx / dist * speed - f.vx) * k;
        f.vy += (ddy / dist * speed - f.vy) * k;

        f.x += f.vx * dt;
        f.y += f.vy * dt + Math.sin(time * 1.7 + f.phase) * 3 * dt;

        var left = jar.x + 14, right = jar.x + jar.w - 14;
        var top = waterY + 15, bottom = jar.y + jar.h - 15;
        if (f.x < left) { f.x = left; f.vx = Math.abs(f.vx); pickTarget(f); }
        if (f.x > right) { f.x = right; f.vx = -Math.abs(f.vx); pickTarget(f); }
        if (f.y < top) { f.y = top; f.vy = Math.abs(f.vy); }
        if (f.y > bottom) { f.y = bottom; f.vy = -Math.abs(f.vy); }

        var sp = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
        if (sp > 4) {
          var ta = Math.atan2(f.vy, f.vx);
          var diff = ta - f.angle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          f.angle += diff * Math.min(1, dt * 6);
        }

        // 吃到嘴边的鱼食
        for (var i = pellets.length - 1; i >= 0; i--) {
          var px = pellets[i].x - f.x, py = pellets[i].y - f.y;
          if (px * px + py * py < 49) {
            pellets.splice(i, 1);
            ripples.push({ x: f.x, y: waterY, r: 2, a: 0.35 });
            break;
          }
        }
      }
    }

    /* ---------------- 更新 ---------------- */

    function update(dt) {
      time += dt;
      updateFish(dt);

      var i;

      for (i = pellets.length - 1; i >= 0; i--) {
        var p = pellets[i];
        p.vy += 18 * dt;
        p.y += p.vy * dt;
        p.age += dt;
        if (p.y > jar.y + jar.h - 10 || p.age > 14) pellets.splice(i, 1);
      }

      bubbleTimer -= dt;
      if (bubbleTimer <= 0) {
        bubbleTimer = 0.6 + Math.random() * 1.6;
        if (bubbles.length < 14) {
          bubbles.push({
            x: jar.x + 18 + Math.random() * (jar.w - 36),
            y: jar.y + jar.h - 12,
            r: 1.5 + Math.random() * 2.2,
            vy: 16 + Math.random() * 22,
            ph: Math.random() * 6.28
          });
        }
      }
      for (i = bubbles.length - 1; i >= 0; i--) {
        var b = bubbles[i];
        b.y -= b.vy * dt;
        b.x += Math.sin(time * 2 + b.ph) * 5 * dt;
        if (b.y < waterY + 2) bubbles.splice(i, 1);
      }

      petalTimer -= dt;
      if (petalTimer <= 0) {
        petalTimer = 4.5 + Math.random() * 4;
        if (petals.length < 6) {
          petals.push({
            x: jar.x + jar.w * (0.2 + Math.random() * 0.6),
            y: jar.y - 26,
            vx: -6 + Math.random() * 12,
            vy: 13 + Math.random() * 9,
            rot: Math.random() * 6.28,
            vr: -1 + Math.random() * 2,
            alpha: 0.9,
            state: 0,
            life: 0,
            color: pal.petals[Math.floor(Math.random() * pal.petals.length)]
          });
        }
      }
      for (i = 0; i < petals.length; i++) {
        var pe = petals[i];
        pe.life += dt;
        if (pe.state === 0) {
          pe.y += pe.vy * dt;
          pe.x += (pe.vx + Math.sin(time * 1.2 + pe.rot) * 8) * dt;
          pe.rot += pe.vr * dt;
          if (pe.y >= waterY - 2) { pe.y = waterY - 2; pe.state = 1; pe.life = 0; }
        } else {
          pe.x += Math.sin(time * 0.5 + pe.rot) * 5 * dt;
          if (pe.life > 6) pe.alpha -= dt * 0.5;
        }
      }
      petals = petals.filter(function (pe) { return pe.alpha > 0.02; });

      for (i = 0; i < ripples.length; i++) {
        ripples[i].r += 55 * dt;
        ripples[i].a -= 0.9 * dt;
      }
      ripples = ripples.filter(function (r) { return r.a > 0; });
    }

    /* ---------------- 绘制 ---------------- */

    function drawPlants() {
      var baseY = jar.y + jar.h - 5;
      var depth = jar.y + jar.h - waterY;
      for (var i = 0; i < PLANTS.length; i++) {
        var p = PLANTS[i];
        var bx = jar.x + jar.w * p.fx;
        var topY = baseY - depth * p.fh;
        var sway = Math.sin(time * 0.9 + p.ph) * 7;
        var color = pal.plants[i % pal.plants.length];

        ctx.beginPath();
        ctx.moveTo(bx, baseY);
        ctx.quadraticCurveTo(bx + sway * 0.4, (baseY + topY) / 2, bx + sway, topY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85;
        for (var k = 0; k < 3; k++) {
          var ly = topY + (baseY - topY) * 0.12 + k * 9;
          var lx = bx + sway * (0.4 + k * 0.2);
          ctx.beginPath();
          ctx.ellipse(lx, ly, 4.5, 2.2, (k % 2 ? 0.7 : -0.7) + sway * 0.02, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    function drawFish(f) {
      var s = f.len;
      var wag = Math.sin(time * 8 + f.phase) * 0.35;

      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.angle);
      if (Math.cos(f.angle) < 0) ctx.scale(1, -1);

      if (dark) { ctx.shadowColor = f.color; ctx.shadowBlur = 9; }

      // 尾巴
      ctx.beginPath();
      ctx.moveTo(-s * 0.42, 0);
      ctx.quadraticCurveTo(-s * 0.62, wag * s * 0.28 - s * 0.22, -s * 0.80, wag * s * 0.30);
      ctx.quadraticCurveTo(-s * 0.62, wag * s * 0.28 + s * 0.22, -s * 0.42, 0);
      ctx.fillStyle = f.color;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;

      // 身体
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.46, s * 0.24, 0, 0, Math.PI * 2);
      ctx.fillStyle = f.color;
      ctx.fill();

      // 腹部提亮
      ctx.beginPath();
      ctx.ellipse(s * 0.04, s * 0.06, s * 0.30, s * 0.11, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.fill();

      // 背鳍
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, -s * 0.2);
      ctx.quadraticCurveTo(s * 0.02, -s * 0.42, s * 0.16, -s * 0.16);
      ctx.closePath();
      ctx.fillStyle = f.color;
      ctx.globalAlpha = 0.75;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (dark) ctx.shadowBlur = 0;

      // 眼睛
      ctx.beginPath();
      ctx.arc(s * 0.30, -s * 0.06, s * 0.065, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s * 0.32, -s * 0.06, s * 0.032, 0, Math.PI * 2);
      ctx.fillStyle = '#3a2a30';
      ctx.fill();

      ctx.restore();
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.quadraticCurveTo(6, -4, 5, 2);
      ctx.quadraticCurveTo(3, 6, 0, 7);
      ctx.quadraticCurveTo(-3, 6, -5, 2);
      ctx.quadraticCurveTo(-6, -4, 0, -5);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }

    function drawSurface() {
      var x0 = jar.x + 4, x1 = jar.x + jar.w - 4;
      ctx.beginPath();
      for (var x = x0; x <= x1; x += 4) {
        var y = waterY + Math.sin(x * 0.055 + time * 1.3) * 2 +
          Math.sin(x * 0.14 - time * 0.8) * 1;
        if (x === x0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = dark ? 'rgba(255,214,228,0.45)' : 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    function drawGlass() {
      ctx.save();
      jarPath(3);
      ctx.clip();
      ctx.fillStyle = pal.shine;
      ctx.beginPath();
      ctx.moveTo(jar.x + jar.w * 0.13, jar.y);
      ctx.lineTo(jar.x + jar.w * 0.24, jar.y);
      ctx.lineTo(jar.x + jar.w * 0.15, jar.y + jar.h);
      ctx.lineTo(jar.x + jar.w * 0.04, jar.y + jar.h);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(jar.x + jar.w * 0.30, jar.y);
      ctx.lineTo(jar.x + jar.w * 0.34, jar.y);
      ctx.lineTo(jar.x + jar.w * 0.25, jar.y + jar.h);
      ctx.lineTo(jar.x + jar.w * 0.21, jar.y + jar.h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 瓶口
      ctx.beginPath();
      ctx.ellipse(W / 2, jar.y + 3, jar.w * 0.44, 7, 0, 0, Math.PI * 2);
      ctx.strokeStyle = pal.glassEdge;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.fillStyle = dark ? 'rgba(255,235,242,0.04)' : 'rgba(255,255,255,0.16)';
      ctx.fill();

      // 瓶身轮廓
      jarPath(1.5);
      ctx.strokeStyle = pal.glassEdge;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      if (W < 40) return;

      // 瓶底阴影
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(W / 2, jar.y + jar.h - 2, jar.w * 0.42, 7, 0, 0, Math.PI * 2);
      ctx.fillStyle = dark ? 'rgba(0,0,0,0.28)' : 'rgba(201,112,128,0.10)';
      ctx.fill();
      ctx.restore();

      // 玻璃底色
      var glass = ctx.createLinearGradient(0, jar.y, 0, jar.y + jar.h);
      glass.addColorStop(0, dark ? 'rgba(255,235,242,0.05)' : 'rgba(255,255,255,0.42)');
      glass.addColorStop(1, dark ? 'rgba(255,235,242,0.02)' : 'rgba(255,255,255,0.10)');
      jarPath(1.5);
      ctx.fillStyle = glass;
      ctx.fill();

      // 水体
      var wg = ctx.createLinearGradient(0, waterY, 0, jar.y + jar.h);
      wg.addColorStop(0, pal.waterTop);
      wg.addColorStop(1, pal.waterBottom);
      waterPath();
      ctx.fillStyle = wg;
      ctx.fill();

      // 水下内容
      ctx.save();
      waterPath();
      ctx.clip();
      drawPlants();

      var i;
      for (i = 0; i < fishList.length; i++) drawFish(fishList[i]);

      for (i = 0; i < bubbles.length; i++) {
        var b = bubbles[i];
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (i = 0; i < pellets.length; i++) {
        var p = pellets[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = pal.food;
        ctx.fill();
      }

      for (i = 0; i < ripples.length; i++) {
        var r = ripples[i];
        ctx.beginPath();
        ctx.ellipse(r.x, waterY + 1, r.r, r.r * 0.28, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,' + clamp(r.a, 0, 1).toFixed(2) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      drawSurface();

      for (i = 0; i < petals.length; i++) drawPetal(petals[i]);

      drawGlass();
    }

    /* ---------------- 尺寸 ---------------- */

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var nw = Math.max(1, Math.round(rect.width));
      var nh = Math.max(1, Math.round(rect.height));
      if (!nw || !nh) return;

      W = nw;
      H = nh;
      dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      jar.w = Math.min(W * 0.84, 360);
      jar.h = Math.min(H - 26, 188);
      jar.x = (W - jar.w) / 2;
      jar.y = H - jar.h - 12;
      jar.r = Math.min(26, jar.w * 0.12);
      waterY = jar.y + jar.h * 0.2;

      for (var i = 0; i < fishList.length; i++) {
        var f = fishList[i];
        f.x = clamp(f.x, jar.x + 14, jar.x + jar.w - 14);
        f.y = clamp(f.y, waterY + 15, jar.y + jar.h - 15);
        f.tx = clamp(f.tx, jar.x + 16, jar.x + jar.w - 16);
        f.ty = clamp(f.ty, waterY + 16, jar.y + jar.h - 16);
      }

      if (!running) draw();
    }

    /* ---------------- 文案 ---------------- */

    function updateCaption() {
      if (state.feeds <= 0) {
        caption.textContent = '轻点水面，投一撮鱼食';
      } else {
        caption.textContent = '已投喂 ' + state.feeds + ' 次 · 罐里有 ' +
          fishTarget(state.feeds) + ' 条小鱼';
      }
    }

    /* ---------------- 交互 ---------------- */

    function onPointerMove(e) {
      var rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    }

    function onPointerLeave() {
      pointer.active = false;
      pointer.x = -999;
      pointer.y = -999;
    }

    function onClick(e) {
      var rect = canvas.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      if (x < jar.x || x > jar.x + jar.w || y < jar.y - 16 || y > jar.y + jar.h + 6) return;

      var sx = clamp(x, jar.x + 18, jar.x + jar.w - 18);
      ripples.push({ x: sx, y: waterY, r: 2, a: 0.55 });
      ripples.push({ x: sx, y: waterY, r: 1, a: 0.35 });

      for (var i = 0; i < 4; i++) {
        pellets.push({
          x: clamp(sx + (Math.random() * 26 - 13), jar.x + 16, jar.x + jar.w - 16),
          y: waterY + 4,
          vy: 8 + Math.random() * 10,
          age: 0
        });
      }

      state.feeds += 1;
      saveState();

      if (fishList.length < fishTarget(state.feeds)) addFish(1);
      var g = growth(state.feeds);
      for (i = 0; i < fishList.length; i++) fishList[i].len = fishList[i].baseLen * g;

      updateCaption();
      if (reduce) draw();
    }

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('pointercancel', onPointerLeave);
    canvas.addEventListener('click', onClick);

    /* ---------------- 动画循环 ---------------- */

    function frame(now) {
      if (!running) return;
      var dt = (now - lastT) / 1000;
      if (!(dt > 0)) dt = 0.016;
      if (dt > 0.05) dt = 0.05;
      lastT = now;
      update(dt);
      draw();
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (reduce || running || destroyed) return;
      running = true;
      lastT = window.performance && performance.now ? performance.now() : Date.now();
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    }

    /* ---------------- 监听 ---------------- */

    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(function () { resize(); });
      ro.observe(canvas);
    } else {
      window.addEventListener('resize', resize);
    }

    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) start();
        else stop();
      }, { threshold: 0 });
      io.observe(canvas);
    }

    if ('MutationObserver' in window) {
      mo = new MutationObserver(function () {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark === dark) return;
        dark = isDark;
        pal = palette(dark);
        for (var i = 0; i < fishList.length; i++) {
          fishList[i].color = pal.fish[i % pal.fish.length];
        }
        if (!running) draw();
      });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    /* ---------------- 初始化 / 销毁 ---------------- */

    function destroy() {
      destroyed = true;
      stop();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointercancel', onPointerLeave);
      canvas.removeEventListener('click', onClick);
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      if (mo) mo.disconnect();
      window.removeEventListener('resize', resize);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      if (caption.parentNode) caption.parentNode.removeChild(caption);
    }

    resize();
    addFish(fishTarget(state.feeds));
    updateCaption();
    if (reduce) draw();

    return { destroy: destroy };
  }

  /* ---------------- 挂载 ---------------- */

  function mount() {
    var footer = document.querySelector('#footer');
    if (!footer) return;

    if (current) {
      current.destroy();
      current = null;
    }

    var host = document.getElementById('footer-aquarium');
    if (!host) {
      host = document.createElement('div');
      host.id = 'footer-aquarium';
      footer.insertBefore(host, footer.firstChild);
    }
    current = createEngine(host);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  document.addEventListener('pjax:complete', mount);
})();