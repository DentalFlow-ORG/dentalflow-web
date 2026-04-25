export const env = {
  apiUrl: import.meta.env.VITE_API_URL as string | undefined,
  backendLocalPath: import.meta.env.VITE_BACKEND_LOCAL_PATH as string | undefined,
} as const
