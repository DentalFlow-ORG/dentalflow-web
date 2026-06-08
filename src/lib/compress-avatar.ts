// Shared avatar compression utility.
// Used by PatientAvatarWidget (edit-in-place) and CreateAppointmentModal
// (pending upload after appointment creation). Kept here so neither
// component duplicates the canvas logic.

export const MAX_AVATAR_DIMENSION = 512
export const JPEG_QUALITY = 0.82
export const MAX_AVATAR_INPUT_BYTES = 5 * 1024 * 1024
export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Center-crops to the smaller dimension then downscales to MAX_AVATAR_DIMENSION.
// Resolves with a raw base64 JPEG string (no data-URL prefix).
export function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const dim = Math.min(MAX_AVATAR_DIMENSION, img.width, img.height)
      const sx = (img.width - dim) / 2
      const sy = (img.height - dim) / 2
      const canvas = document.createElement('canvas')
      canvas.width = dim
      canvas.height = dim
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas unavailable')); return }
      ctx.drawImage(img, sx, sy, dim, dim, 0, 0, dim, dim)
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1])
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')) }
    img.src = url
  })
}
