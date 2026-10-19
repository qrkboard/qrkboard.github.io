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

// Layout editor: a mouse removes Today, adds Quote of the day, resizes it, then swaps clock and weather.
(function () {
  const wrap = document.querySelector('[data-layout-anim]');
  if (!wrap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const W = 1182, H = 1202;
  const R = (x, y, w, h) => ({ x, y, w, h });
  const START = {
    clock: R(44, 141, 301, 106), weather: R(353, 141, 146, 106), today: R(44, 257, 455, 166),
    calendar: R(44, 433, 455, 225), cameras: R(44, 668, 455, 138), devices: R(44, 816, 455, 104), news: R(44, 932, 455, 36)
  };
  const LABEL = { clock: 'Clock', weather: 'Weather', today: 'Today · Coming up', calendar: 'Calendar', cameras: 'Cameras', devices: 'Devices', news: 'News', quote: 'Quote of the day' };
  const stage = document.createElement('div');
  stage.className = 'la-stage';
  stage.setAttribute('aria-hidden', 'true');
  stage.innerHTML = '<div class="la-box"></div>';
  const box = stage.firstChild;
  const px = (n) => 'calc(var(--s)*' + n + 'px)';
  const place = (el, r) => { el.style.left = px(r.x); el.style.top = px(r.y); el.style.width = px(r.w); el.style.height = px(r.h); };
  const tiles = {};
  const mk = (name, r, cls) => {
    const t = document.createElement('div');
    t.className = 'la-tile' + (cls ? ' ' + cls : '');
    t.textContent = LABEL[name];
    place(t, r);
    stage.appendChild(t);
    tiles[name] = t;
    return t;
  };
  const gap = document.createElement('div'); gap.className = 'la-gap'; place(gap, START.today); stage.appendChild(gap);
  const chip = document.createElement('div'); chip.className = 'la-chip'; place(chip, R(739, 201, 210, 37)); stage.appendChild(chip);
  const menu = document.createElement('div'); menu.className = 'la-menu'; menu.textContent = 'Remove tile'; stage.appendChild(menu);
  const cursor = document.createElement('div'); cursor.className = 'la-cursor';
  cursor.innerHTML = '<svg viewBox="0 0 30 36" width="100%" height="100%"><path d="M3 2v26l7-6 5 11 5-2-5-11h9z" fill="#fff" stroke="#111" stroke-width="2" stroke-linejoin="round"/></svg>';
  stage.appendChild(cursor);
  wrap.appendChild(stage);

  const fit = () => stage.style.setProperty('--s', (wrap.clientWidth / W).toFixed(4));
  fit();
  addEventListener('resize', fit);

  const at = (x, y) => { cursor.style.left = px(x); cursor.style.top = px(y); };
  const click = () => { cursor.classList.add('click'); setTimeout(() => cursor.classList.remove('click'), 160); };
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  let alive = false, gen = 0;

  function reset() {
    Object.keys(tiles).forEach(k => { tiles[k].remove(); delete tiles[k]; });
    Object.keys(START).forEach(k => mk(k, START[k]));
    gap.classList.remove('on'); chip.classList.remove('on'); menu.classList.remove('on');
    cursor.style.transition = 'none'; at(930, 330); cursor.offsetWidth; cursor.style.transition = '';
  }

  async function run() {
    if (alive) return;
    alive = true;
    const me = ++gen;
    stage.classList.add('on');
    while (alive && me === gen) {
      reset();
      await sleep(900);
      // Remove Today
      at(250, 330); await sleep(1000); click(); await sleep(300);
      place(menu, R(262, 345, 140, 38)); menu.classList.add('on'); await sleep(500);
      at(300, 363); await sleep(1000); click(); await sleep(250);
      menu.classList.remove('on'); tiles.today.classList.add('gone'); gap.classList.add('on'); await sleep(700);
      // Add Quote of the day
      at(845, 222); await sleep(1100); chip.classList.add('on'); click(); await sleep(350);
      chip.classList.remove('on');
      mk('quote', R(44, 257, 225, 64), 'new');
      tiles.quote.style.opacity = 0; tiles.quote.offsetWidth; tiles.quote.style.opacity = '';
      gap.classList.remove('on'); await sleep(900);
      // Resize it to fit the space
      at(266, 318); await sleep(1000); click(); tiles.quote.classList.add('drag');
      await sleep(200); at(497, 421); place(tiles.quote, START.today); await sleep(1100);
      tiles.quote.classList.remove('drag', 'new'); await sleep(700);
      // Swap clock and weather
      at(194, 194); await sleep(1000); click(); tiles.clock.classList.add('drag'); await sleep(200);
      at(426, 194); place(tiles.clock, START.weather); place(tiles.weather, START.clock); await sleep(1000);
      tiles.clock.classList.remove('drag'); at(560, 330); await sleep(3200);
      Object.values(tiles).forEach(t => t.style.opacity = 0);
      await sleep(600);
    }
  }
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) run(); else { alive = false; gen++; stage.classList.remove('on'); }
  }), { threshold: .3 }).observe(wrap);
})();
