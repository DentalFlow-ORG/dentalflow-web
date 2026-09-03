import { apiRequest } from '@/services/http'

vi.mock('@/services/http', () => ({
  apiRequest: vi.fn(),
}))

vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => 'token-123',
}))

import {
  TEMPLATES_BY_STATUS,
  TEMPLATE_LABELS,
  createOrUpdateConsent,
  getPreferences,
  getQuota,
  listConsents,
  listMessages,
  listTemplates,
  renderTemplatePreview,
  revokeConsent,
  sendNotification,
  updatePreferences,
} from '@/features/notifications/services/notifications.service'

const mockApiRequest = vi.mocked(apiRequest)

beforeEach(() => {
  mockApiRequest.mockReset()
  mockApiRequest.mockResolvedValue({})
})

describe('getPreferences', () => {
  it('calls GET /notifications/preferences with auth', async () => {
    await getPreferences()
    expect(mockApiRequest).toHaveBeenCalledWith('/notifications/preferences', {
      method: 'GET',
      accessToken: 'token-123',
    })
  })
})

describe('updatePreferences', () => {
  it('calls PATCH with the serialized body', async () => {
    await updatePreferences({ whatsappEnabled: true })
    expect(mockApiRequest).toHaveBeenCalledWith('/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ whatsappEnabled: true }),
      accessToken: 'token-123',
    })
  })
})

describe('getQuota', () => {
  it('calls GET /notifications/quota', async () => {
    await getQuota()
    expect(mockApiRequest).toHaveBeenCalledWith('/notifications/quota', {
      method: 'GET',
      accessToken: 'token-123',
    })
  })
})

describe('listTemplates', () => {
  it('calls GET /notifications/templates', async () => {
    await listTemplates()
    expect(mockApiRequest).toHaveBeenCalledWith('/notifications/templates', {
      method: 'GET',
      accessToken: 'token-123',
    })
  })
})

describe('listMessages', () => {
  it('builds a query string from all provided params', async () => {
    await listMessages({ appointmentId: 'appt-1', page: 2, limit: 10 })
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/notifications/messages?appointmentId=appt-1&page=2&limit=10')
  })

  it('omits the query string when no params are given', async () => {
    await listMessages()
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/notifications/messages')
  })

  it('omits falsy individual params', async () => {
    await listMessages({ appointmentId: undefined, page: 0, limit: 0 })
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/notifications/messages')
  })
})

describe('listConsents', () => {
  it('always includes channel and scope, plus phone when given', async () => {
    await listConsents({ phone: '11987654321' })
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toContain('channel=WHATSAPP')
    expect(path).toContain('scope=UTILITY')
    expect(path).toContain('phone=11987654321')
  })

  it('omits phone when not given', async () => {
    await listConsents()
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).not.toContain('phone=')
  })
})

describe('createOrUpdateConsent', () => {
  it('POSTs the consent payload', async () => {
    const payload = {
      phone: '11987654321',
      channel: 'WHATSAPP' as const,
      scope: 'UTILITY' as const,
      granted: true,
      source: 'MANUAL' as const,
    }
    await createOrUpdateConsent(payload)
    expect(mockApiRequest).toHaveBeenCalledWith('/notifications/consents', {
      method: 'POST',
      body: JSON.stringify(payload),
      accessToken: 'token-123',
    })
  })
})

describe('revokeConsent', () => {
  it('PATCHes the revoke endpoint for the given consent id', async () => {
    await revokeConsent('consent-1')
    expect(mockApiRequest).toHaveBeenCalledWith('/notifications/consents/consent-1/revoke', {
      method: 'PATCH',
      accessToken: 'token-123',
    })
  })
})

describe('sendNotification', () => {
  it('POSTs the send payload', async () => {
    const payload = {
      appointmentId: 'appt-1',
      templateSlug: 'appointment_reminder_24h',
      phone: '11987654321',
      variables: {},
    }
    await sendNotification(payload)
    expect(mockApiRequest).toHaveBeenCalledWith('/notifications/send', {
      method: 'POST',
      body: JSON.stringify(payload),
      accessToken: 'token-123',
    })
  })
})

describe('renderTemplatePreview', () => {
  it('substitutes all four placeholders', () => {
    const result = renderTemplatePreview('Olá {{1}}, sua consulta é dia {{2}} às {{3}} em {{4}}.', {
      patientName: 'Ana',
      date: '10/06',
      time: '14:00',
      clinicName: 'Clínica Sorriso',
    })
    expect(result).toBe('Olá Ana, sua consulta é dia 10/06 às 14:00 em Clínica Sorriso.')
  })

  it('falls back to em dash for missing variables', () => {
    const result = renderTemplatePreview('{{1}} {{2}} {{3}} {{4}}', {})
    expect(result).toBe('— — — —')
  })

  it('uses amount for {{2}} when date is not provided but amount is', () => {
    const result = renderTemplatePreview('Valor: {{2}}', { amount: 'R$ 100,00' })
    expect(result).toBe('Valor: R$ 100,00')
  })

  it('prefers date over amount for {{2}} when both are provided', () => {
    const result = renderTemplatePreview('{{2}}', { date: '10/06', amount: 'R$ 100,00' })
    expect(result).toBe('10/06')
  })

  it('replaces repeated placeholders', () => {
    const result = renderTemplatePreview('{{1}} e {{1}} de novo', { patientName: 'Ana' })
    expect(result).toBe('Ana e Ana de novo')
  })
})

describe('TEMPLATE_LABELS', () => {
  it('has a label for every known template slug', () => {
    expect(TEMPLATE_LABELS.appointment_reminder_24h).toBe('Lembrete de consulta (24h)')
    expect(Object.keys(TEMPLATE_LABELS)).toHaveLength(5)
  })
})

describe('TEMPLATES_BY_STATUS', () => {
  it('maps every appointment status to a non-empty list of templates', () => {
    for (const status of ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED', 'NO_SHOW']) {
      expect(TEMPLATES_BY_STATUS[status]?.length).toBeGreaterThan(0)
    }
  })
})
