import { AlertTriangle, Loader2 } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { FormField, TextArea } from '@/components/common/FormField'

type CancelAppointmentDialogProps = {
  open: boolean
  patientName: string
  isCanceling: boolean
  onCancel: () => void
  onConfirm: (reason: string) => void
}

export function CancelAppointmentDialog({
  open,
  patientName,
  isCanceling,
  onCancel,
  onConfirm,
}: CancelAppointmentDialogProps) {
  const [reason, setReason] = useState('')

  function handleConfirm() {
    onConfirm(reason)
    setReason('')
  }

  function handleCancel() {
    setReason('')
    onCancel()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && handleCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={handleCancel}
          onInteractOutside={handleCancel}
        >
          <div className="px-8 pb-6 pt-8">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 ring-8 ring-red-50">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <Dialog.Title
              className="text-center text-xl font-bold text-foreground"
            >
              Cancelar agendamento
            </Dialog.Title>
            <Dialog.Description
              className="mt-2 text-center text-sm leading-6 text-muted-foreground"
            >
              O agendamento de{' '}
              <span className="font-semibold text-foreground">{patientName}</span>{' '}
              será cancelado.
            </Dialog.Description>

            <div className="mt-5">
              <FormField label="Motivo do cancelamento" optional>
                <TextArea
                  placeholder="Informe o motivo (opcional)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="min-h-0"
                  disabled={isCanceling}
                />
              </FormField>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-red-100 bg-red-50/60 px-8 py-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isCanceling}
            >
              Voltar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={isCanceling}
            >
              {isCanceling && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCanceling ? 'Cancelando...' : 'Confirmar cancelamento'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
