import { Package, Plus, Tags } from 'lucide-react'

import { EmptyState } from '@/components/common/EmptyState'
import { FilteredEmptyState } from '@/components/common/FilteredEmptyState'
import { FormField, TextInput } from '@/components/common/FormField'
import { ListPageShell } from '@/components/common/ListPageShell'
import { PlanUpgradeNotice } from '@/components/common/PlanUpgradeNotice'
import { PanelCard } from '@/components/common/PanelCard'
import { AppPage } from '@/components/layout/AppPage'
import { Button } from '@/components/ui/button'
import { HomeDashboardHeader } from '@/features/home/components/HomeDashboardHeader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useInventoryPage } from '../hooks/useInventoryPage'
import type { StockProductStatus } from '../types/inventory.types'
import { STATUS_OPTIONS } from '../constants/inventory-filters'
import { buildAttentionChips } from '../utils/inventory-chips'
import { CategoryManagerModal } from '../components/CategoryManagerModal'
import { DeactivateProductDialog } from '../components/DeactivateProductDialog'
import { ReactivateProductDialog } from '../components/ReactivateProductDialog'
import { InventoryAnalysisPanel } from '../components/InventoryAnalysisPanel'
import { InventoryKpiGrid } from '../components/InventoryKpiGrid'
import { InventoryProductTable } from '../components/InventoryProductTable'
import { StockPurchaseListSection } from '../components/StockPurchaseListSection'
import { StockAbnormalConsumptionSection } from '../components/StockAbnormalConsumptionSection'
import { ProductDetailsDrawer } from '../components/ProductDetailsDrawer'
import { ProductFormModal } from '../components/ProductFormModal'
import { StockMovementModal } from '../components/StockMovementModal'

export function InventoryPageContainer() {
  const {
    summary,
    categories,
    products,
    total,
    isLoading,
    isLoadingProducts,
    error,
    search,
    categoryId,
    status,
    page,
    pageSize,
    hasFilters,
    handleSearchChange,
    handleCategoryChange,
    handleStatusChange,
    handleClearFilters,
    handleRetry,
    setPage,
    handlePageSizeChange,
    isOwner,
    isCreateModalOpen,
    isCategoryManagerOpen,
    editingProduct,
    movingProduct,
    handleOpenCreate,
    handleOpenCategoryManager,
    handleCloseCategoryManager,
    reloadInventoryData,
    handleOpenEdit,
    handleCloseModal,
    handleProductSaved,
    handleOpenMovement,
    handleCloseMovement,
    handleMovementSaved,
    viewingProduct,
    movementHistoryRefreshKey,
    handleOpenDetails,
    handleCloseDetails,
    deactivatingProduct,
    isDeactivating,
    deactivateError,
    handleDeactivateRequest,
    handleDeactivateCancel,
    handleDeactivateConfirm,
    reactivatingProduct,
    isReactivating,
    reactivateError,
    handleReactivateRequest,
    handleReactivateCancel,
    handleReactivateConfirm,
    quickMovingIds,
    handleQuickMove,
    planBlocked,
  } = useInventoryPage()

  if (planBlocked) return <PlanUpgradeNotice title="Controle de Estoque" />

  return (
    <AppPage>
      <HomeDashboardHeader
        eyebrow="Operação"
        title="Estoque"
        description="Gerencie produtos, movimentações, alertas e análises para manter a clínica abastecida."
        actions={
          <div className="flex flex-col gap-2 sm:flex-row *:w-full sm:*:w-auto">
            {isOwner && (
              <Button variant="outline" onClick={handleOpenCategoryManager}>
                <Tags aria-hidden="true" />
                Gerenciar categorias
              </Button>
            )}
            <Button onClick={handleOpenCreate}>
              <Plus aria-hidden="true" />
              Novo produto
            </Button>
          </div>
        }
      />

      {/* Filters — always visible, independent of loading state */}
      <PanelCard className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Buscar produto" htmlFor="stockSearch" className="sm:col-span-2">
            <TextInput
              id="stockSearch"
              placeholder="Buscar produto..."
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </FormField>
          <FormField label="Categoria" htmlFor="stockCategory">
            <Select
              value={categoryId ?? 'all'}
              onValueChange={(value) =>
                handleCategoryChange(value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger id="stockCategory">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Status" htmlFor="stockStatus">
            <Select
              value={status ?? 'all'}
              onValueChange={(value) =>
                handleStatusChange(
                  value === 'all' ? undefined : (value as StockProductStatus),
                )
              }
            >
              <SelectTrigger id="stockStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                <SelectItem value="all">Todos os status</SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
        {/* Quick-filter chips — derived from summary, only shown when counts > 0 */}
        {summary && (() => {
          const chips = buildAttentionChips(summary)
          return chips.length > 0 ? (
            <div
              className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3"
              role="group"
              aria-label="Filtros rápidos por atenção"
            >
              <span className="text-xs font-medium text-muted-foreground" aria-hidden="true">
                Atenção:
              </span>
              {chips.map(({ status: s, label, count, base, active }) => {
                const isActive = status === s
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={isActive}
                    aria-label={`Filtrar por ${label}: ${count} produto${count !== 1 ? 's' : ''}`}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${isActive ? active : base}`}
                    onClick={() => handleStatusChange(isActive ? undefined : s)}
                  >
                    {label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${isActive ? 'bg-primary-foreground/25' : 'bg-card/70'}`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : null
        })()}

        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Limpar filtros
            </Button>
          </div>
        )}
      </PanelCard>

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando estoque..."
        error={error}
        onRetry={handleRetry}
        isEmpty={!isLoadingProducts && !hasFilters && total === 0}
        emptyState={
          <EmptyState
            icon={Package}
            title="Nenhum produto cadastrado"
            description="Cadastre produtos e insumos para acompanhar estoque, validade e reposição da clínica."
            action={
              <Button onClick={handleOpenCreate}>
                <Plus aria-hidden="true" />
                Novo produto
              </Button>
            }
          />
        }
      >
        <>
          {summary && <InventoryKpiGrid summary={summary} />}

          {hasFilters && products.length === 0 && !isLoadingProducts ? (
            <FilteredEmptyState icon={Package} onClear={handleClearFilters} />
          ) : (
            <InventoryProductTable
              products={products}
              isLoading={isLoadingProducts}
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              onViewDetails={handleOpenDetails}
              onEdit={handleOpenEdit}
              onMove={handleOpenMovement}
              onDeactivate={isOwner ? handleDeactivateRequest : undefined}
              onReactivate={isOwner ? handleReactivateRequest : undefined}
              quickMovingIds={quickMovingIds}
              onQuickMove={handleQuickMove}
            />
          )}

          <StockPurchaseListSection />

          <StockAbnormalConsumptionSection />

          {summary && <InventoryAnalysisPanel summary={summary} />}
        </>
      </ListPageShell>
      <ProductFormModal
        open={isCreateModalOpen || editingProduct !== null}
        product={editingProduct}
        categories={categories}
        onClose={handleCloseModal}
        onSuccess={handleProductSaved}
      />

      <CategoryManagerModal
        open={isCategoryManagerOpen}
        categories={categories}
        onClose={handleCloseCategoryManager}
        onCategoriesChanged={reloadInventoryData}
      />

      <StockMovementModal
        product={movingProduct}
        onClose={handleCloseMovement}
        onSuccess={handleMovementSaved}
      />

      <ProductDetailsDrawer
        product={viewingProduct}
        isOwner={isOwner}
        movementHistoryRefreshKey={movementHistoryRefreshKey}
        onClose={handleCloseDetails}
        onEdit={(p) => {
          handleCloseDetails()
          handleOpenEdit(p)
        }}
        onMove={handleOpenMovement}
        onDeactivate={(p) => {
          handleCloseDetails()
          handleDeactivateRequest(p)
        }}
        onReactivate={handleReactivateRequest}
      />

      <DeactivateProductDialog
        open={deactivatingProduct !== null}
        productName={deactivatingProduct?.name ?? ''}
        isDeactivating={isDeactivating}
        error={deactivateError}
        onCancel={handleDeactivateCancel}
        onConfirm={handleDeactivateConfirm}
      />

      <ReactivateProductDialog
        open={reactivatingProduct !== null}
        productName={reactivatingProduct?.name ?? ''}
        isReactivating={isReactivating}
        error={reactivateError}
        onCancel={handleReactivateCancel}
        onConfirm={handleReactivateConfirm}
      />
    </AppPage>
  )
}
