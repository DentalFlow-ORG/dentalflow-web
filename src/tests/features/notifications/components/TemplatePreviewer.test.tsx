import { render, screen } from '@/test-utils/render-utils'

import { TemplatePreviewer } from '@/features/notifications/components/TemplatePreviewer'
import type { NotificationTemplate } from '@/features/notifications/types/notifications.types'

function makeTemplate(overrides: Partial<NotificationTemplate> = {}): NotificationTemplate {
  return {
    slug: 'appointment_reminder_24h',
    bodyPt: 'Olá {{1}}, sua consulta é dia {{2}} às {{3}}.',
    ...overrides,
  } as NotificationTemplate
}

describe('TemplatePreviewer', () => {
  it('renders the known template label and substituted body', () => {
    render(
      <TemplatePreviewer
        template={makeTemplate()}
        previewVars={{ patientName: 'Ana', date: '10/06', time: '14:00' }}
      />,
    )
    expect(screen.getByText(/lembrete de consulta \(24h\)/i)).toBeInTheDocument()
    expect(screen.getByText('Olá Ana, sua consulta é dia 10/06 às 14:00.')).toBeInTheDocument()
  })

  it('falls back to the raw slug when the template has no known label', () => {
    render(
      <TemplatePreviewer template={makeTemplate({ slug: 'unknown_template' })} previewVars={{}} />,
    )
    expect(screen.getByText(/unknown_template/i)).toBeInTheDocument()
  })

  it('shows the privacy notice', () => {
    render(<TemplatePreviewer template={makeTemplate()} previewVars={{}} />)
    expect(
      screen.getByText(/não inclui diagnóstico, prontuário ou detalhes clínicos/i),
    ).toBeInTheDocument()
  })
})
