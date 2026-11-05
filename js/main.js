/* =========================================================
   The Typesetter — interacciones
   - Escritorio (>= 1024px): lienzo de 1244px escalado, línea
     de colores ("worm") que se dibuja con el scroll, barras del
     menú que se unen, revelado de Methodology.
   - Tablet / mobile: acordeón en Expertise, tap en íconos,
     revelado de Methodology con IntersectionObserver.
   ========================================================= */
(() => {
  'use strict';

  const COL = { g: '#ABD125', m: '#E51A54', t: '#008A98', o: '#FFAB00' };
  const OTMG = ['o', 't', 'm', 'g'];
  const PAGE_W = 1244;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const stage = $('#stage');
  const page = $('#page');
  const nav = $('#nav');
  const worm = $('#worm');
  const meth = $('#methodology');
  const exGrid = $('#exGrid');
  const exCards = $$('.ex-card', exGrid);
  const steps = $$('.step', meth);
  const stepTexts = steps.map(s => $('.step-text', s));
  const navBars = $$('.nav-bar', nav);
  const features = $$('.feature');

  const desktopMQ = window.matchMedia('(min-width: 1024px)');

  /* ---------------------------------------------------------
     Geometría de la línea (copiada del diseño)
     --------------------------------------------------------- */
  function sample(pts) {
    const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      for (let k = 1; k <= 16; k++) {
        const t = k / 16, u = 1 - t;
        out.push([
          u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0],
          u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1],
        ]);
      }
    }
    return smooth(resample(out, 6), 9, 3);
  }

  function resample(s, step) {
    const out = [s[0]];
    let acc = 0;
    for (let i = 1; i < s.length; i++) {
      let a = s[i - 1];
      const b = s[i];
      let d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      while (acc + d >= step) {
        const t = (step - acc) / d;
        a = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        out.push(a);
        d = Math.hypot(b[0] - a[0], b[1] - a[1]);
        acc = 0;
      }
      acc += d;
    }
    out.push(s[s.length - 1]);
    return out;
  }

  function smooth(p, r, passes) {
    for (let n = 0; n < passes; n++) {
      p = p.map((pt, i) => {
        const k = Math.min(r, i, p.length - 1 - i);
        let x = 0, y = 0;
        for (let j = i - k; j <= i + k; j++) { x += p[j][0]; y += p[j][1]; }
        return [x / (2 * k + 1), y / (2 * k + 1)];
      });
    }
    return p;
  }

  function buildGeo(o) {
    const A = o[1] + 90, B = A + 247, C = B + 1206;
    const oy = o[1];
    const dx = o[0] - 796, X = (x, w) => x + dx * w;
    const strokes = [
      { order: OTMG, F: 200, S: 180, straight: 96 / state.s, pts: [o, [X(796, 1), oy + 60], [X(812, 1), oy + 130], [X(838, 1), oy + 190], [X(848, .8), oy + 240], [X(830, .6), oy + 288], [X(785, .4), oy + 322], [700, oy + 338], [590, oy + 322], [410, oy + 282], [235, oy + 252], [150, oy + 266], [92, oy + 296], [60, oy + 340], [56, oy + 388], [80, oy + 432], [130, oy + 466], [205, oy + 486], [290, oy + 494], [350, oy + 500], [390, oy + 508]] },
      { order: OTMG, F: 40, S: 165, pts: [[925, B + 172], [985, B + 172], [1022, B + 176], [1100, B + 215], [1150, B + 285], [1168, B + 345], [1150, B + 420], [1100, B + 478], [1040, B + 506], [985, B + 512], [925, B + 505]] },
      { order: OTMG, F: 160, S: 180, end: 'g', endLen: 120, pts: [[340, B + 420], [270, B + 428], [222, B + 462], [204, B + 525], [222, B + 595], [285, B + 655], [400, B + 698], [590, B + 724], [770, B + 734], [860, B + 744], [940, B + 774], [1000, B + 834], [1030, B + 914], [1020, B + 984], [985, B + 1034], [930, B + 1066], [850, B + 1083], [745, B + 1090], [620, B + 1100], [494, B + 1113], [380, B + 1140], [265, B + 1171], [215, B + 1195], [170, B + 1245], [142, B + 1311], [150, B + 1356], [200, B + 1398], [250, B + 1422], [315, B + 1436]] },
      { order: ['g', 't'], F: 350, S: 9999, pts: [[315, C + 230], [450, C + 232], [585, C + 228], [650, C + 252], [700, C + 298], [725, C + 340], [711, C + 400]] },
      { order: ['t', 'm'], F: 200, S: 9999, pts: [[711, C + 400], [700, C + 468], [640, C + 500], [540, C + 522], [450, C + 532], [395, C + 550], [369, C + 575]] },
      { order: ['m', 'o'], F: 360, S: 9999, pts: [[369, C + 575], [300, C + 610], [245, C + 680], [232, C + 735], [262, C + 808], [330, C + 855], [395, C + 878], [470, C + 872], [571, C + 855]] },
      { order: ['o'], F: 9999, S: 9999, pts: [[571, C + 855], [700, C + 855], [790, C + 855], [835, C + 862], [880, C + 895], [935, C + 985], [960, C + 1080], [962, C + 1200]] },
    ];
    return buildChunks(strokes, { o, bottom: C + 1200, sw: 32 });
  }

  /* ---------------------------------------------------------
     Recorrido de la línea en tablet / mobile: se calcula a
     partir de la posición real de los elementos en pantalla
     --------------------------------------------------------- */
  function buildFluidGeo() {
    const pr = page.getBoundingClientRect();
    const R = el => {
      const r = el.getBoundingClientRect();
      const l = r.left - pr.left, t = r.top - pr.top;
      return { l, t, r: l + r.width, b: t + r.height, cx: l + r.width / 2, cy: t + r.height / 2, h: r.height };
    };
    const W = pr.width;
    const mobile = W < 768;
    // mismo grosor que los círculos del menú, para que la línea
    // salga de "Contact Us" sin cambiar de ancho
    const bar = navBars[3].getBoundingClientRect();
    const sw = bar.width || 32;
    const gl = mobile ? 16 : 20;           // centro de la línea en el margen izquierdo
    const gr = W - gl;                     // ídem margen derecho

    const li = R(nav.querySelectorAll('li')[3]);
    const o = [bar.left - pr.left + sw / 2, li.cy];
    const hero = R($('.hero-inner'));
    const exTitle = R($('.expertise-title'));
    const grid = R(exGrid);
    const feats = features.map(R);
    // se mide el texto (no el bloque) para saber de qué lado está
    const titleRange = document.createRange();
    titleRange.selectNodeContents($('.method-title'));
    const mTitle = R(titleRange);
    const circles = steps.map(s => R($('.step-num', s)));
    const show = R($('.showcase'));

    // 1) Del menú baja, barre hacia la derecha y corre por el margen
    //    derecho junto a las tarjetas de Expertise
    const pts = [
      o,
      [o[0], o[1] + 40],
      [o[0] + (gr - o[0]) * 0.35, hero.b - 50],
      [gr, Math.min(hero.b + 20, exTitle.t)],
      [gr, grid.t + 30],
      [gr, grid.b - 20],
    ];

    // 2) Features: zigzag entre tarjetas apiladas (mobile) o
    //    bajando por un costado si están en fila (tablet)
    const stacked = feats.length > 1 && feats[1].t > feats[0].b - 1;
    let side = 'r';
    const sx = sd => (sd === 'r' ? gr : gl);
    if (stacked) {
      const g0 = (grid.b + feats[0].t) / 2;
      pts.push([W / 2, g0], [gl, feats[0].t + 40]);
      side = 'l';
      feats.forEach((f, i) => {
        pts.push([sx(side), f.b - 30]);
        const next = feats[i + 1];
        if (next) {
          const gy = (f.b + next.t) / 2;
          side = side === 'l' ? 'r' : 'l';
          pts.push([W / 2, gy], [sx(side), next.t + 40]);
        }
      });
    } else {
      const fb = Math.max(...feats.map(f => f.b));
      pts.push([gr, fb - 20]);
    }
    const fBottom = Math.max(...feats.map(f => f.b));

    // 3) Hacia el primer círculo de Methodology, por el lado
    //    contrario al título
    const c0 = circles[0];
    const titleSide = mTitle.cx < W / 2 ? 'l' : 'r';
    const freeX = titleSide === 'l' ? gr : gl;
    if (sx(side) !== freeX) pts.push([W / 2, fBottom + (mTitle.t - fBottom) * 0.5]);
    if (titleSide === 'l') {
      // título sobre el círculo (mobile): baja por la derecha del título
      // y cruza por el espacio entre el título y el paso 01
      const crossY = (mTitle.b + c0.t) / 2;
      pts.push([freeX, mTitle.cy], [freeX - sw, crossY], [(freeX + c0.cx) / 2, crossY], [c0.cx + sw, crossY + 6], [c0.cx, c0.cy]);
    } else {
      pts.push([freeX, mTitle.cy], [(freeX + c0.cx) / 2, c0.t - c0.h * 0.35], [c0.cx, c0.cy]);
    }

    const strokes = [
      { order: OTMG, F: 150, S: 170, straight: sw * 3, end: 'g', endLen: Math.min(110, c0.h * 1.2), pts },
    ];

    // 4) Une los círculos entre sí con el color de cada paso
    const stepCols = ['g', 't', 'm', 'o'];
    for (let i = 0; i < circles.length - 1; i++) {
      const a = circles[i], b = circles[i + 1];
      strokes.push({
        order: [stepCols[i], stepCols[i + 1]], F: (b.cy - a.cy) * 0.75, S: 9999,
        pts: [[a.cx, a.cy], [a.cx, (a.cy + b.cy) / 2], [b.cx, b.cy]],
      });
    }

    // 5) Del último círculo baja y se mete detrás del bloque oscuro
    const cl = circles[circles.length - 1];
    const lastStepB = R(steps[steps.length - 1]).b;
    strokes.push({
      order: ['o'], F: 9999, S: 9999,
      pts: [[cl.cx, cl.cy], [cl.cx, lastStepB + 6], [W * 0.45, show.t - 18], [W * 0.6, show.t + 40]],
    });

    const geo = buildChunks(strokes, { o, bottom: page.offsetHeight, sw });
    geo.stepY = circles.map(c => c.t + c.h * 0.25);
    geo.width = W;
    return geo;
  }

  function buildChunks(strokes, extra) {
    const chunks = [], G = [], M = [];
    let g = 0, maxY = -1e9;
    for (const st of strokes) {
      const s = sample(st.pts);
      // tramo inicial vertical: el extremo recto de la línea queda
      // horizontal y escondido dentro del círculo de "Contact Us"
      if (st.straight) {
        const x0 = s[0][0];
        for (let i = 1, l = 0, prev = s[0]; i < s.length; i++) {
          l += Math.hypot(s[i][0] - prev[0], s[i][1] - prev[1]);
          prev = s[i];
          if (l >= st.straight) break;
          const t = l / st.straight;
          s[i] = [x0 + (s[i][0] - x0) * t * t * (3 - 2 * t), s[i][1]];
        }
      }
      const L = [0];
      for (let i = 1; i < s.length; i++) L.push(L[i - 1] + Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]));
      const total = L[L.length - 1];
      let bounds = [[0, st.order[0]]];
      for (let b = st.F, k = 1; b < total; b += st.S, k++) bounds.push([b, st.order[k % st.order.length]]);
      if (st.end) {
        bounds = bounds.filter(b => b[0] < total - st.endLen);
        bounds.push([total - st.endLen, st.end]);
      }
      const at = l => {
        let i = 1;
        while (i < L.length - 1 && L[i] < l) i++;
        const f = (l - L[i - 1]) / ((L[i] - L[i - 1]) || 1);
        return [s[i - 1][0] + (s[i][0] - s[i - 1][0]) * f, s[i - 1][1] + (s[i][1] - s[i - 1][1]) * f];
      };
      bounds.forEach((b, bi) => {
        const l0 = b[0];
        const l1 = bi < bounds.length - 1 ? Math.min(total, bounds[bi + 1][0] + 2.5) : total;
        const pts = [at(l0)];
        for (let i = 0; i < s.length; i++) if (L[i] > l0 && L[i] < l1) pts.push(s[i]);
        pts.push(at(l1));
        chunks.push({
          d: 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L'),
          color: COL[b[1]],
          len: l1 - l0,
          g0: g + l0,
        });
      });
      for (let i = 0; i < s.length; i++) {
        maxY = Math.max(maxY, s[i][1]);
        G.push(g + L[i]);
        M.push(maxY);
      }
      g += total;
    }
    return Object.assign({ chunks, G, M, total: g }, extra);
  }

  /* ---------------------------------------------------------
     Estado de escritorio
     --------------------------------------------------------- */
  const state = {
    desktop: false,
    s: 1,
    heroH: 800,
    step: 0,
    p: 0,
    L: 0,
    Lcur: 0,
    geo: null,
    geoO: null,
    paths: [],
    raf: 0,
  };

  const setVar = (name, value) => stage.style.setProperty(name, value);

  function layout() {
    if (!state.desktop) return;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const s = Math.min(1.35, Math.max(0.25, vw / PAGE_W));
    const heroH = Math.round(Math.max(480, vh) / s);
    state.s = s;
    state.heroH = heroH;
    setVar('--s', s);
    setVar('--inv', 1 / s);
    const offX = (vw - PAGE_W * s) / 2;
    setVar('--hw', vw);
    setVar('--hh', heroH * s);
    setVar('--hero-h', heroH);
    setVar('--off-x', offX);
    // margen sobrante a cada lado (en px del lienzo) para que las
    // secciones de ancho completo lleguen a los bordes de la pantalla
    setVar('--bleed', offX / s);
    worm.querySelectorAll('path').forEach(p => p.setAttribute('stroke-width', 32 / s));    requestAnimationFrame(refresh);
  }

  function measure() {
    if (!state.desktop) return;
    stage.style.height = Math.round(page.offsetHeight * state.s) + 'px';
  }

  function heroMeasure() {
    if (!state.desktop) return;
    const lis = nav.querySelectorAll('li');
    if (lis.length < 4) return;
    const s = state.s;
    const pr = page.getBoundingClientRect();
    const r0 = lis[0].getBoundingClientRect();
    const r1 = lis[1].getBoundingClientRect();
    const r3 = lis[3].getBoundingClientRect();
    const o = [(r3.left - pr.left + 16) / s, (r3.top + r3.height / 2 - pr.top) / s];

    if (!state.geoO || Math.abs(o[0] - state.geoO[0]) > .5 || Math.abs(o[1] - state.geoO[1]) > .5) {
      state.geoO = o;
      state.geo = buildGeo(o);
      setVar('--tag-mt', o[1] + 90 - state.heroH);
      renderWorm();
      measure();
    }
    state.step = r1.top - r0.top;
    updateBars();
  }

  // Tablet / mobile: recalcula el recorrido según el layout actual
  function fluidMeasure() {
    if (state.desktop) return;
    const lis = nav.querySelectorAll('li');
    state.s = 1;
    state.geo = buildFluidGeo();
    renderWorm();
    updateSteps();
    state.step = lis[1].getBoundingClientRect().top - lis[0].getBoundingClientRect().top;
    updateBars();
  }

  function refresh() {
    if (state.desktop) { heroMeasure(); measure(); }
    else fluidMeasure();
  }

  let refreshQueued = false;
  function queueRefresh() {
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(() => { refreshQueued = false; refresh(); });
  }

  function renderWorm() {
    const geo = state.geo;
    worm.textContent = '';
    worm.setAttribute('height', geo.bottom);
    worm.setAttribute('width', geo.width || PAGE_W);
    state.paths = geo.chunks.map(c => {
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', c.d);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', c.color);
      p.setAttribute('stroke-width', geo.sw / state.s);
      p.setAttribute('stroke-dasharray', `${(c.len + 1).toFixed(1)} ${(c.len + 4).toFixed(1)}`);
      worm.appendChild(p);
      return p;
    });
    updateWorm();
  }

  function updateWorm() {
    if (!state.geo) return;
    const L = state.L;
    state.geo.chunks.forEach((c, i) => {
      const vis = Math.min(c.len, Math.max(0, L - c.g0));
      const off = c.len + 1 - vis - (vis > 0 ? 1 : 0);
      state.paths[i].setAttribute('stroke-dashoffset', off.toFixed(1));
    });
  }

  const ease = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function updateBars() {
    const f = i => ease(Math.min(1, Math.max(0, (state.p - i / 3) * 3)));
    navBars.forEach((bar, i) => {
      bar.style.height = i < 3 ? (32 + (state.step || 88) * f(i)) + 'px' : '';
    });
    // ya unida, la última barra termina recta en el centro del círculo de
    // "Contact Us": su borde redondeado no asoma por debajo del círculo
    // y la unión con la línea queda sin costura
    const joined = f(2) === 1;
    if (joined) navBars[2].style.height = (16 + (state.step || 88)) + 'px';
    navBars[2].style.borderRadius = joined ? '16px 16px 0 0' : '';
    nav.classList.toggle('at-top', state.p === 0);
  }

  function lenAtY(y) {
    const { M, G } = state.geo;
    let lo = 0, hi = M.length - 1, r = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (M[mid] <= y) { r = mid; lo = mid + 1; } else hi = mid - 1;
    }
    return r < 0 ? 0 : G[r];
  }

  const STEP_Y = [230, 400, 575, 855];

  function updateSteps() {
    if (!state.geo) return;
    const top = meth.offsetTop;
    const ys = state.geo.stepY || STEP_Y.map(y => top + y - 60);
    steps.forEach((step, i) => {
      const on = state.L >= lenAtY(ys[i]) - 1;
      step.classList.toggle('is-on', on);
    });
  }

  function tick() {
    if (state.geo) {
      const sy = window.scrollY;
      const vh = window.innerHeight;
      const s = state.s;
      // en escritorio las barras del menú se unen en el primer 35% de
      // la ventana; en tablet/mobile (menú más compacto) en el 20%
      const joinEnd = vh * (state.desktop ? 0.35 : 0.2);
      const p = Math.min(1, Math.max(0, sy / joinEnd));
      const oy = state.geo.o[1];
      const tipY = sy <= joinEnd ? oy : Math.min(oy + (sy - joinEnd) / s * 2.2, (sy + vh * 0.8) / s);
      const target = sy <= joinEnd ? 0 : lenAtY(tipY);

      state.Lcur += (target - state.Lcur) * 0.14;
      if (Math.abs(target - state.Lcur) < 0.5 || document.hidden) state.Lcur = target;

      if (Math.abs(state.Lcur - state.L) > 0.3) {
        state.L = state.Lcur;
        updateWorm();
        updateSteps();
      }
      if (p !== state.p) {
        state.p = p;
        updateBars();
      }
    }
    state.raf = document.hidden ? setTimeout(tick, 16) : requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------------
     Expertise: tarjetas expandibles
     --------------------------------------------------------- */
  let exp = -1;

  function setExp(e) {
    exp = e;
    exCards.forEach((card, i) => card.classList.toggle('is-open', i === e));
    exGrid.classList.toggle('has-open', e >= 0);
    if (state.desktop) {
      const c = e % 2, r = Math.floor(e / 2);
      exGrid.style.gridTemplateColumns = e < 0 ? '' : (c === 0 ? '586px 67px' : '67px 586px');
      exGrid.style.gridTemplateRows = e < 0 ? '' : (r === 0 ? '298px 64px' : '64px 298px');
    } else {
      exGrid.style.gridTemplateColumns = '';
      exGrid.style.gridTemplateRows = '';
    }
  }

  exCards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => {
      if (state.desktop && exp !== i) setExp(i);
    });
    card.addEventListener('click', () => {
      if (!state.desktop) setExp(exp === i ? -1 : i);
    });
    card.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        setExp(exp === i ? -1 : i);
      }
    });
  });
  exGrid.addEventListener('mouseleave', () => {
    if (state.desktop) setExp(-1);
  });

  /* ---------------------------------------------------------
     Features: tap en pantallas táctiles
     --------------------------------------------------------- */
  features.forEach(f => {
    f.addEventListener('click', () => {
      if (state.desktop) return;
      const was = f.classList.contains('is-active');
      features.forEach(x => x.classList.remove('is-active'));
      if (!was) f.classList.add('is-active');
    });
  });

  /* ---------------------------------------------------------
     Methodology: texto expandible al hover (escritorio)
     --------------------------------------------------------- */
  stepTexts.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (!state.desktop) return;
      el.style.height = el.scrollHeight + 'px';
      el.classList.add('is-hover');
    });
    el.addEventListener('mouseleave', () => {
      el.style.height = '';
      el.classList.remove('is-hover');
    });
  });

  /* ---------------------------------------------------------
     Botón "Send" con anillos de colores
     --------------------------------------------------------- */
  const sendBtn = $('#sendBtn');
  let sending = false;

  sendBtn.addEventListener('click', () => {
    if (sending) return;
    sending = true;
    const rings = [[COL.g, 256], [COL.m, 208], [COL.t, 160], [COL.o, 112], ['#fff', 64]];
    const T = 1.4;
    sendBtn.textContent = '';
    rings.forEach(([c, d], i) => {
      const r = document.createElement('span');
      r.className = 'send-ring';
      r.style.width = d + 'px';
      r.style.height = d + 'px';
      r.style.background = c;
      r.style.animation = `ringGrow ${(T - i * 0.22).toFixed(2)}s cubic-bezier(.3,.6,.4,1) ${(i * 0.22).toFixed(2)}s both`;
      sendBtn.appendChild(r);
    });
    const done = document.createElement('span');
    done.className = 'send-done';
    done.textContent = 'Sent';
    done.style.animation = `sentIn .35s cubic-bezier(.34,1.6,.5,1) ${T}s both`;
    sendBtn.appendChild(done);

    setTimeout(() => {
      sendBtn.innerHTML = '<span class="send-label">Send</span>';
      sending = false;
    }, 4200);
  });

  /* ---------------------------------------------------------
     Video "Our Brand Evolution": carga diferida, autoplay
     silenciado al estar visible, pausa al salir, botón de sonido.
     Con prefers-reduced-motion no se reproduce solo.
     --------------------------------------------------------- */
  const videoBox = $('#brandVideo');
  if (videoBox) {
    const video = $('video', videoBox);
    const playBtn = $('.video-play', videoBox);
    const soundBtn = $('.video-sound', videoBox);
    const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    let loaded = false;
    let userPaused = reduceMQ.matches;

    video.muted = true;

    const loadVideo = () => {
      if (loaded) return;
      loaded = true;
      $$('source', video).forEach(s => { s.src = s.dataset.src; });
      video.load();
    };

    const playVideo = () => {
      loadVideo();
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };

    video.addEventListener('playing', () => {
      videoBox.classList.add('is-playing');
      playBtn.setAttribute('aria-label', 'Pause video');
    });
    video.addEventListener('pause', () => {
      videoBox.classList.remove('is-playing');
      playBtn.setAttribute('aria-label', 'Play video');
    });

    playBtn.addEventListener('click', () => {
      if (video.paused) {
        userPaused = false;
        playVideo();
      } else {
        userPaused = true;
        video.pause();
      }
    });

    soundBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      soundBtn.setAttribute('aria-pressed', String(!video.muted));
      soundBtn.textContent = video.muted ? 'Sound off' : 'Sound on';
    });

    const onReduceChange = () => {
      if (reduceMQ.matches && !video.paused) {
        userPaused = true;
        video.pause();
      }
    };
    if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', onReduceChange);
    else reduceMQ.addListener(onReduceChange);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.intersectionRatio >= 0.5) {
            loadVideo();
            if (!userPaused) playVideo();
          } else if (!video.paused) {
            video.pause();
          }
        });
      }, { threshold: 0.5 }).observe(videoBox);
    } else {
      loadVideo();
      if (!userPaused) playVideo();
    }
  }

  /* ---------------------------------------------------------
     Navegación con anclas: scrollea la ventana (no el lienzo)
     --------------------------------------------------------- */
  function scrollToHash(hash, smooth) {
    const target = hash && hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
    if (!target) return;
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
    const y = target.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top: Math.max(0, y), behavior: smooth ? 'smooth' : 'auto' });
  }

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', ev => {
      const hash = a.getAttribute('href');
      if (!document.getElementById(hash.slice(1))) return;
      ev.preventDefault();
      history.pushState(null, '', hash);
      scrollToHash(hash, true);
    });
  });

  /* ---------------------------------------------------------
     Cambio de modo escritorio <-> tablet/mobile
     --------------------------------------------------------- */
  const ro = 'ResizeObserver' in window ? new ResizeObserver(queueRefresh) : null;

  function startTick() {
    cancelAnimationFrame(state.raf);
    clearTimeout(state.raf);
    state.raf = requestAnimationFrame(tick);
  }

  function resetWorm() {
    if (ro) ro.disconnect();
    worm.textContent = '';
    state.geo = null;
    state.geoO = null;
    state.L = state.Lcur = 0;
    state.p = 0;
    steps.forEach(s => s.classList.remove('is-on'));
    stepTexts.forEach(el => { el.style.height = ''; el.classList.remove('is-hover'); });
  }

  function enableDesktop() {
    resetWorm();
    state.desktop = true;
    setExp(-1);
    layout();
    if (ro) { ro.observe(page); ro.observe(nav); }
    startTick();
  }

  function disableDesktop() {
    resetWorm();
    state.desktop = false;
    ['--s', '--inv', '--hw', '--hh', '--hero-h', '--off-x', '--tag-mt', '--bleed'].forEach(v => stage.style.removeProperty(v));
    stage.style.height = '';
    setExp(-1);
    fluidMeasure();
    if (ro) ro.observe(page);
    startTick();
  }

  function applyMode() {
    if (desktopMQ.matches) enableDesktop();
    else disableDesktop();
  }

  if (desktopMQ.addEventListener) desktopMQ.addEventListener('change', applyMode);
  else desktopMQ.addListener(applyMode);

  window.addEventListener('resize', layout);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refresh);
  }
  window.addEventListener('load', () => {
    refresh();
    if (location.hash) requestAnimationFrame(() => scrollToHash(location.hash, false));
  });

  applyMode();
})();
