import { render, screen } from '@/test-utils/render-utils'

import { InlineFeedback } from '@/components/common/InlineFeedback'

describe('InlineFeedback', () => {
  it('renders children', () => {
    render(<InlineFeedback>Algo deu errado.</InlineFeedback>)
    expect(screen.getByText('Algo deu errado.')).toBeInTheDocument()
  })

  it.each(['error', 'warning', 'info', 'success'] as const)(
    'renders the %s tone without crashing',
    (tone) => {
      render(<InlineFeedback tone={tone}>Mensagem</InlineFeedback>)
      expect(screen.getByText('Mensagem')).toBeInTheDocument()
    },
  )

  it('defaults to the error tone', () => {
    render(<InlineFeedback>Mensagem</InlineFeedback>)
    expect(screen.getByText('Mensagem')).toHaveClass('border-red-200')
  })
})

describe('InlineFeedback — announcement semantics', () => {
  // The message appears after a user action and its tone is otherwise carried
  // only by colour, so without a live region a screen reader says nothing and
  // an error reads the same as a success.
  it.each([
    ['error', 'alert'],
    ['warning', 'alert'],
  ] as const)('announces tone "%s" assertively', (tone, role) => {
    render(<InlineFeedback tone={tone}>Falha ao salvar.</InlineFeedback>)

    expect(screen.getByRole(role)).toHaveTextContent('Falha ao salvar.')
  })

  it.each([
    ['info', 'status'],
    ['success', 'status'],
  ] as const)('announces tone "%s" politely', (tone, role) => {
    render(<InlineFeedback tone={tone}>Tudo certo.</InlineFeedback>)

    expect(screen.getByRole(role)).toHaveTextContent('Tudo certo.')
  })

  it('defaults to an assertive alert', () => {
    render(<InlineFeedback>Erro inesperado.</InlineFeedback>)

    expect(screen.getByRole('alert')).toHaveTextContent('Erro inesperado.')
  })

  it('never leaves the message without a live region', () => {
    const tones = ['error', 'warning', 'info', 'success'] as const

    for (const tone of tones) {
      const { unmount } = render(<InlineFeedback tone={tone}>Mensagem</InlineFeedback>)
      expect(screen.queryByRole('alert') ?? screen.queryByRole('status')).not.toBeNull()
      unmount()
    }
  })
})
