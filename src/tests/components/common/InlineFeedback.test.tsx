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
