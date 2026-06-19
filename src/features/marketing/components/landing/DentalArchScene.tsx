import { Html, Sparkles, useGLTF } from '@react-three/drei'
import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { DENTAL_WORKFLOWS } from '../../data/dental-arch'

const MODEL_URL = '/base.glb'

// ── Arch layout ───────────────────────────────────────────────────────────────
// A true curved dental arch (horseshoe): the central incisors sit forward, the
// molars wrap back around the curve. Viewed from a slightly elevated, top-down
// camera so the arc reads as a real arcade and no tooth hides behind another.
const COUNT = DENTAL_WORKFLOWS.length
const RX = 3.05 // arch half-width
const RZ = 1.95 // arch depth (front teeth sit closest to the camera)
const THETA_MAX = (74 * Math.PI) / 180
const LEAN = 0.34 // each tooth reclines outward within the arch
const LOOK_AT = new THREE.Vector3(0, -0.12, 0.5)
const ENAMEL = '#eef5fb'

// GLB tooth normalization (model is ~1.9 tall, base at y=0, centred on x/z).
const MODEL_HEIGHT = 1.899
const NORM_SCALE = 0.52

type ToothVariantKey = 'incisor' | 'canine' | 'molar'

// One tooth model, scaled per arch position for incisor / canine / molar feel.
const VARIANT_SCALE: Record<ToothVariantKey, [number, number, number]> = {
  incisor: [0.82, 1.08, 0.82],
  canine: [0.92, 1.0, 0.92],
  molar: [1.2, 0.9, 1.2],
}

function archPoint(theta: number) {
  return { x: Math.sin(theta) * RX, y: 0, z: Math.cos(theta) * RZ }
}

type ToothPlacement = {
  position: THREE.Vector3
  yaw: number
  variant: ToothVariantKey
}

// Even arc-length placement so molars at the ends never bunch together.
const PLACEMENTS: ToothPlacement[] = (() => {
  const SAMPLES = 240
  const pts = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const theta = (-1 + (2 * i) / SAMPLES) * THETA_MAX
    return { theta, ...archPoint(theta) }
  })
  const cum = [0]
  for (let i = 1; i <= SAMPLES; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    cum.push(cum[i - 1] + Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z))
  }
  const total = cum[SAMPLES]

  return DENTAL_WORKFLOWS.map((_, k) => {
    const target = (COUNT === 1 ? 0.5 : k / (COUNT - 1)) * total
    let i = 1
    while (i < SAMPLES && cum[i] < target) i++
    const segT = (target - cum[i - 1]) / (cum[i] - cum[i - 1] || 1)
    const a = pts[i - 1]
    const b = pts[i]
    const theta = a.theta + (b.theta - a.theta) * segT
    const absT = Math.abs(theta) / THETA_MAX
    return {
      position: new THREE.Vector3(
        a.x + (b.x - a.x) * segT,
        a.y + (b.y - a.y) * segT,
        a.z + (b.z - a.z) * segT,
      ),
      yaw: theta, // turn each tooth to follow the curve (faces outward)
      variant: absT < 0.3 ? 'incisor' : absT < 0.62 ? 'canine' : 'molar',
    }
  })
})()

// ── One tooth: GLB mesh (premium enamel material) + forgiving hit target ──────
function Tooth({
  geometry,
  placement,
  accent,
  index,
  isActive,
  onActivate,
  onClear,
  onSelect,
}: {
  geometry: THREE.BufferGeometry
  placement: ToothPlacement
  accent: string
  index: number
  isActive: boolean
  onActivate: (index: number) => void
  onClear: () => void
  onSelect: (index: number) => void
}) {
  const visible = useRef<THREE.Group>(null)
  const lift = useRef(0)
  const elapsed = useRef(0)
  const [vx, vy, vz] = VARIANT_SCALE[placement.variant]
  const meshScale: [number, number, number] = [NORM_SCALE * vx, NORM_SCALE * vy, NORM_SCALE * vz]
  const meshOffsetY = -(MODEL_HEIGHT / 2) * NORM_SCALE * vy

  // Premium enamel material (the GLB ships a flat grey one — we override it so
  // the active tooth glows in its module accent).
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: ENAMEL,
      roughness: 0.32,
      metalness: 0.04,
      emissive: new THREE.Color(accent),
      emissiveIntensity: 0.12,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
  }, [accent])

  useEffect(() => () => material.dispose(), [material])

  useFrame((_, delta) => {
    elapsed.current += delta
    // Calm, slightly slow ease toward the active state.
    lift.current += ((isActive ? 1 : 0) - lift.current) * Math.min(1, delta * 6)

    const node = visible.current
    if (node) {
      node.position.y = lift.current * 0.18
      node.scale.setScalar(1 + lift.current * 0.07)
    }
    // Very gentle, slow light-flow wave across the arch (phase-offset per tooth).
    const wave = (Math.sin(elapsed.current * 0.55 - index * 0.5) * 0.5 + 0.5) * 0.12
    material.emissiveIntensity = 0.12 + wave + lift.current * 0.95
  })

  return (
    <group position={placement.position} rotation={[0, placement.yaw, 0]}>
      <group rotation={[LEAN, 0, 0]}>
        <group ref={visible}>
          <mesh
            geometry={geometry}
            material={material}
            scale={meshScale}
            position={[0, meshOffsetY, 0]}
          />
        </group>

        {/* Forgiving, invisible hit target — larger than the tooth so back/side
            teeth and near-misses still select reliably. */}
        <mesh
          position={[0, -0.05, 0]}
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
          <boxGeometry args={[1.05, 1.6, 1.05]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
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

  // Suspends until the GLB is fetched; drei caches and disposes the geometry.
  const { nodes } = useGLTF(MODEL_URL)
  const toothGeometry = (nodes.model as THREE.Mesh).geometry

  const labelPosition = useMemo(
    () => PLACEMENTS[activeIndex].position.clone().add(new THREE.Vector3(0, 1.05, 0.15)),
    [activeIndex],
  )

  useEffect(() => {
    return () => {
      document.body.style.cursor = ''
    }
  }, [])

  useFrame((state, delta) => {
    elapsed.current += delta
    const time = elapsed.current
    // Calm parallax that nearly freezes while a tooth is hovered, so the target
    // never drifts out from under the pointer.
    const damp = hovered !== null ? 0.12 : 1
    const targetX = (state.pointer.x * 0.34 + Math.sin(time * 0.05) * 0.1) * damp
    const targetY = 2.65 + (state.pointer.y * 0.18 + Math.cos(time * 0.045) * 0.07) * damp
    state.camera.position.x += (targetX - state.camera.position.x) * 0.022
    state.camera.position.y += (targetY - state.camera.position.y) * 0.022
    state.camera.lookAt(LOOK_AT)
  })

  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[2.5, 6, 5]} intensity={1.5} />
      <directionalLight position={[-4, 2.5, 2]} intensity={0.7} color="#7dd3fc" />
      <pointLight position={[0, 3, 4]} intensity={18} color="#bae6fd" distance={18} />

      <Sparkles
        count={26}
        scale={[11, 4, 5]}
        size={2}
        speed={0.16}
        opacity={0.32}
        color="#7dd3fc"
      />

      {DENTAL_WORKFLOWS.map((workflow, index) => (
        <Tooth
          key={workflow.key}
          geometry={toothGeometry}
          placement={PLACEMENTS[index]}
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
 * Nine instances of a real tooth GLB model (`/base.glb`) are seated in a true
 * curved horseshoe arch, each turned to follow the curve, reclined outward and
 * scaled per position (incisor / canine / molar), and viewed from a slightly
 * top-down camera so the arcade reads clearly. The GLB ships a flat grey
 * material, so each tooth gets a premium enamel material that glows in its
 * module accent on hover/selection. A slow wave drifts across the arch; the
 * camera holds an unobtrusive parallax that calms further while a tooth is
 * hovered. Every tooth carries an oversized invisible hit mesh so it stays easy
 * to click. The active tooth's label is a crisp drei `<Html>` overlay; selection
 * is owned by the parent section so the chip selector and arch stay in sync.
 *
 * Lazily imported and mounted only on pointer-fine, non-reduced-motion desktops;
 * the GLB is fetched on demand (never in the hero, never on mobile). R3F disposes
 * GL resources on unmount, drei manages the cached GLB geometry, and the
 * per-tooth materials and document cursor are disposed explicitly.
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
      camera={{ position: [0, 2.65, 6.6], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ overflow: 'visible' }}
    >
      <ArchContents selectedIndex={selectedIndex} onSelect={onSelect} />
    </Canvas>
  )
}

useGLTF.preload(MODEL_URL)
