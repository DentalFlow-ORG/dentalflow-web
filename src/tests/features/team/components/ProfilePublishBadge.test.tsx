import { render, screen } from '@/test-utils/render-utils'

import { ProfilePublishBadge } from '@/features/team/components/ProfilePublishBadge'

// ── Published ─────────────────────────────────────────────────────────────────

describe('ProfilePublishBadge — published', () => {
  it('shows "Publicado" when isPublished is true', () => {
    render(<ProfilePublishBadge isPublished={true} hasProfile={true} />)
    expect(screen.getByText('Publicado')).toBeInTheDocument()
  })

  it('does not show "Não publicado" when published', () => {
    render(<ProfilePublishBadge isPublished={true} hasProfile={true} />)
    expect(screen.queryByText('Não publicado')).toBeNull()
  })
})

// ── Not published ─────────────────────────────────────────────────────────────

describe('ProfilePublishBadge — not published', () => {
  it('shows "Não publicado" when isPublished is false', () => {
    render(<ProfilePublishBadge isPublished={false} hasProfile={true} />)
    expect(screen.getByText('Não publicado')).toBeInTheDocument()
  })

  it('shows "Não publicado" when isPublished is null', () => {
    render(<ProfilePublishBadge isPublished={null} hasProfile={true} />)
    expect(screen.getByText('Não publicado')).toBeInTheDocument()
  })

  it('shows "Não publicado" when isPublished is undefined (default)', () => {
    render(<ProfilePublishBadge hasProfile={true} />)
    expect(screen.getByText('Não publicado')).toBeInTheDocument()
  })
})

// ── No profile ────────────────────────────────────────────────────────────────

describe('ProfilePublishBadge — no profile', () => {
  it('shows "Sem perfil" when hasProfile is false', () => {
    render(<ProfilePublishBadge hasProfile={false} />)
    expect(screen.getByText('Sem perfil')).toBeInTheDocument()
  })

  it('does not show publish status when hasProfile is false', () => {
    render(<ProfilePublishBadge isPublished={true} hasProfile={false} />)
    expect(screen.queryByText('Publicado')).toBeNull()
    expect(screen.getByText('Sem perfil')).toBeInTheDocument()
  })
})
