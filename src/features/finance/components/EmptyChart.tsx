export function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
      {message}
    </div>
  )
}
