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
