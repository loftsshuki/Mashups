import assert from "node:assert/strict"
import test from "node:test"

import {
  clampReferralRevShareBps,
  computeReferralRevenueShareCents,
  DEFAULT_REFERRAL_REV_SHARE_BPS,
  shouldCountReferralConversion,
} from "../src/lib/growth/referral-accounting.ts"

test("clampReferralRevShareBps keeps values inside supported range", () => {
  assert.equal(clampReferralRevShareBps(undefined), DEFAULT_REFERRAL_REV_SHARE_BPS)
  assert.equal(clampReferralRevShareBps(100), 300)
  assert.equal(clampReferralRevShareBps(1200), 1200)
  assert.equal(clampReferralRevShareBps(3900), 3000)
})

test("computeReferralRevenueShareCents applies basis points math", () => {
  assert.equal(computeReferralRevenueShareCents(10_000, 1200), 1200)
  assert.equal(computeReferralRevenueShareCents(1_999, 1200), 240)
  assert.equal(computeReferralRevenueShareCents(-100, 1200), 0)
})

test("shouldCountReferralConversion only marks conversion settlement events", () => {
  assert.equal(shouldCountReferralConversion("checkout.session.completed"), true)
  assert.equal(shouldCountReferralConversion("invoice.paid"), true)
  assert.equal(shouldCountReferralConversion("payment_intent.succeeded"), true)
  assert.equal(shouldCountReferralConversion("customer.created"), false)
  assert.equal(shouldCountReferralConversion(undefined), false)
})
