// Tsumiki 積木 : poser des blocs, compléter des lignes et des colonnes
// st.x : [plateau W*H] + [3 pièces du plateau de jeu (-1 = utilisée)] + [score, série, coups sans ligne, lignes]
(function () {
  const SHAPES = [
    [[0, 0]],
    [[0, 0], [0, 1]], [[0, 0], [1, 0]],
    [[0, 0], [0, 1], [0, 2]], [[0, 0], [1, 0], [2, 0]],
    [[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
    [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]], [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]],
    [[0, 0], [1, 0], [1, 1]], [[0, 1], [1, 0], [1, 1]], [[0, 0], [0, 1], [1, 0]], [[0, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], [[0, 2], [1, 2], [2, 0], [2, 1], [2, 2]], [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]], [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 0], [2, 0], [2, 1]], [[0, 1], [1, 1], [2, 1], [2, 0]], [[0, 0], [0, 1], [1, 0], [2, 0]], [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 1]], [[1, 0], [1, 1], [1, 2], [0, 1]], [[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 1], [1, 1], [2, 1], [1, 0]],
    [[0, 0], [0, 1], [1, 1], [1, 2]], [[0, 1], [0, 2], [1, 0], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]], [[0, 1], [1, 1], [1, 0], [2, 0]],
    [[0, 0], [1, 1]], [[0, 1], [1, 0]], [[0, 0], [1, 1], [2, 2]], [[0, 2], [1, 1], [2, 0]]
  ];
  const WEIGHT = SHAPES.map(sh => sh.length === 9 ? 1 : sh.length === 1 ? 2 : sh.length >= 5 ? 2 : 3);
  const size = sh => ({ h: Math.max(...sh.map(p => p[0])) + 1, w: Math.max(...sh.map(p => p[1])) + 1 });
  const LV = {
    petit:     { W: 7,  H: 7,  label: 'Défi',      kanji: '狭', sizeLabel: '7×7 · peu de place' },
    classique: { W: 8,  H: 8,  label: 'Classique', kanji: '積', sizeLabel: '8×8' },
    grand:     { W: 10, H: 10, label: 'Grand',     kanji: '広', sizeLabel: '10×10 · plus de place' }
  };
  let drag = null, pops = [], popsT = 0, gain = null;
  const N = s => s.W * s.H, T = s => N(s), SC = s => N(s) + 3, STREAK = s => N(s) + 4, MISS = s => N(s) + 5, LINES = s => N(s) + 6;
  const fits = (s, sh, r0, c0) => sh.every(([r, c]) => { const rr = r0 + r, cc = c0 + c; return rr >= 0 && cc >= 0 && rr < s.H && cc < s.W && !s.x[rr * s.W + cc]; });
  const fitsAnywhere = (s, id) => { const sh = SHAPES[id]; for (let r = 0; r < s.H; r++) for (let c = 0; c < s.W; c++) if (fits(s, sh, r, c)) return true; return false; };
  function pick() { let t = WEIGHT.reduce((a, b) => a + b, 0), x = Math.random() * t; for (let i = 0; i < SHAPES.length; i++) { x -= WEIGHT[i]; if (x < 0) return i; } return 0; }
  function deal(s) {
    let best = null;
    for (let k = 0; k < 25; k++) {
      const t = [pick(), pick(), pick()];
      if (t.some(id => fitsAnywhere(s, id))) { best = t; break; }
      best = t;
    }
    for (let k = 0; k < 3; k++) s.x[T(s) + k] = best[k];
  }
  function linesFor(s, cells) {   // rows and columns full once cells are filled
    const full = new Set(cells.map(([r, c]) => r * s.W + c));
    const isF = i => s.x[i] || full.has(i);
    const rows = [], cols = [];
    for (let r = 0; r < s.H; r++) { let ok = true; for (let c = 0; c < s.W; c++) if (!isF(r * s.W + c)) { ok = false; break; } if (ok) rows.push(r); }
    for (let c = 0; c < s.W; c++) { let ok = true; for (let r = 0; r < s.H; r++) if (!isF(r * s.W + c)) { ok = false; break; } if (ok) cols.push(c); }
    return { rows, cols };
  }
  function place(s, slot, r0, c0) {
    const id = s.x[T(s) + slot], sh = SHAPES[id];
    if (!fits(s, sh, r0, c0)) return false;
    commit(() => {
      const cells = sh.map(([r, c]) => [r0 + r, c0 + c]);
      cells.forEach(([r, c]) => (s.x[r * s.W + c] = 1));
      s.x[T(s) + slot] = -1;
      const { rows, cols } = linesFor(s, []);
      const n = rows.length + cols.length;
      let pts = sh.length;
      pops = [];
      if (n) {
        s.x[STREAK(s)] += 1; s.x[MISS(s)] = 0;
        const clear = new Set();
        rows.forEach(r => { for (let c = 0; c < s.W; c++) clear.add(r * s.W + c); });
        cols.forEach(c => { for (let r = 0; r < s.H; r++) clear.add(r * s.W + c); });
        clear.forEach(i => { s.x[i] = 0; pops.push(i); });
        popsT = Date.now();
        pts += n * n * 10 + (s.x[STREAK(s)] - 1) * 10 * n;
        s.x[LINES(s)] += n;
        gain = { pts, n, streak: s.x[STREAK(s)], t: Date.now(), r: r0 + size(sh).h / 2, c: c0 + size(sh).w / 2 };
      } else {
        s.x[MISS(s)] += 1;
        if (s.x[MISS(s)] >= 3) s.x[STREAK(s)] = 0;
        gain = { pts, n: 0, t: Date.now(), r: r0 + size(sh).h / 2, c: c0 + size(sh).w / 2 };
      }
      s.x[SC(s)] += pts;
      if ([0, 1, 2].every(k => s.x[T(s) + k] < 0)) deal(s);
    });
    setTimeout(() => { if (Date.now() - popsT >= 400) { pops = []; render(); } }, 450);
    return true;
  }
  function trayGeom(s) {
    const slotW = s.W * S / 3, top = (s.H + 0.35) * S, unit = Math.min(0.5 * S, (slotW - 12) / 5);
    return { slotW, top, unit, height: 3.3 * S };
  }
  const block = (x, y, w, cls) => `<g class="${cls}"><rect x="${x + 2.5}" y="${y + 2.5}" width="${w - 5}" height="${w - 5}" rx="${w * .12}"/><rect class="in" x="${x + w * .28}" y="${y + w * .28}" width="${w * .44}" height="${w * .44}" rx="${w * .06}"/></g>`;

  registerGame({
    id: 'tsumiki', name: 'Tsumiki', kanji: '積', winText: 'Plus de place',
    arcade: true, noHints: true, noZoom: true, recordHigh: true, statLabel: 'Score', newText: 'Nouvelle partie',
    levels: LV,
    statValue: s => String(s.x[SC(s)]),
    bestFmt: b => String(b), bestLabel: b => 'record ' + b,
    recordValue: s => s.x[SC(s)],
    resumeLabel: s => 'score ' + s.x[SC(s)],
    winLineText: s => `Score : ${s.x[SC(s)]} · ${plural(s.x[LINES(s)], 'ligne')}`,
    rules: `<h3 style="margin-top:0">Tsumiki 積 : les règles</h3><ul>
      <li>Fais glisser les <b>trois pièces</b> du bas sur le plateau. Les pièces ne tournent pas.</li>
      <li>Une <b>ligne</b> ou une <b>colonne</b> complète s'efface et rapporte des points. Plusieurs à la fois rapportent beaucoup plus.</li>
      <li>Effacer des lignes plusieurs coups de suite crée une <b>série</b> qui multiplie les points (elle s'arrête après 3 coups sans ligne).</li>
      <li>Quand les trois pièces sont posées, trois nouvelles arrivent. La partie s'arrête quand <b>plus aucune pièce ne rentre</b>.</li></ul>
      <h3>Modes</h3><ul><li><b>Défi</b> 7×7, <b>Classique</b> 8×8, <b>Grand</b> 10×10.</li></ul>`,
    valid: s => !!s.x && s.x.length === s.W * s.H + 7,
    generate: L => ({ W: L.W, H: L.H }),
    emptyX: s => { const x = new Array(s.W * s.H + 7).fill(0); const tmp = { W: s.W, H: s.H, x }; deal(tmp); return x; },
    prepare: () => { drag = null; pops = []; gain = null; },
    dims: s => ({ cols: s.W, rows: s.H + 3.7, ox: 0, oy: 0 }),
    progress: s => s.x[SC(s)],
    check: s => { for (let k = 0; k < 3; k++) { const id = s.x[T(s) + k]; if (id >= 0 && fitsAnywhere(s, id)) return false; } return true; },
    wrong: () => new Set(), wrongText: () => '',
    findHint: () => null,
    render: (s, ctx) => {
      const out = [], W = s.W, H = s.H;
      out.push(`<rect class="tk-bg" x="0" y="0" width="${W * S}" height="${H * S}" rx="10"/>`);
      for (let i = 0; i < W * H; i++) {
        const r = (i / W) | 0, c = i % W;
        out.push(`<rect class="tk-slot" x="${c * S + 3}" y="${r * S + 3}" width="${S - 6}" height="${S - 6}" rx="7"/>`);
      }
      // preview of the dragged piece
      let ghost = null, clears = new Set();
      if (drag && drag.target) {
        const sh = SHAPES[s.x[T(s) + drag.slot]];
        ghost = sh.map(([r, c]) => [drag.target.r + r, drag.target.c + c]);
        const { rows, cols } = linesFor(s, ghost);
        rows.forEach(r => { for (let c = 0; c < W; c++) clears.add(r * W + c); });
        cols.forEach(c => { for (let r = 0; r < H; r++) clears.add(r * W + c); });
      }
      for (let i = 0; i < W * H; i++) {
        const r = (i / W) | 0, c = i % W;
        if (s.x[i]) out.push(block(c * S, r * S, S, 'tk-b' + (clears.has(i) ? ' hot' : '') + (ctx.won ? ' over' : '')));
      }
      if (ghost) ghost.forEach(([r, c]) => out.push(block(c * S, r * S, S, 'tk-ghost' + (clears.has(r * W + c) ? ' hot' : ''))));
      if (pops.length && Date.now() - popsT < 420) pops.forEach(i => { const r = (i / W) | 0, c = i % W; out.push(block(c * S, r * S, S, 'tk-pop')); });
      if (gain && Date.now() - gain.t < 900 && gain.n) {
        const label = `+${gain.pts}` + (gain.streak > 1 ? ` · série ×${gain.streak}` : '');
        out.push(`<text class="tk-gain" x="${Math.min(Math.max(gain.c * S, 120), W * S - 120)}" y="${Math.max(gain.r * S, 50)}">${label}</text>`);
      }
      // tray
      const g = trayGeom(s);
      for (let k = 0; k < 3; k++) {
        const id = s.x[T(s) + k];
        if (id < 0 || (drag && drag.slot === k)) continue;
        const sh = SHAPES[id], sz = size(sh), u = g.unit;
        const ox = k * g.slotW + (g.slotW - sz.w * u) / 2, oy = g.top + (g.height - sz.h * u) / 2;
        const ok = fitsAnywhere(s, id);
        sh.forEach(([r, c]) => out.push(block(ox + c * u, oy + r * u, u, 'tk-b tray' + (ok ? '' : ' dead'))));
      }
      if (drag && drag.pos) {
        const sh = SHAPES[s.x[T(s) + drag.slot]], sz = size(sh);
        const x0 = drag.pos.x - sz.w * S / 2, y0 = drag.pos.y - sz.h * S / 2;
        sh.forEach(([r, c]) => out.push(block(x0 + c * S, y0 + r * S, S, 'tk-b float')));
      }
      return out.join('');
    },
    pointerDown: (s, pt) => {
      const g = trayGeom(s);
      if (pt.y < g.top - 10) return { pan: false };
      const slot = Math.min(2, Math.max(0, Math.floor(pt.x / g.slotW)));
      if (s.x[T(s) + slot] < 0) return { pan: false };
      drag = { slot, pos: null, target: null };
      return { pan: false };
    },
    pointerMove: (s, g0, pt) => {
      if (!drag) return;
      const sh = SHAPES[s.x[T(s) + drag.slot]], sz = size(sh);
      drag.pos = { x: pt.x, y: pt.y - 1.7 * S };
      const r0 = Math.round(drag.pos.y / S - sz.h / 2), c0 = Math.round(drag.pos.x / S - sz.w / 2);
      drag.target = fits(s, sh, r0, c0) ? { r: r0, c: c0 } : null;
      render();
    },
    pointerUp: (s) => {
      if (!drag) return;
      const d = drag; drag = null;
      if (d.target) place(s, d.slot, d.target.r, d.target.c); else render();
    },
    pointerCancel: () => { drag = null; render(); }
  });
})();
