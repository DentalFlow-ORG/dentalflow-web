import { generateMonthlyDiagnosis } from '@/features/finance/services/finance-diagnosis.service'

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

describe('generateMonthlyDiagnosis', () => {
  it('POSTs with forceRefresh defaulting to false', async () => {
    await generateMonthlyDiagnosis('2026-06')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/finance/ai/monthly-diagnosis')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify({ month: '2026-06', forceRefresh: false }))
  })

  it('POSTs with forceRefresh true when specified', async () => {
    await generateMonthlyDiagnosis('2026-06', true)
    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.body).toBe(JSON.stringify({ month: '2026-06', forceRefresh: true }))
  })
})
