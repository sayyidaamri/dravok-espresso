/* Search results page */
(function () {
  'use strict';
  var $ = DV.$, $$ = DV.$$, q = new URLSearchParams(location.search).get('q') || '', inp = $('.srch-i input'), n = 12;
  inp.value = q;
  var vals = function (p) { return { boiler: p.boilers, groups: [p.groups + ' group'], volt: p.cfg.map(function (c) { return c.volt; }), finish: [p.finish], depth: p.cfg.map(function (c) { return c.depth; }) }; };
  $$('[data-q]').forEach(function (s) { var o = {}; DRAVOK.forEach(function (p) { vals(p)[s.dataset.q].forEach(function (v) { o[v] = 1; }); }); Object.keys(o).sort(function (a, b) { return parseFloat(a) - parseFloat(b) || a.localeCompare(b); }).forEach(function (v) { s.add(new Option(v, v)); }); s.addEventListener('change', run); });
  function run() {
    $('h1').textContent = q ? 'Results for “' + q + '”' : 'Search';
    var ids = q ? DV.find(q).map(function (x) { return x[0].id; }) : null;
    var L = DRAVOK.filter(function (p) { if (ids && ids.indexOf(p.id) < 0) return false; return $$('[data-q]').every(function (s) { return !s.value || vals(p)[s.dataset.q].indexOf(s.value) > -1; }); });
    $('.n').textContent = L.length + (L.length === 1 ? ' result' : ' results');
    $('.rs').innerHTML = L.slice(0, n).map(function (p) { var v = Array.from(new Set(p.cfg.map(function (c) { return c.volt; }))).join(', '); return '<a href="products/' + p.id + '.html"><img src="assets/img/' + p.img + '" alt=""><span class="s">' + p.num + '</span><b>' + p.name + '</b><small>' + p.finish + '</small><span class="d">Boilers: ' + p.boilers.join(', ') + '</span><span class="d">Voltage: ' + v + '</span><span class="d">' + p.cfg.length + ' configurations</span><u>View machine options →</u></a>'; }).join('') || '<p>No machines found. Try a style number, a name or a finish.</p>';
    $('.m2').hidden = L.length <= n;
    var c = DV.getC(); $('.tip>span').textContent = c ? 'Checking fit for ' + DV.label(c) : 'Select a counter to check fit.';
  }
  $('.m2').addEventListener('click', function () { n += 12; run(); });
  $('[data-clr]').addEventListener('click', function () { $$('[data-q]').forEach(function (s) { s.value = ''; }); run(); });
  inp.addEventListener('input', function () { q = inp.value.trim(); n = 12; run(); });
  $('.srch-i button').addEventListener('click', function () { inp.value = q = ''; run(); inp.focus(); });
  $('.mwf-t').addEventListener('click', function () { var o = $('.mwf').classList.toggle('on'); this.setAttribute('aria-expanded', o); $('span', this).textContent = o ? '–' : '+'; });
  document.addEventListener('counter', run);
  run();
})();
