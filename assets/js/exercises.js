/* Practical exercises: each exercise renders into #content and generates fresh problems. */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  const { icon, Progress, renderSidebar, setSidebarActive, shuffle, escapeHtml, closeMobileNav } = App;
  const sidebar = document.getElementById("sidebar");
  const content = document.getElementById("content");
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  /* ---------- shared bits ---------- */
  function header(ex) {
    return '<div class="breadcrumb"><a href="#">Exercises</a> &rsaquo; ' + ex.group + '</div>' +
      '<h1>' + ex.title + '</h1><p class="lead">' + ex.intro + '</p>' +
      (ex.lesson ? '<p style="font-size:.9rem">Need a refresher? <a href="tutorials.html#' + ex.lesson + '">Read the lesson</a>.</p>' : "");
  }
  function solved(id, el, msg) {
    Progress.markExercise(id);
    el.className = "feedback ok";
    el.innerHTML = icon("check", 16) + " " + msg;
    drawSidebar(id);
  }
  function wrong(el, msg) { el.className = "feedback bad"; el.innerHTML = msg; }
  function streakBox() { return '<span class="pill" id="streak">Correct in a row: 0</span>'; }
  function makeStreak() {
    let n = 0;
    return { hit() { n++; upd(); }, miss() { n = 0; upd(); } };
    function upd() { const s = document.getElementById("streak"); if (s) s.textContent = "Correct in a row: " + n; }
  }

  /* ---------- 1. Binary converter ---------- */
  function binary(root) {
    const streak = makeStreak();
    let n, mode;
    root.innerHTML += '<div class="tabs" id="bmode"><button data-m="d2b" class="active">Decimal &rarr; Binary</button><button data-m="b2d">Binary &rarr; Decimal</button></div>' +
      '<div class="q-card"><div class="quiz-top"><div class="q-num">Convert this number</div>' + streakBox() + '</div>' +
      '<div class="q-text" id="bq" style="font-family:var(--mono);font-size:1.6rem"></div>' +
      '<p class="muted" style="font-size:.88rem;margin-top:0">Click the bit boxes to build the answer, or type it below.</p>' +
      '<div class="row" id="bits" style="gap:6px;margin-bottom:14px"></div>' +
      '<div class="row"><input class="input" id="bans" autocomplete="off"><button class="btn btn-primary" id="bcheck">Check</button><button class="btn btn-outline" id="bnew">' + icon("reset", 15) + ' New number</button><button class="btn btn-outline" id="bshow">Show answer</button></div>' +
      '<div class="feedback" id="bfb"></div></div>' +
      '<div class="note tip"><span class="note-title">Method</span><p>Place values in a byte are <code>128 64 32 16 8 4 2 1</code>. To convert decimal &rarr; binary, subtract the largest place value that fits and write a 1 there; otherwise 0. Example: 45 = 32 + 8 + 4 + 1 = <code>00101101</code>.</p></div>';
    const bitsEl = root.querySelector("#bits"), ans = root.querySelector("#bans"), fb = root.querySelector("#bfb");
    let bits = [0, 0, 0, 0, 0, 0, 0, 0];
    function drawBits() {
      bitsEl.innerHTML = [128, 64, 32, 16, 8, 4, 2, 1].map((v, i) =>
        '<button class="match-item' + (bits[i] ? " sel" : "") + '" data-i="' + i + '" style="width:58px;text-align:center;padding:6px 0"><div style="font-size:.7rem;color:var(--ink-faint)">' + v + '</div><b style="font-family:var(--mono);font-size:1.15rem">' + bits[i] + '</b></button>').join("") +
        '<span class="pill">= ' + bits.reduce((s, b, i) => s + b * (128 >> i), 0) + '</span>';
      bitsEl.querySelectorAll("button").forEach(b => b.onclick = () => {
        const i = +b.dataset.i; bits[i] ^= 1; drawBits();
        ans.value = mode === "d2b" ? bits.join("") : String(bits.reduce((s, b2, k) => s + b2 * (128 >> k), 0));
      });
    }
    function fresh() {
      n = rnd(1, 255); bits = [0, 0, 0, 0, 0, 0, 0, 0]; ans.value = ""; ans.className = "input"; fb.textContent = "";
      root.querySelector("#bq").textContent = mode === "d2b" ? n + "  (decimal)" : n.toString(2).padStart(8, "0") + "  (binary)";
      ans.placeholder = mode === "d2b" ? "e.g. 00101101" : "e.g. 45";
      drawBits(); ans.focus();
    }
    function check() {
      const v = ans.value.trim();
      const ok = mode === "d2b" ? /^[01]+$/.test(v) && parseInt(v, 2) === n : parseInt(v, 10) === n && /^\d+$/.test(v);
      ans.className = "input " + (ok ? "ok" : "bad");
      if (ok) { streak.hit(); solved("binary", fb, "Correct! " + n + " = " + n.toString(2).padStart(8, "0")); }
      else { streak.miss(); wrong(fb, "Not correct. Try again, or use the bit boxes to help."); }
    }
    root.querySelectorAll("#bmode button").forEach(b => b.onclick = () => {
      root.querySelectorAll("#bmode button").forEach(x => x.classList.toggle("active", x === b)); mode = b.dataset.m; fresh();
    });
    root.querySelector("#bcheck").onclick = check;
    ans.onkeydown = e => { if (e.key === "Enter") check(); };
    root.querySelector("#bnew").onclick = fresh;
    root.querySelector("#bshow").onclick = () => { wrong(fb, "Answer: " + n + " = " + n.toString(2).padStart(8, "0")); streak.miss(); };
    mode = "d2b"; fresh();
  }

  /* ---------- 2. IP class identifier ---------- */
  function ipclass(root) {
    const streak = makeStreak();
    let ip, cls, priv;
    root.innerHTML += '<div class="q-card"><div class="quiz-top"><div class="q-num">Identify the class and type</div>' + streakBox() + '</div>' +
      '<div class="q-text" id="ipq" style="font-family:var(--mono);font-size:1.6rem"></div>' +
      '<p style="margin:0 0 6px;font-weight:600">1. Which class?</p><div class="row" id="cls"></div>' +
      '<p style="margin:14px 0 6px;font-weight:600">2. Private or public?</p><div class="row" id="pp"></div>' +
      '<div class="row" style="margin-top:16px"><button class="btn btn-primary" id="ipcheck">Check</button><button class="btn btn-outline" id="ipnew">' + icon("reset", 15) + ' New IP</button></div>' +
      '<div class="feedback" id="ipfb"></div></div>' +
      '<div class="table-wrap"><table><thead><tr><th>Class</th><th>First octet</th><th>Private range</th></tr></thead><tbody>' +
      '<tr><td>A</td><td>1&ndash;126</td><td>10.0.0.0 &ndash; 10.255.255.255</td></tr><tr><td>B</td><td>128&ndash;191</td><td>172.16.0.0 &ndash; 172.31.255.255</td></tr>' +
      '<tr><td>C</td><td>192&ndash;223</td><td>192.168.0.0 &ndash; 192.168.255.255</td></tr><tr><td>D</td><td>224&ndash;239</td><td>Multicast (not private/public)</td></tr><tr><td>E</td><td>240&ndash;255</td><td>Experimental</td></tr></tbody></table></div>';
    let selC = null, selP = null;
    const cEl = root.querySelector("#cls"), pEl = root.querySelector("#pp"), fb = root.querySelector("#ipfb");
    function opts(el, list, cb) {
      el.innerHTML = list.map(x => '<button class="match-item" data-v="' + x + '" style="min-width:64px;text-align:center">' + x + '</button>').join("");
      el.querySelectorAll("button").forEach(b => b.onclick = () => { el.querySelectorAll("button").forEach(x => x.classList.toggle("sel", x === b)); cb(b.dataset.v); });
    }
    function fresh() {
      const kind = rnd(0, 9);
      let o;
      if (kind === 0) o = [10, rnd(0, 255), rnd(0, 255), rnd(1, 254)];
      else if (kind === 1) o = [172, rnd(16, 31), rnd(0, 255), rnd(1, 254)];
      else if (kind === 2) o = [192, 168, rnd(0, 255), rnd(1, 254)];
      else if (kind === 3) o = [rnd(224, 239), rnd(0, 255), rnd(0, 255), rnd(1, 254)];
      else if (kind === 4) o = [172, [rnd(0, 15), rnd(32, 255)][rnd(0, 1)], rnd(0, 255), rnd(1, 254)];
      else { let f; do { f = rnd(1, 223); } while (f === 127 || f === 10); o = [f, rnd(0, 255), rnd(0, 255), rnd(1, 254)]; if (f === 192 && o[1] === 168) o[1] = 169; }
      ip = o.join(".");
      const f = o[0];
      cls = f <= 126 ? "A" : f <= 191 ? "B" : f <= 223 ? "C" : f <= 239 ? "D" : "E";
      priv = f === 10 || (f === 172 && o[1] >= 16 && o[1] <= 31) || (f === 192 && o[1] === 168) ? "Private" : (cls === "D" || cls === "E") ? "Neither" : "Public";
      root.querySelector("#ipq").textContent = ip;
      selC = selP = null; fb.textContent = "";
      opts(cEl, ["A", "B", "C", "D", "E"], v => selC = v);
      opts(pEl, ["Private", "Public", "Neither"], v => selP = v);
    }
    root.querySelector("#ipcheck").onclick = () => {
      if (!selC || !selP) return wrong(fb, "Pick an answer for both questions.");
      if (selC === cls && selP === priv) { streak.hit(); solved("ipclass", fb, "Correct! " + ip + " is Class " + cls + ", " + priv.toLowerCase() + "."); }
      else { streak.miss(); wrong(fb, "Not quite. " + ip + " is Class " + cls + " and " + (priv === "Neither" ? "a multicast/experimental address (neither)" : priv.toLowerCase()) + "."); }
    };
    root.querySelector("#ipnew").onclick = fresh;
    fresh();
  }

  /* ---------- 3. Subnet challenge ---------- */
  const ipToInt = s => s.split(".").reduce((a, o) => (a * 256) + (+o), 0);
  const intToIp = n => [24, 16, 8, 0].map(s => Math.floor(n / Math.pow(2, s)) % 256).join(".");
  function subnetCalc(ip, p) {
    const n = ipToInt(ip), size = Math.pow(2, 32 - p);
    const net = Math.floor(n / size) * size, bc = net + size - 1;
    const maskInt = Math.pow(2, 32) - size;
    return { net: intToIp(net), bc: intToIp(bc), first: p >= 31 ? intToIp(net) : intToIp(net + 1), last: p >= 31 ? intToIp(bc) : intToIp(bc - 1), hosts: p >= 31 ? (p === 31 ? 2 : 1) : size - 2, mask: intToIp(maskInt) };
  }
  function subnet(root) {
    const streak = makeStreak();
    let ip, p, sol;
    const fields = [["mask", "Subnet mask"], ["net", "Network address"], ["bc", "Broadcast address"], ["first", "First usable host"], ["last", "Last usable host"], ["hosts", "Number of usable hosts"]];
    root.innerHTML += '<div class="q-card"><div class="quiz-top"><div class="q-num">Calculate for</div>' + streakBox() + '</div>' +
      '<div class="q-text" id="sq" style="font-family:var(--mono);font-size:1.6rem"></div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px">' +
      fields.map(f => '<label style="font-size:.88rem;font-weight:600">' + f[1] + '<br><input class="input" id="s-' + f[0] + '" autocomplete="off" style="margin-top:4px"></label>').join("") + '</div>' +
      '<div class="row" style="margin-top:16px"><button class="btn btn-primary" id="scheck">Check answers</button><button class="btn btn-outline" id="snew">' + icon("reset", 15) + ' New problem</button><button class="btn btn-outline" id="sshow">Show solution</button></div>' +
      '<div class="feedback" id="sfb"></div><div id="ssol"></div></div>' +
      '<h2>Free Subnet Calculator</h2><p>Enter any IP and prefix to check your own homework.</p>' +
      '<div class="row"><input class="input" id="cip" value="192.168.10.75" style="max-width:180px"><span>/</span><input class="input" id="cp" value="27" style="max-width:70px" type="number" min="1" max="32"><button class="btn btn-dark" id="ccalc">Calculate</button></div><div id="cout"></div>';
    const fb = root.querySelector("#sfb");
    function solutionHtml(ip2, p2, s) {
      const size = Math.pow(2, 32 - p2);
      return '<div class="codebox">IP / prefix      : ' + ip2 + '/' + p2 + '\nHost bits        : 32 - ' + p2 + ' = ' + (32 - p2) + '\nBlock size       : 2^' + (32 - p2) + ' = ' + size + ' addresses\nSubnet mask      : ' + s.mask +
        '\nNetwork address  : ' + s.net + '\nBroadcast        : ' + s.bc + '\nUsable range     : ' + s.first + ' - ' + s.last + '\nUsable hosts     : ' + s.hosts + '</div>';
    }
    function fresh() {
      p = rnd(20, 30);
      const firstOct = [10, 172, 192][rnd(0, 2)];
      ip = [firstOct, firstOct === 192 ? 168 : firstOct === 172 ? rnd(16, 31) : rnd(0, 255), rnd(0, 255), rnd(1, 254)].join(".");
      sol = subnetCalc(ip, p);
      root.querySelector("#sq").textContent = ip + "/" + p;
      fields.forEach(f => { const el = root.querySelector("#s-" + f[0]); el.value = ""; el.className = "input"; });
      fb.textContent = ""; root.querySelector("#ssol").innerHTML = "";
    }
    root.querySelector("#scheck").onclick = () => {
      let right = 0;
      fields.forEach(f => {
        const el = root.querySelector("#s-" + f[0]);
        const ok = el.value.trim().replace(/\s/g, "") === String(sol[f[0]]);
        el.className = "input " + (ok ? "ok" : "bad"); if (ok) right++;
      });
      if (right === fields.length) { streak.hit(); solved("subnet", fb, "Perfect! All 6 answers are correct."); }
      else { streak.miss(); wrong(fb, right + " of 6 correct. Fix the red fields, or click Show solution."); }
    };
    root.querySelector("#snew").onclick = fresh;
    root.querySelector("#sshow").onclick = () => { root.querySelector("#ssol").innerHTML = solutionHtml(ip, p, sol); streak.miss(); };
    root.querySelector("#ccalc").onclick = () => {
      const cip = root.querySelector("#cip").value.trim(), cp = +root.querySelector("#cp").value;
      const valid = /^(\d{1,3}\.){3}\d{1,3}$/.test(cip) && cip.split(".").every(o => +o <= 255) && cp >= 1 && cp <= 32;
      root.querySelector("#cout").innerHTML = valid ? solutionHtml(cip, cp, subnetCalc(cip, cp)) : '<p class="feedback bad">Enter a valid IPv4 address and a prefix from 1 to 32.</p>';
    };
    fresh();
    root.querySelector("#ccalc").click();
  }

  /* ---------- 4. Parity ---------- */
  function parity(root) {
    const streak = makeStreak();
    let data, type;
    root.innerHTML += '<div class="q-card"><div class="quiz-top"><div class="q-num">Find the parity bit</div>' + streakBox() + '</div>' +
      '<div class="q-text" id="pq"></div>' +
      '<div class="row"><button class="match-item" data-v="0" style="width:70px;text-align:center;font-family:var(--mono);font-size:1.2rem">0</button><button class="match-item" data-v="1" style="width:70px;text-align:center;font-family:var(--mono);font-size:1.2rem">1</button>' +
      '<button class="btn btn-outline" id="pnew">' + icon("reset", 15) + ' New data</button></div><div class="feedback" id="pfb"></div></div>' +
      '<h2>Error Detection Demo</h2><p>Click any bit in the transmitted codeword below to flip it (simulating noise), and see whether the receiver detects the error.</p>' +
      '<div class="box"><div class="row" id="demo" style="gap:6px"></div><div class="feedback" id="dfb"></div></div>';
    const fb = root.querySelector("#pfb");
    function fresh() {
      data = Array.from({ length: 7 }, () => rnd(0, 1)).join("");
      type = rnd(0, 1) ? "even" : "odd";
      root.querySelector("#pq").innerHTML = 'Data: <code style="font-size:1.3rem">' + data + '</code> &nbsp; using <b>' + type + ' parity</b>';
      fb.textContent = "";
      demo();
    }
    function correctBit() { const ones = data.split("").filter(c => c === "1").length; return type === "even" ? ones % 2 : (ones + 1) % 2; }
    root.querySelectorAll("[data-v]").forEach(b => b.onclick = () => {
      const c = correctBit(), ones = data.split("").filter(x => x === "1").length;
      if (+b.dataset.v === c) { streak.hit(); solved("parity", fb, "Correct! " + ones + " ones in the data; parity bit " + c + " makes the total " + (ones + c) + " (" + type + "). Codeword: " + data + c); }
      else { streak.miss(); wrong(fb, "Not quite. Count the 1s: there are " + ones + ". For " + type + " parity the total number of 1s (including the parity bit) must be " + type + "."); }
    });
    root.querySelector("#pnew").onclick = fresh;
    let code;
    function demo() {
      code = (data + correctBit()).split("").map(Number);
      drawDemo();
    }
    function drawDemo() {
      const orig = (data + correctBit()).split("").map(Number);
      const el = root.querySelector("#demo");
      el.innerHTML = code.map((b, i) => '<button class="match-item' + (b !== orig[i] ? " shake" : "") + '" data-i="' + i + '" style="width:44px;text-align:center;font-family:var(--mono);font-size:1.1rem;' + (b !== orig[i] ? "background:var(--red-soft);border-color:var(--red)" : i === 7 ? "background:var(--amber-soft)" : "") + '">' + b + '</button>').join("") + '<span class="muted" style="font-size:.85rem">(last bit = parity)</span>';
      el.querySelectorAll("button").forEach(b => b.onclick = () => { code[+b.dataset.i] ^= 1; drawDemo(); });
      const flips = code.filter((b, i) => b !== orig[i]).length;
      const ones = code.filter(b => b === 1).length;
      const passes = type === "even" ? ones % 2 === 0 : ones % 2 === 1;
      const dfb = root.querySelector("#dfb");
      if (flips === 0) { dfb.className = "feedback"; dfb.textContent = "No bits flipped. Receiver counts " + ones + " ones: parity check passes."; }
      else if (!passes) { dfb.className = "feedback ok"; dfb.textContent = flips + " bit(s) flipped. Receiver counts " + ones + " ones: parity check FAILS, error detected!"; }
      else { dfb.className = "feedback bad"; dfb.textContent = flips + " bits flipped. Receiver counts " + ones + " ones: parity check passes, so the error is NOT detected. This is the weakness of simple parity."; }
    }
    fresh();
  }

  /* ---------- 5. OSI ordering (drag & drop + buttons) ---------- */
  function osiorder(root) {
    const correct = ["Application", "Presentation", "Session", "Transport", "Network", "Data Link", "Physical"];
    let items;
    root.innerHTML += '<div class="q-card"><div class="q-num">Arrange from Layer 7 (top) to Layer 1 (bottom)</div>' +
      '<p class="muted" style="font-size:.88rem">Drag the cards, or use the arrow buttons.</p>' +
      '<div class="dnd-list" id="list"></div>' +
      '<div class="row" style="margin-top:14px"><button class="btn btn-primary" id="ocheck">Check order</button><button class="btn btn-outline" id="oshuffle">' + icon("reset", 15) + ' Shuffle</button></div>' +
      '<div class="feedback" id="ofb"></div></div>';
    const list = root.querySelector("#list"), fb = root.querySelector("#ofb");
    let dragI = null;
    function draw(marks) {
      list.innerHTML = items.map((x, i) =>
        '<div class="chip' + (marks ? (x === correct[i] ? " ok" : " bad") : "") + '" draggable="true" data-i="' + i + '"><span class="handle">&#8942;&#8942;</span><b style="width:22px">' + (7 - i) + '</b>' + x +
        '<span class="mv"><button data-up="' + i + '" aria-label="Move up">&#9650;</button><button data-dn="' + i + '" aria-label="Move down">&#9660;</button></span></div>').join("");
      list.querySelectorAll(".chip").forEach(c => {
        c.addEventListener("dragstart", () => { dragI = +c.dataset.i; c.classList.add("dragging"); });
        c.addEventListener("dragend", () => c.classList.remove("dragging"));
        c.addEventListener("dragover", e => e.preventDefault());
        c.addEventListener("drop", e => { e.preventDefault(); const to = +c.dataset.i; if (dragI === null || dragI === to) return; const [m] = items.splice(dragI, 1); items.splice(to, 0, m); dragI = null; draw(); });
      });
      list.querySelectorAll("[data-up]").forEach(b => b.onclick = () => { const i = +b.dataset.up; if (i > 0) { [items[i - 1], items[i]] = [items[i], items[i - 1]]; draw(); } });
      list.querySelectorAll("[data-dn]").forEach(b => b.onclick = () => { const i = +b.dataset.dn; if (i < items.length - 1) { [items[i + 1], items[i]] = [items[i], items[i + 1]]; draw(); } });
    }
    function sh() { do { items = shuffle(correct); } while (items.join() === correct.join()); fb.textContent = ""; draw(); }
    root.querySelector("#ocheck").onclick = () => {
      const right = items.filter((x, i) => x === correct[i]).length;
      draw(true);
      if (right === 7) solved("osiorder", fb, "Perfect order! All People Seem To Need Data Processing.");
      else wrong(fb, right + " of 7 in the correct position. Green = correct, red = wrong. Hint: All People Seem To Need Data Processing.");
    };
    root.querySelector("#oshuffle").onclick = sh;
    sh();
  }

  /* ---------- 6 & 7. Click-to-match ---------- */
  function matcher(root, id, pairs, leftTitle, rightTitle, doneMsg) {
    root.innerHTML += '<div class="q-card"><div class="quiz-top"><div class="q-num">Click an item on the left, then its match on the right</div><span class="pill" id="mcount"></span></div>' +
      '<div class="match-grid"><div><b style="font-size:.85rem;color:var(--ink-faint)">' + leftTitle + '</b><div class="match-col" id="ml" style="margin-top:6px"></div></div>' +
      '<div><b style="font-size:.85rem;color:var(--ink-faint)">' + rightTitle + '</b><div class="match-col" id="mr" style="margin-top:6px"></div></div></div>' +
      '<div class="row" style="margin-top:14px"><button class="btn btn-outline" id="mreset">' + icon("reset", 15) + ' Restart</button></div>' +
      '<div class="feedback" id="mfb"></div></div>';
    const L = root.querySelector("#ml"), R = root.querySelector("#mr"), fb = root.querySelector("#mfb");
    let sel = null, done = 0, mistakes = 0;
    function setup() {
      sel = null; done = 0; mistakes = 0; fb.textContent = "";
      const chosen = shuffle(pairs).slice(0, 6);
      L.innerHTML = shuffle(chosen).map(p => '<button class="match-item" data-k="' + escapeHtml(p[0]) + '">' + escapeHtml(p[0]) + '</button>').join("");
      R.innerHTML = shuffle(chosen).map(p => '<button class="match-item" data-k="' + escapeHtml(p[0]) + '">' + escapeHtml(p[1]) + '</button>').join("");
      count(chosen.length);
      L.querySelectorAll("button").forEach(b => b.onclick = () => { if (b.classList.contains("done")) return; L.querySelectorAll("button").forEach(x => x.classList.toggle("sel", x === b)); sel = b; });
      R.querySelectorAll("button").forEach(b => b.onclick = () => {
        if (!sel || b.classList.contains("done")) return;
        if (b.dataset.k === sel.dataset.k) {
          [sel, b].forEach(x => { x.classList.remove("sel"); x.classList.add("done"); });
          sel = null; done++; count(chosen.length);
          if (done === chosen.length) solved(id, fb, doneMsg + " (" + mistakes + " mistake" + (mistakes === 1 ? "" : "s") + ")");
        } else {
          mistakes++; b.classList.add("shake"); setTimeout(() => b.classList.remove("shake"), 400);
          wrong(fb, "Not a match. Try again.");
        }
      });
    }
    function count(t) { root.querySelector("#mcount").textContent = done + " / " + t + " matched"; }
    root.querySelector("#mreset").onclick = setup;
    setup();
  }
  function ports(root) {
    matcher(root, "ports", [["HTTP", "80"], ["HTTPS", "443"], ["FTP (control)", "21"], ["SSH", "22"], ["Telnet", "23"], ["SMTP", "25"], ["DNS", "53"], ["DHCP server", "67"], ["POP3", "110"], ["IMAP", "143"], ["RDP", "3389"]],
      "Protocol", "Port", "All protocols matched to their ports!");
  }
  function devices(root) {
    matcher(root, "devices", [["Hub", "Layer 1 – Physical"], ["Switch", "Layer 2 – Data Link (MAC)"], ["Router", "Layer 3 – Network (IP)"], ["Repeater", "Layer 1 – regenerates signal"], ["Bridge", "Layer 2 – connects two LAN segments"], ["Modem", "Converts digital ⇄ analog"], ["Access Point", "Connects wireless devices to a LAN"], ["Gateway", "Translates between different protocols"], ["Firewall", "Filters traffic by rules"]],
      "Device", "Description / Layer", "All devices matched correctly!");
  }

  /* ---------- 8. Mesh calculator ---------- */
  function mesh(root) {
    const streak = makeStreak();
    let n;
    root.innerHTML += '<div class="q-card"><div class="quiz-top"><div class="q-num">Full mesh topology</div>' + streakBox() + '</div>' +
      '<div class="q-text" id="mq"></div>' +
      '<div style="display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:16px;align-items:center" class="mesh-grid">' +
      '<div><label style="font-size:.88rem;font-weight:600">Total number of links<br><input class="input" id="ml1" type="number" style="margin-top:4px"></label><br><br>' +
      '<label style="font-size:.88rem;font-weight:600">Ports (connections) needed per device<br><input class="input" id="ml2" type="number" style="margin-top:4px"></label>' +
      '<div class="row" style="margin-top:14px"><button class="btn btn-primary" id="mcheck">Check</button><button class="btn btn-outline" id="mnew">' + icon("reset", 15) + ' New problem</button></div>' +
      '<div class="feedback" id="mfb2"></div></div><canvas id="mcv" width="220" height="220" style="border:1px solid var(--line);border-radius:6px;background:#fff"></canvas></div></div>' +
      '<div class="note tip"><span class="note-title">Formula</span><p>Links = n(n &minus; 1) / 2 &nbsp;&nbsp; Ports per device = n &minus; 1</p></div>';
    const fb = root.querySelector("#mfb2"), cv = root.querySelector("#mcv"), ctx = cv.getContext("2d");
    function drawMesh(show) {
      ctx.clearRect(0, 0, 220, 220);
      const pts = Array.from({ length: n }, (_, i) => [110 + 85 * Math.cos(i / n * 2 * Math.PI - Math.PI / 2), 110 + 85 * Math.sin(i / n * 2 * Math.PI - Math.PI / 2)]);
      ctx.strokeStyle = show ? "#0b7a5c" : "#c5ccd5"; ctx.lineWidth = 1.2;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke(); }
      pts.forEach((p, i) => { ctx.fillStyle = "#1e2a38"; ctx.beginPath(); ctx.arc(p[0], p[1], 12, 0, 7); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "bold 11px Segoe UI"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(i + 1, p[0], p[1]); });
    }
    function fresh() {
      n = rnd(3, 10);
      root.querySelector("#mq").textContent = "A full mesh network has " + n + " devices.";
      ["#ml1", "#ml2"].forEach(s => { root.querySelector(s).value = ""; root.querySelector(s).className = "input"; });
      fb.textContent = ""; drawMesh(false);
    }
    root.querySelector("#mcheck").onclick = () => {
      const a = +root.querySelector("#ml1").value, b = +root.querySelector("#ml2").value;
      const L = n * (n - 1) / 2, okA = a === L, okB = b === n - 1;
      root.querySelector("#ml1").className = "input " + (okA ? "ok" : "bad");
      root.querySelector("#ml2").className = "input " + (okB ? "ok" : "bad");
      if (okA && okB) { streak.hit(); drawMesh(true); solved("mesh", fb, "Correct! " + n + " x " + (n - 1) + " / 2 = " + L + " links, " + (n - 1) + " ports each."); }
      else { streak.miss(); wrong(fb, "Check your working: links = n(n-1)/2 with n = " + n + "."); }
    };
    root.querySelector("#mnew").onclick = fresh;
    fresh();
  }

  /* ---------- Registry ---------- */
  const EX = [
    { id: "binary", group: "Number Systems", title: "Binary / Decimal Converter", intro: "Convert between decimal and 8-bit binary. Binary is the foundation of IP addressing and subnetting.", lesson: "data-flow", run: binary },
    { id: "ipclass", group: "IP Addressing", title: "IP Class Identifier", intro: "Identify the class of a random IPv4 address and whether it is private or public.", lesson: "ip-addressing", run: ipclass },
    { id: "subnet", group: "IP Addressing", title: "Subnet Calculator Challenge", intro: "Given an IP address and prefix, calculate the mask, network, broadcast, host range and number of hosts.", lesson: "subnetting", run: subnet },
    { id: "parity", group: "Error Detection", title: "Parity Bit Calculator", intro: "Find the correct parity bit, then flip bits to see when parity checking catches (or misses) errors.", lesson: "errors", run: parity },
    { id: "osiorder", group: "Models", title: "Order the OSI Layers", intro: "Put the seven OSI layers in the correct order, from Application (7) down to Physical (1).", lesson: "osi", run: osiorder },
    { id: "ports", group: "Protocols", title: "Match Protocols to Ports", intro: "Match each application protocol with its well-known port number. A new set appears each time.", lesson: "tcp-udp", run: ports },
    { id: "devices", group: "Devices", title: "Device to Layer Match", intro: "Match each network device with its OSI layer or job.", lesson: "devices", run: devices },
    { id: "mesh", group: "Topologies", title: "Mesh Topology Calculator", intro: "Calculate the number of links and ports needed for a full mesh network.", lesson: "topologies", run: mesh }
  ];

  function drawSidebar(active) {
    const solvedList = Progress.exercises();
    const groups = [{ title: "Overview", items: [{ id: "", label: "All Exercises" }] }];
    EX.forEach(e => {
      let g = groups.find(x => x.title === e.group);
      if (!g) { g = { title: e.group, items: [] }; groups.push(g); }
      g.items.push({ id: e.id, label: e.title, done: solvedList.indexOf(e.id) !== -1 });
    });
    renderSidebar(sidebar, groups, active, id => id ? "#" + id : "#");
  }

  function home() {
    const s = Progress.exercises();
    const ic = ["code", "globe", "net", "shield", "layers", "zap", "cube", "target"];
    const col = ["green", "blue", "violet", "amber", "red", "dark", "green", "blue"];
    content.innerHTML = '<div class="fade-in"><h1>Practical Exercises</h1><p class="lead">Hands-on problems that generate new questions every time, with instant feedback. You have solved <b>' + s.length + ' of ' + EX.length + '</b>.</p>' +
      '<div class="progress" style="margin-bottom:24px"><i style="width:' + (s.length / EX.length * 100) + '%"></i></div>' +
      '<div class="grid grid-4">' + EX.map((e, i) => '<a class="card" href="#' + e.id + '"><div class="icon ' + col[i] + '">' + icon(ic[i], 22) + '</div><h3>' + e.title + '</h3><p>' + e.intro + '</p><div class="go">' + (s.indexOf(e.id) !== -1 ? "&#10003; Solved &middot; Practise again" : "Start &rarr;") + '</div></a>').join("") + '</div></div>';
  }

  function route() {
    const id = location.hash.slice(1);
    const ex = EX.find(e => e.id === id);
    drawSidebar(ex ? ex.id : "");
    setSidebarActive(sidebar, ex ? ex.id : "");
    if (ex) {
      content.innerHTML = '<div class="fade-in" id="exroot">' + header(ex) + '</div>';
      ex.run(document.getElementById("exroot"));
      const i = EX.indexOf(ex);
      document.getElementById("exroot").insertAdjacentHTML("beforeend", '<div class="lesson-nav">' +
        (EX[i - 1] ? '<a class="btn btn-primary" href="#' + EX[i - 1].id + '">' + icon("arrowL", 16) + ' Previous</a>' : '<span></span>') +
        (EX[i + 1] ? '<a class="btn btn-primary" href="#' + EX[i + 1].id + '">Next ' + icon("arrowR", 16) + '</a>' : '<a class="btn btn-primary" href="quiz.html">Take a quiz ' + icon("arrowR", 16) + '</a>') + '</div>');
      document.title = ex.title + " — NetLab";
    } else { home(); document.title = "Practical Exercises — NetLab"; }
    window.scrollTo(0, 0);
    closeMobileNav();
  }
  window.addEventListener("hashchange", route);
  route();
});
