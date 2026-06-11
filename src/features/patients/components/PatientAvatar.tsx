import { cn } from '@/lib/utils'

import { getAvatarInitials } from './PatientAvatarWidget'

type PatientAvatarSize = 'sm' | 'md' | 'lg'

type PatientAvatarProps = {
  /** Patient display name — used for initials and accessible label. */
  name: string
  /**
   * Raw base64 JPEG string (no data-URL prefix), as returned by the avatar API.
   * When absent or null, an initials circle is rendered instead.
   */
  avatarUrl?: string | null
  size?: PatientAvatarSize
  className?: string
}

const SIZE_CLASSES: Record<PatientAvatarSize, string> = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-sm',
}

/**
 * Display-only patient avatar with an initials fallback.
 *
 * This component is intentionally read-only — it shows an avatar image or
 * initials circle but does not handle upload, crop, or edit interactions.
 * For interactive upload/replace functionality use `PatientAvatarWidget`.
 */
export function PatientAvatar({ name, avatarUrl, size = 'md', className }: PatientAvatarProps) {
  const sizeClass = SIZE_CLASSES[size]
  const initials = getAvatarInitials(name)
  const label = name?.trim() || 'Paciente'

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'shrink-0 select-none overflow-hidden rounded-full',
        'flex items-center justify-center font-bold',
        sizeClass,
        !avatarUrl && 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
        className,
      )}
    >
      {avatarUrl ? (
        <img
          src={`data:image/jpeg;base64,${avatarUrl}`}
          alt=""
          aria-hidden="true"
          className={cn('rounded-full object-cover', sizeClass)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  )
}
