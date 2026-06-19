import { render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

import { ExpenseClassifyAction } from '@/features/finance/components/ExpenseClassifyAction'
import type { ClassifierState } from '@/features/finance/hooks/useExpenseClassifier'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const idleState: ClassifierState = {
  result: null,
  isClassifying: false,
  isApplying: false,
  isPlanBlocked: false,
  isQuotaExceeded: false,
  error: null,
}

const quotaState: ClassifierState = { ...idleState, isQuotaExceeded: true }
const planBlockedState: ClassifierState = { ...idleState, isPlanBlocked: true }
const classifyingState: ClassifierState = { ...idleState, isClassifying: true }
const errorState: ClassifierState = { ...idleState, error: 'Falha ao classificar.' }

function renderAction(state: ClassifierState = idleState) {
  return render(
    <ExpenseClassifyAction
      transactionId="tx-1"
      state={state}
      onClassify={vi.fn()}
      onApply={vi.fn()}
      onDismiss={vi.fn()}
    />,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ExpenseClassifyAction', () => {
  // ── Idle state ──────────────────────────────────────────────────────────────

  it('renders "Sugerir categoria" trigger in idle state', () => {
    renderAction()
    expect(screen.getByText('Sugerir categoria')).toBeInTheDocument()
  })

  // ── Plan blocked ────────────────────────────────────────────────────────────

  it('renders plan-blocked inline notice', () => {
    renderAction(planBlockedState)
    expect(screen.getByText(/Classificação inteligente disponível nos planos/)).toBeInTheDocument()
  })

  // ── Quota exceeded ──────────────────────────────────────────────────────────

  it('renders quota-exceeded message', () => {
    renderAction(quotaState)
    expect(
      screen.getByText('Você atingiu o limite de classificações inteligentes deste mês.'),
    ).toBeInTheDocument()
  })

  it('quota-exceeded state renders in a styled amber box, not a bare <p>', () => {
    const { container } = renderAction(quotaState)
    // Must be wrapped in a div with amber border — not a bare <p>
    const box = container.querySelector('.border-amber-200')
    expect(box).toBeInTheDocument()
    expect(box?.tagName).toBe('DIV')
  })

  it('quota-exceeded box has dark mode amber classes', () => {
    const { container } = renderAction(quotaState)
    const box = container.querySelector('.border-amber-200')
    expect(box?.className).toContain('dark:border-amber-800/50')
    expect(box?.className).toContain('dark:bg-amber-950/20')
  })

  // ── Loading state ────────────────────────────────────────────────────────────

  it('shows classifying state when isClassifying', () => {
    renderAction(classifyingState)
    expect(screen.getByText('Classificando…')).toBeInTheDocument()
  })

  // ── Error state ──────────────────────────────────────────────────────────────

  it('renders error message when error is set', () => {
    renderAction(errorState)
    expect(screen.getByText('Falha ao classificar.')).toBeInTheDocument()
  })
})
