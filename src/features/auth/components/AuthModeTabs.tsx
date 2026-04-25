import { Link } from '@tanstack/react-router'

import type { AuthMode } from '../types'

type AuthModeTabsProps = {
  mode: AuthMode
}

export function AuthModeTabs({ mode }: AuthModeTabsProps) {
  const isLogin = mode === 'login'

  return (
    <div className="relative grid grid-cols-2 rounded-lg border border-blue-100 bg-blue-50 p-1.5">
      <div
        className={`absolute bottom-1.5 left-1.5 top-1.5 w-[calc(50%-0.75rem)] rounded-md bg-primary shadow-sm shadow-blue-950/20 transition-transform duration-300 ease-out ${
          isLogin ? 'translate-x-0' : 'translate-x-[calc(100%+0.75rem)]'
        }`}
      />
      <Link
        to="/acessar"
        search={{ mode: 'login' }}
        className={`relative z-10 flex h-11 items-center justify-center rounded-md text-sm font-semibold transition-colors duration-300 ${
          isLogin ? 'text-white' : 'text-primary/70 hover:text-primary'
        }`}
      >
        Login
      </Link>
      <Link
        to="/acessar"
        search={{ mode: 'register' }}
        className={`relative z-10 flex h-11 items-center justify-center rounded-md text-sm font-semibold transition-colors duration-300 ${
          !isLogin ? 'text-white' : 'text-primary/70 hover:text-primary'
        }`}
      >
        Registro
      </Link>
    </div>
  )
}
