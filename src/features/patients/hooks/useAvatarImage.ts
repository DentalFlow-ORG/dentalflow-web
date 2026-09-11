import { useState } from 'react'

/** Keep initials visible after decoding fails; a replacement image can load normally. */
export function useAvatarImage(avatarUrl: string | null | undefined) {
  const [failedUrl, setFailedUrl] = useState<string | null | undefined>(null)
  return {
    imageSrc: avatarUrl && avatarUrl !== failedUrl ? `data:image/jpeg;base64,${avatarUrl}` : null,
    onImageError: () => setFailedUrl(avatarUrl),
  }
}
