import { AlertTriangle, Loader2 } from 'lucide-react'
import { Dialog } from 'radix-ui'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'

type DeactivateProductDialogProps = {
  open: boolean
  productName: string
  isDeactivating: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}

export function DeactivateProductDialog({
  open,
  productName,
  isDeactivating,
  error,
  onCancel,
  onConfirm,
}: DeactivateProductDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby="deactivate-dialog-title"
          aria-describedby="deactivate-dialog-desc"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/15 animate-in fade-in-0 zoom-in-[0.97] duration-150 focus:outline-none"
          onEscapeKeyDown={onCancel}
          onInteractOutside={onCancel}
        >
          <div className="px-8 pb-6 pt-8">
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 ring-8 ring-red-50"
              aria-hidden="true"
            >
              <AlertTriangle className="h-7 w-7 text-red-600" aria-hidden="true" />
            </div>

            <Dialog.Title
              id="deactivate-dialog-title"
              className="text-center text-xl font-bold text-foreground"
            >
              Desativar produto
            </Dialog.Title>

            <Dialog.Description
              id="deactivate-dialog-desc"
              className="mt-2 text-center text-sm leading-6 text-muted-foreground"
            >
              Tem certeza que deseja desativar{' '}
              <span className="font-semibold text-foreground">{productName}</span>? Ele deixará de
              aparecer como produto ativo no estoque, mas o histórico será preservado.
            </Dialog.Description>

            {error && (
              <div className="mt-4">
                <InlineFeedback tone="error">{error}</InlineFeedback>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-red-100 bg-red-50/60 px-8 py-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isDeactivating}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeactivating}>
              {isDeactivating && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {isDeactivating ? 'Desativando...' : 'Desativar produto'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
