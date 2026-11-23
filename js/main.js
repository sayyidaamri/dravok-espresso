/* Dravok — shared behaviour: storage, counter picker, dialogs, search, compare, support, forms */
(function () {
  'use strict';
  var D = window.DRAVOK, B = document.body.dataset.base || '';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return '$' + n.toLocaleString('en-US') + '.00'; };
  var store = { get: function (k, d) { try { return JSON.parse(localStorage.getItem('dv-' + k)) || d; } catch (e) { return d; } }, set: function (k, v) { try { localStorage.setItem('dv-' + k, JSON.stringify(v)); } catch (e) { } } };
  var by = function (id) { return D.filter(function (p) { return p.id === id; })[0]; };
  var range = function (p) { var a = p.cfg.map(function (c) { return c.price; }), l = Math.min.apply(0, a), h = Math.max.apply(0, a); return l === h ? money(l) : money(l) + '–' + money(h); };

  /* ---- counter options ---- */
  var OPT = { space: ['Home kitchen', 'Apartment nook', 'Office pantry', 'Cafe bar', 'Food truck', 'Studio'], power: ['110V / 15A', '110V / 20A', '220V / 16A', '220V / 32A'], water: ['Tank refill', 'Plumbed line', 'Bottle pump'], depth: ['12 in', '16 in', '20 in', '24 in', '30 in'] };
  var KEYS = ['space', 'power', 'water', 'depth'], LAB = { space: 'Space', power: 'Power', water: 'Water', depth: 'Depth' };
  function fit(p, c) {
    if (!c) return null;
    var v = c.power.slice(0, 4), d = parseFloat(c.depth);
    var volt = p.cfg.some(function (x) { return x.volt === v; }), dep = p.cfg.some(function (x) { return parseFloat(x.depth) <= d; });
    var both = p.cfg.some(function (x) { return x.volt === v && parseFloat(x.depth) <= d; });
    if (both && (p.line !== 'cafe' || c.water === 'Plumbed line')) return 'ok';
    return (volt || dep) ? 'review' : 'no';
  }
  var FITL = { ok: 'Direct Fit', review: 'Needs Review', no: 'Not a match' };
  var getC = function () { return store.get('counter', null); };
  function label(c) { return c ? c.space + ' · ' + c.power + ' · ' + c.depth : null; }
  function setC(c) {
    store.set('counter', c);
    if (c) { var m = store.get('mybar', []).filter(function (x) { return label(x) !== label(c); }); m.unshift(c); store.set('mybar', m.slice(0, 5)); }
    paint(); document.dispatchEvent(new CustomEvent('counter', { detail: c }));
  }
  function fill(sel, k) { sel.innerHTML = '<option value="">Select ' + k + '</option>' + OPT[k].map(function (o) { return '<option>' + o + '</option>'; }).join(''); }
  /* cascading picker used in the popover and in the visualizer */
  function picker(form, onDone, opts) {
    opts = opts || {}; var val = {};
    function draw() {
      var h = '', n = 0;
      for (var i = 0; i < KEYS.length; i++) {
        var k = KEYS[i];
        h += '<label>' + LAB[k] + '<select data-k="' + k + '"><option value="">Select ' + k + '</option>' + OPT[k].map(function (o) { return '<option' + (val[k] === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></label>';
        if (!val[k]) break; n++;
      }
      if (n === 4) h += '<button class="go" type="submit">' + (opts.go || 'Use this counter') + '</button>';
      form.innerHTML = (opts.pre || '') + h + '<button class="cl" type="button">Clear counter</button>';
    }
    form.addEventListener('change', function (e) { var k = e.target.dataset.k; if (!k) return; val[k] = e.target.value; KEYS.slice(KEYS.indexOf(k) + 1).forEach(function (x) { delete val[x]; }); draw(); var s = form.querySelectorAll('select'); s[s.length - 1].focus(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); onDone(Object.assign({}, val)); });
    form.addEventListener('click', function (e) { if (e.target.classList.contains('cl')) { val = {}; setC(null); draw(); } });
    val = Object.assign({}, getC() || {}); draw();
    return { reset: function () { val = Object.assign({}, getC() || {}); draw(); } };
  }

  /* ---- dialogs ---- */
  function open(id, from) { var d = $('#d-' + id); if (!d) return; if (d.open) return; hooks[id] && hooks[id](from); d.showModal(); document.documentElement.classList.add('lock'); }
  var hooks = {};
  function closeAll() { $$('dialog[open]').forEach(function (d) { d.close(); }); }
  $$('dialog').forEach(function (d) {
    d.addEventListener('close', function () { if (!$('dialog[open]:modal')) document.documentElement.classList.remove('lock'); $$('[data-pop][aria-expanded]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); }); });
    d.addEventListener('click', function (e) { if (e.target === d && d.matches(':modal')) { var r = d.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close(); } });
  });
  var popHooks = {};
  function pop(id, btn) {
    var d = $('#p-' + id); if (d.open) { d.close(); return; }
    var inModal = btn.closest('dialog:modal'); if (inModal) inModal.close();
    $$('.pop[open]').forEach(function (x) { x.close(); });
    popHooks[id] && popHooks[id]();
    d.show();
    var r = btn.getBoundingClientRect(), W = d.offsetWidth, H = d.offsetHeight, x = r.width ? r.left : 12, y = r.width ? r.bottom + 8 : 70;
    if (btn.classList.contains('bar-sel')) x = r.left; if (btn.classList.contains('vfy')) { x = r.left - 10; y = r.bottom - 2; }
    d.style.left = Math.max(12, Math.min(x, innerWidth - W - 12)) + 'px';
    d.style.top = Math.max(12, Math.min(y, innerHeight - H - 12)) + 'px';
    if (btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'true');
    var f = d.querySelector('select,button'); f && f.focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open],[data-close],[data-pop],[data-compare],[data-cookies]');
    if (t) {
      if (t.dataset.open) { e.preventDefault(); $$('.pop[open]').forEach(function (x) { x.close(); }); open(t.dataset.open); }
      else if (t.hasAttribute('data-close')) t.closest('dialog').close();
      else if (t.dataset.pop) { e.preventDefault(); pop(t.dataset.pop, t); }
      else if (t.dataset.compare) { e.preventDefault(); toggleCmp(t.dataset.compare); }
      else if (t.hasAttribute('data-cookies')) { $('#cookies').hidden = false; }
      return;
    }
    if (!e.target.closest('.pop')) $$('.pop[open]').forEach(function (x) { if (e.target.isConnected) x.close(); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $$('.pop[open]').forEach(function (x) { x.close(); }); });
  var tt; function toast(s) { var t = $('.toast'); t.textContent = s; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2200); }

  /* ---- compare / saved / my bar ---- */
  function toggleCmp(id) { var c = store.get('compare', []), i = c.indexOf(id); if (i > -1) c.splice(i, 1); else { if (c.length >= 4) { toast('You can compare up to 4 machines'); return; } c.push(id); toast(by(id).num + ' ' + by(id).name + ' added to compare'); } store.set('compare', c); paint(); hooks.compare(); }
  hooks.compare = function () {
    var c = store.get('compare', []).map(by).filter(Boolean), el = $('#d-compare .cmp');
    if (!c.length) { el.innerHTML = '<p>No machines to compare yet. Use Compare on any machine card.</p>'; return; }
    var row = function (l, f) { return '<tr><th scope="row">' + l + '</th>' + c.map(function (p) { return '<td>' + f(p) + '</td>'; }).join('') + '</tr>'; };
    el.innerHTML = '<table><thead><tr><th></th>' + c.map(function (p) { return '<th><img src="' + B + 'assets/img/' + p.img + '" alt=""><b>' + p.num + ' ' + p.name + '</b>' + p.finish + '<br><button class="btn-s" type="button" data-compare="' + p.id + '" style="margin-top:8px">Remove</button></th>'; }).join('') + '</tr></thead><tbody>' +
      row('MSRP', range) + row('Line', function (p) { return p.line[0].toUpperCase() + p.line.slice(1); }) + row('Groups', function (p) { return p.groups; }) + row('Boilers', function (p) { return p.boilers.join(', '); }) + row('Voltage', function (p) { return Array.from(new Set(p.cfg.map(function (x) { return x.volt; }))).join(', '); }) + row('Pressure', function (p) { return p.cfg[0].bar; }) + row('Pump', function (p) { return p.cfg[0].pump; }) + row('Counter fit', function (p) { var f = fit(p, getC()); return f ? FITL[f] : 'Select a counter'; }) + row('', function (p) { return '<a class="btn-s" href="' + B + 'products/' + p.id + '.html">View machine</a>'; }) + '</tbody></table>';
  };
  popHooks.mybar = function () {
    var m = store.get('mybar', []), cur = label(getC());
    $('#p-mybar .bd').innerHTML = '<p>Save up to 5 counters in this browser. One counter is active for fit across the site. Saved setups keep their original counter.</p><button class="btn-s" type="button" data-pop="saved">Saved setups (' + store.get('saved', []).length + ')</button><button class="btn-s" type="button" data-open="compare">Compare (' + store.get('compare', []).length + ')</button><hr><button class="btn-s" type="button" data-pop="counter">Add counter</button>' + (m.length ? m.map(function (c, i) { return '<div class="itm"><div><b>' + c.space + '</b>' + c.power + ' · ' + c.water + ' · ' + c.depth + '</div>' + (label(c) === cur ? '<small>Active</small>' : '<button type="button" data-use="' + i + '">Use</button>') + '<button type="button" data-rm="' + i + '">Remove</button></div>'; }).join('') : '<p style="margin:0">No counters saved yet. Add a counter, or save the one you are browsing with.</p>');
  };
  $('#p-mybar').addEventListener('click', function (e) { var m = store.get('mybar', []), d = e.target.dataset; if (d.use) { setC(m[+d.use]); popHooks.mybar(); } if (d.rm) { var x = m.splice(+d.rm, 1)[0]; store.set('mybar', m); if (label(x) === label(getC())) { store.set('counter', null); paint(); } popHooks.mybar(); } });
  popHooks.saved = function () {
    var s = store.get('saved', []);
    $('#p-saved .bd').innerHTML = '<p>Saved on this device. Use Share setup to open it on another device.</p>' + (s.length ? s.map(function (x, i) { var p = by(x.id); return '<div class="itm"><img src="' + B + 'assets/img/' + p.img + '" alt=""><div><b>' + p.num + ' ' + p.name + '</b>' + x.part + '<br><a href="' + B + 'products/' + p.id + '.html?part=' + x.part + '">Open setup</a></div><button type="button" data-rm="' + i + '">Remove</button></div>'; }).join('') : '<p style="margin:0">Save an exact machine configuration to return to it later.</p>');
  };
  $('#p-saved').addEventListener('click', function (e) { if (e.target.dataset.rm) { var s = store.get('saved', []); s.splice(+e.target.dataset.rm, 1); store.set('saved', s); paint(); popHooks.saved(); } });
  var pk = picker($('#p-counter [data-picker]'), function (c) { setC(c); $('#p-counter').close(); toast('Counter saved to My Bar'); });
  popHooks.counter = function () { pk.reset(); };
  function paint() {
    var c = getC();
    $$('[data-counter-label]').forEach(function (e) { e.textContent = c ? label(c) : (e.getAttribute('data-counter-label') || 'Select counter'); });
    $$('[data-n]').forEach(function (e) { e.textContent = store.get(e.dataset.n, []).length; });
    var cm = store.get('compare', []); $$('.cmp-b').forEach(function (b) { b.classList.toggle('on', cm.indexOf(b.dataset.compare) > -1); });
  }

  /* ---- search ---- */
  var sb = $('#d-search .sd-body'), si = $('#d-search input'), sc = $('#d-search .clr');
  function sws(p) { return '<span class="sws">' + [p].concat(D.filter(function (q) { return q.num === p.num && q !== p; })).map(function (q) { return '<span class="sw" style="background:' + q.sw + '"></span>'; }).join('') + '</span>'; }
  function find(q) { q = q.toLowerCase().split(/\s+/).filter(Boolean); var o = []; D.forEach(function (p) { p.cfg.forEach(function (c) { var t = [p.num, p.name, p.finish, p.line, c.part, c.boiler, c.volt, p.groups + ' group'].join(' ').toLowerCase(); if (q.every(function (w) { return t.indexOf(w) > -1; })) o.push([p, c]); }); }); return o; }
  function drawS() {
    var q = si.value.trim(); sc.hidden = !q;
    if (!q) { sb.innerHTML = '<p class="sd-h">Products</p><div class="sd-grid">' + [22, 23, 24, 14].map(function (i) { return D[i]; }).map(function (p) { return '<a href="' + B + 'products/' + p.id + '.html"><img src="' + B + 'assets/img/' + p.img + '" alt=""><span>' + p.num + ' ' + p.name + ' ' + p.finish + '</span>' + sws(p) + '<small>Boiler configurations</small><span class="pills">' + p.boilers.map(function (b) { return '<span>' + b + '</span>'; }).join('') + '</span></a>'; }).join('') + '</div>'; return; }
    var r = find(q);
    sb.innerHTML = r.length ? r.slice(0, 12).map(function (x) { var p = x[0], c = x[1]; return '<a class="sd-hit" href="' + B + 'products/' + p.id + '.html?part=' + c.part + '"><img src="' + B + 'assets/img/' + p.img + '" alt=""><span><em>Matching machine</em><b>' + p.num + ' ' + p.name + ' ' + p.finish + '</b>' + p.finish.toUpperCase() + ' · ' + c.boiler + ' · ' + c.volt + ' · ' + c.depth + ' depth · Part # ' + c.part + '<br><u>View this machine</u></span></a>'; }).join('') + '<a class="sd-hit" href="' + B + 'search.html?q=' + encodeURIComponent(q) + '"><u>View all results for “' + q.replace(/</g, '&lt;') + '”</u></a>' : '<p class="sd-none">No machines match “' + q.replace(/</g, '&lt;') + '”.</p>';
  }
  si.addEventListener('input', drawS);
  si.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); $('#d-search').close(); } if (e.key === 'Enter' && si.value.trim()) location.href = B + 'search.html?q=' + encodeURIComponent(si.value.trim()); });
  sc.addEventListener('click', function () { si.value = ''; drawS(); si.focus(); });
  hooks.search = function () { si.value = ''; drawS(); };

  /* ---- setup dialog ---- */
  function setup(p, c) {
    var f = fit(p, getC()), C = getC();
    $('#d-setup .set').innerHTML = '<div><img src="' + B + 'assets/img/' + p.img + '" alt=""></div><div><h3>' + p.num + ' ' + p.name + ' ' + p.finish + '</h3><p>' + (C ? label(C) : 'No counter selected') + '</p><dl>' + [['Part number', c.part], ['Finish', p.finish.toUpperCase()], ['Boiler', c.boiler], ['Voltage', c.volt], ['Depth', c.depth], ['Portafilter', c.pf], ['Pressure', c.bar], ['Clearance', c.clear], ['Pump type', c.pump], ['MSRP', money(c.price) + ' USD']].map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl><div class="vbox ' + (f === 'ok' ? 'ok' : f === 'no' ? 'no' : '') + '"><i>' + (f === 'ok' ? '✓' : f === 'no' ? '×' : '?') + '</i><span><b>' + (f ? FITL[f] : 'Unable to verify') + '</b><a href="' + B + 'faq.html#q1">View fit details</a></span></div><p class="fine">Fit rechecked when this setup was opened.</p><p class="fine">Confirm outlet, plumbing and cabinet height with your installer.</p><button class="btn-s" data-x="save">Save setup</button><button class="btn-s" data-x="share">Share setup</button><button class="btn-s" data-x="print">Print setup</button><button class="btn-s" data-compare="' + p.id + '">Compare</button><a class="btn-s" href="' + B + 'stockists.html">Find a stockist</a><button class="btn-s" data-x="ask">Ask about this setup</button><button class="btn-s" data-close>View machine</button><button class="btn-s" data-pop="counter">Select counter</button></div>';
    $('#d-setup .set').onclick = function (e) { var x = e.target.dataset.x; if (x === 'save') save(p, c); if (x === 'share') share(p, c); if (x === 'print') window.print(); if (x === 'ask') { $('#d-setup').close(); open('support'); $('#d-support textarea').value = 'About ' + c.part + ': '; } };
    open('setup');
  }
  function save(p, c) { var s = store.get('saved', []).filter(function (x) { return x.part !== c.part; }); s.unshift({ id: p.id, part: c.part }); store.set('saved', s.slice(0, 12)); paint(); toast('Setup saved'); }
  function share(p, c) { var u = location.href.split('?')[0] + '?part=' + c.part; if (navigator.clipboard) navigator.clipboard.writeText(u).then(function () { toast('Setup link copied'); }, function () { toast(c.part); }); else toast(c.part); }

  /* ---- support ---- */
  (function () {
    var d = $('#d-support'), log = $('.su-log', d), ta = $('textarea', d);
    function add(t, me) { var m = document.createElement('div'); m.className = 'msg' + (me ? ' me' : ''); if (!me) m.innerHTML = '<small>Dravok Assistant</small>'; m.appendChild(document.createTextNode(t)); log.appendChild(m); m.scrollIntoView({ block: 'nearest' }); }
    function answer(q) {
      var l = q.toLowerCase(), p = D.filter(function (x) { return l.indexOf(String(x.num)) > -1 || l.indexOf(x.name.toLowerCase()) > -1; })[0];
      if (p && /finish|color|colour/.test(l)) return 'The ' + p.num + ' ' + p.name + ' comes in ' + D.filter(function (x) { return x.num === p.num; }).map(function (x) { return x.finish; }).join(', ') + '.';
      if (p) return 'The ' + p.num + ' ' + p.name + ' comes with ' + p.boilers.join(', ') + ' boilers and starts at ' + money(Math.min.apply(0, p.cfg.map(function (c) { return c.price; }))) + '.';
      if (/warranty|broken|damage/.test(l)) return 'Boilers, groups and frames are covered for the first owner. The Warranty page has the details.';
      if (/fit|counter|outlet|volt|option/.test(l)) { var c = getC(); if (!c) return 'Select your counter above and I can list the machines that fit it.'; return 'For ' + label(c) + ', these are a Direct Fit: ' + (D.filter(function (x) { return fit(x, c) === 'ok'; }).slice(0, 6).map(function (x) { return x.num + ' ' + x.name; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(', ') || 'none yet, try a deeper counter') + '.'; }
      if (/boiler|size/.test(l)) return 'Pick 0.6L to 0.8L for one or two drinks, 1.2L to 1.8L for a busy kitchen, and 6L or more behind a bar.';
      return 'I can help with boilers, finishes, voltage and counter fit. Try a style number such as 2121.';
    }
    function send(q) { q = (q || ta.value).trim(); if (!q) { ta.focus(); return; } add(q, true); ta.value = ''; setTimeout(function () { add(answer(q)); }, 500); }
    $('.send', d).addEventListener('click', function () { send(); });
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    $$('.chips button', d).forEach(function (b) { b.addEventListener('click', function () { send(b.textContent); }); });
    $('[data-su-home]', d).addEventListener('click', function () { $$('.msg', log).slice(1).forEach(function (m) { m.remove(); }); });
    hooks.support = function () { setTimeout(function () { ta.focus(); }, 50); };
  })();

  /* ---- accessibility ---- */
  (function () {
    var a = store.get('a11y', {}), H = document.documentElement;
    function ap() { ['contrast', 'still', 'links', 'font', 'space'].forEach(function (k) { H.classList.toggle('ay-' + k, !!a[k]); $('[data-ay=' + k + ']').setAttribute('aria-pressed', !!a[k]); }); document.body.style.zoom = a.size || ''; $('[data-ay-size]').value = a.size || ''; store.set('a11y', a); }
    $$('[data-ay]').forEach(function (b) { b.addEventListener('click', function () { a[b.dataset.ay] = !a[b.dataset.ay]; ap(); }); });
    $('[data-ay-size]').addEventListener('change', function () { a.size = this.value; ap(); });
    $('[data-ay-reset]').addEventListener('click', function () { a = {}; ap(); });
    ap();
  })();

  /* ---- cookies ---- */
  (function () {
    var c = $('#cookies'); if (!store.get('cookies', null) && !/[?&]nocookie/.test(location.search)) setTimeout(function () { c.hidden = false; }, 600);
    c.addEventListener('click', function (e) { var k = e.target.dataset.ck; if (!k) return; if (k === 'manage') { var o = $('.ck-o', c); o.hidden = !o.hidden; return; } store.set('cookies', k); c.hidden = true; });
  })();

  /* ---- forms (demo only: nothing is sent) ---- */
  $$('form[data-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var ok = true;
      $$('.err', f).forEach(function (x) { x.remove(); });
      $$('[required]', f).forEach(function (i) { var bad = !i.checkValidity(); i.classList.toggle('bad', bad); if (bad) { if (ok) i.focus(); ok = false; if (f.dataset.form !== 'news' && i.type !== 'checkbox') { var s = document.createElement('span'); s.className = 'err'; s.textContent = i.type === 'email' && i.value ? 'Email must be formatted correctly.' : 'Please complete this required field.'; i.after(s); } } });
      if (f.dataset.form === 'news') { $('.ft-note', f).textContent = ok ? 'Thanks for signing up.' : 'Please complete all required fields.'; if (ok) f.reset(); return; }
      if (ok) { f.innerHTML = '<p class="done" role="status">Thank you. Your message has been received and our team will reply by email.</p>'; }
    });
  });

  paint();
  window.DV = { $: $, $$: $$, store: store, by: by, money: money, range: range, fit: fit, FITL: FITL, getC: getC, setC: setC, label: label, OPT: OPT, KEYS: KEYS, fill: fill, picker: picker, open: open, pop: pop, toast: toast, setup: setup, save: save, share: share, toggleCmp: toggleCmp, find: find, B: B };
})();
