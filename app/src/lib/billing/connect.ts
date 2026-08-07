import "server-only"

import { getStripe } from "@/lib/billing/stripe"

export async function createConnectOnboarding(input: { userId: string; email?: string | null; returnUrl: string; refreshUrl: string }) {
  const stripe = getStripe()
  const account = await stripe.accounts.create({ type: "express", email: input.email ?? undefined, metadata: { mashups_user_id: input.userId }, capabilities: { transfers: { requested: true } } })
  const link = await stripe.accountLinks.create({ account: account.id, type: "account_onboarding", return_url: input.returnUrl, refresh_url: input.refreshUrl })
  return { accountId: account.id, url: link.url }
}

export async function transferCreatorAward(input: { connectedAccountId: string; amountCents: number; currency?: string; idempotencyKey: string; escrowEntryId: string }) {
  if (input.amountCents <= 0) throw new Error("Transfer amount must be positive.")
  const transfer = await getStripe().transfers.create({ amount: input.amountCents, currency: input.currency ?? "usd", destination: input.connectedAccountId, metadata: { escrow_entry_id: input.escrowEntryId } }, { idempotencyKey: input.idempotencyKey })
  return { transferId: transfer.id }
}
