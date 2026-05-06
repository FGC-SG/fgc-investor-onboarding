import React from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import type { Jurisdiction, InvestorType } from '../../types'
import { StepLayout } from '../common/StepLayout'
import { Building2, User, Landmark, Shield, Scale, Users, HandCoins, Globe2, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const JURISDICTIONS: { value: Jurisdiction; label: string; description: string }[] = [
  {
    value: 'MAS',
    label: 'Singapore (MAS)',
    description: 'Regulated under the Securities and Futures Act 2001 and MAS AML/CFT Notice SFA04-N02',
  },
  {
    value: 'FSA',
    label: 'Japan (FSA)',
    description: 'Regulated under the Financial Instruments and Exchange Act (FIEA) and Act on Prevention of Transfer of Criminal Proceeds',
  },
  {
    value: 'BOTH',
    label: 'Singapore & Japan',
    description: 'Investor is subject to both MAS and Japan FSA regulatory requirements',
  },
]

const INVESTOR_TYPES: { value: InvestorType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'individual',
    label: 'Individual',
    description: 'Natural person investing in their personal capacity',
    icon: <User className="w-5 h-5" />,
  },
  {
    value: 'corporate_sg',
    label: 'Private Company (Singapore)',
    description: 'Private limited company registered with ACRA',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    value: 'corporate_overseas',
    label: 'Private Company (Overseas)',
    description: 'Company incorporated or registered outside Singapore',
    icon: <Globe2 className="w-5 h-5" />,
  },
  {
    value: 'listed_company',
    label: 'Listed Company / SOE',
    description: 'Entity listed on a recognised stock exchange or state-owned enterprise',
    icon: <Landmark className="w-5 h-5" />,
  },
  {
    value: 'regulated_institution',
    label: 'Regulated Institution (Non-Bank)',
    description: 'Licensed fund manager, insurance company, trust company, CMS licensee, etc.',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    value: 'regulated_bank',
    label: 'Regulated Bank / Financial Institution',
    description: 'Bank or merchant bank licensed under the Banking Act',
    icon: <Landmark className="w-5 h-5" />,
  },
  {
    value: 'fund',
    label: 'Pooled Investment Vehicle',
    description: 'PE fund, hedge fund, pension fund, VC fund, fund of funds',
    icon: <HandCoins className="w-5 h-5" />,
  },
  {
    value: 'swf',
    label: 'Government / Sovereign Wealth Fund',
    description: 'Government entity, central bank, SWF, supranational organisation',
    icon: <Globe2 className="w-5 h-5" />,
  },
  {
    value: 'trust',
    label: 'Trust',
    description: 'Discretionary, bare, unit, charitable or other trust structure',
    icon: <Scale className="w-5 h-5" />,
  },
  {
    value: 'partnership',
    label: 'Partnership',
    description: 'General, limited, or limited liability partnership',
    icon: <Users className="w-5 h-5" />,
  },
  {
    value: 'npo',
    label: 'Charity / NPO / Club / Society',
    description: 'Non-profit organisation, NGO, charity, registered club or society',
    icon: <Users className="w-5 h-5" />,
  },
  {
    value: 'nominee',
    label: 'Nominee / Omnibus Account',
    description: 'Private bank, investment adviser or nominee company investing on behalf of clients',
    icon: <Shield className="w-5 h-5" />,
  },
]

export function WelcomeStep() {
  const { data, updateData, goNext } = useOnboarding()

  return (
    <StepLayout
      title="Investor Onboarding"
      subtitle="Please select your regulatory jurisdiction and investor type to begin. All information collected is subject to strict confidentiality under Singapore's Personal Data Protection Act (PDPA)."
      onNext={goNext}
      nextLabel="Begin Onboarding"
      hideBack
    >
      {/* Regulatory warning banner */}
      <div className="alert-warning">
        <p className="font-semibold mb-1">Important Notice</p>
        <p>
          FGC offers interests exclusively to <strong>Accredited Investors</strong> and{' '}
          <strong>Institutional Investors</strong> as defined under the Securities and Futures Act 2001 of
          Singapore. Retail investors are not eligible to invest. By proceeding, you confirm that you
          are eligible to subscribe and that all information provided is true, accurate and complete.
        </p>
      </div>

      {/* Jurisdiction */}
      <div className="card p-6">
        <h2 className="section-title">1. Regulatory Jurisdiction</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select the jurisdiction(s) applicable to this investor. This determines which regulatory
          declarations and schedules must be completed.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {JURISDICTIONS.map(j => (
            <button
              key={j.value}
              type="button"
              onClick={() => updateData({ jurisdiction: j.value })}
              className={clsx(
                'text-left rounded-lg border-2 p-4 transition-all',
                data.jurisdiction === j.value
                  ? 'border-fgc-mid bg-blue-50'
                  : 'border-gray-200 hover:border-fgc-light'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-fgc-navy">{j.label}</span>
                {data.jurisdiction === j.value && (
                  <span className="w-4 h-4 rounded-full bg-fgc-mid flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{j.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Investor Type */}
      <div className="card p-6">
        <h2 className="section-title">2. Investor Type</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select the legal form of the investor. The onboarding form and document requirements will
          be tailored accordingly.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {INVESTOR_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => updateData({ investorType: t.value })}
              className={clsx(
                'text-left rounded-lg border-2 px-4 py-3 transition-all flex items-start gap-3',
                data.investorType === t.value
                  ? 'border-fgc-mid bg-blue-50'
                  : 'border-gray-200 hover:border-fgc-light'
              )}
            >
              <span className={clsx(
                'mt-0.5 flex-shrink-0 p-1.5 rounded',
                data.investorType === t.value ? 'bg-fgc-mid text-white' : 'bg-gray-100 text-gray-500'
              )}>
                {t.icon}
              </span>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-fgc-navy">{t.label}</span>
                  {data.investorType === t.value && (
                    <ChevronRight className="w-4 h-4 text-fgc-mid" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fund context */}
      {['fund', 'swf', 'regulated_institution', 'regulated_bank'].includes(data.investorType) && (
        <div className="card p-6">
          <h2 className="section-title">3. Fund / Product Context</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Fund Name Subscribing Into</label>
              <input
                className="field-input"
                placeholder="e.g. FGC Co-Investment Scheme I"
                value={data.fundName ?? ''}
                onChange={e => updateData({ fundName: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Fund Type</label>
              <select
                className="field-select"
                value={data.fundType ?? ''}
                onChange={e => updateData({ fundType: e.target.value })}
              >
                <option value="">Select…</option>
                <option value="pe_closed_end">PE Closed-End Fund</option>
                <option value="vc">Venture Capital Fund</option>
                <option value="co_investment">Co-Investment Scheme</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </StepLayout>
  )
}
