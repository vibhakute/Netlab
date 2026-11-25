/* =========================================================
   NetLab local server: serves the static site and the AI API.
   The AI logic lives in lib/ai.mjs (also used by the Vercel
   functions in api/ai/). Keys come only from environment
   variables / the local .env file and never reach the browser.
     GET  /api/ai/status   POST /api/ai/chat   POST /api/ai/notes
   Start:  npm install  then  npm run dev   (http://localhost:5050)
   ========================================================= */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
try { process.loadEnvFile(path.join(ROOT, ".env")); } catch { /* no .env file - use the real environment */ }
const { handle, statusInfo } = await import("./lib/ai.mjs"); // after .env is loaded

const PORT = Number(process.env.PORT || 5050);
const HOST = process.env.HOST || "127.0.0.1";
const MAX_BODY = 400 * 1024; // bytes of JSON accepted per request

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".woff2": "font/woff2", ".map": "application/json"
};
const BLOCKED = [/^\.env/, /^\.git/, /^\.vercel/, /^node_modules/, /^server\.mjs$/, /^lib\//, /^api\//, /^package(-lock)?\.json$/];
function serveStatic(req, res) {
  let rel;
  try { rel = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/+/, ""); } catch { return send(res, 400, "Bad request"); }
  if (!rel) rel = "index.html";
  const file = path.resolve(ROOT, rel);
  if (!file.startsWith(ROOT + path.sep) || BLOCKED.some(r => r.test(rel))) return send(res, 404, "Not found");
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, "Not found");
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "Content-Length": st.size, "X-Content-Type-Options": "nosniff", "Cache-Control": "no-cache" });
    fs.createReadStream(file).pipe(res);
  });
}
function send(res, code, text) { res.writeHead(code, { "Content-Type": "text/plain; charset=utf-8" }); res.end(text); }
function json(res, code, obj) { res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }); res.end(JSON.stringify(obj)); }
function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", c => { size += c.length; if (size > MAX_BODY) { reject(Object.assign(new Error("Request too large."), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); } catch { reject(Object.assign(new Error("Invalid JSON."), { status: 400 })); } });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url.split("?")[0];
  if (!url.startsWith("/api/")) {
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method not allowed");
    return serveStatic(req, res);
  }
  if (url === "/api/ai/status" && req.method === "GET") { const r = await handle("status"); return json(res, r.status, r.json); }
  if ((url === "/api/ai/chat" || url === "/api/ai/notes") && req.method === "POST") {
    if (!/^application\/json/.test(req.headers["content-type"] || "")) return json(res, 415, { error: "Send JSON." });
    let body;
    try { body = await readJson(req); } catch (e) { return json(res, e.status || 400, { error: e.message }); }
    const r = await handle(url === "/api/ai/chat" ? "chat" : "notes", body, req.socket.remoteAddress || "?");
    return json(res, r.status, r.json);
  }
  return json(res, 404, { error: "Unknown API route." });
});

server.listen(PORT, HOST, async () => {
  console.log(`NetLab running at http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
  const s = await statusInfo();
  if (s.configured) console.log(`AI assistant: ${s.providerName} (${s.model})${s.free ? " — free" : " — paid API"}.`);
  else console.log("AI assistant: offline mode. " + s.setupHint);
});
