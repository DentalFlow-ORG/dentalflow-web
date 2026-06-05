import { StatusBadge } from '@/components/common/StatusBadge'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type ProfilePublishBadgeProps = {
  isPublished?: boolean | null
  hasProfile?: boolean
  className?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProfilePublishBadge({
  isPublished,
  hasProfile = true,
  className,
}: ProfilePublishBadgeProps) {
  if (!hasProfile) {
    return (
      <StatusBadge tone="muted" className={cn('opacity-70', className)}>
        Sem perfil
      </StatusBadge>
    )
  }

  if (isPublished) {
    return (
      <StatusBadge tone="success" className={className}>
        Publicado
      </StatusBadge>
    )
  }

  return (
    <StatusBadge tone="muted" className={className}>
      Não publicado
    </StatusBadge>
  )
}
