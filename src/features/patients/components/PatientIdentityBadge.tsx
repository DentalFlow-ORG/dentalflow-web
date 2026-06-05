import { Mail, Phone } from 'lucide-react'

import { cn } from '@/lib/utils'

import { PatientAvatar } from './PatientAvatar'

type PatientIdentityBadgeProps = {
  name: string
  email?: string | null
  phone?: string | null
  /** Raw base64 JPEG avatar string (no data-URL prefix). */
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  /**
   * When `true` (default), email and phone are displayed below the name.
   * Set to `false` for compact contexts that only need the name and avatar.
   */
  showContact?: boolean
  className?: string
}

/**
 * Compact patient identity block: avatar + name + optional contact info.
 *
 * Suitable for patient list rows, attention queue items, appointment summaries,
 * and any context that needs to display who a patient is at a glance.
 */
export function PatientIdentityBadge({
  name,
  email,
  phone,
  avatarUrl,
  size = 'md',
  showContact = true,
  className,
}: PatientIdentityBadgeProps) {
  const hasContact = showContact && (email || phone)

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <PatientAvatar name={name} avatarUrl={avatarUrl} size={size} />

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {name || 'Paciente'}
        </p>

        {hasContact && (
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            {email && (
              <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{email}</span>
              </span>
            )}
            {phone && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>{phone}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
