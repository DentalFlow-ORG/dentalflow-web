import { useEffect, useState } from 'react'

import { getClinicProfile, updateClinicProfile } from '../services/settings.service'
import type { ClinicProfile, UpdateClinicProfilePayload } from '../types/settings.types'

export function useClinicProfile() {
  const [profile, setProfile] = useState<ClinicProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    getClinicProfile()
      .then(setProfile)
      .catch(() => setError('Não foi possível carregar o perfil da clínica.'))
      .finally(() => setIsLoading(false))
  }, [])

  async function save(payload: UpdateClinicProfilePayload) {
    setIsSaving(true)
    setSaveSuccess(false)
    setSaveError(null)
    try {
      const updated = await updateClinicProfile(payload)
      setProfile(updated)
      setSaveSuccess(true)
    } catch {
      setSaveError('Não foi possível salvar as alterações. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return { profile, isLoading, error, save, isSaving, saveSuccess, saveError }
}
