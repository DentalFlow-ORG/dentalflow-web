import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@/test-utils/render-utils'

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string
    onValueChange: (v: string) => void
    children: React.ReactNode
  }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}))

const mockListCookieConsents = vi.fn()
vi.mock('@/features/compliance/services/compliance.service', () => ({
  listCookieConsents: (...args: unknown[]) => mockListCookieConsents(...args),
}))

import { CookieConsentLogsTab } from '@/features/compliance/components/CookieConsentLogsTab'
import type { CookieConsentLog } from '@/features/compliance/types/compliance.types'

function makeLog(overrides: Partial<CookieConsentLog> = {}): CookieConsentLog {
  return {
    id: 'log-1',
    userId: 'user-12345678',
    anonymousId: null,
    categories: { necessary: true, preferences: true, analytics: false, marketing: false },
    policyVersion: '1.0',
    source: 'banner',
    ipHash: 'abc123',
    createdAt: '2026-06-01T12:00:00.000Z',
    ...overrides,
  }
}

function makeResult(data: CookieConsentLog[] = [makeLog()]) {
  return { data, total: data.length, page: 1, limit: 20, totalPages: 1 }
}

beforeEach(() => {
  mockListCookieConsents.mockReset()
})

describe('CookieConsentLogsTab', () => {
  it('shows the loaded rows', async () => {
    mockListCookieConsents.mockResolvedValue(makeResult())
    render(<CookieConsentLogsTab />)
    expect((await screen.findAllByText('Banner')).length).toBeGreaterThan(0)
  })

  it('shows an error message and retries', async () => {
    mockListCookieConsents.mockRejectedValue(new Error('Falha ao carregar'))
    render(<CookieConsentLogsTab />)
    expect(await screen.findByText('Falha ao carregar')).toBeInTheDocument()

    mockListCookieConsents.mockResolvedValue(makeResult())
    await userEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))
    expect((await screen.findAllByText('Banner')).length).toBeGreaterThan(0)
  })

  it('falls back to a default error message when the rejection has no message', async () => {
    mockListCookieConsents.mockRejectedValue({} as Error)
    render(<CookieConsentLogsTab />)
    expect(
      await screen.findByText('Não foi possível carregar os consentimentos.'),
    ).toBeInTheDocument()
  })

  it('shows an empty state when there are no results', async () => {
    mockListCookieConsents.mockResolvedValue(makeResult([]))
    render(<CookieConsentLogsTab />)
    expect(await screen.findByText('Nenhum consentimento encontrado')).toBeInTheDocument()
  })

  it('shows the total count, singular', async () => {
    mockListCookieConsents.mockResolvedValue(makeResult([makeLog()]))
    render(<CookieConsentLogsTab />)
    expect(await screen.findByText('1 registro')).toBeInTheDocument()
  })

  it('shows the total count, plural', async () => {
    mockListCookieConsents.mockResolvedValue(
      makeResult([makeLog({ id: 'a' }), makeLog({ id: 'b' })]),
    )
    render(<CookieConsentLogsTab />)
    expect(await screen.findByText('2 registros')).toBeInTheDocument()
  })

  it('shows "Preferências" tone for a non-banner source', async () => {
    mockListCookieConsents.mockResolvedValue(makeResult([makeLog({ source: 'preferences' })]))
    render(<CookieConsentLogsTab />)
    expect((await screen.findAllByText('Preferências')).length).toBeGreaterThan(0)
  })

  it('shows a masked userId when present', async () => {
    mockListCookieConsents.mockResolvedValue(makeResult([makeLog({ userId: 'user-12345678' })]))
    render(<CookieConsentLogsTab />)
    expect((await screen.findAllByText('user-123…')).length).toBeGreaterThan(0)
  })

  it('shows a masked anonymousId when userId is absent', async () => {
    mockListCookieConsents.mockResolvedValue(
      makeResult([makeLog({ userId: null, anonymousId: 'anon-12345678' })]),
    )
    render(<CookieConsentLogsTab />)
    expect((await screen.findAllByText('anon: anon-123…')).length).toBeGreaterThan(0)
  })

  it('shows a dash when neither userId nor anonymousId nor ipHash is present', async () => {
    mockListCookieConsents.mockResolvedValue(
      makeResult([makeLog({ userId: null, anonymousId: null, ipHash: null })]),
    )
    render(<CookieConsentLogsTab />)
    await screen.findAllByText('Banner')
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('renders category dots reflecting accepted/rejected categories', async () => {
    mockListCookieConsents.mockResolvedValue(makeResult())
    render(<CookieConsentLogsTab />)
    expect((await screen.findAllByText('Necessários')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Analíticos').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Marketing').length).toBeGreaterThan(0)
  })

  it('filters by source via the select', async () => {
    mockListCookieConsents.mockResolvedValue(makeResult())
    render(<CookieConsentLogsTab />)
    await screen.findAllByText('Banner')

    await userEvent.selectOptions(screen.getAllByRole('combobox')[0], 'preferences')

    await waitFor(() => {
      const lastCall = mockListCookieConsents.mock.calls.at(-1)?.[0]
      expect(lastCall.source).toBe('preferences')
    })
  })

  it('returns to all sources when the select goes back to the catch-all option', async () => {
    mockListCookieConsents.mockResolvedValue(makeResult())
    render(<CookieConsentLogsTab />)
    await screen.findAllByText('Banner')

    const select = screen.getAllByRole('combobox')[0]
    await userEvent.selectOptions(select, 'preferences')
    await waitFor(() => {
      expect(mockListCookieConsents.mock.calls.at(-1)?.[0].source).toBe('preferences')
    })

    await userEvent.selectOptions(select, '__ALL__')
    await waitFor(() => {
      expect(mockListCookieConsents.mock.calls.at(-1)?.[0].source).toBe('')
    })
  })

  it('filters by dateFrom via the native date input and resets to page 1', async () => {
    mockListCookieConsents.mockResolvedValue(makeResult())
    render(<CookieConsentLogsTab />)
    await screen.findAllByText('Banner')

    const dateFromInput = screen.getByLabelText('Data inicial')
    await userEvent.type(dateFromInput, '2026-06-01')

    await waitFor(() => {
      const lastCall = mockListCookieConsents.mock.calls.at(-1)?.[0]
      expect(lastCall.dateFrom).toBeTruthy()
      expect(lastCall.page).toBe(1)
    })
  })

  it('filters by dateTo via the native date input', async () => {
    mockListCookieConsents.mockResolvedValue(makeResult())
    render(<CookieConsentLogsTab />)
    await screen.findAllByText('Banner')

    await userEvent.type(screen.getByLabelText('Data final'), '2026-06-15')

    await waitFor(() => {
      const lastCall = mockListCookieConsents.mock.calls.at(-1)?.[0]
      expect(lastCall.dateTo).toBeTruthy()
    })
  })

  it('changes the page size via the pagination control', async () => {
    mockListCookieConsents.mockResolvedValue(makeResult())
    render(<CookieConsentLogsTab />)
    await screen.findAllByText('Banner')

    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[selects.length - 1], '50')

    await waitFor(() => {
      const lastCall = mockListCookieConsents.mock.calls.at(-1)?.[0]
      expect(lastCall.limit).toBe(50)
    })
  })

  it('shows a "Limpar filtros" button once a filter is active, and clears it', async () => {
    mockListCookieConsents.mockResolvedValue(makeResult())
    render(<CookieConsentLogsTab />)
    await screen.findAllByText('Banner')

    expect(screen.queryByRole('button', { name: /limpar filtros/i })).not.toBeInTheDocument()

    await userEvent.selectOptions(screen.getAllByRole('combobox')[0], 'preferences')
    const clearButton = await screen.findByRole('button', { name: /limpar filtros/i })
    await userEvent.click(clearButton)

    expect(screen.queryByRole('button', { name: /limpar filtros/i })).not.toBeInTheDocument()
  })
})
