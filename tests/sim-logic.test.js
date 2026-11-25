// Run with: npm test   (or: node --test tests/sim-logic.test.js)
const test = require("node:test");
const assert = require("node:assert");
const L = require("../assets/js/sim-logic.js");

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, (msg || "") + ` expected ${b} ± ${tol}, got ${a}`);

test("Snell's law and fibre numerical aperture", () => {
  near(L.snell(1.5, 1.0, 10).critical, 41.81, 0.01, "critical angle glass->air");
  assert.strictEqual(L.snell(1.5, 1.0, 45).tir, true);
  near(L.snell(1.0, 1.5, 30).refracted, 19.47, 0.01, "air->glass refraction");
  const f = L.fibreNA(1.48, 1.46);
  near(f.NA, 0.2425, 0.0005, "NA");
  near(f.acceptance, 14.03, 0.05, "acceptance half-angle");
});

test("Orbits: GEO period ~23.93 h, Iridium LEO ~100 min", () => {
  near(L.orbit(35786).periodMin, 1436.1, 1.0);
  near(L.orbit(780).periodMin, 100.4, 0.5);
  near(L.orbit(35786).upDownMs, 238.7, 0.5, "GEO up+down delay");
});

test("Free-space path loss and radio horizon", () => {
  near(L.fspl(1, 2400), 100.04, 0.01);
  near(L.radioHorizonKm(100, 0), 35.7, 0.01);
});

test("T-carrier and E-carrier line rates", () => {
  assert.strictEqual(L.tCarrier(24, 8, 8000, 1).rateBps, 1544000);
  assert.strictEqual(L.tCarrier(24, 8, 8000, 1).frameBits, 193);
  assert.strictEqual(L.tCarrier(32, 8, 8000, 0).rateBps, 2048000);
});

test("Codes: Gray, BCD, EBCDIC (slide example 'BIT')", () => {
  assert.strictEqual(L.grayEncode(5), 7);
  assert.strictEqual(L.grayDecode(7), 5);
  for (let n = 0; n < 256; n++) assert.strictEqual(L.grayDecode(L.grayEncode(n)), n);
  assert.deepStrictEqual(L.bcd("59"), ["0101", "1001"]);
  assert.deepStrictEqual("BIT".split("").map(c => L.toBin(L.toEbcdic(c))), ["11000010", "11001001", "11100011"]);
  assert.strictEqual(L.toEbcdic("A"), 0xC1);
  assert.strictEqual(L.toEbcdic("0"), 0xF0);
  assert.strictEqual(L.toEbcdic(" "), 0x40);
  assert.strictEqual(L.fromEbcdic(0xE9), "Z");
  assert.deepStrictEqual(L.utf8Bytes("₹"), [0xE2, 0x82, 0xB9]);
});

test("Error detection: CRC mod-2, CRC-32, Internet checksum", () => {
  assert.strictEqual(L.crcMod2("100100", "1101").remainder, "001");
  assert.ok(L.crcCheck("100100001", "1101"));
  assert.ok(!L.crcCheck("100110001", "1101"));
  assert.strictEqual(L.crc32(Array.from(Buffer.from("123456789"))).toString(16), "cbf43926");
  const hdr = [0x45, 0x00, 0x00, 0x73, 0x00, 0x00, 0x40, 0x00, 0x40, 0x11, 0x00, 0x00, 0xc0, 0xa8, 0x00, 0x01, 0xc0, 0xa8, 0x00, 0xc7];
  assert.strictEqual(L.internetChecksum(hdr).toString(16), "b861");
  assert.strictEqual(L.parityBit("1011001", true), 0);
  assert.strictEqual(L.parityBit("1011001", false), 1);
});

test("Packet builder produces valid IPv4 and TCP/UDP checksums", () => {
  for (const proto of ["TCP", "UDP"]) {
    const p = L.buildPacket({ proto, srcMac: "3C:52:82:1A:2B:3C", dstMac: "00:1F:9E:AA:01:FE", srcIp: "192.168.1.10", dstIp: "93.184.216.34", srcPort: 49152, dstPort: 80, seq: 1001, ack: 5001, payload: "GET / HTTP/1.1" });
    assert.ok(L.verifyIpHeader(p.ip), proto + " IP header checksum");
    const len = p.l4.length;
    const pseudo = [192, 168, 1, 10, 93, 184, 216, 34, 0, proto === "UDP" ? 17 : 6, len >> 8, len & 255];
    assert.strictEqual(L.internetChecksum(pseudo.concat(p.l4)), 0, proto + " L4 checksum verifies");
    assert.ok(p.frame.length >= 64, "minimum Ethernet frame size");
    const body = p.frame.slice(0, -4), fcs = p.frame.slice(-4);
    const c = L.crc32(body);
    assert.deepStrictEqual(fcs, [c & 255, (c >>> 8) & 255, (c >>> 16) & 255, (c >>> 24) & 255]);
  }
});

test("Modulation statistics", () => {
  near(L.amStats(1, 5000, 100).efficiency, 1 / 3, 1e-9, "AM efficiency at m=1");
  assert.strictEqual(L.amStats(0.5, 5000, 100).bandwidth, 10000);
  assert.strictEqual(L.amStats(1.2, 5000, 100).overmodulated, true);
  assert.strictEqual(L.fmStats(75000, 15000).carsonBW, 180000);
  assert.strictEqual(L.fmStats(75000, 15000).beta, 5);
  // QPSK: no errors at very high SNR, Gray-coded neighbours differ by one bit
  const r = L.simulateConstellation("QPSK", "0110110001", 40, 1);
  assert.strictEqual(r.bitErrors, 0);
  const pts = L.SCHEMES["16QAM"].points;
  assert.strictEqual(Object.keys(pts).length, 16);
  const e = Object.values(pts).reduce((s, p) => s + p[0] ** 2 + p[1] ** 2, 0) / 16;
  near(e, 1, 1e-9, "16-QAM normalised energy");
});

test("Multiplexing", () => {
  assert.strictEqual(L.fdmBandwidth(3, 4000, 500), 13000);
  const sync = L.tdm([["A1"], ["B1", "B2"], [], ["D1", "D2"], ["E2"]], "sync");
  assert.strictEqual(sync.slots, 10);
  assert.strictEqual(sync.used, 6);
  near(L.wdm({ bandNm: 35, spacingGHz: 100, rateGbps: 10, centreNm: 1547.5 }).channels, 43, 1);
});

test("Transmission lines and reflections", () => {
  const m = L.microstripZ0(0.3, 0.16, 0.035, 4.4);
  assert.ok(m.z0 > 45 && m.z0 < 60, "FR-4 microstrip ~50 ohm, got " + m.z0);
  near(L.reflection(75, 50).gamma, 0.2, 1e-9);
  near(L.reflection(75, 50).returnLossDb, 13.98, 0.01);
  assert.strictEqual(L.reflection(50, 50).returnLossDb, Infinity);
});

test("Subnetting", () => {
  const s = L.subnet("192.168.1.130", 26);
  assert.strictEqual(s.net, "192.168.1.128");
  assert.strictEqual(s.bc, "192.168.1.191");
  assert.strictEqual(s.hosts, 62);
  assert.strictEqual(s.mask, "255.255.255.192");
});

test("Jitter estimator", () => {
  const send = [0, 20, 40, 60], arrive = [50, 70, 90, 110];
  assert.strictEqual(L.jitterStats(send, arrive).rfc3550, 0);
  assert.ok(L.jitterStats(send, [50, 75, 88, 120]).rfc3550 > 0);
});

test("Serial vs parallel skew", () => {
  const r = L.serialParallel({ bits: 8, lines: 8, clockHz: 1e6, distM: 1, skewPsPerM: 50 });
  assert.strictEqual(r.parallelTime, 1e-6);
  assert.strictEqual(r.serialTime, 8e-6);
  assert.ok(r.parallelOk);
  assert.ok(!L.serialParallel({ bits: 8, lines: 8, clockHz: 1e9, distM: 20, skewPsPerM: 50 }).parallelOk);
});
