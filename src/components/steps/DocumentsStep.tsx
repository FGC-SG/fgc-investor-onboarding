import React, { useState } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import { StepLayout } from '../common/StepLayout'
import type { DocumentItem, InvestorType } from '../../types'
import { CheckCircle2, Circle, Upload, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

function getRequiredDocuments(investorType: InvestorType, isJapan: boolean): DocumentItem[] {
  const base: DocumentItem[] = []

  if (investorType === 'individual') {
    base.push(
      { id: 'id_doc', label: 'Certified copy of current valid government-issued ID / passport (showing photo, full name including aliases, DOB, nationality, ID number, name change doc if applicable)', required: true, uploaded: false },
      { id: 'proof_address', label: 'Proof of residential address (utility bill or bank statement — less than 3 months old, full name, no P.O. Box)', required: true, uploaded: false },
      { id: 'occupation_info', label: 'Information on occupation or business', required: true, uploaded: false },
      { id: 'source_of_funds', label: 'Source of funds for investment (signed letter or indicated on Agreement)', required: true, uploaded: false },
      { id: 'ai_evidence', label: 'Evidence of AI status (latest bank statement, income statement, or audited financial statement)', required: true, uploaded: false },
      { id: 'subscription_agreement', label: 'Signed Subscription Agreement', required: true, uploaded: false },
      { id: 'ai_opt_in', label: 'Accredited Investor Opt-In Form (Schedule 2B)', required: true, uploaded: false },
      { id: 'crs_fatca_indv', label: 'Individual CRS/FATCA Self-Certification Form', required: true, uploaded: false },
    )
  } else if (['corporate_sg', 'corporate_overseas', 'listed_company', 'regulated_institution', 'regulated_bank'].includes(investorType)) {
    base.push(
      { id: 'cert_incorporation', label: 'Certificate of Incorporation / Business Registration Certificate (and certificate on change of name if applicable)', required: true, uploaded: false },
      { id: 'moa', label: 'Current Memorandum and Articles of Association / Constitution', required: true, uploaded: false },
      { id: 'register_directors', label: 'Register of Directors or letter from lawyer/accountant/company secretary confirming directors', required: true, uploaded: false },
      { id: 'shareholder_register', label: 'Register of Members / Shareholders (or letter confirming beneficial owners with 10%+ interest)', required: true, uploaded: false },
      { id: 'company_search', label: 'Company search (e.g. ACRA search or equivalent) showing live status', required: false, uploaded: false },
      { id: 'board_resolution', label: 'Signed Board Resolution / confirmation to make investment and conferring authority on signatories', required: true, uploaded: false },
      { id: 'authorised_sig_list', label: 'Authorised Signature List with specimen signatures (full names, aliases, contact numbers)', required: true, uploaded: false },
      { id: 'director_passports', label: 'Certified passport/ID of all directors (including MD), authorised signatories, and beneficial owners (10%+)', required: true, uploaded: false },
      { id: 'director_proof_address', label: 'Proof of address for all directors, signatories, and beneficial owners (less than 3 months old)', required: true, uploaded: false },
      { id: 'audited_financials', label: 'Most recent audited balance sheet / financial statements (unaudited if not required to audit)', required: true, uploaded: false },
      { id: 'source_of_funds', label: 'Confirmation of source of funds for investment (signed letter or indicated on Agreement)', required: true, uploaded: false },
      { id: 'subscription_agreement', label: 'Signed Subscription Agreement', required: true, uploaded: false },
      { id: 'crs_fatca_entity', label: 'Entity CRS/FATCA Self-Certification Form', required: true, uploaded: false },
      { id: 'shareholding_chart', label: 'Shareholding Chart on company letterhead', required: true, uploaded: false },
    )
    if (investorType === 'listed_company') {
      base.push({ id: 'exchange_evidence', label: 'Evidence that entity is listed on a Recognised Stock Exchange (Bloomberg / Reuters / stock exchange profile)', required: true, uploaded: false })
    }
    if (investorType === 'regulated_institution' || investorType === 'regulated_bank') {
      base.push({ id: 'regulator_evidence', label: 'Evidence that institution is on the list of authorised/supervised financial institutions in the jurisdiction (extract from regulator website)', required: true, uploaded: false })
    }
    if (investorType === 'regulated_bank') {
      base.push(
        { id: 'bank_management', label: 'Details of the bank management and major business activities', required: true, uploaded: false },
        { id: 'bank_aml_procedures', label: "Details of the bank's AML/CFT prevention efforts and procedures", required: true, uploaded: false },
      )
    }
    if (investorType === 'corporate_overseas') {
      base.push({ id: 'cert_incumbency', label: 'Certificate of Incumbency / Good standing letter (from lawyer/accountant/company secretary) — or Director Declaration (DD) if unavailable', required: true, uploaded: false })
    }
  } else if (investorType === 'fund') {
    base.push(
      { id: 'constitutive_doc', label: 'Current Memorandum & Articles of Association / Constitution or other constitutive document', required: true, uploaded: false },
      { id: 'offering_doc', label: 'Prospectus / Offering Document or equivalent', required: true, uploaded: false },
      { id: 'aml_confirmation', label: 'Written confirmation that underlying investors have been identified and AML checks carried out to FATF standards', required: true, uploaded: false },
      { id: 'board_resolution', label: 'Signed Board Resolution / confirmation to make investment', required: true, uploaded: false },
      { id: 'authorised_sig_list', label: 'Authorised Signature List with specimen signatures', required: true, uploaded: false },
      { id: 'signatory_passports', label: 'Certified passport/ID of all authorised signatories', required: true, uploaded: false },
      { id: 'signatory_addresses', label: 'Proof of address of all authorised signatories (less than 3 months old)', required: true, uploaded: false },
      { id: 'audited_financials', label: 'Most recent audited balance sheet / financial statements', required: true, uploaded: false },
      { id: 'source_of_funds', label: 'Confirmation of source of funds (signed letter or indicated on Agreement)', required: true, uploaded: false },
      { id: 'subscription_agreement', label: 'Signed Subscription Agreement', required: true, uploaded: false },
      { id: 'crs_fatca_entity', label: 'Entity CRS/FATCA Self-Certification Form', required: true, uploaded: false },
    )
  } else if (investorType === 'trust') {
    base.push(
      { id: 'trust_deed', label: 'Trust Deed (including relevant deed of retirement and appointment of trustees, if applicable)', required: true, uploaded: false },
      { id: 'regulator_extract', label: 'Extract of authorisation from relevant regulator (for regulated trustees)', required: false, uploaded: false },
      { id: 'aml_confirmation', label: 'Written confirmation that AML checks to FATF standards carried out on settlors, protector (if any) and main beneficiaries (regulated trustee)', required: false, uploaded: false },
      { id: 'authorised_sig_list', label: 'Authorised Signature List with specimen signatures', required: true, uploaded: false },
      { id: 'signatory_passports', label: 'Certified passport/ID of all authorised signatories and trustee principals', required: true, uploaded: false },
      { id: 'signatory_addresses', label: 'Proof of address of all authorised signatories (less than 3 months old)', required: true, uploaded: false },
      { id: 'source_of_funds', label: 'Confirmation of source of funds (signed letter or Agreement)', required: true, uploaded: false },
      { id: 'controlling_persons', label: 'Details of settlor, trustee, protector, beneficiaries and any natural person with ultimate control', required: true, uploaded: false },
      { id: 'subscription_agreement', label: 'Signed Subscription Agreement', required: true, uploaded: false },
      { id: 'crs_fatca_entity', label: 'Entity CRS/FATCA Self-Certification Form', required: true, uploaded: false },
    )
  } else if (investorType === 'swf') {
    base.push(
      { id: 'legal_mandate', label: 'Legal mandate / charter / establishing law documentation', required: true, uploaded: false },
      { id: 'govt_ownership', label: 'Documentary evidence of government ownership / central government backing', required: true, uploaded: false },
      { id: 'authorised_sig_list', label: 'Authorised Signature List with specimen signatures', required: true, uploaded: false },
      { id: 'signatory_passports', label: 'Certified passport/ID of authorised signatories', required: true, uploaded: false },
      { id: 'source_of_funds', label: 'Confirmation of source of funds', required: true, uploaded: false },
      { id: 'subscription_agreement', label: 'Signed Subscription Agreement', required: true, uploaded: false },
      { id: 'crs_fatca_entity', label: 'Entity CRS/FATCA Self-Certification Form', required: true, uploaded: false },
    )
  } else if (investorType === 'partnership') {
    base.push(
      { id: 'partnership_deed', label: 'Partnership Deed / Agreement', required: true, uploaded: false },
      { id: 'business_registration', label: 'Business Registration Certificate or equivalent', required: true, uploaded: false },
      { id: 'mandate', label: 'Mandate / deed / resolution authorising the investment and conferring authority', required: true, uploaded: false },
      { id: 'lp_aml_confirmation', label: 'Written confirmation that AML checks to FATF standards carried out on limited partners (for LPs)', required: false, uploaded: false },
      { id: 'authorised_sig_list', label: 'Authorised Signature List with specimen signatures', required: true, uploaded: false },
      { id: 'signatory_passports', label: 'Certified passport/ID of all authorised signatories', required: true, uploaded: false },
      { id: 'signatory_addresses', label: 'Proof of address of authorised signatories (less than 3 months old)', required: true, uploaded: false },
      { id: 'audited_financials', label: 'Annual report and latest audited financial statements', required: true, uploaded: false },
      { id: 'source_of_funds', label: 'Confirmation of source of funds', required: true, uploaded: false },
      { id: 'partner_names', label: 'Names of all partners', required: true, uploaded: false },
      { id: 'subscription_agreement', label: 'Signed Subscription Agreement', required: true, uploaded: false },
      { id: 'crs_fatca_entity', label: 'Entity CRS/FATCA Self-Certification Form', required: true, uploaded: false },
    )
  } else if (investorType === 'npo') {
    base.push(
      { id: 'proof_formation', label: 'Proof of formation (certificate of incorporation / trust deed / Constitution / By-Law) or registry search showing live status', required: true, uploaded: false },
      { id: 'source_evidence', label: 'Evidence of source of funds / major donors (latest financial statement)', required: true, uploaded: false },
      { id: 'authorised_sig_list', label: 'Authorised Signature List with specimen signatures', required: true, uploaded: false },
      { id: 'signatory_passports', label: 'Certified passport/ID of all authorised signatories, committee members, and trustees', required: true, uploaded: false },
      { id: 'signatory_addresses', label: 'Proof of address of authorised signatories and committee members (less than 3 months old)', required: true, uploaded: false },
      { id: 'committee_resolution', label: 'Signed board / committee resolution to make investment and conferring authority', required: true, uploaded: false },
      { id: 'subscription_agreement', label: 'Signed Subscription Agreement', required: true, uploaded: false },
      { id: 'crs_fatca_entity', label: 'Entity CRS/FATCA Self-Certification Form', required: true, uploaded: false },
    )
  } else if (investorType === 'nominee') {
    base.push(
      { id: 'cert_incorporation', label: 'Certificate of Incorporation / Business Registration Certificate', required: true, uploaded: false },
      { id: 'regulator_evidence', label: 'Documentation showing entity is regulated in an approved country (extract from regulator)', required: true, uploaded: false },
      { id: 'underlying_investor_list', label: 'List of all named underlying investors (for named accounts)', required: false, uploaded: false },
      { id: 'underlying_investor_docs', label: 'Identification documents for all named underlying investors', required: false, uploaded: false },
      { id: 'aml_confirmation', label: 'Written confirmation that AML checks to FATF standards have been carried out on underlying investors', required: true, uploaded: false },
      { id: 'authorised_sig_list', label: 'Authorised Signature List with specimen signatures', required: true, uploaded: false },
      { id: 'signatory_passports', label: 'Certified passport/ID of all authorised signatories', required: true, uploaded: false },
      { id: 'signatory_addresses', label: 'Proof of address of authorised signatories (less than 3 months old)', required: true, uploaded: false },
      { id: 'source_of_funds', label: 'Confirmation of source of funds', required: true, uploaded: false },
      { id: 'subscription_agreement', label: 'Signed Subscription Agreement', required: true, uploaded: false },
      { id: 'crs_fatca_entity', label: 'Entity CRS/FATCA Self-Certification Form', required: true, uploaded: false },
    )
  }

  if (isJapan) {
    base.push(
      { id: 'japan_id_doc', label: 'Japan — Certificate of Registered Incorporation Matters or other identification document per Act on Prevention of Transfer of Criminal Proceeds', required: true, uploaded: false },
    )
  }

  return base
}

export function DocumentsStep() {
  const { data, updateData, goNext } = useOnboarding()
  const isJapan = data.jurisdiction === 'FSA' || data.jurisdiction === 'BOTH'

  const [docs, setDocs] = useState<DocumentItem[]>(
    data.documents ?? getRequiredDocuments(data.investorType, isJapan)
  )

  const toggle = (id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, uploaded: !d.uploaded } : d))
  }

  const requiredDocs = docs.filter(d => d.required)
  const uploadedRequired = requiredDocs.filter(d => d.uploaded).length
  const allRequiredUploaded = uploadedRequired === requiredDocs.length

  const handleNext = () => {
    updateData({ documents: docs })
    goNext()
  }

  return (
    <StepLayout
      title="Document Checklist"
      subtitle="Please confirm which documents have been submitted or are ready to be provided. All required documents must be submitted before your application can be processed."
      onNext={handleNext}
    >
      <div className="alert-info text-xs">
        <strong>General Instructions:</strong>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>The passport copy must show: legible photo ID, legible signature, number and country of issuance, issue and expiry dates, full name, DOB, place of birth, nationality.</li>
          <li>Proof of address (utility bill or bank statement) must be <strong>less than 3 months old</strong> and display the full name. P.O. Box addresses are not acceptable.</li>
          <li><strong>Certified copies:</strong> Certifier must be a lawyer, accountant, director of a regulated institution, notary public, or member of the judiciary. Must sign, print name, indicate position, and provide contact details. Must state "true copy of original" and that the photo is a true likeness.</li>
          <li>Documents in a foreign language must be translated into English by a suitably qualified translator.</li>
        </ul>
      </div>

      {/* Progress */}
      <div className={clsx('card p-4 flex items-center gap-4', allRequiredUploaded ? 'bg-green-50 border-green-200' : 'bg-white')}>
        <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold',
          allRequiredUploaded ? 'bg-green-500 text-white' : 'bg-fgc-blue text-white')}>
          {uploadedRequired}/{requiredDocs.length}
        </div>
        <div>
          <p className="font-semibold text-fgc-navy text-sm">
            {allRequiredUploaded ? 'All required documents confirmed ✓' : 'Required documents'}
          </p>
          <p className="text-xs text-gray-500">
            {uploadedRequired} of {requiredDocs.length} required documents confirmed as ready
          </p>
        </div>
      </div>

      {/* Required Documents */}
      <div className="card p-6 space-y-2">
        <h2 className="section-title">Required Documents</h2>
        {docs.filter(d => d.required).map(doc => (
          <label
            key={doc.id}
            className={clsx(
              'flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer',
              doc.uploaded
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 hover:border-fgc-light'
            )}
          >
            <input type="checkbox" className="sr-only" checked={doc.uploaded} onChange={() => toggle(doc.id)} />
            <span className={clsx('mt-0.5 flex-shrink-0', doc.uploaded ? 'text-green-500' : 'text-gray-300')}>
              {doc.uploaded ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            </span>
            <span className="text-xs text-gray-700 leading-relaxed">{doc.label}</span>
          </label>
        ))}
      </div>

      {/* Optional Documents */}
      {docs.some(d => !d.required) && (
        <div className="card p-6 space-y-2">
          <h2 className="section-title">Optional / Conditional Documents</h2>
          {docs.filter(d => !d.required).map(doc => (
            <label
              key={doc.id}
              className={clsx(
                'flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer',
                doc.uploaded ? 'border-blue-200 bg-blue-50' : 'border-dashed border-gray-200 hover:border-fgc-light'
              )}
            >
              <input type="checkbox" className="sr-only" checked={doc.uploaded} onChange={() => toggle(doc.id)} />
              <span className={clsx('mt-0.5 flex-shrink-0', doc.uploaded ? 'text-fgc-mid' : 'text-gray-300')}>
                {doc.uploaded ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
              </span>
              <div>
                <span className="text-xs text-gray-700 leading-relaxed">{doc.label}</span>
                <span className="ml-2 text-xs text-gray-400">(if applicable)</span>
              </div>
            </label>
          ))}
        </div>
      )}

      {!allRequiredUploaded && (
        <div className="alert-warning flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-sm">
            {requiredDocs.length - uploadedRequired} required document(s) have not been confirmed.
            You may continue to the next step but your application will not be processed until all required
            documents are received by FGC.
          </p>
        </div>
      )}
    </StepLayout>
  )
}
