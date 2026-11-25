/* =========================================================
   SimLogic - pure, testable calculation functions used by the
   visualizations and simulations. No DOM access in this file.
   Units are stated per function. "Typical" values are labelled
   as such in the UI.
   ========================================================= */
(function (root) {
  "use strict";
  const C_LIGHT = 299792458; // m/s
  const TAU = Math.PI * 2;
  const deg = r => r * 180 / Math.PI, rad = d => d * Math.PI / 180;
  const log10 = Math.log10 || (x => Math.log(x) / Math.LN10);

  /* ---------- Random (seeded, so simulations are repeatable) ---------- */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(r) { const u = Math.max(1e-12, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); }

  /* ---------- Basic signal shapes (x in 0..1 across a plot) ---------- */
  const sig = {
    sine: (x, cycles, phase) => Math.sin(TAU * cycles * x + (phase || 0)),
    bit: (bits, x) => { const i = Math.min(bits.length - 1, Math.floor(x * bits.length)); return bits[i] === "1" ? 1 : 0; },
    nrz: (bits, x) => sig.bit(bits, x) ? 0.85 : -0.85,
    unipolar: (bits, x) => sig.bit(bits, x) ? 0.85 : 0
  };

  /* ---------- Digital modulation ---------- */
  // Constellations use Gray coding. Points are normalised to unit average energy.
  const SCHEMES = {
    ASK: { bitsPerSymbol: 1, points: { "0": [0, 0], "1": [1, 0] } },
    BPSK: { bitsPerSymbol: 1, points: { "0": [-1, 0], "1": [1, 0] } },
    QPSK: { bitsPerSymbol: 2, points: { "00": [1, 1], "01": [-1, 1], "11": [-1, -1], "10": [1, -1] } },
    "8PSK": { bitsPerSymbol: 3, points: {} },
    "16QAM": { bitsPerSymbol: 4, points: {} },
    FSK: { bitsPerSymbol: 1, points: { "0": [0, 0], "1": [0, 0] } }
  };
  (function buildConstellations() {
    const gray3 = ["000", "001", "011", "010", "110", "111", "101", "100"];
    gray3.forEach((g, k) => { const a = TAU * k / 8 + Math.PI / 8; SCHEMES["8PSK"].points[g] = [Math.cos(a), Math.sin(a)]; });
    const lv = { "00": -3, "01": -1, "11": 1, "10": 3 };
    Object.keys(lv).forEach(i => Object.keys(lv).forEach(q => { SCHEMES["16QAM"].points[i + q] = [lv[i], lv[q]]; }));
    ["QPSK", "16QAM"].forEach(name => {
      const pts = SCHEMES[name].points, keys = Object.keys(pts);
      const e = keys.reduce((s, k) => s + pts[k][0] ** 2 + pts[k][1] ** 2, 0) / keys.length;
      keys.forEach(k => { pts[k] = [pts[k][0] / Math.sqrt(e), pts[k][1] / Math.sqrt(e)]; });
    });
  })();

  function toSymbols(bits, scheme) {
    const k = SCHEMES[scheme].bitsPerSymbol, out = [];
    let b = bits.replace(/[^01]/g, "");
    while (b.length % k) b += "0";
    for (let i = 0; i < b.length; i += k) out.push(b.substr(i, k));
    return out;
  }

  // Waveform sample for symbol stream; x in 0..1 over the whole stream.
  function modWave(scheme, symbols, x, cyclesPerSymbol) {
    const n = symbols.length, idx = Math.min(n - 1, Math.floor(x * n)), local = x * n;
    const sym = symbols[idx], cps = cyclesPerSymbol || 2;
    if (scheme === "FSK") return Math.sin(TAU * (sym === "1" ? cps * 2 : cps) * local);
    if (scheme === "ASK") return sym === "1" ? Math.sin(TAU * cps * local) : 0.08 * Math.sin(TAU * cps * local);
    const p = SCHEMES[scheme].points[sym];
    const amp = Math.hypot(p[0], p[1]), ph = Math.atan2(p[1], p[0]);
    const norm = scheme === "16QAM" ? 1 / 1.342 : 1;
    return amp * norm * Math.cos(TAU * cps * local - ph);
  }

  // Simulate transmission over an AWGN channel; returns received points and decisions.
  function simulateConstellation(scheme, bits, snrDb, seed) {
    const r = rng(seed || 7);
    const symbols = toSymbols(bits, scheme);
    const pts = SCHEMES[scheme].points, keys = Object.keys(pts);
    const sigma = Math.sqrt(1 / (2 * Math.pow(10, snrDb / 10)));
    let bitErrors = 0, symErrors = 0;
    const rx = symbols.map(s => {
      const p = pts[s];
      const y = [p[0] + sigma * gauss(r), p[1] + sigma * gauss(r)];
      let best = keys[0], bd = Infinity;
      keys.forEach(k => { const d = (pts[k][0] - y[0]) ** 2 + (pts[k][1] - y[1]) ** 2; if (d < bd) { bd = d; best = k; } });
      if (best !== s) symErrors++;
      for (let i = 0; i < s.length; i++) if (best[i] !== s[i]) bitErrors++;
      return { sent: s, point: y, decided: best };
    });
    const totalBits = symbols.length * SCHEMES[scheme].bitsPerSymbol;
    return { symbols, rx, bitErrors, symErrors, totalBits, ber: totalBits ? bitErrors / totalBits : 0 };
  }

  /* ---------- Analog modulation (AM / FM / PM) ---------- */
  function analogMod(type, t, o) {
    // o: {fc, fm, m (AM index), beta (FM index), kp (PM deviation rad), A}
    const A = o.A || 1, msg = Math.cos(TAU * o.fm * t);
    if (type === "AM") return A * (1 + o.m * msg) * Math.cos(TAU * o.fc * t);
    if (type === "FM") return A * Math.cos(TAU * o.fc * t + o.beta * Math.sin(TAU * o.fm * t));
    if (type === "PM") return A * Math.cos(TAU * o.fc * t + o.kp * msg);
    return A * Math.cos(TAU * o.fc * t);
  }
  function amStats(m, fm, Pc) {
    return { bandwidth: 2 * fm, totalPower: Pc * (1 + m * m / 2), efficiency: m * m / (2 + m * m), overmodulated: m > 1 };
  }
  function fmStats(deltaF, fm) { return { beta: deltaF / fm, carsonBW: 2 * (deltaF + fm) }; }

  /* ---------- Optical fibre ---------- */
  function snell(n1, n2, thetaDeg) {
    const s = n1 * Math.sin(rad(thetaDeg)) / n2;
    const critical = n1 > n2 ? deg(Math.asin(n2 / n1)) : null;
    if (s > 1) return { tir: true, refracted: null, critical };
    return { tir: false, refracted: deg(Math.asin(s)), critical };
  }
  function fibreNA(nCore, nClad, n0) {
    const na = Math.sqrt(Math.max(0, nCore * nCore - nClad * nClad));
    const acc = na / (n0 || 1) <= 1 ? deg(Math.asin(na / (n0 || 1))) : 90;
    return { NA: na, acceptance: acc, critical: deg(Math.asin(nClad / nCore)) };
  }

  /* ---------- Wireless ---------- */
  function fspl(distKm, freqMHz) { return 20 * log10(distKm) + 20 * log10(freqMHz) + 32.44; }
  function radioHorizonKm(h1m, h2m) { return 3.57 * (Math.sqrt(h1m) + Math.sqrt(h2m)); } // geometric line of sight
  function wavelength(freqHz) { return C_LIGHT / freqHz; }

  /* ---------- Satellites ---------- */
  const EARTH_R = 6371, MU = 398600.4418; // km, km^3/s^2
  function orbit(altKm) {
    const a = EARTH_R + altKm;
    const period = TAU * Math.sqrt(a * a * a / MU); // seconds
    const oneWayMs = altKm * 1000 / C_LIGHT * 1000; // straight up (minimum)
    const coverageDeg = 2 * deg(Math.acos(EARTH_R / a)); // horizon-to-horizon, 0 deg elevation
    return { period, periodMin: period / 60, upDownMs: 2 * oneWayMs, rttMs: 4 * oneWayMs, coverageDeg };
  }

  /* ---------- Transmission lines (IPC-2141 approximations) ---------- */
  function microstripZ0(w, h, t, er) {
    const z0 = 87 / Math.sqrt(er + 1.41) * Math.log(5.98 * h / (0.8 * w + t));
    const eeff = (er + 1) / 2 + (er - 1) / 2 / Math.sqrt(1 + 12 * h / w);
    return { z0, eeff, velocity: C_LIGHT / Math.sqrt(eeff), valid: w / h > 0.1 && w / h < 2 && er < 15 };
  }
  function striplineZ0(w, b, t, er) {
    const z0 = 60 / Math.sqrt(er) * Math.log(4 * b / (0.67 * Math.PI * (0.8 * w + t)));
    return { z0, eeff: er, velocity: C_LIGHT / Math.sqrt(er), valid: w / b < 0.35 && t / b < 0.25 };
  }
  function reflection(zl, z0) {
    const g = (zl - z0) / (zl + z0);
    return { gamma: g, returnLossDb: Math.abs(g) < 1e-9 ? Infinity : -20 * log10(Math.abs(g)), reflectedPct: g * g * 100 };
  }

  /* ---------- Media attenuation (typical values) ---------- */
  const MEDIA = {
    utp: { name: "UTP Cat 6 (100 MHz)", dbPerKm: 198, velocity: 0.65 * C_LIGHT, maxRun: "100 m", bw: "Up to 1-10 Gbit/s", emi: "Low" },
    stp: { name: "STP Cat 6A (100 MHz)", dbPerKm: 190, velocity: 0.68 * C_LIGHT, maxRun: "100 m", bw: "Up to 10 Gbit/s", emi: "Medium" },
    coax: { name: "Coax RG-6 (1 GHz)", dbPerKm: 210, velocity: 0.85 * C_LIGHT, maxRun: "~500 m (baseband)", bw: "~1 GHz of spectrum", emi: "Good" },
    mmf: { name: "Multi-mode fibre (850 nm)", dbPerKm: 3.0, velocity: C_LIGHT / 1.48, maxRun: "~0.3-2 km", bw: "10-100 Gbit/s", emi: "Immune" },
    smf: { name: "Single-mode fibre (1550 nm)", dbPerKm: 0.2, velocity: C_LIGHT / 1.468, maxRun: "~80 km between amplifiers", bw: "Tbit/s with WDM", emi: "Immune" }
  };
  function mediaLoss(key, distM) { const m = MEDIA[key]; return { lossDb: m.dbPerKm * distM / 1000, delayUs: distM / m.velocity * 1e6 }; }
  function dbToRatio(db) { return Math.pow(10, -db / 10); }

  /* ---------- Delay / network performance ---------- */
  function linkDelays(o) {
    // o: {bytes, rateBps, distM, velocity, lossPct, hops}
    const bits = o.bytes * 8;
    const tx = bits / o.rateBps, prop = o.distM / o.velocity;
    const perHop = tx + prop / (o.hops || 1);
    const total = tx + prop + (o.hops > 1 ? (o.hops - 1) * tx : 0);
    const goodput = o.rateBps * (1 - (o.lossPct || 0) / 100);
    return { txMs: tx * 1000, propMs: prop * 1000, totalMs: total * 1000, perHopMs: perHop * 1000, goodputBps: goodput };
  }
  function transferTime(bytes, rateBps, latencyMs) { return bytes * 8 / rateBps + latencyMs / 1000; }
  function classifyNetwork(distM) {
    if (distM <= 10) return "PAN";
    if (distM <= 1000) return "LAN";
    if (distM <= 50000) return "MAN";
    return "WAN";
  }

  /* ---------- Serial vs parallel ---------- */
  function serialParallel(o) {
    // o: {bits, lines, clockHz, distM, skewPsPerM}
    const serialTime = o.bits / o.clockHz;
    const parallelTime = Math.ceil(o.bits / o.lines) / o.clockHz;
    const bitPeriodPs = 1e12 / o.clockHz;
    const skewPs = o.skewPsPerM * o.distM;
    return { serialTime, parallelTime, bitPeriodPs, skewPs, skewRatio: skewPs / bitPeriodPs, parallelOk: skewPs < bitPeriodPs / 2 };
  }

  /* ---------- Multiplexing ---------- */
  function fdmBandwidth(n, chBw, guard) { return n * chBw + Math.max(0, n - 1) * guard; }
  function tdm(inputs, mode) {
    // inputs: array of arrays of data units per source, e.g. [["A1"],["B1","B2"],[],["D1","D2"],["E2"]]
    const frames = [];
    if (mode === "sync") {
      const rounds = Math.max.apply(null, inputs.map(q => q.length));
      for (let r = 0; r < rounds; r++) frames.push(inputs.map((q, i) => ({ src: i, data: q[r] || null })));
      const slots = rounds * inputs.length, used = inputs.reduce((s, q) => s + q.filter(x => x != null).length, 0);
      return { frames, slots, used, efficiency: slots ? used / slots : 0 };
    }
    const queue = [];
    const rounds = Math.max.apply(null, inputs.map(q => q.length));
    for (let r = 0; r < rounds; r++) inputs.forEach((q, i) => { if (q[r] != null) queue.push({ src: i, data: q[r] }); });
    const per = Math.max(1, Math.ceil(inputs.length / 2));
    for (let k = 0; k < queue.length; k += per) frames.push(queue.slice(k, k + per));
    return { frames, slots: queue.length, used: queue.length, efficiency: queue.length ? 1 : 0, perFrame: per };
  }
  function tCarrier(channels, bitsPerSample, sampleRate, framingBits) {
    const frameBits = channels * bitsPerSample + framingBits;
    return { frameBits, rateBps: frameBits * sampleRate, payloadBps: channels * bitsPerSample * sampleRate, overheadBps: framingBits * sampleRate };
  }
  const FDM_HIERARCHY = [
    { name: "Voice channel", channels: 1, bandwidth: "4 kHz", detail: "300-3400 Hz speech plus guard space" },
    { name: "Group", channels: 12, bandwidth: "48 kHz", detail: "12 channels, 60-108 kHz" },
    { name: "Supergroup", channels: 60, bandwidth: "240 kHz", detail: "5 groups, 312-552 kHz" },
    { name: "Mastergroup", channels: 600, bandwidth: "2.52 MHz", detail: "10 supergroups (AT&T L-carrier: 564-3084 kHz)" },
    { name: "Jumbogroup", channels: 3600, bandwidth: "16.98 MHz", detail: "6 mastergroups" }
  ];
  function wdm(o) {
    // o: {bandNm, spacingGHz, rateGbps, centreNm}
    const c = C_LIGHT, l1 = (o.centreNm - o.bandNm / 2) * 1e-9, l2 = (o.centreNm + o.bandNm / 2) * 1e-9;
    const bandGHz = (c / l1 - c / l2) / 1e9;
    const channels = Math.max(1, Math.floor(bandGHz / o.spacingGHz));
    return { bandGHz, channels, capacityGbps: channels * o.rateGbps };
  }
  function linkBudget(o) {
    // o: {txDbm, dbPerKm, km, connectors, splices, sensitivityDbm, ampGainDb}
    const loss = o.dbPerKm * o.km + 0.5 * o.connectors + 0.1 * o.splices;
    const rx = o.txDbm - loss + (o.ampGainDb || 0);
    return { lossDb: loss, rxDbm: rx, marginDb: rx - o.sensitivityDbm, ok: rx - o.sensitivityDbm >= 3 };
  }

  /* ---------- Codes ---------- */
  function toBin(n, width) { return (n >>> 0).toString(2).padStart(width || 8, "0"); }
  function bcd(numStr) { return String(numStr).replace(/\D/g, "").split("").map(d => toBin(+d, 4)); }
  function grayEncode(n) { return n ^ (n >> 1); }
  function grayDecode(g) { let n = g; while (g >>= 1) n ^= g; return n; }
  function utf8Bytes(str) {
    if (typeof TextEncoder !== "undefined") return Array.from(new TextEncoder().encode(str));
    return Array.from(unescape(encodeURIComponent(str))).map(c => c.charCodeAt(0));
  }
  // EBCDIC code page 037 for printable characters.
  const EBCDIC = (function () {
    const m = { " ": 0x40, ".": 0x4B, "<": 0x4C, "(": 0x4D, "+": 0x4E, "|": 0x4F, "&": 0x50, "!": 0x5A, "$": 0x5B, "*": 0x5C, ")": 0x5D, ";": 0x5E, "-": 0x60, "/": 0x61, ",": 0x6B, "%": 0x6C, "_": 0x6D, ">": 0x6E, "?": 0x6F, "`": 0x79, ":": 0x7A, "#": 0x7B, "@": 0x7C, "'": 0x7D, "=": 0x7E, '"': 0x7F, "~": 0xA1, "^": 0xB0, "[": 0xBA, "]": 0xBB, "{": 0xC0, "}": 0xD0, "\\": 0xE0 };
    const runs = [["ABCDEFGHI", 0xC1], ["JKLMNOPQR", 0xD1], ["STUVWXYZ", 0xE2], ["abcdefghi", 0x81], ["jklmnopqr", 0x91], ["stuvwxyz", 0xA2], ["0123456789", 0xF0]];
    runs.forEach(([chars, start]) => chars.split("").forEach((ch, i) => { m[ch] = start + i; }));
    const rev = {}; Object.keys(m).forEach(k => { rev[m[k]] = k; });
    return { enc: m, dec: rev };
  })();
  function toEbcdic(ch) { return EBCDIC.enc.hasOwnProperty(ch) ? EBCDIC.enc[ch] : null; }
  function fromEbcdic(code) { return EBCDIC.dec.hasOwnProperty(code) ? EBCDIC.dec[code] : null; }
  function asciiChar(code) { return code >= 32 && code < 127 ? String.fromCharCode(code) : null; }
  const ASCII_CONTROL = ["NUL", "SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "BEL", "BS", "HT", "LF", "VT", "FF", "CR", "SO", "SI", "DLE", "DC1", "DC2", "DC3", "DC4", "NAK", "SYN", "ETB", "CAN", "EM", "SUB", "ESC", "FS", "GS", "RS", "US"];

  /* ---------- Error detection ---------- */
  function parityBit(bits, even) { const ones = bits.split("").filter(b => b === "1").length; return even ? ones % 2 : (ones + 1) % 2; }
  function crcMod2(data, gen) {
    const g = gen.split("").map(Number), steps = [];
    const a = (data + "0".repeat(g.length - 1)).split("").map(Number);
    for (let i = 0; i <= a.length - g.length; i++) {
      if (a[i]) { steps.push({ at: i, before: a.slice(i, i + g.length).join("") }); for (let j = 0; j < g.length; j++) a[i + j] ^= g[j]; }
    }
    return { remainder: a.slice(-(g.length - 1)).join(""), steps };
  }
  function crcCheck(codeword, gen) {
    const g = gen.split("").map(Number), a = codeword.split("").map(Number);
    for (let i = 0; i <= a.length - g.length; i++) if (a[i]) for (let j = 0; j < g.length; j++) a[i + j] ^= g[j];
    return a.slice(-(g.length - 1)).every(b => b === 0);
  }
  function internetChecksum(bytes) {
    let sum = 0;
    for (let i = 0; i < bytes.length; i += 2) { sum += (bytes[i] << 8) + (i + 1 < bytes.length ? bytes[i + 1] : 0); sum = (sum & 0xffff) + (sum >>> 16); }
    return (~sum) & 0xffff;
  }
  const CRC32_TABLE = (function () { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(bytes) { let c = 0xFFFFFFFF; for (let i = 0; i < bytes.length; i++) c = CRC32_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }

  /* ---------- Packet building (IPv4 + TCP/UDP + Ethernet II) ---------- */
  function ipBytes(ip) { return ip.split(".").map(Number); }
  function macBytes(mac) { return mac.split(/[:-]/).map(h => parseInt(h, 16)); }
  function buildPacket(o) {
    // o: {proto:'TCP'|'UDP', srcMac,dstMac, srcIp,dstIp, srcPort,dstPort, seq, ack, flags, ttl, id, payload}
    const payload = utf8Bytes(o.payload || "");
    let l4;
    const pseudo = (len, protoNum) => ipBytes(o.srcIp).concat(ipBytes(o.dstIp), [0, protoNum, len >> 8, len & 255]);
    if (o.proto === "UDP") {
      const len = 8 + payload.length;
      l4 = [o.srcPort >> 8, o.srcPort & 255, o.dstPort >> 8, o.dstPort & 255, len >> 8, len & 255, 0, 0].concat(payload);
      let ck = internetChecksum(pseudo(len, 17).concat(l4)); if (ck === 0) ck = 0xffff;
      l4[6] = ck >> 8; l4[7] = ck & 255;
    } else {
      const flags = o.flags || 0x18, len = 20 + payload.length;
      const u32 = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
      l4 = [o.srcPort >> 8, o.srcPort & 255, o.dstPort >> 8, o.dstPort & 255].concat(u32(o.seq >>> 0), u32(o.ack >>> 0), [0x50, flags, 0xFA, 0xF0, 0, 0, 0, 0]).concat(payload);
      const ck = internetChecksum(pseudo(len, 6).concat(l4));
      l4[16] = ck >> 8; l4[17] = ck & 255;
    }
    const total = 20 + l4.length, id = o.id || 0x1c46, ttl = o.ttl || 64;
    const ip = [0x45, 0, total >> 8, total & 255, id >> 8, id & 255, 0x40, 0, ttl, o.proto === "UDP" ? 17 : 6, 0, 0].concat(ipBytes(o.srcIp), ipBytes(o.dstIp));
    const ipck = internetChecksum(ip); ip[10] = ipck >> 8; ip[11] = ipck & 255;
    const eth = macBytes(o.dstMac).concat(macBytes(o.srcMac), [0x08, 0x00]);
    let frame = eth.concat(ip, l4);
    const pad = Math.max(0, 60 - frame.length);
    frame = frame.concat(new Array(pad).fill(0));
    const fcs = crc32(frame);
    return { eth, ip, l4, payload, pad, fcs, frame: frame.concat([fcs & 255, (fcs >>> 8) & 255, (fcs >>> 16) & 255, (fcs >>> 24) & 255]), ipChecksum: ipck, l4Checksum: (l4[o.proto === "UDP" ? 6 : 16] << 8) | l4[o.proto === "UDP" ? 7 : 17] };
  }
  function verifyIpHeader(ip) { return internetChecksum(ip) === 0; }

  /* ---------- Subnetting ---------- */
  const ipToInt = s => s.split(".").reduce((a, o) => a * 256 + (+o), 0);
  const intToIp = n => [24, 16, 8, 0].map(s => Math.floor(n / Math.pow(2, s)) % 256).join(".");
  function subnet(ip, p) {
    const n = ipToInt(ip), size = Math.pow(2, 32 - p);
    const net = Math.floor(n / size) * size, bc = net + size - 1;
    return { net: intToIp(net), bc: intToIp(bc), first: p >= 31 ? intToIp(net) : intToIp(net + 1), last: p >= 31 ? intToIp(bc) : intToIp(bc - 1), hosts: p >= 31 ? (p === 31 ? 2 : 1) : size - 2, mask: intToIp(Math.pow(2, 32) - size), size };
  }
  function validIp(s) { return /^(\d{1,3}\.){3}\d{1,3}$/.test(s) && s.split(".").every(o => +o <= 255); }

  /* ---------- Jitter (RFC 3550 interarrival estimator) ---------- */
  function jitterStats(sendTimes, arriveTimes) {
    let J = 0; const transit = arriveTimes.map((a, i) => a - sendTimes[i]);
    for (let i = 1; i < transit.length; i++) { const D = Math.abs(transit[i] - transit[i - 1]); J += (D - J) / 16; }
    const mean = transit.reduce((s, x) => s + x, 0) / transit.length;
    const sd = Math.sqrt(transit.reduce((s, x) => s + (x - mean) ** 2, 0) / transit.length);
    return { meanLatency: mean, stdDev: sd, rfc3550: J, min: Math.min.apply(null, transit), max: Math.max.apply(null, transit) };
  }

  /* ---------- Crosstalk & twisted pair (simplified, labelled in UI) ---------- */
  function crosstalk(o) {
    // o: {freqMHz, lengthM, separationMm, twistsPerM, shielded}
    const coupling = 0.02 * o.freqMHz * o.lengthM / Math.max(1, o.separationMm);
    const twistFactor = 1 / (1 + o.twistsPerM / 8);
    const shield = o.shielded ? 0.1 : 1;
    const next = Math.min(1, coupling * twistFactor * shield);
    const fext = next * Math.exp(-0.002 * o.freqMHz * o.lengthM / 10);
    const toDb = v => v <= 0 ? -120 : 20 * log10(v);
    return { next, fext, nextDb: toDb(next), fextDb: toDb(fext) };
  }
  function twistedPairNoise(o) {
    // Differential receiver output for noise induced on two wires.
    // o: {noise, twistsPerM, shielded}; returns residual fraction of the noise.
    const imbalance = 1 / (1 + o.twistsPerM / 4);
    const shield = o.shielded ? 0.15 : 1;
    const perWire = o.noise * shield;
    return { perWire, residual: perWire * imbalance * 0.5, snrDb: 20 * log10(1 / Math.max(1e-6, perWire * imbalance * 0.5)) };
  }

  /* ---------- Bit errors from a noisy level decision ---------- */
  function decideBits(bits, noiseSigma, seed, attenuation) {
    const r = rng(seed || 3), atten = attenuation === undefined ? 1 : attenuation;
    let errors = 0;
    const out = bits.split("").map(b => {
      const level = (b === "1" ? 1 : -1) * atten + noiseSigma * gauss(r);
      const d = level >= 0 ? "1" : "0";
      if (d !== b) errors++;
      return d;
    }).join("");
    return { out, errors };
  }

  const api = {
    C_LIGHT, rng, gauss, sig, SCHEMES, toSymbols, modWave, simulateConstellation, analogMod, amStats, fmStats,
    snell, fibreNA, fspl, radioHorizonKm, wavelength, orbit, EARTH_R, microstripZ0, striplineZ0, reflection,
    MEDIA, mediaLoss, dbToRatio, linkDelays, transferTime, classifyNetwork, serialParallel, fdmBandwidth, tdm, tCarrier,
    FDM_HIERARCHY, wdm, linkBudget, toBin, bcd, grayEncode, grayDecode, utf8Bytes, EBCDIC, toEbcdic, fromEbcdic, asciiChar,
    ASCII_CONTROL, parityBit, crcMod2, crcCheck, internetChecksum, crc32, buildPacket, verifyIpHeader, subnet, validIp,
    ipToInt, intToIp, jitterStats, crosstalk, twistedPairNoise, decideBits, log10
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.SimLogic = api;
})(typeof window !== "undefined" ? window : globalThis);
