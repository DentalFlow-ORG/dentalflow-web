import { apiRequest } from '@/services/http'

vi.mock('@/services/http', () => ({
  apiRequest: vi.fn(),
}))

import {
  listAuditLogs,
  listCookieConsents,
  listPrivacyRequests,
} from '@/features/compliance/services/compliance.service'

const mockApiRequest = vi.mocked(apiRequest)

beforeEach(() => {
  mockApiRequest.mockReset()
  mockApiRequest.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 1 })
})

describe('listPrivacyRequests', () => {
  it('builds a query string from non-empty filters', async () => {
    await listPrivacyRequests({
      status: 'OPEN',
      requestType: '',
      requesterType: '',
      search: 'ana',
      page: 2,
      limit: 20,
    })
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toContain('/privacy/requests?')
    expect(path).toContain('status=OPEN')
    expect(path).toContain('search=ana')
    expect(path).toContain('page=2')
    expect(path).not.toContain('requestType')
  })

  it('omits the query string entirely when all filters are empty', async () => {
    await listPrivacyRequests({
      status: '',
      requestType: '',
      requesterType: '',
      search: '',
      page: 1,
      limit: 20,
    })
    expect(mockApiRequest).toHaveBeenCalledWith('/privacy/requests?page=1&limit=20')
  })
})

describe('listAuditLogs', () => {
  it('builds a query string from non-empty filters', async () => {
    await listAuditLogs({
      action: 'USER_LOGIN_SUCCESS',
      actorUserId: '',
      clinicId: '',
      dateFrom: '2026-06-01',
      dateTo: '',
      page: 1,
      limit: 20,
    })
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toContain('/audit-logs?')
    expect(path).toContain('action=USER_LOGIN_SUCCESS')
    expect(path).toContain('dateFrom=2026-06-01')
    expect(path).not.toContain('dateTo')
  })
})

describe('listCookieConsents', () => {
  it('builds a query string from non-empty filters', async () => {
    await listCookieConsents({
      source: 'banner',
      policyVersion: '',
      userId: '',
      dateFrom: '',
      dateTo: '',
      page: 1,
      limit: 20,
    })
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toContain('/privacy/cookie-consents?')
    expect(path).toContain('source=banner')
  })

  it('excludes null/undefined values from the query string', async () => {
    await listCookieConsents({
      source: undefined as unknown as string,
      policyVersion: null as unknown as string,
      userId: '',
      dateFrom: '',
      dateTo: '',
      page: 1,
      limit: 20,
    })
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).not.toContain('source')
    expect(path).not.toContain('policyVersion')
  })
})
