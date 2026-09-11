import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

const mockUseNotificationQuota = vi.fn()
vi.mock('@/features/notifications/hooks/useNotificationQuota', () => ({
  useNotificationQuota: () => mockUseNotificationQuota(),
}))

const mockUseNotificationPreferences = vi.fn()
vi.mock('@/features/notifications/hooks/useNotificationPreferences', () => ({
  useNotificationPreferences: () => mockUseNotificationPreferences(),
}))

const mockGrant = vi.fn()
const mockRevoke = vi.fn()
const mockUseNotificationConsent = vi.fn()
vi.mock('@/features/notifications/hooks/useNotificationConsent', () => ({
  useNotificationConsent: (...args: unknown[]) => mockUseNotificationConsent(...args),
}))

const mockSendNotification = vi.fn()
vi.mock('@/features/notifications/services/notifications.service', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/notifications/services/notifications.service')
  >('@/features/notifications/services/notifications.service')
  return {
    ...actual,
    sendNotification: (...args: unknown[]) => mockSendNotification(...args),
  }
})

import { ApiError } from '@/services/http'

import { NotificationSendDrawer } from '@/features/notifications/components/NotificationSendDrawer'
import type { NotificationTemplate } from '@/features/notifications/types/notifications.types'

const TEMPLATE: NotificationTemplate = {
  id: 'tpl-1',
  slug: 'appointment_reminder_24h',
  channel: 'WHATSAPP',
  category: 'UTILITY',
  bodyPt: 'Olá {{1}}',
  variables: ['1'],
}

const baseProps = {
  open: true,
  onClose: vi.fn(),
  template: TEMPLATE,
  appointmentId: 'appt-1',
  patientName: 'Ana',
  patientPhone: '11987654321',
  clinicName: 'Clínica Sorriso',
  appointmentDate: '2026-06-01',
  appointmentTime: '14:00',
  onSent: vi.fn(),
}

function setDefaults(
  overrides: {
    quota?: object
    preferences?: object
    consent?: object
  } = {},
) {
  mockUseNotificationQuota.mockReturnValue({
    quota: { used: 10, limit: 100, available: 90 },
    isLoading: false,
    ...overrides.quota,
  })
  mockUseNotificationPreferences.mockReturnValue({
    preferences: { providerType: 'simulated', providerConfigured: false },
    ...overrides.preferences,
  })
  mockUseNotificationConsent.mockReturnValue({
    consent: { id: 'c1', granted: true, revokedAt: null },
    isLoading: false,
    isSaving: false,
    grant: mockGrant,
    revoke: mockRevoke,
    ...overrides.consent,
  })
}

beforeEach(() => {
  mockShowAlert.mockReset()
  mockGrant.mockReset()
  mockRevoke.mockReset()
  mockSendNotification.mockReset()
  setDefaults()
})

describe('NotificationSendDrawer — header and preview', () => {
  it('uses the public template slug when no display label is known', () => {
    render(
      <NotificationSendDrawer {...baseProps} template={{ ...TEMPLATE, slug: 'custom_followup' }} />,
    )
    expect(screen.getByRole('heading', { name: 'custom_followup' })).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    render(<NotificationSendDrawer {...baseProps} open={false} />)
    expect(screen.queryByText('Ana')).not.toBeInTheDocument()
  })

  it('shows the known template label in the header', () => {
    render(<NotificationSendDrawer {...baseProps} />)
    expect(
      screen.getByRole('heading', { name: /lembrete de consulta \(24h\)/i }),
    ).toBeInTheDocument()
  })

  it('falls back to "Enviar mensagem" when there is no template', () => {
    render(<NotificationSendDrawer {...baseProps} template={null} />)
    expect(screen.getByText('Enviar mensagem')).toBeInTheDocument()
  })

  it('does not render the template preview when there is no template', () => {
    render(<NotificationSendDrawer {...baseProps} template={null} />)
    expect(screen.queryByText(/pré-visualização/i)).not.toBeInTheDocument()
  })
})

describe('NotificationSendDrawer — consent section', () => {
  it('shows a loading indicator while consent is loading', () => {
    setDefaults({ consent: { isLoading: true, consent: null } })
    render(<NotificationSendDrawer {...baseProps} />)
    expect(screen.getByText('Verificando...')).toBeInTheDocument()
  })

  it('shows the consent toggle checked when consent is granted and not revoked', () => {
    render(<NotificationSendDrawer {...baseProps} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('shows the consent toggle unchecked when consent was revoked', () => {
    setDefaults({
      consent: { consent: { id: 'c1', granted: true, revokedAt: '2026-06-01T00:00:00.000Z' } },
    })
    render(<NotificationSendDrawer {...baseProps} />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('calls grant when the toggle is turned on', async () => {
    setDefaults({ consent: { consent: null } })
    render(<NotificationSendDrawer {...baseProps} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(mockGrant).toHaveBeenCalledWith('11987654321')
  })

  it('calls revoke when the toggle is turned off', async () => {
    render(<NotificationSendDrawer {...baseProps} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(mockRevoke).toHaveBeenCalledOnce()
  })
})

describe('NotificationSendDrawer — quota and blocked states', () => {
  it('shows the quota usage line when quota is loaded', () => {
    render(<NotificationSendDrawer {...baseProps} />)
    expect(screen.getByText(/mensagens usadas este mês/i)).toBeInTheDocument()
  })

  it('does not show the quota line while quota is loading', () => {
    setDefaults({ quota: { isLoading: true, quota: null } })
    render(<NotificationSendDrawer {...baseProps} />)
    expect(screen.queryByText(/mensagens usadas este mês/i)).not.toBeInTheDocument()
  })

  it('shows the starter_plan lock when quota limit is 0', () => {
    setDefaults({ quota: { quota: { used: 0, limit: 0, available: 0 }, isLoading: false } })
    render(<NotificationSendDrawer {...baseProps} />)
    expect(screen.getByText('Recurso não disponível no plano atual')).toBeInTheDocument()
  })

  it('shows the quota_exceeded lock when available is 0 but limit is not', () => {
    setDefaults({ quota: { quota: { used: 100, limit: 100, available: 0 }, isLoading: false } })
    render(<NotificationSendDrawer {...baseProps} />)
    expect(screen.getByText('Limite mensal atingido')).toBeInTheDocument()
  })

  it('shows the no_consent lock when consent is missing', () => {
    setDefaults({ consent: { consent: null } })
    render(<NotificationSendDrawer {...baseProps} />)
    expect(screen.getByText('Consentimento não registrado')).toBeInTheDocument()
  })

  it('shows an invalid-date warning when the appointment has no valid date/time', () => {
    render(<NotificationSendDrawer {...baseProps} appointmentDate={null} appointmentTime={null} />)
    expect(
      screen.getByText(/não foi possível preparar a mensagem porque a consulta não possui/i),
    ).toBeInTheDocument()
  })
})

describe('NotificationSendDrawer — send flow', () => {
  it('disables the send button when consent is missing', () => {
    setDefaults({ consent: { consent: null } })
    render(<NotificationSendDrawer {...baseProps} />)
    expect(screen.getByRole('button', { name: /enviar mensagem simulada/i })).toBeDisabled()
  })

  it('enables the send button when everything is valid, labeled "simulada" by default', () => {
    render(<NotificationSendDrawer {...baseProps} />)
    expect(screen.getByRole('button', { name: /enviar mensagem simulada/i })).toBeEnabled()
  })

  it('labels the button "real" when the provider is a configured whatsapp_cloud provider', () => {
    setDefaults({
      preferences: {
        preferences: { providerType: 'whatsapp_cloud', providerConfigured: true },
      },
    })
    render(<NotificationSendDrawer {...baseProps} />)
    expect(screen.getByRole('button', { name: /enviar whatsapp real/i })).toBeInTheDocument()
  })

  it('sends the message, shows a success alert, and calls onSent', async () => {
    const onSent = vi.fn()
    mockSendNotification.mockResolvedValue({ status: 'SENT' })
    render(<NotificationSendDrawer {...baseProps} onSent={onSent} />)
    await userEvent.click(screen.getByRole('button', { name: /enviar mensagem simulada/i }))

    expect(mockSendNotification).toHaveBeenCalledWith({
      templateSlug: 'appointment_reminder_24h',
      phone: '11987654321',
      appointmentId: 'appt-1',
    })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Mensagem enviada', tone: 'success' }),
    )
    expect(onSent).toHaveBeenCalledOnce()
    expect(await screen.findByText('Enviado')).toBeInTheDocument()
  })

  it('shows the "real" success message when using a configured real provider', async () => {
    setDefaults({
      preferences: { preferences: { providerType: 'whatsapp_cloud', providerConfigured: true } },
    })
    mockSendNotification.mockResolvedValue({ status: 'SENT' })
    render(<NotificationSendDrawer {...baseProps} />)
    await userEvent.click(screen.getByRole('button', { name: /enviar whatsapp real/i }))
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Mensagem real enviada via WhatsApp Cloud API.' }),
    )
  })

  it('does not call onSent or show a success alert when the response status is not SENT', async () => {
    const onSent = vi.fn()
    mockSendNotification.mockResolvedValue({ status: 'FAILED' })
    render(<NotificationSendDrawer {...baseProps} onSent={onSent} />)
    await userEvent.click(screen.getByRole('button', { name: /enviar mensagem simulada/i }))
    expect(onSent).not.toHaveBeenCalled()
    expect(mockShowAlert).not.toHaveBeenCalled()
    expect(await screen.findByText('Falha')).toBeInTheDocument()
  })

  it('shows the ApiError message and a FAILED status on failure', async () => {
    mockSendNotification.mockRejectedValue(new ApiError('Número bloqueado.', 400, null))
    render(<NotificationSendDrawer {...baseProps} />)
    await userEvent.click(screen.getByRole('button', { name: /enviar mensagem simulada/i }))
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro', description: 'Número bloqueado.', tone: 'error' }),
    )
    expect(await screen.findByText('Falha')).toBeInTheDocument()
  })

  it('shows a generic error message for a non-ApiError failure', async () => {
    mockSendNotification.mockRejectedValue(new Error('boom'))
    render(<NotificationSendDrawer {...baseProps} />)
    await userEvent.click(screen.getByRole('button', { name: /enviar mensagem simulada/i }))
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Erro ao enviar mensagem.' }),
    )
  })

  it('does nothing when clicking send without a template', async () => {
    render(<NotificationSendDrawer {...baseProps} template={null} />)
    // No send button rendered logic depends on canSend which is independent of
    // template, but handleSend itself is a no-op without a template.
    const button = screen.getByRole('button', { name: /enviar mensagem simulada/i })
    await userEvent.click(button)
    expect(mockSendNotification).not.toHaveBeenCalled()
  })

  it('calls onClose on Escape', async () => {
    const onClose = vi.fn()
    render(<NotificationSendDrawer {...baseProps} onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
