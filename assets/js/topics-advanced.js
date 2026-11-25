/* Advanced-level lessons */
window.TOPICS = window.TOPICS || [];
window.TOPICS.push(

{
  id: "routing",
  title: "Routing & Routing Protocols",
  level: "advanced",
  minutes: 10,
  summary: "Routing tables, static vs dynamic routing, distance vector (RIP) and link state (OSPF), and BGP.",
  viz: "routing",
  body: `
<p class="lead"><b>Routing</b> is the process of choosing the best path for a packet to travel from its source network to its destination network. Routers make this decision using a <b>routing table</b>.</p>

<h2>The Routing Table</h2>
<div class="codebox">Destination       Next Hop        Interface   Metric
192.168.1.0/24    directly conn.  eth0        0
10.0.0.0/8        192.168.1.254   eth0        2
172.16.5.0/24     10.1.1.2        eth1        3
0.0.0.0/0         203.0.113.1     eth2        1     &lt;- default route</div>
<p>For each packet, the router finds the entry with the <b>longest prefix match</b> for the destination IP and forwards it to the next hop. If nothing matches, it uses the <b>default route</b>.</p>

<h2>Static vs Dynamic Routing</h2>
<div class="table-wrap"><table>
<thead><tr><th>Static Routing</th><th>Dynamic Routing</th></tr></thead>
<tbody>
<tr><td>Routes entered manually by an administrator</td><td>Routers learn routes automatically from each other</td></tr>
<tr><td>Does not adapt to failures</td><td>Adapts when links fail or change</td></tr>
<tr><td>No CPU/bandwidth overhead</td><td>Uses bandwidth for routing updates</td></tr>
<tr><td>Good for small, simple networks</td><td>Essential for large networks</td></tr>
</tbody></table></div>

<h2>Distance Vector Routing</h2>
<p>Each router shares its <b>entire routing table</b> with its <b>neighbours</b> periodically. It only knows the distance (cost) and direction (vector) to each network &mdash; "routing by rumour".</p>
<ul class="points">
<li>Uses the <b>Bellman-Ford</b> algorithm.</li>
<li>Example: <b>RIP</b> (Routing Information Protocol) &mdash; metric is <b>hop count</b>, maximum 15 hops (16 = unreachable), updates every 30 seconds.</li>
<li>Problem: slow convergence and the <b>count-to-infinity</b> problem (fixed with split horizon, route poisoning).</li>
</ul>

<h2>Link State Routing</h2>
<p>Each router learns the <b>complete topology</b> of the network by flooding <b>Link State Advertisements (LSAs)</b>, then computes the shortest path to every destination itself.</p>
<ul class="points">
<li>Uses <b>Dijkstra's</b> shortest path algorithm.</li>
<li>Example: <b>OSPF</b> (Open Shortest Path First) &mdash; metric is cost based on bandwidth; supports areas; fast convergence.</li>
</ul>

<h2>Path Vector Routing &mdash; BGP</h2>
<p><b>BGP</b> (Border Gateway Protocol) routes traffic <b>between autonomous systems</b> (e.g. between ISPs). It is the protocol that holds the whole Internet together. It chooses paths based on policies and AS-path length.</p>

<div class="table-wrap"><table>
<thead><tr><th>Protocol</th><th>Type</th><th>Algorithm</th><th>Metric</th><th>Used</th></tr></thead>
<tbody>
<tr><td>RIP</td><td>Distance vector</td><td>Bellman-Ford</td><td>Hop count (max 15)</td><td>Small networks</td></tr>
<tr><td>OSPF</td><td>Link state</td><td>Dijkstra</td><td>Cost (bandwidth)</td><td>Enterprise networks</td></tr>
<tr><td>BGP</td><td>Path vector</td><td>Best path selection</td><td>Policies, AS path</td><td>Between ISPs (Internet)</td></tr>
</tbody></table></div>

<div class="note info"><span class="note-title">Try it</span><p>Use the <a href="visualizer.html#routing">Routing visualizer</a> to run Dijkstra's algorithm on a network, change link costs, and watch the shortest path update.</p></div>
`,
  notes: {
    definition: "Routing is selecting the best path for packets across networks using a routing table.",
    points: [
      "Longest prefix match decides the route; default route 0.0.0.0/0.",
      "Static: manual. Dynamic: learned automatically.",
      "Distance vector (RIP): Bellman-Ford, hop count, max 15.",
      "Link state (OSPF): Dijkstra, cost metric, fast convergence.",
      "BGP: path vector, between autonomous systems."
    ],
    compare: { head: ["Protocol", "Type", "Algorithm"], rows: [["RIP", "Distance vector", "Bellman-Ford"], ["OSPF", "Link state", "Dijkstra"], ["BGP", "Path vector", "Policy-based"]] },
    revision: ["RIP: 16 hops = unreachable", "IGP = inside AS (RIP, OSPF); EGP = between AS (BGP)"]
  }
},

{
  id: "switching-vlan",
  title: "Switching, MAC Tables & VLANs",
  level: "advanced",
  minutes: 8,
  summary: "How switches learn and forward frames, CSMA/CD, Spanning Tree Protocol, and VLANs.",
  viz: "switchlearn",
  body: `
<p class="lead">A <b>switch</b> connects devices in a LAN and forwards frames intelligently using a <b>MAC address table</b> (also called a CAM table).</p>

<h2>How a Switch Learns</h2>
<ol class="points">
<li><b>Learn:</b> When a frame arrives, the switch records the <b>source MAC</b> and the port it came from.</li>
<li><b>Lookup:</b> It looks up the <b>destination MAC</b> in its table.</li>
<li><b>Forward:</b> If found, it sends the frame out of that one port only.</li>
<li><b>Flood:</b> If not found (or it's a broadcast), it sends the frame out of every port except the incoming one.</li>
<li><b>Filter:</b> If the destination is on the same port it came from, the frame is dropped.</li>
</ol>
<div class="codebox">MAC Address Table
Port   MAC Address          Age
Fa0/1  00:1A:2B:00:00:01    12s
Fa0/2  00:1A:2B:00:00:02    40s
Fa0/3  00:1A:2B:00:00:03    3s</div>

<h2>Switching Methods</h2>
<ul class="points">
<li><b>Store-and-forward</b> &ndash; receives the whole frame, checks CRC, then forwards. Reliable.</li>
<li><b>Cut-through</b> &ndash; forwards as soon as the destination MAC is read. Fastest, but may forward bad frames.</li>
<li><b>Fragment-free</b> &ndash; reads the first 64 bytes before forwarding. A compromise.</li>
</ul>

<h2>CSMA/CD and CSMA/CA</h2>
<p><b>CSMA/CD</b> (Carrier Sense Multiple Access with Collision Detection) was used in shared Ethernet: listen before sending; if a collision is detected, send a jam signal and wait a random backoff time. In modern full-duplex switched Ethernet, collisions don't happen.</p>
<p><b>CSMA/CA</b> (Collision Avoidance) is used in Wi-Fi, where collisions can't be detected reliably. Devices wait and may use RTS/CTS messages before sending.</p>

<h2>Spanning Tree Protocol (STP)</h2>
<p>Redundant links between switches improve reliability but can create <b>loops</b>, causing broadcast storms. <b>STP (IEEE 802.1D)</b> elects a root bridge and blocks redundant ports so that only one active path exists, while keeping backup links ready.</p>

<h2>VLANs (Virtual LANs)</h2>
<p>A <b>VLAN</b> splits one physical switch into multiple <b>logical networks</b>. Devices in different VLANs cannot talk directly &mdash; they need a router (or Layer 3 switch).</p>
<ul class="points">
<li>Each VLAN is its own <b>broadcast domain</b>.</li>
<li>Improves <b>security</b> (separate departments) and <b>performance</b> (less broadcast traffic).</li>
<li><b>Access port</b>: belongs to one VLAN. <b>Trunk port</b>: carries many VLANs, using <b>IEEE 802.1Q</b> tags.</li>
</ul>
<div class="note example"><span class="note-title">Example</span><p>In a college, one switch might carry VLAN 10 (Students), VLAN 20 (Faculty) and VLAN 30 (Admin). Students can't see admin traffic even though they share the same hardware.</p></div>

<div class="note info"><span class="note-title">Try it</span><p>Send frames between PCs in the <a href="visualizer.html#switchlearn">Switch Learning visualizer</a> and watch the MAC table fill up.</p></div>
`,
  notes: {
    definition: "A switch forwards frames by MAC address using a learned MAC address table; VLANs logically split a switch into separate networks.",
    points: [
      "Switch actions: learn (source), forward, flood (unknown/broadcast), filter.",
      "Methods: store-and-forward, cut-through, fragment-free.",
      "CSMA/CD = Ethernet (wired); CSMA/CA = Wi-Fi.",
      "STP prevents loops by blocking redundant ports.",
      "VLAN = separate broadcast domain; trunks use 802.1Q tags."
    ],
    revision: ["Switch learns from SOURCE MAC", "Inter-VLAN traffic needs a router"]
  }
},

{
  id: "tcp-udp",
  title: "Transport Layer: TCP vs UDP",
  level: "advanced",
  minutes: 10,
  summary: "Port numbers, the TCP three-way handshake, flow and congestion control, and when to use UDP.",
  viz: "handshake",
  body: `
<p class="lead">The Transport layer delivers data <b>process-to-process</b>, i.e. to the right application on a computer. It uses <b>port numbers</b> to do this.</p>

<h2>Port Numbers</h2>
<p>A port is a 16-bit number (0&ndash;65535). IP address + port = <b>socket</b> (e.g. 142.250.1.1:443).</p>
<div class="table-wrap"><table>
<thead><tr><th>Range</th><th>Name</th></tr></thead>
<tbody>
<tr><td>0 &ndash; 1023</td><td>Well-known ports (HTTP 80, HTTPS 443, SSH 22)</td></tr>
<tr><td>1024 &ndash; 49151</td><td>Registered ports (MySQL 3306)</td></tr>
<tr><td>49152 &ndash; 65535</td><td>Dynamic / ephemeral (client side)</td></tr>
</tbody></table></div>

<h2>TCP &mdash; Transmission Control Protocol</h2>
<p>TCP is <b>connection-oriented</b> and <b>reliable</b>. It guarantees that data arrives complete, in order, and without duplicates.</p>
<h3>Three-Way Handshake</h3>
<div class="codebox">Client                                Server
  |  ---- SYN (seq = x) ------------->  |
  |  &lt;--- SYN-ACK (seq = y, ack = x+1)  |
  |  ---- ACK (ack = y+1) ------------>  |
  |      Connection established         |</div>
<p>Connection termination uses a four-way exchange: FIN &rarr; ACK &rarr; FIN &rarr; ACK.</p>

<h3>TCP Features</h3>
<ul class="points">
<li><b>Sequence numbers & acknowledgements</b> &ndash; every byte is numbered; the receiver confirms what it got.</li>
<li><b>Retransmission</b> &ndash; lost segments are re-sent after a timeout.</li>
<li><b>Flow control</b> &ndash; the <b>sliding window</b> stops a fast sender overwhelming a slow receiver.</li>
<li><b>Congestion control</b> &ndash; slow start, congestion avoidance, fast retransmit reduce sending when the network is busy.</li>
</ul>

<h2>UDP &mdash; User Datagram Protocol</h2>
<p>UDP is <b>connectionless</b> and <b>unreliable</b> but very <b>fast</b>. No handshake, no acknowledgements, no ordering. Its header is only 8 bytes.</p>
<p>It is ideal when speed matters more than perfection: live video, online gaming, voice calls, DNS lookups.</p>

<h2>TCP vs UDP</h2>
<div class="table-wrap"><table>
<thead><tr><th>Feature</th><th>TCP</th><th>UDP</th></tr></thead>
<tbody>
<tr><td>Connection</td><td>Connection-oriented</td><td>Connectionless</td></tr>
<tr><td>Reliability</td><td>Guaranteed delivery</td><td>No guarantee</td></tr>
<tr><td>Ordering</td><td>In order</td><td>No ordering</td></tr>
<tr><td>Header size</td><td>20&ndash;60 bytes</td><td>8 bytes</td></tr>
<tr><td>Speed</td><td>Slower</td><td>Faster</td></tr>
<tr><td>Flow/Congestion control</td><td>Yes</td><td>No</td></tr>
<tr><td>Used by</td><td>HTTP, HTTPS, FTP, SMTP, SSH</td><td>DNS, DHCP, VoIP, streaming, gaming</td></tr>
</tbody></table></div>

<div class="note example"><span class="note-title">Analogy</span><p><b>TCP</b> is a registered courier: tracked, signed for, re-sent if lost. <b>UDP</b> is shouting across a room: fast, but if someone misses a word, you don't repeat it.</p></div>

<div class="note info"><span class="note-title">Try it</span><p>Watch the <a href="visualizer.html#handshake">TCP Handshake visualizer</a> and compare it with UDP's "just send it" approach.</p></div>
`,
  notes: {
    definition: "TCP is a reliable connection-oriented transport protocol; UDP is a fast connectionless one.",
    points: [
      "Socket = IP + port. Ports 0-1023 are well-known.",
      "TCP handshake: SYN, SYN-ACK, ACK. Termination: FIN, ACK, FIN, ACK.",
      "TCP: sequence numbers, ACKs, retransmission, sliding window, congestion control.",
      "UDP: 8-byte header, no handshake; used for DNS, streaming, gaming."
    ],
    compare: { head: ["Feature", "TCP", "UDP"], rows: [["Connection", "Yes", "No"], ["Reliable", "Yes", "No"], ["Header", "20 B", "8 B"], ["Speed", "Slower", "Faster"]] },
    revision: ["HTTP 80, HTTPS 443, FTP 20/21, SSH 22, SMTP 25, DNS 53, DHCP 67/68"]
  }
},

{
  id: "dns",
  title: "DNS — Domain Name System",
  level: "advanced",
  minutes: 8,
  summary: "How domain names are translated to IP addresses: hierarchy, resolvers, recursive vs iterative queries and record types.",
  viz: "dns",
  body: `
<p class="lead"><b>DNS</b> is the "phonebook of the Internet". It translates human-friendly domain names like <code>www.example.com</code> into IP addresses like <code>93.184.216.34</code>.</p>

<h2>The DNS Hierarchy</h2>
<figure class="diagram">
<div class="flow"><span class="node v">Root ( . )</span></div>
<div class="flow" style="margin-top:8px"><span class="node b">.com</span><span class="node b">.org</span><span class="node b">.in</span><span class="node b">.edu</span></div>
<div class="flow" style="margin-top:8px"><span class="node">example.com</span><span class="node">google.com</span></div>
<div class="flow" style="margin-top:8px"><span class="node">www.example.com</span></div>
<figcaption>Figure: Root &rarr; Top-Level Domain (TLD) &rarr; Second-level domain &rarr; Host</figcaption>
</figure>

<h2>Types of DNS Servers</h2>
<ul class="points">
<li><b>Recursive resolver</b> &ndash; usually provided by your ISP or a public service (e.g. 8.8.8.8). Does the lookup work for you.</li>
<li><b>Root name servers</b> &ndash; 13 logical root servers (with hundreds of copies worldwide); they point to TLD servers.</li>
<li><b>TLD servers</b> &ndash; handle .com, .org, .in etc.; they point to authoritative servers.</li>
<li><b>Authoritative name server</b> &ndash; holds the actual records for a domain.</li>
</ul>

<h2>How a DNS Lookup Works</h2>
<ol class="points">
<li>You type <code>www.example.com</code>. The browser checks its cache, then the OS cache.</li>
<li>The query goes to the <b>recursive resolver</b>.</li>
<li>The resolver asks a <b>root server</b> &rarr; "Ask the .com TLD server."</li>
<li>The resolver asks the <b>.com TLD server</b> &rarr; "Ask example.com's authoritative server."</li>
<li>The resolver asks the <b>authoritative server</b> &rarr; "www.example.com is 93.184.216.34."</li>
<li>The resolver returns the IP to your computer and caches it for the record's <b>TTL</b>.</li>
</ol>
<p>Your computer to resolver is a <b>recursive</b> query (give me the final answer). Resolver to other servers are <b>iterative</b> queries (give me the best referral you have).</p>

<h2>Common DNS Record Types</h2>
<div class="table-wrap"><table>
<thead><tr><th>Record</th><th>Purpose</th><th>Example</th></tr></thead>
<tbody>
<tr><td><b>A</b></td><td>Domain &rarr; IPv4 address</td><td>example.com &rarr; 93.184.216.34</td></tr>
<tr><td><b>AAAA</b></td><td>Domain &rarr; IPv6 address</td><td>example.com &rarr; 2606:2800::1</td></tr>
<tr><td><b>CNAME</b></td><td>Alias to another name</td><td>www &rarr; example.com</td></tr>
<tr><td><b>MX</b></td><td>Mail server for the domain</td><td>mail.example.com</td></tr>
<tr><td><b>NS</b></td><td>Authoritative name servers</td><td>ns1.example.com</td></tr>
<tr><td><b>TXT</b></td><td>Text data (verification, SPF)</td><td>"v=spf1 ..."</td></tr>
<tr><td><b>PTR</b></td><td>Reverse lookup: IP &rarr; name</td><td>34.216.184.93.in-addr.arpa</td></tr>
</tbody></table></div>

<div class="note tip"><span class="note-title">Try it on your PC</span><p>Run <code>nslookup google.com</code> in Command Prompt to perform a DNS lookup yourself.</p></div>
<div class="note info"><span class="note-title">Try it</span><p>Step through a full lookup in the <a href="visualizer.html#dns">DNS Resolution visualizer</a>.</p></div>
`,
  notes: {
    definition: "DNS is a distributed hierarchical system that maps domain names to IP addresses.",
    points: [
      "Hierarchy: Root -> TLD -> Authoritative.",
      "Client to resolver = recursive; resolver to servers = iterative.",
      "Records: A, AAAA, CNAME, MX, NS, TXT, PTR.",
      "Uses UDP port 53 (TCP 53 for large responses / zone transfers)."
    ],
    revision: ["A = IPv4, AAAA = IPv6, MX = mail", "TTL controls caching time"]
  }
},

{
  id: "dhcp",
  title: "DHCP — Dynamic Host Configuration",
  level: "advanced",
  minutes: 6,
  summary: "How devices get an IP address automatically using the DORA process.",
  viz: "dhcp",
  body: `
<p class="lead"><b>DHCP</b> automatically gives devices their network settings when they join a network &mdash; no manual configuration needed.</p>

<h2>What DHCP Provides</h2>
<ul class="points">
<li>IP address</li>
<li>Subnet mask</li>
<li>Default gateway (router)</li>
<li>DNS server address(es)</li>
<li>Lease time (how long the address can be used)</li>
</ul>

<h2>The DORA Process</h2>
<div class="table-wrap"><table>
<thead><tr><th>Step</th><th>Message</th><th>From &rarr; To</th><th>Type</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td>1</td><td><b>D</b>iscover</td><td>Client &rarr; All</td><td>Broadcast</td><td>"Is there a DHCP server out there?"</td></tr>
<tr><td>2</td><td><b>O</b>ffer</td><td>Server &rarr; Client</td><td>Broadcast/Unicast</td><td>"You can use 192.168.1.50."</td></tr>
<tr><td>3</td><td><b>R</b>equest</td><td>Client &rarr; All</td><td>Broadcast</td><td>"I'd like 192.168.1.50, please."</td></tr>
<tr><td>4</td><td><b>A</b>cknowledge</td><td>Server &rarr; Client</td><td>Broadcast/Unicast</td><td>"Confirmed. It's yours for 24 hours."</td></tr>
</tbody></table></div>
<p>The client starts with IP <code>0.0.0.0</code> and sends to <code>255.255.255.255</code> because it doesn't have an address yet. DHCP uses <b>UDP port 67</b> (server) and <b>68</b> (client).</p>

<h2>Lease Renewal</h2>
<p>At 50% of the lease time, the client tries to renew directly with the server. If no response, at 87.5% it broadcasts a renewal. If the lease expires, it starts DORA again.</p>

<div class="note warn"><span class="note-title">APIPA</span><p>If Windows can't reach a DHCP server, it assigns itself an address in <code>169.254.x.x</code>. Seeing this address usually means DHCP failed.</p></div>
<div class="note info"><span class="note-title">Try it</span><p>Watch DORA happen in the <a href="visualizer.html#dhcp">DHCP visualizer</a>.</p></div>
`,
  notes: {
    definition: "DHCP automatically assigns IP configuration (IP, mask, gateway, DNS) to hosts.",
    points: [
      "DORA: Discover, Offer, Request, Acknowledge.",
      "Server port 67, client port 68 (UDP).",
      "Lease renewal at 50% (T1) and 87.5% (T2).",
      "APIPA 169.254.x.x = DHCP failed."
    ],
    revision: ["Discover is broadcast from 0.0.0.0 to 255.255.255.255"]
  }
},

{
  id: "http",
  title: "HTTP & HTTPS",
  level: "advanced",
  minutes: 9,
  summary: "Requests and responses, methods, status codes, headers, and how HTTPS secures the web with TLS.",
  viz: "clientserver",
  body: `
<p class="lead"><b>HTTP (HyperText Transfer Protocol)</b> is the application-layer protocol of the World Wide Web. A client (browser) sends a <b>request</b> and a server sends back a <b>response</b>.</p>

<h2>An HTTP Request</h2>
<div class="codebox">GET /index.html HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0
Accept: text/html</div>

<h2>An HTTP Response</h2>
<div class="codebox">HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 1256

&lt;html&gt; ... &lt;/html&gt;</div>

<h2>HTTP Methods</h2>
<div class="table-wrap"><table>
<thead><tr><th>Method</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td><b>GET</b></td><td>Retrieve data (e.g. load a page).</td></tr>
<tr><td><b>POST</b></td><td>Send data to create something (e.g. submit a form).</td></tr>
<tr><td><b>PUT</b></td><td>Replace / update a resource.</td></tr>
<tr><td><b>PATCH</b></td><td>Partially update a resource.</td></tr>
<tr><td><b>DELETE</b></td><td>Remove a resource.</td></tr>
<tr><td><b>HEAD</b></td><td>Like GET, but only headers are returned.</td></tr>
</tbody></table></div>

<h2>Status Codes</h2>
<div class="table-wrap"><table>
<thead><tr><th>Class</th><th>Meaning</th><th>Common examples</th></tr></thead>
<tbody>
<tr><td>1xx</td><td>Informational</td><td>100 Continue</td></tr>
<tr><td>2xx</td><td>Success</td><td>200 OK, 201 Created, 204 No Content</td></tr>
<tr><td>3xx</td><td>Redirection</td><td>301 Moved Permanently, 302 Found, 304 Not Modified</td></tr>
<tr><td>4xx</td><td>Client error</td><td>400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found</td></tr>
<tr><td>5xx</td><td>Server error</td><td>500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable</td></tr>
</tbody></table></div>

<h2>HTTP is Stateless</h2>
<p>Each request is independent &mdash; the server doesn't remember previous requests. Websites use <b>cookies</b> and <b>sessions</b> to remember who you are (e.g. keep you logged in).</p>

<h2>HTTPS &mdash; HTTP Secure</h2>
<p>Plain HTTP sends everything as readable text. <b>HTTPS</b> = HTTP over <b>TLS</b> (Transport Layer Security). It provides:</p>
<ul class="points">
<li><b>Encryption</b> &ndash; nobody in between can read the data.</li>
<li><b>Integrity</b> &ndash; data can't be modified in transit without detection.</li>
<li><b>Authentication</b> &ndash; a <b>digital certificate</b> from a Certificate Authority proves the server is genuine.</li>
</ul>
<h3>TLS Handshake (simplified)</h3>
<ol class="points">
<li>Client Hello: supported TLS versions and cipher suites.</li>
<li>Server Hello + server's certificate (contains its public key).</li>
<li>Client verifies the certificate with a trusted CA.</li>
<li>Both sides use key exchange (e.g. ECDHE) to agree on a shared <b>session key</b>.</li>
<li>All further data is encrypted with fast <b>symmetric</b> encryption using that key.</li>
</ol>

<div class="table-wrap"><table>
<thead><tr><th>Feature</th><th>HTTP</th><th>HTTPS</th></tr></thead>
<tbody>
<tr><td>Port</td><td>80</td><td>443</td></tr>
<tr><td>Security</td><td>None, plain text</td><td>Encrypted with TLS</td></tr>
<tr><td>Certificate</td><td>Not needed</td><td>Required</td></tr>
<tr><td>URL</td><td>http://</td><td>https:// (padlock icon)</td></tr>
</tbody></table></div>

<h2>HTTP Versions</h2>
<ul class="points">
<li><b>HTTP/1.1</b> &ndash; persistent connections, text-based.</li>
<li><b>HTTP/2</b> &ndash; binary, multiplexing many requests over one connection, header compression.</li>
<li><b>HTTP/3</b> &ndash; runs over <b>QUIC</b> (on UDP) for faster connections and no head-of-line blocking.</li>
</ul>
`,
  notes: {
    definition: "HTTP is a stateless request-response application protocol; HTTPS is HTTP secured with TLS.",
    points: [
      "Methods: GET, POST, PUT, PATCH, DELETE, HEAD.",
      "Status: 2xx success, 3xx redirect, 4xx client error, 5xx server error.",
      "HTTPS gives encryption, integrity and authentication (certificates).",
      "TLS uses asymmetric crypto for key exchange, symmetric for data.",
      "HTTP/3 runs on QUIC over UDP."
    ],
    revision: ["HTTP 80, HTTPS 443", "404 Not Found, 500 Server Error, 301 Permanent Redirect"]
  }
},

{
  id: "security",
  title: "Network Security Fundamentals",
  level: "advanced",
  minutes: 10,
  summary: "The CIA triad, common attacks, cryptography basics, firewalls, VPNs and IDS/IPS.",
  viz: null,
  body: `
<p class="lead"><b>Network security</b> protects data and resources from unauthorised access, misuse and attacks while they are stored or travelling across a network.</p>

<h2>The CIA Triad</h2>
<div class="keyterms">
<div><b>Confidentiality</b><span>Only authorised people can read the data. (Encryption)</span></div>
<div><b>Integrity</b><span>Data isn't altered without detection. (Hashing, digital signatures)</span></div>
<div><b>Availability</b><span>Systems and data are accessible when needed. (Backups, redundancy)</span></div>
</div>

<h2>Common Attacks</h2>
<div class="table-wrap"><table>
<thead><tr><th>Attack</th><th>Description</th><th>Defence</th></tr></thead>
<tbody>
<tr><td><b>Phishing</b></td><td>Fake emails/sites trick users into revealing passwords.</td><td>User awareness, email filtering, MFA</td></tr>
<tr><td><b>Malware</b></td><td>Viruses, worms, trojans, ransomware.</td><td>Antivirus, patching, backups</td></tr>
<tr><td><b>Man-in-the-Middle</b></td><td>Attacker secretly intercepts communication.</td><td>HTTPS/TLS, VPN, certificate checks</td></tr>
<tr><td><b>DoS / DDoS</b></td><td>Flooding a server so real users can't reach it.</td><td>Rate limiting, CDNs, DDoS protection</td></tr>
<tr><td><b>Sniffing</b></td><td>Capturing unencrypted network traffic.</td><td>Encryption everywhere</td></tr>
<tr><td><b>Spoofing</b></td><td>Faking an IP, MAC or email address.</td><td>Authentication, ARP inspection</td></tr>
<tr><td><b>SQL Injection</b></td><td>Malicious input that runs database commands.</td><td>Parameterised queries, input validation</td></tr>
</tbody></table></div>

<h2>Cryptography Basics</h2>
<h3>Symmetric Encryption</h3>
<p>The <b>same key</b> encrypts and decrypts. Fast, used for bulk data. Problem: how do you share the key securely? <i>Examples:</i> AES, DES.</p>
<h3>Asymmetric (Public-Key) Encryption</h3>
<p>Uses a <b>key pair</b>: a <b>public key</b> (shared with everyone) and a <b>private key</b> (kept secret). Data encrypted with the public key can only be decrypted with the private key. <i>Examples:</i> RSA, ECC.</p>
<h3>Hashing</h3>
<p>A one-way function that produces a fixed-size fingerprint of data. Any change to the data changes the hash. Used for integrity and password storage. <i>Examples:</i> SHA-256.</p>
<h3>Digital Signatures</h3>
<p>The sender hashes the message and encrypts the hash with their <b>private key</b>. Anyone can verify it with the sender's public key, proving <b>authenticity</b> and <b>non-repudiation</b>.</p>

<h2>Security Devices &amp; Technologies</h2>
<ul class="points">
<li><b>Firewall</b> &ndash; filters traffic based on rules (IP, port, protocol). Can be packet-filtering, stateful, or next-generation (application-aware).</li>
<li><b>IDS</b> (Intrusion Detection System) &ndash; monitors traffic and <i>alerts</i> on suspicious activity.</li>
<li><b>IPS</b> (Intrusion Prevention System) &ndash; detects <i>and blocks</i> attacks automatically.</li>
<li><b>VPN</b> (Virtual Private Network) &ndash; creates an encrypted tunnel over the public Internet (IPsec, SSL VPN, WireGuard).</li>
<li><b>MFA</b> (Multi-Factor Authentication) &ndash; something you know + have + are.</li>
</ul>

<div class="note warn"><span class="note-title">Golden rule</span><p>Security is layered (<b>defence in depth</b>). No single tool is enough &mdash; combine firewalls, encryption, updates, strong passwords, MFA and user awareness.</p></div>
`,
  notes: {
    definition: "Network security protects the confidentiality, integrity and availability of data and network resources.",
    points: [
      "CIA triad: Confidentiality, Integrity, Availability.",
      "Attacks: phishing, malware, MITM, DoS/DDoS, sniffing, spoofing, SQL injection.",
      "Symmetric (AES, one key) vs asymmetric (RSA, key pair).",
      "Hashing (SHA-256) = integrity. Digital signature = authenticity.",
      "Firewall filters; IDS detects; IPS blocks; VPN encrypts tunnels."
    ],
    compare: { head: ["Symmetric", "Asymmetric"], rows: [["One shared key", "Public + private key"], ["Fast", "Slower"], ["AES, DES", "RSA, ECC"]] },
    revision: ["IDS alerts, IPS blocks", "Sign with private key, verify with public key"]
  }
},

{
  id: "wireless",
  title: "Wireless & Modern Networking",
  level: "advanced",
  minutes: 7,
  summary: "Wi-Fi standards, mobile generations (4G/5G), cloud networking, SDN and IoT.",
  viz: null,
  body: `
<p class="lead">Modern networks are increasingly wireless, virtual and cloud-based. This lesson gives an overview of the technologies shaping networking today.</p>

<h2>Wi-Fi (IEEE 802.11)</h2>
<div class="table-wrap"><table>
<thead><tr><th>Standard</th><th>Name</th><th>Band</th><th>Max speed (theoretical)</th></tr></thead>
<tbody>
<tr><td>802.11n</td><td>Wi-Fi 4</td><td>2.4 / 5 GHz</td><td>600 Mbps</td></tr>
<tr><td>802.11ac</td><td>Wi-Fi 5</td><td>5 GHz</td><td>~3.5 Gbps</td></tr>
<tr><td>802.11ax</td><td>Wi-Fi 6 / 6E</td><td>2.4 / 5 / 6 GHz</td><td>~9.6 Gbps</td></tr>
<tr><td>802.11be</td><td>Wi-Fi 7</td><td>2.4 / 5 / 6 GHz</td><td>~46 Gbps</td></tr>
</tbody></table></div>
<p><b>2.4 GHz</b> travels further and through walls better; <b>5/6 GHz</b> is faster but shorter range. Wi-Fi security should use <b>WPA3</b> (or at least WPA2) &mdash; never WEP.</p>

<h2>Mobile Networks</h2>
<div class="table-wrap"><table>
<thead><tr><th>Generation</th><th>Key feature</th></tr></thead>
<tbody>
<tr><td>2G</td><td>Digital voice, SMS</td></tr>
<tr><td>3G</td><td>Mobile Internet</td></tr>
<tr><td>4G LTE</td><td>All-IP, HD video streaming</td></tr>
<tr><td>5G</td><td>Very high speed, ultra-low latency, massive IoT</td></tr>
</tbody></table></div>

<h2>Other Modern Concepts</h2>
<ul class="points">
<li><b>Cloud networking</b> &ndash; virtual networks (VPCs) in AWS, Azure, GCP; resources connected by software.</li>
<li><b>SDN (Software-Defined Networking)</b> &ndash; separates the <i>control plane</i> (decisions) from the <i>data plane</i> (forwarding) so networks can be programmed centrally.</li>
<li><b>CDN (Content Delivery Network)</b> &ndash; copies of websites on servers around the world, so users load from a nearby server.</li>
<li><b>IoT (Internet of Things)</b> &ndash; billions of sensors and smart devices using protocols like MQTT, Zigbee and Bluetooth Low Energy.</li>
<li><b>Edge computing</b> &ndash; processing data close to where it's created to reduce latency.</li>
</ul>

<div class="note fact"><span class="note-title">Did you know?</span><p>5G aims for latency as low as 1 millisecond &mdash; fast enough for remote surgery and self-driving car communication.</p></div>
`,
  notes: {
    definition: "Modern networking covers wireless LANs, mobile networks, cloud, SDN and IoT.",
    points: [
      "Wi-Fi = IEEE 802.11. Wi-Fi 6 = 802.11ax, Wi-Fi 7 = 802.11be.",
      "2.4 GHz: longer range; 5/6 GHz: faster.",
      "Use WPA3/WPA2; WEP is insecure.",
      "SDN separates control plane from data plane.",
      "5G: high speed, low latency, massive IoT."
    ],
    revision: ["Wi-Fi uses CSMA/CA", "CDN = content served from nearby edge servers"]
  }
}

);
