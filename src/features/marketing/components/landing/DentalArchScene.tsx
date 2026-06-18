import { Html, Line, Sparkles } from '@react-three/drei'
import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { DENTAL_WORKFLOWS } from '../../data/dental-arch'

// ── Arch geometry ─────────────────────────────────────────────────────────────
const COUNT = DENTAL_WORKFLOWS.length
const RX = 3.3 // arch half-width
const RZ = 2.35 // arch depth (front teeth sit closest to the camera)
const THETA_MAX = (78 * Math.PI) / 180
const GLOBAL = 0.82 // global tooth size factor
const LOOK_AT = new THREE.Vector3(0, 0.05, 1.3)
const ENAMEL = '#eaf4fb'

type ToothPlacement = {
  position: THREE.Vector3
  scale: [number, number, number]
}

// Teeth fan out along an ellipse: incisors (center) are taller and narrower,
// molars (ends) are wider and shorter — a clean, premium read of a dental arch.
const PLACEMENTS: ToothPlacement[] = DENTAL_WORKFLOWS.map((_, index) => {
  const t = COUNT === 1 ? 0 : (index / (COUNT - 1)) * 2 - 1 // -1 … 1
  const theta = t * THETA_MAX
  const m = Math.abs(t)
  return {
    position: new THREE.Vector3(Math.sin(theta) * RX, 0, Math.cos(theta) * RZ),
    scale: [GLOBAL * (0.92 + m * 0.46), GLOBAL * (1.12 - m * 0.34), GLOBAL * (0.92 + m * 0.46)],
  }
})

// A subtle connecting arc beneath the teeth — samples the same ellipse densely.
const ARCH_LINE_POINTS = Array.from({ length: 60 }, (_, i) => {
  const t = (i / 59) * 2 - 1
  const theta = t * THETA_MAX
  return new THREE.Vector3(Math.sin(theta) * RX, -0.62, Math.cos(theta) * RZ)
})

/**
 * Build one stylized tooth: a smooth profile (tapered root → cervical neck →
 * bulging enamel crown → rounded top) revolved into a solid. Radially symmetric,
 * so it reads as a premium tooth object from every arch angle and never needs
 * facing math. Shared across all nine teeth and scaled per position.
 */
function buildToothGeometry() {
  const profile = new THREE.SplineCurve([
    new THREE.Vector2(0.015, -0.66), // root tip
    new THREE.Vector2(0.11, -0.46),
    new THREE.Vector2(0.165, -0.24),
    new THREE.Vector2(0.18, -0.04), // cervical neck (waist)
    new THREE.Vector2(0.3, 0.16),
    new THREE.Vector2(0.335, 0.3), // crown bulge
    new THREE.Vector2(0.3, 0.46),
    new THREE.Vector2(0.17, 0.6),
    new THREE.Vector2(0.015, 0.66), // crown top
  ]).getPoints(48)

  const geometry = new THREE.LatheGeometry(profile, 56)
  geometry.computeVertexNormals()
  geometry.center()
  return geometry
}

// ── One tooth: mesh + hover/select lift + emissive flow wave ──────────────────
function Tooth({
  geometry,
  position,
  scale,
  accent,
  index,
  isActive,
  onActivate,
  onClear,
  onSelect,
}: {
  geometry: THREE.BufferGeometry
  position: THREE.Vector3
  scale: [number, number, number]
  accent: string
  index: number
  isActive: boolean
  onActivate: (index: number) => void
  onClear: () => void
  onSelect: (index: number) => void
}) {
  const mesh = useRef<THREE.Mesh>(null)
  const lift = useRef(0)
  const elapsed = useRef(0)
  const baseY = position.y
  const [sx, sy, sz] = scale

  useFrame((_, delta) => {
    elapsed.current += delta
    lift.current += ((isActive ? 1 : 0) - lift.current) * Math.min(1, delta * 9)

    const node = mesh.current
    if (!node) return
    node.position.y = baseY + lift.current * 0.38
    const k = 1 + lift.current * 0.12
    node.scale.set(sx * k, sy * k, sz * k)

    const mat = node.material as THREE.MeshStandardMaterial
    // Gentle light-flow wave travels across the arch (phase-offset per tooth).
    const wave = (Math.sin(elapsed.current * 1.5 - index * 0.55) * 0.5 + 0.5) * 0.22
    mat.emissiveIntensity = 0.14 + wave + lift.current * 1.05
  })

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      position={position}
      scale={scale}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        onActivate(index)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        onClear()
        document.body.style.cursor = ''
      }}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        onSelect(index)
      }}
    >
      <meshStandardMaterial
        color={ENAMEL}
        roughness={0.3}
        metalness={0.05}
        emissive={accent}
        emissiveIntensity={0.14}
        toneMapped={false}
      />
    </mesh>
  )
}

// ── Scene contents ────────────────────────────────────────────────────────────
function ArchContents({
  selectedIndex,
  onSelect,
}: {
  selectedIndex: number
  onSelect: (index: number) => void
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const elapsed = useRef(0)
  const activeIndex = hovered ?? selectedIndex
  const active = DENTAL_WORKFLOWS[activeIndex]
  const ActiveIcon = active.icon

  const toothGeometry = useMemo(buildToothGeometry, [])
  const labelPosition = useMemo(
    () => PLACEMENTS[activeIndex].position.clone().setY(1.0),
    [activeIndex],
  )

  // Dispose the shared geometry and reset the cursor when the scene unmounts.
  useEffect(() => {
    return () => {
      toothGeometry.dispose()
      document.body.style.cursor = ''
    }
  }, [toothGeometry])

  useFrame((state, delta) => {
    elapsed.current += delta
    const time = elapsed.current
    const targetX = state.pointer.x * 1.1 + Math.sin(time * 0.16) * 0.4
    const targetY = 2.5 + state.pointer.y * 0.5 + Math.cos(time * 0.13) * 0.25
    state.camera.position.x += (targetX - state.camera.position.x) * 0.04
    state.camera.position.y += (targetY - state.camera.position.y) * 0.04
    state.camera.lookAt(LOOK_AT)
  })

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 6, 5]} intensity={1.5} />
      <directionalLight position={[-4, 2, -3]} intensity={0.8} color="#7dd3fc" />
      <pointLight position={[0, 1.5, 4]} intensity={18} color="#bae6fd" distance={14} />

      <Sparkles
        count={36}
        scale={[10, 4, 6]}
        size={2.2}
        speed={0.3}
        opacity={0.4}
        color="#7dd3fc"
      />

      <Line points={ARCH_LINE_POINTS} color="#38bdf8" lineWidth={1} transparent opacity={0.22} />

      {DENTAL_WORKFLOWS.map((workflow, index) => (
        <Tooth
          key={workflow.key}
          geometry={toothGeometry}
          position={PLACEMENTS[index].position}
          scale={PLACEMENTS[index].scale}
          accent={workflow.accent}
          index={index}
          isActive={index === activeIndex}
          onActivate={setHovered}
          onClear={() => setHovered(null)}
          onSelect={onSelect}
        />
      ))}

      <Html position={labelPosition} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-slate-900/90 px-3 py-1.5 shadow-[0_8px_22px_-10px_rgba(0,0,0,0.9)]">
          <ActiveIcon className="h-[18px] w-[18px] shrink-0" style={{ color: active.accent }} />
          <span className="text-xs font-semibold text-slate-100">{active.label}</span>
        </div>
      </Html>
    </>
  )
}

/**
 * Interactive WebGL dental arch (Three.js / React Three Fiber + drei).
 *
 * Nine stylized teeth fan along an arch; each maps to a clinic workflow. Hover
 * or click lifts and lights a tooth, a soft wave flows across the arch, the
 * camera drifts with a gentle pointer parallax, and the active tooth's label is
 * a crisp drei `<Html>` overlay (never blurred). Selection is owned by the
 * parent section so the accessible chip selector and the 3D arch stay in sync.
 *
 * Lazily imported and mounted only on pointer-fine, non-reduced-motion desktops;
 * mobile / reduced-motion render the static SVG arch instead. R3F disposes GL
 * resources on unmount; the shared geometry and document cursor are disposed
 * explicitly.
 *
 * Default export so it can be `React.lazy`-loaded.
 */
export default function DentalArchScene({
  selectedIndex,
  onSelect,
}: {
  selectedIndex: number
  onSelect: (index: number) => void
}) {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 2.5, 7.8], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ overflow: 'visible' }}
    >
      <ArchContents selectedIndex={selectedIndex} onSelect={onSelect} />
    </Canvas>
  )
}
