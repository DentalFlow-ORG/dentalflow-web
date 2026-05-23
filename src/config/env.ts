export const env = {
  apiUrl: import.meta.env.VITE_API_URL as string | undefined,
  billingPromotionEndsAt: import.meta.env.VITE_BILLING_PROMOTION_ENDS_AT as string | undefined,
} as const
