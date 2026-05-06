import React, { useState } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import { StepLayout } from '../common/StepLayout'
import { FormField, Input, Select } from '../common/FormField'
import { AddressFields } from '../common/AddressFields'
import { COUNTRIES } from '../../utils/constants'
import type { Director, AuthorisedPerson, ConnectedPerson } from '../../types'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'

function PersonCard({
  title,
  person,
  onUpdate,
  onRemove,
  showPosition = false,
  showConnection = false,
  showAddress = false,
}: {
  title: string
  person: Partial<Director & AuthorisedPerson & ConnectedPerson>
  onUpdate: (p: Partial<Director>) => void
  onRemove: () => void
  showPosition?: boolean
  showConnection?: boolean
  showAddress?: boolean
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-fgc-navy">{title}</span>
          {person.fullName && <span className="text-xs text-gray-500">— {person.fullName}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="text-red-400 hover:text-red-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <Input placeholder="Full legal name" value={person.fullName ?? ''}
                onChange={e => onUpdate({ ...person, fullName: e.target.value })} />
            </FormField>
            <FormField label="Aliases (if any)">
              <Input placeholder="Former names" value={person.aliases ?? ''}
                onChange={e => onUpdate({ ...person, aliases: e.target.value })} />
            </FormField>
            {showPosition && (
              <FormField label="Position / Designation" required>
                <Input placeholder="e.g. Director, CEO, Authorised Signatory"
                  value={(person as Director).position ?? ''}
                  onChange={e => onUpdate({ ...person, position: e.target.value })} />
              </FormField>
            )}
            {showConnection && (
              <FormField label="Connection to Client" required>
                <Input placeholder="e.g. Director, Manager, Partner"
                  value={(person as ConnectedPerson).connectionToClient ?? ''}
                  onChange={e => onUpdate({ ...person, connectionToClient: e.target.value } as any)} />
              </FormField>
            )}
            <FormField label="ID Type" required>
              <Select value={person.idType ?? ''} onChange={e => onUpdate({ ...person, idType: e.target.value as any })}>
                <option value="">Select…</option>
                <option value="passport">Passport</option>
                <option value="nric">NRIC</option>
                <option value="fin">FIN</option>
                <option value="other">Other</option>
              </Select>
            </FormField>
            <FormField label="ID / Passport Number" required>
              <Input placeholder="ID number" value={person.idNumber ?? ''}
                onChange={e => onUpdate({ ...person, idNumber: e.target.value })} />
            </FormField>
            <FormField label="ID Expiry Date">
              <Input type="date" value={person.idExpiry ?? ''}
                onChange={e => onUpdate({ ...person, idExpiry: e.target.value })} />
            </FormField>
            <FormField label="Nationality" required>
              <Select value={person.nationality ?? ''} onChange={e => onUpdate({ ...person, nationality: e.target.value })}>
                <option value="">Select…</option>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Date of Birth">
              <Input type="date" value={person.dateOfBirth ?? ''}
                onChange={e => onUpdate({ ...person, dateOfBirth: e.target.value })} />
            </FormField>
            {(person as Director).domicile !== undefined || showPosition ? (
              <FormField label="Country of Domicile">
                <Select value={(person as Director).domicile ?? ''}
                  onChange={e => onUpdate({ ...person, domicile: e.target.value } as any)}>
                  <option value="">Select…</option>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </Select>
              </FormField>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id={`pep-${person.fullName}`} className="checkbox-input"
              checked={person.isPEP ?? false}
              onChange={e => onUpdate({ ...person, isPEP: e.target.checked })} />
            <label htmlFor={`pep-${person.fullName}`} className="text-sm text-fgc-navy">
              This person is or has been a Politically Exposed Person (PEP)
            </label>
          </div>

          {showAddress && (
            <div>
              <p className="field-label mt-2">Proof of Address (Residential)</p>
              <p className="text-xs text-gray-500 mb-3">Must be less than 3 months old. No P.O. Box.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Address Line 1">
                  <Input placeholder="Street address"
                    value={person.address?.line1 ?? ''}
                    onChange={e => onUpdate({ ...person, address: { ...person.address, line1: e.target.value } as any })} />
                </FormField>
                <FormField label="City">
                  <Input placeholder="City"
                    value={person.address?.city ?? ''}
                    onChange={e => onUpdate({ ...person, address: { ...person.address, city: e.target.value } as any })} />
                </FormField>
                <FormField label="Postal Code">
                  <Input placeholder="Postal code"
                    value={person.address?.postalCode ?? ''}
                    onChange={e => onUpdate({ ...person, address: { ...person.address, postalCode: e.target.value } as any })} />
                </FormField>
                <FormField label="Country">
                  <Select value={person.address?.country ?? ''}
                    onChange={e => onUpdate({ ...person, address: { ...person.address, country: e.target.value } as any })}>
                    <option value="">Select…</option>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </Select>
                </FormField>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function EntityPeopleStep() {
  const { data, updateData, goNext } = useOnboarding()
  const entity = (data.entity ?? {}) as any

  const [directors, setDirectors] = useState<Partial<Director>[]>(entity.directors ?? [{}])
  const [authorisedPersons, setAuthorisedPersons] = useState<Partial<AuthorisedPerson>[]>(entity.authorisedPersons ?? [{}])
  const [connectedPersons, setConnectedPersons] = useState<Partial<ConnectedPerson>[]>(entity.connectedPersons ?? [])

  const handleNext = () => {
    updateData({
      entity: {
        ...entity,
        directors,
        authorisedPersons,
        connectedPersons,
      } as any,
    })
    goNext()
  }

  return (
    <StepLayout
      title="Directors, Officers & Authorised Persons"
      subtitle="Provide details of all directors, authorised signatories, and connected persons. Documents must be certified true copies."
      onNext={handleNext}
    >
      {/* Directors */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title mb-0">Directors / Board Members</h2>
          <button type="button" className="btn-ghost text-xs"
            onClick={() => setDirectors(d => [...d, {}])}>
            <Plus className="w-3.5 h-3.5" /> Add Director
          </button>
        </div>
        <p className="text-xs text-gray-500">
          All directors (including the Managing Director) must be identified. Provide certified passport/NRIC copies and proof of address (less than 3 months old).
        </p>
        <div className="space-y-3">
          {directors.map((d, i) => (
            <PersonCard
              key={i}
              title={`Director ${i + 1}`}
              person={d}
              onUpdate={updated => setDirectors(prev => prev.map((p, j) => j === i ? updated : p))}
              onRemove={() => setDirectors(prev => prev.filter((_, j) => j !== i))}
              showPosition
              showAddress
            />
          ))}
        </div>
      </div>

      {/* Authorised Persons */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title mb-0">Authorised Signatories / Persons</h2>
          <button type="button" className="btn-ghost text-xs"
            onClick={() => setAuthorisedPersons(p => [...p, {}])}>
            <Plus className="w-3.5 h-3.5" /> Add Person
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Persons authorised to act on behalf of the client, give instructions to FGC, or execute this Agreement. Provide full identity documentation.
        </p>
        <div className="space-y-3">
          {authorisedPersons.map((p, i) => (
            <PersonCard
              key={i}
              title={`Authorised Person ${i + 1}`}
              person={p}
              onUpdate={updated => setAuthorisedPersons(prev => prev.map((x, j) => j === i ? updated : x))}
              onRemove={() => setAuthorisedPersons(prev => prev.filter((_, j) => j !== i))}
              showPosition
              showAddress
            />
          ))}
        </div>
      </div>

      {/* Connected Persons */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title mb-0">Connected Persons (Section B)</h2>
          <button type="button" className="btn-ghost text-xs"
            onClick={() => setConnectedPersons(p => [...p, {}])}>
            <Plus className="w-3.5 h-3.5" /> Add Person
          </button>
        </div>
        <p className="text-xs text-gray-500">
          A "Connected Person" is any director or natural person having executive authority over the entity; or in relation to a partnership, any partner or manager; or in relation to a trust or similar arrangement, any natural person having executive authority therein.
        </p>
        {connectedPersons.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No connected persons added. Click "Add Person" above if applicable.</p>
        ) : (
          <div className="space-y-3">
            {connectedPersons.map((p, i) => (
              <PersonCard
                key={i}
                title={`Connected Person ${i + 1}`}
                person={p as any}
                onUpdate={updated => setConnectedPersons(prev => prev.map((x, j) => j === i ? updated : x))}
                onRemove={() => setConnectedPersons(prev => prev.filter((_, j) => j !== i))}
                showConnection
              />
            ))}
          </div>
        )}
      </div>

      {/* Documents reminder */}
      <div className="alert-info text-xs">
        <strong>Verification Documents Required for Each Person Above:</strong>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Certified copy of passport or official ID document (photo, full name including aliases, date of birth, nationality)</li>
          <li>Proof of address — bank statement or utility bill, less than 3 months old, full name, no P.O. Box</li>
          <li>Name change document (if applicable)</li>
        </ul>
        <p className="mt-2">
          <em>Certifier must be a lawyer, accountant, director of a regulated institution, notary public or member of the judiciary. Must sign the copy, print name clearly, and indicate position and contact details.</em>
        </p>
      </div>
    </StepLayout>
  )
}
