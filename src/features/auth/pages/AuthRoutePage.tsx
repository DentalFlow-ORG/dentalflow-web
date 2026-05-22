import { useSearch } from '@tanstack/react-router'

import { AuthPage } from './AuthPage'

export function AuthRoutePage() {
  const { mode, googleAuth } = useSearch({ from: '/acessar' })

  return <AuthPage mode={mode} googleAuthStatus={googleAuth} />
}
