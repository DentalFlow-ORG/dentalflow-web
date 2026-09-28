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

it('never looks up the CEP of a saved profile on load, keeping the stored address', async () => {
  profile = makeClinicProfile({
    postalCode: '01001000',
    addressLine1: 'Rua Antiga, 45',
    city: 'Santos',
    state: 'SP',
  })
  await open()
  await tick()
  expect(fetchAddressByCep).not.toHaveBeenCalled()
  expect(screen.getByLabelText(/^Logradouro/)).toHaveValue('Rua Antiga, 45')
  expect(screen.getByLabelText(/^Cidade/)).toHaveValue('Santos')
})

it('keeps the typed street and house number when the user changes the CEP', async () => {
  profile = makeClinicProfile({ addressLine1: 'Rua das Flores, 120', city: 'Campinas' })
  await open()
  change(/^CEP/, '01001000')
  await tick()
  expect(fetchAddressByCep).toHaveBeenCalledExactlyOnceWith('01001-000')
  expect(screen.getByLabelText(/^Logradouro/)).toHaveValue('Rua das Flores, 120')
  expect(screen.getByLabelText(/^Cidade/)).toHaveValue('São Paulo')
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
    email: null,
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

it('sends null for emptied optional fields so the stored values are cleared', async () => {
  profile = makeClinicProfile({
    email: 'contato@clinica.com',
    phone: '11999991234',
    websiteUrl: 'https://clinica.test',
    addressLine1: 'Rua A, 1',
    addressLine2: 'Sala 2',
    city: 'Santos',
    state: 'SP',
    postalCode: '11010000',
  })
  await open()
  for (const label of [
    /^E-mail/,
    /^Telefone/,
    /^Site/,
    /^Logradouro/,
    /^Complemento/,
    /^Cidade/,
    /^UF/,
    /^CEP/,
  ]) {
    change(label, '')
  }
  await act(async () => fireEvent.click(screen.getByRole('button', { name: /Salvar alterações/i })))
  expect(save).toHaveBeenCalledExactlyOnceWith({
    name: 'Clínica Teste',
    email: null,
    phone: null,
    websiteUrl: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    state: null,
    postalCode: null,
  })
})

it('lowercases the clinic e-mail before saving', async () => {
  await open()
  change(/^E-mail/, ' Contato@Clinica.COM ')
  await act(async () => fireEvent.click(screen.getByRole('button', { name: /Salvar alterações/i })))
  expect(save.mock.calls[0][0].email).toBe('contato@clinica.com')
})

it.each(['javascript:alert(1)', 'ftp://clinica.test', 'https://'])(
  'rejects a website that is not a valid http(s) URL: %s',
  async (website) => {
    await open()
    change(/^Site/, website)
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: /Salvar alterações/i })),
    )
    expect(screen.getByLabelText(/^Site/)).toHaveAccessibleDescription(
      'Informe uma URL válida, começando com http:// ou https://.',
    )
    expect(save).not.toHaveBeenCalled()
  },
)

it('accepts an http website, as the API does', async () => {
  await open()
  change(/^Site/, 'http://clinica.test')
  await act(async () => fireEvent.click(screen.getByRole('button', { name: /Salvar alterações/i })))
  expect(save.mock.calls[0][0].websiteUrl).toBe('http://clinica.test')
})

it('mirrors the API length limits and mobile keyboards on the inputs', async () => {
  await open()
  expect(screen.getByLabelText(/^Nome da clínica/)).toHaveAttribute('maxLength', '100')
  expect(screen.getByLabelText(/^Site/)).toHaveAttribute('maxLength', '200')
  expect(screen.getByLabelText(/^Logradouro/)).toHaveAttribute('maxLength', '200')
  expect(screen.getByLabelText(/^Cidade/)).toHaveAttribute('maxLength', '100')
  expect(screen.getByLabelText(/^Telefone/)).toHaveAttribute('type', 'tel')
  expect(screen.getByLabelText(/^CEP/)).toHaveAttribute('inputMode', 'numeric')
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

it('ignores a CEP lookup that fails after the postal code changed again', async () => {
  let rejectFirst!: (reason: Error) => void
  vi.mocked(fetchAddressByCep)
    .mockReturnValueOnce(
      new Promise((_, reject) => {
        rejectFirst = reject
      }),
    )
    .mockResolvedValueOnce(address)
  await open()
  change(/^CEP/, '01001000')
  await tick()
  expect(fetchAddressByCep).toHaveBeenCalledExactlyOnceWith('01001-000')

  // The user corrects the CEP while the first lookup is still in flight.
  change(/^CEP/, '01310930')
  await act(async () => {
    rejectFirst(new CepNotFoundError())
    await Promise.resolve()
  })
  expect(screen.queryByText('CEP não encontrado.')).not.toBeInTheDocument()

  await tick()
  expect(screen.getByLabelText(/^Cidade/)).toHaveValue('São Paulo')
  expect(screen.queryByText('CEP não encontrado.')).not.toBeInTheDocument()
})
