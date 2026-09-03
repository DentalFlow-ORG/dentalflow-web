import { act, waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

import { useFiscalInvoicesPage } from '@/features/fiscal/hooks/useFiscalInvoicesPage'
import type { ServiceInvoice } from '@/features/fiscal/types/fiscal.types'
import { ApiError } from '@/services/http'

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

const mockGetFiscalProfile = vi.fn()
const mockGetFiscalSummary = vi.fn()
const mockListInvoices = vi.fn()
const mockCreateInvoice = vi.fn()
const mockUpdateInvoice = vi.fn()
const mockGetInvoice = vi.fn()
const mockMarkInvoiceReady = vi.fn()
const mockSimulateInvoiceIssue = vi.fn()
const mockCancelInvoice = vi.fn()
const mockSaveFiscalProfile = vi.fn()

vi.mock('@/features/fiscal/services/fiscal.service', () => ({
  getFiscalProfile: (...args: unknown[]) => mockGetFiscalProfile(...args),
  getFiscalSummary: (...args: unknown[]) => mockGetFiscalSummary(...args),
  listInvoices: (...args: unknown[]) => mockListInvoices(...args),
  createInvoice: (...args: unknown[]) => mockCreateInvoice(...args),
  updateInvoice: (...args: unknown[]) => mockUpdateInvoice(...args),
  getInvoice: (...args: unknown[]) => mockGetInvoice(...args),
  markInvoiceReady: (...args: unknown[]) => mockMarkInvoiceReady(...args),
  simulateInvoiceIssue: (...args: unknown[]) => mockSimulateInvoiceIssue(...args),
  cancelInvoice: (...args: unknown[]) => mockCancelInvoice(...args),
  saveFiscalProfile: (...args: unknown[]) => mockSaveFiscalProfile(...args),
}))

function makeInvoice(overrides: Partial<ServiceInvoice> = {}): ServiceInvoice {
  return {
    id: 'inv-1',
    status: 'DRAFT',
    customerName: 'Ana Martins',
    ...overrides,
  } as ServiceInvoice
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetFiscalProfile.mockResolvedValue({ profile: null })
  mockGetFiscalSummary.mockResolvedValue({})
  mockListInvoices.mockResolvedValue({ data: [], total: 0 })
})

async function renderLoaded() {
  const hook = renderHook(() => useFiscalInvoicesPage())
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false))
  return hook
}

describe('useFiscalInvoicesPage — initial load', () => {
  it('loads profile, summary, and invoices on mount', async () => {
    mockListInvoices.mockResolvedValue({ data: [makeInvoice()], total: 1 })
    const { result } = await renderLoaded()
    expect(result.current.invoices).toHaveLength(1)
    expect(result.current.total).toBe(1)
    expect(result.current.loadError).toBeNull()
    expect(result.current.planBlocked).toBe(false)
  })

  it('sets planBlocked when the initial load fails with a 403 ApiError', async () => {
    mockGetFiscalProfile.mockRejectedValue(new ApiError('Forbidden', 403, null))
    const { result } = await renderLoaded()
    expect(result.current.planBlocked).toBe(true)
    expect(result.current.loadError).toBeNull()
  })

  it('sets loadError and shows an alert on a generic initial load failure', async () => {
    mockGetFiscalProfile.mockRejectedValue(new Error('network down'))
    const { result } = await renderLoaded()
    expect(result.current.loadError).toBe('network down')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro ao carregar notas fiscais', tone: 'error' }),
    )
  })

  it('falls back to a default message for a non-Error rejection', async () => {
    mockGetFiscalProfile.mockRejectedValue('boom')
    const { result } = await renderLoaded()
    expect(result.current.loadError).toBe('Não foi possível carregar as notas fiscais.')
  })

  it('computes totalPages from total and limit', async () => {
    mockListInvoices.mockResolvedValue({ data: [], total: 25 })
    const { result } = await renderLoaded()
    expect(result.current.totalPages).toBe(3)
  })

  it('totalPages is at least 1 even when there is no data', async () => {
    const { result } = await renderLoaded()
    expect(result.current.totalPages).toBe(1)
  })
})

describe('useFiscalInvoicesPage — filter changes', () => {
  it('re-fetches invoices when filters change after the initial load', async () => {
    const { result } = await renderLoaded()
    mockListInvoices.mockResolvedValue({ data: [makeInvoice()], total: 1 })

    act(() => result.current.setFilter('status', 'ISSUED' as never))
    await waitFor(() => expect(result.current.invoices).toHaveLength(1))
    expect(mockListInvoices).toHaveBeenCalledWith(expect.objectContaining({ status: 'ISSUED' }))
  })

  it('clears a filter field to undefined when given a falsy value, and resets page to 1', async () => {
    const { result } = await renderLoaded()
    act(() => result.current.setFilter('customer', 'ana'))
    await waitFor(() => expect(result.current.filters.customer).toBe('ana'))
    act(() => result.current.setFilter('customer', ''))
    await waitFor(() => expect(result.current.filters.customer).toBeUndefined())
    expect(result.current.filters.page).toBe(1)
  })

  it('shows an alert when a filter-triggered refetch fails', async () => {
    const { result } = await renderLoaded()
    mockListInvoices.mockRejectedValue(new Error('fail'))
    act(() => result.current.setFilter('status', 'ISSUED' as never))
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Erro ao carregar notas fiscais' }),
      ),
    )
  })
})

describe('useFiscalInvoicesPage — load()', () => {
  it('re-runs the full load and surfaces plan-blocked on a 403', async () => {
    const { result } = await renderLoaded()
    mockGetFiscalProfile.mockRejectedValueOnce(new ApiError('Forbidden', 403, null))
    act(() => result.current.load())
    await waitFor(() => expect(result.current.planBlocked).toBe(true))
  })
})

describe('useFiscalInvoicesPage — saveProfile', () => {
  it('saves the profile, shows a success alert, and reloads', async () => {
    const { result } = await renderLoaded()
    mockSaveFiscalProfile.mockResolvedValue(undefined)
    await act(() => result.current.saveProfile({} as never))
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Dados fiscais salvos.', tone: 'success' }),
    )
    expect(mockGetFiscalProfile).toHaveBeenCalledTimes(2)
  })

  it('shows an error alert and rethrows when saving the profile fails', async () => {
    const { result } = await renderLoaded()
    mockSaveFiscalProfile.mockRejectedValue(new Error('bad profile'))
    await expect(act(() => result.current.saveProfile({} as never))).rejects.toThrow('bad profile')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Não foi possível salvar os dados fiscais.' }),
    )
  })
})

describe('useFiscalInvoicesPage — saveInvoice', () => {
  it('creates a new invoice when none is passed', async () => {
    const { result } = await renderLoaded()
    mockCreateInvoice.mockResolvedValue(makeInvoice())
    await act(() => result.current.saveInvoice({} as never))
    expect(mockCreateInvoice).toHaveBeenCalled()
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nota salva como rascunho.' }),
    )
  })

  it('updates an existing invoice when one is passed', async () => {
    const { result } = await renderLoaded()
    mockUpdateInvoice.mockResolvedValue(makeInvoice())
    await act(() => result.current.saveInvoice({} as never, makeInvoice()))
    expect(mockUpdateInvoice).toHaveBeenCalledWith('inv-1', {})
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nota fiscal atualizada.' }),
    )
  })

  it('shows an error alert and rethrows when saving fails', async () => {
    const { result } = await renderLoaded()
    mockCreateInvoice.mockRejectedValue(new Error('fail'))
    await expect(act(() => result.current.saveInvoice({} as never))).rejects.toThrow('fail')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Não foi possível salvar a nota fiscal.' }),
    )
  })
})

describe('useFiscalInvoicesPage — markReady', () => {
  it('marks the invoice ready and reloads', async () => {
    const { result } = await renderLoaded()
    mockMarkInvoiceReady.mockResolvedValue(makeInvoice())
    await act(() => result.current.markReady(makeInvoice()))
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nota marcada como pronta para emissão.' }),
    )
  })

  it('shows an error alert and rethrows on failure', async () => {
    const { result } = await renderLoaded()
    mockMarkInvoiceReady.mockRejectedValue(new Error('fail'))
    await expect(act(() => result.current.markReady(makeInvoice()))).rejects.toThrow('fail')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Não foi possível marcar a nota como pronta.' }),
    )
  })
})

describe('useFiscalInvoicesPage — simulateIssue', () => {
  it('shows the simulation result message and reloads', async () => {
    const { result } = await renderLoaded()
    mockSimulateInvoiceIssue.mockResolvedValue({ invoice: makeInvoice(), message: 'Simulado.' })
    await act(() => result.current.simulateIssue(makeInvoice()))
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Simulação concluída', description: 'Simulado.' }),
    )
  })

  it('shows an error alert and rethrows on failure', async () => {
    const { result } = await renderLoaded()
    mockSimulateInvoiceIssue.mockRejectedValue(new Error('fail'))
    await expect(act(() => result.current.simulateIssue(makeInvoice()))).rejects.toThrow('fail')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Não foi possível simular a emissão.' }),
    )
  })
})

describe('useFiscalInvoicesPage — cancel', () => {
  it('cancels the invoice and reloads', async () => {
    const { result } = await renderLoaded()
    mockCancelInvoice.mockResolvedValue(makeInvoice({ status: 'CANCELED' }))
    await act(() => result.current.cancel(makeInvoice(), 'Duplicado'))
    expect(mockCancelInvoice).toHaveBeenCalledWith('inv-1', 'Duplicado')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nota cancelada no controle interno.' }),
    )
  })

  it('shows an error alert and rethrows on failure', async () => {
    const { result } = await renderLoaded()
    mockCancelInvoice.mockRejectedValue(new Error('fail'))
    await expect(act(() => result.current.cancel(makeInvoice(), 'x'))).rejects.toThrow('fail')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Não foi possível cancelar a nota fiscal.' }),
    )
  })
})

describe('useFiscalInvoicesPage — loadInvoiceDetails', () => {
  it('loads and sets the selected invoice detail', async () => {
    const { result } = await renderLoaded()
    mockGetInvoice.mockResolvedValue(makeInvoice({ id: 'inv-2' }))
    await act(() => result.current.loadInvoiceDetails(makeInvoice({ id: 'inv-2' })))
    expect(result.current.selectedInvoice?.id).toBe('inv-2')
  })

  it('shows an error alert and rethrows on failure', async () => {
    const { result } = await renderLoaded()
    mockGetInvoice.mockRejectedValue(new Error('fail'))
    await expect(act(() => result.current.loadInvoiceDetails(makeInvoice()))).rejects.toThrow(
      'fail',
    )
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Não foi possível carregar os detalhes da nota fiscal.' }),
    )
  })

  it('setSelectedInvoice can clear the selection directly', async () => {
    const { result } = await renderLoaded()
    mockGetInvoice.mockResolvedValue(makeInvoice())
    await act(() => result.current.loadInvoiceDetails(makeInvoice()))
    act(() => result.current.setSelectedInvoice(null))
    expect(result.current.selectedInvoice).toBeNull()
  })
})
