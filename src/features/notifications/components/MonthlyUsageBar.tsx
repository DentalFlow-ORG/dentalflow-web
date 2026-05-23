import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import type { NotificationQuota } from '../types/notifications.types'

type MonthlyUsageBarProps = {
  quota: NotificationQuota
  showUpgradeCta?: boolean
  className?: string
}

export function MonthlyUsageBar({ quota, showUpgradeCta = true, className }: MonthlyUsageBarProps) {
  const { used, limit, available } = quota
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const isNearLimit = pct >= 80
  const isExhausted = available === 0

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          {used} / {limit} mensagens este mês
        </span>
        {isNearLimit && showUpgradeCta && (
          <Link
            to="/app/assinatura"
            className="text-xs font-semibold text-primary underline underline-offset-2 hover:opacity-80"
          >
            Fazer upgrade
          </Link>
        )}
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isExhausted
              ? 'bg-red-500'
              : isNearLimit
                ? 'bg-orange-500'
                : 'bg-primary',
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={used}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-label={`${used} de ${limit} mensagens usadas`}
        />
      </div>

      {isExhausted && (
        <p className="text-xs text-red-600 dark:text-red-400">
          Limite atingido.{' '}
          {showUpgradeCta && (
            <Link to="/app/assinatura" className="font-semibold underline underline-offset-2">
              Faça upgrade
            </Link>
          )}{' '}
          para continuar enviando.
        </p>
      )}
    </div>
  )
}
