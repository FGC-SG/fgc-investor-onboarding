import React, { useState } from 'react'
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Info } from 'lucide-react'

type TransactionType = 'securities' | 'derivatives' | 'advisory' | 'discretionary'
type Route = 'inv_fin' | 'net_assets' | 'income' | 'expertise'
type SupplementStep = 'freq_3' | 'expertise_check' | 'inv_fin_and_net_3'
type ScreeningPhase =
  | 'trading_exp' | 'transaction_type' | 'route' | 'asset_amount'
  | 'supplement' | 'expertise_type' | 'basket_detail' | 'result'

interface ScreeningState {
  phase: ScreeningPhase
  tradingExp: boolean | null
  transactionType: TransactionType | null
  route: Route | null
  assetAmount: string | null
  supplementStep: SupplementStep | null
  pendingDetail: string
  expertiseKey: string | null
  result: { pass: boolean; detail: string } | null
}

const INITIAL_STATE: ScreeningState = {
  phase: 'trading_exp', tradingExp: null, transactionType: null, route: null,
  assetAmount: null, supplementStep: null, pendingDetail: '', expertiseKey: null, result: null,
}

const BASKET_EXAMPLES: Record<TransactionType, { id: string; label: string }[]> = {
  securities: [
    { id: 'listed_exec',  label: '上場会社等の役員・従業員として有価証券投資の意思決定に従事（1年以上）' },
    { id: 'startup_exec', label: 'スタートアップの役職員として有価証券投資の意思決定に従事（1年以上）' },
    { id: 'corp_finance', label: '企業財務・経営戦略策定等（有価証券関連）の業務経験（1年以上）' },
    { id: 'ma_ipo',       label: 'M&A・IPO業務において中核的な役割を担った経験（1年以上）' },
    { id: 'cpa_tax',      label: '公認会計士・税理士・資産形成コンサルタントとして従事（1年以上）' },
    { id: 'kaizen',       label: '認定経営革新等支援機関として従事（1年以上）' },
    { id: 'none',         label: 'いずれにも該当しない' },
  ],
  derivatives: [
    { id: 'fin_inst',  label: '金融機関等でデリバティブ取引の運用・リスク管理業務に従事（1年以上）' },
    { id: 'corp_hedge',label: '企業財務部門でヘッジ目的のデリバティブ取引業務に従事（1年以上）' },
    { id: 'cfa_frm',   label: 'CFA・FRM等のデリバティブ関連資格保有者（実務1年以上）' },
    { id: 'none',      label: 'いずれにも該当しない' },
  ],
  advisory: [
    { id: 'advisor',     label: '投資顧問業務（助言業）に従事した経験（1年以上）' },
    { id: 'wealth',      label: 'ウェルスマネジメント・プライベートバンキング業務経験（1年以上）' },
    { id: 'fp_advisory', label: 'FP・資産形成コンサルタントとして投資助言業務に従事（1年以上）' },
    { id: 'none',        label: 'いずれにも該当しない' },
  ],
  discretionary: [
    { id: 'fund_mgr',     label: 'ファンドマネージャー・投資一任業務に従事した経験（1年以上）' },
    { id: 'am_ops',       label: '資産運用会社の運用・コンプライアンス等コア業務に従事（1年以上）' },
    { id: 'family_office',label: 'ファミリーオフィス・エンダウメント等での資産管理業務経験（1年以上）' },
    { id: 'none',         label: 'いずれにも該当しない' },
  ],
}

const EXPERTISE_OPTIONS = [
  { value: 'finance_work',       label: '金融業に係る業務に従事（1年以上実務）' },
  { value: 'professor',          label: '経済学・経営学の教授・准教授等' },
  { value: 'securities_analyst', label: '証券アナリスト（CMA等）' },
  { value: 'securities_rep',     label: '証券外務員（1種・2種）' },
  { value: 'fp',                 label: 'FP技能士（1級・2級）' },
  { value: 'sme_consultant',     label: '中小企業診断士' },
  { value: 'listed_officer',     label: '有価証券報告書提出会社（上場会社等）の役員 ★2024年12月追加' },
  { value: 'ma_ipo',             label: 'M&A・IPOの業務経験者（中核的役割）★2024年12月追加' },
  { value: 'cpa',                label: '公認会計士' },
  { value: 'tax_accountant',     label: '税理士' },
  { value: 'asset_consultant',   label: '資産形成コンサルタント' },
  { value: 'basket',             label: '経営コンサルタント等（バスケット条項）→ 4類型別に詳細判定' },
  { value: 'none',               label: 'いずれにも該当しない' },
]

function StepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white space-y-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
      {children}
    </div>
  )
}

function YNButtons({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <div className="flex gap-3 pt-1">
      <button onClick={onYes}
        className="px-6 py-2 text-sm rounded-md border border-gray-300 hover:bg-fgc-navy hover:text-white hover:border-fgc-navy transition-colors">
        はい
      </button>
      <button onClick={onNo}
        className="px-6 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 transition-colors">
        いいえ
      </button>
    </div>
  )
}

function ChoiceList({ items, onSelect }: {
  items: { value: string; label: string }[]
  onSelect: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      {items.map(item => (
        <button key={item.value} onClick={() => onSelect(item.value)}
          className="w-full text-left px-4 py-2.5 text-sm rounded-md border border-gray-200 hover:border-fgc-navy hover:bg-blue-50 transition-colors flex items-center justify-between group">
          <span className="text-gray-700 group-hover:text-fgc-navy">{item.label}</span>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-fgc-navy flex-shrink-0" />
        </button>
      ))}
    </div>
  )
}

function HintBanner({ text }: { text: string }) {
  return (
    <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700">
      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{text}</span>
    </div>
  )
}

function PhaseIndicator({ phase }: { phase: ScreeningPhase }) {
  const steps = [
    { id: 'trading_exp', label: '取引経験' }, { id: 'transaction_type', label: '取引類型' },
    { id: 'route', label: '判定ルート' }, { id: 'asset_amount', label: '資産確認' },
    { id: 'supplement', label: '補足要件' }, { id: 'expertise_type', label: '知識経験' },
    { id: 'basket_detail', label: 'バスケット' },
  ]
  const currentIdx = steps.findIndex(s => s.id === phase)
  return (
    <div className="flex gap-1.5 flex-wrap mb-4">
      {steps.map((s, i) => (
        <span key={s.id} className={[
          'text-xs px-2.5 py-1 rounded-full border',
          i < currentIdx  ? 'bg-green-50 border-green-200 text-green-700' :
          i === currentIdx ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium' :
                             'bg-gray-50 border-gray-200 text-gray-400'
        ].join(' ')}>{s.label}</span>
      ))}
    </div>
  )
}

export function QIIScreeningTool() {
  const [s, setS] = useState<ScreeningState>(INITIAL_STATE)

  const showResult = (pass: boolean, detail: string) =>
    setS(prev => ({ ...prev, phase: 'result', result: { pass, detail } }))

  const evalAssetRoute = (route: Route, val: string) => {
    const label = route === 'inv_fin' ? '投資性金融資産' : '純資産'
    if (val === '5plus') { showResult(true, `${label}5億円以上 → 単独で要件充足。`); return }
    if (val === '3to5')  { setS(p => ({ ...p, phase: 'supplement', supplementStep: 'freq_3',          pendingDetail: `${label}3億円以上：年平均取引頻度4回/月以上、または特定の知識経験が必要です。` })); return }
    if (val === '1to3')  { setS(p => ({ ...p, phase: 'supplement', supplementStep: 'expertise_check', pendingDetail: `${label}1億円以上：特定の知識経験が必要です。` })); return }
    showResult(false, `${label}が1億円未満のため、このルートでは充足できません。`)
  }

  const evalIncomeRoute = (val: string) => {
    if (val === '1plus')    { setS(p => ({ ...p, phase: 'supplement', supplementStep: 'inv_fin_and_net_3', pendingDetail: '年収1億円以上：投資性金融資産3億円以上 AND 純資産3億円以上が必要です。' })); return }
    if (val === '1000to1')  { setS(p => ({ ...p, phase: 'supplement', supplementStep: 'expertise_check',   pendingDetail: '年収1,000万円以上：特定の知識経験が必要です。' })); return }
    showResult(false, '年収が1,000万円未満のため、このルートでは充足できません。')
  }

  const renderPhase = () => {
    switch (s.phase) {
      case 'trading_exp':
        return (
          <StepCard title="取引経験">
            <p className="text-sm font-medium text-gray-800">有価証券等の取引経験は1年以上ありますか？</p>
            <p className="text-xs text-gray-500">特定投資家移行の共通必須要件</p>
            <YNButtons
              onYes={() => setS(p => ({ ...p, phase: 'transaction_type', tradingExp: true }))}
              onNo={() => showResult(false, '取引経験1年以上が必須要件です。現時点では申出できません。')}
            />
          </StepCard>
        )
      case 'transaction_type':
        return (
          <StepCard title="申出対象の取引類型">
            <p className="text-sm font-medium text-gray-800">特定投資家への移行を申し出る取引類型を選択してください</p>
            <ChoiceList
              items={[
                { value: 'securities',    label: '有価証券への投資' },
                { value: 'derivatives',   label: 'デリバティブ取引' },
                { value: 'advisory',      label: '投資顧問契約' },
                { value: 'discretionary', label: '投資一任契約' },
              ]}
              onSelect={(v) => setS(p => ({ ...p, transactionType: v as TransactionType, phase: 'route' }))}
            />
          </StepCard>
        )
      case 'route':
        return (
          <StepCard title="判定ルートの選択">
            <p className="text-sm font-medium text-gray-800">最も該当する基準を選んでください</p>
            <ChoiceList
              items={[
                { value: 'inv_fin',    label: '投資性金融資産 基準' },
                { value: 'net_assets', label: '純資産 基準' },
                { value: 'income',     label: '年収 基準' },
                { value: 'expertise',  label: '特定の知識経験・資格' },
              ]}
              onSelect={(v) => {
                const route = v as Route
                setS(p => ({ ...p, route, phase: route === 'expertise' ? 'expertise_type' : 'asset_amount' }))
              }}
            />
          </StepCard>
        )
      case 'asset_amount': {
        const isIncome = s.route === 'income'
        const titleMap: Record<string, string> = { inv_fin: '投資性金融資産額', net_assets: '純資産額', income: '年収' }
        const qMap: Record<string, string> = {
          inv_fin: '投資性金融資産はいくらですか？',
          net_assets: '純資産はいくらですか？',
          income: '年収はいくらですか？',
        }
        const choices = isIncome
          ? [{ value: '1plus', label: '1億円以上' }, { value: '1000to1', label: '1,000万円以上1億円未満' }, { value: 'under1000', label: '1,000万円未満' }]
          : [{ value: '5plus', label: '5億円以上' }, { value: '3to5', label: '3億円以上5億円未満' }, { value: '1to3', label: '1億円以上3億円未満' }, { value: 'under1', label: '1億円未満' }]
        return (
          <StepCard title={titleMap[s.route!]}>
            <p className="text-sm font-medium text-gray-800">{qMap[s.route!]}</p>
            <ChoiceList items={choices} onSelect={(v) => {
              setS(p => ({ ...p, assetAmount: v }))
              if (s.route === 'income') evalIncomeRoute(v)
              else evalAssetRoute(s.route!, v)
            }} />
          </StepCard>
        )
      }
      case 'supplement': {
        type SupDef = { title: string; q: string; note?: string; onYes: () => void; onNo: () => void }
        const supDefs: Record<SupplementStep, SupDef> = {
          freq_3: {
            title: '取引頻度の確認', q: '年平均取引頻度は4回/月以上ですか？',
            onYes: () => showResult(true, '取引頻度要件充足 → 特定投資家移行要件を充足します。'),
            onNo: () => setS(p => ({ ...p, supplementStep: 'expertise_check', pendingDetail: '取引頻度が不足。特定の知識経験による充足を確認します。' })),
          },
          expertise_check: {
            title: '特定知識経験の確認', q: '「特定の知識経験を有する者」に該当しますか？', note: '詳細は次のステップで選択します',
            onYes: () => setS(p => ({ ...p, phase: 'expertise_type' })),
            onNo: () => showResult(false, 'このルートでは要件を充足できません。'),
          },
          inv_fin_and_net_3: {
            title: '投資性金融資産＋純資産の確認', q: '投資性金融資産3億円以上 かつ 純資産3億円以上 の両方を充足していますか？',
            onYes: () => showResult(true, '投資性金融資産3億円以上 AND 純資産3億円以上 → 要件充足。'),
            onNo: () => showResult(false, '年収1億円以上ルートでは両要件の同時充足が必要です。'),
          },
        }
        const def = supDefs[s.supplementStep!]
        return (
          <StepCard title={def.title}>
            {s.pendingDetail && <HintBanner text={s.pendingDetail} />}
            <p className="text-sm font-medium text-gray-800">{def.q}</p>
            {def.note && <p className="text-xs text-gray-500">{def.note}</p>}
            <YNButtons onYes={def.onYes} onNo={def.onNo} />
          </StepCard>
        )
      }
      case 'expertise_type':
        return (
          <StepCard title="特定知識経験の種別">
            <p className="text-sm font-medium text-gray-800">該当する知識経験・資格を選択してください</p>
            <p className="text-xs text-gray-500">複数該当する場合は最も有力なものを選択</p>
            <ChoiceList items={EXPERTISE_OPTIONS} onSelect={(v) => {
              if (v === 'none') { showResult(false, '特定の知識経験の要件を充足しません。'); return }
              if (v === 'basket') { setS(p => ({ ...p, expertiseKey: v, phase: 'basket_detail' })); return }
              const is2024 = v === 'listed_officer' || v === 'ma_ipo'
              const label = EXPERTISE_OPTIONS.find(o => o.value === v)?.label ?? ''
              showResult(true, `「${label}」として特定の知識経験要件を充足する可能性があります。${is2024 ? '\n（2024年12月FSA改正により追加されたカテゴリです）' : ''}\n最終判断は証券会社が行います。`)
            }} />
          </StepCard>
        )
      case 'basket_detail': {
        const txType = s.transactionType ?? 'securities'
        const txLabel: Record<TransactionType, string> = {
          securities: '有価証券への投資', derivatives: 'デリバティブ取引',
          advisory: '投資顧問契約', discretionary: '投資一任契約',
        }
        const examples = BASKET_EXAMPLES[txType]
        return (
          <StepCard title={`バスケット条項詳細（${txLabel[txType]}）`}>
            <HintBanner text={`バスケット条項（${txLabel[txType]}）：以下の業務経験等で「同等以上の知識経験」を有すると証券会社が認定できる場合があります。`} />
            <p className="text-sm font-medium text-gray-800">最も近い業務経験・属性を選択してください</p>
            <ChoiceList items={examples} onSelect={(v) => {
              if (v === 'none') { showResult(false, `バスケット条項（${txLabel[txType]}）での充足も認められない可能性が高い状況です。`); return }
              const label = examples.find(e => e.id === v)?.label ?? ''
              showResult(true, `バスケット条項（${txLabel[txType]}）：「${label}」として同等以上の知識経験を有する可能性があります。\n証券会社による個別認定が必要です。\n実務の中核的役割を担ったことを示す書類（雇用契約書・業務内容証明等）の準備を推奨します。`)
            }} />
          </StepCard>
        )
      }
      default: return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-semibold text-fgc-navy">特定投資家 移行資格スクリーニング</h3>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">4類型対応</span>
      </div>
      <p className="text-xs text-gray-500 -mt-2">金融商品取引法に基づく特定投資家（QII）移行可否を事前判定します（個人向け）</p>

      {s.phase !== 'result' && <PhaseIndicator phase={s.phase} />}
      {renderPhase()}

      {s.result && (
        <div className={['rounded-lg border p-5 space-y-3', s.result.pass ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'].join(' ')}>
          <div className="flex items-center gap-2">
            {s.result.pass
              ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
            <p className={`text-sm font-semibold ${s.result.pass ? 'text-green-800' : 'text-red-700'}`}>
              {s.result.pass ? '移行要件を充足する可能性があります' : '現時点では移行要件を充足しません'}
            </p>
          </div>
          <p className={`text-xs leading-relaxed whitespace-pre-line ${s.result.pass ? 'text-green-700' : 'text-red-600'}`}>
            {s.result.detail}
          </p>
          <p className="text-xs text-gray-500">
            ※ 最終的な特定投資家への移行には、証券会社等への申出および確認が必要です。本ツールはFGC内部スクリーニング用途に限ります。
          </p>
          <button onClick={() => setS(INITIAL_STATE)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-fgc-navy transition-colors pt-1">
            <RotateCcw className="w-3.5 h-3.5" />
            最初からやり直す
          </button>
        </div>
      )}
    </div>
  )
}
