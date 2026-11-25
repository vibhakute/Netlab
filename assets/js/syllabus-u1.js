/* Unit I - Introduction to Data Communication (college syllabus, Unit 1 slides). */
window.TOPICS = window.TOPICS || [];
window.QUIZ = window.QUIZ || [];
(function () {
  const T = [

{
  id: "u1-intro", unit: "u1", title: "Introduction to Data Communication", minutes: 8,
  summary: "What data communication is, what it is concerned with, and the protocols (TCP and IP) that every Internet device follows.",
  source: "Unit I slides 7–10, 13", related: ["intro"],
  intro: "<p>Sending a WhatsApp message, joining a video call, paying with UPI or loading a web page all involve the same thing: <b>data moving from one device to another</b>. Data communication is the study of how that movement happens reliably.</p>",
  definition: "Data communication is the transfer of data or information between a source and a receiver — two or more devices, systems or places — over a transmission medium, following agreed rules called protocols.",
  why: "<p>Computing and telecommunications both depend on data transmission. Email, video chatting and the Internet would not exist without it. Its purpose is to provide the <b>rules and regulations (protocols and standards)</b> that let computers with different operating systems, languages, cabling and locations share resources.</p>",
  how: "<p>Data communication is interested in three things: <b>the transfer of data</b>, <b>the method of transfer</b>, and <b>preserving the data during transfer</b>. Creating the information at the source, and what the receiver does with it afterwards, are <i>not</i> part of data communication.</p>" +
    "<ol class='points'><li>The <b>source</b> has data to send, such as the text “Hi”.</li><li>The data is <b>encoded</b> as bits (0s and 1s).</li><li>The bits are converted into a <b>signal</b> (electrical, light or radio) suitable for the medium.</li><li>The signal travels over the <b>transmission medium</b>.</li><li>The <b>receiver</b> converts the signal back into bits and then into the original data.</li></ol>" +
    "<p>Every computer on the Internet follows two core protocols:</p><ul class='points'><li><b>TCP (Transmission Control Protocol)</b> divides a message into packets at the source and reassembles them at the destination. It tracks the source, destination and correct <i>sequence</i> of the packets, and checks that the message arrived correctly.</li><li><b>IP (Internet Protocol)</b> handles the <i>address</i> of the destination computer so every packet reaches the right device — your message to a friend does not end up with someone else.</li></ul>",
  deep: "<p>An effective data communication system is judged on four fundamental characteristics:</p>" +
    "<div class='table-wrap'><table><thead><tr><th>Characteristic</th><th>Meaning</th></tr></thead><tbody>" +
    "<tr><td><b>Delivery</b></td><td>Data must reach the correct destination, and only that destination.</td></tr>" +
    "<tr><td><b>Accuracy</b></td><td>Data must arrive without alteration; altered data is unusable.</td></tr>" +
    "<tr><td><b>Timeliness</b></td><td>Data must arrive in time. Real-time audio and video are useless if late.</td></tr>" +
    "<tr><td><b>Jitter</b></td><td>The variation in packet arrival times must be small, or playback becomes uneven.</td></tr></tbody></table></div>" +
    "<p><b>Protocols vs standards.</b> A protocol is the set of rules two communicating entities use (its elements are syntax, semantics and timing). A standard is a protocol agreed and published so that equipment from different vendors interoperates. Standards are either <i>de jure</i> (set by bodies such as ISO, ITU-T, IEEE and ANSI) or <i>de facto</i> (adopted through widespread use).</p>" +
    "<p><b>TCP/IP in more depth.</b> TCP is connection-oriented: it numbers every byte with sequence numbers, the receiver returns acknowledgements, and lost segments are retransmitted. IP is connectionless and best-effort: each packet carries source and destination IP addresses and is routed independently. Packets may arrive out of order, and TCP puts them back in sequence.</p>",
  diagram: "<figure class='diagram'><div class='flow'><span class='node'>Source data</span><span class='arrow'>→</span><span class='node b'>Encode to bits</span><span class='arrow'>→</span><span class='node b'>Signal on medium</span><span class='arrow'>→</span><span class='node b'>Decode</span><span class='arrow'>→</span><span class='node'>Receiver data</span></div><figcaption>Data communication moves data from a source to a receiver and keeps it intact on the way.</figcaption></figure>",
  examples: ["Sending an email or chat message", "A video call between two phones", "An ATM sending a withdrawal request to the bank's server", "An IoT temperature sensor reporting readings to the cloud"],
  terms: [["Data", "Facts or information in a form agreed by the communicating parties."], ["Signal", "The electrical, optical or radio form that carries data over a medium."], ["Protocol", "A set of rules that governs communication."], ["Standard", "A published, agreed protocol that allows different vendors' equipment to interoperate."], ["Packet", "A small unit of data that TCP/IP sends independently."]],
  exam: ["Define data communication: transfer of data between a source and a receiver over a transmission medium.", "Data communication covers the transfer, its method and preserving data during transfer — not generating the information or acting on it.", "Purpose: provide protocols and standards so different computers can share resources.", "TCP splits messages into packets, sequences them, reassembles them and checks delivery.", "IP handles destination addressing so each packet reaches the right device.", "Four characteristics: delivery, accuracy, timeliness and jitter."],
  recap: "Data communication = moving data intact from source to receiver over a medium using protocols. TCP handles packets and order; IP handles addresses.",
  viz: { id: "v-dcflow", intro: "Watch a short message travel through every stage: data → bits → signal → medium → bits → data." },
  sim: { id: "transmission", params: { mode: "full" }, tasks: ["Send “Hi!” and match the bits on the wire to the binary codes shown below the diagram.", "Turn on <b>Add noise</b> and send again. Which characteristic of data communication (delivery, accuracy, timeliness or jitter) is affected?", "Change the speed and notice that the data is unchanged — only timeliness changes."] },
  quiz: [
    { q: "Data communication is best defined as:", o: ["Generating information on a computer", "Transferring data between devices over a transmission medium", "Storing data in a database", "Displaying data on a screen"], a: 1, e: "It is the transfer of data between a source and a receiver over a medium.", d: 1 },
    { q: "Which protocol is responsible for addressing so packets reach the correct destination?", o: ["TCP", "IP", "HTTP", "FTP"], a: 1, e: "IP handles the address of the destination computer.", d: 1 },
    { q: "Which of these is NOT part of data communication according to its definition?", o: ["The method of transfer", "Preserving data during transfer", "The action the receiver takes with the information", "The transfer of data"], a: 2, e: "Generating information and acting on it at the receiver are outside data communication.", d: 2 },
    { q: "Which TCP function ensures a message is rebuilt correctly at the destination?", o: ["Assigning IP addresses", "Sequencing and reassembling packets", "Encrypting data", "Choosing the transmission medium"], a: 1, e: "TCP numbers the packets so they can be reassembled in the right order.", d: 2 },
    { q: "A video call arrives correctly but 8 seconds late. Which characteristic has failed?", o: ["Delivery", "Accuracy", "Timeliness", "Security"], a: 2, e: "The data is correct and at the right place, but it is late — timeliness.", d: 3 },
    { q: "Why are protocols and standards needed in data communication?", o: ["To increase cable length", "So computers with different OS, languages and cabling can share resources", "To convert analog to digital", "To reduce the cost of computers"], a: 1, e: "The purpose stated in the syllabus: let heterogeneous computers communicate and share resources.", d: 3 }
  ]
},

{
  id: "u1-components", unit: "u1", title: "Components of Data Communication", minutes: 7,
  summary: "The five components every communication system needs — message, sender, receiver, transmission medium and protocol — and why the protocol matters.",
  source: "Unit I slides 11–13", related: ["components"],
  intro: "<p>Every communication system, from a phone call to the Internet, is built from the same five parts. If any one of them is missing, communication fails.</p>",
  definition: "A data communication system consists of five components: the message, the sender, the receiver, the transmission medium (communication channel) and the set of rules (protocol).",
  why: "<p>Knowing the components lets you diagnose problems — is the fault in the device, the cable, or a rule mismatch? It is also the base for every later topic: transmission media (Unit II), codes (Unit III) and modulation (Unit IV).</p>",
  how: "<ol class='points'>" +
    "<li><b>Message</b> — the information to be sent: a text file, audio file, video, image, etc.</li>" +
    "<li><b>Sender</b> — the device that sends the message: a computer, mobile, telephone, laptop, video camera or workstation.</li>" +
    "<li><b>Receiver</b> — the device that receives the message: a computer, telephone, mobile, workstation, etc.</li>" +
    "<li><b>Transmission medium / communication channel</b> — the path connecting the workstations. It may be <i>wired</i> (cables) or <i>wireless</i> (radio, microwave, infrared).</li>" +
    "<li><b>Set of rules (protocol)</b> — the sender's data must be understandable to the receiver. If Sonali writes to Chetan in Hindi and Chetan cannot read Hindi, the conversation is meaningless even though the message was delivered.</li></ol>",
  deep: "<p><b>Elements of a protocol.</b> Every protocol defines three things:</p><div class='table-wrap'><table><thead><tr><th>Element</th><th>Defines</th><th>Example</th></tr></thead><tbody>" +
    "<tr><td><b>Syntax</b></td><td>The structure or format of the data</td><td>First 8 bits = address, next 8 bits = length</td></tr>" +
    "<tr><td><b>Semantics</b></td><td>The meaning of each section of bits</td><td>A flag bit means “acknowledge this”</td></tr>" +
    "<tr><td><b>Timing</b></td><td>When data is sent and how fast</td><td>Sender at 100 Mbit/s, receiver can only process 1 Mbit/s</td></tr></tbody></table></div>" +
    "<p><b>DTE and DCE.</b> In formal terms the sender and receiver are <i>Data Terminal Equipment</i> (DTE: computers, terminals). The devices that adapt the data to the medium, such as modems, are <i>Data Circuit-terminating Equipment</i> (DCE). A dial-up link is therefore DTE → DCE → medium → DCE → DTE.</p>" +
    "<p><b>Protocols on the Internet.</b> On the Internet the rule set is the TCP/IP suite. TCP manages packets and their order, and IP manages addressing. A character code such as ASCII or EBCDIC (Unit III) is also part of the agreement: the receiver must decode bits with the same code the sender used.</p>",
  diagram: "<figure class='diagram'><div class='flow'><span class='node'>Sender</span><span class='arrow'>—— Transmission medium ——→</span><span class='node'>Receiver</span></div><p class='muted' style='margin:8px 0 0;font-size:.9rem'>The <b>message</b> travels on the medium; both ends follow the same <b>protocol</b>.</p><figcaption>The five components of data communication</figcaption></figure>",
  examples: ["Phone call: you (sender), your words (message), phone network (medium), your friend (receiver), a shared language and turn-taking (protocol)", "Email: your laptop, the email text, Wi-Fi + Internet, the recipient's phone, SMTP/IMAP protocols", "Keyboard to PC: keyboard (sender), key codes (message), USB cable (medium), PC (receiver), USB HID protocol"],
  terms: [["Message", "The information being communicated."], ["Sender", "Device that transmits the message."], ["Receiver", "Device that accepts the message."], ["Medium", "Physical or wireless path between sender and receiver."], ["Protocol", "Agreed rules: syntax, semantics and timing."], ["DTE / DCE", "Terminal equipment (PC) / communication equipment (modem)."]],
  exam: ["Five components: message, sender, receiver, transmission medium, protocol.", "Medium may be wired (guided) or wireless (unguided).", "Without a common protocol, devices can be connected but still not communicate (Sonali–Chetan Hindi example).", "Protocol elements: syntax, semantics, timing.", "TCP and IP are the protocols followed by every computer on the Internet."],
  recap: "Message + sender + receiver + medium + protocol. The protocol (syntax, semantics, timing) is what turns a connection into communication.",
  viz: { id: "v-components", intro: "Each component lights up in turn as a message travels from sender to receiver." },
  sim: { id: "s-protocol", tasks: ["Send “HELLO” with both sides using ASCII and confirm the receiver reads it correctly.", "Set the receiver to EBCDIC. What does the receiver see, and which component has failed?", "Try UTF-8 vs ASCII with only English letters. Why does it still work? Now add “₹” and observe."] },
  quiz: [
    { q: "How many components does a data communication system have?", o: ["Three", "Four", "Five", "Seven"], a: 2, e: "Message, sender, receiver, transmission medium and protocol.", d: 1 },
    { q: "A text file, audio file or video file is an example of which component?", o: ["Medium", "Message", "Protocol", "Sender"], a: 1, e: "The message is the information to be transmitted.", d: 1 },
    { q: "Sonali writes to Chetan in Hindi, which Chetan cannot read. Which component is missing?", o: ["Message", "Medium", "Common protocol", "Receiver"], a: 2, e: "The message was delivered, but there is no shared set of rules to interpret it.", d: 2 },
    { q: "Which protocol element defines WHEN data should be sent and how fast?", o: ["Syntax", "Semantics", "Timing", "Encoding"], a: 2, e: "Timing covers when and at what speed data is sent.", d: 2 },
    { q: "A sender transmits ASCII text but the receiver decodes it as EBCDIC. What happens?", o: ["The text arrives correctly", "The receiver shows wrong characters because the agreed code (protocol) differs", "The medium breaks", "The sender cannot transmit"], a: 1, e: "Same bits, different decoding rules — a protocol mismatch produces garbage.", d: 3 },
    { q: "In a dial-up link, the modem is classified as:", o: ["DTE", "DCE", "Protocol", "Message"], a: 1, e: "Modems are Data Circuit-terminating Equipment; computers are DTE.", d: 3 }
  ]
},

{
  id: "u1-modes", unit: "u1", title: "Transmission Modes: Simplex, Half-Duplex and Full-Duplex", minutes: 9,
  summary: "The three directions of data flow between two devices, how they use the channel, and where each is used.",
  source: "Unit I slides 14–19", related: ["data-flow"],
  intro: "<p>When two devices are connected, who is allowed to talk, and when? The <b>transmission mode</b> (also called the communication mode or type of data communication) answers this.</p>",
  definition: "Transmission mode is the direction of data flow between two connected devices. There are three types: simplex (one-way), half-duplex (two-way, one at a time) and full-duplex (two-way, simultaneously).",
  why: "<p>The mode decides how fast two parties can exchange data and how the channel's bandwidth is used. Choosing the wrong mode either wastes capacity or makes interaction impossible — imagine a phone call where only one person could ever speak.</p>",
  how: "<h3>1. Simplex</h3><p>One-way (unidirectional) communication. One device only sends; the other only receives. The sender uses the <b>entire capacity</b> of the channel. <i>Examples:</i> keyboard to computer, computer to monitor, music to a speaker, an IoT sensor reporting data.</p>" +
    "<h3>2. Half-duplex</h3><p>Two-way (bidirectional), but <b>not at the same time</b>. While one device sends, the other only receives, and then they swap. <i>Example:</i> walkie-talkie (“over!”).</p>" +
    "<h3>3. Full-duplex</h3><p>Two-way and <b>simultaneous</b>. Both devices send and receive at the same time. <i>Examples:</i> mobile phones, landline telephones.</p>",
  deep: "<p><b>Half-duplex turnaround.</b> Each change of direction costs a <i>turnaround time</i>, during which the line is idle while the roles switch. Rules such as <i>line discipline</i> (who may send now) or Ethernet's CSMA/CD on shared cable decide who transmits.</p>" +
    "<p><b>How full-duplex is achieved:</b></p><ul class='points'><li><b>Two separate paths</b> — two wire pairs (a 4-wire circuit), as in switched Ethernet (one pair each way).</li><li><b>Splitting the channel</b> — frequency-division duplex (FDD) gives each direction its own frequency band; time-division duplex (TDD) alternates so fast that both sides appear simultaneous. Mobile networks use both.</li><li><b>Echo cancellation</b> on a single wire pair, so a modem can subtract its own outgoing signal and hear the incoming one.</li></ul>" +
    "<p><b>Capacity.</b> In full-duplex the link's capacity is either doubled (two physical paths) or shared between the two directions (one divided channel).</p>",
  compare: { head: ["Parameter", "Simplex", "Half-duplex", "Full-duplex"], rows: [
    ["Direction", "Unidirectional", "Two-way, one at a time", "Two-way, simultaneously"],
    ["Sender and receiver", "Sender can't receive", "Both can send and receive, one at a time", "Both send and receive simultaneously"],
    ["Channel usage", "One channel", "One channel", "Two channels"],
    ["Performance", "Lowest", "Better than simplex", "Best"],
    ["Bandwidth utilization", "Uses the maximum of a single bandwidth", "Lesser utilization of a single bandwidth", "Doubles the utilization of bandwidth"],
    ["Suitable for", "Full bandwidth needed, one direction only", "Both directions but not at once", "Both directions at the same time"],
    ["Examples", "Keyboard, monitor", "Walkie-talkie", "Telephone"]] },
  examples: ["Simplex: TV broadcast, FM radio, keyboard → PC, PC → printer (classic)", "Half-duplex: walkie-talkies, police/taxi radio, old hub-based Ethernet", "Full-duplex: telephone call, video conferencing, modern switched Ethernet"],
  terms: [["Unidirectional", "Data flows in one direction only."], ["Bidirectional", "Data can flow in both directions."], ["Turnaround time", "Delay while a half-duplex link changes direction."], ["FDD / TDD", "Frequency- / time-division duplexing: two ways to get full-duplex on one medium."]],
  exam: ["Simplex = unidirectional; uses the entire capacity in one direction (keyboard, speaker, IoT).", "Half-duplex = bidirectional but one direction at a time (walkie-talkie).", "Full-duplex = bidirectional simultaneously (telephone, mobile).", "Channel usage: simplex 1, half-duplex 1, full-duplex 2.", "Performance order: full-duplex > half-duplex > simplex."],
  recap: "Simplex → one way. Half-duplex → both ways, taking turns. Full-duplex → both ways at once.",
  viz: { id: "v-duplex", intro: "The three modes run side by side so you can compare who transmits and when." },
  sim: { id: "transmission", params: { mode: "half" }, tasks: ["In <b>Half-duplex</b>, press <i>Send A → B</i> and then immediately <i>Reply B → A</i>. What message appears, and why?", "Switch to <b>Full-duplex</b> and repeat. Count the channels drawn.", "Switch to <b>Simplex</b> and try to reply. Which real device behaves like this?"] },
  quiz: [
    { q: "A keyboard sending data to a computer is an example of:", o: ["Simplex", "Half-duplex", "Full-duplex", "Multiplex"], a: 0, e: "Data flows only from keyboard to computer — simplex.", d: 1 },
    { q: "A walkie-talkie uses which mode?", o: ["Simplex", "Half-duplex", "Full-duplex", "Broadcast"], a: 1, e: "Both sides can talk, but only one at a time.", d: 1 },
    { q: "How many channels does full-duplex use, according to the comparison table?", o: ["One", "Two", "Three", "None"], a: 1, e: "Full-duplex uses two channels, one per direction.", d: 2 },
    { q: "Which mode gives the best performance?", o: ["Simplex", "Half-duplex", "Full-duplex", "All equal"], a: 2, e: "Full-duplex lets both sides transmit simultaneously.", d: 2 },
    { q: "A half-duplex link wastes some time every time the direction changes. This is called:", o: ["Jitter", "Turnaround time", "Propagation delay", "Crosstalk"], a: 1, e: "Turnaround time is the idle period while roles switch.", d: 3 },
    { q: "A mobile network lets both users talk at once over one radio medium by giving each direction its own frequency band. This technique is:", o: ["Simplex", "Frequency-division duplex (FDD)", "Half-duplex", "Statistical TDM"], a: 1, e: "FDD splits the band so each direction has its own frequencies, giving full-duplex.", d: 3 }
  ]
},

{
  id: "u1-serial-parallel", unit: "u1", title: "Data Transfer Modes: Serial and Parallel", minutes: 8,
  summary: "Sending bits one after another on a single line versus many bits at once on separate lines — speed, cost, distance and crosstalk.",
  source: "Unit I slides 20–21", related: ["transmission"],
  intro: "<p>A byte has 8 bits. Should they travel <b>one after another</b> down one wire, or <b>side by side</b> down eight wires? These are the two data transfer modes.</p>",
  definition: "In serial communication data is transmitted bit by bit, sequentially, over a single wire or channel. In parallel communication multiple bits are transmitted simultaneously over separate wires or channels.",
  why: "<p>The choice decides the cost of cabling, the maximum distance and the achievable speed of a link. It explains why almost every modern external connection (USB, Ethernet, SATA) is serial.</p>",
  how: "<h3>Serial communication</h3><p>One transmission line; bits are sent one at a time. Example: the serial link between a computer and a modem.</p>" +
    "<h3>Parallel communication</h3><p>Multiple transmission lines; all bits of a group are sent at the same time. Example: the parallel link between a motherboard and a hard disk (older IDE/PATA ribbon cables).</p>",
  compare: { head: ["Serial communication", "Parallel communication"], rows: [
    ["One bit at a time", "All bits of a group at a time"], ["Low speed (per clock)", "High speed (per clock)"], ["Single transmission line", "Multiple transmission lines"],
    ["No crosstalk between lines", "May have a crosstalk problem"], ["Less expensive", "More expensive"], ["Bandwidth is higher", "Bandwidth is lower"],
    ["Not affected by noise problems (slide wording)", "May suffer from noise problems"], ["Works even at high frequencies", "May not work properly at high frequencies"],
    ["Covers long distances", "Used for short distances"], ["Example: computer ↔ modem", "Example: motherboard ↔ hard disk"]] },
  deep: "<p><b>Why parallel loses at high speed: skew.</b> In a parallel cable each wire has a slightly different length and electrical delay. At low clock rates the difference is tiny compared with one bit period. As the clock rises, the bit period shrinks (1 ns at 1 GHz), so bits sent together arrive at <i>different</i> times. Once this <b>skew</b> approaches half a bit period, the receiver samples some lines in the wrong bit. Adjacent parallel lines also couple into each other (crosstalk).</p>" +
    "<p><b>Why serial wins today.</b> A single line, or one differential pair, has no inter-line skew, so it can be clocked far faster. The receiver recovers the clock from the data itself (as in Manchester or 8b/10b encoding). USB, SATA, PCI Express and Ethernet are all serial. PCIe gains extra bandwidth by running several independent serial <i>lanes</i>, each with its own clock recovery.</p>" +
    "<p><b>Synchronous vs asynchronous serial.</b> Asynchronous serial (UART, RS-232) frames each character with a start bit and stop bit(s). Synchronous serial sends continuous blocks kept in step by a shared or recovered clock, which is more efficient.</p>",
  syllabusNote: "The slide table says serial is “not affected by noise problems” and has “higher bandwidth”. For the exam, reproduce the table. Technically, serial links <b>are</b> affected by noise; what they avoid is crosstalk and skew <i>between parallel lines</i>, which is why they can run at much higher clock rates and therefore deliver more bandwidth in practice.",
  examples: ["Serial: USB, Ethernet, RS-232, SATA, HDMI lanes", "Parallel: old printer (Centronics) cables, PATA/IDE hard-disk ribbons, the data bus inside a CPU or memory"],
  terms: [["Serial", "Bits sent one after another on one line."], ["Parallel", "Several bits sent at once on several lines."], ["Skew", "Different arrival times of bits sent together on parallel lines."], ["Crosstalk", "A signal on one line interfering with a neighbouring line."], ["UART", "Hardware that converts between parallel bytes and asynchronous serial bits."]],
  exam: ["Serial: bit by bit over a single wire; parallel: multiple bits simultaneously over separate wires.", "Serial is cheaper, covers longer distances and has no crosstalk between lines.", "Parallel is faster per clock but costly, short-distance and suffers crosstalk.", "Example: serial computer–modem; parallel motherboard–hard disk.", "Skew limits parallel links at high frequency."],
  recap: "Serial = one line, cheap, long distance, scales to high speed. Parallel = many lines, fast per clock, but short distance due to skew and crosstalk.",
  viz: { id: "v-serialparallel", intro: "The same byte travels serially (one wire) and in parallel (eight wires), step by step." },
  sim: { id: "s-serialparallel", tasks: ["Keep the cable at 1 m and raise the clock. When does the parallel link start failing?", "Fix the clock at 100 MHz and increase the cable length. What limits parallel links?", "Compare transfer times for 1 line vs 8 lines at a low clock speed."] },
  quiz: [
    { q: "In serial communication, data is transmitted:", o: ["All bits at once on separate wires", "Bit by bit over a single line", "Only as analog signals", "Only wirelessly"], a: 1, e: "Serial sends bits one after another on one channel.", d: 1 },
    { q: "Which mode is typically used between a motherboard and a hard disk (in the slide example)?", o: ["Serial", "Parallel", "Simplex", "Wireless"], a: 1, e: "The slide example for parallel is motherboard ↔ hard disk.", d: 1 },
    { q: "Which mode is more suitable for long distances?", o: ["Parallel", "Serial", "Both equal", "Neither"], a: 1, e: "Serial covers long distances; parallel is for short distances.", d: 2 },
    { q: "Which problem is associated with parallel communication?", o: ["Crosstalk between lines", "Needs a single wire", "Cannot send more than 1 bit", "Is always wireless"], a: 0, e: "Adjacent parallel lines interfere with each other (crosstalk).", d: 2 },
    { q: "Why do parallel buses fail at high clock speeds over long cables?", o: ["Bits on different lines arrive at different times (skew)", "They run out of wires", "Serial interference", "The voltage becomes too high"], a: 0, e: "Skew grows with length; at high speed it exceeds the bit period.", d: 3 },
    { q: "How long does it take to send 64 bits over 8 parallel lines clocked at 1 MHz (one bit per line per clock)?", o: ["64 µs", "8 µs", "1 µs", "0.125 µs"], a: 1, e: "64 bits / 8 lines = 8 clocks; 8 × 1 µs = 8 µs.", d: 3 }
  ]
},

{
  id: "u1-telecom", unit: "u1", title: "Role of Telecommunications: Local Loop, LAN, MAN and WAN", minutes: 10,
  summary: "How the telecom industry and computer networking merged, the local loop (last mile), and the three network scales: LAN, MAN and WAN.",
  source: "Unit I slides 7, 22–30", related: ["network-types"],
  intro: "<p>What do telephones have to do with networking? A lot. The telecom industry and the computer industry have gradually merged, and their common goal is to join distant <b>Local Area Networks</b> into <b>Metropolitan</b> and <b>Wide Area Networks</b>.</p>",
  definition: "Telecommunications provides the infrastructure and technology for communication over distance. The local loop is the subscriber's “last mile” connection to the telephone exchange; LANs, MANs and WANs are networks of increasing geographic scale.",
  why: "<p>Telecom networks are the foundation of the Internet. They carry voice, data and video between users and organisations, drive innovation and keep communication reliable. Knowing the network scales tells you which technologies, speeds and costs to expect.</p>",
  how: "<h3>1. The local loop</h3><p>The physical connection between the subscriber's premises (home or office) and the local telephone exchange or central office — the <b>“last mile”</b> that gives individual users access to the wider network. It was originally for voice; with DSL and fibre it now also carries data and Internet traffic.</p>" +
    "<h3>2. LAN — Local Area Network</h3><p>Connects devices in a small area (a building or campus) so PCs and workstations can share data, tools and programs. Devices are connected by a switch or stack of switches and use a <b>private addressing scheme</b> (TCP/IP). <b>Routers</b> sit at the boundary of a LAN and connect it to the larger WAN.</p>" +
    "<h3>3. MAN — Metropolitan Area Network</h3><p>Larger than a LAN, smaller than a WAN — about <b>5–50 km</b>. It connects computers in the same or nearby cities, may act as an ISP, and is designed for customers who need high-speed connectivity (speeds in Mbit/s). MANs are hard to design and maintain. Example: hospital, school, college and factory LANs joined across a city.</p>" +
    "<h3>4. WAN — Wide Area Network</h3><p>Extends over a large geographical area, such as a state or country — <b>above 50 km</b>. It can connect LANs to other LANs via telephone lines and radio waves, and may belong to one enterprise or be public. The technology is high-speed but relatively expensive. The Internet is the largest WAN.</p>",
  compare: { head: ["Basis", "LAN", "MAN", "WAN"], rows: [
    ["Full form", "Local Area Network", "Metropolitan Area Network", "Wide Area Network"], ["Geographic span", "Building or campus", "A city", "Country or continent"],
    ["Ownership", "Private", "Private or public", "Often not owned by one organisation"], ["Transmission speed", "High", "Average", "Low (relative)"],
    ["Propagation delay", "Short", "Moderate", "Long"], ["Congestion", "Less", "More", "More than MAN"],
    ["Design & maintenance", "Easy", "Harder than LAN", "Hardest"], ["Fault tolerance", "More", "Less", "Less"]] },
  deep: "<p><b>Local loop technology.</b> A traditional local loop is an unshielded copper twisted pair, typically up to about 5 km long, carrying a 4 kHz voice channel. <b>DSL</b> reuses the same pair by placing data in frequencies above the voice band and separating them with a splitter. <b>FTTH</b> (fibre to the home) replaces the copper with optical fibre, and a <b>wireless local loop</b> (WLL) replaces it with radio.</p>" +
    "<p><b>Typical technologies at each scale:</b> LAN — Ethernet (IEEE 802.3) and Wi-Fi (802.11). MAN — metro Ethernet, cable TV networks, fibre rings. WAN — leased lines, MPLS, SONET/SDH optical backbones, satellite and the public Internet.</p>" +
    "<p><b>Propagation delay grows with distance.</b> Signals travel at roughly 2×10⁸ m/s in cable and fibre. 100 m in a LAN costs about 0.5 µs, a 30 km MAN about 0.15 ms, and a 5000 km WAN about 25 ms one way. This is why WANs have “long propagation delay” in the comparison table.</p>",
  examples: ["Local loop: the phone/DSL line from your house to the exchange", "LAN: your college computer lab or home Wi-Fi", "MAN: a city-wide cable TV or municipal fibre network linking campuses", "WAN: a bank's branch network across India; the Internet"],
  terms: [["Local loop", "Last-mile link between subscriber and central office."], ["Central office (exchange)", "Telephone company building where local loops terminate."], ["Private addressing", "IP addresses used inside a LAN (e.g. 192.168.x.x)."], ["Propagation delay", "Time for a signal to travel the physical distance."], ["ISP", "Internet Service Provider."]],
  exam: ["Telecom and computer industries are integrating; goal: join LANs into MANs and WANs.", "Local loop = physical subscriber-to-central-office link, the “last mile”; now carries DSL/fibre data too.", "LAN: switches, private addressing, routers at the boundary.", "MAN: 5–50 km, may serve as ISP, hard to design/maintain.", "WAN: above 50 km, uses telephone lines and radio waves, high-speed but expensive.", "Learn the LAN/MAN/WAN comparison table (speed, delay, congestion, fault tolerance)."],
  recap: "Local loop = last mile. LAN (building) → MAN (city, 5–50 km) → WAN (country, >50 km). Bigger networks: more delay, more congestion, harder to manage.",
  viz: { id: "v-netscale", intro: "Follow a request from a home phone line through the local loop, a LAN, a MAN and the WAN." },
  sim: { id: "s-netscale", tasks: ["Set the distance to 80 m, then 20 km, then 2000 km. How does the network type change?", "At 2000 km, compare copper, fibre and satellite propagation delays.", "Explain from the numbers why WANs have “long propagation delay”."] },
  quiz: [
    { q: "The “last mile” connection between a subscriber and the local exchange is called the:", o: ["Trunk", "Local loop", "Backbone", "WAN"], a: 1, e: "The local loop connects the subscriber's premises to the central office.", d: 1 },
    { q: "According to the slides, a MAN covers a range of about:", o: ["Up to 100 m", "5–50 km", "Above 50 km", "Only one building"], a: 1, e: "MAN range is 5–50 km.", d: 1 },
    { q: "Which device sits at the boundary of a LAN to connect it to a WAN?", o: ["Hub", "Repeater", "Router", "Switch"], a: 2, e: "Routers connect the LAN to the larger WAN.", d: 2 },
    { q: "Which network type has the highest fault tolerance per the comparison table?", o: ["LAN", "MAN", "WAN", "All equal"], a: 0, e: "LANs have more fault tolerance; MANs and WANs less.", d: 2 },
    { q: "Signals travel at ~2×10⁸ m/s in fibre. What is the one-way propagation delay over 2000 km?", o: ["1 ms", "10 ms", "100 ms", "0.1 ms"], a: 1, e: "2×10⁶ m / 2×10⁸ m/s = 0.01 s = 10 ms.", d: 3 },
    { q: "DSL lets a copper local loop carry Internet data alongside voice by:", o: ["Replacing copper with fibre", "Using frequencies above the voice band", "Making the line simplex", "Using EBCDIC"], a: 1, e: "DSL places data above the ~4 kHz voice band; a splitter separates them.", d: 3 }
  ]
},

{
  id: "u1-criteria", unit: "u1", title: "Major Criteria of a Data Communication Network", minutes: 8,
  summary: "Performance, reliability and security — plus scalability, cost, manageability and flexibility — and how to measure them.",
  source: "Unit I slides 31–33",
  intro: "<p>How do you decide whether a network is “good”? Engineers judge every data communication network on three major criteria: <b>performance</b>, <b>reliability</b> and <b>security</b>.</p>",
  definition: "The major criteria of a data communication network are performance (how well it transmits data), reliability (how consistently and accurately it transmits) and security (how well it protects data). Scalability, cost, manageability and flexibility are further criteria.",
  why: "<p>These criteria let you compare designs, set requirements (“latency under 50 ms, 99.9% uptime”) and find what to improve. A fast network that keeps failing, or a reliable one that leaks data, is not acceptable.</p>",
  how: "<h3>1. Performance</h3><p>How well the network transmits data. It depends on <b>bandwidth</b>, <b>latency</b> (delay), <b>throughput</b> (actual data transfer rate) and <b>packet loss</b>. A high-performing network delivers data quickly and reliably.</p>" +
    "<h3>2. Reliability</h3><p>Consistent, accurate transmission with minimal errors and downtime:</p><ul class='points'><li><b>Error-free transmission</b> — data integrity is preserved.</li><li><b>Minimal downtime</b> — quick recovery from failures.</li><li><b>Robustness</b> — it withstands unexpected events and conditions.</li></ul>" +
    "<h3>3. Security</h3><p>Protecting data from unauthorised access, modification or destruction:</p><ul class='points'><li><b>Data protection</b> — preventing corruption or loss due to errors, malicious users or physical issues.</li><li><b>Access control</b> — only authorised users reach sensitive information.</li><li><b>Threat mitigation</b> — protection against viruses, malware and other breaches.</li></ul>" +
    "<h3>Other important criteria</h3><ul class='points'><li><b>Scalability</b> — handles increasing data and users.</li><li><b>Cost</b> — balances performance, reliability and security against budget.</li><li><b>Manageability</b> — ease of managing and maintaining the network.</li><li><b>Flexibility</b> — adapts to changing needs and technologies.</li></ul>",
  deep: "<p><b>Measuring performance.</b></p><div class='codebox'>Transmission delay  = L / R        (L = packet size in bits, R = link rate in bit/s)\nPropagation delay   = d / s        (d = distance, s ≈ 2×10⁸ m/s in cable or fibre)\nLatency (one way)   = transmission + propagation + queuing + processing\nThroughput          ≤ bandwidth    (actual delivered rate, reduced by loss and overhead)\n\nExample: 1500-byte packet on 10 Mbit/s over 1000 km\n  transmission = 12000 / 10⁷ = 1.2 ms;  propagation = 10⁶ / 2×10⁸ = 5 ms;  total ≈ 6.2 ms</div>" +
    "<p><b>Measuring reliability.</b> <i>MTBF</i> (mean time between failures) and <i>MTTR</i> (mean time to repair) give availability:</p><div class='codebox'>Availability = MTBF / (MTBF + MTTR)\n99.9% (\"three nines\")  ≈ 8.8 hours of downtime per year\n99.999% (\"five nines\") ≈ 5.3 minutes of downtime per year</div>" +
    "<p><b>Security goals</b> are often summarised as the CIA triad: confidentiality, integrity and availability. Encryption, authentication, firewalls and access control lists implement them.</p>",
  examples: ["Performance: an online game needs low latency; a backup job needs high throughput", "Reliability: hospital and banking networks use redundant links so one cable cut causes no outage", "Security: a college Wi-Fi uses WPA2-Enterprise so only students and staff can log in", "Scalability: a startup's network must grow from 20 to 2000 users"],
  terms: [["Bandwidth", "Maximum data rate a link can carry."], ["Latency", "Delay from sending to receiving."], ["Throughput", "Actual achieved data rate."], ["Packet loss", "Fraction of packets that never arrive."], ["MTBF / MTTR", "Mean time between failures / to repair."]],
  exam: ["Three major criteria: performance, reliability, security.", "Performance factors: bandwidth, latency, throughput, packet loss.", "Reliability: error-free transmission, minimal downtime, robustness.", "Security: data protection, access control, threat mitigation.", "Other criteria: scalability, cost, manageability, flexibility."],
  recap: "Fast (performance), dependable (reliability) and safe (security) — plus able to grow, affordable, manageable and flexible.",
  viz: { id: "v-criteria", intro: "Each criterion is shown on a live link: delay, errors, failures and attacks." },
  sim: { id: "s-criteria", tasks: ["Send a 1500-byte packet at 10 Mbit/s over 1000 km. Which delay is larger, transmission or propagation?", "Raise the bandwidth to 1 Gbit/s. Which delay barely changes, and why?", "Add 5% packet loss and observe the effective throughput."] },
  quiz: [
    { q: "The three major criteria of a data communication network are:", o: ["Speed, size, cost", "Performance, reliability, security", "Bandwidth, latency, jitter", "LAN, MAN, WAN"], a: 1, e: "Performance, reliability and security are the major criteria.", d: 1 },
    { q: "“Access control” belongs to which criterion?", o: ["Performance", "Reliability", "Security", "Scalability"], a: 2, e: "Restricting access to authorised users is a security function.", d: 1 },
    { q: "Throughput means:", o: ["The maximum theoretical rate", "The actual data transfer rate achieved", "The delay of a packet", "The number of users"], a: 1, e: "Throughput is the actual delivered rate; bandwidth is the maximum.", d: 2 },
    { q: "Which criterion describes the ability to handle increasing amounts of data and users?", o: ["Flexibility", "Scalability", "Manageability", "Robustness"], a: 1, e: "Scalability = growth in data and users.", d: 2 },
    { q: "A 12,000-bit packet is sent on a 10 Mbit/s link. The transmission delay is:", o: ["0.12 ms", "1.2 ms", "12 ms", "120 ms"], a: 1, e: "12,000 / 10,000,000 = 0.0012 s = 1.2 ms.", d: 3 },
    { q: "A link has MTBF = 999 h and MTTR = 1 h. Its availability is:", o: ["99.0%", "99.9%", "99.99%", "90%"], a: 1, e: "999 / (999 + 1) = 0.999 = 99.9%.", d: 3 }
  ]
},

{
  id: "u1-modem", unit: "u1", title: "Modem: Definition, Digital and Analog Connection", minutes: 9,
  summary: "What a modem (modulator-demodulator) does, why it is needed, and the difference between its digital and analog connections.",
  source: "Unit I slides 34–36, 42–43",
  intro: "<p>Computers speak in digital pulses, but telephone and cable networks were built for analog signals. The <b>modem</b> is the translator between these two worlds.</p>",
  definition: "A modem (MOdulator–DEModulator) is a device that converts digital signals from a computer into analog signals for transmission over an analog line (modulation), and converts received analog signals back into digital data (demodulation).",
  why: "<p>Without modems, digital data could not travel over the huge existing telephone and cable networks. The modem is a bridge between the digital world of computers and the analog world of communication networks, and it is what lets a device connect to the Internet through an ISP.</p>",
  how: "<ol class='points'><li>The computer produces <b>digital</b> data: 0s and 1s as voltage levels.</li><li>The sending modem <b>modulates</b>: it varies the amplitude, frequency or phase of an analog carrier tone to represent the bits.</li><li>The analog signal travels over the telephone network.</li><li>The receiving modem <b>demodulates</b>: it detects the variations and recovers the 0s and 1s.</li><li>The receiving computer gets the original digital data.</li></ol>" +
    "<p>A modem can modulate and demodulate <b>simultaneously</b>, so it can send and receive at the same time. Because it translates one kind of signal into another, it is also called a <b>signal translator</b>.</p>" +
    "<h3>Digital connection</h3><p>The connection between the <b>computer and the modem</b> is digital: the computer hands the modem bits over a serial (RS-232), USB or Ethernet interface. A <i>digital modem</i> keeps the signal digital and uses line coding to put the data on a digital line.</p>" +
    "<h3>Analog connection</h3><p>An <b>analog modem</b> turns the computer's digital signal into <b>audio-frequency tones</b> that fit the telephone voice band (about 300–3400 Hz), sends them over the analog telephone line, and turns received tones back into digital data.</p>",
  deep: "<p><b>How modems got faster.</b> The voice channel is only about 3 kHz wide, so speed came from smarter modulation rather than a wider band:</p><div class='table-wrap'><table><thead><tr><th>Standard</th><th>Modulation</th><th>Speed</th></tr></thead><tbody>" +
    "<tr><td>Bell 103</td><td>FSK (two tones)</td><td>300 bit/s</td></tr><tr><td>V.22bis</td><td>16-QAM</td><td>2400 bit/s</td></tr><tr><td>V.32bis</td><td>Trellis-coded QAM</td><td>14.4 kbit/s</td></tr>" +
    "<tr><td>V.34</td><td>QAM with adaptive symbol rate</td><td>33.6 kbit/s</td></tr><tr><td>V.90 / V.92</td><td>PCM downstream (digital exchange)</td><td>56 kbit/s down</td></tr></tbody></table></div>" +
    "<p><b>Baud vs bit rate.</b> The baud rate is the number of signal changes (symbols) per second; bit rate = baud × bits per symbol. A 2400-baud modem sending 4 bits per symbol (16-QAM) achieves 9600 bit/s. This is why Unit IV's QPSK and QAM matter.</p>" +
    "<p><b>DTE–DCE.</b> The computer (DTE) connects to the modem (DCE), traditionally via RS-232, where the UART converts parallel bytes into serial bits. Before data flows, the two modems agree on speed and modulation in a <i>handshake</i> — the familiar dial-up screeching.</p>",
  diagram: "<figure class='diagram'><div class='flow'><span class='node'>PC (digital)</span><span class='arrow'>→</span><span class='node b'>Modem: modulate</span><span class='arrow'>∿ analog telephone line ∿</span><span class='node b'>Modem: demodulate</span><span class='arrow'>→</span><span class='node'>PC (digital)</span></div><figcaption>Digital on both ends, analog in the middle.</figcaption></figure>",
  examples: ["Dial-up Internet over a telephone line", "DSL modem on a phone line", "Cable modem on a cable TV network", "Fibre (ONT) modem in FTTH broadband"],
  terms: [["Modulation", "Encoding digital data onto an analog carrier."], ["Demodulation", "Recovering digital data from the received analog signal."], ["Carrier", "The analog tone/wave that is varied to carry data."], ["Baud", "Signal changes (symbols) per second."], ["Handshake", "Initial negotiation of speed and modulation between modems."]],
  exam: ["Modem = modulator + demodulator.", "Converts digital → analog for transmission and analog → digital on reception.", "Acts as a bridge between digital computers and analog networks; also called a signal translator.", "Performs modulation and demodulation simultaneously.", "Analog modem converts digital signals to audio tones for telephone lines."],
  recap: "Modem = translator: digital bits ↔ analog tones. Computer side digital, line side analog (for a dial-up/analog modem).",
  viz: { id: "v-modem", intro: "Watch bits become tones on the phone line and turn back into bits." },
  sim: { id: "s-modem", tasks: ["Send 10110010 with FSK and watch the two tones (mark and space).", "Switch to PSK and to ASK. Which property of the carrier changes in each?", "Increase line noise until bit errors appear. Which scheme survives the most noise?"] },
  quiz: [
    { q: "MODEM stands for:", o: ["Mode Emulator", "Modulator–Demodulator", "Modern Device Manager", "Multiple Data Emitter"], a: 1, e: "It combines modulation and demodulation.", d: 1 },
    { q: "When sending data over an analog phone line, the modem converts:", o: ["Analog to digital", "Digital to analog", "Light to radio", "Voice to text"], a: 1, e: "It modulates the computer's digital signal into analog for transmission.", d: 1 },
    { q: "Why is a modem called a “signal translator”?", o: ["It translates languages", "It translates one signal form into another", "It encrypts data", "It amplifies signals"], a: 1, e: "It turns digital signals into analog and back.", d: 2 },
    { q: "An analog modem fits its signal into the telephone channel using:", o: ["Light pulses", "Audio-frequency tones", "Infrared", "DC voltage levels only"], a: 1, e: "Analog modems use audio tones within the voice band.", d: 2 },
    { q: "A modem sends 2400 symbols per second with 4 bits per symbol. Its bit rate is:", o: ["2400 bit/s", "600 bit/s", "9600 bit/s", "4800 bit/s"], a: 2, e: "Bit rate = baud × bits per symbol = 2400 × 4 = 9600 bit/s.", d: 3 },
    { q: "Why did dial-up modem speeds increase without widening the ~3 kHz telephone channel?", o: ["Better cables were laid", "More bits were packed into each symbol with advanced modulation (QAM)", "Faster computers", "Using simplex mode"], a: 1, e: "Higher-order modulation increased bits per symbol within the same bandwidth.", d: 3 }
  ]
},

{
  id: "u1-modem-types", unit: "u1", title: "Modem Types, Features, Internal and External Modems", minutes: 9,
  summary: "Optical, digital, cable, satellite and dial-up modems; the features of modems; and internal vs external modems compared.",
  source: "Unit I slides 37–41, 44–48",
  intro: "<p>Modems come in many forms, depending on the medium they use (copper, cable TV coax, fibre, satellite radio) and on where they sit (inside or outside the computer).</p>",
  definition: "Modems are classified by medium and technology — optical, digital, cable, satellite and dial-up modems — and by placement: internal modems sit inside the computer; external modems are separate devices connected by a cable.",
  why: "<p>Choosing a modem affects speed, cost, portability and compatibility. The internal-vs-external comparison is a favourite exam question.</p>",
  how: "<h3>Features of a modem</h3><ul class='points'><li>Modulates and demodulates signals simultaneously.</li><li>Connects only a specific number of devices to the Internet.</li><li>Price depends on its features.</li><li>Can be upgraded with a software (firmware) patch.</li><li>Devices must be configured with an Internet Service Provider (ISP) to use it.</li><li>Connecting it to a hub slows it down.</li></ul>" +
    "<h3>Types of modem</h3><ol class='points'><li><b>Optical modem</b> — uses optical fibre instead of metallic media; digital data becomes pulses of light.</li><li><b>Digital modem</b> — converts digital data into digital signals, modulating the data onto a digital carrier.</li><li><b>Cable modem</b> — connects a computer to the ISP over the cable TV network for high-speed data; usually an external device.</li><li><b>Satellite modem</b> — provides Internet through satellite dishes, converting input bits into radio signals and back.</li><li><b>Dial modem (dial-up)</b> — converts between the analog telephone line and the digital computer; up to 56 kbit/s.</li></ol>" +
    "<h3>Internal modem</h3><p>Built into the computer, often pre-installed in an expansion slot (PCI/PCIe). It uses the computer's power supply. Examples: dial-up and fax modems.</p>" +
    "<h3>External modem</h3><p>A separate box connected through a serial (RS-232) or USB cable, with its own power supply. Examples: USB modems (dongles) and Ethernet modems.</p>",
  compare: { head: ["Internal modem", "External modem"], rows: [
    ["Has a built-in UART", "No built-in UART; uses the computer's serial port UART"], ["Lower price", "Comparatively higher price"], ["No external accessories needed", "Needs an RS-232 interface cable"],
    ["Hard to move to another computer", "Easily moved"], ["Inside the computer", "Outside the computer"], ["Fits a vacant expansion slot", "Does not use an expansion slot"],
    ["No holder case required", "Holder case required"], ["Incompatible with some kinds of PCs", "Compatible with all kinds of PCs"], ["Status not directly visible", "Status visible directly (indicator lights)"],
    ["Uses the computer's power supply", "Needs an external power supply"], ["Less likely to be stolen or damaged", "More prone to theft and damage"]] },
  deep: "<p><b>Typical speeds and latency</b> (they vary by provider and plan):</p><div class='table-wrap'><table><thead><tr><th>Type</th><th>Medium</th><th>Typical downstream</th><th>Notes</th></tr></thead><tbody>" +
    "<tr><td>Dial-up</td><td>Telephone voice channel</td><td>Up to 56 kbit/s</td><td>Ties up the phone line</td></tr><tr><td>DSL (ADSL2+)</td><td>Copper local loop</td><td>Up to ~24 Mbit/s</td><td>Speed falls with loop length</td></tr>" +
    "<tr><td>Cable (DOCSIS 3.x)</td><td>Coaxial cable TV network</td><td>100 Mbit/s – 1 Gbit/s+</td><td>Bandwidth shared by a neighbourhood</td></tr><tr><td>Fibre (GPON ONT)</td><td>Optical fibre</td><td>100 Mbit/s – 1 Gbit/s+</td><td>Low loss, low latency</td></tr>" +
    "<tr><td>Satellite (GEO)</td><td>Radio via satellite</td><td>25–100 Mbit/s</td><td>≈ 600 ms round-trip latency</td></tr></tbody></table></div>" +
    "<p><b>The UART difference.</b> A UART (Universal Asynchronous Receiver/Transmitter) converts the computer's parallel bytes into serial bits. An internal modem carries its own UART on the card; a classic external modem relies on the computer's serial port UART and an RS-232 cable.</p>",
  syllabusNote: "The slide says a dial modem transmits “at a speed of 56000 per/sec”. The precise figure is <b>56 kbit/s downstream</b> (V.90/V.92); upstream is 33.6–48 kbit/s, and real connections usually reached about 40–53 kbit/s.",
  examples: ["Internal: dial-up and fax modem cards in older desktops", "External: USB 4G dongles, Ethernet DSL/cable modems", "Optical: the fibre ONT in FTTH broadband", "Satellite: VSAT terminals on ships and in remote villages"],
  terms: [["UART", "Chip converting parallel bytes to serial bits and back."], ["RS-232", "Classic serial interface standard between a computer and a modem."], ["Expansion slot", "Motherboard slot (PCI/PCIe) for adding cards."], ["ISP", "Internet Service Provider that the modem connects to."], ["ONT", "Optical Network Terminal — the fibre modem."]],
  exam: ["Types: optical, digital, cable, satellite, dial-up modems.", "Features: simultaneous modulation/demodulation, upgradable by software, needs ISP configuration, slowed by a hub.", "Internal: inside the PC, expansion slot, uses PC power, built-in UART, cheaper, less theft.", "External: outside, serial/USB cable, own power supply, portable, costlier, status lights visible, compatible with all PCs.", "Examples — internal: dial-up, fax; external: USB, Ethernet modems."],
  recap: "Internal = inside, cheap, own UART, PC power. External = outside, portable, own power, visible status. Types by medium: dial-up, cable, DSL/digital, optical, satellite.",
  viz: { id: "v-modemtypes", intro: "Compare where each modem sits and which medium it connects to." },
  sim: { id: "s-modemtypes", tasks: ["Download a 700 MB file with each modem type. Which takes over a day?", "Compare satellite and fibre for a video call: which number matters more, speed or latency?", "Pick the best modem for a remote village with no cables, and justify it."] },
  quiz: [
    { q: "Which modem uses pulses of light?", o: ["Cable modem", "Optical modem", "Dial modem", "Satellite modem"], a: 1, e: "An optical modem converts data to light pulses on fibre.", d: 1 },
    { q: "An internal modem gets its power from:", o: ["An external adapter", "The computer's power supply", "The telephone line", "Batteries"], a: 1, e: "Internal modems use the computer's power supply.", d: 1 },
    { q: "Which statement about external modems is TRUE?", o: ["They have a built-in UART", "They are cheaper than internal modems", "Their status can be checked directly", "They fit into an expansion slot"], a: 2, e: "External modems show status lights; the other statements describe internal modems.", d: 2 },
    { q: "A cable modem accesses high-speed data through:", o: ["Telephone voice channel", "Cable TV network", "Satellite dish", "Power lines"], a: 1, e: "Cable modems use the cable TV network.", d: 2 },
    { q: "Why does a satellite modem link feel slow for video calls even at 50 Mbit/s?", o: ["Low bandwidth", "High propagation latency (~600 ms round trip via GEO)", "It uses EBCDIC", "It is simplex"], a: 1, e: "Geostationary satellites are ~36,000 km up, causing large delay.", d: 3 },
    { q: "Roughly how long does a 7 MB file take on an ideal 56 kbit/s dial-up link?", o: ["About 1 second", "About 17 minutes", "About 2 hours", "About 10 seconds"], a: 1, e: "7 MB = 56 Mbit; 56,000,000 / 56,000 = 1000 s ≈ 16.7 min.", d: 3 }
  ]
}

  ];
  T.forEach(t => { window.TOPICS.push(t); (t.quiz || []).forEach(q => window.QUIZ.push(Object.assign({ t: t.id }, q))); });
})();
