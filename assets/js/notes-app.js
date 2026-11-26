/* =========================================================
   Study Notes page
   #syllabus  college syllabus notes (Units I-IV)
   #topics    quick revision sheet: key facts and figures of Units I-IV
   #upload    UPLOAD STUDY MATERIAL (PDF, PPTX, DOCX, TXT, MD)
   #generated notes generated from uploads (#view/<id>/<kind>)
   #personal  saved points and personal notes
   ========================================================= */
(function () {
  "use strict";
  const A = App, { icon, escapeHtml, Progress, UNITS } = A;
  const main = document.getElementById("notesMain"), side = document.getElementById("lsb");
  const TABS = [["syllabus", "College syllabus notes", "book"], ["topics", "Quick revision sheet", "layers"], ["upload", "Uploaded files", "upload"], ["generated", "Generated notes", "sparkle"], ["personal", "Personal notes", "edit"]];
  const strip = h => String(h || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const fmtSize = b => b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB";
  const when = t => new Date(t).toLocaleString();
  const refWord = d => (d.kind === "slide" ? "slide" : d.kind === "part" ? "part" : "page") + (d.pages.length === 1 ? "" : "s");
  const sessionErrors = []; // files that failed validation/parsing (not stored)
  const busy = {};          // id -> progress text while parsing
  let aiOn = false;

  function table(c, raw) {
    const cell = x => raw ? x : escapeHtml(x);
    return '<div class="table-wrap"><table><thead><tr>' + c.head.map(h => "<th>" + cell(h) + "</th>").join("") + "</tr></thead><tbody>" +
      c.rows.map(r => "<tr>" + r.map(x => "<td>" + cell(x) + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>";
  }

  function shell(tab, inner) {
    main.innerHTML = '<div class="fade-in"><div class="page-head"><div><span class="kicker">Study Notes</span><h1>Notes &amp; study material</h1><p>Course notes, your uploaded files, notes generated from them, and your own notes — all in one place.</p></div>' +
      '<a class="btn btn-primary" href="#upload">' + icon("upload", 16) + " UPLOAD STUDY MATERIAL</a></div>" +
      '<div class="tabs no-print" role="tablist">' + TABS.map(t => '<button role="tab" data-tab="' + t[0] + '" class="' + (t[0] === tab ? "active" : "") + '" aria-selected="' + (t[0] === tab) + '">' + icon(t[2], 15) + t[1] + "</button>").join("") + "</div>" +
      '<div id="tabBody">' + inner + "</div></div>";
    main.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { location.hash = b.dataset.tab; });
  }

  /* ---------------- Syllabus notes ---------------- */
  function syllabus() {
    shell("syllabus", '<p class="muted">Exam-focused notes for every syllabus topic. Open a topic for its definition, key points and summary. <button class="btn btn-outline btn-sm no-print" id="pAll">' + icon("print", 14) + " Print all</button></p>" +
      UNITS.map(u => '<section class="notes-sec"><h2>' + u.name + ": " + escapeHtml(u.title) + ' <small class="muted" style="font-size:.8rem;font-weight:400">' + u.exam + "</small></h2>" +
        A.topicsInUnit(u.id).map((t, i) => '<details class="panel" style="padding:10px 16px;margin:8px 0"><summary><b>' + (i + 1) + ". " + escapeHtml(t.title) + "</b>" + (Progress.isDone(t.id) ? ' <span class="check">' + icon("check", 13) + "</span>" : "") + "</summary>" +
          '<div class="definition" style="margin-top:10px">' + t.definition + '</div><h4 style="margin:12px 0 4px">Key points</h4><ul class="points">' + (t.exam || []).map(x => "<li>" + x + "</li>").join("") + "</ul>" +
          (t.compare ? table(t.compare, true) : "") + '<div class="revision"><h4>Summary</h4><p style="margin:0">' + t.recap + "</p></div>" +
          '<p class="no-print" style="font-size:.88rem;margin:8px 0 0"><a href="' + A.topicHref(t.id) + '">Open lesson</a> · <a href="' + A.topicHref(t.id, "notes") + '">Notes step &amp; my notes</a> · <span class="muted">Source: ' + escapeHtml(t.source || "") + "</span></p></details>").join("") + "</section>").join(""));
    main.querySelector("#pAll").onclick = () => { main.querySelectorAll("details").forEach(d => d.open = true); window.print(); };
  }

  /* ---------------- Quick revision sheet (facts and figures from the unit slides) ---------------- */
  const SHEET = [
    { u: "u1", rows: [
      { head: ["Mode", "Direction", "Slide example"], rows: [["Simplex", "One way only", "Keyboard, monitor, speaker, IoT sensor"], ["Half-duplex", "Both ways, one at a time", "Walkie-talkie"], ["Full-duplex", "Both ways at the same time", "Telephone, mobile phone"]] },
      { head: ["Network", "Range", "Ownership", "Speed / delay"], rows: [["LAN", "Same building or campus", "Private", "High speed, short delay"], ["MAN", "A city, about 5–50 km", "Private or public", "Average speed, moderate delay"], ["WAN", "Above 50 km — country or continent", "Often not one organisation", "Lower speed, long delay"]] },
      { head: ["Serial", "Parallel"], rows: [["One bit at a time on one line", "All bits of a byte at once on several lines"], ["Cheaper, long distance, no crosstalk between lines", "Faster over short distances, crosstalk and skew"], ["Computer ↔ modem", "Motherboard ↔ hard disk"]] }],
      facts: ["Five components: message, sender, receiver, transmission medium, protocol.", "Network criteria: performance, reliability, security (plus scalability, cost, manageability, flexibility).", "Modem = modulator + demodulator: digital ⇄ analog. Dial-up: up to 56 kbit/s.", "Modem types: optical, digital, cable, satellite, dial-up. Internal (PCI/PCIe slot, built-in UART) vs external (serial/RS-232 or USB, own power)."] },
    { u: "u2", rows: [
      { head: ["Wave", "Frequency range", "Direction", "Use"], rows: [["Radio", "3 kHz – 1 GHz", "Omnidirectional", "AM/FM radio, cordless phones"], ["Microwave", "1 GHz – 300 GHz", "Unidirectional, line of sight", "Mobile phones, TV distribution"], ["Infrared", "300 GHz – 400 THz", "Unidirectional, short range", "TV remotes, wireless mouse"]] },
      { head: ["", "4G", "5G (slide values)"], rows: [["Max download", "1 Gbit/s", "2.5 Gbit/s"], ["Max upload", "500 Mbit/s", "1.25 Gbit/s"], ["Latency", "≈ 50 ms", "≈ 1 ms"], ["Peak (key features)", "—", "Up to 20 Gbit/s, 1 million devices/km²"]] }],
      facts: ["Guided: twisted pair (UTP, STP), coaxial, optical fibre, stripline, microstripline. Unguided: radio, microwave, infrared.", "Coax: baseband (whole bandwidth) and broadband (bandwidth split into ranges).", "Fibre works by total internal reflection: core inside a lower-index cladding. SMF core ≈ 9 µm (long distance), MMF larger core (short distance).", "Iridium: LEO satellite constellation with global coverage including both poles.", "IoT architecture: perception → transport/network → processing/middleware → application.", "Optical components: fibre, transmitter (LED or laser diode), receiver (photodiode), amplifier (EDFA)."] },
    { u: "u3", rows: [
      { head: ["Character", "ASCII (decimal / binary)", "EBCDIC (hex / binary)"], rows: [["A", "65 / 0100 0001", "C1 / 1100 0001"], ["B", "66 / 0100 0010", "C2 / 1100 0010"], ["0", "48 / 0011 0000", "F0 / 1111 0000"], ["1", "49 / 0011 0001", "F1 / 1111 0001"], ["Space", "32 / 0010 0000", "40 / 0100 0000"]] },
      { head: ["Transient", "Definition", "Telco limit"], rows: [["Gain hit", "Sudden amplitude increase lasting > 4 ms", "≤ 8 in any 15 min"], ["Dropout", "Signal loss > 12 dB lasting > 4 ms", "≤ 1 in any 30 min"], ["Phase hit", "Sudden phase change > 20° lasting > 4 ms", "≤ 8 in any 15 min"], ["Phase jitter", "Constant small phase swings", "≤ 10° (20–300 Hz), ≤ 15° (4–20 Hz)"]] }],
      facts: ["ASCII: 7-bit, 128 characters (extended ASCII 8-bit, 256). EBCDIC: 8-bit, 256 codes, IBM mainframes (1964).", "EBCDIC zones: A–I = C1–C9, J–R = D1–D9, S–Z = E2–E9, 0–9 = F0–F9.", "Telephone network: local loops, trunks, switching offices (end → tandem/toll → regional).", "Local loop voice bandwidth 4000 Hz; usable voice band about 300–3300 Hz.", "Impairments: attenuation, distortion, noise; crosstalk (NEXT, FEXT), echo, frequency shift, non-linear distortion, jitter, transients.", "Amplitude jitter: caused by power-supply noise (60 Hz on the slides; 50 Hz mains in India) and 20 Hz ringing tone."] },
    { u: "u4", rows: [
      { head: ["Technique", "What changes", "Values"], rows: [["AM / ASK", "Amplitude", "ASK: carrier on/off (zero level) for 1/0"], ["FM / FSK", "Frequency", "FSK: mark (1) and space (0) frequencies"], ["PM / BPSK", "Phase", "BPSK: 0° and 180° (phase reversal keying)"], ["QPSK", "Phase", "0°, 90°, 180°, 270° — 2 bits (bigits) per symbol"], ["DPSK", "Phase relative to previous element", "1 = reverse phase, 0 = keep phase"], ["QAM", "Amplitude and phase", "Several bits per symbol"]] },
      { head: ["Multiplexing", "Shares", "Key point"], rows: [["FDM", "Frequency bands", "Guard bands between channels; analog"], ["Synchronous TDM", "Fixed time slots", "Slots sent even if empty; T-1, ISDN"], ["Statistical TDM", "Slots on demand", "Only active stations; needs an address"], ["WDM", "Light wavelengths (lambdas)", "FDM for optical fibre"]] }],
      facts: ["T1 frame = 24 channels × 8 bits + 1 framing bit = 193 bits; 193 × 8000 frames/s = 1.544 Mbit/s.", "One voice channel (DS0) = 8000 samples/s × 8 bits = 64 kbit/s.", "FDM hierarchy: group = 12 channels, supergroup = 5 groups (60), mastergroup = 10 supergroups (600, Bell system; ITU uses 5 supergroups = 300).", "Advantages of modulation: smaller antenna, less wiring cost, no mixing of signals, longer range, better reception, multiplexing, adjustable bandwidth."] }
  ];
  function topics() {
    shell("topics", '<div class="note info"><span class="note-title">Quick revision sheet</span><p>The key facts, values and comparison tables of all four units on one page — ideal for the last hour before the exam. <button class="btn btn-outline btn-sm no-print" onclick="window.print()">' + icon("print", 14) + " Print</button></p></div>" +
      SHEET.map(x => { const u = A.unitById(x.u); return '<section class="notes-sec" id="n-' + u.id + '"><h2>' + u.name + ": " + escapeHtml(u.title) + ' <small class="muted" style="font-size:.8rem;font-weight:400">' + u.exam + "</small></h2>" +
        x.rows.map(t => table(t)).join("") + '<ul class="points">' + x.facts.map(f => "<li>" + escapeHtml(f) + "</li>").join("") + "</ul>" +
        '<p class="no-print" style="font-size:.88rem"><a href="learn.html#/unit/' + u.id + '">Open ' + u.name + " lessons →</a></p></section>"; }).join(""));
  }

  /* ---------------- Upload ---------------- */
  async function upload() {
    const docs = await DocStore.all().catch(() => []);
    const persistent = await DocStore.persistent();
    shell("upload", '<section id="upload" class="notes-sec">' +
      '<label class="dropzone" id="drop" tabindex="0">' + icon("upload", 30) + "<b>Drop files here or click to choose</b><small>PDF, PPTX, DOCX, TXT or MD · up to " + DocParser.MAX_MB + " MB each · read in your browser, stored only on this device</small>" +
      '<input type="file" id="fileIn" multiple accept=".pdf,.pptx,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown" hidden></label>' +
      (persistent ? "" : '<div class="note warn"><span class="note-title">Storage unavailable</span><p>This browser blocks IndexedDB (private mode?). Files will be kept only until you close the page.</p></div>') +
      '<ul class="file-list" id="fileList"></ul>' +
      (docs.length || sessionErrors.length ? "" : '<div class="empty-state" id="noFiles">No files yet. Upload your unit slides or notes to search them, ask the assistant about them with page references, and generate revision notes.</div>') +
      '<p class="muted" style="font-size:.86rem">Scanned PDFs (images without a text layer) cannot be read — no OCR is performed, and no notes are invented for them.</p></section>');
    renderFiles(docs);
    const drop = main.querySelector("#drop"), inp = main.querySelector("#fileIn");
    inp.onchange = () => { handle(Array.from(inp.files)); inp.value = ""; };
    drop.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inp.click(); } });
    ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
    ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
    drop.addEventListener("drop", e => handle(Array.from(e.dataTransfer.files || [])));
  }
  function renderFiles(docs) {
    const ul = main.querySelector("#fileList"); if (!ul) return;
    const rows = Object.keys(busy).map(k => '<li class="busy" data-busy="' + k + '"><span class="ext ' + DocParser.extOf(busy[k].name) + '">' + DocParser.extOf(busy[k].name) + "</span><div><b>" + escapeHtml(busy[k].name) + "</b><small>" + escapeHtml(busy[k].msg) + "</small></div><span></span></li>")
      .concat(sessionErrors.map((e, i) => '<li class="err"><span class="ext">!</span><div><b>' + escapeHtml(e.name) + '</b><small style="color:var(--red)">' + escapeHtml(e.error) + '</small></div><div class="acts"><button class="btn btn-outline btn-sm" data-dismiss="' + i + '">Dismiss</button></div></li>'))
      .concat(docs.map(d => '<li><span class="ext ' + d.ext + '">' + d.ext + "</span><div><b>" + escapeHtml(d.name) + "</b><small>" + fmtSize(d.size) + " · " + d.pages.length + " " + refWord(d) + " · " + d.stats.chars.toLocaleString() + " characters" + (d.stats.emptyPages ? " · " + d.stats.emptyPages + " without text" : "") + " · added " + when(d.added) + "</small></div>" +
        '<div class="acts"><button class="btn btn-primary btn-sm" data-gen="quick" data-id="' + d.id + '">Quick notes</button><button class="btn btn-outline btn-sm" data-gen="detailed" data-id="' + d.id + '">Detailed notes</button>' +
        (aiOn ? '<button class="btn btn-outline btn-sm" data-ai="' + d.id + '">' + icon("sparkle", 13) + " AI notes</button>" : "") +
        '<button class="btn btn-outline btn-sm" data-text="' + d.id + '">View text</button><button class="btn btn-outline btn-sm" data-del="' + d.id + '" aria-label="Delete ' + escapeHtml(d.name) + '">' + icon("trash", 13) + "</button></div></li>"));
    ul.innerHTML = rows.join("");
    const empty = main.querySelector("#noFiles"); if (empty && rows.length) empty.remove();
    ul.querySelectorAll("[data-dismiss]").forEach(b => b.onclick = () => { sessionErrors.splice(+b.dataset.dismiss, 1); DocStore.all().then(renderFiles); });
    ul.querySelectorAll("[data-gen]").forEach(b => b.onclick = () => generate(b.dataset.id, b.dataset.gen));
    ul.querySelectorAll("[data-ai]").forEach(b => b.onclick = () => aiNotes(b.dataset.ai, b));
    ul.querySelectorAll("[data-text]").forEach(b => b.onclick = () => { location.hash = "text/" + b.dataset.text; });
    ul.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
      const d = await DocStore.get(b.dataset.del); if (!d || !confirm("Delete “" + d.name + "” and any notes generated from it?")) return;
      await DocStore.remove(d.id); A.toast("File deleted"); DocStore.all().then(renderFiles);
    });
  }
  async function handle(files) {
    for (const f of files) {
      const err = DocParser.validate(f);
      if (err) { sessionErrors.unshift({ name: f.name, error: err }); continue; }
      const id = "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      busy[id] = { name: f.name, msg: "Reading…" };
      DocStore.all().then(renderFiles);
      try {
        const res = await DocParser.parse(f, p => { busy[id].msg = "Reading… " + Math.round(p * 100) + "%"; const sm = main.querySelector('[data-busy="' + id + '"] small'); if (sm) sm.textContent = busy[id].msg; });
        const existing = (await DocStore.all()).find(d => d.name === f.name && d.size === f.size);
        await DocStore.put({ id: existing ? existing.id : id, name: f.name, ext: res.ext, size: f.size, added: Date.now(), status: "ready", kind: res.kind, approx: res.approx, pages: res.pages, stats: res.stats, notes: existing ? existing.notes : {} });
        A.toast((existing ? "Updated " : "Added ") + f.name);
      } catch (e) {
        sessionErrors.unshift({ name: f.name, error: /quota/i.test(e.name + e.message) ? "Not enough browser storage to keep this file. Delete other uploads and try again." : e.message });
      } finally { delete busy[id]; }
    }
    DocStore.all().then(renderFiles);
  }

  /* ---------------- Generate / view notes ---------------- */
  async function generate(id, kind) {
    const d = await DocStore.get(id); if (!d) return;
    const r = NotesGenerator.generate(d, kind);
    if (!r.ok) { A.toast(r.error); return; }
    d.notes = d.notes || {};
    d.notes[kind] = { html: r.html, by: "offline", at: Date.now() };
    await DocStore.put(d);
    location.hash = "view/" + id + "/" + kind;
  }
  async function aiNotes(id, btn) {
    const d = await DocStore.get(id); if (!d) return;
    const kind = confirm("Generate DETAILED AI notes?\nOK = Detailed, Cancel = Quick revision") ? "detailed" : "quick";
    btn.disabled = true; btn.textContent = "Generating… (can take 1–2 min)";
    const label = d.kind === "slide" ? "slide" : d.kind === "part" ? "part" : "page";
    let budget = 340000;
    const source = d.pages.filter(p => p.text).map(p => ({ label: d.name + " " + label + " " + p.n, page: p.n, text: p.text })).filter(s => (budget -= s.text.length + 80) > 0);
    try {
      const r = await NetAI.notes({ kind, title: d.name, source });
      const st = await NetAI.status(); const aiLabel = st.free ? "free AI (" + (st.providerName || "") + ", " + st.model + ")" : "Claude";
      d.notes = d.notes || {};
      d.notes["ai-" + kind] = { html: '<h1>' + escapeHtml(d.name.replace(/\.[a-z0-9]+$/i, "")) + " — AI " + (kind === "detailed" ? "detailed notes" : "quick revision") + '</h1><p class="gen-meta">Written by ' + escapeHtml(aiLabel) + ' from the text of “' + escapeHtml(d.name) + "”" + (r.partial ? " (first " + r.partial.usedBlocks + " of " + r.partial.totalBlocks + " " + label + "s — the AI can read only part of a long file at once)" : source.length < d.pages.filter(x => x.text).length ? " (first " + source.length + " " + label + "s — the file was too long to send whole)" : "") + ". Check important facts against the page references.</p>" + NetAI.md(r.text).replace(/\[(p\.|page|slide|part)\s*(\d+)\]/gi, '<span class="pg">[$1 $2]</span>'), by: "ai", at: Date.now() };
      await DocStore.put(d);
      location.hash = "view/" + id + "/ai-" + kind;
    } catch (e) { A.toast("AI notes failed: " + e.message); btn.disabled = false; btn.innerHTML = icon("sparkle", 13) + " AI notes"; }
  }
  const KIND = { quick: "Quick revision", detailed: "Detailed notes", "ai-quick": "AI quick revision", "ai-detailed": "AI detailed notes" };
  async function generated() {
    const docs = (await DocStore.all().catch(() => [])).filter(d => d.notes && Object.keys(d.notes).length);
    shell("generated", docs.length ? '<ul class="notes-list">' + docs.map(d => Object.keys(d.notes).map(k => '<li><div><b><a href="#view/' + d.id + "/" + k + '">' + escapeHtml(d.name) + " — " + KIND[k] + "</a></b><br><small>" + (d.notes[k].by === "ai" ? "AI-generated" : "Extracted offline") + " · " + when(d.notes[k].at) + (d.notes[k].edited ? " · edited" : "") + '</small></div><a class="btn btn-outline btn-sm" href="#view/' + d.id + "/" + k + '">Open</a></li>').join("")).join("") + "</ul>"
      : '<div class="empty-state">No generated notes yet. <a href="#upload">Upload a file</a> and choose <b>Quick notes</b> or <b>Detailed notes</b>.</div>');
  }
  async function view(id, kind) {
    const d = await DocStore.get(id).catch(() => null);
    if (!d || !d.notes || !d.notes[kind]) { shell("generated", '<div class="empty-state">These notes no longer exist. <a href="#generated">Back to generated notes</a></div>'); return; }
    const n = d.notes[kind];
    A.setContext({ view: "notes", title: d.name });
    shell("generated", '<div class="row no-print" style="justify-content:space-between"><a href="#generated">' + icon("arrowL", 14) + ' All generated notes</a><div class="row">' +
      '<button class="btn btn-outline btn-sm" id="gEdit">' + icon("edit", 14) + ' Edit</button><button class="btn btn-primary btn-sm hidden" id="gSave">Save changes</button>' +
      '<button class="btn btn-outline btn-sm" id="gDl">' + icon("download", 14) + ' Download</button><button class="btn btn-outline btn-sm" id="gPrint">' + icon("print", 14) + ' Print</button>' +
      '<button class="btn btn-outline btn-sm" id="gDel">' + icon("trash", 14) + "</button></div></div>" +
      '<article class="gen-notes" id="gBody">' + n.html + "</article>");
    const body = main.querySelector("#gBody"), edit = main.querySelector("#gEdit"), save = main.querySelector("#gSave");
    edit.onclick = () => { const on = body.getAttribute("contenteditable") !== "true"; body.setAttribute("contenteditable", on); edit.innerHTML = icon("edit", 14) + (on ? " Stop editing" : " Edit"); save.classList.toggle("hidden", !on); if (on) body.focus(); };
    save.onclick = async () => { d.notes[kind] = Object.assign({}, n, { html: body.innerHTML, edited: Date.now() }); await DocStore.put(d); A.toast("Notes saved"); body.setAttribute("contenteditable", "false"); save.classList.add("hidden"); edit.innerHTML = icon("edit", 14) + " Edit"; };
    main.querySelector("#gDl").onclick = () => A.download(d.name.replace(/\.[a-z0-9]+$/i, "") + "-" + kind + ".txt", NotesGenerator.toText(body.innerHTML));
    main.querySelector("#gPrint").onclick = () => window.print();
    main.querySelector("#gDel").onclick = async () => { if (!confirm("Delete these notes?")) return; delete d.notes[kind]; await DocStore.put(d); location.hash = "generated"; };
  }
  async function viewText(id) {
    const d = await DocStore.get(id).catch(() => null);
    if (!d) { location.hash = "upload"; return; }
    const lbl = d.kind === "slide" ? "Slide" : d.kind === "part" ? "Part" : "Page";
    shell("upload", '<p class="no-print"><a href="#upload">' + icon("arrowL", 14) + " Uploaded files</a></p><h2>" + escapeHtml(d.name) + '</h2><p class="muted">Extracted text, exactly as read from the file' + (d.approx ? " (Word page breaks are approximate)" : "") + ".</p>" +
      d.pages.map(p => '<details class="panel" style="padding:10px 16px;margin:8px 0"' + (p.n <= 2 ? " open" : "") + "><summary><b>" + lbl + " " + p.n + "</b> <small class=\"muted\">" + p.text.length + ' chars</small></summary><pre style="white-space:pre-wrap;font-family:var(--font);font-size:.9rem;margin:8px 0 0">' + (escapeHtml(p.text) || '<span class="muted">(no text on this ' + lbl.toLowerCase() + ")</span>") + "</pre></details>").join(""));
  }

  /* ---------------- Personal ---------------- */
  function personal() {
    const saved = Progress.saved(), mine = Progress.myNotes();
    const byTopic = {}; saved.forEach(s => { (byTopic[s.id] = byTopic[s.id] || []).push(s); });
    shell("personal", '<div class="row" style="justify-content:flex-end"><button class="btn btn-outline btn-sm" id="pDl">' + icon("download", 14) + " Download all</button></div>" +
      '<h2>Saved points <small class="muted" style="font-size:.8rem;font-weight:400">(' + saved.length + ")</small></h2>" +
      (saved.length ? Object.keys(byTopic).map(id => { const t = A.topicById(id); return '<div class="panel"><h3><a href="' + A.topicHref(id, "notes") + '">' + escapeHtml(t ? t.title : id) + '</a></h3><ul class="np-list">' + byTopic[id].map(s => '<li><button class="save-pt on" data-id="' + escapeHtml(id) + '" data-txt="' + escapeHtml(s.text) + '" title="Remove">' + icon("star", 14) + "</button><span>" + escapeHtml(s.text) + "</span></li>").join("") + "</ul></div>"; }).join("")
        : '<div class="empty-state">Click ☆ next to a key point in any lesson\'s Notes step to save it here.</div>') +
      '<h2>My notes <small class="muted" style="font-size:.8rem;font-weight:400">(' + Object.keys(mine).length + " topics)</small></h2>" +
      (Object.keys(mine).length ? Object.keys(mine).map(id => { const t = A.topicById(id); return '<div class="panel"><div class="row" style="justify-content:space-between"><h3 style="margin:0">' + escapeHtml(t ? t.title : id) + '</h3><a class="btn btn-outline btn-sm" href="' + A.topicHref(id, "notes") + '">' + icon("edit", 13) + ' Edit</a></div><p style="white-space:pre-wrap;margin:8px 0 0">' + escapeHtml(mine[id]) + "</p></div>"; }).join("")
        : '<div class="empty-state">Write notes in the Notes step of any lesson; they appear here.</div>'));
    main.querySelectorAll(".save-pt").forEach(b => b.onclick = () => { Progress.toggleSaved(b.dataset.id, b.dataset.txt); personal(); });
    main.querySelector("#pDl").onclick = () => {
      const L = ["MY NETLAB NOTES", "Exported " + new Date().toLocaleString(), ""];
      Object.keys(byTopic).forEach(id => { const t = A.topicById(id); L.push("== " + (t ? t.title : id) + " — saved points =="); byTopic[id].forEach(s => L.push("* " + s.text)); L.push(""); });
      Object.keys(mine).forEach(id => { const t = A.topicById(id); L.push("== " + (t ? t.title : id) + " — my notes ==", mine[id], ""); });
      A.download("my-netlab-notes.txt", L.join("\n"));
    };
  }

  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#/, "")), [a, b, c] = h.split("/");
    A.learnSidebar(side, { route: "notes" });
    A.setContext({ view: "notes" });
    document.title = "Study Notes — NetLab";
    if (a === "view" && b) view(b, c || "quick");
    else if (a === "text" && b) viewText(b);
    else if (a === "upload") upload();
    else if (a === "generated") generated();
    else if (a === "personal") personal();
    else if (a === "topics" || (a || "").indexOf("n-") === 0) topics();
    else syllabus();
    if (!(a || "").startsWith("n-")) window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", () => {
    route();
    if (window.NetAI) NetAI.status().then(s => { aiOn = !!s.configured; if (aiOn && /^#upload/.test(location.hash)) DocStore.all().then(renderFiles); });
  });
})();
