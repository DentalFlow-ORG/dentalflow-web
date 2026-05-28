import { render, screen } from '@/test-utils/render-utils'

import type { AppointmentStatus } from '@/features/scheduling/types/scheduling.types'
import { AppointmentStatusBadge, STATUS_CONFIG } from '@/features/scheduling/components/appointments/AppointmentStatusBadge'

const STATUS_LABELS: [AppointmentStatus, string][] = [
  ['PENDING',   'Pendente'],
  ['CONFIRMED', 'Confirmado'],
  ['CANCELED',  'Cancelado'],
  ['COMPLETED', 'Concluído'],
  ['NO_SHOW',   'Não compareceu'],
]

describe('AppointmentStatusBadge', () => {
  it.each(STATUS_LABELS)('renders the correct label for %s', (status, label) => {
    render(<AppointmentStatusBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('STATUS_CONFIG has an entry for every appointment status', () => {
    const statuses: AppointmentStatus[] = [
      'PENDING',
      'CONFIRMED',
      'CANCELED',
      'COMPLETED',
      'NO_SHOW',
    ]
    statuses.forEach((s) => {
      expect(STATUS_CONFIG).toHaveProperty(s)
    })
  })
})
