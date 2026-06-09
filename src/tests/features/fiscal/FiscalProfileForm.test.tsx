import { fireEvent, render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

import { FiscalProfileForm } from '@/features/fiscal/components/FiscalProfileForm'
import type { FiscalProfilePayload } from '@/features/fiscal/types/fiscal.types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeForm(overrides: Partial<FiscalProfilePayload> = {}): FiscalProfilePayload {
  return {
    legalName: '',
    tradeName: '',
    documentType: 'CNPJ',
    documentNumber: '',
    municipalRegistration: '',
    stateRegistration: '',
    taxRegime: 'SIMPLES_NACIONAL',
    specialTaxRegime: '',
    serviceCode: '',
    cnae: '',
    issRate: null,
    addressStreet: '',
    addressNumber: '',
    addressComplement: '',
    addressNeighborhood: '',
    addressCity: '',
    addressState: '',
    addressZipCode: '',
    cityIbgeCode: '',
    fiscalProvider: 'LOCAL',
    fiscalProviderMode: 'LOCAL',
    ...overrides,
  }
}

function renderForm(
  overrides: {
    form?: FiscalProfilePayload
    isSaving?: boolean
    onSubmit?: () => void
    onCancel?: () => void
    onChange?: (form: FiscalProfilePayload) => void
  } = {},
) {
  const props = {
    form: makeForm(),
    onChange: vi.fn(),
    onCancel: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  }
  const result = render(<FiscalProfileForm {...props} />)
  return { ...result, props }
}

// ── Section headings ──────────────────────────────────────────────────────────

describe('FiscalProfileForm — section headings', () => {
  it('renders "Dados da empresa" section heading', () => {
    renderForm()
    expect(screen.getByText('Dados da empresa')).toBeInTheDocument()
  })

  it('renders "Endereço fiscal" section heading', () => {
    renderForm()
    expect(screen.getByText('Endereço fiscal')).toBeInTheDocument()
  })

  it('renders "Informações fiscais" section heading', () => {
    renderForm()
    expect(screen.getByText('Informações fiscais')).toBeInTheDocument()
  })
})

// ── Fields ────────────────────────────────────────────────────────────────────

describe('FiscalProfileForm — fields from Dados da empresa', () => {
  it('renders Razão social field', () => {
    renderForm()
    expect(screen.getByLabelText('Razão social')).toBeInTheDocument()
  })

  it('renders Nome fantasia field', () => {
    renderForm()
    expect(screen.getByLabelText(/Nome fantasia/)).toBeInTheDocument()
  })

  it('renders CNPJ field', () => {
    renderForm()
    expect(screen.getByLabelText('CNPJ')).toBeInTheDocument()
  })

  it('renders Inscrição municipal field', () => {
    renderForm()
    expect(screen.getByLabelText(/Inscrição municipal/)).toBeInTheDocument()
  })

  it('renders Inscrição estadual field', () => {
    renderForm()
    expect(screen.getByLabelText(/Inscrição estadual/)).toBeInTheDocument()
  })
})

describe('FiscalProfileForm — fields from Endereço fiscal', () => {
  it('renders Rua field', () => {
    renderForm()
    expect(screen.getByLabelText('Rua')).toBeInTheDocument()
  })

  it('renders CEP field', () => {
    renderForm()
    expect(screen.getByLabelText('CEP')).toBeInTheDocument()
  })

  it('renders Número field', () => {
    renderForm()
    expect(screen.getByLabelText('Número')).toBeInTheDocument()
  })

  it('renders Complemento field', () => {
    renderForm()
    expect(screen.getByLabelText(/Complemento/)).toBeInTheDocument()
  })

  it('renders Bairro field', () => {
    renderForm()
    expect(screen.getByLabelText('Bairro')).toBeInTheDocument()
  })

  it('renders Cidade field', () => {
    renderForm()
    expect(screen.getByLabelText('Cidade')).toBeInTheDocument()
  })

  it('renders UF field', () => {
    renderForm()
    expect(screen.getByLabelText('UF')).toBeInTheDocument()
  })
})

describe('FiscalProfileForm — fields from Informações fiscais', () => {
  it('renders Regime tributário combobox', () => {
    renderForm()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders Alíquota de ISS field', () => {
    renderForm()
    expect(screen.getByLabelText(/Alíquota de ISS/)).toBeInTheDocument()
  })

  it('renders Código de serviço municipal field', () => {
    renderForm()
    expect(screen.getByLabelText(/Código de serviço municipal/)).toBeInTheDocument()
  })

  it('renders CNAE field', () => {
    renderForm()
    // Field is optional — full accessible label text is "CNAE Opcional"; use regex
    expect(screen.getByLabelText(/^CNAE/)).toBeInTheDocument()
  })

  it('renders Código IBGE field', () => {
    renderForm()
    expect(screen.getByLabelText(/Código IBGE/)).toBeInTheDocument()
  })
})

// ── Pre-filled values ─────────────────────────────────────────────────────────

describe('FiscalProfileForm — prefilled values', () => {
  it('renders prefilled legalName', () => {
    renderForm({ form: makeForm({ legalName: 'Clínica Odonto Ltda' }) })
    expect(screen.getByLabelText('Razão social')).toHaveValue('Clínica Odonto Ltda')
  })

  it('renders prefilled documentNumber', () => {
    renderForm({ form: makeForm({ documentNumber: '12.345.678/0001-90' }) })
    expect(screen.getByLabelText('CNPJ')).toHaveValue('12.345.678/0001-90')
  })

  it('renders prefilled city', () => {
    renderForm({ form: makeForm({ addressCity: 'São Paulo' }) })
    expect(screen.getByLabelText('Cidade')).toHaveValue('São Paulo')
  })

  it('renders prefilled issRate as comma-formatted string', () => {
    renderForm({ form: makeForm({ issRate: 2.5 }) })
    expect(screen.getByLabelText(/Alíquota de ISS/)).toHaveValue('2,5')
  })
})

// ── onChange callbacks ────────────────────────────────────────────────────────

describe('FiscalProfileForm — onChange callbacks', () => {
  it('calls onChange when legalName changes', () => {
    const onChange = vi.fn()
    renderForm({ onChange })
    fireEvent.change(screen.getByLabelText('Razão social'), { target: { value: 'Nova Clínica' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('calls onChange when city changes', () => {
    const onChange = vi.fn()
    renderForm({ onChange })
    fireEvent.change(screen.getByLabelText('Cidade'), { target: { value: 'Campinas' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('calls onChange when CNPJ changes', () => {
    const onChange = vi.fn()
    renderForm({ onChange })
    fireEvent.change(screen.getByLabelText('CNPJ'), { target: { value: '12345678000190' } })
    expect(onChange).toHaveBeenCalled()
  })
})

// ── Disabled state during save ────────────────────────────────────────────────

describe('FiscalProfileForm — disabled during save', () => {
  it('Razão social is disabled when isSaving', () => {
    renderForm({ isSaving: true })
    expect(screen.getByLabelText('Razão social')).toBeDisabled()
  })

  it('CNPJ is disabled when isSaving', () => {
    renderForm({ isSaving: true })
    expect(screen.getByLabelText('CNPJ')).toBeDisabled()
  })

  it('Rua is disabled when isSaving', () => {
    renderForm({ isSaving: true })
    expect(screen.getByLabelText('Rua')).toBeDisabled()
  })

  it('CEP is disabled when isSaving', () => {
    renderForm({ isSaving: true })
    expect(screen.getByLabelText('CEP')).toBeDisabled()
  })

  it('Cidade is disabled when isSaving', () => {
    renderForm({ isSaving: true })
    expect(screen.getByLabelText('Cidade')).toBeDisabled()
  })

  it('Regime tributário combobox is disabled when isSaving', () => {
    renderForm({ isSaving: true })
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('Alíquota de ISS is disabled when isSaving', () => {
    renderForm({ isSaving: true })
    expect(screen.getByLabelText(/Alíquota de ISS/)).toBeDisabled()
  })
})

// ── Actions ───────────────────────────────────────────────────────────────────

describe('FiscalProfileForm — actions', () => {
  it('renders "Salvar dados fiscais" submit button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /Salvar dados fiscais/ })).toBeInTheDocument()
  })

  it('renders "Cancelar" button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('submit button is disabled when isSaving is true', () => {
    renderForm({ isSaving: true })
    expect(screen.getByRole('button', { name: /Salvar dados fiscais/ })).toBeDisabled()
  })

  it('cancel button is disabled when isSaving is true', () => {
    renderForm({ isSaving: true })
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })

  it('shows loading spinner when isSaving is true', () => {
    const { container } = renderForm({ isSaving: true })
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('does not show loading spinner when isSaving is false', () => {
    const { container } = renderForm({ isSaving: false })
    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
  })

  it('calls onSubmit when submit button is clicked', () => {
    const onSubmit = vi.fn()
    renderForm({ onSubmit })
    fireEvent.click(screen.getByRole('button', { name: /Salvar dados fiscais/ }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    renderForm({ onCancel })
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('footer has border-t separator', () => {
    const { container } = renderForm()
    expect(container.querySelector('.border-t')).toBeInTheDocument()
  })

  it('submit button has full-width mobile class', () => {
    renderForm()
    const btn = screen.getByRole('button', { name: /Salvar dados fiscais/ })
    expect(btn.className).toContain('w-full')
  })
})
