import { render, screen } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'

import { ActionIconButton } from '@/components/common/ActionIconButton'
import { Trash2 } from 'lucide-react'

describe('ActionIconButton', () => {
  it('defaults to type="button" so it never submits an enclosing form', () => {
    render(
      <ActionIconButton aria-label="Excluir">
        <Trash2 className="h-4 w-4" />
      </ActionIconButton>,
    )
    expect(screen.getByRole('button', { name: 'Excluir' })).toHaveAttribute('type', 'button')
  })

  it('respects an explicit type prop', () => {
    render(<ActionIconButton type="submit" aria-label="Salvar" />)
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveAttribute('type', 'submit')
  })

  it('fires onClick', async () => {
    const onClick = vi.fn()
    render(<ActionIconButton aria-label="Ação" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Ação' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it.each(['default', 'danger', 'success', 'warning'] as const)(
    'renders the %s tone without crashing',
    (tone) => {
      render(<ActionIconButton tone={tone} aria-label={`tone-${tone}`} />)
      expect(screen.getByRole('button', { name: `tone-${tone}` })).toBeInTheDocument()
    },
  )
})
