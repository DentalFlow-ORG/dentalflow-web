import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type TeamMemberAvatarSize = 'sm' | 'md' | 'lg'

type TeamMemberAvatarProps = {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  role?: string | null
  size?: TeamMemberAvatarSize
  className?: string
}

// ── Size classes — mirrors PatientAvatar's size map ──────────────────────────

const SIZE_CLASSES: Record<TeamMemberAvatarSize, string> = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-sm',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null,
): string {
  const first = firstName?.trim()
  const last = lastName?.trim()
  if (first && last) return (first[0] + last[0]).toUpperCase()
  if (first) return first.slice(0, 2).toUpperCase()
  if (email) return email.split('@')[0].slice(0, 2).toUpperCase()
  return '?'
}

function getAriaLabel(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null,
): string {
  const parts = [firstName?.trim(), lastName?.trim()].filter(Boolean)
  if (parts.length > 0) return parts.join(' ')
  if (email) return email
  return 'Membro da equipe'
}

function getRoleColorClass(role?: string | null): string {
  switch (role) {
    case 'DENTIST':
    case 'DOCTOR':
      return 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
    case 'ASSISTANT':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TeamMemberAvatar({
  firstName,
  lastName,
  email,
  role,
  size = 'md',
  className,
}: TeamMemberAvatarProps) {
  return (
    <div
      role="img"
      aria-label={getAriaLabel(firstName, lastName, email)}
      className={cn(
        'shrink-0 select-none overflow-hidden rounded-full',
        'flex items-center justify-center font-bold',
        SIZE_CLASSES[size],
        getRoleColorClass(role),
        className,
      )}
    >
      <span aria-hidden="true">{getInitials(firstName, lastName, email)}</span>
    </div>
  )
}
