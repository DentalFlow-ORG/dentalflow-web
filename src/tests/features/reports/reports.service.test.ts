import {
  exportAppointmentsReport,
  exportFinanceReport,
  exportInventoryReport,
  exportInvoicesReport,
  getAppointmentsReportPreview,
  getFinanceReportPreview,
  getInventoryReportPreview,
  getInvoicesReportPreview,
} from '@/features/reports/services/reports.service'
import type { ReportPreviewResponse } from '@/features/reports/types/reports.types'
import { ApiError } from '@/services/http'

// ── Module mocks ──────────────────────────────────────────────────────────────

let mockApiUrl: string | undefined = 'http://localhost:3000'
const TEST_TOKEN = 'test-access-token'

vi.mock('@/config/env', () => ({
  env: {
    get apiUrl() {
      return mockApiUrl
    },
  },
  requireApiUrl: () => {
    if (!mockApiUrl) throw new Error('VITE_API_URL não está configurada.')
    return mockApiUrl
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
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${TEST_TOKEN}`)
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
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${TEST_TOKEN}`)
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

  it('includes all provided filters in the query string', async () => {
    mockFetch.mockResolvedValue(makeCsvResponse())

    await exportFinanceReport({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      type: 'INCOME',
      status: 'PAID',
      categoryId: 'cat-1',
    })

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('startDate=2026-01-01')
    expect(url).toContain('endDate=2026-01-31')
    expect(url).toContain('type=INCOME')
    expect(url).toContain('status=PAID')
    expect(url).toContain('categoryId=cat-1')
  })

  it('omits undefined/empty filters from the query string', async () => {
    mockFetch.mockResolvedValue(makeCsvResponse())

    await exportFinanceReport({ type: '' })

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://localhost:3000/reports/finance/export')
  })

  it('creates a download link with the CSV blob and filename, then revokes the object URL', async () => {
    mockFetch.mockResolvedValue(makeCsvResponse('a,b\n1,2'))
    const clickSpy = vi.fn()
    const appendSpy = vi.spyOn(document.body, 'appendChild')
    const removeSpy = vi.spyOn(document.body, 'removeChild')
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') el.click = clickSpy
      return el
    })

    await exportFinanceReport({})

    expect(clickSpy).toHaveBeenCalledOnce()
    expect(appendSpy).toHaveBeenCalled()
    expect(removeSpy).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url')

    vi.restoreAllMocks()
  })
})

// ── Appointments report ────────────────────────────────────────────────────────

describe('appointments report — export and preview', () => {
  it('requests /reports/appointments/preview with all filters', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse(200, makePreviewData()))

    await getAppointmentsReportPreview({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      status: 'CONFIRMED',
      profileId: 'prof-1',
    })

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/reports/appointments/preview')
    expect(url).toContain('profileId=prof-1')
  })

  it('requests /reports/appointments/export', async () => {
    mockFetch.mockResolvedValue(makeCsvResponse())

    await exportAppointmentsReport({})

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/reports/appointments/export')
  })
})

// ── Inventory report ────────────────────────────────────────────────────────────

describe('inventory report — export and preview', () => {
  it('requests /reports/inventory/preview with all filters', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse(200, makePreviewData()))

    await getInventoryReportPreview({ categoryId: 'cat-1', status: 'LOW' })

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/reports/inventory/preview')
    expect(url).toContain('categoryId=cat-1')
    expect(url).toContain('status=LOW')
  })

  it('requests /reports/inventory/export', async () => {
    mockFetch.mockResolvedValue(makeCsvResponse())

    await exportInventoryReport({})

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/reports/inventory/export')
  })
})

// ── Invoices report ──────────────────────────────────────────────────────────

describe('invoices report — export and preview', () => {
  it('requests /reports/invoices/preview with all filters', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse(200, makePreviewData()))

    await getInvoicesReportPreview({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      status: 'ISSUED',
    })

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/reports/invoices/preview')
    expect(url).toContain('status=ISSUED')
  })

  it('requests /reports/invoices/export', async () => {
    mockFetch.mockResolvedValue(makeCsvResponse())

    await exportInvoicesReport({})

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/reports/invoices/export')
  })
})
