/* =========================================================
   Data Transmission simulation (Unit I). Registered into VizKit
   so the Learn workflow and the Studio can both mount it.
   Used by Unit I: Introduction to Data Communication.
   ========================================================= */
(function () {
  "use strict";
  const { C, FONT, MONO, makeCanvas, loop, rr, txt, label, line, arrowHead, device, speedSelect, btn, register } = VizKit;
  const { icon, escapeHtml } = App;

  /* =========================================================
     1. Data Transmission
     ========================================================= */
  function simTransmission(env) {
    const { toolbar, stage, info } = env;
    toolbar.innerHTML =
      '<label>Message <input type="text" id="txMsg" value="Hi!" maxlength="12" style="width:110px"></label>' +
      '<label>Mode <select id="txMode"><option value="simplex">Simplex</option><option value="half">Half-duplex</option><option value="full" selected>Full-duplex</option></select></label>' +
      '<label><input type="checkbox" id="txNoise"> Add noise</label><span class="spacer"></span>' +
      btn("txSend", "play", "Send A → B", "btn-primary") + btn("txReply", "arrowL", "Reply B → A") + btn("txClear", "reset", "Clear") + speedSelect("txSpeed");
    const cv = makeCanvas(stage, 900, 330);
    const AX = 95, BX = 805, BIT = 24;
    let mode = "full", noise = false, speed = 1, msgLog = "";
    const lanes = { ab: { bits: [], queue: [], timer: 0, recv: [], chars: [], y: 150, dir: 1 }, ba: { bits: [], queue: [], timer: 0, recv: [], chars: [], y: 150, dir: -1 } };
    const toBits = s => Array.from(s).map(ch => (ch.charCodeAt(0) & 255).toString(2).padStart(8, "0")).join("");
    function busy(l) { return l.bits.length > 0 || l.queue.length > 0; }
    function send(lane, s) {
      lane.queue = lane.queue.concat(toBits(s).split("").map(Number)); lane.recv = []; lane.chars = [];
      env.done();
    }
    function setInfo(extra) {
      const msg = toolbar.querySelector("#txMsg").value || "Hi!";
      info.innerHTML = (extra ? '<div style="color:' + (extra.ok ? "var(--primary)" : "var(--red)") + ';font-weight:600;margin-bottom:6px">' + extra.text + "</div>" : "") +
        "<b>Binary of \"" + escapeHtml(msg) + "\" (8-bit ASCII):</b><br>" +
        '<span style="font-family:var(--mono);font-size:.88rem">' + Array.from(msg).map(ch => escapeHtml(ch) + "=" + (ch.charCodeAt(0) & 255).toString(2).padStart(8, "0")).join(" &nbsp; ") + "</span>" +
        '<br><span class="muted" style="font-size:.88rem">' + ({ simplex: "Simplex: data flows one way only (A → B). B can never reply.", half: "Half-duplex: both can send, but only one at a time — wait until the line is free.", full: "Full-duplex: two separate channels, so A and B can send at the same time." })[mode] + "</span>";
    }
    toolbar.querySelector("#txSend").onclick = () => {
      const msg = toolbar.querySelector("#txMsg").value || "Hi!";
      if (busy(lanes.ab)) return setInfo({ ok: false, text: "A is still sending — wait for it to finish." });
      if (mode === "half" && busy(lanes.ba)) return setInfo({ ok: false, text: "Line busy! In half-duplex, A must wait until B finishes sending." });
      send(lanes.ab, msg); setInfo();
    };
    toolbar.querySelector("#txReply").onclick = () => {
      if (mode === "simplex") return setInfo({ ok: false, text: "Not allowed: in simplex mode the receiver can never transmit." });
      if (busy(lanes.ba)) return setInfo({ ok: false, text: "B is still sending." });
      if (mode === "half" && busy(lanes.ab)) return setInfo({ ok: false, text: "Line busy! In half-duplex, B must wait until A finishes sending." });
      send(lanes.ba, "OK"); setInfo();
    };
    toolbar.querySelector("#txClear").onclick = () => { ["ab", "ba"].forEach(k => Object.assign(lanes[k], { bits: [], queue: [], recv: [], chars: [] })); setInfo(); };
    toolbar.querySelector("#txMode").onchange = e => { mode = e.target.value; toolbar.querySelector("#txClear").click(); layout(); };
    toolbar.querySelector("#txNoise").onchange = e => noise = e.target.checked;
    toolbar.querySelector("#txSpeed").onchange = e => speed = +e.target.value;
    toolbar.querySelector("#txMsg").oninput = () => setInfo();
    function layout() { lanes.ab.y = mode === "full" ? 132 : 150; lanes.ba.y = mode === "full" ? 178 : 150; }
    if (env.params.mode) { mode = env.params.mode; toolbar.querySelector("#txMode").value = mode; }
    if (env.params.noise) { noise = true; toolbar.querySelector("#txNoise").checked = true; }
    if (env.params.message) toolbar.querySelector("#txMsg").value = env.params.message;
    layout(); setInfo();

    function step(lane, dt) {
      const v = 150 * speed;
      lane.timer -= dt;
      if (lane.queue.length && lane.timer <= 0) {
        const b = lane.queue.shift();
        lane.bits.push({ v: b, x: lane.dir > 0 ? AX + 45 : BX - 45, err: false });
        lane.timer = BIT / v;
      }
      lane.bits.forEach(b => {
        b.x += lane.dir * v * dt;
        if (noise && !b.err && Math.random() < 0.02 * speed * dt) { b.v ^= 1; b.err = true; }
      });
      const endX = lane.dir > 0 ? BX - 45 : AX + 45;
      while (lane.bits.length && (lane.dir > 0 ? lane.bits[0].x >= endX : lane.bits[0].x <= endX)) {
        const b = lane.bits.shift(); lane.recv.push(b);
        if (lane.recv.length % 8 === 0) {
          const byte = lane.recv.slice(-8);
          const code = parseInt(byte.map(x => x.v).join(""), 2);
          lane.chars.push({ c: code < 32 || code > 126 ? "¿" : String.fromCharCode(code), e: byte.some(x => x.err) });
        }
      }
    }
    function drawLane(ctx, lane, color) {
      const y = lane.y;
      line(ctx, AX + 45, y, BX - 45, y, C.line, 3);
      // Square-wave trace for the bits in flight
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2;
      const sorted = lane.bits.slice().sort((a, b) => a.x - b.x);
      let prevX1 = null;
      sorted.forEach(b => {
        const x0 = b.x - BIT / 2, x1 = b.x + BIT / 2, yy = y - (b.v ? 20 : 4);
        if (prevX1 === null || x0 - prevX1 > 3) ctx.moveTo(x0, yy); else ctx.lineTo(x0, yy);
        ctx.lineTo(x1, yy); prevX1 = x1;
      });
      ctx.stroke();
      lane.bits.forEach(b => {
        rr(ctx, b.x - 9, y + 4, 18, 18, 3);
        ctx.fillStyle = b.err ? C.red : b.v ? color : "#fff"; ctx.fill();
        ctx.strokeStyle = b.err ? C.red : color; ctx.lineWidth = 1.5; ctx.stroke();
        txt(ctx, String(b.v), b.x, y + 13.5, { size: 11, weight: "700", color: b.v || b.err ? "#fff" : color, mono: true });
      });
    }
    function decoded(lane) { return lane.chars; }
    const stop = loop(dt => {
      step(lanes.ab, dt); step(lanes.ba, dt);
      const { ctx, W, H } = cv;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      txt(ctx, ({ simplex: "SIMPLEX", half: "HALF-DUPLEX", full: "FULL-DUPLEX" })[mode], W / 2, 34, { weight: "700", size: 14, color: C.soft });
      txt(ctx, mode === "full" ? "Two channels — both directions at once" : mode === "half" ? "One shared channel — one direction at a time" : "One channel — one direction only", W / 2, 54, { size: 12, color: C.faint });
      drawLane(ctx, lanes.ab, C.primary);
      if (mode === "full") drawLane(ctx, lanes.ba, C.violet);
      else if (mode === "half") lanes.ba.bits.length && drawLane(ctx, lanes.ba, C.violet);
      // Direction indicators for each channel
      const dirArrow = (x1, x2, y, col, text) => { line(ctx, x1, y, x2, y, col, 2); arrowHead(ctx, x1, y, x2, y, col, 9); txt(ctx, text, (x1 + x2) / 2, y - 10, { size: 11, weight: "600", color: col }); };
      dirArrow(W / 2 - 60, W / 2 + 60, 92, C.primary, mode === "full" ? "Channel 1: A → B" : "A → B");
      if (mode === "full") dirArrow(W / 2 + 60, W / 2 - 60, 214, C.violet, "");
      if (mode === "full") txt(ctx, "Channel 2: B → A", W / 2, 228, { size: 11, weight: "600", color: C.violet });
      if (mode === "half") txt(ctx, "or B → A (when the line is free)", W / 2, 112, { size: 11, color: C.violet });
      device(ctx, "pc", AX, 150, { label: "Sender A", screen: busy(lanes.ab) ? C.pSoft : C.bSoft });
      device(ctx, "pc", BX, 150, { label: "Receiver B", screen: busy(lanes.ba) ? C.vSoft : C.bSoft });
      // Received text panels
      [[lanes.ab, BX, "B received:", C.primary], [lanes.ba, AX, "A received:", C.violet]].forEach(([lane, x, title, col]) => {
        if (mode === "simplex" && lane === lanes.ba) return;
        const chars = decoded(lane);
        rr(ctx, x - 80, 230, 160, 62, 6); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
        txt(ctx, title, x, 246, { size: 11, color: C.faint });
        let cx = x - (chars.length * 15) / 2 + 7;
        chars.forEach(ch => { txt(ctx, ch.c === " " ? "␣" : ch.c, cx, 272, { size: 20, weight: "700", color: ch.e ? C.red : col, mono: true }); cx += 15; });
        if (!chars.length) txt(ctx, "—", x, 272, { color: C.faint });
        if (lane.recv.length % 8) txt(ctx, "bits: " + lane.recv.slice(-(lane.recv.length % 8)).map(b => b.v).join(""), x, 304, { size: 11, color: C.soft, mono: true });
      });
      if (noise) txt(ctx, "⚡ Noise enabled: some bits get flipped (red) and corrupt characters", W / 2, 318, { size: 12, color: C.red });
    });
    return stop;
  }


  /* ---------- Registration ---------- */
  register("transmission", { kind: "sim", category: "Unit I · Data Communication", title: "Data Transmission", desc: "Type a message and watch it travel as bits. Compare simplex, half-duplex and full-duplex, and add noise to see errors.", run: simTransmission, params: {} });
})();
