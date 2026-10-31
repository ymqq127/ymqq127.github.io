/**
 * 站点访问统计 — 读取构建时写入的静态 JSON
 *
 * 数据来源：source/_data/stats.json（由 GitHub Actions 每日更新）
 * 特点：零外部请求依赖，访客端只读一个本站静态文件，不会卡顿
 *
 * 页面浏览量（page_pv）暂不提供，因为静态方案无法按页统计；
 * 对应元素会隐藏。
 */
;(function () {
  var STATS_URL = '/stats.json'

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

  function load () {
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
