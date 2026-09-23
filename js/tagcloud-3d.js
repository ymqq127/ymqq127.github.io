/*! 花璃匣 — 标签云3D球形动画 */
(function () {
  'use strict';

  var RADIUS = 120;
  var SPEED = 0.3;
  var DEPTH = 300;

  function init() {
    var container = document.querySelector('.tag-cloud-list');
    if (!container) return;

    var links = container.querySelectorAll('a');
    if (links.length < 3) return;

    // 创建3D容器
    var wrapper = document.createElement('div');
    wrapper.className = 'tagcloud-3d';
    wrapper.style.cssText = 'position:relative;width:100%;height:' + (RADIUS * 2 + 40) + 'px;display:flex;align-items:center;justify-content:center;overflow:hidden;';

    var items = [];
    var n = links.length;

    links.forEach(function (link, i) {
      // 球面均匀分布
      var phi = Math.acos(-1 + (2 * i + 1) / n);
      var theta = Math.sqrt(n * Math.PI) * phi;

      var x = RADIUS * Math.cos(theta) * Math.sin(phi);
      var y = RADIUS * Math.sin(theta) * Math.sin(phi);
      var z = RADIUS * Math.cos(phi);

      var el = document.createElement('a');
      el.href = link.href;
      el.textContent = link.textContent;
      el.className = 'tagcloud-3d-item';
      el.style.cssText = 'position:absolute;left:50%;top:50%;white-space:nowrap;cursor:pointer;transition:color .2s,transform .15s;text-decoration:none;';

      items.push({ el: el, x: x, y: y, z: z });
      wrapper.appendChild(el);
    });

    container.innerHTML = '';
    container.appendChild(wrapper);

    var mouseX = 0, mouseY = 0;
    var isHover = false;

    wrapper.addEventListener('mouseenter', function () { isHover = true; });
    wrapper.addEventListener('mouseleave', function () { isHover = false; });
    wrapper.addEventListener('mousemove', function (e) {
      var rect = wrapper.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      mouseY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    });

    // 触摸支持
    wrapper.addEventListener('touchmove', function (e) {
      var touch = e.touches[0];
      var rect = wrapper.getBoundingClientRect();
      mouseX = (touch.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      mouseY = (touch.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    });

    function rotateX(angle) {
      var cos = Math.cos(angle), sin = Math.sin(angle);
      items.forEach(function (item) {
        var y = item.y * cos - item.z * sin;
        var z = item.y * sin + item.z * cos;
        item.y = y; item.z = z;
      });
    }

    function rotateY(angle) {
      var cos = Math.cos(angle), sin = Math.sin(angle);
      items.forEach(function (item) {
        var x = item.x * cos - item.z * sin;
        var z = item.x * sin + item.z * cos;
        item.x = x; item.z = z;
      });
    }

    function render() {
      var autoSpeed = isHover ? 0 : SPEED;
      var targetX = isHover ? mouseY * 0.02 : 0.005;
      var targetY = isHover ? mouseX * 0.02 : 0.008;

      rotateX(targetX + autoSpeed * 0.5);
      rotateY(targetY + autoSpeed);

      items.forEach(function (item) {
        var scale = (DEPTH - item.z) / DEPTH;
        var alpha = Math.max(0.3, scale);
        var size = Math.max(11, 14 * scale);
        item.el.style.transform = 'translate(-50%,-50%) translate(' + item.x + 'px,' + item.y + 'px)';
        item.el.style.fontSize = size + 'px';
        item.el.style.opacity = alpha;
        item.el.style.zIndex = Math.round(scale * 100);
        item.el.style.color = 'var(--tag-color, #C97080)';
      });

      requestAnimationFrame(render);
    }

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('pjax:complete', init);
})();