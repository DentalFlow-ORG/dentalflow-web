import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { ClinicalSectionField } from '@/features/clinical-records/components/ClinicalSectionField'

describe('ClinicalSectionField', () => {
  it('renders the label and value', () => {
    render(
      <ClinicalSectionField label="Queixa principal" value="Dor de dente" onChange={vi.fn()} />,
    )
    expect(screen.getByLabelText('Queixa principal')).toHaveValue('Dor de dente')
  })

  it('renders the hint when provided', () => {
    render(
      <ClinicalSectionField
        label="Queixa principal"
        hint="Descreva em detalhes"
        value=""
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Descreva em detalhes')).toBeInTheDocument()
  })

  it('calls onChange as the user types', async () => {
    const onChange = vi.fn()
    render(<ClinicalSectionField label="Queixa" value="" onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('Queixa'), 'a')
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('renders as read-only and drops the placeholder', () => {
    render(
      <ClinicalSectionField
        label="Queixa"
        value="Fixo"
        onChange={vi.fn()}
        readOnly
        placeholder="Digite aqui"
      />,
    )
    const field = screen.getByLabelText('Queixa')
    expect(field).toHaveAttribute('readonly')
    expect(field).not.toHaveAttribute('placeholder')
  })

  it('shows the placeholder when not read-only', () => {
    render(<ClinicalSectionField label="Queixa" value="" onChange={vi.fn()} placeholder="Digite" />)
    expect(screen.getByPlaceholderText('Digite')).toBeInTheDocument()
  })

  it('visually hides the label when hideLabel is true', () => {
    const { container } = render(
      <ClinicalSectionField label="Queixa" value="" onChange={vi.fn()} hideLabel />,
    )
    expect(container.querySelector('.sr-only')).toBeInTheDocument()
  })

  it('uses a custom row count', () => {
    render(<ClinicalSectionField label="Queixa" value="" onChange={vi.fn()} rows={8} />)
    expect(screen.getByLabelText('Queixa')).toHaveAttribute('rows', '8')
  })
})

describe('ClinicalSectionField — length limit', () => {
  it('enforces the maxLength on the textarea', () => {
    render(
      <ClinicalSectionField label="Queixa principal" value="" maxLength={500} onChange={vi.fn()} />,
    )
    expect(screen.getByLabelText('Queixa principal')).toHaveAttribute('maxLength', '500')
  })

  it('hides the counter while the text is well below the limit', () => {
    render(
      <ClinicalSectionField
        label="Queixa principal"
        value={'a'.repeat(399)}
        maxLength={500}
        onChange={vi.fn()}
      />,
    )
    expect(screen.queryByText(/caracteres/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Queixa principal')).not.toHaveAttribute('aria-describedby')
  })

  it('shows a counter linked to the field once it nears the limit', () => {
    render(
      <ClinicalSectionField
        label="Queixa principal"
        value={'a'.repeat(400)}
        maxLength={500}
        onChange={vi.fn()}
      />,
    )
    const counter = screen.getByText('400/500 caracteres')
    expect(counter).not.toHaveAttribute('aria-live')
    expect(screen.getByLabelText('Queixa principal')).toHaveAttribute(
      'aria-describedby',
      counter.id,
    )
  })

  it('flags the limit when it is reached', () => {
    render(
      <ClinicalSectionField
        label="Anamnese"
        value={'a'.repeat(10_000)}
        maxLength={10_000}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByText('10.000/10.000 caracteres — limite atingido')).toBeInTheDocument()
  })

  it('does not enforce the limit or show a counter in read-only mode', () => {
    render(
      <ClinicalSectionField
        label="Anamnese"
        value={'a'.repeat(10_000)}
        maxLength={10_000}
        onChange={vi.fn()}
        readOnly
      />,
    )
    expect(screen.getByLabelText('Anamnese')).not.toHaveAttribute('maxLength')
    expect(screen.queryByText(/caracteres/)).not.toBeInTheDocument()
  })
})
