/*! 文章图片灯箱 —— 用 Fancybox 打开整组配图，带缩放与上一张/下一张 */
(function () {
  'use strict'

  var SCOPE = '#post-content, #article-container'

  function collect () {
    return [].slice.call(document.querySelectorAll(SCOPE + ' img'))
      .filter(function (img) { return !img.closest('.no-lightbox') })
  }

  // 点击目标可能是图片本身，也可能是主题包在外面的 <a data-fancybox>
  function findImg (e) {
    var t = e.target
    if (!t || !t.closest) return null
    var img = t.closest(SCOPE + ' img')
    if (img) return img
    var a = t.closest(SCOPE + ' a[data-fancybox]')
    if (a) return a.querySelector('img')
    return null
  }

  function open (img) {
    if (typeof Fancybox === 'undefined') return
    var imgs = collect()
    var items = imgs.map(function (i) {
      return {
        src: i.dataset.lazySrc || i.src,
        caption: i.alt || i.title || ''
      }
    })
    var idx = imgs.indexOf(img)
    Fancybox.show(items, {
      startIndex: idx < 0 ? 0 : idx,
      Carousel: { transition: 'slide' },
      Thumbs: { showOnStart: false },
      Toolbar: {
        display: {
          left: ['counter'],
          middle: ['zoomIn', 'zoomOut', 'toggle1to1', 'rotateCCW', 'rotateCW', 'reset'],
          right: ['thumbs', 'close']
        }
      }
    })
  }

  // 捕获阶段处理，先于 pjax 和主题默认绑定，避免点击图片变成跳转到图片地址
  document.addEventListener('click', function (e) {
    var img = findImg(e)
    if (!img) return
    e.preventDefault()
    e.stopImmediatePropagation()
    open(img)
  }, true)
})()
