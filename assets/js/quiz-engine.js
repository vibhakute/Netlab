/* =========================================================
   QuizEngine - reusable MCQ runner used by the topic Quiz step
   and the Exams page. Question format:
   { q, o:[options], a: correctIndex, e: explanation, d: 1|2|3, t: topicId }
   ========================================================= */
(function () {
  "use strict";
  const { icon, escapeHtml, shuffle, Progress } = App;
  const DIFF = { 1: "Easy", 2: "Medium", 3: "Hard" };
  const diffTag = d => '<span class="diff d' + (d || 2) + '">' + DIFF[d || 2] + "</span>";

  // Shuffle the options of a question while keeping track of the right answer.
  function prepare(q) {
    const order = shuffle(q.o.map((_, i) => i));
    return Object.assign({}, q, { o: order.map(i => q.o[i]), a: order.indexOf(q.a), orig: q });
  }

  function mount(el, opts) {
    opts = Object.assign({ filter: true, title: "", key: null, limit: 0 }, opts);
    const bank = (opts.questions || []).filter(q => q && q.o && q.o.length);
    let level = "all", qs = [], i = 0, score = 0, answers = [];

    function pool() {
      let p = level === "all" ? bank : bank.filter(q => String(q.d || 2) === level);
      if (opts.mixed) p = shuffle(p);
      else p = p.slice().sort((x, y) => (x.d || 2) - (y.d || 2));
      if (opts.limit && p.length > opts.limit) p = p.slice(0, opts.limit);
      return p.map(prepare);
    }
    function start(list) {
      qs = list || pool(); i = 0; score = 0; answers = [];
      if (!qs.length) { el.innerHTML = head() + '<div class="empty-state">No questions at this difficulty. Choose another level.</div>'; wire(); return; }
      render();
    }
    function head() {
      if (!opts.filter) return "";
      const counts = { all: bank.length, 1: 0, 2: 0, 3: 0 };
      bank.forEach(q => counts[q.d || 2]++);
      return '<div class="quiz-top"><div class="qe-filter" role="group" aria-label="Difficulty"><span class="muted" style="font-size:.88rem">Difficulty:</span><div class="seg">' +
        [["all", "All"], ["1", "Easy"], ["2", "Medium"], ["3", "Hard"]].map(([v, l]) => '<button data-lvl="' + v + '" class="' + (level === v ? "on" : "") + '"' + (counts[v] ? "" : " disabled") + ">" + l + " (" + counts[v] + ")</button>").join("") +
        "</div></div>" + (opts.key && Progress.quiz()[opts.key] ? '<span class="pill">' + icon("award", 14) + " Best: " + Progress.quiz()[opts.key].best + "%</span>" : "") + "</div>";
    }
    function wire() {
      el.querySelectorAll("[data-lvl]").forEach(b => b.onclick = () => { level = b.dataset.lvl; start(); });
    }
    function render() {
      const q = qs[i];
      el.innerHTML = head() +
        '<div class="q-card fade-in">' +
        '<div class="quiz-top" style="margin:0"><span class="q-num">Question ' + (i + 1) + " of " + qs.length + "</span>" + diffTag(q.d) + "</div>" +
        '<div class="qe-bar"><i style="width:' + (i / qs.length * 100) + '%"></i></div>' +
        '<div class="q-text">' + escapeHtml(q.q) + "</div>" +
        '<div class="options">' + q.o.map((o, k) => '<button class="option" data-k="' + k + '"><span class="letter">' + "ABCDEF"[k] + "</span><span>" + escapeHtml(o) + "</span></button>").join("") + "</div>" +
        '<div class="explain" aria-live="polite"></div>' +
        '<div class="row" style="justify-content:space-between;margin-top:14px"><span class="muted" style="font-size:.88rem">Score: <b>' + score + "</b> / " + i + "</span>" +
        '<button class="btn btn-primary btn-sm hidden" id="qeNext">' + (i === qs.length - 1 ? "See result" : "Next question") + " " + icon("arrowR", 14) + "</button></div></div>";
      wire();
      el.querySelectorAll(".option").forEach(b => b.onclick = () => choose(+b.dataset.k));
      el.querySelector("#qeNext").onclick = () => { i++; if (i < qs.length) render(); else finish(); };
    }
    function choose(k) {
      const q = qs[i], ok = k === q.a;
      if (ok) score++;
      answers.push({ q, chosen: k, ok });
      el.querySelectorAll(".option").forEach(b => {
        b.disabled = true;
        const kk = +b.dataset.k;
        if (kk === q.a) b.classList.add("correct");
        else if (kk === k) b.classList.add("wrong");
      });
      const ex = el.querySelector(".explain");
      ex.className = "explain show " + (ok ? "ok" : "bad");
      ex.innerHTML = "<b>" + (ok ? "Correct." : "Not quite — the answer is " + "ABCDEF"[q.a] + ".") + "</b> " + escapeHtml(q.e || "");
      const n = el.querySelector("#qeNext"); n.classList.remove("hidden"); n.focus();
    }
    function finish() {
      const pct = Math.round(score / qs.length * 100);
      if (opts.key) Progress.saveQuiz(opts.key, pct);
      const wrong = answers.filter(a => !a.ok);
      const byD = [1, 2, 3].map(d => { const l = answers.filter(a => (a.q.d || 2) === d); return l.length ? DIFF[d] + " " + l.filter(a => a.ok).length + "/" + l.length : null; }).filter(Boolean).join(" · ");
      const msg = pct >= 80 ? "Excellent — you have a strong grasp of this." : pct >= 50 ? "Good effort. Review the explanations below and try again." : "Revise the theory and visualization, then retry.";
      el.innerHTML = head() + '<div class="result fade-in"><div class="score">' + pct + '%</div><p style="margin:8px 0 2px"><b>' + score + " of " + qs.length + "</b> correct · " + byD + "</p><p class=\"muted\">" + msg + "</p>" +
        '<div class="row" style="justify-content:center">' +
        '<button class="btn btn-primary btn-sm" id="qeRetry">' + icon("reset", 14) + " Retry quiz</button>" +
        (wrong.length ? '<button class="btn btn-outline btn-sm" id="qeWrong">Retry the ' + wrong.length + " I got wrong</button>" : "") + "</div>" +
        (answers.length ? '<ul class="review-list">' + answers.map((a, n) => '<li class="' + (a.ok ? "ok" : "bad") + '"><b>' + (n + 1) + ". " + escapeHtml(a.q.q) + "</b> " + diffTag(a.q.d) +
          "<br>" + (a.ok ? "" : '<span style="color:var(--red)">Your answer: ' + escapeHtml(a.q.o[a.chosen]) + "</span><br>") +
          '<span style="color:var(--primary-dark)">Correct: ' + escapeHtml(a.q.o[a.q.a]) + '</span><br><span class="muted">' + escapeHtml(a.q.e || "") + "</span></li>").join("") + "</ul>" : "") + "</div>";
      wire();
      el.querySelector("#qeRetry").onclick = () => start();
      const w = el.querySelector("#qeWrong"); if (w) w.onclick = () => start(shuffle(wrong.map(a => prepare(a.q.orig))));
      if (opts.onFinish) opts.onFinish(pct, { score, total: qs.length });
    }
    start();
    return { restart: () => start() };
  }

  window.QuizEngine = { mount, diffTag, DIFF };
})();
