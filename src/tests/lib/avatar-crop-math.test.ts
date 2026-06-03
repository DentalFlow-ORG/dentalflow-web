import {
  clampCropPosition,
  computeCropExportTransform,
  computeInitialImageTransform,
  computeRotatedDimensions,
  getCropStageLayout,
  rotateLeft,
  type RotationDegrees,
} from '@/lib/avatar-crop-math'

const CROP = 312
const OUT = 512

describe('computeRotatedDimensions', () => {
  it('keeps landscape dimensions at 0 and 180 degrees', () => {
    expect(computeRotatedDimensions(1200, 800, 0)).toEqual({ width: 1200, height: 800 })
    expect(computeRotatedDimensions(1200, 800, 180)).toEqual({ width: 1200, height: 800 })
  })

  it('swaps width and height at 90 and 270 degrees', () => {
    expect(computeRotatedDimensions(1200, 800, 90)).toEqual({ width: 800, height: 1200 })
    expect(computeRotatedDimensions(1200, 800, 270)).toEqual({ width: 800, height: 1200 })
  })
})

describe('rotateLeft', () => {
  it('follows the required 0, 270, 180, 90, 0 cycle', () => {
    const sequence: RotationDegrees[] = []
    let rotation: RotationDegrees = 0

    for (let i = 0; i < 5; i++) {
      sequence.push(rotation)
      rotation = rotateLeft(rotation)
    }

    expect(sequence).toEqual([0, 270, 180, 90, 0])
  })
})

describe('computeInitialImageTransform', () => {
  it('landscape image preserves aspect ratio and allows horizontal overflow', () => {
    const transform = computeInitialImageTransform({
      naturalW: 1200,
      naturalH: 800,
      rotation: 0,
      cropSize: CROP,
    })

    expect(transform.displayWidth / transform.displayHeight).toBeCloseTo(1200 / 800)
    expect(transform.displayHeight).toBeCloseTo(CROP)
    expect(transform.displayWidth).toBeGreaterThan(CROP)
  })

  it('portrait image preserves aspect ratio and allows vertical overflow', () => {
    const transform = computeInitialImageTransform({
      naturalW: 800,
      naturalH: 1200,
      rotation: 0,
      cropSize: CROP,
    })

    expect(transform.displayWidth / transform.displayHeight).toBeCloseTo(800 / 1200)
    expect(transform.displayWidth).toBeCloseTo(CROP)
    expect(transform.displayHeight).toBeGreaterThan(CROP)
  })

  it('uses square crop dimensions on both axes', () => {
    const layout = getCropStageLayout({ stageWidth: 448, stageHeight: 360, cropSize: CROP })

    expect(layout.cropSize).toBe(CROP)
    expect(layout.cropLeft).toBeCloseTo((448 - CROP) / 2)
    expect(layout.cropTop).toBeCloseTo((360 - CROP) / 2)
  })

  it('scales small images up uniformly to avoid empty crop output', () => {
    const transform = computeInitialImageTransform({
      naturalW: 120,
      naturalH: 80,
      rotation: 0,
      cropSize: CROP,
    })

    expect(transform.scale).toBeCloseTo(CROP / 80)
    expect(transform.displayHeight).toBeCloseTo(CROP)
    expect(transform.displayWidth / transform.displayHeight).toBeCloseTo(120 / 80)
  })

  it('rotate left swaps cover behavior for a landscape image', () => {
    const unrotated = computeInitialImageTransform({
      naturalW: 1200,
      naturalH: 800,
      rotation: 0,
      cropSize: CROP,
    })
    const rotated = computeInitialImageTransform({
      naturalW: 1200,
      naturalH: 800,
      rotation: 270,
      cropSize: CROP,
    })

    expect(unrotated.rotatedWidth).toBeGreaterThan(CROP)
    expect(unrotated.rotatedHeight).toBeCloseTo(CROP)
    expect(rotated.rotatedWidth).toBeCloseTo(CROP)
    expect(rotated.rotatedHeight).toBeGreaterThan(CROP)
  })
})

describe('clampCropPosition', () => {
  it('passes an offset inside the available horizontal overflow unchanged', () => {
    const offset = clampCropPosition({ x: 40, y: 0 }, 468, CROP, CROP)

    expect(offset).toEqual({ x: 40, y: 0 })
  })

  it('limits horizontal overflow to the rotated image bounds', () => {
    const maxX = (468 - CROP) / 2
    const offset = clampCropPosition({ x: 999, y: 0 }, 468, CROP, CROP)

    expect(offset.x).toBe(maxX)
    expect(offset.y).toBe(0)
  })

  it('limits vertical overflow to the rotated image bounds', () => {
    const maxY = (520 - CROP) / 2
    const offset = clampCropPosition({ x: 0, y: -999 }, CROP, 520, CROP)

    expect(offset.x).toBe(0)
    expect(offset.y).toBe(-maxY)
  })

  it('clamps both axes to zero when the image exactly fills the square crop', () => {
    const offset = clampCropPosition({ x: 100, y: -100 }, CROP, CROP, CROP)

    expect(offset).toEqual({ x: 0, y: 0 })
  })
})

describe('computeCropExportTransform', () => {
  function exportTransform(params: {
    naturalW?: number
    naturalH?: number
    rotation?: RotationDegrees
    offset?: { x: number; y: number }
  } = {}) {
    const rotation = params.rotation ?? 0
    const preview = computeInitialImageTransform({
      naturalW: params.naturalW ?? 1200,
      naturalH: params.naturalH ?? 800,
      rotation,
      cropSize: CROP,
      offset: params.offset,
    })

    return computeCropExportTransform({
      naturalW: params.naturalW ?? 1200,
      naturalH: params.naturalH ?? 800,
      rotation,
      scale: preview.scale,
      offset: preview.offset,
      cropSize: CROP,
      outputSize: OUT,
    })
  }

  it('outputs a 512x512 export target', () => {
    expect(exportTransform().outputSize).toBe(OUT)
  })

  it('keeps draw dimensions proportional to the original image', () => {
    const transform = exportTransform()

    expect(transform.drawWidth / transform.drawHeight).toBeCloseTo(1200 / 800)
  })

  it('changes export translation when crop movement changes', () => {
    const centered = exportTransform({ offset: { x: 0, y: 0 } })
    const moved = exportTransform({ offset: { x: 40, y: 0 } })

    expect(moved.translateX).toBeGreaterThan(centered.translateX)
    expect(moved.translateY).toBe(centered.translateY)
  })

  it('changes export rotation when the preview rotates', () => {
    const centered = exportTransform({ rotation: 0 })
    const rotated = exportTransform({ rotation: 270 })

    expect(centered.rotationRadians).toBe(0)
    expect(rotated.rotationRadians).toBeCloseTo((270 * Math.PI) / 180)
    expect(rotated.rotationRadians).not.toBe(centered.rotationRadians)
  })
})
