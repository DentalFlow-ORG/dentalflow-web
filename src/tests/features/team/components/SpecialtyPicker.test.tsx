import { fireEvent, render, screen } from '@/test-utils/render-utils'

import { SpecialtyPicker } from '@/features/team/components/SpecialtyPicker'
import type { Specialty } from '@/features/team/types/team.types'

// ── Factories ─────────────────────────────────────────────────────────────────

function makeSpecialty(overrides: Partial<Specialty> = {}): Specialty {
  return {
    id: 'spec-1',
    name: 'Ortodontia',
    slug: 'ortodontia',
    ...overrides,
  }
}

const SPECIALTIES: Specialty[] = [
  makeSpecialty({ id: 'spec-1', name: 'Ortodontia', slug: 'ortodontia' }),
  makeSpecialty({ id: 'spec-2', name: 'Endodontia', slug: 'endodontia' }),
  makeSpecialty({ id: 'spec-3', name: 'Implantodontia', slug: 'implantodontia' }),
]

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('SpecialtyPicker — rendering', () => {
  it('renders a chip for each specialty', () => {
    render(<SpecialtyPicker specialties={SPECIALTIES} selected={[]} onChange={vi.fn()} />)
    expect(screen.getByText('Ortodontia')).toBeInTheDocument()
    expect(screen.getByText('Endodontia')).toBeInTheDocument()
    expect(screen.getByText('Implantodontia')).toBeInTheDocument()
  })

  it('shows the empty state message when specialties list is empty', () => {
    render(<SpecialtyPicker specialties={[]} selected={[]} onChange={vi.fn()} />)
    expect(screen.getByText(/nenhuma especialidade disponível/i)).toBeInTheDocument()
  })

  it('renders buttons for each specialty', () => {
    render(<SpecialtyPicker specialties={SPECIALTIES} selected={[]} onChange={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })
})

// ── Toggle selection ──────────────────────────────────────────────────────────

describe('SpecialtyPicker — toggle selection', () => {
  it('calls onChange with the id added when an unselected chip is clicked', () => {
    const onChange = vi.fn()
    render(<SpecialtyPicker specialties={SPECIALTIES} selected={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('Ortodontia'))
    expect(onChange).toHaveBeenCalledWith(['spec-1'])
  })

  it('calls onChange with the id removed when a selected chip is clicked', () => {
    const onChange = vi.fn()
    render(
      <SpecialtyPicker
        specialties={SPECIALTIES}
        selected={['spec-1', 'spec-2']}
        onChange={onChange}
      />,
    )
    fireEvent.click(screen.getByText('Ortodontia'))
    expect(onChange).toHaveBeenCalledWith(['spec-2'])
  })

  it('preserves existing selections when a new chip is clicked', () => {
    const onChange = vi.fn()
    render(
      <SpecialtyPicker
        specialties={SPECIALTIES}
        selected={['spec-2']}
        onChange={onChange}
      />,
    )
    fireEvent.click(screen.getByText('Ortodontia'))
    expect(onChange).toHaveBeenCalledWith(['spec-2', 'spec-1'])
  })
})

// ── Disabled state ────────────────────────────────────────────────────────────

describe('SpecialtyPicker — disabled', () => {
  it('disables all buttons when disabled prop is true', () => {
    render(
      <SpecialtyPicker
        specialties={SPECIALTIES}
        selected={[]}
        onChange={vi.fn()}
        disabled
      />,
    )
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  it('does not call onChange when a button is clicked while disabled', () => {
    const onChange = vi.fn()
    render(
      <SpecialtyPicker
        specialties={SPECIALTIES}
        selected={[]}
        onChange={onChange}
        disabled
      />,
    )
    fireEvent.click(screen.getByText('Ortodontia'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
