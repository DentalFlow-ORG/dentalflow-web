import { useState } from 'react'

import { brazilCurrentMonthRange } from '@/lib/brazil-timezone'

import type { FinanceFilters } from '../types/finance.types'

const currentPeriod = brazilCurrentMonthRange()

const initialFinanceFilters: FinanceFilters = {
  from: currentPeriod.from,
  to: currentPeriod.to,
  groupBy: 'day',
}

export function useFinanceFilters() {
  const [filters, setFilters] = useState<FinanceFilters>(initialFinanceFilters)
  const [transactionsPage, setTransactionsPage] = useState(1)
  const [transactionsPageSize, setTransactionsPageSize] = useState(20)

  function setFilter<K extends keyof FinanceFilters>(field: K, value: FinanceFilters[K]) {
    if (field === 'from' || field === 'to') {
      setPeriodBoundary(field, value as string)
      return
    }
    setTransactionsPage(1)
    setFilters((prev) => ({ ...prev, [field]: value || undefined }))
  }

  // The period always needs both dates: every finance query and the previous
  // period comparison are computed from them. Clearing a date is ignored, and
  // moving one boundary past the other drags the other along so from <= to.
  function setPeriodBoundary(field: 'from' | 'to', value: string) {
    if (!value) return
    setTransactionsPage(1)
    setFilters((prev) => {
      if (field === 'from') {
        return { ...prev, from: value, to: value > prev.to ? value : prev.to }
      }
      return { ...prev, to: value, from: value < prev.from ? value : prev.from }
    })
  }

  return {
    filters,
    transactionsPage,
    transactionsPageSize,
    setFilter,
    setTransactionsPage,
    setTransactionsPageSize,
  }
}
