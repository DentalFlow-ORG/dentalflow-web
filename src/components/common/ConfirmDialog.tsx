import { Loader2, TriangleAlert } from 'lucide-react'
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
  confirmDisabled?: boolean
  children?: ReactNode
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
  confirmDisabled = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isDestructive = tone === 'destructive'

  // Escape, outside click and the close request all funnel through
  // onOpenChange. While the action is in flight the dialog must stay open so
  // the pending state remains visible and the outcome is not hidden.
  function handleOpenChange(isOpen: boolean) {
    if (!isOpen && !isConfirming) onCancel()
  }

  function preventDismissWhileConfirming(event: Event) {
    if (isConfirming) event.preventDefault()
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/15',
            'animate-in fade-in-0 zoom-in-[0.97] duration-150',
          )}
          onEscapeKeyDown={preventDismissWhileConfirming}
          onInteractOutside={preventDismissWhileConfirming}
        >
          {/* Header */}
          <div className="px-8 pb-6 pt-8 text-center">
            <div
              className={cn(
                'mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full',
                isDestructive
                  ? 'bg-red-100 ring-8 ring-red-50 dark:bg-red-950/40 dark:ring-red-950/20'
                  : 'bg-amber-100 ring-8 ring-amber-50 dark:bg-amber-950/40 dark:ring-amber-950/20',
              )}
            >
              {isDestructive ? (
                <TriangleAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
              ) : (
                <TriangleAlert className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              )}
            </div>

            <Dialog.Title className="text-xl font-bold text-foreground">{title}</Dialog.Title>

            {subject && (
              <p
                className={cn(
                  'mt-2 inline-flex items-center rounded-md px-3 py-1 text-sm font-semibold',
                  isDestructive
                    ? 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300'
                    : 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
                )}
              >
                {subject}
              </p>
            )}

            <Dialog.Description className="mt-3 text-sm leading-6 text-muted-foreground">
              {description}
            </Dialog.Description>
          </div>

          {children && <div className="border-t border-border px-8 pb-4 pt-4">{children}</div>}

          {/* Footer */}
          <div
            className={cn(
              'flex flex-col-reverse gap-3 border-t px-8 py-5 sm:flex-row sm:justify-end',
              isDestructive
                ? 'border-red-100 bg-red-50/60 dark:border-red-900/30 dark:bg-red-950/30'
                : 'border-amber-100 bg-amber-50/60 dark:border-amber-900/30 dark:bg-amber-950/30',
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
              disabled={isConfirming || confirmDisabled}
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
