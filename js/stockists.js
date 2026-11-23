/* Stockist finder: list + own SVG map (pan, zoom, pins). All stockists are fictional. */
(function () {
  'use strict';
  var $ = DV.$, $$ = DV.$$;
  var S = [['Northbar Supply', 'Online', 47.61, -122.33, 1, 0], ['Tamp & Tonic', 'Online', 41.88, -87.63, 1, 0], ['Hollow Street Coffee Works', '14 Hollow Street, Portland, Oregon', 45.52, -122.68, 0, 0], ['Fifth Boiler', 'Online', 40.71, -74.0, 1, 0], ['Ridgeway Espresso Lab', '220 Ridgeway Avenue, Austin, Texas', 30.27, -97.74, 0, 0], ['Crema Depot', '81 Alder Lane, Denver, Colorado', 39.74, -104.99, 0, 0], ['Maple Bar Outfitters', '9 Quay Road, Vancouver, Canada', 49.28, -123.12, 0, 1], ['Pressa Milano', 'Via dei Torni 31, Milan, Italy', 45.46, 9.19, 0, 1], ['Kessel & Korn', 'Werkstrasse 5, Hamburg, Germany', 53.55, 9.99, 0, 1], ['Grindhouse London', '47 Arch Row, London, United Kingdom', 51.5, -0.12, 0, 1], ['Kumo Espresso', '3-8 Kita, Osaka, Japan', 34.69, 135.5, 0, 1], ['Selatan Bar Supply', 'Jalan Melati 12, Jakarta, Indonesia', -6.2, 106.82, 0, 1], ['Harbour Nine', '9 Pier Lane, Melbourne, Australia', -37.81, 144.96, 0, 1], ['Casa Extracto', 'Rua das Flores 70, Sao Paulo, Brazil', -23.55, -46.63, 0, 1], ['Dune Roasters Supply', '18 Creek Walk, Dubai, United Arab Emirates', 25.2, 55.27, 0, 1], ['Lever & Lark', '6 Mill Passage, Cape Town, South Africa', -33.92, 18.42, 0, 1]].map(function (a, i) { return { i: i, n: a[0], a: a[1], la: a[2], lo: a[3], on: a[4], intl: a[5] }; });
  var xy = function (s) { var y = Math.log(Math.tan(Math.PI / 4 + s.la * Math.PI / 360)); return [(s.lo + 180) / 360 * 1000, 500 - y / Math.PI * 500 - 90]; };
  var list = $('.st-l'), pins = $('.pins'), vp = $('.vp'), map = $('.map'), tip = $('.mtip'), inp = $('.st-r input'), me = null, V = { k: 1, x: 0, y: 0 };
  function dist(a, b) { var r = Math.PI / 180, h = Math.pow(Math.sin((b.la - a.la) * r / 2), 2) + Math.cos(a.la * r) * Math.cos(b.la * r) * Math.pow(Math.sin((b.lo - a.lo) * r / 2), 2); return 7918 * Math.asin(Math.sqrt(h)); }
  function cur() {
    var q = inp.value.trim().toLowerCase(), it = $('.st-o [value=intl]').checked, on = $('.st-o [value=online]').checked, R = +$('.st-r select').value;
    return S.filter(function (s) { if (it && !s.intl) return false; if (on && !s.on) return false; if (q && (s.n + ' ' + s.a).toLowerCase().indexOf(q) < 0) return false; if (me && R && dist(me, s) > R) return false; return true; }).sort(function (a, b) { return me ? dist(me, a) - dist(me, b) : a.i - b.i; });
  }
  function draw() {
    var L = cur(); $('.st-n').textContent = L.length + ' stockist' + (L.length === 1 ? '' : 's') + ' available';
    list.innerHTML = L.map(function (s) { return '<div class="st-c" data-i="' + s.i + '"><h3>' + s.n.replace('&', '&amp;') + '</h3>' + (s.on ? '<span class="tag">Online retailer</span><br>' : '<p>' + s.a + (me ? ' · ' + Math.round(dist(me, s)) + ' mi' : '') + '</p>') + '<a href="contact.html">' + (s.on ? 'Website' : 'Contact store') + '</a></div>'; }).join('') || '<p style="padding:20px">No stockists match. Try another city or remove a filter.</p>';
    pins.innerHTML = L.map(function (s) { var p = xy(s); return '<circle class="pinm" data-i="' + s.i + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + 7 / V.k + '" stroke-width="' + 2 / V.k + '"/>'; }).join('');
  }
  function apply() { vp.setAttribute('transform', 'translate(' + V.x + ' ' + V.y + ') scale(' + V.k + ')'); $$('.pinm').forEach(function (c) { c.setAttribute('r', 7 / V.k); c.setAttribute('stroke-width', 2 / V.k); }); }
  function zoom(f, cx, cy) { var k = Math.max(1, Math.min(12, V.k * f)); f = k / V.k; cx = cx === undefined ? 500 : cx; cy = cy === undefined ? 410 : cy; V.x = cx - (cx - V.x) * f; V.y = cy - (cy - V.y) * f; V.k = k; if (k === 1) { V.x = V.y = 0; } apply(); tip.hidden = true; }
  function sel(i, pan) {
    var s = S[i], p = xy(s); $$('.st-c').forEach(function (c) { var o = +c.dataset.i === i; c.classList.toggle('on', o); if (o) list.scrollTop = c.offsetTop - list.offsetTop - 10; });
    $$('.pinm').forEach(function (c) { c.classList.toggle('on', +c.dataset.i === i); });
    if (pan) { V.k = 4; V.x = 500 - p[0] * 4; V.y = 410 - p[1] * 4; apply(); }
    var c = $('.pinm[data-i="' + i + '"]'); if (c) { var r = c.getBoundingClientRect(), m = map.getBoundingClientRect(); tip.textContent = s.n; tip.hidden = false; tip.style.left = r.left - m.left + r.width / 2 + 'px'; tip.style.top = r.top - m.top + 'px'; }
  }
  list.addEventListener('click', function (e) { var c = e.target.closest('.st-c'); if (c && !e.target.closest('a')) sel(+c.dataset.i, true); });
  pins.addEventListener('click', function (e) { if (e.target.dataset.i) sel(+e.target.dataset.i); });
  var dn = null; map.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; dn = [e.clientX, e.clientY]; });
  addEventListener('pointermove', function (e) { if (!dn) return; var s = 1000 / Math.max(map.clientWidth, map.clientHeight * 1000 / 820); V.x += (e.clientX - dn[0]) * s; V.y += (e.clientY - dn[1]) * s; dn = [e.clientX, e.clientY]; tip.hidden = true; apply(); });
  addEventListener('pointerup', function () { dn = null; });
  map.addEventListener('wheel', function (e) { e.preventDefault(); zoom(e.deltaY < 0 ? 1.25 : .8); }, { passive: false });
  var z = $$('.zm button'); z[0].onclick = function () { zoom(1.5); }; z[1].onclick = function () { zoom(1 / 1.5); };
  var tb = $$('.tb button'); tb.forEach(function (b, i) { b.onclick = function () { map.classList.toggle('sat', i === 1); tb.forEach(function (x, k) { x.setAttribute('aria-pressed', k === i); }); }; });
  var vw = $$('.st-v button'); vw.forEach(function (b, i) { b.onclick = function () { $('.st-g').classList.toggle('m', i === 1); vw.forEach(function (x, k) { x.setAttribute('aria-pressed', k === i); }); }; });
  $('.st-f').addEventListener('submit', function (e) { e.preventDefault(); draw(); });
  $('.st-f').addEventListener('change', draw);
  $('[data-loc]').onclick = function () { if (!navigator.geolocation) { DV.toast('Location is not available'); return; } navigator.geolocation.getCurrentPosition(function (p) { me = { la: p.coords.latitude, lo: p.coords.longitude }; draw(); }, function () { DV.toast('Location is not available'); }); };
  draw();
})();
