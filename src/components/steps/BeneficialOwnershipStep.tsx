import React, { useState } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import { StepLayout } from '../common/StepLayout'
import { FormField, Input, Select } from '../common/FormField'
import { COUNTRIES } from '../../utils/constants'
import type { BeneficialOwner, CorporateShareholder } from '../../types'
import { Plus, Trash2, Info, ChevronDown, ChevronUp } from 'lucide-react'

const BO_EXEMPTION_OPTIONS = [
  'Entity listed on a Recognised Stock Exchange (Singapore Exchange or equivalent overseas exchange with regulatory disclosure requirements)',
  'Financial institution licensed, approved, registered or regulated by MAS',
  'Financial institution incorporated outside Singapore supervised under FATF-consistent AML/CFT requirements',
  'Investment vehicle where the managers are MAS-regulated financial institutions',
  'Investment vehicle incorporated outside Singapore but supervised under FATF-consistent AML/CFT standards',
]

function BOCard({ bo, index, onUpdate, onRemove }: {
  bo: Partial<BeneficialOwner>
  index: number
  onUpdate: (b: Partial<BeneficialOwner>) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
        onClick={() => setExpanded(e => !e)}>
        <span className="text-sm font-medium text-fgc-navy">
          Beneficial Owner {index + 1}
          {bo.fullName && <span className="text-gray-500 font-normal"> — {bo.fullName}</span>}
          {bo.ownershipPct !== undefined && (
            <span className="ml-2 badge-blue">{bo.ownershipPct}%</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={e => { e.stopPropagation(); onRemove() }}
            className="text-red-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <Input placeholder="Full legal name" value={bo.fullName ?? ''}
                onChange={e => onUpdate({ ...bo, fullName: e.target.value })} />
            </FormField>
            <FormField label="Aliases (if any)">
              <Input placeholder="Former or other names" value={bo.aliases ?? ''}
                onChange={e => onUpdate({ ...bo, aliases: e.target.value })} />
            </FormField>
            <FormField label="Unique ID / Passport Number" required>
              <Input placeholder="ID or passport number" value={bo.idNumber ?? ''}
                onChange={e => onUpdate({ ...bo, idNumber: e.target.value })} />
            </FormField>
            <FormField label="ID Type" required>
              <Select value={bo.idType ?? ''} onChange={e => onUpdate({ ...bo, idType: e.target.value as any })}>
                <option value="">Select…</option>
                <option value="passport">Passport</option>
                <option value="nric">NRIC</option>
                <option value="fin">FIN</option>
                <option value="other">Other</option>
              </Select>
            </FormField>
            <FormField label="Date of Birth" required>
              <Input type="date" value={bo.dateOfBirth ?? ''}
                onChange={e => onUpdate({ ...bo, dateOfBirth: e.target.value })} />
            </FormField>
            <FormField label="Nationality" required>
              <Select value={bo.nationality ?? ''} onChange={e => onUpdate({ ...bo, nationality: e.target.value })}>
                <option value="">Select…</option>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Ownership / Interest Percentage (%)" required
              hint="FGC threshold: 10% or more ownership or effective control">
              <Input type="number" min="0" max="100" step="0.01" placeholder="e.g. 25"
                value={bo.ownershipPct ?? ''}
                onChange={e => onUpdate({ ...bo, ownershipPct: parseFloat(e.target.value) })} />
            </FormField>
            <FormField label="Nature of Control">
              <Select value={bo.controlType ?? ''} onChange={e => onUpdate({ ...bo, controlType: e.target.value as any })}>
                <option value="">Select…</option>
                <option value="ownership">Direct / Indirect Ownership</option>
                <option value="other_means">Control by Other Means</option>
                <option value="senior_managing_official">Senior Managing Official</option>
              </Select>
            </FormField>
          </div>

          <div>
            <p className="field-label mb-2">Address</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Address Line 1" required>
                <Input placeholder="Street address" value={bo.address?.line1 ?? ''}
                  onChange={e => onUpdate({ ...bo, address: { ...bo.address, line1: e.target.value } as any })} />
              </FormField>
              <FormField label="City">
                <Input placeholder="City" value={bo.address?.city ?? ''}
                  onChange={e => onUpdate({ ...bo, address: { ...bo.address, city: e.target.value } as any })} />
              </FormField>
              <FormField label="Postal Code">
                <Input placeholder="Postal code" value={bo.address?.postalCode ?? ''}
                  onChange={e => onUpdate({ ...bo, address: { ...bo.address, postalCode: e.target.value } as any })} />
              </FormField>
              <FormField label="Country">
                <Select value={bo.address?.country ?? ''}
                  onChange={e => onUpdate({ ...bo, address: { ...bo.address, country: e.target.value } as any })}>
                  <option value="">Select…</option>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </Select>
              </FormField>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" className="checkbox-input"
              checked={bo.isPEP ?? false}
              onChange={e => onUpdate({ ...bo, isPEP: e.target.checked })} />
            <span className="text-sm text-fgc-navy">This beneficial owner is or has been a PEP</span>
          </div>

          <div className="bg-gray-50 rounded p-3 text-xs text-gray-600">
            <strong>Verification options (one must be completed):</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>ID Document (certified passport/NRIC)</li>
              <li>Verification by publicly available sources (e.g. web search — please state sources)</li>
              <li>Face-to-face meeting with FGC employee</li>
              <li>If listed company or government entity — see Appendix A verification documents</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export function BeneficialOwnershipStep() {
  const { data, updateData, goNext } = useOnboarding()
  const entity = (data.entity ?? {}) as any

  const [bos, setBos] = useState<Partial<BeneficialOwner>[]>(entity.beneficialOwners ?? [])
  const [corpShareholders, setCorpShareholders] = useState<Partial<CorporateShareholder>[]>(
    entity.corporateShareholders ?? []
  )
  const [exemptionApplies, setExemptionApplies] = useState<boolean>(entity.boExemptionApplies ?? false)
  const [exemptionBasis, setExemptionBasis] = useState<string>(entity.boExemptionBasis ?? '')

  const handleNext = () => {
    updateData({
      entity: {
        ...entity,
        beneficialOwners: bos,
        corporateShareholders: corpShareholders,
        boExemptionApplies: exemptionApplies,
        boExemptionBasis: exemptionBasis,
      } as any,
    })
    goNext()
  }

  return (
    <StepLayout
      title="Beneficial Ownership — Section D"
      subtitle="Identify all beneficial owners with 10% or more ownership interest or effective control. Follow the chain of ownership through all layers to identify ultimate beneficial owners."
      onNext={handleNext}
    >
      <div className="alert-info text-xs">
        <Info className="w-4 h-4 inline mr-1" />
        <strong>FGC Threshold: 10%.</strong> Provide details of each natural person who ultimately owns or controls 10% or more interest in or has effective control over the legal person, its business or its assets (including aggregate ownership with cross-shareholdings). Where the company has multi-layer ownership, follow the chain of ownership to identify the ultimate beneficial owners.
      </div>

      {/* Exemption check */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Appendix B — Beneficial Ownership Exemption</h2>
        <p className="text-sm text-gray-600">
          FGC is not required to inquire into beneficial owners if an exemption under Appendix B applies. Please indicate if an exemption applies.
        </p>
        <div className="flex items-start gap-2">
          <input type="checkbox" className="checkbox-input mt-0.5"
            checked={exemptionApplies}
            onChange={e => setExemptionApplies(e.target.checked)} />
          <label className="text-sm text-fgc-navy">
            An exemption from beneficial ownership provisions applies to this investor
          </label>
        </div>
        {exemptionApplies && (
          <div className="ml-6 space-y-2">
            <p className="text-xs font-medium text-gray-600">Select applicable exemption basis:</p>
            {BO_EXEMPTION_OPTIONS.map((opt, i) => (
              <label key={i} className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
                <input type="radio" name="boExemption" className="radio-input mt-0.5"
                  checked={exemptionBasis === opt}
                  onChange={() => setExemptionBasis(opt)} />
                {opt}
              </label>
            ))}
            <FormField label="Additional details / basis for exemption">
              <Input placeholder="Provide specific details"
                value={exemptionBasis}
                onChange={e => setExemptionBasis(e.target.value)} />
            </FormField>
          </div>
        )}
      </div>

      {/* Individual BOs */}
      {!exemptionApplies && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title mb-0">Individual Beneficial Owners</h2>
            <button type="button" className="btn-ghost text-xs"
              onClick={() => setBos(b => [...b, {}])}>
              <Plus className="w-3.5 h-3.5" /> Add Beneficial Owner
            </button>
          </div>

          {bos.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No beneficial owners added yet.</p>
              <p className="text-xs mt-1">Click "Add Beneficial Owner" above to add an individual BO.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bos.map((bo, i) => (
                <BOCard
                  key={i}
                  bo={bo}
                  index={i}
                  onUpdate={updated => setBos(prev => prev.map((b, j) => j === i ? updated : b))}
                  onRemove={() => setBos(prev => prev.filter((_, j) => j !== i))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Corporate Shareholders */}
      {!exemptionApplies && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title mb-0">Corporate Shareholders (if any)</h2>
            <button type="button" className="btn-ghost text-xs"
              onClick={() => setCorpShareholders(s => [...s, {}])}>
              <Plus className="w-3.5 h-3.5" /> Add Corporate Shareholder
            </button>
          </div>
          <p className="text-xs text-gray-500">
            If any beneficial owner is a corporate entity, please provide its details. Continue to trace the chain of ownership until natural persons are identified.
          </p>
          <div className="space-y-3">
            {corpShareholders.map((cs, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-fgc-navy">Corporate Shareholder {i + 1}</span>
                  <button type="button" className="text-red-400 hover:text-red-600"
                    onClick={() => setCorpShareholders(prev => prev.filter((_, j) => j !== i))}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Company Name">
                    <Input value={cs.companyName ?? ''} placeholder="Legal company name"
                      onChange={e => setCorpShareholders(prev => prev.map((x, j) => j === i ? { ...x, companyName: e.target.value } : x))} />
                  </FormField>
                  <FormField label="Business Registration No.">
                    <Input value={cs.registrationNo ?? ''} placeholder="Registration number"
                      onChange={e => setCorpShareholders(prev => prev.map((x, j) => j === i ? { ...x, registrationNo: e.target.value } : x))} />
                  </FormField>
                  <FormField label="Place of Incorporation">
                    <Select value={cs.placeOfIncorporation ?? ''}
                      onChange={e => setCorpShareholders(prev => prev.map((x, j) => j === i ? { ...x, placeOfIncorporation: e.target.value } : x))}>
                      <option value="">Select…</option>
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </Select>
                  </FormField>
                  <FormField label="Effective Shareholding (%)">
                    <Input type="number" min="0" max="100" value={cs.effectiveShareholding ?? ''}
                      onChange={e => setCorpShareholders(prev => prev.map((x, j) => j === i ? { ...x, effectiveShareholding: parseFloat(e.target.value) } : x))} />
                  </FormField>
                  <div className="sm:col-span-2">
                    <FormField label="Address">
                      <Input value={cs.address ?? ''} placeholder="Full address"
                        onChange={e => setCorpShareholders(prev => prev.map((x, j) => j === i ? { ...x, address: e.target.value } : x))} />
                    </FormField>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </StepLayout>
  )
}
