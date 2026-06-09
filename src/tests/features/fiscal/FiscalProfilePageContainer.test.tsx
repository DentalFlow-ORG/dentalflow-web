import { render, screen, userEvent, waitFor } from '@/test-utils/render-utils'

import { FiscalProfilePageContainer } from '@/features/fiscal/containers/FiscalProfilePageContainer'
import type { FiscalProfileResponse } from '@/features/fiscal/types/fiscal.types'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

const mockGetFiscalProfile = vi.fn()
const mockSaveFiscalProfile = vi.fn()

vi.mock('@/features/fiscal/services/fiscal.service', () => ({
  getFiscalProfile: () => mockGetFiscalProfile(),
  saveFiscalProfile: (...args: unknown[]) => mockSaveFiscalProfile(...args),
}))

const mockShowAlert = vi.fn()

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert, dismissAlert: vi.fn() }),
}))

// ── Factories ─────────────────────────────────────────────────────────────────

function makeProfileResponse(): FiscalProfileResponse {
  return {
    profile: {
      id: '1',
      clinicId: 'c1',
      legalName: 'Clínica Exemplo',
      tradeName: null,
      documentType: 'CNPJ',
      documentNumber: '12345678000190',
      municipalRegistration: null,
      stateRegistration: null,
      taxRegime: 'SIMPLES_NACIONAL',
      specialTaxRegime: null,
      serviceCode: null,
      cnae: null,
      issRate: null,
      addressStreet: 'Rua Teste',
      addressNumber: '123',
      addressComplement: null,
      addressNeighborhood: 'Centro',
      addressCity: 'São Paulo',
      addressState: 'SP',
      addressZipCode: '01310100',
      cityIbgeCode: null,
      fiscalProvider: 'LOCAL',
      fiscalProviderMode: 'LOCAL',
      isConfigured: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    providerMode: 'LOCAL',
    realIssuingEnabled: false,
    message: '',
  }
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  mockGetFiscalProfile.mockResolvedValue(makeProfileResponse())
  mockSaveFiscalProfile.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.clearAllMocks()
})

// ── Loading state ─────────────────────────────────────────────────────────────

describe('FiscalProfilePageContainer — loading state', () => {
  it('loading state has role="status"', () => {
    mockGetFiscalProfile.mockReturnValue(new Promise(() => {}))
    render(<FiscalProfilePageContainer />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

// ── Load error ────────────────────────────────────────────────────────────────

describe('FiscalProfilePageContainer — load error', () => {
  it('renders visible inline feedback when profile fails to load', async () => {
    mockGetFiscalProfile.mockRejectedValue(new Error('Network error'))
    render(<FiscalProfilePageContainer />)
    await waitFor(() => {
      expect(screen.getByText(/não foi possível carregar o perfil fiscal/i)).toBeInTheDocument()
    })
  })
})

// ── Save success ──────────────────────────────────────────────────────────────

describe('FiscalProfilePageContainer — save success', () => {
  it('fires global alert toast on successful save', async () => {
    const user = userEvent.setup()
    render(<FiscalProfilePageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /salvar dados fiscais/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /salvar dados fiscais/i }))
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' }))
  })

  it('does not render inline success feedback after save', async () => {
    const user = userEvent.setup()
    render(<FiscalProfilePageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /salvar dados fiscais/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /salvar dados fiscais/i }))
    expect(screen.queryByText(/atualizado com sucesso/i)).not.toBeInTheDocument()
  })
})

// ── Save error ────────────────────────────────────────────────────────────────

describe('FiscalProfilePageContainer — save error', () => {
  it('renders save error as inline feedback', async () => {
    mockSaveFiscalProfile.mockRejectedValue(new Error('Save failed'))
    const user = userEvent.setup()
    render(<FiscalProfilePageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /salvar dados fiscais/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /salvar dados fiscais/i }))
    await waitFor(() => {
      expect(screen.getByText(/não foi possível salvar/i)).toBeInTheDocument()
    })
  })

  it('does not call showAlert when save fails', async () => {
    mockSaveFiscalProfile.mockRejectedValue(new Error('Save failed'))
    const user = userEvent.setup()
    render(<FiscalProfilePageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /salvar dados fiscais/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /salvar dados fiscais/i }))
    await waitFor(() => {
      expect(screen.getByText(/não foi possível salvar/i)).toBeInTheDocument()
    })
    expect(mockShowAlert).not.toHaveBeenCalled()
  })
})
