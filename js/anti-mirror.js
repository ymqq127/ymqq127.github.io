/*! 防恶意镜像 — 域名校验 + 防iframe嵌套 */
(function () {
  'use strict';

  // 允许的域名白名单
  var allowed = ['ymqq127.github.io', 'localhost', '127.0.0.1'];

  function isAllowed(host) {
    for (var i = 0; i < allowed.length; i++) {
      if (host === allowed[i] || host.endsWith('.' + allowed[i])) return true;
    }
    return false;
  }

  // 1. 域名校验：如果当前域名不在白名单中，跳转到正版站
  if (window.location.hostname && !isAllowed(window.location.hostname)) {
    window.location.replace('https://ymqq127.github.io' + window.location.pathname + window.location.search + window.location.hash);
  }

  // 2. 防iframe嵌套：如果被嵌入iframe中，强制跳出
  if (window.top !== window.self) {
    window.top.location.replace(window.self.location.href);
  }
})();