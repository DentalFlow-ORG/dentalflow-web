import { act } from '@testing-library/react'

import { useListFilter } from '@/hooks/useListFilter'
import { renderHook } from '@/test-utils/render-utils'

type Item = { id: number; name: string; category: string }

const ITEMS: Item[] = [
  { id: 1, name: 'Alpha', category: 'a' },
  { id: 2, name: 'Beta', category: 'b' },
  { id: 3, name: 'Gamma', category: 'a' },
]

describe('useListFilter', () => {
  it('returns all data unfiltered by default', () => {
    const { result } = renderHook(() => useListFilter(ITEMS))
    expect(result.current.filteredData).toEqual(ITEMS)
    expect(result.current.filteredCount).toBe(3)
    expect(result.current.page).toBe(1)
  })

  it('filters by search query using the provided searchFn and resets to page 1', () => {
    const { result } = renderHook(() =>
      useListFilter(ITEMS, { searchFn: (item, q) => item.name.toLowerCase().includes(q) }),
    )

    act(() => result.current.setPage(2))
    act(() => result.current.setSearchQuery('al'))

    expect(result.current.filteredData).toEqual([ITEMS[0]])
    expect(result.current.page).toBe(1)
  })

  it('ignores the search query when no searchFn is provided', () => {
    const { result } = renderHook(() => useListFilter(ITEMS))
    act(() => result.current.setSearchQuery('al'))
    expect(result.current.filteredData).toEqual(ITEMS)
  })

  it('filters by an active filter using the matching filterFn', () => {
    const { result } = renderHook(() =>
      useListFilter(ITEMS, { filterFns: { category: (item, v) => item.category === v } }),
    )

    act(() => result.current.setFilter('category', 'a'))

    expect(result.current.filteredData).toEqual([ITEMS[0], ITEMS[2]])
  })

  it('ignores a filter value when no matching filterFn exists', () => {
    const { result } = renderHook(() => useListFilter(ITEMS))
    act(() => result.current.setFilter('category', 'a'))
    expect(result.current.filteredData).toEqual(ITEMS)
  })

  it('removes a filter key when set to null', () => {
    const { result } = renderHook(() =>
      useListFilter(ITEMS, { filterFns: { category: (item, v) => item.category === v } }),
    )

    act(() => result.current.setFilter('category', 'a'))
    expect(result.current.filteredData).toHaveLength(2)

    act(() => result.current.setFilter('category', null))
    expect(result.current.filteredData).toEqual(ITEMS)
    expect(result.current.activeFilters).toEqual({})
  })

  it('clearAll resets search, filters, and page', () => {
    const { result } = renderHook(() =>
      useListFilter(ITEMS, { searchFn: (item, q) => item.name.toLowerCase().includes(q) }),
    )

    act(() => result.current.setSearchQuery('al'))
    act(() => result.current.setPage(2))
    act(() => result.current.clearAll())

    expect(result.current.searchQuery).toBe('')
    expect(result.current.activeFilters).toEqual({})
    expect(result.current.page).toBe(1)
  })

  it('paginates data according to pageSize', () => {
    const { result } = renderHook(() => useListFilter(ITEMS, { pageSize: 2 }))

    expect(result.current.totalPages).toBe(2)
    expect(result.current.paginatedData).toEqual([ITEMS[0], ITEMS[1]])

    act(() => result.current.setPage(2))
    expect(result.current.paginatedData).toEqual([ITEMS[2]])
  })

  it('totalPages is at least 1 even when there is no data', () => {
    const { result } = renderHook(() => useListFilter<Item>([], { pageSize: 2 }))
    expect(result.current.totalPages).toBe(1)
    expect(result.current.paginatedData).toEqual([])
  })
})
