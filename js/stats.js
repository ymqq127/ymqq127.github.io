/**
 * 站点访问统计 — 自建 Cloudflare Worker 后端
 *
 * 特性：
 * - 3 秒超时保护：后端无响应则直接隐藏数字，绝不卡住页面
 * - 失败静默：接口报错不显示错误，直接隐藏统计项
 * - 与 pjax 兼容：每次切换页面重新拉取
 */
;(function () {
  var ENDPOINT = window.__STATS_ENDPOINT__
  if (!ENDPOINT) return

  var TIMEOUT = 3000

  function setText (id, value) {
    var el = document.getElementById(id)
    if (!el) return
    el.textContent = value.toLocaleString()
  }

  function hideAll () {
    ;['busuanzi_value_site_uv', 'busuanzi_value_site_pv', 'busuanzi_value_page_pv'].forEach(function (id) {
      var el = document.getElementById(id)
      if (el) el.style.display = 'none'
    })
    // 同时隐藏空的加载动画
    document.querySelectorAll('.item-count .fa-spinner, .post-meta-pv-cv .fa-spinner').forEach(function (el) {
      el.style.display = 'none'
    })
  }

  function fetchStats () {
    var path = window.location.pathname

    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    var timer = setTimeout(function () {
      if (controller) controller.abort()
    }, TIMEOUT)

    var opts = { credentials: 'omit', cache: 'no-store' }
    if (controller) opts.signal = controller.signal

    fetch(ENDPOINT + '?path=' + encodeURIComponent(path), opts)
      .then(function (res) {
        clearTimeout(timer)
        if (!res.ok) throw new Error('bad status')
        return res.json()
      })
      .then(function (data) {
        if (data.site_uv != null) setText('busuanzi_value_site_uv', data.site_uv)
        if (data.site_pv != null) setText('busuanzi_value_site_pv', data.site_pv)
        if (data.page_pv != null) setText('busuanzi_value_page_pv', data.page_pv)
      })
      .catch(function () {
        clearTimeout(timer)
        hideAll()
      })
  }

  function init () {
    // 没有统计元素就不请求
    if (!document.getElementById('busuanzi_value_site_pv') &&
        !document.getElementById('busuanzi_value_page_pv')) return
    fetchStats()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // pjax 页面切换后重新拉取
  document.addEventListener('pjax:complete', init)
})()
