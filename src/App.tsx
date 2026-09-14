// @ts-nocheck
/* eslint-disable */
import { useState, useRef, useCallback } from "react";
import { useUser } from "./auth/AuthProvider";

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

// ─── Reference data ───────────────────────────────────────────────────────────
const REF_JP = [
  { cat: "① 適格機関投資家（QII）", law: "金商法2条3項14号・府令10条", items: ["第一種・第二種金融商品取引業者（登録業者）", "銀行・信託銀行・協同組織金融機関", "保険会社", "投資法人（J-REIT等）", "企業年金・確定拠出年金基金", "国・地方公共団体", "外国の同種機関（上記に相当するもの）", "※ 金融庁への届出・登録が前提"] },
  { cat: "② 自動的適格機関投資家", law: "金商法施行令1条の8の6第1項", items: ["国内金融商品取引所に上場している株式会社", "資本金または純資産が5億円以上の株式会社"] },
  { cat: "③ 申請型適格機関投資家", law: "金商法63条の4", items: ["純資産10億円以上の法人", "金融庁への申請・審査・登録が必要", "登録後、金融庁の適格機関投資家等登録名簿に掲載"] },
  { cat: "④ 特定投資家（プロ）— 法人", law: "金商法2条31項・施行令1条の8の6（2016年3月改正）", items: ["上場会社（国内金融商品取引所上場）", "資本金または純資産が5,000万円以上の法人（2016年3月改正）", "外国法人", "国・地方公共団体"] },
  { cat: "④ 特定投資家（プロ）— 個人", law: "金商法34条の4・施行令15条の31", items: ["【資産要件】投資性金融資産（有価証券・デリバティブ等）が1億円以上", "【経験要件】申出先の金融商品取引業者等との間で有価証券またはデリバティブ取引に係る契約を1年以上継続（施行令15条の31第1項イ）", "※ 第一種・第二種業者の区別なし。条文は「当該金融商品取引業者等との間で」と規定するのみ", "─── 経験要件：契約の範囲（条文解釈）───", "【①】証券会社（第一種業者）との取引契約1年以上継続", "【②】VC/PEファンド運用会社（第二種業者・投資運用業者）との取引契約1年以上継続", "【③】LP出資契約・ファンド持分取得（金商法2条2項5号の有価証券）を1年以上継続保有", "※ ①〜③いずれも施行令15条の31第1項イの「有価証券又はデリバティブ取引に係る契約」に該当しうる", "─── 専門知識・経験による資産要件の代替（いずれかで可）───", "【代替①】金融機関等（銀行・証券・保険）での投資業務経験1年以上", "【代替②】VC・PEファンド運用会社での業務経験1年以上", "【代替③】証券外務員・FP・CFA・CAIA等の投資関連専門資格保有", "【代替④】デリバティブ・FX・未公開株・ファンド持分等の特定商品取引経験", "【代替⑤】上場会社のCxO（CEO・CFO等）または財務・投資担当役員", "【代替⑥】ベンチャー企業CxOとしてVC/PEからの資金調達・エクイティ取引に関与", "【代替⑦】投資委員会・ファイナンス委員会メンバーとして投資判断に関与", "※ 代替⑤〜⑦は施行令上の明文規定ではなく実務上の解釈・運用によるものです"] },
  { cat: "⑤ 特定投資家（アマ→プロ移行）— 個人申出", law: "金商法34条の4", items: ["【要件①】投資性金融資産が1億円以上（※「純金融資産3億円」は誤り）", "【要件②】申出先業者との有価証券またはデリバティブ取引契約を1年以上継続", "→ 上記両方を満たした上で、取引金融機関に申出", "→ 申出した金融機関との取引においてのみ特定投資家として扱われる"] },
  { cat: "⑤ 特定投資家（アマ→プロ移行）— 法人申出", law: "金商法34条の4", items: ["資本金または純資産が5,000万円以上の法人が申出により移行", "申出した金融機関との取引においてのみ特定投資家として扱われる"] },
];
const REF_SG = [
  { cat: "個人（Accredited Investor）", law: "SFA Section 4A(1)(a)", items: ["以下いずれか一つを満たし、かつ本人のオプトインが必須", "【①】純資産SGD 200万超（主たる住居の算入上限はSGD 100万）", "【②】純金融資産SGD 100万超（預金・資本市場商品・生命保険等）", "【③】直近12ヶ月の収入SGD 30万超", "※ オプトインなし（黙示的同意）は認められない（2018年改正）"] },
  { cat: "法人（Accredited Investor）", law: "SFA Section 4A(1)(a)(ii)", items: ["【①】純資産SGD 1,000万超（直近の監査済みバランスシート基準）", "【②】Accredited Investorのみが出資する法人", "【③】個人資産管理会社（Family Investment Vehicle / FIV）：株主個人がAI要件を満たす場合も可"] },
];

const JP_CATEGORIES = [
  { id: "qii", label: "適格機関投資家", labelEn: "Qualified Institutional Investor (QII)", color: C.blue, bg: C.blueBg, border: C.blueBorder, icon: "🏦" },
  { id: "auto_qii", label: "自動的適格機関投資家", labelEn: "Automatic QII", color: C.purple, bg: C.purpleBg, border: C.purpleBorder, icon: "🏛" },
  { id: "app_qii", label: "申請型適格機関投資家", labelEn: "Application-type QII", color: "#0f766e", bg: "#ccfbf1", border: "#99f6e4", icon: "📋" },
  { id: "pro", label: "特定投資家（プロ）", labelEn: "Specified Investor (Pro)", color: "#b45309", bg: "#fef3c7", border: "#fcd34d", icon: "⭐" },
  { id: "ama", label: "特定投資家（アマ→プロ移行）", labelEn: "Specified Investor (Retail→Pro)", color: C.sub, bg: "#f3f4f6", border: C.border, icon: "🔄" },
];

const JP_QUESTIONS = {
  qii: [{ id: "q1", text: "以下のいずれかに該当しますか？", hint: "金融商品取引法上の適格機関投資家として登録・認可を受けた機関（金商法2条3項14号・府令10条）", options: ["第一種・第二種金融商品取引業者", "銀行・信託銀行・協同組織金融機関", "保険会社", "投資法人（J-REIT等）", "企業年金・確定拠出年金基金", "国・地方公共団体", "外国の同種機関", "いずれも該当しない"] }],
  auto_qii: [
    { id: "q1", text: "国内金融商品取引所に上場している法人ですか？", hint: "東証・名証・福証・札証等の国内取引所への上場（施行令1条の8の6第1項）", options: ["はい", "いいえ"] },
    { id: "q2", text: "（上場していない場合）資本金または純資産が5億円以上ですか？", hint: "直近の計算書類における資本金または純資産額", options: ["はい", "いいえ"] },
  ],
  app_qii: [
    { id: "q1", text: "金融庁に申請型適格機関投資家として登録・認定されていますか？", hint: "金融庁の適格機関投資家等登録名簿への掲載を確認（金商法63条の4）", options: ["はい（登録済み）", "いいえ・申請中"] },
    { id: "q2", text: "（未登録の場合）純資産が10億円以上ですか？", hint: "申請の主要要件。登録には金融庁への申請・審査が必要です", options: ["はい", "いいえ"] },
  ],
  pro: [
    { id: "q_type", text: "法人ですか、個人ですか？", options: ["法人", "個人"] },
    { id: "q_corp1", text: "【法人】国内金融商品取引所に上場していますか？", hint: "上場会社は特定投資家（プロ）として自動的に該当", options: ["はい", "いいえ"], forType: "法人" },
    { id: "q_corp2", text: "【法人】資本金または純資産が5,000万円以上ですか？", hint: "2016年3月改正により5億円から5,000万円に緩和（金商法施行令1条の8の6）", options: ["はい", "いいえ"], forType: "法人" },
    { id: "q_corp3", text: "【法人】外国法人または国・地方公共団体ですか？", options: ["はい", "いいえ"], forType: "法人" },
    { id: "q_ind_asset", text: "【個人】投資性金融資産（有価証券・デリバティブ等）が1億円以上ありますか？", hint: "金商法34条の4・施行令15条の31。預貯金は原則除外", options: ["はい", "いいえ"], forType: "個人" },
    { id: "q_ind_exp", text: "【個人】申出先の金融商品取引業者等との間で、有価証券またはデリバティブ取引に係る契約を1年以上継続して締結していますか？", hint: "施行令15条の31第1項イ：第一種・第二種業者の区別なし。LP出資契約・ファンド持分取得も該当しうる", options: ["証券会社（第一種金融商品取引業者）との取引契約を1年以上継続", "VC・PEファンド運用会社（第二種業者・投資運用業者）との取引契約を1年以上継続", "LP出資契約・ファンド持分取得（集団投資スキーム持分）を1年以上継続保有", "いずれも該当しない"], forType: "個人" },
    { id: "q_ind_know", text: "【個人・専門知識】以下の専門知識・経験・役職のいずれかを有していますか？（資産要件の代替）", hint: "いずれかに該当する場合、投資性金融資産1億円の要件を代替できる場合があります（施行令15条の31第2項）", options: ["金融機関等（銀行・証券会社・保険会社等）での投資業務経験1年以上", "VC・PEファンド運用会社での業務経験1年以上", "証券外務員・FP・CFA・CAIA等の投資関連専門資格保有", "デリバティブ・FX・未公開株・ファンド持分等の特定商品取引経験", "上場会社のCxO（CEO・CFO・COO等）または財務・投資担当役員", "ベンチャー企業のCxOとして、VC/PEからの資金調達・エクイティ取引に関与した経験", "投資委員会・ファイナンス委員会のメンバーとして投資判断に関与した経験", "いずれも該当しない"], forType: "個人" },
  ],
  ama: [
    { id: "q_type", text: "法人ですか、個人ですか？", options: ["法人", "個人"] },
    { id: "q_ind_asset", text: "【個人】投資性金融資産が1億円以上ありますか？", hint: "金商法34条の4の申出要件。※「純金融資産3億円」は誤り", options: ["はい", "いいえ"], forType: "個人" },
    { id: "q_ind_exp", text: "【個人】申出先業者との有価証券またはデリバティブ取引に係る契約を1年以上継続していますか？", hint: "施行令15条の31第1項イ：第一種・第二種業者の区別なし", options: ["証券会社との取引契約を1年以上継続", "VC/PEファンド運用会社との取引契約を1年以上継続", "LP出資契約・ファンド持分を1年以上継続保有", "いずれも該当しない"], forType: "個人" },
    { id: "q_ind_apply", text: "【個人】取引金融機関に特定投資家扱いの申出を行いましたか（または今後行う予定ですか）？", hint: "申出は各金融機関ごとに個別に行う必要があります", options: ["申出済み・予定あり", "未定・行わない"], forType: "個人" },
    { id: "q_corp_asset", text: "【法人】資本金または純資産が5,000万円以上ですか？", hint: "2016年3月改正後の基準（金商法34条の4）", options: ["はい", "いいえ"], forType: "法人" },
    { id: "q_corp_apply", text: "【法人】取引金融機関に特定投資家扱いの申出を行いましたか（または今後行う予定ですか）？", hint: "申出は各金融機関ごとに個別に行う必要があります", options: ["申出済み・予定あり", "未定・行わない"], forType: "法人" },
  ],
};

const SG_QUESTIONS = {
  individual: [
    { id: "sg_fin", text: "以下の財務要件のいずれかを満たしていますか？", hint: "いずれか一つで可（SFA Section 4A(1)(a)）", options: ["純資産SGD 200万超（主たる住居上限SGD 100万）", "純金融資産SGD 100万超", "直近12ヶ月の収入SGD 30万超", "いずれも満たしていない"] },
    { id: "sg_optin", text: "Accredited Investor地位へのオプトインに同意しますか？", hint: "2018年SFA改正により、本人の積極的な選択（オプトイン）が法的に必須", options: ["同意する", "同意しない"] },
  ],
  corporation: [
    { id: "sg_corp_type", text: "法人の種別を選択してください", options: ["通常の法人", "個人資産管理会社（Family Investment Vehicle）"] },
    { id: "sg_corp_asset", text: "【通常法人】純資産がSGD 1,000万超ですか？", hint: "直近の監査済みバランスシートにおける純資産額（SFA Section 4A(1)(a)(ii)）", options: ["はい", "いいえ"], forType: "通常の法人" },
    { id: "sg_corp_ai", text: "【通常法人】Accredited Investorのみが出資する法人ですか？", options: ["はい", "いいえ"], forType: "通常の法人" },
    { id: "sg_fiv1", text: "【個人資産管理会社】株主個人は純資産SGD 200万超ですか？", hint: "主たる住居の算入上限はSGD 100万", options: ["はい", "いいえ"], forType: "個人資産管理会社（Family Investment Vehicle）" },
    { id: "sg_fiv2", text: "【個人資産管理会社】株主個人は純金融資産SGD 100万超ですか？", options: ["はい", "いいえ"], forType: "個人資産管理会社（Family Investment Vehicle）" },
    { id: "sg_fiv3", text: "【個人資産管理会社】株主個人の直近12ヶ月収入はSGD 30万超ですか？", options: ["はい", "いいえ"], forType: "個人資産管理会社（Family Investment Vehicle）" },
    { id: "sg_optin", text: "Accredited Investor地位へのオプトインに同意しますか？", hint: "2018年SFA改正により積極的なオプトインが必須", options: ["同意する", "同意しない"] },
  ],
};

// ─── Evaluation ───────────────────────────────────────────────────────────────
function evalJP(cat, answers) {
  switch (cat) {
    case "qii": return answers["q1"] && answers["q1"] !== "いずれも該当しない" ? { met: true, reason: `${answers["q1"]}として適格機関投資家に該当します（金商法2条3項14号）。` } : { met: false, reason: "適格機関投資家（QII）の要件を満たしていません。" };
    case "auto_qii": {
      if (answers["q1"] === "はい") return { met: true, reason: "上場会社として自動的適格機関投資家に該当します。" };
      if (answers["q2"] === "はい") return { met: true, reason: "資本金または純資産5億円以上の法人として自動的適格機関投資家に該当します。" };
      return { met: false, reason: "自動的適格機関投資家の要件（上場または資本金・純資産5億円以上）を満たしていません。" };
    }
    case "app_qii": {
      if (answers["q1"] === "はい（登録済み）") return { met: true, reason: "金融庁登録済みの申請型適格機関投資家に該当します（金商法63条の4）。" };
      if (answers["q2"] === "はい") return { met: null, reason: "純資産要件（10億円以上）は満たしていますが、金融庁への申請・審査・登録が必要です。" };
      return { met: false, reason: "申請型適格機関投資家の要件を満たしていません（純資産10億円以上かつ金融庁登録が必要）。" };
    }
    case "pro": {
      const t = answers["q_type"];
      if (t === "法人") {
        if (answers["q_corp1"] === "はい") return { met: true, reason: "上場会社として特定投資家（プロ）に該当します。" };
        if (answers["q_corp2"] === "はい") return { met: true, reason: "資本金または純資産5,000万円以上の法人として特定投資家（プロ）に該当します（2016年3月改正基準）。" };
        if (answers["q_corp3"] === "はい") return { met: true, reason: "外国法人・国・地方公共団体として特定投資家（プロ）に該当します。" };
        return { met: false, reason: "法人の特定投資家（プロ）要件（上場・資本金等5,000万円以上・外国法人等）を満たしていません。" };
      } else if (t === "個人") {
        const know = answers["q_ind_know"];
        const expAns = answers["q_ind_exp"];
        const expMet = expAns && expAns !== "いずれも該当しない";
        const expLabel = expAns === "証券会社（第一種金融商品取引業者）との取引契約を1年以上継続" ? "証券会社との取引契約1年以上"
          : expAns === "VC・PEファンド運用会社（第二種業者・投資運用業者）との取引契約を1年以上継続" ? "VC/PEファンド運用会社との取引契約1年以上（施行令15条の31第1項イ：第一種・第二種の区別なし）"
          : expAns === "LP出資契約・ファンド持分取得（集団投資スキーム持分）を1年以上継続保有" ? "LP出資契約・ファンド持分1年以上継続保有（金商法2条2項5号の有価証券に係る契約として該当）" : expAns || "";
        if (know && know !== "いずれも該当しない") {
          if (expMet) return { met: true, reason: `専門知識・経験（${know}）を有し、${expLabel}の要件を満たすため特定投資家（プロ）に該当します（資産要件の代替、施行令15条の31第2項）。` };
          return { met: false, reason: `専門知識要件（${know}）は満たしていますが、申出先業者との有価証券またはデリバティブ取引契約の1年以上継続要件を満たしていません。` };
        }
        const assetMet = answers["q_ind_asset"] === "はい";
        if (assetMet && expMet) return { met: true, reason: `投資性金融資産1億円以上かつ${expLabel}の要件を満たすため特定投資家（プロ）に該当します（金商法34条の4・施行令15条の31第1項）。` };
        if (assetMet) return { met: false, reason: "投資性金融資産1億円以上の要件は満たしていますが、申出先業者との取引契約1年以上継続要件を満たしていません。" };
        if (expMet) return { met: false, reason: "取引契約1年以上の要件は満たしていますが、投資性金融資産1億円以上の要件を満たしていません。専門知識ルートをご確認ください。" };
        return { met: false, reason: "個人の特定投資家（プロ）要件（投資性金融資産1億円以上かつ取引契約1年以上、または専門知識要件＋取引契約1年以上）を満たしていません。" };
      }
      return { met: false, reason: "区分が未選択です。" };
    }
    case "ama": {
      const t = answers["q_type"];
      if (t === "個人") {
        const asset = answers["q_ind_asset"] === "はい";
        const exp = answers["q_ind_exp"] && answers["q_ind_exp"] !== "いずれも該当しない";
        const apply = answers["q_ind_apply"] === "申出済み・予定あり";
        if (asset && exp && apply) return { met: true, reason: "投資性金融資産1億円以上かつ取引契約1年以上の要件を満たし、金融機関への申出により特定投資家として扱われます（金商法34条の4）。申出した金融機関との取引においてのみ有効です。" };
        if (!asset) return { met: false, reason: "投資性金融資産1億円以上の要件を満たしていません。" };
        if (!exp) return { met: false, reason: "申出先業者との取引契約1年以上継続の要件を満たしていません。" };
        return { met: false, reason: "取引金融機関への申出が必要です。" };
      } else if (t === "法人") {
        const asset = answers["q_corp_asset"] === "はい";
        const apply = answers["q_corp_apply"] === "申出済み・予定あり";
        if (asset && apply) return { met: true, reason: "資本金または純資産5,000万円以上の法人として申出により特定投資家に移行できます（金商法34条の4）。" };
        if (!asset) return { met: false, reason: "資本金または純資産5,000万円以上の要件を満たしていません。" };
        return { met: false, reason: "取引金融機関への申出が必要です。" };
      }
      return { met: false, reason: "区分が未選択です。" };
    }
    default: return { met: false, reason: "" };
  }
}

function evalSG(entityType, answers) {
  if (entityType === "個人") {
    const finMet = answers["sg_fin"] && answers["sg_fin"] !== "いずれも満たしていない";
    const optIn = answers["sg_optin"] === "同意する";
    if (finMet && optIn) return { met: true, reason: `財務要件（${answers["sg_fin"]}）およびオプトイン要件を満たしています（SFA Section 4A）。` };
    if (!finMet) return { met: false, reason: "財務要件を満たしていません。" };
    return { met: false, reason: "2018年SFA改正により、本人のオプトインへの積極的な同意が必須です。" };
  } else {
    const t = answers["sg_corp_type"];
    const optIn = answers["sg_optin"] === "同意する";
    if (t === "通常の法人") {
      const met = answers["sg_corp_asset"] === "はい" || answers["sg_corp_ai"] === "はい";
      if (met && optIn) return { met: true, reason: answers["sg_corp_asset"] === "はい" ? "純資産SGD 1,000万超の法人としてAI要件を満たします。" : "AIのみが出資する法人としてAI要件を満たします。" };
      if (!met) return { met: false, reason: "法人のAI要件を満たしていません。" };
      return { met: false, reason: "オプトインへの同意が必要です。" };
    } else if (t === "個人資産管理会社（Family Investment Vehicle）") {
      const sh = answers["sg_fiv1"] === "はい" || answers["sg_fiv2"] === "はい" || answers["sg_fiv3"] === "はい";
      if (sh && optIn) return { met: true, reason: "株主個人がAI財務要件を満たす個人資産管理会社として適格です。" };
      if (!sh) return { met: false, reason: "株主個人がAIの財務要件を満たしていません。" };
      return { met: false, reason: "オプトインへの同意が必要です。" };
    }
    return { met: false, reason: "法人種別が未選択です。" };
  }
}

async function askAI(question, context) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: `あなたはFGCの投資家適格性審査を支援するAIアシスタントです。日本の金商法（第34条の4、第63条、施行令15条の31）およびシンガポールSFA Section 4Aに精通しています。現在のコンテキスト: ${context}。日本語で簡潔かつ正確に、条文根拠付きで回答してください。`, messages: [{ role: "user", content: question }] }),
  });
  const d = await res.json();
  return d.content?.map(b => b.text || "").join("") || "回答を取得できませんでした。";
}

// ─── Components ───────────────────────────────────────────────────────────────
function NavTab({ label, active, onClick }) {
  return <button onClick={onClick} style={{ padding: "8px 14px", fontSize: 13, fontWeight: active ? 700 : 500, borderRadius: 8, border: "none", background: active ? "#fff" : "transparent", color: active ? "#1e293b" : "#94a3b8", cursor: "pointer", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.12)" : "none" }}>{label}</button>;
}
function ResultBadge({ met }) {
  if (met === true) return <span style={s.tag(C.green, C.greenBg, C.greenBorder)}>✅ 適格</span>;
  if (met === false) return <span style={s.tag(C.red, C.redBg, C.redBorder)}>❌ 非適格</span>;
  return <span style={s.tag(C.amber, C.amberBg, C.amberBorder)}>⚠ 要申請</span>;
}
function ChoiceBtn({ label, selected, onClick }) {
  return <button onClick={onClick} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", marginBottom: 6, fontSize: 13, borderRadius: 8, border: selected ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`, background: selected ? C.blueBg : C.card, color: selected ? C.blue : C.text, cursor: "pointer", fontWeight: selected ? 600 : 400 }}>{label}</button>;
}
function Divider() { return <div style={{ borderTop: `1px solid ${C.border}`, margin: "16px 0" }} />; }

function DraftBanner({ record, currentUser, admin, onResume, onView }) {
  const isOwner = record.checkedBy === currentUser;
  const canEdit = isOwner || admin;
  return (
    <div style={{ ...s.card, background: C.amberBg, border: `1px solid ${C.amberBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.amber }}>📝 下書き — {record.investorName}</div>
        <div style={{ fontSize: 12, color: C.amber, marginTop: 2 }}>担当：{record.checkedBy} · {new Date(record.updatedAt).toLocaleString("ja-JP")}</div>
        {!canEdit && <div style={{ fontSize: 12, color: C.red, marginTop: 2 }}>⚠ 編集は担当者（{record.checkedBy}）のみ可能です</div>}
        {admin && !isOwner && <div style={{ fontSize: 12, color: "#b45309", marginTop: 2 }}>👑 Admin権限で編集可能</div>}
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {canEdit && <button onClick={() => onResume(record)} style={{ ...s.btn, background: C.amber, color: "#fff", border: "none", fontSize: 12, padding: "6px 12px" }}>編集再開</button>}
        <button onClick={() => onView(record)} style={{ ...s.btn, fontSize: 12, padding: "6px 12px" }}>表示</button>
      </div>
    </div>
  );
}

// ─── Check Page ───────────────────────────────────────────────────────────────
function CheckPage({ onSave, currentUser, admin, draftRecords, onResumeDraft, onViewDraft }) {
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
    addAudit(`下書き保存（フェーズ：${phase}）`);
    onSave(buildRecord("draft"));
    setSaveMsg("下書き保存しました");
    setTimeout(() => setSaveMsg(""), 2500);
  }

  function goBack() {
    const prev = prevPhase(phase);
    if (prev) setPhase(prev);
  }

  function startCheck() {
    if (!investorName.trim()) return;
    addAudit(`審査開始：${investorName}（担当：${currentUser}）`);
    setPhase("jp_cat");
  }

  function selectJPCat(cat) {
    setJpCat(cat); setJpAnswers({});
    addAudit(`日本区分選択：${JP_CATEGORIES.find(c => c.id === cat)?.label}`);
    setPhase("jp_q");
  }

  function finishJP() {
    const r = evalJP(jpCat, jpAnswers);
    setJpResult(r);
    addAudit(`日本審査完了：${r.met === true ? "適格" : r.met === null ? "要申請" : "非適格"}`);
    setPhase("sg_type");
  }

  function selectSGType(t) {
    setSgEntityType(t); setSgAnswers({});
    addAudit(`SG区分選択：${t}`);
    setPhase("sg_q");
  }

  function finishSG() {
    const r = evalSG(sgEntityType, sgAnswers);
    setSgResult(r);
    addAudit(`SG審査完了：${r.met === true ? "適格" : "非適格"}`);
    setPhase("result");
  }

  function finalSave() {
    addAudit("最終保存");
    onSave(buildRecord("complete"));
  }

  function reset() {
    setPhase("start"); setInvestorName(""); setJpCat(null);
    setJpAnswers({}); setSgEntityType(null); setSgAnswers({});
    setJpResult(null); setSgResult(null); auditRef.current = [];
  }

  const jpCatInfo = JP_CATEGORIES.find(c => c.id === jpCat);
  const overall = jpResult?.met === true && sgResult?.met === true;

  function getJPQuestions() {
    const qs = JP_QUESTIONS[jpCat] || [];
    if (jpCat !== "pro" && jpCat !== "ama") return qs;
    const type = jpAnswers["q_type"];
    if (!type) return qs.filter(q => !q.forType);
    return qs.filter(q => !q.forType || q.forType === type);
  }
  function getSGQuestions() {
    const qs = SG_QUESTIONS[sgEntityType === "個人" ? "individual" : "corporation"] || [];
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
              <button onClick={goBack} style={{ fontSize: 12, background: "none", border: "none", cursor: "pointer", color: C.sub, padding: 0, marginBottom: 6, display: "block" }}>← 前のページへ戻る</button>
            )}
            <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>{subtitle}</div>}
          </div>
          {showSave && phase !== "start" && phase !== "result" && (
            <button onClick={saveDraft} style={s.btnSave}>💾 下書き保存</button>
          )}
        </div>
        {saveMsg && <div style={{ marginTop: 8, fontSize: 12, color: C.green, fontWeight: 600 }}>✅ {saveMsg}</div>}
      </div>
    );
  }

  return (
    <div style={{ padding: "16px" }}>
      {/* Draft records for this user */}
      {draftRecords.length > 0 && phase === "start" && (
        <div style={{ marginBottom: 12 }}>
          <div style={s.sectionTitle}>未完了の下書き</div>
          {draftRecords.map(r => <DraftBanner key={r.id} record={r} currentUser={currentUser} admin={admin} onResume={onResumeDraft} onView={onViewDraft} />)}
        </div>
      )}

      {phase === "start" && (
        <>
          <TopBar title="✅ 適格性審査チェック" subtitle="STEP 1：日本（金商法63条）→ STEP 2：シンガポール（SFA Section 4A）" showBack={false} showSave={false} />
          <div style={s.card}>
            <div style={s.sectionTitle}>投資家情報</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ ...s.label, marginBottom: 6, fontWeight: 500 }}>投資家名 / 法人名 <span style={{ color: C.red }}>*</span></div>
              <input value={investorName} onChange={e => setInvestorName(e.target.value)} placeholder="例：山田太郎 / 株式会社〇〇"
                style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", fontSize: 14, borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "system-ui,sans-serif" }} />
            </div>
            <div>
              <div style={{ ...s.label, marginBottom: 4, fontWeight: 500 }}>担当FGCメンバー</div>
              <div style={{ padding: "8px 12px", background: C.greenBg, borderRadius: 8, fontSize: 14, color: C.green, fontWeight: 600 }}>🔐 {currentUser}</div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 4 }}>Microsoft 365 SSOより自動入力</div>
            </div>
          </div>
          <button onClick={startCheck} disabled={!investorName.trim()} style={{ ...s.btnPrimary, opacity: !investorName.trim() ? 0.5 : 1 }}>審査を開始する →</button>
        </>
      )}

      {phase === "jp_cat" && (
        <>
          <TopBar title="🇯🇵 STEP 1 — 日本の適格区分を選択" subtitle={`審査対象：${investorName}`} />
          {JP_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => selectJPCat(cat.id)} style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%", textAlign: "left", padding: "14px", marginBottom: 8, borderRadius: 10, border: `1px solid ${cat.border}`, background: cat.bg, cursor: "pointer" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{cat.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: cat.color }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{cat.labelEn}</div>
              </div>
            </button>
          ))}
        </>
      )}

      {phase === "jp_q" && jpCatInfo && (
        <>
          <TopBar title={`${jpCatInfo.icon} ${jpCatInfo.label}`} subtitle={`審査対象：${investorName}`} />
          {getJPQuestions().map((q, i) => (
            <div key={q.id} style={{ ...s.card, marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: q.hint ? 4 : 10 }}>{i + 1}. {q.text}</div>
              {q.hint && <div style={{ fontSize: 12, padding: "6px 10px", background: C.amberBg, borderRadius: 6, color: C.amber, marginBottom: 10, lineHeight: 1.6 }}>💡 {q.hint}</div>}
              {q.options.map(opt => <ChoiceBtn key={opt} label={opt} selected={jpAnswers[q.id] === opt} onClick={() => setJpAnswers(a => ({ ...a, [q.id]: opt }))} />)}
            </div>
          ))}
          <button onClick={finishJP} style={s.btnPrimary}>日本審査を確定 → SG審査へ</button>
        </>
      )}

      {phase === "sg_type" && (
        <>
          <TopBar title="🇸🇬 STEP 2 — Singapore Accredited Investor" subtitle="日本審査完了 ✅ → SG区分を選択" />
          <div style={s.card}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>投資家の区分を選択してください</div>
            {["個人", "法人"].map(t => (
              <button key={t} onClick={() => selectSGType(t)} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 14px", marginBottom: 8, fontSize: 14, fontWeight: 600, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.text, cursor: "pointer" }}>
                {t === "個人" ? "👤 個人" : "🏢 法人（通常法人・個人資産管理会社）"}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "sg_q" && (
        <>
          <TopBar title={`🇸🇬 SG Accredited Investor（${sgEntityType}）`} />
          {getSGQuestions().map((q, i) => (
            <div key={q.id} style={{ ...s.card, marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: q.hint ? 4 : 10 }}>{i + 1}. {q.text}</div>
              {q.hint && <div style={{ fontSize: 12, padding: "6px 10px", background: C.amberBg, borderRadius: 6, color: C.amber, marginBottom: 10, lineHeight: 1.6 }}>💡 {q.hint}</div>}
              {q.options.map(opt => <ChoiceBtn key={opt} label={opt} selected={sgAnswers[q.id] === opt} onClick={() => setSgAnswers(a => ({ ...a, [q.id]: opt }))} />)}
            </div>
          ))}
          <button onClick={finishSG} style={s.btnPrimary}>SG審査を確定 → 結果へ</button>
        </>
      )}

      {phase === "result" && (
        <>
          <div style={{ ...s.card, background: overall ? C.greenBg : C.redBg, border: `1px solid ${overall ? C.greenBorder : C.redBorder}`, textAlign: "center", marginBottom: 12 }}>
            <button onClick={goBack} style={{ display: "block", fontSize: 12, background: "none", border: "none", cursor: "pointer", color: overall ? C.green : C.red, padding: 0, marginBottom: 8 }}>← 前のページへ戻る</button>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{overall ? "✅" : "❌"}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: overall ? C.green : C.red }}>{overall ? "適格投資家として承認" : "適格投資家として非承認"}</div>
            <div style={{ fontSize: 14, color: overall ? C.green : C.red, marginTop: 4, fontWeight: 600 }}>{investorName}</div>
          </div>
          <div style={s.card}>
            <div style={s.sectionTitle}>審査結果詳細</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>🇯🇵 日本 — {jpCatInfo?.label}</span>
                <ResultBadge met={jpResult?.met} />
              </div>
              <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.7 }}>{jpResult?.reason}</div>
            </div>
            <Divider />
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>🇸🇬 Singapore — AI（{sgEntityType}）</span>
                <ResultBadge met={sgResult?.met} />
              </div>
              <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.7 }}>{sgResult?.reason}</div>
            </div>
          </div>

          {auditRef.current.length > 0 && (
            <div style={s.card}>
              <div style={s.sectionTitle}>監査証跡</div>
              {auditRef.current.map((e, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: C.faint, whiteSpace: "nowrap", flexShrink: 0 }}>{new Date(e.at).toLocaleTimeString("ja-JP")}</span>
                  <span style={{ fontSize: 12, lineHeight: 1.5 }}>{e.msg}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={finalSave} style={{ ...s.btnPrimary, flex: 1 }}>💾 最終保存</button>
            <button onClick={reset} style={{ ...s.btn, flex: 1 }}>新規審査</button>
          </div>
          <div style={{ ...s.card, background: C.amberBg, fontSize: 12, color: C.amber, lineHeight: 1.6 }}>
            <strong>免責事項：</strong>本ツールは情報提供のみを目的としており、法的アドバイスではありません。最終判断は必ず資格を有する法律の専門家にご確認ください。
          </div>
        </>
      )}
    </div>
  );
}

// ─── Records Page ─────────────────────────────────────────────────────────────
function RecordsPage({ records, currentUser, admin }) {
  const [open, setOpen] = useState(null);
  const visible = admin ? records : records.filter(r => r.checkedBy === currentUser);
  const complete = visible.filter(r => r.status === "complete");
  const drafts = visible.filter(r => r.status === "draft");

  function RecordCard({ r }) {
    const isOwner = r.checkedBy === currentUser;
    const canEdit = isOwner || admin;
    return (
      <div style={{ ...s.card, marginBottom: 8, border: r.status === "draft" ? `1px solid ${C.amberBorder}` : `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{r.investorName}</span>
              {r.status === "draft"
                ? <span style={s.tag(C.amber, C.amberBg, C.amberBorder)}>📝 下書き{!canEdit ? "（閲覧のみ）" : ""}</span>
                : <span style={s.tag(r.overall ? C.green : C.red, r.overall ? C.greenBg : C.redBg, r.overall ? C.greenBorder : C.redBorder)}>{r.overall ? "✅ 適格" : "❌ 非適格"}</span>
              }
            </div>
            <div style={{ fontSize: 12, color: C.sub }}>
              担当：{r.checkedBy} · {new Date(r.updatedAt).toLocaleDateString("ja-JP")}
              {r.jpCat && ` · 🇯🇵 ${JP_CATEGORIES.find(c => c.id === r.jpCat)?.label || r.jpCat}`}
              {r.sgEntityType && ` · 🇸🇬 ${r.sgEntityType}`}
            </div>
          </div>
          <button onClick={() => setOpen(open === r.id ? null : r.id)} style={{ ...s.btn, padding: "4px 10px", fontSize: 12 }}>{open === r.id ? "閉じる" : "詳細"}</button>
        </div>

        {open === r.id && (
          <div style={{ marginTop: 12 }}>
            <Divider />
            {r.jpResult && <div style={{ fontSize: 13, marginBottom: 6, lineHeight: 1.6 }}><strong>日本：</strong>{r.jpResult.reason}</div>}
            {r.sgResult && <div style={{ fontSize: 13, marginBottom: 10, lineHeight: 1.6 }}><strong>SG：</strong>{r.sgResult.reason}</div>}
            {r.auditLog?.length > 0 && <>
              <div style={s.sectionTitle}>監査証跡</div>
              {r.auditLog.map((e, i) => <div key={i} style={{ fontSize: 12, color: C.sub, marginBottom: 3 }}>{new Date(e.at).toLocaleString("ja-JP")} — {e.msg}</div>)}
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
        <div style={{ fontWeight: 600, marginBottom: 6 }}>記録なし</div>
        <div style={{ fontSize: 13, color: C.sub }}>審査を完了して保存すると、ここに表示されます。</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 16 }}>
      <div style={{ ...s.card, background: "#1e293b", color: "#fff", marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>
          📋 審査記録 — {visible.length}件（完了：{complete.length} / 下書き：{drafts.length}）
          {admin && <span style={{ fontSize: 11, color: "#f59e0b", marginLeft: 8, fontWeight: 600 }}>👑 Admin — 全メンバーの記録を表示中</span>}
        </div>
      </div>
      {drafts.length > 0 && <>
        <div style={s.sectionTitle}>📝 下書き</div>
        {drafts.map(r => <RecordCard key={r.id} r={r} />)}
        <Divider />
      </>}
      {complete.length > 0 && <>
        <div style={s.sectionTitle}>✅ 完了済み</div>
        {complete.map(r => <RecordCard key={r.id} r={r} />)}
      </>}
    </div>
  );
}

// ─── Ref Page ─────────────────────────────────────────────────────────────────
function RefPage() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ padding: "16px" }}>
      <div style={{ ...s.card, background: "#1e293b", color: "#fff", marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>📚 適格投資家基準 参照ページ</div>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>日本（金商法）およびシンガポール（SFA）の現行最新基準 — 法令根拠付き</div>
      </div>
      <div style={{ ...s.card, background: C.amberBg, border: `1px solid ${C.amberBorder}`, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.amber, marginBottom: 6 }}>⚠ 重要：よくある誤りについて</div>
        <div style={{ fontSize: 12, color: C.amber, lineHeight: 1.8 }}>
          ・特定投資家（アマ→プロ）個人要件は「<strong>投資性金融資産1億円以上</strong>」です。「純金融資産3億円」は誤りです。<br />
          ・特定投資家（プロ）法人要件は2016年3月改正により「<strong>資本金または純資産5,000万円以上</strong>」に緩和（旧：5億円）。<br />
          ・経験要件の「口座」は<strong>第一種業者に限定されません</strong>。施行令15条の31第1項イは業者種別を区別しません。<br />
          ・SFAオプトインは2018年改正により<strong>積極的な選択が法的に必須</strong>です。<br />
          ・SFA上の「Expert Investor」は、資本市場商品の売買・保有を<strong>業とする者</strong>のみが該当し、GPスタッフ個人が知識経験のみで得られる区分ではありません。
        </div>
      </div>

      <div style={{ ...s.card, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🇯🇵 日本 — 金商法63条（適格機関投資家等特例業務）</div>
        {REF_JP.map((r, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <button onClick={() => setOpen(open === `jp${i}` ? null : `jp${i}`)} style={{ width: "100%", textAlign: "left", padding: "9px 12px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: `1px solid ${C.border}`, background: open === `jp${i}` ? "#f1f5f9" : C.card, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><span>{r.cat}</span><span style={{ fontSize: 11, color: C.faint, marginLeft: 8 }}>{r.law}</span></div>
              <span style={{ color: C.sub, flexShrink: 0 }}>{open === `jp${i}` ? "▲" : "▼"}</span>
            </button>
            {open === `jp${i}` && <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "0 0 8px 8px", border: `1px solid ${C.border}`, borderTop: "none" }}>
              {r.items.map((it, j) => <div key={j} style={{ fontSize: 13, padding: "3px 0", display: "flex", gap: 8 }}><span style={{ color: C.blue, flexShrink: 0 }}>•</span>{it}</div>)}
            </div>}
          </div>
        ))}
      </div>
      <div style={{ ...s.card, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🇸🇬 シンガポール — SFA Section 4A（Accredited Investor）</div>
        {REF_SG.map((r, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <button onClick={() => setOpen(open === `sg${i}` ? null : `sg${i}`)} style={{ width: "100%", textAlign: "left", padding: "9px 12px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: `1px solid ${C.border}`, background: open === `sg${i}` ? "#f1f5f9" : C.card, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><span>{r.cat}</span><span style={{ fontSize: 11, color: C.faint, marginLeft: 8 }}>{r.law}</span></div>
              <span style={{ color: C.sub, flexShrink: 0 }}>{open === `sg${i}` ? "▲" : "▼"}</span>
            </button>
            {open === `sg${i}` && <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "0 0 8px 8px", border: `1px solid ${C.border}`, borderTop: "none" }}>
              {r.items.map((it, j) => <div key={j} style={{ fontSize: 13, padding: "3px 0", display: "flex", gap: 8 }}><span style={{ color: "#059669", flexShrink: 0 }}>•</span>{it}</div>)}
            </div>}
          </div>
        ))}
      </div>

      <div style={{ ...s.card, border: `1px solid ${C.blueBorder}`, background: C.blueBg }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>🇸🇬 SFA第305条(5) — "Relevant Persons"（募集規制の適用除外）</div>
        <div style={{ fontSize: 11, color: C.sub, marginBottom: 10 }}>Securities and Futures Act, Section 305(5) — Restricted Scheme 向け適用除外</div>
        <div style={{ fontSize: 12, color: C.text, lineHeight: 1.8, marginBottom: 10 }}>
          限定スキーム（Restricted Scheme）としてファンド持分を募集する場合、AI要件（資産・収入基準）を満たさない者であっても、以下の「relevant person」に該当すれば、目論見書登録義務の適用除外を受けて募集できます。<strong>これは投資家区分（AI/Expert Investor）とは別の、募集規制側の適用除外</strong>です。
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>該当する者（いずれか）</div>
        {[
          "Accredited Investor（個人・法人）",
          "唯一の事業が投資保有であり、全株式をAI個人が保有する法人",
          "受益者全員がAI個人である信託の受託者",
          "募集者（法人）の役員またはこれに準ずる者 — 例：GP／運用会社の役員・パートナー — およびその配偶者・親・兄弟姉妹・子",
          "募集者（個人）本人の配偶者・親・兄弟姉妹・子",
        ].map((it, j) => (
          <div key={j} style={{ fontSize: 13, padding: "3px 0", display: "flex", gap: 8 }}><span style={{ color: C.blue, flexShrink: 0 }}>•</span>{it}</div>
        ))}
        <div style={{ fontSize: 11, color: C.sub, marginTop: 10, lineHeight: 1.7 }}>
          ※ 限定スキームとしてMASリストに掲載するには、要点情報を含む情報メモランダムの添付、運用者の適格性（fit and proper）、CISNetへの事前届出・年次申告が条件となります。GP／投資担当者の自社ファンド出資は、通常この条項（募集者の役員等）を根拠に整理されます。詳細はLegal/Complianceにご確認ください。
        </div>
      </div>
    </div>
  );
}

// ─── AI Page ──────────────────────────────────────────────────────────────────
function AIPage({ context }) {
  const [q, setQ] = useState("");
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  async function send() {
    if (!q.trim()) return;
    const question = q.trim(); setQ(""); setLoading(true);
    setLog(l => [...l, { role: "user", text: question }]);
    const ans = await askAI(question, context);
    setLog(l => [...l, { role: "ai", text: ans }]);
    setLoading(false);
  }
  return (
    <div style={{ padding: "16px" }}>
      <div style={{ ...s.card, background: "#1e293b", color: "#fff", marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>🤖 AI質疑応答</div>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>適格性要件・法令解釈に関する疑問を質問できます。条文根拠付きで回答します。</div>
      </div>
      <div style={{ ...s.card, minHeight: 200, marginBottom: 12 }}>
        {log.length === 0 && <div style={{ fontSize: 13, color: C.faint, textAlign: "center", marginTop: 40 }}>質問を入力してください<br /><span style={{ fontSize: 12 }}>例：LP出資契約は経験要件を満たしますか？</span></div>}
        {log.map((m, i) => (
          <div key={i} style={{ marginBottom: 12, display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "85%", padding: "8px 12px", borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: m.role === "user" ? "#1e293b" : "#f1f5f9", color: m.role === "user" ? "#fff" : C.text, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div style={{ fontSize: 13, color: C.sub, padding: 8 }}>AIが回答を生成中...</div>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <textarea value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="質問を入力（Enterで送信）" rows={2}
          style={{ flex: 1, padding: "8px 10px", fontSize: 13, borderRadius: 8, border: `1px solid ${C.border}`, resize: "none", fontFamily: "system-ui,sans-serif" }} />
        <button onClick={send} disabled={!q.trim() || loading} style={{ ...s.btn, background: "#1e293b", color: "#fff", border: "none", padding: "0 16px", opacity: !q.trim() || loading ? 0.5 : 1 }}>送信</button>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const user = useUser();
  const currentUser = user?.name || user?.givenName || user?.email || "FGCメンバー";
  const admin = isAdmin(user);
  const [tab, setTab] = useState("check");
  const [records, setRecords] = useState([]);
  const [lastContext, setLastContext] = useState("審査未開始");

  function saveRecord(rec) {
    setRecords(r => {
      const exists = r.find(x => x.id === rec.id);
      return exists ? r.map(x => x.id === rec.id ? rec : x) : [rec, ...r];
    });
    setLastContext(`${rec.investorName} — 日本：${JP_CATEGORIES.find(c => c.id === rec.jpCat)?.label || ""}、SG：${rec.sgEntityType || ""}、結果：${rec.overall ? "適格" : "未確定"}`);
  }

  const draftRecords = records.filter(r => r.status === "draft");

  function resumeDraft(rec) {
    setTab("check");
  }

  const tabs = [
    { id: "check", label: "✅ 審査" },
    { id: "records", label: `📋 記録${records.length > 0 ? `（${records.length}）` : ""}` },
    { id: "ref", label: "📚 基準" },
    { id: "ai", label: "🤖 AI質問" },
  ];

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>FGC 投資家適格性審査</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>🇯🇵 金商法63条 × 🇸🇬 SFA Section 4A — FGCメンバー限定</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>🔐 {currentUser}</div>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>v1.3 SFA relevant persons追記</div>
        </div>
      </div>
      <div style={{ background: "#1e293b", padding: "4px 12px 0", display: "flex", gap: 4 }}>
        {tabs.map(t => <NavTab key={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />)}
      </div>
      {tab === "check" && <CheckPage onSave={saveRecord} currentUser={currentUser} admin={admin} draftRecords={draftRecords} onResumeDraft={resumeDraft} onViewDraft={() => setTab("records")} />}
      {tab === "records" && <RecordsPage records={records} currentUser={currentUser} admin={admin} />}
      {tab === "ref" && <RefPage />}
      {tab === "ai" && <AIPage context={lastContext} />}
    </div>
  );
}
