import { exportFinanceReport, getFinanceReportPreview } from '@/features/reports/services/reports.service'
import { ApiError } from '@/services/http'
import type { ReportPreviewResponse } from '@/features/reports/types/reports.types'

// ── Module mocks ──────────────────────────────────────────────────────────────

let mockApiUrl: string | undefined = 'http://localhost:3000'
const TEST_TOKEN = 'test-access-token'

vi.mock('@/config/env', () => ({
  env: {
    get apiUrl() {
      return mockApiUrl
    },
  },
}))

vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: vi.fn(() => TEST_TOKEN),
  clearSession: vi.fn(),
}))

vi.mock('@/features/auth/utils/auth-events', () => ({
  notifySessionExpired: vi.fn(),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePreviewData(overrides: Partial<ReportPreviewResponse> = {}): ReportPreviewResponse {
  return {
    reportType: 'finance',
    reportTitle: 'Relatório financeiro',
    clinic: { name: 'Clínica Teste', document: null },
    generatedAt: '2026-06-07T12:00:00.000Z',
    filters: [],
    period: null,
    recordCount: 10,
    maxRecords: 5000,
    isTruncated: false,
    exportFormat: 'CSV',
    empty: false,
    previewNote: null,
    ...overrides,
  }
}

function makeJsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function makeCsvResponse(csv = 'col1,col2\nval1,val2') {
  return new Response(csv, {
    status: 200,
    headers: { 'Content-Type': 'text/csv; charset=utf-8' },
  })
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

const mockFetch = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  mockApiUrl = 'http://localhost:3000'
  vi.useFakeTimers()
  vi.stubGlobal('fetch', mockFetch)
  Object.defineProperty(URL, 'createObjectURL', {
    value: vi.fn(() => 'blob:test-url'),
    configurable: true,
    writable: true,
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    value: vi.fn(),
    configurable: true,
    writable: true,
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

// ── Preview — Authorization ───────────────────────────────────────────────────

describe('getFinanceReportPreview — Authorization', () => {
  it('sends Authorization: Bearer header with the current access token', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse(200, makePreviewData()))

    await getFinanceReportPreview({})

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['Authorization']).toBe(
      `Bearer ${TEST_TOKEN}`,
    )
  })

  it('requests /reports/finance/preview', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse(200, makePreviewData()))

    await getFinanceReportPreview({})

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/reports/finance/preview')
  })

  it('surfaces ApiError on 401 with Portuguese session-expired message', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse(401, { message: 'Unauthorized' }))

    await expect(getFinanceReportPreview({})).rejects.toBeInstanceOf(ApiError)
  })

  it('401 error message is "Sessão expirada. Faça login novamente."', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse(401, { message: 'Unauthorized' }))

    const err = await getFinanceReportPreview({}).catch((e: unknown) => e)
    expect((err as ApiError).message).toBe('Sessão expirada. Faça login novamente.')
  })
})

// ── Export — Authorization ────────────────────────────────────────────────────

describe('exportFinanceReport — Authorization', () => {
  it('sends Authorization: Bearer header with the current access token', async () => {
    mockFetch.mockResolvedValue(makeCsvResponse())

    await exportFinanceReport({})

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['Authorization']).toBe(
      `Bearer ${TEST_TOKEN}`,
    )
  })

  it('requests /reports/finance/export', async () => {
    mockFetch.mockResolvedValue(makeCsvResponse())

    await exportFinanceReport({})

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/reports/finance/export')
  })

  it('surfaces ApiError on 401 with Portuguese session-expired message', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse(401, { message: 'Unauthorized' }))

    await expect(exportFinanceReport({})).rejects.toBeInstanceOf(ApiError)
  })

  it('401 error message is "Sessão expirada. Faça login novamente."', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse(401, { message: 'Unauthorized' }))

    const err = await exportFinanceReport({}).catch((e: unknown) => e)
    expect((err as ApiError).message).toBe('Sessão expirada. Faça login novamente.')
  })
})
