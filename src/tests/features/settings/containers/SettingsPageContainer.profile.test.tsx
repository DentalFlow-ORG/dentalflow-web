import { SettingsPageContainer } from '@/features/settings/containers/SettingsPageContainer'
import { CepNotFoundError, fetchAddressByCep } from '@/services/cep/cep.service'
import type { AddressByCep } from '@/services/cep/cep.service'
import { makeClinicProfile } from '@/test-utils/factories/settings.factory'
import { act, fireEvent, renderWithProviders, screen } from '@/test-utils/render-utils'

let profile = makeClinicProfile()
const save = vi.fn()
const showAlert = vi.fn()
vi.mock('@tanstack/react-router', async () =>
  (await import('@/test-utils/mocks/router')).createRouterMock(),
)
vi.mock('@/features/settings/hooks/useClinicProfile', () => ({
  useClinicProfile: () => ({
    profile,
    isLoading: false,
    error: null,
    isSaving: false,
    saveError: null,
    save,
  }),
}))
vi.mock('@/features/billing/services/billing.service', () => ({
  getCurrentBillingStatus: vi
    .fn()
    .mockResolvedValue({ status: 'active', planName: 'Professional', billingInterval: 'monthly' }),
}))
vi.mock('@/features/scheduling/services/calendar-integrations.service', () => ({
  getGoogleCalendarStatus: vi.fn().mockResolvedValue({ connected: false }),
  createGoogleCalendarConnectUrl: vi.fn(),
  syncGoogleCalendar: vi.fn(),
  disconnectGoogleCalendar: vi.fn(),
}))
vi.mock('@/services/cep/cep.service', async (original) => ({
  ...(await original<typeof import('@/services/cep/cep.service')>()),
  fetchAddressByCep: vi.fn(),
}))
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert }),
}))

const address: AddressByCep = {
  cep: '01001000',
  street: 'Praça da Sé',
  city: 'São Paulo',
  uf: 'SP',
  neighborhood: 'Sé',
}
function change(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}
async function open() {
  await act(async () => {
    renderWithProviders(<SettingsPageContainer />)
  })
}
async function tick(ms = 400) {
  await act(async () => vi.advanceTimersByTimeAsync(ms))
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  profile = makeClinicProfile()
  save.mockResolvedValue(true)
  vi.mocked(fetchAddressByCep).mockResolvedValue(address)
})
afterEach(() => vi.useRealTimers())

it('debounces a valid CEP, populates the returned address, and cancels obsolete queued lookups', async () => {
  await open()
  change(/^CEP/, '01001000')
  await tick(399)
  expect(fetchAddressByCep).not.toHaveBeenCalled()
  change(/^CEP/, '01310930')
  await tick()
  expect(fetchAddressByCep).toHaveBeenCalledExactlyOnceWith('01310-930')
  expect(screen.getByLabelText(/^Logradouro/)).toHaveValue('Praça da Sé')
  expect(screen.getByLabelText(/^Cidade/)).toHaveValue('São Paulo')
  expect(screen.getByLabelText(/^UF/)).toHaveValue('SP')
})

it('preserves manually entered address values when a valid lookup omits them', async () => {
  vi.mocked(fetchAddressByCep).mockResolvedValue({ ...address, street: '', city: '', uf: '' })
  await open()
  change(/^Logradouro/, 'Rua existente')
  change(/^Cidade/, 'Campinas')
  change(/^UF/, 'sp')
  change(/^CEP/, '01001000')
  await tick()
  expect(screen.getByLabelText(/^Logradouro/)).toHaveValue('Rua existente')
  expect(screen.getByLabelText(/^Cidade/)).toHaveValue('Campinas')
  expect(screen.getByLabelText(/^UF/)).toHaveValue('SP')
})

it.each([
  { error: new CepNotFoundError(), message: 'CEP não encontrado.' },
  { error: new Error('offline'), message: 'Não foi possível consultar o CEP.' },
])(
  'shows lookup failure and clears it after a corrected CEP: $message',
  async ({ error, message }) => {
    vi.mocked(fetchAddressByCep).mockRejectedValueOnce(error)
    await open()
    change(/^CEP/, '01001000')
    await tick()
    expect(screen.getByText(message)).toBeInTheDocument()
    change(/^CEP/, '01310930')
    await tick()
    expect(screen.queryByText(message)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/^Cidade/)).toHaveValue('São Paulo')
  },
)

it('formats loaded values and submits trimmed optional profile fields without changing protected fields', async () => {
  profile = makeClinicProfile({ phone: '11999991234', postalCode: '01001000', email: null })
  await open()
  expect(screen.getByLabelText(/^Telefone/)).toHaveValue('(11) 99999-1234')
  expect(screen.getByLabelText(/^CEP/)).toHaveValue('01001-000')
  change(/^Telefone/, '21999994321')
  change(/^Site/, 'https://clinica.test')
  change(/^Logradouro/, ' Rua própria ')
  change(/^Complemento/, ' Sala 2 ')
  change(/^Cidade/, ' Niterói ')
  change(/^UF/, 'rj')
  await act(async () => fireEvent.click(screen.getByRole('button', { name: /Salvar alterações/i })))
  expect(save).toHaveBeenCalledExactlyOnceWith({
    name: 'Clínica Teste',
    phone: '21999994321',
    websiteUrl: 'https://clinica.test',
    addressLine1: 'Rua própria',
    addressLine2: 'Sala 2',
    city: 'Niterói',
    state: 'RJ',
    postalCode: '01001000',
  })
  expect(showAlert).toHaveBeenCalledWith({
    title: 'Perfil atualizado com sucesso.',
    tone: 'success',
  })
})

it('rejects an invalid phone and clears the accessible error when corrected', async () => {
  await open()
  change(/^Telefone/, '123')
  await act(async () => fireEvent.click(screen.getByRole('button', { name: /Salvar alterações/i })))
  expect(screen.getByLabelText(/^Telefone/)).toHaveAttribute('aria-invalid', 'true')
  expect(screen.getByText('Informe um telefone válido com DDD.')).toBeInTheDocument()
  expect(save).not.toHaveBeenCalled()
  change(/^Telefone/, '11999991234')
  expect(screen.queryByText('Informe um telefone válido com DDD.')).not.toBeInTheDocument()
})

it('does not let an older CEP response overwrite the address for a newer CEP', async () => {
  let resolveOld!: (value: AddressByCep) => void
  vi.mocked(fetchAddressByCep).mockReturnValueOnce(
    new Promise((resolve) => {
      resolveOld = resolve
    }),
  )
  await open()
  change(/^CEP/, '01001000')
  await tick()
  change(/^CEP/, '01310930')
  vi.mocked(fetchAddressByCep).mockResolvedValueOnce({ ...address, street: 'Avenida Paulista' })
  await tick()
  await act(async () => resolveOld(address))
  expect(screen.getByLabelText(/^Logradouro/)).toHaveValue('Avenida Paulista')
})
