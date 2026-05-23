export function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-sm text-muted-foreground">
      {message}
    </div>
  )
}
