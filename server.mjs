/* =========================================================
   NetLab local server: serves the static site.
   The site itself is plain HTML/CSS/JS and also runs on any
   static host (GitHub Pages, Netlify, Vercel...).
   Start:  npm start   (http://localhost:5050)
   ========================================================= */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
try { process.loadEnvFile(path.join(ROOT, ".env")); } catch { /* no .env file - use the real environment */ }

const PORT = Number(process.env.PORT || 5050);
// On hosting platforms (Render etc.) listen on all interfaces; locally only on this computer.
const HOST = process.env.HOST || (process.env.RENDER || process.env.HOSTED ? "0.0.0.0" : "127.0.0.1");

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".woff2": "font/woff2", ".map": "application/json"
};
const BLOCKED = [/^\.env/, /^\.git/, /^\.vercel/, /^node_modules/, /^server\.mjs$/, /^package(-lock)?\.json$/];
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
const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method not allowed");
  return serveStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`NetLab running at http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
});
