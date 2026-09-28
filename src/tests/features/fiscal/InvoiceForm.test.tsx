import { fireEvent, render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

vi.mock('@/components/common/DatePickerInput', () => ({
  DatePickerInput: ({
    id,
    value,
    onValueChange,
  }: {
    id: string
    value: string
    onValueChange: (v: string) => void
  }) => <input id={id} type="date" value={value} onChange={(e) => onValueChange(e.target.value)} />,
}))

import { InvoiceForm } from '@/features/fiscal/components/InvoiceForm'
import type { InvoicePayload } from '@/features/fiscal/types/fiscal.types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const requiredFields = {
  customerName: 'Ana Souza',
  serviceDescription: 'Consulta odontológica',
  amountCents: 15000,
}

const emptyForm: InvoicePayload = {
  customerName: '',
  customerDocument: '',
  customerEmail: '',
  customerPhone: '',
  serviceDescription: '',
  serviceCode: '',
  amountCents: 0,
  competenceDate: '2026-06-07',
  notes: '',
}

function renderForm(overrides: { editing?: boolean; form?: InvoicePayload } = {}) {
  return render(
    <InvoiceForm
      form={overrides.form ?? emptyForm}
      editing={overrides.editing ?? false}
      onChange={vi.fn()}
      onCancel={vi.fn()}
      onSubmit={vi.fn()}
    />,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('InvoiceForm', () => {
  it('allows saving a draft with optional customer and service metadata omitted', () => {
    const onSubmit = vi.fn()
    render(
      <InvoiceForm
        form={{
          customerName: 'Ana',
          serviceDescription: 'Consulta',
          amountCents: 15000,
          competenceDate: '2026-06-07',
        }}
        editing={false}
        onChange={vi.fn()}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    )
    for (const id of [
      'customerDocument',
      'customerEmail',
      'customerPhone',
      'serviceCode',
      'notes',
    ]) {
      expect(document.getElementById(id)).toHaveValue('')
    }
    fireEvent.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(onSubmit).toHaveBeenCalledOnce()
    expect(screen.queryByText('Informe um CPF ou CNPJ válido.')).not.toBeInTheDocument()
  })
  // ── Title by mode ──────────────────────────────────────────────────────────

  it('renders "Criar nota fiscal" heading when not editing', () => {
    renderForm()
    expect(screen.getByText('Criar nota fiscal')).toBeInTheDocument()
  })

  it('renders "Editar nota fiscal" heading when editing', () => {
    renderForm({ editing: true })
    expect(screen.getByText('Editar nota fiscal')).toBeInTheDocument()
  })

  it('renders disclaimer about fiscal document validity', () => {
    renderForm()
    expect(
      screen.getByText('Este cadastro é um rascunho interno e não possui validade fiscal.'),
    ).toBeInTheDocument()
  })

  // ── Section headings ───────────────────────────────────────────────────────

  it('renders "Tomador" section heading', () => {
    renderForm()
    expect(screen.getByText('Tomador')).toBeInTheDocument()
  })

  it('renders "Serviço" section heading', () => {
    renderForm()
    expect(screen.getByText('Serviço')).toBeInTheDocument()
  })

  it('renders "Observações" section heading', () => {
    renderForm()
    // Section heading and field label both read "Observações" — assert at least one exists
    expect(screen.getAllByText('Observações').length).toBeGreaterThanOrEqual(1)
  })

  // ── Accessible field labels ────────────────────────────────────────────────

  it('renders accessible label for customer name field', () => {
    renderForm()
    expect(screen.getByLabelText('Cliente/Paciente')).toBeInTheDocument()
  })

  it('renders accessible label for service description field', () => {
    renderForm()
    expect(screen.getByLabelText('Serviço prestado')).toBeInTheDocument()
  })

  it('renders accessible label for amount field', () => {
    renderForm()
    expect(screen.getByLabelText('Valor')).toBeInTheDocument()
  })

  it('renders accessible label for competence date field', () => {
    renderForm()
    expect(screen.getByLabelText('Data de competência')).toBeInTheDocument()
  })

  it('renders accessible label for CPF/CNPJ field', () => {
    renderForm()
    expect(screen.getByLabelText(/CPF\/CNPJ/)).toBeInTheDocument()
  })

  it('renders accessible label for email field', () => {
    renderForm()
    expect(screen.getByLabelText(/E-mail/)).toBeInTheDocument()
  })

  it('renders accessible label for phone field', () => {
    renderForm()
    expect(screen.getByLabelText(/Telefone/)).toBeInTheDocument()
  })

  it('renders accessible label for notes field', () => {
    renderForm()
    expect(screen.getByLabelText(/Observações/)).toBeInTheDocument()
  })

  // ── Action buttons ─────────────────────────────────────────────────────────

  it('renders "Salvar rascunho" submit button when not editing', () => {
    renderForm()
    expect(screen.getByRole('button', { name: 'Salvar rascunho' })).toBeInTheDocument()
  })

  it('renders "Salvar alterações" submit button when editing', () => {
    renderForm({ editing: true })
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeInTheDocument()
  })

  it('renders "Cancelar" button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('footer has border-t separator', () => {
    const { container } = renderForm()
    expect(container.querySelector('.border-t')).toBeInTheDocument()
  })

  it('submit button has full-width mobile class', () => {
    renderForm()
    const submitBtn = screen.getByRole('button', { name: 'Salvar rascunho' })
    expect(submitBtn.className).toContain('w-full')
  })

  it('cancel button has full-width mobile class', () => {
    renderForm()
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' })
    expect(cancelBtn.className).toContain('w-full')
  })

  // ── Pre-filled values ──────────────────────────────────────────────────────

  it('displays pre-filled customer name', () => {
    renderForm({ form: { ...emptyForm, customerName: 'Maria Silva' } })
    expect(screen.getByLabelText('Cliente/Paciente')).toHaveValue('Maria Silva')
  })

  it('displays pre-filled service description', () => {
    renderForm({ form: { ...emptyForm, serviceDescription: 'Consulta odontológica' } })
    expect(screen.getByLabelText('Serviço prestado')).toHaveValue('Consulta odontológica')
  })

  // ── Money input behaviour ──────────────────────────────────────────────────

  it('amount field displays "250,00" when amountCents is 25000', () => {
    renderForm({ form: { ...emptyForm, amountCents: 25000 } })
    expect(screen.getByLabelText('Valor')).toHaveValue('250,00')
  })

  it('amount field calls onChange with 9 cents when user types "9"', () => {
    const onChange = vi.fn()
    render(
      <InvoiceForm
        form={emptyForm}
        editing={false}
        onChange={onChange}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText('Valor'), { target: { value: '9' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ amountCents: 9 }))
  })

  it('amount field calls onChange with 90 cents when user types "90"', () => {
    const onChange = vi.fn()
    render(
      <InvoiceForm
        form={emptyForm}
        editing={false}
        onChange={onChange}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText('Valor'), { target: { value: '90' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ amountCents: 90 }))
  })

  // ── Plain field onChange wiring ────────────────────────────────────────────

  it('calls onChange when typing the customer name', () => {
    const onChange = vi.fn()
    render(
      <InvoiceForm
        form={emptyForm}
        editing={false}
        onChange={onChange}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText('Cliente/Paciente'), { target: { value: 'Ana' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ customerName: 'Ana' }))
  })

  it('calls onChange when typing the customer email', () => {
    const onChange = vi.fn()
    render(
      <InvoiceForm
        form={emptyForm}
        editing={false}
        onChange={onChange}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText(/E-mail/), { target: { value: 'a@b.com' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ customerEmail: 'a@b.com' }))
  })

  it('calls onChange when typing the service description', () => {
    const onChange = vi.fn()
    render(
      <InvoiceForm
        form={emptyForm}
        editing={false}
        onChange={onChange}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText('Serviço prestado'), { target: { value: 'Limpeza' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ serviceDescription: 'Limpeza' }),
    )
  })

  it('calls onChange when typing the service code', () => {
    const onChange = vi.fn()
    render(
      <InvoiceForm
        form={emptyForm}
        editing={false}
        onChange={onChange}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText(/código de serviço/i), { target: { value: '04.12' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ serviceCode: '04.12' }))
  })

  it('calls onChange when the competence date changes', () => {
    const onChange = vi.fn()
    render(
      <InvoiceForm
        form={emptyForm}
        editing={false}
        onChange={onChange}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText('Data de competência'), {
      target: { value: '2026-07-01' },
    })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ competenceDate: '2026-07-01' }))
  })

  it('calls onChange when typing notes', () => {
    const onChange = vi.fn()
    render(
      <InvoiceForm
        form={emptyForm}
        editing={false}
        onChange={onChange}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText(/Observações/), { target: { value: 'Nota interna' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ notes: 'Nota interna' }))
  })

  it('formats the document field as CPF/CNPJ while typing', () => {
    const onChange = vi.fn()
    render(
      <InvoiceForm
        form={emptyForm}
        editing={false}
        onChange={onChange}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText(/CPF\/CNPJ/), { target: { value: '12345678909' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ customerDocument: '123.456.789-09' }),
    )
  })

  it('formats the phone field while typing', () => {
    const onChange = vi.fn()
    render(
      <InvoiceForm
        form={emptyForm}
        editing={false}
        onChange={onChange}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText(/Telefone/), { target: { value: '11987654321' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ customerPhone: '(11) 98765-4321' }),
    )
  })

  // ── Cancel ──────────────────────────────────────────────────────────────────

  it('calls onCancel when Cancelar is clicked', () => {
    const onCancel = vi.fn()
    render(
      <InvoiceForm
        form={emptyForm}
        editing={false}
        onChange={vi.fn()}
        onCancel={onCancel}
        onSubmit={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  // ── Submit + validation ─────────────────────────────────────────────────────

  it('calls onSubmit when the form is valid (empty optional fields)', () => {
    const onSubmit = vi.fn()
    render(
      <InvoiceForm
        form={{ ...emptyForm, ...requiredFields }}
        editing={false}
        onChange={vi.fn()}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('calls onSubmit when document and phone are valid', () => {
    const onSubmit = vi.fn()
    render(
      <InvoiceForm
        form={{
          ...emptyForm,
          ...requiredFields,
          customerDocument: '123.456.789-09',
          customerPhone: '(11) 98765-4321',
        }}
        editing={false}
        onChange={vi.fn()}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('blocks submit and shows an error for an invalid document', () => {
    const onSubmit = vi.fn()
    render(
      <InvoiceForm
        form={{ ...emptyForm, customerDocument: '111.111.111-11' }}
        editing={false}
        onChange={vi.fn()}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Informe um CPF ou CNPJ válido.')).toBeInTheDocument()
    expect(screen.getByLabelText(/CPF\/CNPJ/)).toHaveAttribute('aria-invalid', 'true')
  })

  it('blocks submit and shows an error for an invalid phone', () => {
    const onSubmit = vi.fn()
    render(
      <InvoiceForm
        form={{ ...emptyForm, customerPhone: '123' }}
        editing={false}
        onChange={vi.fn()}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Informe um telefone válido com DDD.')).toBeInTheDocument()
  })

  it('clears the document error as soon as the field changes again', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <InvoiceForm
        form={{ ...emptyForm, customerDocument: '111.111.111-11' }}
        editing={false}
        onChange={onChange}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(screen.getByText('Informe um CPF ou CNPJ válido.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/CPF\/CNPJ/), { target: { value: '1' } })
    rerender(
      <InvoiceForm
        form={{ ...emptyForm, customerDocument: '1' }}
        editing={false}
        onChange={onChange}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.queryByText('Informe um CPF ou CNPJ válido.')).not.toBeInTheDocument()
  })
})

describe('InvoiceForm — QA remediation', () => {
  function renderWithSubmit(form: InvoicePayload, props: { isSaving?: boolean } = {}) {
    const onSubmit = vi.fn()
    render(
      <InvoiceForm
        form={form}
        editing={false}
        isSaving={props.isSaving}
        onChange={vi.fn()}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    )
    return onSubmit
  }

  it('requires a competence date before saving', () => {
    const onSubmit = renderWithSubmit({ ...emptyForm, ...requiredFields, competenceDate: '' })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Informe a data de competência.')).toBeInTheDocument()
  })

  it('requires the customer name, service description and a positive amount', () => {
    const onSubmit = renderWithSubmit({
      ...emptyForm,
      customerName: '   ',
      serviceDescription: '',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Informe o nome do cliente ou paciente.')).toBeInTheDocument()
    expect(screen.getByText('Descreva o serviço prestado.')).toBeInTheDocument()
    expect(screen.getByText('Informe um valor maior que zero.')).toBeInTheDocument()
    expect(screen.getByLabelText('Cliente/Paciente')).toHaveAttribute('aria-invalid', 'true')
  })

  it('rejects an invalid optional e-mail with an inline message', () => {
    const onSubmit = renderWithSubmit({
      ...emptyForm,
      ...requiredFields,
      customerEmail: 'ana@',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument()
  })

  it('disables both actions and shows progress while saving', () => {
    const onSubmit = renderWithSubmit({ ...emptyForm, ...requiredFields }, { isSaving: true })
    const save = screen.getByRole('button', { name: /Salvando/ })
    expect(save).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    fireEvent.click(save)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('mirrors the backend length limits', () => {
    renderForm()
    expect(screen.getByLabelText('Cliente/Paciente')).toHaveAttribute('maxLength', '150')
    expect(screen.getByLabelText(/E-mail/)).toHaveAttribute('maxLength', '254')
    expect(screen.getByLabelText('Serviço prestado')).toHaveAttribute('maxLength', '2000')
    expect(screen.getByLabelText(/Código de serviço/)).toHaveAttribute('maxLength', '50')
    expect(screen.getByLabelText(/Observações/)).toHaveAttribute('maxLength', '2000')
  })

  it('renders notes as a multiline field with placeholders on the service fields', () => {
    renderForm()
    expect(screen.getByLabelText(/Observações/).tagName).toBe('TEXTAREA')
    expect(screen.getByLabelText('Serviço prestado')).toHaveAttribute(
      'placeholder',
      'Descreva o serviço prestado...',
    )
    expect(screen.getByLabelText('Valor')).toHaveAttribute('placeholder', 'R$ 0,00')
  })

  it('caps the amount at the backend maximum while typing', () => {
    const onChange = vi.fn()
    render(
      <InvoiceForm
        form={emptyForm}
        editing={false}
        onChange={onChange}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText('Valor'), { target: { value: '99999999999' } })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ amountCents: 999_999_999 }))
  })
})
