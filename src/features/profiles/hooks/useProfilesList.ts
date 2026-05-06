import { useEffect, useState } from 'react'

import type { FilterDef } from '@/components/common/ListToolbar'
import { useListFilter } from '@/hooks/useListFilter'

import { useRequestErrorHandler } from './useRequestErrorHandler'
import { listProfiles } from '../services/profiles.service'
import type { ProfileListItem } from '../types'

const PAGE_SIZE = 10

const FILTER_DEFS: FilterDef[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'published', label: 'Publicado' },
      { value: 'draft', label: 'Rascunho' },
    ],
  },
]

const SEARCH_FN = (p: ProfileListItem, q: string) =>
  `${p.displayName} ${p.slug} ${p.city ?? ''} ${p.state ?? ''}`.toLowerCase().includes(q)

const FILTER_FNS = {
  status: (p: ProfileListItem, v: string) =>
    v === 'published' ? p.isPublished : !p.isPublished,
}

export function useProfilesList() {
  const [allProfiles, setAllProfiles] = useState<ProfileListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleRequestError = useRequestErrorHandler(setError)

  const {
    searchQuery,
    setSearchQuery,
    activeFilters,
    setFilter,
    clearAll,
    page,
    setPage,
    totalPages,
    filteredCount,
    paginatedData: profiles,
  } = useListFilter<ProfileListItem>(allProfiles, {
    searchFn: SEARCH_FN,
    filterFns: FILTER_FNS,
    pageSize: PAGE_SIZE,
  })

  useEffect(() => {
    listProfiles()
      .then(setAllProfiles)
      .catch((err) => handleRequestError(err, 'Não foi possível carregar os perfis.'))
      .finally(() => setIsLoading(false))
  }, [handleRequestError])

  return {
    profiles,
    allProfiles,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setFilter,
    clearAll,
    page,
    setPage,
    totalPages,
    filteredCount,
    pageSize: PAGE_SIZE,
    filterDefs: FILTER_DEFS,
  }
}
