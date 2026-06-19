import { act, renderHook } from '@/test-utils/render-utils'
import { describe, expect, it } from 'vitest'

import { useFinanceFilters } from '@/features/finance/hooks/useFinanceFilters'

// Module-level constants in useFinanceFilters call brazilCurrentMonthRange() once.
// We don't need to mock it — we just assert the shape of the initial values.

describe('useFinanceFilters', () => {
  // ── Initial state ──────────────────────────────────────────────────────────

  it('initializes filters with from, to, and groupBy=day', () => {
    const { result } = renderHook(() => useFinanceFilters())
    expect(result.current.filters.from).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(result.current.filters.to).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(result.current.filters.groupBy).toBe('day')
    expect(result.current.filters.type).toBeUndefined()
    expect(result.current.filters.status).toBeUndefined()
    expect(result.current.filters.categoryId).toBeUndefined()
  })

  it('initializes transactionsPage to 1 and transactionsPageSize to 20', () => {
    const { result } = renderHook(() => useFinanceFilters())
    expect(result.current.transactionsPage).toBe(1)
    expect(result.current.transactionsPageSize).toBe(20)
  })

  // ── setFilter ─────────────────────────────────────────────────────────────

  it('setFilter updates the specified filter field', () => {
    const { result } = renderHook(() => useFinanceFilters())
    act(() => {
      result.current.setFilter('groupBy', 'month')
    })
    expect(result.current.filters.groupBy).toBe('month')
  })

  it('setFilter resets transactionsPage to 1 when any filter changes', () => {
    const { result } = renderHook(() => useFinanceFilters())

    // Advance page first
    act(() => {
      result.current.setTransactionsPage(3)
    })
    expect(result.current.transactionsPage).toBe(3)

    // Changing a filter must reset page
    act(() => {
      result.current.setFilter('groupBy', 'week')
    })
    expect(result.current.transactionsPage).toBe(1)
  })

  it('setFilter treats empty string as undefined (removes the field)', () => {
    const { result } = renderHook(() => useFinanceFilters())

    act(() => {
      result.current.setFilter('type', 'INCOME')
    })
    expect(result.current.filters.type).toBe('INCOME')

    // Passing empty string should remove the field
    act(() => {
      result.current.setFilter('type', '' as unknown as 'INCOME' | 'EXPENSE')
    })
    expect(result.current.filters.type).toBeUndefined()
  })

  it('setFilter also resets page when a date field changes', () => {
    const { result } = renderHook(() => useFinanceFilters())

    act(() => {
      result.current.setTransactionsPage(5)
    })
    act(() => {
      result.current.setFilter('from', '2026-01-01')
    })
    expect(result.current.transactionsPage).toBe(1)
  })

  // ── Pagination ────────────────────────────────────────────────────────────

  it('setTransactionsPage updates the page', () => {
    const { result } = renderHook(() => useFinanceFilters())
    act(() => {
      result.current.setTransactionsPage(4)
    })
    expect(result.current.transactionsPage).toBe(4)
  })

  it('setTransactionsPageSize updates the page size', () => {
    const { result } = renderHook(() => useFinanceFilters())
    act(() => {
      result.current.setTransactionsPageSize(50)
    })
    expect(result.current.transactionsPageSize).toBe(50)
  })
})
