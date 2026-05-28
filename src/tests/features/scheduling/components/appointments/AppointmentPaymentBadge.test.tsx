import { render, screen } from '@/test-utils/render-utils'

import type { AppointmentPaymentStatus } from '@/features/scheduling/types/scheduling.types'
import { AppointmentPaymentBadge, PAYMENT_STATUS_CONFIG } from '@/features/scheduling/components/appointments/AppointmentPaymentBadge'

const PAYMENT_STATUS_LABELS: [AppointmentPaymentStatus, string][] = [
  ['PAYMENT_PENDING', 'Pagamento pendente'],
  ['PAID',            'Pago'],
  ['PARTIALLY_PAID',  'Pago parcialmente'],
  ['REFUNDED',        'Reembolsado'],
  ['CANCELED',        'Cancelado'],
]

describe('AppointmentPaymentBadge', () => {
  it.each(PAYMENT_STATUS_LABELS)(
    'renders the correct label for %s',
    (status, label) => {
      render(<AppointmentPaymentBadge status={status} />)
      expect(screen.getByText(label)).toBeInTheDocument()
    },
  )

  it('PAYMENT_STATUS_CONFIG has an entry for every payment status', () => {
    const statuses: AppointmentPaymentStatus[] = [
      'PAYMENT_PENDING',
      'PAID',
      'PARTIALLY_PAID',
      'REFUNDED',
      'CANCELED',
    ]
    statuses.forEach((s) => {
      expect(PAYMENT_STATUS_CONFIG).toHaveProperty(s)
    })
  })
})
