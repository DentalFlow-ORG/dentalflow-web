import { CheckCircle2, Circle } from 'lucide-react'

import { getPasswordRequirements } from '@/lib/validators/password'

type PasswordRequirementsProps = {
  password: string
  visible: boolean
}

export function PasswordRequirements({ password, visible }: PasswordRequirementsProps) {
  if (!visible && password.length === 0) return null

  const requirements = getPasswordRequirements(password)

  return (
    <ul
      aria-live="polite"
      aria-label="Requisitos de senha"
      className="mt-2 space-y-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs"
    >
      {requirements.map((req) => (
        <li key={req.label} className="flex items-center gap-2">
          {req.met ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
          ) : (
            <Circle className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden="true" />
          )}
          <span className={req.met ? 'text-emerald-700' : 'text-slate-500'}>{req.label}</span>
        </li>
      ))}
    </ul>
  )
}
