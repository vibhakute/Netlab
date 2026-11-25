/* Exams page: unit tests, mixed tests, Additional level tests and every
   topic quiz, all run by QuizEngine. quiz.html#<key> opens one directly. */
(function () {
  "use strict";
  const A = App, { icon, escapeHtml, Progress, UNITS, LEVELS } = A;
  const BANK = window.QUIZ || [];
  const sidebar = document.getElementById("sidebar"), content = document.getElementById("content");
  const inUnit = u => q => { const t = A.topicById(q.t); return t && A.unitOf(t) === u; };
  const DEFS = [];
  UNITS.filter(u => u.id !== "extra").forEach(u => DEFS.push({ key: "exam:" + u.id, group: "Unit tests", title: u.name + " test", desc: "15 random questions across all " + A.topicsInUnit(u.id).length + " topics of " + u.name + ": " + u.title + ". Exam weight: " + u.exam + ".", filter: inUnit(u.id), limit: 15 }));
  DEFS.push({ key: "exam:syllabus", group: "Mixed tests", title: "Full syllabus test", desc: "20 random questions from all four units.", filter: q => { const t = A.topicById(q.t); return t && !!t.unit; }, limit: 20 });
  DEFS.push({ key: "mixed", group: "Mixed tests", title: "Mixed challenge (all topics)", desc: "15 random questions from the syllabus and the additional topics.", filter: () => true, limit: 15 });
  LEVELS.forEach(l => DEFS.push({ key: "level-" + l.id, group: "Additional topics", title: l.name + " level test", desc: "12 random questions from the " + l.name.toLowerCase() + " additional lessons.", filter: q => { const t = A.topicById(q.t); return t && !t.unit && t.level === l.id; }, limit: 12 }));
  UNITS.forEach(u => A.topicsInUnit(u.id).forEach(t => DEFS.push({ key: t.id, group: (u.id === "extra" ? "Additional" : u.name) + " topic quizzes", title: t.title, desc: "All questions for this topic, easy to hard.", filter: q => q.t === t.id, topic: t, ordered: true })));
  const byKey = k => DEFS.find(d => d.key === k);

  function drawSidebar(active) {
    const scores = Progress.quiz(), groups = [];
    groups.push({ title: "Overview", items: [{ id: "", label: "Exams home" }] });
    DEFS.forEach(d => { let g = groups.find(x => x.title === d.group); if (!g) groups.push(g = { title: d.group, items: [] }); g.items.push({ id: d.key, label: escapeHtml(d.title) + (scores[d.key] ? ' <span class="muted" style="font-size:.75rem">(' + scores[d.key].best + "%)</span>" : ""), done: scores[d.key] && scores[d.key].best >= 70 }); });
    A.renderSidebar(sidebar, groups, active, id => id ? "#" + encodeURIComponent(id) : "#");
    sidebar.querySelectorAll("a").forEach(a => a.addEventListener("click", A.closeMobileNav));
    A.setSidebarActive(sidebar, active);
  }
  function home() {
    const s = Progress.quiz(), keys = Object.keys(s);
    const avg = keys.length ? Math.round(keys.reduce((a, k) => a + s[k].best, 0) / keys.length) : 0;
    content.innerHTML = '<div class="fade-in"><span class="kicker">Exams</span><h1 style="margin-top:4px">Test yourself</h1>' +
      '<p class="lead">Unit tests, a full syllabus test and ' + DEFS.filter(d => d.topic).length + " topic quizzes — " + BANK.length + " questions in total, each marked easy, medium or hard, with an explanation after every answer.</p>" +
      '<div class="stats"><div class="stat"><div class="num">' + keys.length + '</div><div class="lbl">Quizzes and tests taken</div></div><div class="stat"><div class="num">' + avg + '%</div><div class="lbl">Average best score</div></div><div class="stat"><div class="num">' + keys.filter(k => s[k].best >= 70).length + '</div><div class="lbl">Passed (70% or more)</div></div></div>' +
      "<h2>Unit tests</h2><div class=\"grid grid-4\">" + DEFS.filter(d => d.group === "Unit tests" || d.group === "Mixed tests").map(card).join("") + "</div>" +
      "<h2>Additional topics</h2><div class=\"grid grid-4\">" + DEFS.filter(d => d.group === "Additional topics").map(card).join("") + "</div>" +
      '<p class="muted" style="font-size:.9rem;margin-top:20px">Topic quizzes are listed in the menu, and also appear as step 4 of each lesson.</p></div>';
  }
  function card(d) {
    const sc = Progress.quiz()[d.key], n = BANK.filter(d.filter).length;
    return '<a class="card" href="#' + d.key + '"><span class="cic">' + icon(d.group === "Unit tests" ? "award" : d.group === "Mixed tests" ? "target" : "layers", 20) + '</span><h3>' + escapeHtml(d.title) + "</h3><p>" + Math.min(n, d.limit || n) + " of " + n + " questions</p>" + (sc ? '<p style="margin-top:6px"><b>Best ' + sc.best + "%</b> · " + sc.attempts + " attempt" + (sc.attempts > 1 ? "s" : "") + "</p>" : "") + '<div class="go">Start ' + icon("arrowR", 14) + "</div></a>";
  }
  function exam(d) {
    const qs = BANK.filter(d.filter);
    A.setContext({ view: "exam", topic: d.topic ? d.topic.id : undefined, title: d.title });
    document.title = d.title + " — Exams — NetLab";
    content.innerHTML = '<div class="fade-in"><div class="breadcrumb"><a href="#">Exams</a> › ' + escapeHtml(d.group) + "</div><h1>" + escapeHtml(d.title) + "</h1>" +
      '<p class="muted">' + escapeHtml(d.desc) + (d.topic ? ' <a href="' + A.topicHref(d.topic.id) + '">Revise the lesson →</a>' : "") + '</p><div id="qHost"></div></div>';
    QuizEngine.mount(content.querySelector("#qHost"), { questions: qs, key: d.key, mixed: !d.ordered, limit: d.limit || 0, onFinish: () => drawSidebar(d.key) });
  }
  function route() {
    const k = decodeURIComponent(location.hash.replace(/^#/, "")), d = byKey(k);
    drawSidebar(d ? k : "");
    if (d) exam(d); else { document.title = "Exams — NetLab"; A.setContext({ view: "exams" }); home(); }
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", route);
})();
