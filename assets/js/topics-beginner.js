/* Beginner-level lessons. Each topic is rendered by tutorials.js and notes.js. */
window.TOPICS = window.TOPICS || [];
window.TOPICS.push(

{
  id: "intro",
  title: "Introduction to Data Communication",
  level: "beginner",
  minutes: 6,
  summary: "What data communication is, why it matters, and the qualities every communication system needs.",
  viz: null,
  body: `
<p class="lead">Data communication is the exchange of data between two devices through some form of transmission medium, such as a wire, a fibre-optic cable or radio waves.</p>

<p>Every time you send a WhatsApp message, open a website, or stream a video, data travels from one device to another. The rules, hardware and techniques that make this possible are what we study in <b>Data Communication</b>.</p>

<h2>A Real-World Example</h2>
<div class="note example">
<span class="note-title">Example: Sending a message to a friend</span>
<p>You type <i>"Hi!"</i> on your phone. Your phone converts the letters into binary (0s and 1s), wraps them in packets, and sends them as radio waves to a cell tower. The tower forwards them over fibre-optic cables, through many routers, to your friend's network. Their phone reassembles the packets and shows <i>"Hi!"</i> on screen &mdash; usually in less than a second.</p>
</div>

<h2>Four Fundamental Characteristics</h2>
<p>The effectiveness of a data communication system depends on four things:</p>
<div class="table-wrap"><table>
<thead><tr><th>Characteristic</th><th>Meaning</th><th>Example of failure</th></tr></thead>
<tbody>
<tr><td><b>Delivery</b></td><td>Data must reach the correct destination.</td><td>An email delivered to the wrong person.</td></tr>
<tr><td><b>Accuracy</b></td><td>Data must arrive without errors.</td><td>A bank transfer of 1000 arriving as 9000.</td></tr>
<tr><td><b>Timeliness</b></td><td>Data must arrive on time. Late video or audio is useless.</td><td>A live video call that lags by 10 seconds.</td></tr>
<tr><td><b>Jitter</b></td><td>The variation in packet arrival time should be small.</td><td>Choppy audio because packets arrive unevenly.</td></tr>
</tbody></table></div>

<h2>Why Study Data Communication?</h2>
<ul class="points">
<li>It is the foundation of the Internet, mobile networks, banking, cloud computing and IoT.</li>
<li>Every software developer eventually needs to understand how their application talks over a network.</li>
<li>Network engineering, cybersecurity and cloud careers all build on these concepts.</li>
</ul>

<div class="note tip"><span class="note-title">Tip</span><p>Don't try to memorise everything at once. Follow the lessons in order &mdash; each one builds on the previous.</p></div>

<h2>Key Terms</h2>
<div class="keyterms">
<div><b>Data</b><span>Facts or information in a form agreed by the communicating parties.</span></div>
<div><b>Signal</b><span>The electrical, light or radio form that carries data.</span></div>
<div><b>Network</b><span>A set of devices connected by communication links.</span></div>
<div><b>Protocol</b><span>A set of rules that governs communication.</span></div>
</div>
`,
  notes: {
    definition: "Data communication is the exchange of data between two devices via a transmission medium.",
    points: [
      "Four characteristics: Delivery, Accuracy, Timeliness, Jitter.",
      "Data is converted into signals (electrical, light, radio) for transmission.",
      "It is the foundation of the Internet, mobile networks and cloud computing."
    ],
    revision: ["Delivery = right destination", "Accuracy = no errors", "Timeliness = on time", "Jitter = uneven delay (should be low)"]
  }
},

{
  id: "components",
  title: "Components of Data Communication",
  level: "beginner",
  minutes: 5,
  summary: "The five components every communication system has: message, sender, receiver, medium and protocol.",
  viz: "transmission",
  body: `
<p class="lead">A data communication system is made up of five components. If any one is missing, communication cannot happen.</p>

<figure class="diagram">
<div class="flow">
<span class="node">Sender</span><span class="arrow">&rarr;</span>
<span class="node b">Message (via Medium)</span><span class="arrow">&rarr;</span>
<span class="node">Receiver</span>
</div>
<p class="muted" style="margin:10px 0 0;font-size:.9rem">Both sides follow the same <b>Protocol</b></p>
<figcaption>Figure: The five components of data communication</figcaption>
</figure>

<h2>The Five Components</h2>
<ol class="points">
<li><b>Message</b> &ndash; the information to be communicated: text, numbers, images, audio or video.</li>
<li><b>Sender</b> &ndash; the device that sends the message: a computer, phone, camera, sensor, etc.</li>
<li><b>Receiver</b> &ndash; the device that receives the message.</li>
<li><b>Transmission Medium</b> &ndash; the physical path the message travels on: twisted-pair cable, coaxial cable, fibre optics, or radio waves.</li>
<li><b>Protocol</b> &ndash; a set of rules that both sender and receiver agree on. Without a protocol, two devices may be connected but still unable to understand each other.</li>
</ol>

<div class="note example">
<span class="note-title">Analogy: A phone call</span>
<p>You (sender) speak words (message) through the phone line (medium) to your friend (receiver). You both speak the same language and take turns talking (protocol). If your friend only spoke a language you don't, the call would connect but communication would fail &mdash; that's what happens without a shared protocol.</p>
</div>

<h2>Elements of a Protocol</h2>
<div class="table-wrap"><table>
<thead><tr><th>Element</th><th>Defines</th></tr></thead>
<tbody>
<tr><td><b>Syntax</b></td><td>The structure or format of data &mdash; e.g. the first 8 bits are the address, the next 8 are the length.</td></tr>
<tr><td><b>Semantics</b></td><td>The meaning of each section of bits &mdash; what action to take based on them.</td></tr>
<tr><td><b>Timing</b></td><td>When data should be sent and how fast.</td></tr>
</tbody></table></div>

<div class="note info"><span class="note-title">Try it</span><p>Open the <a href="visualizer.html#transmission">Data Transmission visualizer</a> to watch a message travel from sender to receiver as bits.</p></div>
`,
  notes: {
    definition: "Five components: Message, Sender, Receiver, Transmission Medium, Protocol.",
    points: [
      "Protocol = rules for communication; has three elements: Syntax, Semantics, Timing.",
      "Medium can be guided (cables) or unguided (wireless).",
      "Connected devices can't communicate without a common protocol."
    ],
    revision: ["M-S-R-M-P: Message, Sender, Receiver, Medium, Protocol", "Protocol = Syntax + Semantics + Timing"]
  }
},

{
  id: "data-flow",
  title: "Data Representation & Data Flow",
  level: "beginner",
  minutes: 6,
  summary: "How text, numbers, images and audio are represented, and the three directions data can flow.",
  viz: "transmission",
  body: `
<p class="lead">Before data can travel, it must be represented in a form computers understand &mdash; binary. Then it flows in one of three modes: simplex, half-duplex or full-duplex.</p>

<h2>Data Representation</h2>
<div class="table-wrap"><table>
<thead><tr><th>Type</th><th>How it is represented</th></tr></thead>
<tbody>
<tr><td>Text</td><td>Bit patterns called codes, e.g. ASCII (7 bits) or Unicode/UTF-8 (variable, up to 32 bits).</td></tr>
<tr><td>Numbers</td><td>Directly converted to binary, e.g. 13 = <code>1101</code>.</td></tr>
<tr><td>Images</td><td>A matrix of pixels; each pixel is a bit pattern (e.g. 24-bit RGB colour).</td></tr>
<tr><td>Audio</td><td>A continuous signal that is sampled and converted to digital values.</td></tr>
<tr><td>Video</td><td>A sequence of images (frames) plus audio.</td></tr>
</tbody></table></div>

<div class="codebox">Letter 'A'  -> ASCII 65 -> binary 01000001
Letter 'B'  -> ASCII 66 -> binary 01000010
Text "Hi"   -> 01001000 01101001</div>

<h2>Data Flow (Transmission Modes)</h2>

<h3>1. Simplex</h3>
<p>Communication is <b>one-way only</b>. One device always sends, the other always receives.</p>
<p><i>Examples:</i> keyboard to computer, TV broadcast, FM radio.</p>

<h3>2. Half-Duplex</h3>
<p>Both devices can send and receive, but <b>not at the same time</b>. When one sends, the other must wait.</p>
<p><i>Examples:</i> walkie-talkie ("over!"), old Ethernet hubs.</p>

<h3>3. Full-Duplex</h3>
<p>Both devices can send and receive <b>simultaneously</b>. The link capacity is shared or split between the two directions.</p>
<p><i>Examples:</i> telephone call, modern switched Ethernet, video calls.</p>

<figure class="diagram">
<div style="display:grid;gap:10px;max-width:520px;margin:0 auto;text-align:left">
<div class="flow"><span class="node">A</span><span class="arrow">&mdash;&mdash;&mdash;&rarr;</span><span class="node">B</span><span class="muted" style="width:110px">Simplex</span></div>
<div class="flow"><span class="node b">A</span><span class="arrow">&larr; or &rarr;</span><span class="node b">B</span><span class="muted" style="width:110px">Half-duplex</span></div>
<div class="flow"><span class="node v">A</span><span class="arrow">&larr; and &rarr;</span><span class="node v">B</span><span class="muted" style="width:110px">Full-duplex</span></div>
</div>
<figcaption>Figure: The three data flow modes</figcaption>
</figure>

<div class="note tip"><span class="note-title">Memory trick</span><p><b>Simplex</b> = Single direction. <b>Half</b> = Hold on, my turn. <b>Full</b> = Free to talk together.</p></div>
`,
  notes: {
    definition: "Data flow (transmission mode) describes the direction of data between two devices.",
    points: [
      "Text uses codes like ASCII (7-bit) and Unicode.",
      "Simplex: one-way (keyboard, TV).",
      "Half-duplex: two-way, one at a time (walkie-talkie).",
      "Full-duplex: two-way simultaneously (telephone)."
    ],
    compare: { head: ["Mode", "Direction", "Example"], rows: [["Simplex", "One way", "Keyboard, Radio"], ["Half-duplex", "Both, alternately", "Walkie-talkie"], ["Full-duplex", "Both, simultaneously", "Phone call"]] },
    revision: ["ASCII 'A' = 65 = 01000001", "Simplex -> Half -> Full: increasing flexibility"]
  }
},

{
  id: "network-types",
  title: "Computer Networks & Network Types",
  level: "beginner",
  minutes: 7,
  summary: "What a network is, the client-server and peer-to-peer models, and PAN, LAN, MAN and WAN.",
  viz: "clientserver",
  body: `
<p class="lead">A computer network is a set of devices (called <b>nodes</b>) connected by communication links so they can share data and resources.</p>

<h2>Why Build Networks?</h2>
<ul class="points">
<li><b>Resource sharing</b> &ndash; share printers, files, and an Internet connection.</li>
<li><b>Communication</b> &ndash; email, chat, video conferencing.</li>
<li><b>Centralised data</b> &ndash; one database that everyone uses.</li>
<li><b>Reliability</b> &ndash; backup copies on multiple machines.</li>
</ul>

<h2>Network Criteria</h2>
<p>A good network is judged by <b>Performance</b> (throughput and delay), <b>Reliability</b> (how often it fails and how fast it recovers) and <b>Security</b> (protection from unauthorised access).</p>

<h2>Network Models</h2>
<h3>Client-Server</h3>
<p>Dedicated <b>servers</b> provide services (web pages, files, email). <b>Clients</b> request them. Example: your browser (client) asking google.com (server) for a page.</p>
<h3>Peer-to-Peer (P2P)</h3>
<p>Every computer is equal and can act as both client and server. Example: BitTorrent file sharing, or two laptops sharing files directly.</p>

<h2>Types of Networks by Size</h2>
<div class="table-wrap"><table>
<thead><tr><th>Type</th><th>Full Form</th><th>Range</th><th>Example</th></tr></thead>
<tbody>
<tr><td><b>PAN</b></td><td>Personal Area Network</td><td>~10 metres</td><td>Bluetooth earbuds connected to your phone</td></tr>
<tr><td><b>LAN</b></td><td>Local Area Network</td><td>A room, building or campus (up to ~1 km)</td><td>Your college computer lab, home Wi-Fi</td></tr>
<tr><td><b>MAN</b></td><td>Metropolitan Area Network</td><td>A city (~5&ndash;50 km)</td><td>Cable TV network, city-wide Wi-Fi</td></tr>
<tr><td><b>WAN</b></td><td>Wide Area Network</td><td>Countries / continents</td><td>The Internet, bank networks across India</td></tr>
</tbody></table></div>

<div class="note fact"><span class="note-title">Did you know?</span><p>The Internet is not one network &mdash; it is a "network of networks": tens of thousands of independent networks (ISPs, universities, companies) connected together.</p></div>

<div class="note info"><span class="note-title">Try it</span><p>See a request travel from client to server in the <a href="visualizer.html#clientserver">Client-Server visualizer</a>.</p></div>
`,
  notes: {
    definition: "A computer network is a collection of interconnected nodes that share data and resources.",
    points: [
      "Criteria: Performance, Reliability, Security.",
      "Client-server: centralised servers provide services to clients.",
      "Peer-to-peer: every node is both client and server.",
      "By size: PAN < LAN < MAN < WAN."
    ],
    compare: { head: ["Type", "Range", "Example"], rows: [["PAN", "~10 m", "Bluetooth"], ["LAN", "Building/campus", "College lab"], ["MAN", "City", "Cable TV"], ["WAN", "Country/world", "Internet"]] },
    revision: ["Internet = network of networks", "P2P: no central server"]
  }
},

{
  id: "topologies",
  title: "Network Topologies",
  level: "beginner",
  minutes: 8,
  summary: "Bus, star, ring, mesh, tree and hybrid topologies — their layouts, advantages and disadvantages.",
  viz: "topology",
  body: `
<p class="lead">Topology is the <b>physical or logical arrangement</b> of devices and links in a network &mdash; the "shape" of the network.</p>

<h2>1. Bus Topology</h2>
<p>All devices are connected to a single central cable called the <b>backbone</b>. Data sent by one device travels along the bus and every device sees it; only the addressed device accepts it. Terminators at both ends stop signals reflecting.</p>
<ul class="points"><li><b>Pros:</b> cheap, uses the least cable, easy to install.</li><li><b>Cons:</b> if the backbone breaks the whole network fails; collisions increase with more devices.</li></ul>

<h2>2. Star Topology</h2>
<p>Every device connects to a central <b>hub or switch</b>. This is the most common topology in modern LANs.</p>
<ul class="points"><li><b>Pros:</b> one cable failure affects only one device; easy to add devices and troubleshoot.</li><li><b>Cons:</b> if the central switch fails, the whole network fails; needs more cable than bus.</li></ul>

<h2>3. Ring Topology</h2>
<p>Each device connects to exactly two neighbours, forming a circle. Data travels around the ring (usually one direction), passing through each device. A <b>token</b> is often used to decide who can send.</p>
<ul class="points"><li><b>Pros:</b> no collisions; equal access for all devices.</li><li><b>Cons:</b> one broken link can break the ring (unless dual ring is used); adding devices disrupts the network.</li></ul>

<h2>4. Mesh Topology</h2>
<p>Every device has a dedicated point-to-point link to every other device. In a full mesh of <i>n</i> devices:</p>
<div class="codebox">Number of links  = n(n - 1) / 2
Ports per device = n - 1

Example: 5 devices -> 5 x 4 / 2 = 10 links</div>
<ul class="points"><li><b>Pros:</b> very reliable and secure; no traffic problems; a failed link doesn't affect others.</li><li><b>Cons:</b> very expensive and cabling-heavy.</li></ul>

<h2>5. Tree (Hierarchical) Topology</h2>
<p>A combination of star topologies connected in a hierarchy &mdash; like a family tree. Common in large organisations and campuses.</p>

<h2>6. Hybrid Topology</h2>
<p>A mix of two or more topologies, e.g. star-ring or star-bus. The Internet itself is a giant hybrid.</p>

<h2>Comparison</h2>
<div class="table-wrap"><table>
<thead><tr><th>Topology</th><th>Cost</th><th>Reliability</th><th>Single point of failure</th></tr></thead>
<tbody>
<tr><td>Bus</td><td>Low</td><td>Low</td><td>Backbone cable</td></tr>
<tr><td>Star</td><td>Medium</td><td>Medium-High</td><td>Central hub/switch</td></tr>
<tr><td>Ring</td><td>Medium</td><td>Low-Medium</td><td>Any link (single ring)</td></tr>
<tr><td>Mesh</td><td>High</td><td>Very High</td><td>None</td></tr>
<tr><td>Tree</td><td>Medium-High</td><td>Medium</td><td>Root node</td></tr>
</tbody></table></div>

<div class="note info"><span class="note-title">Try it</span><p>Open the <a href="visualizer.html#topology">Topology visualizer</a>: pick a topology, send a packet, then <b>break a link</b> to see how each one handles failure.</p></div>
`,
  notes: {
    definition: "Topology is the geometric arrangement of nodes and links in a network.",
    points: [
      "Bus: single backbone, cheap, backbone failure = network down.",
      "Star: central switch, most common in LANs.",
      "Ring: each node connected to two neighbours; token passing.",
      "Mesh: every node to every node, links = n(n-1)/2.",
      "Tree: hierarchy of stars. Hybrid: mix of topologies."
    ],
    revision: ["Mesh links formula: n(n-1)/2", "Most reliable: Mesh. Most common: Star. Cheapest: Bus."]
  }
},

{
  id: "media",
  title: "Transmission Media",
  level: "beginner",
  minutes: 8,
  summary: "Guided media (twisted pair, coaxial, fibre) and unguided media (radio, microwave, infrared).",
  viz: null,
  body: `
<p class="lead">A transmission medium is the physical path between sender and receiver. It is divided into <b>guided</b> (wired) and <b>unguided</b> (wireless) media.</p>

<figure class="diagram">
<div class="flow"><span class="node">Transmission Media</span></div>
<div class="flow" style="margin-top:10px"><span class="node b">Guided (Wired)</span><span class="node v">Unguided (Wireless)</span></div>
<div class="flow" style="margin-top:10px;font-size:.88rem">
<span class="muted">Twisted Pair &middot; Coaxial &middot; Fibre Optic</span>
<span class="muted" style="margin-left:30px">Radio &middot; Microwave &middot; Infrared</span></div>
<figcaption>Figure: Classification of transmission media</figcaption>
</figure>

<h2>Guided Media</h2>
<h3>Twisted-Pair Cable</h3>
<p>Two insulated copper wires twisted together. Twisting reduces electromagnetic interference (noise) and crosstalk.</p>
<ul class="points">
<li><b>UTP</b> (Unshielded Twisted Pair) &ndash; cheap, flexible, used in Ethernet LANs (Cat5e, Cat6).</li>
<li><b>STP</b> (Shielded Twisted Pair) &ndash; has a metal foil shield; better noise protection, more expensive.</li>
</ul>

<h3>Coaxial Cable</h3>
<p>A central copper conductor, surrounded by insulation, a metal shield, and an outer cover. Higher bandwidth than twisted pair. Used in cable TV and older Ethernet.</p>

<h3>Fibre-Optic Cable</h3>
<p>Transmits data as <b>light pulses</b> through a thin glass or plastic core, using <b>total internal reflection</b>.</p>
<ul class="points">
<li><b>Single-mode</b> &ndash; very thin core, one light path, long distances (100+ km).</li>
<li><b>Multi-mode</b> &ndash; thicker core, many light paths, shorter distances (up to ~2 km).</li>
<li>Immune to electromagnetic interference, very high bandwidth, hard to tap (secure).</li>
</ul>

<h2>Unguided Media</h2>
<div class="table-wrap"><table>
<thead><tr><th>Type</th><th>Frequency</th><th>Features</th><th>Uses</th></tr></thead>
<tbody>
<tr><td><b>Radio waves</b></td><td>3 kHz &ndash; 1 GHz</td><td>Omnidirectional, penetrate walls</td><td>FM radio, AM radio, TV</td></tr>
<tr><td><b>Microwaves</b></td><td>1 &ndash; 300 GHz</td><td>Unidirectional, need line-of-sight</td><td>Satellite, mobile networks, Wi-Fi</td></tr>
<tr><td><b>Infrared</b></td><td>300 GHz &ndash; 400 THz</td><td>Short range, cannot pass through walls</td><td>TV remotes, short-range links</td></tr>
</tbody></table></div>

<h2>Comparison of Guided Media</h2>
<div class="table-wrap"><table>
<thead><tr><th>Feature</th><th>Twisted Pair</th><th>Coaxial</th><th>Fibre Optic</th></tr></thead>
<tbody>
<tr><td>Signal</td><td>Electrical</td><td>Electrical</td><td>Light</td></tr>
<tr><td>Bandwidth</td><td>Low-Medium</td><td>Medium-High</td><td>Very High</td></tr>
<tr><td>Noise immunity</td><td>Low</td><td>Medium</td><td>Excellent</td></tr>
<tr><td>Cost</td><td>Cheapest</td><td>Moderate</td><td>Highest</td></tr>
<tr><td>Distance</td><td>~100 m</td><td>~500 m</td><td>Many km</td></tr>
</tbody></table></div>

<div class="note fact"><span class="note-title">Did you know?</span><p>Over 95% of international Internet traffic travels through undersea fibre-optic cables, not satellites.</p></div>
`,
  notes: {
    definition: "Transmission media is the physical path for data; guided (wired) or unguided (wireless).",
    points: [
      "Twisted pair: UTP and STP; twisting reduces noise. Used in Ethernet.",
      "Coaxial: central conductor + shield; cable TV.",
      "Fibre optic: light, total internal reflection; single-mode and multi-mode.",
      "Unguided: radio (omnidirectional), microwave (line-of-sight), infrared (short range)."
    ],
    compare: { head: ["Medium", "Signal", "Bandwidth", "Noise immunity"], rows: [["Twisted pair", "Electrical", "Low", "Low"], ["Coaxial", "Electrical", "Medium", "Medium"], ["Fibre", "Light", "Very high", "Excellent"]] },
    revision: ["Fibre works by total internal reflection", "Microwave needs line-of-sight"]
  }
},

{
  id: "devices",
  title: "Network Devices",
  level: "beginner",
  minutes: 8,
  summary: "Hubs, repeaters, bridges, switches, routers, gateways, modems and access points — and which layer each works at.",
  viz: null,
  body: `
<p class="lead">Network devices connect computers together and move data between them. Each device works at a particular layer of the OSI model.</p>

<h2>Common Devices</h2>
<div class="table-wrap"><table>
<thead><tr><th>Device</th><th>OSI Layer</th><th>What it does</th></tr></thead>
<tbody>
<tr><td><b>Repeater</b></td><td>1 &ndash; Physical</td><td>Regenerates a weak signal so it can travel further.</td></tr>
<tr><td><b>Hub</b></td><td>1 &ndash; Physical</td><td>A multiport repeater. Sends incoming data out of <i>every</i> port. Not intelligent.</td></tr>
<tr><td><b>Bridge</b></td><td>2 &ndash; Data Link</td><td>Connects two LAN segments and filters traffic using MAC addresses.</td></tr>
<tr><td><b>Switch</b></td><td>2 &ndash; Data Link</td><td>A multiport bridge. Learns MAC addresses and forwards frames only to the correct port.</td></tr>
<tr><td><b>Router</b></td><td>3 &ndash; Network</td><td>Connects different networks and forwards packets using IP addresses and routing tables.</td></tr>
<tr><td><b>Gateway</b></td><td>All layers (often 4&ndash;7)</td><td>Connects networks that use different protocols, translating between them.</td></tr>
<tr><td><b>Modem</b></td><td>1 &ndash; Physical</td><td>MOdulator-DEModulator: converts digital data to analog signals and back.</td></tr>
<tr><td><b>Access Point</b></td><td>2 &ndash; Data Link</td><td>Lets wireless devices join a wired network (Wi-Fi).</td></tr>
<tr><td><b>NIC</b></td><td>1&ndash;2</td><td>Network Interface Card; gives a device its MAC address and physical connection.</td></tr>
</tbody></table></div>

<h2>Hub vs Switch vs Router</h2>
<div class="note example">
<span class="note-title">Analogy: Delivering a letter in an office</span>
<p><b>Hub</b>: shouts the letter's contents to everyone in the room &mdash; only the right person keeps it.<br>
<b>Switch</b>: knows everyone's desk and walks the letter directly to the right person.<br>
<b>Router</b>: the post office &mdash; it sends letters between different buildings and cities.</p>
</div>

<div class="table-wrap"><table>
<thead><tr><th>Feature</th><th>Hub</th><th>Switch</th><th>Router</th></tr></thead>
<tbody>
<tr><td>Layer</td><td>Physical</td><td>Data Link</td><td>Network</td></tr>
<tr><td>Address used</td><td>None</td><td>MAC</td><td>IP</td></tr>
<tr><td>Transmission</td><td>Broadcast to all</td><td>Unicast to one port</td><td>Between networks</td></tr>
<tr><td>Collision domains</td><td>1 for all ports</td><td>1 per port</td><td>1 per port</td></tr>
<tr><td>Broadcast domains</td><td>1</td><td>1</td><td>1 per interface</td></tr>
</tbody></table></div>

<div class="note tip"><span class="note-title">Exam tip</span><p>Switches break up <b>collision domains</b>; routers break up <b>broadcast domains</b>. This is a very common exam question.</p></div>
`,
  notes: {
    definition: "Network devices connect nodes and forward data; each operates at a specific OSI layer.",
    points: [
      "Layer 1: Repeater, Hub, Modem.",
      "Layer 2: Bridge, Switch, Access Point (use MAC addresses).",
      "Layer 3: Router (uses IP addresses).",
      "Gateway: protocol translator, can work at all layers."
    ],
    compare: { head: ["Device", "Layer", "Address"], rows: [["Hub", "1", "None"], ["Switch", "2", "MAC"], ["Router", "3", "IP"]] },
    revision: ["Switch splits collision domains", "Router splits broadcast domains", "Modem = modulator + demodulator"]
  }
}

);
