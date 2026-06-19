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
    setTransactionsPage(1)
    setFilters((prev) => ({ ...prev, [field]: value || undefined }))
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
