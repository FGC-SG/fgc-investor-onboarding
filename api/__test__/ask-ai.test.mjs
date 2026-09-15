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
const pinned = [
  ["model defaults to claude-opus-5", req?.model === "claude-opus-5"],
  ["max_tokens capped at 4000", req?.max_tokens === 4000],
  ["system prompt set server-side", typeof req?.system === "string" && req.system.length > 0],
];
for (const [name, ok] of pinned) { ok ? pass++ : fail++; console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`); }

console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"}  —  ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
