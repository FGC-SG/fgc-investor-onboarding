import React from 'react'
import { useForm } from 'react-hook-form'
import { useOnboarding } from '../../context/OnboardingContext'
import { StepLayout } from '../common/StepLayout'
import { FormField, Input } from '../common/FormField'
import type { MASClassification, AIBasis } from '../../types'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import clsx from 'clsx'

interface FormValues {
  masClassification: MASClassification
  aiBasis: AIBasis[]
  netPersonalAssets?: number
  financialAssets?: number
  annualIncome?: number
  netAssets?: number // for corporate/entity
  aiOptIn: boolean
}

const AI_BASIS_OPTIONS: { value: AIBasis; label: string; threshold: string; applicable: ('individual' | 'entity')[] }[] = [
  {
    value: 'net_personal_assets',
    label: 'Net personal assets exceed S$2 million',
    threshold: 'Net assets > S$2,000,000 (value of primary residence capped at S$1,000,000)',
    applicable: ['individual'],
  },
  {
    value: 'financial_assets',
    label: 'Net financial assets exceed S$1 million',
    threshold: 'Financial assets (deposits, investment products) net of liabilities > S$1,000,000',
    applicable: ['individual'],
  },
  {
    value: 'annual_income',
    label: 'Annual income ≥ S$300,000',
    threshold: 'Income in the preceding 12 months ≥ S$300,000 (or equivalent in foreign currency)',
    applicable: ['individual'],
  },
  {
    value: 'net_assets_10m',
    label: 'Entity net assets exceed S$10 million',
    threshold: 'Net assets > S$10,000,000 per most recent audited balance sheet',
    applicable: ['entity'],
  },
]

const INSTITUTIONAL_OPTIONS = [
  { value: 'sg_government', label: '(a) Government of Singapore' },
  { value: 'statutory_board', label: '(b) Statutory Board' },
  { value: 'central_govt_owned_asset_mgr', label: '(c) Entity wholly owned by a central government managing its own funds' },
  { value: 'central_govt_owned_managed', label: '(d) Entity wholly owned by central govt with funds managed per (c)' },
  { value: 'central_bank_non_sg', label: '(e) Central bank outside Singapore' },
  { value: 'central_govt_non_sg', label: '(f) Central government outside Singapore' },
  { value: 'agency_central_govt', label: '(g) Agency of a central government incorporated outside Singapore' },
  { value: 'multilateral_agency', label: '(h) Multilateral agency / international organisation / supranational' },
  { value: 'bank_sg', label: '(i) Bank licensed under the Banking Act (Singapore)' },
  { value: 'merchant_bank_sg', label: '(j) Merchant bank (Singapore)' },
  { value: 'finance_company_sg', label: '(k) Finance company (Singapore)' },
  { value: 'insurer_sg', label: '(l) Insurance company (Singapore)' },
  { value: 'trust_company_sg', label: '(m) Trust company (Singapore)' },
  { value: 'cms_licensee', label: '(n) Capital markets services licensee' },
  { value: 'approved_exchange', label: '(o) Approved exchange' },
  { value: 'pension_cis', label: '(x) Pension fund or collective investment scheme' },
  { value: 'regulated_overseas', label: '(w) Entity/trust regulated for financial activity in its jurisdiction' },
  { value: 'corporation_owned_by_ii', label: '(ee) Corporation wholly owned by institutional investor(s)' },
  { value: 'other_prescribed', label: '(gg) Such other person as MAS may prescribe' },
]

export function MASClassificationStep() {
  const { data, updateData, goNext } = useOnboarding()
  const isIndividual = data.investorType === 'individual'
  const existing = isIndividual ? data.individual : data.entity
  const inv = existing ?? {}

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      masClassification: (inv as any).masClassification,
      aiBasis: (inv as any).aiBasis ?? [],
      netPersonalAssets: (inv as any).netPersonalAssets,
      financialAssets: (inv as any).financialAssets,
      annualIncome: (inv as any).annualIncome,
      netAssets: (inv as any).netAssets,
      aiOptIn: (inv as any).aiOptIn ?? true,
    },
  })

  const classification = watch('masClassification')
  const isAI = classification?.startsWith('accredited')
  const isII = classification === 'institutional'

  const onSubmit = (values: FormValues) => {
    if (isIndividual) {
      updateData({ individual: { ...data.individual, ...values } as any })
    } else {
      updateData({ entity: { ...data.entity, ...values } as any })
    }
    goNext()
  }

  return (
    <StepLayout
      title="MAS Investor Classification — Schedule 2"
      subtitle="Under the Securities and Futures Act 2001 (Singapore), FGC may only offer interests to Accredited Investors and Institutional Investors. Please confirm the basis for your investor status."
      onNext={handleSubmit(onSubmit)}
    >
      <div className="alert-warning">
        <AlertTriangle className="w-4 h-4 inline mr-1" />
        <strong>Important:</strong> FGC's funds are restricted to Accredited Investors and Institutional Investors only.
        Investors who do not qualify under either category are not eligible to subscribe.
      </div>

      {/* Classification Selection */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Investor Classification</h2>

        {/* Accredited Investor — Individual */}
        {isIndividual && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-fgc-navy">Accredited Investors (Individuals) — SFA Section 4A(1)(a)</p>
            {AI_BASIS_OPTIONS.filter(o => o.applicable.includes('individual')).map(opt => (
              <label key={opt.value} className={clsx('checkbox-row', 'block')}>
                <div className="flex items-start gap-3">
                  <input type="radio" value="accredited_individual" className="radio-input mt-1"
                    {...register('masClassification', { required: 'Please select a classification' })} />
                  <div>
                    <p className="text-sm font-medium text-fgc-navy">{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.threshold}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Accredited Investor — Corporate / Entity */}
        {!isIndividual && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-fgc-navy">Accredited Investors (Non-Individuals) — SFA Section 4A(1)(b)–(f)</p>
            {[
              { value: 'accredited_corporate', label: '(b) Corporation with net assets exceeding S$10 million', desc: 'Per most recent audited / certified balance sheet' },
              { value: 'accredited_trust', label: '(c) Trustee of qualifying trust', desc: 'All beneficiaries or settlors are AIs, or trust subject matter >S$10M' },
              { value: 'accredited_entity', label: '(d) Entity (non-corporation) with net assets >S$10 million', desc: 'Includes unincorporated associations, partnerships, governments (not trusts)' },
              { value: 'accredited_partnership', label: '(e) Partnership where every partner is an AI', desc: 'Excluding LLPs' },
              { value: 'accredited_wholly_owned', label: '(f) Corporation wholly owned by one or more AIs', desc: '' },
            ].map(opt => (
              <label key={opt.value} className="checkbox-row block">
                <div className="flex items-start gap-3">
                  <input type="radio" value={opt.value} className="radio-input mt-1"
                    {...register('masClassification', { required: 'Required' })} />
                  <div>
                    <p className="text-sm font-medium text-fgc-navy">{opt.label}</p>
                    {opt.desc && <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Institutional Investor */}
        <div className="space-y-2 mt-4">
          <p className="text-sm font-semibold text-fgc-navy">Institutional Investors — SFA Section 4A(1)(c)</p>
          <label className="checkbox-row block">
            <div className="flex items-start gap-3">
              <input type="radio" value="institutional" className="radio-input mt-1"
                {...register('masClassification', { required: 'Required' })} />
              <div>
                <p className="text-sm font-medium text-fgc-navy">I/We qualify as an Institutional Investor</p>
                <p className="text-xs text-gray-500 mt-0.5">Select the applicable sub-category below</p>
              </div>
            </div>
          </label>
          {isII && (
            <div className="ml-8 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INSTITUTIONAL_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input type="checkbox" value={opt.value} className="checkbox-input" {...register('aiBasis')} />
                  {opt.label}
                </label>
              ))}
            </div>
          )}
        </div>

        {errors.masClassification && (
          <p className="field-error">{errors.masClassification.message}</p>
        )}
      </div>

      {/* Financial Evidence */}
      {isAI && (
        <div className="card p-6 space-y-4">
          <h2 className="section-title">Financial Evidence</h2>
          <div className="alert-info text-xs">
            <Info className="w-4 h-4 inline mr-1" />
            Documentary evidence is required to support your AI status (e.g. bank statement, income statement, audited balance sheet).
          </div>

          {isIndividual && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Net Personal Assets (S$)" hint="Primary residence capped at S$1M">
                <Input type="number" placeholder="0" {...register('netPersonalAssets', { valueAsNumber: true })} />
              </FormField>
              <FormField label="Net Financial Assets (S$)" hint="Deposits + investment products net of liabilities">
                <Input type="number" placeholder="0" {...register('financialAssets', { valueAsNumber: true })} />
              </FormField>
              <FormField label="Annual Income (S$)" hint="Preceding 12 months">
                <Input type="number" placeholder="0" {...register('annualIncome', { valueAsNumber: true })} />
              </FormField>
            </div>
          )}
          {!isIndividual && (
            <FormField label="Net Assets per Latest Audited Balance Sheet (S$)">
              <Input type="number" placeholder="0" {...register('netAssets', { valueAsNumber: true })} />
            </FormField>
          )}
        </div>
      )}

      {/* Accredited Investor Opt-In — Schedule 2B Notice A */}
      {isAI && (
        <div className="card p-6 space-y-4">
          <h2 className="section-title">Accredited Investor Opt-In — Schedule 2B Notice A</h2>
          <div className="alert-warning text-xs">
            <strong>GENERAL WARNING:</strong> Accredited investors are assumed to be better informed and better able to access resources to protect their own interests, and therefore require less regulatory protection. Investors who agree to be treated as accredited investors therefore forgo certain regulatory safeguards — including prospectus registration requirements, enhanced client money protections, and certain business conduct obligations.
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 leading-relaxed space-y-2">
            <p>Under the Securities and Futures (Classes of Investors) Regulations 2018, where FGC deals with you as an accredited investor, you must provide consent to being treated as an accredited investor for the purposes of the applicable Consent Provisions (Regulation 3(9)(b), (c), (d), (e) and (f)).</p>
            <p>I/We have read and understood the contents of Notice A (Schedule 2B) and the Annex thereto, including the consequences of consenting to be treated as an accredited investor for the purposes of the Consent Provisions.</p>
            <p>I/We understand that I/we may at any time withdraw my/our consent by written notice to FGC, subject to fulfillment of all obligations under the terms of the Fund.</p>
          </div>
          <div className="space-y-3">
            <label className={clsx('checkbox-row', 'flex items-start gap-3')}>
              <input type="radio" value="true" className="radio-input mt-0.5"
                {...register('aiOptIn', { required: 'Please indicate your consent' })} />
              <div>
                <p className="text-sm font-semibold text-green-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> I/We consent to being treated as an Accredited Investor
                </p>
                <p className="text-xs text-gray-500">I/We hereby give my/our consent to be treated by FGC and the Funds as an accredited investor for the purposes of the applicable Consent Provisions.</p>
              </div>
            </label>
            <label className={clsx('checkbox-row', 'flex items-start gap-3')}>
              <input type="radio" value="false" className="radio-input mt-0.5" {...register('aiOptIn')} />
              <div>
                <p className="text-sm font-semibold text-red-700">I/We do NOT consent to being treated as an Accredited Investor</p>
                <p className="text-xs text-gray-500">Note: FGC's funds are offered exclusively to Accredited and Institutional Investors. Non-consent will result in ineligibility to invest.</p>
              </div>
            </label>
          </div>
          {errors.aiOptIn && <p className="field-error">{errors.aiOptIn.message}</p>}
        </div>
      )}
    </StepLayout>
  )
}
