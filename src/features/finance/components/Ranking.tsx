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
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? (
          <p className="rounded-md bg-muted px-3 py-3 text-sm text-muted-foreground">
            Sem dados no período.
          </p>
        ) : (
          items.slice(0, 5).map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-foreground">{item.label}</span>
                <span className="shrink-0 text-muted-foreground">{formatCurrency(item.amount)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
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
