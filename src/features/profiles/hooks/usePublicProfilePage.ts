import { useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { ApiError } from '@/services/http'

import { getProfile, getPublicProfile } from '../services/profiles.service'
import type { ProfileDetail } from '../types'

export function usePublicProfilePage() {
  const { slug } = useParams({ from: '/p/$slug' })
  const { isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<ProfileDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const returnTo = isAuthenticated ? '/app/perfis' : '/'

  useEffect(() => {
    const loadProfile = async () => {
      const publicData = await getPublicProfile(slug)

      if (!isAuthenticated) {
        return publicData
      }

      return getProfile(publicData.id)
    }

    setIsLoading(true)
    setError(null)

    loadProfile()
      .then(setProfile)
      .catch((requestError) => {
        if (requestError instanceof ApiError) {
          setError(requestError.message)
        } else {
          setError('Não foi possível carregar este perfil.')
        }
      })
      .finally(() => setIsLoading(false))
  }, [isAuthenticated, slug])

  return {
    profile,
    isLoading,
    error,
    isAuthenticated,
    returnTo,
  }
}
