/* Intermediate-level lessons */
window.TOPICS = window.TOPICS || [];
window.TOPICS.push(

{
  id: "osi",
  title: "The OSI Reference Model",
  level: "intermediate",
  minutes: 10,
  summary: "The 7 layers of the OSI model, what each layer does, its data unit, protocols and devices.",
  viz: "osi",
  body: `
<p class="lead">The <b>OSI (Open Systems Interconnection)</b> model, developed by ISO in 1984, divides network communication into <b>seven layers</b>. Each layer has a specific job and talks only to the layers directly above and below it.</p>

<figure class="diagram">
<div class="stack">
<div style="background:#6b46c1">7. Application <small>Data</small></div>
<div style="background:#805ad5">6. Presentation <small>Data</small></div>
<div style="background:#3182ce">5. Session <small>Data</small></div>
<div style="background:#1f6fd1">4. Transport <small>Segment</small></div>
<div style="background:#0b7a5c">3. Network <small>Packet</small></div>
<div style="background:#b7791f">2. Data Link <small>Frame</small></div>
<div style="background:#c53030">1. Physical <small>Bits</small></div>
</div>
<figcaption>Figure: OSI layers and their Protocol Data Units (PDUs)</figcaption>
</figure>

<div class="note tip"><span class="note-title">Memory trick (top to bottom)</span><p><b>A</b>ll <b>P</b>eople <b>S</b>eem <b>T</b>o <b>N</b>eed <b>D</b>ata <b>P</b>rocessing<br>(bottom to top: <b>P</b>lease <b>D</b>o <b>N</b>ot <b>T</b>hrow <b>S</b>ausage <b>P</b>izza <b>A</b>way)</p></div>

<h2>The Seven Layers</h2>
<div class="table-wrap"><table>
<thead><tr><th>#</th><th>Layer</th><th>Main responsibility</th><th>Protocols / Examples</th><th>Devices</th></tr></thead>
<tbody>
<tr><td>7</td><td><b>Application</b></td><td>Provides network services to user applications.</td><td>HTTP, FTP, SMTP, DNS</td><td>Gateway</td></tr>
<tr><td>6</td><td><b>Presentation</b></td><td>Translation, encryption, compression of data.</td><td>SSL/TLS, JPEG, ASCII</td><td>Gateway</td></tr>
<tr><td>5</td><td><b>Session</b></td><td>Establishes, manages and ends sessions; synchronisation.</td><td>NetBIOS, RPC</td><td>Gateway</td></tr>
<tr><td>4</td><td><b>Transport</b></td><td>End-to-end delivery, segmentation, flow &amp; error control, port numbers.</td><td>TCP, UDP</td><td>Firewall</td></tr>
<tr><td>3</td><td><b>Network</b></td><td>Logical addressing (IP) and routing between networks.</td><td>IP, ICMP, OSPF</td><td>Router</td></tr>
<tr><td>2</td><td><b>Data Link</b></td><td>Framing, physical (MAC) addressing, error detection, access control.</td><td>Ethernet, PPP, Wi-Fi (802.11)</td><td>Switch, Bridge</td></tr>
<tr><td>1</td><td><b>Physical</b></td><td>Transmits raw bits over the medium; voltages, cables, connectors.</td><td>RS-232, DSL, USB</td><td>Hub, Repeater</td></tr>
</tbody></table></div>

<h2>Encapsulation</h2>
<p>When data moves <b>down</b> the layers at the sender, each layer adds its own <b>header</b> (and the Data Link layer also adds a <b>trailer</b>). This is called <b>encapsulation</b>. At the receiver, data moves <b>up</b> and each layer removes its header &mdash; <b>decapsulation</b>.</p>
<div class="codebox">Application   :                         [ DATA ]
Transport     :                 [TCP H][ DATA ]          = Segment
Network       :           [IP H][TCP H][ DATA ]          = Packet
Data Link     :    [MAC H][IP H][TCP H][ DATA ][FCS]     = Frame
Physical      :    1011001010110100101...                = Bits</div>

<div class="note info"><span class="note-title">Try it</span><p>Explore every layer and watch encapsulation step by step in the <a href="visualizer.html#osi">OSI Layer visualizer</a> and <a href="visualizer.html#encapsulation">Packet Formation visualizer</a>.</p></div>
`,
  notes: {
    definition: "The OSI model is a 7-layer ISO reference model that standardises network communication functions.",
    points: [
      "Layers (7 to 1): Application, Presentation, Session, Transport, Network, Data Link, Physical.",
      "PDUs: Data (5-7), Segment (4), Packet (3), Frame (2), Bits (1).",
      "Encapsulation adds headers going down; decapsulation removes them going up.",
      "Data Link layer adds both a header and a trailer (FCS)."
    ],
    revision: ["All People Seem To Need Data Processing", "Router = L3, Switch = L2, Hub = L1", "TCP/UDP at Transport (L4)"]
  }
},

{
  id: "tcpip",
  title: "The TCP/IP Model",
  level: "intermediate",
  minutes: 7,
  summary: "The 4-layer model the Internet actually uses, and how it compares with OSI.",
  viz: "encapsulation",
  body: `
<p class="lead">The <b>TCP/IP model</b> is the practical model on which the Internet is built. It was developed by the US Department of Defense (DARPA) and has <b>four layers</b> (some books show five by splitting the bottom layer).</p>

<h2>The Four Layers</h2>
<div class="table-wrap"><table>
<thead><tr><th>TCP/IP Layer</th><th>Function</th><th>Protocols</th></tr></thead>
<tbody>
<tr><td><b>Application</b></td><td>User-facing services; combines OSI layers 5, 6 and 7.</td><td>HTTP, HTTPS, FTP, SMTP, DNS, DHCP, SSH</td></tr>
<tr><td><b>Transport</b></td><td>Process-to-process delivery using port numbers.</td><td>TCP, UDP</td></tr>
<tr><td><b>Internet</b></td><td>Logical addressing and routing of packets across networks.</td><td>IP, ICMP, ARP, IGMP</td></tr>
<tr><td><b>Network Access</b> (Link)</td><td>Physical transmission and framing on the local network.</td><td>Ethernet, Wi-Fi, PPP</td></tr>
</tbody></table></div>

<h2>OSI vs TCP/IP Mapping</h2>
<figure class="diagram">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:520px;margin:0 auto">
<div class="stack" style="max-width:none">
<div style="background:#6b46c1">Application</div><div style="background:#805ad5">Presentation</div><div style="background:#3182ce">Session</div>
<div style="background:#1f6fd1">Transport</div><div style="background:#0b7a5c">Network</div><div style="background:#b7791f">Data Link</div><div style="background:#c53030">Physical</div>
</div>
<div class="stack" style="max-width:none">
<div style="background:#6b46c1;flex:3;align-items:center">Application</div>
<div style="background:#1f6fd1">Transport</div>
<div style="background:#0b7a5c">Internet</div>
<div style="background:#b7791f;flex:2;align-items:center">Network Access</div>
</div>
</div>
<figcaption>Figure: OSI (left) mapped to TCP/IP (right)</figcaption>
</figure>

<h2>OSI vs TCP/IP Comparison</h2>
<div class="table-wrap"><table>
<thead><tr><th>OSI Model</th><th>TCP/IP Model</th></tr></thead>
<tbody>
<tr><td>7 layers</td><td>4 layers</td></tr>
<tr><td>Theoretical reference model</td><td>Practical, implemented model</td></tr>
<tr><td>Model defined before protocols</td><td>Protocols came first, model described them</td></tr>
<tr><td>Separate Presentation and Session layers</td><td>Merged into Application layer</td></tr>
<tr><td>Transport layer guarantees delivery (connection-oriented)</td><td>Transport offers both TCP (reliable) and UDP (unreliable)</td></tr>
</tbody></table></div>

<div class="note fact"><span class="note-title">Did you know?</span><p>TCP/IP was officially adopted by ARPANET on 1 January 1983 &mdash; often called the "birthday of the Internet".</p></div>
`,
  notes: {
    definition: "TCP/IP is the 4-layer practical protocol suite used by the Internet.",
    points: [
      "Layers: Application, Transport, Internet, Network Access.",
      "Application layer = OSI Application + Presentation + Session.",
      "Network Access = OSI Data Link + Physical.",
      "OSI is a reference model; TCP/IP is implemented."
    ],
    compare: { head: ["OSI", "TCP/IP"], rows: [["7 layers", "4 layers"], ["Theoretical", "Practical"], ["Model first", "Protocols first"]] },
    revision: ["TCP/IP adopted 1 Jan 1983", "IP, ICMP, ARP live in the Internet layer"]
  }
},

{
  id: "transmission",
  title: "Data Transmission & Signals",
  level: "intermediate",
  minutes: 9,
  summary: "Analog vs digital signals, bandwidth, bit rate, serial vs parallel, synchronous vs asynchronous transmission and line coding.",
  viz: "signals",
  body: `
<p class="lead">To travel over a medium, data must be converted into <b>signals</b>. Understanding signals helps you understand speed, quality and errors in networks.</p>

<h2>Analog vs Digital Signals</h2>
<div class="table-wrap"><table>
<thead><tr><th>Analog Signal</th><th>Digital Signal</th></tr></thead>
<tbody>
<tr><td>Continuous wave with infinite values</td><td>Discrete values (usually 0 and 1)</td></tr>
<tr><td>Described by amplitude, frequency, phase</td><td>Described by bit rate and bit interval</td></tr>
<tr><td>More affected by noise</td><td>More resistant to noise</td></tr>
<tr><td>Example: human voice, old telephone lines</td><td>Example: computer data, Ethernet</td></tr>
</tbody></table></div>

<h2>Key Terms</h2>
<div class="keyterms">
<div><b>Amplitude</b><span>Height (strength) of the signal.</span></div>
<div><b>Frequency</b><span>Cycles per second, measured in Hertz (Hz).</span></div>
<div><b>Phase</b><span>Position of the wave relative to time 0.</span></div>
<div><b>Bandwidth</b><span>Range of frequencies a channel can carry (Hz), or its capacity (bps).</span></div>
<div><b>Bit rate</b><span>Number of bits sent per second (bps).</span></div>
<div><b>Baud rate</b><span>Number of signal elements per second.</span></div>
<div><b>Throughput</b><span>Actual data rate achieved in practice.</span></div>
<div><b>Latency</b><span>Total time for data to travel from source to destination.</span></div>
</div>

<h2>Serial vs Parallel Transmission</h2>
<ul class="points">
<li><b>Parallel</b> &ndash; multiple bits sent at the same time on multiple wires. Fast but only over short distances (old printer cables, inside the CPU).</li>
<li><b>Serial</b> &ndash; one bit at a time on a single wire. Used for almost all networking (USB, Ethernet).</li>
</ul>

<h2>Asynchronous vs Synchronous</h2>
<ul class="points">
<li><b>Asynchronous</b> &ndash; each byte has a <b>start bit</b> (0) and one or more <b>stop bits</b> (1). Gaps between bytes are allowed. Simple and cheap (keyboard, serial ports).</li>
<li><b>Synchronous</b> &ndash; bits are sent as a continuous stream, kept in step by a shared clock. No start/stop bits, so more efficient (Ethernet, high-speed links).</li>
</ul>

<h2>Line Coding</h2>
<p>Line coding converts binary data into a digital signal. Common schemes:</p>
<div class="table-wrap"><table>
<thead><tr><th>Scheme</th><th>Rule</th></tr></thead>
<tbody>
<tr><td><b>NRZ-L</b></td><td>1 = high voltage, 0 = low voltage.</td></tr>
<tr><td><b>NRZ-I</b></td><td>1 = invert the signal, 0 = no change.</td></tr>
<tr><td><b>Manchester</b></td><td>Transition in the middle of every bit: 0 = high&rarr;low, 1 = low&rarr;high (IEEE 802.3). Self-clocking.</td></tr>
<tr><td><b>Differential Manchester</b></td><td>Always a mid-bit transition; a transition at the start means 0, none means 1.</td></tr>
</tbody></table></div>

<h2>Important Formulas</h2>
<div class="codebox">Nyquist (noiseless channel):  Max bit rate = 2 x B x log2(L)
Shannon (noisy channel):      Capacity C   = B x log2(1 + SNR)

B = bandwidth (Hz), L = number of signal levels, SNR = signal-to-noise ratio

Example: B = 3000 Hz, L = 2  ->  2 x 3000 x 1 = 6000 bps</div>

<div class="note info"><span class="note-title">Try it</span><p>Type any binary pattern into the <a href="visualizer.html#signals">Signal Encoder visualizer</a> and see it drawn as NRZ-L, NRZ-I and Manchester signals.</p></div>
`,
  notes: {
    definition: "Data transmission converts data into analog or digital signals and sends them over a medium.",
    points: [
      "Analog: continuous; Digital: discrete.",
      "Serial: one bit at a time; Parallel: many bits at once (short distance).",
      "Asynchronous uses start/stop bits; Synchronous uses a shared clock.",
      "Line coding: NRZ-L, NRZ-I, Manchester, Differential Manchester."
    ],
    revision: ["Nyquist: 2B log2 L", "Shannon: B log2(1+SNR)", "Manchester is self-clocking"]
  }
},

{
  id: "multiplexing",
  title: "Multiplexing",
  level: "intermediate",
  minutes: 6,
  summary: "Sharing one link among many signals: FDM, TDM and WDM.",
  viz: null,
  body: `
<p class="lead"><b>Multiplexing</b> lets multiple signals share a single communication link. A <b>multiplexer (MUX)</b> combines them at the sender, and a <b>demultiplexer (DEMUX)</b> separates them at the receiver.</p>

<figure class="diagram">
<div class="flow">
<div style="display:flex;flex-direction:column;gap:4px"><span class="node">Signal 1</span><span class="node">Signal 2</span><span class="node">Signal 3</span></div>
<span class="arrow">&rarr;</span><span class="node b">MUX</span>
<span class="arrow">&mdash;&mdash; 1 link &mdash;&mdash;&rarr;</span>
<span class="node b">DEMUX</span><span class="arrow">&rarr;</span>
<div style="display:flex;flex-direction:column;gap:4px"><span class="node">Signal 1</span><span class="node">Signal 2</span><span class="node">Signal 3</span></div>
</div>
<figcaption>Figure: Multiplexing many signals onto one link</figcaption>
</figure>

<h2>Types of Multiplexing</h2>
<h3>1. Frequency Division Multiplexing (FDM)</h3>
<p>Each signal gets its own <b>frequency band</b>. All signals are sent at the same time. Guard bands separate channels to prevent overlap. <i>Example:</i> FM radio stations, cable TV channels.</p>

<h3>2. Time Division Multiplexing (TDM)</h3>
<p>Each signal gets the <b>whole bandwidth</b> but only for a short <b>time slot</b>, taking turns in rotation.</p>
<ul class="points">
<li><b>Synchronous TDM</b> &ndash; every device gets a fixed slot, even if it has nothing to send (wastes slots).</li>
<li><b>Statistical TDM</b> &ndash; slots are given only to devices that have data (more efficient).</li>
</ul>

<h3>3. Wavelength Division Multiplexing (WDM)</h3>
<p>Used in fibre optics. Different signals use different <b>wavelengths (colours) of light</b> on the same fibre. Conceptually the same as FDM, but for light.</p>

<div class="table-wrap"><table>
<thead><tr><th>Type</th><th>Shares</th><th>Signal type</th><th>Example</th></tr></thead>
<tbody>
<tr><td>FDM</td><td>Frequency</td><td>Analog</td><td>Radio, TV</td></tr>
<tr><td>TDM</td><td>Time</td><td>Digital</td><td>Telephone trunks (T1/E1)</td></tr>
<tr><td>WDM</td><td>Wavelength</td><td>Optical</td><td>Fibre backbones</td></tr>
</tbody></table></div>
`,
  notes: {
    definition: "Multiplexing combines multiple signals onto a single shared link.",
    points: [
      "MUX combines; DEMUX separates.",
      "FDM: different frequencies, simultaneous (analog).",
      "TDM: different time slots (digital); synchronous vs statistical.",
      "WDM: different light wavelengths on fibre."
    ],
    revision: ["FDM = frequency, TDM = time, WDM = wavelength", "Guard bands prevent overlap in FDM"]
  }
},

{
  id: "switching",
  title: "Circuit, Packet & Message Switching",
  level: "intermediate",
  minutes: 8,
  summary: "How data finds a path through a network: circuit switching, packet switching (datagram and virtual circuit), and message switching.",
  viz: "switching",
  body: `
<p class="lead">In a large network, devices are not directly connected. <b>Switching</b> is the technique used to route data through intermediate nodes from source to destination.</p>

<h2>1. Circuit Switching</h2>
<p>A <b>dedicated path</b> is established between sender and receiver before any data is sent, and stays reserved for the whole conversation.</p>
<p>Three phases: <b>Setup &rarr; Data transfer &rarr; Teardown</b>.</p>
<ul class="points"><li><b>Pros:</b> guaranteed bandwidth, constant delay, data arrives in order.</li><li><b>Cons:</b> wastes resources when idle; setup takes time.</li></ul>
<p><i>Example:</i> traditional landline telephone network (PSTN).</p>

<h2>2. Packet Switching</h2>
<p>Data is broken into small <b>packets</b>. Each packet travels independently and is reassembled at the destination. No dedicated path; links are shared.</p>
<h3>Datagram approach</h3>
<p>Each packet is routed independently and may take a different path. Packets may arrive <b>out of order</b>. This is how IP on the Internet works.</p>
<h3>Virtual Circuit approach</h3>
<p>A logical path is set up first, and all packets follow it in order, but resources are still shared. Example: MPLS, older ATM and Frame Relay.</p>

<h2>3. Message Switching</h2>
<p>The whole message is sent hop by hop using <b>store-and-forward</b>: each node stores the complete message, then forwards it. Used in old telegraph systems; mostly obsolete now.</p>

<h2>Comparison</h2>
<div class="table-wrap"><table>
<thead><tr><th>Feature</th><th>Circuit</th><th>Packet (Datagram)</th><th>Message</th></tr></thead>
<tbody>
<tr><td>Dedicated path</td><td>Yes</td><td>No</td><td>No</td></tr>
<tr><td>Setup needed</td><td>Yes</td><td>No</td><td>No</td></tr>
<tr><td>Bandwidth use</td><td>Wasteful</td><td>Efficient</td><td>Efficient</td></tr>
<tr><td>Ordering</td><td>In order</td><td>May be out of order</td><td>In order</td></tr>
<tr><td>Example</td><td>Telephone</td><td>Internet</td><td>Telegraph</td></tr>
</tbody></table></div>

<div class="note info"><span class="note-title">Try it</span><p>Race circuit switching against packet switching in the <a href="visualizer.html#switching">Switching visualizer</a> and watch packets take different paths.</p></div>
`,
  notes: {
    definition: "Switching is the method of forwarding data through intermediate nodes in a network.",
    points: [
      "Circuit switching: dedicated path; setup, transfer, teardown (telephone).",
      "Packet switching: data split into packets; datagram (independent) or virtual circuit (fixed logical path).",
      "Message switching: store-and-forward of whole messages."
    ],
    revision: ["Internet = datagram packet switching", "Circuit = guaranteed bandwidth but wasteful"]
  }
},

{
  id: "errors",
  title: "Error Detection & Correction",
  level: "intermediate",
  minutes: 9,
  summary: "Single-bit and burst errors, parity, checksum, CRC and Hamming code.",
  viz: null,
  body: `
<p class="lead">Noise and interference can flip bits during transmission. The Data Link and Transport layers use <b>redundant bits</b> to detect &mdash; and sometimes correct &mdash; these errors.</p>

<h2>Types of Errors</h2>
<ul class="points">
<li><b>Single-bit error</b> &ndash; only one bit is changed. <code>00110110 &rarr; 00100110</code></li>
<li><b>Burst error</b> &ndash; two or more bits in a row are changed. More common in real networks.</li>
</ul>

<h2>1. Parity Check</h2>
<p>An extra <b>parity bit</b> is added so that the total number of 1s is even (<b>even parity</b>) or odd (<b>odd parity</b>).</p>
<div class="codebox">Data:  1011001   (four 1s)
Even parity bit = 0  -> 10110010
Odd  parity bit = 1  -> 10110011</div>
<p>Simple parity detects all single-bit errors but <b>fails if an even number of bits flip</b>. <b>2-D parity</b> (rows and columns) improves this.</p>

<h2>2. Checksum</h2>
<p>The sender divides data into equal segments, adds them using 1's complement arithmetic, and sends the complement of the sum (the checksum). The receiver adds everything including the checksum; if the result is all 1s (complement = 0), the data is accepted. Used in IP, TCP and UDP headers.</p>

<h2>3. Cyclic Redundancy Check (CRC)</h2>
<p>The most powerful common detection method, used in Ethernet and Wi-Fi frames.</p>
<ol class="points">
<li>Sender and receiver agree on a <b>generator (divisor)</b>, e.g. <code>1101</code>.</li>
<li>Append (divisor length &minus; 1) zeros to the data.</li>
<li>Divide using <b>modulo-2 (XOR)</b> division. The remainder is the CRC.</li>
<li>Replace the appended zeros with the CRC and send.</li>
<li>Receiver divides by the same generator: remainder 0 = no error.</li>
</ol>
<div class="codebox">Data = 100100, Generator = 1101
Append 3 zeros: 100100000
Divide (XOR) ... remainder = 001
Transmitted codeword: 100100001</div>

<h2>4. Hamming Code (Error Correction)</h2>
<p>Hamming code can <b>detect and correct single-bit errors</b>. Parity bits are placed at positions that are powers of 2 (1, 2, 4, 8, ...). The number of parity bits <i>r</i> must satisfy:</p>
<div class="codebox">2^r >= m + r + 1      (m = number of data bits)

Example: m = 4  ->  r = 3  (since 2^3 = 8 >= 4 + 3 + 1)</div>
<p>At the receiver, recomputing the parity bits gives a binary number (the <b>syndrome</b>) that points to the exact position of the wrong bit.</p>

<div class="table-wrap"><table>
<thead><tr><th>Method</th><th>Detects</th><th>Corrects</th><th>Used in</th></tr></thead>
<tbody>
<tr><td>Simple parity</td><td>Odd number of bit errors</td><td>No</td><td>Serial ports, memory</td></tr>
<tr><td>Checksum</td><td>Most errors</td><td>No</td><td>IP, TCP, UDP</td></tr>
<tr><td>CRC</td><td>Almost all burst errors</td><td>No</td><td>Ethernet, Wi-Fi</td></tr>
<tr><td>Hamming</td><td>Up to 2-bit errors</td><td>1-bit errors</td><td>ECC memory</td></tr>
</tbody></table></div>

<div class="note info"><span class="note-title">Practise</span><p>Try the <a href="exercises.html#parity">Parity Calculator</a> in Practical Exercises.</p></div>
`,
  notes: {
    definition: "Error detection adds redundant bits so the receiver can tell if data was corrupted; correction can also fix it.",
    points: [
      "Single-bit vs burst errors.",
      "Parity: even/odd; fails for even number of flipped bits.",
      "Checksum: 1's complement sum; used by IP/TCP/UDP.",
      "CRC: modulo-2 division; used by Ethernet.",
      "Hamming: corrects single-bit errors; 2^r >= m + r + 1."
    ],
    revision: ["CRC uses XOR division", "Hamming parity bits at positions 1, 2, 4, 8..."]
  }
},

{
  id: "ip-addressing",
  title: "IP Addressing (IPv4 & IPv6)",
  level: "intermediate",
  minutes: 10,
  summary: "IPv4 structure, classes A–E, private addresses, special addresses, and an introduction to IPv6.",
  viz: null,
  body: `
<p class="lead">An <b>IP address</b> is a logical address that uniquely identifies a device on a network &mdash; like a postal address for your computer.</p>

<h2>IPv4 Address Structure</h2>
<p>An IPv4 address is <b>32 bits</b> long, written as four decimal numbers (octets) separated by dots. Each octet is 0&ndash;255.</p>
<div class="codebox">Dotted decimal : 192.168.1.10
Binary         : 11000000.10101000.00000001.00001010
Total addresses: 2^32 = about 4.3 billion</div>
<p>Every address has two parts: the <b>Network ID</b> (which network) and the <b>Host ID</b> (which device on that network).</p>

<h2>Classful Addressing</h2>
<div class="table-wrap"><table>
<thead><tr><th>Class</th><th>First octet</th><th>Leading bits</th><th>Default mask</th><th>Networks / Hosts</th><th>Use</th></tr></thead>
<tbody>
<tr><td><b>A</b></td><td>1 &ndash; 126</td><td>0</td><td>255.0.0.0 (/8)</td><td>126 / 16,777,214</td><td>Very large networks</td></tr>
<tr><td><b>B</b></td><td>128 &ndash; 191</td><td>10</td><td>255.255.0.0 (/16)</td><td>16,384 / 65,534</td><td>Medium networks</td></tr>
<tr><td><b>C</b></td><td>192 &ndash; 223</td><td>110</td><td>255.255.255.0 (/24)</td><td>2,097,152 / 254</td><td>Small networks</td></tr>
<tr><td><b>D</b></td><td>224 &ndash; 239</td><td>1110</td><td>&mdash;</td><td>&mdash;</td><td>Multicast</td></tr>
<tr><td><b>E</b></td><td>240 &ndash; 255</td><td>1111</td><td>&mdash;</td><td>&mdash;</td><td>Experimental</td></tr>
</tbody></table></div>
<div class="note warn"><span class="note-title">Note</span><p>127.x.x.x is reserved for <b>loopback</b> (127.0.0.1 = "this computer"), which is why Class A stops at 126.</p></div>

<h2>Private IP Ranges</h2>
<p>These addresses are used inside homes and organisations and are not routed on the public Internet. A router uses <b>NAT</b> to translate them to a public IP.</p>
<div class="table-wrap"><table>
<thead><tr><th>Class</th><th>Private range</th></tr></thead>
<tbody>
<tr><td>A</td><td>10.0.0.0 &ndash; 10.255.255.255</td></tr>
<tr><td>B</td><td>172.16.0.0 &ndash; 172.31.255.255</td></tr>
<tr><td>C</td><td>192.168.0.0 &ndash; 192.168.255.255</td></tr>
</tbody></table></div>

<h2>Special Addresses</h2>
<ul class="points">
<li><b>Network address</b> &ndash; host bits all 0 (e.g. 192.168.1.0). Identifies the network itself.</li>
<li><b>Broadcast address</b> &ndash; host bits all 1 (e.g. 192.168.1.255). Sends to every host on the network.</li>
<li><b>Loopback</b> &ndash; 127.0.0.1.</li>
<li><b>0.0.0.0</b> &ndash; "this host / any address" (default route).</li>
</ul>

<h2>IPv6</h2>
<p>IPv4 addresses are running out. <b>IPv6</b> uses <b>128-bit</b> addresses written as eight groups of four hex digits:</p>
<div class="codebox">2001:0db8:0000:0000:0000:ff00:0042:8329
Shortened: 2001:db8::ff00:42:8329

Total addresses: 2^128 = about 3.4 x 10^38</div>
<div class="table-wrap"><table>
<thead><tr><th>Feature</th><th>IPv4</th><th>IPv6</th></tr></thead>
<tbody>
<tr><td>Size</td><td>32 bits</td><td>128 bits</td></tr>
<tr><td>Format</td><td>Dotted decimal</td><td>Hexadecimal with colons</td></tr>
<tr><td>Header</td><td>20&ndash;60 bytes, has checksum</td><td>Fixed 40 bytes, no checksum</td></tr>
<tr><td>Configuration</td><td>Manual or DHCP</td><td>Auto-configuration (SLAAC) or DHCPv6</td></tr>
<tr><td>Broadcast</td><td>Yes</td><td>No (uses multicast)</td></tr>
</tbody></table></div>

<div class="note info"><span class="note-title">Practise</span><p>Use the <a href="exercises.html#ipclass">IP Class Identifier</a> and <a href="exercises.html#binary">Binary Converter</a> exercises.</p></div>
`,
  notes: {
    definition: "An IP address is a logical address that identifies a host on a network. IPv4 = 32 bits, IPv6 = 128 bits.",
    points: [
      "IPv4: four octets, each 0-255. Network ID + Host ID.",
      "Class A 1-126, B 128-191, C 192-223, D 224-239 (multicast), E 240-255.",
      "Private: 10/8, 172.16/12, 192.168/16.",
      "127.0.0.1 = loopback."
    ],
    compare: { head: ["Class", "Range", "Default mask"], rows: [["A", "1-126", "/8"], ["B", "128-191", "/16"], ["C", "192-223", "/24"]] },
    revision: ["Usable hosts = 2^h - 2", "IPv6 has no broadcast"]
  }
},

{
  id: "subnetting",
  title: "Subnetting & CIDR",
  level: "intermediate",
  minutes: 12,
  summary: "Subnet masks, CIDR notation, and a step-by-step method to calculate network, broadcast and host ranges.",
  viz: null,
  body: `
<p class="lead"><b>Subnetting</b> divides one large network into smaller networks (subnets). This improves security, reduces broadcast traffic and uses IP addresses efficiently.</p>

<h2>Subnet Mask</h2>
<p>A subnet mask is a 32-bit number where the <b>1s mark the network part</b> and the <b>0s mark the host part</b>.</p>
<div class="codebox">IP address : 192.168.10.75   = 11000000.10101000.00001010.01001011
Subnet mask: 255.255.255.0   = 11111111.11111111.11111111.00000000
AND result : 192.168.10.0    = network address</div>

<h2>CIDR Notation</h2>
<p><b>CIDR</b> (Classless Inter-Domain Routing) writes the mask as a slash followed by the number of network bits: <code>192.168.10.0/24</code>. CIDR replaced classful addressing so networks can be any size.</p>
<div class="table-wrap"><table>
<thead><tr><th>CIDR</th><th>Subnet mask</th><th>Total addresses</th><th>Usable hosts</th></tr></thead>
<tbody>
<tr><td>/24</td><td>255.255.255.0</td><td>256</td><td>254</td></tr>
<tr><td>/25</td><td>255.255.255.128</td><td>128</td><td>126</td></tr>
<tr><td>/26</td><td>255.255.255.192</td><td>64</td><td>62</td></tr>
<tr><td>/27</td><td>255.255.255.224</td><td>32</td><td>30</td></tr>
<tr><td>/28</td><td>255.255.255.240</td><td>16</td><td>14</td></tr>
<tr><td>/29</td><td>255.255.255.248</td><td>8</td><td>6</td></tr>
<tr><td>/30</td><td>255.255.255.252</td><td>4</td><td>2</td></tr>
</tbody></table></div>

<h2>Key Formulas</h2>
<div class="codebox">Number of subnets      = 2^(borrowed bits)
Addresses per subnet   = 2^(host bits)
Usable hosts           = 2^(host bits) - 2     (minus network and broadcast)
Block size             = 256 - (interesting octet of the mask)</div>

<h2>Worked Example</h2>
<div class="note example">
<span class="note-title">Find the network, broadcast and host range of 192.168.1.130/26</span>
<ol class="points">
<li>/26 &rarr; mask 255.255.255.<b>192</b>. Host bits = 32 &minus; 26 = 6.</li>
<li>Block size = 256 &minus; 192 = <b>64</b>. Subnets start at .0, .64, .128, .192.</li>
<li>130 falls in the block starting at <b>.128</b>.</li>
<li>Network address = <b>192.168.1.128</b></li>
<li>Broadcast address = next block &minus; 1 = <b>192.168.1.191</b></li>
<li>Usable hosts = <b>192.168.1.129 &ndash; 192.168.1.190</b> (2^6 &minus; 2 = 62 hosts)</li>
</ol>
</div>

<h2>Designing Subnets</h2>
<div class="note example">
<span class="note-title">A company has 192.168.5.0/24 and needs 4 departments</span>
<p>Borrow 2 bits (2^2 = 4 subnets) &rarr; /26. Each subnet has 62 usable hosts.</p>
<div class="codebox">Subnet 1: 192.168.5.0/26    hosts .1   - .62   broadcast .63
Subnet 2: 192.168.5.64/26   hosts .65  - .126  broadcast .127
Subnet 3: 192.168.5.128/26  hosts .129 - .190  broadcast .191
Subnet 4: 192.168.5.192/26  hosts .193 - .254  broadcast .255</div>
</div>

<div class="note info"><span class="note-title">Practise</span><p>Use the interactive <a href="exercises.html#subnet">Subnet Calculator Challenge</a> to check your answers for any IP and prefix.</p></div>
`,
  notes: {
    definition: "Subnetting divides a network into smaller logical networks by borrowing host bits for the network part.",
    points: [
      "Mask: 1s = network, 0s = host. Network address = IP AND mask.",
      "CIDR /n = n network bits.",
      "Usable hosts = 2^h - 2.",
      "Block size = 256 - mask octet."
    ],
    compare: { head: ["CIDR", "Mask", "Usable hosts"], rows: [["/24", "255.255.255.0", "254"], ["/25", ".128", "126"], ["/26", ".192", "62"], ["/27", ".224", "30"], ["/28", ".240", "14"], ["/30", ".252", "2"]] },
    revision: ["Broadcast = next network - 1", "/30 is used for point-to-point router links"]
  }
},

{
  id: "mac-arp",
  title: "MAC Addresses & ARP",
  level: "intermediate",
  minutes: 6,
  summary: "Physical (MAC) addresses, how they differ from IP addresses, and how ARP connects the two.",
  viz: null,
  body: `
<p class="lead">A <b>MAC (Media Access Control) address</b> is a unique hardware address burned into every network interface card. It is used for delivery <b>within the same local network</b>.</p>

<h2>MAC Address Format</h2>
<div class="codebox">Format : 48 bits, written as 6 pairs of hex digits
Example: 00:1A:2B:3C:4D:5E   (or 00-1A-2B-3C-4D-5E)

First 24 bits  = OUI (manufacturer ID)
Last  24 bits  = device-specific number
Broadcast MAC  = FF:FF:FF:FF:FF:FF</div>

<h2>MAC vs IP Address</h2>
<div class="table-wrap"><table>
<thead><tr><th>Feature</th><th>MAC Address</th><th>IP Address</th></tr></thead>
<tbody>
<tr><td>Layer</td><td>Data Link (2)</td><td>Network (3)</td></tr>
<tr><td>Size</td><td>48 bits</td><td>32 bits (IPv4) / 128 bits (IPv6)</td></tr>
<tr><td>Assigned by</td><td>Manufacturer</td><td>Network admin or DHCP</td></tr>
<tr><td>Changes?</td><td>Fixed (can be spoofed)</td><td>Changes when you move networks</td></tr>
<tr><td>Scope</td><td>Local network delivery</td><td>End-to-end across networks</td></tr>
<tr><td>Analogy</td><td>Your name</td><td>Your home address</td></tr>
</tbody></table></div>

<h2>ARP &mdash; Address Resolution Protocol</h2>
<p>A computer knows the destination's IP address but needs its MAC address to build a frame. <b>ARP</b> finds it:</p>
<ol class="points">
<li>Host A checks its <b>ARP cache</b>. If the MAC is not there&hellip;</li>
<li>A broadcasts an <b>ARP Request</b> to FF:FF:FF:FF:FF:FF: "Who has 192.168.1.20? Tell 192.168.1.10."</li>
<li>Every host receives it; only the host with 192.168.1.20 replies.</li>
<li>Host B sends a unicast <b>ARP Reply</b>: "192.168.1.20 is at 00:1A:2B:3C:4D:5E."</li>
<li>A stores this in its ARP cache and sends the frame.</li>
</ol>
<div class="note tip"><span class="note-title">Try it on your PC</span><p>Open Command Prompt and type <code>arp -a</code> to see your ARP cache, or <code>ipconfig /all</code> to see your own MAC address.</p></div>
<div class="note warn"><span class="note-title">Security</span><p><b>ARP spoofing</b> is an attack where a malicious host sends fake ARP replies to intercept traffic. Switches with Dynamic ARP Inspection help prevent it.</p></div>
`,
  notes: {
    definition: "A MAC address is a 48-bit hardware address used for local delivery; ARP maps IP addresses to MAC addresses.",
    points: [
      "MAC: 6 hex pairs; first 24 bits = OUI (manufacturer).",
      "Broadcast MAC = FF:FF:FF:FF:FF:FF.",
      "ARP Request is broadcast; ARP Reply is unicast.",
      "RARP did the reverse (MAC to IP), now replaced by DHCP."
    ],
    revision: ["MAC = Layer 2, IP = Layer 3", "Command: arp -a"]
  }
}

);
