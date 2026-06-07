import { render, screen } from '@/test-utils/render-utils'
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

  // ── Pre-filled values ──────────────────────────────────────────────────────

  it('displays pre-filled customer name', () => {
    renderForm({ form: { ...emptyForm, customerName: 'Maria Silva' } })
    expect(screen.getByLabelText('Cliente/Paciente')).toHaveValue('Maria Silva')
  })

  it('displays pre-filled service description', () => {
    renderForm({ form: { ...emptyForm, serviceDescription: 'Consulta odontológica' } })
    expect(screen.getByLabelText('Serviço prestado')).toHaveValue('Consulta odontológica')
  })
})
