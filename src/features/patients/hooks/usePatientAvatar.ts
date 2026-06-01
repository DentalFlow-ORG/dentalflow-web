import { useCallback, useEffect, useState } from 'react'

import { getPatientAvatar, upsertPatientAvatar } from '../services/patients.service'

type State = {
  avatarUrl: string | null
  isLoading: boolean
  isSaving: boolean
}

export function usePatientAvatar(identifier: string | null | undefined) {
  const [state, setState] = useState<State>({ avatarUrl: null, isLoading: true, isSaving: false })

  useEffect(() => {
    if (!identifier) {
      setState({ avatarUrl: null, isLoading: false, isSaving: false })
      return
    }
    let active = true
    setState((s) => ({ ...s, isLoading: true }))
    getPatientAvatar(identifier)
      .then((res) => { if (active) setState({ avatarUrl: res.avatarUrl, isLoading: false, isSaving: false }) })
      .catch(() => { if (active) setState({ avatarUrl: null, isLoading: false, isSaving: false }) })
    return () => { active = false }
  }, [identifier])

  const update = useCallback(
    async (avatarBase64: string | null) => {
      if (!identifier) return
      setState((s) => ({ ...s, isSaving: true }))
      try {
        await upsertPatientAvatar(identifier, avatarBase64)
        setState((s) => ({ ...s, avatarUrl: avatarBase64, isSaving: false }))
      } catch {
        setState((s) => ({ ...s, isSaving: false }))
        throw new Error('Não foi possível salvar a foto.')
      }
    },
    [identifier],
  )

  return { ...state, update }
}
