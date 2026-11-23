/* Product page: gallery, zoom, configurator, spec table */
(function () {
  'use strict';
  var $ = DV.$, $$ = DV.$$, p = DV.by($('[data-product]').dataset.product), cur = 0;
  /* gallery */
  var tr = $('.gal-t'), th = $$('.rail .th button'), box = $('.rail .th'), zi = $('.zoom>img'), zt = $$('.zoom .th button'), im = $$('.gal-t img');
  function go(i) { cur = (i + im.length) % im.length; tr.style.transform = 'translateX(' + (-100 * cur) + '%)'; im[cur].loading = 'eager'; th.forEach(function (b, k) { b.setAttribute('aria-current', k === cur); }); zt.forEach(function (b, k) { b.setAttribute('aria-current', k === cur); }); zi.src = im[cur].src; var b = th[cur]; if (box.scrollHeight > box.clientHeight + 2) box.scrollTop = b.offsetTop - box.offsetTop - 160; else box.scrollLeft = b.offsetLeft - 100; }
  th.forEach(function (b, i) { b.addEventListener('click', function () { go(i); }); });
  zt.forEach(function (b, i) { b.addEventListener('click', function () { go(i); }); });
  $$('[data-rail]').forEach(function (b) { b.addEventListener('click', function () { box.scrollTop += 162 * b.dataset.rail; }); });
  function rail() { $('[data-rail="-1"]').disabled = box.scrollTop < 4; $('[data-rail="1"]').disabled = box.scrollTop + box.clientHeight > box.scrollHeight - 4; }
  box.addEventListener('scroll', rail); setTimeout(rail, 300);
  var sx = null, gv = $('.gal-v'), moved = false;
  gv.addEventListener('pointerdown', function (e) { sx = e.clientX; moved = false; });
  addEventListener('pointerup', function (e) { if (sx === null) return; var d = e.clientX - sx; sx = null; if (Math.abs(d) > 40) { moved = true; go(Math.max(0, Math.min(im.length - 1, cur + (d < 0 ? 1 : -1)))); } });
  gv.addEventListener('dragstart', function (e) { e.preventDefault(); });
  gv.addEventListener('click', function () { if (!moved) DV.open('zoom'); });
  document.addEventListener('keydown', function (e) { if ($('#d-zoom').open) { if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(cur + 1); if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(cur - 1); } });
  /* configurator */
  var sel = $('[data-cfg]'), boil = '', cfg = null, pr = $('[data-price]'), us = $('.us'), yc = $('.yc');
  function opts() {
    var L = p.cfg.filter(function (c) { return !boil || c.boiler === boil; });
    $('label[for=cfg]').textContent = boil ? 'Choose voltage & depth' : 'Choose boiler, voltage & depth';
    sel.innerHTML = '<option value="">' + $('label[for=cfg]').textContent + '</option>' + L.map(function (c) { return '<option value="' + c.part + '">' + (boil ? '' : c.boiler + ' · ') + c.volt + ' · Depth: ' + c.depth.replace('"', ' in') + ' · ' + c.part + '</option>'; }).join('');
    if (L.length === 1 && boil) { sel.value = L[0].part; }
    pick();
  }
  function pick() {
    cfg = p.cfg.filter(function (c) { return c.part === sel.value; })[0] || null;
    var L = p.cfg.filter(function (c) { return !boil || c.boiler === boil; }), a = L.map(function (c) { return c.price; }), lo = Math.min.apply(0, a), hi = Math.max.apply(0, a);
    pr.innerHTML = 'MSRP: ' + (cfg ? DV.money(cfg.price) + '<small>USD · per machine</small>' : lo === hi ? DV.money(lo) + '<small>USD · per machine</small>' : DV.money(lo) + '–' + DV.money(hi));
    us.hidden = !!cfg || lo === hi; $('[data-price-bar]').textContent = DV.money(cfg ? cfg.price : lo);
    $$('.acts button').forEach(function (b) { b.disabled = !cfg; });
    yc.hidden = !cfg; if (cfg) { var f = DV.fit(p, DV.getC()); yc.innerHTML = '<b>Your configuration</b>' + cfg.boiler + ' · Voltage: ' + cfg.volt + ' · Depth: ' + cfg.depth + '<br>Part number: ' + cfg.part + '<br>' + (f ? 'Counter fit: ' + DV.FITL[f] : 'Select a counter to check fit.'); }
    specs(boil);
  }
  function specs(b) {
    $$('.spf button').forEach(function (x) { x.classList.toggle('on', x.dataset.s === b && !!b || (!b && specs.all && x.dataset.s === '')); });
    $$('.tbl tbody tr').forEach(function (r) { r.hidden = !!b && r.dataset.b !== b; r.classList.toggle('tg', !!cfg && r.dataset.part === cfg.part); });
    $('.sps').textContent = 'Showing configurations for ' + (b ? b + ' · ' : '') + p.groups + ' Group';
  }
  $$('[data-boilers] button').forEach(function (b) { b.addEventListener('click', function () { boil = boil === b.dataset.b ? '' : b.dataset.b; $$('[data-boilers] button').forEach(function (x) { x.classList.toggle('on', x.dataset.b === boil); }); opts(); }); });
  sel.addEventListener('change', pick);
  $$('.spf button').forEach(function (b) { b.addEventListener('click', function () { specs.all = !b.dataset.s; specs(b.dataset.s); }); });
  $$('[data-act]').forEach(function (b) { b.addEventListener('click', function () { if (!cfg) return; var a = b.dataset.act; if (a === 'save') DV.save(p, cfg); if (a === 'share') DV.share(p, cfg); if (a === 'compare') DV.toggleCmp(p.id); if (a === 'details') DV.setup(p, cfg); }); });
  function verify() { var f = DV.fit(p, DV.getC()); $('[data-verify]').textContent = f ? DV.FITL[f] + ': ' + DV.getC().space : 'Verify fit with your counter'; pick(); }
  document.addEventListener('counter', verify);
  opts(); verify();
  var q = /[?&]part=([^&]+)/.exec(location.search);
  if (q) { var c = p.cfg.filter(function (x) { return x.part === q[1]; })[0]; if (c) { boil = c.boiler; $$('[data-boilers] button').forEach(function (x) { x.classList.toggle('on', x.dataset.b === boil); }); opts(); sel.value = c.part; pick(); } }
  addEventListener('scroll', function () { $('.bar').classList.toggle('stuck', scrollY > 160); }, { passive: true });
})();
