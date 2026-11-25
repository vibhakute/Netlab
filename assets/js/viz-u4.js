/* Unit IV visualizations and simulations: modulation and multiplexing.
   Logic: SimLogic (plus small local helpers below); drawing: VizKit. */
(function () {
  "use strict";
  const K = VizKit, L = SimLogic;
  const { C, txt, label, line, rr, metrics } = K;
  const R = (id, kind, cat, title, desc, run, params) => K.register(id, { kind, category: cat, title, desc, run, params: params || {} });
  const TAU = Math.PI * 2;

  /* ---------- local helpers ---------- */
  function fmtHz(f) { if (f >= 1e12) return +(f / 1e12).toFixed(2) + " THz"; if (f >= 1e9) return +(f / 1e9).toFixed(2) + " GHz"; if (f >= 1e6) return +(f / 1e6).toFixed(2) + " MHz"; if (f >= 1e3) return +(f / 1e3).toFixed(2) + " kHz"; return +f.toFixed(1) + " Hz"; }
  function fmtLen(m) { if (m >= 1000) return +(m / 1000).toFixed(m >= 1e4 ? 1 : 2) + " km"; if (m >= 1) return +m.toFixed(2) + " m"; if (m >= 0.01) return +(m * 100).toFixed(1) + " cm"; return +(m * 1000).toFixed(2) + " mm"; }
  function fmtRate(bps) { if (bps >= 1e12) return +(bps / 1e12).toFixed(2) + " Tbit/s"; if (bps >= 1e9) return +(bps / 1e9).toFixed(3) + " Gbit/s"; if (bps >= 1e6) return +(bps / 1e6).toFixed(3) + " Mbit/s"; if (bps >= 1e3) return +(bps / 1e3).toFixed(1) + " kbit/s"; return bps + " bit/s"; }
  // Show/hide a control (and its label) in a controls() toolbar.
  function showCtl(env, id, on) { const el = env.toolbar.querySelector('[data-id="' + id + '"]') || env.toolbar.querySelector("#cb-" + id); if (el) (el.closest(".ctl") || el).style.display = on ? "" : "none"; }
  function setCtl(env, id, v, c) { const el = env.toolbar.querySelector('[data-id="' + id + '"]'); if (el) el.value = v; const o = env.toolbar.querySelector("#o-" + id); if (o && c) o.textContent = (c.fmt ? c.fmt(+v) : v) + (c.unit ? " " + c.unit : ""); }
  // Q function via erfc (Abramowitz & Stegun 7.1.26) - used only for "theory (approx.)" BER.
  function erfc(x) { const z = Math.abs(x), t = 1 / (1 + 0.3275911 * z); const y = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-z * z); return x >= 0 ? y : 2 - y; }
  const Qf = x => 0.5 * erfc(x / Math.SQRT2);
  // Bessel function of the first kind, integer order (power series; fine for x < 20).
  function besselJ(n, x) { n = Math.abs(n); let sum = 0, term = Math.pow(x / 2, n); for (let k = 1; k <= n; k++) term /= k; for (let k = 0; k < 60; k++) { sum += term; term *= -(x * x / 4) / ((k + 1) * (k + 1 + n)); if (Math.abs(term) < 1e-12) break; } return sum; }

  // Draw a waveform f(x)->-1..1 across [x0, x0+w] centred on y.
  function wave(ctx, x0, y, w, amp, f, o) {
    o = o || {};
    line(ctx, x0, y, x0 + w, y, "#e3e8ee", 1);
    if (o.n) {
      for (let k = 0; k <= o.n; k++) line(ctx, x0 + k * w / o.n, y - amp - 6, x0 + k * w / o.n, y + amp + 6, "#eef1f4", 1, [3, 3]);
      if (o.labels) o.labels.forEach((l, k) => txt(ctx, l, x0 + (k + 0.5) * w / o.n, y - amp - 14, { mono: true, size: 11, weight: "700", color: o.hiIdx === k ? C.red : C.soft }));
    }
    if (o.title) txt(ctx, o.title, x0, y - amp - (o.labels ? 30 : 16), { align: "left", weight: "700", size: 12, color: o.color || C.ink });
    const rev = o.reveal === undefined ? 1 : o.reveal;
    ctx.beginPath(); ctx.strokeStyle = o.color || C.blue; ctx.lineWidth = o.lw || 2;
    const N = Math.max(240, Math.floor(w * 1.6));
    for (let p = 0; p <= N * rev; p++) { const x = p / N, X = x0 + x * w, Y = y - Math.max(-1.3, Math.min(1.3, f(x))) * amp; if (p) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
    ctx.stroke();
  }
  // Constellation diagram. pts: {label:[I,Q]}. Returns the scale used.
  function constel(ctx, cx, cy, Rd, pts, o) {
    o = o || {};
    const keys = Object.keys(pts);
    const mx = o.max || Math.max(1e-9, Math.max.apply(null, keys.map(k => Math.max(Math.abs(pts[k][0]), Math.abs(pts[k][1])))));
    const sc = Rd * 0.76 / mx;
    rr(ctx, cx - Rd, cy - Rd, 2 * Rd, 2 * Rd, 8); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = "#e3e8ee"; ctx.lineWidth = 1; ctx.stroke();
    (o.grid || []).forEach(g => { line(ctx, cx + g * sc, cy - Rd + 4, cx + g * sc, cy + Rd - 4, "#f0d9a8", 1, [4, 4]); line(ctx, cx - Rd + 4, cy - g * sc, cx + Rd - 4, cy - g * sc, "#f0d9a8", 1, [4, 4]); });
    line(ctx, cx - Rd + 6, cy, cx + Rd - 6, cy, C.line, 1); line(ctx, cx, cy - Rd + 6, cx, cy + Rd - 6, C.line, 1);
    txt(ctx, o.xLabel || "I", cx + Rd - 14, cy - 9, { size: 11, color: C.faint, weight: "700" });
    txt(ctx, o.yLabel || "Q", cx + 12, cy - Rd + 12, { size: 11, color: C.faint, weight: "700", align: "left" });
    if (o.title) txt(ctx, o.title, cx - Rd + 2, cy - Rd - 10, { align: "left", size: 11, weight: "700", color: C.soft });
    (o.rx || []).forEach(p => {
      const X = cx + p.x * sc, Y = cy - p.y * sc;
      if (X < cx - Rd + 2 || X > cx + Rd - 2 || Y < cy - Rd + 2 || Y > cy + Rd - 2) return;
      ctx.fillStyle = p.c || "rgba(31,111,209,.35)"; ctx.fillRect(X - (p.s || 3) / 2, Y - (p.s || 3) / 2, p.s || 3, p.s || 3);
    });
    keys.forEach(k => {
      const X = cx + pts[k][0] * sc, Y = cy - pts[k][1] * sc, on = o.hi === k;
      ctx.beginPath(); ctx.arc(X, Y, on ? 7 : 4.5, 0, TAU); ctx.fillStyle = on ? C.red : (o.dot || C.ink); ctx.fill();
      if (o.labels !== false) txt(ctx, k, X, Y + (o.below ? 14 : -12), { mono: true, size: o.lsize || 10.5, weight: "700", color: on ? C.red : C.soft });
    });
    return sc;
  }
  // Two-panel layout: wave region + constellation (side by side when wide, stacked when narrow).
  function layout(W, H) {
    const wide = W >= 600;
    if (wide) { const Rd = Math.min(125, H / 2 - 24); return { wide, cx: W - Rd - 22, cy: H / 2 + 8, Rd, x0: 20, w: W - 2 * Rd - 80, top: 26, bot: H - 10 }; }
    const Rd = Math.min(100, W / 2 - 14); return { wide, cx: W / 2, cy: Rd + 24, Rd, x0: 12, w: W - 24, top: 2 * Rd + 50, bot: H - 8 };
  }
  const rowY = (G, k, n) => G.top + (G.bot - G.top) * (k + 0.5) / n;
  const rowAmp = (G, n) => Math.min(38, (G.bot - G.top) / n * 0.28);
  const H2 = w => w < 600 ? 480 : 320;

  /* ===================== VISUALIZATIONS ===================== */

  /* ---------- v-modintro ---------- */
  R("v-modintro", "viz", "Unit IV · Modulation", "What Modulation Does", "A message, a carrier and their combination, stage by stage — then the three things a carrier can vary.", env => {
    const msg = x => Math.sin(TAU * 2 * x), car = x => Math.sin(TAU * 24 * x);
    const am = x => (1 + 0.7 * msg(x)) / 1.7 * car(x);
    const bits = "10110010", bs = L.toSymbols(bits, "BPSK");
    return K.waves(env, {
      stages: [
        { title: "The message (baseband) signal", text: "Your voice is a low-frequency signal (≈ 300–3400 Hz). At 3 kHz its wavelength is λ = c/f = 100 km, so a quarter-wave antenna would be 25 km long — impossible.", rows: [{ label: "Message m(t)", f: msg, color: C.violet }] },
        { title: "The carrier", text: "A <b>carrier</b> is a high-frequency sine wave, c(t) = A·cos(2πf<sub>c</sub>t + φ). On a 100 MHz carrier the antenna shrinks to about 75 cm. The carrier itself carries no information.", rows: [{ label: "Message m(t)", f: msg, color: C.violet }, { label: "Carrier c(t)", f: car, color: C.blue }] },
        { title: "Modulation: the message rides on the carrier", text: "Here the message changes the carrier's <b>amplitude</b> (AM). The outline (envelope) of the modulated wave has the shape of the message, but the signal now lives at the carrier frequency.", rows: [{ label: "Message m(t)", f: msg, color: C.violet }, { label: "Carrier c(t)", f: car, color: C.blue }, { label: "Modulated (AM)", f: am, color: C.primary }] },
        { title: "Three things to vary", text: "A carrier has three properties: <b>amplitude</b> (AM), <b>frequency</b> (FM) and <b>phase</b> (PM). Each gives a different modulation scheme with different noise and bandwidth trade-offs.", rows: [{ label: "Message", f: msg, color: C.violet }, { label: "AM", f: x => L.analogMod("AM", x, { fc: 24, fm: 2, m: 0.7 }) / 1.7, color: C.primary }, { label: "FM", f: x => L.analogMod("FM", x, { fc: 24, fm: 2, beta: 5 }), color: C.blue }, { label: "PM", f: x => L.analogMod("PM", x, { fc: 24, fm: 2, kp: 3 }), color: C.amber }] },
        { title: "Digital message → digital modulation", text: "When the message is digital (bits), the same idea is called <b>keying</b>: ASK, FSK and PSK switch the carrier between fixed states. The carrier is still analog.", rows: [{ label: "Bits", bits, f: x => L.sig.nrz(bits, x), color: C.ink }, { label: "ASK", bits, showBits: false, f: x => L.modWave("ASK", bs, x, 3), color: C.primary }, { label: "FSK", bits, showBits: false, f: x => L.modWave("FSK", bs, x, 2), color: C.blue }, { label: "PSK", bits, showBits: false, f: x => L.modWave("BPSK", bs, x, 2), color: C.amber }] },
        { title: "Demodulation: getting the message back", text: "At the receiver, a <b>demodulator</b> extracts the message. For AM, an envelope detector follows the outline of the wave and outputs the original message.", rows: [{ label: "Received AM", f: am, color: C.primary }, { label: "Recovered message", f: msg, color: C.violet }] }
      ]
    });
  });

  /* ---------- v-amfmpm ---------- */
  R("v-amfmpm", "viz", "Unit IV · Analog Modulation", "AM, FM and PM Compared", "One message modulates the same carrier three ways, then AM is overmodulated.", env => {
    const o = { fc: 26, fm: 2 };
    const msg = x => Math.cos(TAU * 2 * x);
    const AM = m => x => L.analogMod("AM", x, Object.assign({ m }, o)) / (1 + m);
    const FM = x => L.analogMod("FM", x, Object.assign({ beta: 5 }, o));
    const PM = x => L.analogMod("PM", x, Object.assign({ kp: 3 }, o));
    return K.waves(env, {
      stages: [
        { title: "Message and carrier", text: "The message m(t) is a slow cosine; the carrier is a fast cosine at f<sub>c</sub>. We will vary one carrier property at a time.", rows: [{ label: "Message m(t)", f: msg, color: C.violet }, { label: "Carrier", f: x => Math.cos(TAU * o.fc * x), color: C.faint }] },
        { title: "AM: amplitude follows the message", text: "s(t) = A[1 + m·cos(2πf<sub>m</sub>t)]·cos(2πf<sub>c</sub>t) with modulation index m = 0.8. The <b>envelope</b> (dashed) traces the message. Frequency and phase stay constant. Bandwidth = 2f<sub>m</sub>.", rows: [{ label: "Message m(t)", f: msg, color: C.violet }, { label: "AM (m = 0.8)", f: AM(0.8), color: C.primary }], env: [{ row: 1, m: 0.8 }] },
        { title: "FM: frequency follows the message", text: "Amplitude is constant; the wave is <b>compressed</b> (higher frequency) where the message is high and <b>stretched</b> where it is low. Frequency deviation Δf sets the index β = Δf/f<sub>m</sub>; Carson's rule: BW ≈ 2(Δf + f<sub>m</sub>).", rows: [{ label: "Message m(t)", f: msg, color: C.violet }, { label: "FM (β = 5)", f: FM, color: C.blue }] },
        { title: "PM: phase follows the message", text: "Amplitude is constant; the <b>phase</b> shifts in proportion to the message. The instantaneous frequency follows the message's <i>slope</i>, so the squeezed regions sit where the message changes fastest (its zero crossings), not at its peaks.", rows: [{ label: "Message m(t)", f: msg, color: C.violet }, { label: "PM (k = 3 rad)", f: PM, color: C.amber }] },
        { title: "Side by side", text: "AM changes height; FM and PM keep constant height and change spacing. Because noise mostly disturbs amplitude, FM and PM resist noise better than AM — at the cost of more bandwidth.", rows: [{ label: "Message", f: msg, color: C.violet }, { label: "AM", f: AM(0.8), color: C.primary }, { label: "FM", f: FM, color: C.blue }, { label: "PM", f: PM, color: C.amber }], env: [{ row: 1, m: 0.8 }] },
        { title: "Overmodulation (m > 1)", text: "With m = 1.6 the term 1 + m·cos(…) goes negative: the envelope crosses zero and the carrier phase reverses. An envelope detector now outputs a <b>distorted</b> message. Keep m ≤ 1.", rows: [{ label: "Message m(t)", f: msg, color: C.violet }, { label: "AM (m = 1.6)", f: AM(1.6), color: C.red, note: "distorted envelope" }], env: [{ row: 1, m: 1.6 }] }
      ],
      extra(ctx, st) {
        const envs = st.stage.env; if (!envs) return;
        const W = st.W, LX = W < 560 ? 12 : 130, RX = W - 16, rowH = 74;
        const reveal = Math.min(1, st.t * 1.15);
        envs.forEach(e => {
          const y0 = 14 + e.row * rowH, mid = y0 + rowH / 2 + (W < 560 ? 6 : 0), amp = rowH * 0.34;
          [1, -1].forEach(sg => {
            ctx.beginPath(); ctx.setLineDash([5, 4]); ctx.strokeStyle = C.amber; ctx.lineWidth = 1.4;
            for (let p = 0; p <= 300 * reveal; p++) { const x = p / 300, v = Math.abs(1 + e.m * msg(x)) / (1 + e.m); const X = LX + x * (RX - LX), Y = mid - sg * v * amp; if (p) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
            ctx.stroke(); ctx.setLineDash([]);
          });
        });
      }
    });
  });

  /* ---------- v-askfsk ---------- */
  R("v-askfsk", "viz", "Unit IV · Digital Modulation", "ASK and FSK Waveforms", "The same bits drawn as NRZ, ASK and FSK — then a noise burst shows why FSK is more robust.", env => {
    const bits = "10110010", sy = L.toSymbols(bits, "ASK");
    const nrz = x => L.sig.nrz(bits, x);
    const ask = x => L.modWave("ASK", sy, x, 3);
    const fsk = x => L.modWave("FSK", sy, x, 2);
    const burst = x => x >= 1 / 8 && x < 2 / 8;
    const askN = x => ask(x) + (burst(x) ? 0.85 * Math.sin(TAU * 3 * x * 8 + 0.5) : 0);
    const fskN = x => Math.max(-1, Math.min(1, fsk(x) * (burst(x) ? 1.6 : 1)));
    return K.waves(env, {
      stages: [
        { title: "Input bits (NRZ)", text: "The data <code>10110010</code> as a two-level digital signal.", rows: [{ label: "Input bits", bits, f: nrz, color: C.ink }] },
        { title: "ASK: amplitude carries the bit", text: "For <b>1</b> the carrier is transmitted; for <b>0</b> the output is (almost) zero. Switching fully on and off is called <b>On-Off Keying (OOK)</b>.", rows: [{ label: "Input bits", bits, f: nrz, color: C.ink }, { label: "ASK output", bits, showBits: false, f: ask, color: C.primary }] },
        { title: "FSK: frequency carries the bit", text: "Amplitude stays constant. A <b>high</b> frequency (the <b>mark</b>) means 1 and a <b>low</b> frequency (the <b>space</b>) means 0. Here the mark is twice the space frequency.", rows: [{ label: "Input bits", bits, f: nrz, color: C.ink }, { label: "FSK output", bits, showBits: false, f: fsk, color: C.blue }] },
        { title: "All three together", text: "Read each bit period vertically: ASK switches height, FSK switches spacing. FSK uses two frequencies, so it needs more bandwidth than ASK.", rows: [{ label: "Input bits", bits, f: nrz, color: C.ink }, { label: "ASK", bits, showBits: false, f: ask, color: C.primary }, { label: "FSK", bits, showBits: false, f: fsk, color: C.blue }] },
        { burst: true, title: "A noise burst hits bit 2", text: "An amplitude disturbance hits the second bit (a 0). ASK decides by amplitude, so the receiver now sees a carrier and reads <b>1</b> — an error. FSK decides by <i>frequency</i>; the burst changes the height but the space frequency is still there, so it still reads <b>0</b>.", rows: [{ label: "Input bits", bits, f: nrz, color: C.ink }, { label: "ASK + burst", bits, showBits: false, f: askN, color: C.red, note: "bit 2 read as 1 ✕" }, { label: "FSK + burst", bits, showBits: false, f: fskN, color: C.blue, note: "bit 2 still 0 ✓" }] }
      ],
      extra(ctx, st) {
        if (!st.stage.burst) return;
        const W = st.W, LX = W < 560 ? 12 : 130, RX = W - 16, x = LX + (RX - LX) / 8, w = (RX - LX) / 8;
        ctx.setLineDash([5, 4]); ctx.strokeStyle = C.red; ctx.lineWidth = 1.5; ctx.strokeRect(x, 14 + 74 + 4, w, 2 * 74 - 8); ctx.setLineDash([]);
        label(ctx, "noise burst", x + w / 2, 14 + 74 + 4, { size: 10.5, color: C.red, border: C.red });
      }
    });
  });

  /* ---------- v-psk ---------- */
  R("v-psk", "viz", "Unit IV · Digital Modulation", "BPSK, QPSK and DPSK", "Watch the carrier phase flip for BPSK, step through four phases for QPSK, and follow DPSK's invert-on-1 rule.", env => {
    const bits = "10110010";
    const s1 = L.toSymbols(bits, "BPSK"), s2 = L.toSymbols(bits, "QPSK");
    const P1 = L.SCHEMES.BPSK.points, P2 = L.SCHEMES.QPSK.points;
    const dph = []; let ph = 0; bits.split("").forEach(b => { if (b === "1") ph = (ph + 180) % 360; dph.push(ph); });
    const dpsk = x => { const n = bits.length, i = Math.min(n - 1, Math.floor(x * n)); return Math.cos(TAU * 2 * x * n + dph[i] * Math.PI / 180); };
    const deg = k => { const p = P2[k]; return ((Math.atan2(p[1], p[0]) * 180 / Math.PI) + 360) % 360; };
    return K.timeline(env, {
      height: H2,
      stages: [
        { title: "BPSK: two phases", text: "Binary PSK uses one carrier with two phases: <b>0°</b> for 1 and <b>180°</b> for 0 (phase reversal keying). The constellation has two points on the I axis.", dur: 4.5 },
        { title: "Phase reversal at every bit change", text: "Wherever the bit value changes (red marks) the wave suddenly flips upside down. The amplitude never changes, so amplitude noise does not affect the decision.", dur: 3.5 },
        { title: "QPSK: two bits per symbol", text: "QPSK groups the bits into pairs (dibits) <code>10 11 00 10</code>. Each pair selects one of four phases (45°, 135°, 225°, 315°). Gray coding makes neighbouring points differ by one bit.", dur: 4.5 },
        { title: "Same bits, half the symbols", text: "BPSK needs 8 symbols for 8 bits; QPSK needs only 4. For the same bit rate, QPSK halves the symbol (baud) rate and so needs about half the bandwidth.", dur: 3.5 },
        { title: "DPSK: invert on 1", text: "DPSK encodes each bit relative to the previous symbol: a <b>1</b> reverses the phase, a <b>0</b> keeps it. The receiver only compares neighbouring symbols, so no reference oscillator is needed.", dur: 5 }
      ],
      draw(ctx, st) {
        const { W, H, i, t } = st, G = layout(W, H), rev = Math.min(1, t * 1.15);
        if (i <= 1) {
          const n = s1.length, idx = Math.min(n - 1, Math.floor(rev * n)), y = rowY(G, 0, 2) + 10, amp = rowAmp(G, 2) * 1.3;
          wave(ctx, G.x0, y, G.w, amp, x => L.modWave("BPSK", s1, x, 2), { n, labels: s1, hiIdx: i === 0 ? idx : -1, reveal: i === 0 ? rev : 1, title: "BPSK carrier", color: C.blue });
          if (i === 1) for (let k = 1; k < n; k++) if (s1[k] !== s1[k - 1]) { const X = G.x0 + k * G.w / n; line(ctx, X, y - amp - 4, X, y + amp + 4, C.red, 2); }
          const yb = rowY(G, 1, 2) + 10;
          s1.forEach((b, k) => label(ctx, b === "1" ? "0°" : "180°", G.x0 + (k + 0.5) * G.w / n, yb, { size: 10.5, mono: true, color: b === "1" ? C.primary : C.violet, border: "#e3e8ee" }));
          txt(ctx, "phase per bit", G.x0, yb - 22, { align: "left", size: 11, color: C.soft, weight: "600" });
          constel(ctx, G.cx, G.cy, G.Rd, P1, { hi: s1[idx], below: true, title: "BPSK constellation" });
        } else if (i === 2) {
          const n = s2.length, idx = Math.min(n - 1, Math.floor(rev * n)), y = rowY(G, 0, 2) + 10, amp = rowAmp(G, 2) * 1.3;
          wave(ctx, G.x0, y, G.w, amp, x => L.modWave("QPSK", s2, x, 2), { n, labels: s2, hiIdx: idx, reveal: rev, title: "QPSK carrier", color: C.violet });
          const yb = rowY(G, 1, 2) + 10;
          s2.forEach((b, k) => label(ctx, b + " → " + deg(b).toFixed(0) + "°", G.x0 + (k + 0.5) * G.w / n, yb, { size: 10.5, mono: true, color: k === idx ? C.red : C.soft, border: "#e3e8ee" }));
          constel(ctx, G.cx, G.cy, G.Rd, P2, { hi: s2[idx], title: "QPSK (Gray coded)" });
        } else if (i === 3) {
          const amp = rowAmp(G, 2) * 1.2;
          wave(ctx, G.x0, rowY(G, 0, 2) + 8, G.w, amp, x => L.modWave("BPSK", s1, x, 2), { n: 8, labels: s1, title: "BPSK: 8 symbols", color: C.blue });
          wave(ctx, G.x0, rowY(G, 1, 2) + 8, G.w, amp, x => L.modWave("QPSK", s2, x, 4), { n: 4, labels: s2, title: "QPSK: 4 symbols (same time)", color: C.violet });
          constel(ctx, G.cx, G.cy, G.Rd, P2, { title: "4 points = 2 bits each" });
        } else {
          const n = bits.length, idx = Math.min(n - 1, Math.floor(rev * n)), y = rowY(G, 0, 2) + 10, amp = rowAmp(G, 2) * 1.3;
          wave(ctx, G.x0, y, G.w, amp, dpsk, { n, labels: bits.split(""), hiIdx: idx, reveal: rev, title: "DPSK carrier (1 = flip, 0 = keep)", color: C.amber });
          const yb = rowY(G, 1, 2) + 10;
          dph.forEach((p, k) => { if (k > idx) return; const flip = bits[k] === "1"; label(ctx, p + "°", G.x0 + (k + 0.5) * G.w / n, yb, { size: 10.5, mono: true, color: flip ? C.red : C.soft, border: flip ? C.red : "#e3e8ee" }); });
          txt(ctx, "absolute phase (start 0°)", G.x0, yb - 22, { align: "left", size: 11, color: C.soft, weight: "600" });
          constel(ctx, G.cx, G.cy, G.Rd, { "0°": [1, 0], "180°": [-1, 0] }, { hi: dph[idx] + "°", below: true, title: "Current phase" });
        }
      }
    });
  });

  /* ---------- v-qam ---------- */
  R("v-qam", "viz", "Unit IV · Digital Modulation", "Building 16-QAM", "Four bits choose an I level and a Q level, giving one of 16 points — then noise shows the SNR trade-off.", env => {
    const LV = { "00": -3, "01": -1, "11": 1, "10": 3 };
    const P16 = L.SCHEMES["16QAM"].points, n10 = Math.sqrt(10);
    const Iaxis = {}, Qaxis = {};
    Object.keys(LV).forEach(k => { Iaxis[k] = [LV[k] / n10, 0]; Qaxis[k] = [0, LV[k] / n10]; });
    const syms = ["1011", "0001", "1110", "0100"];
    const sIQ = s => [LV[s.slice(0, 2)], LV[s.slice(2)]];
    const qamWave = list => x => { const n = list.length, k = Math.min(n - 1, Math.floor(x * n)), loc = x * n, iq = sIQ(list[k]); return (iq[0] * Math.cos(TAU * 2 * loc) - iq[1] * Math.sin(TAU * 2 * loc)) / Math.sqrt(18); };
    const r = L.rng(41); let rb = ""; for (let k = 0; k < 1600; k++) rb += r() < 0.5 ? "0" : "1";
    const hiSnr = L.simulateConstellation("16QAM", rb, 20, 5), loSnr = L.simulateConstellation("16QAM", rb, 12, 5);
    const cloud = sim => sim.rx.map(p => ({ x: p.point[0], y: p.point[1], c: p.decided === p.sent ? "rgba(31,111,209,.4)" : "rgba(197,48,48,.85)" }));
    const grid = [-2 / n10, 0, 2 / n10];
    return K.timeline(env, {
      height: H2,
      stages: [
        { title: "Split 4 bits into I and Q", text: "16-QAM sends <b>4 bits per symbol</b>. Take the symbol <code>1101</code>. The first two bits <b>11</b> choose the level of the in-phase (I, cosine) carrier: Gray-coded levels 00 → −3, 01 → −1, 11 → +1, 10 → +3. So I = +1.", dur: 4 },
        { title: "The other two bits choose Q", text: "The last two bits <b>01</b> choose the level of the quadrature (Q, sine) carrier, 90° apart from I. Q = −1.", dur: 3.5 },
        { title: "One point = 4 bits", text: "Adding the two carriers, s(t) = I·cos(ωt) − Q·sin(ωt), gives one wave with a specific <b>amplitude and phase</b> — one of 16 constellation points. Neighbours differ by only one bit (Gray mapping).", dur: 4 },
        { title: "A stream of symbols", text: "Every symbol period the transmitter jumps to a new point. Both the <b>height</b> and the <b>phase</b> of the wave change, so each symbol carries 4 bits.", dur: 5 },
        { title: "Noise at 20 dB SNR", text: "The receiver measures I and Q and picks the nearest point (dashed decision lines). At 20 dB the noise clouds are small: " + hiSnr.symErrors + " symbol errors in " + hiSnr.symbols.length + ".", dur: 3.5 },
        { title: "Noise at 12 dB SNR", text: "At 12 dB the clouds spread across the decision lines. Red points were decided wrongly: " + loSnr.symErrors + " symbol errors in " + loSnr.symbols.length + ". More points = more bits but less noise margin.", dur: 3.5 },
        { title: "Higher orders", text: "QPSK (4 points, 2 bits), 16-QAM (16, 4 bits), 64-QAM (64, 6 bits): each doubling of bits per symbol needs roughly 6 dB more SNR. Wi-Fi and 4G/5G switch between them as the signal changes (adaptive modulation).", dur: 4 }
      ],
      draw(ctx, st) {
        const { W, H, i, t } = st, G = layout(W, H), rev = Math.min(1, t * 1.15);
        const amp = rowAmp(G, 3);
        if (i <= 2) {
          const bitsY = G.top + 8, gap = Math.min(34, G.w / 6);
          "1101".split("").forEach((b, k) => label(ctx, b, G.x0 + 20 + k * gap, bitsY, { mono: true, size: 14, bg: k < 2 ? C.bSoft : C.vSoft, border: k < 2 ? C.blue : C.violet, color: k < 2 ? C.blue : C.violet }));
          txt(ctx, "I = +1, Q = −1", G.x0 + 30 + 4 * gap, bitsY, { align: "left", weight: "700", size: 12, color: i === 0 ? C.blue : C.ink });
          const ww = Math.min(G.w, 520), wy = k => G.top + 40 + (G.bot - G.top - 40) * (k + 0.5) / 3;
          wave(ctx, G.x0, wy(0), ww, amp, x => Math.cos(TAU * 4 * x) / 3, { title: "I·cos(ωt), I = +1", color: C.blue });
          if (i >= 1) wave(ctx, G.x0, wy(1), ww, amp, x => Math.sin(TAU * 4 * x) / 3, { title: "−Q·sin(ωt), Q = −1", color: C.violet });
          if (i >= 2) wave(ctx, G.x0, wy(2), ww, amp, x => (Math.cos(TAU * 4 * x) + Math.sin(TAU * 4 * x)) / 3, { title: "Sum s(t)", color: C.primary, reveal: rev });
          if (i === 0) constel(ctx, G.cx, G.cy, G.Rd, Iaxis, { hi: "11", below: true, max: 3 / n10, title: "I levels" });
          else if (i === 1) constel(ctx, G.cx, G.cy, G.Rd, Qaxis, { hi: "01", max: 3 / n10, title: "Q levels" });
          else constel(ctx, G.cx, G.cy, G.Rd, P16, { hi: "1101", lsize: W < 600 ? 9 : 10, title: "16-QAM" });
        } else if (i === 3) {
          const n = syms.length, idx = Math.min(n - 1, Math.floor(rev * n));
          wave(ctx, G.x0, (G.top + G.bot) / 2 + 10, G.w, rowAmp(G, 2) * 1.4, qamWave(syms), { n, labels: syms, hiIdx: idx, reveal: rev, title: "16-QAM signal", color: C.primary });
          constel(ctx, G.cx, G.cy, G.Rd, P16, { hi: syms[idx], lsize: W < 600 ? 9 : 10, title: "16-QAM" });
        } else if (i === 4 || i === 5) {
          const sim = i === 4 ? hiSnr : loSnr;
          constel(ctx, G.cx, G.cy, G.Rd, P16, { rx: cloud(sim), grid, labels: false, title: (i === 4 ? "20" : "12") + " dB SNR" });
          const y = G.top + 20;
          [["SNR", (i === 4 ? 20 : 12) + " dB"], ["Symbols sent", sim.symbols.length], ["Symbol errors", sim.symErrors], ["Bit errors", sim.bitErrors + " / " + sim.totalBits], ["Bit error rate", (sim.ber * 100).toFixed(2) + " %"]].forEach((m, k) => {
            txt(ctx, m[0], G.x0, y + k * 26, { align: "left", size: 12, color: C.soft });
            txt(ctx, String(m[1]), G.x0 + 130, y + k * 26, { align: "left", size: 13, weight: "700", color: k >= 2 && sim.symErrors ? C.red : C.ink });
          });
          txt(ctx, "Simulated: random bits + Gaussian noise (seeded).", G.x0, y + 5 * 26 + 6, { align: "left", size: 10.5, color: C.faint });
        } else {
          const list = [["QPSK", 2, 2], ["16-QAM", 4, 4], ["64-QAM", 8, 6]];
          const wide = W >= 600, size = wide ? Math.min(120, (W - 80) / 3 / 2) : Math.min(70, (W - 40) / 6);
          list.forEach((q, k) => {
            const cx = wide ? W * (k + 0.5) / 3 : (W * (k + 0.5) / 3), cy = wide ? H / 2 - 10 : H / 2 - 20;
            rr(ctx, cx - size, cy - size, 2 * size, 2 * size, 6); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = "#e3e8ee"; ctx.stroke();
            line(ctx, cx - size + 4, cy, cx + size - 4, cy, C.line, 1); line(ctx, cx, cy - size + 4, cx, cy + size - 4, C.line, 1);
            const m = q[1], step = 1.6 * size / m;
            for (let a = 0; a < m; a++) for (let b = 0; b < m; b++) { ctx.beginPath(); ctx.arc(cx - 0.8 * size + (a + 0.5) * step, cy - 0.8 * size + (b + 0.5) * step, m > 4 ? 2.2 : 3.5, 0, TAU); ctx.fillStyle = C.ink; ctx.fill(); }
            txt(ctx, q[0], cx, cy + size + 16, { weight: "700", size: 12.5 });
            txt(ctx, q[2] + " bits/symbol", cx, cy + size + 32, { size: 11, color: C.soft });
          });
        }
      }
    });
  });

  /* ---------- v-mux (generic) ---------- */
  R("v-mux", "viz", "Unit IV · Multiplexing", "How Multiplexing Works", "Several inputs feed a MUX, share one link, and are separated by the DEMUX.", env => K.flow(env, {
    height: 300,
    nodes: {
      a: { x: 0.07, y: 60, type: "pc", label: "A" }, b: { x: 0.07, y: 150, type: "pc", label: "B" }, c: { x: 0.07, y: 240, type: "pc", label: "C" },
      mux: { x: 0.3, y: 150, label: "MUX", sub: "many → one" }, dmx: { x: 0.7, y: 150, label: "DEMUX", sub: "one → many" },
      a2: { x: 0.93, y: 60, type: "pc", label: "A′" }, b2: { x: 0.93, y: 150, type: "pc", label: "B′" }, c2: { x: 0.93, y: 240, type: "pc", label: "C′" }
    },
    edges: [["a", "mux"], ["b", "mux"], ["c", "mux"], ["mux", "dmx", { w: 6, color: C.nav, label: "one shared link", ly: 26 }], ["dmx", "a2"], ["dmx", "b2"], ["dmx", "c2"]],
    stages: [
      { title: "Several senders, one expensive link", text: "Three senders each need to reach a partner far away. Laying three long links would be costly; the single link has more capacity than any one sender needs.", hi: ["a", "b", "c"] },
      { title: "The multiplexer combines", text: "The <b>MUX</b> takes the n input streams and combines them into one signal (many-to-one).", hi: ["mux"], edges: [["a", "mux"], ["b", "mux"], ["c", "mux"]], move: [{ path: ["a", "mux"], label: "A", color: C.primary }, { path: ["b", "mux"], label: "B", color: C.blue }, { path: ["c", "mux"], label: "C", color: C.violet }] },
      { title: "One link carries all of them", text: "The combined signal crosses the single shared link. The link is divided into <b>channels</b> — by frequency (FDM), by time (TDM) or by wavelength (WDM).", edges: [["mux", "dmx"]], move: [{ path: ["mux", "dmx"], label: "A", color: C.primary, dy: -14 }, { path: ["mux", "dmx"], label: "B", color: C.blue, start: 0.1, span: 0.8 }, { path: ["mux", "dmx"], label: "C", color: C.violet, dy: 14, start: 0.2, span: 0.8 }] },
      { title: "The demultiplexer separates", text: "The <b>DEMUX</b> at the far end separates the channels (one-to-many) and delivers each stream to its own receiver.", hi: ["dmx"], edges: [["dmx", "a2"], ["dmx", "b2"], ["dmx", "c2"]], move: [{ path: ["dmx", "a2"], label: "A", color: C.primary }, { path: ["dmx", "b2"], label: "B", color: C.blue }, { path: ["dmx", "c2"], label: "C", color: C.violet }] },
      { title: "Three ways to divide the link", text: "<b>FDM</b>: each input gets its own frequency band all the time (analog, radio, cable TV). <b>TDM</b>: each input gets the whole link for short time slots (digital, T1/E1). <b>WDM</b>: FDM with light — each input gets its own wavelength on a fibre.", hi: ["mux", "dmx"], labels: [{ x: 0.5, y: 112, text: "FDM · TDM · WDM", color: C.primary, bg: C.pSoft, dy: 0 }] }
    ]
  }));

  /* ---------- v-fdm (spectrum view) ---------- */
  R("v-fdm", "viz", "Unit IV · Multiplexing", "FDM in the Frequency Domain", "Three voice signals are shifted to their own carriers, combined into one spectrum, then filtered apart.", env => {
    const cols = [C.primary, C.blue, C.violet], car = [20, 24, 28], FMAX = 36;
    function band(ctx, X, f0, y, h, col, fill) {
      ctx.beginPath(); ctx.moveTo(X(f0 + 0.3), y); ctx.lineTo(X(f0 + 0.8), y - h); ctx.lineTo(X(f0 + 2.6), y - h * 0.78); ctx.lineTo(X(f0 + 3.4), y); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
    }
    function axis(ctx, X, y, x1, x2, ticks) {
      line(ctx, x1, y, x2, y, C.ink, 1.5);
      ticks.forEach(f => { line(ctx, X(f), y, X(f), y + 5, C.ink, 1); txt(ctx, String(f), X(f), y + 15, { size: 10, color: C.soft }); });
          }
    return K.timeline(env, {
      height: 320,
      stages: [
        { title: "Three voice signals, same band", text: "Every voice occupies about 300–3400 Hz. Sent together on one wire they would overlap completely and could never be separated." },
        { title: "Shift each to its own carrier", text: "Each voice modulates a different carrier (here 20, 24 and 28 kHz), which moves its spectrum to its own slot. The shape is preserved; only the position changes.", dur: 4 },
        { title: "Guard bands", text: "Each channel is 4 kHz wide but speech uses only 3.1 kHz of it. The unused gaps (<b>guard bands</b>, amber) keep neighbouring channels from interfering, because real filters do not cut off sharply." },
        { title: "One link carries the composite", text: "The MUX adds the three modulated signals. The single cable carries 20–32 kHz: all three conversations at once, each in its own frequency band, all the time." },
        { title: "Band-pass filters separate them", text: "At the receiver, a <b>band-pass filter</b> tuned to each channel passes only its band (dashed box) and rejects the others.", dur: 4.5 },
        { title: "Demodulate back to baseband", text: "Each filtered band is demodulated (shifted back down) to 0–4 kHz, giving the three original voices." }
      ],
      draw(ctx, st) {
        const { W, H, i, e } = st, x1 = 30, x2 = W - 24, y = 220, hh = 110;
        const X = f => x1 + (x2 - x1) * f / FMAX;
        const ticks = W < 560 ? [0, 4, 20, 28, 36] : [0, 4, 8, 12, 16, 20, 24, 28, 32, 36];
        if (i === 5) {
          const w3 = (W - 40) / 3;
          [0, 1, 2].forEach(k => {
            const ox = 20 + k * w3, Xk = f => ox + 10 + (w3 - 30) * f / 4.5;
            band(ctx, Xk, 0, y, hh, cols[k], "rgba(0,0,0,.03)");
            line(ctx, ox + 10, y, ox + w3 - 20, y, C.ink, 1.5);
            [0, 4].forEach(f => txt(ctx, f + (f ? " kHz" : ""), Xk(f), y + 14, { size: 10, color: C.soft }));
            txt(ctx, "Voice " + "ABC"[k] + (W < 560 ? "" : " recovered"), ox + w3 / 2, y - hh - 18, { weight: "700", size: 12, color: cols[k] });
          });
          return;
        }
        axis(ctx, X, y, x1, x2, ticks);
        txt(ctx, "Spectrum (frequency in kHz)", x1, 22, { align: "left", weight: "700", size: 12, color: C.soft });
        if (i >= 2) for (let k = 0; k < 3; k++) { ctx.fillStyle = "rgba(183,121,31,.16)"; const g1 = car[k] + 3.4, g2 = car[k] + 4.3; ctx.fillRect(X(g1), y - hh - 6, X(g2) - X(g1), hh + 6); }
        if (i >= 2) { ctx.fillStyle = "rgba(183,121,31,.16)"; ctx.fillRect(X(car[0]), y - hh - 6, X(car[0] + 0.3) - X(car[0]), hh + 6); }
        for (let k = 0; k < 3; k++) {
          const off = i === 0 ? 0 : i === 1 ? car[k] * e : car[k];
          band(ctx, X, off, y, hh * (i === 0 ? 1 - k * 0.15 : 1), cols[k], i === 0 ? "rgba(0,0,0,.02)" : (["rgba(11,122,92,.12)", "rgba(31,111,209,.12)", "rgba(107,70,193,.12)"])[k]);
          if (i >= 1) txt(ctx, (i === 1 && e < 1 ? "" : "f" + (k + 1) + " = " + car[k]), X(off + 1.7), y - hh - 16, { size: 11, weight: "700", color: cols[k] });
        }
        if (i === 0) { label(ctx, "A, B, C all at 0.3–3.4 kHz → overlap", X(2) + 120 > x2 ? x2 - 120 : X(2) + 120, y - hh / 2, { color: C.red, border: C.red, size: 11 }); }
        if (i === 2) label(ctx, "guard bands", X(25), y + 36, { color: C.amber, border: C.amber, size: 11 });
        if (i === 3) { line(ctx, X(20), y - hh - 34, X(32), y - hh - 34, C.ink, 1.5); txt(ctx, "one link: 20–32 kHz", X(26), y - hh - 46, { weight: "700", size: 12 }); }
        if (i === 4) {
          const k = Math.min(2, Math.floor(st.t * 3));
          ctx.setLineDash([6, 4]); ctx.strokeStyle = cols[k]; ctx.lineWidth = 2; ctx.strokeRect(X(car[k]), y - hh - 10, X(car[k] + 4) - X(car[k]), hh + 10); ctx.setLineDash([]);
          label(ctx, "band-pass filter " + (k + 1), X(car[k] + 2), y + 38, { color: cols[k], border: cols[k], size: 11 });
        }
      }
    });
  });

  /* ---------- v-tdm (slide example A-E) ---------- */
  const TDM_SLIDE = [["A1", null], ["B1", "B2"], [null, null], ["D1", "D2"], [null, "E2"]];
  function tdmRun(inputs, mode) {
    const r = L.tdm(inputs, mode === "sync" ? "sync" : "stat");
    if (mode === "sync") { r.used = inputs.reduce((s, q) => s + q.filter(Boolean).length, 0); r.efficiency = r.slots ? r.used / r.slots : 0; }
    return r;
  }
  const SRC_COL = [C.primary, C.blue, C.amber, C.violet, C.red, "#0f766e"];
  function drawFrames(ctx, x0, y0, W, frames, mode, nIn, upto) {
    const per = mode === "sync" ? nIn : Math.max.apply(null, frames.map(f => f.length).concat([1]));
    const sw = Math.max(24, Math.min(58, (W - x0 - 20) / (per + 1.2)));
    let count = 0;
    frames.forEach((f, fi) => {
      const y = y0 + fi * (W < 560 ? 52 : 40);
      txt(ctx, "Frame " + (fi + 1), x0, y - 2, { align: "left", size: 11, weight: "700", color: C.soft });
      const bx = x0 + (W < 560 ? 0 : 64), by = W < 560 ? y + 10 : y - 12;
      rr(ctx, bx, by, sw * 0.5, 24, 3); ctx.fillStyle = C.nav; ctx.fill(); txt(ctx, "F", bx + sw * 0.25, by + 12, { size: 10, weight: "700", color: "#fff" });
      f.forEach((slot, k) => {
        if (upto !== undefined && count >= upto) return; count++;
        const sx = bx + sw * 0.6 + k * sw, empty = !slot.data;
        rr(ctx, sx, by, sw - 4, 24, 3); ctx.fillStyle = empty ? C.rSoft : "#fff"; ctx.fill(); ctx.strokeStyle = empty ? C.red : SRC_COL[slot.src % 6]; ctx.lineWidth = 1.5; ctx.stroke();
        const t = empty ? "—" : mode === "sync" ? slot.data : String.fromCharCode(97 + slot.src) + "|" + slot.data;
        txt(ctx, t, sx + (sw - 4) / 2, by + 12.5, { size: sw < 34 ? 9.5 : 11, weight: "700", mono: true, color: empty ? C.red : SRC_COL[slot.src % 6] });
      });
    });
    return count;
  }
  function drawInputs(ctx, x0, y0, inputs, cell) {
    const n = inputs.length, rounds = inputs[0].length, cw = cell || 34;
    txt(ctx, "Inputs", x0, y0 - 14, { align: "left", size: 11, weight: "700", color: C.soft });
    const rects = [];
    inputs.forEach((q, s) => {
      const y = y0 + s * 28;
      txt(ctx, String.fromCharCode(65 + s), x0 + 6, y + 11, { weight: "700", color: SRC_COL[s % 6] });
      for (let r = 0; r < rounds; r++) {
        const x = x0 + 20 + r * (cw + 4);
        rr(ctx, x, y, cw, 22, 3); ctx.fillStyle = q[r] ? "#fff" : "#f3f5f7"; ctx.fill(); ctx.strokeStyle = q[r] ? SRC_COL[s % 6] : "#d5dbe1"; ctx.lineWidth = 1.3; ctx.stroke();
        txt(ctx, q[r] || "·", x + cw / 2, y + 11.5, { size: 10.5, mono: true, weight: "700", color: q[r] ? SRC_COL[s % 6] : C.faint });
        rects.push({ s, r, x, y, w: cw, h: 22 });
      }
    });
    return rects;
  }
  R("v-tdm", "viz", "Unit IV · Multiplexing", "Synchronous vs Statistical TDM", "The slide's A–E example built as synchronous frames and then as statistical frames.", env => {
    const sync = tdmRun(TDM_SLIDE, "sync"), stat = tdmRun(TDM_SLIDE, "stat");
    return K.timeline(env, {
      height: w => w < 560 ? 470 : 330,
      stages: [
        { title: "Five inputs with bursty data", text: "Input A has one data unit, B two, C none, D two and E only one in the second round. This is the example from the slides." },
        { title: "Synchronous TDM: round robin", text: "The MUX visits A, B, C, D, E in turn and gives each a <b>fixed slot</b> in every frame, whether or not it has data. Each frame starts with a framing bit F.", dur: 4.5 },
        { title: "Empty slots are still sent", text: "Two frames = <b>" + sync.slots + " slots</b>, but only <b>" + sync.used + "</b> carry data (red = wasted). Efficiency = " + Math.round(sync.efficiency * 100) + "%. The DEMUX knows the source from the slot <i>position</i>.", dur: 3.5 },
        { title: "Statistical TDM: slots on demand", text: "STDM sends only data from <b>active</b> inputs. Because the position no longer identifies the source, every slot carries an <b>address</b> (a|A1, b|B1 …).", dur: 4.5 },
        { title: "Fewer slots, but address overhead", text: "Now only <b>" + stat.slots + " slots</b> are sent, all carrying data. The cost: extra address bits in every slot, and buffers in the MUX when inputs burst together.", dur: 3.5 }
      ],
      draw(ctx, st) {
        const { W, i, t } = st, narrow = W < 560;
        drawInputs(ctx, 16, 34, TDM_SLIDE, 34);
        const fx = narrow ? 16 : 150, fy = narrow ? 210 : 50;
        if (i === 0) { txt(ctx, "Round 1 · Round 2", 36, 34 + 5 * 28 + 10, { align: "left", size: 10.5, color: C.faint }); return; }
        const mode = i <= 2 ? "sync" : "stat", r = mode === "sync" ? sync : stat;
        txt(ctx, mode === "sync" ? "Synchronous TDM frames" : "Statistical TDM frames", fx, fy - 26, { align: "left", weight: "700", size: 12.5, color: mode === "sync" ? C.blue : C.violet });
        const frames = mode === "sync" ? r.frames : r.frames.map(f => f);
        const total = frames.reduce((s, f) => s + f.length, 0);
        const upto = (i === 1 || i === 3) ? Math.ceil(total * Math.min(1, t * 1.2)) : undefined;
        drawFrames(ctx, fx, fy + 10, W, frames, mode, 5, upto);
        if (i === 2 || i === 4) {
          const y = fy + 10 + frames.length * (narrow ? 52 : 40) + (narrow ? 14 : 10);
          label(ctx, r.slots + " slots sent · " + r.used + " with data · " + Math.round(r.efficiency * 100) + "% slot efficiency", fx + 150, y, { size: 11, color: i === 2 ? C.red : C.primary, border: i === 2 ? C.red : C.primary });
        }
      }
    });
  });

  /* ---------- v-t1 ---------- */
  R("v-t1", "viz", "Unit IV · Multiplexing", "Building a T1 Frame", "One T1 frame built slot by slot, then frames streaming at 8000 per second.", env => {
    const t1 = L.tCarrier(24, 8, 8000, 1), e1 = L.tCarrier(32, 8, 8000, 0);
    function frameBar(ctx, x0, y, w, slots, opts) {
      const total = slots + (opts.F ? 0.6 : 0), sw = w / total;
      let x = x0;
      if (opts.F) { rr(ctx, x, y, sw * 0.6 - 1, 26, 2); ctx.fillStyle = C.red; ctx.fill(); txt(ctx, "F", x + sw * 0.3, y + 13, { size: 10, weight: "700", color: "#fff" }); x += sw * 0.6; }
      const upto = opts.upto === undefined ? slots : opts.upto;
      for (let k = 0; k < slots; k++) {
        const on = k < upto, spec = opts.special && opts.special[k];
        rr(ctx, x + k * sw, y, sw - 1.5, 26, 2); ctx.fillStyle = !on ? "#f3f5f7" : spec ? spec[1] : (k % 2 ? C.bSoft : C.pSoft); ctx.fill();
        if (on && sw > 15) txt(ctx, spec ? spec[0] : String(k + (opts.zero ? 0 : 1)), x + k * sw + sw / 2 - 0.7, y + 13, { size: sw > 26 ? 10 : 8.5, weight: "700", color: C.soft });
      }
    }
    return K.timeline(env, {
      height: 300,
      stages: [
        { title: "24 voice channels, sampled 8000 times a second", text: "Each analog voice channel (up to 4 kHz) is sampled at the Nyquist rate: 2 × 4 kHz = <b>8000 samples/s</b>, one sample every <b>125 µs</b>." },
        { title: "Each sample becomes 8 bits (PCM)", text: "Each sample is quantised to <b>8 bits</b>. 8000 × 8 = <b>64 kbit/s</b> per voice channel — one <b>DS0</b>." },
        { title: "A frame: one sample from every channel", text: "The MUX takes one 8-bit sample from channel 1, then channel 2 … up to 24, and puts a single <b>framing bit F</b> in front: 24 × 8 + 1 = <b>193 bits</b>.", dur: 5 },
        { title: "193 bits every 125 µs", text: "A new frame is needed every 125 µs, i.e. 8000 frames per second: 193 × 8000 = <b>" + (t1.rateBps / 1e6).toFixed(3) + " Mbit/s</b>. Payload 24 × 64 = 1.536 Mbit/s; framing 8 kbit/s." },
        { title: "Frames stream continuously", text: "Frames follow each other without gaps. The DEMUX locks onto the framing-bit pattern, then knows that the 1st byte after F is channel 1, the 2nd is channel 2, and so on — synchronous TDM.", dur: 4 },
        { title: "E1 for comparison", text: "E1 (Europe, India): 32 timeslots × 8 bits × 8000 = <b>" + (e1.rateBps / 1e6).toFixed(3) + " Mbit/s</b>. Slot 0 carries framing and slot 16 signalling, leaving 30 voice channels." }
      ],
      draw(ctx, st) {
        const { W, i, t, time } = st, x0 = 16, w = W - 32;
        if (i === 0) {
          const cols = W < 560 ? 6 : 12, cw = w / cols;
          for (let k = 0; k < 24; k++) { const cx = x0 + (k % cols + 0.5) * cw, cy = 50 + Math.floor(k / cols) * 56; K.shape(ctx, "phone", cx, cy, {}); txt(ctx, "ch " + (k + 1), cx, cy + 24, { size: 10, color: C.soft }); }
          const y = W < 560 ? 270 : 200;
          for (let k = 0; k < 10; k++) { const x = x0 + k * w / 10; line(ctx, x, y - 14, x, y + 14, k === Math.floor(t * 10) ? C.red : C.line, 2); }
          txt(ctx, "sampling instants: every 125 µs", W / 2, y + 26, { size: 11, color: C.soft });
          return;
        }
        if (i === 1) {
          const w2 = Math.min(w, 560), xs = x0;
          ctx.beginPath(); ctx.strokeStyle = C.violet; ctx.lineWidth = 2;
          for (let p = 0; p <= 300; p++) { const x = p / 300, X = xs + x * w2, Y = 110 - 50 * (0.6 * Math.sin(TAU * 1.3 * x) + 0.3 * Math.sin(TAU * 3.1 * x + 1)); if (p) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
          ctx.stroke();
          for (let k = 0; k < 8; k++) { const x = (k + 0.5) / 8, X = xs + x * w2, v = 0.6 * Math.sin(TAU * 1.3 * x) + 0.3 * Math.sin(TAU * 3.1 * x + 1); line(ctx, X, 110, X, 110 - 50 * v, C.blue, 1.5); ctx.beginPath(); ctx.arc(X, 110 - 50 * v, 3.5, 0, TAU); ctx.fillStyle = C.blue; ctx.fill(); }
          line(ctx, xs, 110, xs + w2, 110, "#e3e8ee", 1);
          const v = Math.round((0.6 * Math.sin(TAU * 1.3 * 0.5 / 8) + 0.3 * Math.sin(TAU * 3.1 * 0.5 / 8 + 1)) * 127) & 255;
          label(ctx, "sample → " + L.toBin(v, 8), xs + 100, 200, { mono: true, size: 13, color: C.blue, border: C.blue });
          txt(ctx, "8 bits × 8000 samples/s = 64 kbit/s (DS0)", W / 2, 250, { weight: "700", size: 12.5 });
          return;
        }
        if (i === 2 || i === 3) {
          frameBar(ctx, x0, 90, w, 24, { F: true, upto: i === 2 ? Math.ceil(t * 1.15 * 24) : 24 });
          txt(ctx, "One T1 frame", x0, 70, { align: "left", weight: "700", size: 12.5 });
          if (i === 3) {
            line(ctx, x0, 132, x0 + w, 132, C.ink, 1); K.arrowHead(ctx, x0 + w - 20, 132, x0 + w, 132, C.ink, 7); K.arrowHead(ctx, x0 + 20, 132, x0, 132, C.ink, 7);
            label(ctx, "193 bits = 125 µs", W / 2, 132, { size: 11.5, weight: "700" });
            txt(ctx, "1 + 24 × 8 = 193 bits;   193 × 8000 = 1,544,000 bit/s", W / 2, 180, { size: W < 560 ? 11 : 13, weight: "700", color: C.primary });
          } else txt(ctx, "F = framing bit · each box = 8 bits from one channel", W / 2, 140, { size: 11, color: C.soft });
          return;
        }
        if (i === 4) {
          const fw = Math.max(110, w / 3.2), off = (time * 60) % fw;
          for (let k = -1; k < Math.ceil(w / fw) + 1; k++) {
            const x = x0 + k * fw + off;
            ctx.save(); ctx.beginPath(); ctx.rect(x0, 60, w, 60); ctx.clip();
            rr(ctx, x, 80, 6, 26, 2); ctx.fillStyle = C.red; ctx.fill();
            for (let s = 0; s < 24; s++) { ctx.fillStyle = s % 2 ? C.bSoft : C.pSoft; ctx.fillRect(x + 7 + s * (fw - 10) / 24, 80, (fw - 10) / 24 - 0.8, 26); }
            ctx.restore();
          }
          txt(ctx, "… F | 24 slots | F | 24 slots | F …", W / 2, 140, { mono: true, size: 11.5, color: C.soft });
          txt(ctx, "8000 frames/s × 193 bits = 1.544 Mbit/s", W / 2, 180, { weight: "700", size: 13, color: C.primary });
          return;
        }
        frameBar(ctx, x0, 60, w, 24, { F: true });
        txt(ctx, "T1: 24 slots + F = 193 bits → 1.544 Mbit/s", x0, 44, { align: "left", weight: "700", size: 12 });
        frameBar(ctx, x0, 150, w, 32, { zero: true, special: { 0: ["0", C.rSoft], 16: ["16", C.aSoft] } });
        txt(ctx, "E1: 32 slots × 8 = 256 bits → 2.048 Mbit/s", x0, 134, { align: "left", weight: "700", size: 12 });
        txt(ctx, "slot 0 = framing (red), slot 16 = signalling (amber)", x0, 196, { align: "left", size: 11, color: C.soft });
      }
    });
  });

  /* ---------- v-wdm ---------- */
  const LAMBDA = [["λ1", "1552.52 nm", C.red], ["λ2", "1551.72 nm", C.amber], ["λ3", "1550.92 nm", C.primary], ["λ4", "1550.12 nm", C.blue]];
  R("v-wdm", "viz", "Unit IV · Multiplexing", "Wavelength Division Multiplexing", "Four lasers at different wavelengths merge into one fibre and are separated again by the DEMUX.", env => {
    const nodes = { mux: { x: 0.37, y: 150, label: "MUX", sub: "grating" }, dmx: { x: 0.63, y: 150, label: "DEMUX", sub: "grating" } };
    LAMBDA.forEach((l, k) => { nodes["l" + k] = { x: 0.11, y: 45 + k * 70, label: "Laser " + l[0], sub: l[1] }; nodes["r" + k] = { x: 0.89, y: 45 + k * 70, label: "Rx " + l[0], sub: l[1] }; });
    const edges = [["mux", "dmx", { w: 7, color: C.nav, label: "one optical fibre", ly: 24 }]];
    LAMBDA.forEach((l, k) => { edges.push(["l" + k, "mux", { color: l[2] }]); edges.push(["dmx", "r" + k, { color: l[2] }]); });
    const inMove = LAMBDA.map((l, k) => ({ path: ["l" + k, "mux"], label: l[0], color: l[2] }));
    const fibre = LAMBDA.map((l, k) => ({ path: ["mux", "dmx"], label: l[0], color: l[2], dy: (k - 1.5) * 12, start: k * 0.05, span: 0.8 }));
    const outMove = LAMBDA.map((l, k) => ({ path: ["dmx", "r" + k], label: l[0], color: l[2] }));
    return K.flow(env, {
      height: 330, nodes, edges,
      legend: "Colours are for illustration only: 1550 nm light is infrared and invisible. Wavelengths follow the ITU-T 100 GHz DWDM grid.",
      stages: [
        { title: "One laser per channel", text: "Each data stream drives its own laser (a <b>transponder</b>) at a precise wavelength — a <b>lambda</b>. These four sit on the ITU-T 100 GHz grid around 1550 nm.", hi: ["l0", "l1", "l2", "l3"] },
        { title: "The MUX combines the wavelengths", text: "A diffraction grating or prism (in practice an arrayed waveguide grating or thin-film filters) combines all the wavelengths into one beam.", hi: ["mux"], edges: [["l0", "mux"], ["l1", "mux"], ["l2", "mux"], ["l3", "mux"]], move: inMove },
        { title: "All lambdas share one fibre", text: "The combined light travels down a single fibre. Each wavelength is an independent channel — WDM is FDM at optical frequencies (f = c/λ ≈ 193 THz).", edges: [["mux", "dmx"]], move: fibre, dur: 4 },
        { title: "The DEMUX splits them again", text: "At the far end another grating separates the wavelengths and sends each to its own receiver.", hi: ["dmx"], edges: [["dmx", "r0"], ["dmx", "r1"], ["dmx", "r2"], ["dmx", "r3"]], move: outMove },
        { title: "Each lambda can run at its own rate", text: "Channels are independent: one can carry 10 Gbit/s, another 100 or 400 Gbit/s. Total capacity = sum of all channels. DWDM systems carry 40–96+ lambdas on one fibre.", hi: ["r0", "r1", "r2", "r3"], labels: LAMBDA.map((l, k) => ({ at: "r" + k, text: ["10G", "100G", "400G", "100G"][k], color: l[2], bg: "#fff", dx: 0, dy: -30 })) }
      ]
    });
  });

  /* ===================== SIMULATIONS ===================== */

  /* ---------- s-antenna ---------- */
  const fFromV = v => Math.pow(10, 3 + 7 * v / 1000), vFromF = f => Math.round((Math.log10(f) - 3) / 7 * 1000);
  const PRESETS = [["custom", "Custom"], ["3e3", "Voice sent directly (3 kHz)"], ["1e6", "AM radio (1 MHz)"], ["1e8", "FM radio (100 MHz)"], ["9e8", "GSM (900 MHz)"], ["2.4e9", "Wi-Fi (2.4 GHz)"], ["3.5e9", "5G (3.5 GHz)"]];
  const REFS = [[0.15, "phone (15 cm)"], [1.7, "person (1.7 m)"], [73, "Qutub Minar (~73 m)"], [8849, "Everest (8.8 km)"]];
  R("s-antenna", "sim", "Unit IV · Modulation", "Antenna Size Calculator", "See why we modulate: the antenna length needed for a signal depends on its wavelength λ = c/f.", env => {
    const ctlF = { id: "f", type: "range", label: "Frequency", min: 0, max: 1000, step: 1, value: vFromF(3e3), fmt: v => fmtHz(fFromV(v)) };
    return K.controls(env, {
      height: 250,
      controls: [
        { id: "preset", type: "select", label: "Preset", options: PRESETS, value: "3e3" }, ctlF,
        { id: "kind", type: "select", label: "Antenna", options: [["4", "Quarter-wave (λ/4)"], ["2", "Half-wave dipole (λ/2)"]], value: "4" }
      ],
      init(s) { if (s.preset !== "custom") { const o = env.toolbar.querySelector("#o-f"); if (o) o.textContent = fmtHz(+s.preset); } },
      onChange(s, id) {
        if (id === "preset" && s.preset !== "custom") { s.f = vFromF(+s.preset); setCtl(env, "f", s.f); const o = env.toolbar.querySelector("#o-f"); if (o) o.textContent = fmtHz(+s.preset); }
        if (id === "f") { s.preset = "custom"; setCtl(env, "preset", "custom"); }
      },
      compute(s) { const f = s.preset !== "custom" ? +s.preset : fFromV(s.f), lam = L.wavelength(f); return { f, lam, ant: lam / +s.kind }; },
      draw(ctx, s, { W }) {
        const o = s.out, x1 = 20, x2 = W - 20, y = 120, lo = -3, hi = 5;
        const X = m => x1 + (x2 - x1) * (Math.log10(Math.max(1e-3, m)) - lo) / (hi - lo);
        txt(ctx, "Antenna length (log scale)", x1, 18, { align: "left", weight: "700", size: 12, color: C.soft });
        line(ctx, x1, y, x2, y, C.ink, 1.5);
        ["1 mm", "1 cm", "10 cm", "1 m", "10 m", "100 m", "1 km", "10 km", "100 km"].forEach((l, k) => { const x = x1 + (x2 - x1) * k / 8; line(ctx, x, y, x, y + 6, C.ink, 1); if (W >= 560 || k % 2 === 0) txt(ctx, l, x, y + 18, { size: 10, color: C.soft }); });
        REFS.forEach((r, k) => { const x = X(r[0]); line(ctx, x, y - 4, x, y - 30 - (k % 2) * 22, C.faint, 1, [3, 3]); txt(ctx, r[1], x, y - 38 - (k % 2) * 22, { size: W < 560 ? 9.5 : 10.5, color: C.faint }); });
        const ax = X(o.ant), out = o.ant > 1e5 || o.ant < 1e-3;
        rr(ctx, x1, y - 8, Math.max(2, Math.min(x2, ax) - x1), 16, 4); ctx.fillStyle = out ? "rgba(197,48,48,.25)" : "rgba(11,122,92,.25)"; ctx.fill();
        line(ctx, Math.min(x2, ax), y - 14, Math.min(x2, ax), y + 14, out ? C.red : C.primary, 3);
        label(ctx, "antenna ≈ " + fmtLen(o.ant), Math.max(x1 + 70, Math.min(x2 - 70, ax)), y + 44, { color: "#fff", bg: o.ant > 1000 ? C.red : C.primary, border: o.ant > 1000 ? C.red : C.primary, size: 12 });
        txt(ctx, "λ = c / f = 3×10⁸ / " + fmtHz(o.f) + " = " + fmtLen(o.lam), W / 2, 210, { size: W < 560 ? 11 : 13, weight: "700" });
      },
      readout(s) {
        const o = s.out, verdict = o.ant > 1000 ? '<b style="color:var(--red)">Impractical.</b> No one can build or mount an antenna this long — this is why baseband voice is never radiated directly.' : o.ant > 20 ? "<b>Large but buildable</b> — typical of broadcast towers (e.g. AM medium-wave masts)." : o.ant > 0.2 ? "<b>Practical</b> — a rooftop, car or handheld antenna." : '<b style="color:var(--primary)">Fits inside a device.</b> This is why phones use GHz carriers.';
        return verdict + metrics([["Frequency", fmtHz(o.f)], ["Wavelength", fmtLen(o.lam), "λ = c / f"], ["Antenna length", fmtLen(o.ant), s.kind === "4" ? "λ / 4" : "λ / 2"]]) +
          '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Modulation moves the message onto a high-frequency carrier, so the antenna only has to match the carrier\'s wavelength. Real antennas are often shortened further with loading coils or dielectrics.</p>';
      }
    });
  });

  /* ---------- s-analogmod ---------- */
  R("s-analogmod", "sim", "Unit IV · Analog Modulation", "AM / FM / PM Lab", "Change the modulation type and index; watch the waveform and spectrum, and read the bandwidth and power.", env => K.controls(env, {
    height: w => w < 560 ? 420 : 380,
    controls: [
      { id: "type", type: "select", label: "Type", options: ["AM", "FM", "PM"], value: "AM" },
      { id: "fc", type: "range", label: "Carrier fc", min: 20, max: 200, step: 5, value: 100, unit: "kHz" },
      { id: "fm", type: "range", label: "Message fm", min: 1, max: 10, step: 0.5, value: 5, unit: "kHz" },
      { id: "m", type: "range", label: "AM index m", min: 0, max: 2, step: 0.05, value: 0.8 },
      { id: "df", type: "range", label: "FM deviation Δf", min: 0, max: 75, step: 1, value: 15, unit: "kHz" },
      { id: "kp", type: "range", label: "PM deviation", min: 0, max: 6, step: 0.1, value: 2, unit: "rad" }
    ],
    compute(s) {
      showCtl(env, "m", s.type === "AM"); showCtl(env, "df", s.type === "FM"); showCtl(env, "kp", s.type === "PM");
      const fc = s.fc * 1e3, fm = s.fm * 1e3;
      if (s.type === "AM") { const a = L.amStats(s.m, fm, 1); return { fc, fm, bw: a.bandwidth, a, lines: [[0, 1], [-1, s.m / 2], [1, s.m / 2]] }; }
      const beta = s.type === "FM" ? L.fmStats(s.df * 1e3, fm).beta : s.kp;
      const df = beta * fm, bw = 2 * (df + fm), lines = [];
      const nMax = Math.ceil(beta + 3);
      for (let n = -nMax; n <= nMax; n++) lines.push([n, Math.abs(besselJ(n, beta))]);
      return { fc, fm, beta, df, bw, lines };
    },
    draw(ctx, s, { W, H }) {
      const o = s.out, x0 = W < 560 ? 12 : 120, x1 = W - 14, w = x1 - x0;
      // Carrier drawn slowed down so it stays visible; numbers use the real values.
      const cyc = Math.max(4, Math.min(o.fc / o.fm, Math.floor(w / 26)));
      const scaled = cyc < o.fc / o.fm;
      const p = { fc: cyc, fm: 1, m: s.m, beta: o.beta || 0, kp: s.kp };
      const lab = (t, y) => { if (W < 560) txt(ctx, t, x0, y - 44, { align: "left", weight: "700", size: 11 }); else txt(ctx, t, 10, y, { align: "left", weight: "700", size: 12 }); };
      const y1 = W < 560 ? 70 : 50, y2 = W < 560 ? 175 : 150;
      lab("Message", y1); wave(ctx, x0, y1, w, 26, x => Math.cos(TAU * 2 * x), { color: C.violet });
      lab(s.type + " signal", y2);
      const norm = s.type === "AM" ? 1 + s.m : 1;
      wave(ctx, x0, y2, w, 36, x => L.analogMod(s.type, 2 * x, p) / norm, { color: s.type === "AM" && s.m > 1 ? C.red : C.blue, lw: 1.5 });
      if (s.type === "AM") [1, -1].forEach(sg => { ctx.beginPath(); ctx.setLineDash([5, 4]); ctx.strokeStyle = C.amber; ctx.lineWidth = 1.3; for (let k = 0; k <= 200; k++) { const x = k / 200, v = Math.abs(1 + s.m * Math.cos(TAU * 2 * x)) / norm; if (k) ctx.lineTo(x0 + x * w, y2 - sg * v * 36); else ctx.moveTo(x0 + x * w, y2 - sg * v * 36); } ctx.stroke(); ctx.setLineDash([]); });
      if (scaled) txt(ctx, "carrier drawn slowed down (" + Math.round(o.fc / o.fm) + " real cycles per message cycle)", x1, y2 + 48, { align: "right", size: 10, color: C.faint });
      // Spectrum
      const ys = H - 34, sh = W < 560 ? 90 : 100;
      lab("Spectrum", ys - 50);
      const span = Math.max(3 * o.fm, (o.bw || 0) * 0.75), fL = o.fc - span, fR = o.fc + span;
      const X = f => x0 + w * (f - fL) / (fR - fL);
      line(ctx, x0, ys, x1, ys, C.ink, 1.3);
      const mx = Math.max.apply(null, o.lines.map(l => l[1])) || 1;
      o.lines.forEach(([n, a]) => { const f = o.fc + n * o.fm; if (f < fL || f > fR) return; line(ctx, X(f), ys, X(f), ys - sh * a / mx, n === 0 ? C.blue : C.primary, 3); });
      if (o.bw) { const a = X(o.fc - o.bw / 2), b = X(o.fc + o.bw / 2); line(ctx, a, ys + 12, b, ys + 12, C.amber, 1.5); line(ctx, a, ys + 6, a, ys + 18, C.amber, 1.5); line(ctx, b, ys + 6, b, ys + 18, C.amber, 1.5); txt(ctx, (s.type === "AM" ? "BW = 2fm = " : "Carson BW ≈ ") + fmtHz(o.bw), (a + b) / 2, ys + 26, { size: 10.5, weight: "700", color: C.amber }); }
      txt(ctx, "fc", X(o.fc), ys - sh - 10, { size: 10.5, weight: "700", color: C.blue });
    },
    readout(s) {
      const o = s.out;
      if (s.type === "AM") {
        const a = o.a;
        return (a.overmodulated ? '<b style="color:var(--red)">Overmodulated (m > 1).</b> The envelope (dashed) folds through zero, so an envelope detector outputs a distorted message.' : "<b>AM:</b> the envelope follows the message. Sidebands sit at fc ± fm with amplitude m/2 each.") +
          metrics([["Bandwidth", fmtHz(o.bw), "2 × fm"], ["Total power", a.totalPower.toFixed(3) + " W", "carrier power 1 W"], ["Power in sidebands", (a.efficiency * 100).toFixed(1) + " %"], ["Modulation index", s.m.toFixed(2), a.overmodulated ? "m > 1" : "m", a.overmodulated ? "warn" : ""]]) +
          '<p class="muted" style="font-size:.85rem;margin:6px 0 0">P<sub>total</sub> = P<sub>c</sub>(1 + m²/2). Even at m = 1 only 33% of the power carries information — AM is power-inefficient.</p>';
      }
      const sig = o.lines.filter(l => l[1] > 0.01).length;
      return "<b>" + s.type + ":</b> constant amplitude; " + (s.type === "FM" ? "the frequency deviates by ±" + fmtHz(o.df) + "." : "the phase deviates by ±" + s.kp.toFixed(1) + " rad, so the frequency deviation is β·fm = " + fmtHz(o.df) + ".") +
        metrics([["Modulation index", o.beta.toFixed(2), "β = Δf / fm"], ["Carson bandwidth", fmtHz(o.bw), "2(Δf + fm)"], ["Significant sidebands", sig, "lines above 1%"], ["Power left in carrier", (besselJ(0, o.beta) ** 2 * 100).toFixed(1) + " %", "J₀(β)²"]]) +
        '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Spectral lines at fc ± n·fm have amplitudes |Jₙ(β)| (Bessel functions). Larger β = more sidebands = more bandwidth but better noise immunity. Broadcast FM uses Δf = 75 kHz.</p>';
    }
  }));

  /* ---------- s-digitalmod ---------- */
  const DM_PTS = s => s === "ASK" ? { "0": [0, 0], "1": [Math.SQRT2, 0] } : s === "FSK" ? { "0": [1, 0], "1": [0, 1] } : L.SCHEMES[s].points;
  const DM_BPS = s => L.SCHEMES[s].bitsPerSymbol;
  const DM_DEF = { ASK: "10110010", FSK: "10110010", BPSK: "10110010", QPSK: "00011011", "8PSK": "000001011010110111101100", "16QAM": "1011000111100100" };
  // AWGN channel with unit average symbol energy (Es/N0 = SNR) plus optional per-symbol gain fluctuation.
  function dmSimulate(scheme, bits, snrDb, fade, seed) {
    const r = L.rng(seed), pts = DM_PTS(scheme), keys = Object.keys(pts), syms = L.toSymbols(bits, scheme);
    const sigma = Math.sqrt(1 / (2 * Math.pow(10, snrDb / 10)));
    let be = 0, se = 0;
    const rx = syms.map(s => {
      const g = 1 + fade * (2 * r() - 1), p = pts[s];
      const y = [g * p[0] + sigma * L.gauss(r), g * p[1] + sigma * L.gauss(r)];
      let best = keys[0], bd = Infinity;
      if (scheme === "FSK") best = y[1] > y[0] ? "1" : "0";
      else keys.forEach(k => { const d = (pts[k][0] - y[0]) ** 2 + (pts[k][1] - y[1]) ** 2; if (d < bd) { bd = d; best = k; } });
      if (best !== s) se++;
      for (let k = 0; k < s.length; k++) if (best[k] !== s[k]) be++;
      return { sent: s, point: y, decided: best };
    });
    const total = syms.length * DM_BPS(scheme);
    return { syms, rx, bitErrors: be, symErrors: se, totalBits: total, ber: total ? be / total : 0 };
  }
  function dmTheory(scheme, snrDb) {
    const es = Math.pow(10, snrDb / 10);
    if (scheme === "BPSK") return Qf(Math.sqrt(2 * es));
    if (scheme === "QPSK" || scheme === "ASK" || scheme === "FSK") return Qf(Math.sqrt(es));
    if (scheme === "8PSK") return 2 * Qf(Math.sqrt(2 * es) * Math.sin(Math.PI / 8)) / 3;
    return 0.75 * Qf(Math.sqrt(es / 5));
  }
  R("s-digitalmod", "sim", "Unit IV · Digital Modulation", "Digital Modulation Lab", "Send your bits with ASK, FSK, BPSK, QPSK, 8-PSK or 16-QAM through a noisy channel and watch the constellation and bit errors.", env => K.controls(env, {
    height: w => w < 600 ? 2 * Math.min(110, (w - 24) / 2) + 200 : 340,
    controls: [
      { id: "bits", type: "text", label: "Bits", value: "10110010", max: 32, width: 170, mono: true, sanitize: v => v.replace(/[^01]/g, "") || "0" },
      { id: "scheme", type: "select", label: "Scheme", options: [["ASK", "ASK (OOK)"], ["FSK", "FSK"], ["BPSK", "BPSK"], ["QPSK", "QPSK"], ["8PSK", "8-PSK"], ["16QAM", "16-QAM"]], value: "FSK" },
      { id: "snr", type: "range", label: "SNR (Es/N0)", min: 0, max: 30, step: 1, value: 18, unit: "dB" },
      { id: "fade", type: "range", label: "Gain fluctuation", min: 0, max: 80, step: 5, value: 0, unit: "%" },
      { id: "seed", type: "button", label: "New noise", icon: "reset", onClick: s => { s.seedv = (s.seedv || 1) + 1; } }
    ],
    init(s) { if (!env.params.bits && DM_DEF[s.scheme]) { s.bits = DM_DEF[s.scheme]; setCtl(env, "bits", s.bits); } },
    compute(s) {
      const seed = 17 + (s.seedv || 1) * 101, fade = s.fade / 100;
      const user = dmSimulate(s.scheme, s.bits, s.snr, fade, seed);
      const r = L.rng(seed + 7); let rb = ""; for (let k = 0; k < 2400; k++) rb += r() < 0.5 ? "0" : "1";
      const stats = dmSimulate(s.scheme, rb, s.snr, fade, seed + 3);
      return { user, stats, theory: dmTheory(s.scheme, s.snr) };
    },
    draw(ctx, s, { W, H }) {
      const o = s.out, wide = W >= 600, pts = DM_PTS(s.scheme);
      const Rd = wide ? Math.min(150, H / 2 - 24) : Math.min(110, (W - 24) / 2);
      const cx = wide ? W - Rd - 16 : W / 2, cy = wide ? H / 2 + 8 : Rd + 24;
      const grid = s.scheme === "16QAM" ? [-2 / Math.sqrt(10), 0, 2 / Math.sqrt(10)] : [];
      const cloud = o.stats.rx.slice(0, 700).map(p => ({ x: p.point[0], y: p.point[1], c: p.decided === p.sent ? "rgba(31,111,209,.28)" : "rgba(197,48,48,.7)", s: 2.5 }));
      o.user.rx.forEach(p => cloud.push({ x: p.point[0], y: p.point[1], c: p.decided === p.sent ? C.primary : C.red, s: 5 }));
      constel(ctx, cx, cy, Rd, pts, { rx: cloud, grid, lsize: s.scheme === "16QAM" ? 9 : 10.5, below: s.scheme === "BPSK" || s.scheme === "ASK", xLabel: s.scheme === "FSK" ? "space" : "I", yLabel: s.scheme === "FSK" ? "mark" : "Q", title: s.scheme === "FSK" ? "FSK signal space" : "Constellation" });
      // Waveform of the user's symbols (first 8)
      const syms = o.user.syms.slice(0, 8), n = syms.length;
      const x0 = wide ? 16 : 12, w = wide ? W - 2 * Rd - 60 : W - 24, y = wide ? H / 2 - 30 : 2 * Rd + 112;
      txt(ctx, "Transmitted waveform" + (o.user.syms.length > 8 ? " (first 8 symbols)" : ""), x0, y - 66, { align: "left", weight: "700", size: 12 });
      wave(ctx, x0, y, w, 34, x => L.modWave(s.scheme, syms, x, 2) * (s.scheme === "16QAM" ? 1 : 1), { n, labels: syms, color: C.blue, lw: 1.6 });
      const dy = y + 52;
      txt(ctx, "Decided:", x0, dy, { align: "left", size: 11, color: C.soft, weight: "600" });
      o.user.rx.slice(0, 8).forEach((p, k) => { const bad = p.decided !== p.sent; txt(ctx, p.decided, x0 + (k + 0.5) * w / n, dy + 18, { mono: true, size: 11, weight: "700", color: bad ? C.red : C.primary }); });
    },
    readout(s) {
      const o = s.out, u = o.user, st = o.stats, bps = DM_BPS(s.scheme);
      const msg = u.bitErrors ? '<b style="color:var(--red)">' + u.bitErrors + " of your " + u.totalBits + " bits were decided wrongly.</b> Noise pushed those symbols across a decision boundary." : '<b style="color:var(--primary)">All your bits were recovered.</b> Each received point (large dot) is nearest to the point that was sent.';
      const pad = u.totalBits > s.bits.length ? ' <span class="muted">(padded with ' + (u.totalBits - s.bits.length) + " zero bit(s) to fill the last symbol)</span>" : "";
      return msg + pad + metrics([
        ["Bits per symbol", bps], ["Your symbols", u.syms.length + " (" + u.symErrors + " wrong)"],
        ["Measured BER (2400 random bits)", (st.ber * 100).toFixed(2) + " %", st.bitErrors + " errors", st.ber > 0.01 ? "warn" : ""],
        s.fade === 0 ? ["Theory (noise only, approx.)", (o.theory * 100).toFixed(o.theory < 1e-4 ? 4 : 2) + " %"] : ["Gain fluctuation", "±" + s.fade + " %", "theory n/a"]
      ]) +
        '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Simulated (seeded Gaussian noise), not measured on hardware. SNR is the average symbol energy over noise density. At equal average power, coherent ASK and FSK have similar noise performance; raise the <b>gain fluctuation</b> to see why ASK fails first in practice — its threshold depends on amplitude, while FSK compares two frequencies and PSK only the phase.</p>';
    }
  }), { scheme: "FSK" });

  /* ---------- s-mux (FDM | TDM) ---------- */
  const MUX_COL = [C.primary, C.blue, C.amber, C.violet, C.red, "#0f766e", "#9d174d", "#4d7c0f", "#1e40af", "#92400e", "#6d28d9", "#0e7490"];
  R("s-mux", "sim", "Unit IV · Multiplexing", "Multiplexing Lab (FDM and TDM)", "Build an FDM spectrum with guard bands, or fill TDM frames — synchronous vs statistical — and compare the efficiency.", env => K.controls(env, {
    height: w => w < 600 ? 470 : 330,
    controls: [
      { id: "mode", type: "select", label: "Mode", options: [["FDM", "FDM"], ["TDM", "Synchronous TDM"], ["STDM", "Statistical TDM"]], value: "FDM" },
      { id: "n", type: "range", label: "Channels", min: 2, max: 12, step: 1, value: 3 },
      { id: "bw", type: "range", label: "Channel bandwidth", min: 1, max: 20, step: 1, value: 4, unit: "kHz" },
      { id: "guard", type: "range", label: "Guard band", min: 0, max: 2000, step: 100, value: 500, unit: "Hz" },
      { id: "rounds", type: "range", label: "Frames", min: 1, max: 4, step: 1, value: 2 },
      { id: "slide", type: "button", label: "Slide example", onClick: s => { s.grid = TDM_SLIDE.map(q => [!!q[0], !!q[1], false, false]); s.rounds = 2; setCtl(env, "rounds", 2, { unit: "" }); } },
      { id: "all", type: "button", label: "All active", onClick: s => { s.grid = s.grid.map(() => [true, true, true, true]); } },
      { id: "none", type: "button", label: "Clear", onClick: s => { s.grid = s.grid.map(() => [false, false, false, false]); } }
    ],
    init(s) { s.grid = TDM_SLIDE.map(q => [!!q[0], !!q[1], false, false]); },
    click(s, p) { if (s.mode === "FDM") return; const c = (s._cells || []).find(c => p.x >= c.x && p.x <= c.x + c.w && p.y >= c.y && p.y <= c.y + c.h); if (c) s.grid[c.s][c.r] = !s.grid[c.s][c.r]; },
    compute(s) {
      const fdm = s.mode === "FDM";
      ["n", "bw", "guard"].forEach(id => showCtl(env, id, fdm)); ["rounds", "slide", "all", "none"].forEach(id => showCtl(env, id, !fdm));
      if (fdm) { const total = L.fdmBandwidth(s.n, s.bw * 1e3, s.guard); return { total, guardTotal: (s.n - 1) * s.guard }; }
      const inputs = s.grid.map((row, k) => row.slice(0, s.rounds).map((on, r) => on ? String.fromCharCode(65 + k) + (r + 1) : null));
      const sync = tdmRun(inputs, "sync"), stat = tdmRun(inputs, "stat");
      const n = inputs.length, addr = Math.ceil(Math.log2(n)), unit = 8;
      const syncBits = sync.frames.length * (n * unit + 1), statBits = stat.slots * (unit + addr) + stat.frames.length;
      return { inputs, sync, stat, addr, syncBits, statBits, dataBits: sync.used * unit };
    },
    draw(ctx, s, { W, H }) {
      const o = s.out;
      if (s.mode === "FDM") {
        const x1 = 24, x2 = W - 20, y = H - 70, hh = Math.min(150, H - 140), tot = o.total;
        const X = f => x1 + (x2 - x1) * f / tot;
        txt(ctx, "Link spectrum: " + s.n + " channels × " + s.bw + " kHz + " + (s.n - 1) + " guard bands", x1, 22, { align: "left", weight: "700", size: 12, color: C.soft });
        line(ctx, x1, y, x2, y, C.ink, 1.5);
        for (let k = 0; k < s.n; k++) {
          const f0 = k * (s.bw * 1e3 + s.guard), f1 = f0 + s.bw * 1e3, col = MUX_COL[k % 12];
          ctx.fillStyle = col + "22"; ctx.fillRect(X(f0), y - hh, X(f1) - X(f0), hh); ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.strokeRect(X(f0), y - hh, X(f1) - X(f0), hh);
          if (X(f1) - X(f0) > 18) txt(ctx, "Ch " + (k + 1), (X(f0) + X(f1)) / 2, y - hh / 2, { size: X(f1) - X(f0) > 40 ? 11 : 9, weight: "700", color: col });
          if (k < s.n - 1 && s.guard > 0) { ctx.fillStyle = "rgba(183,121,31,.3)"; ctx.fillRect(X(f1), y - hh, X(f1 + s.guard) - X(f1), hh); }
          if (k < s.n - 1 && s.guard === 0) { line(ctx, X(f1), y - hh - 8, X(f1), y + 4, C.red, 2); }
        }
        txt(ctx, "0", x1, y + 14, { size: 10, color: C.soft }); txt(ctx, fmtHz(tot), x2, y + 14, { size: 10, color: C.soft, align: "right" });
        if (s.guard === 0) label(ctx, "no guard bands: filter skirts overlap → crosstalk", W / 2, y + 40, { size: 11, color: C.red, border: C.red });
        else label(ctx, "amber = guard bands (" + s.guard + " Hz each)", W / 2, y + 40, { size: 11, color: C.amber, border: C.amber });
        return;
      }
      const narrow = W < 600;
      s._cells = drawInputs(ctx, 16, 40, o.inputs, 34);
      txt(ctx, "click a cell to add/remove data", 16, 40 + 5 * 28 + 10, { align: "left", size: 10.5, color: C.faint });
      const r = s.mode === "TDM" ? o.sync : o.stat, mode = s.mode === "TDM" ? "sync" : "stat";
      const fx = narrow ? 16 : Math.max(200, 60 + s.rounds * 38 + 40), fy = narrow ? 240 : 40;
      txt(ctx, mode === "sync" ? "Synchronous TDM frames" : "Statistical TDM frames (address|data)", fx, fy - 18, { align: "left", weight: "700", size: 12, color: mode === "sync" ? C.blue : C.violet });
      if (!r.frames.length) { txt(ctx, "No data to send — statistical TDM sends nothing.", fx, fy + 20, { align: "left", size: 12, color: C.soft }); return; }
      const maxF = Math.max(1, Math.floor((H - fy - 20) / (W < 560 ? 52 : 40)));
      drawFrames(ctx, fx, fy + 12, W, r.frames.slice(0, maxF), mode, 5);
      if (r.frames.length > maxF) txt(ctx, "+ " + (r.frames.length - maxF) + " more frame(s)", fx, H - 10, { align: "left", size: 10.5, color: C.faint });
    },
    readout(s) {
      const o = s.out;
      if (s.mode === "FDM") {
        const pct = o.total ? o.guardTotal / o.total * 100 : 0;
        return "<b>Total link bandwidth</b> = n × B + (n − 1) × G = " + s.n + " × " + s.bw + " kHz + " + (s.n - 1) + " × " + s.guard + " Hz = <b>" + fmtHz(o.total) + "</b>." +
          metrics([["Channels", s.n], ["Link bandwidth", fmtHz(o.total)], ["Spent on guard bands", fmtHz(o.guardTotal) + " (" + pct.toFixed(1) + " %)", "", s.guard === 0 ? "warn" : ""]]) +
          '<p class="muted" style="font-size:.85rem;margin:6px 0 0">' + (s.guard === 0 ? "Without guard bands, real (non-ideal) band-pass filters let part of each neighbour through, causing crosstalk." : "Guard bands waste some spectrum but let practical filters separate the channels cleanly.") + "</p>";
      }
      const sy = o.sync, st = o.stat;
      return (s.mode === "TDM" ? "<b>Synchronous TDM</b> sends a slot for every input in every frame, so idle inputs waste slots. The slot <i>position</i> identifies the source." : "<b>Statistical TDM</b> sends only data from active inputs. Each slot carries a " + o.addr + "-bit address, because position no longer identifies the source.") +
        metrics([["Sync: slots sent", sy.slots + " (" + sy.used + " used, " + Math.round(sy.efficiency * 100) + " %)", "", s.mode === "TDM" && sy.efficiency < 0.7 ? "warn" : ""], ["Stat: slots sent", st.slots + " (all carry data)"], ["Sync bits on link", o.syncBits, "8-bit slots + 1 framing bit/frame"], ["Stat bits on link", o.statBits, "(8 + " + o.addr + ")-bit slots + framing"]]) +
        '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Data bits actually delivered: ' + o.dataBits + ". " + (o.statBits < o.syncBits ? "Statistical TDM is more efficient for this bursty traffic." : o.statBits > o.syncBits ? "With every input busy, statistical TDM's address overhead makes it <b>less</b> efficient than synchronous TDM." : "Both use the same number of bits here.") + "</p>";
    }
  }), { mode: "FDM" });

  /* ---------- s-t1 ---------- */
  R("s-t1", "sim", "Unit IV · Multiplexing", "T-Carrier and FDM Hierarchy Calculator", "Change the slots, bits per sample and framing bits to build T1, E1 or your own carrier; then size an FDM channel group.", env => {
    const cSlots = { id: "slots", type: "range", label: "Timeslots", min: 1, max: 48, step: 1, value: 24 }, cFr = { id: "frame", type: "range", label: "Framing bits/frame", min: 0, max: 8, step: 1, value: 1 };
    return K.controls(env, {
      height: w => w < 560 ? 330 : 280,
      controls: [
        { id: "preset", type: "select", label: "Preset", options: [["T1", "T1 (North America)"], ["E1", "E1 (Europe, India)"], ["custom", "Custom"]], value: "T1" },
        cSlots, { id: "bits", type: "select", label: "Bits per sample", options: [["8", "8"], ["7", "7"]], value: "8" }, cFr,
        { id: "voice", type: "range", label: "FDM: voice channels", min: 1, max: 3600, step: 1, value: 600 }
      ],
      onChange(s, id) {
        if (id === "preset") { if (s.preset === "T1") { s.slots = 24; s.frame = 1; s.bits = "8"; } else if (s.preset === "E1") { s.slots = 32; s.frame = 0; s.bits = "8"; } setCtl(env, "slots", s.slots, cSlots); setCtl(env, "frame", s.frame, cFr); setCtl(env, "bits", s.bits); }
        else if (id === "slots" || id === "frame" || id === "bits") { s.preset = "custom"; setCtl(env, "preset", "custom"); }
      },
      compute(s) {
        const t = L.tCarrier(s.slots, +s.bits, 8000, s.frame);
        const known = t.rateBps === 1544000 ? "T1 / DS1" : t.rateBps === 2048000 ? "E1" : t.rateBps === 64000 ? "DS0" : t.rateBps === 56000 ? "DS0 (7-bit, robbed-bit)" : null;
        const H = L.FDM_HIERARCHY, v = s.voice;
        const groups = Math.ceil(v / 12), sg = Math.ceil(v / 60), mg = Math.ceil(v / 600), jg = Math.ceil(v / 3600);
        return { t, known, fdm: [[H[1].name, groups, H[1].bandwidth], [H[2].name, sg, H[2].bandwidth], [H[3].name, mg, H[3].bandwidth], [H[4].name, jg, H[4].bandwidth]] };
      },
      draw(ctx, s, { W }) {
        const o = s.out, x0 = 16, w = W - 32, n = s.slots, fbits = s.frame, total = n * +s.bits + fbits;
        txt(ctx, "One frame (" + total + " bits, every 125 µs)", x0, 18, { align: "left", weight: "700", size: 12 });
        const unitW = w / total;
        let x = x0;
        if (fbits) { rr(ctx, x, 32, Math.max(2, unitW * fbits - 1), 28, 2); ctx.fillStyle = C.red; ctx.fill(); if (unitW * fbits > 10) txt(ctx, "F", x + unitW * fbits / 2, 46, { size: 10, weight: "700", color: "#fff" }); x += unitW * fbits; }
        for (let k = 0; k < n; k++) { const sw = unitW * +s.bits; rr(ctx, x + k * sw, 32, Math.max(1, sw - 1), 28, 2); ctx.fillStyle = s.preset === "E1" && (k === 0 || k === 16) ? (k === 0 ? C.rSoft : C.aSoft) : k % 2 ? C.bSoft : C.pSoft; ctx.fill(); if (sw > 18) txt(ctx, String(s.preset === "E1" ? k : k + 1), x + k * sw + sw / 2, 46, { size: sw > 26 ? 10 : 8.5, color: C.soft, weight: "700" }); }
        txt(ctx, "Rate = " + total + " bits × 8000 frames/s = " + fmtRate(o.t.rateBps) + (o.known ? "  →  " + o.known : ""), x0, 82, { align: "left", size: W < 560 ? 11 : 12.5, weight: "700", color: o.known ? C.primary : C.ink });
        const y0 = 120;
        txt(ctx, "Analog FDM hierarchy for " + s.voice + " voice channels", x0, y0, { align: "left", weight: "700", size: 12 });
        const maxC = Math.max.apply(null, o.fdm.map(f => f[1]));
        const lw = W < 560 ? 0 : 130, bw = w - lw - 70;
        o.fdm.forEach((f, k) => {
          const y = y0 + 26 + k * (W < 560 ? 48 : 36);
          if (W < 560) txt(ctx, f[0] + " (" + f[2] + " each)", x0, y - 12, { align: "left", size: 10.5, color: C.soft }); else txt(ctx, f[0], x0, y + 8, { align: "left", size: 11.5, weight: "600" });
          const len = Math.max(4, bw * Math.log10(f[1] + 1) / Math.log10(maxC + 1));
          rr(ctx, x0 + lw, y, len, 16, 3); ctx.fillStyle = [C.primary, C.blue, C.violet, C.amber][k]; ctx.fill();
          txt(ctx, "× " + f[1], x0 + lw + len + 8, y + 8, { align: "left", size: 11.5, weight: "700" });
        });
      },
      readout(s) {
        const o = s.out, t = o.t;
        return (o.known ? "<b>You built " + o.known + ".</b> " : "<b>Custom carrier.</b> ") + "Frame = " + s.slots + " × " + s.bits + " + " + s.frame + " = " + t.frameBits + " bits; 8000 frames/s." +
          metrics([["Line rate", fmtRate(t.rateBps)], ["Payload", fmtRate(t.payloadBps)], ["Framing overhead", fmtRate(t.overheadBps)], ["Per channel", fmtRate(+s.bits * 8000)]]) +
          '<p class="muted" style="font-size:.85rem;margin:6px 0 0">FDM: group = 12 channels (48 kHz), supergroup = 60 (240 kHz), mastergroup = 600 (≈2.52 MHz, AT&amp;T plan), jumbogroup = 3600. Bars use a log scale. E1 carries framing inside slot 0, so its framing-bit setting is 0.</p>';
      }
    });
  });

  /* ---------- s-wdm ---------- */
  const lamCol = k => ["#c53030", "#b7791f", "#0b7a5c", "#1f6fd1", "#6b46c1"][k % 5];
  R("s-wdm", "sim", "Unit IV · Multiplexing", "WDM Capacity Calculator", "Choose CWDM or DWDM, the channel spacing and the rate per wavelength to see how many lambdas fit and the total fibre capacity.", env => K.controls(env, {
    height: 240,
    controls: [
      { id: "sys", type: "select", label: "System", options: [["DWDM", "DWDM (C-band)"], ["CWDM", "CWDM (20 nm grid)"]], value: "DWDM" },
      { id: "sp", type: "select", label: "DWDM spacing", options: [["200", "200 GHz (1.6 nm)"], ["100", "100 GHz (0.8 nm)"], ["50", "50 GHz (0.4 nm)"]], value: "100" },
      { id: "rate", type: "select", label: "Rate per λ", options: [["10", "10 Gbit/s"], ["40", "40 Gbit/s"], ["100", "100 Gbit/s"], ["400", "400 Gbit/s"]], value: "100" }
    ],
    compute(s) {
      showCtl(env, "sp", s.sys === "DWDM");
      const rate = +s.rate;
      if (s.sys === "CWDM") { const lams = []; for (let l = 1271; l <= 1611; l += 20) lams.push(l); return { channels: lams.length, lams, cap: lams.length * rate, band: "1271–1611 nm (O to L band)" }; }
      const w = L.wdm({ bandNm: 35, spacingGHz: +s.sp, rateGbps: rate, centreNm: 1547.5 });
      const fHi = L.C_LIGHT / 1530e-9, lams = [];
      for (let k = 0; k < w.channels; k++) lams.push(L.C_LIGHT / (fHi - (k + 0.5) * s.sp * 1e9) * 1e9);
      return { channels: w.channels, lams, cap: w.capacityGbps, bandGHz: w.bandGHz, band: "C-band 1530–1565 nm" };
    },
    draw(ctx, s, { W }) {
      const o = s.out, x1 = 20, x2 = W - 20, y = 150;
      const lo = s.sys === "CWDM" ? 1260 : 1526, hi = s.sys === "CWDM" ? 1620 : 1569;
      const X = l => x1 + (x2 - x1) * (l - lo) / (hi - lo);
      txt(ctx, "Wavelength channels (" + o.band + ")", x1, 18, { align: "left", weight: "700", size: 12, color: C.soft });
      if (s.sys === "CWDM") { ctx.fillStyle = "rgba(31,111,209,.08)"; ctx.fillRect(X(1530), 40, X(1565) - X(1530), y - 40); txt(ctx, "C-band", (X(1530) + X(1565)) / 2, 48, { size: 10, color: C.blue }); }
      line(ctx, x1, y, x2, y, C.ink, 1.5);
      o.lams.forEach((l, k) => { const h = 80; line(ctx, X(l), y, X(l), y - h, lamCol(k), o.lams.length > 50 ? 1.2 : 2.5); });
      const ticks = s.sys === "CWDM" ? [1270, 1310, 1370, 1430, 1490, 1550, 1610] : [1530, 1540, 1550, 1560, 1565];
      ticks.forEach(t => { if (W < 560 && s.sys === "CWDM" && (t === 1370 || t === 1490)) return; line(ctx, X(t), y, X(t), y + 5, C.ink, 1); txt(ctx, t + "", X(t), y + 16, { size: 10, color: C.soft }); });
      txt(ctx, "nm", x2, y + 30, { size: 10, color: C.soft, align: "right" });
      label(ctx, o.channels + " channels × " + s.rate + " Gbit/s = " + (o.cap >= 1000 ? (o.cap / 1000).toFixed(2) + " Tbit/s" : o.cap + " Gbit/s"), W / 2, y + 58, { size: 12, color: C.primary, border: C.primary });
    },
    readout(s) {
      const o = s.out, cap = o.cap >= 1000 ? (o.cap / 1000).toFixed(2) + " Tbit/s" : o.cap + " Gbit/s";
      return (s.sys === "DWDM" ? "<b>DWDM:</b> the C-band spans about " + (o.bandGHz / 1000).toFixed(2) + " THz. Dividing by the " + s.sp + " GHz spacing gives ≈ " + o.channels + " channels." : "<b>CWDM:</b> 20 nm spacing from 1271 to 1611 nm gives " + o.channels + " channels — wide spacing allows cheap uncooled lasers but far fewer channels.") +
        metrics([["Channels (lambdas)", o.channels], ["Capacity per fibre", cap], ["Frequency at 1550 nm", fmtHz(L.C_LIGHT / 1550e-9), "f = c / λ"]]) +
        '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Idealised count (band ÷ spacing); real systems reserve some edge channels. ' + (s.sys === "CWDM" && +s.rate > 25 ? "CWDM optics are typically 10–25 Gbit/s per lambda; higher rates here are hypothetical. " : "") + "f = c/λ, so equal frequency spacing is almost equal wavelength spacing in the narrow C-band.</p>";
    }
  }));
})();
