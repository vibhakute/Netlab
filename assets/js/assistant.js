/* =========================================================
   Study Assistant - floating widget on every page.
   AI features call the local backend (server.mjs), which uses a FREE
   local model through Ollama, or Claude when a paid API key is set.
   The API key lives only on the server (ANTHROPIC_API_KEY).
   Without the backend the widget runs in clearly-labelled
   OFFLINE mode: lesson search, material search with page
   citations, simulation finder and a question-bank teacher.
   ========================================================= */
(function () {
  "use strict";
  if (!window.App) return;
  const A = App, { icon, escapeHtml, Store } = A;

  /* ---------------- Backend client ---------------- */
  const canFetch = location.protocol === "http:" || location.protocol === "https:";
  let statusP = null;
  const NetAI = {
    status() {
      if (statusP) return statusP;
      if (!canFetch) return (statusP = Promise.resolve({ backend: false, configured: false, reason: "file" }));
      const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 3000);
      statusP = fetch("/api/ai/status", { signal: ctl.signal, headers: { Accept: "application/json" } })
        .then(r => r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status)))
        .then(j => j.static ? { backend: false, configured: false, reason: "nobackend" } : Object.assign({ backend: true }, j))
        .catch(() => ({ backend: false, configured: false, reason: "nobackend" }))
        .finally(() => clearTimeout(to));
      return statusP;
    },
    post(path, body) {
      return fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(r => r.json().catch(() => ({ error: "Invalid response from server (HTTP " + r.status + ")." })).then(j => { if (!r.ok || j.error) throw new Error(j.error || "HTTP " + r.status); return j; }));
    },
    chat(body) { return this.post("/api/ai/chat", body); },
    notes(body) { return this.post("/api/ai/notes", body); }
  };
  window.NetAI = NetAI;

  /* ---------------- Helpers ---------------- */
  const strip = h => String(h || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
  function md(text) { // small, safe markdown subset
    const lines = escapeHtml(text).split(/\r?\n/);
    let html = "", inList = null, inCode = false, code = [];
    const inline = s => s.replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<i>$2</i>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|[a-z]+\.html[^)\s]*)\)/g, '<a href="$2">$1</a>');
    const close = () => { if (inList) { html += "</" + inList + ">"; inList = null; } };
    lines.forEach(l => {
      if (/^```/.test(l)) { if (inCode) { html += '<pre class="codebox" style="white-space:pre-wrap;font-size:.8rem">' + code.join("\n") + "</pre>"; code = []; } close(); inCode = !inCode; return; }
      if (inCode) { code.push(l); return; }
      let m;
      if ((m = l.match(/^#{1,4}\s+(.*)/))) { close(); html += "<h4>" + inline(m[1]) + "</h4>"; }
      else if ((m = l.match(/^\s*[-*•]\s+(.*)/))) { if (inList !== "ul") { close(); html += "<ul>"; inList = "ul"; } html += "<li>" + inline(m[1]) + "</li>"; }
      else if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))) { if (inList !== "ol") { close(); html += "<ol>"; inList = "ol"; } html += "<li>" + inline(m[1]) + "</li>"; }
      else if (!l.trim()) close();
      else { close(); html += "<p>" + inline(l) + "</p>"; }
    });
    close(); if (inCode) html += "<pre>" + code.join("\n") + "</pre>";
    return html;
  }
  function topicText(t) {
    if (!t) return "";
    if (t.unit) return [t.definition, t.intro, t.why, t.how, t.deep, (t.exam || []).join(". "), (t.terms || []).map(x => x[0] + ": " + x[1]).join(". "), t.recap].map(strip).join("\n");
    const n = t.notes || {};
    return [n.definition, (n.points || []).join(". "), strip(t.body)].join("\n");
  }
  function lessonDocs() { return A.topics().map(t => ({ id: "lesson:" + t.id, name: t.title, topic: t.id, pages: [{ n: 1, text: topicText(t) }] })); }
  const ctxTopic = () => { const c = A.getContext(); return c.topic ? A.topicById(c.topic) : null; };
  const STEP_NAMES = { theory: "Theory", viz: "Visualization", sim: "Simulation", quiz: "Quiz", notes: "Notes" };

  NetAI.md = md;
  const aiName = () => status.free ? "free AI: " + (status.providerName || "") + ", " + status.model : (status.model || "Claude");

  /* ---------------- Widget ---------------- */
  const MODES = [
    { id: "ask", label: "Ask a doubt", icon: "quiz" },
    { id: "materials", label: "My materials", icon: "file" },
    { id: "sim", label: "Find a simulation", icon: "eye" },
    { id: "notes", label: "Make notes", icon: "notes" },
    { id: "practice", label: "Practice", icon: "target" }
  ];
  const HINT = {
    ask: "Ask anything about the course, e.g. “Why does fibre have lower attenuation than copper?”",
    materials: "Ask about your uploaded PDFs/slides. Answers cite the file and page.",
    sim: "Describe what you want to see, e.g. “show me how QPSK maps bits to phase”.",
    notes: "Type a topic (or leave empty for the current topic) to get revision notes.",
    practice: "Type a topic or unit (or leave empty for the current topic) and press send to start 5 adaptive questions."
  };
  let state = Store.get("ai:ui", { open: false, min: false, mode: "ask" });
  let history = Store.get("ai:history", []);
  let status = { backend: false, configured: false };
  let busy = false, practice = null;
  const saveUi = () => Store.set("ai:ui", state);
  const saveHist = () => Store.set("ai:history", history.slice(-40));

  const fab = document.createElement("button");
  fab.className = "ai-fab"; fab.setAttribute("aria-label", "Open study assistant"); fab.title = "Study assistant";
  fab.innerHTML = icon("bot", 26);
  const panel = document.createElement("section");
  panel.className = "ai-panel"; panel.setAttribute("aria-label", "Study assistant"); panel.setAttribute("role", "dialog");
  panel.innerHTML =
    '<div class="ai-head">' + icon("bot", 20) + '<div class="sp"><b>Study Assistant</b><small id="aiSub">Checking AI connection…</small></div>' +
    '<span class="ai-status" id="aiStatus">…</span>' +
    '<button id="aiClear" title="Clear conversation" aria-label="Clear conversation">' + icon("trash", 16) + "</button>" +
    '<button id="aiMin" title="Minimize" aria-label="Minimize">' + icon("minus", 16) + "</button>" +
    '<button id="aiClose" title="Close" aria-label="Close">' + icon("x", 16) + "</button></div>" +
    '<div class="ai-modes" role="tablist">' + MODES.map(m => '<button role="tab" data-m="' + m.id + '">' + icon(m.icon, 13) + m.label + "</button>").join("") + "</div>" +
    '<div class="ai-body" id="aiBody" aria-live="polite"></div>' +
    '<div class="ai-ctx" id="aiCtx"></div>' +
    '<form class="ai-foot" id="aiForm"><textarea id="aiInput" rows="1" aria-label="Message"></textarea><button type="submit" id="aiSend" aria-label="Send">' + icon("send", 18) + "</button></form>";
  const $ = s => panel.querySelector(s);
  const body = () => $("#aiBody");

  function show() {
    fab.style.display = state.open ? "none" : "";
    panel.style.display = state.open ? "" : "none";
    panel.classList.toggle("min", !!state.min);
    panel.querySelectorAll("[data-m]").forEach(b => { b.classList.toggle("on", b.dataset.m === state.mode); b.setAttribute("aria-selected", b.dataset.m === state.mode); });
    $("#aiInput").placeholder = HINT[state.mode];
  }
  function ctxLine() {
    const c = A.getContext(), t = ctxTopic();
    $("#aiCtx").textContent = t ? "Context: " + (t.unit ? A.unitById(t.unit).name : "Additional") + " › " + t.title + (c.step ? " › " + STEP_NAMES[c.step] : "")
      : c.unitTitle ? "Context: " + c.unitTitle : "Context: " + (document.title.split(" — ")[0] || "NetLab");
  }
  function scroll() { const b = body(); b.scrollTop = b.scrollHeight; }
  function add(role, html, opts) {
    opts = opts || {};
    const d = document.createElement("div");
    d.className = "ai-msg " + (role === "user" ? "me" : role === "system" ? "sys" : "");
    d.innerHTML = html;
    body().appendChild(d); scroll();
    if (opts.persist !== false) { history.push({ role, html, text: opts.text || null }); saveHist(); }
    return d;
  }
  function renderHistory() {
    body().innerHTML = "";
    if (!history.length) intro();
    history.forEach(h => { const d = document.createElement("div"); d.className = "ai-msg " + (h.role === "user" ? "me" : h.role === "system" ? "sys" : ""); d.innerHTML = h.html; d.querySelectorAll("button").forEach(b => b.disabled = true); body().appendChild(d); });
    scroll();
  }
  function intro() {
    const off = !status.configured;
    add("assistant", "<p><b>Hi! I can help you study Data Communication.</b></p><ul><li><b>Ask a doubt</b> about any topic</li><li><b>My materials</b>: answers from your uploaded PDFs/slides with page numbers</li><li><b>Find a simulation</b> that shows a concept</li><li><b>Make notes</b> for a topic</li><li><b>Practice</b>: one question at a time, adapting to you, with a report</li></ul>" +
      (off ? '<p class="src">' + offlineReason() + "</p>" : '<p class="src">AI is connected (' + escapeHtml(aiName()) + "). I use your current topic as context.</p>"), { persist: false });
  }
  function offlineReason() {
    if (status.reason === "file") return "<b>Offline mode.</b> You opened the site as a file, so AI is unavailable. Run <code>npm start</code> and open http://localhost:5050 to enable AI. Until then I search the lessons and your materials — I do not generate new answers.";
    if (status.backend && status.setupHint) return "<b>Offline mode.</b> " + escapeHtml(status.setupHint) + " Then refresh this page. Until then I search the lessons and your materials and do not generate new answers.";
    if (status.backend && status.keyProblem) return "<b>Offline mode: the API key in <code>.env</code> is not valid.</b> " + escapeHtml(status.keyProblem) + " Paste your real key (it starts with <code>sk-ant-api</code> and is about 100 characters long), save the file and restart the server. Until then I search the lessons and your materials and do not generate new answers.";
    if (status.backend && !status.configured) return "<b>Offline mode.</b> The server is running but no API key is configured. Set <code>ANTHROPIC_API_KEY</code> in <code>.env</code> and restart the server. Until then I search the lessons and your materials — I do not generate new answers.";
    return "<b>Offline mode.</b> No AI backend was found (the site is served by a static server). Run <code>npm start</code> with <code>ANTHROPIC_API_KEY</code> set to enable AI. Until then I search the lessons and your materials — I do not generate new answers.";
  }
  function setStatus(s) {
    status = s;
    $("#aiStatus").textContent = s.configured ? "AI connected" : "Offline mode";
    $("#aiStatus").classList.toggle("on", !!s.configured);
    $("#aiStatus").classList.toggle("warn", !s.configured && !!s.keyProblem);
    if (s.keyProblem) $("#aiStatus").textContent = "Key invalid";
    $("#aiSub").textContent = s.configured ? (s.free ? "Free AI · " + (s.providerName || "") + " · " + s.model : "Answers by Claude · grounded in your course") : "Lesson & material search";
    if (s.configured && s.free) $("#aiStatus").textContent = "Free AI";
  }

  /* ---------------- Mode handlers ---------------- */
  function aiMessages(userText) {
    const msgs = history.filter(h => h.text && (h.role === "user" || h.role === "assistant")).slice(-10).map(h => ({ role: h.role, content: h.text }));
    msgs.push({ role: "user", content: userText });
    while (msgs.length && msgs[0].role !== "user") msgs.shift();
    return msgs;
  }
  function contextPayload() {
    const c = A.getContext(), t = ctxTopic();
    return { page: c.page || "", step: c.step || "", unit: t ? (t.unit ? A.unitById(t.unit).name + " — " + A.unitById(t.unit).title : "Additional topic") : (c.unitTitle || ""), topic: t ? t.title : "", topicText: t ? topicText(t).slice(0, 5000) : "" };
  }
  const citeList = hits => hits.length ? '<span class="src">Sources: ' + hits.map(h => escapeHtml(h.docName) + ", p. " + h.page).filter((v, i, a) => a.indexOf(v) === i).join(" · ") + "</span>" : "";

  async function doAsk(q) {
    const mats = await DocStore.search(q, 4).catch(() => []);
    if (status.configured) {
      const r = await NetAI.chat({ mode: "ask", messages: aiMessages(q), context: contextPayload(), materials: mats.map(m => ({ doc: m.docName, page: m.page, text: m.text })) });
      add("assistant", md(r.text) + (r.cited && mats.length ? citeList(mats) : ""), { text: r.text });
      return;
    }
    // Offline: retrieve from lessons (current topic boosted) and materials.
    const t = ctxTopic();
    let hits = DocStore.searchDocs(lessonDocs(), q + (t && q.split(/\s+/).length < 4 ? " " + t.title : ""), 3);
    if (!hits.length && t && /^(explain|what|summar|define|tell)/i.test(q)) hits = [{ docId: "lesson:" + t.id, docName: t.title, page: 1, text: strip(t.unit ? t.definition + " " + t.recap : (t.notes || {}).definition) }];
    let html = "";
    if (hits.length) {
      html += "<p><b>From the lessons</b> (offline search — not AI-generated):</p>" + hits.map(h => { const id = h.docId.slice(7); return '<p>“' + escapeHtml(trim(h.text, 360)) + '”<br><a href="' + A.topicHref(id) + '">→ ' + escapeHtml(h.docName) + "</a></p>"; }).join("");
    }
    if (mats.length) html += "<p><b>From your materials:</b></p>" + mats.slice(0, 2).map(m => "<p>“" + escapeHtml(trim(m.text, 300)) + '”<span class="src">' + escapeHtml(m.docName) + ", p. " + m.page + "</span></p>").join("");
    if (!html) html = "<p>I couldn't find that in the lessons" + (mats ? " or your materials" : "") + ". Try different keywords, or use the search box at the top of the page.</p>";
    add("assistant", html + '<span class="src">Offline mode: enable the AI backend for written explanations.</span>');
  }
  const trim = (s, n) => s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "…" : s;

  async function doMaterials(q) {
    const docs = await DocStore.all().catch(() => []);
    const ready = docs.filter(d => d.status === "ready");
    if (!ready.length) { add("assistant", '<p>You have not uploaded any study material yet.</p><p><a href="notes.html#upload">Upload your PDFs, slides or documents in Study Notes →</a></p>'); return; }
    const hits = await DocStore.search(q, status.configured ? 6 : 3);
    if (!hits.length) { add("assistant", "<p>I could not find anything about that in your " + ready.length + " uploaded file" + (ready.length > 1 ? "s" : "") + ". Try other keywords from your slides.</p>"); return; }
    if (status.configured) {
      const r = await NetAI.chat({ mode: "materials", messages: aiMessages(q), context: contextPayload(), materials: hits.map(m => ({ doc: m.docName, page: m.page, text: m.text })) });
      add("assistant", md(r.text) + citeList(hits), { text: r.text });
      return;
    }
    add("assistant", "<p><b>Matching passages from your materials</b> (offline search — quoted exactly, not AI-generated):</p>" +
      hits.map(m => "<p>“" + escapeHtml(trim(m.text, 420)) + '”<span class="src">' + escapeHtml(m.docName) + " — page/slide " + m.page + "</span></p>").join(""));
  }

  function catalog() { return window.VizKit ? VizKit.all().map(m => ({ id: m.id, kind: m.kind, title: m.title, desc: m.desc || "", category: m.category || "" })) : []; }
  function moduleLink(id) {
    const usedIn = A.topics().filter(t => (t.viz && t.viz.id === id) || (t.sim && t.sim.id === id));
    const m = VizKit.get(id);
    return '<p><b>' + escapeHtml(m.title) + '</b> <span class="k ' + m.kind + '">' + m.kind + "</span><br>" + escapeHtml(m.desc || "") +
      '<br><a href="visualizer.html#' + id + '">Open in Studio →</a>' + (usedIn[0] ? ' · <a href="' + A.topicHref(usedIn[0].id, usedIn[0].viz && usedIn[0].viz.id === id ? "viz" : "sim") + '">in lesson “' + escapeHtml(usedIn[0].title) + "”</a>" : "") + "</p>";
  }
  async function doSim(q) {
    const cat = catalog();
    if (!cat.length) { add("assistant", '<p>The simulation catalogue is not loaded on this page. <a href="visualizer.html">Open the Visualization Studio →</a></p>'); return; }
    if (status.configured) {
      const r = await NetAI.chat({ mode: "sim", messages: aiMessages(q), context: contextPayload(), catalog: cat });
      const picks = (r.picks || []).filter(p => VizKit.get(p.id)).slice(0, 3);
      add("assistant", (r.text ? md(r.text) : "") + picks.map(p => moduleLink(p.id) + (p.try && p.try.length ? "<ul>" + p.try.map(x => "<li>" + escapeHtml(x) + "</li>").join("") + "</ul>" : "")).join("") +
        (picks.length ? "" : "<p>No existing module fits that request.</p>") + '<span class="src">The AI selects from the site\'s built-in simulations — it does not invent new ones.</span>', { text: r.text || "" });
      return;
    }
    const docs = cat.map(m => ({ id: "m:" + m.id, name: m.title, pages: [{ n: 1, text: m.title + " " + m.title + " " + m.desc + " " + m.category + " " + m.id.replace(/^[vs]-/, "") }] }));
    const hits = DocStore.searchDocs(docs, q, 3);
    if (!hits.length) { add("assistant", '<p>No simulation matched “' + escapeHtml(q) + '”. Browse them all in the <a href="visualizer.html">Visualization Studio</a>.</p>'); return; }
    add("assistant", "<p>These built-in modules match your request (keyword search):</p>" + hits.map(h => moduleLink(h.docId.slice(2))).join(""));
  }

  function findTopic(q) {
    if (!q.trim()) return ctxTopic();
    const hits = DocStore.searchDocs(A.topics().map(t => ({ id: t.id, name: t.title, pages: [{ n: 1, text: (t.title + " ").repeat(3) + (t.summary || "") }] })), q, 1);
    return hits[0] ? A.topicById(hits[0].docId) : null;
  }
  async function doNotes(q) {
    const t = findTopic(q);
    if (!t) { add("assistant", "<p>Tell me which topic to make notes for (for example “QAM” or “twisted pair”). For notes from your own PDFs, use <a href=\"notes.html#upload\">Study Notes → Upload</a>.</p>"); return; }
    if (status.configured) {
      const r = await NetAI.notes({ kind: "quick", title: t.title, source: [{ label: "Lesson: " + t.title, text: topicText(t).slice(0, 12000) }] });
      add("assistant", "<h4>Revision notes: " + escapeHtml(t.title) + "</h4>" + md(r.text) + '<div class="acts"><button class="btn btn-outline btn-sm" data-dl>' + icon("download", 13) + " Download</button></div>", { text: r.text });
      const last = body().lastElementChild; last.querySelector("[data-dl]").onclick = () => A.download(t.id + "-ai-notes.md", "# " + t.title + "\n\n" + r.text);
      return;
    }
    const n = t.unit ? { def: strip(t.definition), pts: (t.exam || []).map(strip), sum: strip(t.recap) } : { def: (t.notes || {}).definition, pts: (t.notes || {}).points || [], sum: ((t.notes || {}).revision || []).join(" · ") };
    const text = "# " + t.title + "\n\n**Definition:** " + n.def + "\n\n## Key points\n" + n.pts.map(p => "- " + p).join("\n") + "\n\n## Summary\n" + n.sum;
    add("assistant", md(text) + '<span class="src">Compiled from the lesson “' + escapeHtml(t.title) + '” (offline — not AI-generated). <a href="' + A.topicHref(t.id, "notes") + '">Open the Notes step →</a></span>');
  }

  /* Practice teacher: question bank, one at a time, adaptive difficulty, final report. */
  function practicePool(q) {
    const all = window.QUIZ || [];
    const u = A.UNITS.find(x => q && new RegExp("\\b(" + x.name + "|unit\\s*" + x.id.slice(1) + ")\\b", "i").test(q));
    if (u) return { label: u.id === "extra" ? "Additional topics" : u.name, qs: all.filter(x => { const t = A.topicById(x.t); return t && A.unitOf(t) === u.id; }) };
    const t = findTopic(q || "");
    if (t) return { label: t.title, qs: all.filter(x => x.t === t.id) };
    return { label: "the syllabus", qs: all.filter(x => { const t = A.topicById(x.t); return t && t.unit; }) };
  }
  function startPractice(q) {
    const p = practicePool(q);
    if (!p.qs.length) { add("assistant", "<p>No practice questions found for that. Try a topic name such as “modem” or “Unit III”.</p>"); return; }
    practice = { label: p.label, pool: A.shuffle(p.qs), asked: [], level: 1, n: 5 };
    add("assistant", "<p><b>Practice: " + escapeHtml(p.label) + "</b> — 5 questions, one at a time. Difficulty adapts: a right answer moves you up, a wrong one moves you down.</p>" + '<span class="src">Questions come from the NetLab question bank.</span>');
    askNext();
  }
  function askNext() {
    const P = practice;
    if (P.asked.length >= P.n) return report();
    const avail = P.pool.filter(x => P.asked.every(a => a.q !== x));
    let q = avail.find(x => (x.d || 2) === P.level) || avail.find(x => Math.abs((x.d || 2) - P.level) === 1) || avail[0];
    if (!q) return report();
    const order = A.shuffle(q.o.map((_, i) => i));
    const d = add("assistant", "<p><b>Q" + (P.asked.length + 1) + ".</b> " + QuizEngineTag(q.d) + " " + escapeHtml(q.q) + '</p><div class="opts">' + order.map((k, i) => '<button data-k="' + k + '">' + "ABCD"[i] + ". " + escapeHtml(q.o[k]) + "</button>").join("") + "</div>", { persist: false });
    d.querySelectorAll("[data-k]").forEach(b => b.onclick = () => {
      const k = +b.dataset.k, ok = k === q.a;
      d.querySelectorAll("[data-k]").forEach(x => { x.disabled = true; if (+x.dataset.k === q.a) x.classList.add("correct"); else if (x === b) x.classList.add("wrong"); });
      P.asked.push({ q, ok, d: q.d || 2 });
      history.push({ role: "assistant", html: d.innerHTML }); saveHist();
      P.level = Math.max(1, Math.min(3, (q.d || 2) + (ok ? 1 : -1)));
      const t = A.topicById(q.t);
      const fb = add("assistant", "<p>" + (ok ? "✅ <b>Correct.</b> " : "❌ <b>Not quite.</b> The answer is <b>" + escapeHtml(q.o[q.a]) + "</b>. ") + escapeHtml(q.e || "") + "</p>" +
        (!ok && status.configured ? '<div class="acts"><button class="btn btn-outline btn-sm" data-more>Explain this more</button></div>' : "") + (!ok && t ? '<span class="src">Revise: <a href="' + A.topicHref(t.id) + '">' + escapeHtml(t.title) + "</a></span>" : ""));
      const more = fb.querySelector("[data-more]");
      if (more) more.onclick = () => { more.disabled = true; send("I answered “" + q.o[k] + "” to the question “" + q.q + "”, but the correct answer is “" + q.o[q.a] + "”. Explain why, simply.", "ask"); };
      setTimeout(askNext, 500);
    });
  }
  function QuizEngineTag(d) { return window.QuizEngine ? QuizEngine.diffTag(d) : "<small>(" + ["", "easy", "medium", "hard"][d || 2] + ")</small>"; }
  function report() {
    const P = practice, right = P.asked.filter(a => a.ok).length;
    const by = [1, 2, 3].map(d => { const l = P.asked.filter(a => a.d === d); return l.length ? ["", "Easy", "Medium", "Hard"][d] + ": " + l.filter(a => a.ok).length + "/" + l.length : ""; }).filter(Boolean).join(" · ");
    const weak = Array.from(new Set(P.asked.filter(a => !a.ok).map(a => a.q.t))).map(A.topicById).filter(Boolean);
    add("assistant", "<h4>Practice report — " + escapeHtml(P.label) + "</h4><p><b>" + right + " / " + P.asked.length + "</b> correct (" + Math.round(right / P.asked.length * 100) + "%). " + by + ".</p>" +
      "<p>" + (right === P.asked.length ? "Excellent — try a harder unit next." : right >= 3 ? "Good. Revise the topics below and practise again." : "Revise the theory and visualizations for the topics below, then try again.") + "</p>" +
      (weak.length ? "<p>Revise:</p><ul>" + weak.map(t => '<li><a href="' + A.topicHref(t.id) + '">' + escapeHtml(t.title) + "</a></li>").join("") + "</ul>" : "") + '<span class="src">Send another message in Practice to start a new round.</span>');
    practice = null;
  }

  /* ---------------- Send ---------------- */
  async function send(textArg, modeOverride) {
    if (busy) { add("system", "Still working on your last question — please wait for the answer.", { persist: false }); return; }
    const input = $("#aiInput");
    const q = (textArg != null ? textArg : input.value).trim();
    const mode = modeOverride || state.mode;
    if (!q && mode !== "practice" && mode !== "notes") return;
    input.value = "";
    if (q) add("user", escapeHtml(q), { text: q });
    if (mode === "practice") { if (practice) add("assistant", "<p>Finish the current question first (click an option).</p>", { persist: false }); else startPractice(q); return; }
    busy = true; $("#aiSend").disabled = true;
    const typing = add("assistant", '<span class="ai-typing">' + (status.configured ? "Thinking…" : "Searching…") + "</span>", { persist: false });
    try {
      if (mode === "materials") await doMaterials(q);
      else if (mode === "sim") await doSim(q);
      else if (mode === "notes") await doNotes(q);
      else await doAsk(q);
    } catch (e) {
      add("system", "<b>Could not get an answer.</b> " + escapeHtml(e.message || String(e)) + (status.configured ? " The AI request failed; check the server console." : ""), { persist: false });
    } finally { typing.remove(); busy = false; $("#aiSend").disabled = false; }
  }

  function init() {
    document.body.appendChild(fab); document.body.appendChild(panel);
    fab.onclick = () => { state.open = true; state.min = false; saveUi(); show(); scroll(); $("#aiInput").focus(); };
    $("#aiClose").onclick = () => { state.open = false; saveUi(); show(); };
    $("#aiMin").onclick = () => { state.min = !state.min; saveUi(); show(); };
    $("#aiClear").onclick = () => { history = []; practice = null; saveHist(); renderHistory(); };
    panel.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { state.mode = b.dataset.m; state.min = false; saveUi(); show(); $("#aiInput").focus(); });
    $("#aiForm").onsubmit = e => { e.preventDefault(); send(); };
    $("#aiInput").addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
    document.addEventListener("netlearn:context", () => setTimeout(ctxLine, 0));
    document.addEventListener("keydown", e => { if (e.key === "Escape" && state.open && panel.contains(document.activeElement)) { state.open = false; saveUi(); show(); fab.focus(); } });
    show(); ctxLine();
    NetAI.status().then(s => { setStatus(s); renderHistory(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
