import { Html, Sparkles } from '@react-three/drei'
import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { DENTAL_WORKFLOWS } from '../../data/dental-arch'

// ── Arch layout ───────────────────────────────────────────────────────────────
// A flat, front-facing ∩ "smile" arch: teeth spread across X (so none occlude or
// bunch), the centre sits highest, the ends curve down, with only a gentle Z
// recession for depth. Placed by even arc-length so spacing stays consistent.
const COUNT = DENTAL_WORKFLOWS.length
const ARCH_W = 3.45 // horizontal half-spread
const ARCH_H = 1.0 // vertical rise of the smile
const Z_DEPTH = 0.55 // how far the ends recede from the camera
const Y_OFFSET = 0.42 // re-centres the arch vertically
const THETA_MAX = (60 * Math.PI) / 180
const GLOBAL = 0.82 // global tooth size factor
const LOOK_AT = new THREE.Vector3(0, 0.2, -0.1)
const ENAMEL = '#eef5fb'

type ToothPlacement = {
  position: THREE.Vector3
  rotation: [number, number, number]
  scale: [number, number, number]
}

function archPoint(theta: number) {
  return {
    x: Math.sin(theta) * ARCH_W,
    y: Math.cos(theta) * ARCH_H - Y_OFFSET,
    z: -(1 - Math.cos(theta)) * Z_DEPTH,
  }
}

// Even arc-length placement so molars at the ends don't bunch together.
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
    const m = Math.abs(theta) / THETA_MAX
    return {
      position: new THREE.Vector3(
        a.x + (b.x - a.x) * segT,
        a.y + (b.y - a.y) * segT,
        a.z + (b.z - a.z) * segT,
      ),
      // Slight backward lean + a gentle outward fan following the smile tangent.
      rotation: [-0.12, 0, -theta * 0.4],
      // Molars (ends) wider and a touch shorter; incisors (centre) narrower/taller.
      scale: [GLOBAL * (0.82 + m * 0.32), GLOBAL * (1.05 - m * 0.16), GLOBAL],
    }
  })
})()

/**
 * Build one stylized tooth: an extruded, bevelled silhouette — a rounded enamel
 * crown that narrows at the cervical neck and splits into two short roots. Reads
 * clearly as a tooth (not a pin/peg), stays premium and sculptural via the
 * bevel + depth. Shared across all nine teeth and scaled per position.
 */
function buildToothGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0.58)
  shape.bezierCurveTo(0.26, 0.6, 0.4, 0.54, 0.4, 0.4) // rounded crown shoulder (right)
  shape.bezierCurveTo(0.4, 0.18, 0.31, 0.1, 0.27, -0.05) // narrow to cervical neck
  shape.bezierCurveTo(0.25, -0.28, 0.24, -0.48, 0.17, -0.54) // right root
  shape.bezierCurveTo(0.11, -0.59, 0.06, -0.4, 0, -0.3) // notch between roots
  shape.bezierCurveTo(-0.06, -0.4, -0.11, -0.59, -0.17, -0.54) // left root (mirror)
  shape.bezierCurveTo(-0.24, -0.48, -0.25, -0.28, -0.27, -0.05)
  shape.bezierCurveTo(-0.31, 0.1, -0.4, 0.18, -0.4, 0.4)
  shape.bezierCurveTo(-0.4, 0.54, -0.26, 0.6, 0, 0.58)

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.32,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 5,
    curveSegments: 20,
  })
  geometry.center()
  geometry.computeVertexNormals()
  return geometry
}

// ── One tooth: visible mesh + forgiving hit target + hover/select lift ────────
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
  const visible = useRef<THREE.Mesh>(null)
  const lift = useRef(0)
  const elapsed = useRef(0)
  const { scale } = placement

  useFrame((_, delta) => {
    elapsed.current += delta
    // Calm, slightly slow ease toward the active state.
    lift.current += ((isActive ? 1 : 0) - lift.current) * Math.min(1, delta * 6)

    const node = visible.current
    if (!node) return
    node.position.y = lift.current * 0.18
    const k = 1 + lift.current * 0.08
    node.scale.set(scale[0] * k, scale[1] * k, scale[2] * k)

    const mat = node.material as THREE.MeshStandardMaterial
    // Very gentle, slow light-flow wave across the arch (phase-offset per tooth).
    const wave = (Math.sin(elapsed.current * 0.55 - index * 0.5) * 0.5 + 0.5) * 0.12
    mat.emissiveIntensity = 0.12 + wave + lift.current * 0.95
  })

  return (
    <group position={placement.position} rotation={placement.rotation}>
      <mesh ref={visible} geometry={geometry} scale={scale}>
        <meshStandardMaterial
          color={ENAMEL}
          roughness={0.34}
          metalness={0.04}
          emissive={accent}
          emissiveIntensity={0.12}
          toneMapped={false}
        />
      </mesh>

      {/* Forgiving, invisible hit target — larger than the tooth so back teeth
          and near-misses still select reliably. */}
      <mesh
        scale={[scale[0] * 1.18, scale[1] * 1.06, 1.6]}
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
        <boxGeometry args={[0.95, 1.3, 0.6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
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

  const toothGeometry = useMemo(buildToothGeometry, [])
  const labelPosition = useMemo(
    () => PLACEMENTS[activeIndex].position.clone().add(new THREE.Vector3(0, 0.92, 0.25)),
    [activeIndex],
  )

  useEffect(() => {
    return () => {
      toothGeometry.dispose()
      document.body.style.cursor = ''
    }
  }, [toothGeometry])

  useFrame((state, delta) => {
    elapsed.current += delta
    const time = elapsed.current
    // Calm parallax that nearly freezes while a tooth is hovered, so the target
    // never drifts out from under the pointer.
    const damp = hovered !== null ? 0.12 : 1
    const targetX = (state.pointer.x * 0.32 + Math.sin(time * 0.05) * 0.1) * damp
    const targetY = 0.55 + (state.pointer.y * 0.14 + Math.cos(time * 0.045) * 0.06) * damp
    state.camera.position.x += (targetX - state.camera.position.x) * 0.022
    state.camera.position.y += (targetY - state.camera.position.y) * 0.022
    state.camera.lookAt(LOOK_AT)
  })

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[2.5, 5, 6]} intensity={1.45} />
      <directionalLight position={[-4, 1.5, 2]} intensity={0.7} color="#7dd3fc" />
      <pointLight position={[0, 1.2, 4]} intensity={16} color="#bae6fd" distance={16} />

      <Sparkles
        count={28}
        scale={[11, 4, 4]}
        size={2}
        speed={0.18}
        opacity={0.35}
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
 * Nine stylized, extruded teeth sit in a flat front-facing smile arch; each maps
 * to a clinic workflow. Hover or click gently lifts and lights a tooth, a slow
 * wave drifts across the arch, and the camera holds an unobtrusive parallax that
 * calms further while a tooth is hovered. Each tooth carries an oversized
 * invisible hit mesh so every tooth — including the molars at the ends — is easy
 * to click. The active tooth's label is a crisp drei `<Html>` overlay. Selection
 * is owned by the parent section so the chip selector and arch stay in sync.
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
      camera={{ position: [0, 0.55, 7.4], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ overflow: 'visible' }}
    >
      <ArchContents selectedIndex={selectedIndex} onSelect={onSelect} />
    </Canvas>
  )
}
