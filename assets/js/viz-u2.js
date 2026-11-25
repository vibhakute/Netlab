/* Unit II (Transmission Media) visualizations and simulations. Logic: SimLogic; drawing: VizKit. */
(function () {
  "use strict";
  const K = VizKit, L = SimLogic;
  const { C, txt, label, line, rr, arrowHead, shape, wrapText, metrics } = K;
  const { escapeHtml } = App;
  const R = (id, kind, cat, title, desc, run, params) => K.register(id, { kind, category: cat, title, desc, run, params: params || {} });
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const TAU = Math.PI * 2;
  const COPPER = "#c77d2e", GLASS = "#dff1fb";
  const note = s => '<p class="muted" style="font-size:.85rem;margin:6px 0 0">' + s + "</p>";
  const ok = s => '<b style="color:var(--primary)">' + s + "</b>";
  const bad = s => '<b style="color:var(--red)">' + s + "</b>";
  function polyPartial(ctx, pts, d, color, w, dash) {
    if (pts.length < 2) return;
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    let left = d;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], Lg = Math.hypot(b.x - a.x, b.y - a.y);
      if (left <= Lg) { if (Lg > 0) ctx.lineTo(a.x + (b.x - a.x) * left / Lg, a.y + (b.y - a.y) * left / Lg); break; }
      ctx.lineTo(b.x, b.y); left -= Lg;
    }
    ctx.strokeStyle = color; ctx.lineWidth = w || 2.5; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
  }
  function arcs(ctx, x, y, n, maxR, time, color, a0, a1) {
    for (let k = 0; k < n; k++) {
      const r = ((time * 0.6 + k / n) % 1) * maxR;
      ctx.globalAlpha = Math.max(0, 1 - r / maxR);
      ctx.beginPath(); ctx.arc(x, y, r, a0 === undefined ? 0 : a0, a1 === undefined ? TAU : a1); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  const smooth = (arr, x) => { const p = clamp(x, 0, 1) * (arr.length - 1), i = Math.floor(p), f = p - i; return arr[i] * (1 - f) + arr[Math.min(arr.length - 1, i + 1)] * f; };
  function noiseArray(seed, n) {
    const r = L.rng(seed), raw = Array.from({ length: n }, () => L.gauss(r));
    return raw.map((v, i) => { let s = 0, c = 0; for (let k = -2; k <= 2; k++) { const j = i + k; if (j >= 0 && j < n) { s += raw[j]; c++; } } return 0.55 * s / c + 0.45 * Math.sin(i / n * TAU * 9); });
  }
  const logPos = (v, lo, hi) => (Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo));
  const fmtDist = m => m < 1 ? (m * 100).toFixed(0) + " cm" : m < 1000 ? (m < 10 ? m.toFixed(1) : m.toFixed(0)) + " m" : (m / 1000).toFixed(m < 1e4 ? 2 : m < 1e5 ? 1 : 0) + " km";
  const fmtRate = bps => bps >= 1e9 ? +(bps / 1e9).toFixed(2) + " Gbit/s" : bps >= 1e6 ? +(bps / 1e6).toFixed(2) + " Mbit/s" : +(bps / 1e3).toFixed(2) + " kbit/s";
  const fmtT = sec => sec < 1e-3 ? (sec * 1e6).toFixed(0) + " µs" : sec < 1 ? (sec * 1000).toFixed(1) + " ms" : sec < 60 ? sec.toFixed(2) + " s" : sec < 3600 ? (sec / 60).toFixed(1) + " min" : (sec / 3600).toFixed(2) + " h";

  /* ===================== VISUALIZATIONS ===================== */

  /* ---------- v-mediatree ---------- */
  R("v-mediatree", "viz", "Unit II · Transmission Media", "Classification of Transmission Media", "Build the guided / unguided tree and see how a signal travels on each kind of medium.", env => K.timeline(env, {
    height: 420,
    stages: [
      { title: "Transmission media", text: "A <b>transmission medium</b> is the physical path between transmitter and receiver. Every medium belongs to one of two families." },
      { title: "Guided media (wired / bounded)", text: "The signal is <b>confined</b> to a physical path: twisted pair, coaxial cable, optical fibre, stripline and microstripline. High speed, secure, comparatively shorter distances.", dur: 4 },
      { title: "Unguided media (wireless / unbounded)", text: "No conductor: electromagnetic waves travel through air or space — radio waves, microwaves and infrared. Broadcast through air, less secure, larger distances.", dur: 4 },
      { title: "A signal on a guided medium", text: "The energy stays inside the cable (as current on copper, or light in fibre). Only devices attached to the cable receive it." },
      { title: "A signal on an unguided medium", text: "An antenna radiates the wave into space. Every receiver within range can pick it up — convenient for mobility, but anyone can listen." },
      { title: "Open wire — the oldest guided medium", text: "Bare parallel conductors strung on poles with glass or ceramic insulators (telegraph, early telephone). Cheap, but exposed to weather, noise and crosstalk — replaced by twisted pair and fibre." }
    ],
    draw(ctx, st) {
      const { W, i, t, time } = st;
      const cx = W / 2, gx = W * 0.27, ux = W * 0.73, bw = Math.min(180, W * 0.44), sz = W < 560 ? 10.5 : 12.5;
      const guided = ["Twisted pair", "Coaxial cable", "Optical fibre", "Stripline / microstrip"], unguided = ["Radio waves", "Microwaves", "Infrared"];
      shape(ctx, "box", cx, 30, { w: Math.min(230, W * 0.62), h: 36, label: "Transmission media", fill: i === 0 ? C.bSoft : "#fff", stroke: i === 0 ? C.blue : C.nav, size: sz });
      line(ctx, cx, 48, cx, 62, C.line, 2); line(ctx, gx, 62, ux, 62, C.line, 2); line(ctx, gx, 62, gx, 78, C.line, 2); line(ctx, ux, 62, ux, 78, C.line, 2);
      const gOn = i === 1 || i === 3 || i === 5, uOn = i === 2 || i === 4;
      shape(ctx, "box", gx, 98, { w: bw, h: 40, label: "Guided", sub: "wired · bounded", fill: gOn ? C.bSoft : "#fff", stroke: gOn ? C.blue : C.nav, size: sz });
      shape(ctx, "box", ux, 98, { w: bw, h: 40, label: "Unguided", sub: "wireless · unbounded", fill: uOn ? C.vSoft : "#fff", stroke: uOn ? C.violet : C.nav, size: sz });
      const leaves = (list, x, show, col) => {
        const sx = x - bw / 2 + 6;
        list.forEach((name, k) => {
          if (k >= show) return;
          const y = 156 + k * 42;
          line(ctx, sx, 118, sx, y, C.line, 1.5); line(ctx, sx, y, sx + 10, y, C.line, 1.5);
          shape(ctx, "box", x + 8, y, { w: bw - 16, h: 32, label: name, fill: "#fff", stroke: col, size: sz });
        });
      };
      const gShow = i === 0 ? 0 : i === 1 ? Math.ceil(t * 5) : 4, uShow = i < 2 ? 0 : i === 2 ? Math.ceil(t * 4) : 3;
      leaves(guided, gx, gShow, gOn ? C.blue : C.nav);
      leaves(unguided, ux, uShow, uOn ? C.violet : C.nav);
      const y0 = 362;
      if (i === 3) {
        rr(ctx, 30, y0 - 12, W - 60, 24, 12); ctx.fillStyle = "#eef1f4"; ctx.fill(); ctx.strokeStyle = C.nav; ctx.lineWidth = 2; ctx.stroke();
        for (let k = 0; k < 6; k++) { const x = 44 + ((time * 0.25 + k / 6) % 1) * (W - 88); rr(ctx, x - 10, y0 - 6, 20, 12, 3); ctx.fillStyle = C.blue; ctx.fill(); }
        txt(ctx, "signal confined inside the cable", W / 2, y0 + 30, { size: 11.5, color: C.soft });
      } else if (i === 4) {
        const ax = 40; line(ctx, ax, y0 + 18, ax, y0 - 14, C.nav, 3); ctx.beginPath(); ctx.arc(ax, y0 - 16, 4, 0, TAU); ctx.fillStyle = C.violet; ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.rect(0, y0 - 45, W, 80); ctx.clip(); arcs(ctx, ax, y0 - 16, 4, W - 60, time, C.violet); ctx.restore();
        [0.45, 0.8].forEach(f => K.device(ctx, "pc", W * f, y0 + 2, {}));
        txt(ctx, "radiated in all directions — every receiver in range hears it", W / 2, y0 + 40, { size: 11, color: C.soft });
      } else if (i === 5) {
        const n = Math.max(3, Math.floor(W / 160)), X = k => 40 + k * (W - 80) / (n - 1);
        for (let k = 0; k < n; k++) { const x = X(k); line(ctx, x, y0 - 22, x, y0 + 26, "#8a6d4b", 5); line(ctx, x - 16, y0 - 16, x + 16, y0 - 16, "#8a6d4b", 3); [-12, 12].forEach(d => { ctx.beginPath(); ctx.arc(x + d, y0 - 20, 3.5, 0, TAU); ctx.fillStyle = "#9fd3e6"; ctx.fill(); }); }
        [-12, 12].forEach(d => { ctx.beginPath(); ctx.moveTo(X(0) + d, y0 - 23); for (let k = 1; k < n; k++) { const x = X(k), px = X(k - 1); ctx.quadraticCurveTo((x + px) / 2 + d, y0 - 13, x + d, y0 - 23); } ctx.strokeStyle = COPPER; ctx.lineWidth = 1.6; ctx.stroke(); });
        txt(ctx, "bare parallel wires on insulators", W / 2, y0 + 42, { size: 11.5, color: C.soft });
      }
    }
  }));

  /* ---------- v-twisted ---------- */
  (function () {
    const bits = "10110100", N = noiseArray(21, 400);
    const sgl = x => L.sig.nrz(bits, x);
    const cases = [
      { a: 0, b: 0, shield: false, twisted: false },
      { a: 1, b: 0.55, shield: false, twisted: false },
      { a: 1, b: 0.95, shield: false, twisted: true },
      { a: 0.15, b: 0.143, shield: true, twisted: true }
    ];
    R("v-twisted", "viz", "Unit II · Twisted Pair", "Why Twisted Pair Cancels Noise", "Noise hits a straight pair and a twisted pair; the differential receiver output shows the difference.", env => K.timeline(env, {
      height: 350,
      stages: [
        { title: "Differential signalling", text: "The transmitter sends the signal as <b>+V on wire A</b> and <b>−V on wire B</b>. The receiver outputs (A − B) ÷ 2, which recovers the signal." },
        { title: "Noise on a straight (untwisted) pair", text: "A motor nearby induces noise. Wire A is closer to the source than wire B, so it picks up <b>more</b> noise. The noise does not cancel — the receiver output is noisy.", dur: 4 },
        { title: "Noise on a twisted pair", text: "Twisting keeps swapping the wires' positions, so both pick up <b>almost the same</b> noise n. The receiver computes (V + n) − (−V + n) = 2V: the common noise cancels.", dur: 4 },
        { title: "Shielded twisted pair (STP)", text: "A foil or braided shield blocks most of the external field before it reaches the wires, and twisting cancels what remains. STP performs best in electrically noisy places.", dur: 4 }
      ],
      legend: "Simplified model for illustration: the noise pick-up fractions are chosen to show the effect, not measured values.",
      draw(ctx, st) {
        const { W, i, t, time } = st, cs = cases[i];
        const x0 = 70, x1 = W - 70, cy = 72;
        if (i > 0) {
          rr(ctx, 12, 4, 54, 24, 5); ctx.fillStyle = C.aSoft; ctx.fill(); ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.stroke();
          txt(ctx, "motor", 39, 16, { size: 11, weight: "700", color: C.amber });
          ctx.save(); ctx.beginPath(); ctx.rect(0, 30, W, 26); ctx.clip(); arcs(ctx, 39, 16, 3, W * 0.8, time, C.amber, 0.15, Math.PI - 0.15); ctx.restore();
        }
        shape(ctx, "box", 34, cy, { w: 48, h: 30, label: "Tx", size: 11.5 }); shape(ctx, "box", W - 34, cy, { w: 48, h: 30, label: "Rx", size: 11.5 });
        if (cs.shield) { rr(ctx, x0 - 6, cy - 22, x1 - x0 + 12, 44, 10); ctx.fillStyle = "#eef1f4"; ctx.fill(); ctx.strokeStyle = "#9aa5b1"; ctx.lineWidth = 3; ctx.setLineDash([6, 3]); ctx.stroke(); ctx.setLineDash([]); txt(ctx, "foil / braid shield", (x0 + x1) / 2, cy + 31, { size: 10.5, color: C.soft }); }
        const per = Math.max(30, (x1 - x0) / 12);
        [["A", C.blue, 1], ["B", C.violet, -1]].forEach(([nm, col, sgn]) => {
          ctx.beginPath();
          for (let x = x0; x <= x1; x += 2) { const y = cs.twisted ? cy - sgn * 12 * Math.cos(TAU * (x - x0) / per) : cy - sgn * 12; if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
          ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
          txt(ctx, nm, x0 - 12, cy - sgn * 12, { size: 11, weight: "700", color: col });
        });
        const LX = W < 560 ? 12 : 120, RX = W - 14;
        const rows = [["Wire A = +V + noise", C.blue, x => sgl(x) + cs.a * smooth(N, x) * 0.8], ["Wire B = −V + noise", C.violet, x => -sgl(x) + cs.b * smooth(N, x) * 0.8], ["Receiver (A − B) ÷ 2", C.primary, x => sgl(x) + (cs.a - cs.b) / 2 * smooth(N, x) * 0.8]];
        const reveal = Math.min(1, t * 1.3);
        rows.forEach(([lbl, col, f], k) => {
          const mid = 150 + k * 66 + (W < 560 ? 8 : 0);
          if (W < 560) txt(ctx, lbl, LX, mid - 27, { align: "left", size: 11, weight: "700", color: col }); else wrapText(ctx, lbl, 8, mid - 14, 108, 14, { size: 11.5, weight: "700", color: col });
          line(ctx, LX, mid, RX, mid, "#e3e8ee", 1);
          ctx.beginPath();
          for (let p = 0; p <= 300 * reveal; p++) { const x = p / 300, X = LX + x * (RX - LX), Y = mid - clamp(f(x), -1.6, 1.6) * 17; if (p === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
          ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
        });
        const res = Math.abs(cs.a - cs.b) / 2;
        label(ctx, i === 0 ? "no noise yet" : "residual noise at receiver ≈ " + (res * 100).toFixed(res < 0.01 ? 1 : 0) + "% of the unshielded pick-up", W / 2, 336, { size: 11, color: res > 0.1 ? C.red : C.primary, border: res > 0.1 ? C.red : C.primary });
      }
    }));
  })();

  /* ---------- v-coax ---------- */
  const COAX_LAYERS = [
    ["Copper conductor", "carries the signal", COPPER, 14],
    ["Insulator (dielectric)", "PVC / Teflon / foam", "#f6f1e3", 40],
    ["Braided metal shield", "outer conductor, grounded", "#9aa5b1", 50],
    ["Plastic jacket", "protective outer layer", "#2d3a48", 60]
  ];
  function coaxSection(ctx, cx, cy, hi, sc) {
    for (let k = 3; k >= 0; k--) {
      const col = COAX_LAYERS[k][2], r = COAX_LAYERS[k][3];
      ctx.beginPath(); ctx.arc(cx, cy, r * sc, 0, TAU); ctx.fillStyle = col; ctx.fill();
      if (k === 2) { ctx.save(); ctx.setLineDash([2, 2]); ctx.strokeStyle = "#5f6b78"; ctx.lineWidth = 1; for (let r2 = 42; r2 < 50; r2 += 3) { ctx.beginPath(); ctx.arc(cx, cy, r2 * sc, 0, TAU); ctx.stroke(); } ctx.restore(); }
    }
    if (hi >= 0) { ctx.beginPath(); ctx.arc(cx, cy, COAX_LAYERS[hi][3] * sc, 0, TAU); ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.stroke(); }
  }
  R("v-coax", "viz", "Unit II · Coaxial Cable", "Inside a Coaxial Cable", "Peel the cable layer by layer, see why the field stays inside, then compare baseband and broadband use of its bandwidth.", env => K.timeline(env, {
    height: 320,
    stages: [
      { title: "1. Copper conductor", text: "The centre wire carries the signal current." },
      { title: "2. Insulator (dielectric)", text: "PVC, Teflon or foam keeps the centre conductor exactly centred and separated from the shield. Its thickness and material set the impedance (50 Ω or 75 Ω)." },
      { title: "3. Braided metal shield", text: "The outer conductor and shield. Both conductors share the <b>same axis</b> (co-axial). It must be <b>grounded</b> to block interference and crosstalk." },
      { title: "4. Protective plastic jacket", text: "The outer covering protects the cable from damage and moisture. All these layers make coax <b>bulky</b>." },
      { title: "Why coax rejects noise", text: "The signal's electric field (blue) is confined between the centre conductor and the grounded shield. External interference (amber) is stopped by the shield.", dur: 4 },
      { title: "Baseband mode", text: "The <b>whole</b> bandwidth of the cable is dedicated to <b>one</b> signal, usually digital (e.g. old 10BASE2/10BASE5 Ethernet).", dur: 3.5 },
      { title: "Broadband mode", text: "The bandwidth is <b>split into frequency channels</b> (FDM). Cable TV fits about (1000 − 50) ÷ 8 ≈ 118 channels of 8 MHz between 50 MHz and 1 GHz, including DOCSIS Internet channels.", dur: 5 }
    ],
    draw(ctx, st) {
      const { W, i, t, time } = st;
      if (i <= 4) {
        const narrow = W < 560, cx = narrow ? W / 2 : Math.max(90, W * 0.2), cy = 128;
        coaxSection(ctx, cx, cy, i <= 3 ? i : -1, 1.2);
        if (i === 4) {
          const p = (time * 0.8) % 1;
          for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, r2 = 19 + 27 * (0.4 + 0.6 * p); line(ctx, cx + Math.cos(a) * 18, cy + Math.sin(a) * 18, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, C.blue, 2); }
          for (let k = 0; k < 5; k++) {
            const a = -Math.PI / 2 + (k - 2) * 0.35, d = 120 - ((time * 50 + k * 20) % 50);
            if (d > 76) { ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.9, 4, 0, TAU); ctx.fillStyle = C.amber; ctx.fill(); }
            else txt(ctx, "✕", cx + Math.cos(a) * 78, cy + Math.sin(a) * 78 * 0.9, { size: 13, weight: "700", color: C.red });
          }
        }
        if (!narrow) {
          const x0 = W * 0.4, Lg = W - x0 - 30, lens = [1, 0.8, 0.6, 0.4];
          for (let k = 0; k < 4; k++) {
            const col = COAX_LAYERS[k][2], h = COAX_LAYERS[k][3] * 2;
            ctx.fillStyle = col; ctx.fillRect(x0, cy - h / 2, Lg * lens[k], h);
            if (k === 2) for (let x = x0 + Lg * 0.4; x < x0 + Lg * 0.6 - 6; x += 7) { line(ctx, x, cy - 50, x + 8, cy + 50, "#5f6b78", 1); line(ctx, x + 8, cy - 50, x, cy + 50, "#5f6b78", 1); }
          }
          if (i <= 3) { const xs = x0 + Lg * (i === 3 ? 0 : lens[i + 1]), h = COAX_LAYERS[i][3] * 2; ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.strokeRect(xs, cy - h / 2, x0 + Lg * lens[i] - xs, h); }
          if (i === 4) for (let k = 0; k < 6; k++) { const x = x0 + ((time * 0.2 + k / 6) % 1) * Lg; ctx.beginPath(); ctx.arc(x, cy, 5, 0, TAU); ctx.fillStyle = C.blue; ctx.fill(); }
        }
        if (i <= 3) {
          label(ctx, (i + 1) + ". " + COAX_LAYERS[i][0] + " — " + COAX_LAYERS[i][1], W / 2, 250, { size: W < 560 ? 11 : 12, color: C.red, border: C.red });
          txt(ctx, "inside → out: " + COAX_LAYERS.slice(0, i + 1).map(l => l[0].split(" (")[0]).join(" → "), W / 2, 284, { size: W < 560 ? 9.5 : 11, color: C.soft });
        } else label(ctx, W < 560 ? "field confined · noise blocked by shield" : "field confined inside · external noise blocked by the grounded shield", W / 2, 262, { size: 11, color: C.blue, border: C.blue });
        return;
      }
      const x0 = 30, x1 = W - 20, base = 230, top = 70, fx = f => x0 + (x1 - x0) * f / 1000;
      line(ctx, x0, base, x1, base, C.ink, 1.5);
      [0, 200, 400, 600, 800, 1000].forEach(f => { line(ctx, fx(f), base, fx(f), base + 5, C.ink, 1); txt(ctx, f + (f === 1000 ? " MHz" : ""), Math.min(fx(f), W - 28), base + 16, { size: 10, color: C.faint }); });
      txt(ctx, "Cable spectrum (frequency →)", W / 2, 24, { weight: "700", size: 12.5 });
      if (i === 5) {
        const h = (base - top) * Math.min(1, t * 1.6);
        rr(ctx, fx(0), base - h, fx(1000) - fx(0), h, 4); ctx.fillStyle = C.bSoft; ctx.fill(); ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.stroke();
        if (h > 30) txt(ctx, "ONE signal uses the whole bandwidth", W / 2, base - h / 2, { weight: "700", color: C.blue, size: W < 560 ? 11 : 12.5 });
      } else {
        const n = Math.floor((1000 - 50) / 8), shown = Math.floor(n * Math.min(1, t * 1.25));
        for (let k = 0; k < shown; k++) {
          const f0 = 50 + k * 8, data = k >= n - 24;
          ctx.fillStyle = data ? (k % 2 ? "#cfe6dc" : "#a9d6c3") : (k % 2 ? "#cfe0f6" : "#b0cdef");
          ctx.fillRect(fx(f0), top + 30, Math.max(1, fx(f0 + 8) - fx(f0) - 0.6), base - top - 30);
        }
        label(ctx, shown + " channels × 8 MHz (50 – 1000 MHz)", W / 2, top + 6, { size: 11.5, color: C.blue, border: C.blue });
        txt(ctx, "TV channels", fx(400), base - 12, { size: 10.5, color: C.nav, weight: "700" });
        if (shown > n - 24) txt(ctx, "data", fx(904), base - 12, { size: 10.5, color: C.primary, weight: "700" });
      }
    }
  }));

  /* ---------- v-fibre ---------- */
  function traceRay(aDeg, o) {
    // Ray from the core centre at aDeg to the axis; returns the polyline and whether it escaped.
    const pts = [{ x: o.x0, y: o.yc }];
    let x = o.x0, y = o.yc, dir = -1, escaped = null, first = null;
    const a = aDeg * Math.PI / 180;
    if (Math.abs(aDeg) < 0.01) { pts.push({ x: o.xEnd, y }); return { pts, escaped, first }; }
    for (let guard = 0; guard < 200; guard++) {
      const by = dir < 0 ? o.yTop : o.yBot, dx = Math.abs(by - y) / Math.tan(a);
      if (x + dx >= o.xEnd) { pts.push({ x: o.xEnd, y: y + dir * (o.xEnd - x) * Math.tan(a) }); break; }
      x += dx; y = by; pts.push({ x, y });
      const inc = 90 - aDeg, sn = L.snell(o.n1, o.n2, inc);
      if (!first) first = { x, y, inc, sn };
      if (sn.tir) { dir = -dir; continue; }
      const r = sn.refracted;
      if (r > 89.5) { pts.push({ x: Math.min(o.xEnd, x + 160), y }); escaped = { r, grazing: true }; break; }
      const a2 = (90 - r) * Math.PI / 180, oy = dir < 0 ? o.outTop : o.outBot;
      pts.push({ x: Math.min(x + Math.abs(oy - y) / Math.tan(a2), o.xEnd + 40), y: oy }); escaped = { r }; break;
    }
    return { pts, escaped, first };
  }
  R("v-fibre", "viz", "Unit II · Optical Fibre", "Total Internal Reflection in a Fibre", "Shallow rays are trapped by total internal reflection, steep rays escape, and multi-mode paths spread a pulse.", env => {
    const n1 = 1.5, n2 = 1.3, crit = L.snell(n1, n2, 0).critical, aCrit = 90 - crit;
    return K.timeline(env, {
      height: 320,
      legend: "Teaching values n<sub>core</sub> = 1.50, n<sub>clad</sub> = 1.30 (θc = " + crit.toFixed(1) + "°) make the angles visible. Real fibre (1.48 / 1.46) has θc ≈ 80.6°, so only very shallow rays are guided. Not to scale.",
      stages: [
        { title: "Structure of an optical fibre", text: "Light travels in the glass <b>core</b>. Around it is the <b>cladding</b> with a <i>lower</i> refractive index, then the buffer coating and the outer jacket." },
        { title: "Shallow ray: total internal reflection", text: "This ray meets the core–cladding boundary at 75° from the normal — larger than the critical angle " + crit.toFixed(1) + "°. It is <b>totally reflected</b> and bounces along the core to the far end.", dur: 4 },
        { title: "Steep ray: it escapes", text: "This ray meets the boundary at 50° — smaller than θc. It <b>refracts into the cladding</b> (Snell's law) and is lost. Such rays are outside the fibre's acceptance cone.", dur: 4 },
        { title: "Exactly at the critical angle", text: "At θi = θc the refracted ray travels <b>along the boundary</b> (refraction angle 90°). Any larger angle gives TIR. θc = sin⁻¹(n₂ / n₁).", dur: 3.5 },
        { title: "Multi-mode fibre: modal dispersion", text: "In a wide core, rays at different angles (modes) travel different path lengths. The straight ray arrives first and the steep one last, so a sharp pulse <b>spreads out</b>, limiting speed × distance.", dur: 5 },
        { title: "Single-mode fibre", text: "A tiny core (~8–10 µm) lets only <b>one</b> path through, so there is no modal dispersion. With ~0.2 dB/km loss at 1550 nm it is the medium for long-haul links." }
      ],
      draw(ctx, st) {
        const { W, i, e } = st;
        const x0 = 20, xEnd = W - 20, single = i === 5, sm = W < 560 ? 10 : 11;
        const yTop = single ? 152 : 115, yBot = single ? 168 : 205;
        ctx.fillStyle = "#2d3a48"; ctx.fillRect(x0, 50, xEnd - x0, 8); ctx.fillRect(x0, 262, xEnd - x0, 8);
        ctx.fillStyle = "#c9ced6"; ctx.fillRect(x0, 58, xEnd - x0, 10); ctx.fillRect(x0, 252, xEnd - x0, 10);
        ctx.fillStyle = "#eaf4f8"; ctx.fillRect(x0, 68, xEnd - x0, 184);
        ctx.fillStyle = GLASS; ctx.fillRect(x0, yTop, xEnd - x0, yBot - yTop); ctx.fillStyle = "rgba(31,111,209,.10)"; ctx.fillRect(x0, yTop, xEnd - x0, yBot - yTop);
        line(ctx, x0, yTop, xEnd, yTop, "#7fb3d5", 1.5); line(ctx, x0, yBot, xEnd, yBot, "#7fb3d5", 1.5);
        if (i === 0) {
          [["outer jacket", 40, C.ink], ["buffer / coating", 63, C.ink], ["cladding (n₂ = 1.30)", 90, C.soft], ["core (n₁ = 1.50)", 160, C.blue]].forEach(([s, y, col]) => txt(ctx, s, W / 2, y, { size: sm + 1, weight: "700", color: col }));
          return;
        }
        const o = { x0, yc: (yTop + yBot) / 2, yTop, yBot, xEnd, n1, n2, outTop: 68, outBot: 252 };
        if (i >= 1 && i <= 3) {
          const a = i === 1 ? 15 : i === 2 ? 40 : aCrit;
          const tr = traceRay(a, o), Lg = K.pathLen(tr.pts);
          polyPartial(ctx, tr.pts, Lg * e, i === 2 ? C.red : C.amber, 3);
          const f = tr.first;
          if (f && e > 0.25) {
            line(ctx, f.x, f.y - 34, f.x, f.y + 34, C.faint, 1, [3, 3]);
            const lblY = f.y < 150 ? 26 : 290;
            const msg = "θi = " + f.inc.toFixed(1) + "° " + (f.sn.tir ? ">" : i === 3 ? "=" : "<") + " θc = " + crit.toFixed(1) + "° → " + (f.sn.tir ? "total internal reflection" : i === 3 ? "grazes the boundary" : "refracts out at " + f.sn.refracted.toFixed(1) + "°");
            label(ctx, msg, W / 2, lblY, { size: sm, color: f.sn.tir ? C.primary : C.red, border: f.sn.tir ? C.primary : C.red });
          }
          return;
        }
        if (i === 4) {
          const rays = [[0, C.primary], [12, C.blue], [24, C.violet]];
          const traces = rays.map(r => traceRay(r[0], o)), lens = traces.map(tr => K.pathLen(tr.pts)), maxL = Math.max.apply(null, lens);
          traces.forEach((tr, k) => {
            polyPartial(ctx, tr.pts, lens[k], rays[k][1] + "55", 1.5);
            const p = K.pointOnPath(tr.pts, Math.min(lens[k], e * maxL));
            ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, TAU); ctx.fillStyle = rays[k][1]; ctx.fill();
          });
          label(ctx, "steepest path is " + ((maxL / lens[0] - 1) * 100).toFixed(1) + "% longer → its light arrives later", W / 2, 290, { size: sm, color: C.violet, border: C.violet });
          return;
        }
        const tr = traceRay(0, o); polyPartial(ctx, tr.pts, K.pathLen(tr.pts) * e, C.amber, 3);
        label(ctx, "single path · no modal dispersion", W / 2, 290, { size: sm, color: C.primary, border: C.primary });
      }
    });
  });

  /* ---------- v-stripline ---------- */
  function drawStripSection(ctx, kind, cx, top, w, time) {
    const sw = Math.max(34, w * 0.2), phase = 0.6 + 0.4 * Math.sin(time * 3);
    if (kind === "micro") {
      ctx.fillStyle = "#e6efd5"; ctx.fillRect(cx - w / 2, top + 60, w, 46);
      ctx.fillStyle = COPPER; ctx.fillRect(cx - w / 2, top + 106, w, 8); ctx.fillRect(cx - sw / 2, top + 53, sw, 7);
      ctx.globalAlpha = phase; ctx.strokeStyle = C.blue; ctx.lineWidth = 1.5;
      for (let k = 0; k < 5; k++) { const x = cx - sw / 2 + 4 + k * (sw - 8) / 4; line(ctx, x, top + 61, x, top + 105, C.blue, 1.5); }
      ctx.strokeStyle = C.blue; ctx.lineWidth = 1.5;
      [-1, 1].forEach(s => { for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(cx + s * sw / 2, top + 55); ctx.quadraticCurveTo(cx + s * (sw / 2 + k * 14), top + 48 - k * 9, cx + s * (sw / 2 + k * 18), top + 106); ctx.stroke(); } });
      ctx.globalAlpha = 1;
      txt(ctx, "air (εr = 1)", cx, top + 18, { size: 11, color: C.soft }); txt(ctx, "dielectric εr", cx + w / 2 - 42, top + 84, { size: 10.5, color: "#55723a" });
      txt(ctx, "strip", cx, top + 44, { size: 10.5, weight: "700", color: COPPER }); txt(ctx, "ground plane", cx, top + 126, { size: 10.5, weight: "700", color: COPPER });
    } else {
      ctx.fillStyle = "#e6efd5"; ctx.fillRect(cx - w / 2, top + 22, w, 92);
      ctx.fillStyle = COPPER; ctx.fillRect(cx - w / 2, top + 14, w, 8); ctx.fillRect(cx - w / 2, top + 114, w, 8); ctx.fillRect(cx - sw / 2, top + 64, sw, 7);
      ctx.globalAlpha = phase;
      for (let k = 0; k < 5; k++) { const x = cx - sw / 2 + 4 + k * (sw - 8) / 4; line(ctx, x, top + 23, x, top + 63, C.blue, 1.5); line(ctx, x, top + 72, x, top + 113, C.blue, 1.5); }
      ctx.strokeStyle = C.blue; ctx.lineWidth = 1.5;
      [-1, 1].forEach(s => [-1, 1].forEach(v => { for (let k = 1; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(cx + s * sw / 2, top + 67); ctx.quadraticCurveTo(cx + s * (sw / 2 + k * 16), top + 67, cx + s * (sw / 2 + k * 20), top + 67 + v * 46); ctx.stroke(); } }));
      ctx.globalAlpha = 1;
      txt(ctx, "ground plane", cx, top + 4, { size: 10.5, weight: "700", color: COPPER }); txt(ctx, "ground plane", cx, top + 134, { size: 10.5, weight: "700", color: COPPER });
      txt(ctx, "dielectric εr", cx + w / 2 - 42, top + 38, { size: 10.5, color: "#55723a" });
    }
  }
  R("v-stripline", "viz", "Unit II · Stripline & Microstrip", "Stripline and Microstrip Cross-Sections", "Cross-sections of both planar lines with their electric field lines, then a race showing how the dielectric slows the signal.", env => {
    const ms = L.microstripZ0(0.3, 0.16, 0.035, 4.4), vMs = 1 / Math.sqrt(ms.eeff), vSl = 1 / Math.sqrt(4.4);
    return K.timeline(env, {
      height: 320,
      stages: [
        { title: "Microstripline", text: "A flat strip sits <b>on top</b> of the dielectric with one ground plane underneath. The field lines run from strip to ground — mostly in the dielectric, but some through the <b>air</b> above, so the mode is <b>quasi-TEM</b>." },
        { title: "Stripline", text: "The strip is <b>buried</b> in the dielectric between <b>two ground planes</b> (shorted together). The whole field stays inside the dielectric: a pure <b>TEM</b> line with excellent EMI immunity." },
        { title: "Side by side", text: "Microstrip: single layer, easy to fabricate, components solder on top — but it radiates a little. Stripline: needs a multilayer board, fully shielded — used for filters and couplers.", dur: 5 },
        { title: "The dielectric slows the signal", text: "Speed = c / √εeff. On FR-4 (εr = 4.4), a 0.3 mm microstrip over 0.16 mm has εeff ≈ " + ms.eeff.toFixed(2) + " → " + (vMs * 100).toFixed(0) + "% of c; a stripline sees the full εr → " + (vSl * 100).toFixed(0) + "% of c.", dur: 4.5 }
      ],
      draw(ctx, st) {
        const { W, i, t, time } = st;
        if (i < 2) { drawStripSection(ctx, i === 0 ? "micro" : "strip", W / 2, 50, Math.min(W - 40, 440), time); label(ctx, i === 0 ? "quasi-TEM: field partly in air" : "TEM: field fully in the dielectric", W / 2, 280, { size: 11.5, color: C.blue, border: C.blue }); return; }
        if (i === 2) {
          if (W >= 600) {
            const w = Math.min(380, W / 2 - 30);
            drawStripSection(ctx, "micro", W * 0.25, 50, w, time); drawStripSection(ctx, "strip", W * 0.75, 50, w, time);
            txt(ctx, "Microstrip", W * 0.25, 222, { weight: "700" }); txt(ctx, "Stripline", W * 0.75, 222, { weight: "700" });
            txt(ctx, "1 ground · surface strip · some radiation", W * 0.25, 244, { size: 11, color: C.soft }); txt(ctx, "2 grounds · buried strip · shielded", W * 0.75, 244, { size: 11, color: C.soft });
          } else {
            const sh = Math.floor(time / 2.5) % 2; drawStripSection(ctx, sh ? "strip" : "micro", W / 2, 50, W - 40, time);
            txt(ctx, sh ? "Stripline — 2 grounds, shielded" : "Microstrip — 1 ground, surface strip", W / 2, 222, { weight: "700", size: 12 });
          }
          return;
        }
        const lanes = [["Light in air (c)", 1, C.amber], ["Microstrip on FR-4", vMs, C.blue], ["Stripline in FR-4", vSl, C.violet]];
        const LX = W < 560 ? 14 : 170, RX = W - 20;
        lanes.forEach(([n, v, col], k) => {
          const y = 70 + k * 80;
          if (W < 560) txt(ctx, n + " — " + (v * 100).toFixed(0) + "% of c", LX, y - 24, { align: "left", size: 11, weight: "700", color: col });
          else { txt(ctx, n, 12, y - 8, { align: "left", weight: "700", size: 12, color: col }); txt(ctx, (v * 100).toFixed(0) + "% of c", 12, y + 10, { align: "left", size: 11, color: C.soft }); }
          ctx.fillStyle = k ? COPPER : "#f0e6cf"; ctx.fillRect(LX, y - 3, RX - LX, 6);
          const x = LX + (RX - LX) * Math.min(1, t * 1.05 * v);
          ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fillStyle = col; ctx.fill();
        });
      }
    });
  });

  /* ---------- v-spectrum ---------- */
  R("v-spectrum", "viz", "Unit II · Unguided Media", "Radio, Microwave and Infrared", "Move along the spectrum and see how each band behaves around buildings, the Earth's curvature and walls.", env => K.timeline(env, {
    height: 340,
    stages: [
      { title: "The spectrum used for communication", text: "Radio waves (3 kHz – 1 GHz), microwaves (1 – 300 GHz) and infrared (300 GHz – 400 THz). As frequency rises, waves become more <b>directional</b>, reach <b>shorter</b> distances and <b>penetrate less</b>." },
      { title: "Radio waves: omnidirectional", text: "An antenna radiates in all directions, and low-frequency waves pass through buildings — so receivers need not be aligned (AM/FM radio, cordless phones).", dur: 4 },
      { title: "Radio propagation modes", text: "<b>Ground wave</b> (below ~2 MHz) follows the Earth's curve; <b>sky wave</b> (~2–30 MHz) bounces off the ionosphere for intercontinental range; above ~30 MHz waves travel in <b>line of sight</b>.", dur: 4.5 },
      { title: "Microwaves: line of sight", text: "Dish antennas must be <b>aligned</b>. The Earth's bulge limits a hop to about 3.57(√h₁ + √h₂) km — two 100 m towers ≈ 71 km — so long routes use repeaters.", dur: 4.5 },
      { title: "Infrared: short range, blocked by walls", text: "Infrared is very directional and <b>cannot pass walls</b>. The remote controls only the TV in its room; the TV next door is not affected — no interference, no licence needed.", dur: 4 },
      { title: "Summary", text: "Radio: omnidirectional, passes walls, long reach, poor security. Microwave: directional, line of sight, weather-affected. Infrared: directional, same room only, most secure." }
    ],
    draw(ctx, st) {
      const { W, i, t, time } = st, sm = W < 560;
      const x0 = 16, x1 = W - 16, fx = f => x0 + (x1 - x0) * logPos(f, 3e3, 4e14);
      [[3e3, 1e9, C.blue, "Radio"], [1e9, 3e11, C.amber, "Microwave"], [3e11, 4e14, C.red, "Infrared"]].forEach(([a, b, col, n], k) => {
        const on = i === 0 || i === 5 || (k === 0 && (i === 1 || i === 2)) || (k === 1 && i === 3) || (k === 2 && i === 4);
        ctx.globalAlpha = on ? 1 : 0.3; ctx.fillStyle = col; ctx.fillRect(fx(a), 14, fx(b) - fx(a), 22); ctx.globalAlpha = 1;
        txt(ctx, n, (fx(a) + fx(b)) / 2, 25, { size: sm ? 10 : 11.5, weight: "700", color: "#fff" });
      });
      [[3e3, "3 kHz"], [1e9, "1 GHz"], [3e11, "300 GHz"], [4e14, "400 THz"]].forEach(([f, s]) => txt(ctx, s, clamp(fx(f), 24, W - 28), 46, { size: 10, color: C.faint }));
      const gy = 300;
      if (i === 0) {
        const y = 100;
        line(ctx, x0 + 10, y, x1 - 16, y, C.ink, 2); arrowHead(ctx, x1 - 40, y, x1 - 8, y, C.ink, 10); txt(ctx, "frequency increases →", W / 2, y - 14, { size: 12, weight: "600" });
        [["range", "longer → shorter"], ["direction", "all directions → narrow beam"], ["walls", "passes → blocked"], ["security", "poor → high"]].forEach(([a, b], k) => { txt(ctx, a + ":", W * 0.36, 145 + k * 34, { align: "right", size: 12, weight: "700" }); txt(ctx, b, W * 0.36 + 8, 145 + k * 34, { align: "left", size: sm ? 11 : 12, color: C.soft }); });
        return;
      }
      if (i === 1) {
        line(ctx, 0, gy, W, gy, "#9aa5b1", 2);
        const tx = 40; line(ctx, tx, gy, tx, gy - 80, C.nav, 4); ctx.beginPath(); ctx.arc(tx, gy - 82, 5, 0, TAU); ctx.fillStyle = C.blue; ctx.fill();
        const bx = W * 0.55; rr(ctx, bx - 28, gy - 110, 56, 110, 3); ctx.fillStyle = "#e3e8ee"; ctx.fill(); ctx.strokeStyle = C.soft; ctx.lineWidth = 1.5; ctx.stroke(); txt(ctx, "building", bx, gy - 56, { size: 10.5, color: C.soft });
        ctx.save(); ctx.beginPath(); ctx.rect(0, 58, W, gy - 58); ctx.clip(); arcs(ctx, tx, gy - 82, 5, W, time, C.blue); ctx.restore();
        [W * 0.3, W * 0.8].forEach(x => { shape(ctx, "house", x, gy - 20, {}); label(ctx, "✓ receives", x, gy - 56, { size: 10.5, color: C.primary, border: C.primary }); });
        return;
      }
      if (i === 2) {
        const gY = x => gy + 20 - 140 * (x / W) * (1 - x / W);
        ctx.fillStyle = C.vSoft; ctx.fillRect(0, 62, W, 26); txt(ctx, "ionosphere", W - 46, 75, { size: 10.5, color: C.violet, weight: "700" });
        ctx.beginPath(); ctx.moveTo(0, gy + 20); ctx.quadraticCurveTo(W / 2, gy - 50, W, gy + 20); ctx.strokeStyle = "#9aa5b1"; ctx.lineWidth = 2; ctx.stroke();
        const ax = 34, bx = W - 34;
        line(ctx, ax, gY(ax), ax, gY(ax) - 36, C.nav, 3); line(ctx, bx, gY(bx), bx, gY(bx) - 36, C.nav, 3);
        const sky = [{ x: ax, y: gY(ax) - 36 }, { x: W / 2, y: 88 }, { x: bx, y: gY(bx) - 36 }];
        polyPartial(ctx, sky, K.pathLen(sky) * Math.min(1, t * 1.3), C.violet, 2.5, [6, 4]);
        const gw = []; for (let k = 0; k <= 30; k++) { const x = ax + (W * 0.6 - ax) * k / 30; gw.push({ x, y: gY(x) - 10 }); }
        polyPartial(ctx, gw, K.pathLen(gw) * Math.min(1, t * 1.3), C.blue, 2.5);
        label(ctx, "sky wave (HF, 2–30 MHz)", W / 2, 112, { size: 10.5, color: C.violet, border: C.violet });
        label(ctx, "ground wave (< 2 MHz)", W * 0.3, gY(W * 0.3) - 40, { size: 10.5, color: C.blue, border: C.blue });
        return;
      }
      if (i === 3) {
        const gY = x => gy + 10 - 160 * (x / W) * (1 - x / W);
        ctx.beginPath(); ctx.moveTo(0, gy + 10); ctx.quadraticCurveTo(W / 2, gy - 70, W, gy + 10); ctx.lineTo(W, 340); ctx.lineTo(0, 340); ctx.closePath(); ctx.fillStyle = "#eaf2e3"; ctx.fill(); ctx.strokeStyle = "#8aa06e"; ctx.lineWidth = 2; ctx.stroke();
        const ax = 34, bx = W - 34, h = 130, ty = gY(ax) - h;
        [ax, bx].forEach((x, k) => { line(ctx, x, gY(x), x, ty, C.nav, 4); ctx.beginPath(); ctx.arc(x + (k ? -6 : 6), ty, 10, k ? Math.PI * 0.5 : -Math.PI * 0.5, k ? Math.PI * 1.5 : Math.PI * 0.5); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = C.nav; ctx.lineWidth = 2; ctx.stroke(); });
        line(ctx, ax + 16, ty, bx - 16, ty, "#f1dfb6", 8);
        for (let k = 0; k < 4; k++) { const x = ax + 16 + ((time * 0.4 + k / 4) % 1) * (bx - ax - 32); rr(ctx, x - 9, ty - 6, 18, 12, 3); ctx.fillStyle = C.amber; ctx.fill(); }
        label(ctx, "line of sight: d ≈ 3.57 (√h₁ + √h₂) km", W / 2, ty - 30, { size: 11, color: C.amber, border: C.amber });
        txt(ctx, "Earth's bulge", W / 2, gY(W / 2) + 22, { size: 11, color: "#55723a" });
        return;
      }
      if (i === 4) {
        line(ctx, 0, gy, W, gy, "#9aa5b1", 2);
        const wx = W * 0.64; ctx.fillStyle = "#b9a58a"; ctx.fillRect(wx - 6, 76, 12, gy - 76); txt(ctx, "wall", wx, 66, { size: 10.5, color: C.soft });
        const rx = W * 0.08 + 6, ry = gy - 80, tvx = W * 0.42, tv2 = W * 0.84;
        rr(ctx, rx - 8, ry - 14, 16, 28, 4); ctx.fillStyle = C.nav; ctx.fill(); ctx.beginPath(); ctx.arc(rx, ry - 8, 2.5, 0, TAU); ctx.fillStyle = C.red; ctx.fill(); txt(ctx, "remote", rx, ry + 26, { size: 10.5 });
        [tvx, tv2].forEach((x, k) => { rr(ctx, x - 28, ry - 30, 56, 38, 3); ctx.fillStyle = k ? "#fff" : (Math.sin(time * 5) > 0 ? C.bSoft : "#fff"); ctx.fill(); ctx.strokeStyle = C.nav; ctx.lineWidth = 2; ctx.stroke(); line(ctx, x, ry + 8, x, gy, C.nav, 3); });
        line(ctx, rx + 10, ry - 8, wx - 8, ry - 8, "rgba(197,48,48,.18)", 6);
        for (let k = 0; k < 5; k++) { const x = rx + 10 + ((time * 0.7 + k / 5) % 1) * (wx - rx - 18); if (x < tvx - 30 || x > tvx + 30) { ctx.beginPath(); ctx.arc(x, ry - 8, 3.5, 0, TAU); ctx.fillStyle = C.red; ctx.fill(); } }
        txt(ctx, "✕", wx - 18, ry - 26, { size: 16, weight: "700", color: C.red });
        label(ctx, "TV (same room) ✓", tvx, ry - 50, { size: 10.5, color: C.primary, border: C.primary });
        label(ctx, sm ? "next room: unaffected" : "neighbour's TV unaffected", Math.min(tv2, W - 70), ry - 50, { size: 10.5, color: C.soft });
        return;
      }
      const cols = [["Radio", C.blue, ["omnidirectional", "passes walls", "long range", "security: poor"]], ["Microwave", C.amber, ["directional", "line of sight", "tens of km / hop", "security: medium"]], ["Infrared", C.red, ["directional", "blocked by walls", "a few metres", "security: high"]]];
      cols.forEach(([n, col, pts], k) => { const x = W * (k * 2 + 1) / 6; txt(ctx, n, x, 90, { weight: "700", color: col, size: sm ? 12 : 14 }); pts.forEach((p, j) => txt(ctx, p, x, 124 + j * 32, { size: sm ? 10 : 12, color: C.soft })); });
    }
  }));

  /* ---------- v-satellite ---------- */
  R("v-satellite", "viz", "Unit II · Satellite", "GEO Satellites and the Iridium Constellation", "Uplink/downlink via a geostationary satellite, why GEO misses the poles, and Iridium's polar LEO network with inter-satellite links.", env => {
    const geo = L.orbit(35786), leo = L.orbit(780), gps = L.orbit(20200);
    const RE = L.EARTH_R, kGeo = (RE + 35786) / RE, kLeo = (RE + 780) / RE;
    function earth(ctx, cx, cy, r) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fillStyle = "#dcecf9"; ctx.fill(); ctx.strokeStyle = C.blue; ctx.lineWidth = 1.5; ctx.stroke(); }
    function sat(ctx, x, y, col, s) { s = s || 1; ctx.fillStyle = col || C.nav; ctx.fillRect(x - 4 * s, y - 4 * s, 8 * s, 8 * s); ctx.fillStyle = C.blue; ctx.fillRect(x - 12 * s, y - 2 * s, 7 * s, 4 * s); ctx.fillRect(x + 5 * s, y - 2 * s, 7 * s, 4 * s); }
    return K.timeline(env, {
      height: 340,
      stages: [
        { title: "Uplink and downlink", text: "Ground station A sends up to the satellite (<b>uplink</b>); its transponder amplifies, shifts frequency and sends down to B (<b>downlink</b>). Via GEO the path is at least 2 × 35,786 km ≈ <b>" + geo.upDownMs.toFixed(0) + " ms</b>. (Drawing not to scale.)", dur: 4 },
        { title: "Geostationary orbit (to scale, seen from above the North Pole)", text: "At 35,786 km one orbit takes " + (geo.period / 3600).toFixed(2) + " h — one sidereal day — so the satellite turns <b>with</b> the Earth and stays above the same ground station. The small fast dot is an Iridium satellite at 780 km (one orbit ≈ " + leo.periodMin.toFixed(0) + " min).", dur: 6 },
        { title: "GEO cannot see the poles", text: "A GEO satellite sits above the equator. Even at 0° elevation its view reaches only about ±81° latitude, and useful elevation ends near ±70°, so <b>polar regions are not covered</b>. One GEO sees about a third of the Earth.", dur: 4 },
        { title: "Iridium: polar LEO constellation (orbit to scale)", text: "66 active satellites in <b>six near-polar planes</b> at ~780 km. Every point on Earth, including both poles, always has a satellite overhead.", dur: 6 },
        { title: "Inter-satellite links", text: "A call from a ship is passed <b>satellite to satellite</b> through space and comes down near the destination — no ground station is needed in between.", dur: 4.5 },
        { title: "Delay comparison", text: "Minimum ground → satellite → ground delay (satellite directly overhead): LEO " + leo.upDownMs.toFixed(1) + " ms, MEO (GPS) " + gps.upDownMs.toFixed(0) + " ms, GEO " + geo.upDownMs.toFixed(0) + " ms. In a GEO conversation the reply arrives ≥ " + geo.rttMs.toFixed(0) + " ms later — which feels laggy." }
      ],
      draw(ctx, st) {
        const { W, H, i, e, time } = st;
        if (i === 0) {
          const cx = W / 2, Rr = Math.min(170, W * 0.42), cy = 300 + Rr * 0.45;
          earth(ctx, cx, cy, Rr);
          const a = -Math.PI / 2 - 0.55, b = -Math.PI / 2 + 0.55, A = { x: cx + Math.cos(a) * Rr, y: cy + Math.sin(a) * Rr }, B = { x: cx + Math.cos(b) * Rr, y: cy + Math.sin(b) * Rr }, S = { x: cx, y: 40 };
          sat(ctx, S.x, S.y, C.nav, 1.4); txt(ctx, "GEO satellite", S.x, S.y + 22, { size: 11, weight: "700" });
          [A, B].forEach((p, k) => { ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, TAU); ctx.fillStyle = C.primary; ctx.fill(); txt(ctx, k ? "B" : "A", p.x + (k ? 14 : -14), p.y - 6, { weight: "700" }); });
          line(ctx, A.x, A.y, S.x, S.y, C.line, 1.5, [4, 4]); line(ctx, S.x, S.y, B.x, B.y, C.line, 1.5, [4, 4]);
          const p = K.pointOnPath([A, S, B], K.pathLen([A, S, B]) * e);
          label(ctx, e < 0.5 ? "uplink" : "downlink", p.x, p.y, { bg: C.amber, border: C.amber, color: "#fff", size: 11 });
          label(ctx, "≥ " + geo.upDownMs.toFixed(0) + " ms up + down", W / 2, 118, { weight: "700", color: C.red, border: C.red, size: 11 });
          return;
        }
        if (i === 1) {
          const cx = W / 2, cy = 168, ro = Math.min(150, W / 2 - 20), r = ro / kGeo;
          ctx.beginPath(); ctx.arc(cx, cy, ro, 0, TAU); ctx.strokeStyle = C.line; ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
          earth(ctx, cx, cy, r);
          const w = time * TAU / 8, gs = { x: cx + Math.cos(w) * r, y: cy + Math.sin(w) * r }, S = { x: cx + Math.cos(w) * ro, y: cy + Math.sin(w) * ro };
          line(ctx, gs.x, gs.y, S.x, S.y, C.amber, 1.5, [3, 3]);
          ctx.beginPath(); ctx.arc(gs.x, gs.y, 3.5, 0, TAU); ctx.fillStyle = C.primary; ctx.fill(); sat(ctx, S.x, S.y, C.nav, 1);
          const wl = w * (geo.period / leo.period); ctx.beginPath(); ctx.arc(cx + Math.cos(wl) * r * kLeo, cy + Math.sin(wl) * r * kLeo, 3, 0, TAU); ctx.fillStyle = C.violet; ctx.fill();
          label(ctx, "GEO stays above the same ground station", W / 2, 330, { size: 11, color: C.primary, border: C.primary });
          return;
        }
        if (i === 2) {
          const Rr = Math.min(42, (W - 70) / 7.8), cx = 24 + Rr, cy = 160, d = Rr * kGeo, S = { x: cx + d, y: cy };
          earth(ctx, cx, cy, Rr); line(ctx, cx - Rr - 6, cy, S.x, cy, C.line, 1, [3, 3]);
          const th = Math.acos(Rr / d), p1 = { x: cx + Rr * Math.cos(th), y: cy - Rr * Math.sin(th) }, p2 = { x: cx + Rr * Math.cos(th), y: cy + Rr * Math.sin(th) };
          ctx.beginPath(); ctx.moveTo(S.x, S.y); ctx.lineTo(p1.x, p1.y); ctx.arc(cx, cy, Rr, -th, th); ctx.closePath(); ctx.fillStyle = "rgba(183,121,31,.15)"; ctx.fill();
          line(ctx, S.x, S.y, p1.x, p1.y, C.amber, 1.5); line(ctx, S.x, S.y, p2.x, p2.y, C.amber, 1.5);
          sat(ctx, S.x, S.y, C.nav, 1); txt(ctx, "GEO", S.x, S.y + 20, { size: 10.5, weight: "700" });
          txt(ctx, "N", cx, cy - Rr - 10, { weight: "700", color: C.red }); txt(ctx, "S", cx, cy + Rr + 12, { weight: "700", color: C.red });
          txt(ctx, "Earth and orbit to scale", W / 2, 250, { size: 10.5, color: C.faint });
          label(ctx, "no view above ~" + (th * 180 / Math.PI).toFixed(0) + "° latitude", W / 2, 290, { size: 11, color: C.red, border: C.red });
          return;
        }
        const cx = W / 2, cy = 166, Rr = Math.min(118, W * 0.27), ro = Rr * kLeo;
        earth(ctx, cx, cy, Rr);
        const planes = 6, perPlane = 11, frozen = i >= 4;
        const pos = (pk, j) => { const phi = pk * Math.PI / planes, th = (frozen ? 0 : time * 0.25) + j * TAU / perPlane + pk * 0.3; return { x: cx + ro * Math.sin(th) * Math.cos(phi), y: cy - ro * Math.cos(th), z: Math.sin(th) * Math.sin(phi) }; };
        for (let pk = 0; pk < planes; pk++) {
          const phi = pk * Math.PI / planes; ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(0.5, ro * Math.abs(Math.cos(phi))), ro, 0, 0, TAU); ctx.strokeStyle = "rgba(107,70,193,.25)"; ctx.lineWidth = 1; ctx.stroke();
          for (let j = 0; j < perPlane; j++) { const p = pos(pk, j); ctx.globalAlpha = p.z < 0 ? 0.25 : 1; sat(ctx, p.x, p.y, C.violet, 0.55); }
        }
        ctx.globalAlpha = 1;
        if (i === 4) {
          const sats = [2, 1, 0].map(j => { const th = j * TAU / perPlane; return { x: cx + ro * Math.sin(th), y: cy - ro * Math.cos(th) }; });
          const ship = { x: cx + Rr * Math.sin(2.1), y: cy - Rr * Math.cos(2.1) }, pole = { x: cx + Rr * Math.sin(0.12), y: cy - Rr * Math.cos(0.12) };
          const path = [ship].concat(sats).concat([pole]);
          for (let k = 0; k < path.length - 1; k++) line(ctx, path[k].x, path[k].y, path[k + 1].x, path[k + 1].y, C.amber, 2, [4, 3]);
          const p = K.pointOnPath(path, K.pathLen(path) * e); label(ctx, "call", p.x, p.y, { bg: C.amber, border: C.amber, color: "#fff", size: 10.5 });
          label(ctx, "ship", ship.x + 26, ship.y + 8, { size: 10.5 }); label(ctx, "polar station", pole.x - 46, pole.y + 18, { size: 10.5 });
        }
        if (i === 5) {
          ctx.fillStyle = "rgba(251,252,253,.93)"; ctx.fillRect(0, 0, W, H);
          const bars = [["LEO (Iridium, 780 km)", leo.upDownMs, C.primary], ["MEO (GPS, 20,200 km)", gps.upDownMs, C.blue], ["GEO (35,786 km)", geo.upDownMs, C.red]];
          const x0 = W < 560 ? 14 : 190, w = W - x0 - 80;
          bars.forEach(([n, v, col], k) => {
            const y = 80 + k * 70, bw = Math.max(3, w * v / geo.upDownMs * e);
            if (W < 560) txt(ctx, n, x0, y - 22, { align: "left", size: 11, weight: "700" }); else txt(ctx, n, 14, y, { align: "left", weight: "700", size: 12 });
            rr(ctx, x0, y - 12, bw, 24, 4); ctx.fillStyle = col; ctx.fill(); txt(ctx, v.toFixed(v < 10 ? 1 : 0) + " ms", x0 + bw + 8, y, { align: "left", size: 12, color: C.soft });
          });
          txt(ctx, "minimum ground → satellite → ground delay (satellite overhead)", W / 2, 300, { size: 10.5, color: C.faint });
        }
      }
    });
  });

  /* ---------- v-generations ---------- */
  const GENS = [
    { g: "1G", year: "1980s", tech: "Analog FDMA (AMPS, TACS)", peak: null, feat: "Analog voice calls only — no data, no encryption." },
    { g: "2G", year: "1990s", tech: "Digital GSM (TDMA), IS-95 (CDMA)", peak: 0.0144, feat: "Digital voice and SMS; GPRS/EDGE later added packet data (up to ~384 kbit/s)." },
    { g: "3G", year: "2000s", tech: "UMTS/WCDMA, CDMA2000", peak: 2, feat: "Mobile Internet and video calls (IMT-2000 target 2 Mbit/s; HSPA later reached tens of Mbit/s)." },
    { g: "4G", year: "2010s", tech: "LTE / LTE-Advanced (OFDMA, all-IP)", peak: 1000, feat: "Mobile broadband, HD streaming, VoLTE; typical latency 30–50 ms." },
    { g: "5G", year: "2019+", tech: "5G NR (OFDM, massive MIMO, mmWave)", peak: 20000, feat: "eMBB, URLLC (~1 ms), mMTC (10⁶ devices/km²), network slicing." }
  ];
  R("v-generations", "viz", "Unit II · 4G and 5G", "Mobile Generations 1G → 5G", "Step through each mobile generation and compare peak data rates and latency.", env => K.timeline(env, {
    height: 320,
    legend: "Peak rates are standard targets/maxima on a log scale, not typical user speeds.",
    stages: GENS.map(g => ({ title: g.g + " (" + g.year + ")", text: "<b>" + g.tech + "</b>. " + g.feat })).concat([{ title: "Latency: 4G vs 5G", text: "4G ≈ 50 ms vs 5G ≈ 1 ms (slide values; 1 ms is the URLLC target). The dots are slowed down 100× so you can see them: 4G takes 5 s, 5G 0.1 s.", dur: 6 }]),
    draw(ctx, st) {
      const { W, i, e, t } = st, sm = W < 560;
      if (i < 5) {
        const g = GENS[i];
        rr(ctx, 12, 10, W - 24, 76, 8); ctx.fillStyle = C.bSoft; ctx.fill(); ctx.strokeStyle = C.blue; ctx.lineWidth = 1.5; ctx.stroke();
        txt(ctx, g.g, 44, 48, { size: 26, weight: "800", color: C.blue });
        wrapText(ctx, g.tech + " — " + g.feat, 82, 18, W - 104, 15, { size: sm ? 10.5 : 12.5 });
        const x0 = 56, x1 = W - 90, fx = v => x0 + (x1 - x0) * logPos(v, 0.01, 1e5);
        GENS.forEach((gg, k) => {
          if (k > i) return;
          const y = 116 + k * 40, grow = k === i ? e : 1;
          txt(ctx, gg.g, 14, y, { align: "left", weight: "700" });
          if (gg.peak === null) { txt(ctx, "voice only (analog)", x0, y, { align: "left", size: 11.5, color: C.soft }); return; }
          const w = (fx(gg.peak) - x0) * grow; rr(ctx, x0, y - 11, Math.max(3, w), 22, 4); ctx.fillStyle = k === i ? C.blue : "#9fbde8"; ctx.fill();
          const lbl = gg.peak >= 1000 ? gg.peak / 1000 + " Gbit/s" : gg.peak >= 1 ? gg.peak + " Mbit/s" : (gg.peak * 1000).toFixed(1) + " kbit/s";
          txt(ctx, lbl, x0 + w + 6, y, { align: "left", size: 11.5, color: C.soft });
        });
        return;
      }
      const lanes = [["4G (~50 ms)", 50, C.amber], ["5G (~1 ms)", 1, C.primary]], LX = sm ? 14 : 120, RX = W - 30, elapsed = t * 6;
      lanes.forEach(([n, ms, col], k) => {
        const y = 110 + k * 110;
        if (sm) txt(ctx, n, LX, y - 30, { align: "left", weight: "700", color: col }); else txt(ctx, n, 12, y, { align: "left", weight: "700", color: col });
        line(ctx, LX, y, RX, y, "#e3e8ee", 6);
        const p = Math.min(1, elapsed / (ms * 0.1));
        ctx.beginPath(); ctx.arc(LX + (RX - LX) * p, y, 9, 0, TAU); ctx.fillStyle = col; ctx.fill();
        if (p >= 1) txt(ctx, "arrived", RX, y - 22, { align: "right", size: 11, color: col, weight: "700" });
      });
    }
  }));

  /* ---------- v-iot ---------- */
  const IOT_LAYERS = [["4. Application", "smart application", C.violet], ["3. Processing / middleware", "process information", C.blue], ["2. Transport / network", "data transmission", C.primary], ["1. Perception (sensing)", "data gathering", C.amber]];
  R("v-iot", "viz", "Unit II · IoT", "IoT Architecture: One Reading's Journey", "A temperature reading climbs the four IoT layers and a command comes back down to switch on a fan.", env => K.timeline(env, {
    height: 336,
    stages: [
      { title: "Perception layer: the sensor reads 31 °C", text: "A temperature <b>sensor</b> in the room measures 31 °C. The perception layer gathers real-world data (sensors, RFID/NFC) and acts on it (actuators)." },
      { title: "Transport / network layer", text: "The reading travels over <b>Wi-Fi</b> to an <b>IoT gateway</b>, which aggregates data, translates protocols and forwards it securely over the Internet.", dur: 4 },
      { title: "Processing / middleware layer", text: "The <b>cloud</b> (or an edge node) stores and analyses the data. A rule fires: <code>temperature > 28 °C → fan ON</code>.", dur: 3.5 },
      { title: "Application layer", text: "The user's <b>app dashboard</b> shows the reading and an alert. Users can also send commands from here.", dur: 3.2 },
      { title: "Back down to the actuator", text: "The command travels cloud → gateway → <b>fan actuator</b>, which turns the digital command into physical action. Sense → send → think → act.", dur: 4.5 }
    ],
    draw(ctx, st) {
      const { W, i, e, time } = st, sm = W < 560;
      const bandY = k => 6 + k * 82, bandH = 76;
      IOT_LAYERS.forEach(([n, sub, col], k) => {
        const on = (i === 0 && k === 3) || (i === 1 && k === 2) || (i === 2 && k === 1) || (i === 3 && k === 0) || (i === 4 && k === 3);
        rr(ctx, 6, bandY(k), W - 12, bandH, 6); ctx.fillStyle = on ? col + "1f" : "#f4f6f8"; ctx.fill(); ctx.strokeStyle = on ? col : "#e3e8ee"; ctx.lineWidth = on ? 2 : 1; ctx.stroke();
        txt(ctx, n, 14, bandY(k) + 13, { align: "left", size: sm ? 10.5 : 12, weight: "700", color: col });
        if (!sm) txt(ctx, sub, 14, bandY(k) + 30, { align: "left", size: 10.5, color: C.faint });
      });
      const nx = sm ? 0.5 : 0.55;
      const P = { sensor: { x: W * (sm ? 0.3 : 0.4), y: bandY(3) + 46 }, fan: { x: W * 0.82, y: bandY(3) + 42 }, gw: { x: W * nx, y: bandY(2) + 46 }, cloud: { x: W * nx, y: bandY(1) + 46 }, app: { x: W * nx, y: bandY(0) + 46 } };
      shape(ctx, "sensor", P.sensor.x, P.sensor.y, {}); txt(ctx, "31 °C", P.sensor.x - 36, P.sensor.y, { size: 11, weight: "700", color: C.red });
      K.device(ctx, "router", P.gw.x, P.gw.y, {}); txt(ctx, "gateway", P.gw.x + 28, P.gw.y, { align: "left", size: 11, weight: "600" });
      K.device(ctx, "cloud", P.cloud.x, P.cloud.y, {}); txt(ctx, "cloud / edge", P.cloud.x + 40, P.cloud.y, { align: "left", size: 11, weight: "600" });
      shape(ctx, "phone", P.app.x, P.app.y - 4, {}); txt(ctx, "app", P.app.x + 26, P.app.y, { align: "left", size: 11, weight: "600" });
      const fanOn = i === 4 && e > 0.95;
      ctx.save(); ctx.translate(P.fan.x, P.fan.y); ctx.rotate(fanOn ? time * 12 : 0);
      for (let k = 0; k < 3; k++) { ctx.rotate(TAU / 3); ctx.beginPath(); ctx.ellipse(0, -10, 5, 11, 0, 0, TAU); ctx.fillStyle = fanOn ? C.primary : C.faint; ctx.fill(); }
      ctx.restore(); txt(ctx, "fan " + (fanOn ? "ON" : "OFF"), P.fan.x, P.fan.y + 26, { size: 11, weight: "700", color: fanOn ? C.primary : C.soft });
      const go = (pts, lbl, col) => { const p = K.pointOnPath(pts, K.pathLen(pts) * e); label(ctx, lbl, p.x, p.y, { bg: col, border: col, color: "#fff", size: 10.5 }); };
      if (i === 1) go([P.sensor, P.gw, P.cloud], "31 °C", C.primary);
      if (i === 2) label(ctx, "rule: T > 28 °C → fan ON", sm ? W * 0.5 : P.cloud.x - 160, P.cloud.y + (sm ? 26 : 0), { size: 10.5, color: C.blue, border: C.blue });
      if (i === 3) go([P.cloud, P.app], "alert: 31 °C", C.violet);
      if (i === 4) go([P.cloud, P.gw, P.fan], "fan ON", C.amber);
    }
  }));

  /* ---------- v-tap ---------- */
  R("v-tap", "viz", "Unit II · Secure Media", "Eavesdropping on Copper, Wireless and Fibre", "An attacker taps each medium, first without and then with encryption.", env => {
    const secret = "PIN 4821", st0 = { cipher: null, tried: false };
    try {
      if (window.crypto && crypto.subtle) {
        st0.tried = true;
        crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt"])
          .then(k => crypto.subtle.encrypt({ name: "AES-GCM", iv: crypto.getRandomValues(new Uint8Array(12)) }, k, new TextEncoder().encode(secret)))
          .then(buf => { st0.cipher = Array.from(new Uint8Array(buf)).slice(0, 6).map(b => b.toString(16).padStart(2, "0")).join(""); })
          .catch(() => {});
      }
    } catch (err) { /* Web Crypto unavailable: shown in the drawing */ }
    return K.timeline(env, {
      height: 330,
      stages: [
        { title: "Copper without encryption", text: "The attacker cuts in a <b>T-joint</b> (coax) or splices the pair. The plaintext flows to them as well." },
        { title: "Wireless without encryption", text: "Radio is <b>broadcast</b>: anyone within range simply listens. No physical access is needed — the least secure medium." },
        { title: "Fibre without encryption", text: "Fibre emits no electromagnetic radiation. A tap must <b>bend</b> the fibre to leak light, which causes a measurable <b>power drop</b> that monitoring can detect — but the leaked light is still readable." },
        { title: "With encryption (AES-256-GCM)", text: "With encryption on every link the attacker captures only <b>ciphertext</b> (generated for real in your browser with Web Crypto). Without the key it is useless — on any medium." },
        { title: "Lesson", text: "Choose a hard-to-tap medium (fibre) <b>and</b> always encrypt and authenticate. Physical security alone is never enough." }
      ],
      draw(ctx, st) {
        const { W, i, e, time } = st, sm = W < 560, enc = i >= 3;
        const cipherTxt = st0.cipher ? "🔒 " + st0.cipher + "…" : "🔒 ciphertext";
        const rows = [["Copper", 60, C.amber], ["Wireless", 160, C.violet], ["Fibre", 260, C.blue]];
        const x0 = sm ? 30 : 120, x1 = W - 30;
        rows.forEach(([n, y, col], k) => {
          const active = i === k || i >= 3;
          ctx.globalAlpha = active ? 1 : 0.3;
          if (sm) txt(ctx, n, 8, y - 36, { align: "left", size: 11, weight: "700", color: col }); else txt(ctx, n, 12, y, { align: "left", size: 12.5, weight: "700", color: col });
          K.device(ctx, "pc", x0, y, {}); K.device(ctx, "pc", x1, y, {});
          if (k === 1) { ctx.save(); ctx.beginPath(); ctx.rect(x0, y - 40, x1 - x0, 80); ctx.clip(); arcs(ctx, x0 + 22, y - 6, 3, (x1 - x0) * 0.9, time, col + "88"); ctx.restore(); }
          else line(ctx, x0 + 24, y, x1 - 24, y, k === 0 ? COPPER : "#7fb3d5", k === 0 ? 3 : 4);
          const mx = (x0 + x1) / 2 + (k === 1 ? W * 0.1 : 0), ay = y + 26;
          if (k === 0) { line(ctx, mx, y, mx, ay - 7, C.red, 2); txt(ctx, "T-joint", mx + 26, y + 10, { size: 10, weight: "700", color: C.red }); }
          if (k === 2) { ctx.beginPath(); ctx.arc(mx, y + 8, 8, Math.PI, 0, true); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.stroke(); txt(ctx, "bend tap", mx + 30, y + 10, { size: 10, weight: "700", color: C.red }); }
          shape(ctx, "dot", mx, ay, { r: 7, fill: C.rSoft, stroke: C.red });
          if (active) {
            const p = x0 + 24 + (x1 - x0 - 48) * e;
            label(ctx, enc ? cipherTxt : secret, p, y - 16, { size: 10.5, bg: enc ? C.nav : col, border: enc ? C.nav : col, color: "#fff", mono: enc });
            if (e > 0.5) label(ctx, "attacker sees: " + (enc ? cipherTxt : secret), clamp(mx, 100, W - 100), ay + 20, { size: 10, color: enc ? C.primary : C.red, border: enc ? C.primary : C.red, mono: true });
            if (k === 2 && e > 0.3 && !enc) txt(ctx, "Rx power drop detected ⚠", x1 - 6, y - 32, { align: "right", size: 10, color: C.amber, weight: "700" });
          }
          ctx.globalAlpha = 1;
        });
        if (enc && !st0.cipher) txt(ctx, st0.tried ? "(generating ciphertext…)" : "(Web Crypto unavailable here — real ciphertext not generated)", W / 2, 324, { size: 10, color: C.faint });
      }
    });
  });

  /* ---------- v-optical ---------- */
  R("v-optical", "viz", "Unit II · High-Speed Optical", "Long-Haul Optical Link", "Trace the optical power through laser → 80 km fibre → EDFA → 80 km fibre → photodetector.", env => {
    const lb = L.linkBudget({ txDbm: 0, dbPerKm: 0.2, km: 160, connectors: 2, splices: 0, sensitivityDbm: -24, ampGainDb: 20 });
    const noAmp = L.linkBudget({ txDbm: 0, dbPerKm: 0.2, km: 160, connectors: 2, splices: 0, sensitivityDbm: -24, ampGainDb: 0 });
    const prof = [[0, 0], [0, -0.5], [80, -16.5], [80, 3.5], [160, -12.5], [160, -13]];
    return K.flow(env, {
      height: 320,
      nodes: { tx: { x: 0.11, y: 50, label: "Laser Tx", sub: "DFB 1550 nm" }, edfa: { x: 0.5, y: 50, label: "EDFA", sub: "+20 dB" }, rx: { x: 0.89, y: 50, label: "Photodiode", sub: "Rx" } },
      edges: [["tx", "edfa", { label: "80 km SMF", ly: 24, color: "#7fb3d5", w: 4 }], ["edfa", "rx", { label: "80 km SMF", ly: 24, color: "#7fb3d5", w: 4 }]],
      legend: "Typical values: 0.2 dB/km SMF at 1550 nm, 0.5 dB per connector, receiver sensitivity −24 dBm. Computed with the link-budget formula.",
      stages: [
        { title: "Electrical bits become light", text: "The <b>laser transmitter</b> (DFB, 1550 nm) converts electrical bits into light pulses at 0 dBm (1 mW). A connector costs 0.5 dB.", hi: ["tx"] },
        { title: "80 km of single-mode fibre", text: "The light loses 0.2 dB/km × 80 km = <b>16 dB</b> — only 2.5% of the power remains. It is now at −16.5 dBm.", edges: [["tx", "edfa"]], move: [{ path: ["tx", "edfa"], label: "light", color: C.blue }], dur: 4 },
        { title: "EDFA: optical amplification", text: "The <b>erbium-doped fibre amplifier</b> adds 20 dB directly in the optical domain — no conversion to electricity — and amplifies all C-band wavelengths at once.", hi: ["edfa"] },
        { title: "Second span", text: "Another 80 km costs another 16 dB. Without the EDFA the signal would arrive at " + noAmp.rxDbm.toFixed(1) + " dBm — below the receiver sensitivity (dashed grey line).", edges: [["edfa", "rx"]], move: [{ path: ["edfa", "rx"], label: "light", color: C.blue }], dur: 4 },
        { title: "Photodetector converts light to bits", text: "The photodiode receives " + lb.rxDbm.toFixed(1) + " dBm. Sensitivity is −24 dBm, so the margin is <b>" + lb.marginDb.toFixed(1) + " dB</b> (≥ 3 dB needed) ✔.", hi: ["rx"] }
      ],
      extra(ctx, st, P) {
        const { W, i, e } = st, xa = P("tx", W).x, xb = P("rx", W).x, y0 = 136, y1 = 296;
        const X = km => xa + (xb - xa) * km / 160, Y = dbm => y0 + (5 - dbm) / 40 * (y1 - y0);
        line(ctx, xa, Y(-24), xb, Y(-24), C.red, 1.2, [5, 4]); txt(ctx, "sensitivity −24 dBm", xb, Y(-24) + 12, { align: "right", size: 10, color: C.red });
        [0, -10, -20, -30].forEach(v => { txt(ctx, v + "", xa - 8, Y(v), { align: "right", size: 9.5, color: C.faint }); line(ctx, xa, Y(v), xb, Y(v), "#eef1f4", 1); });
        txt(ctx, "dBm", xa - 8, y0 - 10, { align: "right", size: 9.5, color: C.faint });
        const upto = [1, 2, 3, 4, 5][i];
        const pts = prof.slice(0, upto + 1).map(([k, d]) => ({ x: X(k), y: Y(d) }));
        if (i === 1 || i === 3) { const last = pts.length - 1, prev = pts[last - 1]; pts[last] = { x: prev.x + (pts[last].x - prev.x) * e, y: prev.y + (pts[last].y - prev.y) * e }; }
        ctx.beginPath(); pts.forEach((p, k) => k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.strokeStyle = C.primary; ctx.lineWidth = 2.5; ctx.stroke();
        if (i >= 3) { ctx.beginPath(); ctx.moveTo(X(80), Y(-16.5)); ctx.lineTo(X(160), Y(-32.5)); ctx.lineTo(X(160), Y(noAmp.rxDbm)); ctx.strokeStyle = C.faint; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]); }
        if (i === 4) label(ctx, lb.rxDbm.toFixed(1) + " dBm · margin " + lb.marginDb.toFixed(1) + " dB", X(118), Y(-13) - 18, { size: 10.5, color: C.primary, border: C.primary });
      }
    });
  });

  /* ---------- v-mediacompare ---------- */
  const MEDIA_CMP = [
    { n: "UTP", dist: 100, rate: 10e9, cost: 1, noise: 2 },
    { n: "STP", dist: 100, rate: 10e9, cost: 2, noise: 3 },
    { n: "Coax", dist: 500, rate: 1e9, cost: 2, noise: 3 },
    { n: "Fibre (SMF)", dist: 80000, rate: 100e9, cost: 4, noise: 5 },
    { n: "Radio", dist: 50000, rate: 10e6, cost: 2, noise: 1 },
    { n: "Microwave", dist: 50000, rate: 1e9, cost: 4, noise: 2 },
    { n: "Satellite", dist: 1.8e7, rate: 100e6, cost: 5, noise: 2 },
    { n: "Infrared", dist: 5, rate: 4e6, cost: 1, noise: 4 }
  ];
  R("v-mediacompare", "viz", "Unit II · Comparison", "Comparing Transmission Media", "Animated bars compare each medium's reach, speed, cost and noise immunity.", env => {
    const crit = [
      { k: "dist", t: "Reach per link (log scale)", text: "Typical distance per link without repeaters: UTP/STP 100 m, coax ~500 m, SMF ~80 km per amplifier span, a microwave hop ~50 km, one GEO satellite covers a third of the globe, infrared a few metres.", log: [1, 2e7], f: v => fmtDist(v) },
      { k: "rate", t: "Typical data rate (log scale)", text: "Fibre leads (100 Gbit/s per wavelength, Tbit/s with WDM). UTP Cat 6A reaches 10 Gbit/s at 100 m. Broadcast radio links and infrared (IrDA) are in the Mbit/s range.", log: [1e6, 2e11], f: fmtRate },
      { k: "cost", t: "Relative cost (1 = cheapest)", text: "UTP and infrared are cheapest. Fibre's cost is mostly installation (trenching, splicing). Microwave and satellite need expensive equipment.", max: 5, f: v => v + " / 5" },
      { k: "noise", t: "Noise immunity (5 = best)", text: "Fibre is immune to EMI. Shielding (STP, coax) helps copper. Radio and microwave suffer from interference and weather.", max: 5, f: v => v + " / 5" }
    ];
    const cols = ["#9aa5b1", "#7c8a99", C.amber, C.blue, C.violet, "#a8741c", C.red, "#d26b6b"];
    return K.timeline(env, {
      height: 330,
      legend: "Typical, approximate values for comparison; the qualitative scores follow the Unit II comparison table.",
      stages: crit.map(c => ({ title: c.t, text: c.text, dur: 4 })),
      draw(ctx, st) {
        const { W, i, e } = st, c = crit[i], sm = W < 560;
        const x0 = sm ? 12 : 110, x1 = W - (sm ? 76 : 100);
        MEDIA_CMP.forEach((m, k) => {
          const y = 18 + k * 39, v = m[c.k], f = c.log ? logPos(v, c.log[0], c.log[1]) : v / c.max;
          if (sm) txt(ctx, m.n, x0, y - 2, { align: "left", size: 10.5, weight: "700" }); else txt(ctx, m.n, 12, y + 8, { align: "left", size: 12, weight: "700" });
          const w = Math.max(3, (x1 - x0) * clamp(f, 0, 1) * e), by = sm ? y + 6 : y;
          rr(ctx, x0, by, w, 16, 4); ctx.fillStyle = cols[k]; ctx.fill();
          txt(ctx, c.f(v), x0 + w + 6, by + 8, { align: "left", size: 11, color: C.soft });
        });
      }
    });
  });

  /* ===================== SIMULATIONS ===================== */

  const setCtl = (env, id, v, text) => { const el = env.toolbar.querySelector('[data-id="' + id + '"]'); if (el) el.value = v; const o = env.toolbar.querySelector("#o-" + id); if (o && text !== undefined) o.textContent = text; };

  /* ---------- s-attenuation ---------- */
  const ATT_KEYS = ["utp", "stp", "coax", "mmf", "smf"];
  const attDist = v => Math.pow(10, v / 20); // 0..100 → 1 m .. 100 km
  R("s-attenuation", "sim", "Unit II · Transmission Media", "Attenuation Lab", "Send the same signal over five media and compare how much power survives the distance (typical attenuation values).", env => K.controls(env, {
    height: 300,
    controls: [
      { id: "d", type: "range", label: "Distance", min: 0, max: 100, step: 0.5, value: 40, fmt: v => fmtDist(attDist(v)) },
      { id: "tx", type: "range", label: "Transmit power", min: -10, max: 20, step: 1, value: 0, unit: "dBm" },
      { id: "sens", type: "range", label: "Receiver needs at least", min: -60, max: -10, step: 1, value: -30, unit: "dBm" }
    ],
    compute(s) {
      const d = attDist(s.d);
      return { d, rows: ATT_KEYS.map(k => { const m = L.MEDIA[k], r = L.mediaLoss(k, d), rx = s.tx - r.lossDb; return { k, name: m.name, loss: r.lossDb, delayUs: r.delayUs, rx, pct: 100 * L.dbToRatio(r.lossDb), usable: rx >= s.sens }; }) };
    },
    draw(ctx, s, { W }) {
      const o = s.out, sm = W < 560, x0 = sm ? 12 : 200, x1 = W - (sm ? 90 : 110), maxLoss = 100;
      const thr = s.tx - s.sens, tx = x0 + (x1 - x0) * clamp(thr / maxLoss, 0, 1);
      txt(ctx, "Loss over " + fmtDist(o.d) + " (dB, longer = weaker)", sm ? 12 : x0, 14, { align: "left", size: 11.5, weight: "700", color: C.soft });
      o.rows.forEach((r, k) => {
        const y = 52 + k * 50, w = Math.max(3, (x1 - x0) * clamp(r.loss / maxLoss, 0, 1)), by = sm ? y + 4 : y - 10;
        if (sm) txt(ctx, r.name, x0, y - 14, { align: "left", size: 10.5, weight: "700" }); else wrapText(ctx, r.name, 10, y - 14, 182, 13, { size: 11.5, weight: "700" });
        rr(ctx, x0, by, w, 20, 4); ctx.fillStyle = r.usable ? C.primary : C.red; ctx.fill();
        txt(ctx, (r.loss > 999 ? r.loss.toExponential(1) : r.loss.toFixed(r.loss < 10 ? 2 : 1)) + " dB" + (r.loss > maxLoss ? " ▸" : ""), Math.min(x0 + w + 6, x1 + 4), by + 10, { align: "left", size: 11, color: C.soft });
      });
      line(ctx, tx, 30, tx, 290, C.amber, 1.5, [5, 4]); txt(ctx, "max loss " + thr + " dB", clamp(tx, 50, W - 50), 290, { size: 10, color: C.amber, weight: "700" });
    },
    readout(s) {
      const o = s.out, use = o.rows.filter(r => r.usable).map(r => r.name.split(" (")[0]);
      const pct = p => p >= 0.01 ? p.toPrecision(3) + "%" : p.toExponential(1) + "%";
      return (use.length ? ok("Usable at " + fmtDist(o.d) + ": ") + use.join(", ") + "." : bad("No medium delivers a usable signal at " + fmtDist(o.d) + ".")) +
        '<div class="table-wrap" style="margin:8px 0 0"><table><thead><tr><th>Medium (typical)</th><th>Loss</th><th>Power left</th><th>Received</th><th>Delay</th></tr></thead><tbody>' +
        o.rows.map(r => "<tr><td>" + r.name + "</td><td>" + r.loss.toFixed(2) + " dB</td><td>" + pct(r.pct) + "</td><td>" + (s.tx - r.loss).toFixed(1) + " dBm " + (r.usable ? "✓" : "✕") + "</td><td>" + (r.delayUs < 1000 ? r.delayUs.toFixed(2) + " µs" : (r.delayUs / 1000).toFixed(2) + " ms") + "</td></tr>").join("") + "</tbody></table></div>" +
        note("Loss (dB) = attenuation (dB/km) × length. 3 dB = half the power, 20 dB = 1%. Copper values are at the stated test frequency; real links also add connector losses.");
    }
  }));

  /* ---------- s-twisted ---------- */
  (function () {
    const bits = "1011001110100101", N = noiseArray(33, 600);
    R("s-twisted", "sim", "Unit II · Twisted Pair", "Twisted Pair Noise Lab", "Change the twist rate, the noise level and the shield, and watch the differential receiver's output and SNR.", env => K.controls(env, {
      height: 330,
      controls: [
        { id: "tw", type: "range", label: "Twists per metre", min: 0, max: 60, step: 1, value: 0 },
        { id: "noise", type: "range", label: "Induced noise", min: 0, max: 3, step: 0.1, value: 1.2, unit: "V" },
        { id: "shield", type: "check", label: "Shielded (STP)", value: false }
      ],
      compute(s) {
        const r = L.twistedPairNoise({ noise: s.noise, twistsPerM: s.tw, shielded: !!s.shield }), imb = 1 / (1 + s.tw / 4);
        let errors = 0;
        for (let b = 0; b < bits.length; b++) { const x = (b + 0.5) / bits.length, v = L.sig.nrz(bits, x) / 0.85 + r.residual * smooth(N, x) * 2; if ((v >= 0 ? "1" : "0") !== bits[b]) errors++; }
        return Object.assign({ imb, errors }, r);
      },
      draw(ctx, s, { W }) {
        const o = s.out, LX = W < 560 ? 12 : 130, RX = W - 14, sig = x => L.sig.nrz(bits, x) / 0.85;
        const rows = [["Wire A: +V + noise", C.blue, x => sig(x) + o.perWire * smooth(N, x)], ["Wire B: −V + noise", C.violet, x => -sig(x) + o.perWire * (1 - o.imb) * smooth(N, x)], ["Receiver (A − B) ÷ 2", C.primary, x => sig(x) + o.residual * smooth(N, x) * 2]];
        rows.forEach(([lbl, col, f], k) => {
          const mid = 56 + k * 105 + (W < 560 ? 8 : 0);
          if (W < 560) txt(ctx, lbl, LX, mid - 44, { align: "left", size: 11, weight: "700", color: col }); else wrapText(ctx, lbl, 8, mid - 14, 116, 14, { size: 11.5, weight: "700", color: col });
          line(ctx, LX, mid, RX, mid, "#e3e8ee", 1);
          if (k === 2) for (let b = 0; b <= bits.length; b++) line(ctx, LX + b * (RX - LX) / bits.length, mid - 40, LX + b * (RX - LX) / bits.length, mid + 40, "#eef1f4", 1, [3, 3]);
          ctx.beginPath();
          for (let p = 0; p <= 500; p++) { const x = p / 500, X = LX + x * (RX - LX), Y = mid - clamp(f(x), -2.4, 2.4) * 15; if (p === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
          ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.stroke();
        });
      },
      readout(s) {
        const o = s.out;
        return (o.errors ? bad(o.errors + " bit error" + (o.errors > 1 ? "s" : "") + " at the receiver.") + " The noise on the two wires is unequal, so it does not cancel." : ok("All 16 bits received correctly.") + " The common noise cancels in the differential receiver.") +
          metrics([["Noise on each wire", o.perWire.toFixed(2) + " V", s.shield ? "after the shield" : "unshielded"], ["Residual after subtraction", o.residual.toFixed(3) + " V"], ["SNR at receiver", isFinite(o.snrDb) ? o.snrDb.toFixed(1) + " dB" : "∞"], ["Bit errors", o.errors + " / 16", "", o.errors ? "warn" : "good"]]) +
          note("Simplified teaching model: more twists → the two wires pick up more equal noise (residual ∝ 1 / (1 + twists/4)); the shield passes ~15% of the external field. Real cables are specified by measured crosstalk and noise figures.");
      }
    }));
  })();

  /* ---------- s-coax ---------- */
  R("s-coax", "sim", "Unit II · Coaxial Cable", "Coax Channel Planner", "Fill a cable's spectrum with TV/data channels in broadband mode, or dedicate it to one signal in baseband mode.", env => K.controls(env, {
    height: 260,
    controls: [
      { id: "mode", type: "select", label: "Mode", options: [["broad", "Broadband (FDM)"], ["base", "Baseband"]], value: "broad" },
      { id: "top", type: "select", label: "Cable spectrum", options: [["860", "50 – 860 MHz"], ["1000", "50 – 1000 MHz"], ["1218", "50 – 1218 MHz (DOCSIS 3.1)"]], value: "1000" },
      { id: "cw", type: "select", label: "Channel width", options: [["6", "6 MHz (NTSC)"], ["7", "7 MHz"], ["8", "8 MHz (PAL/DVB-C)"]], value: "8" },
      { id: "req", type: "range", label: "Channels requested", min: 1, max: 220, step: 1, value: 40 },
      { id: "add", type: "button", label: "Add 10 channels", onClick: s => { s.req = Math.min(220, s.req + 10); setCtl(env, "req", s.req, s.req); } }
    ],
    compute(s) {
      const lo = 50, hi = +s.top, w = +s.cw, cap = Math.floor((hi - lo) / w);
      return { lo, hi, w, cap, used: s.mode === "base" ? 1 : Math.min(s.req, cap), over: s.mode === "base" ? 0 : Math.max(0, s.req - cap) };
    },
    draw(ctx, s, { W }) {
      const o = s.out, x0 = 30, x1 = W - 20, base = 200, top = 60, fx = f => x0 + (x1 - x0) * f / 1250;
      line(ctx, x0, base, x1, base, C.ink, 1.5);
      [0, 250, 500, 750, 1000, 1250].forEach(f => { line(ctx, fx(f), base, fx(f), base + 5, C.ink, 1); txt(ctx, f + (f === 1250 ? " MHz" : ""), Math.min(fx(f), W - 30), base + 16, { size: 10, color: C.faint }); });
      ctx.fillStyle = "#f4f6f8"; ctx.fillRect(fx(o.lo), top, fx(o.hi) - fx(o.lo), base - top); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(fx(o.lo), top, fx(o.hi) - fx(o.lo), base - top);
      if (s.mode === "base") {
        rr(ctx, fx(o.lo), top + 10, fx(o.hi) - fx(o.lo), base - top - 10, 4); ctx.fillStyle = C.bSoft; ctx.fill(); ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.stroke();
        txt(ctx, "one signal owns the whole cable", (fx(o.lo) + fx(o.hi)) / 2, (top + base) / 2, { weight: "700", color: C.blue, size: W < 560 ? 11 : 13 });
      } else {
        for (let k = 0; k < o.used; k++) { const f0 = o.lo + k * o.w; ctx.fillStyle = k % 2 ? "#9fbde8" : "#c9dcf4"; ctx.fillRect(fx(f0), top + 10, Math.max(1, fx(f0 + o.w) - fx(f0) - 0.5), base - top - 10); }
        txt(ctx, o.used + " / " + o.cap + " channels used", W / 2, 32, { weight: "700", color: o.over ? C.red : C.blue });
        if (o.over) label(ctx, o.over + " channel" + (o.over > 1 ? "s" : "") + " do not fit", W / 2, 236, { size: 11, color: C.red, border: C.red });
      }
    },
    readout(s) {
      const o = s.out;
      if (s.mode === "base") return "<b>Baseband:</b> the entire " + (o.hi - o.lo) + " MHz is dedicated to a single (usually digital) signal — like 10BASE2/10BASE5 Ethernet on coax. To carry more signals at once you would need broadband (FDM)." + metrics([["Signals carried", "1"], ["Usable spectrum", (o.hi - o.lo) + " MHz"]]);
      return (o.over ? bad("Spectrum full.") + " Only " + o.cap + " channels of " + o.w + " MHz fit between " + o.lo + " and " + o.hi + " MHz." : ok("All requested channels fit.") + " Each channel gets its own frequency range (FDM).") +
        metrics([["Capacity", o.cap + " channels", "⌊(" + o.hi + " − " + o.lo + ") ÷ " + o.w + "⌋"], ["Requested", s.req], ["Spectrum used", (o.used * o.w) + " MHz"], ["Free", ((o.hi - o.lo) - o.used * o.w) + " MHz"]]) +
        note("Guard bands are ignored here; real cable plans also reserve the lower band (5–42/85 MHz) for upstream.");
    }
  }));

  /* ---------- s-fibre ---------- */
  R("s-fibre", "sim", "Unit II · Optical Fibre", "Critical Angle and Numerical Aperture Lab", "Set the core and cladding refractive indices and the angle of incidence; see reflection, refraction and the fibre's acceptance cone.", env => K.controls(env, {
    height: 320, animate: true,
    controls: [
      { id: "n1", type: "range", label: "n core", min: 1.40, max: 1.60, step: 0.005, value: 1.48, fmt: v => v.toFixed(3) },
      { id: "n2", type: "range", label: "n cladding", min: 1.30, max: 1.60, step: 0.005, value: 1.46, fmt: v => v.toFixed(3) },
      { id: "inc", type: "range", label: "Angle of incidence θi", min: 0, max: 89.5, step: 0.5, value: 70, unit: "°" }
    ],
    compute(s) {
      const sn = L.snell(s.n1, s.n2, s.inc), na = Math.sqrt(Math.max(0, s.n1 * s.n1 - s.n2 * s.n2));
      return { sn, crit: sn.critical, na, acc: na >= 1 ? 90 : Math.asin(na) * 180 / Math.PI };
    },
    draw(ctx, s, { W, time }) {
      const o = s.out, ox = W / 2, oy = 160, Lr = Math.min(170, W * 0.42), th = s.inc * Math.PI / 180;
      ctx.fillStyle = "#eaf4f8"; ctx.fillRect(0, 0, W, oy); ctx.fillStyle = "rgba(31,111,209,.12)"; ctx.fillRect(0, oy, W, 320 - oy);
      line(ctx, 0, oy, W, oy, "#7fb3d5", 2);
      txt(ctx, "cladding  n₂ = " + s.n2.toFixed(3), 12, 18, { align: "left", size: 11.5, weight: "700", color: C.soft });
      txt(ctx, "core  n₁ = " + s.n1.toFixed(3), 12, 304, { align: "left", size: 11.5, weight: "700", color: C.blue });
      line(ctx, ox, oy - 110, ox, oy + 120, C.faint, 1, [4, 4]); txt(ctx, "normal", ox + 4, oy - 116, { align: "left", size: 10, color: C.faint });
      const A = { x: ox - Lr * Math.sin(th), y: oy + Lr * Math.cos(th) }, Rf = { x: ox + Lr * Math.sin(th), y: oy + Lr * Math.cos(th) };
      if (o.crit !== null) { const c = o.crit * Math.PI / 180; line(ctx, ox, oy, ox - Lr * Math.sin(c), oy + Lr * Math.cos(c), C.amber, 1.5, [6, 4]); txt(ctx, "θc " + o.crit.toFixed(1) + "°", ox - Lr * Math.sin(c) - 4, oy + Lr * Math.cos(c) + 12, { size: 10.5, color: C.amber, weight: "700" }); }
      line(ctx, A.x, A.y, ox, oy, C.red, 3);
      const tir = o.sn.tir;
      line(ctx, ox, oy, Rf.x, Rf.y, tir ? C.red : "rgba(197,48,48,.3)", tir ? 3 : 1.5);
      let path = [A, { x: ox, y: oy }, Rf];
      if (!tir) { const r = o.sn.refracted * Math.PI / 180, T = { x: ox + Lr * Math.sin(r), y: oy - Lr * Math.cos(r) }; line(ctx, ox, oy, T.x, T.y, C.violet, 3); path = [A, { x: ox, y: oy }, T]; txt(ctx, "refracted " + o.sn.refracted.toFixed(1) + "°", T.x - 4, Math.max(14, T.y - 10), { align: "right", size: 11, weight: "700", color: C.violet }); }
      ctx.beginPath(); ctx.arc(ox, oy, 34, Math.PI / 2, Math.PI / 2 + th); ctx.strokeStyle = C.red; ctx.lineWidth = 1.5; ctx.stroke();
      txt(ctx, "θi " + s.inc.toFixed(1) + "°", ox - 40, oy + 50, { align: "right", size: 11, weight: "700", color: C.red });
      const p = K.pointOnPath(path, (time * 120) % K.pathLen(path)); ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, TAU); ctx.fillStyle = C.amber; ctx.fill();
      label(ctx, tir ? "Total internal reflection" : o.crit === null ? "n₂ ≥ n₁: no TIR possible" : "Refraction — light escapes", W - 110, oy + 140, { size: 11, color: tir ? C.primary : C.red, border: tir ? C.primary : C.red });
    },
    readout(s) {
      const o = s.out;
      if (o.crit === null) return bad("No critical angle.") + " TIR only happens going from a denser to a less dense medium (n₁ > n₂). With n_clad ≥ n_core, light always refracts into the cladding — the fibre cannot guide light." + metrics([["n₁ / n₂", s.n1.toFixed(3) + " / " + s.n2.toFixed(3)], ["Critical angle", "none"], ["NA", "0"]]);
      return (o.sn.tir ? ok("Total internal reflection.") + " θi = " + s.inc + "° is larger than θc, so all the light stays in the core." : bad("Light escapes.") + " θi = " + s.inc + "° is below θc, so the ray refracts into the cladding at " + o.sn.refracted.toFixed(1) + "° (Snell: n₁ sin θ₁ = n₂ sin θ₂).") +
        metrics([["Critical angle θc", o.crit.toFixed(2) + "°", "sin⁻¹(n₂ / n₁)"], ["Numerical aperture", o.na.toFixed(3), "√(n₁² − n₂²)"], ["Acceptance half-angle (air)", o.acc.toFixed(1) + "°", "sin⁻¹(NA)"], ["Max ray angle to axis", (90 - o.crit).toFixed(1) + "°", "inside the core"]]) +
        note("A lower cladding index raises the index contrast: θc falls and the acceptance cone widens (more light is captured, but multi-mode dispersion grows).");
    }
  }));

  /* ---------- s-stripline ---------- */
  R("s-stripline", "sim", "Unit II · Stripline & Microstrip", "Planar Line Impedance Designer", "Adjust strip width, dielectric height and εr to design a 50 Ω microstrip or stripline (IPC-2141 approximations).", env => K.controls(env, {
    height: 300,
    controls: [
      { id: "kind", type: "select", label: "Line", options: [["micro", "Microstrip"], ["strip", "Stripline"]], value: "micro" },
      { id: "w", type: "range", label: "Strip width w", min: 0.05, max: 1.5, step: 0.005, value: 0.3, unit: "mm", fmt: v => v.toFixed(3) },
      { id: "h", type: "range", label: "Dielectric height h", min: 0.05, max: 1.6, step: 0.01, value: 0.16, unit: "mm", fmt: v => v.toFixed(2) },
      { id: "er", type: "range", label: "εr", min: 1, max: 12, step: 0.1, value: 4.4, fmt: v => v.toFixed(1) }
    ],
    compute(s) {
      const t = 0.035, r = s.kind === "micro" ? L.microstripZ0(s.w, s.h, t, s.er) : L.striplineZ0(s.w, 2 * s.h + t, t, s.er);
      const okZ = isFinite(r.z0) && r.z0 > 0;
      return Object.assign({ t, okZ, refl: okZ ? L.reflection(r.z0, 50) : null, vFrac: r.velocity / L.C_LIGHT, psPerMm: 1e9 / r.velocity }, r);
    },
    draw(ctx, s, { W }) {
      const o = s.out, cx = W / 2, sw = clamp(s.w / 1.5 * Math.min(260, W * 0.5), 8, 280), hp = clamp(s.h / 1.6 * 110, 10, 110), bw = Math.min(W - 40, 520);
      let top;
      if (s.kind === "micro") {
        top = 150 - hp;
        ctx.fillStyle = "#e6efd5"; ctx.fillRect(cx - bw / 2, top, bw, hp); ctx.fillStyle = COPPER; ctx.fillRect(cx - bw / 2, top + hp, bw, 7); ctx.fillRect(cx - sw / 2, top - 6, sw, 6);
        txt(ctx, "air", cx, top - 30, { size: 11, color: C.soft });
      } else {
        top = 150 - hp;
        ctx.fillStyle = "#e6efd5"; ctx.fillRect(cx - bw / 2, top, bw, 2 * hp + 6); ctx.fillStyle = COPPER; ctx.fillRect(cx - bw / 2, top - 7, bw, 7); ctx.fillRect(cx - bw / 2, top + 2 * hp + 6, bw, 7); ctx.fillRect(cx - sw / 2, top + hp, sw, 6);
      }
      line(ctx, cx - sw / 2, s.kind === "micro" ? top - 16 : top + hp - 10, cx + sw / 2, s.kind === "micro" ? top - 16 : top + hp - 10, C.ink, 1);
      txt(ctx, "w = " + s.w.toFixed(3) + " mm", cx, s.kind === "micro" ? top - 26 : top + hp - 20, { size: 10.5, weight: "700" });
      const hx = cx + bw / 2 - 14; line(ctx, hx, top, hx, top + hp, C.ink, 1); txt(ctx, "h = " + s.h.toFixed(2) + " mm", hx - 6, top + hp / 2, { align: "right", size: 10.5, weight: "700" });
      txt(ctx, "εr = " + s.er.toFixed(1), cx - bw / 2 + 40, top + hp / 2 + (s.kind === "micro" ? 0 : hp / 2), { size: 10.5, color: "#55723a", weight: "700" });
      const gx0 = 30, gx1 = W - 30, gy = 272, gz = z => gx0 + (gx1 - gx0) * clamp(z, 0, 150) / 150;
      rr(ctx, gx0, gy - 6, gx1 - gx0, 12, 6); ctx.fillStyle = "#eef1f4"; ctx.fill();
      ctx.fillStyle = C.primary; ctx.fillRect(gz(47.5), gy - 6, gz(52.5) - gz(47.5), 12);
      [0, 50, 100, 150].forEach(z => txt(ctx, z + " Ω", gz(z), gy + 18, { size: 10, color: C.faint }));
      if (o.okZ) { ctx.beginPath(); ctx.arc(gz(o.z0), gy, 8, 0, TAU); ctx.fillStyle = Math.abs(o.z0 - 50) <= 2.5 ? C.primary : C.blue; ctx.fill(); label(ctx, "Z₀ = " + o.z0.toFixed(1) + " Ω", clamp(gz(o.z0), 50, W - 50), gy - 22, { size: 11, color: C.blue, border: C.blue }); }
    },
    readout(s) {
      const o = s.out;
      if (!o.okZ) return bad("Outside the formula's range.") + " The strip is too wide for this dielectric height, so the approximation gives no meaningful Z₀. Make the strip narrower or the dielectric thicker.";
      const hit = Math.abs(o.z0 - 50) <= 2.5;
      return (hit ? ok("≈ 50 Ω — matched.") : "<b>Z₀ = " + o.z0.toFixed(1) + " Ω.</b> " + (o.z0 > 50 ? "Widen the strip, thin the dielectric or raise εr to lower it." : "Narrow the strip, thicken the dielectric or lower εr to raise it.")) +
        metrics([["Characteristic impedance", o.z0.toFixed(1) + " Ω"], ["Effective εr", o.eeff.toFixed(2)], ["Signal speed", (o.vFrac * 100).toFixed(1) + "% of c"], ["Delay", o.psPerMm.toFixed(2) + " ps/mm"], ["Reflection into a 50 Ω load", o.refl.reflectedPct.toFixed(1) + "% power", "Γ = " + o.refl.gamma.toFixed(3), o.refl.reflectedPct > 1 ? "warn" : "good"]]) +
        (o.valid ? "" : note("⚠ These dimensions are outside the approximation's accurate range (" + (s.kind === "micro" ? "0.1 < w/h < 2" : "w/b < 0.35") + "); use a field solver for real designs.")) +
        note(s.kind === "micro" ? "Microstrip: Z₀ ≈ 87/√(εr + 1.41) · ln(5.98h / (0.8w + t)), t = 0.035 mm (1 oz copper)." : "Stripline: Z₀ ≈ 60/√εr · ln(4b / (0.67π(0.8w + t))), with ground spacing b = 2h + t (strip centred).");
    }
  }));

  /* ---------- s-wireless ---------- */
  const BANDS = [["1e6", "AM radio · 1 MHz"], ["1e8", "FM radio · 100 MHz"], ["9e8", "GSM · 900 MHz"], ["2.4e9", "Wi-Fi · 2.4 GHz"], ["5e9", "Microwave / Wi-Fi · 5 GHz"], ["2.8e10", "5G mmWave · 28 GHz"], ["3.19e14", "Infrared remote · 940 nm"]];
  // Typical single concrete-wall penetration loss (dB); approximate, varies widely with material.
  const WALL_DB = { "1e6": 2, "1e8": 6, "9e8": 9, "2.4e9": 12, "5e9": 18, "2.8e10": 40, "3.19e14": Infinity };
  const wDist = v => Math.pow(10, 1 + v * 0.04); // 0..100 → 10 m .. 100 km
  R("s-wireless", "sim", "Unit II · Unguided Media", "Wireless Path Loss Lab", "Compare free-space loss across bands, put a wall in the path, and find the tower height needed for a line-of-sight hop.", env => K.controls(env, {
    height: 340, animate: true,
    controls: [
      { id: "f", type: "select", label: "Band", options: BANDS, value: "1e8" },
      { id: "d", type: "range", label: "Distance", min: 0, max: 100, step: 0.5, value: 50, fmt: v => fmtDist(wDist(v)) },
      { id: "h", type: "range", label: "Antenna heights", min: 1, max: 200, step: 1, value: 30, unit: "m" },
      { id: "wall", type: "check", label: "Concrete wall in path", value: false }
    ],
    compute(s) {
      const f = +s.f, dKm = wDist(s.d) / 1000, fs = L.fspl(dKm, f / 1e6), wall = s.wall ? WALL_DB[s.f] : 0, hor = L.radioHorizonKm(s.h, s.h);
      const los = f >= 30e6 && dKm > hor, hNeed = Math.pow(dKm / (2 * 3.57), 2);
      const all = BANDS.map(b => ({ f: b[0], name: b[1], fs: L.fspl(dKm, +b[0] / 1e6), wall: s.wall ? WALL_DB[b[0]] : 0 }));
      return { f, dKm, fs, wall, total: fs + wall, hor, los, hNeed, lambda: L.wavelength(f), all };
    },
    draw(ctx, s, { W, time }) {
      const o = s.out, sm = W < 560, gy = 140, ax = 40, bx = W - 40, hp = 20 + clamp(s.h / 200, 0, 1) * 80;
      line(ctx, 0, gy, W, gy, "#9aa5b1", 2);
      [ax, bx].forEach(x => { line(ctx, x, gy, x, gy - hp, C.nav, 4); ctx.beginPath(); ctx.arc(x, gy - hp, 5, 0, TAU); ctx.fillStyle = C.blue; ctx.fill(); });
      if (o.los) { ctx.beginPath(); ctx.moveTo(ax + 40, gy); ctx.quadraticCurveTo(W / 2, gy - hp * 2.4, bx - 40, gy); ctx.fillStyle = "#eaf2e3"; ctx.fill(); ctx.strokeStyle = "#8aa06e"; ctx.lineWidth = 2; ctx.stroke(); txt(ctx, "Earth's bulge blocks the path", W / 2, gy - 10, { size: 10.5, color: "#55723a", weight: "700" }); }
      if (s.wall) { ctx.fillStyle = "#b9a58a"; ctx.fillRect(W / 2 - 6, gy - hp - 30, 12, hp + 30); }
      const blocked = o.los || o.wall === Infinity, endX = blocked ? (o.los ? W / 2 - 20 : W / 2 - 8) : bx;
      line(ctx, ax, gy - hp, endX, gy - hp, "rgba(31,111,209,.25)", 6);
      for (let k = 0; k < 4; k++) { const x = ax + ((time * 0.35 + k / 4) % 1) * (endX - ax); ctx.beginPath(); ctx.arc(x, gy - hp, 4, 0, TAU); ctx.fillStyle = C.blue; ctx.fill(); }
      if (blocked) txt(ctx, "✕", endX + (o.los ? 0 : -12), gy - hp - 16, { size: 16, weight: "700", color: C.red });
      txt(ctx, fmtDist(o.dKm * 1000), W / 2, gy + 16, { size: 10.5, color: C.soft });
      const x0 = sm ? 12 : 200, x1 = W - 70, by0 = 182, maxDb = 260;
      txt(ctx, "Free-space loss at this distance (+ wall)", sm ? 12 : x0, by0 - 12, { align: "left", size: 11, weight: "700", color: C.soft });
      o.all.forEach((b, k) => {
        const y = by0 + k * 22, cur = b.f === s.f, tot = b.fs + b.wall, w = (x1 - x0) * clamp((isFinite(tot) ? tot : maxDb) / maxDb, 0, 1);
        if (!sm) txt(ctx, b.name, 12, y + 6, { align: "left", size: 10.5, weight: cur ? "700" : "400", color: cur ? C.ink : C.soft });
        rr(ctx, x0, y, Math.max(2, w), 13, 3); ctx.fillStyle = !isFinite(tot) ? C.red : cur ? C.blue : "#b0cdef"; ctx.fill();
        txt(ctx, isFinite(tot) ? tot.toFixed(0) + " dB" : "blocked", x0 + w + 5, y + 6, { align: "left", size: 10, color: C.soft });
        if (sm && cur) txt(ctx, b.name, x0 + 4, y + 6, { align: "left", size: 9.5, weight: "700", color: "#fff" });
      });
    },
    readout(s) {
      const o = s.out, ir = s.f === "3.19e14", lam = o.lambda >= 1 ? o.lambda.toFixed(1) + " m" : o.lambda >= 1e-3 ? (o.lambda * 1000).toFixed(1) + " mm" : (o.lambda * 1e9).toFixed(0) + " nm";
      let verdict;
      if (o.wall === Infinity) verdict = bad("Blocked.") + " Infrared cannot pass through walls — it stays in the room.";
      else if (o.los) verdict = bad("Beyond line of sight.") + " At " + o.dKm.toFixed(1) + " km the Earth's curve blocks the path; with " + s.h + " m towers the horizon limit is " + o.hor.toFixed(1) + " km. Raise both antennas to ≈ " + Math.ceil(o.hNeed) + " m or add a repeater.";
      else verdict = ok("Path open.") + " Total loss " + o.total.toFixed(1) + " dB." + (+s.f < 30e6 ? " (Below 30 MHz, ground and sky waves can also reach beyond the horizon.)" : "");
      return verdict +
        metrics([["Wavelength", lam], ["Free-space path loss", o.fs.toFixed(1) + " dB"], ["Wall loss (typical)", o.wall === Infinity ? "blocked" : o.wall + " dB"], ["Line-of-sight limit", o.hor.toFixed(1) + " km", "3.57(√h₁ + √h₂)"], ["Height needed for this hop", Math.ceil(o.hNeed) + " m each", "equal towers"]]) +
        (ir && o.dKm > 0.01 ? note("Infrared links (remotes, IrDA) work only over a few metres in practice: weak LED power and ambient light swamp the signal long before free-space loss matters.") : "") +
        note("FSPL = 20 log₁₀(d km) + 20 log₁₀(f MHz) + 32.44. Ten times the frequency → 20 dB more loss. Wall losses are typical values for one concrete wall and vary widely.");
    }
  }));

  /* ---------- s-satellite ---------- */
  const ALT_MIN = 160, ALT_MAX = 40000;
  const altFromV = v => ALT_MIN * Math.pow(ALT_MAX / ALT_MIN, v / 1000), vFromAlt = a => Math.round(1000 * Math.log(a / ALT_MIN) / Math.log(ALT_MAX / ALT_MIN));
  R("s-satellite", "sim", "Unit II · Satellite", "Orbit and Delay Calculator", "Pick an altitude and see the orbital period, coverage and signal delay — drawn to scale.", env => K.controls(env, {
    height: 320, animate: true,
    controls: [
      { id: "preset", type: "select", label: "Preset", options: [["780", "Iridium LEO · 780 km"], ["550", "Starlink LEO · 550 km"], ["20200", "GPS MEO · 20,200 km"], ["35786", "GEO · 35,786 km"], ["custom", "Custom (slider)"]], value: "35786" },
      { id: "altv", type: "range", label: "Altitude", min: 0, max: 1000, step: 1, value: vFromAlt(35786), fmt: v => Math.round(altFromV(v)).toLocaleString() + " km" }
    ],
    onChange(s, id) {
      if (id === "altv") { s.preset = "custom"; setCtl(env, "preset", "custom"); }
      if (id === "preset" && s.preset !== "custom") { s.altv = vFromAlt(+s.preset); setCtl(env, "altv", s.altv, Number(s.preset).toLocaleString() + " km"); }
    },
    compute(s) {
      const alt = s.preset !== "custom" ? +s.preset : altFromV(s.altv), o = L.orbit(alt);
      const cls = alt < 2000 ? "LEO" : Math.abs(alt - 35786) < 200 ? "GEO" : alt < 35786 ? "MEO" : "above GEO";
      const half = o.coverageDeg / 2 * Math.PI / 180;
      return Object.assign({ alt, cls, capPct: (1 - Math.cos(half)) / 2 * 100, sync: Math.abs(o.period - 86164) < 600 }, o);
    },
    draw(ctx, s, { W, time }) {
      const o = s.out, cx = W / 2, cy = 160, ro = Math.min(140, W / 2 - 24), re = ro * L.EARTH_R / (L.EARTH_R + o.alt);
      ctx.beginPath(); ctx.arc(cx, cy, ro, 0, TAU); ctx.strokeStyle = C.line; ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(cx, cy, re, 0, TAU); ctx.fillStyle = "#dcecf9"; ctx.fill(); ctx.strokeStyle = C.blue; ctx.lineWidth = 1.5; ctx.stroke();
      const simMin = time * 30, wE = simMin * 60 / 86164 * TAU, wS = simMin * 60 / o.period * TAU;
      const gs = { x: cx + Math.cos(wE) * re, y: cy + Math.sin(wE) * re }, S = { x: cx + Math.cos(wS) * ro, y: cy + Math.sin(wS) * ro };
      const half = o.coverageDeg / 2 * Math.PI / 180;
      ctx.beginPath(); ctx.moveTo(S.x, S.y); ctx.arc(cx, cy, re, wS - half, wS + half); ctx.closePath(); ctx.fillStyle = "rgba(183,121,31,.18)"; ctx.fill();
      ctx.beginPath(); ctx.arc(gs.x, gs.y, 4, 0, TAU); ctx.fillStyle = C.primary; ctx.fill();
      ctx.fillStyle = C.nav; ctx.fillRect(S.x - 4, S.y - 4, 8, 8); ctx.fillStyle = C.blue; ctx.fillRect(S.x - 12, S.y - 2, 7, 4); ctx.fillRect(S.x + 5, S.y - 2, 7, 4);
      txt(ctx, "to scale · view from above the North Pole · 1 s = 30 min", W / 2, 312, { size: 10, color: C.faint });
      if (o.sync) label(ctx, "satellite stays above the ground station", W / 2, 20, { size: 11, color: C.primary, border: C.primary });
    },
    readout(s) {
      const o = s.out, per = o.period >= 7200 ? (o.period / 3600).toFixed(2) + " h" : o.periodMin.toFixed(1) + " min";
      return "<b>" + o.cls + "</b> at " + Math.round(o.alt).toLocaleString() + " km. " + (o.sync ? ok("Geosynchronous:") + " one orbit equals one sidereal day (23.93 h), so over the equator it appears fixed in the sky — a dish can point at it permanently." : "The satellite moves across the sky, so ground terminals must track it or hand over between satellites.") +
        metrics([["Orbital period", per, "T = 2π√(a³/μ)"], ["Ground → sat → ground", o.upDownMs.toFixed(1) + " ms", "minimum (overhead)"], ["Conversation round trip", o.rttMs.toFixed(1) + " ms", "question + reply"], ["Visible Earth surface", o.capPct.toFixed(1) + "%", "at 0° elevation"]]) +
        note("Delays assume the satellite is directly overhead; at low elevation angles the slant range is longer. Processing and terrestrial delays are not included.");
    }
  }));

  /* ---------- s-5g ---------- */
  const NET_PROFILES = {
    slide: { n: "Slide table values", g4: [1e9, 50], g5: [2.5e9, 1] },
    peak: { n: "Peak targets (ITU)", g4: [1e9, 50], g5: [20e9, 1] },
    typical: { n: "Typical real-world (approx.)", g4: [30e6, 50], g5: [300e6, 15] }
  };
  R("s-5g", "sim", "Unit II · 4G and 5G", "4G vs 5G Download Race", "Compare total time = latency + size ÷ speed for large and tiny transfers on 4G and 5G.", env => K.controls(env, {
    height: 230,
    controls: [
      { id: "size", type: "select", label: "Transfer", options: [["1e3", "Control message · 1 kB"], ["5e6", "Photo · 5 MB"], ["2e9", "Game · 2 GB"], ["5e10", "8K movie · 50 GB"]], value: "2e9" },
      { id: "prof", type: "select", label: "Speeds", options: Object.keys(NET_PROFILES).map(k => [k, NET_PROFILES[k].n]), value: "slide" }
    ],
    compute(s) {
      const p = NET_PROFILES[s.prof], b = +s.size;
      const mk = ([rate, lat]) => ({ rate, lat, total: L.transferTime(b, rate, lat), xfer: b * 8 / rate });
      return { g4: mk(p.g4), g5: mk(p.g5) };
    },
    draw(ctx, s, { W }) {
      const o = s.out, sm = W < 560, x0 = sm ? 12 : 90, x1 = W - (sm ? 80 : 110), max = Math.max(o.g4.total, o.g5.total);
      [["4G", o.g4, C.amber], ["5G", o.g5, C.primary]].forEach(([n, g, col], k) => {
        const y = 50 + k * 80, wl = (x1 - x0) * (g.lat / 1000) / max, wx = (x1 - x0) * g.xfer / max;
        txt(ctx, n, sm ? x0 : 20, sm ? y - 26 : y, { align: "left", weight: "800", size: 16, color: col });
        rr(ctx, x0, y - 13, Math.max(2, wl), 26, 3); ctx.fillStyle = "#cbd2d9"; ctx.fill();
        rr(ctx, x0 + wl, y - 13, Math.max(2, wx), 26, 3); ctx.fillStyle = col; ctx.fill();
        txt(ctx, fmtT(g.total), x0 + wl + wx + 8, y, { align: "left", size: 12, weight: "700" });
      });
      rr(ctx, x0, 196, 14, 10, 2); ctx.fillStyle = "#cbd2d9"; ctx.fill(); txt(ctx, "latency", x0 + 20, 201, { align: "left", size: 10.5, color: C.soft });
      rr(ctx, x0 + 90, 196, 14, 10, 2); ctx.fillStyle = C.blue; ctx.fill(); txt(ctx, "size ÷ speed", x0 + 110, 201, { align: "left", size: 10.5, color: C.soft });
    },
    readout(s) {
      const o = s.out, saved = o.g4.total - o.g5.total, latShare = g => g.lat / 1000 / g.total * 100;
      const dom = latShare(o.g4) > 50 ? "For this small transfer, <b>latency dominates</b> — speed hardly matters." : "For this large transfer, <b>bandwidth dominates</b> — latency is negligible.";
      return "5G saves <b>" + fmtT(Math.max(0, saved)) + "</b> (" + (o.g4.total / o.g5.total).toFixed(1) + "× faster). " + dom +
        metrics([["4G", fmtRate(o.g4.rate) + " · " + o.g4.lat + " ms", "total " + fmtT(o.g4.total)], ["5G", fmtRate(o.g5.rate) + " · " + o.g5.lat + " ms", "total " + fmtT(o.g5.total)], ["Latency share (4G)", latShare(o.g4).toFixed(1) + "%"], ["Latency share (5G)", latShare(o.g5).toFixed(1) + "%"]]) +
        note("Total time = latency + size × 8 ÷ speed (one request, no protocol overhead). Remote surgery or vehicle control sends small messages, so the ~1 ms latency of 5G URLLC matters more than peak speed.");
    }
  }));

  /* ---------- s-iot ---------- */
  const IOT_TECH = {
    ble: { n: "Bluetooth LE", range: 50, rate: 1e6, power: "Very low", use: "wearables, beacons" },
    zigbee: { n: "Zigbee (802.15.4)", range: 100, rate: 250e3, power: "Very low", use: "smart-home sensors (mesh extends range)" },
    wifi: { n: "Wi-Fi", range: 50, rate: 100e6, power: "High", use: "cameras, smart TVs" },
    lora: { n: "LoRaWAN", range: 15000, rate: 5.5e3, power: "Very low", use: "agriculture, metering (2–5 km urban, up to ~15 km rural)" },
    nbiot: { n: "NB-IoT / LTE-M", range: 10000, rate: 60e3, power: "Low", use: "smart meters, trackers (needs cellular coverage)" }
  };
  const iotDist = v => Math.pow(10, v / 100 * 4.3); // 1 m .. ~20 km
  R("s-iot", "sim", "Unit II · IoT", "Smart Fan IoT Lab", "A temperature sensor drives a fan through gateway and cloud; change the temperature, threshold, connectivity and distance.", env => K.controls(env, {
    height: 300, animate: true,
    controls: [
      { id: "temp", type: "range", label: "Room temperature", min: 15, max: 45, step: 0.5, value: 26, unit: "°C" },
      { id: "thr", type: "range", label: "Fan threshold", min: 20, max: 40, step: 0.5, value: 28, unit: "°C" },
      { id: "tech", type: "select", label: "Connectivity", options: Object.keys(IOT_TECH).map(k => [k, IOT_TECH[k].n]), value: "wifi" },
      { id: "dist", type: "range", label: "Sensor → gateway", min: 0, max: 100, step: 0.5, value: 30, fmt: v => fmtDist(iotDist(v)) }
    ],
    compute(s) {
      const tk = IOT_TECH[s.tech], d = iotDist(s.dist), inRange = d <= tk.range;
      return { tk, d, inRange, fan: inRange && s.temp > s.thr, airtime: 20 * 8 / tk.rate };
    },
    draw(ctx, s, { W, time }) {
      const o = s.out, sm = W < 560;
      const P = { sensor: { x: W * 0.1 + 10, y: 230 }, gw: { x: W * 0.4, y: 230 }, cloud: { x: W * 0.62, y: 70 }, app: { x: W * 0.88, y: 70 }, fan: { x: W * 0.88, y: 230 } };
      shape(ctx, "sensor", P.sensor.x, P.sensor.y, {}); txt(ctx, s.temp.toFixed(1) + " °C", P.sensor.x, P.sensor.y - 30, { size: 11.5, weight: "700", color: s.temp > s.thr ? C.red : C.blue });
      K.device(ctx, "router", P.gw.x, P.gw.y, {}); txt(ctx, "gateway", P.gw.x, P.gw.y + 34, { size: 11, weight: "600" });
      K.device(ctx, "cloud", P.cloud.x, P.cloud.y, {}); txt(ctx, "cloud", P.cloud.x, P.cloud.y + 36, { size: 11, weight: "600" });
      shape(ctx, "phone", P.app.x, P.app.y - 6, {}); txt(ctx, o.inRange ? s.temp.toFixed(1) + " °C" : "no data", P.app.x, P.app.y + 26, { size: 10.5, weight: "700", color: o.inRange ? C.ink : C.red });
      line(ctx, P.sensor.x + 18, P.sensor.y, P.gw.x - 22, P.gw.y, o.inRange ? C.primary : C.red, 2, [5, 4]);
      txt(ctx, (sm ? "" : o.tk.n + " · ") + fmtDist(o.d), (P.sensor.x + P.gw.x) / 2, P.sensor.y + 18, { size: 10, color: o.inRange ? C.soft : C.red, weight: "600" });
      line(ctx, P.gw.x, P.gw.y - 22, P.cloud.x - 10, P.cloud.y + 18, C.line, 2); line(ctx, P.cloud.x + 30, P.cloud.y, P.app.x - 22, P.app.y, C.line, 2); line(ctx, P.cloud.x + 10, P.cloud.y + 22, P.fan.x - 18, P.fan.y - 18, C.line, 2);
      const k = (time * 0.4) % 1, up = [P.sensor, P.gw, { x: P.cloud.x, y: P.cloud.y + 16 }];
      if (o.inRange) { const p = K.pointOnPath(up, K.pathLen(up) * k); ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, TAU); ctx.fillStyle = C.primary; ctx.fill(); }
      else { const mx = (P.sensor.x + P.gw.x) / 2; const p = K.pointOnPath([P.sensor, { x: mx, y: P.sensor.y }], (mx - P.sensor.x) * k); ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, TAU); ctx.fillStyle = C.red; ctx.fill(); txt(ctx, "✕ out of range", mx, P.sensor.y - 18, { size: 11, weight: "700", color: C.red }); }
      ctx.save(); ctx.translate(P.fan.x, P.fan.y); ctx.rotate(o.fan ? time * 12 : 0);
      for (let j = 0; j < 3; j++) { ctx.rotate(TAU / 3); ctx.beginPath(); ctx.ellipse(0, -10, 5, 11, 0, 0, TAU); ctx.fillStyle = o.fan ? C.primary : C.faint; ctx.fill(); }
      ctx.restore(); txt(ctx, "fan " + (o.fan ? "ON" : "OFF"), P.fan.x, P.fan.y + 28, { size: 11.5, weight: "700", color: o.fan ? C.primary : C.soft });
      txt(ctx, "perception → network → processing → application / actuator", W / 2, 292, { size: 10, color: C.faint });
    },
    readout(s) {
      const o = s.out;
      const status = !o.inRange ? bad("No data reaches the cloud.") + " " + fmtDist(o.d) + " is beyond the typical range of " + o.tk.n + " (~" + fmtDist(o.tk.range) + "). Move the gateway closer or choose a longer-range technology."
        : o.fan ? ok("Fan ON.") + " " + s.temp + " °C > threshold " + s.thr + " °C: the cloud rule sends a command down to the actuator." : "<b>Fan OFF.</b> " + s.temp + " °C ≤ threshold " + s.thr + " °C, so the rule does not fire.";
      return status + metrics([["Typical range", "~" + fmtDist(o.tk.range)], ["Data rate", fmtRate(o.tk.rate)], ["Power use", o.tk.power, "", o.tk.power === "High" ? "warn" : "good"], ["Airtime for 20-byte reading", fmtT(o.airtime), "payload only"]]) +
        note("Typical values from the IoT connectivity table: " + o.tk.n + " — " + o.tk.use + ". For soil sensors spread over a 5 km farm, a low-power wide-area network such as LoRaWAN fits best.");
    }
  }));

  /* ---------- s-secure ---------- */
  const TAP = {
    wifi: { n: "Wi-Fi (radio)", how: "listened from outside the building with a laptop — no physical access needed", detect: "Undetectable: passive listening leaves no trace." },
    copper: { n: "Copper (UTP / coax)", how: "spliced a tap (T-joint) into the cable in an unlocked cabinet", detect: "Hard to detect without physical inspection." },
    fibre: { n: "Optical fibre", how: "clipped a bend into the fibre to leak a little light", detect: "Detectable: the receiver's optical power dropped — intrusion monitoring can raise an alarm." }
  };
  const hex = u8 => Array.from(u8).map(b => b.toString(16).padStart(2, "0").toUpperCase());
  R("s-secure", "sim", "Unit II · Secure Media", "Eavesdropping and Encryption Lab", "Send a message over Wi-Fi, copper or fibre with encryption on or off, and see exactly what an eavesdropper captures (real AES-GCM in your browser).", env => {
    const can = !!(window.crypto && crypto.subtle);
    let seq = 0;
    function send(s) {
      const my = ++seq, data = new TextEncoder().encode(s.msg || "");
      s.res = null;
      if (s.enc !== "aes") { s.res = { wire: data, plain: s.msg || "" }; return Promise.resolve(); }
      if (!can) { s.res = { error: "Web Crypto is not available in this browser context (it needs https:// or localhost), so encryption cannot be demonstrated here." }; return Promise.resolve(); }
      const iv = crypto.getRandomValues(new Uint8Array(12));
      return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]).then(key =>
        crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data).then(ct => crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct).then(pt => {
          if (my !== seq) return;
          s.res = { wire: new Uint8Array(ct), iv, plain: new TextDecoder().decode(pt) };
        }))
      ).catch(err => { if (my === seq) s.res = { error: "Encryption failed: " + err.message }; });
    }
    function stageHtml(s) {
      const r = s.res, tp = TAP[s.medium];
      if (!r) return '<div class="lab"><div class="lab-row"><span class="lab-tag">Encrypting…</span></div></div>';
      if (r.error) return '<div class="lab"><div class="lab-row"><span class="lab-tag">Encryption unavailable</span><div class="lab-out bad">' + escapeHtml(r.error) + "</div></div></div>";
      const enc = s.enc === "aes", bytes = hex(r.wire), shown = bytes.slice(0, 32);
      const cap = enc ? bytes.slice(0, 16).join(" ") + (bytes.length > 16 ? " …" : "") : escapeHtml(s.msg || "");
      return '<div class="lab">' +
        '<div class="lab-row"><span class="lab-tag">Sender</span><div class="lab-out ok">' + escapeHtml(s.msg || "—") + "</div></div>" +
        '<div class="lab-row"><span class="lab-tag">On the medium: ' + tp.n + " (" + bytes.length + " bytes" + (enc ? ", ciphertext + 16-byte auth tag" : ", plaintext") + ")</span>" +
        '<div class="byte-row">' + shown.map(b => '<span class="byte' + (enc ? "" : " bad") + '"><code>' + b + "</code></span>").join("") + (bytes.length > 32 ? '<span class="byte"><code>…</code></span>' : "") + "</div></div>" +
        '<div class="lab-arrow">Eavesdropper ' + tp.how + "</div>" +
        '<div class="lab-row"><span class="lab-tag">Attacker captured</span><div class="lab-out ' + (enc ? "ok" : "bad") + '" style="font-family:var(--mono);word-break:break-all">' + cap + "</div></div>" +
        '<div class="lab-row"><span class="lab-tag">Receiver' + (enc ? " (decrypts with the shared key)" : "") + '</span><div class="lab-out ok">' + escapeHtml(r.plain) + "</div></div></div>";
    }
    function readoutHtml(s) {
      const r = s.res, tp = TAP[s.medium];
      if (!r || r.error) return r && r.error ? bad("Not available.") + " " + escapeHtml(r.error) : "Working…";
      const enc = s.enc === "aes";
      return (enc ? ok("Confidential.") + " The attacker holds only AES-256-GCM ciphertext; without the key it is unreadable, and any change would fail the authentication tag." : bad("Exposed.") + " The attacker reads the message in plain text.") +
        metrics([["Medium", tp.n], ["Tap detectable?", s.medium === "fibre" ? "Yes (power drop)" : "No", "", s.medium === "fibre" ? "good" : "warn"], ["Attacker can read?", enc ? "No" : "Yes", "", enc ? "good" : "warn"]]) +
        note(tp.detect + (s.medium === "fibre" && !enc ? " Fibre is harder to tap, but the leaked light still carries readable data — always encrypt." : "") + (enc ? " A fresh random key and 96-bit IV were generated in your browser for this send." : ""));
    }
    function rerender(s) { env.stage.innerHTML = stageHtml(s); env.info.innerHTML = readoutHtml(s); }
    return K.controls(env, {
      dom: true,
      controls: [
        { id: "msg", type: "text", label: "Message", value: "Exam marks: 92", max: 40, width: 160 },
        { id: "medium", type: "select", label: "Medium", options: [["wifi", "Wi-Fi"], ["copper", "Copper cable"], ["fibre", "Optical fibre"]], value: "wifi" },
        { id: "enc", type: "select", label: "Encryption", options: [["off", "Off"], ["aes", "AES-256-GCM"]], value: "off" },
        { id: "send", type: "button", label: "Send again", icon: "send", primary: true, onClick: s => { send(s).then(() => rerender(s)); } }
      ],
      init(s) { send(s).then(() => rerender(s)); },
      onChange(s) { send(s).then(() => rerender(s)); },
      dom(stage, s) { stage.innerHTML = stageHtml(s); },
      readout(s) { return readoutHtml(s); }
    });
  });

  /* ---------- s-linkbudget ---------- */
  R("s-linkbudget", "sim", "Unit II · High-Speed Optical", "Optical Link Budget Calculator", "Find how far a fibre link can reach with a 3 dB margin, and how an EDFA extends it.", env => K.controls(env, {
    height: 300,
    controls: [
      { id: "fib", type: "select", label: "Fibre", options: [["0.2", "SMF 1550 nm · 0.2 dB/km"], ["0.35", "SMF 1310 nm · 0.35 dB/km"], ["3", "MMF 850 nm · 3 dB/km"]], value: "0.2" },
      { id: "tx", type: "range", label: "Laser power", min: -10, max: 10, step: 0.5, value: 0, unit: "dBm" },
      { id: "km", type: "range", label: "Length", min: 1, max: 300, step: 1, value: 80, unit: "km" },
      { id: "con", type: "range", label: "Connectors", min: 0, max: 10, step: 1, value: 2 },
      { id: "spl", type: "range", label: "Splices", min: 0, max: 40, step: 1, value: 0 },
      { id: "amp", type: "select", label: "EDFA gain", options: [["0", "No amplifier"], ["10", "+10 dB"], ["15", "+15 dB"], ["20", "+20 dB"], ["25", "+25 dB"], ["30", "+30 dB"]], value: "0" },
      { id: "sens", type: "range", label: "Rx sensitivity", min: -34, max: -10, step: 1, value: -24, unit: "dBm" }
    ],
    compute(s) {
      const dpk = +s.fib, gain = +s.amp, lb = L.linkBudget({ txDbm: s.tx, dbPerKm: dpk, km: s.km, connectors: s.con, splices: s.spl, sensitivityDbm: s.sens, ampGainDb: gain });
      const maxKm = Math.max(0, (s.tx + gain - 0.5 * s.con - 0.1 * s.spl - s.sens - 3) / dpk);
      return Object.assign({ dpk, gain, maxKm }, lb);
    },
    draw(ctx, s, { W }) {
      const o = s.out, x0 = 50, x1 = W - 20, y0 = 30, y1 = 260, span = Math.max(s.km * 1.15, 5);
      const X = km => x0 + (x1 - x0) * km / span, top = Math.max(10, s.tx + o.gain), bot = Math.min(-40, o.rxDbm - 5), Y = d => y0 + (top - d) / (top - bot) * (y1 - y0);
      for (let d = Math.ceil(bot / 10) * 10; d <= top; d += 10) { line(ctx, x0, Y(d), x1, Y(d), "#eef1f4", 1); txt(ctx, d + "", x0 - 6, Y(d), { align: "right", size: 9.5, color: C.faint }); }
      txt(ctx, "dBm", x0 - 6, y0 - 14, { align: "right", size: 9.5, color: C.faint });
      line(ctx, x0, Y(s.sens), x1, Y(s.sens), C.red, 1.2, [5, 4]); txt(ctx, "sensitivity", x1, Y(s.sens) + 11, { align: "right", size: 10, color: C.red });
      line(ctx, x0, Y(s.sens + 3), x1, Y(s.sens + 3), C.amber, 1, [2, 3]); txt(ctx, "+3 dB margin", x1, Y(s.sens + 3) - 9, { align: "right", size: 10, color: C.amber });
      const lump = 0.5 * s.con + 0.1 * s.spl, p0 = s.tx - lump, mid = s.km / 2;
      const pts = [{ x: X(0), y: Y(s.tx) }, { x: X(0), y: Y(p0) }];
      if (o.gain) { pts.push({ x: X(mid), y: Y(p0 - o.dpk * mid) }, { x: X(mid), y: Y(p0 - o.dpk * mid + o.gain) }); }
      pts.push({ x: X(s.km), y: Y(o.rxDbm) });
      ctx.beginPath(); pts.forEach((p, k) => k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.strokeStyle = o.ok ? C.primary : C.red; ctx.lineWidth = 2.5; ctx.stroke();
      if (o.gain) label(ctx, "EDFA +" + o.gain, X(mid), Y(p0 - o.dpk * mid + o.gain) - 14, { size: 10, color: C.blue, border: C.blue });
      ctx.beginPath(); ctx.arc(X(s.km), Y(o.rxDbm), 6, 0, TAU); ctx.fillStyle = o.ok ? C.primary : C.red; ctx.fill();
      [0, 0.25, 0.5, 0.75, 1].forEach(f => txt(ctx, Math.round(span * f) + (f === 1 ? " km" : ""), Math.min(X(span * f), W - 26), y1 + 16, { size: 10, color: C.faint }));
    },
    readout(s) {
      const o = s.out;
      return (o.ok ? ok("Link works.") + " Received " + o.rxDbm.toFixed(1) + " dBm leaves a " + o.marginDb.toFixed(1) + " dB margin." : bad(o.marginDb < 0 ? "Link fails." : "Margin too small.") + " Received " + o.rxDbm.toFixed(1) + " dBm; margin " + o.marginDb.toFixed(1) + " dB (needs ≥ 3 dB).") +
        metrics([["Fibre loss", (o.dpk * s.km).toFixed(1) + " dB"], ["Connectors + splices", (0.5 * s.con + 0.1 * s.spl).toFixed(1) + " dB", "0.5 dB / 0.1 dB each"], ["Total loss", o.lossDb.toFixed(1) + " dB"], ["Max reach (3 dB margin)", o.maxKm.toFixed(1) + " km", "", o.maxKm >= s.km ? "good" : "warn"]]) +
        note("Rx power = Tx − fibre loss − connector/splice loss + amplifier gain. Losses are drawn lumped at the start and the EDFA at mid-span (ideal gain; real EDFAs also have a maximum output power and add noise)." +
          (s.fib === "3" ? " For multi-mode fibre, <b>modal dispersion</b> limits reach even more than loss — e.g. 10GBASE-SR reaches only ~300 m on OM3 fibre." : ""));
    }
  }));

  /* ---------- s-mediapick ---------- */
  const PICK = [
    { n: "UTP Cat 6A", dist: () => 100, rate: 10e9, cost: 1, cable: true, emiOk: false },
    { n: "STP (Cat 6A/7)", dist: () => 100, rate: 10e9, cost: 2, cable: true, emiOk: true },
    { n: "Coaxial cable", dist: () => 500, rate: 1e9, cost: 2, cable: true, emiOk: true },
    { n: "Multi-mode fibre", dist: r => r <= 1e8 ? 2000 : r <= 1e9 ? 550 : r <= 1e10 ? 300 : 100, rate: 100e9, cost: 3, cable: true, emiOk: true, tapSafe: true },
    { n: "Single-mode fibre", dist: () => 2e7, rate: 1e12, cost: 3, cable: true, emiOk: true, tapSafe: true, note: "amplifiers every ~80 km on long routes" },
    { n: "Microwave link", dist: () => 2e6, rate: 1e9, cost: 3, wireless: true, emiOk: true, note: "line of sight; repeaters every ~50 km" },
    { n: "Radio / cellular (Wi-Fi, 4G/5G)", dist: () => 10000, rate: 1e9, cost: 2, wireless: true, mobile: true, emiOk: true, note: "per cell / access point" },
    { n: "Satellite", dist: () => 2e7, rate: 1e8, cost: 4, wireless: true, mobile: true, emiOk: true, remote: true, note: "high latency for GEO" },
    { n: "Infrared", dist: () => 5, rate: 4e6, cost: 1, wireless: true, emiOk: true, tapSafe: true, note: "same room only" }
  ];
  const pickDist = v => Math.pow(10, v / 100 * 7.3); // 1 m .. 20,000 km
  R("s-mediapick", "sim", "Unit II · Comparison", "Choose a Transmission Medium", "Describe the application and see which media meet each requirement, with the reasons (typical capabilities).", env => K.controls(env, {
    dom: true,
    controls: [
      { id: "d", type: "range", label: "Distance", min: 0, max: 100, step: 0.1, value: 24.4, fmt: v => fmtDist(pickDist(v)) },
      { id: "rate", type: "select", label: "Data rate", options: [["1e6", "1 Mbit/s"], ["1e8", "100 Mbit/s"], ["1e9", "1 Gbit/s"], ["1e10", "10 Gbit/s"], ["1e11", "100 Gbit/s"]], value: "1e9" },
      { id: "budget", type: "select", label: "Budget", options: [["low", "Low"], ["medium", "Medium"], ["high", "High"]], value: "low" },
      { id: "env", type: "select", label: "Environment", options: [["office", "Office / campus"], ["emi", "Heavy EMI (factory)"], ["terrain", "River or hills — no cable route"], ["ocean", "Ships / remote areas"]], value: "office" },
      { id: "mobile", type: "check", label: "Users are moving", value: false },
      { id: "secure", type: "check", label: "Sensitive data", value: false }
    ],
    compute(s) {
      const d = pickDist(s.d), rate = +s.rate, maxCost = s.budget === "low" ? 3 : s.budget === "medium" ? 4 : 5;
      const rows = PICK.map(m => {
        const fails = [], warns = [];
        if (d > m.dist(rate)) fails.push("reach ~" + fmtDist(m.dist(rate)) + (m.n === "Multi-mode fibre" ? " at this rate" : ""));
        if (rate > m.rate) fails.push("max ~" + fmtRate(m.rate));
        if (s.mobile && !m.mobile) fails.push("no mobility");
        if (s.env === "emi" && !m.emiOk) fails.push("noise-prone near motors");
        if (s.env === "terrain" && m.cable) fails.push("cable cannot be laid");
        if (s.env === "ocean" && !m.remote) fails.push("no infrastructure there");
        if (m.cost > maxCost) fails.push("too costly for budget");
        if (s.secure && m.wireless && !m.tapSafe) warns.push("broadcast — must encrypt");
        if (s.secure && m.cable && !m.tapSafe) warns.push("tappable — encrypt");
        if (m.note) warns.push(m.note);
        return { m, fails, warns, ok: !fails.length };
      });
      const passing = rows.filter(r => r.ok).sort((a, b) => a.m.cost - b.m.cost || a.m.rate - b.m.rate);
      return { d, rows, best: passing[0] || null, n: passing.length };
    },
    dom(stage, s) {
      const o = s.out;
      stage.innerHTML = '<div class="lab"><div class="lab-row"><span class="lab-tag">Recommendation</span><div class="lab-out ' + (o.best ? "ok" : "bad") + '">' + (o.best ? escapeHtml(o.best.m.n) : "No medium meets every requirement") + "</div></div>" +
        '<div class="table-wrap"><table><thead><tr><th>Medium</th><th>Verdict</th><th>Why</th></tr></thead><tbody>' +
        o.rows.map(r => "<tr><td>" + escapeHtml(r.m.n) + "</td><td>" + (r.ok ? '<b style="color:var(--primary)">✓ suitable</b>' : '<b style="color:var(--red)">✕</b>') + "</td><td>" + escapeHtml(r.fails.concat(r.warns).join("; ") || "meets all requirements") + "</td></tr>").join("") +
        "</tbody></table></div></div>";
    },
    readout(s) {
      const o = s.out;
      return (o.best ? ok(o.best.m.n) + " is the cheapest medium that meets all requirements for " + fmtDist(o.d) + " at " + fmtRate(+s.rate) + "." + (o.n > 1 ? " " + (o.n - 1) + " other option" + (o.n > 2 ? "s" : "") + " also qualify." : "")
        : bad("Nothing qualifies.") + " Relax a requirement — lower the data rate, raise the budget, or split the link (e.g. fibre backbone + wireless access).") +
        note("Rules use typical capabilities (UTP/STP 100 m; MMF 2 km → 100 m as rate rises; SMF long-haul with amplifiers; microwave 50 km hops; satellite ~100 Mbit/s). Real designs also weigh latency, licences and existing infrastructure.");
    }
  }));
})();
