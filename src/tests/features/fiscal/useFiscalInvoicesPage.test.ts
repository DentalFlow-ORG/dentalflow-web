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
  it.each([
    { mode: 'initial', fails: false },
    { mode: 'initial', fails: true },
    { mode: 'reload', fails: false },
    { mode: 'reload', fails: true },
    { mode: 'filter', fails: false },
    { mode: 'filter', fails: true },
  ])(
    'keeps the latest reload pending after obsolete $mode completion (fails=$fails)',
    async ({ mode, fails }) => {
      let resolveOld!: (value: unknown) => void
      let rejectOld!: (error: Error) => void
      const oldRequest = new Promise((resolve, reject) => {
        resolveOld = resolve
        rejectOld = reject
      })
      if (mode === 'initial') mockListInvoices.mockReturnValueOnce(oldRequest)
      const { result } = renderHook(() => useFiscalInvoicesPage())
      if (mode !== 'initial') {
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        mockListInvoices.mockReturnValueOnce(oldRequest)
        act(() => {
          if (mode === 'reload') result.current.load()
          else result.current.setFilter('customer', 'Ana')
        })
      }
      let resolveCurrent!: (value: unknown) => void
      mockListInvoices.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveCurrent = resolve
        }),
      )
      act(() => result.current.load())
      await act(async () => {
        if (fails) rejectOld(new Error('Requisição superada'))
        else resolveOld({ data: [makeInvoice({ id: 'obsolete' })], total: 15 })
      })
      expect(result.current.isLoading).toBe(true)
      expect(result.current.invoices).toEqual([])
      expect(result.current.loadError).toBeNull()
      expect(mockShowAlert).not.toHaveBeenCalled()
      const current = makeInvoice({ id: 'current' })
      await act(async () => {
        resolveCurrent({ data: [current], total: 1 })
      })
      expect(result.current.invoices).toEqual([current])
      expect(result.current.isLoading).toBe(false)
    },
  )

  it.each(['success', 'failure'] as const)(
    'ignores a reload %s after leaving the page',
    async (outcome) => {
      const { result, unmount } = await renderLoaded()
      let resolve!: (value: unknown) => void
      let reject!: (error: Error) => void
      mockListInvoices.mockReturnValueOnce(
        new Promise((yes, no) => {
          resolve = yes
          reject = no
        }),
      )
      act(() => result.current.load())
      unmount()
      await act(async () => {
        if (outcome === 'success') resolve({ data: [makeInvoice()], total: 1 })
        else reject(new Error('late reload'))
      })
      expect(mockShowAlert).not.toHaveBeenCalled()
    },
  )

  it('reloads using the latest filters when an earlier invoice mutation finishes', async () => {
    const { result } = await renderLoaded()
    let resolve!: () => void
    mockCreateInvoice.mockReturnValueOnce(
      new Promise<void>((yes) => {
        resolve = yes
      }),
    )
    let saving!: Promise<void>
    act(() => {
      saving = result.current.saveInvoice({
        customerName: 'Ana',
        amountCents: 10000,
        serviceDescription: 'Consulta',
        competenceDate: '2026-09-11',
      })
    })
    act(() => result.current.setFilter('customer', 'Beatriz'))
    await act(async () => {
      resolve()
      await saving
    })
    expect(mockListInvoices).toHaveBeenLastCalledWith(
      expect.objectContaining({ customer: 'Beatriz' }),
    )
  })
  it.each(['initial', 'reload'] as const)(
    'does not let an older %s load replace a newer filtered list',
    async (mode) => {
      let resolve!: (value: unknown) => void
      const pending = new Promise((yes) => {
        resolve = yes
      })
      if (mode === 'initial') mockListInvoices.mockReturnValueOnce(pending)
      const { result } = renderHook(() => useFiscalInvoicesPage())
      if (mode === 'reload') {
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        mockListInvoices.mockReturnValueOnce(pending)
        act(() => result.current.load())
      }
      const current = makeInvoice({ id: 'filtered', customerName: 'Beatriz' })
      mockListInvoices.mockResolvedValueOnce({ data: [current], total: 1 })
      act(() => result.current.setFilter('customer', 'Beatriz'))
      await waitFor(() => expect(result.current.invoices).toEqual([current]))
      await act(async () => {
        resolve({ data: [makeInvoice()], total: 25 })
      })
      expect(result.current.invoices).toEqual([current])
      expect(result.current.total).toBe(1)
      expect(result.current.isLoading).toBe(false)
    },
  )
  it.each(['success', 'failure'] as const)(
    'ignores an obsolete filter %s after a newer search finishes',
    async (outcome) => {
      const { result } = await renderLoaded()
      let resolve!: (value: unknown) => void
      let reject!: (error: Error) => void
      mockListInvoices.mockReturnValueOnce(
        new Promise((yes, no) => {
          resolve = yes
          reject = no
        }),
      )
      act(() => result.current.setFilter('customer', 'Ana'))
      const currentInvoice = makeInvoice({ id: 'current', customerName: 'Beatriz' })
      mockListInvoices.mockResolvedValueOnce({ data: [currentInvoice], total: 1 })
      act(() => result.current.setFilter('customer', 'Beatriz'))
      await waitFor(() => expect(result.current.invoices).toEqual([currentInvoice]))
      await act(async () => {
        if (outcome === 'success') resolve({ data: [makeInvoice()], total: 25 })
        else reject(new Error('Falha da pesquisa antiga'))
      })
      expect(result.current.invoices).toEqual([currentInvoice])
      expect(result.current.total).toBe(1)
      expect(mockShowAlert).not.toHaveBeenCalled()
    },
  )
  it.each(['success', 'failure'] as const)(
    'ignores a late initial %s after leaving the page',
    async (outcome) => {
      let resolve!: (value: unknown) => void
      let reject!: (error: Error) => void
      mockListInvoices.mockReturnValueOnce(
        new Promise((yes, no) => {
          resolve = yes
          reject = no
        }),
      )
      const { result, unmount } = renderHook(() => useFiscalInvoicesPage())
      unmount()
      await act(async () => {
        if (outcome === 'success') resolve({ data: [makeInvoice()], total: 1 })
        else reject(new Error('late failure'))
      })
      expect(mockShowAlert).not.toHaveBeenCalled()
      expect(result.current.invoices).toEqual([])
      expect(result.current.loadError).toBeNull()
    },
  )
  it.each([new Error('Serviço indisponível'), null])(
    'reports a reload failure and supports retry: %s',
    async (error) => {
      const { result } = await renderLoaded()
      mockGetFiscalProfile.mockRejectedValueOnce(error)
      act(() => result.current.load())
      await waitFor(() =>
        expect(result.current.loadError).toBe(
          error?.message ?? 'Não foi possível carregar as notas fiscais.',
        ),
      )
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ tone: 'error', description: result.current.loadError }),
      )
      expect(result.current.isLoading).toBe(false)
      act(() => result.current.load())
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.loadError).toBeNull()
    },
  )
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
  const formPayload = {
    customerName: '  Ana Souza  ',
    customerDocument: '',
    customerEmail: '',
    customerPhone: '(11) 98765-4321',
    serviceDescription: ' Consulta ',
    serviceCode: '',
    amountCents: 15000,
    competenceDate: '2026-06-07',
    notes: '',
  }

  it('creates a new invoice without sending empty optional fields', async () => {
    const { result } = await renderLoaded()
    mockCreateInvoice.mockResolvedValue(makeInvoice())
    await act(() => result.current.saveInvoice(formPayload))
    // Regression: an empty e-mail string used to reach the API and fail IsEmail.
    expect(mockCreateInvoice).toHaveBeenCalledWith({
      customerName: 'Ana Souza',
      customerDocument: undefined,
      customerEmail: undefined,
      customerPhone: '11987654321',
      serviceDescription: 'Consulta',
      serviceCode: undefined,
      amountCents: 15000,
      competenceDate: '2026-06-07',
      notes: undefined,
    })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nota salva como rascunho.' }),
    )
  })

  it('updates an existing invoice and clears emptied optional fields with null', async () => {
    const { result } = await renderLoaded()
    mockUpdateInvoice.mockResolvedValue(makeInvoice())
    await act(() =>
      result.current.saveInvoice(
        { ...formPayload, customerDocument: '123.456.789-09', customerEmail: 'Ana@Ex.com ' },
        makeInvoice(),
      ),
    )
    expect(mockUpdateInvoice).toHaveBeenCalledWith(
      'inv-1',
      expect.objectContaining({
        customerDocument: '12345678909',
        customerEmail: 'Ana@Ex.com',
        serviceCode: null,
        notes: null,
      }),
    )
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nota fiscal atualizada.' }),
    )
  })

  it('shows an error alert and rethrows when saving fails', async () => {
    const { result } = await renderLoaded()
    mockCreateInvoice.mockRejectedValue(new Error('fail'))
    await expect(act(() => result.current.saveInvoice(formPayload))).rejects.toThrow('fail')
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
