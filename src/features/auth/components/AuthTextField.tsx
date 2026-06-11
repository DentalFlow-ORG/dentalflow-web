import { PasswordInput } from '@/components/common/PasswordInput'
import type { LucideIcon } from 'lucide-react'
import type { HTMLInputTypeAttribute } from 'react'

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
  onChange,
  onFocus,
  onBlur,
}: AuthTextFieldProps) {
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
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
    )
  }

  return (
    <div className="block">
      <label htmlFor={name} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15">
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
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  )
}
