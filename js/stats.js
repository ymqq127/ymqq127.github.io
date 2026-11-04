/**
 * 站点访问统计 — 读取静态 JSON 显示 + Worker 静默计数
 *
 * 显示：source/_data/stats.json（由 GitHub Actions 每日从 Worker 拉取）
 * 计数：访客端向 Cloudflare Worker 的 /api/stats 打一个 fire-and-forget 请求
 *
 * 设计要点：
 * - 静态 JSON 提供兜底数字（含每篇文章 PV），国内访问也不依赖外部请求
 * - Worker 计数请求带 3 秒超时，成功时用返回的实时数字覆盖静态值
 * - 失败完全静默：不重试、不报错、不阻塞页面
 * - 与 pjax 兼容：每次切换页面重新计数
 */
;(function () {
  var STATS_URL = '/stats.json'
  var COUNT_URL = 'https://blog-stats.ymqq127.workers.dev/api/stats'
  var COUNT_TIMEOUT = 3000

  function setText (id, value) {
    var el = document.getElementById(id)
    if (!el) return false
    el.textContent = Number(value).toLocaleString()
    return true
  }

  function hide (id) {
    var el = document.getElementById(id)
    if (!el) return
    var wrap = el.closest('.webinfo-item') || el.closest('.post-meta-pv-cv')
    if (wrap) wrap.style.display = 'none'
    else el.style.display = 'none'
  }

  function hasTarget () {
    return document.getElementById('busuanzi_value_site_uv') ||
           document.getElementById('busuanzi_value_site_pv') ||
           document.getElementById('busuanzi_value_page_pv')
  }

  /** 用静态 JSON 填充（兜底，数字可能滞后一天） */
  function applyStatic (data) {
    if (!data || typeof data !== 'object') return

    if (data.site_uv != null) setText('busuanzi_value_site_uv', data.site_uv)
    if (data.site_pv != null) setText('busuanzi_value_site_pv', data.site_pv)

    var pageEl = document.getElementById('busuanzi_value_page_pv')
    if (pageEl && data.pages && data.pages[location.pathname] != null) {
      setText('busuanzi_value_page_pv', data.pages[location.pathname])
    }
  }

  /** 用 Worker 实时返回填充（比静态值新） */
  function applyLive (data) {
    if (!data || typeof data !== 'object') return

    if (data.site_uv != null) setText('busuanzi_value_site_uv', data.site_uv)
    if (data.site_pv != null) setText('busuanzi_value_site_pv', data.site_pv)
    if (data.page_pv != null) setText('busuanzi_value_page_pv', data.page_pv)
  }

  /** 超时后仍未拿到数字的项隐藏，避免一直转圈 */
  function hideMissing () {
    ;['busuanzi_value_site_uv', 'busuanzi_value_site_pv', 'busuanzi_value_page_pv'].forEach(function (id) {
      var el = document.getElementById(id)
      if (el && !el.textContent.trim()) hide(id)
    })
  }

  /**
   * 向 Worker 上报一次访问并读取实时数字（fire-and-forget）
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
      }).then(function (res) {
        clearTimeout(timer)
        return res.ok ? res.json() : null
      }).then(function (data) {
        applyLive(data)
      }).catch(function () {
        clearTimeout(timer)
      })
    } catch (e) {
      // 老浏览器不支持 fetch / AbortController：直接放弃计数
    }
  }

  function load () {
    if (!hasTarget()) return

    // 静态数据（同源，通常最快）
    var xhr = new XMLHttpRequest()
    xhr.open('GET', STATS_URL, true)
    xhr.timeout = 3000
    xhr.onload = function () {
      if (xhr.status !== 200) return
      try {
        applyStatic(JSON.parse(xhr.responseText))
      } catch (e) {
        // 解析失败就只用 Worker 的实时值
      }
    }
    xhr.send()

    // Worker 计数 + 实时值
    count()

    setTimeout(hideMissing, 3500)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load)
  } else {
    load()
  }

  document.addEventListener('pjax:complete', load)
})()
