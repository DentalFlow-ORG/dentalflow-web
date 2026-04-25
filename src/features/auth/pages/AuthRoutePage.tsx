import { useSearch } from '@tanstack/react-router'

import { AuthPage } from './AuthPage'

export function AuthRoutePage() {
  const { mode } = useSearch({ from: '/acessar' })

  return <AuthPage mode={mode} />
}
