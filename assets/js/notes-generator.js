/* =========================================================
   NotesGenerator - offline, EXTRACTIVE notes from parsed pages.
   Nothing is invented: every bullet is a sentence or line taken
   from the document (whitespace tidied) and carries its page /
   slide reference. Likely questions are built only from the
   document's own headings and defined terms, and are labelled.
   ========================================================= */
(function () {
  "use strict";
  const STOP = new Set(("a an the and or of to in on for is are was were be been by with as at from that this it its into than then their there these those which what when where who why how can will would should may might not no do does did " +
    "your you we our they them he she his her about also such any each other more most some very via using use used one two three per all only both same so if but has have had i e g eg ie etc fig figure slide page unit chapter").split(" "));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const words = s => s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w));
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, "");

  /* 1. Clean pages: drop repeated headers/footers, page numbers and junk. */
  function clean(pages) {
    const lineCount = {};
    pages.forEach(p => new Set(p.text.split("\n").map(norm).filter(Boolean)).forEach(l => { lineCount[l] = (lineCount[l] || 0) + 1; }));
    const limit = Math.max(3, Math.ceil(pages.length * 0.3));
    return pages.map(p => ({
      n: p.n,
      lines: p.text.split("\n").map(l => l.replace(/^[\s•▪◦●○■□➢➤►▶✓✔\-–—*·o]+(?=\S)/, "").trim())
        .filter(l => l.length > 2 && !/^(page\s*)?\d+(\s*(of|\/)\s*\d+)?$/i.test(l) && !(lineCount[norm(l)] >= limit && pages.length > 3) && /[a-z]/i.test(l))
    })).filter(p => p.lines.length);
  }

  /* 2. Headings: a short first line without a full stop is a slide/page title. */
  function headingOf(lines) {
    const l = lines[0];
    return l && l.length <= 70 && l.split(/\s+/).length <= 10 && !/[.;,]$/.test(l) && !/^\d+[.)]?$/.test(l) ? l : null;
  }

  /* 3. Sentences / bullet lines as candidate points. */
  function units(lines) {
    const out = [];
    let buf = "";
    lines.forEach((l, i) => {
      const joined = buf ? buf + " " + l : l;
      // join wrapped lines that continue a sentence (next starts lower-case)
      if (i + 1 < lines.length && /^[a-z(]/.test(lines[i + 1]) && !/[.:;?!]$/.test(l)) { buf = joined; return; }
      buf = "";
      joined.split(/(?<=[.!?])\s+(?=[A-Z])/).forEach(s => { s = s.trim(); if (s.length >= 12) out.push(s); });
    });
    return out;
  }
  const DEF_RE = /^(?:an?\s+|the\s+)?([A-Z][\w()\/\- ]{1,60}?)\s+(?:is|are|refers to|is defined as|is known as|means|is called|can be defined as)\s+(.{15,})/;
  const BAD_TERM = /^(it|this|these|those|there|that|they|then|here|following|if|each|no|one|such|which|he|she|we|you|both|all|some|another|its|the other|other|also|so|hence|thus|when|where|as|in|on|for|with)/i;
  const FORMULA_RE = /(?:^|\s)[A-Za-zηλβθΔφσ][\w()]*\s*=\s*[^=]{2,}|\b\d+(?:\.\d+)?\s*(?:dB|Hz|kHz|MHz|GHz|bps|kbps|Mbps|Gbps|km|ms|µs|nm)\b/;

  function generate(doc, kind) {
    const pages = clean(doc.pages || []);
    const unit = doc.kind === "slide" ? "slide" : doc.kind === "part" ? "part" : "p.";
    const ref = n => unit === "p." ? "p. " + n : unit + " " + n;
    if (!pages.length) return { ok: false, error: "No usable text remained after removing headers and page numbers." };

    // Global term frequencies for scoring.
    const tf = {};
    pages.forEach(p => p.lines.forEach(l => words(l).forEach(w => { tf[w] = (tf[w] || 0) + 1; })));
    const maxTf = Math.max.apply(null, Object.values(tf).concat([1]));

    // Sections: consecutive pages that share a heading are merged.
    const sections = [];
    pages.forEach(p => {
      const h = headingOf(p.lines);
      const body = h ? p.lines.slice(1) : p.lines;
      const last = sections[sections.length - 1];
      if (last && h && last.title && norm(last.title) === norm(h)) { last.pages.push(p.n); last.units.push.apply(last.units, units(body).map(t => ({ t, n: p.n }))); }
      else sections.push({ title: h || null, pages: [p.n], units: units(body).map(t => ({ t, n: p.n })) });
    });

    // Definitions, formulas, glossary.
    const defs = [], formulas = [], seenDef = {};
    pages.forEach(p => units(p.lines).forEach(s => {
      const m = s.match(DEF_RE);
      if (m && s.length <= 320) { const term = m[1].trim(); if (term.split(/\s+/).length <= 6 && !BAD_TERM.test(term) && !seenDef[norm(term)]) { seenDef[norm(term)] = 1; defs.push({ term, text: s, n: p.n }); } }
    }));
    pages.forEach(p => units(p.lines).forEach(l => { if (FORMULA_RE.test(l) && l.length <= 160 && !formulas.some(f => norm(f.text) === norm(l))) formulas.push({ text: l, n: p.n }); }));
    const acronyms = {};
    pages.forEach(p => p.lines.forEach(l => (l.match(/\b[A-Z]{2,6}\b/g) || []).forEach(a => { if (!acronyms[a]) acronyms[a] = { a, n: p.n, c: 0 }; acronyms[a].c++; })));
    const keyTerms = Object.values(acronyms).filter(x => x.c >= 2).sort((a, b) => b.c - a.c).slice(0, 24);

    // Score points: content-word weight, list-item bonus, length window.
    const score = s => { const w = words(s.t); if (!w.length) return 0; const v = w.reduce((a, x) => a + (tf[x] || 0) / maxTf, 0) / Math.sqrt(w.length); return v * (s.t.length > 25 && s.t.length < 260 ? 1 : 0.4) * (DEF_RE.test(s.t) ? 1.4 : 1); };
    const perSection = kind === "detailed" ? 8 : 3;
    const secOut = sections.map((s, i) => {
      const uniq = []; s.units.forEach(u => { if (!uniq.some(x => norm(x.t) === norm(u.t))) uniq.push(u); });
      const top = uniq.map((u, k) => ({ u, k, sc: score(u) })).sort((a, b) => b.sc - a.sc).slice(0, perSection).sort((a, b) => a.k - b.k).map(x => x.u);
      return { title: s.title || (s.pages.length > 1 ? ref(s.pages[0]) + "–" + s.pages[s.pages.length - 1] : ref(s.pages[0])), pages: s.pages, points: top };
    }).filter(s => s.points.length);

    // Likely questions, built only from headings and defined terms.
    const qs = [];
    defs.slice(0, 6).forEach(d => qs.push({ q: "Define " + d.term + ".", n: d.n }));
    sections.filter(s => s.title).forEach(s => {
      const t = s.title.replace(/[:\-–]+$/, "");
      if (/\b(types?|classification|kinds?)\b/i.test(t)) qs.push({ q: "List and explain the " + t.toLowerCase() + ".", n: s.pages[0] });
      else if (/\b(vs\.?|versus|difference|comparison|compare)\b/i.test(t)) qs.push({ q: "Write a short note / comparison: " + t + ".", n: s.pages[0] });
      else if (/\b(advantages?|disadvantages?|applications?|features?)\b/i.test(t)) qs.push({ q: "State the " + t.toLowerCase() + ".", n: s.pages[0] });
      else if (t.split(/\s+/).length <= 6) qs.push({ q: "Explain " + t + ".", n: s.pages[0] });
    });
    const uniqQs = []; qs.forEach(x => { if (!uniqQs.some(y => norm(y.q) === norm(x.q))) uniqQs.push(x); });

    const R = n => ' <span class="pg">[' + ref(n) + "]</span>";
    const title = doc.name.replace(/\.[a-z0-9]+$/i, "");
    let html = "<h1>" + esc(title) + " — " + (kind === "detailed" ? "Detailed notes" : "Quick revision") + "</h1>" +
      '<p class="gen-meta">Generated offline from “' + esc(doc.name) + "” (" + doc.pages.length + " " + (unit === "p." ? "pages" : unit + "s") + (doc.approx ? ", page numbers approximate" : "") + "). Every point is quoted from the file; references show where.</p>";
    if (defs.length) html += "<h2>Key definitions</h2><ul>" + defs.slice(0, kind === "detailed" ? 30 : 10).map(d => "<li><b>" + esc(d.term) + ":</b> " + esc(d.text) + R(d.n) + "</li>").join("") + "</ul>";
    html += "<h2>" + (kind === "detailed" ? "Topic-wise notes" : "Most important points") + "</h2>" +
      secOut.map(s => "<h3>" + esc(s.title) + "</h3><ul>" + s.points.map(p => "<li>" + esc(p.t) + R(p.n) + "</li>").join("") + "</ul>").join("");
    if (formulas.length) html += "<h2>Formulas and values</h2><ul>" + formulas.slice(0, kind === "detailed" ? 30 : 12).map(f => "<li><code>" + esc(f.text) + "</code>" + R(f.n) + "</li>").join("") + "</ul>";
    if (kind === "detailed" && keyTerms.length) html += "<h2>Abbreviations used</h2><p>" + keyTerms.map(k => "<b>" + esc(k.a) + "</b>" + R(k.n)).join(" · ") + "</p>";
    if (uniqQs.length) html += "<h2>Likely questions</h2><p class=\"gen-meta\">Built from the document's own headings and definitions.</p><ol>" + uniqQs.slice(0, kind === "detailed" ? 15 : 8).map(x => "<li>" + esc(x.q) + R(x.n) + "</li>").join("") + "</ol>";
    return { ok: true, html, stats: { sections: secOut.length, definitions: defs.length, formulas: formulas.length } };
  }

  // Plain text version of rendered notes (for .txt download).
  function toText(html) {
    const d = document.createElement("div"); d.innerHTML = html;
    d.querySelectorAll("h1,h2,h3").forEach(h => { h.textContent = "\n" + h.textContent.toUpperCase() + "\n"; });
    d.querySelectorAll("li").forEach(li => { li.textContent = "- " + li.textContent + "\n"; });
    d.querySelectorAll("p").forEach(p => { p.textContent = p.textContent + "\n"; });
    return d.textContent.replace(/\n{3,}/g, "\n\n").trim() + "\n";
  }

  window.NotesGenerator = { generate, toText, clean };
})();
