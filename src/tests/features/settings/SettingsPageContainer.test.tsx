import { render, screen, waitFor, within, userEvent } from '@/test-utils/render-utils'

import { SettingsPageContainer } from '@/features/settings/containers/SettingsPageContainer'
import { makeOwnerUser } from '@/test-utils/factories/user.factory'
import { setMockAuthState, resetAuthMocks } from '@/test-utils/mocks/auth'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/auth/hooks/useAuth', async () => {
  const authMock = await import('@/test-utils/mocks/auth')
  return authMock.createUseAuthMock()
})

const mockGetClinicProfile = vi.fn()
const mockUpdateClinicProfile = vi.fn()

vi.mock('@/features/settings/services/settings.service', () => ({
  getClinicProfile: () => mockGetClinicProfile(),
  updateClinicProfile: (...args: unknown[]) => mockUpdateClinicProfile(...args),
}))

const mockGetGoogleCalendarStatus = vi.fn()
const mockCreateGoogleCalendarConnectUrl = vi.fn()
const mockSyncGoogleCalendar = vi.fn()
const mockDisconnectGoogleCalendar = vi.fn()

vi.mock('@/features/scheduling/services/calendar-integrations.service', () => ({
  getGoogleCalendarStatus: () => mockGetGoogleCalendarStatus(),
  createGoogleCalendarConnectUrl: () => mockCreateGoogleCalendarConnectUrl(),
  syncGoogleCalendar: () => mockSyncGoogleCalendar(),
  disconnectGoogleCalendar: () => mockDisconnectGoogleCalendar(),
}))

const mockGetCurrentBillingStatus = vi.fn()

vi.mock('@/features/billing/services/billing.service', () => ({
  getCurrentBillingStatus: () => mockGetCurrentBillingStatus(),
}))

const mockShowAlert = vi.fn()

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert, dismissAlert: vi.fn() }),
}))

// ── Factories ─────────────────────────────────────────────────────────────────

function makeClinicProfile() {
  return {
    id: 'clinic-1',
    name: 'Clínica Teste',
    email: 'clinica@teste.com',
    phone: null,
    logoUrl: null,
    websiteUrl: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    state: null,
    country: 'BR',
    postalCode: null,
    timezone: 'America/Sao_Paulo',
    createdAt: '2026-01-01T00:00:00.000Z',
  }
}

function makeActiveBillingStatus() {
  return {
    status: 'active' as const,
    planName: 'Professional',
    billingInterval: 'monthly' as const,
    currentPeriodEnd: null,
    trialEndsAt: null,
  }
}

function makeConnectedCalendarStatus() {
  return {
    connected: true,
    calendarSummary: 'clinica@gmail.com',
    connectedAt: '2026-01-15T10:00:00.000Z',
  }
}

function makeDisconnectedCalendarStatus() {
  return { connected: false, calendarSummary: null, connectedAt: null }
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
  mockGetClinicProfile.mockResolvedValue(makeClinicProfile())
  mockGetGoogleCalendarStatus.mockResolvedValue(makeDisconnectedCalendarStatus())
  mockGetCurrentBillingStatus.mockResolvedValue(makeActiveBillingStatus())
  mockDisconnectGoogleCalendar.mockResolvedValue(makeDisconnectedCalendarStatus())
})

afterEach(() => {
  resetAuthMocks()
  vi.clearAllMocks()
})

// ── Header ────────────────────────────────────────────────────────────────────

describe('SettingsPageContainer — header', () => {
  it('renders "Administração" eyebrow', () => {
    render(<SettingsPageContainer />)
    expect(screen.getByText('Administração')).toBeInTheDocument()
  })

  it('renders "Configurações" h1 heading', () => {
    render(<SettingsPageContainer />)
    expect(screen.getByRole('heading', { name: 'Configurações', level: 1 })).toBeInTheDocument()
  })

  it('renders page description', () => {
    render(<SettingsPageContainer />)
    expect(screen.getByText(/gerencie dados da clínica/i)).toBeInTheDocument()
  })
})

// ── Section headings ──────────────────────────────────────────────────────────

describe('SettingsPageContainer — OWNER section headings', () => {
  const SECTIONS = [
    'Perfil da Clínica',
    'Perfil Fiscal',
    'Comunicação',
    'Integração de Calendário',
    'Equipe e Permissões',
    'Assinatura',
    'IA e Limites',
    'Segurança e Conformidade',
  ]

  for (const title of SECTIONS) {
    it(`renders "${title}" as an h2 heading`, () => {
      render(<SettingsPageContainer />)
      expect(screen.getByRole('heading', { name: title, level: 2 })).toBeInTheDocument()
    })
  }
})

// ── Loading states ────────────────────────────────────────────────────────────

describe('SettingsPageContainer — loading states', () => {
  it('clinic profile loading state has role="status"', () => {
    mockGetClinicProfile.mockImplementation(() => new Promise(() => {}))
    render(<SettingsPageContainer />)
    const statusEls = screen.getAllByRole('status')
    const profileStatus = statusEls.find((el) => el.textContent?.includes('Carregando...'))
    expect(profileStatus).toBeInTheDocument()
  })

  it('calendar loading state has role="status"', () => {
    mockGetGoogleCalendarStatus.mockImplementation(() => new Promise(() => {}))
    render(<SettingsPageContainer />)
    const statusEls = screen.getAllByRole('status')
    const calendarStatus = statusEls.find((el) =>
      el.textContent?.includes('Verificando integração'),
    )
    expect(calendarStatus).toBeInTheDocument()
  })

  it('billing loading state has role="status"', () => {
    mockGetCurrentBillingStatus.mockImplementation(() => new Promise(() => {}))
    render(<SettingsPageContainer />)
    const statusEls = screen.getAllByRole('status')
    const billingStatus = statusEls.find((el) => el.textContent?.includes('Carregando plano'))
    expect(billingStatus).toBeInTheDocument()
  })
})

// ── Error states ──────────────────────────────────────────────────────────────

describe('SettingsPageContainer — error states', () => {
  it('calendar load error renders visible error feedback', async () => {
    mockGetGoogleCalendarStatus.mockRejectedValue(new Error('network error'))
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(
        screen.getByText(/não foi possível verificar a integração/i),
      ).toBeInTheDocument()
    })
  })

  it('billing load error renders visible error feedback', async () => {
    mockGetCurrentBillingStatus.mockRejectedValue(new Error('network error'))
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(
        screen.getByText(/não foi possível carregar as informações do plano/i),
      ).toBeInTheDocument()
    })
  })
})

// ── Connected Google Calendar ─────────────────────────────────────────────────

describe('SettingsPageContainer — connected Google Calendar', () => {
  it('renders calendar summary when connected', async () => {
    mockGetGoogleCalendarStatus.mockResolvedValue(makeConnectedCalendarStatus())
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(screen.getByText('clinica@gmail.com')).toBeInTheDocument()
    })
  })
})

// ── Disconnect confirmation dialog ────────────────────────────────────────────

describe('SettingsPageContainer — disconnect confirmation', () => {
  beforeEach(() => {
    mockGetGoogleCalendarStatus.mockResolvedValue(makeConnectedCalendarStatus())
  })

  it('clicking Desconectar opens dialog and does not call API', async () => {
    const user = userEvent.setup()
    render(<SettingsPageContainer />)

    await waitFor(() => {
      expect(screen.getByText('clinica@gmail.com')).toBeInTheDocument()
    })

    // The page-level Desconectar button (not the dialog confirm button)
    const disconnectBtn = screen.getByRole('button', { name: /desconectar/i })
    await user.click(disconnectBtn)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Desconectar Google Calendar?')).toBeInTheDocument()
    expect(mockDisconnectGoogleCalendar).not.toHaveBeenCalled()
  })

  it('canceling the dialog does not call disconnect', async () => {
    const user = userEvent.setup()
    render(<SettingsPageContainer />)

    await waitFor(() => {
      expect(screen.getByText('clinica@gmail.com')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /desconectar/i }))
    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(mockDisconnectGoogleCalendar).not.toHaveBeenCalled()
  })

  it('confirming the dialog calls disconnect', async () => {
    const user = userEvent.setup()
    render(<SettingsPageContainer />)

    await waitFor(() => {
      expect(screen.getByText('clinica@gmail.com')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /desconectar/i }))

    const dialog = screen.getByRole('dialog')
    const confirmBtn = within(dialog).getByRole('button', { name: /desconectar/i })
    await user.click(confirmBtn)

    expect(mockDisconnectGoogleCalendar).toHaveBeenCalledTimes(1)
  })
})

// ── Mobile/responsive DOM checks ──────────────────────────────────────────────

describe('SettingsPageContainer — mobile class checks', () => {
  it('UF/CEP grid uses sm:grid-cols-2 (not bare grid-cols-2)', async () => {
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(document.querySelector('#clinic-state')).toBeInTheDocument()
    })
    const ufInput = document.querySelector('#clinic-state')
    const responsiveGrid = ufInput?.closest('[class*="sm:grid-cols-2"]')
    expect(responsiveGrid).toBeTruthy()
  })

  it('calendar action buttons container uses flex-col and sm:flex-row', async () => {
    mockGetGoogleCalendarStatus.mockResolvedValue(makeConnectedCalendarStatus())
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sincronizar/i })).toBeInTheDocument()
    })
    const syncBtn = screen.getByRole('button', { name: /sincronizar/i })
    const buttonContainer = syncBtn.parentElement
    expect(buttonContainer?.className).toMatch(/flex-col/)
    expect(buttonContainer?.className).toMatch(/sm:flex-row/)
  })

  it('LinkRow text container has min-w-0', () => {
    render(<SettingsPageContainer />)
    const label = screen.getByText('Dados fiscais da clínica')
    const textContainer = label.parentElement
    expect(textContainer?.className).toMatch(/min-w-0/)
  })
})

// ── Clinic profile form groups ────────────────────────────────────────────────

describe('SettingsPageContainer — clinic profile form groups', () => {
  it('renders "Dados de contato" sub-group label', async () => {
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Dados de contato')).toBeInTheDocument()
    })
  })

  it('renders "Endereço" sub-group label', async () => {
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Endereço')).toBeInTheDocument()
    })
  })

  it('renders "Localização" sub-group label', async () => {
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Localização')).toBeInTheDocument()
    })
  })

  it('renders timezone value read-only in Localização', async () => {
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(screen.getByText('America/Sao_Paulo')).toBeInTheDocument()
    })
  })

  it('renders country value read-only in Localização', async () => {
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(screen.getByText('BR')).toBeInTheDocument()
    })
  })
})

// ── Clinic profile save UX ────────────────────────────────────────────────────

describe('SettingsPageContainer — clinic profile save UX', () => {
  it('disables submit button while saving', async () => {
    mockUpdateClinicProfile.mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))
    expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeDisabled()
  })

  it('disables clinic name input while saving', async () => {
    mockUpdateClinicProfile.mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(document.querySelector('#clinic-name')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))
    expect(document.querySelector('#clinic-name')).toBeDisabled()
  })

  it('payload does not include timezone, country, or logoUrl', async () => {
    mockUpdateClinicProfile.mockResolvedValue(makeClinicProfile())
    const user = userEvent.setup()
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))
    await waitFor(() => {
      expect(mockUpdateClinicProfile).toHaveBeenCalled()
    })
    const [payload] = mockUpdateClinicProfile.mock.calls[0] as [Record<string, unknown>]
    expect(payload).not.toHaveProperty('timezone')
    expect(payload).not.toHaveProperty('country')
    expect(payload).not.toHaveProperty('logoUrl')
  })

  it('calls showAlert with success tone after successful save', async () => {
    mockUpdateClinicProfile.mockResolvedValue(makeClinicProfile())
    const user = userEvent.setup()
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))
    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Perfil atualizado com sucesso.', tone: 'success' }),
      )
    })
  })

  it('renders save error inline when save fails', async () => {
    mockUpdateClinicProfile.mockRejectedValue(new Error('server error'))
    const user = userEvent.setup()
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))
    await waitFor(() => {
      expect(screen.getByText(/não foi possível salvar/i)).toBeInTheDocument()
    })
  })
})

// ── Security compliance section ───────────────────────────────────────────────

describe('SettingsPageContainer — security compliance section', () => {
  it('renders section intro copy', () => {
    render(<SettingsPageContainer />)
    expect(screen.getByText(/políticas, termos e práticas de proteção de dados/i)).toBeInTheDocument()
  })

  it('renders "Dados protegidos" trust card title', () => {
    render(<SettingsPageContainer />)
    expect(screen.getByText('Dados protegidos')).toBeInTheDocument()
  })

  it('renders "Acesso por função" trust card title', () => {
    render(<SettingsPageContainer />)
    expect(screen.getByText('Acesso por função')).toBeInTheDocument()
  })

  it('renders "Documentos legais" trust card title', () => {
    render(<SettingsPageContainer />)
    expect(screen.getByText('Documentos legais')).toBeInTheDocument()
  })

  it('trust cards are not rendered as buttons or links', () => {
    render(<SettingsPageContainer />)
    const title = screen.getByText('Dados protegidos')
    expect(title.closest('button')).toBeNull()
    expect(title.closest('a')).toBeNull()
  })

  it('renders all legal link labels', () => {
    render(<SettingsPageContainer />)
    for (const label of [
      'Política de Privacidade',
      'Termos de Uso',
      'Política de Cookies',
      'Tratamento de Dados (LGPD)',
      'Segurança',
      'Direitos do Titular',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('Política de Privacidade link has correct href', () => {
    render(<SettingsPageContainer />)
    const link = screen.getByRole('link', { name: 'Política de Privacidade' })
    expect(link).toHaveAttribute('href', '/politica-de-privacidade')
  })

  it('Tratamento de Dados link has correct href', () => {
    render(<SettingsPageContainer />)
    const link = screen.getByRole('link', { name: 'Tratamento de Dados (LGPD)' })
    expect(link).toHaveAttribute('href', '/tratamento-de-dados')
  })

  it('legal link label text has truncate class for mobile overflow protection', () => {
    render(<SettingsPageContainer />)
    const label = screen.getByText('Política de Privacidade')
    expect(label.className).toMatch(/truncate/)
  })
})

// ── Google Agenda section ─────────────────────────────────────────────────────

describe('SettingsPageContainer — Google Agenda section identity', () => {
  it('renders "Google Agenda" label', () => {
    render(<SettingsPageContainer />)
    expect(screen.getByText('Google Agenda')).toBeInTheDocument()
  })

  it('renders "Sincronização de calendário" subtitle', () => {
    render(<SettingsPageContainer />)
    expect(screen.getByText('Sincronização de calendário')).toBeInTheDocument()
  })

  it('disconnected description mentions "reduzir conflitos"', async () => {
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(screen.getByText(/reduzir conflitos/i)).toBeInTheDocument()
    })
  })

  it('connected description mentions "sincronização"', async () => {
    mockGetGoogleCalendarStatus.mockResolvedValue(makeConnectedCalendarStatus())
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(screen.getByText(/sincronização dos compromissos/i)).toBeInTheDocument()
    })
  })

  it('shows "Conectado" badge when connected', async () => {
    mockGetGoogleCalendarStatus.mockResolvedValue(makeConnectedCalendarStatus())
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Conectado')).toBeInTheDocument()
    })
  })

  it('does not show "Conectado" badge when disconnected', async () => {
    render(<SettingsPageContainer />)
    await waitFor(() => {
      expect(screen.queryByText('Conectado')).not.toBeInTheDocument()
    })
  })
})

// ── IA e Limites section ──────────────────────────────────────────────────────

describe('SettingsPageContainer — IA e Limites section', () => {
  it('renders "Uso inteligente da IA" section title', () => {
    render(<SettingsPageContainer />)
    expect(screen.getByText('Uso inteligente da IA')).toBeInTheDocument()
  })

  it('renders intro copy about processing resources', () => {
    render(<SettingsPageContainer />)
    expect(screen.getByText(/consome recursos de processamento/i)).toBeInTheDocument()
  })

  it('renders "Quando usar" trust card', () => {
    render(<SettingsPageContainer />)
    expect(screen.getByText('Quando usar')).toBeInTheDocument()
  })

  it('renders "Quando evitar" trust card', () => {
    render(<SettingsPageContainer />)
    expect(screen.getByText('Quando evitar')).toBeInTheDocument()
  })

  it('renders "Como controlamos custos" trust card', () => {
    render(<SettingsPageContainer />)
    expect(screen.getByText('Como controlamos custos')).toBeInTheDocument()
  })

  it('renders "Atalhos para executar análises" sub-header', () => {
    render(<SettingsPageContainer />)
    expect(screen.getByText(/atalhos para executar análises/i)).toBeInTheDocument()
  })

  it('renders explanatory sentence clarifying this section does not execute AI directly', () => {
    render(<SettingsPageContainer />)
    expect(screen.getByText(/não executa a IA diretamente/i)).toBeInTheDocument()
  })

  it('"Abrir análise financeira" link points to /app/financeiro', () => {
    render(<SettingsPageContainer />)
    const link = screen.getByRole('link', { name: /abrir análise financeira/i })
    expect(link).toHaveAttribute('href', '/app/financeiro')
  })

  it('"Abrir análise de estoque" link points to /app/estoque', () => {
    render(<SettingsPageContainer />)
    const link = screen.getByRole('link', { name: /abrir análise de estoque/i })
    expect(link).toHaveAttribute('href', '/app/estoque')
  })
})
