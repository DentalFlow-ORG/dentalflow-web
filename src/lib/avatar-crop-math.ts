// Pure math helpers for the Google-like avatar cropper.
// The model is intentionally center-based: preview and canvas export share the
// same image center, rotation, uniform scale, and square crop size.

export type RotationDegrees = 0 | 90 | 180 | 270

export interface Size {
  width: number
  height: number
}

export interface Point {
  x: number
  y: number
}

export interface CropStageLayout {
  stageWidth: number
  stageHeight: number
  cropSize: number
  cropLeft: number
  cropTop: number
}

export interface ImageTransform {
  scale: number
  displayWidth: number
  displayHeight: number
  rotatedWidth: number
  rotatedHeight: number
  offset: Point
}

export interface CropExportTransform {
  outputSize: number
  translateX: number
  translateY: number
  rotationRadians: number
  drawWidth: number
  drawHeight: number
}

function safeDimension(value: number): number {
  return Math.max(1, value)
}

export function rotateLeft(rotation: RotationDegrees): RotationDegrees {
  if (rotation === 0) return 270
  if (rotation === 270) return 180
  if (rotation === 180) return 90
  return 0
}

export function computeRotatedDimensions(
  naturalW: number,
  naturalH: number,
  rotation: RotationDegrees,
): Size {
  const width = safeDimension(naturalW)
  const height = safeDimension(naturalH)

  if (rotation === 90 || rotation === 270) {
    return { width: height, height: width }
  }

  return { width, height }
}

/**
 * Cover scale for a square crop. It uses a single uniform scale, based on the
 * rotated bounds, so the image can never be stretched independently on X/Y.
 */
export function computeInitialImageTransform(params: {
  naturalW: number
  naturalH: number
  rotation: RotationDegrees
  cropSize: number
  offset?: Point
}): ImageTransform {
  const { naturalW, naturalH, rotation, cropSize, offset = { x: 0, y: 0 } } = params
  const naturalWidth = safeDimension(naturalW)
  const naturalHeight = safeDimension(naturalH)
  const rotated = computeRotatedDimensions(naturalWidth, naturalHeight, rotation)
  const scale = Math.max(cropSize / rotated.width, cropSize / rotated.height)
  const displayWidth = naturalWidth * scale
  const displayHeight = naturalHeight * scale
  const rotatedWidth = rotated.width * scale
  const rotatedHeight = rotated.height * scale
  const clamped = clampCropPosition(offset, rotatedWidth, rotatedHeight, cropSize)

  return {
    scale,
    displayWidth,
    displayHeight,
    rotatedWidth,
    rotatedHeight,
    offset: clamped,
  }
}

/**
 * Clamp the image center relative to the crop center. At every allowed offset,
 * the rotated image bounds fully cover the square crop viewport.
 */
export function clampCropPosition(
  offset: Point,
  rotatedDisplayW: number,
  rotatedDisplayH: number,
  cropSize: number,
): Point {
  const maxX = Math.max(0, (rotatedDisplayW - cropSize) / 2)
  const maxY = Math.max(0, (rotatedDisplayH - cropSize) / 2)

  return {
    x: maxX === 0 ? 0 : Math.max(-maxX, Math.min(maxX, offset.x)),
    y: maxY === 0 ? 0 : Math.max(-maxY, Math.min(maxY, offset.y)),
  }
}

export function getCropStageLayout(params: {
  stageWidth: number
  stageHeight: number
  cropSize: number
}): CropStageLayout {
  const stageWidth = safeDimension(params.stageWidth)
  const stageHeight = safeDimension(params.stageHeight)
  const cropSize = Math.min(params.cropSize, stageWidth, stageHeight)

  return {
    stageWidth,
    stageHeight,
    cropSize,
    cropLeft: (stageWidth - cropSize) / 2,
    cropTop: (stageHeight - cropSize) / 2,
  }
}

/**
 * Canvas transform that mirrors the centered preview crop exactly.
 */
export function computeCropExportTransform(params: {
  naturalW: number
  naturalH: number
  rotation: RotationDegrees
  scale: number
  offset: Point
  cropSize: number
  outputSize: number
}): CropExportTransform {
  const {
    naturalW,
    naturalH,
    rotation,
    scale,
    offset,
    cropSize,
    outputSize,
  } = params
  const canvasScale = outputSize / cropSize

  return {
    outputSize,
    translateX: outputSize / 2 + offset.x * canvasScale,
    translateY: outputSize / 2 + offset.y * canvasScale,
    rotationRadians: (rotation * Math.PI) / 180,
    drawWidth: safeDimension(naturalW) * scale * canvasScale,
    drawHeight: safeDimension(naturalH) * scale * canvasScale,
  }
}
