/* Visualization Studio: every visualization and simulation in one place.
   visualizer.html#<module-id> opens a module directly. */
(function () {
  "use strict";
  const A = App, { icon, escapeHtml, Store } = A;
  const PRIORITY = [
    ["Data transmission", "transmission"], ["Network topologies", "topology"], ["OSI model", "osi"], ["Encapsulation & decapsulation", "encapsulation"],
    ["Packet formation lab", "s-packet"], ["TCP vs UDP & the TCP handshake", "handshake"], ["DNS resolution", "dns"], ["DHCP (DORA)", "dhcp"],
    ["Routing", "routing"], ["Switching (MAC learning)", "switchlearn"], ["Digital encoding", "signals"], ["AM / FM / PM", "s-analogmod"],
    ["FSK / BPSK / QPSK / QAM", "s-digitalmod"], ["FDM / TDM", "s-mux"], ["Optical fibre", "s-fibre"], ["Transmission media comparison", "s-mediapick"],
    ["Error detection & noise", "s-errordetect"]
  ];
  const list = document.getElementById("studioList"), main = document.getElementById("studioMain");
  let mounted = null;
  let filter = Store.get("ui:studioFilter", { q: "", kind: "all" });
  const usedIn = id => A.topics().filter(t => (t.viz && t.viz.id === id) || (t.sim && t.sim.id === id));
  const catOrder = c => { const m = /^Unit (I{1,3}|IV)\b/.exec(c); return m ? ["I", "II", "III", "IV"].indexOf(m[1]) : 10; };

  function drawList(active) {
    const q = filter.q.toLowerCase().trim();
    const mods = VizKit.all().filter(m => (filter.kind === "all" || m.kind === filter.kind) && (!q || (m.title + " " + m.desc + " " + m.category).toLowerCase().indexOf(q) !== -1));
    const cats = Array.from(new Set(mods.map(m => m.category))).sort((a, b) => catOrder(a) - catOrder(b) || a.localeCompare(b));
    list.innerHTML = '<div class="filter"><input type="search" id="stQ" placeholder="Filter ' + VizKit.all().length + ' modules…" value="' + escapeHtml(filter.q) + '" aria-label="Filter modules">' +
      '<select id="stKind" aria-label="Module type"><option value="all">All modules</option><option value="viz"' + (filter.kind === "viz" ? " selected" : "") + '>Visualizations</option><option value="sim"' + (filter.kind === "sim" ? " selected" : "") + ">Simulations</option></select></div>" +
      '<a href="visualizer.html#"' + (!active ? ' class="active"' : "") + ">" + icon("home", 15) + " Studio home</a>" +
      cats.map(c => "<h4>" + escapeHtml(c) + "</h4>" + mods.filter(m => m.category === c).sort((a, b) => a.title.localeCompare(b.title)).map(m => '<a href="#' + m.id + '"' + (m.id === active ? ' class="active"' : "") + '><span class="k ' + m.kind + '">' + m.kind + "</span>" + escapeHtml(m.title) + "</a>").join("")).join("") +
      (mods.length ? "" : '<p class="muted" style="padding:0 16px;font-size:.88rem">No modules match.</p>') +
      '<div class="lsb-site"><div class="lsb-sub">Site</div><a href="index.html">Home</a><a href="learn.html">Learn</a><a href="exercises.html">Practice</a><a href="quiz.html">Exams</a><a href="notes.html">Study Notes</a></div>';
    const qi = list.querySelector("#stQ");
    qi.oninput = () => { filter.q = qi.value; Store.set("ui:studioFilter", filter); const pos = qi.selectionStart; drawList(active); const n = list.querySelector("#stQ"); n.focus(); n.setSelectionRange(pos, pos); };
    list.querySelector("#stKind").onchange = e => { filter.kind = e.target.value; Store.set("ui:studioFilter", filter); drawList(active); };
    list.querySelectorAll("a").forEach(a => a.addEventListener("click", A.closeMobileNav));
    const act = list.querySelector("a.active[href^='#']"); if (act && act.scrollIntoView) { const r = act.getBoundingClientRect(), pr = list.getBoundingClientRect(); if (r.top < pr.top || r.bottom > pr.bottom) act.scrollIntoView({ block: "center" }); }
  }

  function home() {
    document.title = "Visualization Studio — NetLab";
    A.setContext({ view: "studio" });
    const all = VizKit.all(), explored = A.Progress.viz();
    const pr = PRIORITY.filter(p => VizKit.get(p[1]));
    main.innerHTML = '<div class="fade-in"><div class="page-head"><div><span class="kicker">Visualization Studio</span><h1>See it working</h1>' +
      "<p>" + all.filter(m => m.kind === "viz").length + " step-by-step visualizations and " + all.filter(m => m.kind === "sim").length + " interactive simulations. You have explored " + explored.filter(id => VizKit.get(id)).length + ".</p></div></div>" +
      "<h2>Core labs</h2><div class=\"featured\">" + pr.map((p, i) => { const m = VizKit.get(p[1]); return '<a href="#' + m.id + '"><span class="fic">' + icon(m.kind === "viz" ? "eye" : "flask", 18) + '</span><span class="n">' + String(i + 1).padStart(2, "0") + ' · <span class="k ' + m.kind + '">' + m.kind + "</span></span><b>" + escapeHtml(p[0]) + "</b><small>" + escapeHtml(m.title) + (explored.indexOf(m.id) !== -1 ? " · ✓ explored" : "") + "</small></a>"; }).join("") + "</div>" +
      '<p class="muted" style="font-size:.9rem">Every module is also built into the matching lesson (Visualize and Simulate steps). Use the list on the left to browse by unit; on a phone, open it with the menu button.</p></div>';
  }

  function open(id) {
    const m = VizKit.get(id);
    if (!m) { home(); main.insertAdjacentHTML("afterbegin", '<div class="note warn"><span class="note-title">Module not found</span><p>“' + escapeHtml(id) + '” does not exist. Choose one from the list.</p></div>'); return; }
    document.title = m.title + " — Visualization Studio";
    const lessons = usedIn(id);
    A.setContext({ view: "studio", module: id, title: m.title, topic: lessons[0] ? lessons[0].id : undefined });
    main.innerHTML = '<div class="fade-in"><div class="breadcrumb"><a href="#">Studio</a> › ' + escapeHtml(m.category) + "</div>" +
      '<div class="page-head"><div><span class="k ' + m.kind + '">' + (m.kind === "viz" ? "Visualization" : "Simulation") + "</span><h1>" + escapeHtml(m.title) + "</h1><p>" + escapeHtml(m.desc || "") + "</p></div></div>" +
      '<div id="stHost"></div>' +
      (lessons.length ? '<p class="used-in">Used in: ' + lessons.map(t => '<a href="' + A.topicHref(t.id, t.viz && t.viz.id === id ? "viz" : "sim") + '">' + escapeHtml(t.title) + "</a> " + (t.unit ? '<span class="syllabus-tag">' + A.unitById(t.unit).name + "</span>" : '<span class="extra-tag">Additional</span>')).join(" · ") + "</p>" : "") +
      "</div>";
    mounted = VizKit.mount(main.querySelector("#stHost"), id, {});
  }

  function route() {
    if (mounted) { mounted.destroy(); mounted = null; }
    const id = decodeURIComponent(location.hash.replace(/^#/, ""));
    drawList(id);
    if (id) open(id); else home();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", route);
})();
