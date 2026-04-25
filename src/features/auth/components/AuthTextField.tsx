import type { LucideIcon } from 'lucide-react'
import type { HTMLInputTypeAttribute } from 'react'

type AuthTextFieldProps = {
  label: string
  placeholder: string
  icon?: LucideIcon
  type?: HTMLInputTypeAttribute
}

export function AuthTextField({
  label,
  placeholder,
  icon: Icon,
  type = 'text',
}: AuthTextFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        <input
          type={type}
          placeholder={placeholder}
          className="h-12 min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
        />
      </div>
    </label>
  )
}
