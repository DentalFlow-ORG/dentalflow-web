import { ProfileEditorPageContainer } from '../containers/ProfileEditorPageContainer'
import type { ProfileEditorMode } from '../hooks/useProfileEditorPage'

type ProfileEditorPageProps = {
  mode: ProfileEditorMode
}

export function ProfileEditorPage({ mode }: ProfileEditorPageProps) {
  return <ProfileEditorPageContainer mode={mode} />
}
