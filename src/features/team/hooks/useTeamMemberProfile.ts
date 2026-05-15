import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { ApiError } from '@/services/http'

import { getClinicProfile, listClinicMembers } from '../services/team.service'
import type { MemberListItem, ProfileDetail } from '../types/team.types'

export type ProfileLoadStatus = 'loading' | 'ready' | 'forbidden' | 'not-found' | 'error'

export function useTeamMemberProfile(profileId: string) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileDetail | null>(null)
  const [member, setMember] = useState<MemberListItem | null>(null)
  const [status, setStatus] = useState<ProfileLoadStatus>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    setProfile(null)
    setMember(null)

    try {
      const profileData = await getClinicProfile(profileId)
      setProfile(profileData)

      if (user?.role === 'OWNER') {
        try {
          const members = await listClinicMembers()
          setMember(members.find((m) => m.profile?.id === profileId) ?? null)
        } catch {
          // non-critical — profile data is still shown
        }
      }

      setStatus('ready')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) { setStatus('forbidden'); return }
        if (err.status === 404) { setStatus('not-found'); return }
      }
      setStatus('error')
    }
  }, [profileId, user?.role])

  useEffect(() => {
    load()
  }, [load])

  const displayName =
    member
      ? `${member.firstName} ${member.lastName}`
      : user?.role === 'DENTIST' && profile?.userId === user.id
        ? `${user.firstName} ${user.lastName}`
        : (profile?.displayName ?? '')

  const email =
    member?.email ??
    (user?.role === 'DENTIST' && profile?.userId === user.id ? user.email : null)

  const phone = member?.phone ?? profile?.phone ?? null

  const isActive = member ? member.isActive : user?.role === 'DENTIST' ? true : null

  return { profile, member, user, status, displayName, email, phone, isActive, load }
}
