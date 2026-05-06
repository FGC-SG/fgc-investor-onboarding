import React from 'react'
import { FormField, Input, Select } from './FormField'
import { COUNTRIES } from '../../utils/constants'

interface Props {
  prefix: string
  register: (name: string, opts?: object) => object
  errors?: Record<string, { message?: string }>
  required?: boolean
}

export function AddressFields({ prefix, register, errors, required }: Props) {
  const err = (field: string) => {
    const key = `${prefix}.${field}`
    return errors?.[key]?.message
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <FormField label="Address Line 1" required={required} error={err('line1')}>
          <Input
            placeholder="Street address, P.O. Box, company name"
            {...(register(`${prefix}.line1`, required ? { required: 'Required' } : {}) as object)}
            error={!!err('line1')}
          />
        </FormField>
      </div>
      <div className="sm:col-span-2">
        <FormField label="Address Line 2">
          <Input
            placeholder="Apartment, suite, unit, building, floor, etc."
            {...(register(`${prefix}.line2`) as object)}
          />
        </FormField>
      </div>
      <FormField label="City / Town" required={required} error={err('city')}>
        <Input
          placeholder="City"
          {...(register(`${prefix}.city`, required ? { required: 'Required' } : {}) as object)}
          error={!!err('city')}
        />
      </FormField>
      <FormField label="State / Province">
        <Input
          placeholder="State or province (if applicable)"
          {...(register(`${prefix}.state`) as object)}
        />
      </FormField>
      <FormField label="Postal / ZIP Code" required={required} error={err('postalCode')}>
        <Input
          placeholder="Postal code"
          {...(register(`${prefix}.postalCode`, required ? { required: 'Required' } : {}) as object)}
          error={!!err('postalCode')}
        />
      </FormField>
      <FormField label="Country" required={required} error={err('country')}>
        <Select
          {...(register(`${prefix}.country`, required ? { required: 'Required' } : {}) as object)}
          error={!!err('country')}
        >
          <option value="">Select country…</option>
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </Select>
      </FormField>
    </div>
  )
}
