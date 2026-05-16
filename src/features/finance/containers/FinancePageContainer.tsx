import { RefreshCw } from 'lucide-react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ListPageShell } from '@/components/common/ListPageShell'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { useFinancePage } from '../hooks/useFinancePage'
import { CategoriesPanel } from '../components/CategoriesPanel'
import { CategoryCreateForm } from '../components/CategoryCreateForm'
import { CategoryEditModal } from '../components/CategoryEditModal'
import { FinanceFiltersBar } from '../components/FinanceFiltersBar'
import { FinancialAnalysisPanel } from '../components/FinancialAnalysisPanel'
import { FixedExpenseForm } from '../components/FixedExpenseForm'
import { FixedExpenseEditModal } from '../components/FixedExpenseEditModal'
import { FixedExpensesList } from '../components/FixedExpensesList'
import { IncomeExpensesChart } from '../components/IncomeExpensesChart'
import { KpiGrid } from '../components/KpiGrid'
import { Ranking } from '../components/Ranking'
import { TransactionEditModal } from '../components/TransactionEditModal'
import { TransactionForm } from '../components/TransactionForm'
import { TransactionsTable } from '../components/TransactionsTable'

export function FinancePageContainer() {
  const {
    filters,
    summary,
    categories,
    transactions,
    transactionsTotal,
    transactionsPage,
    transactionsPageSize,
    fixedExpenses,
    isLoading,
    isLoadingTransactions,
    loadError,
    previousSummary,
    transactionForm,
    fixedExpenseForm,
    transactionError,
    fixedExpenseError,
    isSavingTransaction,
    isSavingFixedExpense,
    generatingExpenseId,
    editingFixedExpense,
    setEditingFixedExpense,
    togglingFixedExpense,
    setTogglingFixedExpense,
    fixedExpenseEditForm,
    fixedExpenseEditError,
    isUpdatingFixedExpense,
    isTogglingFixedExpense,
    categoryForm,
    editingCategory,
    setEditingCategory,
    categoryEditForm,
    deletingCategory,
    setDeletingCategory,
    categoryError,
    categoryEditError,
    isSavingCategory,
    isUpdatingCategory,
    isDeletingCategory,
    editingTransaction,
    setEditingTransaction,
    deletingTransaction,
    setDeletingTransaction,
    editForm,
    editError,
    isUpdating,
    isDeleting,
    incomeCategories,
    expenseCategories,
    transactionCategories,
    load,
    setFilter,
    setTransaction,
    setFixedExpense,
    handleCreateTransaction,
    handleCreateFixedExpense,
    setCategory,
    setCategoryEdit,
    handleOpenEditCategory,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleOpenEditFixedExpense,
    setFixedExpenseEditField,
    handleUpdateFixedExpense,
    handleToggleFixedExpense,
    handleOpenEdit,
    setEditField,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleGenerateFixedExpense,
    setTransactionsPage,
    setTransactionsPageSize,
  } = useFinancePage()

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Gestão financeira"
        title="Financeiro da clínica"
        description="Acompanhe entradas, saídas, despesas fixas e desempenho financeiro por período."
        action={
          <Button variant="outline" onClick={load}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Atualizar
          </Button>
        }
      />

      <FinanceFiltersBar filters={filters} categories={categories} onChange={setFilter} />

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando dados financeiros..."
        error={loadError}
        onRetry={load}
        isEmpty={false}
      >
        {summary && (
          <>
            <KpiGrid summary={summary} />

            <FinancialAnalysisPanel summary={summary} previousSummary={previousSummary} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <PanelCard>
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      Entradas x saídas
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Evolução financeira no período selecionado.
                    </p>
                  </div>
                  <StatusBadge tone={summary.kpis.netProfit >= 0 ? 'success' : 'warning'}>
                    {summary.kpis.netProfit >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
                  </StatusBadge>
                </div>
                <IncomeExpensesChart summary={summary} />
              </PanelCard>

              <PanelCard>
                <h2 className="text-base font-semibold text-foreground">
                  Composição financeira
                </h2>
                <div className="mt-5 space-y-6">
                  <Ranking
                    title="Despesas por categoria"
                    items={summary.expensesByCategory.map((item) => ({
                      label: item.categoryName,
                      amount: item.amount,
                      color: item.color ?? '#EF4444',
                    }))}
                  />
                  <Ranking
                    title="Receitas por serviço"
                    items={summary.incomeByService.map((item) => ({
                      label: item.serviceName,
                      amount: item.amount,
                      color: '#10B981',
                    }))}
                  />
                </div>
              </PanelCard>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TransactionsTable
                transactions={transactions}
                isLoading={isLoadingTransactions}
                page={transactionsPage}
                pageSize={transactionsPageSize}
                total={transactionsTotal}
                onPageChange={setTransactionsPage}
                onPageSizeChange={setTransactionsPageSize}
                onEdit={handleOpenEdit}
                onDelete={setDeletingTransaction}
              />
              <TransactionForm
                form={transactionForm}
                categories={transactionCategories}
                error={transactionError}
                isSubmitting={isSavingTransaction}
                onChange={setTransaction}
                onSubmit={handleCreateTransaction}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <FixedExpensesList
                expenses={fixedExpenses}
                generatingExpenseId={generatingExpenseId}
                onGenerate={handleGenerateFixedExpense}
                onEdit={handleOpenEditFixedExpense}
                onToggle={setTogglingFixedExpense}
              />
              <FixedExpenseForm
                form={fixedExpenseForm}
                categories={expenseCategories}
                error={fixedExpenseError}
                isSubmitting={isSavingFixedExpense}
                onChange={setFixedExpense}
                onSubmit={handleCreateFixedExpense}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <CategoriesPanel
                categories={categories}
                onEdit={handleOpenEditCategory}
                onDelete={setDeletingCategory}
              />
              <CategoryCreateForm
                form={categoryForm}
                error={categoryError}
                isSubmitting={isSavingCategory}
                onChange={setCategory}
                onSubmit={handleCreateCategory}
              />
            </div>
          </>
        )}
      </ListPageShell>

      <CategoryEditModal
        category={editingCategory}
        form={categoryEditForm}
        error={categoryEditError}
        isSubmitting={isUpdatingCategory}
        onChange={setCategoryEdit}
        onSubmit={handleUpdateCategory}
        onClose={() => setEditingCategory(null)}
      />

      <ConfirmDialog
        open={deletingCategory !== null}
        title="Remover categoria"
        subject={deletingCategory?.name}
        description="A categoria será removida permanentemente. Categorias com lançamentos vinculados não podem ser removidas."
        confirmLabel="Remover categoria"
        tone="destructive"
        isConfirming={isDeletingCategory}
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeletingCategory(null)}
      />

      <FixedExpenseEditModal
        expense={editingFixedExpense}
        form={fixedExpenseEditForm}
        categories={expenseCategories}
        error={fixedExpenseEditError}
        isSubmitting={isUpdatingFixedExpense}
        onChange={setFixedExpenseEditField}
        onSubmit={handleUpdateFixedExpense}
        onClose={() => setEditingFixedExpense(null)}
      />

      <ConfirmDialog
        open={togglingFixedExpense !== null}
        title={togglingFixedExpense?.isActive ? 'Desativar despesa fixa' : 'Ativar despesa fixa'}
        subject={togglingFixedExpense?.description}
        description={
          togglingFixedExpense?.isActive
            ? 'A despesa será desativada e não poderá gerar novos lançamentos até ser reativada.'
            : 'A despesa será reativada e voltará a poder gerar lançamentos.'
        }
        confirmLabel={togglingFixedExpense?.isActive ? 'Desativar' : 'Ativar'}
        tone={togglingFixedExpense?.isActive ? 'destructive' : 'warning'}
        isConfirming={isTogglingFixedExpense}
        onConfirm={handleToggleFixedExpense}
        onCancel={() => setTogglingFixedExpense(null)}
      />

      <TransactionEditModal
        transaction={editingTransaction}
        form={editForm}
        categories={
          editForm.type === 'INCOME' ? incomeCategories : expenseCategories
        }
        error={editError}
        isSubmitting={isUpdating}
        onChange={setEditField}
        onSubmit={handleUpdateTransaction}
        onClose={() => setEditingTransaction(null)}
      />

      <ConfirmDialog
        open={deletingTransaction !== null}
        title="Cancelar lançamento"
        subject={deletingTransaction?.description}
        description="O lançamento será marcado como cancelado e não contará nos totais do período. Esta ação pode ser desfeita editando o status do lançamento."
        confirmLabel="Cancelar lançamento"
        tone="destructive"
        isConfirming={isDeleting}
        onConfirm={handleDeleteTransaction}
        onCancel={() => setDeletingTransaction(null)}
      />
    </AppPage>
  )
}



