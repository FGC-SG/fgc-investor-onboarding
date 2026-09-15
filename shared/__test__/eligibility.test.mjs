// Eligibility regression test.
//
// Enumerates EVERY reachable answer combination in both jurisdictions —
// including partially-answered states — and compares the resulting
// determination against a committed baseline.
//
// The point: no change to this app may alter an investor eligibility outcome
// without someone deliberately regenerating the baseline and that change
// appearing in a diff. Translation, refactoring and UI work must all be
// outcome-neutral; this is what proves it.
//
//   npm run test:eval          check against the baseline
//   npm run test:eval:update   regenerate it (review the diff!)

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const BASELINE = path.join(here, "eligibility-baseline.json");
const UPDATE = process.argv.includes("--update");

const { evalJP, evalSG, JP_QUESTIONS, SG_QUESTIONS } = await import(process.argv[2]);

const SG_ENTITIES = [["individual", "individual"], ["corporation", "corporation"]];

// Cases are identified by OPTION INDEX, not by value, so the same case set
// survives any renaming of the underlying keys.
const idxVals = q => [null, ...q.options.map((_, i) => i)];
const put = (q, i) => (i === null ? undefined : q.options[i].key);

function cartesian(qs) {
  let acc = [{}];
  for (const q of qs) {
    const next = [];
    for (const base of acc) for (const i of idxVals(q)) next.push({ ...base, [q.id]: i });
    acc = next;
  }
  return acc;
}
const toAnswers = (qs, m) => {
  const a = {};
  for (const q of qs) { const v = put(q, m[q.id]); if (v !== undefined) a[q.id] = v; }
  return a;
};
const caseId = (scope, disc, m) =>
  `${scope}|${disc}|` + Object.keys(m).sort().map(k => `${k}=${m[k]}`).join(",");

function visibleFor(all, discQ, di) {
  if (!discQ) return all;
  if (di === null) return all.filter(q => !q.forType);
  const v = discQ.options[di].key;
  return all.filter(q => !q.forType || q.forType === v);
}

const results = [];
for (const cat of Object.keys(JP_QUESTIONS)) {
  const all = JP_QUESTIONS[cat];
  const discQ = all.find(q => q.id === "q_type");
  for (const di of discQ ? idxVals(discQ) : [undefined]) {
    const visible = visibleFor(all, discQ, di);
    for (const m of cartesian(visible)) {
      const r = evalJP(cat, toAnswers(visible, m));
      results.push({ id: caseId("JP", cat, m), met: r.met === null ? "null" : r.met, ja: r.reason.ja, en: r.reason.en });
    }
  }
}
for (const [entity, bucket] of SG_ENTITIES) {
  const all = SG_QUESTIONS[bucket];
  const discQ = all.find(q => q.id === "sg_corp_type");
  for (const di of discQ ? idxVals(discQ) : [undefined]) {
    const visible = visibleFor(all, discQ, di);
    for (const m of cartesian(visible)) {
      const r = evalSG(entity, toAnswers(visible, m));
      results.push({ id: caseId("SG", bucket, m), met: r.met === null ? "null" : r.met, ja: r.reason.ja, en: r.reason.en });
    }
  }
}
results.sort((a, b) => a.id.localeCompare(b.id));

if (UPDATE) {
  fs.writeFileSync(BASELINE, JSON.stringify(results, null, 1) + "\n");
  console.log(`Baseline regenerated: ${results.length} cases -> ${path.relative(process.cwd(), BASELINE)}`);
  console.log("REVIEW THE DIFF. Every changed line is a changed determination.");
  process.exit(0);
}

if (!fs.existsSync(BASELINE)) {
  console.error("No baseline found. Run: npm run test:eval:update");
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
const bMap = new Map(baseline.map(r => [r.id, r]));
const nMap = new Map(results.map(r => [r.id, r]));

let outcome = [], wording = [], missing = [], added = [];
for (const [id, b] of bMap) {
  const n = nMap.get(id);
  if (!n) { missing.push(id); continue; }
  if (n.met !== b.met) outcome.push({ id, was: b.met, now: n.met });
  else if (n.ja !== b.ja || n.en !== b.en) wording.push({ id, was: b.ja, now: n.ja });
}
for (const id of nMap.keys()) if (!bMap.has(id)) added.push(id);

// Structural invariants — cheap, and they catch whole classes of mistake.
let invariant = [];
for (const bank of [JP_QUESTIONS, SG_QUESTIONS]) {
  for (const [cat, qs] of Object.entries(bank)) {
    for (const q of qs) {
      const keys = q.options.map(o => o.key);
      if (new Set(keys).size !== keys.length) invariant.push(`${cat}/${q.id}: duplicate option keys`);
      for (const o of q.options) {
        if (!o.key || !/^[a-z0-9_]+$/.test(o.key)) invariant.push(`${cat}/${q.id}: key "${o.key}" is not a plain ASCII key`);
        if (!o.ja || !o.en) invariant.push(`${cat}/${q.id}/${o.key}: missing a ja or en label`);
      }
      if (q.forType && !/^[a-z0-9_]+$/.test(q.forType)) invariant.push(`${cat}/${q.id}: forType "${q.forType}" is not a key`);
    }
  }
}
const ALL_KEYS = new Set();
for (const bank of [JP_QUESTIONS, SG_QUESTIONS])
  for (const qs of Object.values(bank)) for (const q of qs) for (const o of q.options) ALL_KEYS.add(o.key);
for (const r of results) {
  if (r.ja && !r.en) invariant.push(`${r.id}: ja reason without en`);
  // A raw key surfacing in user-facing prose means a lookup failed.
  for (const k of ["exp_type1", "exp_type2", "exp_lp", "know_vc_pe", "net_fin_assets", "qii_bank"])
    if (r.en.includes(k) || r.ja.includes(k)) invariant.push(`${r.id}: raw key "${k}" leaked into a reason`);
}

const bad = outcome.length + wording.length + missing.length + added.length + invariant.length;
console.log(`Eligibility regression — ${results.length} enumerated paths`);
console.log(`  outcome changes   : ${outcome.length}`);
console.log(`  wording changes   : ${wording.length}`);
console.log(`  cases missing     : ${missing.length}`);
console.log(`  cases added       : ${added.length}`);
console.log(`  invariant failures: ${invariant.length}`);

const show = (title, rows, fmt) => {
  if (!rows.length) return;
  console.log(`\n${title}`);
  for (const r of rows.slice(0, 10)) console.log("  " + fmt(r));
  if (rows.length > 10) console.log(`  ...and ${rows.length - 10} more`);
};
show("DETERMINATION CHANGED:", outcome, r => `${r.id}\n    was: ${r.was}  now: ${r.now}`);
show("Reason wording changed:", wording, r => `${r.id}\n    was: ${r.was}\n    now: ${r.now}`);
show("Cases missing:", missing, r => r);
show("Cases added:", added, r => r);
show("Invariant failures:", invariant, r => r);

if (bad === 0) { console.log("\nPASS — no determination changed"); process.exit(0); }
console.log(`\nFAIL — ${bad} difference(s). If deliberate: npm run test:eval:update, then review the diff.`);
process.exit(1);
