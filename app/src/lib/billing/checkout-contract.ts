import { z } from "zod"

export const SUBSCRIPTION_PLAN_IDS = ["pro_creator", "pro_studio"] as const
export type SubscriptionPlanId = (typeof SUBSCRIPTION_PLAN_IDS)[number]

export const LICENSE_PRODUCT_IDS = ["organic_shorts", "paid_ads_shorts"] as const

export const checkoutSchema = z.discriminatedUnion("sessionType", [
  z.object({
    sessionType: z.literal("subscription"),
    targetId: z.enum(SUBSCRIPTION_PLAN_IDS),
    referralCode: z.string().trim().min(3).max(64).optional(),
  }),
  z.object({
    sessionType: z.literal("license"),
    targetId: z.enum(LICENSE_PRODUCT_IDS),
    referralCode: z.string().trim().min(3).max(64).optional(),
  }),
])

export type CheckoutRequest = z.infer<typeof checkoutSchema>

export const STRIPE_PRICE_VARIABLES = {
  pro_creator: "STRIPE_PRICE_ID_PRO_CREATOR",
  pro_studio: "STRIPE_PRICE_ID_PRO_STUDIO",
  organic_shorts: "STRIPE_PRICE_ID_LICENSE_ORGANIC_SHORTS",
  paid_ads_shorts: "STRIPE_PRICE_ID_LICENSE_PAID_ADS_SHORTS",
} as const

export function getCheckoutPriceId(
  sessionType: CheckoutRequest["sessionType"],
  targetId: string,
  environment: Record<string, string | undefined>,
): string | null {
  const result = checkoutSchema.safeParse({ sessionType, targetId })
  if (!result.success) return null
  return environment[STRIPE_PRICE_VARIABLES[result.data.targetId]]?.trim() || null
}
