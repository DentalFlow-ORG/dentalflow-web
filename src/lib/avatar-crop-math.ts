// Pure math helpers for AvatarCropModal crop/zoom/export logic.
// Extracted so they can be unit-tested without a DOM, canvas, or React.

/**
 * Fit scale: the maximum scale that makes the whole image fit inside the crop
 * square on both axes without overflow (CSS object-fit:contain behaviour).
 * At zoom=1 the full image is visible with its natural aspect ratio; the user
 * zooms in to fill the crop circle.
 */
export function computeBaseScale(
  naturalW: number,
  naturalH: number,
  cropSize: number,
): number {
  return Math.min(
    cropSize / Math.max(naturalW, 1),
    cropSize / Math.max(naturalH, 1),
  )
}

/**
 * Generous drag clamp: keeps at least cropSize/4 pixels of the image
 * overlapping the crop viewport so the image never fully disappears, but
 * does NOT force the image to cover the crop area — empty space is allowed.
 */
export function clampCropOffset(
  ox: number,
  oy: number,
  displayW: number,
  displayH: number,
  cropSize: number,
): { clampedOx: number; clampedOy: number } {
  const minOverlap = cropSize / 4
  const maxOx = (cropSize + displayW) / 2 - minOverlap
  const maxOy = (cropSize + displayH) / 2 - minOverlap
  return {
    clampedOx: Math.max(-maxOx, Math.min(maxOx, ox)),
    clampedOy: Math.max(-maxOy, Math.min(maxOy, oy)),
  }
}

export interface ExportDestination {
  /** Destination x on the output canvas in px. */
  dx: number
  /** Destination y on the output canvas in px. */
  dy: number
  /** Destination width on the output canvas in px. */
  dw: number
  /** Destination height on the output canvas in px. */
  dh: number
}

/**
 * Compute the drawImage destination rectangle so the exported canvas exactly
 * mirrors the preview transform.
 *
 * Strategy: scale the preview viewport coordinates by (outputSize / cropSize).
 * The caller should ctx.fillRect with a neutral background before drawing to
 * handle any empty space introduced by the fit-scale initial positioning.
 */
export function computeExportDestination(params: {
  naturalW: number
  naturalH: number
  cropSize: number
  effectiveScale: number
  clampedOx: number
  clampedOy: number
  outputSize: number
}): ExportDestination {
  const { naturalW, naturalH, cropSize, effectiveScale, clampedOx, clampedOy, outputSize } = params

  const displayW = naturalW * effectiveScale
  const displayH = naturalH * effectiveScale

  // CSS left/top of the image element inside the preview viewport
  const imageLeft = (cropSize - displayW) / 2 + clampedOx
  const imageTop  = (cropSize - displayH) / 2 + clampedOy

  // Scale up to output canvas coordinates — same transform, larger canvas
  const canvasScale = outputSize / cropSize

  return {
    dx: imageLeft * canvasScale,
    dy: imageTop  * canvasScale,
    dw: displayW  * canvasScale,
    dh: displayH  * canvasScale,
  }
}
