/*! Pink Calendar Widget */
!function(){
  var now = new Date();
  var curYear = now.getFullYear();
  var curMonth = now.getMonth();
  var today = now.getDate();
  var weekNames = ['日','一','二','三','四','五','六'];

  function render(y, m) {
    var firstDay = new Date(y, m, 1).getDay();
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var prevDays = new Date(y, m, 0).getDate();
    var isCurMonth = (y === curYear && m === curMonth);
    var html = '';

    // Navigation
    html += '<div class="calendar-nav">';
    html += '<button class="cal-prev" title="上月"><i class="fas fa-chevron-left"></i></button>';
    html += '<span class="calendar-title">' + y + '年' + (m + 1) + '月</span>';
    html += '<button class="cal-next" title="下月"><i class="fas fa-chevron-right"></i></button>';
    html += '</div>';

    // Table
    html += '<table class="pink-calendar"><thead><tr>';
    for (var w = 0; w < 7; w++) html += '<th>' + weekNames[w] + '</th>';
    html += '</tr></thead><tbody>';

    var day = 1;
    var nextDay = 1;
    for (var i = 0; i < 6; i++) {
      if (i > 0 && day > daysInMonth) break;
      html += '<tr>';
      for (var j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          html += '<td class="other-month"><span>' + (prevDays - firstDay + j + 1) + '</span></td>';
        } else if (day > daysInMonth) {
          html += '<td class="other-month"><span>' + (nextDay++) + '</span></td>';
        } else {
          var cls = '';
          if (isCurMonth && day === today) cls = ' today';
          html += '<td class="' + cls + '"><span' + (cls ? ' class="today-span"' : '') + '>' + day + '</span></td>';
          day++;
        }
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    return html;
  }

  function build() {
    var aside = document.querySelector('#aside-content .sticky_layout') || document.querySelector('#aside-content');
    var announcement = document.querySelector('.card-announcement');
    if (!aside) return;

    var card = document.createElement('div');
    card.className = 'card-widget card-calendar';
    card.innerHTML = '<div class="item-headline"><i class="fas fa-calendar-alt"></i><span>日历</span></div><div class="calendar-body"></div>';

    if (announcement && announcement.parentNode === aside) {
      aside.insertBefore(card, announcement);
    } else {
      aside.insertBefore(card, aside.firstChild);
    }

    var body = card.querySelector('.calendar-body');
    var vy = curYear, vm = curMonth;

    function draw() { body.innerHTML = render(vy, vm); bindNav(); }
    draw();

    function bindNav() {
      var prev = card.querySelector('.cal-prev');
      var next = card.querySelector('.cal-next');
      if (prev) prev.onclick = function() { vm--; if (vm < 0) { vm = 11; vy--; } draw(); };
      if (next) next.onclick = function() { vm++; if (vm > 11) { vm = 0; vy++; } draw(); };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
}();