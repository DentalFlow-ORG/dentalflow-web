import { fireEvent, render, screen, within } from '@/test-utils/render-utils'
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

  it('renders empty state message when no procedures found', () => {
    renderSection(emptySuccessState)
    expect(
      screen.getByText('Nenhum procedimento identificado no período selecionado.'),
    ).toBeInTheDocument()
  })
})

// Retain the existing explicit overflow regression alongside behavior tests.
it('service name span has truncate class for overflow safety', () => {
  const { container } = renderSection(successState)
  const serviceList = container.querySelector('[data-testid="service-list"]')
  expect(serviceList).toBeInTheDocument()
  const truncated = serviceList!.querySelector('.truncate')
  expect(truncated).toBeInTheDocument()
})

describe('ProcedureMarginsSection — cost data and ordering', () => {
  const items = [
    {
      ...serviceA,
      serviceName: 'Zircônia',
      totalAppointments: 5,
      marginPercent: 40,
      estimatedDirectCostCents: 1080000,
      estimatedProfitCents: 720000,
    },
    {
      ...serviceB,
      serviceName: 'Aparelho',
      totalAppointments: 10,
      marginPercent: 20,
      estimatedDirectCostCents: 2400000,
      estimatedProfitCents: 600000,
    },
    {
      ...serviceA,
      serviceId: 'svc-3',
      serviceName: 'Consulta',
      totalAppointments: 30,
      grossRevenueCents: 10000,
      marginPercent: -10,
      estimatedDirectCostCents: 11000,
      estimatedProfitCents: -1000,
    },
    {
      ...serviceA,
      serviceId: 'svc-4',
      serviceName: 'Exame',
      totalAppointments: 0,
      completedAppointments: 0,
      grossRevenueCents: 0,
    },
  ]

  function costState(margin = 20): ProcedureMarginsState {
    return {
      ...idleState,
      data: {
        ...mockData,
        items,
        costDataAvailable: true,
        totals: {
          ...mockData.totals,
          estimatedDirectCostCents: 3000000,
          estimatedProfitCents: margin < 0 ? -1000 : 1800000,
          marginPercent: margin,
        },
      },
    }
  }

  it.each([
    ['revenue', ['Aparelho', 'Zircônia', 'Consulta', 'Exame']],
    ['volume', ['Consulta', 'Aparelho', 'Zircônia', 'Exame']],
    ['margin', ['Zircônia', 'Aparelho', 'Consulta', 'Exame']],
    ['name', ['Aparelho', 'Consulta', 'Exame', 'Zircônia']],
  ])('sorts the visible procedures by %s without mutating backend data', (sort, expected) => {
    const before = items.map((item) => item.serviceId)
    renderSection(costState())
    fireEvent.change(screen.getByRole('combobox', { name: 'Ordenar procedimentos' }), {
      target: { value: sort },
    })
    const list = within(screen.getByTestId('service-list'))
    expect(
      list.getAllByText(/^(Aparelho|Zircônia|Consulta|Exame)$/).map((node) => node.textContent),
    ).toEqual(expected)
    expect(items.map((item) => item.serviceId)).toEqual(before)
  })

  it.each([40, 20, -10, 0])('displays valid costs, profit, and %s percent margins', (margin) => {
    renderSection(costState(margin))
    expect(screen.getByText('Custo total est.')).toBeInTheDocument()
    expect(screen.getByText('Maior margem (est.)').parentElement).toHaveTextContent('Zircônia')
    expect(screen.getByText('Mais realizado').parentElement).toHaveTextContent('Consulta')
    expect(screen.getByText('Maior receita').parentElement).toHaveTextContent('Aparelho')
    expect(screen.getByText('Margem (est.)').parentElement).toHaveTextContent(
      `${margin.toFixed(2).replace('.', ',')}%`,
    )
    const list = within(screen.getByTestId('service-list'))
    expect(list.getByText('-10,00%')).toBeInTheDocument()
    expect(list.getByText('Não configurado')).toBeInTheDocument()
    expect(
      list.getAllByText(/Média\/conclusão:/).some((node) => node.textContent?.includes('—')),
    ).toBe(true)
    expect(list.getByText('-R$ 10,00', { exact: false })).toBeInTheDocument()
  })

  it('omits the margin ranking when every margin is missing', () => {
    renderSection({ ...idleState, data: { ...mockData, costDataAvailable: true } })
    expect(screen.queryByText('Margem estimada (%)')).not.toBeInTheDocument()
    expect(screen.queryByText('Maior margem (est.)')).not.toBeInTheDocument()
  })

  it('displays zero margins without hiding procedures or dividing by zero', () => {
    renderSection({
      ...idleState,
      data: {
        ...mockData,
        costDataAvailable: true,
        items: items.map((item) => ({ ...item, marginPercent: 0 })),
      },
    })
    expect(screen.getByText('Margem estimada (%)')).toBeInTheDocument()
    expect(within(screen.getByTestId('service-list')).getAllByText('0,00%')).toHaveLength(4)
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument()
  })
})
