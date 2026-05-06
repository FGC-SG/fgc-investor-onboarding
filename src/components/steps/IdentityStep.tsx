import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useOnboarding } from '../../context/OnboardingContext'
import { StepLayout } from '../common/StepLayout'
import { FormField, Input, Select, TextArea } from '../common/FormField'
import { AddressFields } from '../common/AddressFields'
import { COUNTRIES, SOURCE_OF_WEALTH_OPTIONS, INDUSTRY_OPTIONS, LEGAL_FORM_OPTIONS, FUND_TYPES } from '../../utils/constants'
import type { IndividualInfo, EntityInfo, FundInfo, TrustInfo, SWFInfo } from '../../types'
import { Info } from 'lucide-react'

export function IdentityStep() {
  const { data, updateData, goNext } = useOnboarding()
  const isIndividual = data.investorType === 'individual'

  return isIndividual ? <IndividualIdentity /> : <EntityIdentity />
}

// ─── Individual ───────────────────────────────────────────────────────────────

function IndividualIdentity() {
  const { data, updateData, goNext } = useOnboarding()
  const existing = data.individual ?? {} as Partial<IndividualInfo>

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<IndividualInfo>({
    defaultValues: existing as IndividualInfo,
  })

  const mailingAddressSame = watch('mailingAddressSame', existing.mailingAddressSame ?? true)
  const isPEP = watch('isPEP', existing.isPEP ?? false)
  const isRelatedToPEP = watch('isRelatedToPEP', existing.isRelatedToPEP ?? false)

  const onSubmit = (values: IndividualInfo) => {
    updateData({ individual: values })
    goNext()
  }

  const sowOptions = SOURCE_OF_WEALTH_OPTIONS

  return (
    <StepLayout
      title="Individual Investor — Identity & Contact"
      subtitle="Please provide accurate personal information. Documents must match the details entered here."
      onNext={handleSubmit(onSubmit)}
    >
      {/* Personal Details */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Personal Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Full Legal Name" required error={errors.fullName?.message}>
            <Input
              placeholder="As per passport / NRIC"
              {...register('fullName', { required: 'Full name is required' })}
              error={!!errors.fullName}
            />
          </FormField>
          <FormField label="Aliases (if any)">
            <Input placeholder="Former names, name changes" {...register('aliases')} />
          </FormField>
          <FormField label="Date of Birth" required error={errors.dateOfBirth?.message}>
            <Input type="date" {...register('dateOfBirth', { required: 'Date of birth is required' })} error={!!errors.dateOfBirth} />
          </FormField>
          <FormField label="Place of Birth" required error={errors.placeOfBirth?.message}>
            <Input placeholder="City, Country" {...register('placeOfBirth', { required: 'Required' })} error={!!errors.placeOfBirth} />
          </FormField>
          <FormField label="Country of Birth" required error={errors.countryOfBirth?.message}>
            <Select {...register('countryOfBirth', { required: 'Required' })} error={!!errors.countryOfBirth}>
              <option value="">Select…</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Nationality" required error={errors.nationality?.message}>
            <Select {...register('nationality', { required: 'Required' })} error={!!errors.nationality}>
              <option value="">Select…</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Country of Residence" required error={errors.countryOfResidence?.message}>
            <Select {...register('countryOfResidence', { required: 'Required' })} error={!!errors.countryOfResidence}>
              <option value="">Select…</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </Select>
          </FormField>
        </div>
      </div>

      {/* Identification */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Identification Document</h2>
        <p className="text-xs text-gray-500">
          Must show: legible photo, signature, ID number, country of issuance, issue &amp; expiry dates, full name, date &amp; place of birth, nationality.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="ID Type" required error={errors.idType?.message}>
            <Select {...register('idType', { required: 'Required' })} error={!!errors.idType}>
              <option value="">Select…</option>
              <option value="passport">Passport</option>
              <option value="nric">NRIC (Singapore)</option>
              <option value="fin">FIN (Singapore)</option>
              <option value="other">Other Government-Issued ID</option>
            </Select>
          </FormField>
          <FormField label="ID / Passport Number" required error={errors.idNumber?.message}>
            <Input placeholder="ID number" {...register('idNumber', { required: 'Required' })} error={!!errors.idNumber} />
          </FormField>
          <FormField label="Expiry Date">
            <Input type="date" {...register('idExpiry')} />
          </FormField>
          <FormField label="Issuing Country" required error={errors.idIssuingCountry?.message}>
            <Select {...register('idIssuingCountry', { required: 'Required' })} error={!!errors.idIssuingCountry}>
              <option value="">Select…</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </Select>
          </FormField>
        </div>
      </div>

      {/* Contact */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Email Address" required error={errors.email?.message}>
            <Input type="email" placeholder="investor@example.com"
              {...register('email', { required: 'Required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
              error={!!errors.email} />
          </FormField>
          <FormField label="Phone Number" required error={errors.phone?.message}>
            <Input type="tel" placeholder="+65 9000 0000"
              {...register('phone', { required: 'Required' })} error={!!errors.phone} />
          </FormField>
        </div>

        <h3 className="text-sm font-semibold text-fgc-navy mt-4">Residential Address</h3>
        <p className="text-xs text-gray-500">No P.O. Box addresses accepted. Must be a permanent residential address.</p>
        <AddressFields prefix="residentialAddress" register={register as any} errors={errors as any} required />

        <div className="flex items-center gap-2 mt-2">
          <input type="checkbox" id="mailingSame" className="checkbox-input"
            {...register('mailingAddressSame')} defaultChecked />
          <label htmlFor="mailingSame" className="text-sm text-fgc-navy">Mailing address is same as residential address</label>
        </div>

        {!mailingAddressSame && (
          <>
            <h3 className="text-sm font-semibold text-fgc-navy mt-4">Mailing Address</h3>
            <AddressFields prefix="mailingAddress" register={register as any} errors={errors as any} required />
          </>
        )}
      </div>

      {/* Employment */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Employment & Occupation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Employment Status" required error={errors.employmentStatus?.message}>
            <Select {...register('employmentStatus', { required: 'Required' })} error={!!errors.employmentStatus}>
              <option value="">Select…</option>
              <option value="employed">Employed</option>
              <option value="self_employed">Self-Employed / Business Owner</option>
              <option value="retired">Retired</option>
              <option value="other">Other</option>
            </Select>
          </FormField>
          <FormField label="Employer / Company Name">
            <Input placeholder="Name of employer or company" {...register('employerName')} />
          </FormField>
          <FormField label="Position / Occupation">
            <Input placeholder="Job title or occupation" {...register('position')} />
          </FormField>
          <FormField label="Nature of Business / Industry">
            <Input placeholder="e.g. Finance, Technology, Manufacturing" {...register('natureOfBusiness')} />
          </FormField>
        </div>
      </div>

      {/* Source of Wealth & Funds */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Source of Wealth &amp; Funds</h2>
        <div className="alert-info text-xs">
          <Info className="w-4 h-4 inline mr-1" />
          Under MAS Notice SFA04-N02, FGC is required to establish the source of an investor's wealth and the source of funds used for investment.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="field-label mb-2">Principal Source of Wealth <span className="text-red-500">*</span></p>
            <div className="space-y-2">
              {sowOptions.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" value={opt.value} className="checkbox-input"
                    {...register('sourceOfWealth')} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="field-label mb-2">Principal Source of Funds for Investment <span className="text-red-500">*</span></p>
            <div className="space-y-2">
              {sowOptions.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" value={opt.value} className="checkbox-input"
                    {...register('sourceOfFunds')} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>
        <FormField label="Purpose and Intended Nature of Investment" required error={errors.purposeOfInvestment?.message}>
          <TextArea placeholder="Describe the purpose of this investment (e.g. long-term capital appreciation, portfolio diversification)"
            {...register('purposeOfInvestment', { required: 'Required' })} error={!!errors.purposeOfInvestment} />
        </FormField>
      </div>

      {/* PEP */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Politically Exposed Person (PEP)</h2>
        <div className="alert-info text-xs">
          A PEP is an individual who is or has been entrusted with a prominent public function. This includes heads of state, senior politicians, senior government officials, judicial officers, military officials, senior executives of state-owned corporations, and important political party officials.
        </div>
        <div className="space-y-3">
          <label className="checkbox-row">
            <input type="checkbox" className="checkbox-input" {...register('isPEP')} />
            <div>
              <p className="text-sm font-medium text-fgc-navy">I am currently or have previously been a Politically Exposed Person (PEP)</p>
            </div>
          </label>
          {isPEP && (
            <FormField label="PEP Details" error={errors.pepDetails?.message}>
              <TextArea placeholder="Please describe your PEP status (role, country, period)"
                {...register('pepDetails', { required: isPEP ? 'Required if PEP' : false })} />
            </FormField>
          )}
          <label className="checkbox-row">
            <input type="checkbox" className="checkbox-input" {...register('isRelatedToPEP')} />
            <div>
              <p className="text-sm font-medium text-fgc-navy">I am a close family member or associate of a PEP</p>
            </div>
          </label>
          {isRelatedToPEP && (
            <FormField label="Related PEP Details" error={errors.relatedPEPDetails?.message}>
              <TextArea placeholder="Please describe the relationship and the PEP's role"
                {...register('relatedPEPDetails', { required: isRelatedToPEP ? 'Required' : false })} />
            </FormField>
          )}
        </div>
      </div>

      {/* Tax Residency */}
      <TaxResidencySection register={register} />
    </StepLayout>
  )
}

// ─── Entity / Corporate ───────────────────────────────────────────────────────

function EntityIdentity() {
  const { data, updateData, goNext } = useOnboarding()
  const existing = (data.entity ?? {}) as Partial<EntityInfo>
  const isFund = data.investorType === 'fund'
  const isTrust = data.investorType === 'trust'
  const isSWF = data.investorType === 'swf'
  const isListed = data.investorType === 'listed_company'

  const { register, handleSubmit, watch, formState: { errors } } = useForm<EntityInfo & FundInfo & TrustInfo>({
    defaultValues: existing as any,
  })

  const operatingSame = watch('operatingAddressSame', existing.operatingAddressSame ?? true)
  const isListedWatch = watch('isListed', existing.isListed ?? isListed)

  const onSubmit = (values: EntityInfo) => {
    updateData({ entity: values })
    goNext()
  }

  return (
    <StepLayout
      title="Entity Investor — Identity & Registration"
      subtitle="Please provide accurate entity information as it appears on official registration documents."
      onNext={handleSubmit(onSubmit)}
    >
      {/* Entity Details */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Entity Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Full Legal Name" required error={errors.legalName?.message}>
            <Input placeholder="Exact legal name as registered" {...register('legalName', { required: 'Required' })} error={!!errors.legalName} />
          </FormField>
          <FormField label="Trading / DBA Name (if different)">
            <Input placeholder="Trading name" {...register('tradingName')} />
          </FormField>
          <FormField label="Registration / UEN Number" required error={errors.registrationNo?.message}>
            <Input placeholder="Company registration number" {...register('registrationNo', { required: 'Required' })} error={!!errors.registrationNo} />
          </FormField>
          <FormField label="Date of Incorporation / Establishment" required error={errors.dateOfIncorporation?.message}>
            <Input type="date" {...register('dateOfIncorporation', { required: 'Required' })} error={!!errors.dateOfIncorporation} />
          </FormField>
          <FormField label="Place of Incorporation / Registration" required error={errors.placeOfIncorporation?.message}>
            <Select {...register('placeOfIncorporation', { required: 'Required' })} error={!!errors.placeOfIncorporation}>
              <option value="">Select country…</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Legal Form" required error={errors.legalForm?.message}>
            <Select {...register('legalForm', { required: 'Required' })} error={!!errors.legalForm}>
              <option value="">Select…</option>
              {LEGAL_FORM_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </Select>
          </FormField>
          {isFund && (
            <FormField label="Fund Type" required>
              <Select {...register('fundType' as any, { required: 'Required' })}>
                <option value="">Select…</option>
                {FUND_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </Select>
            </FormField>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Email Address" required error={errors.email?.message}>
            <Input type="email" {...register('email', { required: 'Required' })} error={!!errors.email} />
          </FormField>
          <FormField label="Phone Number" required error={errors.phone?.message}>
            <Input type="tel" {...register('phone', { required: 'Required' })} error={!!errors.phone} />
          </FormField>
          <FormField label="Website">
            <Input type="url" placeholder="https://" {...register('website')} />
          </FormField>
        </div>

        <h3 className="text-sm font-semibold text-fgc-navy mt-2">Registered Address</h3>
        <p className="text-xs text-gray-500">No P.O. Box. Must match official registration documents.</p>
        <AddressFields prefix="registeredAddress" register={register as any} errors={errors as any} required />

        <div className="flex items-center gap-2">
          <input type="checkbox" id="opSame" className="checkbox-input" {...register('operatingAddressSame')} defaultChecked />
          <label htmlFor="opSame" className="text-sm text-fgc-navy">Principal place of business / operating address is same as registered address</label>
        </div>
        {!operatingSame && (
          <>
            <h3 className="text-sm font-semibold text-fgc-navy mt-2">Principal Operating Address</h3>
            <AddressFields prefix="operatingAddress" register={register as any} errors={errors as any} required />
          </>
        )}
      </div>

      {/* Regulatory Status */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Regulatory &amp; Listing Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Regulatory Authority / Regulator (if applicable)">
            <Input placeholder="e.g. MAS, SFC Hong Kong, FCA UK" {...register('regulatorName')} />
          </FormField>
          <div className="flex items-center gap-2 mt-6">
            <input type="checkbox" id="isListedCb" className="checkbox-input" {...register('isListed')} defaultChecked={isListed} />
            <label htmlFor="isListedCb" className="text-sm text-fgc-navy">Entity is listed on a recognised stock exchange</label>
          </div>
          {isListedWatch && (
            <FormField label="Name of Exchange">
              <Input placeholder="e.g. SGX, NYSE, LSE, TSE" {...register('exchangeListed')} />
            </FormField>
          )}
          <FormField label="Name of Home State Authority / Regulator Relationship">
            <Input placeholder="Nature of relationship with regulator" {...register('regulatorName')} />
          </FormField>
        </div>
      </div>

      {/* Nature of Business */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Nature of Business</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Industry / Sector" required error={errors.industryType?.message}>
            <Select {...register('industryType', { required: 'Required' })} error={!!errors.industryType}>
              <option value="">Select…</option>
              {INDUSTRY_OPTIONS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Nature of Business Activity">
            <Input placeholder="Describe primary business activity" {...register('natureOfBusiness')} />
          </FormField>
        </div>
        <FormField label="Purpose and Intended Nature of Investment" required error={errors.purposeOfInvestment?.message}>
          <TextArea placeholder="Describe the purpose of this investment"
            {...register('purposeOfInvestment', { required: 'Required' })} error={!!errors.purposeOfInvestment} />
        </FormField>
        <div className="flex items-start gap-2">
          <input type="checkbox" id="ownAccount" className="checkbox-input mt-0.5" {...register('investmentForOwnAccount')} defaultChecked />
          <label htmlFor="ownAccount" className="text-sm text-fgc-navy">
            I/We confirm that this investment is made for the entity's own account and not on behalf of any other party.
          </label>
        </div>
      </div>

      {/* Source of Funds */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Source of Funds &amp; Wealth</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="field-label mb-2">Principal Source of Funds <span className="text-red-500">*</span></p>
            <div className="space-y-2">
              {SOURCE_OF_WEALTH_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" value={opt.value} className="checkbox-input" {...register('sourceOfFunds')} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <FormField label="Net Assets (USD equivalent)">
              <Input type="number" placeholder="0" {...register('netAssets', { valueAsNumber: true })} />
            </FormField>
            <p className="field-hint">From most recent audited / certified balance sheet</p>
          </div>
        </div>
      </div>

      {/* Tax Residency */}
      <TaxResidencySection register={register} isEntity />
    </StepLayout>
  )
}

// ─── Shared: Tax Residency ────────────────────────────────────────────────────

function TaxResidencySection({ register, isEntity = false }: { register: any; isEntity?: boolean }) {
  return (
    <div className="card p-6 space-y-4">
      <h2 className="section-title">Tax Residency (CRS / FATCA)</h2>
      <div className="alert-info text-xs">
        Under AEOI (Automatic Exchange of Information), FGC is required to collect tax residency information. Provide all jurisdictions in which you are tax resident together with your Tax Identification Number (TIN).
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Country of Tax Residence 1" required>
          <Select {...register('taxResidencies.0.country')}>
            <option value="">Select…</option>
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </Select>
        </FormField>
        <FormField label="TIN Type">
          <Input placeholder="e.g. NRIC, TIN, SSN, ABN" {...register('taxResidencies.0.tinType')} />
        </FormField>
        <FormField label="Tax Reference Number (TIN)">
          <Input placeholder="TIN / Tax reference number" {...register('taxResidencies.0.tin')} />
        </FormField>
        <FormField label="Country of Tax Residence 2 (if applicable)">
          <Select {...register('taxResidencies.1.country')}>
            <option value="">Select…</option>
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </Select>
        </FormField>
        <FormField label="TIN Type">
          <Input placeholder="TIN type" {...register('taxResidencies.1.tinType')} />
        </FormField>
        <FormField label="Tax Reference Number (TIN)">
          <Input placeholder="TIN" {...register('taxResidencies.1.tin')} />
        </FormField>
      </div>
      {isEntity && (
        <div className="flex items-start gap-2 pt-2">
          <input type="checkbox" id="usPersonCb" className="checkbox-input mt-0.5" {...register('isUSPerson')} />
          <label htmlFor="usPersonCb" className="text-sm text-fgc-navy">
            The entity is a U.S. Person or Specified U.S. Person for FATCA purposes
          </label>
        </div>
      )}
    </div>
  )
}
