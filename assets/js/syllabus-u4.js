/* Unit IV - Modulation and Multiplexing (college syllabus, Unit 4 slides). */
window.TOPICS = window.TOPICS || [];
window.QUIZ = window.QUIZ || [];
(function () {
  const T = [

{
  id: "u4-modulation", unit: "u4", title: "Introduction to Modulation", minutes: 9,
  summary: "What modulation and demodulation are, analog vs digital modulation, why we modulate (antenna size, multiplexing, range), advantages, disadvantages and examples.",
  source: "Unit IV slides 5–7, 11–12, 24–26",
  intro: "<p>Your voice cannot travel from a radio station to your FM radio on its own. It has to ride on a high-frequency <b>carrier wave</b>. Putting information onto a carrier is <b>modulation</b>; taking it off again is <b>demodulation</b>.</p>",
  definition: "Modulation is the process of altering a characteristic of a carrier signal — its amplitude, frequency or phase — to encode digital or analog information for transmission. Demodulation is the process of extracting the data from the transmitted signal.",
  why: "<p>Modulation enables efficient and reliable transfer of data over wired and wireless channels. It makes antennas practical, lets many signals share one medium, and extends range.</p>",
  how: "<h3>Two main types</h3><ul class='points'><li><b>Analog modulation</b> — both the carrier and the message are analog waves (AM, FM, PM).</li><li><b>Digital modulation</b> — the carrier is analog and the message is digital (ASK, FSK, PSK, QAM).</li></ul>" +
    "<ul class='points'><li><b>Analog signals</b> can take an infinite number of values between two points.</li><li><b>Digital signals</b> take only binary values: logic 0 (zero volts) or logic 1 (another voltage), with no in-between levels.</li></ul>" +
    "<h3>Digital modulation techniques</h3><p>Digital modulation provides more information capacity, higher data security, quicker system availability and high-quality communication, so it is in greater demand than analog modulation. The three main types are <b>Amplitude Shift Keying</b>, <b>Frequency Shift Keying</b> and <b>Phase Shift Keying</b>.</p>" +
    "<h3>Advantages of modulation</h3><ul class='points'><li>Reduces the size of the antenna</li><li>Reduces the cost of wires</li><li>Prevents the mixing of signals</li><li>Increases the range of communication</li><li>Improves reception quality</li><li>Makes multiplexing of signals easy</li><li>Allows adjustment of the bandwidth</li></ul>" +
    "<h3>Disadvantages</h3><ul class='points'><li>Higher equipment cost</li><li>Complicated transmitter and receiver</li><li>For good FM communication, antennas must be kept close</li><li>Not efficient for large bandwidth</li><li>Power wastage</li></ul>" +
    "<h3>Examples</h3><ul class='points'><li><b>AM radio</b> — amplitude modulation for audio</li><li><b>FM radio</b> — frequency modulation for audio</li><li><b>Satellite communication</b> — often phase modulation</li><li><b>Wireless communication</b> — ASK, FSK and PSK</li><li><b>Modems</b> — modulation and demodulation between digital data and analog channels</li></ul>",
  deep: "<p><b>Why modulation shrinks antennas.</b> An efficient antenna is about a quarter of a wavelength long:</p>" +
    "<div class='codebox'>Wavelength λ = c / f          Quarter-wave antenna = λ / 4\n\n3 kHz voice sent directly:   λ = 3×10⁸ / 3×10³ = 100 km   → antenna ≈ 25 km  (impossible)\nOn a 1 MHz AM carrier:       λ = 300 m                    → antenna ≈ 75 m\nOn a 100 MHz FM carrier:     λ = 3 m                      → antenna ≈ 75 cm\nOn a 2.4 GHz Wi-Fi carrier:  λ = 12.5 cm                  → antenna ≈ 3 cm</div>" +
    "<p><b>Frequency translation enables multiplexing.</b> Every voice occupies the same 0–4 kHz band, so sent directly they would mix. Modulating each one onto a different carrier frequency moves each signal to its own slot, which is exactly what FDM does.</p>" +
    "<p><b>The carrier</b> is c(t) = A·cos(2πf<sub>c</sub>t + φ). Modulation varies <b>A</b> (AM, ASK), <b>f<sub>c</sub></b> (FM, FSK) or <b>φ</b> (PM, PSK), or A and φ together (QAM).</p>",
  syllabusNote: "Slide 5 says modulation “increases strength for maximum reach of the signals”. Strictly, <b>amplifiers</b> increase strength; modulation moves the information onto a carrier at a frequency that radiates and propagates well, which is what extends the range.",
  examples: ["AM broadcast (MW) and FM broadcast (88–108 MHz)", "Satellite TV and GPS (phase-based schemes)", "Wi-Fi and 4G/5G (QAM, PSK)", "Dial-up and DSL modems"],
  terms: [["Carrier", "High-frequency sine wave that carries the information."], ["Message (baseband) signal", "The original information signal."], ["Modulation index", "How strongly the message varies the carrier."], ["Demodulation", "Recovering the message from the modulated carrier."]],
  exam: ["Modulation: altering the carrier's amplitude, frequency or phase to encode information.", "Demodulation: extracting data from the transmitted signal.", "Analog modulation: carrier and message both analog; digital modulation: carrier analog, message digital.", "Digital modulation types: ASK, FSK, PSK.", "Advantages: smaller antenna, cheaper wires, no mixing, longer range, better reception, easy multiplexing, adjustable bandwidth.", "Disadvantages: costly equipment, complex Tx/Rx, FM antennas close, inefficient for large bandwidth, power wastage."],
  recap: "Modulate = put information on a carrier by varying amplitude, frequency or phase. It gives small antennas, multiplexing and range. Analog: AM/FM/PM. Digital: ASK/FSK/PSK/QAM.",
  viz: { id: "v-modintro", intro: "A message, a carrier and their combination, stage by stage." },
  sim: { id: "s-antenna", tasks: ["Set the signal to 3 kHz (voice). How long must a quarter-wave antenna be?", "Move the carrier to 100 MHz (FM). How long is the antenna now?", "Find the frequency at which the antenna fits inside a phone (about 3 cm)."] },
  quiz: [
    { q: "Modulation is the process of:", o: ["Amplifying noise", "Varying a carrier's amplitude, frequency or phase to carry information", "Converting ASCII to EBCDIC", "Splitting a fibre"], a: 1, e: "Modulation alters carrier characteristics to encode information.", d: 1 },
    { q: "In digital modulation:", o: ["Both message and carrier are digital", "The carrier is analog and the message is digital", "Both are analog", "No carrier is used"], a: 1, e: "Digital modulation: analog carrier, digital message.", d: 1 },
    { q: "Which is an advantage of modulation?", o: ["Higher equipment cost", "Reduces antenna size", "Complicated receivers", "Power wastage"], a: 1, e: "Modulation reduces antenna size.", d: 2 },
    { q: "FM radio uses which modulation?", o: ["Amplitude modulation", "Frequency modulation", "Phase shift keying", "ASK"], a: 1, e: "FM radio = frequency modulation.", d: 2 },
    { q: "What quarter-wave antenna length is needed to radiate a 3 kHz signal directly?", o: ["25 m", "250 m", "25 km", "2.5 km"], a: 2, e: "λ = 3×10⁸/3000 = 100 km; λ/4 = 25 km.", d: 3 },
    { q: "Why does modulation make FDM possible?", o: ["It encrypts the signals", "It shifts each signal to a different carrier frequency so they don't overlap", "It digitises voice", "It reduces noise to zero"], a: 1, e: "Frequency translation gives each signal its own band.", d: 3 }
  ]
},

{
  id: "u4-analog", unit: "u4", title: "Analog Modulation: AM, FM and PM", minutes: 10,
  summary: "Amplitude, frequency and phase modulation: how each varies the carrier, modulation index, bandwidth, power and noise performance.",
  source: "Unit IV slides 8–10",
  intro: "<p>Analog modulation carries a continuous message such as voice or music on a carrier. There are three ways to do it — vary the carrier's <b>amplitude</b>, its <b>frequency</b> or its <b>phase</b>.</p>",
  definition: "In Amplitude Modulation (AM) only the carrier's amplitude is varied with the message, keeping frequency and phase fixed. In Frequency Modulation (FM) only the carrier's frequency is varied, keeping amplitude and phase fixed. In Phase Modulation (PM) the carrier's phase is varied to represent the message.",
  why: "<p>AM and FM are the foundations of broadcasting, and PM underlies the phase-based digital schemes (PSK, QPSK) used everywhere today. Comparing them shows the trade-off between bandwidth, power and noise immunity.</p>",
  how: "<h3>1. Amplitude Modulation (AM)</h3><p>Only the <b>amplitude</b> of the carrier changes to follow the data; phase and frequency stay unchanged. The outline of the peaks (the <i>envelope</i>) traces the message.</p>" +
    "<h3>2. Frequency Modulation (FM)</h3><p>Only the <b>frequency</b> of the carrier changes to follow the data; phase and amplitude stay unchanged. Waves bunch together where the message is high and spread out where it is low.</p>" +
    "<h3>3. Phase Modulation (PM)</h3><p>The <b>phase</b> of the carrier changes to represent the data, so different information values are represented by different phases. Example from the slide: '1' may be represented by 0° and '0' by 180°.</p>",
  compare: { head: ["Feature", "AM", "FM", "PM"], rows: [["Carrier property varied", "Amplitude", "Frequency", "Phase"], ["Bandwidth", "2 × message frequency", "≈ 2(Δf + f_m) — wider", "Similar to FM"], ["Noise immunity", "Poor (noise adds to amplitude)", "Good (amplitude limiter removes noise)", "Good"], ["Transmitter power", "Varies with message", "Constant", "Constant"], ["Uses", "AM/MW radio, aircraft radio", "FM radio, TV sound, two-way radio", "Satellite links; basis of PSK"]] },
  deep: "<div class='codebox'>Message m(t) = A_m cos(2πf_m t)      Carrier c(t) = A_c cos(2πf_c t)\n\nAM:  s(t) = A_c [1 + μ cos(2πf_m t)] cos(2πf_c t)      μ = A_m/A_c (modulation index)\n     Bandwidth = 2 f_m   (sidebands at f_c ± f_m)\n     Total power P_t = P_c (1 + μ²/2)    Efficiency = μ² / (2 + μ²)  → max 33.3% at μ = 1\n     μ > 1 → over-modulation: envelope distortion\n\nFM:  s(t) = A_c cos(2πf_c t + β sin 2πf_m t)          β = Δf / f_m (modulation index)\n     Carson's rule: Bandwidth ≈ 2(Δf + f_m)\n     FM broadcast: Δf = 75 kHz, f_m = 15 kHz → β = 5, BW ≈ 180 kHz (200 kHz channels)\n\nPM:  s(t) = A_c cos(2πf_c t + k_p m(t))</div>" +
    "<p><b>FM and PM are closely related.</b> Frequency is the rate of change of phase, so FM of a message equals PM of the <i>integral</i> of that message. Both are called <i>angle modulation</i>.</p>" +
    "<p><b>Why FM sounds cleaner.</b> Noise mostly disturbs amplitude. An FM receiver clips (limits) the amplitude and reads only the frequency, discarding most of the noise. The cost is a much wider bandwidth.</p>",
  syllabusNote: "Slide 10's example (‘1’ = 0°, ‘0’ = 180°) is really <b>BPSK</b>, the digital form. In analog PM the phase shifts continuously in proportion to the message amplitude rather than jumping between two values.",
  examples: ["AM: medium-wave broadcast (531–1602 kHz in India), aviation VHF voice", "FM: FM radio (88–108 MHz), walkie-talkies, TV audio", "PM: satellite telemetry; phase-based digital systems (PSK in Wi-Fi, GPS)"],
  terms: [["Envelope", "The outline of the AM peaks, which follows the message."], ["Sideband", "Frequency components at f_c ± f_m created by modulation."], ["Modulation index (μ, β)", "Strength of modulation in AM / FM."], ["Frequency deviation (Δf)", "Maximum shift of the FM carrier frequency."], ["Over-modulation", "AM with μ > 1, which distorts the envelope."]],
  exam: ["AM: only amplitude varies; frequency and phase constant.", "FM: only frequency varies; amplitude and phase constant.", "PM: phase varies to represent data; e.g. '1' = 0°, '0' = 180°.", "AM bandwidth = 2f_m; FM bandwidth ≈ 2(Δf + f_m) (Carson's rule).", "FM has better noise immunity than AM; AM is simpler and narrower."],
  recap: "AM varies height, FM varies spacing, PM varies starting point. FM/PM resist noise better; AM uses less bandwidth.",
  viz: { id: "v-amfmpm", intro: "One message signal modulates the same carrier three ways — compare the waveforms stage by stage." },
  sim: { id: "s-analogmod", tasks: ["Choose AM and raise the modulation index above 1. What happens to the envelope?", "Choose FM and increase Δf. How does the bandwidth (Carson's rule) change?", "Compare AM and PM with the same message. Which keeps a constant amplitude?"] },
  quiz: [
    { q: "In AM, which property of the carrier is varied?", o: ["Frequency", "Phase", "Amplitude", "Wavelength only"], a: 2, e: "AM varies only the amplitude.", d: 1 },
    { q: "In FM, which carrier properties remain unchanged?", o: ["Frequency only", "Amplitude and phase", "Amplitude only", "Nothing"], a: 1, e: "FM varies frequency; amplitude and phase stay constant.", d: 1 },
    { q: "Which modulation has the best noise immunity of the three?", o: ["AM", "FM", "Neither", "Both AM and FM equal"], a: 1, e: "FM receivers limit amplitude, removing most noise.", d: 2 },
    { q: "Representing '1' by 0° and '0' by 180° varies which carrier property?", o: ["Amplitude", "Frequency", "Phase", "Bandwidth"], a: 2, e: "This is phase modulation (BPSK).", d: 2 },
    { q: "An AM signal uses a 5 kHz message tone. Its bandwidth is:", o: ["5 kHz", "10 kHz", "2.5 kHz", "20 kHz"], a: 1, e: "AM bandwidth = 2 × f_m = 10 kHz.", d: 3 },
    { q: "Using Carson's rule, an FM signal with Δf = 75 kHz and f_m = 15 kHz needs a bandwidth of:", o: ["90 kHz", "150 kHz", "180 kHz", "30 kHz"], a: 2, e: "2(75 + 15) = 180 kHz.", d: 3 }
  ]
},

{
  id: "u4-ask-fsk", unit: "u4", title: "Digital Modulation: ASK and FSK", minutes: 9,
  summary: "Amplitude Shift Keying and Frequency Shift Keying: how binary data switches the carrier's amplitude or frequency, mark and space frequencies, pros, cons and uses.",
  source: "Unit IV slides 12–16",
  intro: "<p>Digital modulation keys the carrier between a few fixed states to represent bits. The two simplest ways are switching its <b>amplitude</b> (ASK) and switching its <b>frequency</b> (FSK).</p>",
  definition: "Amplitude Shift Keying (ASK) represents binary data as variations in the amplitude of the carrier. Frequency Shift Keying (FSK) varies the carrier frequency according to the discrete digital values: a high frequency for binary 1 (mark) and a low frequency for binary 0 (space).",
  why: "<p>ASK and FSK are simple and cheap. They are the first digital modulation schemes and are still used in RFID, optical links (on-off keying), caller ID and Bluetooth (GFSK). Their weaknesses explain why PSK and QAM were developed.</p>",
  how: "<h3>Amplitude Shift Keying (ASK)</h3><p>The amplitude of the output depends on the input data: for a binary <b>0</b> the output is at <b>zero level</b>; for a binary <b>1</b> it is a positive and negative variation at the carrier frequency. ASK is a type of amplitude modulation for binary data. The simplest form, where the carrier is switched fully on and off, is <b>On-Off Keying (OOK)</b>.</p>" +
    "<h3>Frequency Shift Keying (FSK)</h3><p>The output frequency is either high or low depending on the input data. FSK is a scheme of frequency modulation: the output is <b>high in frequency for binary HIGH</b> and <b>low in frequency for binary LOW</b>. The two frequencies are called the <b>mark</b> (1) and <b>space</b> (0) frequencies.</p>",
  compare: { head: ["Feature", "ASK", "FSK"], rows: [["Carrier property switched", "Amplitude", "Frequency"], ["Binary 1 / 0", "Carrier present / absent (or two levels)", "Mark frequency / space frequency"], ["Noise immunity", "Poor — noise changes amplitude", "Better — amplitude noise is ignored"], ["Bandwidth", "Narrow", "Wider (needs two frequencies)"], ["Complexity", "Simplest", "Simple"], ["Uses", "Optical fibre (OOK), RFID, IR remotes", "Early modems, caller ID, pagers, Bluetooth (GFSK)"]] },
  deep: "<p><b>Bandwidth.</b> For bit rate R, ASK needs roughly B ≈ (1 + d)·R, where d (0–1) depends on pulse shaping. Binary FSK needs B ≈ (1 + d)·R + 2Δf, where 2Δf is the separation between the mark and space frequencies.</p>" +
    "<div class='table-wrap'><table><thead><tr><th>Modem standard</th><th>Scheme</th><th>Rate</th><th>Frequencies</th></tr></thead><tbody><tr><td>Bell 103 (originate)</td><td>FSK</td><td>300 bit/s</td><td>mark 1270 Hz / space 1070 Hz</td></tr><tr><td>Bell 202 (caller ID)</td><td>FSK</td><td>1200 bit/s</td><td>mark 1200 Hz / space 2200 Hz</td></tr></tbody></table></div>" +
    "<p><b>Detecting FSK.</b> The receiver uses two band-pass filters (one per frequency) and compares their energies in each bit period; whichever is larger decides the bit. That is why amplitude noise and gain hits barely matter, while phase hits and frequency shifts do (Unit III).</p>" +
    "<p><b>Continuous-phase FSK</b> (as in GFSK and MSK) switches frequency without phase jumps, keeping the spectrum compact. Bluetooth uses GFSK.</p>",
  examples: ["ASK/OOK: TV remote infrared, fibre-optic transmitters, RFID tags", "FSK: dial-up modems (Bell 103), caller ID display, pagers", "GFSK: Bluetooth"],
  terms: [["ASK", "Amplitude shift keying."], ["OOK", "On-off keying: the carrier is on for 1 and off for 0."], ["FSK", "Frequency shift keying."], ["Mark / space", "FSK frequencies for binary 1 / 0."], ["GFSK", "Gaussian-filtered FSK (Bluetooth)."]],
  exam: ["Three digital modulation types: ASK, FSK, PSK.", "ASK: binary data as amplitude variations; 0 → zero level, 1 → carrier variation.", "FSK: frequency high for binary 1, low for binary 0; FSK is a scheme of frequency modulation.", "Mark = 1 frequency, space = 0 frequency.", "Draw ASK and FSK output waveforms for a given input binary sequence."],
  recap: "ASK: carrier on/off (or two amplitudes) — simple but noise-prone. FSK: two frequencies (mark/space) — more robust, uses more bandwidth.",
  viz: { id: "v-askfsk", intro: "The same bit sequence is drawn as NRZ input, an ASK output and an FSK output." },
  sim: { id: "s-digitalmod", params: { scheme: "FSK" }, tasks: ["Send 10110010 with FSK and identify the mark and space frequencies.", "Switch to ASK. Raise the noise until bits start failing. Which scheme fails first?", "Compare the bit-error counts of ASK and FSK at the same SNR."] },
  quiz: [
    { q: "In ASK, a binary 0 is typically represented by:", o: ["A high frequency", "Zero amplitude (no carrier)", "A 180° phase shift", "A low frequency"], a: 1, e: "In ASK/OOK the output is at zero level for 0.", d: 1 },
    { q: "In FSK, the frequencies for binary 1 and 0 are called:", o: ["Upper and lower", "Mark and space", "Carrier and sideband", "In-phase and quadrature"], a: 1, e: "Mark (1) and space (0) frequencies.", d: 1 },
    { q: "FSK is a scheme of:", o: ["Amplitude modulation", "Frequency modulation", "Phase modulation", "Pulse modulation"], a: 1, e: "FSK is digital frequency modulation.", d: 2 },
    { q: "Why is ASK more sensitive to noise than FSK?", o: ["It uses two frequencies", "Noise directly alters amplitude, which carries the data", "It cannot be filtered", "It uses phase"], a: 1, e: "ASK information is in the amplitude, which noise corrupts.", d: 2 },
    { q: "Which transient from Unit III would most disturb an ASK link?", o: ["Phase hit", "Gain hit", "Frequency shift only", "None"], a: 1, e: "Gain hits change the amplitude, which ASK relies on.", d: 3 },
    { q: "In Bell 202 FSK (1200 bit/s), the mark is 1200 Hz and the space is 2200 Hz. How many carrier cycles fit in one bit when sending a 1?", o: ["0.5", "1", "1.83", "2200"], a: 1, e: "Bit time = 1/1200 s; 1200 Hz × (1/1200 s) = 1 cycle.", d: 3 }
  ]
},

{
  id: "u4-psk", unit: "u4", title: "Phase Shift Keying: BPSK, QPSK and DPSK", minutes: 10,
  summary: "Encoding bits in the carrier's phase: binary PSK (0°/180°), quadrature PSK (four phases, two bits per symbol) and differential PSK (no reference oscillator).",
  source: "Unit IV slides 17–23",
  intro: "<p>Phase shift keying hides data in the <b>phase</b> of a constant-amplitude carrier. It is robust to noise and widely used in Wi-Fi, Bluetooth, RFID and satellite links.</p>",
  definition: "Phase Shift Keying (PSK) is a digital modulation technique in which the phase of the carrier is changed according to the input data, by varying the sine and cosine inputs at a particular time. Its main types are BPSK (two phases), QPSK (four phases) and DPSK (phase changes relative to the previous symbol).",
  why: "<p>PSK keeps a constant amplitude, so amplitude noise and gain hits do not corrupt the data. QPSK doubles the data per symbol with no extra bandwidth, which is why phase-based schemes dominate wireless systems.</p>",
  how: "<h3>BPSK — Binary Phase Shift Keying</h3><p>Also called <b>2-phase PSK</b> or <b>phase reversal keying</b>. The sine-wave carrier takes two phases, <b>0° and 180°</b>. BPSK is basically a DSB-SC (double sideband suppressed carrier) modulation scheme in which the message is the digital information. At every bit change the wave visibly flips.</p>" +
    "<h3>QPSK — Quadrature Phase Shift Keying</h3><p>The carrier takes <b>four phases</b> — such as 0°, 90°, 180° and 270°. QPSK is a variation of BPSK (also DSB-SC) that sends <b>two bits at a time</b>, called bigits (dibits). Instead of a serial stream of single bits, it converts the data into <b>bit pairs</b>: 00, 01, 10, 11 → four phases. Extending the idea gives 8-PSK and 16-PSK.</p>" +
    "<h3>DPSK — Differential Phase Shift Keying</h3><p>The phase is shifted <b>relative to the previous signal element</b>; no reference signal is used. If the data bit is <b>0</b>, the phase is <b>not reversed</b> and continues as it was. If the data bit is <b>1</b>, the phase is <b>reversed</b> — like NRZ-I, “invert on 1”, a form of differential encoding. DPSK needs <b>no reference oscillator</b> at the receiver.</p>" +
    "<p><b>Uses:</b> wireless LANs, biometric and contactless systems, RFID and Bluetooth.</p>",
  deep: "<div class='codebox'>BPSK: 1 bit/symbol   s(t) = A cos(2πf_c t + π·(1 − b))       b ∈ {0,1}\nQPSK: 2 bits/symbol  phases 45°, 135°, 225°, 315° (Gray coded: 00, 01, 11, 10)\n\nSymbol (baud) rate = bit rate / bits per symbol\nExample: 2 Mbit/s → BPSK: 2 Mbaud      QPSK: 1 Mbaud  (half the bandwidth)</div>" +
    "<p><b>Constellation diagrams</b> plot each symbol as a point: the I axis (cosine part) and Q axis (sine part). BPSK has two points on the I axis; QPSK has four points at 90° spacing. Noise smears the points into clouds, and the receiver picks the nearest ideal point. QPSK achieves the same bit-error rate per bit as BPSK while using half the bandwidth.</p>" +
    "<p><b>Gray coding</b> labels neighbouring QPSK points so they differ by one bit (00–01–11–10). A small phase error (the most likely error) then flips only one bit. Unit III's Gray code in action.</p>" +
    "<p><b>Why DPSK:</b> a coherent PSK receiver needs a perfectly synchronised reference carrier; a phase hit or frequency shift can make it decode everything inverted. DPSK compares each symbol with the previous one, so it tolerates slow phase drift, at the cost of about 1 dB of noise performance and paired errors.</p>",
  syllabusNote: "Slide 21 says QPSK “decreases the data bit rate to half”. More precisely: for the <b>same bit rate</b>, QPSK halves the <b>symbol (baud) rate</b>, so it needs about half the bandwidth of BPSK and leaves room for other users. The bits are not slowed down.",
  examples: ["BPSK: GPS signals, deep-space probes, RFID", "QPSK: satellite TV (DVB-S), 4G/5G control channels", "DPSK / π/4-DQPSK: Bluetooth EDR, older Wi-Fi (802.11b at 1–2 Mbit/s)"],
  terms: [["BPSK", "2 phases (0°, 180°), 1 bit per symbol."], ["QPSK", "4 phases, 2 bits per symbol (dibits)."], ["DPSK", "Phase changes relative to the previous symbol."], ["Constellation", "Plot of symbol points on the I/Q plane."], ["Symbol (baud) rate", "Symbols per second; bit rate = baud × bits per symbol."], ["DSB-SC", "Double sideband suppressed carrier."]],
  exam: ["PSK: phase of the carrier shifts according to the input (sine and cosine inputs).", "BPSK: 2-phase PSK / phase reversal keying; phases 0° and 180°; DSB-SC.", "QPSK: four phases (0°, 90°, 180°, 270°), two bits at a time (bigits), bit pairs; also DSB-SC.", "DPSK: phase shifted relative to the previous element; 0 → no reversal, 1 → reversal; no reference oscillator.", "Used in wireless LANs, biometrics, contactless, RFID, Bluetooth."],
  recap: "BPSK: flip 180° for a bit. QPSK: 4 phases = 2 bits per symbol (half the baud). DPSK: flip relative to the last symbol, so no reference is needed.",
  viz: { id: "v-psk", intro: "Watch the carrier phase flip for BPSK, step through four phases for QPSK, and follow the DPSK invert-on-1 rule." },
  sim: { id: "s-digitalmod", params: { scheme: "QPSK" }, tasks: ["Send 00011011 with QPSK and match each bit pair to its constellation point.", "Lower the SNR and watch the points spread. When do symbol errors start?", "Switch to BPSK at the same SNR. Which is more robust per symbol, and why?"] },
  quiz: [
    { q: "BPSK uses how many phases?", o: ["1", "2", "4", "8"], a: 1, e: "BPSK uses two phases: 0° and 180°.", d: 1 },
    { q: "BPSK is also called:", o: ["Phase reversal keying", "Mark-space keying", "On-off keying", "Quadrature keying"], a: 0, e: "BPSK = 2-phase PSK = phase reversal keying.", d: 1 },
    { q: "How many bits does each QPSK symbol carry?", o: ["1", "2", "3", "4"], a: 1, e: "Four phases = 2 bits per symbol.", d: 2 },
    { q: "In DPSK (as on the slide), a data bit 1 causes:", o: ["No change in phase", "A phase reversal relative to the previous element", "An amplitude increase", "A frequency change"], a: 1, e: "Invert on 1, like NRZ-I.", d: 2 },
    { q: "A link sends 4 Mbit/s. What is the symbol rate using QPSK?", o: ["8 Mbaud", "4 Mbaud", "2 Mbaud", "1 Mbaud"], a: 2, e: "Baud = 4 Mbit/s ÷ 2 bits/symbol = 2 Mbaud.", d: 3 },
    { q: "What is the main advantage of DPSK over coherent BPSK?", o: ["Higher data rate", "No reference oscillator (carrier recovery) is needed at the receiver", "Uses less power", "Carries 4 bits per symbol"], a: 1, e: "DPSK decodes relative to the previous symbol.", d: 3 }
  ]
},

{
  id: "u4-qam", unit: "u4", title: "Quadrature Amplitude Modulation (QAM)", minutes: 9,
  summary: "Combining amplitude and phase changes on two quadrature carriers to pack many bits per symbol: constellations, 16/64/256-QAM and the SNR trade-off.",
  source: "Unit IV syllabus (slide 4)",
  intro: "<p>How does Wi-Fi reach hundreds of megabits per second in a 20–160 MHz channel? By changing <b>both the amplitude and the phase</b> of the carrier at once. That is <b>QAM</b>.</p>",
  definition: "Quadrature Amplitude Modulation (QAM) is a modulation technique that varies both the amplitude and the phase of the carrier. It does this by adding two amplitude-modulated carriers of the same frequency that are 90° apart (in quadrature): the in-phase (I, cosine) and quadrature (Q, sine) components. M-QAM has M distinct symbols, each carrying log₂M bits.",
  why: "<p>QAM gives the most bits per hertz of any common scheme. That is why it is the heart of high-speed modems, Wi-Fi, 4G/5G, cable broadband and digital TV.</p>",
  how: "<ol class='points'><li>Group the bits into symbols of k bits (16-QAM: 4 bits per symbol).</li><li>Use half of the bits to choose an amplitude level for the <b>I</b> (cosine) carrier and half for the <b>Q</b> (sine) carrier.</li><li>Add the two carriers. The result has a specific <b>amplitude and phase</b> — one point in the constellation.</li><li>The receiver measures I and Q, finds the nearest constellation point and outputs its bits.</li></ol>" +
    "<div class='table-wrap'><table><thead><tr><th>Scheme</th><th>Points (M)</th><th>Bits per symbol</th><th>Needs SNR (approx., for low error rate)</th></tr></thead><tbody>" +
    "<tr><td>QPSK (= 4-QAM)</td><td>4</td><td>2</td><td>~10 dB</td></tr><tr><td>16-QAM</td><td>16</td><td>4</td><td>~17 dB</td></tr><tr><td>64-QAM</td><td>64</td><td>6</td><td>~23 dB</td></tr><tr><td>256-QAM</td><td>256</td><td>8</td><td>~29 dB</td></tr><tr><td>1024-QAM</td><td>1024</td><td>10</td><td>~35 dB</td></tr></tbody></table></div>",
  deep: "<div class='codebox'>s(t) = I·cos(2πf_c t) − Q·sin(2πf_c t)     amplitude = √(I² + Q²),  phase = atan2(Q, I)\n16-QAM: I, Q ∈ {−3, −1, +1, +3}  → 4 × 4 = 16 points\nBits per symbol = log₂ M          Bit rate = symbol rate × log₂ M\n\nExample: 5 Msymbol/s with 64-QAM → 5 × 6 = 30 Mbit/s</div>" +
    "<p><b>The trade-off.</b> Packing more points into the same average power puts them closer together, so less noise is enough to push a received point into a neighbour's region. Each doubling of bits per symbol needs roughly 6 dB more SNR. Real systems use <b>adaptive modulation</b>: Wi-Fi, LTE and DOCSIS step down from 256-QAM to 16-QAM or QPSK as the signal weakens.</p>" +
    "<p><b>Gray mapping</b> again ensures neighbouring points differ by one bit. <b>Where QAM is used:</b> V.32/V.34 dial-up modems, ADSL (per tone), Wi-Fi 6 (1024-QAM) and Wi-Fi 7 (4096-QAM), 4G/5G (up to 256-QAM), DOCSIS cable (up to 4096-QAM) and digital cable TV (256-QAM). It is also used on light in coherent optical links.</p>",
  examples: ["Wi-Fi 6 at 1024-QAM close to the router, dropping to 16-QAM far away", "Cable modems (DOCSIS) with 256-QAM downstream", "4G/5G phones switching QAM level with signal quality", "V.34 modems squeezing 33.6 kbit/s through a voice line"],
  terms: [["I / Q", "In-phase (cosine) and quadrature (sine) components."], ["M-QAM", "QAM with M constellation points."], ["Constellation", "Map of all valid I/Q symbol points."], ["Adaptive modulation", "Changing the QAM order to match channel quality."], ["Spectral efficiency", "Bits per second per hertz."]],
  exam: ["QAM varies both amplitude and phase, using two carriers 90° apart (I and Q).", "M-QAM carries log₂M bits per symbol (16-QAM = 4, 64-QAM = 6, 256-QAM = 8).", "Higher-order QAM gives a higher data rate but needs a higher SNR.", "Used in modems, Wi-Fi, 4G/5G, cable and DSL."],
  recap: "QAM = amplitude + phase on I and Q carriers. More points = more bits per symbol = needs a cleaner channel.",
  viz: { id: "v-qam", intro: "Build the 16-QAM constellation: four bits choose an I level and a Q level, giving one point." },
  sim: { id: "s-digitalmod", params: { scheme: "16QAM" }, tasks: ["Send a bit string with 16-QAM at high SNR. Are there any errors?", "Lower the SNR to 12 dB and watch the clouds overlap. Count the symbol errors.", "Switch between QPSK, 8-PSK and 16-QAM at 14 dB. Which gives the best balance of rate and errors?"] },
  quiz: [
    { q: "QAM varies which carrier properties?", o: ["Amplitude only", "Frequency only", "Both amplitude and phase", "Phase only"], a: 2, e: "QAM combines amplitude and phase changes.", d: 1 },
    { q: "How many bits does each 16-QAM symbol carry?", o: ["2", "4", "8", "16"], a: 1, e: "log₂16 = 4.", d: 1 },
    { q: "The two carriers in QAM are separated by:", o: ["0°", "45°", "90°", "180°"], a: 2, e: "They are in quadrature: 90° apart.", d: 2 },
    { q: "Moving from 16-QAM to 256-QAM in the same bandwidth will:", o: ["Lower the bit rate", "Double the bit rate but need a higher SNR", "Need no SNR change", "Turn it into FSK"], a: 1, e: "8 vs 4 bits per symbol doubles the rate but needs a cleaner channel.", d: 2 },
    { q: "A system sends 10 Msymbol/s using 64-QAM. Its bit rate is:", o: ["10 Mbit/s", "60 Mbit/s", "64 Mbit/s", "640 Mbit/s"], a: 1, e: "10 M × log₂64 = 10 × 6 = 60 Mbit/s.", d: 3 },
    { q: "Why does Wi-Fi switch from 1024-QAM to 16-QAM when you move far from the router?", o: ["To save money", "The SNR drops, and denser constellations would give too many symbol errors", "16-QAM is newer", "The router overheats"], a: 1, e: "Adaptive modulation matches the QAM order to the SNR.", d: 3 }
  ]
},

{
  id: "u4-mux", unit: "u4", title: "Introduction to Multiplexing", minutes: 7,
  summary: "Sharing one medium among many signals with a multiplexer (MUX) and demultiplexer (DEMUX), and the types: FDM, TDM (synchronous and statistical) and WDM.",
  source: "Unit IV slides 27–29", related: ["multiplexing"],
  intro: "<p>Laying a separate cable for every phone call or TV channel would be absurdly expensive. <b>Multiplexing</b> lets many signals share one link.</p>",
  definition: "Multiplexing is the sharing of a medium or bandwidth: multiple signals from multiple sources are combined and transmitted over a single communication line. A multiplexer (MUX) takes n input lines and generates a single output line; a demultiplexer (DEMUX) takes the single line and generates n output lines.",
  why: "<p>High-capacity links (fibre, coax, microwave) have far more capacity than one user needs. Multiplexing uses that capacity efficiently, reducing cost per channel. It is how telephone trunks, cable TV and fibre backbones work.</p>",
  how: "<p>The n input lines pass through the <b>MUX</b>, which combines the signals into a <b>composite signal</b> on <b>one link with n channels</b>. At the far end, the <b>DEMUX</b> separates the composite signal and delivers each signal to its destination.</p>" +
    "<h3>Types of multiplexing</h3><ul class='points'><li><b>Frequency-Division Multiplexing (FDM)</b> — each signal gets its own frequency band; all are sent simultaneously.</li><li><b>Time-Division Multiplexing (TDM)</b> — each signal gets the whole bandwidth for a short time slot, in turn.<ul><li><b>Synchronous TDM</b> — fixed slots for every source.</li><li><b>Statistical TDM</b> — slots given on demand to active sources.</li></ul></li><li><b>Wavelength-Division Multiplexing (WDM)</b> — FDM applied to light in optical fibre: each signal uses a different wavelength.</li></ul>",
  deep: "<p><b>FDM vs TDM in one picture:</b> imagine the link as a rectangle with frequency on one axis and time on the other. FDM cuts it into <i>horizontal strips</i> (each user owns a band for all time). TDM cuts it into <i>vertical strips</i> (each user owns all frequencies for a slot of time). <b>CDM</b> (code-division, used in 3G CDMA) lets everyone use all frequencies all the time, separated by unique codes.</p>" +
    "<p><b>Requirements:</b> FDM needs a medium bandwidth greater than the sum of the channel bandwidths plus guard bands. TDM needs a link data rate at least the sum of the input data rates (synchronous) or their average (statistical).</p>",
  diagram: "<figure class='diagram'><div class='flow'><div style='display:flex;flex-direction:column;gap:4px'><span class='node'>Input 1</span><span class='node'>Input 2</span><span class='node'>Input n</span></div><span class='arrow'>→</span><span class='node b'>MUX</span><span class='arrow'>— 1 link, n channels —→</span><span class='node b'>DEMUX</span><span class='arrow'>→</span><div style='display:flex;flex-direction:column;gap:4px'><span class='node'>Output 1</span><span class='node'>Output 2</span><span class='node'>Output n</span></div></div><figcaption>n inputs share one link (Unit IV slide 28)</figcaption></figure>",
  examples: ["Cable TV: hundreds of channels on one coax (FDM)", "Telephone trunks: thousands of calls on one fibre (TDM/WDM)", "FM radio: many stations in the same air (FDM)", "Undersea fibre: 80+ wavelengths on one fibre (WDM)"],
  terms: [["MUX", "Combines n inputs onto one line."], ["DEMUX", "Separates one line into n outputs."], ["Composite signal", "The combined signal on the shared link."], ["Channel", "A logical path for one signal within the link."]],
  exam: ["Multiplexing = sharing a medium or bandwidth; multiple signals combined onto a single line.", "MUX: n inputs → 1 output; DEMUX: 1 input → n outputs.", "Types: FDM, TDM (synchronous and statistical), WDM.", "The composite signal on one link carries n channels."],
  recap: "MUX combines, DEMUX separates. Share by frequency (FDM), by time (TDM: synchronous or statistical) or by wavelength (WDM).",
  viz: { id: "v-mux", intro: "Several inputs feed a MUX, share one link, and are separated by the DEMUX." },
  sim: { id: "s-mux", tasks: ["Add a fourth input in FDM mode. How does the required link bandwidth change?", "Switch to synchronous TDM and make one input silent. What happens to its slot?", "Switch to statistical TDM with the same inputs and compare the efficiency."] },
  quiz: [
    { q: "Multiplexing means:", o: ["Encrypting a signal", "Sharing one medium among multiple signals", "Amplifying a signal", "Converting analog to digital"], a: 1, e: "Multiple signals share a single line.", d: 1 },
    { q: "A device that takes n inputs and produces one output is a:", o: ["DEMUX", "MUX", "Modem", "Repeater"], a: 1, e: "The multiplexer combines inputs.", d: 1 },
    { q: "Which is NOT a type of multiplexing in the syllabus?", o: ["FDM", "TDM", "WDM", "ASK"], a: 3, e: "ASK is a modulation scheme, not multiplexing.", d: 2 },
    { q: "The two types of TDM are:", o: ["Analog and digital", "Synchronous and statistical", "Forward and backward", "Near-end and far-end"], a: 1, e: "Synchronous (fixed slots) and statistical (on demand).", d: 2 },
    { q: "In which technique does each user own a frequency band for all time?", o: ["TDM", "FDM", "Statistical TDM", "None"], a: 1, e: "FDM divides by frequency.", d: 3 },
    { q: "Four 64 kbit/s inputs are combined by synchronous TDM. The minimum link rate (ignoring framing) is:", o: ["64 kbit/s", "128 kbit/s", "256 kbit/s", "16 kbit/s"], a: 2, e: "4 × 64 = 256 kbit/s.", d: 3 }
  ]
},

{
  id: "u4-fdm", unit: "u4", title: "Frequency Division Multiplexing (FDM)", minutes: 8,
  summary: "Dividing the frequency spectrum into channels separated by guard bands: how FDM works, bandwidth calculation, advantages and disadvantages.",
  source: "Unit IV slides 30–32",
  intro: "<p>Tune your FM radio from 91.1 to 98.3 MHz and you are moving between channels of an FDM system. Every station transmits at the same time, each on its <b>own frequency</b>.</p>",
  definition: "In Frequency Division Multiplexing the frequency spectrum of the medium is divided among logical channels, and each user has exclusive access to its channel. Each signal is modulated onto a different carrier frequency, the carriers are separated by guard bands, and all signals are transmitted at the same time.",
  why: "<p>FDM is the natural way to share analog media such as radio spectrum and coaxial cable. It powers broadcasting, cable TV, ADSL and the early telephone carrier systems.</p>",
  how: "<ul class='points'><li>The spectrum is divided among logical channels; each user gets <b>exclusive access</b> to its channel.</li><li>Signals are sent in distinct frequency ranges, e.g. multiple video channels on one cable.</li><li>Each signal is <b>modulated onto a different carrier frequency</b>, and the carriers are separated by <b>guard bands</b>.</li><li>The medium's bandwidth must <b>exceed</b> the combined bandwidth of all the signals.</li><li>FDM usually uses <b>analog signalling</b>, which is more susceptible to noise.</li><li>Non-overlapping frequency ranges are assigned to each user, so all signals are transmitted <b>at the same time</b>.</li><li>The multiplexer is attached to the high-speed line. The radio spectrum is an example of the medium.</li></ul>" +
    "<h3>Advantages</h3><ul class='points'><li>Simple process, easy to modulate</li><li>A matching MUX/DEMUX at each end of the high-speed line separates the signals</li><li>Uses analog signalling</li></ul><h3>Disadvantages</h3><ul class='points'><li>Cannot use the full capacity of the cable (guard bands waste bandwidth)</li><li>Frequency bands must not overlap</li><li>A considerable gap is needed between bands so one band does not affect another</li></ul>",
  deep: "<div class='codebox'>Total bandwidth = n × B_channel + (n − 1) × B_guard\n\nExample: 5 voice channels of 4 kHz with 200 Hz guard bands\n  = 5 × 4 + 4 × 0.2 = 20.8 kHz\nEfficiency = useful / total = 20 / 20.8 = 96%</div>" +
    "<p><b>Transmitter:</b> each baseband signal modulates its own carrier (f₁, f₂, f₃ …), often with single-sideband AM for voice, and the modulated signals are added together. <b>Receiver:</b> band-pass filters pick out each band, then each is demodulated back to baseband.</p>" +
    "<p><b>Problems:</b> non-linear devices create <i>intermodulation</i> products that fall into other channels (Unit III), and oscillator mismatch causes frequency shift. <b>OFDM</b> (Wi-Fi, 4G/5G) is a modern digital form of FDM: its subcarriers are mathematically orthogonal, so they can overlap without guard bands.</p>",
  examples: ["FM and AM radio broadcasting", "Cable TV channels on coax", "ADSL: voice 0–4 kHz, upstream ~25–138 kHz, downstream ~138 kHz–1.1 MHz on one pair", "First-generation (1G AMPS) mobile phones"],
  terms: [["Guard band", "Unused frequency gap separating adjacent channels."], ["Carrier frequency", "Centre frequency assigned to each channel."], ["Band-pass filter", "Passes one channel's band and rejects others."], ["OFDM", "Orthogonal FDM — overlapping orthogonal subcarriers."]],
  exam: ["FDM: spectrum divided among logical channels; each user has exclusive access.", "Each signal modulated onto a different carrier; carriers separated by guard bands.", "Medium bandwidth exceeds the sum of signal bandwidths; all signals transmitted simultaneously.", "Usually analog signalling (more susceptible to noise).", "Advantages: simple, easy to modulate, MUX/DEMUX at ends. Disadvantages: can't use full capacity, bands must not overlap, gap needed."],
  recap: "FDM = same time, different frequencies, with guard bands between. Bandwidth = n × channel + (n − 1) × guard.",
  viz: { id: "v-fdm", intro: "Three signals are shifted to their own carriers, combined into one spectrum, then filtered apart." },
  sim: { id: "s-mux", params: { mode: "FDM" }, tasks: ["With 4 channels of 4 kHz, set the guard band to 0. What risk does this create?", "Set a 500 Hz guard band and compute the total bandwidth yourself; check it against the readout.", "Increase to 8 channels. What fraction of the bandwidth is wasted on guards?"] },
  quiz: [
    { q: "In FDM, adjacent channels are separated by:", o: ["Time slots", "Guard bands", "Addresses", "Wavelengths"], a: 1, e: "Guard bands prevent overlap.", d: 1 },
    { q: "In FDM, signals are transmitted:", o: ["One at a time", "At the same time on different frequencies", "Only digitally", "Only on fibre"], a: 1, e: "All channels transmit simultaneously on different frequencies.", d: 1 },
    { q: "Which is a disadvantage of FDM?", o: ["It is complex to modulate", "It cannot use the full capacity of the cable", "It requires digital signalling", "Signals must take turns"], a: 1, e: "Guard bands waste capacity.", d: 2 },
    { q: "FDM usually uses which type of signalling?", o: ["Digital", "Analog", "Optical only", "None"], a: 1, e: "FDM usually uses analog signalling.", d: 2 },
    { q: "Six 4 kHz channels with 500 Hz guard bands need a total bandwidth of:", o: ["24 kHz", "26.5 kHz", "27 kHz", "30 kHz"], a: 1, e: "6 × 4 + 5 × 0.5 = 26.5 kHz.", d: 3 },
    { q: "How does ADSL use FDM on a single telephone pair?", o: ["By time slots", "Separate bands for voice, upstream data and downstream data", "By using two fibres", "By encryption"], a: 1, e: "ADSL splits the pair's spectrum into voice, upstream and downstream bands.", d: 3 }
  ]
},

{
  id: "u4-tdm", unit: "u4", title: "Time Division Multiplexing: Synchronous and Statistical", minutes: 10,
  summary: "Giving each source the whole bandwidth for short time slots: synchronous TDM (fixed round-robin slots) vs statistical TDM (on-demand slots with addresses).",
  source: "Unit IV slides 33–38",
  intro: "<p>Instead of dividing frequencies, TDM divides <b>time</b>. Each user gets the <i>entire</i> channel, but only for a tiny burst, in turn — so fast that every user seems to have a continuous connection.</p>",
  definition: "In Time Division Multiplexing, each user periodically gets the entire bandwidth for a small burst of time. Sharing is achieved by dividing the available transmission time on the medium among users. TDM uses digital signalling and has two types: synchronous TDM and statistical TDM (STDM).",
  why: "<p>TDM is used extensively in computer communication and telecommunication. Digital telephone trunks (T1/E1), SONET and GSM timeslots all rely on it. The synchronous vs statistical choice decides how efficiently idle users' capacity is used.</p>",
  how: "<ul class='points'><li>The entire channel is dedicated to one user, but only for a short period.</li><li>TDM uses <b>digital signalling</b> instead of dividing the cable into frequency bands.</li><li>The data rate of the medium <b>exceeds</b> the data rate of the signals.</li><li>A <b>frame</b> has one <b>slot</b> for each slice of time.</li></ul>" +
    "<h3>1. Synchronous TDM</h3><p>Synchronous because the multiplexer and demultiplexer <b>agree on the time slots</b>. This is the original TDM. The MUX accepts input from attached devices in a <b>round-robin</b> fashion and transmits in a never-ending pattern. Examples: <b>T-1 and ISDN</b> telephone lines.</p><ul class='points'><li>If one device generates data faster, the MUX must sample it more often or buffer its stream.</li><li>If a device has <b>nothing to transmit</b>, the MUX must <b>still insert a slot</b> for it — wasted capacity.</li></ul>" +
    "<h3>2. Statistical TDM (STDM)</h3><p>Time-division but <b>on demand</b> rather than fixed: links are rescheduled per packet, and packets from different sources are interleaved.</p><ul class='points'><li>More nodes can be connected than the circuit's capacity, on the premise that not all nodes transmit at full capacity at once.</li><li>It must transmit a <b>terminal identification</b> (destination address) with each piece of data, and may require storage (buffering).</li><li>It transmits only data from <b>active</b> workstations, so no space is wasted on idle ones. Frames contain only data to be sent.</li></ul>",
  compare: { head: ["Feature", "Synchronous TDM", "Statistical TDM"], rows: [["Slot allocation", "Fixed, round robin", "On demand"], ["Idle source", "Slot still sent (wasted)", "No slot used"], ["Addressing", "Not needed (slot position identifies source)", "Each slot carries an address"], ["Buffering", "Minimal", "Needed when inputs burst"], ["Efficiency with bursty traffic", "Low", "High"], ["Examples", "T1, E1, ISDN", "Packet networks, X.25, frame relay"]] },
  deep: "<p><b>The slide example</b> (slides 36 and 38): five inputs with data units A: A1 · B: B1, B2 · C: none · D: D1, D2 · E: E2.</p>" +
    "<div class='codebox'>Synchronous TDM (5 slots per frame, round robin):\n  Frame 1: [A1][B1][  ][D1][  ]\n  Frame 2: [  ][B2][  ][D2][E2]\n  10 slots sent, 6 used → efficiency 60%\n\nStatistical TDM (only active data, each with an address):\n  Frame 1: [a|A1][b|B1][d|D1]\n  Frame 2: [b|B2][d|D2][e|E2]\n  6 slots sent, all carry data — but each slot carries extra address bits</div>" +
    "<p><b>Framing bits.</b> Synchronous TDM adds one or more synchronisation (framing) bits per frame — the 1 and 0 at the start of each frame on slide 36 — so the DEMUX can find frame boundaries. T1 uses 1 framing bit per 193-bit frame.</p>" +
    "<p><b>Rate rule:</b> in synchronous TDM the link rate = (number of inputs × input rate) + framing overhead. In STDM the link rate can be lower than the sum of the input rates (oversubscription); buffers absorb short bursts.</p>",
  examples: ["Synchronous: T1/E1 telephone trunks carrying 24/30 calls", "Synchronous: GSM, where each phone gets one of 8 timeslots on a carrier", "Statistical: Internet routers interleaving packets from many users", "Statistical: older X.25 and frame relay networks"],
  terms: [["Time slot", "Fixed interval in which one source transmits."], ["Frame", "One complete cycle of slots."], ["Round robin", "Serving each input in turn."], ["Framing bit", "Synchronisation bit marking the frame start."], ["Oversubscription", "More total input capacity than link capacity (relies on statistics)."]],
  exam: ["TDM: each user gets the entire bandwidth for a short burst; time is divided among users; digital signalling.", "Synchronous TDM: MUX and DEMUX agree on slots; round robin; slots sent even when there is no data; examples T-1 and ISDN.", "Statistical TDM: on demand, per packet; transmits only active stations' data; needs terminal identification (address) and storage; allows more nodes than capacity.", "Draw sync and statistical TDM frames for given inputs (slides 36 and 38)."],
  recap: "Synchronous TDM: fixed seats, even if empty. Statistical TDM: seats only for those who have data, each labelled with an address.",
  viz: { id: "v-tdm", intro: "Rebuild the slide's A–E example as synchronous frames and then as statistical frames." },
  sim: { id: "s-mux", params: { mode: "TDM" }, tasks: ["Use the slide inputs and confirm that synchronous TDM wastes 4 of 10 slots.", "Switch to statistical TDM. How many slots are sent now, and what extra information does each carry?", "Make every input active. Is statistical TDM still better?"] },
  quiz: [
    { q: "In TDM, each user gets:", o: ["A separate frequency band for all time", "The entire bandwidth for a short time slot", "A separate wavelength", "A unique code"], a: 1, e: "TDM gives the whole channel in turns.", d: 1 },
    { q: "Which TDM type transmits slots even when a source has no data?", o: ["Statistical TDM", "Synchronous TDM", "WDM", "FDM"], a: 1, e: "Synchronous TDM inserts a slot for every source.", d: 1 },
    { q: "T-1 and ISDN lines are examples of:", o: ["Statistical TDM", "Synchronous TDM", "FDM", "WDM"], a: 1, e: "The slides name T-1 and ISDN as synchronous TDM.", d: 2 },
    { q: "Why must statistical TDM send an address with each data unit?", o: ["To encrypt it", "Because slots are not fixed, so the DEMUX must know which source each belongs to", "To add parity", "To slow the link"], a: 1, e: "Slot position no longer identifies the source.", d: 2 },
    { q: "Synchronous TDM with 5 inputs sends 3 frames; only 9 data units exist. The efficiency is:", o: ["45%", "60%", "100%", "33%"], a: 1, e: "Slots = 5 × 3 = 15; 9/15 = 60%.", d: 3 },
    { q: "Statistical TDM allows connecting more nodes than the link capacity because:", o: ["It compresses data", "Not all nodes transmit at full capacity at the same time", "It uses higher frequencies", "It removes framing"], a: 1, e: "It relies on the statistical burstiness of traffic.", d: 3 }
  ]
},

{
  id: "u4-telecom-mux", unit: "u4", title: "Telecommunication Multiplexing: FDM Channel Groups and the T1 Carrier", minutes: 9,
  summary: "How telephone companies multiplexed voice: the analog FDM hierarchy (group, supergroup, mastergroup) and the digital T1 carrier (24 channels, 1.544 Mbit/s), with E1 for comparison.",
  source: "Unit IV syllabus (slide 4)",
  intro: "<p>Telephone companies needed to carry thousands of calls between exchanges. They built standard multiplexing hierarchies — first analog <b>FDM channel groups</b>, then the digital <b>T1 carrier</b> — and these became the backbone of telephony.</p>",
  definition: "Telecommunication multiplexing combines many voice channels into standard building blocks. In the FDM hierarchy, 12 voice channels form a group, 5 groups form a supergroup, and so on. In the TDM T-carrier system, a T1 line time-multiplexes 24 digitised voice channels into a 1.544 Mbit/s stream.",
  why: "<p>These standards let equipment from different vendors and exchanges interconnect, and they define capacities you still meet today (T1/E1 leased lines, DS0 = 64 kbit/s).</p>",
  how: "<h3>FDM channel groups (analog hierarchy)</h3><div class='table-wrap'><table><thead><tr><th>Level</th><th>Made of</th><th>Voice channels</th><th>Bandwidth</th></tr></thead><tbody>" +
    "<tr><td>Voice channel</td><td>—</td><td>1</td><td>4 kHz (300–3400 Hz speech + guard)</td></tr>" +
    "<tr><td>Group</td><td>12 voice channels</td><td>12</td><td>48 kHz (60–108 kHz)</td></tr>" +
    "<tr><td>Supergroup</td><td>5 groups</td><td>60</td><td>240 kHz (312–552 kHz)</td></tr>" +
    "<tr><td>Mastergroup</td><td>10 supergroups</td><td>600</td><td>~2.52 MHz</td></tr>" +
    "<tr><td>Jumbogroup</td><td>6 mastergroups</td><td>3600</td><td>~16.98 MHz</td></tr></tbody></table></div>" +
    "<p>Each level frequency-shifts its inputs into adjacent bands with guard spaces, then the combined signal is shifted again at the next level.</p>" +
    "<h3>T1 carrier system (digital TDM)</h3><ol class='points'><li>Each analog voice channel is sampled <b>8000 times per second</b> (Nyquist: 2 × 4 kHz).</li><li>Each sample is coded in <b>8 bits</b> (PCM) → 64 kbit/s per channel (a <b>DS0</b>).</li><li>One sample from each of the <b>24 channels</b> forms a frame: 24 × 8 = 192 bits, plus <b>1 framing bit</b> = <b>193 bits</b>.</li><li>8000 frames per second × 193 bits = <b>1.544 Mbit/s</b> (DS1).</li></ol>",
  deep: "<div class='codebox'>T1 frame  = 24 channels × 8 bits + 1 framing bit = 193 bits\nT1 rate   = 193 × 8000 frames/s = 1,544,000 bit/s = 1.544 Mbit/s\nPayload   = 24 × 64 kbit/s = 1.536 Mbit/s;   framing overhead = 8 kbit/s\n\nE1 (Europe, India): 32 timeslots × 8 bits × 8000 = 2.048 Mbit/s\n  (30 voice channels + slot 0 for framing + slot 16 for signalling)</div>" +
    "<div class='table-wrap'><table><thead><tr><th>Digital level</th><th>Rate</th><th>Voice channels</th></tr></thead><tbody><tr><td>DS0</td><td>64 kbit/s</td><td>1</td></tr><tr><td>T1 / DS1</td><td>1.544 Mbit/s</td><td>24</td></tr><tr><td>T2 / DS2</td><td>6.312 Mbit/s</td><td>96</td></tr><tr><td>T3 / DS3</td><td>44.736 Mbit/s</td><td>672</td></tr><tr><td>T4 / DS4</td><td>274.176 Mbit/s</td><td>4032</td></tr></tbody></table></div>" +
    "<p><b>Signalling in T1:</b> “robbed-bit” signalling takes the least significant bit of each channel in every 6th frame for on/off-hook information. Frames are grouped into a superframe (12 frames) or an extended superframe (24 frames). Higher levels include extra stuffing and framing bits, which is why T2 is not exactly 4 × T1.</p>" +
    "<p><b>Note:</b> the ITU (CCITT) analog hierarchy differs above the supergroup — its mastergroup is 5 supergroups (300 channels). The table above follows the AT&T (North American) plan.</p>",
  examples: ["T1 leased lines for businesses (USA)", "E1 links between BSNL exchanges and mobile towers (India)", "Analog L-carrier coaxial trunks carrying mastergroups (historic)", "PBX systems connecting to the telephone network over T1/E1 PRI"],
  terms: [["DS0", "One 64 kbit/s digital voice channel."], ["T1 / DS1", "24-channel 1.544 Mbit/s TDM carrier."], ["E1", "30-channel 2.048 Mbit/s carrier used in Europe and India."], ["Group / supergroup", "12 / 60 voice-channel FDM blocks."], ["Framing bit", "The 193rd bit that marks T1 frame boundaries."]],
  exam: ["FDM hierarchy: group = 12 channels (60–108 kHz); supergroup = 5 groups = 60 channels (312–552 kHz); mastergroup = 10 supergroups = 600 channels.", "T1: 24 channels × 8 bits + 1 framing bit = 193 bits/frame; 8000 frames/s → 1.544 Mbit/s.", "Each voice channel = 8000 samples/s × 8 bits = 64 kbit/s (DS0).", "E1: 32 × 8 × 8000 = 2.048 Mbit/s (30 voice channels)."],
  recap: "Analog: 12 → group, ×5 → supergroup, ×10 → mastergroup. Digital: 24 × 64 kbit/s + 8 kbit/s framing = T1 at 1.544 Mbit/s; E1 = 2.048 Mbit/s.",
  viz: { id: "v-t1", intro: "Build one T1 frame slot by slot, then see how frames stream at 8000 per second." },
  sim: { id: "s-t1", tasks: ["Keep the T1 defaults and confirm 193 bits per frame and 1.544 Mbit/s.", "Change to 32 slots with 0 framing bits. Which carrier do you get?", "Use the FDM side to find how many groups are needed for 600 voice channels."] },
  quiz: [
    { q: "How many voice channels does a T1 carrier multiplex?", o: ["12", "24", "30", "60"], a: 1, e: "T1 carries 24 voice channels.", d: 1 },
    { q: "In the FDM hierarchy, a group contains how many voice channels?", o: ["5", "12", "60", "600"], a: 1, e: "A group = 12 voice channels.", d: 1 },
    { q: "A supergroup is made of:", o: ["5 groups (60 channels)", "10 groups", "24 channels", "12 supergroups"], a: 0, e: "Supergroup = 5 groups = 60 channels.", d: 2 },
    { q: "Why is each voice channel sampled 8000 times per second?", o: ["It is twice the ~4 kHz voice bandwidth (Nyquist)", "Because of 8-bit samples", "To match Ethernet", "Random choice"], a: 0, e: "Nyquist: sampling rate ≥ 2 × highest frequency (4 kHz).", d: 2 },
    { q: "How many bits are in one T1 frame?", o: ["192", "193", "256", "1544"], a: 1, e: "24 × 8 + 1 framing bit = 193 bits.", d: 3 },
    { q: "What is the line rate of an E1 carrier (32 slots × 8 bits × 8000 frames/s)?", o: ["1.544 Mbit/s", "2.048 Mbit/s", "6.312 Mbit/s", "64 kbit/s"], a: 1, e: "32 × 8 × 8000 = 2,048,000 bit/s.", d: 3 }
  ]
},

{
  id: "u4-wdm", unit: "u4", title: "Wavelength Division Multiplexing (WDM)", minutes: 8,
  summary: "FDM for optical fibre: multiple lasers at different wavelengths (lambdas) combined by a prism or grating, carried on one fibre and split at the far end. CWDM vs DWDM.",
  source: "Unit IV slides 39–40",
  intro: "<p>One hair-thin fibre can carry the traffic of an entire city because it carries many <b>colours of light</b> at once. Each colour is an independent channel — that is <b>WDM</b>.</p>",
  definition: "Wavelength Division Multiplexing is the same as FDM but applied to optical fibres, at optical frequencies. Multiple data streams are carried on a single fibre by lasers of different wavelengths (called lambdas), combined at the source and split at the destination, typically by a diffraction grating or prism.",
  why: "<p>Fibre's bandwidth is enormous. WDM unlocks it, multiplying a fibre's capacity by the number of wavelengths without laying new cable. It gives high reliability and very high capacity.</p>",
  how: "<ul class='points'><li>Each signal is placed on its own <b>wavelength</b> using a dedicated laser (transponder).</li><li>A <b>MUX</b> — a diffraction grating or prism — combines the wavelengths onto one fibre.</li><li>The combined light travels the long-distance link.</li><li>A <b>DEMUX</b> splits the light back into separate wavelengths at the destination.</li><li>Each wavelength can carry a <b>different data rate</b> from the others.</li></ul>" +
    "<p>Slide 40 shows Links 1–4 entering transponders 1–4, combined by the MUX, carried on one fibre, separated by the DEMUX into transponders 5–8.</p>",
  compare: { head: ["Feature", "CWDM (coarse)", "DWDM (dense)"], rows: [["Channel spacing", "20 nm", "0.8 nm (100 GHz) or 0.4 nm (50 GHz)"], ["Channels", "Up to 18", "40–96+ in the C-band"], ["Wavelength range", "1271–1611 nm", "~1530–1565 nm (C-band)"], ["Amplification", "Usually none (short reach)", "EDFAs amplify all channels together"], ["Cost / use", "Cheaper — metro and access", "Costlier — long-haul and submarine"]] },
  deep: "<div class='codebox'>Frequency  f = c / λ           1550 nm → ≈ 193.4 THz\nC-band 1530–1565 nm ≈ 4.4 THz of spectrum\nChannels ≈ band / spacing      4.4 THz / 100 GHz ≈ 44 channels   (88 at 50 GHz)\nCapacity = channels × rate per channel\n  44 × 100 Gbit/s ≈ 4.4 Tbit/s per fibre;  with 400G coherent optics → ~17.6 Tbit/s</div>" +
    "<p><b>Why WDM is “FDM for light”:</b> wavelength and frequency are two views of the same thing (f = c/λ), so assigning different wavelengths is assigning different frequency bands. The ITU-T grid (G.694.1) fixes the standard DWDM frequencies, so equipment interoperates.</p>" +
    "<p><b>Building blocks:</b> transponders convert client signals to precise wavelengths; MUX/DEMUX use arrayed waveguide gratings or thin-film filters; EDFAs amplify the entire C-band without separating channels; ROADMs (reconfigurable optical add-drop multiplexers) add or drop individual wavelengths at intermediate sites.</p>",
  examples: ["Submarine cables (e.g. between Mumbai and Europe)", "Metro DWDM rings between city exchanges", "Data-centre interconnect over dark fibre", "FTTH PON using separate up/down wavelengths (1310/1490 nm)"],
  terms: [["Lambda (λ)", "One wavelength channel."], ["Transponder", "Converts a client signal onto a specific wavelength."], ["Diffraction grating / prism", "Combines or separates wavelengths."], ["CWDM / DWDM", "Coarse / dense WDM spacing."], ["ROADM", "Reconfigurable optical add-drop multiplexer."]],
  exam: ["WDM is the same as FDM but applied to fibres; operating frequencies are in the optical range.", "Different wavelength lasers (lambdas) transmit multiple signals on one fibre.", "Combined by a diffraction grating/prism and split at the destination.", "Each signal can have a different rate; high reliability and very high capacity."],
  recap: "WDM = FDM with colours of light. Many lasers → prism/grating MUX → one fibre → DEMUX. Capacity = channels × rate (terabits per fibre).",
  viz: { id: "v-wdm", intro: "Four coloured lasers merge into one fibre and are separated again by the DEMUX." },
  sim: { id: "s-wdm", tasks: ["With 100 GHz spacing in the C-band, how many channels fit? What is the capacity at 100 Gbit/s each?", "Switch to 50 GHz spacing. What happens to the channel count?", "Compare CWDM (20 nm spacing) and DWDM capacities."] },
  quiz: [
    { q: "WDM is used on which medium?", o: ["Twisted pair", "Coaxial cable", "Optical fibre", "Radio"], a: 2, e: "WDM multiplexes wavelengths of light on fibre.", d: 1 },
    { q: "WDM is conceptually the same as:", o: ["TDM", "FDM", "Statistical TDM", "ASK"], a: 1, e: "Wavelengths are frequencies, so WDM is FDM for light.", d: 1 },
    { q: "In WDM, the different wavelength lasers are called:", o: ["Lambdas", "Bigits", "Groups", "Marks"], a: 0, e: "Each wavelength is called a lambda (λ).", d: 2 },
    { q: "Which device combines wavelengths at the WDM source (per the slides)?", o: ["Hub", "Diffraction grating / prism", "Modem", "Repeater"], a: 1, e: "Light passes through a diffraction grating or prism.", d: 2 },
    { q: "A DWDM system has 80 channels at 100 Gbit/s each. Its total capacity is:", o: ["800 Gbit/s", "8 Tbit/s", "80 Tbit/s", "100 Gbit/s"], a: 1, e: "80 × 100 Gbit/s = 8000 Gbit/s = 8 Tbit/s.", d: 3 },
    { q: "Why can an EDFA amplify all DWDM channels together?", o: ["It converts them to electricity", "Its gain covers the whole C-band where the channels sit", "It uses TDM", "It removes guard bands"], a: 1, e: "EDFAs amplify a broad wavelength band at once.", d: 3 }
  ]
}

  ];
  T.forEach(t => { window.TOPICS.push(t); (t.quiz || []).forEach(q => window.QUIZ.push(Object.assign({ t: t.id }, q))); });
})();
