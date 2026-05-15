import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { cn } from '@/lib/utils'
import { useTheme } from '@/features/theme/ThemeProvider'

import type { FinanceSummary } from '../types/finance.types'
import { formatCompactCurrency, formatCurrency, formatDate, formatShortDate } from '../utils/finance-format'
import { EmptyChart } from './EmptyChart'
import { FinanceInsight } from './FinanceInsight'

type ChartSeriesKey = 'income' | 'expenses' | 'netProfit'

const CHART_SERIES: Array<{ key: ChartSeriesKey; label: string; color: string }> = [
  { key: 'income', label: 'Entradas', color: '#10B981' },
  { key: 'expenses', label: 'Saídas', color: '#EF4444' },
  { key: 'netProfit', label: 'Resultado', color: '#6366F1' },
]

const CHART_SERIES_LABELS: Record<string, string> = {
  income: 'Entradas',
  expenses: 'Saídas',
  netProfit: 'Resultado',
}

type ChartTooltipProps = {
  active?: boolean
  payload?: Array<{
    name?: string | number
    value?: number
    color?: string
    payload?: { fullDate?: string }
  }>
  isDark?: boolean
}

function ChartTooltip({ active, payload, isDark }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  const fullDate = (payload[0]?.payload?.fullDate ?? '') as string
  const bgColor = isDark ? '#0f172a' : '#ffffff'
  const borderColor = isDark ? 'rgba(226,232,240,0.18)' : '#E2E8F0'
  const titleColor = isDark ? '#f8fafc' : '#0F172A'
  const labelColor = isDark ? '#cbd5e1' : '#64748B'

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        boxShadow: '0 12px 24px rgb(15 23 42 / 0.12)',
        backgroundColor: bgColor,
        padding: '8px 12px',
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <p style={{ marginBottom: 6, fontWeight: 600, color: titleColor }}>{fullDate}</p>
      {payload.map((entry) => {
        const key = String(entry.name)
        const raw = Number(entry.value)
        const label = CHART_SERIES_LABELS[key] ?? key
        // For netProfit keep the sign (accessibility: minus sign visible for deficits).
        // For income/expenses show absolute (the series label already conveys direction).
        const displayValue =
          key === 'netProfit'
            ? raw > 0
              ? `+${formatCurrency(raw)}`
              : formatCurrency(raw)
            : formatCurrency(Math.abs(raw))

        let valueColor = entry.color ?? titleColor
        if (key === 'netProfit') {
          if (raw > 0) valueColor = '#10B981'
          else if (raw < 0) valueColor = '#EF4444'
          else valueColor = '#94A3B8'
        }

        return (
          <div
            key={key}
            style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 2 }}
          >
            <span style={{ color: labelColor }}>{label}</span>
            <span style={{ color: valueColor, fontWeight: 600 }}>{displayValue}</span>
          </div>
        )
      })}
    </div>
  )
}

export function IncomeExpensesChart({ summary }: { summary: FinanceSummary }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const gridColor = isDark ? 'rgba(226,232,240,0.12)' : '#E2E8F0'
  const tickColor = isDark ? '#cbd5e1' : '#64748B'
  const refLineColor = isDark ? 'rgba(203,213,225,0.25)' : '#CBD5E1'

  const [visibleSeries, setVisibleSeries] = useState<Record<ChartSeriesKey, boolean>>({
    income: true,
    expenses: true,
    netProfit: true,
  })

  if (summary.incomeVsExpenses.length === 0) {
    return <EmptyChart message="Nenhuma movimentação paga neste período." />
  }

  const chartData = summary.incomeVsExpenses.map((item) => ({
    ...item,
    expensesChart: -Math.abs(item.expenses),
    label: formatShortDate(item.date),
    fullDate: formatDate(item.date),
  }))
  const lastPoint = chartData.at(-1)
  const bestPoint = chartData.reduce((best, item) =>
    item.netProfit > best.netProfit ? item : best,
  )
  const worstPoint = chartData.reduce((worst, item) =>
    item.netProfit < worst.netProfit ? item : worst,
  )
  const activeSeriesCount = Object.values(visibleSeries).filter(Boolean).length

  function toggleSeries(series: ChartSeriesKey) {
    setVisibleSeries((current) => {
      if (current[series] && activeSeriesCount === 1) {
        return current
      }

      return {
        ...current,
        [series]: !current[series],
      }
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <FinanceInsight label="Último resultado" value={lastPoint?.netProfit ?? 0} />
        <FinanceInsight label="Melhor período" value={bestPoint.netProfit} detail={bestPoint.label} />
        <FinanceInsight label="Maior pressão" value={worstPoint.netProfit} detail={worstPoint.label} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {CHART_SERIES.map((series) => (
          <button
            key={series.key}
            type="button"
            aria-pressed={visibleSeries[series.key]}
            title={`${visibleSeries[series.key] ? 'Ocultar' : 'Mostrar'} ${series.label}`}
            className={cn(
              'inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors',
              visibleSeries[series.key]
                ? 'border-border bg-card text-foreground shadow-sm'
                : 'border-border/50 bg-muted text-muted-foreground',
            )}
            onClick={() => toggleSeries(series.key)}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: series.color }}
            />
            {series.label}
          </button>
        ))}
      </div>

      <div className="h-[320px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
              minTickGap={18}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
              tickFormatter={formatCompactCurrency}
              width={72}
            />
            <Tooltip
              cursor={{ stroke: refLineColor, strokeDasharray: '4 4' }}
              content={<ChartTooltip isDark={isDark} />}
            />
            <Legend
              iconType="circle"
              formatter={(value) => (
                <span className="text-xs font-medium text-muted-foreground">
                  {CHART_SERIES_LABELS[String(value)] ?? value}
                </span>
              )}
            />
            <ReferenceLine y={0} stroke={refLineColor} />
            {visibleSeries.income && (
              <Area
                type="monotone"
                dataKey="income"
                name="income"
                stroke="#10B981"
                strokeWidth={2.5}
                fill="url(#incomeGradient)"
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
            {visibleSeries.expenses && (
              <Area
                type="monotone"
                dataKey="expensesChart"
                name="expenses"
                stroke="#EF4444"
                strokeWidth={2.5}
                fill="url(#expenseGradient)"
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
            {visibleSeries.netProfit && (
              <Area
                type="monotone"
                dataKey="netProfit"
                name="netProfit"
                stroke="#6366F1"
                strokeWidth={2.5}
                fill="url(#profitGradient)"
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-4 bg-muted px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Data</span>
          <span className="text-right">Entradas</span>
          <span className="text-right">Saídas</span>
          <span className="text-right">Resultado</span>
        </div>
        <div className="app-scrollbar max-h-52 divide-y divide-border overflow-auto">
          {chartData.map((item) => (
            <div key={item.date} className="grid grid-cols-4 px-3 py-2 text-sm">
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="text-right text-emerald-700 dark:text-emerald-400">{formatCurrency(item.income)}</span>
              <span className="text-right text-red-700 dark:text-red-400">{formatCurrency(item.expenses)}</span>
              <span
                className={cn(
                  'text-right font-semibold',
                  item.netProfit >= 0 ? 'text-indigo-700 dark:text-indigo-300' : 'text-red-700 dark:text-red-400',
                )}
              >
                {formatCurrency(item.netProfit)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
