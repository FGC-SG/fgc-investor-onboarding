// @ts-nocheck
/* eslint-disable */
import { useState, useRef, useCallback } from "react";
import { useUser } from "./auth/AuthProvider";
import { getAccessToken } from "./auth/msalConfig";
import { R, REF_JP, REF_SG } from "../shared/reference";

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
  tabAI: R("🤖 AI質問", "🤖 Ask AI"),

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

  aiTitle: R("🤖 AI質疑応答", "🤖 AI Q&A"),
  aiSub: R("適格性要件・法令解釈に関する疑問を質問できます。条文根拠付きで回答します。", "Ask about qualification requirements or statutory interpretation. Answers cite the underlying provisions."),
  aiEmpty: R("質問を入力してください", "Enter a question"),
  aiExample: R("例：LP出資契約は経験要件を満たしますか？", "e.g. Does an LP commitment satisfy the experience requirement?"),
  aiPlaceholder: R("質問を入力（Enterで送信）", "Type your question (Enter to send)"),
  aiSend: R("送信", "Send"),
  aiLoading: R("AIが回答を生成中...", "Generating an answer..."),
  aiFailed: R("回答を取得できませんでした。", "Could not retrieve an answer."),
  aiRefused: R("この質問には回答できませんでした。内容を変えてお試しください。", "That question could not be answered. Please try rephrasing it."),
  aiErrAuth: R("認証の有効期限が切れています。ページを再読み込みしてください。", "Your session has expired. Please reload the page."),
  aiErrRate: R("リクエストが多すぎます。しばらく待ってから再度お試しください。", "Too many requests. Please wait a little and try again."),
  aiErrConfig: R("AI機能が未設定です。管理者にご連絡ください。", "The AI feature is not configured. Please contact an administrator."),
  aiErrLong: R("質問が長すぎます。短くしてお試しください。", "That question is too long. Please shorten it."),
  aiErrGeneric: R("エラーが発生しました。しばらく待ってから再度お試しください。", "Something went wrong. Please try again shortly."),
  noContext: R("審査未開始", "No screening started"),
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
const O = (key, ja, en) => ({ key, ja, en });
const YES_NO = () => [O("yes", "はい", "Yes"), O("no", "いいえ", "No")];

const JP_QUESTIONS = {
  qii: [{
    id: "q1",
    text: R("以下のいずれかに該当しますか？", "Do any of the following apply?"),
    hint: R("金融商品取引法上の適格機関投資家として登録・認可を受けた機関（金商法2条3項14号・府令10条）", "Institutions registered or authorised as Qualified Institutional Investors under the FIEA (金商法2条3項14号・府令10条 / FIEA art. 2(3)(xiv); Cabinet Office Ordinance art. 10)"),
    options: [
      O("qii_bd", "第一種・第二種金融商品取引業者", "Type I / Type II Financial Instruments Business Operator"),
      O("qii_bank", "銀行・信託銀行・協同組織金融機関", "Bank, trust bank or cooperative financial institution"),
      O("qii_insurer", "保険会社", "Insurance company"),
      O("qii_inv_corp", "投資法人（J-REIT等）", "Investment corporation (e.g. J-REIT)"),
      O("qii_pension", "企業年金・確定拠出年金基金", "Corporate or defined-contribution pension fund"),
      O("qii_govt", "国・地方公共団体", "National government or local public entity"),
      O("qii_foreign", "外国の同種機関", "Foreign institution of an equivalent type"),
      O("none", "いずれも該当しない", "None of the above"),
    ],
  }],
  auto_qii: [
    { id: "q1", text: R("国内金融商品取引所に上場している法人ですか？", "Is the entity listed on a Japanese financial instruments exchange?"), hint: R("東証・名証・福証・札証等の国内取引所への上場（施行令1条の8の6第1項）", "Listing on a domestic exchange such as TSE, NSE, FSE or SSE (施行令1条の8の6第1項 / Enforcement Order art. 1-8-6(1))"), options: YES_NO() },
    { id: "q2", text: R("（上場していない場合）資本金または純資産が5億円以上ですか？", "(If not listed) Are stated capital or net assets JPY 500 million or more?"), hint: R("直近の計算書類における資本金または純資産額", "Stated capital or net assets per the most recent financial statements"), options: YES_NO() },
  ],
  app_qii: [
    { id: "q1", text: R("金融庁に申請型適格機関投資家として登録・認定されていますか？", "Is the entity registered with the FSA as an application-type QII?"), hint: R("金融庁の適格機関投資家等登録名簿への掲載を確認（金商法63条の4）", "Confirm the listing on the FSA register of QIIs, etc. (金商法63条の4 / FIEA art. 63-4)"), options: [O("registered", "はい（登録済み）", "Yes (registered)"), O("not_registered", "いいえ・申請中", "No / application pending")] },
    { id: "q2", text: R("（未登録の場合）純資産が10億円以上ですか？", "(If not registered) Are net assets JPY 1 billion or more?"), hint: R("申請の主要要件。登録には金融庁への申請・審査が必要です", "The principal test for application; registration requires FSA application and review"), options: YES_NO() },
  ],
  pro: [
    { id: "q_type", text: R("法人ですか、個人ですか？", "Is the investor a corporation or an individual?"), options: [O("corp", "法人", "Corporation"), O("individual", "個人", "Individual")] },
    { id: "q_corp1", text: R("【法人】国内金融商品取引所に上場していますか？", "[Corporate] Is the entity listed on a Japanese financial instruments exchange?"), hint: R("上場会社は特定投資家（プロ）として自動的に該当", "Listed companies automatically qualify as Specified Investors (Pro)"), options: YES_NO(), forType: "corp" },
    { id: "q_corp2", text: R("【法人】資本金または純資産が5,000万円以上ですか？", "[Corporate] Are stated capital or net assets JPY 50 million or more?"), hint: R("2016年3月改正により5億円から5,000万円に緩和（金商法施行令1条の8の6）", "Reduced from JPY 500 million to JPY 50 million by the March 2016 amendment (金商法施行令1条の8の6 / FIEA Enforcement Order art. 1-8-6)"), options: YES_NO(), forType: "corp" },
    { id: "q_corp3", text: R("【法人】外国法人または国・地方公共団体ですか？", "[Corporate] Is the entity a foreign corporation, the national government or a local public entity?"), options: YES_NO(), forType: "corp" },
    { id: "q_ind_asset", text: R("【個人】投資性金融資産（有価証券・デリバティブ等）が1億円以上ありますか？", "[Individual] Are investment-type financial assets (securities, derivatives, etc.) JPY 100 million or more?"), hint: R("金商法34条の4・施行令15条の31。預貯金は原則除外", "金商法34条の4・施行令15条の31 (FIEA art. 34-4; Enforcement Order art. 15-31). Bank deposits are in principle excluded"), options: YES_NO(), forType: "individual" },
    {
      id: "q_ind_exp",
      text: R("【個人】申出先の金融商品取引業者等との間で、有価証券またはデリバティブ取引に係る契約を1年以上継続して締結していますか？", "[Individual] Has a contract relating to securities or derivatives transactions been maintained for at least one year with the financial instruments business operator to which the request is made?"),
      hint: R("施行令15条の31第1項イ：第一種・第二種業者の区別なし。LP出資契約・ファンド持分取得も該当しうる", "施行令15条の31第1項イ (Enforcement Order art. 15-31(1)(a)): no distinction between Type I and Type II operators; LP commitments and fund interests may also qualify"),
      options: [
        O("exp_type1", "証券会社（第一種金融商品取引業者）との取引契約を1年以上継続", "Transaction contract with a securities company (Type I operator) maintained for at least one year"),
        O("exp_type2", "VC・PEファンド運用会社（第二種業者・投資運用業者）との取引契約を1年以上継続", "Transaction contract with a VC/PE fund manager (Type II operator / investment manager) maintained for at least one year"),
        O("exp_lp", "LP出資契約・ファンド持分取得（集団投資スキーム持分）を1年以上継続保有", "LP commitment or fund interest (collective investment scheme interest) held continuously for at least one year"),
        O("none", "いずれも該当しない", "None of the above"),
      ],
      forType: "individual",
    },
    {
      id: "q_ind_know",
      text: R("【個人・専門知識】以下の専門知識・経験・役職のいずれかを有していますか？（資産要件の代替）", "[Individual — expertise] Does the investor have any of the following expertise, experience or roles? (substitute for the asset test)"),
      hint: R("いずれかに該当する場合、投資性金融資産1億円の要件を代替できる場合があります（施行令15条の31第2項）", "If any applies, it may substitute for the JPY 100 million investment-type asset test (施行令15条の31第2項 / Enforcement Order art. 15-31(2))"),
      options: [
        O("know_fin_inst", "金融機関等（銀行・証券会社・保険会社等）での投資業務経験1年以上", "At least one year of investment work at a financial institution (bank, securities firm, insurer, etc.)"),
        O("know_vc_pe", "VC・PEファンド運用会社での業務経験1年以上", "At least one year of work at a VC or PE fund management company"),
        O("know_qual", "証券外務員・FP・CFA・CAIA等の投資関連専門資格保有", "Holds an investment-related professional qualification (registered sales representative, FP, CFA, CAIA, etc.)"),
        O("know_product", "デリバティブ・FX・未公開株・ファンド持分等の特定商品取引経験", "Trading experience in specified products (derivatives, FX, unlisted shares, fund interests, etc.)"),
        O("know_listed_cxo", "上場会社のCxO（CEO・CFO・COO等）または財務・投資担当役員", "CxO of a listed company (CEO, CFO, COO, etc.) or a director responsible for finance or investment"),
        O("know_startup_cxo", "ベンチャー企業のCxOとして、VC/PEからの資金調達・エクイティ取引に関与した経験", "As a CxO of a startup, experience of VC/PE fundraising or equity transactions"),
        O("know_inv_cmte", "投資委員会・ファイナンス委員会のメンバーとして投資判断に関与した経験", "Experience of investment decision-making as a member of an investment or finance committee"),
        O("none", "いずれも該当しない", "None of the above"),
      ],
      forType: "individual",
    },
  ],
  ama: [
    { id: "q_type", text: R("法人ですか、個人ですか？", "Is the investor a corporation or an individual?"), options: [O("corp", "法人", "Corporation"), O("individual", "個人", "Individual")] },
    { id: "q_ind_asset", text: R("【個人】投資性金融資産が1億円以上ありますか？", "[Individual] Are investment-type financial assets JPY 100 million or more?"), hint: R("金商法34条の4の申出要件。※「純金融資産3億円」は誤り", "The request test under 金商法34条の4 (FIEA art. 34-4). The \"JPY 300 million net financial assets\" figure is incorrect"), options: YES_NO(), forType: "individual" },
    {
      id: "q_ind_exp",
      text: R("【個人】申出先業者との有価証券またはデリバティブ取引に係る契約を1年以上継続していますか？", "[Individual] Has a securities or derivatives transaction contract with the recipient operator been maintained for at least one year?"),
      hint: R("施行令15条の31第1項イ：第一種・第二種業者の区別なし", "施行令15条の31第1項イ (Enforcement Order art. 15-31(1)(a)): no distinction between Type I and Type II operators"),
      options: [
        O("exp_type1", "証券会社との取引契約を1年以上継続", "Transaction contract with a securities company maintained for at least one year"),
        O("exp_type2", "VC/PEファンド運用会社との取引契約を1年以上継続", "Transaction contract with a VC/PE fund manager maintained for at least one year"),
        O("exp_lp", "LP出資契約・ファンド持分を1年以上継続保有", "LP commitment or fund interest held continuously for at least one year"),
        O("none", "いずれも該当しない", "None of the above"),
      ],
      forType: "individual",
    },
    { id: "q_ind_apply", text: R("【個人】取引金融機関に特定投資家扱いの申出を行いましたか（または今後行う予定ですか）？", "[Individual] Has a request for Specified Investor treatment been filed with the financial institution (or is one planned)?"), hint: R("申出は各金融機関ごとに個別に行う必要があります", "A separate request must be filed with each financial institution"), options: [O("applied", "申出済み・予定あり", "Filed or planned"), O("not_applied", "未定・行わない", "Undecided / will not file")], forType: "individual" },
    { id: "q_corp_asset", text: R("【法人】資本金または純資産が5,000万円以上ですか？", "[Corporate] Are stated capital or net assets JPY 50 million or more?"), hint: R("2016年3月改正後の基準（金商法34条の4）", "The threshold following the March 2016 amendment (金商法34条の4 / FIEA art. 34-4)"), options: YES_NO(), forType: "corp" },
    { id: "q_corp_apply", text: R("【法人】取引金融機関に特定投資家扱いの申出を行いましたか（または今後行う予定ですか）？", "[Corporate] Has a request for Specified Investor treatment been filed with the financial institution (or is one planned)?"), hint: R("申出は各金融機関ごとに個別に行う必要があります", "A separate request must be filed with each financial institution"), options: [O("applied", "申出済み・予定あり", "Filed or planned"), O("not_applied", "未定・行わない", "Undecided / will not file")], forType: "corp" },
  ],
};

const SG_ENTITY_TYPES = [
  { key: "individual", label: R("個人", "Individual"), button: R("👤 個人", "👤 Individual") },
  { key: "corporation", label: R("法人", "Corporation"), button: R("🏢 法人（通常法人・個人資産管理会社）", "🏢 Corporation (ordinary company / family investment vehicle)") },
];

const SG_QUESTIONS = {
  individual: [
    {
      id: "sg_fin",
      text: R("以下の財務要件のいずれかを満たしていますか？", "Is any of the following financial tests met?"),
      hint: R("いずれか一つで可（SFA Section 4A(1)(a)）", "Any one suffices (SFA s. 4A(1)(a))"),
      options: [
        O("net_assets", "純資産SGD 200万超（主たる住居上限SGD 100万）", "Net personal assets over SGD 2m (primary residence capped at SGD 1m)"),
        O("net_fin_assets", "純金融資産SGD 100万超", "Net financial assets over SGD 1m"),
        O("income", "直近12ヶ月の収入SGD 30万超", "Income over SGD 300,000 in the preceding 12 months"),
        O("none", "いずれも満たしていない", "None of the above is met"),
      ],
    },
    { id: "sg_optin", text: R("Accredited Investor地位へのオプトインに同意しますか？", "Do you consent to opting in to Accredited Investor status?"), hint: R("2018年SFA改正により、本人の積極的な選択（オプトイン）が法的に必須", "The 2018 SFA amendment makes an express opt-in legally mandatory"), options: [O("agree", "同意する", "I consent"), O("decline", "同意しない", "I do not consent")] },
  ],
  corporation: [
    { id: "sg_corp_type", text: R("法人の種別を選択してください", "Select the type of entity"), options: [O("normal", "通常の法人", "Ordinary corporation"), O("fiv", "個人資産管理会社（Family Investment Vehicle）", "Family investment vehicle (FIV)")] },
    { id: "sg_corp_asset", text: R("【通常法人】純資産がSGD 1,000万超ですか？", "[Ordinary corporation] Are net assets over SGD 10 million?"), hint: R("直近の監査済みバランスシートにおける純資産額（SFA Section 4A(1)(a)(ii)）", "Net assets per the most recent audited balance sheet (SFA s. 4A(1)(a)(ii))"), options: YES_NO(), forType: "normal" },
    { id: "sg_corp_ai", text: R("【通常法人】Accredited Investorのみが出資する法人ですか？", "[Ordinary corporation] Are all equity holders Accredited Investors?"), options: YES_NO(), forType: "normal" },
    { id: "sg_fiv1", text: R("【個人資産管理会社】株主個人は純資産SGD 200万超ですか？", "[FIV] Does the individual shareholder have net personal assets over SGD 2 million?"), hint: R("主たる住居の算入上限はSGD 100万", "The primary residence counts up to SGD 1 million"), options: YES_NO(), forType: "fiv" },
    { id: "sg_fiv2", text: R("【個人資産管理会社】株主個人は純金融資産SGD 100万超ですか？", "[FIV] Does the individual shareholder have net financial assets over SGD 1 million?"), options: YES_NO(), forType: "fiv" },
    { id: "sg_fiv3", text: R("【個人資産管理会社】株主個人の直近12ヶ月収入はSGD 30万超ですか？", "[FIV] Was the individual shareholder's income over SGD 300,000 in the preceding 12 months?"), options: YES_NO(), forType: "fiv" },
    { id: "sg_optin", text: R("Accredited Investor地位へのオプトインに同意しますか？", "Do you consent to opting in to Accredited Investor status?"), hint: R("2018年SFA改正により積極的なオプトインが必須", "The 2018 SFA amendment makes an express opt-in mandatory"), options: [O("agree", "同意する", "I consent"), O("decline", "同意しない", "I do not consent")] },
  ],
};

// ─── Evaluation ───────────────────────────────────────────────────────────────
// Logic compares answer KEYS only. Reasons are produced as { ja, en } pairs so a
// record captured in one language can be read back in the other.
function optOf(questions, qid, key) {
  const q = questions.find(x => x.id === qid);
  const o = q && q.options.find(op => op.key === key);
  return o || { key, ja: "", en: "" };
}

function evalJP(cat, answers) {
  switch (cat) {
    case "qii": {
      if (answers["q1"] && answers["q1"] !== "none") {
        const o = optOf(JP_QUESTIONS.qii, "q1", answers["q1"]);
        return { met: true, reason: R(
          `${o.ja}として適格機関投資家に該当します（金商法2条3項14号）。`,
          `Qualifies as a Qualified Institutional Investor in the capacity of: ${o.en} (金商法2条3項14号 / FIEA art. 2(3)(xiv)).`) };
      }
      return { met: false, reason: R("適格機関投資家（QII）の要件を満たしていません。", "The Qualified Institutional Investor (QII) requirements are not met.") };
    }
    case "auto_qii": {
      if (answers["q1"] === "yes") return { met: true, reason: R("上場会社として自動的適格機関投資家に該当します。", "Qualifies as an Automatic QII by virtue of being a listed company.") };
      if (answers["q2"] === "yes") return { met: true, reason: R("資本金または純資産5億円以上の法人として自動的適格機関投資家に該当します。", "Qualifies as an Automatic QII as an entity with stated capital or net assets of JPY 500 million or more.") };
      return { met: false, reason: R("自動的適格機関投資家の要件（上場または資本金・純資産5億円以上）を満たしていません。", "The Automatic QII requirements (listing, or stated capital / net assets of JPY 500 million or more) are not met.") };
    }
    case "app_qii": {
      if (answers["q1"] === "registered") return { met: true, reason: R("金融庁登録済みの申請型適格機関投資家に該当します（金商法63条の4）。", "Qualifies as an FSA-registered application-type QII (金商法63条の4 / FIEA art. 63-4).") };
      if (answers["q2"] === "yes") return { met: null, reason: R("純資産要件（10億円以上）は満たしていますが、金融庁への申請・審査・登録が必要です。", "The net asset test (JPY 1 billion or more) is met, but application to, review by and registration with the FSA are still required.") };
      return { met: false, reason: R("申請型適格機関投資家の要件を満たしていません（純資産10億円以上かつ金融庁登録が必要）。", "The application-type QII requirements are not met (net assets of JPY 1 billion or more plus FSA registration are required).") };
    }
    case "pro": {
      const t = answers["q_type"];
      if (t === "corp") {
        if (answers["q_corp1"] === "yes") return { met: true, reason: R("上場会社として特定投資家（プロ）に該当します。", "Qualifies as a Specified Investor (Pro) by virtue of being a listed company.") };
        if (answers["q_corp2"] === "yes") return { met: true, reason: R("資本金または純資産5,000万円以上の法人として特定投資家（プロ）に該当します（2016年3月改正基準）。", "Qualifies as a Specified Investor (Pro) as an entity with stated capital or net assets of JPY 50 million or more (threshold as amended in March 2016).") };
        if (answers["q_corp3"] === "yes") return { met: true, reason: R("外国法人・国・地方公共団体として特定投資家（プロ）に該当します。", "Qualifies as a Specified Investor (Pro) as a foreign corporation, the national government or a local public entity.") };
        return { met: false, reason: R("法人の特定投資家（プロ）要件（上場・資本金等5,000万円以上・外国法人等）を満たしていません。", "The corporate Specified Investor (Pro) requirements (listing, stated capital / net assets of JPY 50 million or more, foreign corporation, etc.) are not met.") };
      } else if (t === "individual") {
        const know = answers["q_ind_know"];
        const expAns = answers["q_ind_exp"];
        const expMet = expAns && expAns !== "none";
        const expLabel = expAns === "exp_type1" ? R("証券会社との取引契約1年以上", "a transaction contract with a securities company maintained for at least one year")
          : expAns === "exp_type2" ? R("VC/PEファンド運用会社との取引契約1年以上（施行令15条の31第1項イ：第一種・第二種の区別なし）", "a transaction contract with a VC/PE fund manager maintained for at least one year (施行令15条の31第1項イ / Enforcement Order art. 15-31(1)(a) draws no distinction between Type I and Type II operators)")
          : expAns === "exp_lp" ? R("LP出資契約・ファンド持分1年以上継続保有（金商法2条2項5号の有価証券に係る契約として該当）", "an LP commitment or fund interest held continuously for at least one year (treated as a contract relating to securities under 金商法2条2項5号 / FIEA art. 2(2)(v))")
          : R("", "");
        if (know && know !== "none") {
          const k = optOf(JP_QUESTIONS.pro, "q_ind_know", know);
          if (expMet) return { met: true, reason: R(
            `専門知識・経験（${k.ja}）を有し、${expLabel.ja}の要件を満たすため特定投資家（プロ）に該当します（資産要件の代替、施行令15条の31第2項）。`,
            `Qualifies as a Specified Investor (Pro): the investor has the requisite expertise/experience (${k.en}) and satisfies ${expLabel.en}, which substitutes for the asset test (施行令15条の31第2項 / Enforcement Order art. 15-31(2)).`) };
          return { met: false, reason: R(
            `専門知識要件（${k.ja}）は満たしていますが、申出先業者との有価証券またはデリバティブ取引契約の1年以上継続要件を満たしていません。`,
            `The expertise test (${k.en}) is met, but the requirement for a securities or derivatives transaction contract maintained for at least one year with the recipient operator is not.`) };
        }
        const assetMet = answers["q_ind_asset"] === "yes";
        if (assetMet && expMet) return { met: true, reason: R(
          `投資性金融資産1億円以上かつ${expLabel.ja}の要件を満たすため特定投資家（プロ）に該当します（金商法34条の4・施行令15条の31第1項）。`,
          `Qualifies as a Specified Investor (Pro): investment-type financial assets of JPY 100 million or more, together with ${expLabel.en} (金商法34条の4・施行令15条の31第1項 / FIEA art. 34-4; Enforcement Order art. 15-31(1)).`) };
        if (assetMet) return { met: false, reason: R("投資性金融資産1億円以上の要件は満たしていますが、申出先業者との取引契約1年以上継続要件を満たしていません。", "The JPY 100 million investment-type asset test is met, but the requirement for a transaction contract with the recipient operator maintained for at least one year is not.") };
        if (expMet) return { met: false, reason: R("取引契約1年以上の要件は満たしていますが、投資性金融資産1億円以上の要件を満たしていません。専門知識ルートをご確認ください。", "The one-year transaction contract test is met, but investment-type financial assets do not reach JPY 100 million. Consider the expertise route.") };
        return { met: false, reason: R("個人の特定投資家（プロ）要件（投資性金融資産1億円以上かつ取引契約1年以上、または専門知識要件＋取引契約1年以上）を満たしていません。", "The individual Specified Investor (Pro) requirements are not met (investment-type financial assets of JPY 100 million or more plus a one-year transaction contract, or the expertise test plus a one-year transaction contract).") };
      }
      return { met: false, reason: R("区分が未選択です。", "No category has been selected.") };
    }
    case "ama": {
      const t = answers["q_type"];
      if (t === "individual") {
        const asset = answers["q_ind_asset"] === "yes";
        const exp = answers["q_ind_exp"] && answers["q_ind_exp"] !== "none";
        const apply = answers["q_ind_apply"] === "applied";
        if (asset && exp && apply) return { met: true, reason: R("投資性金融資産1億円以上かつ取引契約1年以上の要件を満たし、金融機関への申出により特定投資家として扱われます（金商法34条の4）。申出した金融機関との取引においてのみ有効です。", "Investment-type financial assets of JPY 100 million or more and a one-year transaction contract are satisfied, so the investor may be treated as a Specified Investor upon request to the financial institution (金商法34条の4 / FIEA art. 34-4). The treatment applies only to dealings with the institution to which the request was made.") };
        if (!asset) return { met: false, reason: R("投資性金融資産1億円以上の要件を満たしていません。", "The JPY 100 million investment-type asset test is not met.") };
        if (!exp) return { met: false, reason: R("申出先業者との取引契約1年以上継続の要件を満たしていません。", "The requirement for a transaction contract with the recipient operator maintained for at least one year is not met.") };
        return { met: false, reason: R("取引金融機関への申出が必要です。", "A request must be filed with the financial institution.") };
      } else if (t === "corp") {
        const asset = answers["q_corp_asset"] === "yes";
        const apply = answers["q_corp_apply"] === "applied";
        if (asset && apply) return { met: true, reason: R("資本金または純資産5,000万円以上の法人として申出により特定投資家に移行できます（金商法34条の4）。", "As an entity with stated capital or net assets of JPY 50 million or more, it may transition to Specified Investor status by filing a request (金商法34条の4 / FIEA art. 34-4).") };
        if (!asset) return { met: false, reason: R("資本金または純資産5,000万円以上の要件を満たしていません。", "The requirement for stated capital or net assets of JPY 50 million or more is not met.") };
        return { met: false, reason: R("取引金融機関への申出が必要です。", "A request must be filed with the financial institution.") };
      }
      return { met: false, reason: R("区分が未選択です。", "No category has been selected.") };
    }
    default: return { met: false, reason: R("", "") };
  }
}

function evalSG(entityType, answers) {
  if (entityType === "individual") {
    const finMet = answers["sg_fin"] && answers["sg_fin"] !== "none";
    const optIn = answers["sg_optin"] === "agree";
    if (finMet && optIn) {
      const f = optOf(SG_QUESTIONS.individual, "sg_fin", answers["sg_fin"]);
      return { met: true, reason: R(
        `財務要件（${f.ja}）およびオプトイン要件を満たしています（SFA Section 4A）。`,
        `The financial test (${f.en}) and the opt-in requirement are both satisfied (SFA s. 4A).`) };
    }
    if (!finMet) return { met: false, reason: R("財務要件を満たしていません。", "The financial tests are not met.") };
    return { met: false, reason: R("2018年SFA改正により、本人のオプトインへの積極的な同意が必須です。", "Following the 2018 SFA amendment, express consent to opt in is mandatory.") };
  } else {
    const t = answers["sg_corp_type"];
    const optIn = answers["sg_optin"] === "agree";
    if (t === "normal") {
      const met = answers["sg_corp_asset"] === "yes" || answers["sg_corp_ai"] === "yes";
      if (met && optIn) return { met: true, reason: answers["sg_corp_asset"] === "yes"
        ? R("純資産SGD 1,000万超の法人としてAI要件を満たします。", "Meets the Accredited Investor test as an entity with net assets exceeding SGD 10 million.")
        : R("AIのみが出資する法人としてAI要件を満たします。", "Meets the Accredited Investor test as an entity all of whose equity holders are Accredited Investors.") };
      if (!met) return { met: false, reason: R("法人のAI要件を満たしていません。", "The corporate Accredited Investor tests are not met.") };
      return { met: false, reason: R("オプトインへの同意が必要です。", "Consent to opt in is required.") };
    } else if (t === "fiv") {
      const sh = answers["sg_fiv1"] === "yes" || answers["sg_fiv2"] === "yes" || answers["sg_fiv3"] === "yes";
      if (sh && optIn) return { met: true, reason: R("株主個人がAI財務要件を満たす個人資産管理会社として適格です。", "Eligible as a family investment vehicle whose individual shareholder meets the Accredited Investor financial tests.") };
      if (!sh) return { met: false, reason: R("株主個人がAIの財務要件を満たしていません。", "The individual shareholder does not meet the Accredited Investor financial tests.") };
      return { met: false, reason: R("オプトインへの同意が必要です。", "Consent to opt in is required.") };
    }
    return { met: false, reason: R("法人種別が未選択です。", "No entity type has been selected.") };
  }
}

async function askAI(question, context, lang) {
  // Calls our own server proxy, which holds the Anthropic key, authenticates
  // the caller against Entra and rate-limits per user. The browser never sees
  // a provider credential.
  const token = await getAccessToken();
  if (!token) throw new Error("not_authenticated");

  const res = await fetch("/api/ask-ai", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ question, context, lang }),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "upstream_error" }));
    throw new Error(error || `http_${res.status}`);
  }

  const data = await res.json();
  if (data.refused) return t("aiRefused", lang);
  return data.answer || t("aiFailed", lang);
}

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

// ─── AI Page ──────────────────────────────────────────────────────────────────
function AIPage({ context, lang }) {
  const [q, setQ] = useState("");
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  // Maps the proxy's error codes to a message the user can act on.
  function errorText(code, lang) {
    switch (code) {
      case "not_authenticated":
      case "missing_token":
      case "invalid_token":
      case "forbidden":            return t("aiErrAuth", lang);
      case "rate_limited":         return t("aiErrRate", lang);
      case "server_not_configured": return t("aiErrConfig", lang);
      case "question_too_long":    return t("aiErrLong", lang);
      default:                     return t("aiErrGeneric", lang);
    }
  }

  async function send() {
    if (!q.trim() || loading) return;
    const question = q.trim(); setQ(""); setLoading(true);
    setLog(l => [...l, { role: "user", text: question }]);
    try {
      const ans = await askAI(question, L(context, lang), lang);
      setLog(l => [...l, { role: "ai", text: ans }]);
    } catch (e) {
      setLog(l => [...l, { role: "ai", text: errorText(e?.message, lang), isError: true }]);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div style={{ padding: "16px" }}>
      <div style={{ ...s.card, background: "#1e293b", color: "#fff", marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{t("aiTitle", lang)}</div>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>{t("aiSub", lang)}</div>
      </div>
      <div style={{ ...s.card, minHeight: 200, marginBottom: 12 }}>
        {log.length === 0 && <div style={{ fontSize: 13, color: C.faint, textAlign: "center", marginTop: 40 }}>{t("aiEmpty", lang)}<br /><span style={{ fontSize: 12 }}>{t("aiExample", lang)}</span></div>}
        {log.map((m, i) => (
          <div key={i} style={{ marginBottom: 12, display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "85%", padding: "8px 12px", borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: m.role === "user" ? "#1e293b" : m.isError ? C.redBg : "#f1f5f9", color: m.role === "user" ? "#fff" : m.isError ? C.red : C.text, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div style={{ fontSize: 13, color: C.sub, padding: 8 }}>{t("aiLoading", lang)}</div>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <textarea value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={t("aiPlaceholder", lang)} rows={2}
          style={{ flex: 1, padding: "8px 10px", fontSize: 13, borderRadius: 8, border: `1px solid ${C.border}`, resize: "none", fontFamily: "system-ui,sans-serif" }} />
        <button onClick={send} disabled={!q.trim() || loading} style={{ ...s.btn, background: "#1e293b", color: "#fff", border: "none", padding: "0 16px", opacity: !q.trim() || loading ? 0.5 : 1 }}>{t("aiSend", lang)}</button>
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
  const [lastContext, setLastContext] = useState(() => T.noContext);

  function saveRecord(rec) {
    setRecords(r => {
      const exists = r.find(x => x.id === rec.id);
      return exists ? r.map(x => x.id === rec.id ? rec : x) : [rec, ...r];
    });
    const cat = JP_CATEGORIES.find(c => c.id === rec.jpCat);
    const sgType = SG_ENTITY_TYPES.find(e => e.key === rec.sgEntityType);
    setLastContext(R(
      `${rec.investorName} — 日本：${cat?.label.ja || ""}、SG：${sgType?.label.ja || ""}、結果：${rec.overall ? "適格" : "未確定"}`,
      `${rec.investorName} — Japan: ${cat?.label.en || ""}; Singapore: ${sgType?.label.en || ""}; outcome: ${rec.overall ? "eligible" : "undetermined"}`));
  }

  const draftRecords = records.filter(r => r.status === "draft");

  function resumeDraft(rec) {
    setTab("check");
  }

  const tabs = [
    { id: "check", label: t("tabCheck", lang) },
    { id: "records", label: `${t("tabRecords", lang)}${records.length > 0 ? `（${records.length}）` : ""}` },
    { id: "ref", label: t("tabRef", lang) },
    { id: "ai", label: t("tabAI", lang) },
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
      {tab === "ai" && <AIPage context={lastContext} lang={lang} />}
    </div>
  );
}
