import { render, screen, waitFor } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

const mockGetFiscalProfile = vi.fn()
const mockSaveFiscalProfile = vi.fn()
vi.mock('@/features/fiscal/services/fiscal.service', () => ({
  getFiscalProfile: (...args: unknown[]) => mockGetFiscalProfile(...args),
  saveFiscalProfile: (...args: unknown[]) => mockSaveFiscalProfile(...args),
}))

vi.mock('@/features/fiscal/components/FiscalProfileForm', () => ({
  FiscalProfileForm: ({
    form,
    onSubmit,
    onCancel,
    isSaving,
  }: {
    form: { legalName: string; documentNumber: string; addressZipCode: string }
    onSubmit: () => void
    onCancel: () => void
    isSaving: boolean
  }) => (
    <div>
      <span data-testid="legal-name">{form.legalName}</span>
      <span data-testid="document-number">{form.documentNumber}</span>
      <span data-testid="zip-code">{form.addressZipCode}</span>
      <button type="button" onClick={onSubmit} disabled={isSaving}>
        Salvar
      </button>
      <button type="button" onClick={onCancel}>
        Cancelar
      </button>
    </div>
  ),
}))

import { FiscalProfilePageContainer } from '@/features/fiscal/containers/FiscalProfilePageContainer'
import type { ClinicFiscalProfile } from '@/features/fiscal/types/fiscal.types'
import { mockNavigate, resetRouterMocks } from '@/test-utils/mocks/router'

function makeProfile(overrides: Partial<ClinicFiscalProfile> = {}): ClinicFiscalProfile {
  return {
    id: 'p1',
    clinicId: 'c1',
    legalName: 'Clínica X',
    tradeName: null,
    documentType: 'CNPJ',
    documentNumber: '11222333000181',
    municipalRegistration: null,
    stateRegistration: null,
    taxRegime: 'SIMPLES_NACIONAL',
    specialTaxRegime: null,
    serviceCode: null,
    cnae: null,
    issRate: null,
    addressStreet: 'Rua A',
    addressNumber: '100',
    addressComplement: null,
    addressNeighborhood: 'Centro',
    addressCity: 'São Paulo',
    addressState: 'SP',
    addressZipCode: '01310100',
    cityIbgeCode: null,
    fiscalProvider: 'LOCAL',
    fiscalProviderMode: 'LOCAL',
    isConfigured: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  resetRouterMocks()
})

describe('FiscalProfilePageContainer', () => {
  it('preserves an incomplete saved profile without inventing a document or postal code', async () => {
    mockGetFiscalProfile.mockResolvedValue({
      profile: makeProfile({ documentNumber: '', addressZipCode: '' }),
    })
    render(<FiscalProfilePageContainer />)
    expect(await screen.findByTestId('legal-name')).toHaveTextContent('Clínica X')
    expect(screen.getByTestId('document-number')).toBeEmptyDOMElement()
    expect(screen.getByTestId('zip-code')).toBeEmptyDOMElement()
  })
  it('shows a loading indicator while fetching the profile', () => {
    mockGetFiscalProfile.mockReturnValue(new Promise(() => {}))
    render(<FiscalProfilePageContainer />)
    expect(screen.getByText(/carregando perfil fiscal/i)).toBeInTheDocument()
  })

  it('renders the empty form when there is no saved profile', async () => {
    mockGetFiscalProfile.mockResolvedValue({
      profile: null,
      providerMode: 'LOCAL',
      realIssuingEnabled: false,
      message: '',
    })
    render(<FiscalProfilePageContainer />)
    expect(await screen.findByTestId('legal-name')).toHaveTextContent('')
  })

  it('seeds the form with the formatted saved profile', async () => {
    mockGetFiscalProfile.mockResolvedValue({
      profile: makeProfile(),
      providerMode: 'LOCAL',
      realIssuingEnabled: false,
      message: '',
    })
    render(<FiscalProfilePageContainer />)
    expect(await screen.findByTestId('legal-name')).toHaveTextContent('Clínica X')
    expect(screen.getByTestId('document-number')).toHaveTextContent('11.222.333/0001-81')
    expect(screen.getByTestId('zip-code')).toHaveTextContent('01310-100')
  })

  it('shows a load error when the fetch fails', async () => {
    mockGetFiscalProfile.mockRejectedValue(new Error('network down'))
    render(<FiscalProfilePageContainer />)
    expect(
      await screen.findByText('Não foi possível carregar o perfil fiscal.'),
    ).toBeInTheDocument()
  })

  it('saves the form and shows a success message', async () => {
    mockGetFiscalProfile.mockResolvedValue({
      profile: null,
      providerMode: 'LOCAL',
      realIssuingEnabled: false,
      message: '',
    })
    mockSaveFiscalProfile.mockResolvedValue(undefined)
    render(<FiscalProfilePageContainer />)
    await screen.findByTestId('legal-name')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('Perfil fiscal atualizado com sucesso.')).toBeInTheDocument()
  })

  it('never sends the server-controlled provider routing back in the save payload', async () => {
    mockGetFiscalProfile.mockResolvedValue({
      profile: makeProfile({ fiscalProvider: 'FOCUS_NFE', fiscalProviderMode: 'SANDBOX' }),
    })
    mockSaveFiscalProfile.mockResolvedValue(undefined)
    render(<FiscalProfilePageContainer />)
    await screen.findByText('Clínica X')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(mockSaveFiscalProfile).toHaveBeenCalledOnce())
    const payload = mockSaveFiscalProfile.mock.calls[0][0] as Record<string, unknown>
    expect(payload).toMatchObject({ legalName: 'Clínica X' })
    expect(payload).not.toHaveProperty('fiscalProvider')
    expect(payload).not.toHaveProperty('fiscalProviderMode')
  })

  it('shows a save error when saving fails', async () => {
    mockGetFiscalProfile.mockResolvedValue({
      profile: null,
      providerMode: 'LOCAL',
      realIssuingEnabled: false,
      message: '',
    })
    mockSaveFiscalProfile.mockRejectedValue(new Error('CNPJ inválido.'))
    render(<FiscalProfilePageContainer />)
    await screen.findByTestId('legal-name')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    // The backend's specific reason is shown instead of a generic message.
    expect(await screen.findByText('CNPJ inválido.')).toBeInTheDocument()
  })

  it('falls back to a generic save error when the failure has no message', async () => {
    mockGetFiscalProfile.mockResolvedValue({
      profile: null,
      providerMode: 'LOCAL',
      realIssuingEnabled: false,
      message: '',
    })
    mockSaveFiscalProfile.mockRejectedValue('network down')
    render(<FiscalProfilePageContainer />)
    await screen.findByTestId('legal-name')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(
      await screen.findByText('Não foi possível salvar o perfil fiscal. Tente novamente.'),
    ).toBeInTheDocument()
  })

  it('navigates back to settings when cancelled', async () => {
    mockGetFiscalProfile.mockResolvedValue({
      profile: null,
      providerMode: 'LOCAL',
      realIssuingEnabled: false,
      message: '',
    })
    render(<FiscalProfilePageContainer />)
    await screen.findByTestId('legal-name')
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/app/configuracoes' })
  })
})
