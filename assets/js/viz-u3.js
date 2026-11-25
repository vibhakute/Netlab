/* Unit III visualizations and simulations. Logic: SimLogic (plus small local helpers); drawing: VizKit. */
(function () {
  "use strict";
  const K = VizKit, L = SimLogic;
  const { C, txt, label, line, rr, arrowHead, shape, metrics } = K;
  const { escapeHtml } = App;
  const R = (id, kind, cat, title, desc, run, params) => K.register(id, { kind, category: cat, title, desc, run, params: params || {} });
  const TAU = Math.PI * 2;
  const hex2 = n => n.toString(16).toUpperCase().padStart(2, "0");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const cpHex = ch => "U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");

  /* ---------- small drawing helpers ---------- */
  function cell(ctx, x, y, w, h, b, o) {
    o = o || {};
    rr(ctx, x, y, w, h, 3);
    ctx.fillStyle = o.bg || (b === "1" ? C.pSoft : "#fff"); ctx.fill();
    ctx.strokeStyle = o.border || C.line; ctx.lineWidth = o.border ? 1.6 : 1; ctx.stroke();
    txt(ctx, b, x + w / 2, y + h / 2 + 0.5, { mono: true, weight: "700", size: o.size || Math.min(14, w * 0.55), color: o.color || C.ink });
  }
  // Draws a bit string as cells; returns the x after the last cell.
  function bitsRow(ctx, bits, x, y, cw, o) {
    o = o || {};
    const gap = o.gap === undefined ? 2 : o.gap;
    let xx = x;
    for (let i = 0; i < bits.length; i++) {
      if (o.groupEvery && i && i % o.groupEvery === 0) xx += o.groupGap || 8;
      const st = o.changed && o.changed[i] ? { bg: C.rSoft, border: C.red, color: C.red } : o.hl && o.hl[i] ? { bg: o.hlBg || C.aSoft, border: o.hlBorder || C.amber } : {};
      if (o.limit === undefined || i < o.limit) cell(ctx, xx, y, cw, o.h || 26, bits[i], st);
      xx += cw + gap;
    }
    return xx;
  }
  function rowLabel(ctx, W, text, y, o) {
    if (W < 560) txt(ctx, text, 12, y - 11, Object.assign({ align: "left", weight: "700", size: 11.5 }, o));
    else txt(ctx, text, 12, y + 13, Object.assign({ align: "left", weight: "700", size: 12.5 }, o));
  }
  function drawWave(ctx, f, x0, x1, mid, amp, color, w, n) {
    ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = w || 2;
    const steps = n || Math.max(200, Math.floor((x1 - x0) * 1.5));
    for (let p = 0; p <= steps; p++) { const x = p / steps, X = x0 + x * (x1 - x0), Y = mid - f(x) * amp; if (p === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
    ctx.stroke();
  }
  const diffMask = (a, b) => a.split("").map((c, i) => b !== null && b !== undefined && c !== b[i]);
  const countTrue = m => m.filter(Boolean).length;
  // Show only the toolbar controls relevant to the current mode.
  function showCtl(cv, all, visible) {
    const wrap = cv && cv.c && cv.c.closest(".viz-wrap"); if (!wrap) return;
    wrap.querySelectorAll(".viz-toolbar [data-id]").forEach(el => {
      if (all.indexOf(el.dataset.id) === -1) return;
      const lab = el.closest(".ctl"); if (lab) lab.style.display = visible.indexOf(el.dataset.id) !== -1 ? "" : "none";
    });
  }
  function syncInput(cv, id, value) {
    const wrap = cv && cv.c && cv.c.closest(".viz-wrap"); if (!wrap) return;
    const el = wrap.querySelector('.viz-toolbar [data-id="' + id + '"]'); if (el && el.value !== value) el.value = value;
  }

  /* ---------- local pure helpers ---------- */
  const DTMF_ROWS = [697, 770, 852, 941], DTMF_COLS = [1209, 1336, 1477, 1633];
  const DTMF_KEYS = ["123A", "456B", "789C", "*0#D"];
  function dtmfPair(key) { for (let r = 0; r < 4; r++) { const c = DTMF_KEYS[r].indexOf(key); if (c !== -1) return [DTMF_ROWS[r], DTMF_COLS[c]]; } return [DTMF_ROWS[1], DTMF_COLS[1]]; }
  // Idealised voice-channel filter: 300-3400 Hz passband (-3 dB edges), steep 8th-order roll-off.
  function voiceGain(f) { f = Math.max(1, f); return 1 / Math.sqrt(1 + Math.pow(300 / f, 16)) / Math.sqrt(1 + Math.pow(f / 3400, 16)); }
  const toDb = g => g <= 1e-6 ? -120 : 20 * Math.log10(g);
  // Harmonics of a symmetrically clipped sine (Fourier coefficients over one period).
  function clippedHarmonics(clip, maxH) {
    const N = 1024, y = [];
    for (let n = 0; n < N; n++) y.push(clamp(Math.sin(TAU * n / N), -clip, clip));
    const a = [0];
    for (let h = 1; h <= (maxH || 9); h++) { let s = 0, c = 0; for (let n = 0; n < N; n++) { s += y[n] * Math.sin(TAU * h * n / N); c += y[n] * Math.cos(TAU * h * n / N); } a.push(2 / N * Math.hypot(s, c)); }
    const thd = Math.sqrt(a.slice(2).reduce((t, v) => t + v * v, 0)) / a[1];
    return { a, thd };
  }

  /* ===================== VISUALIZATIONS ===================== */

  /* ---------- v-codes ---------- */
  R("v-codes", "viz", "Unit III · Digital Codes", "Binary, BCD and Gray Code", "One decimal number is shown in binary, BCD and Gray code while counting, then BCD and Unicode examples.", env => K.timeline(env, {
    height: 320,
    stages: [
      { title: "Counting 0 to 7", text: "The same value is written in three codes. Bits that changed since the previous value turn <b style='color:#c53030'>red</b>. Binary sometimes flips several bits at once; Gray code always flips exactly one.", dur: 6 },
      { title: "7 → 8: the worst case for binary", text: "Going from 7 (0111) to 8 (1000) flips <b>all four</b> binary bits. If a sensor is read mid-change, almost any value could appear. In Gray code only one bit changes (0100 → 1100), so the reading is at most one step wrong.", dur: 4 },
      { title: "Counting 8 to 15", text: "Gray code keeps the one-bit-change property all the way up to 15. BCD stores the tens and units digits in separate 4-bit groups.", dur: 6 },
      { title: "BCD of 59", text: "Each decimal digit gets its own 4-bit group: 5 → 0101, 9 → 1001, so 59 = <code>0101 1001</code> (8 bits). Pure binary needs only 6 bits (<code>111011</code>). Patterns 1010–1111 are never used in BCD." },
      { title: "Unicode: one code point for every character", text: "Unicode gives each character a code point; UTF-8 stores it in 1–4 bytes. ASCII characters stay 1 byte and identical to ASCII, ₹ and क need 3 bytes, and an emoji needs 4." }
    ],
    draw(ctx, st) {
      const { W, i, t } = st, narrow = W < 560, x0 = narrow ? 12 : 150;
      if (i <= 2) {
        const v = i === 0 ? Math.min(7, Math.floor(t * 8)) : i === 1 ? (t < 0.45 ? 7 : 8) : Math.min(15, 8 + Math.floor(t * 8));
        const p = v > 0 ? v - 1 : null;
        const cw = Math.min(32, (W - x0 - 100) / 9.5);
        txt(ctx, "Decimal " + v, W / 2, 24, { weight: "700", size: 18 });
        if (p !== null) txt(ctx, "previous value " + p, W / 2, 46, { size: 11, color: C.faint });
        const rows = [
          ["Binary", L.toBin(v, 4), p === null ? null : L.toBin(p, 4), {}],
          ["BCD", L.bcd(String(v).padStart(2, "0")).join(""), p === null ? null : L.bcd(String(p).padStart(2, "0")).join(""), { groupEvery: 4, groupGap: 10 }],
          ["Gray code", L.toBin(L.grayEncode(v), 4), p === null ? null : L.toBin(L.grayEncode(p), 4), {}]
        ];
        rows.forEach((r, k) => {
          const y = 76 + k * 72;
          rowLabel(ctx, W, r[0], y);
          const mask = diffMask(r[1], r[2]);
          const xe = bitsRow(ctx, r[1], x0, y, cw, Object.assign({ changed: mask }, r[3]));
          const n = countTrue(mask);
          if (p !== null) txt(ctx, n + " bit" + (n === 1 ? "" : "s") + " changed", xe + 8, y + 13, { align: "left", size: 11.5, weight: "600", color: n > 1 ? C.red : C.primary });
          if (r[0] === "BCD") { const d = String(v).padStart(2, "0"); txt(ctx, "tens " + d[0], x0 + 2 * (cw + 2) - 1, y + 38, { size: 10.5, color: C.soft }); txt(ctx, "units " + d[1], x0 + 6 * (cw + 2) + 9, y + 38, { size: 10.5, color: C.soft }); }
        });
        if (i === 1 && t >= 0.45) label(ctx, "binary: all 4 bits flip at once", W / 2, 300, { color: C.red, border: C.red, bg: C.rSoft, size: 11 });
        return;
      }
      if (i === 3) {
        const cw = Math.min(32, (W - x0 - 80) / 9.5), reveal = Math.ceil(clamp(t * 1.4, 0, 1) * 8);
        txt(ctx, "Decimal 59", W / 2, 26, { weight: "700", size: 18 });
        rowLabel(ctx, W, "Binary", 70);
        let xe = bitsRow(ctx, (59).toString(2), x0, 70, cw, { limit: reveal });
        if (reveal >= 6) txt(ctx, "6 bits", xe + 8, 83, { align: "left", size: 12, weight: "600", color: C.blue });
        rowLabel(ctx, W, "BCD", 150);
        xe = bitsRow(ctx, L.bcd("59").join(""), x0, 150, cw, { limit: reveal, groupEvery: 4, groupGap: 10, hl: [1, 1, 1, 1, 0, 0, 0, 0].map(Boolean), hlBg: C.bSoft, hlBorder: C.blue });
        txt(ctx, "5", x0 + 2 * (cw + 2) - 1, 190, { weight: "700", color: C.blue }); txt(ctx, "9", x0 + 6 * (cw + 2) + 9, 190, { weight: "700", color: C.amber });
        if (reveal >= 8) txt(ctx, "8 bits", xe + 8, 163, { align: "left", size: 12, weight: "600", color: C.blue });
        txt(ctx, "Never used in BCD:", narrow ? 12 : x0, 228, { align: "left", size: 12, weight: "600", color: C.red });
        ["1010", "1011", "1100", "1101", "1110", "1111"].forEach((b, k) => {
          const x = narrow ? 40 + (k % 3) * 82 : x0 + 30 + k * 64, y = narrow ? 258 + Math.floor(k / 3) * 28 : 260;
          label(ctx, b, x, y, { mono: true, size: 11, color: C.red, border: C.red, bg: C.rSoft });
        });
        return;
      }
      const chars = ["A", "₹", "क", "😀"], cw = narrow ? 28 : 34;
      const cx = narrow ? 22 : 60, px = narrow ? 46 : 120, bx = narrow ? 118 : 240;
      if (!narrow) { txt(ctx, "Character", cx, 22, { size: 11, color: C.faint }); txt(ctx, "Code point", px + 30, 22, { size: 11, color: C.faint }); txt(ctx, "UTF-8 bytes (hex)", bx, 22, { align: "left", size: 11, color: C.faint }); }
      chars.forEach((ch, k) => {
        if (t < k * 0.2) return;
        const y = 44 + k * 66, bytes = L.utf8Bytes(ch);
        txt(ctx, ch, cx, y + 14, { size: 24 });
        txt(ctx, cpHex(ch), px, y + 14, { align: "left", mono: true, size: narrow ? 11 : 13, weight: "600", color: C.blue });
        bytes.forEach((b, j) => cell(ctx, bx + j * (cw + 3), y, cw, 28, hex2(b), { bg: bytes.length === 1 ? C.pSoft : C.aSoft, size: 11.5 }));
        txt(ctx, bytes.length + (narrow ? " B" : bytes.length === 1 ? " byte (same as ASCII)" : " bytes"), bx + bytes.length * (cw + 3) + 6, y + 14, { align: "left", size: 11.5, color: C.soft });
      });
    }
  }));

  /* ---------- v-ascii ---------- */
  R("v-ascii", "viz", "Unit III · Digital Codes", "ASCII: From Keystroke to Bits and Back", "Characters are typed, looked up in the ASCII table, turned into bits, sent and decoded.", env => {
    const MSG = "Hi!", codes = Array.from(MSG).map(c => c.charCodeAt(0));
    const allBits = codes.map(c => L.toBin(c, 8)).join("");
    return K.timeline(env, {
      height: 300,
      stages: [
        { title: "Typing the message", text: "The user types <b>Hi!</b>. The keyboard and software produce characters, but the line can only carry bits." },
        { title: "Looking up the ASCII table", text: "Each character is replaced by its ASCII number: H = 72, i = 105, ! = 33. Both ends use the same table — that is the protocol." },
        { title: "Numbers become bits", text: "Each code is written in binary. ASCII needs 7 bits; on an 8-bit link the extra leading bit is 0 (or a parity bit).", dur: 4 },
        { title: "Transmitting the bits", text: "The 24 bits travel one after another over the channel (serial transmission).", dur: 4.5 },
        { title: "Decoding at the receiver", text: "The receiver cuts the stream into 8-bit groups, converts each to a number and looks it up in the same ASCII table: <b>Hi!</b>" },
        { title: "Clever structure: A vs a", text: "Uppercase and lowercase letters differ by exactly 32: only <b>bit 5</b> changes (A = 0100 0001, a = 0110 0001)." }
      ],
      draw(ctx, st) {
        const { W, i, t, time } = st, narrow = W < 560;
        if (i === 0) {
          const n = Math.min(3, Math.ceil(t * 3.4)), w = Math.min(260, W - 40);
          rr(ctx, W / 2 - w / 2, 70, w, 60, 8); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = C.nav; ctx.lineWidth = 2; ctx.stroke();
          const s = MSG.slice(0, n); txt(ctx, s, W / 2 - w / 2 + 20, 100, { align: "left", size: 26, weight: "600" });
          ctx.font = "600 26px " + K.FONT; const cw = ctx.measureText(s).width;
          if (Math.floor(time * 2) % 2) line(ctx, W / 2 - w / 2 + 22 + cw, 84, W / 2 - w / 2 + 22 + cw, 116, C.ink, 2);
          txt(ctx, "characters typed: " + n, W / 2, 160, { size: 12, color: C.soft });
          return;
        }
        if (i === 1) {
          const colW = Math.min(110, (W - 30) / 3), x0 = (W - colW * 3) / 2, hi = Math.min(2, Math.floor(t * 3));
          ["Character", "Decimal", "Hex"].forEach((h, k) => txt(ctx, h, x0 + colW * (k + 0.5), 40, { weight: "700", size: 12, color: C.soft }));
          codes.forEach((c, r) => {
            const y = 60 + r * 44;
            rr(ctx, x0, y, colW * 3, 36, 5); ctx.fillStyle = r === hi ? C.bSoft : "#fff"; ctx.fill(); ctx.strokeStyle = r === hi ? C.blue : C.line; ctx.lineWidth = 1; ctx.stroke();
            [MSG[r], String(c), "0x" + hex2(c)].forEach((v, k) => txt(ctx, v, x0 + colW * (k + 0.5), y + 18, { mono: k > 0, size: 15, weight: "600", color: r <= hi ? C.ink : C.faint }));
          });
          return;
        }
        if (i === 2) {
          const x0 = narrow ? 48 : 150, cw = Math.min(30, (W - x0 - 20) / 8.6);
          codes.forEach((c, r) => {
            const y = 40 + r * 70, shown = clamp(t * 3.2 - r, 0, 1);
            txt(ctx, MSG[r], narrow ? 20 : 40, y + 13, { size: 20, weight: "700" });
            if (!narrow) txt(ctx, "= " + c, 90, y + 13, { mono: true, size: 13, color: C.soft });
            bitsRow(ctx, L.toBin(c, 8), x0, y, cw, { limit: Math.ceil(shown * 8), hl: [true], hlBg: "#eef1f4", hlBorder: C.line });
          });
          txt(ctx, "grey = the unused 8th bit (0, or a parity bit)", W / 2, 262, { size: 11, color: C.faint });
          return;
        }
        if (i === 3) {
          const sx = 40, rx = W - 40;
          shape(ctx, "pc", sx, 150, { label: "Sender" }); shape(ctx, "pc", rx, 150, { label: "Receiver" });
          line(ctx, sx + 26, 150, rx - 26, 150, C.nav, 3);
          const cw = narrow ? 13 : 18, trainW = allBits.length * cw, x1 = sx + 26, x2 = rx - 26, head = x1 + (x2 - x1 + trainW) * t;
          ctx.save(); ctx.beginPath(); ctx.rect(x1, 100, x2 - x1, 40); ctx.clip();
          for (let k = 0; k < allBits.length; k++) { const x = head - (k + 1) * cw; if (x < x1 - cw || x > x2) continue; cell(ctx, x, 112, cw - 2, 22, allBits[k], { size: narrow ? 9 : 11, bg: Math.floor(k / 8) % 2 ? C.bSoft : C.pSoft }); }
          ctx.restore();
          txt(ctx, "bits delivered: " + clamp(Math.floor((head - x2) / cw), 0, 24) + " / 24", W / 2, 210, { weight: "600", color: C.primary });
          return;
        }
        if (i === 4) {
          const colW = Math.min(170, (W - 20) / 3), x0 = (W - colW * 3) / 2;
          codes.forEach((c, r) => {
            const cx = x0 + colW * (r + 0.5), k = clamp(t * 3.3 - r, 0, 1);
            if (k <= 0) return;
            txt(ctx, L.toBin(c, 8), cx, 50, { mono: true, size: narrow ? 11 : 14, weight: "700", color: C.blue });
            if (k > 0.33) { arrowHead(ctx, cx, 64, cx, 84, C.faint, 8); txt(ctx, String(c), cx, 100, { mono: true, size: 15 }); }
            if (k > 0.66) { arrowHead(ctx, cx, 114, cx, 134, C.faint, 8); txt(ctx, MSG[r], cx, 160, { size: 30, weight: "700", color: C.primary }); }
          });
          if (t > 0.95) label(ctx, "Received: “Hi!”  ✓", W / 2, 230, { bg: C.pSoft, border: C.primary, color: C.primary, size: 13 });
          return;
        }
        const x0 = narrow ? 70 : 180, cw = Math.min(32, (W - x0 - 20) / 8.8);
        [["A", 65], ["a", 97]].forEach(([ch, c], r) => {
          const y = 60 + r * 80;
          txt(ctx, ch, narrow ? 16 : 40, y + 13, { size: 22, weight: "700" }); txt(ctx, "= " + c, narrow ? 30 : 100, y + 13, { mono: true, size: 13, color: C.soft, align: narrow ? "left" : "center" });
          bitsRow(ctx, L.toBin(c, 8), x0, y, cw, { hl: [0, 0, 1, 0, 0, 0, 0, 0].map(Boolean) });
        });
        const bx = x0 + 2 * (cw + 2) + cw / 2;
        arrowHead(ctx, bx, 222, bx, 200, C.amber, 9);
        txt(ctx, narrow ? "bit 5 (value 32): 97 − 65 = 32" : "bit 5 (value 32) is the only difference: 97 − 65 = 32", W / 2, 244, { size: 12, weight: "600", color: C.amber });
      }
    });
  });

  /* ---------- v-ebcdic ---------- */
  function drawEbcdicChar(ctx, W, ch, t) {
    const narrow = W < 560, e = L.toEbcdic(ch), a = ch.charCodeAt(0), eb = L.toBin(e, 8), ab = L.toBin(a, 8);
    const x0 = narrow ? 64 : 170, cw = Math.min(30, (W - x0 - (narrow ? 20 : 110)) / 9);
    txt(ctx, ch, narrow ? 28 : 60, 72, { size: 42, weight: "700" });
    txt(ctx, "EBCDIC", x0, 34, { align: "left", weight: "700", size: 12, color: C.soft });
    const xe = bitsRow(ctx, eb, x0, 50, cw, { groupEvery: 4, groupGap: 14, hl: [1, 1, 1, 1, 0, 0, 0, 0].map(Boolean), limit: Math.ceil(clamp(t * 2, 0, 1) * 8) });
    const zx = x0 + 2 * (cw + 2), dx = x0 + 6 * (cw + 2) + 14;
    if (t > 0.45) {
      txt(ctx, "zone " + hex2(e)[0], zx, 94, { size: 11.5, weight: "600", color: C.amber });
      txt(ctx, "digit " + hex2(e)[1], dx, 94, { size: 11.5, weight: "600", color: C.blue });
      if (narrow) txt(ctx, "= " + hex2(e) + " hex", x0, 116, { align: "left", mono: true, weight: "700" });
      else txt(ctx, "= " + hex2(e) + " hex", xe + 8, 63, { align: "left", mono: true, weight: "700" });
    }
    if (t > 0.6) {
      const ay = narrow ? 156 : 150;
      txt(ctx, "ASCII (for comparison)", x0, ay - 16, { align: "left", weight: "700", size: 12, color: C.soft });
      const xa = bitsRow(ctx, ab, x0, ay, cw, { groupEvery: 4, groupGap: 14 });
      if (narrow) txt(ctx, "= " + hex2(a) + " hex", x0, ay + 40, { align: "left", mono: true, weight: "700", color: C.soft });
      else txt(ctx, "= " + hex2(a) + " hex", xa + 8, ay + 13, { align: "left", mono: true, weight: "700", color: C.soft });
    }
    const zoneText = { C: ["Zone C (1100) holds A–I → C1–C9"], D: ["Zone D (1101) holds J–R → D1–D9"], E: ["Zone E (1110) holds S–Z → E2–E9", "(S starts at E2, not E1)"], F: ["Zone F (1111) holds the digits 0–9"] }[hex2(e)[0]];
    if (t > 0.75) zoneText.forEach((z, k) => label(ctx, z, W / 2, 238 + k * 26, { size: narrow ? 10.5 : 11.5, bg: C.aSoft, border: C.amber, color: C.amber }));
  }
  R("v-ebcdic", "viz", "Unit III · Digital Codes", "EBCDIC Zones and Digits", "Each character splits into a zone nibble and a digit nibble; the result is compared with ASCII and the gaps in the code are revealed.", env => K.timeline(env, {
    height: 300,
    stages: [
      { title: "B = 1100 0010 (C2)", text: "An EBCDIC byte = <b>zone</b> nibble (high 4 bits) + <b>digit</b> nibble (low 4 bits). B is the 2nd letter of the A–I group, so zone C, digit 2." },
      { title: "I = 1100 1001 (C9)", text: "I is the 9th and last letter of zone C. The next letter, J, does <i>not</i> follow at CA — it starts a new zone at D1." },
      { title: "T = 1110 0011 (E3)", text: "S–Z live in zone E and start at E2, a leftover from punched cards (the 0-1 punch was already “/”). T is therefore E3." },
      { title: "“BIT” in EBCDIC vs ASCII", text: "BIT = <code>11000010 11001001 11100011</code> in EBCDIC (slide example) but <code>01000010 01001001 01010100</code> in ASCII. Red bits differ — a receiver using the wrong table reads nonsense.", dur: 4 },
      { title: "The gaps in the letter codes", text: "Only 9 + 9 + 8 letters fill zones C, D and E. Codes CA–D0 and DA–E1 are not letters, so “next letter = code + 1” fails at I→J and R→S — unlike ASCII.", dur: 4.5 }
    ],
    draw(ctx, st) {
      const { W, i, t } = st, narrow = W < 560;
      if (i <= 2) { drawEbcdicChar(ctx, W, "BIT"[i], t); return; }
      if (i === 3) {
        const x0 = narrow ? 12 : 120, cw = Math.min(24, (W - x0 - 30) / 27);
        const eb = Array.from("BIT").map(c => L.toBin(L.toEbcdic(c), 8)).join(""), ab = Array.from("BIT").map(c => L.toBin(c.charCodeAt(0), 8)).join("");
        rowLabel(ctx, W, "EBCDIC", 60); bitsRow(ctx, eb, x0, 60, cw, { groupEvery: 8, groupGap: 8, changed: diffMask(eb, ab), h: 24 });
        rowLabel(ctx, W, "ASCII", 150); bitsRow(ctx, ab, x0, 150, cw, { groupEvery: 8, groupGap: 8, h: 24 });
        ["B", "I", "T"].forEach((c, k) => { const cx = x0 + (k * 8 + 4) * (cw + 2) + k * 8 - 1; txt(ctx, narrow ? c : c + "  " + hex2(L.toEbcdic(c)) + " / " + hex2(c.charCodeAt(0)), cx, 108, { size: 11, mono: true, color: C.soft }); });
        txt(ctx, countTrue(diffMask(eb, ab)) + " of 24 bits differ", W / 2, 220, { weight: "600", color: C.red });
        return;
      }
      const x0 = narrow ? 34 : 120, cw = (W - x0 - 12) / 16, zones = ["C", "D", "E", "F"];
      for (let c = 0; c < 16; c++) txt(ctx, c.toString(16).toUpperCase(), x0 + (c + 0.5) * cw, 24, { mono: true, size: 11, color: C.faint });
      zones.forEach((z, r) => {
        if (t < r * 0.18) return;
        const y = 40 + r * 54;
        txt(ctx, narrow ? z : "zone " + z + " (" + L.toBin(parseInt(z, 16), 4) + ")", narrow ? 14 : 10, y + 20, { align: narrow ? "center" : "left", weight: "700", size: 11.5 });
        for (let c = 0; c < 16; c++) {
          const code = parseInt(z, 16) * 16 + c, ch = L.fromEbcdic(code), isLetter = ch && /[A-Z0-9]/.test(ch);
          rr(ctx, x0 + c * cw + 1, y, cw - 2, 40, 3);
          ctx.fillStyle = isLetter ? (z === "F" ? C.bSoft : C.pSoft) : C.rSoft; ctx.fill();
          ctx.strokeStyle = isLetter ? C.line : "#f3c5c5"; ctx.lineWidth = 1; ctx.stroke();
          if (isLetter) txt(ctx, ch, x0 + (c + 0.5) * cw, y + 20, { weight: "700", size: Math.min(14, cw * 0.6) });
        }
      });
      if (t > 0.8) txt(ctx, "red = not a letter or digit (gap)", W / 2, 268, { size: 11.5, color: C.red, weight: "600" });
    }
  }));

  /* ---------- v-voice ---------- */
  const voiceWave = x => (0.5 * Math.sin(TAU * 3 * x) + 0.3 * Math.sin(TAU * 7.3 * x + 1) + 0.15 * Math.sin(TAU * 13 * x + 2)) * (0.55 + 0.45 * Math.sin(Math.PI * x));
  R("v-voice", "viz", "Unit III · Voice Channels", "Voice Over a Channel, and Data Inside the Voice Band", "Voice is captured, sampled, digitised, packetised and played back; then the 300–3400 Hz voice band is shown with data tones inside it.", env => K.timeline(env, {
    height: 300,
    stages: [
      { title: "Capture", text: "The microphone turns air-pressure changes into a continuously varying (analog) electrical signal." },
      { title: "Sampling", text: "The channel is sampled <b>8000 times per second</b> — twice the 4 kHz channel width (Nyquist). Fewer samples would lose the higher speech frequencies." },
      { title: "Quantising to 8-bit codes", text: "Each sample is rounded to one of 256 levels and stored as 8 bits: 8 bits × 8000 samples/s = <b>64 kbit/s</b>, one DS0 / G.711 channel." },
      { title: "Packetising and sending", text: "For VoIP, 20 ms of speech (160 bytes at 64 kbit/s) goes into each packet. Packets cross the network and are routed by servers.", dur: 4 },
      { title: "Playback", text: "The receiver converts the codes back to an analog waveform and the speaker plays it." },
      { title: "The voice band — and data inside it", text: "A telephone channel passes about <b>300–3400 Hz</b> inside a nominal 4 kHz slot. Data must be turned into tones within this band: Bell 202 modems use 1200/2200 Hz, and the DTMF key “5” sends 770 + 1336 Hz.", dur: 4.5 }
    ],
    draw(ctx, st) {
      const { W, i, t } = st, narrow = W < 560, x0 = narrow ? 24 : 70, x1 = W - 20, mid = 130, amp = 80;
      const axis = () => line(ctx, x0, mid, x1, mid, "#e3e8ee", 1);
      if (i === 0) {
        axis(); ctx.beginPath(); ctx.arc(x0 - (narrow ? 10 : 30), mid, 8, 0, 7); ctx.strokeStyle = C.nav; ctx.lineWidth = 2; ctx.stroke();
        ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, (x1 - x0) * t, 300); ctx.clip(); drawWave(ctx, voiceWave, x0, x1, mid, amp, C.blue, 2.2); ctx.restore();
        txt(ctx, "analog voice signal (continuous)", W / 2, 262, { size: 12, color: C.soft });
        return;
      }
      if (i <= 2) {
        axis(); drawWave(ctx, voiceWave, x0, x1, mid, amp, i === 1 ? C.blue : "#c7d2fe", 1.6);
        const n = narrow ? 24 : 40, shown = i === 1 ? Math.ceil(t * n) : n;
        for (let k = 0; k < shown; k++) {
          const x = (k + 0.5) / n, X = x0 + x * (x1 - x0); let v = voiceWave(x);
          if (i === 2) v = Math.round(v * 8) / 8;
          line(ctx, X, mid, X, mid - v * amp, i === 2 ? C.primary : C.amber, 2);
          ctx.beginPath(); ctx.arc(X, mid - v * amp, 3, 0, 7); ctx.fillStyle = i === 2 ? C.primary : C.amber; ctx.fill();
        }
        if (i === 1) txt(ctx, "8000 samples per second (one every 125 µs)", W / 2, 262, { size: 12, weight: "600", color: C.amber });
        else {
          const codes = [0, 1, 2, 3].map(k => L.toBin(Math.round((voiceWave((k + 0.5) / n) + 1) / 2 * 255), 8));
          txt(ctx, "first samples → " + (narrow ? codes.slice(0, 2) : codes).join("  "), W / 2, 248, { size: 12, mono: true, color: C.primary });
          txt(ctx, narrow ? "64 kbit/s (levels drawn coarser)" : "8 bits × 8000 /s = 64 kbit/s (levels drawn coarser for clarity)", W / 2, 272, { size: 11, color: C.faint });
        }
        return;
      }
      if (i === 3) {
        shape(ctx, "phone", 36, 150, { label: "Caller" }); shape(ctx, "phone", W - 36, 150, { label: "Listener" });
        shape(ctx, "cloud", W / 2, 150, { label: "Internet" });
        line(ctx, 58, 150, W / 2 - 40, 150, C.line, 2); line(ctx, W / 2 + 40, 150, W - 58, 150, C.line, 2);
        for (let k = 0; k < 3; k++) {
          const p = clamp(t * 1.4 - k * 0.2, 0, 1); if (p <= 0 || p >= 1) continue;
          label(ctx, narrow ? "20 ms" : "20 ms · 160 B", 58 + (W - 116) * p, 100, { bg: C.blue, border: C.blue, color: "#fff", size: 11 });
        }
        txt(ctx, "one packet every 20 ms (G.711 payload)", W / 2, 244, { size: 12, color: C.soft });
        return;
      }
      if (i === 4) {
        axis();
        ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, (x1 - x0) * t, 300); ctx.clip();
        drawWave(ctx, x => Math.round(voiceWave(Math.floor(x * 40) / 40 + 1 / 80) * 8) / 8, x0, x1, mid, amp, "#c7d2fe", 1.5, 800);
        drawWave(ctx, voiceWave, x0, x1, mid, amp, C.primary, 2.2); ctx.restore();
        txt(ctx, "codes → staircase → smoothed analog output", W / 2, 262, { size: 12, color: C.soft });
        return;
      }
      const fx = f => x0 + (x1 - x0) * f / 5000, base = 200;
      rr(ctx, fx(0), 60, fx(4000) - fx(0), base - 60, 4); ctx.setLineDash([5, 4]); ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.pSoft; ctx.fillRect(fx(300), 70, fx(3400) - fx(300), base - 70);
      txt(ctx, "voice band 300–3400 Hz", (fx(300) + fx(3400)) / 2, 84, { size: 12, weight: "700", color: C.primary });
      txt(ctx, "nominal 4 kHz channel", fx(4000), 50, { size: 10.5, color: C.faint, align: "right" });
      line(ctx, x0, base, x1, base, C.ink, 1.5);
      for (let f = 0; f <= 5000; f += 1000) { line(ctx, fx(f), base, fx(f), base + 5, C.ink, 1); txt(ctx, f / 1000 + (f ? (narrow ? "k" : " kHz") : ""), fx(f), base + 16, { size: 10.5, color: C.soft }); }
      const tones = [[1200, "1200", C.blue, 0], [2200, "2200", C.blue, 0], [770, "770", C.violet, 1], [1336, "1336", C.violet, 1]];
      tones.forEach(([f, l, col, row], k) => { if (t < k * 0.15) return; line(ctx, fx(f), base, fx(f), 112 + row * 34, col, 3); txt(ctx, l, fx(f), 104 + row * 34, { size: 10.5, weight: "700", color: col }); });
      txt(ctx, narrow ? "blue: modem tones · violet: DTMF 5" : "blue: Bell 202 modem tones   violet: DTMF key 5", W / 2, 252, { size: 11.5, color: C.soft });
    }
  }));

  /* ---------- v-pots ---------- */
  R("v-pots", "viz", "Unit III · Telephone Networks", "A POTS Call Step by Step", "Off-hook, dial tone, dialling, switching, ringing, conversation and release on the plain old telephone network.", env => K.flow(env, {
    height: 300,
    nodes: {
      a: { x: 0.07, y: 150, type: "phone", label: "Caller" }, term: { x: 0.27, y: 150, label: "Terminal", sub: "outside plant" },
      eo1: { x: 0.49, y: 150, type: "office", label: "Office 555" }, eo2: { x: 0.72, y: 150, type: "office", label: "Office 556" },
      b: { x: 0.93, y: 150, type: "phone", label: "Called" }
    },
    edges: [["a", "term", { label: "drop", ly: 30 }], ["term", "eo1", { label: "local loop", ly: 30 }], ["eo1", "eo2", { label: "trunk", ly: 30, w: 4, color: C.nav }], ["eo2", "b", { label: "loop", ly: 30 }]],
    stages: [
      { title: "Off-hook and dial tone", text: "The exchange powers the line with about <b>−48 V DC</b>. Lifting the handset closes the loop, current flows, and the end office replies with a <b>dial tone</b>.", hi: ["a", "eo1"], edges: [["a", "term"], ["term", "eo1"]], labels: [{ at: "eo1", text: "dial tone", color: C.primary, bg: C.pSoft, dy: -52 }] },
      { title: "Dialling", text: "The caller dials <b>556-0192</b>. Each key sends a pair of DTMF tones (or pulses on old rotary phones) to the end office.", hi: ["a"], edges: [["a", "term"], ["term", "eo1"]], move: [{ path: ["a", "term", "eo1"], label: "556-0192", color: C.violet }], dur: 4 },
      { title: "Switching", text: "The first three digits (<b>556</b>) identify the destination office, so the switch seizes a free <b>trunk</b> to office 556 and passes on the remaining digits.", hi: ["eo1"], edges: [["eo1", "eo2"]], move: [{ path: ["eo1", "eo2"], label: "0192", color: C.amber }] },
      { title: "Ringing", text: "Office 556 uses the last four digits (<b>0192</b>) to find the called line and sends an AC ringing signal of about <b>20 Hz</b> (≈ 75–90 V). The caller hears ring-back.", hi: ["eo2", "b"], edges: [["eo2", "b"]], move: [{ path: ["eo2", "b"], label: "ring", color: C.red }] },
      { title: "Conversation", text: "When the called party answers, a dedicated <b>64 kbit/s</b> path (one DS0 slot on the trunk) is reserved for the whole call — circuit switching, even during silence.", hi: ["a", "b"], edges: [["a", "term"], ["term", "eo1"], ["eo1", "eo2"], ["eo2", "b"]], move: [{ path: ["a", "term", "eo1", "eo2", "b"], label: "voice", color: C.blue, dy: -14 }, { path: ["b", "eo2", "eo1", "term", "a"], label: "voice", color: C.primary, dy: 14 }], dur: 4 },
      { title: "Hang-up", text: "Going on-hook opens the loop; the offices detect it and <b>release the circuit</b> so the trunk slot can be used by another call.", hi: ["eo1", "eo2"], labels: [{ x: 0.605, y: 150, text: "circuit released", color: C.soft, bg: "#fff", dy: -44 }] }
    ]
  }));

  /* ---------- v-hierarchy ---------- */
  R("v-hierarchy", "viz", "Unit III · Telephone Networks", "Climbing the Switching Hierarchy", "A local call stays in one end office; a Dhanore → Mumbai call climbs to toll offices and comes back down.", env => K.flow(env, {
    height: 330,
    nodes: {
      reg: { x: 0.5, y: 40, label: "Regional office" },
      tA: { x: 0.27, y: 120, label: "Toll office", sub: "Pune" }, tB: { x: 0.73, y: 120, label: "Toll office", sub: "Mumbai" },
      eA: { x: 0.16, y: 204, label: "End office", sub: "Dhanore" }, eB: { x: 0.84, y: 204, label: "End office", sub: "Mumbai" },
      pa: { x: 0.07, y: 282, type: "dot", r: 9, fill: C.bSoft, label: "Caller" }, pa2: { x: 0.27, y: 282, type: "dot", r: 9, fill: C.bSoft, label: "Neighbour" },
      pb: { x: 0.9, y: 282, type: "dot", r: 9, fill: C.bSoft, label: "Mumbai" }
    },
    edges: [["pa", "eA"], ["pa2", "eA"], ["pb", "eB"], ["eA", "tA"], ["eB", "tB"], ["tA", "reg"], ["tB", "reg"], ["tA", "tB", { dash: [6, 5], label: "toll trunk", ly: 14 }]],
    stages: [
      { title: "Local call: one end office", text: "Two phones on the same <b>end office</b> are connected by that office's switch alone — no trunks are needed.", hi: ["eA"], edges: [["pa", "eA"], ["pa2", "eA"]], move: [{ path: ["pa", "eA", "pa2"], label: "call", color: C.primary }] },
      { title: "Dhanore → Mumbai: up to the toll office", text: "The Dhanore end office cannot reach Mumbai directly, so it passes the call <b>up</b> to its toll office (e.g. Pune).", hi: ["eA", "tA"], edges: [["pa", "eA"], ["eA", "tA"]], move: [{ path: ["pa", "eA", "tA"], label: "call", color: C.amber }] },
      { title: "Across the toll trunk", text: "Toll offices route calls between cities. The Pune toll office forwards the call over a trunk to the Mumbai toll office.", hi: ["tA", "tB"], edges: [["tA", "tB"]], move: [{ path: ["tA", "tB"], label: "call", color: C.amber }] },
      { title: "Down to the called party", text: "The Mumbai toll office passes the call <b>down</b> to the recipient's end office, which rings the phone. Path: phone → end office → toll → toll → end office → phone.", hi: ["tB", "eB", "pb"], edges: [["tB", "eB"], ["eB", "pb"]], move: [{ path: ["tB", "eB", "pb"], label: "call", color: C.amber }] },
      { title: "Via the regional office", text: "If no direct toll trunk is available (or the call is long-distance or international), the call climbs one more level to a <b>regional office</b>, the top of the hierarchy.", hi: ["reg"], broken: [["tA", "tB"]], edges: [["tA", "reg"], ["reg", "tB"]], move: [{ path: ["pa", "eA", "tA", "reg", "tB", "eB", "pb"], label: "call", color: C.violet }], dur: 4.5 },
      { title: "Why a hierarchy?", text: "Connecting every pair of N exchanges directly needs N(N−1)/2 trunk groups — 499,500 for 1000 exchanges. A tree needs only about N, at the cost of longer paths.", hi: ["reg", "tA", "tB", "eA", "eB"], labels: [{ x: 0.5, y: 204, text: "mesh: N(N−1)/2   tree: ≈ N", color: C.blue, bg: C.bSoft, dy: 0 }] }
    ]
  }));

  /* ---------- v-impair ---------- */
  R("v-impair", "viz", "Unit III · Line Impairments", "Attenuation, Distortion and Noise", "A clean data waveform is weakened, then reshaped, then buried in noise before the receiver decides each bit.", env => {
    const bits = "1011001010", N = 1000, r = L.rng(17);
    const tx = [], att = [], dist = [], noisy = [];
    let y = -0.35;
    for (let k = 0; k < N; k++) {
      const v = L.sig.nrz(bits, k / N) / 0.85;
      tx.push(v); att.push(v * 0.35);
      y += (v * 0.35 - y) * 0.035; dist.push(y);
      noisy.push(y + 0.09 * L.gauss(r));
    }
    const at = arr => x => arr[Math.min(N - 1, Math.floor(x * N))];
    const dec = bits.split("").map((b, i) => noisy[Math.floor((i + 0.5) / bits.length * N)] >= 0 ? "1" : "0").join("");
    const errs = countTrue(diffMask(dec, bits));
    const rows = {
      tx: { label: "Transmitted", bits, f: x => at(tx)(x) * 0.85, color: C.ink },
      att: { label: "Attenuated", bits, showBits: false, f: at(att), color: C.blue, note: "power ≈ −9 dB" },
      dist: { label: "Distorted", bits, showBits: false, f: at(dist), color: C.amber, note: "edges smeared" },
      noisy: { label: "Plus noise", bits, showBits: false, f: at(noisy), color: C.red },
      dec: { label: "Decided bits", bits: dec, f: x => L.sig.nrz(dec, x), color: errs ? C.red : C.primary, note: errs ? errs + " error(s)" : "all correct" }
    };
    return K.waves(env, {
      rowH: 80,
      stages: [
        { title: "The transmitted signal", text: "The sender puts clean rectangular pulses on the line: +V for 1, −V for 0.", rows: [rows.tx] },
        { title: "Attenuation", text: "Resistance and distance <b>weaken</b> the signal. Here the amplitude falls to 35% (power about −9 dB). The shape is unchanged — amplifiers or repeaters can restore the level.", rows: [rows.tx, rows.att] },
        { title: "Distortion", text: "Different frequency components travel at different speeds and lose different amounts, so the square edges <b>round off and smear</b> into neighbouring bits. Equalisers correct this.", rows: [rows.att, rows.dist] },
        { title: "Noise", text: "Thermal noise, interference and crosstalk add <b>unwanted random signals</b>. Unlike attenuation, noise cannot be removed by simply amplifying — the noise is amplified too.", rows: [rows.dist, rows.noisy] },
        { title: "The receiver decides", text: "The receiver samples the middle of each bit and compares it with 0 V. " + (errs ? "Here " + errs + " bit(s) were decided wrongly." : "This time every bit is still decided correctly — but the margin is much smaller than for the clean signal."), rows: [rows.noisy, rows.dec] }
      ]
    });
  });

  /* ---------- v-crosstalk ---------- */
  R("v-crosstalk", "viz", "Unit III · Line Impairments", "Crosstalk: NEXT and FEXT", "An aggressor pair couples into a neighbouring victim pair; backward crosstalk reaches the near end and forward crosstalk the far end.", env => K.timeline(env, {
    height: 300,
    stages: [
      { title: "The disturbing signal", text: "A pulse travels along the <b>aggressor</b> pair from the near end (transmitter) towards the far end. The <b>victim</b> pair runs parallel to it." },
      { title: "Coupling", text: "The pulse's electric field couples through the stray capacitance between the wires (<b>capacitive</b>), and its changing magnetic field through mutual inductance (<b>inductive</b>). A small copy appears on the victim." },
      { title: "Near-End Crosstalk (NEXT)", text: "Part of the coupled energy travels <b>backwards</b> to the near end. It is created all along the cable, so it reaches the near-end receiver continuously while the pulse travels.", dur: 4 },
      { title: "Far-End Crosstalk (FEXT)", text: "Part travels <b>forwards</b> with the pulse and arrives at the far end together with it, where it corrupts the victim's received signal.", dur: 4 },
      { title: "Why NEXT is usually worse", text: "At the near end the disturber is at <b>full strength</b> while the wanted incoming signal has already been weakened by the whole cable. At the far end both have been attenuated." },
      { title: "Prevention: twisting", text: "With twisting, the two wires of a pair swap places every half-twist, so the induced voltages alternate in sign and largely cancel. Different twist rates per pair, shielding (STP) and more spacing help further." }
    ],
    draw(ctx, st) {
      const { W, i, t } = st, narrow = W < 560, xL = narrow ? 30 : 80, xR = W - (narrow ? 30 : 80), yA = 95, yV = 205;
      txt(ctx, narrow ? "Near end" : "Near end (transmitter)", xL, 30, { weight: "700", size: 12 });
      txt(ctx, narrow ? "Far end" : "Far end (receiver)", xR, 30, { weight: "700", size: 12 });
      line(ctx, xL, 40, xL, 260, "#e3e8ee", 1, [4, 4]); line(ctx, xR, 40, xR, 260, "#e3e8ee", 1, [4, 4]);
      const twisted = i === 5;
      const pair = (y, col) => {
        if (!twisted) { line(ctx, xL, y - 6, xR, y - 6, col, 2.5); line(ctx, xL, y + 6, xR, y + 6, col, 2.5); return; }
        [1, -1].forEach(sg => { ctx.beginPath(); ctx.strokeStyle = col; ctx.lineWidth = 2.5; for (let x = xL; x <= xR; x += 3) { const yy = y + sg * 7 * Math.cos(TAU * (x - xL) / 46); if (x === xL) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); } ctx.stroke(); });
      };
      pair(yA, C.nav); pair(yV, "#8a96a3");
      txt(ctx, "Aggressor pair", xL + 4, yA - 22, { align: "left", size: 11.5, weight: "600", color: C.nav });
      txt(ctx, "Victim pair", xL + 4, yV - 22, { align: "left", size: 11.5, weight: "600", color: C.soft });
      const p = i === 4 ? 1 : t, px = xL + (xR - xL) * p;
      if (i !== 4) { rr(ctx, px - 14, yA - 13, 28, 26, 4); ctx.fillStyle = C.blue; ctx.fill(); }
      if (i === 1 || i === 5) {
        [-12, 0, 12].forEach(dx => { const sign = i === 5 ? (Math.floor((px + dx - xL) / 23) % 2 ? -1 : 1) : 1; const col = sign > 0 ? C.amber : C.violet; line(ctx, px + dx, yA + 16, px + dx, yV - 16, col, 1.6, [3, 3]); arrowHead(ctx, px + dx, yA + 16, px + dx, yV - 14, col, 7); });
        if (i === 1) txt(ctx, narrow ? "coupling" : "capacitive + inductive coupling", px > W / 2 ? px - 24 : px + 24, (yA + yV) / 2, { align: px > W / 2 ? "right" : "left", size: 11.5, color: C.amber, weight: "600" });
        else label(ctx, narrow ? "opposite signs cancel" : "induced voltages alternate in sign and cancel", W / 2, 262, { size: 11, color: C.primary, border: C.primary, bg: C.pSoft });
      }
      if (i === 2) {
        const g = ctx.createLinearGradient(xL, 0, Math.max(xL + 1, px), 0); g.addColorStop(0, "rgba(197,48,48,.55)"); g.addColorStop(1, "rgba(197,48,48,.12)");
        ctx.fillStyle = g; ctx.fillRect(xL, yV - 10, Math.max(0, px - xL), 20);
        arrowHead(ctx, xL + 30, yV, xL + 4, yV, C.red, 10);
        label(ctx, "NEXT", xL + 10, yV + 34, { color: "#fff", bg: C.red, border: C.red, size: 11 });
      }
      if (i === 3) {
        const h = 4 + 14 * p; rr(ctx, px - 12, yV - h / 2, 24, h, 3); ctx.fillStyle = C.red; ctx.fill();
        arrowHead(ctx, px + 14, yV, px + 30, yV, C.red, 9);
        if (p > 0.95) label(ctx, "FEXT", xR - 10, yV + 34, { color: "#fff", bg: C.red, border: C.red, size: 11 });
      }
      if (i === 4) {
        const bar = (x, h, col) => { rr(ctx, x - 8, 250 - h, 16, h, 3); ctx.fillStyle = col; ctx.fill(); };
        bar(xL - 10, 80, C.blue); bar(xL + 10, 20, C.primary); bar(xR - 10, 20, C.blue); bar(xR + 10, 80, C.primary);
        txt(ctx, "blue = disturber · green = wanted signal", W / 2, 270, { size: 11, color: C.soft });
        label(ctx, narrow ? "near end: weak wanted vs strong disturber" : "near end: weak wanted signal vs strong disturber", W / 2, 150, { size: 11, color: C.red, border: C.red, bg: C.rSoft });
      }
    }
  }));

  /* ---------- v-echo ---------- */
  R("v-echo", "viz", "Unit III · Line Impairments", "Echo, Frequency Shift and Non-Linear Distortion", "A reflection returns from a mismatch, a received wave drifts in frequency, and a clipped sine produces new harmonics.", env => {
    const H = clippedHarmonics(0.5, 9), refl = L.reflection(50, 75);
    return K.timeline(env, {
      height: 300,
      stages: [
        { title: "Echo: a reflection from a mismatch", text: "A pulse on a 75 Ω line reaches a 50 Ω load. Because the impedances differ, part of it reflects: Γ = (50 − 75)/(50 + 75) = <b>−0.2</b>, so 4% of the power returns to the sender (return loss 14 dB).", dur: 4.5 },
        { title: "Echo cancellation", text: "The 2-wire/4-wire hybrid never balances perfectly, so some of the talker's signal returns. An adaptive <b>echo canceller</b> builds an estimate of the echo and subtracts it, keeping true full-duplex." },
        { title: "Frequency shift", text: "The receiver's oscillator is not exactly synchronised with the sender's. A 1000 Hz tone arrives at 1003 Hz: the phase error grows by 360° every ⅓ s (1/Δf), which upsets FSK and PSK decisions. (Drift slowed down for visibility.)", dur: 4.5 },
        { title: "Non-linear distortion", text: "An overdriven amplifier's output is not a scaled copy of its input. Here the sine is <b>clipped</b> at half its peak, so its tops flatten towards a square wave." },
        { title: "New frequencies appear", text: "Clipping creates harmonics that were not in the input — 3f, 5f, 7f… (odd harmonics for symmetric clipping). Total harmonic distortion here ≈ " + (H.thd * 100).toFixed(0) + "%." }
      ],
      draw(ctx, st) {
        const { W, i, t, time } = st, narrow = W < 560, x0 = narrow ? 16 : 140, x1 = W - 20;
        const rowName = (l, mid, col, lift) => { if (narrow) txt(ctx, l, 16, mid - lift, { align: "left", weight: "700", size: 11.5, color: col }); else txt(ctx, l, 10, mid, { align: "left", weight: "700", size: 12, color: col }); };
        if (i === 0) {
          const xs = 40, xl = W - 46, y = 150;
          shape(ctx, "box", xs, y, { w: 64, h: 40, label: "Source", size: narrow ? 11 : 12.5 }); shape(ctx, "box", xl, y, { w: 76, h: 40, label: "Z_L 50 Ω", fill: C.aSoft, size: narrow ? 11 : 12.5 });
          const bx = xs + 32, ex = xl - 38;
          line(ctx, bx, y, ex, y, C.nav, 3); txt(ctx, "line Z₀ = 75 Ω", (bx + ex) / 2, y + 22, { size: 11, color: C.soft });
          if (t < 0.5) { const x = bx + (ex - bx) * t * 2; rr(ctx, x - 12, y - 34, 24, 32, 3); ctx.fillStyle = C.blue; ctx.fill(); }
          else { const x = ex - (ex - bx) * (t - 0.5) * 2; rr(ctx, x - 12, y + 2, 24, 32 * Math.abs(refl.gamma) + 2, 2); ctx.fillStyle = C.red; ctx.fill(); label(ctx, narrow ? "echo: inverted, ×0.2" : "echo (inverted, 20% amplitude)", clamp(x, 100, W - 100), y + 64, { size: 11, color: C.red, border: C.red, bg: C.rSoft }); }
          label(ctx, "Γ = " + refl.gamma.toFixed(2) + "  ·  " + refl.reflectedPct.toFixed(0) + "% power reflected", W / 2, 60, { size: 11.5, color: C.amber, border: C.amber, bg: C.aSoft });
          return;
        }
        if (i === 1) {
          const echo = x => 0.6 * Math.sin(TAU * 4 * x) * Math.exp(-1.5 * x), est = x => echo(x) * Math.min(1, t * 1.4) * 0.95;
          [["Echo returning", echo, C.red], ["Canceller estimate", est, C.blue], ["After subtraction", x => echo(x) - est(x), C.primary]].forEach(([l, f, col], k) => {
            const mid = 56 + k * 86;
            rowName(l, mid, col, 38);
            line(ctx, x0, mid, x1, mid, "#e3e8ee", 1); drawWave(ctx, f, x0, x1, mid, 34, col, 2);
          });
          return;
        }
        if (i === 2) {
          const drift = time * 0.9;
          [["Sent 1000 Hz", x => Math.sin(TAU * 10 * x), C.blue], ["Received 1003 Hz", x => Math.sin(TAU * 10 * x + drift), C.red]].forEach(([l, f, col], k) => {
            const mid = 76 + k * 100;
            rowName(l, mid, col, 44);
            line(ctx, x0, mid, x1, mid, "#e3e8ee", 1); drawWave(ctx, f, x0, x1, mid, 32, col, 2);
          });
          label(ctx, "phase error now: " + ((drift * 180 / Math.PI) % 360).toFixed(0) + "°", W / 2, 270, { size: 11.5, color: C.red, border: C.red, bg: C.rSoft });
          return;
        }
        if (i === 3) {
          const clip = 1 - 0.5 * Math.min(1, t * 1.6);
          [["Input", x => Math.sin(TAU * 3 * x), C.blue], ["Output (clipped)", x => clamp(Math.sin(TAU * 3 * x), -clip, clip), C.red]].forEach(([l, f, col], k) => {
            const mid = 76 + k * 124;
            rowName(l, mid, col, 50);
            line(ctx, x0, mid, x1, mid, "#e3e8ee", 1); drawWave(ctx, f, x0, x1, mid, 40, col, 2.2);
            if (k === 1) { line(ctx, x0, mid - clip * 40, x1, mid - clip * 40, C.faint, 1, [4, 4]); line(ctx, x0, mid + clip * 40, x1, mid + clip * 40, C.faint, 1, [4, 4]); }
          });
          return;
        }
        const bx0 = narrow ? 20 : 80, bw = (W - bx0 - 20) / 9, base = 236;
        line(ctx, bx0, base, W - 20, base, C.ink, 1.5);
        for (let h = 1; h <= 9; h++) {
          const v = H.a[h] / H.a[1], hgt = 170 * v * (h === 1 ? 1 : Math.min(1, t * 1.5)), x = bx0 + (h - 0.5) * bw;
          if (hgt > 0.5) { rr(ctx, x - bw * 0.3, base - hgt, bw * 0.6, hgt, 3); ctx.fillStyle = h === 1 ? C.blue : C.red; ctx.fill(); }
          txt(ctx, h === 1 ? "f" : h + "f", x, base + 14, { size: 11, color: C.soft, weight: "600" });
          if (h > 1 && h % 2 && t > 0.5) txt(ctx, (v * 100).toFixed(0) + "%", x, base - hgt - 10, { size: 10.5, color: C.red });
        }
        txt(ctx, narrow ? "harmonics vs fundamental (clip 50%)" : "harmonic amplitude relative to the fundamental (clip at 50% of peak)", W / 2, 276, { size: 11, color: C.faint });
      }
    });
  });

  /* ---------- v-jitter ---------- */
  R("v-jitter", "viz", "Unit III · Line Impairments", "Amplitude Jitter and Phase Jitter", "Ideal evenly spaced pulses are compared with pulses suffering amplitude jitter and phase (timing) jitter.", env => {
    const n = 12, r = L.rng(9), off = Array.from({ length: n + 2 }, () => clamp(0.16 * L.gauss(r), -0.3, 0.3));
    const ideal = x => { const u = x * n; return (u - Math.floor(u)) < 0.5 ? 0.8 : -0.5; };
    const ampJ = x => { const u = x * n; return (u - Math.floor(u)) < 0.5 ? 0.8 * (0.82 + 0.2 * Math.sin(TAU * 2.2 * x)) : -0.5; };
    const phJ = x => { const u = x * n; for (let j = Math.floor(u) - 1; j <= Math.floor(u) + 1; j++) { if (j < 0 || j >= n) continue; const s = j + off[j]; if (u >= s && u < s + 0.5) return 0.8; } return -0.5; };
    const slots = "1".repeat(n);
    return K.waves(env, {
      rowH: 84,
      stages: [
        { title: "Ideal pulse train", text: "Pulses of equal height arrive exactly once per time slot (dotted lines). The receiver can sample each one safely in the middle.", rows: [{ label: "Ideal", bits: slots, showBits: false, f: ideal, color: C.ink }] },
        { title: "Amplitude jitter", text: "The pulse <b>height</b> swings slightly and continuously — typically from power-supply hum (50 Hz in India, 60 Hz in the US standards) or the 20 Hz ringing signal leaking onto the line.", rows: [{ label: "Ideal", bits: slots, showBits: false, f: ideal, color: C.faint }, { label: "Amplitude jitter", bits: slots, showBits: false, f: ampJ, color: C.amber, note: "height varies" }] },
        { title: "Phase jitter", text: "The pulse <b>timing</b> swings: each edge arrives a little early or late. Telephone standards limit it to 10° (20–300 Hz) and 15° (4–20 Hz).", rows: [{ label: "Ideal", bits: slots, showBits: false, f: ideal, color: C.faint }, { label: "Phase jitter", bits: slots, showBits: false, f: phJ, color: C.violet, note: "timing varies" }] },
        { title: "Jitter in TDM time slots", text: "In time-division multiplexing each slot belongs to a different channel. A pulse pushed far enough by phase jitter spills into its <b>neighbour's slot</b>, corrupting that channel's data.", rows: [{ label: "Phase jitter vs slots", bits: slots, showBits: false, f: phJ, color: C.violet, w: 2.6 }] },
        { title: "Side by side", text: "Ideal, amplitude-jittered and phase-jittered pulses together. Amplitude jitter shrinks the vertical decision margin; phase jitter shrinks the timing margin.", rows: [{ label: "Ideal", bits: slots, showBits: false, f: ideal, color: C.ink }, { label: "Amplitude jitter", bits: slots, showBits: false, f: ampJ, color: C.amber }, { label: "Phase jitter", bits: slots, showBits: false, f: phJ, color: C.violet }] }
      ]
    });
  });

  /* ---------- v-transients ---------- */
  R("v-transients", "viz", "Unit III · Line Impairments", "Transients on a Carrier", "A clean carrier is hit in turn by impulse noise, a gain hit, a dropout and a phase hit.", env => {
    const cyc = 20, A = 0.6, inHit = x => x >= 0.42 && x < 0.58;
    const clean = x => A * Math.sin(TAU * cyc * x);
    const imp = x => clean(x) + 0.9 * Math.exp(-Math.pow((x - 0.5) / 0.004, 2)) - 0.7 * Math.exp(-Math.pow((x - 0.508) / 0.004, 2)) + 0.5 * Math.exp(-Math.pow((x - 0.75) / 0.003, 2));
    const gain = x => clean(x) * (inHit(x) ? 1.6 : 1);
    const drop = x => clean(x) * (inHit(x) ? 0.1 : 1);
    const phase = x => A * Math.sin(TAU * cyc * x + (inHit(x) ? Math.PI / 2 : 0));
    const ref = { label: "Clean carrier", f: clean, color: C.faint, w: 1.6 };
    return K.waves(env, {
      rowH: 74,
      stages: [
        { title: "Impulse noise", text: "Sudden, sharp, short, high-amplitude spikes (lightning, relay switching, motors). Each spike can wipe out a few bits.", rows: [ref, { label: "Impulse noise", f: imp, color: C.red, note: "spikes" }] },
        { title: "Gain hit", text: "A sudden <b>increase</b> in amplitude lasting more than 4 ms. Standards allow at most <b>8 gain hits in 15 minutes</b>. Amplitude-based schemes (ASK, QAM) misread bits during a gain hit.", rows: [ref, { label: "Gain hit", f: gain, color: C.amber, note: "> 4 ms" }] },
        { title: "Dropout", text: "A sudden <b>loss</b> of signal of more than 12 dB for longer than 4 ms. Dropouts cause more errors than any other transient; at most <b>1 per 30 minutes</b> is allowed.", rows: [ref, { label: "Dropout", f: drop, color: C.blue, note: "> 12 dB, > 4 ms" }] },
        { title: "Phase hit", text: "A sudden jump in phase (more than 20°) or frequency lasting over 4 ms, often when carriers switch equipment. FSK and PSK are particularly sensitive. Limit: 8 per 15 minutes. (Drawn as a 90° jump for visibility.)", rows: [ref, { label: "Phase hit", f: phase, color: C.violet, note: "phase jump" }] },
        { title: "Summary", text: "Spike (impulse noise), up (gain hit), gone (dropout), jump (phase hit). Because transients destroy many consecutive bits, data links rely on CRC and retransmission.", rows: [{ label: "Impulse", f: imp, color: C.red }, { label: "Gain hit", f: gain, color: C.amber }, { label: "Dropout", f: drop, color: C.blue }, { label: "Phase hit", f: phase, color: C.violet }] }
      ]
    });
  });

  /* ===================== SIMULATIONS ===================== */

  /* ---------- s-codes ---------- */
  R("s-codes", "sim", "Unit III · Digital Codes", "Code Converter Lab", "Convert a decimal number to binary and BCD, step through Gray code, and see how many UTF-8 bytes each character needs.", env => K.controls(env, {
    dom: true,
    controls: [
      { id: "num", type: "text", label: "Decimal number", value: "59", max: 7, width: 90, mono: true, sanitize: v => String(v).replace(/\D/g, "").slice(0, 7) },
      { id: "g", type: "range", label: "Gray counter", min: 0, max: 15, step: 1, value: 0 },
      { id: "uni", type: "text", label: "Unicode text", value: "Hi ₹", max: 16, width: 120 }
    ],
    compute(s) {
      const str = String(s.num || "0").replace(/^0+(?=\d)/, "") || "0", n = parseInt(str, 10) || 0;
      const g = +s.g, prev = g > 0 ? L.toBin(L.grayEncode(g - 1), 4) : null, cur = L.toBin(L.grayEncode(g), 4);
      const chars = Array.from(String(s.uni || "")).map(ch => ({ ch, cp: cpHex(ch), bytes: L.utf8Bytes(ch) }));
      return { str, n, bin: n.toString(2), bcd: L.bcd(str), g, cur, prev, mask: diffMask(cur, prev), chars };
    },
    dom(stage, s) {
      const o = s.out, grayRows = [];
      for (let v = 0; v <= 15; v++) {
        const gb = L.toBin(L.grayEncode(v), 4), pb = v ? L.toBin(L.grayEncode(v - 1), 4) : null, m = diffMask(gb, pb);
        const on = v === o.g, future = v > o.g;
        grayRows.push('<tr style="' + (on ? "background:#e5f4ee;font-weight:700" : future ? "color:#8a96a3" : "") + '"><td>' + v + "</td><td><code>" + L.toBin(v, 4) + "</code></td><td><code>" + gb.split("").map((b, i) => m[i] ? '<b style="color:#c53030">' + b + "</b>" : b).join("") + "</code></td><td>" + (v ? countTrue(m) : "—") + "</td></tr>");
      }
      stage.innerHTML = '<div class="lab">' +
        '<div class="lab-row"><span class="lab-tag">Binary of ' + escapeHtml(o.str) + '</span><div class="byte-row"><span class="byte"><b>' + o.bin + "</b><small>" + o.bin.length + " bits</small></span></div></div>" +
        '<div class="lab-row"><span class="lab-tag">BCD of ' + escapeHtml(o.str) + ' (one 4-bit group per digit)</span><div class="byte-row">' + o.bcd.map((b, i) => '<span class="byte"><b>' + o.str[i] + "</b><code>" + b + "</code></span>").join("") + '<span class="byte"><b>' + o.bcd.length * 4 + "</b><small>bits total</small></span></div></div>" +
        '<div class="lab-row"><span class="lab-tag">Gray code counter (red = the bit that changed)</span><div class="table-wrap" style="margin:0;max-height:260px;overflow:auto"><table><thead><tr><th>Decimal</th><th>Binary</th><th>Gray</th><th>Bits changed</th></tr></thead><tbody>' + grayRows.join("") + "</tbody></table></div></div>" +
        '<div class="lab-row"><span class="lab-tag">UTF-8 bytes per character</span><div class="byte-row">' + (o.chars.length ? o.chars.map(c => '<span class="byte' + (c.bytes.length > 1 ? " on" : "") + '"><b>' + escapeHtml(c.ch === " " ? "␠" : c.ch) + "</b><code>" + c.cp + "</code><small>" + c.bytes.map(hex2).join(" ") + "</small></span>").join("") : '<span class="muted">Type some text.</span>') + "</div></div></div>";
    },
    readout(s) {
      const o = s.out, bcdBits = o.bcd.length * 4, totalBytes = o.chars.reduce((t, c) => t + c.bytes.length, 0);
      const ch = o.g ? countTrue(o.mask) : 0, bitPos = o.mask.indexOf(true);
      return "<b>" + escapeHtml(o.str) + "</b> needs " + o.bin.length + " bits in binary but " + bcdBits + " bits in BCD" + (bcdBits > o.bin.length ? " — BCD trades space for easy decimal display." : ".") +
        (o.g ? " Gray step " + (o.g - 1) + " → " + o.g + " changed " + ch + " bit (bit " + (3 - bitPos) + ")." : " Move the Gray counter to step through 0–15.") +
        metrics([["Binary bits", o.bin.length], ["BCD bits", bcdBits], ["Characters", o.chars.length], ["UTF-8 bytes", totalBytes, totalBytes > o.chars.length ? "some characters need more than 1 byte" : "all single-byte (ASCII range)"]]);
    }
  }));

  /* ---------- s-ascii ---------- */
  R("s-ascii", "sim", "Unit III · Digital Codes", "ASCII Encoder", "Type text to see each character's decimal, hex and binary ASCII code, with an optional parity bit.", env => K.controls(env, {
    dom: true,
    controls: [
      { id: "text", type: "text", label: "Text", value: "Aa Hello 7", max: 24, width: 160 },
      { id: "parity", type: "select", label: "8th bit", options: [["none", "0 (plain 7-bit ASCII)"], ["even", "Even parity"], ["odd", "Odd parity"]], value: "none" }
    ],
    compute(s) {
      return Array.from(String(s.text || "")).map(ch => {
        const c = ch.codePointAt(0);
        if (c > 127) return { ch, c, bad: true };
        const b7 = L.toBin(c, 7), p = s.parity === "none" ? "0" : String(L.parityBit(b7, s.parity === "even"));
        const kind = c < 32 || c === 127 ? "control" : c === 32 ? "space" : c >= 48 && c <= 57 ? "digit" : c >= 65 && c <= 90 ? "uppercase" : c >= 97 && c <= 122 ? "lowercase" : "punctuation";
        return { ch, c, b7, p, byte: p + b7, kind };
      });
    },
    dom(stage, s) {
      const rows = s.out.map(r => {
        if (r.bad) return '<tr style="background:#fdecec"><td><b>' + escapeHtml(r.ch) + '</b></td><td colspan="4">Not an ASCII character (' + cpHex(r.ch) + "). ASCII only covers codes 0–127; Unicode/UTF-8 is needed.</td></tr>";
        const bits = r.byte.split("").map((b, i) => i === 0 ? '<b style="color:#b7791f" title="8th bit">' + b + "</b>" : i === 2 && (r.kind === "uppercase" || r.kind === "lowercase") ? '<u title="bit 5 (value 32)">' + b + "</u>" : b).join("");
        return "<tr><td><b>" + (r.ch === " " ? "␠" : escapeHtml(r.ch)) + "</b></td><td>" + r.c + "</td><td><code>" + hex2(r.c) + "</code></td><td><code>" + bits + "</code></td><td>" + r.kind + "</td></tr>";
      }).join("");
      stage.innerHTML = '<div class="lab"><div class="table-wrap" style="margin:0"><table><thead><tr><th>Char</th><th>Decimal</th><th>Hex</th><th>Binary (8th bit first)</th><th>Type</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5">Type some text.</td></tr>') + "</tbody></table></div>" +
        '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Amber = the 8th bit (' + (s.parity === "none" ? "always 0 here" : s.parity + " parity: chosen so the total number of 1s is " + s.parity) + "). Underlined = bit 5, the only bit that differs between an uppercase letter and its lowercase partner.</p></div>";
    },
    readout(s) {
      const ok = s.out.filter(r => !r.bad), letters = ok.filter(r => r.kind === "uppercase" || r.kind === "lowercase");
      let pairNote = "";
      const up = letters.find(r => r.kind === "uppercase" && letters.some(x => x.c === r.c + 32));
      if (up) pairNote = " “" + up.ch + "” (" + up.c + ") and “" + String.fromCharCode(up.c + 32) + "” (" + (up.c + 32) + ") differ by exactly 32 — only bit 5 changes.";
      return "Each character becomes one byte: 7 ASCII bits plus the 8th bit." + pairNote +
        metrics([["Characters", s.out.length], ["Bytes on the wire", ok.length], ["Non-ASCII characters", s.out.length - ok.length, "", s.out.length - ok.length ? "warn" : ""], ["8th bit", s.parity === "none" ? "0" : s.parity + " parity"]]);
    }
  }));

  /* ---------- s-ebcdic ---------- */
  R("s-ebcdic", "sim", "Unit III · Digital Codes", "EBCDIC Encoder and Mismatch Lab", "Encode text in EBCDIC (code page 037), compare it with ASCII, and see what happens when the receiver uses the other code.", env => K.controls(env, {
    dom: true,
    controls: [
      { id: "text", type: "text", label: "Text", value: "BIT", max: 16, width: 140 },
      { id: "mode", type: "select", label: "Scenario", options: [["show", "Encode in EBCDIC"], ["a2e", "ASCII bytes → EBCDIC receiver"], ["e2a", "EBCDIC bytes → ASCII receiver"]], value: "show" }
    ],
    compute(s) {
      const chars = Array.from(String(s.text || "")).map(ch => { const a = ch.codePointAt(0); return { ch, a: a < 128 ? a : null, e: L.toEbcdic(ch) }; });
      const sent = chars.map(c => s.mode === "a2e" ? c.a : c.e);
      const recv = sent.map(b => b === null ? "?" : s.mode === "e2a" ? (L.asciiChar(b) || "·") : (L.fromEbcdic(b) || "·")).join("");
      return { chars, sent, recv };
    },
    dom(stage, s) {
      const o = s.out, nib = b => b === null ? "—" : L.toBin(b, 8).slice(0, 4) + " " + L.toBin(b, 8).slice(4);
      const gaps = [["I", "J"], ["R", "S"]].map(([x, y]) => { const ex = L.toEbcdic(x), ey = L.toEbcdic(y); return "<tr><td>" + x + " → " + y + "</td><td><code>" + hex2(ex) + " → " + hex2(ey) + "</code></td><td>" + (ey - ex - 1) + " unused codes</td><td><code>" + hex2(x.charCodeAt(0)) + " → " + hex2(y.charCodeAt(0)) + "</code> (no gap)</td></tr>"; }).join("");
      const senderCode = s.mode === "a2e" ? "ASCII" : "EBCDIC", receiverCode = s.mode === "e2a" ? "ASCII" : "EBCDIC";
      const ch = c => escapeHtml(c === " " ? "␠" : c);
      stage.innerHTML = '<div class="lab">' +
        '<div class="lab-row"><span class="lab-tag">Sender encodes with ' + senderCode + '</span><div class="byte-row">' + o.chars.map((c, i) => '<span class="byte' + (o.sent[i] === null ? " bad" : "") + '"><b>' + ch(c.ch) + "</b><code>" + (o.sent[i] === null ? "n/a" : hex2(o.sent[i])) + "</code><small>" + nib(o.sent[i]) + "</small></span>").join("") + "</div></div>" +
        (s.mode === "show"
          ? '<div class="lab-row"><span class="lab-tag">Full EBCDIC bit string</span><div class="lab-out ok" style="font-family:Consolas,monospace;word-break:break-all">' + (o.sent.map(b => b === null ? "????????" : L.toBin(b, 8)).join(" ") || "—") + "</div></div>" +
            '<div class="lab-row"><span class="lab-tag">Same text in ASCII</span><div class="byte-row">' + o.chars.map(c => '<span class="byte"><b>' + ch(c.ch) + "</b><code>" + (c.a === null ? "n/a" : hex2(c.a)) + "</code><small>" + nib(c.a) + "</small></span>").join("") + "</div></div>"
          : '<div class="lab-arrow">— the same bytes travel over the link —→</div><div class="lab-row"><span class="lab-tag">Receiver decodes with ' + receiverCode + '</span><div class="lab-out ' + (o.recv === String(s.text) ? "ok" : "bad") + '">' + escapeHtml(o.recv || "—") + "</div></div>") +
        '<div class="lab-row"><span class="lab-tag">Gaps in the EBCDIC letter codes</span><div class="table-wrap" style="margin:0"><table><thead><tr><th>Letters</th><th>EBCDIC</th><th>Gap</th><th>ASCII</th></tr></thead><tbody>' + gaps + "</tbody></table></div></div></div>";
    },
    readout(s) {
      const o = s.out, miss = o.chars.filter(c => c.e === null).length;
      const msg = s.mode === "show" ? "EBCDIC splits each byte into a <b>zone</b> nibble (first 4 bits) and a <b>digit</b> nibble (last 4 bits). Compare “BIT” with the slide: 11000010 11001001 11100011."
        : o.recv === String(s.text) ? "The text happens to decode correctly." : '<b style="color:var(--red)">Garbled text.</b> The bytes arrive intact, but the receiver looks them up in the wrong table. Mainframe transfers must translate between EBCDIC and ASCII (e.g. FTP in ASCII mode).';
      return msg + (miss ? '<br><span class="muted">' + miss + " character(s) have no code page 037 equivalent.</span>" : "") +
        metrics([["Characters", o.chars.length], ["Bytes", o.sent.length], ["Code page", "IBM CP037 (US/Canada)"]]);
    }
  }));

  /* ---------- s-voiceband ---------- */
  let audioCtx = null;
  function playTones(freqs, gains) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      audioCtx = audioCtx || new AC();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const now = audioCtx.currentTime;
      freqs.forEach((f, i) => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain(), lvl = 0.12 * gains[i] / freqs.length;
        o.frequency.value = f; g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(lvl, now + 0.02);
        g.gain.setValueAtTime(lvl, now + 0.48); g.gain.linearRampToValueAtTime(0, now + 0.52);
        o.connect(g); g.connect(audioCtx.destination); o.start(now); o.stop(now + 0.55);
      });
      return true;
    } catch (e) { return false; }
  }
  R("s-voiceband", "sim", "Unit III · Voice Channels", "Voice Band and DTMF Lab", "Move a tone across the spectrum or press a DTMF key to see which frequencies pass a 300–3400 Hz voice channel.", env => K.controls(env, {
    height: 320,
    controls: [
      { id: "mode", type: "select", label: "Signal", options: [["tone", "Single tone"], ["dtmf", "DTMF key"]], value: "tone" },
      { id: "f", type: "range", label: "Tone", min: 100, max: 5000, step: 50, value: 1000, unit: "Hz" },
      { id: "key", type: "select", label: "Key", options: "123A456B789C*0#D".split(""), value: "5" },
      { id: "play", type: "button", label: "Play", icon: "play", onClick: s => { s.audio = playTones(s.out.tones, s.out.gains) ? "played" : "unavailable"; } }
    ],
    compute(s) {
      const tones = s.mode === "dtmf" ? dtmfPair(s.key) : [+s.f];
      return { tones, gains: tones.map(voiceGain) };
    },
    draw(ctx, s, { W, cv }) {
      showCtl(cv, ["f", "key"], s.mode === "dtmf" ? ["key"] : ["f"]);
      const o = s.out, narrow = W < 560, x0 = narrow ? 14 : 50, x1 = W - 16, fx = f => x0 + (x1 - x0) * f / 5000, base = 150, top = 30;
      ctx.fillStyle = C.pSoft; ctx.fillRect(fx(300), top, fx(3400) - fx(300), base - top);
      txt(ctx, "voice band 300–3400 Hz", (fx(300) + fx(3400)) / 2, top + 12, { size: 11.5, weight: "700", color: C.primary });
      ctx.beginPath(); ctx.strokeStyle = C.primary; ctx.lineWidth = 1.6;
      for (let f = 50; f <= 5000; f += 10) { const db = Math.max(-40, toDb(voiceGain(f))), y = top + 22 + (-db / 40) * (base - top - 22); if (f === 50) ctx.moveTo(fx(f), y); else ctx.lineTo(fx(f), y); }
      ctx.stroke();
      line(ctx, x0, base, x1, base, C.ink, 1.5);
      for (let f = 0; f <= 5000; f += 1000) { line(ctx, fx(f), base, fx(f), base + 5, C.ink, 1); txt(ctx, f ? f / 1000 + (narrow ? "k" : " kHz") : "0", fx(f), base + 15, { size: 10.5, color: C.soft }); }
      if (s.mode === "dtmf") DTMF_ROWS.concat(DTMF_COLS).forEach(f => line(ctx, fx(f), base, fx(f), base - 8, C.faint, 1.5));
      o.tones.forEach((f, i) => {
        const g = o.gains[i], hIn = base - top - 52, col = g > 0.7 ? C.blue : C.red;
        line(ctx, fx(f), base, fx(f), base - hIn, "#c3cbd6", 5);
        line(ctx, fx(f), base, fx(f), base - hIn * g, col, 5);
        txt(ctx, f + " Hz", fx(f), base - hIn - 10, { size: 11, weight: "700", color: col });
      });
      [["Sent", true], ["After the channel", false]].forEach(([l, isIn], k) => {
        const mid = 212 + k * 66;
        txt(ctx, l, x0, mid - 27, { align: "left", size: 11.5, weight: "700", color: isIn ? C.ink : C.blue });
        line(ctx, x0, mid, x1, mid, "#e3e8ee", 1);
        drawWave(ctx, x => o.tones.reduce((acc, f, i) => acc + (isIn ? 1 : o.gains[i]) * Math.sin(TAU * f * x * 0.006), 0) / o.tones.length, x0, x1, mid, 20, isIn ? C.ink : C.blue, 1.4, 1400);
      });
      txt(ctx, "6 ms window · idealised channel filter", x1, 312, { align: "right", size: 10, color: C.faint });
    },
    readout(s) {
      const o = s.out, dbs = o.gains.map(toDb), pass = dbs.every(d => d > -3);
      const head = s.mode === "dtmf"
        ? "Key <b>" + escapeHtml(s.key) + "</b> = row tone " + o.tones[0] + " Hz + column tone " + o.tones[1] + " Hz. " + (pass ? "Both tones lie inside the voice band, so the exchange can decode the digit." : "A tone is attenuated.") + (/[ABCD]/.test(s.key) ? " (A–D use the 1633 Hz column; ordinary phone keypads do not have these keys.)" : "")
        : o.tones[0] + " Hz " + (pass ? '<b style="color:var(--primary)">passes</b> the voice channel.' : '<b style="color:var(--red)">is outside the voice band</b> and is attenuated by ' + Math.min(120, -dbs[0]).toFixed(0) + " dB.");
      return head + metrics(o.tones.map((f, i) => [f + " Hz", dbs[i] > -0.05 ? "0 dB" : dbs[i] < -60 ? "< −60 dB" : dbs[i].toFixed(1) + " dB", dbs[i] > -3 ? "in band" : "filtered", dbs[i] > -3 ? "" : "warn"])) +
        '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Filter model: −3 dB at 300 Hz and 3400 Hz with a steep roll-off (an approximation of a telephone channel). ' +
        (s.audio === "unavailable" ? "Audio playback is not available in this browser." : "Play sends the tone(s) at the level that survives the channel (sound on; small speakers may not reproduce very low tones).") + "</p>";
    }
  }));

  /* ---------- s-dial ---------- */
  const DIAL_NODES = { caller: [0.06, 220, "phone", "You 555-1234"], eo555: [0.3, 220, "box", "Office 555"], tandem: [0.52, 90, "box", "Tandem office"], eo556: [0.74, 170, "box", "Office 556"], eo732: [0.74, 280, "box", "Office 732"] };
  const DIAL_EDGES = [["caller", "eo555", "local loop"], ["eo555", "eo556", "direct trunk"], ["eo555", "tandem", "trunk"], ["tandem", "eo556", ""], ["tandem", "eo732", "trunk"]];
  R("s-dial", "sim", "Unit III · Telephone Networks", "Dial a Number", "Dial a 7-digit number and watch the network use the office code (first three digits) and the line number (last four) to route the call.", env => K.controls(env, {
    height: 330, animate: true,
    controls: [
      { id: "num", type: "text", label: "Number to dial", value: "556-0192", max: 8, width: 110, mono: true, sanitize: v => String(v).replace(/[^\d-]/g, "").slice(0, 8) },
      { id: "q1", type: "button", label: "Same office", onClick: s => { s.num = "555-7788"; } },
      { id: "q2", type: "button", label: "Neighbour office", onClick: s => { s.num = "556-0192"; } },
      { id: "q3", type: "button", label: "Distant office", onClick: s => { s.num = "732-4410"; } }
    ],
    compute(s) {
      const d = String(s.num || "").replace(/\D/g, "");
      if (d.length < 7) return { d, status: "incomplete", path: ["caller", "eo555"] };
      if (d.length > 7) return { d, status: "toolong", path: ["caller", "eo555"] };
      const office = d.slice(0, 3), lineNo = d.slice(3);
      if (d === "5551234") return { d, office, lineNo, status: "busy", path: ["caller", "eo555"] };
      const paths = { "555": ["caller", "eo555", "callee"], "556": ["caller", "eo555", "eo556", "callee"], "732": ["caller", "eo555", "tandem", "eo732", "callee"] };
      if (!paths[office]) return { d, office, lineNo, status: "nooffice", path: ["caller", "eo555"] };
      return { d, office, lineNo, status: "ok", path: paths[office], dest: "eo" + office };
    },
    draw(ctx, s, { W, time, cv }) {
      syncInput(cv, "num", s.num);
      const o = s.out, narrow = W < 560;
      const pos = id => {
        if (id === "callee") { const d = o.dest === "eo555" ? [0.3, 312] : o.dest === "eo556" ? [0.94, 170] : [0.94, 280]; return { x: 24 + d[0] * (W - 48), y: d[1] }; }
        const n = DIAL_NODES[id]; return { x: 24 + n[0] * (W - 48), y: n[1] };
      };
      const onPath = (a, b) => { const p = o.path; for (let k = 0; k < p.length - 1; k++) if ((p[k] === a && p[k + 1] === b) || (p[k] === b && p[k + 1] === a)) return true; return false; };
      DIAL_EDGES.forEach(([a, b, l]) => { const A = pos(a), B = pos(b), on = onPath(a, b); line(ctx, A.x, A.y, B.x, B.y, on ? C.blue : "#c8d0d9", on ? 4 : 2); if (l && !narrow) label(ctx, l, (A.x + B.x) / 2, (A.y + B.y) / 2 - 12, { size: 10, color: C.soft }); });
      if (o.status === "ok") { const A = pos(o.dest), B = pos("callee"); line(ctx, A.x, A.y, B.x, B.y, C.blue, 4); }
      Object.keys(DIAL_NODES).forEach(id => {
        const n = DIAL_NODES[id], p = pos(id), on = o.path.indexOf(id) !== -1;
        if (n[2] === "phone") shape(ctx, "phone", p.x, p.y, { label: narrow ? "You" : n[3] });
        else shape(ctx, "box", p.x, p.y, { w: narrow ? 64 : 110, h: 36, label: narrow ? n[3].replace(" office", "").replace("Office ", "") : n[3], stroke: on ? C.blue : C.nav, fill: on ? C.bSoft : "#fff", size: narrow ? 10.5 : 12 });
      });
      if (o.status === "ok") { const p = pos("callee"); shape(ctx, "phone", p.x, p.y, { label: narrow ? o.lineNo : "line " + o.lineNo }); }
      const pts = o.path.map(pos);
      if (pts.length > 1) { const p = K.pointOnPath(pts, K.pathLen(pts) * ((time * 0.35) % 1)); ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, 7); ctx.fillStyle = o.status === "ok" ? C.amber : C.red; ctx.fill(); }
      const digits = (o.d || "").padEnd(7, "_"), cx = W / 2;
      txt(ctx, digits.slice(0, 3), cx - 50, 22, { mono: true, size: 18, weight: "700", color: C.amber });
      txt(ctx, digits.slice(3, 7), cx + 40, 22, { mono: true, size: 18, weight: "700", color: C.blue });
      txt(ctx, "office code", cx - 50, 42, { size: 10.5, color: C.amber }); txt(ctx, "line number", cx + 40, 42, { size: 10.5, color: C.blue });
    },
    readout(s) {
      const o = s.out, offices = o.path.filter(id => id !== "caller" && id !== "callee").length;
      const msg = {
        incomplete: "Keep dialling — the end office waits until it has collected all 7 digits (" + (o.d || "").length + " so far).",
        toolong: "Too many digits for a 7-digit local number.",
        busy: "That is your own number: the office returns a <b>busy</b> tone.",
        nooffice: "Office code <b>" + o.office + "</b> does not exist in this small network, so the end office plays an intercept message (“number not in service”).",
        ok: o.office === "555" ? "Same office: the <b>555</b> switch connects your loop directly to line " + o.lineNo + ". Only one switch is used and no trunk is needed."
          : o.office === "556" ? "Office code <b>556</b> → office 555 seizes the <b>direct trunk</b> to office 556, which uses <b>" + o.lineNo + "</b> to ring the called line."
            : "Office code <b>732</b> has no direct trunk from 555, so the call goes via the <b>tandem office</b>, then to office 732, which rings line " + o.lineNo + "."
      }[o.status];
      return msg + metrics([["Digits dialled", (o.d || "").length + " / 7"], ["Switching offices used", o.status === "ok" ? offices : "—"], ["Trunks used", o.status === "ok" ? Math.max(0, offices - 1) : "—"]]) +
        '<p class="muted" style="font-size:.85rem;margin:6px 0 0">An illustrative network: your phone is 555-1234; offices 555, 556 and 732 exist. The first three digits select the office, the last four the local loop.</p>';
    }
  }));

  /* ---------- s-callroute ---------- */
  const NET = {
    rW: { x: 0.34, y: 40, label: "West regional", short: "W reg", up: null }, rN: { x: 0.86, y: 40, label: "North regional", short: "N reg", up: null },
    tPu: { x: 0.17, y: 115, label: "Pune toll", short: "Pune T", up: "rW" }, tMu: { x: 0.51, y: 115, label: "Mumbai toll", short: "Mum T", up: "rW" }, tDe: { x: 0.86, y: 115, label: "Delhi toll", short: "Del T", up: "rN" },
    eDh: { x: 0.08, y: 190, label: "Dhanore EO", short: "Dhan", up: "tPu" }, ePu: { x: 0.26, y: 190, label: "Pune EO", short: "Pune", up: "tPu" },
    eAn: { x: 0.42, y: 190, label: "Andheri EO", short: "Andh", up: "tMu" }, eDa: { x: 0.6, y: 190, label: "Dadar EO", short: "Dadr", up: "tMu" }, eDe: { x: 0.86, y: 190, label: "Delhi EO", short: "Delhi", up: "tDe" }
  };
  const PHONES = { dA: { x: 0.03, eo: "eDh", label: "Dhanore phone A" }, dB: { x: 0.13, eo: "eDh", label: "Dhanore phone B" }, pu: { x: 0.26, eo: "ePu", label: "Pune city" }, an: { x: 0.42, eo: "eAn", label: "Mumbai – Andheri" }, da: { x: 0.6, eo: "eDa", label: "Mumbai – Dadar" }, de: { x: 0.86, eo: "eDe", label: "Delhi" } };
  function routeCall(a, b, hu) {
    if (a === b) return null;
    const ea = PHONES[a].eo, eb = PHONES[b].eo;
    if (ea === eb) return [ea];
    const ta = NET[ea].up, tb = NET[eb].up;
    if (ta === tb) return [ea, ta, eb];
    const ra = NET[ta].up, rb = NET[tb].up;
    if (ra === rb) return hu && ((ta === "tPu" && tb === "tMu") || (ta === "tMu" && tb === "tPu")) ? [ea, ta, tb, eb] : [ea, ta, ra, tb, eb];
    return [ea, ta, ra, rb, tb, eb];
  }
  // Trunk groups in a tree where each office serves at most `fan` offices below it.
  function treeTrunks(n, fan) { let count = n, links = 0; while (count > 1) { links += count; count = Math.ceil(count / fan); } return links; }
  const LEVEL = id => id[0] === "r" ? "regional" : id[0] === "t" ? "toll" : "end office";
  R("s-callroute", "sim", "Unit III · Telephone Networks", "Hierarchical Call Routing", "Pick two phones and see how high the call must climb in the switching hierarchy; compare mesh and hierarchy trunk counts.", env => K.controls(env, {
    height: 300, animate: true,
    controls: [
      { id: "from", type: "select", label: "From", options: Object.keys(PHONES).map(k => [k, PHONES[k].label]), value: "dA" },
      { id: "to", type: "select", label: "To", options: Object.keys(PHONES).map(k => [k, PHONES[k].label]), value: "an" },
      { id: "hu", type: "check", label: "Pune–Mumbai toll trunk available", value: true },
      { id: "n", type: "range", label: "Exchanges (mesh vs tree)", min: 2, max: 1000, step: 1, value: 50 }
    ],
    compute(s) { return { route: routeCall(s.from, s.to, s.hu), mesh: s.n * (s.n - 1) / 2, tree: treeTrunks(s.n, 10) }; },
    draw(ctx, s, { W, time }) {
      const o = s.out, narrow = W < 640, X = x => 24 + x * (W - 48), bw = narrow ? Math.min(50, W * 0.15) : Math.min(108, W * 0.15);
      const full = o.route ? [s.from].concat(o.route, [s.to]) : [];
      const pos = id => PHONES[id] ? { x: X(PHONES[id].x), y: 268 } : { x: X(NET[id].x), y: NET[id].y };
      const onPath = (a, b) => { for (let k = 0; k < full.length - 1; k++) if ((full[k] === a && full[k + 1] === b) || (full[k] === b && full[k + 1] === a)) return true; return false; };
      const edges = [];
      Object.keys(NET).forEach(id => { if (NET[id].up) edges.push([id, NET[id].up]); });
      Object.keys(PHONES).forEach(id => edges.push([id, PHONES[id].eo]));
      edges.push(["rW", "rN"]);
      if (s.hu) edges.push(["tPu", "tMu", true]);
      edges.forEach(([a, b, dash]) => { const A = pos(a), B = pos(b), on = onPath(a, b); line(ctx, A.x, A.y, B.x, B.y, on ? C.blue : "#c8d0d9", on ? 4 : 2, dash ? [6, 5] : null); });
      Object.keys(NET).forEach(id => { const p = pos(id), on = full.indexOf(id) !== -1; shape(ctx, "box", p.x, p.y, { w: bw, h: 32, label: narrow ? NET[id].short : NET[id].label, size: narrow ? 9.5 : 11.5, stroke: on ? C.blue : C.nav, fill: on ? C.bSoft : "#fff" }); });
      Object.keys(PHONES).forEach(id => { const p = pos(id), on = id === s.from || id === s.to; ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, 7); ctx.fillStyle = on ? C.amber : "#fff"; ctx.fill(); ctx.strokeStyle = C.nav; ctx.lineWidth = 2; ctx.stroke(); });
      txt(ctx, "phones", W - 10, 290, { align: "right", size: 10, color: C.faint });
      if (full.length > 1) { const pts = full.map(pos), p = K.pointOnPath(pts, K.pathLen(pts) * ((time * 0.3) % 1)); ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, 7); ctx.fillStyle = C.amber; ctx.fill(); }
    },
    readout(s) {
      const o = s.out;
      const cmp = [["Mesh trunk groups (" + s.n + " exchanges)", o.mesh.toLocaleString(), "N(N−1)/2"], ["Tree trunk groups", o.tree.toLocaleString(), "each office serves ≤ 10 below it"]];
      if (!o.route) return "Choose two different phones." + metrics(cmp);
      const levels = []; o.route.forEach(id => { const l = LEVEL(id); if (levels.indexOf(l) === -1) levels.push(l); });
      return "Route: <b>" + [PHONES[s.from].label].concat(o.route.map(id => NET[id].label), [PHONES[s.to].label]).join(" → ") + "</b>. Levels used: " + levels.join(", ") + "." +
        metrics([["Offices used", o.route.length], ["Trunks crossed", o.route.length - 1]].concat(cmp)) +
        '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Illustrative hierarchy — not the real topology of any operator. A call climbs only as high as needed to find a common parent office (or a direct high-usage trunk).</p>';
    }
  }));

  /* ---------- s-impair ---------- */
  R("s-impair", "sim", "Unit III · Line Impairments", "Line Impairment Lab", "Add attenuation, distortion and noise to a data signal and see when the receiver starts making bit errors.", env => K.controls(env, {
    height: 300,
    controls: [
      { id: "bits", type: "text", label: "Bits", value: "1011001110001011", max: 24, mono: true, width: 170, sanitize: v => String(v).replace(/[^01]/g, "") || "0" },
      { id: "att", type: "range", label: "Attenuation", min: 0, max: 30, step: 1, value: 0, unit: "dB" },
      { id: "dist", type: "range", label: "Distortion", min: 0, max: 100, step: 5, value: 0, unit: "%" },
      { id: "noise", type: "range", label: "Noise σ", min: 0, max: 0.6, step: 0.01, value: 0, unit: "V" },
      { id: "seed", type: "button", label: "New noise", icon: "reset", onClick: s => { s.seedv = (s.seedv || 0) + 1; } }
    ],
    compute(s) {
      const bits = s.bits, N = 40, A = Math.pow(10, -s.att / 20), a = s.dist ? Math.pow(10, -s.dist / 100 * 1.3) : 1, r = L.rng(31 + (s.seedv || 0));
      const tx = [], rx = [], dec = [];
      let y = (bits[0] === "1" ? 1 : -1) * A;
      for (let i = 0; i < bits.length; i++) for (let k = 0; k < N; k++) {
        const x = bits[i] === "1" ? 1 : -1; y += (x * A - y) * a;
        const v = y + s.noise * L.gauss(r); tx.push(x); rx.push(v);
        if (k === N / 2) dec.push({ v, b: v >= 0 ? "1" : "0" });
      }
      const out = dec.map(d => d.b).join("");
      return { tx, rx, dec, out, A, errors: countTrue(diffMask(out, bits)), snrDb: s.noise > 0 ? 20 * Math.log10(A / s.noise) : Infinity };
    },
    draw(ctx, s, { W }) {
      const o = s.out, narrow = W < 560, x0 = narrow ? 12 : 120, x1 = W - 14, n = s.bits.length, bw = (x1 - x0) / n, M = o.tx.length;
      [["Transmitted", 60], ["Received", 160], ["Decided bits", 262]].forEach(([l, y]) => { if (narrow) txt(ctx, l, x0, y - 44, { align: "left", weight: "700", size: 11 }); else txt(ctx, l, 10, y, { align: "left", weight: "700", size: 12 }); });
      for (let i = 0; i <= n; i++) line(ctx, x0 + i * bw, 20, x0 + i * bw, 285, "#eef1f4", 1, [3, 3]);
      [[o.tx, 60, C.ink, 1.8], [o.rx, 160, C.blue, 1.4]].forEach(([arr, mid, col, w]) => {
        line(ctx, x0, mid, x1, mid, "#e3e8ee", 1);
        ctx.beginPath(); ctx.strokeStyle = col; ctx.lineWidth = w;
        arr.forEach((v, k) => { const X = x0 + (x1 - x0) * k / M, Y = mid - clamp(v, -1.5, 1.5) * 32; if (k === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
        ctx.stroke();
      });
      txt(ctx, "threshold 0 V", x1 - 2, 150, { align: "right", size: 10, color: C.faint });
      o.dec.forEach((d, i) => {
        const X = x0 + (i + 0.5) * bw, bad = d.b !== s.bits[i];
        ctx.beginPath(); ctx.arc(X, 160 - clamp(d.v, -1.5, 1.5) * 32, 3.5, 0, 7); ctx.fillStyle = bad ? C.red : C.primary; ctx.fill();
        if (bw >= 16) label(ctx, d.b, X, 262, { mono: true, size: 12, bg: bad ? C.rSoft : C.pSoft, border: bad ? C.red : C.primary, color: bad ? C.red : C.primary });
        else { rr(ctx, X - bw / 2 + 1, 252, bw - 2, 20, 2); ctx.fillStyle = bad ? C.red : C.primary; ctx.fill(); }
      });
    },
    readout(s) {
      const o = s.out;
      const verdict = o.errors ? '<b style="color:var(--red)">' + o.errors + " bit error" + (o.errors > 1 ? "s" : "") + ".</b> " + (s.dist >= 70 && s.noise < 0.05 ? "Heavy distortion smears neighbouring bits into each other (inter-symbol interference)." : "The noise is now large compared with the weakened signal.")
        : '<b style="color:var(--primary)">All bits decoded correctly.</b> ' + (s.att > 0 && s.noise === 0 ? "Attenuation alone does not cause errors here because nothing competes with the weak signal — but it shrinks the margin against noise." : "");
      return verdict + metrics([["Received amplitude", (o.A * 100).toFixed(o.A < 0.1 ? 1 : 0) + "% of sent"], ["SNR", isFinite(o.snrDb) ? o.snrDb.toFixed(1) + " dB" : "∞ (no noise)"], ["Bit errors", o.errors + " / " + s.bits.length, "", o.errors ? "warn" : ""]]) +
        '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Model: gain 10^(−dB/20), a first-order low-pass filter for distortion, Gaussian noise, and a decision at each bit centre. Dots show the sampled values.</p>';
    }
  }));

  /* ---------- s-crosstalk ---------- */
  R("s-crosstalk", "sim", "Unit III · Line Impairments", "Crosstalk Lab", "Change frequency, cable length, spacing, twist rate and shielding to see how NEXT and FEXT change.", env => K.controls(env, {
    height: 300,
    controls: [
      { id: "f", type: "range", label: "Signal frequency", min: 1, max: 100, step: 1, value: 16, unit: "MHz" },
      { id: "len", type: "range", label: "Parallel length", min: 1, max: 30, step: 1, value: 10, unit: "m" },
      { id: "sep", type: "range", label: "Separation", min: 2, max: 20, step: 1, value: 5, unit: "mm" },
      { id: "tw", type: "range", label: "Twists", min: 0, max: 40, step: 1, value: 20, unit: "/m" },
      { id: "stp", type: "check", label: "Shielded (STP)", value: false }
    ],
    compute(s) { return L.crosstalk({ freqMHz: s.f, lengthM: s.len, separationMm: s.sep, twistsPerM: s.tw, shielded: s.stp }); },
    draw(ctx, s, { W }) {
      const o = s.out, narrow = W < 560, cx1 = 20, cx2 = narrow ? W - 20 : W * 0.58, yA = 60, yV = 60 + 26 + s.sep * 4;
      const pair = (y, col) => {
        if (!s.tw) { line(ctx, cx1, y - 5, cx2, y - 5, col, 2.5); line(ctx, cx1, y + 5, cx2, y + 5, col, 2.5); return; }
        const period = Math.max(8, 240 / s.tw);
        [1, -1].forEach(sg => { ctx.beginPath(); ctx.strokeStyle = col; ctx.lineWidth = 2.5; for (let x = cx1; x <= cx2; x += 2) { const yy = y + sg * 6 * Math.cos(TAU * (x - cx1) / period); if (x === cx1) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); } ctx.stroke(); });
      };
      if (s.stp) [yA, yV].forEach(y => { rr(ctx, cx1 - 6, y - 14, cx2 - cx1 + 12, 28, 8); ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([]); });
      pair(yA, C.nav); pair(yV, "#8a96a3");
      txt(ctx, "aggressor pair (" + s.f + " MHz)", cx1, yA - 24, { align: "left", size: 11, weight: "600" });
      txt(ctx, "victim pair · " + s.sep + " mm away" + (s.stp ? " · shielded" : ""), cx1, yV + 26, { align: "left", size: 11, weight: "600", color: C.soft });
      const bx = narrow ? 40 : W * 0.66, bw = narrow ? (W - 80) / 2 : (W - bx - 20) / 2, by0 = narrow ? 180 : 30, by1 = narrow ? 268 : 262, Hh = by1 - by0;
      const y = db => by0 + clamp(-db / 80, 0, 1) * Hh;
      if (!narrow) for (let d = 0; d <= 80; d += 20) { line(ctx, bx - 4, y(-d), W - 14, y(-d), "#eef1f4", 1); txt(ctx, "−" + d + " dB", bx - 8, y(-d), { align: "right", size: 10, color: C.faint }); }
      [["NEXT", o.nextDb, C.red], ["FEXT", o.fextDb, C.amber]].forEach(([l, db, col], k) => {
        const x = bx + k * bw + bw * 0.2, top = y(db);
        rr(ctx, x, top, bw * 0.6, Math.max(2, by1 - top), 4); ctx.fillStyle = col; ctx.fill();
        txt(ctx, l + " " + db.toFixed(1) + " dB", x + bw * 0.3, by1 + 14, { size: 11, weight: "700", color: col });
      });
      txt(ctx, "coupled crosstalk relative to the signal (lower bar = better)", narrow ? W / 2 : (bx + W) / 2, narrow ? 168 : 14, { size: 10, color: C.faint });
    },
    readout(s) {
      const o = s.out, sat = o.next >= 1;
      return (sat ? '<b style="color:var(--red)">Coupling has reached the model\'s limit</b> — the crosstalk is as large as the signal. Separate the cables, add twists or use STP.'
        : "Crosstalk on the victim is <b>" + (-o.nextDb).toFixed(1) + " dB</b> below the signal at the near end (NEXT) and <b>" + (-o.fextDb).toFixed(1) + " dB</b> below at the far end (FEXT). Higher numbers are better.") +
        metrics([["NEXT loss", sat ? "0 dB (limit)" : (-o.nextDb).toFixed(1) + " dB", "", o.nextDb > -20 ? "warn" : ""], ["FEXT loss", (-o.fextDb).toFixed(1) + " dB"], ["Twisting", s.tw ? s.tw + " per m" : "none"], ["Shield", s.stp ? "STP (−20 dB)" : "UTP"]]) +
        '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Simplified teaching model: coupling ∝ frequency × length ÷ separation, reduced by twisting and shielding. It shows the trends, not cable-specification values (real Cat 6 cable achieves far better NEXT loss).</p>';
    }
  }));

  /* ---------- s-distortion ---------- */
  const DIST_CTLS = ["z0", "zl", "km", "df", "clip"];
  R("s-distortion", "sim", "Unit III · Line Impairments", "Echo, Frequency Shift and Clipping Lab", "Calculate reflections from impedance mismatches, watch a frequency offset build up phase error, and measure the harmonics created by clipping.", env => K.controls(env, {
    height: 300, animate: true,
    controls: [
      { id: "mode", type: "select", label: "Mode", options: [["echo", "Echo"], ["shift", "Frequency shift"], ["nl", "Non-linear"]], value: "echo" },
      { id: "z0", type: "select", label: "Line Z₀", options: [["50", "50 Ω"], ["75", "75 Ω"], ["100", "100 Ω"], ["600", "600 Ω"]], value: "50" },
      { id: "zl", type: "range", label: "Load Z_L", min: 0, max: 1200, step: 5, value: 75, unit: "Ω" },
      { id: "km", type: "range", label: "Line length", min: 1, max: 4000, step: 1, value: 100, unit: "km" },
      { id: "df", type: "range", label: "Frequency offset", min: 0, max: 20, step: 0.5, value: 3, unit: "Hz" },
      { id: "clip", type: "range", label: "Clipping level", min: 0.1, max: 1, step: 0.05, value: 0.5, fmt: v => (v * 100).toFixed(0) + "%" }
    ],
    compute(s) {
      return { refl: L.reflection(+s.zl, +s.z0), echoMs: 2 * s.km * 1000 / 2e8 * 1000, H: clippedHarmonics(+s.clip, 9), quarterTurnMs: s.df > 0 ? 1000 / (4 * s.df) : Infinity };
    },
    draw(ctx, s, { W, time, cv }) {
      showCtl(cv, DIST_CTLS, { echo: ["z0", "zl", "km"], shift: ["df"], nl: ["clip"] }[s.mode]);
      const o = s.out, narrow = W < 560, x0 = narrow ? 16 : 140, x1 = W - 20;
      const rowName = (l, mid, col, lift) => { if (narrow) txt(ctx, l, 16, mid - lift, { align: "left", weight: "700", size: 11.5, color: col }); else txt(ctx, l, 10, mid, { align: "left", weight: "700", size: 12, color: col }); };
      if (s.mode === "echo") {
        const xs = 40, xl = W - 50, y = 150, g = o.refl.gamma, bx = xs + 32, ex = xl - 42, k = (time * 0.4) % 1, matched = Math.abs(g) < 0.005;
        shape(ctx, "box", xs, y, { w: 64, h: 40, label: "Source", size: narrow ? 11 : 12.5 }); shape(ctx, "box", xl, y, { w: 84, h: 40, label: "Z_L " + s.zl + " Ω", fill: C.aSoft, size: narrow ? 11 : 12.5 });
        line(ctx, bx, y, ex, y, C.nav, 3); txt(ctx, "Z₀ = " + s.z0 + " Ω, " + s.km + " km", (bx + ex) / 2, y + 28, { size: 11, color: C.soft });
        if (k < 0.5) { const x = bx + (ex - bx) * k * 2; rr(ctx, x - 12, y - 42, 24, 40, 3); ctx.fillStyle = C.blue; ctx.fill(); }
        else if (!matched) { const x = ex - (ex - bx) * (k - 0.5) * 2, h = 40 * Math.abs(g); rr(ctx, x - 12, g >= 0 ? y - 2 - h : y + 2, 24, Math.max(2, h), 3); ctx.fillStyle = C.red; ctx.fill(); }
        label(ctx, matched ? "matched: no reflection" : "reflected " + (g > 0 ? "upright" : "inverted") + ", amplitude ×" + Math.abs(g).toFixed(2), W / 2, 70, { size: 11.5, color: matched ? C.primary : C.red, border: matched ? C.primary : C.red, bg: matched ? C.pSoft : C.rSoft });
        txt(ctx, "blue: incident pulse · red: echo (not to time scale)", W / 2, 262, { size: 10.5, color: C.faint });
        return;
      }
      if (s.mode === "shift") {
        const drift = TAU * s.df * (time % 60) * 0.05;
        [["Sent", x => Math.sin(TAU * 10 * x), C.blue], ["Received (+" + s.df + " Hz)", x => Math.sin(TAU * 10 * x + drift), C.red]].forEach(([l, f, col], k) => {
          const mid = 76 + k * 100;
          rowName(l, mid, col, 44);
          line(ctx, x0, mid, x1, mid, "#e3e8ee", 1); drawWave(ctx, f, x0, x1, mid, 32, col, 2);
        });
        txt(ctx, "drift slowed 20× so it is visible", W / 2, 272, { size: 10.5, color: C.faint });
        return;
      }
      const c = +s.clip, wx1 = narrow ? x1 : x0 + (W - x0) * 0.5 - 20;
      [["Input", x => Math.sin(TAU * 2 * x), C.blue, 76], ["Output", x => clamp(Math.sin(TAU * 2 * x), -c, c), C.red, 196]].forEach(([l, f, col, mid]) => {
        rowName(l, mid, col, 50);
        line(ctx, x0, mid, wx1, mid, "#e3e8ee", 1); drawWave(ctx, f, x0, wx1, mid, 40, col, 2);
      });
      if (!narrow) {
        const bx0 = wx1 + 30, bw = (x1 - bx0) / 9, base = 236;
        line(ctx, bx0, base, x1, base, C.ink, 1.2);
        for (let h = 1; h <= 9; h++) { const v = o.H.a[h] / o.H.a[1], hh = 180 * v, x = bx0 + (h - 0.5) * bw; if (hh > 0.5) { rr(ctx, x - bw * 0.3, base - hh, bw * 0.6, hh, 3); ctx.fillStyle = h === 1 ? C.blue : C.red; ctx.fill(); } txt(ctx, h === 1 ? "f" : h + "f", x, base + 13, { size: 10.5, color: C.soft }); }
        txt(ctx, "output spectrum (relative to f)", (bx0 + x1) / 2, 272, { size: 11, color: C.faint });
      } else txt(ctx, "harmonic levels are listed below", W / 2, 272, { size: 11, color: C.faint });
    },
    readout(s) {
      const o = s.out;
      if (s.mode === "echo") {
        const g = o.refl.gamma;
        return "Γ = (Z_L − Z₀)/(Z_L + Z₀) = (" + s.zl + " − " + s.z0 + ")/(" + s.zl + " + " + s.z0 + ") = <b>" + g.toFixed(3) + "</b>. " +
          (Math.abs(g) < 0.005 ? "The load matches the line, so nothing is reflected." : (g * g * 100).toFixed(1) + "% of the power returns as an echo after " + o.echoMs.toFixed(2) + " ms." + (o.echoMs > 25 ? " Echo delayed by more than ~25 ms is very annoying on a voice call — echo cancellers are needed." : "")) +
          metrics([["Γ", g.toFixed(3)], ["Return loss", isFinite(o.refl.returnLossDb) ? o.refl.returnLossDb.toFixed(1) + " dB" : "∞ (matched)", "higher = less echo"], ["Reflected power", o.refl.reflectedPct.toFixed(1) + "%"], ["Echo delay", o.echoMs.toFixed(2) + " ms", "velocity 2×10⁸ m/s"]]);
      }
      if (s.mode === "shift") return (s.df ? "A " + s.df + " Hz offset makes the phase error grow by 360° every " + (1000 / s.df).toFixed(0) + " ms. After <b>" + o.quarterTurnMs.toFixed(1) + " ms</b> the error reaches 90°, enough to wreck coherent PSK decisions unless the receiver tracks the carrier (phase-locked loop)." : "No offset: the sender's and receiver's oscillators agree, so the phase stays aligned.") +
        metrics([["Offset", s.df + " Hz"], ["Time to 90° error", isFinite(o.quarterTurnMs) ? o.quarterTurnMs.toFixed(1) + " ms" : "never"], ["Phase drift", (360 * s.df).toFixed(0) + "° per second"]]);
      const h = o.H.a, rel = k => (h[k] / h[1] * 100).toFixed(1) + "%";
      return (s.clip >= 0.999 ? "No clipping: the output is a scaled copy of the input, so no new frequencies appear." : "Clipping at " + (s.clip * 100).toFixed(0) + "% of the peak creates <b>odd harmonics</b> (3f, 5f, 7f…) that were not in the input. Even harmonics stay at zero because the clipping is symmetric.") +
        metrics([["3rd harmonic", rel(3)], ["5th harmonic", rel(5)], ["7th harmonic", rel(7)], ["THD", (o.H.thd * 100).toFixed(1) + "%", "", o.H.thd > 0.1 ? "warn" : ""]]);
    }
  }));

  /* ---------- s-jitter ---------- */
  function eyeTraces(pj, aj, seed) {
    const r = L.rng(seed), tr = [];
    for (let k = 0; k < 160; k++) tr.push({ b: [r() < 0.5, r() < 0.5, r() < 0.5], d1: clamp(pj * L.gauss(r), -0.45, 0.45), d2: clamp(pj * L.gauss(r), -0.45, 0.45), amp: Math.max(0.1, 1 + aj * L.gauss(r)) });
    return tr;
  }
  function eyeVal(tr, x, rise) {
    const lv = tr.b.map(b => (b ? 1 : -1) * tr.amp), ramp = u => clamp(u + 0.5, 0, 1);
    return lv[0] + (lv[1] - lv[0]) * ramp((x - 0.5 - tr.d1) / rise) + (lv[2] - lv[1]) * ramp((x - 1.5 - tr.d2) / rise);
  }
  R("s-jitter", "sim", "Unit III · Line Impairments", "Jitter Lab: Eye Diagram and Packet Jitter", "Add timing and amplitude jitter to see the eye diagram close, and raise network congestion to see RFC 3550 packet jitter grow.", env => K.controls(env, {
    height: w => w < 560 ? 520 : 300,
    controls: [
      { id: "pj", type: "range", label: "Timing (phase) jitter", min: 0, max: 0.25, step: 0.01, value: 0.04, unit: "UI" },
      { id: "aj", type: "range", label: "Amplitude jitter", min: 0, max: 0.4, step: 0.01, value: 0.05 },
      { id: "cong", type: "range", label: "Network congestion", min: 0, max: 100, step: 5, value: 20, unit: "%" },
      { id: "seed", type: "button", label: "New sample", icon: "reset", onClick: s => { s.seedv = (s.seedv || 0) + 1; } }
    ],
    compute(s) {
      const rise = 0.2, tr = eyeTraces(s.pj, s.aj, 5 + (s.seedv || 0));
      const ones = tr.filter(t => t.b[1]).map(t => eyeVal(t, 1, rise)), zeros = tr.filter(t => !t.b[1]).map(t => eyeVal(t, 1, rise));
      const height = Math.max(0, (Math.min.apply(null, ones) - Math.max.apply(null, zeros)) / 2);
      const tA = tr.filter(t => t.b[0] !== t.b[1]).map(t => t.d1), tB = tr.filter(t => t.b[1] !== t.b[2]).map(t => t.d2);
      const width = height > 0 ? Math.max(0, (1 + Math.min.apply(null, tB)) - Math.max.apply(null, tA) - rise) : 0;
      const r = L.rng(77 + (s.seedv || 0)), send = [], arrive = [];
      for (let k = 0; k < 50; k++) { send.push(k * 20); arrive.push(k * 20 + 40 + (-Math.log(1 - r() * 0.999)) * s.cong / 100 * 12 + 0.3 * r()); }
      const js = L.jitterStats(send, arrive), transit = arrive.map((a, k) => a - send[k]);
      return { tr, rise, height, width, js, transit, late: transit.filter(x => x - js.min > 30).length };
    },
    draw(ctx, s, { W, H }) {
      const o = s.out, narrow = W < 560;
      const ex0 = 20, ex1 = narrow ? W - 20 : W * 0.55, ey0 = 34, ey1 = narrow ? 240 : 250, mid = (ey0 + ey1) / 2, amp = (ey1 - ey0) * 0.34;
      txt(ctx, "Eye diagram (160 bit periods overlaid)", (ex0 + ex1) / 2, 14, { size: 11.5, weight: "700" });
      ctx.globalAlpha = 0.28;
      o.tr.forEach(t => drawWave(ctx, x => eyeVal(t, x * 2, o.rise), ex0, ex1, mid, amp, C.blue, 1, 120));
      ctx.globalAlpha = 1;
      const cx = (ex0 + ex1) / 2, uiW = (ex1 - ex0) / 2;
      line(ctx, cx, ey0, cx, ey1, C.red, 1, [3, 3]); txt(ctx, "sampling instant", cx, ey1 + 12, { size: 10, color: C.red });
      if (o.height > 0) { ctx.strokeStyle = C.primary; ctx.lineWidth = 2; ctx.strokeRect(cx - o.width / 2 * uiW, mid - o.height * amp, o.width * uiW, 2 * o.height * amp); }
      else label(ctx, "eye closed", cx, mid, { color: "#fff", bg: C.red, border: C.red, size: 12 });
      const px0 = narrow ? 40 : W * 0.63, px1 = W - 16, py0 = narrow ? 310 : 44, py1 = narrow ? H - 26 : 250;
      txt(ctx, "Packet transit time, ms (packets every 20 ms)", (px0 + px1) / 2, py0 - 26, { size: 11.5, weight: "700" });
      const maxT = Math.max(80, Math.max.apply(null, o.transit) + 5), yT = v => py1 - (v - 30) / (maxT - 30) * (py1 - py0);
      line(ctx, px0, py1, px1, py1, C.ink, 1); line(ctx, px0, py0, px0, py1, C.ink, 1);
      [40, 60, 80, 100, 120, 140].filter(v => v <= maxT).forEach(v => { txt(ctx, v + "", px0 - 4, yT(v), { size: 9.5, align: "right", color: C.faint }); line(ctx, px0, yT(v), px1, yT(v), "#eef1f4", 1); });
      const lim = o.js.min + 30;
      if (lim < maxT) { line(ctx, px0, yT(lim), px1, yT(lim), C.red, 1.2, [4, 3]); txt(ctx, "30 ms jitter-buffer limit", px1, yT(lim) - 8, { size: 9.5, align: "right", color: C.red }); }
      o.transit.forEach((v, k) => { const x = px0 + (k + 0.5) / 50 * (px1 - px0); ctx.beginPath(); ctx.arc(x, yT(v), 2.8, 0, 7); ctx.fillStyle = v > lim ? C.red : C.violet; ctx.fill(); });
      txt(ctx, "packet number →", px1, py1 + 12, { size: 9.5, align: "right", color: C.faint });
    },
    readout(s) {
      const o = s.out;
      return (o.height > 0 ? "The eye is open: " + (o.height * 100).toFixed(0) + "% of its ideal height and " + o.width.toFixed(2) + " UI wide at the sampling instant." : '<b style="color:var(--red)">The eye is closed</b> — some bit periods cross the decision point, so bit errors occur.') +
        " Timing jitter closes the eye horizontally; amplitude jitter closes it vertically." +
        metrics([["Eye height", (o.height * 100).toFixed(0) + "%", "", o.height < 0.3 ? "warn" : ""], ["Eye width", o.width.toFixed(2) + " UI"], ["RFC 3550 jitter", o.js.rfc3550.toFixed(2) + " ms"], ["Mean latency", o.js.meanLatency.toFixed(1) + " ms"], ["Late for a 30 ms buffer", o.late + " / 50", "", o.late ? "warn" : ""]]) +
        '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Simulated: random bits with Gaussian timing and amplitude jitter; packets with 40 ms base delay plus random queuing that grows with congestion. Jitter J uses J += (|D| − J)/16 (RFC 3550).</p>';
    }
  }));

  /* ---------- s-transients ---------- */
  const TR_BITS = (function () { const r = L.rng(21); let b = ""; for (let i = 0; i < 32; i++) b += r() < 0.5 ? "1" : "0"; return b; })();
  const TR_SPOTS = [6, 19, 11, 25, 2, 15, 22, 8, 28, 13, 4, 17];
  const TR_TYPES = { impulse: { ms: 0.5, col: C.red, name: "Impulse" }, gain: { ms: 5, col: C.amber, name: "Gain hit" }, drop: { ms: 6, col: C.blue, name: "Dropout" }, phase: { ms: 5, col: C.violet, name: "Phase hit" } };
  function addEvent(s, type) { s.events = s.events || []; s.events.push({ type, at: TR_SPOTS[s.events.length % TR_SPOTS.length] }); }
  function runTransients(s) {
    const N = 32, nb = TR_BITS.length, r = L.rng(99), rate = +s.rate, samples = [], dec = [];
    const evs = (s.events || []).map(e => { const len = Math.max(1, Math.round(TR_TYPES[e.type].ms / 1000 * rate * N)), st = Math.round((e.at + 0.3) * N); return Object.assign({ st, en: Math.min(nb * N, st + len) }, e); });
    for (let i = 0; i < nb; i++) {
      const one = TR_BITS[i] === "1"; let I = 0, Q = 0, c1 = 0, c0 = 0;
      for (let k = 0; k < N; k++) {
        const n = i * N + k, ph = TAU * k / N;
        let g = 1, dp = 0, add = 0;
        evs.forEach(e => {
          if (e.type === "impulse") add += 3 * Math.exp(-Math.pow((n - e.st) / 1.5, 2)) * (n < e.st ? 1 : -1);
          else if (n >= e.st && n < e.en) { if (e.type === "gain") g *= 2; else if (e.type === "drop") g *= 0.01; else dp += s.ph * Math.PI / 180; }
        });
        let v;
        if (s.mod === "ASK") v = (one ? 1 : 0.4) * Math.sin(2 * ph + dp);
        else if (s.mod === "FSK") v = Math.sin((one ? 4 : 2) * ph + dp);
        else v = Math.sin(2 * ph + (one ? 0 : Math.PI) + dp);
        v = g * v + add + 0.12 * L.gauss(r);
        samples.push(v);
        I += v * Math.sin(2 * ph); Q += v * Math.cos(2 * ph); c1 += v * Math.sin(4 * ph); c0 += v * Math.sin(2 * ph);
      }
      let d;
      if (s.mod === "ASK") d = 2 * Math.hypot(I, Q) / N > 0.7 ? "1" : "0";
      else if (s.mod === "FSK") d = c1 > c0 ? "1" : "0";
      else d = I >= 0 ? "1" : "0";
      dec.push(d);
    }
    const out = dec.join(""), mask = diffMask(out, TR_BITS);
    const counts = { impulse: 0, gain: 0, drop: 0, phase: 0 }; evs.forEach(e => counts[e.type]++);
    const inDrop = evs.filter(e => e.type === "drop").reduce((t, e) => t + (Math.ceil(e.en / N) - Math.floor(e.st / N)), 0);
    return { samples, out, mask, errors: countTrue(mask), evs, counts, inDrop };
  }
  R("s-transients", "sim", "Unit III · Line Impairments", "Transient Injector", "Send data with ASK, FSK or PSK, inject impulse noise, gain hits, dropouts and phase hits, and count the bit errors.", env => K.controls(env, {
    height: 300,
    controls: [
      { id: "mod", type: "select", label: "Modulation", options: [["ASK", "ASK"], ["FSK", "FSK"], ["PSK", "PSK (BPSK)"]], value: "ASK" },
      { id: "rate", type: "select", label: "Bit rate", options: [["600", "600 bit/s"], ["1200", "1200 bit/s"], ["2400", "2400 bit/s"]], value: "1200" },
      { id: "ph", type: "range", label: "Phase hit size", min: 20, max: 180, step: 5, value: 120, unit: "°" },
      { id: "bImp", type: "button", label: "Impulse", onClick: s => addEvent(s, "impulse") },
      { id: "bGain", type: "button", label: "Gain hit", onClick: s => addEvent(s, "gain") },
      { id: "bDrop", type: "button", label: "Dropout", onClick: s => addEvent(s, "drop") },
      { id: "bPhase", type: "button", label: "Phase hit", onClick: s => addEvent(s, "phase") },
      { id: "bClr", type: "button", label: "Clear", icon: "reset", onClick: s => { s.events = []; } }
    ],
    init(s) { s.events = []; },
    compute(s) { return runTransients(s); },
    draw(ctx, s, { W }) {
      const o = s.out, narrow = W < 560, x0 = narrow ? 12 : 110, x1 = W - 12, nb = TR_BITS.length, bw = (x1 - x0) / nb, M = o.samples.length, X = n => x0 + (x1 - x0) * n / M;
      [["Sent bits", 40], ["Line signal", 150], ["Decided", 262]].forEach(([l, y]) => { if (narrow) txt(ctx, l, x0, y - 30, { align: "left", weight: "700", size: 11 }); else txt(ctx, l, 10, y, { align: "left", weight: "700", size: 12 }); });
      o.evs.forEach((e, k) => { const xa = X(e.st), xb = Math.max(xa + 3, X(e.en)); ctx.fillStyle = TR_TYPES[e.type].col; ctx.globalAlpha = 0.14; ctx.fillRect(xa, 70, xb - xa, 150); ctx.globalAlpha = 1; txt(ctx, TR_TYPES[e.type].name, (xa + xb) / 2, 76 + (k % 2) * 12, { size: 9.5, weight: "700", color: TR_TYPES[e.type].col }); });
      for (let i = 0; i < nb; i++) {
        const xx = x0 + i * bw; rr(ctx, xx + 1, 30, bw - 2, 20, 2); ctx.fillStyle = TR_BITS[i] === "1" ? C.pSoft : "#fff"; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
        if (bw >= 14) txt(ctx, TR_BITS[i], xx + bw / 2, 40, { mono: true, size: 10.5, weight: "700" });
        const bad = o.mask[i]; rr(ctx, xx + 1, 252, bw - 2, 20, 2); ctx.fillStyle = bad ? C.red : C.pSoft; ctx.fill();
        if (bw >= 14) txt(ctx, o.out[i], xx + bw / 2, 262, { mono: true, size: 10.5, weight: "700", color: bad ? "#fff" : C.primary });
      }
      line(ctx, x0, 150, x1, 150, "#e3e8ee", 1);
      ctx.beginPath(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
      o.samples.forEach((v, n) => { const Y = 150 - clamp(v, -2.2, 2.2) * 30; if (n === 0) ctx.moveTo(X(n), Y); else ctx.lineTo(X(n), Y); });
      ctx.stroke();
    },
    readout(s) {
      const o = s.out, c = o.counts;
      let head = o.errors ? '<b style="color:var(--red)">' + o.errors + " bit error" + (o.errors > 1 ? "s" : "") + "</b> in 32 bits." : '<b style="color:var(--primary)">No bit errors.</b>';
      if (!o.evs.length) head += " Press a transient button to inject one.";
      if (c.drop) head += " The dropout" + (c.drop > 1 ? "s" : "") + " covered " + o.inDrop + " bit period" + (o.inDrop > 1 ? "s" : "") + " at " + s.rate + " bit/s.";
      const over = c.gain > 8 || c.phase > 8 || c.drop > 1;
      return head + metrics([["Gain hits", c.gain, "limit ≤ 8 per 15 min", c.gain > 8 ? "warn" : ""], ["Phase hits", c.phase, "limit ≤ 8 per 15 min", c.phase > 8 ? "warn" : ""], ["Dropouts", c.drop, "limit ≤ 1 per 30 min", c.drop > 1 ? "warn" : ""], ["Impulses", c.impulse], ["Bit errors", o.errors + " / 32", "", o.errors ? "warn" : ""]]) +
        (over ? '<p style="margin:6px 0 0"><b style="color:var(--red)">Over the telephone-standard limit</b> if all of these hits happened within the stated period.</p>' : "") +
        '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Simulated: two-level ASK (amplitudes 1 and 0.4) with an envelope detector; FSK and PSK use coherent detectors without phase tracking; light background noise. Gain hit = +6 dB for 5 ms; dropout = −40 dB for 6 ms (any drop over 12 dB for over 4 ms counts); phase hit = the chosen size for 5 ms; impulse ≈ 0.5 ms.</p>';
    }
  }));
})();
