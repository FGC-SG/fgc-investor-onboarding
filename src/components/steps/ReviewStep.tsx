import React, { useState } from 'react'
import { useOnboarding, STEP_LABELS } from '../../context/OnboardingContext'
import { StepLayout } from '../common/StepLayout'
import type { StepId } from '../../types'
import { Edit2, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

function Section({ title, stepId, children }: { title: string; stepId: StepId; children: React.ReactNode }) {
  const { goToStep } = useOnboarding()
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-fgc-navy/5 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-fgc-navy">{title}</h3>
        <button type="button" onClick={() => goToStep(stepId)}
          className="flex items-center gap-1 text-xs text-fgc-mid hover:text-fgc-blue transition-colors">
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </button>
      </div>
      <div className="px-5 py-4 text-xs space-y-2 text-gray-700">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 flex-shrink-0 w-44">{label}:</span>
      <span className="font-medium text-fgc-navy">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}</span>
    </div>
  )
}

function Pill({ text, color = 'blue' }: { text: string; color?: 'blue' | 'green' | 'amber' | 'red' }) {
  return <span className={`badge-${color} mr-1 mb-1`}>{text}</span>
}

export function ReviewStep() {
  const { data, updateData, goNext } = useOnboarding()
  const [loading, setLoading] = useState(false)

  const isIndividual = data.investorType === 'individual'
  const inv = isIndividual ? data.individual : data.entity
  const isMAS = data.jurisdiction === 'MAS' || data.jurisdiction === 'BOTH'
  const isJapan = data.jurisdiction === 'FSA' || data.jurisdiction === 'BOTH'

  const INVESTOR_TYPE_LABELS: Record<string, string> = {
    individual: 'Individual',
    corporate_sg: 'Private Company (Singapore)',
    corporate_overseas: 'Private Company (Overseas)',
    listed_company: 'Listed Company / SOE',
    regulated_institution: 'Regulated Institution (Non-Bank)',
    regulated_bank: 'Regulated Bank',
    fund: 'Pooled Investment Vehicle / Fund',
    swf: 'Government / Sovereign Wealth Fund',
    trust: 'Trust',
    partnership: 'Partnership',
    npo: 'Charity / NPO / Club / Society',
    nominee: 'Nominee / Omnibus Account',
  }

  const handleSubmit = async () => {
    setLoading(true)
    // Simulate submission
    await new Promise(r => setTimeout(r, 1500))
    const refNo = `FGC-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    updateData({
      submittedAt: new Date().toISOString(),
      referenceNo: refNo,
      status: 'submitted',
    })
    setLoading(false)
    goNext()
  }

  const amlRisk = data.amlRisk

  return (
    <StepLayout
      title="Review & Submit"
      subtitle="Please review all information carefully before submitting. You can click 'Edit' on any section to make changes."
      onNext={handleSubmit}
      nextLabel="Submit Application"
      loading={loading}
    >
      {/* Summary header */}
      <div className={clsx(
        'card p-5 flex items-center gap-4',
        amlRisk?.overallRisk === 'high' ? 'border-red-300 bg-red-50' :
        amlRisk?.overallRisk === 'medium' ? 'border-amber-300 bg-amber-50' : ''
      )}>
        <div className="flex-1">
          <p className="text-sm font-semibold text-fgc-navy">{INVESTOR_TYPE_LABELS[data.investorType]}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Jurisdiction: {data.jurisdiction === 'BOTH' ? 'Singapore (MAS) & Japan (FSA)' : data.jurisdiction === 'MAS' ? 'Singapore (MAS)' : 'Japan (FSA)'}
            {data.fundName && ` · Fund: ${data.fundName}`}
          </p>
        </div>
        {amlRisk?.overallRisk && (
          <div className="text-right">
            <p className="text-xs text-gray-500">AML Risk Rating</p>
            <span className={clsx(
              'text-sm font-bold',
              amlRisk.overallRisk === 'high' ? 'text-red-600' :
              amlRisk.overallRisk === 'medium' ? 'text-amber-600' : 'text-green-600'
            )}>
              {amlRisk.overallRisk.toUpperCase()} ({amlRisk.overallRiskCode ?? amlRisk.overallRisk.toUpperCase()[0].repeat(3)})
            </span>
          </div>
        )}
      </div>

      {/* Identity */}
      <Section title={isIndividual ? 'Personal Identity' : 'Entity Identity'} stepId="identity">
        {isIndividual && data.individual && (
          <>
            <Row label="Full Name" value={data.individual.fullName} />
            <Row label="Date of Birth" value={data.individual.dateOfBirth} />
            <Row label="Nationality" value={data.individual.nationality} />
            <Row label="ID Type" value={data.individual.idType} />
            <Row label="ID Number" value={data.individual.idNumber} />
            <Row label="Email" value={data.individual.email} />
            <Row label="Phone" value={data.individual.phone} />
            <Row label="Employment" value={data.individual.employmentStatus} />
            <Row label="Employer" value={data.individual.employerName} />
            <Row label="Is PEP" value={data.individual.isPEP} />
            {(data.individual.sourceOfWealth ?? []).length > 0 && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-44">Source of Wealth:</span>
                <div>{(data.individual.sourceOfWealth ?? []).map(s => <Pill key={s} text={s} />)}</div>
              </div>
            )}
          </>
        )}
        {!isIndividual && data.entity && (
          <>
            <Row label="Legal Name" value={(data.entity as any).legalName} />
            <Row label="Registration No." value={(data.entity as any).registrationNo} />
            <Row label="Place of Incorporation" value={(data.entity as any).placeOfIncorporation} />
            <Row label="Date of Incorporation" value={(data.entity as any).dateOfIncorporation} />
            <Row label="Legal Form" value={(data.entity as any).legalForm} />
            <Row label="Email" value={(data.entity as any).email} />
            <Row label="Regulator" value={(data.entity as any).regulatorName} />
            <Row label="Listed Exchange" value={(data.entity as any).exchangeListed} />
            <Row label="Industry" value={(data.entity as any).industryType} />
          </>
        )}
      </Section>

      {/* MAS Classification */}
      {isMAS && (
        <Section title="MAS Investor Classification" stepId="mas_classification">
          <Row label="Classification" value={(inv as any)?.masClassification?.replace(/_/g, ' ')} />
          <Row label="AI Opt-In Consent" value={(inv as any)?.aiOptIn} />
          {data.individual?.netPersonalAssets && <Row label="Net Personal Assets (S$)" value={data.individual.netPersonalAssets.toLocaleString()} />}
          {data.individual?.financialAssets && <Row label="Net Financial Assets (S$)" value={data.individual.financialAssets.toLocaleString()} />}
          {data.individual?.annualIncome && <Row label="Annual Income (S$)" value={data.individual.annualIncome.toLocaleString()} />}
        </Section>
      )}

      {/* Japan */}
      {isJapan && (
        <Section title="Japan FSA Qualification" stepId="japan_qualification">
          <Row label="Is QII" value={(inv as any)?.isQII} />
          <Row label="QII Registration No." value={(inv as any)?.qiiRegistrationNo} />
          {((inv as any)?.nonQIICategory ?? []).length > 0 && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-44">Non-QII Categories:</span>
              <div>{((inv as any)?.nonQIICategory ?? []).map((c: string) => <Pill key={c} text={c.replace(/_/g, ' ')} />)}</div>
            </div>
          )}
          <Row label="Anti-Social Forces Declaration" value={(inv as any)?.antiSocialForcesDeclaration} />
          <Row label="Capital Not Criminal Proceeds" value={(inv as any)?.capitalNotCriminalProceeds} />
        </Section>
      )}

      {/* Entity People */}
      {!isIndividual && data.entity && (
        <>
          <Section title="Directors & Officers" stepId="entity_people">
            <Row label="Directors" value={`${((data.entity as any).directors ?? []).length} director(s) provided`} />
            <Row label="Authorised Persons" value={`${((data.entity as any).authorisedPersons ?? []).length} authorised person(s) provided`} />
            <Row label="Connected Persons" value={`${((data.entity as any).connectedPersons ?? []).length} connected person(s) provided`} />
          </Section>
          <Section title="Beneficial Ownership" stepId="beneficial_ownership">
            <Row label="BO Exemption Applies" value={(data.entity as any).boExemptionApplies} />
            {!(data.entity as any).boExemptionApplies && (
              <>
                <Row label="Individual BOs" value={`${((data.entity as any).beneficialOwners ?? []).length} beneficial owner(s) identified`} />
                <Row label="Corporate Shareholders" value={`${((data.entity as any).corporateShareholders ?? []).length} corporate shareholder(s) identified`} />
              </>
            )}
          </Section>
        </>
      )}

      {/* AML / KYC */}
      <Section title="Bank Wire Details" stepId="aml_kyc">
        <Row label="Bank Name" value={(inv as any)?.bankDetails?.bankName} />
        <Row label="SWIFT / ABA" value={(inv as any)?.bankDetails?.bankSwiftOrAba} />
        <Row label="Beneficiary Account" value={(inv as any)?.bankDetails?.beneficiaryAccountName} />
        <Row label="Account Number" value={(inv as any)?.bankDetails?.beneficiaryAccountNumber} />
      </Section>

      {/* Tax Offences */}
      <Section title="Designated Tax Offences Questionnaire" stepId="tax_offences">
        {data.taxOffences ? (
          <>
            <Row label="Any YES answers" value={Object.values(data.taxOffences).some(v => v === true)} />
            {data.taxOffences.taxOffencesDetails && (
              <Row label="Details" value={data.taxOffences.taxOffencesDetails} />
            )}
          </>
        ) : (
          <p className="text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> Not yet completed
          </p>
        )}
      </Section>

      {/* CRS-FATCA */}
      <Section title="CRS / FATCA Self-Certification" stepId="crs_fatca">
        {isIndividual && data.crsFatcaIndividual ? (
          <>
            <Row label="Account Holder" value={data.crsFatcaIndividual.accountHolderName} />
            <Row label="US Citizen/Resident" value={data.crsFatcaIndividual.isUSCitizen} />
            <Row label="Declaration" value={data.crsFatcaIndividual.declaration} />
          </>
        ) : data.crsFatcaEntity ? (
          <>
            <Row label="Entity" value={data.crsFatcaEntity.legalName} />
            <Row label="FATCA Classification" value={data.crsFatcaEntity.fatcaClassification?.replace(/_/g, ' ')} />
            <Row label="CRS Classification" value={data.crsFatcaEntity.crsClassification?.replace(/_/g, ' ')} />
            <Row label="Declaration" value={data.crsFatcaEntity.declaration} />
          </>
        ) : (
          <p className="text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> Not yet completed
          </p>
        )}
      </Section>

      {/* Risk Profile */}
      <Section title="Investment Risk Profile" stepId="risk_profile">
        {data.investmentRisk ? (
          <>
            <Row label="Objective" value={data.investmentRisk.investmentObjective} />
            <Row label="Risk Tolerance" value={data.investmentRisk.riskTolerance?.replace(/_/g, ' ')} />
            <Row label="Horizon" value={data.investmentRisk.investmentHorizon} />
            <Row label="Est. Investment (USD)" value={data.investmentRisk.estimatedInvestmentAmountUSD?.toLocaleString()} />
            <Row label="AML Overall Risk" value={data.amlRisk?.overallRisk?.toUpperCase()} />
            <Row label="Screening Result" value={data.amlRisk?.screeningResult?.replace(/_/g, ' ')} />
          </>
        ) : (
          <p className="text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> Not yet completed
          </p>
        )}
      </Section>

      {/* Documents */}
      <Section title="Document Checklist" stepId="documents">
        {data.documents ? (
          <>
            <Row label="Required docs confirmed" value={`${data.documents.filter(d => d.required && d.uploaded).length} / ${data.documents.filter(d => d.required).length}`} />
            <Row label="Optional docs confirmed" value={`${data.documents.filter(d => !d.required && d.uploaded).length} / ${data.documents.filter(d => !d.required).length}`} />
          </>
        ) : (
          <p className="text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> Not yet completed
          </p>
        )}
      </Section>

      {/* Declarations */}
      <Section title="Declarations & Consents" stepId="declarations">
        {data.declarations ? (
          <>
            {isMAS && <Row label="AI Opt-In Consent" value={data.declarations.aiOptInConsent} />}
            <Row label="Information Accurate" value={data.declarations.informationAccurate} />
            <Row label="Privacy Notice Read" value={data.declarations.privacyNoticeRead} />
            <Row label="Terms Accepted" value={data.declarations.termsAccepted} />
            <Row label="Signatory Name" value={data.declarations.aiOptInSignatoryName} />
          </>
        ) : (
          <p className="text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> Not yet completed
          </p>
        )}
      </Section>

      <div className="alert-warning text-xs">
        <strong>IMPORTANT — Before submitting:</strong> By clicking "Submit Application", I/we represent and warrant that:
        (1) all information provided is true, accurate and complete;
        (2) I/we qualify as an Accredited Investor or Institutional Investor as indicated above;
        (3) I/we have read and agreed to the Privacy Notice, the terms of the Subscription Agreement, and all applicable schedules;
        (4) I/we understand that FGC will rely on the information provided herein in determining whether to accept this subscription;
        (5) I/we agree to notify FGC immediately of any material change to the information provided.
      </div>
    </StepLayout>
  )
}
