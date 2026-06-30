import { describe, expect, it } from 'vitest'

import { computeTeamKpis } from '@/features/team/containers/TeamPageContainer.utils'
import type { MemberListItem, UserLimitUsage } from '@/features/team/types/team.types'

function makeUsage(overrides: Partial<UserLimitUsage> = {}): UserLimitUsage {
  return {
    limit: 10,
    used: 0,
    remaining: 10,
    planSlug: 'starter',
    planName: 'Starter',
    ...overrides,
  }
}

function makeMember(overrides: Partial<MemberListItem> = {}): MemberListItem {
  return {
    id: overrides.id ?? 'member-1',
    firstName: 'Ana',
    lastName: 'Silva',
    email: 'ana@example.com',
    role: 'DENTIST',
    phone: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    profile: null,
    ...overrides,
  }
}

describe('computeTeamKpis', () => {
  it('returns zero counts for empty members', () => {
    const result = computeTeamKpis([], makeUsage())

    expect(result.dentistCount).toBe(0)
    expect(result.assistantCount).toBe(0)
  })

  it('formats usage as used over limit when limit is greater than zero', () => {
    const result = computeTeamKpis([], makeUsage({ used: 3, limit: 8 }))

    expect(result.usageValue).toBe('3/8')
  })

  it('formats usage as plain used count when limit is zero', () => {
    const result = computeTeamKpis([], makeUsage({ used: 3, limit: 0 }))

    expect(result.usageValue).toBe('3')
  })

  it('counts dentist members', () => {
    const result = computeTeamKpis(
      [
        makeMember({ id: 'dentist-1', role: 'DENTIST' }),
        makeMember({ id: 'assistant-1', role: 'ASSISTANT' }),
        makeMember({ id: 'dentist-2', role: 'DENTIST' }),
      ],
      makeUsage(),
    )

    expect(result.dentistCount).toBe(2)
  })

  it('counts assistant members', () => {
    const result = computeTeamKpis(
      [
        makeMember({ id: 'assistant-1', role: 'ASSISTANT' }),
        makeMember({ id: 'dentist-1', role: 'DENTIST' }),
        makeMember({ id: 'assistant-2', role: 'ASSISTANT' }),
      ],
      makeUsage(),
    )

    expect(result.assistantCount).toBe(2)
  })

  it('marks the limit as reached when remaining is not positive and limit is greater than zero', () => {
    const result = computeTeamKpis([], makeUsage({ limit: 5, used: 5, remaining: 0 }))

    expect(result.isAtLimit).toBe(true)
  })

  it('does not mark the limit as reached when limit is zero', () => {
    const result = computeTeamKpis([], makeUsage({ limit: 0, used: 5, remaining: 0 }))

    expect(result.isAtLimit).toBe(false)
  })
})
