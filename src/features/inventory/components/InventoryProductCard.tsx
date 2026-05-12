import { Eye, Pencil, PowerOff } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { StockProduct } from '../types/inventory.types'
import { formatBRLCents, formatProductDate, formatQuantity } from '../utils/inventory-format'
import { StockStatusBadge } from './StockStatusBadge'

type InventoryProductCardProps = {
  product: StockProduct
  onViewDetails: (product: StockProduct) => void
  onEdit: (product: StockProduct) => void
  onDeactivate?: (product: StockProduct) => void
}

export function InventoryProductCard({
  product,
  onViewDetails,
  onEdit,
  onDeactivate,
}: InventoryProductCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-950">{product.name}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{product.category.name}</p>
        </div>
        <StockStatusBadge status={product.status} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
        <div>
          <dt className="font-medium uppercase tracking-wide text-slate-400">Quantidade</dt>
          <dd className="mt-0.5 font-medium text-slate-800">
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
          <dd className="mt-0.5 font-medium text-slate-800">
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
            <dt className="font-medium uppercase tracking-wide text-slate-400">Preço de compra</dt>
            <dd className="mt-0.5 font-medium text-slate-800">
              {formatBRLCents(product.purchasePrice)}
            </dd>
          </div>
        )}
      </dl>
      <div className="mt-4 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(product)}
          >
            <Eye />
            Ver detalhes
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
          >
            <Pencil />
            Editar
          </Button>
        </div>
        {onDeactivate && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => onDeactivate(product)}
          >
            <PowerOff />
            Desativar produto
          </Button>
        )}
      </div>
    </article>
  )
}
