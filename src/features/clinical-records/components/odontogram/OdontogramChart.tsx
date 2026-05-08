import { cn } from '@/lib/utils'

import type { OdontogramTooth as OdontogramToothData } from '../../types/clinical-record.types'
import { LOWER_TEETH, UPPER_TEETH } from '../../utils/odontogram-status-utils'
import { OdontogramTooth } from './OdontogramTooth'

type Props = {
  getTooth: (toothNumber: number) => OdontogramToothData
  selected: number | null
  multiSelected?: Set<number> | null
  readOnly?: boolean
  printMode?: boolean
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
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white', printMode ? 'p-3' : 'p-4')}>
      {!printMode && (
        <p className="mb-3 text-xs text-slate-500 sm:hidden">
          Arraste para visualizar todos os dentes.
        </p>
      )}
      <div className="overflow-x-auto pb-2">
        <div className="mx-auto min-w-[820px] max-w-[900px]">
          <DentalArch
            teeth={UPPER_TEETH}
            getTooth={getTooth}
            selected={selected}
            multiSelected={multiSelected}
            readOnly={readOnly}
            printMode={printMode}
            onSelect={onSelect}
          />

          <ToothNumberRow teeth={UPPER_TEETH} />

          <div className="my-3 border-t border-dashed border-slate-300" />

          <ToothNumberRow teeth={LOWER_TEETH} />

          <DentalArch
            teeth={LOWER_TEETH}
            getTooth={getTooth}
            selected={selected}
            multiSelected={multiSelected}
            readOnly={readOnly}
            lower
            printMode={printMode}
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  )
}

type DentalArchProps = {
  teeth: number[]
  getTooth: (toothNumber: number) => OdontogramToothData
  selected: number | null
  multiSelected: Set<number> | null
  readOnly: boolean
  lower?: boolean
  printMode: boolean
  onSelect?: (toothNumber: number) => void
}

function DentalArch({
  teeth,
  getTooth,
  selected,
  multiSelected,
  readOnly,
  lower = false,
  printMode,
  onSelect,
}: DentalArchProps) {
  return (
    <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] items-center gap-1.5">
      {teeth.map((toothNumber) => (
        <OdontogramTooth
          key={toothNumber}
          toothNumber={toothNumber}
          tooth={getTooth(toothNumber)}
          selected={selected === toothNumber}
          multiSelected={multiSelected?.has(toothNumber) ?? false}
          readOnly={readOnly}
          lower={lower}
          printMode={printMode}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

function ToothNumberRow({ teeth }: { teeth: number[] }) {
  return (
    <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1.5">
      {teeth.map((toothNumber) => (
        <div
          key={toothNumber}
          className="flex h-6 items-center justify-center text-[11px] font-semibold text-slate-500"
        >
          {toothNumber}
        </div>
      ))}
    </div>
  )
}
