import React from 'react'
import { useForm } from 'react-hook-form'
import { useOnboarding } from '../../context/OnboardingContext'
import { StepLayout } from '../common/StepLayout'
import { FormField, Input } from '../common/FormField'
import type { TaxOffencesQuestionnaire } from '../../types'
import { AlertTriangle, Info } from 'lucide-react'

interface AMLFormValues {
  bankName: string
  bankAddress: string
  bankSwiftOrAba: string
  ibanOrSortCode?: string
  correspondentBankName?: string
  correspondentBankAddress?: string
  correspondentAccountOrSwift?: string
  beneficiaryAccountName: string
  beneficiaryAccountNumber: string
}

export function AMLKYCStep() {
  const { data, updateData, goNext } = useOnboarding()
  const isIndividual = data.investorType === 'individual'
  const existing = isIndividual ? data.individual : data.entity
  const bankDetails = (existing as any)?.bankDetails ?? {}

  const { register, handleSubmit, formState: { errors } } = useForm<AMLFormValues>({
    defaultValues: bankDetails,
  })

  const onSubmit = (values: AMLFormValues) => {
    const patch = { bankDetails: values }
    if (isIndividual) {
      updateData({ individual: { ...data.individual, ...patch } as any })
    } else {
      updateData({ entity: { ...data.entity, ...patch } as any })
    }
    goNext()
  }

  return (
    <StepLayout
      title="AML / KYC Details — Section A (Schedule 3)"
      subtitle="Provide your bank account details for subscription proceeds and distributions. FGC requires full SWIFT details to comply with Anti-Money Laundering legislation."
      onNext={handleSubmit(onSubmit)}
    >
      <div className="alert-info text-xs">
        <Info className="w-4 h-4 inline mr-1" />
        <strong>SWIFT Payment Requirement:</strong> When sending a wire payment through the international SWIFT system, the Investor is required to complete both the "Ordering Customer" (field 50) and the "Ordering Institution" (field 52D) in order for FGC to comply with the Anti-Money Laundering Legislation and properly identify the source of funds.
      </div>

      {/* Bank Details */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Bank Account Wire Details</h2>
        <p className="text-xs text-gray-500">
          Please provide the bank account from which subscription proceeds will be paid to FGC and to which any amounts from the investment will be returned, unless FGC is notified otherwise.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Bank Name" required error={errors.bankName?.message}>
            <Input placeholder="Name of bank" {...register('bankName', { required: 'Required' })} error={!!errors.bankName} />
          </FormField>
          <FormField label="Bank Address" required error={errors.bankAddress?.message}>
            <Input placeholder="Full bank address" {...register('bankAddress', { required: 'Required' })} error={!!errors.bankAddress} />
          </FormField>
          <FormField label="Bank SWIFT / ABA Number" required error={errors.bankSwiftOrAba?.message}>
            <Input placeholder="SWIFT BIC or ABA routing number"
              {...register('bankSwiftOrAba', { required: 'Required' })} error={!!errors.bankSwiftOrAba} />
          </FormField>
          <FormField label="IBAN / Sort Code (if applicable)">
            <Input placeholder="IBAN or sort code" {...register('ibanOrSortCode')} />
          </FormField>
          <FormField label="Correspondent Bank Name">
            <Input placeholder="Name of correspondent bank (if applicable)" {...register('correspondentBankName')} />
          </FormField>
          <FormField label="Correspondent Bank Address">
            <Input placeholder="Address of correspondent bank" {...register('correspondentBankAddress')} />
          </FormField>
          <FormField label="Correspondent Bank Account # / SWIFT">
            <Input placeholder="Account number or SWIFT" {...register('correspondentAccountOrSwift')} />
          </FormField>
        </div>
        <div className="border-t border-gray-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Beneficiary Account Name" required error={errors.beneficiaryAccountName?.message}
            hint="Must match the investor name exactly">
            <Input placeholder="Account holder name (same as investor name)"
              {...register('beneficiaryAccountName', { required: 'Required' })} error={!!errors.beneficiaryAccountName} />
          </FormField>
          <FormField label="Beneficiary Account Number" required error={errors.beneficiaryAccountNumber?.message}>
            <Input placeholder="Bank account number"
              {...register('beneficiaryAccountNumber', { required: 'Required' })} error={!!errors.beneficiaryAccountNumber} />
          </FormField>
        </div>
      </div>

      {/* Proceed to Tax Offences */}
      <div className="alert-info text-sm">
        The following page will contain the <strong>Designated Tax Offences Questionnaire (Schedule 4)</strong>, as required under the Corruption, Drug Trafficking and Other Serious Crimes (Confiscation of Benefits) Act 1992 (CDSA) and MAS Notice SFA04-N02.
      </div>
    </StepLayout>
  )
}

// ─── Tax Offences Questionnaire ───────────────────────────────────────────────

type YesNo = boolean | null

interface TaxQ {
  key: keyof TaxOffencesQuestionnaire
  label: string
}

const INCOME_TAX_QUESTIONS: TaxQ[] = [
  { key: 'incomeTaxOmission', label: 'Omitted from a return any income which ought to have been included?' },
  { key: 'incomeTaxFalseStatement', label: 'Made any false statement or entry in any return to any tax authority?' },
  { key: 'incomeTaxFalseAnswer', label: 'Given any false answer (verbal or written) to any question by any tax authority?' },
  { key: 'incomeTaxFalseNotification', label: 'Made false statement in any notification regarding understatement or omission of income (where no return required)?' },
  { key: 'incomeTaxFailureToNotify', label: 'Failed to notify tax authority of understatement or omission of income (where duty to notify exists)?' },
  { key: 'incomeTaxFalseBooks', label: 'Prepared, maintained, or authorized preparation of any false books of account or records?' },
  { key: 'incomeTaxFraud', label: 'Made use of any fraud, art or contrivance, or authorized such use?' },
]

const CONSUMPTION_TAX_QUESTIONS: TaxQ[] = [
  { key: 'consumptionTaxOmission', label: 'Omitted or understated output tax, or overstated input tax in any return?' },
  { key: 'consumptionTaxFalseStatement', label: 'Made any false statement or entry in any return, claim or application?' },
  { key: 'consumptionTaxFalseAnswer', label: 'Given any false answer (verbal or written) to any tax authority?' },
  { key: 'consumptionTaxFalseBooks', label: 'Prepared, maintained, or authorized preparation of any false books of account or records?' },
  { key: 'consumptionTaxFraud', label: 'Made use of any fraud, art or contrivance (including manipulation of computer data)?' },
  { key: 'consumptionTaxRefundFraud', label: 'Caused or attempted to cause refund of any amount in excess of what is properly refundable?' },
  { key: 'consumptionTaxFalseInfo', label: 'Provided information to induce any person to make a false determination of their Consumption Tax status?' },
]

export function TaxOffencesStep() {
  const { data, updateData, goNext } = useOnboarding()
  const isIndividual = data.investorType === 'individual'
  const existing = data.taxOffences ?? {} as Partial<TaxOffencesQuestionnaire>

  const [answers, setAnswers] = React.useState<Partial<TaxOffencesQuestionnaire>>(existing)

  const setAnswer = (key: keyof TaxOffencesQuestionnaire, value: boolean) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  const handleNext = () => {
    updateData({ taxOffences: answers as TaxOffencesQuestionnaire })
    goNext()
  }

  const hasYesAnswer = Object.values(answers).some(v => v === true)

  const YesNoRow = ({ q }: { q: TaxQ }) => (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 pr-4 text-xs text-gray-700 leading-relaxed">{q.label}</td>
      <td className="py-3 px-3 text-center">
        <label className="flex items-center justify-center gap-1 cursor-pointer">
          <input type="radio" name={q.key} value="yes" className="radio-input"
            checked={answers[q.key] === true}
            onChange={() => setAnswer(q.key, true)} />
          <span className="text-xs text-red-600 font-medium">Yes</span>
        </label>
      </td>
      <td className="py-3 px-3 text-center">
        <label className="flex items-center justify-center gap-1 cursor-pointer">
          <input type="radio" name={q.key} value="no" className="radio-input"
            checked={answers[q.key] === false}
            onChange={() => setAnswer(q.key, false)} />
          <span className="text-xs text-green-600 font-medium">No</span>
        </label>
      </td>
    </tr>
  )

  return (
    <StepLayout
      title="Designated Tax Offences Questionnaire — Schedule 4"
      subtitle="Under the CDSA and MAS Notice SFA04-N02, FGC is required to detect and deter proceeds from serious tax crimes. Please respond to each question."
      onNext={handleNext}
    >
      <div className="alert-warning text-xs">
        <AlertTriangle className="w-4 h-4 inline mr-1" />
        <strong>IMPORTANT:</strong> FGC will be relying on the accuracy and completeness of the statements made herein. FGC may in its sole discretion treat a failure to fully complete or return this questionnaire as grounds for declining the investor's subscription. If any answer is YES, FGC may require additional information and may file a Suspicious Transaction Report (STR) in Singapore.
      </div>

      {/* Part I — Income Tax */}
      <div className="card p-6">
        <h2 className="section-title">Part I — Income Tax Offences</h2>
        <p className="text-sm text-gray-600 mb-4">
          Has the Investor been (i) convicted by a court of law in any jurisdiction, and/or (ii) the subject of, or currently under any investigation by any tax authority, for any of the following (willfully with intent to evade Income Tax):
        </p>
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 text-xs font-semibold text-gray-600 pr-4">Question</th>
              <th className="text-center py-2 text-xs font-semibold text-red-600 px-3 w-16">YES</th>
              <th className="text-center py-2 text-xs font-semibold text-green-600 px-3 w-16">NO</th>
            </tr>
          </thead>
          <tbody>
            {INCOME_TAX_QUESTIONS.map(q => <YesNoRow key={q.key} q={q} />)}
          </tbody>
        </table>
      </div>

      {/* Part I — Consumption Tax */}
      <div className="card p-6">
        <h2 className="section-title">Part I — Consumption Tax Offences</h2>
        <p className="text-sm text-gray-600 mb-4">
          Has the Investor been convicted or is under investigation for any of the following (willfully with intent to evade Consumption Tax):
        </p>
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 text-xs font-semibold text-gray-600 pr-4">Question</th>
              <th className="text-center py-2 text-xs font-semibold text-red-600 px-3 w-16">YES</th>
              <th className="text-center py-2 text-xs font-semibold text-green-600 px-3 w-16">NO</th>
            </tr>
          </thead>
          <tbody>
            {CONSUMPTION_TAX_QUESTIONS.map(q => <YesNoRow key={q.key} q={q} />)}
          </tbody>
        </table>
      </div>

      {/* Part II — Non-individual only */}
      {!isIndividual && (
        <div className="card p-6 space-y-4">
          <h2 className="section-title">Part II — Authorised Signatory's Personal Knowledge (Non-Individual Investors)</h2>
          <p className="text-sm text-gray-600">
            Do you (the authorized signatory) have any personal knowledge of, or are there reasonable grounds to suspect, that the Investor has committed any of the matters in Part I?
          </p>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="partII" className="radio-input"
                checked={answers.authorisedSignatoryPersonalKnowledge === true}
                onChange={() => setAnswers(prev => ({ ...prev, authorisedSignatoryPersonalKnowledge: true }))} />
              <span className="text-sm font-medium text-red-600">YES</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="partII" className="radio-input"
                checked={answers.authorisedSignatoryPersonalKnowledge === false}
                onChange={() => setAnswers(prev => ({ ...prev, authorisedSignatoryPersonalKnowledge: false }))} />
              <span className="text-sm font-medium text-green-600">NO</span>
            </label>
          </div>
          {answers.authorisedSignatoryPersonalKnowledge && (
            <FormField label="Please indicate which matter is referred to:">
              <textarea className="field-input resize-none" rows={3}
                value={answers.taxOffencesDetails ?? ''}
                onChange={e => setAnswers(prev => ({ ...prev, taxOffencesDetails: e.target.value }))} />
            </FormField>
          )}
        </div>
      )}

      {hasYesAnswer && (
        <div className="alert-error">
          <AlertTriangle className="w-4 h-4 inline mr-1" />
          <strong>Action Required:</strong> You have answered YES to one or more questions. FGC will contact you to obtain additional information and/or documentation. FGC will determine whether to accept your subscription and whether an STR must be filed in Singapore. Please provide details in the space below.
          <textarea className="field-input mt-3 resize-none" rows={4}
            placeholder="Please provide details of the matter(s) answered YES above..."
            value={answers.taxOffencesDetails ?? ''}
            onChange={e => setAnswers(prev => ({ ...prev, taxOffencesDetails: e.target.value }))} />
        </div>
      )}

      <div className="alert-info text-xs">
        <strong>FOR SO LONG AS THE INVESTOR DIRECTLY OR BENEFICIALLY OWNS INTERESTS IN THE FUND,</strong> the investor agrees to notify FGC immediately in writing if any of the information contained in this questionnaire becomes inaccurate and to provide corrected/updated information to FGC immediately.
      </div>
    </StepLayout>
  )
}
