import { render, screen } from '@/test-utils/render-utils'

import { PatientPriorityBadge } from '@/features/patients/components/PatientPriorityBadge'
import type { AttentionPriority } from '@/features/patients/types/attention.types'

const ALL_PRIORITIES: AttentionPriority[] = ['HIGH', 'MEDIUM', 'LOW']

// ── Label rendering ───────────────────────────────────────────────────────────

describe('PatientPriorityBadge — labels', () => {
  it('renders "Alta" for HIGH priority', () => {
    render(<PatientPriorityBadge priority="HIGH" />)
    expect(screen.getByText('Alta')).toBeInTheDocument()
  })

  it('renders "Média" for MEDIUM priority', () => {
    render(<PatientPriorityBadge priority="MEDIUM" />)
    expect(screen.getByText('Média')).toBeInTheDocument()
  })

  it('renders "Baixa" for LOW priority', () => {
    render(<PatientPriorityBadge priority="LOW" />)
    expect(screen.getByText('Baixa')).toBeInTheDocument()
  })
})

// ── All priorities covered ────────────────────────────────────────────────────

describe('PatientPriorityBadge — completeness', () => {
  it('renders without crashing for every known priority', () => {
    ALL_PRIORITIES.forEach((priority) => {
      expect(() => render(<PatientPriorityBadge priority={priority} />)).not.toThrow()
    })
  })

  it('has visible text for every priority', () => {
    ALL_PRIORITIES.forEach((priority) => {
      const { unmount, container } = render(<PatientPriorityBadge priority={priority} />)
      const span = container.querySelector('span')
      expect(span?.textContent?.trim().length).toBeGreaterThan(0)
      unmount()
    })
  })
})
