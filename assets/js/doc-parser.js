/* =========================================================
   DocParser - extracts text page by page from uploaded study
   material, entirely in the browser.
     PDF  -> pdf.js (pages)          PPTX -> JSZip (slides)
     DOCX -> JSZip (Word page breaks) TXT/MD -> parts of ~3000 chars
   Files are validated by extension, size and file signature.
   Failures throw an Error with a message meant for the student.
   ========================================================= */
(function () {
  "use strict";
  const MAX_MB = 30;
  const TYPES = { pdf: "PDF", pptx: "PowerPoint", docx: "Word", txt: "Text", md: "Markdown" };
  const VENDOR = "assets/vendor/";
  const loaded = {};
  function loadScript(src) {
    if (loaded[src]) return loaded[src];
    loaded[src] = new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("Could not load the document reader (" + src.split("/").pop() + ").")); document.head.appendChild(s); });
    return loaded[src];
  }
  const fail = msg => { throw new Error(msg); };
  const extOf = name => (String(name).toLowerCase().match(/\.([a-z0-9]+)$/) || [])[1] || "";

  function validate(file) {
    const ext = extOf(file.name);
    if (ext === "doc" || ext === "ppt") return "Old binary ." + ext + " files are not supported. Open the file in Office/LibreOffice and save it as ." + ext + "x, then upload again.";
    if (!TYPES[ext]) return "Unsupported file type “." + (ext || "?") + "”. Upload a PDF, PPTX, DOCX, TXT or MD file.";
    if (file.size === 0) return "The file is empty.";
    if (file.size > MAX_MB * 1024 * 1024) return "The file is " + (file.size / 1048576).toFixed(1) + " MB. The limit is " + MAX_MB + " MB.";
    return null;
  }
  async function sniff(buf, ext) {
    const b = new Uint8Array(buf.slice(0, 5));
    if (ext === "pdf" && !(b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46)) fail("This file is named .pdf but is not a valid PDF (missing %PDF header).");
    if ((ext === "docx" || ext === "pptx") && !(b[0] === 0x50 && b[1] === 0x4B)) fail("This file is named ." + ext + " but is not a valid Office document (it is not a ZIP package).");
  }

  /* ---------- PDF ---------- */
  async function pdfLib() {
    if (!window.pdfjsLib) {
      // On file:// a Web Worker cannot be created from a file URL, so pdf.js
      // falls back to running its worker code on the main thread.
      if (location.protocol === "file:") await loadScript(VENDOR + "pdf.worker.min.js");
      await loadScript(VENDOR + "pdf.min.js");
    }
    if (!window.pdfjsLib) fail("The PDF reader failed to start.");
    if (location.protocol !== "file:") pdfjsLib.GlobalWorkerOptions.workerSrc = VENDOR + "pdf.worker.min.js";
    return window.pdfjsLib;
  }
  async function parsePdf(buf, onProgress) {
    const lib = await pdfLib();
    let doc;
    try { doc = await lib.getDocument({ data: new Uint8Array(buf), isEvalSupported: false }).promise; }
    catch (e) {
      if (e && e.name === "PasswordException") fail("This PDF is password-protected. Remove the password and upload it again.");
      fail("This PDF could not be read (" + ((e && e.message) || "damaged file") + ").");
    }
    const pages = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const tc = await page.getTextContent();
      let text = "", lastY = null;
      tc.items.forEach(it => {
        if (!("str" in it)) return;
        const y = it.transform ? Math.round(it.transform[5]) : null;
        if (lastY !== null && y !== null && Math.abs(y - lastY) > 2 && !/\n$/.test(text)) text += "\n";
        else if (text && !/[\s\n]$/.test(text) && it.str && !/^\s/.test(it.str)) text += " ";
        text += it.str; if (it.hasEOL) text += "\n";
        lastY = y;
      });
      pages.push({ n, text: tidy(text) });
      page.cleanup();
      if (onProgress) onProgress(n / doc.numPages);
    }
    await doc.destroy();
    return { pages, kind: "page", approx: false };
  }

  /* ---------- Office (ZIP + XML) ---------- */
  async function zip(buf) {
    if (!window.JSZip) await loadScript(VENDOR + "jszip.min.js");
    try { return await JSZip.loadAsync(buf); } catch (e) { fail("The document could not be opened (it may be damaged or encrypted)."); }
  }
  const xml = s => new DOMParser().parseFromString(s, "application/xml");
  const byLocal = (node, name) => Array.from(node.getElementsByTagName("*")).filter(e => e.localName === name);

  async function parseDocx(buf) {
    const z = await zip(buf);
    const f = z.file("word/document.xml"); if (!f) fail("This .docx has no document body (word/document.xml is missing).");
    const doc = xml(await f.async("string"));
    const pages = [{ n: 1, text: "" }];
    byLocal(doc, "p").forEach(p => {
      let line = "";
      Array.from(p.getElementsByTagName("*")).forEach(el => {
        const ln = el.localName;
        if (ln === "t") line += el.textContent;
        else if (ln === "tab") line += "\t";
        else if (ln === "br" && el.getAttribute("w:type") === "page" || ln === "lastRenderedPageBreak") { pages[pages.length - 1].text += line + "\n"; line = ""; pages.push({ n: pages.length + 1, text: "" }); }
        else if (ln === "br") line += "\n";
      });
      const style = byLocal(p, "pStyle")[0];
      const isHead = style && /heading|title/i.test(style.getAttribute("w:val") || "");
      if (line.trim()) pages[pages.length - 1].text += (isHead ? "\n" : "") + line + "\n";
    });
    const out = pages.map(p => ({ n: p.n, text: tidy(p.text) })).filter((p, i, a) => p.text || i < a.length - 1);
    return { pages: renumber(out), kind: "page", approx: true };
  }

  async function parsePptx(buf) {
    const z = await zip(buf);
    const pres = z.file("ppt/presentation.xml"), rels = z.file("ppt/_rels/presentation.xml.rels");
    let order = [];
    if (pres && rels) {
      const relMap = {};
      byLocal(xml(await rels.async("string")), "Relationship").forEach(r => { relMap[r.getAttribute("Id")] = r.getAttribute("Target"); });
      order = byLocal(xml(await pres.async("string")), "sldId").map(s => relMap[s.getAttribute("r:id")]).filter(Boolean).map(t => "ppt/" + t.replace(/^\/?ppt\//, "").replace(/^\.\.\//, ""));
    }
    if (!order.length) order = Object.keys(z.files).filter(k => /^ppt\/slides\/slide\d+\.xml$/.test(k)).sort((a, b) => +a.match(/(\d+)\.xml/)[1] - +b.match(/(\d+)\.xml/)[1]);
    if (!order.length) fail("No slides were found in this presentation.");
    const pages = [];
    for (let i = 0; i < order.length; i++) {
      const f = z.file(order[i]); if (!f) continue;
      const d = xml(await f.async("string"));
      const paras = byLocal(d, "p").map(p => byLocal(p, "t").map(t => t.textContent).join("")).filter(s => s.trim());
      pages.push({ n: i + 1, text: tidy(paras.join("\n")) });
    }
    return { pages, kind: "slide", approx: false };
  }

  /* ---------- Plain text ---------- */
  async function parseText(file) {
    const text = (await file.text()).replace(/\r\n?/g, "\n");
    if (/\u0000/.test(text.slice(0, 2000))) fail("This does not look like a text file (it contains binary data).");
    const paras = text.split(/\n{2,}/), pages = [];
    let buf = "";
    paras.forEach(p => { if ((buf + "\n\n" + p).length > 3000 && buf) { pages.push(buf); buf = p; } else buf = buf ? buf + "\n\n" + p : p; });
    if (buf.trim()) pages.push(buf);
    return { pages: pages.map((t, i) => ({ n: i + 1, text: tidy(t) })), kind: "part", approx: false };
  }

  function tidy(s) { return String(s).replace(/ /g, " ").replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim(); }
  function renumber(p) { return p.map((x, i) => ({ n: i + 1, text: x.text })); }

  async function parse(file, onProgress) {
    const err = validate(file); if (err) fail(err);
    const ext = extOf(file.name);
    let res;
    if (ext === "txt" || ext === "md") res = await parseText(file);
    else {
      const buf = await file.arrayBuffer();
      await sniff(buf, ext);
      res = ext === "pdf" ? await parsePdf(buf, onProgress) : ext === "docx" ? await parseDocx(buf) : await parsePptx(buf);
    }
    const chars = res.pages.reduce((s, p) => s + p.text.length, 0);
    const empty = res.pages.filter(p => p.text.replace(/\s/g, "").length < 15).length;
    if (chars < 40) fail(ext === "pdf" ? "No text could be extracted. This PDF is probably scanned images without a text layer; OCR is not supported, so no notes can be made from it." : "No readable text was found in this file.");
    return Object.assign(res, { ext, stats: { chars, pages: res.pages.length, emptyPages: empty } });
  }

  window.DocParser = { parse, validate, TYPES, MAX_MB, extOf };
})();
