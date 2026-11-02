/*! 加密文章密码框改为明文显示
 *
 * hexo-blog-encrypt 把输入框写死为 type="password"（圆点遮蔽），
 * 但本站的密码本身就写在提示语里，遮蔽没有意义，反而让访客
 * 没法核对大小写和空格。这里改成 type="text"。
 *
 * 用 MutationObserver 监听，兼容 pjax 切换和插件延迟渲染。
 */
;(function () {
  'use strict'

  function reveal () {
    var inputs = document.querySelectorAll('input.hbe-input-field, input#hbePass')
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].type !== 'text') {
        inputs[i].type = 'text'
        // 明文后自动补全可能把密码存进浏览器，关掉以免误填
        inputs[i].setAttribute('autocomplete', 'off')
        inputs[i].setAttribute('autocapitalize', 'off')
        inputs[i].setAttribute('autocorrect', 'off')
        inputs[i].setAttribute('spellcheck', 'false')
      }
    }
  }

  function start () {
    reveal()

    // 插件可能在 DOMContentLoaded 之后才插入输入框
    var timer = setInterval(reveal, 200)
    setTimeout(function () { clearInterval(timer) }, 8000)

    var mo = new MutationObserver(reveal)
    mo.observe(document.body, { childList: true, subtree: true })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start)
  } else {
    start()
  }

  // pjax 切换页面后重新处理
  document.addEventListener('pjax:complete', reveal)
})()
