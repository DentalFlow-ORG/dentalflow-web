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

const mockListAuditLogs = vi.fn()
vi.mock('@/features/compliance/services/compliance.service', () => ({
  listAuditLogs: (...args: unknown[]) => mockListAuditLogs(...args),
}))

import { AuditLogsTab } from '@/features/compliance/components/AuditLogsTab'
import type { AuditLogEntry } from '@/features/compliance/types/compliance.types'

function makeLog(overrides: Partial<AuditLogEntry> = {}): AuditLogEntry {
  return {
    id: 'log-1',
    actorUserId: 'user-12345678',
    clinicId: 'clinic-1',
    action: 'USER_LOGIN_SUCCESS',
    entityType: 'User',
    entityId: 'entity-12345678',
    metadata: { foo: 'bar' },
    ipHash: 'abc123',
    createdAt: '2026-06-01T12:00:00.000Z',
    ...overrides,
  }
}

function makeResult(data: AuditLogEntry[] = [makeLog()]) {
  return { data, total: data.length, page: 1, limit: 20, totalPages: 1 }
}

beforeEach(() => {
  mockListAuditLogs.mockReset()
})

describe('AuditLogsTab', () => {
  it('shows the loaded rows', async () => {
    mockListAuditLogs.mockResolvedValue(makeResult())
    render(<AuditLogsTab />)
    expect((await screen.findAllByText('USER_LOGIN_SUCCESS')).length).toBeGreaterThan(0)
  })

  it('shows an error message and retries via the retry key', async () => {
    mockListAuditLogs.mockRejectedValue(new Error('Falha ao carregar'))
    render(<AuditLogsTab />)
    expect(await screen.findByText('Falha ao carregar')).toBeInTheDocument()

    mockListAuditLogs.mockResolvedValue(makeResult())
    await userEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))
    expect((await screen.findAllByText('USER_LOGIN_SUCCESS')).length).toBeGreaterThan(0)
  })

  it('falls back to a default error message when the rejection has no message', async () => {
    mockListAuditLogs.mockRejectedValue({} as Error)
    render(<AuditLogsTab />)
    expect(await screen.findByText('Não foi possível carregar os logs.')).toBeInTheDocument()
  })

  it('shows an empty state when there are no results', async () => {
    mockListAuditLogs.mockResolvedValue(makeResult([]))
    render(<AuditLogsTab />)
    expect(await screen.findByText('Nenhum evento encontrado')).toBeInTheDocument()
  })

  it('shows the total count, singular', async () => {
    mockListAuditLogs.mockResolvedValue(makeResult([makeLog()]))
    render(<AuditLogsTab />)
    expect(await screen.findByText('1 evento')).toBeInTheDocument()
  })

  it('shows the total count, plural', async () => {
    mockListAuditLogs.mockResolvedValue(makeResult([makeLog({ id: 'a' }), makeLog({ id: 'b' })]))
    render(<AuditLogsTab />)
    expect(await screen.findByText('2 eventos')).toBeInTheDocument()
  })

  it('shows a placeholder dash when actorUserId, entityType, and ipHash are null', async () => {
    mockListAuditLogs.mockResolvedValue(
      makeResult([makeLog({ actorUserId: null, entityType: null, entityId: null, ipHash: null })]),
    )
    render(<AuditLogsTab />)
    await screen.findAllByText('USER_LOGIN_SUCCESS')
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('renders "—" for metadata when it is null', async () => {
    mockListAuditLogs.mockResolvedValue(makeResult([makeLog({ metadata: null })]))
    render(<AuditLogsTab />)
    await screen.findAllByText('USER_LOGIN_SUCCESS')
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('redacts sensitive metadata fields', async () => {
    mockListAuditLogs.mockResolvedValue(
      makeResult([
        makeLog({
          metadata: {
            token: 'secret-token',
            password: 'p',
            secret: 's',
            authorization: 'a',
            ok: 1,
          },
        }),
      ]),
    )
    render(<AuditLogsTab />)
    await screen.findAllByText('USER_LOGIN_SUCCESS')
    expect(screen.queryByText(/secret-token/)).not.toBeInTheDocument()
  })

  it('truncates metadata longer than 120 characters', async () => {
    const longValue = 'x'.repeat(200)
    mockListAuditLogs.mockResolvedValue(makeResult([makeLog({ metadata: { data: longValue } })]))
    render(<AuditLogsTab />)
    await screen.findAllByText('USER_LOGIN_SUCCESS')
    const truncated = screen.getAllByText((_, el) => el?.textContent?.endsWith('…') ?? false)
    expect(truncated.length).toBeGreaterThan(0)
  })

  it('filters by action and resets to page 1', async () => {
    mockListAuditLogs.mockResolvedValue(makeResult())
    render(<AuditLogsTab />)
    await screen.findAllByText('USER_LOGIN_SUCCESS')

    const select = screen.getAllByRole('combobox')[0]
    await userEvent.selectOptions(select, 'USER_CREATED')

    await waitFor(() => {
      const lastCall = mockListAuditLogs.mock.calls.at(-1)?.[0]
      expect(lastCall.action).toBe('USER_CREATED')
      expect(lastCall.page).toBe(1)
    })
  })

  it('returns to all actions when the select goes back to the catch-all option', async () => {
    mockListAuditLogs.mockResolvedValue(makeResult())
    render(<AuditLogsTab />)
    await screen.findAllByText('USER_LOGIN_SUCCESS')

    const select = screen.getAllByRole('combobox')[0]
    await userEvent.selectOptions(select, 'USER_CREATED')
    await waitFor(() => {
      expect(mockListAuditLogs.mock.calls.at(-1)?.[0].action).toBe('USER_CREATED')
    })

    await userEvent.selectOptions(select, '__ALL__')
    await waitFor(() => {
      expect(mockListAuditLogs.mock.calls.at(-1)?.[0].action).toBe('')
    })
  })

  it('filters by dateFrom/dateTo via DatePickerInput', async () => {
    mockListAuditLogs.mockResolvedValue(makeResult())
    render(<AuditLogsTab />)
    await screen.findAllByText('USER_LOGIN_SUCCESS')

    await userEvent.type(screen.getByLabelText('Data inicial'), '01062026')
    await waitFor(() => {
      const lastCall = mockListAuditLogs.mock.calls.at(-1)?.[0]
      expect(lastCall.dateFrom).toBe('2026-06-01')
    })

    await userEvent.type(screen.getByLabelText('Data final'), '15062026')
    await waitFor(() => {
      const lastCall = mockListAuditLogs.mock.calls.at(-1)?.[0]
      expect(lastCall.dateTo).toBe('2026-06-15')
    })
  })

  it('changes the page size via the pagination control', async () => {
    mockListAuditLogs.mockResolvedValue(makeResult())
    render(<AuditLogsTab />)
    await screen.findAllByText('USER_LOGIN_SUCCESS')

    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[selects.length - 1], '50')

    await waitFor(() => {
      const lastCall = mockListAuditLogs.mock.calls.at(-1)?.[0]
      expect(lastCall.limit).toBe(50)
    })
  })

  it('shows a "Limpar filtros" button once a filter is active, and clears it', async () => {
    mockListAuditLogs.mockResolvedValue(makeResult())
    render(<AuditLogsTab />)
    await screen.findAllByText('USER_LOGIN_SUCCESS')

    expect(screen.queryByRole('button', { name: /limpar filtros/i })).not.toBeInTheDocument()

    await userEvent.selectOptions(screen.getAllByRole('combobox')[0], 'USER_CREATED')
    const clearButton = await screen.findByRole('button', { name: /limpar filtros/i })
    await userEvent.click(clearButton)

    expect(screen.queryByRole('button', { name: /limpar filtros/i })).not.toBeInTheDocument()
  })
})
