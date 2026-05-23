import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type RoleHeroMockupProps = {
  type: 'dashboard' | 'checklist' | 'agenda' | 'schedule'
  accent: 'standard' | 'navy' | 'fresh'
  role: string
  icon: LucideIcon
  modules: string[]
  moduleIcons: LucideIcon[]
}

/**
 * Stub mockup — Block 1.
 * Renders a role-keyed module-preview card as a visual placeholder.
 * Each type variant ('dashboard', 'checklist', 'agenda', 'schedule') will be
 * replaced with a fully designed mockup in Blocks 2–5.
 */
export function RoleHeroMockup({
  accent,
  role,
  icon: RoleIcon,
  modules,
  moduleIcons,
}: RoleHeroMockupProps) {
  const isNavy = accent === 'navy'

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border shadow-2xl shadow-slate-950/10',
        isNavy ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white',
      )}
      aria-hidden="true"
    >
      {/* Card header */}
      <div
        className={cn(
          'flex items-center justify-between border-b px-5 py-3.5',
          isNavy
            ? 'border-slate-700 bg-slate-800'
            : 'border-slate-100 bg-slate-50',
        )}
      >
        <div>
          <p
            className={cn(
              'text-[10px] font-semibold uppercase tracking-widest',
              isNavy ? 'text-slate-500' : 'text-slate-400',
            )}
          >
            DentalFlow
          </p>
          <p
            className={cn(
              'mt-0.5 text-sm font-semibold',
              isNavy ? 'text-white' : 'text-slate-700',
            )}
          >
            {role}
          </p>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-2.5 py-1',
            isNavy
              ? 'border-slate-600 bg-slate-700'
              : 'border-slate-200 bg-white shadow-sm',
          )}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span
            className={cn(
              'text-[11px] font-medium',
              isNavy ? 'text-slate-400' : 'text-slate-500',
            )}
          >
            Ao vivo
          </span>
        </div>
      </div>

      {/* Module grid */}
      <div className="p-5">
        <p
          className={cn(
            'mb-3 text-[10px] font-semibold uppercase tracking-widest',
            isNavy ? 'text-slate-500' : 'text-slate-400',
          )}
        >
          Módulos ativos
        </p>
        <div className="grid grid-cols-2 gap-2">
          {modules.slice(0, 4).map((mod, i) => {
            const ModIcon = moduleIcons[i]
            if (!ModIcon) return null
            return (
              <div
                key={mod}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2',
                  isNavy
                    ? 'border-slate-700 bg-slate-800'
                    : 'border-slate-100 bg-slate-50',
                )}
              >
                <div
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                    isNavy ? 'bg-white/10' : 'bg-primary/10',
                  )}
                >
                  <ModIcon
                    className={cn(
                      'h-3.5 w-3.5',
                      isNavy ? 'text-blue-400' : 'text-primary',
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'truncate text-xs font-medium',
                    isNavy ? 'text-slate-300' : 'text-slate-600',
                  )}
                >
                  {mod}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Card footer */}
      <div
        className={cn(
          'flex items-center gap-2.5 border-t px-5 py-3',
          isNavy
            ? 'border-slate-700 bg-gradient-to-r from-blue-900/30 to-transparent'
            : 'border-slate-100 bg-gradient-to-r from-primary/5 to-transparent',
        )}
      >
        <div
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
            isNavy ? 'bg-white/10' : 'bg-primary/10',
          )}
        >
          <RoleIcon
            className={cn('h-3.5 w-3.5', isNavy ? 'text-blue-400' : 'text-primary')}
          />
        </div>
        <p
          className={cn(
            'text-xs font-medium',
            isNavy ? 'text-slate-400' : 'text-slate-600',
          )}
        >
          Pronto para começar
        </p>
      </div>
    </div>
  )
}
