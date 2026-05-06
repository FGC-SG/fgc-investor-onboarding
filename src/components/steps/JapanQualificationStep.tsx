import React from 'react'
import { useForm } from 'react-hook-form'
import { useOnboarding } from '../../context/OnboardingContext'
import { StepLayout } from '../common/StepLayout'
import { FormField, Input } from '../common/FormField'
import type { JapanNonQIICategory } from '../../types'
import { AlertTriangle, Info } from 'lucide-react'

interface FormValues {
  isJapanInvestor: boolean
  isQII: boolean
  qiiRegistrationNo?: string
  nonQIICategory: JapanNonQIICategory[]
  investableFinancialAssets?: number
  securitiesAccountOpenedOver1Year?: boolean
  antiSocialForcesDeclaration: boolean
  capitalNotCriminalProceeds: boolean
  japanImportantMattersExplained: boolean
  japanIdentityDocumentsCorrect: boolean
}

const NON_QII_CATEGORIES: { value: JapanNonQIICategory; label: string; note?: string }[] = [
  { value: 'japanese_government', label: 'Japanese government / Bank of Japan / local government in Japan' },
  { value: 'financial_instruments_operator', label: 'Financial instruments business operator' },
  { value: 'fund_asset_manager', label: 'Fund asset manager, etc.' },
  { value: 'linked_to_fund_manager', label: 'Person closely linked to fund asset manager, etc.' },
  { value: 'listed_company', label: 'Listed company' },
  { value: 'juridical_person_50m', label: 'Juridical person (with net assets or capital of ¥50 million or more)' },
  { value: 'subsidiary_of_regulated', label: 'Subsidiary or affiliate of financial instruments business operator, listed company or juridical person (≥¥50M)' },
  { value: 'special_corporation', label: 'Special corporation / incorporated administrative agency, etc.' },
  { value: 'tmk', label: 'Tokutei mokuteki kaisha (TMK — Specified Purpose Company)' },
  { value: 'pension_fund_10b', label: 'Pension fund / foreign pension fund (with investable financial assets ≥¥10 billion)' },
  { value: 'foreign_juridical_person', label: 'Foreign juridical person' },
  { value: 'individual_100m', label: 'Individual (investable financial assets ≥¥100 million AND securities account opened ≥1 year ago)', note: '100M JPY threshold' },
  { value: 'juridical_person_100m', label: 'Juridical person (with investable financial assets ≥¥100 million)' },
  { value: 'individual_managing_partner', label: 'Individual managing partner of partnership / silent partnership / LLP / foreign partnership (investable assets ≥¥100M)' },
  { value: 'juridical_person_managing_partner', label: 'Juridical person managing partner of partnership / etc. (investable assets ≥¥100M)' },
  { value: 'public_interest_corporation', label: 'Public interest incorporated corporation / foundation (govt owns ≥1/4 voting rights, conducts regional / industrial promotion)' },
  { value: 'asset_manager', label: 'Asset manager' },
  { value: 'foreign_fund_issuer', label: 'Issuer of interests in foreign fund' },
]

export function JapanQualificationStep() {
  const { data, updateData, goNext } = useOnboarding()
  const isIndividual = data.investorType === 'individual'
  const existing = isIndividual ? data.individual : data.entity
  const inv = existing ?? {}

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      isJapanInvestor: (inv as any).isJapanInvestor ?? true,
      isQII: (inv as any).isQII ?? false,
      qiiRegistrationNo: (inv as any).qiiRegistrationNo,
      nonQIICategory: (inv as any).nonQIICategory ?? [],
      investableFinancialAssets: (inv as any).investableFinancialAssets,
      securitiesAccountOpenedOver1Year: (inv as any).securitiesAccountOpenedOver1Year,
      antiSocialForcesDeclaration: (inv as any).antiSocialForcesDeclaration ?? false,
      capitalNotCriminalProceeds: (inv as any).capitalNotCriminalProceeds ?? false,
      japanImportantMattersExplained: false,
      japanIdentityDocumentsCorrect: false,
    },
  })

  const isQII = watch('isQII')
  const selectedCategories = watch('nonQIICategory')
  const needsFinancialAssets = (selectedCategories ?? []).some(c =>
    ['individual_100m', 'juridical_person_100m', 'individual_managing_partner',
     'juridical_person_managing_partner', 'pension_fund_10b'].includes(c)
  )
  const needsSecuritiesAccount = (selectedCategories ?? []).some(c => c === 'individual_100m' || c === 'individual_managing_partner')

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
      title="Japan FSA — Investor Qualification (Schedule 5)"
      subtitle="The offering of interests in Japan is intended to be exempt from FIEA registration requirements. Please confirm the applicable categories and make the required declarations."
      onNext={handleSubmit(onSubmit)}
    >
      <div className="alert-info">
        <Info className="w-4 h-4 inline mr-1" />
        <strong>FIEA Exemption:</strong> The offering of interests in Japan relies on the exemption for solicitation of a small number of investors under Article 4(1) and Article 23-13(4) of the Financial Instruments and Exchange Act (FIEA), available to fewer than 499 investors.
      </div>

      <div className="alert-warning">
        <AlertTriangle className="w-4 h-4 inline mr-1" />
        FGC has not been and will not be registered under the FIEA. The investor's interest may not be transferred, offered, sold or pledged in any manner that would require FGC to be registered under the FIEA.
      </div>

      {/* QII Status */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Qualified Institutional Investor (QII) Status</h2>
        <p className="text-sm text-gray-600">
          A Qualified Institutional Investor (適格機関投資家) is an investor registered under FIEA with the Kanto Local Finance Bureau or similar authority.
        </p>
        <div className="space-y-3">
          <label className="checkbox-row flex items-start gap-3">
            <input type="radio" value="true" className="radio-input mt-0.5"
              {...register('isQII')} />
            <div>
              <p className="text-sm font-semibold text-fgc-navy">I/We are a Qualified Institutional Investor (QII)</p>
              <p className="text-xs text-gray-500">Registered under FIEA Article 2(3)(i). Under the Article 63 Exemption, QII investors covenant to maintain QII status while holding interests.</p>
            </div>
          </label>
          <label className="checkbox-row flex items-start gap-3">
            <input type="radio" value="false" className="radio-input mt-0.5"
              {...register('isQII')} />
            <div>
              <p className="text-sm font-semibold text-fgc-navy">I/We are NOT a QII (Non-QII Japanese Investor)</p>
              <p className="text-xs text-gray-500">Non-QII investors must qualify under one of the categories in Article 17-12, Para 1 below. Interests may not be transferred except as a single block to a non-Disqualified Investor, and the total number of non-QII holders must not exceed 49.</p>
            </div>
          </label>
        </div>
        {isQII && (
          <FormField label="QII Registration Number (FIEA Article 2(3)(i))">
            <Input placeholder="Registration number with Kanto Local Finance Bureau" {...register('qiiRegistrationNo')} />
          </FormField>
        )}
      </div>

      {/* Non-QII Categories */}
      {!isQII && (
        <div className="card p-6 space-y-4">
          <h2 className="section-title">Non-QII Investor Category (FIEA Article 17-12, Para 1)</h2>
          <p className="text-sm text-gray-600">
            Please tick the applicable category(ies) under which you qualify as a "specially permitted business" investor. At least one category must apply.
          </p>
          <div className="space-y-2">
            {NON_QII_CATEGORIES.map(cat => (
              <label key={cat.value} className="checkbox-row flex items-start gap-3">
                <input type="checkbox" value={cat.value} className="checkbox-input mt-0.5"
                  {...register('nonQIICategory', {
                    validate: (v) => (v && v.length > 0) || 'At least one category must be selected'
                  })} />
                <div>
                  <p className="text-sm text-fgc-navy">{cat.label}</p>
                  {cat.note && <p className="text-xs text-amber-600 mt-0.5">{cat.note}</p>}
                </div>
              </label>
            ))}
          </div>
          {errors.nonQIICategory && <p className="field-error">{(errors.nonQIICategory as any).message}</p>}

          {needsFinancialAssets && (
            <FormField label="Investable Financial Assets (JPY)" hint="For categories requiring ¥100M or ¥10B threshold" required>
              <Input type="number" placeholder="0"
                {...register('investableFinancialAssets', { required: 'Required for selected category', valueAsNumber: true })} />
            </FormField>
          )}
          {needsSecuritiesAccount && (
            <label className="checkbox-row flex items-start gap-3">
              <input type="checkbox" className="checkbox-input mt-0.5" {...register('securitiesAccountOpenedOver1Year')} />
              <div>
                <p className="text-sm text-fgc-navy">I confirm that I opened a securities account more than one year ago</p>
                <p className="text-xs text-gray-500">Required for individual investors under the ¥100M threshold category</p>
              </div>
            </label>
          )}
        </div>
      )}

      {/* Transfer Restrictions */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Transfer Restrictions &amp; Covenants</h2>
        <div className="space-y-3 text-sm text-gray-700">
          {isQII ? (
            <ul className="list-disc list-inside space-y-2 text-xs leading-relaxed">
              <li>Interests of a QII investor may only be transferred to another QII who is not a Disqualified Investor.</li>
              <li>The investor covenants to maintain QII status while holding interests in the Co-Investment Scheme.</li>
              <li>The investor covenants to notify FGC immediately if QII status is revoked or lapses.</li>
            </ul>
          ) : (
            <ul className="list-disc list-inside space-y-2 text-xs leading-relaxed">
              <li>Interests of a non-QII investor may only be transferred as a single block of the entire holding to a single transferee who is not a Disqualified Investor.</li>
              <li>The transfer must not cause the total number of non-QII holders of Japanese persons to exceed 49.</li>
              <li>The investor covenants to notify FGC immediately upon obtaining QII status.</li>
            </ul>
          )}
        </div>
      </div>

      {/* Declarations */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Japan-Specific Declarations</h2>
        <div className="space-y-3">
          <label className="checkbox-row flex items-start gap-3">
            <input type="checkbox" className="checkbox-input mt-0.5"
              {...register('antiSocialForcesDeclaration', { required: 'This declaration is required' })} />
            <div>
              <p className="text-sm font-medium text-fgc-navy">Declaration — Not a Disqualified Investor / Anti-Social Forces</p>
              <p className="text-xs text-gray-500">
                I/We declare that I/we am/are not, and will not become, a "Disqualified Investor" (排除措置対象者) under the FIEA, including anti-social forces (暴力団等) as defined under Japanese law.
              </p>
            </div>
          </label>
          {errors.antiSocialForcesDeclaration && <p className="field-error">{errors.antiSocialForcesDeclaration.message}</p>}

          <label className="checkbox-row flex items-start gap-3">
            <input type="checkbox" className="checkbox-input mt-0.5"
              {...register('capitalNotCriminalProceeds', { required: 'This declaration is required' })} />
            <div>
              <p className="text-sm font-medium text-fgc-navy">Declaration — Capital Not Criminal Proceeds</p>
              <p className="text-xs text-gray-500">
                The capital contribution and any other payments required under the Agreement are not criminal proceeds or regulated under the Act on Punishment of Organized Crimes and Control of Crime Proceeds (Act No. 136 of 1999) or the Narcotics Special Provisions Act (Act No. 94 of 1991). I/We promise to immediately report to FGC if these regulations become applicable.
              </p>
            </div>
          </label>
          {errors.capitalNotCriminalProceeds && <p className="field-error">{errors.capitalNotCriminalProceeds.message}</p>}

          <label className="checkbox-row flex items-start gap-3">
            <input type="checkbox" className="checkbox-input mt-0.5"
              {...register('japanImportantMattersExplained', { required: 'Required' })} />
            <div>
              <p className="text-sm font-medium text-fgc-navy">Receipt of Important Matters Document</p>
              <p className="text-xs text-gray-500">
                I/We confirm that I/we have received from FGC a sufficient explanation of important matters pursuant to Article 4(1) of the Act on Provision of Financial Services, including the risk of loss of principal in connection with contribution to the Co-Investment Scheme, and a document stating such important matters.
              </p>
            </div>
          </label>
          {errors.japanImportantMattersExplained && <p className="field-error">{errors.japanImportantMattersExplained.message}</p>}

          <label className="checkbox-row flex items-start gap-3">
            <input type="checkbox" className="checkbox-input mt-0.5"
              {...register('japanIdentityDocumentsCorrect', { required: 'Required' })} />
            <div>
              <p className="text-sm font-medium text-fgc-navy">Identity Document Accuracy Declaration</p>
              <p className="text-xs text-gray-500">
                The matters stated in the investor's certificate of registered incorporation matters (or other identification document) presented to FGC pursuant to Article 4(1) of the Act concerning Prevention of Transfer of Criminal Proceeds (Act No. 22 of 2007) and Articles 6 and 7 of its Enforcement Ordinance are correct.
              </p>
            </div>
          </label>
          {errors.japanIdentityDocumentsCorrect && <p className="field-error">{errors.japanIdentityDocumentsCorrect.message}</p>}
        </div>
      </div>
    </StepLayout>
  )
}
