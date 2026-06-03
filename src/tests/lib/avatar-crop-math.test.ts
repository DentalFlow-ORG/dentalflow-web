import {
  clampCropOffset,
  computeBaseScale,
  computeExportDestination,
} from '@/lib/avatar-crop-math'

const CROP = 280  // matching AvatarCropModal's CROP_SIZE
const OUT  = 512  // MAX_AVATAR_DIMENSION

// ── computeBaseScale (cover / fill) ──────────────────────────────────────────

describe('computeBaseScale', () => {
  it('landscape: shorter axis (height) fills cropSize, longer axis overflows', () => {
    // 1200×800 → max(280/1200, 280/800) = max(0.233, 0.35) = 0.35
    // displayH = 800 * 0.35 = 280 (fills), displayW = 1200 * 0.35 = 420 (overflows)
    expect(computeBaseScale(1200, 800, CROP)).toBeCloseTo(0.35)
  })

  it('portrait: shorter axis (width) fills cropSize, longer axis overflows', () => {
    // 800×1200 → max(280/800, 280/1200) = 0.35
    expect(computeBaseScale(800, 1200, CROP)).toBeCloseTo(0.35)
  })

  it('returns 1 for a square image equal to cropSize', () => {
    expect(computeBaseScale(280, 280, CROP)).toBeCloseTo(1)
  })

  it('scales up small images so they cover the viewport (returns > 1)', () => {
    // 120×120 → max(280/120, 280/120) ≈ 2.333
    expect(computeBaseScale(120, 120, CROP)).toBeCloseTo(280 / 120)
  })

  it('uses the LARGER of the two axis scales (cover, not contain)', () => {
    // 300×100 → max(280/300, 280/100) = max(0.933, 2.8) = 2.8
    expect(computeBaseScale(300, 100, CROP)).toBeCloseTo(2.8)
  })

  it('handles degenerate natural size of 1×1 without division by zero', () => {
    expect(computeBaseScale(1, 1, CROP)).toBe(CROP)
  })

  it('landscape: displayH equals cropSize at baseScale (shorter axis fills exactly)', () => {
    const scale = computeBaseScale(1200, 800, CROP)
    expect(800 * scale).toBeCloseTo(CROP)
  })

  it('landscape: displayW > cropSize at baseScale (longer axis overflows)', () => {
    const scale = computeBaseScale(1200, 800, CROP)
    expect(1200 * scale).toBeGreaterThan(CROP)
  })

  it('portrait: displayW equals cropSize at baseScale (shorter axis fills exactly)', () => {
    const scale = computeBaseScale(800, 1200, CROP)
    expect(800 * scale).toBeCloseTo(CROP)
  })

  it('landscape and portrait with same dimensions produce equal baseScale', () => {
    expect(computeBaseScale(1200, 800, CROP)).toBeCloseTo(computeBaseScale(800, 1200, CROP))
  })
})

// ── clampCropOffset (cover clamp) ─────────────────────────────────────────────

describe('clampCropOffset', () => {
  // With cover scale: maxOx = max(0, (displayW - cropSize) / 2)
  // Image exactly at cropSize → maxOx = 0 (no drag needed, image fills perfectly)
  // Image wider than cropSize → maxOx > 0 (can drag to see different parts)

  it('no drag allowed when displayW equals cropSize (image already covers exactly)', () => {
    const { clampedOx } = clampCropOffset(50, 0, CROP, CROP, CROP)
    expect(clampedOx).toBe(0)
  })

  it('passes offset within the drag range unchanged', () => {
    // displayW=420 → maxOx=(420-280)/2=70; 50 < 70
    const { clampedOx } = clampCropOffset(50, 0, 420, CROP, CROP)
    expect(clampedOx).toBe(50)
  })

  it('clamps positive offset to maxOx when too large', () => {
    // displayW=420 → maxOx=70
    const { clampedOx } = clampCropOffset(999, 0, 420, CROP, CROP)
    expect(clampedOx).toBe(70)
  })

  it('clamps negative offset to -maxOx when too large', () => {
    const { clampedOx } = clampCropOffset(-999, 0, 420, CROP, CROP)
    expect(clampedOx).toBe(-70)
  })

  it('clamp is symmetric: pos and neg inputs produce mirrored outputs', () => {
    const pos = clampCropOffset(999, 0, 420, CROP, CROP)
    const neg = clampCropOffset(-999, 0, 420, CROP, CROP)
    expect(pos.clampedOx).toBe(-neg.clampedOx)
  })

  it('portrait: no horizontal drag (width fills exactly), vertical drag allowed', () => {
    // displayW=280 → maxOx=0; displayH=420 → maxOy=70
    const { clampedOx, clampedOy } = clampCropOffset(50, 50, CROP, 420, CROP)
    expect(clampedOx).toBe(0)   // width fills → no horizontal drag
    expect(clampedOy).toBe(50)  // within ±70
  })

  it('crop area is never exposed: imageLeft >= -(displayW-cropSize)/2', () => {
    // With ox at max, imageLeft = (cropSize-displayW)/2 + maxOx = 0 (image left edge at viewport left)
    const maxOx = 70
    const { clampedOx } = clampCropOffset(maxOx, 0, 420, CROP, CROP)
    const imageLeft = (CROP - 420) / 2 + clampedOx
    expect(imageLeft).toBeCloseTo(0)
  })

  it('crop area is never exposed on the right: imageLeft+displayW >= cropSize', () => {
    const { clampedOx } = clampCropOffset(-999, 0, 420, CROP, CROP)
    const imageLeft = (CROP - 420) / 2 + clampedOx
    const imageRight = imageLeft + 420
    expect(imageRight).toBeCloseTo(CROP)
  })
})

// ── computeExportDestination ──────────────────────────────────────────────────

describe('computeExportDestination', () => {
  function exportDest(
    naturalW: number,
    naturalH: number,
    zoom: number,
    ox = 0,
    oy = 0,
  ) {
    const base = computeBaseScale(naturalW, naturalH, CROP)
    const effectiveScale = base * zoom
    const displayW = naturalW * effectiveScale
    const displayH = naturalH * effectiveScale
    const { clampedOx, clampedOy } = clampCropOffset(ox, oy, displayW, displayH, CROP)
    return computeExportDestination({
      naturalW,
      naturalH,
      cropSize: CROP,
      effectiveScale,
      clampedOx,
      clampedOy,
      outputSize: OUT,
    })
  }

  // ── Landscape 1200×800 ────────────────────────────────────────────────────

  it('landscape at zoom 1: dh fills output, image overflows left/right', () => {
    const { dx, dy, dw, dh } = exportDest(1200, 800, 1)
    // base=0.35, displayW=420, displayH=280 (=CROP)
    // imageLeft=(280-420)/2=-70, imageTop=0
    expect(dx).toBeCloseTo(-70 * (OUT / CROP))
    expect(dy).toBeCloseTo(0)
    expect(dw).toBeCloseTo(420 * (OUT / CROP))
    expect(dh).toBeCloseTo(OUT)
  })

  it('landscape at zoom 2: both axes overflow the viewport', () => {
    const { dx, dy, dw, dh } = exportDest(1200, 800, 2)
    // eff=0.7, displayW=840, displayH=560
    // imageLeft=(280-840)/2=-280, imageTop=(280-560)/2=-140
    expect(dx).toBeCloseTo(-280 * (OUT / CROP))
    expect(dy).toBeCloseTo(-140 * (OUT / CROP))
    expect(dw).toBeCloseTo(840 * (OUT / CROP))
    expect(dh).toBeCloseTo(560 * (OUT / CROP))
  })

  // ── Portrait 800×1200 ─────────────────────────────────────────────────────

  it('portrait at zoom 1: dw fills output, image overflows top/bottom', () => {
    const { dx, dy, dw, dh } = exportDest(800, 1200, 1)
    // base=0.35, displayW=280 (=CROP), displayH=420
    // imageLeft=0, imageTop=(280-420)/2=-70
    expect(dx).toBeCloseTo(0)
    expect(dy).toBeCloseTo(-70 * (OUT / CROP))
    expect(dw).toBeCloseTo(OUT)
    expect(dh).toBeCloseTo(420 * (OUT / CROP))
  })

  // ── Square image ──────────────────────────────────────────────────────────

  it('square image at zoom 1: destination fills output canvas exactly', () => {
    // 280×280 → base=1, displayW=displayH=280, imageLeft=imageTop=0
    const { dx, dy, dw, dh } = exportDest(280, 280, 1)
    expect(dx).toBeCloseTo(0)
    expect(dy).toBeCloseTo(0)
    expect(dw).toBeCloseTo(OUT)
    expect(dh).toBeCloseTo(OUT)
  })

  // ── Aspect ratio preservation ─────────────────────────────────────────────

  it('dw/dh equals naturalW/naturalH at zoom 1 (aspect ratio preserved)', () => {
    const { dw, dh } = exportDest(1200, 800, 1)
    expect(dw / dh).toBeCloseTo(1200 / 800)
  })

  it('dw/dh equals naturalW/naturalH at zoom 2 (zoom does not distort)', () => {
    const { dw, dh } = exportDest(1200, 800, 2)
    expect(dw / dh).toBeCloseTo(1200 / 800)
  })

  // ── Zoom uniformity ───────────────────────────────────────────────────────

  it('zoom 2 doubles both dw and dh compared to zoom 1', () => {
    const r1 = exportDest(1200, 800, 1)
    const r2 = exportDest(1200, 800, 2)
    expect(r2.dw).toBeCloseTo(r1.dw * 2)
    expect(r2.dh).toBeCloseTo(r1.dh * 2)
  })

  it('zooming in increases dw (image occupies more canvas space)', () => {
    const { dw: dw1 } = exportDest(1200, 800, 1)
    const { dw: dw2 } = exportDest(1200, 800, 2)
    expect(dw2).toBeGreaterThan(dw1)
  })

  // ── Drag offset ───────────────────────────────────────────────────────────

  it('dragging right (positive ox) shifts dx positively', () => {
    const { dx: dx0 }  = exportDest(1200, 800, 1, 0)
    const { dx: dx30 } = exportDest(1200, 800, 1, 30)
    // ox=30 → clampedOx=30 (within ±70) → imageLeft increases by 30
    expect(dx30).toBeCloseTo(dx0 + 30 * (OUT / CROP))
  })

  it('dragging left (negative ox) shifts dx negatively', () => {
    const { dx: dx0 }   = exportDest(1200, 800, 1, 0)
    const { dx: dxNeg } = exportDest(1200, 800, 1, -30)
    expect(dxNeg).toBeCloseTo(dx0 - 30 * (OUT / CROP))
  })

  // ── Cover guarantee ───────────────────────────────────────────────────────

  it('landscape at zoom 1: dh equals output size (crop area never empty vertically)', () => {
    const { dh } = exportDest(1200, 800, 1)
    expect(dh).toBeCloseTo(OUT)
  })

  it('portrait at zoom 1: dw equals output size (crop area never empty horizontally)', () => {
    const { dw } = exportDest(800, 1200, 1)
    expect(dw).toBeCloseTo(OUT)
  })
})
