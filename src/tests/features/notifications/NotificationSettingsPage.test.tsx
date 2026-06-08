import { render, screen, userEvent } from '@/test-utils/render-utils'

import { NotificationSettingsPage } from '@/features/notifications/pages/NotificationSettingsPage'
import { makeOwnerUser, makeAssistantUser } from '@/test-utils/factories/user.factory'
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

const mockSave = vi.fn()
const mockUseNotificationPreferences = vi.fn()

vi.mock('@/features/notifications/hooks/useNotificationPreferences', () => ({
  useNotificationPreferences: () => mockUseNotificationPreferences(),
}))

const mockUseNotificationQuota = vi.fn()

vi.mock('@/features/notifications/hooks/useNotificationQuota', () => ({
  useNotificationQuota: () => mockUseNotificationQuota(),
}))

const mockShowAlert = vi.fn()

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert, dismissAlert: vi.fn() }),
}))

// ── Factories ─────────────────────────────────────────────────────────────────

function makePreferences(overrides: Record<string, unknown> = {}) {
  return {
    clinicId: 'clinic-1',
    whatsappEnabled: false,
    autoReminder: false,
    autoConfirmation: false,
    reminderHoursBefore: 24,
    createdAt: null,
    updatedAt: null,
    providerType: 'local' as const,
    providerConfigured: false,
    ...overrides,
  }
}

function makeQuota(overrides: Record<string, unknown> = {}) {
  return {
    month: '2026-06',
    channel: 'WHATSAPP' as const,
    used: 5,
    limit: 50,
    available: 45,
    ...overrides,
  }
}

function makeDefaultPreferencesHook(overrides: Record<string, unknown> = {}) {
  return {
    preferences: makePreferences(),
    isLoading: false,
    isSaving: false,
    error: null,
    save: mockSave,
    reload: vi.fn(),
    ...overrides,
  }
}

function makeDefaultQuotaHook(overrides: Record<string, unknown> = {}) {
  return {
    quota: makeQuota(),
    isLoading: false,
    error: null,
    reload: vi.fn(),
    ...overrides,
  }
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
  mockSave.mockResolvedValue(makePreferences())
  mockUseNotificationPreferences.mockReturnValue(makeDefaultPreferencesHook())
  mockUseNotificationQuota.mockReturnValue(makeDefaultQuotaHook())
})

afterEach(() => {
  resetAuthMocks()
  vi.clearAllMocks()
})

// ── Header ────────────────────────────────────────────────────────────────────

describe('NotificationSettingsPage — header', () => {
  it('renders "Comunicação" eyebrow', () => {
    render(<NotificationSettingsPage />)
    expect(screen.getByText('Comunicação')).toBeInTheDocument()
  })

  it('renders "Notificações" h1 heading', () => {
    render(<NotificationSettingsPage />)
    expect(screen.getByRole('heading', { name: 'Notificações', level: 1 })).toBeInTheDocument()
  })

  it('renders updated page description', () => {
    render(<NotificationSettingsPage />)
    expect(screen.getByText(/lembretes automáticos/i)).toBeInTheDocument()
  })
})

// ── Back button ───────────────────────────────────────────────────────────────

describe('NotificationSettingsPage — back button', () => {
  it('OWNER back button links to /app/configuracoes', () => {
    render(<NotificationSettingsPage />)
    const backLink = screen.getByRole('link', { name: /voltar/i })
    expect(backLink).toHaveAttribute('href', '/app/configuracoes')
  })

  it('ASSISTANT back button links to /app', () => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
    render(<NotificationSettingsPage />)
    const backLink = screen.getByRole('link', { name: /voltar/i })
    expect(backLink).toHaveAttribute('href', '/app')
  })
})

// ── Loading state ─────────────────────────────────────────────────────────────

describe('NotificationSettingsPage — loading state', () => {
  it('loading state has role="status"', () => {
    mockUseNotificationPreferences.mockReturnValue(makeDefaultPreferencesHook({ isLoading: true }))
    render(<NotificationSettingsPage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

// ── Error states ──────────────────────────────────────────────────────────────

describe('NotificationSettingsPage — error states', () => {
  it('preferences load error renders visible inline feedback', () => {
    mockUseNotificationPreferences.mockReturnValue(
      makeDefaultPreferencesHook({ preferences: null, error: 'Não foi possível carregar as preferências.' }),
    )
    render(<NotificationSettingsPage />)
    expect(screen.getByText(/não foi possível carregar as preferências/i)).toBeInTheDocument()
  })

  it('quota load error renders visible inline feedback', () => {
    mockUseNotificationQuota.mockReturnValue(
      makeDefaultQuotaHook({ quota: null, error: 'Não foi possível carregar o uso mensal.' }),
    )
    render(<NotificationSettingsPage />)
    expect(screen.getByText(/não foi possível carregar o uso mensal/i)).toBeInTheDocument()
  })
})

// ── Monthly usage ─────────────────────────────────────────────────────────────

describe('NotificationSettingsPage — monthly usage', () => {
  it('renders usage bar with used/limit counts', () => {
    render(<NotificationSettingsPage />)
    expect(screen.getByText('5 / 50 mensagens este mês')).toBeInTheDocument()
  })

  it('quota loading state has role="status"', () => {
    mockUseNotificationQuota.mockReturnValue(makeDefaultQuotaHook({ quota: null, isLoading: true }))
    render(<NotificationSettingsPage />)
    expect(screen.getByText(/carregando uso/i)).toBeInTheDocument()
    const loadingDiv = screen.getByText(/carregando uso/i).closest('[role="status"]')
    expect(loadingDiv).toBeInTheDocument()
  })
})

// ── WhatsApp toggle ───────────────────────────────────────────────────────────

describe('NotificationSettingsPage — WhatsApp toggle', () => {
  it('renders the Ativar button when WhatsApp is disabled', () => {
    render(<NotificationSettingsPage />)
    expect(screen.getByRole('button', { name: /ativar/i })).toBeInTheDocument()
  })

  it('renders the Desativar button when WhatsApp is enabled', () => {
    mockUseNotificationPreferences.mockReturnValue(
      makeDefaultPreferencesHook({ preferences: makePreferences({ whatsappEnabled: true }) }),
    )
    render(<NotificationSettingsPage />)
    expect(screen.getByRole('button', { name: /desativar/i })).toBeInTheDocument()
  })

  it('toggle button is disabled while saving', () => {
    mockUseNotificationPreferences.mockReturnValue(makeDefaultPreferencesHook({ isSaving: true }))
    render(<NotificationSettingsPage />)
    expect(document.querySelector('button[disabled]')).toBeInTheDocument()
  })

  it('clicking Ativar calls save with whatsappEnabled: true', async () => {
    const user = userEvent.setup()
    render(<NotificationSettingsPage />)
    await user.click(screen.getByRole('button', { name: /ativar/i }))
    expect(mockSave).toHaveBeenCalledWith({ whatsappEnabled: true })
  })
})

// ── Reminder hours select ─────────────────────────────────────────────────────

describe('NotificationSettingsPage — reminder hours select', () => {
  it('renders the reminder hours select', () => {
    render(<NotificationSettingsPage />)
    expect(screen.getByRole('combobox', { name: /antecedência do lembrete/i })).toBeInTheDocument()
  })
})

// ── Role-aware copy ───────────────────────────────────────────────────────────

describe('NotificationSettingsPage — role-aware copy', () => {
  it('ASSISTANT sees the role explainer about owner-restricted settings', () => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
    render(<NotificationSettingsPage />)
    expect(screen.getByText(/configurações administrativas da clínica/i)).toBeInTheDocument()
  })

  it('OWNER does not see the ASSISTANT role explainer', () => {
    render(<NotificationSettingsPage />)
    expect(screen.queryByText(/configurações administrativas da clínica/i)).not.toBeInTheDocument()
  })
})

// ── Simulation mode ───────────────────────────────────────────────────────────

describe('NotificationSettingsPage — simulation mode notice', () => {
  it('shows simulation notice when provider is local and WhatsApp is enabled', () => {
    mockUseNotificationPreferences.mockReturnValue(
      makeDefaultPreferencesHook({
        preferences: makePreferences({ whatsappEnabled: true, providerType: 'local' }),
      }),
    )
    render(<NotificationSettingsPage />)
    expect(screen.getByText(/simulação/i)).toBeInTheDocument()
    expect(screen.getByText(/nenhuma mensagem real/i)).toBeInTheDocument()
  })

  it('does not show simulation notice when WhatsApp is disabled', () => {
    render(<NotificationSettingsPage />)
    expect(screen.queryByText(/simulação/i)).not.toBeInTheDocument()
  })
})
