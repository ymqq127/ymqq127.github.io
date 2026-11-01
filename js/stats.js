/**
 * 站点访问统计 — 读取静态 JSON 显示 + Worker 静默计数
 *
 * 显示：source/_data/stats.json（由 GitHub Actions 每日从 Worker 拉取）
 * 计数：访客端向 Cloudflare Worker 的 /api/stats 打一个 fire-and-forget 请求
 *
 * 设计要点：
 * - 计数请求带 3 秒超时，失败完全静默：workers.dev 在国内可能不可达，
 *   超时就直接放弃，不重试、不报错、不阻塞页面
 * - 显示只读本站静态文件，即使计数失败也不影响数字渲染
 * - 与 pjax 兼容：每次切换页面重新计数
 */
;(function () {
  var STATS_URL = '/stats.json'
  var COUNT_URL = 'https://blog-stats.ymqq127.workers.dev/api/stats'
  var COUNT_TIMEOUT = 3000

  function setText (id, value) {
    var el = document.getElementById(id)
    if (!el) return
    el.textContent = Number(value).toLocaleString()
  }

  function hide (id) {
    var el = document.getElementById(id)
    if (!el) return
    var wrap = el.closest('.webinfo-item') || el.closest('.post-meta-pv-cv')
    if (wrap) wrap.style.display = 'none'
    else el.style.display = 'none'
  }

  /**
   * 向 Worker 上报一次访问（fire-and-forget）
   * 任何失败都静默丢弃，绝不重试
   */
  function count () {
    try {
      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null
      var timer = setTimeout(function () {
        if (controller) controller.abort()
      }, COUNT_TIMEOUT)

      fetch(COUNT_URL + '?path=' + encodeURIComponent(location.pathname), {
        method: 'GET',
        credentials: 'omit',
        cache: 'no-store',
        keepalive: true,
        signal: controller ? controller.signal : undefined
      }).then(function () {
        clearTimeout(timer)
      }).catch(function () {
        clearTimeout(timer)
      })
    } catch (e) {
      // 老浏览器不支持 fetch / AbortController：直接放弃计数
    }
  }

  function load () {
    // 计数与显示互不依赖，先上报再看数字
    count()

    var hasSite = document.getElementById('busuanzi_value_site_uv') ||
                  document.getElementById('busuanzi_value_site_pv')
    if (!hasSite) return

    // 页面浏览量走静态方案无法统计，直接隐藏
    hide('busuanzi_value_page_pv')

    var xhr = new XMLHttpRequest()
    xhr.open('GET', STATS_URL, true)
    xhr.timeout = 3000
    xhr.onload = function () {
      if (xhr.status !== 200) {
        hide('busuanzi_value_site_uv')
        hide('busuanzi_value_site_pv')
        return
      }
      try {
        var data = JSON.parse(xhr.responseText)
        if (data.site_uv != null) setText('busuanzi_value_site_uv', data.site_uv)
        if (data.site_pv != null) setText('busuanzi_value_site_pv', data.site_pv)
      } catch (e) {
        hide('busuanzi_value_site_uv')
        hide('busuanzi_value_site_pv')
      }
    }
    xhr.onerror = xhr.ontimeout = function () {
      hide('busuanzi_value_site_uv')
      hide('busuanzi_value_site_pv')
    }
    xhr.send()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load)
  } else {
    load()
  }

  document.addEventListener('pjax:complete', load)
})()
