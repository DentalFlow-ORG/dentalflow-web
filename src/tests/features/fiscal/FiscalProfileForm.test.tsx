import { act, fireEvent, render, screen, waitFor } from '@/test-utils/render-utils'
import { useState } from 'react'
import { vi } from 'vitest'

vi.mock('@/services/cep/cep.service', async () => {
  const actual = await vi.importActual<typeof import('@/services/cep/cep.service')>(
    '@/services/cep/cep.service',
  )
  return {
    ...actual,
    fetchAddressByCep: vi.fn(),
  }
})

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string
    onValueChange: (v: string) => void
    children: React.ReactNode
  }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}))

import { FiscalProfileForm } from '@/features/fiscal/components/FiscalProfileForm'
import type { FiscalProfilePayload } from '@/features/fiscal/types/fiscal.types'
import { CepNotFoundError, fetchAddressByCep } from '@/services/cep/cep.service'

const mockFetchAddressByCep = fetchAddressByCep as ReturnType<typeof vi.fn>

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
    ...overrides,
  }
}

const VALID_ADDRESS = {
  addressZipCode: '01310-100',
  addressStreet: 'Av. Paulista',
  addressNumber: '1000',
  addressNeighborhood: 'Bela Vista',
  addressCity: 'São Paulo',
  addressState: 'SP',
} satisfies Partial<FiscalProfilePayload>

// Keeps the form state like a real container so user edits flow back as props.
function renderStatefulForm(
  initial: FiscalProfilePayload,
  onChangeSpy: (form: FiscalProfilePayload) => void = vi.fn(),
) {
  function Form() {
    const [form, setForm] = useState(initial)
    return (
      <FiscalProfileForm
        form={form}
        onChange={(next) => {
          onChangeSpy(next)
          setForm(next)
        }}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />
    )
  }
  return render(<Form />)
}

function typeCep(value: string) {
  fireEvent.change(screen.getByLabelText('CEP'), { target: { value } })
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
  it('renders CEP field', () => {
    renderForm()
    expect(screen.getByLabelText('CEP')).toBeInTheDocument()
  })

  it('renders Rua field', () => {
    renderForm()
    expect(screen.getByLabelText('Rua')).toBeInTheDocument()
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

  it('calls onSubmit when all required fields are valid', () => {
    const onSubmit = vi.fn()
    renderForm({
      onSubmit,
      form: makeForm({
        legalName: 'Clínica Ltda',
        documentNumber: '11.222.333/0001-81',
        ...VALID_ADDRESS,
      }),
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar dados fiscais/ }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('does not call onSubmit when required fields are empty', () => {
    const onSubmit = vi.fn()
    renderForm({ onSubmit })
    fireEvent.click(screen.getByRole('button', { name: /Salvar dados fiscais/ }))
    expect(onSubmit).not.toHaveBeenCalled()
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

// ── Field validation ──────────────────────────────────────────────────────────

describe('FiscalProfileForm — field validation', () => {
  function clickSave() {
    fireEvent.click(screen.getByRole('button', { name: /Salvar dados fiscais/ }))
  }

  it('shows "Informe a razão social." when legalName is empty', () => {
    renderForm()
    clickSave()
    expect(screen.getByText('Informe a razão social.')).toBeInTheDocument()
  })

  it('saves a draft with only the legal name, leaving CNPJ, CEP and UF blank', () => {
    const onSubmit = vi.fn()
    renderForm({ onSubmit, form: makeForm({ legalName: 'Clínica Ltda' }) })
    clickSave()
    expect(onSubmit).toHaveBeenCalledOnce()
    expect(screen.queryByText('Informe um CNPJ válido com 14 dígitos.')).not.toBeInTheDocument()
    expect(screen.queryByText('Informe um CEP com 8 dígitos.')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Informe uma sigla de estado válida (ex: SP, RJ).'),
    ).not.toBeInTheDocument()
  })

  it('shows "Informe um CNPJ válido com 14 dígitos." when documentNumber has fewer digits', () => {
    renderForm({ form: makeForm({ documentNumber: '12.345.678/0001' }) })
    clickSave()
    expect(screen.getByText('Informe um CNPJ válido com 14 dígitos.')).toBeInTheDocument()
  })

  it('shows "Informe um CEP com 8 dígitos." when zip has fewer digits', () => {
    renderForm({ form: makeForm({ addressZipCode: '01310' }) })
    clickSave()
    expect(screen.getByText('Informe um CEP com 8 dígitos.')).toBeInTheDocument()
  })

  it('shows "Informe uma sigla de estado válida (ex: SP, RJ)." when state has 1 letter', () => {
    renderForm({ form: makeForm({ addressState: 'S' }) })
    clickSave()
    expect(screen.getByText('Informe uma sigla de estado válida (ex: SP, RJ).')).toBeInTheDocument()
  })

  it('shows issRate error for value outside 0-100 range', () => {
    renderForm({ form: makeForm({ issRate: 150 }) })
    clickSave()
    expect(screen.getByText(/alíquota válida/i)).toBeInTheDocument()
  })

  it('error messages render as role=alert', () => {
    renderForm()
    clickSave()
    const alerts = screen.getAllByRole('alert')
    expect(alerts.length).toBeGreaterThan(0)
  })

  it('invalid legalName input has aria-invalid=true', () => {
    renderForm()
    clickSave()
    expect(screen.getByLabelText('Razão social')).toHaveAttribute('aria-invalid', 'true')
  })

  it('invalid CNPJ input has aria-invalid=true', () => {
    renderForm({ form: makeForm({ documentNumber: '12.345.678/0001' }) })
    clickSave()
    expect(screen.getByLabelText('CNPJ')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not flag issRate as invalid when it is 0', () => {
    const onSubmit = vi.fn()
    renderForm({
      onSubmit,
      form: makeForm({
        legalName: 'Clínica Ltda',
        documentNumber: '11.222.333/0001-81',
        ...VALID_ADDRESS,
        issRate: 0,
      }),
    })
    clickSave()
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('does not flag issRate as invalid when it is null', () => {
    const onSubmit = vi.fn()
    renderForm({
      onSubmit,
      form: makeForm({
        legalName: 'Clínica Ltda',
        documentNumber: '11.222.333/0001-81',
        ...VALID_ADDRESS,
        issRate: null,
      }),
    })
    clickSave()
    expect(onSubmit).toHaveBeenCalledOnce()
  })
})

// ── Remaining field onChange wiring ────────────────────────────────────────────

describe('FiscalProfileForm — remaining onChange wiring', () => {
  it('calls onChange when tradeName changes', () => {
    const onChange = vi.fn()
    renderForm({ onChange })
    fireEvent.change(screen.getByLabelText(/Nome fantasia/), { target: { value: 'Sorriso' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ tradeName: 'Sorriso' }))
  })

  it('calls onChange when municipalRegistration changes', () => {
    const onChange = vi.fn()
    renderForm({ onChange })
    fireEvent.change(screen.getByLabelText(/Inscrição municipal/), { target: { value: '123' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ municipalRegistration: '123' }))
  })

  it('calls onChange when stateRegistration changes', () => {
    const onChange = vi.fn()
    renderForm({ onChange })
    fireEvent.change(screen.getByLabelText(/Inscrição estadual/), { target: { value: '456' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ stateRegistration: '456' }))
  })

  it('calls onChange when street changes', () => {
    const onChange = vi.fn()
    renderForm({ onChange })
    fireEvent.change(screen.getByLabelText('Rua'), { target: { value: 'Av. Paulista' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ addressStreet: 'Av. Paulista' }),
    )
  })

  it('calls onChange when number changes', () => {
    const onChange = vi.fn()
    renderForm({ onChange })
    fireEvent.change(screen.getByLabelText('Número'), { target: { value: '100' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ addressNumber: '100' }))
  })

  it('calls onChange when complement changes', () => {
    const onChange = vi.fn()
    renderForm({ onChange })
    fireEvent.change(screen.getByLabelText(/Complemento/), { target: { value: 'Sala 2' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ addressComplement: 'Sala 2' }))
  })

  it('calls onChange when neighborhood changes', () => {
    const onChange = vi.fn()
    renderForm({ onChange })
    fireEvent.change(screen.getByLabelText('Bairro'), { target: { value: 'Centro' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ addressNeighborhood: 'Centro' }),
    )
  })

  it('calls onChange when state changes', () => {
    const onChange = vi.fn()
    renderForm({ onChange })
    fireEvent.change(screen.getByLabelText('UF'), { target: { value: 'sp' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ addressState: 'SP' }))
  })

  it('calls onChange when the tax regime select changes', () => {
    const onChange = vi.fn()
    renderForm({ onChange })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'MEI' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ taxRegime: 'MEI' }))
  })

  it('calls onChange when issRate changes to a valid decimal', () => {
    const onChange = vi.fn()
    renderForm({ onChange })
    fireEvent.change(screen.getByLabelText(/Alíquota de ISS/), { target: { value: '2,5' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ issRate: 2.5 }))
  })

  it('sets issRate to null when the field is cleared', () => {
    const onChange = vi.fn()
    renderForm({ onChange, form: makeForm({ issRate: 5 }) })
    fireEvent.change(screen.getByLabelText(/Alíquota de ISS/), { target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ issRate: null }))
  })

  it('calls onChange when service code changes', () => {
    const onChange = vi.fn()
    renderForm({ onChange })
    fireEvent.change(screen.getByLabelText(/Código de serviço municipal/), {
      target: { value: '04.12' },
    })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ serviceCode: '04.12' }))
  })

  it('calls onChange when CNAE changes', () => {
    const onChange = vi.fn()
    renderForm({ onChange })
    fireEvent.change(screen.getByLabelText(/^CNAE/), { target: { value: '8630-5/04' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ cnae: '8630-5/04' }))
  })

  it('strips non-digits when the IBGE code changes', () => {
    const onChange = vi.fn()
    renderForm({ onChange })
    fireEvent.change(screen.getByLabelText(/Código IBGE/), { target: { value: '35a50308' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ cityIbgeCode: '3550308' }))
  })
})

// ── CEP auto-lookup ─────────────────────────────────────────────────────────────

describe('FiscalProfileForm — CEP auto-lookup', () => {
  it('clears the lookup indicator when the postal code is shortened during a pending request', async () => {
    vi.useFakeTimers()
    try {
      let resolve!: (address: unknown) => void
      mockFetchAddressByCep.mockReturnValueOnce(
        new Promise((done) => {
          resolve = done
        }),
      )
      function Form() {
        const [form, setForm] = useState(makeForm())
        return (
          <FiscalProfileForm form={form} onChange={setForm} onCancel={vi.fn()} onSubmit={vi.fn()} />
        )
      }
      render(<Form />)
      typeCep('01310-100')
      await act(async () => vi.advanceTimersByTimeAsync(400))
      const zip = screen.getByLabelText('CEP')
      expect(zip.parentElement?.querySelector('svg')).toBeInTheDocument()
      fireEvent.change(zip, { target: { value: '01310' } })
      expect(zip.parentElement?.querySelector('svg')).not.toBeInTheDocument()
      await act(async () =>
        resolve({ street: 'Endereço antigo', neighborhood: '', city: '', uf: '' }),
      )
      expect(screen.getByLabelText('Rua')).toHaveValue('')
    } finally {
      vi.useRealTimers()
    }
  })
  it('preserves manually entered address fields when CEP data omits them', async () => {
    mockFetchAddressByCep.mockResolvedValueOnce({ street: '', neighborhood: '', city: '', uf: '' })
    const onChange = vi.fn()
    renderStatefulForm(
      makeForm({
        addressStreet: 'Rua digitada',
        addressNeighborhood: 'Bairro digitado',
        addressCity: 'Santos',
        addressState: 'SP',
      }),
      onChange,
    )
    typeCep('01310-100')
    await waitFor(() => expect(mockFetchAddressByCep).toHaveBeenCalledWith('01310-100'))
    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          addressStreet: 'Rua digitada',
          addressNeighborhood: 'Bairro digitado',
          addressCity: 'Santos',
          addressState: 'SP',
        }),
      ),
    )
  })

  it('clears the corrected field error without hiding other validation errors', () => {
    function Form() {
      const [form, setForm] = useState(makeForm({ documentNumber: '12.345.678/0001' }))
      return (
        <FiscalProfileForm form={form} onChange={setForm} onCancel={vi.fn()} onSubmit={vi.fn()} />
      )
    }
    render(<Form />)
    fireEvent.click(screen.getByRole('button', { name: 'Salvar dados fiscais' }))
    expect(screen.getByText('Informe a razão social.')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Razão social'), { target: { value: 'Clínica Dental' } })
    expect(screen.queryByText('Informe a razão social.')).not.toBeInTheDocument()
    expect(screen.getByText('Informe um CNPJ válido com 14 dígitos.')).toBeInTheDocument()
  })

  it('accepts absent optional fiscal fields without invalidating required company data', () => {
    const { props } = renderForm({
      form: makeForm({
        legalName: 'Clínica Dental',
        documentNumber: '11.222.333/0001-81',
        ...VALID_ADDRESS,
        tradeName: undefined,
        municipalRegistration: undefined,
        stateRegistration: undefined,
        addressComplement: undefined,
        serviceCode: undefined,
        cnae: undefined,
        cityIbgeCode: undefined,
      }),
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar dados fiscais' }))
    expect(props.onSubmit).toHaveBeenCalledOnce()
  })
  it.each(['success', 'failure'] as const)(
    'does not overwrite a newer postal-code lookup with a late %s',
    async (outcome) => {
      vi.useFakeTimers()
      try {
        let resolveOld!: (address: unknown) => void
        let rejectOld!: (error: Error) => void
        mockFetchAddressByCep
          .mockReturnValueOnce(
            new Promise((yes, no) => {
              resolveOld = yes
              rejectOld = no
            }),
          )
          .mockResolvedValueOnce({
            street: 'Rua Nova',
            neighborhood: 'Centro',
            city: 'Santos',
            uf: 'SP',
          })
        function Form() {
          const [form, setForm] = useState(makeForm())
          return (
            <FiscalProfileForm
              form={form}
              onChange={setForm}
              onCancel={vi.fn()}
              onSubmit={vi.fn()}
            />
          )
        }
        render(<Form />)
        typeCep('01310-100')
        await act(async () => vi.advanceTimersByTimeAsync(400))
        fireEvent.change(screen.getByLabelText('CEP'), { target: { value: '11010-000' } })
        await act(async () => vi.advanceTimersByTimeAsync(400))
        expect(screen.getByLabelText('Rua')).toHaveValue('Rua Nova')
        await act(async () => {
          if (outcome === 'success')
            resolveOld({
              street: 'Rua Antiga',
              neighborhood: 'Antigo',
              city: 'São Paulo',
              uf: 'SP',
            })
          else rejectOld(new CepNotFoundError())
        })
        expect(screen.getByLabelText('Rua')).toHaveValue('Rua Nova')
        expect(screen.queryByText('CEP não encontrado.')).not.toBeInTheDocument()
      } finally {
        vi.useRealTimers()
      }
    },
  )
  afterEach(() => {
    mockFetchAddressByCep.mockReset()
  })

  it('does not look up an incomplete CEP', async () => {
    renderForm({ form: makeForm({ addressZipCode: '01310' }) })
    await new Promise((r) => setTimeout(r, 500))
    expect(mockFetchAddressByCep).not.toHaveBeenCalled()
  })

  it('debounces the lookup and fills address fields on success', async () => {
    mockFetchAddressByCep.mockResolvedValue({
      cep: '01310-100',
      street: 'Av. Paulista',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      uf: 'SP',
    })
    const onChange = vi.fn()
    renderStatefulForm(makeForm(), onChange)
    typeCep('01310-100')

    await waitFor(() => expect(mockFetchAddressByCep).toHaveBeenCalledWith('01310-100'), {
      timeout: 2000,
    })
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          addressStreet: 'Av. Paulista',
          addressNeighborhood: 'Bela Vista',
          addressCity: 'São Paulo',
          addressState: 'SP',
        }),
      ),
    )
  }, 10000)

  it('shows "CEP não encontrado." when the CEP lookup returns CepNotFoundError', async () => {
    mockFetchAddressByCep.mockRejectedValue(new CepNotFoundError())
    renderStatefulForm(makeForm())
    typeCep('01310-100')
    expect(
      await screen.findByText('CEP não encontrado.', {}, { timeout: 2000 }),
    ).toBeInTheDocument()
  }, 10000)

  it('shows a generic error when the CEP lookup fails for another reason', async () => {
    mockFetchAddressByCep.mockRejectedValue(new Error('network'))
    renderStatefulForm(makeForm())
    typeCep('01310-100')
    expect(
      await screen.findByText('Não foi possível consultar o CEP.', {}, { timeout: 2000 }),
    ).toBeInTheDocument()
  }, 10000)

  it('clears a prior CEP lookup error as soon as the zip field changes again', async () => {
    mockFetchAddressByCep.mockRejectedValue(new CepNotFoundError())
    renderStatefulForm(makeForm())
    typeCep('01310-100')
    expect(
      await screen.findByText('CEP não encontrado.', {}, { timeout: 2000 }),
    ).toBeInTheDocument()

    typeCep('02000-00')
    expect(screen.queryByText('CEP não encontrado.')).not.toBeInTheDocument()
  }, 10000)

  it('does not look up the CEP of a saved profile when the form is loaded', async () => {
    const onChange = vi.fn()
    renderForm({
      onChange,
      form: makeForm({ ...VALID_ADDRESS, addressStreet: 'Rua Salva', addressNumber: '42' }),
    })
    await new Promise((r) => setTimeout(r, 500))
    expect(mockFetchAddressByCep).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Rua')).toHaveValue('Rua Salva')
  })
})

// ── QA remediation: required address, ISS decimals, IBGE, sensitive changes ──

describe('FiscalProfileForm — incomplete draft', () => {
  it('saves a profile with a blank address and lists what issuance still needs', () => {
    const onSubmit = vi.fn()
    renderForm({
      onSubmit,
      form: makeForm({ legalName: 'Clínica Ltda', documentNumber: '11.222.333/0001-81' }),
    })
    expect(screen.getByTestId('fiscal-profile-incomplete')).toHaveTextContent(
      'falta preencher: rua, número, bairro, cidade, UF, CEP.',
    )
    fireEvent.click(screen.getByRole('button', { name: /Salvar dados fiscais/ }))
    expect(onSubmit).toHaveBeenCalledOnce()
    expect(screen.getByLabelText('Rua')).not.toHaveAttribute('aria-invalid')
  })

  it('treats whitespace-only address values as still missing for issuance', () => {
    renderForm({
      form: makeForm({
        legalName: 'Clínica Ltda',
        documentNumber: '11.222.333/0001-81',
        ...VALID_ADDRESS,
        addressCity: '   ',
      }),
    })
    expect(screen.getByTestId('fiscal-profile-incomplete')).toHaveTextContent(
      'falta preencher: cidade.',
    )
  })

  it('hides the incomplete notice once every issuance field is filled', () => {
    renderForm({
      form: makeForm({
        legalName: 'Clínica Ltda',
        documentNumber: '11.222.333/0001-81',
        ...VALID_ADDRESS,
      }),
    })
    expect(screen.queryByTestId('fiscal-profile-incomplete')).not.toBeInTheDocument()
  })

  it('mirrors the backend length limits on text inputs', () => {
    renderForm()
    expect(screen.getByLabelText('Razão social')).toHaveAttribute('maxLength', '150')
    expect(screen.getByLabelText(/Inscrição municipal/)).toHaveAttribute('maxLength', '30')
    expect(screen.getByLabelText(/Complemento/)).toHaveAttribute('maxLength', '100')
  })
})

describe('FiscalProfileForm — ISS rate typing', () => {
  it('keeps the decimal comma while typing so "2,5" can be entered', () => {
    const onChange = vi.fn()
    renderStatefulForm(makeForm(), onChange)
    const input = screen.getByLabelText(/Alíquota de ISS/)
    fireEvent.change(input, { target: { value: '2,' } })
    expect(input).toHaveValue('2,')
    fireEvent.change(input, { target: { value: '2,5' } })
    expect(input).toHaveValue('2,5')
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ issRate: 2.5 }))
  })

  it('limits the rate to two decimal places', () => {
    renderStatefulForm(makeForm())
    const input = screen.getByLabelText(/Alíquota de ISS/)
    fireEvent.change(input, { target: { value: '2,555' } })
    expect(input).toHaveValue('2,55')
  })

  it('accepts a dot as the decimal separator and shows it as a comma', () => {
    renderStatefulForm(makeForm())
    const input = screen.getByLabelText(/Alíquota de ISS/)
    fireEvent.change(input, { target: { value: '3.75' } })
    expect(input).toHaveValue('3,75')
  })

  it('rejects a rate above 100', () => {
    const onSubmit = vi.fn()
    renderForm({
      onSubmit,
      form: makeForm({
        legalName: 'Clínica Ltda',
        documentNumber: '11.222.333/0001-81',
        ...VALID_ADDRESS,
        issRate: 100.01,
      }),
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar dados fiscais/ }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Informe uma alíquota válida entre 0 e 100.')).toBeInTheDocument()
  })

  it('accepts the 100 boundary', () => {
    const onSubmit = vi.fn()
    renderForm({
      onSubmit,
      form: makeForm({
        legalName: 'Clínica Ltda',
        documentNumber: '11.222.333/0001-81',
        ...VALID_ADDRESS,
        issRate: 100,
      }),
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar dados fiscais/ }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })
})

describe('FiscalProfileForm — IBGE code', () => {
  it('rejects a code with fewer than 7 digits', () => {
    const onSubmit = vi.fn()
    renderForm({
      onSubmit,
      form: makeForm({
        legalName: 'Clínica Ltda',
        documentNumber: '11.222.333/0001-81',
        ...VALID_ADDRESS,
        cityIbgeCode: '355030',
      }),
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar dados fiscais/ }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('O código IBGE deve conter 7 dígitos.')).toBeInTheDocument()
  })

  it('accepts a 7-digit code', () => {
    const onSubmit = vi.fn()
    renderForm({
      onSubmit,
      form: makeForm({
        legalName: 'Clínica Ltda',
        documentNumber: '11.222.333/0001-81',
        ...VALID_ADDRESS,
        cityIbgeCode: '3550308',
      }),
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar dados fiscais/ }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('keeps only digits in the IBGE code', () => {
    renderStatefulForm(makeForm())
    const input = screen.getByLabelText(/Código IBGE/)
    fireEvent.change(input, { target: { value: '35a50-308' } })
    expect(input).toHaveValue('3550308')
  })
})

describe('FiscalProfileForm — sensitive changes', () => {
  const savedForm = makeForm({
    legalName: 'Clínica Ltda',
    documentNumber: '11.222.333/0001-81',
    ...VALID_ADDRESS,
  })
  const savedIdentity = {
    documentNumber: '11222333000181',
    taxRegime: 'SIMPLES_NACIONAL' as const,
  }

  it('saves directly when neither the CNPJ nor the tax regime changed', () => {
    const onSubmit = vi.fn()
    render(
      <FiscalProfileForm
        form={{ ...savedForm, tradeName: 'Novo nome fantasia' }}
        savedIdentity={savedIdentity}
        onChange={vi.fn()}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Salvar dados fiscais/ }))
    expect(onSubmit).toHaveBeenCalledOnce()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not ask for confirmation when creating the first profile', () => {
    const onSubmit = vi.fn()
    render(
      <FiscalProfileForm
        form={savedForm}
        savedIdentity={null}
        onChange={vi.fn()}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Salvar dados fiscais/ }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('asks for confirmation before saving a changed CNPJ and cancels safely', () => {
    const onSubmit = vi.fn()
    render(
      <FiscalProfileForm
        form={{ ...savedForm, documentNumber: '11.444.777/0001-61' }}
        savedIdentity={savedIdentity}
        onChange={vi.fn()}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Salvar dados fiscais/ }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('11.222.333/0001-81')
    expect(dialog).toHaveTextContent('11.444.777/0001-61')
    expect(onSubmit).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Revisar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('saves a changed tax regime only after confirmation', () => {
    const onSubmit = vi.fn()
    render(
      <FiscalProfileForm
        form={{ ...savedForm, taxRegime: 'LUCRO_PRESUMIDO' }}
        savedIdentity={savedIdentity}
        onChange={vi.fn()}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Salvar dados fiscais/ }))
    expect(screen.getByRole('dialog')).toHaveTextContent(
      'o regime tributário de Simples Nacional para Lucro Presumido',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alteração' }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })
})
