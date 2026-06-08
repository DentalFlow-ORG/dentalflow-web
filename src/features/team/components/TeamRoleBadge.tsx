import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type TeamRoleBadgeProps = {
  role: string
  className?: string
}

// ── Role config ───────────────────────────────────────────────────────────────

type RoleConfig = {
  label: string
  className: string
}

const ROLE_CONFIG: Record<string, RoleConfig> = {
  DENTIST: {
    label: 'Profissional',
    className:
      'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300',
  },
  DOCTOR: {
    label: 'Profissional',
    className:
      'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300',
  },
  ASSISTANT: {
    label: 'Assistente',
    className:
      'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300',
  },
  OWNER: {
    label: 'Dono',
    className:
      'border-primary/30 bg-primary/10 text-primary dark:border-primary/40 dark:bg-primary/20 dark:text-primary',
  },
  ADMIN: {
    label: 'Admin',
    className:
      'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300',
  },
  PATIENT: {
    label: 'Paciente',
    className:
      'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300',
  },
}

const FALLBACK_CONFIG: RoleConfig = {
  label: '',
  className:
    'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TeamRoleBadge({ role, className }: TeamRoleBadgeProps) {
  const config = ROLE_CONFIG[role] ?? { ...FALLBACK_CONFIG, label: role }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
