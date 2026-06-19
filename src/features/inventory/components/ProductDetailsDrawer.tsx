import { MoveRight, Pencil, Power, PowerOff, X } from 'lucide-react'
import { Dialog } from 'radix-ui'

import { Button } from '@/components/ui/button'

import type { StockProduct } from '../types/inventory.types'
import {
  formatBRLCents,
  formatProductDate,
  formatProductDateTime,
  formatQuantity,
} from '../utils/inventory-format'
import { InventorySummaryChip } from './InventorySummaryChip'
import { StockMovementHistory } from './StockMovementHistory'
import { StockStatusBadge } from './StockStatusBadge'

type ProductDetailsDrawerProps = {
  product: StockProduct | null
  isOwner: boolean
  movementHistoryRefreshKey: number
  onClose: () => void
  onEdit: (product: StockProduct) => void
  onMove: (product: StockProduct) => void
  onDeactivate: (product: StockProduct) => void
  onReactivate: (product: StockProduct) => void
}

export function ProductDetailsDrawer({
  product,
  isOwner,
  movementHistoryRefreshKey,
  onClose,
  onEdit,
  onMove,
  onDeactivate,
  onReactivate,
}: ProductDetailsDrawerProps) {
  const isActive = product?.status !== 'INACTIVE'

  return (
    <Dialog.Root open={!!product} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in-0 duration-200" />
        <Dialog.Content
          aria-labelledby="product-details-title"
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-muted shadow-2xl shadow-black/15 animate-in slide-in-from-right duration-200 focus:outline-none"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          {/*
            Dialog.Title must always be in Dialog.Content — even during the close animation
            when product becomes null and {product && ...} would hide the title.
            The sr-only title provides the accessible dialog label; the visible product
            name is rendered as a plain <p> inside the conditional block below.
          */}
          <Dialog.Title id="product-details-title" className="sr-only">
            {product?.name ?? 'Detalhes do produto'}
          </Dialog.Title>
          {product && (
            <>
              {/* ── Header ── */}
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-card px-6 py-5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Produto
                  </p>
                  <p className="mt-1 text-lg font-semibold leading-tight text-foreground">
                    {product.name}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StockStatusBadge status={product.status} />
                    <span className="text-xs text-muted-foreground">{product.category.name}</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClose}
                  aria-label="Fechar detalhes"
                  className="shrink-0"
                >
                  <X aria-hidden="true" />
                </Button>
              </div>

              {/* ── Scrollable body ── */}
              <div className="app-scrollbar flex-1 space-y-5 overflow-y-auto px-5 py-5">
                {/* Quantity summary */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InventorySummaryChip
                    label="Quantidade atual"
                    value={formatQuantity(product.currentQuantity, product.unit)}
                    tone={
                      product.status === 'EMPTY' || product.status === 'EXPIRED'
                        ? 'danger'
                        : product.status === 'LOW' || product.status === 'EXPIRING'
                          ? 'warning'
                          : 'neutral'
                    }
                  />
                  <InventorySummaryChip
                    label="Quantidade mínima"
                    value={
                      product.minQuantity > 0
                        ? formatQuantity(product.minQuantity, product.unit)
                        : '—'
                    }
                    tone="neutral"
                  />
                </div>

                {/* Ações — only rendered when at least one action is available */}
                {(isActive || isOwner) && (
                  <DrawerSection title="Ações">
                    <div className="flex flex-col gap-1.5 p-3">
                      {isActive && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => onEdit(product)}
                        >
                          <Pencil aria-hidden="true" />
                          Editar produto
                        </Button>
                      )}
                      {isActive && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          aria-label={`Movimentar estoque de ${product.name}`}
                          onClick={() => onMove(product)}
                        >
                          <MoveRight aria-hidden="true" />
                          Movimentar
                        </Button>
                      )}
                      {isOwner && isActive && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="w-full justify-start"
                          aria-label={`Desativar produto ${product.name}`}
                          onClick={() => onDeactivate(product)}
                        >
                          <PowerOff aria-hidden="true" />
                          Desativar produto
                        </Button>
                      )}
                      {isOwner && !isActive && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          aria-label={`Reativar produto ${product.name}`}
                          onClick={() => onReactivate(product)}
                        >
                          <Power aria-hidden="true" />
                          Reativar produto
                        </Button>
                      )}
                    </div>
                  </DrawerSection>
                )}

                {/* Informações do produto */}
                <DrawerSection title="Informações do produto">
                  <DrawerRow label="Categoria">{product.category.name}</DrawerRow>
                  <DrawerRow label="Unidade">{product.unit}</DrawerRow>
                  <DrawerRow label="Valor de compra">
                    {product.purchasePrice !== null ? (
                      formatBRLCents(product.purchasePrice)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </DrawerRow>
                  <DrawerRow label="Fornecedor">
                    {product.supplier ?? <span className="text-muted-foreground">—</span>}
                  </DrawerRow>
                  <DrawerRow label="Validade">
                    {product.expiresAt ? (
                      formatProductDate(product.expiresAt)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </DrawerRow>
                </DrawerSection>

                {/* Descrição e observações — rendered only when at least one field is set */}
                {(product.description || product.notes) && (
                  <DrawerSection title="Descrição e observações">
                    {product.description && (
                      <div className="px-4 py-3">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">Descrição</p>
                        <p className="break-words text-sm leading-6 text-foreground">
                          {product.description}
                        </p>
                      </div>
                    )}
                    {product.notes && (
                      <div className="px-4 py-3">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                          Observações internas
                        </p>
                        <p className="break-words text-sm leading-6 text-foreground">
                          {product.notes}
                        </p>
                      </div>
                    )}
                  </DrawerSection>
                )}

                {/* Registro */}
                <DrawerSection title="Registro">
                  <DrawerRow label="Cadastrado em">
                    {formatProductDateTime(product.createdAt)}
                  </DrawerRow>
                  <DrawerRow label="Atualizado em">
                    {formatProductDateTime(product.updatedAt)}
                  </DrawerRow>
                </DrawerSection>

                {/* Movimentações recentes */}
                <DrawerSection title="Movimentações recentes">
                  <StockMovementHistory product={product} refreshKey={movementHistoryRefreshKey} />
                </DrawerSection>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function DrawerSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="divide-y divide-border">{children}</div>
      </div>
    </div>
  )
}

function DrawerRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right font-medium text-foreground">{children}</span>
    </div>
  )
}
