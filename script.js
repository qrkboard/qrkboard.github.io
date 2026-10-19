const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  }));
}
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

// Screenshot picker: layout, orientation and theme.
(function () {
  const stage = document.getElementById('stage'), img = document.getElementById('shot');
  if (!stage || !img) return;
  const st = { layout: '1', orient: 'landscape', theme: 'dark' };
  const names = { '1': 'everything', '2': 'photo clock', '3': 'calendar' };
  document.querySelectorAll('.seg').forEach(seg => seg.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    st[seg.dataset.key] = b.dataset.v;
    seg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const land = st.orient === 'landscape';
    stage.dataset.orient = st.orient;
    img.width = land ? 1920 : 1080; img.height = land ? 1080 : 1920;
    img.alt = `QRK Board, ${names[st.layout]} layout, ${st.orient}, ${st.theme} theme`;
    img.src = `assets/screens/${st.orient}-${st.layout}-${st.theme}.jpg`;
  }));
})();

// The mark: a Q whose colors sweep around the ring, with a pulse inside.
(function () {
  const cvs = [...document.querySelectorAll('canvas.logo')];
  if (!cvs.length) return;
  const W = 152, R = W / 2.2, C = W / 2, T = .34, TAU = Math.PI * 2;
  const col = v => `rgb(${[0, 1, 2].map(k => Math.round(Math.sin(v + k * 2.0944) * 127 + 128)).join()})`;
  const a = Math.PI / 4, tp = r => [C + Math.cos(a) * r * R, C + Math.sin(a) * r * R];
  const P = [[-1, 0], [-.62, 0], [-.5, -.18], [-.38, .34], [-.22, -.62], [-.06, .7], [.1, -.36], [.24, .22], [.34, 0], [1, 0]];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function draw(x, ph) {
    x.clearRect(0, 0, W, W);
    const g = x.createConicGradient(0, C, C);
    for (let i = 0; i <= 24; i++) g.addColorStop(i / 24, col(i / 24 * TAU - ph));
    x.strokeStyle = g; x.lineCap = 'round'; x.lineJoin = 'round';
    x.lineWidth = T * R; x.beginPath(); x.arc(C, C, (1 - T / 2) * R, 0, TAU); x.stroke();
    x.lineWidth = 1.05 * T * R; x.beginPath(); x.moveTo(...tp(1 - .9 * T)); x.lineTo(...tp(1 + .9 * T)); x.stroke();
    const sx = (1 - T) * .92 * R, sy = (1 - T) * .62 * R, w = x.createLinearGradient(C - sx, 0, C + sx, 0);
    for (let i = 0; i <= 8; i++) { const u = -.6 + 1.2 * i / 8; w.addColorStop(i / 8, col(u * 2.2 + 1.2 - ph)) }
    x.strokeStyle = w; x.lineWidth = .32 * T * R; x.beginPath();
    P.forEach(([px, py], i) => x[i ? 'lineTo' : 'moveTo'](C + px * sx, C + py * sy)); x.stroke();
  }
  const ctxs = cvs.map(c => c.getContext('2d'));
  function f(t) { ctxs.forEach(x => draw(x, t / 1000 * 2)); if (!still) requestAnimationFrame(f) }
  requestAnimationFrame(f);
})();

// Board screenshots: fade between the three themes every 30 seconds.
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('[data-fade]').forEach(card => {
    const imgs = [...card.querySelectorAll('img')];
    if (imgs.length < 2) return;
    card.classList.add('go');
    imgs[0].classList.add('on');
    let i = 0;
    setInterval(() => {
      imgs[i].classList.remove('on');
      i = (i + 1) % imgs.length;
      imgs[i].classList.add('on');
    }, 30000);
  });
})();

// Layout editor demo, built from the board's own web app styles: a mouse removes Today,
// adds Quote of the day, resizes it with the corner handle, then swaps clock and weather.
(function () {
  const wrap = document.querySelector('[data-layout-anim]');
  if (!wrap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const NAMES = { clock: 'Clock', weather: 'Weather', agenda: 'Today · coming up', month: 'Calendar', cameras: 'Cameras', devices: 'Devices', countdown: 'Countdown', quote: 'Quote of the day', brand: 'Branding' };
  const CHIPS = ['agenda', 'countdown', 'quote', 'brand', 'm1', 'm2'];
  const BW = 2160, BH = 3840, MARGIN = 48, GAP = 36, NEWS = 170, W = 788;
  const TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.87 12.14A2 2 0 0116.14 21H7.86a2 2 0 01-1.99-1.86L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>';
  const GRID = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 12h18M12 3v18"/></svg>';
  const host = document.createElement('div');
  host.className = 'lay-host';
  host.setAttribute('aria-hidden', 'true');
  host.innerHTML = `<div class="lay">
    <h2>${GRID}Layout</h2>
    <p class="help">Drag a tile to move it, or its corner to resize. Tap a tile for its settings.</p>
    <div class="editor">
      <div class="board-col"><div class="board"></div>
        <div class="row" style="gap:8px;margin-top:12px"><span style="font-size:13px;color:var(--mute)">Start from</span><span class="chip">1 · Default</span><span class="chip">2 · Photo clock</span><span class="chip">3 · Calendar</span></div>
      </div>
      <div class="side">
        <div class="sub-card hidden" data-k="sel"><div class="top"><b data-k="name"></b><span class="btn secondary small" data-k="remove">Remove</span></div>
          <div class="grid4"><label class="f"><span>Column</span><div class="inp" data-k="fx"></div></label><label class="f"><span>Row</span><div class="inp" data-k="fy"></div></label><label class="f"><span>Width</span><div class="inp" data-k="fw"></div></label><label class="f"><span>Height</span><div class="inp" data-k="fh"></div></label></div></div>
        <div class="sub-card"><div class="top"><b>Add a tile</b></div><div class="chips" data-k="chips"></div></div>
        <div class="sub-card"><div class="top"><b>Grid</b></div>
          <label class="f"><span>Columns</span><div class="inp">6</div></label>
          <div style="margin-top:10px;font-size:13px;color:var(--mute)">Share of board height</div>
          <div class="rows" style="margin-top:6px">${[16, 25, 34, 21, 16].map((n, i) => `<div class="r"><span>Row ${i + 1}</span><div class="inp">${n}</div><span class="icon">${TRASH}</span></div>`).join('')}</div>
          <span class="btn secondary small" style="display:inline-block;margin-top:8px">Add row</span>
          <div class="lchk" style="margin-top:8px"><i></i> News strip</div>
          <div class="lchk"><i></i> Camera alerts cover the calendar</div>
        </div>
      </div>
    </div>
    <div class="actions"><span class="btn secondary">Undo changes</span><span class="btn primary">Save layout</span></div>
    <svg class="cursor" viewBox="0 0 30 36"><path d="M3 2v26l7-6 5 11 5-2-5-11h9z" fill="#fff" stroke="#111" stroke-width="2" stroke-linejoin="round"/></svg>
  </div>`;
  wrap.appendChild(host);
  const lay = host.firstChild;
  const $ = (k) => lay.querySelector('[data-k="' + k + '"]');
  const board = lay.querySelector('.board'), cursor = lay.querySelector('.cursor');
  const rows = [16, 25, 34, 21, 16], COLS = 6;
  const news = document.createElement('div');
  news.className = 'news'; news.textContent = 'NEWS'; board.appendChild(news);

  let tiles = [], sel = null, sc = 1, els = new Map(), ids = 0;
  const START = () => [['clock', 0, 0, 4, 1], ['weather', 4, 0, 2, 1], ['agenda', 0, 1, 6, 1], ['month', 0, 2, 6, 1], ['cameras', 0, 3, 6, 1], ['devices', 0, 4, 6, 1]]
    .map(([type, x, y, w, h]) => ({ id: ++ids, type, x, y, w, h }));

  function geometry() {
    const k = board.clientWidth / BW;
    const gridH = BH - 2 * MARGIN - (NEWS + GAP), gridW = BW - 2 * MARGIN;
    const colW = (gridW - GAP * (COLS - 1)) / COLS, total = rows.reduce((a, b) => a + b, 0), free = gridH - GAP * (rows.length - 1);
    const rowY = [], rowH = []; let y = MARGIN;
    for (const w of rows) { rowY.push(y); rowH.push(free * w / total); y += free * w / total + GAP; }
    const box = (t) => {
      const left = MARGIN + t.x * (colW + GAP), top = rowY[t.y];
      return { left: left * k, top: top * k, width: (t.w * colW + (t.w - 1) * GAP) * k, height: (rowY[t.y + t.h - 1] + rowH[t.y + t.h - 1] - top) * k };
    };
    return { k, box, news: { left: MARGIN * k, top: (BH - MARGIN - NEWS) * k, width: gridW * k, height: NEWS * k } };
  }
  const px = (n) => n.toFixed(2) + 'px';
  function render() {
    const g = geometry();
    Object.assign(news.style, { left: px(g.news.left), top: px(g.news.top), width: px(g.news.width), height: px(g.news.height) });
    for (const t of tiles) {
      let e = els.get(t.id);
      if (!e) {
        e = document.createElement('div'); e.className = 'tile'; e.innerHTML = '<span></span><div class="size"></div>';
        e.firstChild.textContent = NAMES[t.type]; board.appendChild(e); els.set(t.id, e);
        const b = g.box(t); Object.assign(e.style, { left: px(b.left), top: px(b.top), width: px(b.width), height: px(b.height), opacity: 0 }); e.offsetWidth; e.style.opacity = '';
      }
      const b = g.box(t);
      Object.assign(e.style, { left: px(b.left), top: px(b.top), width: px(b.width), height: px(b.height) });
      e.classList.toggle('sel', t === sel);
    }
    for (const [id, e] of els) if (!tiles.some(t => t.id === id)) { e.style.opacity = 0; els.delete(id); setTimeout(() => e.remove(), 400); }
    $('sel').classList.toggle('hidden', !sel);
    if (sel) { $('name').textContent = NAMES[sel.type]; $('fx').textContent = sel.x + 1; $('fy').textContent = sel.y + 1; $('fw').textContent = sel.w; $('fh').textContent = sel.h; }
    const chips = CHIPS.filter(c => c === 'm1' || c === 'm2' || !tiles.some(t => t.type === c));
    $('chips').replaceChildren(...chips.map(c => {
      const s = document.createElement('span'); s.className = 'chip'; s.dataset.c = c;
      s.textContent = '+ ' + (c === 'm1' ? 'Metrics · Backyard' : c === 'm2' ? 'Metrics' : NAMES[c]); return s;
    }));
  }

  // Positions in the editor's own pixels (the scale only fits the page).
  const sx = () => lay.getBoundingClientRect().width / W;
  const rel = (r) => { const o = lay.getBoundingClientRect(), k = sx(); return { x: (r.left - o.left) / k, y: (r.top - o.top) / k, w: r.width / k, h: r.height / k }; };
  const goto = (p) => { cursor.style.left = px(p.x); cursor.style.top = px(p.y); };
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const press = async (el, cls) => { cursor.classList.add('click'); if (el) el.classList.add(cls || 'press'); await sleep(160); cursor.classList.remove('click'); if (el) el.classList.remove(cls || 'press'); };
  const centerOf = (el, dx = 0, dy = 0) => { const r = rel(el.getBoundingClientRect()); return { x: r.x + r.w / 2 + dx, y: r.y + r.h / 2 + dy }; };
  const tileOf = (type) => tiles.find(t => t.type === type);
  const handleOf = (t) => { const b = geometry().box(t), o = rel(board.getBoundingClientRect()); return { x: o.x + 1 + b.left + b.width - 6, y: o.y + 1 + b.top + b.height - 6 }; };

  function fit() {
    const was = wrap.classList.contains('live');
    wrap.classList.add('live');
    const k = wrap.clientWidth / W;
    lay.style.transform = 'scale(' + k + ')';
    sel = tiles[0] || null; render();
    const h = lay.offsetHeight * k;
    host.style.height = px(h); wrap.style.minHeight = px(h);
    sel = null; render();
    if (!was) wrap.classList.remove('live');
  }
  let alive = false, gen = 0;
  async function run() {
    if (alive) return;
    alive = true; const me = ++gen;
    const live = () => alive && me === gen;
    wrap.classList.add('live');
    while (live()) {
      tiles = START(); sel = null; render();
      cursor.style.transition = 'none'; goto({ x: 520, y: 330 }); cursor.getBoundingClientRect(); cursor.style.transition = '';
      await sleep(900); if (!live()) break;
      // Select Today, then Remove
      goto(centerOf(els.get(tileOf('agenda').id))); await sleep(1000); await press(); sel = tileOf('agenda'); render(); await sleep(900);
      goto(centerOf($('remove'))); await sleep(1000); await press($('remove')); tiles = tiles.filter(t => t !== sel); sel = null; render(); await sleep(900);
      // Add Quote of the day
      goto(centerOf(lay.querySelector('[data-c="quote"]'))); await sleep(1100);
      await press(lay.querySelector('[data-c="quote"]'));
      tiles.push({ id: ++ids, type: 'quote', x: 0, y: 1, w: 1, h: 1 }); sel = tiles[tiles.length - 1]; render(); await sleep(1000);
      // Resize it with the corner handle, a column at a time
      goto(handleOf(sel)); await sleep(1000); await press();
      cursor.style.transition = 'left .3s ease, top .3s ease, transform .12s';
      for (let w = 2; w <= COLS; w++) { sel.w = w; render(); goto(handleOf(sel)); await sleep(380); }
      cursor.style.transition = '';
      await sleep(900);
      // Swap clock and weather by dragging
      const clock = tileOf('clock'), weather = tileOf('weather');
      goto(centerOf(els.get(clock.id), -30, 0)); await sleep(1000); await press(); sel = clock; render(); await sleep(700);
      goto(centerOf(els.get(weather.id), 20, 0)); await sleep(250);
      clock.x = 2; weather.x = 0; render(); await sleep(1100);
      goto({ x: 520, y: 330 }); await sleep(3000);
      host.style.opacity = 0; await sleep(500); host.style.opacity = '';
    }
  }
  host.style.transition = 'opacity .45s';
  tiles = START(); fit();
  addEventListener('resize', fit);
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) run(); else { alive = false; gen++; wrap.classList.remove('live'); }
  }), { threshold: .3 }).observe(wrap);
})();
