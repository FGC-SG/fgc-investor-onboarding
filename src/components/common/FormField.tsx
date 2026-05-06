import React from 'react'
import clsx from 'clsx'

interface Props {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ label, required, error, hint, children, className }: Props) {
  return (
    <div className={clsx('space-y-1', className)}>
      <label className="field-label">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx('field-input', error && 'border-red-400 focus:ring-red-400', className)}
      {...props}
    />
  )
)
Input.displayName = 'Input'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={clsx('field-select', error && 'border-red-400 focus:ring-red-400', className)}
      {...props}
    >
      {children}
    </select>
  )
)
Select.displayName = 'Select'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, className, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={3}
      className={clsx('field-input resize-none', error && 'border-red-400 focus:ring-red-400', className)}
      {...props}
    />
  )
)
TextArea.displayName = 'TextArea'
