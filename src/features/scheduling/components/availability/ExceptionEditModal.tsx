import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'

import { formatDateLongBR } from '@/lib/date-time-formatters'

import type {
  AvailabilityException,
  CreateAvailabilityExceptionDto,
} from '../../types/scheduling.types'
import { ExceptionForm } from './ExceptionForm'

type ExceptionEditModalProps = {
  open: boolean
  exception: AvailabilityException | null
  isSaving: boolean
  isDeleting: boolean
  onClose: () => void
  onSave: (dto: CreateAvailabilityExceptionDto) => void
  onDelete: () => void
}

export function ExceptionEditModal({
  open,
  exception,
  isSaving,
  isDeleting,
  onClose,
  onSave,
  onDelete,
}: ExceptionEditModalProps) {
  // Keep the last known exception visible during the close animation
  const [displayed, setDisplayed] = useState<AvailabilityException | null>(null)

  useEffect(() => {
    if (exception) setDisplayed(exception)
  }, [exception])

  function handleEscapeOrOutside() {
    if (isSaving || isDeleting) return
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && handleEscapeOrOutside()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby="exception-edit-title"
          className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={(e) => {
            if (isSaving || isDeleting) {
              e.preventDefault()
              return
            }
            onClose()
          }}
          onInteractOutside={(e) => {
            if (isSaving || isDeleting) {
              e.preventDefault()
              return
            }
            onClose()
          }}
        >
          <div className="shrink-0 border-b border-border px-6 py-5">
            <Dialog.Title
              id="exception-edit-title"
              className="text-base font-semibold text-foreground"
            >
              Editar exceção
            </Dialog.Title>
            {displayed && (
              <Dialog.Description className="mt-0.5 text-sm text-muted-foreground capitalize">
                {formatDateLongBR(displayed.exceptionDate)}
              </Dialog.Description>
            )}
          </div>

          <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
            {displayed && (
              <ExceptionForm
                initial={{
                  exceptionDate: displayed.exceptionDate,
                  isDayOff: displayed.isDayOff,
                  startTime: displayed.startTime,
                  endTime: displayed.endTime,
                  reason: displayed.reason,
                }}
                isLoading={isSaving}
                onSubmit={onSave}
                onCancel={onClose}
                saveLabel="Salvar alterações"
                onDelete={onDelete}
                isDeleting={isDeleting}
                className="space-y-4"
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
