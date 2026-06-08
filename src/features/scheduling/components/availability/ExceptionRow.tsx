import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDateBR } from '@/lib/date-time-formatters'
import { cn } from '@/lib/utils'

import type { AvailabilityException } from '../../types/scheduling.types'
import { formatWallTime } from '../../utils/time'

type ExceptionRowProps = {
  exception: AvailabilityException
  isLoading: boolean
  isPast: boolean
  onEdit: () => void
  onDelete: () => void
}

export function ExceptionRow({
  exception,
  isLoading,
  isPast,
  onEdit,
  onDelete,
}: ExceptionRowProps) {
  return (
    <div
      data-testid={`exception-row-${exception.id}`}
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        isPast ? 'border-border/60' : 'border-border',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">
            {formatDateBR(exception.exceptionDate)}
          </p>
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
              isPast
                ? 'border-border/60 bg-muted text-muted-foreground'
                : 'border-primary/20 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15',
            )}
          >
            {isPast ? 'Passada' : 'Próxima'}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {exception.isDayOff ? (
            <span className="font-medium text-red-600 dark:text-red-400">Folga ocasional</span>
          ) : (
            <>
              <span className="font-medium text-foreground">Horário especial</span>
              {exception.startTime && exception.endTime && (
                <> · {formatWallTime(exception.startTime)} – {formatWallTime(exception.endTime)}</>
              )}
            </>
          )}
          {exception.reason && (
            <span className="ml-1 text-muted-foreground/60">· {exception.reason}</span>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          disabled={isLoading}
          aria-label="Editar exceção"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="dangerGhost"
          size="icon-sm"
          onClick={onDelete}
          disabled={isLoading}
          aria-label="Remover exceção"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
