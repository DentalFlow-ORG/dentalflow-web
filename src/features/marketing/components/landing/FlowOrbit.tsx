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

// Subtle 2D pointer parallax (px) — no 3D perspective, so chips/text stay crisp.
const PARALLAX_PX = 14
const PARALLAX_SPRING = { stiffness: 120, damping: 20, mass: 0.6 }
// The ring the satellites sit on, as a fraction of the stage radius (0–50).
const ORBIT_RADIUS = 34
// One slow revolution. The satellite labels counter-rotate at the same duration
// so they stay perfectly upright (net-zero rotation = crisp, readable text).
const ORBIT_DURATION = '90s'

type Satellite = { label: string; Icon: LucideIcon; x: number; y: number }

// Eight modules evenly spaced on the orbit ring. The radius + chip half-width
// stays well inside 0–100 at every angle, so nothing clips as they revolve.
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
 * Conceptual "flow orbit": module satellites slowly revolve around a glass
 * DentalFlow core, connected by light-paths that pulse inward — DentalFlow as
 * one control center.
 *
 * Crisp by construction: the composition is flat (no 3D perspective), rings and
 * light-paths are crisp SVG strokes, and while the satellite ring rotates each
 * label counter-rotates by the same amount so text stays upright and sharp (no
 * rotational blur). The whole scene also parallax-shifts toward the pointer.
 * All looping motion is CSS gated by `prefers-reduced-motion`; pointer parallax
 * is disabled here under reduced motion. Fully decorative (`aria-hidden`).
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
      className="relative mx-auto aspect-square w-full max-w-[42rem]"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <m.div
        className="relative h-full w-full"
        style={reduced ? undefined : { x: translateX, y: translateY }}
      >
        {/* Ambient core glow */}
        <div
          className="absolute left-1/2 top-1/2 h-[44%] w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.20), transparent 70%)' }}
        />

        {/* Static concentric rings */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          role="presentation"
          aria-hidden="true"
        >
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
        </svg>

        {/* Slowly rotating dashed accent ring */}
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

        {/* Revolving orbit: light-paths + satellites rotate together as one system */}
        <div
          className="df-orbit-spin absolute inset-0 h-full w-full"
          style={{ transformOrigin: 'center', animationDuration: ORBIT_DURATION }}
        >
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
                {/* Counter-rotates the label so it stays upright + crisp */}
                <div
                  className="df-orbit-spin-rev"
                  style={{ transformOrigin: 'center', animationDuration: ORBIT_DURATION }}
                >
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/90 px-2.5 py-1.5 shadow-[0_6px_18px_-8px_rgba(0,0,0,0.85)] sm:px-3.5 sm:py-2">
                    <Icon className="h-4 w-4 shrink-0 text-cyan-300 sm:h-[18px] sm:w-[18px]" />
                    <span className="hidden whitespace-nowrap text-xs font-medium text-slate-100 sm:inline">
                      {satellite.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Glass core — fixed at center, on top */}
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
      </m.div>
    </div>
  )
}
