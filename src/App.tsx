// @ts-nocheck
/* eslint-disable */
import { useState, useRef, useCallback } from "react";
import { useUser } from "./auth/AuthProvider";
import { R, REF_JP, REF_SG } from "../shared/reference";
import { JP_QUESTIONS, SG_QUESTIONS, evalJP, evalSG } from "../shared/eligibility";

const C = {
  bg: "#f8f9fa", card: "#ffffff", border: "#e5e7eb",
  text: "#111827", sub: "#6b7280", faint: "#9ca3af",
  blue: "#1d4ed8", blueBg: "#eff6ff", blueBorder: "#bfdbfe",
  green: "#065f46", greenBg: "#d1fae5", greenBorder: "#6ee7b7",
  red: "#991b1b", redBg: "#fee2e2", redBorder: "#fca5a5",
  amber: "#92400e", amberBg: "#fef3c7", amberBorder: "#fcd34d",
  purple: "#5b21b6", purpleBg: "#ede9fe", purpleBorder: "#c4b5fd",
};
const s = {
  wrap: { fontFamily: "system-ui,sans-serif", background: C.bg, minHeight: "100vh", padding: "0 0 40px" },
  header: { background: "#1e293b", color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" },
  btn: { padding: "9px 16px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.text, cursor: "pointer" },
  btnPrimary: { padding: "11px 0", fontSize: 15, fontWeight: 600, borderRadius: 10, border: "none", background: "#1e293b", color: "#fff", cursor: "pointer", width: "100%" },
  btnSave: { padding: "9px 16px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: `1px solid ${C.amber}`, background: C.amberBg, color: C.amber, cursor: "pointer" },
  label: { fontSize: 14, color: C.text, lineHeight: 1.5 },
  hint: { fontSize: 12, color: C.sub, marginTop: 3, lineHeight: 1.5 },
  sectionTitle: { fontSize: 12, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 },
  tag: (color, bg, border) => ({ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: bg, color, border: `1px solid ${border}` }),
};

// ─── Admin config ─────────────────────────────────────────────────────────────
const ADMIN_EMAILS = ["onuma@fgcsg.com"];
// Identity fallback. Language-independent on purpose: it is used as a key.
const FALLBACK_USER = "FGCメンバー";
function isAdmin(user) {
  if (!user?.email) return false;
  return ADMIN_EMAILS.some(e => user.email.toLowerCase() === e.toLowerCase());
}

// ─── Phase ordering for back navigation ──────────────────────────────────────
const PHASE_ORDER = ["start", "jp_cat", "jp_q", "sg_type", "sg_q", "result"];
function prevPhase(phase) {
  const i = PHASE_ORDER.indexOf(phase);
  return i > 0 ? PHASE_ORDER[i - 1] : null;
}

// ─── i18n plumbing ────────────────────────────────────────────────────────────
// Every user-visible string is a { ja, en } pair. Answer VALUES are stable
// language-independent keys; only labels are localised. Never compare logic
// against a label — always against `.key`.
// R, REF_JP and REF_SG live in shared/ so the server can import the same content.
const L = (v, lang) => (v && typeof v === "object" && !Array.isArray(v) ? (v[lang] ?? v.ja) : v);
const LANG_KEY = "fgc_iq_lang";
function loadLang() {
  try { const v = localStorage.getItem(LANG_KEY); return v === "en" || v === "ja" ? v : "ja"; } catch { return "ja"; }
}
function saveLang(l) { try { localStorage.setItem(LANG_KEY, l); } catch { /* storage unavailable */ } }
const dtLocale = lang => (lang === "en" ? "en-SG" : "ja-JP");

const T = {
  appTitle: R("FGC 投資家適格性審査", "FGC Investor Qualification Screening"),
  appSub: R("🇯🇵 金商法63条 × 🇸🇬 SFA Section 4A — FGCメンバー限定", "🇯🇵 FIEA Art. 63 × 🇸🇬 SFA Section 4A — FGC members only"),
  version: R("v1.3 SFA relevant persons 追記", "v1.3 SFA relevant persons added"),
  fallbackUserLabel: R("FGCメンバー", "FGC member"),
  tabCheck: R("✅ 審査", "✅ Screening"),
  tabRecords: R("📋 記録", "📋 Records"),
  tabRef: R("📚 基準", "📚 Criteria"),

  badgeEligible: R("✅ 適格", "✅ Eligible"),
  badgeIneligible: R("❌ 非適格", "❌ Not eligible"),
  badgePending: R("⚠ 要申請", "⚠ Application required"),

  draftsOpen: R("未完了の下書き", "Unfinished drafts"),
  draftPrefix: R("📝 下書き — ", "📝 Draft — "),
  owner: R("担当", "Owner"),
  ownerOnlyEdit: R("⚠ 編集は担当者のみ可能です", "⚠ Only the owner may edit"),
  adminCanEdit: R("👑 Admin権限で編集可能", "👑 Editable with admin rights"),
  resumeEdit: R("編集再開", "Resume editing"),
  view: R("表示", "View"),

  checkTitle: R("✅ 適格性審査チェック", "✅ Qualification screening"),
  checkSub: R("STEP 1：日本（金商法63条）→ STEP 2：シンガポール（SFA Section 4A）", "Step 1: Japan (FIEA art. 63) → Step 2: Singapore (SFA s. 4A)"),
  investorInfo: R("投資家情報", "Investor details"),
  investorName: R("投資家名 / 法人名", "Investor name / entity name"),
  investorNamePh: R("例：山田太郎 / 株式会社〇〇", "e.g. Taro Yamada / ABC Pte. Ltd."),
  memberInCharge: R("担当FGCメンバー", "FGC member in charge"),
  ssoNote: R("Microsoft 365 SSOより自動入力", "Auto-filled from Microsoft 365 SSO"),
  startCheck: R("審査を開始する →", "Start screening →"),
  back: R("← 前のページへ戻る", "← Back"),
  saveDraft: R("💾 下書き保存", "💾 Save draft"),
  draftSaved: R("下書き保存しました", "Draft saved"),
  subject: R("審査対象", "Subject"),

  jpCatTitle: R("🇯🇵 STEP 1 — 日本の適格区分を選択", "🇯🇵 Step 1 — Select the Japan qualification category"),
  jpConfirm: R("日本審査を確定 → SG審査へ", "Confirm Japan assessment → Singapore"),
  sgTypeTitle: R("🇸🇬 STEP 2 — Singapore Accredited Investor", "🇸🇬 Step 2 — Singapore Accredited Investor"),
  sgTypeSub: R("日本審査完了 ✅ → SG区分を選択", "Japan assessment complete ✅ → select the Singapore category"),
  sgPickType: R("投資家の区分を選択してください", "Select the investor category"),
  sgConfirm: R("SG審査を確定 → 結果へ", "Confirm Singapore assessment → Result"),

  approved: R("適格投資家として承認", "Approved as an eligible investor"),
  notApproved: R("適格投資家として非承認", "Not approved as an eligible investor"),
  resultDetail: R("審査結果詳細", "Assessment detail"),
  jpLabel: R("🇯🇵 日本", "🇯🇵 Japan"),
  sgLabel: R("🇸🇬 Singapore — AI", "🇸🇬 Singapore — AI"),
  auditTrail: R("監査証跡", "Audit trail"),
  finalSave: R("💾 最終保存", "💾 Save final"),
  newCheck: R("新規審査", "New screening"),
  disclaimerLabel: R("免責事項：", "Disclaimer: "),
  disclaimer: R("本ツールは情報提供のみを目的としており、法的アドバイスではありません。最終判断は必ず資格を有する法律の専門家にご確認ください。", "This tool is provided for information only and does not constitute legal advice. Any final determination must be confirmed with qualified legal counsel."),

  noRecords: R("記録なし", "No records"),
  noRecordsSub: R("審査を完了して保存すると、ここに表示されます。", "Completed and saved screenings will appear here."),
  recordsTitle: R("📋 審査記録", "📋 Screening records"),
  recordsCount: R("件", " total"),
  completed: R("完了", "complete"),
  drafts: R("下書き", "draft"),
  adminAll: R("👑 Admin — 全メンバーの記録を表示中", "👑 Admin — showing records for all members"),
  draftTag: R("📝 下書き", "📝 Draft"),
  readOnly: R("（閲覧のみ）", " (read-only)"),
  completedSection: R("✅ 完了済み", "✅ Completed"),
  close: R("閉じる", "Close"),
  detail: R("詳細", "Detail"),
  japanShort: R("日本", "Japan"),
  sgShort: R("SG", "SG"),

  refTitle: R("📚 適格投資家基準 参照ページ", "📚 Eligible-investor criteria reference"),
  refSub: R("日本（金商法）およびシンガポール（SFA）の現行最新基準 — 法令根拠付き", "Current criteria for Japan (FIEA) and Singapore (SFA), with statutory citations"),
  refPitfallTitle: R("⚠ 重要：よくある誤りについて", "⚠ Important: common misconceptions"),
  refJpSection: R("🇯🇵 日本 — 金商法63条（適格機関投資家等特例業務）", "🇯🇵 Japan — FIEA art. 63 (special exemption business for QIIs, etc.)"),
  refSgSection: R("🇸🇬 シンガポール — SFA Section 4A（Accredited Investor）", "🇸🇬 Singapore — SFA s. 4A (Accredited Investor)"),

};
const t = (k, lang) => L(T[k], lang);
// The stored identity stays stable; only its on-screen rendering is localised.
const displayName = (name, lang) => (name === FALLBACK_USER ? t("fallbackUserLabel", lang) : name);

// ─── Reference data ───────────────────────────────────────────────────────────
// `law` holds the statutory citation. The Japanese citation string is reproduced
// verbatim in BOTH languages; the EN variant only appends a parenthetical gloss.

const JP_CATEGORIES = [
  { id: "qii", label: R("適格機関投資家", "Qualified Institutional Investor (QII)"), color: C.blue, bg: C.blueBg, border: C.blueBorder, icon: "🏦" },
  { id: "auto_qii", label: R("自動的適格機関投資家", "Automatic QII"), color: C.purple, bg: C.purpleBg, border: C.purpleBorder, icon: "🏛" },
  { id: "app_qii", label: R("申請型適格機関投資家", "Application-type QII"), color: "#0f766e", bg: "#ccfbf1", border: "#99f6e4", icon: "📋" },
  { id: "pro", label: R("特定投資家（プロ）", "Specified Investor (Pro)"), color: "#b45309", bg: "#fef3c7", border: "#fcd34d", icon: "⭐" },
  { id: "ama", label: R("特定投資家（アマ→プロ移行）", "Specified Investor (Retail→Pro)"), color: C.sub, bg: "#f3f4f6", border: C.border, icon: "🔄" },
];

// Option objects are { key, ja, en }. `key` is the value stored in answers and
// the ONLY thing evalJP/evalSG compare against.


const SG_ENTITY_TYPES = [
  { key: "individual", label: R("個人", "Individual"), button: R("👤 個人", "👤 Individual") },
  { key: "corporation", label: R("法人", "Corporation"), button: R("🏢 法人（通常法人・個人資産管理会社）", "🏢 Corporation (ordinary company / family investment vehicle)") },
];




// ─── Components ───────────────────────────────────────────────────────────────
function NavTab({ label, active, onClick }) {
  return <button onClick={onClick} style={{ padding: "8px 14px", fontSize: 13, fontWeight: active ? 700 : 500, borderRadius: 8, border: "none", background: active ? "#fff" : "transparent", color: active ? "#1e293b" : "#94a3b8", cursor: "pointer", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.12)" : "none" }}>{label}</button>;
}
function LangToggle({ lang, onChange }) {
  const pill = on => ({ padding: "3px 9px", fontSize: 11, fontWeight: 700, border: "none", borderRadius: 6, cursor: "pointer", background: on ? "#fff" : "transparent", color: on ? "#1e293b" : "#94a3b8" });
  return (
    <div style={{ display: "inline-flex", gap: 2, background: "#334155", borderRadius: 8, padding: 2 }}>
      <button onClick={() => onChange("ja")} style={pill(lang === "ja")} aria-pressed={lang === "ja"}>日本語</button>
      <button onClick={() => onChange("en")} style={pill(lang === "en")} aria-pressed={lang === "en"}>EN</button>
    </div>
  );
}
function ResultBadge({ met, lang }) {
  if (met === true) return <span style={s.tag(C.green, C.greenBg, C.greenBorder)}>{t("badgeEligible", lang)}</span>;
  if (met === false) return <span style={s.tag(C.red, C.redBg, C.redBorder)}>{t("badgeIneligible", lang)}</span>;
  return <span style={s.tag(C.amber, C.amberBg, C.amberBorder)}>{t("badgePending", lang)}</span>;
}
function ChoiceBtn({ label, selected, onClick }) {
  return <button onClick={onClick} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", marginBottom: 6, fontSize: 13, borderRadius: 8, border: selected ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`, background: selected ? C.blueBg : C.card, color: selected ? C.blue : C.text, cursor: "pointer", fontWeight: selected ? 600 : 400 }}>{label}</button>;
}
function Divider() { return <div style={{ borderTop: `1px solid ${C.border}`, margin: "16px 0" }} />; }

function DraftBanner({ record, currentUser, admin, onResume, onView, lang }) {
  const isOwner = record.checkedBy === currentUser;
  const canEdit = isOwner || admin;
  return (
    <div style={{ ...s.card, background: C.amberBg, border: `1px solid ${C.amberBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.amber }}>{t("draftPrefix", lang)}{record.investorName}</div>
        <div style={{ fontSize: 12, color: C.amber, marginTop: 2 }}>{t("owner", lang)}{lang === "ja" ? "：" : ": "}{displayName(record.checkedBy, lang)} · {new Date(record.updatedAt).toLocaleString(dtLocale(lang))}</div>
        {!canEdit && <div style={{ fontSize: 12, color: C.red, marginTop: 2 }}>{lang === "ja" ? `⚠ 編集は担当者（${record.checkedBy}）のみ可能です` : `⚠ Only the owner (${record.checkedBy}) may edit`}</div>}
        {admin && !isOwner && <div style={{ fontSize: 12, color: "#b45309", marginTop: 2 }}>{t("adminCanEdit", lang)}</div>}
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {canEdit && <button onClick={() => onResume(record)} style={{ ...s.btn, background: C.amber, color: "#fff", border: "none", fontSize: 12, padding: "6px 12px" }}>{t("resumeEdit", lang)}</button>}
        <button onClick={() => onView(record)} style={{ ...s.btn, fontSize: 12, padding: "6px 12px" }}>{t("view", lang)}</button>
      </div>
    </div>
  );
}

// ─── Check Page ───────────────────────────────────────────────────────────────
function CheckPage({ onSave, currentUser, admin, draftRecords, onResumeDraft, onViewDraft, lang }) {
  const [phase, setPhase] = useState("start");
  const [investorName, setInvestorName] = useState("");
  const [jpCat, setJpCat] = useState(null);
  const [jpAnswers, setJpAnswers] = useState({});
  const [sgEntityType, setSgEntityType] = useState(null);
  const [sgAnswers, setSgAnswers] = useState({});
  const [jpResult, setJpResult] = useState(null);
  const [sgResult, setSgResult] = useState(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [recordId] = useState(() => Date.now().toString());
  const auditRef = useRef([]);

  // Audit entries are stored as { ja, en } so the trail stays readable in both.
  function addAudit(msg) { auditRef.current = [...auditRef.current, { at: new Date().toISOString(), msg }]; }

  const buildRecord = useCallback((status = "draft") => ({
    id: recordId, investorName: investorName.trim(), checkedBy: currentUser,
    checkedByEmail: "", jpCat, jpAnswers, sgEntityType, sgAnswers,
    jpResult, sgResult,
    overall: jpResult?.met === true && sgResult?.met === true,
    status, phase,
    updatedAt: new Date().toISOString(), auditLog: auditRef.current,
  }), [recordId, investorName, currentUser, jpCat, jpAnswers, sgEntityType, sgAnswers, jpResult, sgResult, phase]);

  function saveDraft() {
    addAudit(R(`下書き保存（フェーズ：${phase}）`, `Draft saved (phase: ${phase})`));
    onSave(buildRecord("draft"));
    setSaveMsg(t("draftSaved", lang));
    setTimeout(() => setSaveMsg(""), 2500);
  }

  function goBack() {
    const prev = prevPhase(phase);
    if (prev) setPhase(prev);
  }

  function startCheck() {
    if (!investorName.trim()) return;
    addAudit(R(`審査開始：${investorName}（担当：${currentUser}）`, `Screening started: ${investorName} (owner: ${currentUser})`));
    setPhase("jp_cat");
  }

  function selectJPCat(cat) {
    setJpCat(cat); setJpAnswers({});
    const c = JP_CATEGORIES.find(x => x.id === cat);
    addAudit(R(`日本区分選択：${c?.label.ja}`, `Japan category selected: ${c?.label.en}`));
    setPhase("jp_q");
  }

  const outcomeWord = met => R(met === true ? "適格" : met === null ? "要申請" : "非適格",
                               met === true ? "Eligible" : met === null ? "Application required" : "Not eligible");

  function finishJP() {
    const r = evalJP(jpCat, jpAnswers);
    setJpResult(r);
    const w = outcomeWord(r.met);
    addAudit(R(`日本審査完了：${w.ja}`, `Japan assessment complete: ${w.en}`));
    setPhase("sg_type");
  }

  function selectSGType(typeKey) {
    setSgEntityType(typeKey); setSgAnswers({});
    const e = SG_ENTITY_TYPES.find(x => x.key === typeKey);
    addAudit(R(`SG区分選択：${e?.label.ja}`, `Singapore category selected: ${e?.label.en}`));
    setPhase("sg_q");
  }

  function finishSG() {
    const r = evalSG(sgEntityType, sgAnswers);
    setSgResult(r);
    const w = outcomeWord(r.met);
    addAudit(R(`SG審査完了：${w.ja}`, `Singapore assessment complete: ${w.en}`));
    setPhase("result");
  }

  function finalSave() {
    addAudit(R("最終保存", "Final save"));
    onSave(buildRecord("complete"));
  }

  function reset() {
    setPhase("start"); setInvestorName(""); setJpCat(null);
    setJpAnswers({}); setSgEntityType(null); setSgAnswers({});
    setJpResult(null); setSgResult(null); auditRef.current = [];
  }

  const jpCatInfo = JP_CATEGORIES.find(c => c.id === jpCat);
  const sgTypeInfo = SG_ENTITY_TYPES.find(e => e.key === sgEntityType);
  const overall = jpResult?.met === true && sgResult?.met === true;

  function getJPQuestions() {
    const qs = JP_QUESTIONS[jpCat] || [];
    if (jpCat !== "pro" && jpCat !== "ama") return qs;
    const type = jpAnswers["q_type"];
    if (!type) return qs.filter(q => !q.forType);
    return qs.filter(q => !q.forType || q.forType === type);
  }
  function getSGQuestions() {
    const qs = SG_QUESTIONS[sgEntityType === "individual" ? "individual" : "corporation"] || [];
    const ct = sgAnswers["sg_corp_type"];
    if (!ct) return qs.filter(q => !q.forType);
    return qs.filter(q => !q.forType || q.forType === ct);
  }

  // Shared top bar with back + draft save
  function TopBar({ title, subtitle, showBack = true, showSave = true }) {
    return (
      <div style={{ ...s.card, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            {showBack && phase !== "start" && (
              <button onClick={goBack} style={{ fontSize: 12, background: "none", border: "none", cursor: "pointer", color: C.sub, padding: 0, marginBottom: 6, display: "block" }}>{t("back", lang)}</button>
            )}
            <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>{subtitle}</div>}
          </div>
          {showSave && phase !== "start" && phase !== "result" && (
            <button onClick={saveDraft} style={s.btnSave}>{t("saveDraft", lang)}</button>
          )}
        </div>
        {saveMsg && <div style={{ marginTop: 8, fontSize: 12, color: C.green, fontWeight: 600 }}>✅ {saveMsg}</div>}
      </div>
    );
  }

  const subjectLine = `${t("subject", lang)}${lang === "ja" ? "：" : ": "}${investorName}`;

  return (
    <div style={{ padding: "16px" }}>
      {/* Draft records for this user */}
      {draftRecords.length > 0 && phase === "start" && (
        <div style={{ marginBottom: 12 }}>
          <div style={s.sectionTitle}>{t("draftsOpen", lang)}</div>
          {draftRecords.map(r => <DraftBanner key={r.id} record={r} currentUser={currentUser} admin={admin} onResume={onResumeDraft} onView={onViewDraft} lang={lang} />)}
        </div>
      )}

      {phase === "start" && (
        <>
          <TopBar title={t("checkTitle", lang)} subtitle={t("checkSub", lang)} showBack={false} showSave={false} />
          <div style={s.card}>
            <div style={s.sectionTitle}>{t("investorInfo", lang)}</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ ...s.label, marginBottom: 6, fontWeight: 500 }}>{t("investorName", lang)} <span style={{ color: C.red }}>*</span></div>
              <input value={investorName} onChange={e => setInvestorName(e.target.value)} placeholder={t("investorNamePh", lang)}
                style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", fontSize: 14, borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "system-ui,sans-serif" }} />
            </div>
            <div>
              <div style={{ ...s.label, marginBottom: 4, fontWeight: 500 }}>{t("memberInCharge", lang)}</div>
              <div style={{ padding: "8px 12px", background: C.greenBg, borderRadius: 8, fontSize: 14, color: C.green, fontWeight: 600 }}>🔐 {displayName(currentUser, lang)}</div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 4 }}>{t("ssoNote", lang)}</div>
            </div>
          </div>
          <button onClick={startCheck} disabled={!investorName.trim()} style={{ ...s.btnPrimary, opacity: !investorName.trim() ? 0.5 : 1 }}>{t("startCheck", lang)}</button>
        </>
      )}

      {phase === "jp_cat" && (
        <>
          <TopBar title={t("jpCatTitle", lang)} subtitle={subjectLine} />
          {JP_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => selectJPCat(cat.id)} style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%", textAlign: "left", padding: "14px", marginBottom: 8, borderRadius: 10, border: `1px solid ${cat.border}`, background: cat.bg, cursor: "pointer" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{cat.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: cat.color }}>{L(cat.label, lang)}</div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{lang === "ja" ? cat.label.en : cat.label.ja}</div>
              </div>
            </button>
          ))}
        </>
      )}

      {phase === "jp_q" && jpCatInfo && (
        <>
          <TopBar title={`${jpCatInfo.icon} ${L(jpCatInfo.label, lang)}`} subtitle={subjectLine} />
          {getJPQuestions().map((q, i) => (
            <div key={q.id} style={{ ...s.card, marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: q.hint ? 4 : 10 }}>{i + 1}. {L(q.text, lang)}</div>
              {q.hint && <div style={{ fontSize: 12, padding: "6px 10px", background: C.amberBg, borderRadius: 6, color: C.amber, marginBottom: 10, lineHeight: 1.6 }}>💡 {L(q.hint, lang)}</div>}
              {q.options.map(opt => <ChoiceBtn key={opt.key} label={L(opt, lang)} selected={jpAnswers[q.id] === opt.key} onClick={() => setJpAnswers(a => ({ ...a, [q.id]: opt.key }))} />)}
            </div>
          ))}
          <button onClick={finishJP} style={s.btnPrimary}>{t("jpConfirm", lang)}</button>
        </>
      )}

      {phase === "sg_type" && (
        <>
          <TopBar title={t("sgTypeTitle", lang)} subtitle={t("sgTypeSub", lang)} />
          <div style={s.card}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{t("sgPickType", lang)}</div>
            {SG_ENTITY_TYPES.map(e => (
              <button key={e.key} onClick={() => selectSGType(e.key)} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 14px", marginBottom: 8, fontSize: 14, fontWeight: 600, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.text, cursor: "pointer" }}>
                {L(e.button, lang)}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "sg_q" && (
        <>
          <TopBar title={`🇸🇬 SG Accredited Investor（${L(sgTypeInfo?.label, lang)}）`} />
          {getSGQuestions().map((q, i) => (
            <div key={q.id} style={{ ...s.card, marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: q.hint ? 4 : 10 }}>{i + 1}. {L(q.text, lang)}</div>
              {q.hint && <div style={{ fontSize: 12, padding: "6px 10px", background: C.amberBg, borderRadius: 6, color: C.amber, marginBottom: 10, lineHeight: 1.6 }}>💡 {L(q.hint, lang)}</div>}
              {q.options.map(opt => <ChoiceBtn key={opt.key} label={L(opt, lang)} selected={sgAnswers[q.id] === opt.key} onClick={() => setSgAnswers(a => ({ ...a, [q.id]: opt.key }))} />)}
            </div>
          ))}
          <button onClick={finishSG} style={s.btnPrimary}>{t("sgConfirm", lang)}</button>
        </>
      )}

      {phase === "result" && (
        <>
          <div style={{ ...s.card, background: overall ? C.greenBg : C.redBg, border: `1px solid ${overall ? C.greenBorder : C.redBorder}`, textAlign: "center", marginBottom: 12 }}>
            <button onClick={goBack} style={{ display: "block", fontSize: 12, background: "none", border: "none", cursor: "pointer", color: overall ? C.green : C.red, padding: 0, marginBottom: 8 }}>{t("back", lang)}</button>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{overall ? "✅" : "❌"}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: overall ? C.green : C.red }}>{overall ? t("approved", lang) : t("notApproved", lang)}</div>
            <div style={{ fontSize: 14, color: overall ? C.green : C.red, marginTop: 4, fontWeight: 600 }}>{investorName}</div>
          </div>
          <div style={s.card}>
            <div style={s.sectionTitle}>{t("resultDetail", lang)}</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{t("jpLabel", lang)} — {L(jpCatInfo?.label, lang)}</span>
                <ResultBadge met={jpResult?.met} lang={lang} />
              </div>
              <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.7 }}>{L(jpResult?.reason, lang)}</div>
            </div>
            <Divider />
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{t("sgLabel", lang)}（{L(sgTypeInfo?.label, lang)}）</span>
                <ResultBadge met={sgResult?.met} lang={lang} />
              </div>
              <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.7 }}>{L(sgResult?.reason, lang)}</div>
            </div>
          </div>

          {auditRef.current.length > 0 && (
            <div style={s.card}>
              <div style={s.sectionTitle}>{t("auditTrail", lang)}</div>
              {auditRef.current.map((e, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: C.faint, whiteSpace: "nowrap", flexShrink: 0 }}>{new Date(e.at).toLocaleTimeString(dtLocale(lang))}</span>
                  <span style={{ fontSize: 12, lineHeight: 1.5 }}>{L(e.msg, lang)}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={finalSave} style={{ ...s.btnPrimary, flex: 1 }}>{t("finalSave", lang)}</button>
            <button onClick={reset} style={{ ...s.btn, flex: 1 }}>{t("newCheck", lang)}</button>
          </div>
          <div style={{ ...s.card, background: C.amberBg, fontSize: 12, color: C.amber, lineHeight: 1.6 }}>
            <strong>{t("disclaimerLabel", lang)}</strong>{t("disclaimer", lang)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Records Page ─────────────────────────────────────────────────────────────
function RecordsPage({ records, currentUser, admin, lang }) {
  const [open, setOpen] = useState(null);
  const visible = admin ? records : records.filter(r => r.checkedBy === currentUser);
  const complete = visible.filter(r => r.status === "complete");
  const drafts = visible.filter(r => r.status === "draft");
  const sep = lang === "ja" ? "：" : ": ";

  function RecordCard({ r }) {
    const isOwner = r.checkedBy === currentUser;
    const canEdit = isOwner || admin;
    const jpCat = JP_CATEGORIES.find(c => c.id === r.jpCat);
    const sgType = SG_ENTITY_TYPES.find(e => e.key === r.sgEntityType);
    return (
      <div style={{ ...s.card, marginBottom: 8, border: r.status === "draft" ? `1px solid ${C.amberBorder}` : `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{r.investorName}</span>
              {r.status === "draft"
                ? <span style={s.tag(C.amber, C.amberBg, C.amberBorder)}>{t("draftTag", lang)}{!canEdit ? t("readOnly", lang) : ""}</span>
                : <span style={s.tag(r.overall ? C.green : C.red, r.overall ? C.greenBg : C.redBg, r.overall ? C.greenBorder : C.redBorder)}>{r.overall ? t("badgeEligible", lang) : t("badgeIneligible", lang)}</span>
              }
            </div>
            <div style={{ fontSize: 12, color: C.sub }}>
              {t("owner", lang)}{sep}{displayName(r.checkedBy, lang)} · {new Date(r.updatedAt).toLocaleDateString(dtLocale(lang))}
              {r.jpCat && ` · 🇯🇵 ${L(jpCat?.label, lang) || r.jpCat}`}
              {r.sgEntityType && ` · 🇸🇬 ${L(sgType?.label, lang) || r.sgEntityType}`}
            </div>
          </div>
          <button onClick={() => setOpen(open === r.id ? null : r.id)} style={{ ...s.btn, padding: "4px 10px", fontSize: 12 }}>{open === r.id ? t("close", lang) : t("detail", lang)}</button>
        </div>

        {open === r.id && (
          <div style={{ marginTop: 12 }}>
            <Divider />
            {r.jpResult && <div style={{ fontSize: 13, marginBottom: 6, lineHeight: 1.6 }}><strong>{t("japanShort", lang)}{sep}</strong>{L(r.jpResult.reason, lang)}</div>}
            {r.sgResult && <div style={{ fontSize: 13, marginBottom: 10, lineHeight: 1.6 }}><strong>{t("sgShort", lang)}{sep}</strong>{L(r.sgResult.reason, lang)}</div>}
            {r.auditLog?.length > 0 && <>
              <div style={s.sectionTitle}>{t("auditTrail", lang)}</div>
              {r.auditLog.map((e, i) => <div key={i} style={{ fontSize: 12, color: C.sub, marginBottom: 3 }}>{new Date(e.at).toLocaleString(dtLocale(lang))} — {L(e.msg, lang)}</div>)}
            </>}
          </div>
        )}
      </div>
    );
  }

  if (visible.length === 0) return (
    <div style={{ padding: 16 }}>
      <div style={{ ...s.card, textAlign: "center", padding: "3rem 1rem" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{t("noRecords", lang)}</div>
        <div style={{ fontSize: 13, color: C.sub }}>{t("noRecordsSub", lang)}</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 16 }}>
      <div style={{ ...s.card, background: "#1e293b", color: "#fff", marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>
          {t("recordsTitle", lang)} — {visible.length}{t("recordsCount", lang)}（{t("completed", lang)}{sep}{complete.length} / {t("drafts", lang)}{sep}{drafts.length}）
          {admin && <span style={{ fontSize: 11, color: "#f59e0b", marginLeft: 8, fontWeight: 600 }}>{t("adminAll", lang)}</span>}
        </div>
      </div>
      {drafts.length > 0 && <>
        <div style={s.sectionTitle}>{t("draftTag", lang)}</div>
        {drafts.map(r => <RecordCard key={r.id} r={r} />)}
        <Divider />
      </>}
      {complete.length > 0 && <>
        <div style={s.sectionTitle}>{t("completedSection", lang)}</div>
        {complete.map(r => <RecordCard key={r.id} r={r} />)}
      </>}
    </div>
  );
}

// ─── Ref Page ─────────────────────────────────────────────────────────────────
// Each pitfall is [leading text, emphasised text, trailing text].
const REF_PITFALLS = [
  [R("・特定投資家（アマ→プロ）個人要件は「", "・The individual test for Specified Investor (Retail→Pro) is "),
   R("投資性金融資産1億円以上", "investment-type financial assets of JPY 100 million or more"),
   R("」です。「純金融資産3億円」は誤りです。", ". The often-quoted “JPY 300 million in net financial assets” is incorrect.")],
  [R("・特定投資家（プロ）法人要件は2016年3月改正により「", "・The corporate test for Specified Investor (Pro) was relaxed by the March 2016 amendment to "),
   R("資本金または純資産5,000万円以上", "stated capital or net assets of JPY 50 million or more"),
   R("」に緩和（旧：5億円）。", " (previously JPY 500 million).")],
  [R("・経験要件の「口座」は", "・The “account” under the experience test is "),
   R("第一種業者に限定されません", "not limited to Type I operators"),
   R("。施行令15条の31第1項イは業者種別を区別しません。", ". 施行令15条の31第1項イ (Enforcement Order art. 15-31(1)(a)) draws no distinction between operator categories.")],
  [R("・SFAオプトインは2018年改正により", "・Under the 2018 SFA amendment, an opt-in requires "),
   R("積極的な選択が法的に必須", "an express election as a matter of law"),
   R("です。", ".")],
  [R("・SFA上の「Expert Investor」は、資本市場商品の売買・保有を", "・“Expert Investor” under the SFA captures only those "),
   R("業とする者", "whose business is dealing in or holding capital markets products"),
   R("のみが該当し、GPスタッフ個人が知識経験のみで得られる区分ではありません。", "; it is not a status an individual GP staff member can acquire through knowledge and experience alone.")],
];

const REF_305 = {
  title: R("🇸🇬 SFA第305条(5) — \"Relevant Persons\"（募集規制の適用除外）", "🇸🇬 SFA s. 305(5) — “relevant persons” (offering exemption)"),
  sub: R("Securities and Futures Act, Section 305(5) — Restricted Scheme 向け適用除外", "Securities and Futures Act, s. 305(5) — exemption for restricted schemes"),
  bodyPre: R("限定スキーム（Restricted Scheme）としてファンド持分を募集する場合、AI要件（資産・収入基準）を満たさない者であっても、以下の「relevant person」に該当すれば、目論見書登録義務の適用除外を受けて募集できます。", "Where fund interests are offered as a restricted scheme, a person who does not meet the Accredited Investor tests (asset and income thresholds) may still be offered interests under an exemption from the prospectus registration requirement, provided they are a “relevant person” as listed below."),
  bodyStrong: R("これは投資家区分（AI/Expert Investor）とは別の、募集規制側の適用除外", "This is an exemption on the offering-regulation side, distinct from the investor classifications (AI / Expert Investor)"),
  bodyPost: R("です。", "."),
  listTitle: R("該当する者（いずれか）", "Qualifying persons (any one)"),
  items: [
    R("Accredited Investor（個人・法人）", "Accredited Investors (individuals and corporations)"),
    R("唯一の事業が投資保有であり、全株式をAI個人が保有する法人", "A corporation whose sole business is holding investments and whose entire share capital is held by AI individuals"),
    R("受益者全員がAI個人である信託の受託者", "The trustee of a trust all of whose beneficiaries are AI individuals"),
    R("募集者（法人）の役員またはこれに準ずる者 — 例：GP／運用会社の役員・パートナー — およびその配偶者・親・兄弟姉妹・子", "An officer or equivalent of the offeror where the offeror is a corporation — e.g. a director or partner of the GP or management company — and their spouse, parent, sibling or child"),
    R("募集者（個人）本人の配偶者・親・兄弟姉妹・子", "The spouse, parent, sibling or child of the offeror where the offeror is an individual"),
  ],
  foot: R("※ 限定スキームとしてMASリストに掲載するには、要点情報を含む情報メモランダムの添付、運用者の適格性（fit and proper）、CISNetへの事前届出・年次申告が条件となります。GP／投資担当者の自社ファンド出資は、通常この条項（募集者の役員等）を根拠に整理されます。詳細はLegal/Complianceにご確認ください。", "Note: listing as a restricted scheme with MAS requires an information memorandum containing the prescribed key information, that the manager be fit and proper, and prior lodgement and annual declarations via CISNet. Investment by GP or investment staff into the firm's own funds is normally analysed under this provision (officers of the offeror). Confirm the details with Legal/Compliance."),
};

function RefPage({ lang }) {
  const [open, setOpen] = useState(null);
  const block = (rows, prefix, bullet) => rows.map((r, i) => (
    <div key={i} style={{ marginBottom: 8 }}>
      <button onClick={() => setOpen(open === `${prefix}${i}` ? null : `${prefix}${i}`)} style={{ width: "100%", textAlign: "left", padding: "9px 12px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: `1px solid ${C.border}`, background: open === `${prefix}${i}` ? "#f1f5f9" : C.card, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><span>{L(r.cat, lang)}</span><span style={{ fontSize: 11, color: C.faint, marginLeft: 8 }}>{L(r.law, lang)}</span></div>
        <span style={{ color: C.sub, flexShrink: 0 }}>{open === `${prefix}${i}` ? "▲" : "▼"}</span>
      </button>
      {open === `${prefix}${i}` && <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "0 0 8px 8px", border: `1px solid ${C.border}`, borderTop: "none" }}>
        {r.items.map((it, j) => <div key={j} style={{ fontSize: 13, padding: "3px 0", display: "flex", gap: 8 }}><span style={{ color: bullet, flexShrink: 0 }}>•</span>{L(it, lang)}</div>)}
      </div>}
    </div>
  ));

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ ...s.card, background: "#1e293b", color: "#fff", marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{t("refTitle", lang)}</div>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>{t("refSub", lang)}</div>
      </div>
      <div style={{ ...s.card, background: C.amberBg, border: `1px solid ${C.amberBorder}`, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.amber, marginBottom: 6 }}>{t("refPitfallTitle", lang)}</div>
        <div style={{ fontSize: 12, color: C.amber, lineHeight: 1.8 }}>
          {REF_PITFALLS.map((p, i) => (
            <span key={i}>{L(p[0], lang)}<strong>{L(p[1], lang)}</strong>{L(p[2], lang)}<br /></span>
          ))}
        </div>
      </div>

      <div style={{ ...s.card, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{t("refJpSection", lang)}</div>
        {block(REF_JP, "jp", C.blue)}
      </div>
      <div style={{ ...s.card, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{t("refSgSection", lang)}</div>
        {block(REF_SG, "sg", "#059669")}
      </div>

      <div style={{ ...s.card, border: `1px solid ${C.blueBorder}`, background: C.blueBg }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{L(REF_305.title, lang)}</div>
        <div style={{ fontSize: 11, color: C.sub, marginBottom: 10 }}>{L(REF_305.sub, lang)}</div>
        <div style={{ fontSize: 12, color: C.text, lineHeight: 1.8, marginBottom: 10 }}>
          {L(REF_305.bodyPre, lang)}<strong>{L(REF_305.bodyStrong, lang)}</strong>{L(REF_305.bodyPost, lang)}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{L(REF_305.listTitle, lang)}</div>
        {REF_305.items.map((it, j) => (
          <div key={j} style={{ fontSize: 13, padding: "3px 0", display: "flex", gap: 8 }}><span style={{ color: C.blue, flexShrink: 0 }}>•</span>{L(it, lang)}</div>
        ))}
        <div style={{ fontSize: 11, color: C.sub, marginTop: 10, lineHeight: 1.7 }}>{L(REF_305.foot, lang)}</div>
      </div>
    </div>
  );
}


// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const user = useUser();
  const [lang, setLangState] = useState(loadLang);
  const setLang = l => { setLangState(l); saveLang(l); };
  // NOTE: this doubles as the record-ownership key, so it must stay stable
  // across language changes — do not localise it.
  const currentUser = user?.name || user?.givenName || user?.email || FALLBACK_USER;
  const admin = isAdmin(user);
  const [tab, setTab] = useState("check");
  const [records, setRecords] = useState([]);

  function saveRecord(rec) {
    setRecords(r => {
      const exists = r.find(x => x.id === rec.id);
      return exists ? r.map(x => x.id === rec.id ? rec : x) : [rec, ...r];
    });
  }

  const draftRecords = records.filter(r => r.status === "draft");

  function resumeDraft(rec) {
    setTab("check");
  }

  const tabs = [
    { id: "check", label: t("tabCheck", lang) },
    { id: "records", label: `${t("tabRecords", lang)}${records.length > 0 ? `（${records.length}）` : ""}` },
    { id: "ref", label: t("tabRef", lang) },
  ];

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{t("appTitle", lang)}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{t("appSub", lang)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <LangToggle lang={lang} onChange={setLang} />
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>🔐 {displayName(currentUser, lang)}</div>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{t("version", lang)}</div>
        </div>
      </div>
      <div style={{ background: "#1e293b", padding: "4px 12px 0", display: "flex", gap: 4 }}>
        {tabs.map(tb => <NavTab key={tb.id} label={tb.label} active={tab === tb.id} onClick={() => setTab(tb.id)} />)}
      </div>
      {tab === "check" && <CheckPage onSave={saveRecord} currentUser={currentUser} admin={admin} draftRecords={draftRecords} onResumeDraft={resumeDraft} onViewDraft={() => setTab("records")} lang={lang} />}
      {tab === "records" && <RecordsPage records={records} currentUser={currentUser} admin={admin} lang={lang} />}
      {tab === "ref" && <RefPage lang={lang} />}
    </div>
  );
}
