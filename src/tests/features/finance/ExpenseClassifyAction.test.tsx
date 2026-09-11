import { render, screen, userEvent } from '@/test-utils/render-utils'
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
const suggestedState: ClassifierState = {
  ...idleState,
  result: {
    transactionId: 'tx-1',
    suggestedCategoryId: 'cat-1',
    suggestedCategoryName: 'Materiais',
    confidence: 0.9,
    source: 'AI',
    reason: 'Despesa de materiais',
    requiresConfirmation: true,
    quotaUsed: true,
  },
}

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
  it('starts classification and prevents another request while loading', async () => {
    const onClassify = vi.fn()
    const props = { transactionId: 'tx-1', onClassify, onApply: vi.fn(), onDismiss: vi.fn() }
    const view = render(<ExpenseClassifyAction {...props} state={idleState} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClassify).toHaveBeenCalledWith('tx-1')
    view.rerender(<ExpenseClassifyAction {...props} state={classifyingState} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClassify).toHaveBeenCalledOnce()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it.each([0.9, 0.75, 0.5])(
    'shows confidence %s for an actionable suggestion and allows dismissal',
    async (confidence) => {
      if (!suggestedState.result) throw new Error('Missing suggestion fixture')
      const onDismiss = vi.fn()
      render(
        <ExpenseClassifyAction
          transactionId="tx-1"
          state={{
            ...suggestedState,
            result: { ...suggestedState.result, confidence, reason: '' },
          }}
          onApply={vi.fn()}
          onClassify={vi.fn()}
          onDismiss={onDismiss}
        />,
      )
      expect(screen.getByText(`${Math.round(confidence * 100)}%`)).toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: 'Ignorar' }))
      expect(onDismiss).toHaveBeenCalledWith('tx-1')
    },
  )

  it('blocks applying and dismissing while the category update is pending', async () => {
    const onApply = vi.fn()
    const onDismiss = vi.fn()
    render(
      <ExpenseClassifyAction
        transactionId="tx-1"
        state={{ ...suggestedState, isApplying: true }}
        onApply={onApply}
        onClassify={vi.fn()}
        onDismiss={onDismiss}
      />,
    )
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled()
      await userEvent.click(button)
    }
    expect(onApply).not.toHaveBeenCalled()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it.each(['NO_MATCH', 'AI'] as const)(
    'allows dismissing %s results with no category',
    async (source) => {
      if (!suggestedState.result) throw new Error('Missing suggestion fixture')
      const onDismiss = vi.fn()
      render(
        <ExpenseClassifyAction
          transactionId="tx-1"
          state={{
            ...suggestedState,
            result: { ...suggestedState.result, source, suggestedCategoryId: null },
          }}
          onApply={vi.fn()}
          onClassify={vi.fn()}
          onDismiss={onDismiss}
        />,
      )
      expect(screen.getByText('Nenhuma categoria identificada.')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Aplicar' })).not.toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: 'Ignorar' }))
      expect(onDismiss).toHaveBeenCalledWith('tx-1')
    },
  )
  it('shows an application failure while preserving the suggestion for retry', async () => {
    const onApply = vi.fn()
    render(
      <ExpenseClassifyAction
        transactionId="tx-1"
        state={{ ...suggestedState, error: 'Categoria indisponível' }}
        onApply={onApply}
        onClassify={vi.fn()}
        onDismiss={vi.fn()}
      />,
    )
    expect(screen.getByText('Categoria indisponível')).toBeInTheDocument()
    expect(screen.getByText('Materiais')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    expect(onApply).toHaveBeenCalledWith('tx-1', 'cat-1')
  })
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
