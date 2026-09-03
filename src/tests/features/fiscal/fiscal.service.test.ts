import {
  cancelInvoice,
  createInvoice,
  getAppointmentInvoiceDraft,
  getFiscalProfile,
  getFiscalSummary,
  getInvoice,
  listAppointmentsForInvoice,
  listInvoices,
  markInvoiceReady,
  saveFiscalProfile,
  simulateInvoiceIssue,
  updateInvoice,
} from '@/features/fiscal/services/fiscal.service'

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

describe('getFiscalProfile', () => {
  it('calls GET /clinic/fiscal-profile with the access token', async () => {
    await getFiscalProfile()
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinic/fiscal-profile')
    expect(options.method).toBe('GET')
    expect(options.accessToken).toBe('tok-123')
  })
})

describe('saveFiscalProfile', () => {
  it('calls PUT /clinic/fiscal-profile with the JSON-serialized payload', async () => {
    const payload = { legalName: 'Clínica X' }
    await saveFiscalProfile(payload as never)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinic/fiscal-profile')
    expect(options.method).toBe('PUT')
    expect(options.body).toBe(JSON.stringify(payload))
  })
})

describe('getFiscalSummary', () => {
  it('calls GET /clinic/invoices/summary', async () => {
    await getFiscalSummary()
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinic/invoices/summary')
    expect(options.method).toBe('GET')
  })
})

describe('listInvoices', () => {
  it('builds a query string from non-empty filters', async () => {
    await listInvoices({
      status: 'ISSUED',
      customer: 'ana',
      from: '2026-01-01',
      to: '2026-01-31',
      page: 2,
      limit: 20,
    } as never)
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toContain('/clinic/invoices?')
    expect(path).toContain('status=ISSUED')
    expect(path).toContain('customer=ana')
    expect(path).toContain('page=2')
  })

  it('omits the query string entirely when all filters are empty/undefined', async () => {
    await listInvoices({} as never)
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinic/invoices')
  })
})

describe('createInvoice', () => {
  it('calls POST /clinic/invoices with the JSON-serialized payload', async () => {
    const payload = { customerName: 'Ana' }
    await createInvoice(payload as never)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinic/invoices')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify(payload))
  })
})

describe('getInvoice', () => {
  it('calls GET /clinic/invoices/:id', async () => {
    await getInvoice('inv-1')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinic/invoices/inv-1')
    expect(options.method).toBe('GET')
  })
})

describe('updateInvoice', () => {
  it('calls PATCH /clinic/invoices/:id with the JSON-serialized payload', async () => {
    const payload = { customerName: 'Ana Updated' }
    await updateInvoice('inv-1', payload as never)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinic/invoices/inv-1')
    expect(options.method).toBe('PATCH')
    expect(options.body).toBe(JSON.stringify(payload))
  })
})

describe('markInvoiceReady', () => {
  it('calls POST /clinic/invoices/:id/mark-ready', async () => {
    await markInvoiceReady('inv-1')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinic/invoices/inv-1/mark-ready')
    expect(options.method).toBe('POST')
  })
})

describe('simulateInvoiceIssue', () => {
  it('calls POST /clinic/invoices/:id/simulate-issue', async () => {
    await simulateInvoiceIssue('inv-1')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinic/invoices/inv-1/simulate-issue')
    expect(options.method).toBe('POST')
  })
})

describe('cancelInvoice', () => {
  it('calls POST /clinic/invoices/:id/cancel with the reason', async () => {
    await cancelInvoice('inv-1', 'Duplicado')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinic/invoices/inv-1/cancel')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify({ reason: 'Duplicado' }))
  })
})

describe('listAppointmentsForInvoice', () => {
  it('builds a query string from non-empty filters', async () => {
    await listAppointmentsForInvoice({
      patient: 'ana',
      from: '2026-01-01',
      to: '2026-01-31',
      profileId: 'p1',
      paymentStatus: 'PAID',
      page: 1,
      limit: 10,
    } as never)
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toContain('/clinic/invoices/appointments?')
    expect(path).toContain('patient=ana')
    expect(path).toContain('profileId=p1')
  })

  it('omits the query string entirely when all filters are empty/undefined', async () => {
    await listAppointmentsForInvoice({} as never)
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinic/invoices/appointments')
  })
})

describe('getAppointmentInvoiceDraft', () => {
  it('calls GET /clinic/invoices/from-appointment/:appointmentId', async () => {
    await getAppointmentInvoiceDraft('appt-1')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/clinic/invoices/from-appointment/appt-1')
    expect(options.method).toBe('GET')
  })
})
