// Pure math helpers for AvatarCropModal crop/zoom/export logic.
// Extracted so they can be unit-tested without a DOM, canvas, or React.

/**
 * Cover-fit scale: the minimum scale that makes the image fill the crop square
 * on both axes (larger natural dimension wins, matching CSS object-fit:cover).
 */
export function computeBaseScale(
  naturalW: number,
  naturalH: number,
  cropSize: number,
): number {
  return Math.max(
    cropSize / Math.max(naturalW, 1),
    cropSize / Math.max(naturalH, 1),
  )
}

/**
 * Clamp the drag offset so the image always covers the full crop area —
 * no empty space can appear inside the crop circle regardless of user drag.
 */
export function clampCropOffset(
  ox: number,
  oy: number,
  displayW: number,
  displayH: number,
  cropSize: number,
): { clampedOx: number; clampedOy: number } {
  const maxOx = Math.max(0, (displayW - cropSize) / 2)
  const maxOy = Math.max(0, (displayH - cropSize) / 2)
  return {
    clampedOx: Math.max(-maxOx, Math.min(maxOx, ox)),
    clampedOy: Math.max(-maxOy, Math.min(maxOy, oy)),
  }
}

export interface CropExportRect {
  /** Left edge of source crop in natural image pixels. */
  srcX: number
  /** Top edge of source crop in natural image pixels. */
  srcY: number
  /** Side length of the square crop in natural image pixels. */
  srcSize: number
}

/**
 * Convert the current render state (zoom, offset, crop size) back to the
 * source rectangle that must be passed to ctx.drawImage() so the exported
 * canvas exactly matches the circular crop preview.
 *
 * All returned values are in natural (intrinsic) image pixel coordinates.
 * srcX/srcY are clamped to [0, natural − srcSize] to prevent black edges
 * from floating-point drift at boundary zoom/offset combinations.
 */
export function computeCropExportRect(params: {
  naturalW: number
  naturalH: number
  cropSize: number
  effectiveScale: number
  clampedOx: number
  clampedOy: number
}): CropExportRect {
  const { naturalW, naturalH, cropSize, effectiveScale, clampedOx, clampedOy } = params

  const displayW = naturalW * effectiveScale
  const displayH = naturalH * effectiveScale

  // CSS left/top of the image element relative to the crop container
  const imageLeft = (cropSize - displayW) / 2 + clampedOx
  const imageTop  = (cropSize - displayH) / 2 + clampedOy

  // Map crop container origin → natural image coordinates
  const srcSize = cropSize / effectiveScale
  const rawSrcX = -imageLeft / effectiveScale
  const rawSrcY = -imageTop  / effectiveScale

  // Clamp to image bounds (guards against sub-pixel floating-point drift)
  const srcX = Math.max(0, Math.min(naturalW - srcSize, rawSrcX))
  const srcY = Math.max(0, Math.min(naturalH - srcSize, rawSrcY))

  return { srcX, srcY, srcSize }
}
