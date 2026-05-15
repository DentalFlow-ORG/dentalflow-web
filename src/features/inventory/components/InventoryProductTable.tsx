import { Eye, Loader2, Minus, MoveRight, Package, Pencil, Plus, Power, PowerOff } from 'lucide-react'

import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { cn } from '@/lib/utils'

import type { StockProduct } from '../types/inventory.types'
import { formatBRLCents, formatProductDate, formatQuantity } from '../utils/inventory-format'
import { InventoryProductCard } from './InventoryProductCard'
import { StockStatusBadge } from './StockStatusBadge'

type InventoryProductTableProps = {
  products: StockProduct[]
  isLoading: boolean
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onViewDetails: (product: StockProduct) => void
  onEdit: (product: StockProduct) => void
  onMove: (product: StockProduct) => void
  onDeactivate?: (product: StockProduct) => void
  onReactivate?: (product: StockProduct) => void
  quickMovingIds: Set<string>
  onQuickMove: (product: StockProduct, direction: 'in' | 'out') => void
}

export function InventoryProductTable({
  products,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onViewDetails,
  onEdit,
  onMove,
  onDeactivate,
  onReactivate,
  quickMovingIds,
  onQuickMove,
}: InventoryProductTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <PanelCard>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Produtos em estoque</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} produto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        {isLoading ? (
          <span role="status" aria-label="Atualizando lista de produtos">
            <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          </span>
        ) : (
          <Package className="h-5 w-5 text-primary" aria-hidden="true" />
        )}
      </div>

      {/* Mobile cards — visible below md */}
      <div className="grid gap-3 md:hidden">
        {products.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum produto encontrado.
          </p>
        ) : (
          products.map((product) => (
            <InventoryProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewDetails}
              onEdit={onEdit}
              onMove={onMove}
              onDeactivate={onDeactivate}
              onReactivate={onReactivate}
              quickMovingIds={quickMovingIds}
              onQuickMove={onQuickMove}
            />
          ))
        )}
      </div>

      {/* Desktop table — visible at md and above */}
      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <div className="overflow-x-auto">
          <table
            className="w-full min-w-[900px] text-sm"
            aria-label="Lista de produtos em estoque"
          >
            <thead>
              <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-4 py-3">Produto</th>
                <th scope="col" className="px-4 py-3">Categoria</th>
                <th scope="col" className="px-4 py-3">Quantidade</th>
                <th scope="col" className="px-4 py-3">Mínimo</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Validade</th>
                <th scope="col" className="px-4 py-3">Preço de compra</th>
                <th scope="col" className="px-4 py-3">Fornecedor</th>
                <th scope="col" className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3">
                      <p className="max-w-[200px] truncate font-medium text-foreground">
                        {product.name}
                      </p>
                      {product.description && (
                        <p className="mt-0.5 max-w-[200px] truncate text-xs text-muted-foreground">
                          {product.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product.category.name}</td>
                    <td className="px-4 py-3">
                      {product.status === 'INACTIVE' ? (
                        <span className="font-semibold text-muted-foreground">
                          {formatQuantity(product.currentQuantity, product.unit)}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
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
                            disabled={
                              product.currentQuantity < 1 || quickMovingIds.has(product.id)
                            }
                            onClick={() => onQuickMove(product, 'out')}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:pointer-events-none disabled:opacity-30"
                          >
                            <Minus className="h-3 w-3" aria-hidden="true" />
                          </button>
                          <span
                            className={cn(
                              'min-w-[3.5rem] text-center text-sm font-semibold tabular-nums',
                              quickMovingIds.has(product.id)
                                ? 'text-muted-foreground'
                                : product.status === 'EMPTY'
                                  ? 'text-red-600'
                                  : product.status === 'LOW'
                                    ? 'text-amber-700'
                                    : 'text-foreground',
                            )}
                          >
                            {quickMovingIds.has(product.id) ? (
                              <Loader2
                                className="mx-auto h-3.5 w-3.5 animate-spin"
                                aria-hidden="true"
                              />
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
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:pointer-events-none disabled:opacity-30"
                          >
                            <Plus className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {product.minQuantity > 0 ? (
                        formatQuantity(product.minQuantity, product.unit)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StockStatusBadge status={product.status} />
                    </td>
                    <td
                      className={`px-4 py-3 ${product.status === 'EXPIRED' ? 'font-medium text-red-600' : product.status === 'EXPIRING' ? 'font-medium text-amber-700' : 'text-muted-foreground'}`}
                    >
                      {product.expiresAt ? (
                        formatProductDate(product.expiresAt)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {product.purchasePrice !== null ? (
                        formatBRLCents(product.purchasePrice)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {product.supplier ?? <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          title="Ver detalhes"
                          aria-label={`Ver detalhes de ${product.name}`}
                          onClick={() => onViewDetails(product)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-3 focus:ring-primary/15"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </button>
                        {product.status !== 'INACTIVE' && (
                          <>
                            <button
                              type="button"
                              title="Editar produto"
                              aria-label={`Editar produto ${product.name}`}
                              onClick={() => onEdit(product)}
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-3 focus:ring-primary/15"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              title="Movimentar estoque"
                              aria-label={`Movimentar estoque de ${product.name}`}
                              onClick={() => onMove(product)}
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-3 focus:ring-primary/15"
                            >
                              <MoveRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                            {onDeactivate && (
                              <button
                                type="button"
                                title="Desativar produto"
                                aria-label={`Desativar produto ${product.name}`}
                                onClick={() => onDeactivate(product)}
                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-3 focus:ring-red-500/15"
                              >
                                <PowerOff className="h-4 w-4" aria-hidden="true" />
                              </button>
                            )}
                          </>
                        )}
                        {onReactivate && product.status === 'INACTIVE' && (
                          <button
                            type="button"
                            title="Reativar produto"
                            aria-label={`Reativar produto ${product.name}`}
                            onClick={() => onReactivate(product)}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-green-50 hover:text-green-700 focus:outline-none focus:ring-3 focus:ring-green-500/15"
                          >
                            <Power className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        className="mt-4 border-t border-border pt-4"
        page={page}
        totalPages={totalPages}
        filteredCount={total}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50]}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </PanelCard>
  )
}
