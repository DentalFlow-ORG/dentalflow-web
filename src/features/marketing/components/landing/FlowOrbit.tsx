import {
  Activity,
  BarChart3,
  Boxes,
  CalendarDays,
  ClipboardList,
  CreditCard,
  type LucideIcon,
  MessageCircle,
  Users,
  UsersRound,
} from 'lucide-react'
import { Suspense, lazy, useEffect, useState } from 'react'

import { useRevealOnScroll } from '../../hooks/useRevealOnScroll'
import { usePrefersReducedMotion } from '../../lib/motion'

// Heavy WebGL scene (three / r3f / drei / gsap) — only fetched for the desktop,
// motion-enabled path, and only once the orbit scrolls into view.
const FlowOrbitScene = lazy(() => import('./FlowOrbitScene'))

const ORBIT_RADIUS = 34

type Satellite = { label: string; Icon: LucideIcon; x: number; y: number }

const SATELLITES: Satellite[] = [
  { label: 'Agenda', Icon: CalendarDays, x: 50, y: 16 },
  { label: 'Pacientes', Icon: Users, x: 74, y: 26 },
  { label: 'Financeiro', Icon: CreditCard, x: 84, y: 50 },
  { label: 'Relatórios', Icon: BarChart3, x: 74, y: 74 },
  { label: 'Estoque', Icon: Boxes, x: 50, y: 84 },
  { label: 'WhatsApp', Icon: MessageCircle, x: 26, y: 74 },
  { label: 'Equipe', Icon: UsersRound, x: 16, y: 50 },
  { label: 'Prontuário', Icon: ClipboardList, x: 26, y: 26 },
]

/**
 * Render the lightweight static orbit (instead of WebGL) when motion is reduced
 * or on small / touch devices — keeps mobile fast and avoids loading three.js.
 */
function useStaticOrbit(): boolean {
  const reduced = usePrefersReducedMotion()
  const [smallOrCoarse, setSmallOrCoarse] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(max-width: 767px), (pointer: coarse)')
    setSmallOrCoarse(query.matches)
    const onChange = (event: MediaQueryListEvent) => setSmallOrCoarse(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced || smallOrCoarse
}

/** Static, zero-CLS placeholder shown before the WebGL scene mounts. */
function OrbitPoster() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-[42rem]">
      <div
        className="absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.18), transparent 70%)' }}
      />
      <div className="absolute left-1/2 top-1/2 flex h-28 w-28 flex-col items-center justify-center rounded-full border border-white/15 bg-slate-950/40 backdrop-blur-[2px] sm:h-32 sm:w-32">
        <Activity className="h-8 w-8 text-cyan-200 sm:h-9 sm:w-9" />
        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/90 sm:text-[11px]">
          DentalFlow
        </span>
      </div>
    </div>
  )
}

/**
 * Crisp flat orbit (SVG + HTML) for mobile / touch / reduced-motion.
 *
 * Satellites are static (no rotation → nothing teleports, tilts, or clips) and
 * the labels stay crisp. Every light-path carries the same continuously-flowing
 * `df-flow-dash` so all eight modules feed the core from every side; negative
 * animation delays phase-offset them so all are already flowing at mount, and
 * the dash offset is a whole multiple of the dash period so the loop is
 * seamless (no visible reset). No pointer parallax here — this fallback targets
 * touch devices, where a scroll-driven parallax would jump. All motion is CSS
 * gated by `prefers-reduced-motion` (fully static when reduced).
 */
function StaticOrbit() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-[42rem]">
      <div className="relative h-full w-full">
        <div
          className="absolute left-1/2 top-1/2 h-[44%] w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.20), transparent 70%)' }}
        />

        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          role="presentation"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="df-flow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(125,211,252,0.9)" />
              <stop offset="100%" stopColor="rgba(56,189,248,0.5)" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r={ORBIT_RADIUS}
            fill="none"
            stroke="rgba(56,189,248,0.14)"
            strokeWidth="0.3"
          />
          <circle
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke="rgba(56,189,248,0.10)"
            strokeWidth="0.3"
          />
          {SATELLITES.map((satellite, index) => (
            <g key={satellite.label}>
              <line
                x1={satellite.x}
                y1={satellite.y}
                x2={50}
                y2={50}
                stroke="rgba(148,163,184,0.10)"
                strokeWidth="0.3"
              />
              <line
                x1={satellite.x}
                y1={satellite.y}
                x2={50}
                y2={50}
                stroke="url(#df-flow-grad)"
                pathLength={1}
                strokeWidth="0.5"
                strokeLinecap="round"
                strokeDasharray="0.044 0.265"
                className="df-flow-dash-unit"
                style={{ animationDelay: `-${index * 0.375}s` }}
              />
            </g>
          ))}
        </svg>

        <svg
          viewBox="0 0 100 100"
          className="df-orbit-spin absolute inset-0 h-full w-full"
          style={{ transformOrigin: 'center', animationDuration: '46s' }}
          role="presentation"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r={ORBIT_RADIUS}
            fill="none"
            stroke="rgba(56,189,248,0.26)"
            strokeWidth="0.4"
            strokeLinecap="round"
            strokeDasharray="0.4 3.5"
          />
        </svg>

        {SATELLITES.map((satellite) => {
          const { Icon } = satellite
          return (
            <div
              key={satellite.label}
              className="absolute"
              style={{
                left: `${satellite.x}%`,
                top: `${satellite.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/90 px-2.5 py-1.5 shadow-[0_6px_18px_-8px_rgba(0,0,0,0.85)] sm:px-3.5 sm:py-2">
                <Icon className="h-4 w-4 shrink-0 text-cyan-300 sm:h-[18px] sm:w-[18px]" />
                <span className="hidden whitespace-nowrap text-xs font-medium text-slate-100 sm:inline">
                  {satellite.label}
                </span>
              </div>
            </div>
          )
        })}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-cyan-400/25 to-slate-900/55 shadow-[0_18px_55px_-18px_rgba(56,189,248,0.6)] sm:h-32 sm:w-32">
            <div className="flex flex-col items-center">
              <Activity className="h-8 w-8 text-cyan-200 sm:h-9 sm:w-9" />
              <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/90 sm:text-[11px]">
                DentalFlow
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Conceptual "flow orbit": module satellites orbit a glass DentalFlow core,
 * connected by light-paths that flow inward — DentalFlow as one control center.
 *
 * Desktop (pointer-fine, motion-enabled): a lazy-loaded WebGL scene
 * (`FlowOrbitScene`) with crisp HTML labels. Mobile / touch / reduced-motion:
 * a crisp static SVG orbit. The WebGL chunk is only fetched once the orbit is
 * in view. Fully decorative (`aria-hidden`).
 *
 * Default export so it can be `React.lazy`-loaded by the Solution section.
 */
export default function FlowOrbit() {
  const isStatic = useStaticOrbit()
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>(0.05)

  if (isStatic) return <StaticOrbit />

  return (
    <div ref={ref}>
      {isVisible ? (
        <Suspense fallback={<OrbitPoster />}>
          <FlowOrbitScene />
        </Suspense>
      ) : (
        <OrbitPoster />
      )}
    </div>
  )
}
