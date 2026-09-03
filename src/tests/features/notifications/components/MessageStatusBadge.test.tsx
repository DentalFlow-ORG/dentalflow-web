import { render, screen } from '@/test-utils/render-utils'

import { MessageStatusBadge } from '@/features/notifications/components/MessageStatusBadge'
import type { NotificationStatus } from '@/features/notifications/types/notifications.types'

describe('MessageStatusBadge', () => {
  it.each([
    ['PENDING', 'Aguardando'],
    ['SENT', 'Enviado'],
    ['DELIVERED', 'Entregue'],
    ['READ', 'Lido'],
    ['CONFIRMED', 'Confirmado'],
    ['FAILED', 'Falha'],
    ['OPTED_OUT', 'Descadastrado'],
  ] as [NotificationStatus, string][])('renders the label for status %s', (status, label) => {
    render(<MessageStatusBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('applies a custom className', () => {
    render(<MessageStatusBadge status="SENT" className="custom" />)
    expect(screen.getByText('Enviado')).toHaveClass('custom')
  })
})
