import { ClipboardList, Stethoscope } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { MemberRole } from '../types/team.types'

type MemberTypeSelectorProps = {
  value: MemberRole
  onChange: (role: MemberRole) => void
}

type TypeOption = {
  role: MemberRole
  icon: React.ElementType
  title: string
  description: string
}

const OPTIONS: TypeOption[] = [
  {
    role: 'DENTIST',
    icon: Stethoscope,
    title: 'Profissional',
    description:
      'Dentista ou profissional de saúde com agenda própria e perfil público na clínica.',
  },
  {
    role: 'ASSISTANT',
    icon: ClipboardList,
    title: 'Assistente',
    description:
      'Membro da equipe para suporte operacional, recepção e gestão de agendamentos.',
  },
]

export function MemberTypeSelector({ value, onChange }: MemberTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon
        const selected = value === opt.role
        return (
          <button
            key={opt.role}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(opt.role)}
            className={cn(
              'flex min-w-0 items-start gap-4 rounded-xl border-2 p-4 text-left transition-all',
              selected
                ? 'border-primary bg-blue-50/60 shadow-sm shadow-primary/10 dark:bg-primary/15'
                : 'border-border bg-card hover:border-primary/40',
            )}
          >
            <div
              className={cn(
                'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                selected
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  'break-words font-semibold',
                  selected ? 'text-primary' : 'text-foreground',
                )}
              >
                {opt.title}
              </p>
              <p className="mt-1 break-words text-sm leading-5 text-muted-foreground">
                {opt.description}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
