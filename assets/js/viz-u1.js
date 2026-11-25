/* Unit I visualizations and simulations. Logic: SimLogic; drawing: VizKit. */
(function () {
  "use strict";
  const K = VizKit, L = SimLogic;
  const { C, txt, label, line, rr, arrowHead, shape, wrapText, metrics } = K;
  const { escapeHtml } = App;
  const R = (id, kind, cat, title, desc, run, params) => K.register(id, { kind, category: cat, title, desc, run, params: params || {} });
  const bits8 = s => Array.from(s).map(c => L.toBin(c.charCodeAt(0) & 255)).join(" ");

  /* ---------- v-dcflow : data → bits → signal → medium → bits → data ---------- */
  R("v-dcflow", "viz", "Unit I · Data Communication", "How Data Communication Works", "Follow a message from source to receiver through encoding, signalling, the medium and decoding.", env => K.flow(env, {
    height: 270,
    nodes: {
      src: { x: 0.07, y: 120, type: "pc", label: "Source" }, enc: { x: 0.28, y: 120, label: "Encoder", sub: "text → bits" },
      tx: { x: 0.5, y: 120, label: "Transmitter", sub: "bits → signal" }, dec: { x: 0.72, y: 120, label: "Decoder", sub: "signal → bits" },
      dst: { x: 0.93, y: 120, type: "pc", label: "Receiver" }
    },
    edges: [["src", "enc"], ["enc", "tx"], ["tx", "dec", { label: "transmission medium", ly: 26, w: 4, color: C.nav }], ["dec", "dst"]],
    stages: [
      { title: "The message", text: "The source has data to send: the text <b>“Hi”</b>. Creating this information is <i>not</i> part of data communication; moving it is.", hi: ["src"], labels: [{ at: "src", text: "“Hi”", color: C.primary, bg: C.pSoft }] },
      { title: "Encoding into bits", text: "Each character is converted to binary using an agreed code (ASCII): H = 01001000, i = 01101001.", hi: ["enc"], edges: [["src", "enc"]], move: [{ path: ["src", "enc"], label: "Hi", color: C.primary }], labels: [{ at: "enc", text: bits8("Hi"), color: C.blue, bg: C.bSoft, dy: -48 }] },
      { title: "Converting to a signal", text: "The transmitter turns the bits into a signal suited to the medium: voltage levels on copper, light pulses on fibre or radio waves in air.", hi: ["tx"], edges: [["enc", "tx"]], move: [{ path: ["enc", "tx"], label: "0100…", color: C.blue }] },
      { title: "Travelling over the medium", text: "The signal crosses the <b>transmission medium</b>. On the way it can be weakened (attenuation) or disturbed (noise). Preserving the data is part of data communication's job.", edges: [["tx", "dec"]], move: [{ path: ["tx", "dec"], label: "∿∿∿ signal", color: C.amber }], dur: 4 },
      { title: "Decoding", text: "The receiver's decoder samples the signal, recovers the bits and converts them back to characters using the <b>same</b> code (the protocol).", hi: ["dec"], edges: [["dec", "dst"]], move: [{ path: ["dec", "dst"], label: "Hi", color: C.primary }] },
      { title: "Delivered intact", text: "The receiver shows <b>“Hi”</b>. Delivery ✓ (right device), accuracy ✓ (no change), timeliness ✓ (on time). This is data communication.", hi: ["dst"], labels: [{ at: "dst", text: "“Hi” ✓", color: C.primary, bg: C.pSoft }] }
    ],
    extra(ctx, st, P) {
      if (st.i >= 2 && st.i <= 3) {
        const p = P("tx", st.W), bits = "0100100001101001", w = Math.min(150, st.W * 0.22), x0 = p.x - w / 2, y = p.y + 54;
        ctx.beginPath(); ctx.strokeStyle = C.blue; ctx.lineWidth = 2;
        for (let i = 0; i < bits.length; i++) { const yy = y - (bits[i] === "1" ? 12 : 0); const x = x0 + i * w / bits.length; if (i === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); ctx.lineTo(x + w / bits.length, yy); }
        ctx.stroke();
      }
    }
  }));

  /* ---------- v-components : five components ---------- */
  R("v-components", "viz", "Unit I · Data Communication", "Five Components of Data Communication", "Message, sender, receiver, medium and protocol light up one by one, ending with a protocol mismatch.", env => K.flow(env, {
    height: 300,
    nodes: {
      msg: { x: 0.5, y: 44, label: "Message", sub: "text / audio / video", w: 150 },
      snd: { x: 0.12, y: 150, type: "pc", label: "Sender" }, rcv: { x: 0.88, y: 150, type: "pc", label: "Receiver" },
      med: { x: 0.5, y: 150, label: "Transmission medium", sub: "wired or wireless", w: 170 },
      p1: { x: 0.12, y: 256, label: "Protocol", sub: "rules", w: 110 }, p2: { x: 0.88, y: 256, label: "Protocol", sub: "rules", w: 110 }
    },
    edges: [["snd", "med", { w: 5, color: C.nav }], ["med", "rcv", { w: 5, color: C.nav }], ["msg", "snd", { dash: [5, 5] }], ["msg", "rcv", { dash: [5, 5] }], ["snd", "p1", { dash: [3, 3] }], ["rcv", "p2", { dash: [3, 3] }]],
    stages: [
      { title: "Message", text: "The <b>message</b> is the information to be transmitted — a text file, audio file, video file, etc.", hi: ["msg"] },
      { title: "Sender", text: "The <b>sender</b> is the device that sends the message: a computer, mobile, telephone, laptop, video camera or workstation.", hi: ["snd"] },
      { title: "Transmission medium", text: "The <b>medium</b> (communication channel) connects the devices. It can be wired (cables) or wireless (radio, microwave, infrared).", hi: ["med"], edges: [["snd", "med"], ["med", "rcv"]], move: [{ path: ["snd", "med", "rcv"], label: "message", color: C.amber }] },
      { title: "Receiver", text: "The <b>receiver</b> is the device that receives the message: a computer, telephone, mobile or workstation.", hi: ["rcv"] },
      { title: "Protocol", text: "Both sides follow the same <b>protocol</b> — rules for syntax (format), semantics (meaning) and timing (when and how fast).", hi: ["p1", "p2"], labels: [{ x: 0.5, y: 256, text: "same rules on both sides", color: C.primary, bg: C.pSoft, dy: 0 }] },
      { title: "Without a common protocol…", text: "Sonali writes to Chetan in Hindi, but Chetan cannot read Hindi. The message is <b>delivered</b> but <b>meaningless</b>. Connection ≠ communication.", hi: ["p1", "p2"], move: [{ path: ["snd", "med", "rcv"], label: "नमस्ते", color: C.violet }], labels: [{ at: "rcv", text: "??? cannot understand", color: C.red, bg: C.rSoft, dy: -48 }] }
    ]
  }));

  /* ---------- v-duplex : simplex / half / full ---------- */
  R("v-duplex", "viz", "Unit I · Data Communication", "Simplex, Half-Duplex and Full-Duplex", "Three links run side by side so you can compare who may transmit, and when.", env => K.timeline(env, {
    height: 330,
    stages: [
      { title: "Simplex: one way only", text: "Data flows only from A to B. A is always the sender; B is always the receiver (keyboard → computer, TV broadcast)." },
      { title: "Simplex: B cannot reply", text: "B has no way to transmit — the link is <b>unidirectional</b>. The sender uses the whole capacity in one direction." },
      { title: "Half-duplex: A sends", text: "Both devices <i>can</i> send, but only one at a time. Now A is sending and B listens (walkie-talkie)." },
      { title: "Half-duplex: turnaround, then B sends", text: "A finishes (“over”), the line turns around, and B transmits. The turnaround wastes a little time." },
      { title: "Full-duplex: both at once", text: "Two channels: A and B send and receive <b>simultaneously</b> (telephone, mobile)." },
      { title: "Compare", text: "Channel usage: simplex 1, half-duplex 1 (shared in turns), full-duplex 2. Performance: full > half > simplex." }
    ],
    draw(ctx, st) {
      const { W, i, t } = st;
      const rows = [{ y: 70, name: "Simplex", key: "s" }, { y: 170, name: "Half-duplex", key: "h" }, { y: 270, name: "Full-duplex", key: "f" }];
      const ax = Math.max(70, W * 0.16), bx = W - Math.max(40, W * 0.08);
      rows.forEach(r => {
        const active = (r.key === "s" && i <= 1) || (r.key === "h" && (i === 2 || i === 3)) || (r.key === "f" && i === 4) || i === 5;
        ctx.globalAlpha = active ? 1 : 0.35;
        txt(ctx, r.name, 10, r.y - 34, { align: "left", weight: "700", size: 13, color: active ? C.ink : C.faint });
        shape(ctx, "box", ax, r.y, { w: 54, h: 34, label: "A" }); shape(ctx, "box", bx, r.y, { w: 54, h: 34, label: "B" });
        const x1 = ax + 30, x2 = bx - 30;
        if (r.key === "f") { line(ctx, x1, r.y - 9, x2, r.y - 9, C.line, 3); line(ctx, x1, r.y + 9, x2, r.y + 9, C.line, 3); }
        else line(ctx, x1, r.y, x2, r.y, C.line, 3);
        const pkt = (fromA, y, col, k) => { const p = (t * 1.3 + k * 0.33) % 1; const x = fromA ? x1 + (x2 - x1) * p : x2 - (x2 - x1) * p; rr(ctx, x - 9, y - 7, 18, 14, 3); ctx.fillStyle = col; ctx.fill(); };
        if (active) {
          if (r.key === "s") { [0, 1, 2].forEach(k => pkt(true, r.y, C.primary, k)); arrowHead(ctx, x2 - 40, r.y - 18, x2 - 10, r.y - 18, C.primary, 8); if (i === 1 || i === 5) label(ctx, "✕ B → A not possible", (x1 + x2) / 2, r.y + 26, { color: C.red, border: C.red, size: 11 }); }
          if (r.key === "h") {
            const phase = i === 2 ? "A" : i === 3 ? (t < 0.25 ? "turn" : "B") : (Math.floor(st.time / 2) % 2 ? "B" : "A");
            if (phase === "A") [0, 1].forEach(k => pkt(true, r.y, C.blue, k));
            if (phase === "B") [0, 1].forEach(k => pkt(false, r.y, C.violet, k));
            label(ctx, phase === "turn" ? "turnaround…" : phase + " is sending", (x1 + x2) / 2, r.y + 26, { color: phase === "B" ? C.violet : C.blue, border: C.line, size: 11 });
          }
          if (r.key === "f") { [0, 1].forEach(k => pkt(true, r.y - 9, C.blue, k)); [0, 1].forEach(k => pkt(false, r.y + 9, C.violet, k)); label(ctx, "both directions at the same time", (x1 + x2) / 2, r.y + 32, { color: C.primary, border: C.line, size: 11 }); }
        }
        ctx.globalAlpha = 1;
      });
    }
  }));

  /* ---------- v-serialparallel ---------- */
  R("v-serialparallel", "viz", "Unit I · Data Communication", "Serial vs Parallel Transmission", "One byte travels bit-by-bit on one wire, then all at once on eight wires — and skew appears on long parallel cables.", env => {
    const byte = "10110010";
    return K.timeline(env, {
      height: 360,
      stages: [
        { title: "The byte to send", text: "The sender has one byte, <code>10110010</code>, to move to the receiver." },
        { title: "Serial: one bit per clock", text: "On a single wire the bits leave one after another: 8 clock ticks for 8 bits. Cheap, one line, suitable for long distances.", dur: 5 },
        { title: "Parallel: eight bits per clock", text: "Eight wires carry all 8 bits at the same time: the byte arrives in 1 clock tick. Fast per clock, but needs many wires.", dur: 3.5 },
        { title: "Skew on a long parallel cable", text: "Each wire has a slightly different delay. Over a long cable the bits arrive at different times (<b>skew</b>). If the receiver samples while some bits are still on the way, it reads wrong values (red).", dur: 4.5 },
        { title: "Why serial wins at high speed", text: "Serial links have no skew or crosstalk <i>between</i> lines, so they can be clocked much faster. That is why USB, SATA, PCIe and Ethernet are serial." }
      ],
      draw(ctx, st) {
        const { W, i, t, e } = st;
        const sx = Math.max(60, W * 0.12), rx = W - Math.max(60, W * 0.12);
        shape(ctx, "box", sx - 20, 180, { w: 70, h: 250, label: "" }); txt(ctx, "Sender", sx - 20, 46, { weight: "700" });
        shape(ctx, "box", rx + 20, 180, { w: 70, h: 250, label: "" }); txt(ctx, "Receiver", rx + 20, 46, { weight: "700" });
        const x1 = sx + 16, x2 = rx - 16;
        if (i === 0) { for (let b = 0; b < 8; b++) label(ctx, byte[b], sx - 20, 80 + b * 26, { mono: true, size: 13, bg: byte[b] === "1" ? C.pSoft : "#fff" }); return; }
        if (i === 1 || i === 4) {
          const y = 180; line(ctx, x1, y, x2, y, C.nav, 3); txt(ctx, "1 wire", (x1 + x2) / 2, y + 22, { color: C.soft, size: 11 });
          for (let b = 0; b < 8; b++) {
            const start = b / 9, k = Math.max(0, Math.min(1, (t - start) / 0.35));
            if (t < start) { label(ctx, byte[b], sx - 20, 80 + b * 26, { mono: true, size: 13 }); continue; }
            const x = x1 + (x2 - x1) * k;
            label(ctx, byte[b], k >= 1 ? rx + 20 : x, k >= 1 ? 80 + b * 26 : y, { mono: true, size: 13, bg: C.pSoft, border: C.primary });
          }
          txt(ctx, "clock ticks used: " + Math.min(8, Math.ceil(t * 9)), W / 2, 330, { weight: "600", color: C.primary });
        } else {
          const skew = i === 3;
          for (let b = 0; b < 8; b++) {
            const y = 80 + b * 26; line(ctx, x1, y, x2, y, C.nav, 2);
            const delay = skew ? [0, 0.12, 0.05, 0.22, 0.02, 0.3, 0.09, 0.17][b] : 0;
            const k = Math.max(0, Math.min(1, (e - delay) / (1 - (skew ? 0.3 : 0))));
            const late = skew && t > 0.82 && k < 1;
            label(ctx, byte[b], x1 + (x2 - x1) * k, y, { mono: true, size: 13, bg: late ? C.rSoft : C.bSoft, border: late ? C.red : C.blue, color: late ? C.red : C.ink });
          }
          if (skew) { line(ctx, x2 - 6, 64, x2 - 6, 290, C.red, 1.5, [4, 4]); txt(ctx, "sampling instant", x2 - 6, 304, { color: C.red, size: 11 }); }
          txt(ctx, skew ? "8 wires, long cable → skew" : "8 wires → 1 clock tick", W / 2, 330, { weight: "600", color: skew ? C.red : C.blue });
        }
      }
    });
  });

  /* ---------- v-netscale : local loop → LAN → MAN → WAN ---------- */
  R("v-netscale", "viz", "Unit I · Data Communication", "Local Loop, LAN, MAN and WAN", "A request travels from a home over the local loop and through LAN, MAN and WAN scales.", env => K.flow(env, {
    height: 300,
    nodes: {
      home: { x: 0.07, y: 150, type: "house", label: "Home" }, co: { x: 0.26, y: 150, type: "office", label: "Central office" },
      man: { x: 0.46, y: 150, type: "router", label: "City MAN", sub: "5–50 km" }, wan: { x: 0.66, y: 150, type: "cloud", label: "WAN / Internet", sub: "> 50 km" },
      lanR: { x: 0.84, y: 150, type: "router", label: "Campus router" }, sw: { x: 0.84, y: 250, type: "switch", label: "LAN switch" },
      srv: { x: 0.95, y: 70, type: "server", label: "Server" }, pc2: { x: 0.7, y: 262, type: "pc" }
    },
    edges: [["home", "co", { label: "local loop", ly: -18, color: C.amber }], ["co", "man"], ["man", "wan"], ["wan", "lanR"], ["lanR", "sw"], ["lanR", "srv"], ["sw", "pc2"]],
    stages: [
      { title: "The local loop — the last mile", text: "The home connects to the telephone company's <b>central office</b> over the local loop (copper twisted pair, or fibre/wireless today). It carries voice and DSL/fibre data.", hi: ["home", "co"], edges: [["home", "co"]], move: [{ path: ["home", "co"], label: "request", color: C.amber }] },
      { title: "MAN — across the city", text: "The central office forwards traffic over a <b>Metropolitan Area Network</b> (5–50 km) that links sites across a city and may act as an ISP.", hi: ["man"], edges: [["co", "man"]], move: [{ path: ["co", "man"], label: "request", color: C.amber }] },
      { title: "WAN — across the country", text: "The <b>Wide Area Network</b> (above 50 km) joins cities and countries — high-speed but expensive, with longer propagation delay.", hi: ["wan"], edges: [["man", "wan"]], move: [{ path: ["man", "wan"], label: "request", color: C.amber }] },
      { title: "LAN — inside the campus", text: "At the destination, a <b>router</b> at the LAN boundary passes the request into the campus <b>Local Area Network</b>, where switches connect devices with private addresses.", hi: ["lanR", "sw", "srv"], edges: [["wan", "lanR"], ["lanR", "srv"]], move: [{ path: ["wan", "lanR", "srv"], label: "request", color: C.amber }] },
      { title: "The reply comes back", text: "The server's reply retraces the path: LAN → WAN → MAN → central office → local loop → home. The further it travels, the larger the delay.", hi: ["home"], move: [{ path: ["srv", "lanR", "wan", "man", "co", "home"], label: "reply", color: C.primary }], dur: 4.5 }
    ]
  }));

  /* ---------- v-criteria ---------- */
  R("v-criteria", "viz", "Unit I · Data Communication", "Network Criteria in Action", "Performance, reliability and security demonstrated on a small network.", env => K.flow(env, {
    height: 300,
    nodes: { a: { x: 0.1, y: 150, type: "pc", label: "Host A" }, r1: { x: 0.4, y: 80, type: "router", label: "R1" }, r2: { x: 0.4, y: 230, type: "router", label: "R2" }, b: { x: 0.85, y: 150, type: "server", label: "Host B" }, eve: { x: 0.62, y: 270, type: "pc", label: "Attacker", hidden: true, stroke: C.red } },
    edges: [["a", "r1"], ["a", "r2"], ["r1", "b"], ["r2", "b"], ["eve", "r2", { dash: [4, 4], color: C.red }]],
    stages: [
      { title: "Performance: bandwidth and latency", text: "Data moves from A to B. <b>Bandwidth</b> limits how fast bits leave; <b>latency</b> is the delay to arrive; <b>throughput</b> is what is actually delivered.", edges: [["a", "r1"], ["r1", "b"]], move: [{ path: ["a", "r1", "b"], label: "pkt 1", color: C.blue }, { path: ["a", "r1", "b"], label: "pkt 2", color: C.blue, start: 0.25, span: 0.75 }], labels: [{ at: "b", text: "latency ≈ 12 ms", color: C.blue, bg: C.bSoft }] },
      { title: "Performance: packet loss", text: "A packet dropped on the way reduces throughput and must be resent — performance falls.", move: [{ path: ["a", "r1", "b"], label: "pkt 3", color: C.red, span: 0.5, vanish: true }], labels: [{ at: "r1", text: "✕ packet lost", color: C.red, bg: C.rSoft }] },
      { title: "Reliability: a link fails", text: "The R1–B link breaks. A reliable network has <b>minimal downtime</b>: traffic is rerouted through R2 (robustness).", broken: [["r1", "b"]], edges: [["a", "r2"], ["r2", "b"]], move: [{ path: ["a", "r2", "b"], label: "rerouted", color: C.primary }] },
      { title: "Security: an eavesdropper", text: "An attacker taps the R2 path. With <b>access control</b> and encryption (data protection), they capture only unreadable ciphertext.", hi: ["eve"], edges: [["r2", "b"]], move: [{ path: ["a", "r2", "b"], label: "🔒 encrypted", color: C.violet }], labels: [{ at: "eve", text: "sees: x9#Qz…", color: C.red, bg: C.rSoft, dy: 36 }] },
      { title: "Other criteria", text: "<b>Scalability</b> (more users), <b>cost</b>, <b>manageability</b> and <b>flexibility</b> also decide whether a network design is good.", hi: ["a", "b", "r1", "r2"] }
    ]
  }));

  /* ---------- v-modem ---------- */
  R("v-modem", "viz", "Unit I · Modems", "How a Modem Works", "Digital bits are modulated into tones on the phone line and demodulated back into bits.", env => {
    const bits = "10110010", sy = L.toSymbols(bits, "FSK");
    const r = L.rng(5);
    const noise = Array.from({ length: 800 }, () => L.gauss(r) * 0.25);
    return K.waves(env, {
      rowH: 78,
      stages: [
        { title: "Computer output: digital bits", text: "The computer (DTE) sends <code>10110010</code> as two voltage levels — a digital signal the telephone line cannot carry.", rows: [{ label: "Digital bits", bits, f: x => L.sig.nrz(bits, x), color: C.ink }] },
        { title: "Modulation (FSK tones)", text: "The sending modem (DCE) <b>modulates</b>: a high-frequency tone for 1 (mark) and a low one for 0 (space). These tones fit in the voice band.", rows: [{ label: "Digital bits", bits, f: x => L.sig.nrz(bits, x), color: C.ink }, { label: "Analog tones on line", bits, showBits: false, f: x => L.modWave("FSK", sy, x, 3), color: C.blue }] },
        { title: "Across the telephone line", text: "The analog signal crosses the telephone network and picks up some noise on the way.", rows: [{ label: "Analog tones on line", bits, showBits: false, f: x => L.modWave("FSK", sy, x, 3), color: C.blue }, { label: "Received (with noise)", bits, showBits: false, f: x => Math.max(-1, Math.min(1, L.modWave("FSK", sy, x, 3) * 0.8 + noise[Math.floor(x * 799)])), color: C.amber }] },
        { title: "Demodulation back to bits", text: "The receiving modem <b>demodulates</b>: it measures which tone is present in each bit period and outputs <code>10110010</code> to the computer.", rows: [{ label: "Received (with noise)", bits, showBits: false, f: x => Math.max(-1, Math.min(1, L.modWave("FSK", sy, x, 3) * 0.8 + noise[Math.floor(x * 799)])), color: C.amber }, { label: "Recovered bits", bits, f: x => L.sig.nrz(bits, x), color: C.primary }] }
      ]
    });
  });

  /* ---------- v-modemtypes ---------- */
  R("v-modemtypes", "viz", "Unit I · Modems", "Modem Types and Placement", "Internal vs external modems, and the medium each modem type connects to.", env => K.flow(env, {
    height: 320,
    nodes: {
      pc: { x: 0.1, y: 160, type: "pc", label: "Computer" }, card: { x: 0.1, y: 245, type: "chip", label: "Internal modem", sub: "PCI/PCIe slot", hidden: true },
      ext: { x: 0.33, y: 160, type: "modem", label: "External modem", sub: "USB / RS-232", hidden: true },
      tel: { x: 0.6, y: 50, label: "Dial-up", sub: "telephone line" }, coax: { x: 0.6, y: 125, label: "Cable modem", sub: "cable TV coax" },
      fibre: { x: 0.6, y: 200, label: "Optical modem", sub: "fibre (light)" }, sat: { x: 0.6, y: 275, label: "Satellite modem", sub: "dish + radio" },
      isp: { x: 0.9, y: 160, type: "cloud", label: "ISP / Internet" }
    },
    edges: [["pc", "card"], ["pc", "ext"], ["ext", "tel"], ["ext", "coax"], ["ext", "fibre"], ["ext", "sat"], ["tel", "isp"], ["coax", "isp"], ["fibre", "isp"], ["sat", "isp"]],
    stages: [
      { title: "Internal modem", text: "Built into the computer in an expansion slot (PCI/PCIe). It uses the computer's power supply and has its own UART. Cheaper and less likely to be stolen — but harder to move.", hi: ["card", "pc"], edges: [["pc", "card"]] },
      { title: "External modem", text: "A separate box connected by USB or an RS-232 serial cable, with its own power supply. Portable, works with any PC, shows status lights — but costs more.", hi: ["ext"], show: ["card"], edges: [["pc", "ext"]] },
      { title: "Dial-up modem", text: "Converts digital data into tones over the analog telephone line — up to 56 kbit/s.", hi: ["tel"], show: ["ext"], edges: [["ext", "tel"], ["tel", "isp"]], move: [{ path: ["pc", "ext", "tel", "isp"], label: "data", color: C.amber }] },
      { title: "Cable modem", text: "Accesses high-speed data through the cable TV network (coaxial cable), sharing it with TV channels.", hi: ["coax"], show: ["ext"], edges: [["ext", "coax"], ["coax", "isp"]], move: [{ path: ["pc", "ext", "coax", "isp"], label: "data", color: C.amber }] },
      { title: "Optical modem", text: "Uses optical fibre instead of metal: digital data becomes pulses of light. Very high speed and low loss.", hi: ["fibre"], show: ["ext"], edges: [["ext", "fibre"], ["fibre", "isp"]], move: [{ path: ["pc", "ext", "fibre", "isp"], label: "light", color: C.primary }] },
      { title: "Satellite modem", text: "Converts bits into radio signals sent to a satellite dish — Internet anywhere, but with high latency.", hi: ["sat"], show: ["ext"], edges: [["ext", "sat"], ["sat", "isp"]], move: [{ path: ["pc", "ext", "sat", "isp"], label: "radio", color: C.violet }] }
    ]
  }));

  /* ===================== SIMULATIONS ===================== */

  /* ---------- s-protocol : encoding agreement ---------- */
  function encodeAs(text, code) {
    const out = [];
    Array.from(text).forEach(ch => {
      if (code === "UTF-8") L.utf8Bytes(ch).forEach(b => out.push({ ch, b }));
      else if (code === "EBCDIC") { const v = L.toEbcdic(ch); out.push({ ch, b: v === null ? 0x6F : v, bad: v === null }); }
      else { const v = ch.charCodeAt(0); out.push({ ch, b: v < 128 ? v : 0x3F, bad: v >= 128 }); }
    });
    return out;
  }
  function decodeAs(bytes, code) {
    if (code === "UTF-8") { try { return new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(bytes)); } catch (e) { return "?"; } }
    return bytes.map(b => { if (code === "EBCDIC") return L.fromEbcdic(b) || "·"; return b >= 32 && b < 127 ? String.fromCharCode(b) : "·"; }).join("");
  }
  R("s-protocol", "sim", "Unit I · Data Communication", "Protocol Agreement Lab", "Choose the character code at each end and see why sender and receiver must follow the same rules.", env => K.controls(env, {
    dom: true,
    controls: [
      { id: "text", type: "text", label: "Message", value: "HELLO", max: 24, width: 140 },
      { id: "tx", type: "select", label: "Sender encodes with", options: ["ASCII", "EBCDIC", "UTF-8"], value: "ASCII" },
      { id: "rx", type: "select", label: "Receiver decodes with", options: ["ASCII", "EBCDIC", "UTF-8"], value: "ASCII" }
    ],
    compute(s) {
      const enc = encodeAs(s.text || "", s.tx);
      const bytes = enc.map(e => e.b);
      return { enc, bytes, decoded: decodeAs(bytes, s.rx) };
    },
    dom(stage, s) {
      const o = s.out, ok = o.decoded === s.text;
      stage.innerHTML = '<div class="lab">' +
        '<div class="lab-row"><span class="lab-tag">Sender (' + s.tx + ')</span><div class="byte-row">' + o.enc.map(e => '<span class="byte' + (e.bad ? " bad" : "") + '"><b>' + escapeHtml(e.ch) + "</b><code>" + e.b.toString(16).toUpperCase().padStart(2, "0") + "</code><small>" + L.toBin(e.b) + "</small></span>").join("") + "</div></div>" +
        '<div class="lab-arrow">— same bits travel over the medium —→</div>' +
        '<div class="lab-row"><span class="lab-tag">Receiver (' + s.rx + ')</span><div class="lab-out ' + (ok ? "ok" : "bad") + '">' + escapeHtml(o.decoded || "—") + "</div></div></div>";
    },
    readout(s) {
      const o = s.out, ok = o.decoded === s.text;
      const unsupported = o.enc.some(e => e.bad);
      return (ok ? '<b style="color:var(--primary)">Communication succeeded.</b> Both ends follow the same code, so the receiver reconstructs the exact message.'
        : '<b style="color:var(--red)">Delivered but not understood.</b> The bytes arrived intact, but the receiver interprets them with different rules — the protocol component is missing.') +
        (unsupported ? '<br><span class="muted">Some characters do not exist in ' + s.tx + " and were replaced by “?”.</span>" : "") +
        metrics([["Characters", Array.from(s.text || "").length], ["Bytes sent", o.bytes.length], ["Codes match?", s.tx === s.rx ? "Yes" : "No"]]);
    }
  }));

  /* ---------- s-serialparallel ---------- */
  R("s-serialparallel", "sim", "Unit I · Data Communication", "Serial vs Parallel Lab", "Change the clock rate, number of lines and cable length to see when parallel transfer breaks because of skew.", env => K.controls(env, {
    height: 300,
    controls: [
      { id: "clock", type: "select", label: "Clock", options: [["1e6", "1 MHz"], ["1e7", "10 MHz"], ["1e8", "100 MHz"], ["5e8", "500 MHz"], ["1e9", "1 GHz"]], value: "1e8" },
      { id: "lines", type: "select", label: "Parallel lines", options: [["8", "8"], ["16", "16"], ["32", "32"]], value: "8" },
      { id: "dist", type: "range", label: "Cable length", min: 0.1, max: 20, step: 0.1, value: 1, unit: "m" },
      { id: "skew", type: "range", label: "Skew per metre", min: 10, max: 200, step: 10, value: 50, unit: "ps/m" }
    ],
    compute(s) { return L.serialParallel({ bits: 8 * 1024, lines: +s.lines, clockHz: +s.clock, distM: s.dist, skewPsPerM: s.skew }); },
    draw(ctx, s, { W, H }) {
      const o = s.out, n = +s.lines, show = Math.min(n, 8);
      const x1 = 90, x2 = W - 30;
      txt(ctx, "Arrival time of each parallel bit within one bit period", W / 2, 16, { weight: "600", size: 12, color: C.soft });
      const period = o.bitPeriodPs;
      for (let k = 0; k < show; k++) {
        const y = 44 + k * 26, delayPs = o.skewPs * ((k * 37) % 10) / 9;
        txt(ctx, "line " + (k + 1), 10, y, { align: "left", size: 11, color: C.soft });
        line(ctx, x1, y, x2, y, "#e3e8ee", 6);
        const frac = Math.min(1.2, delayPs / period), x = x1 + (x2 - x1) * Math.min(1, frac);
        const bad = delayPs > period / 2;
        ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fillStyle = bad ? C.red : C.primary; ctx.fill();
      }
      const mid = x1 + (x2 - x1) * 0.5;
      line(ctx, mid, 30, mid, 44 + show * 26, C.red, 1.5, [4, 4]); txt(ctx, "receiver samples here (½ bit)", mid, 52 + show * 26, { size: 11, color: C.red });
      txt(ctx, "0", x1, 30, { size: 10, color: C.faint }); txt(ctx, "1 bit period = " + (period >= 1000 ? (period / 1000).toFixed(1) + " ns" : period.toFixed(0) + " ps"), x2 - 60, 30, { size: 10, color: C.faint });
    },
    readout(s) {
      const o = s.out, f = v => v < 1e-3 ? (v * 1e6).toFixed(2) + " µs" : (v * 1e3).toFixed(3) + " ms";
      return (o.parallelOk ? '<b style="color:var(--primary)">Parallel transfer works.</b> Skew (' + o.skewPs.toFixed(0) + " ps) is below half a bit period."
        : '<b style="color:var(--red)">Parallel transfer fails.</b> Skew (' + o.skewPs.toFixed(0) + " ps) exceeds half a bit period, so bits are sampled in the wrong clock. Shorten the cable or slow the clock — or use serial.") +
        metrics([["Serial time for 1 KB", f(o.serialTime)], ["Parallel time for 1 KB", f(o.parallelTime)], ["Skew / bit period", (o.skewRatio * 100).toFixed(1) + "%", "", o.parallelOk ? "" : "warn"]]) +
        '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Simplified model: wire delays differ by up to the skew value. Real buses also suffer crosstalk.</p>';
    }
  }));

  /* ---------- s-netscale ---------- */
  const toDist = v => Math.pow(10, v / 100 * 7.3); // 1 m .. 20,000 km
  R("s-netscale", "sim", "Unit I · Data Communication", "Network Scale and Delay Calculator", "Drag the distance to see whether a link is a LAN, MAN or WAN, and how propagation delay grows over copper, fibre and satellite paths.", env => K.controls(env, {
    height: 230, animate: true,
    controls: [
      { id: "d", type: "range", label: "Distance", min: 0, max: 100, step: 1, value: 55, fmt: v => { const m = toDist(v); return m < 1000 ? m.toFixed(0) + " m" : (m / 1000).toFixed(m < 1e4 ? 1 : 0) + " km"; } },
      { id: "medium", type: "select", label: "Medium", options: [["copper", "Copper cable"], ["fibre", "Optical fibre"], ["sat", "GEO satellite hop"]], value: "fibre" }
    ],
    compute(s) {
      const d = toDist(s.d), v = s.medium === "copper" ? 0.66 * L.C_LIGHT : s.medium === "fibre" ? L.C_LIGHT / 1.468 : L.C_LIGHT;
      const path = s.medium === "sat" ? 2 * 35786e3 + d * 0 : d;
      return { d, type: L.classifyNetwork(d), oneWayMs: path / v * 1000 };
    },
    draw(ctx, s, { W, time }) {
      const o = s.out, x1 = 30, x2 = W - 30, y = 70;
      const pos = m => x1 + (x2 - x1) * Math.max(0, Math.min(1, Math.log10(Math.max(1, m)) / 7.3));
      [["PAN", 0, 10, "#ede9fe"], ["LAN", 10, 1000, C.pSoft], ["MAN", 1000, 50000, C.bSoft], ["WAN", 50000, 2e7, C.aSoft]].forEach(([n, a, b, col]) => {
        const xa = pos(Math.max(1, a)), xb = pos(b); ctx.fillStyle = col; ctx.fillRect(xa, y - 22, xb - xa, 44);
        txt(ctx, n, (xa + xb) / 2, y, { weight: "700", color: C.soft });
      });
      ["1 m", "10 m", "100 m", "1 km", "10 km", "100 km", "1000 km", "10⁴ km"].forEach((l, k) => { const x = x1 + (x2 - x1) * k / 7.3; line(ctx, x, y + 22, x, y + 28, C.faint, 1); txt(ctx, l, x, y + 38, { size: 10, color: C.faint }); });
      const mx = pos(o.d); line(ctx, mx, y - 32, mx, y + 26, C.red, 2.5); label(ctx, o.type, mx, y - 40, { color: "#fff", bg: C.red, border: C.red, size: 11 });
      const py = 170; device(ctx, "pc", 50, py, {}); device(ctx, "server", W - 50, py, {});
      line(ctx, 80, py, W - 80, py, s.medium === "fibre" ? C.primary : s.medium === "copper" ? C.amber : C.violet, 3, s.medium === "sat" ? [6, 6] : null);
      const period = Math.max(0.6, Math.min(4, o.oneWayMs / 20));
      const k = (time / period) % 1; rr(ctx, 80 + (W - 160) * k - 10, py - 8, 20, 16, 3); ctx.fillStyle = C.blue; ctx.fill();
      txt(ctx, "packet animation is slowed to be visible", W / 2, py + 34, { size: 10.5, color: C.faint });
    },
    readout(s) {
      const o = s.out, f = ms => ms < 1 ? (ms * 1000).toFixed(2) + " µs" : ms.toFixed(2) + " ms";
      return "<b>" + o.type + "</b> — " + ({ PAN: "a personal area network around one person.", LAN: "a local area network in a building or campus.", MAN: "a metropolitan network across a city (5–50 km).", WAN: "a wide area network across states or countries (> 50 km)." })[o.type] +
        metrics([["One-way propagation delay", f(o.oneWayMs)], ["Round-trip time (propagation only)", f(o.oneWayMs * 2)], ["Signal speed", s.medium === "copper" ? "≈ 0.66 c" : s.medium === "fibre" ? "≈ 0.68 c" : "≈ c (via 35,786 km orbit)"]]) +
        (s.medium === "sat" ? '<p class="muted" style="font-size:.85rem;margin:6px 0 0">A GEO hop adds ≈ 2 × 35,786 km regardless of ground distance.</p>' : "");
    }
  }));
  function device(ctx, t, x, y, o) { K.device(ctx, t, x, y, o); }

  /* ---------- s-criteria ---------- */
  R("s-criteria", "sim", "Unit I · Data Communication", "Network Performance Calculator", "Calculate transmission delay, propagation delay, total latency and effective throughput.", env => K.controls(env, {
    height: 220,
    controls: [
      { id: "bytes", type: "range", label: "Packet size", min: 64, max: 9000, step: 64, value: 1536, unit: "bytes" },
      { id: "rate", type: "select", label: "Bandwidth", options: [["1e6", "1 Mbit/s"], ["1e7", "10 Mbit/s"], ["1e8", "100 Mbit/s"], ["1e9", "1 Gbit/s"]], value: "1e7" },
      { id: "km", type: "range", label: "Distance", min: 1, max: 10000, step: 1, value: 1000, unit: "km" },
      { id: "hops", type: "range", label: "Hops", min: 1, max: 10, step: 1, value: 1 },
      { id: "loss", type: "range", label: "Packet loss", min: 0, max: 20, step: 1, value: 0, unit: "%" }
    ],
    compute(s) { return L.linkDelays({ bytes: s.bytes, rateBps: +s.rate, distM: s.km * 1000, velocity: 2e8, lossPct: s.loss, hops: s.hops }); },
    draw(ctx, s, { W }) {
      const o = s.out, total = o.totalMs, x0 = 150, w = W - x0 - 40;
      const bars = [["Transmission", o.txMs * s.hops, C.blue], ["Propagation", o.propMs, C.amber], ["Total latency", total, C.primary]];
      const max = Math.max.apply(null, bars.map(b => b[1])) || 1;
      bars.forEach(([n, v, col], k) => {
        const y = 40 + k * 52; txt(ctx, n, 12, y, { align: "left", weight: "600" });
        rr(ctx, x0, y - 14, Math.max(3, w * v / max), 28, 5); ctx.fillStyle = col; ctx.fill();
        txt(ctx, v.toFixed(3) + " ms", x0 + Math.max(3, w * v / max) + 6, y, { align: "left", size: 12, color: C.soft });
      });
      txt(ctx, "Transmission delay is counted once per hop (store-and-forward).", W / 2, 196, { size: 11, color: C.faint });
    },
    readout(s) {
      const o = s.out, gp = o.goodputBps;
      const dominant = o.txMs * s.hops > o.propMs ? "transmission (packet size ÷ bandwidth)" : "propagation (distance ÷ signal speed)";
      return "The dominant delay here is <b>" + dominant + "</b>." +
        metrics([["Transmission per hop", o.txMs.toFixed(3) + " ms"], ["Propagation", o.propMs.toFixed(3) + " ms"], ["Total one-way latency", o.totalMs.toFixed(3) + " ms"], ["Effective throughput", (gp >= 1e6 ? (gp / 1e6).toFixed(2) + " Mbit/s" : (gp / 1e3).toFixed(1) + " kbit/s"), s.loss + "% lost"]]) +
        '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Formulas: transmission = L/R; propagation = d/(2×10⁸ m/s); throughput ≈ R × (1 − loss). Queuing and processing delays are ignored.</p>';
    }
  }));

  /* ---------- s-modem ---------- */
  function modemRun(scheme, bits, snrDb, seed) {
    const r = L.rng(seed), N = 48, sigma = Math.sqrt(0.5 / Math.pow(10, snrDb / 10));
    const samples = [], out = [];
    bits.split("").forEach(b => {
      const one = b === "1"; let e1 = 0, e0 = 0, corr = 0;
      for (let k = 0; k < N; k++) {
        const ph = 2 * Math.PI * k / N;
        const clean = scheme === "ASK" ? (one ? Math.sin(2 * ph) : 0) : scheme === "FSK" ? Math.sin((one ? 4 : 2) * ph) : Math.sin(2 * ph + (one ? 0 : Math.PI));
        const v = clean + sigma * L.gauss(r); samples.push({ clean, v });
        e1 += v * Math.sin(4 * ph); e0 += v * Math.sin(2 * ph); corr += v * Math.sin(2 * ph);
      }
      let d;
      if (scheme === "ASK") d = Math.abs(corr) / N > 0.25 ? "1" : "0";
      else if (scheme === "FSK") d = Math.abs(e1) > Math.abs(e0) ? "1" : "0";
      else d = corr >= 0 ? "1" : "0";
      out.push(d);
    });
    return { samples, out: out.join(""), errors: out.filter((d, i) => d !== bits[i]).length };
  }
  R("s-modem", "sim", "Unit I · Modems", "Modem Modulation Lab", "Choose ASK, FSK or PSK, add line noise, and see whether the receiving modem recovers your bits.", env => K.controls(env, {
    height: 300,
    controls: [
      { id: "bits", type: "text", label: "Bits", value: "10110010", max: 16, mono: true, sanitize: v => v.replace(/[^01]/g, "") || "0" },
      { id: "scheme", type: "select", label: "Modulation", options: [["ASK", "ASK (amplitude)"], ["FSK", "FSK (frequency)"], ["BPSK", "PSK (phase)"]], value: "FSK" },
      { id: "snr", type: "range", label: "Line SNR", min: -6, max: 30, step: 1, value: 20, unit: "dB" },
      { id: "seed", type: "button", label: "New noise", icon: "reset", onClick: s => { s.seedv = (s.seedv || 1) + 1; } }
    ],
    compute(s) { return modemRun(s.scheme, s.bits, s.snr, 11 + (s.seedv || 1)); },
    draw(ctx, s, { W }) {
      const o = s.out, n = s.bits.length, x0 = W < 560 ? 12 : 120, x1 = W - 14, bw = (x1 - x0) / n;
      const rows = [["Input bits", 50], ["Line signal (noisy)", 150], ["Demodulated", 250]];
      rows.forEach(([lbl, y]) => { if (W >= 560) txt(ctx, lbl, 10, y, { align: "left", weight: "700", size: 12 }); else txt(ctx, lbl, x0, y - 38, { align: "left", weight: "700", size: 11 }); });
      for (let i = 0; i <= n; i++) line(ctx, x0 + i * bw, 20, x0 + i * bw, 285, "#eef1f4", 1, [3, 3]);
      ctx.beginPath(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      for (let i = 0; i < n; i++) { const yy = s.bits[i] === "1" ? 34 : 66; if (i === 0) ctx.moveTo(x0, yy); else ctx.lineTo(x0 + i * bw, yy); ctx.lineTo(x0 + (i + 1) * bw, yy); }
      ctx.stroke();
      for (let i = 0; i < n; i++) txt(ctx, s.bits[i], x0 + (i + 0.5) * bw, 82, { mono: true, size: 11, color: C.soft });
      const N = o.samples.length;
      [["clean", "#c7d2fe"], ["v", C.blue]].forEach(([key, col]) => {
        ctx.beginPath(); ctx.strokeStyle = col; ctx.lineWidth = key === "v" ? 1.4 : 2;
        o.samples.forEach((p, k) => { const X = x0 + (x1 - x0) * k / N, Y = 150 - Math.max(-1.6, Math.min(1.6, p[key])) * 26; if (k === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
        ctx.stroke();
      });
      for (let i = 0; i < n; i++) { const bad = o.out[i] !== s.bits[i]; label(ctx, o.out[i], x0 + (i + 0.5) * bw, 250, { mono: true, size: 13, bg: bad ? C.rSoft : C.pSoft, border: bad ? C.red : C.primary, color: bad ? C.red : C.primary }); }
    },
    readout(s) {
      const o = s.out;
      return (o.errors ? '<b style="color:var(--red)">' + o.errors + " bit error" + (o.errors > 1 ? "s" : "") + ".</b> The noise was strong enough to change the receiver's decision." : '<b style="color:var(--primary)">All bits recovered.</b> The demodulator decided every bit correctly.') +
        metrics([["Scheme", s.scheme === "BPSK" ? "PSK (0°/180°)" : s.scheme], ["SNR", s.snr + " dB"], ["Bits sent", s.bits.length], ["Errors", o.errors, "", o.errors ? "warn" : ""]]) +
        '<p class="muted" style="font-size:.85rem;margin:6px 0 0">Light blue = clean waveform; dark blue = what arrives with noise. PSK usually survives the most noise, ASK the least.</p>';
    }
  }));

  /* ---------- s-modemtypes ---------- */
  const MODEMS = [["Dial-up (56 kbit/s)", 0.056e6, 150, C.red], ["DSL (16 Mbit/s)", 16e6, 25, C.amber], ["Cable (300 Mbit/s)", 300e6, 15, C.blue], ["Fibre (500 Mbit/s)", 500e6, 5, C.primary], ["Satellite GEO (50 Mbit/s)", 50e6, 600, C.violet]];
  R("s-modemtypes", "sim", "Unit I · Modems", "Modem Speed Comparison", "Compare how long a download takes, and how much latency each modem type adds (typical values).", env => K.controls(env, {
    height: 260,
    controls: [{ id: "size", type: "select", label: "Download", options: [["5", "Song (5 MB)"], ["700", "Movie (700 MB)"], ["4000", "Game (4 GB)"]], value: "700" }],
    compute(s) { const bytes = +s.size * 1e6; return MODEMS.map(m => ({ name: m[0], t: L.transferTime(bytes, m[1], m[2]), lat: m[2], col: m[3] })); },
    draw(ctx, s, { W }) {
      const x0 = W < 560 ? 10 : 210, w = W - x0 - 120, max = Math.log10(Math.max.apply(null, s.out.map(o => o.t)) + 1);
      s.out.forEach((o, k) => {
        const y = 34 + k * 46;
        if (W >= 560) txt(ctx, o.name, 12, y, { align: "left", weight: "600", size: 12 }); else txt(ctx, o.name, x0, y - 18, { align: "left", weight: "600", size: 11 });
        const bw = Math.max(3, w * Math.log10(o.t + 1) / max);
        rr(ctx, x0, y - 10, bw, 20, 4); ctx.fillStyle = o.col; ctx.fill();
        txt(ctx, fmtT(o.t), x0 + bw + 8, y, { align: "left", size: 12, color: C.soft });
      });
      txt(ctx, "Bar length uses a logarithmic scale", W / 2, 252, { size: 10.5, color: C.faint });
    },
    readout(s) {
      return "<b>Download time</b> = size × 8 ÷ speed + latency. Typical values — real speeds vary by provider and plan." +
        '<div class="table-wrap" style="margin:8px 0 0"><table><thead><tr><th>Modem</th><th>Time</th><th>Latency (RTT)</th></tr></thead><tbody>' +
        s.out.map(o => "<tr><td>" + o.name + "</td><td>" + fmtT(o.t) + "</td><td>" + o.lat + " ms</td></tr>").join("") + "</tbody></table></div>";
    }
  }));
  function fmtT(sec) { if (sec < 60) return sec.toFixed(1) + " s"; if (sec < 3600) return (sec / 60).toFixed(1) + " min"; if (sec < 86400) return (sec / 3600).toFixed(1) + " h"; return (sec / 86400).toFixed(1) + " days"; }
})();
