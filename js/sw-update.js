/**
 * SW Update Handler — 解决手机端缓存旧页面问题
 * 
 * 核心机制：
 * 1. 页面加载时主动检查 SW 更新 (reg.update())
 * 2. 用户切回标签页时再次检查 (visibilitychange)
 * 3. 新 SW 激活后自动刷新页面 (controllerchange)
 * 4. 版本文件兜底：若本地版本落后则清缓存并刷新
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

  // 注册 SW 并立即检查更新
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

  // 用户切回标签页时主动检查 SW 更新
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      navigator.serviceWorker.getRegistration().then(function (reg) {
        if (reg) reg.update()
      })
    }
  })

  // 版本兜底检查：对比 version.json 判断是否需要强制清缓存
  // 使用 setTimeout 延迟执行，避免阻塞首屏渲染
  setTimeout(function () {
    fetch('/version.json', { cache: 'no-store' })
      .then(function (res) { return res.json() })
      .then(function (data) {
        if (!data || !data.version) return
        var local = localStorage.getItem('site_version')
        if (local && local !== data.version) {
          // 版本不一致 → 清除所有缓存并刷新
          localStorage.setItem('site_version', data.version)
          if ('caches' in window) {
            caches.keys().then(function (keys) {
              Promise.all(keys.map(function (k) { return caches.delete(k) })).then(function () {
                window.location.reload()
              })
            })
          } else {
            window.location.reload()
          }
        } else if (!local) {
          localStorage.setItem('site_version', data.version)
        }
      })
      .catch(function () { /* 离线或请求失败，静默 */ })
  }, 3000)

  // 拦截 PWA "添加到桌面" 提示
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault()
  })
})()