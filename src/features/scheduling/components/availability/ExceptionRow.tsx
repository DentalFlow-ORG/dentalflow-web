import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDateBR } from '@/lib/date-time-formatters'

import { formatWallTime } from '../../utils/time'
import type { AvailabilityException, CreateAvailabilityExceptionDto } from '../../types/scheduling.types'
import { ExceptionForm } from './ExceptionForm'

type ExceptionRowProps = {
  exception: AvailabilityException
  isEditing: boolean
  isLoading: boolean
  onEditStart: () => void
  onEditCancel: () => void
  onEdit: (dto: CreateAvailabilityExceptionDto) => void
  onDelete: () => void
}

export function ExceptionRow({
  exception,
  isEditing,
  isLoading,
  onEditStart,
  onEditCancel,
  onEdit,
  onDelete,
}: ExceptionRowProps) {
  if (isEditing) {
    return (
      <ExceptionForm
        initial={{
          exceptionDate: exception.exceptionDate,
          isDayOff: exception.isDayOff,
          startTime: exception.startTime,
          endTime: exception.endTime,
          reason: exception.reason,
        }}
        isLoading={isLoading}
        onSubmit={onEdit}
        onCancel={onEditCancel}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          {formatDateBR(exception.exceptionDate)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {exception.isDayOff ? (
            <span className="font-medium text-red-600">Folga</span>
          ) : (
            <>
              Horário especial:{' '}
              {exception.startTime && formatWallTime(exception.startTime)}
              {' – '}
              {exception.endTime && formatWallTime(exception.endTime)}
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
          onClick={onEditStart}
          disabled={isLoading}
          aria-label="Editar exceção"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          disabled={isLoading}
          aria-label="Remover exceção"
          className="text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
