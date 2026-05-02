import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDateBR } from '@/lib/date-time-formatters'

import { formatWallTime } from '../../utils/time'
import type { AvailabilityException } from '../../types/scheduling.types'

type ExceptionRowProps = {
  exception: AvailabilityException
  isLoading: boolean
  onDelete: () => void
}

export function ExceptionRow({ exception, isLoading, onDelete }: ExceptionRowProps) {
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
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        disabled={isLoading}
        aria-label="Remover exceção"
        className="shrink-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
