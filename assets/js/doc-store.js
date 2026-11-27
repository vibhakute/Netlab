/* =========================================================
   DocStore - uploaded study material kept in IndexedDB (this
   browser only) plus passage search with page references.
   Record: { id, owner, name, ext, size, added, status: "ready"|"error",
             error, pages: [{ n, text }], unit, notes }
   Every file belongs to the student who uploaded it (owner = Student ID);
   a student only ever sees their own files.
   ========================================================= */
(function () {
  "use strict";
  const DB = "netlearn-docs", STORE = "files";
  let dbp = null, memory = null;

  function open() {
    if (dbp) return dbp;
    dbp = new Promise(resolve => {
      try {
        const req = indexedDB.open(DB, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => { memory = new Map(); resolve(null); };
        req.onblocked = () => { memory = new Map(); resolve(null); };
      } catch (e) { memory = new Map(); resolve(null); }
    });
    return dbp;
  }
  function tx(mode, fn) {
    return open().then(db => new Promise((resolve, reject) => {
      if (!db) { resolve(fn(null)); return; }
      const t = db.transaction(STORE, mode), s = t.objectStore(STORE);
      const r = fn(s);
      t.oncomplete = () => resolve(r && r.result !== undefined ? r.result : r);
      t.onerror = () => reject(t.error);
    }));
  }
  const me = () => (window.App && App.Student && App.Student.current()) || null;
  const mine = d => !!d && !!me() && d.owner === me();
  const DocStore = {
    persistent() { return open().then(db => !!db); },
    all() {
      return tx("readonly", s => s ? s.getAll() : Array.from(memory.values()))
        .then(list => (list || []).filter(mine).sort((a, b) => b.added - a.added));
    },
    get(id) { return tx("readonly", s => s ? s.get(id) : memory.get(id)).then(d => mine(d) ? d : undefined); },
    put(rec) {
      if (!me()) return Promise.reject(new Error("Sign in with your PRN first."));
      rec.owner = rec.owner || me();
      if (rec.owner !== me()) return Promise.reject(new Error("This file belongs to another student."));
      return tx("readwrite", s => s ? s.put(rec) : memory.set(rec.id, rec)).then(() => { changed(); return rec; });
    },
    remove(id) { return this.get(id).then(d => d ? tx("readwrite", s => s ? s.delete(id) : memory.delete(id)).then(changed) : undefined); },
    search(query, limit) { return this.all().then(list => searchDocs(list.filter(d => d.status === "ready"), query, limit || 5)); }
  };
  function changed() { document.dispatchEvent(new CustomEvent("netlearn:docs")); }

  /* ---------- Passage search (BM25-style scoring over ~500-char passages) ---------- */
  const STOP = new Set("the a an and or of to in on for is are was were be by with as at from that this it its into than then their there these those which what when where who why how can will would should may might not no yes do does did your you we our they them he she his her about also such any each other more most some very via using use used".split(" "));
  function terms(s) { return String(s).toLowerCase().replace(/[^a-z0-9À-ɏ\s-]/g, " ").split(/\s+/).filter(w => w.length > 1 && !STOP.has(w)); }
  function passages(doc) {
    const out = [];
    (doc.pages || []).forEach(p => {
      const sents = String(p.text).replace(/\s+/g, " ").split(/(?<=[.!?])\s+|\s(?=•)/);
      let buf = "";
      sents.forEach(s => {
        if ((buf + " " + s).length > 520 && buf) { out.push({ doc, page: p.n, text: buf.trim() }); buf = s; }
        else buf = buf ? buf + " " + s : s;
      });
      if (buf.trim()) out.push({ doc, page: p.n, text: buf.trim() });
    });
    return out;
  }
  function searchDocs(docs, query, limit) {
    const q = Array.from(new Set(terms(query)));
    if (!q.length) return [];
    const all = [];
    docs.forEach(d => passages(d).forEach(p => all.push(Object.assign(p, { tf: terms(p.text) }))));
    if (!all.length) return [];
    const N = all.length, avg = all.reduce((s, p) => s + p.tf.length, 0) / N;
    const df = {}; q.forEach(w => { df[w] = all.filter(p => p.tf.indexOf(w) !== -1).length; });
    all.forEach(p => {
      let score = 0, hit = 0;
      q.forEach(w => {
        const f = p.tf.filter(x => x === w).length; if (!f) return; hit++;
        const idf = Math.log(1 + (N - df[w] + 0.5) / (df[w] + 0.5));
        score += idf * (f * 2.2) / (f + 1.2 * (0.25 + 0.75 * p.tf.length / avg));
      });
      p.score = score * (hit / q.length);
    });
    return all.filter(p => p.score > 0).sort((a, b) => b.score - a.score).slice(0, limit)
      .map(p => ({ docId: p.doc.id, docName: p.doc.name, page: p.page, text: p.text, score: +p.score.toFixed(3) }));
  }

  window.DocStore = DocStore;
  window.DocStore.terms = terms;
  window.DocStore.searchDocs = searchDocs;
})();
