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
