import { Package, Plus, Tags } from 'lucide-react'

import { EmptyState } from '@/components/common/EmptyState'
import { FilteredEmptyState } from '@/components/common/FilteredEmptyState'
import { FormField, TextInput } from '@/components/common/FormField'
import { ListPageShell } from '@/components/common/ListPageShell'
import { PanelCard } from '@/components/common/PanelCard'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useInventoryPage } from '../hooks/useInventoryPage'
import type { StockProductStatus } from '../types/inventory.types'
import { CategoryManagerModal } from '../components/CategoryManagerModal'
import { DeactivateProductDialog } from '../components/DeactivateProductDialog'
import { InventoryKpiGrid } from '../components/InventoryKpiGrid'
import { InventoryProductTable } from '../components/InventoryProductTable'
import { ProductDetailsDrawer } from '../components/ProductDetailsDrawer'
import { ProductFormModal } from '../components/ProductFormModal'
import { StockMovementModal } from '../components/StockMovementModal'

const STATUS_OPTIONS: { value: StockProductStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Em estoque' },
  { value: 'LOW', label: 'Baixo estoque' },
  { value: 'EMPTY', label: 'Sem estoque' },
  { value: 'EXPIRING', label: 'Vencendo' },
  { value: 'EXPIRED', label: 'Vencido' },
  { value: 'INACTIVE', label: 'Inativo' },
]

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
  } = useInventoryPage()

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Estoque"
        title="Controle de Estoque"
        description="Gerencie produtos, categorias e acompanhe os níveis de estoque da clínica."
        action={
          <div className="flex flex-col gap-2 sm:flex-row [&>*]:w-full sm:[&>*]:w-auto">
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
            />
          )}
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
      />

      <DeactivateProductDialog
        open={deactivatingProduct !== null}
        productName={deactivatingProduct?.name ?? ''}
        isDeactivating={isDeactivating}
        error={deactivateError}
        onCancel={handleDeactivateCancel}
        onConfirm={handleDeactivateConfirm}
      />
    </AppPage>
  )
}
