import { useMemo, useState } from 'react'

type ListFilterState = {
  searchQuery: string
  activeFilters: Record<string, string>
  page: number
}

type UseListFilterOptions<T> = {
  searchFn?: (item: T, query: string) => boolean
  filterFns?: Record<string, (item: T, value: string) => boolean>
  pageSize?: number
}

const INITIAL_STATE: ListFilterState = {
  searchQuery: '',
  activeFilters: {},
  page: 1,
}

export function useListFilter<T>(data: T[], options: UseListFilterOptions<T> = {}) {
  const { searchFn, filterFns, pageSize = 10 } = options

  const [state, setState] = useState<ListFilterState>(INITIAL_STATE)

  // Setters — all reset page to 1 to avoid empty pages after filter change
  function setSearchQuery(q: string) {
    setState((prev) => ({ ...prev, searchQuery: q, page: 1 }))
  }

  function setFilter(key: string, value: string | null) {
    setState((prev) => {
      const next = { ...prev.activeFilters }
      if (value === null) {
        delete next[key]
      } else {
        next[key] = value
      }
      return { ...prev, activeFilters: next, page: 1 }
    })
  }

  function clearAll() {
    setState(INITIAL_STATE)
  }

  function setPage(page: number) {
    setState((prev) => ({ ...prev, page }))
  }

  const filteredData = useMemo(() => {
    const q = state.searchQuery.toLowerCase().trim()
    return data.filter((item) => {
      if (q && searchFn && !searchFn(item, q)) return false
      for (const [key, value] of Object.entries(state.activeFilters)) {
        if (filterFns?.[key] && !filterFns[key](item, value)) return false
      }
      return true
    })
  }, [data, state.searchQuery, state.activeFilters, searchFn, filterFns])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))

  const paginatedData = useMemo(() => {
    const start = (state.page - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, state.page, pageSize])

  return {
    searchQuery: state.searchQuery,
    setSearchQuery,
    activeFilters: state.activeFilters,
    setFilter,
    clearAll,
    page: state.page,
    setPage,
    totalPages,
    filteredCount: filteredData.length,
    filteredData,
    paginatedData,
  }
}
