/**
 * SW Update Handler — 解决手机端缓存旧页面问题
 * 
 * 核心机制：
 * 1. 页面加载时主动检查 SW 更新 (reg.update())
 * 2. 用户切回标签页时再次检查 (visibilitychange)
 * 3. 新 SW 激活后自动刷新页面 (controllerchange)
 * 4. 版本文件兜底：若本地版本落后则触发一次 SW 更新检查（交由 1-3 的流程刷新）
 * 5. 拦截 PWA "添加到桌面" 提示
 */
;(function () {
  if (!('serviceWorker' in navigator)) return

  var refreshing = false

  // 新 SW 接管后刷新页面（只刷一次）
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })

  // 注册 SW —— 推迟到首屏加载完成后再做。
  // 首次访问时 SW 会预缓存站点资源，若与首屏资源并发下载会明显拖慢首屏
  // （尤其是移动端弱网），因此等 load 事件 + 空闲时再注册。
  function registerSW () {
    navigator.serviceWorker.register('/service-worker.js').then(function (reg) {
      // 立即触发一次更新检查
      reg.update()

      // 有新 SW 进入 installing 状态
      reg.addEventListener('updatefound', function () {
        var newWorker = reg.installing
        newWorker.addEventListener('statechange', function () {
          // 新 SW 安装完毕且已有旧 SW 在控制页面 → 发送 SKIP_WAITING
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: 'SKIP_WAITING' })
          }
        })
      })
    }).catch(function () { /* SW 注册失败，静默 */ })
  }

  if (document.readyState === 'complete') {
    // 已经加载完（如脚本被延迟执行）
    if ('requestIdleCallback' in window) requestIdleCallback(registerSW, { timeout: 3000 })
    else setTimeout(registerSW, 1500)
  } else {
    window.addEventListener('load', function () {
      if ('requestIdleCallback' in window) requestIdleCallback(registerSW, { timeout: 3000 })
      else setTimeout(registerSW, 1500)
    })
  }

  // 用户切回标签页时主动检查 SW 更新
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      navigator.serviceWorker.getRegistration().then(function (reg) {
        if (reg) reg.update()
      })
    }
  })

  // 版本兜底检查：对比 version.json 判断是否需要刷新
  // 不直接清空缓存——那会在页面加载中与图片等请求抢缓存，导致
  // Firefox 报 "ServiceWorker intercepted the request and encountered an unknown error"。
  // 改为触发一次 SW 更新检查，交给上面的 skipWaiting → controllerchange → 自动 reload 流程。
  fetch('/version.json', { cache: 'no-store' })
    .then(function (res) { return res.json() })
    .then(function (data) {
      if (!data || !data.version) return
      var local = localStorage.getItem('site_version')
      if (local && local !== data.version) {
        // 版本不一致 → 记录新版本，并请求 SW 检查更新（由 SW 自身决定何时接管刷新）
        localStorage.setItem('site_version', data.version)
        navigator.serviceWorker.getRegistration().then(function (reg) {
          if (reg) reg.update()
        })
      } else if (!local) {
        localStorage.setItem('site_version', data.version)
      }
    })
    .catch(function () { /* 离线或请求失败，静默 */ })

  // 拦截 PWA "添加到桌面" 提示
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault()
  })
})()