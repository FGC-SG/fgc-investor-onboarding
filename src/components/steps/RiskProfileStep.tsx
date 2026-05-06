import React from 'react'
import { useForm } from 'react-hook-form'
import { useOnboarding } from '../../context/OnboardingContext'
import { StepLayout } from '../common/StepLayout'
import { FormField, Input, Select, TextArea } from '../common/FormField'
import type { InvestmentRiskProfile, AMLRiskProfile } from '../../types'
import { INVESTMENT_PRODUCT_OPTIONS } from '../../utils/constants'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

export function RiskProfileStep() {
  const { data, updateData, goNext } = useOnboarding()
  const isIndividual = data.investorType === 'individual'
  const existing = data.investmentRisk ?? {} as Partial<InvestmentRiskProfile>

  const { register, handleSubmit, watch, formState: { errors } } = useForm<InvestmentRiskProfile>({
    defaultValues: existing as InvestmentRiskProfile,
  })

  const onSubmit = (values: InvestmentRiskProfile) => {
    updateData({ investmentRisk: values })
    goNext()
  }

  const riskTolerance = watch('riskTolerance')

  const RISK_LEVELS = [
    { value: 'conservative', label: 'Conservative', desc: 'Capital preservation. Low risk, accept lower returns.', color: 'bg-green-100 border-green-300 text-green-800' },
    { value: 'moderate_conservative', label: 'Moderately Conservative', desc: 'Mostly capital preservation with some growth.', color: 'bg-teal-100 border-teal-300 text-teal-800' },
    { value: 'moderate', label: 'Moderate', desc: 'Balanced growth and income. Medium risk tolerance.', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    { value: 'aggressive', label: 'Aggressive', desc: 'Capital growth. Higher risk for higher returns.', color: 'bg-orange-100 border-orange-300 text-orange-800' },
    { value: 'very_aggressive', label: 'Very Aggressive', desc: 'Maximum growth. Comfortable with significant volatility and illiquidity.', color: 'bg-red-100 border-red-300 text-red-800' },
  ]

  return (
    <StepLayout
      title="Investment Risk Profile"
      subtitle="Your risk profile helps FGC ensure that the investment is suitable for your financial objectives and risk appetite."
      onNext={handleSubmit(onSubmit)}
    >
      {/* Investment Objective */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Investment Objective</h2>
        <FormField label="Primary Investment Objective" required error={errors.investmentObjective?.message}>
          <Select {...register('investmentObjective', { required: 'Required' })} error={!!errors.investmentObjective}>
            <option value="">Select…</option>
            <option value="capital_preservation">Capital Preservation</option>
            <option value="income">Income Generation</option>
            <option value="capital_growth">Capital Growth</option>
            <option value="balanced">Balanced (Growth + Income)</option>
            <option value="speculation">Speculation / Maximum Returns</option>
          </Select>
        </FormField>
      </div>

      {/* Risk Tolerance */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Risk Tolerance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {RISK_LEVELS.map(level => (
            <label
              key={level.value}
              className={clsx(
                'cursor-pointer rounded-lg border-2 p-3 text-center transition-all',
                riskTolerance === level.value
                  ? `${level.color} border-current`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              )}
            >
              <input type="radio" value={level.value} className="sr-only"
                {...register('riskTolerance', { required: 'Required' })} />
              <p className="text-xs font-semibold">{level.label}</p>
              <p className="text-xs mt-1 text-gray-600 leading-relaxed">{level.desc}</p>
            </label>
          ))}
        </div>
        {errors.riskTolerance && <p className="field-error">{errors.riskTolerance.message}</p>}
      </div>

      {/* Investment Details */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Investment Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Investment Horizon" required error={errors.investmentHorizon?.message}>
            <Select {...register('investmentHorizon', { required: 'Required' })} error={!!errors.investmentHorizon}>
              <option value="">Select…</option>
              <option value="<1yr">Less than 1 year</option>
              <option value="1-3yr">1 to 3 years</option>
              <option value="3-5yr">3 to 5 years</option>
              <option value="5-10yr">5 to 10 years</option>
              <option value=">10yr">More than 10 years</option>
            </Select>
          </FormField>
          <FormField label="Liquidity Requirements" required>
            <Select {...register('liquidityNeeds', { required: 'Required' })}>
              <option value="">Select…</option>
              <option value="low">Low — Can lock up capital for fund term</option>
              <option value="moderate">Moderate — May need some liquidity</option>
              <option value="high">High — Require significant near-term liquidity</option>
            </Select>
          </FormField>
          <FormField label="Estimated Investment Amount (USD)" required error={errors.estimatedInvestmentAmountUSD?.message}>
            <Input type="number" placeholder="0"
              {...register('estimatedInvestmentAmountUSD', { required: 'Required', valueAsNumber: true, min: { value: 0, message: 'Must be positive' } })}
              error={!!errors.estimatedInvestmentAmountUSD} />
          </FormField>
          <FormField label="As % of Net Worth / Net Assets" hint="Approximate percentage of your total net worth">
            <Input type="number" min="0" max="100" placeholder="e.g. 10"
              {...register('percentageOfNetWorth', { valueAsNumber: true })} />
          </FormField>
        </div>
      </div>

      {/* Investment Experience */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Investment Knowledge &amp; Experience</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Investment Experience" required>
            <Select {...register('investmentExperience', { required: 'Required' })}>
              <option value="">Select…</option>
              <option value="none">None — First-time investor</option>
              <option value="limited">Limited — Less than 3 years</option>
              <option value="moderate">Moderate — 3 to 10 years</option>
              <option value="extensive">Extensive — More than 10 years</option>
            </Select>
          </FormField>
        </div>
        <div>
          <p className="field-label mb-2">Products / Asset Classes with Prior Experience</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INVESTMENT_PRODUCT_OPTIONS.map(prod => (
              <label key={prod} className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" value={prod} className="checkbox-input"
                  {...register('productsExperience')} />
                {prod}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* AML Risk Rating (internal) */}
      <AMLRiskRatingSection />
    </StepLayout>
  )
}

// ─── AML Risk Rating (compliance internal section) ────────────────────────────

function AMLRiskRatingSection() {
  const { data, updateData } = useOnboarding()
  const existing = data.amlRisk ?? {} as Partial<AMLRiskProfile>
  const [risk, setRisk] = React.useState<Partial<AMLRiskProfile>>(existing)

  const setField = (key: keyof AMLRiskProfile, value: any) => {
    const updated = { ...risk, [key]: value }
    setRisk(updated)
    updateData({ amlRisk: updated as AMLRiskProfile })
  }

  const overallRisk = (() => {
    const cr = risk.countryRisk?.[0]?.toUpperCase() ?? 'L'
    const tr = risk.taxRisk?.[0]?.toUpperCase() ?? 'L'
    const ir = risk.industryRisk?.[0]?.toUpperCase() ?? 'L'
    const code = `${cr}${tr}${ir}`
    if (cr === 'H' || tr === 'H' || ir === 'H') return { level: 'high', code }
    if (cr === 'M' || tr === 'M' || ir === 'M') return { level: 'medium', code }
    return { level: 'low', code }
  })()

  const redFlags = [
    { key: 'taxHavens', label: 'Existence of transactions involving tax havens' },
    { key: 'complexStructures', label: 'Complex ownership structures (more than 3 layers)' },
    { key: 'mismatchIdentity', label: 'Mismatch of identity information' },
    { key: 'negativeNewsReports', label: 'Reliable negative tax-related reports / adverse news' },
    { key: 'multipleRegionTaxReturns', label: 'Filing of multiple tax returns in different regions within one country' },
    { key: 'commonAddresses', label: 'Use of common address / bank accounts by several entities/individuals' },
    { key: 'poBoxAddress', label: 'Use of P.O. box as residential/business address' },
    { key: 'inconsistentTransactions', label: 'Inconsistent transaction behaviour vs expected activity or known client profile' },
    { key: 'insufficientIncome', label: 'Insufficient income / funding whose origins are questionable' },
    { key: 'unusualEarnings', label: 'Unusually high or unreasonable earnings or income' },
    { key: 'nonFaceToFace', label: 'Non face-to-face relationship' },
  ] as { key: keyof AMLRiskProfile; label: string }[]

  const hasRedFlags = redFlags.some(f => risk[f.key] === true)

  return (
    <div className="card p-6 space-y-6">
      <h2 className="section-title">AML Risk Assessment (Compliance)</h2>
      <p className="text-xs text-gray-500">
        This section is for FGC compliance purposes. Please complete based on the investor profile.
      </p>

      {/* Risk Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="field-label mb-2">Country AML/CFT Risk</p>
          <p className="text-xs text-gray-500 mb-2">
            High: FATF high-risk/non-cooperative; Basel ≥6.75; UN/OFAC/MAS sanctions<br />
            Medium: FATF strategic deficiencies; Basel 4.9–6.75<br />
            Low: All others
          </p>
          {(['low', 'medium', 'high'] as const).map(level => (
            <label key={level} className="flex items-center gap-2 text-sm mb-1 cursor-pointer capitalize">
              <input type="radio" name="countryRisk" value={level} className="radio-input"
                checked={risk.countryRisk === level}
                onChange={() => setField('countryRisk', level)} />
              <span className={clsx(
                'font-medium',
                level === 'high' ? 'text-red-600' : level === 'medium' ? 'text-amber-600' : 'text-green-600'
              )}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
            </label>
          ))}
        </div>
        <div>
          <p className="field-label mb-2">Tax Risk</p>
          <p className="text-xs text-gray-500 mb-2">
            High: OECD Non-Compliant/Provisionally Partially Compliant<br />
            Medium: Partially / Provisionally Largely Compliant<br />
            Low: Largely Compliant / Compliant
          </p>
          {(['low', 'medium', 'high'] as const).map(level => (
            <label key={level} className="flex items-center gap-2 text-sm mb-1 cursor-pointer">
              <input type="radio" name="taxRisk" value={level} className="radio-input"
                checked={risk.taxRisk === level}
                onChange={() => setField('taxRisk', level)} />
              <span className={clsx(
                'font-medium capitalize',
                level === 'high' ? 'text-red-600' : level === 'medium' ? 'text-amber-600' : 'text-green-600'
              )}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
            </label>
          ))}
        </div>
        <div>
          <p className="field-label mb-2">Business / Industry Risk</p>
          <p className="text-xs text-gray-500 mb-2">
            Based on nature of business, industry sector, and inherent ML/TF risks.
          </p>
          {(['low', 'medium', 'high'] as const).map(level => (
            <label key={level} className="flex items-center gap-2 text-sm mb-1 cursor-pointer">
              <input type="radio" name="industryRisk" value={level} className="radio-input"
                checked={risk.industryRisk === level}
                onChange={() => setField('industryRisk', level)} />
              <span className={clsx(
                'font-medium capitalize',
                level === 'high' ? 'text-red-600' : level === 'medium' ? 'text-amber-600' : 'text-green-600'
              )}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Screening */}
      <div>
        <p className="field-label mb-2">Sanctions &amp; AML Screening</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { key: 'worldCheckScreened', label: 'World-Check / Sanctions' },
            { key: 'publicDomainScreened', label: 'Public Domain Search' },
            { key: 'masWatchlistScreened', label: 'MAS Watchlist' },
            { key: 'strDataChecked', label: 'STR Data' },
          ].map(s => (
            <label key={s.key} className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" className="checkbox-input"
                checked={(risk as any)[s.key] ?? false}
                onChange={e => setField(s.key as keyof AMLRiskProfile, e.target.checked)} />
              {s.label}
            </label>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Screening Result</label>
            <select className="field-select" value={risk.screeningResult ?? ''}
              onChange={e => setField('screeningResult', e.target.value)}>
              <option value="">Select…</option>
              <option value="no_match">No Match</option>
              <option value="match_cleared">Match — Cleared</option>
              <option value="match_pending">Match — Pending Review</option>
            </select>
          </div>
          <div>
            <label className="field-label">Screening Date</label>
            <input type="date" className="field-input" value={risk.screeningDate ?? ''}
              onChange={e => setField('screeningDate', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">Screening Comments</label>
            <input type="text" className="field-input" placeholder="e.g. No match"
              value={risk.screeningComments ?? ''}
              onChange={e => setField('screeningComments', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Red Flags */}
      <div>
        <p className="field-label mb-2">Red Flag Indicators (tick if present)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {redFlags.map(f => (
            <label key={f.key} className="flex items-start gap-2 text-xs cursor-pointer">
              <input type="checkbox" className="checkbox-input mt-0.5"
                checked={(risk as any)[f.key] ?? false}
                onChange={e => setField(f.key, e.target.checked)} />
              <span className={clsx((risk as any)[f.key] ? 'text-red-700 font-medium' : 'text-gray-700')}>{f.label}</span>
            </label>
          ))}
        </div>
        {hasRedFlags && (
          <div className="mt-3">
            <label className="field-label">Other Red Flag Details</label>
            <input type="text" className="field-input" placeholder="Describe any other red flag indicators"
              value={risk.otherRedFlags ?? ''}
              onChange={e => setField('otherRedFlags', e.target.value)} />
          </div>
        )}
      </div>

      {/* Overall Risk */}
      <div className={clsx(
        'rounded-lg p-4 border-2',
        overallRisk.level === 'high' ? 'bg-red-50 border-red-300' :
        overallRisk.level === 'medium' ? 'bg-amber-50 border-amber-300' :
        'bg-green-50 border-green-300'
      )}>
        <div className="flex items-center gap-2 mb-2">
          {overallRisk.level === 'high' ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
           overallRisk.level === 'medium' ? <AlertTriangle className="w-5 h-5 text-amber-600" /> :
           <CheckCircle2 className="w-5 h-5 text-green-600" />}
          <p className="font-semibold text-sm">
            Overall Customer Risk Rating:{' '}
            <span className={clsx(
              overallRisk.level === 'high' ? 'text-red-700' :
              overallRisk.level === 'medium' ? 'text-amber-700' : 'text-green-700'
            )}>
              {overallRisk.level.toUpperCase()} ({overallRisk.code})
            </span>
          </p>
        </div>
        {overallRisk.level === 'high' && (
          <div className="mt-2">
            <label className="field-label text-red-700">EDD Triggers (Enhanced Due Diligence required)</label>
            <input type="text" className="field-input border-red-300" placeholder="Describe EDD triggers"
              value={risk.eddTriggers ?? ''}
              onChange={e => setField('eddTriggers', e.target.value)} />
          </div>
        )}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="field-label text-xs">Reviewed by (Compliance Officer)</label>
            <input type="text" className="field-input text-xs" placeholder="Name"
              value={risk.reviewedBy ?? ''}
              onChange={e => setField('reviewedBy', e.target.value)} />
          </div>
          <div>
            <label className="field-label text-xs">Approved by (Compliance Manager)</label>
            <input type="text" className="field-input text-xs" placeholder="Name"
              value={risk.approvedBy ?? ''}
              onChange={e => setField('approvedBy', e.target.value)} />
          </div>
          <div>
            <label className="field-label text-xs">Review Date</label>
            <input type="date" className="field-input text-xs" value={risk.reviewDate ?? ''}
              onChange={e => setField('reviewDate', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  )
}
