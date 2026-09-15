// Server-side proxy for the AI Q&A tab.
//
// Replaces the previous browser-side call to api.anthropic.com, which required
// shipping an API key to the client and offered no rate limiting. The Anthropic
// key is read here from ANTHROPIC_API_KEY (server-only — deliberately NOT
// VITE_-prefixed, so Vite can never inline it into the client bundle).
//
// Callers are authenticated with the Entra access token the SPA already holds.

import Anthropic from "@anthropic-ai/sdk";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// ─── Policy ───────────────────────────────────────────────────────────────────
// Only these email domains may use the proxy. A valid Microsoft token alone is
// NOT sufficient: Graph /me succeeds for any Microsoft account on earth, so
// without this check the endpoint would be an open LLM proxy.
const ALLOWED_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS || "fgcsg.com")
  .split(",")
  .map(d => d.trim().toLowerCase())
  .filter(Boolean);

const MAX_QUESTION_CHARS = 4000;
const MAX_CONTEXT_CHARS = 2000;
const MAX_TOKENS = 4000;

// Model is env-configurable so cost can be tuned without a code change.
// claude-opus-5   — strongest reasoning, best for statutory interpretation ($5/$25 per MTok)
// claude-sonnet-5 — mid tier ($2/$10)
// claude-haiku-4-5 — cheapest ($1/$5)
// Allowlisted rather than free-form: an arbitrary env value would fail at
// request time, and a typo should not silently downgrade legal advice.
const ALLOWED_MODELS = ["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5"];
const MODEL = ALLOWED_MODELS.includes(process.env.AI_MODEL || "")
  ? (process.env.AI_MODEL as string)
  : "claude-opus-5";

// Sliding-window rate limit, per authenticated user.
// NOTE: this lives in the function instance's memory. Vercel may run several
// instances concurrently, so the effective ceiling is (limit × live instances).
// Adequate for a small internal team; move to Vercel KV if that stops holding.
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function rateLimited(userId: string): boolean {
  const now = Date.now();
  const recent = (hits.get(userId) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(userId, recent);
    return true;
  }
  recent.push(now);
  hits.set(userId, recent);
  if (hits.size > 500) {
    // Bound memory on a long-lived instance.
    for (const [k, v] of hits) if (v.every(t => now - t >= RATE_WINDOW_MS)) hits.delete(k);
  }
  return false;
}

// ─── Prompts ──────────────────────────────────────────────────────────────────
const systemPrompt = (context: string, lang: "ja" | "en") =>
  lang === "en"
    ? `You are an AI assistant supporting FGC's investor qualification screening. You are well versed in Japan's FIEA (art. 34-4, art. 63, Enforcement Order art. 15-31) and Singapore's SFA s. 4A. Current context: ${context}. Answer in English, concisely and accurately, citing the underlying provisions.`
    : `あなたはFGCの投資家適格性審査を支援するAIアシスタントです。日本の金商法（第34条の4、第63条、施行令15条の31）およびシンガポールSFA Section 4Aに精通しています。現在のコンテキスト: ${context}。日本語で簡潔かつ正確に、条文根拠付きで回答してください。`;

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ask-ai: ANTHROPIC_API_KEY is not set");
    return res.status(500).json({ error: "server_not_configured" });
  }

  // 1. Bearer token ----------------------------------------------------------
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return res.status(401).json({ error: "missing_token" });

  // 2. Validate the token by using it. A 200 from Graph proves the token is
  //    genuine, unexpired and unrevoked — no local JWT verification needed.
  let profile: { id?: string; mail?: string; userPrincipalName?: string };
  try {
    const me = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!me.ok) return res.status(401).json({ error: "invalid_token" });
    profile = await me.json();
  } catch (e) {
    console.error("ask-ai: Graph lookup failed", e);
    return res.status(502).json({ error: "identity_check_failed" });
  }

  // 3. Restrict to the organisation ------------------------------------------
  const email = (profile.mail || profile.userPrincipalName || "").toLowerCase();
  const domain = email.split("@")[1];
  if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
    console.warn(`ask-ai: rejected caller outside allowed domains: ${domain || "<none>"}`);
    return res.status(403).json({ error: "forbidden" });
  }

  const userId = profile.id || email;
  if (rateLimited(userId)) {
    res.setHeader("Retry-After", String(Math.ceil(RATE_WINDOW_MS / 1000)));
    return res.status(429).json({ error: "rate_limited" });
  }

  // 4. Validate the payload ---------------------------------------------------
  const body = (typeof req.body === "string" ? safeParse(req.body) : req.body) || {};
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const context = typeof body.context === "string" ? body.context : "";
  const lang: "ja" | "en" = body.lang === "en" ? "en" : "ja";

  if (!question) return res.status(400).json({ error: "question_required" });
  if (question.length > MAX_QUESTION_CHARS) return res.status(413).json({ error: "question_too_long" });

  // 5. Call Claude ------------------------------------------------------------
  // The model, token ceiling and system prompt are fixed server-side; the client
  // cannot influence them.
  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt(context.slice(0, MAX_CONTEXT_CHARS), lang),
      messages: [{ role: "user", content: question }],
    });

    if (message.stop_reason === "refusal") {
      return res.status(200).json({ answer: "", refused: true });
    }

    const answer = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map(b => b.text)
      .join("");

    return res.status(200).json({ answer });
  } catch (err) {
    // Never surface upstream error detail to the browser — it can carry
    // account and key information.
    if (err instanceof Anthropic.RateLimitError) {
      console.warn("ask-ai: upstream rate limit");
      return res.status(429).json({ error: "rate_limited" });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("ask-ai: ANTHROPIC_API_KEY rejected upstream");
      return res.status(500).json({ error: "server_not_configured" });
    }
    console.error("ask-ai: upstream failure", err);
    return res.status(502).json({ error: "upstream_error" });
  }
}

function safeParse(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}
