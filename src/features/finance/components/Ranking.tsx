import { formatCurrency } from '../utils/finance-format'

export function Ranking({
  title,
  items,
}: {
  title: string
  items: Array<{ label: string; amount: number; color: string }>
}) {
  const maxValue = Math.max(1, ...items.map((item) => item.amount))

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? (
          <p className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500">
            Sem dados no período.
          </p>
        ) : (
          items.slice(0, 5).map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-slate-700">{item.label}</span>
                <span className="shrink-0 text-slate-500">{formatCurrency(item.amount)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(2, Math.round((item.amount / maxValue) * 100))}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
