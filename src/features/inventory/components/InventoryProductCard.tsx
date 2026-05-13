import { AlertTriangle, Eye, MoveRight, Pencil, Power, PowerOff } from 'lucide-react'

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
}

export function InventoryProductCard({
  product,
  onViewDetails,
  onEdit,
  onMove,
  onDeactivate,
  onReactivate,
}: InventoryProductCardProps) {
  const isInactive = product.status === 'INACTIVE'
  const hasStockWarning = product.status === 'EMPTY' || product.status === 'LOW'
  const hasExpiryWarning = product.status === 'EXPIRED' || product.status === 'EXPIRING'

  return (
    <article
      className={`rounded-lg border p-4 shadow-sm ${isInactive ? 'border-slate-200 bg-slate-50/60' : 'border-slate-200 bg-white'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`truncate text-sm font-semibold ${isInactive ? 'text-slate-500' : 'text-slate-950'}`}
          >
            {product.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">{product.category.name}</p>
        </div>
        <StockStatusBadge status={product.status} />
      </div>

      {/* Stock warning */}
      {hasStockWarning && (
        <div
          className={`mt-3 flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium ${product.status === 'EMPTY' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}
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
          className={`mt-3 flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium ${product.status === 'EXPIRED' ? 'border-red-200 bg-red-50 text-red-700' : 'border-orange-200 bg-orange-50 text-orange-700'}`}
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
          <dt className="font-medium uppercase tracking-wide text-slate-400">Quantidade</dt>
          <dd
            className={`mt-0.5 font-semibold ${product.status === 'EMPTY' ? 'text-red-600' : product.status === 'LOW' ? 'text-amber-700' : 'text-slate-800'}`}
          >
            {formatQuantity(product.currentQuantity, product.unit)}
          </dd>
        </div>
        <div>
          <dt className="font-medium uppercase tracking-wide text-slate-400">Mínimo</dt>
          <dd className="mt-0.5 font-medium text-slate-800">
            {product.minQuantity > 0 ? (
              formatQuantity(product.minQuantity, product.unit)
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="font-medium uppercase tracking-wide text-slate-400">Validade</dt>
          <dd
            className={`mt-0.5 font-medium ${product.status === 'EXPIRED' ? 'text-red-600' : product.status === 'EXPIRING' ? 'text-amber-700' : 'text-slate-800'}`}
          >
            {product.expiresAt ? (
              formatProductDate(product.expiresAt)
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="font-medium uppercase tracking-wide text-slate-400">Fornecedor</dt>
          <dd className="mt-0.5 truncate font-medium text-slate-800">
            {product.supplier ?? <span className="text-slate-400">—</span>}
          </dd>
        </div>
        {product.purchasePrice !== null && (
          <div className="col-span-2">
            <dt className="font-medium uppercase tracking-wide text-slate-400">
              Preço de compra
            </dt>
            <dd className="mt-0.5 font-medium text-slate-800">
              {formatBRLCents(product.purchasePrice)}
            </dd>
          </div>
        )}
      </dl>

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
