import { AlertTriangle, Eye, Loader2, Minus, MoveRight, Pencil, Plus, Power, PowerOff } from 'lucide-react'

import { Button } from '@/components/ui/button'

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
  const isInactive = product.status === 'INACTIVE'
  const hasStockWarning = product.status === 'EMPTY' || product.status === 'LOW'
  const hasExpiryWarning = product.status === 'EXPIRED' || product.status === 'EXPIRING'

  return (
    <article
      className={`rounded-lg border p-4 shadow-sm ${isInactive ? 'border-border bg-muted/60' : 'border-border bg-card'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`truncate text-sm font-semibold ${isInactive ? 'text-muted-foreground' : 'text-foreground'}`}
          >
            {product.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{product.category.name}</p>
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
          {product.status === 'EXPIRED'
            ? 'Validade vencida'
            : 'Validade próxima do vencimento'}
        </div>
      )}

      {/* Data grid */}
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
        <div>
          <dt className="font-medium uppercase tracking-wide text-muted-foreground">Quantidade</dt>
          <dd
            className={`mt-0.5 font-semibold ${product.status === 'EMPTY' ? 'text-red-600 dark:text-red-400' : product.status === 'LOW' ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'}`}
          >
            {formatQuantity(product.currentQuantity, product.unit)}
          </dd>
        </div>
        <div>
          <dt className="font-medium uppercase tracking-wide text-muted-foreground">Mínimo</dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {product.minQuantity > 0 ? (
              formatQuantity(product.minQuantity, product.unit)
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </dd>
        </div>
        <div>
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
        <div>
          <dt className="font-medium uppercase tracking-wide text-muted-foreground">Fornecedor</dt>
          <dd className="mt-0.5 truncate font-medium text-foreground">
            {product.supplier ?? <span className="text-muted-foreground">—</span>}
          </dd>
        </div>
        {product.purchasePrice !== null && (
          <div className="col-span-2">
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
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-800/60 dark:hover:bg-red-950/30 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:pointer-events-none disabled:opacity-30"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <span className="min-w-[5rem] text-center text-xs font-semibold tabular-nums text-foreground">
            {quickMovingIds.has(product.id) ? (
              <span className="flex justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
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
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:border-emerald-800/60 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:pointer-events-none disabled:opacity-30"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2">
        {!isInactive ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label={`Ver detalhes de ${product.name}`}
                onClick={() => onViewDetails(product)}
              >
                <Eye aria-hidden="true" />
                Ver detalhes
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label={`Editar produto ${product.name}`}
                onClick={() => onEdit(product)}
              >
                <Pencil aria-hidden="true" />
                Editar
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              aria-label={`Movimentar estoque de ${product.name}`}
              onClick={() => onMove(product)}
            >
              <MoveRight aria-hidden="true" />
              Movimentar
            </Button>
            {onDeactivate && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="w-full"
                aria-label={`Desativar produto ${product.name}`}
                onClick={() => onDeactivate(product)}
              >
                <PowerOff aria-hidden="true" />
                Desativar produto
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              aria-label={`Ver detalhes de ${product.name}`}
              onClick={() => onViewDetails(product)}
            >
              <Eye aria-hidden="true" />
              Ver detalhes
            </Button>
            {onReactivate && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                aria-label={`Reativar produto ${product.name}`}
                onClick={() => onReactivate(product)}
              >
                <Power aria-hidden="true" />
                Reativar produto
              </Button>
            )}
          </>
        )}
      </div>
    </article>
  )
}
