/* Quiz bank: { t: topicId, q: question, o: options, a: correct index, e: explanation } */
window.QUIZ = (window.QUIZ || []).concat([
/* intro */
{ t:"intro", q:"Which characteristic of data communication means data must arrive without errors?", o:["Delivery","Accuracy","Timeliness","Jitter"], a:1, e:"Accuracy means the data must be delivered correctly. Altered data is unusable." },
{ t:"intro", q:"Jitter refers to:", o:["Data reaching the wrong device","The variation in packet arrival time","The total bandwidth of a link","Encryption of data"], a:1, e:"Jitter is uneven delay between packets. It causes choppy audio and video." },
{ t:"intro", q:"Late delivery of live video makes it useless. Which characteristic does this describe?", o:["Timeliness","Accuracy","Delivery","Security"], a:0, e:"Timeliness means data must arrive on time, especially for real-time audio and video." },
{ t:"intro", q:"Data communication is the exchange of data between two devices via:", o:["A protocol only","A transmission medium","An operating system","A compiler"], a:1, e:"Data travels over a transmission medium such as copper, fibre or radio waves." },
/* components */
{ t:"components", q:"How many components does a data communication system have?", o:["3","4","5","7"], a:2, e:"Message, Sender, Receiver, Transmission Medium and Protocol." },
{ t:"components", q:"Which component is a set of rules that governs communication?", o:["Medium","Message","Protocol","Receiver"], a:2, e:"A protocol defines the rules both devices must follow to understand each other." },
{ t:"components", q:"Which element of a protocol defines the structure or format of data?", o:["Semantics","Timing","Syntax","Encoding"], a:2, e:"Syntax is the format; semantics is the meaning; timing is when and how fast." },
{ t:"components", q:"Which element of a protocol specifies when data should be sent and how fast?", o:["Syntax","Semantics","Timing","Routing"], a:2, e:"Timing covers when data should be sent and at what speed." },
/* data-flow */
{ t:"data-flow", q:"A keyboard sending data to a computer is an example of:", o:["Simplex","Half-duplex","Full-duplex","Multiplex"], a:0, e:"A keyboard only sends; it never receives from the computer. That's one-way: simplex." },
{ t:"data-flow", q:"A walkie-talkie works in which mode?", o:["Simplex","Half-duplex","Full-duplex","Broadcast"], a:1, e:"Both sides can talk, but only one at a time: half-duplex." },
{ t:"data-flow", q:"A telephone conversation is an example of:", o:["Simplex","Half-duplex","Full-duplex","None"], a:2, e:"Both people can talk and listen at the same time: full-duplex." },
{ t:"data-flow", q:"What is the binary ASCII code of the letter 'A' (decimal 65)?", o:["01000001","01100001","01000010","00100001"], a:0, e:"65 = 64 + 1 = 01000001." },
/* network-types */
{ t:"network-types", q:"Bluetooth earbuds connected to a phone form a:", o:["LAN","PAN","MAN","WAN"], a:1, e:"A Personal Area Network covers about 10 metres around one person." },
{ t:"network-types", q:"A network covering a college campus is typically a:", o:["PAN","LAN","MAN","WAN"], a:1, e:"A LAN covers a building or campus." },
{ t:"network-types", q:"The Internet is the largest example of a:", o:["LAN","MAN","WAN","PAN"], a:2, e:"The Internet spans the whole world: a Wide Area Network (a network of networks)." },
{ t:"network-types", q:"In which model can every computer act as both client and server?", o:["Client-server","Peer-to-peer","Mainframe","Star"], a:1, e:"In peer-to-peer networks all nodes are equal." },
/* topologies */
{ t:"topologies", q:"How many links are needed for a full mesh of 6 devices?", o:["6","12","15","30"], a:2, e:"n(n-1)/2 = 6 x 5 / 2 = 15." },
{ t:"topologies", q:"In which topology does the failure of the central device bring down the whole network?", o:["Mesh","Star","Ring","Bus"], a:1, e:"In a star, every device connects through the central hub/switch, making it a single point of failure." },
{ t:"topologies", q:"Which topology uses a single backbone cable with terminators?", o:["Bus","Star","Ring","Tree"], a:0, e:"A bus uses one shared backbone; terminators stop signal reflection." },
{ t:"topologies", q:"Which topology is the most reliable but most expensive?", o:["Bus","Ring","Star","Mesh"], a:3, e:"Mesh has dedicated links between every pair of devices: very reliable, very costly." },
/* media */
{ t:"media", q:"Fibre-optic cable transmits data using:", o:["Electrical current","Radio waves","Light pulses","Sound waves"], a:2, e:"Fibre carries light using total internal reflection." },
{ t:"media", q:"Why are the wires in twisted-pair cable twisted?", o:["To save space","To reduce interference and crosstalk","To increase voltage","To make it stronger"], a:1, e:"Twisting cancels out electromagnetic interference and crosstalk." },
{ t:"media", q:"Which unguided medium requires line-of-sight?", o:["Radio waves","Microwaves","AM radio","None"], a:1, e:"Microwaves are unidirectional, so antennas must be aligned in line of sight." },
{ t:"media", q:"A TV remote control typically uses:", o:["Microwave","Infrared","Radio","Fibre"], a:1, e:"Infrared is short-range and cannot pass through walls, ideal for remotes." },
/* devices */
{ t:"devices", q:"Which device forwards data using IP addresses?", o:["Hub","Switch","Router","Repeater"], a:2, e:"Routers work at the Network layer (3) and use IP addresses." },
{ t:"devices", q:"A switch operates at which OSI layer?", o:["Physical","Data Link","Network","Transport"], a:1, e:"Switches use MAC addresses at the Data Link layer (2)." },
{ t:"devices", q:"Which device sends incoming data out of every port?", o:["Hub","Switch","Router","Bridge"], a:0, e:"A hub is a dumb multiport repeater that broadcasts to all ports." },
{ t:"devices", q:"Which device breaks up broadcast domains?", o:["Hub","Switch","Repeater","Router"], a:3, e:"Routers do not forward broadcasts, so each interface is its own broadcast domain." },
/* osi */
{ t:"osi", q:"How many layers are in the OSI model?", o:["4","5","7","8"], a:2, e:"Physical, Data Link, Network, Transport, Session, Presentation, Application." },
{ t:"osi", q:"Which OSI layer is responsible for routing?", o:["Data Link","Network","Transport","Session"], a:1, e:"The Network layer (3) handles logical addressing and routing." },
{ t:"osi", q:"The PDU at the Data Link layer is called a:", o:["Segment","Packet","Frame","Bit"], a:2, e:"Transport = segment, Network = packet, Data Link = frame, Physical = bits." },
{ t:"osi", q:"Encryption and compression happen at which layer?", o:["Application","Presentation","Session","Transport"], a:1, e:"The Presentation layer (6) handles translation, encryption and compression." },
/* tcpip */
{ t:"tcpip", q:"How many layers does the TCP/IP model have?", o:["4","5","6","7"], a:0, e:"Application, Transport, Internet and Network Access." },
{ t:"tcpip", q:"The TCP/IP Application layer combines which OSI layers?", o:["1 and 2","3 and 4","5, 6 and 7","4 and 5"], a:2, e:"Session, Presentation and Application are merged into one Application layer." },
{ t:"tcpip", q:"IP and ICMP belong to which TCP/IP layer?", o:["Application","Transport","Internet","Network Access"], a:2, e:"The Internet layer handles logical addressing and routing." },
{ t:"tcpip", q:"Which statement is TRUE?", o:["OSI is the model used on the Internet","TCP/IP is a practical model; OSI is a reference model","TCP/IP has 7 layers","OSI was created by DARPA"], a:1, e:"TCP/IP is implemented on the Internet; OSI is a conceptual reference by ISO." },
/* transmission */
{ t:"transmission", q:"Which signal has a finite set of discrete values?", o:["Analog","Digital","Sine wave","Carrier"], a:1, e:"Digital signals have discrete values (e.g. 0 and 1)." },
{ t:"transmission", q:"In asynchronous transmission, each byte is framed by:", o:["A clock signal","Start and stop bits","A header and trailer","A CRC"], a:1, e:"Async uses a start bit (0) and stop bit(s) (1) around each byte." },
{ t:"transmission", q:"Which line coding scheme has a transition in the middle of every bit?", o:["NRZ-L","NRZ-I","Manchester","Unipolar"], a:2, e:"Manchester encoding always transitions mid-bit, making it self-clocking." },
{ t:"transmission", q:"Using Nyquist, a noiseless 3000 Hz channel with 2 signal levels can carry at most:", o:["3000 bps","6000 bps","9000 bps","12000 bps"], a:1, e:"2 x B x log2(L) = 2 x 3000 x 1 = 6000 bps." },
/* multiplexing */
{ t:"multiplexing", q:"FM radio stations share the airwaves using:", o:["TDM","FDM","WDM","CDM"], a:1, e:"Each station has its own frequency band: Frequency Division Multiplexing." },
{ t:"multiplexing", q:"WDM is used in:", o:["Twisted pair","Coaxial cable","Fibre optics","Radio"], a:2, e:"Wavelength Division Multiplexing combines different light colours on one fibre." },
{ t:"multiplexing", q:"Which TDM type allocates slots only to devices that have data?", o:["Synchronous TDM","Statistical TDM","FDM","WDM"], a:1, e:"Statistical (asynchronous) TDM assigns slots dynamically, wasting fewer slots." },
{ t:"multiplexing", q:"The device that separates combined signals at the receiver is a:", o:["MUX","DEMUX","Modem","Router"], a:1, e:"MUX combines; DEMUX separates." },
/* switching */
{ t:"switching", q:"The traditional telephone network uses:", o:["Packet switching","Circuit switching","Message switching","Cell switching"], a:1, e:"A dedicated circuit is reserved for the whole call." },
{ t:"switching", q:"The Internet primarily uses:", o:["Circuit switching","Datagram packet switching","Message switching","Virtual circuits only"], a:1, e:"IP packets are routed independently: datagram packet switching." },
{ t:"switching", q:"Which switching method uses store-and-forward of entire messages?", o:["Circuit","Packet","Message","None"], a:2, e:"Message switching stores the complete message at each node before forwarding." },
{ t:"switching", q:"In datagram switching, packets of the same message:", o:["Always follow the same path","May take different paths and arrive out of order","Need a setup phase","Reserve bandwidth"], a:1, e:"Each datagram is routed independently." },
/* errors */
{ t:"errors", q:"Data 1011001 has four 1s. What is the even parity bit?", o:["0","1","2","Not possible"], a:0, e:"Four 1s is already even, so the even parity bit is 0." },
{ t:"errors", q:"Simple parity check cannot detect:", o:["Single-bit errors","An odd number of bit errors","An even number of bit errors","Any error"], a:2, e:"If two bits flip, parity stays the same, so the error goes undetected." },
{ t:"errors", q:"CRC uses which type of division?", o:["Decimal","Modulo-2 (XOR)","Floating point","Integer"], a:1, e:"CRC divides using modulo-2 arithmetic (XOR, no carries)." },
{ t:"errors", q:"Which technique can CORRECT single-bit errors?", o:["Parity","Checksum","CRC","Hamming code"], a:3, e:"Hamming code locates the erroneous bit position using the syndrome." },
/* ip-addressing */
{ t:"ip-addressing", q:"An IPv4 address is how many bits long?", o:["16","32","64","128"], a:1, e:"IPv4 = 32 bits, written as four 8-bit octets." },
{ t:"ip-addressing", q:"What class is the address 172.20.5.1?", o:["A","B","C","D"], a:1, e:"Class B ranges from 128 to 191 in the first octet." },
{ t:"ip-addressing", q:"Which of these is a private IP address?", o:["8.8.8.8","192.168.1.5","172.32.0.1","200.1.1.1"], a:1, e:"192.168.0.0/16 is private. 172.32.x.x is outside the 172.16-31 private range." },
{ t:"ip-addressing", q:"127.0.0.1 is known as the:", o:["Broadcast address","Default gateway","Loopback address","Network address"], a:2, e:"127.0.0.1 refers to the local machine itself." },
/* subnetting */
{ t:"subnetting", q:"How many usable hosts are in a /26 network?", o:["30","62","64","126"], a:1, e:"Host bits = 6; 2^6 - 2 = 62." },
{ t:"subnetting", q:"What is the subnet mask for /27?", o:["255.255.255.192","255.255.255.224","255.255.255.240","255.255.255.128"], a:1, e:"/27 = 27 ones = 255.255.255.224 (block size 32)." },
{ t:"subnetting", q:"What is the broadcast address of 192.168.1.130/26?", o:["192.168.1.127","192.168.1.191","192.168.1.255","192.168.1.128"], a:1, e:"Block size 64; 130 is in the .128 block; broadcast = .191." },
{ t:"subnetting", q:"Which prefix gives exactly 2 usable hosts (used for router links)?", o:["/28","/29","/30","/32"], a:2, e:"/30 has 4 addresses, minus network and broadcast = 2 usable." },
/* mac-arp */
{ t:"mac-arp", q:"A MAC address is how many bits long?", o:["32","48","64","128"], a:1, e:"MAC addresses are 48 bits, written as 6 pairs of hex digits." },
{ t:"mac-arp", q:"ARP is used to find:", o:["IP address from domain name","MAC address from IP address","IP address from MAC","Port from IP"], a:1, e:"ARP resolves a known IP address to its MAC address on the local network." },
{ t:"mac-arp", q:"An ARP request is sent as a:", o:["Unicast","Broadcast","Multicast","Anycast"], a:1, e:"The sender doesn't know the MAC, so it broadcasts to FF:FF:FF:FF:FF:FF." },
{ t:"mac-arp", q:"The first 24 bits of a MAC address identify the:", o:["Network","Manufacturer (OUI)","Host","VLAN"], a:1, e:"The Organizationally Unique Identifier identifies the vendor." },
/* routing */
{ t:"routing", q:"RIP uses which metric?", o:["Bandwidth","Delay","Hop count","Cost"], a:2, e:"RIP counts hops, with a maximum of 15 (16 = unreachable)." },
{ t:"routing", q:"OSPF uses which algorithm?", o:["Bellman-Ford","Dijkstra","Kruskal","Prim"], a:1, e:"OSPF is link-state and runs Dijkstra's shortest-path-first algorithm." },
{ t:"routing", q:"Which protocol routes traffic between autonomous systems on the Internet?", o:["RIP","OSPF","BGP","ARP"], a:2, e:"BGP is the path-vector exterior gateway protocol of the Internet." },
{ t:"routing", q:"The default route is written as:", o:["127.0.0.1/8","255.255.255.255/32","0.0.0.0/0","192.168.0.0/16"], a:2, e:"0.0.0.0/0 matches every destination, so it is used when no other route matches." },
/* switching-vlan */
{ t:"switching-vlan", q:"A switch learns MAC addresses from the:", o:["Destination MAC","Source MAC","IP header","Router"], a:1, e:"It records the source MAC and the incoming port." },
{ t:"switching-vlan", q:"What does a switch do with a frame for an unknown destination MAC?", o:["Drops it","Floods it out of all other ports","Sends it to the router","Returns it"], a:1, e:"Unknown unicast frames are flooded to every port except the incoming one." },
{ t:"switching-vlan", q:"Which protocol prevents loops between switches?", o:["STP","VLAN","ARP","RIP"], a:0, e:"Spanning Tree Protocol blocks redundant paths to prevent loops." },
{ t:"switching-vlan", q:"VLAN tags on trunk links are defined by:", o:["802.3","802.11","802.1Q","802.1D"], a:2, e:"IEEE 802.1Q adds a VLAN tag to Ethernet frames on trunks." },
/* tcp-udp */
{ t:"tcp-udp", q:"The correct order of the TCP three-way handshake is:", o:["SYN, ACK, SYN-ACK","SYN, SYN-ACK, ACK","ACK, SYN, FIN","SYN, FIN, ACK"], a:1, e:"Client SYN, server SYN-ACK, client ACK." },
{ t:"tcp-udp", q:"Which protocol is best for live video streaming and online gaming?", o:["TCP","UDP","FTP","SMTP"], a:1, e:"UDP is fast with no retransmission delay, ideal for real-time traffic." },
{ t:"tcp-udp", q:"The UDP header size is:", o:["8 bytes","20 bytes","32 bytes","40 bytes"], a:0, e:"UDP's header is only 8 bytes: source port, destination port, length, checksum." },
{ t:"tcp-udp", q:"TCP prevents a fast sender overwhelming a slow receiver using:", o:["Checksum","Sliding window flow control","Port numbers","Multiplexing"], a:1, e:"The receiver advertises a window size that limits how much the sender can send." },
/* dns */
{ t:"dns", q:"Which DNS record maps a domain to an IPv6 address?", o:["A","AAAA","MX","CNAME"], a:1, e:"AAAA = IPv6, A = IPv4." },
{ t:"dns", q:"Which DNS record identifies a domain's mail server?", o:["NS","PTR","MX","TXT"], a:2, e:"MX (Mail Exchange) records point to mail servers." },
{ t:"dns", q:"DNS normally uses which port?", o:["UDP 53","TCP 80","UDP 67","TCP 443"], a:0, e:"DNS queries use UDP port 53 (TCP 53 for large responses)." },
{ t:"dns", q:"After the root server, the resolver next queries the:", o:["Authoritative server","TLD server","DHCP server","Web server"], a:1, e:"Root -> TLD (.com) -> Authoritative." },
/* dhcp */
{ t:"dhcp", q:"What does DORA stand for?", o:["Discover, Offer, Request, Acknowledge","Data, Order, Route, Accept","Deliver, Obtain, Reply, Assign","Detect, Open, Read, Approve"], a:0, e:"The four DHCP messages: Discover, Offer, Request, Acknowledge." },
{ t:"dhcp", q:"A Windows PC showing 169.254.10.20 most likely means:", o:["It has a static IP","DHCP failed (APIPA)","It's on the Internet","It's a loopback"], a:1, e:"169.254.x.x is APIPA, self-assigned when no DHCP server responds." },
{ t:"dhcp", q:"DHCP servers listen on which UDP port?", o:["53","67","68","80"], a:1, e:"Server = UDP 67, client = UDP 68." },
{ t:"dhcp", q:"Which of these does DHCP NOT normally provide?", o:["IP address","Default gateway","DNS server","MAC address"], a:3, e:"The MAC address is burned into the NIC; DHCP doesn't assign it." },
/* http */
{ t:"http", q:"HTTPS uses which default port?", o:["80","8080","443","21"], a:2, e:"HTTP = 80, HTTPS = 443." },
{ t:"http", q:"HTTP status 404 means:", o:["Server error","Not Found","OK","Moved Permanently"], a:1, e:"4xx are client errors; 404 = the resource was not found." },
{ t:"http", q:"Which HTTP method is typically used to submit a form?", o:["GET","POST","HEAD","DELETE"], a:1, e:"POST sends data in the request body to create or process something." },
{ t:"http", q:"HTTP is described as 'stateless' because:", o:["It has no headers","Each request is independent","It uses UDP","It cannot send images"], a:1, e:"The server doesn't remember previous requests; cookies/sessions add state." },
/* security */
{ t:"security", q:"What does the 'I' in the CIA triad stand for?", o:["Identity","Integrity","Internet","Inspection"], a:1, e:"Confidentiality, Integrity, Availability." },
{ t:"security", q:"Which encryption type uses the same key for encryption and decryption?", o:["Symmetric","Asymmetric","Hashing","Digital signature"], a:0, e:"Symmetric encryption (e.g. AES) uses one shared key." },
{ t:"security", q:"An IDS differs from an IPS because an IDS:", o:["Blocks attacks","Only detects and alerts","Encrypts traffic","Routes packets"], a:1, e:"IDS = detection and alerting; IPS = detection and blocking." },
{ t:"security", q:"Flooding a server with traffic from many machines so it can't respond is a:", o:["Phishing attack","DDoS attack","SQL injection","Spoofing"], a:1, e:"Distributed Denial of Service attacks overwhelm a target from many sources." },
/* wireless */
{ t:"wireless", q:"Wi-Fi is defined by which IEEE standard family?", o:["802.3","802.11","802.15","802.1Q"], a:1, e:"802.11 = wireless LAN (Wi-Fi). 802.3 = Ethernet." },
{ t:"wireless", q:"Which Wi-Fi band travels further and penetrates walls better?", o:["2.4 GHz","5 GHz","6 GHz","60 GHz"], a:0, e:"Lower frequencies have longer range and better penetration." },
{ t:"wireless", q:"Wi-Fi uses which media access method?", o:["CSMA/CD","CSMA/CA","Token passing","Polling"], a:1, e:"Wireless devices can't reliably detect collisions, so they avoid them (CA)." },
{ t:"wireless", q:"SDN separates which two planes?", o:["Physical and logical","Control and data","Upper and lower","Public and private"], a:1, e:"Software-Defined Networking separates decision-making (control) from forwarding (data)." }
]);

/* Difficulty (1 easy, 2 medium, 3 hard) for the original additional-topic questions, in question order. */
(function () {
  const D = {
    intro: [1, 2, 2, 1], components: [1, 1, 2, 2], "data-flow": [1, 1, 1, 2], "network-types": [1, 1, 1, 2], topologies: [3, 2, 1, 1],
    media: [1, 2, 2, 1], devices: [2, 1, 1, 3], osi: [1, 2, 2, 2], tcpip: [1, 2, 2, 3], transmission: [1, 2, 2, 3], multiplexing: [1, 1, 2, 2],
    switching: [1, 1, 2, 2], errors: [2, 3, 2, 2], "ip-addressing": [1, 2, 3, 1], subnetting: [2, 2, 3, 3], "mac-arp": [1, 2, 2, 2],
    routing: [1, 2, 2, 2], "switching-vlan": [2, 2, 2, 3], "tcp-udp": [1, 1, 2, 2], dns: [2, 2, 2, 3], dhcp: [1, 2, 2, 2], http: [1, 1, 1, 2],
    security: [1, 1, 2, 1], wireless: [1, 2, 3, 3]
  };
  const seen = {};
  window.QUIZ.forEach(q => { if (q.d || !D[q.t]) return; const i = seen[q.t] = (seen[q.t] || 0); q.d = D[q.t][i] || 2; seen[q.t] = i + 1; });
})();
