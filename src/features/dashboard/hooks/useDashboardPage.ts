import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { listProfiles } from '@/features/profiles/services/profiles.service'
import type { ProfileListItem } from '@/features/profiles/types'
import { ApiError } from '@/services/http'

export function useDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<ProfileListItem[]>([])
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ADMIN is a platform-level role with no clinic association — redirect to their area.
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      void navigate({ to: '/app/admin/users' })
    }
  }, [user?.role, navigate])

  useEffect(() => {
    if (user?.role === 'ADMIN') return
    listProfiles()
      .then(setProfiles)
      .catch((requestError) => {
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : 'Não foi possível carregar os indicadores de perfis.',
        )
      })
      .finally(() => setIsLoadingProfiles(false))
  }, [user?.role])

  const metrics = useMemo(() => {
    const publishedProfiles = profiles.filter((p) => p.isPublished)
    const draftProfiles = profiles.filter((p) => !p.isPublished)
    const totalViews = profiles.reduce((total, p) => total + p.viewsCount, 0)
    const mostViewedProfile = [...profiles].sort(
      (a, b) => b.viewsCount - a.viewsCount,
    )[0]

    return { publishedProfiles, draftProfiles, totalViews, mostViewedProfile }
  }, [profiles])

  const setupSteps = [
    { label: 'Criar primeiro perfil profissional', isDone: profiles.length > 0 },
    { label: 'Publicar uma página pública', isDone: metrics.publishedProfiles.length > 0 },
    { label: 'Acompanhar visualizações iniciais', isDone: metrics.totalViews > 0 },
  ]

  return {
    user,
    profiles,
    isLoadingProfiles,
    error,
    metrics,
    setupSteps,
    hasProfiles: profiles.length > 0,
  }
}
