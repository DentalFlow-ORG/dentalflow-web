import userEvent from '@testing-library/user-event'
import { FileText } from 'lucide-react'

import { render, screen } from '@/test-utils/render-utils'

import { ClinicalSection } from '@/features/clinical-records/components/ClinicalSection'

describe('ClinicalSection', () => {
  it('renders the title and children', () => {
    render(
      <ClinicalSection id="anamnesis" title="Anamnese" expanded onToggle={vi.fn()}>
        <p>Conteúdo da seção</p>
      </ClinicalSection>,
    )
    expect(screen.getByText('Anamnese')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo da seção')).toBeInTheDocument()
  })

  it('marks the trigger as expanded/collapsed via aria-expanded', () => {
    const { rerender } = render(
      <ClinicalSection id="anamnesis" title="Anamnese" expanded onToggle={vi.fn()}>
        <p>x</p>
      </ClinicalSection>,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')

    rerender(
      <ClinicalSection id="anamnesis" title="Anamnese" expanded={false} onToggle={vi.fn()}>
        <p>x</p>
      </ClinicalSection>,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('calls onToggle when the trigger is clicked', async () => {
    const onToggle = vi.fn()
    render(
      <ClinicalSection id="anamnesis" title="Anamnese" expanded onToggle={onToggle}>
        <p>x</p>
      </ClinicalSection>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('renders the optional icon', () => {
    const { container } = render(
      <ClinicalSection id="anamnesis" title="Anamnese" icon={FileText} expanded onToggle={vi.fn()}>
        <p>x</p>
      </ClinicalSection>,
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('shows a content-dot indicator when hasContent is true', () => {
    const { container } = render(
      <ClinicalSection id="anamnesis" title="Anamnese" hasContent expanded onToggle={vi.fn()}>
        <p>x</p>
      </ClinicalSection>,
    )
    expect(container.querySelector('.rounded-full')).toBeInTheDocument()
  })

  it('applies a custom className', () => {
    const { container } = render(
      <ClinicalSection
        id="anamnesis"
        title="Anamnese"
        expanded
        onToggle={vi.fn()}
        className="bg-amber-50"
      >
        <p>x</p>
      </ClinicalSection>,
    )
    expect(container.firstChild).toHaveClass('bg-amber-50')
  })
})
