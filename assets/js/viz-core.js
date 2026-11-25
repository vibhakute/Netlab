/* =========================================================
   VizKit - shared drawing toolkit, simulation engines and the
   module registry used by the Learn workflow and the Studio.
   ========================================================= */
(function () {
  "use strict";
  const { icon, escapeHtml } = App;

  /* ---------- Palette & drawing toolkit ---------- */
  const C = { ink: "#1f2933", soft: "#52606d", faint: "#8a96a3", line: "#c5ccd5", bg: "#fbfcfd", primary: "#0b7a5c", pSoft: "#e5f4ee", blue: "#1f6fd1", bSoft: "#e8f1fc", violet: "#6b46c1", vSoft: "#f1ebfc", amber: "#b7791f", aSoft: "#fff6e0", red: "#c53030", rSoft: "#fdecec", nav: "#1e2a38" };
  const FONT = '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif';
  const MONO = 'Consolas, "Courier New", monospace';

  function makeCanvas(stage, W, H) {
    stage.innerHTML = "";
    const c = document.createElement("canvas");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = W * dpr; c.height = H * dpr;
    stage.appendChild(c);
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pos = e => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
    return { c, ctx, W, H, pos };
  }
  function loop(fn) {
    let id, last = performance.now();
    function f(t) { const dt = Math.max(0, Math.min(50, t - last)) / 1000; last = t; fn(dt, t / 1000); id = requestAnimationFrame(f); }
    id = requestAnimationFrame(f);
    return () => cancelAnimationFrame(id);
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function txt(ctx, s, x, y, o) {
    o = o || {};
    ctx.font = (o.weight || "400") + " " + (o.size || 13) + "px " + (o.mono ? MONO : FONT);
    ctx.fillStyle = o.color || C.ink; ctx.textAlign = o.align || "center"; ctx.textBaseline = o.base || "middle";
    ctx.fillText(s, x, y);
  }
  function label(ctx, s, x, y, o) {
    o = o || {};
    ctx.font = (o.weight || "600") + " " + (o.size || 12) + "px " + (o.mono ? MONO : FONT);
    const w = ctx.measureText(s).width + 12, h = (o.size || 12) + 8;
    rr(ctx, x - w / 2, y - h / 2, w, h, 4);
    ctx.fillStyle = o.bg || "#fff"; ctx.fill();
    ctx.strokeStyle = o.border || C.line; ctx.lineWidth = 1; ctx.stroke();
    txt(ctx, s, x, y + 0.5, { size: o.size || 12, weight: o.weight || "600", color: o.color || C.ink, mono: o.mono });
  }
  function line(ctx, x1, y1, x2, y2, color, w, dash) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = w || 2; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
  }
  function arrowHead(ctx, x1, y1, x2, y2, color, size) {
    const a = Math.atan2(y2 - y1, x2 - x1), s = size || 9;
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4));
    ctx.lineTo(x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4));
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }
  function device(ctx, type, x, y, o) {
    o = o || {};
    const stroke = o.stroke || C.nav;
    ctx.lineWidth = 2; ctx.strokeStyle = stroke;
    if (o.glow) { ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI * 2); ctx.fillStyle = o.glow; ctx.fill(); }
    if (type === "pc") {
      rr(ctx, x - 21, y - 17, 42, 29, 4); ctx.fillStyle = o.fill || "#fff"; ctx.fill(); ctx.stroke();
      rr(ctx, x - 16, y - 12, 32, 19, 2); ctx.fillStyle = o.screen || C.bSoft; ctx.fill();
      line(ctx, x, y + 12, x, y + 18, stroke, 3); line(ctx, x - 10, y + 19, x + 10, y + 19, stroke, 3);
    } else if (type === "server") {
      rr(ctx, x - 17, y - 25, 34, 50, 4); ctx.fillStyle = o.fill || "#fff"; ctx.fill(); ctx.stroke();
      for (let i = 0; i < 3; i++) { line(ctx, x - 11, y - 13 + i * 13, x + 5, y - 13 + i * 13, C.line, 3); ctx.beginPath(); ctx.arc(x + 10, y - 13 + i * 13, 2.5, 0, 7); ctx.fillStyle = C.primary; ctx.fill(); }
    } else if (type === "router") {
      ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.fillStyle = o.fill || C.bSoft; ctx.fill(); ctx.strokeStyle = o.stroke || C.blue; ctx.stroke();
      const s = o.stroke || C.blue;
      line(ctx, x - 9, y - 9, x + 9, y + 9, s, 2); line(ctx, x + 9, y - 9, x - 9, y + 9, s, 2);
      arrowHead(ctx, x, y, x + 11, y + 11, s, 6); arrowHead(ctx, x, y, x - 11, y - 11, s, 6);
      arrowHead(ctx, x, y, x + 11, y - 11, s, 6); arrowHead(ctx, x, y, x - 11, y + 11, s, 6);
    } else if (type === "switch") {
      rr(ctx, x - 30, y - 15, 60, 30, 5); ctx.fillStyle = o.fill || C.pSoft; ctx.fill(); ctx.strokeStyle = o.stroke || C.primary; ctx.stroke();
      for (let i = 0; i < 5; i++) { ctx.fillStyle = o.stroke || C.primary; ctx.fillRect(x - 22 + i * 10, y - 3, 6, 6); }
    } else if (type === "cloud") {
      ctx.beginPath();
      ctx.arc(x - 22, y + 4, 16, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(x - 6, y - 10, 18, Math.PI, Math.PI * 1.85);
      ctx.arc(x + 16, y - 4, 16, Math.PI * 1.3, Math.PI * 0.2); ctx.arc(x + 20, y + 10, 10, Math.PI * 1.6, Math.PI * 0.5); ctx.closePath();
      ctx.fillStyle = o.fill || "#fff"; ctx.fill(); ctx.strokeStyle = o.stroke || C.soft; ctx.stroke();
    }
    if (o.label) txt(ctx, o.label, x, y + (type === "server" ? 40 : 36), { weight: "600", size: 13 });
    if (o.sub) txt(ctx, o.sub, x, y + (type === "server" ? 55 : 51), { size: 11, color: C.faint, mono: o.subMono });
  }
  function pointOnPath(pts, d) {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], L = Math.hypot(b.x - a.x, b.y - a.y);
      if (d <= L) return { x: a.x + (b.x - a.x) * d / L, y: a.y + (b.y - a.y) * d / L, seg: i };
      d -= L;
    }
    const last = pts[pts.length - 1]; return { x: last.x, y: last.y, seg: pts.length - 2, done: true };
  }
  function pathLen(pts) { let s = 0; for (let i = 0; i < pts.length - 1; i++) s += Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y); return s; }
  function distToSeg(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
    let t = l2 ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }
  const speedSelect = (id, def) => '<label>Speed <select id="' + id + '"><option value="0.5">Slow</option><option value="1"' + (def !== 2 ? " selected" : "") + '>Normal</option><option value="2"' + (def === 2 ? " selected" : "") + '>Fast</option></select></label>';
  const btn = (id, ic, text, cls) => '<button class="btn btn-sm ' + (cls || "btn-outline") + '" id="' + id + '">' + (ic ? icon(ic, 14) : "") + " " + text + "</button>";

  /* =========================================================
     Reusable sequence-diagram engine (TCP, DNS, DHCP, HTTP)
     ========================================================= */
  function sequenceSim(env, cfg) {
    const { toolbar, stage, info } = env;
    toolbar.innerHTML = (cfg.controls || "") + '<span class="spacer"></span>' + btn("sqPlay", "play", "Play", "btn-primary") + btn("sqStep", "arrowR", "Step") + btn("sqReset", "reset", "Reset") + speedSelect("sqSpeed");
    const ROW = 40, TOP = 100;
    let steps, cv, idx = 0, t = 0, playing = false, stopAt = Infinity, speed = 1;
    const playBtn = toolbar.querySelector("#sqPlay");

    function setup() {
      steps = cfg.build();
      cv = makeCanvas(stage, 900, TOP + steps.length * ROW + 30);
      idx = 0; t = 0; playing = false; stopAt = Infinity; syncBtn(); showInfo();
    }
    function ax(i) { const n = cfg.actors.length; return n === 1 ? 450 : 100 + i * (700 / (n - 1)); }
    function syncBtn() { playBtn.innerHTML = icon(playing ? "pause" : "play", 14) + (playing ? " Pause" : idx >= steps.length ? " Replay" : " Play"); }
    function showInfo() {
      const cur = playing || t > 0 ? idx : idx - 1;
      if (cur < 0) { info.innerHTML = cfg.intro; return; }
      const s = steps[Math.min(cur, steps.length - 1)];
      info.innerHTML = "<b>Step " + (Math.min(cur, steps.length - 1) + 1) + " of " + steps.length + ": " + escapeHtml(s.label) + "</b><br>" + s.desc +
        (idx >= steps.length && !playing ? '<div style="margin-top:8px;color:var(--primary);font-weight:600">' + icon("check", 14) + " " + (cfg.doneMsg || "Sequence complete.") + "</div>" : "");
    }
    function drawArrow(ctx, s, i, prog) {
      const y1 = TOP + i * ROW + 6, y2 = y1 + ROW - 14;
      if (s.note !== undefined) {
        const x = ax(s.at);
        if (prog > 0) label(ctx, s.note, x, (y1 + y2) / 2, { bg: C.aSoft, border: C.amber, color: C.amber, size: 12 });
        return;
      }
      const targets = Array.isArray(s.to) ? s.to : [s.to];
      targets.forEach((to, k) => {
        const x1 = ax(s.from), x2 = ax(to);
        const lim = s.lost ? 0.55 : 1, p = Math.min(prog, lim);
        const ex = x1 + (x2 - x1) * p, ey = y1 + (y2 - y1) * p;
        line(ctx, x1, y1, ex, ey, s.color || C.blue, 2, s.dashed ? [6, 4] : null);
        if (prog >= 1 && !s.lost) arrowHead(ctx, x1, y1, x2, y2, s.color || C.blue, 10);
        if (s.lost && prog >= lim) { txt(ctx, "✕", ex, ey, { size: 20, weight: "700", color: C.red }); }
        if (prog < 1) { rr(ctx, ex - 9, ey - 6, 18, 12, 2); ctx.fillStyle = s.color || C.blue; ctx.fill(); }
        if (k === 0) {
          const mx = x1 + (x2 - x1) * (s.lost ? 0.3 : 0.5), my = y1 + (y2 - y1) * (s.lost ? 0.3 : 0.5) - 11;
          label(ctx, s.label + (s.lost && prog >= lim ? "  (LOST)" : ""), mx, my, { color: s.lost && prog >= lim ? C.red : s.color || C.blue, border: s.color || C.blue, size: 11.5 });
        }
      });
    }
    function draw() {
      const { ctx, W, H } = cv;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      cfg.actors.forEach((a, i) => {
        const x = ax(i);
        line(ctx, x, 84, x, H - 12, C.line, 2, [5, 5]);
        device(ctx, a.type, x, 30, { fill: "#fff" });
        txt(ctx, a.name, x, 64, { weight: "700", size: 13 });
        if (a.sub) txt(ctx, a.sub, x, 79, { size: 11, color: C.faint, mono: true });
      });
      for (let i = 0; i < idx && i < steps.length; i++) drawArrow(ctx, steps[i], i, 1);
      if (idx < steps.length && t > 0) drawArrow(ctx, steps[idx], idx, t);
    }
    const stop = loop(dt => {
      if (playing && idx < steps.length) {
        const s = steps[idx];
        t += dt * speed / (s.note !== undefined ? 0.6 : (s.dur || 1.1));
        if (t >= 1) {
          t = 0; idx++;
          if (idx >= stopAt || idx >= steps.length) { playing = false; stopAt = Infinity; if (idx >= steps.length) env.done(); }
          syncBtn(); showInfo();
        }
      }
      draw();
    });
    playBtn.onclick = () => {
      if (idx >= steps.length) { idx = 0; t = 0; }
      playing = !playing; stopAt = Infinity; syncBtn(); showInfo();
    };
    toolbar.querySelector("#sqStep").onclick = () => {
      if (idx >= steps.length) return;
      if (playing && t > 0) { stopAt = idx + 1; return; }
      playing = true; stopAt = idx + 1; syncBtn(); showInfo();
    };
    toolbar.querySelector("#sqReset").onclick = setup;
    toolbar.querySelector("#sqSpeed").onchange = e => speed = +e.target.value;
    if (cfg.bind) cfg.bind(toolbar, setup);
    setup();
    return stop;
  }


  /* =========================================================
     Responsive canvas: logical width follows the container so
     text stays readable on phones. Draw code reads cv.W / cv.H.
     ========================================================= */
  function autoCanvas(stage, heightFor, maxW) {
    stage.innerHTML = "";
    const c = document.createElement("canvas");
    stage.appendChild(c);
    const ctx = c.getContext("2d");
    const cv = { c, ctx, W: 0, H: 0 };
    function size() {
      const w = Math.max(300, Math.min(maxW || 1400, Math.floor(stage.clientWidth || 900)));
      const h = typeof heightFor === "function" ? heightFor(w) : heightFor;
      if (w === cv.W && h === cv.H) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.W = w; cv.H = h;
      c.width = w * dpr; c.height = h * dpr;
      c.style.width = w + "px"; c.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    let ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(size); ro.observe(stage); }
    cv.pos = e => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.W / r.width, y: (e.clientY - r.top) * cv.H / r.height }; };
    cv.dispose = () => { if (ro) ro.disconnect(); };
    return cv;
  }

  function wrapText(ctx, text, x, y, maxW, lineH, o) {
    o = o || {};
    ctx.font = (o.weight || "400") + " " + (o.size || 12) + "px " + FONT;
    const words = String(text).split(" ");
    let lineStr = "", yy = y;
    ctx.fillStyle = o.color || C.ink; ctx.textAlign = o.align || "left"; ctx.textBaseline = "top";
    words.forEach((w, i) => {
      const test = lineStr ? lineStr + " " + w : w;
      if (ctx.measureText(test).width > maxW && lineStr) { ctx.fillText(lineStr, x, yy); lineStr = w; yy += lineH; }
      else lineStr = test;
      if (i === words.length - 1) ctx.fillText(lineStr, x, yy);
    });
    return yy + lineH;
  }

  // Extra node shapes for flow diagrams (falls back to device()).
  function shape(ctx, type, x, y, o) {
    o = o || {};
    const stroke = o.stroke || C.nav, fill = o.fill || "#fff";
    ctx.lineWidth = 2; ctx.strokeStyle = stroke;
    if (o.glow) { ctx.beginPath(); ctx.arc(x, y, o.glowR || 34, 0, Math.PI * 2); ctx.fillStyle = o.glow; ctx.fill(); }
    let lblY = y + 34;
    if (type === "box") {
      const w = o.w || 120, h = o.h || 44;
      rr(ctx, x - w / 2, y - h / 2, w, h, 7); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.stroke();
      txt(ctx, o.label || "", x, o.sub ? y - 7 : y + 1, { weight: "700", size: o.size || 12.5, color: o.text || C.ink });
      if (o.sub) txt(ctx, o.sub, x, y + 10, { size: 10.5, color: C.soft });
      return;
    } else if (type === "phone") {
      rr(ctx, x - 18, y - 6, 36, 20, 5); ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y + 4, 5, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 20, y - 8); ctx.quadraticCurveTo(x, y - 22, x + 20, y - 8); ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2;
      lblY = y + 30;
    } else if (type === "tower") {
      line(ctx, x, y - 26, x - 14, y + 18, stroke, 2); line(ctx, x, y - 26, x + 14, y + 18, stroke, 2);
      line(ctx, x - 7, y - 4, x + 7, y - 4, stroke, 2); line(ctx, x - 10, y + 7, x + 10, y + 7, stroke, 2);
      [10, 17].forEach(r => { ctx.beginPath(); ctx.arc(x, y - 26, r, -Math.PI * 0.85, -Math.PI * 0.15); ctx.strokeStyle = o.wave || C.blue; ctx.stroke(); });
      lblY = y + 34;
    } else if (type === "sat") {
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.3);
      rr(ctx, -9, -9, 18, 18, 3); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.stroke();
      ctx.fillStyle = C.bSoft; ctx.strokeStyle = C.blue;
      ctx.fillRect(-36, -6, 24, 12); ctx.strokeRect(-36, -6, 24, 12); ctx.fillRect(12, -6, 24, 12); ctx.strokeRect(12, -6, 24, 12);
      ctx.restore(); lblY = y + 26;
    } else if (type === "house") {
      ctx.beginPath(); ctx.moveTo(x - 20, y - 2); ctx.lineTo(x, y - 20); ctx.lineTo(x + 20, y - 2); ctx.lineTo(x + 16, y - 2); ctx.lineTo(x + 16, y + 18); ctx.lineTo(x - 16, y + 18); ctx.lineTo(x - 16, y - 2); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); ctx.strokeRect(x - 5, y + 6, 10, 12); lblY = y + 32;
    } else if (type === "office") {
      rr(ctx, x - 20, y - 24, 40, 46, 3); ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
      for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) { ctx.fillStyle = C.bSoft; ctx.fillRect(x - 14 + k * 10, y - 18 + r * 12, 7, 8); }
      lblY = y + 36;
    } else if (type === "modem") {
      rr(ctx, x - 26, y - 9, 52, 20, 5); ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
      line(ctx, x - 16, y - 9, x - 20, y - 24, stroke, 2); line(ctx, x + 16, y - 9, x + 20, y - 24, stroke, 2);
      [C.primary, C.amber, C.primary].forEach((col, i) => { ctx.beginPath(); ctx.arc(x - 10 + i * 10, y + 1, 2.6, 0, 7); ctx.fillStyle = col; ctx.fill(); });
      lblY = y + 28;
    } else if (type === "sensor") {
      ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fillStyle = stroke; ctx.fill();
      [17, 23].forEach(r => { ctx.beginPath(); ctx.arc(x, y, r, -0.7, 0.7); ctx.strokeStyle = o.wave || C.primary; ctx.stroke(); });
      lblY = y + 30;
    } else if (type === "chip") {
      rr(ctx, x - 16, y - 16, 32, 32, 4); ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
      for (let k = -1; k <= 1; k++) { line(ctx, x + k * 8, y - 16, x + k * 8, y - 22, stroke, 2); line(ctx, x + k * 8, y + 16, x + k * 8, y + 22, stroke, 2); line(ctx, x - 16, y + k * 8, x - 22, y + k * 8, stroke, 2); line(ctx, x + 16, y + k * 8, x + 22, y + k * 8, stroke, 2); }
      lblY = y + 36;
    } else if (type === "dot") {
      ctx.beginPath(); ctx.arc(x, y, o.r || 12, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
      lblY = y + (o.r || 12) + 14;
    } else {
      device(ctx, type, x, y, { fill: o.fill, stroke: o.stroke, screen: o.screen, glow: null });
      lblY = y + (type === "server" ? 40 : 36);
    }
    if (o.label) txt(ctx, o.label, x, lblY, { weight: "600", size: 12.5 });
    if (o.sub) txt(ctx, o.sub, x, lblY + 15, { size: 10.5, color: C.faint, mono: o.subMono });
  }

  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  /* =========================================================
     Timeline engine - staged visualizations with
     play/pause, back/next, restart, speed and explanations.
     ========================================================= */
  function timeline(env, cfg) {
    const { toolbar, stage, info } = env;
    const stages = cfg.stages;
    toolbar.innerHTML = btn("tlRestart", "reset", "Restart") + btn("tlBack", "arrowL", "Back") +
      btn("tlPlay", "pause", "Pause", "btn-primary") + btn("tlNext", "arrowR", "Next") + speedSelect("tlSpeed") +
      '<span class="spacer"></span><span class="pill" id="tlCount"></span>';
    const cv = autoCanvas(stage, cfg.height || 340, cfg.maxW);
    let i = 0, t = 0, playing = cfg.autoplay !== false, speed = 1, finished = false;
    const q = s => toolbar.querySelector(s);
    function sync() {
      q("#tlPlay").innerHTML = icon(playing ? "pause" : "play", 14) + (playing ? " Pause" : finished ? " Replay" : " Play");
      q("#tlBack").disabled = i === 0;
      q("#tlNext").disabled = i >= stages.length - 1;
      q("#tlCount").textContent = "Stage " + (i + 1) + " / " + stages.length;
      const s = stages[i];
      info.innerHTML = '<div class="stage-dots">' + stages.map((x, k) => '<button class="sd' + (k === i ? " on" : k < i ? " past" : "") + '" data-k="' + k + '" title="' + escapeHtml(x.title) + '" aria-label="Stage ' + (k + 1) + '"></button>').join("") + "</div>" +
        "<b>" + (i + 1) + ". " + s.title + "</b><div>" + s.text + "</div>" + (cfg.legend ? '<div class="legend" style="margin-top:8px">' + cfg.legend + "</div>" : "");
      info.querySelectorAll(".sd").forEach(b => b.onclick = () => { i = +b.dataset.k; t = 0; finished = false; sync(); });
      if (cfg.onStage) cfg.onStage(i);
    }
    q("#tlPlay").onclick = () => { if (finished) { i = 0; t = 0; finished = false; } playing = !playing; sync(); };
    q("#tlNext").onclick = () => { if (i < stages.length - 1) { i++; t = 0; finished = false; sync(); } };
    q("#tlBack").onclick = () => { if (i > 0) { i--; t = 0; finished = false; sync(); } };
    q("#tlRestart").onclick = () => { i = 0; t = 0; finished = false; playing = true; sync(); };
    q("#tlSpeed").onchange = e => speed = +e.target.value;
    sync();
    const stop = loop((dt, time) => {
      if (playing && !finished) {
        t += dt * speed / (stages[i].dur || 3.2);
        if (t >= 1) {
          t = 1;
          if (i < stages.length - 1) { i++; t = 0; sync(); }
          else { finished = true; playing = false; sync(); env.done(); }
        }
      }
      const { ctx, W, H } = cv;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      cfg.draw(ctx, { i, t, e: ease(Math.min(1, t)), time, W, H, stage: stages[i], n: stages.length, cv });
    });
    return () => { stop(); cv.dispose(); };
  }

  /* =========================================================
     Flow diagram engine (nodes + edges + moving tokens).
     Node x is a fraction of the width (0..1), y is in pixels.
     ========================================================= */
  function flow(env, cfg) {
    const nodes = cfg.nodes;
    const P = (id, W) => { const n = nodes[id]; return { x: n.x * W, y: n.y }; };
    return timeline(env, {
      stages: cfg.stages, height: cfg.height || 320, legend: cfg.legend, maxW: cfg.maxW,
      draw(ctx, st) {
        const { W, stage: s } = st;
        const hi = s.hi || [], hiEdges = (s.edges || []).map(e => e.join(">")), broken = (s.broken || []).map(e => e.join(">"));
        const show = s.show || [];
        const visible = id => !nodes[id].hidden || hi.indexOf(id) !== -1 || show.indexOf(id) !== -1;
        (cfg.edges || []).forEach(([a, b, o]) => {
          o = o || {};
          if (!visible(a) || !visible(b)) return;
          const A = P(a, W), B = P(b, W);
          const on = hiEdges.indexOf(a + ">" + b) !== -1 || hiEdges.indexOf(b + ">" + a) !== -1;
          const br = broken.indexOf(a + ">" + b) !== -1 || broken.indexOf(b + ">" + a) !== -1;
          line(ctx, A.x, A.y, B.x, B.y, br ? C.red : on ? (o.hi || C.blue) : (o.color || "#b8c2cc"), on ? 4 : (o.w || 2.5), br ? [7, 6] : o.dash);
          if (br) txt(ctx, "✕", (A.x + B.x) / 2, (A.y + B.y) / 2, { size: 18, weight: "700", color: C.red });
          else if (o.label) label(ctx, o.label, (A.x + B.x) / 2, (A.y + B.y) / 2 + (o.ly || 0), { size: 10.5, color: C.soft });
        });
        const autoW = Math.max(66, Math.min(128, W * 0.17));
        Object.keys(nodes).forEach(id => {
          const n = nodes[id], p = P(id, W);
          if (!visible(id)) return;
          const on = hi.indexOf(id) !== -1;
          shape(ctx, n.type || "box", p.x, p.y, Object.assign({}, n, { w: n.w || autoW, size: W < 520 ? 11 : n.size, glow: on ? "rgba(31,111,209,.16)" : null, stroke: on && (n.type || "box") === "box" ? C.blue : n.stroke, fill: on && (n.type || "box") === "box" ? C.bSoft : n.fill }));
        });
        (s.move || []).forEach(m => {
          const start = m.start || 0, span = m.span || (1 - start);
          let k = (st.t - start) / span; if (k < 0) return; k = Math.min(1, k);
          if (k >= 1 && m.vanish) return;
          const pts = m.path.map(id => P(id, W));
          const p = pointOnPath(pts, pathLen(pts) * ease(k));
          label(ctx, m.label || "data", p.x, p.y + (m.dy || 0), { bg: m.color || C.amber, border: m.color || C.amber, color: "#fff", size: 11 });
        });
        (s.labels || []).forEach(l => {
          const p = l.at ? P(l.at, W) : { x: l.x * W, y: l.y };
          label(ctx, l.text, p.x + (l.dx || 0), p.y + (l.dy || -40), { bg: l.bg || C.aSoft, border: l.color || C.amber, color: l.color || C.amber, size: 11 });
        });
        if (cfg.extra) cfg.extra(ctx, st, P);
      }
    });
  }

  /* =========================================================
     Waveform engine - stages made of labelled signal rows.
     f(x) receives x in 0..1 across the row, returns -1..1.
     ========================================================= */
  function waves(env, cfg) {
    const maxRows = Math.max.apply(null, cfg.stages.map(s => s.rows.length));
    const rowH = cfg.rowH || 74;
    return timeline(env, {
      stages: cfg.stages, height: 24 + maxRows * rowH, legend: cfg.legend,
      draw(ctx, st) {
        const { W, stage: s } = st;
        const LX = W < 560 ? 12 : 130, RX = W - 16;
        const reveal = s.reveal === false ? 1 : Math.min(1, st.t * 1.15);
        s.rows.forEach((r, k) => {
          const y0 = 14 + k * rowH, mid = y0 + rowH / 2 + (W < 560 ? 6 : 0), amp = rowH * 0.34;
          if (W < 560) txt(ctx, r.label, LX, y0 + 6, { align: "left", weight: "700", size: 11.5, color: r.color || C.ink });
          else wrapText(ctx, r.label, 10, mid - 14, 112, 14, { weight: "700", size: 12, color: r.color || C.ink });
          line(ctx, LX, mid, RX, mid, "#e3e8ee", 1);
          if (r.bits) {
            const n = r.bits.length, bw = (RX - LX) / n;
            for (let b = 0; b <= n; b++) line(ctx, LX + b * bw, y0 + 4, LX + b * bw, y0 + rowH - 4, "#eef1f4", 1, [3, 3]);
            if (r.showBits !== false) for (let b = 0; b < n; b++) txt(ctx, r.bits[b], LX + (b + 0.5) * bw, y0 + 8, { size: 11, weight: "700", mono: true, color: C.soft });
          }
          ctx.beginPath(); ctx.lineWidth = r.w || 2.2; ctx.strokeStyle = r.color || C.blue;
          const steps = Math.max(200, Math.floor((RX - LX) * 1.5));
          for (let p = 0; p <= steps * reveal; p++) {
            const x = p / steps, yv = r.f(x);
            const X = LX + x * (RX - LX), Y = mid - yv * amp;
            if (p === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
          }
          ctx.stroke();
          if (r.note) label(ctx, r.note, RX - 80, y0 + rowH - 12, { size: 10.5, color: r.color || C.soft, border: "#e3e8ee" });
        });
        if (reveal < 1) line(ctx, LX + reveal * (RX - LX), 8, LX + reveal * (RX - LX), st.H - 6, C.red, 1.2);
        if (cfg.extra) cfg.extra(ctx, st);
      }
    });
  }

  /* =========================================================
     Control-panel simulation engine. Logic lives in compute(),
     drawing in draw(), explanation in readout().
     ========================================================= */
  function controls(env, cfg) {
    const { toolbar, stage, info } = env;
    const s = {};
    (cfg.controls || []).forEach(c => { if (c.type !== "button") s[c.id] = env.params[c.id] !== undefined ? env.params[c.id] : c.value; });
    toolbar.innerHTML = (cfg.controls || []).map(c => {
      const v = s[c.id];
      if (c.type === "range") return '<label class="ctl"><span>' + c.label + '</span><input type="range" data-id="' + c.id + '" min="' + c.min + '" max="' + c.max + '" step="' + (c.step || 1) + '" value="' + v + '"><output id="o-' + c.id + '">' + fmtVal(c, v) + "</output></label>";
      if (c.type === "select") return '<label class="ctl"><span>' + c.label + '</span><select data-id="' + c.id + '">' + c.options.map(o => { const val = Array.isArray(o) ? o[0] : o, lab = Array.isArray(o) ? o[1] : o; return '<option value="' + escapeHtml(val) + '"' + (String(val) === String(v) ? " selected" : "") + ">" + escapeHtml(lab) + "</option>"; }).join("") + "</select></label>";
      if (c.type === "text") return '<label class="ctl"><span>' + c.label + '</span><input type="text" data-id="' + c.id + '" value="' + escapeHtml(v) + '" maxlength="' + (c.max || 40) + '" style="width:' + (c.width || 130) + 'px"' + (c.mono ? ' class="mono"' : "") + "></label>";
      if (c.type === "check") return '<label class="ctl ctl-check"><input type="checkbox" data-id="' + c.id + '"' + (v ? " checked" : "") + "> " + c.label + "</label>";
      if (c.type === "button") return btn("cb-" + c.id, c.icon || "", c.label, c.primary ? "btn-primary" : "");
      return "";
    }).join("");
    const cv = cfg.dom ? null : autoCanvas(stage, cfg.height || 340, cfg.maxW);
    let touched = false;
    function fmtVal(c, v) { return (c.fmt ? c.fmt(+v) : v) + (c.unit ? " " + c.unit : ""); }
    function update(fromUser) {
      s.out = cfg.compute ? cfg.compute(s) : null;
      if (cfg.readout) info.innerHTML = cfg.readout(s);
      if (cfg.dom) cfg.dom(stage, s);
      if (fromUser && !touched) { touched = true; env.done(); }
      if (cv && !cfg.animate) drawNow(0, 0);
    }
    function drawNow(dt, time) { const { ctx, W, H } = cv; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H); cfg.draw(ctx, s, { W, H, dt, time, cv }); }
    toolbar.querySelectorAll("[data-id]").forEach(el => {
      const c = cfg.controls.find(x => x.id === el.dataset.id);
      const ev = el.type === "text" ? "input" : el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(ev, () => {
        let v = el.type === "checkbox" ? el.checked : el.value;
        if (c.type === "range") v = +v;
        if (c.sanitize) { v = c.sanitize(v); if (el.type === "text" && el.value !== v) el.value = v; }
        s[c.id] = v;
        const o = toolbar.querySelector("#o-" + c.id); if (o) o.textContent = fmtVal(c, v);
        if (cfg.onChange) cfg.onChange(s, c.id);
        update(true);
      });
    });
    (cfg.controls || []).filter(c => c.type === "button").forEach(c => {
      toolbar.querySelector("#cb-" + c.id).onclick = () => { c.onClick(s, { update: () => update(true) }); update(true); };
    });
    if (cfg.init) cfg.init(s);
    update(false);
    let stop = () => {};
    if (cv && cfg.animate) stop = loop((dt, time) => { if (cfg.step) cfg.step(s, dt, time); drawNow(dt, time); });
    else if (cv) {
      const redraw = () => drawNow(0, 0);
      if (window.ResizeObserver) { const ro = new ResizeObserver(() => requestAnimationFrame(redraw)); ro.observe(stage); stop = () => ro.disconnect(); }
    }
    if (cv) { cv.c.addEventListener("click", e => { if (cfg.click) { cfg.click(s, cv.pos(e), cv); update(true); } }); }
    return () => { stop(); if (cv) cv.dispose(); };
  }

  // Readout helper: a compact metrics grid
  function metrics(list) {
    return '<div class="metrics">' + list.filter(Boolean).map(m => '<div class="metric' + (m[3] ? " " + m[3] : "") + '"><span>' + m[0] + "</span><b>" + m[1] + "</b>" + (m[2] ? "<small>" + m[2] + "</small>" : "") + "</div>").join("") + "</div>";
  }

  /* =========================================================
     Registry + mounting
     ========================================================= */
  const REG = {};
  function register(id, def) { REG[id] = Object.assign({ id: id, params: {} }, def); }
  function get(id) { return REG[id]; }
  function all() { return Object.keys(REG).map(k => REG[k]); }

  function mount(container, id, params, opts) {
    opts = opts || {};
    const def = REG[id];
    if (!def) { container.innerHTML = '<div class="note warn"><span class="note-title">Not available</span><p>The module "' + escapeHtml(id) + '" is not loaded.</p></div>'; return { destroy() {} }; }
    container.innerHTML = '<div class="viz-wrap"><div class="viz-toolbar"></div><div class="viz-stage"></div><div class="viz-info" aria-live="polite"></div></div>';
    let doneOnce = false;
    const env = {
      toolbar: container.querySelector(".viz-toolbar"), stage: container.querySelector(".viz-stage"), info: container.querySelector(".viz-info"),
      params: Object.assign({}, def.params, params || {}),
      done() { if (doneOnce) return; doneOnce = true; if (App.Progress) App.Progress.markViz(id); if (opts.onDone) opts.onDone(); }
    };
    let cleanup = null;
    try { cleanup = def.run(env) || null; }
    catch (err) { console.error(err); env.stage.innerHTML = '<div class="note warn" style="margin:12px">Could not start this module: ' + escapeHtml(err.message) + "</div>"; }
    return { destroy() { if (cleanup) cleanup(); cleanup = null; }, def };
  }

  window.VizKit = {
    C, FONT, MONO, makeCanvas, autoCanvas, loop, rr, txt, label, line, arrowHead, device, shape, wrapText, pointOnPath, pathLen, distToSeg,
    speedSelect, btn, ease, sequenceSim, timeline, flow, waves, controls, metrics, register, get, all, mount
  };
})();
