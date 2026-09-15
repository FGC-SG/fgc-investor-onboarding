const mod = await import(process.argv[2]);
const handler = mod.default;

function mockRes() {
  const r = { statusCode: 0, body: null, headers: {} };
  r.status = c => { r.statusCode = c; return r; };
  r.json = b => { r.body = b; return r; };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  return r;
}
// Graph responds according to the token string used.
globalThis.fetch = async (url, opts) => {
  const tok = (opts?.headers?.Authorization || "").replace("Bearer ", "");
  if (tok === "bad") return { ok: false, status: 401 };
  if (tok === "outsider") return { ok: true, json: async () => ({ id: "u9", mail: "someone@gmail.com" }) };
  if (tok === "boom") throw new Error("network down");
  if (tok === "cap") return { ok: true, json: async () => ({ id: "ucap", mail: "capture@fgcsg.com" }) };
  return { ok: true, json: async () => ({ id: "u1", mail: "onuma@fgcsg.com" }) };
};

let pass = 0, fail = 0;
async function check(name, req, expect) {
  const res = mockRes();
  await handler(req, res);
  const got = res.statusCode;
  const ok = got === expect;
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${String(got).padEnd(4)} (want ${expect})  ${name}`);
}
const POST = (token, body = { question: "hi" }) => ({
  method: "POST", headers: token ? { authorization: `Bearer ${token}` } : {}, body,
});

console.log("=== auth & policy ===");
await check("non-POST rejected",            { method: "GET", headers: {}, body: {} }, 405);
await check("no bearer token",              POST(null), 401);
await check("token rejected by Graph",      POST("bad"), 401);
await check("VALID TOKEN, WRONG DOMAIN -> must be 403 (open-proxy guard)", POST("outsider"), 403);
await check("identity provider unreachable", POST("boom"), 502);
await check("valid FGC user",               POST("good"), 200);

console.log("\n=== payload validation ===");
await check("empty question",               POST("good", { question: "   " }), 400);
await check("oversized question",           POST("good", { question: "x".repeat(4001) }), 413);
await check("JSON sent as string body",     { method: "POST", headers: { authorization: "Bearer good" }, body: JSON.stringify({ question: "hi" }) }, 200);

console.log("\n=== rate limiting (limit 20 / 10 min, per user) ===");
let limited = null;
for (let i = 0; i < 25; i++) {
  const res = mockRes();
  await handler(POST("good"), res);
  if (res.statusCode === 429 && limited === null) limited = i + 1;
}
// 9 successful calls already consumed above (valid user + string-body test = 2), so the
// cutoff is reported relative to this loop only.
console.log(`  first 429 at call #${limited} of this burst`);
(limited !== null) ? pass++ : fail++;
console.log(`  ${limited !== null ? "PASS" : "FAIL"}  rate limiter engages`);

console.log("\n=== server-side pinning (client cannot override) ===");
const req = globalThis.__lastAnthropicRequest;
// Capture the request built for each language.
async function captureFor(lang) {
  globalThis.__lastAnthropicRequest = null;
  const res = mockRes();
  await handler({ method: "POST", headers: { authorization: "Bearer cap" }, body: { question: "q", context: "ctx", lang } }, res);
  return globalThis.__lastAnthropicRequest;
}
const reqEn = await captureFor("en");
const reqJa = await captureFor("ja");

function parts(r) {
  const sys = Array.isArray(r?.system) ? r.system : [];
  return { sys, stable: sys[0]?.text || "", volatile: sys[1]?.text || "" };
}
const en = parts(reqEn), ja = parts(reqJa);
const pinned = [
  ["model defaults to claude-opus-5", reqEn?.model === "claude-opus-5"],
  ["max_tokens capped at 4000", reqEn?.max_tokens === 4000],
  ["system prompt set server-side", en.sys.length === 2 && en.stable.length > 0],
];
for (const [name, ok] of pinned) { ok ? pass++ : fail++; console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`); }

console.log("\n=== scope limiting & grounding ===");
const scoped = [
  ["EN scope restriction present", /strictly limited to/.test(en.stable)],
  ["EN refuses out-of-scope topics", /do not answer it/i.test(en.stable)],
  ["EN resists scope-override injection", /ignore, expand or override this scope/.test(en.stable)],
  ["JA scope restriction present", en.stable !== ja.stable && /厳密に限定/.test(ja.stable)],
  ["JA refuses out-of-scope topics", /回答しないでください/.test(ja.stable)],
  ["JA resists scope-override injection", /無視・拡大・上書き/.test(ja.stable)],
  ["grounded in app reference content (EN)", /# Japan — FIEA/.test(en.stable) && /# Singapore — SFA/.test(en.stable)],
  ["grounded in app reference content (JA)", /# 日本 — 金商法/.test(ja.stable)],
  ["JP citations carried verbatim in BOTH languages",
    en.stable.includes("金商法2条3項14号・府令10条") && ja.stable.includes("金商法2条3項14号・府令10条")],
  ["SG thresholds carried (EN)", /SGD 2 million/.test(en.stable) && /SGD 10 million/.test(en.stable)],
  ["SG thresholds carried (JA)", /SGD 200万超/.test(ja.stable) && /SGD 1,000万超/.test(ja.stable)],
  ["says information, not legal advice", /not legal advice/i.test(en.stable) && /法的助言ではありません/.test(ja.stable)],
  ["reference sits in the CACHED block", en.stable.length > 2000 && en.sys[0]?.cache_control?.type === "ephemeral"],
  ["volatile context AFTER the cache breakpoint (EN)", /screening context/i.test(en.volatile) && !/screening context/i.test(en.stable)],
  ["volatile context AFTER the cache breakpoint (JA)", /審査コンテキスト/.test(ja.volatile)],
  ["no cache_control on the volatile block", !en.sys[1]?.cache_control],
];
for (const [name, ok] of scoped) { ok ? pass++ : fail++; console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`); }

console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"}  —  ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
