import {
  applySuggestedCategory,
  classifyExpense,
} from '@/features/finance/services/finance-classify.service'

const mockApiRequest = vi.fn()

vi.mock('@/services/http', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => 'tok-123',
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockApiRequest.mockResolvedValue({})
})

describe('classifyExpense', () => {
  it('POSTs with forceAi defaulting to false', async () => {
    await classifyExpense('tx-1')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/transactions/tx-1/classify-expense')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify({ forceAi: false }))
  })

  it('POSTs with forceAi true when specified', async () => {
    await classifyExpense('tx-1', true)
    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.body).toBe(JSON.stringify({ forceAi: true }))
  })
})

describe('applySuggestedCategory', () => {
  it('PATCHes with the categoryId', async () => {
    await applySuggestedCategory('tx-1', 'cat-1')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/transactions/tx-1/apply-suggested-category')
    expect(options.method).toBe('PATCH')
    expect(options.body).toBe(JSON.stringify({ categoryId: 'cat-1' }))
  })
})
