import { useParams } from '@tanstack/react-router'

import { TeamMemberProfileContainer } from '../containers/TeamMemberProfileContainer'

export function TeamMemberProfilePage() {
  const { profileId } = useParams({ from: '/app/equipe/$profileId' })
  return <TeamMemberProfileContainer profileId={profileId} />
}
