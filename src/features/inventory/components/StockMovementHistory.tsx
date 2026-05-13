import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { InlineFeedback } from '@/components/common/InlineFeedback'

import { listProductStockMovements } from '../services/inventory.service'
import type { StockMovement, StockProduct } from '../types/inventory.types'
import {
  formatMovementQuantity,
  formatProductDateTime,
  formatQuantityTransition,
  getMovementTypeLabel,
} from '../utils/inventory-format'

type StockMovementHistoryProps = {
  product: StockProduct
  refreshKey: number
}

export function StockMovementHistory({
  product,
  refreshKey,
}: StockMovementHistoryProps) {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    listProductStockMovements(product.id, { page: 1, limit: 8 })
      .then((response) => setMovements(response.data))
      .catch(() => {
        setError('Não foi possível carregar o histórico de movimentações.')
      })
      .finally(() => setIsLoading(false))
  }, [product.id, refreshKey])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-5 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
        Carregando movimentações...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-3">
        <InlineFeedback>{error}</InlineFeedback>
      </div>
    )
  }

  if (movements.length === 0) {
    return (
      <p className="px-4 py-5 text-sm leading-6 text-slate-500">
        Nenhuma movimentação registrada para este produto.
      </p>
    )
  }

  return (
    <div className="divide-y divide-slate-100">
      {movements.map((movement) => (
        <article key={movement.id} className="px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-950">
                {getMovementTypeLabel(movement.type)}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {formatMovementQuantity(movement.type, movement.quantity, product.unit)}
                <span className="mx-1.5 text-slate-300">·</span>
                {formatQuantityTransition(movement.previousQuantity, movement.newQuantity)}
              </p>
            </div>
            <time className="shrink-0 text-xs leading-5 text-slate-400 sm:text-right">
              {formatProductDateTime(movement.createdAt)}
            </time>
          </div>
          <div className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
            {movement.reason && <p className="break-words">{movement.reason}</p>}
            {movement.performedBy && (
              <p>
                Por {movement.performedBy.firstName} {movement.performedBy.lastName}
              </p>
            )}
            {movement.notes && <p className="break-words text-slate-400">{movement.notes}</p>}
          </div>
        </article>
      ))}
    </div>
  )
}
