import {
  generateAbnormalConsumptionCopilotSummary,
  getAbnormalConsumption,
  getLatestAbnormalConsumptionSummary,
} from '@/features/inventory/services/stock-abnormal-consumption.service'

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

describe('getAbnormalConsumption', () => {
  it('calls GET /stock/abnormal-consumption', async () => {
    await getAbnormalConsumption()
    expect(mockApiRequest).toHaveBeenCalledWith('/stock/abnormal-consumption', {
      method: 'GET',
      accessToken: 'tok-123',
    })
  })
})

describe('getLatestAbnormalConsumptionSummary', () => {
  it('calls GET .../copilot-summary/latest', async () => {
    await getLatestAbnormalConsumptionSummary()
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/stock/abnormal-consumption/copilot-summary/latest',
      { method: 'GET', accessToken: 'tok-123' },
    )
  })
})

describe('generateAbnormalConsumptionCopilotSummary', () => {
  it('POSTs to .../copilot-summary with forceRefresh: true', async () => {
    await generateAbnormalConsumptionCopilotSummary()
    expect(mockApiRequest).toHaveBeenCalledWith('/stock/abnormal-consumption/copilot-summary', {
      method: 'POST',
      accessToken: 'tok-123',
      body: JSON.stringify({ forceRefresh: true }),
    })
  })
})
