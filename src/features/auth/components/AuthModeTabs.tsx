import { Link } from '@tanstack/react-router'

import type { AuthMode } from '../types'

type AuthModeTabsProps = {
  mode: AuthMode
}

export function AuthModeTabs({ mode }: AuthModeTabsProps) {
  const isLogin = mode === 'login'

  return (
    <div className="relative grid grid-cols-2 rounded-lg bg-slate-100 p-1">
      <div
        className={`absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded-md bg-white shadow-sm transition-transform duration-300 ease-out ${
          isLogin ? 'translate-x-0' : 'translate-x-[calc(100%+0.5rem)]'
        }`}
      />
      <Link
        to="/acessar"
        search={{ mode: 'login' }}
        className={`relative z-10 flex h-11 items-center justify-center rounded-md text-sm font-semibold transition-colors duration-300 ${
          isLogin ? 'text-primary' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        Login
      </Link>
      <Link
        to="/acessar"
        search={{ mode: 'register' }}
        className={`relative z-10 flex h-11 items-center justify-center rounded-md text-sm font-semibold transition-colors duration-300 ${
          !isLogin ? 'text-primary' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        Registro
      </Link>
    </div>
  )
}
