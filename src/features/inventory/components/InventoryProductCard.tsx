import {
  AlertTriangle,
  Eye,
  Loader2,
  Minus,
  MoreHorizontal,
  MoveRight,
  Pencil,
  Plus,
  Power,
  PowerOff,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import type { StockProduct } from '../types/inventory.types'
import { formatBRLCents, formatProductDate, formatQuantity } from '../utils/inventory-format'
import { StockStatusBadge } from './StockStatusBadge'

type InventoryProductCardProps = {
  product: StockProduct
  onViewDetails: (product: StockProduct) => void
  onEdit: (product: StockProduct) => void
  onMove: (product: StockProduct) => void
  onDeactivate?: (product: StockProduct) => void
  onReactivate?: (product: StockProduct) => void
  quickMovingIds: Set<string>
  onQuickMove: (product: StockProduct, direction: 'in' | 'out') => void
}

export function InventoryProductCard({
  product,
  onViewDetails,
  onEdit,
  onMove,
  onDeactivate,
  onReactivate,
  quickMovingIds,
  onQuickMove,
}: InventoryProductCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isInactive = product.status === 'INACTIVE'
  const hasStockWarning = product.status === 'EMPTY' || product.status === 'LOW'
  const hasExpiryWarning = product.status === 'EXPIRED' || product.status === 'EXPIRING'

  const hasMenuActions = !isInactive ? true : !!onReactivate

  return (
    <article
      className={`overflow-hidden rounded-lg border p-4 shadow-sm ${isInactive ? 'border-border bg-muted/60' : 'border-border bg-card'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`truncate text-sm font-semibold ${isInactive ? 'text-muted-foreground' : 'text-foreground'}`}
          >
            {product.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{product.category.name}</p>
        </div>
        <StockStatusBadge status={product.status} />
      </div>

      {/* Stock warning */}
      {hasStockWarning && (
        <div
          className={`mt-3 flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium ${product.status === 'EMPTY' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300' : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300'}`}
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {product.status === 'EMPTY'
            ? 'Sem estoque — necessita reposição'
            : 'Estoque abaixo do mínimo'}
        </div>
      )}

      {/* Expiry warning */}
      {hasExpiryWarning && (
        <div
          className={`mt-3 flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium ${product.status === 'EXPIRED' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300' : 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800/50 dark:bg-orange-950/30 dark:text-orange-300'}`}
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {product.status === 'EXPIRED' ? 'Validade vencida' : 'Validade próxima do vencimento'}
        </div>
      )}

      {/* Data grid */}
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
        <div className="min-w-0">
          <dt className="font-medium uppercase tracking-wide text-muted-foreground">Quantidade</dt>
          <dd
            className={`mt-0.5 font-semibold ${product.status === 'EMPTY' ? 'text-red-600 dark:text-red-400' : product.status === 'LOW' ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'}`}
          >
            {formatQuantity(product.currentQuantity, product.unit)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-medium uppercase tracking-wide text-muted-foreground">Mínimo</dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {product.minQuantity > 0 ? (
              formatQuantity(product.minQuantity, product.unit)
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-medium uppercase tracking-wide text-muted-foreground">Validade</dt>
          <dd
            className={`mt-0.5 font-medium ${product.status === 'EXPIRED' ? 'text-red-600 dark:text-red-400' : product.status === 'EXPIRING' ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'}`}
          >
            {product.expiresAt ? (
              formatProductDate(product.expiresAt)
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-medium uppercase tracking-wide text-muted-foreground">Fornecedor</dt>
          <dd className="mt-0.5 truncate font-medium text-foreground">
            {product.supplier ?? <span className="text-muted-foreground">—</span>}
          </dd>
        </div>
        {product.purchasePrice !== null && (
          <div className="col-span-2 min-w-0">
            <dt className="font-medium uppercase tracking-wide text-muted-foreground">
              Preço de compra
            </dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {formatBRLCents(product.purchasePrice)}
            </dd>
          </div>
        )}
      </dl>

      {/* Quick quantity controls */}
      {!isInactive && (
        <div className="mt-3 flex items-center justify-center gap-2 border-t border-border/50 pt-3">
          <button
            type="button"
            title={
              product.currentQuantity < 1
                ? 'Estoque insuficiente para saída rápida de 1 unidade'
                : 'Remover 1 unidade'
            }
            aria-label={
              product.currentQuantity < 1
                ? 'Estoque insuficiente para saída rápida de 1 unidade'
                : `Remover 1 unidade de ${product.name}`
            }
            disabled={product.currentQuantity < 1 || quickMovingIds.has(product.id)}
            onClick={() => onQuickMove(product, 'out')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-700/60 dark:hover:bg-red-900/40 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:pointer-events-none disabled:opacity-30"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <span className="min-w-[5rem] text-center text-xs font-semibold tabular-nums text-foreground">
            {quickMovingIds.has(product.id) ? (
              <span className="flex justify-center">
                <Loader2
                  className="h-4 w-4 animate-spin text-muted-foreground"
                  aria-hidden="true"
                />
              </span>
            ) : (
              formatQuantity(product.currentQuantity, product.unit)
            )}
          </span>
          <button
            type="button"
            title="Adicionar 1 unidade"
            aria-label={`Adicionar 1 unidade de ${product.name}`}
            disabled={quickMovingIds.has(product.id)}
            onClick={() => onQuickMove(product, 'in')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:border-emerald-700/60 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:pointer-events-none disabled:opacity-30"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-3">
        {/* Primary: Ver detalhes — always visible, full-width */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          aria-label={`Ver detalhes de ${product.name}`}
          onClick={() => onViewDetails(product)}
        >
          <Eye aria-hidden="true" />
          Ver detalhes
        </Button>

        {/* Secondary actions: compact popover menu */}
        {hasMenuActions && (
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={`Mais ações para ${product.name}`}
                aria-haspopup="menu"
              >
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 overflow-hidden py-1">
              {!isInactive && (
                <>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                    onClick={() => {
                      setMenuOpen(false)
                      onEdit(product)
                    }}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                    onClick={() => {
                      setMenuOpen(false)
                      onMove(product)
                    }}
                  >
                    <MoveRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    Movimentar
                  </button>
                  {onDeactivate && (
                    <>
                      <hr className="mx-1 my-0.5 border-border" />
                      <button
                        type="button"
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 focus:bg-destructive/10 focus:outline-none dark:hover:bg-destructive/35 dark:focus:bg-destructive/35"
                        onClick={() => {
                          setMenuOpen(false)
                          onDeactivate(product)
                        }}
                      >
                        <PowerOff className="h-4 w-4" aria-hidden="true" />
                        Desativar
                      </button>
                    </>
                  )}
                </>
              )}
              {isInactive && onReactivate && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                  onClick={() => {
                    setMenuOpen(false)
                    onReactivate(product)
                  }}
                >
                  <Power className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Reativar
                </button>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </article>
  )
}
