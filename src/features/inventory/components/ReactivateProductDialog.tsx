import { Loader2, Power } from 'lucide-react'
import { Dialog } from 'radix-ui'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'

type ReactivateProductDialogProps = {
  open: boolean
  productName: string
  isReactivating: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}

export function ReactivateProductDialog({
  open,
  productName,
  isReactivating,
  error,
  onCancel,
  onConfirm,
}: ReactivateProductDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby="reactivate-dialog-title"
          aria-describedby="reactivate-dialog-desc"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 animate-in fade-in-0 zoom-in-[0.97] duration-150 focus:outline-none"
          onEscapeKeyDown={onCancel}
          onInteractOutside={onCancel}
        >
          <div className="px-8 pb-6 pt-8">
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50"
              aria-hidden="true"
            >
              <Power className="h-7 w-7 text-green-600" aria-hidden="true" />
            </div>

            <Dialog.Title
              id="reactivate-dialog-title"
              className="text-center text-xl font-bold text-slate-950"
            >
              Reativar produto
            </Dialog.Title>

            <Dialog.Description
              id="reactivate-dialog-desc"
              className="mt-2 text-center text-sm leading-6 text-slate-500"
            >
              Tem certeza que deseja reativar{' '}
              <span className="font-semibold text-slate-700">{productName}</span>? Ele voltará a
              aparecer como produto ativo no estoque.
            </Dialog.Description>

            {error && (
              <div className="mt-4">
                <InlineFeedback tone="error">{error}</InlineFeedback>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-green-100 bg-green-50/60 px-8 py-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isReactivating}>
              Cancelar
            </Button>
            <Button type="button" onClick={onConfirm} disabled={isReactivating}>
              {isReactivating && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {isReactivating ? 'Reativando...' : 'Reativar produto'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
