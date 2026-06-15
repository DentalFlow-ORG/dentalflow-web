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
import { m, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { PointerEvent } from 'react'

import { usePrefersReducedMotion } from '../../lib/motion'

// Subtle 2D parallax (px) as the pointer moves — no 3D perspective, so chips
// and text stay perfectly crisp.
const PARALLAX_PX = 12
const PARALLAX_SPRING = { stiffness: 120, damping: 20, mass: 0.6 }

// The ring the satellites sit on, as a fraction of the stage radius (0–50).
const ORBIT_RADIUS = 34

type Satellite = { label: string; Icon: LucideIcon; x: number; y: number }

// Eight modules evenly spaced on the orbit ring. Coordinates are percentages of
// the square stage; the radius (34) + chip half-width stays well inside 0–100,
// so nothing can ever clip.
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
 * Conceptual "flow orbit": module satellites arranged on a ring around a glass
 * DentalFlow core, with light-paths that pulse inward — DentalFlow as one
 * control center.
 *
 * Rendered FLAT (no 3D perspective/tilt, no transformed text) for maximum
 * crispness: rings and light-paths are crisp SVG strokes, chips/icons/core
 * carry no blur and no scaling. The only motion is a slowly rotating dashed
 * ring, inward-pulsing light-paths, and a subtle 2D pointer parallax — all
 * gated by `prefers-reduced-motion`. Fully decorative (`aria-hidden`).
 *
 * Default export so it can be `React.lazy`-loaded.
 */
export default function FlowOrbit() {
  const reduced = usePrefersReducedMotion()

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const translateX = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [-PARALLAX_PX, PARALLAX_PX]),
    PARALLAX_SPRING,
  )
  const translateY = useSpring(
    useTransform(pointerY, [-0.5, 0.5], [-PARALLAX_PX, PARALLAX_PX]),
    PARALLAX_SPRING,
  )

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduced) return
    const rect = event.currentTarget.getBoundingClientRect()
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5)
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  function resetPointer() {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-square w-full max-w-[40rem]"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <m.div
        className="relative h-full w-full"
        style={reduced ? undefined : { x: translateX, y: translateY }}
      >
        {/* Ambient core glow (soft blur is fine — it's a glow, not a crisp edge) */}
        <div
          className="absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.20), transparent 70%)' }}
        />

        {/* Crisp rings + inward light-paths (SVG strokes stay sharp at any size) */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          role="presentation"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="df-flow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(56,189,248,0.9)" />
              <stop offset="100%" stopColor="rgba(96,165,250,0.9)" />
            </linearGradient>
          </defs>
          {/* Static rings */}
          <circle
            cx="50"
            cy="50"
            r={ORBIT_RADIUS}
            fill="none"
            stroke="rgba(56,189,248,0.16)"
            strokeWidth="0.35"
          />
          <circle
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke="rgba(96,165,250,0.13)"
            strokeWidth="0.35"
          />
          {/* Inward light-paths from each satellite into the core */}
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
                strokeWidth="0.5"
                strokeLinecap="round"
                strokeDasharray="1.5 9"
                className="df-flow-dash"
                style={{ animationDelay: `${index * 0.35}s` }}
              />
            </g>
          ))}
        </svg>

        {/* Slowly rotating dashed accent ring (crisp 2D rotation) */}
        <svg
          viewBox="0 0 100 100"
          className="df-orbit-spin absolute inset-0 h-full w-full"
          style={{ transformOrigin: 'center', animationDuration: '44s' }}
          role="presentation"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r={ORBIT_RADIUS}
            fill="none"
            stroke="rgba(56,189,248,0.28)"
            strokeWidth="0.4"
            strokeLinecap="round"
            strokeDasharray="0.4 3.5"
          />
        </svg>

        {/* Module satellites — flat, static, crisp */}
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

        {/* Glass core — flat, static, crisp */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-cyan-400/25 via-blue-500/15 to-slate-900/50 shadow-[0_18px_55px_-18px_rgba(56,189,248,0.65)] sm:h-32 sm:w-32">
            <div className="flex flex-col items-center">
              <Activity className="h-8 w-8 text-cyan-200 sm:h-9 sm:w-9" />
              <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/90 sm:text-[11px]">
                DentalFlow
              </span>
            </div>
          </div>
        </div>
      </m.div>
    </div>
  )
}
