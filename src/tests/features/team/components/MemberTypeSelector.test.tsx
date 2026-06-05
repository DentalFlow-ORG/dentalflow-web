import { fireEvent, render, screen } from '@/test-utils/render-utils'

import { MemberTypeSelector } from '@/features/team/components/MemberTypeSelector'

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('MemberTypeSelector — rendering', () => {
  it('renders both role options', () => {
    render(<MemberTypeSelector value="DENTIST" onChange={vi.fn()} />)
    expect(screen.getByText('Profissional')).toBeInTheDocument()
    expect(screen.getByText('Assistente')).toBeInTheDocument()
  })

  it('renders the description for each option', () => {
    render(<MemberTypeSelector value="DENTIST" onChange={vi.fn()} />)
    expect(screen.getByText(/agenda própria/i)).toBeInTheDocument()
    expect(screen.getByText(/suporte operacional/i)).toBeInTheDocument()
  })

  it('renders two clickable buttons', () => {
    render(<MemberTypeSelector value="DENTIST" onChange={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('exposes the selected option state to assistive technology', () => {
    render(<MemberTypeSelector value="DENTIST" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: /profissional/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /assistente/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})

// ── Selection ─────────────────────────────────────────────────────────────────

describe('MemberTypeSelector — selection', () => {
  it('calls onChange with "DENTIST" when Profissional is clicked', () => {
    const onChange = vi.fn()
    render(<MemberTypeSelector value="ASSISTANT" onChange={onChange} />)
    fireEvent.click(screen.getByText('Profissional'))
    expect(onChange).toHaveBeenCalledWith('DENTIST')
  })

  it('calls onChange with "ASSISTANT" when Assistente is clicked', () => {
    const onChange = vi.fn()
    render(<MemberTypeSelector value="DENTIST" onChange={onChange} />)
    fireEvent.click(screen.getByText('Assistente'))
    expect(onChange).toHaveBeenCalledWith('ASSISTANT')
  })

  it('calls onChange exactly once per click', () => {
    const onChange = vi.fn()
    render(<MemberTypeSelector value="DENTIST" onChange={onChange} />)
    fireEvent.click(screen.getByText('Assistente'))
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})

// ── Visual selection state ────────────────────────────────────────────────────

describe('MemberTypeSelector — visual state', () => {
  it('applies selected styling to the active option button', () => {
    render(<MemberTypeSelector value="DENTIST" onChange={vi.fn()} />)
    const profissionalBtn = screen.getByText('Profissional').closest('button')
    expect(profissionalBtn?.className).toContain('border-primary')
  })

  it('does not apply selected styling to the inactive option', () => {
    render(<MemberTypeSelector value="DENTIST" onChange={vi.fn()} />)
    const assistenteBtn = screen.getByText('Assistente').closest('button')
    expect(assistenteBtn?.className).not.toContain('bg-blue-50')
  })
})
