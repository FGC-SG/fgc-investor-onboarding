import React from 'react'
import { useForm } from 'react-hook-form'
import { useOnboarding } from '../../context/OnboardingContext'
import { StepLayout } from '../common/StepLayout'
import { FormField, Input, Select } from '../common/FormField'
import { COUNTRIES } from '../../utils/constants'
import type { IndividualCRSFATCA, EntityCRSFATCA } from '../../types'
import { Info } from 'lucide-react'

export function CRSFATCAStep() {
  const { data } = useOnboarding()
  const isIndividual = data.investorType === 'individual'
  return isIndividual ? <IndividualCRSFATCAForm /> : <EntityCRSFATCAForm />
}

// ─── Individual ───────────────────────────────────────────────────────────────

function IndividualCRSFATCAForm() {
  const { data, updateData, goNext } = useOnboarding()
  const existing = data.crsFatcaIndividual ?? {} as Partial<IndividualCRSFATCA>
  const inv = data.individual ?? {} as any

  const { register, handleSubmit, watch, formState: { errors } } = useForm<IndividualCRSFATCA>({
    defaultValues: {
      accountHolderName: inv.fullName ?? '',
      dateOfBirth: inv.dateOfBirth ?? '',
      placeAndCountryOfBirth: `${inv.placeOfBirth ?? ''}, ${inv.countryOfBirth ?? ''}`,
      isUSCitizen: existing.isUSCitizen ?? false,
      declaration: existing.declaration ?? false,
      taxResidencies: existing.taxResidencies ?? inv.taxResidencies ?? [],
    },
  })

  const isUSCitizen = watch('isUSCitizen')
  const bornInUSRenounced = watch('bornInUSButRenouncedCitizenship')

  const onSubmit = (values: IndividualCRSFATCA) => {
    updateData({ crsFatcaIndividual: values })
    goNext()
  }

  return (
    <StepLayout
      title="Individual Self-Certification — CRS & FATCA"
      subtitle="We are obliged to collect tax status information under AEOI (Automatic Exchange of Information) obligations. This information may be shared with relevant tax authorities."
      onNext={handleSubmit(onSubmit)}
    >
      <div className="alert-info text-xs">
        <Info className="w-4 h-4 inline mr-1" />
        Terms referenced have the same meaning as under the Cayman Islands Regulations, Guidance Notes or international agreements. If information changes in the future, please notify FGC within 30 days.
      </div>

      {/* Section 1 */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Section 1 — Account Holder Identification</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <FormField label="Account Holder Name" required>
              <Input {...register('accountHolderName', { required: 'Required' })} />
            </FormField>
          </div>
          <FormField label="Date of Birth" required>
            <Input type="date" {...register('dateOfBirth', { required: 'Required' })} />
          </FormField>
          <div className="sm:col-span-3">
            <FormField label="Place and Country of Birth" required>
              <Input placeholder="e.g. Tokyo, Japan" {...register('placeAndCountryOfBirth', { required: 'Required' })} />
            </FormField>
          </div>
        </div>
        <div>
          <p className="field-label">Permanent Residence Address</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            <div className="sm:col-span-3">
              <Input placeholder="Number & Street" {...register('permanentResidenceAddress.line1')} />
            </div>
            <Input placeholder="City / Town" {...register('permanentResidenceAddress.city')} />
            <Input placeholder="Postal Code" {...register('permanentResidenceAddress.postalCode')} />
            <Select {...register('permanentResidenceAddress.country')}>
              <option value="">Country…</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </Select>
          </div>
        </div>
      </div>

      {/* Section 2 — US */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Section 2 — Declaration of U.S. Citizenship or U.S. Residence</h2>
        <p className="text-xs text-gray-500">Please select ONE of the following options:</p>
        <div className="space-y-3">
          <label className="checkbox-row flex items-start gap-3">
            <input type="radio" value="citizen" className="radio-input mt-0.5"
              {...register('isUSCitizen')}
              onChange={() => { }} />
            <div>
              <p className="text-sm font-medium text-fgc-navy">(a) I confirm that I am a U.S. citizen and/or resident in the U.S. for tax purposes</p>
              <p className="text-xs text-gray-500">Green card holder or resident under the substantial presence test</p>
            </div>
          </label>

          <label className="checkbox-row flex items-start gap-3">
            <input type="radio" value="renounced" className="radio-input mt-0.5"
              {...register('bornInUSButRenouncedCitizenship')}
              onChange={() => { }} />
            <div>
              <p className="text-sm font-medium text-fgc-navy">(b) I was born in the U.S. but am no longer a U.S. citizen</p>
              <p className="text-xs text-gray-500">I have voluntarily surrendered my citizenship as evidenced by attached documents</p>
            </div>
          </label>

          <label className="checkbox-row flex items-start gap-3">
            <input type="radio" name="usstatus" value="non_us" className="radio-input mt-0.5" defaultChecked />
            <div>
              <p className="text-sm font-medium text-fgc-navy">(c) I am not a U.S. citizen or resident in the U.S. for tax purposes</p>
            </div>
          </label>
        </div>

        {isUSCitizen && (
          <FormField label="U.S. Federal Taxpayer Identifying Number (TIN)" required>
            <Input placeholder="U.S. TIN" {...register('usTIN', { required: 'US TIN required for US persons' })} />
          </FormField>
        )}
      </div>

      {/* Section 3 — Non-US Tax Residencies */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Section 3 — Declaration of Tax Residency (non-U.S.)</h2>
        <p className="text-xs text-gray-500">
          Please indicate all countries in which you are tax resident and the applicable Tax Reference Number (TIN). If a jurisdiction does not issue a TIN, select "Not Applicable" and state the reason.
        </p>
        <div className="space-y-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <FormField label={`Country of Tax Residence ${i + 1}`}>
                <Select {...register(`taxResidencies.${i}.country` as any)}>
                  <option value="">Select…</option>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </Select>
              </FormField>
              <FormField label="TIN Type" hint="e.g. NRIC, TIN, SSN, ABN, Not Applicable">
                <Input placeholder="TIN type" {...register(`taxResidencies.${i}.tinType` as any)} />
              </FormField>
              <FormField label="Tax Reference Number (TIN)">
                <Input placeholder="TIN / Reference number" {...register(`taxResidencies.${i}.tin` as any)} />
              </FormField>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4 — Declaration */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Section 4 — Declaration and Undertakings</h2>
        <div className="bg-gray-50 rounded p-4 text-xs text-gray-700 leading-relaxed">
          I declare that the information provided in this form is, to the best of my knowledge and belief, accurate and complete. I undertake to advise the recipient promptly and provide an updated Self-Certification form within <strong>30 days</strong> where any change in circumstances occurs which causes any of the information contained in this form to be inaccurate or incomplete. Where legally obliged to do so, I hereby consent to the recipient sharing this information with the relevant tax information authorities. I acknowledge that it is an <strong>offence to make a self-certification that is false in a material particular</strong>.
        </div>
        <label className="checkbox-row flex items-start gap-3">
          <input type="checkbox" className="checkbox-input mt-0.5"
            {...register('declaration', { required: 'You must provide this declaration' })} />
          <span className="text-sm font-medium text-fgc-navy">
            I confirm and agree to the above declaration and undertakings.
          </span>
        </label>
        {errors.declaration && <p className="field-error">{errors.declaration.message}</p>}
      </div>
    </StepLayout>
  )
}

// ─── Entity ───────────────────────────────────────────────────────────────────

const FATCA_CLASSIFICATIONS = [
  { value: 'reporting_model1_ffi', label: 'Reporting Model 1 FFI', section: '3.1' },
  { value: 'reporting_model2_ffi', label: 'Reporting Model 2 FFI', section: '3.1' },
  { value: 'participating_ffi', label: 'Participating Foreign Financial Institution (FFI)', section: '3.1' },
  { value: 'registered_deemed_compliant_ffi', label: 'Registered Deemed Compliant FFI', section: '3.1' },
  { value: 'sponsored_fi', label: 'Sponsored Financial Institution', section: '3.2' },
  { value: 'trustee_documented_trust', label: 'Trustee Documented Trust', section: '3.2' },
  { value: 'certified_deemed_compliant_ffi', label: 'Certified Deemed Compliant / Non-Reporting FFI', section: '3.2' },
  { value: 'non_participating_ffi', label: 'Non-Participating FFI', section: '3.2' },
  { value: 'exempt_beneficial_owner', label: 'Exempt Beneficial Owner', section: '3.3' },
  { value: 'active_nffe', label: 'Active Non-Financial Foreign Entity (NFFE)', section: '3.3' },
  { value: 'direct_reporting_nffe', label: 'Direct Reporting NFFE', section: '3.3' },
  { value: 'sponsored_direct_reporting_nffe', label: 'Sponsored Direct Reporting NFFE', section: '3.3' },
  { value: 'passive_nffe', label: 'Passive Non-Financial Foreign Entity (NFFE)', section: '3.3' },
]

const CRS_CLASSIFICATIONS = [
  { value: 'reporting_fi', label: 'Reporting Financial Institution (CRS)' },
  { value: 'non_reporting_fi_governmental', label: 'Non-Reporting FI — Governmental Entity' },
  { value: 'non_reporting_fi_international_org', label: 'Non-Reporting FI — International Organisation' },
  { value: 'non_reporting_fi_central_bank', label: 'Non-Reporting FI — Central Bank' },
  { value: 'non_reporting_fi_retirement_fund', label: 'Non-Reporting FI — Retirement / Pension Fund' },
  { value: 'non_reporting_fi_exempt_civ', label: 'Non-Reporting FI — Exempt Collective Investment Vehicle' },
  { value: 'non_reporting_fi_other', label: 'Non-Reporting FI — Other (domestic law definition)' },
  { value: 'fi_non_participating_jurisdiction', label: 'Financial Institution in Non-Participating CRS Jurisdiction' },
  { value: 'active_nfe_traded', label: 'Active NFE — Regularly traded or related entity of regularly traded corp' },
  { value: 'active_nfe_governmental', label: 'Active NFE — Governmental Entity / International Org / Central Bank' },
  { value: 'active_nfe_other', label: 'Active NFE — Other qualifying criteria' },
  { value: 'passive_nfe', label: 'Passive Non-Financial Entity (NFE)' },
]

function EntityCRSFATCAForm() {
  const { data, updateData, goNext } = useOnboarding()
  const existing = data.crsFatcaEntity ?? {} as Partial<EntityCRSFATCA>
  const entity = (data.entity ?? {}) as any

  const { register, handleSubmit, watch, formState: { errors } } = useForm<EntityCRSFATCA>({
    defaultValues: {
      legalName: entity.legalName ?? '',
      countryOfIncorporation: entity.placeOfIncorporation ?? '',
      isUSPerson: entity.isUSPerson ?? false,
      usTIN: entity.usTIN ?? '',
      fatcaClassification: existing.fatcaClassification,
      crsClassification: existing.crsClassification,
      taxResidencies: existing.taxResidencies ?? entity.taxResidencies ?? [],
      controllingPersons: existing.controllingPersons ?? [],
      declaration: existing.declaration ?? false,
    },
  })

  const isUSPerson = watch('isUSPerson')
  const fatcaClass = watch('fatcaClassification')
  const crsClass = watch('crsClassification')
  const needsGIIN = ['reporting_model1_ffi', 'reporting_model2_ffi', 'participating_ffi', 'registered_deemed_compliant_ffi', 'direct_reporting_nffe'].includes(fatcaClass)
  const isPassiveNFE = crsClass === 'passive_nfe' || fatcaClass === 'passive_nffe'

  const onSubmit = (values: EntityCRSFATCA) => {
    updateData({ crsFatcaEntity: values })
    goNext()
  }

  return (
    <StepLayout
      title="Entity Self-Certification — CRS & FATCA"
      subtitle="We are obliged to collect tax classification information for AEOI purposes. This information may be reported to tax authorities."
      onNext={handleSubmit(onSubmit)}
    >
      {/* Part I — Identification */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Part I — Entity Identification</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Legal Name of Entity" required>
            <Input {...register('legalName', { required: 'Required' })} />
          </FormField>
          <FormField label="Country of Incorporation / Organisation" required>
            <Select {...register('countryOfIncorporation', { required: 'Required' })}>
              <option value="">Select…</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </Select>
          </FormField>
        </div>
        <p className="field-label">Registered / Current Residence Address</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3">
            <Input placeholder="Number & Street" {...register('registeredAddress.line1')} />
          </div>
          <Input placeholder="City / Town" {...register('registeredAddress.city')} />
          <Input placeholder="Postal Code" {...register('registeredAddress.postalCode')} />
          <Select {...register('registeredAddress.country')}>
            <option value="">Country…</option>
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </Select>
        </div>
      </div>

      {/* Part II — US IGA FATCA */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Part II — U.S. Persons (FATCA)</h2>
        <div className="flex items-start gap-2 mb-3">
          <input type="checkbox" className="checkbox-input mt-0.5" {...register('isUSPerson')} />
          <label className="text-sm text-fgc-navy">The entity is a Specified U.S. Person for FATCA purposes</label>
        </div>
        {isUSPerson && (
          <FormField label="U.S. Federal Taxpayer Identifying Number (TIN)" required>
            <Input placeholder="U.S. TIN" {...register('usTIN', { required: 'US TIN required' })} />
          </FormField>
        )}

        {!isUSPerson && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-fgc-navy">Section 3 — FATCA Classification for Non-U.S. Entities</p>
            <div className="space-y-2">
              {FATCA_CLASSIFICATIONS.map(opt => (
                <label key={opt.value} className="checkbox-row flex items-start gap-3">
                  <input type="radio" value={opt.value} className="radio-input mt-0.5"
                    {...register('fatcaClassification', { required: 'Required' })} />
                  <div>
                    <span className="text-xs font-medium text-gray-500 mr-2">[§{opt.section}]</span>
                    <span className="text-sm text-fgc-navy">{opt.label}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.fatcaClassification && <p className="field-error">{errors.fatcaClassification.message}</p>}
            {needsGIIN && (
              <FormField label="FATCA GIIN (Global Intermediary Identification Number)" required>
                <Input placeholder="e.g. XXXXXX.XXXXX.XX.XXX" {...register('giin', { required: 'GIIN required for this classification' })} />
              </FormField>
            )}
          </div>
        )}
      </div>

      {/* Part III — CRS */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Part III — CRS Classification</h2>
        <p className="text-xs text-gray-500">
          CRS classification does not necessarily coincide with FATCA classification. Please indicate the entity's CRS status.
        </p>
        <div className="space-y-2">
          {CRS_CLASSIFICATIONS.map(opt => (
            <label key={opt.value} className="checkbox-row flex items-start gap-3">
              <input type="radio" value={opt.value} className="radio-input mt-0.5"
                {...register('crsClassification', { required: 'Required' })} />
              <span className="text-sm text-fgc-navy">{opt.label}</span>
            </label>
          ))}
        </div>
        {errors.crsClassification && <p className="field-error">{errors.crsClassification.message}</p>}

        <div className="mt-4">
          <p className="field-label mb-2">Tax Residency (CRS)</p>
          {[0, 1].map(i => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
              <FormField label={`Jurisdiction ${i + 1}`}>
                <Select {...register(`taxResidencies.${i}.country` as any)}>
                  <option value="">Select…</option>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </Select>
              </FormField>
              <FormField label="TIN Type">
                <Input placeholder="TIN type" {...register(`taxResidencies.${i}.tinType` as any)} />
              </FormField>
              <FormField label="TIN / Reference Number">
                <Input placeholder="TIN" {...register(`taxResidencies.${i}.tin` as any)} />
              </FormField>
            </div>
          ))}
        </div>
      </div>

      {/* Controlling Persons (for Passive NFE) */}
      {isPassiveNFE && (
        <div className="card p-6 space-y-4">
          <h2 className="section-title">Part IV — Controlling Persons</h2>
          <div className="alert-info text-xs">
            As a Passive NFE/NFFE, please provide details of all Controlling Persons who are natural persons. A "Controlling Person" includes persons who exercise direct or indirect control over the entity. For trusts: settlor, trustee, protector, beneficiaries and any other person with ultimate effective control.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Controlling Person 1 — Full Name">
              <Input {...register('controllingPersons.0.name' as any)} />
            </FormField>
            <FormField label="Date of Birth">
              <Input type="date" {...register('controllingPersons.0.dateOfBirth' as any)} />
            </FormField>
            <FormField label="Country of Tax Residence">
              <Select {...register('controllingPersons.0.taxResidencies.0.country' as any)}>
                <option value="">Select…</option>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="TIN">
              <Input {...register('controllingPersons.0.taxResidencies.0.tin' as any)} />
            </FormField>
            <FormField label="Type of Control" required>
              <Select {...register('controllingPersons.0.controlType' as any)}>
                <option value="">Select…</option>
                <option value="legal_person_ownership">Control by Ownership</option>
                <option value="legal_person_other_means">Control by Other Means</option>
                <option value="legal_person_senior_official">Senior Managing Official</option>
                <option value="trust_settlor">Trust — Settlor</option>
                <option value="trust_trustee">Trust — Trustee</option>
                <option value="trust_protector">Trust — Protector</option>
                <option value="trust_beneficiary">Trust — Beneficiary</option>
                <option value="trust_other">Trust — Other</option>
              </Select>
            </FormField>
          </div>
        </div>
      )}

      {/* Declaration */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Entity Declaration and Undertakings</h2>
        <div className="bg-gray-50 rounded p-4 text-xs text-gray-700 leading-relaxed">
          I/We declare (as an authorised signatory of the Entity) that the information provided in this form is, to the best of my/our knowledge and belief, accurate and complete. I/We undertake to advise the recipient promptly and provide an updated Self-Certification form within <strong>30 days</strong> where any change in circumstances occurs. I/we acknowledge that it is an <strong>offence to make a self-certification that is false in a material particular</strong>.
        </div>
        <label className="checkbox-row flex items-start gap-3">
          <input type="checkbox" className="checkbox-input mt-0.5"
            {...register('declaration', { required: 'Declaration required' })} />
          <span className="text-sm font-medium text-fgc-navy">
            I/We confirm and agree to the above declaration as authorised signatory of the entity.
          </span>
        </label>
        {errors.declaration && <p className="field-error">{errors.declaration.message}</p>}
      </div>
    </StepLayout>
  )
}
