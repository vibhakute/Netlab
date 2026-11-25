// Vercel function: /api/ai/chat  (logic in lib/ai.mjs; keys from Vercel environment variables)
import { handle } from "../../lib/ai.mjs";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "?";
  const r = await handle("chat", req.body, ip);
  return res.status(r.status).json(r.json);
}
