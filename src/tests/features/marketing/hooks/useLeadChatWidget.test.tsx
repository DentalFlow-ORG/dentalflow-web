import { act, renderHook, waitFor } from '@/test/render-utils'
import { WHATSAPP_PHONE_REQUIRED_MESSAGE } from '@/lib/field-formatters'

import {
  GOAL_OPTIONS,
  PROCESS_OPTIONS,
  TIME_OPTIONS,
} from '@/features/marketing/data/lead-chat-content'
import { useLeadChatWidget } from '@/features/marketing/hooks/useLeadChatWidget'

const mockSubmitPublicLead = vi.fn()

vi.mock('@/services/public-leads.service', () => ({
  submitPublicLead: (...args: unknown[]) => mockSubmitPublicLead(...args),
}))

describe('useLeadChatWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSubmitPublicLead.mockResolvedValue({ success: true, message: 'ok' })
  })

  it('validates required fields before submitting', async () => {
    const { result } = renderHook(() => useLeadChatWidget())

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(mockSubmitPublicLead).not.toHaveBeenCalled()
    expect(result.current.errors).toEqual({
      name: 'Informe seu nome.',
      whatsapp: 'Informe seu WhatsApp.',
      lgpd: 'Você precisa aceitar para continuar.',
    })
  })

  it('validates invalid WhatsApp numbers', async () => {
    const { result } = renderHook(() => useLeadChatWidget())

    act(() => {
      result.current.setForm((form) => ({
        ...form,
        name: 'Ana Silva',
        whatsapp: '123',
      }))
      result.current.setLgpdConsent(true)
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(mockSubmitPublicLead).not.toHaveBeenCalled()
    expect(result.current.errors.whatsapp).toBe(WHATSAPP_PHONE_REQUIRED_MESSAGE)
  })

  it('opens, resets, closes, and broadcasts state through DOM events', async () => {
    const onState = vi.fn()
    window.addEventListener('dentalflow:chat:state', onState)
    const { result } = renderHook(() => useLeadChatWidget())

    act(() => {
      result.current.handleSelectSituation(GOAL_OPTIONS[0])
    })
    expect(result.current.step).toBe('process')

    act(() => {
      window.dispatchEvent(new CustomEvent('dentalflow:chat:open'))
    })

    await waitFor(() => expect(result.current.isOpen).toBe(true))
    expect(result.current.step).toBe('situation')
    expect(result.current.history).toHaveLength(1)

    act(() => {
      window.dispatchEvent(new CustomEvent('dentalflow:chat:close'))
    })

    await waitFor(() => expect(result.current.isOpen).toBe(false))
    expect(onState).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { isOpen: true } }),
    )
    expect(onState).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { isOpen: false } }),
    )
    window.removeEventListener('dentalflow:chat:state', onState)
  })

  it('submits the public lead payload with selected context and optional fields', async () => {
    const { result } = renderHook(() => useLeadChatWidget())

    act(() => {
      result.current.handleSelectSituation(GOAL_OPTIONS[1])
      result.current.handleSelectProcess(PROCESS_OPTIONS[2])
      result.current.setForm({
        name: '  Ana Silva  ',
        whatsapp: '(11) 99999-9999',
        clinic: '  Clínica Central  ',
        time: TIME_OPTIONS[1],
      })
      result.current.setLgpdConsent(true)
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(mockSubmitPublicLead).toHaveBeenCalledWith({
      name: 'Ana Silva',
      phone: '(11) 99999-9999',
      clinicName: 'Clínica Central',
      preferredTime: TIME_OPTIONS[1],
      context: 'Melhorar controle financeiro · Usa outro software',
      acceptedPrivacyPolicy: true,
    })
    expect(result.current.step).toBe('success')
    expect(result.current.loading).toBe(false)
    expect(result.current.history.at(-1)?.role).toBe('bot')
  })

  it('omits blank optional payload fields', async () => {
    const { result } = renderHook(() => useLeadChatWidget())

    act(() => {
      result.current.setForm({
        name: 'Ana Silva',
        whatsapp: '(11) 99999-9999',
        clinic: '   ',
        time: '',
      })
      result.current.setLgpdConsent(true)
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(mockSubmitPublicLead).toHaveBeenCalledWith({
      name: 'Ana Silva',
      phone: '(11) 99999-9999',
      clinicName: undefined,
      preferredTime: undefined,
      context: 'Contato pelo chat',
      acceptedPrivacyPolicy: true,
    })
  })

  it('keeps the form step and exposes submit error when submission fails', async () => {
    mockSubmitPublicLead.mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useLeadChatWidget())

    act(() => {
      result.current.handleSelectSituation(GOAL_OPTIONS[0])
      result.current.handleSelectProcess(PROCESS_OPTIONS[0])
      result.current.setForm({
        name: 'Ana Silva',
        whatsapp: '(11) 99999-9999',
        clinic: '',
        time: '',
      })
      result.current.setLgpdConsent(true)
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(result.current.step).toBe('form')
    expect(result.current.loading).toBe(false)
    expect(result.current.submitError).toBe(
      'Não foi possível enviar. Tente novamente ou entre em contato pelo WhatsApp.',
    )
  })
})
