import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

import { AiAssistantCard } from '@/components/common/AiAssistantCard'
import type { AiAnalysisResult, AiQuotaInfo } from '@/lib/ai-types'
import { ApiError } from '@/services/http'

function makeResult(overrides: Partial<AiAnalysisResult> = {}): AiAnalysisResult {
  return {
    sections: [
      { title: 'Receita', content: 'Receita cresceu 10%.', tone: 'positive' },
      { title: 'Despesas', content: 'Despesas estáveis.', tone: 'neutral' },
    ],
    disclaimer: 'Gerado por IA, revise antes de decidir.',
    generatedAt: new Date().toISOString(),
    model: 'test-model',
    ...overrides,
  }
}

function makeQuota(overrides: Partial<AiQuotaInfo> = {}): AiQuotaInfo {
  return {
    allowed: true,
    planKey: 'pro',
    used: 1,
    remaining: 4,
    limit: 5,
    nextResetAt: new Date().toISOString(),
    lastGeneratedAt: null,
    blockedReason: null,
    ...overrides,
  }
}

const baseProps = {
  type: 'finance' as const,
  title: 'Análise financeira',
  description: 'Insights sobre suas finanças.',
}

describe('AiAssistantCard — idle state', () => {
  it('shows the generate button when canGenerate is true', () => {
    render(<AiAssistantCard {...baseProps} onGenerate={vi.fn()} canGenerate />)
    expect(screen.getByRole('button', { name: /gerar análise/i })).toBeInTheDocument()
  })

  it('shows a read-only message when canGenerate is false', () => {
    render(<AiAssistantCard {...baseProps} onGenerate={vi.fn()} canGenerate={false} />)
    expect(screen.getByText(/nenhuma análise disponível/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /gerar análise/i })).not.toBeInTheDocument()
  })

  it('disables the generate button and shows the disabledReason', () => {
    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        disabledReason="Limite de uso atingido."
      />,
    )
    expect(screen.getByRole('button', { name: /gerar análise/i })).toBeDisabled()
    expect(screen.getByText('Limite de uso atingido.')).toBeInTheDocument()
  })

  it('prioritizes the quota-derived disabled reason over the caller-provided one', () => {
    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        disabledReason="Motivo do chamador"
        quota={makeQuota({ remaining: 0, blockedReason: 'Cota mensal esgotada.' })}
      />,
    )
    expect(screen.getByText('Cota mensal esgotada.')).toBeInTheDocument()
  })

  it('calls onGenerate when the button is clicked', async () => {
    const onGenerate = vi.fn().mockResolvedValue(makeResult())
    render(<AiAssistantCard {...baseProps} onGenerate={onGenerate} canGenerate />)
    await userEvent.click(screen.getByRole('button', { name: /gerar análise/i }))
    expect(onGenerate).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.getByText('Receita')).toBeInTheDocument())
  })
})

describe('AiAssistantCard — loading state', () => {
  it('shows a loading indicator with no previous result', async () => {
    let resolveGenerate: (value: AiAnalysisResult) => void = () => {}
    const onGenerate = vi.fn(
      () =>
        new Promise<AiAnalysisResult>((resolve) => {
          resolveGenerate = resolve
        }),
    )
    render(<AiAssistantCard {...baseProps} onGenerate={onGenerate} canGenerate />)
    await userEvent.click(screen.getByRole('button', { name: /gerar análise/i }))
    expect(screen.getByText(/analisando dados/i)).toBeInTheDocument()
    resolveGenerate(makeResult())
    await waitFor(() => expect(screen.getByText('Receita')).toBeInTheDocument())
  })

  it('shows an "Atualizando" overlay when refreshing an existing result', async () => {
    let resolveGenerate: (value: AiAnalysisResult) => void = () => {}
    const onGenerate = vi.fn(
      () =>
        new Promise<AiAnalysisResult>((resolve) => {
          resolveGenerate = resolve
        }),
    )
    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={onGenerate}
        canGenerate
        initialResult={makeResult()}
      />,
    )
    await screen.findByText('Receita')
    await userEvent.click(screen.getByRole('button', { name: /atualizar análise/i }))
    expect(screen.getByText(/atualizando/i)).toBeInTheDocument()
    resolveGenerate(makeResult({ sections: [{ title: 'Nova', content: 'x', tone: 'neutral' }] }))
    await waitFor(() => expect(screen.getByText('Nova')).toBeInTheDocument())
  })

  it('ignores a second click while already loading', async () => {
    const onGenerate = vi.fn(() => new Promise<AiAnalysisResult>(() => {}))
    render(<AiAssistantCard {...baseProps} onGenerate={onGenerate} canGenerate />)
    const button = screen.getByRole('button', { name: /gerar análise/i })
    await userEvent.click(button)
    await userEvent.click(button)
    expect(onGenerate).toHaveBeenCalledTimes(1)
  })
})

describe('AiAssistantCard — error state', () => {
  it('shows a generic error message and a retry button with no previous result', async () => {
    const onGenerate = vi.fn().mockRejectedValue(new Error('network down'))
    render(<AiAssistantCard {...baseProps} onGenerate={onGenerate} canGenerate />)
    await userEvent.click(screen.getByRole('button', { name: /gerar análise/i }))
    expect(
      await screen.findByText('Não foi possível gerar a análise. Tente novamente.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument()
  })

  it('shows the ApiError message when onGenerate rejects with an ApiError', async () => {
    const onGenerate = vi.fn().mockRejectedValue(new ApiError('Cota excedida.', 429, null))
    render(<AiAssistantCard {...baseProps} onGenerate={onGenerate} canGenerate />)
    await userEvent.click(screen.getByRole('button', { name: /gerar análise/i }))
    expect(await screen.findByText('Cota excedida.')).toBeInTheDocument()
  })

  it('keeps showing the previous result with a warning banner when a refresh fails', async () => {
    const onGenerate = vi.fn().mockRejectedValue(new Error('fail'))
    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={onGenerate}
        canGenerate
        initialResult={makeResult()}
      />,
    )
    await screen.findByText('Receita')
    await userEvent.click(screen.getByRole('button', { name: /atualizar análise/i }))
    expect(
      await screen.findByText(/não foi possível atualizar a análise agora/i),
    ).toBeInTheDocument()
    expect(screen.getByText('Receita')).toBeInTheDocument()
  })
})

describe('AiAssistantCard — success state', () => {
  it('shows a single SectionCard when there is exactly one section', async () => {
    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        initialResult={makeResult({
          sections: [{ title: 'Único', content: 'x', tone: 'neutral' }],
        })}
      />,
    )
    expect(await screen.findByText('Único')).toBeInTheDocument()
  })

  it('shows an empty-data message when there are zero sections', async () => {
    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        initialResult={makeResult({ sections: [] })}
      />,
    )
    expect(
      await screen.findByText(/ainda não há dados suficientes para gerar uma análise/i),
    ).toBeInTheDocument()
  })

  it('shows the disclaimer and generated timestamp', async () => {
    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        initialResult={makeResult()}
      />,
    )
    expect(await screen.findByText('Gerado por IA, revise antes de decidir.')).toBeInTheDocument()
    expect(screen.getByText(/última análise gerada em/i)).toBeInTheDocument()
  })

  it('copies the analysis to the clipboard and shows a confirmation', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        initialResult={makeResult()}
      />,
    )
    await screen.findByText('Receita')
    await userEvent.click(screen.getByRole('button', { name: /copiar/i }))
    expect(writeText).toHaveBeenCalledWith(
      'Receita\nReceita cresceu 10%.\n\nDespesas\nDespesas estáveis.',
    )
    expect(await screen.findByText('Copiado!')).toBeInTheDocument()
  })

  it('silently ignores a clipboard write failure', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.assign(navigator, { clipboard: { writeText } })

    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        initialResult={makeResult()}
      />,
    )
    await screen.findByText('Receita')
    await userEvent.click(screen.getByRole('button', { name: /copiar/i }))
    await waitFor(() => expect(writeText).toHaveBeenCalled())
    expect(screen.queryByText('Copiado!')).not.toBeInTheDocument()
  })

  it('does not show the "Atualizar análise" button when canGenerate is false', async () => {
    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate={false}
        initialResult={makeResult()}
      />,
    )
    await screen.findByText('Receita')
    expect(screen.queryByRole('button', { name: /atualizar análise/i })).not.toBeInTheDocument()
  })

  it('uses a 3-column grid once there are 5 or more sections', async () => {
    const manySections = Array.from({ length: 5 }, (_, i) => ({
      title: `Seção ${i}`,
      content: 'x',
      tone: 'neutral' as const,
    }))
    const { container } = render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        initialResult={makeResult({ sections: manySections })}
      />,
    )
    await screen.findByText('Seção 0')
    expect(container.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument()
  })
})

describe('AiAssistantCard — stale period banner', () => {
  it('marks the result stale when it is older than 30 days', async () => {
    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        initialResult={makeResult({
          generatedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
        })}
      />,
    )
    expect(await screen.findByText(/esta análise pode estar desatualizada/i)).toBeInTheDocument()
  })

  it('shows the period-specific message when periodStart/periodEnd are present', async () => {
    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        invalidationKey="2026-07-01|2026-07-31"
        initialResult={makeResult({
          periodStart: '2026-06-01',
          periodEnd: '2026-06-30',
        })}
      />,
    )
    expect(
      await screen.findByText(/esta análise foi gerada para o período 01\/06\/2026/i),
    ).toBeInTheDocument()
  })

  it('shows the read-only variant of the stale message when canGenerate is false', async () => {
    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate={false}
        initialResult={makeResult({
          generatedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
        })}
      />,
    )
    expect(
      await screen.findByText(/o responsável da clínica pode atualizá-la a qualquer momento/i),
    ).toBeInTheDocument()
  })

  it('marks a result stale when the invalidationKey changes while a result exists', async () => {
    const { rerender } = render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        invalidationKey="period-1"
        initialResult={makeResult()}
      />,
    )
    await screen.findByText('Receita')
    rerender(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        invalidationKey="period-2"
        initialResult={makeResult()}
      />,
    )
    expect(await screen.findByText(/esta análise pode estar desatualizada/i)).toBeInTheDocument()
  })

  it('resets to idle when the invalidationKey changes and there is no result', () => {
    const { rerender } = render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        invalidationKey="period-1"
      />,
    )
    rerender(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        invalidationKey="period-2"
      />,
    )
    expect(screen.getByRole('button', { name: /gerar análise/i })).toBeInTheDocument()
  })
})

describe('AiAssistantCard — loading initial saved analysis', () => {
  it('shows a loading indicator while isLoadingInitial is true', () => {
    render(<AiAssistantCard {...baseProps} onGenerate={vi.fn()} canGenerate isLoadingInitial />)
    expect(screen.getByText(/carregando análise salva/i)).toBeInTheDocument()
  })
})

describe('AiAssistantCard — premium wall', () => {
  it('shows the premium blurred preview when quota disallows and visibility is not TEASER', () => {
    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        quota={makeQuota({ allowed: false, blockedReason: 'Disponível no plano Professional.' })}
      />,
    )
    expect(screen.getByText('Disponível no plano Professional.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /gerar análise/i })).not.toBeInTheDocument()
  })

  it('does not show the premium wall while isLoadingInitial is true', () => {
    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        isLoadingInitial
        quota={makeQuota({ allowed: false })}
      />,
    )
    expect(screen.getByText(/carregando análise salva/i)).toBeInTheDocument()
  })
})

describe('AiAssistantCard — teaser', () => {
  it('shows only the first two sections and blurs the rest, with an upgrade CTA', async () => {
    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate={false}
        visibility="TEASER"
        initialResult={makeResult({
          sections: [
            { title: 'Um', content: 'a', tone: 'neutral' },
            { title: 'Dois', content: 'b', tone: 'neutral' },
            { title: 'Três', content: 'c', tone: 'neutral' },
          ],
        })}
      />,
    )
    expect(await screen.findByText('Um')).toBeInTheDocument()
    expect(screen.getByText('Dois')).toBeInTheDocument()
    expect(screen.getByText('Veja a análise completa')).toBeInTheDocument()
  })

  it('does not show the blurred-upgrade block when two or fewer sections exist', async () => {
    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate={false}
        visibility="TEASER"
        initialResult={makeResult({
          sections: [{ title: 'Único', content: 'a', tone: 'neutral' }],
        })}
      />,
    )
    expect(await screen.findByText('Único')).toBeInTheDocument()
    expect(screen.queryByText('Veja a análise completa')).not.toBeInTheDocument()
  })

  it('does not show copy/refresh actions while in teaser mode', async () => {
    render(
      <AiAssistantCard
        {...baseProps}
        onGenerate={vi.fn()}
        canGenerate
        visibility="TEASER"
        initialResult={makeResult()}
      />,
    )
    await screen.findByText('Receita')
    expect(screen.queryByRole('button', { name: /copiar/i })).not.toBeInTheDocument()
  })
})
