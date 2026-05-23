import { CheckCircle2, Circle } from 'lucide-react'

type Requirement = {
  label: string
  met: boolean
}

function getRequirements(password: string): Requirement[] {
  return [
    { label: 'Mínimo de 8 caracteres', met: password.length >= 8 },
    { label: 'Letra maiúscula (A–Z)', met: /[A-Z]/.test(password) },
    { label: 'Letra minúscula (a–z)', met: /[a-z]/.test(password) },
    { label: 'Número (0–9)', met: /[0-9]/.test(password) },
    { label: 'Caractere especial (!@#$…)', met: /[^a-zA-Z0-9]/.test(password) },
  ]
}

type PasswordRequirementsProps = {
  password: string
  visible: boolean
}

export function PasswordRequirements({ password, visible }: PasswordRequirementsProps) {
  if (!visible && password.length === 0) return null

  const requirements = getRequirements(password)

  return (
    <ul
      role="list"
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
