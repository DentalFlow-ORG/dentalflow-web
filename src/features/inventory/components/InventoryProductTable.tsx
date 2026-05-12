import { Eye, Loader2, Package, Pencil, PowerOff } from 'lucide-react'

import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'

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
  onDeactivate?: (product: StockProduct) => void
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
  onDeactivate,
}: InventoryProductTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <PanelCard>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Produtos em estoque</h2>
          <p className="mt-1 text-sm text-slate-500">
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
          <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            Nenhum produto encontrado.
          </p>
        ) : (
          products.map((product) => (
            <InventoryProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewDetails}
              onEdit={onEdit}
              onDeactivate={onDeactivate}
            />
          ))
        )}
      </div>

      {/* Desktop table — visible at md and above */}
      <div className="hidden overflow-hidden rounded-lg border border-slate-200 md:block">
        <div className="overflow-x-auto">
          <table
            className="w-full min-w-[900px] text-sm"
            aria-label="Lista de produtos em estoque"
          >
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
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
            <tbody className="divide-y divide-slate-100 bg-white">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <p className="max-w-[200px] truncate font-medium text-slate-900">
                        {product.name}
                      </p>
                      {product.description && (
                        <p className="mt-0.5 max-w-[200px] truncate text-xs text-slate-500">
                          {product.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{product.category.name}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatQuantity(product.currentQuantity, product.unit)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {product.minQuantity > 0 ? (
                        formatQuantity(product.minQuantity, product.unit)
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StockStatusBadge status={product.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {product.expiresAt ? (
                        formatProductDate(product.expiresAt)
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {product.purchasePrice !== null ? (
                        formatBRLCents(product.purchasePrice)
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {product.supplier ?? <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          aria-label={`Ver detalhes do produto ${product.name}`}
                          onClick={() => onViewDetails(product)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Editar produto ${product.name}`}
                          onClick={() => onEdit(product)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        {onDeactivate && (
                          <button
                            type="button"
                            aria-label={`Desativar produto ${product.name}`}
                            onClick={() => onDeactivate(product)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <PowerOff className="h-4 w-4" aria-hidden="true" />
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
        className="mt-4 border-t border-slate-100 pt-4"
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
