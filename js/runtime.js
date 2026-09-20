/* 网站运行时间 */
(function () {
  // 建站日期：2026年4月1日
  var startDate = new Date('2026-04-07T00:00:00')

  function updateRuntime() {
    var now = new Date()
    var diff = now.getTime() - startDate.getTime()
    if (diff < 0) return

    // 计算年月日
    var years = now.getFullYear() - startDate.getFullYear()
    var months = now.getMonth() - startDate.getMonth()
    var days = now.getDate() - startDate.getDate()

    if (days < 0) {
      months--
      var prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      days += prevMonth.getDate()
    }
    if (months < 0) {
      years--
      months += 12
    }

    var parts = []
    if (years > 0) parts.push(years + ' 年')
    if (months > 0) parts.push(months + ' 个月')
    if (days >= 0) parts.push(days + ' 天')

    var el = document.getElementById('site-runtime')
    if (el) el.textContent = parts.join(' ')
  }

  // 等待 DOM 就绪
  function init() {
    var footer = document.querySelector('#footer .footer-other')
    if (!footer) {
      // 如果还没加载到，延迟重试
      setTimeout(init, 500)
      return
    }
    var div = document.createElement('div')
    div.className = 'site-runtime-wrap'
    div.innerHTML = '<i class="fas fa-clock"></i> <span class="runtime-label">本站已运行</span> <span id="site-runtime"></span>'
    footer.appendChild(div)
    updateRuntime()
    // 每分钟更新一次
    setInterval(updateRuntime, 60000)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()