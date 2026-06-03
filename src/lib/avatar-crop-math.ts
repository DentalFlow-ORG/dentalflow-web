// Pure math helpers for AvatarCropModal crop/zoom/export logic.
// Extracted so they can be unit-tested without a DOM, canvas, or React.

/**
 * Cover scale: the minimum scale that makes the image fill the crop viewport
 * on both axes (larger natural dimension wins, matching CSS object-fit:cover).
 * At zoom=1 the image exactly covers the square with no empty gaps.
 * Aspect ratio is preserved — the shorter axis fills exactly, the longer overflows.
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
 * Cover-model clamp: the image is always at least as large as the viewport on
 * each axis (guaranteed by cover scale), so the maximum drag distance equals
 * half the overflow on that axis. This prevents any empty gap from appearing
 * inside the crop area regardless of drag direction.
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
 * With cover scale the image always fills the viewport, so the safety fillRect
 * background will not be visible — but it is still written before drawImage.
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
