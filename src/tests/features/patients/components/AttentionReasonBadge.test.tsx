import { render, screen } from '@/test-utils/render-utils'

import { AttentionReasonBadge } from '@/features/patients/components/AttentionReasonBadge'
import type { AttentionReason } from '@/features/patients/types/attention.types'

const ALL_REASONS: AttentionReason[] = [
  'INACTIVE',
  'NO_UPCOMING_APPOINTMENT',
  'PENDING_PAYMENT',
  'RECENTLY_CANCELED',
  'RECENT_NO_SHOW',
]

// ── Label rendering ───────────────────────────────────────────────────────────

describe('AttentionReasonBadge — labels', () => {
  it('renders "Inativo" for INACTIVE', () => {
    render(<AttentionReasonBadge reason="INACTIVE" />)
    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })

  it('renders "Sem próxima consulta" for NO_UPCOMING_APPOINTMENT', () => {
    render(<AttentionReasonBadge reason="NO_UPCOMING_APPOINTMENT" />)
    expect(screen.getByText('Sem próxima consulta')).toBeInTheDocument()
  })

  it('renders "Pagamento pendente" for PENDING_PAYMENT', () => {
    render(<AttentionReasonBadge reason="PENDING_PAYMENT" />)
    expect(screen.getByText('Pagamento pendente')).toBeInTheDocument()
  })

  it('renders "Cancelamento recente" for RECENTLY_CANCELED', () => {
    render(<AttentionReasonBadge reason="RECENTLY_CANCELED" />)
    expect(screen.getByText('Cancelamento recente')).toBeInTheDocument()
  })

  it('renders "Falta recente" for RECENT_NO_SHOW', () => {
    render(<AttentionReasonBadge reason="RECENT_NO_SHOW" />)
    expect(screen.getByText('Falta recente')).toBeInTheDocument()
  })
})

// ── All reasons covered ───────────────────────────────────────────────────────

describe('AttentionReasonBadge — completeness', () => {
  it('renders a non-empty visible text for every known reason', () => {
    ALL_REASONS.forEach((reason) => {
      const { container, unmount } = render(<AttentionReasonBadge reason={reason} />)
      // The badge must have visible text — not blank, not just a dot/icon
      const span = container.querySelector('span')
      expect(span?.textContent?.trim().length).toBeGreaterThan(0)
      unmount()
    })
  })

  it('renders a <span> element for every reason without crashing', () => {
    ALL_REASONS.forEach((reason) => {
      expect(() => render(<AttentionReasonBadge reason={reason} />)).not.toThrow()
    })
  })
})
