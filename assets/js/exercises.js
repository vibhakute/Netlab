/* Practical exercises for Units I-IV: each exercise renders into #content and
   generates fresh problems. Facts and values come from the unit lessons/slides. */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  const { icon, Progress, renderSidebar, setSidebarActive, shuffle, escapeHtml, closeMobileNav, topicHref, topicById } = App;
  const sidebar = document.getElementById("sidebar");
  const content = document.getElementById("content");
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const bin8 = n => n.toString(2).padStart(8, "0");

  /* ---------- shared bits ---------- */
  function header(ex) {
    const t = ex.lesson && topicById(ex.lesson);
    return '<div class="breadcrumb"><a href="#">Practice</a> &rsaquo; ' + ex.group + '</div>' +
      '<h1>' + ex.title + '</h1><p class="lead">' + ex.intro + '</p>' +
      (t ? '<p style="font-size:.9rem">Need a refresher? Read the lesson <a href="' + topicHref(t.id) + '">' + escapeHtml(t.title) + '</a>.</p>' : "");
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
  const tip = (title, html) => '<div class="note tip"><span class="note-title">' + title + "</span><p>" + html + "</p></div>";

  /* ---------- Identify-it questions (one scenario, pick the answer) ---------- */
  // items: [scenario, answer, reason]. Up to 4 options are shown; 5 correct answers solve the exercise.
  function classify(root, id, items, choices, help) {
    const streak = makeStreak(), GOAL = 5;
    let order = shuffle(items), k = 0, cur = null, right = 0, answered = false;
    root.innerHTML += '<div class="q-card"><div class="quiz-top"><div class="q-num" id="cqn"></div>' + streakBox() + '</div>' +
      '<div class="q-text" id="cq"></div><div class="options" id="copts"></div>' +
      '<div class="row" style="margin-top:14px"><button class="btn btn-primary" id="cnext">Next scenario ' + icon("arrowR", 15) + '</button></div>' +
      '<div class="feedback" id="cfb"></div></div>' + (help ? tip("Remember", help) : "");
    const q = root.querySelector("#cq"), opts = root.querySelector("#copts"), fb = root.querySelector("#cfb");
    function fresh() {
      if (k >= order.length) { order = shuffle(items); k = 0; }
      cur = order[k++]; answered = false; fb.className = "feedback"; fb.textContent = "";
      root.querySelector("#cqn").textContent = "Correct so far: " + Math.min(right, GOAL) + " / " + GOAL + (right >= GOAL ? " ✓" : "");
      q.textContent = cur[0];
      const list = choices.length <= 4 ? choices : shuffle([cur[1]].concat(shuffle(choices.filter(c => c !== cur[1])).slice(0, 3)));
      opts.innerHTML = list.map((c, i) => '<button class="option" data-c="' + escapeHtml(c) + '"><span class="letter">' + "ABCD"[i] + "</span><span>" + escapeHtml(c) + "</span></button>").join("");
      opts.querySelectorAll("button").forEach(b => b.onclick = () => {
        if (answered) return; answered = true;
        const ok = b.dataset.c === cur[1];
        opts.querySelectorAll("button").forEach(x => { x.disabled = true; if (x.dataset.c === cur[1]) x.classList.add("correct"); });
        if (!ok) b.classList.add("wrong");
        if (ok) {
          streak.hit(); right++;
          if (right === GOAL) solved(id, fb, "Correct — " + escapeHtml(cur[2]) + " <b>Exercise solved!</b> Keep going for more practice.");
          else { fb.className = "feedback ok"; fb.innerHTML = icon("check", 16) + " Correct — " + escapeHtml(cur[2]); }
        } else { streak.miss(); wrong(fb, "Not quite. The answer is <b>" + escapeHtml(cur[1]) + "</b> — " + escapeHtml(cur[2])); }
        root.querySelector("#cqn").textContent = "Correct so far: " + Math.min(right, GOAL) + " / " + GOAL + (right >= GOAL ? " ✓" : "");
      });
    }
    root.querySelector("#cnext").onclick = fresh;
    fresh();
  }

  /* ---------- Click-to-match ---------- */
  function matcher(root, id, pairs, leftTitle, rightTitle, doneMsg) {
    root.innerHTML += '<div class="q-card"><div class="quiz-top"><div class="q-num">Click an item on the left, then its match on the right</div><span class="pill" id="mcount"></span></div>' +
      '<div class="match-grid"><div><b style="font-size:.85rem;color:var(--ink-faint)">' + leftTitle + '</b><div class="match-col" id="ml" style="margin-top:6px"></div></div>' +
      '<div><b style="font-size:.85rem;color:var(--ink-faint)">' + rightTitle + '</b><div class="match-col" id="mr" style="margin-top:6px"></div></div></div>' +
      '<div class="row" style="margin-top:14px"><button class="btn btn-outline" id="mreset">' + icon("reset", 15) + ' New set</button></div>' +
      '<div class="feedback" id="mfb"></div></div>';
    const L = root.querySelector("#ml"), R = root.querySelector("#mr"), fb = root.querySelector("#mfb");
    let sel = null, done = 0, mistakes = 0;
    function setup() {
      sel = null; done = 0; mistakes = 0; fb.className = "feedback"; fb.textContent = "";
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

  /* ---------- Unit I: transmission modes ---------- */
  function modes(root) {
    classify(root, "modes", [
      ["Typing on a keyboard that sends characters to the computer.", "Simplex", "data flows only from the keyboard to the computer (slide example)."],
      ["A computer monitor displaying output.", "Simplex", "the monitor only receives data (slide example)."],
      ["Listening to music through a speaker.", "Simplex", "the speaker only receives the signal (slide example)."],
      ["An IoT temperature sensor that only reports its readings.", "Simplex", "one device only sends and the other only receives."],
      ["A TV station broadcasting to homes.", "Simplex", "the station only transmits; homes only receive."],
      ["Two people talking on walkie-talkies.", "Half-duplex", "both can talk, but only one at a time (slide example)."],
      ["A push-to-talk radio: press to speak, release to listen.", "Half-duplex", "both directions, one at a time on one channel."],
      ["A landline telephone call.", "Full-duplex", "both people talk and listen at the same time (slide example)."],
      ["A mobile phone call.", "Full-duplex", "sending and receiving happen simultaneously (slide example)."],
      ["A video call where both people speak and hear each other at once.", "Full-duplex", "two-way communication at the same time."]
    ], ["Simplex", "Half-duplex", "Full-duplex"],
      "<b>Simplex</b> = one way only, full capacity in one direction. <b>Half-duplex</b> = both ways, but one at a time on one channel. <b>Full-duplex</b> = both ways at the same time (two channels), the best performance.");
  }

  /* ---------- Unit I: LAN, MAN or WAN ---------- */
  function netscale(root) {
    classify(root, "netscale", [
      ["Computers in one college computer lab connected by a switch.", "LAN", "same building or campus, privately owned."],
      ["The Wi-Fi network inside a home.", "LAN", "a small area with private ownership."],
      ["Office PCs on three floors of one building sharing a printer.", "LAN", "they are in the same building."],
      ["A network joining a hospital LAN, a school LAN, a college LAN and a factory LAN across one city.", "MAN", "a city-wide network of LANs (slide diagram)."],
      ["A cable TV operator's network covering a whole city.", "MAN", "it covers a city, about 5–50 km."],
      ["Two campuses of the same college 20 km apart in one city.", "MAN", "20 km lies in the MAN range of 5–50 km."],
      ["A bank linking its branches all over the country.", "WAN", "it spans a country, more than 50 km."],
      ["The Internet.", "WAN", "it spans countries and continents."],
      ["Branch offices in two cities about 150 km apart.", "WAN", "the distance is above 50 km."]
    ], ["LAN", "MAN", "WAN"],
      "<b>LAN</b>: same building or campus, private, high speed, short delay. <b>MAN</b>: a city, about 5–50 km. <b>WAN</b>: above 50 km — a country or continent, long delay.");
  }

  /* ---------- Unit II: transmission media ---------- */
  function media(root) {
    matcher(root, "media", [
      ["UTP", "Cheapest, easy to install; telephone wiring"], ["STP", "Copper braid or foil shield blocks interference"],
      ["Coaxial cable", "Cable TV; baseband and broadband modes"], ["Optical fibre", "Light by total internal reflection; huge bandwidth"],
      ["Radio waves", "3 kHz – 1 GHz, omnidirectional, AM/FM radio"], ["Microwaves", "1 – 300 GHz, line of sight, aligned antennas"],
      ["Infrared", "300 GHz – 400 THz, TV remotes, cannot pass walls"], ["Iridium", "LEO satellites covering the whole Earth incl. the poles"],
      ["Stripline", "Conductor sandwiched between two ground planes"], ["Microstripline", "Strip on a dielectric with a ground plane below"]
    ], "Medium", "Key feature or use", "All media matched correctly!");
  }

  /* ---------- Unit III: binary converter ---------- */
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
      tip("Method", "Place values in a byte are <code>128 64 32 16 8 4 2 1</code>. To convert decimal &rarr; binary, subtract the largest place value that fits and write a 1 there; otherwise 0. Example: 65 = 64 + 1 = <code>01000001</code>, the ASCII code of “A”.");
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
      root.querySelector("#bq").textContent = mode === "d2b" ? n + "  (decimal)" : bin8(n) + "  (binary)";
      ans.placeholder = mode === "d2b" ? "e.g. 01000001" : "e.g. 65";
      drawBits(); ans.focus();
    }
    function check() {
      const v = ans.value.trim().replace(/\s+/g, "");
      const ok = mode === "d2b" ? /^[01]+$/.test(v) && parseInt(v, 2) === n : parseInt(v, 10) === n && /^\d+$/.test(v);
      ans.className = "input " + (ok ? "ok" : "bad");
      if (ok) { streak.hit(); solved("binary", fb, "Correct! " + n + " = " + bin8(n)); }
      else { streak.miss(); wrong(fb, "Not correct. Try again, or use the bit boxes to help."); }
    }
    root.querySelectorAll("#bmode button").forEach(b => b.onclick = () => {
      root.querySelectorAll("#bmode button").forEach(x => x.classList.toggle("active", x === b)); mode = b.dataset.m; fresh();
    });
    root.querySelector("#bcheck").onclick = check;
    ans.onkeydown = e => { if (e.key === "Enter") check(); };
    root.querySelector("#bnew").onclick = fresh;
    root.querySelector("#bshow").onclick = () => { wrong(fb, "Answer: " + n + " = " + bin8(n)); streak.miss(); };
    mode = "d2b"; fresh();
  }

  /* ---------- Unit III: ASCII and EBCDIC encoder ---------- */
  function codes(root) {
    const streak = makeStreak();
    let ch, code, mode;
    const POOL = { ascii: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ", ebcdic: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 " };
    root.innerHTML += '<div class="tabs" id="cmode"><button data-m="ascii" class="active">ASCII</button><button data-m="ebcdic">EBCDIC</button></div>' +
      '<div class="q-card"><div class="quiz-top"><div class="q-num" id="cqh"></div>' + streakBox() + '</div>' +
      '<div class="q-text" id="cch" style="font-family:var(--mono);font-size:1.6rem"></div>' +
      '<div class="row" style="align-items:flex-end;gap:14px"><label style="font-size:.88rem;font-weight:600"><span id="c1l"></span><br><input class="input" id="c1" autocomplete="off" style="margin-top:4px"></label>' +
      '<label style="font-size:.88rem;font-weight:600">8-bit binary<br><input class="input" id="c2" autocomplete="off" placeholder="e.g. 0100 0001" style="margin-top:4px"></label></div>' +
      '<div class="row" style="margin-top:14px"><button class="btn btn-primary" id="ccheck">Check</button><button class="btn btn-outline" id="cnew">' + icon("reset", 15) + ' New character</button><button class="btn btn-outline" id="cshow">Show answer</button></div>' +
      '<div class="feedback" id="cfb"></div></div><div id="ctip"></div>';
    const i1 = root.querySelector("#c1"), i2 = root.querySelector("#c2"), fb = root.querySelector("#cfb");
    const show = c => c === " " ? "␣ (space)" : "“" + c + "”";
    const answer = () => mode === "ascii" ? code + " = " + bin8(code) : code.toString(16).toUpperCase() + " = " + bin8(code);
    function fresh() {
      const pool = POOL[mode]; ch = pool[rnd(0, pool.length - 1)];
      code = mode === "ascii" ? ch.charCodeAt(0) : SimLogic.toEbcdic(ch);
      root.querySelector("#cqh").textContent = "Encode this character in " + mode.toUpperCase();
      root.querySelector("#cch").textContent = show(ch);
      root.querySelector("#c1l").textContent = mode === "ascii" ? "Decimal code" : "Hex code";
      i1.placeholder = mode === "ascii" ? "e.g. 65" : "e.g. C1";
      [i1, i2].forEach(x => { x.value = ""; x.className = "input"; }); fb.textContent = ""; fb.className = "feedback";
      root.querySelector("#ctip").innerHTML = mode === "ascii"
        ? tip("ASCII", "7-bit code, 128 characters. Space = 32, digits “0”–“9” = 48–57, “A”–“Z” = 65–90, “a”–“z” = 97–122. Written as 8 bits with a leading 0, e.g. “A” = 65 = <code>0100 0001</code>.")
        : tip("EBCDIC zones", "8-bit IBM code. Zone (high 4 bits) + digit (low 4 bits): A–I = C1–C9, J–R = D1–D9, S–Z = E2–E9, 0–9 = F0–F9, space = 40. Example: “B” = C2 = <code>1100 0010</code>.");
      i1.focus();
    }
    function check() {
      const a = i1.value.trim(), b = i2.value.replace(/\s+/g, "");
      const ok1 = mode === "ascii" ? /^\d+$/.test(a) && +a === code : /^[0-9a-f]{1,2}$/i.test(a) && parseInt(a, 16) === code;
      const ok2 = /^[01]{8}$/.test(b) && parseInt(b, 2) === code;
      i1.className = "input " + (ok1 ? "ok" : "bad"); i2.className = "input " + (ok2 ? "ok" : "bad");
      if (ok1 && ok2) { streak.hit(); solved("codes", fb, "Correct! " + show(ch) + " in " + mode.toUpperCase() + " = " + answer()); }
      else { streak.miss(); wrong(fb, (ok1 ? "The code is right" : "Check the " + (mode === "ascii" ? "decimal" : "hex") + " code") + (ok2 ? " and the binary is right." : (ok1 ? " but the binary is not." : " and the 8-bit binary."))); }
    }
    root.querySelectorAll("#cmode button").forEach(b => b.onclick = () => {
      root.querySelectorAll("#cmode button").forEach(x => x.classList.toggle("active", x === b)); mode = b.dataset.m; fresh();
    });
    root.querySelector("#ccheck").onclick = check;
    [i1, i2].forEach(x => x.onkeydown = e => { if (e.key === "Enter") check(); });
    root.querySelector("#cnew").onclick = fresh;
    root.querySelector("#cshow").onclick = () => { streak.miss(); wrong(fb, "Answer: " + show(ch) + " = " + answer()); };
    mode = "ascii"; fresh();
  }

  /* ---------- Unit III: line impairments ---------- */
  function impair(root) {
    const items = [
      ["The signal gets steadily weaker as it travels along a long cable.", "Attenuation", "loss of signal strength with distance through the medium."],
      ["Different frequency components travel at different speeds, so they arrive at different times and the signal shape changes.", "Distortion", "the form of the signal is altered during transmission."],
      ["Random unwanted signals from thermal effects in electronic components mask the data.", "Noise", "any unwanted signal that interferes with the original signal."],
      ["The signal on one twisted pair induces interference in the pair next to it.", "Crosstalk", "coupling (capacitive or inductive) between adjacent cables."],
      ["Because of an impedance mismatch, part of your own transmitted signal is reflected back to you.", "Echo", "the reflection of a signal back to its source; removed by echo cancellation."],
      ["The received carrier is at a slightly different frequency because the carrier oscillators are not synchronised.", "Frequency shift", "difference between transmitted and received frequency."],
      ["A sine wave is sent but arrives looking like a square wave, with new frequency components added.", "Non-linear distortion", "the output is not a scaled copy of the input; the waveshape changes."],
      ["Small, constantly changing swings in signal amplitude, caused by power-supply hum and 20 Hz ringing tone.", "Amplitude jitter", "constant small amplitude variations."],
      ["Small, constantly changing swings in phase that can push pulses into another user's TDM time slot.", "Phase jitter", "limit ≤ 10° (20–300 Hz) and ≤ 15° (4–20 Hz)."],
      ["A sudden, very short, high-amplitude spike caused by lightning or a switching surge.", "Impulse noise", "short duration, high amplitude, isolated pulses."],
      ["A sudden increase in amplitude lasting more than 4 ms — on a call it sounds like the volume jumped up.", "Gain hit", "telco limit: no more than 8 in any 15 minutes."],
      ["The signal falls by more than 12 dB for more than 4 ms and the line briefly goes dead.", "Dropout", "telco limit: no more than 1 in any 30 minutes; causes the most errors."],
      ["A sudden phase change of more than 20° lasting more than 4 ms, often when switching between carriers.", "Phase hit", "FSK and PSK are particularly sensitive; limit 8 in any 15 minutes."]
    ];
    classify(root, "impair", items, items.map(x => x[1]),
      "Basic impairments: attenuation, distortion and noise. Others: crosstalk, echo, frequency shift, non-linear distortion and jitter. Transients: impulse noise, gain hits, dropouts and phase hits (each lasts more than 4 ms except impulse noise).");
  }

  /* ---------- Unit IV: modulation ---------- */
  function modulation(root) {
    const items = [
      ["Only the amplitude of an analog carrier is varied by an analog message; frequency and phase stay fixed.", "AM", "amplitude modulation, used by AM radio."],
      ["Only the frequency of the carrier is varied by the message; amplitude and phase stay fixed.", "FM", "frequency modulation, used by FM radio."],
      ["The phase of the carrier is varied continuously with the analog message.", "PM", "phase modulation."],
      ["A binary 1 is sent as a burst of carrier and a binary 0 as a zero level.", "ASK", "amplitude shift keying — binary data as amplitude variations."],
      ["Binary 1s and 0s are sent as two different frequencies called mark and space.", "FSK", "frequency shift keying — high frequency for 1, low for 0."],
      ["The carrier takes two phases, 0° and 180° — also called phase reversal keying, a DSB-SC scheme.", "BPSK", "binary (2-phase) PSK."],
      ["The carrier takes four phases (0°, 90°, 180°, 270°) and carries two bits (bigits) per symbol.", "QPSK", "quadrature PSK — bit pairs 00, 01, 10, 11."],
      ["The phase is reversed for a 1 and kept for a 0, relative to the previous element; no reference oscillator is needed.", "DPSK", "differential PSK, like NRZ-I “invert on 1”."],
      ["Both the amplitude and the phase of the carrier are changed so each symbol carries several bits.", "QAM", "quadrature amplitude modulation, used by modems."]
    ];
    classify(root, "modulation", items, items.map(x => x[1]),
      "Analog modulation (AM, FM, PM): carrier and message are both analog. Digital modulation (ASK, FSK, PSK, QAM): analog carrier, digital message. Ask which carrier property changes: amplitude, frequency, phase, or amplitude and phase.");
  }

  /* ---------- Unit IV: multiplexing ---------- */
  function mux(root) {
    classify(root, "mux", [
      ["Each signal gets its own non-overlapping frequency band, separated by guard bands, and all are sent at the same time.", "FDM", "frequency division multiplexing."],
      ["Many radio stations share the radio spectrum, each on a different carrier frequency.", "FDM", "the radio spectrum is the slide's example of FDM."],
      ["Telephone companies combine 12 voice channels into a group and 5 groups into a supergroup.", "FDM", "the analog FDM channel-group hierarchy."],
      ["Each input gets a fixed time slot in every frame, and the slot is sent even if the input has nothing to send.", "Synchronous TDM", "fixed round-robin slots; empty slots are wasted."],
      ["T-1 and ISDN telephone lines (slide examples).", "Synchronous TDM", "MUX and DEMUX agree on fixed time slots."],
      ["Slots are given only to stations that are active, so each slot must carry a terminal (destination) address.", "Statistical TDM", "on-demand slots, no space wasted on idle stations."],
      ["More nodes are connected than the circuit's capacity, on the premise that not all transmit at full capacity at once.", "Statistical TDM", "statistical (asynchronous) TDM."],
      ["Several laser wavelengths (lambdas) are combined onto one optical fibre.", "WDM", "wavelength division multiplexing — FDM at optical frequencies."],
      ["A diffraction grating prism combines the light signals for a long-distance link and splits them at the destination.", "WDM", "used on fibre; very high capacity."]
    ], ["FDM", "Synchronous TDM", "Statistical TDM", "WDM"],
      "<b>FDM</b> divides frequency (analog, guard bands). <b>TDM</b> divides time (digital): <b>synchronous</b> = fixed slots, <b>statistical</b> = slots on demand with addresses. <b>WDM</b> = FDM for light on fibre.");
  }

  /* ---------- Unit IV: TDM / T1 frame calculator ---------- */
  function tdm(root) {
    const streak = makeStreak();
    let p;
    root.innerHTML += '<div class="q-card"><div class="quiz-top"><div class="q-num">Synchronous TDM frame</div>' + streakBox() + '</div>' +
      '<div class="q-text" id="tq"></div>' +
      '<div class="row" style="align-items:flex-end;gap:14px">' +
      '<label style="font-size:.88rem;font-weight:600">Bits per frame<br><input class="input" id="t1" type="number" style="margin-top:4px"></label>' +
      '<label style="font-size:.88rem;font-weight:600">Line rate (kbit/s)<br><input class="input" id="t2" type="number" style="margin-top:4px"></label>' +
      '<label style="font-size:.88rem;font-weight:600">Rate of one channel (kbit/s)<br><input class="input" id="t3" type="number" style="margin-top:4px"></label></div>' +
      '<div class="row" style="margin-top:14px"><button class="btn btn-primary" id="tcheck">Check</button><button class="btn btn-outline" id="tnew">' + icon("reset", 15) + ' New problem</button></div>' +
      '<div class="feedback" id="tfb"></div></div>' +
      tip("Formulas", "Bits per frame = channels × bits per sample + framing bits. &nbsp; Line rate = bits per frame × frames per second (8000 for voice). &nbsp; One channel = bits per sample × 8000. &nbsp; T1: 24 × 8 + 1 = 193 bits; 193 × 8000 = 1544 kbit/s = 1.544 Mbit/s.");
    const fb = root.querySelector("#tfb"), ins = ["#t1", "#t2", "#t3"].map(s => root.querySelector(s));
    function fresh() {
      const t1 = Math.random() < 0.3;
      p = { n: t1 ? 24 : rnd(4, 32), b: t1 ? 8 : (Math.random() < 0.5 ? 7 : 8), f: 1, fs: 8000 };
      p.r = SimLogic.tCarrier(p.n, p.b, p.fs, p.f);
      root.querySelector("#tq").textContent = "A synchronous TDM system carries " + p.n + " voice channels. Each channel is sampled " + p.fs + " times per second with " + p.b + " bits per sample, and each frame has " + p.f + " framing bit.";
      ins.forEach(x => { x.value = ""; x.className = "input"; }); fb.textContent = ""; fb.className = "feedback";
    }
    root.querySelector("#tcheck").onclick = () => {
      const want = [p.r.frameBits, p.r.rateBps / 1000, p.b * p.fs / 1000];
      const ok = ins.map((x, i) => { const g = Math.abs(+x.value - want[i]) < 1e-9 && x.value !== ""; x.className = "input " + (g ? "ok" : "bad"); return g; });
      if (ok.every(Boolean)) {
        streak.hit();
        solved("tdm", fb, "Correct! " + p.n + " × " + p.b + " + " + p.f + " = " + want[0] + " bits; × 8000 = " + want[1] + " kbit/s" + (p.n === 24 && p.b === 8 ? " — this is the T1 carrier (1.544 Mbit/s)." : "."));
      } else { streak.miss(); wrong(fb, "Check the marked answers. Bits per frame = " + p.n + " × " + p.b + " + " + p.f + "."); }
    };
    root.querySelector("#tnew").onclick = fresh;
    fresh();
  }

  /* ---------- Registry ---------- */
  const EX = [
    { id: "modes", group: "Unit I · Data Communication", icon: "zap", title: "Transmission Mode Identifier", intro: "Read each scenario and decide whether it is simplex, half-duplex or full-duplex.", lesson: "u1-modes", run: modes },
    { id: "netscale", group: "Unit I · Data Communication", icon: "net", title: "LAN, MAN or WAN?", intro: "Classify each network by its geographic scale.", lesson: "u1-telecom", run: netscale },
    { id: "media", group: "Unit II · Transmission Media", icon: "cable", title: "Match the Transmission Medium", intro: "Match guided and unguided media with their key feature or use. A new set appears each time.", lesson: "u2-compare", run: media },
    { id: "binary", group: "Unit III · Digital Codes", icon: "binary", title: "Binary / Decimal Converter", intro: "Convert between decimal and 8-bit binary — the skill behind every character code.", lesson: "u3-codes", run: binary },
    { id: "codes", group: "Unit III · Digital Codes", icon: "code", title: "ASCII and EBCDIC Encoder", intro: "Encode a character in ASCII (decimal and binary) or EBCDIC (hex and binary).", lesson: "u3-ebcdic", run: codes },
    { id: "impair", group: "Unit III · Line Impairments", icon: "shield", title: "Name the Line Impairment", intro: "Identify the impairment or transient from its symptom.", lesson: "u3-transients", run: impair },
    { id: "modulation", group: "Unit IV · Modulation", icon: "wave", title: "Name the Modulation Technique", intro: "Identify AM, FM, PM, ASK, FSK, BPSK, QPSK, DPSK or QAM from its description.", lesson: "u4-psk", run: modulation },
    { id: "mux", group: "Unit IV · Multiplexing", icon: "layers", title: "Name the Multiplexing Technique", intro: "Decide whether each system uses FDM, synchronous TDM, statistical TDM or WDM.", lesson: "u4-mux", run: mux },
    { id: "tdm", group: "Unit IV · Multiplexing", icon: "target", title: "TDM and T1 Frame Calculator", intro: "Work out bits per frame, the line rate and the channel rate of a synchronous TDM system.", lesson: "u4-telecom-mux", run: tdm }
  ];
  const isEx = id => EX.some(e => e.id === id);

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
    const s = Progress.exercises().filter(isEx);
    const col = ["green", "blue", "violet", "amber", "red", "dark"];
    content.innerHTML = '<div class="fade-in"><h1>Practical Exercises</h1><p class="lead">Hands-on problems for Units I–IV that generate new questions every time, with instant feedback. You have solved <b>' + s.length + ' of ' + EX.length + '</b>.</p>' +
      '<div class="progress" style="margin-bottom:24px"><i style="width:' + (s.length / EX.length * 100) + '%"></i></div>' +
      '<div class="grid grid-4">' + EX.map((e, i) => '<a class="card" href="#' + e.id + '"><div class="icon ' + col[i % col.length] + '">' + icon(e.icon, 22) + '</div><span class="muted" style="font-size:.78rem">' + e.group + '</span><h3>' + e.title + '</h3><p>' + e.intro + '</p><div class="go">' + (s.indexOf(e.id) !== -1 ? "&#10003; Solved &middot; Practise again" : "Start &rarr;") + '</div></a>').join("") + '</div></div>';
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
        (EX[i + 1] ? '<a class="btn btn-primary" href="#' + EX[i + 1].id + '">Next ' + icon("arrowR", 16) + '</a>' : '<a class="btn btn-primary" href="quiz.html">Take a test ' + icon("arrowR", 16) + '</a>') + '</div>');
      document.title = ex.title + " — NetLab";
    } else { home(); document.title = "Practical Exercises — NetLab"; }
    window.scrollTo(0, 0);
    closeMobileNav();
  }
  window.addEventListener("hashchange", route);
  route();
});
