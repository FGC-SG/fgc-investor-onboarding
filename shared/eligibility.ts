// @ts-nocheck
/* eslint-disable */
// Eligibility determination — the regulated core of this tool.
//
// Extracted from App.tsx so it can be imported directly by tests rather than
// scraped out by line number, and so the logic that produces investor
// determinations lives in one auditable module separate from presentation.
//
// The cardinal rule: answers are language-independent KEYS. Logic compares
// against `.key` and never against a display label — translating a label must
// never be able to change an eligibility outcome. See shared/__test__/.
//
// (@ts-nocheck mirrors App.tsx's existing posture; drop it when typechecking is
// re-enabled project-wide.)

import { R } from "./reference";

export const O = (key, ja, en) => ({ key, ja, en });
export const YES_NO = () => [O("yes", "はい", "Yes"), O("no", "いいえ", "No")];

export const JP_QUESTIONS = {
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

export const SG_QUESTIONS = {
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
export function optOf(questions, qid, key) {
  const q = questions.find(x => x.id === qid);
  const o = q && q.options.find(op => op.key === key);
  return o || { key, ja: "", en: "" };
}

export function evalJP(cat, answers) {
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

export function evalSG(entityType, answers) {
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
