/* Collections: filter, sort, counter fit, load more */
(function () {
  'use strict';
  var $ = DV.$, $$ = DV.$$, grid = $('.cards'), cards = $$('.card', grid), PAGE = 28, shown = PAGE, fitOnly = /fit=matches/.test(location.search);
  var price = function (p) { return Math.min.apply(0, p.cfg.map(function (c) { return c.price; })); };
  function run() {
    var f = {}; $$('[data-f]:checked').forEach(function (i) { (f[i.dataset.f] = f[i.dataset.f] || []).push(i.value); });
    var c = DV.getC(), s = $('[data-sort]').value;
    var L = cards.map(function (el, i) { return { el: el, i: i, p: DV.by(el.dataset.id) }; }).filter(function (x) {
      var p = x.p; if (fitOnly && c && DV.fit(p, c) === 'no') return false; if (fitOnly && c && DV.fit(p, c) !== 'ok') return false;
      var v = { boiler: p.boilers, volt: p.cfg.map(function (k) { return k.volt; }), groups: [p.groups + ' Group'], finish: [p.finish], line: [p.line[0].toUpperCase() + p.line.slice(1)] };
      return Object.keys(f).every(function (k) { return f[k].some(function (o) { return v[k].indexOf(o) > -1; }); });
    });
    L.sort(function (a, b) { return s === 'lo' ? price(a.p) - price(b.p) : s === 'hi' ? price(b.p) - price(a.p) : s === 'az' ? a.p.name.localeCompare(b.p.name) : s === 'new' ? b.p.num - a.p.num : a.i - b.i; });
    cards.forEach(function (e) { e.hidden = true; });
    L.forEach(function (x, i) { grid.appendChild(x.el); x.el.hidden = i >= shown; });
    $$('[data-count]').forEach(function (e) { e.textContent = L.length; });
    $('.more').hidden = L.length <= shown; $('.none').hidden = L.length > 0;
    var n = $('.fitnote'); n.hidden = !(fitOnly && c); if (c) n.textContent = 'Showing machines that are a direct fit for ' + DV.label(c) + '.';
    $('[data-fit-link]').textContent = !c ? 'Select your counter to filter by fit' : fitOnly ? 'Show all machines' : 'Only show machines that fit ' + c.space;
  }
  $('#d-filter').addEventListener('change', function () { shown = PAGE; run(); });
  $('[data-clear]').addEventListener('click', function () { $$('[data-f]:checked').forEach(function (i) { i.checked = false; }); $('[data-sort]').value = ''; fitOnly = false; run(); });
  $('[data-fit-link]').addEventListener('click', function () { if (!DV.getC()) { $('#d-filter').close(); DV.pop('counter', $('.bar-sel')); fitOnly = true; } else { fitOnly = !fitOnly; run(); } });
  $('.more').addEventListener('click', function () { shown += PAGE; run(); });
  document.addEventListener('counter', run);
  run();
})();
