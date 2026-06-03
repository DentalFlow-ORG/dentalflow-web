import {
  clampCropOffset,
  computeBaseScale,
  computeExportDestination,
} from '@/lib/avatar-crop-math'

const CROP = 240  // matching AvatarCropModal's CROP_SIZE
const OUT  = 512  // MAX_AVATAR_DIMENSION

// ── computeBaseScale (fit / contain) ──────────────────────────────────────────

describe('computeBaseScale', () => {
  it('fits landscape: width fills cropSize, height has gap (smaller scale wins)', () => {
    // 1200×800 → min(240/1200, 240/800) = min(0.2, 0.3) = 0.2
    expect(computeBaseScale(1200, 800, CROP)).toBeCloseTo(0.2)
  })

  it('fits portrait: height fills cropSize, width has gap', () => {
    // 800×1200 → min(240/800, 240/1200) = min(0.3, 0.2) = 0.2
    expect(computeBaseScale(800, 1200, CROP)).toBeCloseTo(0.2)
  })

  it('returns 1 for a square image equal to cropSize', () => {
    expect(computeBaseScale(240, 240, CROP)).toBeCloseTo(1)
  })

  it('scales up small images to fit (returns > 1)', () => {
    // 120×120 → min(2, 2) = 2
    expect(computeBaseScale(120, 120, CROP)).toBeCloseTo(2)
  })

  it('uses the SMALLER of the two axis scales (contain, not cover)', () => {
    // 300×100 → min(240/300, 240/100) = min(0.8, 2.4) = 0.8
    expect(computeBaseScale(300, 100, CROP)).toBeCloseTo(0.8)
  })

  it('handles degenerate natural size of 1×1 without division by zero', () => {
    expect(computeBaseScale(1, 1, CROP)).toBe(CROP)
  })

  it('landscape: displayW equals cropSize at baseScale (width is the limiting axis)', () => {
    const scale = computeBaseScale(1200, 800, CROP)
    expect(1200 * scale).toBeCloseTo(CROP)
  })

  it('landscape: displayH < cropSize at baseScale (vertical gap is expected)', () => {
    const scale = computeBaseScale(1200, 800, CROP)
    expect(800 * scale).toBeLessThan(CROP)
  })

  it('portrait: displayH equals cropSize at baseScale (height is the limiting axis)', () => {
    const scale = computeBaseScale(800, 1200, CROP)
    expect(1200 * scale).toBeCloseTo(CROP)
  })
})

// ── clampCropOffset (generous clamp) ─────────────────────────────────────────

describe('clampCropOffset', () => {
  // minOverlap = CROP/4 = 60
  // maxOx = (cropSize + displayW)/2 - minOverlap

  it('passes offset within the generous range unchanged', () => {
    // displayW=240 → maxOx=(240+240)/2-60=180; 100 < 180
    const { clampedOx } = clampCropOffset(100, 0, CROP, CROP, CROP)
    expect(clampedOx).toBe(100)
  })

  it('clamps positive offset to maxOx when too large', () => {
    // displayW=240 → maxOx=180
    const { clampedOx } = clampCropOffset(999, 0, CROP, CROP, CROP)
    expect(clampedOx).toBe(180)
  })

  it('clamps negative offset to -maxOx when too large (opposite direction)', () => {
    const { clampedOx } = clampCropOffset(-999, 0, CROP, CROP, CROP)
    expect(clampedOx).toBe(-180)
  })

  it('clamp is symmetric: pos and neg inputs produce mirrored outputs', () => {
    const pos = clampCropOffset(500, 0, CROP, CROP, CROP)
    const neg = clampCropOffset(-500, 0, CROP, CROP, CROP)
    expect(pos.clampedOx).toBe(-neg.clampedOx)
  })

  it('larger displayW allows larger maxOx', () => {
    // displayW=400 → maxOx=(240+400)/2-60=320-60=260
    const { clampedOx } = clampCropOffset(999, 0, 400, CROP, CROP)
    expect(clampedOx).toBe(260)
  })

  it('x and y axes are clamped independently', () => {
    // displayW=240 maxOx=180, displayH=200 maxOy=(240+200)/2-60=160
    const { clampedOx, clampedOy } = clampCropOffset(100, 200, CROP, 200, CROP)
    expect(clampedOx).toBe(100) // 100 < 180 → passes through
    expect(clampedOy).toBe(160) // 200 > 160 → clamped
  })

  it('allows image to be positioned so empty space shows inside the viewport', () => {
    // At fit scale for landscape, displayW=240, so ox=0 means image is centered
    // but the user can still drag it — clamping only prevents full disappearance
    const { clampedOx } = clampCropOffset(50, 0, CROP, CROP, CROP)
    expect(clampedOx).toBe(50) // drag is permitted
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

  it('landscape at zoom 1: dw fills output, dy has vertical centering offset', () => {
    const { dx, dy, dw, dh } = exportDest(1200, 800, 1)
    // baseScale=0.2, displayW=240 → imageLeft=0, dx=0
    // displayH=160, imageTop=(240-160)/2=40
    expect(dx).toBeCloseTo(0)
    expect(dy).toBeCloseTo(40 * (OUT / CROP))
    expect(dw).toBeCloseTo(OUT)
    expect(dh).toBeCloseTo(160 * (OUT / CROP))
  })

  it('landscape at zoom 2: image grows and overflows viewport on all sides', () => {
    const { dx, dy, dw, dh } = exportDest(1200, 800, 2)
    // effectiveScale=0.4, displayW=480, imageLeft=(240-480)/2=-120
    // displayH=320, imageTop=(240-320)/2=-40
    expect(dx).toBeCloseTo(-120 * (OUT / CROP))
    expect(dy).toBeCloseTo(-40  * (OUT / CROP))
    expect(dw).toBeCloseTo(480 * (OUT / CROP))
    expect(dh).toBeCloseTo(320 * (OUT / CROP))
  })

  // ── Portrait 800×1200 ─────────────────────────────────────────────────────

  it('portrait at zoom 1: dh fills output, dx has horizontal centering offset', () => {
    const { dx, dy, dw, dh } = exportDest(800, 1200, 1)
    // baseScale=0.2, displayW=160, imageLeft=40
    // displayH=240 → imageTop=0
    expect(dx).toBeCloseTo(40 * (OUT / CROP))
    expect(dy).toBeCloseTo(0)
    expect(dw).toBeCloseTo(160 * (OUT / CROP))
    expect(dh).toBeCloseTo(OUT)
  })

  // ── Square image ──────────────────────────────────────────────────────────

  it('square image at zoom 1: destination fills output canvas exactly', () => {
    const { dx, dy, dw, dh } = exportDest(240, 240, 1)
    expect(dx).toBeCloseTo(0)
    expect(dy).toBeCloseTo(0)
    expect(dw).toBeCloseTo(OUT)
    expect(dh).toBeCloseTo(OUT)
  })

  // ── Aspect ratio preservation ─────────────────────────────────────────────

  it('dw/dh preserves the natural aspect ratio at zoom 1', () => {
    const { dw, dh } = exportDest(1200, 800, 1)
    expect(dw / dh).toBeCloseTo(1200 / 800)
  })

  it('dw/dh preserves the natural aspect ratio at zoom 2', () => {
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

  it('zooming in increases dw (image appears larger in export)', () => {
    const { dw: dw1 } = exportDest(1200, 800, 1)
    const { dw: dw2 } = exportDest(1200, 800, 2)
    expect(dw2).toBeGreaterThan(dw1)
  })

  // ── Drag offset ───────────────────────────────────────────────────────────

  it('dragging right (positive ox) shifts dx positively', () => {
    const { dx: dx0 }  = exportDest(1200, 800, 1, 0)
    const { dx: dx30 } = exportDest(1200, 800, 1, 30)
    // ox=30 → clampedOx=30 → imageLeft += 30 → dx += 30*(OUT/CROP)
    expect(dx30).toBeCloseTo(dx0 + 30 * (OUT / CROP))
  })

  it('dragging left (negative ox) shifts dx negatively', () => {
    const { dx: dx0 }   = exportDest(1200, 800, 1, 0)
    const { dx: dxNeg } = exportDest(1200, 800, 1, -30)
    expect(dxNeg).toBeCloseTo(dx0 - 30 * (OUT / CROP))
  })
})
