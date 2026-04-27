import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  GlobalAlertsContext,
  type AlertInput,
  type AlertItem,
  type AlertTone,
} from './global-alerts-context'

const toneStyles: Record<
  AlertTone,
  { icon: LucideIcon; container: string; iconClassName: string }
> = {
  success: {
    icon: CheckCircle2,
    container: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    iconClassName: 'text-emerald-700',
  },
  error: {
    icon: XCircle,
    container: 'border-red-200 bg-red-50 text-red-950',
    iconClassName: 'text-red-700',
  },
  warning: {
    icon: AlertTriangle,
    container: 'border-amber-200 bg-amber-50 text-amber-950',
    iconClassName: 'text-amber-700',
  },
  info: {
    icon: Info,
    container: 'border-blue-200 bg-blue-50 text-blue-950',
    iconClassName: 'text-primary',
  },
}

type GlobalAlertsProviderProps = {
  children: ReactNode
}

export function GlobalAlertsProvider({ children }: GlobalAlertsProviderProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([])

  const dismissAlert = useCallback((id: string) => {
    setAlerts((currentAlerts) =>
      currentAlerts.filter((alert) => alert.id !== id),
    )
  }, [])

  const showAlert = useCallback(
    ({
      title,
      description,
      tone = 'info',
      durationMs = 5000,
    }: AlertInput) => {
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`

      setAlerts((currentAlerts) => [
        ...currentAlerts,
        { id, title, description, tone, durationMs },
      ])

      if (durationMs > 0) {
        window.setTimeout(() => dismissAlert(id), durationMs)
      }

      return id
    },
    [dismissAlert],
  )

  const value = useMemo(
    () => ({ showAlert, dismissAlert }),
    [dismissAlert, showAlert],
  )

  return (
    <GlobalAlertsContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        {alerts.map((alert) => {
          const styles = toneStyles[alert.tone]
          const Icon = styles.icon

          return (
            <div
              key={alert.id}
              className={cn(
                'pointer-events-auto flex gap-3 rounded-lg border p-4 shadow-lg shadow-slate-950/10 backdrop-blur animate-in fade-in-0 slide-in-from-top-2 duration-200',
                styles.container,
              )}
              role="status"
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', styles.iconClassName)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{alert.title}</p>
                {alert.description && (
                  <p className="mt-1 text-sm leading-5 opacity-80">
                    {alert.description}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="-mr-1 -mt-1 text-current hover:bg-black/5"
                aria-label="Fechar alerta"
                onClick={() => dismissAlert(alert.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )
        })}
      </div>
    </GlobalAlertsContext.Provider>
  )
}
