import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type RoleModulesPanelProps = {
  modules: string[]
  moduleIcons: LucideIcon[]
  roleLabel: string
  accent?: 'standard' | 'emerald'
}

export function RoleModulesPanel({
  modules,
  moduleIcons,
  roleLabel,
  accent = 'standard',
}: RoleModulesPanelProps) {
  const isEmerald = accent === 'emerald'

  return (
    <section className="bg-white py-12" aria-labelledby="modules-heading">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              O que você acessa
            </p>
            <h2 id="modules-heading" className="mt-2 text-xl font-semibold text-slate-900">
              Módulos disponíveis para{' '}
              <span className="text-primary">{roleLabel.toLowerCase()}</span>
            </h2>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md lg:p-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {modules.map((name, index) => {
                const ModuleIcon = moduleIcons[index]
                if (!ModuleIcon) return null
                return (
                  <div
                    key={name}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors',
                      isEmerald
                        ? 'border-emerald-100 bg-emerald-50'
                        : 'border-slate-100 bg-slate-50',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        isEmerald ? 'bg-emerald-100' : 'bg-primary/10',
                      )}
                    >
                      <ModuleIcon
                        className={cn('h-5 w-5', isEmerald ? 'text-emerald-700' : 'text-primary')}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="text-xs font-semibold leading-tight text-slate-700">
                      {name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
