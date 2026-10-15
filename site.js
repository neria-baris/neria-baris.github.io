/* Neria Baris — the engine behind the site.
   You should not need to edit this file to change the site's text: that all lives in index.html.
   The few settings worth changing are in CONFIG just below. */

const CONFIG = {
  playIntro: true,   // the opening: a point → yod → heh. false = start straight on the rings
  ringGap: 20,       // distance between the rings of letters, in pixels
  hoverRadius: 90,   // how far around the mouse letters come apart
  nameFont: 'cormorant'
};

class Site {
  constructor() {
    this.state = { introDone: false, showSkip: false, logoIn: false, nameIn: false, active: 0 };
    this.activeIdx = 0;
    // 27 letters in gematria order: units א–ט, tens י–צ, hundreds ק–ת then finals ך ם ן ף ץ (500–900).
    // Every letter is built only from yods (short strokes) and vavs (long strokes): [x1, y1, x2, y2] in a unit cell.
    this.STROKES = [
      [[-0.32, -0.4, 0.32, 0.42], [0.24, -0.4, 0.16, -0.04], [-0.14, 0.06, -0.26, 0.42]],
      [[-0.32, -0.36, 0.26, -0.36], [0.26, -0.36, 0.26, 0.36], [-0.36, 0.38, 0.36, 0.38]],
      [[0.08, -0.38, 0.08, 0.4], [0.08, 0.1, -0.2, 0.4]],
      [[-0.36, -0.36, 0.3, -0.36], [0.22, -0.36, 0.22, 0.42]],
      [[-0.34, -0.36, 0.32, -0.36], [0.26, -0.36, 0.26, 0.42], [-0.26, 0.0, -0.26, 0.42]],
      [[0, -0.4, 0, 0.42]],
      [[-0.16, -0.38, 0.16, -0.38], [0, -0.38, 0, 0.42]],
      [[-0.3, -0.36, 0.3, -0.36], [0.26, -0.36, 0.26, 0.42], [-0.26, -0.36, -0.26, 0.42]],
      [[-0.28, -0.3, -0.28, 0.38], [-0.28, 0.38, 0.28, 0.38], [0.28, 0.38, 0.28, -0.36], [0.28, -0.36, 0.06, -0.16]],
      [[0.04, -0.4, -0.04, -0.08]],
      [[-0.3, -0.36, 0.24, -0.36], [0.28, -0.32, 0.28, 0.32], [0.24, 0.36, -0.3, 0.36]],
      [[-0.24, -0.62, -0.24, -0.14], [-0.24, -0.14, 0.26, -0.14], [0.26, -0.14, 0.06, 0.36]],
      [[-0.2, -0.36, 0.26, -0.36], [0.28, -0.36, 0.28, 0.38], [0.28, 0.38, -0.06, 0.38], [-0.28, -0.36, -0.32, 0.38]],
      [[-0.04, -0.38, 0.12, -0.38], [0.12, -0.38, 0.12, 0.36], [0.12, 0.38, -0.2, 0.38]],
      [[-0.3, -0.36, 0.3, -0.36], [0.3, -0.36, 0.26, 0.3], [0.26, 0.36, -0.26, 0.36], [-0.3, 0.3, -0.3, -0.36]],
      [[0.24, -0.38, 0.2, 0.3], [-0.22, -0.38, 0.0, 0.2], [0.2, 0.3, -0.34, 0.4]],
      [[-0.3, -0.36, 0.24, -0.36], [0.28, -0.32, 0.28, 0.32], [0.24, 0.36, -0.3, 0.36], [-0.26, -0.36, -0.2, -0.06]],
      [[0.26, -0.38, 0.2, -0.04], [-0.26, -0.38, 0.22, 0.3], [0.26, 0.36, -0.32, 0.38]],
      [[-0.3, -0.36, 0.3, -0.36], [0.3, -0.36, 0.3, 0.1], [-0.24, -0.12, -0.24, 0.62]],
      [[-0.32, -0.36, 0.22, -0.36], [0.26, -0.32, 0.26, 0.42]],
      [[0.28, -0.38, 0.14, 0.36], [0.0, -0.38, 0.04, 0.0], [-0.3, -0.38, -0.1, 0.36], [-0.12, 0.38, 0.16, 0.38]],
      [[-0.32, -0.36, 0.3, -0.36], [0.24, -0.36, 0.24, 0.42], [-0.24, -0.36, -0.24, 0.4], [-0.24, 0.4, -0.36, 0.4]],
      [[-0.3, -0.36, 0.22, -0.36], [0.26, -0.32, 0.26, 0.66]],
      [[-0.3, -0.36, 0.3, -0.36], [0.3, -0.36, 0.3, 0.38], [0.3, 0.38, -0.3, 0.38], [-0.3, 0.38, -0.3, -0.36]],
      [[0, -0.38, 0, 0.66], [-0.14, -0.38, 0, -0.38]],
      [[-0.3, -0.36, 0.24, -0.36], [0.28, -0.32, 0.28, 0.66], [-0.26, -0.36, -0.2, -0.06]],
      [[0.26, -0.38, 0.2, 0.0], [-0.26, -0.38, 0.2, 0.06], [0.2, 0.06, 0.2, 0.66]]
    ];
    this.YOD = this.STROKES.map((L) => L.map((s) => Math.hypot(s[2] - s[0], s[3] - s[1]) < 0.42));
    this.GRAY_L = ['#ffffff', '#e4e4e4', '#cfcfcf', '#b8b8b8', '#9d9d9d', '#808080', '#626262', '#454545', '#292929', '#111111'];
    this.GRAY_D = ['#111111', '#2a2a2a', '#3d3d3d', '#535353', '#6c6c6c', '#888888', '#a5a5a5', '#c2c2c2', '#dcdcdc', '#f2f2f2'];
    this.heatMap = new Map();
    this.over = new Map();
    this.mapCache = new Map();
    this.LETTERS = 'אבגדהוזחטיכלמנסעפצקרשתךםןףץ'.split('');
    this.VAL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    this.buckets = [];
    for (let i = 0; i < 80; i++) this.buckets.push([]);
    this.props = CONFIG;
    const $ = (id) => document.getElementById(id);
    this.root = $('site'); this.cv = $('field'); this.track = $('track');
    this.logo = $('logo-glyph'); this.logoBtn = $('logo');
    this.nameBox = $('namebox'); this.nameEl = $('name');
    this.sections = Array.from(this.track.children).filter((el) => el.tagName === 'SECTION');
    this.N = this.sections.length;
    this.navBtns = Array.from(document.querySelectorAll('header [data-go]'));
    this.labels = this.sections.map((sec, i) => (this.navBtns[i] ? this.navBtns[i].textContent.trim() : sec.getAttribute('aria-label') || ''));
    this.uiEls = Array.from(document.querySelectorAll('.ui'));
    this.counter = $('counter'); this.footLabel = $('foot-label'); this.progress = $('progress-fill');
    this.prevBtn = $('prev'); this.nextBtn = $('next'); this.skipBtn = $('skip');
    this.navBtns.forEach((b) => b.addEventListener('click', () => this.goTo(+b.getAttribute('data-go'))));
    this.prevBtn.addEventListener('click', () => this.goTo(this.activeIdx - 1));
    this.nextBtn.addEventListener('click', () => this.goTo(this.activeIdx + 1));
    this.logoBtn.addEventListener('click', () => this.goTo(0));
    this.skipBtn.addEventListener('click', () => this.skipIntro());
    const rp = $('replay'); if (rp) rp.addEventListener('click', () => this.replayIntro());
    this.loop = (now) => this.frame(now);
  }

  setState(patch) { Object.assign(this.state, patch); this.render(); }

  render() {
    const s = this.state, a = s.active, done = s.introDone, N = this.N;
    for (const el of this.uiEls) el.classList.toggle('on', done);
    this.logoBtn.classList.toggle('on', done || s.logoIn);
    this.logoBtn.classList.toggle('live', done);
    this.nameBox.classList.toggle('on', done || s.nameIn);
    this.skipBtn.hidden = !(s.showSkip && !done);
    this.navBtns.forEach((b, i) => { if (i === a) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    const pad = (x) => (x < 10 ? '0' : '') + x;
    this.counter.textContent = pad(a + 1) + ' / ' + pad(N);
    this.footLabel.textContent = a === 0 ? 'Scroll or drag →' : this.labels[a];
    this.progress.style.width = (((a + 1) / N) * 100).toFixed(2) + '%';
    this.prevBtn.disabled = a === 0;
    this.nextBtn.disabled = a === N - 1;
  }

  clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  ease(x) { x = this.clamp01(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  easeOut(x) { x = this.clamp01(x); return 1 - Math.pow(1 - x, 3); }
  sstep(a, b, x) { const p = this.clamp01((x - a) / (b - a)); return p * p * (3 - 2 * p); }
  lerp(a, b, p) { return a + (b - a) * p; }
  hash(i, j) {
    let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  }

  mount() {
    this.alive = true;
    this.reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.cur = 0; this.target = 0; this.lastTx = null;
    this.mouse = { x: -1e4, y: -1e4, px: -1e4, py: -1e4 };
    this.t0 = null; this.time = 0; this.prevNow = null; this.dt = 0.016;
    const hashIdx = this.sections.findIndex((sec) => sec.id && '#' + sec.id === location.hash);
    this.skipped = this.props.playIntro === false || this.reduce || hashIdx > 0;
    if (hashIdx > 0) { this.activeIdx = hashIdx; this.state.active = hashIdx; }
    if (this.skipped) this.setState({ introDone: true, logoIn: true, nameIn: true });
    this.resize();
    if (window.ResizeObserver && this.root) { this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this.root); }
    this.attach();
    const fonts = (document.fonts && document.fonts.load)
      ? Promise.all([
          document.fonts.load(this.nameFontSpec(), 'Neria Baris').catch(() => null),
          document.fonts.load('24px "Stam Ashkenaz"', this.LETTERS.join('')).catch(() => null)
        ])
      : Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 2000))]).then(() => {
      if (!this.alive) return;
      this.ready = true;
      this.buildAtlases();
      this.measure();
      if (!this.skipped) this.buildIntro();
      this.t0 = null;
      this.raf = requestAnimationFrame(this.loop);
    });
    this.skipTimer = setTimeout(() => { if (this.alive && !this.skipped) this.setState({ showSkip: true }); }, 1400);
  }

  nameStyle() {
    const S = {
      cormorant: { f: "'Cormorant Garamond', serif", w: 300, ls: '0.01em', z: '1.12em' },
      instrument: { f: "'Instrument Serif', serif", w: 400, ls: '-0.01em', z: '1.1em' },
      fell: { f: "'IM Fell English', serif", w: 400, ls: '0em', z: '1em' },
      fraktur: { f: "'UnifrakturMaguntia', serif", w: 400, ls: '0.01em', z: '1em' },
      cinzel: { f: "'Cinzel', serif", w: 400, ls: '0.12em', z: '0.72em' },
      mono: { f: "'IBM Plex Mono', monospace", w: 400, ls: '-0.03em', z: '0.78em' },
      frank: { f: "'Frank Ruhl Libre', serif", w: 900, ls: '0em', z: '1em' }
    };
    return S[this.props.nameFont] || S.cormorant;
  }

  nameFontSpec() { const n = this.nameStyle(); return n.w + ' 80px ' + n.f; }

  attach() {
    const el = this.root; if (!el) return;
    this.lastWheel = 0; this.acc = 0; this.locked = false;
    this.onWheel = (e) => {
      e.preventDefault();
      if (!this.skipped) { this.skipIntro(); return; }
      const raw = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const d = raw * (e.deltaMode === 1 ? 16 : 1);
      const now = performance.now();
      if (now - this.lastWheel > 220) { this.acc = 0; this.locked = false; }
      this.lastWheel = now;
      if (this.locked) return;
      this.acc += d;
      if (Math.abs(this.acc) > 28) { this.locked = true; this.goTo(this.activeIdx + (this.acc > 0 ? 1 : -1)); }
    };
    this.onMove = (e) => {
      const r = el.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left; this.mouse.y = e.clientY - r.top;
    };
    this.onLeave = () => { this.mouse.x = this.mouse.y = this.mouse.px = this.mouse.py = -1e4; };
    this.onTS = (e) => {
      if (!this.skipped) this.skipIntro();
      const t = e.touches[0]; if (!t) return;
      this.drag = { x: t.clientX, y: t.clientY, lx: t.clientX, c: this.cur, base: this.activeIdx, moved: false };
      this.onMove(t);
    };
    this.onTM = (e) => {
      const t = e.touches[0]; if (!t || !this.drag) return;
      const dx = t.clientX - this.drag.x, dy = t.clientY - this.drag.y;
      if (!this.drag.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) this.drag.moved = true;
      if (this.drag.moved) this.target = this.clampT(this.drag.c - dx);
      this.drag.lx = t.clientX;
      this.onMove(t);
    };
    this.onTE = () => {
      const d = this.drag; this.drag = null;
      if (!d || !d.moved) { this.onLeave(); return; }
      const dx = d.lx - d.x, th = this.W * 0.12;
      this.goTo(d.base + (dx < -th ? 1 : dx > th ? -1 : 0));
      this.onLeave();
    };
    this.onFocus = (e) => {
      const s = e.target && e.target.closest ? e.target.closest('[data-sec]') : null;
      if (el.scrollLeft) el.scrollLeft = 0;
      if (s) { const i = +s.getAttribute('data-sec'); if (i !== this.activeIdx) this.goTo(i); }
    };
    el.addEventListener('wheel', this.onWheel, { passive: false });
    el.addEventListener('mousemove', this.onMove);
    el.addEventListener('mouseleave', this.onLeave);
    el.addEventListener('touchstart', this.onTS, { passive: true });
    el.addEventListener('touchmove', this.onTM, { passive: true });
    el.addEventListener('touchend', this.onTE);
    el.addEventListener('focusin', this.onFocus);
  }

  clampT(x) { return Math.max(0, Math.min((this.N - 1) * (this.W || 1), x)); }

  goTo(i) {
    i = Math.max(0, Math.min(this.N - 1, i));
    this.activeIdx = i;
    this.target = i * (this.W || 0);
    if (this.state.active !== i) this.setState({ active: i });
    const id = this.sections[i] && this.sections[i].id;
    if (id && window.history && history.replaceState) history.replaceState(null, '', i === 0 ? location.pathname : '#' + id);
  }

  skipIntro() {
    if (this.skipped) return;
    this.skipped = true;
    this.setState({ introDone: true, logoIn: true, nameIn: true, showSkip: false });
  }

  replayIntro() {
    this.activeIdx = 0; this.target = 0; this.cur = 0;
    this.heatMap.clear(); this.over.clear();
    this.skipped = false; this.t0 = null;
    this.setState({ introDone: false, logoIn: false, nameIn: false, showSkip: false, active: 0 });
    clearTimeout(this.skipTimer);
    this.skipTimer = setTimeout(() => { if (this.alive && !this.skipped) this.setState({ showSkip: true }); }, 1400);
  }

  resize() {
    if (!this.root || !this.cv) return;
    const r = this.root.getBoundingClientRect();
    const W = Math.max(1, r.width), H = Math.max(1, r.height);
    this.W = W; this.H = H;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.narrow = W < 760;
    this.S = this.narrow ? 12.5 : 15;
    this.ls = this.narrow ? 12.5 : 15;
    // STaM atlas cell: the letter body (baseline → 0.513em) is sized to the yod/vav stroke model (≈0.8·S),
    // with room above for lamed and the tagin and below for the final letters.
    this.fsz = this.S * 1.56;
    this.acw = Math.ceil(this.fsz * 0.9);
    this.ach = Math.ceil(this.fsz * 1.56);
    this.aoy = this.fsz * (1.12 - 0.256);
    this.cv.width = Math.round(W * this.dpr); this.cv.height = Math.round(H * this.dpr);
    this.heatMap.clear(); this.over.clear();
    this.I = null; this.TE = null;
    if (this.ready) { this.buildAtlases(); this.measure(); }
    this.target = this.activeIdx * W; this.cur = this.target;
  }

  buildAtlases() {
    const make = (cols) => {
      const dpr = this.dpr, w = this.acw, h = this.ach, n = this.LETTERS.length;
      const a = document.createElement('canvas');
      a.width = Math.ceil(n * w * dpr); a.height = Math.ceil(10 * h * dpr);
      const c = a.getContext('2d');
      c.scale(dpr, dpr);
      c.font = this.fsz.toFixed(2) + 'px "Stam Ashkenaz", serif';
      c.direction = 'ltr'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      for (let v = 1; v < 10; v++) {
        c.fillStyle = cols[v];
        for (let i = 0; i < n; i++) c.fillText(this.LETTERS[i], i * w + w / 2, v * h + this.fsz * 1.12);
      }
      return a;
    };
    this.atlasL = make(this.GRAY_L);
    this.atlasD = make(this.GRAY_D);
  }

  measure() {
    const W = this.W, H = this.H;
    const nw = this.nameEl ? this.nameEl.getBoundingClientRect().width : 0;
    this.r0 = Math.max(this.narrow ? 100 : 150, nw / 2 + (this.narrow ? 28 : 48));
  }

  // ---- intro: a point of ink blooms, drips into the STaM yod, and the yod flows and drips into the STaM heh ----
  // Shapes are signed-distance fields of the real glyphs; ink advances along each letter by geodesic distance
  // from where it starts (so it runs along the strokes, faster downward), with a swollen meniscus at its front.
  smin(a, b, k) {
    if (k <= 0) return a < b ? a : b;
    const h = Math.max(k - Math.abs(a - b), 0) / k;
    return (a < b ? a : b) - h * h * k * 0.25;
  }
  flowP(u, span, pw) { return u <= 0 ? -0.15 : Math.pow(Math.min(1, u), pw) * span - 0.12; }

  edt(g, w, h) {
    const n = Math.max(w, h), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
    const one = (len) => {
      let k = 0; v[0] = 0; z[0] = -1e20; z[1] = 1e20;
      for (let q = 1; q < len; q++) {
        let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
        k++; v[k] = q; z[k] = s; z[k + 1] = 1e20;
      }
      k = 0;
      for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; const r = q - v[k]; d[q] = r * r + f[v[k]]; }
    };
    for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) f[y] = g[y * w + x]; one(h); for (let y = 0; y < h; y++) g[y * w + x] = d[y]; }
    for (let y = 0; y < h; y++) { const o = y * w; for (let x = 0; x < w; x++) f[x] = g[o + x]; one(w); for (let x = 0; x < w; x++) g[o + x] = d[x]; }
  }

  sdf(m, w, h) {
    const n = w * h, a = new Float64Array(n), b = new Float64Array(n);
    for (let i = 0; i < n; i++) { a[i] = m[i] ? 0 : 1e20; b[i] = m[i] ? 1e20 : 0; }
    this.edt(a, w, h); this.edt(b, w, h);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = m[i] ? -(Math.sqrt(b[i]) - 0.5) : (Math.sqrt(a[i]) - 0.5);
    return out;
  }

  down(s, sw, sh, k) {
    const gw = sw >> 1, gh = sh >> 1, out = new Float32Array(gw * gh);
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
      const i = (2 * y) * sw + 2 * x;
      out[y * gw + x] = (s[i] + s[i + 1] + s[i + sw] + s[i + sw + 1]) * 0.25 * k;
    }
    return out;
  }

  label(m, w, h) {
    const lab = new Int32Array(w * h).fill(-1), sizes = [], q = new Int32Array(w * h);
    for (let s = 0; s < m.length; s++) {
      if (!m[s] || lab[s] >= 0) continue;
      const id = sizes.length; let qh = 0, qt = 0, cnt = 0;
      q[qt++] = s; lab[s] = id;
      while (qh < qt) {
        const i = q[qh++]; cnt++; const x = i % w;
        if (x > 0 && m[i - 1] && lab[i - 1] < 0) { lab[i - 1] = id; q[qt++] = i - 1; }
        if (x < w - 1 && m[i + 1] && lab[i + 1] < 0) { lab[i + 1] = id; q[qt++] = i + 1; }
        if (i >= w && m[i - w] && lab[i - w] < 0) { lab[i - w] = id; q[qt++] = i - w; }
        if (i + w < m.length && m[i + w] && lab[i + w] < 0) { lab[i + w] = id; q[qt++] = i + w; }
      }
      sizes.push(cnt);
    }
    return { lab: lab, sizes: sizes };
  }

  geo(inside, src, w, h) {
    const n = w * h, D = new Float32Array(n).fill(1e9), S2 = Math.SQRT2;
    for (const i of src) D[i] = 0;
    for (let it = 0; it < 3; it++) {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x, c = inside(i) ? 1 : 5; let v = D[i], a;
        if (x > 0 && (a = D[i - 1] + c) < v) v = a;
        if (y > 0) {
          if ((a = D[i - w] + c) < v) v = a;
          if (x > 0 && (a = D[i - w - 1] + c * S2) < v) v = a;
          if (x < w - 1 && (a = D[i - w + 1] + c * S2) < v) v = a;
        }
        D[i] = v;
      }
      for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
        const i = y * w + x, c = inside(i) ? 1 : 5; let v = D[i], a;
        if (x < w - 1 && (a = D[i + 1] + c) < v) v = a;
        if (y < h - 1) {
          if ((a = D[i + w] + c) < v) v = a;
          if (x < w - 1 && (a = D[i + w + 1] + c * S2) < v) v = a;
          if (x > 0 && (a = D[i + w - 1] + c * S2) < v) v = a;
        }
        D[i] = v;
      }
    }
    let mx = 1e-6;
    for (let i = 0; i < n; i++) if (inside(i) && D[i] < 1e8 && D[i] > mx) mx = D[i];
    for (let i = 0; i < n; i++) D[i] /= mx;
    return D;
  }

  buildIntro() {
    const W = this.W, H = this.H;
    const fs = Math.max(180, Math.min(380, Math.min(W, H) * 0.42));
    const pr = Math.min(1.5, this.dpr), ss = 2;
    const cx = W / 2, base = H / 2 + 0.256 * fs;
    const x0 = cx - 0.42 * fs, y0 = base - 0.82 * fs, x1 = cx + 0.42 * fs, y1 = base + 0.1 * fs;
    const gw = Math.ceil((x1 - x0) * pr), gh = Math.ceil((y1 - y0) * pr);
    const sw = gw * ss, sh = gh * ss, n = gw * gh;
    const font = fs.toFixed(2) + 'px "Stam Ashkenaz", serif';
    const paint = (c, ch, scale) => {
      const g = c.getContext('2d');
      g.setTransform(scale, 0, 0, scale, -x0 * scale, -y0 * scale);
      g.font = font; g.direction = 'ltr'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.fillStyle = '#111111'; g.fillText(ch, cx, base);
      return g;
    };
    const maskOf = (ch) => {
      const c = document.createElement('canvas'); c.width = sw; c.height = sh;
      const a = paint(c, ch, pr * ss).getImageData(0, 0, sw, sh).data;
      const m = new Uint8Array(sw * sh);
      for (let i = 0; i < m.length; i++) m[i] = a[i * 4 + 3] > 127 ? 1 : 0;
      return m;
    };
    const mY = maskOf('י'), mH = maskOf('ה');
    // the heh's detached left leg is its own component: it will arrive as a falling drop
    const lb = this.label(mH, sw, sh);
    let main = -1, leg = -1;
    for (let c = 0; c < lb.sizes.length; c++) if (main < 0 || lb.sizes[c] > lb.sizes[main]) main = c;
    for (let c = 0; c < lb.sizes.length; c++) if (c !== main && (leg < 0 || lb.sizes[c] > lb.sizes[leg])) leg = c;
    if (leg >= 0 && lb.sizes[leg] < lb.sizes[main] * 0.06) leg = -1;
    const mM = new Uint8Array(sw * sh), mL = new Uint8Array(sw * sh);
    for (let i = 0; i < mH.length; i++) if (mH[i]) { if (lb.lab[i] === leg) mL[i] = 1; else mM[i] = 1; }
    const k = 1 / (ss * pr);
    const dY = this.down(this.sdf(mY, sw, sh), sw, sh, k);
    const dM = this.down(this.sdf(mM, sw, sh), sw, sh, k);
    const dL = leg >= 0 ? this.down(this.sdf(mL, sw, sh), sw, sh, k) : null;

    // the point sits on the yod's head
    let ymin = 1e9, ymax = -1;
    for (let i = 0; i < n; i++) if (dY[i] < 0) { const y = (i / gw) | 0; if (y < ymin) ymin = y; if (y > ymax) ymax = y; }
    const lim = ymin + (ymax - ymin) * 0.4;
    let sx = 0, sy = 0, cnt = 0;
    for (let i = 0; i < n; i++) if (dY[i] < 0) { const y = (i / gw) | 0; if (y <= lim) { sx += i % gw; sy += y; cnt++; } }
    const hpx = cnt ? sx / cnt : gw / 2, hpy = cnt ? sy / cnt : gh * 0.3;
    const R = Math.min(34, 0.09 * fs);
    const src = [], rr = R * 0.35 * pr;
    for (let y = Math.max(0, Math.floor(hpy - rr)); y <= Math.min(gh - 1, Math.ceil(hpy + rr)); y++)
      for (let x = Math.max(0, Math.floor(hpx - rr)); x <= Math.min(gw - 1, Math.ceil(hpx + rr)); x++)
        if ((x - hpx) * (x - hpx) + (y - hpy) * (y - hpy) <= rr * rr) src.push(y * gw + x);
    const tY = this.geo((i) => dY[i] < 0, src, gw, gh);
    const srcY = [];
    for (let i = 0; i < n; i++) if (dY[i] < 0) srcY.push(i);
    const tH = this.geo((i) => dM[i] < 0, srcY, gw, gh);

    const I = { fs: fs, pr: pr, x0: x0, y0: y0, gw: gw, gh: gh, cx: cx, base: base, R: R, dY: dY, dM: dM, dL: dL, tY: tY, tH: tH,
      hx: x0 + (hpx + 0.5) / pr, hy: y0 + (hpy + 0.5) / pr, tE0: 3.9, dE: 1.45, tB: Infinity };
    if (dL) {
      let top = 1e9;
      for (let i = 0; i < n; i++) if (dL[i] < 0) { const y = (i / gw) | 0; if (y < top) top = y; }
      let rx = 0, rc = 0;
      for (let x = 0; x < gw; x++) if (dL[top * gw + x] < 0) { rx += x; rc++; }
      const lx = Math.round(rc ? rx / rc : gw / 2);
      let wc = 0;
      const row = Math.min(gh - 1, top + Math.round(0.03 * fs * pr));
      for (let x = 0; x < gw; x++) if (dL[row * gw + x] < 0) wc++;
      let by = top - 1;
      while (by > 0 && !(dM[by * gw + lx] < 0)) by--;
      const tauB = tH[Math.max(0, by) * gw + lx];
      const srcL = [];
      for (let i = 0; i < n; i++) if (dL[i] < 0 && ((i / gw) | 0) <= top + 2) srcL.push(i);
      I.tL = this.geo((i) => dL[i] < 0, srcL, gw, gh);
      I.legX = x0 + (lx + 0.5) / pr;
      I.legTop = y0 + (top + 0.5) / pr;
      I.barY = y0 + (by + 0.5) / pr;
      I.rd = Math.max(4, (wc / pr) * 0.62);
      I.tB = I.tE0 + Math.pow(Math.min(1, Math.max(0, (tauB + 0.12) / 1.3)), 1 / 1.3) * I.dE;
    }
    this.TE = Math.max(I.tE0 + I.dE + 0.15, dL ? I.tB + 1.35 : 0);
    const fc = document.createElement('canvas'); fc.width = gw; fc.height = gh;
    I.fieldCv = fc; I.fieldCtx = fc.getContext('2d');
    I.img = I.fieldCtx.createImageData(gw, gh);
    for (let i = 0; i < I.img.data.length; i += 4) { I.img.data[i] = 17; I.img.data[i + 1] = 17; I.img.data[i + 2] = 17; }
    const gc = document.createElement('canvas'); gc.width = gw; gc.height = gh;
    paint(gc, 'ה', pr);
    I.glyphCv = gc;
    this.I = I;
  }

  renderField(t) {
    const I = this.I, gw = I.gw, gh = I.gh, pr = I.pr, data = I.img.data, fs = I.fs, R = I.R;
    // 1. the point blooms like ink taking to paper: a ragged edge that pulls itself round, a small elastic overshoot
    const u = (t - 0.35) / 1.15;
    let dotR = 0, rim = 0;
    if (u > 0) {
      const uu = Math.min(u, 2.5);
      dotR = R * (1 - Math.exp(-4.2 * uu)) * (1 + 0.07 * Math.exp(-2.5 * uu) * Math.sin(9 * uu));
      rim = 0.22 * Math.exp(-2.6 * uu);
    }
    if (t > 1.5 && t < 2.3) dotR *= 1 + 0.014 * Math.sin((t - 1.5) * 9);
    // 2. before it runs, the ink sags under its own weight
    const sag = this.ease((t - 1.8) / 0.45);
    const inC = t >= 2.1, inE = t >= I.tE0;
    const Pc = inC ? this.flowP((t - 2.1) / 1.4, 1.25, 1.3) : -1;
    const Pe = inE ? this.flowP((t - I.tE0) / I.dE, 1.3, 1.3) : -1;
    const bC = 0.022 * fs * (1 - this.sstep(0.8, 1.13, Pc));
    const bE = 0.02 * fs * (1 - this.sstep(0.85, 1.18, Pe));
    let amp = 0;
    if (inC && !inE) amp = 0.8 * (1 - this.sstep(3.45, 3.85, t));
    if (inE) amp = 0.8 * (1 - this.sstep(this.TE - 0.45, this.TE - 0.05, t));
    // 3. at the bar's left end a drop gathers, hangs, tears off and falls into the heh's left leg
    let drop = null;
    if (I.dL && t >= I.tB) {
      const s1 = this.easeOut((t - I.tB) / 0.35);
      const hangY = I.barY + I.rd * 0.7 * s1;
      const g = this.clamp01((t - I.tB - 0.5) / 0.28);
      const tl = t - I.tB - 0.78;
      drop = {
        x: I.legX, y: this.lerp(hangY, I.legTop + I.rd * 0.7, g * g), r: I.rd * s1 * (1 + 0.12 * Math.sin(g * Math.PI)),
        k: g < 0.2 ? 0.045 * fs : 0.01 * fs,
        Pl: tl > 0 ? this.flowP(tl / 0.47, 1.25, 1.1) : -1
      };
      drop.bl = 0.02 * fs * (1 - this.sstep(0.85, 1.15, drop.Pl));
    }
    const sagY = I.hy + R * 0.62 * sag, sagR = R * 0.42 * sag;
    let i = 0;
    for (let py = 0; py < gh; py++) {
      const y = I.y0 + (py + 0.5) / pr;
      for (let px = 0; px < gw; px++, i++) {
        const x = I.x0 + (px + 0.5) / pr;
        let dd;
        if (!inE) {
          const dx = x - I.hx, dy = y - I.hy, r = Math.sqrt(dx * dx + dy * dy);
          let dDot = r - dotR;
          if (rim > 0.002 && r < dotR * 1.6 + 4) {
            const a = Math.atan2(dy, dx);
            dDot -= dotR * rim * (0.5 * Math.sin(5 * a + 1.3 + t) + 0.3 * Math.sin(9 * a - 2 * t) + 0.2 * Math.sin(14 * a + 3 * t));
          }
          if (sag > 0) { const ds = Math.sqrt(dx * dx + (y - sagY) * (y - sagY)) - sagR; dDot = this.smin(dDot, ds, R * 0.55); }
          if (inC) {
            const dl = Pc - I.tY[i];
            const w = dl <= -0.1 ? 0 : dl >= 0.1 ? 1 : this.sstep(-0.1, 0.1, dl);
            const q = (dl - 0.05) / 0.07;
            dd = dDot + (I.dY[i] - dDot) * w - bC * Math.exp(-q * q);
          } else dd = dDot;
        } else {
          const dl = Pe - I.tH[i];
          const w = dl <= -0.08 ? 0 : dl >= 0.08 ? 1 : this.sstep(-0.08, 0.08, dl);
          const q = (dl - 0.05) / 0.07;
          dd = I.dY[i] + (I.dM[i] - I.dY[i]) * w - bE * Math.exp(-q * q);
          if (drop) {
            const dr = Math.sqrt((x - drop.x) * (x - drop.x) + (y - drop.y) * (y - drop.y)) - drop.r;
            let dlg = dr;
            if (drop.Pl > -1) {
              const l = drop.Pl - I.tL[i];
              const wl = l <= -0.1 ? 0 : l >= 0.1 ? 1 : this.sstep(-0.1, 0.1, l);
              const ql = (l - 0.05) / 0.07;
              dlg = dr + (I.dL[i] - dr) * wl - drop.bl * Math.exp(-ql * ql);
            }
            dd = this.smin(dd, dlg, drop.k);
          }
        }
        if (amp > 0) dd += amp * Math.sin(x * 0.19 + t * 1.7 + Math.sin(y * 0.13 - t)) * Math.sin(y * 0.17 - t * 1.3 + Math.sin(x * 0.11));
        const al = 0.5 - dd * pr;
        data[i * 4 + 3] = al <= 0 ? 0 : al >= 1 ? 255 : (al * 255) | 0;
      }
    }
    I.fieldCtx.putImageData(I.img, 0, 0);
  }

  logoTarget() {
    if (this.logo && this.root) {
      const a = this.logo.getBoundingClientRect(), b = this.root.getBoundingClientRect();
      if (a.width > 0) return { x: a.left - b.left + a.width / 2, y: a.top - b.top + 0.584 * 40 };
    }
    return { x: this.W - 48, y: 36 };
  }

  frame(now) {
    if (!this.alive) return;
    this.raf = requestAnimationFrame(this.loop);
    if (this.t0 == null) this.t0 = now;
    this.dt = this.prevNow == null ? 0.016 : Math.min(0.05, (now - this.prevNow) / 1000);
    this.prevNow = now;
    this.time += this.dt;
    this.mergeEnv = this.skipped ? Math.min(1, (this.mergeEnv || 0) + this.dt / 10) : 0;
    const t = this.skipped ? 99 : (now - this.t0) / 1000;
    if (!this.skipped && this.TE) {
      if (t > this.TE + 1.35 && !this.state.nameIn) this.setState({ nameIn: true });
      if (t > this.TE + 1.5 && !this.state.logoIn) this.setState({ logoIn: true });
      if (t > this.TE + 2.8) this.skipIntro();
    }
    if (this.root.scrollLeft || this.root.scrollTop) { this.root.scrollLeft = 0; this.root.scrollTop = 0; }  // never let anchor jumps scroll the stage
    if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
    const k = this.reduce ? 1 : (this.drag && this.drag.moved ? 0.4 : 0.075);
    this.cur += (this.target - this.cur) * k;
    if (Math.abs(this.target - this.cur) < 0.25) this.cur = this.target;
    if (this.track && this.lastTx !== this.cur) {
      this.track.style.transform = 'translate3d(' + (-this.cur).toFixed(2) + 'px,0,0)';
      if (this.nameBox) this.nameBox.style.transform = 'translate3d(' + (-this.cur * 0.55).toFixed(2) + 'px,0,0)';
      this.lastTx = this.cur;
    }
    this.draw(t);
  }

  draw(t) {
    const cv = this.cv; if (!cv || !this.ready) return;
    const ctx = cv.getContext('2d');
    const W = this.W, H = this.H, dpr = this.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const intro = !this.skipped;
    const cx = W / 2 - this.cur * 0.55, cy = H / 2;
    const rr = intro ? (this.TE ? this.easeOut((t - this.TE - 0.25) / 2.4) * Math.hypot(W, H) * 0.62 : 0) : 1e9;
    const sp = Math.max(10, Math.min(60, (this.props.ringGap | 0) || 20)) * (this.narrow ? 0.85 : 1);
    if (rr > 0) this.updateHeat(cx, cy, sp);
    for (let i = 0; i < this.N; i++) {
      const xs = i * W - this.cur, a = Math.max(0, xs), b = Math.min(W, xs + W);
      if (b <= a) continue;
      const dark = i % 2 === 1;
      ctx.fillStyle = dark ? '#111111' : '#ffffff';
      ctx.fillRect(a, 0, b - a, H);
      if (rr > 0) this.drawRings(ctx, a, b, 80, H - 78, dark, cx, cy, rr, sp);
    }
    if (intro) this.drawIntro(ctx, t);
  }

  // Rings pair up (0+1, 2+3, …). Each pair slowly drifts together, its letters dissolve into yods and vavs,
  // and the merged ring re-forms with letters whose gematria is the sum of the two that met
  // (a sum with no single letter falls to its mispar katan). Then the pair drifts apart and the letters return.
  ringAt(n, sp) {
    const base = this.r0 + n * sp;
    const mc = Math.max(12, Math.floor(2 * Math.PI * base / this.ls));
    if (this.reduce) return { r: base, rot: 0, mc: mc, m: 0, base: base, primary: (n & 1) === 0 };
    const time = this.time, p = n >> 1, primary = (n & 1) === 0, q = n ^ 1;
    const s = Math.sin(time * (2 * Math.PI / 44) - p * 0.4);
    const m = (this.mergeEnv || 0) * this.sstep(-0.25, 0.9, s);
    const em = this.ease(m);
    const sway = (k) => (k % 2 ? 1 : -1) * 0.045 * Math.sin(time * 0.23 + k * 0.37);
    const rot = this.lerp(sway(n), (sway(n) + sway(q)) / 2, em);
    return { r: base + (primary ? 1 : -1) * sp * 0.5 * em, rot: rot, mc: mc, m: m, base: base, primary: primary };
  }

  // Which stroke of letter a becomes which stroke of letter b: [from index, to index, flip endpoints].
  strokeMap(a, b) {
    const key = a * 32 + b;
    let mp = this.mapCache.get(key);
    if (mp) return mp;
    const A = this.STROKES[a], Bs = this.STROKES[b];
    const mid = (q) => [(q[0] + q[2]) / 2, (q[1] + q[3]) / 2];
    const d2 = (p, q) => (p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]);
    const near = (src, dst, used) => {
      let best = -1, bd = 1e9;
      for (let i = 0; i < src.length; i++) { if (used && used[i]) continue; const dd = d2(mid(src[i]), mid(dst)); if (dd < bd) { bd = dd; best = i; } }
      return best;
    };
    const flip = (x, y) => {
      const keep = d2([x[0], x[1]], [y[0], y[1]]) + d2([x[2], x[3]], [y[2], y[3]]);
      const swap = d2([x[0], x[1]], [y[2], y[3]]) + d2([x[2], x[3]], [y[0], y[1]]);
      return swap < keep ? 1 : 0;
    };
    mp = [];
    const used = new Array(A.length).fill(false);
    for (let j = 0; j < Bs.length; j++) {
      let i = near(A, Bs[j], used);
      if (i < 0) i = near(A, Bs[j], null); else used[i] = true;
      mp.push([i, j, flip(A[i], Bs[j])]);
    }
    for (let i = 0; i < A.length; i++) if (!used[i]) { const j = near(Bs, A[i], null); mp.push([i, j, flip(A[i], Bs[j])]); }
    this.mapCache.set(key, mp);
    return mp;
  }

  mergeLetters(a, b) {
    const V = this.VAL, s = V[a] + V[b];
    const i = V.indexOf(s);
    if (i >= 0) return i;
    let d = s;
    while (d > 9) { let t = 0; while (d > 0) { t += d % 10; d = (d / 10) | 0; } d = t; }
    return d - 1;
  }

  baseLetter(n, kk) {
    const o = this.over.get(n * 8192 + kk);
    return o === undefined ? (kk + n * 7) % 27 : o;
  }

  // Physics + gematria: heat pulls a letter apart into its yods and vavs; enough heat shrinks them to points,
  // and the points re-form as the next letter of the same gematria family (×10): א→י→ק→א, ב→כ→ר→ב, … ט→צ→ץ→ט.
  heatGlyph(key, n, kk, add) {
    let e = this.heatMap.get(key);
    if (!e) { const L = this.baseLetter(n, kk); e = { h: 0, L: L, from: L, mt: 1, swapped: false }; this.heatMap.set(key, e); }
    e.h = Math.min(1, e.h + add);
  }

  updateHeat(cx, cy, sp) {
    const map = this.heatMap, dt = this.dt;
    map.forEach((e, key) => {
      e.h *= Math.pow(0.955, dt * 60);
      if (e.mt < 1) e.mt = Math.min(1, e.mt + dt / 0.7);
      if (!e.swapped && e.h > 0.82) {
        e.from = e.L; e.L = (e.L + 9) % 27; e.mt = 0; e.swapped = true;
        this.over.set(key, e.L);
      }
      if (e.swapped && e.h < 0.4 && e.mt >= 1) e.swapped = false;
      if (e.h < 0.015 && e.mt >= 1) map.delete(key);
    });
    const m = this.mouse;
    if (m.x < -1e3) return;
    const mv = m.px > -1e3 ? Math.hypot(m.x - m.px, m.y - m.py) : 0;
    m.px = m.x; m.py = m.y;
    if (mv < 0.5 || m.y < 80 || m.y > this.H - 78) return;
    const R = Math.max(30, Math.min(240, this.props.hoverRadius || 90));
    const amt = 0.08 + Math.min(1, mv / 45) * 0.5;
    const r0 = this.r0, ls = this.ls, time = this.time;
    const dx = m.x - cx, dy = m.y - cy, rm = Math.hypot(dx, dy), am = Math.atan2(dy, dx);
    const nA = Math.max(0, Math.floor((rm - R - r0) / sp) - 1), nB = Math.ceil((rm + R - r0) / sp) + 1;
    for (let n = nA; n <= nB; n++) {
      const RS = this.ringAt(n, sp), r = RS.r;
      if (!RS.primary && RS.m >= 0.995) continue;
      const mc = RS.mc, step = 2 * Math.PI / mc, rot = RS.rot;
      const del = Math.min(Math.PI, (R / r) * 1.1);
      const k0 = Math.floor((rot - (am + del)) / step), k1 = Math.ceil((rot - (am - del)) / step);
      for (let k = k0; k <= k1; k++) {
        const ang = rot - k * step;
        const x = cx + r * Math.cos(ang), y = cy + r * Math.sin(ang);
        const d = Math.hypot(x - m.x, y - m.y);
        if (d >= R) continue;
        const f = 1 - d / R;
        const kk = ((k % mc) + mc) % mc;
        this.heatGlyph(n * 8192 + kk, n, kk, f * f * amt);
      }
    }
  }

  drawRings(ctx, x0, x1, y0, y1, dark, cx, cy, rr, sp) {
    const S = this.S, ls = this.ls, r0 = this.r0;
    const time = this.time, reduce = this.reduce, heat = this.heatMap;
    const STR = this.STROKES, YOD = this.YOD, B = this.buckets;
    for (let i = 0; i < B.length; i++) B[i].length = 0;
    ctx.save();
    ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    const dpr = this.dpr, atl = dark ? this.atlasD : this.atlasL;
    const aw = this.acw, ah = this.ach, asw = aw * dpr, ash = ah * dpr, aoy = this.aoy;
    let curA = 1;
    const m = 14, nx0 = x0 - m, nx1 = x1 + m, ny0 = y0 - m, ny1 = y1 + m;
    const qx = Math.max(nx0, Math.min(cx, nx1)), qy = Math.max(ny0, Math.min(cy, ny1));
    const dmin = Math.hypot(cx - qx, cy - qy);
    const corners = [[nx0, ny0], [nx1, ny0], [nx0, ny1], [nx1, ny1]];
    let dmax = 0;
    for (const c of corners) dmax = Math.max(dmax, Math.hypot(c[0] - cx, c[1] - cy));
    const inside = dmin === 0;
    let ac = 0, amin = -Math.PI, amax = Math.PI;
    if (!inside) {
      ac = Math.atan2((ny0 + ny1) / 2 - cy, (nx0 + nx1) / 2 - cx);
      amin = 1e9; amax = -1e9;
      for (const c of corners) {
        let d = Math.atan2(c[1] - cy, c[0] - cx) - ac;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        if (d < amin) amin = d; if (d > amax) amax = d;
      }
    }
    const tmp = [0, 0, 0, 0];
    const nA = Math.max(0, Math.floor((dmin - r0) / sp)), nB = Math.floor((Math.min(dmax, rr + 20) - r0) / sp) + 1;
    for (let n = nA; n <= nB; n++) {
      const RS = this.ringAt(n, sp), r = RS.r;
      if (r < dmin - 6 || r > dmax + 6) continue;
      const mrg = RS.m, prim = RS.primary;
      if (!prim && mrg >= 0.995) continue;   // now lying exactly on its partner: the same letters, the same ink
      const mergedNow = prim && mrg >= 0.97;
      const mdis = this.sstep(0.5, 0.85, mrg) * (1 - this.sstep(0.97, 1.0, mrg));
      const mu = this.sstep(0.85, 0.97, mrg);                    // the points re-forming into the merged letters
      const travel = prim ? 0 : this.sstep(0.65, 0.95, mrg);     // the partner ring's points flow onto this ring's letters
      const RQ = mrg > 0.5 ? this.ringAt(prim ? n + 1 : n - 1, sp) : null;
      const asm = this.clamp01((rr - r) / 140);
      if (asm <= 0) break;
      const front = Math.max(0, 1 - (rr - r) / 180);
      const mc = RS.mc, step = 2 * Math.PI / mc, rot = RS.rot;
      const base = 8 - Math.min(5, Math.floor((RS.base - r0) / 110)) + (mergedNow ? 1 : 0);
      const wave = reduce ? 0 : Math.round(Math.sin((r - time * 45) / 70) * 0.9);
      let k0, k1;
      if (inside) { k0 = 0; k1 = mc - 1; }
      else { const mg = 16 / r; k0 = Math.ceil((rot - (ac + amax + mg)) / step); k1 = Math.floor((rot - (ac + amin - mg)) / step); }
      for (let k = k0; k <= k1; k++) {
        let ang = rot - k * step;
        const kk = ((k % mc) + mc) % mc, key = n * 8192 + kk;
        let mFrom = -1, mTo = -1;
        if (RQ) {
          const sq = 2 * Math.PI / RQ.mc;
          if (prim) {
            const k2 = Math.round((RQ.rot - ang) / sq), kq = ((k2 % RQ.mc) + RQ.mc) % RQ.mc;
            mFrom = this.baseLetter(n, kk);
            mTo = this.mergeLetters(mFrom, this.baseLetter(n + 1, kq));
          } else {
            const kd = Math.round((RQ.rot - ang) / sq), angD = RQ.rot - kd * sq;
            const kdd = ((kd % RQ.mc) + RQ.mc) % RQ.mc;
            const k2 = Math.round((rot - angD) / step), kq = ((k2 % mc) + mc) % mc;
            mFrom = this.baseLetter(n, kk);
            mTo = this.mergeLetters(this.baseLetter(n - 1, kdd), this.baseLetter(n, kq));
            ang += (angD - ang) * travel;
          }
        }
        const ca = Math.cos(ang), sa = Math.sin(ang);
        const gx = cx + r * ca, gy = cy + r * sa;
        if (gx < nx0 || gx > nx1 || gy < ny0 || gy > ny1) continue;
        let lv = base + wave + Math.round(front * 3);
        if ((this.hash(n, kk) & 7) === 0) lv -= 2;
        const e = heat.get(key);
        let L, from, mt = 1, h = 0;
        if (e) { L = e.L; from = e.from; mt = e.mt; h = e.h; const hl = 2 + Math.round(h * 7); if (hl > lv) lv = hl; }
        else if (RQ) {
          from = mFrom;
          if (mu <= 0) L = mFrom; else { L = mTo; mt = mu; }
        } else {
          L = from = this.baseLetter(n, kk);
          if (!reduce && asm >= 1 && Math.random() < 0.000004) this.heatGlyph(key, n, kk, 0.95);
        }
        if (lv > 9) lv = 9;
        if (lv <= 0) continue;
        // At rest a letter is the STaM glyph; disturbed, it crossfades into its yods and vavs.
        const dis = Math.max(h, 1 - asm, (e && mt < 1) ? 1 : 0, mdis);
        const gA = atl ? 1 - this.sstep(0.03, 0.25, dis) : 0;
        const sA = atl ? this.sstep(0.0, 0.2, dis) : 1;
        if (gA > 0.01) {
          if (gA !== curA) { ctx.globalAlpha = gA; curA = gA; }
          ctx.setTransform(-sa * dpr, ca * dpr, -ca * dpr, -sa * dpr, gx * dpr, gy * dpr);
          ctx.drawImage(atl, L * asw, lv * ash, asw, ash, -aw / 2, -aoy, aw, ah);
        }
        if (sA <= 0.01) continue;
        const abin = Math.min(3, Math.floor(sA * 4));
        // decomposition: spread apart, twist, then shrink each yod/vav to a point
        const spread = h * 0.55 + (1 - asm) * 0.35 + mdis * 0.3;
        const shrink = (1 - this.sstep(0.45, 0.85, h)) * asm * (1 - this.sstep(0.4, 0.9, mdis));
        const em = this.ease(mt);
        // ink is conserved: every point of the old letter travels into a stroke of the new one,
        // surplus points fuse into the nearest stroke, and missing strokes split off the nearest point
        const pairs = mt < 1 ? this.strokeMap(from, L) : null;
        const A = STR[from], Bs = STR[L];
        const cnt = pairs ? pairs.length : Bs.length;
        // local → world: x = gx + (-sa*u - ca*v)*S ; y = gy + (ca*u - sa*v)*S
        for (let j = 0; j < cnt; j++) {
          let isYod;
          if (pairs) {
            const pp = pairs[j], a = A[pp[0]], b = Bs[pp[1]];
            if (pp[2]) {
              tmp[0] = a[0] + (b[2] - a[0]) * em; tmp[1] = a[1] + (b[3] - a[1]) * em;
              tmp[2] = a[2] + (b[0] - a[2]) * em; tmp[3] = a[3] + (b[1] - a[3]) * em;
            } else {
              for (let c = 0; c < 4; c++) tmp[c] = a[c] + (b[c] - a[c]) * em;
            }
            isYod = em < 0.5 ? YOD[from][pp[0]] : YOD[L][pp[1]];
          } else {
            const b = Bs[j]; tmp[0] = b[0]; tmp[1] = b[1]; tmp[2] = b[2]; tmp[3] = b[3];
            isYod = YOD[L][j];
          }
          let mx = (tmp[0] + tmp[2]) / 2, my = (tmp[1] + tmp[3]) / 2;
          let hx = (tmp[2] - tmp[0]) / 2 * shrink, hy = (tmp[3] - tmp[1]) / 2 * shrink;
          if (spread > 0.001) {
            const ml = Math.hypot(mx, my);
            const ux = ml > 0.05 ? mx / ml : (j % 2 ? 0.7 : -0.7), uy = ml > 0.05 ? my / ml : -0.7;
            mx += ux * spread; my += uy * spread;
            const tw = (j % 2 ? 1 : -1) * spread * 1.2, ct = Math.cos(tw), st = Math.sin(tw);
            const nhx = hx * ct - hy * st; hy = hx * st + hy * ct; hx = nhx;
          }
          const ax = mx - hx, ay = my - hy, bx = mx + hx, by = my + hy;
          const bucket = B[(lv * 2 + (isYod ? 1 : 0)) * 4 + abin];
          bucket.push(
            gx + (-sa * ax - ca * ay) * S, gy + (ca * ax - sa * ay) * S,
            gx + (-sa * bx - ca * by) * S, gy + (ca * bx - sa * by) * S
          );
        }
      }
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const pal = dark ? this.GRAY_D : this.GRAY_L;
    for (let lv = 1; lv <= 9; lv++) {
      for (let ty = 0; ty < 2; ty++) {
        for (let ab = 0; ab < 4; ab++) {
          const arr = B[(lv * 2 + ty) * 4 + ab];
          if (!arr.length) continue;
          ctx.globalAlpha = (ab + 1) / 4;
          ctx.strokeStyle = pal[lv];
          ctx.lineWidth = S * (ty ? 0.19 : 0.11);
          ctx.beginPath();
          for (let i = 0; i < arr.length; i += 4) {
            ctx.moveTo(arr[i], arr[i + 1]);
            const ex = arr[i + 2], ey = arr[i + 3];
            ctx.lineTo(Math.abs(ex - arr[i]) + Math.abs(ey - arr[i + 1]) < 0.05 ? ex + 0.05 : ex, ey);
          }
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  drawIntro(ctx, t) {
    if (!this.I) { this.buildIntro(); if (!this.I) return; }
    const I = this.I, TE = this.TE, w = I.gw / I.pr, h = I.gh / I.pr;
    if (t < TE) {
      this.renderField(t);
      ctx.drawImage(I.fieldCv, I.x0, I.y0, w, h);
      return;
    }
    // settle onto the exact STaM heh, then carry it up to become the logo
    const cf = this.clamp01((t - TE) / 0.18);
    const p = this.ease((t - TE - 0.35) / 1.4);
    const tg = this.logoTarget();
    const bodyY = I.base - 0.256 * I.fs;
    const s = this.lerp(1, 40 / I.fs, p);
    const alpha = t > TE + 1.55 ? Math.max(0, 1 - (t - TE - 1.55) / 0.35) : 1;
    if (alpha <= 0) return;
    ctx.save();
    ctx.translate(this.lerp(I.cx, tg.x, p), this.lerp(bodyY, tg.y, p));
    ctx.scale(s, s);
    const ox = I.x0 - I.cx, oy = I.y0 - bodyY;
    if (cf < 1) { ctx.globalAlpha = alpha * (1 - cf); ctx.drawImage(I.fieldCv, ox, oy, w, h); }
    ctx.globalAlpha = alpha * cf;
    ctx.drawImage(I.glyphCv, ox, oy, w, h);
    ctx.restore();
  }

}

document.addEventListener('DOMContentLoaded', () => {
  const site = new Site();
  window.__site = site;
  site.render();
  site.mount();
});
