import { fireEvent, render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

vi.mock('@/lib/brazil-timezone', () => ({
  brazilCurrentIsoMonth: () => '2026-06',
}))

vi.mock('@/components/common/MonthPickerInput', () => ({
  MonthPickerInput: ({
    value,
    onValueChange,
    className,
  }: {
    value: string
    onValueChange: (v: string) => void
    className?: string
  }) => (
    <input
      type="month"
      data-testid="month-picker"
      value={value}
      className={className}
      onChange={(e) => onValueChange(e.target.value)}
    />
  ),
}))

import { ProcedureMarginsSection } from '@/features/finance/components/ProcedureMarginsSection'
import type { ProcedureMarginsState } from '@/features/finance/hooks/useProcedureMargins'
import type { ProcedureMarginsResponse } from '@/features/finance/types/finance.types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const idleState: ProcedureMarginsState = {
  data: null,
  isLoading: false,
  isPlanBlocked: false,
  error: null,
}

const loadingState: ProcedureMarginsState = {
  ...idleState,
  isLoading: true,
}

const planBlockedState: ProcedureMarginsState = {
  ...idleState,
  isPlanBlocked: true,
}

const errorState: ProcedureMarginsState = {
  ...idleState,
  error: 'Falha ao carregar margens.',
}

const serviceA = {
  serviceId: 'svc-1',
  serviceName: 'Clareamento dental',
  totalAppointments: 20,
  completedAppointments: 18,
  canceledOrNoShowCount: 2,
  grossRevenueCents: 1800000,
  estimatedDirectCostCents: null,
  estimatedProfitCents: null,
  marginPercent: null,
  avgRevenueCents: 100000,
  status: 'HEALTHY' as const,
}

const serviceB = {
  serviceId: 'svc-2',
  serviceName: 'Ortodontia',
  totalAppointments: 35,
  completedAppointments: 30,
  canceledOrNoShowCount: 5,
  grossRevenueCents: 3000000,
  estimatedDirectCostCents: null,
  estimatedProfitCents: null,
  marginPercent: null,
  avgRevenueCents: 100000,
  status: 'ATTENTION' as const,
}

const mockData: ProcedureMarginsResponse = {
  period: { from: '2026-06-01', to: '2026-06-30' },
  items: [serviceA, serviceB],
  totals: {
    totalAppointments: 55,
    completedAppointments: 48,
    grossRevenueCents: 4800000,
    estimatedDirectCostCents: null,
    estimatedProfitCents: null,
    marginPercent: null,
  },
  costDataAvailable: false,
  limitation: null,
}

const emptyData: ProcedureMarginsResponse = {
  ...mockData,
  items: [],
  totals: {
    totalAppointments: 0,
    completedAppointments: 0,
    grossRevenueCents: 0,
    estimatedDirectCostCents: null,
    estimatedProfitCents: null,
    marginPercent: null,
  },
}

const successState: ProcedureMarginsState = {
  ...idleState,
  data: mockData,
}

const emptySuccessState: ProcedureMarginsState = {
  ...idleState,
  data: emptyData,
}

function renderSection(state: ProcedureMarginsState = idleState, onLoad = vi.fn()) {
  return { onLoad, ...render(<ProcedureMarginsSection state={state} onLoad={onLoad} />) }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProcedureMarginsSection', () => {
  // ── Header ─────────────────────────────────────────────────────────────────

  it('renders the title', () => {
    renderSection()
    expect(screen.getByText('Margem por procedimento')).toBeInTheDocument()
  })

  it('renders the new premium description', () => {
    renderSection()
    expect(
      screen.getByText(
        'Compare receita, custo estimado e margem para descobrir quais procedimentos mais aumentam o lucro da clínica.',
      ),
    ).toBeInTheDocument()
  })

  // ── Idle state ─────────────────────────────────────────────────────────────

  it('renders idle prompt when no data', () => {
    renderSection(idleState)
    expect(screen.getByText('Análise não carregada')).toBeInTheDocument()
  })

  it('renders load button in idle state', () => {
    renderSection(idleState)
    expect(screen.getByRole('button', { name: /carregar análise/i })).toBeInTheDocument()
  })

  it('action wrapper has mobile-safe w-full class', () => {
    renderSection(idleState)
    const btn = screen.getByRole('button', { name: /carregar análise/i })
    const wrapper = btn.parentElement
    expect(wrapper?.className).toMatch(/w-full/)
  })

  it('load button calls onLoad with selected month', () => {
    const { onLoad } = renderSection(idleState)
    fireEvent.click(screen.getByRole('button', { name: /carregar análise/i }))
    expect(onLoad).toHaveBeenCalledWith({ month: '2026-06' })
  })

  // ── Loading state ──────────────────────────────────────────────────────────

  it('renders loading spinner when isLoading', () => {
    renderSection(loadingState)
    expect(screen.getByText('Calculando margens por procedimento…')).toBeInTheDocument()
  })

  it('loading state has role="status" for screen readers', () => {
    renderSection(loadingState)
    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('footer has flex-col class for mobile wrapping', () => {
    const { container } = renderSection(successState)
    const footer = container.querySelector('.border-t.border-border.pt-4')
    expect(footer?.className).toMatch(/flex-col/)
  })

  // ── Plan blocked ───────────────────────────────────────────────────────────

  it('renders plan-blocked message', () => {
    renderSection(planBlockedState)
    expect(screen.getByText(/Análise por procedimento disponível nos planos/)).toBeInTheDocument()
  })

  it('plan-blocked state has a bordered container', () => {
    const { container } = renderSection(planBlockedState)
    expect(container.querySelector('.rounded-lg.border')).toBeInTheDocument()
  })

  // ── Error state ────────────────────────────────────────────────────────────

  it('renders error message when error is set', () => {
    renderSection(errorState)
    expect(screen.getByText('Não foi possível carregar os dados')).toBeInTheDocument()
    expect(screen.getByText('Falha ao carregar margens.')).toBeInTheDocument()
  })

  it('error state has a retry link', () => {
    renderSection(errorState)
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
  })

  // ── Success state ──────────────────────────────────────────────────────────

  it('renders service names in success state', () => {
    renderSection(successState)
    expect(screen.getAllByText('Clareamento dental').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Ortodontia').length).toBeGreaterThan(0)
  })

  it('renders summary metric labels', () => {
    renderSection(successState)
    expect(screen.getByText('Agendamentos')).toBeInTheDocument()
    expect(screen.getByText('Concluídos')).toBeInTheDocument()
    expect(screen.getByText('Receita bruta')).toBeInTheDocument()
  })

  it('renders insight card labels for top revenue and volume', () => {
    renderSection(successState)
    expect(screen.getByText('Maior receita')).toBeInTheDocument()
    expect(screen.getByText('Mais realizado')).toBeInTheDocument()
  })

  it('renders sort control when more than one service', () => {
    renderSection(successState)
    expect(screen.getByLabelText('Ordenar procedimentos')).toBeInTheDocument()
  })

  it('sort control has expected options', () => {
    renderSection(successState)
    const select = screen.getByLabelText('Ordenar procedimentos')
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Receita/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Realizações/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Nome/ })).toBeInTheDocument()
  })

  it('refresh button calls onLoad', () => {
    const { onLoad } = renderSection(successState)
    fireEvent.click(screen.getByRole('button', { name: /atualizar/i }))
    expect(onLoad).toHaveBeenCalledWith({ month: '2026-06' })
  })

  // ── Empty service list ─────────────────────────────────────────────────────

  it('renders dashed empty state when data has zero items', () => {
    const { container } = renderSection(emptySuccessState)
    expect(container.querySelector('.border-dashed')).toBeInTheDocument()
  })

  it('renders empty state message when no procedures found', () => {
    renderSection(emptySuccessState)
    expect(
      screen.getByText('Nenhum procedimento identificado no período selecionado.'),
    ).toBeInTheDocument()
  })

  // ── Service name overflow safety ───────────────────────────────────────────

  it('service name span has truncate class for overflow safety', () => {
    const { container } = renderSection(successState)
    const serviceList = container.querySelector('[data-testid="service-list"]')
    expect(serviceList).toBeInTheDocument()
    const truncated = serviceList!.querySelector('.truncate')
    expect(truncated).toBeInTheDocument()
  })
})
