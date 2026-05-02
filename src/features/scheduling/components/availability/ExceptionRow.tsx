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
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">
          {formatDateBR(exception.exceptionDate)}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
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
            <span className="ml-1 text-slate-400">· {exception.reason}</span>
          )}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
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
          className="text-slate-400 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
