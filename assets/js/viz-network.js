/* =========================================================
   Network simulations (original NetLab visualizer modules).
   Registered into VizKit so the Learn workflow and the Studio
   can both mount them.
   ========================================================= */
(function () {
  "use strict";
  const { C, FONT, MONO, makeCanvas, loop, rr, txt, label, line, arrowHead, device, pointOnPath, pathLen, distToSeg, speedSelect, btn, sequenceSim, register } = VizKit;
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

  /* =========================================================
     2. Packet formation / encapsulation (DOM based)
     ========================================================= */
  function simEncapsulation(env) {
    const { toolbar, stage, info } = env;
    toolbar.innerHTML = '<label>Data <input type="text" id="enMsg" value="GET /index.html" maxlength="24" style="width:150px"></label><span class="spacer"></span>' +
      btn("enPrev", "arrowL", "Back") + btn("enNext", "arrowR", "Next step", "btn-primary") + btn("enAuto", "play", "Auto play") + btn("enReset", "reset", "Reset");
    const LAYERS = [
      { n: "Application", c: "#6b46c1", pdu: "Data" },
      { n: "Transport", c: "#1f6fd1", pdu: "Segment" },
      { n: "Network", c: "#0b7a5c", pdu: "Packet" },
      { n: "Data Link", c: "#b7791f", pdu: "Frame" },
      { n: "Physical", c: "#c53030", pdu: "Bits" }
    ];
    const HDR = {
      tcp: { t: "TCP", c: "#1f6fd1", f: "Src Port: 49152 · Dst Port: 80 · Seq: 1001 · Flags: PSH,ACK" },
      ip: { t: "IP", c: "#0b7a5c", f: "Src IP: 192.168.1.10 · Dst IP: 93.184.216.34 · TTL: 64 · Protocol: TCP" },
      eth: { t: "ETH", c: "#b7791f", f: "Src MAC: 3C:52:82:1A:2B:3C · Dst MAC: 00:1F:9E:AA:01:FE (gateway) · Type: IPv4" },
      fcs: { t: "FCS", c: "#b7791f", f: "Frame Check Sequence (CRC-32) for error detection" }
    };
    const STEPS = [
      { side: "s", L: 0, pdu: ["data"], title: "Application layer creates the data", d: "The browser creates an HTTP request. At this point it is just application <b>data</b>." },
      { side: "s", L: 1, pdu: ["tcp", "data"], title: "Transport layer adds a TCP header → Segment", d: "TCP adds <b>port numbers</b> (so the right application receives it), a <b>sequence number</b> and flags." },
      { side: "s", L: 2, pdu: ["ip", "tcp", "data"], title: "Network layer adds an IP header → Packet", d: "IP adds the <b>source and destination IP addresses</b> so routers can forward it across networks." },
      { side: "s", L: 3, pdu: ["eth", "ip", "tcp", "data", "fcs"], title: "Data Link layer adds header + trailer → Frame", d: "Ethernet adds <b>MAC addresses</b> for the next hop and an <b>FCS trailer</b> (CRC) for error detection." },
      { side: "s", L: 4, pdu: ["bits"], title: "Physical layer converts the frame to bits", d: "The frame is sent as a stream of <b>bits</b> — electrical, light or radio signals on the medium." },
      { side: "r", L: 4, pdu: ["bits"], title: "Receiver's Physical layer receives the bits", d: "The receiving NIC converts the signal back into bits and hands the frame up." },
      { side: "r", L: 3, pdu: ["eth", "ip", "tcp", "data", "fcs"], title: "Data Link checks FCS, removes Ethernet header & trailer", d: "The CRC is checked. If it matches, the destination MAC is checked and the frame header/trailer are <b>removed</b>." },
      { side: "r", L: 2, pdu: ["ip", "tcp", "data"], title: "Network layer checks the IP, removes the IP header", d: "The destination IP matches this host, so the IP header is <b>removed</b> and the segment goes up." },
      { side: "r", L: 1, pdu: ["tcp", "data"], title: "Transport layer uses port 80, removes TCP header", d: "TCP sees destination port <b>80</b> and delivers the data to the web server process. It also sends an ACK." },
      { side: "r", L: 0, pdu: ["data"], title: "Application receives the original data", d: "The web server reads the request — exactly what the sender created. <b>Decapsulation complete!</b>" }
    ];
    stage.innerHTML =
      '<div class="encap-grid">' +
      '<div class="encap-col"><div class="encap-title">Sender</div><div id="enS"></div></div>' +
      '<div class="encap-mid"><div class="encap-step" id="enTitle"></div><div class="encap-pdu" id="enPdu"></div><div class="encap-pduname" id="enName"></div><div class="encap-fields" id="enFields"></div></div>' +
      '<div class="encap-col"><div class="encap-title">Receiver</div><div id="enR"></div></div></div>';
    let i = 0, timer = null;
    const msgEl = toolbar.querySelector("#enMsg");
    function stack(el, side) {
      const s = STEPS[i];
      el.innerHTML = LAYERS.map((l, k) => '<div class="encap-layer' + (s.side === side && s.L === k ? " on" : "") + '" style="--c:' + l.c + '"><span>' + l.n + '</span><small>' + l.pdu + '</small></div>').join("");
    }
    function render() {
      const s = STEPS[i], msg = msgEl.value || "Hello";
      stack(stage.querySelector("#enS"), "s"); stack(stage.querySelector("#enR"), "r");
      stage.querySelector("#enTitle").innerHTML = "Step " + (i + 1) + " / " + STEPS.length + " &middot; " + (s.side === "s" ? "Encapsulation (going down)" : "Decapsulation (going up)");
      const pdu = stage.querySelector("#enPdu");
      if (s.pdu[0] === "bits") {
        const frameBits = Array.from("ETH|IP|TCP|" + msg + "|FCS").map(ch => (ch.charCodeAt(0) & 255).toString(2).padStart(8, "0")).join("");
        pdu.innerHTML = '<div class="encap-bits">' + frameBits.slice(0, 160) + "…</div>";
      } else {
        pdu.innerHTML = s.pdu.map(k => k === "data"
          ? '<div class="encap-blk" style="--c:#6b46c1;flex:2.4" title="Application data">' + escapeHtml(msg) + "</div>"
          : '<div class="encap-blk" style="--c:' + HDR[k].c + '" title="' + HDR[k].f + '">' + HDR[k].t + "</div>").join("");
      }
      stage.querySelector("#enName").innerHTML = "PDU: <b>" + LAYERS[s.L].pdu + "</b>";
      const fieldsKey = { 1: ["tcp"], 2: ["ip"], 3: ["eth", "fcs"] }[s.L];
      stage.querySelector("#enFields").innerHTML = fieldsKey ? fieldsKey.map(k => '<div><b style="color:' + HDR[k].c + '">' + HDR[k].t + ":</b> " + HDR[k].f + "</div>").join("") : "";
      info.innerHTML = "<b>" + s.title + "</b><br>" + s.d;
      toolbar.querySelector("#enPrev").disabled = i === 0;
      toolbar.querySelector("#enNext").disabled = i === STEPS.length - 1;
      if (i === STEPS.length - 1) env.done();
    }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; toolbar.querySelector("#enAuto").innerHTML = icon("play", 14) + " Auto play"; } }
    toolbar.querySelector("#enNext").onclick = () => { stopAuto(); if (i < STEPS.length - 1) { i++; render(); } };
    toolbar.querySelector("#enPrev").onclick = () => { stopAuto(); if (i > 0) { i--; render(); } };
    toolbar.querySelector("#enReset").onclick = () => { stopAuto(); i = 0; render(); };
    toolbar.querySelector("#enAuto").onclick = () => {
      if (timer) return stopAuto();
      if (i === STEPS.length - 1) i = 0;
      render();
      toolbar.querySelector("#enAuto").innerHTML = icon("pause", 14) + " Pause";
      timer = setInterval(() => { if (i < STEPS.length - 1) { i++; render(); } else stopAuto(); }, 1800);
    };
    msgEl.oninput = render;
    render();
    return stopAuto;
  }

  /* =========================================================
     3. OSI layer explorer (DOM based)
     ========================================================= */
  function simOSI(env) {
    const { toolbar, stage, info } = env;
    const L = [
      { n: 7, name: "Application", c: "#6b46c1", pdu: "Data", fn: ["Interface between the network and user applications", "Provides services like web browsing, email, file transfer"], proto: "HTTP, HTTPS, FTP, SMTP, DNS, DHCP, SSH", dev: "Gateway, end hosts", web: "Your browser creates an HTTP GET request for the page.", ana: "Writing the content of a letter." },
      { n: 6, name: "Presentation", c: "#805ad5", pdu: "Data", fn: ["Translation between data formats (e.g. ASCII, UTF-8)", "Encryption/decryption and compression"], proto: "TLS/SSL, JPEG, PNG, MPEG, ASCII", dev: "Gateway, end hosts", web: "TLS encrypts the request so nobody can read it in transit.", ana: "Translating the letter and sealing it in a secure envelope." },
      { n: 5, name: "Session", c: "#3182ce", pdu: "Data", fn: ["Establishes, maintains and terminates sessions", "Synchronisation and checkpoints for recovery"], proto: "NetBIOS, RPC, PPTP", dev: "Gateway, end hosts", web: "A session is kept open so multiple requests can reuse it.", ana: "Keeping a conversation going with the same person." },
      { n: 4, name: "Transport", c: "#1f6fd1", pdu: "Segment", fn: ["End-to-end (process-to-process) delivery using port numbers", "Segmentation, flow control, error control (TCP)"], proto: "TCP, UDP", dev: "Firewall (L4), end hosts", web: "TCP splits data into segments, adds port 443, ensures reliable delivery.", ana: "Numbering the pages so they can be put back in order." },
      { n: 3, name: "Network", c: "#0b7a5c", pdu: "Packet", fn: ["Logical addressing (IP addresses)", "Routing — choosing the best path across networks"], proto: "IPv4, IPv6, ICMP, OSPF, RIP, BGP", dev: "Router, Layer-3 switch", web: "IP adds your IP and the server's IP; routers forward it hop by hop.", ana: "Writing the full postal address on the envelope." },
      { n: 2, name: "Data Link", c: "#b7791f", pdu: "Frame", fn: ["Framing and physical (MAC) addressing", "Error detection (CRC), media access control"], proto: "Ethernet (802.3), Wi-Fi (802.11), PPP, ARP*", dev: "Switch, Bridge, Access Point, NIC", web: "Ethernet/Wi-Fi wraps the packet in a frame addressed to your router's MAC.", ana: "The local postman who delivers between nearby houses." },
      { n: 1, name: "Physical", c: "#c53030", pdu: "Bits", fn: ["Transmits raw bits over the medium", "Defines cables, connectors, voltages, frequencies, bit rate"], proto: "Ethernet PHY, DSL, USB, Bluetooth radio, fibre", dev: "Hub, Repeater, Modem, Cables", web: "The frame becomes electrical, light or radio signals.", ana: "The road and the van that physically carry the letter." }
    ];
    toolbar.innerHTML = '<span class="muted" style="font-size:.88rem">Click a layer to explore it</span><span class="spacer"></span>' + btn("osiFlow", "play", "Animate data flow", "btn-primary");
    stage.innerHTML = '<div class="osi-grid"><div class="osi-layers" id="osiL"></div><div class="osi-detail" id="osiD"></div></div>';
    const lEl = stage.querySelector("#osiL"), dEl = stage.querySelector("#osiD");
    let sel = 0, timer = null, seen = new Set();
    lEl.innerHTML = L.map((l, i) => '<button class="osi-layer" data-i="' + i + '" style="background:' + l.c + '"><span class="n">' + l.n + "</span><span>" + l.name + "</span><small>" + l.pdu + "</small></button>").join("");
    function show(i, flowText) {
      sel = i; seen.add(i);
      lEl.querySelectorAll(".osi-layer").forEach((b, k) => b.classList.toggle("active", k === i));
      const l = L[i];
      dEl.innerHTML = '<h3 style="color:' + l.c + '">Layer ' + l.n + ": " + l.name + '</h3><p class="muted" style="margin-top:-6px">PDU: <b>' + l.pdu + "</b></p>" +
        '<b>Functions</b><ul class="points">' + l.fn.map(f => "<li>" + f + "</li>").join("") + "</ul>" +
        "<p><b>Protocols:</b> " + l.proto + "<br><b>Devices:</b> " + l.dev + "</p>" +
        '<div class="note example" style="margin:10px 0"><span class="note-title">When you open a website</span><p>' + l.web + "</p></div>" +
        '<p style="margin:0"><b>Analogy:</b> ' + l.ana + "</p>";
      info.innerHTML = flowText || "Layer <b>" + l.n + "</b> of 7. Explored " + seen.size + " of 7 layers." + (seen.size === 7 ? " &#10003; All layers explored!" : "");
      if (seen.size === 7) env.done();
    }
    lEl.querySelectorAll(".osi-layer").forEach(b => b.onclick = () => { stopFlow(); show(+b.dataset.i); });
    function stopFlow() { if (timer) { clearInterval(timer); timer = null; toolbar.querySelector("#osiFlow").innerHTML = icon("play", 14) + " Animate data flow"; } }
    toolbar.querySelector("#osiFlow").onclick = () => {
      if (timer) return stopFlow();
      const seq = [0, 1, 2, 3, 4, 5, 6, 6, 5, 4, 3, 2, 1, 0];
      let k = 0;
      toolbar.querySelector("#osiFlow").innerHTML = icon("pause", 14) + " Stop";
      const tick = () => {
        if (k >= seq.length) return stopFlow();
        const down = k < 7;
        show(seq[k], "<b>" + (down ? "Sender — encapsulation ↓" : "Receiver — decapsulation ↑") + "</b>: data is at Layer " + L[seq[k]].n + " (" + L[seq[k]].name + ") as a <b>" + L[seq[k]].pdu + "</b>." + (k === 6 ? " Bits travel across the medium to the receiver." : ""));
        k++;
      };
      tick(); timer = setInterval(tick, 1100);
    };
    show(0);
    return stopFlow;
  }

  /* =========================================================
     4. Network topologies
     ========================================================= */
  function simTopology(env) {
    const { toolbar, stage, info } = env;
    toolbar.innerHTML = '<label>Topology <select id="tpType"><option value="bus">Bus</option><option value="star" selected>Star</option><option value="ring">Ring</option><option value="mesh">Mesh</option><option value="tree">Tree</option></select></label>' +
      '<span class="spacer"></span>' + btn("tpRand", "play", "Send random packet", "btn-primary") + btn("tpFix", "reset", "Repair all links") + speedSelect("tpSpeed");
    const cv = makeCanvas(stage, 900, 420);
    let G, type = "star", selected = null, packets = [], flashes = [], msg = null, speed = 1, hoverEdge = -1;
    const DESC = {
      bus: "All devices share one backbone cable. Cheap, but a break in the backbone splits the network.",
      star: "Every device connects to a central switch. One cable failure affects only one PC, but if the switch fails, everything fails.",
      ring: "Each device connects to two neighbours and data travels one way around the ring. A single break stops traffic that must pass through it.",
      mesh: "Every device connects directly to every other device: n(n−1)/2 = 15 links for 6 devices. Very reliable — traffic reroutes around breaks.",
      tree: "A hierarchy of stars. Failure of a branch switch cuts off its whole branch; failure of the root splits the tree."
    };
    function build(t) {
      const N = [], E = [];
      const add = (x, y, kind, name) => { N.push({ x, y, kind, name }); return N.length - 1; };
      const link = (a, b, o) => E.push(Object.assign({ a, b, broken: false }, o || {}));
      const ell = (i, n, rx, ry) => [450 + rx * Math.cos(i / n * Math.PI * 2 - Math.PI / 2), 205 + ry * Math.sin(i / n * Math.PI * 2 - Math.PI / 2)];
      if (t === "bus") {
        const taps = [];
        for (let i = 0; i < 6; i++) taps.push(add(150 + i * 120, 210, "tap"));
        for (let i = 0; i < 6; i++) { const p = add(150 + i * 120, i % 2 ? 320 : 100, "pc", "PC" + (i + 1)); link(taps[i], p, { drop: true }); }
        for (let i = 0; i < 5; i++) link(taps[i], taps[i + 1], { backbone: true });
      } else if (t === "star") {
        const s = add(450, 205, "switch", "Switch");
        for (let i = 0; i < 6; i++) { const [x, y] = ell(i, 6, 300, 150); link(s, add(x, y, "pc", "PC" + (i + 1))); }
      } else if (t === "ring" || t === "mesh") {
        for (let i = 0; i < 6; i++) { const [x, y] = ell(i, 6, 290, 150); add(x, y, "pc", "PC" + (i + 1)); }
        if (t === "ring") for (let i = 0; i < 6; i++) link(i, (i + 1) % 6, { directed: true });
        else for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) link(i, j);
      } else if (t === "tree") {
        const root = add(450, 70, "switch", "Root");
        const s1 = add(250, 190, "switch", "SW-1"), s2 = add(650, 190, "switch", "SW-2");
        link(root, s1); link(root, s2);
        for (let i = 0; i < 3; i++) link(s1, add(130 + i * 120, 330, "pc", "PC" + (i + 1)));
        for (let i = 0; i < 3; i++) link(s2, add(530 + i * 120, 330, "pc", "PC" + (i + 4)));
      }
      return { N, E };
    }
    function reset(t) { type = t; G = build(t); selected = null; packets = []; flashes = []; msg = null; updateInfo(); }
    function path(src, dst) {
      const prev = new Array(G.N.length).fill(-1), seen = new Array(G.N.length).fill(false), q = [src];
      seen[src] = true;
      while (q.length) {
        const u = q.shift(); if (u === dst) break;
        G.E.forEach(e => {
          if (e.broken) return;
          let v = -1;
          if (e.a === u) v = e.b; else if (e.b === u && !e.directed) v = e.a;
          if (v < 0 || seen[v]) return;
          const canRelay = type === "ring" || type === "mesh" || G.N[v].kind !== "pc";
          if (canRelay || v === dst) { seen[v] = true; prev[v] = u; q.push(v); }
        });
      }
      if (!seen[dst]) return null;
      const p = []; for (let v = dst; v !== -1; v = prev[v]) p.unshift(v);
      return p;
    }
    const pcs = () => G.N.map((n, i) => n.kind === "pc" ? i : -1).filter(i => i >= 0);
    function sendPacket(a, b) {
      const p = path(a, b);
      if (!p) {
        flashes.push({ n: a, c: C.red, t: 1.2 });
        msg = { t: G.N[a].name + " → " + G.N[b].name + ": destination unreachable! A broken link blocks every possible path.", ok: false };
      } else {
        packets.push({ pts: p.map(i => ({ x: G.N[i].x, y: G.N[i].y })), d: 0, dst: b, src: a, hops: p.filter(i => G.N[i].kind !== "tap").length - 1 });
        msg = { t: G.N[a].name + " → " + G.N[b].name + ": sending along " + p.filter(i => G.N[i].kind !== "tap").map(i => G.N[i].name).join(" → "), ok: true };
        env.done();
      }
      updateInfo();
    }
    function updateInfo() {
      const broken = G.E.filter(e => e.broken).length;
      const real = G.E.filter(e => !e.drop).length;
      info.innerHTML = "<b>" + type.charAt(0).toUpperCase() + type.slice(1) + " topology:</b> " + DESC[type] +
        '<br><span class="muted" style="font-size:.88rem">Devices: ' + pcs().length + " &middot; Links: " + (type === "bus" ? "1 backbone + 6 drop cables" : real) + " &middot; Broken: " + broken +
        " &middot; <b>Click two PCs</b> to send a packet &middot; <b>Click a link</b> to break/repair it</span>" +
        (msg ? '<div style="margin-top:6px;font-weight:600;color:' + (msg.ok ? "var(--primary)" : "var(--red)") + '">' + escapeHtml(msg.t) + "</div>" : "");
    }
    function nodeAt(p) { return G.N.findIndex(n => n.kind !== "tap" && Math.hypot(n.x - p.x, n.y - p.y) < 28); }
    function edgeAt(p) { let best = -1, bd = 8; G.E.forEach((e, i) => { const d = distToSeg(p, G.N[e.a], G.N[e.b]); if (d < bd) { bd = d; best = i; } }); return best; }
    cv.c.addEventListener("click", ev => {
      const p = cv.pos(ev), n = nodeAt(p);
      if (n >= 0) {
        if (G.N[n].kind !== "pc") { msg = { t: "Select a PC, not a " + G.N[n].kind + ".", ok: false }; updateInfo(); return; }
        if (selected === null) { selected = n; msg = { t: G.N[n].name + " selected as source. Now click the destination PC.", ok: true }; updateInfo(); }
        else if (selected === n) { selected = null; msg = null; updateInfo(); }
        else { sendPacket(selected, n); selected = null; }
        return;
      }
      const e = edgeAt(p);
      if (e >= 0) { G.E[e].broken = !G.E[e].broken; msg = { t: G.E[e].broken ? "Link broken! Try sending packets to see the effect." : "Link repaired.", ok: !G.E[e].broken }; updateInfo(); }
    });
    cv.c.addEventListener("mousemove", ev => { const p = cv.pos(ev); hoverEdge = nodeAt(p) >= 0 ? -1 : edgeAt(p); cv.c.style.cursor = nodeAt(p) >= 0 || hoverEdge >= 0 ? "pointer" : "default"; });
    toolbar.querySelector("#tpType").onchange = e => reset(e.target.value);
    toolbar.querySelector("#tpFix").onclick = () => { G.E.forEach(e => e.broken = false); msg = { t: "All links repaired.", ok: true }; updateInfo(); };
    toolbar.querySelector("#tpSpeed").onchange = e => speed = +e.target.value;
    toolbar.querySelector("#tpRand").onclick = () => { const l = pcs(); const a = l[Math.floor(Math.random() * l.length)]; let b; do { b = l[Math.floor(Math.random() * l.length)]; } while (b === a); sendPacket(a, b); };
    reset("star");
    return loop(dt => {
      const { ctx, W, H } = cv;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      // links
      G.E.forEach((e, i) => {
        const a = G.N[e.a], b = G.N[e.b];
        const col = e.broken ? C.red : i === hoverEdge ? C.blue : e.backbone ? C.nav : "#9aa5b1";
        line(ctx, a.x, a.y, b.x, b.y, col, e.backbone ? 6 : 2.5, e.broken ? [7, 6] : null);
        if (e.broken) txt(ctx, "✕", (a.x + b.x) / 2, (a.y + b.y) / 2, { size: 18, weight: "700", color: C.red });
        else if (e.directed) { const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2; arrowHead(ctx, a.x, a.y, mx + (b.x - a.x) * 0.06, my + (b.y - a.y) * 0.06, col, 11); }
      });
      if (type === "bus") { [138, 762].forEach(x => { ctx.fillStyle = C.nav; ctx.fillRect(x - 3 + (x < 450 ? -12 : 12), 198, 6, 24); }); txt(ctx, "Terminator", 110, 240, { size: 10, color: C.faint }); txt(ctx, "Backbone cable", 450, 236, { size: 11, color: C.soft }); }
      // nodes
      flashes = flashes.filter(f => (f.t -= dt) > 0);
      G.N.forEach((n, i) => {
        if (n.kind === "tap") { ctx.beginPath(); ctx.arc(n.x, n.y, 4, 0, 7); ctx.fillStyle = C.nav; ctx.fill(); return; }
        const f = flashes.find(x => x.n === i);
        device(ctx, n.kind, n.x, n.y, { label: n.name, glow: f ? (f.c === C.red ? "rgba(197,48,48,.18)" : "rgba(11,122,92,.18)") : i === selected ? "rgba(31,111,209,.18)" : null, screen: i === selected ? "#cfe0f7" : undefined });
      });
      // packets
      packets.forEach(pk => {
        pk.d += 230 * speed * dt;
        const pt = pointOnPath(pk.pts, pk.d);
        if (pt.done) { pk.done = true; flashes.push({ n: pk.dst, c: C.primary, t: 1 }); msg = { t: "Delivered to " + G.N[pk.dst].name + " in " + pk.hops + " hop(s).", ok: true }; updateInfo(); return; }
        rr(ctx, pt.x - 11, pt.y - 8, 22, 16, 3); ctx.fillStyle = C.amber; ctx.fill();
        txt(ctx, "✉", pt.x, pt.y, { size: 12, color: "#fff" });
      });
      packets = packets.filter(p => !p.done);
      if (!packets.length && selected === null && !msg) txt(ctx, "Click a PC to choose the source", W / 2, H - 14, { size: 12, color: C.faint });
    });
  }

  /* =========================================================
     5. Client-server (sequence)
     ========================================================= */
  function simClientServer(env) {
    let proto = "https", url = "www.example.com";
    return sequenceSim(env, {
      actors: [{ name: "Browser (Client)", sub: "192.168.1.10", type: "pc" }, { name: "DNS Server", sub: "8.8.8.8", type: "server" }, { name: "Web Server", sub: "93.184.216.34", type: "server" }],
      controls: '<label>URL <input type="text" id="csUrl" value="www.example.com" style="width:150px"></label><label>Protocol <select id="csProto"><option value="http">HTTP</option><option value="https" selected>HTTPS</option></select></label>',
      intro: "This shows everything that happens when you type a URL and press Enter: a <b>DNS lookup</b>, a <b>TCP connection</b>, a <b>TLS handshake</b> (HTTPS only), then the <b>HTTP request and response</b>. Press <b>Play</b> or <b>Step</b>.",
      doneMsg: "Page loaded! The browser now renders the HTML.",
      bind(tb, rebuild) {
        tb.querySelector("#csUrl").onchange = e => { url = e.target.value.replace(/^https?:\/\//, "").split("/")[0] || "www.example.com"; rebuild(); };
        tb.querySelector("#csProto").onchange = e => { proto = e.target.value; rebuild(); };
      },
      build() {
        const port = proto === "https" ? 443 : 80;
        const s = [
          { from: 0, to: 1, label: "DNS Query: " + url + "?", color: C.violet, desc: "The browser doesn't know the server's IP address, so it asks the DNS server: <i>What is the IP of " + escapeHtml(url) + "?</i> (UDP port 53)" },
          { from: 1, to: 0, label: "DNS Reply: 93.184.216.34", color: C.violet, desc: "The DNS server replies with the IP address. The browser caches it for next time." },
          { from: 0, to: 2, label: "SYN", color: C.blue, desc: "TCP three-way handshake begins. The client sends <b>SYN</b> to port " + port + " to request a connection." },
          { from: 2, to: 0, label: "SYN-ACK", color: C.blue, desc: "The server agrees with <b>SYN-ACK</b>." },
          { from: 0, to: 2, label: "ACK", color: C.blue, desc: "The client sends <b>ACK</b>. The TCP connection is now established." }
        ];
        if (proto === "https") s.push(
          { from: 0, to: 2, label: "TLS ClientHello", color: C.amber, desc: "HTTPS: the client starts the TLS handshake with the TLS versions and cipher suites it supports." },
          { from: 2, to: 0, label: "ServerHello + Certificate", color: C.amber, desc: "The server picks a cipher and sends its <b>digital certificate</b> (with its public key). The browser verifies it with a trusted Certificate Authority." },
          { from: 0, to: 2, label: "Key Exchange + Finished", color: C.amber, desc: "Both sides agree on a shared <b>session key</b>. From now on all data is encrypted." }
        );
        s.push(
          { from: 0, to: 2, label: "GET / HTTP/1.1  Host: " + url, color: C.primary, desc: "The browser sends the <b>HTTP GET</b> request" + (proto === "https" ? " (encrypted inside TLS)" : " (in plain text — anyone on the path could read it!)") + "." },
          { from: 2, to: 0, label: "HTTP/1.1 200 OK  (HTML)", color: C.primary, desc: "The server responds with status <b>200 OK</b> and the HTML of the page." }
        );
        return s;
      }
    });
  }

  /* =========================================================
     6. Circuit vs packet switching
     ========================================================= */
  function simSwitching(env) {
    const { toolbar, stage, info } = env;
    toolbar.innerHTML = '<label>Method <select id="swMode"><option value="circuit">Circuit switching</option><option value="packet" selected>Packet switching (datagram)</option></select></label><span class="spacer"></span>' +
      btn("swGo", "play", "Send message", "btn-primary") + speedSelect("swSpeed");
    const cv = makeCanvas(stage, 900, 400);
    const N = { A: [60, 190], R1: [240, 90], R2: [240, 300], R3: [440, 60], R4: [440, 190], R5: [440, 320], R6: [640, 110], R7: [640, 280], B: [840, 190] };
    const E = [["A", "R1"], ["A", "R2"], ["R1", "R3"], ["R1", "R4"], ["R2", "R4"], ["R2", "R5"], ["R3", "R6"], ["R4", "R6"], ["R4", "R7"], ["R5", "R7"], ["R6", "B"], ["R7", "B"], ["R3", "R4"], ["R4", "R5"]];
    const adj = {}; E.forEach(([a, b]) => { (adj[a] = adj[a] || []).push(b); (adj[b] = adj[b] || []).push(a); });
    const PATHS = [];
    (function dfs(n, seen) { if (n === "B") { PATHS.push(seen.slice()); return; } if (seen.length > 5) return; adj[n].forEach(m => { if (seen.indexOf(m) === -1) { seen.push(m); dfs(m, seen); seen.pop(); } }); })("A", ["A"]);
    const pts = p => p.map(k => ({ x: N[k][0], y: N[k][1] }));
    let mode = "packet", speed = 1, sim = null;
    const COLORS = ["#1f6fd1", "#0b7a5c", "#6b46c1", "#b7791f", "#c53030", "#0e7490"];
    function start() {
      const t0 = 0;
      sim = { t: 0, items: [], reserved: [], arrived: [], phase: "", done: false, mode };
      if (mode === "circuit") {
        const p = ["A", "R1", "R4", "R6", "B"];
        sim.path = p; sim.phase = "setup";
        sim.items.push({ kind: "ctrl", label: "SETUP", pts: pts(p), d: 0, v: 170, start: t0 });
      } else {
        sim.phase = "sending";
        for (let i = 0; i < 6; i++) {
          const p = PATHS[Math.floor(Math.random() * PATHS.length)];
          sim.items.push({ kind: "pkt", id: i + 1, pts: pts(p), path: p, d: 0, v: 120 + Math.random() * 170, start: i * 0.3 });
        }
      }
      env.done();
    }
    function update(dt) {
      if (!sim || sim.done) return;
      sim.t += dt * speed;
      sim.items.forEach(it => {
        if (it.arrived || sim.t < it.start) return;
        it.d += it.v * dt * speed;
        if (it.kind === "ctrl" && it.label === "SETUP") {
          const seg = pointOnPath(it.pts, it.d).seg;
          for (let s = 0; s <= seg; s++) { const k = sim.path[s] + "-" + sim.path[s + 1]; if (sim.reserved.indexOf(k) === -1) sim.reserved.push(k); }
        }
        if (it.d >= pathLen(it.pts)) {
          it.arrived = true;
          if (it.kind === "pkt") sim.arrived.push(it.id);
          if (it.kind === "ctrl" && it.label === "SETUP") {
            sim.phase = "transfer";
            for (let i = 0; i < 6; i++) sim.items.push({ kind: "pkt", id: i + 1, pts: pts(sim.path), d: 0, v: 200, start: sim.t + i * 0.3 });
          }
          if (it.kind === "ctrl" && it.label === "TEARDOWN") { sim.phase = "released"; sim.reserved = []; sim.done = true; }
        }
      });
      if (sim.mode === "circuit" && sim.phase === "transfer" && sim.arrived.length === 6) {
        sim.phase = "teardown";
        sim.items.push({ kind: "ctrl", label: "TEARDOWN", pts: pts(sim.path), d: 0, v: 170, start: sim.t });
      }
      if (sim.mode === "packet" && sim.arrived.length === 6) sim.done = true;
      if (sim.done) renderInfo();
    }
    function renderInfo() {
      const base = mode === "circuit"
        ? "<b>Circuit switching:</b> a dedicated path is <b>set up first</b> (amber), all data follows it <b>in order</b>, then the circuit is <b>torn down</b>. The reserved links can't be used by anyone else, even when idle."
        : "<b>Packet switching:</b> the message is split into numbered packets. Each packet is routed <b>independently</b> and may take a different path with different delays, so they can <b>arrive out of order</b>. The receiver reassembles them.";
      let extra = "";
      if (sim && sim.done) {
        const order = sim.arrived.join(", ");
        const inOrder = sim.arrived.every((v, i) => v === i + 1);
        extra = '<div style="margin-top:6px"><b>Arrival order:</b> <span style="font-family:var(--mono)">' + order + "</span> &mdash; " +
          (inOrder ? '<span style="color:var(--primary);font-weight:600">in order</span>' : '<span style="color:var(--amber);font-weight:600">out of order &rarr; reassembled as 1, 2, 3, 4, 5, 6</span>') +
          " &middot; Total time: <b>" + sim.t.toFixed(1) + "s</b>" + (mode === "circuit" ? " (including setup &amp; teardown)" : "") + "</div>";
      }
      info.innerHTML = base + extra;
    }
    toolbar.querySelector("#swMode").onchange = e => { mode = e.target.value; sim = null; renderInfo(); };
    toolbar.querySelector("#swSpeed").onchange = e => speed = +e.target.value;
    toolbar.querySelector("#swGo").onclick = () => { start(); renderInfo(); };
    if (env.params.mode) { mode = env.params.mode; toolbar.querySelector("#swMode").value = mode; }
    renderInfo();
    return loop(dt => {
      update(dt);
      const { ctx, W, H } = cv;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      E.forEach(([a, b]) => {
        const r = sim && (sim.reserved.indexOf(a + "-" + b) !== -1 || sim.reserved.indexOf(b + "-" + a) !== -1);
        line(ctx, N[a][0], N[a][1], N[b][0], N[b][1], r ? C.amber : "#b8c2cc", r ? 6 : 2.5);
      });
      Object.keys(N).forEach(k => {
        if (k === "A" || k === "B") device(ctx, "pc", N[k][0], N[k][1], { label: k === "A" ? "Sender A" : "Receiver B" });
        else { device(ctx, "router", N[k][0], N[k][1]); txt(ctx, k, N[k][0], N[k][1] + 32, { size: 11, weight: "600", color: C.soft }); }
      });
      if (sim) {
        sim.items.forEach(it => {
          if (it.arrived || sim.t < it.start) return;
          const p = pointOnPath(it.pts, it.d);
          if (it.kind === "ctrl") label(ctx, it.label, p.x, p.y, { bg: C.amber, border: C.amber, color: "#fff", size: 11 });
          else { ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, 7); ctx.fillStyle = COLORS[it.id - 1]; ctx.fill(); txt(ctx, String(it.id), p.x, p.y + 0.5, { size: 12, weight: "700", color: "#fff" }); }
        });
        txt(ctx, "Received:", 700, 372, { size: 12, color: C.soft, align: "right" });
        sim.arrived.forEach((id, i) => { ctx.beginPath(); ctx.arc(720 + i * 26, 372, 10, 0, 7); ctx.fillStyle = COLORS[id - 1]; ctx.fill(); txt(ctx, String(id), 720 + i * 26, 372.5, { size: 11, weight: "700", color: "#fff" }); });
        const ph = { setup: "Phase 1: Setting up circuit…", transfer: "Phase 2: Data transfer on reserved path", teardown: "Phase 3: Tearing down circuit…", released: "Circuit released", sending: "Packets routed independently…" }[sim.phase];
        txt(ctx, (sim.done ? "Complete" : ph) + "   ·   t = " + sim.t.toFixed(1) + "s", 20, 20, { size: 13, weight: "600", align: "left", color: C.soft });
      } else txt(ctx, "Press “Send message” to start", W / 2, 372, { size: 12, color: C.faint });
    });
  }

  /* =========================================================
     7. Signal encoding
     ========================================================= */
  function simSignals(env) {
    const { toolbar, stage, info } = env;
    toolbar.innerHTML = '<label>Bits <input type="text" id="sgBits" value="10110010" maxlength="16" style="width:150px;font-family:var(--mono)"></label>' +
      '<label>Show <select id="sgMode"><option value="line">Line coding (digital)</option><option value="mod">Modulation (analog)</option></select></label><span class="spacer"></span>' +
      '<label><input type="checkbox" id="sgAnim" checked> Animate cursor</label>' + btn("sgRand", "reset", "Random bits");
    let bits = "10110010", mode = "line", anim = true, hover = -1, lastHover = null;
    const LX = 170, RX = 880, ROWH = 82, TOP = 58;
    let cv;
    function rows() { return mode === "line" ? ["NRZ-L", "NRZ-I", "Manchester", "Diff. Manchester"] : ["ASK", "FSK", "PSK"]; }
    function setup() { cv = makeCanvas(stage, 900, TOP + rows().length * ROWH + 16); bindMouse(); }
    function bindMouse() {
      cv.c.addEventListener("mousemove", e => { const p = cv.pos(e); const bw = (RX - LX) / bits.length; hover = p.x > LX && p.x < RX ? Math.floor((p.x - LX) / bw) : -1; });
      cv.c.addEventListener("mouseleave", () => hover = -1);
    }
    function levels(name) {
      // returns array of [level at first half, level at second half] per bit, 1 = high, 0 = low
      const out = []; let lvl = 0, dm = 1;
      for (let i = 0; i < bits.length; i++) {
        const b = bits[i] === "1";
        if (name === "NRZ-L") out.push([b ? 1 : 0, b ? 1 : 0]);
        else if (name === "NRZ-I") { if (b) lvl ^= 1; out.push([lvl, lvl]); }
        else if (name === "Manchester") out.push(b ? [0, 1] : [1, 0]);
        else { if (!b) dm ^= 1; const first = dm; dm ^= 1; out.push([first, dm]); }
      }
      return out;
    }
    function rules() {
      return mode === "line"
        ? "<b>NRZ-L:</b> 1 = high, 0 = low. &nbsp; <b>NRZ-I:</b> 1 = invert, 0 = no change. &nbsp; <b>Manchester (IEEE 802.3):</b> 0 = high→low, 1 = low→high in the middle of each bit. &nbsp; <b>Differential Manchester:</b> always a mid-bit transition; a transition at the start = 0, none = 1."
        : "<b>ASK</b> (Amplitude Shift Keying): 1 = carrier on, 0 = carrier off. &nbsp; <b>FSK</b> (Frequency Shift Keying): 1 = high frequency, 0 = low frequency. &nbsp; <b>PSK</b> (Phase Shift Keying): 1 = phase shifted by 180°, 0 = normal phase.";
    }
    function setInfo() {
      let s = rules();
      if (hover >= 0 && hover < bits.length) s = "<b>Bit " + (hover + 1) + " = " + bits[hover] + "</b> &mdash; hover over the signal to inspect each bit.<br>" + s;
      info.innerHTML = s;
    }
    const inp = toolbar.querySelector("#sgBits");
    inp.oninput = () => { const v = inp.value.replace(/[^01]/g, ""); inp.value = v; bits = v || "0"; env.done(); };
    toolbar.querySelector("#sgMode").onchange = e => { mode = e.target.value; setup(); lastHover = null; env.done(); };
    toolbar.querySelector("#sgAnim").onchange = e => anim = e.target.checked;
    toolbar.querySelector("#sgRand").onclick = () => { bits = Array.from({ length: 8 + Math.floor(Math.random() * 5) }, () => Math.random() < 0.5 ? "0" : "1").join(""); inp.value = bits; env.done(); };
    if (env.params.mode === "mod") { mode = "mod"; toolbar.querySelector("#sgMode").value = "mod"; }
    if (env.params.bits) { bits = env.params.bits; inp.value = bits; }
    setup();
    return loop((dt, now) => {
      const { ctx, W, H } = cv, n = bits.length, bw = (RX - LX) / n;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      const cursor = anim ? ((now * 0.9) % (n + 1)) : -1;
      const cb = anim ? Math.floor(cursor) : -1;
      for (let i = 0; i < n; i++) {
        const x = LX + i * bw;
        if (i === hover || i === cb) { ctx.fillStyle = i === hover ? "rgba(31,111,209,.08)" : "rgba(11,122,92,.07)"; ctx.fillRect(x, 26, bw, H - 34); }
        line(ctx, x, 26, x, H - 8, "#dde2e8", 1, [3, 3]);
        txt(ctx, bits[i], x + bw / 2, 40, { size: 17, weight: "700", mono: true, color: i === hover ? C.blue : C.ink });
      }
      line(ctx, RX, 26, RX, H - 8, "#dde2e8", 1, [3, 3]);
      rows().forEach((name, r) => {
        const y0 = TOP + r * ROWH, hi = y0 + 16, lo = y0 + 56, mid = (hi + lo) / 2;
        txt(ctx, name, 20, mid, { align: "left", weight: "700", size: 13 });
        line(ctx, LX, mid, RX, mid, "#eef1f4", 1);
        ctx.beginPath(); ctx.lineWidth = 2.5; ctx.strokeStyle = [C.primary, C.blue, C.violet, C.amber][r];
        if (mode === "line") {
          const lv = levels(name);
          let prev = null;
          lv.forEach((pair, i) => {
            const x = LX + i * bw;
            [0, 1].forEach(h => {
              const yy = pair[h] ? hi : lo, xs = x + h * bw / 2;
              if (prev === null) ctx.moveTo(xs, yy); else { ctx.lineTo(xs, prev); ctx.lineTo(xs, yy); }
              ctx.lineTo(xs + bw / 2, yy); prev = yy;
            });
          });
        } else {
          const amp = 20, cyc = 2;
          for (let px = 0; px <= RX - LX; px += 1) {
            const i = Math.min(n - 1, Math.floor(px / bw)), b = bits[i] === "1", tt = px / bw;
            let y;
            if (name === "ASK") y = mid - (b ? amp : 0) * Math.sin(2 * Math.PI * cyc * tt);
            else if (name === "FSK") y = mid - amp * Math.sin(2 * Math.PI * (b ? 3 : 1.5) * tt);
            else y = mid - amp * Math.sin(2 * Math.PI * cyc * tt + (b ? Math.PI : 0));
            if (px === 0) ctx.moveTo(LX + px, y); else ctx.lineTo(LX + px, y);
          }
        }
        ctx.stroke();
      });
      if (anim) { const cx = LX + cursor * bw; if (cursor < n) line(ctx, cx, 26, cx, H - 8, C.red, 1.5); }
      if (hover !== lastHover) { lastHover = hover; setInfo(); }
    });
  }

  /* =========================================================
     8. Routing — Dijkstra
     ========================================================= */
  function simRouting(env) {
    const { toolbar, stage, info } = env;
    const NODES = [{ n: "A", x: 90, y: 200 }, { n: "B", x: 260, y: 80 }, { n: "C", x: 260, y: 320 }, { n: "D", x: 450, y: 200 }, { n: "E", x: 640, y: 80 }, { n: "F", x: 640, y: 320 }, { n: "G", x: 810, y: 200 }];
    const BASE = [[0, 1, 4], [0, 2, 2], [1, 2, 1], [1, 3, 5], [2, 3, 8], [2, 5, 10], [1, 4, 7], [3, 4, 2], [3, 5, 3], [4, 6, 3], [5, 6, 4], [4, 5, 6]];
    let E = BASE.map(([a, b, w]) => ({ a, b, w, down: false }));
    const opts = NODES.map((x, i) => '<option value="' + i + '">' + x.n + "</option>").join("");
    toolbar.innerHTML = '<label>From <select id="rtS">' + opts + '</select></label><label>To <select id="rtD">' + opts + '</select></label>' +
      '<label>Click a link to <select id="rtAct"><option value="cost">change cost</option><option value="down">break / repair</option></select></label><span class="spacer"></span>' +
      btn("rtRun", "play", "Run Dijkstra", "btn-primary") + btn("rtRand", "reset", "Random costs") + speedSelect("rtSpeed");
    toolbar.querySelector("#rtD").value = "6";
    const cv = makeCanvas(stage, 900, 400);
    let src = 0, dst = 6, events = [], ev = 0, timer = 0, running = false, speed = 1, st = null, hoverE = -1;
    function dijkstra() {
      const n = NODES.length, dist = Array(n).fill(Infinity), prev = Array(n).fill(-1), done = Array(n).fill(false), out = [];
      dist[src] = 0; out.push({ t: "init" });
      for (let k = 0; k < n; k++) {
        let u = -1; for (let i = 0; i < n; i++) if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i;
        if (u < 0) break;
        done[u] = true; out.push({ t: "visit", u, dist: dist.slice(), prev: prev.slice(), done: done.slice() });
        E.forEach((e, ei) => {
          if (e.down) return;
          const v = e.a === u ? e.b : e.b === u ? e.a : -1;
          if (v < 0 || done[v]) return;
          const nd = dist[u] + e.w, better = nd < dist[v];
          if (better) { dist[v] = nd; prev[v] = u; }
          out.push({ t: "relax", u, v, ei, nd, better, dist: dist.slice(), prev: prev.slice(), done: done.slice() });
        });
      }
      out.push({ t: "end", dist: dist.slice(), prev: prev.slice(), done: done.slice() });
      return out;
    }
    function pathTo(prev, d) { const p = []; for (let v = d; v !== -1; v = prev[v]) p.unshift(v); return p[0] === src ? p : []; }
    function table(s) {
      const rows = NODES.map((nd, i) => {
        if (i === src) return null;
        const p = pathTo(s.prev, i);
        return "<tr><td>" + nd.n + "</td><td>" + (p.length > 1 ? NODES[p[1]].n : "&mdash;") + "</td><td>" + (s.dist[i] === Infinity ? "&infin; (unreachable)" : s.dist[i]) + "</td><td>" + (p.length ? p.map(x => NODES[x].n).join(" → ") : "&mdash;") + "</td></tr>";
      }).filter(Boolean).join("");
      return '<div class="table-wrap" style="margin:8px 0 0"><table><thead><tr><th>Destination</th><th>Next hop</th><th>Cost</th><th>Path</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
    }
    function describe() {
      if (!st) { info.innerHTML = "Choose a source and destination, then press <b>Run Dijkstra</b>. The algorithm repeatedly picks the unvisited router with the smallest known distance, then <b>relaxes</b> (updates) its neighbours. Click any link to change its cost or break it."; return; }
      const e = st;
      let s = "";
      if (e.t === "init") s = "Start: distance to " + NODES[src].n + " = 0, all others = ∞.";
      else if (e.t === "visit") s = "Visit <b>" + NODES[e.u].n + "</b> (smallest distance = " + e.dist[e.u] + "). Its distance is now final.";
      else if (e.t === "relax") s = "Check link " + NODES[e.u].n + "–" + NODES[e.v].n + ": " + e.dist[e.u] + " + " + E[e.ei].w + " = " + e.nd + (e.better ? " → <b style='color:var(--primary)'>shorter! Update " + NODES[e.v].n + " to " + e.nd + "</b>" : " → not shorter, keep " + e.dist[e.v]);
      else {
        const p = pathTo(e.prev, dst);
        s = p.length ? "<b style='color:var(--primary)'>Done!</b> Shortest path " + NODES[src].n + " → " + NODES[dst].n + ": <b>" + p.map(x => NODES[x].n).join(" → ") + "</b> with total cost <b>" + e.dist[dst] + "</b>. Routing table for router " + NODES[src].n + ":" : "<b style='color:var(--red)'>" + NODES[dst].n + " is unreachable</b> — broken links isolate it. Routing table for " + NODES[src].n + ":";
        s += table(e);
      }
      info.innerHTML = s;
    }
    function run(instant) { events = dijkstra(); ev = 0; running = true; timer = 0; st = events[0]; if (instant) { ev = events.length - 1; st = events[ev]; running = false; } describe(); env.done(); }
    const reRun = () => { if (st) run(true); else describe(); };
    toolbar.querySelector("#rtS").onchange = e => { src = +e.target.value; reRun(); };
    toolbar.querySelector("#rtD").onchange = e => { dst = +e.target.value; reRun(); };
    toolbar.querySelector("#rtRun").onclick = () => run(false);
    toolbar.querySelector("#rtRand").onclick = () => { E.forEach(e => e.w = 1 + Math.floor(Math.random() * 9)); reRun(); };
    toolbar.querySelector("#rtSpeed").onchange = e => speed = +e.target.value;
    const edgeAt = p => { let best = -1, bd = 10; E.forEach((e, i) => { const d = distToSeg(p, NODES[e.a], NODES[e.b]); if (d < bd) { bd = d; best = i; } }); return best; };
    cv.c.addEventListener("click", ev2 => {
      const i = edgeAt(cv.pos(ev2)); if (i < 0) return;
      if (toolbar.querySelector("#rtAct").value === "cost") E[i].w = E[i].w % 9 + 1; else E[i].down = !E[i].down;
      reRun();
    });
    cv.c.addEventListener("mousemove", e => { hoverE = edgeAt(cv.pos(e)); cv.c.style.cursor = hoverE >= 0 ? "pointer" : "default"; });
    describe();
    return loop(dt => {
      if (running) { timer += dt * speed; if (timer > 0.9) { timer = 0; ev++; st = events[ev]; describe(); if (ev >= events.length - 1) running = false; } }
      const { ctx, W, H } = cv;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      const path = st && st.t === "end" ? pathTo(st.prev, dst) : [];
      const onPath = (a, b) => { for (let i = 0; i < path.length - 1; i++) if ((path[i] === a && path[i + 1] === b) || (path[i] === b && path[i + 1] === a)) return true; return false; };
      E.forEach((e, i) => {
        const a = NODES[e.a], b = NODES[e.b];
        const rel = st && st.t === "relax" && st.ei === i;
        const tree = st && st.prev && (st.prev[e.b] === e.a || st.prev[e.a] === e.b) && !(st.t === "end");
        let col = "#b8c2cc", w = 2.5;
        if (e.down) col = C.red; else if (onPath(e.a, e.b)) { col = C.primary; w = 7; } else if (rel) { col = st.better ? C.blue : C.amber; w = 5; } else if (tree) { col = "#7fb3e8"; w = 4; } else if (i === hoverE) col = C.ink;
        line(ctx, a.x, a.y, b.x, b.y, col, w, e.down ? [7, 6] : null);
        label(ctx, e.down ? "✕" : String(e.w), (a.x + b.x) / 2, (a.y + b.y) / 2, { color: e.down ? C.red : C.ink, border: col, size: 12 });
      });
      NODES.forEach((nd, i) => {
        let fill = "#fff", stroke = C.blue;
        if (st && st.done && st.done[i]) { fill = C.pSoft; stroke = C.primary; }
        if (st && st.t === "visit" && st.u === i) { fill = C.aSoft; stroke = C.amber; }
        ctx.beginPath(); ctx.arc(nd.x, nd.y, 24, 0, 7); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = i === src || i === dst ? 4 : 2.5; ctx.strokeStyle = i === src ? C.violet : i === dst ? C.red : stroke; ctx.stroke();
        txt(ctx, nd.n, nd.x, nd.y + 1, { size: 17, weight: "700" });
        const d = st && st.dist ? st.dist[i] : i === src && st ? 0 : Infinity;
        label(ctx, "d=" + (d === Infinity ? "∞" : d), nd.x, nd.y + (nd.y > 250 ? 40 : -40), { size: 11, bg: C.bSoft, border: C.bSoft, color: C.blue });
      });
      txt(ctx, "● Source", 20, 380, { size: 12, align: "left", color: C.violet, weight: "600" });
      txt(ctx, "● Destination", 100, 380, { size: 12, align: "left", color: C.red, weight: "600" });
      txt(ctx, "● Visited (final)", 210, 380, { size: 12, align: "left", color: C.primary, weight: "600" });
      txt(ctx, "● Current", 335, 380, { size: 12, align: "left", color: C.amber, weight: "600" });
    });
  }

  /* =========================================================
     9. TCP handshake / UDP (sequence)
     ========================================================= */
  function simHandshake(env) {
    let mode = "tcp";
    return sequenceSim(env, {
      actors: [{ name: "Client", sub: "192.168.1.10:49152", type: "pc" }, { name: "Server", sub: "93.184.216.34:80", type: "server" }],
      controls: '<label>Scenario <select id="hsMode"><option value="tcp">TCP: handshake, data, close</option><option value="loss">TCP with a lost segment</option><option value="udp">UDP: no connection</option></select></label>',
      intro: "Choose a scenario and press <b>Play</b>. Compare how TCP sets up a reliable connection with how UDP simply sends datagrams.",
      bind(tb, rebuild) { tb.querySelector("#hsMode").onchange = e => { mode = e.target.value; rebuild(); }; },
      build() {
        if (mode === "udp") return [
          { from: 0, to: 1, label: "Datagram 1", color: C.violet, desc: "UDP sends data immediately — <b>no handshake</b>, no connection setup." },
          { from: 0, to: 1, label: "Datagram 2", color: C.violet, lost: true, desc: "Datagram 2 is <b>lost</b> in the network. UDP doesn't notice and doesn't resend it." },
          { from: 0, to: 1, label: "Datagram 3", color: C.violet, desc: "Datagram 3 arrives. The application simply has a gap — fine for live video or games, where old data is useless anyway." },
          { from: 1, to: 0, label: "Reply datagram", color: C.violet, desc: "The server can reply, again with no acknowledgement system. <b>Fast, simple, unreliable.</b>" }
        ];
        const hs = [
          { from: 0, to: 1, label: "SYN  seq=100", desc: "<b>Step 1 — SYN:</b> the client asks to open a connection and chooses an initial sequence number (100)." },
          { from: 1, to: 0, label: "SYN-ACK  seq=300 ack=101", desc: "<b>Step 2 — SYN-ACK:</b> the server agrees, sends its own sequence number (300) and acknowledges the client's (100 + 1 = 101)." },
          { from: 0, to: 1, label: "ACK  ack=301", desc: "<b>Step 3 — ACK:</b> the client acknowledges the server's sequence number. <b>Connection established!</b>" }
        ];
        const close = [
          { from: 0, to: 1, label: "FIN", color: C.red, desc: "<b>Closing:</b> the client sends FIN — it has no more data to send." },
          { from: 1, to: 0, label: "ACK", color: C.red, desc: "The server acknowledges the FIN." },
          { from: 1, to: 0, label: "FIN", color: C.red, desc: "The server sends its own FIN when it is done." },
          { from: 0, to: 1, label: "ACK", color: C.red, desc: "The client acknowledges. <b>Connection closed</b> (four-way termination)." }
        ];
        if (mode === "loss") return hs.concat([
          { from: 0, to: 1, label: "Data seq=101 (100 bytes)", color: C.primary, lost: true, desc: "The client sends 100 bytes of data, but the segment is <b>lost</b>." },
          { at: 0, note: "⏱ Timeout — no ACK received", desc: "The client's retransmission timer expires because no ACK arrived." },
          { from: 0, to: 1, label: "Retransmit seq=101", color: C.primary, desc: "TCP <b>retransmits</b> the same segment. This is how TCP guarantees reliable delivery." },
          { from: 1, to: 0, label: "ACK ack=201", color: C.primary, desc: "The server acknowledges: it expects byte 201 next (101 + 100)." }
        ]).concat(close);
        return hs.concat([
          { from: 0, to: 1, label: "Data seq=101 (100 bytes)", color: C.primary, desc: "The client sends 100 bytes of data starting at sequence number 101." },
          { from: 1, to: 0, label: "ACK ack=201", color: C.primary, desc: "The server acknowledges and says it expects byte 201 next." }
        ]).concat(close);
      }
    });
  }

  /* =========================================================
     10. DNS resolution (sequence)
     ========================================================= */
  function simDNS(env) {
    let name = "www.example.com";
    return sequenceSim(env, {
      actors: [{ name: "Your PC", sub: "stub resolver", type: "pc" }, { name: "Recursive Resolver", sub: "ISP / 8.8.8.8", type: "server" }, { name: "Root Server", sub: ".", type: "server" }, { name: "TLD Server", sub: ".com", type: "server" }, { name: "Authoritative", sub: "example.com", type: "server" }],
      controls: '<label>Domain <input type="text" id="dnsName" value="www.example.com" style="width:160px"></label>',
      intro: "Watch how a domain name is resolved to an IP address by walking down the DNS hierarchy: <b>root → TLD → authoritative</b>.",
      doneMsg: "Resolved! The answer is cached by the resolver and your PC for the record's TTL.",
      bind(tb, rebuild) { tb.querySelector("#dnsName").onchange = e => { name = e.target.value.trim() || "www.example.com"; rebuild(); }; },
      build() {
        const parts = name.split("."), tld = "." + parts[parts.length - 1], dom = parts.slice(-2).join(".");
        return [
          { from: 0, to: 1, label: "Where is " + name + "?", color: C.violet, desc: "Your PC sends a <b>recursive query</b> to its resolver: <i>please find the final answer for me</i>." },
          { from: 1, to: 2, label: "Where is " + name + "?", color: C.blue, desc: "The resolver doesn't have it cached, so it starts at a <b>root server</b> (iterative query)." },
          { from: 2, to: 1, label: "Ask the " + tld + " TLD server", color: C.blue, desc: "The root server doesn't know the answer but refers the resolver to the <b>" + escapeHtml(tld) + " TLD server</b>." },
          { from: 1, to: 3, label: "Where is " + name + "?", color: C.blue, desc: "The resolver asks the <b>TLD server</b>." },
          { from: 3, to: 1, label: "Ask ns1." + dom, color: C.blue, desc: "The TLD server refers it to the <b>authoritative name server</b> for " + escapeHtml(dom) + "." },
          { from: 1, to: 4, label: "Where is " + name + "?", color: C.blue, desc: "The resolver asks the authoritative server, which holds the actual DNS records." },
          { from: 4, to: 1, label: "A record: 93.184.216.34", color: C.primary, desc: "The authoritative server answers with the <b>A record</b> (IPv4 address) and a TTL." },
          { from: 1, to: 0, label: name + " = 93.184.216.34", color: C.primary, desc: "The resolver returns the answer to your PC and caches it. Your browser can now connect to the server." }
        ];
      }
    });
  }

  /* =========================================================
     11. DHCP DORA (sequence)
     ========================================================= */
  function simDHCP(env) {
    return sequenceSim(env, {
      actors: [{ name: "New Laptop", sub: "IP: 0.0.0.0", type: "pc" }, { name: "Other PC", sub: "192.168.1.20", type: "pc" }, { name: "DHCP Server", sub: "192.168.1.1", type: "server" }],
      intro: "A new laptop joins the network with <b>no IP address</b>. Watch it obtain one using the four-step <b>DORA</b> process.",
      doneMsg: "The laptop is now configured: IP 192.168.1.50, mask 255.255.255.0, gateway 192.168.1.1, DNS 8.8.8.8.",
      build() {
        return [
          { from: 0, to: [1, 2], label: "DHCP DISCOVER (broadcast)", color: C.violet, desc: "<b>D — Discover:</b> the laptop has no IP, so it broadcasts from 0.0.0.0 to 255.255.255.255 (UDP 68 → 67): <i>Is there a DHCP server?</i> Every device receives it; only the DHCP server responds." },
          { from: 2, to: 0, label: "DHCP OFFER: 192.168.1.50", color: C.blue, desc: "<b>O — Offer:</b> the server offers an available address (192.168.1.50) along with the subnet mask, gateway, DNS server and lease time." },
          { from: 0, to: [1, 2], label: "DHCP REQUEST: 192.168.1.50", color: C.violet, desc: "<b>R — Request:</b> the laptop broadcasts that it accepts this offer. Broadcasting tells any other DHCP servers that their offers were declined." },
          { from: 2, to: 0, label: "DHCP ACK (lease 24h)", color: C.primary, desc: "<b>A — Acknowledge:</b> the server confirms. The laptop configures its interface and can now communicate. It will try to renew at 50% of the lease time." }
        ];
      }
    });
  }

  /* =========================================================
     12. Switch MAC learning
     ========================================================= */
  function simSwitchLearn(env) {
    const { toolbar, stage, info } = env;
    const PCS = [{ n: "PC-A", mac: "AA:AA:AA:00:00:01", x: 150, y: 90, port: 1 }, { n: "PC-B", mac: "BB:BB:BB:00:00:02", x: 750, y: 90, port: 2 }, { n: "PC-C", mac: "CC:CC:CC:00:00:03", x: 150, y: 310, port: 3 }, { n: "PC-D", mac: "DD:DD:DD:00:00:04", x: 750, y: 310, port: 4 }];
    const SW = { x: 450, y: 200 };
    const o = PCS.map((p, i) => '<option value="' + i + '">' + p.n + "</option>").join("");
    toolbar.innerHTML = '<label>Device <select id="slDev"><option value="switch">Switch</option><option value="hub">Hub</option></select></label>' +
      '<label>From <select id="slS">' + o + '</select></label><label>To <select id="slD">' + o + '<option value="bc">Broadcast (FF:FF…)</option></select></label><span class="spacer"></span>' +
      btn("slSend", "play", "Send frame", "btn-primary") + btn("slClear", "reset", "Clear MAC table") + speedSelect("slSpeed");
    toolbar.querySelector("#slD").value = "3";
    stage.innerHTML = '<div style="display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:0" class="sl-grid"><div id="slCv"></div><div id="slTbl" style="border-left:1px solid var(--line);padding:14px;background:#fff"></div></div>';
    const cv = makeCanvas(stage.querySelector("#slCv"), 900, 400);
    let dev = "switch", table = [], frames = [], marks = [], speed = 1, lastLearn = null, busy = false;
    const portPos = p => { const pc = PCS[p - 1]; return { x: SW.x + (pc.x < SW.x ? -30 : 30), y: SW.y + (pc.y < SW.y ? -8 : 8) }; };
    function drawTable() {
      const t = stage.querySelector("#slTbl");
      if (dev === "hub") { t.innerHTML = '<b>Hub</b><p class="muted" style="font-size:.88rem">A hub has <b>no MAC table</b>. It repeats every frame out of every port, wasting bandwidth and creating one big collision domain.</p>'; return; }
      t.innerHTML = '<b>MAC Address Table</b><div class="table-wrap" style="margin:8px 0"><table style="font-size:.82rem"><thead><tr><th>Port</th><th>MAC Address</th></tr></thead><tbody>' +
        (table.length ? table.map(r => '<tr style="' + (r.mac === lastLearn ? "background:var(--primary-soft)" : "") + '"><td>Fa0/' + r.port + '</td><td style="font-family:var(--mono)">' + r.mac + "</td></tr>").join("") : '<tr><td colspan="2" class="muted">Empty — the switch has not learned anything yet</td></tr>') +
        "</tbody></table></div>";
    }
    function send() {
      if (busy) return;
      const s = +toolbar.querySelector("#slS").value, dv = toolbar.querySelector("#slD").value, d = dv === "bc" ? -1 : +dv;
      if (s === d) { info.innerHTML = '<span style="color:var(--red);font-weight:600">Pick a different source and destination.</span>'; return; }
      busy = true; marks = []; env.done();
      const src = PCS[s];
      frames = [{ pts: [{ x: src.x, y: src.y }, portPos(src.port)], d: 0, phase: 1, s, dst: d }];
      info.innerHTML = "<b>" + src.n + "</b> sends a frame to <b>" + (d < 0 ? "everyone (broadcast FF:FF:FF:FF:FF:FF)" : PCS[d].n + " (" + PCS[d].mac + ")") + "</b>…";
    }
    function atSwitch(f) {
      const src = PCS[f.s];
      let msg = "";
      if (dev === "switch") {
        if (!table.find(r => r.mac === src.mac)) { table.push({ port: src.port, mac: src.mac }); lastLearn = src.mac; msg += "<b>Learn:</b> the switch records source MAC " + src.mac + " on port Fa0/" + src.port + ". "; }
        else { lastLearn = null; msg += "Source MAC already known. "; }
        drawTable();
      }
      let outs;
      const known = f.dst >= 0 && table.find(r => r.mac === PCS[f.dst].mac);
      if (dev === "hub") { outs = PCS.map((p, i) => i).filter(i => i !== f.s); msg += "<b>Hub:</b> repeats the frame out of <b>every</b> other port."; }
      else if (f.dst < 0) { outs = PCS.map((p, i) => i).filter(i => i !== f.s); msg += "<b>Flood:</b> it's a broadcast, so it goes out of every port except the incoming one."; }
      else if (known) { outs = [f.dst]; msg += "<b>Forward:</b> destination " + PCS[f.dst].mac + " is in the table on port Fa0/" + PCS[f.dst].port + ", so the frame goes out of <b>only that port</b>."; }
      else { outs = PCS.map((p, i) => i).filter(i => i !== f.s); msg += "<b>Flood:</b> destination MAC is <b>unknown</b>, so the frame is sent out of all other ports."; }
      info.innerHTML = msg;
      outs.forEach(i => frames.push({ pts: [portPos(PCS[i].port), { x: PCS[i].x, y: PCS[i].y }], d: 0, phase: 2, to: i, dst: f.dst }));
    }
    toolbar.querySelector("#slSend").onclick = send;
    toolbar.querySelector("#slClear").onclick = () => { table = []; lastLearn = null; drawTable(); info.innerHTML = "MAC table cleared. The switch will flood frames to unknown destinations until it learns them."; };
    toolbar.querySelector("#slDev").onchange = e => { dev = e.target.value; table = []; drawTable(); info.innerHTML = dev === "hub" ? "Hub mode: every frame goes to every port. Compare with a switch!" : "Switch mode: the switch learns MAC addresses and forwards intelligently."; };
    toolbar.querySelector("#slSpeed").onchange = e => speed = +e.target.value;
    drawTable();
    info.innerHTML = "Send frames between PCs and watch the switch <b>learn</b> source MAC addresses, <b>flood</b> unknown destinations, and <b>forward</b> known ones to a single port. Try the same with a <b>Hub</b>.";
    return loop(dt => {
      const { ctx, W, H } = cv;
      frames.forEach(f => {
        f.d += 220 * speed * dt;
        if (f.d >= pathLen(f.pts) && !f.done) {
          f.done = true;
          if (f.phase === 1) atSwitch(f);
          else marks.push({ i: f.to, ok: f.dst < 0 || f.dst === f.to, t: 2.2 });
        }
      });
      frames = frames.filter(f => !f.done);
      if (busy && !frames.length) busy = false;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      PCS.forEach(p => { const pp = portPos(p.port); line(ctx, p.x, p.y, pp.x, pp.y, "#9aa5b1", 3); label(ctx, "Fa0/" + p.port, (p.x + pp.x) / 2, (p.y + pp.y) / 2, { size: 11, color: C.soft }); });
      device(ctx, dev, SW.x, SW.y, { fill: dev === "hub" ? C.aSoft : C.pSoft, stroke: dev === "hub" ? C.amber : C.primary });
      if (dev === "hub") { rr(ctx, SW.x - 30, SW.y - 15, 60, 30, 5); ctx.fillStyle = C.aSoft; ctx.fill(); ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.stroke(); txt(ctx, "HUB", SW.x, SW.y + 1, { weight: "700", color: C.amber }); }
      txt(ctx, dev === "hub" ? "Hub (Layer 1)" : "Switch (Layer 2)", SW.x, SW.y + 34, { weight: "600", size: 13 });
      marks = marks.filter(m => (m.t -= dt) > 0);
      PCS.forEach((p, i) => {
        const m = marks.find(x => x.i === i);
        device(ctx, "pc", p.x, p.y, { label: p.n, sub: p.mac, subMono: true, glow: m ? (m.ok ? "rgba(11,122,92,.18)" : "rgba(197,48,48,.14)") : null });
        if (m) label(ctx, m.ok ? "✓ Accepted" : "✕ Dropped (not for me)", p.x, p.y - 42, { size: 11, color: m.ok ? C.primary : C.red, border: m.ok ? C.primary : C.red });
      });
      frames.forEach(f => { const pt = pointOnPath(f.pts, f.d); rr(ctx, pt.x - 13, pt.y - 9, 26, 18, 3); ctx.fillStyle = f.dst < 0 ? C.violet : C.blue; ctx.fill(); txt(ctx, "F", pt.x, pt.y + 1, { size: 11, weight: "700", color: "#fff" }); });
    });
  }

  /* ---------- Registration ---------- */
  const R = (id, kind, cat, title, desc, run) => register(id, { kind, category: cat, title, desc, run });
  R("transmission", "sim", "Data Transmission", "Data Transmission", "Type a message and watch it travel as bits. Compare simplex, half-duplex and full-duplex, and add noise to see errors.", simTransmission);
  R("topology", "sim", "Networks", "Network Topologies", "Build bus, star, ring, mesh and tree networks. Send packets between PCs and break links to test each topology's reliability.", simTopology);
  R("clientserver", "viz", "Protocols", "Client-Server Communication", "Everything that happens when you open a website: DNS lookup, TCP connection, TLS handshake and the HTTP request/response.", simClientServer);
  R("osi", "sim", "Models & Packets", "OSI Layer Explorer", "Click through all seven OSI layers to see their functions, protocols, devices and data units.", simOSI);
  R("encapsulation", "viz", "Models & Packets", "Encapsulation & Decapsulation", "Step through encapsulation at the sender and decapsulation at the receiver. Hover over headers to see their fields.", simEncapsulation);
  R("signals", "sim", "Signals & Encoding", "Digital Signal Encoding", "Enter any bit pattern to see it as NRZ-L, NRZ-I, Manchester and Differential Manchester signals, or as ASK/FSK/PSK modulation.", simSignals);
  R("switching", "sim", "Switching & Routing", "Circuit vs Packet Switching", "Send a message using circuit switching (reserved path) or packet switching (independent packets) and compare.", simSwitching);
  R("switchlearn", "sim", "Switching & Routing", "Switch MAC Learning", "See how a switch learns MAC addresses, floods unknown frames and forwards known ones - and compare with a hub.", simSwitchLearn);
  R("routing", "sim", "Switching & Routing", "Shortest Path Routing", "Run Dijkstra's algorithm (used by OSPF) step by step. Change link costs or break links and see the routing table update.", simRouting);
  R("handshake", "viz", "Protocols", "TCP Handshake vs UDP", "Watch the TCP three-way handshake, data with acknowledgements, retransmission after loss, and connection teardown - then compare with UDP.", simHandshake);
  R("dns", "viz", "Protocols", "DNS Resolution", "Follow a DNS query from your PC through the resolver, root, TLD and authoritative servers.", simDNS);
  R("dhcp", "viz", "Protocols", "DHCP (DORA)", "See how a new device gets an IP address automatically with Discover, Offer, Request and Acknowledge.", simDHCP);
})();
