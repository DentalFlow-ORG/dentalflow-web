import { cn } from '@/lib/utils'

import { CATEGORY_COLOR_NAMES, CATEGORY_COLORS } from '../constants/finance-display'

export function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          title={CATEGORY_COLOR_NAMES[color] ?? color}
          aria-label={`Selecionar cor: ${CATEGORY_COLOR_NAMES[color] ?? color}`}
          aria-pressed={value === color}
          className={cn(
            'h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
            value === color ? 'border-slate-700 scale-110' : 'border-transparent',
          )}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  )
}
