import { Html, Line, Sparkles } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import gsap from 'gsap'
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
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

// ── Constants ────────────────────────────────────────────────────────────────
const ORBIT_RADIUS = 2.6
const CORE = new THREE.Vector3(0, 0, 0)
const CYAN = '#7dd3fc' // cyan-300
const CYAN_DEEP = '#38bdf8' // sky-400

type ModuleDef = { label: string; Icon: LucideIcon }

const MODULES: ModuleDef[] = [
  { label: 'Agenda', Icon: CalendarDays },
  { label: 'Pacientes', Icon: Users },
  { label: 'Financeiro', Icon: CreditCard },
  { label: 'Relatórios', Icon: BarChart3 },
  { label: 'Estoque', Icon: Boxes },
  { label: 'WhatsApp', Icon: MessageCircle },
  { label: 'Equipe', Icon: UsersRound },
  { label: 'Prontuário', Icon: ClipboardList },
]

// Base node positions on a circle in the XZ plane (the ring revolves around Y).
const NODE_POSITIONS = MODULES.map((_, index) => {
  const angle = (index / MODULES.length) * Math.PI * 2
  return new THREE.Vector3(Math.cos(angle) * ORBIT_RADIUS, 0, Math.sin(angle) * ORBIT_RADIUS)
})

/** Soft radial glow texture generated in-memory (no asset, additive-blended). */
function useGlowTexture() {
  const texture = useMemo(() => {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
      grad.addColorStop(0, 'rgba(125,211,252,0.95)')
      grad.addColorStop(0.4, 'rgba(56,189,248,0.35)')
      grad.addColorStop(1, 'rgba(56,189,248,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, size, size)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

// ── One module: node dot + light-path + inward pulse + crisp HTML label ───────
function OrbitNode({
  module,
  position,
  index,
  progress,
  glow,
}: {
  module: ModuleDef
  position: THREE.Vector3
  index: number
  progress: MutableRefObject<number>
  glow: THREE.Texture
}) {
  const traveler = useRef<THREE.Sprite>(null)
  const { Icon } = module

  useFrame(() => {
    const node = traveler.current
    if (!node) return
    // Phase-offset so the eight pulses flow inward from every side continuously.
    const t = (progress.current + index / MODULES.length) % 1
    node.position.lerpVectors(position, CORE, t)
    const material = node.material as THREE.SpriteMaterial
    material.opacity = Math.sin(t * Math.PI) * 0.9 // fade in at node, out at core
  })

  return (
    <group>
      <mesh position={position}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={CYAN} toneMapped={false} />
      </mesh>

      <Line
        points={[position, CORE]}
        color={CYAN_DEEP}
        lineWidth={1}
        transparent
        opacity={0.16}
        toneMapped={false}
      />

      <sprite ref={traveler} scale={[0.4, 0.4, 1]}>
        <spriteMaterial
          map={glow}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      <Html position={position} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-slate-800/90 px-3 py-1.5 shadow-[0_6px_18px_-8px_rgba(0,0,0,0.85)]">
          <Icon className="h-[18px] w-[18px] shrink-0 text-cyan-300" />
          <span className="text-xs font-medium text-slate-100">{module.label}</span>
        </div>
      </Html>
    </group>
  )
}

// ── The animated scene contents ───────────────────────────────────────────────
function OrbitContent() {
  const ringRef = useRef<THREE.Group>(null)
  const progress = useRef(0)
  const elapsed = useRef(0)
  const glow = useGlowTexture()

  useEffect(() => {
    // GSAP drives the seamless inward light-trace flow (linear, infinite loop).
    const flow = gsap.to(progress, { current: 1, duration: 5, ease: 'none', repeat: -1 })
    // GSAP entrance: the ring scales up once, when the scene mounts in view.
    let entrance: gsap.core.Tween | undefined
    if (ringRef.current) {
      entrance = gsap.fromTo(
        ringRef.current.scale,
        { x: 0.82, y: 0.82, z: 0.82 },
        { x: 1, y: 1, z: 1, duration: 1.3, ease: 'power3.out' },
      )
    }
    return () => {
      flow.kill()
      entrance?.kill()
    }
  }, [])

  useFrame((state, delta) => {
    elapsed.current += delta
    if (ringRef.current) ringRef.current.rotation.y += delta * 0.12
    // Gentle camera drift + pointer parallax — keeps the composition feeling 3D.
    const time = elapsed.current
    const targetX = state.pointer.x * 0.7 + Math.sin(time * 0.18) * 0.25
    const targetY = 1.35 + state.pointer.y * 0.35 + Math.cos(time * 0.15) * 0.18
    state.camera.position.x += (targetX - state.camera.position.x) * 0.04
    state.camera.position.y += (targetY - state.camera.position.y) * 0.04
    state.camera.lookAt(CORE)
  })

  return (
    <>
      {/* Core halo */}
      <sprite scale={[3.2, 3.2, 1]}>
        <spriteMaterial
          map={glow}
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      {/* Ambient depth particles */}
      <Sparkles count={48} scale={9} size={2.4} speed={0.3} opacity={0.5} color={CYAN} />

      {/* Revolving ring of modules + light-paths */}
      <group ref={ringRef}>
        {MODULES.map((module, index) => (
          <OrbitNode
            key={module.label}
            module={module}
            position={NODE_POSITIONS[index]}
            index={index}
            progress={progress}
            glow={glow}
          />
        ))}
      </group>
    </>
  )
}

/**
 * WebGL Flow Orbit (Three.js / React Three Fiber + GSAP).
 *
 * The orbit, rings, particles, core halo, light-paths, camera drift and pointer
 * parallax run in WebGL; module labels are crisp HTML overlays (drei `<Html>`)
 * attached to the 3D nodes so text never blurs. GSAP drives the seamless inward
 * light-trace flow and the entrance. Lazily imported and only mounted on
 * pointer-fine, non-reduced-motion desktops; mobile / reduced-motion render a
 * static SVG fallback instead. R3F disposes GL resources on unmount; GSAP
 * tweens and the glow texture are cleaned up explicitly.
 *
 * Default export so it can be `React.lazy`-loaded.
 */
export default function FlowOrbitScene() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-[42rem]">
      {/* THREE.Clock deprecation warning ("Please use THREE.Timer") is emitted by
          @react-three/fiber's internal store, not by app code. App code uses only
          the `delta` argument from `useFrame`. Resolves when R3F ships a stable
          Timer-based release — do not change FlowOrbitScene lifecycle to silence it. */}
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 1.35, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ overflow: 'visible' }}
      >
        <OrbitContent />
      </Canvas>

      {/* Crisp fixed core label (HTML, always centered, on top of the halo) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border border-white/15 bg-slate-950/40 backdrop-blur-[2px] sm:h-32 sm:w-32">
          <Activity className="h-8 w-8 text-cyan-200 sm:h-9 sm:w-9" />
          <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/90 sm:text-[11px]">
            DentalFlow
          </span>
        </div>
      </div>
    </div>
  )
}
