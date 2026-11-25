/* Home page: animated network hero (computers, servers, routers, moving
   packets) plus progress and "continue learning". */
(function () {
  "use strict";
  const A = App, { icon, escapeHtml, Progress } = A;

  function status() {
    const ov = Progress.overall();
    const recent = Progress.recent().filter(r => A.topicById(r.id));
    const el = document.getElementById("homeStatus");
    let html = '<div class="mini-prog"><div class="lbl">Your progress</div><b>' + ov.pct + '%</b> <small>· ' + ov.done + " of " + ov.total + ' topics complete</small><div class="progress"><i style="width:' + ov.pct + '%"></i></div></div>';
    if (recent.length) {
      const r = recent[0], t = A.topicById(r.id);
      html += '<div class="continue"><div class="lbl">Continue learning</div><a href="' + A.topicHref(r.id, r.step) + '">' + escapeHtml(t.title) + " " + icon("arrowR", 14) + "</a>" +
        (recent.length > 1 ? "<ul>" + recent.slice(1, 4).map(x => '<li><a href="' + A.topicHref(x.id, x.step) + '">' + escapeHtml(A.topicById(x.id).title) + "</a></li>").join("") + "</ul>" : "") + "</div>";
      document.getElementById("startBtn").innerHTML = "CONTINUE LEARNING " + icon("arrowR", 18);
    }
    el.innerHTML = html;
  }

  /* ---------- Hero network animation ---------- */
  function hero() {
    const cv = document.getElementById("heroNet"), ctx = cv.getContext("2d");
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, nodes = [], edges = [], packets = [], last = 0;
    // Layout in fractions; denser on the right so the title stays readable.
    const LAYOUT = [
      ["pc", .54, .16], ["pc", .9, .12], ["server", .97, .42], ["pc", .62, .86], ["server", .93, .84], ["pc", .78, .95], ["pc", .47, .62],
      ["router", .66, .38], ["router", .84, .3], ["router", .76, .64], ["switch", .56, .4], ["switch", .88, .62], ["cloud", .72, .14],
      ["pc", .2, 1], ["router", .33, .95], ["server", .44, 1], ["pc", .27, 1.06]
    ];
    const LINKS = [[0, 10], [6, 10], [10, 7], [7, 8], [7, 9], [8, 1], [8, 12], [12, 7], [8, 2], [9, 11], [11, 2], [11, 4], [9, 3], [9, 5], [11, 5], [9, 14], [14, 13], [14, 15], [14, 16], [6, 14]];
    const COLORS = ["#0b7a5c", "#1f6fd1", "#d9861c", "#6b46c1"];
    function resize() {
      const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const narrow = W < 760;
      nodes = LAYOUT.map(([type, x, y]) => ({ type, x: (narrow ? 0.06 + (x - 0.05) * 0.95 : x) * W, y: (narrow ? 0.56 + y * 0.4 : 0.08 + y * 0.84) * H }));
      edges = LINKS.map(([a, b]) => ({ a, b, len: Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y) }));
    }
    function neighbours(i) { return edges.filter(e => e.a === i || e.b === i).map(e => e.a === i ? e.b : e.a); }
    function route(from) { // random walk through routers/switches until a host is reached
      const path = [from]; let cur = from;
      for (let k = 0; k < 6; k++) {
        const opts = neighbours(cur).filter(n => path.indexOf(n) === -1);
        if (!opts.length) break;
        cur = opts[Math.floor(Math.random() * opts.length)]; path.push(cur);
        if (["pc", "server"].indexOf(nodes[cur].type) !== -1) break;
      }
      return path;
    }
    function spawn() {
      const hosts = nodes.map((n, i) => i).filter(i => nodes[i].type === "pc" || nodes[i].type === "server");
      const p = route(hosts[Math.floor(Math.random() * hosts.length)]);
      if (p.length > 1) packets.push({ path: p, seg: 0, t: 0, color: COLORS[Math.floor(Math.random() * COLORS.length)], speed: 110 + Math.random() * 70 });
    }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    function drawNode(n) {
      const s = "#52606d", f = "#ffffff";
      ctx.lineWidth = 1.6; ctx.strokeStyle = s; ctx.fillStyle = f;
      if (n.type === "pc") { rr(n.x - 18, n.y - 14, 36, 25, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#e8f1fc"; ctx.fillRect(n.x - 13, n.y - 10, 26, 16); ctx.beginPath(); ctx.moveTo(n.x - 8, n.y + 17); ctx.lineTo(n.x + 8, n.y + 17); ctx.moveTo(n.x, n.y + 11); ctx.lineTo(n.x, n.y + 17); ctx.stroke(); }
      else if (n.type === "server") { rr(n.x - 14, n.y - 22, 28, 44, 3); ctx.fill(); ctx.stroke(); for (let i = 0; i < 3; i++) { ctx.fillStyle = "#2fbf8f"; ctx.fillRect(n.x + 5, n.y - 14 + i * 12, 4, 4); ctx.fillStyle = "#c5ccd5"; ctx.fillRect(n.x - 9, n.y - 13 + i * 12, 11, 2); } }
      else if (n.type === "router") { ctx.beginPath(); ctx.arc(n.x, n.y, 17, 0, 7); ctx.fillStyle = "#e8f1fc"; ctx.fill(); ctx.strokeStyle = "#1f6fd1"; ctx.stroke(); ctx.beginPath(); ctx.moveTo(n.x - 8, n.y - 8); ctx.lineTo(n.x + 8, n.y + 8); ctx.moveTo(n.x + 8, n.y - 8); ctx.lineTo(n.x - 8, n.y + 8); ctx.stroke(); }
      else if (n.type === "switch") { rr(n.x - 24, n.y - 11, 48, 22, 4); ctx.fillStyle = "#e5f4ee"; ctx.fill(); ctx.strokeStyle = "#0b7a5c"; ctx.stroke(); for (let i = 0; i < 5; i++) { ctx.fillStyle = "#0b7a5c"; ctx.fillRect(n.x - 17 + i * 7, n.y - 2, 4, 4); } }
      else if (n.type === "cloud") { ctx.beginPath(); ctx.arc(n.x - 14, n.y + 4, 12, 0, 7); ctx.arc(n.x, n.y - 6, 15, 0, 7); ctx.arc(n.x + 15, n.y + 4, 11, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#52606d"; ctx.font = "600 10px Segoe UI, sans-serif"; ctx.textAlign = "center"; ctx.fillText("Internet", n.x, n.y + 30); }
    }
    function frame(ts) {
      const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = W < 760 ? 0.3 : 1;
      ctx.lineWidth = 1.4; ctx.strokeStyle = "rgba(31,41,51,.16)";
      edges.forEach(e => { ctx.beginPath(); ctx.moveTo(nodes[e.a].x, nodes[e.a].y); ctx.lineTo(nodes[e.b].x, nodes[e.b].y); ctx.stroke(); });
      nodes.forEach(drawNode);
      if (!reduce && Math.random() < dt * 2.4 && packets.length < 14) spawn();
      packets = packets.filter(p => {
        const a = nodes[p.path[p.seg]], b = nodes[p.path[p.seg + 1]];
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        p.t += p.speed * dt / len;
        if (p.t >= 1) { p.seg++; p.t = 0; if (p.seg >= p.path.length - 1) return false; }
        const A2 = nodes[p.path[p.seg]], B2 = nodes[p.path[p.seg + 1]];
        const x = A2.x + (B2.x - A2.x) * p.t, y = A2.y + (B2.y - A2.y) * p.t;
        ctx.fillStyle = p.color; rr(x - 7, y - 5, 14, 10, 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.fillRect(x - 7, y - 5, 4, 10);
        return true;
      });
      if (!reduce) requestAnimationFrame(frame);
    }
    resize();
    if (window.ResizeObserver) new ResizeObserver(() => { resize(); if (reduce) frame(0); }).observe(cv);
    if (reduce) { for (let k = 0; k < 6; k++) spawn(); packets.forEach(p => p.t = Math.random()); frame(0); }
    else requestAnimationFrame(frame);
  }

  function steps() {
    const el = document.getElementById("homeSteps");
    if (el) el.innerHTML = A.STEPS.map(s => "<span>" + icon(s.icon, 15) + s.label + "</span>").join("<i>→</i>");
    const k = document.getElementById("heroKicker");
    if (k) k.insertAdjacentHTML("afterbegin", icon("signal", 16));
  }
  document.addEventListener("DOMContentLoaded", () => { status(); steps(); hero(); });
})();
