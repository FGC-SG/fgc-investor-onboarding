import React from 'react'
import { useForm } from 'react-hook-form'
import { useOnboarding } from '../../context/OnboardingContext'
import { StepLayout } from '../common/StepLayout'
import { FormField, Input } from '../common/FormField'
import type { Declarations } from '../../types'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

export function DeclarationsStep() {
  const { data, updateData, goNext } = useOnboarding()
  const isIndividual = data.investorType === 'individual'
  const isMAS = data.jurisdiction === 'MAS' || data.jurisdiction === 'BOTH'
  const isJapan = data.jurisdiction === 'FSA' || data.jurisdiction === 'BOTH'
  const existing = data.declarations ?? {} as Partial<Declarations>

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Declarations>({
    defaultValues: existing as Declarations,
  })

  const onSubmit = (values: Declarations) => {
    updateData({ declarations: values })
    goNext()
  }

  const aiOptIn = watch('aiOptInConsent')

  return (
    <StepLayout
      title="Declarations & Consents"
      subtitle="Please review each declaration carefully and provide your authorisation. By proceeding, you confirm all information provided is true, accurate and complete."
      onNext={handleSubmit(onSubmit)}
      nextLabel="Submit Application"
    >
      <div className="alert-warning">
        <AlertTriangle className="w-4 h-4 inline mr-1" />
        <strong>Please read carefully.</strong> By signing / submitting this onboarding form, you confirm that all information provided is accurate, and that you understand and agree to the terms set out below and in the full Subscription Agreement, Limited Partnership Agreement, and Privacy Notice.
      </div>

      {/* MAS AI Opt-In Signature Block */}
      {isMAS && (
        <div className="card p-6 space-y-4">
          <h2 className="section-title">Accredited Investor Opt-In — Consent Form (Schedule 2B)</h2>
          <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 leading-relaxed space-y-2">
            <p>
              I/We, the undersigned, have read the Notice and the Annex to which this Form forms part, and I/we acknowledge and understand fully the contents of the Notice and the Annex.
            </p>
            <p>
              I/We know and understand the consequences of consenting to being treated by FGC and the Funds as an accredited investor for the purposes of applicable Consent Provisions. I/We understand and acknowledge that the consent provided in this Form will apply in respect of all investments and/or proposed investments made by me/us in all existing and/or new Funds managed by FGC.
            </p>
            <p>
              I/We understand that I/we may at any time withdraw my/our consent given under this Form, upon which, I/we will no longer be treated as an accredited investor for purposes of the applicable Consent Provisions only after all my/our obligations under the terms of the Funds have been fully discharged.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-fgc-navy">I/We hereby (please indicate your consent):</p>
            <label className={clsx('checkbox-row flex items-start gap-3', aiOptIn === true && 'border-green-300 bg-green-50')}>
              <input type="radio" value="true" className="radio-input mt-0.5"
                {...register('aiOptInConsent', { required: 'Please indicate your consent' })} />
              <div>
                <p className="text-sm font-semibold text-green-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Consent to being treated as an Accredited Investor
                </p>
                <p className="text-xs text-gray-500">I/We consent to being treated by FGC and the Funds as an accredited investor for the purposes of the applicable Consent Provisions.</p>
              </div>
            </label>
            <label className={clsx('checkbox-row flex items-start gap-3', aiOptIn === false && 'border-red-300 bg-red-50')}>
              <input type="radio" value="false" className="radio-input mt-0.5"
                {...register('aiOptInConsent', { required: 'Please indicate your consent' })} />
              <div>
                <p className="text-sm font-semibold text-red-700">Do NOT consent to being treated as an Accredited Investor</p>
                <p className="text-xs text-gray-500">Note: Due to the clientele restrictions of FGC, not consenting will result in inability to invest in the Funds.</p>
              </div>
            </label>
          </div>
          {errors.aiOptInConsent && <p className="field-error">{errors.aiOptInConsent.message}</p>}

          {/* Signatory Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <FormField label={isIndividual ? "Signature Name" : "Authorised Signatory Name"} required>
              <Input {...register('aiOptInSignatoryName', { required: 'Required' })} />
            </FormField>
            {!isIndividual && (
              <FormField label="Designation / Position">
                <Input {...register('aiOptInSignatoryDesignation')} />
              </FormField>
            )}
            <FormField label="Date of Signature" required>
              <Input type="date" {...register('aiOptInDate', { required: 'Required' })} />
            </FormField>
          </div>
        </div>
      )}

      {/* Information Accuracy Declaration */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Information Accuracy Declaration (Schedule 3)</h2>
        <div className="bg-gray-50 rounded p-4 text-xs text-gray-700 leading-relaxed">
          I/We hereby certify that the information given in this Schedule and in this Agreement is true, accurate and complete. I/We confirm that I/we will, if requested to do so by FGC, provide further information and/or documents to verify this information. I/We agree to promptly notify FGC of any change with respect to the foregoing.
        </div>
        <label className="checkbox-row flex items-start gap-3">
          <input type="checkbox" className="checkbox-input mt-0.5"
            {...register('informationAccurate', { required: 'This declaration is required' })} />
          <span className="text-sm font-medium text-fgc-navy">
            I/We certify that all information provided is true, accurate and complete, and agree to notify FGC promptly of any material changes.
          </span>
        </label>
        {errors.informationAccurate && <p className="field-error">{errors.informationAccurate.message}</p>}
      </div>

      {/* Privacy Notice — Schedule 6 */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Privacy Notice — Personal Data Protection Act (Schedule 6)</h2>
        <div className="bg-gray-50 rounded p-4 text-xs text-gray-700 leading-relaxed space-y-2">
          <p>
            By making an investment in the Fund, you provide FGC with certain personal information ("Investor Data") including name, residential address, email, contact details, nationality, DOB, tax identification, correspondence records, passport number, bank account details, and details relating to your investment activity.
          </p>
          <p>
            FGC, as data controller under the PDPA, may collect, store and use Investor Data for: (i) performance of rights and obligations under the Agreement; (ii) compliance with legal and regulatory obligations (including AML/CFT and FATCA/CRS requirements); and/or (iii) legitimate interests of FGC.
          </p>
          <p>
            FGC may be legally obliged to share Investor Data with regulatory authorities (including MAS and IRAS) who may exchange this with foreign authorities including tax authorities. Investor Data may be transferred outside Singapore in accordance with the PDPA.
          </p>
          <p>
            Queries on data protection rights should be directed to FGC at 6 Temasek Boulevard, #29-04, Suntec Tower Four, Singapore 038986 / chia@fgcsg.com.
          </p>
        </div>
        <label className="checkbox-row flex items-start gap-3">
          <input type="checkbox" className="checkbox-input mt-0.5"
            {...register('privacyNoticeRead', { required: 'You must acknowledge the Privacy Notice' })} />
          <span className="text-sm font-medium text-fgc-navy">
            I/We have read, understood and acknowledge the Fund Privacy Notice (Schedule 6) and consent to FGC's use and processing of Investor Data as described above.
          </span>
        </label>
        {errors.privacyNoticeRead && <p className="field-error">{errors.privacyNoticeRead.message}</p>}
      </div>

      {/* Japan Specific */}
      {isJapan && (
        <div className="card p-6 space-y-4">
          <h2 className="section-title">Japan-Specific Confirmations</h2>
          <div className="space-y-3">
            <label className="checkbox-row flex items-start gap-3">
              <input type="checkbox" className="checkbox-input mt-0.5"
                {...register('japanImportantMattersExplained', { required: 'Required for Japan investors' })} />
              <div>
                <p className="text-sm font-medium text-fgc-navy">Receipt of Important Matters Document (Act on Provision of Financial Services Article 4(1))</p>
                <p className="text-xs text-gray-500">I/We confirm receipt of sufficient explanation of important matters, including risk of loss of principal, in connection with the Co-Investment Scheme.</p>
              </div>
            </label>
            {errors.japanImportantMattersExplained && <p className="field-error">{errors.japanImportantMattersExplained.message}</p>}

            <label className="checkbox-row flex items-start gap-3">
              <input type="checkbox" className="checkbox-input mt-0.5"
                {...register('japanCriminalProceedsDeclaration', { required: 'Required' })} />
              <div>
                <p className="text-sm font-medium text-fgc-navy">Declaration — Capital and Payments Not Criminal Proceeds</p>
                <p className="text-xs text-gray-500">Capital contribution and all payments under this Agreement are not criminal proceeds regulated under the Act on Punishment of Organized Crimes (Act No. 136 of 1999) or the Narcotics Special Provisions Act (Act No. 94 of 1991).</p>
              </div>
            </label>
            {errors.japanCriminalProceedsDeclaration && <p className="field-error">{errors.japanCriminalProceedsDeclaration.message}</p>}

            <label className="checkbox-row flex items-start gap-3">
              <input type="checkbox" className="checkbox-input mt-0.5"
                {...register('japanIdentityDocumentsCorrect', { required: 'Required' })} />
              <div>
                <p className="text-sm font-medium text-fgc-navy">Identity Document Accuracy</p>
                <p className="text-xs text-gray-500">The matters stated in the investor's certificate of registered incorporation matters / identification document presented to FGC under Articles 6 and 7 of the Enforcement Ordinance of the Act on Prevention of Transfer of Criminal Proceeds are correct.</p>
              </div>
            </label>
            {errors.japanIdentityDocumentsCorrect && <p className="field-error">{errors.japanIdentityDocumentsCorrect.message}</p>}
          </div>
        </div>
      )}

      {/* General Terms */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Agreement to Terms</h2>
        <label className="checkbox-row flex items-start gap-3">
          <input type="checkbox" className="checkbox-input mt-0.5"
            {...register('termsAccepted', { required: 'You must accept the terms' })} />
          <span className="text-sm font-medium text-fgc-navy">
            I/We have read, understood and agree to all terms and conditions of the Subscription Agreement, Limited Partnership Agreement (if applicable), and all schedules attached thereto, including the representations and warranties made as an Accredited Investor / Institutional Investor.
          </span>
        </label>
        {errors.termsAccepted && <p className="field-error">{errors.termsAccepted.message}</p>}
      </div>
    </StepLayout>
  )
}
