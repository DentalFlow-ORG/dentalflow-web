// Shared layout primitives for appointment drawer sections.
// Used by AppointmentDrawer, AppointmentPaymentSection, and extracted section components.

export function AppointmentDetailsSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="divide-y divide-border">{children}</div>
      </div>
    </div>
  )
}

export function AppointmentDetailsRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{children}</span>
    </div>
  )
}
