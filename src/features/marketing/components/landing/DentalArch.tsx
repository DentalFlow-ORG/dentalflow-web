import { Suspense, lazy, useEffect, useState } from 'react'

import { DENTAL_WORKFLOWS } from '../../data/dental-arch'
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll'
import { usePrefersReducedMotion } from '../../lib/motion'

// Heavy WebGL scene (three / r3f / drei) — only fetched for the desktop,
// motion-enabled path, and only once the arch scrolls into view.
const DentalArchScene = lazy(() => import('./DentalArchScene'))

type DentalArchProps = {
  selectedIndex: number
  onSelect: (index: number) => void
}

// Arch node coordinates in the SVG/overlay user space (viewBox 160×100). A
// gentle ∩ "smile" arch: the central incisor sits highest, molars curve down.
const VIEW_W = 160
const VIEW_H = 100
const THETA_MAX = (78 * Math.PI) / 180

const NODES = DENTAL_WORKFLOWS.map((_, index) => {
  const t = DENTAL_WORKFLOWS.length === 1 ? 0 : (index / (DENTAL_WORKFLOWS.length - 1)) * 2 - 1
  const theta = t * THETA_MAX
  return {
    cx: 80 + Math.sin(theta) * 66,
    cy: 34 + (1 - Math.cos(theta)) * 50,
  }
})

const ARCH_PATH = Array.from({ length: 64 }, (_, i) => {
  const t = (i / 63) * 2 - 1
  const theta = t * THETA_MAX
  const x = 80 + Math.sin(theta) * 66
  const y = 34 + (1 - Math.cos(theta)) * 50
  return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
}).join(' ')

/**
 * Render the lightweight static arch (instead of WebGL) when motion is reduced
 * or on small / touch devices — keeps mobile fast and avoids loading three.js.
 */
function useStaticArch(): boolean {
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

/**
 * Crisp flat dental arch (SVG + HTML) for mobile / touch / reduced-motion and
 * as the zero-CLS poster while the WebGL chunk loads. The arch line and glow are
 * decorative, but each tooth node is a real, tappable, keyboard-focusable button
 * (≥44px) that selects its module — so on touch devices the icons themselves are
 * interactive, in sync with the chip selector and explanatory content.
 */
function StaticArch({ selectedIndex, onSelect }: DentalArchProps) {
  return (
    <div
      className="relative mx-auto aspect-[16/10] w-full max-w-3xl"
      role="group"
      aria-label="Arcada de módulos do DentalFlow"
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[12%] h-[55%] w-[80%] -translate-x-1/2 rounded-[100%] blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.18), transparent 70%)',
        }}
      />

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        role="presentation"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="df-arch-grad"
            x1="0"
            y1="0"
            x2={VIEW_W}
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="rgba(56,189,248,0.15)" />
            <stop offset="50%" stopColor="rgba(125,211,252,0.7)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.15)" />
          </linearGradient>
        </defs>
        <path
          d={ARCH_PATH}
          fill="none"
          stroke="url(#df-arch-grad)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>

      {DENTAL_WORKFLOWS.map((workflow, index) => {
        const { cx, cy } = NODES[index]
        const Icon = workflow.icon
        const isSelected = index === selectedIndex
        return (
          <button
            key={workflow.key}
            type="button"
            aria-pressed={isSelected}
            aria-label={`Selecionar módulo ${workflow.label}`}
            onClick={() => onSelect(index)}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            style={{ left: `${(cx / VIEW_W) * 100}%`, top: `${(cy / VIEW_H) * 100}%` }}
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-slate-900/85 shadow-[0_10px_26px_-12px_rgba(0,0,0,0.85)] transition-all sm:h-12 sm:w-12"
              style={
                isSelected
                  ? {
                      borderColor: workflow.accent,
                      boxShadow: `0 0 22px -4px ${workflow.accent}`,
                      transform: 'scale(1.08)',
                    }
                  : { borderColor: 'rgba(255,255,255,0.1)' }
              }
            >
              <Icon
                className="h-5 w-5"
                style={{ color: isSelected ? workflow.accent : '#7dd3fc' }}
                aria-hidden="true"
              />
            </span>
            {isSelected && (
              <span className="whitespace-nowrap text-[11px] font-semibold text-slate-100">
                {workflow.label}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Interactive dental arch: a premium WebGL scene on motion-enabled desktops and
 * a crisp static SVG arch on mobile / touch / reduced-motion. The WebGL chunk is
 * only fetched once the arch is in view. Selection state lives in the parent
 * section (driven by the accessible chip selector) so both renderings stay in
 * sync. Fully decorative for assistive tech (`aria-hidden`).
 */
export function DentalArch({ selectedIndex, onSelect }: DentalArchProps) {
  const isStatic = useStaticArch()
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>(0.05)

  if (isStatic) return <StaticArch selectedIndex={selectedIndex} onSelect={onSelect} />

  return (
    <div ref={ref} className="relative mx-auto aspect-[16/10] w-full max-w-3xl">
      {isVisible ? (
        <Suspense fallback={<StaticArch selectedIndex={selectedIndex} onSelect={onSelect} />}>
          <DentalArchScene selectedIndex={selectedIndex} onSelect={onSelect} />
        </Suspense>
      ) : (
        <StaticArch selectedIndex={selectedIndex} onSelect={onSelect} />
      )}
    </div>
  )
}
