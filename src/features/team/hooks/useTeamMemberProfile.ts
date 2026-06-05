import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { ApiError } from '@/services/http'
import {
  listAvailability,
  listAvailabilityExceptions,
} from '@/features/scheduling/services/scheduling.service'
import type {
  Availability,
  AvailabilityException,
} from '@/features/scheduling/types/scheduling.types'

import {
  getClinicProfile,
  listClinicMembers,
  toggleProfilePublishStatus,
} from '../services/team.service'
import type { MemberListItem, ProfileDetail, ServiceItem } from '../types/team.types'

export type ProfileLoadStatus = 'loading' | 'ready' | 'forbidden' | 'not-found' | 'error'

export function useTeamMemberProfile(profileId: string) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileDetail | null>(null)
  const [member, setMember] = useState<MemberListItem | null>(null)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [status, setStatus] = useState<ProfileLoadStatus>('loading')
  const [isPublishingProfile, setIsPublishingProfile] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setProfile(null)
    setMember(null)
    setAvailability([])
    setExceptions([])
    setServices([])
    setPublishError(null)

    try {
      const [profileData, slots, excs] = await Promise.all([
        getClinicProfile(profileId),
        listAvailability(profileId).catch(() => [] as Availability[]),
        listAvailabilityExceptions(profileId).catch(() => [] as AvailabilityException[]),
      ])
      setProfile(profileData)
      setAvailability(slots)
      setExceptions(excs)
      setServices(profileData.services ?? [])

      if (user?.role === 'OWNER') {
        try {
          const { members } = await listClinicMembers()
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

  const togglePublishStatus = useCallback(async () => {
    if (!profile || user?.role !== 'OWNER') return false

    setIsPublishingProfile(true)
    setPublishError(null)

    try {
      const result = await toggleProfilePublishStatus(profile.id)
      setProfile((current) =>
        current ? { ...current, isPublished: result.isPublished } : current,
      )
      return true
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar a publicação do perfil.'
      setPublishError(msg)
      return false
    } finally {
      setIsPublishingProfile(false)
    }
  }, [profile, user?.role])

  return {
    profile,
    member,
    user,
    status,
    displayName,
    email,
    phone,
    isActive,
    availability,
    setAvailability,
    exceptions,
    setExceptions,
    services,
    setServices,
    isPublishingProfile,
    publishError,
    togglePublishStatus,
    load,
  }
}
