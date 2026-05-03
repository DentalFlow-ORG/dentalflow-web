import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

type PaginationProps = {
  page: number
  totalPages: number
  filteredCount: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
}

export function Pagination({
  page,
  totalPages,
  filteredCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
}: PaginationProps) {
  if (totalPages <= 1 && !onPageSizeChange) return null

  const from = filteredCount === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, filteredCount)

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4', className)}>
      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Por página</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                onPageSizeChange(Number(v))
                onPageChange(1)
              }}
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filteredCount > 0 && (
          <p className="text-xs text-slate-500">
            {from}–{to} de {filteredCount} resultado{filteredCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="min-w-18 text-center text-xs font-medium text-slate-600">
            {page} / {totalPages}
          </span>

          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            title="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
