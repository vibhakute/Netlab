/* Additional-topic visualizations and simulations, plus the Visualize/Simulate
   mapping for the 24 Additional (pre-syllabus) topics. Logic: SimLogic; drawing: VizKit. */
(function () {
  "use strict";
  const K = VizKit, L = SimLogic;
  const { C, txt, label, line, rr, shape, wrapText, metrics, pointOnPath, pathLen } = K;
  const { escapeHtml } = App;
  const R = (id, kind, cat, title, desc, run, params) => K.register(id, { kind, category: cat, title, desc, run, params: params || {} });
  const hex = (n, w) => n.toString(16).toUpperCase().padStart(w || 2, "0");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1); // progress of t inside [a,b]

  /* Generic graph drawing used by several timelines.
     g = {N:{name:{x,y,t,l}}, E:[[a,b,{bb,dash}]]}; o = {hi, dead, edges, broken, tokens, labels} */
  function drawGraph(ctx, g, o) {
    o = o || {};
    const br = (o.broken || []).map(e => e.join(">")), hiE = (o.edges || []).map(e => e.join(">"));
    g.E.forEach(([a, b, eo]) => {
      eo = eo || {};
      const A = g.N[a], B = g.N[b], k1 = a + ">" + b, k2 = b + ">" + a;
      const isBr = br.indexOf(k1) !== -1 || br.indexOf(k2) !== -1, isHi = hiE.indexOf(k1) !== -1 || hiE.indexOf(k2) !== -1;
      line(ctx, A.x, A.y, B.x, B.y, isBr ? C.red : isHi ? (eo.hi || C.blue) : (eo.color || (eo.bb ? C.nav : "#b8c2cc")), isHi || eo.bb ? 4 : 2.5, isBr ? [7, 6] : eo.dash);
      if (isBr) txt(ctx, "✕", (A.x + B.x) / 2, (A.y + B.y) / 2, { size: 18, weight: "700", color: C.red });
      else if (eo.label) label(ctx, eo.label, (A.x + B.x) / 2, (A.y + B.y) / 2 + (eo.ly || 0), { size: 10.5, color: eo.color || C.soft, border: eo.color || C.line });
    });
    Object.keys(g.N).forEach(k => {
      const n = g.N[k], on = (o.hi || []).indexOf(k) !== -1, dead = (o.dead || []).indexOf(k) !== -1;
      if (n.t === "tap") { ctx.beginPath(); ctx.arc(n.x, n.y, 3.5, 0, 7); ctx.fillStyle = C.nav; ctx.fill(); return; }
      if (n.t === "term") { ctx.fillStyle = C.nav; ctx.fillRect(n.x - 4, n.y - 10, 8, 20); return; }
      ctx.globalAlpha = dead ? 0.35 : 1;
      shape(ctx, n.t, n.x, n.y, { label: n.l, sub: n.sub, w: n.w, h: n.h, glow: on ? "rgba(31,111,209,.16)" : null, stroke: n.stroke, fill: n.fill });
      ctx.globalAlpha = 1;
    });
    (o.tokens || []).forEach(tk => {
      if (tk.k === undefined || tk.k < 0) return;
      if (tk.k >= 1 && tk.vanish) return;
      const pts = tk.path.map(n => g.N[n]);
      const p = pointOnPath(pts, pathLen(pts) * Math.min(1, tk.k));
      label(ctx, tk.label || "data", p.x, p.y + (tk.dy || 0), { bg: tk.color || C.amber, border: tk.color || C.amber, color: "#fff", size: 11 });
    });
    (o.labels || []).forEach(l => {
      const n = g.N[l.at];
      label(ctx, l.text, n.x + (l.dx || 0), n.y + (l.dy === undefined ? -40 : l.dy), { bg: l.bg || C.aSoft, border: l.color || C.amber, color: l.color || C.amber, size: 11 });
    });
  }

  /* ---------- v-topologies ---------- */
  function topo(key, W) {
    const N = {}, E = [];
    const ell = (n, cx, cy, rx, ry, off) => Array.from({ length: n }, (_, k) => { const a = (off === undefined ? -Math.PI / 2 : off) + k * 2 * Math.PI / n; return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) }; });
    if (key === "bus") {
      const x0 = W * 0.05, x1 = W * 0.95, y = 150, chain = ["tL"];
      N.tL = { x: x0, y, t: "term" }; N.tR = { x: x1, y, t: "term" };
      for (let k = 1; k <= 6; k++) { const x = x0 + (x1 - x0) * (k - 0.5) / 6; N["t" + k] = { x, y, t: "tap" }; N["p" + k] = { x, y: k % 2 ? 66 : 226, t: "pc", l: "PC" + k }; E.push(["t" + k, "p" + k]); chain.push("t" + k); }
      chain.push("tR"); for (let k = 0; k < chain.length - 1; k++) E.push([chain[k], chain[k + 1], { bb: true }]);
    } else if (key === "star") {
      N.s = { x: W / 2, y: 150, t: "switch" };
      ell(6, W / 2, 150, Math.min(W * 0.38, 240), 100).forEach((p, k) => { N["p" + (k + 1)] = { x: p.x, y: p.y, t: "pc", l: "PC" + (k + 1) }; E.push(["s", "p" + (k + 1)]); });
    } else if (key === "ring") {
      ell(6, W / 2, 148, Math.min(W * 0.36, 220), 100).forEach((p, k) => { N["p" + (k + 1)] = { x: p.x, y: p.y, t: "pc", l: "PC" + (k + 1) }; });
      for (let k = 1; k <= 6; k++) E.push(["p" + k, "p" + (k % 6 + 1)]);
    } else if (key === "mesh") {
      ell(5, W / 2, 150, Math.min(W * 0.36, 220), 100).forEach((p, k) => { N["p" + (k + 1)] = { x: p.x, y: p.y, t: "pc", l: "PC" + (k + 1) }; });
      for (let a = 1; a <= 5; a++) for (let b = a + 1; b <= 5; b++) E.push(["p" + a, "p" + b]);
    } else if (key === "tree") {
      N.r = { x: W / 2, y: 40, t: "switch" }; N.h1 = { x: W * 0.27, y: 136, t: "switch" }; N.h2 = { x: W * 0.73, y: 136, t: "switch" };
      E.push(["r", "h1"], ["r", "h2"]);
      [0.1, 0.27, 0.44].forEach((x, k) => { N["p" + (k + 1)] = { x: W * x, y: 236, t: "pc", l: "PC" + (k + 1) }; E.push(["h1", "p" + (k + 1)]); });
      [0.56, 0.73, 0.9].forEach((x, k) => { N["p" + (k + 4)] = { x: W * x, y: 236, t: "pc", l: "PC" + (k + 4) }; E.push(["h2", "p" + (k + 4)]); });
    } else { // hybrid: a star joined to a ring
      N.s = { x: W * 0.22, y: 150, t: "switch" };
      [[0.08, 56], [0.08, 236], [0.36, 236]].forEach(([x, y], k) => { N["p" + (k + 1)] = { x: W * x, y, t: "pc", l: "PC" + (k + 1) }; E.push(["s", "p" + (k + 1)]); });
      ell(4, W * 0.74, 150, Math.min(W * 0.17, 130), 90, Math.PI).forEach((p, k) => { N["r" + (k + 1)] = { x: p.x, y: p.y, t: "pc", l: "R" + (k + 1) }; });
      for (let k = 1; k <= 4; k++) E.push(["r" + k, "r" + (k % 4 + 1)]);
      E.push(["s", "r1", { bb: true }]);
    }
    return { N, E };
  }
  const TOPO_STAGES = [
    { key: "bus", title: "Bus: one shared backbone", text: "All stations tap into one cable with a <b>terminator</b> at each end. PC2's signal spreads in <b>both directions</b> and reaches every station; only PC5 (the addressed one) accepts it. Cheap and simple, but only one station can transmit at a time." },
    { key: "bus", fault: true, title: "Bus: a backbone break", text: "A cut in the backbone splits the network: PC4–PC6 can no longer be reached, and the unterminated cable ends reflect the signal. One backbone fault can stop the whole bus." },
    { key: "star", title: "Star: everything through a central device", text: "Each PC has its own cable to a central <b>hub or switch</b>. PC1 → PC4 passes through the centre. Easy to install, manage and troubleshoot." },
    { key: "star", fault: true, title: "Star: one cable fails", text: "PC6's cable fails, but the others keep working — only PC6 is cut off. If the <b>central device</b> fails, however, every station loses connectivity (single point of failure)." },
    { key: "ring", title: "Ring: passing the signal around", text: "Each station connects to exactly two neighbours. Data travels in one direction and every station on the way <b>regenerates</b> (repeats) it until it reaches the destination. Often a <b>token</b> controls who may send." },
    { key: "ring", fault: true, title: "Ring: one break stops the ring", text: "In a single ring, one broken link stops all traffic that must cross it. A <b>dual ring</b> (as in FDDI) wraps traffic around the fault in the opposite direction." },
    { key: "mesh", title: "Mesh: a dedicated link to everyone", text: "In a full mesh each device links directly to every other. With n = 5 devices there are n(n−1)/2 = <b>10 links</b> and n−1 = 4 ports per device. PC1 → PC3 uses its own private link." },
    { key: "mesh", fault: true, title: "Mesh: rerouting around a failure", text: "The PC1–PC3 link fails, so traffic takes another path (PC1 → PC2 → PC3). Very robust and private, but cabling and ports grow quickly — expensive for large networks." },
    { key: "tree", title: "Tree: a hierarchy of stars", text: "A root device connects branch devices, each heading its own star. PC1 → PC5 climbs to the root and descends the other branch. Scales well; if the root fails, the branches are cut off from each other." },
    { key: "hybrid", title: "Hybrid: combining topologies", text: "Real networks mix topologies — here a star (PC1–PC3) is joined to a ring (R1–R4). PC1's data crosses the star, enters the ring and is passed along to R3. A hybrid combines the strengths of each part." }
  ];
  R("v-topologies", "viz", "Networking · Topologies", "Network Topologies Compared", "Bus, star, ring, mesh, tree and hybrid layouts — with a packet and a failure for each.", env => K.timeline(env, {
    height: 290,
    stages: TOPO_STAGES.map(s => ({ title: s.title, text: s.text, dur: 4 })),
    draw(ctx, st) {
      const S = TOPO_STAGES[st.i], g = topo(S.key, st.W), t = st.t, o = { tokens: [], labels: [], broken: [], hi: [] };
      if (S.key === "bus") {
        if (!S.fault) {
          o.tokens.push({ path: ["p2", "t2"], k: seg(t, 0, 0.25), label: "frame", vanish: true });
          if (t > 0.25) { o.tokens.push({ path: ["t2", "t1", "tL"], k: seg(t, 0.25, 0.6), label: "signal", color: C.blue, vanish: true }); o.tokens.push({ path: ["t2", "t3", "t4", "t5", "t6", "tR"], k: seg(t, 0.25, 1), label: "signal", color: C.blue, vanish: true }); }
          if (t > 0.7) { o.labels.push({ at: "p5", text: "accepts ✓", color: C.primary, bg: C.pSoft, dy: 40 }); o.labels.push({ at: "p3", text: "ignores", color: C.soft, bg: "#fff", dy: -36 }); }
          o.hi = ["p2", "p5"];
        } else {
          o.broken = [["t3", "t4"]];
          o.tokens.push({ path: ["p1", "t1", "t2", "t3"], k: seg(t, 0, 0.6), label: "signal", color: C.blue });
          if (t > 0.6) o.labels.push({ at: "p5", text: "unreachable", color: C.red, bg: C.rSoft, dy: -36 });
          o.dead = ["p4", "p5", "p6"]; o.hi = ["p1"];
        }
      } else if (S.key === "star") {
        o.tokens.push({ path: ["p1", "s", "p4"], k: t, label: "frame" }); o.hi = ["p1", "p4"];
        if (S.fault) { o.broken = [["s", "p6"]]; o.dead = ["p6"]; o.labels.push({ at: "p6", text: "cut off", color: C.red, bg: C.rSoft, dy: -34 }); }
      } else if (S.key === "ring") {
        o.hi = ["p1", "p4"];
        if (!S.fault) { o.tokens.push({ path: ["p1", "p2", "p3", "p4"], k: t, label: "data" }); if (t > 0.3 && t < 0.75) o.labels.push({ at: t < 0.55 ? "p2" : "p3", text: "repeat ↻", color: C.blue, bg: C.bSoft, dy: -36 }); }
        else { o.broken = [["p2", "p3"]]; o.tokens.push({ path: ["p1", "p2"], k: seg(t, 0, 0.5), label: "data" }); if (t > 0.5) o.labels.push({ at: "p2", text: "cannot pass ✕", color: C.red, bg: C.rSoft, dy: -36 }); }
      } else if (S.key === "mesh") {
        o.hi = ["p1", "p3"];
        if (!S.fault) o.tokens.push({ path: ["p1", "p3"], k: t, label: "data" });
        else { o.broken = [["p1", "p3"]]; o.tokens.push({ path: ["p1", "p2", "p3"], k: t, label: "rerouted", color: C.primary }); }
      } else if (S.key === "tree") {
        o.hi = ["p1", "p5"]; o.tokens.push({ path: ["p1", "h1", "r", "h2", "p5"], k: t, label: "data" });
      } else {
        o.hi = ["p1", "r3"]; o.tokens.push({ path: ["p1", "s", "r1", "r2", "r3"], k: t, label: "data" });
        if (st.W > 420) { txt(ctx, "Star part", st.W * 0.22, 282, { color: C.soft, size: 11 }); txt(ctx, "Ring part", st.W * 0.74, 282, { color: C.soft, size: 11 }); }
      }
      drawGraph(ctx, g, o);
    }
  }));

  /* ---------- v-devices ---------- */
  R("v-devices", "viz", "Networking · Devices", "What Each Network Device Does", "Repeater, hub, bridge, switch, router and gateway — how each one handles traffic.", env => K.timeline(env, {
    height: 300,
    stages: [
      { title: "Repeater (physical layer)", text: "A signal weakens and picks up noise over a long cable. A <b>repeater</b> receives it and <b>regenerates</b> a clean, full-strength copy. It does not read addresses — it works on bits only (layer 1).", dur: 4 },
      { title: "Hub (physical layer)", text: "A <b>hub</b> is a multiport repeater. A frame from A to C is copied out of <b>every</b> port; B and D discard it. All ports share one collision domain and one bandwidth.", dur: 4 },
      { title: "Bridge (data link layer)", text: "A <b>bridge</b> joins two segments and reads MAC addresses. A frame from A to B stays on its own segment (<b>filtered</b>); a frame from A to D is <b>forwarded</b> across. Each segment is a separate collision domain.", dur: 5 },
      { title: "Switch (data link layer)", text: "A <b>switch</b> is a multiport bridge. It looks up the destination MAC in its MAC table and sends the frame <b>only</b> out of C's port. Every port is its own collision domain.", dur: 4 },
      { title: "Router (network layer)", text: "A <b>router</b> connects different networks. It reads the destination <b>IP address</b> (10.0.0.5), looks it up in its routing table and forwards the packet out of the interface toward 10.0.0.0/24. Routers also separate broadcast domains.", dur: 4.5 },
      { title: "Gateway (up to the application layer)", text: "A <b>gateway</b> connects networks that use <b>different protocols</b> and translates between them. Here a VoIP gateway turns IP voice packets (RTP) into a circuit-switched telephone call. (In IP settings, “default gateway” simply means the local router.)", dur: 4.5 },
      { title: "Summary by layer", text: '<div class="table-wrap" style="margin:6px 0 0"><table><thead><tr><th>Device</th><th>Layer</th><th>Decides using</th><th>Sends to</th></tr></thead><tbody><tr><td>Repeater</td><td>1</td><td>— (signal only)</td><td>the other side</td></tr><tr><td>Hub</td><td>1</td><td>—</td><td>all ports</td></tr><tr><td>Bridge</td><td>2</td><td>MAC address</td><td>other segment, or nowhere</td></tr><tr><td>Switch</td><td>2</td><td>MAC table</td><td>one port</td></tr><tr><td>Router</td><td>3</td><td>IP address + routing table</td><td>best next hop</td></tr><tr><td>Gateway</td><td>up to 7</td><td>protocol conversion</td><td>a different kind of network</td></tr></tbody></table></div>' }
    ],
    draw(ctx, st) {
      const { W, i, t } = st;
      if (i === 0) {
        const y = 150, xa = W * 0.08, xr = W * 0.5, xb = W * 0.92, bw = Math.min(110, W * 0.26);
        shape(ctx, "pc", xa, y, { label: "A" }); shape(ctx, "pc", xb, y, { label: "B" });
        line(ctx, xa + 24, y, xr - bw / 2, y, "#b8c2cc", 2.5); line(ctx, xr + bw / 2, y, xb - 24, y, "#b8c2cc", 2.5);
        shape(ctx, "box", xr, y, { w: bw, h: 38, label: "Repeater", fill: C.bSoft, stroke: C.blue });
        const r = L.rng(4), rev = Math.min(1, t * 1.15), x1 = xa + 26, x2 = xr - bw / 2 - 6, x3 = xr + bw / 2 + 6, x4 = xb - 26;
        ctx.beginPath(); ctx.strokeStyle = C.amber; ctx.lineWidth = 2;
        for (let x = x1, first = true; x <= x2; x += 2) { const k = (x - x1) / (x2 - x1); if (k > rev * 2) break; const yy = y - 64 + Math.sin((x - x1) / 5) * 18 * (1 - 0.75 * k) + L.gauss(r) * 5 * k; if (first) { ctx.moveTo(x, yy); first = false; } else ctx.lineTo(x, yy); }
        ctx.stroke();
        if (rev > 0.5) {
          ctx.beginPath(); ctx.strokeStyle = C.primary;
          for (let x = x3, first = true; x <= x4; x += 2) { const k = (x - x3) / (x4 - x3); if (k > (rev - 0.5) * 2) break; const yy = y - 64 + Math.sin((x - x3) / 5) * 18; if (first) { ctx.moveTo(x, yy); first = false; } else ctx.lineTo(x, yy); }
          ctx.stroke();
        }
        txt(ctx, "weak + noisy", (x1 + x2) / 2, y + 50, { size: 11, color: C.amber }); txt(ctx, "regenerated", (x3 + x4) / 2, y + 50, { size: 11, color: C.primary });
        return;
      }
      if (i === 1 || i === 3) {
        const g = { N: { c: { x: W / 2, y: 150, t: i === 1 ? "box" : "switch", l: i === 1 ? "Hub" : "", w: 70, h: 34 }, a: { x: W * 0.14, y: 56, t: "pc", l: "A" }, b: { x: W * 0.86, y: 56, t: "pc", l: "B" }, cc: { x: W * 0.86, y: 232, t: "pc", l: "C" }, d: { x: W * 0.14, y: 232, t: "pc", l: "D" } }, E: [["c", "a"], ["c", "b"], ["c", "cc"], ["c", "d"]] };
        const o = { tokens: [{ path: ["a", "c"], k: seg(t, 0, 0.45), label: "to C", vanish: true }], labels: [], hi: ["a", "cc"] };
        if (t > 0.45) {
          if (i === 1) { ["b", "cc", "d"].forEach(n => o.tokens.push({ path: ["c", n], k: seg(t, 0.45, 0.9), label: "copy", color: n === "cc" ? C.amber : C.faint })); if (t > 0.9) o.labels.push({ at: "b", text: "discard", color: C.soft, bg: "#fff", dy: 52 }, { at: "d", text: "discard", color: C.soft, bg: "#fff", dy: -36 }); }
          else o.tokens.push({ path: ["c", "cc"], k: seg(t, 0.45, 0.9), label: "to C" });
        }
        if (t > 0.9) o.labels.push({ at: "cc", text: "accept ✓", color: C.primary, bg: C.pSoft, dy: -36 });
        drawGraph(ctx, g, o);
        if (i === 3) { txt(ctx, "Switch", W / 2, 180, { weight: "600", size: 12.5 }); if (t > 0.3) label(ctx, "MAC table: C → port 3", W / 2, 206, { size: 11, color: C.primary, border: C.primary, bg: C.pSoft }); }
        return;
      }
      if (i === 2) {
        const y = 150, bw = Math.min(90, W * 0.22);
        const g = { N: { la: { x: W * 0.04, y, t: "term" }, ta: { x: W * 0.14, y, t: "tap" }, a: { x: W * 0.14, y: 62, t: "pc", l: "A" }, tb: { x: W * 0.32, y, t: "tap" }, b: { x: W * 0.32, y: 232, t: "pc", l: "B" }, br: { x: W * 0.5, y, t: "box", l: "Bridge", w: bw, h: 34 }, td: { x: W * 0.7, y, t: "tap" }, d: { x: W * 0.7, y: 62, t: "pc", l: "D" }, te: { x: W * 0.87, y, t: "tap" }, e: { x: W * 0.87, y: 232, t: "pc", l: "E" }, rb: { x: W * 0.96, y, t: "term" } },
          E: [["la", "ta", { bb: true }], ["ta", "tb", { bb: true }], ["tb", "br", { bb: true }], ["br", "td", { bb: true }], ["td", "te", { bb: true }], ["te", "rb", { bb: true }], ["a", "ta"], ["b", "tb"], ["d", "td"], ["e", "te"]] };
        const o = { tokens: [], labels: [] };
        if (t < 0.5) { o.hi = ["a", "b"]; o.tokens.push({ path: ["a", "ta", "tb", "b"], k: seg(t, 0, 0.35), label: "A→B" }); if (t > 0.2) o.labels.push({ at: "br", text: "same side: filter", color: C.red, bg: C.rSoft, dy: -34 }); }
        else { o.hi = ["a", "d"]; o.tokens.push({ path: ["a", "ta", "tb", "br", "td", "d"], k: seg(t, 0.5, 0.95), label: "A→D" }); if (t > 0.62) o.labels.push({ at: "br", text: "other side: forward", color: C.primary, bg: C.pSoft, dy: -34 }); }
        drawGraph(ctx, g, o);
        if (W > 420) { txt(ctx, "Segment 1", W * 0.22, 288, { size: 11, color: C.soft }); txt(ctx, "Segment 2", W * 0.79, 288, { size: 11, color: C.soft }); }
        return;
      }
      if (i === 4) {
        const g = { N: { a: { x: W * 0.08, y: 70, t: "pc", l: W > 480 ? "192.168.1.10" : ".1.10" }, s1: { x: W * 0.25, y: 150, t: "switch" }, r: { x: W * 0.5, y: 150, t: "router", l: "Router" }, s2: { x: W * 0.75, y: 150, t: "switch" }, b: { x: W * 0.92, y: 70, t: "pc", l: W > 480 ? "10.0.0.5" : ".0.5" }, c: { x: W * 0.92, y: 232, t: "pc", l: W > 480 ? "10.0.0.9" : ".0.9" } }, E: [["a", "s1"], ["s1", "r"], ["r", "s2"], ["s2", "b"], ["s2", "c"]] };
        drawGraph(ctx, g, { hi: ["a", "b"], tokens: [{ path: ["a", "s1", "r", "s2", "b"], k: t, label: "dst 10.0.0.5" }] });
        if (t > 0.35) label(ctx, "10.0.0.0/24 → G0/1", W / 2, 212, { size: 11, color: C.blue, border: C.blue, bg: C.bSoft });
        if (W > 480) { txt(ctx, "Network 192.168.1.0/24", W * 0.2, 286, { size: 11, color: C.soft }); txt(ctx, "Network 10.0.0.0/24", W * 0.8, 286, { size: 11, color: C.soft }); }
        return;
      }
      if (i === 5) {
        const g = { N: { a: { x: W * 0.1, y: 130, t: "phone", l: "IP phone" }, s: { x: W * 0.3, y: 130, t: "switch" }, gw: { x: W * 0.54, y: 130, t: "box", l: "Gateway", w: Math.min(100, W * 0.25), h: 40, sub: "VoIP ↔ PSTN" }, co: { x: W * 0.76, y: 130, t: "office", l: W > 480 ? "Exchange" : "" }, ph: { x: W * 0.88, y: 226, t: "phone", l: "Phone" } }, E: [["a", "s"], ["s", "gw"], ["gw", "co"], ["co", "ph"]] };
        drawGraph(ctx, g, { hi: ["gw"], tokens: [{ path: ["a", "s", "gw"], k: seg(t, 0, 0.5), label: "RTP packets", vanish: true }, { path: ["gw", "co", "ph"], k: t > 0.5 ? seg(t, 0.5, 1) : -1, label: "voice call", color: C.violet }] });
        if (W > 480) { txt(ctx, "IP network (packet-switched)", W * 0.2, 284, { size: 11, color: C.soft }); txt(ctx, "Telephone network (circuit-switched)", W * 0.72, 284, { size: 11, color: C.soft }); }
        return;
      }
      const names = ["7 Application", "6 Presentation", "5 Session", "4 Transport", "3 Network", "2 Data link", "1 Physical"];
      const w = Math.min(W - 20, 600), x0 = (W - w) / 2, h = 34;
      names.forEach((n, k) => {
        const y = 14 + k * (h + 5);
        rr(ctx, x0, y, w, h, 5); ctx.fillStyle = k <= 3 ? C.vSoft : k === 4 ? C.bSoft : k === 5 ? C.pSoft : C.aSoft; ctx.fill();
        txt(ctx, n, x0 + 10, y + h / 2, { align: "left", weight: "600", size: 12 });
      });
      [["Gateway (4–7)", 14 + 1.5 * (h + 5) + h / 2], ["Router", 14 + 4 * (h + 5) + h / 2], ["Bridge · Switch", 14 + 5 * (h + 5) + h / 2], ["Repeater · Hub", 14 + 6 * (h + 5) + h / 2]].forEach(([d, y]) => txt(ctx, d, x0 + w - 10, y, { align: "right", size: 12, weight: "700", color: C.nav }));
    }
  }));

  /* ---------- v-tcpipmap ---------- */
  const OSI7 = ["Application", "Presentation", "Session", "Transport", "Network", "Data link", "Physical"];
  const TCPIP = [
    { name: "Application", rows: [0, 2], pdu: "data / message", protos: "HTTP · HTTPS · DNS · SMTP · FTP · DHCP · SSH", col: C.vSoft },
    { name: "Transport", rows: [3, 3], pdu: "segment (TCP) / datagram (UDP)", protos: "TCP · UDP · port numbers", col: C.bSoft },
    { name: "Internet", rows: [4, 4], pdu: "packet", protos: "IPv4 · IPv6 · ICMP · routing", col: C.pSoft },
    { name: "Network access (link)", rows: [5, 6], pdu: "frame → bits", protos: "Ethernet · Wi-Fi · ARP · MAC addresses", col: C.aSoft }
  ];
  R("v-tcpipmap", "viz", "Networking · Models", "OSI vs TCP/IP Layers", "See how the seven OSI layers map onto the four TCP/IP layers, with the protocols and data units at each.", env => K.timeline(env, {
    height: 330,
    stages: [
      { title: "Two models, same job", text: "The <b>OSI model</b> (7 layers) is a reference model used for teaching and troubleshooting. The <b>TCP/IP model</b> (4 layers) describes the protocols the Internet actually runs." },
      { title: "Application layer", text: "TCP/IP merges OSI's application, presentation and session layers into one <b>application layer</b>. Programs use protocols such as HTTP, DNS and SMTP; formatting, encryption (TLS) and sessions are handled by the application itself." },
      { title: "Transport layer", text: "Same as OSI layer 4. <b>TCP</b> gives reliable, ordered delivery (segments, acknowledgements, retransmission); <b>UDP</b> sends independent datagrams with no guarantees. <b>Port numbers</b> identify the application." },
      { title: "Internet layer", text: "Matches OSI layer 3. <b>IP</b> adds source and destination IP addresses and routers forward the <b>packet</b> hop by hop. ICMP reports errors (ping, traceroute)." },
      { title: "Network access (link) layer", text: "Covers OSI layers 2 and 1. Ethernet or Wi-Fi puts the packet into a <b>frame</b> with MAC addresses and an error check (FCS), then sends it as <b>bits</b> on the medium. ARP finds the MAC address for an IP address." },
      { title: "The five-layer view", text: "Many textbooks use a <b>hybrid five-layer model</b> (application, transport, network, data link, physical) — TCP/IP with the link layer split back into data link and physical. Same protocols, different grouping." }
    ],
    draw(ctx, st) {
      const { W, i } = st, rowH = 40, y0 = 14, gap = 3;
      const lx0 = 8, lx1 = W * (W < 560 ? 0.42 : 0.36), rx0 = W * (W < 560 ? 0.5 : 0.44), rx1 = W - 8;
      txt(ctx, "OSI", (lx0 + lx1) / 2, 7, { weight: "700", size: 11, color: C.soft });
      OSI7.forEach((n, k) => {
        const y = y0 + k * (rowH + gap), owner = TCPIP.findIndex(L4 => k >= L4.rows[0] && k <= L4.rows[1]);
        const on = i === 0 || owner === i - 1 || (i === 5);
        ctx.globalAlpha = on ? 1 : 0.35;
        rr(ctx, lx0, y, lx1 - lx0, rowH, 5); ctx.fillStyle = TCPIP[owner].col; ctx.fill(); ctx.strokeStyle = "#d5dbe1"; ctx.lineWidth = 1; ctx.stroke();
        txt(ctx, (7 - k) + "  " + n, lx0 + 8, y + rowH / 2, { align: "left", weight: "600", size: W < 400 ? 11 : 12.5 });
        ctx.globalAlpha = 1;
      });
      TCPIP.forEach((L4, k) => {
        const on = i === 0 || i === k + 1 || i === 5;
        const ya = y0 + L4.rows[0] * (rowH + gap), yb = y0 + L4.rows[1] * (rowH + gap) + rowH;
        ctx.globalAlpha = on ? 1 : 0.35;
        if (i === 5 && k === 3) {
          [[5, "Data link", "frame · Ethernet/Wi-Fi MAC"], [6, "Physical", "bits · cable, fibre, radio"]].forEach(([r, n, s]) => {
            const y = y0 + r * (rowH + gap);
            rr(ctx, rx0, y, rx1 - rx0, rowH, 5); ctx.fillStyle = L4.col; ctx.fill(); ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.stroke();
            txt(ctx, n, rx0 + 10, y + 13, { align: "left", weight: "700", size: 12 });
            if (W >= 420) txt(ctx, s, rx0 + 10, y + 29, { align: "left", size: 10.5, color: C.soft });
          });
        } else {
          rr(ctx, rx0, ya, rx1 - rx0, yb - ya, 6); ctx.fillStyle = L4.col; ctx.fill(); ctx.strokeStyle = i === k + 1 ? C.blue : "#c5ccd5"; ctx.lineWidth = i === k + 1 ? 2.5 : 1; ctx.stroke();
          txt(ctx, (4 - k) + "  " + L4.name, rx0 + 10, ya + 13, { align: "left", weight: "700", size: 12.5 });
          if (yb - ya > 60 || W >= 560) {
            txt(ctx, "PDU: " + L4.pdu, rx0 + 10, ya + 30, { align: "left", size: 10.5, color: C.soft });
            if (yb - ya > 60) wrapText(ctx, L4.protos, rx0 + 10, ya + 42, rx1 - rx0 - 18, 14, { size: 11, color: C.nav });
            else if (W >= 700) txt(ctx, L4.protos, rx1 - 10, ya + 13, { align: "right", size: 11, color: C.nav });
          }
        }
        ctx.globalAlpha = 1;
        if (on && i !== 0 && i !== 5) { const ym = (ya + yb) / 2; K.arrowHead(ctx, lx1 + 2, ym, rx0 - 2, ym, C.blue, 9); line(ctx, lx1 + 2, ym, rx0 - 10, ym, C.blue, 2); }
      });
      txt(ctx, "TCP/IP", (rx0 + rx1) / 2, 7, { weight: "700", size: 11, color: C.soft });
    }
  }));

  /* ---------- v-switching ---------- */
  R("v-switching", "viz", "Networking · Switching", "Circuit, Message and Packet Switching", "Send the same message across three links with each switching method and compare the timing.", env => K.timeline(env, {
    height: 260,
    stages: [
      { title: "Circuit switching: set-up", text: "Before any data moves, a <b>set-up</b> request reserves a dedicated path (circuit) through every switch, and a confirmation comes back. Telephone networks work this way.", dur: 4 },
      { title: "Circuit switching: data transfer", text: "Data flows <b>continuously</b> along the reserved path at a fixed rate — no addresses per packet, no waiting at switches. The bandwidth stays reserved even when the line is silent.", dur: 4 },
      { title: "Circuit switching: tear-down", text: "When the call ends, a release signal frees the resources at each switch so other users can have them.", dur: 3 },
      { title: "Message switching (store-and-forward)", text: "The <b>whole message</b> is sent as one unit. Each switch must <b>receive and store</b> the complete message before forwarding it to the next hop. No set-up, but large delays and big buffers.", dur: 5.5 },
      { title: "Packet switching (datagram)", text: "The message is split into <b>packets</b>, each carrying its own header. While packet 1 crosses link 2, packet 2 is already crossing link 1 — the links work in parallel (<b>pipelining</b>). Datagram packets may even take different routes.", dur: 5.5 },
      { title: "Timing compared", text: "With 3 links, a message taking 3 time units per link and a set-up of 3 units: message switching needs 3 × 3 = <b>9</b> units; packet switching with 3 packets needs (3 + 3 − 1) × 1 = <b>5</b>; circuit switching needs 3 set-up + 3 transfer = <b>6</b>. Propagation and queuing are ignored in this simple model." }
    ],
    draw(ctx, st) {
      const { W, i, t } = st, y = 120;
      if (i === 5) {
        const rows = [["Circuit", [[0, 3, C.faint, "set-up"], [3, 6, C.primary, "data"]]], ["Message", [[0, 3, C.amber, "link 1"], [3, 6, C.amber, "link 2"], [6, 9, C.amber, "link 3"]]], ["Packet", [[0, 1, C.blue, ""], [1, 2, C.blue, ""], [2, 3, C.blue, ""], [3, 4, C.blue, ""], [4, 5, C.blue, ""]]]];
        const x0 = W < 480 ? 74 : 110, x1 = W - 20, unit = (x1 - x0) / 9;
        rows.forEach(([n, bars], k) => {
          const yy = 40 + k * 62; txt(ctx, n, 10, yy, { align: "left", weight: "700", size: 12.5 });
          bars.forEach(([a, b, col, lab]) => { rr(ctx, x0 + a * unit + 1, yy - 15, (b - a) * unit - 2, 30, 4); ctx.fillStyle = col; ctx.fill(); if (lab && (b - a) * unit > 40) txt(ctx, lab, x0 + (a + b) / 2 * unit, yy, { size: 11, color: "#fff", weight: "600" }); });
          txt(ctx, (bars[bars.length - 1][1]) + " units", x0 + bars[bars.length - 1][1] * unit + 6, yy + 24, { align: "left", size: 11, color: C.soft });
        });
        for (let u = 0; u <= 9; u++) { line(ctx, x0 + u * unit, 214, x0 + u * unit, 220, C.faint, 1); txt(ctx, String(u), x0 + u * unit, 232, { size: 10, color: C.faint }); }
        txt(ctx, "time units", (x0 + x1) / 2, 250, { size: 10.5, color: C.faint });
        return;
      }
      const xs = [0.07, 0.36, 0.64, 0.93].map(f => f * W), names = ["A", "S1", "S2", "B"];
      const linkCol = k => {
        if (i === 0) return t > (k + 1) / 6 ? C.primary : "#b8c2cc";
        if (i === 1) return C.primary;
        if (i === 2) return t > (k + 1) / 3.3 ? "#b8c2cc" : C.primary;
        return "#b8c2cc";
      };
      for (let k = 0; k < 3; k++) line(ctx, xs[k], y, xs[k + 1], y, linkCol(k), i <= 2 && linkCol(k) === C.primary ? 5 : 3);
      names.forEach((n, k) => shape(ctx, k === 0 || k === 3 ? "pc" : "router", xs[k], y, { label: k === 0 || k === 3 ? n : n }));
      for (let k = 0; k < 3; k++) txt(ctx, "link " + (k + 1), (xs[k] + xs[k + 1]) / 2, y + 26, { size: 10.5, color: C.faint });
      const at = f => { f = clamp(f, 0, 1); const k = Math.min(2, Math.floor(f * 3)), r = f * 3 - k; return xs[k] + (xs[k + 1] - xs[k]) * Math.min(1, r); };
      if (i === 0) {
        if (t < 0.5) label(ctx, "set-up", at(t * 2), y - 26, { bg: C.faint, border: C.faint, color: "#fff", size: 11 });
        else label(ctx, "confirm", at(1 - (t - 0.5) * 2), y - 26, { bg: C.primary, border: C.primary, color: "#fff", size: 11 });
      } else if (i === 1) {
        for (let d = 0; d < 14; d++) { const f = ((st.time * 0.25) + d / 14) % 1; ctx.beginPath(); ctx.arc(xs[0] + (xs[3] - xs[0]) * f, y, 4, 0, 7); ctx.fillStyle = C.primary; ctx.fill(); }
        label(ctx, "dedicated circuit", W / 2, y - 30, { size: 11, color: C.primary, border: C.primary, bg: C.pSoft });
      } else if (i === 2) {
        label(ctx, "release", at(Math.min(1, t * 1.1)), y - 26, { bg: C.soft, border: C.soft, color: "#fff", size: 11 });
      } else if (i === 3) {
        const slot = clamp(Math.floor(t * 3), 0, 2), r = Math.max(0, t * 3 - slot), move = Math.min(1, r / 0.65);
        const x = xs[slot] + (xs[slot + 1] - xs[slot]) * move;
        label(ctx, "WHOLE MESSAGE", x, y - 30, { bg: C.amber, border: C.amber, color: "#fff", size: 11 });
        if (r > 0.65 && slot < 2) label(ctx, "storing… then forwarding", xs[slot + 1], y + 52, { size: 10.5, color: C.amber, border: C.amber, bg: C.aSoft });
      } else if (i === 4) {
        const T = t * 5;
        for (let j = 0; j < 3; j++) {
          const p = T - j; let x;
          if (p <= 0) x = xs[0]; else if (p >= 3) x = xs[3]; else { const k = Math.floor(p); x = xs[k] + (xs[k + 1] - xs[k]) * (p - k); }
          label(ctx, "P" + (j + 1), x, y - 28 - (p <= 0 || p >= 3 ? j * 22 : 0), { bg: C.blue, border: C.blue, color: "#fff", size: 11 });
        }
        txt(ctx, "time unit " + Math.min(5, Math.ceil(T)) + " of 5", W / 2, 220, { size: 12, color: C.blue, weight: "600" });
      }
    }
  }));

  /* ---------- v-crc : long division with SimLogic.crcMod2 ---------- */
  function mod2Remainder(bits, gen) { // receiver-side division (no zeros appended)
    const g = gen.split("").map(Number), a = bits.split("").map(Number);
    for (let i = 0; i <= a.length - g.length; i++) if (a[i]) for (let j = 0; j < g.length; j++) a[i + j] ^= g[j];
    return a.slice(-(g.length - 1)).join("");
  }
  function crcStates(data, gen) { // working dividend before each XOR step (mirrors crcMod2)
    const g = gen.split("").map(Number), a = (data + "0".repeat(g.length - 1)).split("").map(Number), states = [];
    for (let i = 0; i <= a.length - g.length; i++) if (a[i]) { states.push({ at: i, row: a.join("") }); for (let j = 0; j < g.length; j++) a[i + j] ^= g[j]; }
    states.push({ at: -1, row: a.join("") });
    return states;
  }
  R("v-crc", "viz", "Networking · Error Detection", "CRC Step by Step", "Watch the sender divide data by a generator using modulo-2 (XOR) division, append the remainder, and the receiver check it.", env => {
    const data = env.params.data || "1101011011", gen = env.params.gen || "10011", r = gen.length - 1;
    const res = L.crcMod2(data, gen), states = crcStates(data, gen), code = data + res.remainder;
    const flipped = code.split("").map((b, k) => k === 3 ? (b === "1" ? "0" : "1") : b).join("");
    return K.timeline(env, {
      height: 300,
      stages: [
        { title: "Agree on a generator", text: "Sender and receiver agree on a generator polynomial. Here G(x) = x⁴ + x + 1 → <code>" + gen + "</code> (degree r = " + r + "). The data is <code>" + data + "</code>." },
        { title: "Append r zeros", text: "The sender appends <b>" + r + " zeros</b> to the data, making room for the check bits: <code>" + data + "0".repeat(r) + "</code>." },
        { title: "Modulo-2 division", text: "Whenever the leading bit of the working value is 1, XOR the generator underneath it (modulo-2 subtraction — no borrows). Skip positions where the leading bit is 0. This takes " + res.steps.length + " XOR steps here.", dur: Math.max(4, res.steps.length * 1.4) },
        { title: "The remainder is the CRC", text: "The last " + r + " bits left over are the remainder: <code>" + res.remainder + "</code>. The sender replaces the appended zeros with it and transmits <code>" + code + "</code>." },
        { title: "Receiver check: no error", text: "The receiver divides the whole received codeword by the same generator. Remainder <code>" + mod2Remainder(code, gen) + "</code> = all zeros → accept the frame." },
        { title: "Receiver check: bit error", text: "Noise flipped bit 4. The receiver's remainder is <code>" + mod2Remainder(flipped, gen) + "</code> — not zero → the error is <b>detected</b> and the frame is discarded (or a retransmission requested). A CRC with r check bits detects all burst errors of length ≤ r." }
      ],
      draw(ctx, st) {
        const { W, i, t } = st, n = data.length + r, cw = Math.min(26, (W - 30) / (n + 1)), x0 = (W - cw * n) / 2;
        const row = (bits, y, o) => { o = o || {}; for (let k = 0; k < bits.length; k++) { const x = x0 + (k + (o.off || 0)) * cw; const ch = bits[k]; if (ch === " ") continue; if (o.hiFrom !== undefined && k >= o.hiFrom && k < o.hiTo) { rr(ctx, x + 1, y - cw / 2 + 1, cw - 2, cw - 2, 3); ctx.fillStyle = o.hiCol || C.bSoft; ctx.fill(); } txt(ctx, ch, x + cw / 2, y, { mono: true, size: Math.min(16, cw * 0.72), weight: "700", color: (o.colFn && o.colFn(k)) || o.color || C.ink }); } };
        const tag = (s, y) => { if (W >= 500) txt(ctx, s, 10, y, { align: "left", size: 11, color: C.soft }); };
        if (i === 0) { tag("data", 80); row(data, 80); tag("generator", 140); row(gen, 140, { color: C.blue }); return; }
        if (i === 1) { tag("dividend", 80); row(data + "0".repeat(r), 80, { colFn: k => k >= data.length ? C.amber : null }); txt(ctx, r + " zeros appended", x0 + (data.length + r / 2) * cw, 110, { size: 11, color: C.amber }); return; }
        if (i === 2) {
          const k = clamp(Math.floor(t * (states.length - 1)), 0, states.length - 2), s = states[k], nx = states[k + 1];
          tag("working value", 60); row(s.row, 60, { hiFrom: s.at, hiTo: s.at + gen.length });
          tag("XOR generator", 100); row(" ".repeat(s.at) + gen, 100, { color: C.blue });
          line(ctx, x0 + s.at * cw, 118, x0 + (s.at + gen.length) * cw, 118, C.nav, 1.5);
          tag("result", 140); row(nx.row, 140, { hiFrom: s.at, hiTo: s.at + gen.length, hiCol: C.pSoft });
          txt(ctx, "XOR step " + (k + 1) + " of " + (states.length - 1) + "  (position " + (s.at + 1) + ")", W / 2, 186, { size: 12, weight: "600", color: C.blue });
          txt(ctx, "0⊕0 = 0   0⊕1 = 1   1⊕0 = 1   1⊕1 = 0", W / 2, 214, { size: 11.5, color: C.soft });
          return;
        }
        if (i === 3) { tag("final value", 70); row(states[states.length - 1].row, 70, { hiFrom: n - r, hiTo: n, hiCol: C.aSoft }); tag("transmitted", 140); row(code, 140, { colFn: k => k >= data.length ? C.amber : null }); txt(ctx, "data + CRC " + res.remainder, W / 2, 176, { size: 12, color: C.amber, weight: "600" }); return; }
        const rx = i === 4 ? code : flipped, rem = mod2Remainder(rx, gen), ok = /^0+$/.test(rem);
        tag("received", 70); row(rx, 70, { colFn: k => i === 5 && k === 3 ? C.red : null, hiFrom: i === 5 ? 3 : undefined, hiTo: 4, hiCol: C.rSoft });
        tag("÷ generator", 110); txt(ctx, "÷ " + gen + "  (mod 2)", W / 2, 110, { mono: true, size: 13, color: C.blue });
        label(ctx, "remainder " + rem + (ok ? "  → accept ✓" : "  → error detected ✕"), W / 2, 160, { size: 13, bg: ok ? C.pSoft : C.rSoft, border: ok ? C.primary : C.red, color: ok ? C.primary : C.red });
      }
    });
  }, { data: "1101011011", gen: "10011" });

  /* ---------- v-ipclass ---------- */
  const CLASSES = [
    { c: "A", from: 0, to: 127, lead: "0", net: 8, col: "#cfe3fa", eg: "10.4.20.7", nets: "2⁷ = 128 (126 usable: 0 and 127 are reserved)", hosts: "2²⁴ − 2 = 16,777,214", mask: "255.0.0.0 (/8)" },
    { c: "B", from: 128, to: 191, lead: "10", net: 16, col: "#cdeee0", eg: "172.16.5.20", nets: "2¹⁴ = 16,384", hosts: "2¹⁶ − 2 = 65,534", mask: "255.255.0.0 (/16)" },
    { c: "C", from: 192, to: 223, lead: "110", net: 24, col: "#fbe7b8", eg: "192.168.1.25", nets: "2²¹ = 2,097,152", hosts: "2⁸ − 2 = 254", mask: "255.255.255.0 (/24)" },
    { c: "D", from: 224, to: 239, lead: "1110", net: 0, col: "#e5dafb", eg: "224.0.0.5", nets: "Multicast groups (no network/host split)", hosts: "—", mask: "—" },
    { c: "E", from: 240, to: 255, lead: "1111", net: 0, col: "#f6d5d5", eg: "240.0.0.1", nets: "Reserved for experimental use", hosts: "—", mask: "—" }
  ];
  R("v-ipclass", "viz", "Networking · IP Addressing", "IPv4 Address Classes", "The first octet decides the class; see the network/host split, ranges and private blocks for classes A–E.", env => K.timeline(env, {
    height: 320,
    stages: CLASSES.map(c => ({ title: "Class " + c.c + ": " + c.from + "–" + c.to, text: "Leading bits <code>" + c.lead + "</code>. " + (c.net ? "The first " + c.net + " bits are the <b>network</b> part, the remaining " + (32 - c.net) + " bits the <b>host</b> part. Networks: " + c.nets + ". Hosts per network: " + c.hosts + " (all-zeros = network address, all-ones = broadcast)." : c.c === "D" ? "Class D addresses are for <b>multicast</b> — one sender to a group of receivers (e.g. 224.0.0.5 is used by OSPF routers)." : "Class E is <b>reserved</b> for experimental use and is not assigned to hosts."), dur: 4.5 })).concat([
      { title: "Private and special addresses", text: "Private ranges (RFC 1918) are used inside homes and companies and are not routed on the Internet: <b>10.0.0.0/8</b>, <b>172.16.0.0/12</b> (172.16–172.31) and <b>192.168.0.0/16</b>. Also special: <b>127.0.0.0/8</b> loopback, <b>169.254.0.0/16</b> link-local (APIPA).", dur: 5 },
      { title: "Classless addressing (CIDR)", text: "Since 1993 the Internet uses <b>CIDR</b>: the prefix length (/n) states the network part, so blocks no longer have to be /8, /16 or /24. Example: 172.16.0.0/20 has 2¹² − 2 = 4,094 hosts. Classes remain useful vocabulary." }
    ]),
    draw(ctx, st) {
      const { W, i } = st, x0 = 14, x1 = W - 14, ly = 46, sc = v => x0 + (x1 - x0) * v / 256;
      CLASSES.forEach((c, k) => {
        const on = i === k || i >= 5;
        rr(ctx, sc(c.from), ly - 16, sc(c.to + 1) - sc(c.from) - 1, 32, 3); ctx.fillStyle = c.col; ctx.globalAlpha = on ? 1 : 0.35; ctx.fill(); ctx.globalAlpha = 1;
        if (i === k) { ctx.strokeStyle = C.nav; ctx.lineWidth = 2; ctx.stroke(); }
        if (sc(c.to + 1) - sc(c.from) > 14) txt(ctx, c.c, (sc(c.from) + sc(c.to + 1)) / 2, ly, { weight: "700", size: 13 });
      });
      [0, 128, 192, 224, 240, 255].forEach((v, k) => txt(ctx, String(v), sc(v === 255 ? 256 : v), ly + 26 + (k >= 4 && W < 520 ? 12 : 0), { size: 10, color: C.soft }));
      txt(ctx, "first octet value", W / 2, ly - 28, { size: 10.5, color: C.faint });
      if (i < 5) {
        const c = CLASSES[i], by = 128, cw = (x1 - x0) / 32;
        const bin = c.eg.split(".").map(o => L.toBin(+o)).join("");
        for (let b = 0; b < 32; b++) {
          const isLead = b < c.lead.length, isNet = b < c.net;
          ctx.fillStyle = isLead ? C.nav : isNet ? C.bSoft : c.net ? C.pSoft : "#eef1f4"; ctx.fillRect(x0 + b * cw + 0.5, by - 14, cw - 1, 28);
          if (cw >= 13) txt(ctx, bin[b], x0 + (b + 0.5) * cw, by, { mono: true, size: 11, color: isLead ? "#fff" : C.ink });
          if (b % 8 === 0 && b) line(ctx, x0 + b * cw, by - 20, x0 + b * cw, by + 20, C.nav, 2);
        }
        txt(ctx, "Example " + c.eg, x0, by - 28, { align: "left", size: 12, weight: "600", mono: true });
        if (c.net) { txt(ctx, "network (" + c.net + " bits)", x0 + c.net * cw / 2, by + 30, { size: 11, color: C.blue }); txt(ctx, "host (" + (32 - c.net) + " bits)", x0 + (c.net + (32 - c.net) / 2) * cw, by + 30, { size: 11, color: C.primary }); }
        const rows = [["Default mask", c.mask], ["Networks", c.nets], ["Hosts / network", c.hosts]];
        rows.forEach(([a, b], k) => { txt(ctx, a, x0, 200 + k * 26, { align: "left", size: 12, weight: "700" }); wrapText(ctx, b, x0 + (W < 420 ? 108 : 130), 193 + k * 26, x1 - x0 - (W < 420 ? 108 : 130), 13, { size: 12, color: C.soft }); });
      } else if (i === 5) {
        [["10.0.0.0/8", 10, 11, C.primary], ["172.16.0.0/12", 172, 173, C.blue], ["192.168.0.0/16", 192, 193, C.violet], ["127.0.0.0/8 loopback", 127, 128, C.red]].forEach(([n, a, b, col], k) => {
          const xm = (sc(a) + sc(b)) / 2; line(ctx, xm, ly + 16, xm, 110 + k * 36, col, 1.5, [3, 3]);
          label(ctx, n, clamp(xm, 70, W - 80), 116 + k * 36, { size: 11.5, color: col, border: col });
        });
        txt(ctx, "Private addresses reach the Internet through NAT on the router.", W / 2, 284, { size: 11.5, color: C.soft });
      } else {
        const by = 140, cw = (x1 - x0) / 32;
        for (let b = 0; b < 32; b++) { ctx.fillStyle = b < 20 ? C.bSoft : C.pSoft; ctx.fillRect(x0 + b * cw + 0.5, by - 14, cw - 1, 28); if (b % 8 === 0 && b) line(ctx, x0 + b * cw, by - 20, x0 + b * cw, by + 20, C.nav, 2); }
        line(ctx, x0 + 20 * cw, by - 26, x0 + 20 * cw, by + 26, C.red, 2.5);
        txt(ctx, "172.16.0.0/20", x0, by - 32, { align: "left", mono: true, weight: "700", size: 12.5 });
        txt(ctx, "20 network bits", x0 + 10 * cw, by + 32, { size: 11, color: C.blue }); txt(ctx, "12 host bits", x0 + 26 * cw, by + 32, { size: 11, color: C.primary });
        txt(ctx, "The /20 boundary falls inside the third octet — impossible with classes.", W / 2, 230, { size: 11.5, color: C.soft });
      }
    }
  }));

  /* ---------- v-subnetting ---------- */
  R("v-subnetting", "viz", "Networking · IP Addressing", "Subnetting a /24 into Four /26s", "Borrow host bits, find each subnet's range, and use AND with the mask to see which subnet a host is in.", env => {
    const base = "192.168.10.", subs = [0, 64, 128, 192].map(v => L.subnet(base + v, 26)), host = 77;
    return K.timeline(env, {
      height: 300,
      stages: [
        { title: "Start: one /24 network", text: "192.168.10.0/24 has a mask of 255.255.255.0: 24 network bits and 8 host bits → 256 addresses, 254 usable hosts. Suppose we need four separate departments." },
        { title: "Borrow 2 host bits", text: "Borrowing <b>2 bits</b> from the host part gives a /26 mask: 255.255.255.<b>192</b> (11000000). 2² = <b>4 subnets</b>, each with 2⁶ = 64 addresses." },
        { title: "The four subnets", text: "Block size = 256 − 192 = <b>64</b>, so subnets start at .0, .64, .128 and .192. In each, the first address is the network ID and the last is the broadcast address." },
        { title: "Ranges of each subnet", text: subs.map(s => "<code>" + s.net + "/26</code>: hosts " + s.first + " – " + s.last + ", broadcast " + s.bc).join("<br>") },
        { title: "Which subnet is 192.168.10.77 in?", text: "AND the address with the mask bit by bit: 77 = 01001101, 192 = 11000000 → 01000000 = <b>64</b>. So the host belongs to <b>192.168.10.64/26</b>." },
        { title: "The formulas", text: "Subnets = 2<sup>borrowed bits</sup> = 4. Usable hosts per subnet = 2<sup>host bits</sup> − 2 = 2⁶ − 2 = <b>62</b>. The −2 removes the network and broadcast addresses." }
      ],
      draw(ctx, st) {
        const { W, i, t } = st, x0 = 14, x1 = W - 14, by = 60, bw = x1 - x0;
        const cols = [C.bSoft, C.pSoft, C.aSoft, C.vSoft];
        if (i === 0) { rr(ctx, x0, by - 18, bw, 36, 5); ctx.fillStyle = C.bSoft; ctx.fill(); txt(ctx, "192.168.10.0 – 192.168.10.255", W / 2, by, { mono: true, size: 12, weight: "600" }); }
        else {
          subs.forEach((s, k) => { if (i === 1 && k > 0 && t < 0.5) return; rr(ctx, x0 + k * bw / 4 + 1, by - 18, bw / 4 - 2, 36, 5); ctx.fillStyle = cols[k]; ctx.fill(); if (i === 4 && k === 1) { ctx.strokeStyle = C.red; ctx.lineWidth = 2.5; ctx.stroke(); } txt(ctx, "." + (k * 64), x0 + k * bw / 4 + 8, by, { align: "left", mono: true, size: 12, weight: "700" }); if (bw / 4 > 90) txt(ctx, "–." + (k * 64 + 63), x0 + (k + 1) * bw / 4 - 8, by, { align: "right", mono: true, size: 11, color: C.soft }); });
        }
        txt(ctx, "last octet of 192.168.10.x", W / 2, by + 30, { size: 10.5, color: C.faint });
        const cw = Math.min(24, (W - 40) / 9), mx = (W - cw * 8) / 2;
        const bits = (v, y, colFn, tagText) => { const b = L.toBin(v); for (let k = 0; k < 8; k++) { rr(ctx, mx + k * cw + 1, y - cw / 2, cw - 2, cw, 3); ctx.fillStyle = colFn(k); ctx.fill(); txt(ctx, b[k], mx + (k + 0.5) * cw, y, { mono: true, size: 13, weight: "700" }); } if (tagText) txt(ctx, tagText, mx - 8, y, { align: "right", size: 11, color: C.soft }); };
        if (i <= 1 || i === 5) {
          bits(i === 0 ? 0 : 192, 150, k => i === 0 ? "#eef1f4" : k < 2 ? C.aSoft : "#eef1f4", W > 420 ? "mask, 4th octet" : "");
          txt(ctx, i === 0 ? "255.255.255.0  (/24)" : "255.255.255.192  (/26)", W / 2, 186, { mono: true, size: 13, weight: "700", color: C.nav });
          if (i >= 1) { txt(ctx, "borrowed", mx + cw, 124, { size: 10.5, color: C.amber, weight: "700" }); txt(ctx, "host bits", mx + 5 * cw, 124, { size: 10.5, color: C.soft }); }
          if (i === 5) { label(ctx, "subnets = 2² = 4", W / 2, 226, { size: 12, color: C.amber, border: C.amber, bg: C.aSoft }); label(ctx, "hosts = 2⁶ − 2 = 62", W / 2, 262, { size: 12, color: C.primary, border: C.primary, bg: C.pSoft }); }
        } else if (i === 2) {
          subs.forEach((s, k) => { const x = x0 + (k + 0.5) * bw / 4; txt(ctx, "network", x, by + 56, { size: 10.5, color: C.blue }); txt(ctx, "." + (k * 64), x, by + 72, { mono: true, size: 12, weight: "700" }); txt(ctx, "broadcast", x, by + 100, { size: 10.5, color: C.red }); txt(ctx, "." + (k * 64 + 63), x, by + 116, { mono: true, size: 12, weight: "700" }); });
          txt(ctx, "block size = 256 − 192 = 64", W / 2, 236, { size: 12.5, weight: "600", color: C.nav });
        } else if (i === 3) {
          const fs = W < 460 ? 10.5 : 12;
          subs.forEach((s, k) => { const y = 120 + k * 36; rr(ctx, x0, y - 14, bw, 28, 5); ctx.fillStyle = cols[k]; ctx.fill(); txt(ctx, s.net + "/26", x0 + 8, y, { align: "left", mono: true, size: fs, weight: "700" }); txt(ctx, "." + s.first.split(".")[3] + "–." + s.last.split(".")[3] + "  bc ." + s.bc.split(".")[3], x1 - 8, y, { align: "right", mono: true, size: fs, color: C.soft }); });
        } else if (i === 4) {
          bits(host, 120, k => C.bSoft, "77"); bits(192, 156, k => k < 2 ? C.aSoft : "#eef1f4", "mask");
          line(ctx, mx, 174, mx + 8 * cw, 174, C.nav, 1.5);
          if (t > 0.3) bits(host & 192, 194, k => k < 2 ? C.pSoft : "#eef1f4", "AND");
          if (t > 0.5) txt(ctx, "= 64  →  192.168.10.64/26", W / 2, 236, { mono: true, size: 13, weight: "700", color: C.primary });
        }
      }
    });
  });

  /* ---------- v-arp ---------- */
  R("v-arp", "viz", "Networking · MAC & ARP", "ARP: Finding a MAC Address", "Host A knows C's IP address but needs its MAC address: broadcast request, unicast reply, cache.", env => K.flow(env, {
    height: 310,
    nodes: {
      a: { x: 0.1, y: 150, type: "pc", label: "A", sub: "192.168.1.10" }, sw: { x: 0.45, y: 150, type: "switch" },
      b: { x: 0.84, y: 46, type: "pc", label: "B", sub: ".1.20" }, c: { x: 0.9, y: 150, type: "pc", label: "C", sub: ".1.30" }, d: { x: 0.84, y: 250, type: "pc", label: "D", sub: ".1.40" },
      gw: { x: 0.45, y: 262, type: "router", label: "Gateway .1.1", hidden: true }
    },
    edges: [["a", "sw"], ["sw", "b"], ["sw", "c"], ["sw", "d"], ["sw", "gw"]],
    stages: [
      { title: "A knows the IP, not the MAC", text: "A wants to send to <b>192.168.1.30</b> on its own subnet. Ethernet frames need a destination <b>MAC address</b>, and A's ARP cache has no entry for .30.", hi: ["a"], labels: [{ at: "a", text: "ARP cache: empty", color: C.soft, bg: "#fff", dy: -44 }] },
      { title: "ARP request — broadcast", text: "A broadcasts an ARP request to <code>FF:FF:FF:FF:FF:FF</code>: “<b>Who has 192.168.1.30? Tell 192.168.1.10</b>”. The switch floods the broadcast out of every port.", hi: ["a"], edges: [["a", "sw"], ["sw", "b"], ["sw", "c"], ["sw", "d"]], move: [{ path: ["a", "sw"], label: "who has .30?", span: 0.4, vanish: true }, { path: ["sw", "b"], label: "broadcast", start: 0.4, color: C.faint }, { path: ["sw", "c"], label: "broadcast", start: 0.4 }, { path: ["sw", "d"], label: "broadcast", start: 0.4, color: C.faint }], dur: 4 },
      { title: "Only the owner answers", text: "B and D see that .30 is not their address and discard the request. C recognises its own IP and also stores A's IP→MAC mapping, since it will need it for the reply.", hi: ["c"], labels: [{ at: "b", text: "not mine", color: C.soft, bg: "#fff", dy: 40 }, { at: "d", text: "not mine", color: C.soft, bg: "#fff", dy: -38 }, { at: "c", text: "that's me", color: C.primary, bg: C.pSoft, dy: -44 }] },
      { title: "ARP reply — unicast", text: "C sends a <b>unicast</b> ARP reply directly to A: “<b>192.168.1.30 is at 0C:1A:2B:3C:4D:30</b>”.", hi: ["c", "a"], edges: [["c", "sw"], ["sw", "a"]], move: [{ path: ["c", "sw", "a"], label: "is at 0C:…:30", color: C.primary }] },
      { title: "Cache, then send", text: "A stores the mapping in its <b>ARP cache</b> (entries expire after a few minutes) and now sends the data frame with C's MAC as destination. Later frames skip the ARP step.", hi: ["a", "c"], edges: [["a", "sw"], ["sw", "c"]], move: [{ path: ["a", "sw", "c"], label: "data → 0C:…:30", color: C.blue }], labels: [{ at: "a", text: ".30 → 0C:…:30", color: C.primary, bg: C.pSoft, dy: -44 }] },
      { title: "Destination on another network", text: "For an address outside its subnet (e.g. 8.8.8.8), A does <b>not</b> ARP for that host. It ARPs for its <b>default gateway</b> (192.168.1.1) and sends the frame to the router's MAC; the IP packet still carries 8.8.8.8.", hi: ["a", "gw"], show: ["gw"], edges: [["a", "sw"], ["sw", "gw"]], move: [{ path: ["a", "sw", "gw"], label: "who has .1?", color: C.amber }] }
    ]
  }));

  /* ---------- v-hops : TTL decrement and MAC rewrite ---------- */
  const HOPS = [
    { l2: ["MAC A", "MAC R1-a"], ttl: 64, ck: "set by PC A" },
    { l2: ["MAC R1-b", "MAC R2-a"], ttl: 63, ck: "recomputed by R1" },
    { l2: ["MAC R2-b", "MAC Server"], ttl: 62, ck: "recomputed by R2" }
  ];
  R("v-hops", "viz", "Networking · Routing", "A Packet Hop by Hop", "Watch the Ethernet addresses change at every router while the IP addresses stay the same and TTL counts down.", env => K.flow(env, {
    height: 320,
    nodes: { a: { x: 0.09, y: 70, type: "pc", label: "PC A" }, r1: { x: 0.37, y: 70, type: "router", label: "R1" }, r2: { x: 0.64, y: 70, type: "router", label: "R2" }, b: { x: 0.91, y: 70, type: "server", label: "Server" } },
    edges: [["a", "r1", { label: "LAN 1", ly: 20 }], ["r1", "r2", { label: "link", ly: 20 }], ["r2", "b", { label: "LAN 2", ly: 20 }]],
    stages: [
      { title: "Hop 1: PC A → R1", text: "PC A's destination is on another network, so it sends the frame to its default gateway R1. Ethernet: <b>A → R1</b>. IP: <b>192.168.1.10 → 203.0.113.5</b>. TTL = 64.", hi: ["a"], edges: [["a", "r1"]], move: [{ path: ["a", "r1"], label: "packet" }], dur: 3.6 },
      { title: "Hop 2: R1 → R2", text: "R1 strips the old frame, looks up 203.0.113.5 in its routing table, <b>decrements TTL to 63</b>, recomputes the IP header checksum and builds a <b>new frame</b>: R1 → R2. The IP addresses do not change.", hi: ["r1"], edges: [["r1", "r2"]], move: [{ path: ["r1", "r2"], label: "packet" }], dur: 3.6 },
      { title: "Hop 3: R2 → Server", text: "R2 does the same: TTL 62, new Ethernet header R2 → Server. The server's network is directly connected, so this is the last hop.", hi: ["r2"], edges: [["r2", "b"]], move: [{ path: ["r2", "b"], label: "packet" }], dur: 3.6 },
      { title: "What changed, what didn't", text: "<b>MAC addresses</b> change at every hop — they only matter on one link. <b>IP addresses</b> stay the same end to end — they identify the original source and final destination. TTL went 64 → 62." },
      { title: "When TTL reaches zero", text: "If a packet arrives with TTL 1, the router decrements it to 0, <b>drops</b> the packet and returns an <b>ICMP Time Exceeded</b> message. This stops packets looping forever — and it is how <code>traceroute</code> discovers each router on a path.", hi: ["r2"], move: [{ path: ["a", "r1", "r2"], label: "TTL 2→1→0", span: 0.5, vanish: true }, { path: ["r2", "r1", "a"], label: "ICMP Time Exceeded", start: 0.5, color: C.red }], dur: 5 }
    ],
    extra(ctx, st) {
      const { W, i } = st, x = 10, w = W - 20, y = 140, fs = W < 460 ? 10.5 : 12;
      if (i <= 2) {
        const h = HOPS[i];
        rr(ctx, x, y, w, 158, 8); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
        txt(ctx, "Headers on hop " + (i + 1), x + 12, y + 18, { align: "left", weight: "700", size: 12.5 });
        const rows = [["Ethernet (rewritten each hop)", h.l2[0] + " → " + h.l2[1], C.blue], ["IP (unchanged)", "192.168.1.10 → 203.0.113.5", C.primary], ["TTL", String(h.ttl), C.amber], ["IP header checksum", h.ck, C.soft]];
        rows.forEach(([a, b, col], k) => { const yy = y + 46 + k * 28; txt(ctx, a, x + 12, yy, { align: "left", size: fs, color: C.soft }); txt(ctx, b, x + w - 12, yy + (W < 460 ? 13 : 0), { align: "right", size: fs + 0.5, weight: "700", mono: true, color: col }); });
      } else if (i === 3) {
        const cw = (w - 8) / 3;
        HOPS.forEach((h, k) => {
          const xx = x + k * (cw + 4);
          rr(ctx, xx, y, cw, 150, 6); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
          txt(ctx, "Hop " + (k + 1), xx + cw / 2, y + 16, { weight: "700", size: 12 });
          wrapText(ctx, h.l2[0] + " → " + h.l2[1], xx + 8, y + 32, cw - 16, 14, { size: 10.5, color: C.blue, weight: "600" });
          wrapText(ctx, ".1.10 → 203.0.113.5", xx + 8, y + 82, cw - 16, 14, { size: 10.5, color: C.primary, weight: "600" });
          txt(ctx, "TTL " + h.ttl, xx + cw / 2, y + 134, { size: 11.5, weight: "700", color: C.amber });
        });
      }
    }
  }));

  /* ---------- v-vlan ---------- */
  R("v-vlan", "viz", "Networking · VLANs", "VLANs and 802.1Q Trunks", "Two switches share a trunk; VLAN tags keep Sales and HR traffic apart until a router joins them.", env => K.flow(env, {
    height: 362,
    nodes: {
      s1: { x: 0.3, y: 130, type: "switch", label: "SW1" }, s2: { x: 0.7, y: 130, type: "switch", label: "SW2" },
      p1: { x: 0.08, y: 48, type: "pc", label: "PC1", sub: "VLAN 10", stroke: C.blue }, p2: { x: 0.08, y: 214, type: "pc", label: "PC2", sub: "VLAN 20", stroke: C.amber },
      p3: { x: 0.92, y: 48, type: "pc", label: "PC3", sub: "VLAN 10", stroke: C.blue }, p4: { x: 0.92, y: 214, type: "pc", label: "PC4", sub: "VLAN 20", stroke: C.amber },
      rt: { x: 0.5, y: 226, type: "router", label: "Router", hidden: true }
    },
    edges: [["s1", "p1", { color: C.blue }], ["s1", "p2", { color: C.amber }], ["s2", "p3", { color: C.blue }], ["s2", "p4", { color: C.amber }], ["s1", "s2", { label: "trunk (802.1Q)", ly: -18, w: 5, color: C.nav }], ["s1", "rt", { dash: [5, 4] }]],
    stages: [
      { title: "Access ports belong to one VLAN", text: "Each switch port connected to a PC is an <b>access port</b> assigned to one VLAN: VLAN 10 = Sales (blue), VLAN 20 = HR (amber). Ports in different VLANs behave as if they were on separate switches." },
      { title: "A VLAN 10 broadcast", text: "PC1 sends a broadcast. SW1 forwards it only to VLAN 10 ports — including the <b>trunk</b>, where it adds a tag <b>VID 10</b>. SW2 removes the tag and delivers it only to PC3. PC2 and PC4 never see it.", hi: ["p1", "p3"], edges: [["s1", "p1"], ["s1", "s2"], ["s2", "p3"]], move: [{ path: ["p1", "s1"], label: "untagged", span: 0.3, vanish: true }, { path: ["s1", "s2"], label: "tag VID 10", start: 0.3, span: 0.35, color: C.blue, vanish: true }, { path: ["s2", "p3"], label: "untagged", start: 0.65, span: 0.35 }], labels: [{ at: "p2", text: "not delivered", color: C.soft, bg: "#fff", dy: -36 }, { at: "p4", text: "not delivered", color: C.soft, bg: "#fff", dy: -36 }], dur: 4.5 },
      { title: "Inside the 802.1Q tag", text: "On a trunk, a 4-byte tag is inserted after the source MAC: <b>TPID 0x8100</b> (marks a tagged frame), <b>PCP</b> (3-bit priority), <b>DEI</b> (1 bit) and the <b>12-bit VLAN ID</b> (usable 1–4094). Frames of the <i>native VLAN</i> cross the trunk untagged.", dur: 4.5 },
      { title: "VLAN 20 traffic", text: "PC2 → PC4 crosses the same trunk with <b>VID 20</b>. One cable carries many VLANs, and the tag tells SW2 which VLAN each frame belongs to.", hi: ["p2", "p4"], edges: [["s1", "p2"], ["s1", "s2"], ["s2", "p4"]], move: [{ path: ["p2", "s1"], label: "untagged", span: 0.3, vanish: true }, { path: ["s1", "s2"], label: "tag VID 20", start: 0.3, span: 0.35, color: C.amber, vanish: true }, { path: ["s2", "p4"], label: "untagged", start: 0.65, span: 0.35 }], dur: 4 },
      { title: "Between VLANs you need routing", text: "PC1 (VLAN 10) cannot reach PC4 (VLAN 20) through the switches alone — they are separate broadcast domains and IP subnets. A <b>router</b> (here “router on a stick” on a trunk) or a layer-3 switch routes between them.", hi: ["p1", "p4", "rt"], show: ["rt"], edges: [["s1", "rt"]], move: [{ path: ["p1", "s1", "rt", "s1", "s2", "p4"], label: "routed", color: C.violet }], dur: 5 },
      { title: "Why use VLANs?", text: "Smaller <b>broadcast domains</b>, better <b>security</b> (HR traffic is isolated from Sales), and <b>flexibility</b>: moving a user to another department is a configuration change, not a re-cabling job.", hi: ["s1", "s2"] }
    ],
    extra(ctx, st) {
      if (st.i !== 2) return;
      const W = st.W, x = 10, w = W - 20, y = 282;
      const parts = [["Dst MAC", 6, "#eef1f4"], ["Src MAC", 6, "#eef1f4"], ["802.1Q tag", 4, C.bSoft], ["Type", 2, "#eef1f4"], ["Payload", 10, C.aSoft], ["FCS", 4, C.rSoft]];
      const tot = parts.reduce((s, p) => s + p[1], 0); let xx = x;
      parts.forEach(([n, b, col]) => { const pw = w * b / tot; rr(ctx, xx + 1, y, pw - 2, 30, 4); ctx.fillStyle = col; ctx.fill(); if (n === "802.1Q tag") { ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.stroke(); } txt(ctx, n, xx + pw / 2, y + 15, { size: W < 460 ? 9.5 : 11, weight: "600" }); xx += pw; });
      const tf = [["TPID 0x8100", 16], ["PCP", 3], ["DEI", 1], ["VID = 10", 12]], ty = y + 42; xx = x;
      tf.forEach(([n, b]) => { const pw = w * b / 32; rr(ctx, xx + 1, ty, pw - 2, 28, 4); ctx.fillStyle = C.bSoft; ctx.fill(); if (pw > 26) txt(ctx, n, xx + pw / 2, ty + 14, { size: W < 460 ? 9.5 : 11, weight: "600", color: C.blue }); xx += pw; });
    }
  }));

  /* ===================== SIMULATIONS ===================== */

  /* ---------- s-packet : Packet Formation Lab ---------- */
  (function injectPktCss() {
    if (typeof document === "undefined" || document.getElementById("pkt-css")) return;
    const st = document.createElement("style"); st.id = "pkt-css";
    st.textContent = ".pkt{padding:14px;background:#fff}.pkt-note{font-size:.84rem;margin:0 0 10px;padding:6px 10px;border-left:3px solid #b7791f;background:#fff6e0;color:#5f4511}" +
      ".pkt-steps{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 8px}.pkt-steps b{font-size:.92rem}" +
      ".pkt-layers{display:flex;gap:3px;margin:6px 0;min-height:34px}.pkt-blk{flex:1 1 0;min-width:44px;padding:6px 6px;border-radius:5px;font-size:.76rem;font-weight:600;text-align:center;border:1px solid transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".pkt-steptext{font-size:.9rem;margin:4px 0 12px;color:#334}" +
      ".pkt-eth{background:#e8f1fc;border-color:#a9c8ef}.pkt-ip{background:#e5f4ee;border-color:#9fd1bd}.pkt-l4{background:#f1ebfc;border-color:#c9b6f1}.pkt-data{background:#fff6e0;border-color:#ebcd86}.pkt-pad{background:#eef1f4;border-color:#cfd6dd}.pkt-fcs{background:#fdecec;border-color:#f0b0b0}" +
      ".pkt-grid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:14px;align-items:start}@media(max-width:820px){.pkt-grid{grid-template-columns:minmax(0,1fr)}}" +
      ".pkt-fields{max-height:420px;overflow:auto;border:1px solid #e3e8ee;border-radius:6px}.pkt-fields table{width:100%;border-collapse:collapse;font-size:.8rem;margin:0}.pkt-fields td,.pkt-fields th{padding:4px 6px;border-bottom:1px solid #eef1f4;text-align:left;vertical-align:top}" +
      ".pkt-fields tr[data-f]{cursor:pointer}.pkt-fields tr.pkt-grp td{font-weight:700;font-size:.78rem;text-transform:uppercase;letter-spacing:.03em}.pkt-fields code{font-size:.78rem}" +
      ".pkt-sw{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:6px;vertical-align:middle;border:1px solid rgba(0,0,0,.15)}" +
      ".pkt-hex{font-family:Consolas,'Courier New',monospace;font-size:12.5px;line-height:1.95;overflow-x:auto;border:1px solid #e3e8ee;border-radius:6px;padding:8px 10px}.pkt-hex .pkt-row{white-space:nowrap}.pkt-hex .pkt-off{color:#8a96a3;margin-right:10px}" +
      ".pkt-hex .pkt-b{display:inline-block;width:2.4ch;text-align:center;margin-right:3px;border-radius:3px;cursor:pointer;border:1px solid transparent}" +
      ".pkt .sel,.pkt .hov{outline:2px solid #1f2933;outline-offset:-1px;background:#ffe9a8 !important}" +
      ".pkt-err{color:#c53030;font-weight:600}";
    document.head.appendChild(st);
  })();
  const PORTS = { 20: "FTP data", 21: "FTP control", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS", 67: "DHCP server", 68: "DHCP client", 80: "HTTP", 110: "POP3", 123: "NTP", 143: "IMAP", 443: "HTTPS", 3306: "MySQL" };
  const FLAG_NAMES = [[0x20, "URG"], [0x10, "ACK"], [0x08, "PSH"], [0x04, "RST"], [0x02, "SYN"], [0x01, "FIN"]];
  const flagText = f => FLAG_NAMES.filter(([b]) => f & b).map(x => x[1]).join(", ") || "none";
  function packetFields(p, proto) {
    const f = p.frame, F = [];
    const hx = (o, n) => Array.from(f.slice(o, o + n)).map(b => hex(b)).join(" ");
    const u16 = o => (f[o] << 8) | f[o + 1], u32 = o => ((f[o] << 24) >>> 0) + (f[o + 1] << 16) + (f[o + 2] << 8) + f[o + 3];
    const ip4 = o => f.slice(o, o + 4).join("."), mac = o => Array.from(f.slice(o, o + 6)).map(b => hex(b)).join(":");
    const add = (layer, name, off, len, value, meaning) => F.push({ layer, name, off, len, value, meaning, raw: hx(off, len) });
    add("eth", "Destination MAC", 0, 6, mac(0), "Next device on this link (the gateway when the destination is remote)");
    add("eth", "Source MAC", 6, 6, mac(6), "This computer's network card");
    add("eth", "EtherType", 12, 2, "0x" + hex(u16(12), 4), "0x0800 = the payload is an IPv4 packet");
    const ipOk = L.verifyIpHeader(p.ip);
    add("ip", "Version + IHL", 14, 1, "0x" + hex(f[14]), "Version 4; header length 5 × 4 = 20 bytes");
    add("ip", "DSCP / ECN", 15, 1, "0x" + hex(f[15]), "Default (best-effort) service");
    add("ip", "Total length", 16, 2, u16(16) + " bytes", "IP header + transport header + data");
    add("ip", "Identification", 18, 2, "0x" + hex(u16(18), 4), "Groups fragments of the same packet");
    add("ip", "Flags + fragment offset", 20, 2, "0x" + hex(u16(20), 4), (f[20] & 0x40 ? "DF (don't fragment) set" : "DF clear") + "; offset 0");
    add("ip", "TTL", 22, 1, String(f[22]), "Routers decrement it; the packet is dropped at 0");
    add("ip", "Protocol", 23, 1, f[23] + (f[23] === 6 ? " (TCP)" : " (UDP)"), "Which transport protocol is inside");
    add("ip", "Header checksum", 24, 2, "0x" + hex(u16(24), 4), "One's-complement sum of the IP header — " + (ipOk ? "verifies ✓" : "INVALID ✕"));
    add("ip", "Source IP", 26, 4, ip4(26), "Original sender (unchanged end to end, unless NAT)");
    add("ip", "Destination IP", 30, 4, ip4(30), "Final destination");
    const b = 34, svc = n => PORTS[n] ? " (" + PORTS[n] + ")" : n >= 49152 ? " (ephemeral)" : "";
    add("l4", "Source port", b, 2, u16(b) + svc(u16(b)), "Identifies the sending application");
    add("l4", "Destination port", b + 2, 2, u16(b + 2) + svc(u16(b + 2)), "Identifies the receiving application");
    let hdr;
    if (proto === "TCP") {
      hdr = 20;
      const ackSet = f[b + 13] & 0x10;
      add("l4", "Sequence number", b + 4, 4, String(u32(b + 4)), "Number of the first data byte in this segment");
      add("l4", "Acknowledgment number", b + 8, 4, String(u32(b + 8)), ackSet ? "Next byte expected from the other side" : "Ignored — the ACK flag is not set");
      add("l4", "Data offset", b + 12, 1, "0x" + hex(f[b + 12]), "Header length 5 × 4 = 20 bytes (no options)");
      add("l4", "Flags", b + 13, 1, "0x" + hex(f[b + 13]) + " (" + flagText(f[b + 13]) + ")", "Control bits: SYN opens, FIN closes, ACK acknowledges, PSH pushes data, RST resets");
      add("l4", "Window size", b + 14, 2, String(u16(b + 14)), "Bytes the sender is willing to receive (flow control)");
      add("l4", "Checksum", b + 16, 2, "0x" + hex(u16(b + 16), 4), "Covers a pseudo-header (IPs, protocol, length) + TCP header + data");
      add("l4", "Urgent pointer", b + 18, 2, String(u16(b + 18)), "Used only with the URG flag");
    } else {
      hdr = 8;
      add("l4", "Length", b + 4, 2, u16(b + 4) + " bytes", "UDP header (8) + data");
      add("l4", "Checksum", b + 6, 2, "0x" + hex(u16(b + 6), 4), "Covers a pseudo-header + UDP header + data");
    }
    const dOff = b + hdr;
    if (p.payload.length) add("data", "Payload", dOff, p.payload.length, p.payload.length + " bytes", "Application data (UTF-8 text)");
    if (p.pad) add("pad", "Padding", dOff + p.payload.length, p.pad, p.pad + " zero bytes", "Pads the frame to the 60-byte minimum (64 with FCS)");
    add("fcs", "FCS (CRC-32)", f.length - 4, 4, "0x" + hex(p.fcs, 8), "Checked by the receiving network card; sent least-significant byte first");
    return { fields: F, hdr };
  }
  const PKT_STEPS = [
    { show: ["data"], side: "Sender", t: d => "<b>Application</b> hands " + d.n + " bytes of data to the transport layer." },
    { show: ["l4", "data"], side: "Sender", t: d => "<b>Transport</b> adds a " + d.hdr + "-byte " + d.proto + " header (ports" + (d.proto === "TCP" ? ", sequence numbers, flags" : ", length") + ", checksum) → a <b>" + (d.proto === "TCP" ? "segment" : "datagram") + "</b>." },
    { show: ["ip", "l4", "data"], side: "Sender", t: () => "<b>Network</b> adds a 20-byte IPv4 header (addresses, TTL, protocol, header checksum) → a <b>packet</b>." },
    { show: ["eth", "ip", "l4", "data", "pad", "fcs"], side: "Sender", t: d => "<b>Data link</b> adds a 14-byte Ethernet header" + (d.pad ? ", " + d.pad + " bytes of padding" : "") + " and a 4-byte FCS trailer → a <b>frame</b> of " + d.len + " bytes." },
    { show: ["eth", "ip", "l4", "data", "pad", "fcs"], side: "Wire", t: d => "<b>Physical</b> sends the frame as " + d.len * 8 + " bits (an 8-byte preamble + start delimiter goes first; it is not shown in the dump)." },
    { show: ["ip", "l4", "data"], side: "Receiver", t: d => "Receiver's <b>data link</b>: FCS " + (d.fcsOk ? "matches ✓" : "fails ✕") + " and the destination MAC is its own → removes the Ethernet header, padding and FCS." },
    { show: ["l4", "data"], side: "Receiver", t: d => "<b>Network</b>: header checksum " + (d.ipOk ? "valid ✓" : "invalid ✕") + ", destination IP is its own, protocol " + (d.proto === "TCP" ? "6 → TCP" : "17 → UDP") + " → removes the IP header." },
    { show: ["data"], side: "Receiver", t: d => "<b>Transport</b>: checksum verified, destination port " + d.dport + " selects the application → removes the " + d.proto + " header." },
    { show: ["data"], side: "Receiver", t: d => "<b>Application</b> receives exactly the " + d.n + " bytes that were sent." }
  ];
  const LAYER_NAME = { eth: "Ethernet header", ip: "IPv4 header", l4: "", data: "Payload", pad: "Padding", fcs: "FCS" };
  R("s-packet", "sim", "Networking · Packets", "Packet Formation Lab", "Build an Ethernet + IPv4 + TCP/UDP frame from your own values and inspect every header field, byte by byte.", env => {
    const ipSan = v => v.replace(/[^0-9.]/g, ""), macSan = v => v.toUpperCase().replace(/[^0-9A-F:]/g, ""), numSan = v => v.replace(/\D/g, "");
    const cfg = {
      dom: true,
      controls: [
        { id: "proto", type: "select", label: "Protocol", options: ["TCP", "UDP"], value: "TCP" },
        { id: "payload", type: "text", label: "Payload", value: "GET / HTTP/1.1", max: 40, width: 150 },
        { id: "srcIp", type: "text", label: "Src IP", value: "192.168.1.10", max: 15, width: 112, mono: true, sanitize: ipSan },
        { id: "dstIp", type: "text", label: "Dst IP", value: "203.0.113.5", max: 15, width: 112, mono: true, sanitize: ipSan },
        { id: "srcPort", type: "text", label: "Src port", value: "51514", max: 5, width: 62, mono: true, sanitize: numSan },
        { id: "dstPort", type: "text", label: "Dst port", value: "80", max: 5, width: 62, mono: true, sanitize: numSan },
        { id: "seq", type: "text", label: "Seq", value: "1000", max: 10, width: 96, mono: true, sanitize: numSan },
        { id: "ack", type: "text", label: "Ack", value: "5001", max: 10, width: 96, mono: true, sanitize: numSan },
        { id: "flags", type: "select", label: "TCP flags", options: [["2", "SYN"], ["18", "SYN + ACK"], ["16", "ACK"], ["24", "PSH + ACK"], ["17", "FIN + ACK"], ["4", "RST"]], value: "24" },
        { id: "ttl", type: "range", label: "TTL", min: 1, max: 255, step: 1, value: 64 },
        { id: "srcMac", type: "text", label: "Src MAC", value: "02:00:00:00:00:0A", max: 17, width: 150, mono: true, sanitize: macSan },
        { id: "dstMac", type: "text", label: "Dst MAC", value: "02:00:00:00:00:01", max: 17, width: 150, mono: true, sanitize: macSan }
      ],
      init(s) { s.step = 3; s.sel = -1; },
      compute(s) {
        const errors = [], macOk = m => /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i.test(m);
        if (!L.validIp(s.srcIp)) errors.push("Source IP must be four numbers 0–255, e.g. 192.168.1.10.");
        if (!L.validIp(s.dstIp)) errors.push("Destination IP must be four numbers 0–255.");
        if (!macOk(s.srcMac) || !macOk(s.dstMac)) errors.push("MAC addresses need six two-digit hex bytes separated by colons, e.g. 02:00:00:00:00:0A.");
        [["Source port", s.srcPort], ["Destination port", s.dstPort]].forEach(([n, v]) => { if (v === "" || +v > 65535) errors.push(n + " must be 0–65535."); });
        [["Sequence", s.seq], ["Acknowledgment", s.ack]].forEach(([n, v]) => { if (v === "" || +v > 4294967295) errors.push(n + " number must be 0–4294967295 (32 bits)."); });
        if (errors.length) return { errors };
        const p = L.buildPacket({ proto: s.proto, srcMac: s.srcMac, dstMac: s.dstMac, srcIp: s.srcIp, dstIp: s.dstIp, srcPort: +s.srcPort, dstPort: +s.dstPort, seq: +s.seq, ack: +s.ack, flags: +s.flags, ttl: s.ttl, payload: s.payload });
        const pf = packetFields(p, s.proto);
        return { p, fields: pf.fields, hdr: pf.hdr, ipOk: L.verifyIpHeader(p.ip), fcsOk: L.crc32(p.frame.slice(0, p.frame.length - 4)) === p.fcs };
      },
      dom(stage, s) {
        const o = s.out;
        if (o.errors) { stage.innerHTML = '<div class="pkt"><p class="pkt-note">Simulated packet — built in your browser, not captured network traffic.</p><p class="pkt-err">Fix the highlighted values to build the packet:</p><ul>' + o.errors.map(e => "<li>" + escapeHtml(e) + "</li>").join("") + "</ul></div>"; return; }
        const p = o.p, len = p.frame.length, step = PKT_STEPS[s.step];
        const d = { n: p.payload.length, hdr: o.hdr, proto: s.proto, pad: p.pad, len, fcsOk: o.fcsOk, ipOk: o.ipOk, dport: +s.dstPort };
        const sizes = { eth: 14, ip: 20, l4: o.hdr, data: p.payload.length, pad: p.pad, fcs: 4 };
        const sw = stage.clientWidth || 900, narrow = sw < 640, per = sw >= 1000 ? 16 : 8;
        const SHORT = { eth: "Eth", ip: "IP", l4: s.proto, data: "Data", pad: "Pad", fcs: "FCS" };
        const blocks = ["eth", "ip", "l4", "data", "pad", "fcs"].filter(k => step.show.indexOf(k) !== -1 && sizes[k] > 0)
          .map(k => '<div class="pkt-blk pkt-' + k + '" style="flex-grow:' + Math.max(4, sizes[k]) + '" title="' + (LAYER_NAME[k] || s.proto + " header") + " · " + sizes[k] + ' bytes">' + (narrow ? SHORT[k] : (LAYER_NAME[k] || s.proto + " header")) + " " + sizes[k] + (narrow ? "" : " B") + "</div>").join("");
                const owner = new Array(len).fill(-1); o.fields.forEach((f, i) => { for (let k = 0; k < f.len; k++) owner[f.off + k] = i; });
        let hexRows = "";
        for (let r = 0; r < len; r += per) {
          hexRows += '<div class="pkt-row"><span class="pkt-off">' + hex(r, 4) + "</span>" + Array.from(p.frame.slice(r, r + per)).map((b, k) => { const fi = owner[r + k], f = o.fields[fi]; return '<span class="pkt-b pkt-' + (f ? f.layer : "pad") + (fi === s.sel ? " sel" : "") + '" data-f="' + fi + '" title="' + (f ? escapeHtml(f.name) : "") + '">' + hex(b) + "</span>"; }).join("") + "</div>";
        }
        let lastLayer = "", rows = "";
        const grpName = { eth: "Ethernet II header (14 bytes)", ip: "IPv4 header (20 bytes)", l4: s.proto + " header (" + o.hdr + " bytes)", data: "Data", pad: "Padding", fcs: "Trailer" };
        o.fields.forEach((f, i) => {
          if (f.layer !== lastLayer) { rows += '<tr class="pkt-grp"><td colspan="' + (narrow ? 2 : 3) + '" class="pkt-' + f.layer + '">' + grpName[f.layer] + "</td></tr>"; lastLayer = f.layer; }
          rows += '<tr data-f="' + i + '"' + (i === s.sel ? ' class="sel"' : "") + '><td><span class="pkt-sw pkt-' + f.layer + '"></span>' + f.name + '<br><small class="muted">bytes ' + f.off + (f.len > 1 ? "–" + (f.off + f.len - 1) : "") + "</small></td><td><code>" + escapeHtml(f.value) + "</code>" + (narrow ? "<br><small>" + escapeHtml(f.meaning) + "</small></td>" : "</td><td>" + escapeHtml(f.meaning) + "</td>") + "</tr>";
        });
        const sel = s.sel >= 0 && o.fields[s.sel];
        stage.innerHTML = '<div class="pkt"><p class="pkt-note">Simulated packet — built in your browser, not captured network traffic.</p>' +
          '<div class="pkt-steps"><button class="btn" data-step="-1"' + (s.step === 0 ? " disabled" : "") + ">◂ Back</button><b>" + (s.step < 5 ? "Encapsulation" : "Decapsulation") + " · step " + (s.step + 1) + " of " + PKT_STEPS.length + " · " + step.side + '</b><button class="btn" data-step="1"' + (s.step === PKT_STEPS.length - 1 ? " disabled" : "") + ">Next ▸</button></div>" +
          '<div class="pkt-layers">' + blocks + '</div><div class="pkt-steptext">' + step.t(d) + "</div>" +
          '<div class="pkt-grid"><div class="pkt-fields"><table><thead><tr><th>Field</th><th>Value</th>' + (narrow ? "" : "<th>Meaning</th>") + '</tr></thead><tbody>' + rows + "</tbody></table></div>" +
          '<div><div class="pkt-hex" aria-label="Hex dump of the frame">' + hexRows + '</div><p class="muted" style="font-size:.82rem;margin:6px 0 0">' + (sel ? "<b>" + escapeHtml(sel.name) + "</b>: bytes " + sel.off + (sel.len > 1 ? "–" + (sel.off + sel.len - 1) : "") + " = <code>" + sel.raw + "</code>" : "Hover or click a field or a byte to highlight it in both views.") + "</p></div></div></div>";
        stage.querySelectorAll("[data-step]").forEach(btn => btn.onclick = () => { s.step = clamp(s.step + +btn.dataset.step, 0, PKT_STEPS.length - 1); cfg.dom(stage, s); env.done(); });
        const mark = (fi, cls, on) => stage.querySelectorAll('[data-f="' + fi + '"]').forEach(el => el.classList.toggle(cls, on));
        stage.onmouseover = e => { const el = e.target.closest("[data-f]"); if (el) mark(el.dataset.f, "hov", true); };
        stage.onmouseout = e => { const el = e.target.closest("[data-f]"); if (el) mark(el.dataset.f, "hov", false); };
        stage.onclick = e => { const el = e.target.closest("[data-f]"); if (!el || +el.dataset.f < 0) return; s.sel = +el.dataset.f === s.sel ? -1 : +el.dataset.f; cfg.dom(stage, s); env.done(); };
      },
      readout(s) {
        const o = s.out;
        if (o.errors) return '<span class="pkt-err">The packet cannot be built until the inputs are valid.</span>';
        const p = o.p, headers = p.frame.length - p.payload.length;
        return "Frame of <b>" + p.frame.length + " bytes</b> carrying " + p.payload.length + " bytes of data. Change any value above — the checksums and CRC are recomputed instantly." +
          metrics([["Header + trailer overhead", headers + " B", (100 * headers / p.frame.length).toFixed(0) + "% of the frame"], ["IP header checksum", "0x" + hex(p.ipChecksum, 4), o.ipOk ? "verifies ✓" : "invalid ✕"], [s.proto + " checksum", "0x" + hex(p.l4Checksum, 4), "incl. pseudo-header"], ["FCS (CRC-32)", "0x" + hex(p.fcs, 8), o.fcsOk ? "matches ✓" : "mismatch ✕"]]) +
          '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Try: change the TTL and watch the IP header checksum change too — every router recomputes it after decrementing TTL.</p>';
      }
    };
    return K.controls(env, cfg);
  }, {});

  /* ---------- s-errordetect ---------- */
  const GENS = [["10011", "CRC-4 (x⁴+x+1)"], ["100000111", "CRC-8 (x⁸+x²+x+1)"], ["11000000000000101", "CRC-16 (x¹⁶+x¹⁵+x²+1)"]];
  function bitsToBytes(b) { const out = []; for (let i = 0; i < b.length; i += 8) out.push(parseInt(b.substr(i, 8), 2)); return out; }
  function errorPattern(mode, bits, seed) {
    const n = bits.length, r = L.rng(seed), pick = () => Math.floor(r() * n), set = {};
    if (mode === "1") set[pick()] = 1;
    else if (mode === "2") { const a = pick(); let b = pick(); while (b === a) b = pick(); set[a] = 1; set[b] = 1; }
    else if (mode === "burst") { const st = Math.floor(r() * (n - 3)); for (let k = 0; k < 4; k++) set[st + k] = 1; }
    else if (mode === "ber") { for (let k = 0; k < n; k++) if (r() < 0.1) set[k] = 1; }
    else if (mode === "blind") {
      // flip bit j in one 16-bit word and the same bit position, opposite value, in the next word: the one's-complement sum is unchanged
      const cands = []; for (let j = 0; j + 16 < n; j++) if (bits[j] !== bits[j + 16]) cands.push(j);
      if (!cands.length) return { set, note: "No blind-spot pattern exists for this data (needs 32 bits whose two 16-bit words differ)." };
      const j = cands[Math.floor(r() * cands.length)]; set[j] = 1; set[j + 16] = 1;
    }
    return { set };
  }
  R("s-errordetect", "sim", "Networking · Error Detection", "Error Detection Lab", "Send data protected by parity, the Internet checksum and a CRC; add noise or flip bits yourself and see which methods notice.", env => {
    const cfg = {
      dom: true,
      controls: [
        { id: "data", type: "text", label: "Data bits", value: "11010110110010100110100111100001", max: 32, width: 290, mono: true, sanitize: v => v.replace(/[^01]/g, "") },
        { id: "noise", type: "select", label: "Channel noise", options: [["none", "No errors"], ["1", "1-bit error"], ["2", "2-bit error"], ["burst", "Burst of 4 bits"], ["ber", "Random (10% bit error rate)"], ["blind", "Checksum blind spot"]], value: "1" },
        { id: "parity", type: "select", label: "Parity", options: [["even", "Even"], ["odd", "Odd"]], value: "even" },
        { id: "gen", type: "select", label: "CRC", options: GENS, value: "10011" },
        { id: "reseed", type: "button", label: "New noise", icon: "reset", onClick: s => { s.seed = (s.seed || 7) + 1; s.custom = {}; } }
      ],
      init(s) { s.seed = 7; s.custom = {}; },
      onChange(s, id) { if (id === "data" || id === "noise") s.custom = {}; },
      compute(s) {
        const bits = s.data, n = bits.length;
        if (n < 8 || n % 8) return { error: "Enter 8, 16, 24 or 32 bits (whole bytes) — you have " + n + "." };
        const pat = s.noise === "none" ? { set: {} } : errorPattern(s.noise, bits, s.seed);
        const flips = Object.assign({}, pat.set); Object.keys(s.custom).forEach(k => { if (flips[k]) delete flips[k]; else flips[k] = 1; });
        const rx = bits.split("").map((b, k) => flips[k] ? (b === "1" ? "0" : "1") : b).join("");
        const nErr = Object.keys(flips).length, even = s.parity === "even";
        const pSent = L.parityBit(bits, even), pRx = L.parityBit(rx, even);
        const ckSent = L.internetChecksum(bitsToBytes(bits)), ckRx = L.internetChecksum(bitsToBytes(rx));
        const rem = L.crcMod2(bits, s.gen).remainder, crcOk = L.crcCheck(rx + rem, s.gen), rxRem = mod2Remainder(rx + rem, s.gen);
        return { rx, flips, nErr, note: pat.note, pSent, pRx, ckSent, ckRx, rem, rxRem, crcOk, methods: [["Parity (" + s.parity + ")", pSent !== pRx], ["Internet checksum", ckSent !== ckRx], [GENS.find(g => g[0] === s.gen)[1], !crcOk]] };
      },
      dom(stage, s) {
        const o = s.out;
        if (o.error) { stage.innerHTML = '<div class="lab"><p class="pkt-err" style="color:var(--red,#c53030);font-weight:600">' + o.error + "</p></div>"; return; }
        const bitBtn = (b, k, bad, clickable) => '<' + (clickable ? 'button type="button" data-bit="' + k + '"' : "span") + ' style="display:inline-block;font:700 13px Consolas,monospace;width:22px;height:28px;line-height:26px;text-align:center;margin:1px;border-radius:4px;border:1px solid ' + (bad ? "#c53030" : "#c5ccd5") + ";background:" + (bad ? "#fdecec" : "#fff") + ";color:" + (bad ? "#c53030" : "inherit") + ";padding:0;" + (clickable ? "cursor:pointer;" : "") + '">' + b + "</" + (clickable ? "button" : "span") + ">";
        const grouped = fn => { let h = ""; for (let k = 0; k < o.rx.length; k += 8) h += '<span style="display:inline-block;white-space:nowrap;margin-right:8px">' + o.rx.substr(k, 8).split("").map((_, j) => fn(k + j)).join("") + "</span>"; return h; };
        const verdict = det => o.nErr === 0 ? (det ? '<b style="color:#c53030">False alarm</b>' : '<b style="color:#0b7a5c">No error ✓</b>') : det ? '<b style="color:#0b7a5c">Detected ✓</b>' : '<b style="color:#c53030">MISSED ✕</b>';
        stage.innerHTML = '<div class="lab">' +
          '<div class="lab-row"><span class="lab-tag">Sent data</span><div>' + grouped(k => bitBtn(s.data[k], k, false, false)) + "</div></div>" +
          '<div class="lab-arrow">— noisy channel: ' + o.nErr + " bit" + (o.nErr === 1 ? "" : "s") + " flipped (check bits assumed to arrive intact) —→</div>" +
          '<div class="lab-row"><span class="lab-tag">Received — click a bit to flip it</span><div>' + grouped(k => bitBtn(o.rx[k], k, !!o.flips[k], true)) + "</div></div>" +
          (o.note ? '<p class="muted" style="margin:6px 0">' + o.note + "</p>" : "") +
          '<div class="table-wrap" style="margin:10px 0 0"><table><thead><tr><th>Method</th><th>Sent check</th><th>Recomputed</th><th>Result</th></tr></thead><tbody>' +
          "<tr><td>" + o.methods[0][0] + "</td><td><code>" + o.pSent + "</code></td><td><code>" + o.pRx + "</code></td><td>" + verdict(o.methods[0][1]) + "</td></tr>" +
          "<tr><td>Internet checksum (16-bit)</td><td><code>0x" + hex(o.ckSent, 4) + "</code></td><td><code>0x" + hex(o.ckRx, 4) + "</code></td><td>" + verdict(o.methods[1][1]) + "</td></tr>" +
          "<tr><td>" + o.methods[2][0] + "</td><td><code>" + o.rem + "</code></td><td>remainder <code>" + o.rxRem + "</code></td><td>" + verdict(o.methods[2][1]) + "</td></tr>" +
          "</tbody></table></div></div>";
        stage.querySelectorAll("[data-bit]").forEach(b => b.onclick = () => {
          const k = b.dataset.bit; if (s.custom[k]) delete s.custom[k]; else s.custom[k] = 1;
          s.out = cfg.compute(s); env.info.innerHTML = cfg.readout(s); cfg.dom(stage, s); env.done();
        });
      },
      readout(s) {
        const o = s.out;
        if (o.error) return "Error detection works on whole bytes here, so the checksum can be computed.";
        const missed = o.methods.filter(m => !m[1]).map(m => m[0]);
        let why = "";
        if (o.nErr && o.nErr % 2 === 0 && !o.methods[0][1]) why += " Parity only notices an <b>odd</b> number of flipped bits — two flips cancel out.";
        if (o.nErr && !o.methods[1][1]) why += " The checksum missed it because the changes in the two 16-bit words <b>cancel in the one's-complement sum</b>.";
        if (o.nErr && o.methods[2][1]) why += " The CRC detects every single-bit error and every burst no longer than its " + (s.gen.length - 1) + " check bits.";
        return (o.nErr === 0 ? "No bits were changed, so every method reports success." : missed.length ? "<b>" + missed.join(" and ") + "</b> failed to notice the error." : "<b>All three methods detected the error.</b>") + why +
          metrics([["Bits sent", s.data.length], ["Bits flipped", o.nErr, "", o.nErr ? "warn" : ""], ["Parity overhead", "1 bit"], ["Checksum overhead", "16 bits"], ["CRC overhead", (s.gen.length - 1) + " bits"]]);
      }
    };
    return K.controls(env, cfg);
  });

  /* ---------- s-subnet ---------- */
  function ipClass(o1) { return o1 < 128 ? "A" : o1 < 192 ? "B" : o1 < 224 ? "C" : o1 < 240 ? "D (multicast)" : "E (reserved)"; }
  function isPrivate(ip) { const [a, b] = ip.split(".").map(Number); return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168); }
  R("s-subnet", "sim", "Networking · IP Addressing", "Subnet Calculator", "Enter any IPv4 address and prefix to see its network, broadcast, host range and the binary AND that produces them.", env => K.controls(env, {
    dom: true,
    controls: [
      { id: "ip", type: "text", label: "IP address", value: "192.168.10.77", max: 15, width: 130, mono: true, sanitize: v => v.replace(/[^0-9.]/g, "") },
      { id: "prefix", type: "range", label: "Prefix", min: 8, max: 30, step: 1, value: 26, fmt: v => "/" + v }
    ],
    compute(s) {
      if (!L.validIp(s.ip)) return { error: "Enter a valid IPv4 address such as 192.168.10.77 (four numbers 0–255)." };
      const p = +s.prefix, sub = L.subnet(s.ip, p), parent = p >= 24 ? 24 : p >= 16 ? 16 : 8;
      const par = L.subnet(s.ip, parent), offset = L.ipToInt(sub.net) - L.ipToInt(par.net);
      return { sub, p, parent, parNet: par.net, parSize: par.size, offset, wildcard: sub.mask.split(".").map(o => 255 - o).join("."), cls: ipClass(+s.ip.split(".")[0]), priv: isPrivate(s.ip) };
    },
    dom(stage, s) {
      const o = s.out;
      if (o.error) { stage.innerHTML = '<div class="lab"><p style="color:#c53030;font-weight:600">' + o.error + "</p></div>"; return; }
      const binRow = (name, ip, isNet) => {
        const b = ip.split(".").map(x => L.toBin(+x)).join("");
        return '<div class="lab-row"><span class="lab-tag">' + name + " <code>" + ip + '</code></span><div style="font:600 13px Consolas,monospace;line-height:1.9;word-break:break-all">' +
          b.split("").map((c, k) => '<span style="padding:1px 1.5px;border-radius:2px;background:' + (k < o.p ? "#e8f1fc" : isNet ? "#eef1f4" : "#e5f4ee") + (k % 8 === 7 && k < 31 ? ';margin-right:7px' : "") + '">' + c + "</span>").join("") + "</div></div>";
      };
      const sub = o.sub, pct = x => (100 * x).toFixed(3) + "%";
      stage.innerHTML = '<div class="lab">' + binRow("Address", s.ip) + binRow("Mask /" + o.p, sub.mask, true) + binRow("AND → network", sub.net) +
        '<p class="muted" style="font-size:.82rem;margin:2px 0 10px"><span style="background:#e8f1fc;padding:0 6px">network bits (' + o.p + ')</span> <span style="background:#e5f4ee;padding:0 6px">host bits (' + (32 - o.p) + ")</span></p>" +
        '<div class="table-wrap"><table><tbody>' +
        [["Network address", sub.net + "/" + o.p], ["First usable host", sub.first], ["Last usable host", sub.last], ["Broadcast address", sub.bc], ["Usable hosts", sub.hosts.toLocaleString() + " (2<sup>" + (32 - o.p) + "</sup> − 2)"], ["Subnet mask", sub.mask], ["Wildcard mask", o.wildcard], ["Block size", sub.size.toLocaleString() + " addresses"], ["Class (classful view)", o.cls + (o.priv ? " · private (RFC 1918)" : "")]].map(r => "<tr><th style=\"width:42%\">" + r[0] + "</th><td><code>" + r[1] + "</code></td></tr>").join("") +
        "</tbody></table></div>" +
        '<p style="margin:12px 0 4px;font-size:.88rem">Position inside <code>' + o.parNet + "/" + o.parent + "</code> (" + (2 ** (o.p - o.parent)).toLocaleString() + " subnets of /" + o.p + "):</p>" +
        '<div style="position:relative;height:22px;background:#eef1f4;border-radius:4px;overflow:hidden"><div style="position:absolute;top:0;bottom:0;left:' + pct(o.offset / o.parSize) + ";width:max(3px," + pct(sub.size / o.parSize) + ');background:#1f6fd1"></div></div></div>';
    },
    readout(s) {
      const o = s.out;
      if (o.error) return '<span style="color:#c53030">Waiting for a valid address.</span>';
      return "The network address is the IP <b>AND</b> the mask; the broadcast address sets every host bit to 1. " +
        metrics([["Prefix", "/" + o.p], ["Hosts per subnet", o.sub.hosts.toLocaleString()], ["Subnets in /" + o.parent, (2 ** (o.p - o.parent)).toLocaleString()], ["Host bits", 32 - o.p]]);
    }
  }));

  /* ---------- s-dhcppool ---------- */
  const POOL = Array.from({ length: 10 }, (_, k) => "192.168.1." + (100 + k));
  function dhcpLog(s, type, from, to, detail) { s.log.unshift({ t: s.now, type, from, to, detail }); if (s.log.length > 40) s.log.pop(); }
  function dhcpConnect(s) {
    const id = s.nextId++, mac = "02:00:00:00:00:" + hex(id), name = "Device " + id;
    dhcpLog(s, "DISCOVER", name + " (0.0.0.0:68)", "255.255.255.255:67", "broadcast — “is there a DHCP server?” from " + mac);
    const used = s.devices.map(d => d.ip), free = POOL.find(a => used.indexOf(a) === -1);
    if (!free) { dhcpLog(s, "NO OFFER", "server", name, "pool exhausted — no address can be offered. The client keeps retrying (Windows may self-assign 169.254.x.x)."); s.failed = (s.failed || 0) + 1; return; }
    const lease = +s.lease;
    dhcpLog(s, "OFFER", "server 192.168.1.1:67", name + ":68", "offers " + free + ", mask 255.255.255.0, router 192.168.1.1, DNS 192.168.1.1, lease " + lease + " s");
    dhcpLog(s, "REQUEST", name + " (0.0.0.0:68)", "255.255.255.255:67", "broadcast — requests " + free + " from server 192.168.1.1 (other servers withdraw their offers)");
    dhcpLog(s, "ACK", "server 192.168.1.1:67", name + ":68", "confirms " + free + " for " + lease + " s; the client may now use it");
    s.devices.push({ id, name, mac, ip: free, online: true, lease, start: s.now, expiry: s.now + lease, t1: s.now + lease / 2 });
  }
  function dhcpAdvance(s, secs) {
    const end = s.now + secs;
    for (let guard = 0; guard < 500; guard++) {
      let next = null;
      s.devices.forEach(d => { const at = d.online ? d.t1 : d.expiry; if (at <= end && (!next || at < next.at)) next = { d, at }; });
      if (!next) break;
      s.now = next.at; const d = next.d;
      if (d.online) { dhcpLog(s, "REQUEST", d.name + " (" + d.ip + ")", "server (unicast)", "renewal at T1 = 50% of the lease"); dhcpLog(s, "ACK", "server", d.name, "lease renewed for " + d.lease + " s"); d.start = s.now; d.expiry = s.now + d.lease; d.t1 = s.now + d.lease / 2; }
      else { dhcpLog(s, "EXPIRED", "server", "—", "lease of " + d.ip + " (" + d.name + ", offline) expired → address returned to the pool"); s.devices.splice(s.devices.indexOf(d), 1); }
    }
    s.now = end;
  }
  R("s-dhcppool", "sim", "Networking · DHCP", "DHCP Address Pool", "Connect devices, let leases renew or expire, release addresses and fill up a 10-address pool — with every DORA message logged.", env => K.controls(env, {
    dom: true,
    controls: [
      { id: "lease", type: "select", label: "Lease time", options: [["60", "60 s"], ["120", "120 s"], ["300", "300 s"]], value: "120" },
      { id: "connect", type: "button", label: "Connect device", icon: "play", primary: true, onClick: s => dhcpConnect(s) },
      { id: "leave", type: "button", label: "Disconnect (no release)", icon: "minus", onClick: s => { const d = s.devices.filter(x => x.online).pop(); if (d) { d.online = false; dhcpLog(s, "OFFLINE", d.name, "—", "left without sending RELEASE — " + d.ip + " stays reserved until " + d.expiry + " s"); } } },
      { id: "release", type: "button", label: "Release", icon: "x", onClick: s => { const d = s.devices.filter(x => x.online).pop(); if (d) { dhcpLog(s, "RELEASE", d.name + " (" + d.ip + ")", "server (unicast)", d.ip + " handed back immediately"); s.devices.splice(s.devices.indexOf(d), 1); } } },
      { id: "adv", type: "button", label: "+30 s", icon: "arrowR", onClick: s => dhcpAdvance(s, 30) },
      { id: "reset", type: "button", label: "Reset", icon: "reset", onClick: s => { s.devices = []; s.log = []; s.now = 0; s.nextId = 1; s.failed = 0; } }
    ],
    init(s) { s.devices = []; s.log = []; s.now = 0; s.nextId = 1; s.failed = 0; },
    compute(s) { return { free: POOL.length - s.devices.length }; },
    dom(stage, s) {
      const cell = a => {
        const d = s.devices.find(x => x.ip === a);
        const bg = !d ? "#fff" : d.online ? "#e5f4ee" : "#fff6e0", bd = !d ? "#c5ccd5" : d.online ? "#0b7a5c" : "#b7791f";
        return '<div style="flex:1 1 108px;max-width:160px;border:1.5px solid ' + bd + ";background:" + bg + ';border-radius:6px;padding:6px 8px;font-size:.8rem"><code style="font-weight:700">.' + a.split(".")[3] + "</code><br>" +
          (d ? escapeHtml(d.name) + "<br><small>" + (d.online ? "renews at " + d.t1 + " s" : "offline · expires " + d.expiry + " s") + "</small>" : '<span class="muted">free</span><br><small>&nbsp;</small>') + "</div>";
      };
      const col = { DISCOVER: "#6b46c1", OFFER: "#1f6fd1", REQUEST: "#6b46c1", ACK: "#0b7a5c", RELEASE: "#b7791f", EXPIRED: "#b7791f", OFFLINE: "#52606d", "NO OFFER": "#c53030" };
      stage.innerHTML = '<div class="lab"><p class="muted" style="margin:0 0 8px;font-size:.85rem">Simulated DHCP server · pool 192.168.1.100 – 192.168.1.109 · simulated clock: <b>' + s.now + " s</b></p>" +
        '<div style="display:flex;flex-wrap:wrap;gap:6px">' + POOL.map(cell).join("") + "</div>" +
        '<p style="margin:12px 0 4px;font-weight:600">Message log <span class="muted" style="font-weight:400">(newest first)</span></p>' +
        '<div style="max-height:260px;overflow:auto;border:1px solid #e3e8ee;border-radius:6px">' +
        (s.log.length ? '<table style="width:100%;font-size:.8rem;margin:0"><tbody>' + s.log.map(l => '<tr><td style="white-space:nowrap">' + l.t + ' s</td><td><b style="color:' + (col[l.type] || "#1f2933") + '">' + l.type + "</b></td><td>" + escapeHtml(l.from) + " → " + escapeHtml(l.to) + '<br><span class="muted">' + escapeHtml(l.detail) + "</span></td></tr>").join("") + "</tbody></table>"
          : '<p class="muted" style="padding:10px;margin:0">Press <b>Connect device</b> to watch Discover → Offer → Request → Acknowledge.</p>') + "</div></div>";
    },
    readout(s) {
      const online = s.devices.filter(d => d.online).length;
      return "Online devices renew at <b>T1 = 50%</b> of the lease (a unicast Request/ACK). A device that leaves without a RELEASE keeps its address reserved until the lease <b>expires</b>." +
        metrics([["Free addresses", s.out.free + " / " + POOL.length, "", s.out.free ? "" : "warn"], ["Leased (online)", online], ["Reserved (offline)", s.devices.length - online], ["Failed requests", s.failed || 0], ["Clock", s.now + " s"]]);
    }
  }));

  /* ---------- s-http ---------- */
  const STATUS_TEXT = { 200: "OK", 201: "Created", 204: "No Content", 301: "Moved Permanently", 304: "Not Modified", 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 405: "Method Not Allowed", 503: "Service Unavailable" };
  const CLASS_TEXT = { 2: "2xx Success — the request worked.", 3: "3xx Redirection — the client must do something else (go elsewhere or use its cache).", 4: "4xx Client error — the request itself was wrong or not allowed.", 5: "5xx Server error — the request was fine but the server failed." };
  function httpServe(m, path, body, loggedIn, cached, overload) {
    const json = o => ({ type: "application/json", body: JSON.stringify(o) });
    const res = (code, extra, content) => ({ code, headers: extra || [], content: content || null });
    if (overload) return res(503, [["Retry-After", "120"]], { type: "text/plain", body: "Server busy, try again later." });
    let parsed = null, bad = false;
    if (m === "POST" || m === "PUT") { try { parsed = JSON.parse(body || ""); } catch (e) { bad = true; } }
    if (path === "/index.html") {
      if (m === "GET" || m === "HEAD") return cached ? res(304, [["ETag", '"v1-5d8c"']]) : res(200, [["ETag", '"v1-5d8c"'], ["Cache-Control", "max-age=60"]], { type: "text/html; charset=utf-8", body: "<!DOCTYPE html><html><body><h1>Welcome</h1></body></html>" });
      return res(405, [["Allow", "GET, HEAD"]]);
    }
    if (path === "/api/users/42") {
      if (m === "GET" || m === "HEAD") return res(200, [], json({ id: 42, name: "Asha", role: "student" }));
      if (m === "PUT") { if (!loggedIn) return res(401, [["WWW-Authenticate", 'Bearer realm="api"']]); if (bad || typeof parsed !== "object" || !parsed) return res(400, [], json({ error: "Body must be a JSON object" })); return res(200, [], json(Object.assign({ id: 42, name: "Asha", role: "student" }, parsed, { id: 42 }))); }
      if (m === "DELETE") return loggedIn ? res(204) : res(401, [["WWW-Authenticate", 'Bearer realm="api"']]);
      return res(405, [["Allow", "GET, HEAD, PUT, DELETE"]]);
    }
    if (path === "/api/users") {
      if (m === "GET" || m === "HEAD") return res(200, [], json([{ id: 42, name: "Asha" }]));
      if (m === "POST") { if (bad || typeof parsed !== "object" || !parsed) return res(400, [], json({ error: "Body must be a JSON object" })); return res(201, [["Location", "/api/users/43"]], json(Object.assign({}, parsed, { id: 43 }))); }
      return res(405, [["Allow", "GET, HEAD, POST"]]);
    }
    if (path === "/admin") return loggedIn ? res(403, [], { type: "text/plain", body: "Your account is not an administrator." }) : res(401, [["WWW-Authenticate", 'Bearer realm="admin"']]);
    if (path === "/old-page") return res(301, [["Location", "/index.html"]]);
    return res(404, [], { type: "text/html; charset=utf-8", body: "<h1>404 Not Found</h1>" });
  }
  R("s-http", "sim", "Networking · HTTP", "HTTP Request & Response Builder", "Compose an HTTP request and see the exact response a (simulated) web server returns — status line, headers and body.", env => K.controls(env, {
    dom: true,
    controls: [
      { id: "m", type: "select", label: "Method", options: ["GET", "HEAD", "POST", "PUT", "DELETE"], value: "GET" },
      { id: "path", type: "select", label: "Path", options: ["/index.html", "/api/users", "/api/users/42", "/admin", "/old-page", "/missing-page"], value: "/index.html" },
      { id: "body", type: "text", label: "JSON body", value: '{"name":"Ravi"}', max: 60, width: 170, mono: true },
      { id: "login", type: "check", label: "Logged in (token)", value: false },
      { id: "cached", type: "check", label: "Browser has a cached copy", value: false },
      { id: "busy", type: "check", label: "Server overloaded", value: false }
    ],
    compute(s) {
      const hasBody = s.m === "POST" || s.m === "PUT", reqBody = hasBody ? s.body : "";
      const req = [s.m + " " + s.path + " HTTP/1.1", "Host: www.example.com", "User-Agent: NetLab-Sim/1.0", "Accept: " + (s.path.indexOf("/api") === 0 ? "application/json" : "text/html")];
      if (s.login) req.push("Authorization: Bearer eyJhbGciOi…(token)");
      const conditional = s.cached && s.path === "/index.html" && (s.m === "GET" || s.m === "HEAD");
      if (conditional) req.push('If-None-Match: "v1-5d8c"');
      if (hasBody) req.push("Content-Type: application/json", "Content-Length: " + L.utf8Bytes(reqBody).length);
      const r = httpServe(s.m, s.path, reqBody, s.login, conditional, s.busy);
      const resLines = ["HTTP/1.1 " + r.code + " " + STATUS_TEXT[r.code], "Date: " + new Date().toUTCString(), "Server: NetLab-Sim"];
      r.headers.forEach(h => resLines.push(h[0] + ": " + h[1]));
      const bodyLen = r.content ? L.utf8Bytes(r.content.body).length : 0;
      if (r.content) resLines.push("Content-Type: " + r.content.type, "Content-Length: " + bodyLen);
      else if (r.code !== 204 && r.code !== 304) resLines.push("Content-Length: 0");
      const sendBody = r.content && s.m !== "HEAD";
      return { req: req.join("\r\n") + "\r\n\r\n" + reqBody, res: resLines.join("\r\n") + "\r\n\r\n" + (sendBody ? r.content.body : ""), code: r.code, bodyLen, headNote: s.m === "HEAD" && r.content };
    },
    dom(stage, s) {
      const o = s.out, pre = (t, col) => '<pre style="margin:0;white-space:pre-wrap;overflow-wrap:anywhere;font:12.5px/1.55 Consolas,monospace;background:#fff;border:1px solid #e3e8ee;border-left:4px solid ' + col + ';border-radius:6px;padding:10px 12px">' + escapeHtml(t.replace(/\r\n/g, "\n")) + "</pre>";
      stage.innerHTML = '<div class="lab"><p class="muted" style="margin:0 0 8px;font-size:.85rem">Simulated server — no network request leaves your browser.</p>' +
        '<div class="lab-row"><span class="lab-tag">Request (client → server)</span>' + pre(o.req, "#1f6fd1") + "</div>" +
        '<div class="lab-arrow">— over a TCP connection to port 80 (443 with TLS for HTTPS) —→</div>' +
        '<div class="lab-row"><span class="lab-tag">Response (server → client)</span>' + pre(o.res, o.code < 300 ? "#0b7a5c" : o.code < 400 ? "#b7791f" : "#c53030") + "</div></div>";
    },
    readout(s) {
      const o = s.out, cls = Math.floor(o.code / 100);
      return "<b>" + o.code + " " + STATUS_TEXT[o.code] + "</b> — " + CLASS_TEXT[cls] + (o.headNote ? " HEAD returns the same headers as GET but <b>no body</b>." : "") +
        metrics([["Status class", cls + "xx"], ["Response body", (s.m === "HEAD" ? 0 : o.bodyLen) + " bytes"], ["Method is safe?", s.m === "GET" || s.m === "HEAD" ? "Yes (read-only)" : "No (changes data)"]]) +
        '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Each header line ends with CR LF, and an empty line separates the headers from the body.</p>';
    }
  }));

  /* ===================== Mapping for Additional topics ===================== */
  const MAP = {
    "intro": [{ id: "v-dcflow", intro: "Follow a short message from the source, through encoding and the medium, to the receiver." },
      { id: "transmission", tasks: ["Type a short message and press Send A → B. Watch each character become 8 bits.", "Tick Add noise and send again. Which characters arrive wrong, and why?", "Switch Mode to Simplex and press Reply B → A. What happens?"] }],
    "components": [{ id: "v-components", intro: "Light up the five components — message, sender, receiver, medium and protocol — then see what happens without a common protocol." },
      { id: "s-protocol", tasks: ["Send “HELLO” with both sides using ASCII and confirm the receiver reads it correctly.", "Set the receiver to EBCDIC. What does the receiver see, and which component has failed?", "Try UTF-8 vs ASCII with only English letters. Why does it still work? Now add “₹” and observe."] }],
    "data-flow": [{ id: "v-duplex", intro: "Compare simplex, half-duplex and full-duplex links side by side." },
      { id: "transmission", params: { mode: "half" }, tasks: ["In Half-duplex mode, press Send A → B and then immediately Reply B → A. Does B have to wait?", "Switch to Full-duplex and send in both directions at once. Compare the time taken.", "Switch to Simplex. Name two real devices that work this way."] }],
    "network-types": [{ id: "clientserver", intro: "See what happens between a client and a server when you open a website." },
      { id: "s-netscale", tasks: ["Set the distance to 80 m, then 20 km, then 2000 km. How does the network type change?", "At 2000 km, compare copper, fibre and satellite propagation delays.", "Explain from the numbers why WANs have long propagation delays."] }],
    "topologies": [{ id: "v-topologies", intro: "Watch a packet cross each topology, then see what one failure does to it." },
      { id: "topology", tasks: ["Choose Bus and click a backbone link to break it. Which PCs can still talk?", "Choose Star, break one PC's cable and send random packets. Who is affected?", "Choose Mesh and break two links. Does traffic still get through?", "Choose Ring, break one link and compare with Mesh. Use Repair all links between tries."] }],
    "media": [{ id: "v-mediatree", intro: "Build the guided/unguided classification and see a signal travel on each kind of medium." },
      { id: "s-attenuation", tasks: ["Send a signal 100 m over UTP and over single-mode fibre. Compare the received power.", "Find the distance at which UTP loses 99% of its power (20 dB).", "Increase the distance to 50 km. Which media can still deliver a usable signal?"] }],
    "devices": [{ id: "v-devices", intro: "See how a repeater, hub, bridge, switch, router and gateway each handle traffic." },
      { id: "switchlearn", tasks: ["Set Device to Hub and send PC-A → PC-C. Which PCs receive a copy?", "Set Device to Switch, clear the MAC table and send the same frame. Why is it flooded the first time?", "Send PC-C → PC-A, then PC-A → PC-C again. How is it forwarded now?", "Send a broadcast (FF:FF…). Does the switch forward it to every port?"] }],
    "osi": [{ id: "encapsulation", intro: "Step through encapsulation at the sender and decapsulation at the receiver." },
      { id: "osi", tasks: ["Click each layer from 7 down to 1 and note its data unit.", "Press Animate data flow and name the layers that add a header.", "Find the layer where routers work and the layer where switches work."] }],
    "tcpip": [{ id: "v-tcpipmap", intro: "Map the seven OSI layers onto the four TCP/IP layers, with the protocols at each." },
      { id: "s-packet", tasks: ["Click each header field in the table and find its bytes in the hex dump.", "Step through encapsulation and decapsulation. Which header does the receiver remove first?", "Switch Protocol to UDP. How many header bytes are saved?", "Change the TTL and watch the IP header checksum change."] }],
    "transmission": [{ id: "v-serialparallel", intro: "Send one byte serially and in parallel, and see why skew limits long parallel cables." },
      { id: "signals", tasks: ["Enter 10110010 and compare NRZ-L with Manchester. Which has a transition in every bit?", "Enter 00000000. Why can NRZ lose synchronisation on long runs of zeros?", "Switch Show to Modulation and compare ASK, FSK and PSK for the same bits."] }],
    "multiplexing": [{ id: "v-mux", intro: "Several inputs feed a MUX, share one link and are separated again by the DEMUX." },
      { id: "s-mux", tasks: ["Add a fourth input in FDM mode. How does the required link bandwidth change?", "Switch to synchronous TDM and make one input silent. What happens to its slot?", "Switch to statistical TDM with the same inputs and compare the efficiency."] }],
    "switching": [{ id: "v-switching", intro: "Send the same message with circuit, message and packet switching and compare the timing." },
      { id: "switching", tasks: ["Send a message with Circuit switching. What happens before the first data moves?", "Switch to Packet switching and send again. Do all packets arrive in order?", "Compare the total time shown for both methods."] }],
    "errors": [{ id: "v-crc", intro: "Watch the CRC long division, then see the receiver catch a flipped bit." },
      { id: "s-errordetect", tasks: ["Choose a 1-bit error. Which methods detect it?", "Choose a 2-bit error. Why does parity miss it?", "Choose Checksum blind spot. Which method misses it, and which still catches it?", "Click individual received bits to build your own error pattern."] }],
    "ip-addressing": [{ id: "v-ipclass", intro: "See how the first octet decides the class, the network/host split and the private ranges." },
      { id: "s-subnet", params: { ip: "172.16.5.20", prefix: 16 }, tasks: ["Enter 10.4.20.7 with /8 and read off the class, network address and host count.", "Try 192.168.1.25 with /24. Is it a private address?", "For 172.16.5.20, move the prefix from /16 to /20. How does the host count change?"] }],
    "subnetting": [{ id: "v-subnetting", intro: "Split 192.168.10.0/24 into four /26 subnets and find which one a host belongs to." },
      { id: "s-subnet", tasks: ["Use 192.168.10.77 /26 and confirm the network is 192.168.10.64.", "Change to /27. How many usable hosts per subnet now?", "Find the broadcast address of 10.1.5.200/22 and check it in the binary view."] }],
    "mac-arp": [{ id: "v-arp", intro: "Watch an ARP request broadcast, the unicast reply and the ARP cache in action." },
      { id: "switchlearn", tasks: ["Clear the MAC table and send a broadcast (FF:FF…) — ARP requests are broadcast like this.", "Send PC-A → PC-C, then PC-C → PC-A. Which MAC addresses has the switch learned?", "Set Device to Hub. Why would ARP still work, but less efficiently?"] }],
    "routing": [{ id: "v-hops", intro: "Follow a packet hop by hop: MAC addresses change, IP addresses stay, TTL counts down." },
      { id: "routing", tasks: ["Choose a source and destination and press Run Dijkstra. Follow the shortest path.", "Set the link action to break / repair, click a link on the path and run again.", "Press Random costs and predict the new shortest path before running."] }],
    "switching-vlan": [{ id: "v-vlan", intro: "See VLAN tags on a trunk keep two departments apart, and why routing is needed between them." },
      { id: "switchlearn", tasks: ["Clear the MAC table and send three frames. How does the table fill up?", "Send a broadcast. In a network with VLANs, which ports would receive it?", "Compare Hub and Switch for the same frame."] }],
    "tcp-udp": [{ id: "handshake", intro: "Watch the TCP three-way handshake, acknowledgements and retransmission, then compare with UDP." },
      { id: "s-packet", params: { proto: "TCP", flags: "2" }, tasks: ["With flags = SYN, which fields matter in the first handshake segment?", "Change the flags to SYN + ACK and then ACK. How does the flags byte change?", "Switch to UDP. Which fields disappear, and how long is the UDP header?"] }],
    "dns": [{ id: "dns", intro: "Follow a DNS query through the resolver, root, TLD and authoritative servers." },
      { id: "clientserver", tasks: ["Step to the DNS query. Which server answers, and with what?", "Find where the TCP handshake starts relative to the DNS reply.", "Switch between HTTP and HTTPS and count the extra round trips TLS adds."] }],
    "dhcp": [{ id: "dhcp", intro: "See how a new device gets an address with Discover, Offer, Request and Acknowledge." },
      { id: "s-dhcppool", tasks: ["Connect three devices and read the four DORA messages for each.", "Disconnect one device without releasing, then advance time until its lease expires.", "Fill the pool. What happens when an 11th device connects?", "Watch online devices renew at 50% of the lease time."] }],
    "http": [{ id: "clientserver", intro: "See the DNS lookup, TCP connection, TLS handshake and HTTP exchange behind one page load." },
      { id: "s-http", tasks: ["Send GET /index.html, then tick “cached copy” and send again. Why 304?", "Send DELETE /api/users/42 logged out, then logged in. Compare the status codes.", "Request /old-page and find the header that tells the browser where to go.", "Tick “server overloaded”. Which status class is returned?"] }],
    "security": [{ id: "v-tap", intro: "An eavesdropper tries to tap copper, wireless and fibre links — with and without encryption." },
      { id: "s-secure", tasks: ["Send a message over Wi-Fi with encryption off. What does the eavesdropper capture?", "Turn on AES encryption and send again. Can the eavesdropper read it now?", "Switch to fibre with encryption off. Why is it harder to tap, yet still not fully safe?"] }],
    "wireless": [{ id: "v-spectrum", intro: "Move along the spectrum and see how radio, microwave and infrared waves behave." },
      { id: "s-wireless", tasks: ["Compare free-space loss at 1 km for 100 MHz and 5 GHz. Which loses more, and by how much?", "Put a wall in the path and try each band. Which one is blocked completely?", "Find the antenna height needed for a 60 km microwave hop."] }]
  };
  (window.TOPICS || []).forEach(t => {
    if (t.unit || !MAP[t.id]) return;
    if (!("legacyViz" in t)) t.legacyViz = typeof t.viz === "string" ? t.viz : null;
    t.viz = MAP[t.id][0]; t.sim = MAP[t.id][1];
  });
  window.EXTRA_MAP = MAP;
})();
