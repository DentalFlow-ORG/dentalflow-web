import { apiRequest } from '@/services/http'

vi.mock('@/services/http', () => ({
  apiRequest: vi.fn(),
}))

const mockGetAccessToken = vi.fn(() => 'session-abc')
vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => mockGetAccessToken(),
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
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/privacy/requests?page=1&limit=20')
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

/**
 * These three calls omitted the session token while every other service passed
 * it, so the whole Compliance screen answered 401. The tabs then rendered their
 * empty state, telling an administrator there were no LGPD data-subject
 * requests when the query had in fact been rejected.
 */
describe('compliance requests are authenticated', () => {
  it.each([
    [
      'listPrivacyRequests',
      () =>
        listPrivacyRequests({
          status: '',
          requestType: '',
          requesterType: '',
          search: '',
          page: 1,
          limit: 20,
        }),
    ],
    ['listAuditLogs', () => listAuditLogs({ action: '', page: 1, limit: 20 })],
    ['listCookieConsents', () => listCookieConsents({ source: '', page: 1, limit: 20 })],
  ] as const)('%s sends the session token', async (_name, call) => {
    mockGetAccessToken.mockReturnValue('session-abc')

    await call()

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options?.accessToken).toBe('session-abc')
  })
})
