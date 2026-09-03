import {
  createFinancialCategory,
  createFinancialTransaction,
  createFixedExpense,
  deleteFinancialCategory,
  deleteFinancialTransaction,
  generateFixedExpenseOccurrence,
  getFinanceSummary,
  listFinancialCategories,
  listFinancialTransactions,
  listFixedExpenses,
  updateFinancialCategory,
  updateFinancialTransaction,
  updateFixedExpense,
} from '@/features/finance/services/finance.service'

const mockApiRequest = vi.fn()
const mockGetAccessToken = vi.fn(() => 'tok-123')

vi.mock('@/services/http', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => mockGetAccessToken(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockApiRequest.mockResolvedValue({})
})

describe('getFinanceSummary', () => {
  it('builds the query string from provided filters', async () => {
    await getFinanceSummary({ from: '2026-06-01', to: '2026-06-30', groupBy: 'month' } as never)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/summary?from=2026-06-01&to=2026-06-30&groupBy=month')
    expect(options.method).toBe('GET')
    expect(options.accessToken).toBe('tok-123')
  })

  it('omits undefined filter fields from the query string', async () => {
    await getFinanceSummary({ from: undefined, to: undefined, groupBy: undefined } as never)
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/summary')
  })
})

describe('listFinancialCategories', () => {
  it('calls GET /finance/categories', async () => {
    await listFinancialCategories()
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/categories')
    expect(options.method).toBe('GET')
  })
})

describe('createFinancialCategory', () => {
  it('POSTs the serialized dto', async () => {
    const dto = { name: 'Consultas', type: 'INCOME' }
    await createFinancialCategory(dto as never)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/categories')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify(dto))
  })
})

describe('updateFinancialCategory', () => {
  it('PATCHes the category by id', async () => {
    const dto = { name: 'Novo nome' }
    await updateFinancialCategory('cat-1', dto as never)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/categories/cat-1')
    expect(options.method).toBe('PATCH')
    expect(options.body).toBe(JSON.stringify(dto))
  })
})

describe('deleteFinancialCategory', () => {
  it('DELETEs the category by id', async () => {
    await deleteFinancialCategory('cat-1')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/categories/cat-1')
    expect(options.method).toBe('DELETE')
  })
})

describe('listFinancialTransactions', () => {
  it('builds the query string with default page/limit', async () => {
    await listFinancialTransactions({} as never)
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/transactions?page=1&limit=20')
  })

  it('includes all provided filters and custom page/limit', async () => {
    await listFinancialTransactions(
      {
        from: '2026-06-01',
        to: '2026-06-30',
        type: 'EXPENSE',
        status: 'PAID',
        categoryId: 'cat-1',
      } as never,
      2,
      50,
    )
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe(
      '/finance/transactions?from=2026-06-01&to=2026-06-30&type=EXPENSE&status=PAID&categoryId=cat-1&page=2&limit=50',
    )
  })
})

describe('createFinancialTransaction', () => {
  it('POSTs the serialized dto', async () => {
    const dto = { amountCents: 1000, type: 'INCOME' }
    await createFinancialTransaction(dto as never)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/transactions')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify(dto))
  })
})

describe('updateFinancialTransaction', () => {
  it('PATCHes the transaction by id', async () => {
    const dto = { amountCents: 2000 }
    await updateFinancialTransaction('tx-1', dto as never)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/transactions/tx-1')
    expect(options.method).toBe('PATCH')
    expect(options.body).toBe(JSON.stringify(dto))
  })
})

describe('deleteFinancialTransaction', () => {
  it('DELETEs the transaction by id', async () => {
    await deleteFinancialTransaction('tx-1')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/transactions/tx-1')
    expect(options.method).toBe('DELETE')
  })
})

describe('listFixedExpenses', () => {
  it('calls GET /finance/fixed-expenses', async () => {
    await listFixedExpenses()
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/fixed-expenses')
    expect(options.method).toBe('GET')
  })
})

describe('createFixedExpense', () => {
  it('POSTs the serialized dto', async () => {
    const dto = { description: 'Aluguel', amountCents: 300000 }
    await createFixedExpense(dto as never)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/fixed-expenses')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify(dto))
  })
})

describe('updateFixedExpense', () => {
  it('PATCHes the fixed expense by id', async () => {
    const dto = { amountCents: 350000 }
    await updateFixedExpense('fx-1', dto as never)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/fixed-expenses/fx-1')
    expect(options.method).toBe('PATCH')
    expect(options.body).toBe(JSON.stringify(dto))
  })
})

describe('generateFixedExpenseOccurrence', () => {
  it('POSTs to the generate endpoint with the period query param', async () => {
    await generateFixedExpenseOccurrence('fx-1', '2026-06')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/fixed-expenses/fx-1/generate?period=2026-06')
    expect(options.method).toBe('POST')
  })
})
