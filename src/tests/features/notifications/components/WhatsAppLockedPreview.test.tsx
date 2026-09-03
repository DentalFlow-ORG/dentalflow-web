import { render, screen } from '@/test-utils/render-utils'

import { WhatsAppLockedPreview } from '@/features/notifications/components/WhatsAppLockedPreview'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

describe('WhatsAppLockedPreview', () => {
  it('defaults to the starter_plan reason with an upgrade CTA', () => {
    render(<WhatsAppLockedPreview />)
    expect(screen.getByText('Recurso não disponível no plano atual')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver planos' })).toBeInTheDocument()
  })

  it('shows the quota_exceeded message with an upgrade CTA', () => {
    render(<WhatsAppLockedPreview reason="quota_exceeded" />)
    expect(screen.getByText('Limite mensal atingido')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver planos' })).toBeInTheDocument()
  })

  it('shows the no_consent message without an upgrade CTA', () => {
    render(<WhatsAppLockedPreview reason="no_consent" />)
    expect(screen.getByText('Consentimento não registrado')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Ver planos' })).not.toBeInTheDocument()
  })
})
