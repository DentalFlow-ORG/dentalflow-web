import { FinancePageContainer } from '@/features/finance/containers/FinancePageContainer'
import {
  deleteFinancialCategory,
  deleteFinancialTransaction,
  getFinanceSummary,
  listFinancialCategories,
  listFinancialTransactions,
  listFixedExpenses,
  updateFixedExpense,
} from '@/features/finance/services/finance.service'
import { ApiError } from '@/services/http'
import {
  makeCategory,
  makeFixedExpense,
  makeSummary,
  makeTransaction,
} from '@/test-utils/factories/finance.factory'
import { makeOwnerUser } from '@/test-utils/factories/user.factory'
import { renderWithProviders, screen, userEvent, waitFor, within } from '@/test-utils/render-utils'

const showAlert = vi.hoisted(() => vi.fn())
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert }),
}))
vi.mock('@/features/auth/hooks/useAuth', () => ({ useAuth: () => ({ user: makeOwnerUser() }) }))
vi.mock('@tanstack/react-router', async () => {
  const router = await import('@/test-utils/mocks/router')
  return router.createRouterMock()
})
vi.mock('@/features/finance/services/finance.service', () => ({
  getFinanceSummary: vi.fn(),
  listFinancialCategories: vi.fn(),
  listFinancialTransactions: vi.fn(),
  listFixedExpenses: vi.fn(),
  createFinancialTransaction: vi.fn(),
  updateFinancialTransaction: vi.fn(),
  deleteFinancialTransaction: vi.fn(),
  createFinancialCategory: vi.fn(),
  updateFinancialCategory: vi.fn(),
  deleteFinancialCategory: vi.fn(),
  createFixedExpense: vi.fn(),
  updateFixedExpense: vi.fn(),
  generateFixedExpenseOccurrence: vi.fn(),
}))
// The chart and AI panel have independent suites; keep page data, forms, and dialogs real.
vi.mock('@/features/finance/components/IncomeExpensesChart', () => ({
  IncomeExpensesChart: () => <div>Gráfico financeiro</div>,
}))
vi.mock('@/features/finance/components/FinancialAnalysisPanel', () => ({
  FinancialAnalysisPanel: () => null,
}))

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getFinanceSummary).mockResolvedValue(
    makeSummary({
      expensesByCategory: [
        { categoryId: 'cat-2', categoryName: 'Materiais', amount: 100, color: null },
      ],
      incomeByService: [{ serviceId: 'service-1', serviceName: 'Limpeza', amount: 200 }],
    }),
  )
  vi.mocked(listFinancialCategories).mockResolvedValue([
    makeCategory(),
    makeCategory({ id: 'cat-2', name: 'Materiais', type: 'EXPENSE' }),
  ])
  vi.mocked(listFinancialTransactions).mockResolvedValue({
    data: [makeTransaction()],
    total: 1,
    page: 1,
    limit: 20,
  })
  vi.mocked(listFixedExpenses).mockResolvedValue([makeFixedExpense()])
  vi.mocked(deleteFinancialCategory).mockResolvedValue(undefined)
  vi.mocked(deleteFinancialTransaction).mockResolvedValue(undefined)
  vi.mocked(updateFixedExpense).mockResolvedValue(makeFixedExpense({ isActive: false }))
})

async function openFinance() {
  renderWithProviders(<FinancePageContainer />)
  await screen.findByRole('heading', { name: 'Movimentações' })
  return userEvent.setup()
}

// Responsive lists render desktop and mobile controls together in jsdom.
function firstButton(name: string | RegExp) {
  return screen.getAllByRole('button', { name })[0]
}

it('shows loading until financial data arrives and supports manual refresh', async () => {
  renderWithProviders(<FinancePageContainer />)
  expect(screen.getByText('Carregando dados financeiros...')).toBeInTheDocument()
  await screen.findByRole('heading', { name: 'Movimentações' })
  expect(screen.getByText('Resultado positivo')).toBeInTheDocument()
  expect(screen.getByText('Limpeza')).toBeInTheDocument()
  const before = vi.mocked(getFinanceSummary).mock.calls.length
  await userEvent.click(screen.getByRole('button', { name: 'Atualizar' }))
  await waitFor(() => expect(getFinanceSummary).toHaveBeenCalledTimes(before + 2))
})

it('shows the upgrade notice for a blocked plan without exposing transaction actions', async () => {
  vi.mocked(getFinanceSummary).mockRejectedValue(new ApiError('Plano bloqueado', 403, null))
  renderWithProviders(<FinancePageContainer />)
  await screen.findByRole('heading', { name: 'Gestão financeira' })
  expect(screen.queryByRole('heading', { name: 'Movimentações' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Cancelar lançamento/ })).not.toBeInTheDocument()
})

it('shows a failed load and retries successfully', async () => {
  vi.mocked(getFinanceSummary).mockRejectedValueOnce(new Error('Financeiro indisponível'))
  renderWithProviders(<FinancePageContainer />)
  await screen.findByText('Financeiro indisponível')
  await userEvent.click(screen.getByRole('button', { name: /Tentar novamente/ }))
  await screen.findByRole('heading', { name: 'Movimentações' })
  expect(screen.queryByText('Financeiro indisponível')).not.toBeInTheDocument()
})

it('shows a negative result when expenses exceed revenue', async () => {
  vi.mocked(getFinanceSummary).mockResolvedValue(
    makeSummary({ kpis: { ...makeSummary().kpis, netProfit: -500 } }),
  )
  await openFinance()
  expect(screen.getByText('Resultado negativo')).toBeInTheDocument()
})

it('filters pending receivables from the KPI and clears those filters from the empty state', async () => {
  vi.mocked(listFinancialTransactions).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 })
  const user = await openFinance()
  await user.click(screen.getByRole('button', { name: /recebíveis pendentes/i }))
  await screen.findAllByText('Nenhum recebível pendente no período selecionado')
  expect(listFinancialTransactions).toHaveBeenLastCalledWith(
    expect.objectContaining({ type: 'INCOME', status: 'PENDING' }),
    1,
    20,
  )
  await user.click(firstButton('Limpar filtros'))
  await screen.findAllByText('Nenhuma movimentação encontrada.')
  expect(listFinancialTransactions).toHaveBeenLastCalledWith(
    expect.objectContaining({ type: undefined, status: undefined, categoryId: undefined }),
    1,
    20,
  )
})

it.each(['Editar categoria', 'Editar lançamento', 'Editar despesa fixa'])(
  'opens and closes %s without submitting changes',
  async (action) => {
    const user = await openFinance()
    await user.click(firstButton(action))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  },
)

it.each([
  {
    action: 'Remover categoria',
    confirm: 'Remover categoria',
    service: deleteFinancialCategory,
    id: 'cat-1',
  },
  {
    action: 'Cancelar lançamento',
    confirm: 'Cancelar lançamento',
    service: deleteFinancialTransaction,
    id: 'txn-1',
  },
])('requires confirmation for $action', async ({ action, confirm, service, id }) => {
  const user = await openFinance()
  await user.click(firstButton(action))
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }))
  expect(service).not.toHaveBeenCalled()
  await user.click(firstButton(action))
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: confirm }))
  await waitFor(() => expect(service).toHaveBeenCalledWith(id))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
})

it.each([true, false])(
  'confirms the correct fixed-expense status change from active=%s',
  async (active) => {
    vi.mocked(listFixedExpenses).mockResolvedValue([makeFixedExpense({ isActive: active })])
    const user = await openFinance()
    const action = active ? 'Desativar' : 'Ativar'
    await user.click(firstButton(new RegExp(`${action} despesa`)))
    expect(screen.getByRole('dialog')).toHaveAccessibleName(`${action} despesa fixa`)
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }))
    expect(updateFixedExpense).not.toHaveBeenCalled()
    await user.click(firstButton(new RegExp(`${action} despesa`)))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: action }))
    await waitFor(() =>
      expect(updateFixedExpense).toHaveBeenCalledWith('exp-1', { isActive: !active }),
    )
  },
)
