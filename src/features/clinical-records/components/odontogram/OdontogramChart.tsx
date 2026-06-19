import { useIsMobile } from '@/hooks/useIsMobile'

import type { OdontogramTooth as OdontogramToothData } from '../../types/clinical-record.types'
import {
  type DentitionMode,
  LOWER_DECIDUOUS,
  LOWER_TEETH,
  UPPER_DECIDUOUS,
  UPPER_TEETH,
} from '../../utils/odontogram-status-utils'
import { OdontogramTooth } from './OdontogramTooth'

type Props = {
  getTooth: (toothNumber: number) => OdontogramToothData
  selected: number | null
  multiSelected?: Set<number> | null
  readOnly?: boolean
  printMode?: boolean
  /** Defaults to 'permanent' — print container and existing callers are unaffected. */
  dentitionMode?: DentitionMode
  onSelect?: (toothNumber: number) => void
}

type InteractiveProps = {
  getTooth: (toothNumber: number) => OdontogramToothData
  selected: number | null
  multiSelected: Set<number> | null
  readOnly: boolean
  onSelect?: (toothNumber: number) => void
}

export function OdontogramChart({
  getTooth,
  selected,
  multiSelected = null,
  readOnly = false,
  printMode = false,
  dentitionMode = 'permanent',
  onSelect,
}: Props) {
  const isMobile = useIsMobile()

  const upperTeeth = dentitionMode === 'deciduous' ? UPPER_DECIDUOUS : UPPER_TEETH
  const lowerTeeth = dentitionMode === 'deciduous' ? LOWER_DECIDUOUS : LOWER_TEETH

  if (printMode) {
    // Print always uses permanent dentition regardless of active mode
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <PrintArch getTooth={getTooth} selected={selected} multiSelected={multiSelected ?? null} />
      </div>
    )
  }

  const iProps: InteractiveProps = {
    getTooth,
    selected,
    multiSelected: multiSelected ?? null,
    readOnly,
    onSelect,
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {isMobile ? (
        <QuadrantLayout {...iProps} upperTeeth={upperTeeth} lowerTeeth={lowerTeeth} />
      ) : (
        <div className="app-scrollbar overflow-x-auto pb-2">
          <div className="mx-auto w-fit">
            <FullArch teeth={upperTeeth} lower={false} {...iProps} />
            <FullNumberRow teeth={upperTeeth} />
            <div className="my-3 border-t border-dashed border-border" />
            <FullNumberRow teeth={lowerTeeth} />
            <FullArch teeth={lowerTeeth} lower={true} {...iProps} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Desktop full arch ────────────────────────────────────────────────────────
// Uses inline style for gridTemplateColumns so the column count scales with
// the tooth array length (16 for permanent, 10 for deciduous).

type FullArchProps = InteractiveProps & { teeth: number[]; lower?: boolean }

function FullArch({
  teeth,
  lower = false,
  getTooth,
  selected,
  multiSelected,
  readOnly,
  onSelect,
}: FullArchProps) {
  return (
    <div
      className="grid items-center gap-1.5"
      style={{ gridTemplateColumns: `repeat(${teeth.length}, 48px)` }}
    >
      {teeth.map((toothNumber) => (
        <OdontogramTooth
          key={toothNumber}
          toothNumber={toothNumber}
          tooth={getTooth(toothNumber)}
          selected={selected === toothNumber}
          multiSelected={multiSelected?.has(toothNumber) ?? false}
          readOnly={readOnly}
          lower={lower}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

function FullNumberRow({ teeth }: { teeth: number[] }) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${teeth.length}, 48px)` }}>
      {teeth.map((n) => (
        <div
          key={n}
          className="flex h-6 items-center justify-center text-[11px] font-semibold text-muted-foreground"
        >
          {n}
        </div>
      ))}
    </div>
  )
}

// ── Mobile quadrant layout ────────────────────────────────────────────────────
// Column count is derived from teeth.length (8 per quadrant for permanent, 5 for deciduous).

type QuadrantLayoutProps = InteractiveProps & {
  upperTeeth: number[]
  lowerTeeth: number[]
}

type QuadrantSectionProps = InteractiveProps & {
  title: string
  teeth: number[]
  lower: boolean
}

function QuadrantArch({
  teeth,
  lower,
  getTooth,
  selected,
  multiSelected,
  readOnly,
  onSelect,
}: Omit<QuadrantSectionProps, 'title'>) {
  return (
    <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${teeth.length}, 1fr)` }}>
      {teeth.map((toothNumber) => (
        <OdontogramTooth
          key={toothNumber}
          toothNumber={toothNumber}
          tooth={getTooth(toothNumber)}
          selected={selected === toothNumber}
          multiSelected={multiSelected?.has(toothNumber) ?? false}
          readOnly={readOnly}
          lower={lower}
          compact
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

function QuadrantNumberRow({ teeth }: { teeth: number[] }) {
  return (
    <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${teeth.length}, 1fr)` }}>
      {teeth.map((n) => (
        <div
          key={n}
          className="flex h-5 items-center justify-center text-[10px] font-semibold text-muted-foreground"
        >
          {n}
        </div>
      ))}
    </div>
  )
}

function QuadrantSection({
  title,
  teeth,
  lower,
  getTooth,
  selected,
  multiSelected,
  readOnly,
  onSelect,
}: QuadrantSectionProps) {
  const archProps = { teeth, lower, getTooth, selected, multiSelected, readOnly, onSelect }
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">{title}</p>
      {!lower ? (
        <>
          <QuadrantArch {...archProps} />
          <QuadrantNumberRow teeth={teeth} />
        </>
      ) : (
        <>
          <QuadrantNumberRow teeth={teeth} />
          <QuadrantArch {...archProps} />
        </>
      )}
    </div>
  )
}

function QuadrantLayout({ upperTeeth, lowerTeeth, ...iProps }: QuadrantLayoutProps) {
  // Split each arch at the midpoint to get the right and left quadrants
  const halfUpper = upperTeeth.length / 2
  const halfLower = lowerTeeth.length / 2
  const q1 = upperTeeth.slice(0, halfUpper) // upper right
  const q2 = upperTeeth.slice(halfUpper) // upper left
  const q4 = lowerTeeth.slice(0, halfLower) // lower right
  const q3 = lowerTeeth.slice(halfLower) // lower left

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Arcada superior
        </p>
        <QuadrantSection
          {...iProps}
          title="Quadrante 1 — Superior direita"
          teeth={q1}
          lower={false}
        />
        <QuadrantSection
          {...iProps}
          title="Quadrante 2 — Superior esquerda"
          teeth={q2}
          lower={false}
        />
      </div>
      <div className="border-t border-dashed border-border" />
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Arcada inferior
        </p>
        <QuadrantSection
          {...iProps}
          title="Quadrante 4 — Inferior direita"
          teeth={q4}
          lower={true}
        />
        <QuadrantSection
          {...iProps}
          title="Quadrante 3 — Inferior esquerda"
          teeth={q3}
          lower={true}
        />
      </div>
    </div>
  )
}

// ── Print arch — permanent dentition only, 32px compact teeth ────────────────
// Total: 16 × 32px + 15 × 3px gap = 557px — safely fits A4 width.

type PrintArchProps = {
  getTooth: (toothNumber: number) => OdontogramToothData
  selected: number | null
  multiSelected: Set<number> | null
}

function PrintNumberRow({ teeth }: { teeth: number[] }) {
  return (
    <div className="grid grid-cols-[repeat(16,32px)] gap-[3px]">
      {teeth.map((n) => (
        <div
          key={n}
          className="flex h-4 items-center justify-center text-[9px] font-semibold text-slate-500"
        >
          {n}
        </div>
      ))}
    </div>
  )
}

function PrintArch({ getTooth, selected, multiSelected }: PrintArchProps) {
  const renderRow = (teeth: number[], lower: boolean) => (
    <div className="grid grid-cols-[repeat(16,32px)] items-center gap-[3px]">
      {teeth.map((toothNumber) => (
        <OdontogramTooth
          key={toothNumber}
          toothNumber={toothNumber}
          tooth={getTooth(toothNumber)}
          selected={selected === toothNumber}
          multiSelected={multiSelected?.has(toothNumber) ?? false}
          readOnly
          lower={lower}
          printMode
        />
      ))}
    </div>
  )

  return (
    <div>
      {renderRow(UPPER_TEETH, false)}
      <PrintNumberRow teeth={UPPER_TEETH} />
      <div className="my-2 border-t border-dashed border-slate-300" />
      <PrintNumberRow teeth={LOWER_TEETH} />
      {renderRow(LOWER_TEETH, true)}
    </div>
  )
}
