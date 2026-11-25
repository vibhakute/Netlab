/* =========================================================
   Learn page: dashboard, unit pages, the 5-step topic workflow
   (Theory → Visualize → Simulate → Quiz → Notes) and progress.
   Routes:  #/  ·  #/unit/<id>  ·  #/topic/<id>/<step>  ·  #/progress
   ========================================================= */
(function () {
  "use strict";
  const A = App, { icon, escapeHtml, Progress, Store, STEPS, UNITS } = A;
  const main = document.getElementById("learnMain");
  const side = document.getElementById("lsb");
  let mounted = null; // active VizKit module

  const strip = h => String(h || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const isSyllabus = t => !!t.unit;
  const stepIdx = id => STEPS.findIndex(s => s.id === id);
  const ago = ts => { const s = (Date.now() - ts) / 1000; if (s < 60) return "just now"; if (s < 3600) return Math.floor(s / 60) + " min ago"; if (s < 86400) return Math.floor(s / 3600) + " h ago"; return Math.floor(s / 86400) + " d ago"; };
  const unitTag = t => isSyllabus(t) ? '<span class="syllabus-tag">' + A.unitById(t.unit).name + " · Syllabus</span>" : '<span class="extra-tag">Additional · ' + A.levelName(t.level) + "</span>";
  const pips = id => { const s = Progress.steps(id); return '<span class="step-pips" title="' + STEPS.filter(x => s[x.id]).map(x => x.label).join(", ") + '">' + STEPS.map(x => '<i class="' + (s[x.id] ? "on" : "") + '"></i>').join("") + "</span>"; };
  const status = id => { const p = Progress.topicPercent(id); return p === 100 ? "Completed" : p > 0 ? "In progress · " + p + "%" : "Not started"; };
  function firstOpenStep(id) { const s = Progress.steps(id); const st = STEPS.find(x => !s[x.id]); return st ? st.id : "theory"; }
  function nextTopicIn(list) { return list.find(t => Progress.topicPercent(t.id) < 100) || list[0]; }

  function route() {
    if (mounted) { mounted.destroy(); mounted = null; }
    const parts = location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
    let r = { route: "dashboard" };
    if (parts[0] === "unit" && A.unitById(parts[1])) r = { route: "unit", unit: parts[1] };
    else if (parts[0] === "topic" && A.topicById(parts[1])) r = { route: "topic", topic: parts[1], step: stepIdx(parts[2]) >= 0 ? parts[2] : "theory" };
    else if (parts[0] === "progress") r = { route: "progress" };
    else if (parts[0] && A.topicById(parts[0])) r = { route: "topic", topic: parts[0], step: "theory" }; // legacy #id
    A.learnSidebar(side, r);
    if (r.route === "unit") renderUnit(r.unit);
    else if (r.route === "topic") renderTopic(r.topic, r.step);
    else if (r.route === "progress") renderProgress();
    else renderDashboard();
    window.scrollTo(0, 0);
  }

  /* ---------------- Dashboard ---------------- */
  function renderDashboard() {
    A.setContext({ view: "dashboard" });
    document.title = "Dashboard — NetLab";
    const ov = Progress.overall(), recent = Progress.recent().filter(r => A.topicById(r.id));
    const cont = recent[0] ? recent[0] : { id: A.sequence()[0].id, step: "theory" };
    const ct = A.topicById(cont.id);
    const syl = A.topics().filter(isSyllabus);
    const sylDone = syl.filter(t => Progress.isDone(t.id)).length;
    main.innerHTML = '<div class="fade-in">' +
      '<div class="page-head"><div><span class="kicker">Learning dashboard</span><h1>Data Communication</h1><p>' + syl.length + " syllabus topics in four units, plus " + (ov.total - syl.length) + " additional networking lessons.</p></div></div>" +
      '<div class="split" style="margin-top:16px">' +
      '<div class="panel"><div class="overview"><div class="ring" style="--p:' + ov.pct + '"><b>' + ov.pct + '%</b></div><div class="meta">' +
      '<div class="kicker">' + (recent.length ? "Continue where you left off" : "Start here") + "</div>" +
      '<h3 style="margin:4px 0 2px">' + escapeHtml(ct.title) + "</h3>" +
      '<div class="muted" style="font-size:.88rem">' + unitTag(ct) + " &nbsp;" + A.STEPS[stepIdx(cont.step)].label + " step</div>" +
      '<a class="btn btn-primary" style="margin-top:12px" href="' + A.topicHref(ct.id, cont.step) + '">' + (recent.length ? "Continue learning" : "Begin Unit I") + " " + icon("arrowR", 16) + "</a></div></div>" +
      '<p class="muted" style="font-size:.86rem;margin:14px 0 0">Syllabus topics completed: <b>' + sylDone + " / " + syl.length + "</b> · All topics completed: <b>" + ov.done + " / " + ov.total + "</b></p></div>" +
      '<div class="panel"><h3><span class="hic">' + icon("clock", 18) + '</span>Recently studied</h3>' + (recent.length ? '<ul class="recent-list">' + recent.slice(0, 5).map(r => { const t = A.topicById(r.id); return '<li><a href="' + A.topicHref(r.id, r.step) + '"><span>' + escapeHtml(t.title) + "</span><small>" + ago(r.t) + "</small></a></li>"; }).join("") + "</ul>"
        : '<p class="muted" style="margin:0">Topics you open will appear here.</p>') + "</div></div>" +
      '<h2 style="margin-top:28px">Course units</h2>' +
      '<div class="panel" style="padding:4px 16px">' + UNITS.map(u => {
        const list = A.topicsInUnit(u.id), pct = Progress.unitPercent(u.id);
        return '<a class="unit-row' + (u.id === "extra" ? " extra" : "") + '" href="#/unit/' + u.id + '"><span class="uic">' + icon(u.icon, 20) + "</span>" +
          "<span><b>" + (u.id === "extra" ? "Additional Learning Topics" : u.name + " · " + u.title) + "</b><small>" + list.length + " topics · " + u.exam + "</small></span>" +
          '<span class="progress"><i style="width:' + pct + '%"></i></span><span class="pc">' + pct + "%</span></a>";
      }).join("") + "</div>" +
      '<p class="muted" style="font-size:.88rem">Every topic follows the same path: <b>Theory → Visualize → Simulate → Quiz → Notes</b>. Units I–IV follow the college syllabus; Additional topics go beyond it into computer networking.</p>' +
      "</div>";
  }

  /* ---------------- Unit page ---------------- */
  function renderUnit(uid) {
    const u = A.unitById(uid), list = A.topicsInUnit(uid), pct = Progress.unitPercent(uid);
    A.setContext({ view: "unit", unit: uid, unitTitle: u.title });
    document.title = (uid === "extra" ? "Additional Topics" : u.name + ": " + u.title) + " — NetLab";
    const nt = nextTopicIn(list);
    const item = (t, n) => '<a class="topic-item' + (Progress.isDone(t.id) ? " done" : "") + '" href="' + A.topicHref(t.id, firstOpenStep(t.id)) + '">' +
      '<span class="num">' + (Progress.isDone(t.id) ? icon("check", 14) : n) + "</span>" +
      "<span><b>" + escapeHtml(t.title) + "</b><small>" + escapeHtml(t.summary || "") + "</small></span>" + pips(t.id) +
      '<span class="st">' + status(t.id) + "<br>" + (t.minutes || 8) + " min</span></a>";
    let body;
    if (uid === "extra") body = A.LEVELS.map(l => '<h3 class="level-head">' + l.name + '</h3><div class="topic-list">' + list.filter(t => t.level === l.id).map((t, i) => item(t, i + 1)).join("") + "</div>").join("");
    else body = '<div class="topic-list">' + list.map((t, i) => item(t, i + 1)).join("") + "</div>";
    main.innerHTML = '<div class="fade-in">' +
      '<div class="breadcrumb"><a href="#/">Dashboard</a> › ' + (uid === "extra" ? "Additional Topics" : u.name) + "</div>" +
      '<div class="page-head"><div><span class="kicker">' + (uid === "extra" ? "Beyond the syllabus" : u.name + " · College syllabus") + "</span><h1>" + escapeHtml(u.title) + "</h1><p>" + escapeHtml(u.desc) + "</p></div>" +
      '<a class="btn btn-primary" href="' + A.topicHref(nt.id, firstOpenStep(nt.id)) + '">' + (pct ? "Continue unit" : "Start unit") + " " + icon("arrowR", 16) + "</a></div>" +
      '<div class="panel"><div class="overview"><div class="ring" style="--p:' + pct + '"><b>' + pct + '%</b></div><div class="meta">' +
      "<div><b>" + list.filter(t => Progress.isDone(t.id)).length + " of " + list.length + "</b> topics completed</div>" +
      '<div class="unit-meta"><span class="pill">' + icon("award", 14) + " " + u.exam + '</span><span class="pill">' + icon("target", 14) + " " + escapeHtml(u.outcome) + "</span></div></div></div></div>" +
      (uid === "extra" ? '<div class="note info"><span class="note-title">Additional learning</span><p>These lessons are not part of the four-unit syllabus. They cover wider computer-networking topics (OSI, TCP/IP, IP addressing, routing, DNS, security…) and are marked <span class="extra-tag">Additional</span> everywhere on the site.</p></div>' : "") +
      body + "</div>";
  }

  /* ---------------- Topic workflow ---------------- */
  function renderTopic(id, step) {
    const t = A.topicById(id), nb = A.neighbours(id), u = A.unitById(A.unitOf(t));
    Progress.visit(id, step);
    A.setContext({ view: "topic", topic: id, title: t.title, step, unit: A.unitOf(t), unitTitle: u.title });
    document.title = t.title + " — NetLab";
    const done = Progress.steps(id);
    const si = stepIdx(step), st = STEPS[si];
    main.innerHTML = '<div class="fade-in">' +
      '<div class="breadcrumb"><a href="#/">Dashboard</a> › <a href="#/unit/' + u.id + '">' + (u.id === "extra" ? "Additional Topics" : u.name) + "</a> › " + escapeHtml(t.title) + "</div>" +
      '<div class="topic-head">' + unitTag(t) + " <span class=\"muted\" style=\"font-size:.85rem\">" + icon("clock", 13) + " " + (t.minutes || 8) + " min</span>" +
      "<h1>" + escapeHtml(t.title) + '</h1><p class="sum">' + escapeHtml(t.summary || "") + "</p></div>" +
      '<nav class="stepper" aria-label="Topic steps">' + STEPS.map((s, k) => '<a href="' + A.topicHref(id, s.id) + '" class="' + (s.id === step ? "active " : "") + (done[s.id] ? "done" : "") + '"' + (s.id === step ? ' aria-current="step"' : "") + ">" +
        '<span class="n">' + icon(done[s.id] ? "check" : s.icon, 12) + "</span>" + s.label + "</a>").join("") + "</nav>" +
      '<div id="stepBody"></div>' +
      '<div class="next-cta">' +
      (si > 0 ? '<a class="btn btn-outline" href="' + A.topicHref(id, STEPS[si - 1].id) + '">' + icon("arrowL", 16) + " " + STEPS[si - 1].label + "</a>" : (nb.prev ? '<a class="btn btn-outline" href="' + A.topicHref(nb.prev.id) + '">' + icon("arrowL", 16) + " Previous topic</a>" : "<span></span>")) +
      (st.next ? '<a class="btn btn-next" id="nextStep" href="' + A.topicHref(id, STEPS[si + 1].id) + '">' + st.next + " " + icon("arrowR", 16) + "</a>" : "") +
      "</div></div>";
    const body = main.querySelector("#stepBody");
    const nx = main.querySelector("#nextStep");
    if (nx) nx.addEventListener("click", () => { if (step !== "quiz") Progress.setStep(id, step); });
    ({ theory: stepTheory, viz: stepViz, sim: stepSim, quiz: stepQuiz, notes: stepNotes })[step](t, body, nb);
  }

  const SEC_ICON = { "Introduction": "book", "Definition": "bookmark", "Why it matters": "target", "How it works": "zap", "Detailed explanation": "layers", "Diagram": "net", "Real-world examples": "globe", "Key terminology": "code", "Advantages and disadvantages": "chart", "Comparison": "layers", "Important exam points": "award", "Summary": "check", "In short": "book", "Key points": "target" };
  function sec(title, html, cls) { return html ? '<section class="th-sec' + (cls ? " " + cls : "") + '"><h2><span class="hic">' + icon(SEC_ICON[title] || "book", 18) + "</span>" + title + "</h2>" + html + "</section>" : ""; }
  const list = (arr, cls) => arr && arr.length ? '<ul class="points' + (cls ? " " + cls : "") + '">' + arr.map(x => "<li>" + x + "</li>").join("") + "</ul>" : "";
  const table = c => c ? '<div class="table-wrap"><table><thead><tr>' + c.head.map(h => "<th>" + h + "</th>").join("") + "</tr></thead><tbody>" + c.rows.map(r => "<tr>" + r.map(x => "<td>" + x + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>" : "";

  function stepTheory(t, body) {
    const depth = Store.get("ui:depth", "deep");
    body.innerHTML = '<div class="topic-tools"><span class="muted" style="font-size:.9rem">Step 1 of 5 · Read the concept</span>' +
      '<div class="seg" role="group" aria-label="Explanation depth"><button data-d="simple" class="' + (depth === "simple" ? "on" : "") + '">Simple</button><button data-d="deep" class="' + (depth === "deep" ? "on" : "") + '">Detailed</button></div></div>' +
      '<div id="theory"></div>';
    const out = body.querySelector("#theory");
    function draw(d) {
      if (isSyllabus(t)) {
        const deep = d === "deep";
        out.innerHTML =
          sec("Introduction", t.intro) +
          sec("Definition", '<div class="definition">' + t.definition + "</div>") +
          sec("Why it matters", t.why) +
          sec("How it works", t.how) +
          (deep ? sec("Detailed explanation", t.deep) : "") +
          (t.diagram ? sec("Diagram", t.diagram) : "") +
          sec("Real-world examples", list(t.examples)) +
          sec("Key terminology", t.terms && t.terms.length ? '<div class="keyterms">' + t.terms.map(x => "<div><b>" + x[0] + "</b><span>" + x[1] + "</span></div>").join("") + "</div>" : "") +
          (t.pros || t.cons ? sec("Advantages and disadvantages", '<div class="pc-grid">' + (t.pros ? '<div class="pros"><h3>Advantages</h3>' + list(t.pros) + "</div>" : "") + (t.cons ? '<div class="cons"><h3>Disadvantages</h3>' + list(t.cons) + "</div>" : "") + "</div>") : "") +
          (deep && t.compare ? sec("Comparison", table(t.compare)) : "") +
          (t.syllabusNote ? '<div class="syllabus-note"><b>Note on the course slides:</b> ' + t.syllabusNote + "</div>" : "") +
          sec("Important exam points", '<div class="exam-box"><h3>' + icon("award", 16) + " Remember for the exam</h3><ol>" + (t.exam || []).map(x => "<li>" + x + "</li>").join("") + "</ol></div>") +
          sec("Summary", '<div class="note tip"><p>' + t.recap + "</p></div>") +
          (t.related && t.related.length ? '<p class="muted" style="font-size:.9rem">Related additional lessons: ' + t.related.filter(A.topicById).map(r => '<a href="' + A.topicHref(r) + '">' + escapeHtml(A.topicById(r).title) + "</a>").join(", ") + "</p>" : "") +
          (t.source ? '<p class="src-note">Syllabus source: ' + escapeHtml(t.source) + "</p>" : "");
      } else {
        const n = t.notes || { points: [], revision: [] };
        out.innerHTML = d === "deep" ? '<div class="lesson">' + t.body + "</div>" :
          sec("In short", '<p class="lead">' + escapeHtml(t.summary || "") + "</p>") +
          sec("Definition", '<div class="definition">' + escapeHtml(n.definition || "") + "</div>") +
          sec("Key points", list(n.points.map(escapeHtml))) +
          (n.compare ? sec("Comparison", table(n.compare)) : "") +
          sec("Summary", '<div class="revision"><h4>Quick revision</h4>' + list(n.revision.map(escapeHtml)) + "</div>") +
          '<p class="muted" style="font-size:.9rem">Switch to <b>Detailed</b> for the full lesson with examples and diagrams.</p>';
      }
      out.querySelectorAll("canvas[data-viz]").forEach(c => c.remove());
    }
    draw(depth);
    body.querySelectorAll("[data-d]").forEach(b => b.onclick = () => { Store.set("ui:depth", b.dataset.d); body.querySelectorAll("[data-d]").forEach(x => x.classList.toggle("on", x === b)); draw(b.dataset.d); });
  }

  function moduleStep(t, body, kind) {
    const spec = kind === "viz" ? t.viz : t.sim;
    const def = spec && window.VizKit && VizKit.get(spec.id);
    const n = kind === "viz" ? 2 : 3;
    if (!spec || !def) {
      body.innerHTML = '<div class="note warn"><span class="note-title">Not available</span><p>No ' + (kind === "viz" ? "visualization" : "simulation") + " is linked to this topic yet.</p></div>";
      return;
    }
    body.innerHTML = '<div class="topic-tools"><span class="muted" style="font-size:.9rem">Step ' + n + " of 5 · " + (kind === "viz" ? "Watch the concept step by step" : "Experiment with the controls") + "</span>" +
      '<a class="btn btn-outline btn-sm" href="visualizer.html#' + spec.id + '">' + icon("layers", 14) + " Open in Studio</a></div>" +
      "<h2 style=\"margin-top:10px\">" + escapeHtml(def.title) + "</h2>" +
      '<p class="step-intro">' + (spec.intro || def.desc || "") + "</p>" +
      (kind === "sim" && spec.tasks && spec.tasks.length ? '<div class="tasks"><h3>' + icon("target", 16) + " Try this</h3><ol>" + spec.tasks.map(x => "<li>" + x + "</li>").join("") + "</ol></div>" : "") +
      '<div id="modHost"></div>' +
      (kind === "viz" ? '<p class="muted" style="font-size:.86rem">Use <b>Pause</b>, <b>Back</b>, <b>Next</b> and the speed menu to go through each stage at your own pace. Click the bars above the explanation to jump to a stage.</p>'
        : '<p class="muted" style="font-size:.86rem">Simulations compute their results in your browser from the formulas shown. Values marked “typical” are representative, not measured.</p>');
    mounted = VizKit.mount(body.querySelector("#modHost"), spec.id, spec.params || {}, { onDone: () => Progress.setStep(t.id, kind) });
  }
  function stepViz(t, body) { moduleStep(t, body, "viz"); }
  function stepSim(t, body) { moduleStep(t, body, "sim"); }

  function stepQuiz(t, body) {
    const qs = (window.QUIZ || []).filter(q => q.t === t.id);
    body.innerHTML = '<div class="topic-tools"><span class="muted" style="font-size:.9rem">Step 4 of 5 · ' + qs.length + " questions, easy to hard. You see the explanation after each answer.</span></div><div id=\"qHost\"></div>";
    if (!qs.length) { body.querySelector("#qHost").innerHTML = '<div class="empty-state">No questions for this topic yet.</div>'; return; }
    QuizEngine.mount(body.querySelector("#qHost"), { questions: qs, key: t.id, onFinish: () => { const s = main.querySelector(".stepper a:nth-child(4)"); if (s) { s.classList.add("done"); s.querySelector(".n").innerHTML = icon("check", 12); } } });
  }

  function notePoints(t) {
    if (isSyllabus(t)) {
      return {
        definition: strip(t.definition),
        points: (t.exam || []).map(strip),
        terms: (t.terms || []).map(x => strip(x[0]) + " — " + strip(x[1])),
        pros: (t.pros || []).map(strip), cons: (t.cons || []).map(strip),
        compare: t.compare, recap: strip(t.recap)
      };
    }
    const n = t.notes || { points: [], revision: [] };
    return { definition: n.definition, points: n.points, terms: [], pros: [], cons: [], compare: n.compare, recap: (n.revision || []).join(" · ") };
  }
  function notesText(t) {
    const n = notePoints(t), L = [];
    L.push(t.title.toUpperCase(), (isSyllabus(t) ? A.unitById(t.unit).name + " (syllabus)" : "Additional topic"), "");
    L.push("DEFINITION", n.definition, "", "KEY POINTS"); n.points.forEach(p => L.push("- " + p));
    if (n.terms.length) { L.push("", "TERMINOLOGY"); n.terms.forEach(p => L.push("- " + p)); }
    if (n.pros.length) { L.push("", "ADVANTAGES"); n.pros.forEach(p => L.push("+ " + p)); }
    if (n.cons.length) { L.push("", "DISADVANTAGES"); n.cons.forEach(p => L.push("- " + p)); }
    if (n.compare) { L.push("", "COMPARISON", strip(n.compare.head.join(" | "))); n.compare.rows.forEach(r => L.push(r.map(strip).join(" | "))); }
    L.push("", "SUMMARY", n.recap);
    const mine = Progress.myNote(t.id); if (mine) L.push("", "MY NOTES", mine);
    return L.join("\n");
  }
  function stepNotes(t, body, nb) {
    const n = notePoints(t);
    const pt = txt => '<li><button class="save-pt' + (Progress.isSaved(t.id, txt) ? " on" : "") + '" data-txt="' + escapeHtml(txt) + '" title="Save this point" aria-label="Save this point">' + icon("star", 14) + "</button><span>" + escapeHtml(txt) + "</span></li>";
    body.innerHTML = '<div class="topic-tools"><span class="muted" style="font-size:.9rem">Step 5 of 5 · Revise and keep your own notes</span>' +
      '<div class="row"><button class="btn btn-outline btn-sm" id="nDl">' + icon("download", 14) + ' Download</button><button class="btn btn-outline btn-sm" id="nPrint">' + icon("print", 14) + " Print</button></div></div>" +
      '<div class="panel" id="printable"><h2 style="margin-top:0">' + escapeHtml(t.title) + " — Revision notes</h2>" +
      '<div class="definition">' + escapeHtml(n.definition) + "</div>" +
      '<h3 style="margin-top:18px">Key points <small class="muted" style="font-weight:400;font-size:.8rem">· click ☆ to save a point to Study Notes</small></h3><ul class="np-list">' + n.points.map(pt).join("") + "</ul>" +
      (n.terms.length ? '<h3>Terminology</h3><ul class="np-list">' + n.terms.map(pt).join("") + "</ul>" : "") +
      (n.pros.length || n.cons.length ? '<div class="pc-grid" style="margin-top:14px">' + (n.pros.length ? '<div class="pros"><h3>Advantages</h3>' + list(n.pros.map(escapeHtml)) + "</div>" : "") + (n.cons.length ? '<div class="cons"><h3>Disadvantages</h3>' + list(n.cons.map(escapeHtml)) + "</div>" : "") + "</div>" : "") +
      (n.compare ? table(n.compare) : "") +
      '<div class="revision" style="margin-top:16px"><h4>Summary</h4><p style="margin:0">' + escapeHtml(n.recap) + "</p></div></div>" +
      '<div class="panel"><h3><span class="hic">' + icon("edit", 18) + '</span>My notes for this topic</h3><textarea class="mynote" id="myNote" placeholder="Write your own notes, doubts or mnemonics. They are saved automatically in this browser.">' + escapeHtml(Progress.myNote(t.id)) + '</textarea>' +
      '<div class="row" style="justify-content:space-between;margin-top:8px"><span class="saved-hint" id="saveHint">Saved automatically</span><a class="btn btn-outline btn-sm" href="notes.html#upload">' + icon("upload", 14) + " Upload study material</a></div></div>" +
      '<div class="complete-bar"><div><b>Finished this topic?</b><div class="muted" style="font-size:.88rem">Marking it complete updates your unit and overall progress.</div></div>' +
      '<button class="btn ' + (Progress.isDone(t.id) ? "btn-outline" : "btn-primary") + '" id="markDone">' + icon("check", 16) + " " + (Progress.isDone(t.id) ? "Completed — undo" : "Mark complete") + "</button></div>" +
      '<div class="lesson-nav">' + (nb.prev ? '<a class="btn btn-outline" href="' + A.topicHref(nb.prev.id) + '">' + icon("arrowL", 16) + " Previous topic</a>" : "<span></span>") +
      (nb.next ? '<a class="btn btn-dark" href="' + A.topicHref(nb.next.id) + '">Next topic: ' + escapeHtml(nb.next.title) + " " + icon("arrowR", 16) + "</a>" : '<a class="btn btn-dark" href="#/progress">View my progress ' + icon("arrowR", 16) + "</a>") + "</div>";
    Progress.setStep(t.id, "notes");
    body.querySelectorAll(".save-pt").forEach(b => b.onclick = () => { const on = Progress.toggleSaved(t.id, b.dataset.txt); b.classList.toggle("on", on); A.toast(on ? "Point saved to Study Notes" : "Point removed"); });
    const ta = body.querySelector("#myNote"), hint = body.querySelector("#saveHint");
    let h; ta.addEventListener("input", () => { hint.textContent = "Saving…"; clearTimeout(h); h = setTimeout(() => { hint.textContent = Progress.setMyNote(t.id, ta.value.trim()) ? "Saved " + new Date().toLocaleTimeString() : "Could not save (browser storage is full or blocked)"; }, 400); });
    body.querySelector("#nDl").onclick = () => A.download(t.id + "-notes.txt", notesText(t));
    body.querySelector("#nPrint").onclick = () => window.print();
    body.querySelector("#markDone").onclick = () => {
      const now = !Progress.isDone(t.id);
      Progress.setDone(t.id, now);
      if (now) STEPS.forEach(s => Progress.setStep(t.id, s.id));
      A.toast(now ? "Topic marked complete" : "Marked as not complete");
      route();
    };
  }

  /* ---------------- Progress page ---------------- */
  function renderProgress() {
    A.setContext({ view: "progress" });
    document.title = "My Learning Progress — NetLab";
    const ov = Progress.overall(), q = Progress.quiz();
    const quizKeys = Object.keys(q);
    const avg = quizKeys.length ? Math.round(quizKeys.reduce((s, k) => s + q[k].best, 0) / quizKeys.length) : 0;
    const modules = window.VizKit ? VizKit.all() : [];
    const explored = Progress.viz().filter(id => modules.some(m => m.id === id)).length;
    main.innerHTML = '<div class="fade-in"><div class="breadcrumb"><a href="#/">Dashboard</a> › Progress</div>' +
      '<div class="page-head"><div><span class="kicker">Saved in this browser</span><h1>My Learning Progress</h1></div>' +
      '<button class="btn btn-outline btn-sm" id="resetP">' + icon("reset", 14) + " Reset progress</button></div>" +
      '<div class="stats" style="margin-top:14px">' +
      '<div class="stat"><div class="num">' + ov.pct + '%</div><div class="lbl">Overall progress</div><div class="progress"><i style="width:' + ov.pct + '%"></i></div></div>' +
      '<div class="stat"><div class="num">' + ov.done + " / " + ov.total + '</div><div class="lbl">Topics completed</div></div>' +
      '<div class="stat"><div class="num">' + quizKeys.length + '</div><div class="lbl">Quizzes taken · average best ' + avg + "%</div></div>" +
      '<div class="stat"><div class="num">' + explored + " / " + modules.length + '</div><div class="lbl">Visualizations &amp; simulations explored</div></div></div>' +
      "<h2>By unit</h2>" + UNITS.map(u => {
        const l = A.topicsInUnit(u.id);
        return '<div class="panel"><div class="row" style="justify-content:space-between"><h3 style="margin:0">' + (u.id === "extra" ? "Additional Topics" : u.name + " · " + escapeHtml(u.title)) + '</h3><a href="#/unit/' + u.id + '">' + Progress.unitPercent(u.id) + "% →</a></div>" +
          '<div class="table-wrap"><table><thead><tr><th>Topic</th><th>Steps done</th><th>Quiz best</th><th>Status</th></tr></thead><tbody>' +
          l.map(t => "<tr><td><a href=\"" + A.topicHref(t.id, firstOpenStep(t.id)) + "\">" + escapeHtml(t.title) + "</a></td><td>" + pips(t.id) + "</td><td>" + (q[t.id] ? q[t.id].best + "% <small class=\"muted\">(" + q[t.id].attempts + "×)</small>" : "—") + "</td><td>" + status(t.id) + "</td></tr>").join("") +
          "</tbody></table></div></div>";
      }).join("") +
      (quizKeys.some(k => !A.topicById(k)) ? "<h2>Exams</h2><div class=\"table-wrap\"><table><thead><tr><th>Exam</th><th>Best</th><th>Last</th><th>Attempts</th></tr></thead><tbody>" +
        quizKeys.filter(k => !A.topicById(k)).map(k => "<tr><td>" + escapeHtml(examName(k)) + "</td><td>" + q[k].best + "%</td><td>" + q[k].last + "%</td><td>" + q[k].attempts + "</td></tr>").join("") + "</tbody></table></div>" : "") +
      "</div>";
    main.querySelector("#resetP").onclick = () => {
      if (!confirm("Reset all learning progress? Your personal notes, saved points and uploaded files are kept.")) return;
      Progress.reset(); A.toast("Progress reset"); route();
    };
  }
  function examName(k) {
    if (k === "mixed") return "Mixed challenge (all topics)";
    if (k.indexOf("level-") === 0) return A.levelName(k.slice(6)) + " level test (Additional)";
    if (k.indexOf("exam:") === 0) { const p = k.slice(5); const u = A.unitById(p); return u ? (u.id === "extra" ? "Additional topics test" : u.name + " unit test") : p === "syllabus" ? "Full syllabus test" : p; }
    return k;
  }

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", route);
})();
