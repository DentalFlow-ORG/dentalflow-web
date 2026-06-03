import {
  clampCropOffset,
  computeBaseScale,
  computeCropExportRect,
} from '@/lib/avatar-crop-math'

const CROP = 240  // matching AvatarCropModal's CROP_SIZE

// ── computeBaseScale ──────────────────────────────────────────────────────────

describe('computeBaseScale', () => {
  it('uses height as limiting dimension for landscape (wider than tall)', () => {
    // 1200×800 → max(240/1200, 240/800) = max(0.2, 0.3) = 0.3
    expect(computeBaseScale(1200, 800, CROP)).toBeCloseTo(0.3)
  })

  it('uses width as limiting dimension for portrait (taller than wide)', () => {
    // 800×1200 → max(240/800, 240/1200) = max(0.3, 0.2) = 0.3
    expect(computeBaseScale(800, 1200, CROP)).toBeCloseTo(0.3)
  })

  it('returns 1 for a square image equal to cropSize', () => {
    expect(computeBaseScale(240, 240, CROP)).toBeCloseTo(1)
  })

  it('returns > 1 for an image smaller than cropSize (scale up to fill)', () => {
    // 120×120 needs 2× scale to fill 240
    expect(computeBaseScale(120, 120, CROP)).toBeCloseTo(2)
  })

  it('uses the LARGER of the two axis scales (cover behaviour)', () => {
    // 300×100 → max(240/300, 240/100) = max(0.8, 2.4) = 2.4
    expect(computeBaseScale(300, 100, CROP)).toBeCloseTo(2.4)
  })

  it('handles degenerate natural size of 1×1 without division by zero', () => {
    expect(computeBaseScale(1, 1, CROP)).toBe(CROP)
  })

  it('produces equal displayW and displayH only for square images', () => {
    const scale = computeBaseScale(1200, 800, CROP)
    // displayW = 1200 * 0.3 = 360, displayH = 800 * 0.3 = 240
    expect(1200 * scale).not.toBeCloseTo(800 * scale)
  })
})

// ── clampCropOffset ───────────────────────────────────────────────────────────

describe('clampCropOffset', () => {
  it('returns (0,0) when displayW and displayH equal cropSize (no slack to drag)', () => {
    const result = clampCropOffset(99, 99, CROP, CROP, CROP)
    expect(result.clampedOx).toBe(0)
    expect(result.clampedOy).toBe(0)
  })

  it('passes through offset within the allowed range', () => {
    // displayW=360 → maxOx=(360-240)/2=60; offset=30 is within bounds
    const { clampedOx, clampedOy } = clampCropOffset(30, 20, 360, 280, CROP)
    expect(clampedOx).toBe(30)
    expect(clampedOy).toBe(20)
  })

  it('clamps positive offset to maxOx when too large', () => {
    const { clampedOx } = clampCropOffset(999, 0, 360, CROP, CROP)
    // maxOx = (360-240)/2 = 60
    expect(clampedOx).toBe(60)
  })

  it('clamps negative offset to -maxOx when too large (opposite direction)', () => {
    const { clampedOx } = clampCropOffset(-999, 0, 360, CROP, CROP)
    expect(clampedOx).toBe(-60)
  })

  it('handles portrait where height creates slack and width does not', () => {
    // displayW=240 (no horizontal slack), displayH=360 (vertical slack=60)
    const { clampedOx, clampedOy } = clampCropOffset(50, 50, CROP, 360, CROP)
    expect(clampedOx).toBe(0)   // no slack → clamped to 0
    expect(clampedOy).toBe(50)  // within ±60
  })

  it('preserves symmetry: clampedOx == -clampedOx with opposite input', () => {
    const pos = clampCropOffset(30, 0, 360, CROP, CROP)
    const neg = clampCropOffset(-30, 0, 360, CROP, CROP)
    expect(pos.clampedOx).toBe(-neg.clampedOx)
  })
})

// ── computeCropExportRect ─────────────────────────────────────────────────────

describe('computeCropExportRect', () => {
  function exportRect(
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
    return computeCropExportRect({
      naturalW,
      naturalH,
      cropSize: CROP,
      effectiveScale,
      clampedOx,
      clampedOy,
    })
  }

  // ── Landscape 1200×800 ────────────────────────────────────────────────────

  it('landscape at zoom 1 no drag: srcX=200, srcY=0, srcSize=800', () => {
    const { srcX, srcY, srcSize } = exportRect(1200, 800, 1)
    // baseScale=0.3 → effectiveScale=0.3 → srcSize=240/0.3=800
    // imageLeft=(240-360)/2=-60 → srcX=60/0.3=200
    expect(srcX).toBeCloseTo(200)
    expect(srcY).toBeCloseTo(0)
    expect(srcSize).toBeCloseTo(800)
  })

  it('landscape at zoom 2 no drag: takes a smaller central crop', () => {
    const { srcX, srcY, srcSize } = exportRect(1200, 800, 2)
    // effectiveScale=0.6 → srcSize=240/0.6=400
    // imageLeft=(240-720)/2=-240 → srcX=240/0.6=400
    // imageTop=(240-480)/2=-120 → srcY=120/0.6=200
    expect(srcX).toBeCloseTo(400)
    expect(srcY).toBeCloseTo(200)
    expect(srcSize).toBeCloseTo(400)
  })

  it('srcX + srcSize <= naturalW (crop never escapes right edge)', () => {
    const { srcX, srcSize } = exportRect(1200, 800, 1)
    expect(srcX + srcSize).toBeLessThanOrEqual(1200 + 0.001)
  })

  it('srcY + srcSize <= naturalH (crop never escapes bottom edge)', () => {
    const { srcX: _, srcY, srcSize } = exportRect(1200, 800, 1)
    expect(srcY + srcSize).toBeLessThanOrEqual(800 + 0.001)
  })

  // ── Portrait 800×1200 ─────────────────────────────────────────────────────

  it('portrait at zoom 1 no drag: srcX=0, srcY=200, srcSize=800', () => {
    const { srcX, srcY, srcSize } = exportRect(800, 1200, 1)
    // baseScale = max(240/800, 240/1200) = 0.3
    // displayW=240 (no left overflow), displayH=360 (vertical overflow)
    // imageLeft=(240-240)/2=0 → srcX=0
    // imageTop=(240-360)/2=-60 → srcY=60/0.3=200
    expect(srcX).toBeCloseTo(0)
    expect(srcY).toBeCloseTo(200)
    expect(srcSize).toBeCloseTo(800)
  })

  // ── Drag offset ───────────────────────────────────────────────────────────

  it('dragging right (positive ox) shifts srcX left (shows more of left side)', () => {
    const { srcX: centerSrcX } = exportRect(1200, 800, 1, 0)
    const { srcX: draggedSrcX } = exportRect(1200, 800, 1, 30)
    expect(draggedSrcX).toBeLessThan(centerSrcX)
  })

  it('dragging left (negative ox) shifts srcX right (shows more of right side)', () => {
    const { srcX: centerSrcX } = exportRect(1200, 800, 1, 0)
    const { srcX: draggedSrcX } = exportRect(1200, 800, 1, -30)
    expect(draggedSrcX).toBeGreaterThan(centerSrcX)
  })

  it('drag offset is reflected in srcX change proportional to scale', () => {
    // base=0.3, ox=30 → clampedOx=30 → imageLeft=-60+30=-30 → srcX=30/0.3=100
    const { srcX } = exportRect(1200, 800, 1, 30)
    expect(srcX).toBeCloseTo(100)
  })

  // ── Square image ──────────────────────────────────────────────────────────

  it('square image at zoom 1: srcX=srcY=0, srcSize=naturalW (no crop)', () => {
    const { srcX, srcY, srcSize } = exportRect(240, 240, 1)
    expect(srcX).toBeCloseTo(0)
    expect(srcY).toBeCloseTo(0)
    expect(srcSize).toBeCloseTo(240)
  })

  // ── Zoom uniformity ───────────────────────────────────────────────────────

  it('srcSize is the same in both axes (uniform square crop, no stretching)', () => {
    // srcSize is a single value used for both W and H in drawImage
    const r1 = exportRect(1200, 800, 1)
    const r2 = exportRect(1200, 800, 2)
    // Both should return a single srcSize (not separate srcW/srcH)
    expect(typeof r1.srcSize).toBe('number')
    expect(typeof r2.srcSize).toBe('number')
    expect(r2.srcSize).toBeLessThan(r1.srcSize) // more zoom → smaller source crop
  })

  it('increasing zoom halves srcSize relative to zoom factor', () => {
    const { srcSize: s1 } = exportRect(1200, 800, 1)
    const { srcSize: s2 } = exportRect(1200, 800, 2)
    expect(s2).toBeCloseTo(s1 / 2)
  })

  // ── Clamping ──────────────────────────────────────────────────────────────

  it('srcX is never negative even with extreme drag offset', () => {
    const { srcX } = exportRect(1200, 800, 1, 9999)
    expect(srcX).toBeGreaterThanOrEqual(0)
  })

  it('srcY is never negative even with extreme drag offset', () => {
    const { srcY } = exportRect(1200, 800, 1, 0, 9999)
    expect(srcY).toBeGreaterThanOrEqual(0)
  })
})
