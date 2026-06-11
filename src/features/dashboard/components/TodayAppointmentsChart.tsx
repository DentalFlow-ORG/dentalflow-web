import { Link } from '@tanstack/react-router'
import { Calendar } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts'
import type { PieSectorDataItem } from 'recharts/types/polar/Pie'

import { PanelCard } from '@/components/common/PanelCard'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/features/theme/useTheme'
import { cn } from '@/lib/utils'

import type { ProductivitySummary } from '../types/productivity.types'

type StatusRow = {
  key: string
  label: string
  count: number
  color: string
  darkColor: string
}

const STATUS_CONFIG = [
  { key: 'CONFIRMED', label: 'Confirmadas', color: '#10B981', darkColor: '#00E676' },
  { key: 'PENDING', label: 'Aguardando', color: '#F59E0B', darkColor: '#FFB020' },
  { key: 'COMPLETED', label: 'Realizadas', color: '#6366F1', darkColor: '#38BDF8' },
  { key: 'CANCELED', label: 'Canceladas', color: '#F43F5E', darkColor: '#FF4D6D' },
  { key: 'NO_SHOW', label: 'Não compareceu', color: '#94A3B8', darkColor: '#67E8F9' },
] as const

type Props = {
  today: ProductivitySummary['today']
}

function fmtPct(count: number, total: number): string {
  if (total === 0 || count === 0) return '0%'
  const val = (count / total) * 100
  return `${val.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

type TooltipPayloadEntry = {
  payload: StatusRow & { fill: string }
}

function CustomTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  total: number
}) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  const pct = fmtPct(row.count, total)
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3 shadow-xl">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.fill }} />
        <span className="text-sm font-semibold text-foreground">{row.label}</span>
      </div>
      <p className="text-sm text-muted-foreground">
        {row.count} {row.count === 1 ? 'consulta' : 'consultas'}
      </p>
      <p className="text-xs font-medium text-muted-foreground/70 mt-0.5">{pct} do total</p>
    </div>
  )
}

function ActiveSector(props: PieSectorDataItem) {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill,
  } = props
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={(outerRadius as number) + 9}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      opacity={1}
    />
  )
}

export function TodayAppointmentsChart({ today }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // True on devices that support hover (mouse/trackpad). Computed once — stable.
  const isHoverDevice = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    [],
  )

  // Desktop: hoveredIndex drives activeIndex. selectedIndex stays null.
  // Touch: selectedIndex drives activeIndex. hoveredIndex is ignored.
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const activeIndex = hoveredIndex ?? selectedIndex

  const rows: StatusRow[] = [
    { ...STATUS_CONFIG[0], count: today.appointmentsConfirmed },
    { ...STATUS_CONFIG[1], count: today.appointmentsPending },
    { ...STATUS_CONFIG[2], count: today.appointmentsCompleted },
    { ...STATUS_CONFIG[3], count: today.appointmentsCanceled },
    { ...STATUS_CONFIG[4], count: today.appointmentsNoShow },
  ]

  const total = today.appointmentsTotal
  const pieRows = rows.filter((r) => r.count > 0)

  const sliceColor = (row: StatusRow) => (isDark ? row.darkColor : row.color)

  if (total === 0) {
    return (
      <PanelCard>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Consultas de hoje</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Distribuição por status da agenda
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Calendar className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Nenhuma consulta para hoje.</p>
        </div>
      </PanelCard>
    )
  }

  return (
    <PanelCard>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Consultas de hoje</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Distribuição por status da agenda</p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0" asChild>
          <Link to="/app/agendamentos">Ver agenda</Link>
        </Button>
      </div>

      {/* Chart + legend */}
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
        {/* Donut — select-none + onMouseDown preventDefault remove the desktop
            focus/selection rectangle. onTouchStart preventDefault blocks all touch
            events from reaching Recharts so mobile taps on the chart do nothing. */}
        <div
          className="relative h-[300px] w-[300px] shrink-0 select-none"
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieRows}
                dataKey="count"
                cx="50%"
                cy="50%"
                innerRadius={94}
                outerRadius={126}
                paddingAngle={pieRows.length > 1 ? 2 : 0}
                strokeWidth={0}
                isAnimationActive={true}
                // activeIndex exists at runtime but is missing from Recharts TS types
                {...({ activeIndex: activeIndex ?? undefined } as object)}
                activeShape={ActiveSector}
                onMouseEnter={isHoverDevice ? (_, index) => setHoveredIndex(index) : undefined}
                onMouseLeave={isHoverDevice ? () => setHoveredIndex(null) : undefined}
              >
                {pieRows.map((row) => (
                  <Cell
                    key={row.key}
                    fill={sliceColor(row)}
                    opacity={activeIndex === null || activeIndex === pieRows.indexOf(row) ? 1 : 0.4}
                    style={{ cursor: 'default', outline: 'none' }}
                  />
                ))}
              </Pie>

              {/* Tooltip only meaningful on hover devices */}
              {isHoverDevice && (
                <Tooltip
                  content={<CustomTooltip total={total} />}
                  cursor={false}
                  wrapperStyle={{ zIndex: 50, pointerEvents: 'none' }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>

          {/* Center total — z-10 keeps it above SVG, below tooltip (z-50) */}
          <div
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-4xl font-bold tabular-nums text-foreground leading-none">
              {total}
            </span>
            <span className="mt-1.5 text-xs font-medium text-muted-foreground">Consultas hoje</span>
          </div>
        </div>

        {/* Legend — <li> wraps a <button> so touch users can tap to select */}
        <ul className="w-full space-y-1.5">
          {rows.map((row) => {
            const active = row.count > 0
            const pieIndex = pieRows.findIndex((r) => r.key === row.key)
            const isHighlighted = active && activeIndex === pieIndex
            const isSelected = active && selectedIndex === pieIndex
            const pct = fmtPct(row.count, total)
            const color = sliceColor(row)

            return (
              <li key={row.key}>
                <button
                  type="button"
                  disabled={!active}
                  aria-pressed={isSelected}
                  aria-label={`${row.label}: ${row.count} consultas, ${pct} do total`}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                    isHighlighted && 'bg-muted/60',
                    isSelected && 'bg-muted/70 ring-1',
                    !isHighlighted && !isSelected && 'hover:bg-muted/30',
                    !active && 'cursor-default opacity-40',
                    active && 'cursor-pointer',
                  )}
                  // Hover: highlight matching slice (all devices with a pointer)
                  onMouseEnter={() => {
                    if (!active) return
                    setHoveredIndex(pieIndex)
                  }}
                  // MouseLeave: clear hover; on desktop also clear selection (no persistent state)
                  onMouseLeave={() => {
                    setHoveredIndex(null)
                    if (isHoverDevice) setSelectedIndex(null)
                  }}
                  // Click: toggle selectedIndex on all devices
                  // When deselecting, also clear hoveredIndex so a stuck mobile hover
                  // does not keep the slice visually highlighted after tap-to-deselect.
                  onClick={() => {
                    if (!active) return
                    const isCurrentlySelected = selectedIndex === pieIndex
                    setSelectedIndex(isCurrentlySelected ? null : pieIndex)
                    if (isCurrentlySelected) setHoveredIndex(null)
                  }}
                >
                  {/* Color bar */}
                  <span
                    className="h-7 w-1 shrink-0 rounded-full transition-colors"
                    style={{
                      backgroundColor: active ? color : isDark ? '#334155' : '#e2e8f0',
                    }}
                    aria-hidden="true"
                  />

                  {/* Status label */}
                  <span
                    className={cn(
                      'flex-1 text-left text-sm font-medium',
                      active ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {row.label}
                  </span>

                  {/* Count + percentage pill — tightly grouped */}
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'text-sm font-semibold tabular-nums',
                        active ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {row.count}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                        active ? 'bg-muted' : 'bg-transparent',
                      )}
                      style={{ color: active ? color : undefined }}
                    >
                      {active ? pct : '—'}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </PanelCard>
  )
}
