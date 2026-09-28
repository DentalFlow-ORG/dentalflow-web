import { PasswordInput } from '@/components/common/PasswordInput'
import type { LucideIcon } from 'lucide-react'
import type { HTMLInputTypeAttribute } from 'react'

import { cn } from '@/lib/utils'

type AuthTextFieldProps = {
  label: string
  placeholder: string
  icon?: LucideIcon
  type?: HTMLInputTypeAttribute
  name: string
  value: string
  autoComplete?: string
  maxLength?: number
  minLength?: number
  required?: boolean
  inputMode?: 'email' | 'text'
  /** Validation message shown under the field and linked for assistive tech. */
  error?: string | null
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
}

export function AuthTextField({
  label,
  placeholder,
  icon: Icon,
  type = 'text',
  name,
  value,
  autoComplete,
  maxLength,
  minLength,
  required = true,
  inputMode,
  error,
  onChange,
  onFocus,
  onBlur,
}: AuthTextFieldProps) {
  const errorId = `${name}-error`
  const errorMessage = error ? (
    <span id={errorId} role="alert" className="mt-1.5 block text-xs leading-5 text-destructive">
      {error}
    </span>
  ) : null
  const invalidProps = {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  }

  if (type === 'password') {
    return (
      <div className="block">
        <label htmlFor={name} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        <PasswordInput
          id={name}
          name={name}
          value={value}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          required={required}
          placeholder={placeholder}
          icon={Icon}
          variant="auth"
          wrapperClassName={error ? 'border-destructive' : undefined}
          {...invalidProps}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {errorMessage}
      </div>
    )
  }

  return (
    <div className="block">
      <label htmlFor={name} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div
        className={cn(
          'mt-2 flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15',
          error && 'border-destructive',
        )}
      >
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          required={required}
          inputMode={inputMode}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
          {...invalidProps}
        />
      </div>
      {errorMessage}
    </div>
  )
}
