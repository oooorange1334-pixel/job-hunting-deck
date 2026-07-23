// 求职直播演示稿 · 简易 slide 引擎
// 1920x1080 画布等比缩放；← → / Space 翻页，Home/End 首末页
(function () {
  const deck = document.querySelector('.deck');
  const slides = Array.from(document.querySelectorAll('.slide'));
  let cur = 0;

  // 自动填充页码
  slides.forEach((s, i) => {
    if (!s.querySelector('.page-num')) {
      const pn = document.createElement('div');
      pn.className = 'page-num';
      pn.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
      s.appendChild(pn);
    }
  });

  // 注入顶部标识（排除封面 / 章节过渡 / 收束）
  slides.forEach((s) => {
    if (s.classList.contains('cover') || s.classList.contains('chapter') || s.classList.contains('closing')) return;
    if (s.querySelector('.top-bar')) return;
    const bar = document.createElement('div');
    bar.className = 'top-bar';
    bar.innerHTML = '<img src="assets/qrcode.png" alt="二维码" />';
    s.appendChild(bar);
  });

  function show(i) {
    if (i < 0 || i >= slides.length) return;
    slides[cur].classList.remove('active');
    cur = i;
    slides[cur].classList.add('active');
    syncBodyBg();
    updateNav();
    location.hash = '#p' + (cur + 1);
  }

  function syncBodyBg() {
    const s = slides[cur];
    const isDark = s.classList.contains('chapter') || s.classList.contains('closing') || s.classList.contains('cover');
    document.body.style.background = isDark ? '#0f6e56' : '#FAFBFC';
  }

  function fit() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const scale = Math.max(w / 1920, h / 1080);
    deck.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
  }

  function updateNav() {
    const el = document.querySelector('.nav .pn');
    if (el) el.textContent = (cur + 1) + ' / ' + slides.length;
  }

  function onKey(e) {
    var k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') { show(cur + 1); e.preventDefault(); }
    else if (k === 'ArrowLeft'  || k === 'PageUp')           { show(cur - 1); e.preventDefault(); }
    else if (k === 'Home')                                   { show(0); e.preventDefault(); }
    else if (k === 'End')                                    { show(slides.length - 1); e.preventDefault(); }
    else if (k === 'Escape' || k === 'Esc' || e.keyCode === 27) { show(0); e.preventDefault(); }
  }
  window.addEventListener('keydown', onKey, true);

  window.addEventListener('resize', fit);

  // 初始定位
  const hash = location.hash.match(/#p(\d+)/);
  if (hash) cur = Math.max(0, Math.min(slides.length - 1, parseInt(hash[1], 10) - 1));
  slides.forEach((s, i) => s.classList.toggle('active', i === cur));
  syncBodyBg();

  // 导航条
  const nav = document.createElement('div');
  nav.className = 'nav';
  nav.innerHTML = '<button data-act="prev">◂</button><span class="pn"></span><button data-act="next">▸</button>';
  document.body.appendChild(nav);
  nav.querySelector('[data-act=prev]').onclick = () => show(cur - 1);
  nav.querySelector('[data-act=next]').onclick = () => show(cur + 1);

  fit();
  updateNav();
})();
