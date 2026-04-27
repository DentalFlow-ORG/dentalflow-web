import { AlertTriangle, Loader2, TriangleAlert } from 'lucide-react'
import { Dialog } from 'radix-ui'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: ReactNode
  subject?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'destructive' | 'warning'
  isConfirming?: boolean
  trigger?: ReactNode
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  subject,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'destructive',
  isConfirming = false,
  trigger,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isDestructive = tone === 'destructive'

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15',
            'animate-in fade-in-0 zoom-in-[0.97] duration-150',
          )}
          onEscapeKeyDown={onCancel}
          onInteractOutside={onCancel}
        >
          {/* Header */}
          <div className="px-8 pb-6 pt-8 text-center">
            <div
              className={cn(
                'mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full',
                isDestructive
                  ? 'bg-red-100 ring-8 ring-red-50'
                  : 'bg-amber-100 ring-8 ring-amber-50',
              )}
            >
              {isDestructive ? (
                <TriangleAlert className="h-8 w-8 text-red-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              )}
            </div>

            <Dialog.Title
              id="confirm-dialog-title"
              className="text-xl font-bold text-slate-950"
            >
              {title}
            </Dialog.Title>

            {subject && (
              <p
                className={cn(
                  'mt-2 inline-flex items-center rounded-md px-3 py-1 text-sm font-semibold',
                  isDestructive
                    ? 'bg-red-50 text-red-800'
                    : 'bg-amber-50 text-amber-800',
                )}
              >
                {subject}
              </p>
            )}

            <Dialog.Description
              id="confirm-dialog-description"
              className="mt-3 text-sm leading-6 text-slate-500"
            >
              {description}
            </Dialog.Description>
          </div>

          {/* Footer */}
          <div
            className={cn(
              'flex flex-col-reverse gap-3 border-t px-8 py-5 sm:flex-row sm:justify-end',
              isDestructive ? 'border-red-100 bg-red-50/60' : 'border-amber-100 bg-amber-50/60',
            )}
          >
            <Button
              type="button"
              variant="outline"
              className="sm:w-auto"
              onClick={onCancel}
              disabled={isConfirming}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={isDestructive ? 'destructive' : 'default'}
              className="sm:w-auto"
              onClick={onConfirm}
              disabled={isConfirming}
            >
              {isConfirming && <Loader2 className="h-4 w-4 animate-spin" />}
              {isConfirming ? 'Aguarde...' : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
