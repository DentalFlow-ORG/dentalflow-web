import { useParams } from '@tanstack/react-router'
import { useEffect, useReducer } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { ApiError } from '@/services/http'

import { getProfile, getPublicProfile } from '../services/profiles.service'
import type { ProfileDetail } from '../types'

type State = { profile: ProfileDetail | null; isLoading: boolean; error: string | null }
type Action =
  | { type: 'loading' }
  | { type: 'success'; profile: ProfileDetail }
  | { type: 'error'; message: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading': return { ...state, isLoading: true, error: null }
    case 'success': return { profile: action.profile, isLoading: false, error: null }
    case 'error': return { ...state, isLoading: false, error: action.message }
  }
}

export function usePublicProfilePage() {
  const { slug } = useParams({ from: '/p/$slug' })
  const { isAuthenticated } = useAuth()
  const [state, dispatch] = useReducer(reducer, { profile: null, isLoading: true, error: null })
  const returnTo = isAuthenticated ? '/app/perfis' : '/'

  useEffect(() => {
    dispatch({ type: 'loading' })

    const loadProfileData = async () => {
      const publicData = await getPublicProfile(slug)
      return isAuthenticated ? getProfile(publicData.id) : publicData
    }

    loadProfileData()
      .then((data) => dispatch({ type: 'success', profile: data }))
      .catch((requestError) => {
        const message =
          requestError instanceof ApiError
            ? requestError.message
            : 'Não foi possível carregar este perfil.'
        dispatch({ type: 'error', message })
      })
  }, [isAuthenticated, slug])

  return {
    profile: state.profile,
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated,
    returnTo,
  }
}
