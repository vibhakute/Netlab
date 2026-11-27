/* =========================================================
   NetLab app shell: icons, students, storage, progress, badges,
   units/topics model, header, learning sidebar, search, helpers.
   Every student's progress is kept in its own LocalStorage record
   ("student_progress_<STUDENT ID>"); nothing is shared between IDs.
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
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    cap: '<path d="M22 9 12 4 2 9l10 5 10-5z"/><path d="M6 11.2V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.8"/><path d="M22 9v6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
  };
  function icon(name, size) {
    size = size || 20;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || "") + "</svg>";
  }

  /* ---------- Students (one LocalStorage record per Student ID) ----------
     Each student's data is saved under "student_progress_<ID>". The signed-in ID
     is kept in "netlab:currentStudent"; signing out only clears that pointer, so
     every student's saved progress stays on the device. */
  const STUDENT_PREFIX = "student_progress_", CURRENT_KEY = "netlab:currentStudent";
  // Everything that belongs to one student. A new student starts from this template.
  const STUDENT_FIELDS = {
    completed: [],     // completed lessons (topic ids)
    quiz: {},          // quiz and test scores: { key: { best, last, attempts } }
    exercises: [],     // solved practice activities
    viz: [],           // visualizations / simulations explored
    steps: {},         // per-lesson workflow steps done (current learning progress)
    recent: [],        // recently studied lessons, newest first
    saved: [],         // starred revision points
    mynotes: {},       // personal notes per lesson
    badges: {},        // achievements: { badgeId: timeEarned }
    lastVisited: null  // last page: { href, title, t }
  };
  const clone = v => JSON.parse(JSON.stringify(v));
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsRemove(k) { try { localStorage.removeItem(k); } catch (e) { /* storage blocked */ } }
  let cache = null; // { id, data } of the signed-in student, re-read when it changes in another tab

  const Student = {
    normalize(raw) { return String(raw == null ? "" : raw).trim().toUpperCase(); },
    // Returns an error message, or "" when the ID is valid.
    validate(raw) {
      const id = this.normalize(raw);
      if (!id) return "Please enter your PRN.";
      if (/\s/.test(id)) return "The PRN cannot contain spaces.";
      if (id.length < 3 || id.length > 20) return "The PRN must be 3 to 20 characters long.";
      if (!/^[A-Z0-9][A-Z0-9_-]*$/.test(id)) return "Use only letters and digits (hyphens - and underscores _ are also allowed).";
      return "";
    },
    storageKey(id) { return STUDENT_PREFIX + id; },
    fresh(id) { const now = Date.now(); return Object.assign(clone(STUDENT_FIELDS), { studentId: id, created: now, updated: now }); },
    exists(raw) { return lsGet(this.storageKey(this.normalize(raw))) != null; },
    // Loads a student's record; a missing or damaged record becomes a fresh one.
    load(id) {
      let d = null;
      try { d = JSON.parse(lsGet(this.storageKey(id)) || "null"); } catch (e) { d = null; }
      if (!d || typeof d !== "object" || Array.isArray(d) || (d.studentId && d.studentId !== id)) d = this.fresh(id);
      d.studentId = id;
      Object.keys(STUDENT_FIELDS).forEach(k => { if (d[k] == null) d[k] = clone(STUDENT_FIELDS[k]); });
      return d;
    },
    save(id, data) { data.updated = Date.now(); return lsSet(this.storageKey(id), JSON.stringify(data)); },
    current() { const id = this.normalize(lsGet(CURRENT_KEY)); return id && !this.validate(id) ? id : null; },
    data() {
      const id = this.current();
      if (!id) return null;
      if (!cache || cache.id !== id) cache = { id, data: this.load(id) };
      return cache.data;
    },
    login(raw) {
      const err = this.validate(raw);
      if (err) return { ok: false, error: err };
      const id = this.normalize(raw), isNew = !this.exists(id);
      if (isNew && !this.save(id, this.fresh(id))) return { ok: false, error: "This browser is blocking site storage, so progress cannot be saved. Allow site data for this page and try again." };
      if (!lsSet(CURRENT_KEY, id)) return { ok: false, error: "This browser is blocking site storage. Allow site data for this page and try again." };
      cache = null;
      return { ok: true, id, isNew };
    },
    logout() { lsRemove(CURRENT_KEY); cache = null; } // the student's record is kept
  };
  // Another tab signed in, signed out or saved progress: stay consistent.
  window.addEventListener("storage", e => {
    if (e.key === CURRENT_KEY) location.reload();
    else if (cache && e.key === Student.storageKey(cache.id)) cache = null;
  });

  /* ---------- Persistent storage ----------
     Student fields are read from / written to the signed-in student's record
     (saved immediately). Other keys (ui:* view preferences) are device settings. */
  const NS = "netlearn:";
  const isStudentKey = key => Object.prototype.hasOwnProperty.call(STUDENT_FIELDS, key);
  const Store = {
    get(key, fallback) {
      if (isStudentKey(key)) { const d = Student.data(); return d && d[key] != null ? d[key] : fallback; }
      try { const v = localStorage.getItem(NS + key); return v == null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set(key, value) {
      if (isStudentKey(key)) {
        const id = Student.current(); if (!id) return false;
        const d = Student.data(); d[key] = value;
        return Student.save(id, d);
      }
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
      this.checkBadges();
    },
    quiz() { return Store.get("quiz", {}); },
    saveQuiz(key, pct) {
      const q = this.quiz();
      const prev = q[key] || { best: 0, attempts: 0 };
      q[key] = { best: Math.max(prev.best, pct), last: pct, attempts: prev.attempts + 1 };
      Store.set("quiz", q);
      this.checkBadges();
    },
    exercises() { return Store.get("exercises", []); },
    markExercise(id) { const l = this.exercises(); if (l.indexOf(id) === -1) { l.push(id); Store.set("exercises", l); this.checkBadges(); } },
    viz() { return Store.get("viz", []); },
    markViz(id) { const l = this.viz(); if (l.indexOf(id) === -1) { l.push(id); Store.set("viz", l); this.checkBadges(); } },
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
    // Achievements: earned automatically and saved with the time they were earned.
    badges() { return Store.get("badges", {}); },
    checkBadges() {
      if (!Student.current()) return [];
      const have = this.badges(), earned = [];
      BADGES.forEach(b => { if (!have[b.id] && b.test(this)) { have[b.id] = Date.now(); earned.push(b); } });
      if (earned.length) {
        Store.set("badges", have);
        earned.forEach((b, i) => setTimeout(() => toast("Badge earned: " + b.title), 400 + i * 2600));
      }
      return earned;
    },
    lastVisited() { return Store.get("lastVisited", null); },
    // Resets the signed-in student's learning progress; personal notes, saved points and uploads are kept.
    reset() { ["completed", "exercises", "viz", "recent"].forEach(k => Store.set(k, [])); Store.set("quiz", {}); Store.set("steps", {}); Store.set("badges", {}); }
  };
  const doneCount = list => list.filter(t => Progress.isDone(t.id)).length;
  const BADGES = [
    { id: "first-topic", title: "First Steps", icon: "check", desc: "Complete your first topic.", test: () => doneCount(topics()) >= 1 }
  ].concat(UNITS.map(u => ({ id: "unit-" + u.id, title: u.name + " Complete", icon: u.icon, desc: "Complete every topic of " + u.name + ": " + u.title + ".", test: () => { const l = topicsInUnit(u.id); return l.length > 0 && doneCount(l) === l.length; } }))).concat([
    { id: "quiz-ace", title: "Quiz Ace", icon: "star", desc: "Score 100% in any topic quiz or test.", test: p => Object.keys(p.quiz()).some(k => p.quiz()[k].best === 100) },
    { id: "exam-ready", title: "Exam Ready", icon: "award", desc: "Score 70% or more in all four unit tests.", test: p => UNITS.every(u => ((p.quiz()["exam:" + u.id] || {}).best || 0) >= 70) },
    { id: "explorer", title: "Explorer", icon: "eye", desc: "Explore 20 visualizations and simulations.", test: p => p.viz().length >= 20 },
    { id: "practice", title: "Practice Champion", icon: "code", desc: "Solve all nine practice exercises.", test: p => EXERCISES.every(e => p.exercises().indexOf(e[1].split("#")[1]) !== -1) },
    { id: "course", title: "Course Complete", icon: "layers", desc: "Complete all topics of Units I–IV.", test: () => topics().length > 0 && doneCount(topics()) === topics().length }
  ]);

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
        '<a class="brand" href="index.html"><span class="logo">' + icon("cap", 20) + '</span><span class="brand-text"><b>Net<span>Lab</span></b><small>Data Communication</small></span></a>' +
        '<nav class="topnav" aria-label="Main">' +
        NAV.map(n => '<a href="' + n.href + '"' + (n.id === page ? ' class="active" aria-current="page"' : "") + ">" + icon(n.icon, 16) + n.label + "</a>").join("") +
        "</nav>" +
        '<div class="top-right"><div class="search">' + icon("search", 16) +
        '<input id="searchInput" type="search" placeholder="Search topics..." autocomplete="off" aria-label="Search topics">' +
        '<div class="search-results" id="searchResults"></div></div>' + studentChip() + "</div>" +
        "</div>";
    }
    const footer = document.getElementById("site-footer");
    if (footer) {
      footer.innerHTML = '<footer class="footer"><div>' + NAV.map(n => '<a href="' + n.href + '">' + n.label + "</a>").join("") +
        '</div><p style="margin:10px 0 0">NetLab — Data Communication learning platform (Units I–IV). Progress is saved in this browser, separately for each student (PRN).</p></footer>';
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
    initStudent();
  }

  /* ---------- Student sign-in screen, header chip and switching ---------- */
  function studentChip() {
    const id = Student.current();
    if (!id) return "";
    return '<div class="student" id="student"><button class="student-btn" id="studentBtn" aria-haspopup="true" aria-expanded="false" title="Signed in with PRN ' + escapeHtml(id) + '">' +
      icon("user", 16) + "<span>" + escapeHtml(id) + "</span></button>" +
      '<div class="student-menu" id="studentMenu" role="menu"><div class="sm-head"><small>Signed in · PRN</small><b>' + escapeHtml(id) + "</b></div>" +
      '<a href="learn.html#/progress" role="menuitem">' + icon("chart", 15) + " My progress &amp; badges</a>" +
      '<button type="button" id="switchStudent" role="menuitem">' + icon("logout", 15) + " Switch student / Log out</button></div></div>";
  }
  function initStudent() {
    const id = Student.current();
    if (!id) { if (!document.body.hasAttribute("data-nogate")) showGate(); return; }
    const btn = document.getElementById("studentBtn"), box = document.getElementById("student");
    if (btn) {
      btn.addEventListener("click", e => { e.stopPropagation(); const open = box.classList.toggle("open"); btn.setAttribute("aria-expanded", open); });
      document.addEventListener("click", e => { if (!e.target.closest("#student")) { box.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); } });
      document.getElementById("switchStudent").addEventListener("click", () => {
        if (!confirm("Log out PRN " + id + "?\n\nYour progress stays saved on this device. Sign in again with the same PRN to continue.")) return;
        Student.logout();
        location.href = "index.html";
      });
    }
    let w = null; try { w = sessionStorage.getItem("netlab:welcome"); sessionStorage.removeItem("netlab:welcome"); } catch (e) { /* ignore */ }
    if (w) setTimeout(() => toast(w === "new" ? "Welcome, " + id + ". A new progress record has been created." : "Welcome back, " + id + ". Your progress has been restored."), 300);
    setTimeout(() => Progress.checkBadges(), 1200); // award badges already earned (e.g. progress made before badges existed)
    // Remember the last page this student visited.
    const remember = () => setTimeout(() => {
      const file = location.pathname.split("/").pop() || "index.html";
      if (file === "index.html") return; // the home page is the starting point, not a "last visited" page
      Store.set("lastVisited", { href: file + location.hash, title: document.title.replace(/\s+—\s+NetLab$/, ""), t: Date.now() });
    }, 400);
    remember(); window.addEventListener("hashchange", remember);
  }
  /* Sign-in page shown until a student enters their PRN. */
  const GATE_SVG = {
    cap: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 9 12 4 2 9l10 5 10-5z"/><path d="M6 11.2V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.8"/><path d="M22 9v6"/></svg>',
    users: '<svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor" aria-hidden="true"><circle cx="12" cy="7.5" r="4"/><path d="M4 21c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5z"/><circle cx="4.6" cy="9.5" r="2.6" opacity=".55"/><circle cx="19.4" cy="9.5" r="2.6" opacity=".55"/><path d="M0 19c0-2.6 1.8-4.6 4.4-5-1 1.4-1.6 3.1-1.7 5z" opacity=".55"/><path d="M24 19c0-2.6-1.8-4.6-4.4-5 1 1.4 1.6 3.1 1.7 5z" opacity=".55"/></svg>',
    card: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4M14 10h5M14 14h4"/></svg>',
    login: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zm2 0h6V7a3 3 0 0 0-6 0z"/></svg>',
    book: '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M2 5.5C4.5 4.2 8 4 11 5.6V20c-3-1.5-6.5-1.4-9 0z" fill="#3b82f6"/><path d="M22 5.5c-2.5-1.3-6-1.5-9 .1V20c3-1.5 6.5-1.4 9 0z" fill="#1d4ed8"/></svg>',
    quiz: '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><rect x="3" y="2" width="15" height="20" rx="2.5" fill="#16a34a"/><path d="M6.5 7h3M6.5 12h3M6.5 17h3M12 7h3M12 12h2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="18" cy="17" r="4.5" fill="#fff" stroke="#16a34a" stroke-width="1.6"/><path d="m16 17 1.4 1.4 2.6-2.8" fill="none" stroke="#16a34a" stroke-width="1.6" stroke-linecap="round"/></svg>',
    chart: '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><rect x="3" y="13" width="4" height="8" rx="1" fill="#8b5cf6"/><rect x="10" y="9" width="4" height="12" rx="1" fill="#7c3aed"/><rect x="17" y="5" width="4" height="16" rx="1" fill="#6d28d9"/><path d="m3 10 6-5 4 3 7-6" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M7 3h10v6a5 5 0 0 1-10 0z" fill="#f59e0b"/><path d="M7 5H3.5a3.5 3.5 0 0 0 3.8 4.2M17 5h3.5a3.5 3.5 0 0 1-3.8 4.2" fill="none" stroke="#f59e0b" stroke-width="2"/><rect x="10.5" y="13.5" width="3" height="4" fill="#d97706"/><rect x="7" y="17.5" width="10" height="3.5" rx="1" fill="#b45309"/></svg>'
  };
  // Illustration: a student studying at a laptop.
  const GATE_ART = '<img class="gate-art" src="assets/img/student-study.jpg" width="670" height="300" alt="A student studying on a laptop">';
  function showGate() {
    document.body.classList.add("gate-open");
    const g = document.createElement("div");
    g.className = "gate"; g.setAttribute("role", "dialog"); g.setAttribute("aria-modal", "true"); g.setAttribute("aria-labelledby", "gateTitle");
    const feat = (svg, cls, a, b) => '<li><span class="gf-ic ' + cls + '">' + GATE_SVG[svg] + "</span>" + a + "<br>" + b + "</li>";
    g.innerHTML =
      '<header class="gate-top"><div class="gate-logo"><span class="gl-mark">' + GATE_SVG.cap + '</span><b>Net<span>Lab</span></b><i class="gl-sep"></i><em>Learn · Practice · Grow</em></div>' +
      '<span class="gate-pill">' + GATE_SVG.cap + "Educational Platform</span></header>" +
      '<div class="gate-main">' +
      '<section class="gate-welcome">' +
      '<span class="gate-chip"><i></i>Your Learning Journey Begins Here</span>' +
      '<h2>Welcome to <span>NetLab!</span></h2>' +
      "<p>A smart and interactive platform to learn, practice and track your progress in Data Communication.</p>" +
      '<ul class="gate-feats">' + feat("book", "blue", "Interactive", "Lessons") + feat("quiz", "green", "Engaging", "Quizzes") + feat("chart", "violet", "Track", "Progress") + feat("trophy", "amber", "Earn", "Achievements") + "</ul>" +
      GATE_ART + "</section>" +
      '<form class="gate-card" id="gateForm" novalidate>' +
      '<div class="gate-brand"><span class="gb-mark">' + GATE_SVG.cap + '</span><span><b>Net<span>Lab</span></b><small>Data Communication</small></span></div>' +
      '<div class="gate-users">' + GATE_SVG.users + "</div>" +
      '<h1 id="gateTitle">Student Sign-In</h1>' +
      "<p>Enter your PRN to access your personalized learning dashboard and track your progress.</p>" +
      '<label for="gateId"><span class="lb-ic">' + GATE_SVG.card + "</span>PRN</label>" +
      '<input id="gateId" class="input" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="20" placeholder="e.g. 1234567890" aria-describedby="gateErr">' +
      '<div class="gate-err" id="gateErr" role="alert"></div>' +
      '<button class="gate-btn" type="submit">' + GATE_SVG.login + "Continue</button>" +
      '<p class="gate-note">' + GATE_SVG.lock + "<span>Your progress is saved automatically in this browser using Local Storage. You can safely continue anytime.</span></p>" +
      "</form></div>";
    document.body.appendChild(g);
    const input = g.querySelector("#gateId"), err = g.querySelector("#gateErr");
    input.addEventListener("input", () => { err.textContent = ""; input.classList.remove("bad"); });
    g.querySelector("#gateForm").addEventListener("submit", e => {
      e.preventDefault();
      const r = Student.login(input.value);
      if (!r.ok) { err.textContent = r.error; input.classList.add("bad"); input.focus(); return; }
      try { sessionStorage.setItem("netlab:welcome", r.isNew ? "new" : "back"); } catch (x) { /* ignore */ }
      location.reload();
    });
    setTimeout(() => input.focus(), 50);
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
  // Page context (which view, topic and step is open) for page scripts.
  let context = { page: "" };
  function setContext(c) { context = Object.assign({ page: document.body.getAttribute("data-page") || "" }, c || {}); document.dispatchEvent(new CustomEvent("netlearn:context", { detail: context })); }
  function getContext() { return context; }

  window.App = {
    icon, Student, Store, Progress, BADGES, UNITS, STEPS, topics, topicById, topicsInUnit, unitOf, unitById, sequence, neighbours,
    unitBadge, topicHref, escapeHtml, shuffle, renderSidebar, setSidebarActive, closeMobileNav,
    learnSidebar, searchAll, toast, download, setContext, getContext
  };

  document.addEventListener("DOMContentLoaded", renderShell);
})();
