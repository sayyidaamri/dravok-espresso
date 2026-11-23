/* Visualizer: choose a counter, then place machines on the scene */
(function () {
  'use strict';
  var $ = DV.$, $$ = DV.$$, f = $('.vz-f'), res = $('.vz-r'), mc = $('.mc'), L = $('.vz-l'), cur = null, sc = 1, WD = { home: 22, cafe: 42, lever: 17 };
  DV.picker(f, function (c) { DV.setC(c); show(); }, { pre: '<p>Choose your counter and its limits.</p>', go: 'See machines' });
  function list() { var l = $('[data-line]').value; L.innerHTML = DRAVOK.filter(function (p) { return !l || p.line === l; }).map(function (p) { return '<button type="button" data-id="' + p.id + '"><img src="assets/img/' + p.img + '" alt="" loading="lazy">' + p.num + ' ' + p.name + '<br>' + p.finish + '</button>'; }).join(''); }
  function put(id) { cur = DV.by(id); mc.style.opacity = 0; mc.onload = function () { mc.style.opacity = 1; }; mc.src = 'assets/img/cut/' + id + '.webp'; mc.alt = cur.num + ' ' + cur.name; mc.style.width = WD[cur.line] * sc + '%'; var ft = DV.fit(cur, DV.getC()); $('.cap').textContent = cur.num + ' ' + cur.name + ' · ' + cur.finish + (ft ? ' · ' + DV.FITL[ft] : ''); $('[data-view]').href = 'products/' + id + '.html'; $$('.vz-l button').forEach(function (b) { b.classList.toggle('on', b.dataset.id === id); }); }
  function show() { res.hidden = false; list(); put(cur ? cur.id : 'halcyon-2120-gloss-black'); res.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  L.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) put(b.dataset.id); });
  $('[data-line]').addEventListener('change', list);
  $('[data-scale]').addEventListener('input', function () { sc = this.value / 100; if (cur) mc.style.width = WD[cur.line] * sc + '%'; });
  var d = null; mc.addEventListener('pointerdown', function (e) { e.preventDefault(); d = e.clientX; mc.setPointerCapture(e.pointerId); });
  mc.addEventListener('pointermove', function (e) { if (d === null) return; var w = $('.stage').clientWidth, x = parseFloat(mc.style.left || 56) + (e.clientX - d) / w * 100; d = e.clientX; mc.style.left = Math.max(12, Math.min(88, x)) + '%'; });
  mc.addEventListener('pointerup', function () { d = null; });
  if (DV.getC()) { res.hidden = false; list(); put('halcyon-2120-gloss-black'); }
})();
