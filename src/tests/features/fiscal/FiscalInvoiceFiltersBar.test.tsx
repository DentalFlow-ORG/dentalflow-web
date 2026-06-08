import { fireEvent, render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

import { FiscalInvoiceFiltersBar } from '@/features/fiscal/components/FiscalInvoiceFiltersBar'
import type { ServiceInvoiceStatus } from '@/features/fiscal/types/fiscal.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

type Props = {
  customer?: string
  status?: ServiceInvoiceStatus
  to?: string
  onCustomerChange?: (value: string) => void
  onStatusChange?: (value: ServiceInvoiceStatus | undefined) => void
  onToChange?: (value: string) => void
  onClear?: () => void
}

function renderBar(overrides: Props = {}) {
  const props = {
    customer: '',
    status: undefined as ServiceInvoiceStatus | undefined,
    to: '',
    onCustomerChange: vi.fn(),
    onStatusChange: vi.fn(),
    onToChange: vi.fn(),
    onClear: vi.fn(),
    ...overrides,
  }
  render(<FiscalInvoiceFiltersBar {...props} />)
  return props
}

// ── Structure ─────────────────────────────────────────────────────────────────

describe('FiscalInvoiceFiltersBar', () => {
  it('renders "Filtros" section title', () => {
    renderBar()
    expect(screen.getByText('Filtros')).toBeInTheDocument()
  })

  it('renders subtitle copy', () => {
    renderBar()
    expect(
      screen.getByText('Refine os resultados por cliente, status ou competência.'),
    ).toBeInTheDocument()
  })

  it('renders customer text input with placeholder', () => {
    renderBar()
    expect(screen.getByPlaceholderText('Buscar por cliente...')).toBeInTheDocument()
  })

  it('renders status select trigger', () => {
    renderBar()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders "Competência até" field label', () => {
    renderBar()
    expect(screen.getByText('Competência até')).toBeInTheDocument()
  })

  // ── No active filters ──────────────────────────────────────────────────────

  it('does not show any chip when all filters are empty', () => {
    renderBar()
    expect(screen.queryByText(/^Cliente:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/^Status:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/^Competência até:/)).not.toBeInTheDocument()
  })

  it('does not render "Limpar filtros" when no filters are active', () => {
    renderBar()
    expect(screen.queryByRole('button', { name: /Limpar filtros/ })).not.toBeInTheDocument()
  })

  // ── Active filter chips ────────────────────────────────────────────────────

  it('renders customer chip with the customer value', () => {
    renderBar({ customer: 'Maria Souza' })
    expect(screen.getByText('Cliente: Maria Souza')).toBeInTheDocument()
  })

  it('renders status chip using the Portuguese label', () => {
    renderBar({ status: 'DRAFT' })
    expect(screen.getByText('Status: Rascunho')).toBeInTheDocument()
  })

  it('renders status chip using the label for ISSUED', () => {
    renderBar({ status: 'ISSUED' })
    expect(screen.getByText('Status: Emitida')).toBeInTheDocument()
  })

  it('renders competence date chip with formatted date', () => {
    renderBar({ to: '2026-06-07' })
    // formatInvoiceDate formats with pt-BR locale and UTC timezone
    expect(screen.getByText(/Competência até:/)).toBeInTheDocument()
  })

  it('renders all three chips simultaneously when all filters are active', () => {
    renderBar({ customer: 'João', status: 'FAILED', to: '2026-06-01' })
    expect(screen.getByText('Cliente: João')).toBeInTheDocument()
    expect(screen.getByText('Status: Falhou')).toBeInTheDocument()
    expect(screen.getByText(/Competência até:/)).toBeInTheDocument()
  })

  // ── Limpar filtros ─────────────────────────────────────────────────────────

  it('renders "Limpar filtros" button when customer is active', () => {
    renderBar({ customer: 'Ana' })
    expect(screen.getByRole('button', { name: /Limpar filtros/ })).toBeInTheDocument()
  })

  it('renders "Limpar filtros" button when status is active', () => {
    renderBar({ status: 'CANCELED' })
    expect(screen.getByRole('button', { name: /Limpar filtros/ })).toBeInTheDocument()
  })

  it('renders "Limpar filtros" button when to date is active', () => {
    renderBar({ to: '2026-05-01' })
    expect(screen.getByRole('button', { name: /Limpar filtros/ })).toBeInTheDocument()
  })

  it('clicking "Limpar filtros" calls onClear', () => {
    const onClear = vi.fn()
    renderBar({ customer: 'Paulo', onClear })
    fireEvent.click(screen.getByRole('button', { name: /Limpar filtros/ }))
    expect(onClear).toHaveBeenCalledOnce()
  })

  // ── Input callbacks ────────────────────────────────────────────────────────

  it('customer input change fires onCustomerChange with typed value', () => {
    const onCustomerChange = vi.fn()
    renderBar({ onCustomerChange })
    const input = screen.getByPlaceholderText('Buscar por cliente...')
    fireEvent.change(input, { target: { value: 'Lucas' } })
    expect(onCustomerChange).toHaveBeenCalledWith('Lucas')
  })
})
