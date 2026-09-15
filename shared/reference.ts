// Authoritative reference content for the qualification criteria.
//
// Rendered by the Criteria tab. Kept as its own module rather than inline in a
// component: one copy of the legal thresholds, so they cannot drift apart, and
// a drifted copy of a compliance threshold is worse than no copy.
//
// Statutory citations are reproduced verbatim in both languages; the EN variant
// only appends a gloss. Do not paraphrase a citation.

export const R = (ja: string, en: string) => ({ ja, en });

export const REF_JP = [
  {
    cat: R("① 適格機関投資家（QII）", "① Qualified Institutional Investor (QII)"),
    law: R("金商法2条3項14号・府令10条", "金商法2条3項14号・府令10条 (FIEA art. 2(3)(xiv); Cabinet Office Ordinance art. 10)"),
    items: [
      R("第一種・第二種金融商品取引業者（登録業者）", "Type I / Type II Financial Instruments Business Operators (registered)"),
      R("銀行・信託銀行・協同組織金融機関", "Banks, trust banks and cooperative financial institutions"),
      R("保険会社", "Insurance companies"),
      R("投資法人（J-REIT等）", "Investment corporations (e.g. J-REITs)"),
      R("企業年金・確定拠出年金基金", "Corporate pension funds and defined-contribution pension funds"),
      R("国・地方公共団体", "The national government and local public entities"),
      R("外国の同種機関（上記に相当するもの）", "Foreign institutions equivalent to the above"),
      R("※ 金融庁への届出・登録が前提", "Note: notification to / registration with the FSA is a prerequisite"),
    ],
  },
  {
    cat: R("② 自動的適格機関投資家", "② Automatic QII"),
    law: R("金商法施行令1条の8の6第1項", "金商法施行令1条の8の6第1項 (FIEA Enforcement Order art. 1-8-6(1))"),
    items: [
      R("国内金融商品取引所に上場している株式会社", "Stock companies listed on a Japanese financial instruments exchange"),
      R("資本金または純資産が5億円以上の株式会社", "Stock companies with stated capital or net assets of JPY 500 million or more"),
    ],
  },
  {
    cat: R("③ 申請型適格機関投資家", "③ Application-type QII"),
    law: R("金商法63条の4", "金商法63条の4 (FIEA art. 63-4)"),
    items: [
      R("純資産10億円以上の法人", "Entities with net assets of JPY 1 billion or more"),
      R("金融庁への申請・審査・登録が必要", "Application to, review by and registration with the FSA are required"),
      R("登録後、金融庁の適格機関投資家等登録名簿に掲載", "Once registered, the entity is listed on the FSA's register of QIIs, etc."),
    ],
  },
  {
    cat: R("④ 特定投資家（プロ）— 法人", "④ Specified Investor (Pro) — corporate"),
    law: R("金商法2条31項・施行令1条の8の6（2016年3月改正）", "金商法2条31項・施行令1条の8の6 (FIEA art. 2(31); Enforcement Order art. 1-8-6, as amended March 2016)"),
    items: [
      R("上場会社（国内金融商品取引所上場）", "Listed companies (listed on a Japanese financial instruments exchange)"),
      R("資本金または純資産が5,000万円以上の法人（2016年3月改正）", "Entities with stated capital or net assets of JPY 50 million or more (March 2016 amendment)"),
      R("外国法人", "Foreign corporations"),
      R("国・地方公共団体", "The national government and local public entities"),
    ],
  },
  {
    cat: R("④ 特定投資家（プロ）— 個人", "④ Specified Investor (Pro) — individual"),
    law: R("金商法34条の4・施行令15条の31", "金商法34条の4・施行令15条の31 (FIEA art. 34-4; Enforcement Order art. 15-31)"),
    items: [
      R("【資産要件】投資性金融資産（有価証券・デリバティブ等）が1億円以上", "[Asset test] Investment-type financial assets (securities, derivatives, etc.) of JPY 100 million or more"),
      R("【経験要件】申出先の金融商品取引業者等との間で有価証券またはデリバティブ取引に係る契約を1年以上継続（施行令15条の31第1項イ）", "[Experience test] A contract relating to securities or derivatives transactions maintained for at least one year with the financial instruments business operator to which the request is made (Enforcement Order art. 15-31(1)(a))"),
      R("※ 第一種・第二種業者の区別なし。条文は「当該金融商品取引業者等との間で」と規定するのみ", "Note: no distinction is drawn between Type I and Type II operators; the provision refers only to \"with that financial instruments business operator, etc.\""),
      R("─── 経験要件：契約の範囲（条文解釈）───", "─── Experience test: scope of qualifying contracts (statutory interpretation) ───"),
      R("【①】証券会社（第一種業者）との取引契約1年以上継続", "[1] A transaction contract with a securities company (Type I operator) maintained for at least one year"),
      R("【②】VC/PEファンド運用会社（第二種業者・投資運用業者）との取引契約1年以上継続", "[2] A transaction contract with a VC/PE fund manager (Type II operator / investment manager) maintained for at least one year"),
      R("【③】LP出資契約・ファンド持分取得（金商法2条2項5号の有価証券）を1年以上継続保有", "[3] An LP commitment or fund interest (securities under FIEA art. 2(2)(v)) held continuously for at least one year"),
      R("※ ①〜③いずれも施行令15条の31第1項イの「有価証券又はデリバティブ取引に係る契約」に該当しうる", "Note: each of [1]–[3] may constitute a \"contract relating to securities or derivatives transactions\" under Enforcement Order art. 15-31(1)(a)"),
      R("─── 専門知識・経験による資産要件の代替（いずれかで可）───", "─── Substituting expertise/experience for the asset test (any one suffices) ───"),
      R("【代替①】金融機関等（銀行・証券・保険）での投資業務経験1年以上", "[Alt 1] At least one year of investment work at a financial institution (bank, securities firm, insurer)"),
      R("【代替②】VC・PEファンド運用会社での業務経験1年以上", "[Alt 2] At least one year of work at a VC or PE fund management company"),
      R("【代替③】証券外務員・FP・CFA・CAIA等の投資関連専門資格保有", "[Alt 3] Holding an investment-related professional qualification (registered sales representative, FP, CFA, CAIA, etc.)"),
      R("【代替④】デリバティブ・FX・未公開株・ファンド持分等の特定商品取引経験", "[Alt 4] Trading experience in specified products such as derivatives, FX, unlisted shares or fund interests"),
      R("【代替⑤】上場会社のCxO（CEO・CFO等）または財務・投資担当役員", "[Alt 5] CxO of a listed company (CEO, CFO, etc.) or a director responsible for finance or investment"),
      R("【代替⑥】ベンチャー企業CxOとしてVC/PEからの資金調達・エクイティ取引に関与", "[Alt 6] As a CxO of a startup, involvement in VC/PE fundraising or equity transactions"),
      R("【代替⑦】投資委員会・ファイナンス委員会メンバーとして投資判断に関与", "[Alt 7] Involvement in investment decisions as a member of an investment or finance committee"),
      R("※ 代替⑤〜⑦は施行令上の明文規定ではなく実務上の解釈・運用によるものです", "Note: Alt 5–7 are not express provisions of the Enforcement Order; they reflect practical interpretation and market practice"),
    ],
  },
  {
    cat: R("⑤ 特定投資家（アマ→プロ移行）— 個人申出", "⑤ Specified Investor (Retail→Pro) — individual request"),
    law: R("金商法34条の4", "金商法34条の4 (FIEA art. 34-4)"),
    items: [
      R("【要件①】投資性金融資産が1億円以上（※「純金融資産3億円」は誤り）", "[Test 1] Investment-type financial assets of JPY 100 million or more (the often-cited \"JPY 300 million net financial assets\" figure is incorrect)"),
      R("【要件②】申出先業者との有価証券またはデリバティブ取引契約を1年以上継続", "[Test 2] A securities or derivatives transaction contract with the recipient operator maintained for at least one year"),
      R("→ 上記両方を満たした上で、取引金融機関に申出", "→ Both tests must be met, and a request is then filed with the financial institution"),
      R("→ 申出した金融機関との取引においてのみ特定投資家として扱われる", "→ Specified Investor treatment applies only to dealings with the institution to which the request was made"),
    ],
  },
  {
    cat: R("⑤ 特定投資家（アマ→プロ移行）— 法人申出", "⑤ Specified Investor (Retail→Pro) — corporate request"),
    law: R("金商法34条の4", "金商法34条の4 (FIEA art. 34-4)"),
    items: [
      R("資本金または純資産が5,000万円以上の法人が申出により移行", "An entity with stated capital or net assets of JPY 50 million or more may transition by filing a request"),
      R("申出した金融機関との取引においてのみ特定投資家として扱われる", "Specified Investor treatment applies only to dealings with the institution to which the request was made"),
    ],
  },
];

export const REF_SG = [
  {
    cat: R("個人（Accredited Investor）", "Individual (Accredited Investor)"),
    law: R("SFA Section 4A(1)(a)", "SFA Section 4A(1)(a)"),
    items: [
      R("以下いずれか一つを満たし、かつ本人のオプトインが必須", "Any one of the following must be met, and the individual must opt in"),
      R("【①】純資産SGD 200万超（主たる住居の算入上限はSGD 100万）", "[1] Net personal assets exceeding SGD 2 million (the primary residence counts up to SGD 1 million)"),
      R("【②】純金融資産SGD 100万超（預金・資本市場商品・生命保険等）", "[2] Net financial assets exceeding SGD 1 million (deposits, capital markets products, life policies, etc.)"),
      R("【③】直近12ヶ月の収入SGD 30万超", "[3] Income in the preceding 12 months exceeding SGD 300,000"),
      R("※ オプトインなし（黙示的同意）は認められない（2018年改正）", "Note: implied consent without an express opt-in is not permitted (2018 amendment)"),
    ],
  },
  {
    cat: R("法人（Accredited Investor）", "Corporation (Accredited Investor)"),
    law: R("SFA Section 4A(1)(a)(ii)", "SFA Section 4A(1)(a)(ii)"),
    items: [
      R("【①】純資産SGD 1,000万超（直近の監査済みバランスシート基準）", "[1] Net assets exceeding SGD 10 million (per the most recent audited balance sheet)"),
      R("【②】Accredited Investorのみが出資する法人", "[2] An entity all of whose equity holders are Accredited Investors"),
      R("【③】個人資産管理会社（Family Investment Vehicle / FIV）：株主個人がAI要件を満たす場合も可", "[3] A family investment vehicle (FIV): also eligible where the individual shareholder meets the AI tests"),
    ],
  },
];
