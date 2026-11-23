/* Home: video hero, pinned scroll story, counter lookup, accordion */
(function () {
  'use strict';
  var $ = DV.$, $$ = DV.$$, still = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var cl = function (x) { return Math.max(0, Math.min(1, x)); };

  /* video */
  var v = $('.hero-m video'); v.src = innerWidth < 750 ? v.dataset.m : v.dataset.d;
  v.addEventListener('playing', function () { v.classList.add('on'); });
  if (!still) { var pl = v.play(); pl && pl.catch(function () { }); }

  /* scroll story */
  var lk = $('.lk'), shell = $('.hero-shell'), story = $('.story'), pin = $('.pin'), copy = $('.hero-c'), tabs = $$('.tabs button'), pn = $$('.pnl'), num = $('.rd span'), cur = 0, lock = 0;
  function geo() { var vh = innerHeight, mob = innerWidth < 750; return { top: shell.offsetTop + (mob ? -60 : 0), zoom: mob ? (vh * 1.6 - (vh - 60)) : vh * .9, total: story.offsetHeight - pin.offsetHeight }; }
  var G; function size() { G = geo(); tick(); }
  function show(i) {
    if (i === cur) return; cur = i;
    pn.forEach(function (p, k) { p.hidden = k !== i; p.classList.toggle('in', k === i); });
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
    num.textContent = '0' + (i + 1);
  }
  function tick() {
    var y = scrollY - G.top, z = cl(y / G.zoom), st = shell.style, ss = story.style;
    st.setProperty('--zoom', z); st.setProperty('--izoom', z); st.setProperty('--dark', cl((z - .2) / .6));
    copy.classList.toggle('off', z > .34);
    var entry = cl((z - .35) / .5);
    ss.setProperty('--entry', entry); ss.setProperty('--ap', cl((z - .25) / .7)); ss.setProperty('--total', cl(y / G.total));
    if (entry > .1) pin.removeAttribute('inert'); else pin.setAttribute('inert', '');
    var rest = G.total - G.zoom, c = cl((y - G.zoom) / rest) * 4, i = Math.min(3, Math.floor(c));
    ss.setProperty('--ch', y >= G.total ? 1 : c - i); show(i);
    document.body.classList.toggle('scrolled', scrollY > 120);
    if (innerWidth >= 750) { lk.style.opacity = cl(1 - scrollY / 80); lk.style.visibility = scrollY > 80 ? 'hidden' : ''; } else { lk.style.opacity = lk.style.visibility = ''; }
  }
  var q = false; addEventListener('scroll', function () { if (!q) { q = true; requestAnimationFrame(function () { q = false; tick(); }); } }, { passive: true });
  addEventListener('resize', size); size();
  function goTo(i) { scrollTo({ top: G.top + G.zoom + (G.total - G.zoom) * (i + .3) / 4, behavior: still ? 'auto' : 'smooth' }); }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { goTo(i); });
    t.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { var n = (i + d + 4) % 4; tabs[n].focus({ preventScroll: true }); goTo(n); } });
  });
  $('.hero-s').addEventListener('click', function (e) { e.preventDefault(); goTo(0); });

  /* counter lookup */
  var f = $('[data-lookup]'), s = $$('select', f), go = $('.go', f), st = $('.lk-s');
  s.forEach(function (x, i) { DV.fill(x, DV.KEYS[i]); x.addEventListener('change', function () { for (var k = i + 1; k < 4; k++) { s[k].value = ''; s[k].disabled = k > i + 1 || !x.value; } up(); }); });
  function up() { var d = s.every(function (x) { return x.value; }); go.disabled = !d; st.textContent = d ? DRAVOK.filter(function (p) { return DV.fit(p, val()) === 'ok'; }).length + ' machines are a direct fit for this counter.' : ''; }
  function val() { var o = {}; s.forEach(function (x, i) { o[DV.KEYS[i]] = x.value; }); return o; }
  function load(c) { s.forEach(function (x, i) { x.value = c ? c[DV.KEYS[i]] : ''; x.disabled = i > 0 && !c; }); up(); }
  f.addEventListener('submit', function (e) { e.preventDefault(); DV.setC(val()); location.href = 'all-machines.html?fit=matches'; });
  document.addEventListener('counter', function (e) { load(e.detail); }); if (DV.getC()) load(DV.getC());

  /* accordion */
  var ap = $$('.ap');
  function act(p) { ap.forEach(function (a) { var on = a === p; a.classList.toggle('on', on); $('h3 button', a).setAttribute('aria-expanded', on); }); }
  ap.forEach(function (p) { p.addEventListener('click', function (e) { if (!e.target.closest('a')) act(p); }); });
})();
