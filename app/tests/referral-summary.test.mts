import assert from "node:assert/strict"
import test from "node:test"

import { summarizeReferralRevenueRows } from "../src/lib/growth/referral-summary.ts"

test("summarizeReferralRevenueRows calculates active, revenue, and conversion", () => {
  const summary = summarizeReferralRevenueRows(
    [{ code: "abc" }, { code: "xyz" }, { code: "abc" }],
    [
      { referralCode: "abc", revenueShareCents: 1200, status: "recorded" },
      { referralCode: "abc", revenueShareCents: 800, status: "paid" },
      { referralCode: "xyz", revenueShareCents: 200, status: "pending" },
      { referralCode: "outside", revenueShareCents: 999, status: "recorded" },
    ],
  )

  assert.equal(summary.invitedCreators, 2)
  assert.equal(summary.activeInvitedCreators, 2)
  assert.equal(summary.recurringRevenueCents, 2999)
  assert.equal(summary.monthlyProjectedCents, 4139)
  assert.equal(summary.inviteConversionRate, 1)
})

test("summarizeReferralRevenueRows returns zeroed conversion when no invites", () => {
  const summary = summarizeReferralRevenueRows([], [
    { referralCode: "abc", revenueShareCents: 100, status: "recorded" },
  ])

  assert.equal(summary.invitedCreators, 0)
  assert.equal(summary.activeInvitedCreators, 0)
  assert.equal(summary.inviteConversionRate, 0)
})
