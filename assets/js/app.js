/* =========================================================
   NetLab app shell: icons, storage, progress, units/topics
   model, header, learning sidebar, search and helpers.
   Progress keys from v1 (netlearn:completed / quiz / exercises
   / viz) are read and written unchanged, so no progress is lost.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Icons (inline SVG, stroke-based) ---------- */
  const P = {
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    cube: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    notes: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
    quiz: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    net: '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-2h14v2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    arrowR: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    arrowL: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    play: '<path d="m6 3 14 9-14 9z"/>',
    pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>',
    chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    sidebar: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
    upload: '<path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/>',
    download: '<path d="M12 4v12M6 10l6 6 6-6"/><path d="M4 20h16"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9 17h6"/>',
    send: '<path d="m22 2-11 11"/><path d="m22 2-7 20-4-9-9-4z"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
    star: '<path d="m12 2 3 7 7 .6-5.3 4.7 1.6 7-6.3-3.8-6.3 3.8 1.6-7L2 9.6 9 9z"/>',
    edit: '<path d="M4 20h4l11-11-4-4L4 16z"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    flask: '<path d="M9 3h6M10 3v6L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2l-6-10V3"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    wave: '<path d="M2 12c2-7 4-7 6 0s4 7 6 0 4-7 6 0"/>',
    cable: '<path d="M5 5v5a4 4 0 0 0 4 4h6a4 4 0 0 1 4 4v1"/><rect x="2" y="2" width="6" height="4" rx="1"/><rect x="16" y="19" width="6" height="3" rx="1"/>',
    binary: '<path d="M6 4v6M4 4h2"/><rect x="13" y="4" width="5" height="6" rx="2"/><rect x="4" y="14" width="5" height="6" rx="2"/><path d="M17 14v6M15 14h2"/>',
    signal: '<path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>'
  };
  function icon(name, size) {
    size = size || 20;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || "") + "</svg>";
  }

  /* ---------- Persistent storage (safe) ---------- */
  const NS = "netlearn:";
  const Store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(NS + key); return v == null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(NS + key, JSON.stringify(value)); return true; } catch (e) { return false; }
    }
  };

  /* ---------- Units & topics ---------- */
  const UNITS = [
    { id: "u1", name: "Unit I", title: "Introduction to Data Communication", icon: "net", exam: "MSE 10 marks · ESE 5 marks", outcome: "Identify the data communication type for a network infrastructure.", desc: "Components, transmission modes, serial and parallel transfer, the local loop, LAN/MAN/WAN, network criteria and modems." },
    { id: "u2", name: "Unit II", title: "Transmission Media", icon: "cable", exam: "MSE 10 marks · ESE 5 marks", outcome: "Make use of suitable transmission media for a network application.", desc: "Guided media (twisted pair, coax, fibre, stripline), unguided media (radio, microwave, infrared, satellite), 5G, IoT, secure and high-speed optical media." },
    { id: "u3", name: "Unit III", title: "Digital Codes and Communications", icon: "binary", exam: "ESE 15 marks", outcome: "Apply digital encoding and decoding techniques to real-world communication systems.", desc: "BCD, Gray, ASCII, EBCDIC and Unicode; voice channels and the telephone network; line impairments, crosstalk, echo, jitter and transients." },
    { id: "u4", name: "Unit IV", title: "Modulation and Multiplexing", icon: "wave", exam: "ESE 15 marks", outcome: "Choose the best suited modulation scheme and multiplexing method for real-time applications.", desc: "AM, FM, PM, ASK, FSK, BPSK, QPSK, DPSK and QAM; FDM, synchronous and statistical TDM, FDM channel groups, the T1 carrier and WDM." }
  ];
  const STEPS = [
    { id: "theory", label: "Theory", icon: "book", next: "NEXT: VISUALIZE THIS CONCEPT" },
    { id: "viz", label: "Visualize", icon: "eye", next: "NEXT: INTERACTIVE SIMULATION" },
    { id: "sim", label: "Simulate", icon: "flask", next: "NEXT: TEST YOUR UNDERSTANDING" },
    { id: "quiz", label: "Quiz", icon: "quiz", next: "NEXT: REVISE THE NOTES" },
    { id: "notes", label: "Notes", icon: "notes", next: "" }
  ];

  // Only the four syllabus units are part of the course.
  function topics() { return (window.TOPICS || []).filter(t => t.unit && UNITS.some(u => u.id === t.unit)); }
  function topicById(id) { return topics().find(t => t.id === id); }
  function unitOf(t) { return t ? t.unit : null; }
  function unitById(id) { return UNITS.find(u => u.id === id); }
  function topicsInUnit(u) { return topics().filter(t => unitOf(t) === u); }
  function sequence() { return UNITS.reduce((acc, u) => acc.concat(topicsInUnit(u.id)), []); }
  function neighbours(id) { const s = sequence(), i = s.findIndex(t => t.id === id); return { prev: s[i - 1] || null, next: s[i + 1] || null, index: i, total: s.length }; }
  function unitBadge(t) { const u = unitById(unitOf(t)); return u ? '<span class="badge lvl-unit">' + u.name + "</span>" : ""; }
  function topicHref(id, step) { return "learn.html#/topic/" + encodeURIComponent(id) + "/" + (step || "theory"); }

  /* ---------- Progress ---------- */
  const Progress = {
    completed() { return Store.get("completed", []); },
    isDone(id) { return this.completed().indexOf(id) !== -1; },
    setDone(id, done) {
      const list = this.completed().filter(x => x !== id);
      if (done) list.push(id);
      Store.set("completed", list);
    },
    quiz() { return Store.get("quiz", {}); },
    saveQuiz(key, pct) {
      const q = this.quiz();
      const prev = q[key] || { best: 0, attempts: 0 };
      q[key] = { best: Math.max(prev.best, pct), last: pct, attempts: prev.attempts + 1 };
      Store.set("quiz", q);
    },
    exercises() { return Store.get("exercises", []); },
    markExercise(id) { const l = this.exercises(); if (l.indexOf(id) === -1) { l.push(id); Store.set("exercises", l); } },
    viz() { return Store.get("viz", []); },
    markViz(id) { const l = this.viz(); if (l.indexOf(id) === -1) { l.push(id); Store.set("viz", l); } },
    // Per-topic workflow steps: {theory:true, viz:true, sim:true, notes:true}; quiz comes from quiz scores.
    steps(id) {
      const s = Object.assign({}, Store.get("steps", {})[id] || {});
      if (this.quiz()[id]) s.quiz = true;
      if (this.isDone(id)) STEPS.forEach(x => { s[x.id] = true; });
      return s;
    },
    setStep(id, step) {
      const all = Store.get("steps", {});
      all[id] = Object.assign({}, all[id] || {}, { [step]: true });
      Store.set("steps", all);
    },
    topicPercent(id) {
      if (this.isDone(id)) return 100;
      const s = this.steps(id);
      return Math.round(STEPS.filter(x => s[x.id]).length / STEPS.length * 100);
    },
    unitPercent(unitId) {
      const list = topicsInUnit(unitId);
      if (!list.length) return 0;
      return Math.round(list.reduce((a, t) => a + this.topicPercent(t.id), 0) / list.length);
    },
    overall() {
      const list = topics();
      const done = list.filter(t => this.isDone(t.id)).length;
      const pct = list.length ? Math.round(list.reduce((a, t) => a + this.topicPercent(t.id), 0) / list.length) : 0;
      return { done, total: list.length, pct };
    },
    recent() { return Store.get("recent", []); },
    visit(id, step) {
      const list = this.recent().filter(r => r.id !== id);
      list.unshift({ id, step: step || "theory", t: Date.now() });
      Store.set("recent", list.slice(0, 8));
    },
    saved() { return Store.get("saved", []); },
    isSaved(id, text) { return this.saved().some(s => s.id === id && s.text === text); },
    toggleSaved(id, text) {
      let l = this.saved();
      if (l.some(s => s.id === id && s.text === text)) l = l.filter(s => !(s.id === id && s.text === text));
      else l.unshift({ id, text, t: Date.now() });
      Store.set("saved", l);
      return l.some(s => s.id === id && s.text === text);
    },
    myNotes() { return Store.get("mynotes", {}); },
    myNote(id) { return this.myNotes()[id] || ""; },
    setMyNote(id, text) { const m = this.myNotes(); if (text) m[id] = text; else delete m[id]; return Store.set("mynotes", m); },
    // Resets learning progress only; personal notes, saved points and uploads are kept.
    reset() { ["completed", "exercises", "viz", "recent"].forEach(k => Store.set(k, [])); Store.set("quiz", {}); Store.set("steps", {}); }
  };

  /* ---------- Header / footer ---------- */
  const NAV = [
    { id: "home", href: "index.html", label: "Home", icon: "home" },
    { id: "learn", href: "learn.html", label: "Learn", icon: "book" },
    { id: "studio", href: "visualizer.html", label: "Visualization Studio", icon: "eye" },
    { id: "practice", href: "exercises.html", label: "Practice", icon: "code" },
    { id: "exams", href: "quiz.html", label: "Exams", icon: "award" },
    { id: "notes", href: "notes.html", label: "Study Notes", icon: "notes" }
  ];

  function renderShell() {
    const page = document.body.getAttribute("data-page") || "home";
    const header = document.getElementById("site-header");
    if (header) {
      header.innerHTML =
        '<div class="topbar">' +
        '<button class="menu-btn" id="menuBtn" aria-label="Open navigation">' + icon("menu", 24) + "</button>" +
        '<a class="brand" href="index.html"><span class="logo">' + icon("net", 20) + '</span><span class="brand-text">NetLab<small>Data Communication</small></span></a>' +
        '<nav class="topnav" aria-label="Main">' +
        NAV.map(n => '<a href="' + n.href + '"' + (n.id === page ? ' class="active" aria-current="page"' : "") + ">" + icon(n.icon, 16) + n.label + "</a>").join("") +
        "</nav>" +
        '<div class="top-right"><div class="search">' + icon("search", 16) +
        '<input id="searchInput" type="search" placeholder="Search topics..." autocomplete="off" aria-label="Search topics">' +
        '<div class="search-results" id="searchResults"></div></div></div>' +
        "</div>";
    }
    const footer = document.getElementById("site-footer");
    if (footer) {
      footer.innerHTML = '<footer class="footer"><div>' + NAV.map(n => '<a href="' + n.href + '">' + n.label + "</a>").join("") +
        '</div><p style="margin:10px 0 0">NetLab — learn data communication by seeing it work. Progress, notes and uploaded files are stored only in this browser.</p></footer>';
    }
    const menuBtn = document.getElementById("menuBtn");
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    document.body.appendChild(overlay);
    if (menuBtn) {
      if (!document.querySelector(".sidebar, .lsb, .studio-list")) {
        const sb = document.createElement("aside");
        sb.className = "sidebar mobile-only-nav";
        sb.innerHTML = "<h4>Navigate</h4>" + NAV.map(n => '<a href="' + n.href + '">' + n.label + "</a>").join("");
        document.body.appendChild(sb);
      }
      menuBtn.addEventListener("click", () => document.body.classList.toggle("nav-open"));
      overlay.addEventListener("click", () => document.body.classList.remove("nav-open"));
    }
    initSearch();
  }

  /* ---------- Learning sidebar (Learn + Study Notes pages) ---------- */
  function learnSidebar(el, opts) {
    opts = opts || {};
    const open = Store.get("ui:open", { u1: true });
    const activeUnit = opts.topic ? unitOf(topicById(opts.topic)) : opts.unit;
    if (activeUnit) open[activeUnit] = true;
    const collapsed = Store.get("ui:collapsed", false);
    document.body.classList.toggle("lsb-collapsed", collapsed);
    const item = (href, ic, text, active, extra) => '<a class="lsb-item' + (active ? " active" : "") + '" href="' + href + '" title="' + text + '">' + icon(ic, 18) + "<span>" + text + "</span>" + (extra || "") + "</a>";
    const dot = id => { const p = Progress.topicPercent(id); return '<i class="sdot ' + (p === 100 ? "full" : p > 0 ? "part" : "") + '" title="' + p + '% complete"></i>'; };
    const group = u => {
      const list = topicsInUnit(u.id);
      const isOpen = !!open[u.id];
      const inner = list.map((t, i) => '<a class="lsb-topic' + (t.id === opts.topic ? " active" : "") + '" href="' + topicHref(t.id) + '">' + dot(t.id) + "<span>" + (i + 1) + ". " + t.title + "</span></a>").join("");
      return '<div class="lsb-group' + (isOpen ? " open" : "") + '" data-unit="' + u.id + '">' +
        '<button class="lsb-item lsb-unit' + (activeUnit === u.id ? " current" : "") + '" aria-expanded="' + isOpen + '" title="' + u.name + ": " + u.title + '">' + icon(u.icon, 18) +
        '<span class="lsb-unit-text"><b>' + u.name + "</b><small>" + u.title + "</small></span>" +
        '<em class="lsb-pct">' + Progress.unitPercent(u.id) + '%</em><span class="lsb-chev">' + icon("chevron", 14) + "</span></button>" +
        '<div class="lsb-topics">' + inner + "</div></div>";
    };
    el.classList.add("lsb");
    el.innerHTML =
      '<div class="lsb-head"><span class="lsb-title">Course</span><button class="lsb-toggle" id="lsbToggle" aria-label="' + (collapsed ? "Expand" : "Collapse") + ' sidebar" title="' + (collapsed ? "Expand" : "Collapse") + ' sidebar">' + icon("sidebar", 18) + "</button></div>" +
      '<nav class="lsb-nav" aria-label="Course">' +
      item("learn.html#/", "home", "Dashboard", opts.route === "dashboard") +
      UNITS.map(group).join("") +
      item("notes.html", "notes", "Study Notes", opts.route === "notes") +
      item("learn.html#/progress", "chart", "My Learning Progress", opts.route === "progress") +
      "</nav>" +
      '<div class="lsb-site"><div class="lsb-sub">Site</div>' + NAV.map(n => '<a class="lsb-topic" href="' + n.href + '">' + n.label + "</a>").join("") + "</div>";
    el.querySelector("#lsbToggle").onclick = () => {
      const now = !document.body.classList.contains("lsb-collapsed");
      Store.set("ui:collapsed", now);
      learnSidebar(el, opts);
    };
    el.querySelectorAll(".lsb-unit").forEach(b => b.onclick = () => {
      const g = b.closest(".lsb-group"), u = g.dataset.unit;
      if (document.body.classList.contains("lsb-collapsed")) {
        Store.set("ui:collapsed", false);
        const o = Store.get("ui:open", {}); o[u] = true; Store.set("ui:open", o);
        location.href = "learn.html#/unit/" + u;
        learnSidebar(el, opts);
        return;
      }
      const o = Store.get("ui:open", {}); o[u] = !g.classList.contains("open"); Store.set("ui:open", o);
      g.classList.toggle("open", o[u]); b.setAttribute("aria-expanded", o[u]);
    });
    el.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMobileNav));
    const act = el.querySelector(".lsb-topic.active");
    if (act && act.scrollIntoView) { const r = act.getBoundingClientRect(), pr = el.getBoundingClientRect(); if (r.top < pr.top || r.bottom > pr.bottom) act.scrollIntoView({ block: "center" }); }
  }

  /* ---------- Search ---------- */
  const EXERCISES = [
    ["Transmission Mode Identifier", "exercises.html#modes"], ["LAN, MAN or WAN?", "exercises.html#netscale"],
    ["Match the Transmission Medium", "exercises.html#media"], ["Binary / Decimal Converter", "exercises.html#binary"],
    ["ASCII and EBCDIC Encoder", "exercises.html#codes"], ["Name the Line Impairment", "exercises.html#impair"],
    ["Name the Modulation Technique", "exercises.html#modulation"], ["Name the Multiplexing Technique", "exercises.html#mux"],
    ["TDM and T1 Frame Calculator", "exercises.html#tdm"]
  ];
  let searchIndex = null;
  function buildIndex() {
    const strip = h => String(h || "").replace(/<[^>]+>/g, " ");
    const idx = topics().map(t => ({
      title: t.title, sub: unitById(unitOf(t)).name + " · Lesson", href: topicHref(t.id),
      text: (t.title + " " + (t.summary || "") + " " + strip(t.intro) + " " + strip(t.how) + " " + strip(t.deep) + " " + strip(t.definition)).toLowerCase()
    }));
    if (window.VizKit) VizKit.all().forEach(m => idx.push({ title: m.title, sub: "Studio · " + (m.kind === "viz" ? "Visualization" : "Simulation"), href: "visualizer.html#" + m.id, text: (m.title + " " + (m.desc || "")).toLowerCase() }));
    EXERCISES.forEach(e => idx.push({ title: e[0], sub: "Practice", href: e[1], text: e[0].toLowerCase() }));
    return idx;
  }
  function searchAll(q, limit) {
    if (!searchIndex) searchIndex = buildIndex();
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return searchIndex.map(it => {
      let score = 0;
      words.forEach(w => { if (it.title.toLowerCase().indexOf(w) !== -1) score += 5; if (it.text.indexOf(w) !== -1) score += 1; });
      return { it, score, all: words.every(w => it.text.indexOf(w) !== -1) };
    }).filter(x => x.all && x.score > 0).sort((a, b) => b.score - a.score).slice(0, limit || 8).map(x => x.it);
  }
  function initSearch() {
    const input = document.getElementById("searchInput");
    const box = document.getElementById("searchResults");
    if (!input || !box) return;
    function run() {
      const q = input.value.trim();
      if (!q) { box.classList.remove("open"); return; }
      const hits = searchAll(q, 8);
      box.innerHTML = hits.length ? hits.map(h => '<a href="' + h.href + '">' + escapeHtml(h.title) + "<span>" + h.sub + "</span></a>").join("")
        : '<div class="empty">No results for "' + escapeHtml(q) + '"</div>';
      box.classList.add("open");
    }
    input.addEventListener("input", run);
    input.addEventListener("focus", run);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") { const a = box.querySelector("a"); if (a) { location.href = a.getAttribute("href"); box.classList.remove("open"); input.blur(); } }
      if (e.key === "Escape") { box.classList.remove("open"); input.blur(); }
    });
    box.addEventListener("click", () => setTimeout(() => box.classList.remove("open"), 50));
    document.addEventListener("click", e => { if (!e.target.closest(".search")) box.classList.remove("open"); });
  }

  /* ---------- Helpers ---------- */
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function closeMobileNav() { document.body.classList.remove("nav-open"); }
  function renderSidebar(el, groups, activeId, hrefFn) {
    el.innerHTML = groups.map(g =>
      "<h4>" + (g.level ? '<span class="dot ' + g.level + '"></span>' : "") + g.title + "</h4>" +
      g.items.map(i => '<a href="' + hrefFn(i.id) + '" data-id="' + i.id + '"' + (i.id === activeId ? ' class="active"' : "") + "><span>" + i.label + "</span>" + (i.done ? '<span class="tick">' + icon("check", 14) + "</span>" : "") + "</a>").join("")
    ).join("");
  }
  function setSidebarActive(el, id) {
    el.querySelectorAll("a").forEach(a => a.classList.toggle("active", a.getAttribute("data-id") === id));
    const act = el.querySelector("a.active");
    if (act && act.scrollIntoView) { const r = act.getBoundingClientRect(), pr = el.getBoundingClientRect(); if (r.top < pr.top || r.bottom > pr.bottom) act.scrollIntoView({ block: "center" }); }
  }
  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2400);
  }
  function download(filename, content, type) {
    const blob = new Blob([content], { type: type || "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  // Page context for the AI assistant (which topic/step the student is on).
  let context = { page: "" };
  function setContext(c) { context = Object.assign({ page: document.body.getAttribute("data-page") || "" }, c || {}); document.dispatchEvent(new CustomEvent("netlearn:context", { detail: context })); }
  function getContext() { return context; }

  window.App = {
    icon, Store, Progress, UNITS, STEPS, topics, topicById, topicsInUnit, unitOf, unitById, sequence, neighbours,
    unitBadge, topicHref, escapeHtml, shuffle, renderSidebar, setSidebarActive, closeMobileNav,
    learnSidebar, searchAll, toast, download, setContext, getContext
  };

  document.addEventListener("DOMContentLoaded", renderShell);
})();
