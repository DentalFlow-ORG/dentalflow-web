import { useIsMobile } from '@/hooks/useIsMobile'

import type { OdontogramTooth as OdontogramToothData } from '../../types/clinical-record.types'
import { LOWER_TEETH, UPPER_TEETH } from '../../utils/odontogram-status-utils'
import { OdontogramTooth } from './OdontogramTooth'

// FDI quadrant slices — derived from existing arrays, no new numbering
const Q1 = UPPER_TEETH.slice(0, 8) // superior direita: 18–11
const Q2 = UPPER_TEETH.slice(8)    // superior esquerda: 21–28
const Q4 = LOWER_TEETH.slice(0, 8) // inferior direita: 48–41
const Q3 = LOWER_TEETH.slice(8)    // inferior esquerda: 31–38

type Props = {
  getTooth: (toothNumber: number) => OdontogramToothData
  selected: number | null
  multiSelected?: Set<number> | null
  readOnly?: boolean
  printMode?: boolean
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
  onSelect,
}: Props) {
  const isMobile = useIsMobile()

  if (printMode) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <PrintArch
          getTooth={getTooth}
          selected={selected}
          multiSelected={multiSelected ?? null}
        />
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
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {isMobile ? (
        <QuadrantLayout {...iProps} />
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="mx-auto w-fit">
            <FullArch teeth={UPPER_TEETH} lower={false} {...iProps} />
            <FullNumberRow teeth={UPPER_TEETH} />
            <div className="my-3 border-t border-dashed border-slate-300" />
            <FullNumberRow teeth={LOWER_TEETH} />
            <FullArch teeth={LOWER_TEETH} lower={true} {...iProps} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Desktop full arch (48px fixed teeth) ────────────────────────────────────

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
    <div className="grid grid-cols-[repeat(16,48px)] items-center gap-1.5">
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
    <div className="grid grid-cols-[repeat(16,48px)] gap-1.5">
      {teeth.map((n) => (
        <div
          key={n}
          className="flex h-6 items-center justify-center text-[11px] font-semibold text-slate-500"
        >
          {n}
        </div>
      ))}
    </div>
  )
}

// ── Mobile quadrant layout (compact fluid teeth, 8 per row) ─────────────────

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
    <div className="grid grid-cols-8 gap-[3px]">
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
    <div className="grid grid-cols-8 gap-[3px]">
      {teeth.map((n) => (
        <div
          key={n}
          className="flex h-5 items-center justify-center text-[10px] font-semibold text-slate-500"
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
      <p className="mb-1.5 text-[11px] font-medium text-slate-400">{title}</p>
      {!lower ? (
        // Upper: teeth first (crowns face down), numbers below (gum line)
        <>
          <QuadrantArch {...archProps} />
          <QuadrantNumberRow teeth={teeth} />
        </>
      ) : (
        // Lower: numbers first (gum line), teeth below (crowns face up)
        <>
          <QuadrantNumberRow teeth={teeth} />
          <QuadrantArch {...archProps} />
        </>
      )}
    </div>
  )
}

function QuadrantLayout(p: InteractiveProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Arcada superior
        </p>
        <QuadrantSection {...p} title="Quadrante 1 — Superior direita" teeth={Q1} lower={false} />
        <QuadrantSection {...p} title="Quadrante 2 — Superior esquerda" teeth={Q2} lower={false} />
      </div>
      <div className="border-t border-dashed border-slate-300" />
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Arcada inferior
        </p>
        <QuadrantSection {...p} title="Quadrante 4 — Inferior direita" teeth={Q4} lower={true} />
        <QuadrantSection {...p} title="Quadrante 3 — Inferior esquerda" teeth={Q3} lower={true} />
      </div>
    </div>
  )
}

// ── Print arch (32px compact teeth, no interaction, no overflow) ─────────────
// Total width: 16 × 32px + 15 × 3px = 512 + 45 = 557px — safely fits A4

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
