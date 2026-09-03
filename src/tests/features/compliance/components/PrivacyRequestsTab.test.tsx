import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@/test-utils/render-utils'

// Radix Select does not work reliably in JSDOM — stub with a native <select>.
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

const mockListPrivacyRequests = vi.fn()
vi.mock('@/features/compliance/services/compliance.service', () => ({
  listPrivacyRequests: (...args: unknown[]) => mockListPrivacyRequests(...args),
}))

import { PrivacyRequestsTab } from '@/features/compliance/components/PrivacyRequestsTab'
import type { PrivacyRequest } from '@/features/compliance/types/compliance.types'

function makeRequest(overrides: Partial<PrivacyRequest> = {}): PrivacyRequest {
  return {
    id: 'req-1',
    requestCode: 'REQ-001',
    requesterName: 'Ana Silva',
    requesterEmail: 'ana@example.com',
    requesterType: 'PATIENT',
    requestType: 'ACCESS_DATA',
    status: 'OPEN',
    createdAt: '2026-06-01T12:00:00.000Z',
    updatedAt: '2026-06-01T12:00:00.000Z',
    ...overrides,
  }
}

function makeResult(data: PrivacyRequest[] = [makeRequest()]) {
  return { data, total: data.length, page: 1, limit: 20, totalPages: 1 }
}

beforeEach(() => {
  mockListPrivacyRequests.mockReset()
})

describe('PrivacyRequestsTab', () => {
  it('shows a loading state, then the loaded rows', async () => {
    mockListPrivacyRequests.mockResolvedValue(makeResult())
    render(<PrivacyRequestsTab />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect((await screen.findAllByText('Ana Silva')).length).toBeGreaterThan(0)
  })

  it('shows an error state with a retry button', async () => {
    mockListPrivacyRequests.mockRejectedValue(new Error('Falha de rede'))
    render(<PrivacyRequestsTab />)
    expect(await screen.findByText('Falha de rede')).toBeInTheDocument()

    mockListPrivacyRequests.mockResolvedValue(makeResult())
    await userEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))
    expect((await screen.findAllByText('Ana Silva')).length).toBeGreaterThan(0)
  })

  it('falls back to a default error message when the rejection has no message', async () => {
    mockListPrivacyRequests.mockRejectedValue({} as Error)
    render(<PrivacyRequestsTab />)
    expect(
      await screen.findByText('Não foi possível carregar as solicitações.'),
    ).toBeInTheDocument()
  })

  it('shows an empty state when there are no results', async () => {
    mockListPrivacyRequests.mockResolvedValue(makeResult([]))
    render(<PrivacyRequestsTab />)
    expect(await screen.findByText('Nenhuma solicitação encontrada')).toBeInTheDocument()
  })

  it('shows the total count, singular for one result', async () => {
    mockListPrivacyRequests.mockResolvedValue(makeResult([makeRequest()]))
    render(<PrivacyRequestsTab />)
    expect(await screen.findByText('1 solicitação')).toBeInTheDocument()
  })

  it('shows the total count, plural for multiple results', async () => {
    mockListPrivacyRequests.mockResolvedValue(
      makeResult([makeRequest({ id: 'a' }), makeRequest({ id: 'b' })]),
    )
    render(<PrivacyRequestsTab />)
    expect(await screen.findByText('2 solicitações')).toBeInTheDocument()
  })

  it('shows a placeholder for a missing email', async () => {
    mockListPrivacyRequests.mockResolvedValue(
      makeResult([makeRequest({ requesterEmail: undefined })]),
    )
    render(<PrivacyRequestsTab />)
    await screen.findAllByText('Ana Silva')
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('filters by search text and resets to page 1', async () => {
    mockListPrivacyRequests.mockResolvedValue(makeResult())
    render(<PrivacyRequestsTab />)
    await screen.findAllByText('Ana Silva')

    await userEvent.type(screen.getByPlaceholderText(/buscar por código/i), 'ana')

    await waitFor(() => {
      const lastCall = mockListPrivacyRequests.mock.calls.at(-1)?.[0]
      expect(lastCall.search).toBe('ana')
      expect(lastCall.page).toBe(1)
    })
  })

  it('filters by status via the select', async () => {
    mockListPrivacyRequests.mockResolvedValue(makeResult())
    render(<PrivacyRequestsTab />)
    await screen.findAllByText('Ana Silva')

    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[0], 'COMPLETED')

    await waitFor(() => {
      const lastCall = mockListPrivacyRequests.mock.calls.at(-1)?.[0]
      expect(lastCall.status).toBe('COMPLETED')
    })
  })

  it('filters by request type via the select', async () => {
    mockListPrivacyRequests.mockResolvedValue(makeResult())
    render(<PrivacyRequestsTab />)
    await screen.findAllByText('Ana Silva')

    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[1], 'PORTABILITY')

    await waitFor(() => {
      const lastCall = mockListPrivacyRequests.mock.calls.at(-1)?.[0]
      expect(lastCall.requestType).toBe('PORTABILITY')
    })
  })

  it('shows a "Limpar filtros" button once a filter is active, and clears it', async () => {
    mockListPrivacyRequests.mockResolvedValue(makeResult())
    render(<PrivacyRequestsTab />)
    await screen.findAllByText('Ana Silva')

    expect(screen.queryByRole('button', { name: /limpar filtros/i })).not.toBeInTheDocument()

    await userEvent.type(screen.getByPlaceholderText(/buscar por código/i), 'x')
    const clearButton = await screen.findByRole('button', { name: /limpar filtros/i })
    await userEvent.click(clearButton)

    expect(screen.getByPlaceholderText(/buscar por código/i)).toHaveValue('')
  })

  it('changes the page size via the pagination control', async () => {
    mockListPrivacyRequests.mockResolvedValue(makeResult())
    render(<PrivacyRequestsTab />)
    await screen.findAllByText('Ana Silva')

    const selects = screen.getAllByRole('combobox')
    const pageSizeSelect = selects[selects.length - 1]
    await userEvent.selectOptions(pageSizeSelect, '50')

    await waitFor(() => {
      const lastCall = mockListPrivacyRequests.mock.calls.at(-1)?.[0]
      expect(lastCall.limit).toBe(50)
      expect(lastCall.page).toBe(1)
    })
  })

  it('renders an unmapped requesterType/requestType as-is', async () => {
    mockListPrivacyRequests.mockResolvedValue(
      makeResult([
        makeRequest({
          requesterType: 'UNKNOWN_TYPE' as PrivacyRequest['requesterType'],
        }),
      ]),
    )
    render(<PrivacyRequestsTab />)
    expect(await screen.findAllByText('UNKNOWN_TYPE')).not.toHaveLength(0)
  })
})
